'use strict';
const assert=require('node:assert/strict');
const routes=['index','research','writing','talks','credits'];
const checks=['persistentShell','fiveRoutes','metadata','forward','backward','history','historyScroll','archiveLifecycle','rapidNavigation','off','reduced','fetchFallback','headerEdges','flightTiming','earlyScroll','interruptions','retargetOpacity','writingFirstScroll','fullScrollArrival','snapshotPin','versionFallback','digestFallback','offlineEntries','utilityNoFlight','reverseEndpoint','endpointTakeover'];
const selector=route=>`a[href="${route==='index'?'./':route+'.html'}"]`;
async function ready(page,route){
  await page.waitForFunction(route=>document.body.dataset.page===route&&!document.querySelector('#site-content').hasAttribute('aria-busy'),route,{polling:40,timeout:6000});
}
async function settled(page){
  await page.waitForFunction(()=>{
    const scene=document.querySelector('.space-scene');
    return scene.dataset.travel==='settled'&&scene.dataset.route===document.body.dataset.page;
  },null,{polling:50,timeout:4000});
}
async function click(page,route){await page.locator(selector(route)).first().evaluate(el=>el.click());await ready(page,route);}
function timingProbe(){
  window.__flightSamples=[];
  new MutationObserver(()=>{
    const scene=document.querySelector('.space-scene'),content=document.querySelector('#site-content');
    if(!scene||!content||!content.hasAttribute('aria-busy'))return;
    window.__flightSamples.push({progress:Number(scene.dataset.progress),opacity:Number(getComputedStyle(content).opacity),depth:Number(content.dataset.flightDepth),stage:content.dataset.flightStage,direction:scene.dataset.direction,page:document.body.dataset.page});
    if(window.__flightSamples.length>400)window.__flightSamples.shift();
  }).observe(document,{subtree:true,attributes:true,attributeFilter:['data-progress']});
}
function checkTiming(samples,variant='base'){
  if(variant==='color')return checkSpatialTiming(samples);
  assert.ok(samples.some(x=>x.progress>0&&x.progress<.18&&x.opacity>0&&x.opacity<1),'visible outgoing fade');
  const middle=samples.filter(x=>x.progress>=.18&&x.progress<=.72);
  assert.ok(middle.length>2,'observed empty middle');assert.ok(middle.every(x=>x.opacity===0),'text hidden throughout middle');
  assert.ok(samples.some(x=>x.progress>.72&&x.progress<1&&x.opacity>0&&x.opacity<1),'visible arrival fade');
  assert.ok(samples.every(x=>x.progress<=.72||x.progress===1||x.opacity<1),'no premature full text');
}
function checkSpatialTiming(samples){
  const departing=samples.filter(x=>x.progress>0&&x.progress<.46&&x.stage==='depart');
  const arriving=samples.filter(x=>x.progress>.52&&x.progress<1&&x.stage==='arrive');
  assert.ok(departing.length>2&&arriving.length>2,'observed both spatial flight planes');
  assert.ok(departing.some(x=>x.opacity>0&&x.opacity<1),'visible outgoing spatial fade');
  assert.ok(arriving.some(x=>x.opacity>0&&x.opacity<1),'visible incoming spatial fade');
  assert.ok(departing.every(x=>x.direction==='forward'?x.depth>0:x.depth<0),'outgoing text travels in the camera direction');
  assert.ok(arriving.every(x=>x.direction==='forward'?x.depth<0:x.depth>0),'incoming text starts beyond the camera');
  const crossing=samples.filter(x=>x.progress>=.46&&x.progress<=.51);
  assert.ok(crossing.length>0&&crossing.every(x=>x.opacity===0),'text clears at the spatial handover');
  assert.ok(samples.every(x=>Number.isFinite(x.opacity)&&x.opacity>=0&&x.opacity<=1),'bounded spatial opacity');
  assert.ok(samples.filter(x=>x.progress>.52&&x.progress<1).every(x=>x.opacity<1),'no premature full destination text');
}
async function reverseEndpoints(page){
  const rows=[];
  const range=()=>page.evaluate(()=>({y:scrollY,max:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));
  for(const motion of ['on','off']){
    if((await page.locator('#space-motion').getAttribute('aria-pressed'))!==String(motion==='on'))await page.locator('#space-motion').evaluate(el=>el.click());
    for(const [from,to] of [['talks','writing'],['writing','research'],['research','index']])for(const late of [false,true]){
      await page.evaluate(route=>document.querySelectorAll('.site-header nav a')[['index','research','writing','talks'].indexOf(route)].click(),from);
      await ready(page,from);await settled(page);
      await page.evaluate(({to,late})=>{
        const grow=()=>{
          if(document.body.dataset.page!==to)return;
          const el=document.createElement('div');el.dataset.endpointFixture='true';el.style.height='900px';document.querySelector('footer').append(el);
          if(to==='writing'){
            document.querySelector('#archive-topic').value='systems';document.querySelector('#archive-topic').dispatchEvent(new Event('change',{bubbles:true}));
          }
        };
        if(late)window.addEventListener('site:page-ready',()=>setTimeout(grow,80),{once:true});
        if(!window.SiteNavigation.go(to,{atEnd:true}))throw Error('reverse rejected');
      },{to,late});
      await ready(page,to);await settled(page);await page.waitForTimeout(250);
      const state=await range();assert.ok(Math.abs(state.max-state.y)<=2,`reverse ${from}→${to} ${motion} late=${late}: ${JSON.stringify(state)}`);
      rows.push({from,to,motion,late,...state});
    }
  }
  // A new reader gesture cancels reconciliation, including later footer growth.
  await page.evaluate(()=>document.querySelectorAll('.site-header nav a')[3].click());await ready(page,'talks');
  await page.evaluate(()=>window.SiteNavigation.go('writing',{atEnd:true}));await ready(page,'writing');
  await page.waitForTimeout(210);await page.mouse.wheel(0,-200);
  await page.waitForFunction(()=>Math.max(0,document.documentElement.scrollHeight-innerHeight)-scrollY>20);
  const before=await range();
  await page.evaluate(()=>{const el=document.createElement('div');el.style.height='900px';document.querySelector('footer').append(el);});
  await page.waitForTimeout(250);const after=await range();
  assert.ok(Math.abs(after.y-before.y)<=2,`fresh input must release end intent: ${JSON.stringify({before,after})}`);
  await page.evaluate(()=>scrollTo({top:400,behavior:'instant'}));await page.waitForTimeout(380);
  await page.goBack();await ready(page,'talks');await page.goForward();await ready(page,'writing');
  assert.ok(Math.abs((await range()).y-400)<=2,'history keeps a middle reading position');
  return {rows,takeover:{before,after},historyMiddle:400};
}
async function scenario(browser,url,s){
  const ctx=await browser.newContext({viewport:{width:s.width,height:s.width===390?844:900}}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await ctx.addInitScript(timingProbe);
  await ctx.addInitScript(theme=>localStorage.setItem('vo.theme',theme),s.theme);
  if(process.env.SITE_NAVIGATION_PROBE==='true')await ctx.addInitScript(()=>{
    const raf=window.requestAnimationFrame;window.__navigationFrames=[];
    window.requestAnimationFrame=fn=>raf(time=>{const start=performance.now();fn(time);window.__navigationFrames.push(performance.now()-start);if(window.__navigationFrames.length>128)window.__navigationFrames.shift();});
  });
  const result={...s,pass:false,checks:{},errors};
  try {
    await page.goto(url+'/index.html');
    const variant=await page.locator('meta[name="site-variant"]').getAttribute('content');
    assert.ok(['base','color'].includes(variant),'known tested navigation variant');result.variant=variant;
    await page.bringToFront();
    await page.waitForFunction(()=>document.querySelector('#site-content main')&&document.querySelector('.space-scene').dataset.ready==='true',null,{polling:50,timeout:4000});
    await page.evaluate(()=>{window.__shell={header:document.querySelector('header'),canvas:document.querySelector('canvas'),theme:document.querySelector('#theme-mode'),document};});
    const edge=await page.locator('header').evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width:document.documentElement.clientWidth}));
    assert.equal(edge.left,0);assert.equal(edge.right,edge.width);result.checks.headerEdges=true;
    const initial=await page.locator('.space-scene').getAttribute('data-camera');
    for(const route of routes.slice(1)){
      await page.evaluate(()=>{window.__flightSamples=[];});
      await click(page,route);await settled(page);if(route!=='credits')checkTiming(await page.evaluate(()=>window.__flightSamples),variant);else{assert.ok((await page.evaluate(()=>window.__flightSamples)).every(x=>x.progress===1));result.checks.utilityNoFlight=true;}
      const state=await page.evaluate(()=>({page:document.body.dataset.page,title:document.title,description:document.querySelector('meta[name="description"]').content,h1:document.querySelectorAll('h1').length,focus:document.activeElement.id,rooms:+document.querySelector('.space-scene').dataset.rooms,direction:document.querySelector('.space-scene').dataset.direction,same:window.__shell.header===document.querySelector('header')&&window.__shell.canvas===document.querySelector('canvas')&&window.__shell.theme===document.querySelector('#theme-mode')&&window.__shell.document===document}));
      assert.equal(state.page,route);assert.ok(state.title.toLowerCase().includes(route==='credits'?'credits':route));assert.ok(state.description.length>20);assert.equal(state.h1,1);assert.equal(state.focus,'main');assert.equal(state.same,true);assert.ok(state.rooms<=3);assert.equal(state.direction,'forward');assert.equal(new URL(page.url()).pathname,new URL(route+'.html',url+'/').pathname);
      if(route==='writing'){result.writingFirstScroll=await require('./engine-browser.cjs').writingGestures(page);result.checks.writingFirstScroll=true;}
      (result.scrollArrivals??=[]).push({route,...await require('./scroll-browser.cjs').probe(page,'arrival',route)});
    }
    Object.assign(result.checks,{persistentShell:true,fiveRoutes:true,metadata:true,forward:true,flightTiming:true,fullScrollArrival:true});
    await click(page,'index');await settled(page);assert.equal(await page.locator('.space-scene').getAttribute('data-camera'),initial);assert.equal(await page.locator('.space-scene').getAttribute('data-direction'),'backward');result.checks.backward=true;
    await page.goBack();await ready(page,'credits');await settled(page);await page.goForward();await ready(page,'index');await settled(page);result.checks.history=true;
    await page.evaluate(()=>addEventListener('site:page-ready',()=>scrollTo({top:400,behavior:'instant'}),{once:true}));
    await click(page,'research');await settled(page);
    assert.equal(await page.evaluate(()=>history.state.site.scroll[1]),400);result.checks.earlyScroll=true;
    await page.waitForFunction(()=>scrollY>0&&history.state?.site?.scroll?.[1]===scrollY,null,{polling:50,timeout:2000});
    const position=await page.evaluate(()=>scrollY);
    await page.goBack();await ready(page,'index');await settled(page);await page.goForward();await ready(page,'research');await settled(page);
    assert.equal(await page.evaluate(()=>scrollY),position,'Forward restores the last reading position');result.checks.historyScroll=true;
    result.reverseEndpoints=await reverseEndpoints(page);result.checks.reverseEndpoint=true;result.checks.endpointTakeover=true;
    // The endpoint fixture finishes with Motion Off; resume the original scenario.
    await page.locator('#space-motion').evaluate(el=>el.click());
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
    await page.locator(selector('research')).first().evaluate(el=>el.click());
    await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.travel==='flying'&&Number(document.querySelector('.space-scene').dataset.progress)>.3);
    const retargetDeparture=await page.locator('#site-content').evaluate(el=>({opacity:Number(getComputedStyle(el).opacity),depth:Number(el.dataset.flightDepth)}));
    await page.evaluate(()=>{window.__flightSamples=[];document.querySelector('header a[href="writing.html"]').click();});
    await ready(page,'writing');await settled(page);
    const retarget=await page.evaluate(()=>window.__flightSamples.filter(x=>x.progress<.18));
    assert.ok(retarget.length>0);
    if(variant==='color'){
      assert.ok(retarget.every(x=>x.opacity<=retargetDeparture.opacity+.001),'retarget keeps the current spatial opacity');
      assert.ok(retarget.every(x=>x.direction==='forward'?x.depth>=retargetDeparture.depth:x.depth<=retargetDeparture.depth),'retarget continues the departing plane');
    }else assert.ok(retarget.every(x=>x.opacity===0),'hidden text stays hidden when retargeting');
    result.checks.retargetOpacity=true;await click(page,'talks');await settled(page);
    // Exit/arrival interruptions must leave readable, interactive destination content.
    for(const kind of ['off','print','hidden']){
      await page.evaluate(kind=>{
        const scene=document.querySelector('.space-scene');
        const observer=new MutationObserver(()=>{
          if(scene.dataset.travel!=='flying'||Number(scene.dataset.progress)<.08)return;
          observer.disconnect();
          if(kind==='off')document.querySelector('#space-motion').click();
          if(kind==='print')dispatchEvent(new Event('beforeprint'));
          if(kind==='hidden'){Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));}
        });observer.observe(scene,{attributes:true,attributeFilter:['data-progress']});
        const link=document.querySelector('header a[href="writing.html"]'),href=link.getAttribute('href');
        if(kind==='print')link.setAttribute('href','writing.html?topic=systems');
        link.click();link.setAttribute('href',href);
      },kind);
      await ready(page,'writing');
      assert.equal(await page.locator('#site-content').evaluate(el=>el.inert||getComputedStyle(el).opacity!=='1'),false);
      if(kind==='print'){assert.equal(await page.locator('li.publication:visible').count(),27);await page.evaluate(()=>dispatchEvent(new Event('afterprint')));assert.ok(await page.locator('li.publication:visible').count()<27);}
      if(kind==='hidden')await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
      if(kind==='off')await page.locator('#space-motion').evaluate(el=>el.click());
      await click(page,'talks');await settled(page);
    }
    result.checks.interruptions=true;
    await page.emulateMedia({reducedMotion:'reduce'});
    // Browser protocol acknowledgement can precede the page's media-query update.
    await page.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&document.querySelector('#space-motion').textContent==='Motion: reduced',null,{polling:40,timeout:2000});
    await click(page,'research');await settled(page);const reduced=await page.locator('.space-scene').getAttribute('data-camera');await page.waitForTimeout(220);assert.equal(await page.locator('.space-scene').getAttribute('data-camera'),reduced);assert.match(await page.locator('#space-motion').textContent(),/reduced/);result.checks.reduced=true;
    // An uncached fetch fails once, then the ordinary destination document opens.
    const engine=require('./engine-browser.cjs');
    await engine.fetchFallback(page,url);result.checks.fetchFallback=true;
    await engine.snapshotPin(page,url);result.checks.snapshotPin=true;
    await engine.boundedFallback(page,url,'revision');result.checks.versionFallback=true;
    await engine.boundedFallback(page,url,'digest');result.checks.digestFallback=true;
    await engine.offline(browser,s);result.checks.offlineEntries=true;
    assert.deepEqual(errors,[]);result.pass=checks.every(key=>result.checks[key]===true);
  }catch(error){
    result.error=error.message;result.stack=error.stack;
    result.state=await page.evaluate(()=>({page:document.body.dataset.page,url:location.href,hidden:document.hidden,navigation:typeof window.SiteNavigation,scene:{...document.querySelector('.space-scene').dataset},motion:document.querySelector('#space-motion').textContent,busy:document.querySelector('#site-content')?.hasAttribute('aria-busy'),scrollY,frames:window.__navigationFrames||[]})).catch(()=>null);
  }
  finally{await ctx.close();}
  return result;
}
function scenarios(engine){return [1440,390].flatMap(width=>['light','dark'].map(theme=>({engine,width,theme})));}
module.exports={scenario,scenarios,checks,reverseEndpoints,checkTiming};
if(require.main===module)(async()=>{
  const {toolRequire,launchOptions,report}=require('./common.cjs'),{start}=require('./serve.cjs');
  const {server,url}=await start(),browser=await toolRequire('playwright').firefox.launch(launchOptions('firefox'));
  try{const row=await scenario(browser,url,{engine:'firefox',width:1440,theme:'light'});report('navigation-diagnostic',{browser:browser.version(),row},row.pass);console.log(JSON.stringify(row,null,2));assert.equal(row.pass,true);}
  finally{await browser.close();server.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
