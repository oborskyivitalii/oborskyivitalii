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

test('active documents require an exact declaration while unrelated active documents stay excluded', (t) => {
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

test('retained documents keep transitive immutable dependencies while unrelated active files stay excluded', (t) => {
  const directory = fixture.temporary(t);
  const engine = 'a'.repeat(64);
  const old = 'snapshots/' + '0'.repeat(64) + '/writing.html';
  const routes = Object.fromEntries(
    snapshot.routes.map((id, index) => [
      id,
      {
        url: 'snapshots/' + String(index + 1).repeat(64) + '/' + id + '.html',
      },
    ])
  );
  const revision = { engine, routes };
  const write = (name, text) => {
    fs.mkdirSync(path.dirname(path.join(directory, name)), { recursive: true });
    fs.writeFileSync(path.join(directory, name), text);
  };
  for (const name of snapshot.runtimeFiles)
    write('runtime/' + engine + '/' + name, 'Exact source bytes: ' + name);
  write(routes.writing.url, '<html><body>Replaced active page</body></html>');
  const related =
    '<html><head><script src="../../runtime/' +
    engine +
    '/theme.js?version=1#entry"></script></head><body><a href="../../' +
    old +
    '">Prior document</a></body></html>';
  write(routes.index.url, related);
  assert.equal(
    require('../tools/site/html.cjs')
      .documentElements(related)
      .some((element) => element.tag === 'script'),
    false,
    'ordinary document hooks continue to exclude raw script elements'
  );
  write(
    old,
    '<html><body><a href="../../' +
      routes.index.url +
      '">Shared snapshot</a>' +
      '<!-- <script src="../../runtime/' +
      engine +
      '/space.js"></script> -->' +
      '<template><script src="../../runtime/' +
      engine +
      '/archive.js"></script></template>' +
      '<script type="application/json">{"src":"../../runtime/' +
      engine +
      '/navigation.js"}</script>' +
      '<link href="https://elsewhere.invalid/runtime/' +
      engine +
      '/styles.css">' +
      '</body></html>'
  );
  const captured = retention.capture(directory, revision);
  assert.deepEqual(
    captured.map((entry) => entry.path).sort(),
    [old, routes.index.url, 'runtime/' + engine + '/theme.js'].sort()
  );
  assert.deepEqual(
    captured.find((entry) => entry.path.endsWith('/theme.js')).bytes,
    fs.readFileSync(path.join(directory, 'runtime/' + engine + '/theme.js'))
  );
  fs.rmSync(path.join(directory, 'runtime/' + engine + '/theme.js'));
  assert.throws(
    () => retention.capture(directory, revision),
    /retained immutable dependency missing/
  );
  write('runtime/' + engine + '/theme.js', 'Exact source bytes: theme.js');
  fs.rmSync(path.join(directory, routes.index.url));
  assert.throws(
    () => retention.capture(directory, revision),
    /retained immutable dependency missing/
  );
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
