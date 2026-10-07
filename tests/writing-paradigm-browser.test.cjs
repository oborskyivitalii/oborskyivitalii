'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const contract=require('../tools/quality/writing-paradigm-validate.cjs');
function finiteBounds(){
  const source=fs.readFileSync(path.join(__dirname,'../tools/quality/writing-paradigm-browser.cjs'),'utf8'),start=source.indexOf('function finiteBounds('),end=source.indexOf('\nasync function visible(',start);
  assert.ok(start>=0&&end>start,'maintained browser geometry helper');return vm.runInNewContext('('+source.slice(start,end)+')',{assert});
}
function bounds(){return {route:'writing',x:16,y:200,width:358,height:62,viewportWidth:390,viewportHeight:844};}
test('Writing actual formula bounds reject invisible, nonfinite, reversed and horizontally clipped paint evidence',()=>{
  const check=finiteBounds();check([bounds()]);
  for(const rows of [[],[{...bounds(),x:NaN}],[{...bounds(),width:0}],[{...bounds(),height:-1}],[{...bounds(),x:14}],[{...bounds(),width:360}],[{...bounds(),y:-1}],[{...bounds(),height:900}]])assert.throws(()=>check(rows));
});
function formula(){return {status:'ready',cacheBuilds:1,width:1380,height:240,bytes:1324800,paintCount:20,visibleCount:1,lastPaintCount:1,failures:0};}
function observed(width=390){return {formula:formula(),overflow:false,probe:{duplicate:false,draws:20,maxPerPaint:1,paints:20,startPaintCount:0,bounds:[{...bounds(),width:width-32,viewportWidth:width}]}};}
function fixture(){
  const expected={sourceCommit:'2'.repeat(40),sourceTree:'4'.repeat(40),candidateCommit:'2'.repeat(40),sourceDirty:false,artifactDigest:'b'.repeat(64),variant:{id:'color',contract:1,fingerprint:'d'.repeat(64),effects:['ribbons','travel']},engine:'d'.repeat(64),derivation:{kind:'authored-color-effects',baseArtifactDigest:'f'.repeat(64)}},engines=['chromium','firefox','webkit'],cases=[{width:1440,theme:'light',mode:'normal'},{width:390,theme:'dark',mode:'normal'},{width:320,theme:'dark',mode:'no-js'},{width:320,theme:'light',mode:'no-canvas'},{width:390,theme:'dark',mode:'reduced'}];
  const views=[320,390,768,1440].flatMap(width=>['light','dark'].map(theme=>({width,theme}))),record={schema:1,kind:'writing-paradigm-browser',fullGate:false,pass:true,environment:{platform:'linux',os:'fixture',node:'v24'},sourceCommit:expected.sourceCommit,sourceTree:expected.sourceTree,artifactDigest:expected.artifactDigest,variant:expected.variant,engines:engines.map(engine=>({engine,version:'fixture'})),rows:engines.flatMap(engine=>cases.map(row=>({engine,route:'writing',...row,pass:true,errors:[],externalRequests:[],checks:Object.fromEntries(['positiveProbe','off','print','syntheticVisibility','keyboard','reverse','zoom','archive','fallback','reducedFreeze'].map(key=>[key,true]))}))),formula:{rows:[...views.map(view=>({...view,initial:observed(view.width),after:observed(view.width),...(view.width===390?{zoom:observed(390)}:{}),errors:[]})),...['research','writing','talks','writing','credits','index','writing'].map(route=>({journey:route,route,formula:formula(),probe:{duplicate:false,draws:route==='writing'?3:0}})),{errors:[],cacheFault:{ready:'true',h1:1,probe:{paints:3,draws:0},formula:{status:'failed',cacheBuilds:1,failures:1}}}],captures:[...views.map(({width,theme})=>`writing-${width}-${theme}.png`),'writing-light-zoom200.png','writing-dark-zoom200.png']},offline:{requests:[],errors:[],observed:observed()}};
  return {record,expected};
}
test('Writing browser report accepts the full focused matrix, visual journey, bounded failure and offline evidence',()=>{
  const {record,expected}=fixture();assert.deepEqual(contract.browser(record,expected),{pass:true,fullGate:false,cases:15});
});
test('Writing browser report rejects wrong-source, missing cells/captures, invisible formula, room leaks and failed offline/cache checks',()=>{
  const mutations=[
    record=>record.sourceCommit='1'.repeat(40),record=>record.artifactDigest='0'.repeat(64),record=>record.variant.id='base',
    record=>record.rows.pop(),record=>record.rows[1]=structuredClone(record.rows[0]),record=>record.engines.pop(),
    record=>record.rows[0].checks.off=false,record=>record.rows[4].checks.reducedFreeze=false,
    record=>record.formula.captures.pop(),record=>record.formula.rows[0].initial.probe.draws=0,
    record=>record.formula.rows[0].after.probe.startPaintCount=20,record=>delete record.formula.rows[2].zoom,
    record=>record.formula.rows[2].zoom.probe.startPaintCount=20,
    record=>record.formula.rows[0].initial.probe.bounds[0].width=400,record=>record.formula.rows[8].probe.draws=1,
    record=>record.formula.rows[0].after.probe.bounds[0].y=-1,
    record=>record.formula.rows[15].cacheFault.formula.cacheBuilds=2,record=>record.offline.requests.push('https://invalid.example/asset'),
    record=>delete record.offline,record=>record.pass=false
  ];
  for(const mutate of mutations){const {record,expected}=structuredClone(fixture());mutate(record);assert.throws(()=>contract.browser(record,expected));}
});
