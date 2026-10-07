'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const api=require('../site/engine/math.cjs')();
const {ribbonGeometry,ribbonSignals,createRibbonMaterials,makeProjector,decorate}=require('../review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs');
const section=ribbonGeometry(api),distance=(a,b)=>Math.hypot(...api.sub(a,b));
test('ribbon widths halve the previous half-width version across rooms and phases',()=>{
  // Frozen measurements of the wider f6b3fb5 comparison, not a duplicate of
  // the new implementation's width formula.
  for(const [z,k,time,width]of [[48,0,0,1.98672321736888],[0,1,3000,2.531731112766794],[-100,2,5999,1.8018139548072925],[-350,0,11999,2.437969186733468],[-720,2,18000,1.9082983855462534]]){
    assert.ok(Math.abs(section(z,k,time).width-width/4)<1e-13);
  }
});
test('narrowed ribbon surfaces remain finite and orthogonal across the complete five-room journey',()=>{
  for(let k=0;k<3;k++)for(let z=80;z>=-820;z-=7)for(const time of [0,1300,6000,11990,18000,23999]){
    const s=section(z,k,time);
    assert.deepEqual(section(z,k,time,true),s.center,'material-only depth samples retain exact geometry');
    for(const key of ['center','tangent','across','normal','left','right'])assert.ok(s[key].every(Number.isFinite),key);
    assert.ok(s.width>.425&&s.width<.675);
    assert.ok(Math.abs(distance(s.left,s.right)-s.width)<1e-10);
    assert.ok(Math.abs(api.dot(s.tangent,s.across))<1e-10);
    assert.ok(Math.abs(api.dot(s.normal,s.across))<1e-10);
    assert.ok(Math.abs(Math.hypot(...s.across)-1)<1e-10);
    assert.ok(distance(s.center,[0,0,z])<8.3,'bounded transverse envelope');
  }
});
test('axial twist, position, pulse and velocity close at 24 seconds without drift',()=>{
  for(let k=0;k<3;k++)for(const z of [48,0,-100,-350,-720])for(const time of [-6000,0,2317,5999,11999]){
    const a=section(z,k,time),b=section(z,k,time+24000*100);
    for(const key of ['center','across','left','right'])assert.ok(distance(a[key],b[key])<1e-10,key);
    assert.equal(a.width,b.width);
    for(const key of ['left','right']){
      const derivative=t=>api.sub(section(z,k,t+.1)[key],section(z,k,t-.1)[key]);
      assert.ok(distance(derivative(time),derivative(time+24000))<1e-10,'continuous velocity');
    }
    assert.ok(distance(a.across,section(z,k,time+6000).across)>1,'visible axial turn');
    assert.ok(distance(a.across,section(z-12,k,time).across)>1,'spatial torsion');
    assert.ok(distance(a.center,section(z,k,time+6000).center)>.05,'living position');
  }
  assert.ok(Math.abs(section(0,0,3000).width-section(0,0,9000).width)>.075,'visible width breathing');
});
test('opaque RGB material is bounded, world anchored and survives near-plane clipping',()=>{
  const material=createRibbonMaterials(api,section,{packets:()=>[]});
  for(const dark of [false,true])for(let k=0;k<3;k++){
    const a=material(k,dark,80,-132,7317,()=>[0,0,20]);
    const b=material(k,dark,40,-172,7317,()=>[0,0,20]);
    for(let z=-120;z<=40;z+=.25){
      assert.deepEqual(a.sample(z,20),b.sample(z,20),'changing mesh window never restarts palette');
      assert.ok(a.sample(z,20).every(v=>Number.isInteger(v)&&v>=0&&v<=255));
    }
    assert.ok(Math.max(...a.sample(0,2))-Math.min(...a.sample(0,2))>150,'near material remains saturated');
  }
  const clipped=api.clipPolygon([[0,0,1,0,100,255,0,0],[4,0,3,1,100,0,0,255],[4,3,3,1,120,0,0,255],[0,3,1,0,120,255,0,0]],1.5);
  const boundary=clipped.filter(p=>p[2]===1.5);assert.equal(boundary.length,2);
  for(const p of boundary){assert.equal(p[3],.25);assert.equal(p[5],191.25);assert.equal(p[7],63.75);}
});
test('projected adjacent strip segments reuse the same world-anchored material edge',()=>{
  const vm=require('node:vm');
  const project=vm.runInNewContext('('+makeProjector.toString()+')(api,section,material)',{
    api,section,document:{documentElement:{dataset:{theme:'dark'}}},material:()=>({sample:z=>[100+z*.1,40,240],packets:[]})
  });
  for(const compact of [false,true]){
    const shapes=project({position:[0,0,24],target:[0,0,-20]},compact?390:1440,compact?844:900,7317,compact),step=compact?3:1.25;
    let joined=0;
    for(const a of shapes){
      const b=shapes.find(b=>b.ribbon===a.ribbon&&b.z===a.z-step);
      if(!b)continue;
      // Near-plane clipping can preserve four vertices while changing their
      // order. Compare the actual shared material row, including intersections.
      const ae=a.points.filter(p=>Math.abs(p[3]-a.z)<1e-8),be=b.points.filter(p=>Math.abs(p[3]-a.z)<1e-8);
      if(ae.length<2||be.length<2)continue;
      for(const p of ae)assert.ok(be.some(q=>distance(p,q)<1e-10));
      joined++;
    }
    assert.ok(joined>(compact?5:30),'actual continuous adjacent projected edges');
  }
});
function isWorldRibbonStation(point,grid){
  return (point[2]===0||point[2]===1)&&Math.abs(point[3]/grid-Math.round(point[3]/grid))<1e-8;
}
function worldRibbonStations(shapes,grid){
  const stations=new Map();
  for(const shape of shapes)for(const point of shape.points)if(isWorldRibbonStation(point,grid))stations.set([shape.ribbon,point[2],point[3]].join('/'),point);
  return stations;
}
function assertStableRibbonTier({shapes,fine,near,stations,grid,tier,compact}){
  if(tier<.5||compact)assert.equal(JSON.stringify(shapes),JSON.stringify(fine),'a fractional tier cannot slide the world lattice');
  for(const before of near){const after=shapes.find(shape=>shape.ribbon===before.ribbon&&shape.z===before.z);assert.ok(after,'near contour retains its fine cell');assert.equal(JSON.stringify(after),JSON.stringify(before),'quality cannot repaint the near silhouette');}
  let shared=0;
  for(const shape of shapes)for(const point of shape.points)if(isWorldRibbonStation(point,grid)){
    const original=stations.get([shape.ribbon,point[2],point[3]].join('/'));if(!original)continue;assert.ok(distance(point,original)<1e-8,'shared world station retains its exact projection and material');shared++;
  }
  assert.ok(shared>20,'coarsening preserves observed world stations');assert.ok(shapes.every(shape=>shape.points.flat().every(Number.isFinite)));
}
test('fixed world cells keep projected ribbon stations stable across fractional adaptive tiers and reversible room flights',()=>{
  const vm=require('node:vm'),b=require('../tools/site/build.cjs'),root=require('node:path').resolve(__dirname,'..'),model=b.model(root,b.configuration(root).definitions);
  const material=createRibbonMaterials(api,section,ribbonSignals()),project=vm.runInNewContext('('+makeProjector.toString()+')(api,section,material)',{api,section,material,document:{documentElement:{dataset:{theme:'dark'}}}});
  const itinerary=['index','research','writing','talks','writing','research','index'];
  for(const compact of [false,true])for(let leg=1;leg<itinerary.length;leg++)for(const fraction of [0,.5,1]){
    const from=model.routePose(itinerary[leg-1],model.poses[model.initialPoses[itinerary[leg-1]]]),to=model.routePose(itinerary[leg],model.poses[model.initialPoses[itinerary[leg]]]),pose=api.mix(from,to,fraction),width=compact?390:1440,time=7317,grid=compact?3:1.25;
    const fine=project(pose,width,900,time,compact,0),near=fine.filter(shape=>shape.depth<12),stations=worldRibbonStations(fine,grid);
    assert.ok(stations.size>30,'positive actual world station observations');
    for(const tier of [.001,.499,.501,1,1.499,1.501,2]){
      const shapes=project(pose,width,900,time,compact,tier);
      assertStableRibbonTier({shapes,fine,near,stations,grid,tier,compact});
    }
  }
  // Visible near-plane crossing: the centre is behind z=1, but clipped material
  // remains on screen. A centroid-only cull used to remove this ribbon end.
  const crossing=project({position:[5,3,-21],target:[0,0,-50]},1440,900,0,false,2).find(shape=>shape.ribbon===0&&shape.z===-22.5);
  assert.ok(crossing&&crossing.depth<1);assert.ok(crossing.points.length>=3&&crossing.points.every(point=>point.every(Number.isFinite)));
  const styles=require('node:fs').readFileSync(require('node:path').join(root,'site/engine/styles.css'),'utf8');
  assert.equal(/body\[data-page[^\n]*\.space-scene canvas[^\n]*opacity/.test(styles),false,'mounting a route cannot switch the shared Canvas opacity');
});
test('bounded curved edges follow the analytic ribbon more closely than straight facets',()=>{
  const vm=require('node:vm'),material=createRibbonMaterials(api,section,{packets:()=>[]});
  const projector=enabled=>vm.runInNewContext('('+makeProjector.toString()+')(api,section,material,enabled)',{
    api,section,material,enabled,document:{documentElement:{dataset:{theme:'dark'}}}
  });
  for(const compact of [false,true]){
    const width=compact?390:1440,height=compact?844:900,step=compact?3:1.25;
    const pose={position:[0,0,24],target:[0,0,-20]},time=7317;
    const shapes=projector(true)(pose,width,height,time,compact),linear=projector(false)(pose,width,height,time,compact);
    const curved=shapes.filter(s=>s.curves);
    assert.ok(curved.length>0&&curved.length<shapes.length/4,'only visibly large facets use curves');
    assert.ok(linear.every(s=>!s.curves));
    assert.equal(shapes.length,linear.length,'smoothing does not increase this mesh');
    // Independently project exact geometry at quarter points; these samples
    // are not the midpoint used to construct the Canvas control points.
    const focal=(compact?Math.min(height,width*1.15):height)/(2*Math.tan(Math.PI/8));
    const screen=p=>[width*(compact?.42:.66)+p[0]*focal/(24-p[2]),height*.48-p[1]*focal/(24-p[2])];
    for(const s of curved){
      assert.ok(s.curves.flat().every(Number.isFinite));
      const original=linear.find(q=>q.ribbon===s.ribbon&&q.z===s.z);
      assert.equal(JSON.stringify(s.points),JSON.stringify(original.points),'shared material endpoints stay exact across isolated renderers');
      for(const [side,ia,ib,control]of [['left',0,3,0],['right',1,2,1]])for(const t of [.25,.75]){
        const exact=screen(section(s.z+step*(1-t),s.ribbon,time)[side]),a=s.points[ia],b=s.points[ib],c=s.curves[control];
        const straight=[0,1].map(i=>a[i]+(b[i]-a[i])*t);
        const curve=[0,1].map(i=>(1-t)**2*a[i]+2*t*(1-t)*c[i]+t*t*b[i]);
        assert.ok(distance(exact,curve)<distance(exact,straight)*.25,'curve reduces independent projected geometry error');
      }
    }
  }
});
test('seeded signals run three times per cycle with gaps, both directions and exact phase closure',()=>{
  const signals=ribbonSignals(),events=[];
  for(let k=0;k<3;k++)for(let cell=-12;cell<2;cell++){
    const local=[0,1,2].map(slot=>signals.schedule(k,cell,slot));events.push(...local);
    for(let slot=0;slot<3;slot++){
      const gap=(local[(slot+1)%3].start-local[slot].start+24)%24;
      assert.ok(gap>=4.5&&gap<=11.5,'bounded separated starts');
    }
  }
  const forward=events.filter(e=>e.direction<0).length/events.length;
  assert.ok(forward>.65&&forward<.85,'forward majority retains returning signals');
  assert.equal(events.length,126,'three events per cell instead of one');
  assert.ok(new Set(events.map(e=>e.start)).size>120,'independent event timings');
  for(const e of events){assert.ok(e.duration<5.4&&e.duration>=3.4);assert.ok(e.start>=0&&e.start<24);}
  for(let k=0;k<3;k++)for(let t=-1000;t<24000;t+=137){
    const packets=signals.packets(k,t,-260,-88);
    assert.deepEqual(packets,signals.packets(k,t+24000*100,-260,-88));assert.ok(packets.length<=12);
    for(const p of packets){assert.ok(Number.isFinite(p.z));assert.ok(p.alpha>=0&&p.alpha<=1);assert.ok(p.age>=0&&p.age<p.duration);}
  }
  const e=signals.schedule(0,-1),start=e.start*1000;
  const at=t=>signals.packets(0,t,-72,0).find(p=>p.cell===-1&&p.slot===0);
  assert.ok((at(start)?.alpha||0)<1e-12,'soft emergence');assert.equal(at(start+(e.duration+.01)*1000),undefined,'packet ends without continuous flicker');
  const p=at(start+e.duration*400),q=at(start+e.duration*400+100);
  assert.equal(Math.sign(q.z-p.z),e.direction,'material-space travel follows scheduled direction');
});
test('offline ribbon treatment is exact, labelled, depth-sorted and invalidates stale engine identity',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const html=require('../review/site-scroll-sync-20261004/export.cjs').standalone(fs.readFileSync(path.join(__dirname,'../review/site-v1-20261004-v11-interactive.html'),'utf8'));
  const hash=html.match(/name="site-engine" content="([a-f0-9]{64})"/)[1];
  const output=decorate(html);
  assert.match(output,/optional-spatial-ribbons-prototype/);
  const merged=output.match(/const custom=sceneEffects\?\.collect\(state\)\|\|\[\];[\s\S]*?const shapes=geometry\.concat\(custom\)\.sort\(\(a,b\)=>b\.depth-a\.depth\);/)[0];
  const depths=require('node:vm').runInNewContext('(()=>{'+merged+'return shapes.map(s=>s.depth);})()',{
    geometry:[{depth:1},{depth:9}],sceneEffects:{collect:()=>[{kind:'ribbon',depth:4}]},state:{},span:()=>{}
  });
  assert.deepEqual(Array.from(depths),[9,4,1],'authored ribbons and native geometry share the actual depth sort');
  assert.match(output,/if\(shape.kind!=="ribbon"\)/);
  assert.match(output,/opaque-rgb/);
  assert.doesNotMatch(output,/createPattern|setTransform\(\{a:/,'no affine bitmap edge extrapolation');
  assert.doesNotMatch(output,/\bMath\.random\(/,'no per-frame noise or cumulative random drift');
  assert.ok(!output.includes(hash));
  assert.equal((output.match(/requestAnimationFrame/g)||[]).length,(html.match(/requestAnimationFrame/g)||[]).length,'shares the existing paint callback');
  assert.throws(()=>decorate(output),/duplicate offline ribbons/);
});
