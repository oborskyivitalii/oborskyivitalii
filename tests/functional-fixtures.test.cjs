'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../tools/quality/functional.cjs'),'utf8');
const begin=source.indexOf('async function navigateDocument('),end=source.indexOf('\nasync function settled(',begin);
assert.ok(begin>=0&&end>begin,'real functional fixture helpers must be present');
const helpersSource=source.slice(begin,end);
const plain=value=>JSON.parse(JSON.stringify(value));
function helpers(){
  let time=0;
  const scene={dataset:{camera:'opening',phase:'0',quality:'full'}},attached=new Set();
  const context=vm.createContext({assert,window:{__quality:{paints:0,callbacks:0}},document:{hidden:false,querySelector:selector=>selector==='.space-scene'?attached.has(selector)&&scene:attached.has(selector)&&{}},performance:{now:()=>time},scrollY:0,state:async page=>page.snapshot()});
  const methods=vm.runInContext(helpersSource+'\n({navigateDocument,forwardCamera,forwardCameraResponded})',context);
  return {...methods,context,scene,attached,time:()=>time,setTime:value=>time=value,snapshot:()=>({scrollY:context.scrollY,camera:scene.dataset.camera,paints:context.window.__quality.paints,forwardResponse:context.window.__forwardCameraResponse?plain(context.window.__forwardCameraResponse):null})};
}
function deferred(){
  let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
  return {promise,resolve,reject};
}
function cssPage(h,{attachAt=()=>0,domError,paintAfterHold=false,navigationError}={}){
  const load=deferred(),events=[];let released=false,finished=false;
  const page={snapshot(){events.push({kind:'state',time:h.time()});return h.snapshot();},
    goto(url,options){events.push({kind:'goto',url,options:plain(options)});return load.promise;},
    async waitForFunction(fn,arg,options){
      assert.deepEqual(plain(options),{polling:50,timeout:3000});
      if(domError)throw domError;
      for(let elapsed=0;elapsed<=options.timeout;elapsed+=options.polling){
        h.setTime(elapsed);
        for(const selector of ['.space-scene','#space-motion','main','footer'])if(elapsed>=attachAt(selector))h.attached.add(selector);
        const result=Boolean(fn(arg));events.push({kind:'dom',time:elapsed,attached:[...h.attached],ready:result});
        if(result)return;
      }
      throw Error('Controlled DOM deadline');
    },
    async waitForTimeout(delay){events.push({kind:'hold',delay});h.setTime(h.time()+delay);if(paintAfterHold)h.context.window.__quality.paints++;}
  };
  function release(){
    if(released)return;released=true;events.push({kind:'release',time:h.time()});
    queueMicrotask(()=>{finished=true;if(navigationError)load.reject(navigationError);else load.resolve();});
  }
  return {page,events,load,release,released:()=>released,finished:()=>finished};
}
test('held CSS waits for the actual scene, controls and document before both no-paint assertions',async()=>{
  const h=helpers(),attachment={'.space-scene':0,'#space-motion':50,main:100,footer:150};
  const fixture=cssPage(h,{attachAt:selector=>attachment[selector]});
  await h.navigateDocument(fixture.page,'https://owned.invalid/writing.html',fixture.release);
  assert.deepEqual(fixture.events.filter(event=>event.kind==='dom').map(event=>event.ready),[false,false,false,true]);
  assert.deepEqual(fixture.events.filter(event=>event.kind==='state').map(event=>event.time),[150,350]);
  assert.deepEqual(fixture.events.filter(event=>event.kind==='hold'),[{kind:'hold',delay:200}]);
  assert.equal(fixture.events.find(event=>event.kind==='release').time,350);
  assert.equal(fixture.finished(),true,'CSS navigation has finished before the caller can close its context');
  assert.deepEqual(fixture.events[0],{kind:'goto',url:'https://owned.invalid/writing.html',options:{waitUntil:'load'}});
});
test('missing DOM is a bounded failure and still releases and drains the held navigation',async()=>{
  const h=helpers(),fixture=cssPage(h,{attachAt:selector=>selector==='footer'?Infinity:0});
  await assert.rejects(h.navigateDocument(fixture.page,'https://owned.invalid/research.html',fixture.release),/Controlled DOM deadline/);
  assert.equal(h.time(),3000);assert.equal(fixture.events.filter(event=>event.kind==='dom').length,61);
  assert.equal(fixture.events.some(event=>event.kind==='state'),false);
  assert.equal(fixture.released(),true);assert.equal(fixture.finished(),true);
});
test('painting either before valid CSS or during its hold remains a failure with navigation cleanup',async()=>{
  for(const paintAfterHold of [false,true]){
    const h=helpers(),fixture=cssPage(h,{paintAfterHold});
    if(!paintAfterHold)h.context.window.__quality.paints=1;
    await assert.rejects(h.navigateDocument(fixture.page,'https://owned.invalid/research.html',fixture.release),paintAfterHold?/no paint throughout the held CSS request/:/no paint before valid CSS/);
    assert.equal(fixture.released(),true);assert.equal(fixture.finished(),true);
    assert.equal(fixture.events.some(event=>event.kind==='hold'),paintAfterHold);
  }
});
test('an early DOM failure handles a later goto rejection and awaits it before returning',async()=>{
  const h=helpers(),domError=Error('DOM did not attach'),closed=Error('Target page, context or browser has been closed'),load=deferred();
  let released=false,returned=false,drained=false;
  const page={goto:()=>load.promise,waitForFunction:async()=>{throw domError;}};
  const pending=h.navigateDocument(page,'https://owned.invalid/credits.html',()=>{released=true;}).then(()=>{returned=true;},error=>{returned=true;assert.equal(error,domError);});
  await new Promise(resolve=>setImmediate(resolve));assert.equal(released,true);assert.equal(returned,false,'failure cannot return while goto remains pending');
  load.promise.then(()=>{drained=true;},()=>{drained=true;});load.reject(closed);
  await pending;assert.equal(drained,true);assert.equal(returned,true);
  // A real event-loop turn exposes any unhandled goto rejection to node:test.
  await new Promise(resolve=>setImmediate(resolve));
});
test('a failed actual navigation is still reported after releasing CSS, and ordinary navigation skips its hold',async()=>{
  const h=helpers(),navigationError=Error('Navigation timed out'),fixture=cssPage(h,{navigationError});
  await assert.rejects(h.navigateDocument(fixture.page,'https://owned.invalid/index.html',fixture.release),error=>error===navigationError);
  assert.equal(fixture.released(),true);assert.equal(fixture.finished(),true);
  let calls=0;
  await h.navigateDocument({goto:async()=>{calls++;}},'https://owned.invalid/talks.html');assert.equal(calls,1);
  await assert.rejects(h.navigateDocument({goto:async()=>{throw navigationError;}},'https://owned.invalid/talks.html'),error=>error===navigationError);
});
function cameraPage(h,change){
  h.attached.add('.space-scene');
  return {snapshot:()=>h.snapshot(),evaluate:async(fn,arg)=>fn(arg),async waitForFunction(fn,arg,options){
    assert.deepEqual(plain(options),{polling:50,timeout:2000});
    for(let elapsed=0;elapsed<=options.timeout;elapsed+=options.polling){h.setTime(elapsed);change(elapsed,h);if(fn(arg))return;}
    throw Error('Controlled forward response deadline');
  }};
}
test('native forward response waits beyond the old 180ms window for both scroll target and a changed camera',async()=>{
  const h=helpers(),travel={range:9000,target:2400,y:0};
  const page=cameraPage(h,(time,current)=>{current.context.scrollY=time<200?1200:2400;if(time>=450)current.scene.dataset.camera='journey';});
  const result=await h.forwardCamera(page,'opening',travel),probe=result.forwardResponse;
  assert.equal(result.camera,'journey');assert.equal(result.scrollY,2400);
  assert.equal(probe.status,'responded');assert.equal(probe.timeoutMs,2000);assert.equal(probe.elapsedMs,450);
  assert.equal(probe.baseline,'opening');assert.deepEqual(probe.travel,travel);
  assert.equal(probe.samples.length,10);assert.equal(probe.samples[0].y,1200);assert.equal(probe.samples[0].camera,'opening');assert.equal(probe.samples.at(-1).camera,'journey');
});
test('wrong native target or unchanged camera never passes, retaining every sample at the strict deadline',async()=>{
  for(const defect of ['target','camera']){
    const h=helpers(),page=cameraPage(h,(time,current)=>{current.context.scrollY=defect==='target'?2398:2400;current.scene.dataset.camera=defect==='camera'?'opening':'journey';current.context.window.__quality.paints=time/50;});
    await assert.rejects(h.forwardCamera(page,'opening',{range:9000,target:2400,y:2400}),/Controlled forward response deadline/);
    const probe=plain(h.context.window.__forwardCameraResponse);
    assert.equal(h.time(),2000);assert.equal(probe.status,'failed');assert.match(probe.error,/forward response deadline/);
    assert.equal(probe.timeoutMs,2000);assert.equal(probe.samples.length,41);assert.equal(probe.samples[0].time,0);assert.equal(probe.samples.at(-1).time,2000);
    assert.equal(probe.samples.at(-1).paints,40);assert.equal(probe.samples.at(-1).y,defect==='target'?2398:2400);
    assert.equal(probe.samples.at(-1).camera,defect==='camera'?'opening':'journey');
  }
});
test('forward response allows native subpixel rounding but does not demand travel on a short page',async()=>{
  const h=helpers(),page=cameraPage(h,(_time,current)=>{current.context.scrollY=2400.75;current.scene.dataset.camera='journey';});
  assert.equal((await h.forwardCamera(page,'opening',{range:9000,target:2400})).forwardResponse.status,'responded');
  const short=helpers();short.attached.add('.space-scene');
  const result=await short.forwardCamera({snapshot:()=>short.snapshot()},'opening',{range:1,target:1});
  assert.equal(result.camera,'opening');assert.equal(result.forwardResponse,null);
});
