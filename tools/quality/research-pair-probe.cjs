'use strict';
// Balanced same-runner normal bytes; original traces survive every failed trial.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const artifact=require('./artifact.cjs'),{saveRaw,lighthouseEvidence}=require('./cause-probe.cjs');
function validatePair(inputs,candidate,reference){
  for(const [label,source]of [['candidate',candidate],['reference',reference]]){
    const m=inputs[label].manifest;assert.equal(m.sourceCommit,source);assert.equal(m.candidateCommit,source);assert.equal(m.sourceDirty,false);
    assert.match(m.sourceTree,/^[a-f0-9]{40}$/);assert.equal(m.variant.id,'color');assert.ok(!m.diagnostic&&!m.variant.diagnostic);assert.equal(m.fullGate,undefined);
  }
  assert.notEqual(candidate,reference,'paired source revisions must differ');
}
async function trial(lighthouse,launcher,pw,url,label,profiled,run,output,record,save){
  const chrome=await launcher.launch({chromePath:pw.chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']});
  try{
    const flags={port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices']};
    if(profiled)flags.additionalTraceCategories=['disabled-by-default-v8.cpu_profiler'];
    const result=await lighthouse(url+'/'+label+'/research.html',flags),lhr=result.lhr,prefix=[profiled?'profiled':'normal',label,run].join('-');
    const row={label,profiled,run,evidenceValid:false,lighthouseVersion:lhr?.lighthouseVersion,config:lhr?.configSettings,environment:lhr?.environment,
      tbtMs:lhr?.audits?.['total-blocking-time']?.numericValue,lcpMs:lhr?.audits?.['largest-contentful-paint']?.numericValue,
      lhr:saveRaw(output,prefix+'-lhr',lhr),trace:saveRaw(output,prefix+'-trace',result.artifacts?.Trace),devtoolsLog:saveRaw(output,prefix+'-devtoolslog',result.artifacts?.DevtoolsLog)};
    record.rows.push(row);save();
    assert.equal(row.config.formFactor,'mobile');assert.equal(row.config.throttlingMethod,'simulate');assert.ok(Number.isFinite(row.tbtMs));
    assert.ok(result.artifacts.Trace.traceEvents.length);assert.ok(result.artifacts.DevtoolsLog.length);
    if(profiled)lighthouseEvidence(result);row.evidenceValid=true;save();
  }finally{await chrome.kill();}
}
async function main(candidateDir,referenceDir,output){
  fs.mkdirSync(output,{recursive:true});
  const inputs=Object.fromEntries([['candidate',candidateDir],['reference',referenceDir]].map(([id,dir])=>{
    const manifest=JSON.parse(fs.readFileSync(path.join(dir,'artifact.json'))),publicDir=path.join(dir,'public');artifact.verify(publicDir,manifest);return [id,{manifest,publicDir}];
  }));
  validatePair(inputs,process.env.SITE_CANDIDATE_SHA,process.env.CAUSE_REFERENCE_SHA);
  const {toolRequire,environment}=require('./common.cjs'),{default:lighthouse}=await import(pathToFileURL(toolRequire.resolve('lighthouse')).href),launcher=await import(pathToFileURL(toolRequire.resolve('chrome-launcher')).href);
  const record={schema:1,kind:'research-source-pair',fullGate:false,performanceAcceptance:false,complete:false,pass:false,
    protocol:'Three balanced pairs of fresh Chromium/mobile/simulated Lighthouse on normal Color, then three separately labeled CPU-profiled pairs. Order reference/candidate, candidate/reference, reference/candidate. No parallel browsers, retries, discarded failures or changed budgets. This loopback causal comparison does not accept the full hosted gate.',
    environment:environment(),identities:Object.fromEntries(Object.entries(inputs).map(([id,v])=>[id,{...v.manifest,files:undefined}])),rows:[],errors:[]};
  const save=()=>fs.writeFileSync(path.join(output,'research-pair.json'),JSON.stringify(record,null,2)+'\n');save();
  const {server,url}=await require('./writing-probe.cjs').serve(inputs);
  try{
    for(const profiled of [false,true])for(let run=1;run<=3;run++)for(const label of run===2?['candidate','reference']:['reference','candidate'])await trial(lighthouse,launcher,toolRequire('playwright'),url,label,profiled,run,output,record,save);
    record.complete=record.rows.length===12&&record.rows.every(row=>row.evidenceValid);record.pass=record.complete;save();assert.equal(record.complete,true);
  }catch(error){record.errors.push({message:error.message,stack:error.stack});save();throw error;}
  finally{server.close();}
}
if(require.main===module)main(...process.argv.slice(2).map(p=>path.resolve(p))).catch(error=>{console.error(error.stack);process.exitCode=1;});
module.exports={validatePair,main};
