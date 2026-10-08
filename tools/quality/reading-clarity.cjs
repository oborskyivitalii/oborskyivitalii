'use strict';
// Opt-in visual diagnostic: compare the two exact CSS renditions on one DOM.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {toolRequire,launchOptions,environment}=require('./common.cjs');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const routes=['index','research','writing','talks','credits'];
function readingStyle(html){return html.match(/<style data-ribbon-reading-surface>([\s\S]*?)<\/style>/)?.[1]||'';}
function serve(root){
  const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'};
  const server=http.createServer((req,res)=>{
    let file;
    try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));}catch{res.writeHead(400).end();return;}
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(fs.readFileSync(file));
  });
  return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve({server,url:'http://127.0.0.1:'+server.address().port})));
}
async function styles(page,css,reading,theme,zoom){
  await page.evaluate(({css,reading,theme,zoom})=>{
    document.querySelectorAll('link[rel="stylesheet"],style[data-ribbon-reading-surface],style[data-reading-comparison]').forEach(el=>el.remove());
    const el=document.createElement('style');el.dataset.readingComparison='true';el.textContent=css+'\n'+reading;document.head.appendChild(el);
    document.documentElement.dataset.theme=theme;document.documentElement.style.zoom=String(zoom);
  },{css,reading,theme,zoom});
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
}
async function measure(page){
  return page.evaluate(()=>{
    const rect=r=>[r.x,r.y,r.width,r.height];
    function protection(heading){
      const title=heading.querySelector('.reading-title');
      if(title){
        const css=getComputedStyle(title),lengths=css.boxShadow.match(/-?[\d.]+px/g)||[];
        return {kind:'inline-fragments',fontSize:parseFloat(css.fontSize),spread:parseFloat(lengths[3]||'0'),background:css.backgroundColor,shadow:css.boxShadow,fragments:[...title.getClientRects()].map(rect)};
      }
      let el=heading;
      while(el&&el.tagName!=='MAIN'){
        const css=getComputedStyle(el),before=getComputedStyle(el,'::before');
        if(before.content!=='none'&&before.content!=='normal'&&before.backgroundColor!=='rgba(0, 0, 0, 0)'){
          const box=el.getBoundingClientRect(),zoom=Number(document.documentElement.style.zoom)||1;
          const feather=before.maskImage==='none'?0:Number(before.maskImage.match(/#000\s+([\d.]+)px/)?.[1]||before.maskImage.match(/rgb\(0, 0, 0\)\s+([\d.]+)px/)?.[1]||parseFloat(css.getPropertyValue('--surface-gutter'))||0);
          const glyph=heading.getBoundingClientRect();
          return {kind:'masked-panel',selector:el.className||el.tagName,fontSize:parseFloat(getComputedStyle(heading).fontSize),inset:[before.top,before.right,before.bottom,before.left],feather,background:before.backgroundColor,outset:css.getPropertyValue('--surface-outset'),leftRoom:glyph.left-box.left-(parseFloat(before.left)+feather)*zoom,rightRoom:box.right-glyph.right-(parseFloat(before.right)+feather)*zoom};
        }
        el=el.parentElement;
      }
      return null;
    }
    const headings=[...document.querySelectorAll('main h1,main h2,main h3')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;}).map(el=>{
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),glyphs=[];
      let node;
      while((node=walker.nextNode()))if(node.textContent.trim()){const range=document.createRange();range.selectNodeContents(node);glyphs.push(...[...range.getClientRects()].map(rect));}
      return {id:el.id,tag:el.tagName,text:el.textContent,rect:rect(el.getBoundingClientRect()),glyphs,fontSize:parseFloat(getComputedStyle(el).fontSize),protection:protection(el)};
    });
    return {innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,headings};
  });
}
function compareGeometry(before,after){
  assert.equal(after.headings.length,before.headings.length,'visible heading count');
  assert.equal(after.scrollWidth,before.scrollWidth,'scroll width unchanged');
  assert.equal(after.overflow,before.overflow,'no new horizontal overflow');
  for(let i=0;i<before.headings.length;i++){
    const a=before.headings[i],b=after.headings[i];
    for(const field of ['id','tag','text','rect','glyphs','fontSize'])assert.deepEqual(b[field],a[field],a.text+': unchanged '+field);
  }
}
function compare(before,after){
  compareGeometry(before,after);
  for(const b of after.headings){
    if(b.fontSize<25)continue;
    assert.ok(b.protection,b.text+': reading protection present');
    if(b.protection.kind==='inline-fragments')assert.ok(b.protection.spread>=b.fontSize*.12,b.text+': per-line painted margin');
    else{
      assert.ok(b.protection.leftRoom>0,b.text+': left solid reading margin');
      assert.ok(b.protection.rightRoom>0,b.text+': right solid reading margin');
    }
  }
}
function installPaintProbe({theme}) {
  const trace = {frames: [], events: [], leg: 'boot', dropped: 0, error: null};
  const pose = value => ({position: [...value.position], target: [...value.target]});
  const mark = (kind, detail = {}) => {
    const scene = document.querySelector('.space-scene');
    trace.events.push({
      kind, time: performance.now(), leg: trace.leg, frame: trace.frames.length,
      camera: scene?.dataset.camera ? JSON.parse(scene.dataset.camera) : null,
      phase: Number(scene?.dataset.phase) || 0,
      scrollY, maxScroll: Math.max(0, document.documentElement.scrollHeight - innerHeight),
      ...detail
    });
  };
  trace.mark = mark;
  window.__readingPaint = trace;
  localStorage.setItem('vo.motion', 'on');
  localStorage.setItem('vo.theme', theme);
  localStorage.setItem('vo.content-flight', 'on');
  window.SiteEngineProbe = event => {
    if (['navigation-start', 'navigation-ready', 'layout'].includes(event.kind)) {
      mark(event.kind, {...event});
      return;
    }
    if (event.kind !== 'paint') return;
    if (trace.frames.length >= 1600) {
      trace.dropped++;
      return;
    }
    try {
      const {current, ambientTime, width, height, compact, detailTier, journey} = event;
      trace.frames.push({
        time: event.time, leg: trace.leg, camera: pose(current), phase: ambientTime,
        width, height, compact, detailTier,
        journey: journey ? {...journey, from: pose(journey.from), to: pose(journey.to)} : null
      });
    } catch (error) {
      trace.error = String(error.stack || error);
    }
  };
  window.addEventListener('site:page-mount', event => mark('mount', {page: event.detail.page}));
  window.addEventListener('site:page-ready', event => mark('mount-ready', {page: event.detail.page}));
}
function cameraDistance(a,b){return Math.hypot(...a.position.map((v,i)=>v-b.position[i]),...a.target.map((v,i)=>v-b.target[i]));}
function validateArrivalDepth(frames,flying,start,leg){
  const arrival=frames.findLast(row=>!row.journey);
  assert.ok(arrival,leg.id+': final endpoint paint retained');
  assert.ok(cameraDistance(flying[0].journey.to,arrival.camera)<1e-5,leg.id+': departure already targets the actual destination endpoint');
  const from=start.camera.position[2],to=arrival.camera.position[2],direction=Math.sign(to-from);
  let previous=from;
  for(const row of frames){
    const z=row.camera.position[2];
    assert.ok(z>=Math.min(from,to)-1e-5&&z<=Math.max(from,to)+1e-5,leg.id+': camera cannot pass the intended endpoint before mount');
    assert.ok(direction*(z-previous)>=-1e-5,leg.id+': content mount cannot reverse camera depth');previous=z;
  }
}
function validateNativeEndpoints(trace,leg){
  const edge=trace.events.find(event=>event.leg==='edge-'+leg.id&&event.kind==='edge-ready');
  assert.ok(edge,leg.id+': actual departure edge retained');
  const ready=trace.events.find(event=>event.leg===leg.id&&event.kind==='navigation-ready');
  const mount=trace.events.find(event=>event.leg===leg.id&&event.kind==='mount');
  const landed=trace.events.find(event=>event.leg===leg.id&&event.kind==='mount-ready'&&event.page===leg.to);
  // page-mount deliberately precedes archive filters and native scroll restore.
  // page-ready follows synchronous destination layout and observes the landing.
  assert.ok(mount&&landed&&mount.time<=landed.time,leg.id+': native landing follows content mount');
  for(const event of [edge,landed,ready]){
    assert.ok(Number.isFinite(event?.scrollY)&&Number.isFinite(event?.maxScroll),leg.id+': native scroll range observed');
  }
  const backward=leg.direction==='backward';
  assert.ok(Math.abs(edge.scrollY-(backward?0:edge.maxScroll))<=2,leg.id+': actual source departure edge');
  for(const event of [landed,ready])assert.ok(Math.abs(event.scrollY-(backward?event.maxScroll:0))<=2,leg.id+': actual destination scroll endpoint');
}
function validatePaintTrace(trace,legs){
  assert.equal(trace.error, null, 'paint observer completed');
  assert.equal(trace.dropped, 0, 'bounded trace retained every observed paint');
  assert.ok(trace.frames.length > 20, 'successful native paints observed');
  for (const row of trace.frames) {
    assert.ok(Number.isFinite(row.time) && Number.isFinite(row.phase), 'native paint clock observed');
    assert.ok(row.width > 0 && row.height > 0, 'native paint viewport observed');
    assert.ok(Number.isFinite(row.detailTier), 'native paint detail tier observed');
    assert.ok([...row.camera.position, ...row.camera.target].every(Number.isFinite), 'native paint camera observed');
  }
  const deltas=[];
  for(let i=1;i<trace.frames.length;i++){
    const a=trace.frames[i-1],b=trace.frames[i],phase=(b.phase-a.phase+24000)%24000,wall=b.time-a.time;
    assert.ok(phase<=wall+80,'shared ambient clock has no phase reset');
    if(a.leg==='boot'&&b.leg==='boot')continue;
    // Edge preparation is ordinary native-scroll camera following, before the
    // flight under review. It has its own retained frames and explicit label.
    if(a.leg.startsWith('edge-')||b.leg.startsWith('edge-'))continue;
    const speed=journey=>journey?2*cameraDistance(journey.to,journey.from)/journey.duration:0;
    const distance=cameraDistance(a.camera,b.camera),bound=Math.max(speed(a.journey),speed(b.journey))*phase+1e-4;
    assert.ok(distance<=bound,'painted camera follows a continuous bounded journey: '+b.leg);
    deltas.push({from:i-1,to:i,phase,wall,distance,bound});
  }
  for(const leg of legs){
    const start=trace.events.find(event=>event.leg===leg.id&&event.kind==='navigate-before');
    assert.ok(start,leg.id+': navigation start observed');
    const after=trace.events.find(event=>event.leg===leg.id&&event.kind==='navigate-after');
    assert.ok(after,leg.id+': navigation handoff observed');
    assert.deepEqual(after.camera,start.camera,leg.id+': navigation preserves displayed camera');assert.equal(after.phase,start.phase,leg.id+': navigation preserves displayed phase');
    const frames=trace.frames.filter((row,index)=>row.leg===leg.id&&index>=start.frame),flying=frames.filter(row=>row.journey);
    assert.ok(flying.length>=3,leg.id+': actual animated flight');
    assert.equal(flying[0].journey.elapsed,0,leg.id+': first flight paint starts at elapsed zero');
    assert.ok(cameraDistance(flying[0].camera,start.camera)<1e-8,leg.id+': first paint retains last displayed camera');
    let progress=0;
    for(const row of frames){const next=row.journey?row.journey.progressStart+(1-row.journey.progressStart)*row.journey.elapsed/row.journey.duration:1;assert.ok(next>=progress-1e-9,leg.id+': painted progress remains monotonic');progress=next;}
    if(!leg.interrupted){
      assert.ok(frames.some(row=>!row.journey),leg.id+': arrival paint retained');
      assert.ok(trace.events.some(event=>event.leg===leg.id&&event.kind==='mount'&&event.page===leg.to),leg.id+': actual destination mounted');
      assert.ok(trace.events.some(event=>event.leg===leg.id&&event.kind==='navigation-ready'&&event.page===leg.to),leg.id+': navigation arrived');
      if(leg.edgeFlight){validateArrivalDepth(frames,flying,start,leg);validateNativeEndpoints(trace,leg);}
    }
  }
  return {
    paints: trace.frames.length,
    observedDetailTiers: [...new Set(trace.frames.map(row => Number(row.detailTier.toFixed(3))))],
    deltas
  };
}
async function prepareDepartureEdge(page,leg){
  await page.evaluate(leg=>{
    const trace=window.__readingPaint;trace.leg='edge-'+leg.id;trace.mark('edge-prepare',{direction:leg.direction});
    window.scrollTo(0,leg.direction==='backward'?0:Math.max(0,document.documentElement.scrollHeight-innerHeight));
  },leg);
  await page.waitForFunction(id=>{
    const rows=window.__readingPaint.frames.filter(row=>row.leg==='edge-'+id).slice(-3);
    if(rows.length<3)return false;
    const last=rows[2].camera;
    return rows.every(row=>Math.hypot(...row.camera.position.map((value,i)=>value-last.position[i]),...row.camera.target.map((value,i)=>value-last.target[i]))<1e-6);
  },leg.id,{polling:25,timeout:5000});
  await page.evaluate(()=>window.__readingPaint.mark('edge-ready'));
}
async function paintContext(browser,url,output,row){
  const {width,theme,startRoute}=row,height=width===390?844:900;
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',recordVideo:{dir:path.join(output,'paint-video'),size:{width,height}}});
  await context.addInitScript(installPaintProbe,{theme});
  const page=await context.newPage(),video=page.video();page.on('pageerror',error=>row.errors.push(error.message));
  const ready=route=>page.waitForFunction(route=>document.body.dataset.page===route&&document.querySelector('.space-scene').dataset.ready==='true'&&document.querySelector('.space-scene').dataset.travel==='settled'&&!document.getElementById('site-content').hasAttribute('aria-busy'),route,{polling:25,timeout:8000});
  const begin=async leg=>{
    row.legs.push(leg);await page.evaluate(leg=>{
      window.__readingPaint.leg=leg.id;window.__readingPaint.mark('request',{to:leg.to});
      if(leg.edgeFlight)window.SiteNavigation.go(leg.to,{atEnd:leg.direction==='backward'});
      else{const href=leg.to==='index'?'./':leg.to+'.html';document.querySelector('.site-header nav a[href="'+href+'"]').click();}
    },leg);
  };
  try{
    await page.goto(url+'/'+startRoute+'.html',{waitUntil:'load'});await ready(startRoute);
    assert.equal(await page.locator('meta[name="site-variant"]').getAttribute('content'),'color','navigation evidence uses actual Color artifact');
    await page.evaluate(()=>{
      const original=window.SiteScene.navigate;
      window.SiteScene.navigate=function(...args){const trace=window.__readingPaint;trace.mark('navigate-before',{to:args[0]});const result=original.apply(this,args);trace.mark('navigate-after',{to:args[0]});return result;};
    });
    let from=startRoute;
    const itinerary=startRoute==='index'?['research','writing','talks','writing','research','index']:['writing','research','index','research','writing','talks'];
    for(const round of ['cold','warm'])for(const to of itinerary){
      const leg={id:round+'-'+from+'-'+to,from,to,edgeFlight:true,direction:routes.indexOf(to)>routes.indexOf(from)?'forward':'backward'};
      await prepareDepartureEdge(page,leg);await begin(leg);await ready(to);
      await page.waitForFunction(id=>window.__readingPaint.frames.filter(row=>row.leg===id&&!row.journey).length>=2,leg.id,{polling:25,timeout:2000});from=to;
    }
    await begin({id:'retarget-departure',from,to:from==='index'?'research':'writing',interrupted:true});
    await page.waitForFunction(()=>window.__readingPaint.frames.some(row=>row.leg==='retarget-departure'&&row.journey&&row.journey.elapsed/row.journey.duration>.18),null,{polling:20,timeout:5000});
    await begin({id:'retarget-arrival',from:'midflight',to:'talks'});
    await page.waitForFunction(()=>window.__readingPaint.frames.some(row=>row.leg==='retarget-arrival'&&row.journey&&row.journey.elapsed/row.journey.duration>.35),null,{polling:20,timeout:5000});
    await page.evaluate(()=>window.__readingPaint.mark('height-resize'));await page.setViewportSize({width,height:height-60});await ready('talks');
    row.trace=await page.evaluate(()=>{const {frames,events,dropped,error}=window.__readingPaint;return {frames,events,dropped,error};});
    assert.ok(row.trace.frames.some(frame=>frame.leg==='retarget-arrival'&&frame.journey&&frame.height===height-60),'viewport reflow reached an actual flying paint');
    row.summary=validatePaintTrace(row.trace,row.legs);assert.deepEqual(row.errors,[]);row.pass=true;
  }catch(error){row.error=String(error.stack||error);if(!row.trace)row.trace=await page.evaluate(()=>{const {frames,events,dropped,error}=window.__readingPaint;return {frames,events,dropped,error};}).catch(()=>null);}
  finally{
    await context.close();row.video='paint-'+width+'-'+theme+'-'+startRoute+'.webm';await video.saveAs(path.join(output,row.video));await video.delete();
  }
}
async function paintNavigation(browser,url,output,result){
  result.navigation = [];
  result.paintReference = {
    observer: 'SiteEngineProbe paint after successful native scene paint',
    protocol: 'Eight fresh live Color contexts starting at Home or Talks; first unvisited targets in both directions, then warm page-cache flights from observed native edges, backward atEnd landing, endpoint depth bounds/no mount reversal, shared ambient phase, quick retarget and height reflow. No performance verdict.'
  };
  for(const width of [390,1440])for(const theme of ['light','dark'])for(const startRoute of ['index','talks']){
    const row={width,theme,startRoute,pass:false,legs:[],errors:[]};result.navigation.push(row);
    await paintContext(browser,url,output,row);
  }
  assert.ok(result.navigation.every(row=>row.pass),'complete native camera and paint navigation evidence; inspect retained traces and clips');
}
async function surfaceSamples(page,route,width,theme,result){
  const selectors={index:[width<=640?'.hero h1':'.hero-copy','.help-grid article','.site-footer>p','.appearance[open] .display-controls'],research:['.reading-title','.research-card'],writing:['.reading-title','.archive-filters','.publication','.year-heading'],talks:['.reading-title','.talks-list .publication'],credits:['.credits-page>h1']};
  const observed=await page.evaluate(selectors=>{
    const appearance=document.querySelector('.appearance'),wasOpen=appearance?.open;
    if(appearance)appearance.open=true;
    const samples=selectors.map(selector=>{
      const el=document.querySelector(selector);if(!el)return {selector,missing:true};
      const inline=el.matches('.reading-title'),direct=inline||el.matches('.display-controls'),css=getComputedStyle(el,direct?null:'::before'),lengths=css.boxShadow.match(/-?[\d.]+px/g)||[],spread=inline?parseFloat(lengths[3]||'0'):0;
      const outerRadii=['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'].map(corner=>parseFloat(css[corner])+spread);
      return {selector,inline,background:css.backgroundColor,reducedTransparency:matchMedia('(prefers-reduced-transparency: reduce)').matches,opacity:css.opacity,mask:css.maskImage,filter:css.filter,backdropFilter:css.backdropFilter,shadowBlur:parseFloat(lengths[2]||'0'),outerRadii};
    });
    if(appearance)appearance.open=wasOpen;
    return samples;
  },selectors[route]);
  for(const sample of observed){sample.backgroundAlpha=paintAlpha(sample.background);validateSurfaceSample(sample);}
  result.surfaceSamples??=[];result.surfaceSamples.push(...observed.map(sample=>({route,width,theme,...sample})));
}
function paintAlpha(background){
  const value=String(background).trim(),alpha=value.match(/\/\s*([\d.]+)(%)?\s*\)$/)||value.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)(%)?\s*\)$/);
  if(alpha)return Number(alpha[1])/(alpha[2]?100:1);
  return /^(?:rgb|color)\([^/]+\)$/.test(value)?1:NaN;
}
function validateSurfaceSample(sample){
  assert.equal(sample.missing,undefined,'actual reading sample '+sample.selector);
  const measuredAlpha=paintAlpha(sample.background),expectedAlpha=sample.reducedTransparency?1:.87;
  assert.ok(Number.isFinite(measuredAlpha)&&Math.abs(sample.backgroundAlpha-measuredAlpha)<.00001,'actual background alpha measured independently of element opacity');
  assert.ok(Math.abs(measuredAlpha-expectedAlpha)<.00001,'shared historical paper alpha or explicit reduced-transparency preference');
  assert.equal(sample.opacity,'1','title ink and popup controls retain full element opacity');assert.equal(sample.mask,'none','shared crisp surface edge');
  assert.equal(sample.filter,'none','surface paint does not blur text');assert.equal(sample.backdropFilter,'none','shared crisp surface edge');assert.equal(sample.shadowBlur,0,'shared unblurred surface edge');
  assert.ok(Array.isArray(sample.outerRadii)&&sample.outerRadii.length===4,'all four visible outer corners measured');
  assert.ok(sample.outerRadii.every(radius=>Number.isFinite(radius)&&Math.abs(radius-12)<.02),'shared visible outer corner radius');
}
function validateSurfaceSamples(samples){
  assert.equal(samples.length,52,'13 actual surfaces at two widths and two themes');
  for(const sample of samples)validateSurfaceSample(sample);
  const popups=samples.filter(sample=>sample.selector==='.appearance[open] .display-controls');
  assert.deepEqual(popups.map(sample=>[sample.width,sample.theme].join('/')).sort(),['1440/dark','1440/light','320/dark','320/light'],'Appearance panel measured at both widths and themes');
  for(const theme of ['light','dark']){
    const rows=samples.filter(row=>row.theme===theme),background=rows[0].background;
    assert.ok(background!=='rgba(0, 0, 0, 0)','shared visible theme paper');
    assert.ok(rows.every(row=>row.background===background),'all surface types and widths use the same theme paper color');
  }
}
async function maybeSurfaceSamples(page,route,width,theme,zoom,result){
  if(zoom===1&&[320,1440].includes(width))await surfaceSamples(page,route,width,theme,result);
}
async function headingCases(page,reference,fixture,baseline,candidate,baselineCss,candidateCss,output,result){
  for(const width of [320,768,1440])for(const theme of ['light','dark'])for(const zoom of [1,2])for(const route of routes){
    const entry={route,width,theme,zoom,pass:false};result.cases.push(entry);
    await page.setViewportSize({width,height:900});
    const baselineReading=readingStyle(fs.readFileSync(path.join(baseline,route+'.html'),'utf8')),candidateReading=readingStyle(fs.readFileSync(path.join(candidate,route+'.html'),'utf8'));
    await page.goto(reference.url+'/'+route+'.html',{waitUntil:'load'});await styles(page,baselineCss,baselineReading,theme,zoom);entry.baseline=await measure(page);
    await page.goto(fixture.url+'/'+route+'.html',{waitUntil:'load'});
    await styles(page,baselineCss,baselineReading,theme,zoom);entry.before=await measure(page);
    compareGeometry(entry.baseline,entry.before);
    const capture=['talks','writing'].includes(route)&&width>=768&&zoom===1;
    if(capture){const file='heading-'+route+'-'+width+'-'+theme+'-before.png';await page.screenshot({path:path.join(output,file)});result.captures.push(file);}
    await styles(page,candidateCss,candidateReading,theme,zoom);entry.after=await measure(page);
    if(capture){const file='heading-'+route+'-'+width+'-'+theme+'-after.png';await page.screenshot({path:path.join(output,file)});result.captures.push(file);}
    compare(entry.before,entry.after);
    await maybeSurfaceSamples(page,route,width,theme,zoom,result);
    entry.pass=true;
  }
  validateSurfaceSamples(result.surfaceSamples);
}
async function formulaCaptures(page,reference,fixture,output,result){
  result.formula=[];
  for(const width of [390,768,1440])for(const theme of ['light','dark'])for(const edition of ['baseline','candidate']){
    const origin=edition==='baseline'?reference.url:fixture.url;
    await page.setViewportSize({width,height:900});
    await page.goto(origin+'/writing.html',{waitUntil:'load'});
    await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.style.zoom='1';},theme);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true'&&window.SiteScene?.formulaDiagnostics()?.lastPaintCount===1,null,{timeout:5000});
    const observed=await page.evaluate(()=>({formula:window.SiteScene.formulaDiagnostics(),canvas:{width:document.querySelector('canvas').width,height:document.querySelector('canvas').height},overflow:document.documentElement.scrollWidth>innerWidth+1}));
    assert.equal(observed.formula.status,'ready');assert.equal(observed.formula.cacheBuilds,1);assert.equal(observed.formula.lastPaintCount,1);assert.equal(observed.formula.lastDrawSubmissions,24);assert.equal(observed.formula.bytes,1380*240*4);
    const file='formula-'+edition+'-'+width+'-'+theme+'.png';await page.screenshot({path:path.join(output,file)});result.captures.push(file);result.formula.push({edition,width,theme,file,observed});
  }
}
async function main(){
  const [candidateArg,baselineArg,outputArg]=process.argv.slice(2);
  assert.ok(candidateArg&&baselineArg&&outputArg,'usage: reading-clarity.cjs candidate-public baseline-public report-directory');
  const candidate=path.resolve(candidateArg),baseline=path.resolve(baselineArg),output=path.resolve(outputArg);
  fs.mkdirSync(output,{recursive:true});
  const candidateCss=fs.readFileSync(path.join(candidate,'styles.css'),'utf8'),baselineCss=fs.readFileSync(path.join(baseline,'styles.css'),'utf8');
  const result={schema:1,kind:'reading-clarity',pass:false,environment:environment(),css:{baseline:hash(baselineCss),candidate:hash(candidateCss)},comparison:'actual baseline DOM geometry, then same candidate DOM with exact baseline/candidate shared CSS and reading style replaced',zoom:'CSS zoom at 100% and 200%; not physical Safari/iPad acceptance',cases:[],captures:[]};
  const source=directory=>{
    const manifest=JSON.parse(fs.readFileSync(path.join(directory,'../artifact.json'),'utf8'));
    return {sourceCommit:manifest.sourceCommit,sourceTree:manifest.sourceTree,artifactDigest:manifest.artifactDigest,variant:manifest.variant||manifest.components?.variant};
  };
  result.sources={candidate:source(candidate),baseline:source(baseline)};
  if(process.env.SITE_CANDIDATE_SHA)assert.equal(result.sources.candidate.sourceCommit,process.env.SITE_CANDIDATE_SHA);
  if(process.env.READING_BASELINE_SHA)assert.equal(result.sources.baseline.sourceCommit,process.env.READING_BASELINE_SHA);
  let fixture,reference,browser;
  try{
    fixture=await serve(candidate);reference=await serve(baseline);browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));result.browserVersion=browser.version();
    const context=await browser.newContext({reducedMotion:'reduce'});
    await context.addInitScript(()=>{try{localStorage.setItem('vo.motion','off');}catch{/* Reduced motion also freezes unavailable storage. */}});
    const page=await context.newPage();
    await headingCases(page,reference,fixture,baseline,candidate,baselineCss,candidateCss,output,result);
    await formulaCaptures(page,reference,fixture,output,result);
    await paintNavigation(browser,fixture.url,output,result);result.pass=true;
  }catch(error){result.error=String(error.stack||error);process.exitCode=1;}
  finally{
    if(browser)await browser.close();if(fixture)await new Promise(resolve=>fixture.server.close(resolve));if(reference)await new Promise(resolve=>reference.server.close(resolve));
    fs.writeFileSync(path.join(output,'reading-clarity.json'),JSON.stringify(result,null,2)+'\n');
    process.stdout.write(JSON.stringify({pass:result.pass,cases:result.cases.length,captures:result.captures.length,navigation:result.navigation?.length||0,error:result.error||null,report:path.join(output,'reading-clarity.json')})+'\n');
  }
}
if(require.main===module)main().catch(error=>{process.stderr.write(String(error.stack||error)+'\n');process.exitCode=1;});
module.exports={measure,compare,compareGeometry,styles,readingStyle,validatePaintTrace,validateArrivalDepth,validateNativeEndpoints,paintNavigation,validateSurfaceSamples,paintAlpha};
