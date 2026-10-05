'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs'),api=require('../../docs/space.js');
const beforeFile=path.resolve(process.argv[2]),afterFile=path.resolve(process.argv[3]),output=path.resolve(process.argv[4]);
async function ready(page,route){await page.waitForFunction(route=>document.body.dataset.page===route&&!document.getElementById('site-content').hasAttribute('aria-busy')&&document.querySelector('.space-scene').dataset.travel==='settled',route);}
async function run(browser,file,selected){
  const context=await browser.newContext({viewport:{width:390,height:844},offline:true}),errors=[],rows=[];
  await context.addInitScript(()=>{localStorage.setItem('vo.theme','dark');window.__cacheEvents=[];window.SiteEngineProbe=event=>window.__cacheEvents.push(event);});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(pathToFileURL(file).href);await ready(page,'index');
    for(const to of ['research','writing','research','index','research']){
      await page.evaluate(to=>{window.__cacheEvents=[];document.querySelector('a[href="?view='+to+'"]').click();},to);await ready(page,to);
      const row=await page.evaluate(()=>({to:document.body.dataset.page,events:window.__cacheEvents,rooms:Number(document.querySelector('.space-scene').dataset.rooms),models:Number(document.querySelector('.space-scene').dataset.roomModels)}));
      assert.ok(row.rooms<=3&&row.models<=6,'bounded working set');rows.push(row);
      if(selected){const builds=row.events.filter(e=>e.kind==='model'),keys=builds.map(e=>e.route+'/'+e.compact);assert.equal(new Set(keys).size,keys.length,'no duplicate route/detail construction');}
    }
    if(selected)assert.ok(rows.slice(2).every(row=>!row.events.some(e=>e.kind==='model')),'warmed A→B→A stays in the working set');
    await page.locator('#space-motion').evaluate(el=>el.click());
    // Warm the finite document cache; stop motion makes the DOM/heap comparison reproducible.
    for(const to of ['index','research','writing','talks','credits','research']){await page.locator('a[href="?view='+to+'"]').first().evaluate(el=>el.click());await ready(page,to);}
    const cdp=await context.newCDPSession(page);
    async function memory(){await page.evaluate(()=>{window.__cacheEvents=[];});await cdp.send('HeapProfiler.collectGarbage');return {heap:await cdp.send('Runtime.getHeapUsage'),dom:await cdp.send('Memory.getDOMCounters')};}
    const start=await memory();
    for(let i=0;i<40;i++){const to=['index','research','writing','talks','credits'][i%5];await page.locator('a[href="?view='+to+'"]').first().evaluate(el=>el.click());await ready(page,to);}
    await page.locator('a[href="?view=research"]').first().evaluate(el=>el.click());await ready(page,'research');
    const end=await memory(),retained=await page.evaluate(()=>window.SiteScene.diagnostics?.()||null);
    assert.ok(end.heap.usedSize<=start.heap.usedSize+2000000,'bounded forced-GC heap growth');
    assert.ok(end.dom.nodes<=start.dom.nodes+250&&end.dom.jsEventListeners<=start.dom.jsEventListeners+10,'bounded DOM/listeners');assert.deepEqual(errors,[]);
    let serializedModelsBytes=null;
    if(retained)serializedModelsBytes=retained.rooms.reduce((n,room)=>n+room.models.reduce((sum,model)=>sum+Buffer.byteLength(JSON.stringify(api.worldFor(room.route,model.compact))),0),0);
    return {source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),rows,start,end,heapDeltaBytes:end.heap.usedSize-start.heap.usedSize,retained,serializedModelsBytes,errors};
  }finally{await context.close();}
}
(async()=>{
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
  try{
    const before=await run(browser,beforeFile,false),after=await run(browser,afterFile,true);
    const result={schema:1,browser:browser.version(),before,after,note:'One paired forced-GC lab sample, no universal leak claim. Five animated transitions and 40 stopped route cycles. Serialized models use the exact current finite model factory and are a retention proxy; heap includes model/color/effect/DOM caches. The historical file has no model-cost probe, so its empty event list is unobserved, not zero construction.'};
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({beforeHeapBytes:before.end.heap.usedSize,afterHeapBytes:after.end.heap.usedSize,afterGrowthBytes:after.heapDeltaBytes,serializedModelsBytes:after.serializedModelsBytes}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
