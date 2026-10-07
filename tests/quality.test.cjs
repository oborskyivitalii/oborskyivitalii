'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {aggregate,lighthouse,motion}=require('../tools/quality/validate.cjs');
const budgets=require('../tools/quality/budgets.json');
const variant={id:'base',contract:1,fingerprint:'d'.repeat(64)};
const identity={variant,schema:1,sourceCommit:'a'.repeat(40),sourceTree:'b'.repeat(40),candidateCommit:'a'.repeat(40),artifactDigest:'c'.repeat(64)};
function scan(kind,detail){return {...identity,pass:true,kind,detail};}
function checks(mode,route){
  const contract=require('../tools/quality/scroll-browser.cjs'),syncFixture=label=>({label,end:1000,start:'opening',samples:[.9,.95,.99,1].map(fraction=>({fraction,y:fraction*1000,camera:'camera-'+fraction}))});
  if(mode==='normal')return {positiveProbe:true,off:true,print:true,syntheticVisibility:true,keyboard:true,reverse:true,forward:'camera changed',archive:route==='writing'?true:'not applicable',zoom:true,axePasses:1,scrollSync:{pass:true,fixtures:contract.fixtures.map(syncFixture),filtered:route==='writing'?[syncFixture('single-record')]:[],waypoint:{id:'semantic-stop',y:100,distance:0,actual:{position:[0,0,0],target:[0,0,-1]},expected:{position:[0,0,0],target:[0,0,-1]}},checks:Object.fromEntries(contract.checks.map(k=>[k,route!=='writing'&&k==='filtered'?'not applicable':true]))}};
  if(['no-js','no-canvas','no-raf','no-match-media','css-blocked'].includes(mode))return {fallback:true};
  if(mode==='reduced')return {reducedFreeze:true};
  if(['draw-fault','context-loss'].includes(mode))return {boundedFailure:true};
  return {positiveProbe:true,...(mode==='css-delayed'?{beforeCSSNoPaint:true}:{})};
}
function fixture(){
  const modes=['no-js','no-canvas','no-raf','no-match-media','blocked-storage','reduced','missing-hasOwn','css-delayed','css-blocked','draw-fault','context-loss'];
  const functional={...identity,pass:true,kind:'functional',environment:{platform:'linux'},engines:['chromium','firefox','webkit'],smoke:false,modes,browsers:['chromium','firefox','webkit'].map(engine=>({engine,version:'fixture',executable:'fixture'})),rows:[]};
  for(const engine of functional.engines)for(const route of budgets.routes)for(const theme of ['light','dark'])for(const [mode,width]of [['normal',1440],['normal',390],...modes.map(x=>[x,320])])functional.rows.push({engine,route,theme,mode,width,pass:true,errors:[],externalRequests:[],checks:checks(mode,route)});
  functional.navigation=functional.engines.flatMap(engine=>require('../tools/quality/navigation.cjs').scenarios(engine).map(s=>({...s,pass:true,errors:[],scrollArrivals:['research','writing','talks','credits'].map(route=>({route,end:1000,samples:[.9,.95,.99,1].map(fraction=>({fraction,y:fraction*1000,camera:'arrival-'+fraction}))})),checks:Object.fromEntries(require('../tools/quality/navigation.cjs').checks.map(k=>[k,true]))})));
  const analytics=require('../tools/quality/analytics-browser.cjs');
  functional.analytics=functional.engines.flatMap(engine=>analytics.cases(engine).map(s=>({...s,model:analytics.model,pass:true,errors:[],externalRequests:[],checks:Object.fromEntries(analytics.checks.map(key=>[key,true])),readyWhileSDKPending:s.mode==='delayed'?true:'not applicable',vendorRequests:['staging','offline'].includes(s.mode)?[]:Array(2).fill('https://static.cloudflareinsights.com/beacon.min.js')})));
  return {manifest:{...identity,components:{variant},sourceDirty:false},sizes:{pass:true,artifactDigest:identity.artifactDigest,rows:budgets.routes.map(route=>({route,raw:50000,svgNodes:100,totalGzipBytes:10000}))},jobs:{build:{result:'success'},static:{result:'success'},linux:{result:'success'}},reports:[scan('lint',{scannedFiles:30,tools:{eslint:'10',stylelint:'17',ruff:'0.16'}}),scan('security',{semgrep:{files:['docs/space.js'],rules:8,errors:0},bandit:{loc:100,findings:0},secrets:{trackedTextFiles:100}}),scan('advisories',{feedDate:'2026-10-03',npm:{},pythonDependencies:80,runtimeDependencies:'none'}),functional]};
}
test('complete source-bound PR evidence passes; missing and controlled failures fail closed',()=>{
  assert.equal(aggregate(fixture()).pass,true);
  const failures=[
    x=>x.reports.splice(2,1),
    x=>delete x.reports[3].analytics,
    x=>x.reports[3].analytics.pop(),
    x=>x.reports[3].analytics[0].vendorRequests.push('https://unexpected.example.com/'),
    x=>x.reports[3].analytics.find(row=>row.mode==='offline').vendorRequests.push('https://static.cloudflareinsights.com/beacon.min.js'),
    x=>delete x.reports[3].analytics[0].checks.oneVendorPerDocument,
    x=>delete x.reports[3].analytics.find(row=>row.mode==='delayed').readyWhileSDKPending,
    x=>x.reports[3].navigation.pop(),
    x=>x.reports[3].navigation[0].checks.persistentShell=false,
    x=>delete x.reports[3].navigation[0].checks.flightTiming,
    x=>delete x.reports[3].navigation[0].checks.writingFirstScroll,
    x=>delete x.reports[3].navigation[0].checks.fullScrollArrival,
    x=>x.reports[3].navigation[0].scrollArrivals.pop(),
    x=>delete x.reports[3].navigation[0].checks.snapshotPin,
    x=>delete x.reports[3].navigation[0].checks.offlineEntries,
    x=>x.jobs.linux.result='cancelled',
    x=>x.sizes.rows[0].raw=100001,
    x=>x.reports[3].rows[0].errors.push('synthetic browser error'),
    x=>x.reports[3].engines.pop(),
    x=>delete x.reports[3].rows[0].checks,
    x=>delete x.reports[3].rows[0].checks.scrollSync,
    x=>x.reports[3].rows[0].checks.scrollSync.fixtures.pop(),
    x=>delete x.reports[3].rows[0].checks.scrollSync.checks.contentGrowth,
    x=>delete x.reports[3].rows[0].checks.scrollSync.waypoint,
    x=>x.reports[3].rows[0].checks.scrollSync.waypoint.actual.position[0]=1,
    x=>x.reports[3].rows[0].checks.scrollSync.fixtures[0].samples[3].camera=x.reports[3].rows[0].checks.scrollSync.fixtures[0].samples[2].camera,
    x=>x.reports[3].rows[0].checks.scrollSync.fixtures[0].samples[3].y=990,
    x=>x.reports[3].rows.find(row=>row.route==='writing'&&row.mode==='normal').checks.scrollSync.filtered.pop(),
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
  const workflow=require('../tools/quality/workflow-artifacts.cjs'),fs=require('node:fs'),path=require('node:path');
  const root=path.resolve(__dirname,'..');assert.equal(workflow.check(root).unique,true);
  const sources=Object.fromEntries(['site-checks','site-release-checks'].map(id=>[id,fs.readFileSync(path.join(root,'.github/workflows/'+id+'.yml'),'utf8')]));
  sources['site-checks']=sources['site-checks'].replace('site-gate-basic-','site-gate-full-staging-');assert.throws(()=>workflow.check(root,sources),/collision/);
  const {matchesRoute}=require('../tools/quality/fallback-url.cjs'),requested='https://owned.invalid/project/research.html?topic=systems#main';
  for(const pathname of ['/project/research.html','/project/research'])assert.equal(matchesRoute('https://owned.invalid'+pathname+'?topic=systems#main',requested),true);
  for(const bad of ['https://other.invalid/project/research?topic=systems#main','https://owned.invalid/research?topic=systems#main','https://owned.invalid/project/writing?topic=systems#main','https://owned.invalid/project/research?topic=delivery#main','https://owned.invalid/project/research?topic=systems#other'])assert.equal(matchesRoute(bad,requested),false);
  const geometry=require('../tools/quality/geometry.cjs'),empty={objects:[],faces:[],lines:[]};
  assert.throws(()=>geometry.check({...empty,objects:[{points:[[0,NaN,0]]}]},true),/nonfinite/);
  assert.throws(()=>geometry.check({...empty,lines:[{a:[0,0,0],b:[0,Infinity,0]}]},true),/nonfinite/);
  assert.throws(()=>geometry.check({...empty,objects:Array(261).fill({points:[]})},true),/geometry objects/);
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
function flightMeasurement(slow=false){
  const data={schema:2,start:0,end:2100,elapsed:2100,frames:Array.from({length:12},(_,i)=>({time:i*100,started:i*100+10,duration:slow&&i===11?900:10,painted:true})),longTasks:[],events:[{kind:'layout',time:3,start:2,duration:1},{kind:'navigation-start',time:0},{kind:'navigation-ready',time:2100}]};
  return {...require('../tools/quality/motion.cjs').summarize(data,'flight'),state:'active'};
}
function motionFixture(){return {variant:{id:'base',contract:1,fingerprint:'d'.repeat(64)},samples:budgets.routes.flatMap(route=>[[1440,1],[390,1],[390,4]].map(([width,rate])=>({route,width,rate,positiveProbe:true,errors:[],measurements:['idle','scroll','off','reduced'].map(kind=>measurement(kind))}))),journeys:[[1440,1],[390,1],[390,4]].map(([width,rate])=>({width,rate,cycles:40,warmedRoutes:[...budgets.routes.slice(1),budgets.routes[0]],errors:[],before:{nodes:100,jsEventListeners:20},after:{nodes:100,jsEventListeners:20},rows:['research','writing','talks','index','talks','writing','research','index'].map(to=>({to,...flightMeasurement()}))})),soak:{route:'writing',durationSeconds:300,chunks:Array.from({length:10},(_,i)=>measurement('idle',i*30000)),off:measurement('off',300000),errors:[],startHeapBytes:100,endHeapBytes:110}};}
test('motion requires positive paints, every profile, real raw samples and settled zero work',()=>{
  const r=motionFixture();
  assert.equal(motion(r),true);
  const huge=structuredClone(r);huge.journeys[0].rows[0]={to:'research',...flightMeasurement(true)};assert.throws(()=>motion(huge),/slow transition/);
  for(const mutate of [x=>delete x.variant,x=>delete x.journeys[0].rows[0].readyMs,x=>delete x.journeys[0].rows[0].rawPreparation]){const copy=structuredClone(r);mutate(copy);assert.throws(()=>motion(copy));}
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
  const original=structuredClone(x.reports[3]);
  for(const [platform,engines,smoke]of [['linux',['chromium','firefox'],false],['win32',['chromium','firefox'],true],['darwin',['webkit'],false]]){
    const f=structuredClone(original);Object.assign(f,{environment:{platform,cpus:[platform+' controlled fixture'],runId:'controlled fixture'},smoke,modes:smoke?[]:f.modes,engines,browsers:engines.map(engine=>({engine,version:'controlled fixture',executable:platform+' controlled fixture'})),navigation:f.navigation.filter(row=>engines.includes(row.engine)),analytics:f.analytics.filter(row=>engines.includes(row.engine)),rows:f.rows.filter(row=>engines.includes(row.engine)&&(!smoke||row.mode==='normal'))});if(platform==='linux')x.reports[3]=f;else x.reports.push(f);
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
test('full coverage requires complete macOS WebKit and Linux Chromium/Firefox without accepting GTK or smoke substitutes',()=>{
  const get=(x,platform)=>x.reports.find(r=>r.kind==='functional'&&r.environment.platform===platform),x=fullFixture(),before=structuredClone(x.reports),gate=aggregate(x);
  assert.equal(gate.pass,true);assert.deepEqual(x.reports,before,'raw runner reports remain separate and unchanged');
  assert.deepEqual(gate.checkedReports.filter(r=>r.kind==='functional').map(r=>r.platform),['linux','win32','darwin']);
  for(const [platform,engines,smoke,rows,nav,analytics]of [['linux',['chromium','firefox'],false,260,8,26],['darwin',['webkit'],false,130,4,13],['win32',['chromium','firefox'],true,40,8,26]]){
    const r=get(x,platform);assert.deepEqual(r.engines,engines);assert.equal(r.smoke,smoke);assert.equal(r.rows.length,rows);assert.equal(r.navigation.length,nav);assert.equal(r.analytics.length,analytics);
  }
  const failures=[
    ['missing macOS',q=>q.reports.splice(q.reports.indexOf(get(q,'darwin')),1)],
    ['duplicate macOS',q=>q.reports.push(structuredClone(get(q,'darwin')))],
    ['macOS smoke',q=>{const r=get(q,'darwin');r.smoke=true;r.modes=[];r.rows=r.rows.filter(row=>row.mode==='normal');}],
    ['wrong macOS engine',q=>get(q,'darwin').engines=['firefox']],
    ['wrong macOS platform',q=>get(q,'darwin').environment.platform='linux'],
    ['old Linux GTK matrix',q=>q.reports[q.reports.indexOf(get(q,'linux'))]=fixture().reports[3]],
    ['extra GTK lease',q=>{const r=structuredClone(get(q,'darwin'));r.environment.platform='linux';q.reports.push(r);}],
    ['unexpected platform',q=>{const r=structuredClone(get(q,'darwin'));r.environment.platform='other';q.reports.push(r);}],
    ['missing macOS browser',q=>get(q,'darwin').browsers=[]],
    ['GTK masquerading as macOS',q=>get(q,'darwin').browsers[0].port='gtk'],
    ['Xvfb masquerading as macOS',q=>get(q,'darwin').browsers[0].displayBackend='Xvfb'],
    ['missing macOS row',q=>get(q,'darwin').rows.pop()],
    ['duplicate macOS row',q=>{const r=get(q,'darwin');r.rows[0]=structuredClone(r.rows[1]);}],
    ['failed macOS row',q=>get(q,'darwin').rows[0].pass=false],
    ['macOS external request',q=>get(q,'darwin').rows[0].externalRequests.push('https://unexpected.invalid/')],
    ['missing macOS navigation',q=>get(q,'darwin').navigation.pop()],
    ['duplicate macOS navigation',q=>{const r=get(q,'darwin');r.navigation[0]=structuredClone(r.navigation[1]);}],
    ['missing macOS navigation check',q=>delete get(q,'darwin').navigation[0].checks.fullScrollArrival],
    ['missing macOS analytics',q=>get(q,'darwin').analytics.pop()],
    ['duplicate macOS analytics',q=>{const r=get(q,'darwin');r.analytics[0]=structuredClone(r.analytics[1]);}],
    ['missing macOS analytics check',q=>delete get(q,'darwin').analytics[0].checks.oneVendorPerDocument],
    ['macOS source mismatch',q=>get(q,'darwin').sourceCommit='e'.repeat(40)],
    ['macOS tree mismatch',q=>get(q,'darwin').sourceTree='e'.repeat(40)],
    ['macOS candidate mismatch',q=>get(q,'darwin').candidateCommit='e'.repeat(40)],
    ['macOS artifact mismatch',q=>get(q,'darwin').artifactDigest='e'.repeat(64)],
    ['macOS variant mismatch',q=>get(q,'darwin').variant.fingerprint='e'.repeat(64)],
    ['macOS target mismatch',q=>get(q,'darwin').target='https://other.invalid/site'],
    ['Windows full substitute',q=>get(q,'win32').smoke=false]
  ];
  for(const [label,mutate]of failures){const q=fullFixture();mutate(q);assert.throws(()=>aggregate(q),undefined,label);}
  for(const mode of get(x,'darwin').modes){const q=fullFixture();get(q,'darwin').rows.find(row=>row.mode===mode).checks={};assert.throws(()=>aggregate(q),undefined,'macOS retains '+mode+' assertions');}
  const quick=fixture();assert.equal(aggregate(quick).pass,true);quick.reports[3].engines=['chromium','firefox'];assert.throws(()=>aggregate(quick),'nonfull still requires all three Linux engines');
  const extra=fixture();extra.reports.push(structuredClone(get(x,'darwin')));assert.throws(()=>aggregate(extra),'nonfull cannot substitute macOS for its Linux coverage');
});
function colorFixture(){
    const x=fullFixture(),color={id:'color',contract:1,fingerprint:'f'.repeat(64),baseEngine:'d'.repeat(64),effects:['ribbons','travel']};
    x.manifest.variant=color;x.manifest.components={variant:color};for(const r of [...x.reports,x.releaseEvidence])r.variant=color;
    const rows=['chromium','firefox','webkit'].flatMap(engine=>[1440,390].flatMap(width=>['light','dark'].map(theme=>({engine,width,theme,pass:true,identity:{id:'color',engine:color.fingerprint},ribbons:{count:'3',faces:1},checks:Object.fromEntries(['spatialFlight','forwardEdge','reverseNativeBottom','disabledEdge','creditsBoundary','homeBoundary'].map(k=>[k,true])),flight:[{plane:{flightStage:'depart',flightDepth:1}},{plane:{flightStage:'arrive',flightDepth:-1}}]}))));
    x.reports.push({...identity,variant:color,kind:'color-functional',pass:true,rows});return x;
}
test('full macOS policy keeps all twelve Linux Color feature cells including WebKit',()=>{
  assert.equal(aggregate(colorFixture()).pass,true);
  for(const mutate of [r=>r.rows=r.rows.filter(row=>row.engine!=='webkit'),r=>r.rows[0].checks.spatialFlight=false,r=>r.rows[0]=structuredClone(r.rows[1])]){const x=colorFixture();mutate(x.reports.at(-1));assert.throws(()=>aggregate(x));}
});
test('workflow selects full Linux Chromium/Firefox and macOS WebKit while preserving nonfull and Windows coverage',()=>{
  const fs=require('node:fs'),path=require('node:path'),source=fs.readFileSync(path.join(__dirname,'../.github/workflows/site-release-checks.yml'),'utf8');
  const linux=source.slice(source.indexOf('\n  linux:'),source.indexOf('\n  native:')),native=source.slice(source.indexOf('\n  native:'),source.indexOf('\n  performance:'));
  assert.match(linux,/timeout-minutes: 45/);assert.doesNotMatch(linux,/\n {4}strategy:|matrix\.lease/);
  assert.match(linux,/SITE_AUDIT_ENGINES: \$\{\{ inputs\.full && 'chromium,firefox' \|\| 'chromium,firefox,webkit' \}\}/);
  assert.match(linux,/playwright install-deps chromium firefox webkit/);assert.match(linux,/playwright install chromium firefox webkit/);
  assert.match(linux,/if: inputs\.public_variant == 'color' && !cancelled\(\)/);assert.match(linux,/node tools\/quality\/color-browser\.cjs/);
  assert.match(linux,/name: site-reports-linux-\$\{\{ inputs\.profile \}\}-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/);
  assert.match(native,/\n {4}if: inputs\.validation_level == 'production' && inputs\.full\n/);assert.match(native,/timeout-minutes: 40/);assert.match(native,/os: macos-15\n {12}platform: darwin\n {12}engines: webkit/);
  assert.match(native,/name: Native full WebKit matrix\n {8}if: matrix\.platform == 'darwin'\n {8}run: \|\n {10}node tools\/quality\/artifact\.cjs verify quality-artifact\/public quality-artifact\/artifact\.json\n {10}node tools\/quality\/functional\.cjs\n/);
  assert.match(native,/name: Native Windows smoke matrix\n {8}if: matrix\.platform == 'win32'\n {8}run: \|\n {10}node tools\/quality\/artifact\.cjs verify quality-artifact\/public quality-artifact\/artifact\.json\n {10}node tools\/quality\/functional\.cjs --smoke\n/);
});
test('full hosted evidence cannot use local measurements, a missing file or another source edition',()=>{
  const make=(color=false)=>{
    const x=color?colorFixture():fullFixture();x.automatedOnly=true;delete x.releaseEvidence;
    x.hostedURL='https://quality.invalid/site';x.profile='staging';x.jobs.host={result:'success'};
    for(const r of x.reports)r.target=x.hostedURL;
    x.reports.push({...identity,variant:x.manifest.variant,kind:'hosted',pass:true,target:x.hostedURL,profile:'staging',root:true,actual404:true,redirectsStayWithinSite:true,rows:Object.entries(x.manifest.files).map(([file,info])=>({file,url:x.hostedURL+'/'+file,status:200,sha256:info.sha256}))});
    return x;
  };
  assert.equal(aggregate(make()).kind,'hosted-gate');
  assert.equal(aggregate(make(true)).kind,'hosted-gate');
  for(const target of [null,'https://other.invalid/site']){const x=make(true);x.reports.find(r=>r.kind==='color-functional').target=target;assert.throws(()=>aggregate(x),/local results cannot stand in for hosted checks/);}
  for(const mutate of [x=>x.reports.at(-1).rows.pop(),x=>x.reports[3].target=null,x=>x.reports.find(r=>r.kind==='functional'&&r.environment.platform==='darwin').target=null,x=>x.jobs.host.result='skipped',x=>x.reports.at(-1).rows[0].sha256='0'.repeat(64),x=>x.hostedURL=null,x=>x.full=false]){
    const x=make();mutate(x);assert.throws(()=>aggregate(x));
  }
  const x=make(),gate=aggregate(x);gate.githubArtifact={id:'123'};
  const promote=require('../tools/quality/promotion.cjs'),evidence=fullFixture().releaseEvidence;
  assert.equal(promote.validate(x.manifest,gate,evidence),true);
  assert.throws(()=>promote.validate(x.manifest,{...gate,artifactDigest:'0'.repeat(64)},evidence));
  assert.throws(()=>promote.validate(x.manifest,gate,{...evidence,iosSafari:{pass:false}}));
});
test('served-byte verification keeps project paths and rejects tampered files, redirects and indexing errors',async()=>{
  const {verify}=require('../tools/quality/hosted.cjs'),{digest}=require('../tools/quality/artifact.cjs');
  const base='https://quality.invalid/site',data={'index.html':Buffer.from('<h1>Fixture</h1>'),'site-revision.json':Buffer.from('{}')};
  const m={sourceCommit:'a'.repeat(40),files:Object.fromEntries(Object.entries(data).map(([file,bytes])=>[file,{sha256:digest(bytes)}]))};
  const fake=(option={})=>async url=>{
    const pathname=new URL(url).pathname,file=pathname==='/site/'?'index.html':pathname.slice('/site/'.length),bytes=data[file];
    if(option.redirect)return new Response(null,{status:302,headers:{location:'https://other.invalid/'}});
    return new Response(option.tamper&&file==='index.html'?'changed':bytes||'missing',{status:bytes?200:option.spa?200:404,headers:{'content-type':file.endsWith('.json')?'application/json':'text/html','x-robots-tag':option.index?'all':'noindex, nofollow','x-content-type-options':'nosniff'}});
  };
  assert.equal((await verify(base,'staging',m,fake())).actual404,true);
  for(const option of [{tamper:true},{redirect:true},{index:true},{spa:true}])await assert.rejects(()=>verify(base,'staging',m,fake(option)));
  await assert.rejects(()=>verify(base,'production',m,fake()),/noindex/);
});
test('current v11 capture input is byte-verified once; stale editions and tampered media fail closed',()=>{
  const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
  const {digest}=require('../tools/quality/artifact.cjs'),{readEvidence}=require('../tools/quality/validate.cjs');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'site-capture-reader-')),mediaDir=path.join(dir,'review/site-v1-20261004-v11-captures');
  try{
    fs.mkdirSync(mediaDir,{recursive:true});const media=path.join(mediaDir,'index-day-desktop.png'),bytes=Buffer.from('controlled byte fixture; not an actual capture');fs.writeFileSync(media,bytes);
    const actual={files:{'index-day-desktop.png':digest(bytes)}},raw=path.join(mediaDir,'captures.json'),report=path.join(dir,'captures.json');
    fs.writeFileSync(raw,JSON.stringify(actual));fs.writeFileSync(report,JSON.stringify({...identity,kind:'captures',pass:true,...actual}));
    assert.equal(readEvidence([raw,report],true).length,1,'raw media metadata is not a second source-bound report');
    assert.throws(()=>readEvidence([report],true),/missing capture byte record/);
    const old=path.join(dir,'review/site-v1-20261003-v9-captures/captures.json');fs.mkdirSync(path.dirname(old),{recursive:true});fs.writeFileSync(old,JSON.stringify(actual));
    assert.throws(()=>readEvidence([old,report],true),/missing capture byte record/,'historical v9 cannot substitute for current v11');
    fs.writeFileSync(media,'tampered media');assert.throws(()=>readEvidence([raw,report],true),/capture bytes differ/);
    fs.writeFileSync(media,bytes);fs.writeFileSync(raw,JSON.stringify({files:{'../outside.png':digest(bytes)}}));assert.throws(()=>readEvidence([raw,report],true));
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('contrast sampling ignores cached closed-details text and occluded pixels but admits visible controls',()=>{
  const vm=require('node:vm'),{collectSamples}=require('../tools/check_site_contrast.cjs');
  function probe({open=false,summaryText=false,cssVisible=true,covered=false}={}){
    const summary={tagName:'SUMMARY',contains:el=>el===summary},details={open,children:[summary],parentElement:null};
    const element=summaryText?summary:{contains:el=>el===element};
    Object.assign(element,{closest:selector=>selector==='details'?details:null,checkVisibility:options=>{assert.equal(options.opacityProperty,true);assert.equal(options.visibilityProperty,true);assert.equal(options.contentVisibilityAuto,true);return cssVisible;},getClientRects:()=>[{}]});
    const node={parentElement:element,textContent:summaryText?'Appearance':'Theme'},ctx={clearRect(){},fillRect(){},getImageData:()=>({data:[67,89,98,255]})};let visited=false;
    const document={body:{},createTreeWalker:()=>({nextNode:()=>{if(visited)return null;visited=true;return node;}}),createElement:()=>({getContext:()=>ctx}),createRange:()=>({setStart(){},setEnd(){},getBoundingClientRect:()=>({x:20,y:30,width:10,height:12})}),elementFromPoint:()=>covered?{}:element};
    return vm.runInNewContext('('+collectSamples.toString()+')()',{document,NodeFilter:{SHOW_TEXT:4},getComputedStyle:()=>({fontSize:'12px',fontWeight:'400',color:'rgb(67,89,98)'}),innerWidth:200,innerHeight:100});
  }
  assert.equal(probe().length,0,'closed details may retain boxes but do not paint body text');
  assert.equal(probe({open:true}).length,1,'visible Theme control is actually measured');
  assert.equal(probe({summaryText:true}).length,2,'closed details summary remains visible');
  assert.equal(probe({open:true,cssVisible:false}).length,0,'CSS-invisible text is not painted');
  assert.equal(probe({open:true,covered:true}).length,0,'text covered by the sticky header is not its foreground');
});
test('normal browser startup foregrounds the test tab and waits on real readiness with a strict bound',async()=>{
  const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),source=fs.readFileSync(path.join(__dirname,'../tools/quality/functional.cjs'),'utf8');
  const start=source.indexOf('async function foregroundReady(page)'),end=source.indexOf('\nfunction readable',start);assert.ok(start>=0&&end>start);
  const fn=vm.runInNewContext(source.slice(start,end)+'\nforegroundReady',{Date:{now:()=>100}}),calls=[];
  const page={bringToFront:async()=>calls.push('foreground'),waitForFunction:async(predicate,arg,options)=>{calls.push('readiness');assert.equal(arg,null);assert.equal(options.polling,50);assert.equal(options.timeout,3000);assert.match(predicate.toString(),/dataset\.ready==='true'/);}};
  const r=await fn(page);assert.equal(r.foreground,true);assert.equal(r.timeoutMs,3000);assert.deepEqual(calls,['foreground','readiness']);
  await assert.rejects(()=>fn({...page,waitForFunction:async()=>{throw Error('Controlled startup deadline');}}),/startup deadline/,'unready scenes still fail, not skip or silently retry');
});

test('flight measurements and repeated-navigation resources are mandatory',()=>{
  for(const alter of [r=>delete r.journeys,r=>r.journeys[0].rows.pop(),r=>r.journeys[0].warmedRoutes.pop(),r=>r.journeys[0].after.nodes++,r=>r.journeys[0].after.jsEventListeners++]){const r=motionFixture();alter(r);assert.throws(()=>motion(r));}
});
test('Color navigation requires both depth planes and a clear handover without changing base fades',()=>{
  const {checkTiming}=require('../tools/quality/navigation.cjs');
  const samples=[.05,.1,.2,.3,.4,.47,.5,.55,.6,.7,.8,.9,.99].map(progress=>({progress,opacity:progress<.46?1-progress/.46:progress<=.51?0:(progress-.51)/.49,depth:progress<.5?100:-100,stage:progress<.5?'depart':'arrive',direction:'forward'}));
  samples.splice(-1,0,{kind:'mount',progress:.5,opacity:0,direction:'forward'});
  checkTiming(samples,'color');
  assert.throws(()=>checkTiming(samples,'base'),/hidden throughout middle/);
  for(const mutate of [s=>s[0].depth=-100,s=>s.at(-1).depth=100,s=>s[5].opacity=.1,s=>s.at(-1).opacity=1]){
    const changed=structuredClone(samples);mutate(changed);assert.throws(()=>checkTiming(changed,'color'));
  }
});
