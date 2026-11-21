'use strict';
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path');
const artifact = require('../../tools/quality/artifact.cjs');
const snapshot = require('../../tools/site/snapshot.cjs');
const motion = require('../../tools/quality/color-motion-contract.cjs');
const root = path.resolve(__dirname, '../..');
const releasedRevision = 'b7b95a1cfb75a5dc9cd55ca85f3ea375ab2c500a';
const publicSeeds = new Map();
let historicalRoot;

function releasedSourceRoot() {
  if (historicalRoot) return historicalRoot;
  const { execFileSync } = require('node:child_process');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'released-delivery-seed-'));
  process.once('exit', () => fs.rmSync(temporary, { recursive: true, force: true }));
  execFileSync('git', ['clone', '--shared', '--no-checkout', '--quiet', root, temporary]);
  // The archived source must own its actual history tip, not the caller's newer editions.
  execFileSync('git', ['update-ref', '--no-deref', 'HEAD', releasedRevision], { cwd: temporary });
  const archive = path.join(temporary, 'source.tar');
  execFileSync(
    'git',
    [
      'archive',
      '--output=' + archive,
      releasedRevision,
      'docs',
      'site',
      'tools/site',
      'tools/quality',
      'tools/release',
      'tools/publishing',
      'tools/staging',
      'tools/pages',
      'tools/RI-LICENSE.md',
      'tools/RI-NOTICE.md',
      'README.md',
      'CONTRIBUTING.md',
      'guides/SITE-SOURCE-AUDIT.md',
      'guides/SITE-CONTENT-REVIEW.md',
      'review/assets/vitalii-oborskyi-cutout-20261002.png',
      ...Object.values(require('../../tools/site/legal.cjs').sources),
    ],
    { cwd: root }
  );
  execFileSync('tar', ['-xf', archive, '-C', temporary]);
  fs.rmSync(archive);
  const modules = 'tools/publishing/toolchain/node_modules';
  if (fs.existsSync(path.join(root, modules)))
    fs.symlinkSync(path.join(root, modules), path.join(temporary, modules), 'junction');
  historicalRoot = temporary;
  return historicalRoot;
}
const stagingSeeds = new Map();
const productionSeeds = new Map();

function mediaEnvironment(outer = process.env) {
  // Relocated fixtures have no venv. Use the source checkout's pinned encoder.
  const python = path.join(root, 'tools/quality/toolchain/venv/bin/python');
  return {
    ...outer,
    SITE_MEDIA_PYTHON: outer.SITE_MEDIA_PYTHON || (fs.existsSync(python) ? python : 'python3'),
  };
}

function sourceSeed(authoredRoot) {
  const docs = path.join(authoredRoot, 'docs');
  let publicSeed = publicSeeds.get(authoredRoot);
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
      authoredRoot,
    };
    publicSeeds.set(authoredRoot, publicSeed);
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
  return { directory, record, authoredRoot: seed.authoredRoot };
}
function source(parent, name, commit = 'a'.repeat(40), authoredRoot = root) {
  return copySource(parent, name, commit, sourceSeed(authoredRoot));
}
function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'author-delivery-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}
function staging(parent, color = false, authoredRoot = root) {
  const seed = sourceSeed(authoredRoot);
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
    result = {
      directory: path.join(parent, 'staging'),
      record: JSON.parse(prepared.record),
      authoredRoot,
    };
    copyFiles(result.directory, prepared.files);
  } else {
    result = copySource(parent, 'staging', 'a'.repeat(40), seed);
    if (color) colorBuild(result.directory, { sourceRoot: authoredRoot });
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

function production(parent, name = 'production', commit = 'a'.repeat(40)) {
  const authoredRoot = releasedSourceRoot();
  const seed = sourceSeed(authoredRoot);
  const build = require('../../tools/release/edition.cjs').build;
  const retention = artifact.digest(
    fs.readFileSync(path.join(authoredRoot, 'site/retained/manifest.json'))
  );
  const expectedPublicDigest = process.env.SITE_EXPECTED_PUBLIC_DIGEST;
  const prepared = productionSeeds.get(commit);
  let result;
  if (
    prepared?.seed === seed &&
    prepared.build === build &&
    prepared.retention === retention &&
    prepared.expectedPublicDigest === expectedPublicDigest
  ) {
    const directory = path.join(parent, name);
    copyFiles(path.join(directory, 'public'), prepared.files);
    fs.writeFileSync(path.join(directory, 'artifact.json'), prepared.record);
    fs.writeFileSync(path.join(directory, 'sizes.json'), prepared.sizes);
    result = { directory, record: JSON.parse(prepared.record), authoredRoot };
  } else {
    result = copySource(parent, name, commit, seed);
    result.record = build(result.directory, 'base', { sourceRoot: authoredRoot });
    productionSeeds.set(commit, {
      seed,
      build,
      retention,
      expectedPublicDigest,
      record: fs.readFileSync(path.join(result.directory, 'artifact.json'), 'utf8'),
      sizes: fs.readFileSync(path.join(result.directory, 'sizes.json')),
      files: artifact.entries(path.join(result.directory, 'public')),
    });
  }
  // Rights still compile against each caller's freshly materialized public and authored files.
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
  if (!fs.existsSync(path.join(sourceRoot, '.git'))) {
    require('node:child_process').execFileSync('git', [
      'clone',
      '--shared',
      '--no-checkout',
      '--quiet',
      source.authoredRoot || root,
      sourceRoot,
    ]);
  }
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
    fs.cpSync(path.join(source.authoredRoot || root, name), target, { recursive: true });
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
module.exports = {
  source,
  staging,
  production,
  temporary,
  response,
  rightsInventory,
  fullProof,
  releasedSourceRoot,
  mediaEnvironment,
};
