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
  return result;
}
function response(url, bytes, status = 200) {
  return { url, status, arrayBuffer: async () => Buffer.from(bytes) };
}
function fullProof(record) {
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
    rights: { pass: true, reviewer: 'fixture owner', record: 'fixture publication decision' },
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
module.exports = { source, staging, temporary, response, fullProof };
