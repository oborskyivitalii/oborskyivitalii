'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const diagnostic=require('../tools/quality/writing-variants.cjs'),artifact=require('../tools/quality/artifact.cjs'),snapshot=require('../tools/site/snapshot.cjs'),color=require('../tools/staging/color.cjs');
const root=path.resolve(__dirname,'..'),sourceCommit='a'.repeat(40),sourceTree='b'.repeat(40);
function controls(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'writing-variants-')),base=path.join(dir,'current-base');
  fs.mkdirSync(base);fs.cpSync(path.join(root,'docs'),path.join(base,'public'),{recursive:true});
  const manifest={schema:1,sourceCommit,sourceTree,candidateCommit:sourceCommit,sourceDirty:false,...artifact.manifest(path.join(base,'public'))};
  manifest.components=snapshot.verify(path.join(base,'public'),manifest);fs.writeFileSync(path.join(base,'artifact.json'),JSON.stringify(manifest));
  fs.cpSync(base,path.join(dir,'current-color'),{recursive:true});color.build(path.join(dir,'current-color'));
  return dir;
}
function api(source){const context={window:{SiteEffects:{}},module:{exports:{}}};vm.runInNewContext(source,context);return context.module.exports;}
function browser(source){
  const pending=[],events=[],dataset={},calls={clear:0,fill:0,stroke:0};
  const ctx=Object.fromEntries(['setTransform','clearRect','beginPath','moveTo','lineTo','stroke','fill','closePath','quadraticCurveTo'].map(name=>[name,()=>{if(name==='clearRect')calls.clear++;if(name==='fill')calls.fill++;if(name==='stroke')calls.stroke++;}]));
  ctx.createLinearGradient=()=>({addColorStop(){}});
  const canvas={parentElement:{dataset,style:{setProperty(){}}},getContext:()=>ctx},button={setAttribute(){},addEventListener(){}};
  const window={performance:{now:()=>12},innerWidth:390,innerHeight:844,devicePixelRatio:3,scrollY:0,matchMedia:q=>({matches:q.includes('max-width'),addEventListener(){}}),requestAnimationFrame:fn=>{pending.push(fn);return pending.length;},cancelAnimationFrame(){},addEventListener(){},getComputedStyle:()=>({getPropertyValue:key=>({'--accent':'#075d7b','--systems':'#895710','--paper':'#f8f7f3','--scene-sheet':'#fffefa'})[key]}),SiteEngineProbe:event=>events.push(event)};
  const document={body:{dataset:{page:'research'}},documentElement:{scrollHeight:5000,dataset:{theme:'dark'}},getElementById:id=>id==='space-canvas'?canvas:id==='space-motion'?button:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};
  vm.runInNewContext(source,{window,document,localStorage:{getItem:()=>null},module:{exports:{}}});
  return {window,dataset,events,calls,frame(){const jobs=pending.splice(0);for(const job of jobs)job(40);}};
}
test('private Writing packages retain source identities and verify fresh immutable runtime/snapshots',()=>{
  const dir=controls();
  try{
    const parent=JSON.parse(fs.readFileSync(path.join(dir,'current-color','artifact.json'))),unchanged=parent.artifactDigest;
    const result=diagnostic.build(dir);assert.equal(result.labels.length,13);assert.deepEqual(result.deferred.map(row=>row.label),['archive-bypass']);
    for(const label of result.labels){
      const {manifest,publicDir}=result.inputs[label];artifact.verify(publicDir,manifest);snapshot.verify(publicDir,manifest);
      assert.equal(manifest.sourceCommit,sourceCommit);assert.equal(manifest.sourceTree,sourceTree);assert.equal(manifest.sourceDirty,false);
      assert.equal(manifest.variant.id,'color');assert.equal(manifest.variant.diagnostic.label,label);assert.equal(manifest.fullGate,false);
      assert.equal(manifest.derivation.kind,'writing-diagnostic-intervention');assert.equal(manifest.derivation.baseArtifactDigest,unchanged);assert.equal(manifest.derivation.parentArtifactDigest,unchanged);assert.equal(manifest.derivation.intervention,label);
      assert.notEqual(manifest.artifactDigest,unchanged);assert.notEqual(manifest.variant.fingerprint,parent.variant.fingerprint);
      assert.ok(manifest.derivation.patches.length);assert.ok(manifest.derivation.patches.every(row=>row.matches===1&&/^[a-f0-9]{64}$/.test(row.afterSha256)));
      for(const file of ['space.js','navigation.js'])new vm.Script(fs.readFileSync(path.join(publicDir,file),'utf8'));
      for(const route of snapshot.routes)assert.match(fs.readFileSync(path.join(publicDir,route+'.html'),'utf8'),new RegExp('name="writing-diagnostic" content="'+label+'"'));
    }
    assert.equal(artifact.manifest(path.join(dir,'current-color','public')).artifactDigest,unchanged,'control remains unchanged');
    const again=diagnostic.build(dir);for(const label of result.labels)assert.equal(again.inputs[label].manifest.artifactDigest,result.inputs[label].manifest.artifactDigest,'deterministic intervention '+label);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('family intervention preserves construction and all Research projection while omitting only the selected Writing family',()=>{
  const source=fs.readFileSync(path.join(root,'docs','space.js'),'utf8'),scripts=Object.fromEntries(snapshot.runtimeFiles.map(file=>[file,fs.readFileSync(path.join(root,'docs',file),'utf8')]));
  const control=api(source);
  for(const label of ['thematic-off','shared-off']){
    const altered=api(diagnostic.patchRuntime(scripts,label).scripts['space.js']),family=label==='thematic-off'?'thematic':'shared';
    for(const route of ['writing','research']){
      const original=control.worldFor(route,true),world=altered.worldFor(route,true);
      assert.equal(world.objects.length,252);assert.equal(world.faces.length,original.faces.length);assert.equal(world.lines.length,original.lines.length);
      const pose=control.poses[control.initialPoses[route]],before=control.projectedWorld(original,pose,390,844,0,0,true,false),after=altered.projectedWorld(world,pose,390,844,0,0,true,false);
      if(route==='research')assert.equal(JSON.stringify(after),JSON.stringify(before),'other route remains identical');
      else {const names=new Set(world.objects.filter(object=>object.family===family).map(object=>object.name));assert.ok(before.some(shape=>names.has(shape.object)),'positive selected-family control');assert.ok(!after.some(shape=>names.has(shape.object)));assert.equal(JSON.stringify(after),JSON.stringify(before.filter(shape=>!names.has(shape.object))));}
    }
  }
});
test('no-canvas retains actual diagnostic frames/geometry/effects; prewarm explicitly prepares one cached Writing model',()=>{
  const dir=controls();
  try{
    const results=diagnostic.build(dir),read=label=>fs.readFileSync(path.join(results.inputs[label].publicDir,'space.js'),'utf8');
    const frame=browser(read('no-canvas-draw'));frame.frame();assert.equal(frame.calls.clear,1);assert.equal(frame.calls.fill,0);assert.equal(frame.calls.stroke,0);assert.equal(frame.dataset.ready,'true');assert.ok(Number(frame.dataset.ribbonFaces)>0);assert.ok(frame.events.some(event=>event.kind==='model'&&event.route==='research'));
    const prewarm=browser(read('model-prewarm'));const timing=prewarm.window.__writingDiagnostic.prepareWriting();assert.deepEqual(Object.keys(timing),['start','end','duration']);assert.ok(Number.isFinite(timing.duration));
    assert.equal(prewarm.events.filter(event=>event.kind==='model'&&event.route==='writing').length,1);assert.equal(prewarm.events.filter(event=>event.kind==='diagnostic-preparation').length,1);
    prewarm.window.__writingDiagnostic.prepareWriting();assert.equal(prewarm.events.filter(event=>event.kind==='model'&&event.route==='writing').length,1,'prewarm keeps the bounded cache');
    const noRibbon=browser(read('no-ribbons'));noRibbon.frame();assert.equal(noRibbon.dataset.ribbonFaces,undefined);assert.ok(noRibbon.calls.fill>0,'thematic/shared Canvas remains');
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('edge bypass retains serialized controls but does not register their hooks; patch drift is rejected',()=>{
  const parts=color.authoredEffects(),scripts={...color.runtime(parts)},nav=scripts.controls;
  const patched=diagnostic.patchRuntime({'navigation.js':nav},'edge-bypass').scripts['navigation.js'];
  const load=source=>{const callbacks=[];vm.runInNewContext(source,{document:{readyState:'loading',addEventListener:(name,fn)=>{assert.equal(name,'DOMContentLoaded');callbacks.push(fn);}}});return callbacks.length;};
  assert.equal(load(nav),2);assert.equal(load(patched),1,'content preference still initializes, edge hooks do not');
  assert.throws(()=>diagnostic.patchRuntime({'space.js':'no matching source'},'no-ribbons'),/exactly once/);
  assert.throws(()=>diagnostic.patchRuntime({'space.js':'const sceneEffects=effects?.scene?.(api);const sceneEffects=effects?.scene?.(api);'},'no-ribbons'),/exactly once/);
});
