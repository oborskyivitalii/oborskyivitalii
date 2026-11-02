'use strict';
// Pages publishes one complete artifact: preserve accepted production at root.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('../site/snapshot.cjs');
const stagingPackage = require('../staging/package.cjs');

function basePath(value = '/') {
  assert.equal(typeof value, 'string');
  assert.match(value, /^\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]*$/, 'invalid Pages base path');
  assert.ok(!value.split('/').some((part) => part === '.' || part === '..'));
  return value.endsWith('/') ? value : value + '/';
}

function notFoundFor(value = '/') {
  const prefix = basePath(value);
  return (
    '<!doctype html><html lang="en"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex,nofollow"><title>Page not found</title>' +
    '<main><h1>Page not found</h1><p><a href="' +
    prefix +
    '">Home</a> · ' +
    '<a href="' +
    prefix +
    'staging/">Staging</a></p></main></html>\n'
  );
}

const notFound = notFoundFor();

function read(directory) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  assert.equal(record.schema, 1);
  assert.equal(record.sourceDirty, false, 'dirty public source');
  assert.equal(record.sourceCommit, record.candidateCommit);
  assert.match(record.sourceCommit, /^[a-f0-9]{40}$/);
  artifact.verify(path.join(directory, 'public'), record, record.artifactDigest);
  return record;
}

function checkStaging(directory, record) {
  assert.deepEqual(record.edition, { id: 'staging', indexable: false, analytics: false });
  const revision = record.components;
  const documents = new Set(
    Object.keys(record.files).filter((name) => name.endsWith('.html') && !snapshot.immutable(name))
  );
  for (const route of Object.values(revision.routes)) documents.add(route.url);
  for (const article of Object.values(revision.articles || {})) documents.add(article.url);
  for (const file of documents) {
    const html = fs.readFileSync(path.join(directory, 'public', file), 'utf8');
    assert.match(html, /name="robots" content="noindex,nofollow"/);
    assert.match(html, /class="site-environment"[^>]*>STAGING/);
    assert.doesNotMatch(html, /data-site-analytics|google-site-verification/);
  }
}

function copy(directory, target, record) {
  for (const name of Object.keys(record.files)) {
    const file = path.join(target, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.copyFileSync(path.join(directory, 'public', name), file);
  }
}

function subtree(files, prefix) {
  return Object.fromEntries(
    Object.entries(files)
      .filter(([name]) => name.startsWith(prefix))
      .map(([name, value]) => [name.slice(prefix.length), value])
  );
}

function readRights(directory, record, trustedInventoryDigest) {
  if (trustedInventoryDigest)
    return require('../release/rights-record.cjs').read(directory, record, 'production', {
      trustedInventoryDigest,
    });
  const file = path.join(directory, 'rights.json');
  return stagingPackage.publicationRights(
    path.join(directory, 'public'),
    record,
    fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : undefined
  );
}

function verify(directory, record) {
  assert.equal(record.schema, 1);
  assert.equal(record.kind, 'pages-package');
  const prefix = basePath(record.state.basePath || '/');
  if (record.state.basePath !== undefined) assert.equal(record.state.basePath, prefix);
  if (record.state.production) assert.equal(prefix, '/', 'production Pages requires origin root');
  const productionOnly = record.staging === null;
  if (productionOnly) {
    assert.ok(record.state.production, 'production-only Pages needs an admitted production root');
    require('../release/archive.cjs').tag(record.state.production.tag);
    assert.deepEqual(
      record.state.production,
      {
        tag: record.state.production.tag,
        sourceCommit: record.root.sourceCommit,
        publicDigest: record.root.artifactDigest,
      },
      'production-only Pages receipt differs from its frozen root'
    );
    assert.equal(record.root.edition?.id, 'production');
    assert.equal(record.state.staging, null, 'production-only Pages cannot claim staging');
    assert.ok(
      record.rights?.productionArchiveDigest,
      'production-only Pages needs archived rights'
    );
    assert.equal(record.rights.staging, null, 'production-only Pages cannot license staging');
  }
  const publicDir = path.join(directory, 'public');
  const actual = artifact.manifest(publicDir);
  assert.equal(actual.artifactDigest, record.packageDigest, 'combined Pages bytes changed');
  assert.deepEqual(actual.files, record.files);
  assert.deepEqual(
    subtree(actual.files, 'staging/'),
    record.staging?.files || {},
    'staging copy differs'
  );
  for (const [name, info] of Object.entries(record.root.files)) {
    assert.deepEqual(actual.files[name], info, 'accepted production root changed: ' + name);
  }
  assert.deepEqual(
    Object.keys(actual.files).sort(),
    [
      ...new Set([
        ...Object.keys(record.root.files),
        ...Object.keys(record.staging?.files || {}).map((name) => 'staging/' + name),
        '_delivery/state.json',
        '404.html',
      ]),
    ].sort(),
    'unexpected Pages deployment input'
  );
  snapshot.verify(publicDir, record.root);
  if (!productionOnly) snapshot.verify(path.join(publicDir, 'staging'), record.staging);
  const stagingRights = productionOnly
    ? null
    : stagingPackage.publicationRights(
        path.join(publicDir, 'staging'),
        record.staging,
        record.rights?.staging ?? undefined
      );
  const licensing = require('../release/rights-record.cjs');
  if (stagingRights) licensing.publication(record.staging, stagingRights, 'staging');
  const archivedRightsDigest = record.rights?.productionArchiveDigest;
  let rootRights;
  if (archivedRightsDigest) {
    assert.ok(record.state.production, 'archived production license without production');
    rootRights = record.rights.root;
    licensing.bind(record.root, rootRights, archivedRightsDigest);
    if (rootRights.legalCopies) licensing.copies(publicDir, record.root, rootRights);
  } else {
    rootRights = stagingPackage.publicationRights(
      publicDir,
      record.root,
      record.rights?.root ?? undefined
    );
    if (rootRights)
      licensing.publication(
        record.root,
        rootRights,
        record.state.production ? 'production' : 'staging'
      );
  }
  if (stagingRights || rootRights || Object.hasOwn(record, 'rights')) {
    assert.deepEqual(
      Object.keys(record.rights).sort(),
      archivedRightsDigest ? ['productionArchiveDigest', 'root', 'staging'] : ['root', 'staging']
    );
    assert.deepEqual(
      record.state.licensing,
      {
        staging: stagingRights?.inventoryDigest || null,
        root: rootRights?.inventoryDigest || null,
      },
      'Pages publication license receipt differs'
    );
  } else {
    assert.equal(Object.hasOwn(record.state, 'licensing'), false, 'unbound Pages license receipt');
  }
  const state = JSON.parse(fs.readFileSync(path.join(publicDir, '_delivery/state.json')));
  assert.deepEqual(state, record.state);
  if (!record.root.files['404.html'])
    assert.equal(fs.readFileSync(path.join(publicDir, '404.html'), 'utf8'), notFoundFor(prefix));
  return true;
}

function build(
  stagingDirectory,
  output,
  productionDirectory = null,
  productionTag = null,
  publication = null,
  deploymentPath = '/',
  options = {}
) {
  const prefix = basePath(deploymentPath);
  const staging = stagingDirectory ? read(stagingDirectory) : null;
  if (staging) checkStaging(stagingDirectory, staging);
  else {
    assert.ok(productionDirectory, 'production-only Pages needs production input');
    assert.match(
      options.productionRightsDigest || '',
      /^[a-f0-9]{64}$/,
      'production-only Pages needs archived rights'
    );
  }
  const production = productionDirectory ? read(productionDirectory) : null;
  const stagingRights = staging ? readRights(stagingDirectory, staging) : null;
  const rootRights = production
    ? readRights(productionDirectory, production, options.productionRightsDigest)
    : stagingRights;
  if (production) {
    assert.equal(prefix, '/', 'production Pages requires origin root');
    assert.equal(production.edition?.id || 'production', 'production');
    assert.notEqual(
      production.components.preview,
      true,
      'candidate preview cannot occupy production root'
    );
    require('../release/archive.cjs').tag(productionTag);
  } else {
    assert.equal(productionTag, null, 'production tag without an admitted artifact');
  }
  fs.mkdirSync(output, { recursive: true });
  assert.equal(fs.readdirSync(output).length, 0, 'Pages output must be empty');
  const target = path.join(output, 'public');
  copy(productionDirectory || stagingDirectory, target, production || staging);
  if (staging) copy(stagingDirectory, path.join(target, 'staging'), staging);
  const state = {
    schema: 1,
    basePath: prefix,
    production: production
      ? {
          tag: productionTag,
          sourceCommit: production.sourceCommit,
          publicDigest: production.artifactDigest,
        }
      : null,
    staging: staging
      ? {
          sourceCommit: staging.sourceCommit,
          publicDigest: staging.artifactDigest,
        }
      : null,
    publication,
    ...(stagingRights || rootRights
      ? {
          licensing: {
            staging: stagingRights?.inventoryDigest || null,
            root: rootRights?.inventoryDigest || null,
          },
        }
      : {}),
  };
  fs.mkdirSync(path.join(target, '_delivery'), { recursive: true });
  fs.writeFileSync(
    path.join(target, '_delivery/state.json'),
    JSON.stringify(state, null, 2) + '\n'
  );
  if (!(production || staging).files['404.html'])
    fs.writeFileSync(path.join(target, '404.html'), notFoundFor(prefix));
  const manifest = artifact.manifest(target);
  const record = {
    schema: 1,
    kind: 'pages-package',
    root: production || staging,
    staging,
    state,
    files: manifest.files,
    packageDigest: manifest.artifactDigest,
    ...(stagingRights || rootRights
      ? {
          rights: {
            staging: stagingRights,
            root: rootRights,
            ...(options.productionRightsDigest
              ? { productionArchiveDigest: options.productionRightsDigest }
              : {}),
          },
        }
      : {}),
  };
  verify(output, record);
  fs.writeFileSync(path.join(output, 'pages-package.json'), JSON.stringify(record, null, 2) + '\n');
  return record;
}

if (require.main === module) {
  const [mode, staging, output, production, productionTag] = process.argv.slice(2);
  if (mode === 'build') build(staging, output, production || null, productionTag || null);
  else if (mode === 'verify')
    verify(staging, JSON.parse(fs.readFileSync(path.join(staging, 'pages-package.json'))));
  else throw Error('Usage: package.cjs build STAGING OUTPUT [PRODUCTION TAG] | verify OUTPUT');
}
module.exports = {
  basePath,
  read,
  checkStaging,
  subtree,
  build,
  verify,
  notFound,
  notFoundFor,
};
