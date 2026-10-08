'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  { EventEmitter } = require('node:events');
const native = require('../tools/quality/gtk-native-probe.cjs'),
  probe = require('../tools/quality/gtk-target-probe.cjs');
const exe = '/pinned/webkit-2359/minibrowser-gtk/bin/WebKitWebProcess',
  boot = '12345678-1234-1234-1234-123456789abc',
  selection = { pid: 250, executable: exe, bootId: boot, startTicks: '77', verified: true },
  range = { since: '2026-10-06T18:00:00.200Z', until: '2026-10-06T18:00:30.200Z' };
const tree =
  ' PID PPID STAT COMMAND\n90 1 Sl MainThread\n101 90 Ss bash\n200 101 Sl MiniBrowser\n250 200 SLl WebKitWebProces\n251 200 Sl WebKitNetworkPr\n300 1 Sl MiniBrowser\n350 300 Sl WebKitWebProces\n';
// systemd v255 print_info emits journal _BOOT_ID verbatim as 32 hex digits;
// /proc/sys/kernel/random/boot_id uses UUID hyphens for the same 128 bits.
const info = `           PID: 250 (WebKitWebProces)\n        Signal: 6 (ABRT)\n     Timestamp: Tue 2026-10-06 18:00:15 UTC (1s ago)\n    Executable: ${exe}\n       Boot ID: ${boot.replaceAll('-', '')}\n`;
const text = (value) => ({
  text: value,
  bytes: Buffer.byteLength(value),
  retainedBytes: Buffer.byteLength(value),
  droppedBytes: 0,
  limitBytes: native.TEXT_LIMIT,
});
const result = (value) => ({
  code: 0,
  signal: null,
  timedOut: false,
  error: null,
  stdout: text(value),
  stderr: text(''),
});
test('exact three fresh constant GTK controls preserve original setup and put the aborting full-off cell last', () => {
  const cells = probe.plan('gtk');
  assert.deepEqual(native.controls(), [cells[1], cells[2], cells[3]]);
  assert.ok(
    native
      .controls()
      .every((cell) => cell.originalInit && cell.evaluation === 'constant' && cell.port === 'gtk')
  );
  assert.equal(probe.STARTUP_MS, 30000);
  assert.equal(probe.GOTO_MS, 30000);
  assert.equal(probe.COLLECTION_MS, 60000);
  assert.equal(probe.CLEANUP_MS, 30000);
  assert.equal(native.COMMAND_MS, 30000);
});
test('only the current collector MiniBrowser child WebProcess is selected, never another browser or newest core', () => {
  assert.deepEqual(native.webProcesses(tree, 90), [
    { pid: 250, ppid: 200, state: 'SLl', name: 'WebKitWebProces' },
  ]);
  assert.throws(() => native.webProcesses(tree, 777));
  assert.throws(() => native.webProcesses(tree + '400 90 Sl MiniBrowser\n', 90));
});
test('the after-load process identity retains exact executable, start ticks and boot without changing limits', () => {
  const stat = '250 (WebKitWebProces) ' + [...Array(19).fill('0'), '77', '0'].join(' '),
    reads = [];
  const observed = native.processIdentity(250, exe, {
    link(file) {
      assert.equal(file, '/proc/250/exe');
      return exe;
    },
    read(file) {
      reads.push(file);
      return file.endsWith('/stat') ? stat : boot + '\n';
    },
  });
  assert.equal(observed.verified, true);
  assert.equal(observed.startTicks, '77');
  assert.equal(observed.bootId, boot);
  assert.equal(observed.bootIdHex, boot.replaceAll('-', ''));
  assert.deepEqual(reads, ['/proc/250/stat', '/proc/sys/kernel/random/boot_id']);
  assert.equal(
    native.processIdentity(250, exe, { link: () => '/wrong/process', read: () => stat }).verified,
    false
  );
  assert.equal(
    native.processIdentity(250, exe, {
      link() {
        throw Object.assign(Error('gone'), { code: 'ENOENT' });
      },
    }).error.code,
    'ENOENT'
  );
});
test('untrusted core metadata requires exactly this PID executable boot and trial-time record with a real signal', () => {
  assert.equal(native.coreInfo(info, { ...selection, ...range }).signal, '6 (ABRT)');
  assert.equal(native.bootIdHex(boot), native.bootIdHex(boot.replaceAll('-', '')));
  assert.throws(() => native.bootIdHex('malformed'));
  for (const bad of [
    info + info,
    info.replace('250 (', '350 ('),
    info.replace(exe, '/wrong/executable'),
    info.replace(boot.replaceAll('-', ''), '22345678123412341234123456789abc'),
    info.replace('18:00:15', '17:59:59'),
    info.replace('6 (ABRT)', 'unknown'),
    info.replace('Boot ID:', 'Wrong ID:'),
  ])
    assert.throws(() => native.coreInfo(bad, { ...selection, ...range }));
});
test('offline debug runs only after exact info validation and uses identical PID/executable/time/boot selectors and early safe flags', async () => {
  const calls = [],
    run = async (file, args) => {
      calls.push({ file, args });
      return result(file === 'coredumpctl' ? info : '#0 abort ()\n#1 nativeRoutine ()\n');
    };
  const captured = await native.captureCore(selection, { ...range, debuggerAvailable: true, run });
  assert.equal(captured.complete, true);
  assert.equal(captured.stackFramesRetained, true);
  assert.equal(captured.trust, 'untrusted-native-diagnostic-output');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].file, 'prlimit');
  assert.equal(calls[1].args[0], '--fsize=536870912:536870912');
  for (const call of calls) {
    for (const arg of [
      '--since=' + range.since,
      '--until=' + range.until,
      '_BOOT_ID=' + boot.replaceAll('-', ''),
      '250',
      'COREDUMP_EXE=' + exe,
    ])
      assert.ok(call.args.includes(arg));
    assert.ok(call.args.every((arg) => !arg.startsWith('--boot')));
  }
  assert.ok(calls[1].args.includes('--debugger=/usr/bin/gdb'));
  const argv = calls[1].args.find((arg) => arg.startsWith('--debugger-arguments='));
  for (const required of [
    '-nx -nh -batch',
    "-iex 'set auto-load off'",
    "-iex 'set debuginfod enabled off'",
    "-ex 'bt 80'",
    "-ex 'thread apply all bt 20'",
    "-ex 'info sharedlibrary'",
  ])
    assert.ok(argv.includes(required));
  assert.ok(argv.indexOf("'bt 80'") < argv.indexOf("'thread apply all bt 20'"));
  assert.doesNotMatch(argv, /\b(?:attach|run|continue|shell)\b/);
});
test('missing debugger still retains core info; ambiguous/nonzero/timed-out/truncated output never becomes complete', async () => {
  let count = 0;
  const run = async () => {
    count++;
    return result(info);
  };
  const absent = await native.captureCore(selection, { ...range, debuggerAvailable: false, run });
  assert.equal(count, 1);
  assert.equal(absent.unavailable, 'debugger-unavailable');
  assert.equal(absent.verifiedInfo.signal, '6 (ABRT)');
  const invalid = await native.captureCore(selection, {
    ...range,
    debuggerAvailable: true,
    run: async () => result(info + info),
  });
  assert.equal(invalid.complete, false);
  assert.equal(invalid.unavailable, 'unverified-core-info');
  let truncatedCalls = 0;
  const truncated = await native.captureCore(selection, {
    ...range,
    debuggerAvailable: true,
    run: async () => {
      truncatedCalls++;
      return { ...result(info), stdout: { ...text(info), droppedBytes: 1 } };
    },
  });
  assert.equal(truncated.unavailable, 'truncated-core-info');
  assert.equal(truncatedCalls, 1);
  for (const change of [
    { code: 1 },
    { timedOut: true },
    { stdout: { ...text('#0 abort ()'), droppedBytes: 9 } },
  ]) {
    let calls = 0;
    const captured = await native.captureCore(selection, {
      ...range,
      debuggerAvailable: true,
      run: async () => (++calls === 1 ? result(info) : { ...result('#0 abort ()'), ...change }),
    });
    assert.equal(captured.complete, false);
  }
});
test('native crash keeps the primary observation while later core capture fails; held PID observation is awaited only after failure', async () => {
  const page = new EventEmitter(),
    context = new EventEmitter(),
    browser = new EventEmitter();
  page.isClosed = () => false;
  browser.isConnected = () => true;
  let release,
    calls = 0;
  const hooks = native.trialDiagnostics({
    expectedExe: exe,
    nodePid: 90,
    debuggerAvailable: true,
    identify: () => selection,
    collect: async (stage) =>
      stage === 'after-load-before-first-evaluation'
        ? new Promise((resolve) => (release = () => resolve({ processTree: result(tree) })))
        : { stage, processTree: result(tree) },
    run: async () => {
      calls++;
      return { ...result('permission denied'), code: 1 };
    },
  });
  const observer = hooks.observe({ page, context, browser });
  observer.stage('first-evaluation');
  const held = hooks.collect('after-load-before-first-evaluation', {});
  page.emit('crash');
  release();
  const after = await hooks.collect('after-failure', {});
  await held;
  assert.equal(calls, 1);
  assert.equal(after.offlineCore.complete, false);
  assert.equal(after.offlineCore.unavailable, 'core-info-failed');
  assert.equal(observer.snapshot().events[0].kind, 'page-crash');
  observer.dispose();
});
test('ordinary non-crash failures never invoke offline debugger/core inspection', async () => {
  const hooks = native.trialDiagnostics({
    expectedExe: exe,
    debuggerAvailable: true,
    collect: async (stage) => ({ stage }),
    run: async () => {
      throw Error('must not inspect');
    },
  });
  assert.equal(
    (await hooks.collect('after-failure', {})).offlineCore.skipped,
    'no-native-page-crash'
  );
});
test('the command deadline kills only its isolated process group and resolves even when a descendant holds stdout open', async () => {
  // A managed PID namespace can expose a /proc mount with host PIDs. Each
  // fixture reports its own /proc/self identity instead of guessing by child.pid.
  const descendantCode =
    "const fs=require('node:fs'); console.log(JSON.stringify({kind:'descendant',namespacePid:process.pid,procSelfStat:fs.readFileSync('/proc/self/stat','utf8')})); setInterval(()=>{},1000);";
  const childCode =
    "const fs=require('node:fs'); require('node:child_process').spawn(process.execPath,['-e'," +
    JSON.stringify(descendantCode) +
    "],{stdio:['ignore',process.stdout,process.stderr]}); console.log(JSON.stringify({kind:'parent',namespacePid:process.pid,procSelfStat:fs.readFileSync('/proc/self/stat','utf8')})); setInterval(()=>{},1000);";
  const procIdentity = (raw) => {
    const fields = raw
      .slice(raw.lastIndexOf(')') + 2)
      .trim()
      .split(/\s+/);
    return {
      pid: Number(raw.split(' ')[0]),
      state: fields[0],
      ppid: Number(fields[1]),
      pgrp: Number(fields[2]),
      session: Number(fields[3]),
      startTicks: fields[19],
    };
  };
  const captured = await native.command(process.execPath, ['-e', childCode], { timeoutMs: 400 });
  assert.equal(captured.timedOut, true);
  assert.equal(captured.groupKill.success, true);
  assert.equal(captured.groupKill.signal, 'SIGKILL');
  assert.equal(captured.signal, null);
  const observed = captured.stdout.text.trim().split('\n').map(JSON.parse),
    parent = observed.find((row) => row.kind === 'parent'),
    child = observed.find((row) => row.kind === 'descendant');
  assert.ok(parent && child, 'both fixture processes must report their own /proc identity');
  const parentProc = procIdentity(parent.procSelfStat),
    descendant = procIdentity(child.procSelfStat);
  assert.equal(parent.namespacePid, captured.pid);
  assert.equal(parentProc.pgrp, parentProc.pid);
  assert.equal(parentProc.session, parentProc.pid);
  assert.equal(descendant.ppid, parentProc.pid);
  assert.equal(descendant.pgrp, parentProc.pgrp);
  assert.equal(descendant.session, parentProc.session);
  assert.ok(descendant.pid > 0 && /^\d+$/.test(descendant.startTicks));
  const terminationDeadline = performance.now() + 1000;
  let terminated = false;
  while (performance.now() < terminationDeadline) {
    try {
      const current = procIdentity(fs.readFileSync('/proc/' + descendant.pid + '/stat', 'utf8'));
      terminated = current.state === 'Z' || current.startTicks !== descendant.startTicks;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      terminated = true;
    }
    if (terminated) break;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.equal(
    terminated,
    true,
    'the isolated debugger descendant must terminate within 1s of group SIGKILL'
  );
  const unavailable = await native.command('/missing/offline-debugger', []);
  assert.equal(unavailable.error.code, 'ENOENT');
  assert.equal(unavailable.timedOut, false);
});
test('raw diagnostic streams preserve exact byte and truncation counts without treating a dropped stack as complete', async () => {
  const captured = await native.command(process.execPath, [
    '-e',
    "process.stdout.write('x'.repeat(300000)); process.stderr.write('y'.repeat(300000));",
  ]);
  assert.equal(captured.code, 0);
  for (const stream of [captured.stdout, captured.stderr]) {
    assert.equal(stream.bytes, 300000);
    assert.equal(stream.retainedBytes, native.TEXT_LIMIT);
    assert.equal(stream.droppedBytes, 300000 - native.TEXT_LIMIT);
  }
});
