/* Related faceted worlds. Native scroll/topic choices move the camera; never the pointer. */
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
  function clipPolygon(points,near=.5) {
    const result=[];
    for(let i=0;i<points.length;i++) {
      const a=points[i],b=points[(i+1)%points.length],insideA=a[2]>=near,insideB=b[2]>=near;
      if(insideA)result.push(a);
      if(insideA!==insideB)result.push(lerp(a,b,(near-a[2])/(b[2]-a[2])));
    }
    return result;
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
  const poses = {
    overview:{position:[11,6.5,17.5],target:[0,.4,-.5]},
    researchOverview:{position:[7,8,17],target:[-.5,1.4,-1.5]},
    control:{position:[7.5,4.5,14],target:[1.1,.7,.5]},
    help:{position:[4.5,7,17],target:[.7,.5,-.5]},
    feedback:{position:[8,3,14],target:[1.5,-.5,1]},
    context:{position:[-4,6,17],target:[-1,.5,-1]},
    closing:{position:[10,8,18],target:[.5,.5,-1]},
    // Explicit finite paths around the named nodes, rather than unresolved pose IDs.
    verification:{position:[5,9,8],target:[-1.3,4.5,-4.4]},
    verificationEnd:{position:[7,8,9],target:[-.3,4.5,-4.1]},
    controller:{position:[4,5,10],target:[-1,1.6,.8]},
    controllerEnd:{position:[1,5,12],target:[-1,1.6,.8]},
    library:{position:[10,6,17],target:[0,.2,0]},
    libraryEnd:{position:[-4,4,16],target:[1,-.4,-1]},
    signal:{position:[10,5,17],target:[1,.5,-1]},
    signalEnd:{position:[4,7,16],target:[2,-.5,0]},
    network:{position:[11,7,18],target:[0,.5,-1]},
    networkEnd:{position:[8,6,17],target:[.6,0,-.4]}
  };
  const topicPaths = { all:["library","libraryEnd"], strategy:["library","closing"], systems:["control","feedback"], delivery:["verification","verificationEnd"], leadership:["controller","controllerEnd"] };
  const pageStops = {
    index:{hero:"overview",research:"control",help:"help",writing:"feedback",acknowledgements:"context",about:"closing",contact:"closing"},
    research:{intro:"researchOverview",research:"verification",lenses:"control",topics:"feedback",acknowledgements:"context"},
    talks:{intro:"signal",talks:"signalEnd",continue:"closing"},
    credits:{intro:"network",preferences:"networkEnd",contact:"closing"}
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
  const initialPoses={index:"overview",research:"researchOverview",writing:"library",talks:"signal",credits:"network"};
  const cubeFaces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]];
  const unitCorners=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  function worldFor(page) {
    const faces=[],lines=[];
    const face=(points,color="cyan",band="middle")=>faces.push({points,color,band});
    const line=(a,b,color="cyan",band="middle",arrow=false)=>lines.push({a,b,color,band,arrow});
    const box=(center,size,color="cyan",band="middle")=>{
      const vertices=unitCorners.map(v=>add(center,v.map((x,i)=>x*(Array.isArray(size)?size[i]:size))));
      for(const indices of cubeFaces)face(indices.map(i=>vertices[i]),color,band);
    };
    const path=(points,color="cyan",band="middle")=>{for(let i=1;i<points.length;i++)line(points[i-1],points[i],color,band);};
    // Quiet distant frames and large cropped foreground wedges are shared materials,
    // not telemetry, research results, or representations of named people.
    for(const z of[-13,-9,-5])path([[-10,6,z],[10,6,z],[10,-5,z],[-10,-5,z],[-10,6,z]],"cyan","distant");
    path([[-10,-5,-13],[-10,-5,-5],[10,-5,-5],[10,-5,-13]],"cyan","distant");
    const wedge=[[8.5,-5,7],[13,2,9],[8.5,6,6],[6,1,5],[10,0,11]].map(p=>page==="credits"?[p[0]+1,p[1]*.72,p[2]-1]:p);
    for(const indices of[[0,1,4],[1,2,4],[2,3,4],[3,0,4],[0,3,2],[0,2,1]])face(indices.map(i=>wedge[i]),"cyan","near");
    face([[-12,-5,7],[-8,-2,6],[-7,-6,9],[-11,-8,10]],"amber","near");
    if(page==="writing") {
      // A stack of offset, solid-edged planes; the archive has its own spatial identity.
      for(let i=0;i<6;i++) {
        const z=-5+i*1.55,x=-2+i*.7,y=1.4-i*.55;
        box([x,y,z],[3.4,.10,2.05],i===3?"amber":"cyan");
        path([[x-3.0,y+.12,z-1.55],[x+1.8,y+.12,z-1.55],[x+2.8,y+.12,z+.7]],i===3?"amber":"cyan");
      }
      path([[-5,1.6,-6],[-5,-1.5,4],[3,-1.5,5]],"amber");
    } else if(page==="talks") {
      // Outward, widening ribbons; no simulated audio or flashing stage effect.
      for(let i=0;i<4;i++) {
        const y=-2+i*1.6,z=-3+i*.75;
        face([[-4,y,z],[-1,y+.45,z+.3],[7,y+1.5,z+2.4],[9,y+.7,z+3],[-1,y-.2,z+.6]],i===1?"amber":"cyan");
        path([[-5,y,z],[-1,y+.2,z+.45],[4,y+.8,z+1.5],[10,y+.95,z+3]],i===1?"amber":"cyan");
      }
      box([-4,.7,-2],.6,"amber");
    } else if(page==="credits") {
      // Sparse abstract relationships. The topology intentionally does not map to people.
      const points=[[-4,2,-3],[0,3,-1],[4,1,0],[1,-2,2],[-3,-1,0],[5,-2,-3]];
      for(const [a,b] of[[0,1],[1,2],[2,3],[3,4],[4,0],[2,5]])line(points[a],points[b],a===3?"amber":"cyan");
      points.forEach((p,i)=>box(p,i===1?.65:.38,i===3?"amber":"cyan"));
    } else {
      // Separate control/feedback and generation/verification structures, with no causal join.
      faces.push({points:[[-5.2,2.3,-.6],[5.6,2.3,1.4],[6.8,-2.5,2.3],[-4,-3.1,-1.2]],color:"cyan",band:"middle"});
      for(const s of segments)line(s.a,s.b,s.color,"middle",s.arrow);
      for(const [id,p] of Object.entries(nodes))box(p,id==="process"?.65:.38,id==="evaluation"||id==="verification"?"amber":"cyan");
      for(const gate of gates)face(gate,"amber");
      if(page==="research") {
        face([[-7,5.8,-6.8],[3,5.8,-4],[3,3.1,-4],[-7,3.1,-6.8]],"cyan");
        path([[-5.4,-3.3,-1.5],[-5.4,2.8,-.5],[5.6,2.8,1.8]],"amber");
      }
    }
    return {faces,lines};
  }
  function projectedWorld(world,current,width,height) {
    const forward=normalize(sub(current.target,current.position)),right=normalize(cross(forward,[0,1,0])),up=cross(right,forward);
    const camera=point=>{const delta=sub(point,current.position);return [dot(delta,right),dot(delta,up),dot(delta,forward)];};
    const focal=height/(2*Math.tan(Math.PI/8));
    const project=p=>[width*(width<=640?.69:.66)+p[0]*focal/p[2],height*.48-p[1]*focal/p[2]];
    const shapes=[];
    for(const f of world.faces) {
      const points=clipPolygon(f.points.map(camera));
      if(points.length<3)continue;
      const normal=normalize(cross(sub(f.points[1],f.points[0]),sub(f.points[2],f.points[0])));
      const shade=.5+.5*Math.abs(dot(normal,normalize([-.6,.8,1])));
      const depth=points.reduce((v,p)=>v+p[2],0)/points.length;
      shapes.push({kind:"face",points:points.map(project),depth,color:f.color,band:f.band,
        tint:(f.band==="near"?.16:.08)+shade*(f.band==="near"?.16:.13),alpha:f.band==="near"?.88:.82,
        edgeAlpha:f.band==="near"?.55:.46,lineWidth:f.band==="near"?1.6:1});
    }
    for(const s of world.lines) {
      const clipped=clipSegment(camera(s.a),camera(s.b));if(!clipped)continue;
      shapes.push({kind:"line",points:clipped.map(project),depth:(clipped[0][2]+clipped[1][2])/2,
        color:s.color,alpha:s.band==="distant"?.2:.65,lineWidth:s.band==="distant"?.7:1.2,arrow:s.arrow});
    }
    // Faces AND edges participate in one painter order; near facets occlude distant lines.
    return shapes.sort((a,b)=>b.depth-a.depth);
  }
  function blendColor(a,b,t) {
    const rgb=hex=>hex.replace("#","").match(/.{2}/g).map(v=>parseInt(v,16));
    return "#"+lerp(rgb(a),rgb(b),t).map(v=>Math.round(v).toString(16).padStart(2,"0")).join("");
  }
  // Export the same pure composition/projection for checks and the no-Canvas SVG producer.
  if (typeof module !== "undefined" && module.exports) module.exports = {clipSegment,clipPolygon,mix,poses,topicPaths,pageStops,initialPoses,nodes,edges,segments,worldFor,projectedWorld,blendColor};
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
  const initial=initialPoses[page]||"overview",world=worldFor(page);
  let current=poses[initial], animation=null, writingAnchor=null;
  let colors={cyan:"#075d7b",amber:"#895710",paper:"#f8f7f3"};
  const pose = id => narrow.matches ? mix(poses[initial],poses[id],.66) : poses[id];
  const pathPose = () => { const [a,b]=topicPaths[focus]; return mix(pose(a),pose(b),localProgress); };
  function visible(el) { return !el.hidden && el.getClientRects().length>0; }
  function measure() {
    width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);
    ratio=Math.min(1.5,window.devicePixelRatio||1);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
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
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    for(const shape of projectedWorld(world,current,width,height)) {
      const [from,...rest]=shape.points,to=rest[0];
      ctx.beginPath();ctx.moveTo(...from);for(const p of rest)ctx.lineTo(...p);
      ctx.lineWidth=shape.lineWidth;ctx.strokeStyle=colors[shape.color];
      if(shape.kind==="face") {
        ctx.closePath();ctx.fillStyle=blendColor(colors.paper,colors[shape.color],shape.tint);
        ctx.globalAlpha=shape.alpha;ctx.fill();ctx.globalAlpha=shape.edgeAlpha;ctx.stroke();
      } else {ctx.globalAlpha=shape.alpha;ctx.stroke();}
      if(shape.arrow) {
        const dx=to[0]-from[0],dy=to[1]-from[1],length=Math.hypot(dx,dy);
        if(length<10)continue;
        const size=5,ux=dx/length,uy=dy/length;
        ctx.beginPath();ctx.moveTo(to[0]-ux*size-uy*size*.55,to[1]-uy*size+ux*size*.55);ctx.lineTo(...to);ctx.lineTo(to[0]-ux*size+uy*size*.55,to[1]-uy*size-ux*size*.55);ctx.stroke();
      }
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
