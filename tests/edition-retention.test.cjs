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
    color.build(source.directory);
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
