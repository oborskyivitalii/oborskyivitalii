// Optional sampled contrast QA of actual rendered text backgrounds.
const fs=require('fs'),crypto=require('crypto');
const {chromium}=require(process.env.SITE_REVIEW_PLAYWRIGHT||'playwright');
const {PNG}=require(process.env.SITE_REVIEW_PNGJS||'pngjs');
const root=require('node:path').resolve(__dirname,'..'),routes=['index','research','writing','talks','credits'];
const sourceHashes=()=>Object.fromEntries(['styles.css','space.js',...routes.map(r=>r+'.html')].map(p=>['docs/'+p,crypto.createHash('sha256').update(fs.readFileSync(root+'/docs/'+p)).digest('hex')]));
const lum=c=>c.map(x=>{const v=x/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
(async()=>{const sources=sourceHashes(),browser=await chromium.launch({headless:true,...(process.env.SITE_REVIEW_CHROMIUM?{executablePath:process.env.SITE_REVIEW_CHROMIUM}:{})}),results=[];
for(const device of ['desktop','mobile'])for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport:device==='desktop'?{width:1440,height:900}:{width:390,height:844}});
 await context.addInitScript(t=>localStorage.setItem('vo.theme',t),theme);
 const page=await context.newPage();
 for(const route of routes){await page.goto('file://'+root+'/docs/'+route+'.html');await page.waitForTimeout(220);
  const max=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  for(const position of device==='desktop'?['start','middle','end']:['start']){
   await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),position==='start'?0:position==='end'?max:max*.5);await page.waitForTimeout(220);
   await page.evaluate(()=>document.querySelector("#space-motion").click());
   const samples=await page.evaluate(()=>{
    const samples=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');let node;
    while((node=walker.nextNode())){
     const el=node.parentElement;if(!el||el.closest('script,style,svg,option')||!el.getClientRects().length||!node.textContent.trim())continue;
     const css=getComputedStyle(el),size=parseFloat(css.fontSize),target=size>=24||(size>=18.66&&parseInt(css.fontWeight)>=700)?3:4.5;
     ctx.clearRect(0,0,1,1);ctx.fillStyle=css.color;ctx.fillRect(0,0,1,1);const foreground=[...ctx.getImageData(0,0,1,1).data].slice(0,3);
     for(let i=0;i<node.textContent.length;i+=7){if(!node.textContent[i].trim())continue;const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect(),x=Math.floor(r.x+r.width/2),y=Math.floor(r.y+r.height/2);if(r.width&&x>=0&&x<innerWidth&&y>=0&&y<innerHeight)samples.push({x,y,foreground,target,text:node.textContent.trim().slice(0,65)});}
    }return samples;
   });
   const style=await page.addStyleTag({content:'* {color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important}'});
   const png=PNG.sync.read(await page.screenshot());await style.evaluate(el=>el.remove());
   await page.evaluate(()=>document.querySelector("#space-motion").click());
   const measured=samples.map(s=>{const offset=(s.y*png.width+s.x)*4,bg=[...png.data.slice(offset,offset+3)],a=lum(s.foreground),b=lum(bg);return {...s,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
   const min=measured.reduce((a,b)=>a.ratio<b.ratio?a:b),normal=measured.filter(s=>s.target===4.5),large=measured.filter(s=>s.target===3),failures=measured.filter(s=>s.ratio<s.target);
   results.push({route,theme,device,position,samples:measured.length,min_normal:normal.length?Math.min(...normal.map(s=>s.ratio)):null,min_large:large.length?Math.min(...large.map(s=>s.ratio)):null,minimum:min,failures});
  }
 }await context.close();
}
await browser.close();const failures=results.flatMap(r=>r.failures.map(f=>({route:r.route,theme:r.theme,device:r.device,position:r.position,...f})));
require('node:assert/strict').deepEqual(sourceHashes(),sources,'public source changed during contrast capture');
fs.writeFileSync(root+'/review/site-v1-20261003-v9-captures/contrast.json',JSON.stringify({method:'Chromium rendered backgrounds with motion frozen per sample and text paint hidden without layout changes; sampled glyph-center composited pixels, using computed original text color. Desktop start/middle/end plus mobile start in both themes. Sampled check, not complete WCAG certification.',sources,views:results,failures:failures.length},null,2)+'\n');
process.stdout.write(JSON.stringify({views:results.length,samples:results.reduce((n,r)=>n+r.samples,0),min_normal:Math.min(...results.map(r=>r.min_normal).filter(Boolean)),min_large:Math.min(...results.map(r=>r.min_large).filter(Boolean)),failures:failures.slice(0,10)},null,2)+'\n');
if(failures.length)process.exitCode=1;
})().catch(e=>{process.stderr.write(e.stack);process.exitCode=1;});
