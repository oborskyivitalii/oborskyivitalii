'use strict';
// Transitional controller compatibility for two reviewed Color runtimes.
// Fingerprints alone cannot authorize a branch: the verified runtime bytes must
// also match. New runtime bytes require a separately reviewed contract update.
const assert = require('node:assert/strict');
const common = require('./common.cjs');
const families = {
  legacy: {
    behavior: 'following-spatial',
    baseEngine: 'fa4a705a0e232b75f58804ea4fd3b39a3b40c9a3e7343c09937a85378aae67d4',
    space: 'e8fad3a3b68c999c67597617de862036ec7a9e835e39fc1a737ea4522c0ff6d6',
    navigation: '63460e40eb0ee7d2e2d3001365bc2e85b88edb964cbd34852a7d58c58eafe6e4',
  },
  fixed: {
    behavior: 'fixed-blocks',
    baseEngine: 'b7db2524761e66f58160f2af8d245fdbc55d275ccc0a649673bb8afc53d5c9cc',
    space: '0107d6fc8c2ae706a562d6d80423af35c2ceb3c2459981b25dae9e897865feb4',
    navigation: 'f801bba9717cf262bee2c8d2ee529d4b1b995c8b3984e7a72a4619288a9910f2',
  },
};
const runtimes = [
  {
    id: 'legacy-plain',
    family: 'legacy',
    edition: 'plain',
    fingerprint: 'bb973c6459ba89fbbaa7abb6b2bfb67f9adc675efc382bf9a864d308acde8a54',
    styles: 'ddf1e07ba9097140acc81cb79b6fbfcfee8d4ce4c5c624d95a6a4713cc0d524e',
  },
  {
    id: 'legacy-staging',
    family: 'legacy',
    edition: 'staging',
    fingerprint: 'b1fcbb9696d8e0fdc2c0fc35713f2a62048934f6840c0d2c0c683c26d0b84241',
    styles: '2a31faafb8f4f49b89a46b10d8e4f05a8aef86ca29133d2ff8a18bd6a10d2545',
  },
  {
    id: 'fixed-plain',
    family: 'fixed',
    edition: 'plain',
    fingerprint: '6b1ce6de9ab93436fefa3fe2e37d5948c47f01b909799598ed1c2e805592f5f4',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'fixed-staging',
    family: 'fixed',
    edition: 'staging',
    fingerprint: '7ffe1583b7fdb3f2858fba4ff294dea55e5ab2a80229b81210cf1005f4b8038e',
    styles: '545b7cb79e15706a80087ebc5cf5139b0c4af564d47f141b7a1ede0915c18a97',
  },
];
function reviewedRuntime(id) {
  const runtime = runtimes.find((item) => item.id === id);
  assert.ok(runtime, 'unknown reviewed Color runtime');
  const family = families[runtime.family];
  return {
    id: runtime.id,
    behavior: family.behavior,
    edition: runtime.edition,
    variant: {
      id: 'color',
      contract: 1,
      fingerprint: runtime.fingerprint,
      baseEngine: family.baseEngine,
      effects: ['travel'],
    },
    files: {
      'styles.css': runtime.styles,
      'theme.js': 'b6df1591a86ce1f18662e26679926f5433febd935c453952f2443f78f2c0e0ee',
      'space.js': family.space,
      'archive.js': '1307b2405daa50937e5746f4d8a71230842718377d853b4d0cf4704e7f2de9ad',
      'navigation.js': family.navigation,
    },
  };
}
function select(manifest) {
  const variant = common.variant(manifest);
  assert.equal(variant.id, 'color', 'Color motion requires a Color artifact');
  const declared = runtimes.find((item) => item.fingerprint === variant.fingerprint);
  assert.ok(declared, 'unreviewed Color motion runtime');
  const runtime = reviewedRuntime(declared.id);
  assert.deepEqual(variant, runtime.variant, 'conflicting Color motion identity');
  assert.equal(manifest.components?.engine, variant.fingerprint, 'Color engine differs');
  assert.equal(manifest.components?.contract, 1, 'Color scene contract differs');
  assert.deepEqual(
    manifest.edition,
    runtime.edition === 'staging'
      ? { id: 'staging', indexable: false, analytics: false }
      : undefined,
    'Color runtime edition differs'
  );
  for (const [name, hash] of Object.entries(runtime.files)) {
    assert.equal(manifest.files?.[name]?.sha256, hash, 'unreviewed Color bytes: ' + name);
    assert.equal(
      manifest.files?.['runtime/' + variant.fingerprint + '/' + name]?.sha256,
      hash,
      'conflicting immutable Color bytes: ' + name
    );
  }
  return runtime;
}
function flightCheck(manifest) {
  return select(manifest).behavior === 'fixed-blocks' ? 'blockFlight' : 'spatialFlight';
}
function fixedReadingEvidence(row) {
  const scroll = row.home?.scroll,
    model = require('../../docs/space.js');
  assert.equal(scroll?.label, 'selected-responses', 'missing fixed Home scroll evidence');
  assert.ok(Number.isFinite(scroll.end) && scroll.end >= 0, 'invalid fixed Home scroll range');
  assert.deepEqual(
    scroll.samples.map((sample) => sample.fraction),
    [0.9, 0.95, 0.99, 1],
    'missing fixed Home native gestures'
  );
  assert.deepEqual(
    JSON.parse(scroll.start),
    model.routePose('index', model.poses[model.initialPoses.index]),
    'fixed Home authored reading pose differs'
  );
  for (const sample of scroll.samples)
    assert.equal(sample.camera, scroll.start, 'reported fixed reading camera moved');
  assert.equal(scroll.samples.at(-1).y, scroll.end, 'reported fixed Home misses native bottom');
}
function validateFlight(row, manifest) {
  if (select(manifest).behavior === 'fixed-blocks') {
    fixedReadingEvidence(row);
    require('./block-flight.cjs').checkTiming(row.flight);
    return;
  }
  assert.ok(
    row.flight?.some(
      (sample) => sample.plane.flightStage === 'depart' && Number(sample.plane.flightDepth) > 0
    )
  );
  assert.ok(
    row.flight.some(
      (sample) => sample.plane.flightStage === 'arrive' && Number(sample.plane.flightDepth) < 0
    )
  );
}
// The reviewed block checker consumes this exact candidate pacing contract.
const contract = Object.freeze({
  maximumRows: 24,
  rows: Object.freeze({ durationMs: 700, phaseMs: 1000 }),
});
function rowPlan(width, rows) {
  assert.ok(Number.isFinite(width) && width > 0, 'missing pacing viewport');
  assert.ok(
    Number.isInteger(rows) && rows >= 0 && rows <= contract.maximumRows,
    'unbounded visual row plan'
  );
  const duration = rows === 1 ? contract.rows.phaseMs : contract.rows.durationMs;
  return {
    rowDurationMs: rows ? duration : 0,
    rowStepMs: rows > 1 ? (contract.rows.phaseMs - duration) / (rows - 1) : 0,
    plannedDurationMs: rows ? contract.rows.phaseMs : 0,
  };
}
module.exports = { select, reviewedRuntime, flightCheck, validateFlight, contract, rowPlan };
