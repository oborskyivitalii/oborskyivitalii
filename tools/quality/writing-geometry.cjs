'use strict';
// Targeted normal-runtime geometry/function comparison, separate from timing.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {open,ready}=require('./writing-probe.cjs'),{environment}=require('./common.cjs');
const profiles=[390,640,641,1440].map(width=>({width,height:844,deviceScaleFactor:width<=640?3:1.5,cpuRate:1,theme:'dark'}));
const scenarios=[
  {id:'default',filters:{topic:'all',year:'all',language:'all'}},
  {id:'delivery-2026-uk',filters:{topic:'delivery',year:'2026',language:'uk'}},
  {id:'systems-2025-uk',filters:{topic:'systems',year:'2025',language:'uk'}},
  {id:'year-2026-en',filters:{topic:'all',year:'2026',language:'en'}},
  {id:'language-uk',filters:{topic:'all',year:'all',language:'uk'}},
  {id:'leadership-2025',filters:{topic:'leadership',year:'2025',language:'all'}},
  {id:'empty-strategy-2025-uk',filters:{topic:'strategy',year:'2025',language:'uk'}},
  {id:'reset',reset:true,filters:{topic:'all',year:'all',language:'all'}}
];

function captureNative(){
  const plane=document.getElementById('site-content'),transform=plane?.style.transform;
  if(transform)plane.style.transform='none';
  try{
    const text=node=>node.textContent.replace(/\s+/g,' ').trim();
    const rect=node=>{const r=node.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height};};
    const textGeometry=title=>{
      const arrow=title.querySelector('.publication-arrow'),walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT),rects=[];
      for(let node=walker.nextNode();node;node=walker.nextNode()){
        if(!node.textContent.trim()||arrow?.contains(node))continue;
        const range=document.createRange();range.selectNodeContents(node);
        for(const r of range.getClientRects())if(r.width&&r.height)rects.push(r);
      }
      if(!rects.length)return {glyphs:{x:0,y:0,width:0,height:0},glyphLines:[]};
      const x=Math.min(...rects.map(r=>r.left)),y=Math.min(...rects.map(r=>r.top));
      return {glyphs:{x:x+scrollX,y:y+scrollY,width:Math.max(...rects.map(r=>r.right))-x,height:Math.max(...rects.map(r=>r.bottom))-y},glyphLines:rects.map(r=>({x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height})).sort((a,b)=>a.y-b.y||a.x-b.x)};
    };
    const rows=[...document.querySelectorAll('#archive-results li.publication')].map((node,index)=>{
      const title=node.querySelector('.publication-title'),arrow=title?.querySelector('.publication-arrow');
      if(!title||!arrow)throw Error('Writing title/arrow missing at '+index);
      return {index,data:{topic:node.dataset.topic,year:node.dataset.year,language:node.dataset.language},hidden:node.hidden,text:text(node),links:[...node.querySelectorAll('a')].map(a=>a.getAttribute('href')),rect:rect(node),title:rect(title),arrow:rect(arrow),...textGeometry(title),children:[...node.children].map(rect),inlineHeight:node.style.height};
    });
    const controls=['#archive-filters','#archive-topic','#archive-year','#archive-language','#archive-heading','#archive-count','#archive-empty'].map(selector=>{const node=document.querySelector(selector);if(!node)throw Error('Writing control missing '+selector);return {key:selector,hidden:node.hidden,rect:rect(node)};});
    const waypoints=[...document.querySelectorAll('[data-space-stop],#archive-results,#year-2026,#year-2025,main,.site-footer')].map((node,index)=>({key:node.id||node.className,index,hidden:node.hidden,rect:rect(node)}));
    return {route:document.body.dataset.page,variant:document.querySelector('meta[name="site-variant"]')?.content,engine:document.querySelector('meta[name="site-engine"]')?.content,rows,controls,waypoints,values:Object.fromEntries(['topic','year','language'].map(key=>[key,document.getElementById('archive-'+key).value])),scrollHeight:document.documentElement.scrollHeight,maxScroll:Math.max(0,document.documentElement.scrollHeight-innerHeight),countText:text(document.getElementById('archive-count')),emptyVisible:!document.getElementById('archive-empty').hidden,url:{search:location.search,hash:location.hash},focus:{id:document.activeElement?.id||null,tag:document.activeElement?.tagName||null}};
  }finally{if(transform)plane.style.transform=transform;}
}

function validateState(snapshot,scenario){
  const failures=[],fail=(kind,detail)=>failures.push({kind,...detail});
  if(snapshot.route!=='writing')fail('route',{actual:snapshot.route});
  if(snapshot.variant!=='color')fail('variant',{actual:snapshot.variant});
  if(snapshot.rows.length!==27)fail('row-count',{actual:snapshot.rows.length});
  if(JSON.stringify(snapshot.values)!==JSON.stringify(scenario.filters))fail('filter-values',{expected:scenario.filters,actual:snapshot.values});
  let count=0;
  for(const row of snapshot.rows){
    const visible=Object.entries(scenario.filters).every(([key,value])=>value==='all'||row.data[key]===value);
    if(row.hidden===visible)fail('row-visibility',{index:row.index,expectedVisible:visible,actualHidden:row.hidden});
    if(visible)count++;
    if(row.inlineHeight)fail('frozen-row-height',{index:row.index,actual:row.inlineHeight});
  }
  if(snapshot.emptyVisible!==(count===0))fail('empty-state',{expectedVisible:count===0,actual:snapshot.emptyVisible});
  if(!snapshot.countText.startsWith(count+' of 27 primary archive records'))fail('count-label',{expected:count,actual:snapshot.countText});
  const params=new URLSearchParams(snapshot.url.search);
  for(const [key,value]of Object.entries(scenario.filters))if(params.get(key)!==(value==='all'?null:value))fail('url-filter',{key,expected:value,actual:params.get(key)});
  if(snapshot.url.hash)fail('url-hash',{actual:snapshot.url.hash});
  return {valid:failures.length===0,visibleCount:count,failures};
}

function compareCaptures(before,after,tolerance=1){
  assert.ok(Number.isFinite(tolerance)&&tolerance>=0,'invalid geometry tolerance');
  const failures=[],comparisons=[];
  function same(kind,key,a,b){if(JSON.stringify(a)!==JSON.stringify(b))failures.push({kind,key,before:a,after:b});}
  function geometry(kind,key,a,b){
    if(!a||!b){failures.push({kind,key,before:a,after:b});return;}
    const delta=Object.fromEntries(['x','y','width','height'].map(part=>[part,b[part]-a[part]])),max=Math.max(...Object.values(delta).map(Math.abs));
    comparisons.push({kind,key,before:a,after:b,delta,max});if(!Number.isFinite(max)||max>tolerance)failures.push({kind,key,delta,max});
  }
  for(const key of ['values','countText','emptyVisible','url','focus'])same('state',key,before[key],after[key]);
  same('row-count','rows',before.rows.length,after.rows.length);
  before.rows.forEach((a,index)=>{
    const b=after.rows[index];if(!b)return;
    for(const key of ['index','data','hidden','text','links','inlineHeight'])same('row-'+key,index,a[key],b[key]);
    for(const key of ['rect','title','arrow','glyphs'])geometry('row-'+key,index,a[key],b[key]);
    same('title-line-count',index,a.glyphLines.length,b.glyphLines.length);a.glyphLines.forEach((box,i)=>geometry('title-ink-line',index+'/'+i,box,b.glyphLines[i]));
    same('row-child-count',index,a.children.length,b.children.length);a.children.forEach((box,i)=>geometry('row-child',index+'/'+i,box,b.children[i]));
  });
  for(const group of ['controls','waypoints']){
    same(group+'-count',group,before[group].length,after[group].length);
    before[group].forEach((a,index)=>{const b=after[group][index];if(!b)return;same(group+'-key',index,a.key,b.key);same(group+'-hidden',index,a.hidden,b.hidden);geometry(group,a.key,a.rect,b.rect);});
  }
  for(const key of ['scrollHeight','maxScroll']){const delta=after[key]-before[key];comparisons.push({kind:'range',key,before:before[key],after:after[key],delta,max:Math.abs(delta)});if(!Number.isFinite(delta)||Math.abs(delta)>tolerance)failures.push({kind:'range',key,delta});}
  return {valid:failures.length===0,tolerance,maxGeometryDelta:Math.max(0,...comparisons.map(x=>x.max)),failures,comparisons};
}

async function settled(page){
  await ready(page,'writing');
  await page.evaluate(async()=>{await document.fonts?.ready;scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
}
async function visit(url,profile,helpers={open,ready},save=()=>{}){
  const session=await helpers.open(profile,{fineStages:false,contentFlight:true}),result={profile,states:[],errors:session.errors};
  // Freeze decorative motion so this geometry check has no adaptive-render drift.
  await session.context.addInitScript(()=>{localStorage.setItem('vo.motion','off');window.SiteEngineProbe=null;window.SiteEngineStages=false;});
  try{
    result.browser=session.browser.version();await session.page.goto(url.replace(/\/$/,'')+'/writing.html',{waitUntil:'domcontentloaded'});await settled(session.page);
    for(const scenario of scenarios){
      const row={id:scenario.id,filters:scenario.filters};result.states.push(row);
      try{
        if(scenario.reset)await session.page.locator('#archive-filters button[type="reset"]').click();
        else if(scenario.id!=='default')for(const [key,value]of Object.entries(scenario.filters))await session.page.locator('#archive-'+key).selectOption(value);
        await settled(session.page);row.capture=await session.page.evaluate(captureNative);row.functionAudit=validateState(row.capture,scenario);
      }catch(error){row.error=error.stack||error.message;}
      save(result);
    }
    result.complete=result.states.length===scenarios.length&&result.states.every(x=>!x.error&&x.functionAudit?.valid)&&result.errors.length===0;
    return result;
  }finally{await session.browser.close();}
}
async function compare(urlBefore,urlAfter,output){
  const file=path.resolve(output.endsWith('.json')?output:path.join(output,'geometry.json'));
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const record={schema:1,kind:'writing-normal-runtime-geometry',fullGate:false,performanceAcceptance:false,environment:environment(),targets:{before:urlBefore,after:urlAfter},profiles,scenarios,tolerancePx:1,protocol:'Normal Color artifacts; four Chromium widths around the mobile breakpoint and desktop. Separate fresh process per artifact/width, variant order alternates by width. Decorative motion frozen; no fine-stage timing, traces or performance claims. Real control changes, an empty result and Reset retain automatic content heights. Every row, title, decorative arrow, text-glyph union, native waypoint, control footprint and scroll range is compared within one CSS pixel.',rows:[],complete:false,pass:false};
  const save=()=>fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');
  for(const [index,profile]of profiles.entries()){
    const row={profile,order:index%2?['after','before']:['before','after'],trials:{},comparisons:[]};record.rows.push(row);save();
    for(const label of row.order){
      try{row.trials[label]=await visit(label==='before'?urlBefore:urlAfter,profile,undefined,result=>{row.trials[label]=result;save();});}
      catch(error){row.trials[label]??={};row.trials[label].error=error.stack||error.message;}
      save();
    }
    for(const scenario of scenarios){
      const a=row.trials.before?.states?.find(x=>x.id===scenario.id),b=row.trials.after?.states?.find(x=>x.id===scenario.id);
      row.comparisons.push({id:scenario.id,...(a?.capture&&b?.capture?compareCaptures(a.capture,b.capture):{valid:false,failures:[{kind:'missing-capture',before:!!a?.capture,after:!!b?.capture}]})});
    }
    save();
  }
  record.complete=record.rows.length===profiles.length&&record.rows.every(row=>Object.values(row.trials).length===2&&Object.values(row.trials).every(trial=>trial.complete));
  record.pass=record.complete&&record.rows.every(row=>row.comparisons.every(x=>x.valid));save();
  assert.ok(record.pass,'Writing natural geometry/filter comparison failed; every capture and mismatch remains in '+file);
  return record;
}
if(require.main===module)compare(process.argv[2],process.argv[3],process.argv[4]).catch(error=>{console.error(error.stack);process.exitCode=1;});
module.exports={profiles,scenarios,captureNative,validateState,compareCaptures,settled,visit,compare};
