'use strict';
// Private causal localization. Fine-stage measurements are never release acceptance.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const artifact=require('./artifact.cjs'),{environment}=require('./common.cjs');
const {serve,ready}=require('./writing-probe.cjs');
const {profiles,prepareBrowser,boot,flights,snapshot,distribution,summarizeTrials,validateIdentities,unionDuration}=require('./writing-diagnosis.cjs');

const labels=['current-color','thematic-off','shared-off','model-profile','model-no-thematic','model-no-shared','layout-control','controls-off','row-grid-off','title-flex-off'];
const layoutLabels=labels.slice(6),artifactLabels=['current-base',...labels];

function configuration(value={}){
  const settings=typeof value==='string'?JSON.parse(fs.readFileSync(path.resolve(value))):value;
  const config={schema:1,mode:'localize',repeats:2,fullGate:false,...settings};
  assert.equal(config.schema,1,'unsupported localization configuration');
  assert.equal(config.mode,'localize','unknown localization mode');
  assert.equal(config.repeats,2,'localization requires exactly two balanced serial rounds');
  assert.equal(config.fullGate,false,'localization cannot accept a full gate');
  if(config.runtimeEngine)assert.match(config.runtimeEngine,/^[a-f0-9]{64}$/,'invalid expected runtime engine');
  return config;
}

function plan(available,settings={}){
  const config=configuration(settings);
  for(const label of artifactLabels)assert.ok(available.includes(label),'missing planned localization artifact '+label);
  const rows=[];
  for(let round=0;round<config.repeats;round++){
    for(const label of round%2?[...labels].reverse():labels){
      rows.push({id:'localize-'+rows.length,group:'localize',round,label,inputLabel:label,profile:'mobile',contentFlight:true,fineStages:true,boot:true,layoutIntervention:layoutLabels.includes(label)?label:null});
    }
  }
  return {rows,labels:[...labels],deferred:[]};
}

function validateInputs(inputs,candidate,runtimeEngine){
  for(const label of artifactLabels)assert.ok(inputs[label],'missing planned localization artifact '+label);
  validateIdentities(inputs,candidate);
  if(runtimeEngine)assert.equal(inputs['current-base'].manifest.components.engine,runtimeEngine,'current runtime differs from the localization plan');
  return true;
}

function stageKey(event){
  return [event.part||'unknown',event.route||event.page||'',event.family||'',event.symbol||event.motif||''].join('/');
}

function summarizeStages(raw){
  if(!raw)return {};
  const groups={};
  for(const event of raw.events||[]){
    if(event.kind!=='stage'||!Number.isFinite(event.start)||!Number.isFinite(event.duration))continue;
    (groups[stageKey(event)]??=[]).push(event);
  }
  return Object.fromEntries(Object.entries(groups).map(([key,events])=>[key,{count:events.length,durationMs:distribution(events.map(x=>x.duration)),unionMs:unionDuration(events,raw.start,raw.end),events}]));
}

function summarizeModels(raw){
  const groups={};
  for(const event of raw?.events||[]){
    if(event.kind!=='model-profile')continue;
    const key=[event.part,event.route||event.page||'',event.family,event.symbol,event.compact?'compact':'full'].join('/');
    (groups[key]??=[]).push(event);
  }
  return Object.fromEntries(Object.entries(groups).map(([key,events])=>[key,{observations:events.length,constructionDurationMs:distribution(events.map(x=>x.duration)),instances:distribution(events.map(x=>x.count)),templateMisses:distribution(events.map(x=>x.templateMisses)),vertices:distribution(events.map(x=>x.vertices)),faces:distribution(events.map(x=>x.faces)),lines:distribution(events.map(x=>x.lines)),events,note:'Duration is accumulated disjoint per-instance construction work, not elapsed start→end. It nests within model-build and must not be added to model-build or face preparation.'}]));
}

function auditFailures(row){
  const audits=[row.bootResult?.layoutAudit,...(row.navigation?.rows||[]).map(x=>x.layoutAudit)].filter(Boolean);
  return audits.filter(x=>![x.pass,x.valid,x.ok].includes(true)||[x.pass,x.valid,x.ok].includes(false));
}

function summarizeLocalization(rows){
  const common=summarizeTrials(rows),groups={};
  for(const row of rows)(groups[row.label]??=[]).push(row);
  const details=Object.fromEntries(Object.entries(groups).map(([label,set])=>{
    const complete=set.filter(x=>x.status==='collected'&&!x.error),metric=fn=>distribution(complete.map(fn));
    return [label,{trials:set.length,complete:complete.length,errors:set.filter(x=>x.error).map(x=>({id:x.id,error:x.error})),auditFailures:set.flatMap(x=>auditFailures(x).map(audit=>({id:x.id,audit}))),directSceneReadyMs:metric(x=>x.bootResult?.timing.sceneReadyMs),directBootP95Ms:metric(x=>x.bootResult?.startup.paintCallbackMs.p95),directBootMaxMs:metric(x=>x.bootResult?.startup.paintCallbackMs.max),firstScrollP95Ms:metric(x=>x.bootResult?.firstScroll.paintCallbackMs.p95),firstScrollMaxMs:metric(x=>x.bootResult?.firstScroll.paintCallbackMs.max),stages:set.map(x=>({id:x.id,boot:summarizeStages(x.bootResult?.rawBoot||x.bootFailure?.rawBoot),cold:summarizeStages(x.navigation?.rows[0]?.raw||x.navigationFailure?.rows?.[0]?.raw),warm:summarizeStages(x.navigation?.rows[2]?.raw||x.navigationFailure?.rows?.[2]?.raw)})),models:set.map(x=>({id:x.id,boot:summarizeModels(x.bootResult?.rawBoot||x.bootFailure?.rawBoot),cold:summarizeModels(x.navigation?.rows[0]?.raw||x.navigationFailure?.rows?.[0]?.raw),warm:summarizeModels(x.navigation?.rows[2]?.raw||x.navigationFailure?.rows?.[2]?.raw)}))}];
  }));
  return {common,details};
}

function interventionIdentity(label,manifest,calibration,installerDigest){
  if(!layoutLabels.includes(label))return {kind:label==='current-color'?'canonical-control':'artifact-intervention',artifactDigest:manifest.artifactDigest,derivation:manifest.derivation||null};
  const descriptor={kind:'writing-layout-init-intervention',intervention:label,artifactDigest:manifest.artifactDigest,baseArtifactDigest:manifest.derivation?.baseArtifactDigest,calibrationDigest:artifact.digest(JSON.stringify(calibration)),installerDigest};
  return {...descriptor,derivation:manifest.derivation,experimentFingerprint:artifact.digest(JSON.stringify(descriptor)),note:'A private derived archive hook plus this calibrated init intervention defines the experiment. It is not a deployable release runtime.'};
}

async function calibrateControl(url,profile,layout){
  const session=await prepareBrowser(profile,{fineStages:true,contentFlight:true}),partial={errors:session.errors};
  try{
    await session.page.goto(url+'/writing.html',{waitUntil:'domcontentloaded'});
    await ready(session.page,'writing');await session.page.waitForTimeout(300);
    const calibration=await layout.calibrate(session.page);
    partial.calibration=calibration;partial.raw=await snapshot(session.page);
    assert.deepEqual(session.errors,[],'calibration browser errors');
    return {calibration,browser:session.browser.version(),errors:session.errors,raw:partial.raw,scope:'Separate fresh browser; measured only to freeze canonical geometry before trials. Calibration timings are not trial observations.'};
  }catch(error){
    try{partial.rawFailure=await snapshot(session.page);}catch(captureError){partial.captureError=captureError.message;}
    error.evidenceKind='calibration';error.evidence=partial;throw error;
  }finally{await session.browser.close();}
}

async function collectTrial(row,inputs,url,profile,calibration,helpers={boot,flights},save=()=>{}){
  const options={...row};
  if(row.layoutIntervention)options.layoutConfiguration={calibration,intervention:row.layoutIntervention};
  try{
    const rendition=url+'/'+row.inputLabel;
    row.bootResult=await helpers.boot(rendition,profile,options);save();
    // Always create a fresh Research process after the independent direct Writing boot.
    row.navigation=await helpers.flights(rendition,profile,options,null);
    if(['model-profile','model-no-thematic','model-no-shared'].includes(row.label)){
      for(const raw of [row.bootResult.rawBoot,row.navigation.rows[0]?.raw]){
        assert.ok(raw?.events?.some(event=>event.kind==='model-profile'&&(event.route||event.page)==='writing'&&event.disjoint===true),'missing disjoint Writing model construction profile');
      }
    }
    if(row.layoutIntervention){
      assert.ok(row.bootResult.layoutAudit,'missing post-window boot layout audit');
      for(const index of [0,2])assert.ok(row.navigation.rows[index]?.layoutAudit,'missing post-window Writing flight layout audit');
    }
    const failures=auditFailures(row);assert.deepEqual(failures,[],'controlled layout geometry audit failed');
    row.status='collected';
  }catch(error){
    if(error.evidence)row[error.evidenceKind==='boot'?'bootFailure':'navigationFailure']=error.evidence;
    row.status='error';row.error=error.stack||error.message;
  }
  save();return row;
}

async function main(inputRoot,output,settings={}){
  fs.mkdirSync(output,{recursive:true});const config=configuration(settings),inputs={};
  const record={schema:1,kind:'writing-causal-localization',fullGate:false,performanceAcceptance:false,environment:environment(),configuration:config,profile:profiles.mobile,protocol:'Two balanced serial rounds, the second reverses every condition. Only mobile 390×844 DPR3 CPU×4 dark. New pinned Chromium process/context for each direct Writing boot and each Research→Writing→Research→Writing itinerary. Cache disabled and gzip loopback. Fine-stage instrumentation is identical and diagnostic only. Calibration uses a separate canonical Color browser before all trials. Layout intervention footprints are audited after measured windows; failed, partial and budget-failing observations stay in the record. Do not sum nested stage spans, call clear callbacks display FPS, compare unrelated runner hosts, or use this private screen as release acceptance.',rows:[],complete:false};
  const save=()=>{record.summary=summarizeLocalization(record.rows);fs.writeFileSync(path.join(output,'localization.json'),JSON.stringify(record,null,2)+'\n');};
  save();let server;
  try{
    for(const label of artifactLabels){
      const directory=path.join(inputRoot,label),file=path.join(directory,'artifact.json');
      assert.ok(fs.existsSync(file),'missing planned localization artifact '+label);
      const manifest=JSON.parse(fs.readFileSync(file)),publicDir=path.join(directory,'public');artifact.verify(publicDir,manifest);inputs[label]={manifest,publicDir};
    }
    validateInputs(inputs,process.env.SITE_CANDIDATE_SHA,config.runtimeEngine);
    record.plan=plan(Object.keys(inputs),config);record.identities=Object.fromEntries(Object.entries(inputs).map(([label,input])=>[label,{...input.manifest,files:undefined}]));save();
    const served=await serve(inputs);server=served.server;
    const layout=require('./writing-layout.cjs'),installerDigest=artifact.digest(fs.readFileSync(path.join(__dirname,'writing-layout.cjs')));
    record.calibration=await calibrateControl(served.url+'/current-color',profiles.mobile,layout);save();
    for(const specification of record.plan.rows){
      const row={...specification,identity:record.identities[specification.inputLabel],intervention:interventionIdentity(specification.label,inputs[specification.inputLabel].manifest,record.calibration.calibration,installerDigest)};
      record.rows.push(row);save();
      await collectTrial(row,inputs,served.url,profiles.mobile,record.calibration.calibration,{boot,flights},save);
      console.log(JSON.stringify({id:row.id,label:row.label,status:row.status,coldP95Ms:row.navigation?.rows[0]?.normal.paintCallbackMs.p95,coldBudgetPass:row.navigation?.rows[0]?.normal.budgetPass,error:row.error||null}));
    }
    record.complete=record.rows.length===record.plan.rows.length&&record.rows.every(row=>row.status==='collected');save();
    assert.ok(record.complete,'incomplete localization collection; all failed trials are retained');
    return record;
  }catch(error){
    record.error=error.stack||error.message;if(error.evidence)record[error.evidenceKind+'Failure']=error.evidence;save();throw error;
  }finally{server?.close();}
}

if(require.main===module)main(path.resolve(process.argv[2]),path.resolve(process.argv[3]),process.argv[4]||{}).catch(error=>{console.error(error.stack);process.exitCode=1;});
module.exports={labels,layoutLabels,artifactLabels,configuration,plan,validateInputs,stageKey,summarizeStages,summarizeModels,auditFailures,summarizeLocalization,interventionIdentity,calibrateControl,collectTrial,main};
