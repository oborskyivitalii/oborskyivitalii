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
function banditFixture(){
  const os=require('node:os'),triage=require('../tools/quality/bandit-triage.cjs'),directory=fs.mkdtempSync(path.join(os.tmpdir(),'bandit-review-')),file='tools/reviewed.py',source='import subprocess\n';
  fs.mkdirSync(path.join(directory,'tools'));fs.mkdirSync(path.join(directory,'.github'));
  fs.writeFileSync(path.join(directory,file),source);fs.writeFileSync(path.join(directory,'.github/REPOSITORY-INTELLIGENCE.md'),'Canonical tooling owner\n');
  const row={path:file,rule:'B404',line:1,test_name:'blacklist',severity:'LOW',confidence:'HIGH',source_sha256:triage.digest(source),line_sha256:triage.digest(source.trimEnd()),owner:'.github/REPOSITORY-INTELLIGENCE.md',issue:35,reviewBy:'2026-11-03',rationale:'Reviewed shell-free developer tooling import; exact argv and installed executable trust remain owned by this source.'};
  const policy={schema_version:1,repository:'oborskyivitalii/oborskyivitalii',issue:35,reviewBy:row.reviewBy,entries:[row]},totals={loc:1};
  for(const field of ['SEVERITY','CONFIDENCE'])for(const level of ['LOW','MEDIUM','HIGH','UNDEFINED'])totals[field+'.'+level]=0;
  totals['SEVERITY.LOW']=1;totals['CONFIDENCE.HIGH']=1;
  const report={errors:[],metrics:{_totals:totals,[file]:{loc:1}},results:[{filename:file,test_id:row.rule,line_number:row.line,test_name:row.test_name,issue_severity:row.severity,issue_confidence:row.confidence,issue_text:'Raw import finding remains visible'}]},options={expectedFiles:[file],now:new Date('2026-10-07T12:00:00Z')};
  return {directory,file,source,policy,report,options,triage};
}
test('Bandit admission retains raw findings and admits only exact reviewed source, rule, line and coverage',()=>{
  const f=banditFixture();try{
    const before=structuredClone(f.report),result=f.triage.review(f.directory,f.report,f.policy,f.options);
    assert.equal(result.pass,true);assert.equal(result.rawFindings,1);assert.equal(result.reviewedFindings,1);assert.equal(result.untriagedFindings,0);
    assert.deepEqual(f.report,before,'triage never removes or changes scanner findings');assert.deepEqual(result.trackedPythonFiles,[f.file]);assert.match(result.policySha256,/^[a-f0-9]{64}$/);
    const invalidPolicy=[p=>p.entries.push(structuredClone(p.entries[0])),p=>p.entries[0].rule='B603',p=>p.entries[0].line=2,p=>p.entries[0].owner='AGENTS.md',p=>p.entries[0].rationale='',p=>p.entries[0].severity='HIGH',p=>p.entries[0].issue=13];
    for(const mutate of invalidPolicy){const policy=structuredClone(f.policy);mutate(policy);assert.throws(()=>f.triage.review(f.directory,f.report,policy,f.options));}
  }finally{fs.rmSync(f.directory,{recursive:true,force:true});}
});
test('Bandit admission fails new, missing, duplicated or changed scanner findings without lowering severity',()=>{
  const f=banditFixture();try{
    for(const mutate of [r=>r.results.push({...r.results[0],test_id:'B603'}),r=>r.results=[],r=>r.results.push(structuredClone(r.results[0])),r=>r.results[0].issue_severity='HIGH',r=>r.results[0].issue_confidence='MEDIUM',r=>r.results[0].test_name='another_plugin',r=>r.metrics._totals['SEVERITY.LOW']=0]){
      const report=structuredClone(f.report);mutate(report);assert.throws(()=>f.triage.review(f.directory,report,f.policy,f.options));
    }
  }finally{fs.rmSync(f.directory,{recursive:true,force:true});}
});
test('Bandit admission fails expired reviews, changed source bytes, shifted lines and symlink substitution',()=>{
  const f=banditFixture();try{
    assert.throws(()=>f.triage.review(f.directory,f.report,f.policy,{...f.options,now:new Date('2026-11-04T00:00:00Z')}),/expired/);
    const badDate=structuredClone(f.policy);badDate.reviewBy='2026-02-30';badDate.entries[0].reviewBy=badDate.reviewBy;assert.throws(()=>f.triage.review(f.directory,f.report,badDate,f.options),/deadline/);
    fs.appendFileSync(path.join(f.directory,f.file),'# A change outside the finding also requires review.\n');assert.throws(()=>f.triage.review(f.directory,f.report,f.policy,f.options),/source changed/);
    const altered='import subprocess; unsafe_call()\n';fs.writeFileSync(path.join(f.directory,f.file),altered);
    const partial=structuredClone(f.policy);partial.entries[0].source_sha256=f.triage.digest(altered);assert.throws(()=>f.triage.review(f.directory,f.report,partial,f.options),/line changed/);
    fs.unlinkSync(path.join(f.directory,f.file));fs.symlinkSync('missing.py',path.join(f.directory,f.file));assert.throws(()=>f.triage.review(f.directory,f.report,f.policy,f.options),/symlink/);
  }finally{fs.rmSync(f.directory,{recursive:true,force:true});}
});
test('Bandit admission keeps scanner errors, empty or missing tracked coverage and malformed reports blocking',()=>{
  const f=banditFixture();try{
    for(const mutate of [r=>r.errors.push({filename:f.file,reason:'parse error'}),r=>delete r.errors,r=>delete r.results,r=>delete r.metrics,r=>r.metrics._totals.loc=0,r=>delete r.metrics[f.file],r=>r.metrics[f.file].loc=-1]){
      const report=structuredClone(f.report);mutate(report);assert.throws(()=>f.triage.review(f.directory,report,f.policy,f.options));
    }
    assert.throws(()=>f.triage.review(f.directory,f.report,f.policy,{...f.options,expectedFiles:[]}),/coverage inventory/);
    assert.throws(()=>f.triage.review(f.directory,f.report,f.policy,{...f.options,expectedFiles:[f.file,f.file]}),/duplicate/);
    const escape=structuredClone(f.report);escape.results[0].filename='../reviewed.py';assert.throws(()=>f.triage.review(f.directory,escape,f.policy,f.options),/unsafe/);
  }finally{fs.rmSync(f.directory,{recursive:true,force:true});}
});

test('only actually verified RI/coupling checksum fields may bypass literal secret baselines',()=>{
  const {verifiedChecksumIds,verifiedChecksumFinding}=require('../tools/quality/scanners.cjs');
  const hash='abcdef0123456789'.repeat(4),ids=verifiedChecksumIds([hash]);
  const finding={type:'Hex High Entropy String',hashed_secret:[...ids][0]},nav='.github/repository-intelligence/agent-context.json',ci='.github/ri-ci-map.json';
  const proved=new Map([[nav,ids],[ci,ids]]);
  assert.equal(verifiedChecksumFinding(nav,finding,proved),true);assert.equal(verifiedChecksumFinding(ci,finding,proved),true);
  assert.equal(verifiedChecksumFinding('unverified-metadata.json',finding,proved),false);
  assert.equal(verifiedChecksumFinding(ci,{...finding,type:'Secret Keyword'},proved),false);
  assert.equal(verifiedChecksumFinding(ci,{...finding,hashed_secret:'a'.repeat(40)},proved),false);
  assert.equal(verifiedChecksumFinding(ci,finding,new Map()),false);
  assert.throws(()=>verifiedChecksumIds(['private-value']),/invalid verified public checksum/);
});
