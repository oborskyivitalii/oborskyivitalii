'use strict';
// Bounded private attribution. Instrumented observations never authorize release.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const {pathToFileURL}=require('node:url'),artifact=require('./artifact.cjs');
function validateInput(normal,control,candidate,label='browser-gate-trace'){
  assert.match(candidate,/^[a-f0-9]{40}$/);
  for(const input of [normal,control]){
    assert.equal(input.sourceCommit,candidate);assert.equal(input.candidateCommit,candidate);assert.equal(input.sourceDirty,false);
    assert.match(input.sourceTree,/^[a-f0-9]{40}$/);assert.match(input.artifactDigest,/^[a-f0-9]{64}$/);
  }
  assert.equal(normal.sourceTree,control.sourceTree);assert.equal(normal.variant.id,'color');assert.ok(!normal.diagnostic);
  assert.equal(control.fullGate,false);assert.equal(control.diagnostic.label,label);
  assert.equal(control.derivation.parentArtifactDigest,normal.artifactDigest);assert.deepEqual(control.derivation.parentVariant,normal.variant);
  assert.notEqual(control.artifactDigest,normal.artifactDigest);
}
function saveRaw(output,name,value){
  const bytes=zlib.gzipSync(JSON.stringify(value??null)+'\n');fs.writeFileSync(path.join(output,name+'.json.gz'),bytes);
  return {file:name+'.json.gz',sha256:artifact.digest(bytes),bytes:bytes.length};
}
function lighthouseEvidence(result){
  assert.equal(result.lhr?.configSettings?.formFactor,'mobile');
  assert.equal(result.lhr?.configSettings?.throttlingMethod,'simulate');
  assert.ok(Array.isArray(result.artifacts?.Trace?.traceEvents)&&result.artifacts.Trace.traceEvents.length>0,'original Lighthouse trace required');
  assert.ok(Array.isArray(result.artifacts?.DevtoolsLog)&&result.artifacts.DevtoolsLog.length>0,'original network/DevTools evidence required');
  assert.ok(result.artifacts.Trace.traceEvents.some(row=>row.name==='ProfileChunk'&&row.args?.data?.cpuProfile?.samples?.length>0),'function-level CPU samples required');
  assert.ok(Number.isFinite(result.lhr.audits['total-blocking-time'].numericValue),'measured TBT required');
  return {trace:result.artifacts.Trace,devtoolsLog:result.artifacts.DevtoolsLog};
}
function heartbeat(){
  const samples=[];let dropped=0;
  const timer=setInterval(()=>{
    if(samples.length>=400){dropped++;return;}
    samples.push({time:performance.now(),hidden:document.hidden,visibility:document.visibilityState,ready:document.readyState,paints:window.__quality?.paints,callbacks:window.__quality?.callbacks,phase:document.querySelector('.space-scene')?.dataset.phase});
  },50);
  window.__causeHeartbeat=()=>({samples,dropped});window.__causeStopHeartbeat=()=>clearInterval(timer);
}
async function research(inputs,url,output,record){
  const {toolRequire}=require('./common.cjs');
  const {default:lighthouse}=await import(pathToFileURL(toolRequire.resolve('lighthouse')).href);
  const launcher=await import(pathToFileURL(toolRequire.resolve('chrome-launcher')).href);
  for(let run=1;run<=3;run++){
    const chrome=await launcher.launch({chromePath:toolRequire('playwright').chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']});
    try{
      // Same mobile/simulated settings as the full gate, with explicit CPU samples.
      const result=await lighthouse(url+'/color/research.html',{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices'],additionalTraceCategories:['disabled-by-default-v8.cpu_profiler']});
      const lhr=result.lhr,row={run,evidenceValid:false,lighthouseVersion:lhr?.lighthouseVersion,config:lhr?.configSettings,environment:lhr?.environment,
        tbtMs:lhr?.audits?.['total-blocking-time']?.numericValue,lcpMs:lhr?.audits?.['largest-contentful-paint']?.numericValue,
        lhr:saveRaw(output,'research-'+run+'-lhr',lhr),trace:saveRaw(output,'research-'+run+'-trace',result.artifacts?.Trace),devtoolsLog:saveRaw(output,'research-'+run+'-devtoolslog',result.artifacts?.DevtoolsLog)};
      record.rows.push(row);save(record,output);
      lighthouseEvidence(result);row.evidenceValid=true;save(record,output);
    }finally{await chrome.kill();}
  }
  return inputs;
}
async function browserPage(engine,url,trace=false){
  const {toolRequire,launchOptions}=require('./common.cjs'),functional=require('./functional.cjs');
  const browser=await toolRequire('playwright')[engine].launch(launchOptions(engine));
  try{
    const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference',colorScheme:'light'});
    const code='('+functional.probe.toString()+')();try{localStorage.setItem("vo.theme","light");}catch{}'+
      (trace?'('+require('./browser-gate-trace.cjs').install.toString()+')();('+heartbeat.toString()+')();':'');
    await context.addInitScript({content:code});const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));await page.goto(url+'/index.html',{waitUntil:'load'});
    return {browser,page,errors,version:browser.version()};
  }catch(error){await browser.close();throw error;}
}
async function webkitTrial(url,output,record,loaded,run){
  const functional=require('./functional.cjs');
  const backgrounds=[];let target;
  const row={run,mode:loaded?'loaded':'alone',pass:false};
  try{
    // Backgrounds use the uninstrumented normal Color bytes.
    if(loaded)for(const engine of ['chromium','firefox']){
      const b=await browserPage(engine,url+'/color');backgrounds.push({...b,engine});
      await b.page.waitForFunction(()=>document.querySelector('.space-scene')?.dataset.ready==='true',null,{polling:50,timeout:3000});
      backgrounds.at(-1).startState=await functional.state(b.page);
    }
    target=await browserPage('webkit',url+'/control',true);row.version=target.version;
    try{row.checks=await functional.normalStartup(target.page);row.pass=true;}
    catch(error){row.error=error.message;row.stack=error.stack;}
    // Keep the original result, then observe recovery separately; never retry.
    await target.page.waitForTimeout(2200);
    const raw=await target.page.evaluate(()=>{window.__causeStopHeartbeat();return {trace:window.__browserGateTrace.snapshot(),heartbeat:window.__causeHeartbeat()};});
    row.raw=saveRaw(output,'webkit-'+row.mode+'-'+run,{...row,...raw,errors:target.errors});
    row.backgrounds=[];
    for(const b of backgrounds)row.backgrounds.push({engine:b.engine,version:b.version,errors:b.errors,startState:b.startState,state:await functional.state(b.page)});
    row.errors=target.errors;row.evidenceValid=false;record.rows.push(row);save(record,output);
    require('./browser-gate-diagnostics.cjs').validateTrace(raw.trace);assert.equal(raw.heartbeat.dropped,0);assert.deepEqual(row.errors,[]);
    for(const b of row.backgrounds){assert.deepEqual(b.errors,[]);assert.ok(b.state.paints>b.startState.paints,'background must actually render during the observation');}
    row.evidenceValid=true;save(record,output);
  }finally{await Promise.allSettled([target,...backgrounds].filter(Boolean).map(b=>b.browser.close()));}
}
async function webkit(inputs,url,output,record){
  for(const loaded of [false,true])for(let run=1;run<=2;run++)await webkitTrial(url,output,record,loaded,run);
  return inputs;
}
function save(record,output){fs.writeFileSync(path.join(output,'cause.json'),JSON.stringify(record,null,2)+'\n');}
async function main(scope,normalDir,controlDir,output){
  assert.ok(['webkit','lighthouse'].includes(scope));fs.mkdirSync(output,{recursive:true});
  const {root,environment}=require('./common.cjs');
  const candidate=process.env.SITE_CANDIDATE_SHA||require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  const inputs=Object.fromEntries([['color',normalDir],['control',controlDir]].map(([label,dir])=>{
    const manifest=JSON.parse(fs.readFileSync(path.join(dir,'artifact.json'))),publicDir=path.join(dir,'public');artifact.verify(publicDir,manifest);return [label,{manifest,publicDir}];
  }));
  validateInput(inputs.color.manifest,inputs.control.manifest,candidate);
  const record={schema:1,kind:'cold-browser-cause-attribution',scope,fullGate:false,performanceAcceptance:false,complete:false,pass:false,
    protocol:'Fresh-process WebKit cold Index twice alone and twice with normal Color Chromium/Firefox rendering; original 3000ms foreground, 180ms baseline and 1500ms next-paint fixture. Separate 2200ms recovery observation never retries or alters the failed result. Research has three fresh mobile/simulated Lighthouse trials on normal Color bytes with original trace, network log and explicit CPU samples. Collection success is never performance acceptance.',
    environment:environment(),identities:Object.fromEntries(Object.entries(inputs).map(([label,v])=>[label,{...v.manifest,files:undefined}])),rows:[],errors:[]};
  save(record,output);const {server,url}=await require('./writing-probe.cjs').serve(inputs);
  try{
    if(scope==='webkit')await webkit(inputs,url,output,record);else await research(inputs,url,output,record);
    record.complete=record.rows.length===(scope==='webkit'?4:3)&&record.rows.every(row=>row.evidenceValid);record.pass=record.complete;save(record,output);assert.equal(record.complete,true);
  }catch(error){record.errors.push({message:error.message,stack:error.stack});save(record,output);throw error;}
  finally{server.close();}
}
if(require.main===module){assert.equal(process.argv.length,6);main(process.argv[2],...process.argv.slice(3).map(value=>path.resolve(value))).catch(error=>{console.error(error.stack);process.exitCode=1;});}
module.exports={validateInput,lighthouseEvidence,saveRaw,heartbeat,webkitTrial,main};
