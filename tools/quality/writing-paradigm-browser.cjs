'use strict';
// Focused #36 evidence; this does not replace hosted/native release profiles.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const artifact=require('./artifact.cjs'),{toolRequire,launchOptions,environment,variant}=require('./common.cjs');
const {serve,ready}=require('./writing-probe.cjs'),functional=require('./functional.cjs');
function observeFormula({theme='dark',cacheFault=false}={}){
  localStorage.setItem('vo.theme',theme);localStorage.setItem('vo.content-flight','on');
  window.__formulaQA={paints:0,draws:0,maxPerPaint:0,bounds:[],duplicate:false,startPaintCount:0};
  const clear=CanvasRenderingContext2D.prototype.clearRect,draw=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.clearRect=function(...args){
    if(this.canvas.id==='space-canvas'){window.__formulaQA.paints++;window.__formulaQA.perPaint=0;}
    return clear.apply(this,args);
  };
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
    if(this.canvas.id==='space-canvas'&&image.width===1380&&image.height===240){
      const probe=window.__formulaQA;probe.draws++;probe.perPaint=(probe.perPaint||0)+1;
      probe.maxPerPaint=Math.max(probe.maxPerPaint,probe.perPaint);probe.duplicate=probe.maxPerPaint>1;
      probe.bounds.push({route:document.body.dataset.page,x:args[0],y:args[1],width:args[2],height:args[3],viewportWidth:innerWidth,viewportHeight:innerHeight});
      if(probe.bounds.length>2000)probe.bounds.shift();
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
  }
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
  await page.evaluate(()=>{const probe=window.__formulaQA;probe.draws=0;probe.bounds=[];probe.startPaintCount=window.SiteScene.diagnostics().formula.paintCount;});
  await require('./engine-browser.cjs').settledCamera(page);return visible(page);
}
async function custom(browser,url,output){
  const captures=[],rows=[];
  for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height:width===1440?900:844}});
    await context.addInitScript(observeFormula,{theme});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{
      await page.goto(url+'/writing.html');await ready(page,'writing');const initial=await visible(page);
      const file=`writing-${width}-${theme}.png`;await page.screenshot({path:path.join(output,file)});captures.push(file);
      for(const fraction of [1,.5,0]){await page.evaluate(f=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:'instant'}),fraction);await page.waitForTimeout(450);}
      const after=await freshObservation(page);assert.equal(after.formula.cacheBuilds,1);
      let zoom;
      if(width===390){await page.evaluate(()=>document.body.style.zoom='2');zoom=await freshObservation(page);await page.screenshot({path:path.join(output,`writing-${theme}-zoom200.png`)});captures.push(`writing-${theme}-zoom200.png`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
      assert.deepEqual(errors,[]);rows.push({width,theme,initial,after,...(zoom?{zoom}:{}),errors});
    }finally{await context.close();}
  }
  const context=await browser.newContext({viewport:{width:390,height:844}});await context.addInitScript(observeFormula);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(url+'/writing.html');await ready(page,'writing');await visible(page);
    for(const route of ['research','writing','talks','writing','credits','index','writing']){
      await page.locator(`a[href="${route==='index'?'./':route+'.html'}"]`).first().evaluate(el=>el.click());await ready(page,route);
      await page.evaluate(()=>window.__formulaQA.draws=0);await page.waitForTimeout(400);
      const state=await page.evaluate(()=>({route:document.body.dataset.page,probe:window.__formulaQA,formula:window.SiteScene.diagnostics().formula}));
      assert.equal(state.probe.duplicate,false);assert.equal(state.formula.cacheBuilds,1);
      if(route==='writing')assert.ok(state.probe.draws>0);else assert.equal(state.probe.draws,0,'formula absent from settled '+route);
      rows.push({journey:route,...state});
    }
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
  const fault=await browser.newContext({viewport:{width:390,height:844}});await fault.addInitScript(observeFormula,{cacheFault:true});const fp=await fault.newPage(),faultErrors=[];fp.on('pageerror',e=>faultErrors.push(e.message));
  try{
    await fp.goto(url+'/writing.html');await ready(fp,'writing');await fp.waitForTimeout(500);
    const state=await fp.evaluate(()=>({probe:window.__formulaQA,formula:window.SiteScene.diagnostics().formula,h1:document.querySelectorAll('h1').length,ready:document.querySelector('.space-scene').dataset.ready}));
    assert.equal(state.h1,1);assert.equal(state.ready,'true');assert.ok(state.probe.paints>0);assert.equal(state.probe.draws,0);assert.equal(state.formula.failures,1);
    await fp.waitForTimeout(400);assert.equal(await fp.evaluate(()=>window.SiteScene.diagnostics().formula.failures),1);assert.deepEqual(faultErrors,[]);rows.push({cacheFault:state,errors:faultErrors});
  }finally{await fault.close();}
  return {rows,captures};
}
async function offline(browser,output){
  const directory=path.join(output,'offline');require('../../review/site-scroll-sync-20261004/export.cjs').exportVariants(directory,{variant:'color'});
  const context=await browser.newContext({viewport:{width:390,height:844}});await context.addInitScript(observeFormula);const page=await context.newPage(),requests=[],errors=[];
  page.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(pathToFileURL(path.join(directory,'Vitalii-Oborskyi-Color-Prototype.html')).href+'?view=writing');await ready(page,'writing');const observed=await visible(page);
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
module.exports={main,finiteBounds};
