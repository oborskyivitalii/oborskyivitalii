'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const directory=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
(async()=>{
 const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
 try{
  for(const variant of ['Final','Color-Prototype']){
   const file=path.join(directory,`Vitalii-Oborskyi-${variant}.html`),context=await browser.newContext({viewport:{width:390,height:844},offline:true});
   await context.addInitScript(()=>{localStorage.setItem('vo.motion','off');HTMLCanvasElement.prototype.getContext=()=>null;});
   const page=await context.newPage();await page.goto(pathToFileURL(file).href+'?view=talks');
   await page.waitForFunction(()=>document.body.dataset.page==='talks'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
   await page.evaluate(()=>{
    addEventListener('site:page-ready',()=>setTimeout(()=>{const el=document.createElement('div');el.style.height='900px';document.querySelector('footer').append(el);document.querySelector('main').style.fontSize='20px';},80),{once:true});
    window.SiteNavigation.go('writing',{atEnd:true});
   });
   await page.waitForFunction(()=>document.body.dataset.page==='writing'&&!document.getElementById('site-content').hasAttribute('aria-busy'));await page.waitForTimeout(300);
   const fallback=await page.evaluate(()=>({y:scrollY,max:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));assert.ok(Math.abs(fallback.y-fallback.max)<=2,'Canvas-missing reflow');
   await page.evaluate(()=>{
    addEventListener('site:page-ready',()=>{
     for(const node of [document.querySelector('main'),document.querySelector('footer')]){node.replaceChildren();node.style.cssText='height:0;min-height:0;padding:0;margin:0;overflow:hidden';}
    },{once:true});window.SiteNavigation.go('research',{atEnd:true});
   });
   await page.waitForFunction(()=>document.body.dataset.page==='research'&&!document.getElementById('site-content').hasAttribute('aria-busy'));await page.waitForTimeout(150);
   const zero=await page.evaluate(()=>({y:scrollY,max:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));assert.equal(zero.max,0);assert.equal(zero.y,0);
   rows.push({variant,source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),fallback,zero});await context.close();
  }
  const file=path.join(directory,'Vitalii-Oborskyi-Color-Prototype.html'),context=await browser.newContext({viewport:{width:390,height:844},offline:true});
  const page=await context.newPage();await page.goto(pathToFileURL(file).href+'?view=talks');
  await page.waitForFunction(()=>document.body.dataset.page==='talks'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
  await page.evaluate(()=>window.SiteNavigation.go('writing',{atEnd:true}));
  await page.waitForFunction(()=>document.body.dataset.page==='writing'&&document.getElementById('site-content').hasAttribute('aria-busy')&&Number(document.querySelector('.space-scene').dataset.progress)>.56);
  await page.evaluate(()=>document.querySelectorAll('.site-header nav a')[1].click());
  await page.waitForFunction(()=>document.body.dataset.page==='research'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
  await page.evaluate(()=>{const el=document.createElement('div');el.style.height='900px';document.querySelector('footer').append(el);});await page.waitForTimeout(300);
  const interrupted=await page.evaluate(()=>({page:document.body.dataset.page,y:scrollY,max:document.documentElement.scrollHeight-innerHeight}));assert.ok(interrupted.y<=2,'old endpoint must not pin the new route');
  rows.push({interrupted});await context.close();
 }finally{await browser.close();}
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({browser:browser.version(),rows,scope:'Bounded missing-Canvas/font-size/zero-range and interrupted-arrival endpoint checks; controlled conditions, not physical font/device evidence.'},null,2)+'\n');console.log(JSON.stringify(rows));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
