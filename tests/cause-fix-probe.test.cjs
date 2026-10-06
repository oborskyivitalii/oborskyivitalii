'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const variants=require('../tools/quality/writing-variants.cjs'),{validateInput}=require('../tools/quality/cause-probe.cjs'),{validatePair}=require('../tools/quality/research-pair-probe.cjs');
const color=require('../tools/staging/color.cjs'),root=path.resolve(__dirname,'..');
const source=color.runtime(color.authoredEffects()).code+'\n'+fs.readFileSync(path.join(root,'docs/space.js'),'utf8');
const scripts={'space.js':source,'styles.css':fs.readFileSync(path.join(root,'docs/styles.css'),'utf8')};
test('cold native interventions are separate from the dated Writing screen and each changes only its declared factor',()=>{
  assert.equal(variants.labels.length,13);assert.equal(variants.coldNativeLabels.length,4);
  const trace=variants.patchRuntime(scripts,'browser-gate-trace');
  for(const label of variants.coldNativeLabels){
    const result=variants.patchRuntime(scripts,label);new vm.Script(result.scripts['space.js']);
    assert.equal(result.patches.length,label==='cold-no-air'?5:3);assert.deepEqual(result.patches.slice(0,2),trace.patches);
    assert.ok(result.patches.every(p=>p.matches===1));assert.equal(source.includes('__browserGateScheduler'),false);
  }
});
test('normal source pairs reject dirty, stale or diagnostic editions rather than accepting a private ablation',()=>{
  const candidate='a'.repeat(40),reference='b'.repeat(40),normal={sourceCommit:candidate,candidateCommit:candidate,sourceTree:'c'.repeat(40),sourceDirty:false,variant:{id:'color',contract:1,fingerprint:'d'.repeat(64)}};
  const inputs={candidate:{manifest:normal},reference:{manifest:{...normal,sourceCommit:reference,candidateCommit:reference}}};validatePair(inputs,candidate,reference);
  for(const patch of [{sourceDirty:true},{sourceCommit:reference},{candidateCommit:reference},{variant:{...normal.variant,diagnostic:{label:'cold-no-paint'}}},{diagnostic:{label:'cold-no-paint'}},{fullGate:false}])assert.throws(()=>validatePair({...inputs,candidate:{manifest:{...normal,...patch}}},candidate,reference));
  assert.throws(()=>validatePair(inputs,candidate,candidate));
});
test('cold private inputs require an explicitly declared matching intervention and exact normal parent',()=>{
  const candidate='a'.repeat(40),variant={id:'color',contract:1,fingerprint:'c'.repeat(64)},normal={sourceCommit:candidate,candidateCommit:candidate,sourceTree:'b'.repeat(40),sourceDirty:false,artifactDigest:'d'.repeat(64),variant};
  for(const label of variants.coldNativeLabels){
    const privateInput={...normal,artifactDigest:'e'.repeat(64),fullGate:false,diagnostic:{label},derivation:{parentArtifactDigest:normal.artifactDigest,parentVariant:variant}};
    validateInput(normal,privateInput,candidate,label);assert.throws(()=>validateInput(normal,privateInput,candidate));
    assert.throws(()=>validateInput(normal,{...privateInput,derivation:{...privateInput.derivation,parentArtifactDigest:'f'.repeat(64)}},candidate,label));
  }
});
