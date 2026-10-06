'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {artifactFile,verifyResponse}=require('../tools/quality/local-browser.cjs');
const base='https://candidate.example.test',hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const content={
  'index.html':'<h1>Home</h1>',
  'research.html':'<h1>Research</h1>',
  'writing.html':'<h1>Writing</h1>',
  'snapshots/revision/index.html':'<h1>Snapshot home</h1>',
  'snapshots/revision/research.html':'<h1>Snapshot research</h1>',
  'runtime/revision/space.js':'window.scene=true;',
};
const manifest={files:Object.fromEntries(Object.entries(content).map(([name,bytes])=>[name,{sha256:hash(bytes)}]))};
function response(path,{status=200,location,body=content[artifactFile(base+path,base,manifest)],origin=base}={}){
  let bodyReads=0;
  return {url:()=>origin+path,status:()=>status,headers:()=>location===undefined?{}:{location},body:async()=>{
    bodyReads++;if(status>=300&&status<400)throw Error('Response body is unavailable for redirect responses');return Buffer.from(body??'');
  },reads:()=>bodyReads};
}
test('Cloudflare canonical routes map extensionless HTML, root, index and nested index aliases',()=>{
  for(const [pathname,file]of [
    ['/','index.html'],['/index','index.html'],['/index.html','index.html'],
    ['/research','research.html'],['/research?topic=systems','research.html'],
    ['/snapshots/revision/','snapshots/revision/index.html'],
    ['/snapshots/revision/index','snapshots/revision/index.html'],
    ['/snapshots/revision/research','snapshots/revision/research.html'],
    ['/runtime/revision/space.js','runtime/revision/space.js'],
  ])assert.equal(artifactFile(base+pathname,base,manifest),file,pathname);
  assert.equal(artifactFile(base+'/missing',base,manifest),null);
  assert.equal(artifactFile('https://other.example.test/research',base,manifest),null);
});
test('canonical HTML redirects are validated without reading a body or counting verified bytes',async()=>{
  for(const status of [301,302,303,307,308])for(const [from,to,file]of [
    ['/research.html','/research','research.html'],['/index.html','/','index.html'],
    ['/snapshots/revision/index.html','./','snapshots/revision/index.html'],
  ]){
    const observed=response(from,{status,location:to}),checked=new Set();
    const result=await verifyResponse(observed,base,manifest,checked);
    assert.equal(result.file,file);assert.equal(result.status,status);assert.equal(result.redirect,new URL(to,base+from).href);
    assert.equal(observed.reads(),0);assert.equal(checked.size,0);
  }
});
test('final canonical responses hash exact artifact bytes and mark the corresponding HTML file',async()=>{
  for(const [pathname,file]of [['/','index.html'],['/research','research.html'],['/snapshots/revision/','snapshots/revision/index.html'],['/snapshots/revision/research','snapshots/revision/research.html']]){
    const observed=response(pathname),checked=new Set();const result=await verifyResponse(observed,base,manifest,checked);
    assert.equal(observed.reads(),1);assert.deepEqual([...checked],[file]);assert.equal(result.sha256,manifest.files[file].sha256);
  }
});
test('redirect and final-response chain keeps the full hash requirement',async()=>{
  const checked=new Set(),redirect=response('/research.html',{status:301,location:'/research'});
  await verifyResponse(redirect,base,manifest,checked);assert.equal(redirect.reads(),0);assert.equal(checked.size,0);
  await assert.rejects(verifyResponse(response('/research',{body:'<h1>Stale research</h1>'}),base,manifest,checked),/served bytes research\.html/);
  assert.equal(checked.size,0,'failed final bytes never qualify');
  await verifyResponse(response('/research'),base,manifest,checked);assert.deepEqual([...checked],['research.html']);
});
test('cross-origin, different route, missing Location and non-HTML redirects fail without a body read',async()=>{
  for(const [pathname,location,pattern]of [
    ['/research.html','https://other.example.test/research',/left the selected site/],
    ['/research.html','/writing',/changed artifact/],
    ['/research.html','/missing',/changed artifact/],
    ['/research.html',undefined,/missing canonical redirect Location/],
    ['/runtime/revision/space.js','/runtime/revision/space.js',/non-HTML artifact redirect/],
  ]){
    const observed=response(pathname,{status:302,location}),checked=new Set();
    await assert.rejects(verifyResponse(observed,base,manifest,checked),pattern);assert.equal(observed.reads(),0);assert.equal(checked.size,0);
  }
});
test('redirects cannot leave a selected site subdirectory',async()=>{
  const scoped=base+'/site',observed=response('/site/research.html',{status:301,location:'/research'});
  await assert.rejects(verifyResponse(observed,scoped,manifest,new Set()),/left the selected path/);assert.equal(observed.reads(),0);
  const valid=response('/site/research.html',{status:301,location:'research'});
  assert.equal((await verifyResponse(valid,scoped,manifest,new Set())).file,'research.html');assert.equal(valid.reads(),0);
});
test('known and unknown same-site HTTP failures are never ignored',async()=>{
  for(const status of [400,404,429,500,503])for(const pathname of ['/research','/unexpected-resource']){
    const observed=response(pathname,{status}),checked=new Set();
    await assert.rejects(verifyResponse(observed,base,manifest,checked),/HTTP failure/);assert.equal(observed.reads(),0);assert.equal(checked.size,0);
  }
  const unexpected=response('/research',{status:304});
  await assert.rejects(verifyResponse(unexpected,base,manifest,new Set()),/public response research\.html/);assert.equal(unexpected.reads(),0);
});
