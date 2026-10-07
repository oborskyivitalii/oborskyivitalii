'use strict';
// Focused #36 evidence; this does not replace hosted/native release profiles.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const artifact=require('./artifact.cjs'),{toolRequire,launchOptions,environment,variant}=require('./common.cjs');
const {serve,ready}=require('./writing-probe.cjs'),functional=require('./functional.cjs');
function physicalFormulaBounds(args,matrix,canvas,viewport){
  // Canvas commands are backing-store coordinates after its current transform.
  // CSS zoom and DPR are reflected by the physical rectangle/backing ratios.
  const [x,y,width,height]=args.length===8?args.slice(4):args;
  const corners=[[x,y],[x+width,y],[x+width,y+height],[x,y+height]].map(([u,v])=>[
    canvas.x+(matrix.a*u+matrix.c*v+matrix.e)*canvas.width/canvas.backingWidth,
    canvas.y+(matrix.b*u+matrix.d*v+matrix.f)*canvas.height/canvas.backingHeight
  ]);
  const xs=corners.map(point=>point[0]),ys=corners.map(point=>point[1]),left=Math.min(...xs),top=Math.min(...ys);
  return {x:left,y:top,width:Math.max(...xs)-left,height:Math.max(...ys)-top,viewportWidth:viewport.width,viewportHeight:viewport.height,coordinateSpace:'physical-css-pixels',canvas};
}
async function initialize(context,options){
  await context.addInitScript({content:'window.__physicalFormulaBounds='+physicalFormulaBounds.toString()+';'});
  await context.addInitScript({content:'window.__formulaOwnershipSnapshot='+ownershipSnapshot.toString()+';'});
  await context.addInitScript(observeFormula,options);
}
function ownershipSnapshot(){
  const probe=window.__formulaQA,scene=document.querySelector('.space-scene'),fallback=document.querySelector('.writing-formula-fallback'),style=fallback&&getComputedStyle(fallback);
  return {time:performance.now(),route:document.body.dataset.page,mode:document.body.dataset.formulaMode,motion:document.querySelector('#space-motion').textContent,fallbackVisible:!!style&&style.visibility!=='hidden'&&style.display!=='none',bitmapFormula:!!probe.bitmapFormula,paints:probe.paints,draws:probe.draws,callbacks:probe.callbacks,phase:scene.dataset.phase,camera:scene.dataset.camera,scrollY,formula:window.SiteScene.diagnostics().formula};
}
function observeFormula({theme='dark',cacheFault=false,motion='on'}={}){
  localStorage.setItem('vo.theme',theme);localStorage.setItem('vo.content-flight','on');
  localStorage.setItem('vo.motion',motion);
  window.__formulaQA={paints:0,draws:0,callbacks:0,maxPerPaint:0,bounds:[],duplicate:false,startPaintCount:0,bitmapFormula:false};
  const record=kind=>{if(window.__formulaOwnership)window.__formulaOwnership.events.push({kind,...window.__formulaOwnershipSnapshot()});};
  const raf=window.requestAnimationFrame;
  window.requestAnimationFrame=function(callback){return raf.call(this,time=>{window.__formulaQA.callbacks++;return callback(time);});};
  const clear=CanvasRenderingContext2D.prototype.clearRect,draw=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.clearRect=function(...args){
    const visible=this.canvas.id==='space-canvas';
    if(visible){window.__formulaQA.paints++;window.__formulaQA.perPaint=0;window.__formulaQA.bitmapFormula=false;}
    const result=clear.apply(this,args);if(visible)record('paint-clear');return result;
  };
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
    if(this.canvas.id==='space-canvas'&&image.width===1380&&image.height===240){
      const probe=window.__formulaQA;probe.draws++;probe.perPaint=(probe.perPaint||0)+1;probe.bitmapFormula=true;
      probe.maxPerPaint=Math.max(probe.maxPerPaint,probe.perPaint);probe.duplicate=probe.maxPerPaint>1;
      const rect=this.canvas.getBoundingClientRect(),band=document.querySelector('[data-writing-formula]')?.getBoundingClientRect(),heading=document.querySelector('.archive-intro')?.getBoundingClientRect();
      const canvas={x:rect.x,y:rect.y,width:rect.width,height:rect.height,backingWidth:this.canvas.width,backingHeight:this.canvas.height};
      probe.bounds.push({route:document.body.dataset.page,...window.__physicalFormulaBounds(args,this.getTransform(),canvas,{width:innerWidth,height:innerHeight}),band:band&&{x:band.x,y:band.y,width:band.width,height:band.height},headingBottom:heading?.bottom});
      if(probe.bounds.length>2000)probe.bounds.shift();
      record('formula-draw');
    }
    return draw.call(this,image,...args);
  };
  if(cacheFault){
    const context=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(...args){if(this.width===1380&&this.height===240)throw Error('Controlled formula cache fault');return context.apply(this,args);};
  }
}
function finiteBounds(rows){
  assert.ok(rows.length>0,'actual formula draw evidence');
  for(const row of rows){
    for(const key of ['x','y','width','height'])assert.ok(Number.isFinite(row[key]),'finite formula '+key);
    assert.ok(row.width>0&&row.height>0,'positive formula size');
    assert.ok(row.x>=15&&row.x+row.width<=row.viewportWidth-15,'whole expression fits horizontally');
    assert.ok(row.y>=0&&row.y+row.height<=row.viewportHeight,'whole expression fits vertically');
    assert.equal(row.coordinateSpace,'physical-css-pixels','physical Canvas evidence');
    for(const key of ['x','y','width','height','backingWidth','backingHeight'])assert.ok(Number.isFinite(row.canvas?.[key]),'finite Canvas '+key);
    for(const key of ['width','height','backingWidth','backingHeight'])assert.ok(row.canvas[key]>0,'positive Canvas '+key);
    for(const key of ['x','y','width','height'])assert.ok(Number.isFinite(row.band?.[key]),'finite reserved band '+key);
    assert.ok(row.band.width>0&&row.band.height>0,'positive reserved band');
    assert.ok(Number.isFinite(row.headingBottom)&&row.band.y>=row.headingBottom-1,'reserved band follows intro');
    assert.ok(row.x>=row.band.x-1&&row.x+row.width<=row.band.x+row.band.width+1,'formula fits reserved band horizontally');
    assert.ok(row.y>=row.band.y-1&&row.y+row.height<=row.band.y+row.band.height+1,'formula fits reserved band vertically');
  }
}
async function frameBand(page){
  await page.waitForSelector('[data-writing-formula] .writing-formula-fallback',{state:'attached',timeout:5000});
  const frame=await page.evaluate(()=>{
    const band=document.querySelector('[data-writing-formula]'),svg=band.querySelector('.writing-formula-fallback'),art=svg.getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();
    const top=header.bottom+16,bottom=innerHeight-16,maxScroll=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    const target=art.top>=top&&art.bottom<=bottom?scrollY:Math.min(maxScroll,Math.max(0,scrollY+art.top+art.height/2-(top+bottom)/2));
    if(Math.abs(target-scrollY)>.5)scrollTo({top:target,behavior:'instant'});
    return {role:band.getAttribute('role'),label:band.getAttribute('aria-label'),target};
  });
  assert.equal(frame.role,'img','accessible formula landmark');assert.match(frame.label||'',/y\s*=\s*f\(x\)/);assert.match(frame.label||'',/P\(y\|x\)/);
  await page.waitForFunction(target=>Math.abs(scrollY-target)<1,frame.target,{polling:40,timeout:3000});
  await require('./engine-browser.cjs').liveScrollPrecondition(page);
  await require('./engine-browser.cjs').settledCamera(page);
  return frame;
}
async function visible(page){
  await page.waitForFunction(()=>window.__formulaQA.draws>0,null,{polling:40,timeout:5000});
  const observed=await page.evaluate(()=>({probe:window.__formulaQA,formula:window.SiteScene.diagnostics().formula,overflow:document.documentElement.scrollWidth>innerWidth+1}));
  assert.equal(observed.overflow,false);assert.equal(observed.probe.duplicate,false);
  assert.equal(observed.formula.cacheBuilds,1);assert.equal(observed.formula.width,1380);assert.equal(observed.formula.height,240);assert.equal(observed.formula.bytes,1380*240*4);
  assert.equal(observed.formula.paintCount-observed.probe.startPaintCount,observed.probe.draws,'fresh formula draw delta matches actual submissions');
  finiteBounds(observed.probe.bounds);return observed;
}
async function freshObservation(page){
  await frameBand(page);
  await page.evaluate(()=>{const probe=window.__formulaQA;probe.draws=0;probe.bounds=[];probe.startPaintCount=window.SiteScene.diagnostics().formula.paintCount;});
  return visible(page);
}
async function ownership(browser,url){
  const rows=[];
  for(const kind of ['off','reduced']){
    const context=await browser.newContext({viewport:{width:390,height:844}});await initialize(context,{motion:'off'});
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    try{
      await page.goto(url+'/writing.html');await ready(page,'writing');
      const off=await page.evaluate(()=>window.__formulaOwnershipSnapshot());
      assert.equal(off.mode,'static');assert.equal(off.fallbackVisible,true);assert.equal(off.formula.cacheBuilds,0);assert.equal(off.draws,0);
      const onSynchronous=await page.evaluate(()=>{document.querySelector('#space-motion').click();return window.__formulaOwnershipSnapshot();});
      assert.equal(onSynchronous.formula.cacheBuilds,1,'startup On prepares once before queued paint');assert.equal(onSynchronous.formula.status,'ready');assert.equal(onSynchronous.draws,0,'startup cache preparation does not submit a formula');
      const painted=await freshObservation(page);
      const started=await page.evaluate(kind=>{
        window.__formulaOwnership={events:[]};
        const observer=new MutationObserver(()=>window.__formulaOwnership.events.push({kind:'mode-change',...window.__formulaOwnershipSnapshot()}));
        observer.observe(document.body,{attributes:true,attributeFilter:['data-formula-mode']});window.__formulaOwnership.observer=observer;
        const before=window.__formulaOwnershipSnapshot();window.__formulaOwnership.events.push({kind:'before',...before});
        if(kind==='off')document.querySelector('#space-motion').click();
        const immediate=window.__formulaOwnershipSnapshot();window.__formulaOwnership.events.push({kind:'preference-return',...immediate});return {before,immediate};
      },kind);
      const before=started.before;
      assert.equal(before.mode,'canvas');assert.equal(before.fallbackVisible,false);assert.equal(before.bitmapFormula,true);assert.equal(before.formula.lastPaintCount,1);
      let immediate=started.immediate;
      if(kind==='reduced'){
        await page.emulateMedia({reducedMotion:'reduce'});
        immediate=await page.evaluate(()=>{const state=window.__formulaOwnershipSnapshot();window.__formulaOwnership.events.push({kind:'preference-return',...state});return state;});
      }
      await page.waitForFunction(()=>document.body.dataset.formulaMode==='static'&&window.SiteScene.diagnostics().formula.lastPaintCount===0,null,{polling:40,timeout:1500});
      const after=await page.evaluate(()=>{const state=window.__formulaOwnershipSnapshot();window.__formulaOwnership.events.push({kind:'settled',...state});return state;});
      assert.equal(after.fallbackVisible,true);assert.equal(after.bitmapFormula,false);
      const scroll=await page.evaluate(()=>{
        const beforeY=scrollY,maxScroll=document.documentElement.scrollHeight-innerHeight,target=Math.min(maxScroll,beforeY+100);
        scrollTo({top:target,behavior:'instant'});const state=window.__formulaOwnershipSnapshot();window.__formulaOwnership.events.push({kind:'native-scroll',...state});return {beforeY,target,after:state};
      });
      await page.waitForTimeout(400);
      const end=await page.evaluate(()=>{const state=window.__formulaOwnershipSnapshot();window.__formulaOwnership.events.push({kind:'freeze-end',...state});window.__formulaOwnership.observer.disconnect();return {state,events:window.__formulaOwnership.events};});
      const frozen={elapsedMs:end.state.time-after.time,paintDelta:end.state.paints-after.paints,drawDelta:end.state.draws-after.draws,callbackDelta:end.state.callbacks-after.callbacks,scroll,after:end.state};
      const targetMotion=kind==='off'?'Motion: off':'Motion: reduced',events=end.events.filter(state=>state.time<=after.time&&state.motion===targetMotion),start=events[0];
      assert.ok(start,'actual preference transition evidence');
      const settle={timeoutMs:1500,start,elapsedMs:after.time-start.time,paintDelta:events.filter(state=>state.kind==='paint-clear').length,drawDelta:events.filter(state=>state.kind==='formula-draw').length,callbackDelta:after.callbacks-start.callbacks+(start.kind==='paint-clear'?1:0)};
      assert.equal(settle.paintDelta,1,'preference clears the visible formula with one bounded Canvas paint');assert.equal(settle.drawDelta,0);assert.equal(settle.callbackDelta,1);assert.equal(after.phase,start.phase);assert.equal(after.camera,start.camera);
      assert.ok(frozen.elapsedMs>=400);assert.equal(frozen.paintDelta,0);assert.equal(frozen.drawDelta,0);assert.equal(frozen.callbackDelta,0);assert.equal(end.state.phase,after.phase);assert.equal(end.state.camera,after.camera);assert.ok(end.state.scrollY>scroll.beforeY+50,'real native scroll while frozen');
      for(const state of end.events)assert.equal(state.bitmapFormula&&state.fallbackVisible,false,'Canvas and fallback never own the expression together');
      assert.deepEqual(errors,[]);rows.push({kind,startup:{off,onSynchronous,painted},before,immediate,settle,after,frozen,events:end.events,errors});
    }finally{await context.close();}
  }
  return rows;
}
async function custom(browser,url,output){
  const captures=[],rows=[];
  for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height:width===1440?900:844}});
    await initialize(context,{theme});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{
      await page.goto(url+'/writing.html');await ready(page,'writing');const initial=await freshObservation(page);
      const file=`writing-${width}-${theme}.png`;await page.screenshot({path:path.join(output,file)});captures.push(file);
      for(const fraction of [1,.5,0]){await page.evaluate(f=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:'instant'}),fraction);await page.waitForTimeout(450);}
      const after=await freshObservation(page);assert.equal(after.formula.cacheBuilds,1);
      let zoom;
      if(width===390){await page.evaluate(()=>{document.body.style.zoom='2';dispatchEvent(new Event('resize'));});zoom=await freshObservation(page);await page.screenshot({path:path.join(output,`writing-${theme}-zoom200.png`)});captures.push(`writing-${theme}-zoom200.png`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
      assert.deepEqual(errors,[]);rows.push({width,theme,initial,after,...(zoom?{zoom}:{}),errors});
    }finally{await context.close();}
  }
  const context=await browser.newContext({viewport:{width:390,height:844}});await initialize(context);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(url+'/writing.html');await ready(page,'writing');await freshObservation(page);
    for(const route of ['research','writing','talks','writing','credits','index','writing']){
      await page.locator(`a[href="${route==='index'?'./':route+'.html'}"]`).first().evaluate(el=>el.click());await ready(page,route);
      if(route==='writing')await freshObservation(page);
      else{await page.evaluate(()=>window.__formulaQA.draws=0);await page.waitForTimeout(400);}
      const state=await page.evaluate(()=>({route:document.body.dataset.page,probe:window.__formulaQA,formula:window.SiteScene.diagnostics().formula}));
      assert.equal(state.probe.duplicate,false);assert.equal(state.formula.cacheBuilds,1);
      if(route==='writing')assert.ok(state.probe.draws>0);else assert.equal(state.probe.draws,0,'formula absent from settled '+route);
      rows.push({journey:route,...state});
    }
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
  const fault=await browser.newContext({viewport:{width:390,height:844}});await initialize(fault,{cacheFault:true});const fp=await fault.newPage(),faultErrors=[];fp.on('pageerror',e=>faultErrors.push(e.message));
  try{
    await fp.goto(url+'/writing.html');await ready(fp,'writing');await fp.waitForTimeout(500);
    const state=await fp.evaluate(()=>({probe:window.__formulaQA,formula:window.SiteScene.diagnostics().formula,h1:document.querySelectorAll('h1').length,ready:document.querySelector('.space-scene').dataset.ready}));
    assert.equal(state.h1,1);assert.equal(state.ready,'true');assert.ok(state.probe.paints>0);assert.equal(state.probe.draws,0);assert.equal(state.formula.failures,1);
    await fp.waitForTimeout(400);assert.equal(await fp.evaluate(()=>window.SiteScene.diagnostics().formula.failures),1);assert.deepEqual(faultErrors,[]);rows.push({cacheFault:state,errors:faultErrors});
  }finally{await fault.close();}
  return {rows,captures,ownership:await ownership(browser,url)};
}
async function offline(browser,output){
  const directory=path.join(output,'offline');require('../../review/site-scroll-sync-20261004/export.cjs').exportVariants(directory,{variant:'color'});
  const context=await browser.newContext({viewport:{width:390,height:844}});await initialize(context);const page=await context.newPage(),requests=[],errors=[];
  page.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(pathToFileURL(path.join(directory,'Vitalii-Oborskyi-Color-Prototype.html')).href+'?view=writing');await ready(page,'writing');const observed=await freshObservation(page);
    assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);return {observed,requests,errors};
  }finally{await context.close();}
}
async function main(input,output){
  fs.mkdirSync(output,{recursive:true});const manifest=JSON.parse(fs.readFileSync(path.join(input,'artifact.json'))),publicDir=path.join(input,'public');
  artifact.verify(publicDir,manifest);assert.equal(manifest.sourceDirty,false);assert.equal(manifest.sourceCommit,process.env.SITE_CANDIDATE_SHA);assert.equal(variant(manifest).id,'color');
  const record={schema:1,kind:'writing-paradigm-browser',pass:false,fullGate:false,environment:environment(),sourceCommit:manifest.sourceCommit,sourceTree:manifest.sourceTree,artifactDigest:manifest.artifactDigest,variant:variant(manifest),engines:[],rows:[],limits:'Linux browser emulation, synthetic visibility and CSS zoom; no native-device or release acceptance'};
  const save=()=>fs.writeFileSync(path.join(output,'browser.json'),JSON.stringify(record,null,2)+'\n');
  const {server,url}=await serve({candidate:{publicDir}});const target=url+'/candidate';
  try{
    for(const engine of ['chromium','firefox','webkit']){
      const native=require('./native-display.cjs'),options=launchOptions(engine),started=performance.now(),budgetMs=options.timeout;
      let browser,display;
      try{
        display=await native.start(engine,{timeoutMs:budgetMs});
        if(display){options.headless=false;options.env={...process.env,DISPLAY:display.name};}
        options.timeout=native.remaining(started,budgetMs);
        browser=await toolRequire('playwright')[engine].launch(options);
        record.engines.push({engine,version:browser.version(),headless:options.headless,port:display?.port||(engine==='webkit'&&process.platform==='linux'?'wpe':'native'),displayBackend:display?.backend||null});
        for(const s of [{width:1440,theme:'light',mode:'normal'},{width:390,theme:'dark',mode:'normal'},{width:320,theme:'dark',mode:'no-js'},{width:320,theme:'light',mode:'no-canvas'},{width:390,theme:'dark',mode:'reduced'}]){
          const row=await functional.scenario(browser,target,{engine,route:'writing',...s});record.rows.push(row);save();
        }
        if(engine==='chromium'){record.formula=await custom(browser,target,output);save();record.offline=await offline(browser,output);save();}
      }catch(error){record.rows.push({engine,pass:false,error:error.stack});save();}
      finally{try{await browser?.close();}finally{display?.stop();}}
    }
    record.pass=record.engines.length===3&&record.rows.length===15&&record.rows.every(row=>row.pass)&&!!record.formula&&!!record.offline;
    if(record.pass){try{require('./writing-paradigm-validate.cjs').browser(record,manifest);}catch(error){record.pass=false;record.validationError=error.stack;save();throw error;}}
    save();assert.equal(record.pass,true,'focused Writing browser checks failed; retain browser.json/captures');
  }finally{server.close();save();}
  return record;
}
if(require.main===module)main(path.resolve(process.argv[2]),path.resolve(process.argv[3])).catch(error=>{console.error(error.stack);process.exitCode=1;});
module.exports={main,finiteBounds,physicalFormulaBounds};
