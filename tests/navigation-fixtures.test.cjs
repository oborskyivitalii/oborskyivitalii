'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {archiveHistoryReady,nativeScrollSettlement,beginInterruption,checkTiming,timingProbe}=require('../tools/quality/navigation.cjs');
test('same-document archive history waits for URL, popstate controls and finished route mounting',async()=>{
  const state={location:{href:'https://owned.invalid/writing.html?topic=systems&language=uk'},values:{topic:'systems',language:'uk'},busy:false};
  const document={body:{dataset:{page:'writing'}},querySelector:()=>({hasAttribute:()=>state.busy}),getElementById:id=>({value:state.values[id.slice('archive-'.length)]})};
  let predicate,expected,release,finished=false;
  const page={waitForFunction(fn,arg,options){predicate=fn;expected=arg;assert.deepEqual(options,{polling:40,timeout:6000});return new Promise(resolve=>release=resolve);}};
  const url='https://owned.invalid/writing.html?topic=systems';
  const pending=archiveHistoryReady(page,url,{topic:'systems',language:'all'}).then(()=>finished=true);
  const restored=()=>vm.runInNewContext('('+predicate.toString()+')(expected)',{location:state.location,document,expected});
  assert.equal(restored(),false);state.location.href=url;
  assert.equal(restored(),false,'URL acknowledgement alone is not restored filtering');
  state.values.language='all';state.busy=true;
  assert.equal(restored(),false,'matching controls during a route mount are not ready');
  await Promise.resolve();assert.equal(finished,false);
  state.busy=false;assert.equal(restored(),true);release();await pending;assert.equal(finished,true);
  await assert.rejects(()=>archiveHistoryReady({waitForFunction:async()=>{throw Error('Controlled popstate deadline');}},url,{language:'all'}),/popstate deadline/,'unrestored history remains a failure');
});
function scrolling(position){
  let time=0;const timers=[];
  const context={window:{},performance:{now:()=>time},document:{documentElement:{scrollHeight:10000}},innerHeight:844,setTimeout(fn,delay){assert.equal(delay,50);timers.push({fn,time:time+delay});}};
  Object.defineProperty(context,'scrollY',{get:()=>position(time)});
  const pending=vm.runInNewContext('('+nativeScrollSettlement.toString()+')()',context);
  return {pending,advance(){const timer=timers.shift();assert.ok(timer);time=timer.time;timer.fn();},timers,time:()=>time,evidence:()=>context.window.__wheelSettlement};
}
test('endpoint takeover begins after the complete native wheel, retaining a strict stall deadline',async()=>{
  const moving=scrolling(time=>time<100?8557:8399);
  let complete=false;moving.pending.then(()=>complete=true);
  moving.advance();await Promise.resolve();assert.equal(complete,false,'one early wheel position cannot serve as the footer-growth baseline');
  while(moving.timers.length)moving.advance();
  const result=await moving.pending;assert.equal(result.y,8399);assert.equal(result.elapsedMs,250);assert.equal(result.quietMs,150);assert.ok(result.samples.some(sample=>sample.y===8557));
  const stalled=scrolling(time=>9000-time),rejected=assert.rejects(stalled.pending,/did not settle within 2000ms/);
  while(stalled.timers.length)stalled.advance();
  await rejected;assert.equal(stalled.time(),2000);
  const evidence=stalled.evidence();assert.equal(evidence.status,'failed');assert.match(evidence.error,/did not settle within 2000ms/);assert.equal(evidence.elapsedMs,2000);assert.equal(evidence.timeoutMs,2000);assert.equal(evidence.samples.length,41);assert.equal(evidence.samples[0].y,9000);assert.equal(evidence.samples.at(-1).y,7000);assert.equal(evidence.samples.at(-1).time,2000);assert.equal(evidence.max,9156,'failed native observations remain available to the scenario report');
});
function interruption({animated,skipFlight=false}={}){
  const listeners=new Map(),events=[],scene={dataset:{travel:'settled',progress:'0'}},attrs={href:'writing.html'};
  let observer,disconnected=0,buttonClicks=0;
  const document={hidden:false,body:{dataset:{page:'talks'}},dispatchEvent:event=>events.push(event.type)};
  function emit(name){for(const fn of [...(listeners.get(name)||[])])fn();}
  const window={SiteScene:{canTravel:()=>animated},SiteEffects:{navigation(){}},CSS:{supports:()=>true},addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},removeEventListener(name,fn){listeners.get(name)?.delete(fn);},dispatchEvent:event=>events.push(event.type)};
  const link={getAttribute:name=>attrs[name],setAttribute:(name,value)=>attrs[name]=value,click(){
    if(animated&&!skipFlight){scene.dataset.travel='flying';scene.dataset.progress='.12';observer.callback();}
    document.body.dataset.page='writing';scene.dataset.travel='settled';scene.dataset.progress='1';emit('site:page-ready');
  }};
  document.querySelector=selector=>selector==='.space-scene'?scene:selector==='#space-motion'?{click(){buttonClicks++;}}:link;
  const context={document,window,Event:class Event{constructor(type){this.type=type;}},MutationObserver:class MutationObserver{constructor(callback){this.callback=callback;observer=this;}observe(){}disconnect(){disconnected++;}}};
  const begin=vm.runInNewContext('('+beginInterruption.toString()+')',context);
  return {begin,window,document,events,attrs,repeat(){observer?.callback();emit('site:page-ready');},disconnected:()=>disconnected,buttonClicks:()=>buttonClicks};
}
test('print/off/hidden fixtures execute exactly once on recorded animated or instant paths',()=>{
  for(const animated of [false,true])for(const kind of ['print','off','hidden']){
    const h=interruption({animated});h.begin(kind);const probe=h.window.__interruption;
    assert.equal(probe.triggered,true);assert.equal(probe.expected,animated?'animated':'instant');assert.equal(probe.trigger,animated?'flight':'instant-arrival');
    assert.equal(probe.progress,animated?.12:1);assert.equal(h.attrs.href,'writing.html');h.repeat();
    assert.equal(h.events.filter(name=>name==='beforeprint').length,kind==='print'?1:0);
    assert.equal(h.events.filter(name=>name==='visibilitychange').length,kind==='hidden'?1:0);
    assert.equal(h.buttonClicks(),kind==='off'?1:0);
    if(animated)assert.equal(h.disconnected(),1);
  }
});
test('a declared animated interruption without a flight never fabricates a print pass',()=>{
  const h=interruption({animated:true,skipFlight:true});h.begin('print');
  assert.equal(h.window.__interruption.triggered,false);assert.equal(h.window.__interruption.missedArrival,true);assert.deepEqual(h.events,[]);assert.equal(h.disconnected(),1);
});
function spatialSamples(){
  const samples=[.05,.1,.2,.3,.4,.55,.6,.7,.8,.9,.99].map(progress=>({kind:'progress',progress,opacity:progress<.46?1-progress/.46:(progress-.51)/.49,depth:progress<.5?100:-100,stage:progress<.5?'depart':'arrive',direction:'forward'}));
  samples.splice(5,0,{kind:'mount',progress:.56,opacity:0,direction:'forward'});return samples;
}
test('spatial handover observes the real hidden mount even if no painted sample lands at the midpoint',()=>{
  checkTiming(spatialSamples(),'color');
  const invalid=[
    samples=>samples.find(sample=>sample.kind==='mount').opacity=.1,
    samples=>samples.find(sample=>sample.kind==='mount').progress=.49,
    samples=>samples.find(sample=>sample.kind==='mount').progress=1,
    samples=>samples.splice(samples.findIndex(sample=>sample.kind==='mount'),1),
    samples=>samples.push({...samples.find(sample=>sample.kind==='mount')}),
    samples=>samples.push({kind:'progress',progress:.49,opacity:.1,stage:'depart',depth:100,direction:'forward'}),
    samples=>samples.splice(0,samples.length,...samples.filter(sample=>sample.stage!=='arrive')),
  ];
  for(const mutate of invalid){const samples=spatialSamples();mutate(samples);assert.throws(()=>checkTiming(samples,'color'));}
});
test('timing evidence records the actual mount synchronously and keeps ordinary progress samples',()=>{
  const scene={dataset:{progress:'.56',direction:'forward'}},content={dataset:{flightDepth:'0'},hasAttribute:()=>true},listeners=new Map();let observer;
  const context={window:{addEventListener:(name,fn)=>listeners.set(name,fn)},document:{body:{dataset:{page:'writing'}},querySelector:selector=>selector==='.space-scene'?scene:content},getComputedStyle:()=>({opacity:'0'}),MutationObserver:class MutationObserver{constructor(callback){observer=callback;}observe(){}}};
  vm.runInNewContext('('+timingProbe.toString()+')()',context);
  listeners.get('site:page-mount')();observer();
  const samples=context.window.__flightSamples;assert.equal(samples.length,2);assert.equal(samples[0].kind,'mount');assert.equal(samples[0].progress,.56);assert.equal(samples[0].opacity,0);assert.equal(samples[0].page,'writing');assert.equal(samples[1].kind,'progress');
});
