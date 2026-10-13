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
  issue5: {
    behavior: 'fixed-blocks',
    baseEngine: '2a34c34118bf22ebf9f07eed5ad1141c26bc91c1e1db7e32466aca46ef106ecc',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '96a22c3c86cdd43d32bed415a57d0f45148fc29a9952567e5d4e7e40396e92c6',
  },
  issue5Continuation: {
    behavior: 'fixed-blocks',
    baseEngine: 'af3a14857c7bb84dc91c9f06da5825daace4f5d66e629205633ecdc7886e6436',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '96a22c3c86cdd43d32bed415a57d0f45148fc29a9952567e5d4e7e40396e92c6',
  },
  issue5History: {
    behavior: 'fixed-blocks',
    baseEngine: 'e9b83a6e561336d27ddeb1865284183f73dc669db08842a17d67312abbc1110e',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '1420a74b6ad087c9e639c239d1ca860f4708c881ff435b4b3b2f994080f1c358',
  },
  issue5Departure: {
    behavior: 'fixed-blocks',
    baseEngine: 'c32097fa36598b2fea92e1af6882d877063dd06dc03fb6e88b3d3eeb2559b40d',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '7ae5bf170b71969aed8bd4ed71738e11857b89036cc0e1a5a7607fce2a5749f6',
  },
  issue5Smooth: {
    behavior: 'fixed-blocks',
    baseEngine: '2708a2e1f0ec3fcfb4f37fafce3bf4bec6f7811c98d6a7312e097092fc377ed0',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'f60f16a7c7293c0b9d801546a53f5ce13d2443bf06cc3c6cd15d2a032a71123e',
  },
  issue5Viewport: {
    behavior: 'fixed-blocks',
    baseEngine: 'a63e6d65c5437c80391655159ef802d162bf565033cba453be9abbbcc7eae787',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '7d8d577ced2dfd8e9662ec2d0dedc010df1989f2f80d86a06fd139e44fed5e7c',
  },
  issue5Content: {
    behavior: 'fixed-blocks',
    baseEngine: '0bd39d2137c0b6ea2c9066c849573f22741a100098814f923f8022b07d46475a',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'b798fd75ba58f2b4e4cfec97b0c65275f3ffd006b23c04f4d53d9273c19b9c2a',
    archive: '10c3d24bd56766a08c764c2b5a9fa81df78afd22e426a634e5450e8fb24f6efe',
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
    id: 'issue5-plain',
    family: 'issue5',
    edition: 'plain',
    fingerprint: 'f25b16d9a69db8d07fcbf6271f32c86f6b23de2307d6db6fb45fc0863902e915',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-staging',
    family: 'issue5',
    edition: 'staging',
    fingerprint: 'fff8aed9032b954389b7527f244b88ad9f52ca41c182f21bbc378d43283f1ab7',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-continuation-plain',
    family: 'issue5Continuation',
    edition: 'plain',
    fingerprint: '0229f6f6ec90eece1750e83b8b9df9d5476f1be589b060475f2d10a015f641fc',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-continuation-staging',
    family: 'issue5Continuation',
    edition: 'staging',
    fingerprint: 'fa2fe668f6ebf5d2f4d80e963e01d8ec76f348dd750f3a304406edb410390710',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-history-plain',
    family: 'issue5History',
    edition: 'plain',
    fingerprint: '89d1c671dac5be16b0a1da03a61af5f7d94927c209b8ab6ba4399c9f48a6ad1b',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-history-staging',
    family: 'issue5History',
    edition: 'staging',
    fingerprint: 'fe21d1d32c68ef39ed1ff6476310f96ddb724190db0bdc42890f4814ab09a45f',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-departure-plain',
    family: 'issue5Departure',
    edition: 'plain',
    fingerprint: '9f04d35b2c92b9f6298b65fff35a843dc55a6e25bf7a9927251cd6f7892ed3f9',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-departure-staging',
    family: 'issue5Departure',
    edition: 'staging',
    fingerprint: 'de4bc3cb43106d8b2900a5ef5c6a9327a2571da106d483f33b792cafee6f3531',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-smooth-plain',
    family: 'issue5Smooth',
    edition: 'plain',
    fingerprint: 'dc829c53956977cfc7783375668bc3c2fff3fdbda9efb02f77e49a8a348cf978',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-smooth-staging',
    family: 'issue5Smooth',
    edition: 'staging',
    fingerprint: '95b145ea1b981045847944ae3234bce094b73e109c93a08b30b3c447c7261a99',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-viewport-plain',
    family: 'issue5Viewport',
    edition: 'plain',
    fingerprint: '695f497e5cb6ebd6b7b4320583b951c00dcc963c1cbcf8ccef1406ef0d01a79d',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-viewport-staging',
    family: 'issue5Viewport',
    edition: 'staging',
    fingerprint: 'cdff9548271f4dc89def0455f4b564f49b22331aafcbccb9d3e39d97767e9233',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-content-plain',
    family: 'issue5Content',
    edition: 'plain',
    fingerprint: '89c395df74b1e626735d0757f9572836fd2d3365b2deefe31b7ca46982cd219e',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-content-staging',
    family: 'issue5Content',
    edition: 'staging',
    fingerprint: 'dfa648a40b6218f1a6b881db08c518af0b7f50a22dd06994eb988a9c947146b7',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
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
      'archive.js':
        family.archive || '1307b2405daa50937e5746f4d8a71230842718377d853b4d0cf4704e7f2de9ad',
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
module.exports = {
  select,
  reviewedRuntime,
  flightCheck,
  validateFlight,
  contract,
  rowPlan,
};
