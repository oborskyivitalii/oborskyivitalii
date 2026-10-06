'use strict';
// CI controller, identity checks and HTTP tests. Deployment is exclusively Wrangler Action.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pkg=require('./package.cjs'),hosted=require('./hosted.cjs'),{digest}=require('../quality/artifact.cjs');
const repository='oborskyivitalii/oborskyivitalii',project='oborskyi-author-ci-staging';
const workflow='.github/workflows/site-color-review.yml',marker='<!-- site-review-deployment -->';
function positive(value){assert.match(String(value),/^[1-9][0-9]*$/);assert.ok(Number.isSafeInteger(Number(value)));return Number(value);}
function sha(value){assert.match(value,/^[a-f0-9]{40}$/);return value;}
function controller(context,main){
  assert.equal(context.eventName,'workflow_dispatch','staging requires explicit workflow dispatch');
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
    assert.equal(context.payload.pull_request.number,pr.number);
    lease(pr,context.payload.pull_request.head.sha);
  }else controller(context,main);
  return {mode,number:String(pr.number),source:pr.head.sha,branch:mode==='preview'?'pr-'+pr.number:'candidate-staging-'+pr.head.sha};
}
function configuration(account,name,token){
  assert.match(account||'',/^[a-f0-9]{32}$/,'set CLOUDFLARE_ACCOUNT_ID');
  assert.equal(name,project,'use the existing Direct Upload project');assert.ok(token,'set CLOUDFLARE_API_TOKEN');
}
function fullGate(gate,record,url){
  assert.equal(gate.kind,'hosted-gate','a preview smoke cannot authorize staging');assert.equal(gate.profile,'staging');assert.equal(gate.pass,true);
  for(const key of ['sourceCommit','sourceTree','candidateCommit','artifactDigest'])assert.equal(gate[key],record.source[key],'full gate '+key);
  assert.equal(gate.hostedOrigin,url);assert.equal(gate.variant?.id,'color');assert.equal(gate.variant.fingerprint,record.source.variant.fingerprint);
  assert.equal(String(gate.githubArtifact.id),String(record.gate.githubArtifact.id));assert.equal(gate.githubArtifact.uploadDigest,record.gate.githubArtifact.uploadDigest);
  for(const key of ['build','static','linux','native','performance','captures','host'])assert.equal(gate.jobs[key]?.result,'success','missing full job '+key);
  for(const kind of ['lint','security','advisories','functional','color-functional','lighthouse','motion','captures','hosted'])assert.ok(gate.checkedReports.some(x=>x.kind===kind),'missing full report '+kind);
  return true;
}
function readPackage(dir,expected={}){const record=JSON.parse(fs.readFileSync(path.join(dir,'staging-package.json')));pkg.verify(dir,record,expected);return record;}
async function quickHttp(base,record,fetcher=fetch){
  const runtime=record.source.components.engine;
  assert.equal(record.source.variant?.id,'color');
  const names=['index.html','research.html','writing.html','talks.html','credits.html','site-revision.json','_staging/revision.json',...['space.js','navigation.js','styles.css'].map(x=>'runtime/'+runtime+'/'+x)];
  const rows=await Promise.all(names.map(async file=>{
    const result=await hosted.request(base+'/'+file,base,fetcher);assert.equal(result.response.status,200,file);
    hosted.responseHeaders(result.response.headers,file.startsWith('runtime/'));
    assert.equal(digest(result.bytes),record.files[file].sha256,'wrong served bytes '+file);
    return {file,sha256:digest(result.bytes),status:200};
  }));
  const root=await hosted.request(base+'/',base,fetcher);assert.equal(root.response.status,200);hosted.responseHeaders(root.response.headers);assert.equal(digest(root.bytes),record.files['index.html'].sha256);
  const missing=await hosted.request(base+'/__pr_preview_missing_'+record.source.sourceCommit,base,fetcher);assert.equal(missing.response.status,404);hosted.responseHeaders(missing.response.headers);assert.equal(digest(missing.bytes),record.files['404.html'].sha256);
  return {rows,root:true,actual404:true,noindex:true,sourceCommit:record.source.sourceCommit,publicDigest:record.source.artifactDigest};
}
async function findRecovery(github,context){
  const {data}=await github.rest.actions.listWorkflowRuns({...context.repo,workflow_id:workflow.split('/').pop(),branch:'main',event:'workflow_dispatch',status:'success',per_page:100});
  const run=data.workflow_runs.find(x=>String(x.id)!==String(context.runId));
  if(!run)return null;
  assert.equal(run.path,workflow);assert.equal(run.head_branch,'main');assert.equal(run.event,'workflow_dispatch');assert.equal(run.conclusion,'success');sha(run.head_sha);
  const artifacts=await github.paginate(github.rest.actions.listWorkflowRunArtifacts,{...context.repo,run_id:run.id});
  const state=artifacts.find(x=>x.name==='site-staging-recovery-'+run.id+'-'+run.run_attempt&&!x.expired);
  assert.ok(state,'previous successful staging recovery expired; reconcile before promotion');
  return {runId:String(run.id),attempt:String(run.run_attempt),controller:run.head_sha,stateId:String(state.id)};
}
function recoveryState(state,previous){
  assert.equal(state.schema,1);assert.equal(state.kind,'ci-staging-recovery');assert.equal(state.project,project);assert.equal(state.workflow,workflow);
  assert.equal(state.runId,previous.runId);assert.equal(state.attempt,previous.attempt);assert.equal(state.controller,previous.controller);
  sha(state.sourceCommit);assert.match(state.publicDigest,/^[a-f0-9]{64}$/);assert.match(state.packageDigest,/^[a-f0-9]{64}$/);
  assert.match(state.packageUploadDigest,/^(?:sha256:)?[a-f0-9]{64}$/);positive(state.packageArtifactId);return true;
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
  if(mode==='verify'){readPackage(dir,expected);return;}
  if(mode==='gate'){fullGate(JSON.parse(fs.readFileSync(url)),readPackage(dir,expected),process.env.SITE_TEST_BASE_URL);return;}
  if(mode==='recovery'){
    const state=JSON.parse(fs.readFileSync(url)),record=readPackage(dir);assert.equal(record.source.sourceCommit,state.sourceCommit);assert.equal(record.source.artifactDigest,state.publicDigest);assert.equal(record.packageDigest,state.packageDigest);return;
  }
  if(mode==='prior'){
    const state=url&&fs.existsSync(url)?JSON.parse(fs.readFileSync(url)):null;
    await priorStable(hosted.origin(dir,project,true),state);return;
  }
  assert.equal(mode,'http','usage: review-flow.cjs verify DIR | gate DIR GATE | recovery DIR STATE | prior URL [STATE] | http DIR URL REPORT');
  const record=readPackage(dir,expected),base=hosted.origin(url,project,process.env.SITE_STAGING_STABLE==='true');
  const result={schema:1,kind:'pr-preview-http',pass:false,origin:base};
  try{Object.assign(result,await quickHttp(base,record));result.pass=true;}
  catch(error){result.error=error.message;throw error;}
  finally{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');}
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={repository,project,workflow,positive,controller,lease,resolve,configuration,fullGate,quickHttp,findRecovery,recoveryState,priorStable,commentBody,updateComment};
