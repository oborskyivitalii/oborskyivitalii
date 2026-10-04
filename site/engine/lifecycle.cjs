"use strict";
// Native function factory; the producer serializes this exact authored function.
module.exports=function(api) {
  const {sub,mix,clamp,LOOP_MS,rates,owns,smooth,atmosphereState,followCamera,writingProgress,cadenceFor,nextDeadline,poses,topicPaths,pageStops,initialPoses,routeOrder,roomSpacing,worldFor,projectedWorld,journeyPose,blendColor,routePose,roomOffset,translatePose}=api;
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
  let compact=narrow.matches,world=worldFor(page,compact),ambientTime=0,lastFrame=null,nextDraw=null;
  let idleRate=30,costAverage=0,costSamples=0,cadenceSlow=0,cadenceFast=0,lastCadenceChange=0,detailTier=0,displayedTier=0;
  let tier=0,slow=0,fast=0,lastQualityChange=0,hold=false;
  const clock=()=>window.performance?.now()??Date.now();
  let current=routePose(page,poses[initial]), animation=null, writingAnchor=null,displayedTime=0,displayedCamera=current,journey=null;
  let travelUpdate=null;
  let colors={cyan:"#075d7b",amber:"#895710",paper:"#f8f7f3"};
  const pose = id => routePose(page,poses[id]);
  const pathPose = () => routePose(page,journeyPose(topicPaths[focus],localProgress,narrow.matches));
  rooms.set(page,{world,compact,faceColors:[]});
  // The decorative mobile bitmap uses one physical pixel per CSS pixel.
  // Text and controls retain their native resolution; timing is independent.
  const pixelRatio=()=>Math.min(compact||tier===2?1:tier===1?1.25:1.5,window.devicePixelRatio||1);
  function visible(el) { return !el.hidden && el.getClientRects().length>0; }
  function measure() {
    width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);
    ratio=pixelRatio();
    const maxScroll=Math.max(0,document.documentElement.scrollHeight-height);
    stops=[...document.querySelectorAll("[data-space-stop]")].filter(el=>visible(el) && pageStops[page]?.[el.dataset.spaceStop]).map(el=>({id:pageStops[page][el.dataset.spaceStop],y:Math.min(maxScroll,Math.max(0,el.getBoundingClientRect().top+window.scrollY-height*.22))}));
    // Coincident stops cannot define a flight interval. Never use document height as a substitute.
    stops=stops.filter((stop,i,all)=>i===0 || stop.y>all[i-1].y+.5);
    bounds=null;
    if (page==="writing") {
      const results=document.getElementById("archive-results");
      const rows=results ? [...results.querySelectorAll("li.publication")].filter(visible) : [];
      if (rows.length) {
        const first=rows[0].getBoundingClientRect(),last=rows[rows.length-1].getBoundingClientRect();
        const start=Math.max(0,first.top+window.scrollY-height*.22),end=last.bottom+window.scrollY-height*.22;
        if (end>start+.5) bounds={start,end};
      }
      writingAnchor={y:window.scrollY,progress:localProgress};
    }
  }
  function readColors() {
    const css=window.getComputedStyle(document.documentElement);
    const next={cyan:css.getPropertyValue("--accent").trim(),amber:css.getPropertyValue("--systems").trim(),paper:css.getPropertyValue("--paper").trim(),sheet:(css.getPropertyValue("--scene-sheet")||"#fffefa").trim()};
    if(!Object.values(next).every(v=>/^#[0-9a-f]{6}$/i.test(v)))return false;
    colors=next;
    for(const room of rooms.values())paintColors(room);
    return true;
  }
  function paintColors(room) {
    const fills=new Map(),next=colors;
    room.faceColors=room.world.faces.map(f=>{
      const key=(f.fillColor||f.color)+":"+f.tint;
      if(!fills.has(key))fills.set(key,blendColor(next.paper,next[f.fillColor||f.color],f.tint));
      return fills.get(key);
    });
  }
  function roomFor(name) {
    // Reduce actual model/paint work on a slow desktop as well as on mobile.
    // The same motif IDs, macro positions and recursive topology survive.
    const detail=compact||detailTier>=.5;
    if(!rooms.has(name)||rooms.get(name).compact!==detail){const room={world:worldFor(name,detail),compact:detail,faceColors:[]};rooms.set(name,room);paintColors(room);}
    return rooms.get(name);
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
      for(const name of rooms.keys())if(name!==page)rooms.delete(name);
      const shapes=projectedWorld(room.world,translatePose(current,-roomOffset(page)),width,height,ambientTime,detailTier);
      for(const shape of shapes)shape.room=room;
      return shapes;
    }
    // Render at most the two rooms around the camera, including intermediate
    // rooms on a multi-page flight. Models are lazy and the cache is bounded.
    const near=Math.max(0,Math.min(routeOrder.length-1,Math.floor((24-current.position[2])/roomSpacing)));
    const names=[routeOrder[near],routeOrder[Math.min(near+1,routeOrder.length-1)]];
    const active=[...new Set(names)];
    const shapes=active.flatMap(name=>{
      const room=roomFor(name);
      return projectedWorld(room.world,translatePose(current,-roomOffset(name)),width,height,ambientTime,detailTier).map(shape=>{shape.room=room;return shape;});
    }).sort((a,b)=>b.depth-a.depth);
    for(const name of rooms.keys())if(!active.includes(name)&&name!==page)rooms.delete(name);
    return shapes;
  }
  function draw() {
    // Resize only inside the protected paint, retaining the last valid bitmap.
    const w=Math.round(width*ratio),h=Math.round(height*ratio);
    if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    const shapes=visibleRooms();
    for(let index=0;index<shapes.length;index++) {
      const shape=shapes[index];
      if(shape.room.compact&&shape.kind==="line"&&!shape.arrow){index=drawLineRun(shapes,index);continue;}
      const points=shape.points,from=points[0],to=points[1];
      ctx.beginPath();ctx.moveTo(from[0],from[1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
      ctx.lineWidth=shape.lineWidth;ctx.strokeStyle=colors[shape.color];
      if(shape.kind==="face") {
        ctx.closePath();ctx.fillStyle=shape.room.faceColors[shape.material];
        ctx.globalAlpha=shape.alpha;ctx.fill();
        // Join adjacent paper facets without dark antialias seams.
        if(shape.edgeAlpha===0){ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;}else ctx.globalAlpha=shape.edgeAlpha;
        // Curved mobile motifs retain explicit outlines (rings, grilles,
        // waves and links); omit their faint internal facet strokes.
        if(!shape.room.compact||shape.edgeAlpha===0||shape.room.world.faces[shape.material].edgeAlpha>.12)ctx.stroke();
      } else {ctx.globalAlpha=shape.alpha;ctx.stroke();}
      if(shape.arrow) {
        const dx=to[0]-from[0],dy=to[1]-from[1],length=Math.hypot(dx,dy);
        if(length<10)continue;
        const size=5,ux=dx/length,uy=dy/length;
        ctx.beginPath();ctx.moveTo(to[0]-ux*size-uy*size*.55,to[1]-uy*size+ux*size*.55);ctx.lineTo(...to);ctx.lineTo(to[0]-ux*size+uy*size*.55,to[1]-uy*size-ux*size*.55);ctx.stroke();
      }
    }
    const air=atmosphereState(ambientTime);
    scene.style?.setProperty("--air-x",air.x.toFixed(3)+"px");
    scene.style?.setProperty("--air-y",air.y.toFixed(3)+"px");
    scene.style?.setProperty("--air-light",air.light.toFixed(5));
    ctx.globalAlpha=1;scene.dataset.ready="true";displayedTime=ambientTime;displayedCamera=current;displayedTier=detailTier;
    scene.dataset.phase=String(ambientTime);scene.dataset.camera=JSON.stringify(current);scene.dataset.detail=String(detailTier);
    scene.dataset.route=page;scene.dataset.travel=journey?"flying":"settled";scene.dataset.rooms=String(rooms.size);
    scene.dataset.geometry=compact||detailTier>=.5?"compact":"full";
  }
  // Preserve continuous opacity; group only adjacent compatible lines whose
  // opacity differs by less than 1/256. No visible 16-step fade quantization.
  function drawLineRun(shapes,index) {
    const first=shapes[index],alpha=first.alpha;
    ctx.beginPath();ctx.lineWidth=first.lineWidth;ctx.strokeStyle=colors[first.color];ctx.globalAlpha=alpha;
    let end=index;
    while(end<shapes.length){
      const shape=shapes[end];
      if(shape.kind!=="line"||shape.arrow||shape.color!==first.color||shape.lineWidth!==first.lineWidth||Math.abs(shape.alpha-alpha)>1/256)break;
      const [from,to]=shape.points;ctx.moveTo(from[0],from[1]);ctx.lineTo(to[0],to[1]);end++;
    }
    ctx.stroke();return end-1;
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
      if(t===1){current=journey.to;journey=null;}
    }
  }
  function frame(time) {
    pending=null;if(document.hidden || printing || !initialized || failed)return;
    const delta=lastFrame===null?0:Math.min(80,Math.max(0,time-lastFrame));lastFrame=time;
    const living=enabled&&!hold&&owns(initialPoses,page);
    if(living){ambientTime=(ambientTime+delta)%LOOP_MS;detailTier+=(tier-detailTier)*(1-Math.exp(-delta/180));}
    advanceJourney(delta,living);
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
    focus=event.detail.focus;measure();
    if(!enabled || hold || document.hidden || printing)return;
    const target=pathPose();
    if(event.detail.reason==="initial"&&!journey){current=target;animation=null;schedule();}else moveTo(target);
  });
  const resize=()=>{
    if(!initialized){initialize();return;}
    if(failed)return;
    if(compact!==narrow.matches){compact=narrow.matches;world=roomFor(page).world;}
    measure();nextDraw=null;schedule();
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
  const observer=window.ResizeObserver?new window.ResizeObserver(resize):null;
  observer?.observe(document.querySelector("main"));
  window.SiteScene={
    canTravel:()=>initialized&&!failed&&enabled&&!reduced.matches&&!hold&&!printing&&!document.hidden,
    navigate(next,animate=true,update=null){
      if(!owns(initialPoses,next))return;
      // Media-query state can change before its queued change event is delivered.
      if(reduced.matches&&enabled){enabled=false;cancel();updateControl();}
      const from=displayedCamera;page=next;focus="all";localProgress=0;writingAnchor=null;
      world=roomFor(page).world;measure();
      const target=pose(initialPoses[page]);
      animation=null;current=from;
      scene.dataset.direction=target.position[2]<from.position[2]?"forward":"backward";
      if(animate&&this.canTravel()){
        journey={from,to:target,elapsed:0,duration:Math.min(1700,1000+Math.abs(target.position[2]-from.position[2])*2)};
      }else{journey=null;current=target;}
      scene.dataset.travel=journey?"flying":"settled";
      travelUpdate=update;
      reportTravel(journey?0:1);
      observer?.disconnect();observer?.observe(document.querySelector("main"));nextDraw=null;schedule();
    },
    refresh(){observer?.disconnect();observer?.observe(document.querySelector("main"));measure();const target=scrollPose();if(journey)journey.to=target;else moveTo(target);},
    detachTravel(){travelUpdate=null;}
  };
  // Stylesheet load/error is authoritative, including early WebKit deferral.
  function initialize() {
    if(initialized || failed || !readColors())return;
    measure();initialized=true;scene.dataset.state="active";
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
