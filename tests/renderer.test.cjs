'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {paintShapes,facePalette}=require('../site/engine/renderer.cjs')();
test('the RGB-keyed palette matches every original face color on all routes, details and themes',()=>{
  const worldFor=require('../site/scenes/world.cjs')(require('../site/engine/math.cjs')()).worldFor;
  const themes=[{cyan:'#245866',amber:'#70512d',paper:'#f3f1ea',sheet:'#fffdf7'},{cyan:'#78abb0',amber:'#c2a373',paper:'#111c22',sheet:'#85999e'},{cyan:'#075d7b',amber:'#895710',paper:'#ffffff',sheet:'#fffdf7'}];
  for(const colors of themes){
    const rgb=Object.fromEntries(Object.entries(colors).map(([key,hex])=>[key,hex.slice(1).match(/.{2}/g).map(value=>parseInt(value,16))])),cache=new Map();
    for(const route of ['index','research','writing','talks','credits'])for(const compact of [false,true]){
      const {faces}=worldFor(route,compact);
      const original=faces.map(face=>'#'+rgb.paper.map((value,i)=>Math.round(value+(rgb[face.fillColor||face.color][i]-value)*face.tint).toString(16).padStart(2,'0')).join(''));
      assert.deepEqual(facePalette(faces,colors,cache),original,route+' compact='+compact);
    }
    assert.equal(cache.size,new Set(cache.values()).size,'one cache entry per final color');
    assert.ok(cache.size<1000,'the finite palette must not retain thousands of float-string entries');
  }
});
function recorder(){
  const commands=[];return {commands,beginPath(){commands.push('begin');},moveTo(){},lineTo(){},closePath(){},fill(){commands.push('fill');},stroke(){commands.push('stroke');}};
}
test('filled facets avoid unused native stroke setters while every visible contour retains its effective style',()=>{
  const strokes=[],fills=[],writes=[],ctx=recorder();
  for(const property of ['lineWidth','strokeStyle']){
    let value;Object.defineProperty(ctx,property,{get:()=>value,set:next=>{value=next;writes.push([property,next]);}});
  }
  ctx.fill=()=>fills.push([ctx.fillStyle,ctx.globalAlpha]);ctx.stroke=()=>strokes.push([ctx.strokeStyle,ctx.lineWidth,ctx.globalAlpha]);
  const room={faceColors:['#abcdef','#fedcba','#aabbcc'],world:{faces:[{edgeAlpha:.12},{edgeAlpha:.36},{edgeAlpha:0}]}};
  const face=material=>({kind:'face',points:[[0,0],[10,0],[0,10]],room,material,color:'cyan',alpha:.82,edgeAlpha:room.world.faces[material].edgeAlpha,lineWidth:1.25});
  paintShapes(ctx,[face(0),face(1),face(2)],{cyan:'#123456'});
  assert.deepEqual(fills,[['#abcdef',.82],['#fedcba',.82],['#aabbcc',.82]]);
  assert.deepEqual(strokes,[['#123456',1.25,.36],['#aabbcc',.65,.82]]);
  assert.equal(writes.length,4,'unoutlined facet submits no unused stroke-state setters');assert.equal(ctx.globalAlpha,1);
});
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
test('one fixed formula cache preserves scene order and is reused across room visits and viewport sizes',()=>{
  const asset=require('../tools/site/scene-assets.cjs').load(require('node:path').resolve(__dirname,'..'));
  let constructions=0,gradients=0;const target=recorder();target.bezierCurveTo=()=>{};target.createLinearGradient=()=>{gradients++;return {addColorStop(){}};};
  const surface={getContext:()=>target},renderer=require('../site/engine/renderer.cjs')(asset,()=>{constructions++;return surface;}),ctx=recorder();
  const submissions=[],states=[];ctx.imageSmoothingEnabled=false;ctx.imageSmoothingQuality='low';
  ctx.save=()=>states.push({globalAlpha:ctx.globalAlpha,imageSmoothingEnabled:ctx.imageSmoothingEnabled,imageSmoothingQuality:ctx.imageSmoothingQuality});
  ctx.restore=()=>Object.assign(ctx,states.pop());ctx.clip=()=>{};ctx.transform=(...matrix)=>assert.ok(matrix.every(Number.isFinite));
  ctx.drawImage=(bitmap,...bounds)=>{assert.equal(bitmap,surface);assert.ok(bounds.every(Number.isFinite));submissions.push({alpha:ctx.globalAlpha,smoothing:ctx.imageSmoothingEnabled,quality:ctx.imageSmoothingQuality});ctx.commands.push('formula');};
  const line={kind:'line',points:[[0,0],[10,10]],color:'cyan',alpha:.5,lineWidth:1};
  const builder=require('../tools/site/build.cjs'),root=require('node:path').resolve(__dirname,'..'),api=builder.model(root,builder.configuration(root).definitions),anchor=api.worldFor('writing').formulas[0];
  const formula=api.projectedFormula(anchor,api.poses.library,390,844,7317);
  assert.equal(renderer.formulaReady(),false);renderer.prepareFormula();renderer.prepareFormula();
  assert.equal(renderer.formulaReady(),true);assert.equal(renderer.formulaDiagnostics().paintCount,0,'preparation submits no Canvas paint');
  renderer.paintShapes(ctx,[line,formula,line],{cyan:'#123456'});
  assert.equal(renderer.formulaDrawn(),true,'bitmap ownership persists until another successful paint');
  assert.deepEqual(ctx.commands.filter(c=>c!=='begin'),['stroke',...Array(24).fill('formula'),'stroke'],'one extruded perspective landmark paints at its sorted depth without moving other commands');
  assert.equal(renderer.formulaDiagnostics().lastDrawSubmissions,24);
  assert.ok(submissions.every(paint=>paint.alpha===formula.alpha&&paint.smoothing===true&&paint.quality==='high'),'all world layers retain a definite glyph edge without additional translucent ghosts');
  assert.equal(ctx.imageSmoothingEnabled,false);assert.equal(ctx.imageSmoothingQuality,'low','formula sampling state does not leak to other scene commands');
  assert.deepEqual(renderer.formulaDiagnostics().projection,formula.projection);
  assert.equal(target.commands.filter(c=>c==='stroke').length,15,'each approved glyph is rasterized exactly once');
  for(let visit=0;visit<40;visit++){
    renderer.paintShapes(ctx,[api.projectedFormula(anchor,api.poses.library,visit%2?1440:390,900,visit*293)],{});
    assert.equal(renderer.formulaDiagnostics().lastPaintCount,1);
    renderer.paintShapes(ctx,[line],{cyan:'#123456'});assert.equal(renderer.formulaDiagnostics().lastPaintCount,0);assert.equal(renderer.formulaDrawn(),false,'an empty room paint carries no formula landmark');
  }
  const diagnostic=renderer.formulaDiagnostics();assert.equal(diagnostic.status,'ready');assert.equal(diagnostic.paintCount,41);assert.equal(diagnostic.visibleCount,0);
  assert.equal(constructions,1);assert.equal(gradients,1);assert.equal(diagnostic.cacheBuilds,1);assert.equal(diagnostic.drawSubmissions,41*24);assert.equal(diagnostic.bytes,1380*240*4);assert.equal(diagnostic.failures,0);
  assert.equal(target.commands.filter(c=>c==='stroke').length,15,'resize/theme/route reuse adds no path construction');
});
test('formula raster failure is bounded once and preserves other scene commands',()=>{
  const asset=require('../tools/site/scene-assets.cjs').load(require('node:path').resolve(__dirname,'..'));
  let attempts=0;const renderer=require('../site/engine/renderer.cjs')(asset,()=>{attempts++;return {getContext(){throw Error('cache unavailable');}};}),ctx=recorder();
  const formula={kind:'formula',points:[[0,0],[10,0],[10,10],[0,10]],alpha:1},line={kind:'line',points:[[0,0],[10,10]],color:'cyan',alpha:.5,lineWidth:1};
  renderer.prepareFormula();renderer.prepareFormula();assert.equal(renderer.formulaReady(),false);
  for(let frame=0;frame<8;frame++)assert.doesNotThrow(()=>renderer.paintShapes(ctx,[formula,line],{cyan:'#123456'}));
  assert.equal(attempts,1);assert.equal(ctx.commands.filter(c=>c==='stroke').length,8);assert.equal(ctx.globalAlpha,1);
  assert.equal(renderer.formulaDiagnostics().status,'failed');assert.equal(renderer.formulaDiagnostics().failures,1);assert.equal(renderer.formulaDiagnostics().bytes,0);
  assert.equal(renderer.formulaDiagnostics().paintCount,0);
});
test('the Writing landmark inhabits the book fractal and follows its periodic world transform and forward camera',()=>{
  const builder=require('../tools/site/build.cjs'),root=require('node:path').resolve(__dirname,'..'),api=builder.model(root,builder.configuration(root).definitions),world=api.worldFor('writing'),anchor=world.formulas[0];
  assert.equal(world.formulas.length,1);assert.deepEqual(anchor.center,[0,0,-5]);assert.deepEqual(anchor.rootCenter,world.objects.find(o=>o.root===0).rootCenter);
  const first=api.projectedFormula(anchor,api.poses.library,1440,900,0),mobile=api.projectedFormula(anchor,api.poses.library,390,844,0),living=api.projectedFormula(anchor,api.poses.library,1440,900,3000),approach=api.projectedFormula(anchor,api.journeyPose(api.topicPaths.all,.08),1440,900,0);
  assert.deepEqual(first.projection.worldCorners,mobile.projection.worldCorners,'viewport does not relocate the world landmark');
  assert.notDeepEqual(living.projection.worldCorners,first.projection.worldCorners);assert.ok(living.projection.pulse>first.projection.pulse);
  assert.deepEqual(api.projectedFormula(anchor,api.poses.library,1440,900,api.LOOP_MS).projection.worldCorners,first.projection.worldCorners,'existing clock closes the world pose without accumulating drift');
  assert.ok(first.points[0][1]!==first.points[1][1]);assert.ok(Math.max(...first.projection.worldCorners.map(p=>p[2]))-Math.min(...first.projection.worldCorners.map(p=>p[2]))>1,'formula has true world orientation and depth');
  assert.ok(approach.depth<first.depth);assert.ok(Math.hypot(...api.sub(approach.points[1],approach.points[0]))>Math.hypot(...api.sub(first.points[1],first.points[0])),'forward travel approaches and enlarges the fixed formula');
  assert.equal(first.cameraLayers.length,3);assert.notDeepEqual(first.cameraLayers[0],first.cameraLayers[2],'extrusion uses separated world planes');
  for(const width of [390,768,1440])for(const pose of [api.poses.library,api.journeyPose(api.topicPaths.all,.08)]){
    const shape=api.projectedFormula(anchor,pose,width,900,0),screen=p=>[shape.origin[0]+p[0]*shape.focal/p[2],shape.origin[1]-p[1]*shape.focal/p[2]];
    const nominalStroke=14*Math.hypot(...api.sub(shape.points[1],shape.points[0]))/api.sceneAsset.width;
    const separation=shape.cameraLayers[0].map((point,index)=>Math.hypot(...api.sub(screen(point),screen(shape.cameraLayers[2][index]))));
    assert.ok(Math.max(...separation)<nominalStroke/2,'shallow world thickness stays connected within the projected glyph stroke rather than creating duplicated silhouettes');
  }
  const sorted=api.projectedWorld(world,api.poses.library,1440,900,0);assert.equal(sorted.filter(s=>s.kind==='formula').length,1);
  for(let i=1;i<sorted.length;i++)assert.ok(sorted[i].depth<=sorted[i-1].depth,'formula and surrounding geometry share the same sort');
});
function assertPrunedShape(shape,w,m,compact,pose){
  if(shape.kind==='line'){
    const line=w.lines[shape.material],object=w.objects.find(o=>o.name===shape.object),transform=m.loopTransform(object,7317),forward=m.normalize(m.sub(pose.target,pose.position));
    const focal=(compact?Math.min(844,390*1.15):900)/(2*Math.tan(Math.PI/8)),depth=m.dot(m.sub(transform.center,pose.position),forward),size=object.scale*transform.scale*focal/Math.max(.5,depth);
    assert.ok(Math.hypot(shape.points[1][0]-shape.points[0][0],shape.points[1][1]-shape.points[0][1])<.5||line.minScale&&size<line.minScale+1,'only subpixel or explicitly marked secondary strokes may change');
    return;
  }
  let area=0;const p=shape.points;
  for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];area+=p[i][0]*q[1]-q[0]*p[i][1];}
  assert.ok(shape.alpha<1/512||Math.abs(area)/2*shape.alpha<(compact?.5:.35));
}
function assertPrimaryFormulaLines(world){
  for(const object of world.objects.filter(o=>o.family==='shared'&&o.formula))for(const line of world.lines.slice(object.firstLine,object.firstLine+object.lineCount).filter(l=>l.opacity>.95))assert.equal(line.minScale,undefined,'formula glyphs/fraction bars are never secondary detail');
}
function assertOutwardBrainPlanes(world,m){
  for(const object of world.objects.filter(o=>o.symbol==='brain')){
    const n=object.depth?5:6;
    for(const side of [0,1]){
      const shell=world.faces.slice(object.firstFace+side*n*4,object.firstFace+(side+1)*n*4),points=shell.flatMap(f=>f.points),centre=[0,1,2].map(j=>points.reduce((sum,p)=>sum+p[j],0)/points.length);
      for(const face of shell){assert.ok(face.plane);assert.ok(m.dot(face.plane.slice(0,3),centre)<face.plane[3],'hemisphere interior must lie behind its outward plane');}
    }
  }
}
test('runtime subpixel pruning removes only insignificant faces, leaving export geometry complete',()=>{
  const b=require('../tools/site/build.cjs'),{definitions}=b.configuration(require('node:path').resolve(__dirname,'..')),m=b.model(require('node:path').resolve(__dirname,'..'),definitions);
  for(const compact of [false,true]){
    const w=m.worldFor('research',compact),args=[w,m.poses.overview,compact?390:1440,compact?844:900,7317,0];
    const full=m.projectedWorld(...args),pruned=m.projectedWorld(...args,true);assert.ok(pruned.length<full.length*.95);assert.ok(pruned.length>full.length*.6);
    const key=s=>JSON.stringify(s);const survivors=new Set(pruned.map(key));
    for(const shape of full)if(!survivors.has(key(shape)))assertPrunedShape(shape,w,m,compact,args[1]);
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
  assertPrimaryFormulaLines(world);
  if(compact)assertOutwardBrainPlanes(world,m);
 }
});
test('all route/detail worlds retain exact geometry when Object.hasOwn is unavailable',()=>{
  const vm=require('node:vm'),mathFactory=require('../site/engine/math.cjs'),worldFactory=require('../site/scenes/world.cjs');
  const compatible=vm.runInNewContext('Object.hasOwn=undefined;const math=('+mathFactory.toString()+')();('+worldFactory.toString()+')(math)');
  const expected=worldFactory(mathFactory());
  for(const route of ['index','research','writing','talks','credits'])for(const compact of [false,true]){
    // Serialization also compares all facets, glyphs, normals and formula metadata
    // without treating separate-realm array prototypes as a geometry difference.
    assert.equal(JSON.stringify(compatible.worldFor(route,compact)),JSON.stringify(expected.worldFor(route,compact)),route+' compact='+compact);
  }
});
