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
    result.pass=true;
  }catch(error){result.error=String(error.stack||error);process.exitCode=1;}
  finally{
    if(browser)await browser.close();if(fixture)await new Promise(resolve=>fixture.server.close(resolve));if(reference)await new Promise(resolve=>reference.server.close(resolve));
    fs.writeFileSync(path.join(output,'reading-clarity.json'),JSON.stringify(result,null,2)+'\n');
    process.stdout.write(JSON.stringify({pass:result.pass,cases:result.cases.length,captures:result.captures.length,error:result.error||null,report:path.join(output,'reading-clarity.json')})+'\n');
  }
}
if(require.main===module)main().catch(error=>{process.stderr.write(String(error.stack||error)+'\n');process.exitCode=1;});
module.exports={measure,compare,styles,readingStyle};
