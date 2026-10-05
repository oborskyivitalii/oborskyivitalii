'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs');
const {reverseEndpoints}=require('../../tools/quality/navigation.cjs');
const directory=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);
(async()=>{
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];
  try{
    for(const variant of ['Final','Color-Prototype'])for(const width of [1440,390]){
      const file=path.join(directory,`Vitalii-Oborskyi-${variant}.html`);
      const context=await browser.newContext({viewport:{width,height:width===390?844:900},offline:true});
      await context.addInitScript(()=>localStorage.setItem('vo.theme','dark'));
      const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(pathToFileURL(file).href+'?view=talks');
      await page.waitForFunction(()=>document.body.dataset.page==='talks'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
      const result=await reverseEndpoints(page);assert.deepEqual(errors,[]);
      rows.push({variant,width,source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),result,errors});
      if(variant==='Color-Prototype'){
        const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
        const inputs=[];
        for(const flight of ['on','off'])for(const input of ['wheel','key','touch'])for(const [from,to] of [['talks','writing'],['writing','research'],['research','index']]){
          await page.evaluate(value=>localStorage.setItem('vo.content-flight',value),flight);
          await page.goto(pathToFileURL(file).href+'?view='+from);
          await page.waitForFunction(from=>document.body.dataset.page===from&&!document.getElementById('site-content').hasAttribute('aria-busy'),from);
          await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(800);
          await page.evaluate(to=>window.addEventListener('site:page-ready',()=>setTimeout(()=>{
            if(document.body.dataset.page!==to)return;
            const el=document.createElement('div');el.style.height='900px';document.querySelector('footer').append(el);
          },80),{once:true}),to);
          // Driver round-trips can exceed the actual 180ms gesture boundary
          // during a slow mount. Queue original creation times for this one
          // continuous gesture; reverseEndpoints separately checks fresh input.
          const wheelEpoch=await page.evaluate(()=>{
            window.wheelTimes=[];addEventListener('wheel',e=>wheelTimes.push(e.timeStamp),{capture:true});
            return (performance.timeOrigin+performance.now())/1000;
          });let wheelIndex=0;
          const wheel=()=>cdp.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:width/2,y:300,deltaX:0,deltaY:-90,timestamp:wheelEpoch+wheelIndex++*.06});
          if(input==='wheel'){
            await page.mouse.move(width/2,300);await wheel();await page.waitForTimeout(60);await wheel();
          }else if(input==='key')await page.keyboard.down('PageUp');
          else{
            await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width/2,y:250,id:1}]});
            await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width/2,y:370,id:1}]});
          }
          for(let tail=0;tail<3;tail++){
            await page.waitForTimeout(60);
            if(input==='wheel')await wheel();
            else if(input==='key')await page.keyboard.down('PageUp');
            else await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width/2,y:390+tail*25,id:1}]});
          }
          if(input==='key')await page.keyboard.up('PageUp');
          if(input==='touch')await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          await page.waitForFunction(to=>document.body.dataset.page===to&&!document.getElementById('site-content').hasAttribute('aria-busy'),to);
          await page.waitForTimeout(260);
          const state=await page.evaluate(()=>({y:scrollY,max:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));
          assert.ok(Math.abs(state.max-state.y)<=2,JSON.stringify({input,from,to,flight,state}));
          const wheelTimes=input==='wheel'?await page.evaluate(()=>wheelTimes):undefined;
          if(wheelTimes){assert.equal(wheelTimes.length,5);assert.ok(wheelTimes.slice(1).every((time,i)=>Math.abs(time-wheelTimes[i]-60)<2),'same gesture creation intervals');}
          inputs.push({input,from,to,flight,...state,wheelTimes});
        }
        rows.at(-1).inputs=inputs;
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.goto(pathToFileURL(file).href+'?view=talks');
        await page.waitForFunction(()=>document.body.dataset.page==='talks'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
        await page.evaluate(()=>{
          addEventListener('site:page-ready',()=>setTimeout(()=>{const el=document.createElement('div');el.style.height='900px';document.querySelector('footer').append(el);},80),{once:true});
          window.SiteNavigation.go('writing',{atEnd:true});
        });
        await page.waitForFunction(()=>document.body.dataset.page==='writing'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
        await page.waitForTimeout(260);
        assert.ok(await page.evaluate(()=>Math.abs(document.documentElement.scrollHeight-innerHeight-scrollY)<=2),'reduced endpoint');
        await page.waitForTimeout(1100);const oldY=await page.evaluate(()=>scrollY);
        await page.evaluate(()=>{const el=document.createElement('div');el.style.height='900px';document.querySelector('footer').append(el);});
        await page.waitForTimeout(220);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-oldY)<=2,'expired intent must not pin footer');
        rows.at(-1).reduced=true;rows.at(-1).expiry=true;
        // A short destination can grow during the same bounded landing.
        await page.evaluate(()=>{
          addEventListener('site:page-ready',()=>{
            const main=document.querySelector('main'),footer=document.querySelector('footer');
            main.replaceChildren();main.style.cssText='min-height:0;height:0;padding:0;margin:0;overflow:hidden';
            footer.replaceChildren();footer.style.cssText='min-height:0;height:0;padding:0;margin:0;overflow:hidden';
            setTimeout(()=>{footer.style.height='1200px';},80);
          },{once:true});window.SiteNavigation.go('research',{atEnd:true});
        });
        await page.waitForFunction(()=>document.body.dataset.page==='research'&&!document.getElementById('site-content').hasAttribute('aria-busy'));
        await page.waitForTimeout(260);assert.ok(await page.evaluate(()=>Math.abs(Math.max(0,document.documentElement.scrollHeight-innerHeight)-scrollY)<=2),'short growing endpoint');
        rows.at(-1).shortGrowth=true;
      }
      console.log('Endpoints:',variant,width,'pass');await context.close();
    }
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({browser:browser.version(),rows,scope:'Targeted existing hosted endpoint fixture on both offline variants, two widths; trusted CDP wheel with original 60ms gesture timestamps, actual key/touch with Color content flight On/Off, reduced/expiry/short-growth. Fresh-input takeover remains separate. No full hosted/device claim.'},null,2)+'\n');
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
