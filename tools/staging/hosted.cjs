'use strict';
// Only the configured Pages preview origin is crawled. External destinations are not opened.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {digest}=require('../quality/artifact.cjs'),pkg=require('./package.cjs');
const routes=['index','research','writing','talks','credits'];
function origin(value,project,stable=false){
  assert.match(project,/^[a-z0-9][a-z0-9-]{0,57}[a-z0-9]$/);
  const url=new URL(value);assert.equal(url.protocol,'https:');assert.equal(url.username,'');assert.equal(url.password,'');assert.equal(url.port,'');assert.equal(url.search,'');assert.equal(url.hash,'');assert.equal(url.pathname,'/');
  const suffix='.'+project+'.pages.dev';assert.ok(url.hostname.endsWith(suffix),'not the configured Pages preview project');
  assert.match(url.hostname.slice(0,-suffix.length),/^[a-z0-9-]+$/,'invalid deployment subdomain');
  if(stable)assert.equal(url.hostname,'staging.'+project+'.pages.dev','not the staging alias');
  return url.origin;
}
function responseHeaders(headers,immutable=false){
  const robots=headers.get('x-robots-tag')||'';assert.match(robots,/\bnoindex\b/i);assert.match(robots,/\bnofollow\b/i);
  assert.equal(headers.get('x-content-type-options'),'nosniff');
  const cache=headers.get('cache-control')||'';
  if(immutable){assert.match(cache,/\bimmutable\b/);assert.match(cache,/max-age=31536000/);assert.doesNotMatch(cache,/no-cache|must-revalidate/);}
  else{assert.match(cache,/\bno-cache\b/i);assert.ok(!cache.includes('immutable'),'unversioned staging asset marked immutable');}
}
async function request(url,expectedOrigin,fetcher=fetch){
  let target=new URL(url);
  for(let i=0;i<6;i++){
    assert.equal(target.origin,expectedOrigin,'redirect left staging origin');
    const response=await fetcher(target,{redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(20000)});
    if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');assert.ok(location,'redirect without destination');target=new URL(location,target);continue;}
    return {response,url:target.href,bytes:Buffer.from(await response.arrayBuffer())};
  }
  throw Error('Too many staging redirects');
}
function type(file){
  if(file.endsWith('.html'))return /text\/html/i;
  if(file.endsWith('.css'))return /text\/css/i;
  if(file.endsWith('.js'))return /(?:text|application)\/javascript/i;
  if(file.endsWith('.svg'))return /image\/svg\+xml/i;
  if(file.endsWith('.webp'))return /image\/webp/i;
  if(file.endsWith('.jpg'))return /image\/jpeg/i;
  return /application\/json/i;
}
async function httpSmoke(base,record,fetcher=fetch){
  const files=Object.keys(record.source.files).filter(x=>x!=='.nojekyll').concat('_staging/revision.json'),rows=[];
  for(const file of files){
    const result=await request(base+'/'+file,base,fetcher);assert.equal(result.response.status,200,file+' HTTP status');responseHeaders(result.response.headers,require("../site/snapshot.cjs").immutable(file));
    assert.match(result.response.headers.get('content-type')||'',type(file),'content type '+file);
    assert.equal(digest(result.bytes),record.files[file].sha256,'hosted bytes differ '+file);
    rows.push({file,status:result.response.status,url:result.url,sha256:digest(result.bytes)});
  }
  const home=await request(base+'/',base,fetcher);assert.equal(home.response.status,200);responseHeaders(home.response.headers);assert.equal(digest(home.bytes),record.files['index.html'].sha256);
  const query=await request(base+'/writing.html?topic=systems&language=uk',base,fetcher);assert.equal(query.response.status,200);assert.equal(new URL(query.url).search,'?topic=systems&language=uk','redirect dropped archive query');
  const missing=await request(base+'/__staging_missing_'+record.source.sourceCommit,base,fetcher);assert.equal(missing.response.status,404,'unknown address became Home');responseHeaders(missing.response.headers);assert.equal(digest(missing.bytes),record.files['404.html'].sha256,'unexpected error document');
  return {files:rows,root:true,queryRedirect:true,actual404:true,noindex:true,cacheRevalidation:true};
}
async function sceneState(page){return page.evaluate(()=>{
  const scene=document.querySelector('.space-scene');return {phase:scene.dataset.phase,camera:scene.dataset.camera,quality:scene.dataset.quality,airX:scene.style.getPropertyValue('--air-x'),airY:scene.style.getPropertyValue('--air-y'),airLight:scene.style.getPropertyValue('--air-light')};
});}
async function appearance(page,theme){
  await page.locator('.appearance summary').click();await page.locator('#theme-mode').selectOption(theme);
  assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  await page.locator('#space-motion').click();const before=await sceneState(page);assert.match(await page.locator('#space-motion').innerText(),/off/i);
  await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}));await page.waitForTimeout(200);assert.deepEqual(await sceneState(page),before,'hosted Off did not hold exact pose/phase/atmosphere');
  const savedTheme=theme==='light'?'dark':'light';await page.locator('#theme-mode').selectOption(savedTheme);assert.deepEqual(await sceneState(page),before,'theme change lost frozen atmosphere/pose');
  await page.keyboard.press('Escape');assert.equal(await page.locator('.appearance').evaluate(el=>el.open),false);assert.equal(await page.locator('.appearance summary').evaluate(el=>el===document.activeElement),true);
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),savedTheme);
  // Reload closes native details. Inspect the visible control after reopening,
  // rather than reading an empty innerText from its non-rendered subtree.
  await page.locator('.appearance summary').click();assert.match(await page.locator('#space-motion').innerText(),/off/i);
  await page.locator('#theme-mode').selectOption('auto');
  const auto=await page.evaluate(()=>({actual:document.documentElement.dataset.theme,expected:new Date().getHours()>=7&&new Date().getHours()<19?'light':'dark'}));assert.equal(auto.actual,auto.expected,'visitor-local Auto');
  await page.locator('#space-motion').click();await page.locator('#theme-mode').selectOption(theme);await page.keyboard.press('Escape');
  return {theme,savedTheme,persistence:true,off:true,atmosphereFreeze:true,themeWhileFrozen:true,autoLocalHour:true,escapeFocus:true};
}
async function archive(page,base){
  await page.goto(base+'/writing.html?topic=delivery&language=uk#topic-systems');
  assert.equal(await page.locator('#archive-topic').inputValue(),'systems');assert.equal(await page.locator('#archive-language').inputValue(),'uk');
  assert.equal(await page.locator('#topic-systems').count(),1);await page.reload();assert.equal(await page.locator('#archive-language').inputValue(),'uk');
  await page.locator('#archive-language').selectOption('en');await page.goBack();assert.equal(await page.locator('#archive-language').inputValue(),'uk');await page.goForward();assert.equal(await page.locator('#archive-language').inputValue(),'en');
  await page.locator('#archive-year').selectOption('2025');await page.locator('#archive-topic').selectOption('delivery');await page.locator('#archive-language').selectOption('uk');assert.equal(await page.locator('#archive-empty').isVisible(),true);
  await page.locator('.filter-reset').click();assert.equal(await page.locator('li.publication:visible').count(),27);
  return {deepLink:true,fragmentConflict:true,refresh:true,history:true,topicYearLanguage:true,empty:true,reset:true,primaryRecords:27};
}
async function normalViews(browser,base){
  const rows=[];
  for(const width of [1440,390])for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height:width===1440?900:844},colorScheme:theme,timezoneId:'UTC'});
    await context.addInitScript(t=>{if(!localStorage.getItem('vo.theme'))localStorage.setItem('vo.theme',t);},theme);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{for(let i=0;i<routes.length;i++){
      const route=routes[i];await page.goto(base+'/'+route+'.html');await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true',null,{polling:50,timeout:4000});
      assert.equal(await page.locator('h1').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'hosted horizontal overflow');
      const phase=(await sceneState(page)).phase;await page.waitForFunction(p=>document.querySelector('.space-scene').dataset.phase!==p,phase,{polling:50,timeout:1500});
      const controls=await appearance(page,theme),next=routes[(i+1)%routes.length],sourcePath=new URL(page.url()).pathname;
      // Credits is deliberately linked from the footer, not added to the existing header.
      const selector=next==='credits'?'a[href="credits.html"]':'header nav a[href="'+(next==='index'?'./':next+'.html')+'"]';
      await page.evaluate(()=>{window.__hostedShell={header:document.querySelector('header'),canvas:document.querySelector('canvas')};});
      await page.locator(selector).first().click();
      await page.waitForFunction(route=>document.body.dataset.page===route&&!document.querySelector('#site-content').hasAttribute('aria-busy'),next,{polling:50,timeout:5000});
      const destination=new URL(page.url()).pathname;
      assert.ok((next==='index'?['/','/index','/index.html']:['/'+next,'/'+next+'.html']).includes(destination),'five-page navigation destination');
      assert.equal(await page.evaluate(()=>window.__hostedShell.header===document.querySelector('header')&&window.__hostedShell.canvas===document.querySelector('canvas')),true,'hosted navigation retains header/canvas');
      await page.goBack();
      await page.waitForFunction(route=>document.body.dataset.page===route&&!document.querySelector('#site-content').hasAttribute('aria-busy'),route,{polling:50,timeout:5000});
      assert.equal(new URL(page.url()).pathname,sourcePath,'extensionless history restoration');
      assert.deepEqual(errors,[]);rows.push({route,width,theme,pass:true,controls,navigation:true,ambient:true,overflow:false});
    }}finally{await context.close();}
  }
  return rows;
}
async function fallbacks(browser,base){
  const rows=[];
  for(const mode of ['no-js','reduced']){
    const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced'?'reduce':'no-preference'}),page=await context.newPage();
    try{for(const route of routes){
      await page.goto(base+'/'+route+'.html');
      if(mode==='no-js'){assert.equal(await page.locator('.space-fallback').isVisible(),true);assert.equal(await page.locator('h1').count(),1);}
      else{await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true');assert.equal(await page.locator('#space-motion').isDisabled(),true);const before=await sceneState(page);await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}));await page.waitForTimeout(200);assert.deepEqual(await sceneState(page),before);}
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);rows.push({route,mode,pass:true});
    }}finally{await context.close();}
  }
  return rows;
}
async function browserSmoke(base){
  const {toolRequire,launchOptions}=require('../quality/common.cjs'),pw=toolRequire('playwright'),browser=await pw.chromium.launch(launchOptions('chromium'));
  try{
    const views=await normalViews(browser,base),fallback=await fallbacks(browser,base),context=await browser.newContext(),page=await context.newPage();
    try{return {engine:'chromium',version:browser.version(),views,fallback,archive:await archive(page,base),limits:['Headless Linux browser and viewport emulation, not physical phones.','HTTP byte checks retain external publisher/contact targets; no external site is clicked.']};}finally{await context.close();}
  }finally{await browser.close();}
}
async function main(){
  const [url,dir,reportPath]=process.argv.slice(2),record=JSON.parse(fs.readFileSync(path.join(dir,'staging-package.json'))),base=origin(url,process.env.CLOUDFLARE_PAGES_PROJECT,process.env.SITE_STAGING_STABLE==='true');pkg.verify(dir,record);
  const result={schema:1,kind:'hosted-staging-smoke',pass:false,origin:base,sourceCommit:record.source.sourceCommit,publicDigest:record.source.artifactDigest,packageDigest:record.packageDigest};
  try{result.http=await httpSmoke(base,record);result.browser=await browserSmoke(base);result.pass=true;}catch(e){result.error=e.message;throw e;}finally{fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(result,null,2)+'\n');}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={origin,responseHeaders,request,httpSmoke,sceneState,browserSmoke};
