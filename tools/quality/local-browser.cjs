'use strict';
// Two short offline input checks; this does not run the hosted release matrix.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('./common.cjs');
async function ready(page,route){await page.waitForFunction(route=>document.body.dataset.page===route&&!document.getElementById('site-content').hasAttribute('aria-busy'),route,{polling:40,timeout:6000});}
async function main(file,directory){
  fs.mkdirSync(directory,{recursive:true});const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
  try{for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},offline:true}),page=await context.newPage(),errors=[],requests=[];
    await context.addInitScript(()=>localStorage.setItem('vo.theme','dark'));
    page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
    await page.goto(pathToFileURL(file).href);await ready(page,'index');
    await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true',null,{polling:50,timeout:4000});
    assert.deepEqual(await page.evaluate(()=>window.SiteNavigation.primaryRoutes),['index','research','writing','talks']);
    await page.evaluate(()=>{window.__localShell={header:document.querySelector('header'),canvas:document.querySelector('canvas')};});
    await page.screenshot({path:path.join(directory,'home-'+width+'.png')});
    for(const route of ['research','writing','talks']){
      await page.locator('header nav a[href="?view='+route+'"]').evaluate(el=>el.click());await ready(page,route);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    }
    assert.equal(await page.locator('.scroll-continue').count(),0,'Talks ends the header itinerary');
    await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'instant'}));
    await page.waitForTimeout(1000);await page.mouse.move(width/2,500);await page.mouse.wheel(0,500);await page.waitForTimeout(250);
    assert.equal(await page.locator('body').getAttribute('data-page'),'talks','scroll cannot enter Credits');
    await page.locator('footer a[href="?view=credits"]').evaluate(el=>el.click());await ready(page,'credits');
    assert.equal(await page.locator('.space-scene').getAttribute('data-travel'),'settled','utility is mounted without a flight');
    assert.equal(await page.evaluate(()=>window.SiteNavigation.go('talks')),false);
    for(const top of [0,1e8]){
      await page.evaluate(top=>scrollTo({top,behavior:'instant'}),top);await page.waitForTimeout(1000);
      await page.mouse.wheel(0,top?500:-500);await page.waitForTimeout(100);
      assert.equal(await page.locator('body').getAttribute('data-page'),'credits');
    }
    await page.locator('header nav a[href="?view=index"]').evaluate(el=>el.click());await ready(page,'index');
    await page.goBack();await ready(page,'credits');await page.goForward();await ready(page,'index');
    const state=await page.evaluate(()=>({same:window.__localShell.header===document.querySelector('header')&&window.__localShell.canvas===document.querySelector('canvas'),surfaces:document.querySelectorAll('#surface-mode,[data-glass-visible]').length,blur:[...document.querySelectorAll('main *')].filter(el=>{const s=getComputedStyle(el,'::before');return s.backdropFilter&&s.backdropFilter!=='none';}).length,h1:document.querySelectorAll('h1').length}));
    assert.equal(state.same,true);assert.equal(state.surfaces,0);assert.equal(state.blur,0);assert.equal(state.h1,1);assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
    await page.locator('#space-motion').evaluate(el=>el.click());await page.waitForTimeout(150);
    const frozen=await page.locator('canvas').evaluate(el=>el.toDataURL());await page.waitForTimeout(150);
    assert.equal(await page.locator('canvas').evaluate(el=>el.toDataURL()),frozen);
    rows.push({width,pass:true,state,errors,requests,checks:['primary itinerary','Talks boundary','Credits boundaries','footer access','history','persistent shell','no backdrop blur','Motion Off']});console.log('Local browser smoke:',width,'pass');await context.close();
  }}finally{await browser.close();}
  fs.writeFileSync(path.join(directory,'local-browser.json'),JSON.stringify({schema:1,pass:true,browser:browser.version(),source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),rows},null,2)+'\n');
}
if(require.main===module)main(path.resolve(process.argv[2]),path.resolve(process.argv[3])).catch(error=>{console.error(error.stack);process.exitCode=1;});
module.exports={main};
