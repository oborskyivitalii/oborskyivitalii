'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {aggregate,lighthouse,motion}=require('../tools/quality/validate.cjs');
const budgets=require('../tools/quality/budgets.json');
const identity={schema:1,sourceCommit:'a'.repeat(40),sourceTree:'b'.repeat(40),candidateCommit:'a'.repeat(40),artifactDigest:'c'.repeat(64)};
function scan(kind,detail){return {...identity,pass:true,kind,detail};}
function checks(mode,route){
  if(mode==='normal')return {positiveProbe:true,off:true,print:true,syntheticVisibility:true,keyboard:true,reverse:true,forward:'camera changed',archive:route==='writing'?true:'not applicable',zoom:true,axePasses:1};
  if(['no-js','no-canvas','no-raf','no-match-media','css-blocked'].includes(mode))return {fallback:true};
  if(mode==='reduced')return {reducedFreeze:true};
  if(['draw-fault','context-loss'].includes(mode))return {boundedFailure:true};
  return {positiveProbe:true,...(mode==='css-delayed'?{beforeCSSNoPaint:true}:{})};
}
function fixture(){
  const modes=['no-js','no-canvas','no-raf','no-match-media','blocked-storage','reduced','missing-hasOwn','css-delayed','css-blocked','draw-fault','context-loss'];
  const functional={...identity,pass:true,kind:'functional',environment:{platform:'linux'},engines:['chromium','firefox','webkit'],smoke:false,modes,browsers:['chromium','firefox','webkit'].map(engine=>({engine,version:'fixture',executable:'fixture'})),rows:[]};
  for(const engine of functional.engines)for(const route of budgets.routes)for(const theme of ['light','dark'])for(const [mode,width]of [['normal',1440],['normal',390],...modes.map(x=>[x,320])])functional.rows.push({engine,route,theme,mode,width,pass:true,errors:[],externalRequests:[],checks:checks(mode,route)});
  return {manifest:{...identity,sourceDirty:false},sizes:{pass:true,artifactDigest:identity.artifactDigest,rows:budgets.routes.map(route=>({route,raw:50000,svgNodes:100,totalGzipBytes:10000}))},jobs:{build:{result:'success'},static:{result:'success'},linux:{result:'success'}},reports:[scan('lint',{scannedFiles:30,tools:{eslint:'10',stylelint:'17',ruff:'0.16'}}),scan('security',{semgrep:{files:['docs/space.js'],rules:8,errors:0},bandit:{loc:100,findings:0},secrets:{trackedTextFiles:100}}),scan('advisories',{feedDate:'2026-10-03',npm:{},pythonDependencies:80,runtimeDependencies:'none'}),functional]};
}
test('complete source-bound PR evidence passes; missing and controlled failures fail closed',()=>{
  assert.equal(aggregate(fixture()).pass,true);
  const failures=[
    x=>x.reports.splice(2,1),
    x=>x.jobs.linux.result='cancelled',
    x=>x.sizes.rows[0].raw=100001,
    x=>x.reports[3].rows[0].errors.push('synthetic browser error'),
    x=>x.reports[3].engines.pop(),
    x=>delete x.reports[3].rows[0].checks,
    x=>x.reports[3].rows[0].checks.keyboard=false,
    x=>x.reports[3].rows.find(row=>row.mode==='css-delayed').checks.beforeCSSNoPaint=false,
    x=>x.reports[1].pass=false,
    x=>x.reports[1].detail.bandit.findings=1,
    x=>x.reports[1].artifactDigest='d'.repeat(64),
    x=>x.manifest.sourceDirty=true,
    x=>x.manifest.candidateCommit='e'.repeat(40)
  ];
  for(const mutate of failures){const x=fixture();mutate(x);assert.throws(()=>aggregate(x));}
  assert.throws(()=>aggregate({...fixture(),full:true}),/native|job|evidence/);
});
function lighthouseFixture(){return {rows:budgets.routes.flatMap(route=>['mobile','desktop'].flatMap(formFactor=>[1,2,3].map(run=>({route,formFactor,run,lighthouseVersion:'13.5',environment:{networkUserAgent:'controlled fixture'},configSettings:{formFactor,...structuredClone(budgets.lighthouse.profiles[formFactor]),throttlingMethod:'simulate'},categories:{performance:.91},metrics:{'largest-contentful-paint':{numericValue:run===1?10000:2000},'total-blocking-time':{numericValue:100},'cumulative-layout-shift':{numericValue:.05}}}))))};}
test('Lighthouse uses all three metric medians and rejects missing/mislabeled runs',()=>{
  const r=lighthouseFixture();
  assert.equal(lighthouse(r).medians.length,10);
  const missing=structuredClone(r);missing.rows.pop();assert.throws(()=>lighthouse(missing));
  const profile=structuredClone(r);profile.rows[0].configSettings.formFactor='desktop';assert.throws(()=>lighthouse(profile));
  const fail=structuredClone(r);fail.rows[1].metrics['largest-contentful-paint'].numericValue=10000;assert.throws(()=>lighthouse(fail));
});
function measurement(kind,startMs=0){const zero=['off','reduced'].includes(kind),elapsedMs=kind==='idle'?30000:1000;return {kind,elapsedMs,window:{startMs,endMs:startMs+elapsedMs},callbacks:zero?0:1,paints:zero?0:1,rawFrames:zero?[]:[{time:startMs+1,started:startMs+1,duration:10,painted:true}],paintRateHz:zero?0:1000/elapsedMs,paintIntervalsMs:{count:0,p50:null,p95:null,max:null},paintCallbackMs:{p50:zero?null:10,p95:zero?null:10,max:zero?null:10},callbackBusyPercent:zero?0:10/elapsedMs*100,state:'active'};}
function motionFixture(){return {samples:budgets.routes.flatMap(route=>[[1440,1],[390,1],[390,4]].map(([width,rate])=>({route,width,rate,positiveProbe:true,errors:[],measurements:['idle','scroll','off','reduced'].map(kind=>measurement(kind))}))),soak:{route:'writing',durationSeconds:300,chunks:Array.from({length:10},(_,i)=>measurement('idle',i*30000)),off:measurement('off',300000),errors:[],startHeapBytes:100,endHeapBytes:110}};}
test('motion requires positive paints, every profile, real raw samples and settled zero work',()=>{
  const r=motionFixture();
  assert.equal(motion(r),true);
  const mutate=[x=>x.samples[0].positiveProbe=false,x=>x.samples.pop(),x=>x.samples[0].measurements[2].callbacks=1,x=>x.samples[2].measurements[0].paintCallbackMs.p95=40,x=>x.samples[2].measurements[0].rawFrames[0].duration=1000,x=>x.samples[0].measurements[0].paintIntervalsMs.p95=1,x=>x.samples[0].measurements[0].paintRateHz=30,x=>x.soak.chunks.pop(),x=>x.soak.chunks[1]=structuredClone(x.soak.chunks[0])];
  for(const fn of mutate){const x=structuredClone(r);fn(x);assert.throws(()=>motion(x));}
});
test('paint intervals use actual painted callback starts and expose a cheap but uneven trace',()=>{
  const {summarize}=require('../tools/quality/motion.cjs');
  const frames=[{time:0,started:1,duration:1,painted:true},{time:16,started:17,duration:.1,painted:false},{time:33,started:34,duration:2,painted:true},{time:83,started:84,duration:3,painted:true},{time:116,started:117,duration:4,painted:true}];
  const row=summarize({frames,elapsed:1000,start:0,end:1000,longTasks:[]},'idle');
  assert.deepEqual(row.paintIntervalsMs,{count:3,p50:33,p95:50,max:50});assert.equal(row.paintRateHz,4);assert.equal(row.paintCallbackMs.p95,4);
  const none=summarize({frames:[],elapsed:1000,start:0,end:1000,longTasks:[]},'off');
  assert.equal(none.paintRateHz,0);assert.deepEqual(none.paintIntervalsMs,{count:0,p50:null,p95:null,max:null});
});
test('capture camera settling requires two real stable paints and rejects stalls/nonconvergence',async()=>{
  const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
  const source=fs.readFileSync(path.join(__dirname,'../tools/capture_site_review.cjs'),'utf8');
  const start=source.indexOf('async function settledCamera(page)'),end=source.indexOf('\nasync function visit(',start);
  assert.ok(start>=0&&end>start);
  function probe(mode){
    let time=0,paints=0;const poses=['start','moving-1','moving-2','end','end','end'];
    const context={Date:{now:()=>time},poseTrace:async()=>mode==='changing'?String(paints):poses[Math.min(paints,poses.length-1)],nextPaint:async(_,timeout)=>{assert.ok(timeout>0&&timeout<=1500);if(mode==='stalled')throw Error('Controlled no next paint');time+=Math.min(100,timeout);paints++;}};
    const fn=vm.runInNewContext(source.slice(start,end)+'\nsettledCamera',context);
    return {run:()=>fn({}),paints:()=>paints};
  }
  const stable=probe('stable');assert.equal(await stable.run(),'end');assert.equal(stable.paints(),5);
  await assert.rejects(probe('changing').run(),/did not settle/);await assert.rejects(probe('stalled').run(),/no next paint/);
});
function fullFixture(){
  const x=fixture();x.full=true;for(const job of ['native','performance','captures'])x.jobs[job]={result:'success'};
  for(const [platform,engines]of [['win32',['chromium','firefox']],['darwin',['webkit']]]){
    const f=structuredClone(x.reports[3]);Object.assign(f,{environment:{platform},smoke:true,modes:[],engines,browsers:engines.map(engine=>({engine,version:'controlled fixture',executable:'controlled fixture'})),rows:f.rows.filter(row=>engines.includes(row.engine)&&row.mode==='normal')});x.reports.push(f);
  }
  x.reports.push({...identity,pass:true,kind:'lighthouse',...lighthouseFixture()},{...identity,pass:true,kind:'motion',...motionFixture()});
  x.manifest.files=Object.fromEntries(budgets.routes.map(route=>[route+'.html',{sha256:'d'.repeat(64)}]));
  const capture={...identity,pass:true,kind:'captures',public_sources:Object.fromEntries(Object.entries(x.manifest.files).map(([file,v])=>['docs/'+file,v.sha256])),views:[],files:{}};
  for(const route of budgets.routes){capture.files[route+'-motion.webm']='e'.repeat(64);for(const theme of ['day','night'])for(const device of ['desktop','mobile']){capture.files[`${route}-${theme}-${device}.png`]='e'.repeat(64);capture.views.push({route,theme,device,overflow:false,ambient_changes_pixels:true});}}
  x.reports.push(capture);x.releaseEvidence={...identity,pass:true,kind:'release-evidence'};
  for(const key of ['independentReview','iosSafari','androidChrome'])x.releaseEvidence[key]={pass:true,reviewer:'controlled fixture; no actual reviewer/device',record:'controlled fixture',device:'controlled fixture',os:'controlled fixture',browser:'controlled fixture'};
  return x;
}
test('complete controlled full-release fixture passes, missing native/capture/device data and duplicate reports fail',()=>{
  assert.equal(aggregate(fullFixture()).pass,true);
  const cases=[x=>x.reports.splice(4,1),x=>x.reports.push(structuredClone(x.reports[6])),x=>x.reports.at(-1).views.pop(),x=>delete x.reports.at(-1).files['writing-motion.webm'],x=>x.reports.at(-1).files['writing-motion.webm']=true,x=>x.releaseEvidence.iosSafari.pass=false,x=>delete x.releaseEvidence.androidChrome.device];
  for(const mutate of cases){const x=fullFixture();mutate(x);assert.throws(()=>aggregate(x));}
});
