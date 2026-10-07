'use strict';
// Economical source checks. The separate hosted profiles own the full matrix.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),artifact=require('./artifact.cjs');
function run(file,args=[]){
  const result=cp.spawnSync(process.execPath,[file,...args],{cwd:root,encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr||result.stdout||String(result.error));
  return result.stdout;
}
function tests(files){
  const tap=run('--test',['--test-reporter=tap',...files]);
  const count=key=>Number(tap.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]);
  const result={files,total:count('tests'),passed:count('pass'),failed:count('fail'),skipped:count('skipped')};
  assert.ok(Number.isInteger(result.total)&&result.total>0,'missing Node test accounting');
  assert.equal(result.passed,result.total,'focused tests must all pass');
  assert.equal(result.failed,0);assert.equal(result.skipped,0);
  return result;
}
function finiteGeometry(world,compact){
  assert.ok(Array.isArray(world.objects)&&Array.isArray(world.faces)&&Array.isArray(world.lines));
  return {...require('./geometry.cjs').check(world,compact),finite:true,budget:'configured'};
}

function checkPublicScripts(publicDir,config){
  const scripts=new Set();
  for(const entry of artifact.entries(publicDir)){
    if(entry.path.endsWith('.js')){
      const hash=artifact.digest(entry.bytes);if(!scripts.has(hash)){new vm.Script(entry.bytes.toString('utf8'),{filename:entry.path});scripts.add(hash);}
    }
  }
  for(const route of config.routes){
    const html=fs.readFileSync(path.join(publicDir,route.url),'utf8');
    assert.equal((html.match(/<h1\b/g)||[]).length,1,route.id+' has one main heading');
    assert.match(html,/<a href="credits\.html">Reuse &amp; credits<\/a>/,'footer reaches utility page');
    for(const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!script[1].includes('application/'))new vm.Script(script[2],{filename:route.url});
  }
  return scripts.size;
}
function checkMotifs(api,config){
  const shared=api.worldFor('index',true).objects.filter(x=>x.family==='shared'),symbols=new Set(shared.map(x=>x.symbol));
  const newMotifs=['brain','line-chart','bar-chart','scatter-chart','attention','softmax','entropy'];
  if(!newMotifs.some(symbol=>symbols.has(symbol)))return {status:'not-applicable',reason:'This source edition predates the authored shared motifs'};
  for(const route of config.routes)for(const compact of [false,true]){
    const objects=api.worldFor(route.id,compact).objects.filter(x=>x.family==='shared'),actual=new Set(objects.map(x=>x.symbol));
    assert.equal(objects.length,56,'bounded shared grammar');for(const symbol of newMotifs)assert.ok(actual.has(symbol),route.id+' lacks '+symbol);
  }
  return {status:'checked',symbols:newMotifs};
}
function checkColor(config){
  const colorFiles=['tools/staging/color.cjs','tools/site/variants.cjs','review/site-scroll-sync-20261004/export.cjs','review/site-scroll-sync-20261004/FLIGHT-PROTOTYPE.cjs','review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs','tests/flight.test.cjs'];
  const missing=colorFiles.filter(name=>!fs.existsSync(path.join(root,name)));
  if(missing.length)return {status:'not-applicable',missing};
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'site-local-'));
  try{
    run('review/site-scroll-sync-20261004/export.cjs',[directory]);
    const html=fs.readFileSync(path.join(directory,'Vitalii-Oborskyi-Color-Prototype.html'),'utf8');
    assert.doesNotMatch(html,/backdrop-filter|data-glass|vo\.reading-surface|id=["']surface-mode/,'retired reading effect is absent');
    for(const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!script[1].includes('application/'))new vm.Script(script[2]);
    const payload=JSON.parse(html.match(/id="site-pages">([\s\S]*?)<\/script>/)[1]);
    for(const route of config.routes)assert.match(payload.pages[route.id],/href="\?view=credits"/,'footer reaches utility page');
    return {status:'checked',focusedTests:tests(['tests/flight.test.cjs'])};
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
}
function check(){
  run('tools/site/build.cjs',['--check']);
  const {configuration,model}=require('../site/build.cjs'),{config,definitions}=configuration(root),api=model(root,definitions),geometry=[];
  const focused=tests(['tests/theme.test.cjs','tests/archive.test.cjs']);
  const helpers=fs.existsSync(path.join(__dirname,'workflow-artifacts.cjs'));
  const workflow=helpers?require('./workflow-artifacts.cjs').check(root):{status:'not-applicable',reason:'This source edition has no additional workflow namespace helper'};
  for(const route of config.routes)for(const compact of [false,true])geometry.push({route:route.id,compact,...finiteGeometry(api.worldFor(route.id,compact),compact)});
  const publicDir=path.join(root,'docs'),uniqueScripts=checkPublicScripts(publicDir,config);
  const manifest=artifact.manifest(publicDir);artifact.verify(publicDir,manifest);
  const sizes=artifact.checkSize(publicDir),extensions={sharedMotifs:checkMotifs(api,config),color:checkColor(config)};
  const result={profile:'local',pass:true,focusedTests:focused,routes:config.routes.length,workflow,geometry,extensions,checks:['generated source','finite geometry','script syntax','single main heading','footer links','artifact snapshot integrity','size budgets'],uniqueScripts,maxHtmlBytes:Math.max(...sizes.rows.map(x=>x.raw)),deploymentAuthorized:false};
  console.log(JSON.stringify(result));return result;
}
function gate(directory,{profile='local'}={}){
  const manifest=JSON.parse(fs.readFileSync(path.join(directory,'artifact.json')));
  artifact.verify(path.join(directory,'public'),manifest);assert.equal(manifest.sourceDirty,false);
  assert.ok(['local','package'].includes(profile),'unknown source gate profile');
  if(profile==='package'){
    assert.equal(cp.execFileSync('git',['status','--porcelain','--untracked-files=all'],{cwd:root,encoding:'utf8'}).trim(),'','package proof requires clean source');
    run('tools/site/build.cjs',['--check']);
    assert.equal(manifest.sourceCommit,cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim());
    assert.equal(manifest.sourceTree,cp.execFileSync('git',['rev-parse','HEAD^{tree}'],{cwd:root,encoding:'utf8'}).trim());
    assert.equal(manifest.candidateCommit,manifest.sourceCommit);
    artifact.checkSize(path.join(directory,'public'));
  }
  const result={...manifest,schema:1,kind:profile==='package'?'package-gate':'pr-gate',profile,pass:true,jobs:{build:{result:'success'}},checkedAt:new Date().toISOString(),deploymentAuthorized:false,githubArtifact:{id:process.env.SITE_ARTIFACT_ID||null,uploadDigest:process.env.SITE_UPLOAD_DIGEST||null}};
  if(profile==='package')Object.assign(result,{checks:['generated source','artifact snapshot integrity','size budgets'],sourceTestsRun:false,fullGate:false,productionEligible:false});
  fs.mkdirSync(path.join(directory,'gate'),{recursive:true});
  fs.writeFileSync(path.join(directory,'gate/release-manifest.json'),JSON.stringify(result,null,2)+'\n');
}
if(require.main===module){
  try{if(process.argv[2]==='--gate'||process.argv[2]==='--package-gate')gate(path.resolve(process.argv[3]),{profile:process.argv[2]==='--package-gate'?'package':'local'});else{check();if(process.argv[2]==='--package')artifact.build(path.resolve(process.argv[3]));else if(process.argv.length>2)throw Error('Usage: local.cjs [--package OUT | --gate OUT | --package-gate OUT]');}}
  catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={check,gate,finiteGeometry};
