'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const artifact=require('../tools/quality/artifact.cjs'),pkg=require('../tools/staging/package.cjs'),trust=require('../tools/staging/trust.cjs');
const script=path.resolve(__dirname,'../tools/staging/state.cjs');
function fixture(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'staging-reporting-')),input=path.join(dir,'input'),out=path.join(dir,'staging-package'),sha='a'.repeat(40),publicUpload='c'.repeat(64),gateUpload='d'.repeat(64),project='unit-test-staging',deploymentId='12345678-1234-1234-1234-123456789abc',origin='https://preview.'+project+'.pages.dev';
  const save=(file,data)=>{const target=path.join(dir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(data));};
  fs.mkdirSync(input);fs.cpSync(path.resolve(__dirname,'../docs'),path.join(input,'public'),{recursive:true});
  const source={schema:1,sourceDirty:false,sourceCommit:sha,candidateCommit:sha,sourceTree:'b'.repeat(40),...artifact.manifest(path.join(input,'public'))},gate={...source,kind:'pr-gate',profile:'local',pass:true,jobs:{build:{result:'success'}},githubArtifact:{id:'123',uploadDigest:publicUpload}};
  save('input/artifact.json',source);save('input/gate/release-manifest.json',gate);
  const record=pkg.build(input,out),current={schema:2,deploymentId:789,provider:'cloudflare-pages',project,sourceBranch:'main',workflow:trust.workflow,sourceCommit:sha,sourceTree:source.sourceTree,publicDigest:source.artifactDigest,packageDigest:record.packageDigest,packageArtifactId:'125',packageUploadDigest:'f'.repeat(64),runId:'456',runAttempt:'1'};
  const report={schema:1,kind:'hosted-staging-smoke',pass:true,origin,sourceCommit:sha,publicDigest:source.artifactDigest,packageDigest:record.packageDigest};
  save('quality-results/staging/current.json',current);save('quality-results/staging/previous.json',null);save('staging-reports/candidate.json',report);
  const base='https://api.github.com/repos/'+trust.repository,cfBase='https://api.cloudflare.com/client/v4/accounts/'+'e'.repeat(32)+'/pages/projects/'+project;
  const workflowRun={id:456,run_attempt:1,repository:{full_name:trust.repository},head_repository:{full_name:trust.repository},head_branch:'main',head_sha:sha,event:'workflow_dispatch',path:trust.workflow};
  const uploaded=(id,name,digest)=>({id,name:name+'-456-1',expired:false,digest:'sha256:'+digest,workflow_run:{id:456,repository_id:trust.repositoryId,head_repository_id:trust.repositoryId,head_branch:'main',head_sha:sha}});
  const responses={
    [base+'/actions/runs/456']:workflowRun,[base+'/branches/main']:{name:'main',protected:true,commit:{sha}},
    [base+'/actions/artifacts/123']:uploaded(123,'site-public-basic',publicUpload),[base+'/actions/artifacts/124']:uploaded(124,'site-gate-basic',gateUpload),
    [cfBase+'/deployments/'+deploymentId]:{success:true,result:{environment:'preview',latest_stage:{status:'success'},deployment_trigger:{metadata:{branch:'candidate-'+sha,commit_hash:sha}},url:origin}},
    [base+'/issues/8/comments?per_page=100']:[],[base+'/issues/8/comments']:{id:987},[base+'/deployments/789/statuses']:{id:654}
  };
  save('responses.json',responses);save('calls.json',[]);
  fs.writeFileSync(path.join(dir,'fetch-fixture.cjs'),`const fs=require('node:fs');global.fetch=async(url,options={})=>{const calls=JSON.parse(fs.readFileSync('calls.json'));calls.push({url:String(url),method:options.method||'GET',body:options.body?JSON.parse(options.body):null});fs.writeFileSync('calls.json',JSON.stringify(calls));const responses=JSON.parse(fs.readFileSync('responses.json'));if(!Object.hasOwn(responses,String(url)))throw Error('Unexpected provider call '+url);return new Response(JSON.stringify(responses[String(url)]),{status:200,headers:{'content-type':'application/json'}});};`);
  const env={...process.env,GITHUB_REPOSITORY:trust.repository,GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_REF:'refs/heads/main',SITE_CANDIDATE_SHA:sha,GITHUB_SHA:sha,GITHUB_WORKFLOW_REF:trust.repository+'/'+trust.workflow+'@refs/heads/main',GITHUB_WORKFLOW_SHA:sha,GITHUB_RUN_ID:'456',GITHUB_RUN_ATTEMPT:'1',GITHUB_TOKEN:'fixture-token',CLOUDFLARE_API_TOKEN:'fixture-token',CLOUDFLARE_ACCOUNT_ID:'e'.repeat(32),CLOUDFLARE_PAGES_PROJECT:project,SITE_ARTIFACT_ID:'123',SITE_GATE_ARTIFACT_ID:'124',SITE_UPLOAD_DIGEST:publicUpload,SITE_GATE_UPLOAD_DIGEST:gateUpload,SITE_EXPECTED_PUBLIC_DIGEST:source.artifactDigest,SITE_PAGES_DEPLOYMENT_ID:deploymentId};
  const run=(mode,extra={})=>cp.spawnSync(process.execPath,['--require',path.join(dir,'fetch-fixture.cjs'),script,mode],{cwd:dir,env:{...env,...extra},encoding:'utf8'});
  const read=file=>JSON.parse(fs.readFileSync(path.join(dir,file)));
  const full={kind:'hosted-gate',profile:'staging',pass:true,hostedOrigin:origin,sourceCommit:sha,artifactDigest:source.artifactDigest,jobs:Object.fromEntries(['build','static','linux','native','performance','captures','host'].map(name=>[name,{result:'success'}]))};
  return {dir,save,read,run,current,report,responses,full,origin,cfBase};
}
test('a smoke-verified candidate remains reviewable when the full hosted gate fails or is missing',()=>{
  const f=fixture();try{
    const recorded=f.run('candidate');assert.equal(recorded.status,0,recorded.stderr);
    assert.equal(f.read('quality-results/staging/current.json').candidate.url,f.origin);
    for(const gate of [null,{...f.full,pass:false},{...f.full,jobs:{...f.full.jobs,performance:{result:'failure'}}},{...f.full,hostedOrigin:'https://other.unit-test-staging.pages.dev'}]){
      if(gate)f.save('staging-reports/full/release-manifest.json',gate);else fs.rmSync(path.join(f.dir,'staging-reports/full'),{recursive:true,force:true});
      const begin=f.run('begin');assert.notEqual(begin.status,0,'failed/missing full evidence cannot authorize promotion');
      assert.notEqual(f.read('quality-results/staging/current.json').promotionAuthorized,true);
      const finished=f.run('finish',{SITE_STABLE_SMOKE_OUTCOME:'skipped',SITE_ROLLBACK_SMOKE_OUTCOME:'skipped'});assert.equal(finished.status,0,finished.stderr);
      const result=f.read('staging-reports/deployment.json');assert.equal(result.pass,false);assert.equal(result.stableURL,null);assert.equal(result.candidate.url,f.origin);
      assert.match(result.recovery,/stable promotion was not authorized or was not started/);assert.match(result.recovery,/stable alias was not changed/);
      const comments=f.read('calls.json').filter(call=>call.url.endsWith('/issues/8/comments')&&call.method==='POST');assert.match(comments.at(-1).body.body,/Smoke-verified immutable candidate/);assert.ok(comments.at(-1).body.body.includes(f.origin));
    }
    assert.ok(f.read('calls.json').filter(call=>call.url.startsWith(f.cfBase)).every(call=>call.method==='GET'),'reporting never writes a provider alias');
    assert.ok(f.read('calls.json').filter(call=>call.url.endsWith('/statuses')).every(call=>call.body.state==='failure'),'no full failure is marked successful or promotion-ready');
    f.save('staging-reports/stable.json',f.report);assert.notEqual(f.run('finish',{SITE_STABLE_SMOKE_OUTCOME:'success'}).status,0,'a smoke result alone cannot claim stable acceptance');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('candidate recording rejects mismatched smoke/source/provider identities and stale main',()=>{
  const f=fixture();try{
    for(const change of [{pass:false},{kind:'hosted-gate'},{origin:'https://other.unit-test-staging.pages.dev'},{sourceCommit:'b'.repeat(40)},{publicDigest:'f'.repeat(64)},{packageDigest:'f'.repeat(64)}]){
      f.save('staging-reports/candidate.json',{...f.report,...change});assert.notEqual(f.run('candidate').status,0);assert.equal(f.read('quality-results/staging/current.json').candidate,undefined);
    }
    f.save('staging-reports/candidate.json',f.report);
    for(const mutate of [responses=>responses['https://api.github.com/repos/'+trust.repository+'/branches/main'].commit.sha='b'.repeat(40),responses=>Object.values(responses).find(value=>value?.result?.deployment_trigger).result.deployment_trigger.metadata.branch='staging']){
      const responses=structuredClone(f.responses);mutate(responses);f.save('responses.json',responses);
      assert.notEqual(f.run('candidate').status,0);assert.equal(f.read('quality-results/staging/current.json').candidate,undefined);
    }
    const failedRecord=f.run('finish',{SITE_STABLE_SMOKE_OUTCOME:'skipped'});assert.equal(failedRecord.status,0,failedRecord.stderr);assert.match(f.read('staging-reports/deployment.json').recovery,/Candidate verification was not completed/);
    f.save('responses.json',f.responses);f.save('staging-reports/full/release-manifest.json',f.full);
    const begin=f.run('begin');assert.equal(begin.status,0,begin.stderr);assert.equal(f.read('quality-results/staging/current.json').promotionAuthorized,true,'only successful matching full evidence authorizes promotion');
    f.save('staging-reports/stable.json',f.report);
    const finish=f.run('finish',{SITE_STABLE_SMOKE_OUTCOME:'success'});assert.equal(finish.status,0,finish.stderr);
    const result=f.read('staging-reports/deployment.json');assert.equal(result.pass,true);assert.equal(result.stableURL,'https://staging.unit-test-staging.pages.dev');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
