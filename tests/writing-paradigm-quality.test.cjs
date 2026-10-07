'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {summarize}=require('../tools/quality/motion.cjs');
const contract=require('../tools/quality/writing-paradigm-validate.cjs');
function historicalFixture(run){
  const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),artifact=require('../tools/quality/artifact.cjs'),directory=fs.mkdtempSync(path.join(os.tmpdir(),'writing-frozen-baseline-'));
  const revision={schema:1,contract:1,variant:source('baseline').variant,engine:'c'.repeat(64),scenes:'a'.repeat(64),assets:'e'.repeat(64),content:'d'.repeat(64),routes:{}},write=(name,bytes)=>{const file=path.join(directory,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);};
  try{
    write('.nojekyll','');
    for(const name of ['styles.css','theme.js','space.js','archive.js','navigation.js']){const bytes='/* historical fixture '+name+' */';write(name,bytes);write('runtime/'+revision.engine+'/'+name,bytes);}
    for(const name of ['favicon.svg','vitalii-oborskyi.jpg','vitalii-oborskyi-cutout.webp']){const bytes='historical media fixture '+name;write('assets/'+name,bytes);write('media/'+revision.assets+'/'+name,bytes);}
    for(const [index,route]of ['index','research','writing','talks','credits'].entries()){
      const version=String(index+1).repeat(64),html='<meta name="site-engine" content="'+revision.engine+'"><meta name="site-route" content="'+version+'">'+['styles.css','theme.js','space.js','archive.js','navigation.js'].map(name=>'<script src="runtime/'+revision.engine+'/'+name+'"></script>').join(''),url='snapshots/'+version+'/'+route+'.html';
      const snapshot=html.replaceAll('src="runtime/','src="../../runtime/');write(route+'.html',html);write(url,snapshot);revision.routes[route]={version,url,sha256:artifact.digest(Buffer.from(snapshot))};
    }
    write('site-revision.json',JSON.stringify(revision));
    const manifest={...source('baseline'),sourceCommit:contract.frozenBaselineSHA,candidateCommit:contract.frozenBaselineSHA,components:revision,...artifact.manifest(directory)};run({directory,manifest,write,artifact});
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
}
function source(label){const candidate=label==='candidate';return {sourceCommit:(candidate?'2':'1').repeat(40),sourceTree:(candidate?'4':'3').repeat(40),candidateCommit:(candidate?'2':'1').repeat(40),sourceDirty:false,artifactDigest:(candidate?'b':'a').repeat(64),variant:{id:'color',contract:1,fingerprint:(candidate?'d':'c').repeat(64),effects:['ribbons','travel']},engine:(candidate?'d':'c').repeat(64),derivation:{kind:'authored-color-effects',baseArtifactDigest:(candidate?'f':'e').repeat(64)}};}
function cache(){return {status:'ready',cacheBuilds:1,width:1380,height:240,bytes:1324800,paintCount:40,visibleCount:0,lastPaintCount:0,failures:0};}
function diagnostics(){return {formula:cache(),rooms:[{route:'writing',models:[{formulaAnchors:1,compact:true}]},{route:'talks',models:[{formulaAnchors:0,compact:true}]}]};}
function measure(kind,{cost=2,zero=false,cold=false,duration=1200}={}){
  const start=100,end=start+duration,frames=zero?[]:Array.from({length:Math.floor(duration/100)},(_,index)=>({time:start+index*100,started:start+index*100,duration:cost,painted:true}));
  const events=kind==='flight'?[
    {kind:'navigation-start',time:start,page:'research'},
    ...(cold?[{kind:'model',time:start+2,start:start+1,duration:1,page:'writing'}]:[]),
    {kind:'layout',time:start+5,start:start+3,duration:2,page:'writing'},
    {kind:'navigation-ready',time:end,page:'writing'}
  ]:[];
  return {...summarize({schema:2,frames,longTasks:[],events,start,end,elapsed:duration,state:'active',quality:'0',cadence:'15'},kind),events};
}
function fixture(){
  const identities={baseline:source('baseline'),candidate:source('candidate')},rows=[];let clock=1;
  for(const profile of contract.profiles)for(const [round,order]of contract.orders.entries())for(const label of order){
    const cost=label==='candidate'?2.4:2,flights=['writing','talks','writing','research'].map((to,index)=>({from:['research','writing','talks','writing'][index],to,...measure('flight',{cost,cold:index===0}),formula:cache()}));
    const measurements=['idle','scroll','filtered','empty'].map(kind=>{
      const sample=measure(kind,{cost,duration:{idle:4000,scroll:4000,filtered:1600,empty:1000}[kind]});
      if(label==='candidate')sample.formula={before:{...cache(),paintCount:100},after:{...cache(),paintCount:100+sample.paints},paintDelta:sample.paints,framing:'painted',beforeScene:{route:'writing',camera:'{"position":[0,0,0],"target":[0,0,-1]}'},afterScene:{route:'writing',camera:'{"position":[0,0,0],"target":[0,0,-1]}'}};return sample;
    });
    rows.push({profile:profile.id,round,label,settings:profile,startedMs:clock,endedMs:clock+1,browser:'fixture-chromium',errors:[],runtimeVariant:'color',runtimeEngine:identities[label].variant.fingerprint,measurements,filteredPublications:1,emptyPublications:0,flights,formula:cache(),diagnostics:diagnostics(),transfer:{routeRawBytes:25000,routeGzipBytes:30000,requests:[{path:'/runtime/'+identities[label].variant.fingerprint+'/space.js',duration:2,encodedBodySize:10000,transferSize:10300}],formulaAssetRequests:0,runtimeDecodes:0}});clock+=2;
  }
  const observe=()=>({dom:{nodes:100,jsEventListeners:20},diagnostics:diagnostics()});
  return {schema:1,kind:'writing-paradigm-performance',fullGate:false,complete:true,environment:{platform:'linux',os:'fixture',node:'v24',cpus:['fixture']},browser:{version:'fixture-chromium',executable:'/fixture/chromium'},profiles:contract.profiles,orders:contract.orders,guardrails:contract.guardrails,identities,rows,retention:contract.profiles.map(profile=>({profile:profile.id,cycles:40,warmedRoutes:['research','writing','talks','credits','index'],errors:[],zeroWork:['off','reduced','hidden','print'].map(kind=>measure(kind,{zero:true})),resumedOnce:true,resumed:measure('idle'),before:observe(),after:observe()}))};
}
test('Writing paired performance accepts complete exact-source raw observations without granting a full gate',()=>{
  const value=fixture(),result=contract.validate(value,{trustedIdentities:value.identities});assert.equal(result.pass,true);assert.equal(result.fullGate,false);assert.equal(result.comparisons.length,3);
  assert.ok(result.comparisons.every(row=>Math.abs(row.metrics.idle.p95Delta-.4)<1e-8));
  const natural=structuredClone(fixture());
  for(const row of natural.rows.filter(row=>row.label==='candidate'))for(const sample of row.measurements.filter(sample=>['filtered','empty'].includes(sample.kind))){sample.formula.after.paintCount=sample.formula.before.paintCount;sample.formula.paintDelta=0;sample.formula.framing='outside-camera';}
  assert.equal(contract.validate(natural).pass,true,'a world landmark outside selected content camera is recorded without fabricating visibility');
});
test('Writing paired performance rejects missing, duplicate, wrong-source, wrong-variant and mislabeled profiles',()=>{
  const mutations=[
    value=>value.rows.pop(),value=>value.rows[1]=structuredClone(value.rows[0]),value=>value.rows[0].settings.cpuRate=4,
    value=>value.identities.candidate.sourceDirty=true,value=>value.identities.candidate.sourceCommit='1'.repeat(40),
    value=>value.identities.candidate.variant.id='base',value=>value.rows[0].runtimeEngine='0'.repeat(64),
    value=>value.rows[1].browser='another-browser',value=>value.rows[1].startedMs=value.rows[0].startedMs,
    value=>value.rows[0].measurements[0].rawFrames.pop(),value=>delete value.rows[0].flights[0].events,
    value=>value.rows[0].flights[0].readyMs=1000,value=>value.rows[0].measurements.pop(),
    value=>value.complete=false,value=>value.orders[0].reverse(),value=>value.rows[0].transfer.formulaAssetRequests=1
  ];
  for(const mutate of mutations){const value=structuredClone(fixture());mutate(value);assert.throws(()=>contract.validate(value));}
  const value=fixture(),trusted=structuredClone(value.identities);trusted.candidate.artifactDigest='0'.repeat(64);assert.throws(()=>contract.validate(value,{trustedIdentities:trusted}),/another artifact/);
  historicalFixture(({directory,manifest,write,artifact})=>{
    assert.equal(contract.verifyBaseline(directory,manifest),true);
    assert.throws(()=>contract.verifyBaseline(directory,{...manifest,sourceCommit:'0'.repeat(40)}),/unapproved historical/);
    write('space.js','changed runtime');assert.throws(()=>contract.verifyBaseline(directory,manifest),/bytes do not match/);
    const forged={...manifest,...artifact.manifest(directory)};assert.throws(()=>contract.verifyBaseline(directory,forged),/runtime differs/);
    write('space.js','/* historical fixture space.js */');write('assets/foreign.svg','unexpected asset');assert.throws(()=>contract.verifyBaseline(directory,{...manifest,...artifact.manifest(directory)}),/unexpected public input/);
  });
});
function changeMeasurement(row,cost){return {...measure(row.kind,{cost,duration:row.elapsedMs}),formula:row.formula};}
test('Writing paired performance rejects absolute failures, added cost and quality or cadence concealment',()=>{
  for(const mutate of [
    value=>{value.rows.find(row=>row.profile==='mobile-x4'&&row.label==='baseline').measurements[1]=measure('scroll',{cost:34,duration:4000});},
    value=>{for(const row of value.rows.filter(row=>row.label==='candidate'))row.measurements[0]=changeMeasurement(row.measurements[0],5);},
    value=>{for(const row of value.rows.filter(row=>row.label==='candidate'))row.measurements[0]=changeMeasurement(row.measurements[0],.1);value.rows.find(row=>row.label==='candidate').measurements[0].quality='1';},
    value=>{value.rows.find(row=>row.label==='candidate').measurements[0].cadence='10';},
    value=>{
      const row=value.rows.find(row=>row.label==='candidate'),sample=row.measurements[0],frames=[{...sample.rawFrames[0],duration:.1}],next=summarize({schema:2,frames,longTasks:[],events:[],start:sample.window.startMs,end:sample.window.endMs,elapsed:sample.elapsedMs,state:'active',quality:sample.quality,cadence:sample.cadence},'idle');
      row.measurements[0]={...next,formula:{...sample.formula,before:sample.formula.before,after:{...sample.formula.after,paintCount:sample.formula.before.paintCount+1},paintDelta:1}};
    },
    value=>{for(const row of value.rows.filter(row=>row.label==='candidate'))row.flights[0]={...row.flights[0],...measure('flight',{cold:true,duration:1600})};}
  ]){const value=structuredClone(fixture());mutate(value);assert.throws(()=>contract.validate(value));}
});
test('Writing paired performance rejects invisible or repeated formula caches, wrong rooms and growing lifecycle resources',()=>{
  const mutations=[
    value=>value.rows.find(row=>row.label==='candidate').formula.paintCount=0,
    value=>{const sample=value.rows.find(row=>row.label==='candidate').measurements[0];sample.formula.after.paintCount=sample.formula.before.paintCount;sample.formula.paintDelta=0;},
    value=>value.rows.find(row=>row.label==='candidate').formula.cacheBuilds=2,
    value=>value.rows.find(row=>row.label==='candidate').formula.width=4096,
    value=>value.rows.find(row=>row.label==='candidate').diagnostics.rooms[1].models[0].formulaAnchors=1,
    value=>value.rows.find(row=>row.label==='candidate').flights[1].formula.lastPaintCount=1,
    value=>value.retention.pop(),value=>value.retention[0].cycles=39,
    value=>value.retention[0].after.dom.nodes++,value=>value.retention[0].after.dom.jsEventListeners++,
    value=>value.retention[0].zeroWork[0]=measure('off'),value=>value.retention[0].resumedOnce=false,
    value=>value.retention[0].after.diagnostics.formula.cacheBuilds=2
  ];
  for(const mutate of mutations){const value=structuredClone(fixture());mutate(value);assert.throws(()=>contract.validate(value));}
});
module.exports={fixture};
