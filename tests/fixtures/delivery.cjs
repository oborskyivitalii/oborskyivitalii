'use strict';
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path');
const artifact = require('../../tools/quality/artifact.cjs');
const snapshot = require('../../tools/site/snapshot.cjs');
const motion = require('../../tools/quality/color-motion-contract.cjs');
const docs = path.resolve(__dirname, '../../docs');
let publicSeed;
const stagingSeeds = new Map();

function sourceSeed() {
  // Read actual paths and bytes every call; only identical inputs reuse gzip work.
  const files = artifact.entries(docs);
  const hashes = Object.fromEntries(files.map(({ path, bytes }) => [path, artifact.digest(bytes)]));
  const identity = JSON.stringify({ directory: fs.realpathSync(docs), hashes });
  if (publicSeed?.identity !== identity || publicSeed.producer !== artifact.manifest) {
    const manifest = artifact.manifest(docs);
    assert.deepEqual(
      Object.fromEntries(Object.entries(manifest.files).map(([name, info]) => [name, info.sha256])),
      hashes,
      'public fixture input changed during preparation'
    );
    publicSeed = {
      identity,
      files,
      manifest: JSON.stringify(manifest),
      producer: artifact.manifest,
    };
  }
  return publicSeed;
}

function copyFiles(directory, files) {
  fs.rmSync(directory, { recursive: true, force: true });
  for (const { path: name, bytes } of files) {
    const file = path.join(directory, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
}

function copySource(parent, name, commit, seed) {
  const directory = path.join(parent, name);
  copyFiles(path.join(directory, 'public'), seed.files);
  const record = {
    schema: 1,
    sourceDirty: false,
    sourceCommit: commit,
    candidateCommit: commit,
    sourceTree: 'b'.repeat(40),
    ...JSON.parse(seed.manifest),
  };
  record.components = snapshot.verify(path.join(directory, 'public'), record);
  fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(record, null, 2) + '\n');
  return { directory, record };
}
function source(parent, name, commit = 'a'.repeat(40)) {
  return copySource(parent, name, commit, sourceSeed());
}
function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'author-delivery-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}
function staging(parent, color = false) {
  const seed = sourceSeed();
  const colorBuild = require('../../tools/staging/color.cjs').build;
  const editionBuild = require('../../tools/staging/edition.cjs').build;
  const inputs = [
    'tools/staging/color.cjs',
    'tools/staging/edition.cjs',
    'tools/site/edition.cjs',
    'tools/site/effects.cjs',
    'tools/site/analytics.cjs',
  ].map((name) => artifact.digest(fs.readFileSync(path.resolve(__dirname, '../..', name))));
  const effects = artifact.entries(path.resolve(__dirname, '../../site/effects'));
  const identity = JSON.stringify([
    seed.identity,
    inputs,
    effects.map(({ path, bytes }) => [path, artifact.digest(bytes)]),
  ]);
  const key = color ? 'color' : 'base';
  const prepared = stagingSeeds.get(key);
  let result;
  if (
    prepared?.identity === identity &&
    prepared.colorBuild === colorBuild &&
    prepared.editionBuild === editionBuild
  ) {
    result = { directory: path.join(parent, 'staging'), record: JSON.parse(prepared.record) };
    copyFiles(result.directory, prepared.files);
  } else {
    result = copySource(parent, 'staging', 'a'.repeat(40), seed);
    if (color) colorBuild(result.directory);
    result.record = editionBuild(result.directory);
  }
  result.record.components = snapshot.verify(path.join(result.directory, 'public'), result.record);
  if (color) motion.select(result.record);
  else assert.equal(require('../../tools/quality/common.cjs').variant(result.record).id, 'base');
  fs.writeFileSync(
    path.join(result.directory, 'artifact.json'),
    JSON.stringify(result.record, null, 2) + '\n'
  );
  if (
    prepared?.identity !== identity ||
    prepared.colorBuild !== colorBuild ||
    prepared.editionBuild !== editionBuild
  )
    stagingSeeds.set(key, {
      identity,
      colorBuild,
      editionBuild,
      record: JSON.stringify(result.record),
      files: artifact.entries(result.directory),
    });
  rightsInventory(result, true);
  return result;
}

function production(parent, name = 'production', commit) {
  const result = source(parent, name, commit);
  result.record = require('../../tools/release/edition.cjs').build(result.directory);
  rightsInventory(result, true);
  return result;
}
function response(url, bytes, status = 200) {
  return {
    url,
    status,
    headers: new Headers({
      'content-type': require('../../tools/quality/serve.cjs').canonicalType(
        status === 404 ? '404.html' : new URL(url).pathname
      ),
    }),
    arrayBuffer: async () => Buffer.from(bytes),
  };
}
function rightsInventory(source, confirmed = false) {
  const sourceRoot = source.directory + '-rights-source';
  for (const name of [
    'site',
    'README.md',
    'CONTRIBUTING.md',
    'guides/SITE-SOURCE-AUDIT.md',
    'guides/SITE-CONTENT-REVIEW.md',
    'tools/site',
    'tools/release/edition.cjs',
    'tools/RI-LICENSE.md',
    'tools/RI-NOTICE.md',
    'review/assets/vitalii-oborskyi-cutout-20261002.png',
    ...Object.values(require('../../tools/site/legal.cjs').sources),
  ]) {
    const target = path.join(sourceRoot, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(path.join(__dirname, '../..', name), target, { recursive: true });
  }
  if (!confirmed) {
    const file = path.join(sourceRoot, 'site/rights.json');
    const manifest = JSON.parse(fs.readFileSync(file));
    manifest.policy.status = 'pending-maintainer-decision';
    manifest.policy.decision = null;
    fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
  }
  const report = require('../../tools/release/rights.cjs').compile(
    path.join(source.directory, 'public'),
    source.record,
    { sourceRoot }
  );
  fs.writeFileSync(
    path.join(source.directory, 'rights.json'),
    JSON.stringify(report, null, 2) + '\n'
  );
  return { sourceRoot, report };
}

function fullProof(record, rightsReport = null) {
  const identity = {
    schema: 1,
    pass: true,
    variant: require('../../tools/quality/common.cjs').variant(record),
  };
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'])
    identity[key] = record[key];
  const external = {
    ...identity,
    independentReview: { pass: true, reviewer: 'fixture reviewer', record: 'fixture review' },
    rights: {
      pass: true,
      reviewer: 'fixture owner',
      record: 'fixture publication decision',
      ...(rightsReport ? { inventoryDigest: rightsReport.inventoryDigest } : {}),
    },
  };
  for (const key of ['iosSafari', 'androidChrome'])
    external[key] = {
      pass: true,
      reviewer: 'fixture reviewer',
      record: 'fixture observation',
      device: 'fixture device',
      os: 'fixture OS',
      browser: 'fixture browser',
    };
  return {
    gate: {
      ...identity,
      kind: 'hosted-gate',
      profile: 'staging',
      hostedOrigin: 'https://candidate.invalid',
      githubArtifact: { id: '41', uploadDigest: 'sha256:' + 'c'.repeat(64) },
      jobs: Object.fromEntries(
        ['build', 'static', 'linux', 'native', 'performance', 'captures', 'host'].map((name) => [
          name,
          { result: 'success' },
        ])
      ),
    },
    external,
  };
}
module.exports = { source, staging, production, temporary, response, rightsInventory, fullProof };
