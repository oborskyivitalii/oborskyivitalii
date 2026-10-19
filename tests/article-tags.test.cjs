'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os');
const api = require('../site/engine/article-tags.cjs')();
const producer = require('../tools/site/article-index.cjs');
const builder = require('../tools/site/build.cjs');
const repo = path.resolve(__dirname, '..');
function index() {
  return JSON.parse(
    producer.compile(repo, builder.catalog(repo), [
      { key: 'reader-reference:en', metadata: { id: 'reader-reference' }, candidate: true },
    ])
  );
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-tags-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const relative of [
    'site',
    'tools/site',
    'tools/build_scene_fallbacks.cjs',
    ...Object.values(require('../tools/site/legal.cjs').sources),
  ]) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.cpSync(path.join(repo, relative), path.join(root, relative), { recursive: true });
  }
  return root;
}

test('all published archive entries have canonical tags; previews cannot enter recommendations', () => {
  const data = index(),
    catalog = builder.catalog(repo);
  assert.equal(data.articles.length, Object.keys(catalog.records).length);
  assert.deepEqual(
    data.articles.map((article) => article.id).sort(),
    Object.keys(catalog.records).sort()
  );
  assert.ok(data.articles.every((article) => article.tags.length >= 2));
  assert.ok(!JSON.stringify(data.articles).includes('reader-reference'));
  assert.ok(!JSON.stringify(data.articles).includes('pmday-ai-both-sides'));
  assert.deepEqual(data.readers['reader-reference:en'].tags, ['architecture', 'verification']);
});

test('index rejects unknown schemas, vocabulary, missing/duplicate tags, duplicate works and unsafe links', () => {
  for (const mutate of [
    (d) => (d.schema = 2),
    (d) => (d.extra = true),
    (d) => (d.articles[0].tags = []),
    (d) => (d.articles[0].tags = ['unknown']),
    (d) => (d.articles[0].tags = ['verification', 'verification']),
    (d) => (d.articles[0].url = 'javascript:alert(1)'),
    (d) => (d.articles[0].url = 'https://user:pass@example.com'),
    (d) => d.articles.push(d.articles[0]),
    (d) => (d.readers['reader-reference:en'].publication = 'missing'),
    (d) => (d.vocabulary['not a tag'] = 'Bad'),
  ]) {
    const data = index();
    mutate(data);
    assert.throws(() => api.validate(data));
  }
});

test('related reading ranks overlap, excludes self, uses stable ties and returns no unrelated filler', () => {
  const data = index();
  data.articles = [
    {
      id: 'self',
      title: 'Current',
      url: 'https://example.com/self',
      language: 'en',
      tags: ['architecture', 'verification'],
    },
    {
      id: 'both',
      title: 'Both',
      url: 'https://example.com/both',
      language: 'en',
      tags: ['architecture', 'verification'],
    },
    ...['z-last', 'a-first'].map((id) => ({
      id,
      title: id,
      url: 'https://example.com/' + id,
      language: 'en',
      tags: ['architecture'],
    })),
    {
      id: 'none',
      title: 'No match',
      url: 'https://example.com/none',
      language: 'en',
      tags: ['society'],
    },
  ];
  const reader = { tags: ['architecture', 'verification'], publication: 'self' };
  assert.deepEqual(
    api.related(data, reader).map((article) => article.id),
    ['both', 'a-first', 'z-last']
  );
  assert.deepEqual(api.related(data, { tags: ['manufacturing'], publication: null }), []);
  assert.equal(api.related(data, { tags: ['society'], publication: null }).length, 1);
});

test('stream reader rejects wrong MIME, malformed UTF8, byte overflow and cancellation', async () => {
  const signal = new AbortController().signal;
  assert.equal(
    (
      await api.read(
        new Response(JSON.stringify(index()), { headers: { 'content-type': 'application/json' } }),
        signal
      )
    ).schema,
    1
  );
  for (const response of [
    new Response('{}'),
    new Response('{}', {
      headers: { 'content-type': 'application/json', 'content-length': String(api.limit + 1) },
    }),
    new Response(' '.repeat(api.limit + 1), { headers: { 'content-type': 'application/json' } }),
    new Response(new Uint8Array([255]), { headers: { 'content-type': 'application/json' } }),
  ])
    await assert.rejects(() => api.read(response, signal));
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    () =>
      api.read(
        new Response('{}', { headers: { 'content-type': 'application/json' } }),
        controller.signal
      ),
    /Cancelled/
  );
  let fetched = false;
  api.mount({
    document: {},
    window: {},
    root: new URL('file:///review.html'),
    fetch: () => {
      fetched = true;
    },
  });
  assert.equal(fetched, false, 'standalone files make no live index request');
});

test('missing tags on a new published record fail instead of silently entering the index', (t) => {
  const root = fixture(t),
    catalog = builder.catalog(root);
  catalog.records.new = {
    ...catalog.records['publication-01'],
    edition: { ...catalog.records['publication-01'].edition, url: 'https://example.com/new' },
  };
  assert.throws(() => producer.compile(root, catalog), /Invalid publication tags/);
  const file = path.join(root, producer.source),
    source = JSON.parse(fs.readFileSync(file));
  source.records.new = ['verification'];
  fs.writeFileSync(file, JSON.stringify(source));
  assert.ok(
    JSON.parse(producer.compile(root, catalog)).articles.some((article) => article.id === 'new')
  );
});

test('tag-only content generation changes the index while old HTML, readers and every runtime byte stay identical', (t) => {
  const root = fixture(t),
    output = path.join(root, 'public'),
    cacheFile = path.join(root, 'cache.json'),
    lockFile = path.join(root, 'lock.json');
  const before = builder.build({
    root,
    output,
    cacheFile,
    lockFile,
    all: true,
    candidateArticles: ['reader-reference'],
  });
  const saved = Object.fromEntries(
    Object.keys(before.files).map((name) => [name, fs.readFileSync(path.join(output, name))])
  );
  const forged = JSON.parse(saved['publication-index.json']);
  forged.articles[0].title = 'A substituted publication title';
  fs.writeFileSync(path.join(output, 'publication-index.json'), JSON.stringify(forged));
  const artifact = require('../tools/quality/artifact.cjs');
  const record = {
    sourceCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    candidateCommit: 'a'.repeat(40),
    ...artifact.manifest(output),
  };
  record.components = require('../tools/site/snapshot.cjs').verify(output, record);
  assert.throws(
    () => require('../tools/release/rights.cjs').compile(output, record, { sourceRoot: repo }),
    /published tag index differs from canonical source/
  );
  fs.writeFileSync(path.join(output, 'publication-index.json'), saved['publication-index.json']);
  const file = path.join(root, producer.source),
    source = JSON.parse(fs.readFileSync(file));
  source.records['publication-02'] = ['society', 'ethics'];
  source.articles['reader-reference'] = ['society'];
  fs.writeFileSync(file, JSON.stringify(source));
  const after = builder.build({
    root,
    output,
    cacheFile,
    lockFile,
    contentOnly: true,
    candidateArticles: ['reader-reference'],
  });
  assert.deepEqual(after.built, []);
  assert.deepEqual(after.builtArticles, []);
  assert.equal(after.components.engine, before.components.engine);
  assert.equal(after.components.producer, before.components.producer);
  const changed = Object.keys(after.files).filter(
    (name) => !saved[name]?.equals(fs.readFileSync(path.join(output, name)))
  );
  assert.deepEqual(changed, ['publication-index.json']);
  assert.notDeepEqual(
    api.related(
      JSON.parse(saved['publication-index.json']),
      index().readers['reader-reference:en']
    ),
    api.related(JSON.parse(fs.readFileSync(path.join(output, 'publication-index.json'))), {
      tags: ['society'],
      publication: null,
    })
  );
});

test('disposing a pending request prevents late data from touching a departed route', async () => {
  let finish,
    created = 0;
  const document = {
    body: { dataset: { article: 'reader-reference:en' } },
    querySelectorAll: () => [],
    querySelector: () => ({}),
    createElement: () => {
      created++;
      throw Error('Departed DOM');
    },
  };
  const stop = api.mount({
    document,
    window: { setTimeout, clearTimeout, location: { origin: 'https://example.com' } },
    root: new URL('https://example.com/author/'),
    fetch: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  stop();
  finish(
    new Response(JSON.stringify(index()), { headers: { 'content-type': 'application/json' } })
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(created, 0);
  assert.equal(document.body.dataset.tagsState, undefined);
});

test('unpublished tag assignments and unused vocabulary never leak into the public index', (t) => {
  const root = fixture(t),
    file = path.join(root, producer.source),
    data = JSON.parse(fs.readFileSync(file));
  data.vocabulary['private-draft-topic'] = 'Private draft topic';
  data.articles['not-published'] = ['private-draft-topic'];
  fs.writeFileSync(file, JSON.stringify(data));
  const result = producer.compile(root, builder.catalog(root)).toString();
  assert.ok(!result.includes('private-draft-topic'));
  assert.ok(!result.includes('not-published'));
  fs.rmSync(file);
  assert.throws(() => producer.compile(root, builder.catalog(root)), /ENOENT/);
});
