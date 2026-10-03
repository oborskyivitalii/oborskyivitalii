'use strict';
const assert=require('node:assert/strict');
const {toolRequire,report,launchOptions}=require('./common.cjs');
const {routes,motion:budgets}=require('./budgets.json'),{start}=require('./serve.cjs');
function installProbe(){
  const native=window.requestAnimationFrame.bind(window),clear=CanvasRenderingContext2D.prototype.clearRect;
  const probe={frames:[],longTasks:[],paints:0};window.__qualityMotion=probe;
  CanvasRenderingContext2D.prototype.clearRect=function(...args){probe.paints++;return clear.apply(this,args);};
  window.requestAnimationFrame=callback=>native(time=>{
    const start=performance.now(),before=probe.paints;callback(time);
    probe.frames.push({time,started:start,duration:performance.now()-start,painted:probe.paints>before});
  });
  try{new PerformanceObserver(list=>{for(const x of list.getEntries())probe.longTasks.push({start:x.startTime,duration:x.duration});}).observe({type:'longtask',buffered:true});}
  catch{/* Long-task observation is optional; RAF and Canvas probes are mandatory. */}
}
function summarize(data,kind){
  const painted=data.frames.filter(x=>x.painted),values=painted.map(x=>x.duration).sort((a,b)=>a-b);
  const percentile=p=>values.length?values[Math.min(values.length-1,Math.floor(values.length*p))]:null;
  return {kind,elapsedMs:data.elapsed,window:{startMs:data.start,endMs:data.end},quality:data.quality,state:data.state,motion:data.motion,callbacks:data.frames.length,paints:painted.length,paintCallbackMs:{p50:percentile(.5),p95:percentile(.95),max:values.at(-1)??null},callbackBusyPercent:data.frames.reduce((a,x)=>a+x.duration,0)/data.elapsed*100,rawFrames:data.frames,rawLongTasks:data.longTasks,errors:data.errors||[]};
}
async function collect(page,kind,duration){
  await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];window.__qualityStart=performance.now();});
  if(kind==='scroll')await page.evaluate(()=>{const start=performance.now();window.__qualityScroll=setInterval(()=>{const p=((performance.now()-start)%2000)/1000;scrollTo({top:(p<1?p:2-p)*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});},60);});
  await page.waitForTimeout(duration);
  if(kind==='scroll')await page.evaluate(()=>clearInterval(window.__qualityScroll));
  const data=await page.evaluate(()=>{const end=performance.now(),start=window.__qualityStart;return {...window.__qualityMotion,start,end,elapsed:end-start,quality:document.querySelector('.space-scene').dataset.quality,state:document.querySelector('.space-scene').dataset.state,motion:document.querySelector('#space-motion').textContent};});
  return summarize(data,kind);
}
async function sample(browser,url,route,profile){
  const ctx=await browser.newContext({viewport:{width:profile.width,height:profile.width===390?844:900},deviceScaleFactor:profile.width===390?3:1});
  await ctx.addInitScript(installProbe);const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});
  try{
    await page.goto(`${url}/${route}.html`);await page.waitForTimeout(800);
    const measurements=[];for(const kind of ['idle','scroll'])measurements.push(await collect(page,kind,4000));
    const positiveProbe=measurements.some(x=>x.paints>=budgets.minimumPaints);
    await page.locator('.appearance summary').click();await page.locator('#space-motion').click();await page.waitForTimeout(200);
    measurements.push(await collect(page,'off',1000));
    await page.locator('#space-motion').click();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
    measurements.push(await collect(page,'reduced',1000));
    return {route,...profile,positiveProbe,measurements,errors};
  }finally{await ctx.close();}
}
async function soak(browser,url,route){
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3});await ctx.addInitScript(installProbe);
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(`${url}/${route}.html`);await page.waitForTimeout(800);const cdp=await ctx.newCDPSession(page);
    await cdp.send('HeapProfiler.collectGarbage');const startHeapBytes=(await cdp.send('Runtime.getHeapUsage')).usedSize;
    const chunks=[];for(let i=0;i<budgets.soakSeconds/30;i++){chunks.push(await collect(page,'idle',30000));process.stdout.write(`Soak ${route}: ${(i+1)*30}s\n`);}
    await page.locator('.appearance summary').click();await page.locator('#space-motion').click();await page.waitForTimeout(200);
    const off=await collect(page,'off',1000);
    await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];});
    await cdp.send('HeapProfiler.collectGarbage');const endHeapBytes=(await cdp.send('Runtime.getHeapUsage')).usedSize;
    return {route,width:390,rate:1,durationSeconds:budgets.soakSeconds,startHeapBytes,endHeapBytes,deltaBytes:endHeapBytes-startHeapBytes,chunks,off,errors,limit:'Synthetic lab soak and forced-GC heap samples detect obvious growth; no universal leak or physical-device claim.'};
  }finally{await ctx.close();}
}
async function main(){
  const {server,url}=await start(),samples=[];let browser;
  const details={note:'Sequential lab measurements. CPU x4 is synthetic. Callback timing includes JS/Canvas commands, not display FPS or battery usage.',samples};
  try{
    browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));details.browser=browser.version();
    for(const profile of [{width:1440,rate:1},{width:390,rate:1},{width:390,rate:4}])for(const route of routes){
      samples.push(await sample(browser,url,route,profile));report('motion',details);
      process.stdout.write(JSON.stringify({...profile,route,measurements:samples.at(-1).measurements.map(({kind,paints,paintCallbackMs,callbackBusyPercent,quality})=>({kind,paints,paintCallbackMs,callbackBusyPercent,quality}))})+'\n');
    }
    const heaviest=[...samples.filter(x=>x.width===390&&x.rate===4)].sort((a,b)=>b.measurements[0].paintCallbackMs.p95-a.measurements[0].paintCallbackMs.p95)[0].route;
    details.soak=await soak(browser,url,heaviest);report('motion',details);
    require('./validate.cjs').motion(report('motion',details));
    assert.ok(samples.every(x=>x.errors.length===0));
  }catch(e){report('motion',{...details,error:e.stack},false);throw e;}
  finally{if(browser)await browser.close();server.close();}
}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={installProbe,summarize};
