'use strict';
// Diagnostic fault injection, not a default test or a claimed user reproduction.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
async function main(){
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
  try{for(const width of [1440,390])for(const motion of ['on','off'])for(const lateGrowth of [false,true]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},offline:true});
    await context.addInitScript(motion=>{localStorage.setItem('vo.motion',motion);localStorage.setItem('vo.theme','dark');},motion);
    const page=await context.newPage();await page.goto(pathToFileURL(file).href+'?view=talks');
    await page.waitForFunction(()=>document.body.dataset.page==='talks'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
    await page.evaluate(late=>{
      window.__landings=[];window.addEventListener('site:page-ready',()=>{
        if(document.body.dataset.page!=='writing')return;
        window.__landings.push({stage:'mount',y:scrollY,max:document.documentElement.scrollHeight-innerHeight});
        if(late)setTimeout(()=>{const extension=document.createElement('div');extension.style.height='900px';extension.dataset.diagnostic='late-footer';document.querySelector('footer').append(extension);},80);
      });
      window.SiteNavigation.go('writing',{atEnd:true});
    },lateGrowth);
    await page.waitForFunction(()=>document.body.dataset.page==='writing'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
    await page.waitForTimeout(350);
    const result=await page.evaluate(()=>({samples:window.__landings,y:scrollY,max:document.documentElement.scrollHeight-innerHeight,gap:document.documentElement.scrollHeight-innerHeight-scrollY}));
    rows.push({width,motion,lateGrowth,...result,atEnd:Math.abs(result.gap)<=2});await context.close();
  }}finally{await browser.close();}
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),browser:browser.version(),scope:'Direct reverse-continuation API; controlled late 900px footer growth. This establishes an endpoint reflow gap, not the cause of the reported intermittent top landing.',rows},null,2)+'\n');
  console.log(JSON.stringify(rows));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
