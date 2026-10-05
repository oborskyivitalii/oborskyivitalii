'use strict';
// Trusted same-repository staging only. Tokens are read from the job environment,
// never written to state, deployment payloads, logs or public files.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pkg=require('./package.cjs'),hosted=require('./hosted.cjs');
const repository='oborskyivitalii/oborskyivitalii',branch='work/site-v1-20261001',prNumber=10,marker='<!-- site-staging-status-v1 -->';
const stateDir=path.resolve('quality-results/staging'),recordFile=path.resolve('staging-package/staging-package.json');
const read=file=>JSON.parse(fs.readFileSync(file)),save=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
async function api(base,resource,token,body,method=body?'POST':'GET'){
  assert.ok(token,'required deployment credential is not configured');
  const response=await fetch(base+resource,{method,redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.ok){const error=Error('provider API '+method+' '+resource.split('?')[0]+' returned '+response.status);error.status=response.status;throw error;}return response.json();
}
const gh=(resource,body,method)=>api('https://api.github.com','/repos/'+repository+resource,process.env.GITHUB_TOKEN,body,method);
async function cf(resource){
  const response=await api('https://api.cloudflare.com/client/v4','/accounts/'+process.env.CLOUDFLARE_ACCOUNT_ID+'/pages/projects/'+process.env.CLOUDFLARE_PAGES_PROJECT+resource,process.env.CLOUDFLARE_API_TOKEN);
  assert.equal(response.success,true,'Cloudflare API did not succeed');return response.result;
}
function configuration(env=process.env){
  assert.equal(env.GITHUB_REPOSITORY,repository,'wrong repository');assert.match(env.CLOUDFLARE_ACCOUNT_ID||'',/^[0-9a-f]{32}$/,'configure staging account ID');
  assert.match(env.CLOUDFLARE_PAGES_PROJECT||'',/^[a-z0-9][a-z0-9-]{0,57}[a-z0-9]$/,'configure staging project name');
  assert.ok(env.CLOUDFLARE_API_TOKEN,'configure the staging environment deployment token');
  assert.match(env.SITE_CANDIDATE_SHA||'',/^[0-9a-f]{40}$/);assert.match(env.GITHUB_RUN_ID||'',/^[0-9]+$/);assert.match(env.GITHUB_RUN_ATTEMPT||'',/^[0-9]+$/);
}
function trustedHead(pr,sha){
  assert.equal(pr.state,'open','PR is no longer open');assert.equal(pr.head.repo.full_name,repository,'fork code cannot access staging');assert.equal(pr.head.ref,branch,'unauthorized branch');assert.equal(pr.head.sha,sha,'stale source cannot replace staging');return true;
}
async function fresh(){configuration();trustedHead(await gh('/pulls/'+prNumber),process.env.SITE_CANDIDATE_SHA);}
function projectPolicy(project){
  assert.equal(project.name,process.env.CLOUDFLARE_PAGES_PROJECT);assert.equal(project.production_branch,'production-disabled','dedicated project must have unused production-disabled branch');
  assert.ok(!project.source,'Direct Upload project must not have an automatic Git integration');
  assert.ok(!project.uses_functions,'staging must remain static assets');
  assert.ok(!project.build_config?.web_analytics_tag&&!project.build_config?.web_analytics_token,'provider analytics must not rewrite tested HTML');return true;
}
async function ensureProject(get,create,allowCreate,project){
  try{return await get();}catch(error){
    if(error.status!==404||!allowCreate)throw error;
    assert.ok(project.endsWith('-staging'),'new project must be explicitly named as staging');
    return create({name:project,production_branch:'production-disabled'});
  }
}
async function createProject(body){
  const response=await api('https://api.cloudflare.com/client/v4','/accounts/'+process.env.CLOUDFLARE_ACCOUNT_ID+'/pages/projects',process.env.CLOUDFLARE_API_TOKEN,body);
  assert.equal(response.success,true,'project provisioning did not succeed');return response.result;
}
function output(values){
  for(const [key,value]of Object.entries(values)){assert.match(String(value),/^[a-zA-Z0-9.-]*$/,'invalid output');fs.appendFileSync(process.env.GITHUB_OUTPUT,key+'='+value+'\n');}
}
function knownPayload(payload,project){
  return payload?.schema===1&&payload.provider==='cloudflare-pages'&&payload.project===project&&/^[0-9a-f]{40}$/.test(payload.sourceCommit)&&/^[0-9a-f]{64}$/.test(payload.packageDigest)&&/^[0-9]+$/.test(String(payload.packageArtifactId))&&/^[0-9]+$/.test(String(payload.runId));
}
async function previousVerified(){
  const deployments=await gh('/deployments?environment=staging&per_page=100');
  for(const deployment of deployments){
    if(!knownPayload(deployment.payload,process.env.CLOUDFLARE_PAGES_PROJECT))continue;
    const statuses=await gh('/deployments/'+deployment.id+'/statuses?per_page=100');
    // GitHub's implicit environment deployment can mark our verified custom
    // record inactive. Inactive is not failed; require its prior real success.
    const verified=statuses[0]?.state==='success'||(statuses[0]?.state==='inactive'&&statuses.some(x=>x.state==='success'));
    if(!verified)continue;
    const artifact=await gh('/actions/artifacts/'+deployment.payload.packageArtifactId);
    assert.equal(artifact.expired,false,'last verified rollback package expired; restore secure retention before promotion');
    assert.equal(artifact.workflow_run?.id,Number(deployment.payload.runId),'rollback artifact run mismatch');
    assert.equal(artifact.workflow_run.repository_id,1400059184,'rollback repository mismatch');
    assert.equal(artifact.workflow_run.repository_id,artifact.workflow_run.head_repository_id,'rollback artifact came from a fork');
    assert.equal(artifact.workflow_run.head_branch,branch,'rollback artifact branch mismatch');
    assert.equal(artifact.workflow_run.head_sha,deployment.payload.sourceCommit,'rollback artifact commit mismatch');
    assert.match(artifact.name,new RegExp('^site-staging-package-'+deployment.payload.runId+'-[0-9]+$'));
    const base=hosted.origin('https://staging.'+process.env.CLOUDFLARE_PAGES_PROJECT+'.pages.dev',process.env.CLOUDFLARE_PAGES_PROJECT,true),current=await hosted.request(base+'/_staging/revision.json',base);
    assert.equal(current.response.status,200,'existing stable alias is unavailable; do not risk promotion');hosted.responseHeaders(current.response.headers);
    const revision=JSON.parse(current.bytes);assert.equal(revision.sourceCommit,deployment.payload.sourceCommit,'stable alias changed outside verified workflow');assert.equal(revision.publicDigest,deployment.payload.publicDigest,'stable alias digest mismatch');
    return {deploymentId:deployment.id,...deployment.payload};
  }
  assert.ok(deployments.length<100,'deployment history exceeded bounded lookup without a verified rollback; owner inspection required');
  const existing=await cf('/deployments');assert.ok(!existing.some(x=>x.deployment_trigger?.metadata?.branch==='staging'),'staging alias has untracked deployments; explicit owner reconciliation required');
  return null;
}
async function prepare(){
  await fresh();const project=await ensureProject(()=>cf(''),createProject,process.env.SITE_STAGING_CREATE_PROJECT==='true',process.env.CLOUDFLARE_PAGES_PROJECT);projectPolicy(project);
  const record=read(recordFile);pkg.verify(path.dirname(recordFile),record,{sourceCommit:process.env.SITE_CANDIDATE_SHA});
  const previous=await previousVerified();save(path.join(stateDir,'previous.json'),previous);
  output({rollback_artifact_id:previous?.packageArtifactId||'',rollback_run_id:previous?.runId||'',rollback_sha:previous?.sourceCommit||''});
}
function rollbackRecord(record,previous){
  assert.ok(previous,'no verified previous deployment');assert.equal(record.packageDigest,previous.packageDigest,'rollback package digest mismatch');assert.equal(record.source.sourceCommit,previous.sourceCommit,'rollback source mismatch');assert.equal(record.source.artifactDigest,previous.publicDigest,'rollback public digest mismatch');return true;
}
function verifyRollback(){
  const previous=read(path.join(stateDir,'previous.json')),record=read('staging-rollback/staging-package.json');pkg.verify(path.resolve('staging-rollback'),record);rollbackRecord(record,previous);
}
async function verifyDeployment(id,expectedBranch,sha){
  assert.match(id||'',/^[0-9a-f-]{36}$/,'missing Pages deployment ID');const deployment=await cf('/deployments/'+id);
  assert.equal(deployment.environment,'preview','production deployment prohibited');assert.equal(deployment.latest_stage?.status,'success','Pages deployment is not successful');assert.equal(deployment.deployment_trigger?.metadata?.branch,expectedBranch,'wrong Pages branch');assert.equal(deployment.deployment_trigger?.metadata?.commit_hash,sha,'wrong Pages commit');
  return {id,url:hosted.origin(deployment.url,process.env.CLOUDFLARE_PAGES_PROJECT)};
}
async function register(){
  await fresh();const record=read(recordFile);
  assert.match(process.env.SITE_PACKAGE_ARTIFACT_ID||'',/^[0-9]+$/);
  const payload={schema:1,provider:'cloudflare-pages',project:process.env.CLOUDFLARE_PAGES_PROJECT,sourceCommit:record.source.sourceCommit,sourceTree:record.source.sourceTree,publicDigest:record.source.artifactDigest,packageDigest:record.packageDigest,packageArtifactId:process.env.SITE_PACKAGE_ARTIFACT_ID,runId:process.env.GITHUB_RUN_ID};
  const deployment=await gh('/deployments',{ref:payload.sourceCommit,task:'deploy:staging',auto_merge:false,required_contexts:[],environment:'staging',transient_environment:true,production_environment:false,description:'Verified PR artifact; not production release',payload});
  save(path.join(stateDir,'current.json'),{deploymentId:deployment.id,...payload});await status(deployment.id,'in_progress','Uploading verified candidate; stable alias unchanged');
}
function retained(previous,current){
  for(const [name,info]of Object.entries(previous.source.files).filter(([name])=>require('../site/snapshot.cjs').immutable(name)))assert.deepEqual(current.source.files[name],info,'previous immutable dependency missing '+name);
  return true;
}
async function begin(){
  if(read(path.join(stateDir,'previous.json')))retained(read('staging-rollback/staging-package.json'),read(recordFile));
  await fresh();const current=read(path.join(stateDir,'current.json')),candidate=await verifyDeployment(process.env.SITE_PAGES_DEPLOYMENT_ID,'candidate-'+process.env.SITE_CANDIDATE_SHA,process.env.SITE_CANDIDATE_SHA);
  const report=successfulReport('staging-reports/candidate.json',current.packageDigest);assert.equal(report.origin,candidate.url);
  save(path.join(stateDir,'current.json'),{...current,candidate});await status(current.deploymentId,'in_progress','Candidate smoke passed; promoting the same package');
}
async function status(id,state,description){
  return gh('/deployments/'+id+'/statuses',{state,description,environment:'staging',environment_url:'https://staging.'+process.env.CLOUDFLARE_PAGES_PROJECT+'.pages.dev',log_url:'https://github.com/'+repository+'/actions/runs/'+process.env.GITHUB_RUN_ID,auto_inactive:false});
}
async function verifyStable(){await verifyDeployment(process.env.SITE_PAGES_DEPLOYMENT_ID,'staging',process.env.SITE_CANDIDATE_SHA);hosted.origin(process.env.SITE_PAGES_ALIAS_URL,process.env.CLOUDFLARE_PAGES_PROJECT,true);}
async function verifyRollbackDeployment(){const previous=read(path.join(stateDir,'previous.json'));assert.ok(previous);await verifyDeployment(process.env.SITE_PAGES_DEPLOYMENT_ID,'staging',previous.sourceCommit);hosted.origin(process.env.SITE_PAGES_ALIAS_URL,process.env.CLOUDFLARE_PAGES_PROJECT,true);}
function successfulReport(file,digest){const report=read(file);assert.equal(report.pass,true);assert.equal(report.packageDigest,digest);return report;}
async function comment(body){
  const comments=await gh('/issues/'+prNumber+'/comments?per_page=100'),existing=comments.find(x=>x.user?.type==='Bot'&&x.body?.startsWith(marker));
  if(existing)return gh('/issues/comments/'+existing.id,{body},'PATCH');
  assert.ok(comments.length<100,'bounded comment lookup exceeded; reconcile existing staging status before adding');return gh('/issues/'+prNumber+'/comments',{body});
}
async function finish(){
  if(!fs.existsSync(path.join(stateDir,'current.json')))return;
  const current=read(path.join(stateDir,'current.json')),stable='https://staging.'+process.env.CLOUDFLARE_PAGES_PROJECT+'.pages.dev',success=process.env.SITE_STABLE_SMOKE_OUTCOME==='success';
  let recovery;
  if(success){successfulReport('staging-reports/stable.json',current.packageDigest);await status(current.deploymentId,'success','Version and stable alias smoke passed');recovery='Stable alias and version verified; production/device/rights acceptance remains pending.';}
  else{await status(current.deploymentId,'failure','Staging attempt did not pass');recovery=current.candidate?await recoveryResult():'Candidate upload/smoke did not pass; the stable alias was not changed.';}
  const links=(success?'[Whole site]('+stable+') · ':'')+(current.candidate?'[Verified immutable candidate]('+current.candidate.url+')':'No verified version URL.');
  const body=marker+'\n## Staging '+(success?'verified':'attempt failed')+'\n\n'+links+'\n\nSource `'+current.sourceCommit+'`; public digest `'+current.publicDigest+'`; staging package `'+current.packageDigest+'`.\n\n'+recovery+'\n\n[Checks/deployment run](https://github.com/'+repository+'/actions/runs/'+process.env.GITHUB_RUN_ID+'). Environment: staging only. Actual successful/failed checks are in the run artifacts; do not infer missing coverage. No production launch or merge.';
  await comment(body);save('staging-reports/deployment.json',{...current,stableURL:success?stable:null,pass:success,recovery});
}
async function recoveryResult(){
  const previous=read(path.join(stateDir,'previous.json'));
  if(process.env.SITE_ROLLBACK_SMOKE_OUTCOME==='success'){
    assert.ok(previous);successfulReport('staging-reports/rollback.json',previous.packageDigest);await status(previous.deploymentId,'success','Previous verified package restored after failed promotion');return 'Previous verified source `'+previous.sourceCommit+'` restored and rechecked. The failed candidate is not promoted.';
  }
  return previous?'Automatic restoration was not verified; stable alias needs owner attention. Do not treat it as a reviewed version.':'No earlier verified deployment exists for first-deployment recovery. The candidate version passed; the stable alias is not accepted.';
}
async function main(){
  const mode=process.argv[2];
  if(mode==='prepare')return prepare();if(mode==='fresh')return fresh();if(mode==='rollback')return verifyRollback();if(mode==='register')return register();if(mode==='begin')return begin();if(mode==='verify-stable')return verifyStable();if(mode==='verify-rollback-deployment')return verifyRollbackDeployment();if(mode==='finish')return finish();throw Error('Unknown staging state operation');
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={configuration,trustedHead,projectPolicy,knownPayload,rollbackRecord,ensureProject,retained};
