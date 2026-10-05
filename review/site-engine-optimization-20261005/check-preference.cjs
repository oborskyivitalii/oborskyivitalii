'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const file=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);
(async()=>{
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
  try{for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:844},offline:true}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(file).href+'?view=research');
    const ready=()=>page.waitForFunction(()=>document.body.dataset.page==='research'&&!document.getElementById('site-content').hasAttribute('aria-busy')&&document.getElementById('end-scroll')&&document.querySelector('.space-scene').dataset.ready==='true');
    await ready();
    for(let repeat=0;repeat<10;repeat++){
      await page.locator('#end-scroll').evaluate(el=>{if(el.checked)el.click();});
      const saved=await page.evaluate(()=>({checked:document.getElementById('end-scroll').checked,value:localStorage.getItem('vo.end-scroll'),url:location.href}));
      assert.equal(saved.checked,false);assert.equal(saved.value,'off');
      await page.reload();await ready();
      const restored=await page.evaluate(()=>({checked:document.getElementById('end-scroll').checked,value:localStorage.getItem('vo.end-scroll'),url:location.href}));
      assert.equal(restored.checked,false,JSON.stringify({width,repeat,saved,restored}));assert.equal(restored.value,'off');
      rows.push({width,repeat,saved,restored});await page.locator('#end-scroll').evaluate(el=>el.click());
    }
    assert.deepEqual(errors,[]);await context.close();
  }
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({schema:1,source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),browser:browser.version(),rows,scope:'Bounded investigation of one transient edge-harness checkbox assertion; ten real reloads at each width. Hosted provider/device acceptance remains separate.'},null,2)+'\n');console.log(JSON.stringify({reloads:rows.length,pass:true}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
