'use strict';
// Current fixtures compile authored rights; pinned historical records stay frozen.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const delivery = require('./delivery.cjs');
const artifact = require('../../tools/quality/artifact.cjs');
const snapshot = require('../../tools/site/snapshot.cjs');
const motion = require('../../tools/quality/color-motion-contract.cjs');
const frozen = require('../../tools/release/rights-record.cjs');
const root = path.resolve(__dirname, '../..');
const baseline = 'cc115c4241197d59205934bdc18f209109d5ee87';

function digest(report) {
  const body = { ...report };
  delete body.inventoryDigest;
  report.inventoryDigest = artifact.digest(JSON.stringify(body));
  return report;
}

function save(source) {
  source.expected = {
    sourceCommit: source.record.sourceCommit,
    publicDigest: source.record.artifactDigest,
    artifactId: '123',
    uploadDigest: 'sha256:' + 'c'.repeat(64),
  };
  fs.writeFileSync(path.join(source.directory, 'artifact.json'), JSON.stringify(source.record));
  fs.writeFileSync(path.join(source.directory, 'rights.json'), JSON.stringify(source.report));
  fs.mkdirSync(path.join(source.directory, 'gate'), { recursive: true });
  fs.writeFileSync(
    path.join(source.directory, 'gate/release-manifest.json'),
    JSON.stringify({
      ...source.record,
      schema: 1,
      kind: 'pr-gate',
      profile: 'local',
      pass: true,
      jobs: { build: { result: 'success' } },
      githubArtifact: {
        id: source.expected.artifactId,
        uploadDigest: source.expected.uploadDigest,
      },
    })
  );
}

function historicalSources(parent) {
  const checkout = path.join(parent, 'pinned-main');
  if (fs.existsSync(path.join(checkout, 'docs/site-revision.json'))) return checkout;
  const inventory = cp
    .execFileSync('git', ['ls-tree', '-rz', baseline, '--', 'docs', 'site', 'tools'], { cwd: root })
    .toString()
    .split('\0')
    .filter(Boolean)
    .map((entry) => {
      const [metadata, name] = entry.split('\t');
      const [mode, kind, object] = metadata.split(' ');
      assert.equal(mode, '100644');
      assert.equal(kind, 'blob');
      assert.match(object, /^[a-f0-9]{40}$/);
      assert.match(name, /^(?:docs|site|tools)\//);
      assert.ok(!name.split('/').some((part) => part === '.' || part === '..'));
      return { name, object };
    });
  const bytes = cp.execFileSync('git', ['cat-file', '--batch'], {
    cwd: root,
    input: inventory.map((entry) => entry.object + '\n').join(''),
    maxBuffer: 64 * 1024 * 1024,
  });
  let offset = 0;
  for (const entry of inventory) {
    const newline = bytes.indexOf(10, offset);
    const [object, kind, length] = bytes.subarray(offset, newline).toString().split(' ');
    const size = Number(length);
    assert.equal(object, entry.object);
    assert.equal(kind, 'blob');
    assert.ok(Number.isInteger(size) && size >= 0);
    offset = newline + 1;
    assert.ok(offset + size < bytes.length);
    assert.equal(bytes[offset + size], 10);
    const file = path.join(checkout, entry.name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes.subarray(offset, offset + size));
    offset += size + 1;
  }
  assert.equal(offset, bytes.length);
  return checkout;
}

function historical(parent, name = 'historical', { staging = false, color = false } = {}) {
  const checkout = historicalSources(parent);
  const directory = path.join(parent, name);
  fs.cpSync(path.join(checkout, 'docs'), path.join(directory, 'public'), { recursive: true });
  const record = {
    schema: 1,
    sourceDirty: false,
    sourceCommit: baseline,
    candidateCommit: baseline,
    sourceTree: cp
      .execFileSync('git', ['rev-parse', baseline + '^{tree}'], { cwd: root })
      .toString()
      .trim(),
    ...artifact.manifest(path.join(directory, 'public')),
  };
  record.components = snapshot.verify(path.join(directory, 'public'), record);
  const source = { directory, record, baselineRoot: checkout };
  fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(record));
  if (color)
    source.record = require(path.join(checkout, 'tools/staging/color.cjs')).build(directory);
  if (staging)
    source.record = require(path.join(checkout, 'tools/staging/edition.cjs')).build(directory);
  return source;
}

function fixture(parent, modern = true, staging = true) {
  if (modern) {
    const source = staging ? delivery.staging(parent, true) : delivery.source(parent, 'plain');
    if (!staging) {
      source.record = require('../../tools/staging/color.cjs').build(source.directory);
      source.report = delivery.rightsInventory(source, true).report;
    } else source.report = JSON.parse(fs.readFileSync(path.join(source.directory, 'rights.json')));
    assert.equal(
      motion.select(source.record).id,
      'issue5-reader-fast-media-' + (staging ? 'staging' : 'plain')
    );
    save(source);
    return source;
  }
  const source = historical(parent, staging ? 'staging' : 'plain', { staging });
  const publicDirectory = path.join(source.directory, 'public');
  const revisionFile = path.join(publicDirectory, 'site-revision.json');
  const revision = JSON.parse(fs.readFileSync(revisionFile));
  const texts = Object.fromEntries(
    Object.keys(frozen.legalSources).map((id) => [
      id,
      'Controlled fixture ' + id + ' legal text with <escaped> & complete bytes.\n',
    ])
  );
  const escape = (text) =>
    text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const copies = Object.entries(texts)
    .map(
      ([id, text]) =>
        '<details id="license-' +
        id +
        '"><summary>Fixture</summary><pre><code>' +
        escape(text) +
        '</code></pre></details>'
    )
    .join('\n');
  for (const name of ['credits.html', revision.routes.credits.url]) {
    const file = path.join(publicDirectory, name);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('</body>', copies + '\n</body>'));
  }
  for (const id of snapshot.routes) {
    revision.routes[id].sha256 = artifact.digest(
      fs.readFileSync(path.join(publicDirectory, revision.routes[id].url))
    );
  }
  fs.writeFileSync(revisionFile, JSON.stringify(revision));
  Object.assign(source.record, artifact.manifest(publicDirectory));
  source.record.components = snapshot.verify(publicDirectory, source.record);
  const licenses = {
    'original-code': 'Apache-2.0',
    'original-text': 'CC-BY-4.0',
    'original-nonbrand-diagrams': 'CC-BY-4.0',
  };
  source.report = digest({
    schema: 1,
    kind: 'release-rights',
    inventoryPass: true,
    approvalPass: false,
    ...Object.fromEntries(
      ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'].map((key) => [
        key,
        source.record[key],
      ])
    ),
    edition: source.record.edition || null,
    files: source.record.files,
    policy: {
      status: 'confirmed-by-maintainer',
      scope: Object.keys(licenses),
      decision: {
        reviewer: 'fixture reviewer',
        record: 'fixture policy decision',
        decidedAt: '2026-10-15',
        selection: 'explicit-licenses',
        licenses,
      },
    },
    bases: {
      'original-code': { license: 'Apache-2.0' },
      'original-text': { license: 'CC-BY-4.0' },
      'original-diagram': { license: 'CC-BY-4.0' },
      'identity-branding': {},
      'portrait-source': {},
      'portrait-derivative': {},
    },
    legalCopies: Object.fromEntries(
      Object.entries(frozen.legalSources).map(([id, name]) => [
        id,
        {
          source: name,
          anchor: 'license-' + id,
          sha256: artifact.digest(texts[id]),
        },
      ])
    ),
    notices: Object.entries(frozen.legalSources).map(([id, name]) => ({
      path: name,
      sha256: artifact.digest(texts[id]),
    })),
    publicNotices: ['credits.html', revision.routes.credits.url],
    materials: {
      scope: 'linked-metadata-only',
      hostedEditions: [],
      linkedEditionCount: 0,
    },
    linkedPublications: {},
  });
  save(source);
  return source;
}

module.exports = { fixture, historical, digest, save };
