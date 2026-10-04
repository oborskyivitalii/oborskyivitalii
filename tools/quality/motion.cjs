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
  // Real callback start gaps reveal undersampling/jitter that a cheap paint-cost
  // percentile alone cannot detect. These are lab paint intervals, not display FPS.
  const gaps=painted.slice(1).map((x,i)=>x.started-painted[i].started).sort((a,b)=>a-b);
  const gapPercentile=p=>gaps.length?gaps[Math.min(gaps.length-1,Math.floor(gaps.length*p))]:null;
  return {kind,elapsedMs:data.elapsed,window:{startMs:data.start,endMs:data.end},quality:data.quality,cadence:data.cadence,state:data.state,motion:data.motion,callbacks:data.frames.length,paints:painted.length,paintRateHz:painted.length/data.elapsed*1000,paintIntervalsMs:{count:gaps.length,p50:gapPercentile(.5),p95:gapPercentile(.95),max:gaps.at(-1)??null},paintCallbackMs:{p50:percentile(.5),p95:percentile(.95),max:values.at(-1)??null},callbackBusyPercent:data.frames.reduce((a,x)=>a+x.duration,0)/data.elapsed*100,rawFrames:data.frames,rawLongTasks:data.longTasks,errors:data.errors||[]};
}
async function collect(page,kind,duration){
  await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];window.__qualityStart=performance.now();});
  if(kind==='scroll')await page.evaluate(()=>{const start=performance.now();window.__qualityScroll=setInterval(()=>{const p=((performance.now()-start)%2000)/1000;scrollTo({top:(p<1?p:2-p)*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});},60);});
  await page.waitForTimeout(duration);
  if(kind==='scroll')await page.evaluate(()=>clearInterval(window.__qualityScroll));
  const data=await page.evaluate(()=>{const end=performance.now(),start=window.__qualityStart;return {...window.__qualityMotion,start,end,elapsed:end-start,quality:document.querySelector('.space-scene').dataset.quality,cadence:document.querySelector('.space-scene').dataset.cadence,state:document.querySelector('.space-scene').dataset.state,motion:document.querySelector('#space-motion').textContent};});
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
async function flights(browser,url,profile){
  const ctx=await browser.newContext({viewport:{width:profile.width,height:profile.width===390?844:900}});
  await ctx.addInitScript(installProbe);const page=await ctx.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});
  try{
    await page.goto(url+'/index.html');await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true');
    const rows=[];
    for(const destination of ['research','writing','talks','credits','index','credits','talks','writing','research','index']){
      const from=await page.locator('body').getAttribute('data-page');
      await page.evaluate(destination=>{
        window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];window.__qualityStart=performance.now();
        document.querySelector(`a[href="${destination==='index'?'./':destination+'.html'}"]`).click();
      },destination);
      await page.waitForFunction(destination=>document.body.dataset.page===destination&&!document.querySelector('#site-content').hasAttribute('aria-busy')&&document.querySelector('.space-scene').dataset.travel==='settled',destination,{polling:40,timeout:8000});
      const data=await page.evaluate(()=>{const end=performance.now(),start=window.__qualityStart;return {...window.__qualityMotion,start,end,elapsed:end-start,state:document.querySelector('.space-scene').dataset.state};});
      rows.push({from,to:destination,...profile,...summarize(data,'flight')});
    }
    await page.locator('#space-motion').evaluate(el=>el.click());await page.waitForTimeout(200);
    await cdp.send('HeapProfiler.collectGarbage');const before=await cdp.send('Memory.getDOMCounters');
    for(let i=0;i<40;i++){
      const destination=routes[(i+1)%routes.length];
      await page.evaluate(destination=>document.querySelector(`a[href="${destination==='index'?'./':destination+'.html'}"]`).click(),destination);
      await page.waitForFunction(destination=>document.body.dataset.page===destination&&!document.querySelector('#site-content').hasAttribute('aria-busy'),destination);
    }
    await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];});
    await cdp.send('HeapProfiler.collectGarbage');const after=await cdp.send('Memory.getDOMCounters');
    return {...profile,rows,errors,cycles:40,before,after};
  }finally{await ctx.close();}
}
async function main(){
  const {server,url}=await start(),samples=[];let browser;
  const details={note:'Sequential lab measurements. CPU x4 is synthetic. Callback timing includes JS/Canvas commands, not display FPS or battery usage.',samples};
  try{
    browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));details.browser=browser.version();
    for(const profile of [{width:1440,rate:1},{width:390,rate:1},{width:390,rate:4}])for(const route of routes){
      samples.push(await sample(browser,url,route,profile));report('motion',details);
      process.stdout.write(JSON.stringify({...profile,route,measurements:samples.at(-1).measurements.map(({kind,paints,paintRateHz,paintIntervalsMs,paintCallbackMs,callbackBusyPercent,quality,cadence})=>({kind,paints,paintRateHz,paintIntervalsMs,paintCallbackMs,callbackBusyPercent,quality,cadence}))})+'\n');
    }
    details.journeys=[];
    for(const profile of [{width:1440,rate:1},{width:390,rate:1},{width:390,rate:4}]){details.journeys.push(await flights(browser,url,profile));report('motion',details);process.stdout.write('Ten route flights measured: '+JSON.stringify(profile)+'\n');}
    const heaviest=[...samples.filter(x=>x.width===390&&x.rate===4)].sort((a,b)=>b.measurements[0].paintCallbackMs.p95-a.measurements[0].paintCallbackMs.p95)[0].route;
    details.soak=await soak(browser,url,heaviest);report('motion',details);
    require('./validate.cjs').motion(report('motion',details));
    assert.ok(samples.every(x=>x.errors.length===0));
  }catch(e){report('motion',{...details,error:e.stack},false);throw e;}
  finally{if(browser)await browser.close();server.close();}
}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={installProbe,summarize,flights};
