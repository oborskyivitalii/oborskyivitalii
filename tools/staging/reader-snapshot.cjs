'use strict';
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto');
const routes = ['index', 'research', 'writing', 'talks', 'credits'];
const runtimeFiles = ['styles.css', 'theme.js', 'space.js', 'archive.js', 'navigation.js'];
const legacyMediaFiles = ['favicon.svg', 'vitalii-oborskyi.jpg', 'vitalii-oborskyi-cutout.webp'];
const mediaFiles = [...legacyMediaFiles, 'writing-paradigm.svg'];
const baseFiles = [
  '.nojekyll',
  ...routes.map((x) => x + '.html'),
  ...runtimeFiles,
  ...mediaFiles.map((x) => 'assets/' + x),
  'site-revision.json',
].sort();
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
// Optional downloads remain in the full immutable closure. Only a single native
// anchor may reference one; displayed, preloaded or embedded bytes still count.
function downloads(article, html, read) {
  const names = article.downloads === undefined ? [] : article.downloads;
  assert.ok(Array.isArray(names) && names.length <= 1, 'finite article downloads');
  for (const name of names) {
    assert.match(name, /^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*\.pdf$/);
    assert.ok(article.assets.includes(name), 'download missing from full closure');
    const bytes = read(name);
    assert.ok(
      bytes.length <= 2000000 && bytes.subarray(0, 5).toString() === '%PDF-',
      'download PDF bytes'
    );
    assert.equal(hash(bytes), name.split('/')[1], 'download PDF identity');
    assert.equal(html.split(name).length, 2, 'download must have one native link only');
    const anchor = new RegExp(
      '<a\\s+href="(?:\\.\\./)*' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"(?:\\s[^>]*)?>'
    );
    assert.ok(anchor.test(html), 'download requires an ordinary anchor, never automatic loading');
  }
  return names;
}
function immutable(name) {
  if (/^(?:article-media|article-snapshots)\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*$/.test(name))
    return !name.startsWith('article-snapshots/') || name.endsWith('.html');
  const match = name.match(/^(runtime|media|snapshots)\/([a-f0-9]{64})\/([a-z0-9.-]+)$/);
  return (
    !!match &&
    (match[1] === 'runtime'
      ? [...runtimeFiles, 'analytics.js']
      : match[1] === 'media'
        ? mediaFiles
        : routes.map((x) => x + '.html')
    ).includes(match[3])
  );
}
function inventory(names, requiredMedia = legacyMediaFiles, edition = null, articles = {}) {
  assert.ok(names.length <= 1000, 'public retention inventory bound');
  for (const name of baseFiles
    .filter((name) => !name.startsWith('assets/'))
    .concat(requiredMedia.map((name) => 'assets/' + name)))
    assert.ok(names.includes(name), 'missing public file ' + name);
  const hostFiles = edition === 'production' ? ['404.html', 'robots.txt', 'sitemap.xml'] : [];
  for (const name of hostFiles) assert.ok(names.includes(name), 'missing production input ' + name);
  const aliases = Object.values(articles).map((article) => article.alias);
  for (const name of aliases) assert.ok(names.includes(name), 'missing article alias ' + name);
  for (const name of names)
    assert.ok(
      baseFiles.includes(name) ||
        name === 'publication-index.json' ||
        immutable(name) ||
        hostFiles.includes(name) ||
        aliases.includes(name),
      'unexpected public input ' + name
    );
  return true;
}
function verifyDocumentContract(html, revision, key = null, article = null) {
  if (revision.navigation === undefined) return;
  assert.ok(
    html.includes('name="site-article-renderer" content="1"'),
    'current document renderer compatibility'
  );
  if (!article) {
    assert.ok(!html.includes('id="site-documents"'), 'hosted platform registry is external');
    return;
  }
  const index = html.match(
    /<script type="application\/json" id="site-documents">([\s\S]*?)<\/script>/
  );
  assert.ok(index, 'article boot descriptor missing');
  assert.deepEqual(
    JSON.parse(index[1]),
    { [key]: { url: article.alias, snapshot: article.url } },
    'article boot descriptor differs from current snapshot'
  );
}

function verifyPublicationIndex(read, files) {
  if (read('archive.js').toString().includes('window.SiteArticleTags=')) {
    assert.ok(files['publication-index.json'], 'missing current publication index');
    const bytes = read('publication-index.json');
    const tags = require('./reader-index.cjs');
    assert.ok(bytes.length <= tags.limit, 'publication index byte budget');
    tags.validate(JSON.parse(bytes.toString('utf8')));
  }
}

function verify(dir, record) {
  const files = record.files;
  const read = (name) => fs.readFileSync(path.join(dir, name));
  const revision = JSON.parse(read('site-revision.json'));
  const articles = revision.articles || {};
  assert.ok(Object.keys(articles).length <= 50, 'finite article document inventory');
  const aliases = new Set();
  for (const [key, article] of Object.entries(articles)) {
    assert.match(key, /^[a-z][a-z0-9-]{0,79}:(?:en|uk)$/);
    assert.match(article.alias, /^articles\/[a-z][a-z0-9-]{0,79}\.html$/);
    assert.equal(article.scene, 'writing', 'article shares the existing Writing scene');
    assert.equal(article.articleId, key.split(':')[0], 'article stable identity');
    assert.match(article.contentEdition, /^[a-z][a-z0-9-]{0,79}$/);
    assert.match(article.sourceSha256, /^[a-f0-9]{64}$/);
    assert.match(article.semanticSha256, /^[a-f0-9]{64}$/);
    assert.ok(!aliases.has(article.alias), 'duplicate article alias');
    aliases.add(article.alias);
    assert.ok(
      Array.isArray(article.assets) && article.assets.length <= 50,
      'finite article assets'
    );
    assert.ok(
      article.candidate !== true || revision.preview === true,
      'candidate in public revision'
    );
    assert.ok(
      record.edition?.id !== 'production' || revision.preview !== true,
      'preview in production'
    );
  }
  const declaredMedia = revision.mediaFiles === undefined ? legacyMediaFiles : revision.mediaFiles;
  if (revision.mediaFiles !== undefined)
    assert.deepEqual(declaredMedia, mediaFiles, 'finite current media declaration');
  else
    assert.ok(
      !Object.hasOwn(files, 'assets/writing-paradigm.svg') &&
        !read('space.js').toString().includes('writing-paradigm') &&
        !read('writing.html').toString().includes('writing-paradigm'),
      'formula artifact requires current media declaration'
    );
  inventory(Object.keys(files), declaredMedia, record.edition?.id, articles);
  verifyPublicationIndex(read, files);
  assert.deepEqual(revision.edition, record.edition, 'edition manifest differs from runtime');
  assert.equal(revision.schema, 1);
  assert.equal(revision.contract, 1);
  if (revision.navigation !== undefined)
    assert.deepEqual(
      revision.navigation,
      { contract: 1, articleRenderer: 1 },
      'navigation/renderer compatibility contract'
    );
  for (const key of ['engine', 'scenes', 'assets', 'content'])
    assert.match(revision[key], /^[a-f0-9]{64}$/);
  assert.deepEqual(Object.keys(revision.routes), routes);
  for (const name of runtimeFiles)
    assert.deepEqual(
      read(`runtime/${revision.engine}/${name}`),
      read(name),
      'immutable runtime differs from tested alias'
    );
  for (const name of declaredMedia)
    assert.deepEqual(
      read(`media/${revision.assets}/${name}`),
      read('assets/' + name),
      'immutable media differs from tested alias'
    );
  for (const name of Object.keys(files).filter((x) =>
    /^runtime\/[a-f0-9]{64}\/analytics\.js$/.test(x)
  ))
    assert.equal(hash(read(name)), name.split('/')[1], 'immutable analytics digest');
  for (const id of routes) {
    const route = revision.routes[id];
    assert.match(route.version, /^[a-f0-9]{64}$/);
    assert.match(route.sha256, /^[a-f0-9]{64}$/);
    assert.equal(route.url, `snapshots/${route.version}/${id}.html`);
    assert.equal(hash(read(route.url)), route.sha256, 'route snapshot digest');
    const html = read(id + '.html').toString();
    assert.ok(html.includes(`name="site-engine" content="${revision.engine}"`));
    assert.ok(html.includes(`name="site-route" content="${route.version}"`));
    verifyDocumentContract(html, revision);
    for (const name of runtimeFiles)
      assert.ok(
        html.includes(`="runtime/${revision.engine}/${name}"`),
        'unversioned runtime reference'
      );
  }
  for (const [key, article] of Object.entries(articles)) {
    assert.match(article.version, /^[a-f0-9]{64}$/);
    assert.match(article.sha256, /^[a-f0-9]{64}$/);
    assert.equal(
      article.url,
      `article-snapshots/${article.version}/${path.posix.basename(article.alias)}`
    );
    assert.equal(hash(read(article.url)), article.sha256, 'article snapshot digest');
    for (const name of [article.alias, article.url]) {
      const html = read(name).toString();
      downloads(article, html, read);
      assert.ok(Buffer.byteLength(html, 'utf8') <= 100000, 'article HTML byte budget');
      assert.ok(
        html.includes(`data-page="writing" data-article="${key}"`),
        'article document identity'
      );
      assert.ok(html.includes(`name="site-engine" content="${revision.engine}"`));
      assert.ok(html.includes(`name="site-route" content="${article.version}"`));
      verifyDocumentContract(html, revision, key, article);
    }
    for (const name of article.assets) {
      assert.match(name, /^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*$/);
      assert.equal(hash(read(name)), name.split('/')[1], 'article asset digest');
      assert.ok(read(name).length <= 2000000, 'article asset byte budget');
    }
  }
  for (const name of Object.keys(files).filter((x) => x.endsWith('.html'))) {
    const html = read(name).toString(),
      base = new URL(name, 'https://snapshot.invalid/');
    for (const [, value] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      const url = new URL(value.replaceAll('&amp;', '&'), base);
      if (url.origin !== base.origin) continue;
      const target = decodeURIComponent(url.pathname.slice(1)) || 'index.html';
      assert.ok(
        Object.hasOwn(files, target),
        'snapshot dependency missing ' + name + ' → ' + target
      );
    }
  }
  return revision;
}
function resourceContent(name, bytes) {
  const digest = require('node:crypto').createHash('sha256').update(bytes).digest('hex');
  if (name !== `article-media/${digest}/writing-fallback.svg` || bytes.length > 2000000)
    throw Error('Writing fallback resource identity differs');
  const text = bytes.toString('utf8');
  if (!Buffer.from(text).equals(bytes)) throw Error('Writing fallback must be UTF-8');
  const prefix = '<svg xmlns="http://www.w3.org/2000/svg"><g id="writing-fallback">';
  if (!text.startsWith(prefix) || !text.endsWith('</g></svg>'))
    throw Error('Writing fallback resource wrapper differs');
  const content = text.slice(prefix.length, -10);
  const tags = new Set(['g', 'path', 'defs', 'linearGradient', 'stop']);
  const attributes = new Set([
    'xmlns',
    'id',
    'class',
    'fill',
    'stroke',
    'data-motif',
    'viewBox',
    'preserveAspectRatio',
    'd',
    'stroke-width',
    'stroke-opacity',
    'fill-opacity',
    'data-formula',
    'aria-hidden',
    'stroke-linecap',
    'stroke-linejoin',
    'gradientUnits',
    'x1',
    'y1',
    'x2',
    'y2',
    'offset',
    'stop-color',
    'data-formula-layer',
    'data-glyph',
  ]);
  // Only the finite passive vocabulary emitted above is accepted. In particular
  // no scripts, links, style containers, event attributes or imported SVG pass.
  const remainder = content.replace(/<\/?([A-Za-z]+)\b([^<>]*)>/g, (_, tag, raw) => {
    if (!tags.has(tag)) throw Error('Unsupported Writing fallback element');
    const rest = raw.replace(/ ([\w-]+)="([^"]*)"/g, (_, key, value) => {
      if (!attributes.has(key) || /[<>&]/.test(value))
        throw Error('Unsupported Writing fallback attribute');
      if (/url\(/i.test(value) && value !== 'url(#writing-paradigm-ribbon)')
        throw Error('External Writing fallback paint');
      return '';
    });
    if (rest !== '' && rest !== '/') throw Error('Malformed Writing fallback tag');
    return '';
  });
  if (remainder !== '') throw Error('Unexpected Writing fallback content');
  return content;
}

module.exports = {
  resourceContent,
  downloads,
  routes,
  runtimeFiles,
  mediaFiles,
  legacyMediaFiles,
  baseFiles,
  immutable,
  inventory,
  verify,
};
