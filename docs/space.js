/* Thematic faceted still lifes. Native scroll/topic choices move the camera; never the pointer. */
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
  const poses = {
    overview:{position:[12,7,17],target:[0,.4,-.5]},
    researchOverview:{position:[13,9,15],target:[-.5,1.4,-1.5]},
    control:{position:[-12,4,11],target:[3,.6,0]},
    help:{position:[-8,11,14],target:[3,.5,-.5]},
    feedback:{position:[9,2.2,12],target:[3,2,1]},
    context:{position:[-14,6,12],target:[3,.5,-1]},
    closing:{position:[4,10,19],target:[1,.5,-1]},
    // Finite side views of the authored subjects.
    verification:{position:[-8,10,11],target:[4,0,0]},
    verificationEnd:{position:[11,4,10],target:[4,0,0]},
    controller:{position:[-10,3,12],target:[3,1,0]},
    controllerEnd:{position:[12,9,11],target:[3,1,0]},
    library:{position:[12,7,16],target:[0,.2,0]},
    libraryMid:{position:[-12,8,16],target:[3,1,0]},
    libraryEnd:{position:[-8,2,17],target:[3,-.4,0]},
    signal:{position:[12,5,16],target:[1,.5,-1]},
    signalEnd:{position:[-12,9,12],target:[2,-.5,0]},
    network:{position:[12,7,17],target:[0,.5,-1]},
    networkEnd:{position:[-11,4,13],target:[4,0,-.4]}
  };
  const topicPaths = { all:["library","libraryMid","libraryEnd"], strategy:["library","help","closing"], systems:["control","help","feedback"], delivery:["verification","researchOverview","verificationEnd"], leadership:["controller","help","controllerEnd"] };
  const pageStops = {
    index:{hero:"overview",research:"control",help:"help",writing:"feedback",acknowledgements:"context",about:"closing",contact:"closing"},
    research:{intro:"researchOverview",research:"verification",lenses:"control",topics:"feedback",acknowledgements:"context"},
    talks:{intro:"signal",talks:"signalEnd",continue:"closing"},
    credits:{intro:"network",preferences:"networkEnd",contact:"closing"}
  };
  const initialPoses={index:"overview",research:"researchOverview",writing:"library",talks:"signal",credits:"network"};
  // A small sculptural vocabulary, arranged as a different still life per route.
  // Geometry is built once. All faces, contours and engraving use one camera/light.
  function worldFor(page,compact=false) {
    const faces=[],lines=[],objects=[];
    const rotate=(p,r)=>{
      let [x,y,z]=p,[a,b,c]=r;
      [y,z]=[y*Math.cos(a)-z*Math.sin(a),y*Math.sin(a)+z*Math.cos(a)];
      [x,z]=[x*Math.cos(b)+z*Math.sin(b),-x*Math.sin(b)+z*Math.cos(b)];
      return [x*Math.cos(c)-y*Math.sin(c),x*Math.sin(c)+y*Math.cos(c),z];
    };
    function object(name,center,rotation,scale,band,build) {
      const firstFace=faces.length,firstLine=lines.length;
      const point=p=>add(center,rotate(p.map(v=>v*scale),rotation));
      const face=(points,color="cyan",tone=.2,edge=.36)=>faces.push({points:points.map(point),color,band,opacity:1,tone,edgeAlpha:edge,object:name});
      const line=(a,b,color="cyan",alpha=.58,width=1)=>lines.push({a:point(a),b:point(b),color,band,opacity:alpha,width,object:name});
      const path=(points,color="cyan",alpha=.58,width=1)=>{for(let i=1;i<points.length;i++)line(points[i-1],points[i],color,alpha,width);};
      const poly=(points,depth,color="cyan",tone=.24)=>{
        const front=points.map(([x,y])=>[x,y,depth/2]),back=points.map(([x,y])=>[x,y,-depth/2]);
        face(back.slice().reverse(),color,tone*.7);face(front,color,tone);
        for(let i=0;i<points.length;i++){const j=(i+1)%points.length;face([front[i],back[i],back[j],front[j]],color,tone*1.7);}
      };
      const box=(c,size,color="cyan",tone=.2)=>{
        const corners=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>add(c,p.map((v,i)=>v*size[i]/2)));
        for(const ix of[[0,3,2,1],[4,5,6,7],[0,1,5,4],[2,3,7,6],[1,2,6,5],[3,0,4,7]])face(ix.map(i=>corners[i]),color,tone);
      };
      const ring=(center,radius,tube,rotation=[0,0,0],color="cyan",arc=Math.PI*2)=>{
        const n=compact?24:40,sides=4;
        const at=(i,j)=>add(center,rotate([(radius+tube*Math.cos(j/sides*2*Math.PI))*Math.cos(i/n*arc),(radius+tube*Math.cos(j/sides*2*Math.PI))*Math.sin(i/n*arc),tube*Math.sin(j/sides*2*Math.PI)],rotation));
        for(let i=0;i<n;i++)for(let j=0;j<sides;j++)face([at(i,j),at(i+1,j),at(i+1,j+1),at(i,j+1)],color,.29,.12);
        path(Array.from({length:n+1},(_,i)=>at(i,0)),color,.66);
        path(Array.from({length:n+1},(_,i)=>at(i,2)),color,.52);
      };
      const ball=(center,r,color="amber")=>{
        const vertices=[[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]].map(p=>add(p,center));
        for(const ix of[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]])face(ix.map(i=>vertices[i]),color,.32,.3);
      };
      const paper=(center,w,h,bend=.25,tilt=0,color="cyan",text=true)=>{
        const at=(x,y)=>add(center,rotate([x,y,bend*Math.sin((y/h+.5)*Math.PI)+.08*x*x],[0,tilt,0]));
        const n=compact?5:8;
        for(let i=0;i<n;i++){const y=-h/2+h*i/n,Y=y+h/n;face([at(-w/2,y),at(w/2,y),at(w/2,Y),at(-w/2,Y)],color,.055,0);}
        path([at(-w/2,-h/2),...Array.from({length:n+1},(_,i)=>at(-w/2,-h/2+h*i/n)),at(w/2,h/2),...Array.from({length:n+1},(_,i)=>at(w/2,h/2-h*i/n)),at(-w/2,-h/2)],color,.55);
        if(text)for(let row=0;row<6;row++){const y=h*.28-row*h*.095;line(add(at(-w*.32,y),[0,0,.015]),add(at(w*(row===5?.03:.29),y),[0,0,.015]),color,row===0?.48:.2,row===0?1.5:.8);}
      };
      build({face,line,path,poly,box,ring,ball,paper});
      objects.push({name,band,firstFace,faceCount:faces.length-firstFace,firstLine,lineCount:lines.length-firstLine});
    }
    const openBook=({face,line,path})=>{
      const n=compact?6:10;
      for(const sign of[-1,1]) {
        const at=(t,y,leaf)=>[sign*t*2.65,y,.58*t+.3*Math.sin(t*Math.PI)-leaf*.062];
        // Boards, page block and individual curled leaves; the central gutter is real depth.
        const board=(t,y)=>[sign*t*2.83,y,.58*t+.3*Math.sin(t*Math.PI)-.34];
        for(let i=0;i<n;i++) {
          face([board(i/n,-2.2),board((i+1)/n,-2.2),board((i+1)/n,2.2),board(i/n,2.2)],"cyan",.31,0);
          face([board(i/n,-2.2),board((i+1)/n,-2.2),add(board((i+1)/n,-2.2),[0,0,-.08]),add(board(i/n,-2.2),[0,0,-.08])],"cyan",.48,.15);
        }
        path(Array.from({length:n+1},(_,i)=>board(i/n,2.2)),"cyan",.6);
        path(Array.from({length:n+1},(_,i)=>board(i/n,-2.2)),"cyan",.6);
        for(const leaf of[4,3,2,1,0]) {
          const edge=Array.from({length:n+1},(_,i)=>at(i/n,-2.05,leaf));path(edge,"cyan",.3,.8);
          path(Array.from({length:n+1},(_,i)=>at(i/n,2.05,leaf)),"cyan",.28,.8);
          line(at(1,-2.05,leaf),at(1,2.05,leaf),"cyan",.34,.8);
        }
        for(let i=0;i<n;i++)face([at(i/n,-2.05,0),at((i+1)/n,-2.05,0),at((i+1)/n,2.05,0),at(i/n,2.05,0)],"cyan",.04,0);
        for(let row=0;row<9;row++) {
          const y=1.45-row*.29,end=row===8?.7:.88;
          path(Array.from({length:7},(_,i)=>add(at(.14+(end-.14)*i/6,y,0),[0,0,.018])),"cyan",row===0?.46:.23,row===0?1.8:.8);
        }
        if(sign===1)face([at(.76,2.12,-.25),at(.85,2.12,-.25),at(.85,-2.55,-.25),at(.805,-2.38,-.25),at(.76,-2.55,-.25)],"amber",.43,.55);
      }
      line([0,-2.18,-.2],[0,2.18,-.2],"amber",.65,1.4);
    };
    const letters=({poly,box})=>{
      // Separate solid strokes leave the A's counter genuinely open in 3D.
      poly([[-1.25,-1.65],[-.76,-1.65],[.08,1.17],[-.1,1.8],[-.43,1.8]],.3,"amber",.37);
      poly([[.72,-1.65],[1.23,-1.65],[.14,1.8],[-.34,1.8]],.3,"amber",.37);
      box([-.03,-.48,0],[1.28,.25,.3],"amber",.42);
      box([-1.0,-1.64,0],[.9,.18,.4],"amber",.37);box([.97,-1.64,0],[.9,.18,.4],"amber",.37);
    };
    const sheets=({paper})=>{
      paper([-.24,-.22,-.5],2.5,3.25,.35,-.16,"cyan",false);
      paper([.15,0,-.22],2.5,3.25,.42,.06,"cyan",false);
      paper([.45,.24,.12],2.5,3.25,.6,.28,"cyan");
    };
    const compass=({ring,face,line,ball})=>{
      ring([0,0,0],2.35,.09);ring([0,0,-.22],2.12,.035);
      for(let i=0;i<32;i++){const a=i*Math.PI/16,r=i%4?2.13:1.93;line([r*Math.sin(a),r*Math.cos(a),.03],[2.26*Math.sin(a),2.26*Math.cos(a),.03],"cyan",i%4?.27:.65);}
      for(let i=0;i<4;i++){
        const a=i*Math.PI/2,tip=[Math.sin(a)*1.86,Math.cos(a)*1.86,.04],left=[Math.sin(a-.8)*.47,Math.cos(a-.8)*.47,.04],right=[Math.sin(a+.8)*.47,Math.cos(a+.8)*.47,.04];
        face([left,tip,[0,0,.38]],i===0?"amber":"cyan",.26);face([tip,right,[0,0,.38]],i===0?"amber":"cyan",.48);
      }
      ball([0,0,.42],.13,"amber");
    };
    const steps=({box,line})=>{
      for(let i=0;i<7;i++){const y=-2.6+i*.62,x=-2.2+i*.72,z=Math.sin(i*.45)*.6;box([x,y,z],[1.25,.2,1.9],i===6?"amber":"cyan",.2);line([x-.58,y+.12,z+.91],[x+.58,y+.12,z+.91],"amber",.42);}
    };
    const arch=({box,face,line})=>{
      box([-1.5,-1.15,0],[.4,3.5,.65],"cyan",.22);box([1.5,-1.15,0],[.4,3.5,.65],"cyan",.22);
      for(let i=0;i<14;i++){
        const a=i/14*Math.PI,b=(i+1)/14*Math.PI;
        const section=z=>[[1.7*Math.cos(a),.6+1.7*Math.sin(a),z],[1.7*Math.cos(b),.6+1.7*Math.sin(b),z],[1.3*Math.cos(b),.6+1.3*Math.sin(b),z],[1.3*Math.cos(a),.6+1.3*Math.sin(a),z]];
        face(section(.325),i===6?"amber":"cyan",.27);face(section(-.325).reverse(),"cyan",.18);
        face([section(.325)[0],section(-.325)[0],section(-.325)[1],section(.325)[1]],"cyan",.33);
        face([section(.325)[2],section(-.325)[2],section(-.325)[3],section(.325)[3]],"cyan",.3);
      }
      line([-1.5,-2.8,0],[1.5,-2.8,0],"amber",.35);
    };
    const gyroscope=({ring,line,ball})=>{
      ring([0,0,0],2.75,.075,[0,0,0]);ring([0,0,0],2.35,.085,[.72,.4,.22]);ring([0,0,0],1.85,.08,[-.63,.9,0],"amber");
      line([0,-3.1,0],[0,3.1,0],"cyan",.52);ball([0,0,0],.54,"amber");
      for(const y of[-2.75,2.75])ball([0,y,0],.12,"cyan");
    };
    const hypotheses=({line,ball})=>{
      function grow(start,dir,length,depth) {
        const end=add(start,normalize(dir).map(x=>x*length));line(start,end,depth%2?"cyan":"amber",.56,depth?1.35:.85);
        if(!depth){ball(end,.085,"cyan");return;}
        for(const sign of[-1,1])grow(end,[dir[0]*.5+sign*.85,dir[1]*.7+.25,dir[2]+sign*.35],length*.69,depth-1);
      }
      grow([0,-2.8,0],[0,1,0],2,compact?3:4);
    };
    const gates=({box,line})=>{
      for(let layer=0;layer<4;layer++){
        const z=layer*1.25-1.9,scale=layer===2?.78:1,c=layer===2?"amber":"cyan",h=2.1*scale,w=1.65*scale;
        box([-w,0,z],[.2,h*2,.2],c,.28);box([w,0,z],[.2,h*2,.2],c,.28);box([0,h,z],[2*w+.2,.2,.2],c,.28);box([0,-h,z],[2*w+.2,.2,.2],c,.28);
      }
      for(const y of[-.65,0,.65])line([0,y,-2.7],[0,y,2.7],"amber",.42);
    };
    const microphone=({face,path,line,box,ring})=>{
      // A capsule grille inside a separate yoke; not an audio visualization.
      const n=compact?12:20,levels=[[-1.25,.28],[-1.1,.58],[-.85,.72],[.85,.72],[1.1,.58],[1.25,.28]];
      const at=(level,j)=>[levels[level][1]*Math.cos(j/n*Math.PI*2),levels[level][0]+.9,levels[level][1]*Math.sin(j/n*Math.PI*2)];
      for(let k=0;k<levels.length-1;k++)for(let j=0;j<n;j++)face([at(k,j),at(k,j+1),at(k+1,j+1),at(k+1,j)],"cyan",.26,.1);
      for(let j=0;j<n;j++)path(levels.map((_,k)=>at(k,j)),"cyan",.37,.85);
      for(let y=-.55;y<=1.65;y+=.22){const r=y<-.18?.57:y>1.68?.57:.735;path(Array.from({length:n+1},(_,j)=>[r*Math.cos(j/n*2*Math.PI),y,r*Math.sin(j/n*2*Math.PI)]),"cyan",.4,.8);}
      box([-1.04,-.25,0],[.18,1.8,.25],"amber",.37);box([1.04,-.25,0],[.18,1.8,.25],"amber",.37);box([0,-1.12,0],[2.2,.2,.25],"amber",.36);
      box([0,-2,0],[.19,1.7,.19],"cyan",.32);ring([0,-2.87,0],1.05,.12,[Math.PI/2,0,0]);line([0,-2.8,0],[0,-1.15,0],"cyan",.6);
    };
    const soundwaves=({face,path})=>{
      for(let k=0;k<4;k++) {
        const r=1.15+k*.7,z=-k*.35,n=compact?12:20;
        const at=(i,inner)=>{const a=-.92+i/n*1.84;return [Math.cos(a)*(r-inner),Math.sin(a)*(r-inner),z];};
        for(let i=0;i<n;i++)face([at(i,0),at(i+1,0),at(i+1,.1),at(i,.1)],k===1?"amber":"cyan",.28,.05);
        path(Array.from({length:n+1},(_,i)=>at(i,0)),k===1?"amber":"cyan",.55);
      }
    };
    const screen=({box,face,line})=>{
      box([0,.35,0],[4.15,2.65,.18],"cyan",.12);
      for(const x of[-2.13,2.13])box([x,.35,.06],[.15,2.88,.24],"cyan",.3);
      for(const y of[-1.05,1.76])box([0,y,.06],[4.4,.14,.24],"cyan",.3);
      face([[-.3,-.18,.16],[-.3,1,.16],[.72,.4,.16]],"amber",.4,.6);
      box([0,-1.85,-.1],[.16,1.5,.16],"cyan",.22);line([-1.55,-2.68,-.1],[1.55,-2.68,-.1],"cyan",.58);
    };
    const quotes=({poly})=>{
      for(const x of[-1.05,.95])poly([[x-.55,.1],[x+.45,.1],[x+.45,1.32],[x-.7,1.32],[x-.7,.2],[x-.4,-.6],[x+.1,-1.15],[x+.52,-.94],[x+.05,-.4]],.38,"amber",.33);
    };
    const links=({face,path})=>{
      function link(center,rotation,color) {
        const n=compact?28:44,outer=[],inner=[];
        for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);outer.push(add(center,rotate([c*1.55,s*.9,0],rotation)));inner.push(add(center,rotate([c*1.23,s*.57,0],rotation)));}
        for(let i=0;i<n;i++){const j=(i+1)%n,front=p=>add(p,rotate([0,0,.14],rotation)),back=p=>add(p,rotate([0,0,-.14],rotation));face([front(outer[i]),front(outer[j]),front(inner[j]),front(inner[i])],color,.26,.1);face([back(outer[i]),back(outer[j]),front(outer[j]),front(outer[i])],color,.39,.07);face([back(inner[i]),back(inner[j]),front(inner[j]),front(inner[i])],color,.39,.07);}
        path([...outer,outer[0]].map(p=>add(p,rotate([0,0,.14],rotation))),color,.6);path([...inner,inner[0]].map(p=>add(p,rotate([0,0,.14],rotation))),color,.56);
      }
      link([-.95,.3,.1],[0,0,-.3],"cyan");link([.95,-.3,0],[-.65,-.25,.15],"amber");
    };
    const sourceTabs=({paper,box,face})=>{
      paper([0,0,0],2.45,3.05,.07,0,"cyan");
      face([[.45,1.57,.05],[1,1.57,.05],[1,.62,.1],[.72,.85,.1],[.45,.62,.1]],"amber",.45);
      box([-1.25,0,-.14],[.09,3.3,.12],"cyan",.25);
    };
    const distant=(name,fn)=>object(name,[-5.4,2.2,-7],[.12,-.22,.25],.64,"distant",fn);
    if(page==="writing") {
      object("open-book",[3.3,.35,.1],[-.25,.38,-.19],1.07,"middle",openBook);
      object("loose-pages",[5.7,3.7,-4.1],[.1,.18,.32],.86,"middle",sheets);
      object("letterpress-A",[6.8,-2.4,3.9],[.12,.28,-.23],.8,"near",letters);
      distant("distant-pages",sheets);
    } else if(page==="talks") {
      object("microphone",[2.25,.5,.2],[.08,-.18,-.22],1.52,"middle",microphone);
      object("sound-waves",[4.4,.6,-2.4],[.1,-.4,.1],1.25,"middle",soundwaves);
      object("presentation-screen",[6.6,-3.1,3.5],[.1,.2,.14],.86,"near",screen);
      distant("distant-wavefronts",soundwaves);
    } else if(page==="credits") {
      object("quotation-marks",[5.7,2.2,-1.2],[.08,.36,-.1],1.32,"middle",quotes);
      object("source-links",[6.5,-2.4,2.7],[.15,.25,-.24],1.04,"near",links);
      object("source-card",[-3.8,-1.3,-3.5],[.22,.18,-.22],.92,"middle",sourceTabs);
      distant("distant-source-tabs",sourceTabs);
    } else if(page==="research") {
      object("gyroscope",[3.4,1.1,-.9],[.05,-.3,.1],1.08,"middle",gyroscope);
      object("verification-gates",[6.3,-2.8,3.5],[.15,-.5,-.08],.97,"near",gates);
      object("hypothesis-tree",[5.3,3,-4.1],[0,-.2,-.25],.87,"middle",hypotheses);
      distant("distant-hypotheses",hypotheses);
    } else {
      object("compass",[5.2,4.0,-5.4],[.08,.3,-.3],1.04,"middle",compass);
      object("architectural-arch",[6.5,-3.6,4.2],[.1,-.36,-.06],1.11,"near",arch);
      object("ascending-steps",[-4.7,-.8,1],[.13,-.32,-.05],1.03,"middle",steps);
      distant("distant-arch",arch);
    }
    const light=normalize([-.55,.85,1]);
    for(const f of faces) {
      const normal=normalize(cross(sub(f.points[1],f.points[0]),sub(f.points[2],f.points[0])));
      const shade=.65+.5*Math.abs(dot(normal,light));
      f.tint=Math.min(.63,f.tone*shade);
      // Paper catches neutral light in both themes; metal keeps its cyan/bronze tint.
      if(f.tone<.1){f.fillColor="sheet";f.tint=.6+shade*.1;}
      if(f.band==="distant"){f.tint*=.4;f.edgeAlpha*=.27;}
    }
    return {faces,lines,objects};
  }
  function projectedWorld(world,current,width,height) {
    const forward=normalize(sub(current.target,current.position)),right=normalize(cross(forward,[0,1,0])),up=cross(right,forward);
    const camera=point=>{const delta=sub(point,current.position);return [dot(delta,right),dot(delta,up),dot(delta,forward)];};
    const focal=(width<=640?Math.min(height,width*1.15):height)/(2*Math.tan(Math.PI/8));
    const project=p=>[width*(width<=640?.42:.66)+p[0]*focal/p[2],height*.48-p[1]*focal/p[2]];
    const shapes=[];
    for(const f of world.faces) {
      const points=clipPolygon(f.points.map(camera));
      if(points.length<3)continue;
      const depth=points.reduce((v,p)=>v+p[2],0)/points.length;
      shapes.push({kind:"face",points:points.map(project),depth,color:f.color,band:f.band,object:f.object,
        tint:f.tint,fillColor:f.fillColor,alpha:f.opacity??.82,
        edgeAlpha:f.edgeAlpha??(f.band==="near"?.55:.46),lineWidth:f.band==="near"?1.4:1});
    }
    for(const s of world.lines) {
      const clipped=clipSegment(camera(s.a),camera(s.b));if(!clipped)continue;
      shapes.push({kind:"line",points:clipped.map(project),depth:(clipped[0][2]+clipped[1][2])/2,object:s.object,
        color:s.color,alpha:(s.opacity??.65)*(s.band==="distant"?.3:1),lineWidth:s.width??(s.band==="distant"?.7:1.2),arrow:s.arrow});
    }
    // Faces AND edges participate in one painter order; near facets occlude distant lines.
    return shapes.sort((a,b)=>b.depth-a.depth);
  }
  function blendColor(a,b,t) {
    const rgb=hex=>hex.replace("#","").match(/.{2}/g).map(v=>parseInt(v,16));
    return "#"+lerp(rgb(a),rgb(b),t).map(v=>Math.round(v).toString(16).padStart(2,"0")).join("");
  }
  // Export the same pure composition/projection for checks and the no-Canvas SVG producer.
  if (typeof module !== "undefined" && module.exports) module.exports = {clipSegment,clipPolygon,mix,journeyPose,poses,topicPaths,pageStops,initialPoses,worldFor,projectedWorld,blendColor};
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
    colors={cyan:css.getPropertyValue("--accent").trim(),amber:css.getPropertyValue("--systems").trim(),paper:css.getPropertyValue("--paper").trim(),sheet:(css.getPropertyValue("--scene-sheet")||"#fffefa").trim()};
    fillColors.clear();
    for(const f of world.faces)fillColors.set(`${f.fillColor||f.color}:${f.tint}`,blendColor(colors.paper,colors[f.fillColor||f.color],f.tint));
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
        ctx.closePath();ctx.fillStyle=fillColors.get(`${shape.fillColor||shape.color}:${shape.tint}`);
        ctx.globalAlpha=shape.alpha;ctx.fill();
        // Join adjacent paper facets without dark antialias seams.
        if(shape.edgeAlpha===0){ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;}else ctx.globalAlpha=shape.edgeAlpha;
        ctx.stroke();
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
