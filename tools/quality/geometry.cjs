'use strict';
const assert=require('node:assert/strict'),budgets=require('./budgets.json');
function check(world,compact){
  const finite=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
  for(const object of world.objects)assert.ok(object.points.every(finite),'nonfinite object vertex');
  for(const face of world.faces)assert.ok(face.points.every(finite),'nonfinite face vertex');
  for(const line of world.lines)assert.ok(finite(line.a)&&finite(line.b),'nonfinite line endpoint');
  const row={objects:world.objects.length,vertices:world.objects.reduce((n,x)=>n+x.points.length,0),faces:world.faces.length,lines:world.lines.length,modelBytes:Buffer.byteLength(JSON.stringify(world))};
  const limits=budgets.geometry[compact?'compact':'full'];
  for(const [key,limit]of Object.entries(limits))assert.ok(row[key]<=limit,`geometry ${key}: ${row[key]} > ${limit}`);
  return row;
}
module.exports={check};
