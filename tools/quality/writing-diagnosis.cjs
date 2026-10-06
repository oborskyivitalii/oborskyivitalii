'use strict';
// Private causal screens. Completion means collected evidence, never release acceptance.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const artifact=require('./artifact.cjs'),{environment,variant}=require('./common.cjs');
const {serve,open,ready,reset}=require('./writing-probe.cjs');
const {summarize}=require('./motion.cjs'),{transition}=require('./validate.cjs');
const beforeCommit='ba2ac7f257f2937ab8805ad106cb4ce1a801382e';
const profiles={desktop:{width:1440,height:900,deviceScaleFactor:1.5,cpuRate:1,theme:'dark'},mobile:{width:390,height:844,deviceScaleFactor:3,cpuRate:4,theme:'dark'}};
const modes=['screen','v0','h1','h2','h3','h4','h5','edge'];

function configuration(value={}){
  const settings=typeof value==='string'?(modes.includes(value)?{mode:value}:JSON.parse(fs.readFileSync(path.resolve(value)))):value;
  const config={schema:1,mode:'screen',before:beforeCommit,desktopPairs:6,mobilePairs:1,fullGate:false,...settings};
  assert.equal(config.schema,1,'unsupported diagnostic configuration');assert.equal(config.fullGate,false,'diagnosis cannot accept a full gate');
  assert.ok(modes.includes(config.mode),'unknown Writing diagnosis mode');assert.match(config.before,/^[a-f0-9]{40}$/,'exact before SHA required');
  for(const key of ['desktopPairs','mobilePairs'])assert.ok(Number.isInteger(config[key])&&config[key]>=0&&config[key]<=6,'unbounded '+key);
  assert.ok(config.desktopPairs+config.mobilePairs>0,'at least one bounded V0 pair required');
  if(config.runtimeEngine)assert.match(config.runtimeEngine,/^[a-f0-9]{64}$/,'invalid expected runtime engine');
  return config;
}
function plan(mode='screen',available=[],options={}){
  assert.ok(modes.includes(mode),'unknown Writing diagnosis mode');
  const config=configuration({...options,mode}),groups=mode==='screen'?['v0','h1','h2','h3','edge']:[mode],rows=[],deferred=[];
  const add=(group,label,profile='mobile',options={})=>rows.push({id:group+'-'+rows.length,group,label,profile,contentFlight:true,fineStages:group!=='v0',boot:group==='h1',...options});
  const optional=(group,label,options={})=>{
    if(available.includes(label))add(group,label,'mobile',options);
    else deferred.push({group,label,reason:'Private controlled rendition is unavailable; no substitute was measured.'});
  };
  for(const group of groups){
    if(group==='v0'){
      for(const profile of ['desktop','mobile'])for(let pair=0;pair<config[profile+'Pairs'];pair++)for(const label of pair%2?['current-color','before-color']:['before-color','current-color'])add(group,label,profile,{pair});
    }else if(group==='h1'){
      add(group,'current-color');optional(group,'no-ribbons');
      optional(group,'no-ribbons',{contentFlight:false});add(group,'current-color','mobile',{contentFlight:false});
      add(group,'current-base','mobile',{contentFlight:false});
    }else if(group==='h2'){
      add(group,'current-color');optional(group,'no-canvas-draw');optional(group,'archive-block');
    }else if(group==='h3'){
      add(group,'current-color');optional(group,'model-prewarm',{prewarm:true});
    }else if(group==='h4'){
      add(group,'current-color');optional(group,'thematic-off');optional(group,'shared-off');
    }else if(group==='h5'){
      add(group,'current-color');optional(group,'archive-bypass');
    }else if(group==='edge'){
      add(group,'current-color');optional(group,'edge-bypass');
    }
  }
  return {mode,rows,deferred};
}

function validateIdentities(inputs,candidate,before=beforeCommit){
  assert.match(candidate||'',/^[a-f0-9]{40}$/,'exact current candidate SHA required');
  for(const [label,input]of Object.entries(inputs)){
    const m=input.manifest;assert.equal(m.sourceDirty,false,'dirty source: '+label);
    assert.equal(m.sourceCommit,m.candidateCommit,'candidate/source mismatch: '+label);
    assert.match(m.sourceTree||'',/^[a-f0-9]{40}$/);assert.match(m.artifactDigest||'',/^[a-f0-9]{64}$/);
    assert.equal(m.sourceCommit,label==='before-color'?before:candidate,'wrong source: '+label);
    assert.equal(variant(m).id,label==='current-base'?'base':'color','wrong visual variant: '+label);
  }
  const base=inputs['current-base']?.manifest,color=inputs['current-color']?.manifest;
  assert.ok(base&&color,'current base and Color lineage required');
  assert.equal(color.sourceTree,base.sourceTree,'current base/Color tree mismatch');
  assert.equal(color.derivation?.baseArtifactDigest,base.artifactDigest,'wrong current Color parent artifact');
  assert.equal(variant(color).baseEngine,base.components.engine,'wrong current Color base engine');
  for(const [label,input]of Object.entries(inputs)){
    if(['before-color','current-base','current-color'].includes(label))continue;
    const m=input.manifest,d=m.derivation;
    assert.equal(m.sourceTree,color.sourceTree,'diagnostic source tree mismatch: '+label);
    assert.equal(d?.kind,'writing-diagnostic-intervention','undeclared diagnostic rendition: '+label);
    assert.equal(d.intervention,label,'wrong intervention label');
    assert.equal(d.baseArtifactDigest,color.artifactDigest,'wrong diagnostic parent artifact');
    assert.notEqual(m.artifactDigest,color.artifactDigest,'diagnostic bytes were not changed');
    assert.notEqual(variant(m).fingerprint,variant(color).fingerprint,'diagnostic runtime reuses the control identity');
    assert.ok(Array.isArray(d.patches)&&d.patches.length,'missing diagnostic patch identity');
  }
  return true;
}

function unionDuration(intervals,start,end){
  const spans=intervals.map(x=>[Math.max(start,x.start),Math.min(end,x.start+x.duration)]).filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b>a).sort((a,b)=>a[0]-b[0]);
  let total=0,left=null,right=null;
  for(const [a,b]of spans){
    if(left===null){left=a;right=b;}
    else if(a<=right)right=Math.max(right,b);
    else {total+=right-left;left=a;right=b;}
  }
  return total+(left===null?0:right-left);
}

function windowSummary(raw,kind,start,end){
  assert.ok(Number.isFinite(start)&&Number.isFinite(end)&&end>start,'invalid diagnostic window');
  const requestedEnd=end;
  for(const frame of raw.frames)if(frame.started<requestedEnd&&frame.started+frame.duration>requestedEnd)end=Math.max(end,frame.started+frame.duration);
  assert.ok(end<=raw.end,'raw record does not contain the full boundary callback');
  const frames=raw.frames.filter(x=>x.started>=start&&x.started<end);
  const data={...raw,start,end,elapsed:end-start,frames},row=summarize(data,kind);
  const events=raw.events.filter(x=>x.time>=start&&x.time<=end);
  const overlappingLongTasks=raw.longTasks.filter(x=>x.start<end&&x.start+x.duration>start);
  return {...row,events,rawStates:raw.states.filter(x=>x.started>=start&&x.started<end),overlappingLongTasks,preparationUnionMs:unionDuration(row.rawPreparation,start,end),fineStages:events.filter(x=>x.kind==='stage'),requestedEndMs:requestedEnd,boundaryPolicy:'A callback containing the nominal end is retained whole and extends the window to its completion. Ready latency uses the navigation marker. Overlapping long tasks are retained separately.'};
}

function splitFlight(raw){
  const starts=raw.events.filter(x=>x.kind==='navigation-start'),ends=raw.events.filter(x=>x.kind==='navigation-ready');
  assert.equal(starts.length,1,'one navigation start required');assert.equal(ends.length,1,'one navigation ready required');
  const start=starts[0].time,end=ends[0].time,normal=windowSummary(raw,'flight',start,end),arrivalStart=normal.window.endMs,arrivalEnd=arrivalStart+400;
  assert.ok(raw.end>=arrivalEnd,'incomplete arrival detail window');
  const arrival=windowSummary(raw,'arrival-detail',arrivalStart,arrivalEnd),inclusive=windowSummary(raw,'input-through-arrival',raw.start,arrival.window.endMs);
  try{transition(normal);normal.budgetPass=true;}catch(error){normal.budgetPass=false;normal.budgetError=error.message;}
  const firstPaint=normal.rawFrames.find(x=>x.painted),firstFlying=normal.rawStates.find(x=>x.travel==='flying');
  const diagnosticPreparation=raw.events.filter(x=>x.kind==='diagnostic-preparation'&&x.start>=raw.start&&x.start+x.duration<=end);
  return {normal,arrival,inclusive,firstPaintResponseMs:firstPaint?firstPaint.started-raw.start:null,firstFlightPaintResponseMs:firstFlying?firstFlying.started-raw.start:null,inputToReadyMs:end-raw.start,readyPlus400Ms:arrival.window.endMs-raw.start,readyCallbackTailMs:arrivalStart-end,diagnosticPreparation,preparationAndFlightUnionMs:unionDuration([...inclusive.rawPreparation,...diagnosticPreparation],raw.start,arrival.window.endMs)};
}

function installStateRecorder(){
  window.__writingStates=[];
  const native=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=callback=>native(time=>{
    const started=performance.now(),before=window.__qualityMotion.paints;callback(time);
    if(window.__qualityMotion.paints<=before)return;
    const d=document.querySelector('.space-scene')?.dataset;if(!d)return;
    window.__writingStates.push({time,started,ended:performance.now(),route:d.route,travel:d.travel,geometry:d.geometry,detail:d.detail,quality:d.quality,cadence:d.cadence,rooms:d.rooms,roomModels:d.roomModels,camera:d.camera,ribbonFaces:d.ribbonFaces});
  });
}

async function snapshot(page){
  return page.evaluate(()=>{
    const start=window.__qualityStart||0,end=performance.now(),d=document.querySelector('.space-scene').dataset;
    return {...window.__qualityMotion,start,end,elapsed:end-start,states:window.__writingStates||[],state:d.state,quality:d.quality,cadence:d.cadence,geometry:d.geometry,detail:d.detail,camera:d.camera,contentFlight:window.SiteNavigation?.contentFlight?.(),scrollY,scrollHeight:document.documentElement.scrollHeight,viewportHeight:innerHeight};
  });
}

async function prepareBrowser(profile,options){
  const session=await open(profile,{fineStages:options.fineStages,contentFlight:options.contentFlight});
  await session.context.addInitScript(installStateRecorder);
  return session;
}

async function boot(url,profile,options){
  const {browser,page,errors}=await prepareBrowser(profile,options);
  const partial={browser:browser.version(),errors};
  try{
    await page.goto(url+'/writing.html',{waitUntil:'domcontentloaded'});await ready(page,'writing');
    await page.waitForFunction(()=>window.__qualityMotion.frames.filter(x=>x.painted).length>=3,null,{polling:20,timeout:6000});
    const rawBoot=await snapshot(page),startup=windowSummary(rawBoot,'cold-boot',0,rawBoot.end);
    Object.assign(partial,{rawBoot,startup});
    const timing=await page.evaluate(()=>({sceneReadyMs:window.__writingReady,domReadyMs:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,fcpMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null,publications:document.querySelectorAll('li.publication').length,engine:document.querySelector('meta[name="site-engine"]')?.content||null}));
    assert.equal(timing.publications,27,'Writing archive content changed');assert.ok(Number.isFinite(timing.sceneReadyMs),'missing direct-boot readiness');
    assert.equal(rawBoot.contentFlight,options.contentFlight,'content-flight condition was not applied');
    await reset(page);
    const before=await page.evaluate(()=>{window.__writingStates=[];return document.querySelector('.space-scene').dataset.camera;});
    await page.evaluate(()=>scrollTo({top:100,behavior:'instant'}));await page.waitForTimeout(450);
    const firstCamera=await page.locator('.space-scene').getAttribute('data-camera');assert.notEqual(firstCamera,before,'first Writing scroll does not move camera');
    await page.evaluate(()=>scrollTo({top:200,behavior:'instant'}));await page.waitForTimeout(450);
    const rawScroll=await snapshot(page),firstScroll=windowSummary(rawScroll,'first-scroll',rawScroll.start,rawScroll.end);
    Object.assign(partial,{timing,rawScroll,firstScroll});
    assert.deepEqual(errors,[]);
    return {browser:browser.version(),timing,startup,firstScroll,rawBoot,rawScroll,errors};
  }catch(error){
    try{partial.rawFailure=await snapshot(page);}catch(captureError){partial.captureError=captureError.message;}
    error.evidenceKind='boot';error.evidence=partial;throw error;
  }finally{await browser.close();}
}

async function startTrace(cdp){
  await cdp.send('Tracing.start',{categories:'devtools.timeline,v8.execute,blink.user_timing,cc',transferMode:'ReturnAsStream'});
}
async function stopTrace(cdp,file){
  let timer;
  const completion=new Promise((resolve,reject)=>{
    timer=setTimeout(()=>reject(Error('CDP trace completion timed out')),15000);
    cdp.once('Tracing.tracingComplete',resolve);
  });
  let stream;
  try{await cdp.send('Tracing.end');stream=(await completion).stream;}finally{clearTimeout(timer);}
  assert.ok(stream,'missing CDP trace stream');fs.mkdirSync(path.dirname(file),{recursive:true});
  const fd=fs.openSync(file,'w');
  try{
    let result;
    do{result=await cdp.send('IO.read',{handle:stream,size:1048576});fs.writeSync(fd,Buffer.from(result.data,result.base64Encoded?'base64':'utf8'));}while(!result.eof);
  }finally{fs.closeSync(fd);await cdp.send('IO.close',{handle:stream});}
  const bytes=fs.readFileSync(file);return {file:path.basename(file),bytes:bytes.length,sha256:artifact.digest(bytes),scope:'Fine-stage cold Writing trace only; tracing perturbs timings.'};
}

async function flights(url,profile,options,traceFile=null){
  const {browser,page,cdp,errors}=await prepareBrowser(profile,options),rows=[];
  const partial={browser:browser.version(),initial:null,rows,trace:null,errors};let tracing=false;
  try{
    await page.goto(url+'/research.html',{waitUntil:'domcontentloaded'});await ready(page,'research');await page.waitForTimeout(300);
    const initial=await snapshot(page);partial.initial=initial;assert.equal(initial.scrollY,0,'cold entry must start at Research top');
    assert.equal(initial.contentFlight,options.contentFlight,'content-flight condition was not applied');
    let trace=null;
    for(const [index,to]of ['writing','research','writing'].entries()){
      const from=await page.locator('body').getAttribute('data-page');
      partial.pending={index,from,to};
      if(index===0&&traceFile){await startTrace(cdp);tracing=true;}
      const action=await page.evaluate(({to,prewarm})=>{
        window.__qualityMotion.frames=[];window.__qualityMotion.longTasks=[];window.__qualityMotion.events=[];window.__writingStates=[];window.__qualityStart=performance.now();
        let preparation=null;
        if(prewarm){
          const hook=window.__writingDiagnostic?.prepareWriting;if(typeof hook!=='function')return {available:false};
          preparation=hook();
          if(preparation&&typeof preparation.then==='function')throw Error('Diagnostic prewarm must be synchronous');
        }
        const clickedAt=performance.now();document.querySelector('.site-header a[href="'+to+'.html"]').click();
        return {available:true,preparation,clickedAt};
      },{to,prewarm:index===0&&options.prewarm});
      partial.pending.action=action;
      if(!action.available){const error=Error('Controlled model-prewarm hook is unavailable');error.deferred=true;throw error;}
      if(action.preparation){assert.ok(Number.isFinite(action.preparation.duration)&&action.preparation.duration>=0,'invalid prewarm span');}
      await ready(page,to);
      const arrivalEnd=await page.evaluate(()=>{
        const event=window.__qualityMotion.events.find(x=>x.kind==='navigation-ready');if(!event)throw Error('Missing navigation-ready marker');
        let end=event.time;for(const frame of window.__qualityMotion.frames)if(frame.started<event.time&&frame.started+frame.duration>event.time)end=Math.max(end,frame.started+frame.duration);
        return end+400;
      });
      await page.waitForFunction(end=>performance.now()>=end,arrivalEnd,{polling:20,timeout:3000});
      const raw=await snapshot(page),row={from,to,action,...splitFlight(raw),raw};
      rows.push(row);partial.pending=null;
      assert.equal(raw.contentFlight,options.contentFlight);
      assert.ok(row.normal.paints>0,'no observed scene submission callbacks');assert.equal(raw.state,'active','scene inactive or failed');
      assert.ok(raw.states.every(x=>Number(x.rooms)<=3&&Number(x.roomModels)<=6),'scene working set exceeded its bounds');
      if(index===0&&tracing){trace=await stopTrace(cdp,traceFile);partial.trace=trace;tracing=false;}
    }
    assert.equal(rows[0].normal.transitionPhase,options.prewarm?'warm':'cold','cold entry model preparation does not match intervention');
    assert.equal(rows[2].normal.transitionPhase,'warm','Writing return did not reuse destination model');assert.deepEqual(errors,[]);
    return {browser:browser.version(),initial,rows,trace,errors};
  }catch(error){
    try{partial.rawFailure=await snapshot(page);}catch(captureError){partial.captureError=captureError.message;}
    error.evidenceKind='navigation';error.evidence=partial;throw error;
  }finally{
    if(tracing)partial.trace=await stopTrace(cdp,traceFile).catch(error=>({error:error.message,file:path.basename(traceFile)}));
    await browser.close();
  }
}

function distribution(values){
  const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b),count=sorted.length,index=Math.floor(count/2);
  return {count,median:count?(count%2?sorted[index]:(sorted[index-1]+sorted[index])/2):null,min:sorted[0]??null,max:sorted.at(-1)??null,values};
}
function summarizeTrials(rows){
  const groups={};
  for(const row of rows){
    const key=[row.group,row.profile,row.label,row.contentFlight?'flight-on':'flight-off'].join('/');
    (groups[key]??=[]).push(row);
  }
  return Object.fromEntries(Object.entries(groups).map(([key,set])=>{
    const complete=set.filter(x=>x.navigation?.rows.length===3&&!x.error),metric=fn=>distribution(complete.map(fn));
    return [key,{trials:set.length,complete:complete.length,errors:set.filter(x=>x.error).map(x=>({id:x.id,error:x.error})),budgetFailures:complete.filter(x=>!x.navigation.rows[0].normal.budgetPass).length,coldP50Ms:metric(x=>x.navigation.rows[0].normal.paintCallbackMs.p50),coldP95Ms:metric(x=>x.navigation.rows[0].normal.paintCallbackMs.p95),coldMaxMs:metric(x=>x.navigation.rows[0].normal.paintCallbackMs.max),coldPaints:metric(x=>x.navigation.rows[0].normal.paints),coldPaintHz:metric(x=>x.navigation.rows[0].normal.paintRateHz),coldCallbackBusyPercent:metric(x=>x.navigation.rows[0].normal.callbackBusyPercent),coldPreparationMaxMs:metric(x=>x.navigation.rows[0].normal.preparationMs.max),coldPreparationUnionMs:metric(x=>x.navigation.rows[0].normal.preparationUnionMs),inputToReadyMs:metric(x=>x.navigation.rows[0].inputToReadyMs),firstPaintResponseMs:metric(x=>x.navigation.rows[0].firstPaintResponseMs),firstFlightPaintResponseMs:metric(x=>x.navigation.rows[0].firstFlightPaintResponseMs),arrivalP95Ms:metric(x=>x.navigation.rows[0].arrival.paintCallbackMs.p95),arrivalPreparationMaxMs:metric(x=>x.navigation.rows[0].arrival.preparationMs.max),inclusivePreparationUnionMs:metric(x=>x.navigation.rows[0].preparationAndFlightUnionMs),warmP95Ms:metric(x=>x.navigation.rows[2].normal.paintCallbackMs.p95)}];
  }));
}
function pairedDeltas(rows){
  const pairs=new Map();
  for(const row of rows.filter(x=>x.group==='v0')){
    const key=row.profile+'/'+row.pair;if(!pairs.has(key))pairs.set(key,{});pairs.get(key)[row.label]=row;
  }
  return [...pairs].map(([pair,set])=>{
    const before=set['before-color']?.navigation?.rows[0],after=set['current-color']?.navigation?.rows[0];
    if(!before||!after)return {pair,complete:false};
    const delta=fn=>{const a=fn(after),b=fn(before);return Number.isFinite(a)&&Number.isFinite(b)?a-b:null;};
    return {pair,complete:true,order:rows.filter(x=>x.group==='v0'&&x.profile+'/'+x.pair===pair).map(x=>x.label),afterMinusBefore:{inputToReadyMs:delta(x=>x.inputToReadyMs),firstFlightPaintResponseMs:delta(x=>x.firstFlightPaintResponseMs),paintP50Ms:delta(x=>x.normal.paintCallbackMs.p50),paintP95Ms:delta(x=>x.normal.paintCallbackMs.p95),paintMaxMs:delta(x=>x.normal.paintCallbackMs.max),paints:delta(x=>x.normal.paints),paintHz:delta(x=>x.normal.paintRateHz),callbackBusyPercent:delta(x=>x.normal.callbackBusyPercent),preparationMaxMs:delta(x=>x.normal.preparationMs.max),inclusivePreparationUnionMs:delta(x=>x.preparationAndFlightUnionMs),arrivalPreparationMaxMs:delta(x=>x.arrival.preparationMs.max)},beforeBudgetPass:before.normal.budgetPass,afterBudgetPass:after.normal.budgetPass};
  });
}

async function main(inputRoot,output,settings={}){
  fs.mkdirSync(output,{recursive:true});const config=configuration(settings),inputs={};
  for(const label of ['before-color','current-base','current-color','no-ribbons','no-canvas-draw','archive-block','model-prewarm','thematic-off','shared-off','archive-bypass','edge-bypass']){
    const directory=path.join(inputRoot,label),file=path.join(directory,'artifact.json');if(!fs.existsSync(file))continue;
    const manifest=JSON.parse(fs.readFileSync(file)),publicDir=path.join(directory,'public');artifact.verify(publicDir,manifest);inputs[label]={publicDir,manifest};
  }
  if(process.env.WRITING_BEFORE_SHA)assert.equal(config.before,process.env.WRITING_BEFORE_SHA,'before configuration differs from checkout');
  validateIdentities(inputs,process.env.SITE_CANDIDATE_SHA,config.before);
  if(config.runtimeEngine)assert.equal(inputs['current-base'].manifest.components.engine,config.runtimeEngine,'current runtime is not the expected visual-fix engine');
  const selected=plan(config.mode,Object.keys(inputs),config);
  for(const row of selected.rows)assert.ok(inputs[row.label],'missing planned input '+row.label);
  const {server,url}=await serve(inputs),record={schema:1,kind:'writing-bounded-diagnosis',fullGate:false,performanceAcceptance:false,environment:environment(),configuration:config,profiles,budgets:require('./budgets.json').motion,plan:selected,identities:Object.fromEntries(Object.entries(inputs).map(([label,x])=>[label,{...x.manifest,files:undefined}])),protocol:'Serial trials; a fresh pinned Chromium process/context per direct boot and per cold-entry itinerary. Research starts at top. Cache disabled, gzip loopback and no network throttle. V0 pair counts/order are declared in configuration/plan. Fine-stage screens are prioritization evidence only. The light RAF/Canvas/model probe plus identical paint-state recording remains enabled for all conditions; fine-stage and optional CDP traces are diagnostic only. Normal navigation-start→ready windows and post-callback +400ms are separate; input/prewarm→arrival tail stays inclusive. A callback containing ready or the tail end remains whole; readyMs still uses the actual navigation marker. No full/native/soak suite, hosting or release acceptance.',rows:[]};
  const save=()=>{
    record.summary=summarizeTrials(record.rows);record.pairedDeltas=pairedDeltas(record.rows);
    fs.writeFileSync(path.join(output,'diagnosis.json'),JSON.stringify(record,null,2)+'\n');
  };
  try{
    save();
    for(const specification of selected.rows){
      const row={...specification,identity:record.identities[specification.label],intervention:inputs[specification.label].manifest.derivation||null,submissionMeaning:specification.label==='no-canvas-draw'?'Clear callbacks are observed; motif/ribbon painting is intentionally suppressed.':'Canvas submission callbacks, not display FPS.'};
      record.rows.push(row);save();
      try{
        const rendition=url+'/'+row.label,profile=profiles[row.profile];
        if(row.boot){row.bootResult=await boot(rendition,profile,row);save();}
        const traceFile=process.env.WRITING_DIAGNOSIS_TRACE==='true'&&row.group==='h2'&&['current-color','no-canvas-draw'].includes(row.label)?path.join(output,'traces',row.id+'-'+row.label+'.json'):null;
        row.navigation=await flights(rendition,profile,row,traceFile);row.status='collected';
      }catch(error){
        if(error.evidence)row[error.evidenceKind==='boot'?'bootFailure':'navigationFailure']=error.evidence;
        if(error.deferred){row.status='deferred';row.deferredReason=error.message;record.plan.deferred.push({group:row.group,label:row.label,reason:error.message});}
        else {row.status='error';row.error=error.stack;}
      }
      save();console.log(JSON.stringify({id:row.id,group:row.group,label:row.label,status:row.status,coldP95:row.navigation?.rows[0].normal.paintCallbackMs.p95,coldBudgetPass:row.navigation?.rows[0].normal.budgetPass,error:row.error||null}));
    }
    record.complete=record.rows.length===selected.rows.length&&record.rows.every(x=>['collected','deferred'].includes(x.status));save();
    assert.ok(record.complete,'incomplete diagnostic collection; all failed trials are retained');
  }finally{server.close();}
}
if(require.main===module)main(path.resolve(process.argv[2]),path.resolve(process.argv[3]),process.argv[4]||'screen').catch(error=>{console.error(error.stack);process.exitCode=1;});
module.exports={beforeCommit,profiles,configuration,plan,validateIdentities,unionDuration,windowSummary,splitFlight,distribution,summarizeTrials,pairedDeltas,main};
