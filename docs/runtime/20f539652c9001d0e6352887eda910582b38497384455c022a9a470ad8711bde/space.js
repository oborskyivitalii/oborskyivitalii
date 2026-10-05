/* Generated from site/engine and site/scenes by tools/site/build.cjs. */
(()=>{
"use strict";
const math=(function() {
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0);
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const normalize = a => { const n = Math.hypot(...a); return n > 1e-9 ? a.map(v => v / n) : [0, 0, 1]; };
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const mix = (a, b, t) => ({ position: lerp(a.position, b.position, t), target: lerp(a.target, b.target, t) });
  const clamp = v => Math.max(0, Math.min(1, v));
  const spline=(a,b,c,d,t)=>b.map((v,i)=>.5*((2*v)+(-a[i]+c[i])*t+(2*a[i]-5*v+4*c[i]-d[i])*t*t+(-a[i]+3*v-3*c[i]+d[i])*t*t*t));
  const LOOP_MS=24000;
  const rates=[30,20,15,12,10,7.5];
  const owns=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
  const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
  // Atmospheric perspective: a continuous loss of contrast into the page's
  // background, shared by surfaces, seams and outlines; no per-face blur/filter.
  // Exactly the accepted reference slider at 70: blend visibility curves,
  // not uniform opacity and not a second fog pass.
  const depthVisibility=z=>.30*(1-.94*smooth((z-12)/88))+.70*(1-.975*smooth((z-8)/56));
  const atmosphereState=time=>{
    const phase=((time%LOOP_MS)+LOOP_MS)%LOOP_MS/LOOP_MS*Math.PI*2;
    return {x:6*Math.sin(phase),y:3*Math.cos(phase),light:.015*Math.sin(phase)};
  };
  const followCamera=(from,to,dt)=>mix(from,to,1-Math.exp(-Math.max(0,dt)/32));
  // Semantic headings set interior waypoints. The actual scroll range owns
  // both endpoints, including unmarked trailing blocks and the footer.
  function fitScrollStops(markers,end) {
    const unique=[];
    for(const marker of markers) {
      const previous=unique.at(-1);
      if(Number.isFinite(marker.y)&&(!previous||(marker.y>previous.y+.5&&marker.id!==previous.id)))unique.push({...marker});
    }
    if(end<=.5||unique.length<2)return unique.slice(0,1);
    const middle=unique.slice(1,-1).filter(marker=>marker.y>.5&&marker.y<end-.5);
    return [{...unique[0],y:0},...middle,{...unique.at(-1),y:end}];
  }
  // A short introductory segment begins at the first native scroll. The
  // remainder still follows the visible archive, including a filtered reflow.
  function writingProgress(y,{start,end},anchor=null) {
    if(y<=0)return 0;
    if(y>=end)return 1;
    const intro=start>0 ? .12 : 0;
    const ordinary=()=>y<start?intro*clamp(y/start):intro+(1-intro)*clamp((y-start)/(end-start));
    // A previous bottom/top cannot remain an interior endpoint after reflow.
    if(!anchor||anchor.y<=0||anchor.y>=end||anchor.progress<=0||anchor.progress>=1)return ordinary();
    const knots=[[0,0]];
    if(start>0&&start<anchor.y)knots.push([start,Math.min(intro,anchor.progress*start/anchor.y)]);
    knots.push([anchor.y,anchor.progress]);
    if(start>anchor.y&&start<end)knots.push([start,Math.max(intro,anchor.progress+(1-anchor.progress)*(start-anchor.y)/(end-anchor.y))]);
    knots.push([end,1]);
    for(let i=1;i<knots.length;i++) {
      const [a,p]=knots[i-1],[b,q]=knots[i];
      if(y<=b)return clamp(p+(q-p)*clamp((y-a)/(b-a)));
    }
    return 1;
  }
  const cadenceFor=(cost,compact,camera=false)=>rates.find(rate=>cost*rate<=(camera?(compact ? 0.4 : 0.55):(compact ? 0.17 : 0.38))*1000)||rates.at(-1);
  function nextDeadline(deadline,time,interval) {
    const next=(deadline??time)+interval;
    return next<=time+.5?time+interval:next;
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
  function facePlane(points) {
    // Cache Newell's plane in immutable world coordinates, including concave glyphs.
    let x=0,y=0,z=0;
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length];
      x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1]);
    }
    return [x,y,z,x*points[0][0]+y*points[0][1]+z*points[0][2]];
  }
  return {add,sub,dot,cross,normalize,lerp,mix,clamp,spline,LOOP_MS,rates,owns,smooth,depthVisibility,atmosphereState,followCamera,fitScrollStops,writingProgress,cadenceFor,nextDeadline,clipSegment,clipPolygon,facePlane};
})();
const definitions={
  "poses": {
    "overview": {
      "position": [
        6,
        4,
        24
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "researchOverview": {
      "position": [
        5,
        4,
        23
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "control": {
      "position": [
        -1,
        1,
        3
      ],
      "target": [
        -2,
        1,
        -25
      ]
    },
    "help": {
      "position": [
        2,
        -1,
        -14
      ],
      "target": [
        -2,
        1,
        -33
      ]
    },
    "feedback": {
      "position": [
        -1,
        -2,
        -32
      ],
      "target": [
        2,
        -1,
        -55
      ]
    },
    "context": {
      "position": [
        3,
        1,
        -45
      ],
      "target": [
        1,
        0,
        -69
      ]
    },
    "closing": {
      "position": [
        -2,
        2,
        -64
      ],
      "target": [
        0,
        0,
        -82
      ]
    },
    "verification": {
      "position": [
        2,
        2,
        4
      ],
      "target": [
        -2,
        1,
        -26
      ]
    },
    "verificationEnd": {
      "position": [
        -1,
        2,
        -60
      ],
      "target": [
        0,
        0,
        -80
      ]
    },
    "controller": {
      "position": [
        4,
        2,
        22
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "controllerEnd": {
      "position": [
        1,
        -2,
        -63
      ],
      "target": [
        0,
        0,
        -81
      ]
    },
    "library": {
      "position": [
        5,
        3,
        24
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "libraryMid": {
      "position": [
        -1,
        1,
        -18
      ],
      "target": [
        -2,
        1,
        -35
      ]
    },
    "libraryEnd": {
      "position": [
        2,
        -1,
        -63
      ],
      "target": [
        0,
        0,
        -81
      ]
    },
    "signal": {
      "position": [
        5,
        3,
        24
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "signalEnd": {
      "position": [
        -1,
        1,
        -28
      ],
      "target": [
        2,
        -1,
        -55
      ]
    },
    "network": {
      "position": [
        5,
        4,
        24
      ],
      "target": [
        0,
        0,
        -5
      ]
    },
    "networkEnd": {
      "position": [
        1,
        -1,
        -30
      ],
      "target": [
        2,
        -1,
        -54
      ]
    }
  },
  "topicPaths": {
    "all": [
      "library",
      "control",
      "libraryMid",
      "feedback",
      "libraryEnd"
    ],
    "strategy": [
      "library",
      "help",
      "closing"
    ],
    "systems": [
      "researchOverview",
      "control",
      "feedback",
      "closing"
    ],
    "delivery": [
      "library",
      "verification",
      "libraryMid",
      "verificationEnd"
    ],
    "leadership": [
      "controller",
      "help",
      "controllerEnd"
    ]
  },
  "roomSpacing": 128,
  "pageStops": {
    "index": {
      "hero": "overview",
      "help": "control",
      "research": "help",
      "writing": "feedback",
      "acknowledgements": "context",
      "about": "closing",
      "contact": "closing"
    },
    "research": {
      "intro": "researchOverview",
      "research": "verification",
      "lenses": "help",
      "topics": "feedback",
      "acknowledgements": "closing"
    },
    "talks": {
      "intro": "signal",
      "talks": "signalEnd",
      "continue": "closing"
    },
    "credits": {
      "intro": "network",
      "preferences": "networkEnd",
      "contact": "closing"
    }
  },
  "initialPoses": {
    "index": "overview",
    "research": "researchOverview",
    "writing": "library",
    "talks": "signal",
    "credits": "network"
  },
  "routeOrder": [
    "index",
    "research",
    "writing",
    "talks",
    "credits"
  ]
};
const world=(function(math) {
  const {add,sub,dot,cross,normalize,facePlane}=math;
  // Finite symbol/detail templates are shared by every room. No route models
  // or browser objects live here; the vocabulary bounds this immutable cache.
  const templates=new Map();
  // Finite recursive grammars use modeled symbols as their terminal geometry.
  // Immutable geometry is built once; every animated pose is evaluated from it.
  function worldFor(page,compact=false) {
    const faces=[],lines=[],objects=[];
    const rotate=(p,r)=>{
      let [x,y,z]=p,[a,b,c]=r;
      [y,z]=[y*Math.cos(a)-z*Math.sin(a),y*Math.sin(a)+z*Math.cos(a)];
      [x,z]=[x*Math.cos(b)+z*Math.sin(b),-x*Math.sin(b)+z*Math.cos(b)];
      return [x*Math.cos(c)-y*Math.sin(c),x*Math.sin(c)+y*Math.cos(c),z];
    };
    let detail=0,metadata={};
    function object(name,center,rotation,scale,band,build) {
      const firstFace=faces.length,firstLine=lines.length;
      const key=Number(compact)+":"+metadata.symbol+":"+detail;
      if(templates.has(key)){instance(templates.get(key));return;}
      // Build each symbol/detail vocabulary once in local coordinates. Every
      // repetition transforms its shared vertices once, not once per facet.
      const point=p=>p;
      const face=(points,color="cyan",tone=.2,edge=.36,closed=false)=>faces.push({points:points.map(point),color,band,opacity:1,tone,edgeAlpha:edge,object:name,...(compact&&closed?{oneSided:true}:{})});
      const line=(a,b,color="cyan",alpha=.58,width=1)=>lines.push({a:point(a),b:point(b),color,band,opacity:alpha,width,object:name});
      const path=(points,color="cyan",alpha=.58,width=1)=>{for(let i=1;i<points.length;i++)if(!compact||!points[i].every((v,j)=>v===points[i-1][j]))line(points[i-1],points[i],color,alpha,width);};
      const poly=(points,depth,color="cyan",tone=.24)=>{
        if(compact&&points.reduce((sum,p,i)=>sum+p[0]*points[(i+1)%points.length][1]-points[(i+1)%points.length][0]*p[1],0)<0)points=points.slice().reverse();
        const front=points.map(([x,y])=>[x,y,depth/2]),back=points.map(([x,y])=>[x,y,-depth/2]);
        face(back.slice().reverse(),color,tone*.7,.36,true);face(front,color,tone,.36,true);
        for(let i=0;i<points.length;i++){const j=(i+1)%points.length;face([front[i],back[i],back[j],front[j]],color,tone*1.7,.36,true);}
      };
      const box=(c,size,color="cyan",tone=.2)=>{
        const corners=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>add(c,p.map((v,i)=>v*size[i]/2)));
        for(const ix of[[0,3,2,1],[4,5,6,7],[0,1,5,4],[2,3,7,6],[1,2,6,5],[3,0,4,7]])face(ix.map(i=>corners[i]),color,tone,.36,true);
      };
      const ring=(center,radius,tube,rotation=[0,0,0],color="cyan",arc=Math.PI*2)=>{
        const n=compact?(detail?4:8):detail?8:20,sides=3;
        const at=(i,j)=>add(center,rotate([(radius+tube*Math.cos(j/sides*2*Math.PI))*Math.cos(i/n*arc),(radius+tube*Math.cos(j/sides*2*Math.PI))*Math.sin(i/n*arc),tube*Math.sin(j/sides*2*Math.PI)],rotation));
        for(let i=0;i<n;i++)for(let j=0;j<sides;j++)face([at(i,j),at(i+1,j),at(i+1,j+1),at(i,j+1)],color,.29,.12,true);
        path(Array.from({length:n+1},(_,i)=>at(i,0)),color,.66);
        path(Array.from({length:n+1},(_,i)=>at(i,2)),color,.52);
      };
      const ball=(center,r,color="amber")=>{
        const vertices=[[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]].map(p=>add(p,center));
        for(const ix of[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]])face(ix.map(i=>vertices[i]),color,.32,.3,true);
      };
      const paper=(center,w,h,bend=.25,tilt=0,color="cyan",text=true)=>{
        const at=(x,y)=>add(center,rotate([x,y,bend*Math.sin((y/h+.5)*Math.PI)+.08*x*x],[0,tilt,0]));
        const n=compact?(detail?1:3):detail?2:5;
        for(let i=0;i<n;i++){const y=-h/2+h*i/n,Y=y+h/n;face([at(-w/2,y),at(w/2,y),at(w/2,Y),at(-w/2,Y)],color,.055,0);}
        path([at(-w/2,-h/2),...Array.from({length:n+1},(_,i)=>at(-w/2,-h/2+h*i/n)),at(w/2,h/2),...Array.from({length:n+1},(_,i)=>at(w/2,h/2-h*i/n)),at(-w/2,-h/2)],color,.55);
        if(text)for(let row=0;row<(compact&&detail?2:6);row++){const y=h*.28-row*h*.095;line(add(at(-w*.32,y),[0,0,.015]),add(at(w*(row===5? .03: .29),y),[0,0,.015]),color,row===0? .48: .2,row===0?1.5: .8);}
      };
      build({face,line,path,poly,box,ring,ball,paper});
      const template={faces:faces.splice(firstFace),lines:lines.splice(firstLine),points:[]},lookup=new Map();
      const index=p=>{const key=p.join(",");if(!lookup.has(key)){lookup.set(key,template.points.length);template.points.push(p);}return lookup.get(key);};
      for(const f of template.faces)f.indices=f.points.map(index);
      for(const line of template.lines)line.indices=[index(line.a),index(line.b)];
      template.radius=Math.max(...template.points.map(p=>Math.hypot(...p)));
      templates.set(key,template);instance(template);
      function instance(template) {
        const [a,b,c]=rotation,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cc=Math.cos(c),sc=Math.sin(c);
        const m=[cc*cb,cc*sb*sa-sc*ca,cc*sb*ca+sc*sa,sc*cb,sc*sb*sa+cc*ca,sc*sb*ca-cc*sa,-sb,cb*sa,cb*ca];
        const points=template.points.map(p=>[center[0]+scale*(m[0]*p[0]+m[1]*p[1]+m[2]*p[2]),center[1]+scale*(m[3]*p[0]+m[4]*p[1]+m[5]*p[2]),center[2]+scale*(m[6]*p[0]+m[7]*p[1]+m[8]*p[2])]);
        for(const f of template.faces)faces.push({...f,points:f.indices.map(i=>points[i]),band,object:name});
        for(const line of template.lines)lines.push({...line,a:points[line.indices[0]],b:points[line.indices[1]],band,object:name});
        objects.push({name,center,scale,band,...metadata,firstFace,faceCount:template.faces.length,firstLine,lineCount:template.lines.length,points,radius:template.radius*scale+2.3});
      }
    }
    const bookHalf=({face,line,path},sign,n,rows,segments)=>{
        const at=(t,y,leaf)=>[sign*t*2.65,y,.58*t+.3*Math.sin(t*Math.PI)-leaf*.062];
        // Boards, page block and individual curled leaves; the central gutter is real depth.
        const board=(t,y)=>[sign*t*2.83,y,.58*t+.3*Math.sin(t*Math.PI)-.34];
        for(let i=0;i<n;i++) {
          face([board(i/n,-2.2),board((i+1)/n,-2.2),board((i+1)/n,2.2),board(i/n,2.2)],"cyan",.31,0);
          face([board(i/n,-2.2),board((i+1)/n,-2.2),add(board((i+1)/n,-2.2),[0,0,-.08]),add(board(i/n,-2.2),[0,0,-.08])],"cyan",.48,.15);
        }
        path(Array.from({length:n+1},(_,i)=>board(i/n,2.2)),"cyan",.6);
        path(Array.from({length:n+1},(_,i)=>board(i/n,-2.2)),"cyan",.6);
        for(const leaf of(detail?[2,0]:[4,2,0])) {
          const edge=Array.from({length:n+1},(_,i)=>at(i/n,-2.05,leaf));path(edge,"cyan",.3,.8);
          path(Array.from({length:n+1},(_,i)=>at(i/n,2.05,leaf)),"cyan",.28,.8);
          line(at(1,-2.05,leaf),at(1,2.05,leaf),"cyan",.34,.8);
        }
        for(let i=0;i<n;i++)face([at(i/n,-2.05,0),at((i+1)/n,-2.05,0),at((i+1)/n,2.05,0),at(i/n,2.05,0)],"cyan",.04,0);
        for(let row=0;row<rows;row++) {
          const y=1.45-row*.29,end=.88;
          path(Array.from({length:segments+1},(_,i)=>add(at(.14+(end-.14)*i/segments,y,0),[0,0,.018])),"cyan",row===0? .46: .23,row===0?1.8: .8);
        }
        if(sign===1)face([at(.76,2.12,-.25),at(.85,2.12,-.25),at(.85,-2.55,-.25),at(.805,-2.38,-.25),at(.76,-2.55,-.25)],"amber",.43,.55);
    };
    const openBook=({face,line,path})=>{
      const n=compact?(detail?1:3):detail?2:5;
      const rows=compact&&detail?2:detail?3:5,segments=compact&&detail?1:3;
      for(const sign of[-1,1])bookHalf({face,line,path},sign,n,rows,segments);
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
      const marks=compact?(detail?8:16):32;
      for(let i=0;i<marks;i++){const a=i*Math.PI*2/marks,r=i%(marks/8)?2.13:1.93;line([r*Math.sin(a),r*Math.cos(a),.03],[2.26*Math.sin(a),2.26*Math.cos(a),.03],"cyan",i%(marks/8)? .27: .65);}
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
      const segments=compact?(detail?4:8):14;
      for(let i=0;i<segments;i++){
        const a=i/segments*Math.PI,b=(i+1)/segments*Math.PI;
        const section=z=>[[1.7*Math.cos(a),.6+1.7*Math.sin(a),z],[1.7*Math.cos(b),.6+1.7*Math.sin(b),z],[1.3*Math.cos(b),.6+1.3*Math.sin(b),z],[1.3*Math.cos(a),.6+1.3*Math.sin(a),z]];
        face(section(.325),i===Math.floor(segments/2)-1?"amber":"cyan",.27,.36,true);face(section(-.325).reverse(),"cyan",.18,.36,true);
        face([section(.325)[0],section(-.325)[0],section(-.325)[1],section(.325)[1]],"cyan",.33,.36,true);
        face([section(.325)[2],section(-.325)[2],section(-.325)[3],section(.325)[3]],"cyan",.3,.36,true);
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
        const end=add(start,normalize(dir).map(x=>x*length));line(start,end,depth%2?"cyan":"amber",.56,depth?1.35: .85);
        if(!depth){ball(end,.085,"cyan");return;}
        for(const sign of[-1,1])grow(end,[dir[0]*.5+sign*.85,dir[1]*.7+.25,dir[2]+sign*.35],length*.69,depth-1);
      }
      grow([0,-2.8,0],[0,1,0],2,detail?1:2);
    };
    const microphone=({face,path,line,box,ring})=>{
      // A capsule grille inside a separate yoke; not an audio visualization.
      const n=compact?(detail?4:8):detail?6:12,levels=[[-1.25,.28],[-1.1,.58],[-.85,.72],[.85,.72],[1.1,.58],[1.25,.28]];
      const at=(level,j)=>[levels[level][1]*Math.cos(j/n*Math.PI*2),levels[level][0]+.9,levels[level][1]*Math.sin(j/n*Math.PI*2)];
      for(let k=0;k<levels.length-1;k++)for(let j=0;j<n;j++){
        const panel=[at(k,j),at(k,j+1),at(k+1,j+1),at(k+1,j)];
        face(compact?panel.reverse():panel,"cyan",.26,.1,true);
      }
      for(let j=0;j<n;j++)path(levels.map((_,k)=>at(k,j)),"cyan",.37,.85);
      for(let y=-.55;y<=1.65;y+=(compact&&detail? .73:detail? .44: .22)){const r=y<-.18? .57:y>1.68? .57: .735;path(Array.from({length:n+1},(_,j)=>[r*Math.cos(j/n*2*Math.PI),y,r*Math.sin(j/n*2*Math.PI)]),"cyan",.4,.8);}
      box([-1.04,-.25,0],[.18,1.8,.25],"amber",.37);box([1.04,-.25,0],[.18,1.8,.25],"amber",.37);box([0,-1.12,0],[2.2,.2,.25],"amber",.36);
      box([0,-2,0],[.19,1.7,.19],"cyan",.32);ring([0,-2.87,0],1.05,.12,[Math.PI/2,0,0]);line([0,-2.8,0],[0,-1.15,0],"cyan",.6);
    };
    const soundwaves=({face,path})=>{
      for(let k=0;k<4;k++) {
        const r=1.15+k*.7,z=-k*.35,n=compact?(detail?3:8):detail?6:12;
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
        const n=compact?(detail?6:10):detail?8:18,outer=[],inner=[];
        for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);outer.push(add(center,rotate([c*1.55,s*.9,0],rotation)));inner.push(add(center,rotate([c*1.23,s*.57,0],rotation)));}
        for(let i=0;i<n;i++){
          const j=(i+1)%n,front=p=>add(p,rotate([0,0,.14],rotation)),back=p=>add(p,rotate([0,0,-.14],rotation));
          face([front(outer[i]),front(outer[j]),front(inner[j]),front(inner[i])],color,.26,.1,true);
          face([back(outer[i]),back(outer[j]),front(outer[j]),front(outer[i])],color,.39,.07,true);
          const innerWall=[back(inner[i]),back(inner[j]),front(inner[j]),front(inner[i])];
          face(compact?innerWall.reverse():innerWall,color,.39,.07,true);
        }
        path([...outer,outer[0]].map(p=>add(p,rotate([0,0,.14],rotation))),color,.6);path([...inner,inner[0]].map(p=>add(p,rotate([0,0,.14],rotation))),color,.56);
      }
      link([-.95,.3,.1],[0,0,-.3],"cyan");link([.95,-.3,0],[-.65,-.25,.15],"amber");
    };
    const sourceTabs=({paper,box,face})=>{
      paper([0,0,0],2.45,3.05,.07,0,"cyan");
      face([[.45,1.57,.05],[1,1.57,.05],[1,.62,.1],[.72,.85,.1],[.45,.62,.1]],"amber",.45);
      box([-1.25,0,-.14],[.09,3.3,.12],"cyan",.25);
    };
    const closedBook=({box,line})=>{
      box([0,0,0],[2.35,3.15,.5],"cyan",.045);
      for(const z of[-.32,.32])box([0,0,z],[2.55,3.35,.12],"cyan",.32);
      box([-1.22,0,0],[.2,3.35,.7],"amber",.34);
      for(const y of[-1,-.75,.8,1.05])line([-1.34,y,.36],[-1.08,y,.36],"amber",.65);
    };
    const scroll=({paper,ring})=>{
      paper([0,0,0],2.2,2.7,.24,0);
      for(const y of[-1.35,1.35])ring([0,y,.1],.34,.1,[0,Math.PI/2,0],"amber");
    };
    const bracket=({poly})=>{
      for(const sign of[-1,1])poly([[sign*.6,-1.5],[sign*1.1,-1.5],[sign*1.1,1.5],[sign*.6,1.5],[sign*.6,1.22],[sign*.84,1.22],[sign*.84,-1.22],[sign*.6,-1.22]],.22,"amber",.3);
    };
    const quill=({face,line})=>{
      face([[0,-1.8,0],[-.85,.3,.1],[-.55,1.7,.22],[.45,1.15,.22],[.66,.35,.1]],"cyan",.065,.6);
      line([0,-2,0],[-.22,1.65,.28],"amber",.75,1.5);
      for(let i=0;i<4;i++)line([-.1,-.2+i*.4,.17],[-.7,.12+i*.38,.18],"cyan",.3);
    };
    const prism=({face,line})=>{
      const a=[[-1.3,-1,0],[1.3,-1,0],[0,1.5,0]],b=a.map(p=>add(p,[0,0,-1]));
      face(a,"cyan",.12);face(b.slice().reverse(),"cyan",.2);
      for(let i=0;i<3;i++)face([a[i],b[i],b[(i+1)%3],a[(i+1)%3]],i===0?"amber":"cyan",.32);
      line([-2.2,0,.5],[2.2,0,.5],"amber",.5);
    };
    const lens=({ring,face})=>{
      ring([0,0,0],1.55,.12);ring([0,0,-.3],1.45,.06,[0,0,0],"amber");
      for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4;face([[0,0,.34],[1.4*Math.cos(a),1.4*Math.sin(a),0],[1.4*Math.cos(b),1.4*Math.sin(b),0]],"cyan",.075,0);}
    };
    const balance=({box,line,face})=>{
      box([0,-.3,0],[.14,2.8,.2],"cyan",.3);box([0,1,0],[3.5,.12,.2],"amber",.3);
      for(const x of[-1.4,1.4]){line([x,1,0],[x,-.3,0]);face([[x-.65,-.3,0],[x+.65,-.3,0],[x,-.75,.2]],"cyan",.2);}
    };
    const bridge=({box})=>{box([0,0,0],[3.8,.22,1.1],"cyan",.25);for(const x of[-1.5,1.5])box([x,-.9,0],[.22,1.8,1.1],"amber",.28);};
    const bubble=({poly})=>poly([[-1.6,-.65],[-.65,-.65],[-1.2,-1.35],[.2,-.65],[1.6,-.65],[1.6,1.2],[-1.6,1.2]],.28,"cyan",.08);
    const slide=({paper,face})=>{paper([0,0,0],3.1,2,.05,0);face([[-.35,-.4,.12],[-.35,.6,.12],[.55,.1,.12]],"amber",.4);};
    const podium=({box})=>{box([0,0,0],[1.8,2.6,.7],"cyan",.2);box([0,1.4,.2],[2.45,.2,1.3],"amber",.3);};
    const asterisk=({box})=>{box([0,0,0],[.2,2.6,.22],"amber",.34);box([0,0,0],[2.6,.2,.22],"amber",.34);box([0,0,0],[.2,.2,2.6],"cyan",.3);};
    const footnote=({box})=>{box([0,0,0],[.3,2.4,.24],"amber",.33);box([-.3,1.04,0],[.7,.24,.24],"amber",.33);box([0,-1.2,0],[1.25,.24,.24],"amber",.33);};
    const vocabulary={
      index:[["arch",arch],["stairs",steps],["bridge",bridge],["compass",compass],["book",closedBook],["lens",lens],["prism",prism],["threshold",bracket]],
      research:[["lens",lens],["prism",prism],["feedback",gyroscope],["hypotheses",hypotheses],["balance",balance],["gate",bracket],["aperture",compass],["evidence",sourceTabs]],
      writing:[["open-book",openBook],["closed-book",closedBook],["pages",sheets],["scroll",scroll],["letter-A",letters],["quill",quill],["parenthesis",bracket],["quotation",quotes]],
      talks:[["slide",slide],["speech",bubble],["wave",soundwaves],["microphone",microphone],["podium",podium],["screen",screen],["word",letters],["dialogue",quotes]],
      credits:[["source",sourceTabs],["citation",quotes],["link",links],["footnote",footnote],["reference",bracket],["asterisk",asterisk],["edition",closedBook],["excerpt",scroll]]
    };
    const words=vocabulary[page]||vocabulary.index;
    const roots=[[0,0,-5],[-2,1,-31],[2,-1,-57],[0,0,-83]];
    // Each parent repeats a smaller two/three-way spatial figure. Fixed depth,
    // fixed topology and deterministic substitutions: no per-frame growth/randomness.
    function grow(center,scale,depth,angle,root,index,parent=null) {
      const symbolIndex=depth===0?(index+root)%2:depth===1?2+(index+root)%2:4+(index+root)%4,[symbol,build]=words[symbolIndex];
      detail=depth||root>0?1:0;
      const name=`${symbol}-${root}-${objects.length}`;
      metadata={family:"thematic",symbol,depth,root,rootCenter:roots[root],parent,phase:index*.71+root*1.9};
      object(name,center,[.16*Math.sin(angle),.32*Math.cos(angle),angle-Math.PI/2],scale,root>1?"distant":depth===0?"near":"middle",build);
      if(depth===2)return;
      const branches=2,step=depth===0?1.12: .85;
      for(let j=0;j<branches;j++) {
        const a=angle+(j-(branches-1)/2)*step;
        const distance=scale*(depth===0?3.6:3.2);
        const next=add(center,[Math.cos(a)*distance,Math.sin(a)*distance,Math.sin(a*2+root)*scale*.85]);
        grow(next,scale*.43,depth+1,a,root,index*3+j+1,name);
      }
    }
    for(let root=0;root<roots.length;root++) {
      const n=7; // Macro positions and IDs survive all quality tiers.
      for(let i=0;i<n;i++) {
        let a=i/n*Math.PI*2+root*.24,r=6.5,x,y,z;
        if(page==="writing") {a=-.15*Math.PI+i/(n-1)*1.3*Math.PI;x=Math.cos(a)*r;y=Math.sin(a)*r*.87;z=Math.cos(a*2)*.7;}
        else if(page==="research") {x=Math.cos(a)*r;y=Math.sin(a)*r*(i%2? .88:1.12);z=Math.sin(a*2)*1.7;}
        else if(page==="talks") {a=-.35*Math.PI+i/(n-1)*1.7*Math.PI;x=Math.cos(a)*r*1.18;y=Math.sin(a)*r*.65;z=Math.sin(a*2)*2.6;}
        else if(page==="credits") {x=Math.cos(a)*r;y=Math.sin(a*2)*r*.57;z=Math.sin(a)*2.1;}
        else {a=-.12*Math.PI+i/(n-1)*1.24*Math.PI;x=Math.cos(a)*r;y=Math.sin(a)*r;z=Math.cos(a)*1.6;}
        grow(add(roots[root],[x,y,z]),root===0? .82: .9,0,a,root,i);
      }
    }
    sharedGeometry();
    // A common angular grammar threads every thematic room. Each branch uses
    // the same finite 1 + 2 + 4 hierarchy and clear camera corridor.
    function sharedGeometry() {
    // Replace shared terminals, keeping the same bounded 56-object hierarchy.
    const brain=({path,face,poly,box})=>{
      // Two closed lobes, a real fissure, cortical folds and a stem. The small
      // fixed mesh carries volume; the grooves carry the recognisable silhouette.
      const n=detail?5:compact?6:8;
      for(const side of [-1,1]){
        const at=(lat,i)=>{
          const a=i/n*Math.PI*2,r=1+.065*Math.cos(3*a+lat*2);
          return [side*1.02+.94*Math.cos(lat)*Math.cos(a)*r,.24+1.76*Math.sin(lat),.94*Math.cos(lat)*Math.sin(a)*r];
        };
        const rings=[-.92,0,.92].map(lat=>Array.from({length:n},(_,i)=>at(lat,i)));
        for(let i=0;i<n;i++){
          const j=(i+1)%n;
          face([[side*1.02,-1.52,0],rings[0][j],rings[0][i]],"cyan",.19,.13);
          face([[side*1.02,2,0],rings[2][i],rings[2][j]],"cyan",.19,.13);
          for(let k=0;k<2;k++)face([rings[k][i],rings[k][j],rings[k+1][j],rings[k+1][i]],"cyan",.16,.12);
        }
        for(let fold=0;fold<4;fold++)path(Array.from({length:7},(_,i)=>{
          const x=.27+i*.27,y=1.45-fold*.72+.18*Math.sin(i*1.7+fold);
          return [side*x,y,.12+.96*Math.sqrt(Math.max(.03,1-((x-1.02)/1.05)**2-((y-.24)/1.88)**2))];
        }),"amber",.88,1.45);
      }
      path([[0,1.88,.2],[-.09,1.12,.6],[.07,.5,.83],[-.07,-.15,.75],[0,-1.23,.25]],"amber",.95,1.8);
      poly([[-.62,-1.38],[-.84,-1.62],[-.62,-1.93],[0,-2.06],[.62,-1.93],[.84,-1.62],[.62,-1.38]],.65,"cyan",.23);
      box([0,-2.12,-.12],[.36,.65,.42],"amber",.32);
      for(let row=0;row<2;row++)path([[-.6,-1.58-row*.2,.35],[0,-1.74-row*.2,.37],[.6,-1.58-row*.2,.35]],"amber",.68,1.15);
    };
    const axes=({path,line})=>{
      path([[-2.15,1.8,0],[-2.15,-1.65,0],[2.2,-1.65,0]],"cyan",.85,1.5);
      path([[-2.15,-1.65,0],[-2.15,-1.65,-1.25],[2.2,-1.65,-1.25]],"cyan",.42);
      path([[-2.32,1.53,0],[-2.15,1.8,0],[-1.98,1.53,0]],"cyan",.85,1.5);
      path([[1.94,-1.48,0],[2.2,-1.65,0],[1.94,-1.82,0]],"cyan",.85,1.5);
      for(let y=-.8;y<(detail?-.7:1.6);y+=.8)line([-2.15,y,-.35],[2,y,-.35],"cyan",.22,.7);
    };
    const lineChart=h=>{
      axes(h);const points=[[-1.8,-1.05,.3],[-1.1,-.2,.3],[-.45,-.55,.3],[.25,.5,.3],[.85,.22,.3],[1.72,1.48,.3]];
      h.path(points,"amber",.98,2.3);
      for(let i=1;i<points.length;i++)h.face([points[i-1],points[i],add(points[i],[0,-.18,-.15]),add(points[i-1],[0,-.18,-.15])],"amber",.36,0);
      for(const [x,y,z]of points)h.path(detail?[[x-.09,y-.09,z+.02],[x,y+.09,z+.02],[x+.09,y-.09,z+.02]]:[[x-.09,y,z+.02],[x,y+.09,z+.02],[x+.09,y,z+.02],[x,y-.09,z+.02],[x-.09,y,z+.02]],"amber",.95,1.3);
      h.path([[-1.8,.9,-.6],[-1.1,.45,-.6],[-.45,.2,-.6],[.25,-.3,-.6],[.85,-.62,-.6],[1.72,-.83,-.6]],"cyan",.82,1.5);
    };
    const barChart=h=>{axes(h);for(const [i,height]of [1.05,2.25,1.65,3.05].entries()){
      h.box([-1.45+i*.9,-1.6+height/2,-.28],[.58,height,1.05],i%2?"amber":"cyan",.32);
      h.line([-1.74+i*.9,-1.6+height,.27],[-1.16+i*.9,-1.6+height,.27],"amber",.98,1.8);
    }};
    const scatterChart=h=>{
      axes(h);const points=[[-1.6,-.9],[-1.15,-.4],[-.7,-.8],[-.35,.2],[.25,.05],[.8,.85],[1.35,.4],[1.75,1.25]];
      points.forEach(([x,y],i)=>{
        const z=i%2?.45:-.65,r=.13;
        h.path([[x-r,y,z],[x,y+r,z],[x+r,y,z],[x,y-r,z],[x-r,y,z]],i%2?"amber":"cyan",.96,1.8);
        if(!detail)h.line([x,y,z],[x,-1.6,z],"cyan",.22,.7);
      });
      h.path([[-1.8,-1.1,.15],[1.85,1.25,.15]],"amber",.68,1.2);
    };
    // Stroke glyphs are world geometry, built once per detail tier.
    const glyphs={D:'0,0 0,6 3,6 4,5 4,1 3,0 0,0',F:'0,0 0,6 4,6|0,3 3,3',G:'4,5 3,6 1,6 0,5 0,1 1,0 4,0 4,3 2,3',H:'0,0 0,6|4,0 4,6|0,3 4,3',K:'0,0 0,6|4,6 0,3 4,0',L:'0,6 0,0 4,0',M:'0,0 0,6 2,3 4,6 4,0',O:'1,0 0,1 0,5 1,6 3,6 4,5 4,1 3,0 1,0',P:'0,0 0,6 3,6 4,5 4,4 3,3 0,3',Q:'1,0 0,1 0,5 1,6 3,6 4,5 4,1 3,0 1,0|2,2 4,-1',S:'4,5 3,6 1,6 0,5 0,4 4,2 4,1 3,0 1,0 0,1',T:'0,6 4,6|2,6 2,0',V:'0,6 2,0 4,6',X:'0,6 4,0|4,6 0,0',Z:'0,6 4,6 0,0 4,0',A:'0,0 2,6 4,0|1,2 3,2','=':'0,2 4,2|0,4 4,4','-':'0,3 4,3','/':'0,0 4,6','(':'3,6 1,5 0,3 1,1 3,0',')':'1,6 3,5 4,3 3,1 1,0','Σ':'4,6 0,6 3,3 0,0 4,0','√':'0,2 1,0 2,6 4,6','·':'1,3 2,3',d:'4,6 4,0 1,0 0,1 0,3 1,4 4,4','ᵀ':'0,8 3,8|1.5,8 1.5,5'};
    Object.assign(glyphs,{e:'0,2 4,2 4,3 3,4 1,4 0,3 0,1 1,0 4,0',i:'2,0 2,4|2,6 2,6.2',j:'3,4 3,-1 2,-2 0,-2|3,6 3,6.2',k:'0,0 0,6|4,4 0,2 4,0',p:'0,-2 0,4 3,4 4,3 4,1 3,0 0,0',z:'0,4 4,4 0,0 4,0'});
    const formula=kind=>({path,line})=>{
      // Fraction bars and genuinely raised/lowered exponents replace flattened
      // all-caps strings. A sparse rear rail gives depth without duplicate text.
      const text=(value,x,y,unit=.2,color="amber")=>{
        for(let i=0;i<value.length;i++)for(const stroke of glyphs[value[i]].split('|'))path(stroke.split(' ').map(pair=>{
          const [a,b]=pair.split(',').map(Number);return [x+(i*5+a)*unit,y+b*unit,.28];
        }),color,.97,1.8);
      };
      if(kind==='attention'){
        text('A=',-4.8,-.55,.19);text('SOFTMAX',-2.7,-.3,.13);
        text('(',1.93,-.95,.29);text('QK',2.43,.32,.18);text('T',4.0,1.02,.1);
        line([2.38,.13,.28],[4.28,.13,.28],"amber",.98,1.8);
        text('√d',2.58,-1.22,.18);text('k',4.05,-1.42,.1);
        text(')',4.38,-.95,.29);text('V',5.62,-.5,.19);
      }else if(kind==='softmax'){
        text('p',-2.6,-.25,.25);text('i',-1.5,-.65,.13);text('=',-.73,-.4,.22);
        text('e',1.1,.52,.28);text('z',2.45,1.2,.15);text('i',3.1,1.02,.09);
        line([.63,.26,.28],[3.65,.26,.28],"amber",.98,1.8);
        text('Σ',.7,-1.3,.23);text('j',1.07,-1.95,.1);text('e',2,-1.28,.25);text('z',3.16,-.7,.13);text('j',3.75,-.87,.09);
      }else{
        text('H=-',-3.85,-.5,.22);text('Σ',-.4,-.62,.26);text('i',.15,-1.2,.12);
        text('p',1.15,-.45,.22);text('i',2.12,-.85,.11);
        text('LOG',-1.1,-2.35,.2);text('(',2,-2.42,.22);text('p',2.94,-2.35,.22);text('i',3.9,-2.7,.1);text(')',4.38,-2.42,.22);
      }
      const ends=kind==='attention'?[-4.9,6.4]:[-3.9,5.3],y=kind==='entropy'?-3.1:-2.2;
      line([ends[0],y,-.55],[ends[1],y,-.55],"cyan",.55,1.2);
      if(!detail)for(const x of ends)path([[x,y+.38,-.55],[x,y,-.55],[x,y,.32],[x,y+.38,.32]],"cyan",.65,1.2);
    };
    const formulas={"attention":"A = softmax(QKᵀ/√dₖ)V","softmax":"pᵢ = exp(zᵢ)/Σⱼ exp(zⱼ)","entropy":"H = −Σᵢ pᵢ log(pᵢ)"};
    const geometry=[
      ["brain",brain],
      ["attention",formula('attention')],
      ["line-chart",lineChart],
      ["bar-chart",barChart],
      ["softmax",formula('softmax')],
      ["entropy",formula('entropy')],
      ["cube",h=>h.box([0,0,0],[2,2,2],"cyan",.23)],
      ["triangle",h=>h.poly([[-1.3,-1],[1.3,-1],[0,1.4]],.65,"amber",.28)],
      ["scatter-chart",scatterChart],
      ["octahedron",h=>h.ball([0,0,0],1.45,"cyan")],
      ["hexagon",h=>h.poly(Array.from({length:6},(_,i)=>[1.35*Math.cos(i*Math.PI/3),1.35*Math.sin(i*Math.PI/3)]),.7,"amber",.2)]
    ];
    function branch(center,scale,depth,root,index,parent=null) {
      const slot=depth===0?root*2+(index===8?1:0):index+root*3;
      const [symbol,build]=geometry[slot%geometry.length],name=`shared-${root}-${index}`;
      detail=depth?1:0;
      metadata={family:"shared",symbol,...(formulas[symbol]?{formula:formulas[symbol]}:{}),depth,root,rootCenter:roots[root],parent,phase:index*.71+root*1.9};
      const readable=symbol==='brain'||symbol.includes('chart')||Object.hasOwn(formulas,symbol);
      object(name,center,readable?[.12,-.18,.08*Math.sin(index+root)]:[.3,.45,index*.6],scale,root>1?"distant":"middle",build);
      if(depth===2)return;
      for(let j=0;j<2;j++)branch(add(center,[(j?1:-1)*scale*2.6,scale*1.7,-scale*1.4]),scale*.43,depth+1,root,index*2+j+1,name);
    }
    for(let root=0;root<roots.length;root++)for(let side=0;side<2;side++)branch(add(roots[root],[(side?1:-1)*10,side?-3:3,-9]),1.2,0,root,side?8:0);
    }
    const light=normalize([-.55,.85,1]);
    for(const f of faces)prepareFace(f,light);
    return {faces,lines,objects};
  }
  function prepareFace(f,light) {
    const normal=normalize(cross(sub(f.points[1],f.points[0]),sub(f.points[2],f.points[0])));
    const shade=.65+.5*Math.abs(dot(normal,light));
    f.tint=Math.min(.63,f.tone*shade);
    if(f.oneSided)f.plane=facePlane(f.points);
    // Paper catches neutral light in both themes; metal keeps its cyan/bronze tint.
    if(f.tone<.1){f.fillColor="sheet";f.tint=.6+shade*.1;}
  }
  return {worldFor};
})(math);
const projection=(function(math,definitions) {
  const {add,sub,dot,cross,normalize,lerp,clamp,spline,LOOP_MS,smooth,depthVisibility,clipSegment,clipPolygon}=math;
  const {poses,routeOrder,roomSpacing}=definitions;
  // Authored spline waypoints pass through the open centres of successive structures.
  function journeyPose(ids,progress) {
    const path=ids.map(id=>poses[id]);
    return curveThrough(path,progress);
  }
  function curveThrough(path,progress) {
    if(path.length===1)return path[0];
    const p=clamp(progress)*(path.length-1),i=Math.min(path.length-2,Math.floor(p)),t=p-i;
    if(t===0)return path[i];
    if(t===1)return path[i+1];
    const indices=[Math.max(0,i-1),i,i+1,Math.min(path.length-1,i+2)];
    return {position:spline(...indices.map(j=>path[j].position),t),target:spline(...indices.map(j=>path[j].target),t)};
  }
  function loopTransform(object,time=0) {
    const phase=((time%LOOP_MS)+LOOP_MS)%LOOP_MS/LOOP_MS*Math.PI*2;
    const root=object.rootCenter,center=object.center,p=object.phase;
    const breathe=1+.065*Math.sin(phase+object.root*.8);
    const pulse=1+.04*Math.sin(phase*2+object.root*.8);
    const a=.045*Math.sin(phase+object.root*1.2),b=.065*Math.sin(phase*2+p);
    const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
    const dx=.12*Math.sin(phase*2+p),dy=.16*Math.cos(phase+p),dz=.12*Math.sin(phase+p);
    // Absolute transforms of immutable points: closure holds for position and
    // velocity, and geometry cannot drift or accumulate integration error.
    const X=(center[0]-root[0])*breathe+dx,Y=(center[1]-root[1])*breathe+dy;
    const animatedCenter=[root[0]+X*ca-Y*sa,root[1]+X*sa+Y*ca,root[2]+(center[2]-root[2])*breathe+dz];
    const matrix=[pulse*ca*cb,-pulse*sa,pulse*ca*sb,pulse*sa*cb,pulse*ca,pulse*sa*sb,-pulse*sb,0,pulse*cb];
    const transform=point=>{
      const x=point[0]-center[0],y=point[1]-center[1],z=point[2]-center[2];
      return [animatedCenter[0]+matrix[0]*x+matrix[1]*y+matrix[2]*z,animatedCenter[1]+matrix[3]*x+matrix[4]*y+matrix[5]*z,animatedCenter[2]+matrix[6]*x+matrix[8]*z];
    };
    transform.matrix=matrix;transform.center=animatedCenter;transform.scale=pulse;
    transform.inverse=point=>{
      const X=point[0]-animatedCenter[0],Y=point[1]-animatedCenter[1];
      const x=(X*ca+Y*sa)/pulse,y=(-X*sa+Y*ca)/pulse,z=(point[2]-animatedCenter[2])/pulse;
      return [center[0]+x*cb-z*sb,center[1]+y,center[2]+x*sb+z*cb];
    };
    return transform;
  }
  function cameraVertices(o,transform,center,right,up,forward) {
    // Compose the object and camera matrices once. Each shared rest vertex
    // produces one camera-space vector rather than a temporary world vector.
    const a=transform.matrix,m=[];
    for(const axis of [right,up,forward])for(let j=0;j<3;j++)m.push(axis[0]*a[j]+axis[1]*a[j+3]+axis[2]*a[j+6]);
    return o.points.map(p=>{
      const x=p[0]-o.center[0],y=p[1]-o.center[1],z=p[2]-o.center[2];
      return [center[0]+m[0]*x+m[1]*y+m[2]*z,center[1]+m[3]*x+m[4]*y+m[5]*z,center[2]+m[6]*x+m[7]*y+m[8]*z];
    });
  }
  function projectedWorld(world,current,width,height,time=0,tier=0,prune=false,sort=true) {
    const forward=normalize(sub(current.target,current.position)),right=normalize(cross(forward,[0,1,0])),up=cross(right,forward);
    const camera=point=>{const x=point[0]-current.position[0],y=point[1]-current.position[1],z=point[2]-current.position[2];return [x*right[0]+y*right[1]+z*right[2],x*up[0]+y*up[1]+z*up[2],x*forward[0]+y*forward[1]+z*forward[2]];};
    const focal=(width<=640?Math.min(height,width*1.15):height)/(2*Math.tan(Math.PI/8));
    const cx=width*(width<=640? .42: .66),cy=height*.48;
    const project=p=>[cx+p[0]*focal/p[2],cy-p[1]*focal/p[2]];
    const shapes=[];
    const visible=pts=>!pts.every(p=>p[0]<-8)&&!pts.every(p=>p[0]>width+8)&&!pts.every(p=>p[1]<-8)&&!pts.every(p=>p[1]>height+8);
    // Conservative frustum bounds include the complete motion envelope.
    const planes=[[-1,0,(width+8-cx)/focal],[1,0,(cx+8)/focal],[0,-1,(cy+8)/focal],[0,1,(height+8-cy)/focal]].map(p=>({normal:p,length:Math.hypot(...p)}));
    for(const o of world.objects) {
      const transform=loopTransform(o,time),center=camera(transform.center),radius=o.radius*transform.scale;
      const depth=center[2],size=o.scale*transform.scale*focal/Math.max(.5,depth);
      const threshold=o.depth===2?(width<=640?3.4:3)*(tier+1):o.depth===1?2:0;
      if(depth+radius<.5 || size<threshold || planes.some(p=>dot(p.normal,center)<-radius*p.length))continue;
      const vertices=cameraVertices(o,transform,center,right,up,forward);
      const projected=vertices.map(p=>p[2]>=.5?project(p):null);
      const fade=threshold?smooth((size-threshold)/2):1;
      appendObject(world,o,vertices,projected,project,visible,fade,shapes,transform.inverse(current.position),prune?(width<=640? .5: .35):0);
    }
    return sort?shapes.sort((a,b)=>b.depth-a.depth):shapes;
  }
  function projectedFace(f,vertices,screen,project) {
    // Clipping changes vertex count. Sorting uses the continuous original face
    // centroid so an extra near-plane intersection cannot reorder it abruptly.
    const points=[],z=f.indices.reduce((sum,index)=>sum+vertices[index][2],0)/f.indices.length;
    for(const index of f.indices){
      if(!screen[index]){
        const clipped=clipPolygon(f.indices.map(j=>vertices[j]));
        if(clipped.length<3)return null;
        return {points:clipped.map(project),depth:z};
      }
      points.push(screen[index]);
    }
    return {points,depth:z};
  }
  function appendObject(world,o,vertices,screen,project,visible,fade,shapes,eye,minArea=0) {
    appendFaces(world,o,vertices,screen,project,visible,fade,shapes,eye,minArea);
    appendLines(world,o,vertices,screen,project,visible,fade,shapes,minArea);
  }
  function insignificantFace(points,alpha,minArea) {
    if(!minArea)return false;
    if(alpha<1/512)return true;
    let area=0;
    for(let j=0;j<points.length;j++){const a=points[j],b=points[(j+1)%points.length];area+=a[0]*b[1]-b[0]*a[1];}
    return Math.abs(area)<minArea*2;
  }
  function appendFaces(world,o,vertices,screen,project,visible,fade,shapes,eye,minArea) {
    for(let i=o.firstFace;i<o.firstFace+o.faceCount;i++) {
      const f=world.faces[i],plane=f.plane;
      if(plane&&plane[0]*eye[0]+plane[1]*eye[1]+plane[2]*eye[2]<=plane[3])continue;
      const face=projectedFace(f,vertices,screen,project);
      if(!face)continue;
      const z=face.depth,projected=face.points;
      if(!visible(projected))continue;
      const haze=depthVisibility(z)*fade;
      if(insignificantFace(projected,(f.opacity?? .82)*haze,minArea))continue;
      shapes.push({kind:"face",points:projected,depth:z,color:f.color,band:f.band,object:f.object,material:i,
        tint:f.tint,fillColor:f.fillColor,alpha:(f.opacity?? .82)*haze,
        edgeAlpha:(f.edgeAlpha?? .36)*haze,lineWidth:z<12?1.25: .85});
    }
  }
  function appendLines(world,o,vertices,screen,project,visible,fade,shapes,minArea) {
    for(let i=o.firstLine;i<o.firstLine+o.lineCount;i++) {
      const line=world.lines[i],[a,b]=line.indices,unclipped=screen[a]&&screen[b],clipped=unclipped?[vertices[a],vertices[b]]:clipSegment(vertices[a],vertices[b]);
      if(!clipped)continue;
      const projected=unclipped?[screen[a],screen[b]]:clipped.map(project),z=(clipped[0][2]+clipped[1][2])/2;
      if(!visible(projected))continue;
      if(minArea&&Math.hypot(projected[1][0]-projected[0][0],projected[1][1]-projected[0][1])<.5)continue;
      shapes.push({kind:"line",points:projected,depth:z,object:line.object,color:line.color,
        alpha:(line.opacity?? .65)*depthVisibility(z)*fade,lineWidth:line.width??1,arrow:line.arrow});
    }
  }
  function blendColor(a,b,t) {
    const rgb=hex=>hex.replace("#","").match(/.{2}/g).map(v=>parseInt(v,16));
    return "#"+lerp(rgb(a),rgb(b),t).map(v=>Math.round(v).toString(16).padStart(2,"0")).join("");
  }
  const roomOffset=page=>-Math.max(0,routeOrder.indexOf(page))*roomSpacing;
  const translatePose=(pose,z)=>({position:add(pose.position,[0,0,z]),target:add(pose.target,[0,0,z])});
  const routePose=(page,pose)=>translatePose(pose,roomOffset(page));
  return {loopTransform,cameraVertices,projectedWorld,projectedFace,journeyPose,blendColor,routePose,roomOffset,translatePose};
})(math,definitions);
const renderer=(function() {
  function path(ctx,points) {
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
  }
  function drawLineRun(ctx,shapes,index,colors) {
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
  function paintShapes(ctx,shapes,colors,paintCustom=null) {
    for(let index=0;index<shapes.length;index++) {
      const shape=shapes[index];
      if(paintCustom?.(ctx,shape))continue;
      // Depth order is unchanged. Only adjacent compatible lines are batched.
      if(shape.kind==="line"&&!shape.arrow){index=drawLineRun(ctx,shapes,index,colors);continue;}
      const points=shape.points,from=points[0],to=points[1];
      path(ctx,points);ctx.lineWidth=shape.lineWidth;ctx.strokeStyle=colors[shape.color];
      if(shape.kind==="face") {
        ctx.closePath();ctx.fillStyle=shape.room.faceColors[shape.material];ctx.globalAlpha=shape.alpha;ctx.fill();
        if(shape.edgeAlpha===0){ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;ctx.stroke();}
        // Explicit silhouettes survive; faint internal mesh edges are omitted
        // on desktop as on mobile. Thousands of invisible strokes cost time.
        else if(shape.room.world.faces[shape.material].edgeAlpha>.12){ctx.globalAlpha=shape.edgeAlpha;ctx.stroke();}
      } else {ctx.globalAlpha=shape.alpha;ctx.stroke();}
      if(shape.arrow) {
        const dx=to[0]-from[0],dy=to[1]-from[1],length=Math.hypot(dx,dy);if(length<10)continue;
        const size=5,ux=dx/length,uy=dy/length;
        ctx.beginPath();ctx.moveTo(to[0]-ux*size-uy*size*.55,to[1]-uy*size+ux*size*.55);ctx.lineTo(...to);ctx.lineTo(to[0]-ux*size+uy*size*.55,to[1]-uy*size-ux*size*.55);ctx.stroke();
      }
    }
    ctx.globalAlpha=1;
  }
  return {paintShapes};
})();
const api={...math,...definitions,...world,...projection,...renderer};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
(function(api) {
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
    let stage=window.SiteEngineStages?clock():0;
    const span=part=>{if(stage){const time=clock();diagnostic('stage',{part,start:stage,duration:time-stage});stage=time;}};
    layoutPasses++;
    width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);
    ratio=pixelRatio();
    const maxScroll=Math.max(0,document.documentElement.scrollHeight-height);
    window.SiteNavigation?.reconcileEndpoint?.(maxScroll);
    span('layout-range');
    const markers=[...document.querySelectorAll("[data-space-stop]")].filter(el=>visible(el) && pageStops[page]?.[el.dataset.spaceStop]).map(el=>({id:pageStops[page][el.dataset.spaceStop],y:Math.max(0,el.getBoundingClientRect().top+window.scrollY-height*.22)}));
    stops=fitScrollStops(markers,maxScroll);
    span('layout-stops');
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
    span('layout-writing');
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
    if(failed){window.SiteNavigation?.reconcileEndpoint?.();return;}
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
    const start=window.SiteEngineStages?clock():0;
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
    if(start)diagnostic('stage',{part:'model-color',route:room.name,start,duration:clock()-start});
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
      const room={world:worldFor(name,detail),name,compact:detail,faceColors:[]};variants.set(detail,room);
      if(window.SiteEngineStages)diagnostic('stage',{part:'model-build',route:name,start,duration:clock()-start});
      paintColors(room);
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
    let stage=window.SiteEngineStages?clock():0;
    const span=part=>{if(stage){const time=clock();diagnostic('stage',{part,start:stage,duration:time-stage});stage=time;}};
    // Resize only inside the protected paint, retaining the last valid bitmap.
    const w=Math.round(width*ratio),h=Math.round(height*ratio);
    if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    const state={current,width,height,ambientTime,compact,scene};
    const geometry=visibleRooms();span('draw-project');
    const custom=sceneEffects?.collect(state)||[];span('draw-effects');
    const shapes=geometry.concat(custom).sort((a,b)=>b.depth-a.depth);span('draw-sort');
    paintShapes(ctx,shapes,colors,sceneEffects?.paint);
    span('draw-paint');
    const air=atmosphereState(ambientTime);
    scene.style?.setProperty("--air-x",air.x.toFixed(3)+"px");
    scene.style?.setProperty("--air-y",air.y.toFixed(3)+"px");
    scene.style?.setProperty("--air-light",air.light.toFixed(5));
    ctx.globalAlpha=1;scene.dataset.ready="true";displayedTime=ambientTime;displayedCamera=current;displayedTier=detailTier;
    scene.dataset.phase=String(ambientTime);scene.dataset.camera=JSON.stringify(current);scene.dataset.detail=String(detailTier);
    scene.dataset.route=page;scene.dataset.travel=journey?"flying":"settled";scene.dataset.rooms=String(rooms.size);
    scene.dataset.geometry=compact||detailTier>=.5||journey||flightDetail?"compact":"full";
    scene.dataset.roomModels=String([...rooms.values()].reduce((count,variants)=>count+variants.size,0));
    span('draw-state');
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
      const renderCost=clock()-start;
      // Text follows the painted camera, including skipped frames and stalls.
      if(travelUpdate)reportTravel(journey?clamp(journey.elapsed/journey.duration):1);
      nextDraw=nextDeadline(nextDraw,time,interval);
      // Decorative quality responds to rendering cost. The entire callback,
      // including route mount, is still measured by the outer frame/ready gate.
      if(living)quality(renderCost,time);
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
    managesLayout:true,
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
})(api);
})();
