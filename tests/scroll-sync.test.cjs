'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
const { fitScrollStops, writingProgress } = require('../site/engine/math.cjs')();
const scrollBrowser = require('../tools/quality/scroll-browser.cjs');
function readingFixture({ route = 'research', end = 1000, waypointY = 700, defect } = {}) {
  const model = require('../docs/space.js'),
    baseline = JSON.stringify(model.routePose(route, model.poses[model.initialPoses[route]])),
    scene = {
      dataset: {
        camera: baseline,
        phase: '0',
        quality: 'full',
        route,
        travel: 'settled',
        ready: 'true',
      },
    },
    control = {
      textContent: 'Motion: on',
      disabled: false,
      hidden: false,
      getAttribute: () => 'true',
    },
    requests = [];
  let time = 0;
  const context = {
    window: { __quality: { paints: 1, callbacks: 1 } },
    innerHeight: 800,
    scrollY: 0,
    performance: { now: () => time },
    document: {
      hidden: false,
      body: { dataset: { page: route } },
      documentElement: { scrollHeight: end + 800 },
      querySelector: (selector) => (selector === '.space-scene' ? scene : control),
      querySelectorAll(selector) {
        assert.equal(selector, '[data-space-stop]');
        return [
          {
            dataset: { spaceStop: 'research' },
            getBoundingClientRect: () => ({
              top: waypointY + 176 - context.scrollY,
            }),
          },
        ];
      },
    },
    scrollTo({ top, behavior }) {
      assert.equal(behavior, 'instant');
      requests.push(top);
      context.scrollY = Math.max(0, Math.min(top, end));
      if (defect === 'stationary-y') context.scrollY = 0;
      if (defect === 'reverse-y' && top === 0 && requests.some((y) => y > 0)) context.scrollY = 8;
    },
  };
  const invoke = (fn, arg) =>
    vm.runInNewContext('(' + fn.toString() + ')(arg)', { ...context, arg });
  const page = {
    evaluate: async (fn, arg) => invoke(fn, arg),
    async waitForFunction(fn, arg, options) {
      assert.deepEqual(options, { polling: 50, timeout: 3000 });
      const started = time;
      for (; time <= started + options.timeout; time += options.polling) {
        scene.dataset.phase = defect === 'frozen' ? '0' : String(time / 50);
        context.window.__quality.callbacks = time / 50 + 1;
        if (defect !== 'no-paint') context.window.__quality.paints = time / 50 + 1;
        scene.dataset.camera = baseline;
        if (defect === 'drift' && context.scrollY > 0) scene.dataset.camera = 'drift';
        if (defect === 'transient-drift' && context.scrollY === 950 && time === started)
          scene.dataset.camera = 'transient-drift';
        if (invoke(fn, arg)) return;
      }
      throw Error('Controlled reading settlement deadline after 3000ms');
    },
    locator(selector) {
      assert.equal(selector, '.space-scene');
      return {
        async getAttribute(name) {
          return scene.dataset[name.replace('data-', '')];
        },
      };
    },
  };
  return { page, context, scene, requests, baseline };
}
test('reading probe observes native final gestures and reversal at one canonical camera', async () => {
  const h = readingFixture(),
    row = await scrollBrowser.probe(h.page, 'original', 'research');
  assert.equal(row.start, h.baseline);
  assert.deepEqual(h.requests, [0, 900, 950, 990, 1000, 0]);
  assert.deepEqual(
    row.samples.map((sample) => sample.y),
    [900, 950, 990, 1000]
  );
  assert.ok(row.samples.every((sample) => sample.camera === h.baseline));
  let paints = row.startPaints;
  for (const sample of [...row.samples, row.reverse]) {
    assert.ok(sample.paints > paints, 'each native position retains an actual new paint');
    paints = sample.paints;
  }
  assert.equal(row.reverse.y, 0);
  assert.equal(row.reverse.camera, h.baseline);
  assert.doesNotThrow(() => scrollBrowser.validateProbe(row, 'research'));
});
test('reading collector rejects drift, native stalls and unpainted or frozen ambient motion', async () => {
  for (const defect of [
    'stationary-y',
    'reverse-y',
    'drift',
    'transient-drift',
    'no-paint',
    'frozen',
  ]) {
    const h = readingFixture({ defect });
    await assert.rejects(() => scrollBrowser.probe(h.page, 'original', 'research'));
    assert.ok(h.context.window.__engineCameraSettling.samples.length > 0, defect);
    if (defect === 'transient-drift')
      assert.ok(
        h.context.window.__engineCameraSettling.samples.some(
          (sample) => sample.camera === 'transient-drift'
        ),
        'a recovered endpoint cannot erase earlier camera drift'
      );
    if (defect === 'frozen') {
      assert.equal(h.context.window.__engineCameraSettling.timeoutMs, 3000);
      assert.equal(h.context.window.__engineCameraSettling.status, 'failed');
    }
  }
});
test('reading state permits native subpixel rounding while requiring fixed camera and real paint', async () => {
  const h = readingFixture();
  h.context.scrollY = 400.75;
  const state = await scrollBrowser.readingState(h.page, h.baseline, 400);
  assert.equal(state.y, 400.75);
  assert.equal(state.camera, h.baseline);
  assert.ok(state.paints > 1);
});
test('reading rejects missing or zero Canvas counts despite completed Color scene telemetry', async () => {
  for (const paints of [undefined, 0]) {
    const h = readingFixture({ defect: 'no-paint' });
    h.context.window.__quality.paints = paints;
    h.context.window.__colorPaint = { completed: 5, ordinaryShapes: 12, customShapes: 0 };
    await assert.rejects(
      scrollBrowser.readingState(h.page, h.baseline, 0),
      paints === undefined
        ? /reading probe observes actual Canvas paints/
        : /ambient paints advance during native reading/
    );
    assert.equal(h.context.window.__colorPaint.completed, 5);
    assert.equal(h.context.window.__quality.paints, paints);
  }
});
test('reordered semantic waypoints measure actual native position while preserving canonical camera', async () => {
  for (const waypointY of [300, 700, 1200]) {
    const h = readingFixture({ waypointY }),
      waypoint = await scrollBrowser.semanticWaypoint(h.page, 'research');
    assert.equal(waypoint.id, 'verification');
    assert.equal(waypoint.targetY, waypointY);
    assert.equal(waypoint.y, Math.min(waypointY, 1000));
    assert.equal(waypoint.end, 1000);
    assert.equal(waypoint.distance, 0);
    assert.deepEqual(waypoint.actual, JSON.parse(h.baseline));
    assert.deepEqual(waypoint.actual, waypoint.expected);
    assert.deepEqual(h.requests, [waypointY, 0]);
    assert.equal(h.context.scrollY, 0);
  }
  for (const defect of ['stationary-y', 'drift', 'no-paint'])
    await assert.rejects(() =>
      scrollBrowser.semanticWaypoint(readingFixture({ defect }).page, 'research')
    );
});
test('reading evidence validator rejects altered camera, native offsets and fabricated paint progress', async () => {
  const row = await scrollBrowser.probe(readingFixture().page, 'original', 'research');
  const mutations = [
    (observed) => delete observed.start,
    (observed) => delete observed.startPaints,
    (observed) => observed.samples.pop(),
    (observed) => (observed.samples[1].fraction = 0.9),
    (observed) => (observed.samples[1].y = 0),
    (observed) => (observed.samples[3].y = 998),
    (observed) => (observed.samples[1].camera = 'changed'),
    (observed) => (observed.samples[2].paints = observed.samples[1].paints),
    (observed) => (observed.samples[1].paints = NaN),
    (observed) => delete observed.reverse,
    (observed) => (observed.reverse.y = 20),
    (observed) => (observed.reverse.camera = 'changed'),
    (observed) => (observed.reverse.paints = observed.samples.at(-1).paints),
    (observed) => (observed.reverse.paints = Infinity),
  ];
  for (const mutate of mutations) {
    const observed = structuredClone(row);
    mutate(observed);
    assert.throws(() => scrollBrowser.validateProbe(observed, 'research'));
  }
  const wrongRoom = structuredClone(row),
    model = require('../docs/space.js'),
    writingCamera = JSON.stringify(
      model.routePose('writing', model.poses[model.initialPoses.writing])
    );
  wrongRoom.start = writingCamera;
  for (const sample of [...wrongRoom.samples, wrongRoom.reverse]) sample.camera = writingCamera;
  assert.throws(
    () => scrollBrowser.validateProbe(wrongRoom, 'research'),
    'consistent camera evidence from another room cannot satisfy this route'
  );
  const short = await scrollBrowser.probe(readingFixture({ end: 0 }).page, 'short', 'research');
  assert.ok(short.samples.every((sample) => sample.y === 0 && sample.camera === short.start));
  assert.equal(short.end, 0);
  assert.doesNotThrow(() => scrollBrowser.validateProbe(short, 'research'));
});
test('semantic stops span actual content and footer growth; repeated closing poses cannot finish early', () => {
  const markers = [
    { id: 'intro', y: 0 },
    { id: 'middle', y: 700 },
    { id: 'end', y: 1600 },
    { id: 'end', y: 2600 },
  ];
  for (const end of [2000, 3400, 8000]) {
    const stops = fitScrollStops(markers, end);
    assert.deepEqual(stops, [
      { id: 'intro', y: 0 },
      { id: 'middle', y: 700 },
      { id: 'end', y: end },
    ]);
    assert.ok(stops.every((s, i) => i === 0 || s.y > stops[i - 1].y));
  }
  assert.equal(fitScrollStops(markers, 500).at(-1).y, 500);
  assert.equal(fitScrollStops(markers, 0).length, 1);
  assert.equal(
    fitScrollStops(
      [
        { id: 'intro', y: 0 },
        { id: 'end', y: 0 },
      ],
      1000
    ).length,
    1
  );
});
test('Writing endpoints and nonzero final gestures survive long, short and anchored content reflow', () => {
  for (const [start, end] of [
    [800, 8000],
    [80, 400],
    [0, 1200],
  ])
    for (const anchor of [
      null,
      { y: 200, progress: 0.2 },
      { y: 300, progress: 1 },
      { y: 100, progress: 0 },
      { y: 9000, progress: 0.7 },
    ]) {
      const bounds = { start, end };
      assert.equal(writingProgress(0, bounds, anchor), 0);
      assert.equal(writingProgress(end, bounds, anchor), 1);
      const values = [0, 0.1, 0.25, 0.5, 0.8, 0.9, 0.95, 0.99, 1].map((t) =>
        writingProgress(t * end, bounds, anchor)
      );
      assert.ok(
        values.every(
          (v, i) => Number.isFinite(v) && v >= 0 && v <= 1 && (i === 0 || v > values[i - 1])
        ),
        JSON.stringify({ bounds, anchor, values })
      );
    }
});
test('route position restoration is immediate and retains CSS preferences even after a native failure', () => {
  const source = fs.readFileSync(
    require('node:path').join(__dirname, '../site/engine/navigation.js'),
    'utf8'
  );
  const helper = source.match(
    /^ {2}function restoreScroll\s*\(\s*left\s*,\s*top\s*\)\s*\{[\s\S]*?^ {2}\}/m
  )[0];
  for (const saved of [
    ['', ''],
    ['smooth', 'important'],
  ])
    for (const failure of [false, true]) {
      const value = saved[0],
        priority = saved[1];
      let calls = 0;
      const unexpected = () => {
        throw Error('Restoration must not read or rewrite CSS preferences');
      };
      const style = {
        getPropertyValue: unexpected,
        getPropertyPriority: unexpected,
        setProperty: unexpected,
        removeProperty: unexpected,
      };
      const restore = vm.runInNewContext('(' + helper + ')', {
        getComputedStyle: unexpected,
        document: { documentElement: { style } },
        window: {
          scrollTo: (options) => {
            calls++;
            assert.equal(options.behavior, 'instant');
            assert.equal(options.left, 12);
            assert.equal(options.top, 7841);
            if (failure) throw Error('Controlled native failure');
          },
        },
      });
      if (failure) assert.throws(() => restore(12, 7841), /Controlled native failure/);
      else restore(12, 7841);
      assert.equal(calls, 1);
      assert.equal(value, saved[0]);
      assert.equal(priority, saved[1]);
    }
});
