'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..');
const tools=path.resolve(process.env.SITE_AUDIT_TOOLS||path.join(__dirname,'toolchain'));
const toolRequire=createRequire(path.join(tools,'package.json'));
const out=path.resolve(process.env.SITE_REPORT_DIR||path.join(os.tmpdir(),'site-quality'));
function environment(){return {platform:process.platform,os:os.release(),architecture:os.arch(),node:process.version,runnerImage:process.env.ImageOS||null,imageVersion:process.env.ImageVersion||null,cpus:os.cpus().map(x=>x.model),memoryBytes:os.totalmem(),runId:process.env.GITHUB_RUN_ID||null,attempt:process.env.GITHUB_RUN_ATTEMPT||null};}
function variant(manifest){
  const declared=manifest.components?.variant||manifest.variant;
  if(declared){
    assert.ok(['base','color'].includes(declared.id),'unknown tested runtime variant');
    assert.equal(declared.contract,1,'unsupported tested runtime contract');assert.match(declared.fingerprint,/^[a-f0-9]{64}$/);
    if(manifest.components?.variant&&manifest.variant)assert.deepEqual(manifest.components.variant,manifest.variant,'conflicting tested runtime identity');
    return declared;
  }
  const revision=manifest.components;
  if(revision?.contract===1&&/^[a-f0-9]{64}$/.test(revision.engine||''))return {id:'base',contract:revision.contract,fingerprint:revision.engine};
  throw Error('Missing tested runtime variant identity');
}
function identity(){const m=JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST||path.join(out,'artifact.json')));return {sourceCommit:m.sourceCommit,sourceTree:m.sourceTree,candidateCommit:m.candidateCommit,artifactDigest:m.artifactDigest,variant:variant(m)};}
function save(name,value){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');}
function report(kind,detail,pass=true){const r={schema:1,kind,pass,...identity(),environment:environment(),target:process.env.SITE_TEST_BASE_URL?require('./hosted-origin.cjs').target(process.env.SITE_TEST_BASE_URL,process.env.SITE_TEST_PROFILE):null,...detail};save(kind,r);return r;}
function launchOptions(engine){return {headless:true,timeout:30000,...(engine==='chromium'&&process.env.SITE_AUDIT_CHROME?{executablePath:process.env.SITE_AUDIT_CHROME}:{}),...(engine==='chromium'?{args:['--no-sandbox','--disable-dev-shm-usage']}: {})};}
module.exports={root,tools,toolRequire,out,environment,variant,identity,save,report,launchOptions};
