'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const api=require('../site/engine/math.cjs')();
const {ribbonGeometry,ribbonSignals,createRibbonMaterials,makeProjector}=require('../review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs');
// Frozen pre-optimization implementation: an independent numerical control for
// the scalar reuse, including clipping/material/curved-edge projector decisions.
function originalRibbonGeometry(api){
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
    const twist=s*3.1+k*.7+phase+.12*Math.sin(phase*2+s);
    const across=side.map((v,i)=>v*Math.cos(twist)+baseNormal[i]*Math.sin(twist));
    const normal=cross(tangent,across);
    const width=(.55+.06*Math.sin(s*.6+k))*(1+.1*Math.sin(phase*2+k));
    return {center,tangent,across,normal,width,left:center.map((v,i)=>v-across[i]*width/2),right:center.map((v,i)=>v+across[i]*width/2)};
  };
}
test('scalar reuse preserves every section number and center-only result exactly',()=>{
  const original=originalRibbonGeometry(api),optimized=ribbonGeometry(api);
  for(const time of [-24000,-1,0,1,1777.125,12000,23999.999,24000,48000])for(let k=0;k<3;k++)for(const z of [-820,-818.75,-817,-420.5,-131.25,-96,-32,-1.5,0,1.5,32,79.5,80])for(const centerOnly of [false,true])assert.deepEqual(optimized(z,k,time,centerOnly),original(z,k,time,centerOnly));
});
test('both themes and viewport meshes retain exact full projector shapes, clips, curves, RGB and signals',()=>{
  const poses=[
    {position:[0,0,24],target:[0,0,-20]},
    {position:[6.4,0,1.3],target:[6.4,0,-30]},
    {position:[1.3,-.8,79.99],target:[-.2,.6,35]},
    {position:[-2.1,1.4,-31.5],target:[.3,-.2,-70]},
    {position:[.8,-1.1,-209.75],target:[-.4,.3,-250]},
    {position:[-1.7,.7,-419.999],target:[.4,-.6,-460]},
    {position:[.1,-.2,-790],target:[-.2,.3,-820]}
  ];
  let clipped=0,curved=0,signals=0;
  for(const theme of ['light','dark'])for(const compact of [false,true]){
    const projector=factory=>{
      const section=factory(api),material=createRibbonMaterials(api,section,ribbonSignals());
      return vm.runInNewContext('('+makeProjector.toString()+')(api,section,material,true)',{api,section,material,document:{documentElement:{dataset:{theme}}}});
    };
    const original=projector(originalRibbonGeometry),optimized=projector(ribbonGeometry),width=compact?390:1440,height=compact?844:900;
    for(const pose of poses)for(const time of [0,1777.125,12000,23999.999,24000]){
      const expected=original(pose,width,height,time,compact),actual=optimized(pose,width,height,time,compact);
      assert.equal(JSON.stringify(actual),JSON.stringify(expected),theme+'/'+compact+'/'+pose.position[2]+'/'+time);
      // Projected payloads retain material Z, not camera depth; an interpolated
      // row between the two section Z values proves actual near-plane clipping.
      const step=compact?3:1.25;
      clipped+=expected.filter(shape=>shape.points.some(point=>Math.abs(point[3]-shape.z)>1e-8&&Math.abs(point[3]-shape.z-step)>1e-8)).length;
      curved+=expected.filter(shape=>shape.curves).length;
      signals+=expected.filter(shape=>shape.packets>0).length;
    }
  }
  assert.ok(clipped>0,'positive near-plane clipping samples');assert.ok(curved>0,'positive analytic smoothing samples');assert.ok(signals>0,'positive seeded signal samples');
});
test('section performs fewer native trigonometric evaluations without a cache or altered phase',()=>{
  const count=factory=>{
    let calls=0;const measured=Object.create(Math);
    for(const name of ['sin','cos'])measured[name]=value=>{calls++;return Math[name](value);};
    vm.runInNewContext('('+factory.toString()+')',{Math:measured})(api)(-31.25,1,1777.125);
    return calls;
  };
  assert.equal(count(originalRibbonGeometry),20);assert.equal(count(ribbonGeometry),11);
});
