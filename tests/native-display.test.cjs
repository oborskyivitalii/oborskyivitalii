'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events'),{start}=require('../tools/quality/native-display.cjs');
function fake(){const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.signals=[];child.kill=signal=>child.signals.push(signal);return child;}
test('only Linux WebKit starts one isolated local display and stops it after its lease',async()=>{
  for(const [engine,platform]of [['chromium','linux'],['firefox','linux'],['webkit','darwin'],['webkit','win32']])assert.equal(await start(engine,{platform,launch:()=>assert.fail('native engine must not start Xvfb')}),null);
  const child=fake(),calls=[];
  const pending=start('webkit',{platform:'linux',launch:(...args)=>{calls.push(args);return child;}});
  child.stdout.emit('data','12');child.stdout.emit('data','\n');const display=await pending;
  assert.equal(display.name,':12');assert.equal(display.port,'gtk');assert.equal(display.backend,'Xvfb');assert.equal(calls.length,1);
  assert.deepEqual(calls[0],['Xvfb',['-displayfd','1','-screen','0','1440x900x24','-nolisten','tcp'],{stdio:['ignore','pipe','pipe']}]);
  display.stop();assert.deepEqual(child.signals,['SIGTERM']);
});
test('an unavailable, early-exited or malformed display fails closed without browser fallback',async()=>{
  for(const kind of ['error','exit','malformed']){
    const child=fake(),pending=start('webkit',{platform:'linux',launch:()=>child});
    if(kind==='error')child.emit('error',Error('Xvfb missing'));
    else if(kind==='exit')child.emit('exit',1);
    else child.stdout.emit('data','not-a-display\n');
    await assert.rejects(pending,/Xvfb|Invalid/);assert.equal(child.signals.length,1);
  }
});
test('readiness honors the caller remaining startup deadline without warming a browser',async()=>{
  const child=fake();await assert.rejects(start('webkit',{platform:'linux',launch:()=>child,timeoutMs:10}),/readiness exceeded 10ms/);assert.equal(child.signals.length,1);
});
test('a cold display uses the existing 30s launch allowance instead of an extra 3s deadline',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const child=fake(),pending=start('webkit',{platform:'linux',launch:()=>child});
  t.mock.timers.tick(4000);assert.deepEqual(child.signals,[]);
  child.stdout.emit('data','12\n');const display=await pending;
  assert.equal(display.name,':12');display.stop();assert.deepEqual(child.signals,['SIGTERM']);
});
test('display preparation consumes the existing browser launch budget and never disables its timeout',()=>{
  const {remaining}=require('../tools/quality/native-display.cjs');
  assert.equal(remaining(100,30000,4100),26000);
  assert.equal(remaining(100,30000,30100-1),1);
  assert.throws(()=>remaining(100,30000,30100),/startup exceeded 30000ms/);
  assert.throws(()=>remaining(100,30000,31100),/startup exceeded 30000ms/);
});
test('a failed display retains server diagnostics before cleanup',async()=>{
  const child=fake(),pending=start('webkit',{platform:'linux',launch:()=>child,timeoutMs:10});
  child.stderr.emit('data','server connection failure');
  await assert.rejects(pending,error=>error.displayDiagnostics.stderr==='server connection failure'&&error.displayDiagnostics.stdout==='');
  assert.equal(child.signals.length,1);
});
