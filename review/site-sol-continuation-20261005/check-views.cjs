'use strict';
// Bounded current-source visual review; never part of the ten-test default.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const source=path.resolve(process.argv[2]),atlas=path.resolve(process.argv[3]),out=path.resolve(process.argv[4]);
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const rows=[],browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
 try{
  for(const variant of ['Final','Color-Prototype'])for(const width of [1440,390])for(const theme of ['light','dark']){
   const file=path.join(source,`Vitalii-Oborskyi-${variant}.html`),context=await browser.newContext({viewport:{width,height:width===390?844:900},offline:true});
   await context.addInitScript(theme=>{localStorage.setItem('vo.theme',theme);localStorage.setItem('vo.motion','off');},theme);
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const route of variant==='Final'?['index']:['index','research','writing','talks','credits']){
    await page.goto(pathToFileURL(file).href+'?view='+route);
    await page.waitForFunction(route=>document.body.dataset.page===route&&!document.getElementById('site-content').hasAttribute('aria-busy')&&document.querySelector('.space-scene').dataset.ready==='true',route);
    await page.waitForTimeout(300);
    const state=await page.evaluate(()=>({route:document.body.dataset.page,theme:document.documentElement.dataset.theme,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,header:[...document.querySelectorAll('.site-header nav a')].map(a=>a.textContent),credits:!!document.querySelector('footer a[href*="credits"]'),motion:document.getElementById('space-motion').getAttribute('aria-pressed'),engine:document.querySelector('meta[name="site-engine"]').content}));
    assert.deepEqual(state.header,['Home','Research','Writing','Talks']);assert.equal(state.credits,true);assert.equal(state.motion,'false');assert.ok(state.scrollWidth<=state.width+1,'horizontal overflow');assert.deepEqual(errors,[]);
    let image;
    if(variant==='Color-Prototype'){image=`${route}-${theme}-${width}.jpg`;await page.screenshot({path:path.join(out,image),type:'jpeg',quality:78});}
    rows.push({variant,source:sha(file),width,theme,route,state,image,errors:[...errors]});
   }
   await context.close();
  }
  const context=await browser.newContext({viewport:{width:1440,height:1000},offline:true}),page=await context.newPage();
  await page.goto(pathToFileURL(atlas).href);assert.equal(await page.locator('article').count(),7);await page.screenshot({path:path.join(out,'primitive-atlas.png'),fullPage:true});await context.close();
  fs.writeFileSync(path.join(out,'views.json'),JSON.stringify({schema:1,browser:browser.version(),scope:'20 Color opening views (five routes, two themes, two widths) and four base smoke views, Motion Off for stable inspection. Offline Chromium only; no physical-device, contrast, animation or hosted-matrix acceptance.',atlas:{source:sha(atlas),image:'primitive-atlas.png'},rows},null,2)+'\n');
  console.log('20 Color views, four base smoke views and seven-primitive atlas pass.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
