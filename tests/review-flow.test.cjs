'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const flow=require('../tools/staging/review-flow.cjs'),artifact=require('../tools/quality/artifact.cjs'),pkg=require('../tools/staging/package.cjs');
const source='a'.repeat(40),controller='b'.repeat(40),context={repo:{owner:'oborskyivitalii',repo:'oborskyivitalii'},eventName:'pull_request',payload:{pull_request:{number:26,head:{sha:source}}},sha:controller,ref:'refs/pull/26/merge'};
const pr={number:26,state:'open',head:{sha:source,repo:{full_name:flow.repository}}};
test('preview tracks the latest open same-repository PR head; stale runs and forks fail',()=>{
  assert.deepEqual(flow.resolve(context,pr),{mode:'preview',number:'26',source,branch:'pr-26'});
  for(const mutation of [{state:'closed'},{head:{...pr.head,sha:'c'.repeat(40)}},{head:{...pr.head,repo:{full_name:'someone/fork'}}}])assert.throws(()=>flow.resolve(context,{...pr,...mutation}));
  assert.throws(()=>flow.resolve({...context,repo:{owner:'someone',repo:'fork'}},pr));
  for(const number of ['26;echo secret','-1','0','1e3','9007199254740992'])assert.throws(()=>flow.positive(number));
});
test('explicit staging resolves a PR source while requiring an unchanged protected main controller',()=>{
  const dispatch={...context,eventName:'workflow_dispatch',ref:'refs/heads/main'},main={protected:true,commit:{sha:controller}};
  assert.deepEqual(flow.resolve(dispatch,pr,main),{mode:'staging',number:'26',source,branch:'candidate-staging-'+source});
  for(const invalid of [{...dispatch,ref:'refs/heads/work/test'},{...dispatch,eventName:'push'}])assert.throws(()=>flow.resolve(invalid,pr,main));
  assert.throws(()=>flow.resolve(dispatch,pr,{...main,protected:false}));
  assert.throws(()=>flow.resolve(dispatch,pr,{...main,commit:{sha:'c'.repeat(40)}}));
  assert.throws(()=>flow.lease({...pr,head:{...pr.head,sha:controller}},source));
  assert.doesNotThrow(()=>flow.configuration('a'.repeat(32),flow.project,true));
  assert.throws(()=>flow.configuration('a'.repeat(32),'oborskyi-site-staging',true));
  assert.throws(()=>flow.configuration('a'.repeat(32),flow.project,false));
});
function packageFixture(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'review-flow-')),input=path.join(dir,'input'),out=path.join(dir,'package');
  fs.mkdirSync(input);fs.cpSync(path.join(__dirname,'../docs'),path.join(input,'public'),{recursive:true});
  const {revision}=require('../tools/staging/color.cjs').decoratePublic(path.join(input,'public'));
  const manifest={schema:1,sourceDirty:false,sourceCommit:source,candidateCommit:source,sourceTree:controller,variant:revision.variant,components:revision,...artifact.manifest(path.join(input,'public'))};
  const gate={...manifest,kind:'pr-gate',profile:'local',pass:true,jobs:{build:{result:'success'}},githubArtifact:{id:'123',uploadDigest:'d'.repeat(64)}};
  fs.writeFileSync(path.join(input,'artifact.json'),JSON.stringify(manifest));fs.mkdirSync(path.join(input,'gate'));fs.writeFileSync(path.join(input,'gate/release-manifest.json'),JSON.stringify(gate));
  return {dir,out,record:pkg.build(input,out)};
}
test('promotion requires the exact hosted full gate; lightweight, failed or incomplete results cannot substitute',()=>{
  const f=packageFixture();try{
    const url='https://abcdefgh.'+flow.project+'.pages.dev',gate={...f.record.source,kind:'hosted-gate',profile:'staging',pass:true,hostedOrigin:url,githubArtifact:f.record.gate.githubArtifact,jobs:Object.fromEntries(['build','static','linux','native','performance','captures','host'].map(x=>[x,{result:'success'}])),checkedReports:['lint','security','advisories','functional','color-functional','lighthouse','motion','captures','hosted'].map(kind=>({kind}))};
    assert.equal(flow.fullGate(gate,f.record,url),true);
    for(const mutate of [g=>g.kind='pr-gate',g=>g.pass=false,g=>g.sourceCommit=controller,g=>g.hostedOrigin='https://other.pages.dev',g=>g.jobs.native.result='skipped',g=>g.checkedReports=g.checkedReports.filter(x=>x.kind!=='motion'),g=>g.variant.fingerprint='e'.repeat(64),g=>g.githubArtifact.id='456']){
      const invalid=structuredClone(gate);mutate(invalid);assert.throws(()=>flow.fullGate(invalid,f.record,url));
    }
  }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
function fetchFixture(f,mutation){
  return async url=>{
    const u=new URL(url);let file=u.pathname.slice(1)||'index.html';
    if(u.pathname.endsWith('.html'))return new Response(null,{status:301,headers:{location:u.pathname.slice(0,-5)}});
    if(!fs.existsSync(path.join(f.out,'public',file))&&fs.existsSync(path.join(f.out,'public',file+'.html')))file+='.html';
    const missing=!fs.existsSync(path.join(f.out,'public',file));if(missing)file='404.html';
    const headers={'x-robots-tag':'noindex, nofollow','x-content-type-options':'nosniff','cache-control':pkg.policyHeaders(file)['Cache-Control']};
    if(mutation==='robots')headers['x-robots-tag']='noindex';
    const bytes=mutation==='runtime'&&file.endsWith('/space.js')?Buffer.from('wrong Color engine'):fs.readFileSync(path.join(f.out,'public',file));
    return new Response(bytes,{status:missing?404:200,headers});
  };
}
test('fast hosted smoke binds all five routes, both revisions and actual Color runtime hashes',async()=>{
  const f=packageFixture();try{
    const base='https://abcdefgh.'+flow.project+'.pages.dev',result=await flow.quickHttp(base,f.record,fetchFixture(f));
    assert.equal(result.rows.length,10);assert.equal(result.sourceCommit,source);assert.equal(result.actual404,true);
    await assert.rejects(()=>flow.quickHttp(base,f.record,fetchFixture(f,'runtime')),/wrong served bytes/);
    await assert.rejects(()=>flow.quickHttp(base,f.record,fetchFixture(f,'robots')));
  }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('recovery uses only the last successful main dispatch and the exact retained run attempt',async()=>{
  const run={id:10,run_attempt:2,path:flow.workflow,head_branch:'main',event:'workflow_dispatch',conclusion:'success',head_sha:controller};
  const api={rest:{actions:{listWorkflowRuns:async()=>({data:{workflow_runs:[run]}}),listWorkflowRunArtifacts:()=>{}}},paginate:async()=>[{id:11,name:'site-staging-recovery-10-2',expired:false}]};
  const previous=await flow.findRecovery(api,{...context,runId:20});assert.deepEqual(previous,{runId:'10',attempt:'2',controller,stateId:'11'});
  api.paginate=async()=>[{id:11,name:'site-staging-recovery-10-1',expired:false}];await assert.rejects(()=>flow.findRecovery(api,{...context,runId:20}),/recovery expired/);
  const state={schema:1,kind:'ci-staging-recovery',project:flow.project,workflow:flow.workflow,runId:'10',attempt:'2',controller,sourceCommit:source,publicDigest:'d'.repeat(64),packageDigest:'e'.repeat(64),packageUploadDigest:'f'.repeat(64),packageArtifactId:'12'};
  assert.equal(flow.recoveryState(state,previous),true);
  for(const mutation of [{attempt:'1'},{controller:source},{project:'oborskyi-site-staging'},{packageUploadDigest:'unbound'}])assert.throws(()=>flow.recoveryState({...state,...mutation},previous));
});
test('untracked stable aliases stop promotion; first deployment and known recovery are distinguished',async()=>{
  const base='https://staging.'+flow.project+'.pages.dev',state={sourceCommit:source,publicDigest:'d'.repeat(64)};
  const absent=async()=>new Response('missing',{status:404}),current=async()=>new Response(JSON.stringify(state),{status:200});
  assert.deepEqual(await flow.priorStable(base,null,absent),{firstPromotion:true});
  assert.deepEqual(await flow.priorStable(base,state,current),{firstPromotion:false});
  await assert.rejects(()=>flow.priorStable(base,null,current),/untracked/);
  await assert.rejects(()=>flow.priorStable(base,{...state,sourceCommit:controller},current));
  await assert.rejects(()=>flow.priorStable(base,null,async()=>{throw Error('timeout');}));
});
test('PR deployment comments are updated in place and stale candidates cannot replace current status',async()=>{
  const oldEnv=process.env.REVIEW_PR,oldMode=process.env.REVIEW_MODE;
  process.env.REVIEW_PR='26';process.env.REVIEW_MODE='preview';
  let created=0,updated=0,current=pr;const comments=[];
  const github={rest:{pulls:{get:async()=>({data:current})},issues:{listComments:()=>{},createComment:async args=>{created++;comments.push({id:1,user:{login:'github-actions[bot]'},body:args.body});},updateComment:async args=>{updated++;comments[0].body=args.body;}}},paginate:async()=>comments};
  const entry={source,url:'https://abcdefgh.'+flow.project+'.pages.dev',alias:'https://pr-26.'+flow.project+'.pages.dev',status:'Minimal hosted smoke passed.',run:'https://github.com/'+flow.repository+'/actions/runs/1'};
  try{
    await flow.updateComment(github,context,entry);await flow.updateComment(github,context,{...entry,status:'Updated status'});
    assert.equal(created,1);assert.equal(updated,1);assert.match(comments[0].body,/Updated status/);
    current={...pr,head:{...pr.head,sha:controller}};await flow.updateComment(github,context,entry);assert.equal(updated,1);
  }finally{if(oldEnv===undefined)delete process.env.REVIEW_PR;else process.env.REVIEW_PR=oldEnv;if(oldMode===undefined)delete process.env.REVIEW_MODE;else process.env.REVIEW_MODE=oldMode;}
});
test('workflow publishes through the official action, excludes full tests from PRs and gates stable promotion',()=>{
  const text=fs.readFileSync(path.join(__dirname,'../.github/workflows/site-color-review.yml'),'utf8');
  assert.doesNotMatch(text,/pull_request_target|target\.json|tools\/staging\/deploy\.cjs|upload-token|api\.cloudflare\.com/);
  assert.match(text,/cancel-in-progress: \$\{\{ github.event_name == 'pull_request' \}\}/);
  const full=text.split('\n  full:\n')[1].split('\n  promote:\n')[0];
  assert.match(full,/if: needs.target.outputs.mode == 'staging'/);assert.match(full,/full: true/);assert.match(full,/public_artifact_id: \$\{\{ needs.build.outputs.public_artifact \}\}/);
  const promote=text.split('\n  promote:\n')[1].split('\n  status-comment:\n')[0];
  assert.match(promote,/needs.full.result == 'success'/);assert.match(promote,/review-flow.cjs gate/);assert.match(promote,/--branch=staging/);assert.match(promote,/Restore the previous successful staging package through CI/);
  const smoke=text.split('\n  smoke:\n')[1].split('\n  full:\n')[0];
  assert.match(smoke,/color-browser.cjs --smoke/);assert.doesNotMatch(smoke,/secrets\.|lighthouse|scanners.cjs|motion.cjs/);
  for(const match of text.matchAll(/uses: ([^\s]+)/g))if(!match[1].startsWith('./'))assert.match(match[1],/@[a-f0-9]{40}$/,'pin third-party actions');
});
