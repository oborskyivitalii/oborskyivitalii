"use strict";
// Native function factory; the producer serializes this exact authored function.
module.exports=function(math) {
  const {add,normalize,facePlane,owns}=math;
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
      const line=(a,b,color="cyan",alpha=.58,width=1,minScale=0)=>lines.push({a:point(a),b:point(b),color,band,opacity:alpha,width,object:name,...(minScale?{minScale}:{})});
      const path=(points,color="cyan",alpha=.58,width=1,minScale=0)=>{for(let i=1;i<points.length;i++)if(!compact||!points[i].every((v,j)=>v===points[i-1][j]))line(points[i-1],points[i],color,alpha,width,minScale);};
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
        // Culling uses the actual animated centre and uniform pulse scale.
        // A fixed 2.3-world-unit motion pad inflated tiny copies by several
        // times and needlessly projected objects outside the viewport.
        objects.push({name,center,scale,band,...metadata,firstFace,faceCount:template.faces.length,firstLine,lineCount:template.lines.length,points,radius:template.radius*scale+1e-6});
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
          face([[side*1.02,-1.52,0],rings[0][i],rings[0][j]],"cyan",.19,.13,true);
          face([[side*1.02,2,0],rings[2][j],rings[2][i]],"cyan",.19,.13,true);
          for(let k=0;k<2;k++)face([rings[k+1][i],rings[k+1][j],rings[k][j],rings[k][i]],"cyan",.16,.12,true);
        }
        for(let fold=0;fold<4;fold++)path(Array.from({length:7},(_,i)=>{
          const x=.27+i*.27,y=1.45-fold*.72+.18*Math.sin(i*1.7+fold);
          return [side*x,y,.12+.96*Math.sqrt(Math.max(.03,1-((x-1.02)/1.05)**2-((y-.24)/1.88)**2))];
        }),"amber",.88,1.45,fold%2?7:0);
      }
      path([[0,1.88,.2],[-.09,1.12,.6],[.07,.5,.83],[-.07,-.15,.75],[0,-1.23,.25]],"amber",.95,1.8);
      poly([[-.62,-1.38],[-.84,-1.62],[-.62,-1.93],[0,-2.06],[.62,-1.93],[.84,-1.62],[.62,-1.38]],.65,"cyan",.23);
      box([0,-2.12,-.12],[.36,.65,.42],"amber",.32);
      for(let row=0;row<2;row++)path([[-.6,-1.58-row*.2,.35],[0,-1.74-row*.2,.37],[.6,-1.58-row*.2,.35]],"amber",.68,1.15,7);
    };
    const axes=({path,line})=>{
      path([[-2.15,1.8,0],[-2.15,-1.65,0],[2.2,-1.65,0]],"cyan",.85,1.5);
      path([[-2.15,-1.65,0],[-2.15,-1.65,-1.25],[2.2,-1.65,-1.25]],"cyan",.42,1,7);
      path([[-2.32,1.53,0],[-2.15,1.8,0],[-1.98,1.53,0]],"cyan",.85,1.5,7);
      path([[1.94,-1.48,0],[2.2,-1.65,0],[1.94,-1.82,0]],"cyan",.85,1.5,7);
      for(let y=-.8;y<(detail?-.7:1.6);y+=.8)line([-2.15,y,-.35],[2,y,-.35],"cyan",.22,.7,7);
    };
    const lineChart=h=>{
      axes(h);const points=[[-1.8,-1.05,.3],[-1.1,-.2,.3],[-.45,-.55,.3],[.25,.5,.3],[.85,.22,.3],[1.72,1.48,.3]];
      h.path(points,"amber",.98,2.3);
      for(let i=1;i<points.length;i++)h.face([points[i-1],points[i],add(points[i],[0,-.18,-.15]),add(points[i-1],[0,-.18,-.15])],"amber",.36,0);
      for(const [x,y,z]of points)h.path(detail?[[x-.09,y-.09,z+.02],[x,y+.09,z+.02],[x+.09,y-.09,z+.02]]:[[x-.09,y,z+.02],[x,y+.09,z+.02],[x+.09,y,z+.02],[x,y-.09,z+.02],[x-.09,y,z+.02]],"amber",.95,1.3,7);
      h.path([[-1.8,.9,-.6],[-1.1,.45,-.6],[-.45,.2,-.6],[.25,-.3,-.6],[.85,-.62,-.6],[1.72,-.83,-.6]],"cyan",.82,1.5);
    };
    const barChart=h=>{axes(h);for(const [i,height]of [1.05,2.25,1.65,3.05].entries()){
      h.box([-1.45+i*.9,-1.6+height/2,-.28],[.58,height,1.05],i%2?"amber":"cyan",.32);
      h.line([-1.74+i*.9,-1.6+height,.27],[-1.16+i*.9,-1.6+height,.27],"amber",.98,1.8);
    }};
    const scatterChart=h=>{
      axes(h);const points=[[-1.6,-.9],[-1.15,-.4],[-.7,-.8],[-.35,.2],[.25,.05],[.8,.85],[1.35,.4],[1.75,1.25]];
      points.forEach(([x,y],i)=>{
        const z=i%2 ? .45 : -.65,r=.13;
        h.path([[x-r,y,z],[x,y+r,z],[x+r,y,z],[x,y-r,z],[x-r,y,z]],i%2?"amber":"cyan",.96,1.8);
        if(!detail)h.line([x,y,z],[x,-1.6,z],"cyan",.22,.7,7);
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
      line([ends[0],y,-.55],[ends[1],y,-.55],"cyan",.55,1.2,7);
      if(!detail)for(const x of ends)path([[x,y+.38,-.55],[x,y,-.55],[x,y,.32],[x,y+.38,.32]],"cyan",.65,1.2,7);
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
      const readable=symbol==='brain'||symbol.includes('chart')||owns(formulas,symbol);
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
    // Preserve the original cross/normalize/dot arithmetic without allocating
    // two edge vectors, a cross vector and a normalized vector for every face.
    const a=f.points[0],b=f.points[1],c=f.points[2];
    const ax=b[0]-a[0],ay=b[1]-a[1],az=b[2]-a[2];
    const bx=c[0]-a[0],by=c[1]-a[1],bz=c[2]-a[2];
    let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
    const length=Math.hypot(nx,ny,nz);
    if(length>1e-9){nx/=length;ny/=length;nz/=length;}
    else {nx=0;ny=0;nz=1;}
    const lightDot=((0+nx*light[0])+ny*light[1])+nz*light[2];
    const shade=.65+.5*Math.abs(lightDot);
    f.tint=Math.min(.63,f.tone*shade);
    if(f.oneSided)f.plane=facePlane(f.points);
    // Paper catches neutral light in both themes; metal keeps its cyan/bronze tint.
    if(f.tone<.1){f.fillColor="sheet";f.tint=.6+shade*.1;}
  }
  return {worldFor};
};
