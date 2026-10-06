'use strict';
// Sequential, balanced local factorial: identical Canvas/camera/route paths.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const {installProbe,summarize}=require('../../tools/quality/motion.cjs');
const file=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]),repeats=Number(process.argv[4]||3),mode=process.argv[5]||'factorial',baseline=mode==='baseline';
const percentile=(values,p)=>{const ordered=values.toSorted((a,b)=>a-b);return ordered[Math.min(ordered.length-1,Math.floor(ordered.length*p))]??null;};
async function tracing(cdp){
  const events=[];const collect=data=>events.push(...data.value);cdp.on('Tracing.dataCollected',collect);
  await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline.frame',transferMode:'ReportEvents'});
  const start=performance.now();
  return async()=>{
    const elapsed=performance.now()-start;
    const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');await complete;cdp.off('Tracing.dataCollected',collect);
    const names=new Set(['Paint','PrePaint','Layerize','UpdateLayer','RasterTask','CompositeLayers','DrawFrame','DroppedFrame']);const totals={};
    for(const e of events)if(names.has(e.name)){const stat=totals[e.name]||={count:0,durationMs:0};stat.count++;stat.durationMs+=(e.dur||0)/1000;}
    return {...totals,window:{durationMs:elapsed}};
  };
}
async function reset(page){await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];window.__qualityStart=performance.now();});}
async function result(page,kind){
  const data=await page.evaluate(()=>{const end=performance.now(),start=window.__qualityStart,scene=document.querySelector('.space-scene');return {...window.__qualityMotion,start,end,elapsed:end-start,quality:scene.dataset.quality,cadence:scene.dataset.cadence,state:scene.dataset.state,models:Number(scene.dataset.roomModels||0)};});
  const row=summarize(data,kind);assert.ok(row.paints>0,'positive Canvas paints');assert.equal(row.state,'active');return {...row,models:data.models};
}
async function trial(browser,profile,surface,flight,repeat){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.width===390?844:900},deviceScaleFactor:profile.width===390?3:1,offline:true});
  await context.addInitScript(installProbe);
  await context.addInitScript(({surface,flight})=>{
    localStorage.setItem('vo.theme','dark');localStorage.setItem('vo.content-flight',flight?'on':'off');
    // This same CSS comparison also works on the frozen pre-refactor file.
    document.addEventListener('DOMContentLoaded',()=>{if(!flight){const style=document.createElement('style');style.textContent='#site-content{transform:none!important}';document.head.append(style);}});
    window.__startup={};try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__startup[e.entryType]=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});}catch{/* Local startup remains a bounded lab measure. */}
  },{surface,flight});
  const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});
  try{
    await page.goto(pathToFileURL(file).href+'?view=research');await page.waitForFunction(()=>document.body.dataset.page==='research'&&document.querySelector('.space-scene').dataset.ready==='true');
    await page.evaluate(()=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*.42,behavior:'instant'}));await page.waitForTimeout(1400);
    assert.equal(await page.locator('#surface-mode').count(),0);
    const startup=await page.evaluate(()=>({fcpMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,lcpMs:window.__startup['largest-contentful-paint'],domReadyMs:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd}));
    const stopTrace=await tracing(cdp),measurements=[];
    for(const kind of ['idle','scroll']){
      await reset(page);
      if(kind==='scroll')await page.evaluate(()=>{const start=performance.now();window.__perfScroll=setInterval(()=>{const p=((performance.now()-start)%2400)/1200;scrollTo({top:(p<1?p:2-p)*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});},80);});
      await page.waitForTimeout(2500);if(kind==='scroll')await page.evaluate(()=>clearInterval(window.__perfScroll));
      measurements.push(await result(page,kind));
    }
    const flights=[];
    for(const to of ['writing','research','index','research']){
      const from=await page.locator('body').getAttribute('data-page');await reset(page);await page.evaluate(to=>document.querySelector('a[href="?view='+to+'"]').click(),to);
      await page.waitForFunction(to=>document.body.dataset.page===to&&!document.getElementById('site-content').hasAttribute('aria-busy')&&document.querySelector('.space-scene').dataset.travel==='settled',to,{polling:40,timeout:10000});
      flights.push({from,to,...await result(page,'flight')});
    }
    const trace=await stopTrace();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
    return {profile,surface,flight,repeat,startup,measurements,flights,trace,errors,requests};
  }finally{await context.close();}
}
function aggregate(rows){
  const groups=[];
  for(const width of [1440,390])for(const surface of ['soft'])for(const flight of [false,true]){
    const set=rows.filter(r=>r.profile.width===width&&r.surface===surface&&r.flight===flight);if(!set.length)continue;
    const group={width,surface,flight,trials:set.length,kinds:{}};
    for(const kind of ['idle','scroll','flight']){
      const windows=set.flatMap(r=>kind==='flight'?r.flights:r.measurements.filter(x=>x.kind===kind));
      const values=windows.map(w=>w.paintCallbackMs.p95),busy=windows.map(w=>w.callbackBusyPercent);
      const painted=windows.flatMap(w=>w.rawFrames.filter(f=>f.painted).map(f=>f.duration));
      group.kinds[kind]={windows:windows.length,pooledCallbackP95Ms:percentile(painted,.95),medianWindowP95Ms:percentile(values,.5),windowP95RangeMs:[Math.min(...values),Math.max(...values)],medianBusyPercent:percentile(busy,.5),medianPaintRateHz:percentile(windows.map(w=>w.paintRateHz),.5),medianPaintGapP95Ms:percentile(windows.map(w=>w.paintIntervalsMs.p95),.5),longTasks:windows.reduce((n,w)=>n+w.rawLongTasks.length,0)};
    }
    group.pipeline=Object.fromEntries(['Paint','PrePaint','Layerize','UpdateLayer','RasterTask','DrawFrame','DroppedFrame'].map(name=>[name,{medianCount:percentile(set.map(r=>r.trace[name]?.count||0),.5),medianDurationMs:percentile(set.map(r=>r.trace[name]?.durationMs||0),.5)}]));groups.push(group);
  }
  return groups;
}
(async()=>{
  assert.ok(Number.isInteger(repeats)&&repeats>=1&&repeats<=5);assert.ok(['factorial','baseline','soft-flight'].includes(mode));fs.mkdirSync(path.dirname(output),{recursive:true});
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
  const browserCDP=await browser.newBrowserCDPSession(),gpu=(await browserCDP.send('SystemInfo.getInfo')).gpu;
  const record={source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),bytes:fs.statSync(file).size,browser:browser.version(),gpu,protocol:'Sequential balanced order; dark Research idle/scroll and identical four native route flights. CPU x4 is synthetic. Trace CPU durations can overlap and do not measure physical display FPS, power or hardware GPU cost.',rows};
  try{
    for(let repeat=0;repeat<repeats;repeat++)for(const profile of [{width:1440,rate:1},{width:390,rate:4}]){
      let combinations=baseline||mode==='soft-flight'?[['soft',true]]:[['soft',false],['soft',true]];
      if(repeat%2)combinations=combinations.toReversed();else if(profile.width===390)combinations=[...combinations.slice(2),...combinations.slice(0,2)];
      for(const [surface,flight]of combinations){const row=await trial(browser,profile,surface,flight,repeat);rows.push(row);record.groups=aggregate(rows);fs.writeFileSync(output,JSON.stringify(record,null,2));console.log(JSON.stringify({repeat,width:profile.width,surface,flight,idle:row.measurements[0].paintCallbackMs.p95,scroll:row.measurements[1].paintCallbackMs.p95,flights:row.flights.map(r=>r.paintCallbackMs.p95),paintMs:row.trace.Paint?.durationMs}));}
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
