'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const edition = require('../site/edition.cjs');
const snapshot = require('../site/snapshot.cjs');
const publicationPolicy = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../site/publications/policy.json'), 'utf8')
);
assert.equal(publicationPolicy.schema, 1);
assert.deepEqual(Object.keys(publicationPolicy).sort(), ['productionOrigin', 'schema']);
const publicationOrigin = new URL(publicationPolicy.productionOrigin);
assert.equal(publicationOrigin.protocol, 'https:');
assert.equal(publicationOrigin.origin, publicationPolicy.productionOrigin);
assert.equal(publicationOrigin.username + publicationOrigin.password, '');
const origin = publicationOrigin.origin;
const social = require('../../site/content/production-social.json');
const motion = require('../quality/color-motion-contract.cjs');
assert.deepEqual(Object.keys(social), ['schema', 'file', 'type', 'width', 'height', 'alt']);
assert.equal(social.schema, 1);
assert.equal(social.file, 'assets/vitalii-oborskyi.jpg');
assert.equal(social.type, 'image/jpeg');
assert.equal(social.width, 960);
assert.equal(social.height, 887);
assert.ok(typeof social.alt === 'string' && /^[A-Za-z0-9 ,.-]+$/.test(social.alt));
const socialMetadata =
  '<meta property="og:image" content="' +
  origin +
  '/' +
  social.file +
  '">\n' +
  '<meta property="og:image:type" content="' +
  social.type +
  '">\n' +
  '<meta property="og:image:width" content="' +
  social.width +
  '">\n' +
  '<meta property="og:image:height" content="' +
  social.height +
  '">\n' +
  '<meta property="og:image:alt" content="' +
  social.alt +
  '">\n' +
  '<meta name="twitter:image" content="' +
  origin +
  '/' +
  social.file +
  '">\n' +
  '<meta name="twitter:image:alt" content="' +
  social.alt +
  '">\n';
const notFound =
  '<!doctype html><html lang="en"><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="robots" content="noindex,nofollow"><title>Page not found</title>' +
  '<main><h1>Page not found</h1><p><a href="/">Home</a></p></main></html>\n';
const robots = 'User-agent: *\nDisallow: /staging/\nSitemap: ' + origin + '/sitemap.xml\n';
const routeURL = (id) => origin + (id === 'index' ? '/' : '/' + id + '.html');
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  snapshot.routes.map((id) => '<url><loc>' + routeURL(id) + '</loc></url>').join('') +
  '</urlset>\n';

function documentURL(id, articles = {}) {
  if (!id.startsWith('article:')) return routeURL(id);
  const article = articles[id.slice('article:'.length)];
  assert.ok(article, 'unknown production article');
  assert.match(article.alias, /^articles\/[a-z][a-z0-9-]{0,79}\.html$/);
  assert.notEqual(article.candidate, true, 'candidate article cannot be indexed');
  return origin + '/' + article.alias;
}

function sitemapFor(articles = {}) {
  const articleURLs = Object.keys(articles)
    .sort()
    .map((key) => documentURL('article:' + key, articles));
  return sitemap.replace(
    '</urlset>',
    articleURLs.map((url) => '<url><loc>' + url + '</loc></url>').join('') + '</urlset>'
  );
}

function render(html, id, articles = {}) {
  assert.doesNotMatch(html, /name="site-environment"/, 'edition already applied');
  assert.doesNotMatch(html, /class="site-environment"/);
  assert.doesNotMatch(html, /(?:property="og:image(?:[:"]|$)|name="twitter:image)/);
  html = edition.compactData(html);
  html = html.replace(/<meta name="robots"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  html = html.replace(/<meta property="og:url"[^>]*>/g, '');
  const canonical = documentURL(id, articles);
  return html.replace(
    '</head>',
    '<meta name="robots" content="index,follow">\n' +
      '<meta name="site-environment" content="production">\n' +
      '<link rel="canonical" href="' +
      canonical +
      '">\n' +
      '<meta property="og:url" content="' +
      canonical +
      '">\n' +
      socialMetadata +
      '</head>'
  );
}

function build(directory, variant = 'base') {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  assert.ok(['base', 'color'].includes(variant), 'select an explicit production rendition');
  assert.equal(record.components.variant?.id || 'base', variant, 'wrong production rendition');
  if (variant === 'color') motion.select(record);
  assert.notEqual(
    record.components.preview,
    true,
    'candidate article preview cannot become production'
  );
  const articles = record.components.articles || {};
  const productionSitemap = sitemapFor(articles);
  return edition.build(directory, {
    edition: { id: 'production', indexable: true, origin },
    css: '',
    inputs: { origin, robots, sitemap: productionSitemap, notFound, social },
    render: (html, id) => render(html, id, articles),
    files: { 'robots.txt': robots, 'sitemap.xml': productionSitemap, '404.html': notFound },
  });
}

function verify(directory, record) {
  assert.deepEqual(record.edition, { id: 'production', indexable: true, origin });
  const variant = record.components.variant?.id || 'base';
  assert.ok(['base', 'color'].includes(variant), 'unsupported production rendition');
  if (variant === 'color') motion.select(record);
  assert.ok(
    fs
      .readFileSync(path.join(directory, 'public', social.file))
      .equals(fs.readFileSync(path.join(__dirname, '../../site', social.file))),
    'production social image differs from its authored source'
  );
  assert.equal(
    record.files[social.file]?.sha256,
    require('../quality/artifact.cjs').digest(
      fs.readFileSync(path.join(directory, 'public', social.file))
    ),
    'production social image differs from the artifact manifest'
  );
  assert.notEqual(record.components.preview, true, 'preview in production');
  for (const [name, bytes] of Object.entries({
    'robots.txt': robots,
    'sitemap.xml': sitemapFor(record.components.articles || {}),
    '404.html': notFound,
  }))
    assert.equal(fs.readFileSync(path.join(directory, 'public', name), 'utf8'), bytes);
  for (const id of snapshot.routes) {
    for (const file of [id + '.html', record.components.routes[id].url]) {
      const html = fs.readFileSync(path.join(directory, 'public', file), 'utf8');
      assert.match(html, /name="robots" content="index,follow"/);
      assert.ok(html.includes('<link rel="canonical" href="' + routeURL(id) + '">'));
      assert.ok(html.includes(socialMetadata), 'missing production social image metadata');
      assert.equal((html.match(/property="og:image"/g) || []).length, 1);
      assert.equal((html.match(/name="twitter:image"/g) || []).length, 1);
      assert.doesNotMatch(html, /class="site-environment"|name="robots" content="noindex/);
    }
  }
  for (const [key, article] of Object.entries(record.components.articles || {})) {
    const canonical = documentURL('article:' + key, record.components.articles);
    for (const file of [article.alias, article.url]) {
      const html = fs.readFileSync(path.join(directory, 'public', file), 'utf8');
      assert.match(html, /name="robots" content="index,follow"/);
      assert.ok(html.includes('<link rel="canonical" href="' + canonical + '">'));
      assert.doesNotMatch(html, /class="site-environment"|name="robots" content="noindex/);
    }
  }
  return true;
}

if (require.main === module) {
  const [mode, directory, variant] = process.argv.slice(2);
  if (mode === 'build') {
    build(directory, variant);
    require('./rights.cjs').write(directory, { requireCheckout: true });
  } else if (mode === 'verify')
    verify(directory, JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json'))));
  else throw Error('Usage: edition.cjs build DIRECTORY [base|color] | verify DIRECTORY');
}
module.exports = {
  origin,
  routeURL,
  documentURL,
  sitemapFor,
  social,
  notFound,
  robots,
  sitemap,
  render,
  build,
  verify,
};
