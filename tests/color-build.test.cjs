'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path'),
  vm = require('node:vm');
const color = require('../tools/staging/color.cjs'),
  artifact = require('../tools/quality/artifact.cjs'),
  snapshot = require('../tools/site/snapshot.cjs');
test('collecting other hosted checks cannot accept a failed source-regression stage', () => {
  assert.throws(
    () => require('../tools/quality/validate.cjs').aggregate({ sourceChecks: 'failure' }),
    /source regressions failed/
  );
  assert.throws(
    () => require('../tools/quality/validate.cjs').aggregate({ sourceChecks: 'skipped' }),
    /source regressions failed/
  );
});
test('Color keeps the native route inventory and packages all requested authored effects deterministically', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'color-build-'));
  try {
    const first = path.join(dir, 'first'),
      second = path.join(dir, 'second');
    for (const target of [first, second]) {
      fs.cpSync(path.join(__dirname, '../docs'), target, { recursive: true });
      color.decoratePublic(target);
    }
    assert.deepEqual(artifact.manifest(first), artifact.manifest(second));
    const m = artifact.manifest(first),
      revision = snapshot.verify(first, m);
    assert.equal(revision.variant.id, 'color');
    assert.deepEqual(revision.variant.effects, ['ribbons', 'travel']);
    for (const route of snapshot.routes)
      assert.match(
        fs.readFileSync(path.join(first, route + '.html'), 'utf8'),
        /name="site-variant" content="color"/
      );
    const space = fs.readFileSync(path.join(first, 'space.js'), 'utf8'),
      nav = fs.readFileSync(path.join(first, 'navigation.js'), 'utf8');
    assert.match(space, /SiteEffects\.scene/);
    assert.match(space, /SiteEffects\.navigation/);
    assert.match(space, /ribbonMaterial\s*=\s*['"]opaque-rgb['"]/);
    assert.match(nav, /id\s*=\s*['"]end-scroll['"]/);
    assert.match(nav, /id\s*=\s*['"]content-flight['"]/);
    new vm.Script(space);
    new vm.Script(nav);
    artifact.checkSize(first);
    assert.throws(() => color.decoratePublic(first), /exactly once/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
