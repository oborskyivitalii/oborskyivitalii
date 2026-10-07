"use strict";
// The no-JS/Canvas scene is a projection of the actual route's initial world.
const fs=require("node:fs"),path=require("node:path");
const pages=["index","research","writing","talks","credits"],root=path.resolve(__dirname,"..");
function compact(svg) {
 // Preserve every rounded coordinate and paint value. SVG implicitly draws
 // lines after a move's first point; repeated L commands and decimal zeroes
 // carry no geometry. Paths inherit no fill, the common accent stroke and the
 // SVG default stroke width; other colors and the formula gradient stay explicit.
 svg=svg.replace(/ d="([^"]*)"/g,(_,d)=>' d="'+d
  .replace(/(-?\d+)\.00(?=[ ,MLZ]|$)/g,'$1')
  .replace(/(-?\d+\.\d)0(?=[ ,MLZ]|$)/g,'$1')
  .replace(/L/g,'').replace(/ M/g,'M')+'"');
 svg=svg.replace(/ style="stroke:([^;"]+);fill:([^"]+)"/g,(_,stroke,fill)=>
  ` stroke="${stroke}"${fill==='none'?'':` fill="${fill}"`}`);
 svg=svg.replace(/ ((?:stroke|fill)-opacity|stroke-width)="([\d.]+)"/g,(_,name,value)=>
  ` ${name}="${String(Number(value)).replace(/^0\./,'.')}"`);
 return svg.replace(/ stroke="var\(--accent\)"/g,'')
  .replace(' class="space-fallback"',' class="space-fallback" fill="none" stroke="var(--accent)"')
  .replace(/ stroke-width="1"/g,'');
}
function formulaRendition(api,anchor,pose,width,height) {
 const art=api.sceneAsset,shape=api.projectedFormula?.(anchor,pose,width,height,0);
 if(!art||!shape||typeof api.projectFormulaPoint!=="function")return null;
 const number=value=>value.toFixed(2),project=(point,z=0)=>api.projectFormulaPoint(anchor,pose,width,height,0,point[0]/art.width,point[1]/art.height,z);
 // Flatten only the canonical bounded glyph curves, then project each sample
 // through the same tilted world plane as Canvas. This is a static rendition,
 // not another artwork, image request, animation loop or content-height band.
 function glyphPath(glyph,z) {
  let current=[0,0],out="";
  const point=(command,p)=>{const projected=project(p,z);if(!projected||!projected.every(Number.isFinite))throw Error("Invalid projected formula glyph");out+=command+projected.map(number).join(" ")+" ";};
  for(const [kind,...values]of glyph.commands) {
   if(kind==="M"||kind==="L"){current=values;point(kind,current);}
   else if(kind==="C") {
    const from=current,a=values.slice(0,2),b=values.slice(2,4),to=values.slice(4,6);
    for(let step=1;step<=8;step++){const t=step/8,s=1-t;point("L",[0,1].map(i=>s*s*s*from[i]+3*s*s*t*a[i]+3*s*t*t*b[i]+t*t*t*to[i]));}
    current=to;
   }else throw Error("Unsupported canonical formula glyph");
  }
  return out.trim();
 }
 const gradientId="writing-paradigm-ribbon",line=art.gradient.line,from=project(line.slice(0,2)),to=project(line.slice(2,4));
 const gradient=`<defs><linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="${number(from[0])}" y1="${number(from[1])}" x2="${number(to[0])}" y2="${number(to[1])}">${art.gradient.stops.map(([offset,color])=>`<stop offset="${offset}" stop-color="${color}"/>`).join("")}</linearGradient></defs>`;
 const layers=[-anchor.extrusion,-anchor.extrusion/2,0].map((z,layer)=>{
  const paths=art.paths.map((glyph,index)=>{
   const origin=glyph.commands[0].slice(1),at=project(origin,z),x=project([origin[0]+1,origin[1]],z),y=project([origin[0],origin[1]+1],z);
   const scale=(Math.hypot(x[0]-at[0],x[1]-at[1])+Math.hypot(y[0]-at[0],y[1]-at[1]))/2;
   return `<path${layer===2?` data-glyph="${index}"`:""} d="${glyphPath(glyph,z)}" stroke-width="${number(glyph.stroke*scale)}"/>`;
  }).join("");
  return `<g data-formula-layer="${layer}" stroke-opacity="${(shape.alpha*[.32,.58,1][layer]).toFixed(3)}">${paths}</g>`;
 }).join("");
 return {depth:shape.depth,html:`<g class="writing-formula-fallback" data-formula="${anchor.id}" aria-hidden="true" fill="none" stroke="url(#${gradientId})" stroke-linecap="round" stroke-linejoin="round">${gradient}${layers}</g>`};
}
function fallback(page) {
 const builder=require("./site/build.cjs");
 return fromModel(builder.model(root,builder.configuration(root).definitions),page);
}
function fromModel(api,page) {
 const {worldFor,projectedWorld,poses,initialPoses}=api;
 const world=worldFor(page,true),objects=new Set(world.objects.filter(o=>o.root===0&&o.depth<=1).map(o=>o.name));
 const pose=poses[initialPoses[page]],shapes=projectedWorld(world,pose,1440,900).filter(s=>s.kind!=='formula'&&objects.has(s.object)),groups=new Map(),number=v=>v.toFixed(2);
 for(const shape of shapes){const key=`${shape.object}:${shape.color}:${shape.kind}`;if(!groups.has(key))groups.set(key,{shape,paths:[]});const group=groups.get(key);if(shape.kind==="face"&&group.paths.length>=8)continue;group.paths.push(shape.points.map((p,i)=>(i?"L":"M")+p.map(number).join(" ")).join(" ")+(shape.kind==="face"?"Z":""));}
 const tags=[...groups.values()].map(({shape,paths})=>{const ink=shape.color==="amber"?"var(--systems)":"var(--accent)";return {depth:shape.depth,html:`<path d="${paths.join(" ")}" style="stroke:${ink};fill:${shape.kind==="face"?"var(--paper)":"none"}" stroke-opacity="${(shape.kind==="face"?shape.edgeAlpha:shape.alpha).toFixed(3)}"${shape.kind==="face"?` fill-opacity="${shape.alpha.toFixed(3)}"`:""} stroke-width="${shape.kind==="face"? .7:1}"/>`};});
 for(const anchor of world.formulas||[]){const rendition=formulaRendition(api,anchor,pose,1440,900);if(rendition)tags.push(rendition);}
 // The sole passive landmark occupies its actual world depth among the route's
 // fractal geometry. Off/no-Canvas/no-JS never introduces a separate banner.
 return compact(`<svg class="space-fallback" data-motif="${page}" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">${tags.sort((a,b)=>b.depth-a.depth).map(tag=>tag.html).join("")}</svg>`);
}
function update(check=false) {
  if(!check){require("./site/build.cjs").build({all:true});return;}
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
module.exports={fallback,fromModel,formulaRendition,compact,update};
