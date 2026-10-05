'use strict';
// Diagnostic instrumentation is isolated from the candidate and budget runs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const {installProbe,summarize}=require('../../tools/quality/motion.cjs');
const file=path.resolve(process.argv[2]),directory=path.resolve(process.argv[3]),repeats=Number(process.argv[4]||2);
const route=process.argv[5]||'research',width=Number(process.argv[6]||1440),rate=Number(process.argv[7]||1),idleOnly=process.argv[8]==='idle-only',theme=process.argv[9]||'dark';
function instrument(source){
  const marker='  const {sub,mix,clamp,LOOP_MS';
  assert.equal(source.split(marker).length,2,'one serialized lifecycle');
  source=source.replace(marker,`  api={...api};
  for(const name of ['worldFor','projectedWorld','paintShapes']){
    const original=api[name];api[name]=function stageProbe(...args){
      const start=performance.now();try{return original(...args);}finally{window.__hotspots.push({name,start,end:performance.now()});}
    };
  }
`+marker);
  for(const name of ['measure','roomFor','visibleRooms','draw','reportTravel','mount',...(source.includes('  function restoreScroll(')?['restoreScroll']:[])]){
    const parameters=name==='mount'?'data,url,position':'[^\\n]*';
    const pattern=new RegExp('(  function '+name+'\\('+parameters+'\\) \\{)([\\s\\S]*?)(\\n  \\})');
    assert.equal([...source.matchAll(new RegExp(pattern,'g'))].length,1,'one diagnostic '+name);
    source=source.replace(pattern,(_,opening,body,closing)=>opening+'\n    const stageStart=performance.now();try{'+body+'\n    }finally{window.__hotspots.push({name:'+JSON.stringify(name)+',start:stageStart,end:performance.now()});}'+closing);
  }
  return source;
}
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function trial(browser,html,surface,repeat){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},deviceScaleFactor:width===390?3:1,offline:true});
  await context.addInitScript(installProbe);
  await context.addInitScript(({surface,theme})=>{window.__hotspots=[];localStorage.setItem('vo.theme',theme);},{surface,theme});
  const page=await context.newPage(),errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  const cdp=await context.newCDPSession(page),trace=[];cdp.on('Tracing.dataCollected',e=>trace.push(...e.value));
  try{
    await cdp.send('Emulation.setCPUThrottlingRate',{rate});
    await page.goto(pathToFileURL(html).href+'?view='+route);await page.waitForFunction(route=>document.body.dataset.page===route&&!document.getElementById('site-content').hasAttribute('aria-busy')&&document.querySelector('.space-scene').dataset.ready==='true',route);
    if(!idleOnly)await page.evaluate(()=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*.42,behavior:'instant'}));await page.waitForTimeout(idleOnly?1200:1400);
    await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.enable');
    await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,disabled-by-default-v8.gc,blink.user_timing',transferMode:'ReportEvents'});await cdp.send('Profiler.start');
    await page.evaluate(()=>{window.__hotspots=[];});const windows=[];
    for(const kind of idleOnly?['idle']:['idle','scroll','writing','research','index','research']){
      await page.evaluate(()=>{window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];window.__qualityStart=performance.now();});
      if(kind==='scroll')await page.evaluate(()=>{const start=performance.now();window.__scrollProbe=setInterval(()=>{const p=((performance.now()-start)%2400)/1200;scrollTo({top:(p<1?p:2-p)*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});},80);});
      if(['idle','scroll'].includes(kind)){await page.waitForTimeout(idleOnly?8000:2500);if(kind==='scroll')await page.evaluate(()=>clearInterval(window.__scrollProbe));}
      else{await page.evaluate(route=>document.querySelector('header a[href="?view='+route+'"]').click(),kind);await page.waitForFunction(route=>document.body.dataset.page===route&&!document.getElementById('site-content').hasAttribute('aria-busy')&&document.querySelector('.space-scene').dataset.travel==='settled',kind,{timeout:10000,polling:40});}
      const data=await page.evaluate(()=>{const end=performance.now(),start=window.__qualityStart;return {...window.__qualityMotion,start,end,elapsed:end-start,stages:window.__hotspots.filter(x=>x.start>=start&&x.end<=end)};});
      windows.push({...summarize(data,kind),stages:data.stages});
    }
    const profile=(await cdp.send('Profiler.stop')).profile;
    const completed=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');await completed;
    assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
    const prefix=surface+'-'+repeat;fs.writeFileSync(path.join(directory,prefix+'.cpuprofile'),JSON.stringify(profile));fs.writeFileSync(path.join(directory,prefix+'-trace.json'),JSON.stringify({traceEvents:trace}));
    return {surface,repeat,windows,errors,network,profile:prefix+'.cpuprofile',trace:prefix+'-trace.json'};
  }finally{await context.close();}
}
(async()=>{
  assert.ok(Number.isInteger(repeats)&&repeats>=1&&repeats<=5);assert.ok(['index','research','writing','talks','credits'].includes(route));assert.ok([1440,390].includes(width)&&[1,4].includes(rate)&&['light','dark'].includes(theme));fs.mkdirSync(directory,{recursive:true});
  const source=fs.readFileSync(file),instrumented=instrument(source.toString()),html=path.join(directory,'instrumented.html');fs.writeFileSync(html,instrumented);
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
  const record={source:sha(source),instrumentedSource:sha(instrumented),browser:browser.version(),route,profile:{width,rate,theme},protocol:'Sequential diagnostic runs. Sampling/tracing/stage instrumentation adds overhead. These timings are not budget evidence. Stage times are inclusive; do not sum nested stages.',rows:[]};
  try{for(let i=0;i<repeats;i++)for(const surface of ['soft']){
    const row=await trial(browser,html,surface,i);record.rows.push(row);fs.writeFileSync(path.join(directory,'hotspots.json'),JSON.stringify(record,null,2));
    console.log(JSON.stringify({surface,repeat:i,windows:row.windows.map(w=>({kind:w.kind,p95:w.paintCallbackMs.p95,max:w.paintCallbackMs.max,largestStages:[...w.stages].sort((a,b)=>(b.end-b.start)-(a.end-a.start)).slice(0,4).map(s=>({name:s.name,ms:s.end-s.start}))}))}));
  }}finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
