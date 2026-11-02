'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const suite = require('../tools/quality/performance.cjs'),
  reader = require('../tools/quality/reader-performance.cjs'),
  validate = require('../tools/quality/validate.cjs'),
  budgets = require('../tools/quality/budgets.json'),
  fixture = require('./fixtures/staging-evidence.cjs');

test('sequential performance execution retains independent failures and thrown collector errors', () => {
  const visited = [];
  const checkpoints = [];
  const rows = suite.execute(
    (check) => {
      visited.push(check);
      if (check === 'lighthouse') return { exitCode: 1 };
      if (check === 'motion') throw Error('collector unavailable');
      return { exitCode: 0 };
    },
    (rows) => checkpoints.push(rows.map((row) => row.check))
  );
  assert.deepEqual(visited, ['lighthouse', 'motion', 'reader-performance']);
  assert.deepEqual(
    rows.map((row) => row.exitCode),
    [1, null, 0]
  );
  assert.match(rows[1].error, /collector unavailable/);
  assert.deepEqual(
    checkpoints.map((rows) => rows.length),
    [1, 2, 3]
  );
});

function trials(routes) {
  return routes.flatMap((route) =>
    ['mobile', 'desktop'].flatMap((formFactor) =>
      [1, 2, 3].map((run) => ({
        route,
        formFactor,
        run,
        lighthouseVersion: 'fixture',
        environment: { networkUserAgent: 'fixture' },
        configSettings: {
          formFactor,
          throttlingMethod: 'simulate',
          ...budgets.lighthouse.profiles[formFactor],
        },
        categories: { performance: 0.95 },
        metrics: Object.fromEntries(
          Object.keys(budgets.lighthouse[formFactor]).map((key) => [key, { numericValue: 0 }])
        ),
      }))
    )
  );
}
test('reader median checking cannot replace the original matrix or admit missing and mislabeled trials', () => {
  const rows = trials(['reader-1']);
  assert.equal(validate.lighthouse({ rows }, ['reader-1']).medians.length, 2);
  assert.throws(() => validate.lighthouse({ rows }), /missing Lighthouse runs/);
  assert.equal(validate.lighthouse({ rows: trials(budgets.routes) }).medians.length, 10);
  assert.throws(() => validate.lighthouse({ rows: [] }, []), /route inventory/);
  assert.throws(() => validate.lighthouse({ rows }, ['reader-1', 'reader-1']), /duplicate/);
  assert.throws(() => validate.lighthouse({ rows: rows.slice(1) }, ['reader-1']), /missing/);
  const invalid = structuredClone(rows);
  invalid[0].configSettings.formFactor = 'desktop';
  assert.throws(() => validate.lighthouse({ rows: invalid }, ['reader-1']), /mislabeled/);
  for (const row of rows) row.metrics['total-blocking-time'].numericValue = 201;
  assert.throws(() => validate.lighthouse({ rows }, ['reader-1']), /201 > 200/);
});
test('reader inventory comes from verified article aliases and rejects unsafe or missing documents', () => {
  const manifest = {
    components: {
      articles: { 'some-article:en': { alias: 'articles/some-article.html' } },
    },
    files: { 'articles/some-article.html': {} },
  };
  assert.deepEqual(reader.inventory(manifest, manifest.components), [
    {
      key: 'some-article:en',
      route: 'reader-1',
      alias: 'articles/some-article.html',
    },
  ]);
  assert.deepEqual(reader.inventory({}, {}), []);
  assert.throws(() => reader.inventory(manifest), /missing verified/);
  assert.throws(
    () => reader.inventory({ ...manifest, files: {} }, manifest.components),
    /missing reader/
  );
  assert.throws(
    () => reader.inventory({ ...manifest, components: { articles: {} } }, manifest.components),
    /metadata differs/
  );
  assert.throws(() => reader.inventory(manifest, { articles: {} }), /metadata differs/);
  manifest.components.articles['some-article:en'].alias = '../index.html';
  assert.throws(() => reader.inventory(manifest, manifest.components), /unsafe reader/);
});
test('reader motion requires real positive paints, unchanged CPU limits and zero Off work', () => {
  const sample = {
    width: 390,
    rate: 4,
    errors: [],
    positiveProbe: true,
    measurements: ['idle', 'scroll', 'off', 'reduced'].map((kind) => fixture.measurement(kind)),
  };
  assert.doesNotThrow(() => reader.checkMotion(sample));
  assert.throws(() => reader.checkMotion({ ...sample, positiveProbe: false }), /Motion-on/);
  const activeOff = structuredClone(sample);
  activeOff.measurements[2] = fixture.measurement('off', false);
  assert.throws(() => reader.checkMotion(activeOff));
  const invalidTiming = structuredClone(sample);
  invalidTiming.measurements[0].paintCallbackMs.p95 = 100;
  assert.throws(() => reader.checkMotion(invalidTiming));
});
