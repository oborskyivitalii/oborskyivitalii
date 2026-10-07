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
test('content links admit a plain public mailto without admitting executable schemes or mail headers',()=>{
  const safe='<a href="mailto:oborskyivitalii@gmail.com">Email</a>';
  assert.equal(b.validateFragment(safe,'contact'),safe);
  for(const value of ['mailto:oborskyivitalii@gmail.com?bcc=other@example.com','mailto:oborskyivitalii@gmail.com%0d%0aBcc:other@example.com','javascript:alert(1)','data:text/html,hello','mailto:other@example.com,second@example.com']){
    assert.throws(()=>b.validateFragment('<a href="'+value+'">Email</a>','contact'),/Unsafe/);
  }
});
test('the canonical formula compiles once into finite strong glyphs and rejects executable, malformed and changed artwork',()=>{
  const assets=require('../tools/site/scene-assets.cjs'),source=fs.readFileSync(path.join(root,'site/assets/writing-paradigm.svg'),'utf8'),art=assets.compile(source);
  assert.equal(art.width,1380);assert.equal(art.height,240);assert.equal(art.paths.length,15);
  assert.equal(art.paths.reduce((n,p)=>n+p.commands.length,0),65);assert.equal(Object.hasOwn(assets.runtime(art),'svg'),false,'runtime contains numeric commands without XML');
  const duplicateGlyph=source.match(/<path data-glyph="y"[^>]*\/>/)[0];
  for(const changed of [source.replace('</svg>','<script>alert(1)</script></svg>'),source.replace('M57 95','MInfinity 95'),source.replace('M57 95','M57'),source.replace('M57 95','M6 95'),source.replace('width="1380"','width="8192"'),source.replace('stroke-width="14"','stroke-width="7"'),source.replace('P(y|x)','P(x|y)'),source.replace('data-glyph="P"','data-glyph="Q"'),source.replace('d="M57','onload="alert(1)" d="M57'),source.replace('</g>','</defs>'),source.replace('</svg>',''),source.replace('</g>',duplicateGlyph+'</g>'),source.replace('</defs>','</defs><title id="title">duplicate</title>'),source.replace('M57 95','M57 95'+' L60 100'.repeat(16)),source.replace('</defs>','</defs>'+'<defs/>'.repeat(16))])assert.throws(()=>assets.compile(changed));
});
function formulaProjectionCase(api,definitions,anchor,pose,width,height){
      const initial=api.projectedFormula(anchor,pose,width,height,0),moved=api.projectedFormula(anchor,pose,width,height,api.LOOP_MS/4),closed=api.projectedFormula(anchor,pose,width,height,api.LOOP_MS);
      assert.ok(initial);assert.notEqual(initial.points[0][1],initial.points[1][1],'plane is tilted');
      assert.equal(initial.cameraLayers.length,3);assert.notDeepEqual(initial.cameraLayers[0],initial.cameraLayers[2],'real depth separates front and back');
      assert.notDeepEqual(moved.points,initial.points,'same ambient clock moves and pulses the landmark');
      for(let i=0;i<4;i++)for(let j=0;j<2;j++)assert.ok(Math.abs(closed.points[i][j]-initial.points[i][j])<1e-8,'loop closes without drift');
      const span=shape=>Math.max(...shape.points.map(p=>p[0]))-Math.min(...shape.points.map(p=>p[0]));
      let maximum=span(initial),seen=false;
      for(let sample=0;sample<=64;sample++){
        const current=api.projectedFormula(anchor,api.journeyPose(definitions.topicPaths.all,sample/64),width,height,0);
        if(!current)continue;seen=true;maximum=Math.max(maximum,span(current));
        assert.ok(current.points.flat().every(Number.isFinite),'bounded finite projection');
        assert.ok(current.cameraCorners.every(point=>point[2]>.5),'whole expression fades before camera crosses it');
      }
      assert.ok(seen&&maximum>span(initial)*1.2,'native camera approaches the formula through the fractal');
}
test('Writing formula is a tilted moving world landmark with one same-scene static rendition and no layout band',()=>{
  const {definitions}=b.configuration(root),api=b.model(root,definitions),c=b.catalog(root),fallbacks=require('../tools/build_scene_fallbacks.cjs');
  for(const route of definitions.routeOrder)for(const compact of [false,true]){
    const world=api.worldFor(route,compact),input=b.routeInput(root,{id:route},c),fallback=fallbacks.fromModel(api,route);
    assert.equal(world.formulas.length,route==='writing'?1:0);
    assert.equal([...fallback.matchAll(/data-formula="writing-paradigm"/g)].length,route==='writing'?1:0);
    assert.equal(input.main.includes('data-writing-formula='),false,'no formula owns content layout');
    assert.equal(input.main.includes('writing-formula-fallback'),false,'decorative artwork belongs to the existing scene');
    assert.equal(input.main.includes('{{WRITING_FORMULA}}'),false,'no banner producer token remains');
    assert.equal(input.main.includes('data-writing-formula-description'),route==='writing','one short accessible semantic description');
    if(route!=='writing')continue;
    const anchor=world.formulas[0],pose=api.poses[api.initialPoses[route]],art=api.sceneAsset;
    assert.deepEqual(anchor.rootCenter,world.objects.find(o=>o.root===anchor.root).rootCenter,'same fractal root');
    assert.ok(anchor.rotation.some(angle=>angle!==0));assert.ok(anchor.extrusion>0);
    assert.equal([...fallback.matchAll(/data-glyph=/g)].length,art.paths.length,'one visible front rendition of every canonical glyph');
    assert.equal([...fallback.matchAll(/data-formula-layer=/g)].length,3,'bounded world-depth extrusion');
    const layerOpacity=[...fallback.matchAll(/data-formula-layer="\d" stroke-opacity="([^"]+)"/g)].map(match=>Number(match[1]));
    assert.deepEqual(layerOpacity,Array(3).fill(Number(api.projectedFormula(anchor,pose,1440,900,0).alpha.toFixed(3))),'static glyph layers share world haze without additional translucent ghosts');
    assert.equal([...fallback.matchAll(/<svg\b/g)].length,1,'one existing fallback scene');
    assert.equal(/<(?:image|use|filter|text|script|foreignObject)\b|(?:href|src)=/.test(fallback),false,'no font, filter or external artwork request');
    const first=api.projectFormulaPoint(anchor,pose,1440,900,0,art.paths[0].commands[0][1]/art.width,art.paths[0].commands[0][2]/art.height);
    const firstPoint=fallback.match(/data-glyph="0" d="M(-?[\d.]+) (-?[\d.]+)/);
    assert.ok(firstPoint,'static glyph has its canonical projected move');
    assert.deepEqual(firstPoint.slice(1).map(Number),first.map(n=>Number(n.toFixed(2))),
      'static glyph uses the exact rounded canonical point, independent of redundant decimal zeroes');
    for(const [width,height]of [[320,740],[390,844],[768,1024],[1440,900]])formulaProjectionCase(api,definitions,anchor,pose,width,height);
  }
});
test('embedded formula artwork changes immutable runtime identity and packaged media coherently',t=>{
  const dir=fixture(t),before=run(dir),oldRevision=JSON.parse(fs.readFileSync(path.join(dir,'docs/site-revision.json'))),oldRuntime=fs.readFileSync(path.join(dir,'docs/space.js'));
  edit(dir,'site/assets/writing-paradigm.svg',source=>source.replace('M57 95','M58 95'));
  const after=run(dir),newRevision=JSON.parse(fs.readFileSync(path.join(dir,'docs/site-revision.json'))),newRuntime=fs.readFileSync(path.join(dir,'docs/space.js'));
  assert.notDeepEqual(newRuntime,oldRuntime);assert.notEqual(newRevision.engine,oldRevision.engine,'different embedded artwork cannot reuse an immutable runtime URL');
  assert.notEqual(newRevision.assets,oldRevision.assets);assert.notEqual(after.files['assets/writing-paradigm.svg'],before.files['assets/writing-paradigm.svg']);
  assert.deepEqual(after.built,['index','research','writing','talks','credits']);
  assert.deepEqual(fs.readFileSync(path.join(dir,`docs/runtime/${newRevision.engine}/space.js`)),newRuntime);
  assert.deepEqual(fs.readFileSync(path.join(dir,`docs/media/${newRevision.assets}/writing-paradigm.svg`)),fs.readFileSync(path.join(dir,'site/assets/writing-paradigm.svg')));
  snapshot.verify(path.join(dir,'docs'),{files:after.files});run(dir,{check:true});
  edit(dir,'tools/site/scene-assets.cjs',source=>source.replace('return compiled;','compiled.paths[0].commands[0][1]+=.25;return compiled;'));
  const compilerChange=run(dir),compilerRevision=JSON.parse(fs.readFileSync(path.join(dir,'docs/site-revision.json'))),compilerRuntime=fs.readFileSync(path.join(dir,'docs/space.js'));
  assert.notDeepEqual(compilerRuntime,newRuntime,'compiler-only changes affect the actual serialized glyph payload');
  assert.notEqual(compilerRevision.engine,newRevision.engine,'compiler-only changes cannot reuse an immutable runtime URL');
  assert.equal(compilerRevision.assets,newRevision.assets,'compiler-only changes preserve source artwork identity');
  assert.deepEqual(fs.readFileSync(path.join(dir,`docs/runtime/${compilerRevision.engine}/space.js`)),compilerRuntime);
  snapshot.verify(path.join(dir,'docs'),{files:compilerChange.files});run(dir,{check:true});
});
test('missing canonical formula fails generation without replacing the coherent public output',t=>{
  const dir=fixture(t);run(dir);const before=inventory(dir);
  fs.unlinkSync(path.join(dir,'site/assets/writing-paradigm.svg'));
  assert.throws(()=>require('../tools/site/scene-assets.cjs').load(dir),/ENOENT/);
  assert.throws(()=>run(dir),/ENOENT/);assert.deepEqual(inventory(dir),before);
});
test('formula media declaration preserves legacy artifacts while current omissions fail closed',t=>{
  const dir=fixture(t),current=run(dir),publicDir=path.join(dir,'docs'),revisionFile=path.join(publicDir,'site-revision.json'),revision=JSON.parse(fs.readFileSync(revisionFile));
  assert.deepEqual(revision.mediaFiles,snapshot.mediaFiles);snapshot.verify(publicDir,{files:current.files});
  const missingAlias={files:{...current.files}};delete missingAlias.files['assets/writing-paradigm.svg'];
  assert.throws(()=>snapshot.verify(publicDir,missingAlias),/missing public file assets\/writing-paradigm.svg/);
  const noDeclaration={...revision};delete noDeclaration.mediaFiles;fs.writeFileSync(revisionFile,JSON.stringify(noDeclaration));
  assert.throws(()=>snapshot.verify(publicDir,{files:current.files}),/formula artifact requires current media declaration/);
  fs.writeFileSync(revisionFile,JSON.stringify({...revision,mediaFiles:snapshot.legacyMediaFiles}));
  assert.throws(()=>snapshot.verify(publicDir,{files:current.files}),/finite current media declaration/);
  // Construct the pre-feature descriptor shape from the same ordinary producer
  // with an empty landmark vocabulary. No current formula bytes survive.
  edit(dir,'site/scenes/world.cjs',source=>source.replace(/const formulas=page==='writing'\?[^\n]+;/,'const formulas=[];'));
  const prior=run(dir,{all:true}),priorRevision=JSON.parse(fs.readFileSync(revisionFile));delete priorRevision.mediaFiles;
  const legacyRecord={files:{...prior.files}};delete legacyRecord.files['assets/writing-paradigm.svg'];delete legacyRecord.files[`media/${priorRevision.assets}/writing-paradigm.svg`];
  fs.unlinkSync(path.join(publicDir,'assets/writing-paradigm.svg'));fs.unlinkSync(path.join(publicDir,`media/${priorRevision.assets}/writing-paradigm.svg`));fs.writeFileSync(revisionFile,JSON.stringify(priorRevision));
  assert.equal(fs.readFileSync(path.join(publicDir,'space.js'),'utf8').includes('writing-paradigm'),false);
  assert.equal(fs.readFileSync(path.join(publicDir,'writing.html'),'utf8').includes('writing-paradigm'),false);
  assert.doesNotThrow(()=>snapshot.verify(publicDir,legacyRecord),'legacy three-media descriptors remain verifiable for previous artifact import');
});
test('source migration preserves publication HTML and thematic geometry when shared vocabulary expands',()=>{
  const {config,definitions}=b.configuration(root),c=b.catalog(root),api=b.model(root,definitions);
  const context={module:{exports:{}}};vm.runInNewContext(cp.execFileSync('git',['show','6041a5801729e561c425092323a12cc8e4062f85:docs/space.js'],{cwd:root,encoding:'utf8'}),context);
  for(const route of config.routes){
    const rendered=b.render(root,route,b.routeInput(root,route,c),context.module.exports),original=cp.execFileSync('git',['show','6041a5801729e561c425092323a12cc8e4062f85:docs/'+route.url],{cwd:root,encoding:'utf8'});
    assert.equal(require('../tools/check_site_seo.cjs').restoreApprovedContent(rendered.match(/<main\b[\s\S]*?<\/main>/)[0],route.id),original.match(/<main\b[\s\S]*?<\/main>/)[0],route.id+' publication content with exact approved contact/title/response transformations');
    for(const compact of [false,true]){
      const actual=api.worldFor(route.id,compact).objects.filter(o=>o.family==='thematic'),before=context.module.exports.worldFor(route.id,compact).objects.filter(o=>o.family==='thematic');
      // V1 tightens only the acceleration bound. Compare every semantic/style
      // field and every rest vertex; independently prove the new sphere contains
      // the geometry and is no broader than its frozen conservative bound.
      const metadata=objects=>objects.map(o=>Object.fromEntries(Object.entries(o).filter(([key])=>!['points','radius'].includes(key))));
      assert.equal(JSON.stringify(metadata(actual)),JSON.stringify(metadata(before)),route.id+' geometry metadata');
      for(let i=0;i<actual.length;i++){
        assert.ok(actual[i].radius<=before[i].radius,route.id+' tightened bound');
        for(const point of actual[i].points)assert.ok(Math.hypot(...point.map((v,k)=>v-actual[i].center[k]))<=actual[i].radius,route.id+' contains every vertex');
      }
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
test('catalog editions reject duplicates, unread metadata and unsafe relationships before generation',t=>{
  const dir=fixture(t),file=path.join(dir,'site/content/catalog.json'),original=JSON.parse(fs.readFileSync(file,'utf8'));
  const cases=[
    c=>c.records['publication-09'].editions.push(structuredClone(c.records['publication-09'].editions[0])),
    c=>c.records['publication-09'].editions[0].url='javascript:alert(1)',
    c=>c.records['publication-09'].editions[0].datePublished='2025-02-30',
    c=>delete c.records['publication-09'].editions[0].author,
    c=>c.records['publication-09'].editions[0].bodyEquivalenceVerified=true,
    c=>c.records['publication-09'].editions[0].inLanguage='unknown',
    c=>c.structuredOrder[0].record='publication-99',
    c=>c.discussions['reddit-controller'].url=c.discussions['reddit-agentic-loops'].url,
    c=>c.records['publication-09'].discussions=['missing-thread'],
    c=>c.discussions['reddit-controller'].metrics.shares=80,
    c=>c.discussions['reddit-controller'].metrics.views.approximateValue=47000,
    c=>c.discussions['reddit-controller'].snapshot.capturedAt='2026-10-07',
  ];
  for(const mutate of cases){const c=structuredClone(original);mutate(c);fs.writeFileSync(file,JSON.stringify(c));assert.throws(()=>b.catalog(dir),/Invalid|Duplicate|Missing/);}
});
test('alternate metadata, discussion data and structured order invalidate their actual route dependencies',t=>{
  const dir=fixture(t);run(dir);
  edit(dir,'site/content/catalog.json',s=>{const c=JSON.parse(s);c.records['publication-09'].editions[0].name='A " title < with a different date';c.records['publication-09'].editions[0].datePublished='2025-12-12';return JSON.stringify(c);});
  assert.deepEqual(run(dir).built,['writing']);
  const writing=fs.readFileSync(path.join(dir,'docs/writing.html'),'utf8');assert.match(writing,/title="A &quot; title &lt; with a different date"/);assert.match(writing,/LinkedIn edition · 12 Dec 2025/);
  edit(dir,'site/content/catalog.json',s=>{const c=JSON.parse(s);c.discussions['reddit-agentic-loops'].summary+=' Further questions.';return JSON.stringify(c);});
  assert.deepEqual(run(dir).built,['research','writing']);
  edit(dir,'site/content/catalog.json',s=>{const c=JSON.parse(s);c.structuredOrder.reverse();return JSON.stringify(c);});
  assert.deepEqual(run(dir).built,['writing']);
  const once=inventory(dir);run(dir,{all:true});assert.deepEqual(inventory(dir),once);
});
test('discussion metrics can be omitted while links, work counts and JSON-LD retain their own identities',t=>{
  const dir=fixture(t);edit(dir,'site/content/catalog.json',s=>{const c=JSON.parse(s);c.discussions['reddit-delivery-bottlenecks'].metrics=null;return JSON.stringify(c);});
  const {config}=b.configuration(dir),c=b.catalog(dir),writing=b.routeInput(dir,config.routes.find(r=>r.id==='writing'),c),research=b.routeInput(dir,config.routes.find(r=>r.id==='research'),c);
  assert.equal(writing.schema.mainEntity.numberOfItems,Object.keys(c.records).length);assert.equal(writing.schema.mainEntity.itemListElement.length,Object.keys(c.records).length);
  assert.equal(JSON.stringify(writing.schema).includes('reddit.com'),false);assert.equal(writing.main.includes('post views'),false);
  assert.ok(research.main.includes(c.discussions['reddit-delivery-bottlenecks'].url));assert.equal(research.main.includes('≈13K'),false);assert.ok(research.main.includes('≈48K'));
  const counts=b.catalogCounts(c);assert.equal(counts.linked.total,counts.primary.total+Object.values(c.records).reduce((n,r)=>n+r.editions.length,0));
});
