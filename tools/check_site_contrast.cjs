// Sampled contrast QA of actually visible rendered text backgrounds.
const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..'),routes=['index','research','writing','talks','credits'];
const publicRoot=process.env.SITE_PUBLIC_DIR||root+'/docs';
const sourceHashes=()=>Object.fromEntries(['styles.css','space.js',...routes.map(r=>r+'.html')].map(p=>['docs/'+p,crypto.createHash('sha256').update(fs.readFileSync(publicRoot+'/'+p)).digest('hex')]));
// Reuse pinned Pillow rather than adding an unpinned PNG package.
function pixels(bytes){
 const result=cp.spawnSync(process.env.SITE_REVIEW_PYTHON||'python3',['-c','import io,struct,sys; from PIL import Image; im=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert("RGBA"); sys.stdout.buffer.write(struct.pack(">II",*im.size)+im.tobytes())'],{input:bytes,maxBuffer:32*1024*1024});
 if(result.status!==0)throw Error('PNG sampling failed: '+result.stderr.toString());
 return {width:result.stdout.readUInt32BE(0),height:result.stdout.readUInt32BE(4),data:result.stdout.subarray(8)};
}
const lum=c=>c.map(x=>{const v=x/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
// Self-contained for page.evaluate and controlled unit fixtures. A cached Range
// in closed native details can have geometry without painting its text.
function collectSamples(){
 function visible(el){
  if(!el||el.closest('script,style,svg,option'))return false;
  if(!el.checkVisibility({opacityProperty:true,visibilityProperty:true,contentVisibilityAuto:true}))return false;
  for(let details=el.closest('details');details;details=details.parentElement?.closest('details')){
   const summary=[...details.children].find(child=>child.tagName==='SUMMARY');
   if(!details.open&&(!summary||!summary.contains(el)))return false;
  }
  return el.getClientRects().length>0;
 }
 const samples=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');let node;
 while((node=walker.nextNode())){
  const el=node.parentElement;if(!node.textContent.trim()||!visible(el))continue;
  const css=getComputedStyle(el),size=parseFloat(css.fontSize),target=size>=24||(size>=18.66&&parseInt(css.fontWeight)>=700)?3:4.5;
  ctx.clearRect(0,0,1,1);ctx.fillStyle=css.color;ctx.fillRect(0,0,1,1);const foreground=[...ctx.getImageData(0,0,1,1).data].slice(0,3);
  for(let i=0;i<node.textContent.length;i+=7){
   if(!node.textContent[i].trim())continue;const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);
   const r=range.getBoundingClientRect(),x=Math.floor(r.x+r.width/2),y=Math.floor(r.y+r.height/2);
   if(!r.width||x<0||x>=innerWidth||y<0||y>=innerHeight)continue;
   const painted=document.elementFromPoint(x+.5,y+.5);
   if(painted&&(painted===el||el.contains(painted)))samples.push({x,y,foreground,target,text:node.textContent.trim().slice(0,65)});
  }
 }
 return samples;
}
async function sampleView(page,appearance){
 await page.evaluate(open=>{document.querySelector('.appearance').open=open;},appearance==='open');
 await page.evaluate(()=>document.querySelector('#space-motion').click());
 const samples=await page.evaluate(collectSamples);assert.ok(samples.length,'no visible text sampled');
 const hasTheme=samples.some(s=>s.text==='Theme');assert.equal(hasTheme,appearance==='open','native menu visibility must match sampled controls');
 const style=await page.addStyleTag({content:'* {color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important}'});
 let png;try{png=pixels(await page.screenshot());}finally{await style.evaluate(el=>el.remove());await page.evaluate(()=>document.querySelector('#space-motion').click());}
 return samples.map(s=>{const offset=(s.y*png.width+s.x)*4,bg=[...png.data.slice(offset,offset+3)],a=lum(s.foreground),b=lum(bg);return {...s,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
}
function result(measured,context){
 const normal=measured.filter(s=>s.target===4.5),large=measured.filter(s=>s.target===3);
 return {...context,samples:measured.length,min_normal:normal.length?Math.min(...normal.map(s=>s.ratio)):null,min_large:large.length?Math.min(...large.map(s=>s.ratio)):null,minimum:measured.reduce((a,b)=>a.ratio<b.ratio?a:b),failures:measured.filter(s=>s.ratio<s.target)};
}
async function routeViews(page,route,theme,device){
 const results=[];await page.goto('file://'+publicRoot+'/'+route+'.html');await page.waitForTimeout(220);
 const max=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
 for(const position of device==='desktop'?['start','middle','end']:['start']){
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),position==='start'?0:position==='end'?max:max*.5);await page.waitForTimeout(220);
  for(const appearance of ['closed','open'])results.push(result(await sampleView(page,appearance),{route,theme,device,position,appearance}));
 }
 return results;
}
async function matrix(browser){
 const results=[];
 for(const device of ['desktop','mobile'])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:device==='desktop'?{width:1440,height:900}:{width:390,height:844}});
  await context.addInitScript(t=>localStorage.setItem('vo.theme',t),theme);const page=await context.newPage();
  try{for(const route of routes)results.push(...await routeViews(page,route,theme,device));}finally{await context.close();}
 }
 return results;
}
async function main(){
 const sources=sourceHashes(),{chromium}=require(process.env.SITE_REVIEW_PLAYWRIGHT||'playwright');
 const browser=await chromium.launch({headless:true,...(process.env.SITE_REVIEW_CHROMIUM?{executablePath:process.env.SITE_REVIEW_CHROMIUM}:{})});
 let results;try{results=await matrix(browser);}finally{await browser.close();}
 const failures=results.flatMap(r=>r.failures.map(f=>({route:r.route,theme:r.theme,device:r.device,position:r.position,appearance:r.appearance,...f})));
 assert.deepEqual(sourceHashes(),sources,'public source changed during contrast capture');
 fs.writeFileSync(root+'/review/site-v1-20261004-v11-captures/contrast.json',JSON.stringify({method:'Chromium rendered backgrounds with motion frozen per sample and text paint hidden without layout changes; visible glyph-center pixels with native-details/CSS visibility and occlusion checks, using computed original text color. Desktop start/middle/end plus mobile start in both themes; Appearance closed and open, with control admission asserted. Sampled check, not complete WCAG certification.',sources,views:results,failures:failures.length},null,2)+'\n');
 console.log(JSON.stringify({views:results.length,samples:results.reduce((n,r)=>n+r.samples,0),min_normal:Math.min(...results.map(r=>r.min_normal).filter(Boolean)),min_large:Math.min(...results.map(r=>r.min_large).filter(Boolean)),failures:failures.slice(0,10)},null,2));
 if(failures.length)process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={collectSamples};
