'use strict';
// Workflow adapters call the same tested archive and Pages contracts.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const controller = require('./controller.cjs');
const archive = require('./archive.cjs');
const artifact = require('../quality/artifact.cjs');
const pages = require('../pages/controller.cjs');
const flow = require('../staging/review-flow.cjs');
const read = (file) => JSON.parse(fs.readFileSync(file));
function save(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

async function authenticate(github, context) {
  controller.authorize(
    context,
    (await github.rest.repos.getBranch({ ...context.repo, branch: 'main' })).data,
    process.env.PRODUCTION_ENABLED
  );
  await controller.protection(github, context);
}

async function resolve(github, context, core) {
  await authenticate(github, context);
  const operation = process.env.RELEASE_OPERATION;
  assert.ok(['publish', 'rollback', 'recover'].includes(operation));
  const tag = archive.tag(process.env.RELEASE_TAG);
  const current = await pages.activeProduction(github, context);
  if (operation === 'recover') {
    assert.equal(
      current,
      null,
      'first-release metadata recovery cannot replace accepted production'
    );
    const failed = await controller.failedPublication(
      github,
      context,
      process.env.FAILED_RELEASE_RUN,
      process.env.FAILED_RELEASE_ATTEMPT
    );
    save('release-control/request.json', { operation, tag, current, failed });
    core.setOutput('recovery_id', failed.artifactId);
    core.setOutput('recovery_digest', failed.uploadDigest);
    return;
  }
  assert.equal(await controller.branch(github, context), current?.sourceCommit || null);
  const proof = { operation, tag, current };
  if (operation === 'publish') {
    proof.validation = await controller.stagingValidation(
      github,
      context,
      process.env.VALIDATION_RUN
    );
    proof.releasePR = flow.positive(process.env.RELEASE_PR);
    proof.evidence = JSON.parse(process.env.RELEASE_EVIDENCE);
    core.setOutput('gate_id', proof.validation.gate.id);
    core.setOutput('validation_run', proof.validation.run.id);
  }
  const preparationRun = process.env.FIRST_RELEASE_PREPARATION_RUN || '';
  const preparationAttempt = process.env.FIRST_RELEASE_PREPARATION_ATTEMPT || '';
  assert.equal(
    Boolean(preparationRun),
    Boolean(preparationAttempt),
    'incomplete recovery preparation'
  );
  if (preparationRun) {
    assert.equal(operation, 'publish', 'first-release preparation cannot authorize rollback');
    assert.equal(current, null, 'first-release preparation cannot replace existing production');
    proof.preparation = await preparation(github, context, preparationRun, preparationAttempt);
    core.setOutput('preparation_id', proof.preparation.artifactId);
    core.setOutput('preparation_digest', proof.preparation.uploadDigest);
  }
  save('release-control/request.json', proof);
}

async function preparation(github, context, runId, attempt) {
  const run = (
    await github.rest.actions.getWorkflowRun({
      ...context.repo,
      run_id: flow.positive(runId),
    })
  ).data;
  const comparison = (
    await github.rest.repos.compareCommitsWithBasehead({
      ...context.repo,
      basehead: run.head_sha + '...' + context.sha,
    })
  ).data;
  assert.equal(
    comparison.merge_base_commit.sha,
    run.head_sha,
    'recovery capsule is outside main history'
  );
  return require('../pages/migration.cjs').preparation(
    github,
    { ...context, sha: run.head_sha },
    runId,
    attempt
  );
}

async function canonicalPredecessor(github, context, directory, proof, fetcher = fetch) {
  pages.controller(
    context,
    (await github.rest.repos.getBranch({ ...context.repo, branch: 'main' })).data
  );
  assert.equal(context.eventName, 'workflow_dispatch');
  const migration = require('../pages/migration.cjs');
  const plan = migration.load(directory);
  assert.deepEqual(plan.preparation, { runId: proof.runId, attempt: proof.attempt });
  const authenticated = await preparation(github, context, proof.runId, proof.attempt);
  assert.deepEqual(authenticated, proof, 'recovery preparation changed');
  const run = (await github.rest.actions.getWorkflowRun({ ...context.repo, run_id: proof.runId }))
    .data;
  assert.equal(plan.controller, run.head_sha);
  assert.equal(await pages.activeProduction(github, context), null);
  const configured = migration.settings(
    (await github.rest.repos.getPages(context.repo)).data,
    migration.to
  );
  assert.equal(configured.httpsEnforced, true, 'canonical HTTPS must remain enforced');
  const observation = await migration.observeSource(directory, fetcher);
  assert.deepEqual(
    migration.settings((await github.rest.repos.getPages(context.repo)).data, migration.to),
    configured,
    'canonical settings changed during recovery verification'
  );
  return { plan, observation, settings: configured };
}

async function publicInputs(github, context, core) {
  const gate = read('validation-gate/release-manifest.json');
  assert.equal(gate.kind, 'production-staging-admission');
  const proof = read('release-control/request.json');
  const staging = await require('./staging-policy.cjs').authenticate(
    github,
    context,
    proof.releasePR,
    gate.sourceCommit
  );
  assert.deepEqual(staging, gate.staging.authentication, 'staging admission changed');
  proof.validation.reports.push(staging.public, staging.gate, ...staging.reports);
  proof.validation.reportRuns = [proof.validation.run.id, staging.runId];
  save('release-control/request.json', proof);
  const item = await controller.publicArtifact(github, context, gate);
  save('release-control/public.json', item);
  core.setOutput('id', item.id);
  core.setOutput('run', item.workflow_run.id);
}

async function previous(github, context, core) {
  const proof = read('release-control/request.json');
  assert.equal(
    require('../pages/http.cjs').origin(process.env.PAGES_ORIGIN),
    require('./edition-archive.cjs').origin
  );
  let record;
  if (proof.preparation) {
    assert.equal(proof.current, null);
    const verified = await canonicalPredecessor(
      github,
      context,
      'first-release-prepared',
      proof.preparation
    );
    record = verified.plan.previous;
    proof.pagesSettings = verified.settings;
    save('release-control/request.json', proof);
    fs.cpSync('first-release-prepared/previous/pages-package', 'pages-previous/pages-package', {
      recursive: true,
    });
    core.setOutput('first_release', 'true');
  } else {
    record = await pages.previous(github, context, process.env.PAGES_ORIGIN, proof.current);
  }
  assert.ok(record, 'authenticate the existing Pages recovery receipt before production');
  save('release-control/previous.json', record);
  core.setOutput('id', record.artifactId);
  core.setOutput('run', record.runId);
}

async function verifyPrevious() {
  const previous = read('release-control/previous.json');
  pages.retained('pages-previous/pages-package', previous);
  const proof = read('release-control/request.json');
  const observation = proof.preparation
    ? await require('../pages/migration.cjs').observeSource('first-release-prepared')
    : await require('../pages/http.cjs').check(
        'pages-previous/pages-package',
        process.env.PAGES_ORIGIN
      );
  save('pages-reports/previous-http.json', observation);
}

async function verifyRecovery(github, context) {
  const proof = read('release-control/request.json');
  if (proof.preparation) {
    const verified = await canonicalPredecessor(
      github,
      context,
      'first-release-prepared',
      proof.preparation
    );
    assert.deepEqual(verified.settings, proof.pagesSettings);
    save('pages-reports/rollback-http.json', verified.observation);
    return;
  }
  const observation = await require('../pages/http.cjs').ready(
    'pages-previous/pages-package',
    process.env.PAGES_ORIGIN,
    fetch,
    { retain: (value) => save('pages-reports/rollback-http.json', value) }
  );
  save('pages-reports/rollback-http.json', observation);
  assert.equal(observation.pass, true, observation.error);
}

function retainReports(proof, directory) {
  fs.mkdirSync(directory, { recursive: true });
  for (const item of proof.reports) {
    const bytes = cp.execFileSync(
      'gh',
      ['api', 'repos/' + flow.repository + '/actions/artifacts/' + flow.positive(item.id) + '/zip'],
      {
        timeout: 120000,
        maxBuffer: 300_000_000,
      }
    );
    assert.equal('sha256:' + artifact.digest(bytes), item.digest);
    fs.writeFileSync(path.join(directory, 'evidence-' + item.id + '.zip'), bytes);
  }
  const files = controller.evidenceFiles(directory, proof);
  for (const runId of proof.reportRuns || [proof.run.id]) {
    const logs = cp.execFileSync(
      'gh',
      ['api', 'repos/' + flow.repository + '/actions/runs/' + flow.positive(runId) + '/logs'],
      {
        timeout: 120000,
        maxBuffer: 300_000_000,
      }
    );
    const name = 'evidence-run-' + runId + '.zip';
    fs.writeFileSync(path.join(directory, name), logs);
    files[name] = {
      sha256: artifact.digest(logs),
      raw: logs.length,
      workflowRun: runId,
    };
  }
  return files;
}

async function prepareArchive(github, context) {
  await authenticate(github, context);
  const proof = read('release-control/request.json');
  await controller.metadataAccess(github, context, [proof.current?.releasePR, proof.releasePR]);
  if (proof.operation === 'rollback') {
    const record = await controller.restoreArchive(github, context, proof.tag, 'release-assets');
    await controller.metadataAccess(github, context, [record.releasePR]);
    await controller.wasAccepted(github, context, record);
    cp.execFileSync('python3', [
      'tools/release/package.py',
      'unpack',
      'release-assets/public.tar.gz',
      'production-source',
      record.packageDigest,
    ]);
    fs.copyFileSync('release-assets/rights.json', 'production-source/rights.json');
    archive.verify('production-source', record, fs.readFileSync('release-assets/public.tar.gz'));
    require('./edition-archive.cjs').verify('production-source', record.public);
    return record;
  }
  const gate = read('validation-gate/release-manifest.json');
  const publicItem = read('release-control/public.json');
  const record = controller.admission('production-source', gate, proof.evidence, publicItem);
  await controller.sourcePR(github, context, record, proof.releasePR);
  assert.deepEqual(await pages.activeProduction(github, context), proof.current);
  const evidenceFiles = retainReports(proof.validation, 'release-assets');
  cp.execFileSync('python3', [
    'tools/release/package.py',
    'pack',
    'production-source',
    'release-assets/public.tar.gz',
  ]);
  const bytes = fs.readFileSync('release-assets/public.tar.gz');
  const run = (
    await github.rest.actions.getWorkflowRun({
      ...context.repo,
      run_id: context.runId,
    })
  ).data;
  const desired = controller.createArchive(
    'production-source',
    proof.validation,
    gate,
    proof.evidence,
    {
      tag: proof.tag,
      releasePR: proof.releasePR,
      runURL: 'https://github.com/' + flow.repository + '/actions/runs/' + proof.validation.run.id,
      packageDigest: artifact.digest(bytes),
      createdAt: run.created_at,
      previousTag: proof.current?.tag || null,
      evidenceFiles,
    }
  );
  fs.copyFileSync('production-source/rights.json', 'release-assets/rights.json');
  archive.verify('production-source', desired, bytes);
  save('release-assets/archive.json', desired);
  return desired;
}

function compose() {
  const previous = read('release-control/previous.json');
  const directory = 'pages-previous/pages-package';
  pages.retained(directory, previous);
  const release = read('release-assets/archive.json');
  const record = require('../pages/package.cjs').build(
    null,
    'pages-package',
    'production-source',
    release.tag,
    {
      kind: 'ci-pages',
      runId: process.env.GITHUB_RUN_ID,
      attempt: process.env.GITHUB_RUN_ATTEMPT,
      controller: process.env.GITHUB_SHA,
    },
    '/',
    { productionRightsDigest: release.rights.inventoryDigest }
  );
  assert.equal(record.staging, null, 'production must not republish a staging subtree');
  fs.mkdirSync('pages-reports', { recursive: true });
  return record;
}

function verifyPreparedArchive() {
  const desired = read('release-assets/archive.json');
  archive.verify('production-source', desired, fs.readFileSync('release-assets/public.tar.gz'));
  const combined = read('pages-package/pages-package.json');
  require('../pages/package.cjs').verify('pages-package', combined);
  assert.deepEqual(combined.root, desired.public, 'prepared production root differs');
  assert.deepEqual(
    combined.state.production,
    {
      tag: desired.tag,
      sourceCommit: desired.sourceCommit,
      publicDigest: desired.publicDigest,
    },
    'prepared production receipt differs'
  );
  assert.equal(
    combined.rights.root.inventoryDigest,
    desired.rights.inventoryDigest,
    'prepared production license differs'
  );
  assert.equal(combined.staging, null, 'prepared package republishes a staging subtree');
  assert.equal(combined.state.staging, null, 'prepared receipt claims staging');
  assert.equal(combined.rights.staging, null, 'prepared license claims staging');
  return desired;
}

async function publishPreparedArchive(github, context) {
  // Deterministic composition/rights failures must precede the first draft tag
  // or Release asset write. Fresh authenticated leases still guard live deploy.
  const desired = verifyPreparedArchive();
  await authenticate(github, context);
  const proof = read('release-control/request.json');
  if (proof.operation === 'rollback') return desired;
  assert.equal(proof.operation, 'publish');
  await controller.publishArchive(github, context, 'release-assets', desired);
  return desired;
}

async function begin(github, context) {
  await authenticate(github, context);
  const proof = read('release-control/request.json');
  assert.deepEqual(await pages.activeProduction(github, context), proof.current);
  if (proof.preparation) {
    const verified = await canonicalPredecessor(
      github,
      context,
      'first-release-prepared',
      proof.preparation
    );
    assert.deepEqual(verified.settings, proof.pagesSettings);
  }
  const transaction = await controller.plan(
    github,
    context,
    proof.current,
    read('release-assets/archive.json')
  );
  save('release-control/transition.json', transaction);
  try {
    await controller.pending(github, context, transaction);
  } finally {
    // Preserve a created deployment ID even if recording in_progress failed.
    save('release-control/transition.json', transaction);
  }
}

async function accept(github, context) {
  await authenticate(github, context);
  const record = read('release-assets/archive.json');
  const combined = read('pages-package/pages-package.json');
  const observation = require('./live.cjs').observation(record, combined, {
    pages: read('pages-reports/http.json'),
    policy: read('pages-reports/production-policy.json'),
    productionBrowser: read('pages-reports/production-browser/preview-smoke.json'),
    retained: process.env.OBSERVATIONS_RETAINED === 'true',
  });
  save('pages-reports/accepted-observation.json', observation);
  const transaction = read('release-control/transition.json');
  if (read('release-control/request.json').operation === 'publish') {
    cp.execFileSync('tar', [
      '-czf',
      'release-assets/observations.tar.gz',
      'pages-reports',
      'release-control',
    ]);
    const activation = {
      schema: 1,
      kind: 'verified-production-publication',
      tag: record.tag,
      packageDigest: record.packageDigest,
      productionDeploymentId: transaction.deploymentId,
      runId: context.runId,
      attempt: process.env.GITHUB_RUN_ATTEMPT,
      controller: context.sha,
      observationsDigest: artifact.digest(fs.readFileSync('release-assets/observations.tar.gz')),
      observation,
    };
    save('release-assets/activation.json', activation);
    await controller.publishArchive(github, context, 'release-assets', record, activation);
  }
  return controller.accept(github, context, transaction, observation);
}

async function recover(github, context) {
  const transaction = read('release-control/transition.json');
  const restored = read('pages-reports/rollback-http.json');
  const previous = read('pages-previous/pages-package/pages-package.json');
  assert.equal(restored.packageDigest, previous.packageDigest);
  return controller.recover(github, context, transaction, {
    pass: restored.pass,
    productionTag: previous.state.production?.tag || null,
  });
}

async function recoveryInputs(github, context, core) {
  await authenticate(github, context);
  const proof = read('release-control/request.json');
  const request = read('failed-publication/release-control/request.json');
  assert.equal(proof.operation, 'recover');
  assert.equal(request.operation, 'publish');
  assert.equal(request.current, null);
  assert.equal(request.tag, proof.tag);
  const capsule = await preparation(
    github,
    context,
    request.preparation.runId,
    request.preparation.attempt
  );
  assert.deepEqual(capsule, request.preparation);
  const transaction = read('failed-publication/release-control/transition.json');
  assert.equal(request.releasePR, transaction.desired.releasePR);
  await controller.recoveryState(github, context, proof.failed, transaction, proof.tag);
  proof.preparation = capsule;
  save('release-control/request.json', proof);
  core.setOutput('preparation_id', capsule.artifactId);
  core.setOutput('preparation_digest', capsule.uploadDigest);
}

async function recoverFailed(github, context) {
  await authenticate(github, context);
  const proof = read('release-control/request.json');
  assert.equal(proof.operation, 'recover');
  const failed = await controller.failedPublication(
    github,
    context,
    proof.failed.runId,
    proof.failed.attempt
  );
  assert.deepEqual(failed, proof.failed, 'failed publication evidence changed');
  const transaction = read('failed-publication/release-control/transition.json');
  await controller.recoveryState(github, context, failed, transaction, proof.tag);
  const verified = await canonicalPredecessor(
    github,
    context,
    'first-release-prepared',
    proof.preparation
  );
  const request = read('failed-publication/release-control/request.json');
  assert.deepEqual(request.preparation, proof.preparation);
  const previous = read('failed-publication/release-control/previous.json');
  assert.deepEqual(previous, verified.plan.previous);
  await controller.metadataAccess(github, context, [transaction.desired.releasePR]);
  // Repeat live/provider leases immediately before the existing compensation.
  await controller.recoveryState(github, context, failed, transaction, proof.tag);
  await controller.recover(github, context, transaction, {
    pass: verified.observation.pass,
    productionTag: null,
  });
  assert.equal(await controller.branch(github, context), null);
  save('release-control/recovered.json', {
    schema: 1,
    kind: 'first-release-metadata-recovery',
    failed,
    controller: context.sha,
    observation: verified.observation,
    settings: verified.settings,
  });
}

async function abandoned(github, context) {
  const file = 'release-control/transition.json';
  if (!fs.existsSync(file)) return;
  const transaction = read(file);
  if (transaction.deploymentId)
    await github.rest.repos.createDeploymentStatus({
      ...context.repo,
      deployment_id: transaction.deploymentId,
      state: 'error',
      description: 'Production publication did not start; accepted site remains unchanged',
      auto_inactive: false,
    });
}

module.exports = {
  authenticate,
  resolve,
  publicInputs,
  previous,
  verifyPrevious,
  verifyRecovery,
  preparation,
  canonicalPredecessor,
  recoveryInputs,
  recoverFailed,
  retainReports,
  prepareArchive,
  compose,
  verifyPreparedArchive,
  publishPreparedArchive,
  begin,
  accept,
  recover,
  abandoned,
};
