'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs'),{installProbe}=require('../../tools/quality/motion.cjs');
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
(async()=>{
 const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,offline:true});
  await context.addInitScript(installProbe);await context.addInitScript(()=>{window.SiteEngineStages=true;localStorage.setItem('vo.theme','dark');});
  const page=await context.newPage(),cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.goto(pathToFileURL(file).href+'?view=research');
  await page.waitForFunction(()=>document.body.dataset.page==='research'&&document.querySelector('.space-scene').dataset.ready==='true');await page.waitForTimeout(1400);
  const idle=await page.evaluate(()=>{const data=window.__qualityMotion;return {frames:data.frames.slice(-20),events:data.events.slice(-120)};});
  await page.evaluate(()=>{const data=window.__qualityMotion;data.frames=[];data.events=[];data.longTasks=[];document.querySelectorAll('.site-header nav a')[2].click();});
  await page.waitForFunction(()=>document.body.dataset.page==='writing'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
  const flight=await page.evaluate(()=>window.__qualityMotion);
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),browser:browser.version(),scope:'Opt-in fine stage diagnosis only, synthetic CPU×4; not a clean budget run.',idle,flight},null,2)+'\n');
  const worst=flight.frames.filter(x=>x.painted).sort((a,b)=>b.duration-a.duration)[0];
  console.log(JSON.stringify({worst,stages:flight.events.filter(x=>x.kind==='stage'&&x.start>=worst.started&&x.time<=worst.started+worst.duration+1),mount:flight.events.filter(x=>x.kind==='stage'&&x.part.startsWith('mount-'))}));
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
