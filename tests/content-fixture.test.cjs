'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const fixture = require('../tools/quality/content-fixture.cjs');
const root = path.resolve(__dirname, '..');

test('the explicit browser fixture composes a genuine content release without changing author sources', (t) => {
  const catalogFile = path.join(root, 'site/content/catalog.json');
  const before = fs.readFileSync(catalogFile);
  const prepared = fixture.prepare();
  t.after(() => fs.rmSync(prepared.directory, { recursive: true, force: true }));
  assert.equal(prepared.manifest.syntheticFixture, true);
  assert.equal(prepared.manifest.sourceDirty, true);
  assert.deepEqual(prepared.manifest.contentRelease.builtArticles, [fixture.KEY]);
  const liveCatalog = JSON.parse(before);
  const native = Object.values(liveCatalog.records)
    .filter((record) => record.kind === 'local-article')
    .map((record) => record.article + ':' + record.edition.inLanguage);
  assert.deepEqual(
    Object.keys(prepared.manifest.components.articles).sort(),
    [...native, fixture.KEY].sort()
  );
  assert.equal(prepared.manifest.components.articles[fixture.KEY].candidate, true);
  assert.deepEqual(prepared.manifest.contentRelease.builtRoutes, ['writing', 'talks']);
  assert.deepEqual(prepared.manifest.contentRelease.reusedRoutes, ['index', 'research', 'credits']);
  assert.deepEqual(fs.readFileSync(catalogFile), before);
  assert.equal(fs.existsSync(path.join(root, 'site/publications', fixture.ARTICLE)), false);
  const catalog = JSON.parse(before);
  const html = fs.readFileSync(path.join(prepared.output, 'writing.html'), 'utf8');
  assert.equal(
    (html.match(/class="publication"/g) || []).length,
    Object.keys(catalog.records).length
  );
  assert.match(html, /synthetic-content-check/);
  const article = fs.readFileSync(
    path.join(prepared.output, prepared.manifest.components.articles[fixture.KEY].alias),
    'utf8'
  );
  assert.match(article, /name="robots" content="noindex/);
  assert.doesNotMatch(article, /rel="canonical"/);
});

test('managed Writing print observations use actual rows and the current authored count label', async () => {
  const count = Object.keys(require('../site/content/catalog.json').records).length;
  let actual = count + ' articles';
  const page = {
    locator: (selector) => ({
      selectOption: async () => {},
      count: async () => (selector === 'li.publication:visible' ? 1 : count),
      evaluate: async () =>
        selector === '#archive-count'
          ? {
              actual,
              template: '{count} articles',
            }
          : undefined,
    }),
    evaluate: async () => {},
    emulateMedia: async () => {},
  };
  const { writingControls } = require('../tools/quality/local-browser.cjs');
  await writingControls(page);
  actual = count + ' primary records with their linked platform editions shown for printing';
  await assert.rejects(() => writingControls(page), /print count matches/);
});

test('isolated diagnostics preserve frozen Git provenance of an already accepted local article', (t) => {
  const source = fixture.prepare();
  t.after(() => fs.rmSync(source.directory, { recursive: true, force: true }));
  const id = 'previously-frozen-fixture';
  const owner = 'site/publications/' + id;
  fs.cpSync(
    path.join(source.directory, 'site/publications', fixture.ARTICLE),
    path.join(source.directory, owner),
    { recursive: true }
  );
  const read = (file) => JSON.parse(fs.readFileSync(path.join(source.directory, file)));
  const write = (file, value) =>
    fs.writeFileSync(path.join(source.directory, file), JSON.stringify(value, null, 2) + '\n');
  const metadata = read(owner + '/publication.json');
  metadata.id = id;
  metadata.slug = id;
  metadata.owner.path = owner;
  metadata.status = 'accepted';
  const assetOwner = 'site/assets/publications/' + id;
  fs.cpSync(
    path.join(source.directory, 'site/assets/publications', fixture.ARTICLE),
    path.join(source.directory, assetOwner),
    { recursive: true }
  );
  for (const asset of metadata.assets)
    asset.path = asset.path.replace('site/assets/publications/' + fixture.ARTICLE, assetOwner);
  metadata.rights.status = 'accepted';
  const edition = read(owner + '/editions/fixture-edition.json');
  edition.articleId = id;
  edition.rights = 'accepted';
  edition.semanticSha256 = require('../tools/publishing/semantic.cjs').semanticDigest(
    metadata,
    edition.source
  );
  const profile = read(owner + '/profile.json');
  profile.id = id;
  write(owner + '/profile.json', profile);
  write(owner + '/publication.json', metadata);
  const git = (...args) =>
    cp
      .execFileSync('git', args, {
        cwd: source.directory,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: 'Fixture',
          GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
          GIT_COMMITTER_NAME: 'Fixture',
          GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
        },
      })
      .trim();
  git('add', owner + '/' + metadata.source);
  git('commit', '--quiet', '-m', 'Synthetic frozen source fixture');
  edition.source.commit = git('rev-parse', 'HEAD');
  edition.source.blob = git('rev-parse', 'HEAD:' + owner + '/' + metadata.source);
  write(owner + '/editions/fixture-edition.json', edition);
  const catalog = read('site/content/catalog.json');
  const record = require('./fixtures/catalog.cjs').nextRecordId(catalog);
  catalog.records[record] = {
    kind: 'local-article',
    article: id,
    edition: {
      '@type': 'Article',
      name: metadata.title,
      url: 'articles/' + id + '.html',
      inLanguage: 'en',
      author: { '@type': 'Person', name: 'Vitalii Oborskyi' },
    },
    editions: [],
    discussions: [],
    presentation: { topic: 'systems', kind: 'Article', publisher: 'Author site' },
  };
  catalog.structuredOrder.push({ record });
  write('site/content/catalog.json', catalog);
  require('./fixtures/catalog.cjs').assignTags(source.directory, 'articles', id);
  const prepared = fixture.prepare({ sourceRoot: source.directory });
  t.after(() => fs.rmSync(prepared.directory, { recursive: true, force: true }));
  assert.ok(prepared.manifest.components.articles[id + ':en']);
  assert.ok(prepared.manifest.contentRelease.reusedArticles.includes(id + ':en'));
  assert.deepEqual(prepared.manifest.contentRelease.builtArticles, [fixture.KEY]);
});
