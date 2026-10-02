/* One illustrative world. Native scroll/topic choices move the camera; never the pointer. */
(() => {
  "use strict";
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0);
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const normalize = a => { const n = Math.hypot(...a); return n > 1e-9 ? a.map(v => v / n) : [0, 0, 1]; };
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const mix = (a, b, t) => ({ position: lerp(a.position, b.position, t), target: lerp(a.target, b.target, t) });
  const clamp = v => Math.max(0, Math.min(1, v));
  function clipSegment(a, b, near = .5) {
    if (a[2] < near && b[2] < near) return null;
    if (a[2] < near) a = lerp(a, b, (near - a[2]) / (b[2] - a[2]));
    else if (b[2] < near) b = lerp(b, a, (near - b[2]) / (a[2] - b[2]));
    return [a, b];
  }
  // Node positions and topology adapted from the reviewed, uncalibrated blueprint.
  const nodes = {
    intent:[-4,1,0], controller:[-1,1.6,.8], actuators:[1.7,1.8,1.4], process:[4.7,.9,2.2],
    outcome:[5.9,-1,2.6], evaluation:[2,-1.7,-.1], reference:[-1.5,-2.3,-1.4],
    work:[-6,4.5,-6], generation:[-3.8,4.5,-5.2], verification:[-1.3,4.5,-4.4], release:[1.8,4.5,-3.6]
  };
  const edges = [
    ["intent","controller"], ["controller","actuators"], ["actuators","process"],
    ["process","outcome"], ["outcome","evaluation"], ["reference","evaluation"],
    ["evaluation","controller",[[-.4,-2.8,-.7],[-3.1,-1.6,-.4],[-3.1,1.6,.8]]],
    ["work","generation"], ["generation","verification"], ["verification","release"]
  ]; // Deliberately no causal edge between the two research motifs.
  const planes = [
    { points:[[-5.2,2.3,-.6],[5.6,2.3,1.4],[6.8,-2.5,2.3],[-4,-3.1,-1.2]], color:"cyan" },
    { points:[[-6.8,5.2,-6.6],[3,5.2,-4],[3,3.5,-3],[-6.8,3.5,-5.8]], color:"cyan" },
    { points:[[5,-2,4],[7,-1,5],[8,-3,6],[6,-4,5]], color:"amber" }
  ];
  const poses = {
    overview:{position:[12,9,22],target:[0,1,-1]},
    control:{position:[7,5,13],target:[1.4,1.2,.9]},
    help:{position:[10,7,18],target:[.7,.8,-.5]},
    feedback:{position:[9,2.6,10],target:[2,-1,1]},
    context:{position:[-2,6,20],target:[-2,0,-1]},
    closing:{position:[9,8,20],target:[0,1,-1]},
    // Explicit finite paths around the named nodes, rather than unresolved pose IDs.
    verification:{position:[5,9,8],target:[-1.3,4.5,-4.4]},
    verificationEnd:{position:[7,8,9],target:[-.3,4.5,-4.1]},
    controller:{position:[4,5,10],target:[-1,1.6,.8]},
    controllerEnd:{position:[1,5,12],target:[-1,1.6,.8]}
  };
  const topicPaths = { all:["overview","closing"], strategy:["overview","closing"], systems:["control","feedback"], delivery:["verification","verificationEnd"], leadership:["controller","controllerEnd"] };
  const pageStops = {
    index:{hero:"overview",research:"control",help:"help",writing:"feedback",acknowledgements:"context",about:"closing",contact:"closing"},
    research:{intro:"overview",research:"control",lenses:"overview",topics:"overview",acknowledgements:"context"}
  };
  const segments = [];
  for (const [from,to,via=[]] of edges) {
    const points = [nodes[from],...via,nodes[to]];
    for (let i=1;i<points.length;i++) segments.push({a:points[i-1],b:points[i],color:from==="evaluation"?"amber":"cyan",arrow:i===points.length-1});
  }
  // An authored narrowing verification passage; not a measured bottleneck.
  const gates = [[-2.8,4.5,-4.9,1.05],[-1.3,4.5,-4.4,.43],[.2,4.5,-4,1.0]].map(([x,y,z,r]) => [[x,y-r,z-r],[x,y+r,z-r],[x,y+r,z+r],[x,y-r,z+r]]);
  for (let g=0;g<gates.length;g++) for (let i=0;i<4;i++) {
    segments.push({a:gates[g][i],b:gates[g][(i+1)%4],color:"amber"});
    if(g) segments.push({a:gates[g-1][i],b:gates[g][i],color:"amber"});
  }
  // Export only pure geometry helpers to Node checks; no runtime dependency or debug UI.
  if (typeof module !== "undefined" && module.exports) module.exports = {clipSegment,mix,poses,topicPaths,pageStops,nodes,edges,segments};
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
  const page = document.body.dataset.page;
  const key="vo.motion";
  let choice=null;
  try { choice=localStorage.getItem(key); } catch { /* In-tab controls remain useful. */ }
  let enabled=choice!=="off" && !reduced.matches, printing=false, pending=null;
  let width=1,height=1,ratio=1,stops=[],bounds=null,focus="all",localProgress=0;
  let current=poses.overview, animation=null, writingAnchor=null;
  let colors={cyan:"#075d7b",amber:"#895710",paper:"#f8f7f3"};
  const pose = id => narrow.matches ? mix(poses.overview,poses[id],.58) : poses[id];
  const pathPose = () => { const [a,b]=topicPaths[focus]; return mix(pose(a),pose(b),localProgress); };
  function visible(el) { return !el.hidden && el.getClientRects().length>0; }
  function measure() {
    width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);
    ratio=Math.min(1.5,window.devicePixelRatio||1);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    stops=[...document.querySelectorAll("[data-space-stop]")].filter(el=>visible(el) && pageStops[page]?.[el.dataset.spaceStop]).map(el=>({id:pageStops[page][el.dataset.spaceStop],y:Math.max(0,el.getBoundingClientRect().top+window.scrollY-height*.22)}));
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
    colors={cyan:css.getPropertyValue("--accent").trim(),amber:css.getPropertyValue("--systems").trim(),paper:css.getPropertyValue("--paper").trim()};
  }
  function scrollPose() {
    if (page==="writing") {
      if (!bounds) return current;
      const {start,end}=bounds,y=window.scrollY,a=writingAnchor;
      if(!a || (a.progress===0 && a.y<=start) || (a.progress===1 && a.y>=end)) {
        localProgress=clamp((y-start)/(end-start));
      } else if(a.y>start && a.y<end) {
        // Keep the reader's last progress while both ends follow visible results.
        localProgress=clamp(y<=a.y ? a.progress*(y-start)/(a.y-start) : a.progress+(1-a.progress)*(y-a.y)/(end-a.y));
      } else {
        // A restored short block may no longer surround the reader. Resume from
        // the saved progress using its visible span, never total document height.
        localProgress=clamp(a.progress+(y-a.y)/(end-start));
      }
      return pathPose();
    }
    if (!pageStops[page] || stops.length<2) return current;
    if(window.scrollY<=stops[0].y) return pose(stops[0].id);
    let i=0;while(i<stops.length-2 && window.scrollY>=stops[i+1].y)i++;
    const a=stops[i],b=stops[i+1],t=clamp((window.scrollY-a.y)/(b.y-a.y));
    return mix(pose(a.id),pose(b.id),t);
  }
  function schedule() {
    if(pending===null && !document.hidden && !printing) pending=window.requestAnimationFrame(frame);
  }
  function cancel() {
    if(pending!==null)window.cancelAnimationFrame(pending);
    pending=null;animation=null;
  }
  function moveTo(target) {
    if (document.hidden || printing || !enabled) return;
    if(Math.hypot(...sub(current.position,target.position),...sub(current.target,target.target))<1e-6) return;
    animation={from:current,to:target,start:null};schedule();
  }
  function draw() {
    const forward=normalize(sub(current.target,current.position)),right=normalize(cross(forward,[0,1,0])),up=cross(right,forward);
    const camera = point => {const delta=sub(point,current.position);return [dot(delta,right),dot(delta,up),dot(delta,forward)];};
    const focal=height/(2*Math.tan(Math.PI/8));
    const project = p => [width*.62+p[0]*focal/p[2],height*.5-p[1]*focal/p[2]];
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);ctx.lineWidth=1;
    // Triangulate the uncalibrated, noncoplanar quad inputs. Conservatively omit a near-crossing face.
    const faces=planes.flatMap(p=>[[p.points[0],p.points[1],p.points[2]],[p.points[0],p.points[2],p.points[3]]].map(points=>({points:points.map(camera),color:p.color})));
    faces.sort((a,b)=>b.points.reduce((v,p)=>v+p[2],0)-a.points.reduce((v,p)=>v+p[2],0));
    for(const face of faces) {
      if(face.points.some(p=>p[2]<.5))continue;
      const points=face.points.map(project);ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();
      ctx.fillStyle=colors[face.color];ctx.globalAlpha=.07;ctx.fill();ctx.strokeStyle=colors[face.color];ctx.globalAlpha=.25;ctx.stroke();
    }
    function segment(a,b,color,arrow=false,alpha=.6) {
      const clipped=clipSegment(camera(a),camera(b));if(!clipped)return;
      const [from,to]=clipped.map(project);ctx.strokeStyle=colors[color];ctx.globalAlpha=alpha;
      ctx.beginPath();ctx.moveTo(...from);ctx.lineTo(...to);ctx.stroke();
      if(arrow) {
        const dx=to[0]-from[0],dy=to[1]-from[1],length=Math.hypot(dx,dy);
        if(length<10)return;
        const size=5,ux=dx/length,uy=dy/length;
        ctx.beginPath();ctx.moveTo(to[0]-ux*size-uy*size*.55,to[1]-uy*size+ux*size*.55);ctx.lineTo(...to);ctx.lineTo(to[0]-ux*size+uy*size*.55,to[1]-uy*size-ux*size*.55);ctx.stroke();
      }
    }
    for(const s of segments)segment(s.a,s.b,s.color,s.arrow);
    for(const [id,p] of Object.entries(nodes)) {
      const size=id==="process"?.43:.24;
      const corners=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(v=>add(p,v.map(x=>x*size)));
      const color=id==="evaluation" || id==="verification"?"amber":"cyan";
      for(const [a,b] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])segment(corners[a],corners[b],color,false,.72);
    }
    ctx.globalAlpha=1;scene.dataset.ready="true";
  }
  function frame(time) {
    pending=null;if(document.hidden || printing)return;
    if(animation && enabled) {
      if(animation.start===null)animation.start=time;
      const t=clamp((time-animation.start)/150),ease=t*t*(3-2*t);
      current=mix(animation.from,animation.to,ease);
      if(t===1)animation=null;
    }
    draw();if(animation)schedule();
  }
  function updateControl() {
    control.hidden=false;control.disabled=reduced.matches;control.setAttribute("aria-pressed",String(enabled));
    control.textContent=reduced.matches?"Motion: reduced":enabled?"Motion: on":"Motion: off";
  }
  function preferenceChanged() {
    const was=enabled;enabled=choice!=="off" && !reduced.matches;
    if(!enabled)cancel();else if(!was)moveTo(page==="writing" && !bounds?pathPose():scrollPose());
    updateControl();schedule();
  }
  control.addEventListener("click",()=>{
    choice=enabled?"off":"on";
    try{localStorage.setItem(key,choice);}catch{/* In-tab preference still applies. */}
    preferenceChanged();
  });
  window.addEventListener("scroll",()=>{
    if(!enabled || document.hidden || printing)return;
    if(page!=="writing" && !pageStops[page])return;
    // A new scroll takes control of any unfinished topic transition.
    animation=null;moveTo(scrollPose());
  },{passive:true});
  window.addEventListener("site:scene-focus",event=>{
    if(page!=="writing" || !Object.hasOwn(topicPaths,event.detail?.focus))return;
    focus=event.detail.focus;measure();
    if(!enabled)return;
    const target=pathPose();
    if(event.detail.reason==="initial"){current=target;animation=null;schedule();}else moveTo(target);
  });
  const resize=()=>{measure();schedule();}; // Layout never changes a frozen pose or starts a flight.
  window.addEventListener("site:archive-layout",resize);
  window.addEventListener("resize",resize,{passive:true});
  window.addEventListener("load",resize,{once:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)cancel();else resize();});
  window.addEventListener("beforeprint",()=>{printing=true;cancel();});
  window.addEventListener("afterprint",()=>{printing=false;resize();});
  if(reduced.addEventListener)reduced.addEventListener("change",preferenceChanged);
  window.addEventListener("storage",event=>{if(event.key===key || event.key===null){try{choice=localStorage.getItem(key);}catch{choice=null;}preferenceChanged();}});
  if(window.MutationObserver)new window.MutationObserver(()=>{readColors();schedule();}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  if(window.ResizeObserver)new window.ResizeObserver(resize).observe(document.querySelector("main"));
  measure();readColors();
  if(enabled) {
    if(page==="writing")current=pathPose();
    else if(stops.length===1)current=pose(stops[0].id);
    else current=scrollPose();
  }
  updateControl();schedule();
})();
