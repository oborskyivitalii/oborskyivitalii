'use strict';
// Explicit historical ribbon-enabled comparisons only. Active Color has no ribbons.
// Private loopback observations preserve failed browser gates as failed data.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process'),
  zlib = require('node:zlib');
const { performance } = require('node:perf_hooks'),
  artifact = require('./artifact.cjs');
const variant = (manifest) => require('./common.cjs').variant(manifest);
const labels = { control: 'browser-gate-fixed-ribbons', adaptive: 'browser-gate-trace' },
  runBudgetMs = 12 * 60 * 1000;

function argumentsFor(argv) {
  assert.equal(argv.length, 6, 'exact --control, --adaptive and --output paths required');
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    assert.ok(['--control', '--adaptive', '--output'].includes(key), 'unknown diagnostic argument');
    assert.ok(!result[key.slice(2)], 'duplicate diagnostic argument');
    assert.ok(argv[index + 1] && !argv[index + 1].startsWith('--'), 'missing diagnostic path');
    result[key.slice(2)] = path.resolve(argv[index + 1]);
  }
  assert.equal(Object.keys(result).length, 3, 'all diagnostic paths required');
  assert.notEqual(result.control, result.adaptive, 'distinct diagnostic inputs required');
  for (const input of [result.control, result.adaptive])
    assert.ok(
      result.output !== input && !result.output.startsWith(input + path.sep),
      'output cannot modify an input artifact'
    );
  return result;
}
function plan() {
  const target = (id, engine, label, route, theme, scope, role = 'target') => ({
    id,
    engine,
    label,
    route,
    theme,
    scope,
    role,
    width: 1440,
    height: 900,
    mode: 'normal',
    trace: true,
  });
  const groups = [0, 1].map((index) => ({
    id: 'webkit-startup-' + index,
    mode: 'startup',
    rows: [target('webkit-startup-' + index, 'webkit', 'control', 'index', 'light', 'startup')],
  }));
  for (const [mode, order] of [
    ['alone', ['control', 'adaptive']],
    ['loaded', ['adaptive', 'control']],
  ])
    for (const label of order) {
      const id = 'firefox-' + mode + '-' + label,
        rows = [target(id, 'firefox', label, 'writing', 'dark', 'functional')];
      if (mode === 'loaded')
        for (const engine of ['chromium', 'webkit'])
          rows.push(
            target(
              id + '-' + engine,
              engine,
              'control',
              'index',
              'light',
              'functional',
              'background'
            )
          );
      groups.push({ id, mode, rows });
    }
  return groups;
}
function validateManifest(manifest, label, candidate) {
  assert.equal(manifest.sourceDirty, false, 'diagnostic source must be clean');
  assert.equal(
    manifest.sourceCommit,
    candidate,
    'historical diagnostic source differs from exact pinned reference'
  );
  assert.equal(manifest.candidateCommit, candidate, 'diagnostic candidate/source mismatch');
  assert.match(manifest.sourceTree || '', /^[a-f0-9]{40}$/, 'invalid source tree');
  assert.match(manifest.artifactDigest || '', /^[a-f0-9]{64}$/, 'invalid artifact digest');
  const visual = variant(manifest),
    derivation = manifest.derivation;
  assert.equal(visual.id, 'color');
  assert.deepEqual(
    visual.effects,
    ['ribbons', 'travel'],
    'explicit historical ribbon-enabled Color required'
  );
  assert.equal(
    manifest.components.engine,
    visual.fingerprint,
    'revision/variant fingerprint mismatch'
  );
  assert.equal(manifest.fullGate, false);
  assert.equal(manifest.diagnostic?.fullGate, false);
  assert.equal(visual.diagnostic?.fullGate, false);
  assert.equal(manifest.diagnostic.label, labels[label]);
  assert.equal(visual.diagnostic.label, labels[label]);
  assert.equal(derivation?.kind, 'writing-diagnostic-intervention');
  assert.equal(derivation.intervention, labels[label]);
  assert.equal(derivation.fullGate, false);
  assert.match(derivation.parentArtifactDigest || '', /^[a-f0-9]{64}$/);
  assert.equal(derivation.baseArtifactDigest, derivation.parentArtifactDigest);
  assert.equal(derivation.parentVariant?.id, 'color');
  assert.equal(derivation.parentVariant.contract, 1);
  assert.ok(!derivation.parentVariant.diagnostic, 'unchanged historical Color parent required');
  assert.match(derivation.parentVariant.fingerprint || '', /^[a-f0-9]{64}$/);
  assert.match(derivation.parentVariant.baseEngine || '', /^[a-f0-9]{64}$/);
  assert.deepEqual(derivation.parentVariant.effects, ['ribbons', 'travel']);
  assert.equal(visual.baseEngine, derivation.parentVariant.baseEngine);
  assert.equal(
    derivation.patches?.length,
    label === 'control' ? 3 : 2,
    'exact declared patch count required'
  );
  for (const patch of derivation.patches) {
    assert.equal(patch.file, 'space.js');
    assert.equal(patch.matches, 1, 'private patch must match exactly once');
    for (const key of ['needleSha256', 'replacementSha256', 'beforeSha256', 'afterSha256'])
      assert.match(patch[key] || '', /^[a-f0-9]{64}$/, 'missing exact patch checksum');
  }
  assert.equal(
    visual.fingerprint,
    artifact.digest(
      JSON.stringify({
        contract: 1,
        parentEngine: derivation.parentVariant.fingerprint,
        intervention: derivation,
      })
    ),
    'derived fingerprint does not prove declared patches'
  );
}
function validateInputs(inputs, candidate) {
  assert.match(candidate || '', /^[a-f0-9]{40}$/, 'exact historical reference SHA required');
  for (const label of Object.keys(labels)) {
    assert.ok(inputs[label]?.manifest, 'missing diagnostic artifact ' + label);
    validateManifest(inputs[label].manifest, label, candidate);
  }
  const control = inputs.control.manifest,
    adaptive = inputs.adaptive.manifest;
  assert.equal(control.sourceTree, adaptive.sourceTree, 'diagnostic source trees differ');
  assert.equal(
    control.derivation.parentArtifactDigest,
    adaptive.derivation.parentArtifactDigest,
    'diagnostics have different Color parents'
  );
  assert.deepEqual(
    control.derivation.parentVariant,
    adaptive.derivation.parentVariant,
    'diagnostics have different normal variants'
  );
  assert.notEqual(control.artifactDigest, adaptive.artifactDigest, 'adaptive bytes unchanged');
  assert.notEqual(
    variant(control).fingerprint,
    variant(adaptive).fingerprint,
    'adaptive identity unchanged'
  );
  return true;
}
function validateDraw(probe) {
  assert.ok(
    Number.isFinite(probe.renderCost) && probe.renderCost >= 0,
    'invalid actual draw duration'
  );
  for (const key of ['slow', 'fast', 'tier', 'detailTier', 'ribbonFaces', 'ribbonSignals'])
    assert.ok(
      Number.isFinite(probe[key]) && probe[key] >= 0,
      'missing draw/quality counter ' + key
    );
  assert.equal(typeof probe.hold, 'boolean', 'missing actual draw hold state');
}
function validateTrace(trace) {
  assert.equal(trace?.installed, true, 'missing diagnostic trace');
  assert.equal(trace.overflow, false, 'diagnostic trace overflow');
  assert.equal(trace.completeRetention, true, 'incomplete trace retention');
  assert.equal(trace.droppedEvents, 0);
  assert.ok(Array.isArray(trace.events) && trace.events.length > 0, 'missing raw trace events');
  assert.equal(trace.recordedEvents, trace.events.length);
  assert.equal(trace.totalEvents, trace.events.length);
  assert.equal(trace.events[0].kind, 'installed', 'missing trace installation event');
  assert.ok(Array.isArray(trace.pendingIds), 'missing live pending RAF IDs');
  assert.ok(trace.state?.scheduler, 'missing private scheduler state');
  assert.ok(!trace.state.schedulerError, 'private scheduler getter failed');
  for (const key of ['hold', 'enabled', 'initialized', 'failed'])
    assert.equal(typeof trace.state.scheduler[key], 'boolean', 'missing scheduler ' + key);
  for (const key of ['slow', 'fast', 'tier', 'detailTier', 'costAverage'])
    assert.ok(Number.isFinite(trace.state.scheduler[key]), 'missing scheduler ' + key);
  for (const [index, event] of trace.events.entries()) {
    assert.equal(event.sequence, index + 1, 'missing trace sequence');
    assert.ok(Number.isFinite(event.time), 'invalid trace clock');
    assert.ok(
      event.state && Array.isArray(event.state.pendingIds),
      'missing event scheduler/pending state'
    );
    assert.ok(!event.state.schedulerError, 'private scheduler getter failed');
    if (event.kind === 'exit')
      assert.ok(
        Number.isFinite(event.duration) && event.duration >= 0,
        'invalid actual callback duration'
      );
    if (event.probe?.kind === 'browser-gate-frame') validateDraw(event.probe);
  }
  return true;
}
function stats(values) {
  if (!values.length)
    return { count: 0, min: null, median: null, p95: null, max: null, values: [] };
  const sorted = [...values].sort((a, b) => a - b),
    middle = Math.floor(sorted.length / 2);
  return {
    count: values.length,
    min: sorted[0],
    median: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
    p95: sorted[Math.ceil(sorted.length * 0.95) - 1],
    max: sorted.at(-1),
    values,
  };
}
function summarizeTrace(trace) {
  validateTrace(trace);
  const draws = trace.events
    .filter((event) => event.probe?.kind === 'browser-gate-frame')
    .map((event) => ({ time: event.time, ...event.probe }));
  const callbacks = trace.events.filter((event) => event.kind === 'exit'),
    counts = {};
  let hold = null;
  const holdTransitions = [];
  for (const event of trace.events) {
    counts[event.kind] = (counts[event.kind] || 0) + 1;
    const observed = event.state.scheduler?.hold;
    if (typeof observed === 'boolean' && observed !== hold) {
      holdTransitions.push({
        time: event.time,
        hold: observed,
        pending: event.state.scheduler.pending,
      });
      hold = observed;
    }
  }
  return {
    events: counts,
    drawDurationMs: stats(draws.map((row) => row.renderCost)),
    callbackDurationMs: stats(callbacks.map((row) => row.duration)),
    ribbonFaces: stats(draws.map((row) => row.ribbonFaces)),
    ribbonSignals: stats(draws.map((row) => row.ribbonSignals)),
    qualityFrames: draws,
    holdTransitions,
    finalScheduler: trace.state.scheduler,
    finalPendingIds: trace.pendingIds,
    finalState: trace.state,
    scope:
      'Instrumented JavaScript draw/RAF observations; no display FPS or uninstrumented performance acceptance.',
  };
}
function validateOutcome(observation) {
  assert.equal(typeof observation?.pass, 'boolean', 'missing original fixture disposition');
  if (!observation.pass)
    assert.ok(
      typeof observation.error === 'string' && observation.error.length,
      'failed fixture error suppressed'
    );
  if (observation.pass) {
    assert.equal(
      observation.checks?.positiveProbe,
      true,
      'passed fixture omitted its positive paint gate'
    );
    assert.deepEqual(observation.errors, [], 'page errors suppressed');
    assert.deepEqual(observation.externalRequests, [], 'external request failures suppressed');
  }
  validateTrace(observation.diagnosticTrace);
  return true;
}
async function startup(browser, url, settings, output) {
  const functional = require('./functional.cjs'),
    trace = require('./browser-gate-trace.cjs');
  const context = await browser.newContext({
    viewport: { width: settings.width, height: settings.height },
    colorScheme: settings.theme,
    javaScriptEnabled: true,
    reducedMotion: 'no-preference',
  });
  const theme =
    'try{localStorage.setItem("vo.theme",' + JSON.stringify(settings.theme) + ');}catch{}';
  await context.addInitScript({
    content:
      '(' +
      functional.probe.toString() +
      ')();(' +
      functional.capability.toString() +
      ')("normal");' +
      theme +
      '(' +
      trace.install.toString() +
      ')();',
  });
  const page = await context.newPage(),
    errors = [],
    external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith(url)) external.push(request.url());
  });
  try {
    await functional.navigateDocument(page, url + '/' + settings.route + '.html');
    const checks = await functional.normalStartup(page);
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    return {
      ...settings,
      pass: true,
      checks,
      errors,
      externalRequests: external,
      diagnosticTrace: await page.evaluate(() => window.__browserGateTrace.snapshot()),
    };
  } catch (error) {
    await page.screenshot({ path: path.join(output, settings.id + '.png') }).catch(() => {});
    return {
      ...settings,
      pass: false,
      error: error.message,
      stack: error.stack,
      state: await functional.state(page).catch(() => null),
      errors,
      externalRequests: external,
      diagnosticTrace: await page
        .evaluate(() => window.__browserGateTrace.snapshot())
        .catch(() => null),
    };
  } finally {
    await context.close();
  }
}
async function launch(settings, active) {
  const { toolRequire, launchOptions } = require('./common.cjs');
  const playwright = toolRequire('playwright'),
    options = launchOptions(settings.engine),
    browser = await playwright[settings.engine].launch(options);
  active.add(browser);
  return {
    browser,
    engine: settings.engine,
    version: browser.version(),
    executable: options.executablePath || playwright[settings.engine].executablePath(),
  };
}
async function observe(launched, settings, url, output, active) {
  const start = performance.now(),
    screenshot = path.join(
      output,
      `${settings.engine}-${settings.route}-${settings.width}-${settings.theme}-${settings.mode}.png`
    );
  if (settings.scope !== 'startup') fs.rmSync(screenshot, { force: true });
  try {
    const observation =
      settings.scope === 'startup'
        ? await startup(launched.browser, url, settings, output)
        : await require('./functional.cjs').scenario(launched.browser, url, settings);
    const source =
      settings.scope === 'startup' ? path.join(output, settings.id + '.png') : screenshot;
    if (!observation.pass && fs.existsSync(source)) {
      const relative = 'screenshots/' + settings.id + '.png';
      fs.mkdirSync(path.join(output, 'screenshots'), { recursive: true });
      fs.copyFileSync(source, path.join(output, relative));
      observation.screenshotFile = relative;
    }
    return {
      observation,
      startMs: start,
      endMs: performance.now(),
      browser: {
        engine: launched.engine,
        version: launched.version,
        executable: launched.executable,
      },
    };
  } finally {
    await launched.browser.close();
    active.delete(launched.browser);
  }
}
function saveTrial(record, settings, result, output) {
  const filename = 'trials/' + settings.id + '.json.gz',
    row = { ...settings, ...result, diagnosticTraceFile: filename };
  fs.mkdirSync(path.join(output, 'trials'), { recursive: true });
  fs.writeFileSync(
    path.join(output, filename),
    zlib.gzipSync(JSON.stringify(row, null, 2) + '\n', { level: 9 })
  );
  if (row.observation) {
    try {
      validateOutcome(row.observation);
      row.traceSummary = summarizeTrace(row.observation.diagnosticTrace);
      row.status = 'observed';
    } catch (error) {
      row.infrastructureError = error.message;
      row.status = 'invalid-observation';
    }
    row.observation = { ...row.observation, diagnosticTrace: undefined };
  } else row.status = 'infrastructure-error';
  record.rows.push(row);
  if (row.infrastructureError)
    record.infrastructureErrors.push({ id: settings.id, error: row.infrastructureError });
  return row;
}
function loadOverlap(rows) {
  const target = rows.find((row) => row.role === 'target');
  return rows
    .filter((row) => row.role === 'background')
    .map((row) => ({
      id: row.id,
      overlapMs: Math.max(
        0,
        Math.min(target.endMs, row.endMs) - Math.max(target.startMs, row.startMs)
      ),
      scope:
        'Scenario lifespan overlap only; raw trace draw events retain actual rendering evidence.',
    }));
}
async function collectGroup(group, url, record, output, active) {
  const launched = await Promise.allSettled(group.rows.map((settings) => launch(settings, active)));
  assert.equal(
    record.watchdogExpired,
    false,
    'diagnostic infrastructure deadline already exceeded'
  );
  const outcomes = await Promise.allSettled(
    group.rows.map(async (settings, index) => {
      if (launched[index].status === 'rejected') throw launched[index].reason;
      return observe(launched[index].value, settings, url + '/' + settings.label, output, active);
    })
  );
  const rows = outcomes.map((outcome, index) =>
    saveTrial(
      record,
      { ...group.rows[index], group: group.id, concurrencyMode: group.mode },
      outcome.status === 'fulfilled'
        ? outcome.value
        : { infrastructureError: outcome.reason.stack || outcome.reason.message },
      output
    )
  );
  if (group.mode === 'loaded') record.overlap.push({ group: group.id, rows: loadOverlap(rows) });
}
function readInputs(settings) {
  const { root } = require('./common.cjs');
  const inputs = {};
  for (const label of Object.keys(labels)) {
    const directory = settings[label],
      manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json'))),
      publicDir = path.join(directory, 'public');
    artifact.verify(publicDir, manifest);
    inputs[label] = { directory, publicDir, manifest };
  }
  const candidate =
    process.env.SITE_CANDIDATE_SHA ||
    cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  validateInputs(inputs, candidate);
  return inputs;
}
function save(record, output) {
  fs.writeFileSync(path.join(output, 'diagnosis.json'), JSON.stringify(record, null, 2) + '\n');
}
async function main(settings) {
  process.env.SITE_REPORT_DIR = settings.output;
  const { environment } = require('./common.cjs');
  fs.mkdirSync(settings.output, { recursive: true });
  const record = {
    schema: 1,
    kind: 'browser-gate-causal-diagnostic',
    fullGate: false,
    performanceAcceptance: false,
    complete: false,
    pass: false,
    environment: environment(),
    plan: plan(),
    protocol:
      'Two fresh WebKit startup observations and four balanced Firefox Writing normal scenarios: control then adaptive alone; adaptive then control with Chromium and WebKit normal Index control scenarios concurrently. Every process/context is fresh, no retry/reset, original browser fixture deadlines and failed outcomes retained. Twelve-minute infrastructure watchdog. Private tracing adds renderer/DOM work; causal observations need later uninstrumented confirmation.',
    startupDeadlines: { foregroundMs: 3000, baselineMs: 180, nextPaintMs: 1500, pollMs: 50 },
    runBudgetMs,
    watchdogExpired: false,
    identities: {},
    rows: [],
    overlap: [],
    infrastructureErrors: [],
  };
  const active = new Set();
  let server, watchdog;
  try {
    const inputs = readInputs(settings);
    record.identities = Object.fromEntries(
      Object.entries(inputs).map(([label, input]) => [
        label,
        { ...input.manifest, files: undefined },
      ])
    );
    save(record, settings.output);
    const served = await require('./writing-probe.cjs').serve(inputs);
    server = served.server;
    watchdog = setTimeout(() => {
      record.watchdogExpired = true;
      record.infrastructureErrors.push({
        error: 'Twelve-minute diagnostic infrastructure deadline exceeded',
      });
      save(record, settings.output);
      for (const browser of active) browser.close().catch(() => {});
    }, runBudgetMs);
    for (const group of record.plan) {
      assert.equal(
        record.watchdogExpired,
        false,
        'diagnostic infrastructure deadline already exceeded'
      );
      await collectGroup(group, served.url, record, settings.output, active);
      save(record, settings.output);
    }
    record.complete =
      record.rows.length === record.plan.reduce((count, group) => count + group.rows.length, 0) &&
      record.rows.every((row) => row.status === 'observed') &&
      record.infrastructureErrors.length === 0;
    record.fixtureFailures = record.rows
      .filter((row) => row.observation?.pass === false)
      .map((row) => ({ id: row.id, error: row.observation.error }));
    record.pass = record.complete;
    save(record, settings.output);
    assert.ok(record.complete, 'incomplete/invalid diagnostic observations; see retained evidence');
  } catch (error) {
    record.infrastructureErrors.push({ error: error.message, stack: error.stack });
    record.pass = false;
    save(record, settings.output);
    throw error;
  } finally {
    clearTimeout(watchdog);
    await Promise.allSettled([...active].map((browser) => browser.close()));
    server?.close();
  }
  return record;
}
if (require.main === module)
  main(argumentsFor(process.argv.slice(2))).catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = {
  argumentsFor,
  plan,
  validateInputs,
  validateTrace,
  validateOutcome,
  summarizeTrace,
  stats,
  saveTrial,
  loadOverlap,
  main,
};
