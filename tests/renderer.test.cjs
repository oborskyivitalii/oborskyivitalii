'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {paintShapes}=require('../site/engine/renderer.cjs')();
function recorder(){
  const commands=[];return {commands,beginPath(){commands.push('begin');},moveTo(){},lineTo(){},closePath(){},fill(){commands.push('fill');},stroke(){commands.push('stroke');}};
}
test('batching keeps depth order and visible outlines, reducing tiny mesh strokes',()=>{
  const ctx=recorder(),room={faceColors:['#123456'],world:{faces:[{edgeAlpha:.12},{edgeAlpha:.36},{edgeAlpha:0}]}};
  const face=material=>({kind:'face',points:[[0,0],[10,0],[0,10]],room,material,color:'cyan',alpha:.82,edgeAlpha:room.world.faces[material].edgeAlpha,lineWidth:1});
  const line=alpha=>({kind:'line',points:[[0,0],[10,10]],color:'cyan',alpha,lineWidth:1});
  paintShapes(ctx,[face(0),line(.6),line(.601),face(1),line(.6),face(2)],{cyan:'#123456'});
  assert.deepEqual(ctx.commands.filter(x=>x!=='begin'),['fill','stroke','fill','stroke','stroke','fill','stroke']);
  assert.equal(ctx.globalAlpha,1);
});
test('line grouping stops at opacity changes, arrows and extension geometry',()=>{
  const ctx=recorder(),line=(alpha,arrow=false)=>({kind:'line',points:[[0,0],[20,0]],color:'cyan',alpha,lineWidth:1,arrow});
  paintShapes(ctx,[line(.6),line(.61),{kind:'custom'},line(.61,true),line(.61)],{cyan:'#123456'},(ctx,shape)=>{if(shape.kind!=='custom')return false;ctx.commands.push('custom');return true;});
  assert.deepEqual(ctx.commands.filter(x=>x!=='begin'),['stroke','stroke','custom','stroke','stroke','stroke']);
});
test('runtime subpixel pruning removes only insignificant faces, leaving export geometry complete',()=>{
  const b=require('../tools/site/build.cjs'),{definitions}=b.configuration(require('node:path').resolve(__dirname,'..')),m=b.model(require('node:path').resolve(__dirname,'..'),definitions);
  for(const compact of [false,true]){
    const w=m.worldFor('research',compact),args=[w,m.poses.overview,compact?390:1440,compact?844:900,7317,0];
    const full=m.projectedWorld(...args),pruned=m.projectedWorld(...args,true);assert.ok(pruned.length<full.length*.95);assert.ok(pruned.length>full.length*.6);
    const key=s=>JSON.stringify(s);const survivors=new Set(pruned.map(key));
    for(const shape of full)if(!survivors.has(key(shape))){
      if(shape.kind==='line'){
        const line=w.lines[shape.material],object=w.objects.find(o=>o.name===shape.object),transform=m.loopTransform(object,7317),forward=m.normalize(m.sub(args[1].target,args[1].position));
        const focal=(compact?Math.min(844,390*1.15):900)/(2*Math.tan(Math.PI/8)),depth=m.dot(m.sub(transform.center,args[1].position),forward),size=object.scale*transform.scale*focal/Math.max(.5,depth);
        assert.ok(Math.hypot(shape.points[1][0]-shape.points[0][0],shape.points[1][1]-shape.points[0][1])<.5||line.minScale&&size<line.minScale+1,'only subpixel or explicitly marked secondary strokes may change');
      }
      else {let area=0;const p=shape.points;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];area+=p[i][0]*q[1]-q[0]*p[i][1];}assert.ok(shape.alpha<1/512||Math.abs(area)/2*shape.alpha<(compact?.5:.35));}
    }
    assert.deepEqual(m.projectedWorld(...args),full,'static model is unchanged by a runtime pruning pass');
  }
});
test('tight culling spheres contain actual animated vertices and closed brain normals point outward',()=>{
 const b=require('../tools/site/build.cjs'),root=require('node:path').resolve(__dirname,'..'),{definitions}=b.configuration(root),m=b.model(root,definitions);
 for(const compact of [false,true]){
  const world=m.worldFor('research',compact);
  for(const object of world.objects)for(const time of [0,6100,12000,17900,23999]){
   const transform=m.loopTransform(object,time);
   for(const point of object.points)assert.ok(Math.hypot(...m.sub(transform(point),transform.center))<=object.radius*transform.scale+1e-8,'sphere must contain geometry at the actual phase');
  }
  for(const object of world.objects.filter(o=>o.family==='shared'&&o.formula))for(const line of world.lines.slice(object.firstLine,object.firstLine+object.lineCount).filter(l=>l.opacity>.95))assert.equal(line.minScale,undefined,'formula glyphs/fraction bars are never secondary detail');
  if(compact)for(const object of world.objects.filter(o=>o.symbol==='brain')){
   const n=object.depth?5:6;
   for(const side of [0,1]){
    const shell=world.faces.slice(object.firstFace+side*n*4,object.firstFace+(side+1)*n*4),points=shell.flatMap(f=>f.points),centre=[0,1,2].map(j=>points.reduce((sum,p)=>sum+p[j],0)/points.length);
    for(const face of shell){assert.ok(face.plane);assert.ok(m.dot(face.plane.slice(0,3),centre)<face.plane[3],'hemisphere interior must lie behind its outward plane');}
   }
  }
 }
});
