"use strict";
// Review capture of the verified public artifact; no production dependency.
// SITE_REVIEW_PLAYWRIGHT points to an installed Playwright module when not on NODE_PATH.
const fs=require("node:fs"),path=require("node:path"),http=require("node:http"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const os=require("node:os");
const {chromium}=require(process.env.SITE_REVIEW_PLAYWRIGHT||"playwright");
const root=path.resolve(__dirname,".."),out=path.join(root,"review/site-v1-20261004-v11-captures");
const publicRoot=path.resolve(process.env.SITE_PUBLIC_DIR||path.join(root,"docs"));
const pages=["index","research","writing","talks","credits"],digest=value=>crypto.createHash("sha256").update(value).digest("hex");
const publicSources=()=>Object.fromEntries([".nojekyll","navigation.js","archive.js","credits.html","index.html","research.html","space.js","styles.css","talks.html","theme.js","writing.html","assets/favicon.svg","assets/vitalii-oborskyi.jpg","assets/vitalii-oborskyi-cutout.webp"].map(p=>[`docs/${p}`,digest(fs.readFileSync(path.join(publicRoot,p)))]));
const mime={".html":"text/html",".js":"text/javascript",".css":"text/css",".svg":"image/svg+xml",".webp":"image/webp",".jpg":"image/jpeg",".json":"application/json",".webm":"video/webm",".png":"image/png"};
const server=http.createServer((req,res)=>{
  const requestPath=new URL(req.url,"http://localhost").pathname;
  const sourceRoot=requestPath.startsWith('/docs/')?publicRoot:root;
  const relative=requestPath.startsWith('/docs/')?requestPath.slice(5):requestPath;
  const filename=path.resolve(sourceRoot,"."+relative);
  if(!filename.startsWith(sourceRoot+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader("Content-Type",mime[path.extname(filename)]||"application/octet-stream");fs.createReadStream(filename).pipe(res);
});
function instrument() {
  window.__review={frames:[],draws:0};
  const raf=window.requestAnimationFrame;
  window.requestAnimationFrame=fn=>raf(time=>{const start=performance.now();fn(time);window.__review.frames.push(performance.now()-start);});
  const proto=CanvasRenderingContext2D.prototype,clear=proto.clearRect;
  proto.clearRect=function(...args){window.__review.draws++;return clear.apply(this,args);};
}
const poseTrace=async page=>page.locator(".space-scene").getAttribute("data-camera");
const pixelTrace=page=>page.evaluate(()=>document.getElementById("space-canvas").toDataURL());
const idle=page=>page.waitForTimeout(230);
const overflow=page=>page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1}));
const summary=[];let browser,base;
async function nextPaint(page,timeout=1500) {
  const before=await page.evaluate(()=>({draws:window.__review.draws,phase:document.querySelector('.space-scene').dataset.phase}));
  const start=Date.now();
  try {
    await page.waitForFunction(count=>window.__review.draws>count,before.draws,{polling:50,timeout});
  }catch(error){
    const observed=await page.evaluate(()=>({draws:window.__review.draws,callbacks:window.__review.frames.length,hidden:document.hidden,motion:document.querySelector('#space-motion').textContent,scene:{...document.querySelector('.space-scene').dataset}}));
    throw Error(`No next ambient paint: ${JSON.stringify({before,elapsedMs:Date.now()-start,observed})}`,{cause:error});
  }
  const after=await page.evaluate(()=>({draws:window.__review.draws,phase:document.querySelector('.space-scene').dataset.phase}));
  assert.ok(after.draws>before.draws,'ambient drawing continues');assert.notEqual(after.phase,before.phase,'ambient phase advances');
  return {elapsedMs:Date.now()-start,paints:after.draws-before.draws};
}
async function settledCamera(page) {
  const start=Date.now();let previous=await poseTrace(page),same=0;
  while(true){
    const remaining=3000-(Date.now()-start);
    if(remaining<=0)throw Error("Camera did not settle within 3000ms");
    await nextPaint(page,Math.min(1500,remaining));
    const current=await poseTrace(page);same=current===previous?same+1:0;previous=current;
    if(same>=2)return current;
  }
}
async function visit(page,route){
  await page.goto(`${base}/docs/${route}.html`);await page.bringToFront();
  const start=Date.now();
  try {
    await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true',null,{polling:50,timeout:3000});
  }catch(error){
    const observed=await page.evaluate(()=>({draws:window.__review.draws,callbacks:window.__review.frames.length,hidden:document.hidden,motion:document.querySelector('#space-motion').textContent,scene:{...document.querySelector('.space-scene').dataset}}));
    throw Error(`Scene not ready: ${JSON.stringify({route,elapsedMs:Date.now()-start,observed})}`,{cause:error});
  }
  return {elapsedMs:Date.now()-start};
}
async function context(theme,viewport,extra={}) {
  const ctx=await browser.newContext({viewport,...extra});
  await ctx.addInitScript(instrument);
  await ctx.addInitScript(mode=>localStorage.setItem("vo.theme",mode),theme==="day"?"light":"dark");
  return ctx;
}
async function matrix() {
  for(const device of["desktop","mobile"])for(const theme of["day","night"]) {
    const viewport=device==="desktop"?{width:1440,height:900}:{width:390,height:844};
    const ctx=await context(theme,viewport,device==="mobile"?{isMobile:true,hasTouch:true}:{});
    const page=await ctx.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
    for(const route of pages) {
      const readyProbe=await visit(page,route);assert.deepEqual(errors,[],`${route} runtime errors`);const first=await pixelTrace(page);
      const dimensions=await overflow(page);assert.equal(dimensions.overflow,false,`${route} ${theme} ${device} horizontal overflow`);
      const camera=await poseTrace(page),ambientProbe=await nextPaint(page);assert.equal(await poseTrace(page),camera,"idle camera stays fixed");assert.notEqual(await pixelTrace(page),first,"geometry moves without scrolling");
      await page.screenshot({path:path.join(out,`${route}-${theme}-${device}.png`)});
      const max=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
      await page.mouse.wheel(0,Math.max(250,Math.round(max*.45)));await idle(page);
      assert.notEqual(await pixelTrace(page),first,`${route} must move with native scroll`);
      const hasScroll=max>1&&await page.evaluate(()=>scrollY)>0;
      if(hasScroll)assert.notEqual(await poseTrace(page),camera,`${route} forward scroll moves camera`);
      else assert.equal(await poseTrace(page),camera,`${route} short page keeps camera`);
      if(device==="desktop" && ["index","research","writing"].includes(route))await page.screenshot({path:path.join(out,`${route}-${theme}-lower.png`)});
      const frameTimes=await page.evaluate(()=>window.__review.frames);
      frameTimes.sort((a,b)=>a-b);
      summary.push({route,theme,device,viewport,...dimensions,readyProbe,scene_pixels_changed_after_scroll:true,native_scroll_has_range:hasScroll,native_scroll_changes_camera:hasScroll,ambient_changes_pixels:true,ambientProbe,idle_camera_stays_fixed:true,frame_callback_ms:{count:frameTimes.length,p50:frameTimes[Math.floor(frameTimes.length*.5)]||0,p95:frameTimes[Math.floor(frameTimes.length*.95)]||0,max:Math.max(...frameTimes)}});
      process.stdout.write(`${route} ${theme} ${device}: captured; scroll/ambient/overflow passed\n`);
    }
    await ctx.close();
  }
}
async function behavior() {
  const ctx=await context("night",{width:1440,height:900}),page=await ctx.newPage();
  const results={};
  for(const route of pages) {
    await visit(page,route);await page.mouse.wheel(0,550);await page.waitForTimeout(35);
    await page.locator(".appearance summary").click();await page.locator("#space-motion").click();await idle(page);
    const fixed=await poseTrace(page),frozenPixels=await pixelTrace(page);await idle(page);assert.equal(await pixelTrace(page),frozenPixels,"Off freezes ambient pixels");await page.mouse.wheel(0,600);await idle(page);assert.equal(await poseTrace(page),fixed,`${route} Off freezes scroll`);
    await page.locator("#theme-mode").selectOption("light");await idle(page);assert.equal(await poseTrace(page),fixed,`${route} theme preserves frozen pose`);
    await page.setViewportSize({width:1280,height:800});await idle(page);assert.equal(await poseTrace(page),fixed,`${route} equal-aspect resize preserves frozen pose`);
    await page.evaluate(()=>window.dispatchEvent(new Event("beforeprint")));await page.mouse.wheel(0,300);await page.evaluate(()=>window.dispatchEvent(new Event("afterprint")));await idle(page);assert.equal(await poseTrace(page),fixed,`${route} print return preserves frozen pose`);
    await page.keyboard.press("Escape");assert.equal(await page.locator(".appearance").evaluate(el=>el.open),false);assert.equal(await page.locator(".appearance summary").evaluate(el=>el===document.activeElement),true);
    await page.setViewportSize({width:1440,height:900});await page.locator(".appearance summary").click();await page.locator("#space-motion").click();await idle(page);
    const still=await settledCamera(page);await page.mouse.move(200,200);await page.mouse.move(1100,600);await nextPaint(page);assert.equal(await poseTrace(page),still);
    results[route]="Off during movement, theme/resize/print freeze, Escape/focus and pointer neutrality passed";
  }
  // Writing reflow/restoration, real history and print behavior.
  await visit(page,"writing");await page.locator("#archive-topic").selectOption("systems");await idle(page);await page.mouse.wheel(0,1000);await idle(page);
  const before=await settledCamera(page);await page.locator("#archive-year").selectOption("2025");await idle(page);assert.equal(await poseTrace(page),before,"year-only reflow keeps progress");
  await page.evaluate(()=>window.dispatchEvent(new Event("scroll")));await idle(page);assert.equal(await poseTrace(page),before,"first unchanged scroll does not reset progress");
  await page.locator("#archive-topic").selectOption("delivery");await page.locator("#archive-language").selectOption("uk");await idle(page);assert.equal(await page.locator("#archive-empty").isVisible(),true);
  await page.evaluate(()=>window.dispatchEvent(new Event("beforeprint")));assert.equal(await page.locator("li.publication:visible").count(),27);await page.evaluate(()=>window.dispatchEvent(new Event("afterprint")));assert.equal(await page.locator("li.publication:visible").count(),0);
  await page.locator(".filter-reset").click();await idle(page);assert.equal(await page.locator("li.publication:visible").count(),27);
  await page.goto(`${base}/docs/writing.html?topic=delivery&language=uk#topic-systems`);await idle(page);assert.equal(await page.locator("#archive-topic").inputValue(),"systems");assert.equal(await page.locator("#archive-language").inputValue(),"uk");
  await page.locator("#archive-language").selectOption("en");await page.goBack();await idle(page);assert.equal(await page.locator("#archive-language").inputValue(),"uk");await page.goForward();await idle(page);assert.equal(await page.locator("#archive-language").inputValue(),"en");
  results.writing_archive="topic motion; year reflow/first scroll; empty results; Reset; conflict hash/query; back/forward; all 27 records on print and filter restoration passed";
  for(const width of[360])for(const theme of["light","dark"])for(const route of pages){await page.setViewportSize({width,height:844});await visit(page,route);await page.locator(".appearance summary").click();await page.locator("#theme-mode").selectOption(theme);assert.equal((await overflow(page)).overflow,false);await page.keyboard.press("Escape");}
  results.narrow="All five routes in both themes at 360 × 844; no horizontal overflow and Appearance accessible";
  await page.setViewportSize({width:1440,height:900});
  for(const route of pages){await visit(page,route);await page.evaluate(()=>document.documentElement.style.zoom="2");await idle(page);assert.equal((await overflow(page)).overflow,false,`${route} 200% CSS zoom overflow`);}
  results.zoom="All five routes at 200% CSS zoom in Chromium; no overflow. Native browser zoom UI not tested.";
  await ctx.close();
  const reduced=await context("night",{width:1440,height:900},{reducedMotion:"reduce"}),rp=await reduced.newPage();
  for(const route of pages){await visit(rp,route);const fixed=await poseTrace(rp);await rp.mouse.wheel(0,600);await idle(rp);assert.equal(await poseTrace(rp),fixed);assert.equal(await rp.locator("#space-motion").isDisabled(),true);}await reduced.close();results.reduced="All five route-specific initial poses stay still and control is disabled";
  const nojs=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false}),np=await nojs.newPage();
  for(const route of pages){await np.goto(`${base}/docs/${route}.html`);assert.equal(await np.locator(".space-fallback").isVisible(),true);assert.equal((await overflow(np)).overflow,false);assert.equal(await np.locator("h1").count(),1);}assert.equal(await np.locator("#space-motion").isVisible(),false);await nojs.close();results.nojs="All five pages readable at 390 × 844 with SVG, content and native navigation";
  const missing=await context("day",{width:1440,height:900});await missing.addInitScript(()=>HTMLCanvasElement.prototype.getContext=()=>null);const mp=await missing.newPage();
  for(const route of pages){await mp.goto(`${base}/docs/${route}.html`);assert.equal(await mp.locator(".space-fallback").isVisible(),true);assert.equal(await mp.locator("#space-motion").isVisible(),false);}await missing.close();results.noCanvas="All five route-specific SVGs remain visible; unavailable control stays hidden";
  // A viewport tall enough for the actual short route must not manufacture scroll.
  const short=await context("day",{width:1440,height:2400}),sp=await short.newPage();await visit(sp,"talks");const fixed=await poseTrace(sp);await sp.mouse.wheel(0,1000);await idle(sp);assert.equal(await sp.evaluate(()=>scrollY),0);assert.equal(await poseTrace(sp),fixed);await short.close();results.short="Talks fits 1440 × 2400: static camera and continuing ambient cycle, no spacer or scroll interception";
  return results;
}
async function recordings() {
  const temporaryVideos=fs.mkdtempSync(path.join(os.tmpdir(),"site-v11-video-"));
  for(const route of pages) {
    const ctx=await context("night",{width:1440,height:900},{recordVideo:{dir:temporaryVideos,size:{width:1440,height:900}}}),page=await ctx.newPage();
    await visit(page,route);await page.waitForTimeout(2000);
    const max=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
    for(let i=0;i<32;i++){await page.mouse.wheel(0,Math.ceil(max/32));await page.waitForTimeout(65);}
    await page.waitForTimeout(350);for(let i=0;i<24;i++){await page.mouse.wheel(0,-Math.ceil(max/24));await page.waitForTimeout(65);}await page.waitForTimeout(2000);
    if(route==="writing"){await page.locator("#archive-topic").selectOption("delivery");await page.waitForTimeout(2000);}
    const destination=pages[(pages.indexOf(route)+1)%pages.length];
    await page.evaluate(()=>{window.__recordedHeader=document.querySelector('header');window.__recordedCanvas=document.querySelector('canvas');});
    for(const target of [destination,route]){
      await page.locator(`a[href="${target==='index'?'./':target+'.html'}"]`).first().evaluate(el=>el.click());
      await page.waitForFunction(route=>document.body.dataset.page===route&&document.querySelector('.space-scene').dataset.travel==='settled',target,{polling:50,timeout:5000});
      assert.equal(await page.evaluate(()=>window.__recordedHeader===document.querySelector('header')&&window.__recordedCanvas===document.querySelector('canvas')),true,'recorded navigation preserves shell');
      await page.waitForTimeout(700);
    }
    const video=page.video();await ctx.close();require("./compact_site_recordings.cjs").compact(await video.path(),path.join(out,`${route}-motion.webm`));
  }
  fs.rmSync(temporaryVideos,{recursive:true,force:true});
}
(async()=>{
  if(process.argv[2] && process.argv[2]!=="--recordings-only")throw Error("Usage: node tools/capture_site_review.cjs [--recordings-only]");
  fs.mkdirSync(out,{recursive:true});await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));base=`http://127.0.0.1:${server.address().port}`;
  try {
    browser=await chromium.launch({headless:true,...(process.env.SITE_REVIEW_CHROMIUM?{executablePath:process.env.SITE_REVIEW_CHROMIUM}:{})});const sources=publicSources();
    if(process.argv[2]==="--recordings-only") {
      const file=path.join(out,"captures.json"),prior=JSON.parse(fs.readFileSync(file,"utf8"));
      assert.deepEqual(prior.public_sources,sources,"recordings-only cannot reuse checks for changed public sources");
      await recordings();assert.deepEqual(publicSources(),sources,"source changed while recording");
      for(const page of pages){const name=`${page}-motion.webm`;prior.files[name]=digest(fs.readFileSync(path.join(out,name)));}
      prior.recording_delivery=require("./compact_site_recordings.cjs").delivery;prior.recorded_at=new Date().toISOString();
      fs.writeFileSync(file,JSON.stringify(prior,null,2)+"\n");process.stdout.write("Five actual recordings refreshed; source-matched matrix and checks retained.\n");return;
    }
    await matrix();
    const checks=await behavior();await recordings();assert.deepEqual(publicSources(),sources,"source changed during capture");
    const files=Object.fromEntries(fs.readdirSync(out).filter(name=>/\.(png|webm)$/.test(name)).map(name=>[name,digest(fs.readFileSync(path.join(out,name)))]));
    fs.writeFileSync(path.join(out,"captures.json"),JSON.stringify({edition:"v11",captured_at:new Date().toISOString(),baseline_ref:process.env.SITE_CANDIDATE_SHA||"candidate working tree",source_state:"candidate working tree; exact public_sources hashes",browser:browser.version(),public_sources:sources,views:summary,checks,files,recording_delivery:require("./compact_site_recordings.cjs").delivery,limits:["Headless Linux Chromium; mobile viewport/touch emulation, not physical phone hardware.","200% CSS zoom tested; native browser zoom UI not tested.","Native hidden-tab switching and a real print dialog not observed; print lifecycle dispatched and print CSS inspected separately.","Frame callback timings include review instrumentation and are observations of this machine, not a device/FPS guarantee."]},null,2)+"\n");
    process.stdout.write("Complete browser matrix, behavior and five real motion recordings saved.\n");
  } finally {if(browser)await browser.close();server.close();}
})().catch(error=>{process.stderr.write(error.stack+"\n");process.exitCode=1;});
