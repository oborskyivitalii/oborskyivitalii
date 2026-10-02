"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../docs/space.js"),"utf8"),model=require("../docs/space.js");
function visit(options={}) {
  const events={},docEvents={},buttonEvents={},pending=new Map(),calls=[];
  let serial=0,time=0,stored=options.saved??null,mutation,last="";
  const media={matches:!!options.reduced,addEventListener:(_,fn)=>{media.change=fn;}};
  const narrow={matches:!!options.narrow},scene={dataset:{}};
  const context=Object.fromEntries(["setTransform","clearRect","beginPath","moveTo","lineTo","stroke","arc","fill","closePath"].map(name=>[name,(...args)=>{for(const arg of args)assert.ok(Number.isFinite(arg));calls.push([name,...args]);}]));
  const canvas={parentElement:scene,getContext:()=>options.noCanvas?null:context};
  const button={hidden:true,disabled:false,setAttribute:(key,value)=>{button[key]=value;},addEventListener:(name,fn)=>{buttonEvents[name]=fn;}};
  const window={innerWidth:options.narrow?390:1440,innerHeight:900,devicePixelRatio:4,scrollY:options.scrollY||0,
    matchMedia:query=>query.includes("reduced")?media:narrow,
    requestAnimationFrame:fn=>{const id=++serial;pending.set(id,fn);return id;},cancelAnimationFrame:id=>pending.delete(id),
    addEventListener:(name,fn)=>{events[name]=fn;},getComputedStyle:()=>({getPropertyValue:name=>({"--accent":"#075d7b","--systems":"#895710","--paper":"#f8f7f3"})[name]})};
  const makeStop=([id,top],hidden=false)=>({hidden,dataset:{spaceStop:id},getClientRects:()=>hidden?[]:[{}],getBoundingClientRect:()=>({top:top-window.scrollY,height:300})});
  const keys=options.page==="research"?["intro","research","lenses","topics","acknowledgements"]:["hero","research","help","writing","acknowledgements","about","contact"];
  let stops=(options.stops||keys.map((id,i)=>[id,i*1100])).map(pair=>makeStop(pair));
  let resultRects=options.empty?[]:options.coincident?[[1000,1000]]:options.single?[[1000,1160]]:[[1000,1160],[1800,1960]];
  const results={querySelectorAll:()=>resultRects.map(([top,bottom])=>({hidden:false,getClientRects:()=>[{}],getBoundingClientRect:()=>({top:top-window.scrollY,bottom:bottom-window.scrollY})}))};
  const document={hidden:false,body:{dataset:{page:options.page||"index"}},documentElement:{scrollHeight:15000},
    getElementById:id=>id==="space-canvas"?canvas:id==="space-motion"?button:results,
    querySelectorAll:()=>stops,querySelector:()=>({}),addEventListener:(name,fn)=>{docEvents[name]=fn;}};
  class MutationObserver{constructor(fn){mutation=fn;}observe(){}}
  window.MutationObserver=MutationObserver;
  const localStorage={getItem(){if(options.blockedStorage)throw Error("blocked");return stored;},setItem(_,value){if(options.blockedStorage)throw Error("blocked");stored=value;}};
  vm.runInNewContext(source,{document,window,localStorage});
  const api={window,document,button,canvas,scene,pending,calls,media,events,
    frame(){const jobs=[...pending.values()];pending.clear();calls.length=0;time+=20;for(const fn of jobs)fn(time);last=JSON.stringify(calls);},
    settle(){let limit=40;while(pending.size&&limit--)api.frame();assert.equal(pending.size,0,"bounded settling must stop");},
    trace:()=>last,scroll(y){window.scrollY=y;events.scroll?.();},event(name,detail){events[name]?.({detail});},
    click(){buttonEvents.click();},hidden(value){document.hidden=value;docEvents.visibilitychange();},mutate(){mutation();},
    layout(rects){resultRects=rects;events["site:archive-layout"]();},stops(value){stops=value.map(pair=>makeStop(pair));events.resize();},stored:()=>stored};
  return api;
}
test("semantic native scroll is reversible, events coalesce, and every transition stops at idle",()=>{
  const page=visit();page.settle();const initial=page.trace();assert.equal(page.canvas.width,2160);
  page.scroll(1600);page.scroll(1700);assert.equal(page.pending.size,1);page.settle();assert.notEqual(page.trace(),initial);
  page.scroll(0);page.settle();assert.equal(page.trace(),initial);assert.equal(page.scene.dataset.ready,"true");
});
test("pointer, hover and focus events on any device do not move the camera or schedule frames",()=>{
  for(const options of[{}, {narrow:true}]) {
    const page=visit(options);page.settle();const fixed=page.trace();
    for(const name of["pointermove","pointerout","mouseover","mouseenter","focus"])page.event(name,{clientX:10,clientY:10});
    assert.equal(page.pending.size,0);assert.equal(page.trace(),fixed);
    assert.equal(page.events.pointermove,undefined);assert.equal(page.events.pointerout,undefined);
  }
});
test("Off freezes a mid-transition pose through theme, layout, resize, hidden and print returns",()=>{
  const page=visit({blockedStorage:true});page.settle();page.scroll(1900);page.frame();page.frame();page.frame();const moving=page.trace();
  page.click();page.settle();assert.equal(page.trace(),moving);assert.equal(page.button["aria-pressed"],"false");
  page.scroll(3300);assert.equal(page.pending.size,0);
  page.mutate();page.settle();assert.equal(page.trace(),moving);
  page.event("resize");page.settle();assert.equal(page.trace(),moving);
  page.hidden(true);page.mutate();assert.equal(page.pending.size,0);page.hidden(false);page.settle();assert.equal(page.trace(),moving);
  page.events.beforeprint();page.scroll(5000);assert.equal(page.pending.size,0);page.events.afterprint();page.settle();assert.equal(page.trace(),moving);
});
test("system reduced motion overrides saved On; initial Off uses overview and saved Off remains off",()=>{
  const overview=visit({saved:"off"});overview.settle();
  const page=visit({reduced:true,saved:"on",scrollY:4000});page.settle();assert.equal(page.trace(),overview.trace());assert.equal(page.button.disabled,true);
  page.scroll(5000);assert.equal(page.pending.size,0);page.media.matches=false;page.media.change();page.settle();assert.equal(page.button["aria-pressed"],"true");
  page.click();page.settle();assert.equal(page.stored(),"off");const fixed=page.trace();
  page.media.matches=true;page.media.change();page.settle();page.media.matches=false;page.media.change();page.settle();assert.equal(page.trace(),fixed);
});
test("Research uses its named mappings; Talks/Credits/unknown pages stay at a finite overview",()=>{
  const research=visit({page:"research"});research.settle();const first=research.trace();research.scroll(1100);research.settle();assert.notEqual(research.trace(),first);
  for(const page of["talks","credits","unknown"]) {
    const state=visit({page});state.settle();const initial=state.trace();state.scroll(9000);assert.equal(state.pending.size,0);assert.equal(state.trace(),initial);
  }
  for(const stops of[[],[["unknown",100]],[["research",0]],[["hero",0],["research",0]]]) {
    const state=visit({stops});state.settle();const initial=state.trace();state.scroll(9000);state.settle();assert.equal(state.trace(),initial);
  }
});
test("Writing uses finite topic paths in result bounds, handles short/empty results and scroll interrupts focus",()=>{
  const page=visit({page:"writing"});page.settle();const overview=page.trace();
  page.event("site:scene-focus",{focus:"delivery",reason:"filter"});page.settle();assert.notEqual(page.trace(),overview);const delivery=page.trace();
  page.layout([]);page.settle();assert.equal(page.trace(),delivery);
  page.event("site:scene-focus",{focus:"leadership",reason:"filter"});page.settle();assert.notEqual(page.trace(),delivery);
  page.layout([[1000,1160]]);page.settle();const before=page.trace();page.scroll(1100);page.settle();assert.notEqual(page.trace(),before);
  page.event("site:scene-focus",{focus:"systems",reason:"filter"});page.frame();page.scroll(0);page.settle();const atStart=page.trace();
  const systems=visit({page:"writing",single:true});systems.event("site:scene-focus",{focus:"systems",reason:"initial"});systems.settle();assert.equal(atStart,systems.trace());
  for(const focus of["__proto__","verification","unknown"])page.event("site:scene-focus",{focus});assert.equal(page.pending.size,0);
  for(const options of[{empty:true},{single:true},{coincident:true}]){const state=visit({page:"writing",...options});state.settle();state.scroll(9999);state.settle();state.layout([]);state.settle();}
});
test("Writing Off/reduced overrides initialization, topic/filter changes and degenerate result fallbacks",()=>{
  for(const options of[{saved:"off"},{saved:"on",reduced:true}]) {
    const page=visit({page:"writing",...options});page.settle();const initial=page.trace();
    page.event("site:scene-focus",{focus:"delivery",reason:"initial"});page.layout([]);page.settle();assert.equal(page.trace(),initial);
    page.event("site:scene-focus",{focus:"leadership",reason:"filter"});page.layout([[1000,1160]]);page.scroll(9000);page.settle();assert.equal(page.trace(),initial);
  }
});
test("near-plane clipping preserves crossing segments, inputs, and every allowlisted pose is finite",()=>{
  const a=[0,0,-1],b=[2,3,2],copy=JSON.stringify([a,b]);
  assert.equal(model.clipSegment([0,0,-2],[2,3,-1]),null);
  assert.deepEqual(model.clipSegment(a,b),[[1,1.5,.5],b]);assert.deepEqual(model.clipSegment(b,a),[b,[1,1.5,.5]]);assert.equal(JSON.stringify([a,b]),copy);
  for(const paths of Object.values(model.topicPaths))for(const id of paths)assert.ok([...model.poses[id].position,...model.poses[id].target].every(Number.isFinite));
  const unavailable=visit({noCanvas:true});assert.equal(unavailable.button.hidden,true);assert.equal(unavailable.pending.size,0);assert.equal(unavailable.scene.dataset.ready,undefined);
});

test("Writing keeps its local path progress on the first scroll after reflow and empty-result restoration",()=>{
  const page=visit({page:"writing"});
  page.event("site:scene-focus",{focus:"systems",reason:"initial"});page.settle();
  page.scroll(1500);page.settle();const before=page.trace();
  page.layout([[400,560],[2800,2960]]);page.settle();assert.equal(page.trace(),before);
  page.scroll(1500);assert.equal(page.pending.size,0,"remeasure must not remap an unchanged scroll position to a different camera");
  page.layout([]);page.settle();page.layout([[1000,1160]]);page.settle();
  page.scroll(1500);assert.equal(page.pending.size,0,"restoring a shorter result block must retain saved local progress");
  page.scroll(1450);page.settle();assert.notEqual(page.trace(),before,"a real new scroll still controls the active topic path");
});
