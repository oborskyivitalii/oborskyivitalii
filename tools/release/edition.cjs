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
      '">\n</head>'
  );
}

function build(directory) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  assert.equal(record.components.variant?.id || 'base', 'base', 'Color remains staging-only');
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
    inputs: { origin, robots, sitemap: productionSitemap, notFound },
    render: (html, id) => render(html, id, articles),
    files: { 'robots.txt': robots, 'sitemap.xml': productionSitemap, '404.html': notFound },
  });
}

function verify(directory, record) {
  assert.deepEqual(record.edition, { id: 'production', indexable: true, origin });
  assert.equal(record.components.variant?.id || 'base', 'base');
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
  const [mode, directory] = process.argv.slice(2);
  if (mode === 'build') build(directory);
  else if (mode === 'verify')
    verify(directory, JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json'))));
  else throw Error('Usage: edition.cjs build|verify DIRECTORY');
}
module.exports = {
  origin,
  routeURL,
  documentURL,
  notFound,
  robots,
  sitemap,
  sitemapFor,
  render,
  build,
  verify,
};
