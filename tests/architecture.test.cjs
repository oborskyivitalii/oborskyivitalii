'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const { imports, check, readSources } = require('../tools/quality/architecture.cjs');
const fixture = (source, other = {}) => ({ 'site/engine/sample.cjs': source, ...other });
test('authored dependency graph resolves the current owners and records computed build boundaries honestly', () => {
  const result = check(readSources());
  assert.equal(result.pass, true);
  assert.ok(result.files >= 20);
  assert.ok(result.edges > 5);
  assert.ok(result.computed.every((edge) => edge.path.startsWith('tools/')));
  assert.match(result.limits, /serialized/);
});
test('AST module edges handle require, imports and re-exports while ignoring comments and strings', () => {
  const result = imports(
    `// require('../docs/bad.js')\nconst text="import('../docs/evil.js')"; const a=require('./a.cjs'); import b from './b.js'; export {x} from './c.js'; import('./d.js');`,
    'site/engine/sample.cjs'
  );
  assert.deepEqual(result.edges, ['./a.cjs', './b.js', './c.js', './d.js']);
  assert.deepEqual(result.computed, []);
});
test('runtime cannot import generated output or build orchestration', () => {
  for (const [edge, target] of [
    ['../../docs/runtime.js', 'docs/runtime.js'],
    ['../../tools/site/build.cjs', 'tools/site/build.cjs'],
  ])
    assert.throws(
      () => check(fixture(`require('${edge}')`, { [target]: '' })),
      /Invalid ownership/
    );
});
test('runtime cannot add package dependencies or computed module loading', () => {
  assert.throws(() => check(fixture("require('new-animation-runtime')")), /Runtime dependency/);
  assert.throws(() => check(fixture('require(name)')), /Computed runtime import/);
  assert.throws(() => check(fixture('import(`./${name}.js`)')), /Computed runtime import/);
});
test('pure scene geometry cannot depend on rendering state or presentation owners', () => {
  for (const value of ['document.body', 'window.clock', 'requestAnimationFrame(fn)', 'fetch(url)'])
    assert.throws(() => check({ 'site/engine/math.cjs': value }), /Ambient state/);
  assert.throws(
    () =>
      check({
        'site/scenes/world.cjs': "require('../engine/lifecycle.cjs')",
        'site/engine/lifecycle.cjs': '',
      }),
    /Invalid ownership/
  );
  assert.throws(
    () => check(fixture("require('../content/records.cjs')", { 'site/content/records.cjs': '' })),
    /Invalid ownership/
  );
});
test('missing modules and direct or multi-owner cycles fail closed', () => {
  assert.throws(() => check(fixture("require('./missing.cjs')")), /Missing or ambiguous/);
  assert.throws(() => check(fixture("require('./sample.cjs')")), /Circular/);
  assert.throws(
    () =>
      check(
        fixture("require('./second.cjs')", {
          'site/engine/second.cjs': "require('../effects/third.cjs')",
          'site/effects/third.cjs': "require('../engine/sample.cjs')",
        })
      ),
    /Invalid ownership|Circular/
  );
  assert.throws(
    () =>
      check({
        'tools/site/a.cjs': "require('./b.cjs')",
        'tools/site/b.cjs': "require('./c.cjs')",
        'tools/site/c.cjs': "require('./a.cjs')",
      }),
    /Circular/
  );
});
test('runtime effects retain only the descriptor assertion adapter and geometry direction', () => {
  assert.equal(
    check({
      'site/effects/a.cjs': "require('node:assert/strict'); require('../engine/math.cjs')",
      'site/engine/math.cjs': '',
    }).pass,
    true
  );
  assert.throws(() => check({ 'site/effects/a.cjs': "require('node:fs')" }), /Runtime dependency/);
});
test('pure rendering and validation cannot load files or import their build orchestrator', () => {
  assert.throws(
    () => check({ 'tools/site/render-page.cjs': "require('node:fs')" }),
    /I\/O dependency/
  );
  assert.throws(
    () => check({ 'tools/site/validate-catalog.cjs': "require('node:child_process')" }),
    /I\/O dependency/
  );
  assert.throws(
    () =>
      check({
        'tools/site/render-records.cjs': "require('./build.cjs')",
        'tools/site/build.cjs': '',
      }),
    /Invalid ownership/
  );
});

test('pure validators may use strict assertions while filesystem dependencies reject', () => {
  assert.equal(check({ 'tools/site/events.cjs': "require('node:assert/strict')" }).pass, true);
  assert.throws(() => check({ 'tools/site/events.cjs': "require('node:fs')" }), /I\/O dependency/);
});

test('pure fallback admits only direct SHA256 hashing and rejects crypto aliases and randomness', () => {
  const source = "require('node:crypto').createHash('sha256').update(bytes).digest('hex')";
  assert.equal(check({ 'tools/site/fallback.cjs': source }).pass, true);
  for (const source of [
    "require('node:crypto').randomBytes(16)",
    "const crypto = require('node:crypto')",
    "require('node:crypto')['createHash']('sha256')",
    "require('node:crypto').createHash(algorithm)",
    "import {createHash} from 'node:crypto'",
    "import('node:crypto').createHash('sha256')",
  ])
    assert.throws(() => check({ 'tools/site/fallback.cjs': source }), /crypto dependency/);
  assert.throws(() => check({ 'tools/site/events.cjs': source }), /crypto dependency/);
});

test('eager helper and deferred runtime cycles reject while build callbacks retain explicit review', () => {
  assert.throws(
    () =>
      check({
        'tools/quality/a.cjs': "require('./b.cjs')",
        'tools/quality/b.cjs': "require('./a.cjs')",
      }),
    /Circular/
  );
  assert.throws(
    () =>
      check({
        'site/engine/a.cjs': "function deferred() { return require('./b.cjs'); }",
        'site/engine/b.cjs': "function deferred() { return require('./a.cjs'); }",
      }),
    /Circular/
  );
  const observed = check({
    'tools/site/a.cjs': "function build() { return require('../quality/b.cjs'); }",
    'tools/quality/b.cjs': "require('../site/a.cjs')",
  });
  assert.equal(observed.pass, true);
  assert.equal(observed.edges, 2);
  assert.deepEqual(observed.deferredCycles[0].files, ['tools/quality/b.cjs', 'tools/site/a.cjs']);
  assert.equal(observed.deferredCycles[0].imports.length, 1);
  assert.match(observed.deferredCycles[0].review, /invocation.*export ordering/);
  assert.match(observed.limits, /manual/);
});
