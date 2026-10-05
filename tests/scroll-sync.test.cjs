'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fitScrollStops,writingProgress}=require('../site/engine/math.cjs')();
test('semantic stops span actual content and footer growth; repeated closing poses cannot finish early',()=>{
  const markers=[{id:'intro',y:0},{id:'middle',y:700},{id:'end',y:1600},{id:'end',y:2600}];
  for(const end of [2000,3400,8000]){
    const stops=fitScrollStops(markers,end);
    assert.deepEqual(stops,[{id:'intro',y:0},{id:'middle',y:700},{id:'end',y:end}]);
    assert.ok(stops.every((s,i)=>i===0||s.y>stops[i-1].y));
  }
  assert.equal(fitScrollStops(markers,500).at(-1).y,500);
  assert.equal(fitScrollStops(markers,0).length,1);
  assert.equal(fitScrollStops([{id:'intro',y:0},{id:'end',y:0}],1000).length,1);
});
test('Writing endpoints and nonzero final gestures survive long, short and anchored content reflow',()=>{
  for(const [start,end]of [[800,8000],[80,400],[0,1200]])for(const anchor of [null,{y:200,progress:.2},{y:300,progress:1},{y:100,progress:0},{y:9000,progress:.7}]){
    const bounds={start,end};
    assert.equal(writingProgress(0,bounds,anchor),0);
    assert.equal(writingProgress(end,bounds,anchor),1);
    const values=[0,.1,.25,.5,.8,.9,.95,.99,1].map(t=>writingProgress(t*end,bounds,anchor));
    assert.ok(values.every((v,i)=>Number.isFinite(v)&&v>=0&&v<=1&&(i===0||v>values[i-1])),JSON.stringify({bounds,anchor,values}));
  }
});
test('route position restoration is immediate and retains CSS preferences even after a native failure',()=>{
  const source=fs.readFileSync(require('node:path').join(__dirname,'../site/engine/navigation.js'),'utf8');
  const helper=source.match(/ {2}function restoreScroll\(left,top\) \{[\s\S]*?\n {2}}/)[0];
  for(const saved of [['',''],['smooth','important']])for(const failure of [false,true]){
    let value=saved[0],priority=saved[1],calls=0,computed=false;
    const style={getPropertyValue:()=>value,getPropertyPriority:()=>priority,setProperty:(name,v,p)=>{value=v;priority=p;},removeProperty:()=>{value='';priority='';}};
    const restore=vm.runInNewContext('('+helper+')',{getComputedStyle:()=>{assert.equal(value,'auto');computed=true;return {scrollBehavior:value};},document:{documentElement:{style}},window:{scrollTo:options=>{
      calls++;assert.equal(computed,true);assert.equal(value,'auto');assert.equal(options.behavior,'auto');assert.equal(options.left,12);assert.equal(options.top,7841);
      if(failure)throw Error('Controlled native failure');
    }}});
    if(failure)assert.throws(()=>restore(12,7841),/Controlled native failure/);else restore(12,7841);
    assert.equal(calls,1);assert.equal(value,saved[0]);assert.equal(priority,saved[1]);
  }
});
