'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {toolRequire,out,report,launchOptions}=require('./common.cjs');
const pw=toolRequire('playwright'),AxeBuilder=toolRequire('@axe-core/playwright').default;
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
  return {ready:scene.dataset.ready==='true',phase:scene.dataset.phase,camera:scene.dataset.camera,quality:scene.dataset.quality,scrollY,scrollRange:document.documentElement.scrollHeight-innerHeight,fallback:getComputedStyle(document.querySelector('.space-fallback')).visibility!=='hidden',motion:{hidden:motion.hidden,disabled:motion.disabled,label:motion.textContent},overflow,overflowing,activeElement:{tag:document.activeElement.tagName,id:document.activeElement.id,class:document.activeElement.className},h1:document.querySelectorAll('h1').length,paints:window.__quality?.paints||0,callbacks:window.__quality?.callbacks||0};
});}
async function settled(page){await page.waitForTimeout(180);return state(page);}
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
  const on=await settled(page);assert.match(on.motion.label,/on/);assert.ok(on.paints>off.paints);
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
  const print=await settled(page);frozen(print,await settled(page));
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  assert.ok((await settled(page)).paints>print.paints);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const hidden=await settled(page);frozen(hidden,await settled(page));
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  assert.ok((await settled(page)).paints>hidden.paints);
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
  await page.locator('#archive-topic').selectOption('systems');await page.locator('#archive-language').selectOption('uk');
  await page.goBack();assert.equal(await page.locator('#archive-language').inputValue(),'all');
  await page.goForward();assert.equal(await page.locator('#archive-language').inputValue(),'uk');
}
async function normal(page,scenario){
  const a=await settled(page),probeStart=Date.now();readable(a);assert.equal(a.ready,true);
  // A cold engine can miss one short sampling window. Require a real next paint,
  // using bounded timer polling that does not add RAFs to the measured renderer.
  await page.waitForFunction(before=>window.__quality.paints>before,a.paints,{polling:50,timeout:1500});
  const b=await state(page),probeElapsedMs=Date.now()-probeStart;
  assert.ok(b.paints>a.paints,'positive ambient paint probe');
  assert.notEqual(b.phase,a.phase);assert.equal(b.camera,a.camera);
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
  const forward=await settled(page);
  if(travel.range>1&&travel.target>1){assert.ok(forward.scrollY>0,'native scroll reaches the visible journey');assert.notEqual(forward.camera,a.camera,'native forward scroll moves camera');}
  else assert.equal(forward.camera,a.camera,'short page keeps camera');
  assert.equal((await atStart(page,a.camera)).camera,a.camera,'midflight reverse endpoint');
  await freezeControls(page);
  await page.locator('#theme-mode').selectOption(scenario.theme==='light'?'dark':'light');
  assert.equal(await page.locator('html').getAttribute('data-theme'),scenario.theme==='light'?'dark':'light');
  if(scenario.route==='writing')await archive(page);
  // CSS zoom approximates layout; native browser zoom remains a separate smoke check.
  await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.equal(await page.evaluate(()=>Number(getComputedStyle(document.documentElement).zoom)),2);
  readable(await settled(page));
  await page.evaluate(()=>document.documentElement.style.zoom='');
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  assert.deepEqual(axe.violations,[],'axe violations');
  return {positiveProbe:true,probe:{elapsedMs:probeElapsedMs,paints:b.paints-a.paints},off:true,print:true,syntheticVisibility:true,keyboard:true,keyboardShortcut,reverse:true,forward:travel.range>1&&travel.target>1?'camera changed':'short page',travel:{...travel,settledY:forward.scrollY},archive:scenario.route==='writing'?true:'not applicable',zoom:true,zoomLimit:'CSS zoom; native browser zoom untested',axePasses:axe.passes.length};
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
    a=await settled(page);assert.equal(a.ready,false);assert.equal(a.fallback,true);assert.equal(a.motion.disabled,true);assert.match(a.motion.label,/unavailable/);frozen(a,await settled(page));return {boundedFailure:true,synthetic:true};
  }
  assert.ok((await settled(page)).paints>a.paints);return {positiveProbe:true};
}
async function scenario(browser,url,s){
  const ctx=await browser.newContext({viewport:{width:s.width,height:s.width===1440?900:844},colorScheme:s.theme==='light'?'light':'dark',javaScriptEnabled:s.mode!=='no-js',reducedMotion:s.mode==='reduced'?'reduce':'no-preference'});
  const setup=`(${probe.toString()})();(${capability.toString()})(${JSON.stringify(s.mode)});`;
  const theme=s.mode==='blocked-storage'?'':`try{localStorage.setItem('vo.theme',${JSON.stringify(s.theme)});}catch{}`;
  await ctx.addInitScript({content:setup+theme});
  const page=await ctx.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(url))external.push(r.url());});
  let release;
  if(s.mode==='css-delayed'){
    const gate=new Promise(resolve=>release=resolve);await page.route('**/styles.css',async route=>{await gate;await route.continue();});
  }
  if(s.mode==='css-blocked')await page.route('**/styles.css',r=>r.abort('failed'));
  try{
    const navigation=page.goto(`${url}/${s.route}.html`,{waitUntil:'load'});
    if(release){await page.waitForTimeout(200);assert.equal((await state(page)).paints,0,'no paint before valid CSS');release();}
    await navigation;
    const checks=s.mode==='normal'?await normal(page,s):await failure(page,s.mode);
    if(s.mode==='css-delayed')checks.beforeCSSNoPaint=true;
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    return {...s,pass:true,checks,errors,externalRequests:external};
  }catch(e){
    if(release)release();await page.screenshot({path:path.join(out,`${s.engine}-${s.route}-${s.width}-${s.theme}-${s.mode}.png`)}).catch(()=>{});
    return {...s,pass:false,error:e.message,stack:e.stack,state:await state(page).catch(()=>null),errors,externalRequests:external};
  }finally{await ctx.close();}
}
function scenarios(engine,smoke){return routes.flatMap(route=>['light','dark'].flatMap(theme=>[
  ...[1440,390].map(width=>({engine,route,theme,width,mode:'normal'})),
  ...(!smoke?modes.map(mode=>({engine,route,theme,width:320,mode})):[])
]));}
async function main(){
  const engines=(process.env.SITE_AUDIT_ENGINES||'chromium,firefox,webkit').split(','),smoke=process.argv.includes('--smoke'),rows=[],browsers=[];
  const {server,url}=await start();
  try{for(const engine of engines){
    const options=launchOptions(engine),browser=await pw[engine].launch(options);browsers.push({engine,version:browser.version(),executable:options.executablePath||pw[engine].executablePath()});
    try{for(const s of scenarios(engine,smoke)){rows.push(await scenario(browser,url,s));report('functional',{smoke,engines,browsers,modes:smoke?[]:modes,rows},rows.every(x=>x.pass));process.stdout.write(`${engine} ${s.route} ${s.theme} ${s.width} ${s.mode}: ${rows.at(-1).pass?'pass':rows.at(-1).error}\n`);}}
    finally{await browser.close();}
  }}finally{server.close();report('functional',{smoke,engines,browsers,modes:smoke?[]:modes,rows},rows.length===engines.length*scenarios(engines[0],smoke).length&&rows.every(x=>x.pass));}
  assert.ok(rows.every(x=>x.pass),'Functional scenarios failed');
}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={scenarios,modes};
