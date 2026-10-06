'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
const surface=process.argv[4]||'soft';assert.ok(['soft'].includes(surface));
function probe(){
  const raf=requestAnimationFrame;window.__clock=0;
  window.requestAnimationFrame=fn=>raf(t=>{window.__clock=window.__held??t;fn(window.__clock);});
  new MutationObserver(()=>{const s=document.querySelector('.space-scene');if(window.__pause&&Number(s?.dataset.progress)>=window.__pause&&Number(s?.dataset.progress)<1)window.__held=window.__clock;}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-progress']});
}
async function ready(page,route){await page.waitForFunction(r=>document.body.dataset.page===r&&!document.getElementById('site-content').hasAttribute('aria-busy'),route);}
async function pause(page,route,at){await page.evaluate(at=>{window.__pause=at;window.__held=undefined;},at);await page.locator('a[href="?view='+route+'"]').first().evaluate(el=>el.click());await page.waitForFunction(()=>window.__held!==undefined);}
async function state(page){return page.evaluate(()=>{const s=document.querySelector('.space-scene'),p=document.getElementById('site-content');return {camera:s.dataset.camera,phase:s.dataset.phase,bitmap:document.querySelector('canvas').toDataURL(),z:p.dataset.flightDepth,opacity:p.style.opacity,transform:p.style.transform,inert:p.inert,style:p.style.cssText,rooms:Number(s.dataset.rooms),models:Number(s.dataset.roomModels)};});}
function freeze(a,b){for(const k of ['camera','phase','bitmap'])assert.equal(b[k],a[k],'exact freeze: '+k);}
(async()=>{const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
try{
  const context=await browser.newContext({viewport:{width:390,height:844},offline:true});await context.addInitScript(probe);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(file).href);await ready(page,'index');
  for(const at of [.22,.7]){
    await pause(page,'research',at);const before=await state(page);await page.locator('#space-motion').evaluate(el=>el.click());await ready(page,'research');await page.waitForTimeout(180);const after=await state(page);freeze(before,after);assert.equal(after.inert,false);assert.equal(after.style,'');
    rows.push({kind:'motion-off-midflight',at,camera:after.camera,phase:after.phase});await page.evaluate(()=>{window.__pause=null;window.__held=undefined;});await page.locator('#space-motion').evaluate(el=>el.click());await page.locator('a[href="?view=index"]').first().evaluate(el=>el.click());await ready(page,'index');
  }
  await pause(page,'research',.22);const depart=await state(page);await page.locator('a[href="?view=writing"]').first().evaluate(el=>el.click());const retarget=await state(page);assert.equal(retarget.z,depart.z);assert.equal(retarget.opacity,depart.opacity);rows.push({kind:'retarget',z:retarget.z,opacity:retarget.opacity});await page.evaluate(()=>{window.__pause=null;window.__held=undefined;});await ready(page,'writing');
  for(const kind of ['print','controlled-hidden']){
    await pause(page,'research',.68);const before=await state(page);
    if(kind==='print'){await page.emulateMedia({media:'print'});await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));}
    else await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    await ready(page,'research');await page.waitForTimeout(160);const after=await state(page);freeze(before,after);assert.equal(after.inert,false);assert.equal(after.style,'');rows.push({kind,camera:after.camera,phase:after.phase});
    if(kind==='print'){assert.equal(await page.locator('#site-content-frame').evaluate(el=>getComputedStyle(el).overflow),'visible');await page.emulateMedia({media:'screen'});await page.evaluate(()=>dispatchEvent(new Event('afterprint')));}
    else await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await page.evaluate(()=>{window.__pause=null;window.__held=undefined;});await page.locator('a[href="?view=index"]').first().evaluate(el=>el.click());await ready(page,'index');
  }
  await page.locator('#content-flight').evaluate(el=>el.click());assert.equal(await page.locator('#content-flight').isChecked(),false);
  await pause(page,'research',.25);const off=await state(page);assert.equal(off.transform,'');assert.ok(Number(off.opacity)<1);assert.ok(off.inert);await page.evaluate(()=>{window.__pause=null;window.__held=undefined;});await ready(page,'research');await page.reload();await ready(page,'research');assert.equal(await page.locator('#content-flight').isChecked(),false);rows.push({kind:'content-flight-off-persists',nativeFade:true});
  await page.locator('#space-motion').evaluate(el=>el.click());
  // Warm the router's finite five-document cache before checking growth.
  for(const to of ['index','research','writing','talks','credits','research']){await page.locator('a[href="?view='+to+'"]').first().evaluate(el=>el.click());await ready(page,to);}
  const cdp=await context.newCDPSession(page);await cdp.send('HeapProfiler.collectGarbage');const before=await cdp.send('Memory.getDOMCounters');
  for(let i=0;i<40;i++){const to=['index','research','writing','talks','credits'][i%5];await page.locator('a[href="?view='+to+'"]').first().evaluate(el=>el.click());await ready(page,to);const s=await state(page);assert.ok(s.rooms<=3&&s.models<=6);assert.equal(await page.locator('main').count(),1);assert.equal(await page.locator('#content-flight').count(),1);assert.equal(await page.locator('#surface-mode').count(),0);}
  await page.locator('a[href="?view=research"]').first().evaluate(el=>el.click());await ready(page,'research');await page.waitForTimeout(100);
  await cdp.send('HeapProfiler.collectGarbage');const after=await cdp.send('Memory.getDOMCounters');assert.ok(after.jsEventListeners<=before.jsEventListeners+10,JSON.stringify({before,after}));assert.ok(after.nodes<=before.nodes+250,JSON.stringify({before,after}));rows.push({kind:'40-route-cycles',before,after});assert.deepEqual(errors,[]);await context.close();fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'lifecycle.json'),JSON.stringify({source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),browser:browser.version(),surface,rows,errors,note:'Hidden is a controlled document.hidden fixture, not native OS visibility acceptance.'},null,2));console.log(JSON.stringify({cases:rows.length,surface,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
