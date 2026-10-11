'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const edition = require('../site/edition.cjs');
const snapshot = require('../site/snapshot.cjs');
const origin = 'https://vitaliioborskyi.ai';
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

function render(html, id) {
  assert.doesNotMatch(html, /name="site-environment"/, 'edition already applied');
  assert.doesNotMatch(html, /class="site-environment"/);
  html = edition.compactData(html);
  html = html.replace(/<meta name="robots"[^>]*>/g, '');
  return html.replace(
    '</head>',
    '<meta name="robots" content="index,follow">\n' +
      '<meta name="site-environment" content="production">\n' +
      '<link rel="canonical" href="' +
      routeURL(id) +
      '">\n' +
      '<meta property="og:url" content="' +
      routeURL(id) +
      '">\n</head>'
  );
}

function build(directory) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  assert.equal(record.components.variant?.id || 'base', 'base', 'Color remains staging-only');
  return edition.build(directory, {
    edition: { id: 'production', indexable: true, origin },
    css: '',
    inputs: { origin, robots, sitemap, notFound },
    render,
    files: { 'robots.txt': robots, 'sitemap.xml': sitemap, '404.html': notFound },
  });
}

function verify(directory, record) {
  assert.deepEqual(record.edition, { id: 'production', indexable: true, origin });
  assert.equal(record.components.variant?.id || 'base', 'base');
  for (const [name, bytes] of Object.entries({
    'robots.txt': robots,
    'sitemap.xml': sitemap,
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
  return true;
}

if (require.main === module) {
  const [mode, directory] = process.argv.slice(2);
  if (mode === 'build') build(directory);
  else if (mode === 'verify')
    verify(directory, JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json'))));
  else throw Error('Usage: edition.cjs build|verify DIRECTORY');
}
module.exports = { origin, routeURL, notFound, robots, sitemap, render, build, verify };
