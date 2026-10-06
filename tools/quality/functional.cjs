'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {toolRequire,out,report,launchOptions}=require('./common.cjs');
const pw=toolRequire('playwright'),AxeBuilder=toolRequire('@axe-core/playwright').default;
const {performance}=require('node:perf_hooks');
const {start}=require('./serve.cjs'),{routes}=require('./budgets.json');
const modes=['no-js','no-canvas','no-raf','no-match-media','blocked-storage','reduced','missing-hasOwn','css-delayed','css-blocked','draw-fault','context-loss'];
function probe(){
  const stats={paints:0,callbacks:0};window.__quality=stats;
  const raf=window.requestAnimationFrame,clear=CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect=function(...args){stats.paints++;return clear.apply(this,args);};
  window.requestAnimationFrame=fn=>raf(time=>{stats.callbacks++;fn(time);});
}
function capability(mode){
  if(mode==='no-canvas')HTMLCanvasElement.prototype.getContext=()=>null;
  if(mode==='no-raf')window.requestAnimationFrame=undefined;
  if(mode==='no-match-media')window.matchMedia=undefined;
  if(mode==='missing-hasOwn')Object.hasOwn=undefined;
  if(mode==='blocked-storage')Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Synthetic storage denial','SecurityError');}});
}
async function state(page){return page.evaluate(()=>{
  const scene=document.querySelector('.space-scene'),motion=document.querySelector('#space-motion');
  const overflow=document.documentElement.scrollWidth>innerWidth+1;
  const overflowing=overflow?[...document.querySelectorAll('body *')].filter(el=>!el.closest('.space-scene')&&el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,id:el.id,class:el.className,left:r.left,right:r.right,text:el.textContent?.trim().slice(0,70)};}).filter(r=>r.left< -1||r.right>innerWidth+1).slice(0,30):[];
  return {ready:scene.dataset.ready==='true',phase:scene.dataset.phase,camera:scene.dataset.camera,quality:scene.dataset.quality,scrollY,scrollRange:document.documentElement.scrollHeight-innerHeight,fallback:getComputedStyle(document.querySelector('.space-fallback')).visibility!=='hidden',motion:{hidden:motion.hidden,disabled:motion.disabled,label:motion.textContent},overflow,overflowing,activeElement:{tag:document.activeElement.tagName,id:document.activeElement.id,class:document.activeElement.className},h1:document.querySelectorAll('h1').length,paints:window.__quality?.paints||0,callbacks:window.__quality?.callbacks||0,visibility:{hidden:document.hidden,state:document.visibilityState,focus:document.hasFocus(),readyState:document.readyState},forwardResponse:window.__forwardCameraResponse||null,cameraSettling:window.__engineCameraSettling||null,scrollMotionPrecondition:window.__scrollMotionPrecondition||null,nextPaint:window.__nextPaintObserver||null,browserGateTrace:window.__browserGateTrace?.snapshot?.()||null};
});}
async function navigateDocument(page,url,release){
  // Attach both outcomes immediately: an early CSS assertion must not leave a
  // rejected goto promise behind when its context is subsequently closed.
  const pending=page.goto(url,{waitUntil:'load'}).then(()=>({ok:true}),error=>({ok:false,error}));
  try{
    if(release){
      await page.waitForFunction(()=>document.querySelector('.space-scene')&&document.querySelector('#space-motion')&&document.querySelector('main')&&document.querySelector('footer'),null,{polling:50,timeout:3000});
      assert.equal((await state(page)).paints,0,'no paint before valid CSS');
      await page.waitForTimeout(200);assert.equal((await state(page)).paints,0,'no paint throughout the held CSS request');release();
    }
    const result=await pending;if(!result.ok)throw result.error;
  }finally{release?.();await pending;}
}
function forwardCameraResponded(expected){
  const scene=document.querySelector('.space-scene'),probe=window.__forwardCameraResponse;
  const sample={time:performance.now()-probe.start,y:scrollY,camera:scene.dataset.camera,phase:scene.dataset.phase,quality:scene.dataset.quality,paints:window.__quality?.paints,callbacks:window.__quality?.callbacks,hidden:document.hidden};
  probe.samples.push(sample);
  const responded=Math.abs(scrollY-expected.target)<=1&&scene.dataset.camera!==expected.baseline;
  if(responded){probe.status='responded';probe.elapsedMs=sample.time;}
  return responded;
}
async function forwardCamera(page,baseline,travel){
  if(travel.range<=1||travel.target<=1)return state(page);
  await page.evaluate(({baseline,travel})=>window.__forwardCameraResponse={baseline,travel,start:performance.now(),timeoutMs:2000,status:'waiting',samples:[]},{baseline,travel});
  try{await page.waitForFunction(forwardCameraResponded,{baseline,target:travel.target},{polling:50,timeout:2000});}
  catch(error){await page.evaluate(reason=>{window.__forwardCameraResponse.status='failed';window.__forwardCameraResponse.error=reason;},error.message).catch(()=>{});throw error;}
  return state(page);
}
function nextPaintSample(before){
  const scene=document.querySelector('.space-scene'),probe=window.__nextPaintObserver;
  const sample={time:performance.now()-probe.start,y:scrollY,paints:window.__quality?.paints,callbacks:window.__quality?.callbacks,phase:scene.dataset.phase,camera:scene.dataset.camera,ready:scene.dataset.ready==='true',quality:scene.dataset.quality,motion:document.querySelector('#space-motion').textContent,hidden:document.hidden,visibility:document.visibilityState,focus:document.hasFocus()};
  probe.samples.push(sample);probe.elapsedMs=sample.time;
  if(!(sample.paints>before.paints))return false;
  probe.status='painted';return true;
}
async function nextPaintReady(page,before){
  await page.evaluate(before=>window.__nextPaintObserver={baseline:before,start:performance.now(),timeoutMs:1500,status:'sampling',samples:[]},before);
  try{await page.waitForFunction(nextPaintSample,before,{polling:50,timeout:1500});}
  catch(error){await page.evaluate(reason=>{window.__nextPaintObserver.status='failed';window.__nextPaintObserver.error=reason;},error.message).catch(()=>{});throw error;}
  return state(page);
}
async function settled(page){await page.waitForTimeout(180);return state(page);}
async function foregroundReady(page){
  await page.bringToFront();const start=Date.now();
  await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true'&&!document.hidden,null,{polling:50,timeout:3000});
  return {foreground:true,elapsedMs:Date.now()-start,timeoutMs:3000};
}
function readable(s){assert.equal(s.h1,1);assert.equal(s.overflow,false,'horizontal overflow');}
function frozen(a,b){assert.equal(b.phase,a.phase,'frozen ambient phase');assert.equal(b.camera,a.camera,'frozen camera');assert.equal(b.paints,a.paints,'no paints while frozen');assert.equal(b.callbacks,a.callbacks,'no RAF callbacks while frozen');}
async function atStart(page,camera){
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  // Timer polling must not add RAF work to the instrumented scene.
  await page.waitForFunction(expected=>scrollY===0&&document.querySelector('.space-scene').dataset.camera===expected,camera,{polling:50,timeout:3000});
  return state(page);
}
async function staticSettled(page){
  let previous=await settled(page);
  for(let i=0;i<10;i++){
    const next=await settled(page);
    if(next.paints===previous.paints&&next.callbacks===previous.callbacks)return next;
    previous=next;
  }
  throw Error('Static scene did not settle after layout');
}
async function freezeControls(page){
  await page.locator('.appearance summary').click();
  await page.locator('#space-motion').click();
  const off=await staticSettled(page);assert.match(off.motion.label,/off/);
  await page.evaluate(()=>scrollTo({top:600,behavior:'instant'}));frozen(off,await settled(page));
  await page.keyboard.press('Escape');assert.equal(await page.locator('.appearance').evaluate(el=>el.open),false);
  assert.equal(await page.locator('.appearance summary').evaluate(el=>el===document.activeElement),true);
  await page.locator('.appearance summary').click();await page.locator('#space-motion').click();
  const on=await nextPaintReady(page,off);assert.match(on.motion.label,/on/);assert.ok(on.paints>off.paints);
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
  const print=await settled(page);frozen(print,await settled(page));
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  assert.ok((await nextPaintReady(page,print)).paints>print.paints);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const hidden=await settled(page);frozen(hidden,await settled(page));
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  assert.ok((await nextPaintReady(page,hidden)).paints>hidden.paints);
}
async function archive(page){
  await page.locator('#archive-topic').selectOption('systems');await page.locator('#archive-language').selectOption('en');
  assert.ok(await page.locator('li.publication:visible').count()>0);
  await page.locator('#archive-year').selectOption('2025');await page.locator('#archive-topic').selectOption('delivery');await page.locator('#archive-language').selectOption('uk');
  assert.equal(await page.locator('#archive-empty').isVisible(),true);
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
  assert.equal(await page.locator('li.publication:visible').count(),27);
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  assert.equal(await page.locator('li.publication:visible').count(),0);
  await page.locator('.filter-reset').click();assert.equal(await page.locator('li.publication:visible').count(),27);
  await page.locator('#archive-topic').selectOption('systems');const backURL=await page.evaluate(()=>location.href);await page.locator('#archive-language').selectOption('uk');const forwardURL=await page.evaluate(()=>location.href);
  const {archiveHistoryReady}=require('./navigation.cjs');
  await page.goBack();await archiveHistoryReady(page,backURL,{topic:'systems',language:'all'});assert.equal(await page.locator('#archive-language').inputValue(),'all');
  await page.goForward();await archiveHistoryReady(page,forwardURL,{topic:'systems',language:'uk'});assert.equal(await page.locator('#archive-language').inputValue(),'uk');
}
async function ctaStates(page){
  const rows=[],buttons=page.locator('a.button');
  for(let i=0;i<await buttons.count();i++){
    const button=buttons.nth(i);
    for(const state of ['normal','hover','focus']){
      await page.mouse.move(0,0);await button.evaluate(el=>el.blur());
      if(state==='hover')await button.hover();
      if(state==='focus')await button.evaluate(el=>el.focus());
      const row=await button.evaluate(el=>{
        const css=getComputedStyle(el),rgb=v=>v.match(/[\d.]+/g).slice(0,3).map(Number);
        const luminance=c=>c.map(x=>{const v=x/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
        const foreground=rgb(css.color),background=rgb(css.backgroundColor),a=luminance(foreground),b=luminance(background);
        return {text:el.textContent.trim(),theme:document.documentElement.dataset.theme,foreground,background,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
      });
      assert.ok(row.ratio>=4.5,`CTA ${state} contrast ${row.ratio}`);rows.push({...row,state});
    }
  }
  return rows;
}
async function normalStartup(page){
  const startup=await foregroundReady(page);
  const a=await settled(page),probeStart=Date.now();readable(a);assert.equal(a.ready,true);
  // A cold engine can miss one short sampling window. Require a real next paint,
  // using bounded timer polling that does not add RAFs to the measured renderer.
  const b=await nextPaintReady(page,a),probeElapsedMs=Date.now()-probeStart;
  assert.ok(b.paints>a.paints,'positive ambient paint probe');
  assert.notEqual(b.phase,a.phase);assert.equal(b.camera,a.camera);
  return {positiveProbe:true,startup,a,b,probe:{elapsedMs:probeElapsedMs,paints:b.paints-a.paints}};
}
async function normal(page,scenario){
  const {startup,a,probe}=await normalStartup(page);
  // Safari's default macOS navigation uses Option-Tab for links.
  const keyboardShortcut=process.platform==='darwin'&&scenario.engine==='webkit'?'Alt+Tab':'Tab';
  await page.keyboard.press(keyboardShortcut);assert.equal(await page.evaluate(()=>document.activeElement.className),'skip-link','skip-link focus');
  await page.keyboard.press('Enter');assert.equal(await page.locator('#main').evaluate(el=>el===document.activeElement),true);
  await atStart(page,a.camera);
  await page.evaluate(()=>{scrollTo({top:500,behavior:'instant'});scrollTo({top:0,behavior:'instant'});});
  const reverse=await atStart(page,a.camera);assert.equal(reverse.camera,a.camera,'reverse camera endpoint');
  const travel=await page.evaluate(()=>{
    const range=document.documentElement.scrollHeight-innerHeight,rows=[...document.querySelectorAll('li.publication')].filter(el=>!el.hidden);
    // Writing's camera starts at the visible publication span, below its introduction.
    const target=rows.length?rows[0].getBoundingClientRect().top+scrollY-innerHeight*.22+(rows.at(-1).getBoundingClientRect().bottom-rows[0].getBoundingClientRect().top)*.35:range*.6;
    scrollTo({top:Math.max(0,Math.min(range,target)),behavior:'instant'});return {range,target:Math.max(0,Math.min(range,target)),y:scrollY};
  });
  const forward=await forwardCamera(page,a.camera,travel);
  if(travel.range>1&&travel.target>1){assert.ok(forward.scrollY>0,'native scroll reaches the visible journey');assert.notEqual(forward.camera,a.camera,'native forward scroll moves camera');}
  else assert.equal(forward.camera,a.camera,'short page keeps camera');
  assert.equal((await atStart(page,a.camera)).camera,a.camera,'midflight reverse endpoint');
  await freezeControls(page);
  const cta=await ctaStates(page);
  await page.locator('#theme-mode').selectOption(scenario.theme==='light'?'dark':'light');
  assert.equal(await page.locator('html').getAttribute('data-theme'),scenario.theme==='light'?'dark':'light');
  cta.push(...await ctaStates(page));
  if(scenario.route==='writing'){await require('./engine-browser.cjs').writingGestures(page);await archive(page);}
  // CSS zoom approximates layout; native browser zoom remains a separate smoke check.
  await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.equal(await page.evaluate(()=>Number(getComputedStyle(document.documentElement).zoom)),2);
  readable(await settled(page));
  await page.evaluate(()=>document.documentElement.style.zoom='');
  const scrollMotionPrecondition=await require('./engine-browser.cjs').liveScrollPrecondition(page);
  const scrollSync=await require('./scroll-browser.cjs').scenario(page,scenario.route);
  scrollSync.motionPrecondition=scrollMotionPrecondition;
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  assert.deepEqual(axe.violations,[],'axe violations');
  return {positiveProbe:true,startup,probe,off:true,print:true,syntheticVisibility:true,keyboard:true,keyboardShortcut,reverse:true,forward:travel.range>1&&travel.target>1?'camera changed':'short page',travel:{...travel,settledY:forward.scrollY},archive:scenario.route==='writing'?true:'not applicable',scrollSync,zoom:true,zoomLimit:'CSS zoom; native browser zoom untested',cta,axePasses:axe.passes.length};
}
async function failure(page,mode){
  let a=await settled(page);readable(a);
  if(['no-js','no-canvas','no-raf','no-match-media','css-blocked'].includes(mode)){
    assert.equal(a.ready,false);assert.equal(a.fallback,true);assert.equal(a.motion.hidden||a.motion.disabled,true);
    const b=await settled(page);frozen(a,b);return {fallback:true};
  }
  assert.equal(a.ready,true);
  if(mode==='reduced'){
    a=await staticSettled(page);
    assert.equal(a.motion.disabled,true);assert.match(a.motion.label,/reduced/);
    await page.evaluate(()=>scrollTo({top:600,behavior:'instant'}));frozen(a,await settled(page));return {reducedFreeze:true};
  }
  if(mode==='draw-fault')await page.evaluate(()=>CanvasRenderingContext2D.prototype.clearRect=function(){throw Error('Synthetic draw fault');});
  if(mode==='context-loss')await page.evaluate(()=>document.querySelector('canvas').dispatchEvent(new Event('contextlost')));
  if(['draw-fault','context-loss'].includes(mode)){
    await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.state==='fallback',null,{polling:50,timeout:1500});
    a=await state(page);assert.equal(a.ready,false);assert.equal(a.fallback,true);assert.equal(a.motion.disabled,true);assert.match(a.motion.label,/unavailable/);frozen(a,await settled(page));return {boundedFailure:true,synthetic:true};
  }
  assert.ok((await nextPaintReady(page,a)).paints>a.paints);return {positiveProbe:true};
}
async function scenario(browser,url,s){
  const ctx=await browser.newContext({viewport:{width:s.width,height:s.width===1440?900:844},colorScheme:s.theme==='light'?'light':'dark',javaScriptEnabled:s.mode!=='no-js',reducedMotion:s.mode==='reduced'?'reduce':'no-preference'});
  const setup=`(${probe.toString()})();(${capability.toString()})(${JSON.stringify(s.mode)});`;
  const theme=s.mode==='blocked-storage'?'':`try{localStorage.setItem('vo.theme',${JSON.stringify(s.theme)});}catch{}`;
  const trace=s.trace?`(${require('./browser-gate-trace.cjs').install.toString()})();`:'';
  await ctx.addInitScript({content:setup+theme+trace});
  const page=await ctx.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(url))external.push(r.url());});
  let release;
  if(s.mode==='css-delayed'){
    const gate=new Promise(resolve=>release=resolve);await page.route('**/styles.css',async route=>{await gate;await route.continue();});
  }
  if(s.mode==='css-blocked')await page.route('**/styles.css',r=>r.abort('failed'));
  try{
    await navigateDocument(page,`${url}/${s.route}.html`,release);
    const checks=s.mode==='normal'?await normal(page,s):await failure(page,s.mode);
    if(s.mode==='css-delayed')checks.beforeCSSNoPaint=true;
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    return {...s,pass:true,checks,errors,externalRequests:external,diagnosticTrace:s.trace?await page.evaluate(()=>window.__browserGateTrace?.snapshot?.()||null):undefined};
  }catch(e){
    if(release)release();await page.screenshot({path:path.join(out,`${s.engine}-${s.route}-${s.width}-${s.theme}-${s.mode}.png`)}).catch(()=>{});
    return {...s,pass:false,error:e.message,stack:e.stack,state:await state(page).catch(()=>null),errors,externalRequests:external,diagnosticTrace:s.trace?await page.evaluate(()=>window.__browserGateTrace?.snapshot?.()||null).catch(()=>null):undefined};
  }finally{await ctx.close();}
}
function scenarios(engine,smoke){return routes.flatMap(route=>['light','dark'].flatMap(theme=>[
  ...[1440,390].map(width=>({engine,route,theme,width,mode:'normal'})),
  ...(!smoke?modes.map(mode=>({engine,route,theme,width:320,mode})):[])
]));}
async function serialEngines(engines,run){
  const outcomes=[];
  for(const engine of engines){
    try{await run(engine);outcomes.push({status:'fulfilled'});}
    catch(reason){outcomes.push({status:'rejected',reason});}
  }
  return outcomes;
}
async function runEngine(engine,url,smoke,results){
  const {engines,rows,browsers,navigation,analytics}=results;
  const native=require('./native-display.cjs'),options=launchOptions(engine),budgetMs=options.timeout,started=performance.now();let display,browser;
  try{
    // The existing launch budget includes the display and browser together.
    // No new 3s pre-launch deadline is imposed on a cold X server.
    try{display=await native.start(engine,{timeoutMs:budgetMs});}
    catch(error){results.startupFailures.push({engine,stage:'display',budgetMs,elapsedMs:performance.now()-started,error:error.message,...error.displayDiagnostics});throw error;}
    if(display){options.headless=false;options.env={...process.env,DISPLAY:display.name};}
    options.timeout=native.remaining(started,budgetMs);
    browser=await pw[engine].launch(options);
    browsers.push({engine,version:browser.version(),executable:options.executablePath||pw[engine].executablePath(),headless:options.headless,port:display?.port||(engine==='webkit'&&process.platform==='linux'?'wpe':'native'),displayBackend:display?.backend||null,startup:{budgetMs,displayMs:display?.elapsedMs||0,totalMs:performance.now()-started}});
    try{
      for(const s of scenarios(engine,smoke)){
        const row=await scenario(browser,url,s);rows.push(row);report('functional',{smoke,engines,browsers,modes:smoke?[]:modes,rows},rows.every(x=>x.pass));
        process.stdout.write(`${engine} ${s.route} ${s.theme} ${s.width} ${s.mode}: ${row.pass?'pass':row.error}\n`);
      }
    }finally{
      const nav=require('./navigation.cjs');
      for(const s of nav.scenarios(engine)){navigation.push(await nav.scenario(browser,url,s));process.stdout.write(`navigation ${engine} ${s.width} ${s.theme}: ${navigation.at(-1).pass?'pass':navigation.at(-1).error}\n`);}
      analytics.push(...await require('./analytics-browser.cjs').run(browser,engine));
    }
  }finally{try{await browser?.close();}finally{display?.stop();}}
}
async function main(){
  const engines=(process.env.SITE_AUDIT_ENGINES||'chromium,firefox,webkit').split(','),smoke=process.argv.includes('--smoke'),rows=[],browsers=[],navigation=[],analytics=[],startupFailures=[];
  const {server,url}=await start();
  // Each engine owns the runner until its complete functional/navigation/
  // analytics lease finishes. Preserve every engine even after an earlier error.
  try{const outcomes=await serialEngines(engines,engine=>runEngine(engine,url,smoke,{engines,rows,browsers,navigation,analytics,startupFailures}));
    for(const outcome of outcomes)if(outcome.status==='rejected')throw outcome.reason;
  }finally{server.close();report('functional',{smoke,engines,browsers,modes:smoke?[]:modes,rows,navigation,analytics,startupFailures},rows.length===engines.length*scenarios(engines[0],smoke).length&&rows.every(x=>x.pass)&&navigation.length===engines.length*4&&navigation.every(x=>x.pass)&&analytics.length===engines.length*13&&analytics.every(x=>x.pass));}
  assert.ok(rows.every(x=>x.pass)&&navigation.every(x=>x.pass)&&analytics.every(x=>x.pass),'Functional scenarios failed');
}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={scenario,probe,capability,state,foregroundReady,normalStartup,scenarios,modes,navigateDocument,forwardCamera,forwardCameraResponded,nextPaintReady,nextPaintSample,serialEngines};
