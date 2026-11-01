'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const fixture = require('./fixtures/delivery.cjs');
const artifact = require('../tools/quality/artifact.cjs');
const snapshot = require('../tools/site/snapshot.cjs');
const retention = require('../tools/site/edition-retention.cjs');
const color = require('../tools/staging/color.cjs');
const staging = require('../tools/staging/edition.cjs');
const production = require('../tools/release/edition.cjs');
const declared = require('../site/retained/manifest.json').files;

test('Color and production preserve prior editions while staging remains isolated', (t) => {
  const temp = fixture.temporary(t);
  for (const kind of ['staging', 'production']) {
    const source = fixture.source(temp, kind);
    const baseRevision = JSON.parse(
      fs.readFileSync(path.join(source.directory, 'public/site-revision.json'))
    );
    const replacedArticleSnapshots = Object.values(baseRevision.articles || {}).map(
      (article) => article.url
    );
    assert.ok(replacedArticleSnapshots.length, 'current native article selected');
    color.build(source.directory);
    const coloredRecord = JSON.parse(fs.readFileSync(path.join(source.directory, 'artifact.json')));
    for (const name of replacedArticleSnapshots)
      assert.equal(
        coloredRecord.files[name],
        undefined,
        'Color cannot silently retain the just-replaced base article snapshot'
      );
    for (const [name, digest] of Object.entries(declared))
      assert.equal(
        coloredRecord.files[name]?.sha256,
        digest,
        'Color must retain the exact declared historical dependency'
      );
    const record =
      kind === 'staging'
        ? staging.build(source.directory)
        : production.build(source.directory, 'color');
    const directory = path.join(source.directory, 'public');
    if (kind === 'staging') {
      require('../tools/pages/package.cjs').checkStaging(source.directory, record);
      for (const name of Object.keys(declared).filter((name) => name.startsWith('snapshots/')))
        assert.equal(record.files[name], undefined, 'unlabelled historical HTML in staging');
      continue;
    }
    for (const [name, digest] of Object.entries(declared)) {
      assert.equal(record.files[name]?.sha256, digest, name);
      assert.equal(artifact.digest(fs.readFileSync(path.join(directory, name))), digest);
    }
    artifact.verify(directory, record);
    const absent = Object.keys(declared).find((name) => name.endsWith('/navigation.js'));
    fs.rmSync(path.join(directory, absent));
    assert.throws(() => artifact.verify(directory, record), /Artifact bytes|dependency missing/);
  }
});

test('retention rejects altered immutable paths rather than replacing them', (t) => {
  const source = fixture.source(fixture.temporary(t), 'collision');
  const directory = path.join(source.directory, 'public');
  const revision = snapshot.verify(directory, source.record);
  const retained = retention.capture(directory, revision);
  const entry = retained.find((item) => item.path.endsWith('/navigation.js'));
  fs.appendFileSync(path.join(directory, entry.path), '\n/* changed */');
  assert.throws(() => retention.restore(directory, retained), /immutable edition collision/);
  assert.throws(
    () => retention.restore(directory, [{ path: '../outside.js', bytes: Buffer.from('x') }]),
    /only immutable retained paths/
  );
});

test('only exact declared active immutable files survive production capture', (t) => {
  const source = fixture.source(fixture.temporary(t), 'declared-active');
  const directory = path.join(source.directory, 'public');
  const revision = snapshot.verify(directory, source.record);
  const name = revision.routes.writing.url;
  const digest = artifact.digest(fs.readFileSync(path.join(directory, name)));
  assert.equal(
    retention.capture(directory, revision).some((entry) => entry.path === name),
    false
  );
  const selected = retention.capture(directory, revision, { declared: { [name]: digest } });
  assert.ok(selected.some((entry) => entry.path === name));
  assert.equal(
    selected.some((entry) => entry.path === revision.routes.research.url),
    false,
    'other active documents stay excluded'
  );
  assert.throws(
    () => retention.capture(directory, revision, { declared: { [name]: '0'.repeat(64) } }),
    /declared retained bytes differ/
  );
  assert.throws(
    () => retention.capture(directory, revision, { declared: { '../outside.js': digest } }),
    /immutable path/
  );
  assert.throws(() => retention.capture(directory, revision, { declared: [] }), /retention map/);
});

test('production retention declaration rejects a missing source map before capture', () => {
  for (const record of [
    {},
    { schema: 0, files: {} },
    { schema: 1 },
    { schema: 1, files: null },
    { schema: 1, files: [] },
  ])
    assert.throws(() => retention.declaration(record), /retention declaration/);
  const files = {};
  assert.equal(retention.declaration({ schema: 1, files }), files);
});
