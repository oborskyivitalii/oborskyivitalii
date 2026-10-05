"use strict";
// The no-JS/Canvas scene is a projection of the actual route's initial world.
const fs=require("node:fs"),path=require("node:path");
const {worldFor,projectedWorld,poses,initialPoses}=require("../docs/space.js");
const pages=Object.keys(initialPoses),root=path.resolve(__dirname,"..");
function fallback(page) {
 const world=worldFor(page,true),objects=new Set(world.objects.filter(o=>o.root===0&&o.depth<=1).map(o=>o.name));
 const shapes=projectedWorld(world,poses[initialPoses[page]],1440,900).filter(s=>objects.has(s.object)),groups=new Map(),number=v=>v.toFixed(2);
 for(const shape of shapes){const key=`${shape.object}:${shape.color}:${shape.kind}`;if(!groups.has(key))groups.set(key,{shape,paths:[]});const group=groups.get(key);if(shape.kind==="face"&&group.paths.length>=8)continue;group.paths.push(shape.points.map((p,i)=>(i?"L":"M")+p.map(number).join(" ")).join(" ")+(shape.kind==="face"?"Z":""));}
 const tags=[...groups.values()].map(({shape,paths})=>{const ink=shape.color==="amber"?"var(--systems)":"var(--accent)";return `<path d="${paths.join(" ")}" style="stroke:${ink};fill:${shape.kind==="face"?"var(--paper)":"none"}" stroke-opacity="${(shape.kind==="face"?shape.edgeAlpha:shape.alpha).toFixed(3)}"${shape.kind==="face"?` fill-opacity="${shape.alpha.toFixed(3)}"`:""} stroke-width="${shape.kind==="face"? .7:1}"/>`;});
 return `<svg class="space-fallback" data-motif="${page}" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">${tags.join("")}</svg>`;
}
function update(check=false) {
  for(const page of pages) {
    const file=path.join(root,`docs/${page}.html`),source=fs.readFileSync(file,"utf8");
    const svg=fallback(page),pattern=/<svg class="space-fallback"[\s\S]*?<\/svg>/;
    if(!pattern.test(source))throw Error(`Missing scene fallback in ${page}`);
    const result=source.replace(pattern,()=>svg);
    if(check){if(source!==result)throw Error(`Stale scene fallback in ${page}`);}
    else fs.writeFileSync(file,result);
  }
}
if(require.main===module) {
  if(process.argv[2] && process.argv[2]!=="--check")throw Error("Usage: node tools/build_scene_fallbacks.cjs [--check]");
  update(process.argv[2]==="--check");
  process.stdout.write("Five route-specific scene fallbacks are fresh.\n");
}
module.exports={fallback,update};
