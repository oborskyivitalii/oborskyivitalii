'use strict';
// Production reuses accepted staging on an identical source tree; it never
// relabels staging reports as tests of the separately compiled production edition.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const staging = require('../staging/admission.cjs');
const flow = require('../staging/review-flow.cjs');
const stageGate = require('../quality/staging-gate.cjs');
const motion = require('../quality/color-motion-contract.cjs');
const policy = 'staging-then-smoke-v1';

function names(run, attempt) {
  const suffix = run + '-' + attempt;
  return {
    public: 'site-public-review-' + suffix,
    gate: 'site-gate-full-staging-' + suffix,
    reports: [
      'site-prepublication-staging-' + suffix,
      'site-prepublication-verified-staging-' + suffix,
      ...['host', 'static', 'staging'].map((name) => 'site-reports-' + name + '-staging-' + suffix),
      'site-staging-promotion-' + suffix,
    ],
  };
}

function item(record, expectedName, run) {
  flow.positive(record.id);
  assert.equal(record.name, expectedName);
  assert.equal(record.expired, false, 'staging evidence expired');
  assert.equal(record.workflow_run.id, run.id);
  assert.equal(record.workflow_run.head_sha, run.head_sha);
  assert.match(record.digest, /^sha256:[a-f0-9]{64}$/);
  return {
    id: record.id,
    name: record.name,
    digest: record.digest,
    runId: run.id,
    controller: run.head_sha,
  };
}

async function authenticate(github, context, number, source) {
  assert.equal(context.repo.owner + '/' + context.repo.repo, flow.repository);
  assert.match(source, /^[a-f0-9]{40}$/);
  const pr = (await github.rest.pulls.get({ ...context.repo, pull_number: flow.positive(number) }))
    .data;
  const merge = await staging.verifyMerge(github, context, pr);
  assert.ok([merge.testedSource, merge.mergedSource].includes(source), 'wrong staged release PR');
  const commit = (await github.rest.repos.getCommit({ ...context.repo, ref: source })).data;
  assert.equal(commit.commit.tree.sha, merge.sourceTree, 'production source differs from staging');
  const proof = await staging.stagingEvidence(github, context, pr);
  assert.equal(proof.runId, merge.stagingRun);
  assert.equal(proof.attempt, merge.attempt);
  assert.equal(proof.run.triggering_actor.login, context.repo.owner);
  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: proof.runId,
    attempt_number: proof.attempt,
    per_page: 100,
  });
  for (const name of [
    'begin-admission',
    'build',
    'publish',
    'smoke',
    'full / build',
    'full / static',
    'full / host',
    'full / staging',
    'full / gate',
    'stage-evidence',
    'promote',
    'merge-admission',
  ]) {
    const selected = jobs.filter((job) => job.name === name);
    assert.equal(selected.length, 1, 'missing/ambiguous staging job: ' + name);
    assert.equal(selected[0].status, 'completed');
    assert.equal(selected[0].conclusion, 'success', 'staging job did not pass: ' + name);
  }
  const records = await github.paginate(github.rest.actions.listWorkflowRunArtifacts, {
    ...context.repo,
    run_id: proof.runId,
    per_page: 100,
  });
  const expected = names(proof.runId, proof.attempt);
  const find = (name) => {
    const selected = records.filter((record) => record.name === name);
    assert.equal(selected.length, 1, 'missing/ambiguous staging artifact: ' + name);
    return item(selected[0], name, proof.run);
  };
  return {
    schema: 1,
    kind: 'accepted-staging-source',
    policy,
    pass: true,
    pr: pr.number,
    sourceCommit: source,
    sourceTree: merge.sourceTree,
    testedSource: merge.testedSource,
    mergedSource: merge.mergedSource,
    runId: proof.runId,
    attempt: proof.attempt,
    controller: proof.run.head_sha,
    checkpointCheck: proof.check.id,
    public: find(expected.public),
    gate: find(expected.gate),
    reports: expected.reports.map(find),
  };
}

function validate(manifest, admission, expectedArtifact = null) {
  assert.equal(admission.schema, 1);
  assert.equal(admission.kind, 'production-staging-admission');
  assert.equal(admission.policy, policy);
  assert.equal(admission.fullGate, false, 'staging must not claim the optional full suite');
  require('../quality/validate.cjs').sourceReport(admission, manifest);
  assert.equal(manifest.sourceDirty, false);
  assert.equal(manifest.sourceCommit, manifest.candidateCommit);
  assert.deepEqual(manifest.edition, {
    id: 'production',
    indexable: true,
    origin: 'https://vitaliioborskyi.ai',
  });
  const { authentication, manifest: tested, gate } = admission.staging;
  assert.equal(authentication.schema, 1);
  assert.equal(authentication.kind, 'accepted-staging-source');
  assert.equal(authentication.policy, policy);
  assert.equal(authentication.pass, true);
  flow.positive(authentication.pr);
  flow.positive(authentication.runId);
  flow.positive(authentication.attempt);
  flow.positive(authentication.checkpointCheck);
  for (const key of ['sourceCommit', 'sourceTree', 'testedSource', 'mergedSource', 'controller'])
    assert.match(authentication[key], /^[a-f0-9]{40}$/);
  assert.ok(
    [authentication.testedSource, authentication.mergedSource].includes(manifest.sourceCommit)
  );
  assert.equal(authentication.sourceCommit, manifest.sourceCommit);
  assert.equal(authentication.sourceTree, manifest.sourceTree, 'unaccepted production tree');
  assert.equal(tested.sourceTree, manifest.sourceTree, 'staging/production source trees differ');
  assert.equal(tested.sourceCommit, authentication.testedSource, 'wrong tested staging source');
  assert.deepEqual(tested.edition, { id: 'staging', indexable: false, analytics: false });
  stageGate.validateGate(tested, gate, gate.hostedOrigin);
  const expectedNames = names(authentication.runId, authentication.attempt);
  for (const [record, name] of [
    [authentication.public, expectedNames.public],
    [authentication.gate, expectedNames.gate],
    ...authentication.reports.map((record, index) => [record, expectedNames.reports[index]]),
  ]) {
    flow.positive(record.id);
    assert.equal(record.name, name);
    assert.equal(record.runId, authentication.runId);
    assert.equal(record.controller, authentication.controller);
    assert.match(record.digest, /^sha256:[a-f0-9]{64}$/);
  }
  assert.equal(authentication.reports.length, expectedNames.reports.length);
  const retained = [authentication.public, authentication.gate, ...authentication.reports];
  assert.equal(new Set(retained.map((record) => record.id)).size, retained.length);
  assert.equal(String(gate.githubArtifact.id), String(authentication.public.id));
  assert.equal(
    'sha256:' + gate.githubArtifact.uploadDigest.replace(/^sha256:/, ''),
    authentication.public.digest
  );
  const original = motion.select(tested),
    production = motion.select(manifest);
  assert.equal(original.edition, 'staging');
  assert.equal(production.edition, 'production');
  assert.equal(original.variant.baseEngine, production.variant.baseEngine);
  for (const name of ['theme.js', 'space.js', 'archive.js', 'navigation.js'])
    assert.equal(original.files[name], production.files[name], 'unstaged runtime asset: ' + name);
  assert.equal(admission.derivation, 'production-edition-from-identical-staged-source-tree');
  if (expectedArtifact) {
    flow.positive(admission.githubArtifact.id);
    assert.match(admission.githubArtifact.uploadDigest, /^(?:sha256:)?[a-f0-9]{64}$/);
    assert.equal(String(admission.githubArtifact.id), String(expectedArtifact.artifactId));
    assert.equal(
      admission.githubArtifact.uploadDigest.replace(/^sha256:/, ''),
      expectedArtifact.uploadDigest.replace(/^sha256:/, '')
    );
  }
  return true;
}

function bind(directory, authenticationFile, testedDirectory, gateFile) {
  const read = (file) => JSON.parse(fs.readFileSync(file));
  const manifest = read(path.join(directory, 'artifact.json'));
  const tested = read(path.join(testedDirectory, 'artifact.json'));
  artifact.verify(path.join(directory, 'public'), manifest);
  artifact.verify(path.join(testedDirectory, 'public'), tested);
  require('./edition.cjs').verify(directory, manifest);
  const admission = {
    schema: 1,
    kind: 'production-staging-admission',
    policy,
    pass: true,
    fullGate: false,
    sourceCommit: manifest.sourceCommit,
    sourceTree: manifest.sourceTree,
    candidateCommit: manifest.candidateCommit,
    artifactDigest: manifest.artifactDigest,
    variant: require('../quality/common.cjs').variant(manifest),
    derivation: 'production-edition-from-identical-staged-source-tree',
    staging: { authentication: read(authenticationFile), manifest: tested, gate: read(gateFile) },
  };
  validate(manifest, admission);
  fs.writeFileSync(
    path.join(directory, 'staging-admission.json'),
    JSON.stringify(admission, null, 2) + '\n'
  );
  return admission;
}

function gate(directory, output, expectedArtifact) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  artifact.verify(path.join(directory, 'public'), manifest);
  const admission = JSON.parse(fs.readFileSync(path.join(directory, 'staging-admission.json')));
  flow.positive(expectedArtifact.artifactId);
  assert.match(expectedArtifact.uploadDigest, /^(?:sha256:)?[a-f0-9]{64}$/);
  admission.githubArtifact = {
    id: String(expectedArtifact.artifactId),
    uploadDigest: expectedArtifact.uploadDigest,
  };
  validate(manifest, admission, expectedArtifact);
  fs.writeFileSync(output, JSON.stringify(admission, null, 2) + '\n');
  return admission;
}

if (require.main === module) {
  const [mode, directory, ...args] = process.argv.slice(2);
  if (mode === 'bind') bind(directory, ...args);
  else if (mode === 'gate')
    gate(directory, args[0], {
      artifactId: process.env.SITE_ARTIFACT_ID,
      uploadDigest: process.env.SITE_UPLOAD_DIGEST,
    });
  else
    throw Error(
      'Usage: staging-policy.cjs bind PRODUCTION AUTHENTICATION STAGING GATE | gate PRODUCTION OUTPUT'
    );
}
module.exports = { policy, names, authenticate, validate, bind, gate };
