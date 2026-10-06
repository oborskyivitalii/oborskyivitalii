'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),trust=require('../tools/staging/trust.cjs');
const sha='a'.repeat(40),uploadDigest='c'.repeat(64),env={GITHUB_REPOSITORY:trust.repository,GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_REF:'refs/heads/main',SITE_CANDIDATE_SHA:sha,GITHUB_SHA:sha,GITHUB_WORKFLOW_REF:trust.repository+'/'+trust.workflow+'@refs/heads/main',GITHUB_WORKFLOW_SHA:sha,GITHUB_RUN_ID:'456',GITHUB_RUN_ATTEMPT:'2'};
const run={id:456,run_attempt:2,repository:{full_name:trust.repository},head_repository:{full_name:trust.repository},head_branch:'main',head_sha:sha,event:'workflow_dispatch',path:trust.workflow};
const head={name:'main',protected:true,commit:{sha}},artifact={id:123,name:'site-staging-package-456-2',expired:false,digest:'sha256:'+uploadDigest,workflow_run:{id:456,repository_id:trust.repositoryId,head_repository_id:trust.repositoryId,head_branch:'main',head_sha:sha}},expected={id:'123',name:artifact.name,sha,runId:'456',attempt:'2',uploadDigest};
test('only the approved exact protected-main manual caller can stage',()=>{
 assert.equal(trust.trustedHead(head,run,env),true);
 for(const change of [{GITHUB_EVENT_NAME:'pull_request'},{GITHUB_REPOSITORY:'other/fork'},{GITHUB_REF:'refs/pull/10/merge'},{GITHUB_SHA:'b'.repeat(40)},{GITHUB_WORKFLOW_SHA:'b'.repeat(40)},{GITHUB_WORKFLOW_REF:trust.repository+'/other.yml@refs/heads/main'}])assert.throws(()=>trust.trustedHead(head,run,{...env,...change}));
 for(const mutate of [h=>h.protected=false,h=>h.name='work/site-v1-20261001',h=>h.commit.sha='b'.repeat(40)]){const h=structuredClone(head);mutate(h);assert.throws(()=>trust.trustedHead(h,run,env));}
 const legacy={state:'closed',head:{repo:{full_name:trust.repository},ref:'work/site-v1-20261001',sha}};assert.throws(()=>trust.trustedHead(legacy,run,env),'closed legacy PR cannot substitute for main');
});
test('source and recovery runs reject forks, another workflow, branch, commit or attempt',()=>{
 for(const mutate of [r=>r.head_repository.full_name='other/fork',r=>r.repository.full_name='other/repo',r=>r.head_branch='work/site-v1-20261001',r=>r.head_sha='b'.repeat(40),r=>r.event='pull_request',r=>r.path='.github/workflows/other.yml',r=>r.id=789,r=>r.run_attempt=1]){const r=structuredClone(run);mutate(r);assert.throws(()=>trust.runSource(r,sha,'456','2'));}
 assert.equal(trust.runSource(run,sha,'456','2'),true);
});
test('immutable source/recovery artifacts require exact run, attempt, source and uploaded digest',()=>{
 assert.equal(trust.artifactSource(artifact,expected),true);
 for(const mutate of [a=>a.id=124,a=>a.expired=true,a=>a.name='site-staging-package-456-1',a=>a.digest='sha256:'+'d'.repeat(64),a=>delete a.digest,a=>a.workflow_run.id=789,a=>a.workflow_run.repository_id=1,a=>a.workflow_run.head_repository_id=1,a=>a.workflow_run.head_branch='work/site-v1-20261001',a=>a.workflow_run.head_sha='b'.repeat(40)]){const a=structuredClone(artifact);mutate(a);assert.throws(()=>trust.artifactSource(a,expected));}
 for(const change of [{id:'124'},{runId:'789'},{name:'site-staging-package-456-1'},{sha:'b'.repeat(40)},{uploadDigest:'d'.repeat(64)}])assert.throws(()=>trust.artifactSource(artifact,{...expected,...change}));
});
