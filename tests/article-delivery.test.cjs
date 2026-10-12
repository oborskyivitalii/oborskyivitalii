'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const artifact = require('../tools/quality/artifact.cjs');
const snapshot = require('../tools/site/snapshot.cjs');
const stageEdition = require('../tools/staging/edition.cjs');
const stagePackage = require('../tools/staging/package.cjs');
const hosted = require('../tools/staging/hosted.cjs');
const production = require('../tools/release/edition.cjs');
const pages = require('../tools/pages/package.cjs');
const pagesHTTP = require('../tools/pages/http.cjs');
const { articleURLs } = require('../tools/quality/article-browser.cjs');
const key = 'pmday-two-shifts:en';
let prepared;

test.before(() => {
  prepared = fs.mkdtempSync(path.join(os.tmpdir(), 'article-delivery-source-'));
  require('../tools/site/build.cjs').build({
    root: path.resolve(__dirname, '..'),
    output: path.join(prepared, 'public'),
    cacheFile: path.join(prepared, 'cache.json'),
    candidateArticles: ['pmday-two-shifts'],
    all: true,
  });
});
test.after(() => fs.rmSync(prepared, { recursive: true, force: true }));

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'article-delivery-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.cpSync(path.join(prepared, 'public'), path.join(directory, 'public'), { recursive: true });
  const record = {
    schema: 1,
    sourceDirty: false,
    sourceCommit: 'a'.repeat(40),
    candidateCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    ...artifact.manifest(path.join(directory, 'public')),
  };
  record.components = snapshot.verify(path.join(directory, 'public'), record);
  fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(record, null, 2) + '\n');
  return {
    directory,
    publicDir: path.join(directory, 'public'),
    record,
    article: record.components.articles[key],
  };
}

function refreshRecord(publicDir, record) {
  return { ...record, ...artifact.manifest(publicDir) };
}

function gate(record) {
  return {
    ...record,
    kind: 'package-gate',
    profile: 'package',
    pass: true,
    sourceTestsRun: false,
    fullGate: false,
    productionEligible: false,
    deploymentAuthorized: false,
    checks: ['generated source', 'artifact snapshot integrity', 'size budgets'],
    jobs: { build: { result: 'success' } },
  };
}

function mime(file) {
  const types = {
    '.html': 'text/html',
    '.json': 'application/json',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
  };
  return types[path.extname(file)] || 'application/octet-stream';
}

function transport(directory, prefix = '/', wrongPNG = false, cloudflare = false) {
  return async (value) => {
    const url = new URL(value);
    assert.ok(url.pathname.startsWith(prefix), 'request escaped selected base path');
    let file = url.pathname.slice(prefix.length);
    if (!file || file.endsWith('/')) file += 'index.html';
    let status = 200;
    if (!fs.existsSync(path.join(directory, 'public', file))) {
      status = 404;
      file = '404.html';
    }
    const headers = new Headers(cloudflare ? stagePackage.policyHeaders(file) : {});
    headers.set(
      'content-type',
      wrongPNG && file.endsWith('.png') ? 'application/octet-stream' : mime(file)
    );
    return {
      url: String(value),
      status,
      headers,
      arrayBuffer: async () => fs.readFileSync(path.join(directory, 'public', file)),
    };
  };
}

test('article delivery includes a finite separate inventory, immutable document and exact PNG bytes', (t) => {
  const { publicDir, record, article } = fixture(t);
  assert.deepEqual(Object.keys(record.components.routes), snapshot.routes);
  assert.deepEqual(Object.keys(record.components.articles), [key]);
  assert.equal(record.components.preview, true);
  assert.equal(snapshot.immutable(article.alias), false);
  assert.equal(snapshot.immutable(article.url), true);
  assert.equal(article.assets.length, 1);
  for (const file of article.assets) {
    assert.equal(snapshot.immutable(file), true);
    assert.equal(artifact.digest(fs.readFileSync(path.join(publicDir, file))), file.split('/')[1]);
  }
  artifact.verify(publicDir, record);
  assert.throws(() => snapshot.inventory(Object.keys(record.files)), /unexpected public input/);
});

for (const name of ['alias', 'snapshot', 'asset']) {
  test(
    'article ' + name + ' omission is rejected even with a recomputed artifact manifest',
    (t) => {
      const { publicDir, record, article } = fixture(t);
      const file =
        name === 'alias' ? article.alias : name === 'snapshot' ? article.url : article.assets[0];
      fs.rmSync(path.join(publicDir, file));
      assert.throws(
        () => snapshot.verify(publicDir, refreshRecord(publicDir, record)),
        /missing|ENOENT/
      );
    }
  );
}

test('changed PNG bytes cannot reuse an immutable article asset name', (t) => {
  const { publicDir, record, article } = fixture(t);
  fs.appendFileSync(path.join(publicDir, article.assets[0]), Buffer.from([0, 1, 2]));
  assert.throws(
    () => snapshot.verify(publicDir, refreshRecord(publicDir, record)),
    /article asset digest/
  );
});

test('staging derivation retains old article snapshots and their complete immutable runtime closure', (t) => {
  const { directory, publicDir, record, article } = fixture(t);
  const oldBytes = fs.readFileSync(path.join(publicDir, article.url));
  const oldRuntime = 'runtime/' + record.components.engine + '/navigation.js';
  const oldRuntimeBytes = fs.readFileSync(path.join(publicDir, oldRuntime));
  const stage = stageEdition.build(directory);
  assert.notEqual(stage.components.articles[key].version, article.version);
  assert.deepEqual(fs.readFileSync(path.join(publicDir, article.url)), oldBytes);
  assert.deepEqual(fs.readFileSync(path.join(publicDir, oldRuntime)), oldRuntimeBytes);
  pages.checkStaging(directory, stage);
  fs.rmSync(path.join(publicDir, oldRuntime));
  assert.throws(
    () => snapshot.verify(publicDir, refreshRecord(publicDir, stage)),
    /snapshot dependency missing/
  );
});

test('Color derives article versions with the selected runtime and preserves earlier immutable documents', (t) => {
  const { directory, publicDir, record, article } = fixture(t);
  const oldBytes = fs.readFileSync(path.join(publicDir, article.url));
  const color = require('../tools/staging/color.cjs').build(directory);
  assert.equal(color.components.variant.id, 'color');
  assert.notEqual(color.components.articles[key].version, article.version);
  assert.notEqual(color.components.engine, record.components.engine);
  assert.deepEqual(fs.readFileSync(path.join(publicDir, article.url)), oldBytes);
  const current = fs.readFileSync(
    path.join(publicDir, color.components.articles[key].alias),
    'utf8'
  );
  assert.ok(current.includes('name="site-engine" content="' + color.components.engine + '"'));
  assert.match(current, /name="site-variant" content="color"/);
  artifact.verify(publicDir, color);
});

test('explicit candidate preview cannot enter a production edition or its sitemap', (t) => {
  const { directory, publicDir, record, article } = fixture(t);
  assert.throws(() => production.build(directory), /candidate article preview/);
  assert.deepEqual(
    artifact.manifest(publicDir).files,
    record.files,
    'rejection leaves reviewed bytes intact'
  );
  assert.throws(
    () => production.sitemapFor({ [key]: article }),
    /candidate article cannot be indexed/
  );
  const accepted = { ...article, candidate: false };
  const sitemap = production.sitemapFor({ [key]: accepted });
  assert.ok(sitemap.includes('<loc>' + production.origin + '/' + accepted.alias + '</loc>'));
  assert.equal((sitemap.match(/<url>/g) || []).length, snapshot.routes.length + 1);
  assert.ok(!sitemap.includes('article-snapshots/'), 'sitemap names native canonical documents');
});

test('staging package admits article inventory and enforces immutable PNG/HTML cache policy', async (t) => {
  const { directory, article } = fixture(t);
  const record = stageEdition.build(directory);
  fs.mkdirSync(path.join(directory, 'gate'));
  fs.writeFileSync(
    path.join(directory, 'gate/release-manifest.json'),
    JSON.stringify(gate(record))
  );
  const output = path.join(directory, 'host-package');
  const packageRecord = stagePackage.build(directory, output);
  assert.equal(stagePackage.verify(output, packageRecord), true);
  for (const file of [article.url, ...article.assets]) {
    assert.match(stagePackage.policyHeaders(file)['Cache-Control'], /immutable/);
  }
  assert.match(stagePackage.policyHeaders(article.alias)['Cache-Control'], /no-cache/);
  assert.match(stagePackage.headers, /\/article-media\/\*/);
  assert.match(stagePackage.headers, /\/article-snapshots\/\*/);
  const result = await hosted.httpSmoke(
    'https://candidate.invalid',
    packageRecord,
    transport(output, '/', false, true)
  );
  assert.ok(result.files.some((row) => row.file.endsWith('.png')));
  await assert.rejects(
    hosted.httpSmoke(
      'https://candidate.invalid',
      packageRecord,
      transport(output, '/', true, true)
    ),
    /content type/
  );
});

test('Pages article documents and PNGs stay inside a project/staging base with native deep links', async (t) => {
  const { directory } = fixture(t);
  const stage = stageEdition.build(directory);
  const output = path.join(directory, 'pages-package');
  const record = pages.build(directory, output, null, null, null, '/project/');
  const base = 'https://author.invalid/project';
  const result = await pagesHTTP.check(output, base, transport(output, '/project/'));
  assert.equal(result.articleDocuments, 1);
  assert.equal(result.articleDeepLinks, true);
  assert.deepEqual(pages.subtree(record.files, 'staging/'), stage.files);
  const urls = articleURLs(base + '/staging/', stage.components.articles[key]);
  assert.ok(urls.alias.startsWith(base + '/staging/articles/'));
  assert.ok(urls.snapshot.startsWith(base + '/staging/article-snapshots/'));
  assert.equal(urls.writing, base + '/staging/writing.html');
  await assert.rejects(
    pagesHTTP.check(output, base, transport(output, '/project/', true)),
    /PNG content type/
  );
});

test('article URL rebasing refuses foreign, absolute and traversing descriptors', () => {
  const good = {
    alias: 'articles/example.html',
    url: 'article-snapshots/' + 'a'.repeat(64) + '/example.html',
  };
  assert.equal(
    articleURLs('https://author.invalid/project/staging', good).alias,
    'https://author.invalid/project/staging/articles/example.html'
  );
  for (const alias of [
    'https://other.invalid/article.html',
    '/articles/example.html',
    '../articles/example.html',
    'articles\\example.html',
  ]) {
    assert.throws(() => articleURLs('https://author.invalid/project/staging', { ...good, alias }));
  }
});
