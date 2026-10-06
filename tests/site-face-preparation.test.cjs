'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),math=require('../site/engine/math.cjs')();
const builder=require('../tools/site/build.cjs'),{definitions}=builder.configuration(root);
const light=math.normalize([-.55,.85,1]);
function arrayReference(face){
  const normal=math.normalize(math.cross(math.sub(face.points[1],face.points[0]),math.sub(face.points[2],face.points[0])));
  const shade=.65+.5*Math.abs(math.dot(normal,light));
  const result={tint:Math.min(.63,face.tone*shade)};
  if(face.oneSided)result.plane=math.facePlane(face.points);
  if(face.tone<.1){result.fillColor='sheet';result.tint=.6+shade*.1;}
  return result;
}
function preparedFields(face){return Object.fromEntries(['tint','plane','fillColor'].filter(key=>Object.hasOwn(face,key)).map(key=>[key,face[key]]));}
test('scalar preparation preserves original array-formula shading, paper tint and Newell planes on every authored face',()=>{
  const api=require('../site/scenes/world.cjs')(math);let faces=0,planes=0,paper=0;
  for(const route of definitions.routeOrder)for(const compact of[false,true]){
    const world=api.worldFor(route,compact);
    for(const face of world.faces){assert.deepEqual(preparedFields(face),arrayReference(face),route+' '+compact+' '+face.object);faces++;planes+=Number(!!face.oneSided);paper+=Number(face.tone<.1);}
  }
  assert.ok(faces>40000);assert.ok(planes>10000);assert.ok(paper>1000);
});
test('scalar normal retains collinear/zero and near-threshold fallback, signed coordinates and concave Newell planes',()=>{
  const source=fs.readFileSync(path.join(root,'site/scenes/world.cjs'),'utf8').replace('return {worldFor};','return {worldFor,prepareFace};');
  const context={module:{exports:{}}};vm.runInNewContext(source,context);const {prepareFace}=context.module.exports(math);
  const examples=[
    [[0,0,0],[0,0,0],[0,0,0]],
    [[1,2,3],[2,4,6],[3,6,9]],
    [[0,0,0],[1e-5,0,0],[0,1e-5,0]],
    [[0,0,0],[1e-4,0,0],[0,1e-5,0]],
    [[0,0,0],[1e-3,0,0],[0,1e-5,0]],
    [[0,0,0],[1,0,0],[1,1,0],[.5,.3,0],[0,1,0]],
    [[-0,0,-0],[1,-0,0],[0,-1,0]],
    [[2,-3,4],[-5,6,-7],[8,-9,10],[1,2,3]]
  ];
  let seed=0x13579abc;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<250;i++){const scale=10**(-9+(i%19));examples.push(Array.from({length:3+(i%3)},()=>Array.from({length:3},()=>scale*(random()*2-1))));}
  for(const points of examples)for(const tone of[.04,.2])for(const oneSided of[false,true]){
    const face={points,tone,...(oneSided?{oneSided}:{}),color:'cyan'},expected=arrayReference(face);prepareFace(face,light);
    assert.deepEqual(preparedFields(face),expected);
  }
});
