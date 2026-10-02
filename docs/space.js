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
  const spline=(a,b,c,d,t)=>b.map((v,i)=>.5*((2*v)+(-a[i]+c[i])*t+(2*a[i]-5*v+4*c[i]-d[i])*t*t+(-a[i]+3*v-3*c[i]+d[i])*t*t*t));
  // Interpolate an orbit in cylindrical coordinates. A straight chord would cut
  // through the sculpture; this path keeps its distance while changing viewpoint.
  function journeyPose(ids,progress,mobile=false) {
    const path=ids.map(id=>mobile?mix(poses[ids[0]],poses[id],.72):poses[id]);
    return curveThrough(path,progress);
  }
  function curveThrough(path,progress) {
    if(path.length===1)return path[0];
    const p=clamp(progress)*(path.length-1),i=Math.min(path.length-2,Math.floor(p)),t=p-i;
    if(t===0)return path[i];
    if(t===1)return path[i+1];
    const polar=[];
    for(const pose of path) {
      const [x,y,z]=pose.position;let angle=Math.atan2(x,z);
      if(polar.length){const last=polar.at(-1)[0];while(angle-last>Math.PI)angle-=2*Math.PI;while(angle-last<-Math.PI)angle+=2*Math.PI;}
      polar.push([angle,Math.hypot(x,z),y]);
    }
    const indices=[Math.max(0,i-1),i,i+1,Math.min(path.length-1,i+2)];
    const [angle,radius,y]=spline(...indices.map(j=>polar[j]),t),r=Math.max(11,radius);
    return {position:[Math.sin(angle)*r,y,Math.cos(angle)*r],target:spline(...indices.map(j=>path[j].target),t)};
  }
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
    overview:{position:[12,7,17],target:[0,.4,-.5]},
    researchOverview:{position:[13,9,15],target:[-.5,1.4,-1.5]},
    control:{position:[-12,4,11],target:[-1,.6,0]},
    help:{position:[-8,11,14],target:[.7,.5,-.5]},
    feedback:{position:[9,2.2,12],target:[1,-.5,1]},
    context:{position:[-14,6,12],target:[-1,.5,-1]},
    closing:{position:[4,10,19],target:[.5,.5,-1]},
    // Explicit finite paths around the named nodes, rather than unresolved pose IDs.
    verification:{position:[-8,10,11],target:[2,2,-3]},
    verificationEnd:{position:[11,4,10],target:[2,2,-3]},
    controller:{position:[-10,3,12],target:[-1,1,0]},
    controllerEnd:{position:[12,9,11],target:[-1,1,0]},
    library:{position:[12,7,16],target:[0,.2,0]},
    libraryMid:{position:[-12,10,11],target:[0,1,0]},
    libraryEnd:{position:[-8,2,14],target:[1,-.4,-1]},
    signal:{position:[12,5,16],target:[1,.5,-1]},
    signalEnd:{position:[-12,9,12],target:[2,-.5,0]},
    network:{position:[12,7,17],target:[0,.5,-1]},
    networkEnd:{position:[-11,4,13],target:[.6,0,-.4]}
  };
  const topicPaths = { all:["library","libraryMid","libraryEnd"], strategy:["library","help","closing"], systems:["control","help","feedback"], delivery:["verification","researchOverview","verificationEnd"], leadership:["controller","help","controllerEnd"] };
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
  function worldFor(page,compact=false) {
    const faces=[],lines=[];
    const face=(points,color="cyan",band="middle",opacity=.82)=>faces.push({points,color,band,opacity});
    const line=(a,b,color="cyan",band="middle",arrow=false)=>lines.push({a,b,color,band,arrow});
    const path=(points,color="cyan",band="middle")=>{for(let i=1;i<points.length;i++)line(points[i-1],points[i],color,band);};
    // Sculptural, bounded recursion, not a model of research results or people.
    const rotate=(p,angle)=>[p[0]*Math.cos(angle)-p[2]*Math.sin(angle),p[1],p[0]*Math.sin(angle)+p[2]*Math.cos(angle)];
    const tetra=(center,size,depth,color="cyan",band="middle")=>{
      const corners=[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]].map(p=>add(center,p.map(v=>v*size)));
      if(depth){for(const c of corners)tetra(lerp(center,c,.5),size*.5,depth-1,color,band);return;}
      for(const ix of[[0,1,2],[0,3,1],[0,2,3],[1,3,2]])face(ix.map(i=>corners[i]),color,band,.52);
    };
    const branch=(root,dir,length,depth,color="cyan",band="middle")=>{
      const end=add(root,normalize(dir).map(v=>v*length));line(root,end,color,band);
      if(!depth)return;
      for(const sign of[-1,1])branch(end,rotate([dir[0]+sign*.45,dir[1]*.8+.24,dir[2]],sign*.7),length*.62,depth-1,color,band);
    };
    // Faceted tubular knots with negative space and cross-section ribs.
    const knot=(center,scale,color="cyan",band="middle",turns=2)=>{
      const count=compact?48:72,sides=4,points=[];
      const at=t=>[(2+.68*Math.cos(3*t))*Math.cos(turns*t),.95*Math.sin(3*t),(2+.68*Math.cos(3*t))*Math.sin(turns*t)];
      for(let i=0;i<count;i++) {
        const t=i/count*2*Math.PI,p=at(t),tangent=normalize(sub(at(t+.01),at(t-.01))),u=normalize(cross(tangent,[0,1,0])),v=cross(tangent,u);
        points.push(Array.from({length:sides},(_,j)=>add(center,add(p,add(u.map(x=>x*.16*Math.cos(j/sides*2*Math.PI)),v.map(x=>x*.16*Math.sin(j/sides*2*Math.PI)))).map(x=>x*scale))));
      }
      for(let i=0;i<count;i++)for(let j=0;j<sides;j++)face([points[i][j],points[(i+1)%count][j],points[(i+1)%count][(j+1)%sides],points[i][(j+1)%sides]],color,band,.8);
    };
    for(const x of[-9,9])branch([x,-5,-10],[x>0?-.4:.4,1,0],5,3,"cyan","distant");
    // Cropped near ornament makes parallax legible without a broad masking plane.
    tetra([9,-3,5],2.7,compact?1:2,"cyan","near");
    branch([-9,-4,4],[.5,1,.2],3.8,3,"amber","near");
    if(page==="writing") {
      // A helicoidal archive: each stratum contains smaller echoing contours.
      for(let layer=0;layer<8;layer++) {
        const y=-3+layer*.8,angle=layer*.22;
        const count=compact?20:32;
        for(let ring=0;ring<(compact?2:3);ring++) {
          const r=4-ring*.65,points=Array.from({length:count+1},(_,i)=>add(rotate([Math.cos(i/count*2*Math.PI)*r,y,Math.sin(i/count*2*Math.PI)*r*.65],angle),[0,0,-1]));
          path(points,layer===4?"amber":"cyan");
          if(!ring)for(let i=0;i<count;i++)face([points[i],points[i+1],add(points[i+1],[0,.1,0]),add(points[i],[0,.1,0])],layer===4?"amber":"cyan");
        }
      }
      tetra([0,.5,-1],1.6,2,"amber");
    } else if(page==="talks") {
      knot([0,.4,-1],1.5,"cyan","middle",1);
      for(let i=0;i<5;i++)branch([-4,-1+i*.6,-3],[1,.35,Math.sin(i)*.6],3.5,3,i===2?"amber":"cyan");
    } else if(page==="credits") {
      tetra([0,0,-1],3.3,compact?2:3,"cyan");
      branch([-4,-3,0],[.5,1,0],3.2,4,"amber");
      branch([4,-3,-3],[-.6,1,.2],3.2,4,"cyan");
    } else {
      // Loop and recursive passage stay separate; no scientific causal link.
      knot([-2,0,0],1.5,"cyan");
      tetra([4,2.2,-4],2.2,2,"amber");
      branch([4,-1,-4],[0,1,.15],2.7,4,"amber");
      if(page==="research")knot([4,2.2,-4],.8,"amber","middle",1);
    }
    const light=normalize([-.6,.8,1]);
    for(const f of faces) {
      const normal=normalize(cross(sub(f.points[1],f.points[0]),sub(f.points[2],f.points[0])));
      const shade=.5+.5*Math.abs(dot(normal,light));
      f.tint=(f.band==="near"?.16:.08)+shade*(f.band==="near"?.16:.13);
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
      const depth=points.reduce((v,p)=>v+p[2],0)/points.length;
      shapes.push({kind:"face",points:points.map(project),depth,color:f.color,band:f.band,
        tint:f.tint,alpha:f.opacity??.82,
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
  if (typeof module !== "undefined" && module.exports) module.exports = {clipSegment,clipPolygon,mix,journeyPose,poses,topicPaths,pageStops,initialPoses,nodes,edges,segments,worldFor,projectedWorld,blendColor};
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
  const initial=initialPoses[page]||"overview",world=worldFor(page,narrow.matches),fillColors=new Map();
  let current=poses[initial], animation=null, writingAnchor=null;
  let colors={cyan:"#075d7b",amber:"#895710",paper:"#f8f7f3"};
  const pose = id => narrow.matches ? mix(poses[initial],poses[id],.66) : poses[id];
  const pathPose = () => journeyPose(topicPaths[focus],localProgress,narrow.matches);
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
    fillColors.clear();
    for(const f of world.faces)fillColors.set(`${f.color}:${f.tint}`,blendColor(colors.paper,colors[f.color],f.tint));
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
    return journeyPose(stops.map(s=>s.id),(i+t)/(stops.length-1),narrow.matches);
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
    // Retarget without resetting the frame clock. Resetting start on every scroll
    // event would keep the camera at t=0 during a continuous wheel/touch gesture.
    animation={to:target,last:animation?.last??null,elapsed:0};schedule();
  }
  function draw() {
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    for(const shape of projectedWorld(world,current,width,height)) {
      const [from,...rest]=shape.points,to=rest[0];
      ctx.beginPath();ctx.moveTo(...from);for(const p of rest)ctx.lineTo(...p);
      ctx.lineWidth=shape.lineWidth;ctx.strokeStyle=colors[shape.color];
      if(shape.kind==="face") {
        ctx.closePath();ctx.fillStyle=fillColors.get(`${shape.color}:${shape.tint}`);
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
      const dt=Math.min(40,Math.max(1,time-(animation.last??time-1000/60)));
      animation.elapsed+=dt;animation.last=time;
      const done=animation.elapsed>=80;
      current=done?animation.to:curveThrough([current,animation.to],1-Math.exp(-dt/24));
      if(done)animation=null;
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
    moveTo(scrollPose());
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
