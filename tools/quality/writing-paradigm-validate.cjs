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
const steadyProtocol={warmupMs:10000,stableTailMs:2000,measurementMs:4000,minimumPaints:20,startupIdleMs:4000};
const scope={startup:'original-paired-guards',warmup:'retained-cpu-x4-idle-absolutes',steady:'whole-window-mutation-trace-v1',acceptance:'startup-and-warmup-and-steady'};
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
const reportedQuality=value=>typeof value==='string'&&value.length>0&&Number.isFinite(+value);
function adaptationChanges(state,startup,index,firstQuality){
    for(const [changeIndex,change]of state.changes.entries()){
      assert.ok(['data-quality','data-cadence'].includes(change.attribute),'invalid adaptation attribute');
      const initialQuality=startup&&index===firstQuality&&change.attribute==='data-quality'&&change.from===null&&!state.changes.slice(0,changeIndex).some(item=>item.attribute==='data-quality');
      assert.ok((initialQuality||reportedQuality(change.from))&&reportedQuality(change.to),'invalid raw adaptation change');
      if(change.attribute==='data-cadence')assert.ok(+change.from>0&&+change.to>0,'invalid raw cadence change');
    }
    for(const [attribute,key]of [['data-quality','quality'],['data-cadence','cadence']]){
      const changes=state.changes.filter(change=>change.attribute===attribute);
      for(let index=1;index<changes.length;index++)assert.equal(changes[index].from,changes[index-1].to,'broken batched adaptation trace');
      if(changes.length)assert.equal(changes.at(-1).to,state[key],'raw adaptation differs from snapshot');
    }
}
function adaptationTrace(row,{startup=false}={}){
  assert.ok(Array.isArray(row.trace)&&row.trace.length>0,'missing adaptation trace');
  if(startup)assert.equal(row.kind,'startup-idle','quality initialization is only allowed during startup');
  // The existing renderer publishes data-quality after its initial 2.5 s
  // cooldown. Its immediate startup observation can therefore contain an
  // absent attribute followed by the actual null-to-numeric publication.
  // Preserve that raw prefix; never turn absent telemetry into a quality tier.
  const firstQuality=row.trace.findIndex(state=>reportedQuality(state.quality));
  assert.ok(firstQuality>=0,'quality was never published during adaptation observation');
  if(firstQuality>0){
    assert.equal(startup,true,'missing adaptive quality after startup');
    assert.equal(row.trace[firstQuality].changes?.find(change=>change.attribute==='data-quality')?.from,null,'missing initial quality publication');
  }
  for(const [index,state]of row.trace.entries()){
    assert.ok(Number.isFinite(state.time)&&state.time>=row.window.startMs&&state.time<=row.window.endMs,'invalid adaptation time');
    if(index)assert.ok(state.time>=row.trace[index-1].time,'unordered adaptation trace');
    assert.equal(state.route,'writing');assert.ok((startup&&index<firstQuality&&state.quality===undefined||reportedQuality(state.quality))&&Number.isFinite(+state.cadence)&&+state.cadence>0,'invalid adaptive quality/cadence');
    const camera=JSON.parse(state.camera);for(const key of ['position','target'])assert.ok(Array.isArray(camera[key])&&camera[key].length===3&&camera[key].every(Number.isFinite),'invalid warm-up camera');
    assert.ok(Array.isArray(state.changes),'missing raw attribute changes');
    adaptationChanges(state,startup,index,firstQuality);
  }
  assert.ok(row.trace[0].time<=row.window.startMs+300&&row.trace.at(-1).time>=row.window.endMs-300,'incomplete whole-window adaptation trace');
  return row.trace;
}
function unchanged(trace,row){
  for(const state of trace){
    assert.equal(state.quality,row.quality,'quality changed within measured steady window');assert.equal(state.cadence,row.cadence,'cadence changed within measured steady window');
    for(const change of state.changes){const expected=change.attribute==='data-quality'?row.quality:row.cadence;assert.equal(change.from,expected,'temporary adaptive change within measured steady window');assert.equal(change.to,expected,'temporary adaptive change within measured steady window');}
  }
}
function steady(row){
  const trace=adaptationTrace(row);assert.ok(trace.length>=steadyProtocol.minimumPaints,'insufficient whole-window adaptation observations');unchanged(trace,row);return true;
}
function warmup(row){
  measurement(row,'warmup');assert.ok(row.elapsedMs>=steadyProtocol.warmupMs-100,'truncated fixed warm-up');adaptationTrace(row);
  const tail=row.trace.filter(state=>state.time>=row.window.endMs-steadyProtocol.stableTailMs),paints=row.rawFrames.filter(frame=>frame.painted&&frame.started>=row.window.endMs-steadyProtocol.stableTailMs);
  assert.ok(tail.length>=10&&paints.length>=10,'insufficient adaptation-tail observations');
  assert.ok(tail[0].time<=row.window.endMs-steadyProtocol.stableTailMs+300&&tail.at(-1).time>=row.window.endMs-300,'incomplete adaptation-tail interval');
  unchanged(tail,row);return true;
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
function formulaSample(sample,{framed=false}={}){
  cache(sample.formula?.before);cache(sample.formula?.after);
  assert.equal(sample.formula.paintDelta,sample.formula.after.paintCount-sample.formula.before.paintCount,'incorrect measured formula paint delta');
  assert.ok(Number.isInteger(sample.formula.paintDelta)&&sample.formula.paintDelta>=0&&sample.formula.paintDelta<=sample.paints,'invalid measured formula paint count');
  for(const scene of [sample.formula.beforeScene,sample.formula.afterScene]){
    assert.equal(scene?.route,'writing','formula measurement used another room');const camera=JSON.parse(scene.camera);
    for(const key of ['position','target'])assert.ok(Array.isArray(camera[key])&&camera[key].length===3&&camera[key].every(Number.isFinite),'missing actual Writing camera');
  }
  if(framed||sample.formula.paintDelta>0){assert.ok(sample.formula.paintDelta>0,'formula invisible during framed Writing measurement');assert.equal(sample.formula.framing,'painted');}
  else{assert.equal(sample.formula.framing,'outside-camera');assert.equal(sample.formula.before.visibleCount,0);assert.equal(sample.formula.after.visibleCount,0);}
}
function formulaObservation(value,{viewportWidth}={}){
  cache(value?.formula,{painted:true});assert.equal(value.overflow,false,'formula causes overflow');
  assert.equal(value.probe?.duplicate,false,'duplicate formula per paint');assert.ok(value.probe.draws>0,'missing observed formula draw');assert.equal(value.probe.maxPerPaint,1);
  assert.equal(value.probe.maxSubmissionsPerPaint,24,'world plane exceeds bounded triangle submission budget');
  assert.equal(value.formula.lastPaintCount,1);assert.equal(value.formula.lastDrawSubmissions,24,'missing frozen/active world plane');
  assert.ok(Number.isInteger(value.probe.startPaintCount)&&value.probe.startPaintCount>=0,'missing fresh observation baseline');
  assert.equal(value.formula.paintCount-value.probe.startPaintCount,value.probe.draws,'historical formula paints cannot substitute fresh draws');
  assert.ok(Number.isInteger(value.probe.startDrawSubmissions)&&value.probe.startDrawSubmissions>=0,'missing fresh native draw baseline');
  assert.equal(value.formula.drawSubmissions-value.probe.startDrawSubmissions,value.probe.drawSubmissions,'declared native submissions differ from instrumented Canvas calls');
  assert.equal(value.probe.drawSubmissions,value.probe.draws*24,'incomplete/duplicate perspective formula draw');
  assert.ok(Array.isArray(value.probe.bounds)&&value.probe.bounds.length>0,'missing actual projected bounds');
  for(const row of value.probe.bounds){
    for(const key of ['x','y','width','height','viewportWidth','viewportHeight'])assert.ok(Number.isFinite(row[key]),'invalid projected formula '+key);
    assert.equal(row.coordinateSpace,'physical-css-pixels','formula bounds use another coordinate space');
    for(const key of ['x','y','width','height','backingWidth','backingHeight'])assert.ok(Number.isFinite(row.canvas?.[key]),'missing physical Canvas '+key);
    assert.ok(row.canvas.width>0&&row.canvas.height>0&&row.canvas.backingWidth>0&&row.canvas.backingHeight>0,'invalid physical Canvas dimensions');
    if(viewportWidth)assert.equal(row.viewportWidth,viewportWidth,'mislabeled formula viewport');
    assert.ok(row.width>0&&row.height>0&&row.x>=15&&row.x+row.width<=row.viewportWidth-15,'expression clipped horizontally');
    assert.ok(row.y>=0&&row.y+row.height<=row.viewportHeight,'expression clipped vertically');
    const projection=row.projection;assert.equal(projection?.strategy,'perspective-extruded');assert.equal(projection.layers,3);assert.equal(projection.strips,4);
    for(const key of ['worldCenter','rootCenter'])assert.ok(Array.isArray(projection[key])&&projection[key].length===3&&projection[key].every(Number.isFinite),'missing world '+key);
    assert.ok(Math.hypot(...projection.worldCenter.map((value,index)=>value-projection.rootCenter[index]))<1,'formula detached from Writing fractal center');
    assert.ok(projection.depth>.5&&projection.extrusion>0&&projection.pulse>0&&Number.isFinite(projection.clock),'missing world depth/extrusion/shared-clock evidence');
    assert.ok(Array.isArray(projection.worldCorners)&&projection.worldCorners.length===4&&projection.worldCorners.every(point=>point.length===3&&point.every(Number.isFinite)),'missing world plane');
    assert.ok(Array.isArray(projection.corners)&&projection.corners.length===4&&projection.corners.every(point=>point.length===2&&point.every(Number.isFinite)),'missing perspective quadrilateral');
    assert.ok(Array.isArray(row.clips)&&row.clips.length===24&&row.clips.every(triangle=>triangle.length===3&&triangle.every(point=>point.length===2&&point.every(Number.isFinite))),'missing actual bounded triangle clips');
    assert.ok(Array.isArray(row.rawVertices),'missing actual Canvas clip vertices');
    for(const corner of projection.corners)assert.ok(row.rawVertices.some(point=>Math.hypot(point[0]-corner[0],point[1]-corner[1])<1e-6),'world corners differ from actual Canvas clip vertices');
    const [a,b,c,d]=projection.corners;assert.ok(Math.hypot(a[0]+c[0]-b[0]-d[0],a[1]+c[1]-b[1]-d[1])>.001,'screen rectangle cannot prove perspective');
  }
}
function ownershipState(state){
  assert.equal(state?.route,'writing','formula ownership used another room');assert.ok(Number.isFinite(state.time)&&state.time>=0,'invalid ownership timestamp');
  assert.ok(['canvas','static'].includes(state.mode),'missing formula display owner');assert.ok(['Motion: on','Motion: off','Motion: reduced'].includes(state.motion),'missing actual motion preference');
  for(const key of ['fallbackVisible','bitmapFormula'])assert.equal(typeof state[key],'boolean','missing actual '+key);
  assert.equal(state.bitmapFormula&&state.fallbackVisible,false,'Canvas and fallback simultaneously own formula');
  for(const key of ['paints','draws','callbacks'])assert.ok(Number.isInteger(state[key])&&state[key]>=0,'invalid ownership '+key);
  assert.ok(Number.isFinite(+state.phase)&&Number.isFinite(state.scrollY),'missing frozen phase or native scroll');
  const camera=JSON.parse(state.camera);for(const key of ['position','target'])assert.ok(Array.isArray(camera[key])&&camera[key].length===3&&camera[key].every(Number.isFinite),'invalid actual ownership camera');
}
function ownership(row){
  assert.deepEqual(row.errors,[]);const startup=row.startup;
  for(const state of [startup?.off,startup?.startupFrozen,startup?.onSynchronous,row.before,row.immediate,row.settle?.start,row.after,row.frozen?.scroll?.after,row.frozen?.after])ownershipState(state);
  for(const state of [startup.off,startup.startupFrozen,startup.onSynchronous]){
    cache(state.formula,{painted:true});assert.equal(state.mode,'canvas');assert.equal(state.fallbackVisible,false);assert.equal(state.bitmapFormula,true);assert.equal(state.formula.lastPaintCount,1);assert.equal(state.formula.lastDrawSubmissions,24);
  }
  assert.equal(startup.off.motion,'Motion: off');assert.equal(startup.startupFrozen.motion,'Motion: off');assert.equal(startup.onSynchronous.motion,'Motion: on');
  assert.ok(startup.startupFrozen.time-startup.off.time>=400,'truncated startup frozen interval');
  for(const key of ['paints','draws','callbacks','phase','camera'])assert.equal(startup.startupFrozen[key],startup.off[key],'startup Off performs background work');
  assert.deepEqual(startup.startupFrozen.formula.projection,startup.off.formula.projection,'startup Off world formula moved');
  for(const key of ['paints','draws','callbacks'])assert.equal(startup.onSynchronous[key],startup.startupFrozen[key],'synchronous preference unexpectedly submitted another plane');
  assert.ok(startup.onSynchronous.time>=startup.startupFrozen.time);formulaObservation(startup.painted,{viewportWidth:390});
  const before=row.before,after=row.after,end=row.frozen.after,targetMotion=row.kind==='off'?'Motion: off':'Motion: reduced';
  cache(before.formula,{painted:true});assert.ok(before.time>=startup.onSynchronous.time&&before.formula.paintCount>=startup.painted.formula.paintCount&&before.draws>=startup.painted.probe.draws,'active ownership precedes fresh startup observation');assert.equal(before.mode,'canvas');assert.equal(before.motion,'Motion: on');assert.equal(before.fallbackVisible,false);assert.equal(before.bitmapFormula,true);assert.equal(before.formula.lastPaintCount,1);
  for(const state of [after,end]){cache(state.formula,{painted:true});assert.equal(state.mode,'canvas');assert.equal(state.motion,targetMotion);assert.equal(state.fallbackVisible,false);assert.equal(state.bitmapFormula,true);assert.equal(state.formula.lastPaintCount,1);assert.equal(state.formula.lastDrawSubmissions,24);}
  assert.ok(Array.isArray(row.events)&&row.events.length>=5,'missing raw formula ownership timeline');
  for(const [index,state]of row.events.entries()){
    ownershipState(state);cache(state.formula,{painted:true});assert.ok(['before','preference-return','paint-clear','formula-draw','settled','native-scroll','freeze-end'].includes(state.kind),'invalid ownership event');
    if(index){const previous=row.events[index-1];assert.ok(state.time>=previous.time,'unordered ownership events');for(const key of ['paints','draws','callbacks'])assert.ok(state[key]>=previous[key],'ownership counters moved backwards');}
  }
  assert.deepEqual(row.events[0],{kind:'before',...before},'ownership timeline omits active initial state');assert.deepEqual(row.events.at(-1),{kind:'freeze-end',...end},'ownership timeline omits frozen final state');
  assert.ok(row.events.some(state=>state.kind==='settled'&&state.time===after.time),'ownership timeline omits settled snapshot');
  const events=row.events.filter(state=>state.time<=after.time&&state.motion===targetMotion),settle=row.settle,start=events[0];
  assert.ok(start,'missing actual preference event');assert.deepEqual(settle.start,start,'settle window starts at another preference event');assert.equal(settle.timeoutMs,1500);
  assert.equal(settle.elapsedMs,after.time-start.time);assert.ok(settle.elapsedMs>=0&&settle.elapsedMs<=settle.timeoutMs,'unbounded formula freeze handoff');
  assert.equal(settle.paintDelta,events.filter(state=>state.kind==='paint-clear').length);assert.equal(settle.paintDelta,1,'formula freeze must settle with one actual paint');
  assert.equal(settle.drawDelta,events.filter(state=>state.kind==='formula-draw').length);assert.equal(settle.drawDelta,1,'frozen scene must contain exactly one world formula');
  assert.equal(settle.paintDelta,after.paints-start.paints+(start.kind==='paint-clear'?1:0),'ownership paint events differ from actual counters');assert.equal(settle.drawDelta,after.draws-start.draws+(start.kind==='formula-draw'?1:0),'ownership draw events differ from actual counters');
  assert.equal(settle.callbackDelta,after.callbacks-start.callbacks+(start.kind==='paint-clear'?1:0));assert.equal(settle.callbackDelta,1,'formula freeze schedules additional callbacks');
  assert.equal(after.phase,start.phase);assert.equal(after.camera,start.camera);
  const frozen=row.frozen;assert.equal(frozen.elapsedMs,end.time-after.time);assert.ok(frozen.elapsedMs>=400,'truncated frozen formula interval');
  for(const [delta,key]of [['paintDelta','paints'],['drawDelta','draws'],['callbackDelta','callbacks']]){assert.equal(frozen[delta],end[key]-after[key],'frozen delta differs from raw counters');assert.equal(frozen[delta],0,'frozen formula still performs '+key);}
  assert.equal(end.phase,after.phase);assert.equal(end.camera,after.camera);assert.deepEqual(end.formula.projection,after.formula.projection,'frozen world plane changed');
  assert.ok(Number.isFinite(frozen.scroll.beforeY)&&Number.isFinite(frozen.scroll.target)&&frozen.scroll.target>=frozen.scroll.beforeY+50,'missing actual native scroll');assert.ok(end.scrollY>frozen.scroll.beforeY+50,'native scroll did not advance while frozen');
}
function browser(record,expectedManifest){
  const expected=expectedManifest.components?identity(expectedManifest):expectedManifest;checkIdentity(expected);
  assert.equal(record?.schema,1);assert.equal(record.kind,'writing-paradigm-browser');assert.equal(record.fullGate,false);assert.equal(record.pass,true,'failed browser observation');
  for(const key of ['sourceCommit','sourceTree','artifactDigest','variant'])assert.deepEqual(record[key],expected[key],'browser evidence belongs to another '+key);
  assert.ok(record.environment?.platform&&record.environment.os&&record.environment.node,'missing browser environment');
  const engines=['chromium','firefox'],cases=[{width:1440,theme:'light',mode:'normal'},{width:390,theme:'dark',mode:'normal'},{width:320,theme:'dark',mode:'no-js'},{width:320,theme:'light',mode:'no-canvas'},{width:390,theme:'dark',mode:'reduced'}];
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
  assert.deepEqual(record.formula.ownership?.map(row=>row.kind),['off','reduced'],'missing/duplicate formula preference ownership checks');for(const row of record.formula.ownership)ownership(row);
  assert.deepEqual(record.offline?.requests,[]);assert.deepEqual(record.offline.errors,[]);formulaObservation(record.offline.observed);
  return {pass:true,fullGate:false,cases:expectedRows.length};
}
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
function validateTransfer(row,trustedTransfers){
    assert.ok(Number.isFinite(row.transfer?.routeRawBytes)&&row.transfer.routeRawBytes>0&&Number.isFinite(row.transfer.routeGzipBytes)&&row.transfer.routeGzipBytes>0&&row.transfer.routeGzipBytes<=budgets.routeGzipBytes,'missing/over-budget route transfer');
    if(trustedTransfers)for(const key of ['routeRawBytes','routeGzipBytes'])assert.equal(row.transfer[key],trustedTransfers[row.label][key],'transfer does not match exact artifact');
    assert.ok(Array.isArray(row.transfer.requests)&&row.transfer.requests.length>0,'missing actual transfer observations');
    for(const request of row.transfer.requests)assert.ok(typeof request.path==='string'&&Number.isFinite(request.duration)&&request.duration>=0&&Number.isFinite(request.encodedBodySize)&&request.encodedBodySize>=0&&Number.isFinite(request.transferSize)&&request.transferSize>=0,'invalid actual transfer');
    assert.equal(row.transfer.formulaAssetRequests,0,'compiled formula unexpectedly fetched a separate asset');assert.equal(row.transfer.runtimeDecodes,0,'compiled formula unexpectedly decodes an image');
}
function validateSteadySamples(row){
    assert.deepEqual(row.warmups?.map(sample=>sample.for),['idle','filtered','empty'],'missing preconditioning intervals');
    for(const sample of row.warmups){warmup(sample);const next=row.measurements.find(value=>value.kind===sample.for);assert.equal(next.quality,sample.quality,'steady window changed quality after preconditioning');assert.equal(next.cadence,sample.cadence,'steady window changed cadence after preconditioning');assert.ok(next.window.startMs>=sample.window.endMs,'preconditioning overlaps measured window');}
    const sequence=[row.startupIdle,row.warmups[0],row.measurements[0],row.measurements[1],row.warmups[1],row.measurements[2],row.warmups[2],row.measurements[3]];
    for(let index=1;index<sequence.length;index++)assert.ok(sequence[index].window.startMs>=sequence[index-1].window.endMs,'reused/overlapping startup, preconditioning or steady windows');
    for(const sample of row.measurements){measurement(sample,sample.kind);assert.ok(sample.elapsedMs>=steadyProtocol.measurementMs-100,'truncated Writing observation');assert.ok(sample.paints>=steadyProtocol.minimumPaints,'insufficient steady tail sample');steady(sample);}
    return sequence;
}
function validateAbsolute(profile,row,gate){
    if(profile.cpuRate===4){
      const absolute=(scope,sample,idle)=>{const context=profile.id+'/'+row.label+'/'+row.round+'/'+sample.kind+(sample.for?'/'+sample.for:'');gate(scope,sample.paintCallbackMs.p95<=budgets.motion.paintCallbackP95Ms,context+' absolute painted callback p95 exceeded');if(idle)gate(scope,sample.callbackBusyPercent<=budgets.motion.idleCallbackBusyPercent,context+' absolute idle busy exceeded');};
      for(const sample of row.measurements)absolute('steady',sample,['idle','empty'].includes(sample.kind));
      absolute('startup',row.startupIdle,true);for(const sample of row.warmups)absolute('warmup',sample,true);
    }
}
function validateTrial(record,row,index,expected,gate,trustedTransfers){
    assert.deepEqual({profile:row.profile,round:row.round,label:row.label},expected[index],'missing/duplicate/reordered trial');assert.ok(!row.error,'failed trial: '+row.error);
    assert.ok(Number.isFinite(row.startedMs)&&Number.isFinite(row.endedMs)&&row.endedMs>row.startedMs,'missing trial duration');
    if(index)assert.ok(row.startedMs>=record.rows[index-1].endedMs,'simultaneous/reused trial windows');
    const profile=profiles.find(item=>item.id===row.profile);assert.deepEqual(row.settings,profile,'mislabeled runtime settings');
    assert.deepEqual(row.errors,[]);assert.equal(row.browser,record.browser.version,'browser changed between pairs');
    assert.equal(row.runtimeVariant,'color');assert.equal(row.runtimeEngine,record.identities[row.label].variant.fingerprint,'wrong served runtime');
    assert.deepEqual(row.measurements.map(value=>value.kind),['idle','scroll','filtered','empty'],'missing Writing/reflow observations');
    measurement(row.startupIdle,'startup-idle');assert.ok(row.startupIdle.elapsedMs>=steadyProtocol.startupIdleMs-100,'truncated initial idle observation');adaptationTrace(row.startupIdle,{startup:true});
    const sequence=validateSteadySamples(row);
    assert.ok(Number.isInteger(row.filteredPublications)&&row.filteredPublications>0);assert.equal(row.emptyPublications,0);
    validateAbsolute(profile,row,gate);
    assert.deepEqual(row.flights.map(value=>value.to),['writing','talks','writing','research'],'missing cold/warm entry and exit');
    assert.deepEqual(row.flights.map(value=>value.from),['research','writing','talks','writing']);
    for(const sample of row.flights)measurement(sample,'flight',{flight:true});
    const chronology=[row.flights[0],...sequence,...row.flights.slice(1)];
    for(let index=1;index<chronology.length;index++)assert.ok(chronology[index].window.startMs>=chronology[index-1].window.endMs,'reused/overlapping flight, startup, preconditioning or steady windows');
    assert.equal(row.flights[0].transitionPhase,'cold','cold Writing entry not observed');assert.equal(row.flights[2].transitionPhase,'warm','warm Writing cache not observed');
    validateTransfer(row,trustedTransfers);
    if(row.label==='candidate'){
      cache(row.formula,{painted:true});rooms(row.diagnostics);
      for(const sample of [...row.measurements,row.startupIdle])formulaSample(sample,{framed:['idle','scroll','startup-idle'].includes(sample.kind)});
      for(const sample of row.flights.filter(value=>value.to!=='writing'))assert.equal(sample.formula.lastPaintCount,0,'formula leaks into settled neighboring room');
    }
}
function validate(record,{trustedIdentities,trustedTransfers}={}){
  assert.equal(record?.schema,1);assert.equal(record.kind,'writing-paradigm-performance');assert.equal(record.fullGate,false);
  assert.equal(record.protocolVersion,2,'historical protocol cannot supply steady evidence');assert.deepEqual(record.scope,scope,'changed startup/warmup/steady acceptance scope');assert.deepEqual(record.steadyProtocol,steadyProtocol,'changed steady preconditioning');
  assert.deepEqual(record.profiles,profiles,'wrong benchmark profiles');assert.deepEqual(record.orders,orders,'unbalanced benchmark order');assert.deepEqual(record.guardrails,guardrails,'changed added-cost guardrails');
  assert.ok(record.environment?.platform&&record.environment.os&&record.environment.node&&record.environment.cpus?.length,'missing runner environment');assert.ok(record.browser?.version&&record.browser.executable,'missing actual browser');
  for(const label of ['baseline','candidate'])checkIdentity(record.identities?.[label],trustedIdentities?.[label]);
  assert.notEqual(record.identities.baseline.sourceCommit,record.identities.candidate.sourceCommit,'identical comparison source');
  const outcomes=Object.fromEntries(['startup','warmup','steady'].map(scope=>[scope,{pass:true,failures:[]}]));
  const gate=(scope,condition,message)=>{if(!condition){outcomes[scope].pass=false;outcomes[scope].failures.push(message);}};
  const expected=profiles.flatMap(profile=>orders.flatMap((order,round)=>order.map(label=>({profile:profile.id,round,label}))));
  assert.equal(record.rows?.length,expected.length,'missing paired samples');
  for(const [index,row]of record.rows.entries())validateTrial(record,row,index,expected,gate,trustedTransfers);
  const comparisons=[];
  const pairedMetric=(a,b,scope,context)=>{
    gate(scope,Number.isFinite(+a.quality)&&Number.isFinite(+b.quality)&&+b.quality<=+a.quality,context+' performance pass hides a quality downgrade');
    gate(scope,Number.isFinite(+a.cadence)&&Number.isFinite(+b.cadence)&&+b.cadence>=+a.cadence,context+' performance pass hides a cadence reduction');
    const tolerance=b.elapsedMs<2000?guardrails.shortWindowPaintTolerance*1000/b.elapsedMs:0;
    gate(scope,b.paintRateHz+tolerance>=a.paintRateHz*guardrails.minimumPaintRateFraction,context+' performance pass hides reduced actual paint rate');
    return {baselineP95:a.paintCallbackMs.p95,p95Delta:b.paintCallbackMs.p95-a.paintCallbackMs.p95,busyDelta:b.callbackBusyPercent-a.callbackBusyPercent};
  };
  const medianMetric=(paired,scope,context,idle)=>{
    const p95Delta=median(paired.map(row=>row.p95Delta)),baselineP95=median(paired.map(row=>row.baselineP95)),limit=Math.max(guardrails.paintP95MinimumMs,baselineP95*guardrails.paintP95Fraction),busyDelta=median(paired.map(row=>row.busyDelta));
    gate(scope,p95Delta<=limit,context+' added painted p95 cost: '+p95Delta+' > '+limit);
    if(idle)gate(scope,busyDelta<=guardrails.idleBusyPercentagePoints,context+' added idle busy cost: '+busyDelta+' > '+guardrails.idleBusyPercentagePoints);
    return {p95Delta,baselineP95,p95Limit:limit,busyDelta};
  };
  for(const profile of profiles){
    const paired=orders.map((_,round)=>{
      const rows=record.rows.filter(row=>row.profile===profile.id&&row.round===round),baseline=rows.find(row=>row.label==='baseline'),candidate=rows.find(row=>row.label==='candidate');
      assert.equal(baseline.filteredPublications,candidate.filteredPublications,'different content between pair');
      const metrics={};
      for(const kind of ['idle','scroll','filtered','empty']){
        const a=baseline.measurements.find(row=>row.kind===kind),b=candidate.measurements.find(row=>row.kind===kind);
        metrics[kind]=pairedMetric(a,b,'steady',profile.id+'/'+kind+'/'+round);
      }
      const startup=pairedMetric(baseline.startupIdle,candidate.startupIdle,'startup',profile.id+'/startup-idle/'+round);
      const a=baseline.flights[0],b=candidate.flights[0];return {round,startup,metrics,baselineReady:a.readyMs,readyDelta:b.readyMs-a.readyMs,rawTransferDelta:candidate.transfer.routeRawBytes-baseline.transfer.routeRawBytes,gzipTransferDelta:candidate.transfer.routeGzipBytes-baseline.transfer.routeGzipBytes};
    });
    const result={profile:profile.id,paired,metrics:{}};
    for(const kind of ['idle','scroll','filtered','empty']){
      result.metrics[kind]=medianMetric(paired.map(row=>row.metrics[kind]),'steady',profile.id+'/'+kind,['idle','empty'].includes(kind));
    }
    result.startup=medianMetric(paired.map(row=>row.startup),'startup',profile.id+'/startup-idle',true);
    const baselineReady=median(paired.map(row=>row.baselineReady)),readyDelta=median(paired.map(row=>row.readyDelta)),readyLimit=Math.max(guardrails.coldReadyMinimumMs,baselineReady*guardrails.coldReadyFraction);
    gate('startup',readyDelta<=readyLimit,profile.id+' added cold ready cost');Object.assign(result,{baselineReady,readyDelta,readyLimit});comparisons.push(result);
  }
  assert.equal(record.retention?.length,profiles.length,'missing repeated-route resource observation');
  for(const [index,row]of record.retention.entries()){
    assert.equal(row.profile,profiles[index].id);assert.equal(row.cycles,40);assert.deepEqual(row.warmedRoutes,['research','writing','talks','credits','index']);assert.deepEqual(row.errors,[]);
    const positive=row.positiveBeforeOff;assert.ok(positive,'missing positive Writing observation before Off');checkIdentity(positive.identity,record.identities.candidate);
    assert.equal(positive.runtimeVariant,'color');assert.equal(positive.runtimeEngine,record.identities.candidate.variant.fingerprint,'wrong positive Writing runtime');
    measurement(positive.measurement,'idle');assert.ok(positive.measurement.elapsedMs>=1900,'truncated positive Writing observation before Off');assert.ok(positive.measurement.paints>=budgets.motion.transition.minimumPaints,'insufficient actual Writing paints before Off');formulaSample(positive.measurement,{framed:true});rooms(positive.diagnostics);cache(positive.diagnostics.formula,{painted:true});
    assert.deepEqual(row.zeroWork.map(value=>value.kind),['off','reduced','hidden','print'],'missing settled lifecycle observation');for(const sample of row.zeroWork)measurement(sample,sample.kind,{zero:true});
    assert.equal(row.resumedOnce,true,'missing restore/resume evidence');measurement(row.resumed,'idle');
    for(const stage of ['before','after']){rooms(row[stage].diagnostics);cache(row[stage].diagnostics.formula,{painted:true});}
    for(const key of ['nodes','jsEventListeners'])assert.ok(Number.isInteger(row.before.dom[key])&&Number.isInteger(row.after.dom[key])&&row.after.dom[key]<=row.before.dom[key],'repeated routes retain '+key);
    assert.equal(row.after.diagnostics.formula.cacheBuilds,row.before.diagnostics.formula.cacheBuilds,'cache rebuilt during repeated routes');
  }
  assert.equal(record.complete,true,'incomplete performance execution');
  const result={pass:Object.values(outcomes).every(outcome=>outcome.pass),outcomes,comparisons,fullGate:false};
  if(!result.pass){const error=new assert.AssertionError({message:Object.entries(outcomes).flatMap(([scope,outcome])=>outcome.failures.map(message=>scope+': '+message)).join('\n')});error.result=result;throw error;}
  return result;
}
if(require.main===module){try{
  const record=JSON.parse(fs.readFileSync(process.argv[2])),inputs=loadInputs(path.resolve(process.argv[3]),{baseline:process.env.WRITING_BASELINE_SHA,candidate:process.env.SITE_CANDIDATE_SHA});
  console.log(JSON.stringify(validate(record,{trustedIdentities:Object.fromEntries(Object.entries(inputs).map(([key,value])=>[key,value.identity])),trustedTransfers:Object.fromEntries(Object.entries(inputs).map(([key,value])=>[key,routeTransfer(value)]))})));
}catch(error){console.error(error.stack);process.exitCode=1;}}
module.exports={profiles,orders,guardrails,steadyProtocol,scope,frozenBaselineSHA,identity,checkIdentity,verifyBaseline,loadInputs,routeTransfer,measurement,adaptationTrace,unchanged,steady,warmup,cache,rooms,formulaSample,formulaObservation,ownershipState,ownership,browser,validate};
