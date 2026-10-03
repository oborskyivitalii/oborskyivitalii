const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const prefix=process.env.SITE_AUDIT_TOOLS||'/tmp/site-v8-audit',req=createRequire(path.join(prefix,'package.json')),pw=req('playwright');
const {start}=require('./serve.cjs');
const out=path.join(__dirname,'results/css-readiness.json');
(async()=>{
  const {server,url}=await start(),rows=[];
  try{for(const engine of ['chromium','firefox','webkit']){
    const root=process.env.SITE_AUDIT_WEBKIT;
    const options=engine==='chromium'?{headless:true,executablePath:process.env.SITE_AUDIT_CHROME||'/tmp/site-chrome/opt/google/chrome/chrome',args:['--no-sandbox']}:
      engine==='webkit'&&root?{headless:true,executablePath:path.join(root,'bin/MiniBrowser'),env:{...process.env,WEBKIT_EXEC_PATH:path.join(root,'bin'),WEBKIT_INJECTED_BUNDLE_PATH:path.join(root,'lib'),WEBKIT_INSPECTOR_RESOURCES_PATH:path.join(root,'share'),LD_LIBRARY_PATH:[path.join(root,'lib'),path.join(root,'sys/lib'),process.env.SITE_AUDIT_WEBKIT_LIBS||''].join(':')}}:{headless:true};
    let browser;
    try{browser=await pw[engine].launch(options);}catch(e){rows.push({engine,blocked:e.message});continue;}
    try{for(const condition of ['normal','css-delayed','css-blocked']){
      const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage(),errors=[];
      await ctx.addInitScript(()=>{
        window.__colorReads=[];const original=window.getComputedStyle.bind(window);
        window.getComputedStyle=function(element,...args){const css=original(element,...args);if(element===document.documentElement)window.__colorReads.push({at:performance.now(),readyState:document.readyState,sheets:document.styleSheets.length,paper:css.getPropertyValue('--paper'),accent:css.getPropertyValue('--accent'),systems:css.getPropertyValue('--systems'),sheet:css.getPropertyValue('--scene-sheet')});return css;};
      });
      page.on('pageerror',e=>errors.push({message:e.message,stack:e.stack}));
      if(condition==='css-delayed')await page.route('**/styles.css',async route=>{await new Promise(resolve=>setTimeout(resolve,1500));await route.continue();});
      if(condition==='css-blocked')await page.route('**/styles.css',route=>route.abort('failed'));
      await page.goto(`${url}/credits.html`,{waitUntil:'load'});await page.waitForTimeout(400);
      rows.push({engine,version:browser.version(),condition,errors,...await page.evaluate(()=>({colorReads:window.__colorReads,ready:document.querySelector('.space-scene').dataset.ready,motionHidden:document.querySelector('#space-motion').hidden,phase:document.querySelector('.space-scene').dataset.phase,h1:document.querySelector('h1')?.textContent}))});await ctx.close();
      fs.writeFileSync(out,JSON.stringify(rows,null,2)+'\n');
    }}finally{await browser.close();}
  }}finally{server.close();fs.writeFileSync(out,JSON.stringify(rows,null,2)+'\n');}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
