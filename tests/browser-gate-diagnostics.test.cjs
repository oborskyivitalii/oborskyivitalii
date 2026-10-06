'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),zlib=require('node:zlib');
const diagnostic=require('../tools/quality/browser-gate-diagnostics.cjs'),{digest}=require('../tools/quality/artifact.cjs');
const candidate='a'.repeat(40),tree='b'.repeat(40);
function inputs(){
  const parentVariant={id:'color',contract:1,fingerprint:'c'.repeat(64),baseEngine:'d'.repeat(64),effects:['ribbons','travel']};
  return Object.fromEntries(['control','adaptive'].map(label=>{
    const intervention=label==='control'?'browser-gate-trace':'browser-gate-adaptive-ribbons';
    const diagnostic={label:intervention,description:intervention,fullGate:false};
    const derivation={kind:'writing-diagnostic-intervention',intervention,description:intervention,baseArtifactDigest:'e'.repeat(64),parentArtifactDigest:'e'.repeat(64),parentVariant,
      patches:Array.from({length:label==='control'?2:7},()=>({file:'space.js',matches:1,needleSha256:'1'.repeat(64),replacementSha256:'2'.repeat(64),beforeSha256:'3'.repeat(64),afterSha256:'4'.repeat(64)})),fullGate:false};
    const fingerprint=digest(JSON.stringify({contract:1,parentEngine:parentVariant.fingerprint,intervention:derivation}));
    const visual={...parentVariant,fingerprint,diagnostic};
    return [label,{manifest:{sourceCommit:candidate,candidateCommit:candidate,sourceDirty:false,sourceTree:tree,artifactDigest:(label==='control'?'5':'6').repeat(64),components:{contract:1,engine:fingerprint,variant:visual},variant:visual,fullGate:false,diagnostic,derivation}}];
  }));
}
function trace(){
  const scheduler={hold:false,enabled:true,initialized:true,failed:false,slow:8,fast:0,tier:1,detailTier:1,costAverage:29,pending:2};
  const state={scheduler,pendingIds:[2]},events=[
    {sequence:1,time:0,kind:'installed',state},
    {sequence:2,time:32,kind:'engine-probe',probe:{kind:'browser-gate-frame',time:32,start:4,renderCost:28,slow:8,fast:0,tier:1,detailTier:1,hold:false,ribbonFaces:220,ribbonSignals:3},state},
    {sequence:3,time:33,kind:'exit',duration:29,state}
  ];
  return {installed:true,capacity:25000,recordedEvents:3,totalEvents:3,droppedEvents:0,overflow:false,completeRetention:true,pendingIds:[2],state,events};
}
test('bounded plan preserves two fresh WebKit startups and four balanced Firefox observations with all background rows',()=>{
  const groups=diagnostic.plan(),rows=groups.flatMap(group=>group.rows),firefox=rows.filter(row=>row.engine==='firefox');
  assert.equal(groups.length,6);assert.equal(rows.length,10);
  assert.deepEqual(firefox.map(row=>row.label),['control','adaptive','adaptive','control']);
  assert.equal(rows.filter(row=>row.scope==='startup').length,2);assert.equal(rows.filter(row=>row.role==='background').length,4);
  assert.ok(rows.every(row=>row.mode==='normal'&&row.width===1440&&row.trace));
  assert.ok(firefox.every(row=>row.route==='writing'&&row.theme==='dark'&&row.scope==='functional'));
  for(const group of groups.filter(group=>group.mode==='loaded'))assert.deepEqual(group.rows.map(row=>row.engine),['firefox','chromium','webkit']);
});
test('CLI rejects missing/duplicate/unknown arguments and output inside tested artifact',()=>{
  assert.equal(diagnostic.argumentsFor(['--control','control','--adaptive','adaptive','--output','results']).output,path.resolve('results'));
  assert.throws(()=>diagnostic.argumentsFor(['--control','control']),/exact/);
  assert.throws(()=>diagnostic.argumentsFor(['--control','control','--control','adaptive','--output','results']),/duplicate/);
  assert.throws(()=>diagnostic.argumentsFor(['--control','control','--adaptive','adaptive','--other','results']),/unknown/);
  assert.throws(()=>diagnostic.argumentsFor(['--control','control','--adaptive','adaptive','--output','control/results']),/cannot modify/);
});
test('private variants require exact clean source, common normal parent and independently derived fingerprints',()=>{
  assert.equal(diagnostic.validateInputs(inputs(),candidate),true);
  for(const mutate of [
    value=>value.control.manifest.sourceDirty=true,
    value=>value.adaptive.manifest.sourceTree='9'.repeat(40),
    value=>value.adaptive.manifest.derivation.parentArtifactDigest='9'.repeat(64),
    value=>value.control.manifest.fullGate=true,
    value=>value.control.manifest.derivation.patches[0].matches=0,
    value=>value.control.manifest.variant.fingerprint='8'.repeat(64)
  ]){const value=inputs();mutate(value);assert.throws(()=>diagnostic.validateInputs(value,candidate));}
  assert.throws(()=>diagnostic.validateInputs(inputs(),undefined),/exact current/);
});
test('trace validation fails closed for missing, dropped, malformed or disconnected evidence',()=>{
  assert.equal(diagnostic.validateTrace(trace()),true);
  for(const mutate of [value=>value.installed=false,value=>value.overflow=true,value=>value.completeRetention=false,value=>value.events[2].sequence=4,
    value=>value.events[1].probe.renderCost=NaN,value=>delete value.state.scheduler,value=>value.state.schedulerError={message:'getter failed'}]){
    const value=trace();mutate(value);assert.throws(()=>diagnostic.validateTrace(value));
  }
  assert.throws(()=>diagnostic.validateTrace(null),/missing/);
});
test('a fixture timeout stays failed observed data and the complete raw trace is retained without a retry',()=>{
  const output=fs.mkdtempSync(path.join(os.tmpdir(),'browser-gate-diagnostic-')),record={rows:[],infrastructureErrors:[]};
  try{
    const observation={pass:false,error:'nextPaintReady: Timeout 1500ms exceeded',errors:[],externalRequests:[],diagnosticTrace:trace()};
    const row=diagnostic.saveTrial(record,{id:'failed-startup',role:'target'},{observation,startMs:0,endMs:1500},output);
    assert.equal(row.status,'observed');assert.equal(row.observation.pass,false);assert.match(row.observation.error,/1500ms/);assert.equal(record.infrastructureErrors.length,0);
    const retained=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(output,row.diagnosticTraceFile))).toString());
    assert.deepEqual(retained.observation.diagnosticTrace,observation.diagnosticTrace);assert.equal(retained.observation.pass,false);
    const invalid=diagnostic.saveTrial(record,{id:'missing-trace'},{observation:{pass:false,error:'timeout'},startMs:0,endMs:1500},output);
    assert.equal(invalid.status,'invalid-observation');assert.equal(record.infrastructureErrors.length,1);
    assert.throws(()=>diagnostic.validateOutcome({pass:false,diagnosticTrace:trace()}),/suppressed/);
    assert.throws(()=>diagnostic.validateOutcome({pass:true,errors:[],externalRequests:[],diagnosticTrace:trace()}),/positive paint gate/);
  }finally{fs.rmSync(output,{recursive:true,force:true});}
});
test('summary reports actual draw costs separately from RAF callbacks and preserves quality/hold/pending state',()=>{
  const result=diagnostic.summarizeTrace(trace());
  assert.equal(result.drawDurationMs.max,28);assert.equal(result.callbackDurationMs.max,29);assert.equal(result.ribbonFaces.median,220);
  assert.equal(result.qualityFrames[0].slow,8);assert.equal(result.finalScheduler.pending,2);assert.deepEqual(result.finalPendingIds,[2]);assert.deepEqual(result.holdTransitions,[{time:0,hold:false,pending:2}]);
  assert.deepEqual(diagnostic.stats([]),{count:0,min:null,median:null,p95:null,max:null,values:[]});
});
test('concurrent rows retain bounded scenario overlap without claiming continuous render load',()=>{
  const result=diagnostic.loadOverlap([{role:'target',startMs:10,endMs:30},{id:'chromium',role:'background',startMs:0,endMs:20},{id:'webkit',role:'background',startMs:15,endMs:35}]);
  assert.deepEqual(result.map(row=>row.overlapMs),[10,15]);assert.ok(result.every(row=>row.scope.includes('lifespan')));
});
