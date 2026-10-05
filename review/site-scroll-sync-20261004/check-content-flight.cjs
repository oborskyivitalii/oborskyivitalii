'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const {settledCamera}=require('../../tools/quality/engine-browser.cjs');
const routes=['index','research','writing','talks','credits'];
async function ready(page,route){
  await page.waitForFunction(route=>document.body.dataset.page===route&&!document.getElementById('site-content').hasAttribute('aria-busy'),route,{timeout:6000});
  if(await page.evaluate(()=>window.SiteScene.canTravel()))await settledCamera(page);
}
function probe(){
  const raf=requestAnimationFrame;window.__lastFlightClock=0;
  window.requestAnimationFrame=callback=>raf(time=>{const clock=window.__stopFlightClock??time;window.__lastFlightClock=clock;callback(clock);});
  window.__planeSamples=[];
  new MutationObserver(()=>{
    const scene=document.querySelector('.space-scene'),plane=document.getElementById('site-content');
    if(!plane?.hasAttribute('aria-busy'))return;
    const progress=Number(scene.dataset.progress),rect=plane.getBoundingClientRect();
    window.__planeSamples.push({progress,page:document.body.dataset.page,stage:plane.dataset.flightStage,z:Number(plane.dataset.flightDepth||0),opacity:Number(getComputedStyle(plane).opacity),width:rect.width,range:document.documentElement.scrollHeight-innerHeight,top:scrollY});
    if(window.__pauseAt&&progress>=window.__pauseAt&&progress<1)window.__stopFlightClock=window.__lastFlightClock;
  }).observe(document,{subtree:true,attributes:true,attributeFilter:['data-progress']});
}
async function click(page,route){await page.locator('a[href="?view='+route+'"]').first().evaluate(el=>el.click());await ready(page,route);}
async function transition(page,route,from){
  const before=await page.evaluate(()=>({width:document.getElementById('site-content').getBoundingClientRect().width,range:document.documentElement.scrollHeight-innerHeight}));
  await page.evaluate(()=>{window.__planeSamples=[];});await click(page,route);
  const samples=await page.evaluate(()=>window.__planeSamples),exit=samples.filter(s=>s.stage==='depart'&&s.page===from&&s.progress<.46),entry=samples.filter(s=>s.stage==='arrive'&&s.page===route);
  assert.ok(exit.length>2&&entry.length>2,'actual departure and arrival paints');
  assert.ok(exit.every(s=>s.range===before.range),'the moving plane preserves native departure scroll range');
  const direction=routes.indexOf(route)>routes.indexOf(from)?'forward':'backward';
  assert.ok(exit.some(s=>direction==='forward'?s.width>before.width*1.5:s.width<before.width*.7),'forward current page enlarges past the viewer; reverse recedes');
  assert.ok(entry.some(s=>direction==='forward'?s.width<before.width*.7:s.width>before.width*1.5),'forward next page emerges from distance; reverse enters from the near side');
  assert.ok(entry.some(s=>s.opacity>0&&s.opacity<1),'new content approaches through fog');
  const final=await page.evaluate(()=>({style:document.getElementById('site-content').style.cssText,inert:document.getElementById('site-content').inert,main:document.querySelectorAll('main').length,focus:document.activeElement.id,h1:document.querySelectorAll('h1').length,same:window.__shell.canvas===document.querySelector('canvas')&&window.__shell.header===document.querySelector('header')}));
  assert.equal(final.style,'');assert.equal(final.inert,false);assert.equal(final.main,1);assert.equal(final.h1,1);assert.equal(final.focus,'main');assert.equal(final.same,true);
  return {from,route,direction,before,samples,final};
}
async function bottom(page){await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'instant'}));if(await page.evaluate(()=>window.SiteScene.canTravel()))await settledCamera(page);await page.waitForTimeout(800);}
async function pauseCapture(page,route,progress,file){
  await page.evaluate(progress=>{window.__pauseAt=progress;window.__stopFlightClock=undefined;},progress);
  await page.locator('header a[href="?view='+route+'"]').first().evaluate(el=>el.click());
  await page.waitForFunction(()=>window.__stopFlightClock!==undefined,null,{timeout:5000});
  await page.screenshot({path:file});
  const state=await page.evaluate(()=>window.__planeSamples.at(-1));
  await page.evaluate(()=>{window.__pauseAt=null;window.__stopFlightClock=undefined;});await ready(page,route);return state;
}
async function main(file,directory,mode='full'){
  assert.ok(file&&directory,'provide HTML and an explicit output directory');fs.mkdirSync(directory,{recursive:true});
  assert.ok(['full','inputs'].includes(mode),'full or inputs mode');
  const bytes=fs.readFileSync(file),rows=[],screens=[],inputCases=[];
  const browser=await toolRequire('playwright').chromium.launch({...launchOptions('chromium'),...(process.env.SITE_BROWSER_EXECUTABLE?{executablePath:process.env.SITE_BROWSER_EXECUTABLE}:{})});
  try{
    for(const width of mode==='inputs'?[]:[1440,390])for(const theme of ['light','dark']){
      const context=await browser.newContext({viewport:{width,height:width===390?844:900},hasTouch:width===390,offline:true});
      await context.addInitScript(probe);await context.addInitScript(theme=>localStorage.setItem('vo.theme',theme),theme);
      const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
      await page.goto(pathToFileURL(file).href);await ready(page,'index');
      await page.evaluate(()=>{window.__shell={header:document.querySelector('header'),canvas:document.querySelector('canvas')};});
      for(let i=1;i<routes.length;i++){
        await bottom(page);rows.push({width,theme,...await transition(page,routes[i],routes[i-1])});
      }
      rows.push({width,theme,...await transition(page,'index','credits')});
      await click(page,'research');await bottom(page);const saved=await page.evaluate(()=>scrollY);
      await click(page,'writing');await page.goBack();await ready(page,'research');assert.equal(await page.evaluate(()=>scrollY),saved,'history restores actual reading position');
      await page.goForward();await ready(page,'writing');await page.reload();await ready(page,'writing');
      await click(page,'index');await bottom(page);
      screens.push({width,theme,kind:'forward-depart',state:await pauseCapture(page,'research',.2,path.join(directory,'forward-depart-'+width+'-'+theme+'.png'))});
      screens.push({width,theme,kind:'forward-arrive',state:await pauseCapture(page,'writing',.68,path.join(directory,'forward-arrive-'+width+'-'+theme+'.png'))});
      screens.push({width,theme,kind:'backward-depart',state:await pauseCapture(page,'research',.2,path.join(directory,'backward-depart-'+width+'-'+theme+'.png'))});
      screens.push({width,theme,kind:'backward-arrive',state:await pauseCapture(page,'index',.68,path.join(directory,'backward-arrive-'+width+'-'+theme+'.png'))});
      assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();console.log('direction/history/actual-plane',width,theme,'pass');
    }
    const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,offline:true}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(file).href);await ready(page,'index');
    await page.mouse.move(190,400);await page.mouse.wheel(0,200);await page.waitForTimeout(350);assert.equal(await page.locator('body').getAttribute('data-page'),'index');assert.ok(await page.evaluate(()=>scrollY>0),'ordinary wheel changes native offset');inputCases.push('ordinary wheel remains native');
    await bottom(page);await page.evaluate(()=>{const el=document.createElement('div');el.id='nested-scroll-check';el.style.cssText='position:fixed;left:80px;top:300px;width:200px;height:100px;overflow-y:scroll;z-index:10';el.innerHTML='<div style="height:600px">Nested native scroll</div>';document.body.append(el);});
    await page.mouse.move(190,350);await page.mouse.wheel(0,180);await page.waitForTimeout(250);assert.ok(await page.locator('#nested-scroll-check').evaluate(el=>el.scrollTop>0));assert.equal(await page.locator('body').getAttribute('data-page'),'index');await page.locator('#nested-scroll-check').evaluate(el=>el.remove());inputCases.push('nested wheel scrolling stays native');
    await bottom(page);await page.mouse.move(190,780);await page.mouse.wheel(0,200);await ready(page,'research');inputCases.push('additional wheel advances once');
    await page.mouse.wheel(0,1000);await page.waitForTimeout(200);assert.equal(await page.locator('body').getAttribute('data-page'),'research');inputCases.push('wheel tail cannot skip a route');
    await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight-innerHeight-24,behavior:'instant'}));await page.waitForTimeout(850);const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:700}]});for(const y of [665,625,585])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
    assert.equal(await page.locator('body').getAttribute('data-page'),'research');assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight-scrollY<=2));inputCases.push('touch reaching the bottom does not navigate within the same gesture');
    await bottom(page);await page.evaluate(()=>document.querySelector('.appearance').open=true);await page.mouse.wheel(0,500);await page.waitForTimeout(300);assert.equal(await page.locator('body').getAttribute('data-page'),'research');inputCases.push('open settings block continuation');
    await page.locator('#end-scroll').evaluate(el=>el.click());await page.evaluate(()=>document.querySelector('.appearance').open=false);await page.waitForTimeout(800);await page.mouse.wheel(0,500);await page.waitForTimeout(300);assert.equal(await page.locator('body').getAttribute('data-page'),'research');
    await page.reload();await ready(page,'research');assert.equal(await page.locator('#end-scroll').isChecked(),false);inputCases.push('Off preference persists');
    await page.locator('#end-scroll').evaluate(el=>el.click());await bottom(page);await page.locator('main').focus();await page.keyboard.press('PageDown');await ready(page,'writing');inputCases.push('explicit keyboard continuation');
    await page.locator('#space-motion').evaluate(el=>el.click());await bottom(page);
    const frozenPhase=await page.locator('.space-scene').getAttribute('data-phase');
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:700}]});
    for(const y of [665,625,585])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ready(page,'talks');
    assert.equal(await page.locator('.space-scene').getAttribute('data-phase'),frozenPhase);assert.equal(await page.evaluate(()=>scrollY),0,'touch lands at the opening');
    await page.waitForTimeout(180);const frozen=await page.locator('canvas').evaluate(el=>el.toDataURL());await page.waitForTimeout(180);
    assert.equal(crypto.createHash('sha256').update(await page.locator('canvas').evaluate(el=>el.toDataURL())).digest('hex'),crypto.createHash('sha256').update(frozen).digest('hex'),'new route remains frozen');
    inputCases.push('touch continuation with Motion Off, frozen phase and static destination');
    await page.emulateMedia({reducedMotion:'reduce'});await bottom(page);await page.locator('main').focus();await page.keyboard.press('PageDown');await ready(page,'credits');assert.equal(await page.evaluate(()=>scrollY),0);inputCases.push('reduced motion continuation is immediate');
    await bottom(page);await page.mouse.wheel(0,1000);await page.waitForTimeout(300);assert.equal(await page.locator('body').getAttribute('data-page'),'credits');assert.equal(await page.locator('.scroll-continue').count(),0);inputCases.push('final route does not wrap');
    assert.deepEqual(errors,[]);await context.close();
    const result={source:crypto.createHash('sha256').update(bytes).digest('hex'),browser:browser.version(),rows,screens,inputCases};
    fs.writeFileSync(path.join(directory,mode==='inputs'?'content-inputs.json':'content-flight.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({flights:rows.length,phaseScreens:screens.length,inputCases,source:result.source}));
  }finally{await browser.close();}
}
if(require.main===module)main(process.argv[2],process.argv[3],process.argv[4]).catch(e=>{console.error(e.stack);process.exitCode=1;});
