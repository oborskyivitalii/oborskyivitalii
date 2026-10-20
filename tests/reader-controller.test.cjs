'use strict';
// Synthetic packages exercise validators; retained receipts describe their old source only.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const artifact = require('../tools/quality/artifact.cjs');
const snapshot = require('../tools/staging/reader-snapshot.cjs');
const index = require('../tools/staging/reader-index.cjs');
const pkg = require('../tools/staging/package.cjs');
const flow = require('../tools/staging/review-flow.cjs');
const gate = require('../tools/quality/staging-gate.cjs');
const motion = require('../tools/quality/color-motion-contract.cjs');
const rights = require('../tools/release/rights-record.cjs');
const mime = require('../tools/quality/serve.cjs');

function retained(name) {
  return JSON.parse(
    zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'fixtures', name)), {
      maxOutputLength: 200000,
    })
  );
}

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'reader-controller-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'input');
  const publicDir = path.join(input, 'public');
  fs.cpSync(path.join(__dirname, '../docs'), publicDir, { recursive: true });
  const put = (name, bytes) => {
    const file = path.join(publicDir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  };
  const revision = JSON.parse(fs.readFileSync(path.join(publicDir, 'site-revision.json')));
  revision.variant = { id: 'base', contract: 1, fingerprint: revision.engine };
  const media = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1"/></svg>');
  const pdf = Buffer.from('%PDF-1.7\ncontrolled metadata fixture\n');
  const image = 'article-media/' + artifact.digest(media) + '/figure.svg';
  const download = 'article-media/' + artifact.digest(pdf) + '/document.pdf';
  put(image, media);
  put(download, pdf);
  const version = artifact.digest('controlled article version');
  const article = {
    alias: 'articles/probe.html',
    url: 'article-snapshots/' + version + '/probe.html',
    scene: 'writing',
    articleId: 'probe',
    contentEdition: 'fixture',
    sourceSha256: artifact.digest('controlled manuscript'),
    semanticSha256: artifact.digest('controlled semantic edition'),
    assets: [image, download],
    downloads: [download],
    version,
  };
  let html = fs.readFileSync(path.join(publicDir, 'writing.html'), 'utf8');
  html = html.replace('data-page="writing"', 'data-page="writing" data-article="probe:en"');
  html = html.replaceAll(revision.routes.writing.version, version);
  html = html.replace(/\b(href|src)="([^"#][^"]*)"/g, (match, attribute, value) =>
    /^(?:https?:|mailto:|\/)/.test(value) ? match : attribute + '="../' + value + '"'
  );
  html = html.replace(
    '</main>',
    '<img src="../' + image + '" alt="Fixture"><a href="../' + download + '">PDF</a></main>'
  );
  const immutableHtml = html.replace(/(href|src)="\.\.\//g, '$1="../../');
  article.sha256 = artifact.digest(immutableHtml);
  put(article.alias, html);
  put(article.url, immutableHtml);
  revision.articles = { 'probe:en': article };
  put('site-revision.json', JSON.stringify(revision));
  const source = {
    schema: 1,
    sourceDirty: false,
    sourceCommit: 'a'.repeat(40),
    candidateCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    components: revision,
    variant: revision.variant,
    ...artifact.manifest(publicDir),
  };
  fs.writeFileSync(path.join(input, 'artifact.json'), JSON.stringify(source));
  fs.mkdirSync(path.join(input, 'gate'));
  fs.writeFileSync(
    path.join(input, 'gate/release-manifest.json'),
    JSON.stringify({
      ...source,
      kind: 'pr-gate',
      profile: 'local',
      pass: true,
      jobs: { build: { result: 'success' } },
    })
  );
  return { directory, input, publicDir, put, source, revision, article, image, download };
}

test('new article closure is validated while legacy principal documents retain their bytes', (t) => {
  const f = fixture(t);
  assert.deepEqual(snapshot.verify(f.publicDir, f.source), f.revision);
  assert.equal(artifact.verify(f.publicDir, f.source), true);
  const size = artifact.checkSize(f.publicDir);
  assert.equal(size.articleRows.length, 1);
  assert.deepEqual(size.articleRows[0].downloads, [f.download]);
  assert.equal(artifact.validateArticleSizes(size, f.source), true);
  for (const route of snapshot.routes)
    assert.deepEqual(
      fs.readFileSync(path.join(f.publicDir, route + '.html')),
      fs.readFileSync(path.join(__dirname, '../docs', route + '.html'))
    );
});

test('rehashing the outer artifact cannot hide bad article identities, resources or references', (t) => {
  const f = fixture(t);
  const rejected = (mutate) => {
    const revision = structuredClone(f.revision);
    mutate(revision.articles['probe:en'], revision);
    f.put('site-revision.json', JSON.stringify(revision));
    assert.throws(() =>
      snapshot.verify(f.publicDir, { ...f.source, ...artifact.manifest(f.publicDir) })
    );
    f.put('site-revision.json', JSON.stringify(f.revision));
  };
  for (const mutate of [
    (a) => (a.alias = '../probe.html'),
    (a) => (a.scene = 'research'),
    (a) => (a.articleId = 'other'),
    (a) => (a.sha256 = '0'.repeat(64)),
    (a) => (a.assets = ['article-media/' + '0'.repeat(64) + '/missing.svg']),
    (a, r) => (r.navigation = { contract: 2, articleRenderer: 1 }),
    (a, r) => ((a.candidate = true), (r.preview = false)),
  ])
    rejected(mutate);
  const original = fs.readFileSync(path.join(f.publicDir, f.image));
  f.put(f.image, 'changed media');
  assert.throws(
    () => snapshot.verify(f.publicDir, { ...f.source, ...artifact.manifest(f.publicDir) }),
    /asset digest/
  );
  f.put(f.image, original);
  f.put('private.json', '{}');
  assert.throws(
    () => snapshot.verify(f.publicDir, { ...f.source, ...artifact.manifest(f.publicDir) }),
    /unexpected public input/
  );
});

test('article budgets reject missing evidence, false download exclusions and excessive transfer', (t) => {
  const f = fixture(t),
    size = artifact.checkSize(f.publicDir);
  for (const mutate of [
    (s) => (s.articleRows = []),
    (s) => (s.articleRows[0].totalGzipBytes = 800001),
    (s) => (s.articleRows[0].downloads = []),
    (s) => (s.articleRows[0].assets = []),
  ]) {
    const invalid = structuredClone(size);
    mutate(invalid);
    assert.throws(() => artifact.validateArticleSizes(invalid, f.source));
  }
  f.put(
    f.article.alias,
    fs
      .readFileSync(path.join(f.publicDir, f.article.alias), 'utf8')
      .replace('</main>', '<img src="../' + f.download + '"></main>')
  );
  assert.throws(() => artifact.checkSize(f.publicDir), /one native link/);
});

test('publication index rejects unsafe, duplicate and inconsistent tag relationships', () => {
  const valid = {
    schema: 1,
    labels: { tags: 'Tags', related: 'Related', all: 'All', filter: 'Filter' },
    vocabulary: { architecture: 'Architecture' },
    articles: [
      {
        id: 'probe',
        title: 'Probe',
        url: 'articles/probe.html',
        language: 'en',
        tags: ['architecture'],
      },
    ],
    readers: { 'probe:en': { tags: ['architecture'], publication: 'probe' } },
  };
  assert.equal(index.validate(valid), valid);
  for (const mutate of [
    (v) => (v.articles[0].url = 'javascript:alert(1)'),
    (v) => v.articles.push(structuredClone(v.articles[0])),
    (v) => (v.articles[0].tags = ['architecture', 'architecture']),
    (v) => (v.readers['probe:en'].publication = 'missing'),
  ]) {
    const invalid = structuredClone(valid);
    mutate(invalid);
    assert.throws(() => index.validate(invalid));
  }
});

test('the retained real reader runtime and rights remain exact mandatory contracts', () => {
  const record = retained('reader-staging-package.json.gz');
  assert.equal(motion.select(record.source).id, 'issue5-reader-fast-media-staging');
  assert.equal(pkg.publicationRequired(record.source, record.source.components), true);
  assert.doesNotThrow(() => rights.publication(record.source, record.rights));
  assert.throws(
    () => pkg.publicationRights('', record.source, undefined, record.source.components),
    /rights record required/
  );
  const invalid = structuredClone(record.source);
  invalid.files['space.js'].sha256 = '0'.repeat(64);
  assert.throws(() => motion.select(invalid), /unreviewed Color bytes/);
  const mismatched = structuredClone(record.rights);
  mismatched.materials.hostedEditions[0].assets = [];
  assert.throws(() => rights.publication(record.source, mismatched));
});

test('the real retained staging receipt cannot lose article coverage or mandatory jobs', () => {
  const observed = retained('reader-staging-gate.json.gz');
  assert.equal(gate.validateGate(observed, observed, observed.hostedOrigin), true);
  for (const mutate of [
    (g) => (g.sourceCommit = '0'.repeat(40)),
    (g) => (g.jobs.staging.result = 'skipped'),
    (g) => delete g.coverage.functional.articleObservations,
    (g) => (g.coverage.functional.articleObservations = 4),
    (g) => (g.checkedReports = g.checkedReports.filter((r) => r.kind !== 'security')),
    (g) => (g.fullGate = true),
  ]) {
    const invalid = structuredClone(observed);
    mutate(invalid);
    assert.throws(() => gate.validateGate(observed, invalid, observed.hostedOrigin));
  }
});

function fetchFixture(f, changed) {
  return async (url) => {
    let file = new URL(url).pathname.slice(1) || 'index.html';
    const missing = !fs.existsSync(path.join(f.out, 'public', file));
    if (missing) file = '404.html';
    const headers = {
      'x-robots-tag': 'noindex, nofollow',
      'x-content-type-options': 'nosniff',
      'cache-control': pkg.policyHeaders(file)['Cache-Control'],
      'content-type': mime.canonicalType(file),
    };
    let bytes = fs.readFileSync(path.join(f.out, 'public', file));
    if (changed) ({ bytes } = changed(file, headers, bytes) || { bytes });
    return new Response(bytes, { status: missing ? 404 : 200, headers });
  };
}

test('stable verification checks article aliases, snapshots and media with exact MIME and cache policy', async (t) => {
  const f = fixture(t);
  f.out = path.join(f.directory, 'package');
  f.record = pkg.build(f.input, f.out);
  const base = 'https://candidate.' + flow.project + '.pages.dev';
  const result = await flow.quickHttp(base, f.record, fetchFixture(f));
  for (const file of [f.article.alias, f.article.url, f.image, f.download])
    assert.ok(result.rows.some((r) => r.file === file));
  for (const target of [f.article.alias, f.article.url, f.image, f.download])
    await assert.rejects(
      flow.quickHttp(
        base,
        f.record,
        fetchFixture(f, (file, headers, bytes) => ({
          bytes: file === target ? Buffer.from('wrong alias bytes') : bytes,
        }))
      )
    );
  await assert.rejects(
    flow.quickHttp(
      base,
      f.record,
      fetchFixture(f, (file, headers, bytes) => {
        if (file === f.download) headers['content-type'] = 'text/html';
        return { bytes };
      })
    ),
    /Content-Type/
  );
  await assert.rejects(
    flow.quickHttp(
      base,
      f.record,
      fetchFixture(f, (file, headers, bytes) => {
        if (file === f.image) headers['cache-control'] = 'no-cache';
        return { bytes };
      })
    ),
    /cache/i
  );
});
