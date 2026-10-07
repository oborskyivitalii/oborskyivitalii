'use strict';
// Optional autonomous ribbon treatment; production palettes are unchanged.
const assert=require('node:assert/strict');
function ribbonGeometry(api){
  const {cross,normalize}=api;
  return function section(z,k,time,centerOnly=false){
    const phase=((time%24000)+24000)%24000/24000*Math.PI*2;
    const s=-z*.038,angle=s+k*Math.PI*2/3+.09*Math.sin(phase+k);
    const radius=6.4+.8*Math.sin(s*.7+k)+.24*Math.sin(phase*2+k);
    const center=[radius*Math.cos(angle)+.22*Math.sin(phase+k),3.2*Math.sin(angle)+.2*Math.cos(phase+k),z];
    if(centerOnly)return center;
    const dr=-.8*.038*.7*Math.cos(s*.7+k),da=-.038;
    const tangent=normalize([dr*Math.cos(angle)-radius*Math.sin(angle)*da,3.2*Math.cos(angle)*da,1]);
    const side=normalize(cross(tangent,[0,1,0])),baseNormal=cross(tangent,side);
    // Axial torsion travels along the ribbon; a complete slow rotation closes
    // after 24 seconds along with position, breathing and their derivatives.
    const twist=s*3.1+k*.7+phase+.12*Math.sin(phase*2+s);
    const across=side.map((v,i)=>v*Math.cos(twist)+baseNormal[i]*Math.sin(twist));
    const normal=cross(tangent,across);
    const width=(.55+.06*Math.sin(s*.6+k))*(1+.1*Math.sin(phase*2+k));
    return {center,tangent,across,normal,width,
      left:center.map((v,i)=>v-across[i]*width/2),right:center.map((v,i)=>v+across[i]*width/2)};
  };
}
function ribbonSignals(){
  // Three staggered seeded events per cell: irregular packets, never new random
  // noise per frame. The engine's immutable 24-second phase owns their freeze.
  const random=(k,cell,salt)=>{
    let n=Math.imul(cell+143,374761393)^Math.imul(k+11,668265263)^Math.imul(salt+19,1274126177);
    n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;
  };
  function schedule(k,cell,slot=0){
    const salt=slot*5;
    return {start:slot*8+random(k,cell,salt)*3.5,duration:3.4+random(k,cell,salt+1)*2,
      direction:random(k,cell,salt+2)<.24?1:-1,length:8+random(k,cell,salt+3)*6,
      energy:.88+random(k,cell,salt+4)*.12};
  }
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  function packets(k,time,low,high){
    const phase=((time%24000)+24000)%24000/1000,active=[];
    for(let cell=Math.floor(low/72)-1;cell<=Math.floor(high/72)+1;cell++)for(let slot=0;slot<3;slot++){
      const s=schedule(k,cell,slot),age=(phase-s.start+24)%24;
      if(age>=s.duration)continue;
      const progress=age/s.duration,z=(cell+(s.direction<0?1-progress:progress))*72;
      if(z+s.length<low||z-s.length>high)continue;
      active.push({...s,cell,slot,z,age,alpha:s.energy*smooth(progress/.18)*smooth((1-progress)/.18)});
    }
    return active;
  }
  return {schedule,packets};
}
function createRibbonMaterials(api,section,signals){
  const {smooth,depthVisibility}=api;
  // World-anchored RGB, sampled at shared mesh edges. No bitmap atlas or UV
  // triangle can expose unpainted strips at a folded/near-clipped ribbon edge.
  const palettes=[[[18,71,255],[255,25,133],[255,230,0]],
    [[255,230,0],[255,54,22],[133,0,255]],[[255,37,53],[255,0,142],[0,99,255]]];
  return function material(k,dark,start,end,time,camera,far=105){
    const colors=palettes[k],paper=dark?[17,28,34]:[243,241,234];
    const packets=signals.packets(k,time,end,start);
    function sample(z,depth){
      const t=(((-z+k*23)%192)+192)%192/192,walk=(t<.5?t*2:2-t*2)*2;
      const index=Math.min(1,Math.floor(walk)),blend=smooth(walk-index);
      const fog=Math.max(.82*Math.pow(1-depthVisibility(depth),2),.95*smooth((depth-(far-14))/14));
      let light=0;
      for(const packet of packets){
        const along=(z-packet.z)*packet.direction/packet.length;
        if(along<-.82||along>.2)continue;
        const core=Math.exp(-Math.pow(along*192/17,2));
        const trail=along<=0?Math.exp(along*5)*smooth((along+.8125)*192/28)*.38:0;
        const alpha=packet.alpha*Math.min(1,core*.98+trail)*(1-fog);
        light=1-(1-light)*(1-alpha);
      }
      return colors[index].map((v,c)=>{
        const base=(v+(colors[index+1][c]-v)*blend)*(1-fog)+paper[c]*fog;
        return Math.round(base+( [255,255,248][c]-base)*light);
      });
    }
    return {sample,packets};
  };
}
function makeProjector(api,section,material,smoothEdges=true){
  const {sub,cross,normalize,clipPolygon}=api;
  return function projectRibbons(current,width,height,time,compact,ribbonMesh=0){
    const forward=normalize(sub(current.target,current.position)),right=normalize(cross(forward,[0,1,0])),up=cross(right,forward);
    const focal=(compact?Math.min(height,width*1.15):height)/(2*Math.tan(Math.PI/8)),cx=width*(compact? .42:.66),cy=height*.48;
    const camera=p=>{const x=p[0]-current.position[0],y=p[1]-current.position[1],z=p[2]-current.position[2];return [x*right[0]+y*right[1]+z*right[2],x*up[0]+y*up[1]+z*up[2],x*forward[0]+y*forward[1]+z*forward[2]];};
    const project=p=>[cx+p[0]*focal/p[2],cy-p[1]*focal/p[2],...p.slice(3)];
    const visible=points=>!points.every(p=>p[0]<-8)&&!points.every(p=>p[0]>width+8)&&!points.every(p=>p[1]<-8)&&!points.every(p=>p[1]>height+8);
    const dark=document.documentElement.dataset.theme==='dark',shapes=[],gridStep=compact?3:1.25,meshStride=compact?1:1+Math.round(Math.max(0,Math.min(2,ribbonMesh))),far=compact?64:105;
    // LOD removes complete immutable world cells; it never stretches their
    // sample lattice with the fractional quality tier. Nearby silhouettes keep
    // their fine cells while only distant material is grouped more coarsely.
    const startCell=Math.min(Math.floor(80/gridStep),Math.ceil((current.position[2]+32)/gridStep)),end=Math.max(-820,current.position[2]-(compact?96:132));
    for(let k=0;k<3;k++){
      const m=material(k,dark,startCell*gridStep,end,time,camera,far);
      const verticesAt=z=>{
        const s=section(z,k,time),left=camera(s.left),right=camera(s.right),color=m.sample(z,(left[2]+right[2])/2);
        return [[...left,0,z,...color],[...right,1,z,...color]];
      };
      let cell=startCell,ac=verticesAt(cell*gridStep);
      while((cell-1)*gridStep>=end){
        const grouped=meshStride>1&&cell%meshStride===0&&ac.every(p=>p[2]>=12),stride=grouped?meshStride:1;
        const nextCell=cell-stride,z=nextCell*gridStep,step=stride*gridStep;
        if(z<end)break;
        const bc=verticesAt(z),vertices=[ac[0],ac[1],bc[1],bc[0]],depth=vertices.reduce((sum,p)=>sum+p[2],0)/4;
        // A centre behind the near plane can still have a visible clipped end.
        if(vertices.some(p=>p[2]>=1.5)&&depth<far){
          const clipped=clipPolygon(vertices,1.5),points=clipped.map(project);
          let curves;
          // Keep the same bounded mesh. Only large unclipped side edges need
          // analytic midpoint curves; small/distant/near-clipped facets stay cheap.
          if(smoothEdges&&vertices.every(p=>p[2]>=1.5)&&points.length===4&&
            Math.max(Math.hypot(points[0][0]-points[3][0],points[0][1]-points[3][1]),Math.hypot(points[1][0]-points[2][0],points[1][1]-points[2][1]))>20){
            const middle=section(z+step/2,k,time),left=camera(middle.left),right=camera(middle.right);
            if(left[2]>=1.5&&right[2]>=1.5){
              const mid=[project(left),project(right)],ends=[[points[0],points[3]],[points[1],points[2]]];
              const error=mid.map((p,i)=>Math.hypot(p[0]-(ends[i][0][0]+ends[i][1][0])/2,p[1]-(ends[i][0][1]+ends[i][1][1])/2));
              if(Math.max(...error)>(compact? .8:.5))curves=mid.map((p,i)=>[2*p[0]-(ends[i][0][0]+ends[i][1][0])/2,2*p[1]-(ends[i][0][1]+ends[i][1][1])/2]);
            }
          }
          if(points.length>=3&&visible(curves?points.concat(curves):points))shapes.push({kind:'ribbon',points,curves,depth,ribbon:k,z,packets:m.packets.length});
        }
        ac=bc;cell=nextCell;
      }
    }
    return shapes;
  };
}
function paintRibbon(ctx,shape){
  const points=shape.points,coverage=points.map(p=>p.slice(0,2));
  const cx=points.reduce((n,p)=>n+p[0],0)/points.length,cy=points.reduce((n,p)=>n+p[1],0)/points.length;
  // Cap overlap hides antialias joins without widening the side silhouette.
  for(let i=0;i<points.length;i++){
    const j=(i+1)%points.length,p=points[i],q=points[j];if(Math.abs(p[3]-q[3])>1e-8)continue;
    const dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy);if(length<1e-6)continue;
    let nx=dy/length,ny=-dx/length;if(nx*((p[0]+q[0])/2-cx)+ny*((p[1]+q[1])/2-cy)<0){nx=-nx;ny=-ny;}
    for(const index of [i,j]){coverage[index][0]+=nx*.85;coverage[index][1]+=ny*.85;}
  }
  const low=Math.min(...points.map(p=>p[3])),high=Math.max(...points.map(p=>p[3]));
  const row=z=>{
    const samples=points.filter(p=>Math.abs(p[3]-z)<1e-8);
    return [0,1,4,5,6].map(index=>samples.reduce((n,p)=>n+p[index],0)/samples.length);
  };
  const a=row(low),b=row(high);
  if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6){
    // A foreshortened fold can project both material rows to the same centre.
    // A zero-length Canvas gradient is transparent: retain an opaque RGB fill.
    ctx.fillStyle='rgb('+a.slice(2).map((v,i)=>Math.round((v+b[i+2])/2)).join(',')+')';
  }else{
    const gradient=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);
    gradient.addColorStop(0,'rgb('+a.slice(2).map(Math.round).join(',')+')');gradient.addColorStop(1,'rgb('+b.slice(2).map(Math.round).join(',')+')');ctx.fillStyle=gradient;
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.beginPath();ctx.moveTo(coverage[0][0],coverage[0][1]);
  if(shape.curves){
    ctx.lineTo(coverage[1][0],coverage[1][1]);ctx.quadraticCurveTo(...shape.curves[1],...coverage[2]);
    ctx.lineTo(coverage[3][0],coverage[3][1]);ctx.quadraticCurveTo(...shape.curves[0],...coverage[0]);
  }else for(let i=1;i<coverage.length;i++)ctx.lineTo(coverage[i][0],coverage[i][1]);
  ctx.closePath();ctx.fill();
}
const {readingSelector,surfaceStyles}=require('./READING-SURFACES.cjs');
function createSceneEffects(api,smoothEdges){
  const section=ribbonGeometry(api),signals=ribbonSignals(),materials=createRibbonMaterials(api,section,signals);
  const project=makeProjector(api,section,materials,smoothEdges);
  return {
    collect({current,width,height,ambientTime,compact,scene,detailTier=0,journey=null}){
      const shapes=project(current,width,height,ambientTime,compact,detailTier);
      scene.dataset.ribbons="3";scene.dataset.ribbonMaterial="opaque-rgb";scene.dataset.ribbonFaces=String(shapes.length);
      scene.dataset.ribbonSignals=String([0,1,2].reduce((n,k)=>n+(shapes.find(shape=>shape.ribbon===k)?.packets||0),0));
      // Opt-in QA observes actual submitted stations; an ordinary visitor does
      // no trace construction, extra projection or work outside this clock.
      if(window.SiteRibbonProbe)window.SiteRibbonProbe({current,width,height,ambientTime,compact,detailTier,gridStep:compact?3:1.25,meshStride:compact?1:1+Math.round(Math.max(0,Math.min(2,detailTier))),journey,shapes});
      return shapes;
    },
    paint(ctx,shape){if(shape.kind!=="ribbon")return false;paintRibbon(ctx,shape);return true;}
  };
}
function decorate(html,{smoothEdges=true}={}){
  assert.equal(typeof smoothEdges,'boolean','bounded ribbon smoothing comparison');
  const code=`const ribbonGeometry=${ribbonGeometry.toString()};\nconst ribbonSignals=${ribbonSignals.toString()};\nconst createRibbonMaterials=${createRibbonMaterials.toString()};\nconst makeProjector=${makeProjector.toString()};\nconst paintRibbon=${paintRibbon.toString()};\nwindow.SiteEffects.scene=api=>(${createSceneEffects.toString()})(api,${smoothEdges});`;
  return require('../../tools/site/variants.cjs').attach(html,{id:'ribbons',effect:'ribbons',code,styles:surfaceStyles()+'<meta name="review-variant" content="optional-spatial-ribbons-prototype">\n'});
}
module.exports={decorate,ribbonGeometry,ribbonSignals,createRibbonMaterials,makeProjector,paintRibbon,surfaceStyles,readingSelector};
