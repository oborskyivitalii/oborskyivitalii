const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const toolRequire=createRequire(path.join(process.env.SITE_AUDIT_TOOLS||'/tmp/site-v8-audit','package.json'));
const pw=toolRequire('playwright');
const AxeBuilder=toolRequire('@axe-core/playwright').default;
const {start}=require('./serve.cjs');
const out=path.join(__dirname,'results');
const routes=['index','research','writing','talks','credits'];
const chromeOptions={headless:true,executablePath:process.env.SITE_AUDIT_CHROME||'/tmp/site-chrome/opt/google/chrome/chrome',args:['--no-sandbox','--disable-dev-shm-usage']};
function webkitOptions(){
  const root=process.env.SITE_AUDIT_WEBKIT;
  if(!root)return {headless:true};
  // Optional portable WebKit binary. Same library paths as its supplied launcher,
  // plus dependencies unpacked locally, without installing system packages.
  return {headless:true,executablePath:path.join(root,'bin/MiniBrowser'),env:{...process.env,
    WEBKIT_EXEC_PATH:path.join(root,'bin'),WEBKIT_INJECTED_BUNDLE_PATH:path.join(root,'lib'),
    WEBKIT_INSPECTOR_RESOURCES_PATH:path.join(root,'share'),
    LD_LIBRARY_PATH:[path.join(root,'lib'),path.join(root,'sys/lib'),process.env.SITE_AUDIT_WEBKIT_LIBS||''].join(':')}};
}
const save=(name,value)=>fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');
async function state(page){return page.evaluate(()=>({ready:document.querySelector('.space-scene')?.dataset.ready,phase:document.querySelector('.space-scene')?.dataset.phase,camera:document.querySelector('.space-scene')?.dataset.camera,overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,dom:document.querySelectorAll('*').length,fallbackVisible:getComputedStyle(document.querySelector('.space-fallback')).visibility!=='hidden',motionHidden:document.querySelector('#space-motion').hidden,motionDisabled:document.querySelector('#space-motion').disabled,publications:document.querySelectorAll('li.publication').length}));}
async function matrix(url){
  const selected=process.env.SITE_AUDIT_ENGINES?.split(',');
  const previous=path.join(out,'browser-matrix.json');
  const report=selected&&fs.existsSync(previous)?JSON.parse(fs.readFileSync(previous,'utf8')):{engines:[],views:[],fallbacks:[],axe:[],faults:[]};
  if(selected)for(const key of ['engines','views','fallbacks'])report[key]=report[key].filter(x=>!selected.includes(x.engine));
  for(const engine of selected||['chromium','firefox','webkit']){
    let browser;
    try{browser=await pw[engine].launch(engine==='chromium'?chromeOptions:engine==='webkit'?webkitOptions():{headless:true});}catch(e){report.engines.push({engine,status:'blocked',error:e.message});save('browser-matrix',report);continue;}
    report.engines.push({engine,status:'launched',version:browser.version()});
    try{
      for(const width of [1440,390])for(const route of routes){
        const ctx=await browser.newContext({viewport:{width,height:width===390?844:900},deviceScaleFactor:width===390?3:1,hasTouch:width===390});
        const page=await ctx.newPage(),errors=[],external=[];
        page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(url))external.push(r.url());});
        await page.goto(`${url}/${route}.html`,{waitUntil:'load'});await page.waitForTimeout(300);
        const initial=await state(page);await page.waitForTimeout(200);const living=await state(page);
        await page.locator('.appearance summary').click();
        for(const theme of ['light','dark']){
          await page.locator('#theme-mode').selectOption(theme);await page.waitForTimeout(120);
          const snapshot=await state(page);
          report.views.push({engine,version:browser.version(),route,width,theme,ambientMoves:initial.phase!==living.phase,...snapshot,errors:[...errors],externalRequests:[...external]});
        }
        if(await page.locator('#space-motion').isVisible()){
          await page.locator('#space-motion').click();await page.waitForTimeout(150);const frozen=await state(page);
          await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await page.waitForTimeout(150);const after=await state(page);
          report.views.at(-1).offFreeze=frozen.phase===after.phase&&frozen.camera===after.camera;
        }else report.views.at(-1).offFreeze='unavailable: motion control remained hidden';
        if(route==='writing'){
          await page.locator('#archive-topic').selectOption('systems');
          report.views.at(-1).filter={value:await page.locator('#archive-topic').inputValue(),visible:await page.locator('li.publication:visible').count(),url:page.url().replace(url,'<audit-origin>')};
        }
        if(engine==='chromium'&&width===390){
          await page.keyboard.press('Escape');
          const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
          report.axe.push({route,theme:'dark',violations:a.violations,incomplete:a.incomplete.map(x=>({id:x.id,impact:x.impact,nodeCount:x.nodes.length})),passes:a.passes.length});
        }
        await ctx.close();save('browser-matrix',report);
      }
      for(const mode of ['no-js','no-canvas','blocked-storage','reduced'])for(const route of routes){
        const ctx=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
        if(mode==='no-canvas')await ctx.addInitScript(()=>HTMLCanvasElement.prototype.getContext=()=>null);
        if(mode==='blocked-storage')await ctx.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Audit storage denial','SecurityError');}});});
        const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.goto(`${url}/${route}.html`);await page.waitForTimeout(150);const before=await state(page);
        await page.evaluate(()=>scrollTo({top:600,behavior:'instant'}));await page.waitForTimeout(150);const after=await state(page);
        report.fallbacks.push({engine,route,mode,width:320,...after,phaseFrozen:before.phase===after.phase,errors});
        await ctx.close();
      }
      if(engine==='chromium'){
        for(const fault of ['missing-hasOwn','draw-exception','context-lost']){
          const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage(),errors=[];
          page.on('pageerror',e=>errors.push(e.message));
          if(fault==='missing-hasOwn')await ctx.addInitScript(()=>Object.hasOwn=undefined);
          await page.goto(`${url}/research.html`);await page.waitForTimeout(200);
          if(fault==='draw-exception')await page.evaluate(()=>CanvasRenderingContext2D.prototype.clearRect=function(){throw Error('Audit injected draw failure');});
          if(fault==='context-lost')await page.evaluate(()=>document.querySelector('canvas').dispatchEvent(new Event('contextlost')));
          await page.waitForTimeout(200);report.faults.push({fault,...await state(page),errors,limit:'Artificial API/event fault injection, not natural hardware loss.'});await ctx.close();
        }
        const ctx=await browser.newContext(),page=await ctx.newPage();
        await page.goto(`${url}/writing.html?topic=%3Cimg%20src=x%20onerror=alert(1)%3E&year=__proto__&language=javascript%3Aalert(1)#topic-__proto__`);
        report.injectionProbe=await page.evaluate(()=>({topic:document.querySelector('#archive-topic').value,year:document.querySelector('#archive-year').value,language:document.querySelector('#archive-language').value,injectedElements:document.querySelectorAll('img[src="x"]').length,visible:[...document.querySelectorAll('li.publication')].filter(x=>!x.hidden).length}));
        await ctx.close();
      }
    }finally{await browser.close();save('browser-matrix',report);}
    process.stdout.write(`Compatibility complete: ${engine}\n`);
  }
}
function installProbe(){
  const native=window.requestAnimationFrame.bind(window),clear=CanvasRenderingContext2D.prototype.clearRect;
  const probe={frames:[],longTasks:[],paints:0};window.__auditProbe=probe;
  CanvasRenderingContext2D.prototype.clearRect=function(...args){probe.paints++;return clear.apply(this,args);};
  window.requestAnimationFrame=function(callback){return native(function(time){
    if(callback.name!=='frame')return callback(time);
    const start=performance.now(),before=probe.paints;callback(time);probe.frames.push({time,duration:performance.now()-start,painted:probe.paints>before});
  });};
  try{new PerformanceObserver(list=>{for(const x of list.getEntries())probe.longTasks.push({start:x.startTime,duration:x.duration});}).observe({type:'longtask',buffered:true});}catch{}
}
async function collect(page,kind,duration){
  await page.evaluate(()=>{window.__auditProbe.frames=[];window.__auditProbe.longTasks=[];window.__auditStart=performance.now();});
  if(kind==='scroll')await page.evaluate(()=>{const start=performance.now();window.__auditScroll=setInterval(()=>{const progress=((performance.now()-start)%2000)/1000;scrollTo({top:(progress<1?progress:2-progress)*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});},60);});
  await page.waitForTimeout(duration);
  if(kind==='scroll')await page.evaluate(()=>clearInterval(window.__auditScroll));
  const data=await page.evaluate(()=>({...window.__auditProbe,elapsed:performance.now()-window.__auditStart,heap:performance.memory?.usedJSHeapSize,phase:document.querySelector('.space-scene').dataset.phase,dom:document.querySelectorAll('*').length}));
  const painted=data.frames.filter(x=>x.painted),values=painted.map(x=>x.duration).sort((a,b)=>a-b),percentile=p=>values.length?values[Math.min(values.length-1,Math.floor(values.length*p))]:null;
  const gaps=painted.slice(1).map((x,i)=>x.time-painted[i].time).sort((a,b)=>a-b);
  return {kind,elapsedMs:data.elapsed,callbacks:data.frames.length,paints:painted.length,paintsPerSecond:painted.length*1000/data.elapsed,paintCallbackMs:{p50:percentile(.5),p95:percentile(.95),max:values.at(-1)},paintIntervalP95:gaps[Math.floor(gaps.length*.95)]||null,callbackBusyPercent:data.frames.reduce((a,x)=>a+x.duration,0)/data.elapsed*100,longTasks:data.longTasks.length,longTaskMs:data.longTasks.reduce((a,x)=>a+x.duration,0),heapBytes:data.heap,domNodes:data.dom,rawFrames:data.frames,rawLongTasks:data.longTasks};
}
async function performanceAudit(url){
  const report={note:'One sequential lab sample per scenario. CPU slowdown is synthetic, not a device model. Callbacks include JS and Canvas commands, not compositor presentation FPS.',samples:[]};
  const browser=await pw.chromium.launch(chromeOptions);report.browser=browser.version();
  try{
    for(const profile of [{width:1440,rate:1},{width:390,rate:1},{width:390,rate:4}])for(const route of routes){
      const ctx=await browser.newContext({viewport:{width:profile.width,height:profile.width===390?844:900},deviceScaleFactor:profile.width===390?3:1});await ctx.addInitScript(installProbe);
      const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});
      await page.goto(`${url}/${route}.html`);await page.waitForTimeout(800);
      const measurements=[];for(const kind of ['idle','scroll'])measurements.push(await collect(page,kind,4000));
      await page.locator('.appearance summary').click();await page.locator('#space-motion').click();await page.waitForTimeout(200);measurements.push(await collect(page,'off',1000));
      report.samples.push({route,...profile,measurements,errors});save('runtime-performance',report);
      process.stdout.write(JSON.stringify({route,...profile,results:measurements.map(x=>({kind:x.kind,pps:Math.round(x.paintsPerSecond),p95:Math.round(x.paintCallbackMs.p95||0),busy:Math.round(x.callbackBusyPercent),longTasks:x.longTasks}))})+'\n');await ctx.close();
    }
    const ctx=await browser.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(installProbe);const page=await ctx.newPage();
    await page.goto(`${url}/research.html`);await page.waitForTimeout(500);const cdp=await ctx.newCDPSession(page);await cdp.send('HeapProfiler.collectGarbage');
    const start=(await cdp.send('Runtime.getHeapUsage')).usedSize;
    const chunks=[];for(let i=0;i<3;i++)chunks.push(await collect(page,'idle',20000));
    await page.locator('.appearance summary').click();await page.locator('#space-motion').click();await page.waitForTimeout(150);
    await page.evaluate(()=>{window.__auditProbe.frames=[];window.__auditProbe.longTasks=[];});await cdp.send('HeapProfiler.collectGarbage');const end=(await cdp.send('Runtime.getHeapUsage')).usedSize;
    report.soak={route:'research',width:390,durationSeconds:60,startHeapBytes:start,endHeapBytes:end,deltaBytes:end-start,chunks,limit:'Short soak and forced-GC heap samples can detect obvious growth, not establish absence of a long-term leak.'};await ctx.close();save('runtime-performance',report);
  }finally{await browser.close();}
}
(async()=>{fs.mkdirSync(out,{recursive:true});const {server,url}=await start();try{if(process.argv[2]==='performance')await performanceAudit(url);else await matrix(url);}finally{server.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
