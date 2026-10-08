'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),zlib=require('node:zlib');
const {validateInput,lighthouseEvidence,validateWritingInputs,deriveWritingInputs,scopeContract,evidenceComplete,writingLabels,writing}=require('../tools/quality/cause-probe.cjs');
const candidate='a'.repeat(40),variant={id:'color',contract:1,fingerprint:'c'.repeat(64)};
const normal={sourceCommit:candidate,candidateCommit:candidate,sourceTree:'b'.repeat(40),sourceDirty:false,artifactDigest:'d'.repeat(64),variant};
const control={...normal,artifactDigest:'e'.repeat(64),fullGate:false,diagnostic:{label:'browser-gate-trace'},derivation:{parentArtifactDigest:normal.artifactDigest,parentVariant:variant}};
test('Writing workflow authorization evaluates its actual bounded label and source guard',()=>{
  const source=fs.readFileSync(path.resolve(__dirname,'../.github/workflows/site-cause-probe.yml'),'utf8');
  const block=source.match(/^  writing-attribution:\n[\s\S]*?(?=^  [a-z][a-z-]*:\n|$(?![\s\S]))/m)?.[0];
  assert.ok(block,'missing Writing attribution job');
  const folded=block.match(/^ {4}if: >-\n((?: {6}.+\n)+)/m)?.[1];
  assert.ok(folded,'missing folded authorization condition');
  const expression=folded.trim().split('\n').map(line=>line.trim()).join(' ');
  const allowedVariables=new Set(['github.event_name','github.repository','github.event.label.name',
    'github.event.pull_request.number','github.event.pull_request.head.ref',
    'github.event.pull_request.head.repo.full_name']);
  // Reuse the maintained equality-clause evaluator, allowing only a parenthesized
  // OR group within the top-level AND. No expression executes as JavaScript.
  function selected(condition,context) {
    const readVariable=key=>{
      assert.ok(allowedVariables.has(key),'unsupported authorization variable');
      return key.split('.').reduce((value,part)=>value?.[part],context);
    };
    const clauses=condition.split(/\s*&&\s*/).map(group=>{
      if(group.startsWith('(')&&group.endsWith(')')){
        group=group.slice(1,-1).trim();
      }else{
        assert.ok(!group.includes('||'),'OR must be parenthesized');
      }
      return group.split(/\s*\|\|\s*/).map(clause=>{
        const parsed=clause.match(/^([\w.]+) == (?:'([^']*)'|(\d+)|([\w.]+))$/);
        assert.ok(parsed,'unsupported authorization condition');
        const [,left,string,number,right]=parsed;
        const expected=string!==undefined?string:number!==undefined?Number(number):readVariable(right);
        return readVariable(left)===expected;
      });
    });
    return clauses.every(group=>group.some(Boolean));
  }
  const context={github:{event_name:'pull_request',repository:'oborskyivitalii/oborskyivitalii',
    event:{label:{name:'site-writing-cause-evidence'},pull_request:{number:999,
      head:{ref:'work/issue45-writing-attribution-20261008',repo:{full_name:'oborskyivitalii/oborskyivitalii'}}}}}};
  assert.equal(selected(expression,context),true);
  const historical=structuredClone(context);
  historical.github.event.pull_request.number=47;
  historical.github.event.pull_request.head.ref='historical-branch';
  assert.equal(selected(expression,historical),true);
  for(const original of [context,historical]){
    for(const mutate of [
      value=>value.github.event_name='workflow_dispatch',
      value=>value.github.event_name='push',
      value=>value.github.event_name='pull_request_target',
      value=>value.github.event.label.name='performance',
      value=>value.github.event.pull_request.head.repo.full_name='other/fork',
      value=>{
        value.github.event.pull_request.number=999;
        value.github.event.pull_request.head.ref='other-branch';
      }
    ]){
      const denied=structuredClone(original);
      mutate(denied);
      assert.equal(selected(expression,denied),false,'unrelated event or source must remain denied');
    }
  }
  for(const invalid of [expression.replace(' == ',' != '),expression+' && contains(github.repository, \'other\')',
    expression+' && github.unknown == \'value\'',expression+' || github.event_name == \'push\'']){
    assert.throws(()=>selected(invalid,context),'unsupported grammar must fail closed');
  }
  const header=source.slice(0,source.indexOf('\njobs:'));
  assert.match(header,/^ {2}pull_request:\n {4}types: \[labeled\]$/m);
  assert.doesNotMatch(header,/pull_request_target|^ {2}push:|synchronize|opened|reopened|ready_for_review/m);
  assert.match(header,/^permissions:\n {2}contents: read\n/m);
  assert.doesNotMatch(source,/^\s+[a-z-]+: write$/m);
  assert.match(block,/SITE_CANDIDATE_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(block,/ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(block,/test "\$\(git rev-parse HEAD\)" = "\$SITE_CANDIDATE_SHA"/);
});
test('causal inputs reject stale source, dirty artifacts and an unrelated normal Color parent',()=>{
  validateInput(normal,control,candidate);
  for(const patch of [{sourceCommit:'f'.repeat(40)},{sourceDirty:true},{sourceTree:'f'.repeat(40)},{artifactDigest:normal.artifactDigest},{fullGate:true},{derivation:{...control.derivation,parentArtifactDigest:'f'.repeat(64)}}])assert.throws(()=>validateInput(normal,{...control,...patch},candidate));
});
test('Lighthouse attribution requires original network and CPU samples and keeps simulated mobile settings',()=>{
  const result={lhr:{configSettings:{formFactor:'mobile',throttlingMethod:'simulate'},audits:{'total-blocking-time':{numericValue:327}}},artifacts:{Trace:{traceEvents:[{name:'ProfileChunk',args:{data:{cpuProfile:{samples:[1]}}}}]},DevtoolsLog:[{}]}};
  assert.equal(lighthouseEvidence(result).trace,result.artifacts.Trace);
  for(const patch of [{Trace:{traceEvents:[]}},{Trace:{traceEvents:[{name:'RunTask'}]}},{Trace:{traceEvents:[{name:'ProfileChunk'}]}},{Trace:{traceEvents:[{name:'ProfileChunk',args:{data:{cpuProfile:{samples:[]}}}}]}},{Trace:{traceEvents:[{name:'ProfileChunk',args:{data:{cpuProfile:{samples:'1'}}}}]}},{DevtoolsLog:[]}])assert.throws(()=>lighthouseEvidence({...result,artifacts:{...result.artifacts,...patch}}));
  assert.throws(()=>lighthouseEvidence({...result,lhr:{...result.lhr,configSettings:{formFactor:'desktop',throttlingMethod:'simulate'}}}));
  assert.throws(()=>lighthouseEvidence({...result,lhr:{...result.lhr,configSettings:{formFactor:'mobile',throttlingMethod:'provided'}}}));
});
function writingFixture(){
  return Object.fromEntries(writingLabels.map((label,index)=>{
    const diagnostic={label,fullGate:false};
    const manifest=index?{...normal,artifactDigest:String(index).repeat(64),fullGate:false,diagnostic,variant:{...variant,diagnostic},derivation:{parentArtifactDigest:normal.artifactDigest,parentVariant:variant,fullGate:false}}:normal;
    return [label,{directory:'/private/'+label,publicDir:'/private/'+label+'/public',manifest}];
  }));
}
test('Writing attribution derives only three supported private same-source Color controls',t=>{
  const fixture=writingFixture();validateWritingInputs(fixture,candidate);
  for(const patch of [{sourceCommit:'f'.repeat(40)},{sourceDirty:true},{sourceTree:'f'.repeat(40)},{fullGate:true},{artifactDigest:normal.artifactDigest},{diagnostic:{label:'shared-off',fullGate:false}},{variant:{...variant,diagnostic:{label:'no-ribbons',fullGate:true}}},{derivation:{...fixture['no-ribbons'].manifest.derivation,parentArtifactDigest:'f'.repeat(64)}},{derivation:{...fixture['no-ribbons'].manifest.derivation,parentVariant:{...variant,fingerprint:'f'.repeat(64)}}}]){
    assert.throws(()=>validateWritingInputs({...fixture,'no-ribbons':{...fixture['no-ribbons'],manifest:{...fixture['no-ribbons'].manifest,...patch}}},candidate));
  }
  assert.throws(()=>validateWritingInputs({...fixture,'shared-off':fixture['thematic-off']},candidate));
  const missing={...fixture};delete missing['thematic-off'];assert.throws(()=>validateWritingInputs(missing,candidate));
  const parents={color:{directory:'/tested/color',publicDir:'/tested/color/public',manifest:normal},control:{directory:'/tested/control',publicDir:'/tested/control/public',manifest:control}},calls=[];
  const derive=(parent,target,label)=>{calls.push({parent,target,label});return {...fixture[label],directory:target,publicDir:target+'/public'};};
  const result=deriveWritingInputs(parents,'/tested/color','/evidence/writing',candidate,derive);
  assert.equal(result.color,parents.color);assert.deepEqual(Object.keys(result),writingLabels);
  assert.deepEqual(calls,writingLabels.slice(1).map(label=>({parent:'/tested/color',target:'/evidence/writing/inputs/'+label,label})));
  for(const output of ['/tested/color','/tested/color/private','/tested','/tested/control'])assert.throws(()=>deriveWritingInputs(parents,'/tested/color',output,candidate,derive));
  assert.throws(()=>deriveWritingInputs(parents,'/different/color','/evidence/writing',candidate,derive));
  assert.equal(calls.length,3,'invalid output never derives into a tested package');
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'writing-inputs-'));t.after(()=>fs.rmSync(temporary,{recursive:true,force:true}));
  const color=path.join(temporary,'color'),controlDir=path.join(temporary,'control');fs.mkdirSync(color);fs.mkdirSync(controlDir);
  const actualParents={color:{...parents.color,directory:color},control:{...parents.control,directory:controlDir}};
  const alias=path.join(temporary,'alias');fs.symlinkSync(color,alias,'dir');
  const linkedInputs=path.join(temporary,'linked-inputs');fs.mkdirSync(linkedInputs);fs.symlinkSync(color,path.join(linkedInputs,'inputs'),'dir');
  const linkedTarget=path.join(temporary,'linked-target');fs.mkdirSync(path.join(linkedTarget,'inputs'),{recursive:true});fs.symlinkSync(controlDir,path.join(linkedTarget,'inputs','thematic-off'),'dir');
  for(const output of [alias,linkedInputs,linkedTarget,path.resolve(__dirname,'../site/private-cause'),path.resolve(__dirname,'../docs/private-cause')])assert.throws(()=>deriveWritingInputs(actualParents,color,output,candidate,derive));
  assert.equal(calls.length,3,'all physical destinations are checked before any copy/removal');
});
function writingResult(url,missingSamples){
  const sample={name:'ProfileChunk',args:{data:{cpuProfile:{nodes:[{id:1,callFrame:{functionName:'frame',url:url.replace('/writing.html','/space.js')}}],samples:[1]}}}};
  return {lhr:{lighthouseVersion:'test',configSettings:{formFactor:'mobile',throttlingMethod:'simulate'},audits:{'total-blocking-time':{numericValue:900},'largest-contentful-paint':{numericValue:2100}}},artifacts:{Trace:{traceEvents:[missingSamples?{name:'RunTask'}:sample]},DevtoolsLog:[{method:'Network.requestWillBeSent',params:{request:{url}}}]}};
}
function writingTrialFixture(t,failure){
  const output=fs.mkdtempSync(path.join(os.tmpdir(),'writing-cause-'));t.after(()=>fs.rmSync(output,{recursive:true,force:true}));
  const fixture={output,failure,invalidLabel:failure?'no-canvas-draw':null,record:{fullGate:false,performanceAcceptance:false,complete:false,pass:false,rows:[],errors:[]},launches:[],requests:[],results:new Map(),active:0,killed:0};
  fixture.dependencies={chromePath:'/test/chromium',launcher:{async launch(options){
    assert.equal(fixture.active,0,'fresh processes run sequentially');fixture.launches.push(options);const index=fixture.launches.length;
    if(failure==='launch'&&index===3)throw Error('launch failed');fixture.active++;
    return {port:8000+index,async kill(){fixture.killed++;if(failure==='cleanup'&&index===3)throw Error('cleanup failed');fixture.active--;}};
  }},async lighthouse(url,flags){
    const label=new URL(url).pathname.split('/')[1];fixture.requests.push({label,url,flags});
    if(failure==='lighthouse'&&label===fixture.invalidLabel)throw Error('lighthouse failed');
    const result=writingResult(url,failure==='samples'&&label===fixture.invalidLabel);fixture.results.set(label,result);return result;
  }};
  return fixture;
}
function assertWritingProcesses({failure,invalidLabel,launches,killed,active,requests}){
  assert.equal(launches.length,failure==='cleanup'?3:4);assert.equal(killed,failure==='launch'||failure==='cleanup'?3:4);assert.equal(active,failure==='cleanup'?1:0);
  const expected=failure==='launch'?writingLabels.filter(label=>label!==invalidLabel):failure==='cleanup'?writingLabels.slice(0,3):writingLabels;
  assert.deepEqual(requests.map(row=>row.label),expected);
  for(const row of requests){assert.equal(row.url,'http://127.0.0.1:1234/'+row.label+'/writing.html');assert.deepEqual(row.flags,{port:8001+writingLabels.indexOf(row.label),output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices'],additionalTraceCategories:['disabled-by-default-v8.cpu_profiler']});}
  for(const options of launches)assert.deepEqual(options,{chromePath:'/test/chromium',chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']});
}
function assertWritingRawRows({failure,invalidLabel,record,results,output}){
  for(const row of record.rows){
    assert.equal(row.evidenceValid,!(failure==='samples'&&row.label===invalidLabel));assert.equal(row.run,1);assert.equal(row.fullGate,false);assert.equal(row.performanceAcceptance,false);
    const result=results.get(row.label);
    for(const [key,raw]of [['lhr',result.lhr],['trace',result.artifacts.Trace],['devtoolsLog',result.artifacts.DevtoolsLog]]){
      assert.deepEqual(JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(output,row[key].file)))),raw);
      assert.equal(row[key].bytes,fs.statSync(path.join(output,row[key].file)).size);assert.match(row[key].sha256,/^[a-f0-9]{64}$/);
    }
  }
}
function assertWritingCompletion({failure,invalidLabel,record,output}){
  const rows=['launch','lighthouse','cleanup'].includes(failure)?3:4;
  assert.equal(record.rows.length,rows);assert.equal(record.errors.length,failure?1:0);
  assert.equal(evidenceComplete('writing',record),failure===null,'900ms TBT collects evidence without accepting performance');
  const saved=JSON.parse(fs.readFileSync(path.join(output,'cause.json'),'utf8'));
  assert.equal(saved.rows.length,rows);assert.equal(saved.fullGate,false);assert.equal(saved.performanceAcceptance,false);
  if(failure){assert.equal(saved.errors[0].label,invalidLabel);assert.equal(saved.errors[0].phase,failure==='samples'?'validation':failure);}
  if(failure==='cleanup')assert.deepEqual(saved.unattempted,[{label:'thematic-off',run:1,reason:'previous browser cleanup failed'}]);
}
test('Writing CPU attribution runs one fresh trial per input and retains raw failures before validation',async t=>{
  for(const failure of [null,'samples','launch','lighthouse','cleanup']){
    const fixture=writingTrialFixture(t,failure);
    const run=writing(writingFixture(),'http://127.0.0.1:1234',fixture.output,fixture.record,fixture.dependencies);
    if(failure==='cleanup')await assert.rejects(run,/cleanup failed/);else await run;
    assertWritingProcesses(fixture);assertWritingRawRows(fixture);assertWritingCompletion(fixture);
  }
});
test('cause scope counts preserve Research and WebKit while Writing requires all four distinct evidence rows',()=>{
  assert.equal(scopeContract('lighthouse').trials,3);assert.equal(scopeContract('webkit').trials,4);assert.equal(scopeContract('writing').trials,4);assert.throws(()=>scopeContract('other'));
  assert.equal(scopeContract('lighthouse').protocol,scopeContract('webkit').protocol);assert.match(scopeContract('lighthouse').protocol,/Research has three fresh mobile\/simulated Lighthouse trials/);
  const record={fullGate:false,performanceAcceptance:false,errors:[],rows:writingLabels.map(label=>({label,route:'writing',run:1,evidenceValid:true,fullGate:false,performanceAcceptance:false}))};
  assert.equal(evidenceComplete('writing',record),true);
  for(const patch of [{rows:record.rows.slice(1)},{rows:[...record.rows,record.rows[0]]},{rows:[record.rows[0],record.rows[0],...record.rows.slice(2)]},{rows:record.rows.map(row=>({...row,run:2}))},{rows:record.rows.map(row=>({...row,route:'research'}))},{rows:record.rows.map(row=>({...row,evidenceValid:false}))},{errors:[{label:'color',message:'failed'}]}])assert.equal(evidenceComplete('writing',{...record,...patch}),false);
  assert.throws(()=>evidenceComplete('writing',{...record,performanceAcceptance:true}));assert.throws(()=>evidenceComplete('writing',{...record,fullGate:true}));
  assert.equal(evidenceComplete('lighthouse',{...record,rows:[{evidenceValid:true},{evidenceValid:true},{evidenceValid:true}]}),true);
  assert.equal(evidenceComplete('webkit',{...record,rows:Array.from({length:4},()=>({evidenceValid:true}))}),true);
});
