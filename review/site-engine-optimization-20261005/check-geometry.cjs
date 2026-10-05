'use strict';
// Diagnostic sampling of actual model complexity, separate from the basic suite.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),api=require('../../docs/space.js'),ribbons=require('../site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs');
const file=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);
const source=fs.readFileSync(file),variant=require('../../tools/site/variants.cjs').identity(source.toString());
global.document={documentElement:{dataset:{theme:'dark'}}}; // Bounded projector theme fixture; no DOM is rendered here.
const section=ribbons.ribbonGeometry(api),materials=ribbons.createRibbonMaterials(api,section,ribbons.ribbonSignals()),projectRibbons=ribbons.makeProjector(api,section,materials,true),rows=[];
for(const route of api.routeOrder)for(const compact of [false,true]){
  const world=api.worldFor(route,compact),ids=[...new Set([api.initialPoses[route],...Object.values(api.pageStops[route]||{}),...(route==='writing'?Object.values(api.topicPaths).flat():[])])];
  const width=compact?390:1440,height=compact?844:900,samples=[];
  for(const pose of ids)for(const time of [0,12000]){
    const base=api.projectedWorld(world,api.poses[pose],width,height,time,0,true);
    const effects=projectRibbons(api.routePose(route,api.poses[pose]),width,height,time,compact);
    samples.push({pose,time,baseShapes:base.length,ribbonShapes:effects.length,totalShapes:base.length+effects.length});
  }
  rows.push({route,compact,...require('../../tools/quality/geometry.cjs').check(world,compact),projectedShapesMax:Math.max(...samples.map(x=>x.totalShapes)),samples});
}
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({schema:1,source:crypto.createHash('sha256').update(source).digest('hex'),variant,theme:'dark',rows,note:'UTF-8 serialized model bytes are a complexity/retention proxy, not live heap bytes. Projected maxima cover the named finite pose/phase samples, not every possible frame. Ribbon samples use the current authored Color effect.'},null,2)+'\n');
console.log(JSON.stringify({models:rows.length,maxFullVertices:Math.max(...rows.filter(x=>!x.compact).map(x=>x.vertices)),maxCompactVertices:Math.max(...rows.filter(x=>x.compact).map(x=>x.vertices))}));
