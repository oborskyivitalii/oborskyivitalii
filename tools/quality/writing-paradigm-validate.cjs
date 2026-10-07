'use strict';
// Scoped feature evidence. This cannot satisfy the full release motion matrix.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {summarize}=require('./motion.cjs'),{transition}=require('./validate.cjs');
const budgets=require('./budgets.json'),artifact=require('./artifact.cjs'),{variant}=require('./common.cjs');
const profiles=[
  {id:'desktop',width:1440,height:900,deviceScaleFactor:1,cpuRate:1,theme:'dark'},
  {id:'mobile',width:390,height:844,deviceScaleFactor:3,cpuRate:1,theme:'dark'},
  {id:'mobile-x4',width:390,height:844,deviceScaleFactor:3,cpuRate:4,theme:'dark'}
];
const orders=[['baseline','candidate'],['candidate','baseline'],['baseline','candidate']];
const guardrails={paintP95MinimumMs:1,paintP95Fraction:.1,idleBusyPercentagePoints:2,coldReadyMinimumMs:50,coldReadyFraction:.05,minimumPaintRateFraction:.9,shortWindowPaintTolerance:1};
const frozenBaselineSHA='11e5432d908ca0b81431ca4eac6721b076c33cb6';
function identity(manifest){return {sourceCommit:manifest.sourceCommit,sourceTree:manifest.sourceTree,candidateCommit:manifest.candidateCommit,sourceDirty:manifest.sourceDirty,artifactDigest:manifest.artifactDigest,variant:variant(manifest),derivation:manifest.derivation,engine:manifest.components?.engine};}
function checkIdentity(value,expected){
  for(const field of ['sourceCommit','sourceTree','candidateCommit'])assert.match(value[field]||'',/^[a-f0-9]{40}$/,'missing exact source '+field);
  assert.equal(value.sourceCommit,value.candidateCommit,'artifact candidate/source mismatch');assert.equal(value.sourceDirty,false,'dirty performance source');
  assert.match(value.artifactDigest||'',/^[a-f0-9]{64}$/,'missing public digest');
  assert.equal(value.variant?.id,'color','Writing formula must measure authored Color');assert.equal(value.variant.contract,1);
  assert.match(value.variant.fingerprint||'',/^[a-f0-9]{64}$/);assert.equal(value.engine,value.variant.fingerprint,'runtime/variant mismatch');
  assert.deepEqual(value.variant.effects,['ribbons','travel'],'incomplete Color effects');
  assert.equal(value.derivation?.kind,'authored-color-effects');assert.match(value.derivation.baseArtifactDigest||'',/^[a-f0-9]{64}$/,'missing base derivation');
  if(expected)assert.deepEqual(value,expected,'performance evidence belongs to another artifact');
}
function verifyBaseline(publicDir,manifest){
  // Snapshot's maintained declared-media compatibility handles this old source;
  // the benchmark still freezes its baseline rather than resolving a moving ref.
  assert.equal(manifest.sourceCommit,frozenBaselineSHA,'unapproved historical baseline');
  return artifact.verify(publicDir,manifest);
}
function loadInputs(root,expected){
  const inputs={};
  for(const label of ['baseline','candidate']){
    const directory=path.join(root,label),manifest=JSON.parse(fs.readFileSync(path.join(directory,'artifact.json'))),publicDir=path.join(directory,'public');
    if(label==='baseline')verifyBaseline(publicDir,manifest);else artifact.verify(publicDir,manifest);const source=identity(manifest);checkIdentity(source);
    assert.match(expected?.[label]||'',/^[a-f0-9]{40}$/,'explicit baseline/candidate SHA required');assert.equal(source.sourceCommit,expected[label],'unexpected '+label+' source');
    inputs[label]={manifest,publicDir,identity:source,sizes:artifact.checkSize(publicDir)};
  }
  assert.notEqual(inputs.baseline.identity.sourceCommit,inputs.candidate.identity.sourceCommit,'comparison needs distinct sources');
  return inputs;
}
function routeTransfer(input){
  const names=['writing.html',...require('../site/snapshot.cjs').runtimeFiles,'assets/favicon.svg'];
  return {routeRawBytes:names.reduce((sum,name)=>sum+input.manifest.files[name].raw,0),routeGzipBytes:input.sizes.rows.find(row=>row.route==='writing').totalGzipBytes};
}
function measurement(row,kind,{zero=false,flight=false}={}){
  assert.equal(row?.kind,kind,'wrong observation kind');assert.equal(row.probeVersion,2,'missing maintained probe');
  assert.ok(Number.isFinite(row.elapsedMs)&&row.elapsedMs>=900,'incomplete observation window');
  const start=row.window?.startMs,end=row.window?.endMs;assert.ok(Number.isFinite(start)&&Number.isFinite(end)&&Math.abs(end-start-row.elapsedMs)<1e-7,'inconsistent observation window');
  assert.ok(Array.isArray(row.rawFrames)&&Array.isArray(row.rawLongTasks)&&Array.isArray(row.rawPreparation),'missing raw samples');
  for(const [index,frame]of row.rawFrames.entries()){
    assert.ok(Number.isFinite(frame.time)&&frame.time>=0&&Number.isFinite(frame.started)&&frame.started>=start&&Number.isFinite(frame.duration)&&frame.duration>=0&&frame.started+frame.duration<=end+1e-7&&typeof frame.painted==='boolean','invalid raw callback');
    if(index)assert.ok(frame.time>=row.rawFrames[index-1].time&&frame.started>=row.rawFrames[index-1].started,'unordered callbacks');
  }
  assert.deepEqual(row.errors||[],[],'browser measurement errors');
  if(flight)assert.ok(Array.isArray(row.events)&&row.events.length>0,'missing raw navigation events');
  const recomputed=summarize({schema:2,frames:row.rawFrames,longTasks:row.rawLongTasks,events:flight?row.events:row.rawPreparation,start,end,elapsed:row.elapsedMs},kind);
  for(const key of ['callbacks','paints','paintRateHz','paintIntervalsMs','paintCallbackMs','callbackBusyPercent','preparationMs'])assert.deepEqual(row[key],recomputed[key],'declared '+key+' differs from raw observations');
  if(zero){assert.equal(row.callbacks,0,'settled lifecycle still schedules callbacks');assert.equal(row.paints,0,'settled lifecycle still paints');}
  else{assert.ok(row.paints>=budgets.motion.minimumPaints,'missing positive Canvas observation');assert.equal(row.state,'active','fallback cannot pass motion');}
  for(const task of row.rawLongTasks)assert.ok(Number.isFinite(task.start)&&Number.isFinite(task.duration)&&task.duration>=0&&task.start>=start&&task.start+task.duration<=end,'invalid raw long task');
  if(flight){for(const key of ['readyMs','transitionPhase'])assert.deepEqual(row[key],recomputed[key],'declared '+key+' differs from raw events');transition(row);}
  return row;
}
function cache(value,{painted=false}={}){
  assert.equal(value?.status,'ready','formula raster cache unavailable');assert.equal(value.cacheBuilds,1,'formula cache must build once');
  assert.equal(value.width,1380);assert.equal(value.height,240);assert.equal(value.bytes,value.width*value.height*4);assert.ok(value.bytes<=1324800,'formula cache allocation bound');
  assert.equal(value.failures,0,'formula cache failure');
  for(const field of ['paintCount','visibleCount','lastPaintCount'])assert.ok(Number.isInteger(value[field])&&value[field]>=0,'missing formula '+field);
  if(painted)assert.ok(value.paintCount>0,'formula was never painted');
}
function rooms(value){
  assert.ok(Array.isArray(value?.rooms)&&value.rooms.length<=3,'unbounded room cache');
  assert.ok(value.rooms.reduce((sum,room)=>sum+room.models.length,0)<=6,'unbounded detail cache');
  for(const room of value.rooms)for(const model of room.models)assert.equal(model.formulaAnchors,room.route==='writing'?1:0,'duplicate or wrong-room formula anchor');
}
function formulaObservation(value,{viewportWidth}={}){
  cache(value?.formula,{painted:true});assert.equal(value.overflow,false,'formula causes overflow');
  assert.equal(value.probe?.duplicate,false,'duplicate formula per paint');assert.ok(value.probe.draws>0,'missing observed formula draw');assert.equal(value.probe.maxPerPaint,1);
  assert.ok(Number.isInteger(value.probe.startPaintCount)&&value.probe.startPaintCount>=0,'missing fresh observation baseline');
  assert.equal(value.formula.paintCount-value.probe.startPaintCount,value.probe.draws,'historical formula paints cannot substitute fresh draws');
  assert.ok(Array.isArray(value.probe.bounds)&&value.probe.bounds.length>0,'missing actual projected bounds');
  for(const row of value.probe.bounds){
    for(const key of ['x','y','width','height','viewportWidth','viewportHeight'])assert.ok(Number.isFinite(row[key]),'invalid projected formula '+key);
    if(viewportWidth)assert.equal(row.viewportWidth,viewportWidth,'mislabeled formula viewport');
    assert.ok(row.width>0&&row.height>0&&row.x>=15&&row.x+row.width<=row.viewportWidth-15,'expression clipped horizontally');
    assert.ok(row.y>=0&&row.y+row.height<=row.viewportHeight,'expression clipped vertically');
  }
}
function browser(record,expectedManifest){
  const expected=expectedManifest.components?identity(expectedManifest):expectedManifest;checkIdentity(expected);
  assert.equal(record?.schema,1);assert.equal(record.kind,'writing-paradigm-browser');assert.equal(record.fullGate,false);assert.equal(record.pass,true,'failed browser observation');
  for(const key of ['sourceCommit','sourceTree','artifactDigest','variant'])assert.deepEqual(record[key],expected[key],'browser evidence belongs to another '+key);
  assert.ok(record.environment?.platform&&record.environment.os&&record.environment.node,'missing browser environment');
  const engines=['chromium','firefox','webkit'],cases=[{width:1440,theme:'light',mode:'normal'},{width:390,theme:'dark',mode:'normal'},{width:320,theme:'dark',mode:'no-js'},{width:320,theme:'light',mode:'no-canvas'},{width:390,theme:'dark',mode:'reduced'}];
  assert.deepEqual(record.engines?.map(row=>row.engine),engines,'missing/duplicate browser engines');assert.ok(record.engines.every(row=>typeof row.version==='string'&&row.version.length>0),'missing engine version');
  const expectedRows=engines.flatMap(engine=>cases.map(row=>({engine,route:'writing',...row})));assert.equal(record.rows?.length,expectedRows.length,'missing focused browser cases');
  for(const [index,row]of record.rows.entries()){
    for(const key of ['engine','route','width','theme','mode'])assert.equal(row[key],expectedRows[index][key],'wrong/duplicate browser case');
    assert.equal(row.pass,true);assert.deepEqual(row.errors,[]);assert.deepEqual(row.externalRequests,[]);
    if(row.mode==='normal')for(const key of ['positiveProbe','off','print','syntheticVisibility','keyboard','reverse','zoom','archive'])assert.equal(row.checks?.[key],true,'missing browser '+key);
    else assert.equal(row.checks?.[row.mode==='reduced'?'reducedFreeze':'fallback'],true,'missing capability/freeze check');
  }
  const rows=record.formula?.rows;assert.equal(rows?.length,16,'missing formula visual/journey/failure observations');
  const views=[320,390,768,1440].flatMap(width=>['light','dark'].map(theme=>({width,theme})));
  for(const [index,view]of views.entries()){
    const row=rows[index];assert.equal(row.width,view.width);assert.equal(row.theme,view.theme);assert.deepEqual(row.errors,[]);formulaObservation(row.initial,{viewportWidth:view.width});formulaObservation(row.after,{viewportWidth:view.width});
    if(view.width===390)formulaObservation(row.zoom,{viewportWidth:390});
  }
  assert.deepEqual(rows.slice(8,15).map(row=>row.journey),['research','writing','talks','writing','credits','index','writing'],'missing entry/exit/offline room journey');
  for(const row of rows.slice(8,15)){
    assert.equal(row.route,row.journey);cache(row.formula,{painted:true});assert.equal(row.probe.duplicate,false);
    if(row.route==='writing')assert.ok(row.probe.draws>0,'formula absent after return');else assert.equal(row.probe.draws,0,'formula leaks into settled '+row.route);
  }
  const failure=rows[15];assert.deepEqual(failure.errors,[]);assert.equal(failure.cacheFault?.ready,'true');assert.equal(failure.cacheFault.h1,1);assert.ok(failure.cacheFault.probe.paints>0);assert.equal(failure.cacheFault.probe.draws,0);
  assert.equal(failure.cacheFault.formula.status,'failed');assert.equal(failure.cacheFault.formula.failures,1);assert.equal(failure.cacheFault.formula.cacheBuilds,1,'failed cache retried');
  const captures=[...views.map(({width,theme})=>`writing-${width}-${theme}.png`),'writing-light-zoom200.png','writing-dark-zoom200.png'];
  assert.deepEqual([...record.formula.captures].sort(),captures.sort(),'missing/duplicate visual captures');
  assert.deepEqual(record.offline?.requests,[]);assert.deepEqual(record.offline.errors,[]);formulaObservation(record.offline.observed);
  return {pass:true,fullGate:false,cases:expectedRows.length};
}
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
function validate(record,{trustedIdentities,trustedTransfers}={}){
  assert.equal(record?.schema,1);assert.equal(record.kind,'writing-paradigm-performance');assert.equal(record.fullGate,false);
  assert.deepEqual(record.profiles,profiles,'wrong benchmark profiles');assert.deepEqual(record.orders,orders,'unbalanced benchmark order');assert.deepEqual(record.guardrails,guardrails,'changed added-cost guardrails');
  assert.ok(record.environment?.platform&&record.environment.os&&record.environment.node&&record.environment.cpus?.length,'missing runner environment');assert.ok(record.browser?.version&&record.browser.executable,'missing actual browser');
  for(const label of ['baseline','candidate'])checkIdentity(record.identities?.[label],trustedIdentities?.[label]);
  assert.notEqual(record.identities.baseline.sourceCommit,record.identities.candidate.sourceCommit,'identical comparison source');
  const expected=profiles.flatMap(profile=>orders.flatMap((order,round)=>order.map(label=>({profile:profile.id,round,label}))));
  assert.equal(record.rows?.length,expected.length,'missing paired samples');
  for(const [index,row]of record.rows.entries()){
    assert.deepEqual({profile:row.profile,round:row.round,label:row.label},expected[index],'missing/duplicate/reordered trial');assert.ok(!row.error,'failed trial: '+row.error);
    assert.ok(Number.isFinite(row.startedMs)&&Number.isFinite(row.endedMs)&&row.endedMs>row.startedMs,'missing trial duration');
    if(index)assert.ok(row.startedMs>=record.rows[index-1].endedMs,'simultaneous/reused trial windows');
    const profile=profiles.find(item=>item.id===row.profile);assert.deepEqual(row.settings,profile,'mislabeled runtime settings');
    assert.deepEqual(row.errors,[]);assert.equal(row.browser,record.browser.version,'browser changed between pairs');
    assert.equal(row.runtimeVariant,'color');assert.equal(row.runtimeEngine,record.identities[row.label].variant.fingerprint,'wrong served runtime');
    assert.deepEqual(row.measurements.map(value=>value.kind),['idle','scroll','filtered','empty'],'missing Writing/reflow observations');
    for(const sample of row.measurements){measurement(sample,sample.kind);assert.ok(sample.elapsedMs>={idle:3900,scroll:3900,filtered:1500,empty:900}[sample.kind],'truncated Writing observation');}
    assert.ok(Number.isInteger(row.filteredPublications)&&row.filteredPublications>0);assert.equal(row.emptyPublications,0);
    if(profile.cpuRate===4)for(const sample of row.measurements){assert.ok(sample.paintCallbackMs.p95<=budgets.motion.paintCallbackP95Ms,'absolute painted callback p95 exceeded');if(['idle','empty'].includes(sample.kind))assert.ok(sample.callbackBusyPercent<=budgets.motion.idleCallbackBusyPercent,'absolute idle busy exceeded');}
    assert.deepEqual(row.flights.map(value=>value.to),['writing','talks','writing','research'],'missing cold/warm entry and exit');
    assert.deepEqual(row.flights.map(value=>value.from),['research','writing','talks','writing']);
    for(const sample of row.flights)measurement(sample,'flight',{flight:true});
    assert.equal(row.flights[0].transitionPhase,'cold','cold Writing entry not observed');assert.equal(row.flights[2].transitionPhase,'warm','warm Writing cache not observed');
    assert.ok(Number.isFinite(row.transfer?.routeRawBytes)&&row.transfer.routeRawBytes>0&&Number.isFinite(row.transfer.routeGzipBytes)&&row.transfer.routeGzipBytes>0&&row.transfer.routeGzipBytes<=budgets.routeGzipBytes,'missing/over-budget route transfer');
    if(trustedTransfers)for(const key of ['routeRawBytes','routeGzipBytes'])assert.equal(row.transfer[key],trustedTransfers[row.label][key],'transfer does not match exact artifact');
    assert.ok(Array.isArray(row.transfer.requests)&&row.transfer.requests.length>0,'missing actual transfer observations');
    for(const request of row.transfer.requests)assert.ok(typeof request.path==='string'&&Number.isFinite(request.duration)&&request.duration>=0&&Number.isFinite(request.encodedBodySize)&&request.encodedBodySize>=0&&Number.isFinite(request.transferSize)&&request.transferSize>=0,'invalid actual transfer');
    assert.equal(row.transfer.formulaAssetRequests,0,'compiled formula unexpectedly fetched a separate asset');assert.equal(row.transfer.runtimeDecodes,0,'compiled formula unexpectedly decodes an image');
    if(row.label==='candidate'){
      cache(row.formula,{painted:true});rooms(row.diagnostics);
      for(const sample of row.measurements){
        cache(sample.formula?.before);cache(sample.formula?.after);
        assert.equal(sample.formula.paintDelta,sample.formula.after.paintCount-sample.formula.before.paintCount,'incorrect measured formula paint delta');
        assert.ok(Number.isInteger(sample.formula.paintDelta)&&sample.formula.paintDelta>=0&&sample.formula.paintDelta<=sample.paints,'invalid measured formula paint count');
        for(const scene of [sample.formula.beforeScene,sample.formula.afterScene]){
          assert.equal(scene?.route,'writing','formula measurement used another room');const camera=JSON.parse(scene.camera);
          for(const key of ['position','target'])assert.ok(Array.isArray(camera[key])&&camera[key].length===3&&camera[key].every(Number.isFinite),'missing actual Writing camera');
        }
        if(['idle','scroll'].includes(sample.kind)||sample.formula.paintDelta>0){assert.ok(sample.formula.paintDelta>0,'formula invisible during framed Writing measurement');assert.equal(sample.formula.framing,'painted');}
        else{assert.equal(sample.formula.framing,'outside-camera');assert.equal(sample.formula.before.visibleCount,0);assert.equal(sample.formula.after.visibleCount,0);}
      }
      for(const sample of row.flights.filter(value=>value.to!=='writing'))assert.equal(sample.formula.lastPaintCount,0,'formula leaks into settled neighboring room');
    }
  }
  const comparisons=[];
  for(const profile of profiles){
    const paired=orders.map((_,round)=>{
      const rows=record.rows.filter(row=>row.profile===profile.id&&row.round===round),baseline=rows.find(row=>row.label==='baseline'),candidate=rows.find(row=>row.label==='candidate');
      assert.equal(baseline.filteredPublications,candidate.filteredPublications,'different content between pair');
      const metrics={};
      for(const kind of ['idle','scroll','filtered','empty']){
        const a=baseline.measurements.find(row=>row.kind===kind),b=candidate.measurements.find(row=>row.kind===kind);
        assert.ok(Number.isFinite(+a.quality)&&Number.isFinite(+b.quality)&&+b.quality<=+a.quality,'performance pass hides a quality downgrade');
        assert.ok(Number.isFinite(+a.cadence)&&Number.isFinite(+b.cadence)&&+b.cadence>=+a.cadence,'performance pass hides a cadence reduction');
        const tolerance=b.elapsedMs<2000?guardrails.shortWindowPaintTolerance*1000/b.elapsedMs:0;
        assert.ok(b.paintRateHz+tolerance>=a.paintRateHz*guardrails.minimumPaintRateFraction,'performance pass hides reduced actual paint rate');
        metrics[kind]={baselineP95:a.paintCallbackMs.p95,p95Delta:b.paintCallbackMs.p95-a.paintCallbackMs.p95,busyDelta:b.callbackBusyPercent-a.callbackBusyPercent};
      }
      const a=baseline.flights[0],b=candidate.flights[0];return {round,metrics,baselineReady:a.readyMs,readyDelta:b.readyMs-a.readyMs,rawTransferDelta:candidate.transfer.routeRawBytes-baseline.transfer.routeRawBytes,gzipTransferDelta:candidate.transfer.routeGzipBytes-baseline.transfer.routeGzipBytes};
    });
    const result={profile:profile.id,paired,metrics:{}};
    for(const kind of ['idle','scroll','filtered','empty']){
      const p95Delta=median(paired.map(row=>row.metrics[kind].p95Delta)),baselineP95=median(paired.map(row=>row.metrics[kind].baselineP95)),limit=Math.max(guardrails.paintP95MinimumMs,baselineP95*guardrails.paintP95Fraction),busyDelta=median(paired.map(row=>row.metrics[kind].busyDelta));
      assert.ok(p95Delta<=limit,profile.id+'/'+kind+' added painted p95 cost: '+p95Delta+' > '+limit);
      if(['idle','empty'].includes(kind))assert.ok(busyDelta<=guardrails.idleBusyPercentagePoints,profile.id+'/'+kind+' added idle busy cost');
      result.metrics[kind]={p95Delta,baselineP95,p95Limit:limit,busyDelta};
    }
    const baselineReady=median(paired.map(row=>row.baselineReady)),readyDelta=median(paired.map(row=>row.readyDelta)),readyLimit=Math.max(guardrails.coldReadyMinimumMs,baselineReady*guardrails.coldReadyFraction);
    assert.ok(readyDelta<=readyLimit,profile.id+' added cold ready cost');Object.assign(result,{baselineReady,readyDelta,readyLimit});comparisons.push(result);
  }
  assert.equal(record.retention?.length,profiles.length,'missing repeated-route resource observation');
  for(const [index,row]of record.retention.entries()){
    assert.equal(row.profile,profiles[index].id);assert.equal(row.cycles,40);assert.deepEqual(row.warmedRoutes,['research','writing','talks','credits','index']);assert.deepEqual(row.errors,[]);
    assert.deepEqual(row.zeroWork.map(value=>value.kind),['off','reduced','hidden','print'],'missing settled lifecycle observation');for(const sample of row.zeroWork)measurement(sample,sample.kind,{zero:true});
    assert.equal(row.resumedOnce,true,'missing restore/resume evidence');measurement(row.resumed,'idle');
    for(const stage of ['before','after']){rooms(row[stage].diagnostics);cache(row[stage].diagnostics.formula,{painted:true});}
    for(const key of ['nodes','jsEventListeners'])assert.ok(Number.isInteger(row.before.dom[key])&&Number.isInteger(row.after.dom[key])&&row.after.dom[key]<=row.before.dom[key],'repeated routes retain '+key);
    assert.equal(row.after.diagnostics.formula.cacheBuilds,row.before.diagnostics.formula.cacheBuilds,'cache rebuilt during repeated routes');
  }
  assert.equal(record.complete,true,'incomplete performance execution');return {pass:true,comparisons,fullGate:false};
}
if(require.main===module){try{
  const record=JSON.parse(fs.readFileSync(process.argv[2])),inputs=loadInputs(path.resolve(process.argv[3]),{baseline:process.env.WRITING_BASELINE_SHA,candidate:process.env.SITE_CANDIDATE_SHA});
  console.log(JSON.stringify(validate(record,{trustedIdentities:Object.fromEntries(Object.entries(inputs).map(([key,value])=>[key,value.identity])),trustedTransfers:Object.fromEntries(Object.entries(inputs).map(([key,value])=>[key,routeTransfer(value)]))})));
}catch(error){console.error(error.stack);process.exitCode=1;}}
module.exports={profiles,orders,guardrails,frozenBaselineSHA,identity,checkIdentity,verifyBaseline,loadInputs,routeTransfer,measurement,cache,rooms,formulaObservation,browser,validate};
