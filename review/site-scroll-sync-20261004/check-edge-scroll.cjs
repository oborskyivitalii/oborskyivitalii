'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const {settledCamera}=require('../../tools/quality/engine-browser.cjs');
const routes=['index','research','writing','talks'];
async function ready(page,route){
  await page.waitForFunction(route=>document.body.dataset.page===route&&!document.getElementById('site-content').hasAttribute('aria-busy'),route,{timeout:7000,polling:40});
  if(await page.evaluate(()=>window.SiteScene.canTravel()))await settledCamera(page);
}
async function edge(page,top){
  await page.evaluate(top=>scrollTo({top:top?0:document.documentElement.scrollHeight-innerHeight,behavior:'instant'}),top);
  if(await page.evaluate(()=>window.SiteScene.canTravel()))await settledCamera(page);await page.waitForTimeout(1000);
}
async function move(page,route){await page.locator('a[href="?view='+route+'"]').first().evaluate(el=>el.click());await ready(page,route);}
async function atEnd(page){const range=await page.evaluate(()=>({top:scrollY,max:Math.max(0,document.documentElement.scrollHeight-innerHeight),route:document.body.dataset.page}));assert.ok(Math.abs(range.top-range.max)<=2,'previous route lands at its actual bottom: '+JSON.stringify(range));return range;}
async function swipe(cdp,points){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:points[0]}]});for(const y of points.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
(async()=>{
  const file=path.resolve(process.argv[2]),directory=path.resolve(process.argv[3]);fs.mkdirSync(directory,{recursive:true});
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
  const record={source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),browser:browser.version(),profiles:[]};
  try{for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},hasTouch:true,offline:true});
    await context.addInitScript(()=>{localStorage.setItem('vo.theme','dark');});
    const page=await context.newPage(),errors=[],network=[],cases=[],landings=[];page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
    const cdp=await context.newCDPSession(page);await page.goto(pathToFileURL(file).href+'?view=talks');await ready(page,'talks');
    await page.evaluate(()=>{window.__edgeShell={header:document.querySelector('header'),canvas:document.querySelector('canvas')};});
    await page.mouse.move(width/2,500);
    for(let i=3;i>0;i--){
      await edge(page,true);await page.mouse.wheel(0,-200);await ready(page,routes[i-1]);landings.push({from:routes[i],to:routes[i-1],...await atEnd(page)});
      await page.mouse.wheel(0,-200);await page.waitForTimeout(150);assert.equal(await page.locator('body').getAttribute('data-page'),routes[i-1],'wheel tail cannot skip a second route');
    }
    cases.push('reverse wheel crosses all three primary route boundaries and preserves bottom landings');
    await edge(page,true);await page.mouse.wheel(0,-600);await page.waitForTimeout(250);assert.equal(await page.locator('body').getAttribute('data-page'),'index');cases.push('Home does not wrap upward');
    await move(page,'research');await page.evaluate(()=>scrollTo({top:24,behavior:'instant'}));await page.waitForTimeout(1000);
    await page.mouse.wheel(0,-200);await page.waitForTimeout(60);for(let i=0;i<3;i++){await page.mouse.wheel(0,-80);await page.waitForTimeout(50);}
    assert.equal(await page.locator('body').getAttribute('data-page'),'research');assert.equal(await page.evaluate(()=>scrollY),0);cases.push('wheel reaching the top plus inertia stays in the current route');
    await page.waitForTimeout(300);await page.mouse.wheel(0,-200);await ready(page,'index');await atEnd(page);cases.push('fresh upward wheel continues to the previous route');
    await move(page,'research');await edge(page,true);
    await page.evaluate(()=>{const el=document.createElement('div');el.id='nested-edge';el.style.cssText='position:fixed;left:80px;top:300px;width:200px;height:100px;overflow-y:scroll;z-index:10';const inner=document.createElement('div');inner.style.height='600px';inner.textContent='Native nested scroll';el.append(inner);document.body.append(el);el.scrollTop=200;});
    await page.mouse.move(180,350);await page.mouse.wheel(0,-200);await page.waitForTimeout(250);assert.ok(await page.locator('#nested-edge').evaluate(el=>el.scrollTop<200));assert.equal(await page.locator('body').getAttribute('data-page'),'research');
    await page.mouse.wheel(0,-200);await page.waitForTimeout(250);assert.equal(await page.locator('body').getAttribute('data-page'),'research');await page.locator('#nested-edge').evaluate(el=>el.remove());cases.push('nested scrolling stays native even at its own top');
    await edge(page,true);await page.evaluate(()=>document.querySelector('.appearance').open=true);await page.mouse.move(width/2,500);await page.mouse.wheel(0,-500);await page.waitForTimeout(250);assert.equal(await page.locator('body').getAttribute('data-page'),'research');cases.push('open appearance controls block reverse continuation');
    await page.locator('#end-scroll').evaluate(el=>el.click());await page.evaluate(()=>document.querySelector('.appearance').open=false);await edge(page,true);await page.locator('main').focus();await page.keyboard.press('PageUp');await page.waitForTimeout(250);assert.equal(await page.locator('body').getAttribute('data-page'),'research');
    const saved=await page.evaluate(()=>({checked:document.getElementById('end-scroll').checked,value:localStorage.getItem('vo.end-scroll'),url:location.href}));
    assert.equal(saved.checked,false,JSON.stringify(saved));assert.equal(saved.value,'off',JSON.stringify(saved));
    await page.reload();await ready(page,'research');const restored=await page.evaluate(()=>({checked:document.getElementById('end-scroll').checked,value:localStorage.getItem('vo.end-scroll'),url:location.href}));
    assert.equal(restored.checked,false,JSON.stringify({saved,restored}));await page.locator('#end-scroll').evaluate(el=>el.click());
    await page.evaluate(()=>{window.__edgeShell={header:document.querySelector('header'),canvas:document.querySelector('canvas')};});cases.push('Off blocks reverse and survives reload');
    await edge(page,true);await page.locator('main').focus();await page.keyboard.press('PageUp');await ready(page,'index');await atEnd(page);cases.push('PageUp continues upward at the top');
    await move(page,'writing');await edge(page,true);await page.locator('main').focus();for(let i=0;i<3;i++)await page.keyboard.press('ArrowUp');assert.equal(await page.locator('body').getAttribute('data-page'),'writing');await page.keyboard.press('ArrowUp');await ready(page,'research');await atEnd(page);cases.push('four separate ArrowUp presses are deliberate continuation');
    await move(page,'talks');await edge(page,true);await page.locator('main').focus();await page.keyboard.press('Shift+Space');await ready(page,'writing');await atEnd(page);cases.push('Shift+Space continues upward');
    await edge(page,true);await page.goBack();await ready(page,'talks');assert.equal(await page.evaluate(()=>scrollY),0);await page.goForward();await ready(page,'writing');assert.equal(await page.evaluate(()=>scrollY),0,'Forward retains the subsequently saved reading position');cases.push('Back/Forward preserve real positions after reverse navigation');
    await move(page,'research');await page.evaluate(()=>scrollTo({top:24,behavior:'instant'}));await page.waitForTimeout(1000);await swipe(cdp,[320,355,395,435]);await page.waitForTimeout(300);assert.equal(await page.locator('body').getAttribute('data-page'),'research');assert.equal(await page.evaluate(()=>scrollY),0);cases.push('one touch arriving at the top cannot navigate in the same gesture');
    await edge(page,true);await swipe(cdp,[320,355,395,435]);await ready(page,'index');await atEnd(page);cases.push('a new downward finger gesture at the top navigates backward');
    await move(page,'talks');await page.locator('#space-motion').evaluate(el=>el.click());await edge(page,true);const phase=await page.locator('.space-scene').getAttribute('data-phase');
    await cdp.send('HeapProfiler.collectGarbage');const beforeTouch=await cdp.send('Memory.getDOMCounters');
    const target=(await cdp.send('Runtime.evaluate',{expression:'document.elementFromPoint(190,320)',objectGroup:'edge-gesture'})).result.objectId;
    assert.ok(target,'original touch target');
    const targetListeners=async()=>((await cdp.send('DOMDebugger.getEventListeners',{objectId:target})).listeners.map(({type,useCapture,passive,once})=>({type,useCapture,passive,once}))).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    const beforeTargetListeners=await targetListeners();
    // Keep moving after the accepted threshold: the remaining gesture must not
    // scroll the newly mounted page when navigation is instantaneous.
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:320}]});for(const y of [355,395,435,475,515,555])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ready(page,'writing');await atEnd(page);await page.waitForTimeout(250);
    assert.equal(await page.locator('.space-scene').getAttribute('data-phase'),phase);const bitmap=await page.locator('canvas').evaluate(el=>el.toDataURL());await page.waitForTimeout(180);
    assert.equal(crypto.createHash('sha256').update(await page.locator('canvas').evaluate(el=>el.toDataURL())).digest('hex'),crypto.createHash('sha256').update(bitmap).digest('hex'));
    const afterTargetListeners=await targetListeners();assert.deepEqual(afterTargetListeners,beforeTargetListeners,'temporary listeners are released from the same original target');
    await cdp.send('Runtime.releaseObjectGroup',{objectGroup:'edge-gesture'});
    // Talks and Writing own different permanent archive listeners. Their global
    // counts are recorded, while gesture cleanup is checked on the same target.
    await cdp.send('HeapProfiler.collectGarbage');const afterTouch=await cdp.send('Memory.getDOMCounters');cases.push('Motion Off preserves phase, consumes the whole touch and freezes the static destination');
    await page.emulateMedia({reducedMotion:'reduce'});await edge(page,true);await page.locator('main').focus();await page.keyboard.press('PageUp');await ready(page,'research');await atEnd(page);await page.waitForTimeout(200);const reduced=await page.locator('canvas').evaluate(el=>el.toDataURL());await page.waitForTimeout(180);
    assert.equal(crypto.createHash('sha256').update(await page.locator('canvas').evaluate(el=>el.toDataURL())).digest('hex'),crypto.createHash('sha256').update(reduced).digest('hex'));assert.equal(await page.locator('.space-scene').getAttribute('data-phase'),phase);cases.push('reduced motion reverse is immediate and its static destination stays frozen');
    const shell=await page.evaluate(()=>({same:document.querySelector('header')===window.__edgeShell.header&&document.querySelector('canvas')===window.__edgeShell.canvas,main:document.querySelectorAll('main').length,loops:document.getElementById('site-content').inert,material:document.documentElement.dataset.surface}));
    assert.equal(shell.same,true);assert.equal(shell.main,1);assert.equal(shell.loops,false);assert.equal(shell.material,undefined);assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
    await page.screenshot({path:path.join(directory,'reverse-'+width+'.png')});
    record.profiles.push({width,cases,landings,shell,beforeTouch,afterTouch,beforeTargetListeners,afterTargetListeners,errors,network});fs.writeFileSync(path.join(directory,'edge-scroll.json'),JSON.stringify(record,null,2));console.log(JSON.stringify({width,cases:cases.length,landings}));await context.close();
  }}finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
