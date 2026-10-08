'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const {
  labels,
  artifactLabels,
  configuration,
  plan,
  validateInputs,
  summarizeStages,
  summarizeModels,
  interventionIdentity,
  collectTrial,
  auditFailures,
} = require('../tools/quality/writing-localization.cjs');
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
  const inputs = { 'current-base': { manifest: base }, 'current-color': { manifest: color } };
  for (const [index, label] of artifactLabels.slice(2).entries()) {
    const diagnosticVariant = { ...visual, fingerprint: (index + 1).toString().repeat(64) };
    inputs[label] = {
      manifest: {
        ...color,
        artifactDigest: (index + 5).toString(16).repeat(64),
        variant: diagnosticVariant,
        components: {
          contract: 1,
          engine: diagnosticVariant.fingerprint,
          variant: diagnosticVariant,
        },
        derivation: {
          kind: 'writing-diagnostic-intervention',
          intervention: label,
          baseArtifactDigest: color.artifactDigest,
          patches: [{ file: 'space.js', matches: 1 }],
        },
      },
    };
  }
  return inputs;
}

test('localization is exactly two balanced mobile rounds with separate layout intervention identities', () => {
  const selected = plan(artifactLabels);
  assert.equal(selected.rows.length, 20);
  assert.deepEqual(
    selected.rows.slice(0, 10).map((x) => x.label),
    labels
  );
  assert.deepEqual(
    selected.rows.slice(10).map((x) => x.label),
    [...labels].reverse()
  );
  assert.ok(
    selected.rows.every((x) => x.profile === 'mobile' && x.fineStages && x.boot && x.contentFlight)
  );
  assert.ok(selected.rows.every((x) => x.inputLabel === x.label));
  assert.throws(() => configuration({ repeats: 1 }), /two balanced/);
  assert.throws(() => configuration({ fullGate: true }), /full gate/);
  assert.throws(
    () => plan(artifactLabels.filter((x) => x !== 'model-no-shared')),
    /missing planned.*model-no-shared/
  );
});

test('every artifact shares exact source tree with canonical Color and has explicit private lineage', () => {
  assert.equal(validateInputs(identities(), candidate, engine), true);
  for (const mutate of [
    (x) => (x['model-profile'].manifest.sourceTree = '9'.repeat(40)),
    (x) => (x['model-no-thematic'].manifest.derivation.intervention = 'thematic-off'),
    (x) => (x['model-no-shared'].manifest.derivation.baseArtifactDigest = '9'.repeat(64)),
    (x) =>
      (x['model-profile'].manifest.artifactDigest = x['current-color'].manifest.artifactDigest),
    (x) => delete x['shared-off'],
  ]) {
    const input = identities();
    mutate(input);
    assert.throws(() => validateInputs(input, candidate, engine));
  }
  assert.throws(() => validateInputs(identities(), undefined, engine), /exact current/);
});

test('layout experiments identify derived artifact, exact installer, calibration and canonical parent', () => {
  const inputs = identities(),
    manifest = inputs['layout-control'].manifest,
    calibration = { height: 2300, range: 1456 },
    installer = '7'.repeat(64);
  const control = interventionIdentity('layout-control', manifest, calibration, installer),
    removed = interventionIdentity(
      'controls-off',
      inputs['controls-off'].manifest,
      calibration,
      installer
    );
  assert.equal(control.baseArtifactDigest, inputs['current-color'].manifest.artifactDigest);
  assert.equal(control.artifactDigest, manifest.artifactDigest);
  assert.equal(control.installerDigest, installer);
  assert.notEqual(control.experimentFingerprint, removed.experimentFingerprint);
  assert.notEqual(
    control.experimentFingerprint,
    interventionIdentity('layout-control', manifest, { ...calibration, height: 2301 }, installer)
      .experimentFingerprint
  );
  assert.equal(
    interventionIdentity('current-color', inputs['current-color'].manifest, calibration, installer)
      .kind,
    'canonical-control'
  );
});

test('stage breakdown retains per-symbol raw spans and avoids nested sum inflation', () => {
  const raw = {
    start: 0,
    end: 100,
    events: [
      {
        kind: 'stage',
        part: 'model-symbol',
        route: 'writing',
        symbol: 'scroll',
        start: 10,
        duration: 20,
      },
      {
        kind: 'stage',
        part: 'model-symbol',
        route: 'writing',
        symbol: 'scroll',
        start: 15,
        duration: 8,
      },
      { kind: 'stage', part: 'model-build', route: 'writing', start: 5, duration: 70 },
      { kind: 'model', route: 'writing', start: 5, duration: 70 },
    ],
  };
  const summary = summarizeStages(raw);
  assert.equal(summary['model-symbol/writing//scroll'].count, 2);
  assert.equal(summary['model-symbol/writing//scroll'].unionMs, 20);
  assert.equal(summary['model-build/writing//'].unionMs, 70);
  assert.equal(Object.keys(summary).length, 2);
});

test('accumulated symbol construction durations remain separate from elapsed stage spans', () => {
  const event = {
    kind: 'model-profile',
    part: 'symbol-construction',
    route: 'writing',
    family: 'thematic',
    symbol: 'scroll',
    compact: true,
    start: 0,
    end: 80,
    duration: 12,
    count: 28,
    templateMisses: 1,
    vertices: 1120,
    faces: 700,
    lines: 616,
    disjoint: true,
  };
  const raw = {
      start: 0,
      end: 100,
      events: [
        event,
        { kind: 'stage', part: 'model-build', route: 'writing', start: 0, duration: 90 },
      ],
    },
    models = summarizeModels(raw),
    stages = summarizeStages(raw);
  assert.equal(
    models['symbol-construction/writing/thematic/scroll/compact'].constructionDurationMs.median,
    12
  );
  assert.equal(models['symbol-construction/writing/thematic/scroll/compact'].instances.median, 28);
  assert.equal(stages['model-build/writing//'].unionMs, 90);
  assert.equal(Object.keys(stages).length, 1);
  assert.equal(models['symbol-construction/writing/thematic/scroll/compact'].unionMs, undefined);
});

test('failed boot retains partial raw and stops that itinerary, without hiding later trial availability', async () => {
  const row = { id: 'failed', inputLabel: 'current-color' },
    evidence = { rawFailure: { frames: [{ duration: 200 }] } };
  let flights = 0,
    saves = 0;
  await collectTrial(
    row,
    {},
    'http://local',
    {},
    null,
    {
      boot: async () => {
        const error = Error('timeout');
        error.evidenceKind = 'boot';
        error.evidence = evidence;
        throw error;
      },
      flights: async () => {
        flights++;
      },
    },
    () => {
      saves++;
    }
  );
  assert.equal(row.status, 'error');
  assert.equal(row.bootFailure, evidence);
  assert.equal(flights, 0);
  assert.equal(saves, 1);
  assert.match(row.error, /timeout/);
});

test('failed navigation retains successful direct boot and partial navigation data', async () => {
  const row = { id: 'failed-navigation', inputLabel: 'current-color' },
    bootResult = { rawBoot: { frames: [{ duration: 70 }] } },
    evidence = { rows: [{ raw: { frames: [{ duration: 180 }] } }] };
  await collectTrial(row, {}, 'http://local', {}, null, {
    boot: async () => bootResult,
    flights: async () => {
      const error = Error('failed arrival');
      error.evidenceKind = 'navigation';
      error.evidence = evidence;
      throw error;
    },
  });
  assert.equal(row.status, 'error');
  assert.equal(row.bootResult, bootResult);
  assert.equal(row.navigationFailure, evidence);
});

test('post-window geometry audits are mandatory and failed audits retain measured windows', async () => {
  const calibration = { height: 2000 },
    row = { id: 'controls', inputLabel: 'current-color', layoutIntervention: 'controls-off' };
  let seen;
  const bootResult = { rawBoot: { frames: [] }, layoutAudit: { pass: true } },
    navigation = {
      rows: [
        { raw: { frames: [] }, layoutAudit: { pass: false, rangeDelta: 20 } },
        { raw: { frames: [] } },
        { raw: { frames: [] }, layoutAudit: { pass: true } },
      ],
    };
  await collectTrial(row, {}, 'http://local', {}, calibration, {
    boot: async (_url, _profile, options) => {
      seen = options.layoutConfiguration;
      return bootResult;
    },
    flights: async () => navigation,
  });
  assert.deepEqual(seen, { calibration, intervention: 'controls-off' });
  assert.equal(row.status, 'error');
  assert.equal(row.navigation, navigation);
  assert.equal(auditFailures(row).length, 1);
  const missing = {
    id: 'missing',
    inputLabel: 'current-color',
    layoutIntervention: 'layout-control',
  };
  await collectTrial(missing, {}, 'http://local', {}, calibration, {
    boot: async () => ({}),
    flights: async () => ({ rows: [{}, {}, {}] }),
  });
  assert.equal(missing.status, 'error');
  assert.match(missing.error, /missing post-window boot layout audit/);
});
