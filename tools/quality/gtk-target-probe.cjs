'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http'),
  crypto = require('node:crypto'),
  assert = require('node:assert/strict');
const { spawn } = require('node:child_process'),
  { performance } = require('node:perf_hooks');
const STARTUP_MS = 30000,
  GOTO_MS = 30000,
  COLLECTION_MS = 60000,
  CLEANUP_MS = 30000,
  TEXT_LIMIT = 65536;
const BLANK =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Private blank control</title></head><body><h1>Blank control</h1></body></html>\n';
function plan(port) {
  assert.ok(['gtk', 'wpe'].includes(port));
  const rows = ['blank-constant', 'color-constant', 'color-state'].flatMap((factor) =>
    [true, false].map((javaScriptEnabled) => ({
      id: factor + '-js-' + (javaScriptEnabled ? 'on' : 'off'),
      port,
      document: factor.startsWith('blank') ? 'blank' : 'color',
      evaluation: factor.endsWith('state') ? 'original-state' : 'constant',
      javaScriptEnabled,
      originalInit: true,
    }))
  );
  if (port === 'gtk')
    rows.push(
      { ...rows[1], id: 'blank-constant-js-off-no-init', originalInit: false },
      { ...rows[5], id: 'color-state-js-off-no-init', originalInit: false }
    );
  return rows;
}
function cleanSource(manifest, candidate) {
  assert.match(candidate || '', /^[a-f0-9]{40}$/);
  assert.equal(manifest.sourceCommit, candidate);
  assert.equal(manifest.candidateCommit, candidate);
  assert.equal(manifest.sourceDirty, false);
  assert.match(manifest.sourceTree || '', /^[a-f0-9]{40}$/);
  assert.match(manifest.artifactDigest || '', /^[a-f0-9]{64}$/);
  assert.equal(manifest.diagnostic, undefined);
  assert.notEqual(manifest.fullGate, false);
  return {
    sourceCommit: manifest.sourceCommit,
    sourceTree: manifest.sourceTree,
    candidateCommit: manifest.candidateCommit,
    sourceDirty: false,
    artifactDigest: manifest.artifactDigest,
  };
}
function identity(manifest, candidate, base) {
  const source = cleanSource(manifest, candidate),
    parent = cleanSource(base, candidate),
    derivation = manifest.derivation;
  assert.ok(derivation && typeof derivation === 'object');
  assert.deepEqual(Object.keys(derivation).sort(), ['baseArtifactDigest', 'kind']);
  assert.equal(derivation.kind, 'authored-color-effects');
  assert.match(derivation.baseArtifactDigest || '', /^[a-f0-9]{64}$/);
  assert.equal(base.derivation, undefined);
  assert.equal(parent.sourceTree, source.sourceTree);
  assert.equal(derivation.baseArtifactDigest, parent.artifactDigest);
  const baseVariant = base.components?.variant || base.variant;
  assert.equal(baseVariant?.id, 'base');
  assert.equal(baseVariant.contract, 1);
  assert.match(baseVariant.fingerprint || '', /^[a-f0-9]{64}$/);
  assert.equal(baseVariant.diagnostic, undefined);
  assert.match(base.components?.engine || '', /^[a-f0-9]{64}$/);
  if (base.components?.variant && base.variant)
    assert.deepEqual(base.components.variant, base.variant);
  const variant = manifest.components?.variant || manifest.variant;
  assert.equal(variant?.id, 'color');
  assert.equal(variant.contract, 1);
  assert.match(variant.fingerprint, /^[a-f0-9]{64}$/);
  assert.equal(variant.diagnostic, undefined);
  assert.equal(variant.baseEngine, base.components.engine);
  assert.deepEqual(variant.effects, ['ribbons', 'travel']);
  if (manifest.components?.variant && manifest.variant)
    assert.deepEqual(manifest.components.variant, manifest.variant);
  return { ...source, variant, derivation: { ...derivation } };
}
function originalInit(functional, cell) {
  const mode = cell.javaScriptEnabled ? 'normal' : 'no-js';
  return `(${functional.probe.toString()})();(${functional.capability.toString()})(${JSON.stringify(mode)});try{localStorage.setItem('vo.theme',"light");}catch{}`;
}
async function bounded(
  operation,
  timeoutMs = COLLECTION_MS,
  { schedule = setTimeout, cancel = clearTimeout, phase = 'first-evaluation' } = {}
) {
  let timer;
  const timeout = new Promise(
    (_, reject) =>
      (timer = schedule(() => {
        const error = Error('Diagnostic ' + phase + ' collection exceeded ' + timeoutMs + 'ms');
        error.name = phase === 'cleanup' ? 'CleanupTimeout' : 'CollectorTimeout';
        reject(error);
      }, timeoutMs))
  );
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    cancel(timer);
  }
}
function textCollector(limit = TEXT_LIMIT) {
  let bytes = 0,
    retainedBytes = 0;
  const chunks = [];
  return {
    add(value) {
      const data = Buffer.from(value);
      bytes += data.length;
      const keep = data.subarray(0, Math.max(0, limit - retainedBytes));
      if (keep.length) {
        chunks.push(keep);
        retainedBytes += keep.length;
      }
    },
    snapshot() {
      return {
        text: Buffer.concat(chunks).toString('utf8'),
        bytes,
        retainedBytes,
        droppedBytes: bytes - retainedBytes,
        limitBytes: limit,
      };
    },
  };
}
function command(file, args, { launch = spawn, timeoutMs = 3000 } = {}) {
  return new Promise((resolve) => {
    const stdout = textCollector(),
      stderr = textCollector();
    let timer,
      finished = false,
      timedOut = false;
    const finish = (code, signal, error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({
        command: file,
        args,
        code,
        signal,
        timedOut,
        error: error ? { name: error.name, message: error.message, code: error.code } : null,
        stdout: stdout.snapshot(),
        stderr: stderr.snapshot(),
      });
    };
    let child;
    try {
      child = launch(file, args, { stdio: ['ignore', 'pipe', 'pipe'] });
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
      child.kill('SIGKILL');
    }, timeoutMs);
  });
}
function readObservation(file) {
  try {
    const collector = textCollector();
    collector.add(fs.readFileSync(file));
    return { file, ...collector.snapshot() };
  } catch (error) {
    return { file, error: { name: error.name, message: error.message, code: error.code } };
  }
}
async function nativeObservation(stage, { kernel = false, since } = {}) {
  const result = {
    stage,
    observedAt: new Date().toISOString(),
    processTree: await command('ps', ['-eo', 'pid,ppid,stat,comm']),
  };
  if (kernel) {
    result.kernelJournal = await command('journalctl', ['-k', '-n', '80', '--no-pager']);
    result.kernelMessages = await command('dmesg', ['--ctime', '--level=err,warn']);
    result.coredumps = await command('coredumpctl', [
      'list',
      '--no-pager',
      '--no-legend',
      '--since',
      since,
    ]);
    try {
      const entries = fs.readdirSync('/var/crash');
      result.varCrash = {
        path: '/var/crash',
        entries: entries.slice(0, 100),
        entryCount: entries.length,
        droppedEntries: Math.max(0, entries.length - 100),
      };
    } catch (error) {
      result.varCrash = {
        path: '/var/crash',
        error: { name: error.name, message: error.message, code: error.code },
      };
    }
  }
  return result;
}
function captureStderr(output, limit = 262144) {
  const file = path.join(output, 'native-stderr.log'),
    fd = fs.openSync(file, 'w'),
    original = process.stderr.write;
  let bytes = 0,
    retainedBytes = 0;
  process.stderr.write = function (value, encoding, ...rest) {
    const data = Buffer.isBuffer(value)
      ? value
      : Buffer.from(value, typeof encoding === 'string' ? encoding : undefined);
    bytes += data.length;
    const keep = data.subarray(0, Math.max(0, limit - retainedBytes));
    if (keep.length) {
      fs.writeSync(fd, keep);
      retainedBytes += keep.length;
    }
    return original.call(this, value, encoding, ...rest);
  };
  return {
    snapshot() {
      return {
        path: file,
        bytes,
        retainedBytes,
        droppedBytes: bytes - retainedBytes,
        limitBytes: limit,
        sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
      };
    },
    stop() {
      process.stderr.write = original;
      fs.closeSync(fd);
    },
  };
}
async function serve(publicDir) {
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
  };
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
    if (pathname === '/__gtk_target_blank.html') {
      res
        .writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' })
        .end(BLANK);
      return;
    }
    const file = path.resolve(publicDir, '.' + pathname);
    if (!file.startsWith(publicDir + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const data = fs.readFileSync(file);
      res
        .writeHead(200, {
          'Content-Type': types[path.extname(file)] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        })
        .end(data);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, url: 'http://127.0.0.1:' + server.address().port };
}
async function cellTrial(cell, deps) {
  const {
    pw,
    native,
    functional,
    url,
    source,
    retain = () => {},
    observe = require('./browser-lifecycle.cjs').observe,
    collect = nativeObservation,
    first = bounded,
    close = (operation) => bounded(operation, CLEANUP_MS, { phase: 'cleanup' }),
    now = () => performance.now(),
    stderr = () => null,
    since = new Date().toISOString(),
  } = deps;
  const started = now(),
    row = {
      ...cell,
      fullGate: false,
      source,
      startedAt: new Date().toISOString(),
      bounds: {
        startupMs: STARTUP_MS,
        gotoMs: GOTO_MS,
        settleMs: 180,
        diagnosticFirstEvaluationMs: COLLECTION_MS,
        diagnosticCleanupMs: CLEANUP_MS,
      },
      evidenceValid: false,
      success: false,
      pageErrors: [],
      externalRequests: [],
      stderrBefore: stderr(),
    };
  let display, browser, context, page, lifecycle, beforeEvaluation, onPageError, onRequest;
  retain(row);
  try {
    if (cell.port === 'gtk') display = await native.start('webkit', { timeoutMs: STARTUP_MS });
    const options = {
      headless: cell.port === 'wpe',
      timeout: native.remaining(started, STARTUP_MS, now()),
      ...(display ? { env: { ...process.env, DISPLAY: display.name } } : {}),
    };
    browser = await pw.webkit.launch(options);
    row.browser = {
      version: browser.version(),
      executable: pw.webkit.executablePath(),
      port: cell.port,
      headless: options.headless,
      displayBackend: display?.backend || null,
      startup: {
        budgetMs: STARTUP_MS,
        displayMs: display?.elapsedMs || 0,
        totalMs: now() - started,
      },
    };
    context = await browser.newContext({
      viewport: { width: 320, height: 844 },
      colorScheme: 'light',
      javaScriptEnabled: cell.javaScriptEnabled,
      reducedMotion: 'no-preference',
    });
    if (cell.originalInit) await context.addInitScript({ content: originalInit(functional, cell) });
    page = await context.newPage();
    lifecycle = observe({ page, context, browser });
    onPageError = (error) => row.pageErrors.push(error.message);
    onRequest = (request) => {
      if (!request.url().startsWith(url)) row.externalRequests.push(request.url());
    };
    page.on('pageerror', onPageError);
    page.on('request', onRequest);
    row.nativeBefore = await collect('before-navigation', { since });
    lifecycle.stage('navigation');
    retain(row);
    await page.goto(
      url + (cell.document === 'blank' ? '/__gtk_target_blank.html' : '/index.html'),
      { waitUntil: 'load', timeout: GOTO_MS }
    );
    beforeEvaluation = collect('after-load-before-first-evaluation', { since });
    await page.waitForTimeout(180);
    lifecycle.stage('first-evaluation');
    row.firstEvaluationStartedAt = new Date().toISOString();
    row.evidenceValid = true;
    const evaluation =
      cell.evaluation === 'original-state' ? functional.state(page) : page.evaluate(() => 1);
    const pending = first(evaluation, COLLECTION_MS);
    retain(row);
    const value = await pending;
    row.result = { type: typeof value, value };
    row.success = true;
    row.lifecycle = lifecycle.snapshot();
  } catch (error) {
    if (error.name === 'CollectorTimeout') lifecycle?.stage('collector-timeout');
    row.error = { name: error.name, message: error.message, stack: error.stack };
    row.lifecycle = lifecycle?.snapshot() || null;
    retain(row);
    row.nativeAfterFailure = await collect('after-failure', { kernel: true, since });
  } finally {
    if (beforeEvaluation) row.nativeBeforeEvaluation = await beforeEvaluation;
    lifecycle?.stage('teardown');
    retain(row);
    try {
      if (browser) await close(browser.close());
    } catch (error) {
      row.cleanupError = { name: error.name, message: error.message, stack: error.stack };
    } finally {
      display?.stop();
      lifecycle?.dispose();
      if (page) {
        page.off('pageerror', onPageError);
        page.off('request', onRequest);
      }
      row.stderrAfter = stderr();
      row.elapsedMs = now() - started;
      retain(row);
    }
  }
  return row;
}
async function main(
  port,
  input,
  output,
  {
    plannedCells,
    kind = 'gtk-wpe-first-evaluation-attribution',
    reportFile = 'gtk-target.json',
    prepare = async () => {},
    trialDeps = () => ({}),
    finalize = () => {},
  } = {}
) {
  fs.mkdirSync(output, { recursive: true });
  const record = {
    schema: 1,
    kind,
    port,
    fullGate: false,
    performanceAcceptance: false,
    source: null,
    baseSource: null,
    phase: 'preflight',
    untrustedInput: { directory: input, trust: 'untrusted-observation', manifests: {} },
    startedAt: new Date().toISOString(),
    fixture: { document: BLANK, sha256: crypto.createHash('sha256').update(BLANK).digest('hex') },
    existingCorePattern: readObservation('/proc/sys/kernel/core_pattern'),
    existingProcessLimits: readObservation('/proc/self/limits'),
    plan: [],
    rows: [],
    errors: [],
    collectionComplete: false,
  };
  const capture = captureStderr(output),
    save = () => {
      record.stderr = capture.snapshot();
      fs.writeFileSync(path.join(output, reportFile), JSON.stringify(record, null, 2) + '\n');
    };
  save();
  let server;
  try {
    assert.equal(
      process.env.SITE_TEST_BASE_URL,
      undefined,
      'Only a private loopback source is allowed'
    );
    record.environment = require('./common.cjs').environment();
    const cells = plannedCells || plan(port);
    record.plan = cells;
    save();
    const readManifest = (name) => {
      const file = path.join(input, name),
        bytes = fs.readFileSync(file),
        rawFile = path.join(output, 'untrusted-' + name);
      fs.writeFileSync(rawFile, bytes);
      record.untrustedInput.manifests[name] = {
        path: file,
        retainedPath: rawFile,
        bytes: bytes.length,
        sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      };
      save();
      const parsed = JSON.parse(bytes);
      record.untrustedInput.manifests[name].parsed = parsed;
      save();
      return parsed;
    };
    const manifest = readManifest('artifact.json'),
      base = readManifest('base-artifact.json'),
      publicDir = path.join(input, 'public');
    require('./artifact.cjs').verify(publicDir, manifest);
    const source = identity(manifest, process.env.SITE_CANDIDATE_SHA, base);
    record.source = source;
    record.baseSource = {
      ...cleanSource(base, process.env.SITE_CANDIDATE_SHA),
      variant: base.components?.variant || base.variant,
      engine: base.components.engine,
    };
    record.phase = 'collection';
    save();
    const serving = await serve(publicDir);
    server = serving.server;
    const url = serving.url;
    const functional = require('./functional.cjs'),
      pw = require('./common.cjs').toolRequire('playwright'),
      native = require('./native-display.cjs');
    await prepare(record);
    save();
    let priorCleanupIncomplete = false;
    for (const [index, cell] of cells.entries()) {
      const row = await cellTrial(cell, {
        pw,
        native,
        functional,
        url,
        source,
        since: record.startedAt,
        stderr: () => capture.snapshot(),
        ...trialDeps({ cell, pw, record }),
        retain(row) {
          row.priorCleanupIncomplete = priorCleanupIncomplete;
          record.rows[index] = row;
          save();
        },
      });
      if (row.cleanupError) priorCleanupIncomplete = true;
    }
    record.collectionComplete =
      record.rows.length === cells.length &&
      record.rows.every(
        (row) => row.evidenceValid && !row.cleanupError && !row.priorCleanupIncomplete
      );
    finalize(record);
    assert.equal(
      record.collectionComplete,
      true,
      'Every planned first evaluation must produce an uncontaminated retained observation'
    );
    record.phase = 'complete';
    save();
  } catch (error) {
    record.errors.push({
      phase: record.phase,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    record.phase = 'failed';
    save();
    throw error;
  } finally {
    server?.close();
    save();
    capture.stop();
  }
}
if (require.main === module)
  main(process.argv[2], ...process.argv.slice(3).map((value) => path.resolve(value))).catch(
    (error) => {
      console.error(error.stack);
      process.exitCode = 1;
    }
  );
module.exports = {
  plan,
  identity,
  originalInit,
  bounded,
  textCollector,
  command,
  nativeObservation,
  cellTrial,
  serve,
  main,
  BLANK,
  STARTUP_MS,
  GOTO_MS,
  COLLECTION_MS,
  CLEANUP_MS,
};
