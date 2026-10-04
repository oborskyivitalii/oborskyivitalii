'use strict';
const assert=require('node:assert/strict');
const routes=['index','research','writing','talks','credits'];
const checks=['persistentShell','fiveRoutes','metadata','forward','backward','history','archiveLifecycle','rapidNavigation','off','reduced','fetchFallback'];
const selector=route=>`a[href="${route==='index'?'./':route+'.html'}"]`;
async function ready(page,route){
  await page.waitForFunction(route=>document.body.dataset.page===route&&!document.querySelector('#site-content').hasAttribute('aria-busy'),route,{polling:40,timeout:6000});
}
async function settled(page){
  await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.travel==='settled',null,{polling:50,timeout:4000});
}
async function click(page,route){await page.locator(selector(route)).first().evaluate(el=>el.click());await ready(page,route);}
async function scenario(browser,url,s){
  const ctx=await browser.newContext({viewport:{width:s.width,height:s.width===390?844:900}}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await ctx.addInitScript(theme=>localStorage.setItem('vo.theme',theme),s.theme);
  if(process.env.SITE_NAVIGATION_PROBE==='true')await ctx.addInitScript(()=>{
    const raf=window.requestAnimationFrame;window.__navigationFrames=[];
    window.requestAnimationFrame=fn=>raf(time=>{const start=performance.now();fn(time);window.__navigationFrames.push(performance.now()-start);if(window.__navigationFrames.length>128)window.__navigationFrames.shift();});
  });
  const result={...s,pass:false,checks:{},errors};
  try {
    await page.goto(url+'/index.html');
    await page.bringToFront();
    await page.waitForFunction(()=>window.SiteNavigation&&document.querySelector('.space-scene').dataset.ready==='true',null,{polling:50,timeout:4000});
    await page.evaluate(()=>{window.__shell={header:document.querySelector('header'),canvas:document.querySelector('canvas'),theme:document.querySelector('#theme-mode'),document};});
    const initial=await page.locator('.space-scene').getAttribute('data-camera');
    for(const route of routes.slice(1)){
      await click(page,route);await settled(page);
      const state=await page.evaluate(()=>({page:document.body.dataset.page,title:document.title,description:document.querySelector('meta[name="description"]').content,h1:document.querySelectorAll('h1').length,focus:document.activeElement.id,rooms:+document.querySelector('.space-scene').dataset.rooms,direction:document.querySelector('.space-scene').dataset.direction,same:window.__shell.header===document.querySelector('header')&&window.__shell.canvas===document.querySelector('canvas')&&window.__shell.theme===document.querySelector('#theme-mode')&&window.__shell.document===document}));
      assert.equal(state.page,route);assert.ok(state.title.toLowerCase().includes(route==='credits'?'credits':route));assert.ok(state.description.length>20);assert.equal(state.h1,1);assert.equal(state.focus,'main');assert.equal(state.same,true);assert.ok(state.rooms<=3);assert.equal(state.direction,'forward');assert.equal(new URL(page.url()).pathname,'/'+route+'.html');
    }
    Object.assign(result.checks,{persistentShell:true,fiveRoutes:true,metadata:true,forward:true});
    await click(page,'index');await settled(page);assert.equal(await page.locator('.space-scene').getAttribute('data-camera'),initial);assert.equal(await page.locator('.space-scene').getAttribute('data-direction'),'backward');result.checks.backward=true;
    await page.goBack();await ready(page,'credits');await settled(page);await page.goForward();await ready(page,'index');await settled(page);result.checks.history=true;
    await page.locator('#space-motion').evaluate(el=>el.click());
    for(const route of ['writing','research','writing'])await click(page,route);
    await page.locator('#archive-topic').selectOption('systems');await page.locator('#archive-language').selectOption('uk');
    await page.goBack();assert.equal(await page.locator('#archive-language').inputValue(),'all');await page.goForward();assert.equal(await page.locator('#archive-language').inputValue(),'uk');
    await click(page,'talks');await page.goBack();await ready(page,'writing');assert.equal(await page.locator('#archive-topic').inputValue(),'systems');assert.equal(await page.locator('#archive-language').inputValue(),'uk');
    await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));assert.equal(await page.locator('li.publication:visible').count(),27);await page.evaluate(()=>dispatchEvent(new Event('afterprint')));assert.ok(await page.locator('li.publication:visible').count()<27);result.checks.archiveLifecycle=true;
    await click(page,'index');
    const frozen=await page.locator('.space-scene').getAttribute('data-phase');await page.waitForTimeout(200);assert.equal(await page.locator('.space-scene').getAttribute('data-phase'),frozen);assert.equal(await page.locator('.space-scene').getAttribute('data-travel'),'settled');result.checks.off=true;
    await page.locator('#space-motion').evaluate(el=>el.click());
    await page.evaluate(()=>{document.querySelector('header a[href="research.html"]').click();document.querySelector('header a[href="writing.html"]').click();document.querySelector('header a[href="talks.html"]').click();});
    await ready(page,'talks');await settled(page);await page.waitForTimeout(200);assert.equal(await page.locator('body').getAttribute('data-page'),'talks');result.checks.rapidNavigation=true;
    await page.emulateMedia({reducedMotion:'reduce'});await click(page,'research');await settled(page);const reduced=await page.locator('.space-scene').getAttribute('data-camera');await page.waitForTimeout(220);assert.equal(await page.locator('.space-scene').getAttribute('data-camera'),reduced);assert.match(await page.locator('#space-motion').textContent(),/reduced/);result.checks.reduced=true;
    // An uncached fetch fails once, then the ordinary destination document opens.
    await page.goto(url+'/index.html');
    await page.route('**/research.html',route=>route.request().resourceType()==='fetch'?route.fulfill({status:503,contentType:'text/plain',body:'Controlled unavailable route'}):route.continue());
    await page.locator(selector('research')).first().click();await page.waitForURL('**/research.html');await page.waitForFunction(()=>document.body.dataset.page==='research');result.checks.fetchFallback=true;
    assert.deepEqual(errors,[]);result.pass=checks.every(key=>result.checks[key]===true);
  }catch(error){
    result.error=error.message;result.stack=error.stack;
    result.state=await page.evaluate(()=>({page:document.body.dataset.page,url:location.href,hidden:document.hidden,scene:{...document.querySelector('.space-scene').dataset},motion:document.querySelector('#space-motion').textContent,busy:document.querySelector('#site-content')?.hasAttribute('aria-busy'),scrollY,frames:window.__navigationFrames||[]})).catch(()=>null);
  }
  finally{await ctx.close();}
  return result;
}
function scenarios(engine){return [1440,390].flatMap(width=>['light','dark'].map(theme=>({engine,width,theme})));}
module.exports={scenario,scenarios,checks};
if(require.main===module)(async()=>{
  const {toolRequire,launchOptions,report}=require('./common.cjs'),{start}=require('./serve.cjs');
  const {server,url}=await start(),browser=await toolRequire('playwright').firefox.launch(launchOptions('firefox'));
  try{const row=await scenario(browser,url,{engine:'firefox',width:1440,theme:'light'});report('navigation-diagnostic',{browser:browser.version(),row},row.pass);console.log(JSON.stringify(row,null,2));assert.equal(row.pass,true);}
  finally{await browser.close();server.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
