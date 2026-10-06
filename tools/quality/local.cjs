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
  const finite=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
  assert.ok(Array.isArray(world.objects)&&Array.isArray(world.faces)&&Array.isArray(world.lines));
  for(const object of world.objects)assert.ok(object.points.every(finite),'nonfinite object vertex');
  for(const face of world.faces)assert.ok(face.points.every(finite),'nonfinite face vertex');
  for(const line of world.lines)assert.ok(finite(line.a)&&finite(line.b),'nonfinite line endpoint');
  const row={objects:world.objects.length,vertices:world.objects.reduce((n,x)=>n+x.points.length,0),faces:world.faces.length,lines:world.lines.length,modelBytes:Buffer.byteLength(JSON.stringify(world))};
  const limits=require('./budgets.json').geometry?.[compact?'compact':'full'];
  if(limits)for(const [key,limit]of Object.entries(limits))assert.ok(row[key]<=limit,`geometry ${key}: ${row[key]} > ${limit}`);
  return {...row,finite:true,budget:limits?'configured':'no geometry budget in this source edition'};
}
function check(){
  run('tools/site/build.cjs',['--check']);
  const {configuration,model}=require('../site/build.cjs'),{config,definitions}=configuration(root),api=model(root,definitions),geometry=[];
  const focused=tests(['tests/theme.test.cjs','tests/archive.test.cjs']);
  const helpers=fs.existsSync(path.join(__dirname,'workflow-artifacts.cjs'));
  const workflow=helpers?require('./workflow-artifacts.cjs').check(root):{status:'not-applicable',reason:'This source edition has no additional workflow namespace helper'};
  for(const route of config.routes)for(const compact of [false,true])geometry.push({route:route.id,compact,...finiteGeometry(api.worldFor(route.id,compact),compact)});
  const publicDir=path.join(root,'docs'),scripts=new Set();
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
  const manifest=artifact.manifest(publicDir);artifact.verify(publicDir,manifest);
  const sizes=artifact.checkSize(publicDir),shared=api.worldFor('index',true).objects.filter(x=>x.family==='shared'),symbols=new Set(shared.map(x=>x.symbol));
  const newMotifs=['brain','line-chart','bar-chart','scatter-chart','attention','softmax','entropy'];
  const motifCapability=newMotifs.some(symbol=>symbols.has(symbol));
  const colorFiles=['tools/staging/color.cjs','tools/site/variants.cjs','review/site-scroll-sync-20261004/export.cjs','review/site-scroll-sync-20261004/FLIGHT-PROTOTYPE.cjs','review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs','tests/flight.test.cjs'];
  const missing=colorFiles.filter(name=>!fs.existsSync(path.join(root,name)));
  const extensions={sharedMotifs:motifCapability?{status:'checked',symbols:newMotifs}:{status:'not-applicable',reason:'This source edition predates the authored shared motifs'},color:missing.length?{status:'not-applicable',missing}:{status:'checked'}};
  if(motifCapability)for(const route of config.routes)for(const compact of [false,true]){
    const objects=api.worldFor(route.id,compact).objects.filter(x=>x.family==='shared'),actual=new Set(objects.map(x=>x.symbol));
    assert.equal(objects.length,56,'bounded shared grammar');for(const symbol of newMotifs)assert.ok(actual.has(symbol),route.id+' lacks '+symbol);
  }
  if(!missing.length){
    const directory=fs.mkdtempSync(path.join(os.tmpdir(),'site-local-'));
    try{
      run('review/site-scroll-sync-20261004/export.cjs',[directory]);
      const html=fs.readFileSync(path.join(directory,'Vitalii-Oborskyi-Color-Prototype.html'),'utf8');
      assert.doesNotMatch(html,/backdrop-filter|data-glass|vo\.reading-surface|id=["']surface-mode/,'retired reading effect is absent');
      for(const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!script[1].includes('application/'))new vm.Script(script[2]);
      const payload=JSON.parse(html.match(/id="site-pages">([\s\S]*?)<\/script>/)[1]);
      for(const route of config.routes)assert.match(payload.pages[route.id],/href="\?view=credits"/,'footer reaches utility page');
      extensions.color.focusedTests=tests(['tests/flight.test.cjs']);
    }finally{fs.rmSync(directory,{recursive:true,force:true});}
  }
  const result={profile:'local',pass:true,focusedTests:focused,routes:config.routes.length,workflow,geometry,extensions,checks:['generated source','finite geometry','script syntax','single main heading','footer links','artifact snapshot integrity','size budgets'],uniqueScripts:scripts.size,maxHtmlBytes:Math.max(...sizes.rows.map(x=>x.raw)),deploymentAuthorized:false};
  console.log(JSON.stringify(result));return result;
}
function gate(directory){
  const manifest=JSON.parse(fs.readFileSync(path.join(directory,'artifact.json')));
  artifact.verify(path.join(directory,'public'),manifest);assert.equal(manifest.sourceDirty,false);
  const result={...manifest,schema:1,kind:'pr-gate',profile:'local',pass:true,jobs:{build:{result:'success'}},checkedAt:new Date().toISOString(),deploymentAuthorized:false,githubArtifact:{id:process.env.SITE_ARTIFACT_ID||null,uploadDigest:process.env.SITE_UPLOAD_DIGEST||null}};
  fs.mkdirSync(path.join(directory,'gate'),{recursive:true});
  fs.writeFileSync(path.join(directory,'gate/release-manifest.json'),JSON.stringify(result,null,2)+'\n');
}
if(require.main===module){
  try{if(process.argv[2]==='--gate')gate(path.resolve(process.argv[3]));else{check();if(process.argv[2]==='--package')artifact.build(path.resolve(process.argv[3]));else if(process.argv.length>2)throw Error('Usage: local.cjs [--package OUT | --gate OUT]');}}
  catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={check,gate,finiteGeometry};
