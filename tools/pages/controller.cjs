'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const flow = require('../staging/review-flow.cjs');

function controller(context, main) {
  assert.equal(context.repo.owner + '/' + context.repo.repo, flow.repository);
  assert.equal(context.ref, 'refs/heads/main', 'Pages publisher must use protected main');
  assert.equal(context.sha, main.commit.sha, 'Pages controller moved');
  assert.equal(main.protected, true);
  assert.equal(context.actor, context.repo.owner, 'Pages publication requires the owner request');
}

function stagingRun(run, jobs) {
  assert.equal(run.path, flow.workflow);
  assert.equal(run.head_branch, 'main');
  assert.ok(['workflow_dispatch', 'issue_comment'].includes(run.event));
  assert.equal(run.actor?.login, 'oborskyivitalii');
  assert.ok(['in_progress', 'completed'].includes(run.status));
  const promotions = jobs.filter((job) => job.name === 'promote');
  assert.equal(promotions.length, 1, 'missing/ambiguous stable promotion');
  assert.equal(promotions[0].conclusion, 'success', 'stable staging was not verified');
  return true;
}

function artifactIdentity(item, run, id, digest, name) {
  assert.equal(item.expired, false);
  assert.equal(String(item.id), String(flow.positive(id)));
  assert.equal(item.workflow_run.id, run.id);
  assert.equal(item.name, name);
  assert.equal(item.digest.replace(/^sha256:/, ''), digest.replace(/^sha256:/, ''));
}

async function activeProduction(github, context) {
  const deployments = await github.paginate(github.rest.repos.listDeployments, {
    ...context.repo,
    environment: 'production',
    per_page: 100,
  });
  for (const deployment of deployments.sort((left, right) => right.id - left.id)) {
    const { data } = await github.rest.repos.listDeploymentStatuses({
      ...context.repo,
      deployment_id: deployment.id,
      per_page: 1,
    });
    if (data[0]?.state !== 'success') continue;
    assert.equal(deployment.creator?.login, 'github-actions[bot]');
    const payload =
      typeof deployment.payload === 'string' ? JSON.parse(deployment.payload) : deployment.payload;
    assert.equal(payload.kind, 'accepted-production');
    require('../release/archive.cjs').tag(payload.tag);
    assert.equal(payload.sourceCommit, deployment.sha);
    return { ...payload, deploymentId: deployment.id };
  }
  return null;
}

function sameProduction(actual, expected) {
  assert.deepEqual(
    actual,
    expected
      ? {
          tag: expected.tag,
          sourceCommit: expected.sourceCommit,
          publicDigest: expected.publicDigest,
        }
      : null,
    'live production differs from accepted deployment bookkeeping'
  );
}

async function previous(github, context, baseURL, production, fetcher = fetch) {
  const http = require('./http.cjs'),
    base = http.origin(baseURL);
  const result = await http.request(base + '/_delivery/state.json', base, fetcher);
  if (result.response.status === 404) {
    assert.equal(production, null, 'active production has no Pages recovery receipt');
    const root = await http.request(base + '/', base, fetcher);
    assert.equal(root.response.status, 404, 'untracked existing Pages publication');
    return null;
  }
  assert.equal(result.response.status, 200, 'cannot observe previous Pages state');
  const state = JSON.parse(result.bytes);
  assert.equal(state.schema, 1);
  sameProduction(state.production, production);
  const receipt = state.publication;
  assert.equal(receipt.kind, 'ci-pages');
  const runId = flow.positive(receipt.runId),
    attempt = flow.positive(receipt.attempt);
  assert.match(receipt.controller, /^[a-f0-9]{40}$/);
  const run = (await github.rest.actions.getWorkflowRun({ ...context.repo, run_id: runId })).data;
  assert.equal(run.head_sha, receipt.controller);
  assert.equal(run.head_branch, 'main');
  assert.equal(run.actor?.login, context.repo.owner);
  assert.ok(
    ['site-color-review.yml', 'site-production.yml'].some(
      (name) => run.path === '.github/workflows/' + name
    )
  );
  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: runId,
    attempt_number: attempt,
    per_page: 100,
  });
  const accepted = jobs.filter(
    (job) => job.name.endsWith(' / Pages publication') || job.name === 'Pages publication'
  );
  assert.equal(accepted.length, 1, 'previous Pages publisher is missing/ambiguous');
  assert.equal(accepted[0].conclusion, 'success', 'previous Pages publication was not accepted');
  const artifacts = await github.paginate(github.rest.actions.listWorkflowRunArtifacts, {
    ...context.repo,
    run_id: runId,
    per_page: 100,
  });
  const matches = artifacts.filter((item) => item.name === 'site-pages-' + runId + '-' + attempt);
  assert.equal(matches.length, 1, 'previous Pages recovery expired or is ambiguous');
  const item = matches[0];
  assert.equal(
    item.expired,
    false,
    'previous Pages recovery expired; reconcile before publication'
  );
  return { runId, attempt, artifactId: item.id, uploadDigest: item.digest, state };
}

function retained(directory, previousRecord) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'pages-package.json')));
  require('./package.cjs').verify(directory, record);
  assert.deepEqual(
    record.state,
    previousRecord.state,
    'retained recovery differs from live receipt'
  );
  return record;
}

function productionLease(previousRecord, current) {
  sameProduction(previousRecord?.state.production || null, current);
}

function sourceFromPackage(directory, output) {
  const staged = JSON.parse(fs.readFileSync(path.join(directory, 'staging-package.json')));
  require('../staging/package.cjs').verify(directory, staged);
  fs.mkdirSync(path.join(output, 'public'), { recursive: true });
  for (const name of Object.keys(staged.source.files)) {
    const target = path.join(output, 'public', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(directory, 'public', name), target);
  }
  fs.writeFileSync(
    path.join(output, 'artifact.json'),
    JSON.stringify(staged.source, null, 2) + '\n'
  );
  return staged.source;
}

function stagingFromPages(directory, output) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'pages-package.json')));
  require('./package.cjs').verify(directory, record);
  fs.mkdirSync(path.join(output, 'public'), { recursive: true });
  for (const name of Object.keys(record.staging.files)) {
    const target = path.join(output, 'public', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(directory, 'public/staging', name), target);
  }
  fs.writeFileSync(
    path.join(output, 'artifact.json'),
    JSON.stringify(record.staging, null, 2) + '\n'
  );
  require('./package.cjs').checkStaging(output, record.staging);
  return record.staging;
}

module.exports = {
  controller,
  stagingRun,
  artifactIdentity,
  activeProduction,
  sameProduction,
  previous,
  retained,
  productionLease,
  sourceFromPackage,
  stagingFromPages,
};
