'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs'),{scenario}=require('../../tools/quality/scroll-browser.cjs');
const file=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);
(async()=>{
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[],errors=[];
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},offline:true});
    await context.addInitScript(()=>localStorage.setItem('vo.theme','dark'));
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    for(const route of ['index','research','writing','talks','credits']){
      await page.goto(pathToFileURL(file).href+'?view='+route);
      await page.waitForFunction(route=>document.body.dataset.page===route&&document.querySelector('.space-scene').dataset.ready==='true',route);
      const sync=await scenario(page,route);rows.push({route,sync});console.log('Layout fixtures:',route,'pass');
    }
    assert.deepEqual(errors,[]);await context.close();
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({schema:1,source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),browser:browser.version(),width:390,rows,errors,scope:'Bounded one-engine/one-theme layout diagnosis; hosted matrix and actual late font loading remain separate.'},null,2)+'\n');
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
