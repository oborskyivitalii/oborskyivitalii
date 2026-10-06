'use strict';
// Private construction diagnostics only. Never apply these patches to public source.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const descriptions={
  'model-profile':'Profile Writing instance construction by motif/family and its aggregate face preparation; preserve all geometry.',
  'model-no-thematic':'Omit Writing thematic instances at construction, retaining shared instances, other routes, DOM and effects.',
  'model-no-shared':'Omit Writing shared instances at construction, retaining thematic instances, other routes, DOM and effects.'
};
const labels=Object.keys(descriptions);
function replaceOnce(source,needle,replacement,patches){
  const matches=source.split(needle).length-1;
  assert.equal(matches,1,'Writing model patch must match exactly once: '+needle.slice(0,70));
  const result=source.replace(needle,()=>replacement);
  patches.push({file:'space.js',matches,needleSha256:digest(needle),replacementSha256:digest(replacement),beforeSha256:digest(source),afterSha256:digest(result)});
  return result;
}
function patchSource(source,label){
  assert.ok(labels.includes(label),'unsupported Writing model intervention');
  const patches=[],operations=[],omit=label==='model-no-thematic'?'thematic':label==='model-no-shared'?'shared':null;
  const apply=(needle,replacement)=>{operations.push({needle,replacement});source=replaceOnce(source,needle,replacement,patches);};
  const declaration='    function object(name,center,rotation,scale,band,build) {';
  const replacement=`    const modelProfile=page==="writing"&&typeof window!=="undefined"&&!!window.SiteEngineStages&&typeof window.SiteEngineProbe==="function"&&typeof window.performance?.now==="function";
    const profileRows=new Map(),modelClock=()=>window.performance.now();
    const modelOmission=${JSON.stringify(omit)};
    // Research and all other routes retain the original direct constructor.
    const object=page==="writing"&&(modelProfile||modelOmission)?function(name,center,rotation,scale,band,build){
      if(metadata.family===modelOmission)return;
      if(!modelProfile)return objectNative(name,center,rotation,scale,band,build);
      const family=metadata.family,symbol=metadata.symbol,key=family+":"+symbol;
      const row=profileRows.get(key)||{family,symbol,count:0,templateMisses:0,vertices:0,faces:0,lines:0,duration:0,start:null,end:null};
      const cacheKey=Number(compact)+":"+symbol+":"+detail,miss=!templates.has(cacheKey);
      const firstFace=faces.length,firstLine=lines.length,firstObject=objects.length,start=modelClock();
      objectNative(name,center,rotation,scale,band,build);
      const end=modelClock();
      row.start??=start;row.end=end;row.duration+=end-start;row.count++;row.templateMisses+=Number(miss);
      row.faces+=faces.length-firstFace;row.lines+=lines.length-firstLine;
      for(let i=firstObject;i<objects.length;i++)row.vertices+=objects[i].points.length;
      profileRows.set(key,row);
    }:objectNative;
    function objectNative(name,center,rotation,scale,band,build) {`;
  apply(declaration,replacement);
  const preparation='    for(const f of faces)prepareFace(f,light);';
  apply(preparation,`    const facePreparationStart=modelProfile?modelClock():0;
    for(const f of faces)prepareFace(f,light);
    if(modelProfile){
      const end=modelClock();
      // Symbol durations contain disjoint instance spans. They nest in model-build
      // and are allocation attribution, not contiguous latency or extra prep.
      for(const row of profileRows.values())window.SiteEngineProbe({kind:"model-profile",part:"symbol-construction",route:page,page,compact,disjoint:true,...row,time:end});
      window.SiteEngineProbe({kind:"stage",part:"model-face-prepare",route:page,page,start:facePreparationStart,duration:end-facePreparationStart,faces:faces.length,time:end});
    }`);
  return {source,patches,operations};
}
function patchRuntime(scripts,label){
  assert.equal(typeof scripts?.['space.js'],'string','Writing model diagnostic requires space.js');
  const {source,patches}=patchSource(scripts['space.js'],label);
  return {scripts:{...scripts,'space.js':source},patches};
}
function patch(scripts,label,patchCallback){
  assert.equal(typeof patchCallback,'function','Writing model patch callback required');
  const {operations}=patchSource(scripts['space.js'],label);
  for(const {needle,replacement}of operations)patchCallback('space.js',needle,replacement);
}
module.exports={patchSource,patchRuntime,patch,labels,descriptions};
