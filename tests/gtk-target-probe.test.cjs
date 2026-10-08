'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events'),http=require('node:http');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const probe=require('../tools/quality/gtk-target-probe.cjs');
const candidate = 'a'.repeat(40);
const base = {
  sourceCommit: candidate, candidateCommit: candidate, sourceTree: 'b'.repeat(40),
  sourceDirty: false, artifactDigest: 'e'.repeat(64),
  components: {engine: 'f'.repeat(64), variant: {id: 'base', contract: 1, fingerprint: '9'.repeat(64)}}
};
const manifest = {
  sourceCommit: candidate, candidateCommit: candidate, sourceTree: 'b'.repeat(40),
  sourceDirty: false, artifactDigest: 'c'.repeat(64),
  variant: {
    id: 'color', contract: 1, fingerprint: 'd'.repeat(64),
    baseEngine: base.components.engine, effects: ['travel']
  },
  derivation: {kind: 'authored-color-effects', baseArtifactDigest: base.artifactDigest}
};
test('fourteen one-factor cells retain the same six standards per port and two matching GTK init omissions',()=>{
  const gtk=probe.plan('gtk'),wpe=probe.plan('wpe');assert.equal(gtk.length,8);assert.equal(wpe.length,6);
  assert.deepEqual(gtk.slice(0,6).map(row=>({...row,port:undefined})),wpe.map(row=>({...row,port:undefined})));
  assert.deepEqual(gtk[6],{...gtk[1],id:'blank-constant-js-off-no-init',originalInit:false});
  assert.deepEqual(gtk[7],{...gtk[5],id:'color-state-js-off-no-init',originalInit:false});
  assert.ok(gtk.slice(0,6).every(row=>row.originalInit));assert.throws(()=>probe.plan('native'));
});
test('only exact clean normal Color source identity is admitted',()=>{
  assert.deepEqual(probe.identity(manifest,candidate,base),manifest);
  assert.throws(() => probe.identity({...manifest, variant: {
    ...manifest.variant, effects: ['ribbons', 'travel']
  }}, candidate, base));
  for(const change of [{sourceCommit:'e'.repeat(40)},{candidateCommit:'e'.repeat(40)},{sourceDirty:true},{sourceTree:'unknown'},{artifactDigest:'unknown'},{diagnostic:{label:'private'}},{derivation:undefined},{derivation:{parent:'unknown'}},{derivation:{...manifest.derivation,kind:'writing-diagnostic-intervention'}},{derivation:{...manifest.derivation,baseArtifactDigest:'0'.repeat(64)}},{derivation:{...manifest.derivation,diagnostic:'private'}},{fullGate:false},{variant:{...manifest.variant,id:'base'}},{variant:{...manifest.variant,diagnostic:{label:'private'}}},{variant:{...manifest.variant,baseEngine:'0'.repeat(64)}},{variant:{...manifest.variant,effects:['ribbons']}}])assert.throws(()=>probe.identity({...manifest,...change},candidate,base));
  for(const change of [{sourceCommit:'e'.repeat(40)},{sourceTree:'e'.repeat(40)},{sourceDirty:true},{derivation:manifest.derivation},{fullGate:false},{diagnostic:{label:'private'}},{components:{...base.components,variant:{...base.components.variant,contract:2}}},{components:{...base.components,variant:{...base.components.variant,fingerprint:'unknown'}}},{components:{...base.components,variant:{...base.components.variant,diagnostic:{label:'private'}}}},{variant:{...base.components.variant,fingerprint:'0'.repeat(64)}}])assert.throws(()=>probe.identity(manifest,candidate,{...base,...change}));
});
test('real clean normal artifact and Color producers satisfy lineage and retain every failed preflight without native cells',async()=>{
  const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'gtk-target-real-')),worktree=path.join(dir,'source'),input=path.join(dir,'input');
  const sha=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),priorCandidate=process.env.SITE_CANDIDATE_SHA,priorBaseUrl=process.env.SITE_TEST_BASE_URL;let registered=false;
  try{
    cp.execFileSync('git',['worktree','add','--detach','--quiet',worktree,sha],{cwd:root});registered=true;process.env.SITE_CANDIDATE_SHA=sha;delete process.env.SITE_TEST_BASE_URL;
    const artifact=require(path.join(worktree,'tools/quality/artifact.cjs')),normalBase=artifact.build(input);fs.copyFileSync(path.join(input,'artifact.json'),path.join(input,'base-artifact.json'));
    const normalColor=require(path.join(worktree,'tools/staging/color.cjs')).build(input);
    assert.equal(normalBase.sourceDirty,false);assert.equal(normalColor.sourceDirty,false);assert.equal(normalColor.sourceCommit,sha);assert.equal(normalColor.sourceTree,cp.execFileSync('git',['rev-parse','HEAD^{tree}'],{cwd:worktree,encoding:'utf8'}).trim());
    assert.deepEqual(normalColor.derivation,{kind:'authored-color-effects',baseArtifactDigest:normalBase.artifactDigest});assert.equal(artifact.verify(path.join(input,'public'),normalColor),true);
    const accepted=probe.identity(normalColor,sha,normalBase);assert.deepEqual(accepted.derivation,normalColor.derivation);assert.deepEqual(accepted.variant,normalColor.variant);assert.equal(accepted.artifactDigest,normalColor.artifactDigest);
    const artifactFile=path.join(input,'artifact.json'),artifactBytes=fs.readFileSync(artifactFile),pageFile=path.join(input,'public/index.html'),pageBytes=fs.readFileSync(pageFile);
    const cases=[['missing',()=>fs.rmSync(artifactFile)],['malformed',()=>fs.writeFileSync(artifactFile,'{')],['bytes',()=>fs.appendFileSync(pageFile,'\nchanged private bytes\n')],['identity',()=>fs.writeFileSync(artifactFile,JSON.stringify({...normalColor,derivation:{...normalColor.derivation,diagnostic:'private'}}))]];
    for(const [label,intervene]of cases){
      fs.writeFileSync(artifactFile,artifactBytes);fs.writeFileSync(pageFile,pageBytes);intervene();const output=path.join(dir,'results',label),stderrWrite=process.stderr.write;
      await assert.rejects(probe.main('gtk',input,output));assert.equal(process.stderr.write,stderrWrite);
      const report=JSON.parse(fs.readFileSync(path.join(output,'gtk-target.json')));assert.equal(report.phase,'failed');assert.equal(report.source,null);assert.equal(report.baseSource,null);assert.equal(report.collectionComplete,false);assert.equal(report.fullGate,false);assert.equal(report.performanceAcceptance,false);
      assert.equal(report.plan.length,8);assert.deepEqual(report.rows,[]);assert.equal(report.errors.length,1);assert.equal(report.errors[0].phase,'preflight');assert.equal(report.untrustedInput.trust,'untrusted-observation');assert.equal(fs.existsSync(path.join(output,'native-stderr.log')),true);
      if(label!=='missing')assert.deepEqual(fs.readFileSync(path.join(output,'untrusted-artifact.json')),fs.readFileSync(artifactFile));
      if(label==='identity')assert.equal(report.untrustedInput.manifests['artifact.json'].parsed.derivation.diagnostic,'private');
    }
  }finally{
    if(priorCandidate===undefined)delete process.env.SITE_CANDIDATE_SHA;else process.env.SITE_CANDIDATE_SHA=priorCandidate;
    if(priorBaseUrl===undefined)delete process.env.SITE_TEST_BASE_URL;else process.env.SITE_TEST_BASE_URL=priorBaseUrl;
    if(registered)cp.execFileSync('git',['worktree','remove','--force',worktree],{cwd:root});fs.rmSync(dir,{recursive:true,force:true});
  }
});
function fake({crash=false,timeout=false}={}){
  const calls=[],browsers=[];let clock=0;
  const functional={probe:function originalProbe(){},capability:function originalCapability(){},state:async page=>{calls.push('original-state');return page.evaluate(function originalState(){return {ready:false};});}};
  const pw={webkit:{executablePath:()=>'/pinned/webkit',async launch(options){
    calls.push(['launch',options]);const browser=new EventEmitter();browser.connected=true;browser.isConnected=()=>browser.connected;browser.version=()=> '26.6';
    browser.newContext=async options=>{
      calls.push(['context',options]);const context=new EventEmitter();
      context.addInitScript=async setup=>calls.push(['init',setup]);context.newPage=async()=>{
        calls.push('new-page');const page=new EventEmitter();page.isClosed=()=>false;
        page.goto=async(...args)=>calls.push(['goto',...args]);page.waitForTimeout=async ms=>{calls.push(['settle',ms]);clock+=ms;};
        page.evaluate=async fn=>{calls.push(['evaluate',fn]);if(crash){page.emit('crash');throw Error('native target closed');}return fn();};
        context.page=page;return page;
      };browser.context=context;return context;
    };
    browser.close=async()=>{calls.push('close-browser');browser.context?.page?.emit('close');browser.context?.emit('close');browser.connected=false;browser.emit('disconnected');};browsers.push(browser);return browser;
  }}};
  const native={start:async(...args)=>{calls.push(['display',...args]);clock+=1200;return {name:':9',backend:'Xvfb',elapsedMs:1200,stop(){calls.push('stop-display');}};},remaining:(started,budget,now)=>budget-(now-started)};
  const collect=async(stage,options)=>{calls.push(['native',stage,options]);return {stage};};
  const first=async(promise,ms)=>{calls.push(['collector',ms]);if(timeout){await promise;const error=Error('diagnostic collection expired');error.name='CollectorTimeout';throw error;}return promise;};
  return {calls,browsers,deps:{pw,native,functional,collect,first,url:'http://127.0.0.1:9',source:probe.identity(manifest,candidate,base),now:()=>clock,stderr:()=>({bytes:0,droppedBytes:0})}};
}
test('every cell owns a fresh browser and its chosen first evaluation follows exact original context/init/load/settle',async()=>{
  const h=fake();let count=0;
  for(const cell of [...probe.plan('gtk'),...probe.plan('wpe')]){
    const start=h.calls.length,row=await probe.cellTrial(cell,h.deps),calls=h.calls.slice(start);count++;
    assert.equal(row.evidenceValid,true);assert.equal(row.success,true);assert.deepEqual(row.source,manifest);
    assert.deepEqual(calls.find(c=>Array.isArray(c)&&c[0]==='context')[1],{viewport:{width:320,height:844},colorScheme:'light',javaScriptEnabled:cell.javaScriptEnabled,reducedMotion:'no-preference'});
    const init=calls.find(c=>Array.isArray(c)&&c[0]==='init');assert.equal(Boolean(init),cell.originalInit);
    if(init)assert.equal(init[1].content,probe.originalInit(h.deps.functional,cell));
    const go=calls.find(c=>Array.isArray(c)&&c[0]==='goto');assert.equal(go[1],'http://127.0.0.1:9'+(cell.document==='blank'?'/__gtk_target_blank.html':'/index.html'));assert.deepEqual(go[2],{waitUntil:'load',timeout:30000});
    const settle=calls.findIndex(c=>Array.isArray(c)&&c[0]==='settle'),evaluate=calls.findIndex(c=>Array.isArray(c)&&c[0]==='evaluate');
    assert.deepEqual(calls[settle],['settle',180]);assert.ok(evaluate>settle);assert.equal(calls.filter(c=>Array.isArray(c)&&c[0]==='evaluate').length,1);
    assert.equal(calls.filter(c=>c==='original-state').length,cell.evaluation==='original-state'?1:0);
    assert.ok(calls.find(c=>Array.isArray(c)&&c[0]==='collector'&&c[1]===60000));assert.equal(calls.filter(c=>c==='close-browser').length,1);
    const launch=calls.find(c=>Array.isArray(c)&&c[0]==='launch')[1];assert.equal(launch.headless,cell.port==='wpe');assert.equal(launch.timeout,cell.port==='gtk'?28800:30000);
    assert.equal(calls.filter(c=>Array.isArray(c)&&c[0]==='display').length,cell.port==='gtk'?1:0);
  }
  assert.equal(count,14);assert.equal(h.browsers.length,14);assert.equal(new Set(h.browsers).size,14);
});
test('actual native page crash remains a valid failed observation before cleanup and is never retried',async()=>{
  const h=fake({crash:true}),row=await probe.cellTrial(probe.plan('gtk')[5],h.deps);
  assert.equal(row.success,false);assert.equal(row.evidenceValid,true);assert.match(row.error.message,/native target closed/);
  assert.equal(row.lifecycle.events[0].kind,'page-crash');assert.equal(row.lifecycle.events[0].stage,'first-evaluation');
  assert.equal(row.lifecycle.observation.pageClosed,false);assert.equal(row.lifecycle.observation.browserConnected,true);
  assert.ok(row.lifecycle.events.slice(1).every(event=>event.stage==='teardown'));assert.equal(row.nativeAfterFailure.stage,'after-failure');
  assert.equal(h.browsers.length,1);assert.equal(h.calls.filter(c=>Array.isArray(c)&&c[0]==='evaluate').length,1);assert.equal(h.calls.filter(c=>c==='close-browser').length,1);
  assert.equal(h.browsers[0].listenerCount('disconnected'),0);assert.equal(h.browsers[0].context.page.listenerCount('crash'),0);
});
test('held native collection and report writes cannot delay the original first-evaluation trigger',async()=>{
  const h=fake();let releaseNative,evaluated=false,retainedAfterLaunch=false;
  h.deps.collect=async stage=>stage==='after-load-before-first-evaluation'?new Promise(resolve=>releaseNative=()=>resolve({stage})):({stage});
  h.deps.first=async(operation,ms)=>{assert.equal(ms,60000);assert.equal(h.calls.filter(call=>Array.isArray(call)&&call[0]==='evaluate').length,1);evaluated=true;releaseNative();return operation;};
  h.deps.retain=row=>{if(row.firstEvaluationStartedAt){assert.equal(evaluated,true);retainedAfterLaunch=true;}};
  const row=await probe.cellTrial(probe.plan('gtk')[5],h.deps);
  assert.equal(row.success,true);assert.equal(retainedAfterLaunch,true);assert.equal(row.nativeBeforeEvaluation.stage,'after-load-before-first-evaluation');
});
test('diagnostic collection timeout is labeled before teardown and does not fabricate a spontaneous crash',async()=>{
  const h=fake({timeout:true}),row=await probe.cellTrial(probe.plan('wpe')[1],h.deps);
  assert.equal(row.error.name,'CollectorTimeout');assert.equal(row.lifecycle.observation.stage,'collector-timeout');
  assert.ok(row.lifecycle.events.every(event=>event.stage==='teardown'));assert.ok(row.lifecycle.events.every(event=>event.kind!=='page-crash'));
  assert.equal(row.bounds.startupMs,30000);assert.equal(row.bounds.gotoMs,30000);assert.equal(row.bounds.diagnosticFirstEvaluationMs,60000);
});
test('the Node-only deadline handles a never-settling first evaluation and cancels its observer timer',async()=>{
  let timer,scheduled,cancelled;const pending=probe.bounded(new Promise(()=>{}),60000,{schedule(fn,ms){scheduled=ms;timer=fn;return 17;},cancel(id){cancelled=id;}});
  timer();await assert.rejects(pending,error=>error.name==='CollectorTimeout'&&/60000ms/.test(error.message));assert.equal(scheduled,60000);assert.equal(cancelled,17);
  assert.equal(await probe.bounded(Promise.resolve(1),60000),1);
  const cleanup=probe.bounded(new Promise(()=>{}),30000,{phase:'cleanup',schedule(fn,ms){scheduled=ms;timer=fn;return 18;},cancel(id){cancelled=id;}});
  timer();await assert.rejects(cleanup,error=>error.name==='CleanupTimeout'&&/30000ms/.test(error.message));assert.equal(scheduled,30000);assert.equal(cancelled,18);
});
test('a diagnostic cleanup cap records incomplete cleanup and releases listeners without fabricating a crash',async()=>{
  const h=fake();h.deps.close=async()=>{const error=Error('diagnostic cleanup expired');error.name='CleanupTimeout';throw error;};
  const row=await probe.cellTrial(probe.plan('gtk')[0],h.deps);
  assert.equal(row.success,true);assert.equal(row.cleanupError.name,'CleanupTimeout');assert.equal(row.bounds.diagnosticCleanupMs,30000);
  assert.ok(row.lifecycle.events.every(event=>event.stage==='teardown'));assert.ok(row.lifecycle.events.every(event=>event.kind!=='page-crash'));
  assert.equal(h.browsers[0].listenerCount('disconnected'),0);assert.equal(h.browsers[0].context.page.listenerCount('pageerror'),0);
});
test('bounded native text keeps byte/drop counts and missing commands preserve explicit unavailable errors',async()=>{
  const sink=probe.textCollector(4);sink.add(Buffer.from('abcdef'));sink.add(Buffer.from('xy'));assert.deepEqual(sink.snapshot(),{text:'abcd',bytes:8,retainedBytes:4,droppedBytes:4,limitBytes:4});
  const result=await probe.command('missing-observer',[],{launch(){throw Object.assign(Error('unavailable'),{code:'ENOENT'});}});assert.equal(result.error.code,'ENOENT');assert.equal(result.stdout.bytes,0);
});
test('blank and exact Color bytes share one private loopback origin without changing source files',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gtk-target-')),html='<h1>Exact normal Color bytes</h1>\n';fs.writeFileSync(path.join(dir,'index.html'),html);
  const {server,url}=await probe.serve(dir),get=route=>new Promise((resolve,reject)=>http.get(url+route,response=>{const chunks=[];response.on('data',data=>chunks.push(data));response.on('end',()=>resolve(Buffer.concat(chunks).toString()));}).on('error',reject));
  try{assert.equal(await get('/__gtk_target_blank.html'),probe.BLANK);assert.equal(await get('/index.html'),html);assert.equal(fs.readFileSync(path.join(dir,'index.html'),'utf8'),html);assert.deepEqual(fs.readdirSync(dir),['index.html']);}
  finally{await new Promise(resolve=>server.close(resolve));fs.rmSync(dir,{recursive:true,force:true});}
});
