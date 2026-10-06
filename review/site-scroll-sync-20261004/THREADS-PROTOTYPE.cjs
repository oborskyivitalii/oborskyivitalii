'use strict';
// Optional offline design comparison. This does not modify production sources.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
function threadPoint(z,k,time){
  const phase=((time%24000)+24000)%24000/24000*Math.PI*2;
  const s=-z*.038,angle=s+k*Math.PI*2/3+.09*Math.sin(phase+k);
  const radius=6.4+.8*Math.sin(s*.7+k)+.24*Math.sin(phase*2+k);
  return [radius*Math.cos(angle)+.18*Math.sin(phase+k),2.6*Math.sin(angle)+.16*Math.cos(phase+k),z];
}
function makePainter(api,ctx,scene,point){
  const {sub,dot,cross,normalize,clipSegment,depthVisibility}=api;
  return function paintThreads(current,width,height,time,compact){
    const forward=normalize(sub(current.target,current.position)),right=normalize(cross(forward,[0,1,0])),up=cross(right,forward);
    const focal=(compact?Math.min(height,width*1.15):height)/(2*Math.tan(Math.PI/8)),cx=width*(compact?.42:.66),cy=height*.48;
    const camera=p=>{const d=sub(p,current.position);return [dot(d,right),dot(d,up),dot(d,forward)];};
    const project=p=>[cx+p[0]*focal/p[2],cy-p[1]*focal/p[2]];
    const dark=document.documentElement.dataset.theme==='dark',phase=time/24000*Math.PI*2;
    ctx.save();ctx.lineCap='round';
    for(let k=0;k<3;k++){
      const gradient=ctx.createLinearGradient(width*.18,height*.12,width*.86,height*.9);
      for(const [i,color]of (dark?['#d57d9e','#a997d9','#74b8d3']:['#bd6a85','#8a79b8','#588fbb']).entries())gradient.addColorStop(i/2,color);
      ctx.strokeStyle=gradient;ctx.lineWidth=(compact?1.2:1.8)*(1+.08*Math.sin(phase+k));
      let previous=camera(point(64,k,time));
      for(let z=64-(compact?8:4);z>=-720;z-=compact?8:4){
        const next=camera(point(z,k,time)),segment=clipSegment(previous,next,2);previous=next;
        if(!segment)continue;
        const depth=(segment[0][2]+segment[1][2])/2;
        if(depth>105)continue;
        const a=project(segment[0]),b=project(segment[1]);
        if([a,b].every(p=>p[0]<-8||p[0]>width+8||p[1]<-8||p[1]>height+8))continue;
        ctx.globalAlpha=(dark?.34:.28)*depthVisibility(depth)*(.83+.17*Math.sin(z*.7+k))*(.94+.06*Math.sin(phase+k));
        ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
      }
    }
    ctx.restore();scene.dataset.threads='3';
  };
}
function decorate(html){
  const declaration='  function draw() {',call='    const air=atmosphereState(ambientTime);';
  assert.equal(html.split(declaration).length,2,'one inlined renderer');assert.equal(html.split(call).length,2,'one shared painted phase');
  const plugin=`const paintThreads=(${makePainter.toString()})(api,ctx,scene,${threadPoint.toString()});\n`;
  const engine=html.match(/name="site-engine" content="([a-f0-9]{64})"/)[1];
  const variant=crypto.createHash('sha256').update(engine+plugin).digest('hex');
  return html.replace(declaration,plugin+declaration).replace(call,'    paintThreads(current,width,height,ambientTime,compact);\n'+call)
    .replaceAll(engine,variant).replace('</head>','<meta name="review-variant" content="optional-spatial-threads-prototype">\n</head>');
}
module.exports={decorate,threadPoint};
