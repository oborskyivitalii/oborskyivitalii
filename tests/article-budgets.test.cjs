'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const artifact = require('../tools/quality/artifact.cjs');

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'article-byte-budgets-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.cpSync(path.join(__dirname, '../docs'), directory, { recursive: true });
  const html =
    '<!doctype html><html><body><svg class="space-fallback"><path/></svg><h1>Reader</h1></body></html>';
  for (const route of ['index', 'research', 'writing', 'talks', 'credits']) {
    fs.writeFileSync(path.join(directory, route + '.html'), html);
  }
  const alias = 'articles/bounded-reader.html';
  fs.mkdirSync(path.join(directory, 'articles'));
  fs.writeFileSync(path.join(directory, alias), html);
  const descriptor = { alias, assets: [] };
  fs.writeFileSync(
    path.join(directory, 'site-revision.json'),
    JSON.stringify({
      articles: { 'bounded-reader:en': descriptor },
    })
  );
  const record = {
    ...artifact.manifest(directory),
    components: { articles: { 'bounded-reader:en': descriptor } },
  };
  return { directory, alias, record };
}

test('article aliases share the original HTML, fallback and full transfer budgets', (t) => {
  const f = fixture(t);
  const sizes = artifact.checkSize(f.directory);
  assert.equal(sizes.rows.length, 5);
  assert.equal(sizes.articleRows.length, 1);
  assert.equal(artifact.validateArticleSizes(sizes, f.record), true);
  const assets = sizes.articleRows[0].assets;
  assert.ok(assets.includes('navigation.js'));
  assert.equal(
    sizes.articleRows[0].totalGzipBytes,
    f.record.files[f.alias].gzip +
      assets.reduce((total, name) => total + f.record.files[name].gzip, 0)
  );
  fs.writeFileSync(
    path.join(f.directory, 'research.html'),
    '<svg class="space-fallback"><use href="article-media/' +
      '0'.repeat(64) +
      '/research-fallback.svg#research-fallback"></use></svg>'
  );
  assert.throws(() => artifact.checkSize(f.directory), /Undeclared room fallback resource/);
});

test('UTF8 byte oversize rejects article aliases and retained HTML before size evidence passes', (t) => {
  const f = fixture(t);
  const oversized = '€'.repeat(40000);
  assert.ok(oversized.length < 100000);
  assert.ok(Buffer.byteLength(oversized) > 100000);
  fs.writeFileSync(path.join(f.directory, f.alias), oversized);
  assert.throws(() => artifact.checkSize(f.directory), /HTML size/);
  fs.writeFileSync(path.join(f.directory, f.alias), '<svg class="space-fallback"><path/></svg>');
  const retained = path.join(f.directory, 'retained-page.html');
  fs.writeFileSync(retained, oversized);
  assert.throws(() => artifact.checkSize(f.directory), /HTML size/);
});

test('a complete media-heavy article still fails the original transfer budget', (t) => {
  const f = fixture(t);
  const bytes = require('node:crypto').randomBytes(810000);
  const name = 'article-media/' + artifact.digest(bytes) + '/large.webp';
  fs.mkdirSync(path.dirname(path.join(f.directory, name)), { recursive: true });
  fs.writeFileSync(path.join(f.directory, name), bytes);
  const revision = JSON.parse(fs.readFileSync(path.join(f.directory, 'site-revision.json')));
  revision.articles['bounded-reader:en'].assets = [name];
  fs.writeFileSync(path.join(f.directory, 'site-revision.json'), JSON.stringify(revision));
  assert.throws(() => artifact.checkSize(f.directory), /Article transfer size/);
});

test('missing, duplicate, wrong-source and incomplete article transfer reports cannot pass admission', (t) => {
  const f = fixture(t);
  const original = artifact.checkSize(f.directory);
  for (const mutate of [
    (report) => {
      report.articleRows = [];
    },
    (report) => {
      report.articleRows.push(structuredClone(report.articleRows[0]));
    },
    (report) => {
      report.articleRows[0].sha256 = '0'.repeat(64);
    },
    (report) => {
      report.articleRows[0].assets.pop();
    },
    (report) => {
      report.articleRows[0].totalGzipBytes -= 1;
    },
    (report) => {
      report.articleRows[0].svgNodes = 251;
    },
    (report) => {
      report.articleRows[0].svgNodes = -1;
    },
    (report) => {
      report.articleRows[0].svgNodes = 1.5;
    },
  ]) {
    const report = structuredClone(original);
    mutate(report);
    assert.throws(() => artifact.validateArticleSizes(report, f.record));
  }
  const record = structuredClone(f.record);
  delete record.components;
  assert.throws(() => artifact.validateArticleSizes(original, record), /Wrong-source/);
});
