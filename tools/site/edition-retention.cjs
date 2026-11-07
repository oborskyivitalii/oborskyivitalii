'use strict';
// Preserve prior immutable editions while replacing only the active rendition.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('./snapshot.cjs');
const { documentElements } = require('./html.cjs');

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
  const inventory = artifact.entries(directory);
  const retained = inventory.filter(
    (entry) =>
      snapshot.immutable(entry.path) &&
      (preserveActive || !active.has(entry.path) || Object.hasOwn(declared, entry.path))
  );
  // Older documents can share current immutable snapshots and runtime files.
  // Keep only their reachable dependencies; unrelated active pages stay excluded.
  assert.ok(retained.length <= 1000, 'retained edition inventory bound');
  const selected = new Set(retained.map((entry) => entry.path));
  const byName = new Map(inventory.map((entry) => [entry.path, entry]));
  for (let index = 0; index < retained.length; index += 1) {
    const entry = retained[index];
    if (!entry.path.endsWith('.html')) continue;
    const base = new URL(entry.path, 'https://retention.invalid/');
    for (const element of documentElements(entry.bytes.toString('utf8'), {
      includeScriptSources: true,
    })) {
      for (const attribute of ['href', 'src']) {
        const value = element.attributes[attribute];
        if (value === undefined) continue;
        const url = new URL(value, base);
        if (url.origin !== base.origin) continue;
        const dependency = decodeURIComponent(url.pathname.slice(1));
        if (!snapshot.immutable(dependency) || selected.has(dependency)) continue;
        assert.ok(byName.has(dependency), 'retained immutable dependency missing: ' + dependency);
        assert.ok(retained.length < 1000, 'retained edition inventory bound');
        retained.push(byName.get(dependency));
        selected.add(dependency);
      }
    }
  }
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
