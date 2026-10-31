'use strict';
// Preserve prior immutable editions while replacing only the active rendition.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('./snapshot.cjs');

function declaration(record) {
  assert.equal(record?.schema, 1, 'retention declaration schema');
  assert.ok(
    record.files && typeof record.files === 'object' && !Array.isArray(record.files),
    'required retention declaration files'
  );
  return record.files;
}

function capture(directory, revision, { preserveActive = false, declared = {} } = {}) {
  assert.ok(
    declared && typeof declared === 'object' && !Array.isArray(declared),
    'declared retention map'
  );
  assert.ok(Object.keys(declared).length <= 1000, 'declared retention inventory bound');
  for (const [name, digest] of Object.entries(declared)) {
    assert.ok(snapshot.immutable(name), 'declared retention requires immutable path');
    assert.match(digest, /^[a-f0-9]{64}$/);
    assert.equal(
      artifact.digest(fs.readFileSync(path.join(directory, name))),
      digest,
      'declared retained bytes differ: ' + name
    );
  }
  const active = new Set([
    ...snapshot.runtimeFiles.map((name) => 'runtime/' + revision.engine + '/' + name),
    ...snapshot.routes.map((id) => revision.routes[id].url),
    ...Object.values(revision.articles || {}).map((article) => article.url),
  ]);
  const retained = artifact
    .entries(directory)
    .filter(
      (entry) =>
        snapshot.immutable(entry.path) &&
        (preserveActive || !active.has(entry.path) || Object.hasOwn(declared, entry.path))
    );
  assert.ok(retained.length <= 1000, 'retained edition inventory bound');
  return retained;
}

function restore(directory, retained) {
  for (const entry of retained) {
    assert.ok(snapshot.immutable(entry.path), 'only immutable retained paths');
    const target = path.join(directory, entry.path);
    if (fs.existsSync(target)) {
      assert.deepEqual(fs.readFileSync(target), entry.bytes, 'immutable edition collision');
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, entry.bytes);
  }
}

module.exports = { declaration, capture, restore };
