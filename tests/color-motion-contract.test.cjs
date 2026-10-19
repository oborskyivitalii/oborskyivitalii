'use strict';
// Controlled compatibility fixtures are not hosted or device acceptance.
const test = require('node:test'),
  assert = require('node:assert/strict');
const motion = require('../tools/quality/color-motion-contract.cjs'),
  stage = require('../tools/quality/staging-regression.cjs'),
  gate = require('../tools/quality/staging-gate.cjs'),
  quality = require('../tools/quality/validate.cjs'),
  color = require('../tools/quality/color-browser.cjs'),
  fixture = require('./fixtures/staging-evidence.cjs');
function manifest(id) {
  const value = fixture.manifest(),
    runtime = motion.reviewedRuntime(id);
  value.variant = runtime.variant;
  value.components = {
    contract: 1,
    engine: runtime.variant.fingerprint,
    variant: runtime.variant,
  };
  if (runtime.edition === 'staging')
    value.edition = { id: 'staging', indexable: false, analytics: false };
  if (runtime.edition === 'production')
    value.edition = { id: 'production', indexable: true, origin: 'https://vitaliioborskyi.ai' };
  for (const [name, sha256] of Object.entries(runtime.files))
    for (const file of [name, 'runtime/' + runtime.variant.fingerprint + '/' + name])
      value.files[file] = { raw: 5000, gzip: 1000, sha256 };
  return value;
}
function blockSamples(width = 1440, direction = 'forward', count = 2) {
  const plan = motion.rowPlan(width, count),
    sign = direction === 'forward' ? 1 : -1;
  function unit(stage, y, row, peer = 0) {
    const order = direction === 'forward' ? row : count - 1 - row,
      translate = '0px ' + y + 'px',
      layer = {
        translate,
        distance: Math.sign(y) * 600 + 'px',
        nativeAnimations: [
          {
            name: 'route-block-' + (stage === 'departing' ? 'depart' : 'arrive'),
            startTime: 100,
            currentTime: 300,
            pending: false,
            playState: 'running',
            playbackRate: 1,
            timing: { delay: order * plan.rowStepMs, duration: plan.rowDurationMs },
            keyframes: [
              { computedOffset: 0, translate: stage === 'departing' ? '0px' : '0px 600px' },
              { computedOffset: 1, translate: stage === 'departing' ? '0px -600px' : '0px' },
            ],
          },
        ],
        opacity: 1,
        animation: {
          name: 'route-block-' + (stage === 'departing' ? 'depart' : 'arrive'),
          delay: order * plan.rowStepMs,
          duration: plan.rowDurationMs,
        },
      };
    return {
      stage,
      direction,
      row,
      order,
      top: 100 + row * 200 + peer * 8,
      bottom: 200 + row * 200 + peer * 30,
      borderOwner: row === count - 1 ? '2' : null,
      opacity: 1,
      ink: [translate],
      paper: translate,
      layers: [
        structuredClone(layer),
        structuredClone(layer),
        ...(row === count - 1
          ? [
              {
                ...structuredClone(layer),
                separator: 'bottom',
                separatorSource: 'unit',
                borderOwner: '2',
                separatorPaint: {
                  width: 1,
                  length: 300,
                  style: 'solid',
                  color: 'rgb(20, 30, 40)',
                },
              },
            ]
          : []),
      ],
    };
  }
  const units = (stage, y) => [
    ...Array.from({ length: count }, (_, row) => unit(stage, y, row)),
    unit(stage, y, 0, 1),
  ];
  return [
    {
      stage: 'departing',
      cameraStage: 'settled',
      framing: 0,
      units: units('departing', -20 * sign),
    },
    {
      stage: 'departing',
      cameraStage: 'settled',
      framing: 0,
      units: units('departing', -200 * sign),
    },
    { stage: 'holding', cameraStage: 'center', framing: 0.4, units: [] },
    { stage: 'holding', cameraStage: 'transit', framing: 1, units: [] },
    {
      kind: 'mount',
      stage: 'holding',
      cameraStage: 'transit',
      framing: 1,
      units: [],
    },
    { stage: 'holding', cameraStage: 'restore', framing: 0.4, units: [] },
    {
      stage: 'arriving',
      cameraStage: 'settled',
      framing: 0,
      units: units('arriving', 200 * sign),
    },
    {
      stage: 'arriving',
      cameraStage: 'settled',
      framing: 0,
      units: units('arriving', 20 * sign),
    },
  ].map((sample, index) => ({
    kind: 'progress',
    progress: index / 8,
    opacity: 1,
    viewportWidth: width,
    transform: 'none',
    travel: sample.cameraStage === 'transit' ? 'flying' : 'settled',
    borderSources:
      sample.stage === 'departing' || sample.stage === 'arriving'
        ? [
            {
              sides: [{ owner: '2', side: 'bottom', color: 'rgba(0, 0, 0, 0)' }],
            },
          ]
        : [],
    ...sample,
  }));
}
function fixedHome() {
  const model = require('../docs/space.js'),
    start = JSON.stringify(model.routePose('index', model.poses[model.initialPoses.index]));
  return {
    scroll: {
      label: 'selected-responses',
      end: 1000,
      start,
      samples: [0.9, 0.95, 0.99, 1].map((fraction) => ({
        fraction,
        y: fraction * 1000,
        camera: start,
      })),
    },
  };
}
function evidence(id) {
  const selected = manifest(id),
    value = fixture.aggregateFixture(true),
    runtime = motion.select(selected),
    report = value.reports.at(-1);
  value.manifest = selected;
  value.sizes.files = selected.files;
  for (const observed of value.reports) observed.variant = selected.variant;
  const hosted = value.reports.find((row) => row.kind === 'hosted');
  hosted.rows = Object.keys(selected.files)
    .filter((file) => file !== '.nojekyll')
    .map((file) => ({
      file,
      status: 200,
      sha256: selected.files[file].sha256,
      url: value.hostedURL + '/' + file,
      mime: file.endsWith('.html')
        ? 'text/html'
        : file.endsWith('.js')
          ? 'application/javascript'
          : file.endsWith('.css')
            ? 'text/css'
            : 'application/json',
    }));
  for (const journey of value.reports.find((row) => row.kind === 'stage-functional').journeys)
    for (const row of journey.rows) row.state.engine = selected.variant.fingerprint;
  report.motionContract = runtime;
  for (const row of report.rows) {
    row.identity.engine = selected.variant.fingerprint;
    row.motionContract = structuredClone(runtime);
    if (runtime.behavior === 'fixed-blocks') {
      delete row.checks.spatialFlight;
      row.checks.blockFlight = true;
      row.flight = blockSamples(row.width);
      row.home = fixedHome();
    } else {
      delete row.checks.blockFlight;
      row.checks.spatialFlight = true;
      row.flight = [
        { plane: { flightStage: 'depart', flightDepth: 1 } },
        { plane: { flightStage: 'arrive', flightDepth: -1 } },
      ];
    }
  }
  return value;
}
test('only reviewed historical and current launch plain/staging tuples select a camera and flight contract', () => {
  for (const family of [
    'legacy',
    'fixed',
    'issue76',
    'issue5',
    'issue5-continuation',
    'issue5-history',
    'issue5-departure',
    'issue5-smooth',
    'issue5-viewport',
    'issue5-content',
    'issue5-presentation',
    'issue5-reader-links',
    'issue39-licensed',
    'issue39',
    'issue39-licensed-compact',
    'issue39-writing-tbt',
    'issue39-css-clock',
    'issue5-reconciled',
    'issue5-reader-resources',
  ])
    for (const edition of ['plain', 'staging']) {
      const id = family + '-' + edition,
        selected = manifest(id);
      assert.equal(motion.select(selected).id, id);
      assert.equal(
        motion.flightCheck(selected),
        family === 'legacy' ? 'spatialFlight' : 'blockFlight'
      );
      assert.equal(gate.aggregate(evidence(id)).pass, true);
    }
  for (const id of [
    'fixed-plain',
    'issue76-plain',
    'issue39-plain',
    'issue39-licensed-plain',
    'issue39-licensed-compact-plain',
    'issue39-writing-tbt-plain',
    'issue39-css-clock-plain',
  ]) {
    const copy = motion.reviewedRuntime(id);
    copy.files['space.js'] = '0'.repeat(64);
    assert.equal(motion.select(manifest(id)).id, id);
  }
});
test('production Color has a separate exact edition identity with unchanged approved runtime bytes', () => {
  for (const family of [
    'issue76',
    'issue39',
    'issue39-licensed',
    'issue39-licensed-compact',
    'issue39-writing-tbt',
    'issue39-css-clock',
    'issue5-reconciled',
    'issue5-reader-resources',
  ]) {
    const plain = motion.reviewedRuntime(family + '-plain'),
      production = motion.reviewedRuntime(family + '-production');
    assert.notEqual(production.variant.fingerprint, plain.variant.fingerprint);
    assert.deepEqual(production.files, plain.files);
    assert.equal(motion.select(manifest(production.id)).id, production.id);
    assert.equal(motion.flightCheck(manifest(production.id)), 'blockFlight');
    for (const mutate of [
      (m) => delete m.edition,
      (m) => (m.edition.origin = 'https://candidate.invalid'),
      (m) => (m.edition.indexable = false),
      (m) => (m.edition = { id: 'staging', indexable: false, analytics: false }),
      (m) => (m.variant.fingerprint = plain.variant.fingerprint),
    ]) {
      const value = manifest(production.id);
      mutate(value);
      assert.throws(() => motion.select(value));
    }
  }
});
test('unknown, conflicting, mixed or merely marked runtime identities fail before browser execution', async () => {
  const mutations = [
    (m) => (m.variant.fingerprint = '0'.repeat(64)),
    (m) => (m.variant.baseEngine = '0'.repeat(64)),
    (m) => (m.variant.contract = 2),
    (m) => (m.variant.effects = ['ribbons', 'travel']),
    (m) => (m.variant.readingCamera = 'fixed'),
    (m) => (m.components.variant = motion.reviewedRuntime('legacy-plain').variant),
    (m) => (m.components.engine = '0'.repeat(64)),
    (m) => (m.components.contract = 2),
    (m) => (m.edition = { id: 'production', indexable: true, analytics: true }),
    (m) => (m.files['space.js'].sha256 = motion.reviewedRuntime('legacy-plain').files['space.js']),
    (m) => delete m.files['navigation.js'],
    (m) => {
      m.files['runtime/' + m.variant.fingerprint + '/styles.css'].sha256 = '0'.repeat(64);
    },
  ];
  for (const id of [
    'fixed-plain',
    'issue76-plain',
    'issue76-staging',
    'issue5-plain',
    'issue5-staging',
    'issue5-departure-plain',
    'issue5-departure-staging',
    'issue5-smooth-plain',
    'issue5-smooth-staging',
    'issue5-viewport-plain',
    'issue5-viewport-staging',
    'issue5-content-plain',
    'issue5-content-staging',
    'issue5-presentation-plain',
    'issue5-presentation-staging',
    'issue5-reader-links-plain',
    'issue5-reader-links-staging',
    'issue76-production',
    'issue39-plain',
    'issue39-licensed-plain',
    'issue39-licensed-compact-plain',
    'issue39-writing-tbt-plain',
    'issue39-css-clock-plain',
    'issue39-staging',
    'issue39-licensed-staging',
    'issue39-licensed-compact-staging',
    'issue39-writing-tbt-staging',
    'issue39-css-clock-staging',
    'issue39-production',
    'issue39-licensed-production',
    'issue39-licensed-compact-production',
    'issue39-writing-tbt-production',
    'issue39-css-clock-production',
  ]) {
    for (const mutate of mutations) {
      const value = manifest(id);
      mutate(value);
      assert.throws(() => motion.select(value));
      const invalidEvidence = evidence(id);
      mutate(invalidEvidence.manifest);
      assert.throws(() => gate.aggregate(invalidEvidence));
      let contexts = 0;
      await assert.rejects(() =>
        color.scenario(
          {
            newContext() {
              contexts++;
            },
          },
          'https://controlled.invalid',
          value,
          'chromium',
          390,
          'light'
        )
      );
      assert.equal(contexts, 0, 'unreviewed tuple cannot launch a browser context');
    }
  }
  for (const id of [
    'fixed-staging',
    'issue76-staging',
    'issue5-staging',
    'issue39-licensed-staging',
    'issue39-staging',
    'issue39-licensed-compact-staging',
    'issue39-writing-tbt-staging',
    'issue39-css-clock-staging',
  ]) {
    const staged = manifest(id);
    delete staged.edition;
    assert.throws(() => motion.select(staged), /edition differs/);
  }
});
test('reviewed fixed-block tuples reject mixed bytes and editions in canonical and immutable paths', () => {
  for (const id of [
    'issue76-plain',
    'issue76-staging',
    'issue76-production',
    'issue39-plain',
    'issue39-licensed-plain',
    'issue39-licensed-compact-plain',
    'issue39-writing-tbt-plain',
    'issue39-css-clock-plain',
    'issue39-staging',
    'issue39-licensed-staging',
    'issue39-licensed-compact-staging',
    'issue39-writing-tbt-staging',
    'issue39-css-clock-staging',
    'issue39-production',
    'issue39-licensed-production',
    'issue39-licensed-compact-production',
    'issue39-writing-tbt-production',
    'issue39-css-clock-production',
  ]) {
    for (const name of ['theme.js', 'space.js', 'navigation.js', 'styles.css']) {
      const previous = motion.reviewedRuntime(
        name === 'styles.css'
          ? id.endsWith('-staging')
            ? 'fixed-plain'
            : 'fixed-staging'
          : 'fixed-plain'
      );
      for (const paths of ['canonical', 'immutable', 'both']) {
        const mixed = manifest(id);
        if (paths !== 'immutable') mixed.files[name].sha256 = previous.files[name];
        if (paths !== 'canonical') {
          mixed.files['runtime/' + mixed.variant.fingerprint + '/' + name].sha256 =
            previous.files[name];
        }
        assert.throws(() => motion.select(mixed), /Color bytes/);
      }
    }
    const wrongEdition = manifest(id);
    if (id.endsWith('-plain')) {
      wrongEdition.edition = { id: 'staging', indexable: false, analytics: false };
    } else {
      delete wrongEdition.edition;
    }
    assert.throws(() => motion.select(wrongEdition), /edition differs/);
  }
});
test('issue5 rejects prior navigation or reading CSS and mismatched plain/staging editions', () => {
  for (const edition of ['plain', 'staging']) {
    const id = 'issue5-' + edition;
    const previous = motion.reviewedRuntime('issue76-' + edition);
    for (const name of ['navigation.js', 'styles.css']) {
      for (const paths of ['canonical', 'immutable', 'both']) {
        const mixed = manifest(id);
        if (paths !== 'immutable') mixed.files[name].sha256 = previous.files[name];
        if (paths !== 'canonical') {
          mixed.files['runtime/' + mixed.variant.fingerprint + '/' + name].sha256 =
            previous.files[name];
        }
        assert.throws(() => motion.select(mixed), /Color bytes/);
      }
    }
    const otherEdition = edition === 'plain' ? 'staging' : 'plain';
    const other = motion.reviewedRuntime('issue5-' + otherEdition);
    const mixedStyle = manifest(id);
    mixedStyle.files['styles.css'].sha256 = other.files['styles.css'];
    assert.throws(() => motion.select(mixedStyle), /Color bytes/);
    const wrongEdition = manifest(id);
    if (edition === 'plain') {
      wrongEdition.edition = {
        id: 'staging',
        indexable: false,
        analytics: false,
      };
    } else {
      delete wrongEdition.edition;
    }
    assert.throws(() => motion.select(wrongEdition), /edition differs/);
  }
});
test('licensed contracts reject every missing or substituted canonical and immutable runtime file', () => {
  for (const id of [
    'issue39-licensed-plain',
    'issue39-licensed-compact-plain',
    'issue39-writing-tbt-plain',
    'issue39-css-clock-plain',
    'issue39-licensed-staging',
    'issue39-licensed-compact-staging',
    'issue39-writing-tbt-staging',
    'issue39-css-clock-staging',
    'issue39-licensed-production',
    'issue39-licensed-compact-production',
    'issue39-writing-tbt-production',
    'issue39-css-clock-production',
  ]) {
    const runtime = motion.reviewedRuntime(id);
    for (const name of Object.keys(runtime.files))
      for (const file of [name, 'runtime/' + runtime.variant.fingerprint + '/' + name])
        for (const missing of [false, true]) {
          const value = manifest(id);
          if (missing) delete value.files[file];
          else value.files[file].sha256 = '0'.repeat(64);
          assert.throws(() => motion.select(value), /Color bytes/);
        }
  }
});
test('full Color aggregation preserves all twelve engine, viewport and theme cells for reviewed contracts', () => {
  for (const id of [
    'legacy-plain',
    'fixed-plain',
    'issue76-plain',
    'issue5-plain',
    'issue39-licensed-plain',
    'issue76-production',
    'issue39-plain',
    'issue39-licensed-compact-plain',
    'issue39-writing-tbt-plain',
    'issue39-css-clock-plain',
    'issue39-production',
    'issue39-licensed-production',
    'issue39-licensed-compact-production',
    'issue39-writing-tbt-production',
    'issue39-css-clock-production',
  ]) {
    const value = evidence(id),
      report = value.reports.at(-1),
      model = report.rows[0],
      fixed = motion.select(value.manifest).behavior === 'fixed-blocks';
    report.kind = 'color-functional';
    report.smoke = false;
    delete report.profile;
    delete report.fullGate;
    report.browsers = ['chromium', 'firefox', 'webkit'].map((engine) => ({
      engine,
      version: 'controlled full Color fixture; not a real browser launch',
    }));
    report.rows = ['chromium', 'firefox', 'webkit'].flatMap((engine) =>
      [1440, 390].flatMap((width) =>
        ['light', 'dark'].map((theme) => ({
          ...structuredClone(model),
          engine,
          width,
          theme,
          ...(fixed ? { flight: blockSamples(width) } : {}),
        }))
      )
    );
    quality.colorReports([report], value.manifest);
    const invalid = [
      (r) => (r.browsers = r.browsers.filter((browser) => browser.engine !== 'webkit')),
      (r) => (r.browsers[0] = structuredClone(r.browsers[1])),
      (r) => (r.browsers[0].version = ''),
      (r) => (r.rows = r.rows.filter((row) => row.engine !== 'webkit')),
      (r) => (r.rows[0] = structuredClone(r.rows[1])),
      (r) => (r.rows[0].theme = 'other'),
      (r) => (r.rows[0].checks.disabledEdge = false),
      (r) => (r.rows[0].checks.creditsBoundary = false),
      (r) => (r.rows[0].paint.customShapes = 1),
      (r) => delete r.motionContract,
      (r) => (r.rows[0].motionContract = motion.reviewedRuntime('legacy-staging')),
      (r) => (r.rows[0].flight = []),
    ];
    if (fixed) invalid.push((r) => (r.rows[0].home.scroll.samples[0].camera = 'moving'));
    else invalid.push((r) => (r.rows[0].flight[0].plane.flightDepth = -1));
    for (const mutate of invalid) {
      const copy = structuredClone(report);
      mutate(copy);
      assert.throws(() => quality.colorReports([copy], value.manifest));
    }
  }
});
test('reviewed report guard branches reject wrong planes, moving reading cameras and false contract claims', () => {
  for (const id of [
    'legacy-plain',
    'fixed-plain',
    'issue76-plain',
    'issue76-staging',
    'issue5-plain',
    'issue5-staging',
    'issue39-plain',
    'issue39-licensed-plain',
    'issue39-licensed-compact-plain',
    'issue39-writing-tbt-plain',
    'issue39-css-clock-plain',
    'issue39-staging',
    'issue39-licensed-staging',
    'issue39-licensed-compact-staging',
    'issue39-writing-tbt-staging',
    'issue39-css-clock-staging',
    'issue39-production',
    'issue39-licensed-production',
    'issue39-licensed-compact-production',
    'issue39-writing-tbt-production',
    'issue39-css-clock-production',
  ]) {
    const value = evidence(id),
      report = value.reports.at(-1);
    assert.equal(stage.validateColor(report, value.manifest), 2);
    const invalid = [
      (r) => delete r.motionContract,
      (r) => (r.rows[0].motionContract = motion.reviewedRuntime('legacy-staging')),
      (r) => (r.rows[0].checks[motion.flightCheck(value.manifest)] = false),
      (r) => (r.rows[0].flight = []),
    ];
    if (motion.select(value.manifest).behavior === 'fixed-blocks')
      invalid.push(
        (r) => (r.rows[0].home.scroll.samples[2].camera = 'moving'),
        (r) => (r.rows[0].home.scroll.samples[3].y = 999),
        (r) =>
          (r.rows[0].home.scroll.start = JSON.stringify({
            position: [0, 0, 0],
            target: [0, 0, 0],
          })),
        (r) => (r.rows[0].flight[0].opacity = 0.5),
        (r) => (r.rows[0].flight[0].transform = 'translateZ(10px)'),
        (r) => (r.rows[0].flight[3].framing = 0.8),
        (r) => (r.rows[0].flight[6].cameraStage = 'restore')
      );
    else
      invalid.push(
        (r) => (r.rows[0].flight[0].plane.flightDepth = -1),
        (r) => (r.rows[0].flight[1].plane.flightDepth = 1),
        (r) => (r.rows[0].flight = blockSamples())
      );
    for (const mutate of invalid) {
      const copy = structuredClone(value);
      mutate(copy.reports.at(-1));
      assert.throws(() => stage.validateColor(copy.reports.at(-1), copy.manifest));
      assert.throws(() => gate.aggregate(copy));
    }
  }
});
function serializeDelays(samples) {
  for (const sample of samples)
    for (const unit of sample.units)
      for (const layer of unit.layers)
        layer.animation.delay = Number((layer.animation.delay / 1000).toPrecision(6)) * 1000;
}
test('fixed native row waves preserve direction, exact duration, overlap and serialization bounds', () => {
  const block = require('../tools/quality/block-flight.cjs');
  for (const width of [1440, 390])
    for (const direction of ['forward', 'backward'])
      for (const rows of [8, 24]) {
        const samples = blockSamples(width, direction, rows);
        serializeDelays(samples);
        block.checkTiming(samples);
        const wrong = structuredClone(samples);
        for (const layer of wrong[0].units.find((unit) => unit.order === 1).layers)
          layer.animation.delay += 0.002;
        assert.throws(() => block.checkTiming(wrong));
      }
  const mutations = [
    (s) => s[0].units.forEach((u) => u.layers.forEach((l) => (l.animation.duration += 0.001))),
    (s) => s[0].units.forEach((u) => u.layers.forEach((l) => (l.animation.delay = u.order * 700))),
    (s) => (s[0].units[0].layers[0].animation.delay = 0.0001),
    (s) => {
      const separator = s[0].units.flatMap((unit) => unit.layers).find((layer) => layer.separator);
      separator.separatorPaint.color = 'transparent';
    },
  ];
  for (const mutate of mutations) {
    const samples = blockSamples();
    mutate(samples);
    assert.throws(() => block.checkTiming(samples));
  }
});
test('fixed flight readiness waits for block arrival after the camera settles and never retries legacy checks', async () => {
  let busy = true,
    clicks = 0,
    evaluations = 0;
  const samples = blockSamples(),
    page = {
      viewportSize() {
        return { width: 1440 };
      },
      async evaluate(fn) {
        evaluations++;
        return fn.toString().includes('__flightSamples =') ? undefined : samples;
      },
      locator() {
        return {
          async click() {
            clicks++;
          },
        };
      },
      async waitForFunction(fn, route, options) {
        assert.equal(
          options.timeout,
          require('../tools/quality/transition-pacing.cjs').deadline(1440),
          'fixed Color keeps the authored pacing deadline'
        );
        const vm = require('node:vm'),
          context = {
            id: route,
            document: {
              body: { dataset: { page: 'research' } },
              getElementById: () => ({ hasAttribute: () => busy }),
              querySelector: () => ({ dataset: { travel: 'settled' } }),
            },
          },
          ready = () => vm.runInNewContext('(' + fn.toString() + ')(id)', context);
        assert.equal(ready(), false, 'settled camera with active arriving blocks is not ready');
        busy = false;
        assert.equal(ready(), true);
      },
    };
  assert.equal(await color.forwardFlight(page, manifest('fixed-plain')), samples);
  assert.equal(clicks, 1);
  assert.equal(evaluations, 2, 'only fixed capture setup and retrieval ran');
  samples[0].opacity = 0.5;
  busy = true;
  await assert.rejects(() => color.forwardFlight(page, manifest('fixed-plain')));
  assert.equal(evaluations, 4, 'failed fixed guards never collect legacy plane states');
});
test('legacy Color keeps its deadline and requires matching route, finished content and settled camera', async () => {
  let waits = 0,
    busy = true;
  const scene = { dataset: { travel: 'flying' } },
    body = { dataset: { page: 'index' } },
    page = {
      async waitForFunction(fn, route, options) {
        waits++;
        assert.equal(options.timeout, 10000, 'legacy Color deadline remains unchanged');
        const context = {
            id: route,
            document: {
              body,
              getElementById: () => ({ hasAttribute: () => busy }),
              querySelector: () => scene,
            },
          },
          ready = () => require('node:vm').runInNewContext('(' + fn.toString() + ')(id)', context);
        assert.equal(ready(), false);
        body.dataset.page = route;
        assert.equal(ready(), false, 'active content and camera are not ready');
        busy = false;
        assert.equal(ready(), false, 'flying camera is not ready');
        scene.dataset.travel = 'settled';
        assert.equal(ready(), true);
        body.dataset.page = 'index';
        assert.equal(ready(), false, 'another route is not ready');
      },
    };
  await color.settled(page, 'research', manifest('legacy-plain'));
  const unknown = manifest('legacy-plain');
  unknown.files['styles.css'].sha256 = '0'.repeat(64);
  await assert.rejects(() => color.settled(page, 'research', unknown), /Color bytes/);
  assert.equal(waits, 1, 'unreviewed identity cannot start readiness polling');
});

test('reader-link runtime tuples reproduce the complete current plain and staging byte closure', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const os = require('node:os');
  const build = require('../tools/site/build.cjs');
  const artifact = require('../tools/quality/artifact.cjs');
  const colorBuild = require('../tools/staging/color.cjs');
  const stagingBuild = require('../tools/staging/edition.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'content-color-contract-'));
  try {
    const plainDirectory = path.join(directory, 'plain');
    const publicDirectory = path.join(plainDirectory, 'public');
    build.build({
      output: publicDirectory,
      all: true,
      cacheFile: path.join(directory, 'cache.json'),
      lockFile: path.join(directory, 'lock.json'),
    });
    const source = {
      schema: 1,
      sourceCommit: '1'.repeat(40),
      ...artifact.manifest(publicDirectory),
    };
    fs.writeFileSync(path.join(plainDirectory, 'artifact.json'), JSON.stringify(source));
    const plain = colorBuild.build(plainDirectory);
    assert.equal(motion.select(plain).id, 'issue5-reader-resources-plain');
    const stagingDirectory = path.join(directory, 'staging');
    fs.cpSync(plainDirectory, stagingDirectory, { recursive: true });
    const staged = stagingBuild.build(stagingDirectory);
    assert.equal(motion.select(staged).id, 'issue5-reader-resources-staging');
    for (const record of [plain, staged]) {
      assert.deepEqual(record.components.navigation, { contract: 1, articleRenderer: 1 });
      assert.equal(
        record.variant.baseEngine,
        motion.reviewedRuntime('issue5-reader-resources-plain').variant.baseEngine
      );
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('content registry admission rejects older article navigation, archive counting and substituted bytes', () => {
  for (const edition of ['plain', 'staging']) {
    const id = 'issue5-content-' + edition;
    const previous = motion.reviewedRuntime('issue5-viewport-' + edition);
    for (const name of ['navigation.js', 'archive.js']) {
      for (const location of ['canonical', 'immutable', 'both']) {
        const mixed = manifest(id);
        if (location !== 'immutable') mixed.files[name].sha256 = previous.files[name];
        if (location !== 'canonical')
          mixed.files['runtime/' + mixed.variant.fingerprint + '/' + name].sha256 =
            previous.files[name];
        assert.throws(() => motion.select(mixed), /Color bytes/);
      }
    }
    const foreign = manifest(id);
    foreign.variant.baseEngine = previous.variant.baseEngine;
    assert.throws(() => motion.select(foreign), /Color motion identity/);
    const corrupt = manifest(id);
    corrupt.files['navigation.js'].sha256 = '0'.repeat(64);
    assert.throws(() => motion.select(corrupt), /Color bytes/);
  }
});

test('presentation admission rejects prior viewer-free runtime bytes and mismatched editions', () => {
  for (const edition of ['plain', 'staging']) {
    const id = 'issue5-presentation-' + edition;
    const previous = motion.reviewedRuntime('issue5-content-' + edition);
    for (const name of ['navigation.js', 'styles.css']) {
      for (const location of ['canonical', 'immutable', 'both']) {
        const mixed = manifest(id);
        if (location !== 'immutable') mixed.files[name].sha256 = previous.files[name];
        if (location !== 'canonical')
          mixed.files['runtime/' + mixed.variant.fingerprint + '/' + name].sha256 =
            previous.files[name];
        assert.throws(() => motion.select(mixed), /Color bytes/);
      }
    }
    const foreign = manifest(id);
    foreign.variant.baseEngine = previous.variant.baseEngine;
    assert.throws(() => motion.select(foreign), /Color motion identity/);
    const wrongEdition = manifest(id);
    if (edition === 'plain') {
      wrongEdition.edition = { id: 'staging', indexable: false, analytics: false };
    } else {
      delete wrongEdition.edition;
    }
    assert.throws(() => motion.select(wrongEdition), /edition differs/);
  }
});

test('reader-link producer identities retain exact runtime bytes and reject mixed admission tuples', () => {
  for (const edition of ['plain', 'staging']) {
    const id = 'issue5-reader-links-' + edition;
    const current = motion.reviewedRuntime(id);
    const previous = motion.reviewedRuntime('issue5-presentation-' + edition);
    assert.deepEqual(
      current.files,
      previous.files,
      'producer revision preserves every runtime file'
    );
    assert.notEqual(current.variant.baseEngine, previous.variant.baseEngine);
    assert.notEqual(current.variant.fingerprint, previous.variant.fingerprint);
    for (const name of Object.keys(current.files)) {
      for (const location of ['canonical', 'immutable', 'both']) {
        const mixed = manifest(id);
        if (location !== 'immutable') mixed.files[name].sha256 = '0'.repeat(64);
        if (location !== 'canonical')
          mixed.files['runtime/' + mixed.variant.fingerprint + '/' + name].sha256 = '0'.repeat(64);
        assert.throws(() => motion.select(mixed), /Color bytes/);
      }
    }
    const foreign = manifest(id);
    foreign.variant.baseEngine = previous.variant.baseEngine;
    assert.throws(() => motion.select(foreign), /Color motion identity/);
    const stale = manifest(id);
    stale.variant.fingerprint = previous.variant.fingerprint;
    stale.components.engine = previous.variant.fingerprint;
    assert.throws(() => motion.select(stale), /Color motion identity/);
    const wrongEdition = manifest(id);
    if (edition === 'plain') {
      wrongEdition.edition = { id: 'staging', indexable: false, analytics: false };
    } else {
      delete wrongEdition.edition;
    }
    assert.throws(() => motion.select(wrongEdition), /edition differs/);
  }
});
