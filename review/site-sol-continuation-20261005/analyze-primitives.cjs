'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),api=require('../../docs/space.js');
const rows=[];
for(const compact of [false,true])for(const route of ['research','writing']){
 const world=api.worldFor(route,compact),lookup=new Map(world.objects.map(o=>[o.name,o]));
 const poses=[...new Set([api.initialPoses[route],...Object.values(api.pageStops[route]||{}),...(route==='writing'?api.topicPaths.all:[])])];
 for(const pose of poses)for(const time of [0,12000]){
  const shapes=api.projectedWorld(world,api.poses[pose],compact?390:1440,compact?844:900,time,0,true,false),groups={};
  for(const shape of shapes){const o=lookup.get(shape.object),key=o.family+'/'+o.symbol+'/'+o.depth,row=groups[key]??={family:o.family,symbol:o.symbol,depth:o.depth,faces:0,lines:0,linePixels:0,areaPixels:0};
   if(shape.kind==='line'){row.lines++;row.linePixels+=Math.hypot(shape.points[1][0]-shape.points[0][0],shape.points[1][1]-shape.points[0][1]);}
   else{row.faces++;let area=0;for(let i=0;i<shape.points.length;i++){const a=shape.points[i],b=shape.points[(i+1)%shape.points.length];area+=a[0]*b[1]-b[0]*a[1];}row.areaPixels+=Math.abs(area)/2;}
  }
  rows.push({route,compact,pose,time,total:shapes.length,groups:Object.values(groups)});
 }
}
const source=crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../docs/space.js'))).digest('hex'),out=path.resolve(process.argv[2]);
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({source,scope:'Actual finite projector counts and unclipped screen coverage at named poses/phases. This is not a runtime timing, visible-pixel union, or exhaustive bound.',rows},null,2)+'\n');
console.log(JSON.stringify(rows.filter(x=>x.compact&&x.time===0).map(x=>({pose:x.pose,total:x.total,shared:x.groups.filter(g=>g.family==='shared').map(g=>({symbol:g.symbol,depth:g.depth,shapes:g.faces+g.lines}))}))));
