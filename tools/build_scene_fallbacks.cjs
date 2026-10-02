"use strict";
// The no-JS/Canvas scene is a projection of the actual route's initial world.
const fs=require("node:fs"),path=require("node:path");
const {worldFor,projectedWorld,poses,initialPoses,blendColor}=require("../docs/space.js");
const pages=Object.keys(initialPoses),root=path.resolve(__dirname,"..");
const number=v=>v.toFixed(2);
function fallback(page) {
  const shapes=projectedWorld(worldFor(page),poses[initialPoses[page]],1440,900);
  const tags=shapes.map(s=>{
    const d=s.points.map((p,i)=>(i?"L":"M")+p.map(number).join(" ")).join(" ")+(s.kind==="face"?"Z":"");
    const ink=s.color==="amber"?"var(--systems)":"var(--accent)";
    if(s.kind==="face") {
      const fill=blendColor("#f8f7f3",s.color==="amber"?"#895710":"#075d7b",s.tint);
      return `<path d="${d}" fill="${fill}" style="stroke:${ink};fill:color-mix(in srgb,var(--paper) ${number((1-s.tint)*100)}%,${ink})" fill-opacity="${s.alpha}" stroke-opacity="${s.edgeAlpha}" stroke-width="${s.lineWidth}"/>`;
    }
    return `<path d="${d}" fill="none" style="stroke:${ink}" stroke-opacity="${s.alpha}" stroke-width="${s.lineWidth}"/>`;
  });
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
