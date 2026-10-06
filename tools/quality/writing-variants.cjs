'use strict';
// Private loopback diagnostic artifacts. Never alter the authored/public source.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const artifact=require('./artifact.cjs'),snapshot=require('../site/snapshot.cjs');
const flight=require('../../review/site-scroll-sync-20261004/FLIGHT-PROTOTYPE.cjs');
const descriptions={
  'no-ribbons':'Suppress ribbon scene creation/collection/custom painting; retain travel, reading styles and controls.',
  'no-canvas-draw':'Omit shape submission only; retain clearRect, projection, effects, sorting and the scene clock.',
  'thematic-off':'Omit Writing thematic objects during projection only; retain all room construction/palette work and other routes.',
  'shared-off':'Omit Writing shared objects during projection only; retain all room construction/palette work and other routes.',
  'model-prewarm':'Expose an explicit measured Writing room/palette preparation before navigation; include its cost in the result.',
  'edge-bypass':'Do not install edge-scroll hooks; retain content-flight preference, travel, styles and ordinary header navigation.'
};
const labels=Object.keys(descriptions);
function replaceOnce(source,needle,replacement,file,patches){
  const matches=source.split(needle).length-1;
  assert.equal(matches,1,'diagnostic patch must match exactly once: '+file+' '+needle.slice(0,70));
  const result=source.replace(needle,()=>replacement);
  patches.push({file,matches,needleSha256:artifact.digest(needle),replacementSha256:artifact.digest(replacement),beforeSha256:artifact.digest(source),afterSha256:artifact.digest(result)});
  return result;
}
function patchRuntime(scripts,label){
  assert.ok(labels.includes(label),'unsupported Writing intervention');
  const result={...scripts},patches=[];
  const patch=(file,needle,replacement)=>{result[file]=replaceOnce(result[file],needle,replacement,file,patches);};
  if(label==='no-ribbons')patch('space.js','const sceneEffects=effects?.scene?.(api);','const sceneEffects=null; // Private Writing diagnostic: ribbons omitted.');
  if(label==='no-canvas-draw')patch('space.js','paintShapes(ctx,shapes,colors,sceneEffects?.paint);','void shapes; // Private Writing diagnostic: Canvas shape submission omitted.');
  if(label==='thematic-off'||label==='shared-off'){
    const family=label==='thematic-off'?'thematic':'shared';
    patch('space.js','return {faces,lines,objects};','return {faces,lines,objects,__writingDiagnosticRoute:page};');
    patch('space.js','for(const o of world.objects) {','for(const o of world.objects) {\n      if(world.__writingDiagnosticRoute==="writing"&&o.family==="'+family+'")continue; // Private projection-only ablation.');
  }
  if(label==='model-prewarm'){
    patch('space.js','window.SiteScene={',`window.__writingDiagnostic={prepareWriting(){
    if(!initialized||failed||journey||page!=="research")throw Error("Writing diagnostic prewarm requires settled Research");
    const start=clock();roomFor("writing");const end=clock();
    diagnostic("diagnostic-preparation",{intervention:"model-prewarm",start,end,duration:end-start});
    return {start,end,duration:end-start};
  }};
  window.SiteScene={`);
  }
  if(label==='edge-bypass'){
    const fn='('+flight.installEndScroll.toString()+')';
    const args='('+flight.endScrollGate.toString()+','+flight.atPageEnd.toString()+','+flight.atPageStart.toString()+')';
    // Retain the serialized function/argument expressions without invoking them.
    patch('navigation.js',fn+args,`(${fn},[${args.slice(1,-1)}]); // Private Writing diagnostic: edge hooks not installed.`);
  }
  return {scripts:result,patches};
}
function write(dir,name,bytes){const file=path.join(dir,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}
function derive(parentDir,targetDir,label){
  assert.notEqual(path.resolve(parentDir),path.resolve(targetDir),'diagnostic cannot overwrite its control');
  const parent=JSON.parse(fs.readFileSync(path.join(parentDir,'artifact.json'))),source=path.join(parentDir,'public');
  artifact.verify(source,parent);assert.equal(parent.sourceDirty,false,'control source must be clean');
  assert.equal(parent.sourceCommit,parent.candidateCommit,'control candidate identity');
  assert.match(parent.sourceCommit,/^[a-f0-9]{40}$/);assert.match(parent.sourceTree,/^[a-f0-9]{40}$/);
  const prior=JSON.parse(fs.readFileSync(path.join(source,'site-revision.json')));
  assert.equal(prior.variant?.id,'color','interventions require current Color');
  assert.ok(!prior.variant.diagnostic,'interventions derive only from an unchanged Color control');
  const authored=Object.fromEntries(snapshot.runtimeFiles.map(name=>[name,fs.readFileSync(path.join(source,name),'utf8')]));
  const {scripts,patches}=patchRuntime(authored,label);
  const intervention={kind:'writing-diagnostic-intervention',intervention:label,description:descriptions[label],baseArtifactDigest:parent.artifactDigest,parentArtifactDigest:parent.artifactDigest,parentVariant:prior.variant,patches,fullGate:false};
  const fingerprint=artifact.digest(JSON.stringify({contract:1,parentEngine:prior.engine,intervention}));
  const diagnostic={label,description:descriptions[label],fullGate:false};
  const variant={...prior.variant,fingerprint,diagnostic};
  if(label==='no-ribbons')variant.effects=variant.effects.filter(effect=>effect!=='ribbons');
  const versions=Object.fromEntries(snapshot.routes.map(id=>[id,artifact.digest(prior.routes[id].version+':'+fingerprint)]));
  const render=html=>{
    assert.equal(html.split('name="site-variant" content="color"').length-1,1,'unchanged Color route required');
    let result=html.replaceAll(prior.engine,fingerprint);
    for(const id of snapshot.routes)result=result.replaceAll(prior.routes[id].version,versions[id]);
    return result.replace('<head>','<head>\n<meta name="writing-diagnostic" content="'+label+'">');
  };
  const aliases=Object.fromEntries(snapshot.routes.map(id=>[id,render(fs.readFileSync(path.join(source,id+'.html'),'utf8'))]));
  const pages=Object.fromEntries(snapshot.routes.map(id=>[id,render(fs.readFileSync(path.join(source,prior.routes[id].url),'utf8'))]));
  fs.rmSync(targetDir,{recursive:true,force:true});fs.cpSync(parentDir,targetDir,{recursive:true});
  const publicDir=path.join(targetDir,'public');
  // Keep separately content-addressed analytics, if present; replace engine files.
  for(const row of artifact.entries(path.join(publicDir,'runtime')))if(snapshot.runtimeFiles.includes(path.basename(row.path)))fs.rmSync(path.join(publicDir,'runtime',row.path));
  for(const name of fs.readdirSync(path.join(publicDir,'runtime')))if(!fs.readdirSync(path.join(publicDir,'runtime',name)).length)fs.rmdirSync(path.join(publicDir,'runtime',name));
  fs.rmSync(path.join(publicDir,'snapshots'),{recursive:true});
  for(const [name,bytes]of Object.entries(scripts)){write(publicDir,name,bytes);write(publicDir,'runtime/'+fingerprint+'/'+name,bytes);}
  const revision={...prior,engine:fingerprint,variant,diagnostic,routes:{}};
  for(const id of snapshot.routes){
    const url='snapshots/'+versions[id]+'/'+id+'.html';write(publicDir,id+'.html',aliases[id]);write(publicDir,url,pages[id]);
    revision.routes[id]={...prior.routes[id],version:versions[id],url,sha256:artifact.digest(pages[id])};
  }
  revision.content=artifact.digest(JSON.stringify(versions));write(publicDir,'site-revision.json',JSON.stringify(revision,null,2)+'\n');
  const manifest={...parent,...artifact.manifest(publicDir),variant,diagnostic,derivation:intervention,fullGate:false};
  manifest.components=snapshot.verify(publicDir,manifest);artifact.verify(publicDir,manifest);
  write(targetDir,'artifact.json',JSON.stringify(manifest,null,2)+'\n');write(targetDir,'sizes.json',JSON.stringify(artifact.checkSize(publicDir),null,2)+'\n');
  return {directory:targetDir,publicDir,manifest};
}
function build(inputRoot){
  const baseDir=path.join(inputRoot,'current-base'),colorDir=path.join(inputRoot,'current-color');
  const base=JSON.parse(fs.readFileSync(path.join(baseDir,'artifact.json'))),color=JSON.parse(fs.readFileSync(path.join(colorDir,'artifact.json')));
  artifact.verify(path.join(baseDir,'public'),base);artifact.verify(path.join(colorDir,'public'),color);
  assert.equal(color.derivation?.baseArtifactDigest,base.artifactDigest,'matched current base/Color control');
  assert.equal(color.sourceCommit,base.sourceCommit);assert.equal(color.sourceTree,base.sourceTree);
  return {labels,inputs:Object.fromEntries(labels.map(label=>[label,derive(colorDir,path.join(inputRoot,label),label)])),deferred:[
    {label:'archive-block',reason:'Requires matched control archive dimensions and exact preserved range/focus; do not substitute guessed heights.'},
    {label:'archive-bypass',reason:'Requires identical initial filter/URL/focus/visibility state; removing Archive.mount changes layout and is not an isolated control.'}
  ]};
}
if(require.main===module){const result=build(path.resolve(process.argv[2]));console.log(JSON.stringify({labels:result.labels,deferred:result.deferred}));}
module.exports={build,derive,patchRuntime,labels,descriptions};
