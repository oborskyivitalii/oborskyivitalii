'use strict';
// Reuse host-independent guards only within their native workflow run/attempt.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('./artifact.cjs');
const full = require('./validate.cjs');
const scannerKinds = ['lint', 'security', 'advisories'];

function checkIds(level) {
  assert.ok(['staging', 'production'].includes(level));
  return [
    'clean-source',
    ...(level === 'staging' ? ['basic'] : []),
    'source-tests',
    'python-tests',
    'code-style',
    'ri',
    'ri-ci',
    'format',
    'architecture',
    'generated',
    'seo',
    'fallbacks',
    'previews',
    'bundle',
    'artifact',
    'artifact-source',
    'sizes',
    'edition-rights',
    ...scannerKinds,
    'selftest',
    'package-proof',
    'package',
    'artifact-unchanged',
    'unchanged-source',
  ];
}

function capture(directory, reportFile) {
  return Object.fromEntries(
    artifact
      .entries(directory)
      .filter((entry) => path.resolve(directory, entry.path) !== path.resolve(reportFile))
      .map((entry) => [entry.path, artifact.digest(entry.bytes)])
  );
}

function execution(runId, attempt) {
  for (const value of [runId, attempt]) assert.match(String(value), /^[1-9]\d*$/);
  return { runId: String(runId), attempt: String(attempt) };
}

async function authenticate(github, context, id, uploadDigest, attempt) {
  assert.match(String(id), /^[1-9]\d*$/);
  const identity = execution(context.runId, attempt);
  assert.match(uploadDigest, /^(?:sha256:)?[a-f0-9]{64}$/);
  const { data } = await github.rest.actions.getArtifact({
    ...context.repo,
    artifact_id: Number(id),
  });
  assert.equal(String(data.id), String(id));
  assert.equal(data.expired, false, 'expired prepublication artifact');
  assert.equal(String(data.workflow_run.id), identity.runId, 'different prepublication run');
  const heads = [context.sha];
  if (context.eventName === 'pull_request') heads.push(context.payload.pull_request.head.sha);
  assert.ok(heads.includes(data.workflow_run.head_sha), 'different prepublication controller');
  assert.equal(
    data.name,
    'site-prepublication-staging-' + identity.runId + '-' + identity.attempt,
    'different prepublication attempt/name'
  );
  assert.equal(data.digest, 'sha256:' + uploadDigest.replace(/^sha256:/, ''));
  return identity;
}

function validate(report, manifestBytes, directory, expected) {
  const manifest = JSON.parse(manifestBytes);
  assert.equal(report.schema, 1);
  assert.equal(report.kind, 'prepublication-preflight');
  assert.equal(report.validationLevel, 'staging', 'only staging reports are reusable');
  assert.equal(report.pass, true, 'failed prepublication');
  assert.equal(report.sourceDirty, false);
  assert.equal(manifest.sourceDirty, false);
  assert.deepEqual(report.execution, execution(expected.runId, expected.attempt));
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'])
    assert.equal(report[key], manifest[key], 'prepublication ' + key + ' differs');
  assert.equal(report.sourceCommit, expected.sourceCommit);
  assert.equal(report.sourceTree, expected.sourceTree);
  assert.equal(report.candidateCommit, report.sourceCommit);
  assert.equal(report.artifactDigest, expected.artifactDigest);
  assert.equal(report.artifactManifestDigest, artifact.digest(manifestBytes));
  assert.deepEqual(report.edition, manifest.edition || null);
  for (const key of ['fullGate', 'productionEligible', 'deploymentAuthorized'])
    assert.equal(report[key], false);
  assert.deepEqual(
    report.checks.map((row) => row.id),
    checkIds('staging')
  );
  for (const row of report.checks) {
    assert.equal(row.pass, true, 'failed prepublication guard ' + row.id);
    assert.equal(row.status, 'passed', 'incomplete prepublication guard ' + row.id);
    if (row.command) {
      assert.equal(row.exitCode, 0);
      assert.equal(row.signal, null);
      for (const key of ['stdout', 'stderr'])
        assert.ok(Object.hasOwn(report.files, path.basename(row[key])), 'missing guard stream');
    } else assert.ok(['clean-source', 'unchanged-source'].includes(row.id));
  }
  assert.ok(report.files && Object.keys(report.files).length > 0);
  for (const [name, digest] of Object.entries(report.files)) {
    assert.equal(path.basename(name), name, 'unsafe prepublication file');
    assert.ok(name !== '.' && name !== '..' && !name.includes('\\'));
    assert.match(digest, /^[a-f0-9]{64}$/);
    const file = path.join(directory, name);
    assert.equal(fs.lstatSync(file).isFile(), true, 'invalid prepublication file');
    assert.equal(artifact.digest(fs.readFileSync(file)), digest, 'changed prepublication file');
  }
  for (const kind of scannerKinds) {
    assert.ok(Object.hasOwn(report.files, kind + '.json'), 'missing scanner report');
    const scanner = JSON.parse(fs.readFileSync(path.join(directory, kind + '.json')));
    assert.equal(scanner.kind, kind);
    full.sourceReport(scanner, manifest);
    full.scanner(scanner);
    assert.equal(scanner.target, null, 'reused scanner must remain host-independent');
    assert.equal(String(scanner.environment.runId), String(expected.runId));
    assert.equal(String(scanner.environment.attempt), String(expected.attempt));
  }
  return true;
}

function reuse(directory, artifactDirectory, destination, expected) {
  const report = JSON.parse(fs.readFileSync(path.join(directory, 'prepublication.json')));
  const manifestBytes = fs.readFileSync(path.join(artifactDirectory, 'artifact.json'));
  validate(report, manifestBytes, directory, expected);
  artifact.verify(path.join(artifactDirectory, 'public'), JSON.parse(manifestBytes));
  fs.mkdirSync(destination, { recursive: true });
  for (const kind of scannerKinds)
    fs.copyFileSync(path.join(directory, kind + '.json'), path.join(destination, kind + '.json'));
  return report;
}

if (require.main === module) {
  const [directory, artifactDirectory, destination] = process.argv.slice(2);
  assert.ok(directory && artifactDirectory && destination);
  const cp = require('node:child_process');
  reuse(directory, artifactDirectory, destination, {
    ...execution(process.env.GITHUB_RUN_ID, process.env.GITHUB_RUN_ATTEMPT),
    sourceCommit: process.env.SITE_CANDIDATE_SHA,
    sourceTree: cp.execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim(),
    artifactDigest: process.env.SITE_EXPECTED_PUBLIC_DIGEST,
  });
}

module.exports = { checkIds, capture, execution, authenticate, validate, reuse };
