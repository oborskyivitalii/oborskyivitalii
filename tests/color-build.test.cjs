'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path'),
  vm = require('node:vm');
const color = require('../tools/staging/color.cjs'),
  artifact = require('../tools/quality/artifact.cjs'),
  snapshot = require('../tools/site/snapshot.cjs'),
  motionArtifact = require('./fixtures/staging-evidence.cjs').aggregateFixture(true).manifest;
test('Color waits for a complete native row sequence within the shared finite pacing bound', async () => {
  const { settled } = require('../tools/quality/color-browser.cjs');
  for (const width of [1440, 390]) {
    const state = { route: 'research', busy: true, travel: 'flying' };
    let predicate,
      release,
      finished = false;
    const page = {
      viewportSize: () => ({ width }),
      waitForFunction(fn, route, options) {
        predicate = fn;
        assert.equal(route, 'credits');
        assert.equal(options.polling, 25);
        assert.equal(
          options.timeout,
          require('../tools/quality/transition-pacing.cjs').deadline(width)
        );
        assert.ok(Number.isFinite(options.timeout));
        assert.equal(options.timeout, 6950, 'page density cannot extend the fixed motion plan');
        return new Promise((resolve) => (release = resolve));
      },
    };
    const pending = settled(page, 'credits', motionArtifact).then(() => (finished = true));
    const ready = () =>
      vm.runInNewContext('(' + predicate.toString() + ')(' + JSON.stringify('credits') + ')', {
        document: {
          body: { dataset: { page: state.route } },
          getElementById: () => ({ hasAttribute: () => state.busy }),
          querySelector: () => ({ dataset: { travel: state.travel } }),
        },
      });
    assert.equal(ready(), false);
    state.route = 'credits';
    state.travel = 'settled';
    assert.equal(ready(), false, 'camera arrival while blocks are assembling is not ready');
    await Promise.resolve();
    assert.equal(finished, false);
    state.busy = false;
    state.travel = 'flying';
    assert.equal(ready(), false, 'visible route content cannot accept an unfinished camera');
    state.travel = 'settled';
    assert.equal(ready(), true);
    release();
    await pending;
    assert.equal(finished, true);
  }
});
test('Color preserves failure when the owned settlement deadline expires', async () => {
  await assert.rejects(
    () =>
      require('../tools/quality/color-browser.cjs').settled(
        {
          viewportSize: () => ({ width: 390 }),
          waitForFunction: async () => {
            throw Error('Controlled finite Color settlement deadline');
          },
        },
        'credits',
        motionArtifact
      ),
    /finite Color settlement deadline/
  );
});
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
    const first = path.join(dir, 'first');
    const second = path.join(dir, 'second');
    const baseline = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../docs/site-revision.json'))
    );
    for (const target of [first, second]) {
      fs.cpSync(path.join(__dirname, '../docs'), target, { recursive: true });
      color.decoratePublic(target);
    }
    assert.deepEqual(artifact.manifest(first), artifact.manifest(second));
    const manifest = artifact.manifest(first);
    const revision = snapshot.verify(first, manifest);
    assert.equal(revision.variant.id, 'color');
    assert.equal(revision.variant.baseEngine, baseline.engine);
    assert.deepEqual(revision.variant.effects, ['travel']);
    assert.deepEqual(Object.keys(revision.routes), snapshot.routes);
    for (const route of snapshot.routes) {
      const html = fs.readFileSync(path.join(first, route + '.html'), 'utf8');
      assert.match(html, /name="site-variant" content="color"/);
      assert.ok(html.includes('name="site-engine" content="' + revision.variant.fingerprint + '"'));
    }
    const space = fs.readFileSync(path.join(first, 'space.js'), 'utf8');
    const nav = fs.readFileSync(path.join(first, 'navigation.js'), 'utf8');
    const styles = fs.readFileSync(path.join(first, 'styles.css'), 'utf8');
    assert.match(space, /SiteEffects\.navigation/);
    assert.match(space, /SiteEffects\.measure/);
    assert.doesNotMatch(space, /SiteEffects\.scene\s*=/);
    assert.doesNotMatch(
      space,
      /ribbonGeometry|ribbonSignals|createRibbonMaterials|makeProjector|paintRibbon/
    );
    assert.doesNotMatch(
      space,
      /ribbonMaterial\s*=\s*['"]opaque-rgb['"]|scene\.dataset\.ribbons\s*=/
    );
    const readingStyles = fs.readFileSync(
      path.join(__dirname, '../site/effects/reading-surfaces.css'),
      'utf8'
    );
    const flightStyles = fs.readFileSync(
      path.join(__dirname, '../site/effects/flight.css'),
      'utf8'
    );
    assert.ok(
      styles.includes(readingStyles + '\n' + flightStyles),
      'served active Color reads canonical reading CSS before travel CSS'
    );
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
