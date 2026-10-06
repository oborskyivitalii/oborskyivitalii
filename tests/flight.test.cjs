'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {flightPose,endScrollGate,atPageEnd,atPageStart,decorate}=require('../review/site-scroll-sync-20261004/FLIGHT-PROTOTYPE.cjs');
test('forward passes the current page toward the viewer; reverse sends it into distance',()=>{
  for(const direction of ['forward','backward']){
    for(let i=0;i<=100;i++){
      const p=flightPose(i/100,direction);assert.ok(Number.isFinite(p.z)&&p.z<1200);assert.ok(p.opacity>=0&&p.opacity<=1);
    }
    const a=flightPose(.1,direction),b=flightPose(.3,direction),entry=flightPose(.65,direction);
    assert.equal(Math.sign(b.z-a.z),direction==='forward'?1:-1);
    assert.equal(Math.sign(entry.z),direction==='forward'?-1:1);
    assert.ok(entry.opacity>0&&entry.opacity<1,'fog accompanies spatial approach');
    assert.deepEqual(flightPose(1,direction),{stage:'settled',z:0,opacity:1});
    assert.equal(flightPose(.49,direction).opacity,0);assert.equal(flightPose(.5,direction).opacity,0,'mount while the old/new plane is outside view');
  }
});
test('retargeting preserves the actual displayed plane instead of flashing it at full size',()=>{
  for(const direction of ['forward','backward'])for(const progress of [.08,.31,.65,.89]){
    const displayed=flightPose(progress,direction),retarget=flightPose(0,direction==='forward'?'backward':'forward',displayed);
    assert.equal(retarget.z,displayed.z);assert.equal(retarget.opacity,displayed.opacity);
  }
});
test('bottom detection uses the real rounded range and tolerates native overscroll',()=>{
  assert.equal(atPageEnd(7197,8000,800),false);assert.equal(atPageEnd(7199.25,8000,800),true);
  assert.equal(atPageEnd(7280,8000,800),true);assert.equal(atPageEnd(-70,8000,800),false);
  assert.equal(atPageEnd(0,700,800),true);
});
test('wheel inertia reaching the bottom does not navigate; a fresh additional gesture does',()=>{
  const g=endScrollGate();g.reset(0);g.offer({bottom:false,now:1000,type:'wheel',delta:200});g.boundary(true,1200);
  for(const [now,delta]of [[1250,120],[1320,90],[1400,60],[1480,30]])assert.equal(g.offer({bottom:true,now,type:'wheel',delta}),false);
  assert.equal(g.offer({bottom:true,now:1800,type:'wheel',delta:80}),false);assert.equal(g.progress(),.5);
  assert.equal(g.offer({bottom:true,now:1880,type:'wheel',delta:80}),true);
  assert.equal(g.offer({bottom:true,now:2400,type:'wheel',delta:1000}),false,'cooldown stops chained route skips');
});
test('leaving the bottom or reversing input clears accumulated continuation intent',()=>{
  const g=endScrollGate();g.reset();g.boundary(true,1000);
  assert.equal(g.offer({bottom:true,now:1300,type:'wheel',delta:80}),false);
  g.boundary(false,1350);assert.equal(g.progress(),0);g.boundary(true,1600);
  assert.equal(g.offer({bottom:true,now:1900,type:'wheel',delta:80}),false);
  assert.equal(g.offer({bottom:true,now:1940,type:'wheel',delta:-30}),false);assert.equal(g.progress(),0);
  assert.equal(g.offer({bottom:true,now:1980,type:'wheel',delta:160}),false);
});
test('touch and keyboard require explicit continuation intent and work on short pages',()=>{
  for(const type of ['touch','key']){
    const g=endScrollGate();g.reset();g.boundary(true,0);
    assert.equal(g.offer({bottom:true,now:500,type,delta:1000,deliberate:true}),false);
    assert.equal(g.offer({bottom:true,now:1000,type,delta:1000,deliberate:false}),false);
    assert.equal(g.offer({bottom:true,now:1100,type,delta:1000,deliberate:true}),true);
  }
});
test('top overscroll and fractional rounding use the same native edge tolerance',()=>{
  assert.equal(atPageStart(-70),true);assert.equal(atPageStart(1.75),true);assert.equal(atPageStart(3),false);
});
test('reverse wheel continuation requires a fresh gesture after reaching the top',()=>{
  const g=endScrollGate();g.offer({top:false,bottom:false,now:1000,type:'wheel',delta:-200});g.boundary(false,1200,true);
  for(const [now,delta]of [[1250,-120],[1320,-90],[1400,-60],[1480,-30]])assert.equal(g.offer({top:true,bottom:false,now,type:'wheel',delta}),false);
  assert.equal(g.offer({top:true,bottom:false,now:1800,type:'wheel',delta:-80}),false);assert.equal(g.progress(),.5);
  assert.equal(g.offer({top:true,bottom:false,now:1880,type:'wheel',delta:-80}),true);
  g.reset(1900);assert.equal(g.offer({top:true,bottom:false,now:2750,type:'key',delta:-160,deliberate:true}),false,'route reset retains the accepted-input cooldown');
});
test('short-page reversal clears the other direction, and reverse key/touch are deliberate',()=>{
  const g=endScrollGate();g.boundary(true,1000,true);
  assert.equal(g.offer({top:true,bottom:true,now:1300,type:'wheel',delta:80}),false);
  assert.equal(g.offer({top:true,bottom:true,now:1340,type:'wheel',delta:-80}),false);assert.equal(g.progress(),0);
  assert.equal(g.offer({top:true,bottom:true,now:1600,type:'wheel',delta:-80}),false);assert.equal(g.progress(),.5);
  for(const type of ['key','touch']){
    const gate=endScrollGate();gate.boundary(false,0,true);
    assert.equal(gate.offer({top:true,bottom:false,now:1000,type,delta:-1000,deliberate:false}),false);
    assert.equal(gate.offer({top:true,bottom:false,now:1100,type,delta:-1000,deliberate:true}),true);
  }
});
test('optional exporter compiles, keeps one scheduler and changes both embedded engine identities',()=>{
  const {standalone}=require('../review/site-scroll-sync-20261004/export.cjs'),ribbons=require('../review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs');
  const source=standalone(fs.readFileSync(require('node:path').join(__dirname,'../review/site-v1-20261004-v11-interactive.html'),'utf8'));
  const previous=ribbons.decorate(source),output=decorate(previous),hash=output.match(/name="site-engine" content="([a-f0-9]{64})"/)[1];
  const createPresentation=require('../review/site-scroll-sync-20261004/FLIGHT-PROTOTYPE.cjs').createPresentation;
  for(const supports of [undefined,()=>false,()=>true]){
    assert.equal(vm.runInNewContext('('+createPresentation.toString()+')({}).canTravel()', {window:{CSS:{supports}}}),supports?.()===true,'missing capability cannot become the scene API default On');
  }
  assert.notEqual(hash,previous.match(/name="site-engine" content="([a-f0-9]{64})"/)[1]);
  const payload=JSON.parse(output.match(/<script type="application\/json" id="site-pages">([\s\S]*?)<\/script>/)[1]);assert.equal(payload.revision.engine,hash);
  for(const page of Object.values(payload.pages))assert.ok(page.includes('name="site-engine" content="'+hash+'"'));
  for(const script of output.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!script[1].includes('application/'))new vm.Script(script[2]);
  assert.equal((output.match(/requestAnimationFrame/g)||[]).length,(previous.match(/requestAnimationFrame/g)||[]).length);
  assert.match(output,/passive:true/);assert.match(output,/overflow:clip/);assert.match(output,/finally\{if\(transform\)plane.style.transform=transform/);
  assert.throws(()=>decorate(output),/duplicate offline travel/);
  const reformatted=source.replace('  function measure() {','  function measure()\n  {').replace('  function flight(next,animate,commit,own,departure) {','  function flight(next,animate,commit,own,departure)\n  {');
  assert.doesNotThrow(()=>decorate(ribbons.decorate(reformatted)),'authored runtime formatting is not the extension boundary');
  assert.throws(()=>decorate(source.replaceAll('name="site-effects-contract" content="1"','name="site-effects-contract" content="2"')),/compatible authored/);
});
