'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
(async()=>{
 const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
 try{for(const input of ['wheel','key']){
  const context=await browser.newContext({viewport:{width:390,height:844},offline:true});
  await context.addInitScript(()=>{localStorage.setItem('vo.motion','off');localStorage.setItem('vo.theme','dark');});
  const page=await context.newPage();await page.goto(pathToFileURL(file).href+'?view=talks');
  await page.waitForFunction(()=>document.body.dataset.page==='talks'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(800);
  if(input==='wheel'){await page.mouse.move(195,300);await page.mouse.wheel(0,-90);await page.waitForTimeout(60);await page.mouse.wheel(0,-90);}
  else await page.keyboard.down('PageUp');
  await page.waitForFunction(()=>document.body.dataset.page==='writing'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
  for(let i=0;i<3;i++){await page.waitForTimeout(60);if(input==='wheel')await page.mouse.wheel(0,-90);else await page.keyboard.down('PageUp');}
  if(input==='key')await page.keyboard.up('PageUp');
  await page.waitForTimeout(120);
  rows.push({input,...await page.evaluate(()=>({y:scrollY,max:document.documentElement.scrollHeight-innerHeight,gap:document.documentElement.scrollHeight-innerHeight-scrollY}))});
  await context.close();
 }}finally{await browser.close();}
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),rows},null,2)+'\n');console.log(JSON.stringify(rows));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
