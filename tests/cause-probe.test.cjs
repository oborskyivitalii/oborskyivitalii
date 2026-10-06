'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{validateInput,lighthouseEvidence}=require('../tools/quality/cause-probe.cjs');
const candidate='a'.repeat(40),variant={id:'color',contract:1,fingerprint:'c'.repeat(64)};
const normal={sourceCommit:candidate,candidateCommit:candidate,sourceTree:'b'.repeat(40),sourceDirty:false,artifactDigest:'d'.repeat(64),variant};
const control={...normal,artifactDigest:'e'.repeat(64),fullGate:false,diagnostic:{label:'browser-gate-trace'},derivation:{parentArtifactDigest:normal.artifactDigest,parentVariant:variant}};
test('causal inputs reject stale source, dirty artifacts and an unrelated normal Color parent',()=>{
  validateInput(normal,control,candidate);
  for(const patch of [{sourceCommit:'f'.repeat(40)},{sourceDirty:true},{sourceTree:'f'.repeat(40)},{artifactDigest:normal.artifactDigest},{fullGate:true},{derivation:{...control.derivation,parentArtifactDigest:'f'.repeat(64)}}])assert.throws(()=>validateInput(normal,{...control,...patch},candidate));
});
test('Lighthouse attribution requires original network and CPU samples and keeps simulated mobile settings',()=>{
  const result={lhr:{configSettings:{formFactor:'mobile',throttlingMethod:'simulate'},audits:{'total-blocking-time':{numericValue:327}}},artifacts:{Trace:{traceEvents:[{name:'ProfileChunk',args:{data:{cpuProfile:{samples:[1]}}}}]},DevtoolsLog:[{}]}};
  assert.equal(lighthouseEvidence(result).trace,result.artifacts.Trace);
  for(const patch of [{Trace:{traceEvents:[]}},{Trace:{traceEvents:[{name:'RunTask'}]}},{Trace:{traceEvents:[{name:'ProfileChunk'}]}},{DevtoolsLog:[]}])assert.throws(()=>lighthouseEvidence({...result,artifacts:{...result.artifacts,...patch}}));
  assert.throws(()=>lighthouseEvidence({...result,lhr:{...result.lhr,configSettings:{formFactor:'desktop',throttlingMethod:'simulate'}}}));
  assert.throws(()=>lighthouseEvidence({...result,lhr:{...result.lhr,configSettings:{formFactor:'mobile',throttlingMethod:'provided'}}}));
});
