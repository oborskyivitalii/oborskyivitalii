'use strict';
// One small default check; hosted profiles own the expensive matrix.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),artifact=require('./artifact.cjs');
function run(file,args=[]){
  const result=cp.spawnSync(process.execPath,[file,...args],{cwd:root,encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr||result.stdout||String(result.error));
  return result.stdout;
}
function check(){
  run('tools/site/build.cjs',['--check']);
  const {configuration,model}=require('../site/build.cjs'),{config,definitions}=configuration(root),api=model(root,definitions);
  const workflow=require('./workflow-artifacts.cjs').check(root),geometry=[];
  for(const route of config.routes){
    for(const compact of [false,true]){
      const world=api.worldFor(route.id,compact),shared=world.objects.filter(x=>x.family==='shared'),symbols=new Set(shared.map(x=>x.symbol));
      assert.equal(shared.length,56,'bounded shared grammar');
      for(const symbol of ['brain','line-chart','bar-chart','scatter-chart','attention','softmax','entropy'])assert.ok(symbols.has(symbol),route.id+' lacks '+symbol);
      geometry.push({route:route.id,compact,...require('./geometry.cjs').check(world,compact)});
    }
  }
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'site-local-'));
  try{
    run('review/site-scroll-sync-20261004/export.cjs',[directory]);
    const html=fs.readFileSync(path.join(directory,'Vitalii-Oborskyi-Color-Prototype.html'),'utf8');
    assert.doesNotMatch(html,/backdrop-filter|data-glass|vo\.reading-surface|id=["']surface-mode/,'retired reading effect is absent');
    for(const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!script[1].includes('application/'))new vm.Script(script[2]);
    const payload=JSON.parse(html.match(/id="site-pages">([\s\S]*?)<\/script>/)[1]);
    for(const route of config.routes)assert.match(payload.pages[route.id],/href="\?view=credits"/,'footer reaches utility page');
    run('--test',['tests/flight.test.cjs']);
    const sizes=artifact.checkSize(path.join(root,'docs'));
    console.log(JSON.stringify({profile:'local',pass:true,focusedTests:10,routes:config.routes.length,workflow,geometry,checks:['generated source','finite shared motifs and lines','workflow artifact contract','footer links','standalone script syntax','reading-effect removal','flight and input gate','size budgets'],maxHtmlBytes:Math.max(...sizes.rows.map(x=>x.raw))}));
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
}
function gate(directory){
  const manifest=JSON.parse(fs.readFileSync(path.join(directory,'artifact.json')));
  artifact.verify(path.join(directory,'public'),manifest);assert.equal(manifest.sourceDirty,false);
  const result={...manifest,schema:1,kind:'pr-gate',profile:'local',pass:true,jobs:{build:{result:'success'}},checkedAt:new Date().toISOString(),deploymentAuthorized:false,githubArtifact:{id:process.env.SITE_ARTIFACT_ID||null,uploadDigest:process.env.SITE_UPLOAD_DIGEST||null}};
  fs.mkdirSync(path.join(directory,'gate'),{recursive:true});
  fs.writeFileSync(path.join(directory,'gate/release-manifest.json'),JSON.stringify(result,null,2)+'\n');
}
if(require.main===module){
  try{if(process.argv[2]==='--gate')gate(path.resolve(process.argv[3]));else{check();if(process.argv[2]==='--package')artifact.build(path.resolve(process.argv[3]));}}
  catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={check,gate};
