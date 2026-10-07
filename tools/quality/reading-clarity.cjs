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
          const feather=Number(before.maskImage.match(/#000\s+([\d.]+)px/)?.[1]||before.maskImage.match(/rgb\(0, 0, 0\)\s+([\d.]+)px/)?.[1]||parseFloat(css.getPropertyValue('--surface-gutter'))||0);
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
function compare(before,after){
  assert.equal(after.headings.length,before.headings.length,'visible heading count');
  assert.equal(after.scrollWidth,before.scrollWidth,'scroll width unchanged');
  assert.equal(after.overflow,before.overflow,'no new horizontal overflow');
  for(let i=0;i<before.headings.length;i++){
    const a=before.headings[i],b=after.headings[i];
    for(const field of ['id','tag','text','rect','glyphs','fontSize'])assert.deepEqual(b[field],a[field],a.text+': unchanged '+field);
    if(b.fontSize<25)continue;
    assert.ok(b.protection,b.text+': reading protection present');
    if(b.protection.kind==='inline-fragments')assert.ok(b.protection.spread>=b.fontSize*.12,b.text+': per-line painted margin');
    else{
      assert.ok(b.protection.leftRoom>0,b.text+': left solid reading margin');
      assert.ok(b.protection.rightRoom>0,b.text+': right solid reading margin');
    }
  }
}
function installRibbonProbe({math,geometry,theme}){
  const api=eval('('+math+')')(),section=eval('('+geometry+')')(api);
  const trace={frames:[],events:[],leg:'boot',dropped:0,error:null};
  const pose=value=>({position:[...value.position],target:[...value.target]});
  const mark=(kind,detail={})=>{
    const scene=document.querySelector('.space-scene');
    trace.events.push({kind,time:performance.now(),leg:trace.leg,frame:trace.frames.length,camera:scene?.dataset.camera?JSON.parse(scene.dataset.camera):null,phase:Number(scene?.dataset.phase)||0,...detail});
  };
  trace.mark=mark;window.__readingRibbon=trace;
  localStorage.setItem('vo.motion','on');localStorage.setItem('vo.theme',theme);localStorage.setItem('vo.content-flight','on');
  window.SiteEngineProbe=event=>{if(['navigation-start','navigation-ready','layout'].includes(event.kind))mark(event.kind,{...event});};
  window.addEventListener('site:page-mount',event=>mark('mount',{page:event.detail.page}));
  window.SiteRibbonProbe=({current,width,height,ambientTime,compact,detailTier,gridStep,meshStride,journey,shapes})=>{
    if(trace.frames.length>=1600){trace.dropped++;return;}
    try{
      const forward=api.normalize(api.sub(current.target,current.position)),right=api.normalize(api.cross(forward,[0,1,0])),up=api.cross(right,forward);
      const focal=(compact?Math.min(height,width*1.15):height)/(2*Math.tan(Math.PI/8)),cx=width*(compact?.42:.66),cy=height*.48;
      const stations=new Map(),selected=[],perRibbon=[0,0,0];
      let residual=0,seam=0,colorSeam=0,checked=0,clipped=0;
      for(const shape of shapes)for(const point of shape.points){
        const side=Math.round(point[2]),z=point[3];
        if(Math.abs(point[2]-side)>1e-8||Math.abs(z/gridStep-Math.round(z/gridStep))>1e-8){clipped++;continue;}
        const key=shape.ribbon+'/'+side+'/'+z,world=section(z,shape.ribbon,ambientTime)[side===0?'left':'right'],relative=api.sub(world,current.position),depth=api.dot(relative,forward);
        const expected=[cx+api.dot(relative,right)*focal/depth,cy-api.dot(relative,up)*focal/depth];
        residual=Math.max(residual,Math.hypot(point[0]-expected[0],point[1]-expected[1]));checked++;
        const previous=stations.get(key);
        if(previous){seam=Math.max(seam,Math.hypot(point[0]-previous[0],point[1]-previous[1]));colorSeam=Math.max(colorSeam,...point.slice(4,7).map((v,i)=>Math.abs(v-previous[i+4])));}
        else{
          stations.set(key,point);
          if(perRibbon[shape.ribbon]<8&&depth>=4&&expected[0]>-width*.2&&expected[0]<width*1.2&&expected[1]>-height*.2&&expected[1]<height*1.2){
            selected.push({key,actual:point.slice(0,2),expected,world,depth});perRibbon[shape.ribbon]++;
          }
        }
      }
      trace.frames.push({time:performance.now(),leg:trace.leg,camera:pose(current),phase:ambientTime,width,height,compact,detailTier,gridStep,meshStride,journey:journey?{...journey,from:pose(journey.from),to:pose(journey.to)}:null,shapes:shapes.length,stations:stations.size,checked,clipped,residual,seam,colorSeam,selected});
    }catch(error){trace.error=String(error.stack||error);}
  };
}
function cameraDistance(a,b){return Math.hypot(...a.position.map((v,i)=>v-b.position[i]),...a.target.map((v,i)=>v-b.target[i]));}
function validateRibbonTrace(trace,legs){
  assert.equal(trace.error,null,'ribbon observer completed');assert.equal(trace.dropped,0,'bounded trace retained every observed paint');
  assert.ok(trace.frames.length>20,'actual ribbon paints observed');
  for(const row of trace.frames){
    assert.ok(row.checked>0&&row.stations>0,'actual unclipped material stations');
    assert.ok(row.residual<1e-5,'submitted stations keep their analytic world identity');
    assert.ok(row.seam<1e-6&&row.colorSeam<1e-6,'shared material stations join exactly');
    assert.equal(row.gridStep,row.compact?3:1.25,'viewport retains its fixed material lattice');
    assert.ok([1,2,3].includes(row.meshStride),'bounded whole-cell adaptive grouping');
  }
  const deltas=[];
  for(let i=1;i<trace.frames.length;i++){
    const a=trace.frames[i-1],b=trace.frames[i],phase=(b.phase-a.phase+24000)%24000,wall=b.time-a.time;
    assert.ok(phase<=wall+80,'shared ambient clock has no phase reset');
    if(a.leg==='boot'&&b.leg==='boot')continue;
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
    }
  }
  return {paints:trace.frames.length,stations:trace.frames.reduce((n,row)=>n+row.checked,0),maxProjectionResidual:Math.max(...trace.frames.map(row=>row.residual)),maxSeamError:Math.max(...trace.frames.map(row=>row.seam)),observedDetailTiers:[...new Set(trace.frames.map(row=>Number(row.detailTier.toFixed(3))))],deltas};
}
async function ribbonNavigation(browser,url,output,result){
  const math=require('../../site/engine/math.cjs').toString(),geometry=require('../../review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs').ribbonGeometry.toString();
  result.navigation=[];result.ribbonReference={math:hash(math),geometry:hash(geometry),protocol:'Four fresh live Color contexts; actual paint commands and analytic world stations; all adjacent forward/reverse flights, midflight retarget and height reflow. No performance verdict.'};
  for(const width of [390,1440])for(const theme of ['light','dark']){
    const height=width===390?844:900,row={width,theme,pass:false,legs:[],errors:[]};result.navigation.push(row);
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',recordVideo:{dir:path.join(output,'ribbon-video'),size:{width,height}}});
    await context.addInitScript(installRibbonProbe,{math,geometry,theme});
    const page=await context.newPage(),video=page.video();page.on('pageerror',error=>row.errors.push(error.message));
    const ready=route=>page.waitForFunction(route=>document.body.dataset.page===route&&document.querySelector('.space-scene').dataset.ready==='true'&&document.querySelector('.space-scene').dataset.travel==='settled'&&!document.getElementById('site-content').hasAttribute('aria-busy'),route,{polling:25,timeout:8000});
    const begin=async leg=>{
      row.legs.push(leg);await page.evaluate(leg=>{window.__readingRibbon.leg=leg.id;window.__readingRibbon.mark('request',{to:leg.to});const href=leg.to==='index'?'./':leg.to+'.html';document.querySelector('.site-header nav a[href="'+href+'"]').click();},leg);
    };
    try{
      await page.goto(url+'/index.html',{waitUntil:'load'});await ready('index');
      assert.equal(await page.locator('meta[name="site-variant"]').getAttribute('content'),'color','navigation evidence uses actual Color artifact');
      await page.evaluate(()=>{
        const original=window.SiteScene.navigate;
        window.SiteScene.navigate=function(...args){const trace=window.__readingRibbon;trace.mark('navigate-before',{to:args[0]});const result=original.apply(this,args);trace.mark('navigate-after',{to:args[0]});return result;};
      });
      let from='index';
      for(const to of ['research','writing','talks','writing','research','index']){
        const leg={id:from+'-'+to,from,to};await begin(leg);await ready(to);
        await page.waitForFunction(id=>window.__readingRibbon.frames.filter(row=>row.leg===id&&!row.journey).length>=2,leg.id,{polling:25,timeout:2000});from=to;
      }
      await begin({id:'retarget-departure',from:'index',to:'research',interrupted:true});
      await page.waitForFunction(()=>window.__readingRibbon.frames.some(row=>row.leg==='retarget-departure'&&row.journey&&row.journey.elapsed/row.journey.duration>.18),null,{polling:20,timeout:5000});
      await begin({id:'retarget-arrival',from:'midflight-research',to:'talks'});
      await page.waitForFunction(()=>window.__readingRibbon.frames.some(row=>row.leg==='retarget-arrival'&&row.journey&&row.journey.elapsed/row.journey.duration>.35),null,{polling:20,timeout:5000});
      await page.evaluate(()=>window.__readingRibbon.mark('height-resize'));await page.setViewportSize({width,height:height-60});await ready('talks');
      row.trace=await page.evaluate(()=>{const {frames,events,dropped,error}=window.__readingRibbon;return {frames,events,dropped,error};});
      assert.ok(row.trace.frames.some(frame=>frame.leg==='retarget-arrival'&&frame.journey&&frame.height===height-60),'viewport reflow reached an actual flying paint');
      row.summary=validateRibbonTrace(row.trace,row.legs);assert.deepEqual(row.errors,[]);row.pass=true;
    }catch(error){row.error=String(error.stack||error);if(!row.trace)row.trace=await page.evaluate(()=>{const {frames,events,dropped,error}=window.__readingRibbon;return {frames,events,dropped,error};}).catch(()=>null);}
    finally{
      await context.close();row.video='ribbon-'+width+'-'+theme+'.webm';await video.saveAs(path.join(output,row.video));await video.delete();
    }
  }
  assert.ok(result.navigation.every(row=>row.pass),'complete ribbon navigation evidence; inspect retained traces and clips');
}
async function main(){
  const [candidateArg,baselineArg,outputArg]=process.argv.slice(2);
  assert.ok(candidateArg&&baselineArg&&outputArg,'usage: reading-clarity.cjs candidate-public baseline-public report-directory');
  const candidate=path.resolve(candidateArg),baseline=path.resolve(baselineArg),output=path.resolve(outputArg);
  fs.mkdirSync(output,{recursive:true});
  const candidateCss=fs.readFileSync(path.join(candidate,'styles.css'),'utf8'),baselineCss=fs.readFileSync(path.join(baseline,'styles.css'),'utf8');
  const result={schema:1,kind:'reading-clarity',pass:false,environment:environment(),css:{baseline:hash(baselineCss),candidate:hash(candidateCss)},comparison:'same candidate DOM; exact baseline/candidate shared CSS and reading style replaced',zoom:'CSS zoom at 100% and 200%; not physical Safari/iPad acceptance',cases:[],captures:[]};
  const source=directory=>{
    const manifest=JSON.parse(fs.readFileSync(path.join(directory,'../artifact.json'),'utf8'));
    return {sourceCommit:manifest.sourceCommit,sourceTree:manifest.sourceTree,artifactDigest:manifest.artifactDigest,variant:manifest.variant||manifest.components?.variant};
  };
  result.sources={candidate:source(candidate),baseline:source(baseline)};
  if(process.env.SITE_CANDIDATE_SHA)assert.equal(result.sources.candidate.sourceCommit,process.env.SITE_CANDIDATE_SHA);
  if(process.env.READING_BASELINE_SHA)assert.equal(result.sources.baseline.sourceCommit,process.env.READING_BASELINE_SHA);
  let fixture,reference,browser;
  try{
    fixture=await serve(candidate);browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium'));result.browserVersion=browser.version();
    const context=await browser.newContext({reducedMotion:'reduce'});
    await context.addInitScript(()=>{try{localStorage.setItem('vo.motion','off');}catch{/* Reduced motion also freezes unavailable storage. */}});
    const page=await context.newPage();
    for(const width of [320,768,1440])for(const theme of ['light','dark'])for(const zoom of [1,2])for(const route of routes){
      const entry={route,width,theme,zoom,pass:false};result.cases.push(entry);
      await page.setViewportSize({width,height:900});
      await page.goto(fixture.url+'/'+route+'.html',{waitUntil:'load'});
      const baselineReading=readingStyle(fs.readFileSync(path.join(baseline,route+'.html'),'utf8')),candidateReading=readingStyle(fs.readFileSync(path.join(candidate,route+'.html'),'utf8'));
      await styles(page,baselineCss,baselineReading,theme,zoom);entry.before=await measure(page);
      const capture=['talks','writing'].includes(route)&&width>=768&&zoom===1;
      if(capture){const file='heading-'+route+'-'+width+'-'+theme+'-before.png';await page.screenshot({path:path.join(output,file)});result.captures.push(file);}
      await styles(page,candidateCss,candidateReading,theme,zoom);entry.after=await measure(page);
      if(capture){const file='heading-'+route+'-'+width+'-'+theme+'-after.png';await page.screenshot({path:path.join(output,file)});result.captures.push(file);}
      compare(entry.before,entry.after);entry.pass=true;
    }
    reference=await serve(baseline);result.formula=[];
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
    await ribbonNavigation(browser,fixture.url,output,result);result.pass=true;
  }catch(error){result.error=String(error.stack||error);process.exitCode=1;}
  finally{
    if(browser)await browser.close();if(fixture)await new Promise(resolve=>fixture.server.close(resolve));if(reference)await new Promise(resolve=>reference.server.close(resolve));
    fs.writeFileSync(path.join(output,'reading-clarity.json'),JSON.stringify(result,null,2)+'\n');
    process.stdout.write(JSON.stringify({pass:result.pass,cases:result.cases.length,captures:result.captures.length,navigation:result.navigation?.length||0,error:result.error||null,report:path.join(output,'reading-clarity.json')})+'\n');
  }
}
if(require.main===module)main().catch(error=>{process.stderr.write(String(error.stack||error)+'\n');process.exitCode=1;});
module.exports={measure,compare,styles,readingStyle,validateRibbonTrace,ribbonNavigation};
