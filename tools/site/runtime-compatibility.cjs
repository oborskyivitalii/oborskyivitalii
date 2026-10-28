'use strict';
// Client compatibility is independent of complete build-source provenance.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const snapshot = require('./snapshot.cjs');
const digestPattern = /^[a-f0-9]{64}$/;
const inputKeys = [
  'contract',
  'variant',
  'scenes',
  'assets',
  'templates',
  'pageTemplates',
  'routes',
];
const reviewedClient = '2fe6a007782832aee3818c1a0b80e95a1fb548b11dca1551a3423f690e6dc014';
const reviewedEngine = '43054e4d9861831ec39cbf2e4217ca33b13959bb329959fd7a86413b2ddea3d2';
const reviewedDocumentClients = new Set([
  reviewedClient,
  'a41ab65b9c8182318ae1333272289aac5d651fa1e19cc075609632b5fb082b85',
  'a404b4b436e6686261dc634814303fd592eca7d1f6c39bb042a515fe5b4bc4ee',
]);

function fingerprint(components, files) {
  assert.equal(components.contract, 1, 'client scene contract');
  for (const key of inputKeys.slice(1))
    assert.match(components[key] || '', digestPattern, 'client input ' + key);
  assert.deepEqual(Object.keys(files).sort(), [...snapshot.runtimeFiles].sort(), 'client files');
  for (const value of Object.values(files)) assert.match(value, digestPattern, 'client file hash');
  const descriptor = {
    schema: 1,
    navigation: { contract: 1, articleRenderer: 1 },
    routes: snapshot.routes,
    media: snapshot.mediaFiles,
    inputs: Object.fromEntries(inputKeys.map((key) => [key, components[key]])),
    files: Object.fromEntries(snapshot.runtimeFiles.map((name) => [name, files[name]])),
  };
  return crypto.createHash('sha256').update(JSON.stringify(descriptor)).digest('hex');
}

function version(components) {
  assert.match(components.client || '', digestPattern, 'invalid client compatibility identity');
  // This one legacy alias names the same reviewed client contract. It does not
  // replace the fresh producer hash, generation lock, source tree or artifact.
  return components.client === reviewedClient ? reviewedEngine : components.client;
}

function verifyDocument(html, route) {
  const elements = require('./html.cjs').documentElements(html);
  const body = elements.filter((element) => element.tag === 'body');
  assert.equal(body.length, 1, 'client document body');
  assert.equal(body[0].attributes['data-page'], route, 'client route hook');
  for (const [tag, id] of [
    ['main', 'main'],
    ['canvas', 'space-canvas'],
    ['select', 'theme-mode'],
    ['button', 'space-motion'],
  ]) {
    const matches = elements.filter((element) => element.attributes.id === id);
    assert.equal(matches.length, 1, 'client document hook ' + id);
    assert.equal(matches[0].tag, tag, 'client document hook type ' + id);
  }
  assert.equal(
    elements.filter((element) => element.tag === 'footer').length,
    1,
    'client document footer'
  );
  assert.equal(
    elements.filter(
      (element) => element.tag === 'nav' && element.attributes['aria-label'] === 'Main navigation'
    ).length,
    1,
    'client document navigation'
  );
  for (const name of ['space-scene', 'space-fallback', 'site-header'])
    assert.equal(
      elements.filter((element) =>
        (element.attributes.class || '').split(/[ \t\r\n\f]+/).includes(name)
      ).length,
      1,
      'client document class ' + name
    );
  for (const name of ['site-effects-contract', 'site-article-renderer']) {
    const matches = elements.filter(
      (element) => element.tag === 'meta' && element.attributes.name === name
    );
    assert.equal(matches.length, 1, 'client ' + name);
    assert.equal(matches[0].attributes.content, '1', 'client ' + name);
  }
}

function verify(components, generation, read) {
  const files = Object.fromEntries(
    snapshot.runtimeFiles.map((name) => {
      const hash = crypto.createHash('sha256').update(read(name)).digest('hex');
      assert.equal(hash, generation.files[name], 'client runtime bytes differ: ' + name);
      return [name, hash];
    })
  );
  assert.equal(
    fingerprint(components, files),
    components.client,
    'client compatibility bytes differ'
  );
  if (!reviewedDocumentClients.has(components.client)) return;
  for (const [route, entry] of Object.entries(generation.routes))
    for (const name of [entry.url, `snapshots/${entry.version}/${entry.url}`])
      verifyDocument(read(name), route);
  for (const entry of Object.values(generation.articles || {}))
    for (const name of [entry.url, entry.snapshot]) verifyDocument(read(name), 'writing');
}

module.exports = { fingerprint, version, verify };
