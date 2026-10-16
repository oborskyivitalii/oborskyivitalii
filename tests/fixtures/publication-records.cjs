'use strict';
// Synthetic publication metadata exercises consumers, not actual rights approval.
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
let baselineFiles;
let baselineReading;
// Only immutable prepared bytes survive between cases; callers receive fresh files and objects.
const preparedSources = new Map();
const legalCSS =
  '\n/* Full legal copies remain readable when expanded on narrow screens. */\n' +
  '.legal-notices pre {\n  max-inline-size: 100%;\n  white-space: pre-wrap;\n' +
  '  overflow-wrap: anywhere;\n}\n';

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

function licensedSource(parent, staging) {
  if (!baselineFiles) {
    const names = cp
      .execFileSync('git', ['ls-tree', '-r', '--name-only', baseline, '--', 'docs'], {
        cwd: root,
        encoding: 'utf8',
      })
      .trim()
      .split('\n');
    baselineFiles = names.map((name) => {
      assert.ok(name.startsWith('docs/'), 'frozen fixture stays in the public tree');
      return [
        name.slice(5),
        cp.execFileSync('git', ['show', baseline + ':' + name], {
          cwd: root,
          maxBuffer: 8_000_000,
        }),
      ];
    });
    baselineReading =
      '\n' +
      cp.execFileSync('git', ['show', baseline + ':site/engine/reading-surfaces.css'], {
        cwd: root,
        encoding: 'utf8',
      }) +
      '\n';
  }
  const source = delivery.source(parent, staging ? 'staging' : 'plain');
  const publicDirectory = path.join(source.directory, 'public');
  fs.rmSync(publicDirectory, { recursive: true, force: true });
  for (const [name, bytes] of baselineFiles) {
    const file = path.join(publicDirectory, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  Object.assign(source.record, artifact.manifest(publicDirectory));
  source.record.components = snapshot.verify(publicDirectory, source.record);
  fs.writeFileSync(path.join(source.directory, 'artifact.json'), JSON.stringify(source.record));
  source.record = require('../../tools/staging/color.cjs').build(source.directory);
  if (staging) {
    source.record = require('../../tools/staging/edition.cjs').build(source.directory);
  }
  return source;
}

function copyPrepared(parent, staging) {
  const name = staging ? 'staging' : 'plain';
  const prepared = preparedSources.get(name);
  if (!prepared) return null;
  const source = {
    directory: path.join(parent, name),
    record: JSON.parse(prepared.record),
    report: JSON.parse(prepared.report),
  };
  const publicDirectory = path.join(source.directory, 'public');
  fs.rmSync(publicDirectory, { recursive: true, force: true });
  for (const [name, bytes] of prepared.files) {
    const file = path.join(publicDirectory, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  source.record.components = snapshot.verify(publicDirectory, source.record);
  assert.equal(motion.select(source.record).id, 'issue39-licensed-' + name);
  save(source);
  return source;
}

function fixture(parent, modern = true, staging = true) {
  if (modern) {
    const prepared = copyPrepared(parent, staging);
    if (prepared) return prepared;
  }
  const source = modern
    ? licensedSource(parent, staging)
    : staging
      ? delivery.staging(parent, false)
      : delivery.source(parent, 'plain');
  const publicDirectory = path.join(source.directory, 'public');
  const revisionFile = path.join(publicDirectory, 'site-revision.json');
  const revision = JSON.parse(fs.readFileSync(revisionFile));
  if (modern) {
    const runtime = motion.reviewedRuntime('issue39-licensed-' + (staging ? 'staging' : 'plain'));
    const oldEngine = revision.engine;
    const cssFile = path.join(publicDirectory, 'styles.css');
    const css = fs.readFileSync(cssFile, 'utf8');
    assert.equal(css.split(baselineReading).length, 2);
    fs.writeFileSync(cssFile, css.replace(baselineReading, legalCSS + baselineReading));
    fs.renameSync(
      path.join(publicDirectory, 'runtime', oldEngine),
      path.join(publicDirectory, 'runtime', runtime.variant.fingerprint)
    );
    fs.copyFileSync(
      cssFile,
      path.join(publicDirectory, 'runtime', runtime.variant.fingerprint, 'styles.css')
    );
    for (const name of Object.keys(source.record.files).filter((name) => name.endsWith('.html'))) {
      const file = path.join(publicDirectory, name);
      fs.writeFileSync(
        file,
        fs.readFileSync(file, 'utf8').replaceAll(oldEngine, runtime.variant.fingerprint)
      );
    }
    revision.engine = runtime.variant.fingerprint;
    revision.variant = runtime.variant;
    source.record.variant = runtime.variant;
  }
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
  if (modern)
    assert.equal(
      motion.select(source.record).id,
      'issue39-licensed-' + (staging ? 'staging' : 'plain')
    );
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
  if (modern)
    preparedSources.set(staging ? 'staging' : 'plain', {
      record: JSON.stringify(source.record),
      report: JSON.stringify(source.report),
      files: Object.keys(source.record.files).map((name) => [
        name,
        fs.readFileSync(path.join(publicDirectory, name)),
      ]),
    });
  return source;
}

module.exports = { fixture, digest, save };
