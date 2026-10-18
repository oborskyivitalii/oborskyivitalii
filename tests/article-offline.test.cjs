'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const vm = require('node:vm');
const builder = require('../tools/site/build.cjs');
const snapshot = require('../tools/site/snapshot.cjs');
const preview = require('../tools/build_site_previews.cjs');
const publisher = require('../tools/publishing/article.cjs');
const repo = path.resolve(__dirname, '..');
const { legacyCatalog } = require('./fixtures/catalog.cjs');
const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=',
  'base64'
);
let prepared;

function write(root, relative, bytes) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
}

function json(root, relative, value) {
  write(root, relative, JSON.stringify(value, null, 2) + '\n');
}

function publication(root, id, language, body) {
  const directory = 'site/publications/' + id;
  const title = language === 'uk' ? 'Український читач' : 'English offline reader';
  const manuscript =
    '# ' +
    title +
    '\n\n' +
    body +
    '\n\n## First section\n\n' +
    '![A pixel](asset:pixel)\n\n## Second section\n\n[Source](https://example.com/source)\n';
  const metadata = {
    schema: 1,
    id,
    slug: id,
    title,
    summary: 'A complete bounded offline article.',
    authors: [{ name: 'Vitalii Oborskyi' }],
    language,
    topic: 'systems',
    owner: { repository: 'oborskyivitalii/oborskyivitalii', path: directory },
    status: 'draft',
    source: 'manuscript.' + language + '.md',
    edition: 'offline-first',
    profile: 'profile.json',
    rights: {
      status: 'review-pending',
      notice: 'Offline fixture review pending.',
      references: [],
    },
    references: [{ id: 'source', url: 'https://example.com/source' }],
    assets: [
      {
        id: 'pixel',
        path: 'site/assets/publications/' + id + '/pixel.png',
        sha256: builder.sha(pixel),
        width: 1,
        height: 1,
        alt: 'A pixel',
        caption: 'One bounded offline figure.',
        credit: 'Author.',
      },
    ],
    platforms: {
      linkedin: { mode: 'equivalent-rendition' },
      medium: { mode: 'equivalent-rendition' },
    },
    canonical: null,
  };
  const edition = {
    schema: 1,
    id: 'offline-first',
    articleId: id,
    language,
    kind: 'full-article',
    source: {
      path: metadata.source,
      sha256: builder.sha(manuscript),
      commit: null,
      blob: null,
    },
    owner: 'site',
    derivation: null,
    rights: 'review-pending',
  };
  edition.semanticSha256 = publisher.semanticDigest(metadata, edition.source);
  write(root, directory + '/' + metadata.source, manuscript);
  write(root, metadata.assets[0].path, pixel);
  const launch = 'Read the complete authored article and its sources.\n';
  write(root, directory + '/launch-post.' + language + '.md', launch);
  json(root, directory + '/profile.json', {
    schema: 1,
    id,
    platforms: {
      linkedin: { formats: ['txt'], relationship: 'equivalent-rendition' },
      medium: { formats: ['txt'], relationship: 'equivalent-rendition' },
    },
    launch: {
      source: 'launch-post.' + language + '.md',
      sha256: builder.sha(launch),
    },
    seo: { title, summary: metadata.summary },
    assets: {
      cover: { omitReason: 'Fixture has no cover.' },
      hero: { omitReason: 'Fixture has no hero.' },
    },
    limits: {},
  });
  json(root, directory + '/publication.json', metadata);
  json(root, directory + '/editions/offline-first.json', edition);
  return { directory, metadata, edition, body };
}

function acceptUndated(root, article) {
  const git = (args) => cp.execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git(['init', '-q']);
  git(['config', 'user.name', 'Offline fixture']);
  git(['config', 'user.email', 'fixture@example.invalid']);
  git(['add', 'site/publications', 'site/assets/publications']);
  git(['commit', '-qm', 'Pin synthetic fixture sources']);
  article.metadata.status = 'accepted';
  article.metadata.rights.status = 'accepted';
  article.edition.rights = 'accepted';
  article.edition.source.commit = git(['rev-parse', 'HEAD']);
  article.edition.source.blob = git([
    'rev-parse',
    'HEAD:' + article.directory + '/' + article.metadata.source,
  ]);
  json(root, article.directory + '/publication.json', article.metadata);
  json(root, article.directory + '/editions/offline-first.json', article.edition);
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'site/content/catalog.json')));
  const existing = Object.values(catalog.records)[0];
  catalog.records['publication-99'] = {
    kind: 'local-article',
    article: article.metadata.id,
    edition: {
      ...existing.edition,
      name: article.metadata.title,
      url: 'articles/' + article.metadata.slug + '.html',
      inLanguage: article.metadata.language,
    },
    editions: [],
    discussions: [],
    presentation: {
      topic: 'systems',
      kind: 'Article',
      publisher: 'Author site',
    },
  };
  delete catalog.records['publication-99'].edition.datePublished;
  delete catalog.records['publication-99'].edition.dateModified;
  catalog.structuredOrder.push({ record: 'publication-99' });
  json(root, 'site/content/catalog.json', catalog);
}

test.before(() => {
  assert.equal(typeof preview.exportArticle, 'function', 'explicit article producer is available');
  assert.equal(
    typeof preview.routePayloads,
    'function',
    'ordinary offline payload producer is available'
  );
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'article-offline-source-'));
  for (const relative of [
    'site',
    'tools/site',
    'tools/build_scene_fallbacks.cjs',
    ...Object.values(require('../tools/site/legal.cjs').sources),
  ]) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.cpSync(path.join(repo, relative), path.join(root, relative), {
      recursive: true,
    });
  }
  // Do not inherit real accepted records after replacing their source tree.
  json(root, 'site/content/catalog.json', legacyCatalog(repo));
  fs.rmSync(path.join(root, 'site/publications'), {
    recursive: true,
    force: true,
  });
  fs.rmSync(path.join(root, 'site/assets/publications'), {
    recursive: true,
    force: true,
  });
  const english = publication(root, 'offline-english', 'en', 'EN_BODY_OWNER_1');
  const ukrainian = publication(root, 'offline-ukrainian', 'uk', 'UK_BODY_OWNER_2');
  ukrainian.metadata.translationOf = {
    articleId: english.metadata.id,
    editionId: english.metadata.edition,
    sourceSha256: english.edition.source.sha256,
  };
  ukrainian.edition.semanticSha256 = publisher.semanticDigest(
    ukrainian.metadata,
    ukrainian.edition.source
  );
  json(root, ukrainian.directory + '/publication.json', ukrainian.metadata);
  json(root, ukrainian.directory + '/editions/offline-first.json', ukrainian.edition);
  const accepted = publication(root, 'offline-undated', 'en', 'ACCEPTED_UNDATED_BODY_3');
  acceptUndated(root, accepted);
  builder.build({ root, all: true });
  const publicDirectory = path.join(root, 'candidate');
  builder.build({
    root,
    output: publicDirectory,
    cacheFile: path.join(root, 'candidate.cache.json'),
    candidateArticles: [english.metadata.id, ukrainian.metadata.id],
    all: true,
  });
  prepared = { root, publicDirectory, english, ukrainian, accepted };
});
test.after(() => {
  if (prepared) fs.rmSync(prepared.root, { recursive: true, force: true });
});

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'article-offline-'));
  fs.cpSync(prepared.root, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { ...prepared, root, publicDirectory: path.join(root, 'candidate') };
}

function payload(html) {
  const data = html.match(/<script type="application\/json" id="site-pages">([\s\S]*?)<\/script>/);
  assert.ok(data, 'offline output has one inert finite route payload');
  assert.equal((html.match(/id="site-pages"/g) || []).length, 1);
  return JSON.parse(data[1]);
}

function exportSelected(fixture, articleId, extra = {}) {
  return preview.exportArticle({
    repoRoot: fixture.root,
    articleId,
    publicDirectory: fixture.publicDirectory,
    ...extra,
  });
}

function assertNoNetworkResources(html) {
  const executable = html.replace(
    /<script[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g,
    ''
  );
  assert.doesNotMatch(executable, /<script\b[^>]*\bsrc=|<link\b[^>]*rel="stylesheet"/);
  for (const [, source] of executable.matchAll(/\bsrc="([^"]+)"/g)) {
    assert.ok(source.startsWith('data:'), 'offline native resource is embedded: ' + source);
  }
  for (const [, source] of executable.matchAll(
    /<script(?![^>]*type=)[^>]*>([\s\S]*?)<\/script>/g
  )) {
    new vm.Script(source);
  }
}

test('ordinary offline payloads exclude all article bodies, descriptors, indexes and draft assets', (t) => {
  const f = fixture(t);
  const portrait = fs.readFileSync(
    path.join(f.publicDirectory, 'assets/vitalii-oborskyi-cutout.webp')
  );
  const ordinary = preview.routePayloads(portrait, {
    publicDirectory: f.publicDirectory,
  });
  assert.deepEqual(Object.keys(ordinary.pages), snapshot.routes);
  assert.deepEqual(Object.keys(ordinary.revision.articles || {}), []);
  const bytes = JSON.stringify(ordinary);
  assert.doesNotMatch(
    bytes,
    /EN_BODY_OWNER_1|UK_BODY_OWNER_2|ACCEPTED_UNDATED_BODY_3|site-documents|data-article|article-media/
  );
  for (const html of Object.values(ordinary.pages)) {
    assert.doesNotMatch(html, /name="site-article"/, 'ordinary payload has no article identity');
    assert.match(
      html,
      /name="site-article-renderer" content="1"/,
      'ordinary payload retains the shared renderer compatibility contract'
    );
  }
  assert.match(bytes, /hosted edition/);
});

test('explicit article export contains one selected document, bounded inert HTML and verified asset payload', (t) => {
  const f = fixture(t);
  const result = exportSelected(f, f.english.metadata.id);
  const data = payload(result.html);
  const key = f.english.metadata.id + ':en';
  assert.deepEqual(Object.keys(data.pages), [...snapshot.routes, 'article:' + key]);
  assert.deepEqual(Object.keys(data.revision.articles), [key]);
  assert.match(data.pages['article:' + key], /EN_BODY_OWNER_1/);
  assert.doesNotMatch(JSON.stringify(data), /UK_BODY_OWNER_2|ACCEPTED_UNDATED_BODY_3/);
  assert.ok(Buffer.byteLength(data.pages['article:' + key]) <= 100000);
  const descriptor = data.revision.articles[key];
  assert.equal(builder.sha(data.pages['article:' + key]), descriptor.sha256);
  assert.deepEqual(Object.keys(data.assets), descriptor.assets);
  for (const name of descriptor.assets) {
    const asset = data.assets[name];
    assert.equal(asset.mime, 'image/png');
    assert.equal(asset.bytes, pixel.length);
    assert.equal(asset.base64, undefined, 'asset bytes appear once in the native document');
    assert.equal(asset.sha256, name.split('/')[1]);
    assert.match(
      data.pages['article:' + key],
      new RegExp('src="' + name.replaceAll('.', '\\.') + '"')
    );
  }
  const nativeMain = result.html.match(/<main\b[\s\S]*?<\/main>/)[0];
  const inlinePNG = nativeMain.match(/src="data:image\/png;base64,([^"]+)"/);
  assert.ok(inlinePNG, 'native article PNG remains available without JavaScript');
  assert.deepEqual(Buffer.from(inlinePNG[1], 'base64'), pixel);
  assert.equal(
    result.html.split(pixel.toString('base64')).length - 1,
    1,
    'selected PNG bytes are embedded once'
  );
  assert.equal(
    builder.sha(Buffer.from(inlinePNG[1], 'base64')),
    data.assets[descriptor.assets[0]].sha256
  );
  assert.ok(nativeMain.includes('data-offline-resource="' + descriptor.assets[0] + '"'));
  assert.match(result.html, /<html lang="en"/);
  assert.match(result.html, /English offline reader/);
  assert.ok(
    result.html.includes(fs.readFileSync(path.join(f.publicDirectory, 'styles.css'), 'utf8')),
    'standalone CSS comes from the selected public directory'
  );
  for (const name of ['theme.js', 'space.js', 'archive.js', 'navigation.js']) {
    assert.ok(
      result.html.includes(fs.readFileSync(path.join(f.publicDirectory, name), 'utf8')),
      'standalone runtime comes from the selected public directory: ' + name
    );
  }
  assertNoNetworkResources(result.html);
});

test('explicit Ukrainian namespace preserves language and disables unembedded translation alternates', (t) => {
  const f = fixture(t);
  const { html, manifest } = exportSelected(f, f.ukrainian.metadata.id);
  const data = payload(html);
  assert.equal(manifest.key, 'offline-ukrainian:uk');
  assert.equal(manifest.language, 'uk');
  assert.match(html, /<html lang="uk"/);
  assert.match(html, /Український читач/);
  assert.match(data.pages['article:offline-ukrainian:uk'], /UK_BODY_OWNER_2/);
  assert.doesNotMatch(JSON.stringify(data), /EN_BODY_OWNER_1/);
  assert.doesNotMatch(html, /<link\b[^>]*rel="alternate"/);
});

test('accepted undated export uses its committed content edition without inventing date or canonical metadata', (t) => {
  const f = fixture(t);
  const { html, manifest } = exportSelected(f, f.accepted.metadata.id, {
    publicDirectory: path.join(f.root, 'docs'),
  });
  assert.equal(manifest.articleId, f.accepted.metadata.id);
  assert.equal(manifest.contentEdition, f.accepted.edition.id);
  assert.equal(manifest.sourceSha256, f.accepted.edition.source.sha256);
  assert.equal(manifest.semanticSha256, f.accepted.edition.semanticSha256);
  assert.equal(manifest.sourceURL, 'articles/offline-undated.html');
  const nativeHead = html.slice(0, html.indexOf('</head>'));
  assert.doesNotMatch(nativeHead, /datePublished|dateModified|<link rel="canonical"/);
  assert.doesNotMatch(
    payload(html).pages['article:offline-undated:en'],
    /datePublished|dateModified|<link rel="canonical"/
  );
  assert.match(html, /ACCEPTED_UNDATED_BODY_3/);
});

test('output and manifest bind the exact bytes and embedded source inputs', (t) => {
  const f = fixture(t);
  const outputFile = path.join(f.root, 'deliverable/article.html');
  const { html, manifest } = exportSelected(f, f.english.metadata.id, {
    outputFile,
  });
  assert.equal(fs.readFileSync(outputFile, 'utf8'), html);
  assert.deepEqual(JSON.parse(fs.readFileSync(outputFile + '.manifest.json')), manifest);
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.kind, 'standalone-article-review');
  assert.equal(manifest.sha256, builder.sha(html));
  assert.equal(manifest.bytes, Buffer.byteLength(html));
  assert.ok(manifest.gzipBytes > 0);
  assert.ok(Object.keys(manifest.assets).length > 0);
  for (const [name, sha256] of Object.entries(manifest.inputs)) {
    assert.equal(builder.sha(fs.readFileSync(path.join(f.publicDirectory, name))), sha256, name);
  }
});

test('selection requires an explicit known article from the supplied coherent public directory', (t) => {
  const f = fixture(t);
  for (const articleId of [
    undefined,
    null,
    '',
    [],
    'missing',
    'a'.repeat(81),
    '../offline-english',
    'offline-english:en',
  ]) {
    assert.throws(() => exportSelected(f, articleId));
  }
  assert.throws(
    () =>
      exportSelected(f, f.english.metadata.id, {
        publicDirectory: path.join(f.root, 'docs'),
      }),
    /selected|missing|article/i
  );
});

for (const mode of ['missing', 'corrupt', 'digest']) {
  test(
    'offline export rejects ' + mode + ' selected PNG before replacing an existing output',
    (t) => {
      const f = fixture(t);
      const revisionFile = path.join(f.publicDirectory, 'site-revision.json');
      const revision = JSON.parse(fs.readFileSync(revisionFile));
      const descriptor = revision.articles['offline-english:en'];
      const name = descriptor.assets[0];
      if (mode === 'missing') fs.rmSync(path.join(f.publicDirectory, name));
      if (mode === 'corrupt') fs.writeFileSync(path.join(f.publicDirectory, name), 'broken PNG');
      if (mode === 'digest') {
        descriptor.assets = [name.replace(name.split('/')[1], 'a'.repeat(64))];
        fs.mkdirSync(path.dirname(path.join(f.publicDirectory, descriptor.assets[0])), {
          recursive: true,
        });
        fs.copyFileSync(
          path.join(f.publicDirectory, name),
          path.join(f.publicDirectory, descriptor.assets[0])
        );
        json(f.root, 'candidate/site-revision.json', revision);
      }
      const outputFile = path.join(f.root, 'existing.html');
      fs.writeFileSync(outputFile, 'previous reviewed offline bytes');
      assert.throws(() => exportSelected(f, f.english.metadata.id, { outputFile }));
      assert.equal(fs.readFileSync(outputFile, 'utf8'), 'previous reviewed offline bytes');
      assert.equal(fs.existsSync(outputFile + '.manifest.json'), false);
    }
  );
}

test('offline export rejects descriptor source drift and an out-of-bound article asset inventory', (t) => {
  const f = fixture(t);
  const revisionFile = path.join(f.publicDirectory, 'site-revision.json');
  const before = JSON.parse(fs.readFileSync(revisionFile));
  const changed = structuredClone(before);
  changed.articles['offline-english:en'].sourceSha256 = 'a'.repeat(64);
  json(f.root, 'candidate/site-revision.json', changed);
  assert.throws(() => exportSelected(f, f.english.metadata.id), /identity|source|edition/i);
  const overflow = structuredClone(before);
  overflow.articles['offline-english:en'].assets = Array(51).fill(
    overflow.articles['offline-english:en'].assets[0]
  );
  json(f.root, 'candidate/site-revision.json', overflow);
  assert.throws(() => exportSelected(f, f.english.metadata.id), /asset|finite|inventory/i);
});

test('offline outputs cannot overwrite authored or public inputs through either document or manifest paths', (t) => {
  const f = fixture(t);
  const manuscript = path.join(f.root, f.english.directory, f.english.metadata.source);
  const sourceBytes = fs.readFileSync(manuscript);
  for (const outputFile of [
    manuscript,
    path.join(f.publicDirectory, 'writing.html'),
    path.join(f.root, 'tools/build_site_previews.cjs'),
  ]) {
    assert.throws(
      () => exportSelected(f, f.english.metadata.id, { outputFile }),
      /protected|source|input|output/i
    );
    assert.deepEqual(fs.readFileSync(manuscript), sourceBytes);
  }
  const outputFile = path.join(f.root, 'safe-review.html');
  fs.writeFileSync(outputFile, 'prior review');
  fs.symlinkSync(manuscript, outputFile + '.manifest.json');
  assert.throws(() => exportSelected(f, f.english.metadata.id, { outputFile }), /symbolic|link/i);
  assert.equal(fs.readFileSync(outputFile, 'utf8'), 'prior review');
  assert.deepEqual(fs.readFileSync(manuscript), sourceBytes);
});

test('offline destinations reject symbolic parent paths and hardlinked existing files before mutation', (t) => {
  const f = fixture(t);
  const parent = path.join(f.root, 'linked-review');
  fs.symlinkSync(path.join(f.root, 'site/publications'), parent);
  assert.throws(
    () =>
      exportSelected(f, f.english.metadata.id, {
        outputFile: path.join(parent, 'new.html'),
      }),
    /symbolic|link/i
  );
  const first = path.join(f.root, 'prior-independent.html');
  const second = path.join(f.root, 'hardlinked-review.html');
  fs.writeFileSync(first, 'prior independent bytes');
  fs.linkSync(first, second);
  assert.throws(
    () => exportSelected(f, f.english.metadata.id, { outputFile: second }),
    /hardlink|link/i
  );
  assert.equal(fs.readFileSync(first, 'utf8'), 'prior independent bytes');
  assert.equal(fs.readFileSync(second, 'utf8'), 'prior independent bytes');
});

test('public and source input aliases cannot conceal document or manifest output overlap', (t) => {
  const f = fixture(t);
  const publicAlias = path.join(f.root, 'public-alias');
  const parentAlias = path.join(f.root, 'parent-alias');
  fs.symlinkSync(f.publicDirectory, publicAlias);
  fs.symlinkSync(f.root, parentAlias);
  const publicBytes = fs.readFileSync(path.join(f.publicDirectory, 'writing.html'));
  const publicManifest = fs.readFileSync(path.join(f.publicDirectory, 'site-revision.json'));
  for (const publicDirectory of [publicAlias, path.join(parentAlias, 'candidate')]) {
    assert.throws(
      () =>
        exportSelected(f, f.english.metadata.id, {
          publicDirectory,
          outputFile: path.join(f.publicDirectory, 'writing.html'),
        }),
      /input root|symbolic|protected/i
    );
    assert.deepEqual(fs.readFileSync(path.join(f.publicDirectory, 'writing.html')), publicBytes);
    assert.deepEqual(
      fs.readFileSync(path.join(f.publicDirectory, 'site-revision.json')),
      publicManifest
    );
    assert.equal(fs.existsSync(path.join(f.publicDirectory, 'writing.html.manifest.json')), false);
  }
  for (const suffix of ['', '.manifest.json']) {
    const outputFile = path.join(f.root, 'tracked-owner' + (suffix ? '-pair' : '') + '.html');
    const source = outputFile + suffix;
    fs.writeFileSync(source, 'tracked independent source bytes');
    const sourceAlias = path.join(f.root, 'tracked-owner-alias' + (suffix ? '-pair' : ''));
    fs.symlinkSync(source, sourceAlias);
    cp.execFileSync('git', ['add', '--', path.relative(f.root, sourceAlias)], {
      cwd: f.root,
    });
    if (suffix) fs.writeFileSync(outputFile, 'previous independent review bytes');
    assert.throws(
      () =>
        exportSelected(f, f.english.metadata.id, {
          repoRoot: parentAlias,
          outputFile,
        }),
      /input root|symbolic|protected/i
    );
    assert.equal(fs.readFileSync(source, 'utf8'), 'tracked independent source bytes');
    if (suffix)
      assert.equal(fs.readFileSync(outputFile, 'utf8'), 'previous independent review bytes');
    assert.throws(
      () => exportSelected(f, f.english.metadata.id, { outputFile }),
      /protected source|public input/i,
      'a real source root protects each tracked owner alias target'
    );
    assert.equal(fs.readFileSync(source, 'utf8'), 'tracked independent source bytes');
    if (suffix)
      assert.equal(fs.readFileSync(outputFile, 'utf8'), 'previous independent review bytes');
  }
  const positive = preview.exportArticle({
    repoRoot: f.root,
    publicDirectory: f.publicDirectory,
    articleId: f.accepted.metadata.id,
    outputFile: path.join(f.root, 'independent-accepted-review.html'),
  });
  assert.equal(positive.manifest.articleId, f.accepted.metadata.id);
  assert.equal(positive.manifest.kind, 'standalone-article-review');
});

test('presentation export retains declared PDF links and rejects mutated PDF bytes', (t) => {
  const f = fixture(t);
  const article = publication(f.root, 'offline-presentation', 'en', 'PDF_PRESENTATION_OWNER');
  // Small synthetic PDF envelope exercises closure; the real deck is checked in the hosted journey.
  const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Page >>\nendobj\n%%EOF\n');
  const pdfPath = 'site/assets/publications/offline-presentation/slides.pdf';
  article.metadata.presentation = {
    title: 'Presentation',
    poster: 'pixel',
    pdf: { path: pdfPath, sha256: builder.sha(pdf) },
    sourceUrl: 'https://example.com/slides.pdf',
  };
  write(f.root, pdfPath, pdf);
  article.edition.semanticSha256 = publisher.semanticDigest(
    article.metadata,
    article.edition.source
  );
  json(f.root, article.directory + '/publication.json', article.metadata);
  json(f.root, article.directory + '/editions/offline-first.json', article.edition);
  builder.build({
    root: f.root,
    output: f.publicDirectory,
    all: true,
    cacheFile: path.join(f.root, 'presentation.cache.json'),
    candidateArticles: [article.metadata.id],
  });
  const result = exportSelected(f, article.metadata.id);
  const data = payload(result.html);
  const name = Object.keys(data.assets).find((name) => name.endsWith('.pdf'));
  assert.equal(data.assets[name].mime, 'application/pdf');
  assert.equal(data.assets[name].sha256, builder.sha(pdf));
  assert.equal((result.html.match(/href="data:application\/pdf;base64,/g) || []).length, 3);
  assert.match(data.pages['article:offline-presentation:en'], /presentation-toggle/);
  assert.doesNotMatch(result.html, /<iframe\b/);
  assertNoNetworkResources(result.html);
  fs.appendFileSync(path.join(f.publicDirectory, name), 'changed');
  assert.throws(() => exportSelected(f, article.metadata.id), /digest|differ|match/);
});
