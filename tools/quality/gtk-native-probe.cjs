'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  { spawn } = require('node:child_process');
const probe = require('./gtk-target-probe.cjs'),
  lifecycle = require('./browser-lifecycle.cjs');
const COMMAND_MS = 30000,
  TEXT_LIMIT = 262144,
  POSTMORTEM_FILE_BYTES = 536870912;
const GDB_ARGUMENTS =
  "-nx -nh -batch -quiet -iex 'set auto-load off' -iex 'set debuginfod enabled off' -ex 'set pagination off' -ex 'bt 80' -ex 'thread apply all bt 20' -ex 'info sharedlibrary'";
function controls() {
  const cells = probe.plan('gtk');
  return [cells[1], cells[2], cells[3]];
}
function command(
  file,
  args,
  { launch = spawn, kill = (pid, signal) => process.kill(pid, signal), timeoutMs = COMMAND_MS } = {}
) {
  return new Promise((resolve) => {
    const stdout = probe.textCollector(TEXT_LIMIT),
      stderr = probe.textCollector(TEXT_LIMIT);
    let child,
      timer,
      finished = false,
      timedOut = false,
      groupKill = null;
    const finish = (code, signal, error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({
        command: file,
        args,
        pid: child?.pid || null,
        processGroup: child?.pid || null,
        code,
        signal,
        timedOut,
        groupKill,
        error: error ? { name: error.name, message: error.message, code: error.code } : null,
        stdout: stdout.snapshot(),
        stderr: stderr.snapshot(),
        timeoutMs,
      });
    };
    try {
      child = launch(file, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
        env: { ...process.env, LC_ALL: 'C', TZ: 'UTC', SYSTEMD_COLORS: '0' },
      });
    } catch (error) {
      finish(null, null, error);
      return;
    }
    child.stdout.on('data', (data) => stdout.add(data));
    child.stderr.on('data', (data) => stderr.add(data));
    child.once('error', (error) => finish(null, null, error));
    child.once('close', (code, signal) => finish(code, signal));
    timer = setTimeout(() => {
      timedOut = true;
      try {
        kill(-child.pid, 'SIGKILL');
        groupKill = { signal: 'SIGKILL', success: true };
      } catch (error) {
        groupKill = {
          signal: 'SIGKILL',
          success: false,
          error: { name: error.name, message: error.message, code: error.code },
        };
      }
      child.stdout.destroy();
      child.stderr.destroy();
      child.unref();
      finish(null, null);
    }, timeoutMs);
  });
}
function processRows(text) {
  return text
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/, 4))
    .filter((parts) => parts.length === 4 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]))
    .map(([pid, ppid, state, name]) => ({ pid: Number(pid), ppid: Number(ppid), state, name }));
}
function webProcesses(text, nodePid) {
  const rows = processRows(text),
    byPid = new Map(rows.map((row) => [row.pid, row]));
  const belongs = (row) => {
    const seen = new Set();
    while (row && !seen.has(row.pid)) {
      if (row.pid === nodePid) return true;
      seen.add(row.pid);
      row = byPid.get(row.ppid);
    }
    return false;
  };
  const browsers = rows.filter((row) => row.name === 'MiniBrowser' && belongs(row));
  assert.equal(browsers.length, 1, 'one current collector MiniBrowser lineage required');
  return rows.filter((row) => row.name === 'WebKitWebProces' && row.ppid === browsers[0].pid);
}
function bootIdHex(value) {
  assert.match(value, /^(?:[a-f0-9]{32}|[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12})$/);
  return value.replaceAll('-', '');
}
function processIdentity(
  pid,
  expectedExe,
  { read = (file) => fs.readFileSync(file, 'utf8'), link = (file) => fs.readlinkSync(file) } = {}
) {
  try {
    const executable = link('/proc/' + pid + '/exe'),
      stat = read('/proc/' + pid + '/stat'),
      startTicks = stat.slice(stat.lastIndexOf(')') + 2).split(/\s+/)[19],
      bootId = read('/proc/sys/kernel/random/boot_id').trim();
    assert.ok(stat.startsWith(pid + ' ('));
    assert.equal(executable, expectedExe);
    assert.match(startTicks || '', /^\d+$/);
    assert.match(bootId, /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/);
    return {
      pid,
      executable,
      startTicks,
      bootId,
      bootIdHex: bootIdHex(bootId),
      observedAt: new Date().toISOString(),
      verified: true,
    };
  } catch (error) {
    return {
      pid,
      expectedExe,
      verified: false,
      error: { name: error.name, message: error.message, code: error.code },
    };
  }
}
function coreInfo(text, selection) {
  const values = (label) =>
    [...text.matchAll(new RegExp('^\\s*' + label + ':\\s*(.*)$', 'gm'))].map((match) =>
      match[1].trim()
    );
  const pids = values('PID'),
    executables = values('Executable'),
    signals = values('Signal'),
    timestamps = values('Timestamp');
  assert.equal(pids.length, 1, 'exactly one core record required');
  assert.equal(Number(pids[0].split(/\s+/)[0]), selection.pid);
  assert.deepEqual(executables, [selection.executable]);
  assert.equal(signals.length, 1);
  assert.match(signals[0], /^\d+ \([A-Z0-9]+\)$/);
  assert.equal(timestamps.length, 1);
  assert.ok(
    Number(signals[0].split(' ')[0]) > 0 && Number(signals[0].split(' ')[0]) <= 64,
    'valid Linux signal required'
  );
  const stamp = timestamps[0].match(/^\w{3} (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) UTC(?:\s|$)/);
  assert.ok(stamp, 'UTC core timestamp required');
  const timestampMs = Date.parse(stamp[1] + 'T' + stamp[2] + 'Z');
  assert.ok(
    timestampMs >= Math.floor(Date.parse(selection.since) / 1000) * 1000 &&
      timestampMs <= Date.parse(selection.until),
    'core timestamp outside this native trial'
  );
  assert.deepEqual(values('Boot ID').map(bootIdHex), [bootIdHex(selection.bootId)]);
  return {
    pid: selection.pid,
    executable: selection.executable,
    signal: signals[0],
    timestamp: timestamps[0],
    trust: 'verified-exact-selector-metadata',
  };
}
async function captureCore(selection, { since, until, debuggerAvailable, run = command } = {}) {
  const filters = ['--no-pager', '--since=' + since, '--until=' + until],
    matches = [
      String(selection.pid),
      'COREDUMP_EXE=' + selection.executable,
      '_BOOT_ID=' + bootIdHex(selection.bootId),
    ];
  const result = {
    selection: { ...selection, since, until },
    trust: 'untrusted-native-diagnostic-output',
    complete: false,
    info: await run('coredumpctl', [...filters, 'info', ...matches]),
  };
  if (result.info.code !== 0 || result.info.timedOut) {
    result.unavailable = 'core-info-failed';
    return result;
  }
  if (result.info.stdout.droppedBytes || result.info.stderr.droppedBytes) {
    result.unavailable = 'truncated-core-info';
    return result;
  }
  try {
    result.verifiedInfo = coreInfo(result.info.stdout.text, result.selection);
  } catch (error) {
    result.unavailable = 'unverified-core-info';
    result.validationError = { name: error.name, message: error.message };
    return result;
  }
  if (!debuggerAvailable) {
    result.unavailable = 'debugger-unavailable';
    return result;
  }
  result.postmortemFileLimitBytes = POSTMORTEM_FILE_BYTES;
  result.debug = await run('prlimit', [
    '--fsize=' + POSTMORTEM_FILE_BYTES + ':' + POSTMORTEM_FILE_BYTES,
    '--',
    'coredumpctl',
    ...filters,
    '--debugger=/usr/bin/gdb',
    '--debugger-arguments=' + GDB_ARGUMENTS,
    'debug',
    ...matches,
  ]);
  result.complete =
    result.debug.code === 0 &&
    !result.debug.timedOut &&
    result.debug.stdout.droppedBytes === 0 &&
    result.debug.stderr.droppedBytes === 0 &&
    result.info.stdout.droppedBytes === 0 &&
    result.info.stderr.droppedBytes === 0;
  result.stackFramesRetained = /^#0\s/m.test(
    result.debug.stdout.text + '\n' + result.debug.stderr.text
  );
  return result;
}
function trialDiagnostics({
  expectedExe,
  debuggerAvailable,
  nodePid = process.pid,
  collect = probe.nativeObservation,
  run = command,
  identify = processIdentity,
  observe = lifecycle.observe,
}) {
  let events, beforeEvaluation;
  const startedAt = new Date().toISOString();
  return {
    observe(options) {
      events = observe(options);
      return events;
    },
    async collect(stage, options) {
      const pending = collect(stage, { ...options, since: startedAt });
      if (stage === 'after-load-before-first-evaluation')
        beforeEvaluation = pending.then((snapshot) => {
          try {
            snapshot.webProcesses = webProcesses(snapshot.processTree.stdout.text, nodePid).map(
              (row) => ({ ...row, identity: identify(row.pid, expectedExe) })
            );
          } catch (error) {
            snapshot.processSelectionError = { name: error.name, message: error.message };
          }
          return snapshot;
        });
      const snapshot = await (stage === 'after-load-before-first-evaluation'
        ? beforeEvaluation
        : pending);
      if (stage !== 'after-failure') return snapshot;
      if (
        !events
          ?.snapshot()
          .events.some((event) => event.kind === 'page-crash' && event.stage === 'first-evaluation')
      ) {
        snapshot.offlineCore = { complete: false, skipped: 'no-native-page-crash' };
        return snapshot;
      }
      const before = await beforeEvaluation,
        candidates = before?.webProcesses?.filter((row) => row.identity.verified) || [];
      if (candidates.length !== 1) {
        snapshot.offlineCore = {
          complete: false,
          unavailable: 'missing-or-ambiguous-verified-pre-evaluation-process',
          candidates,
          selectionError: before?.processSelectionError,
        };
        return snapshot;
      }
      try {
        snapshot.offlineCore = await captureCore(candidates[0].identity, {
          since: startedAt,
          until: new Date().toISOString(),
          debuggerAvailable,
          run,
        });
      } catch (error) {
        snapshot.offlineCore = {
          complete: false,
          unavailable: 'offline-collector-failed',
          error: { name: error.name, message: error.message, stack: error.stack },
        };
      }
      return snapshot;
    },
  };
}
async function main(input, output) {
  let debuggerAvailable = false;
  return probe.main('gtk', input, output, {
    plannedCells: controls(),
    kind: 'gtk-native-offline-core-attribution',
    reportFile: 'gtk-native.json',
    async prepare(record) {
      const gdb = await command('/usr/bin/gdb', ['--version']),
        coredumpctl = await command('coredumpctl', ['--version']),
        prlimit = await command('prlimit', ['--version']);
      debuggerAvailable = gdb.code === 0 && !gdb.timedOut;
      record.offlineDiagnostics = {
        commandMs: COMMAND_MS,
        textLimitBytes: TEXT_LIMIT,
        gdbArguments: GDB_ARGUMENTS,
        gdb,
        coredumpctl,
        prlimit,
        debuggerAvailable,
        trust: 'untrusted-native-diagnostic-output',
        nativeCaptureComplete: false,
      };
    },
    trialDeps({ pw }) {
      return trialDiagnostics({
        expectedExe: path.join(
          path.dirname(pw.webkit.executablePath()),
          'minibrowser-gtk/bin/WebKitWebProcess'
        ),
        debuggerAvailable,
      });
    },
    finalize(record) {
      const crashes = record.rows.filter((row) =>
        row.lifecycle?.events.some(
          (event) => event.kind === 'page-crash' && event.stage === 'first-evaluation'
        )
      );
      record.offlineDiagnostics.nativeCrashRows = crashes.length;
      record.offlineDiagnostics.nativeCaptureComplete =
        crashes.length > 0 &&
        crashes.every(
          (row) =>
            row.nativeAfterFailure?.offlineCore?.complete &&
            row.nativeAfterFailure.offlineCore.stackFramesRetained
        );
    },
  });
}
if (require.main === module)
  main(...process.argv.slice(2).map((value) => path.resolve(value))).catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = {
  controls,
  command,
  webProcesses,
  bootIdHex,
  processIdentity,
  coreInfo,
  captureCore,
  trialDiagnostics,
  main,
  GDB_ARGUMENTS,
  COMMAND_MS,
  TEXT_LIMIT,
  POSTMORTEM_FILE_BYTES,
};
