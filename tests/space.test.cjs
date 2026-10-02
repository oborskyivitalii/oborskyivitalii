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
  const keys=Object.keys(model.pageStops[options.page||"index"]||{});
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
test("continuous scrolling moves the camera on each frame before the gesture ends",()=>{
  const page=visit();page.settle();let prior=page.trace();
  for(let i=1;i<=12;i++) {
    page.scroll(150+i*60);page.frame();
    assert.notEqual(page.trace(),prior,"new scroll input must not restart an empty t=0 frame");
    prior=page.trace();assert.equal(page.pending.size,1,"gesture still has a bounded follow-up");
  }
  page.settle();assert.equal(page.pending.size,0);
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
test("Research, Talks and Credits have bounded reversible native paths; unknown/degenerate stops stay still",()=>{
  for(const page of["research","talks","credits"]) {
    const state=visit({page});state.settle();const initial=state.trace();state.scroll(1100);state.settle();assert.notEqual(state.trace(),initial,page);
    state.scroll(0);state.settle();assert.equal(state.trace(),initial,page);
  }
  const unknown=visit({page:"unknown"});unknown.settle();unknown.scroll(9000);assert.equal(unknown.pending.size,0);
  for(const stops of[[],[["unknown",100]],[["research",0]],[["hero",0],["research",0]]]) {
    const state=visit({stops});state.settle();const initial=state.trace();state.scroll(9000);state.settle();assert.equal(state.trace(),initial);
  }
});

test("each route projects a distinct world, uses three depth bands, and finite initial poses match disabled motion",()=>{
  const signatures=new Set();
  for(const page of Object.keys(model.initialPoses)) {
    const world=model.worldFor(page),shapes=model.projectedWorld(world,model.poses[model.initialPoses[page]],1440,900);
    signatures.add(JSON.stringify(shapes));
    assert.ok(world.faces.some(f=>f.band==="near"));assert.ok(world.faces.some(f=>f.band==="middle"));assert.ok(world.lines.some(s=>s.band==="distant"));
    assert.ok(shapes.every(s=>s.points.flat().every(Number.isFinite)));
    for(let i=1;i<shapes.length;i++)assert.ok(shapes[i-1].depth>=shapes[i].depth,"faces/lines share depth ordering");
    const off=visit({page,saved:"off"});off.settle();
    const reduced=visit({page,saved:"on",reduced:true,scrollY:4000});reduced.settle();assert.equal(off.trace(),reduced.trace());
  }
  assert.equal(signatures.size,5);
  for(const page of["talks","credits"]){const off=visit({page,saved:"off"});off.settle();const frozen=off.trace();off.scroll(1500);off.mutate();off.settle();assert.equal(off.trace(),frozen);}
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
  const polygon=[[0,0,-1],[2,0,2],[2,2,2],[0,2,-1]],original=JSON.stringify(polygon);
  const clipped=model.clipPolygon(polygon);assert.equal(clipped.length,4);assert.ok(clipped.every(p=>p[2]>=.5));assert.equal(JSON.stringify(polygon),original);
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

test("curved camera journeys go around the sculpture, remain continuous, and keep exact endpoints",()=>{
  for(const ids of [...Object.values(model.topicPaths),...Object.values(model.pageStops).map(s=>Object.values(s))])for(const mobile of[false,true]) {
    const start=model.journeyPose(ids,0,mobile),end=model.journeyPose(ids,1,mobile);
    assert.deepEqual(start,model.poses[ids[0]]);
    const linear=model.mix(start,end,.5),middle=model.journeyPose(ids,.5,mobile);
    if(ids[0]!==ids.at(-1))assert.ok(Math.hypot(...middle.position.map((v,i)=>v-linear.position[i]))>1,"travel is not a flat straight chord");
    for(let i=0;i<=120;i++) {
      const pose=model.journeyPose(ids,i/120,mobile);
      assert.ok([...pose.position,...pose.target].every(Number.isFinite));
      assert.ok(Math.hypot(pose.position[0],pose.position[2])>=11,"camera cannot cut through sculpture core");
      const shapes=model.projectedWorld(model.worldFor("index"),pose,1440,900);
      assert.ok(shapes.every(s=>s.points.flat().every(Number.isFinite)));
    }
    for(let i=1;i<ids.length-1;i++) {
      const t=i/(ids.length-1),left=model.journeyPose(ids,t-1e-5,mobile),right=model.journeyPose(ids,t+1e-5,mobile);
      assert.ok(Math.hypot(...left.position.map((v,j)=>v-right.position[j]))<.01,"no position jump at semantic stops");
    }
    if(!mobile)assert.deepEqual(end,model.poses[ids.at(-1)]);
  }
});

test("recursive worlds are deterministic and complexity stays bounded on all routes",()=>{
  for(const page of Object.keys(model.initialPoses)) {
    const world=model.worldFor(page);
    assert.deepEqual(world,model.worldFor(page));
    assert.ok(world.faces.filter(f=>f.points.length===3).length>=64,"recursive tetrahedron detail exists");
    assert.ok(world.faces.length+world.lines.length<1600,"recursive branching has a fixed budget");
  }
});
