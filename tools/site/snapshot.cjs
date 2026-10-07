'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const routes=['index','research','writing','talks','credits'];
const runtimeFiles=['styles.css','theme.js','space.js','archive.js','navigation.js'];
const legacyMediaFiles=['favicon.svg','vitalii-oborskyi.jpg','vitalii-oborskyi-cutout.webp'];
const mediaFiles=[...legacyMediaFiles,'writing-paradigm.svg'];
const baseFiles=['.nojekyll',...routes.map(x=>x+'.html'),...runtimeFiles,...mediaFiles.map(x=>'assets/'+x),'site-revision.json'].sort();
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function immutable(name) {
  const match=name.match(/^(runtime|media|snapshots)\/([a-f0-9]{64})\/([a-z0-9.-]+)$/);
  return !!match&&(match[1]==='runtime'?[...runtimeFiles,'analytics.js']:match[1]==='media'?mediaFiles:routes.map(x=>x+'.html')).includes(match[3]);
}
function inventory(names,requiredMedia=legacyMediaFiles) {
  assert.ok(names.length<=1000,'public retention inventory bound');
  for(const name of baseFiles.filter(name=>!name.startsWith('assets/')).concat(requiredMedia.map(name=>'assets/'+name)))assert.ok(names.includes(name),'missing public file '+name);
  for(const name of names)assert.ok(baseFiles.includes(name)||immutable(name),'unexpected public input '+name);
  return true;
}
function verify(dir,record) {
  const files=record.files;inventory(Object.keys(files),legacyMediaFiles);
  const read=name=>fs.readFileSync(path.join(dir,name));
  const revision=JSON.parse(read('site-revision.json'));
  const declaredMedia=revision.mediaFiles===undefined?legacyMediaFiles:revision.mediaFiles;
  if(revision.mediaFiles!==undefined)assert.deepEqual(declaredMedia,mediaFiles,'finite current media declaration');
  else assert.ok(!Object.hasOwn(files,'assets/writing-paradigm.svg')&&!read('space.js').toString().includes('writing-paradigm')&&!read('writing.html').toString().includes('writing-paradigm'),'formula artifact requires current media declaration');
  inventory(Object.keys(files),declaredMedia);
  assert.equal(revision.schema,1);assert.equal(revision.contract,1);
  for(const key of ['engine','scenes','assets','content'])assert.match(revision[key],/^[a-f0-9]{64}$/);
  assert.deepEqual(Object.keys(revision.routes),routes);
  for(const name of runtimeFiles)assert.deepEqual(read(`runtime/${revision.engine}/${name}`),read(name),'immutable runtime differs from tested alias');
  for(const name of declaredMedia)assert.deepEqual(read(`media/${revision.assets}/${name}`),read('assets/'+name),'immutable media differs from tested alias');
  for(const name of Object.keys(files).filter(x=>/^runtime\/[a-f0-9]{64}\/analytics\.js$/.test(x)))assert.equal(hash(read(name)),name.split('/')[1],'immutable analytics digest');
  for(const id of routes) {
    const route=revision.routes[id];assert.match(route.version,/^[a-f0-9]{64}$/);assert.match(route.sha256,/^[a-f0-9]{64}$/);
    assert.equal(route.url,`snapshots/${route.version}/${id}.html`);assert.equal(hash(read(route.url)),route.sha256,'route snapshot digest');
    const html=read(id+'.html').toString();assert.ok(html.includes(`name="site-engine" content="${revision.engine}"`));assert.ok(html.includes(`name="site-route" content="${route.version}"`));
    for(const name of runtimeFiles)assert.ok(html.includes(`="runtime/${revision.engine}/${name}"`),'unversioned runtime reference');
  }
  for(const name of Object.keys(files).filter(x=>x.endsWith('.html'))) {
    const html=read(name).toString(),base=new URL(name,'https://snapshot.invalid/');
    for(const [,value]of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      const url=new URL(value.replaceAll('&amp;','&'),base);
      if(url.origin!==base.origin)continue;
      const target=decodeURIComponent(url.pathname.slice(1))||'index.html';
      assert.ok(Object.hasOwn(files,target),'snapshot dependency missing '+name+' → '+target);
    }
  }
  return revision;
}
module.exports={routes,runtimeFiles,mediaFiles,legacyMediaFiles,baseFiles,immutable,inventory,verify};
