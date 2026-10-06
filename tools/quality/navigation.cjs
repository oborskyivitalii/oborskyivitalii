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
async function archiveHistoryReady(page,url,controls){
  // Same-document traversal acknowledgement can precede popstate listeners.
  // Wait on the actual restored URL and archive values, not another delay.
  await page.waitForFunction(expected=>location.href===expected.url&&document.body.dataset.page==='writing'&&!document.querySelector('#site-content').hasAttribute('aria-busy')&&Object.entries(expected.controls).every(([key,value])=>document.getElementById('archive-'+key)?.value===value),{url,controls},{polling:40,timeout:6000});
}
async function saveMotionGroup(page,evidence){await page.evaluate(evidence=>(window.__navigationMotionGroups??={})[evidence.group]=evidence,evidence);}
async function motionGroupStep(page,evidence,action){
  await page.locator('#space-motion').evaluate(el=>el.click());
  const state=await page.evaluate(require('./engine-browser.cjs').motionState);evidence.steps.push({action,state});await saveMotionGroup(page,evidence);
  assert.equal(state.label,'Motion: '+action,'public control establishes the declared group mode');assert.equal(state.pressed,String(action==='on'));
}
async function publicMotionMode(page,mode,group){
  assert.ok(['on','off'].includes(mode));
  const {motionState,settledCamera}=require('./engine-browser.cjs'),before=await page.evaluate(motionState),evidence={mode,group,before,steps:[],status:'preparing'};
  await saveMotionGroup(page,evidence);
  try{
    assert.equal(before.ready,true);assert.equal(before.documentHidden,false);assert.equal(before.hidden,false);assert.equal(before.disabled,false);assert.equal(before.h1,1);assert.equal(before.overflow,false);
    if(before.label==='Motion: still (device)'){
      await settledCamera(page);evidence.hold=await page.evaluate(()=>window.__engineCameraSettling);await saveMotionGroup(page,evidence);
      assert.equal(evidence.hold.policy,'adaptive-hold','only the actual device policy may require Off/On resume');
      await motionGroupStep(page,evidence,'off');
    }
    const selected=await page.evaluate(motionState);
    if(selected.label!=='Motion: '+mode)await motionGroupStep(page,evidence,mode);
    if(mode==='on'){
      await settledCamera(page);evidence.live=await page.evaluate(()=>window.__engineCameraSettling);await saveMotionGroup(page,evidence);
      assert.equal(evidence.live.policy,'live','declared On group requires two actual live phase changes');
    }
    evidence.after=await page.evaluate(motionState);
    assert.equal(evidence.after.label,'Motion: '+mode);assert.equal(evidence.after.pressed,String(mode==='on'));assert.equal(evidence.after.y,before.y,'declared mode preserves native reading position');
    evidence.status='ready';await saveMotionGroup(page,evidence);return evidence;
  }catch(error){evidence.status='failed';evidence.error=error.message;await saveMotionGroup(page,evidence).catch(()=>{});throw error;}
}
function historyPositionSample(expected){
  const scene=document.querySelector('.space-scene'),content=document.querySelector('#site-content'),site=history.state?.site;
  const sample={part:expected.part,time:performance.now(),page:document.body.dataset.page,scene:scene.dataset.route,travel:scene.dataset.travel,busy:content.hasAttribute('aria-busy'),url:location.href,y:scrollY,savedY:site?.scroll?.[1],savedPage:site?.page};
  const probe=window.__historyMiddle??={samples:[]};
  if(probe.part!==expected.part){probe.part=expected.part;probe.started=sample.time;probe.expected=expected;probe.timeoutMs=2000;probe.status='sampling';}
  probe.samples.push(sample);probe.elapsedMs=sample.time-probe.started;
  const restored=sample.page===expected.route&&sample.scene===expected.route&&sample.travel==='settled'&&!sample.busy&&Math.abs(sample.y-expected.y)<=2&&sample.savedY===sample.y&&sample.savedPage===expected.route&&(!expected.url||sample.url===expected.url);
  if(restored)probe.status='ready';return restored;
}
async function historyPositionReady(page,expected){
  try{await page.waitForFunction(historyPositionSample,expected,{polling:50,timeout:2000});}
  catch(error){await page.evaluate(reason=>{window.__historyMiddle.status='failed';window.__historyMiddle.error=reason;},error.message).catch(()=>{});throw error;}
  return page.evaluate(()=>window.__historyMiddle);
}
function nativeScrollSettlement(){
  return new Promise((resolve,reject)=>{
    const start=performance.now(),samples=[];let previous=scrollY,changed=start;
    const probe=window.__wheelSettlement={status:'sampling',elapsedMs:0,quietMs:150,timeoutMs:2000,samples};
    function sample(){
      const now=performance.now(),y=scrollY;probe.elapsedMs=now-start;probe.y=y;samples.push({time:now-start,y});
      if(Math.abs(y-previous)>.5){previous=y;changed=now;}
      if(now-start>=2000){probe.status='failed';probe.error='Native wheel scroll did not settle within 2000ms';probe.max=Math.max(0,document.documentElement.scrollHeight-innerHeight);reject(Error(probe.error));return;}
      if(now-changed>=150){probe.status='settled';probe.max=Math.max(0,document.documentElement.scrollHeight-innerHeight);resolve({...probe});return;}
      setTimeout(sample,50);
    }
    sample();
  });
}
function beginInterruption(kind){
  const scene=document.querySelector('.space-scene'),canTravel=window.SiteScene?.canTravel()===true&&!document.hidden&&(!window.SiteEffects?.navigation||window.CSS?.supports?.('overflow','clip')===true);
  const probe=window.__interruption={kind,expected:canTravel?'animated':'instant',triggered:false,trigger:null,progress:null};
  let observer;
  function cleanup(){observer?.disconnect();window.removeEventListener('site:page-ready',arrived);}
  function apply(trigger){
    if(probe.triggered)return;
    probe.triggered=true;probe.trigger=trigger;probe.progress=Number(scene.dataset.progress);cleanup();
    if(kind==='off')document.querySelector('#space-motion').click();
    if(kind==='print')window.dispatchEvent(new Event('beforeprint'));
    if(kind==='hidden'){Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));}
  }
  function arrived(){
    if(document.body.dataset.page!=='writing')return;
    if(!canTravel)apply('instant-arrival');else {probe.missedArrival=true;cleanup();}
  }
  window.addEventListener('site:page-ready',arrived);
  if(canTravel){
    observer=new MutationObserver(()=>{
      if(scene.dataset.travel==='flying'&&Number(scene.dataset.progress)>=.08)apply('flight');
    });observer.observe(scene,{attributes:true,attributeFilter:['data-progress']});
  }
  const link=document.querySelector('header a[href="writing.html"]'),href=link.getAttribute('href');
  if(kind==='print')link.setAttribute('href','writing.html?topic=systems');
  link.click();link.setAttribute('href',href);
}
function timingProbe(){
  window.__flightSamples=[];
  function record(kind){
    const scene=document.querySelector('.space-scene'),content=document.querySelector('#site-content');
    if(!scene||!content||!content.hasAttribute('aria-busy'))return;
    window.__flightSamples.push({kind,progress:Number(scene.dataset.progress),opacity:Number(getComputedStyle(content).opacity),depth:Number(content.dataset.flightDepth),stage:content.dataset.flightStage,direction:scene.dataset.direction,page:document.body.dataset.page});
    if(window.__flightSamples.length>400)window.__flightSamples.shift();
  }
  new MutationObserver(()=>record('progress')).observe(document,{subtree:true,attributes:true,attributeFilter:['data-progress']});
  window.addEventListener('site:page-mount',()=>record('mount'));
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
  const crossing=samples.filter(x=>x.kind!=='mount'&&x.progress>=.46&&x.progress<=.51);
  assert.ok(crossing.every(x=>x.opacity===0),'sampled crossing text remains hidden');
  // Adaptive paints may skip the narrow .46–.51 interval. The real native
  // mount event must still occur once after the midpoint, with hidden content.
  const mounts=samples.filter(x=>x.kind==='mount');
  assert.equal(mounts.length,1,'exactly one actual spatial handover');
  assert.equal(mounts[0].opacity,0,'text hidden during the actual native handover');
  assert.ok(mounts[0].progress>=.5&&mounts[0].progress<1,'native handover follows the painted midpoint before arrival');
  assert.ok(samples.every(x=>Number.isFinite(x.opacity)&&x.opacity>=0&&x.opacity<=1),'bounded spatial opacity');
  assert.ok(samples.filter(x=>x.progress>.52&&x.progress<1).every(x=>x.opacity<1),'no premature full destination text');
}
async function reverseEndpoints(page){
  const rows=[];
  const range=()=>page.evaluate(()=>({y:scrollY,max:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));
  for(const motion of ['on','off']){
    await publicMotionMode(page,motion,'reverse-endpoints-'+motion);
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
      const state=await range();
      const actualMotion=await page.evaluate(require('./engine-browser.cjs').motionState);
      rows.push({from,to,motion,late,...state,actualMotion});
      await page.evaluate(rows=>window.__reverseEndpointRows=rows,rows);
      assert.ok(Math.abs(state.max-state.y)<=2,`reverse ${from}→${to} ${motion} late=${late}: ${JSON.stringify(state)}`);
      assert.equal(actualMotion.label,'Motion: '+motion,'reverse endpoint retains its declared mode');assert.equal(actualMotion.pressed,String(motion==='on'));
    }
  }
  // A new reader gesture cancels reconciliation, including later footer growth.
  await page.evaluate(()=>document.querySelectorAll('.site-header nav a')[3].click());await ready(page,'talks');
  await page.evaluate(()=>window.SiteNavigation.go('writing',{atEnd:true}));await ready(page,'writing');
  await page.waitForTimeout(210);await page.mouse.wheel(0,-200);
  await page.waitForFunction(()=>Math.max(0,document.documentElement.scrollHeight-innerHeight)-scrollY>20);
  // mouse.wheel returns before WebKit's native smooth wheel has finished.
  // Footer growth must test endpoint takeover after that gesture has settled.
  const wheel=await page.evaluate(nativeScrollSettlement),before={y:wheel.y,max:wheel.max};
  await page.evaluate(()=>{const el=document.createElement('div');el.style.height='900px';document.querySelector('footer').append(el);});
  await page.waitForTimeout(250);const after=await range();
  assert.ok(Math.abs(after.y-before.y)<=2,`fresh input must release end intent: ${JSON.stringify({before,after})}`);
  await page.evaluate(()=>{window.__historyMiddle={samples:[]};scrollTo({top:400,behavior:'instant'});});
  const readingURL=await page.evaluate(()=>location.href);await historyPositionReady(page,{route:'writing',y:400,url:readingURL,part:'saved'});
  await page.goBack();await ready(page,'talks');await settled(page);await page.goForward();await ready(page,'writing');await settled(page);
  const historyEvidence=await historyPositionReady(page,{route:'writing',y:400,url:readingURL,part:'restored'});
  assert.ok(Math.abs((await range()).y-400)<=2,'history keeps a middle reading position');
  return {rows,takeover:{before,after,wheel},historyMiddle:400,historyEvidence};
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
    const variantMeta=page.locator('meta[name="site-variant"]');
    const variant=await variantMeta.count()?await variantMeta.getAttribute('content'):'base';
    assert.ok(['base','color'].includes(variant),'known tested navigation variant');result.variant=variant;
    await page.bringToFront();
    await page.waitForFunction(()=>document.querySelector('#site-content main')&&document.querySelector('.space-scene').dataset.ready==='true',null,{polling:50,timeout:4000});
    await page.evaluate(()=>{window.__shell={header:document.querySelector('header'),canvas:document.querySelector('canvas'),theme:document.querySelector('#theme-mode'),document};});
    const edge=await page.locator('header').evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width:document.documentElement.clientWidth}));
    assert.equal(edge.left,0);assert.equal(edge.right,edge.width);result.checks.headerEdges=true;
    const initial=await page.locator('.space-scene').getAttribute('data-camera');
    for(const route of routes.slice(1)){
      await page.evaluate(()=>{window.__flightSamples=[];});
      await click(page,route);await settled(page);const samples=await page.evaluate(()=>window.__flightSamples);(result.flightEvidence??=[]).push({route,samples});
      if(route!=='credits')checkTiming(samples,variant);else{assert.ok(samples.every(x=>x.progress===1));result.checks.utilityNoFlight=true;}
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
    // Archive content/history checks retain the declared Off endpoint policy.
    await publicMotionMode(page,'off','archive-lifecycle');
    for(const route of ['writing','research','writing'])await click(page,route);
    await page.locator('#archive-topic').selectOption('systems');const archiveBack=await page.evaluate(()=>location.href);await page.locator('#archive-language').selectOption('uk');const archiveForward=await page.evaluate(()=>location.href);
    await page.goBack();await archiveHistoryReady(page,archiveBack,{topic:'systems',language:'all'});assert.equal(await page.locator('#archive-language').inputValue(),'all');await page.goForward();await archiveHistoryReady(page,archiveForward,{topic:'systems',language:'uk'});assert.equal(await page.locator('#archive-language').inputValue(),'uk');
    await click(page,'talks');await page.goBack();await ready(page,'writing');assert.equal(await page.locator('#archive-topic').inputValue(),'systems');assert.equal(await page.locator('#archive-language').inputValue(),'uk');
    await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));assert.equal(await page.locator('li.publication:visible').count(),27);await page.evaluate(()=>dispatchEvent(new Event('afterprint')));assert.ok(await page.locator('li.publication:visible').count()<27);result.checks.archiveLifecycle=true;
    assert.equal(await page.locator('#space-motion').textContent(),'Motion: off','archive lifecycle preserves the declared Off mode');
    await click(page,'index');
    const frozen=await page.locator('.space-scene').getAttribute('data-phase');await page.waitForTimeout(200);assert.equal(await page.locator('.space-scene').getAttribute('data-phase'),frozen);assert.equal(await page.locator('.space-scene').getAttribute('data-travel'),'settled');result.checks.off=true;
    await publicMotionMode(page,'on','rapid-retarget');
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
      await page.evaluate(beginInterruption,kind);
      await ready(page,'writing');
      const interruption=await page.evaluate(()=>window.__interruption);(result.interruptionEvidence??=[]).push(interruption);
      assert.equal(interruption.triggered,true,kind+' fixture must actually trigger');
      assert.equal(interruption.trigger,interruption.expected==='animated'?'flight':'instant-arrival',kind+' uses its actual navigation path');
      assert.equal(await page.locator('#site-content').evaluate(el=>el.inert||getComputedStyle(el).opacity!=='1'),false);
      if(kind==='print'){assert.equal(await page.locator('li.publication:visible').count(),27);await page.evaluate(()=>dispatchEvent(new Event('afterprint')));assert.ok(await page.locator('li.publication:visible').count()<27);}
      if(kind==='hidden')await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
      if(kind==='off')await publicMotionMode(page,'on','resume-off-interruption');
      await click(page,'talks');await settled(page);
    }
    result.checks.interruptions=true;
    await page.emulateMedia({reducedMotion:'reduce'});
    // Browser protocol acknowledgement can precede the page's media-query update.
    await page.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&document.querySelector('#space-motion').textContent==='Motion: reduced',null,{polling:40,timeout:2000});
    await click(page,'research');await settled(page);const reduced=await page.locator('.space-scene').getAttribute('data-camera');await page.waitForTimeout(220);assert.equal(await page.locator('.space-scene').getAttribute('data-camera'),reduced);assert.match(await page.locator('#space-motion').textContent(),/reduced/);result.checks.reduced=true;
    result.motionGroups=await page.evaluate(()=>window.__navigationMotionGroups||{});
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
    result.state=await page.evaluate(()=>({page:document.body.dataset.page,url:location.href,hidden:document.hidden,navigation:typeof window.SiteNavigation,scene:{...document.querySelector('.space-scene').dataset},motion:document.querySelector('#space-motion').textContent,busy:document.querySelector('#site-content')?.hasAttribute('aria-busy'),scrollY,frames:window.__navigationFrames||[],flightSamples:window.__flightSamples||[],wheelSettlement:window.__wheelSettlement||null,historyMiddle:window.__historyMiddle||null,cameraSettling:window.__engineCameraSettling||null,motionGroups:window.__navigationMotionGroups||{},reverseEndpointRows:window.__reverseEndpointRows||[]})).catch(()=>null);
  }
  finally{await ctx.close();}
  return result;
}
function scenarios(engine){return [1440,390].flatMap(width=>['light','dark'].map(theme=>({engine,width,theme})));}
module.exports={scenario,scenarios,checks,reverseEndpoints,checkTiming,archiveHistoryReady,publicMotionMode,historyPositionReady,historyPositionSample,nativeScrollSettlement,beginInterruption,timingProbe};
if(require.main===module)(async()=>{
  const {toolRequire,launchOptions,report}=require('./common.cjs'),{start}=require('./serve.cjs');
  const {server,url}=await start(),browser=await toolRequire('playwright').firefox.launch(launchOptions('firefox'));
  try{const row=await scenario(browser,url,{engine:'firefox',width:1440,theme:'light'});report('navigation-diagnostic',{browser:browser.version(),row},row.pass);console.log(JSON.stringify(row,null,2));assert.equal(row.pass,true);}
  finally{await browser.close();server.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
