'use strict';
// Source-only profiles. Hosted scenarios and accepted task snapshots have other owners.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const REGISTRY='tools/quality/test-profiles.json';
function safePath(value,{pattern=false}={}){
  assert.equal(typeof value,'string','path must be text');
  assert.ok(value.length>0&&!/[\0\r\n\\]/.test(value)&&!path.posix.isAbsolute(value),'unsafe path '+value);
  assert.ok(value.split('/').every(part=>part&&part!=='.'&&part!=='..'),'unsafe path '+value);
  if(!pattern)assert.ok(!value.includes('*'),'literal path required '+value);
  else assert.ok(!/[?\[\]{}]/.test(value),'unsupported path pattern '+value);
  return value;
}
function matches(file,pattern){
  safePath(file);safePath(pattern,{pattern:true});
  let expression='';
  for(let i=0;i<pattern.length;i++){
    const char=pattern[i];
    if(char==='*'){
      if(pattern[i+1]==='*'){expression+='.*';i++;}else expression+='[^/]*';
    }else expression+=char.replace(/[.+^$()|\\]/g,'\\$&');
  }
  return new RegExp('^'+expression+'$').test(file);
}
function actualModules(root){
  const modules=[];
  function visit(directory){
    for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true})){
      const relative=directory+'/'+entry.name;
      assert.ok(!entry.isSymbolicLink(),'symlink test inventory entry '+relative);
      if(entry.isDirectory())visit(relative);
      else if(entry.isFile()&&(entry.name.endsWith('.test.cjs')||/^test_.*\.py$/.test(entry.name)))modules.push(relative);
    }
  }
  visit('tests');return modules.sort();
}
function loadRegistry(root){return JSON.parse(fs.readFileSync(path.join(root,REGISTRY),'utf8'));}
function validateRegistry(root,registry){
  assert.equal(registry.schema_version,1,'unsupported test registry');
  assert.equal(registry.owner,'guides/SITE-CHECK-PROFILES.md','test profile owner must remain explicit');
  assert.ok(Array.isArray(registry.tests)&&registry.tests.length>0,'empty test inventory');
  const seen=new Set(),profiles=new Set(['pr-smoke','pr-targeted','staging','production','diagnostic','issue-policy']);
  for(const row of registry.tests){
    safePath(row.path);assert.ok(/^tests\/(?:[^/]+\/)*[^/]+(?:\.test\.cjs|\.py)$/.test(row.path),'unsupported test module '+row.path);
    assert.ok(!seen.has(row.path),'duplicate test module '+row.path);seen.add(row.path);
    assert.equal(fs.lstatSync(path.join(root,row.path)).isFile(),true,'test module is not a regular file '+row.path);
    assert.ok(!fs.lstatSync(path.join(root,row.path)).isSymbolicLink(),'symlink test module '+row.path);
    assert.equal(row.language,row.path.endsWith('.cjs')?'javascript':'python','test language mismatch '+row.path);
    assert.ok(['permanent','diagnostic','task-snapshot'].includes(row.lifecycle),'missing test lifecycle '+row.path);
    for(const key of ['purpose','owner','disposition','surviving_route'])assert.ok(typeof row[key]==='string'&&row[key].trim(),row.path+' missing '+key);
    safePath(row.owner);assert.ok(fs.statSync(path.join(root,row.owner)).isFile(),'missing test owner '+row.owner);
    assert.ok(Array.isArray(row.profiles)&&row.profiles.length&&new Set(row.profiles).size===row.profiles.length,'invalid test profiles '+row.path);
    for(const profile of row.profiles)assert.ok(profiles.has(profile),'unknown test profile '+profile);
    assert.ok(Array.isArray(row.inputs)&&row.inputs.includes(row.path),'test must target its own changed module '+row.path);
    for(const input of row.inputs)safePath(input,{pattern:true});
    if(/^tests\/test_issue\d+_acceptance\.py$/.test(row.path))assert.equal(row.lifecycle,'task-snapshot','numeric task modules are owning-policy-only');
    if(row.lifecycle==='task-snapshot')assert.deepEqual(row.profiles,['issue-policy'],'task snapshots cannot enter routine profiles');
    if(row.lifecycle==='diagnostic'){
      assert.ok(row.profiles.includes('diagnostic')&&row.profiles.includes('pr-targeted'),'diagnostic needs explicit replay/changed-helper route');
      assert.ok(!row.profiles.some(p=>['production','staging','pr-smoke'].includes(p)),'diagnostic cannot enter routine profiles');
    }
    if(row.lifecycle==='permanent')assert.ok(row.profiles.includes('production')&&row.profiles.includes('staging')&&row.profiles.includes('pr-targeted'),'permanent module needs current profile routes');
  }
  assert.deepEqual([...seen].sort(),actualModules(root),'test inventory must cover every actual module exactly; declare new modules or retire missing ones');
  const smoke=registry.tests.filter(r=>r.profiles.includes('pr-smoke')).map(r=>r.path).sort();
  for(const profile of ['pr','staging']){
    const baseline=registry.source_profiles?.[profile]?.baseline_files;
    assert.ok(Array.isArray(baseline)&&new Set(baseline).size===baseline.length,'missing/duplicate baseline inventory');
    assert.deepEqual([...baseline].sort(),smoke,'source profile baseline must equal declared smoke modules');
  }
  const local=fs.readFileSync(path.join(root,'tools/quality/local.cjs'),'utf8'),localTests=new Set();
  for(const call of local.matchAll(/tests\(\[([\s\S]*?)\]\)/g))for(const match of call[1].matchAll(/['"](tests\/[^'"]+\.test\.cjs)['"]/g))localTests.add(match[1]);
  assert.deepEqual([...localTests].sort(),smoke,'baseline delegation must match actual local.cjs test calls');
  assert.ok(Array.isArray(registry.source_profiles.pr.known_non_node_paths),'known non-Node routes must be declared');
  for(const key of ['known_non_node_paths','shared_inputs']){assert.ok(Array.isArray(registry.source_profiles.pr[key]),'missing impact category '+key);for(const input of registry.source_profiles.pr[key])safePath(input,{pattern:true});}
  return registry;
}
function git(root,args){return cp.execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:8*1024*1024});}
function readChangedPaths(root,base,head){
  for(const ref of [base,head])assert.match(ref||'',/^[0-9a-f]{40}$/,'target selection requires exact commit refs');
  assert.equal(git(root,['rev-parse',base+'^{commit}']).trim(),base,'base must be exact commit');
  assert.equal(git(root,['rev-parse',head+'^{commit}']).trim(),head,'head must be exact commit');
  assert.equal(git(root,['rev-parse','HEAD']).trim(),head,'target selection head must equal checkout');
  const raw=git(root,['diff','--no-ext-diff','--no-textconv','--name-only','-z',base,head,'--']);
  const files=raw.split('\0').filter(Boolean);for(const file of files)safePath(file);
  return [...new Set(files)].sort();
}
function select(root,profile,options={}){
  assert.ok(['pr','staging','production','diagnostic'].includes(profile),'unknown source profile '+profile);
  const registry=validateRegistry(root,options.registry||loadRegistry(root));
  const js=registry.tests.filter(r=>r.language==='javascript'),permanent=js.filter(r=>r.lifecycle==='permanent');
  const baselineFiles=['pr','staging'].includes(profile)?registry.source_profiles[profile].baseline_files:[];
  const baseline=new Set(baselineFiles),selected=new Set(),reasons={};
  const include=(row,reason)=>{if(!baseline.has(row.path)){selected.add(row.path);(reasons[row.path]??=[]).push(reason);}};
  let changedPaths=[],conservativeFallback=[];
  if(profile==='production'||profile==='staging')for(const row of permanent)include(row,'all permanent source modules in '+profile);
  else if(profile==='diagnostic')for(const row of js.filter(r=>r.lifecycle==='diagnostic'))include(row,'explicit diagnostic replay');
  else{
    changedPaths=options.changedPaths===undefined?readChangedPaths(root,options.base,options.head):options.changedPaths;
    assert.ok(Array.isArray(changedPaths),'changed paths must be a list');
    changedPaths=[...new Set(changedPaths.map(value=>safePath(value)))].sort();
    for(const changed of changedPaths){
      if(registry.source_profiles.pr.shared_inputs.some(input=>matches(changed,input)))for(const row of permanent)include(row,'shared source control '+changed);
      const affected=registry.tests.filter(r=>r.lifecycle!=='task-snapshot'&&r.inputs.some(input=>matches(changed,input)));
      const jsAffected=affected.filter(r=>r.language==='javascript');
      for(const row of jsAffected)include(row,'changed '+changed);
      const ownTask=registry.tests.some(r=>r.lifecycle==='task-snapshot'&&r.path===changed);
      const knownNonNode=affected.some(r=>r.language==='python')||ownTask||registry.source_profiles.pr.known_non_node_paths.some(input=>matches(changed,input));
      if(!affected.length&&!knownNonNode){conservativeFallback.push(changed);for(const row of permanent)include(row,'unknown changed source '+changed);}
    }
  }
  return {profile,registry:REGISTRY,modules:[...selected].sort(),baselineFiles:[...baselineFiles],baselineCommand:baselineFiles.length?registry.source_profiles[profile].baseline_command:null,changedPaths,conservativeFallback,reasons,pythonRoute:'python3 tools/run_repository_tests.py',taskSnapshots:'selected owning issue policy only'};
}
function accounting(tap,{modules=[],root=""}={}){
  const captions=[...tap.matchAll(/^# Subtest: (.+)\r?$/gm)].map(match=>match[1].trim());
  assert.ok(captions.length>0,"no actual named Node test cases");
  const wrappers=new Set(modules.flatMap(file=>[file,path.resolve(root,file)]));
  assert.ok(!captions.some(caption=>wrappers.has(caption)),"empty selected test module reported only a file wrapper");
  const keys=['tests','pass','fail','cancelled','skipped','todo'],values={};
  for(const key of keys){
    const found=[...tap.matchAll(new RegExp('^# '+key+' (\\d+)\\r?$','gm'))];assert.equal(found.length,1,'missing/duplicate Node '+key+' accounting');values[key]=Number(found[0][1]);
  }
  assert.ok(values.tests>0,'empty Node execution cannot report pass');
  assert.equal(values.pass,values.tests,'not all selected source tests passed');
  for(const key of ['fail','cancelled','skipped','todo'])assert.equal(values[key],0,'selected source tests '+key);
  return {total:values.tests,passed:values.pass,failed:values.fail,cancelled:values.cancelled,skipped:values.skipped,todo:values.todo};
}
function requireClean(root){
  const flags=git(root,['ls-files','-v','-z']).split('\0').filter(Boolean);
  assert.ok(!flags.some(entry=>entry[0]==='S'||/^[a-z]$/.test(entry[0])),'hidden index entries cannot bind source tests');
  assert.equal(git(root,['status','--porcelain','--untracked-files=all']).trim(),'','source tests require clean checkout');
}
function run(root,plan,options={}){
  assert.ok(Array.isArray(plan.modules),'missing selected modules');
  assert.equal(new Set(plan.modules).size,plan.modules.length,'duplicate selected source module');
  for(const file of plan.modules){safePath(file);assert.ok(/^tests\/(?:[^/]+\/)*[^/]+\.test\.cjs$/.test(file),'unsupported selected source module');const stat=fs.lstatSync(path.join(root,file));assert.ok(stat.isFile()&&!stat.isSymbolicLink(),'selected source module must be regular');}
  if(options.requireClean)requireClean(root);
  if(!plan.modules.length){assert.equal(plan.profile,'pr','empty routine profile');return {...plan,status:'not-applicable',pass:null,total:0,passed:0,reason:'No additional Node target; local source smoke and applicable Python/owning-issue checks retain their own evidence.'};}
  const environment={...process.env};delete environment.NODE_TEST_CONTEXT;
  const execute=options.execute||((argv)=>cp.spawnSync(process.execPath,argv,{cwd:root,env:environment,encoding:'utf8',maxBuffer:16*1024*1024,timeout:180000}));
  const argv=['--test','--test-reporter=tap',...plan.modules],started=Date.now(),result=execute(argv);
  const output=result.stdout||'',failures=output.split(/(?=^# Subtest:)/m).filter(block=>/^not ok /m.test(block)).join('\n').slice(0,8000);
  assert.equal(result.status,0,'selected source test process failed: '+(result.error?.message||result.stderr||failures||output.slice(-4000)||result.status));
  const counts=accounting(result.stdout||'',{modules:plan.modules,root});
  if(options.requireClean)requireClean(root);
  return {...plan,status:'passed',pass:true,...counts,elapsedMs:Date.now()-started,argv};
}
function argumentsFor(argv){
  const options={};for(let i=0;i<argv.length;i++){
    const flag=argv[i];assert.ok(['--profile','--base','--head','--require-clean','--plan'].includes(flag),'unknown source-test argument '+flag);
    const key=flag.slice(2).replace(/-([a-z])/g,(_,x)=>x.toUpperCase());assert.ok(!Object.hasOwn(options,key),'duplicate source-test argument '+flag);
    if(['--require-clean','--plan'].includes(flag))options[key]=true;else{assert.ok(argv[i+1]&&!argv[i+1].startsWith('--'),'missing argument '+flag);options[key]=argv[++i];}
  }
  assert.ok(options.profile,'--profile is required');return options;
}
function main(argv=process.argv.slice(2)){
  const root=path.resolve(__dirname,'../..'),options=argumentsFor(argv),plan=select(root,options.profile,options);
  if(options.requireClean)requireClean(root);
  const result=options.plan?{...plan,status:'planned',pass:null}:run(root,plan,options);console.log(JSON.stringify(result));return result;
}
if(require.main===module){try{main();}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={REGISTRY,safePath,matches,actualModules,loadRegistry,validateRegistry,readChangedPaths,select,accounting,run,argumentsFor,requireClean,main};
