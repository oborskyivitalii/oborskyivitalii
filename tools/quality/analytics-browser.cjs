'use strict';
// Enabled source fixture with a stubbed vendor. Never sends real visitor data.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{pathToFileURL}=require('node:url');
const {root}=require('./common.cjs'),{routes}=require('../site/snapshot.cjs');
const model='enabled source fixture; vendor stubbed';
const settings={schema:1,provider:'cloudflare',enabled:true,siteURL:'https://analytics.example.com/author/',token:'a'.repeat(32),searchConsoleVerification:null};
const modes=['enabled','blocked','staging','offline'];
const checks=['fiveRoutes','persistentShell','history','reload','archive','oneVendorPerDocument','originIsolation','offlineIsolation'];
function cases(engine){return [...routes.map(entry=>({engine,entry,mode:'enabled'})),{engine,entry:'index',mode:'blocked'},{engine,entry:'index',mode:'staging'},...routes.map(entry=>({engine,entry,mode:'offline'}))];}
async function ready(page,id){await page.waitForFunction(id=>document.body.dataset.page===id&&!document.querySelector('#site-content').hasAttribute('aria-busy'),id,{polling:40,timeout:6000});}
async function navigate(page,id,producer,offline) {
  const href=offline?producer.interactiveFilename(id):id==='index'?'./':id+'.html';
  await page.locator(`a[href="${href}"]`).first().evaluate(el=>el.click());await ready(page,id);
}
async function vendorState(page,mode) {
  if(['staging','offline'].includes(mode)){assert.equal(await page.locator('#site-cloudflare-beacon').count(),0);return;}
  await page.waitForFunction(status=>document.querySelector('#site-cloudflare-beacon')?.getAttribute('data-site-analytics-status')===status,mode==='blocked'?'blocked':'loaded',{polling:40,timeout:6000});
  assert.equal(await page.locator('#site-cloudflare-beacon').count(),1);
  assert.equal(await page.evaluate(()=>window.__vendorFixtureLoads||0),mode==='blocked'?0:1);
}
async function scenario(browser,dir,producer,s) {
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[],requests=[],vendor=[],unexpected=[];
  page.setDefaultTimeout(6000);
  const result={...s,model,pass:false,checks:{},errors,vendorRequests:vendor,externalRequests:unexpected};
  const origin=s.mode==='staging'?'https://staging.example.com':'https://analytics.example.com';
  const prefix=origin+'/author/';
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()));
  await ctx.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.href==='https://static.cloudflareinsights.com/beacon.min.js') {
      vendor.push(url.href);
      if(s.mode==='blocked')await route.abort('failed');
      else await route.fulfill({contentType:'text/javascript',body:'window.__vendorFixtureLoads=(window.__vendorFixtureLoads||0)+1;'});
    } else if(url.href.startsWith(prefix)) {
      const name=decodeURIComponent(url.pathname.slice('/author/'.length))||'index.html',target=path.join(dir,'docs',name);
      assert.ok(!name.includes('..'),'finite fixture path');
      if(!fs.existsSync(target)){await route.fulfill({status:404,body:'Missing fixture resource'});return;}
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'};
      await route.fulfill({contentType:types[path.extname(name)]||'application/octet-stream',body:fs.readFileSync(target)});
    } else if(url.protocol==='file:')await route.continue();
    else {unexpected.push(url.origin);await route.abort('failed');}
  });
  try {
    const url=s.mode==='offline'?pathToFileURL(path.join(dir,'review',producer.interactiveFilename(s.entry))).href:prefix+s.entry+'.html';
    await page.goto(url);await ready(page,s.entry);await vendorState(page,s.mode);
    await page.evaluate(()=>{window.__analyticsShell={header:document.querySelector('header'),canvas:document.querySelector('canvas')};});
    for(const id of routes) {
      await navigate(page,id,producer,s.mode==='offline');
      assert.equal(await page.evaluate(()=>document.querySelector('header')===window.__analyticsShell.header&&document.querySelector('canvas')===window.__analyticsShell.canvas),true);
      if(id==='writing') {
        await page.locator('#archive-topic').selectOption('systems');assert.ok(await page.locator('li.publication:visible').count()>0);
        await page.locator('.filter-reset').evaluate(el=>el.click());assert.equal(await page.locator('li.publication:visible').count(),27);
      }
      await vendorState(page,s.mode);
    }
    await page.goBack();await ready(page,'talks');await page.goForward();await ready(page,'credits');await vendorState(page,s.mode);
    assert.equal(vendor.length,['staging','offline'].includes(s.mode)?0:1,'one vendor request in a persistent document');
    await page.reload();await ready(page,'credits');await vendorState(page,s.mode);
    assert.equal(vendor.length,['staging','offline'].includes(s.mode)?0:2,'one vendor request after full reload');
    assert.deepEqual(requests.filter(url=>/^https?:/.test(url)&&!url.startsWith(prefix)&&url!=='https://static.cloudflareinsights.com/beacon.min.js'),[]);
    if(s.mode==='offline')assert.deepEqual(requests.filter(url=>/^https?:/.test(url)),[]);
    assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);result.checks=Object.fromEntries(checks.map(key=>[key,true]));result.pass=true;
  }catch(error){result.error=error.message;result.stack=error.stack;}
  finally{await ctx.close();}
  return result;
}
async function run(browser,engine) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'site-analytics-browser-'));
  try {
    for(const name of ['site','tools/site','tools/build_scene_fallbacks.cjs','tools/build_site_previews.cjs']){fs.mkdirSync(path.dirname(path.join(dir,name)),{recursive:true});fs.cpSync(path.join(root,name),path.join(dir,name),{recursive:true});}
    fs.writeFileSync(path.join(dir,'site/analytics.json'),JSON.stringify(settings,null,2)+'\n');
    require('../site/build.cjs').build({root:dir,all:true});
    const producer=require(path.join(dir,'tools/build_site_previews.cjs'));
    for(const [name,bytes]of Object.entries(producer.buildPreviews())){fs.mkdirSync(path.dirname(path.join(dir,name)),{recursive:true});fs.writeFileSync(path.join(dir,name),bytes);}
    const rows=[];for(const s of cases(engine)){rows.push(await scenario(browser,dir,producer,s));process.stdout.write(`analytics fixture ${engine} ${s.entry} ${s.mode}: ${rows.at(-1).pass?'pass':rows.at(-1).error}\n`);}
    return rows;
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
module.exports={run,cases,checks,modes,model};
if(require.main===module)(async()=>{
  const {toolRequire,launchOptions,save}=require('./common.cjs'),engine='chromium',browser=await toolRequire('playwright')[engine].launch(launchOptions(engine));
  try{const rows=await run(browser,engine);save('analytics-fixture',{model,browser:browser.version(),rows,liveTelemetryValidated:false});assert.ok(rows.every(row=>row.pass),'Analytics fixture failed');}
  finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
