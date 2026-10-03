"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../docs/space.js"),"utf8"),model=require("../docs/space.js");
function visit(options={}) {
  const events={},docEvents={},buttonEvents={},pending=new Map(),calls=[];
  let failDraw=false,styled=options.styled!==false,paintClock=0,bitmapValid=false,resizeCount=0,draws=0,serial=0,time=0,stored=options.saved??null,mutation;
  const media={matches:!!options.reduced,addEventListener:(_,fn)=>{media.change=fn;}};
  const narrow={matches:!!options.narrow},scene={dataset:{}};
  const context=Object.fromEntries(["setTransform","clearRect","beginPath","moveTo","lineTo","stroke","arc","fill","closePath"].map(name=>[name,(...args)=>{for(const arg of args)assert.ok(Number.isFinite(arg));if(name==="clearRect"){if(failDraw)throw Error("injected");draws++;bitmapValid=false;paintClock+=options.paintCost??0;}if(name==="fill"||name==="stroke")bitmapValid=true;}]));
  const canvas={parentElement:scene,getContext:()=>options.noCanvas?null:context};
  for(const [key,initial] of [["width",300],["height",150]]){let value=initial;Object.defineProperty(canvas,key,{get:()=>value,set:v=>{value=v;bitmapValid=false;resizeCount++;}});}
  const button={hidden:true,disabled:false,setAttribute:(key,value)=>{button[key]=value;},addEventListener:(name,fn)=>{buttonEvents[name]=fn;}};
  const window={performance:{now:()=>paintClock},innerWidth:options.narrow?390:1440,innerHeight:900,devicePixelRatio:4,scrollY:options.scrollY||0,
    matchMedia:query=>query.includes("reduced")?media:narrow,
    requestAnimationFrame:fn=>{const id=++serial;pending.set(id,fn);return id;},cancelAnimationFrame:id=>pending.delete(id),
    addEventListener:(name,fn)=>{events[name]=fn;},getComputedStyle:()=>({getPropertyValue:name=>!styled?"":({"--accent":"#075d7b","--systems":"#895710","--paper":"#f8f7f3"})[name]})};
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
    drawingFault(){failDraw=true;},styling(value){styled=value;events.load();},paintCost(value){options.paintCost=value;},bitmapValid:()=>bitmapValid,resizeCount:()=>resizeCount,
    frame(delta=20){const jobs=[...pending.values()];pending.clear();calls.length=0;time+=delta;for(const fn of jobs)fn(time);},
    settle(){for(let i=0;i<8&&pending.size;i++)api.frame();},
    trace:()=>scene.dataset.camera,phase:()=>Number(scene.dataset.phase),draws:()=>draws,scroll(y){window.scrollY=y;events.scroll?.();},event(name,detail){events[name]?.({detail});},
    click(){buttonEvents.click();},hidden(value){document.hidden=value;docEvents.visibilitychange();},mutate(){mutation();},
    layout(rects){resultRects=rects;events["site:archive-layout"]();},stops(value){stops=value.map(pair=>makeStop(pair));events.resize();},stored:()=>stored};
  return api;
}
test("native-scroll camera is reversible while the bounded ambient loop continues at idle",()=>{
  const p=visit();p.settle();const start=p.trace(),phase=p.phase();
  p.scroll(1400);p.scroll(1750);assert.equal(p.pending.size,1);p.settle();assert.notEqual(p.trace(),start);
  p.scroll(0);p.settle();assert.equal(p.trace(),start);assert.ok(p.phase()>phase);assert.equal(p.pending.size,1);
  const fixed=p.trace();p.frame(60);assert.equal(p.trace(),fixed);assert.equal(p.canvas.width,2160);
});
test("continuous gestures move immediately; pointer events never influence the camera",()=>{
  const p=visit();p.settle();let last=p.trace();
  for(let i=0;i<8;i++){p.scroll(200+i*140);p.frame(65);assert.notEqual(p.trace(),last);last=p.trace();}
  p.settle();last=p.trace();
  for(const type of["pointermove","pointerout","mouseover","mouseenter","focus"]){p.event(type,{clientX:12});assert.equal(p.events[type],undefined);}
  p.frame(60);assert.equal(p.trace(),last);assert.equal(p.pending.size,1);
});
test("Off freezes the exact displayed camera and phase through theme, resize, layout, hidden and print",()=>{
  const p=visit({blockedStorage:true});p.settle();p.scroll(1900);p.frame();p.frame();const fixed=p.trace(),phase=p.phase();
  p.click();p.settle();assert.equal(p.trace(),fixed);assert.equal(p.phase(),phase);assert.equal(p.pending.size,0);
  p.scroll(5000);p.mutate();p.settle();p.event("resize");p.settle();p.layout([]);p.settle();
  p.hidden(true);p.mutate();assert.equal(p.pending.size,0);p.hidden(false);p.settle();
  p.events.beforeprint();p.scroll(1000);assert.equal(p.pending.size,0);p.events.afterprint();p.settle();
  assert.equal(p.trace(),fixed);assert.equal(p.phase(),phase);assert.equal(p.pending.size,0);
});
test("reduced overrides saved On; Off persists; hidden and print pause without elapsed-time catch-up",()=>{
  const off=visit({saved:"off"});off.settle();const p=visit({reduced:true,saved:"on",scrollY:4000});p.settle();
  assert.equal(p.trace(),off.trace());assert.equal(p.phase(),0);assert.equal(p.button.disabled,true);assert.equal(p.pending.size,0);
  p.media.matches=false;p.media.change();p.settle();const phase=p.phase();p.hidden(true);assert.equal(p.pending.size,0);
  p.frame(120000);p.hidden(false);p.frame();assert.equal(p.phase(),phase);p.settle();assert.ok(p.phase()>phase);
  const before=p.phase();p.events.beforeprint();p.frame(120000);p.events.afterprint();p.frame();assert.equal(p.phase(),before);
  p.click();p.settle();assert.equal(p.stored(),"off");p.media.matches=true;p.media.change();p.media.matches=false;p.media.change();p.settle();assert.equal(p.pending.size,0);
});
test("ambient redraw work is capped and no-Canvas/unknown routes do not start a continuous loop",()=>{
  for(const narrow of[false,true]){const p=visit({narrow});p.settle();const n=p.draws();for(let i=0;i<60;i++)p.frame(1000/60);assert.ok(p.draws()-n<=(narrow?16:24));assert.ok(p.draws()>n);}
  const missing=visit({noCanvas:true});assert.equal(missing.pending.size,0);assert.equal(missing.button.hidden,true);
  const unknown=visit({page:"unknown"});unknown.settle();unknown.scroll(5000);assert.equal(unknown.pending.size,0);
});
test("short/degenerate pages keep their camera and still breathe without manufactured scroll",()=>{
  for(const stops of[[],[["unknown",100]],[["research",0]],[["hero",0],["research",0]]]){
    const p=visit({stops});p.settle();const camera=p.trace(),phase=p.phase();p.scroll(9000);p.settle();assert.equal(p.trace(),camera);assert.ok(p.phase()>phase);
  }
  for(const page of["research","talks","credits"]){const p=visit({page});p.settle();const start=p.trace();p.scroll(1200);p.settle();assert.notEqual(p.trace(),start);p.scroll(0);p.settle();assert.equal(p.trace(),start);}
});
test("Writing topic travel, reflow, empty restoration and unchanged scroll preserve local progress",()=>{
  const p=visit({page:"writing"});p.event("site:scene-focus",{focus:"systems",reason:"initial"});p.settle();p.scroll(1500);p.settle();const fixed=p.trace();
  p.layout([[400,560],[2800,2960]]);p.settle();assert.equal(p.trace(),fixed);p.scroll(1500);p.settle();assert.equal(p.trace(),fixed);
  p.layout([]);p.settle();p.layout([[1000,1160]]);p.settle();p.scroll(1500);p.settle();assert.equal(p.trace(),fixed);
  p.scroll(1450);p.settle();assert.notEqual(p.trace(),fixed);
  p.event("site:scene-focus",{focus:"delivery",reason:"filter"});p.settle();const changed=p.trace();
  for(const focus of["__proto__","verification","unknown"])p.event("site:scene-focus",{focus});p.settle();assert.equal(p.trace(),changed);
  p.click();p.settle();const frozen=p.trace(),phase=p.phase();p.event("site:scene-focus",{focus:"leadership",reason:"initial"});p.layout([]);p.scroll(3000);p.settle();assert.equal(p.trace(),frozen);assert.equal(p.phase(),phase);
});
test("loop closes in position and velocity, stays bounded, and never mutates rest geometry",()=>{
  for(const page of Object.keys(model.initialPoses)){
    const world=model.worldFor(page),original=JSON.stringify(world);
    for(const o of world.objects.filter((_,i)=>i%13===0)){
      const point=world.faces[o.firstFace]?.points[0]||o.center;
      const at=t=>model.loopTransform(o,t)(point),start=at(0),end=at(model.LOOP_MS);
      assert.deepEqual(start,end);const h=.01,left=at(-h),right=at(h),endLeft=at(model.LOOP_MS-h),endRight=at(model.LOOP_MS+h);
      for(let j=0;j<3;j++)assert.ok(Math.abs((right[j]-left[j])-(endRight[j]-endLeft[j]))<1e-9);
      for(let t=0;t<model.LOOP_MS;t+=1000){const p=at(t);assert.ok(p.every(Number.isFinite));assert.ok(Math.hypot(...p.map((v,i)=>v-point[i]))<2.2);}
    }
    assert.equal(JSON.stringify(world),original);
  }
});
test("every page has eight semantic motifs, three recursive depths, immutable topology and bounded mobile detail",()=>{
  const identities=new Set();
  for(const page of Object.keys(model.initialPoses)){
    const w=model.worldFor(page),small=model.worldFor(page,true);identities.add(JSON.stringify(w.faces));
    assert.deepEqual(w,model.worldFor(page));assert.equal(new Set(w.objects.map(o=>o.symbol)).size,8);
    assert.deepEqual([...new Set(w.objects.map(o=>o.depth))].sort(),[0,1,2]);
    const lookup=new Map(w.objects.map(o=>[o.name,o]));for(const o of w.objects.filter(o=>o.parent)){assert.equal(lookup.get(o.parent).depth,o.depth-1);assert.ok(o.scale<lookup.get(o.parent).scale);}
    assert.ok(w.faces.length+w.lines.length<14000);assert.ok(small.faces.length+small.lines.length<=w.faces.length+w.lines.length);
  }
  assert.equal(identities.size,5);
});
test("camera traverses multiple structures, is continuous/reversible and clips safely through near planes",()=>{
  for(const ids of[...Object.values(model.topicPaths),...Object.values(model.pageStops).map(Object.values)]){
    assert.deepEqual(model.journeyPose(ids,0),model.poses[ids[0]]);assert.deepEqual(model.journeyPose(ids,1),model.poses[ids.at(-1)]);
    assert.ok(model.poses[ids[0]].position[2]-model.poses[ids.at(-1)].position[2]>60);
    for(let i=0;i<=80;i++){const p=model.journeyPose(ids,i/80);assert.ok([...p.position,...p.target].every(Number.isFinite));assert.ok(p.target[2]<p.position[2]-5);}
    for(let i=1;i<ids.length-1;i++){const t=i/(ids.length-1),a=model.journeyPose(ids,t-1e-5),b=model.journeyPose(ids,t+1e-5);assert.ok(Math.hypot(...a.position.map((v,j)=>v-b.position[j]))<.02);}
  }
  assert.equal(model.clipSegment([0,0,-2],[2,3,-1]),null);assert.deepEqual(model.clipSegment([0,0,-1],[2,3,2]),[[1,1.5,.5],[2,3,2]]);
  const polygon=[[0,0,-1],[2,0,2],[2,2,2],[0,2,-1]],copy=JSON.stringify(polygon);assert.ok(model.clipPolygon(polygon).every(p=>p[2]>=.5));assert.equal(JSON.stringify(polygon),copy);
  for(const page of Object.keys(model.initialPoses)){
    const w=model.worldFor(page),ids=page==="writing"?model.topicPaths.all:Object.values(model.pageStops[page]);
    for(let i=0;i<=12;i++){const shapes=model.projectedWorld(w,model.journeyPose(ids,i/12),1440,900,i*3200);assert.ok(shapes.length>30,"environment remains visible through the journey");assert.ok(shapes.every(s=>s.points.flat().every(Number.isFinite)));}
  }
});

test("rapid reversal clears obsolete targets on every route",()=>{
  for(const page of Object.keys(model.initialPoses)){
    const p=visit({page});p.settle();const initial=p.trace();
    p.scroll(1800);p.scroll(0);p.settle();assert.equal(p.trace(),initial);
    p.scroll(2200);p.frame(65);p.scroll(0);p.settle();assert.equal(p.trace(),initial);
  }
});
test("delayed CSS cannot partially activate; post-activation draw failure stops once",()=>{
  const p=visit({styled:false});assert.equal(p.pending.size,0);assert.equal(p.button.hidden,true);assert.equal(p.scene.dataset.ready,undefined);
  p.styling(true);p.settle();assert.equal(p.scene.dataset.ready,"true");assert.equal(p.button.hidden,false);
  p.drawingFault();p.frame(80);assert.equal(p.pending.size,0);assert.equal(p.scene.dataset.ready,undefined);assert.equal(p.button.disabled,true);assert.equal(p.button["aria-pressed"],"false");
  p.event("resize");p.mutate();assert.equal(p.pending.size,0);
});
test("24-second cycle doubles v8 speed without changing geometry or camera",()=>{
  assert.equal(model.LOOP_MS,24000);
  const w=model.worldFor("writing"),o=w.objects[0],point=w.faces[0].points[0];
  assert.deepEqual(model.loopTransform(o,6000)(point),model.loopTransform(o,30000)(point));
  const compact=model.worldFor("writing",true);assert.deepEqual(w.objects.map(o=>[o.name,o.center]),compact.objects.map(o=>[o.name,o.center]));
});
function advanceUntil(p,predicate,message,maxFrames=300) {
  for(let i=0;i<maxFrames&&!predicate();i++)p.frame(125);
  assert.ok(predicate(),message);
}
test("observed-cost adaptation preserves the bitmap and DPR caps through resize and Off",()=>{
  const p=visit({paintCost:30});p.frame(125);assert.equal(p.bitmapValid(),true);
  let previousQuality=p.scene.dataset.quality;
  for(const target of ["1","2"]){
    let changed=false;
    for(let i=0;i<80&&!changed;i++){
      const oldWidth=p.canvas.width,oldResizes=p.resizeCount();p.frame(125);
      if(p.scene.dataset.quality!==previousQuality){
        assert.equal(p.scene.dataset.quality,target);assert.equal(p.canvas.width,oldWidth);
        assert.equal(p.resizeCount(),oldResizes);assert.equal(p.bitmapValid(),true);previousQuality=target;changed=true;
      }
    }
    assert.ok(changed);p.frame(125);assert.equal(p.canvas.width,Math.round(1440*(target==="1"?1.25:1)));assert.equal(p.bitmapValid(),true);
  }
  const fixed=p.trace(),phase=p.phase(),width=p.canvas.width;
  p.click();p.settle();assert.equal(p.stored(),"off");assert.equal(p.pending.size,0);assert.equal(p.trace(),fixed);assert.equal(p.phase(),phase);
  p.events.resize();assert.equal(p.bitmapValid(),true);p.settle();assert.equal(p.canvas.width,width);assert.equal(p.trace(),fixed);assert.equal(p.phase(),phase);
  p.mutate();p.settle();p.hidden(true);p.hidden(false);p.settle();assert.equal(p.phase(),phase);assert.equal(p.trace(),fixed);assert.equal(p.pending.size,0);
});
test("quality recovery uses hysteresis and restores resolution without changing composition",()=>{
  const p=visit({paintCost:30});advanceUntil(p,()=>p.scene.dataset.quality==="2","reach low tier");p.frame(125);
  const pose=p.trace();p.paintCost(5);
  for(let i=0;i<20;i++)p.frame(125);assert.equal(p.scene.dataset.quality,"2");
  advanceUntil(p,()=>p.scene.dataset.quality==="1","recover one tier");p.frame(125);assert.equal(p.canvas.width,1800);assert.equal(p.trace(),pose);
  advanceUntil(p,()=>p.scene.dataset.quality==="0","recover full tier");p.frame(125);assert.equal(p.canvas.width,2160);assert.equal(p.trace(),pose);assert.equal(p.bitmapValid(),true);
});
test("severe hold is bounded, preserves preference, and explicit On retries at the safe tier",()=>{
  const p=visit({paintCost:60,saved:"on"});advanceUntil(p,()=>p.scene.dataset.quality==="still","device hold");
  const fixed=p.trace(),phase=p.phase(),draws=p.draws();assert.equal(p.pending.size,0);assert.equal(p.stored(),"on");assert.equal(p.button.textContent,"Motion: still (device)");assert.equal(p.button["aria-pressed"],"false");
  for(let i=0;i<8;i++)p.frame(125);assert.equal(p.draws(),draws);assert.equal(p.trace(),fixed);assert.equal(p.phase(),phase);
  p.events.resize();p.settle();assert.equal(p.canvas.width,1440);assert.equal(p.trace(),fixed);assert.equal(p.phase(),phase);
  p.click();p.settle();assert.equal(p.stored(),"off");assert.equal(p.button.textContent,"Motion: off");assert.equal(p.pending.size,0);
  p.paintCost(5);p.click();p.settle();assert.equal(p.stored(),"on");assert.equal(p.button["aria-pressed"],"true");assert.equal(p.button.textContent,"Motion: on");assert.ok(p.pending.size>0);assert.equal(p.canvas.width,1440);
  assert.ok(p.phase()>phase);assert.equal(p.trace(),fixed);
});
