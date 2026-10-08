'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const {
  beforeCommit,
  configuration,
  plan,
  validateIdentities,
  unionDuration,
  windowSummary,
  splitFlight,
  distribution,
  pairedDeltas,
} = require('../tools/quality/writing-diagnosis.cjs');
const candidate = 'a'.repeat(40),
  tree = 'b'.repeat(40),
  engine = 'c'.repeat(64);
function identities() {
  const base = {
    sourceDirty: false,
    sourceCommit: candidate,
    candidateCommit: candidate,
    sourceTree: tree,
    artifactDigest: 'd'.repeat(64),
    components: { contract: 1, engine },
  };
  const visual = { id: 'color', contract: 1, fingerprint: 'e'.repeat(64), baseEngine: engine };
  const color = {
    ...base,
    artifactDigest: 'f'.repeat(64),
    variant: visual,
    components: { contract: 1, engine: visual.fingerprint, variant: visual },
    derivation: { baseArtifactDigest: base.artifactDigest },
  };
  const previous = {
    ...color,
    sourceCommit: beforeCommit,
    candidateCommit: beforeCommit,
    sourceTree: '1'.repeat(40),
    artifactDigest: '2'.repeat(64),
  };
  const interventionVariant = { ...visual, fingerprint: '3'.repeat(64) };
  const intervention = {
    ...color,
    artifactDigest: '4'.repeat(64),
    variant: interventionVariant,
    components: {
      contract: 1,
      engine: interventionVariant.fingerprint,
      variant: interventionVariant,
    },
    derivation: {
      kind: 'writing-diagnostic-intervention',
      intervention: 'no-ribbons',
      baseArtifactDigest: color.artifactDigest,
      patches: [{ file: 'space.js', matches: 1 }],
    },
  };
  return {
    'before-color': { manifest: previous },
    'current-base': { manifest: base },
    'current-color': { manifest: color },
    'no-ribbons': { manifest: intervention },
  };
}
function rawFlight({ prewarm = false, slow = false } = {}) {
  const frames = [110, 250, 400, 600, 800, 1000, 1200, 1390, 1450, 1690, 1870].map((started) => ({
    time: started - 2,
    started,
    duration: started === 1390 ? 30 : 10,
    painted: true,
  }));
  if (slow) frames[4].duration = 250;
  const events = [
    { kind: 'navigation-start', time: 100 },
    { kind: 'layout', time: 740, start: 700, duration: 40 },
    { kind: 'navigation-ready', time: 1400 },
    { kind: 'model', route: 'writing', time: 1720, start: 1690, duration: 30 },
  ];
  events.push(
    prewarm
      ? { kind: 'model', route: 'writing', time: 90, start: 50, duration: 40 }
      : { kind: 'model', route: 'writing', time: 480, start: 400, duration: 80 }
  );
  if (prewarm) events.push({ kind: 'diagnostic-preparation', time: 90, start: 50, duration: 40 });
  return {
    schema: 2,
    start: 40,
    end: 1900,
    elapsed: 1860,
    state: 'active',
    quality: '2',
    cadence: '30',
    frames,
    events,
    longTasks: [
      { start: 1390, duration: 80 },
      { start: 1800, duration: 150 },
    ],
    states: frames.map((x) => ({
      time: x.time,
      started: x.started,
      travel: x.started < 1400 ? 'flying' : 'settled',
      geometry: 'full',
      route: 'writing',
    })),
  };
}

test('default screen is bounded and keeps 2×2, base and edge controls', () => {
  const available = [
    'no-ribbons',
    'no-canvas-draw',
    'model-prewarm',
    'edge-bypass',
    'thematic-off',
    'shared-off',
  ];
  const selected = plan('screen', available),
    v0 = selected.rows.filter((x) => x.group === 'v0'),
    h1 = selected.rows.filter((x) => x.group === 'h1');
  assert.equal(v0.filter((x) => x.profile === 'desktop').length, 12);
  assert.equal(v0.filter((x) => x.profile === 'mobile').length, 2);
  assert.deepEqual(
    v0.filter((x) => x.profile === 'desktop').map((x) => x.label),
    [
      'before-color',
      'current-color',
      'current-color',
      'before-color',
      'before-color',
      'current-color',
      'current-color',
      'before-color',
      'before-color',
      'current-color',
      'current-color',
      'before-color',
    ]
  );
  assert.deepEqual(
    h1.filter((x) => x.label !== 'current-base').map((x) => [x.label, x.contentFlight]),
    [
      ['current-color', true],
      ['no-ribbons', true],
      ['no-ribbons', false],
      ['current-color', false],
    ]
  );
  assert.ok(
    h1.some((x) => x.label === 'current-base' && !x.contentFlight && x.boot && x.fineStages)
  );
  assert.deepEqual(
    selected.rows.filter((x) => x.group === 'edge').map((x) => x.label),
    ['current-color', 'edge-bypass']
  );
  assert.ok(!selected.rows.some((x) => ['h4', 'h5'].includes(x.group)));
  assert.ok(selected.deferred.some((x) => x.label === 'archive-block'));
});
test('repeat counts are configurable but never become an unbounded matrix', () => {
  const selected = plan('v0', [], { desktopPairs: 3, mobilePairs: 6 });
  assert.equal(selected.rows.length, 18);
  assert.equal(configuration('v0').mode, 'v0');
  assert.throws(() => configuration({ desktopPairs: 7 }));
  assert.throws(() => configuration({ mobilePairs: -1 }));
  assert.throws(() => configuration({ desktopPairs: 0, mobilePairs: 0 }));
  assert.throws(() => configuration({ fullGate: true }));
  assert.throws(() => configuration({ before: 'branch-name' }));
});
test('missing optional renditions are recorded as deferred and are never substituted', () => {
  const selected = plan('h3', []);
  assert.deepEqual(
    selected.rows.map((x) => x.label),
    ['current-color']
  );
  assert.deepEqual(
    selected.deferred.map((x) => x.label),
    ['model-prewarm']
  );
  assert.throws(() => plan('soak'));
});
test('control and intervention lineage rejects mismatched source or reused identities', () => {
  assert.equal(validateIdentities(identities(), candidate), true);
  for (const mutate of [
    (x) => (x['before-color'].manifest.sourceCommit = candidate),
    (x) => (x['current-color'].manifest.sourceDirty = true),
    (x) => (x['current-color'].manifest.derivation.baseArtifactDigest = '9'.repeat(64)),
    (x) => (x['current-base'].manifest.sourceTree = '9'.repeat(40)),
    (x) => (x['no-ribbons'].manifest.sourceTree = '9'.repeat(40)),
    (x) => (x['no-ribbons'].manifest.derivation.intervention = 'other'),
    (x) => (x['no-ribbons'].manifest.derivation.baseArtifactDigest = '9'.repeat(64)),
    (x) =>
      (x['no-ribbons'].manifest.variant.fingerprint =
        x['current-color'].manifest.variant.fingerprint),
    (x) => (x['no-ribbons'].manifest.artifactDigest = x['current-color'].manifest.artifactDigest),
    (x) => (x['no-ribbons'].manifest.derivation.patches = []),
  ]) {
    const input = identities();
    mutate(input);
    assert.throws(() => validateIdentities(input, candidate));
  }
  assert.throws(() => validateIdentities(identities(), undefined));
});
test('preparation union clips windows and avoids nested/double-counted spans', () => {
  assert.equal(
    unionDuration(
      [
        { start: 0, duration: 20 },
        { start: 5, duration: 10 },
        { start: 18, duration: 12 },
        { start: 50, duration: 10 },
      ],
      10,
      55
    ),
    25
  );
  assert.equal(unionDuration([], 0, 100), 0);
});
test('ready latency stays exact while its containing callback and tail remain complete', () => {
  const raw = rawFlight(),
    row = splitFlight(raw);
  assert.equal(row.normal.readyMs, 1300);
  assert.equal(row.inputToReadyMs, 1360);
  assert.equal(row.normal.window.endMs, 1420);
  assert.equal(row.normal.requestedEndMs, 1400);
  assert.equal(row.readyCallbackTailMs, 20);
  assert.equal(row.normal.rawFrames.at(-1).started, 1390);
  assert.equal(row.normal.rawFrames.at(-1).duration, 30);
  assert.equal(row.arrival.window.startMs, 1420);
  assert.equal(row.arrival.requestedEndMs, 1820);
  assert.equal(row.inclusive.window.endMs, 1820);
  assert.equal(row.arrival.rawPreparation.length, 1);
  assert.equal(row.normal.rawPreparation.length, 2);
  assert.equal(row.normal.transitionPhase, 'cold');
  assert.equal(row.normal.budgetPass, true);
  assert.equal(row.normal.overlappingLongTasks.length, 1);
  assert.equal(row.normal.rawLongTasks.length, 0);
  assert.ok(raw.frames.some((x) => x.started === 1870));
  assert.ok(!row.inclusive.rawFrames.some((x) => x.started === 1870));
});
test('prewarming cannot hide preparation from inclusive totals or input latency', () => {
  const row = splitFlight(rawFlight({ prewarm: true }));
  assert.equal(row.normal.transitionPhase, 'warm');
  assert.equal(row.normal.preparationMs.total, 40);
  assert.equal(row.inclusive.preparationMs.total, 110);
  assert.equal(row.preparationAndFlightUnionMs, 110);
  assert.equal(row.diagnosticPreparation[0].duration, 40);
  assert.equal(row.firstFlightPaintResponseMs, 70);
  assert.equal(row.inputToReadyMs, 1360);
});
test('slow and incomplete transitions remain failures with raw windows', () => {
  const row = splitFlight(rawFlight({ slow: true }));
  assert.equal(row.normal.budgetPass, false);
  assert.match(row.normal.budgetError, /slow transition|blocked transition/);
  assert.ok(row.normal.rawFrames.some((x) => x.duration === 250));
  assert.throws(() => splitFlight({ ...rawFlight(), end: 1600 }), /incomplete arrival/);
  assert.throws(
    () =>
      splitFlight({
        ...rawFlight(),
        events: rawFlight().events.filter((x) => x.kind !== 'navigation-ready'),
      }),
    /one navigation ready/
  );
});
test('tail boundary callback is retained whole instead of producing inconsistent bounds', () => {
  const raw = rawFlight();
  raw.frames.push({ time: 1813, started: 1815, duration: 25, painted: true });
  const row = splitFlight(raw);
  assert.equal(row.arrival.requestedEndMs, 1820);
  assert.equal(row.arrival.window.endMs, 1840);
  assert.equal(row.inclusive.window.endMs, 1840);
  assert.ok(row.arrival.rawFrames.every((x) => x.started + x.duration <= row.arrival.window.endMs));
  assert.throws(
    () => windowSummary({ ...raw, end: 1820 }, 'tail', 1420, 1820),
    /full boundary callback/
  );
});
test('small-screen distributions and paired deltas retain sample count and failed pairs', () => {
  assert.deepEqual(distribution([9, 3, 7]), {
    count: 3,
    median: 7,
    min: 3,
    max: 9,
    values: [9, 3, 7],
  });
  assert.equal(distribution([1, 5]).median, 3);
  assert.equal(distribution([]).median, null);
  const before = splitFlight(rawFlight()),
    after = splitFlight(rawFlight({ prewarm: true }));
  const rows = [
    {
      group: 'v0',
      profile: 'desktop',
      pair: 0,
      label: 'before-color',
      navigation: { rows: [before] },
    },
    {
      group: 'v0',
      profile: 'desktop',
      pair: 0,
      label: 'current-color',
      navigation: { rows: [after] },
    },
    { group: 'v0', profile: 'mobile', pair: 0, label: 'before-color', error: 'timeout' },
  ];
  const deltas = pairedDeltas(rows);
  assert.equal(deltas[0].complete, true);
  assert.equal(deltas[0].afterMinusBefore.inputToReadyMs, 0);
  assert.equal(deltas[1].complete, false);
});

test('clean confirmation repeats direct cold boot in both sides of each pair', () => {
  const settings = configuration({ mode: 'v0', desktopPairs: 3, mobilePairs: 6, directBoot: true });
  const selected = plan('v0', ['before-color', 'current-color'], settings);
  assert.equal(selected.rows.length, 18);
  assert.ok(selected.rows.every((row) => row.boot && !row.fineStages));
  assert.throws(() => configuration({ directBoot: 'true' }), /explicit boolean/);
});
