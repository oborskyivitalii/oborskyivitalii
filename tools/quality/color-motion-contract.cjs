'use strict';
// Transitional controller compatibility for reviewed Color runtime families.
// Fingerprints alone cannot authorize a branch: the verified runtime bytes must
// also match. New runtime bytes require a separately reviewed contract update.
const assert = require('node:assert/strict');
const common = require('./common.cjs');
const families = {
  legacy: {
    behavior: 'following-spatial',
    baseEngine: 'fa4a705a0e232b75f58804ea4fd3b39a3b40c9a3e7343c09937a85378aae67d4',
    theme: 'b6df1591a86ce1f18662e26679926f5433febd935c453952f2443f78f2c0e0ee',
    space: 'e8fad3a3b68c999c67597617de862036ec7a9e835e39fc1a737ea4522c0ff6d6',
    navigation: '63460e40eb0ee7d2e2d3001365bc2e85b88edb964cbd34852a7d58c58eafe6e4',
  },
  fixed: {
    behavior: 'fixed-blocks',
    baseEngine: 'b7db2524761e66f58160f2af8d245fdbc55d275ccc0a649673bb8afc53d5c9cc',
    theme: 'b6df1591a86ce1f18662e26679926f5433febd935c453952f2443f78f2c0e0ee',
    space: '0107d6fc8c2ae706a562d6d80423af35c2ceb3c2459981b25dae9e897865feb4',
    navigation: 'f801bba9717cf262bee2c8d2ee529d4b1b995c8b3984e7a72a4619288a9910f2',
  },
  issue76: {
    behavior: 'fixed-blocks',
    baseEngine: '8ced6511a9420f145dd3409e168e0f9fa4786db025623165afa5e3cc13a6741d',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39: {
    behavior: 'fixed-blocks',
    baseEngine: '77a4d80ad8427e79d10a7c3cb6a5dd20a858296b74fef3e735e5f20578a428ad',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39Licensed: {
    behavior: 'fixed-blocks',
    baseEngine: '53bb494ae3b2bc9ea5b838755ee5b2b9c48fab7183fc6c53a2461dc44dbb004f',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39LicensedCompact: {
    behavior: 'fixed-blocks',
    baseEngine: '73ab537313a205583a5a1f912161092f7b98994d4415a1f70696e0236af7a0b8',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39WritingTbt: {
    behavior: 'fixed-blocks',
    baseEngine: 'ed13aef9321a94422fbe8c5b72150a7eb5f9f1ec883c61a0ad9a800dfc0655a5',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39CssClock: {
    behavior: 'fixed-blocks',
    baseEngine: 'd698a6c7db0821170873540183fb4443e3c84a65b1daee7f5368add4d2d7a9cb',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'f01ebd2fecef1164f68f40b032e0857ba232ba89b9af4bb85c208a3e10e3203e',
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
  {
    id: 'issue76-plain',
    family: 'issue76',
    edition: 'plain',
    fingerprint: '57999380a42cf44132b21d6d1a11fdb814abeaaac38ff3e25311ad6cd38052f8',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'issue76-staging',
    family: 'issue76',
    edition: 'staging',
    fingerprint: '49ab29ede2d117832a79151f02da524001024fa2109f79a9b55b7921bbb3dbd6',
    styles: '545b7cb79e15706a80087ebc5cf5139b0c4af564d47f141b7a1ede0915c18a97',
  },
  {
    id: 'issue76-production',
    family: 'issue76',
    edition: 'production',
    fingerprint: 'a7fed56c7d5019efd5c5dbf4b88c6fea711bd0c30a418cafcbb587a6af726442',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'issue39-plain',
    family: 'issue39',
    edition: 'plain',
    fingerprint: '38fd594346f5250133ff433c27bc25eb2e1bfc7865f53dd3a3be783690d14fcc',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'issue39-staging',
    family: 'issue39',
    edition: 'staging',
    fingerprint: '20001067aff1664b0dafe384dc1de7e3a1ce4d4a5647cc84d9f3eed639f63af8',
    styles: '545b7cb79e15706a80087ebc5cf5139b0c4af564d47f141b7a1ede0915c18a97',
  },
  {
    id: 'issue39-production',
    family: 'issue39',
    edition: 'production',
    fingerprint: 'b4202b7c567affcaaad94eec403329d45ea18fbfd886ac0a3556926ca045f196',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'issue39-licensed-plain',
    family: 'issue39Licensed',
    edition: 'plain',
    fingerprint: '3f806604b25fb2f7f8fa04c9a2338c6dc8780a8e6894e7300fb0a28c272e7827',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-licensed-staging',
    family: 'issue39Licensed',
    edition: 'staging',
    fingerprint: '79a40d3f5166b1ac87575db60bd9f24bcaef768d8158b7a963ae181ec58e777b',
    styles: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
  {
    id: 'issue39-licensed-production',
    family: 'issue39Licensed',
    edition: 'production',
    fingerprint: 'bb5a2643fed4d2caef69289634bffe4a35b0ceef2345affbf3be6f25903c9c06',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-licensed-compact-plain',
    family: 'issue39LicensedCompact',
    edition: 'plain',
    fingerprint: '80cda9414465974ced82ba891839ed7d6ec6e8a7d2194d3cd6122e323f263bf3',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-licensed-compact-staging',
    family: 'issue39LicensedCompact',
    edition: 'staging',
    fingerprint: '2c543a78d13b006840f151d99fdbf5f551e001d9ee04bbbed636a55fe6b6017d',
    styles: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
  {
    id: 'issue39-licensed-compact-production',
    family: 'issue39LicensedCompact',
    edition: 'production',
    fingerprint: 'b848de73373003be1f141f9d51d30d6fa7343df0b33ce41e00713335d553083e',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-writing-tbt-plain',
    family: 'issue39WritingTbt',
    edition: 'plain',
    fingerprint: '7e19acc943d0748d3976c989f2cea4f8126832de378a371aa71ecd091b75cab8',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-writing-tbt-staging',
    family: 'issue39WritingTbt',
    edition: 'staging',
    fingerprint: '4bbfd81338ddb659308ed833aa519d34f136278bacd6638efcdded6f8e968e2e',
    styles: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
  {
    id: 'issue39-writing-tbt-production',
    family: 'issue39WritingTbt',
    edition: 'production',
    fingerprint: '6f9b49f746e1a5f2e18138d8d34ee0f9dd2b35b7a68d6b6cbe2b015424e28cf4',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-css-clock-plain',
    family: 'issue39CssClock',
    edition: 'plain',
    fingerprint: '6d9f94052d390ec92e5583543c1934b3c1c0796274759589a42cb44d38424714',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-css-clock-staging',
    family: 'issue39CssClock',
    edition: 'staging',
    fingerprint: '0144ed548a9d191f9dd27ce2542f7dd829d540f67a7f37f0466a3700cce03729',
    styles: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
  {
    id: 'issue39-css-clock-production',
    family: 'issue39CssClock',
    edition: 'production',
    fingerprint: '1f922d2579f25cfd67186d2f8e0d0fd517c35aaef9ebef8d5a14d3aa30519b17',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
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
      'theme.js': family.theme,
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
      : runtime.edition === 'production'
        ? { id: 'production', indexable: true, origin: 'https://vitaliioborskyi.ai' }
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
