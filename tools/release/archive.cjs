'use strict';
// Immutable tags/packages identify releases; labels are only browsing aids.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');

function tag(value) {
  assert.match(value, /^prod-\d{4}-\d{2}-\d{2}\.[1-9]\d*$/);
  return value;
}

function candidate(publicRecord, gate, evidence) {
  assert.equal(publicRecord.sourceDirty, false);
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit'])
    assert.match(publicRecord[key], /^[a-f0-9]{40}$/);
  assert.equal(publicRecord.sourceCommit, publicRecord.candidateCommit);
  assert.equal(
    publicRecord.edition?.id || 'production',
    'production',
    'staging edition cannot be released'
  );
  require('../quality/promotion.cjs').validate(publicRecord, gate, evidence, {});
  return true;
}

function create(publicRecord, gate, evidence, options) {
  candidate(publicRecord, gate, evidence);
  tag(options.tag);
  assert.match(
    options.runURL,
    /^https:\/\/github\.com\/oborskyivitalii\/oborskyivitalii\/actions\/runs\/[1-9]\d*$/
  );
  assert.match(options.packageDigest, /^[a-f0-9]{64}$/);
  assert.ok(Number.isFinite(Date.parse(options.createdAt)));
  if (options.previousTag !== null) tag(options.previousTag);
  return {
    schema: 1,
    kind: 'production-archive',
    tag: options.tag,
    sourceCommit: publicRecord.sourceCommit,
    sourceTree: publicRecord.sourceTree,
    publicDigest: publicRecord.artifactDigest,
    packageDigest: options.packageDigest,
    createdAt: options.createdAt,
    validationRun: options.runURL,
    previousTag: options.previousTag,
    public: publicRecord,
    gate,
    evidence,
  };
}

function verify(directory, record, packageBytes) {
  assert.equal(record.schema, 1);
  assert.equal(record.kind, 'production-archive');
  tag(record.tag);
  candidate(record.public, record.gate, record.evidence);
  assert.equal(record.sourceCommit, record.public.sourceCommit);
  assert.equal(record.sourceTree, record.public.sourceTree);
  assert.equal(record.publicDigest, record.public.artifactDigest);
  assert.equal(artifact.digest(packageBytes), record.packageDigest, 'archived package changed');
  artifact.verify(path.join(directory, 'public'), record.public, record.publicDigest);
  return true;
}

function transition(current, release, observation) {
  assert.equal(observation.pass, true, 'failed live verification cannot change active production');
  assert.equal(observation.publicDigest, release.publicDigest);
  assert.equal(observation.sourceCommit, release.sourceCommit);
  assert.ok(observation.deploymentURL?.startsWith('https://'));
  tag(release.tag);
  const archived = new Set(current?.archived || []);
  if (current?.active && current.active.tag !== release.tag) archived.add(current.active.tag);
  archived.delete(release.tag);
  return {
    schema: 1,
    active: {
      tag: release.tag,
      sourceCommit: release.sourceCommit,
      publicDigest: release.publicDigest,
      deploymentURL: observation.deploymentURL,
    },
    archived: [...archived].sort(),
  };
}

function immutable(existing, desired) {
  tag(desired.tag);
  if (!existing) return true;
  assert.equal(existing.tag, desired.tag, 'existing archive lookup must match the requested tag');
  assert.equal(
    existing.sourceCommit,
    desired.sourceCommit,
    'release tag already belongs to another source'
  );
  assert.equal(existing.publicDigest, desired.publicDigest, 'release bytes cannot be replaced');
  assert.equal(
    existing.packageDigest,
    desired.packageDigest,
    'archived package cannot be replaced'
  );
  return true;
}

if (require.main === module) {
  const [mode, directory, recordFile, packageFile] = process.argv.slice(2);
  if (mode !== 'verify')
    throw Error('Usage: archive.cjs verify SOURCE ARCHIVE_JSON PACKAGE_TAR_GZ');
  verify(directory, JSON.parse(fs.readFileSync(recordFile)), fs.readFileSync(packageFile));
}

module.exports = { tag, candidate, create, verify, transition, immutable };
