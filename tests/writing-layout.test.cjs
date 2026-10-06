'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const layout=require('../tools/quality/writing-layout.cjs');
function browser({bare=false}={}){
  let geometryReads=0,forbidGeometry=false,clock=1;
  const box=(x,y,width,height)=>({x,y,width,height});
  function node(tag,rect,text=''){
    const element={tagName:tag.toUpperCase(),id:'',className:'',style:{},dataset:{},hidden:false,children:[],childNodes:[],parentElement:null,rect:{...rect},ownText:text,display:'block',value:undefined};
    Object.defineProperty(element,'textContent',{get(){return this.ownText+this.childNodes.map(child=>child.textContent).join('');}});
    element.getBoundingClientRect=()=>{geometryReads++;if(forbidGeometry)throw Error('timed geometry read');return {left:element.rect.x,top:element.rect.y,width:element.rect.width,height:element.rect.height};};
    element.getAttribute=key=>key==='href'?element.href??null:null;
    element.append=(...children)=>{for(const child of children){if(child.parentElement){const old=child.parentElement;old.childNodes=old.childNodes.filter(x=>x!==child);old.children=old.children.filter(x=>x!==child);}child.parentElement=element;element.childNodes.push(child);if(child.tagName!=='#TEXT')element.children.push(child);}};
    element.prepend=child=>{element.append(child);element.childNodes.pop();element.childNodes.unshift(child);element.children.pop();element.children.unshift(child);};
    element.replaceChildren=(...children)=>{element.children=[];element.childNodes=[];element.ownText='';element.append(...children);};
    element.querySelector=selector=>element.query[selector]||null;element.querySelectorAll=selector=>selector==='a'?(element.links||[]):[];element.query={};
    return element;
  }
  const rows=[];
  for(let i=0;i<27;i++){
    const y=1200+i*200,row=node('li',box(40,y,310,188)),meta=node('div',box(56,y+21,278,38),'Date EN · Article'),body=node('div',box(56,y+71,278,90)),title=node('a',box(56,y+71,278,90)),arrow=node('span',box(318,y+71,16,31),'↗');
    const titleText=node(bare?'#text':'span',box(56,y+71,246,90),'Title '+i);title.href='https://example.org/article-'+i;row.className='publication';meta.className='publication-meta';title.className='publication-title';arrow.className='publication-arrow';row.append(meta,body);body.append(title);title.append(titleText,arrow);row.query['.publication-title']=title;title.query['.publication-arrow']=arrow;row.links=[title];rows.push(row);
  }
  const controls=[node('form',box(20,610,350,176),'Topic Year Language Reset'),node('div',box(20,810,350,24)),node('h2',box(20,858,220,26),'All topics · All years · EN + UA'),node('p',box(20,908,350,76),'27 of 27 primary archive records'),node('nav',box(0,0,0,0)),node('nav',box(0,0,0,0))];
  controls[0].id='archive-filters';controls[0].display='flex';controls[1].className='archive-landings';controls[1].display='flex';controls[2].id='archive-heading';controls[3].id='archive-count';controls[4].hidden=controls[5].hidden=true;controls[4].display=controls[5].display='none';
  const main=node('main',box(0,164,390,9576)),header=node('header',box(0,0,390,164)),footer=node('footer',box(20,9740,350,200)),year1=node('section',box(40,1100,310,1850)),year2=node('section',box(40,3150,310,6200)),results=node('div',box(20,1100,350,8300));
  main.id='main';header.className='site-header';footer.className='site-footer';year1.id='results-year-2026';year2.id='results-year-2025';results.id='archive-results';
  const waypoints=[main,header,year1,results,year2,footer],values={topic:node('select',box(0,0,1,1)),year:node('select',box(0,0,1,1)),language:node('select',box(0,0,1,1))};for(const control of Object.values(values))control.value='all';
  const plane=node('div',box(0,0,390,10000));plane.style.transform='perspective(1200px) translateZ(0px)';
  const selections={'#archive-results li.publication':rows,'#archive-filters':[controls[0]],'.archive-landings':[controls[1]],'#archive-heading':[controls[2]],'#archive-count':[controls[3]],'[data-archive-navigation]':controls.slice(4)};
  function selectAll(selector){return selections[selector]||(selector.startsWith('[data-space-stop]')?waypoints:[]);}
  const document={body:{dataset:{page:'writing'}},documentElement:{scrollHeight:10000,dataset:{theme:'dark'}},fonts:{ready:Promise.resolve()},activeElement:main,createElement:tag=>node(tag,box(56,1271,246,90)),getElementById:id=>id==='site-content'?plane:id==='archive-count'?controls[3]:values[id.slice('archive-'.length)]||null,querySelector:selector=>selector==='main'?main:null,querySelectorAll:selectAll};
  const events=[],window={SiteEngineProbe:event=>events.push(event)},context={window,document,innerWidth:390,innerHeight:844,devicePixelRatio:3,scrollX:0,scrollY:0,location:{search:'',hash:''},performance:{now:()=>clock++},getComputedStyle:element=>{geometryReads++;if(forbidGeometry)throw Error('timed computed style');return {display:element.display,borderLeftWidth:'0',borderTopWidth:element.className==='publication'?'1':'0'};}};vm.createContext(context);
  const run=(fn,arg)=>{context.argument=arg;return vm.runInContext('('+fn.toString()+')(argument)',context);};
  return {context,window,rows,controls,events,plane,run,reads:()=>geometryReads,forbid:value=>{forbidGeometry=value;},page:{evaluate:async(fn,arg)=>{const result=await run(fn,arg);return result===undefined?undefined:JSON.parse(JSON.stringify(result));}}};
}
test('separate calibration retains full unfiltered archive and native geometry before timed samples',async()=>{
  const b=browser(),fixture=await layout.calibrate(b.page);
  assert.equal(fixture.rows.length,27);assert.equal(fixture.controls.length,6);assert.equal(fixture.maxScroll,9156);assert.equal(fixture.wrapperMaxGeometryDelta,0);assert.equal(b.plane.style.transform,'perspective(1200px) translateZ(0px)');
  assert.equal(JSON.stringify(fixture.values),JSON.stringify({topic:'all',year:'all',language:'all'}));assert.match(fixture.calibrationMeaning,/separate-browser/);
  b.context.document.body.dataset.page='research';await assert.rejects(layout.calibrate(b.page),/settled Writing/);
});
test('every apply hook is serializable and performs only matched geometry writes, retaining row text and links',async()=>{
  for(const intervention of layout.labels){
    const b=browser(),fixture=await layout.calibrate(b.page),beforeReads=b.reads(),beforeText=b.rows.map(row=>row.textContent);b.run(layout.install,{calibration:fixture,intervention});b.forbid(true);
    const result=b.window.__writingLayout.apply();assert.equal(result.applied,true,intervention);assert.equal(b.reads(),beforeReads,'apply must not trigger native layout');assert.deepEqual(b.rows.map(row=>row.textContent),beforeText);assert.equal(b.events.length,1);assert.equal(b.events[0].kind,'layout-intervention');assert.equal(b.window.__writingLayout.apply().reason,'already-applied');
    for(const row of b.rows){assert.equal(row.style.height,'188px');assert.equal(row.children[0].style.width,'278px');assert.equal(row.querySelector('.publication-title').style.height,'90px');}
    if(intervention==='row-grid-off'){assert.equal(b.rows[0].style.display,'block');assert.equal(b.rows[0].children[0].style.position,'absolute');assert.equal(b.rows[0].children[0].style.top,'20px');}
    if(intervention==='title-flex-off')assert.equal(b.rows[0].querySelector('.publication-title').style.display,'block');
    if(intervention==='controls-off'){assert.equal(b.controls[0].textContent,'');assert.equal(b.controls[0].style.height,'176px');assert.equal(b.controls[0].dataset.writingLayoutPlaceholder,'true');assert.equal(b.controls[4].hidden,true);}
    b.forbid(false);const audit=b.window.__writingLayout.audit();assert.equal(audit.valid,true,JSON.stringify(audit.failures));assert.equal(audit.rangeDelta,0);assert.equal(audit.comparisons.filter(x=>x.kind==='row').length,27);assert.equal(audit.focus.id,'main');
  }
});
test('range/row/waypoint differences are retained explicitly and invalidate matched comparison',async()=>{
  const b=browser(),fixture=await layout.calibrate(b.page);b.run(layout.install,{calibration:fixture,intervention:'layout-control'});b.window.__writingLayout.apply();
  b.rows[10].rect.y+=2;b.context.document.documentElement.scrollHeight+=3;b.context.document.activeElement.id='filter-test';
  const audit=b.window.__writingLayout.audit();assert.equal(audit.valid,false);assert.ok(audit.failures.some(x=>x.kind==='row'&&x.key===10));assert.ok(audit.failures.some(x=>x.kind==='range'&&x.delta===3));assert.equal(audit.focus.id,'filter-test');assert.ok(audit.comparisons.length>100,'retain all geometry, not only mismatches');
});
test('invalid state and viewport are retained as intervention errors without erasing timed raw evidence',async()=>{
  const b=browser(),fixture=await layout.calibrate(b.page);b.context.innerWidth=391;b.run(layout.install,{calibration:fixture,intervention:'row-grid-off'});b.forbid(true);
  const result=b.window.__writingLayout.apply();assert.equal(result.applied,false);assert.match(result.error,/viewport mismatch/);assert.equal(b.window.__writingLayout.errors.length,1);b.forbid(false);assert.equal(b.window.__writingLayout.audit().valid,false);
  b.context.document.body.dataset.page='research';assert.equal(b.window.__writingLayout.apply().reason,'other-route');
});

test('post-scroll audit retains native row positions while comparing sticky header in viewport coordinates',async()=>{
  const b=browser(),fixture=await layout.calibrate(b.page);b.run(layout.install,{calibration:fixture,intervention:'layout-control'});b.window.__writingLayout.apply();
  const nodes=new Set();function add(node){if(nodes.has(node))return;nodes.add(node);for(const child of node.children)add(child);}
  for(const row of b.rows)add(row);for(const control of b.controls)add(control);for(const waypoint of b.context.document.querySelectorAll('[data-space-stop],#archive-results,#year-2026,#year-2025,main,.site-header,.site-footer'))add(waypoint);
  b.context.scrollY=200;for(const node of nodes)if(node.className!=='site-header'&&(node.rect.width||node.rect.height))node.rect.y-=200;
  const audit=b.window.__writingLayout.audit();assert.equal(audit.valid,true,JSON.stringify(audit.failures));const header=audit.comparisons.find(x=>x.kind==='waypoint'&&x.key==='site-header');assert.equal(header.delta.y,0);assert.equal(header.actual.y,0);
});
