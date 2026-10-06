'use strict';
// One small Chromium preview matrix. This report never substitutes for a full gate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {toolRequire,report,launchOptions,out}=require('./common.cjs'),{start}=require('./serve.cjs');
const routes=['index','research','writing','talks','credits'];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function artifactFile(value,base,manifest){
  const url=new URL(value),scope=new URL(base.replace(/\/$/,'')+'/');
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return null;
  const name=decodeURIComponent(url.pathname.slice(scope.pathname.length));
  if(Object.hasOwn(manifest.files,name))return name;
  const canonical=name.endsWith('/')||name===''?name+'index.html':name+'.html';
  return Object.hasOwn(manifest.files,canonical)?canonical:null;
}
async function verifyResponse(response,base,manifest,checkedFiles){
  const source=new URL(response.url()),scope=new URL(base.replace(/\/$/,'')+'/');
  if(source.origin!==scope.origin||!source.pathname.startsWith(scope.pathname))return {observed:false};
  const file=artifactFile(source.href,base,manifest),status=response.status();
  assert.ok(status<400,'HTTP failure '+status+' '+source.pathname);
  if([301,302,303,307,308].includes(status)){
    assert.ok(file?.endsWith('.html'),'unexpected non-HTML artifact redirect '+source.pathname);
    const location=response.headers().location;assert.ok(location,'missing canonical redirect Location '+source.pathname);
    const target=new URL(location,source);
    assert.equal(target.origin,scope.origin,'canonical redirect left the selected site');
    assert.ok(target.pathname.startsWith(scope.pathname),'canonical redirect left the selected path');
    assert.equal(artifactFile(target.href,base,manifest),file,'canonical redirect changed artifact '+file);
    return {observed:true,file,status,redirect:target.href};
  }
  if(!file)return {observed:false};
  assert.equal(status,200,'public response '+file);
  const digest=hash(await response.body());assert.equal(digest,manifest.files[file].sha256,'served bytes '+file);
  checkedFiles.add(file);return {observed:true,file,status,sha256:digest};
}
function identity(manifest){
  if(process.env.SITE_EXPECTED_PUBLIC_DIGEST)assert.equal(manifest.artifactDigest,process.env.SITE_EXPECTED_PUBLIC_DIGEST,'preview public digest');
  if(process.env.SITE_CANDIDATE_SHA)assert.equal(manifest.candidateCommit,process.env.SITE_CANDIDATE_SHA,'preview source commit');
  const variant=manifest.variant||manifest.components?.variant||{id:'base',contract:1,fingerprint:manifest.components?.engine};
  assert.ok(['base','color'].includes(variant.id),'unsupported preview rendition');
  assert.equal(variant.contract,1);assert.equal(variant.fingerprint,manifest.components.engine);
  if(manifest.variant&&manifest.components.variant)assert.deepEqual(manifest.variant,manifest.components.variant);
  if(process.env.SITE_PUBLIC_VARIANT)assert.equal(variant.id,process.env.SITE_PUBLIC_VARIANT);
  return variant;
}
async function ready(page,id){
  await page.waitForFunction(id=>document.body.dataset.page===id&&document.getElementById('site-content')&&!document.getElementById('site-content').hasAttribute('aria-busy'),id,{polling:40,timeout:10000});
}
function routeSelector(id){return id==='credits'?'footer a[href="credits.html"]':'.site-header nav a[href="'+(id==='index'?'./':id+'.html')+'"]';}
async function state(page){return page.evaluate(()=>{
  const scene=document.querySelector('.space-scene'),fallback=document.querySelector('.space-fallback'),button=document.getElementById('space-motion');
  return {page:document.body.dataset.page,ready:scene.dataset.ready==='true',travel:scene.dataset.travel||null,phase:scene.dataset.phase,fallback:getComputedStyle(fallback).visibility!=='hidden',h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+1,motion:{hidden:button.hidden,disabled:button.disabled,label:button.textContent},engine:document.querySelector('meta[name="site-engine"]').content,variant:document.querySelector('meta[name="site-variant"]')?.content||'base'};
});}
async function routeBytes(context,url,manifest){
  return Promise.all(routes.map(async id=>{
    const response=await context.request.get(url+'/'+id+'.html'),result=await verifyResponse(response,url,manifest,new Set());
    assert.equal(result.status,200,id+' HTTP status');assert.equal(result.file,id+'.html',id+' canonical route');
    return {route:id,sha256:result.sha256,status:result.status};
  }));
}
async function scenario(browser,url,manifest,variant,width,mode){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'no-preference'}),page=await context.newPage();
  const errors=[],external=[],responseChecks=[],checkedFiles=new Set(),rows=[];
  page.setDefaultTimeout(8000);
  await context.addInitScript(mode=>{
    try{localStorage.setItem('vo.theme','light');localStorage.setItem('vo.motion','on');}catch{}
    if(mode==='no-canvas')HTMLCanvasElement.prototype.getContext=()=>null;
  },mode);
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith(url+'/'))external.push(request.url());});
  page.on('response',response=>{
    responseChecks.push(verifyResponse(response,url,manifest,checkedFiles).catch(error=>{errors.push(error.message);}));
  });
  try{
    const served=await routeBytes(context,url,manifest);
    await page.goto(url+'/index.html',{waitUntil:'load'});await ready(page,'index');
    if(mode==='normal')await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true',null,{polling:50,timeout:5000});
    await page.evaluate(()=>{window.__previewShell={header:document.querySelector('header'),canvas:document.querySelector('canvas')};});
    for(const id of routes){
      if(id!=='index'){await page.locator(routeSelector(id)).evaluate(el=>el.click());await ready(page,id);}
      const observed=await state(page);assert.equal(observed.h1,1,id+' single main heading');assert.equal(observed.overflow,false,id+' horizontal overflow');
      assert.equal(observed.engine,variant.fingerprint,id+' engine identity');assert.equal(observed.variant,variant.id,id+' variant identity');
      assert.equal(await page.evaluate(()=>window.__previewShell.header===document.querySelector('header')&&window.__previewShell.canvas===document.querySelector('canvas')),true,id+' persistent header and canvas');
      if(mode==='normal'){assert.equal(observed.ready,true,id+' canvas is ready');assert.equal(observed.fallback,false,id+' animated scene active');}
      else{assert.equal(observed.ready,false,id+' no-canvas fallback');assert.equal(observed.fallback,true,id+' readable static fallback');assert.equal(observed.motion.hidden||observed.motion.disabled,true,id+' unavailable motion control');}
      await page.locator('.appearance summary').click();
      const theme=id==='research'||id==='talks'?'dark':'light';await page.locator('#theme-mode').selectOption(theme);assert.equal(await page.locator('html').getAttribute('data-theme'),theme,id+' theme control');
      if(mode==='normal'&&id==='index'){
        await page.locator('#space-motion').click();await page.waitForTimeout(150);
        const frozen=await page.locator('canvas').evaluate(el=>el.toDataURL());await page.waitForTimeout(150);
        assert.equal(await page.locator('canvas').evaluate(el=>el.toDataURL()),frozen,'Motion Off freezes the rendered bitmap');
        assert.match(await page.locator('#space-motion').textContent(),/off/);await page.locator('#space-motion').click();
      }
      await page.locator('.appearance summary').click();
      if(id==='writing'){
        await page.locator('#archive-topic').selectOption('systems');assert.ok(await page.locator('li.publication:visible').count()>0,'Writing filter has results');
        await page.locator('.filter-reset').evaluate(el=>el.click());
      }
      rows.push({route:id,pass:true,state:observed,checks:['exact identity','heading','viewport','persistent shell','theme control',mode==='normal'?'canvas active':'no-canvas fallback']});
    }
    await page.goBack();await ready(page,'talks');await page.goForward();await ready(page,'credits');
    await Promise.all(responseChecks);assert.deepEqual(errors,[],'runtime and served-byte errors');assert.deepEqual(external,[],'unexpected external requests');
    return {width,mode,pass:true,served,rows,history:true,motionOff:mode==='normal',errors,externalRequests:external,verifiedResponses:[...checkedFiles].sort()};
  }catch(error){
    fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'preview-'+width+'-'+mode+'.png')}).catch(()=>{});
    await Promise.all(responseChecks);return {width,mode,pass:false,error:error.message,stack:error.stack,rows,state:await state(page).catch(()=>null),errors,externalRequests:external};
  }finally{await context.close();}
}
async function main(){
  assert.ok(process.argv.includes('--smoke'),'Usage: local-browser.cjs --smoke with artifact environment');
  const manifest=JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST)),variant=identity(manifest),{server,url}=await start();
  const rows=[],pw=toolRequire('playwright');let browser,pass=false;
  try{
    browser=await pw.chromium.launch(launchOptions('chromium'));
    for(const width of [1440,390])for(const mode of ['normal','no-canvas']){
      const row=await scenario(browser,url,manifest,variant,width,mode);rows.push(row);console.log('Preview smoke:',width,mode,row.pass?'pass':row.error);
    }
    pass=rows.length===4&&rows.every(row=>row.pass);
    report('preview-smoke',{smoke:true,profile:'preview',variant,browser:browser.version(),routes,widths:[1440,390],modes:['normal','no-canvas'],rows,fullGate:false,deploymentAuthorized:false},pass);
  }catch(error){
    report('preview-smoke',{smoke:true,profile:'preview',variant,rows,error:error.message,fullGate:false,deploymentAuthorized:false},false);throw error;
  }finally{if(browser)await browser.close();server.close();}
  assert.ok(pass,'preview smoke failed');
  if(variant.id==='color')await require('./color-browser.cjs').main({smoke:true});
}
if(require.main===module)main().catch(error=>{console.error(error.stack);process.exitCode=1;});
module.exports={main,identity,scenario,ready,state,artifactFile,verifyResponse};
