'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path'),
  vm = require('node:vm');
const variants = require('../tools/quality/writing-variants.cjs'),
  color = require('../tools/staging/color.cjs'),
  artifact = require('../tools/quality/artifact.cjs'),
  snapshot = require('../tools/site/snapshot.cjs');
const root = path.resolve(__dirname, '..'),
  baseSource = fs.readFileSync(path.join(root, 'docs/space.js'), 'utf8');
const effects = color.runtime(color.authoredEffects());
// Mesh comparisons explicitly exercise the optional historical ribbon library.
const ribbon = require('../site/effects/ribbons.cjs').descriptor();
const historicalCode =
  '(()=>{window.SiteEffects={...window.SiteEffects,contract:1};\n' + ribbon.code + '\n})();';
const scripts = { 'space.js': historicalCode + '\n' + effects.code + '\n' + baseSource };
const plain = (value) => JSON.parse(JSON.stringify(value));
test('reading clarity rejects wrong landing targets and depth reversals that remain frame-continuous', () => {
  const {
    validateArrivalDepth,
    validateNativeEndpoints,
  } = require('../tools/quality/reading-clarity.cjs');
  const camera = (z) => ({ position: [0, 0, z], target: [0, 0, z - 29] }),
    start = { camera: camera(-360) },
    leg = { id: 'reverse-end', to: 'writing', direction: 'backward' };
  const rows = (values) =>
    values.map((z, i) => ({
      camera: camera(z),
      journey: i === values.length - 1 ? null : { to: camera(-319) },
    }));
  const good = rows([-360, -350, -340, -319]);
  assert.doesNotThrow(() =>
    validateArrivalDepth(
      good,
      good.filter((row) => row.journey),
      start,
      leg
    )
  );
  const overshoot = rows([-360, -330, -294.1658, -303.6741, -319]);
  assert.throws(
    () =>
      validateArrivalDepth(
        overshoot,
        overshoot.filter((row) => row.journey),
        start,
        leg
      ),
    /cannot pass the intended endpoint/
  );
  const reversal = rows([-360, -340, -350, -319]);
  assert.throws(
    () =>
      validateArrivalDepth(
        reversal,
        reversal.filter((row) => row.journey),
        start,
        leg
      ),
    /cannot reverse camera depth/
  );
  const wrong = rows([-360, -350, -319]);
  wrong[0].journey.to = camera(-232);
  assert.throws(
    () =>
      validateArrivalDepth(
        wrong,
        wrong.filter((row) => row.journey),
        start,
        leg
      ),
    /departure already targets/
  );
  const events = [
    { leg: 'edge-reverse-end', kind: 'edge-ready', scrollY: 0, maxScroll: 400, time: 1 },
    { leg: leg.id, kind: 'mount', scrollY: 0, maxScroll: 500, time: 2 },
    { leg: leg.id, kind: 'mount-ready', page: 'writing', scrollY: 500, maxScroll: 500, time: 3 },
    { leg: leg.id, kind: 'navigation-ready', scrollY: 500, maxScroll: 500, time: 4 },
  ];
  assert.doesNotThrow(
    () => validateNativeEndpoints({ events }, leg),
    'raw mount precedes the native landing'
  );
  const missed = plain(events);
  missed[2].scrollY = 0;
  assert.throws(
    () => validateNativeEndpoints({ events: missed }, leg),
    /destination scroll endpoint/,
    'post-layout landing must reach the bottom'
  );
});
test('reading clarity rejects any individual corner drift and missing Appearance paint evidence', () => {
  const { validateSurfaceSamples, paintAlpha } = require('../tools/quality/reading-clarity.cjs');
  const selectors = [
    '.hero-copy',
    '.help-grid article',
    '.site-footer>p',
    '.reading-title',
    '.research-card',
    '.reading-title',
    '.archive-filters',
    '.publication',
    '.year-heading',
    '.reading-title',
    '.talks-list .publication',
    '.credits-page>h1',
    '.appearance[open] .display-controls',
  ];
  const samples = [];
  for (const width of [320, 1440])
    for (const theme of ['light', 'dark'])
      for (const selector of selectors) {
        samples.push({
          selector,
          width,
          theme,
          background: theme === 'light' ? 'rgba(243, 241, 234, 0.87)' : 'rgba(17, 28, 34, 0.87)',
          backgroundAlpha: 0.87,
          reducedTransparency: false,
          opacity: '1',
          mask: 'none',
          filter: 'none',
          backdropFilter: 'none',
          shadowBlur: 0,
          outerRadii: [12, 12, 12, 12],
        });
      }
  assert.doesNotThrow(() => validateSurfaceSamples(samples));
  for (let corner = 0; corner < 4; corner++) {
    const changed = plain(samples);
    changed[0].outerRadii[corner] = 3;
    assert.throws(
      () => validateSurfaceSamples(changed),
      /shared visible outer corner radius/,
      'any single changed corner fails'
    );
  }
  const missing = plain(samples);
  missing[12].selector = '.other-panel';
  assert.throws(
    () => validateSurfaceSamples(missing),
    /Appearance panel measured/,
    'the popup cannot be replaced by another sample'
  );
  const blurred = plain(samples);
  blurred[12].shadowBlur = 30;
  assert.throws(
    () => validateSurfaceSamples(blurred),
    /shared unblurred surface edge/,
    'a blurred popup edge fails'
  );
  for (const background of ['rgba(243, 241, 234, 0.89)', 'rgb(243 241 234 / 100%)']) {
    const changed = plain(samples);
    changed[0].background = background;
    changed[0].backgroundAlpha = paintAlpha(background);
    assert.throws(
      () => validateSurfaceSamples(changed),
      /shared historical paper alpha/,
      'alpha drift and opaque repaints fail'
    );
  }
  const faded = plain(samples);
  faded[0].opacity = '.87';
  assert.throws(
    () => validateSurfaceSamples(faded),
    /full element opacity/,
    'transparency cannot fade text or controls'
  );
  assert.equal(
    paintAlpha('color(srgb 0.952941 0.945098 0.917647 / 0.87)'),
    0.87,
    'modern computed color serialization retains the alpha'
  );
  const reduced = plain(samples);
  for (const sample of reduced) {
    sample.background = sample.theme === 'light' ? 'rgb(243, 241, 234)' : 'rgb(17, 28, 34)';
    sample.backgroundAlpha = 1;
    sample.reducedTransparency = true;
  }
  assert.doesNotThrow(
    () => validateSurfaceSamples(reduced),
    'the explicit accessibility preference retains opaque paint'
  );
});
function scene(source, theme = 'dark') {
  const context = {
    window: {},
    module: { exports: {} },
    document: { getElementById: () => null, documentElement: { dataset: { theme } } },
  };
  vm.runInNewContext(source, context);
  return context.window.SiteEffects.scene(context.module.exports);
}
function collect(
  effect,
  {
    compact = false,
    detailTier = 0,
    time = 0,
    current = { position: [5, 3, -232], target: [0, 0, -261] },
  } = {}
) {
  return effect.collect({
    current,
    width: compact ? 390 : 1440,
    height: compact ? 844 : 900,
    ambientTime: time,
    compact,
    detailTier,
    scene: { dataset: {} },
  });
}
function pointMap(shapes) {
  const points = new Map();
  for (const shape of shapes)
    for (const point of shape.points)
      if (point[2] === 0 || point[2] === 1)
        points.set([shape.ribbon, point[2], point[3]].join('/'), plain(point));
  return points;
}
test('browser-gate diagnostics are explicit additions while the original Writing screen labels remain unchanged', () => {
  assert.equal(variants.labels.length, 13);
  assert.deepEqual(variants.browserGateLabels, [
    'browser-gate-trace',
    'browser-gate-fixed-ribbons',
  ]);
  for (const label of variants.browserGateLabels) {
    assert.equal(variants.labels.includes(label), false);
    const result = variants.patchRuntime(scripts, label);
    new vm.Script(result.scripts['space.js']);
    assert.equal(result.patches.length, label === 'browser-gate-trace' ? 2 : 3);
    assert.ok(result.patches.every((row) => row.matches === 1));
    assert.equal(
      scripts['space.js'],
      historicalCode + '\n' + effects.code + '\n' + baseSource,
      'explicit historical comparison control stays unchanged'
    );
  }
});
test('normal tier zero and every mobile tier retain exactly the normal ribbon facets, colors and projection', () => {
  for (const theme of ['light', 'dark']) {
    const control = scene(
        variants.patchRuntime(scripts, 'browser-gate-fixed-ribbons').scripts['space.js'],
        theme
      ),
      trace = scene(
        variants.patchRuntime(scripts, 'browser-gate-trace').scripts['space.js'],
        theme
      ),
      adaptive = scene(scripts['space.js'], theme);
    for (const time of [0, 6639.66, 7518.48, 23999]) {
      const original = plain(collect(control, { time }));
      assert.ok(original.length > 200);
      assert.deepEqual(plain(collect(trace, { time })), original);
      assert.deepEqual(plain(collect(adaptive, { time })), original);
      for (const detailTier of [-1, 0, 0.5, 1, 2, 3])
        assert.deepEqual(
          plain(collect(adaptive, { compact: true, detailTier, time })),
          plain(collect(control, { compact: true, time })),
          'mobile geometry does not follow desktop mesh adaptation'
        );
    }
  }
});
test('adaptive desktop mesh reduces facets without changing shared projected vertices or visibility bounds', () => {
  const control = scene(
      variants.patchRuntime(scripts, 'browser-gate-fixed-ribbons').scripts['space.js']
    ),
    adaptive = scene(scripts['space.js']);
  for (const time of [0, 6639.66, 7518.48, 15255.54]) {
    const original = collect(control, { time }),
      low = collect(adaptive, { detailTier: 2, time }),
      middle = collect(adaptive, { detailTier: 1, time });
    assert.ok(low.length < original.length * 0.5);
    assert.ok(middle.length > low.length && middle.length < original.length);
    assert.deepEqual(
      plain(collect(adaptive, { detailTier: -1, time })),
      plain(original),
      'negative tier clamps to zero'
    );
    assert.deepEqual(
      plain(collect(adaptive, { detailTier: 3, time })),
      plain(low),
      'tier clamps to two'
    );
    assert.ok(
      low.every((shape) => shape.depth > 1 && shape.depth < 105),
      'desktop far plane stays 105'
    );
    assert.ok(
      low.every((shape) => shape.z >= -364 && shape.z <= -198),
      'desktop world range stays the same, with only the mesh grid origin rounded to its step'
    );
    const before = pointMap(original),
      after = pointMap(low),
      shared = [...after].filter(([key]) => before.has(key));
    assert.ok(shared.length > 30, 'positive shared world-grid vertex control');
    for (const [key, point] of shared)
      assert.deepEqual(point, before.get(key), 'shared camera projection, RGB and UV remain exact');
  }
});
function browser(source, { failPaint = false, probe = true } = {}) {
  let clock = 0,
    time = 0,
    serial = 0;
  const pending = new Map(),
    events = [],
    dataset = {};
  const ctx = Object.fromEntries(
    [
      'setTransform',
      'beginPath',
      'moveTo',
      'lineTo',
      'stroke',
      'fill',
      'closePath',
      'quadraticCurveTo',
    ].map((name) => [name, () => {}])
  );
  ctx.clearRect = () => {
    if (failPaint) throw Error('native paint unavailable');
    clock += 60;
  };
  ctx.createLinearGradient = () => ({ addColorStop() {} });
  const canvas = { parentElement: { dataset, style: { setProperty() {} } }, getContext: () => ctx },
    button = { setAttribute() {}, addEventListener() {} };
  const window = {
    performance: { now: () => clock },
    innerWidth: 1440,
    innerHeight: 900,
    devicePixelRatio: 1.5,
    scrollY: 0,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: (fn) => {
      pending.set(++serial, fn);
      return serial;
    },
    cancelAnimationFrame: (id) => pending.delete(id),
    addEventListener() {},
    getComputedStyle: () => ({
      getPropertyValue: (key) =>
        ({
          '--accent': '#075d7b',
          '--systems': '#895710',
          '--paper': '#f8f7f3',
          '--scene-sheet': '#fffefa',
        })[key],
    }),
    SiteEngineProbe: (event) => events.push(event),
  };
  if (!probe) delete window.SiteEngineProbe;
  const document = {
    body: { dataset: { page: 'research' } },
    documentElement: { scrollHeight: 5000, dataset: { theme: 'dark' } },
    getElementById: (id) =>
      id === 'space-canvas' ? canvas : id === 'space-motion' ? button : null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
  vm.runInNewContext(source, {
    window,
    document,
    localStorage: { getItem: () => null },
    module: { exports: {} },
  });
  return {
    window,
    events,
    pending,
    frame() {
      time += 200;
      const jobs = [...pending.values()];
      pending.clear();
      for (const fn of jobs) fn(time);
    },
  };
}
test('private getter and frame events report actual post-quality state while preserving the severe hold policy', () => {
  const producer = require('../tools/site/build.cjs');
  const active =
    effects.code + '\n' + producer.runtime(root, producer.configuration(root).definitions);
  const native = browser(active);
  native.frame();
  const paint = native.events.find((event) => event.kind === 'paint');
  assert.ok(paint, 'a completed native paint is observed');
  assert.ok(paint.ordinaryShapes > 0);
  assert.equal(paint.customShapes, 0);
  assert.equal(native.window.SiteEffects.scene, undefined, 'active Color has no ribbon scene hook');
  assert.equal(paint.ambientTime, 0, 'initial paint uses the existing ambient clock');
  const unavailable = browser(active, { failPaint: true });
  unavailable.frame();
  assert.equal(
    unavailable.events.some((event) => event.kind === 'paint'),
    false,
    'failed native painting produces no successful paint event'
  );
  const unobserved = browser(active, { probe: false });
  unobserved.frame();
  assert.equal(unobserved.events.length, 0, 'ordinary rendering needs no observer');
  assert.ok(unobserved.pending.size > 0, 'the original scene clock remains live without a probe');
  const source = variants.patchRuntime(scripts, 'browser-gate-trace').scripts['space.js'],
    b = browser(source);
  const descriptor = Object.getOwnPropertyDescriptor(b.window, '__browserGateScheduler');
  assert.equal(typeof descriptor.get, 'function');
  assert.equal(descriptor.set, undefined);
  const keys = [
    'pending',
    'enabled',
    'hold',
    'printing',
    'initialized',
    'failed',
    'page',
    'tier',
    'detailTier',
    'slow',
    'fast',
    'idleRate',
    'costAverage',
    'lastFrame',
    'nextDraw',
  ];
  assert.deepEqual(Object.keys(b.window.__browserGateScheduler), keys);
  const start = b.window.__browserGateScheduler;
  start.hold = true;
  assert.equal(
    b.window.__browserGateScheduler.hold,
    false,
    'returned snapshots cannot mutate scheduler state'
  );
  for (let i = 0; i < 100 && !b.window.__browserGateScheduler.hold; i++) b.frame();
  const frames = b.events.filter((event) => event.kind === 'browser-gate-frame'),
    last = frames.at(-1),
    state = b.window.__browserGateScheduler;
  assert.ok(frames.length > 16);
  assert.ok(frames.every((event) => event.renderCost === 60 && event.ribbonFaces > 0));
  assert.equal(state.hold, true);
  assert.equal(state.tier, 2);
  assert.equal(state.enabled, true);
  assert.equal(state.failed, false);
  assert.equal(state.pending, null);
  assert.equal(b.pending.size, 0);
  for (const key of keys) assert.equal(last[key], state[key], 'post-quality ' + key);
  assert.equal(last.slow >= 16, true);
  assert.equal(last.renderCost > 50, true);
  const count = frames.length;
  b.frame();
  assert.equal(
    b.events.filter((event) => event.kind === 'browser-gate-frame').length,
    count,
    'a held renderer remains stopped'
  );
});
function controlPackage(directory) {
  const base = path.join(directory, 'current-base');
  fs.mkdirSync(base);
  fs.cpSync(path.join(root, 'docs'), path.join(base, 'public'), { recursive: true });
  const sourceCommit = 'a'.repeat(40),
    manifest = {
      schema: 1,
      sourceCommit,
      sourceTree: 'b'.repeat(40),
      candidateCommit: sourceCommit,
      sourceDirty: false,
      ...artifact.manifest(path.join(base, 'public')),
    };
  manifest.components = snapshot.verify(path.join(base, 'public'), manifest);
  fs.writeFileSync(path.join(base, 'artifact.json'), JSON.stringify(manifest));
  const normal = path.join(directory, 'current-color');
  fs.cpSync(base, normal, { recursive: true });
  color.build(normal);
  return normal;
}
test('active browser-gate trace retains Color lineage and historical ribbon comparison fails closed', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'browser-gate-variants-'));
  try {
    const parentDir = controlPackage(directory),
      parent = JSON.parse(fs.readFileSync(path.join(parentDir, 'artifact.json')));
    for (const label of ['browser-gate-trace']) {
      const target = path.join(directory, label),
        derived = variants.derive(parentDir, target, label),
        m = derived.manifest;
      artifact.verify(derived.publicDir, m);
      snapshot.verify(derived.publicDir, m);
      assert.equal(m.fullGate, false);
      assert.equal(m.diagnostic.fullGate, false);
      assert.equal(m.variant.diagnostic.fullGate, false);
      assert.equal(m.derivation.fullGate, false);
      assert.equal(m.derivation.baseArtifactDigest, parent.artifactDigest);
      assert.equal(m.derivation.parentArtifactDigest, parent.artifactDigest);
      assert.deepEqual(m.derivation.parentVariant, parent.variant);
      assert.equal(m.sourceCommit, parent.sourceCommit);
      assert.equal(m.sourceTree, parent.sourceTree);
      assert.equal(m.sourceDirty, false);
      assert.notEqual(m.variant.fingerprint, parent.variant.fingerprint);
      assert.notEqual(m.artifactDigest, parent.artifactDigest);
      assert.equal(
        variants.derive(parentDir, target, label).manifest.artifactDigest,
        m.artifactDigest,
        'private derivation is deterministic'
      );
      assert.throws(
        () => variants.derive(target, path.join(directory, 'nested-' + label), label),
        /unchanged Color control/
      );
    }
    assert.throws(
      () =>
        variants.derive(
          parentDir,
          path.join(directory, 'browser-gate-fixed-ribbons'),
          'browser-gate-fixed-ribbons'
        ),
      /explicit historical ribbon-enabled control/
    );
    assert.equal(
      artifact.manifest(path.join(parentDir, 'public')).artifactDigest,
      parent.artifactDigest
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
test('unsupported renditions, repeated adaptation and missing or duplicated counterfactual anchors fail closed', () => {
  assert.throws(
    () => variants.patchRuntime(scripts, 'browser-gate-unknown'),
    /unsupported Writing intervention/
  );
  const anchors = [
    'window.SiteScene={',
    '      if(living)quality(renderCost,time);',
    'stride:compact?1:1+Math.round(Math.max(0,Math.min(2,ribbonMesh)))',
  ];
  for (const anchor of anchors) {
    const matched = require('../tools/quality/writing-models.cjs').javascriptAnchor(
      scripts['space.js'],
      anchor
    ).needle;
    assert.throws(
      () =>
        variants.patchRuntime(
          { 'space.js': scripts['space.js'].replace(matched, '/* controlled source drift */') },
          'browser-gate-fixed-ribbons'
        ),
      /exactly once/
    );
    assert.throws(
      () =>
        variants.patchRuntime(
          { 'space.js': scripts['space.js'] + '\n' + matched },
          'browser-gate-fixed-ribbons'
        ),
      /exactly once/
    );
  }
  assert.throws(
    () => variants.patchRuntime(scripts, 'browser-gate-adaptive-ribbons'),
    /adaptive ribbons are public/
  );
  const once = variants.patchRuntime(scripts, 'browser-gate-trace').scripts;
  assert.throws(() => variants.patchRuntime(once, 'browser-gate-trace'), /exactly once/);
});
