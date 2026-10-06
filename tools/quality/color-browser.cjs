'use strict';
// Real browser input against the same immutable hosted Color artifact.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {toolRequire,report,launchOptions}=require('./common.cjs'),{start}=require('./serve.cjs');
let artifact;
async function settled(page,route){
  await page.waitForFunction(id=>document.body.dataset.page===id&&!document.getElementById('site-content').hasAttribute('aria-busy')&&document.querySelector('.space-scene').dataset.travel==='settled',route,{polling:25,timeout:10000});
}
async function travel(page,route){
  const selector=route==='credits'?'footer a[href="credits.html"]':'.site-header nav a[href="'+(route==='index'?'./':route+'.html')+'"]';
  await page.locator(selector).click();await settled(page,route);
}
async function state(page){return page.evaluate(()=>({page:document.body.dataset.page,scene:{...document.querySelector('.space-scene').dataset},plane:{...document.getElementById('site-content').dataset},transform:document.getElementById('site-content').style.transform,y:scrollY,max:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));}
async function forwardFlight(page){
  await page.locator('.site-header nav a[href="research.html"]').click();const samples=[];
  for(let i=0;i<200;i++){
    const row=await state(page);samples.push(row);
    if(row.page==='research'&&row.scene.travel==='settled')break;
    await page.waitForTimeout(20);
  }
  assert.ok(samples.some(s=>s.plane.flightStage==='depart'&&Number(s.plane.flightDepth)>0),'forward departure passes the viewer');
  assert.ok(samples.some(s=>s.plane.flightStage==='arrive'&&Number(s.plane.flightDepth)<0),'next text approaches from depth');
  assert.ok(samples.some(s=>s.transform.includes('translateZ(')),'actual spatial text transform');
  assert.ok(samples.some(s=>s.scene.travel==='flying'),'actual camera flight');await settled(page,'research');return samples;
}
async function edge(page,route,direction){
  await page.evaluate(d=>scrollTo({top:d<0?0:document.documentElement.scrollHeight,behavior:'instant'}),direction);
  await page.waitForTimeout(900);await page.mouse.move(200,150);await page.mouse.wheel(0,direction*320);await settled(page,route);
}
async function preferences(page,id,value){
  await page.evaluate(({id,value})=>{const input=document.getElementById(id);input.checked=value;input.dispatchEvent(new Event('change',{bubbles:true}));},{id,value});
}
async function scenario(browser,url,engine,width,theme){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'}),page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(url+'/index.html');await settled(page,'index');
    await page.evaluate(mode=>{const el=document.getElementById('theme-mode');el.value=mode;el.dispatchEvent(new Event('change',{bubbles:true}));},theme);
    const identity=await page.evaluate(()=>({id:document.querySelector('meta[name="site-variant"]').content,engine:document.querySelector('meta[name="site-engine"]').content,flight:document.getElementById('content-flight')?.checked,edge:document.getElementById('end-scroll')?.checked}));
    assert.equal(identity.id,'color');assert.equal(identity.engine,artifact.variant.fingerprint);assert.equal(identity.flight,true);assert.equal(identity.edge,true);
    await page.waitForFunction(()=>Number(document.querySelector('.space-scene').dataset.ribbonFaces)>0,null,{polling:50});
    const ribbons=(await state(page)).scene;assert.equal(ribbons.ribbons,'3');assert.equal(ribbons.ribbonMaterial,'opaque-rgb');
    const flight=await forwardFlight(page);
    await edge(page,'writing',1);await edge(page,'research',-1);
    const reverse=await state(page);assert.ok(Math.abs(reverse.y-reverse.max)<=2,'reverse arrives at real native bottom');
    await preferences(page,'end-scroll',false);await page.waitForTimeout(900);await page.mouse.wheel(0,320);await page.waitForTimeout(350);assert.equal((await state(page)).page,'research','disabled edge scrolling remains native');
    await preferences(page,'end-scroll',true);await travel(page,'credits');await page.mouse.wheel(0,320);await page.waitForTimeout(350);assert.equal((await state(page)).page,'credits','Credits stays outside itinerary');
    await travel(page,'index');await page.waitForTimeout(900);await page.mouse.wheel(0,-320);await page.waitForTimeout(350);assert.equal((await state(page)).page,'index','Home has no preceding route');
    assert.deepEqual(errors,[]);
    return {engine,width,theme,pass:true,identity,ribbons:{count:ribbons.ribbons,material:ribbons.ribbonMaterial,faces:Number(ribbons.ribbonFaces)},checks:{spatialFlight:true,forwardEdge:true,reverseNativeBottom:true,disabledEdge:true,creditsBoundary:true,homeBoundary:true},flight};
  }finally{await context.close();}
}
async function main(){
  artifact=JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST));
  const pw=toolRequire('playwright'),smoke=process.argv.includes('--smoke');
  assert.equal(artifact.variant?.id,'color');const {server,url}=await start(),rows=[],browsers=[];let pass=true;
  try{
    for(const engine of smoke?['chromium']:['chromium','firefox','webkit']){
      const browser=await pw[engine].launch(launchOptions(engine));browsers.push({engine,version:browser.version()});
      try{for(const width of [1440,390])for(const theme of smoke?['light']:['light','dark']){
        try{rows.push(await scenario(browser,url,engine,width,theme));}
        catch(error){pass=false;rows.push({engine,width,theme,pass:false,error:error.message});}
      }}finally{await browser.close();}
    }
  }finally{server.close();}
  report(smoke?'color-preview-smoke':'color-functional',{variant:artifact.variant,browsers,rows},pass);if(!pass)process.exitCode=1;
}
if(require.main===module)main().catch(error=>{report(process.argv.includes('--smoke')?'color-preview-smoke':'color-functional',{variant:artifact?.variant,error:error.message},false);console.error(error.message);process.exitCode=1;});
