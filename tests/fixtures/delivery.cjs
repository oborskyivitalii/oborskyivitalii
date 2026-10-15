'use strict';
const fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path');
const artifact = require('../../tools/quality/artifact.cjs');
function source(parent, name, commit = 'a'.repeat(40)) {
  const directory = path.join(parent, name);
  fs.cpSync(path.join(__dirname, '../../docs'), path.join(directory, 'public'), {
    recursive: true,
  });
  const record = {
    schema: 1,
    sourceDirty: false,
    sourceCommit: commit,
    candidateCommit: commit,
    sourceTree: 'b'.repeat(40),
    ...artifact.manifest(path.join(directory, 'public')),
  };
  record.components = require('../../tools/site/snapshot.cjs').verify(
    path.join(directory, 'public'),
    record
  );
  fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(record, null, 2) + '\n');
  return { directory, record };
}
function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'author-delivery-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}
function staging(parent, color = false) {
  const result = source(parent, 'staging');
  if (color) require('../../tools/staging/color.cjs').build(result.directory);
  result.record = require('../../tools/staging/edition.cjs').build(result.directory);
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
