'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const contract = require('../tools/quality/writing-paradigm-validate.cjs');
function helper(name, next) {
  const source = fs.readFileSync(
      path.join(__dirname, '../tools/quality/writing-paradigm-browser.cjs'),
      'utf8'
    ),
    start = source.indexOf('function ' + name + '('),
    end = source.indexOf('\nasync function ' + next + '(', start);
  assert.ok(start >= 0 && end > start, 'maintained browser geometry helper');
  return vm.runInNewContext('(' + source.slice(start, end) + ')', { assert });
}
test('Writing observer skips opaque bootstrap documents but preserves site storage failures', () => {
  const source = fs.readFileSync(
      path.join(__dirname, '../tools/quality/writing-paradigm-browser.cjs'),
      'utf8'
    ),
    start = source.indexOf('function observeFormula('),
    end = source.indexOf('\nfunction finiteBounds(', start);
  assert.ok(start >= 0 && end > start, 'maintained browser observer');
  function inject(protocol, denied = false) {
    const writes = [],
      window = { requestAnimationFrame() {} },
      clearRect = () => {},
      drawImage = () => {};
    const sandbox = {
      location: { protocol },
      window,
      CanvasRenderingContext2D: { prototype: { clearRect, drawImage } },
    };
    const error = new Error('Site storage access denied');
    sandbox.localStorage = {
      setItem(...args) {
        if (denied) throw error;
        writes.push(args);
      },
    };
    const observe = vm.runInNewContext('(' + source.slice(start, end) + ')', sandbox);
    return { observe, window, writes, error };
  }
  for (const protocol of ['about:', 'data:', 'blob:']) {
    const state = inject(protocol, true);
    assert.doesNotThrow(() => state.observe());
    assert.equal(state.window.__formulaQA, undefined, 'bootstrap document is not instrumented');
    assert.deepEqual(state.writes, []);
  }
  for (const protocol of ['http:', 'https:', 'file:']) {
    const state = inject(protocol);
    state.observe({ theme: 'light', motion: 'off' });
    assert.deepEqual(state.writes, [
      ['vo.theme', 'light'],
      ['vo.content-flight', 'on'],
      ['vo.motion', 'off'],
    ]);
    assert.equal(state.window.__formulaQA.draws, 0, 'site observer is installed');
    const denied = inject(protocol, true);
    assert.throws(
      () => denied.observe(),
      (error) => error === denied.error,
      'real site storage denial remains an error'
    );
  }
});
function bounds(viewportWidth = 390) {
  const corners = [
      [16, 200],
      [viewportWidth - 16, 203],
      [viewportWidth - 20, 262],
      [19, 260],
    ],
    clips = Array.from({ length: 24 }, (_, index) =>
      index % 2 ? [corners[0], corners[2], corners[3]] : [corners[0], corners[1], corners[2]]
    );
  return {
    route: 'writing',
    x: 16,
    y: 200,
    width: viewportWidth - 32,
    height: 62,
    viewportWidth,
    viewportHeight: 844,
    coordinateSpace: 'physical-css-pixels',
    canvas: {
      x: 0,
      y: 0,
      width: viewportWidth,
      height: 844,
      backingWidth: viewportWidth * 2,
      backingHeight: 1688,
    },
    clips,
    rawVertices: clips.flat(),
    projection: {
      worldCenter: [0, 0, -261],
      rootCenter: [0, 0, -261],
      worldCorners: [
        [-6, 1, -261],
        [6, 1, -260],
        [6, -1, -260],
        [-6, -1, -261],
      ],
      corners,
      depth: 30,
      pulse: 1,
      clock: 100,
      extrusion: 0.14,
      strategy: 'perspective-extruded',
      layers: 3,
      strips: 4,
    },
  };
}
test('Writing physical Canvas clips prove a bounded perspective world plane and reject invalid paint evidence', () => {
  const check = helper('finiteBounds', 'frameBand'),
    physical = helper('physicalFormulaBounds', 'initialize'),
    canvas = bounds().canvas,
    viewport = { width: 390, height: 844 };
  check([bounds()]);
  const mapped = physical(
    [16, 200, 358, 62],
    { a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 },
    canvas,
    viewport
  );
  assert.deepEqual(JSON.parse(JSON.stringify(mapped)), {
    x: 16,
    y: 200,
    width: 358,
    height: 62,
    viewportWidth: 390,
    viewportHeight: 844,
    coordinateSpace: 'physical-css-pixels',
    canvas,
  });
  const zoomed = physical(
    [16, 200, 358, 62],
    { a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 },
    { ...canvas, width: 780, height: 1688 },
    viewport
  );
  assert.equal(zoomed.x, 32);
  assert.equal(zoomed.width, 716);
  assert.throws(() => check([{ ...bounds(), ...zoomed }]));
  const rotated = physical(
    [0, 0, 1380, 240, 2, 3, 10, 20],
    { a: 0, b: 2, c: -2, d: 0, e: 100, f: 50 },
    canvas,
    viewport
  );
  assert.deepEqual(
    [rotated.x, rotated.y, rotated.width, rotated.height],
    [27, 27, 20, 10],
    'all four transformed corners, source-cropped drawImage'
  );
  for (const row of [
    { ...bounds(), x: NaN },
    { ...bounds(), width: 0 },
    { ...bounds(), height: -1 },
    { ...bounds(), x: 14 },
    { ...bounds(), width: 360 },
    { ...bounds(), y: -1 },
    { ...bounds(), height: 900 },
    { ...bounds(), coordinateSpace: 'unscaled-canvas' },
    { ...bounds(), canvas: undefined },
    { ...bounds(), canvas: { ...canvas, backingWidth: 0 } },
    { ...bounds(), projection: undefined },
    { ...bounds(), projection: { ...bounds().projection, worldCenter: [2, 0, -261] } },
    { ...bounds(), clips: [] },
    { ...bounds(), rawVertices: [] },
    {
      ...bounds(),
      projection: {
        ...bounds().projection,
        corners: [
          [16, 200],
          [374, 200],
          [374, 262],
          [16, 262],
        ],
      },
    },
  ])
    assert.throws(() => check([row]));
  assert.throws(() => check([]));
});
function formula() {
  return {
    status: 'ready',
    cacheBuilds: 1,
    width: 1380,
    height: 240,
    bytes: 1324800,
    paintCount: 20,
    visibleCount: 1,
    lastPaintCount: 1,
    drawSubmissions: 480,
    lastDrawSubmissions: 24,
    projection: bounds().projection,
    failures: 0,
  };
}
function observed(width = 390) {
  return {
    formula: formula(),
    overflow: false,
    probe: {
      duplicate: false,
      draws: 20,
      drawSubmissions: 480,
      maxPerPaint: 1,
      maxSubmissionsPerPaint: 24,
      paints: 20,
      startPaintCount: 0,
      startDrawSubmissions: 0,
      bounds: [bounds(width)],
    },
  };
}

function ownership(kind) {
  const camera = JSON.stringify({ position: [0, 0, 0], target: [0, 0, -1] }),
    motion = kind === 'off' ? 'Motion: off' : 'Motion: reduced';
  const before = {
    time: 1000,
    route: 'writing',
    mode: 'canvas',
    motion: 'Motion: on',
    fallbackVisible: false,
    bitmapFormula: true,
    paints: 21,
    draws: 20,
    callbacks: 40,
    phase: '100',
    camera,
    scrollY: 0,
    formula: formula(),
  };
  const off = {
    ...before,
    time: 0,
    motion: 'Motion: off',
    paints: 1,
    draws: 1,
    callbacks: 1,
    phase: '0',
    formula: { ...formula(), paintCount: 1, drawSubmissions: 24 },
  };
  const startupFrozen = { ...off, time: 400 },
    onSynchronous = { ...startupFrozen, time: 401, motion: 'Motion: on' };
  const immediate = { ...before, time: 1001, motion },
    start = { kind: 'preference-return', ...immediate };
  const after = {
    ...before,
    time: 1050,
    motion,
    paints: 22,
    draws: 21,
    callbacks: 41,
    formula: { ...formula(), paintCount: 21, drawSubmissions: 504 },
  };
  const scroll = { beforeY: 0, target: 100, after: { ...after, time: 1060, scrollY: 100 } },
    end = { ...after, time: 1450, scrollY: 100 };
  const events = [
    { kind: 'before', ...before },
    start,
    {
      kind: 'paint-clear',
      ...immediate,
      time: 1010,
      paints: 22,
      callbacks: 41,
      bitmapFormula: false,
    },
    { kind: 'formula-draw', ...after, time: 1011 },
    { kind: 'settled', ...after },
    { kind: 'native-scroll', ...scroll.after },
    { kind: 'freeze-end', ...end },
  ];
  return {
    kind,
    startup: { off, startupFrozen, onSynchronous, painted: observed() },
    before,
    immediate,
    settle: {
      timeoutMs: 1500,
      start,
      elapsedMs: 49,
      paintDelta: 1,
      drawDelta: 1,
      callbackDelta: 1,
    },
    after,
    frozen: { elapsedMs: 400, paintDelta: 0, drawDelta: 0, callbackDelta: 0, scroll, after: end },
    events,
    errors: [],
  };
}
function fixture() {
  const expected = {
      sourceCommit: '2'.repeat(40),
      sourceTree: '4'.repeat(40),
      candidateCommit: '2'.repeat(40),
      sourceDirty: false,
      artifactDigest: 'b'.repeat(64),
      variant: {
        id: 'color',
        contract: 1,
        fingerprint: 'd'.repeat(64),
        effects: ['ribbons', 'travel'],
      },
      engine: 'd'.repeat(64),
      derivation: { kind: 'authored-color-effects', baseArtifactDigest: 'f'.repeat(64) },
    },
    engines = ['chromium', 'firefox'],
    cases = [
      { width: 1440, theme: 'light', mode: 'normal' },
      { width: 390, theme: 'dark', mode: 'normal' },
      { width: 320, theme: 'dark', mode: 'no-js' },
      { width: 320, theme: 'light', mode: 'no-canvas' },
      { width: 390, theme: 'dark', mode: 'reduced' },
    ];
  const views = [320, 390, 768, 1440].flatMap((width) =>
      ['light', 'dark'].map((theme) => ({ width, theme }))
    ),
    record = {
      schema: 1,
      kind: 'writing-paradigm-browser',
      fullGate: false,
      pass: true,
      environment: { platform: 'linux', os: 'fixture', node: 'v24' },
      sourceCommit: expected.sourceCommit,
      sourceTree: expected.sourceTree,
      artifactDigest: expected.artifactDigest,
      variant: expected.variant,
      engines: engines.map((engine) => ({ engine, version: 'fixture' })),
      rows: engines.flatMap((engine) =>
        cases.map((row) => ({
          engine,
          route: 'writing',
          ...row,
          pass: true,
          errors: [],
          externalRequests: [],
          checks: Object.fromEntries(
            [
              'positiveProbe',
              'off',
              'print',
              'syntheticVisibility',
              'keyboard',
              'reverse',
              'zoom',
              'archive',
              'fallback',
              'reducedFreeze',
            ].map((key) => [key, true])
          ),
        }))
      ),
      formula: {
        rows: [
          ...views.map((view) => ({
            ...view,
            initial: observed(view.width),
            after: observed(view.width),
            ...(view.width === 390 ? { zoom: observed(390) } : {}),
            errors: [],
          })),
          ...['research', 'writing', 'talks', 'writing', 'credits', 'index', 'writing'].map(
            (route) => ({
              journey: route,
              route,
              formula: formula(),
              probe: { duplicate: false, draws: route === 'writing' ? 3 : 0 },
            })
          ),
          {
            errors: [],
            cacheFault: {
              ready: 'true',
              h1: 1,
              probe: { paints: 3, draws: 0 },
              formula: { status: 'failed', cacheBuilds: 1, failures: 1 },
            },
          },
        ],
        captures: [
          ...views.map(({ width, theme }) => `writing-${width}-${theme}.png`),
          'writing-light-zoom200.png',
          'writing-dark-zoom200.png',
        ],
      },
      offline: { requests: [], errors: [], observed: observed() },
    };
  record.formula.ownership = ['off', 'reduced'].map(ownership);
  return { record, expected };
}
test('Writing browser report accepts the full focused matrix, visual journey, bounded failure and offline evidence', () => {
  const { record, expected } = fixture();
  assert.deepEqual(contract.browser(record, expected), { pass: true, fullGate: false, cases: 10 });
});
test('Writing browser report rejects wrong-source, missing cells/captures, invisible formula, room leaks and failed offline/cache checks', () => {
  const mutations = [
    (record) => (record.sourceCommit = '1'.repeat(40)),
    (record) => (record.artifactDigest = '0'.repeat(64)),
    (record) => (record.variant.id = 'base'),
    (record) => record.rows.pop(),
    (record) => (record.rows[1] = structuredClone(record.rows[0])),
    (record) => record.engines.pop(),
    (record) => (record.rows[0].checks.off = false),
    (record) => (record.rows[4].checks.reducedFreeze = false),
    (record) => record.formula.captures.pop(),
    (record) => (record.formula.rows[0].initial.probe.draws = 0),
    (record) => (record.formula.rows[0].after.probe.startPaintCount = 20),
    (record) => delete record.formula.rows[2].zoom,
    (record) => (record.formula.rows[2].zoom.probe.startPaintCount = 20),
    (record) => (record.formula.rows[0].initial.probe.bounds[0].width = 400),
    (record) => (record.formula.rows[8].probe.draws = 1),
    (record) => (record.formula.rows[0].after.probe.bounds[0].y = -1),
    (record) => delete record.formula.rows[0].initial.probe.bounds[0].coordinateSpace,
    (record) =>
      (record.formula.rows[0].initial.probe.bounds[0].coordinateSpace = 'unscaled-canvas'),
    (record) => (record.formula.rows[0].initial.probe.bounds[0].canvas.backingHeight = 0),
    (record) => delete record.formula.rows[0].initial.probe.bounds[0].projection,
    (record) =>
      (record.formula.rows[0].initial.probe.bounds[0].projection.rootCenter = [10, 0, -261]),
    (record) => (record.formula.rows[0].initial.probe.bounds[0].clips = []),
    (record) => (record.formula.rows[0].initial.probe.bounds[0].rawVertices = []),
    (record) => (record.formula.rows[0].initial.probe.maxSubmissionsPerPaint = 48),
    (record) => (record.formula.rows[0].initial.probe.drawSubmissions = 479),
    (record) => delete record.formula.ownership,
    (record) => record.formula.ownership.pop(),
    (record) => (record.formula.ownership[1].kind = 'off'),
    (record) => (record.formula.ownership[0].startup.off.formula.cacheBuilds = 2),
    (record) => (record.formula.ownership[0].startup.onSynchronous.draws = 2),
    (record) => (record.formula.ownership[0].startup.onSynchronous.formula.cacheBuilds = 0),
    (record) => (record.formula.ownership[0].startup.painted.probe.draws = 0),
    (record) => (record.formula.ownership[0].before.bitmapFormula = false),
    (record) => (record.formula.ownership[0].before.formula.lastPaintCount = 0),
    (record) => (record.formula.ownership[0].after.mode = 'static'),
    (record) => (record.formula.ownership[0].after.fallbackVisible = true),
    (record) => (record.formula.ownership[0].after.formula.lastPaintCount = 0),
    (record) => (record.formula.ownership[0].settle.paintDelta = 2),
    (record) => (record.formula.ownership[0].settle.drawDelta = 0),
    (record) => (record.formula.ownership[0].settle.callbackDelta = 2),
    (record) => (record.formula.ownership[0].frozen.elapsedMs = 399),
    (record) => (record.formula.ownership[0].frozen.paintDelta = 1),
    (record) => (record.formula.ownership[0].frozen.drawDelta = 1),
    (record) => (record.formula.ownership[0].frozen.callbackDelta = 1),
    (record) => (record.formula.ownership[0].frozen.after.phase = '101'),
    (record) => (record.formula.ownership[0].frozen.after.camera = 'different'),
    (record) => (record.formula.ownership[0].frozen.after.scrollY = 0),
    (record) => (record.formula.ownership[0].events[0].fallbackVisible = true),
    (record) => (record.formula.rows[15].cacheFault.formula.cacheBuilds = 2),
    (record) => record.offline.requests.push('https://invalid.example/asset'),
    (record) => delete record.offline,
    (record) => (record.pass = false),
  ];
  for (const mutate of mutations) {
    const { record, expected } = structuredClone(fixture());
    mutate(record);
    assert.throws(() => contract.browser(record, expected));
  }
});
