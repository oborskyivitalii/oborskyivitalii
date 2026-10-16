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
  assert.ok(['publish', 'rollback'].includes(operation));
  const tag = archive.tag(process.env.RELEASE_TAG);
  const current = await pages.activeProduction(github, context);
  assert.equal(await controller.branch(github, context), current?.sourceCommit || null);
  const proof = { operation, tag, current };
  if (operation === 'publish') {
    proof.validation = await controller.validation(github, context, process.env.VALIDATION_RUN);
    proof.releasePR = flow.positive(process.env.RELEASE_PR);
    proof.evidence = JSON.parse(process.env.RELEASE_EVIDENCE);
    core.setOutput('gate_id', proof.validation.gate.id);
    core.setOutput('validation_run', proof.validation.run.id);
  }
  save('release-control/request.json', proof);
}

async function publicInputs(github, context, core) {
  const gate = read('validation-gate/release-manifest.json');
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
  const record = await pages.previous(github, context, process.env.PAGES_ORIGIN, proof.current);
  assert.ok(record, 'authenticate the existing Pages recovery receipt before production');
  save('release-control/previous.json', record);
  core.setOutput('id', record.artifactId);
  core.setOutput('run', record.runId);
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
  const logs = cp.execFileSync(
    'gh',
    ['api', 'repos/' + flow.repository + '/actions/runs/' + flow.positive(proof.run.id) + '/logs'],
    {
      timeout: 120000,
      maxBuffer: 300_000_000,
    }
  );
  const name = 'evidence-run-' + proof.run.id + '.zip';
  fs.writeFileSync(path.join(directory, name), logs);
  files[name] = { sha256: artifact.digest(logs), raw: logs.length, workflowRun: proof.run.id };
  return files;
}

async function prepareArchive(github, context) {
  await authenticate(github, context);
  const proof = read('release-control/request.json');
  if (proof.operation === 'rollback') {
    const record = await controller.restoreArchive(github, context, proof.tag, 'release-assets');
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
  const run = (await github.rest.actions.getWorkflowRun({ ...context.repo, run_id: context.runId }))
    .data;
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
    passive: read('pages-reports/passive.json'),
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
