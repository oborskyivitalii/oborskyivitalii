'use strict';
// CI controller, identity checks and HTTP tests. Deployment is exclusively Wrangler Action.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {performance}=require('node:perf_hooks');
const pkg=require('./package.cjs'),hosted=require('./hosted.cjs'),{digest}=require('../quality/artifact.cjs');
const repository='oborskyivitalii/oborskyivitalii',project='oborskyi-author-ci-staging';
const workflow='.github/workflows/site-color-review.yml',marker='<!-- site-review-deployment -->';
const byteMismatches=new WeakSet();
function positive(value){assert.ok(typeof value==='string'||typeof value==='number','expected a decimal string or number');assert.match(String(value),/^[1-9][0-9]*$/);assert.ok(Number.isSafeInteger(Number(value)));return Number(value);}
function sha(value){assert.match(value,/^[a-f0-9]{40}$/);return value;}
function stageComment(context){
  assert.equal(context.eventName,'issue_comment');
  assert.equal(context.payload?.action,'created','only newly created stage commands are accepted');
  assert.ok(context.payload.issue?.pull_request,'stage command must be on a PR');
  assert.equal(context.payload.comment?.body,'/stage','only the exact /stage command is accepted');
  assert.equal(context.payload.comment.user?.login,context.repo.owner,'only the repository owner can request staging');
  assert.equal(context.actor,context.repo.owner,'stage event actor must be the repository owner');
  return positive(context.payload.issue.number);
}
function previewEvidence(context){
  if(context.eventName!=='pull_request'||context.payload?.action!=='labeled')return false;
  assert.equal(context.payload.label?.name,'staging-regression','only the explicit staging-regression evidence label is accepted');
  assert.equal(context.payload.sender?.login,context.repo.owner,'only the owner can request stage evidence');
  assert.equal(context.actor,context.repo.owner,'stage evidence actor must be the owner');
  return true;
}
function controller(context,main){
  assert.ok(['workflow_dispatch','issue_comment'].includes(context.eventName),'staging requires explicit workflow dispatch or owner /stage command');
  if(context.eventName==='issue_comment')stageComment(context);
  assert.equal(context.ref,'refs/heads/main','staging controller must run from main');
  assert.equal(main?.protected,true,'protect main before enabling staging');
  assert.equal(main.commit.sha,context.sha,'main controller moved; start a fresh run');sha(context.sha);
}
function lease(pr,source){
  assert.equal(pr.state,'open','PR is no longer open');
  assert.equal(pr.head.repo?.full_name,repository,'fork previews cannot access deployment credentials');
  assert.equal(pr.head.sha,source,'PR head moved; start a fresh run');sha(source);return true;
}
function resolve(context,pr,main){
  assert.equal(context.repo.owner+'/'+context.repo.repo,repository);positive(pr.number);lease(pr,pr.head.sha);
  const mode=context.eventName==='pull_request'?'preview':'staging';
  if(mode==='preview'){
    previewEvidence(context);
    assert.equal(context.payload.pull_request.number,pr.number);
    lease(pr,context.payload.pull_request.head.sha);
  }else{
    controller(context,main);
    if(context.eventName==='issue_comment')assert.equal(stageComment(context),pr.number,'stage command PR differs from resolved source');
  }
  return {mode,number:String(pr.number),source:pr.head.sha,branch:mode==='preview'?'pr-'+pr.number:'candidate-staging-'+pr.head.sha};
}
function configuration(account,name,token){
  assert.match(account||'',/^[a-f0-9]{32}$/,'set CLOUDFLARE_ACCOUNT_ID');
  assert.equal(name,project,'use the existing Direct Upload project');assert.ok(token,'set CLOUDFLARE_API_TOKEN');
}
function variant(record){
  const declared=record.variant||record.components?.variant;
  const value=declared||{id:'base',contract:1,fingerprint:record.components?.engine};
  assert.ok(['base','color'].includes(value.id),'unsupported public rendition');
  assert.equal(value.contract,1,'unsupported visual contract');
  assert.match(value.fingerprint,/^[a-f0-9]{64}$/,'missing visual fingerprint');
  assert.equal(value.fingerprint,record.components?.engine,'visual fingerprint differs from served engine');
  if(record.variant&&record.components?.variant)assert.deepEqual(record.variant,record.components.variant,'conflicting visual identity');
  return value;
}
const colorInputs=['tools/staging/color.cjs','tools/site/variants.cjs','review/site-scroll-sync-20261004/FLIGHT-PROTOTYPE.cjs','review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs'];
function supportedRendition(root=path.resolve(__dirname,'../..')){
  return colorInputs.every(file=>fs.existsSync(path.join(root,file)))?'color':'base';
}
function rendition(dir,root=path.resolve(__dirname,'../..')){
  const selected=supportedRendition(root);
  if(selected==='color')require(path.join(root,'tools/staging/color.cjs')).build(dir);
  const file=path.join(dir,'artifact.json'),record=JSON.parse(fs.readFileSync(file));
  const identity=variant(record);assert.equal(identity.id,selected,'built public rendition differs from the supported source');
  record.variant=identity;record.components={...record.components,variant:identity};
  require('../quality/artifact.cjs').verify(path.join(dir,'public'),record);
  fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');
  return identity;
}
function fullGate(gate,record,url){
  if(gate.kind==='staging-gate'){
    require('../quality/staging-gate.cjs').validateGate(record.source,gate,url);
    assert.equal(String(gate.githubArtifact.id),String(record.gate.githubArtifact.id),'staging gate public artifact ID');
    assert.equal(gate.githubArtifact.uploadDigest,record.gate.githubArtifact.uploadDigest,'staging gate public upload digest');
    return true;
  }
  assert.equal(gate.kind,'hosted-gate','a preview smoke cannot authorize staging');assert.equal(gate.profile,'staging');assert.equal(gate.pass,true);
  for(const key of ['sourceCommit','sourceTree','candidateCommit','artifactDigest'])assert.equal(gate[key],record.source[key],'full gate '+key);
  assert.equal(gate.hostedOrigin,url);const sourceVariant=variant(record.source),testedVariant=variant(gate);
  assert.deepEqual(testedVariant,sourceVariant,'full gate tested a different visual rendition');
  assert.equal(String(gate.githubArtifact.id),String(record.gate.githubArtifact.id));assert.equal(gate.githubArtifact.uploadDigest,record.gate.githubArtifact.uploadDigest);
  for(const key of ['build','static','linux','native','performance','captures','host'])assert.equal(gate.jobs[key]?.result,'success','missing full job '+key);
  const reports=['lint','security','advisories','functional','lighthouse','motion','captures','hosted'];
  if(sourceVariant.id==='color')reports.push('color-functional');
  for(const kind of reports)assert.ok(gate.checkedReports.some(x=>x.kind===kind),'missing full report '+kind);
  return true;
}
function readPackage(dir,expected={}){const record=JSON.parse(fs.readFileSync(path.join(dir,'staging-package.json')));pkg.verify(dir,record,expected);return record;}
function sameBytes(actual,expected,file){
  try{assert.equal(actual,expected,'wrong served bytes '+file);}
  catch(error){error.code='ALIAS_BYTES_PENDING';byteMismatches.add(error);throw error;}
}
function httpObservation(file,result,expected){
  return {file,url:result.url,status:result.response.status,sha256:digest(result.bytes),expectedSha256:expected,headers:Object.fromEntries(['x-robots-tag','x-content-type-options','cache-control','content-type'].map(key=>[key,result.response.headers.get(key)]))};
}
async function quickHttp(base,record,fetcher=fetch,observation){
  const runtime=record.source.components.engine;
  const identity=variant(record.source);
  const names=['index.html','research.html','writing.html','talks.html','credits.html','site-revision.json','_staging/revision.json',...['space.js','navigation.js','styles.css'].map(x=>'runtime/'+runtime+'/'+x)];
  const work=names.map(async file=>{
    try{
      const result=await hosted.request(base+'/'+file,base,fetcher);
      if(observation)observation.rows.push(httpObservation(file,result,record.files[file].sha256));
      assert.equal(result.response.status,200,file);hosted.responseHeaders(result.response.headers,file.startsWith('runtime/'));
      sameBytes(digest(result.bytes),record.files[file].sha256,file);
      return {file,sha256:digest(result.bytes),status:200};
    }catch(error){if(observation)observation.failed(error,file);throw error;}
  });
  let rows;
  try{rows=await Promise.all(work);}
  catch(error){if(observation){await Promise.allSettled(work);throw observation.fatal||error;}throw error;}
  const root=await hosted.request(base+'/',base,fetcher);
  if(observation)observation.rows.push(httpObservation('/',root,record.files['index.html'].sha256));
  assert.equal(root.response.status,200);hosted.responseHeaders(root.response.headers);sameBytes(digest(root.bytes),record.files['index.html'].sha256,'/');
  const missing=await hosted.request(base+'/__pr_preview_missing_'+record.source.sourceCommit,base,fetcher);
  if(observation)observation.rows.push(httpObservation('404.html',missing,record.files['404.html'].sha256));
  assert.equal(missing.response.status,404);hosted.responseHeaders(missing.response.headers);sameBytes(digest(missing.bytes),record.files['404.html'].sha256,'404.html');
  return {rows,root:true,actual404:true,noindex:true,sourceCommit:record.source.sourceCommit,publicDigest:record.source.artifactDigest,variant:identity};
}
async function readyHttp(base,record,fetcher=fetch,options={}){
  const deadlineMs=options.deadlineMs??60000,pollMs=options.pollMs??2000;
  assert.ok(Number.isInteger(deadlineMs)&&deadlineMs>0&&deadlineMs<=60000);assert.ok(Number.isInteger(pollMs)&&pollMs>0&&pollMs<=2000);
  const clock=options.clock||(()=>performance.now()),wait=options.wait||(ms=>new Promise(resolve=>setTimeout(resolve,ms))),retain=options.retain||(()=>{});
  const started=clock(),deadline=started+deadlineMs;
  const result={schema:1,kind:'pr-preview-http',pass:false,origin:base,sourceCommit:record.source.sourceCommit,publicDigest:record.source.artifactDigest,packageDigest:record.packageDigest,readiness:{deadlineMs,pollMs,requestTimeoutMs:20000,attempts:[]}};
  const expired=()=>Object.assign(Error('staging alias did not converge within '+deadlineMs+'ms'),{code:'ALIAS_READINESS_DEADLINE'});
  const save=()=>{result.readiness.elapsedMs=Math.max(0,clock()-started);retain(structuredClone(result));};save();
  while(clock()<deadline&&result.readiness.attempts.length<Math.ceil(deadlineMs/pollMs)+1){
    const abort=new AbortController(),began=clock(),startedAt=new Date().toISOString(),observed={rows:[],errors:[]};
    const observation={rows:observed.rows,failed(error,file){observed.errors.push({file,message:error.message,code:error.code||null});if(!byteMismatches.has(error)&&!observation.fatal){observation.fatal=error;abort.abort(error);}}};
    const boundedFetcher=(url,init)=>{abort.signal.throwIfAborted();if(clock()>=deadline)throw expired();return fetcher(url,{...init,signal:AbortSignal.any([init.signal,abort.signal])});};
    let timer,error,value;
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{const e=expired();abort.abort(e);reject(e);},Math.max(1,deadline-clock()));});
    try{
      value=await Promise.race([(async()=>{
        // Wait for this edition before requesting its new immutable runtime paths.
        const file='_staging/revision.json',revision=await hosted.request(base+'/'+file,base,boundedFetcher);
        observed.revision=httpObservation(file,revision,record.files[file].sha256);
        assert.equal(revision.response.status,200,file);hosted.responseHeaders(revision.response.headers);
        sameBytes(digest(revision.bytes),record.files[file].sha256,file);
        abort.signal.throwIfAborted();if(clock()>=deadline)throw expired();
        return quickHttp(base,record,boundedFetcher,observation);
      })(),timeout]);
      if(clock()>=deadline)throw expired();
    }catch(e){error=e;abort.abort(e);}
    finally{clearTimeout(timer);}
    const attempt={number:result.readiness.attempts.length+1,startedAt,elapsedMs:Math.max(0,clock()-began),pass:!error,...structuredClone(observed)};
    if(error)Object.assign(attempt,{error:error.message,code:error.code||null,retryable:byteMismatches.has(error)});
    result.readiness.attempts.push(attempt);
    if(!error){Object.assign(result,value,{pass:true});delete result.error;save();return result;}
    result.error=error.message;save();
    if(!byteMismatches.has(error)){if(error.code==='ALIAS_READINESS_DEADLINE'){result.readiness.deadlineExceeded=true;save();}return result;}
    const remaining=deadline-clock();if(remaining<=0)break;
    await wait(Math.min(pollMs,remaining));
  }
  result.error=expired().message;result.readiness.deadlineExceeded=true;save();return result;
}
async function findRecovery(github,context){
  const runs=await github.paginate(github.rest.actions.listWorkflowRuns,{...context.repo,workflow_id:workflow.split('/').pop(),branch:'main',status:'success',per_page:100});
  for(const run of runs){
    if(String(run.id)===String(context.runId)||!['workflow_dispatch','issue_comment'].includes(run.event))continue;
    assert.equal(run.path,workflow);assert.equal(run.head_branch,'main');assert.equal(run.conclusion,'success');sha(run.head_sha);
    const jobs=await github.paginate(github.rest.actions.listJobsForWorkflowRun,{...context.repo,run_id:run.id,filter:'latest',per_page:100});
    // Ordinary PR comments and disabled staging requests can finish successfully
    // without promotion; they never replace the last accepted recovery record.
    if(!jobs.some(job=>job.name==='promote'&&job.conclusion==='success'&&Number(job.run_attempt)===positive(run.run_attempt)))continue;
    const artifacts=await github.paginate(github.rest.actions.listWorkflowRunArtifacts,{...context.repo,run_id:run.id});
    const state=artifacts.find(x=>x.name==='site-staging-recovery-'+run.id+'-'+run.run_attempt&&!x.expired);
    assert.ok(state,'previous successful staging recovery expired; reconcile before promotion');
    return {runId:String(run.id),attempt:String(run.run_attempt),controller:run.head_sha,stateId:String(state.id)};
  }
  return null;
}
function recoveryState(state,previous){
  assert.equal(state.schema,1);assert.equal(state.kind,'ci-staging-recovery');assert.equal(state.project,project);assert.equal(state.workflow,workflow);
  assert.equal(state.runId,previous.runId);assert.equal(state.attempt,previous.attempt);assert.equal(state.controller,previous.controller);
  sha(state.sourceCommit);assert.match(state.publicDigest,/^[a-f0-9]{64}$/);assert.match(state.packageDigest,/^[a-f0-9]{64}$/);
  assert.match(state.packageUploadDigest,/^(?:sha256:)?[a-f0-9]{64}$/);positive(state.packageArtifactId);packageAttempt(state);return true;
}
function packageAttempt(state){
  const value=positive(state.packageAttempt===undefined?state.attempt:state.packageAttempt);
  assert.ok(value<=positive(state.attempt),'package producer attempt exceeds promotion attempt');return value;
}
function recoveryArtifact(state,previous,artifact){
  recoveryState(state,previous);assert.equal(String(artifact.id),String(state.packageArtifactId));assert.equal(artifact.expired,false);
  assert.equal(artifact.workflow_run.id,Number(previous.runId));assert.equal(artifact.workflow_run.head_sha,previous.controller);
  assert.equal(artifact.name,'site-review-package-'+previous.runId+'-'+packageAttempt(state));
  assert.equal(artifact.digest.replace(/^sha256:/,''),state.packageUploadDigest.replace(/^sha256:/,''));return true;
}
async function priorStable(base,state,fetcher=fetch){
  let result;
  try{result=await hosted.request(base+'/_staging/revision.json',base,fetcher);}
  catch(error){if(!state&&error.cause?.code==='ENOTFOUND')return {firstPromotion:true};throw error;}
  if(state){
    assert.equal(result.response.status,200,'previous stable revision unavailable');
    const current=JSON.parse(result.bytes);assert.equal(current.sourceCommit,state.sourceCommit);assert.equal(current.publicDigest,state.publicDigest,'stable differs from retained CI recovery');
    return {firstPromotion:false};
  }
  assert.equal(result.response.status,404,'untracked staging alias; reconcile before promotion');
  const root=await hosted.request(base+'/',base,fetcher);assert.equal(root.response.status,404,'untracked site already serves the staging alias');
  return {firstPromotion:true};
}
function commentBody(state){
  const lines=[marker,'### Site review'];
  for(const [key,label]of [['preview','PR preview'],['staging','Staging']]){
    const entry=state[key];if(!entry)continue;
    lines.push('',`**${label}** · source \`${entry.source}\``,entry.status);
    if(entry.url)lines.push(`[Immutable candidate](${entry.url})`);
    if(entry.alias)lines.push(`[${key==='preview'?'Latest PR preview':'Verified staging'}](${entry.alias})`);
    lines.push(`[GitHub Actions run](${entry.run})`);
  }
  lines.push('','Preview smoke is separate from full staging acceptance.','<!-- site-review-state:'+JSON.stringify(state)+' -->');return lines.join('\n');
}
async function updateComment(github,context,entry){
  const number=positive(process.env.REVIEW_PR),{data:pr}=await github.rest.pulls.get({...context.repo,pull_number:number});
  if(pr.head.sha!==entry.source||pr.state!=='open')return;lease(pr,entry.source);
  const comments=await github.paginate(github.rest.issues.listComments,{...context.repo,issue_number:number});
  const old=comments.find(x=>x.user?.login==='github-actions[bot]'&&x.body.includes(marker));
  const state=old?.body.match(/<!-- site-review-state:(.*?) -->/)?.[1];
  const values=state?JSON.parse(state):{};values[process.env.REVIEW_MODE]=entry;
  const body=commentBody(values);
  if(old)await github.rest.issues.updateComment({...context.repo,comment_id:old.id,body});
  else await github.rest.issues.createComment({...context.repo,issue_number:number,body});
}
async function main(){
  const [mode,dir,url,out]=process.argv.slice(2),expected=pkg.expectedEnvironment();
  if(mode==='rendition'){const identity=rendition(path.resolve(dir));if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'variant='+identity.id+'\n');console.log(JSON.stringify(identity));return;}
  if(mode==='variant'){console.log(supportedRendition(dir?path.resolve(dir):undefined));return;}
  if(mode==='verify'){variant(readPackage(dir,expected).source);return;}
  if(mode==='gate'){fullGate(JSON.parse(fs.readFileSync(url)),readPackage(dir,expected),process.env.SITE_TEST_BASE_URL);return;}
  if(mode==='recovery'){
    const state=JSON.parse(fs.readFileSync(url)),record=readPackage(dir);assert.equal(record.source.sourceCommit,state.sourceCommit);assert.equal(record.source.artifactDigest,state.publicDigest);assert.equal(record.packageDigest,state.packageDigest);return;
  }
  if(mode==='prior'){
    const state=url&&fs.existsSync(url)?JSON.parse(fs.readFileSync(url)):null;
    await priorStable(hosted.origin(dir,project,true),state);return;
  }
  assert.ok(['http','http-ready'].includes(mode),'usage: review-flow.cjs verify DIR | gate DIR GATE | recovery DIR STATE | prior URL [STATE] | http[-ready] DIR URL REPORT');
  const record=readPackage(dir,expected),base=hosted.origin(url,project,process.env.SITE_STAGING_STABLE==='true');
  if(mode==='http-ready'){
    assert.equal(process.env.SITE_STAGING_STABLE,'true','alias readiness is for post-deployment staging only');
    const retain=result=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');};
    const result=await readyHttp(base,record,fetch,{retain});if(!result.pass)throw Error(result.error);return;
  }
  const result={schema:1,kind:'pr-preview-http',pass:false,origin:base};
  try{Object.assign(result,await quickHttp(base,record));result.pass=true;}
  catch(error){result.error=error.message;throw error;}
  finally{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');}
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={repository,project,workflow,positive,stageComment,previewEvidence,controller,lease,resolve,configuration,variant,colorInputs,supportedRendition,rendition,fullGate,quickHttp,readyHttp,findRecovery,recoveryState,packageAttempt,recoveryArtifact,priorStable,commentBody,updateComment};
