'use strict';
// Preserve prior immutable editions while replacing only the active rendition.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('./snapshot.cjs');

function capture(directory, revision) {
  const active = new Set([
    ...snapshot.runtimeFiles.map((name) => 'runtime/' + revision.engine + '/' + name),
    ...snapshot.routes.map((id) => revision.routes[id].url),
  ]);
  const retained = artifact
    .entries(directory)
    .filter((entry) => snapshot.immutable(entry.path) && !active.has(entry.path));
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

module.exports = { capture, restore };
