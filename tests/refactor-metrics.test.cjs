'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const metrics = require('../tools/quality/refactor-metrics.cjs');
const motion = require('../tools/quality/motion.cjs');
const common = require('../tools/quality/common.cjs');
const budgets = require('../tools/quality/budgets.json');
const artifact = require('../tools/quality/artifact.cjs');
const childProcess = require('node:child_process');

function sample(kind) {
  const stopped = ['off', 'reduced'].includes(kind);
  const elapsed = stopped
    ? 1000
    : kind === 'warmup'
      ? metrics.protocol.warmupMs
      : kind === 'hotspot'
        ? metrics.protocol.hotspotMs
        : 4000;
  const data = {
    schema: 2,
    start: 0,
    end: elapsed,
    elapsed,
    quality: 'full',
    cadence: '60',
    state: 'active',
    motion: stopped ? 'Motion: off' : 'Motion: on',
    frames: stopped ? [] : [{ time: 20, started: 20, duration: 1, painted: true }],
    longTasks: [],
    events: [],
  };
  return motion.summarize(data, kind);
}

function rooms() {
  return {
    rooms: [
      {
        route: 'index',
        models: [{ compact: false, serializedChars: 1000, formulaAnchors: 0 }],
      },
    ],
    formula: {
      status: 'unused',
      cacheBuilds: 0,
      width: 0,
      height: 0,
      bytes: 0,
      failures: 0,
    },
  };
}

function fixture(candidate = false, variant = 'base') {
  const files = Object.fromEntries([
    ...budgets.routes.map((route) => [
      route + '.html',
      { sha256: '1'.repeat(64), raw: 999, gzip: 200 },
    ]),
    ...[
      'styles.css',
      'theme.js',
      'space.js',
      'archive.js',
      'navigation.js',
      'assets/favicon.svg',
      'assets/vitalii-oborskyi-cutout.webp',
    ].map((name) => [name, { sha256: '2'.repeat(64), raw: 100, gzip: 10 }]),
  ]);
  const identity = {
    sourceCommit: candidate ? 'b'.repeat(40) : metrics.baselineCommit,
    sourceTree: candidate ? 'c'.repeat(40) : metrics.baselineTree,
    candidateCommit: candidate ? 'b'.repeat(40) : metrics.baselineCommit,
    sourceDirty: false,
    artifactDigest: artifact.digest(JSON.stringify(files)),
    engine: variant === 'color' ? 'f'.repeat(64) : 'e'.repeat(64),
    variant: {
      id: variant,
      contract: 1,
      fingerprint: 'f'.repeat(64),
      ...(variant === 'color' ? { effects: ['travel'] } : {}),
    },
  };
  const rawCPUProfile = {
    startTime: 0,
    endTime: 4000,
    nodes: [
      {
        id: 1,
        callFrame: {
          functionName: 'paint',
          url: 'http://127.0.0.1:8888/space.js',
          lineNumber: 12,
        },
      },
    ],
    samples: [1],
    timeDeltas: [4000],
  };
  return {
    schema: 1,
    kind: 'refactor-metrics',
    identity,
    protocol: structuredClone(metrics.protocol),
    budgets: structuredClone(budgets),
    browser: '153.0.8010.12',
    browserSettings: {
      engine: 'chromium',
      launch: common.launchOptions('chromium'),
    },
    playwright: common.toolRequire('playwright/package.json').version,
    environment: { platform: 'linux', node: 'v24.19.0', cpus: ['fixture'] },
    collectorSources: metrics.collectorSources(),
    target: 'loopback-exact-public-artifact',
    fullGate: false,
    performanceAcceptance: false,
    rows: metrics.protocol.profiles.flatMap((settings) =>
      metrics.protocol.routes.map((route) => ({
        route,
        settings: structuredClone(settings),
        warmup: sample('warmup'),
        hotspotWindow: sample('hotspot'),
        samples: ['idle', 'scroll', 'off', 'reduced'].map(sample),
        rawCPUProfile: structuredClone(rawCPUProfile),
        hotspots: metrics.cpuHotspots(rawCPUProfile),
        diagnostics: rooms(),
        ribbons: {
          sceneHook: 'undefined',
          ribbonHook: 'undefined',
          submissions: 0,
          shapes: 0,
          dataset: {},
        },
        paint: { completed: 1, ordinaryShapes: 10, customShapes: 0, embeddedShapes: 0 },
        qualityTrace: [{ time: 0, quality: 'full', cadence: '60' }],
        runtime: {
          variant,
          navigationHook: variant === 'color' ? 'function' : 'undefined',
          engine: identity.engine,
          theme: 'dark',
          viewport: { width: settings.width, height: settings.height },
          deviceScaleFactor: settings.deviceScaleFactor,
        },
        errors: [],
      }))
    ),
    sizes: {
      artifactDigest: identity.artifactDigest,
      files,
      rows: budgets.routes.map((route) => ({
        route,
        ...files[route + '.html'],
        totalGzipBytes: route === 'index' ? 270 : 260,
        svgNodes: 10,
      })),
    },
    lifecycle: {
      cycles: metrics.protocol.lifecycleCycles,
      warmedRoutes: [...budgets.routes.slice(1), budgets.routes[0]],
      samples: Array.from({ length: 11 }, (_, cycle) => ({
        cycle,
        route: cycle === 0 ? 'index' : budgets.routes[cycle % budgets.routes.length],
        heapUsedBytes: 1000000,
        dom: { documents: 1, nodes: 100, jsEventListeners: 10 },
        pendingRAF: 0,
        diagnostics: rooms(),
      })),
      errors: [],
    },
  };
}

test('bounded paired observations preserve original limits without asserting a speedup', () => {
  const baseline = fixture();
  const candidate = fixture(true);
  assert.equal(metrics.validateReport(baseline, baseline.identity), true);
  const comparison = metrics.compare(baseline, candidate);
  assert.equal(comparison.optimization.disposition, 'deferred');
  assert.equal(comparison.optimization.demonstratedBenefit, false);
  assert.equal(comparison.fullGate, false);
  assert.equal(comparison.performanceAcceptance, false);
  assert.ok(comparison.observations.every((row) => row.qualityComparable));
});

const fixedFixtureSource =
  childProcess.execFileSync(
    'git',
    ['show', metrics.baselineCommit + ':site/engine/lifecycle.cjs'],
    { cwd: common.root, encoding: 'utf8' }
  ) + "\nconst untouchedRenderer = 'drawing bytes stay intact';";

function fixedFixture(candidate = false) {
  const report = fixture(candidate);
  report.kind = 'refactor-metrics-fixed-diagnostic';
  report.target = 'loopback-instrumented-public-artifact';
  report.protocol = structuredClone(metrics.fixedProtocol);
  report.sizes.files['space.js'].sha256 = artifact.digest(fixedFixtureSource);
  report.identity.artifactDigest = artifact.digest(JSON.stringify(report.sizes.files));
  report.sizes.artifactDigest = report.identity.artifactDigest;
  report.rows = report.rows.filter((row) => row.settings.id === 'mobile-x4');
  delete report.lifecycle;
  for (const row of report.rows) {
    const settings = metrics.fixedControl[row.settings.id];
    const derivative = metrics.fixedRuntime(fixedFixtureSource, settings);
    row.instrumentation = {
      ...derivative.evidence,
      requests: [
        {
          originalSHA256: derivative.evidence.originalSHA256,
          derivativeSHA256: derivative.evidence.derivativeSHA256,
        },
      ],
    };
    row.qualityTrace = [
      {
        time: 0,
        quality: String(settings.qualityTier),
        cadence: String(settings.cadenceHz),
      },
    ];
    for (const sample of [row.warmup, ...row.samples, row.hotspotWindow]) {
      sample.quality = String(settings.qualityTier);
      sample.cadence = String(settings.cadenceHz);
    }
  }
  return report;
}

test('fixed diagnostics transform only explicit controller owners and reject drift', () => {
  const settings = metrics.fixedControl['mobile-x4'];
  const derivative = metrics.fixedRuntime(fixedFixtureSource, settings);
  let restored = derivative.source;
  // Reverse at the original offsets after accounting for each preceding edit.
  let shift = 0;
  const applied = [...derivative.evidence.edits]
    .sort((a, b) => a.range[0] - b.range[0])
    .map((edit) => {
      const start = edit.range[0] + shift;
      shift += edit.replacement.length - edit.original.length;
      return { ...edit, start };
    });
  for (const edit of applied.reverse())
    restored =
      restored.slice(0, edit.start) +
      edit.original +
      restored.slice(edit.start + edit.replacement.length);
  assert.equal(restored, fixedFixtureSource);
  assert.ok(derivative.source.includes("const untouchedRenderer = 'drawing bytes stay intact';"));
  assert.match(derivative.source, /tier\s*=\s*1/);
  assert.match(derivative.source, /interval\s*=\s*1000 \/ 7\.5/);
  for (const source of [
    fixedFixtureSource.replace(/let tier\s*=\s*0/, 'let tier=1'),
    fixedFixtureSource.replace(/detailTier\s*=\s*0/, 'otherDetail=0'),
    fixedFixtureSource.replace(/adaptCadence\(cost,\s*time\);/, 'unreviewedController(cost,time);'),
    fixedFixtureSource.replace('slow>=8', 'slow>=9'),
    fixedFixtureSource.replace('animation||journey?', 'animation?'),
    fixedFixtureSource + '\nfunction other() { const interval = 10; }',
  ])
    assert.throws(() => metrics.fixedRuntime(source, settings));
  assert.throws(() => metrics.fixedRuntime(fixedFixtureSource, { qualityTier: 2, cadenceHz: 1 }));
});

test('fixed-work evidence cannot become adaptive acceptance or omit actual served derivatives', () => {
  const baseline = fixedFixture();
  const candidate = fixedFixture(true);
  const comparison = metrics.compare(baseline, candidate);
  assert.equal(comparison.mode, 'fixed-diagnostic');
  assert.ok(comparison.observations.every((row) => row.qualityComparable));
  assert.equal(comparison.performanceAcceptance, false);
  assert.throws(() => metrics.compare(fixture(), candidate), /report mismatch/);
  for (const mutate of [
    (value) => (value.kind = 'refactor-metrics'),
    (value) => (value.target = 'loopback-exact-public-artifact'),
    (value) => (value.rows[0].instrumentation.requests = []),
    (value) => (value.rows[0].instrumentation.originalSHA256 = '0'.repeat(64)),
    (value) =>
      (value.rows[0].instrumentation.derivativeSHA256 =
        value.rows[0].instrumentation.originalSHA256),
    (value) => (value.rows[0].instrumentation.requests[0].derivativeSHA256 = '0'.repeat(64)),
    (value) => (value.rows[0].qualityTrace[0].cadence = '30'),
    (value) => (value.rows[1].qualityTrace[0].quality = '0'),
    (value) => (value.protocol.fixedControl.desktop.cadenceHz = 1),
    (value) => value.rows.push(structuredClone(value.rows[0])),
    (value) => (value.lifecycle = fixture().lifecycle),
  ]) {
    const report = fixedFixture();
    mutate(report);
    assert.throws(() => metrics.validateReport(report));
  }
});

test('source, runtime, budget, profile and browser substitutions fail closed', () => {
  for (const mutate of [
    (value) => (value.identity.sourceDirty = true),
    (value) => (value.collectorSources['motion.cjs'] = '0'.repeat(64)),
    (value) => (value.identity.candidateCommit = 'd'.repeat(40)),
    (value) => (value.identity.artifactDigest = 'wrong'),
    (value) => (value.rows[0].runtime.engine = '0'.repeat(64)),
    (value) => (value.rows[0].runtime.variant = 'color'),
    (value) => (value.rows[0].runtime.theme = 'light'),
    (value) => value.rows[0].runtime.viewport.width++,
    (value) => value.rows[0].runtime.deviceScaleFactor++,
    (value) => value.budgets.motion.paintCallbackP95Ms++,
    (value) => (value.protocol.profiles[0].cpuRate = 2),
    (value) => (value.protocol.reducedMotion = 'reduce'),
    (value) => value.browserSettings.launch.args.push('--different-paint-path'),
    (value) => (value.browserSettings.engine = 'firefox'),
    (value) => value.rows.pop(),
    (value) => (value.rows[1] = structuredClone(value.rows[0])),
    (value) => value.rows[0].errors.push('actual browser failure'),
    (value) => (value.sizes.rows[0].raw = budgets.htmlRawBytes + 1),
    (value) => value.sizes.files['index.html'].raw++,
    (value) => value.sizes.rows[0].gzip--,
    (value) => value.sizes.rows[0].totalGzipBytes--,
    (value) => (value.sizes.rows[0].sha256 = '0'.repeat(64)),
    (value) => (value.fullGate = true),
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => metrics.validateReport(value));
  }
  const baseline = fixture();
  for (const mutate of [
    (value) => (value.browser = 'other-version'),
    (value) => (value.environment.cpus = ['other-runner']),
  ]) {
    const candidate = fixture(true);
    mutate(candidate);
    assert.throws(() => metrics.compare(baseline, candidate));
  }
});

test('actual raw frames and CPU durations determine reported results', () => {
  for (const mutate of [
    (value) => (value.rows[0].samples[0].paintCallbackMs.p95 = 0),
    (value) => (value.rows[0].samples[0].rawFrames[0].duration = -1),
    (value) => (value.rows[0].samples[0].rawFrames = []),
    (value) => value.rows[0].samples[0].window.endMs++,
    (value) => value.rows[0].samples[0].rawLongTasks.push({ start: -1, duration: 1 }),
    (value) =>
      value.rows[0].samples[0].rawPreparation.push({
        kind: 'model',
        start: 1,
        time: 2,
        duration: NaN,
      }),
    (value) =>
      value.rows[0].samples[0].rawPreparation.push({
        kind: 'model',
        start: 5000,
        time: 5001,
        duration: 1,
      }),
    (value) => (value.rows[0].hotspots[0].sampledSelfMs = 0),
    (value) => (value.rows[0].rawCPUProfile.samples[0] = 999),
    (value) => (value.rows[0].rawCPUProfile.timeDeltas = []),
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => metrics.validateReport(value));
  }
  const value = fixture();
  const raw = value.rows[2].samples[0];
  raw.rawFrames[0].duration = budgets.motion.paintCallbackP95Ms + 1;
  const data = {
    schema: 2,
    start: 0,
    end: 4000,
    elapsed: 4000,
    frames: raw.rawFrames,
    longTasks: [],
    events: [],
    quality: 'full',
    cadence: '60',
    state: 'active',
    motion: 'Motion: on',
  };
  value.rows[2].samples[0] = motion.summarize(data, 'idle');
  assert.throws(() => metrics.validateReport(value), /paint budget/);
});

test('CPU sampling and its separate hotspot window must contain actual observations', () => {
  for (const mutate of [
    (value) =>
      (value.rows[0].rawCPUProfile = {
        nodes: [],
        samples: [],
        timeDeltas: [],
        startTime: 0,
        endTime: 4000,
      }),
    (value) => (value.rows[0].rawCPUProfile.endTime = value.rows[0].rawCPUProfile.startTime),
    (value) => (value.rows[0].rawCPUProfile.timeDeltas = [0]),
    (value) => delete value.rows[0].hotspotWindow,
    (value) => (value.rows[0].hotspotWindow.elapsedMs = 1),
    (value) => (value.rows[0].hotspotWindow.rawFrames = []),
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => metrics.validateReport(value));
  }
});

test('Off/reduced callbacks, bounded caches and warm route disposal remain enforced', () => {
  for (const mutate of [
    (value) => (value.rows[0].samples[2] = { ...sample('idle'), kind: 'off' }),
    (value) => (value.rows[0].samples[3] = { ...sample('idle'), kind: 'reduced' }),
    (value) => {
      const raw = sample('off');
      const data = {
        schema: 2,
        start: 0,
        end: 1000,
        elapsed: 1000,
        quality: raw.quality,
        cadence: raw.cadence,
        state: raw.state,
        motion: raw.motion,
        frames: [{ time: 20, started: 20, duration: 1, painted: false }],
        longTasks: [],
        events: [],
      };
      value.rows[0].samples[2] = motion.summarize(data, 'off');
    },
    (value) => (value.rows[0].diagnostics.formula.bytes = 1),
    (value) =>
      (value.rows[0].diagnostics.rooms = Array.from({ length: 4 }, (_, i) => ({
        ...rooms().rooms[0],
        route: budgets.routes[i],
      }))),
    (value) =>
      value.rows[0].diagnostics.rooms[0].models.push(
        ...rooms().rooms[0].models,
        ...rooms().rooms[0].models
      ),
    (value) => value.lifecycle.samples.pop(),
    (value) => (value.lifecycle.samples[5].pendingRAF = 1),
    (value) => value.lifecycle.samples.at(-1).dom.documents++,
    (value) => value.lifecycle.samples.at(-1).dom.nodes++,
    (value) => value.lifecycle.samples.at(-1).dom.jsEventListeners++,
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => metrics.validateReport(value));
  }
});

test('quality changes are retained as incomparable observations rather than speedups', () => {
  const candidate = fixture(true);
  candidate.rows[0].samples[0].quality = 'compact';
  candidate.rows[0].qualityTrace[0].quality = 'compact';
  const compared = metrics.compare(fixture(), candidate);
  assert.equal(compared.observations[0].qualityComparable, false);
  assert.equal(compared.optimization.demonstratedBenefit, false);
});

test('whole-window quality traces retain transient tier changes and reject missing evidence', () => {
  const candidate = fixture(true);
  candidate.rows[0].qualityTrace.push(
    { time: 100, quality: 'compact', cadence: '60' },
    { time: 200, quality: 'full', cadence: '60' }
  );
  assert.equal(metrics.compare(fixture(), candidate).observations[0].qualityComparable, false);
  for (const mutate of [
    (value) => (value.rows[0].qualityTrace = []),
    (value) => delete value.rows[0].qualityTrace[0].quality,
    (value) => delete value.rows[0].qualityTrace[0].cadence,
    (value) => (value.rows[0].qualityTrace[0].time = 50000),
    (value) =>
      value.rows[0].qualityTrace.push({
        time: -1,
        quality: 'full',
        cadence: '60',
      }),
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => metrics.validateReport(value));
  }
});

test('matched approved-main baseline rejects frozen R2 and arbitrary source/tree substitutions', () => {
  assert.notEqual(metrics.baselineCommit, metrics.frozenR2.sourceCommit);
  const comparison = metrics.compare(fixture(), fixture(true));
  assert.deepEqual(comparison.measurementBaseline, {
    kind: 'approved-main',
    sourceCommit: metrics.baselineCommit,
    sourceTree: metrics.baselineTree,
  });
  for (const mutate of [
    (value) => {
      value.identity.sourceCommit = metrics.frozenR2.sourceCommit;
      value.identity.candidateCommit = metrics.frozenR2.sourceCommit;
      value.identity.sourceTree = metrics.frozenR2.sourceTree;
    },
    (value) => {
      value.identity.sourceCommit = 'd'.repeat(40);
      value.identity.candidateCommit = 'd'.repeat(40);
    },
    (value) => (value.identity.sourceTree = 'd'.repeat(40)),
  ]) {
    const baseline = fixture();
    mutate(baseline);
    assert.throws(() => metrics.compare(baseline, fixture(true)), /approved-main baseline/);
  }
  const oldProtocol = fixture();
  oldProtocol.protocol.baseline.sourceCommit = metrics.frozenR2.sourceCommit;
  assert.throws(() => metrics.validateReport(oldProtocol), /protocol changed/);
  assert.throws(() => metrics.compare(fixture(), fixture()), /candidate is baseline/);
});

test('active composition and actual retired ribbon absence must match ordinary Color paint', () => {
  const baseline = fixture(false, 'color');
  assert.ok(metrics.compare(baseline, fixture(true, 'color')).observations.length > 0);
  assert.throws(() => metrics.compare(baseline, fixture(true)), /variant mismatch/);
  for (const mutate of [
    (value) => delete value.identity.variant.effects,
    (value) => (value.identity.variant.effects = ['ribbons', 'travel']),
    (value) => (value.identity.variant.effects = []),
    (value) => (value.rows[0].ribbons.ribbonHook = 'function'),
    (value) => delete value.rows[0].ribbons,
    (value) => delete value.rows[0].ribbons.dataset,
    (value) => (value.rows[0].ribbons.dataset = { ribbonFaces: '1' }),
    (value) => (value.rows[0].ribbons.dataset = { ribbonMaterial: 'opaque-rgb' }),
    (value) => (value.rows[0].paint.completed = 0),
    (value) => (value.rows[0].paint.ordinaryShapes = 0),
    (value) => (value.rows[0].paint.customShapes = 1),
    (value) => (value.rows[0].runtime.navigationHook = 'undefined'),
  ]) {
    const candidate = fixture(true, 'color');
    mutate(candidate);
    assert.throws(() => metrics.compare(baseline, candidate));
  }
  const baseWithFlight = fixture(true);
  baseWithFlight.identity.variant.effects = ['travel'];
  assert.throws(() => metrics.validateReport(baseWithFlight), /effect composition/);
  const zeroDataset = fixture(true, 'color');
  zeroDataset.rows[0].ribbons.dataset = { ribbonFaces: '0' };
  assert.equal(metrics.validateReport(zeroDataset), true);
});

test('serialized collector forwards existing motion events and actual ordinary paint together', () => {
  let nextRAF = 0;
  const stored = [];
  const sandbox = {
    location: { protocol: 'http:' },
    localStorage: { setItem: (key, value) => stored.push([key, value]) },
    performance: { now: () => 1 },
    CanvasRenderingContext2D: function CanvasRenderingContext2D() {},
    requestAnimationFrame: () => ++nextRAF,
    cancelAnimationFrame() {},
  };
  sandbox.CanvasRenderingContext2D.prototype.clearRect = () => {};
  sandbox.window = sandbox;
  vm.runInNewContext(metrics.measurementProbeScript(), sandbox);
  const model = { kind: 'model', time: 3, start: 2, duration: 1 };
  const painted = { kind: 'paint', ordinaryShapes: 17, customShapes: 0, embeddedShapes: 0 };
  sandbox.SiteEngineProbe(model);
  sandbox.SiteEngineProbe(painted);
  assert.deepEqual(Array.from(sandbox.__qualityMotion.events), [model, painted]);
  assert.deepEqual(
    { ...sandbox.__colorPaint },
    {
      completed: 1,
      ordinaryShapes: 17,
      customShapes: 0,
      embeddedShapes: 0,
    }
  );
  assert.deepEqual(stored, [
    ['vo.theme', 'dark'],
    ['vo.motion', 'on'],
  ]);
  const raf = sandbox.requestAnimationFrame(() => {});
  assert.equal(sandbox.__refactorRAF.has(raf), true);
  sandbox.cancelAnimationFrame(raf);
  assert.equal(sandbox.__refactorRAF.size, 0);
});
