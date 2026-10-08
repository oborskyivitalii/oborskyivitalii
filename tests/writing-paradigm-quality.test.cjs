'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {summarize}=require('../tools/quality/motion.cjs');
const contract=require('../tools/quality/writing-paradigm-validate.cjs');
function historicalFixture(run){
  const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),artifact=require('../tools/quality/artifact.cjs'),directory=fs.mkdtempSync(path.join(os.tmpdir(),'writing-frozen-baseline-'));
  const revision={schema:1,contract:1,variant:source('baseline').variant,engine:'c'.repeat(64),scenes:'a'.repeat(64),assets:'e'.repeat(64),content:'d'.repeat(64),routes:{}},write=(name,bytes)=>{const file=path.join(directory,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);};
  try{
    write('.nojekyll','');
    for(const name of ['styles.css','theme.js','space.js','archive.js','navigation.js']){const bytes='/* historical fixture '+name+' */';write(name,bytes);write('runtime/'+revision.engine+'/'+name,bytes);}
    for(const name of ['favicon.svg','vitalii-oborskyi.jpg','vitalii-oborskyi-cutout.webp']){const bytes='historical media fixture '+name;write('assets/'+name,bytes);write('media/'+revision.assets+'/'+name,bytes);}
    for(const [index,route]of ['index','research','writing','talks','credits'].entries()){
      const version=String(index+1).repeat(64),html='<meta name="site-engine" content="'+revision.engine+'"><meta name="site-route" content="'+version+'">'+['styles.css','theme.js','space.js','archive.js','navigation.js'].map(name=>'<script src="runtime/'+revision.engine+'/'+name+'"></script>').join(''),url='snapshots/'+version+'/'+route+'.html';
      const snapshot=html.replaceAll('src="runtime/','src="../../runtime/');write(route+'.html',html);write(url,snapshot);revision.routes[route]={version,url,sha256:artifact.digest(Buffer.from(snapshot))};
    }
    write('site-revision.json',JSON.stringify(revision));
    const manifest={...source('baseline'),sourceCommit:contract.frozenBaselineSHA,candidateCommit:contract.frozenBaselineSHA,components:revision,...artifact.manifest(directory)};run({directory,manifest,write,artifact});
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
}
function source(label) {
  const candidate = label === 'candidate';
  const commit = candidate ? '2'.repeat(40) : contract.frozenBaselineSHA;
  return {
    sourceCommit: commit,
    sourceTree: (candidate ? '4' : '3').repeat(40),
    candidateCommit: commit,
    sourceDirty: false,
    artifactDigest: (candidate ? 'b' : 'a').repeat(64),
    variant: {
      id: 'color', contract: 1, fingerprint: (candidate ? 'd' : 'c').repeat(64),
      effects: candidate ? ['travel'] : ['ribbons', 'travel']
    },
    engine: (candidate ? 'd' : 'c').repeat(64),
    derivation: {kind: 'authored-color-effects', baseArtifactDigest: (candidate ? 'f' : 'e').repeat(64)}
  };
}
test('current Color identity excludes ribbons and only the frozen baseline retains them', () => {
  assert.doesNotThrow(() => contract.checkIdentity(source('candidate')));
  assert.doesNotThrow(() => contract.checkIdentity(source('baseline'), undefined, {
    historicalBaseline: true
  }));
  assert.throws(() => contract.checkIdentity(source('baseline')), /current Color effects/);
  const currentRibbons = source('candidate');
  currentRibbons.variant.effects = ['ribbons', 'travel'];
  assert.throws(() => contract.checkIdentity(currentRibbons), /current Color effects/);
  const movingBaseline = source('baseline');
  movingBaseline.sourceCommit = '1'.repeat(40);
  movingBaseline.candidateCommit = movingBaseline.sourceCommit;
  assert.throws(() => contract.checkIdentity(movingBaseline, undefined, {
    historicalBaseline: true
  }), /unapproved historical baseline/);
});
function cache(){return {status:'ready',cacheBuilds:1,width:1380,height:240,bytes:1324800,paintCount:40,visibleCount:0,lastPaintCount:0,failures:0};}
function diagnostics(){return {formula:cache(),rooms:[{route:'writing',models:[{formulaAnchors:1,compact:true}]},{route:'talks',models:[{formulaAnchors:0,compact:true}]}]};}
function measure(kind,{cost=2,zero=false,cold=false,duration=1200}={}){
  const start=100,end=start+duration,frames=zero?[]:Array.from({length:Math.floor(duration/100)},(_,index)=>({time:start+index*100,started:start+index*100,duration:cost,painted:true}));
  const events=kind==='flight'?[
    {kind:'navigation-start',time:start,page:'research'},
    ...(cold?[{kind:'model',time:start+2,start:start+1,duration:1,page:'writing'}]:[]),
    {kind:'layout',time:start+5,start:start+3,duration:2,page:'writing'},
    {kind:'navigation-ready',time:end,page:'writing'}
  ]:[];
  const trace=frames.map(frame=>({time:frame.started,quality:'0',cadence:'15',route:'writing',camera:'{"position":[0,0,0],"target":[0,0,-1]}',changes:[{attribute:'data-quality',from:'0',to:'0'},{attribute:'data-cadence',from:'15',to:'15'}]}));
  return {...summarize({schema:2,frames,longTasks:[],events,start,end,elapsed:duration,state:'active',quality:'0',cadence:'15'},kind),events,trace};
}
function shift(sample,start){
  const offset=start-sample.window.startMs;sample.window.startMs+=offset;sample.window.endMs+=offset;
  for(const frame of sample.rawFrames){frame.started+=offset;frame.time+=offset;}
  for(const state of sample.trace||[])state.time+=offset;
  for(const event of new Set([...(sample.events||[]),...sample.rawPreparation])){if(Number.isFinite(event.time))event.time+=offset;if(Number.isFinite(event.start))event.start+=offset;}
  for(const task of sample.rawLongTasks)task.start+=offset;return sample;
}
function fixture(){
  const identities={baseline:source('baseline'),candidate:source('candidate')},rows=[];let clock=1;
  for(const profile of contract.profiles)for(const [round,order]of contract.orders.entries())for(const label of order){
    const cost=label==='candidate'?2.4:2,flights=['writing','talks','writing','research'].map((to,index)=>({from:['research','writing','talks','writing'][index],to,...measure('flight',{cost,cold:index===0}),formula:cache()}));
    const measurements=['idle','scroll','filtered','empty'].map(kind=>{
      const sample=measure(kind,{cost,duration:4000});
      if(label==='candidate')sample.formula={before:{...cache(),paintCount:100},after:{...cache(),paintCount:100+sample.paints},paintDelta:sample.paints,framing:'painted',beforeScene:{route:'writing',camera:'{"position":[0,0,0],"target":[0,0,-1]}'},afterScene:{route:'writing',camera:'{"position":[0,0,0],"target":[0,0,-1]}'}};return sample;
    });
    const startupIdle={...structuredClone(measurements[0]),kind:'startup-idle'},warmups=['idle','filtered','empty'].map(kind=>{
      const sample=measure('warmup',{cost,duration:10000});sample.for=kind;
      shift(measurements.find(row=>row.kind===kind),sample.window.endMs);
      return sample;
    });
    let next=flights[0].window.endMs+100;
    for(const sample of [startupIdle,warmups[0],measurements[0],measurements[1],warmups[1],measurements[2],warmups[2],measurements[3],...flights.slice(1)]){shift(sample,next);next=sample.window.endMs+100;}
    rows.push({profile:profile.id,round,label,settings:profile,startedMs:clock,endedMs:clock+1,browser:'fixture-chromium',errors:[],runtimeVariant:'color',runtimeEngine:identities[label].variant.fingerprint,measurements,startupIdle,warmups,filteredPublications:1,emptyPublications:0,flights,formula:cache(),diagnostics:diagnostics(),transfer:{routeRawBytes:25000,routeGzipBytes:30000,requests:[{path:'/runtime/'+identities[label].variant.fingerprint+'/space.js',duration:2,encodedBodySize:10000,transferSize:10300}],formulaAssetRequests:0,runtimeDecodes:0}});clock+=2;
  }
  const observe=()=>({dom:{nodes:100,jsEventListeners:20},diagnostics:diagnostics()});
  const positiveBeforeOff=()=>{
    const measurement=measure('idle',{cost:2.4,duration:2000});measurement.formula=structuredClone(rows.find(row=>row.label==='candidate').measurements[0].formula);measurement.formula.after.paintCount=measurement.formula.before.paintCount+measurement.paints;measurement.formula.paintDelta=measurement.paints;
    return {identity:identities.candidate,runtimeVariant:'color',runtimeEngine:identities.candidate.variant.fingerprint,measurement,diagnostics:diagnostics()};
  };
  return {schema:1,kind:'writing-paradigm-performance',protocolVersion:2,scope:contract.scope,steadyProtocol:contract.steadyProtocol,fullGate:false,complete:true,environment:{platform:'linux',os:'fixture',node:'v24',cpus:['fixture']},browser:{version:'fixture-chromium',executable:'/fixture/chromium'},profiles:contract.profiles,orders:contract.orders,guardrails:contract.guardrails,identities,rows,retention:contract.profiles.map(profile=>({profile:profile.id,cycles:40,warmedRoutes:['research','writing','talks','credits','index'],positiveBeforeOff:positiveBeforeOff(),errors:[],zeroWork:['off','reduced','hidden','print'].map(kind=>measure(kind,{zero:true})),resumedOnce:true,resumed:measure('idle'),before:observe(),after:observe()}))};
}
test('Writing paired performance accepts complete exact-source raw observations without granting a full gate',async()=>{
  const value=fixture(),result=contract.validate(value,{trustedIdentities:value.identities});assert.equal(result.pass,true);assert.equal(result.fullGate,false);assert.equal(result.comparisons.length,3);
  assert.ok(result.comparisons.every(row=>Math.abs(row.metrics.idle.p95Delta-.4)<1e-8));
  assert.deepEqual(Object.keys(result.outcomes),['startup','warmup','steady']);assert.ok(Object.values(result.outcomes).every(row=>row.pass));assert.ok(result.comparisons.every(row=>Math.abs(row.startup.p95Delta-.4)<1e-8));
  const natural=structuredClone(fixture());
  for(const row of natural.rows.filter(row=>row.label==='candidate'))for(const sample of row.measurements.filter(sample=>['filtered','empty'].includes(sample.kind))){sample.formula.after.paintCount=sample.formula.before.paintCount;sample.formula.paintDelta=0;sample.formula.framing='outside-camera';}
  assert.equal(contract.validate(natural).pass,true,'a world landmark outside selected content camera is recorded without fabricating visibility');
  // Exercise the runner's real observer: a 15→12→15 excursion in one microtask
  // batch must survive the final snapshot, and tracing continues until stopped.
  const vm=require('node:vm'),runner=require('../tools/quality/writing-paradigm.cjs'),scene={dataset:{quality:'0',cadence:'15',camera:'{"position":[0,0,0],"target":[0,0,-1]}'},getAttribute(name){return this.dataset[name.slice(5)];}},sandbox={window:{},document:{body:{dataset:{page:'writing'}},querySelector:()=>scene},performance:{now:()=>150},MutationObserver:class{constructor(callback){this.callback=callback;sandbox.observer=this;}observe(element,options){assert.equal(element,scene);assert.equal(options.attributeOldValue,true);}disconnect(){this.disconnected=true;}}};
  const page={evaluate:async(fn,arg)=>structuredClone(vm.runInNewContext('('+fn.toString()+')(__argument)',{...sandbox,__argument:arg}))};
  await runner.startTrace(page);sandbox.observer.callback([{attributeName:'data-cadence',oldValue:'15'},{attributeName:'data-cadence',oldValue:'12'}]);
  const traced=await runner.traceSample(page,{window:{startMs:100,endMs:200}});
  assert.deepEqual(traced.trace.at(-1).changes,[{attribute:'data-cadence',from:'15',to:'12'},{attribute:'data-cadence',from:'12',to:'15'}]);assert.ok(!sandbox.observer.disconnected,'observer remains active through measurement');
  await runner.traceSample(page,{window:{startMs:100,endMs:200}},true);assert.equal(sandbox.observer.disconnected,true);
});
function startupQualityPublication(sample,prefix=5){
  for(const state of sample.trace.slice(0,prefix)){
    delete state.quality;state.changes=state.changes.filter(change=>change.attribute!=='data-quality');
  }
  sample.trace[prefix].changes.find(change=>change.attribute==='data-quality').from=null;
  return sample;
}
test('Writing startup accepts the observed delayed quality publication without inventing telemetry',()=>{
  const value=fixture();for(const row of value.rows)startupQualityPublication(row.startupIdle);
  assert.equal(contract.validate(value).pass,true,'the renderer publishes initial quality after its existing cooldown');
  const sample=value.rows[0].startupIdle;
  assert.equal(sample.trace[0].quality,undefined,'raw unpublished quality is preserved');
  assert.equal(sample.trace[5].changes.find(change=>change.attribute==='data-quality').from,null);
  assert.throws(()=>contract.adaptationTrace(sample),/missing adaptive quality after startup/,'preconditioned observations cannot reuse the startup exception');
  for(const mutate of [
    sample=>sample.trace[5].changes.find(change=>change.attribute==='data-quality').from='0',
    sample=>{delete sample.trace[6].quality;},
    sample=>{sample.trace[6].changes.find(change=>change.attribute==='data-quality').from=null;},
    sample=>{for(const state of sample.trace){delete state.quality;state.changes=state.changes.filter(change=>change.attribute!=='data-quality');}},
    sample=>{sample.trace[0].quality='';},
    sample=>{sample.trace[0].cadence=undefined;}
  ]){const changed=structuredClone(sample);mutate(changed);assert.throws(()=>contract.adaptationTrace(changed,{startup:true}));}
  for(const locate of [row=>row.warmups[0],row=>row.measurements[0]]){
    const changed=fixture();startupQualityPublication(locate(changed.rows[0]));assert.throws(()=>contract.validate(changed),/missing adaptive quality after startup/);
  }
});
test('Writing paired performance rejects missing, duplicate, wrong-source, wrong-variant and mislabeled profiles',()=>{
  const mutations=[
    value=>value.rows.pop(),value=>value.rows[1]=structuredClone(value.rows[0]),value=>value.rows[0].settings.cpuRate=4,
    value=>value.identities.candidate.sourceDirty=true,value=>value.identities.candidate.sourceCommit='1'.repeat(40),
    value=>value.identities.candidate.variant.id='base',value=>value.rows[0].runtimeEngine='0'.repeat(64),
    value=>value.rows[1].browser='another-browser',value=>value.rows[1].startedMs=value.rows[0].startedMs,
    value=>value.rows[0].measurements[0].rawFrames.pop(),value=>delete value.rows[0].flights[0].events,
    value=>value.rows[0].flights[0].readyMs=1000,value=>value.rows[0].measurements.pop(),
    value=>value.complete=false,value=>value.orders[0].reverse(),value=>value.rows[0].transfer.formulaAssetRequests=1,
    value=>value.protocolVersion=1,value=>delete value.scope,value=>delete value.rows[0].startupIdle,value=>value.rows[0].warmups.pop(),
    value=>delete value.rows[0].warmups[0].trace,value=>value.rows[0].warmups[0].trace.at(-1).cadence='12',
    value=>value.rows[0].warmups[1]=structuredClone({...value.rows[0].warmups[0],for:'filtered'}),
    value=>{const sample=measure('warmup',{duration:4000});sample.for='idle';sample.trace=[];value.rows[0].warmups[0]=sample;},
    value=>delete value.rows[0].measurements[0].trace,
    value=>value.rows[0].measurements[0].trace.splice(0,10),
    value=>delete value.rows[0].measurements[0].trace[1].changes,
    value=>{const row=value.rows[0].measurements[0].trace[10];row.changes=[{attribute:'data-cadence',from:'15',to:'12'},{attribute:'data-cadence',from:'12',to:'15'}];},
    value=>{const row=value.rows[0].measurements[1].trace[10];row.changes=[{attribute:'data-quality',from:'0',to:'1'},{attribute:'data-quality',from:'1',to:'0'}];},
    value=>{const row=value.rows[0].warmups[0].trace.at(-5);row.changes=[{attribute:'data-quality',from:'0',to:'1'},{attribute:'data-quality',from:'1',to:'0'}];},
    value=>shift(value.rows[0].measurements[1],value.rows[0].measurements[0].window.startMs)
  ];
  for(const mutate of mutations){const value=structuredClone(fixture());mutate(value);assert.throws(()=>contract.validate(value));}
  const value=fixture(),trusted=structuredClone(value.identities);trusted.candidate.artifactDigest='0'.repeat(64);assert.throws(()=>contract.validate(value,{trustedIdentities:trusted}),/another artifact/);
  historicalFixture(({directory,manifest,write,artifact})=>{
    assert.equal(contract.verifyBaseline(directory,manifest),true);
    assert.throws(()=>contract.verifyBaseline(directory,{...manifest,sourceCommit:'0'.repeat(40)}),/unapproved historical/);
    write('space.js','changed runtime');assert.throws(()=>contract.verifyBaseline(directory,manifest),/bytes do not match/);
    const forged={...manifest,...artifact.manifest(directory)};assert.throws(()=>contract.verifyBaseline(directory,forged),/runtime differs/);
    write('space.js','/* historical fixture space.js */');write('assets/foreign.svg','unexpected asset');assert.throws(()=>contract.verifyBaseline(directory,{...manifest,...artifact.manifest(directory)}),/unexpected public input/);
  });
});
function changeMeasurement(row,cost){
  const sample=shift(measure(row.kind,{cost,duration:row.elapsedMs}),row.window.startMs);
  return {...sample,formula:row.formula,...(row.for?{for:row.for}:{})};
}
test('Writing paired performance rejects absolute failures, added cost and quality or cadence concealment',()=>{
  for(const mutate of [
    value=>{const row=value.rows.find(row=>row.profile==='mobile-x4'&&row.label==='baseline');row.measurements[1]=changeMeasurement(row.measurements[1],34);},
    value=>{const row=value.rows.find(row=>row.profile==='mobile-x4'&&row.label==='candidate');row.startupIdle=changeMeasurement(row.startupIdle,34);},
    value=>{for(const row of value.rows.filter(row=>row.label==='candidate'))row.measurements[0]=changeMeasurement(row.measurements[0],5);},
    value=>{for(const row of value.rows.filter(row=>row.label==='candidate'))row.measurements[0]=changeMeasurement(row.measurements[0],.1);value.rows.find(row=>row.label==='candidate').measurements[0].quality='1';},
    value=>{value.rows.find(row=>row.label==='candidate').measurements[0].cadence='10';},
    value=>{
      const row=value.rows.find(row=>row.label==='candidate'),sample=row.measurements[0],frames=[{...sample.rawFrames[0],duration:.1}],next=summarize({schema:2,frames,longTasks:[],events:[],start:sample.window.startMs,end:sample.window.endMs,elapsed:sample.elapsedMs,state:'active',quality:sample.quality,cadence:sample.cadence},'idle');
      row.measurements[0]={...next,trace:sample.trace,formula:{...sample.formula,before:sample.formula.before,after:{...sample.formula.after,paintCount:sample.formula.before.paintCount+1},paintDelta:1}};
    },
    value=>{for(const row of value.rows.filter(row=>row.label==='candidate'))row.flights[0]={...row.flights[0],...measure('flight',{cold:true,duration:1600})};}
  ]){const value=structuredClone(fixture());mutate(value);assert.throws(()=>contract.validate(value));}
  const reduced=structuredClone(fixture()),row=reduced.rows.find(row=>row.label==='candidate'),sample=row.measurements[0],frames=sample.rawFrames.slice(0,34);
  row.measurements[0]={...summarize({schema:2,frames,longTasks:[],events:[],start:sample.window.startMs,end:sample.window.endMs,elapsed:sample.elapsedMs,state:'active',quality:sample.quality,cadence:sample.cadence},'idle'),trace:sample.trace,formula:{...sample.formula,after:{...sample.formula.after,paintCount:sample.formula.before.paintCount+frames.length},paintDelta:frames.length}};
  assert.throws(()=>contract.validate(reduced),/reduced actual paint rate/,'a substantial paint loss fails even when sample count and declared cadence remain adequate');
  const startupMutations=[
    value=>{for(const row of value.rows.filter(row=>row.label==='candidate'))row.startupIdle=changeMeasurement(row.startupIdle,3.4);},
    value=>{const sample=value.rows.find(row=>row.label==='candidate').startupIdle;sample.cadence='12';for(const state of sample.trace){state.cadence='12';state.changes.find(change=>change.attribute==='data-cadence').from=state.changes.find(change=>change.attribute==='data-cadence').to='12';}},
    value=>{const sample=value.rows.find(row=>row.label==='candidate').startupIdle;sample.quality='1';for(const state of sample.trace){state.quality='1';state.changes.find(change=>change.attribute==='data-quality').from=state.changes.find(change=>change.attribute==='data-quality').to='1';}},
    value=>{const row=value.rows.find(row=>row.label==='candidate'),sample=row.startupIdle,frames=sample.rawFrames.slice(0,34);row.startupIdle={...summarize({schema:2,frames,longTasks:[],events:[],start:sample.window.startMs,end:sample.window.endMs,elapsed:sample.elapsedMs,state:'active',quality:sample.quality,cadence:sample.cadence},'startup-idle'),trace:sample.trace,formula:{...sample.formula,after:{...sample.formula.after,paintCount:sample.formula.before.paintCount+frames.length},paintDelta:frames.length}};},
    value=>{for(const row of value.rows.filter(row=>row.label==='candidate')){
      const sample=row.startupIdle,frames=Array.from({length:80},(_,index)=>({time:sample.window.startMs+index*50,started:sample.window.startMs+index*50,duration:2.4,painted:true}));
      row.startupIdle={...summarize({schema:2,frames,longTasks:[],events:[],start:sample.window.startMs,end:sample.window.endMs,elapsed:sample.elapsedMs,state:'active',quality:sample.quality,cadence:sample.cadence},'startup-idle'),trace:sample.trace,formula:{...sample.formula,after:{...sample.formula.after,paintCount:sample.formula.before.paintCount+frames.length},paintDelta:frames.length}};
    }}
  ];
  for(const mutate of startupMutations){const value=structuredClone(fixture());mutate(value);assert.throws(()=>contract.validate(value),error=>{
    assert.equal(error.result?.pass,false);assert.equal(error.result.outcomes.startup.pass,false);assert.equal(error.result.outcomes.steady.pass,true);assert.equal(error.result.outcomes.warmup.pass,true);return true;
  },'startup failure cannot be hidden by passing steady measurements');}
  for(const cost of [34,25]){
    const value=structuredClone(fixture()),row=value.rows.find(row=>row.profile==='mobile-x4'&&row.label==='baseline');row.warmups[0]=changeMeasurement(row.warmups[0],cost);
    assert.throws(()=>contract.validate(value),error=>{assert.equal(error.result?.pass,false);assert.equal(error.result.outcomes.warmup.pass,false);assert.equal(error.result.outcomes.startup.pass,true);assert.equal(error.result.outcomes.steady.pass,true);assert.match(error.message,cost===34?/absolute painted callback p95 exceeded/:/absolute idle busy exceeded/);return true;},'retained preconditioning uses the original CPU×4 idle absolute limits');
  }
});
test('Writing paired performance rejects invisible or repeated formula caches, wrong rooms and growing lifecycle resources',()=>{
  const mutations=[
    value=>value.rows.find(row=>row.label==='candidate').formula.paintCount=0,
    value=>{const sample=value.rows.find(row=>row.label==='candidate').measurements[0];sample.formula.after.paintCount=sample.formula.before.paintCount;sample.formula.paintDelta=0;},
    value=>value.rows.find(row=>row.label==='candidate').formula.cacheBuilds=2,
    value=>value.rows.find(row=>row.label==='candidate').formula.width=4096,
    value=>value.rows.find(row=>row.label==='candidate').diagnostics.rooms[1].models[0].formulaAnchors=1,
    value=>value.rows.find(row=>row.label==='candidate').flights[1].formula.lastPaintCount=1,
    value=>value.retention.pop(),value=>value.retention[0].cycles=39,
    value=>value.retention[0].after.dom.nodes++,value=>value.retention[0].after.dom.jsEventListeners++,
    value=>value.retention[0].zeroWork[0]=measure('off'),value=>value.retention[0].resumedOnce=false,
    value=>value.retention[0].after.diagnostics.formula.cacheBuilds=2,
    value=>delete value.retention[0].positiveBeforeOff,
    value=>value.retention[0].positiveBeforeOff.identity=source('baseline'),
    value=>value.retention[0].positiveBeforeOff.runtimeEngine='0'.repeat(64),
    value=>{const sample=value.retention[0].positiveBeforeOff.measurement;sample.formula.paintDelta=0;sample.formula.after.paintCount=sample.formula.before.paintCount;},
    value=>value.retention[0].positiveBeforeOff.measurement.formula.beforeScene.camera='{"position":[0,0],"target":[0,0,-1]}',
    value=>delete value.retention[0].positiveBeforeOff.measurement.rawFrames,
    value=>value.retention[0].positiveBeforeOff.diagnostics.formula.status='unused',
    value=>{const positive=value.retention[0].positiveBeforeOff,sample=positive.measurement,frames=sample.rawFrames.slice(0,7);positive.measurement={...summarize({schema:2,frames,longTasks:[],events:[],start:sample.window.startMs,end:sample.window.endMs,elapsed:sample.elapsedMs,state:'active',quality:sample.quality,cadence:sample.cadence},'idle'),formula:{...sample.formula,after:{...sample.formula.after,paintCount:sample.formula.before.paintCount+frames.length},paintDelta:frames.length}};}
  ];
  for(const mutate of mutations){const value=structuredClone(fixture());mutate(value);assert.throws(()=>contract.validate(value));}
});
module.exports={fixture};
