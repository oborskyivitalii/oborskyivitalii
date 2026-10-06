'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {authoredRuntimeSources,authoredRuntime}=require('../tools/quality/scanners.cjs');
const root=path.resolve(__dirname,'..'),directory='review/site-scroll-sync-20261004/';
test('offline security selects all tracked and present authored modules, excluding diagnostic harnesses',()=>{
  const diagnostics=['check-content-flight.cjs','check-ribbon-fill.cjs','check-ribbon-material.cjs'].map(file=>directory+file);
  assert.deepEqual(authoredRuntime([],()=>true),[],'legacy source has no offline runtime');
  assert.deepEqual(authoredRuntime(diagnostics,()=>true),[],'diagnostic harnesses are not authored browser source');
  assert.deepEqual(authoredRuntime([...authoredRuntimeSources,...diagnostics],()=>true),authoredRuntimeSources);
  assert.deepEqual(authoredRuntime(authoredRuntimeSources,file=>file!==authoredRuntimeSources[0]),authoredRuntimeSources.slice(1));
  assert.deepEqual(authoredRuntime(authoredRuntimeSources.slice(1),()=>true),authoredRuntimeSources.slice(1),'untracked sources are not admitted');
});
test('the authored selection matches every offline dependency of the active exporter and Color builder',()=>{
  const tracked=cp.execFileSync('git',['ls-files',directory],{cwd:root,encoding:'utf8'}).trim().split('\n');
  const exporter=fs.existsSync(path.join(root,directory+'export.cjs'));
  const authoredPresent=authoredRuntimeSources.some(file=>fs.existsSync(path.join(root,file))),authoredTracked=authoredRuntimeSources.some(file=>tracked.includes(file));
  if(!exporter&&!authoredPresent&&!authoredTracked){
    assert.deepEqual(authoredRuntime(tracked),[],'legacy source has no active authored offline runtime');
    return;
  }
  assert.ok(exporter,'an authored runtime source requires its active exporter');
  const pending=['tools/staging/color.cjs',directory+'export.cjs'],visited=new Set(),imported=new Set();
  while(pending.length){
    const file=pending.pop();if(visited.has(file))continue;visited.add(file);
    const source=fs.readFileSync(path.join(root,file),'utf8');
    for(const match of source.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)){
      const dependency=path.relative(root,path.resolve(root,path.dirname(file),match[1])).split(path.sep).join('/');
      if(dependency.startsWith(directory)&&dependency.endsWith('.cjs')){imported.add(dependency);pending.push(dependency);}
    }
  }
  assert.deepEqual([...imported].sort(),[...authoredRuntimeSources].sort(),'new authored dependencies must extend scanner coverage');
  assert.deepEqual(authoredRuntime(tracked),authoredRuntimeSources,'every active authored module is tracked and present');
  assert.deepEqual(authoredRuntime([...imported]),authoredRuntimeSources,'every active authored module exists');
});
test('both browser runtime security rules cover all three authored modules without directory-wide harness policy',()=>{
  const source=fs.readFileSync(path.join(root,'tools/quality/security-rules.yml'),'utf8');
  for(const id of ['browser-html-injection','browser-code-execution']){
    const rule=source.split('  - id: '+id+'\n')[1].split('\n  - id: ')[0];
    for(const file of authoredRuntimeSources)assert.ok(rule.includes(file),id+' missing '+file);
    for(const directoryScope of ['docs/**','site/engine/**','site/scenes/**','site/integrations/**'])assert.ok(rule.includes(directoryScope),id+' lost public source scope');
    assert.ok(!rule.includes(directory+'*.cjs'),'diagnostic files do not define browser runtime policy');
  }
});
