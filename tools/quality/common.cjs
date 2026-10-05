'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..');
const tools=path.resolve(process.env.SITE_AUDIT_TOOLS||path.join(__dirname,'toolchain'));
const toolRequire=createRequire(path.join(tools,'package.json'));
const out=path.resolve(process.env.SITE_REPORT_DIR||path.join(os.tmpdir(),'site-quality'));
function environment(){return {platform:process.platform,os:os.release(),architecture:os.arch(),node:process.version,runnerImage:process.env.ImageOS||null,imageVersion:process.env.ImageVersion||null,cpus:os.cpus().map(x=>x.model),memoryBytes:os.totalmem(),runId:process.env.GITHUB_RUN_ID||null,attempt:process.env.GITHUB_RUN_ATTEMPT||null};}
function identity(){const m=JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST||path.join(out,'artifact.json')));return {sourceCommit:m.sourceCommit,sourceTree:m.sourceTree,candidateCommit:m.candidateCommit,artifactDigest:m.artifactDigest,variant:m.components?.variant};}
function save(name,value){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');}
function report(kind,detail,pass=true){const r={schema:1,kind,pass,...identity(),environment:environment(),target:process.env.SITE_TEST_BASE_URL?require('./hosted-origin.cjs').target(process.env.SITE_TEST_BASE_URL,process.env.SITE_TEST_PROFILE):null,...detail};save(kind,r);return r;}
function launchOptions(engine){return {headless:true,timeout:30000,...(engine==='chromium'&&process.env.SITE_AUDIT_CHROME?{executablePath:process.env.SITE_AUDIT_CHROME}:{}),...(engine==='chromium'?{args:['--no-sandbox','--disable-dev-shm-usage']}: {})};}
module.exports={root,tools,toolRequire,out,environment,identity,save,report,launchOptions};
