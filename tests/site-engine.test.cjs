'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),b=require('../tools/site/build.cjs'),artifact=require('../tools/quality/artifact.cjs'),snapshot=require('../tools/site/snapshot.cjs');
function fixture(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'site-engine-'));
  for(const name of ['site','tools/site','tools/build_scene_fallbacks.cjs']){fs.mkdirSync(path.dirname(path.join(dir,name)),{recursive:true});fs.cpSync(path.join(root,name),path.join(dir,name),{recursive:true});}
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  return dir;
}
function edit(dir,name,transform){const file=path.join(dir,name);fs.writeFileSync(file,transform(fs.readFileSync(file,'utf8')));}
function run(dir,options={}){return b.build({root:dir,...options});}
function inventory(dir){return Object.fromEntries(b.files(path.join(dir,'docs')).map(name=>[name,b.sha(fs.readFileSync(path.join(dir,'docs',name)))]));}
function unchanged(before,after,names){for(const name of names)assert.equal(after.files[name],before.files[name],name);}
const aliases=['space.js','navigation.js','theme.js','archive.js','styles.css','assets/favicon.svg','assets/vitalii-oborskyi.jpg','assets/vitalii-oborskyi-cutout.webp'];
test('source migration preserves publication HTML and thematic geometry when shared vocabulary expands',()=>{
  const {config,definitions}=b.configuration(root),c=b.catalog(root),api=b.model(root,definitions);
  const context={module:{exports:{}}};vm.runInNewContext(cp.execFileSync('git',['show','6041a5801729e561c425092323a12cc8e4062f85:docs/space.js'],{cwd:root,encoding:'utf8'}),context);
  for(const route of config.routes){
    const rendered=b.render(root,route,b.routeInput(root,route,c),context.module.exports),original=cp.execFileSync('git',['show','6041a5801729e561c425092323a12cc8e4062f85:docs/'+route.url],{cwd:root,encoding:'utf8'});
    assert.equal(rendered.match(/<main\b[\s\S]*?<\/main>/)[0],original.match(/<main\b[\s\S]*?<\/main>/)[0],route.id+' publication content');
    for(const compact of [false,true]){
      const actual=api.worldFor(route.id,compact).objects.filter(o=>o.family==='thematic'),before=context.module.exports.worldFor(route.id,compact).objects.filter(o=>o.family==='thematic');
      const metadata=objects=>objects.map(({points,...rest})=>rest);
      assert.equal(JSON.stringify(metadata(actual)),JSON.stringify(metadata(before)),route.id+' geometry metadata');
      for(let i=0;i<actual.length;i++)for(let j=0;j<actual[i].points.length;j++)for(let k=0;k<3;k++)assert.ok(Math.abs(actual[i].points[j][k]-before[i].points[j][k])<1e-9,'composed instance matrix preserves rest vertices');
    }
  }
});
test('a Home block changes only Home; unchanged assets/routes retain bytes and full equals incremental',t=>{
  const dir=fixture(t),before=run(dir);
  edit(dir,'site/content/pages/index/about.html',s=>s.replace('About','About<!-- editorial edit -->'));
  const after=run(dir);assert.deepEqual(after.built,['index']);assert.deepEqual(after.reused,['research','writing','talks','credits']);
  unchanged(before,after,[...aliases,'research.html','writing.html','talks.html','credits.html']);
  const once=inventory(dir);assert.deepEqual(run(dir).built,[]);assert.deepEqual(inventory(dir),once);
  run(dir,{all:true});assert.deepEqual(inventory(dir),once);assert.equal(run(dir,{check:true}).removed.length,0);
});
test('one featured edition has a single metadata source shared by Home, Writing and JSON-LD',t=>{
  const dir=fixture(t),before=run(dir);
  edit(dir,'site/content/catalog.json',s=>{const c=JSON.parse(s),r=c.records[c.featured[0]];r.edition.name+=' — revised';r.edition.datePublished='2026-08-30';return JSON.stringify(c,null,2)+'\n';});
  const after=run(dir);assert.deepEqual(after.built,['index','writing']);unchanged(before,after,[...aliases,'research.html','talks.html','credits.html']);
  for(const id of ['index','writing'])assert.match(fs.readFileSync(path.join(dir,'docs',id+'.html'),'utf8'),/— revised/);
});
test('shared footer, scene and producer edits invalidate their complete dependency closure',t=>{
  const dir=fixture(t);run(dir);
  for(const name of ['site/templates/footer.html','site/scenes/world.cjs','tools/site/build.cjs']){
    edit(dir,name,s=>s+(name.endsWith('.html')?'\n<!-- edit -->':'\n// producer/scene edit')+'\n');
    assert.deepEqual(run(dir).built,snapshot.routes,name);
  }
});
test('renamed blocks work after descriptor update; missing inputs leave the last coherent output intact',t=>{
  const dir=fixture(t);run(dir);const before=inventory(dir);
  fs.renameSync(path.join(dir,'site/content/pages/index/about.html'),path.join(dir,'site/content/pages/index/biography.html'));
  assert.throws(()=>run(dir),/ENOENT/);assert.deepEqual(inventory(dir),before);
  edit(dir,'site/content/pages/index/main.html',s=>s.replace('BLOCK:about','BLOCK:biography'));
  edit(dir,'site/content/pages/index/metadata.json',s=>s.replace('"about"','"biography"'));
  assert.deepEqual(run(dir).built,['index']);const after=inventory(dir);
  fs.unlinkSync(path.join(dir,'site/content/pages/index/biography.html'));assert.throws(()=>run(dir),/ENOENT/);assert.deepEqual(inventory(dir),after);
});
test('missing/invalid caches and forged cache/output pairs cannot substitute generated source',t=>{
  const dir=fixture(t);run(dir);const original=inventory(dir),cache=path.join(dir,'.site-cache/build.json');
  for(const invalid of [null,'{bad']){if(invalid===null)fs.unlinkSync(cache);else fs.writeFileSync(cache,invalid);assert.deepEqual(run(dir).built,snapshot.routes);assert.deepEqual(inventory(dir),original);}
  const file=path.join(dir,'docs/index.html');fs.appendFileSync(file,'<!-- forged -->');
  const forged=JSON.parse(fs.readFileSync(cache));forged.files['index.html']=b.sha(fs.readFileSync(file));fs.writeFileSync(cache,JSON.stringify(forged));
  assert.throws(()=>run(dir,{check:true}),/stale/);assert.deepEqual(run(dir).built,['index']);assert.deepEqual(inventory(dir),original);
  fs.writeFileSync(path.join(dir,'site/output-lock.json'),'{}');assert.deepEqual(run(dir).built,snapshot.routes);
});
test('content executable boundaries fail before replacing output; metadata cannot close a script or attribute',t=>{
  const dir=fixture(t);run(dir);const before=inventory(dir),file='site/content/pages/index/about.html',original=fs.readFileSync(path.join(dir,file),'utf8');
  for(const injection of ['<script>alert(1)</script>','<a href="jav&#x61;script:alert(1)">x</a>','<p onclick="alert(1)">x</p>','<svg><image href="https://example.invalid/x"/></svg>']){
    fs.writeFileSync(path.join(dir,file),original+injection);assert.throws(()=>run(dir),/Executable|Unsafe/);assert.deepEqual(inventory(dir),before);
  }
  fs.writeFileSync(path.join(dir,file),original);
  edit(dir,'site/content/pages/index/metadata.json',s=>{const m=JSON.parse(s);m.title='A " title <';m.structuredData.name='</script><script>alert(1)</script>';return JSON.stringify(m);});
  run(dir);const html=fs.readFileSync(path.join(dir,'docs/index.html'),'utf8');
  assert.ok(html.includes('content="A &quot; title &lt;"'));assert.ok(html.includes('\\u003c/script>\\u003cscript>'));assert.ok(!html.includes('<script>alert(1)'));
});
test('verified previous immutable inputs survive a new engine and keep old snapshot dependencies complete',t=>{
  const dir=fixture(t);run(dir);const publicDir=path.join(dir,'docs'),record={...artifact.manifest(publicDir)};
  require('../tools/site/retain.cjs').retain(publicDir,record,path.join(dir,'site/retained'));
  edit(dir,'site/engine/theme.js',s=>s+'\n// next engine\n');run(dir);const next={...artifact.manifest(publicDir)};
  snapshot.verify(publicDir,next);assert.equal(require('../tools/staging/state.cjs').retained({source:record},{source:next}),true);
  for(const [name,info]of Object.entries(record.files).filter(([name])=>snapshot.immutable(name)))assert.deepEqual(next.files[name],info,name);
  const missing=structuredClone(next);delete missing.files[Object.keys(record.files).find(snapshot.immutable)];
  assert.throws(()=>require('../tools/staging/state.cjs').retained({source:record},{source:missing}),/previous immutable/);
});
test('content-only classification is advisory, unknown scope is full, and all mandatory jobs remain',()=>{
  const {config}=b.configuration(root),components=b.fingerprints(root,config),policy=require('../tools/site/evidence-policy.cjs');
  assert.equal(policy.propose(components,components).scope,'content-only');
  for(const next of [null,{}, {...components,engine:'0'.repeat(64)}, {...components,producer:undefined}])assert.equal(policy.propose(components,next).scope,'full');
  assert.equal(policy.propose(components,components).evidenceReuse,false);assert.match(policy.propose(components,components).mandatoryJobs,/all current/);
});
test('checksum triage is exact and append-only; an unknown path, type or value fails closed',()=>{
  const crypto=require('node:crypto'),helper=require('../tools/quality/triage-engine-checksums.cjs'),file='docs/index.html',lines=fs.readFileSync(path.join(root,file),'utf8').split('\n'),line=lines.findIndex(s=>s.includes('name="site-engine"')),value=lines[line].match(/content="([a-f0-9]{64})"/)[1];
  const finding={type:'Hex High Entropy String',line_number:line+1,hashed_secret:crypto.createHash('sha1').update(value).digest('hex')},baseline={findings:[{id:'existing-reviewed-record',reason:'preserve'}]},allowed=new Map([[file,new Set([value])]]);
  assert.equal(helper.append({results:{[file]:[finding]}},baseline,allowed),1);assert.deepEqual(baseline.findings[0],{id:'existing-reviewed-record',reason:'preserve'});
  assert.equal(helper.append({results:{[file]:[finding]}},baseline,allowed),0);
  for(const [report,map]of [[{results:{'unknown.txt':[finding]}},allowed],[{results:{[file]:[{...finding,type:'Private Key'}]}},allowed],[{results:{[file]:[finding]}},new Map([[file,new Set()]])]])assert.throws(()=>helper.append(report,{findings:[]},map));
});
