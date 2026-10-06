'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs'),{installProbe,summarize}=require('../../tools/quality/motion.cjs'),{motion:budget}=require('../../tools/quality/budgets.json');
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
const mode=process.argv[4]||'full',soakOnly=mode==='soak';
const surface=process.argv[5]||'soft';assert.ok(['soft'].includes(surface));
assert.ok(['full','soak','matrix','weak-matrix'].includes(mode),'full, soak, matrix or weak-matrix mode');
async function collect(page,kind,duration){
  await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];window.__qualityStart=performance.now();});
  if(kind==='scroll')await page.evaluate(()=>{const start=performance.now();window.__sustainScroll=setInterval(()=>{const p=((performance.now()-start)%2400)/1200;scrollTo({top:(p<1?p:2-p)*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});},80);});
  await page.waitForTimeout(duration);if(kind==='scroll')await page.evaluate(()=>clearInterval(window.__sustainScroll));
  const data=await page.evaluate(()=>{const end=performance.now(),start=window.__qualityStart,s=document.querySelector('.space-scene');return {...window.__qualityMotion,start,end,elapsed:end-start,quality:s.dataset.quality,cadence:s.dataset.cadence,state:s.dataset.state};});
  return summarize(data,kind);
}
async function open(browser,profile,route){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.width===390?844:900},deviceScaleFactor:profile.width===390?3:1,offline:true});await context.addInitScript(installProbe);await context.addInitScript(surface=>{localStorage.setItem('vo.theme','light');},surface);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});await page.goto(pathToFileURL(file).href+'?view='+route);await page.waitForFunction(r=>document.body.dataset.page===r&&document.querySelector('.space-scene').dataset.ready==='true',route);await page.waitForTimeout(1200);return {context,page,cdp,errors};
}
(async()=>{
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),record={source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),browser:browser.version(),surface,samples:[],note:'Sequential standalone Chromium lab. CPU x4 is synthetic; all budgets are unchanged. Physical devices, other browser engines and hosting remain separate.'};fs.mkdirSync(out,{recursive:true});
  const save=()=>fs.writeFileSync(path.join(out,'sustain.json'),JSON.stringify(record,null,2));
  try{
    for(const profile of soakOnly?[]:mode==='weak-matrix'?[{width:390,rate:4}]:[{width:1440,rate:1},{width:390,rate:1},{width:390,rate:4}])for(const route of ['index','research','writing','talks','credits']){
      const {context,page,errors}=await open(browser,profile,route);const measurements=[];
      try{
        for(const kind of ['idle','scroll']){const row=await collect(page,kind,4000);assert.ok(row.paints>=budget.minimumPaints);assert.equal(row.state,'active');if(profile.width===390&&profile.rate===4){if(row.paintCallbackMs.p95>budget.paintCallbackP95Ms||(kind==='idle'&&row.callbackBusyPercent>budget.idleCallbackBusyPercent)){record.failed={profile,surface,route,measurement:row};save();}assert.ok(row.paintCallbackMs.p95<=budget.paintCallbackP95Ms,JSON.stringify({route,kind,p95:row.paintCallbackMs.p95}));if(kind==='idle')assert.ok(row.callbackBusyPercent<=budget.idleCallbackBusyPercent);}measurements.push(row);}
        for(const kind of ['off','reduced']){
          if(kind==='off')await page.locator('#space-motion').evaluate(el=>el.click());else{await page.locator('#space-motion').evaluate(el=>el.click());await page.emulateMedia({reducedMotion:'reduce'});}
          await page.waitForTimeout(180);const before=await page.locator('canvas').evaluate(el=>el.toDataURL()),row=await collect(page,kind,1000);assert.equal(row.paints,0);assert.equal(await page.locator('canvas').evaluate(el=>el.toDataURL()),before);measurements.push(row);
        }
        assert.deepEqual(errors,[]);record.samples.push({profile,route,measurements,errors});save();console.log(JSON.stringify({profile,route,p95:measurements.slice(0,2).map(r=>r.paintCallbackMs.p95),idleBusy:measurements[0].callbackBusyPercent}));
      }finally{await context.close();}
    }
    if(mode==='matrix'||mode==='weak-matrix')return;
    const heavy=record.samples.filter(r=>r.profile.rate===4).toSorted((a,b)=>b.measurements[0].paintCallbackMs.p95-a.measurements[0].paintCallbackMs.p95)[0]?.route||'research';
    const {context,page,cdp,errors}=await open(browser,{width:390,rate:4},heavy);
    try{
      // Initialize Playwright's isolated utility world before comparing listeners.
      // Its first locator action otherwise adds harness listeners after the soak.
      await page.locator('#space-motion').evaluate(el=>el.id);
      await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];});
      await cdp.send('HeapProfiler.collectGarbage');const beforeHeap=await cdp.send('Runtime.getHeapUsage'),beforeDOM=await cdp.send('Memory.getDOMCounters'),chunks=[];
      for(let i=0;i<budget.soakSeconds/30;i++){const row=await collect(page,'idle',30000);assert.ok(row.paints>0);assert.equal(row.state,'active');assert.ok(row.paintCallbackMs.p95<=budget.paintCallbackP95Ms);assert.ok(row.callbackBusyPercent<=budget.idleCallbackBusyPercent);chunks.push(row);console.log('Weak-profile soak '+(i+1)*30+'s / '+budget.soakSeconds+'s');}
      await page.locator('#space-motion').evaluate(el=>el.click());await page.waitForTimeout(180);const off=await collect(page,'off',1000);assert.equal(off.paints,0);await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];});await cdp.send('HeapProfiler.collectGarbage');
      const afterHeap=await cdp.send('Runtime.getHeapUsage'),afterDOM=await cdp.send('Memory.getDOMCounters');
      record.soak={route:heavy,seconds:budget.soakSeconds,rate:4,beforeHeap,afterHeap,deltaBytes:afterHeap.usedSize-beforeHeap.usedSize,beforeDOM,afterDOM,chunks,off,errors};save();
      assert.ok(afterDOM.nodes<=beforeDOM.nodes+250,JSON.stringify({beforeDOM,afterDOM}));assert.ok(afterDOM.jsEventListeners<=beforeDOM.jsEventListeners+10,JSON.stringify({beforeDOM,afterDOM}));assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
