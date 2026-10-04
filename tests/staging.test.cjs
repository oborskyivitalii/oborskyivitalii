'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const artifact=require('../tools/quality/artifact.cjs'),staging=require('../tools/staging/package.cjs');
const hosted=require('../tools/staging/hosted.cjs');
const state=require('../tools/staging/state.cjs');
function fixture(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'site-staging-test-')),input=path.join(dir,'input'),out=path.join(dir,'package');
  fs.mkdirSync(input);fs.cpSync(path.resolve(__dirname,'../docs'),path.join(input,'public'),{recursive:true});
  const source={schema:1,sourceDirty:false,sourceCommit:'a'.repeat(40),candidateCommit:'a'.repeat(40),sourceTree:'b'.repeat(40),...artifact.manifest(path.join(input,'public'))};
  const gate={schema:1,kind:'pr-gate',pass:true,...source,jobs:{build:{result:'success'},static:{result:'success'},linux:{result:'success'}},githubArtifact:{id:'123',uploadDigest:'c'.repeat(64)}};
  fs.writeFileSync(path.join(input,'artifact.json'),JSON.stringify(source));fs.mkdirSync(path.join(input,'gate'));fs.writeFileSync(path.join(input,'gate/release-manifest.json'),JSON.stringify(gate));
  return {dir,input,out,source,gate,expected:{sourceCommit:source.sourceCommit,publicDigest:source.artifactDigest,artifactId:'123',uploadDigest:'c'.repeat(64)}};
}
test('staging adds only host policy, real 404 and revision; every tested public byte stays exact',()=>{
  const f=fixture();try{
    const record=staging.build(f.input,f.out,f.expected);assert.equal(staging.verify(f.out,record,f.expected),true);
    assert.notEqual(record.packageDigest,f.source.artifactDigest);
    assert.match(staging.headers,/X-Robots-Tag: noindex, nofollow/);assert.match(staging.headers,/max-age=0/);
    assert.deepEqual(record.hostFiles,['404.html','_headers','_staging/revision.json']);
    for(const file of staging.publicFiles)assert.deepEqual(fs.readFileSync(path.join(f.out,'public',file)),fs.readFileSync(path.join(f.input,'public',file)));
    assert.equal(fs.existsSync(path.join(f.out,'public','_redirects')),false,'no SPA catch-all');
    assert.equal(fs.existsSync(path.join(f.out,'public','review')),false);
  }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('missing/failed/mismatched/stale gates and extra source inputs fail closed',()=>{
  const f=fixture();try{
    for(const mutate of [g=>g.pass=false,g=>g.kind='release-manifest',g=>g.jobs.linux.result='cancelled',g=>g.sourceCommit='d'.repeat(40),g=>g.githubArtifact.id='456']){
      const g=structuredClone(f.gate);mutate(g);assert.throws(()=>staging.sourceGate(f.source,g,f.expected));
    }
    assert.throws(()=>staging.sourceGate(f.source,f.gate,{...f.expected,sourceCommit:'e'.repeat(40)}));
    assert.throws(()=>staging.sourceGate({...f.source,sourceDirty:true},f.gate,f.expected));
    assert.throws(()=>staging.sourceGate({...f.source,files:{...f.source.files,'research-attachment.docx':{}}},f.gate,f.expected));
  }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('tampering with HTML, host policy or package metadata is rejected without replacing files',()=>{
  const f=fixture();try{
    const record=staging.build(f.input,f.out,f.expected),html=path.join(f.out,'public','index.html'),original=fs.readFileSync(html);
    fs.appendFileSync(html,'<!-- mutation -->');assert.throws(()=>staging.verify(f.out,record,f.expected));fs.writeFileSync(html,original);
    fs.writeFileSync(path.join(f.out,'public','_headers'),'/*\n  X-Robots-Tag: all\n');assert.throws(()=>staging.verify(f.out,record,f.expected));
    assert.throws(()=>staging.build(f.input,f.out,f.expected),'existing output is not erased');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('hosted origin and redirect boundary cannot crawl another site or the production apex',async()=>{
  const project='unit-test-staging',base='https://preview.'+project+'.pages.dev';
  assert.equal(hosted.origin(base,project),base);assert.equal(hosted.origin('https://staging.'+project+'.pages.dev',project,true),'https://staging.'+project+'.pages.dev');
  for(const url of ['http://preview.'+project+'.pages.dev','https://'+project+'.pages.dev','https://preview.other-project.pages.dev','https://user:pass@preview.'+project+'.pages.dev','https://preview.'+project+'.pages.dev/path'])assert.throws(()=>hosted.origin(url,project));
  await assert.rejects(()=>hosted.request(base+'/',base,async()=>new Response(null,{status:302,headers:{location:'https://example.org/'}})),/left staging origin/);
  await assert.rejects(()=>hosted.request(base+'/',base,async()=>new Response(null,{status:302,headers:{location:'/'}})),/Too many/);
});
function fetchFixture(f,options={}){
  return async url=>{
    const u=new URL(url),headers={'x-robots-tag':options.robots||'noindex, nofollow','cache-control':'no-cache, max-age=0, must-revalidate','x-content-type-options':'nosniff'};
    if(u.pathname.endsWith('.html'))return new Response(null,{status:301,headers:{location:u.pathname.slice(0,-5)+(options.dropQuery?'':u.search)}});
    let file=u.pathname.slice(1)||'index';if(['index','research','writing','talks','credits'].includes(file))file+='.html';
    const missing=!fs.existsSync(path.join(f.out,'public',file));if(missing)file=options.spa?'index.html':'404.html';
    const extensions={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json'};
    headers['content-type']=extensions[path.extname(file)];const bytes=fs.readFileSync(path.join(f.out,'public',file));
    return new Response(options.tamper&&file==='styles.css'?Buffer.from('bad bytes'):bytes,{status:missing&&!options.spa?404:200,headers});
  };
}
test('real-HTTP smoke model checks every served byte, extensionless query redirects, noindex and actual 404',async()=>{
  const f=fixture();try{
    const record=staging.build(f.input,f.out,f.expected),base='https://preview.unit-test-staging.pages.dev';
    const result=await hosted.httpSmoke(base,record,fetchFixture(f));assert.equal(result.actual404,true);assert.equal(result.queryRedirect,true);assert.equal(result.files.length,14);
    for(const options of [{robots:'noindex'},{tamper:true},{dropQuery:true},{spa:true}])await assert.rejects(()=>hosted.httpSmoke(base,record,fetchFixture(f,options)));
  }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('trusted source, dedicated provider project and known rollback metadata fail closed',()=>{
  const sha='a'.repeat(40),pr={state:'open',head:{repo:{full_name:'oborskyivitalii/oborskyivitalii'},ref:'work/site-v1-20261001',sha}};
  assert.equal(state.trustedHead(pr,sha),true);
  for(const mutate of [p=>p.state='closed',p=>p.head.repo.full_name='other/fork',p=>p.head.ref='main',p=>p.head.sha='b'.repeat(40)]){const p=structuredClone(pr);mutate(p);assert.throws(()=>state.trustedHead(p,sha));}
  const previousProject=process.env.CLOUDFLARE_PAGES_PROJECT;process.env.CLOUDFLARE_PAGES_PROJECT='unit-test-staging';
  try{
    const project={name:'unit-test-staging',production_branch:'production-disabled'};assert.equal(state.projectPolicy(project),true);
    for(const mutation of [{production_branch:'staging'},{source:{type:'github'}},{uses_functions:true},{build_config:{web_analytics_tag:'enabled'}}])assert.throws(()=>state.projectPolicy({...project,...mutation}));
    const record={source:{sourceCommit:sha,artifactDigest:'c'.repeat(64)},packageDigest:'d'.repeat(64)},previous={schema:1,provider:'cloudflare-pages',project:project.name,sourceCommit:sha,publicDigest:'c'.repeat(64),packageDigest:'d'.repeat(64),packageArtifactId:'123',runId:'456'};
    assert.equal(state.knownPayload(previous,project.name),true);assert.equal(state.knownPayload(previous,'other-project'),false);assert.equal(state.rollbackRecord(record,previous),true);
    assert.throws(()=>state.rollbackRecord(record,{...previous,packageDigest:'e'.repeat(64)}));assert.throws(()=>state.rollbackRecord(record,null));
  }finally{if(previousProject===undefined)delete process.env.CLOUDFLARE_PAGES_PROJECT;else process.env.CLOUDFLARE_PAGES_PROJECT=previousProject;}
});
test('provisioning reuses an existing project and never converts permission/rate errors into creation',async()=>{
  let writes=0;const create=async body=>{writes++;return body;},missing=async()=>{const error=Error('missing');error.status=404;throw error;};
  const existing={name:'existing-staging'};assert.equal(await state.ensureProject(async()=>existing,create,true,'existing-staging'),existing);assert.equal(writes,0);
  await assert.rejects(()=>state.ensureProject(missing,create,false,'new-staging'));assert.equal(writes,0);
  assert.deepEqual(await state.ensureProject(missing,create,true,'new-staging'),{name:'new-staging',production_branch:'production-disabled'});assert.equal(writes,1);
  for(const status of [401,403,429,500])await assert.rejects(()=>state.ensureProject(async()=>{const error=Error('blocked');error.status=status;throw error;},create,true,'new-staging'));
  await assert.rejects(()=>state.ensureProject(missing,create,true,'production'));assert.equal(writes,1);
});
test('staging workflow depends on successful immutable gates, serializes promotion and never uses privileged PR execution',()=>{
  const caller=fs.readFileSync(path.resolve(__dirname,'../.github/workflows/site-checks.yml'),'utf8'),workflow=fs.readFileSync(path.resolve(__dirname,'../.github/workflows/site-staging.yml'),'utf8');
  assert.match(caller,/needs: checks/);assert.match(caller,/SITE_STAGING_ENABLED == 'true'/);assert.match(caller,/head.repo.full_name == github.repository/);
  assert.doesNotMatch(caller,/secrets: inherit/,'do not expose all repository secrets');
  assert.match(workflow,/artifact-ids: \$\{\{ inputs.public_artifact_id \}\}/);assert.match(workflow,/artifact-ids: \$\{\{ inputs.gate_artifact_id \}\}/);
  assert.match(workflow,/environment: staging/);assert.match(workflow,/cancel-in-progress: false/);assert.doesNotMatch(workflow,/pull_request_target|--branch=production|gitHubToken:/);
  assert.ok(workflow.indexOf('Candidate HTTPS')<workflow.indexOf('Promote identical'));assert.ok(workflow.indexOf('state.cjs begin')<workflow.indexOf('Promote identical'));
  assert.match(workflow,/steps.stable_smoke.outcome != 'success'/);assert.match(workflow,/state.cjs verify-rollback-deployment/);assert.match(workflow,/Fail the candidate even when recovery succeeds/);
});
