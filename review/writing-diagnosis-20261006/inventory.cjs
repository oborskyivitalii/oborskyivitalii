'use strict';
const path=require('node:path'),builder=require('../../tools/site/build.cjs');
const root=path.resolve(__dirname,'../..'),{definitions}=builder.configuration(root),api=builder.model(root,definitions);
const rows=[];
for(const route of api.routeOrder)for(const compact of [false,true]){
  const world=api.worldFor(route,compact),groups={};
  for(const object of world.objects){
    const key=object.family+':'+object.symbol;
    const row=groups[key]||={objects:0,vertices:0,faces:0,lines:0};
    row.objects++;row.vertices+=object.points.length;row.faces+=object.faceCount;row.lines+=object.lineCount;
  }
  rows.push({route,compact,objects:world.objects.length,vertices:world.objects.reduce((sum,o)=>sum+o.points.length,0),faces:world.faces.length,lines:world.lines.length,groups});
}
console.log(JSON.stringify({scope:'Authored geometry inventory, not timing or visible draw counts',rows},null,2));
