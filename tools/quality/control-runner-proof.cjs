'use strict';

// Native diagnostic only. These synthetic programs do not supply admission evidence.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const runner = require('./control-runner.cjs');
const sandbox = require('./control-runner-docker.cjs');
const root = path.resolve(__dirname, '../..');
async function prove(base, head, output) {
  const target = path.resolve(output);
  assert.ok(path.relative(root, target).startsWith('..' + path.sep), 'outside report required');
  fs.mkdirSync(target, { recursive: true });
  const report = {
    kind: 'control-runner-native-proof',
    pass: false,
    producer: runner.producer(),
    execution: {
      runId: process.env.GITHUB_RUN_ID || null,
      attempt: process.env.GITHUB_RUN_ATTEMPT || null,
    },
    cases: [],
    errors: [],
    authority: { merge: false, deploy: false, issueAppCheck: false, reuseEvidence: false },
  };
  const host = fs.mkdtempSync(path.join(os.tmpdir(), 'control-runner-host-'));
  const sentinel = path.join(host, 'canary');
  fs.writeFileSync(sentinel, 'synthetic host sentinel');
  let connections = 0;
  const listener = net.createServer((socket) => {
    connections++;
    socket.destroy();
  });
  await new Promise((resolve, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', resolve);
  });
  const store = (name, value) => {
    const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n');
    fs.writeFileSync(path.join(target, name + '.json'), bytes, { flag: 'wx' });
    return { file: name + '.json', sha256: sandbox.digest(bytes) };
  };
  function synthetic(id, source, expected, blocked = false) {
    const bytes = Buffer.from(source);
    const execution = sandbox.execute(bytes, []);
    const receipt = store(id, execution);
    const pass =
      execution.executed &&
      execution.cleanupVerified &&
      (blocked
        ? execution.state === 'blocked'
        : execution.state === 'executed' &&
          Buffer.from(execution.stdout, 'base64').equals(Buffer.from(expected)));
    report.cases.push({
      id,
      synthetic: true,
      moduleSha256: sandbox.digest(bytes),
      pass,
      ...receipt,
    });
    assert.ok(pass, 'native case failed: ' + id);
    return execution;
  }
  try {
    const comparison = runner.assess(root, base, head);
    report.cases.push({
      id: 'immutable-base-and-head',
      pass: comparison.state === 'observed',
      ...store('immutable-base-and-head', comparison),
    });
    assert.equal(comparison.state, 'observed', 'real immutable input probe failed');
    const statusNamespace = fs.readlinkSync('/proc/self/ns/net');
    synthetic(
      'filesystem-environment-and-kernel',
      `
      const a=require('node:assert/strict'),fs=require('node:fs');
      for(const p of [${JSON.stringify(sentinel)},${JSON.stringify(root)},
        '/var/run/docker.sock','/home/runner','/root','/.git'])a.equal(fs.existsSync(p),false,p);
      a.deepEqual(Object.keys(process.env).sort(),['HOME','HOSTNAME','LANG','PATH']);
      a.equal(process.env.HOSTNAME,'control-runner');
      a.equal(process.getuid(),65534);a.equal(process.getgid(),65534);
      a.notEqual(fs.readlinkSync('/proc/self/ns/net'),${JSON.stringify(statusNamespace)});
      const status=fs.readFileSync('/proc/self/status','utf8');
      a.match(status,/CapEff:\\s+0000000000000000/);
      a.match(status,/NoNewPrivs:\\s+1/);a.match(status,/Seccomp:\\s+2/);
      a.equal(fs.readFileSync('/sys/fs/cgroup/memory.max','utf8').trim(),'268435456');
      a.equal(fs.readFileSync('/sys/fs/cgroup/memory.swap.max','utf8').trim(),'0');
      a.equal(fs.readFileSync('/sys/fs/cgroup/pids.max','utf8').trim(),'32');
      a.equal(fs.readFileSync('/sys/fs/cgroup/cpu.max','utf8').trim(),'100000 100000');
      for(const p of ['/candidate.cjs','/driver.cjs','/outside'])
        a.throws(()=>fs.writeFileSync(p,'changed'));
      a.equal(fs.existsSync('/proc/1/root'+${JSON.stringify(sentinel)}),false);
      process.stdout.write('boundaries-denied\\n');process.exit(0);
    `,
      'boundaries-denied\n'
    );
    synthetic(
      'network-denial',
      `
      const a=require('node:assert/strict'),net=require('node:net'),os=require('node:os');
      a.deepEqual(Object.keys(os.networkInterfaces()),['lo']);
      const s=net.connect({host:'127.0.0.1',port:${listener.address().port}});
      s.on('connect',()=>process.exit(9));
      s.on('error',()=>{process.stdout.write('host-network-denied\\n');process.exit(0)});
      setTimeout(()=>process.exit(10),1000);
    `,
      '[]\nhost-network-denied\n'
    );
    synthetic(
      'scratch-and-shared-memory-bounds',
      `
      const a=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
      for(const [directory,limit] of [['/tmp',8],['/dev/shm',1]]){
        let denied=false;
        for(let i=0;i<=limit;i++)try{fs.writeFileSync(directory+'/f'+i,Buffer.alloc(1048576,1))}
          catch(e){a.equal(e.code,'ENOSPC');denied=true;break}
        a.equal(denied,true);for(const f of fs.readdirSync(directory))fs.unlinkSync(directory+'/'+f);
      }
      fs.writeFileSync('/tmp/executable','#!/bin/node\\nprocess.exit(0)',{mode:0o755});
      a.equal(cp.spawnSync('/tmp/executable',[]).error.code,'EACCES');
      process.stdout.write('scratch-bounded\\n');process.exit(0);
    `,
      'scratch-bounded\n'
    );
    synthetic(
      'pids-and-detached-descendants',
      `
      const a=require('node:assert/strict'),cp=require('node:child_process'),fs=require('node:fs');
      let denied=0;
      for(let i=0;i<48;i++){
        const child=cp.spawn('/bin/node',['-e','setInterval(()=>{},1000)'],
          {detached:true,stdio:'ignore'});
        child.on('error',e=>{if(e.code==='EAGAIN')denied++});child.unref();
      }
      setTimeout(()=>{a.ok(denied>0);a.ok(Number(fs.readFileSync('/sys/fs/cgroup/pids.current'))<=32);
        process.stdout.write('pids-bounded\\n');process.exit(0)},700);
    `,
      '[]\npids-bounded\n'
    );
    const memory = synthetic(
      'memory-limit',
      `const retained=[];
      while(true)retained.push(Buffer.alloc(8*1024*1024,1));`,
      '',
      true
    );
    assert.equal(memory.terminal?.OOMKilled, true, 'actual cgroup OOM observation required');
    const timeout = synthetic(
      'timeout-descendant-cleanup',
      `
      require('node:child_process').spawn('/bin/node',['-e','setInterval(()=>{},1000)'],
        {detached:true,stdio:'ignore'}).unref();while(true){}`,
      '',
      true
    );
    assert.equal(timeout.executionError, 'ETIMEDOUT');
    const flood = synthetic(
      'output-limit',
      `while(true)process.stdout.write('x'.repeat(65536));`,
      '',
      true
    );
    assert.equal(flood.executionError, 'ENOBUFS');
    const crash = synthetic('crash', 'process.exit(7);', '', true);
    assert.equal(crash.terminal?.ExitCode, 7);
    const fake = sandbox.execute(
      Buffer.from(`process.stdout.write(
      '{"state":"observed","pass":true,"total":10}\\n');process.exit(0);`),
      runner.requests()
    );
    const fakePass = fake.state === 'executed' && fake.cleanupVerified && !runner.evaluate(fake);
    report.cases.push({
      id: 'forged-success-rejected',
      pass: fakePass,
      ...store('forged-success-rejected', fake),
    });
    assert.ok(fakePass);
    const wrong = sandbox.execute(
      Buffer.from(`module.exports={canonical:()=> 'wrong',
      parse:()=>null,safePath:()=> 'wrong'};`),
      runner.requests()
    );
    const wrongPass =
      wrong.state === 'executed' && wrong.cleanupVerified && !runner.evaluate(wrong);
    report.cases.push({
      id: 'wrong-results-rejected',
      pass: wrongPass,
      ...store('wrong-results-rejected', wrong),
    });
    assert.ok(wrongPass);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(connections, 0, 'host listener reached');
    assert.equal(fs.readFileSync(sentinel, 'utf8'), 'synthetic host sentinel');
    assert.deepEqual(runner.producer(), report.producer, 'producer changed');
    report.pass = report.cases.length === 11 && report.cases.every((row) => row.pass);
  } catch (error) {
    report.errors.push(error.message);
  } finally {
    listener.close();
    fs.rmSync(host, { recursive: true, force: true });
    store('proof', report);
  }
  return report;
}
if (require.main === module) {
  assert.equal(
    process.argv.length,
    5,
    'usage: control-runner-proof.cjs BASE HEAD REPORT_DIRECTORY'
  );
  prove(...process.argv.slice(2))
    .then((report) => {
      console.log(
        JSON.stringify({ pass: report.pass, cases: report.cases.length, errors: report.errors })
      );
      process.exitCode = report.pass ? 0 : 1;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
module.exports = { prove };
