"use strict";
// Native function factory; the producer serializes this exact authored function.
module.exports=function(api) {
  const {sub,mix,clamp,LOOP_MS,rates,owns,smooth,atmosphereState,followCamera,fitScrollStops,writingProgress,cadenceFor,nextDeadline,poses,topicPaths,pageStops,initialPoses,routeOrder,roomSpacing,worldFor,projectedWorld,paintShapes,journeyPose,routePose,roomOffset,translatePose}=api;
  if (typeof document === "undefined") return;
  const canvas = document.getElementById("space-canvas");
  const control = document.getElementById("space-motion");
  if (!canvas || !control || !window.matchMedia || !window.requestAnimationFrame) return;
  let ctx;
  try { ctx=canvas.getContext("2d"); } catch { return; }
  if (!ctx) return;
  const scene = canvas.parentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = window.matchMedia("(max-width: 640px)");
  let page = document.body.dataset.page;
  const key="vo.motion";
  let choice=null;
  try { choice=localStorage.getItem(key); } catch { /* In-tab controls remain useful. */ }
  let enabled=choice!=="off" && !reduced.matches, printing=false, pending=null,initialized=false,failed=false;
  let width=1,height=1,ratio=1,stops=[],bounds=null,focus="all",localProgress=0;
  const initial=initialPoses[page]||"overview";
  const rooms=new Map();
  let compact=narrow.matches,ambientTime=0,lastFrame=null,nextDraw=null;
  let layoutDirty=true,layoutReasons=new Set(['initial']),layoutPasses=0;
  let idleRate=30,costAverage=0,costSamples=0,cadenceSlow=0,cadenceFast=0,lastCadenceChange=0,detailTier=0,displayedTier=0;
  let tier=0,slow=0,fast=0,lastQualityChange=0,hold=false;
  const clock=()=>window.performance?.now()??Date.now();
  let current=routePose(page,poses[initial]), animation=null, writingAnchor=null,displayedTime=0,displayedCamera=current,journey=null;
  let travelUpdate=null;
  let flightDetail=false,refineAt=null;
  let colors={cyan:"#075d7b",amber:"#895710",paper:"#f8f7f3"};
  let paletteRevision=0,colorFills=new Map();
  const pose = id => routePose(page,poses[id]);
  const pathPose = () => routePose(page,journeyPose(topicPaths[focus],localProgress,narrow.matches));
  const effects=window.SiteEffects;
  if(effects&&effects.contract!==1)throw Error('Incompatible scene effect contract');
  const sceneEffects=effects?.scene?.(api);
  // The decorative mobile bitmap uses one physical pixel per CSS pixel.
  // Text and controls retain their native resolution; timing is independent.
  const pixelRatio=()=>Math.min(compact||tier===2?1:tier===1?1.25:1.5,window.devicePixelRatio||1);
  function visible(el) { return !el.hidden && el.getClientRects().length>0; }
  function measure() {
    const read=()=>measureNative();
    if(effects?.measure)return effects.measure(read);
    return read();
  }
  function measureNative() {
    layoutPasses++;
    width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);
    ratio=pixelRatio();
    const maxScroll=Math.max(0,document.documentElement.scrollHeight-height);
    const markers=[...document.querySelectorAll("[data-space-stop]")].filter(el=>visible(el) && pageStops[page]?.[el.dataset.spaceStop]).map(el=>({id:pageStops[page][el.dataset.spaceStop],y:Math.max(0,el.getBoundingClientRect().top+window.scrollY-height*.22)}));
    stops=fitScrollStops(markers,maxScroll);
    bounds=null;
    if (page==="writing") {
      const results=document.getElementById("archive-results");
      const row=results ? [...results.querySelectorAll("li.publication")].find(visible) : null;
      if (row) {
        const first=row.getBoundingClientRect();
        const firstY=Math.max(0,first.top+window.scrollY-height*.22),end=maxScroll;
        // A one-record archive can start below the maximum viewport offset.
        // In that case its entire real scroll range still forms a valid path.
        const start=firstY<end-.5?firstY:0;
        if (end>start+.5) bounds={start,end};
      }
      writingAnchor={y:window.scrollY,progress:localProgress};
    }
  }
  function flushLayout() {
    if(!layoutDirty||failed)return;
    // During departure the engine already owns the next route, while the old
    // DOM is still shown. Its geometry cannot describe the destination.
    if(document.body.dataset.page!==page)return;
    layoutDirty=false;const reasons=[...layoutReasons];layoutReasons.clear();
    const start=window.SiteEngineProbe?clock():0;measure();
    if(window.SiteEngineProbe)diagnostic('layout',{reasons,passes:layoutPasses,start,duration:clock()-start});
    const target=scrollPose();if(journey)journey.to=target;else moveTo(target);
    nextDraw=null;
  }
  function invalidateLayout(reason) {
    layoutDirty=true;layoutReasons.add(reason);
    if(!initialized){initialize();return;}if(!failed)schedule();
  }
  // Opt-in measurements emit no timing/JSON work on an ordinary visitor path.
  function diagnostic(kind,detail) {
    window.SiteEngineProbe?.({kind,time:clock(),page,...detail});
  }
  function readColors() {
    const css=window.getComputedStyle(document.documentElement);
    const next={cyan:css.getPropertyValue("--accent").trim(),amber:css.getPropertyValue("--systems").trim(),paper:css.getPropertyValue("--paper").trim(),sheet:(css.getPropertyValue("--scene-sheet")||"#fffefa").trim()};
    if(!Object.values(next).every(v=>/^#[0-9a-f]{6}$/i.test(v)))return false;
    colors=next;
    paletteRevision++;colorFills.clear();
    return true;
  }
  function paintColors(room) {
    const rgb=Object.fromEntries(Object.entries(colors).map(([key,hex])=>[key,hex.slice(1).match(/.{2}/g).map(value=>parseInt(value,16))]));
    const paper=rgb.paper;
    room.faceColors=room.world.faces.map(f=>{
      const key=(f.fillColor||f.color)+":"+f.tint;
      if(!colorFills.has(key)){
        const ink=rgb[f.fillColor||f.color];
        colorFills.set(key,"#"+paper.map((value,i)=>Math.round(value+(ink[i]-value)*f.tint).toString(16).padStart(2,"0")).join(""));
        if(colorFills.size>16384)colorFills.delete(colorFills.keys().next().value);
      }
      return colorFills.get(key);
    });
    room.paletteRevision=paletteRevision;
  }
  function roomFor(name,detail=compact||detailTier>=.5||!!journey||flightDetail) {
    // Reduce actual model/paint work on a slow desktop as well as on mobile.
    // The same motif IDs, macro positions and recursive topology survive.
    if(!rooms.has(name)){
      while(rooms.size>=3){const oldest=[...rooms.keys()].find(id=>id!==page&&id!==name);rooms.delete(oldest);}
      rooms.set(name,new Map());
    }
    const variants=rooms.get(name);
    if(!variants.has(detail)){
      const start=window.SiteEngineProbe?clock():0;
      const room={world:worldFor(name,detail),compact:detail,faceColors:[]};variants.set(detail,room);paintColors(room);
      if(window.SiteEngineProbe)diagnostic('model',{route:name,compact:detail,start,duration:clock()-start,objects:room.world.objects.length,vertices:room.world.objects.reduce((n,o)=>n+o.points.length,0),faces:room.world.faces.length,lines:room.world.lines.length});
    }
    rooms.delete(name);rooms.set(name,variants);
    while(rooms.size>3){const oldest=[...rooms.keys()].find(id=>id!==page&&id!==name);rooms.delete(oldest);}
    const room=variants.get(detail);if(room.paletteRevision!==paletteRevision)paintColors(room);return room;
  }
  function scrollPose() {
    if (page==="writing") {
      if (!bounds) return journey?pathPose():current;
      localProgress=writingProgress(window.scrollY,bounds,writingAnchor);
      return pathPose();
    }
    if (!pageStops[page] || stops.length<2) return journey?pose(initialPoses[page]):current;
    if(window.scrollY<=stops[0].y) return pose(stops[0].id);
    let i=0;while(i<stops.length-2 && window.scrollY>=stops[i+1].y)i++;
    const a=stops[i],b=stops[i+1],t=clamp((window.scrollY-a.y)/(b.y-a.y));
    return routePose(page,journeyPose(stops.map(s=>s.id),(i+t)/(stops.length-1),narrow.matches));
  }
  function schedule() {
    if(initialized && !failed && pending===null && !document.hidden && !printing) pending=window.requestAnimationFrame(frame);
  }
  function cancel() {
    if(pending!==null)window.cancelAnimationFrame(pending);
    pending=null;animation=null;lastFrame=null;nextDraw=null;
    ambientTime=displayedTime;current=displayedCamera;detailTier=displayedTier;
    if(journey){journey.from=current;journey.elapsed=0;}
  }
  function moveTo(target) {
    if (!initialized || failed || hold || document.hidden || printing || !enabled) return;
    if(journey){journey.to=target;return;}
    if(Math.hypot(...sub(current.position,target.position),...sub(current.target,target.target))<1e-6){animation=null;return;}
    // Retarget without resetting the frame clock. Resetting start on every scroll
    // event would keep the camera at t=0 during a continuous wheel/touch gesture.
    if(!animation)nextDraw=null;
    animation={to:target,last:animation?.last??null};schedule();
  }
  function visibleRooms() {
    if(!journey){
      const room=roomFor(page);
      const shapes=projectedWorld(room.world,translatePose(current,-roomOffset(page)),width,height,ambientTime,detailTier,true,false);
      for(const shape of shapes)shape.room=room;
      return shapes;
    }
    // Render at most the two rooms around the camera, including intermediate
    // rooms on a multi-page flight. Models are lazy and the cache is bounded.
    const near=Math.max(0,Math.min(routeOrder.length-1,Math.floor((24-current.position[2])/roomSpacing)));
    const names=[routeOrder[near],routeOrder[Math.min(near+1,routeOrder.length-1)]];
    const active=[...new Set(names)];
    const shapes=active.flatMap(name=>{
      // Entire room envelope behind the camera cannot contribute geometry.
      const local=translatePose(current,-roomOffset(name));
      const forward=api.normalize(sub(local.target,local.position));
      if(api.dot(sub([0,0,-48],local.position),forward)+110<.5)return [];
      const room=roomFor(name);
      return projectedWorld(room.world,translatePose(current,-roomOffset(name)),width,height,ambientTime,detailTier,true,false).map(shape=>{shape.room=room;return shape;});
    });
    return shapes;
  }
  function draw() {
    // Resize only inside the protected paint, retaining the last valid bitmap.
    const w=Math.round(width*ratio),h=Math.round(height*ratio);
    if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    const state={current,width,height,ambientTime,compact,scene};
    const shapes=visibleRooms().concat(sceneEffects?.collect(state)||[]).sort((a,b)=>b.depth-a.depth);
    paintShapes(ctx,shapes,colors,sceneEffects?.paint);
    const air=atmosphereState(ambientTime);
    scene.style?.setProperty("--air-x",air.x.toFixed(3)+"px");
    scene.style?.setProperty("--air-y",air.y.toFixed(3)+"px");
    scene.style?.setProperty("--air-light",air.light.toFixed(5));
    ctx.globalAlpha=1;scene.dataset.ready="true";displayedTime=ambientTime;displayedCamera=current;displayedTier=detailTier;
    scene.dataset.phase=String(ambientTime);scene.dataset.camera=JSON.stringify(current);scene.dataset.detail=String(detailTier);
    scene.dataset.route=page;scene.dataset.travel=journey?"flying":"settled";scene.dataset.rooms=String(rooms.size);
    scene.dataset.geometry=compact||detailTier>=.5||journey||flightDetail?"compact":"full";
    scene.dataset.roomModels=String([...rooms.values()].reduce((count,variants)=>count+variants.size,0));
  }
  function fail() {
    failed=true;cancel();delete scene.dataset.ready;scene.dataset.state="fallback";
    control.hidden=false;control.disabled=true;control.setAttribute("aria-pressed","false");control.textContent="Motion: unavailable";
    reportTravel(1);
  }
  function reportTravel(progress) {
    scene.dataset.progress=String(progress);
    const update=travelUpdate;
    if(progress===1)travelUpdate=null;
    update?.(progress);
  }
  function adaptCadence(cost,time) {
    // Ignore the one-time initial paint for cadence estimation. Adapt to actual
    // cost before considering a slower detail tier; retain a strict mobile idle
    // share with headroom. Sustained votes/cooldown prevent threshold oscillation.
    if(costSamples++>0){
      costAverage=costAverage===0?cost:costAverage*.8+cost*.2;
      const desired=cadenceFor(costAverage,compact);
      if(desired<idleRate){cadenceSlow++;cadenceFast=0;}
      else if(desired>idleRate && costAverage*desired<(compact ? 0.145 : 0.32)*1000){cadenceFast++;cadenceSlow=0;}
      else cadenceSlow=cadenceFast=0;
      if(cadenceSlow>=5 && time-lastCadenceChange>=400){idleRate=desired;lastCadenceChange=time;cadenceSlow=cadenceFast=0;nextDraw=null;}
      else if(cadenceFast>=60 && time-lastCadenceChange>=2500){idleRate=rates[rates.indexOf(idleRate)-1];lastCadenceChange=time;cadenceSlow=cadenceFast=0;nextDraw=null;}
    }
  }
  function quality(cost,time) {
    adaptCadence(cost,time);scene.dataset.cadence=String(idleRate);
    if(cost>25){slow++;fast=0;}else if(cost<10){fast++;slow=Math.max(0,slow-1);}else{slow=Math.max(0,slow-1);fast=0;}
    if(time-lastQualityChange<2500)return;
    if(slow>=8 && tier<2){tier++;slow=fast=0;lastQualityChange=time;ratio=pixelRatio();}
    else if(slow>=16 && tier===2 && cost>50){
      const arrival=journey?.to;
      hold=true;cancel();
      // A device hold completes an explicitly requested route with one still
      // destination paint. User Off/hidden/print still freeze the exact frame.
      if(arrival){current=arrival;journey=null;schedule();}
      updateControl();
    }
    else if(fast>=100 && tier>0){tier--;ratio=pixelRatio();slow=fast=0;lastQualityChange=time;}
    scene.dataset.quality=hold?"still":String(tier);
  }
  function advanceJourney(delta,living) {
    if(journey&&living) {
      journey.elapsed+=delta;
      const t=clamp(journey.elapsed/journey.duration);
      current=mix(journey.from,journey.to,smooth(t));
      if(t===1){current=journey.to;journey=null;refineAt=clock()+250;}
    }
  }
  function frame(time) {
    pending=null;if(document.hidden || printing || !initialized || failed)return;
    try{flushLayout();}catch{fail();return;}
    const delta=lastFrame===null?0:Math.min(80,Math.max(0,time-lastFrame));lastFrame=time;
    const living=enabled&&!hold&&owns(initialPoses,page);
    if(living){ambientTime=(ambientTime+delta)%LOOP_MS;detailTier+=(tier-detailTier)*(1-Math.exp(-delta/180));}
    advanceJourney(delta,living);
    // Arrival paints retain the already prepared compact scene. Desktop detail
    // returns after text is ready, only on the existing living scene scheduler.
    if(flightDetail&&!journey&&!animation&&living&&refineAt!==null&&time>=refineAt){flightDetail=false;refineAt=null;}
    if(animation && enabled && !hold) {
      const dt=animation.last===null?delta:Math.min(80,Math.max(0,time-animation.last));
      animation.last=time;
      current=followCamera(current,animation.to,dt);
      const done=Math.hypot(...sub(current.position,animation.to.position),...sub(current.target,animation.to.target))<1e-5;
      if(done)current=animation.to;
      if(done)animation=null;
    }
    // Camera response gets a temporary, cost-bounded higher cadence. Deadlines
    // retain fractional phase instead of rounding every frame down to 20/15Hz.
    const cameraRate=Math.min([30,20,15][tier],cadenceFor(costAverage,compact,true));
    const interval=1000/(animation||journey?Math.max(idleRate,cameraRate):idleRate);
    if(nextDraw===null||time+.5>=nextDraw||!living) {
      const start=clock();
      try{draw();}catch{fail();return;}
      // Text follows the painted camera, including skipped frames and stalls.
      if(travelUpdate)reportTravel(journey?clamp(journey.elapsed/journey.duration):1);
      nextDraw=nextDeadline(nextDraw,time,interval);
      if(living)quality(clock()-start,time);
    }
    if(animation||living&&!hold)schedule();
  }
  function updateControl() {
    if(failed)return;
    control.hidden=false;control.disabled=reduced.matches;control.setAttribute("aria-pressed",String(enabled&&!hold));
    control.textContent=reduced.matches?"Motion: reduced":!enabled?"Motion: off":hold?"Motion: still (device)":"Motion: on";
  }
  function preferenceChanged() {
    const was=enabled;enabled=choice!=="off" && !reduced.matches;
    if(enabled&&!was)lastFrame=null;
    if(!enabled){if(was)cancel();}else if(!was)moveTo(page==="writing" && !bounds?pathPose():scrollPose());
    updateControl();schedule();
    if(window.dispatchEvent)window.dispatchEvent(new CustomEvent("site:motion-preference"));
  }
  control.addEventListener("click",()=>{
    choice=enabled?"off":"on";
    if(choice==="on" && hold){hold=false;slow=fast=0;lastFrame=null;}
    try{localStorage.setItem(key,choice);}catch{/* In-tab preference still applies. */}
    preferenceChanged();
  });
  window.addEventListener("scroll",()=>{
    if(!enabled || document.hidden || printing)return;
    if(page!=="writing" && !pageStops[page])return;
    // A new scroll takes control of any unfinished topic transition.
    moveTo(scrollPose());
  },{passive:true});
  window.addEventListener("site:scene-focus",event=>{
    if(page!=="writing" || !owns(topicPaths,event.detail?.focus))return;
    focus=event.detail.focus;invalidateLayout('archive-focus');
    if(!enabled || hold || document.hidden || printing)return;
    const target=pathPose();
    if(event.detail.reason==="initial"&&!journey){current=target;animation=null;schedule();}else moveTo(target);
  });
  const resize=()=>{
    if(!initialized){initialize();return;}
    if(failed)return;
    if(compact!==narrow.matches)compact=narrow.matches;
    invalidateLayout('resize');
  }; // Layout never changes a frozen camera/ambient phase or starts a flight.
  window.addEventListener("site:archive-layout",resize);
  window.addEventListener("resize",resize,{passive:true});
  window.addEventListener("load",resize,{once:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)cancel();else resize();});
  window.addEventListener("beforeprint",()=>{printing=true;cancel();});
  window.addEventListener("afterprint",()=>{printing=false;resize();});
  if(reduced.addEventListener)reduced.addEventListener("change",preferenceChanged);
  window.addEventListener("storage",event=>{if(event.key===key || event.key===null){try{choice=localStorage.getItem(key);}catch{choice=null;}preferenceChanged();}});
  if(window.MutationObserver)new window.MutationObserver(()=>{if(!initialized){initialize();return;}if(!failed && readColors())schedule();}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  const observer=window.ResizeObserver?new window.ResizeObserver(()=>invalidateLayout('size')):null;
  const contentObserver=window.MutationObserver?new window.MutationObserver(()=>invalidateLayout('content')):null;
  let observedMain=null;
  function observeLayout() {
    const main=document.querySelector('main');if(main===observedMain)return;observedMain=main;
    observer?.disconnect();contentObserver?.disconnect();
    // Body also covers an expanded footer/header. Subtree edits cover moving
    // interior waypoints even when the total main height stays unchanged.
    observer?.observe(document.body);observer?.observe(main);
    contentObserver?.observe(main,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["hidden","class","style","data-space-stop"]});
  }
  observeLayout();
  document.fonts?.addEventListener?.("loadingdone",resize);
  window.SiteScene={
    canTravel:()=>initialized&&!failed&&enabled&&!reduced.matches&&!hold&&!printing&&!document.hidden,
    navigate(next,animate=true,update=null){
      if(!owns(initialPoses,next))return;
      // Media-query state can change before its queued change event is delivered.
      if(reduced.matches&&enabled){enabled=false;cancel();updateControl();}
      const from=displayedCamera,sourcePage=page;page=next;focus="all";localProgress=0;writingAnchor=null;
      const target=pose(initialPoses[page]);
      animation=null;current=from;
      scene.dataset.direction=target.position[2]<from.position[2]?"forward":"backward";
      if(animate&&this.canTravel()){
        journey={from,to:target,elapsed:0,duration:Math.min(1700,1000+Math.abs(target.position[2]-from.position[2])*2)};
      }else{journey=null;current=target;}
      flightDetail=!!journey;refineAt=null;
      scene.dataset.travel=journey?"flying":"settled";
      travelUpdate=update;
      // Prepare the bounded source/target compact working set before the first
      // travelling paint. Probe costs remain part of input-to-ready evidence.
      if(journey){try{roomFor(sourcePage,true);roomFor(page,true);}catch{fail();return;}}
      reportTravel(journey?0:1);
      observeLayout();nextDraw=null;schedule();
    },
    refresh({sync=false,reason='mount'}={}){observeLayout();invalidateLayout(reason);if(sync)flushLayout();},
    diagnostics(){return {rooms:[...rooms].map(([route,variants])=>({route,models:[...variants].map(([compact,room])=>({compact,serializedChars:JSON.stringify(room.world).length}))})),paletteEntries:colorFills.size,layoutPasses};},
    detachTravel(){travelUpdate=null;}
  };
  // Stylesheet load/error is authoritative, including early WebKit deferral.
  function initialize() {
    if(initialized || failed || !readColors())return;
    measure();layoutDirty=false;layoutReasons.clear();initialized=true;scene.dataset.state="active";
    if(enabled) {
      if(page==="writing")current=pathPose();
      else if(stops.length===1)current=pose(stops[0].id);
      else current=scrollPose();
    }
    updateControl();schedule();
  }
  const stylesheet=document.querySelector('link[rel="stylesheet"]');
  stylesheet?.addEventListener?.("load",initialize,{once:true});
  stylesheet?.addEventListener?.("error",()=>{if(!initialized)fail();},{once:true});
  canvas.addEventListener?.("contextlost",fail);
  initialize();
};
