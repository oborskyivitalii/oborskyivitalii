'use strict';
// This one-time pre-production transition never changes ordinary Pages URL admission.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const flow = require('../staging/review-flow.cjs');
const artifact = require('../quality/artifact.cjs');
const controller = require('./controller.cjs');
const http = require('./http.cjs');
const pkg = require('./package.cjs');

const workflow = '.github/workflows/site-pages-migration.yml';
const from = 'https://oborskyivitalii.github.io/oborskyivitalii';
const to = 'https://vitaliioborskyi.ai';

function settings(value, destination) {
  const actual = {
    baseURL: http.baseURL(value.html_url),
    cname: value.cname,
    buildType: value.build_type,
    httpsEnforced: value.https_enforced,
  };
  assert.equal(actual.baseURL, destination);
  assert.equal(actual.cname, destination === from ? null : new URL(to).hostname);
  assert.equal(actual.buildType, 'workflow', 'migration requires Actions-based Pages');
  assert.equal(typeof actual.httpsEnforced, 'boolean', 'missing actual HTTPS setting');
  return actual;
}

function validate(plan) {
  assert.equal(plan.schema, 1);
  assert.equal(plan.kind, 'pages-base-migration');
  assert.equal(plan.repository, flow.repository);
  assert.equal(plan.from, from, 'migration source host/prefix differs');
  assert.equal(plan.to, to, 'migration destination differs');
  assert.match(plan.controller, /^[a-f0-9]{40}$/);
  flow.positive(plan.preparation.runId);
  flow.positive(plan.preparation.attempt);
  assert.deepEqual(
    plan.settings,
    settings(
      {
        html_url: plan.settings.baseURL,
        cname: plan.settings.cname,
        build_type: plan.settings.buildType,
        https_enforced: plan.settings.httpsEnforced,
      },
      from
    )
  );
  const previous = plan.previous;
  flow.positive(previous.runId);
  flow.positive(previous.attempt);
  flow.positive(previous.artifactId);
  require('../staging/trust.cjs').digest(previous.uploadDigest);
  assert.equal(previous.state.basePath, '/oborskyivitalii/');
  assert.equal(previous.state.production, null, 'migration cannot move accepted production');
  assert.equal(previous.state.publication.kind, 'ci-pages');
  assert.equal(String(previous.state.publication.runId), String(previous.runId));
  assert.equal(String(previous.state.publication.attempt), String(previous.attempt));
  assert.match(previous.state.publication.controller, /^[a-f0-9]{40}$/);
  assert.match(plan.previousPackageDigest, /^[a-f0-9]{64}$/);
  return plan;
}

function ownerRun(run, context, expectedPath, runId, attempt, conclusion = 'success') {
  assert.equal(run.id, flow.positive(runId));
  assert.equal(run.repository?.full_name, flow.repository);
  assert.equal(run.path, expectedPath);
  assert.equal(run.head_branch, 'main');
  assert.equal(run.actor?.login, context.repo.owner);
  assert.equal(run.triggering_actor?.login, context.repo.owner);
  assert.equal(run.run_attempt, flow.positive(attempt), 'run attempt changed');
  assert.equal(run.status, 'completed');
  assert.equal(run.conclusion, conclusion);
}

async function prepare(github, context, main, pages, fetcher = fetch) {
  controller.controller(context, main);
  assert.equal(context.eventName, 'workflow_dispatch');
  assert.equal(await controller.activeProduction(github, context), null);
  const observed = settings(pages, from);
  const previous = await controller.previous(github, context, from, null, fetcher);
  assert.ok(previous, 'migration requires an accepted existing Pages package');
  const run = (
    await github.rest.actions.getWorkflowRun({
      ...context.repo,
      run_id: previous.runId,
    })
  ).data;
  ownerRun(run, context, flow.workflow, previous.runId, previous.attempt);
  assert.ok(['workflow_dispatch', 'issue_comment'].includes(run.event));
  assert.equal(run.head_sha, previous.state.publication.controller);
  const item = (
    await github.rest.actions.getArtifact({
      ...context.repo,
      artifact_id: previous.artifactId,
    })
  ).data;
  controller.artifactIdentity(
    item,
    run,
    previous.artifactId,
    previous.uploadDigest,
    'site-pages-' + previous.runId + '-' + previous.attempt
  );
  assert.equal(item.workflow_run.head_sha, run.head_sha);
  assert.equal(item.workflow_run.head_branch, 'main');
  return {
    schema: 1,
    kind: 'pages-base-migration',
    repository: flow.repository,
    from,
    to,
    controller: context.sha,
    preparation: {
      runId: context.runId,
      attempt: flow.positive(process.env.GITHUB_RUN_ATTEMPT),
    },
    settings: observed,
    previous,
  };
}

async function freeze(directory, upload, plan, output, fetcher = fetch) {
  const bytes = fs.readFileSync(upload);
  const previous = controller.retained(directory, plan.previous, bytes);
  assert.deepEqual(previous.root, previous.staging, 'migration requires the staging-only root');
  assert.equal(previous.state.production, null);
  plan.previousPackageDigest = previous.packageDigest;
  validate(plan);
  const observation = await http.check(directory, from, fetcher);
  fs.mkdirSync(output, { recursive: true });
  assert.equal(fs.readdirSync(output).length, 0, 'migration bundle must be empty');
  fs.cpSync(directory, path.join(output, 'previous/pages-package'), {
    recursive: true,
  });
  fs.copyFileSync(upload, path.join(output, 'previous-upload.zip'));
  fs.writeFileSync(path.join(output, 'migration.json'), JSON.stringify(plan, null, 2) + '\n');
  fs.writeFileSync(
    path.join(output, 'previous-http.json'),
    JSON.stringify(observation, null, 2) + '\n'
  );
  return plan;
}

function load(directory) {
  const plan = validate(JSON.parse(fs.readFileSync(path.join(directory, 'migration.json'))));
  const previous = controller.retained(
    path.join(directory, 'previous/pages-package'),
    plan.previous,
    fs.readFileSync(path.join(directory, 'previous-upload.zip'))
  );
  assert.equal(previous.packageDigest, plan.previousPackageDigest);
  assert.deepEqual(previous.root, previous.staging);
  return plan;
}

async function preparation(github, context, runId, attempt) {
  const run = (
    await github.rest.actions.getWorkflowRun({
      ...context.repo,
      run_id: flow.positive(runId),
    })
  ).data;
  ownerRun(run, context, workflow, runId, attempt);
  assert.equal(run.event, 'workflow_dispatch');
  assert.equal(run.head_sha, context.sha, 'prepared migration controller moved');
  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: run.id,
    attempt_number: flow.positive(attempt),
    per_page: 100,
  });
  const prepared = jobs.filter((job) => job.name === 'Pages migration preparation');
  assert.equal(prepared.length, 1);
  assert.equal(prepared[0].conclusion, 'success');
  const artifacts = await github.paginate(github.rest.actions.listWorkflowRunArtifacts, {
    ...context.repo,
    run_id: run.id,
    per_page: 100,
  });
  const name = 'site-pages-migration-preparation-' + run.id + '-' + flow.positive(attempt);
  const matches = artifacts.filter((item) => item.name === name);
  assert.equal(matches.length, 1, 'migration preparation artifact missing/ambiguous');
  const item = matches[0];
  require('../staging/trust.cjs').digest(item.digest);
  controller.artifactIdentity(item, run, item.id, item.digest, name);
  assert.equal(item.workflow_run.head_sha, context.sha);
  return {
    runId: run.id,
    attempt: flow.positive(attempt),
    artifactId: item.id,
    uploadDigest: item.digest,
  };
}

async function lease(github, context, plan, mode) {
  validate(plan);
  assert.ok(['execute', 'recover'].includes(mode));
  controller.controller(
    context,
    (
      await github.rest.repos.getBranch({
        ...context.repo,
        branch: 'main',
      })
    ).data
  );
  assert.equal(context.eventName, 'workflow_dispatch');
  assert.equal(context.sha, plan.controller, 'migration controller moved');
  assert.equal(
    await controller.activeProduction(github, context),
    null,
    'production became active'
  );
  const actual = settings(
    (await github.rest.repos.getPages(context.repo)).data,
    mode === 'execute' ? to : from
  );
  if (mode === 'recover')
    assert.deepEqual(actual, plan.settings, 'restore captured Pages settings first');
}

function compose(directory, output, publication) {
  const plan = load(directory);
  assert.equal(publication.kind, 'ci-pages');
  assert.equal(publication.controller, plan.controller);
  flow.positive(publication.runId);
  flow.positive(publication.attempt);
  const staging = path.join(output, 'staging-source');
  const old = path.join(directory, 'previous/pages-package');
  controller.stagingFromPages(old, staging);
  const result = pkg.build(
    staging,
    path.join(output, 'pages-package'),
    null,
    null,
    publication,
    '/'
  );
  const previous = JSON.parse(fs.readFileSync(path.join(old, 'pages-package.json')));
  assert.deepEqual(result.root, previous.root);
  assert.deepEqual(result.staging, previous.staging);
  return result;
}

async function observeSource(directory, fetcher = fetch) {
  const plan = load(directory);
  const old = JSON.parse(
    fs.readFileSync(path.join(directory, 'previous/pages-package/pages-package.json'))
  );
  // After external CNAME binding, only this frozen transition may observe old-prefix
  // receipt bytes on the new root. Ordinary previous()/HTTP checks remain strict.
  for (const [name, info] of Object.entries(old.files)) {
    if (name.endsWith('.nojekyll')) continue;
    const result = await http.request(plan.to + '/' + name, plan.to, fetcher);
    assert.equal(result.response.status, 200);
    assert.equal(
      artifact.digest(result.bytes),
      info.sha256,
      'cutover source bytes changed: ' + name
    );
  }
  return {
    schema: 1,
    kind: 'pages-migration-source',
    pass: true,
    packageDigest: old.packageDigest,
  };
}

async function recoverySource(github, context, directory, runId, attempt, fetcher = fetch) {
  const plan = load(directory);
  const run = (
    await github.rest.actions.getWorkflowRun({
      ...context.repo,
      run_id: flow.positive(runId),
    })
  ).data;
  assert.ok(
    ['failure', 'cancelled', 'timed_out'].includes(run.conclusion),
    'recover only a failed migration'
  );
  ownerRun(run, context, workflow, runId, attempt, run.conclusion);
  assert.equal(run.event, 'workflow_dispatch');
  assert.equal(run.head_sha, plan.controller);
  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: run.id,
    attempt_number: flow.positive(attempt),
    per_page: 100,
  });
  const publishers = jobs.filter((job) => job.name === 'Pages publication');
  assert.equal(publishers.length, 1, 'failed migration publisher missing/ambiguous');
  assert.ok(['failure', 'cancelled', 'timed_out'].includes(publishers[0].conclusion));
  const observed = await http.request(plan.from + '/_delivery/state.json', plan.from, fetcher);
  assert.equal(observed.response.status, 200);
  const state = JSON.parse(observed.bytes);
  const original = plan.previous.state;
  const failed = {
    ...original,
    basePath: '/',
    publication: {
      kind: 'ci-pages',
      runId: String(runId),
      attempt: String(attempt),
      controller: plan.controller,
    },
  };
  assert.ok(
    isDeepStrictEqual(state, original) || isDeepStrictEqual(state, failed),
    'recovery source receipt is neither frozen predecessor nor failed migration'
  );
  return {
    schema: 1,
    kind: 'pages-migration-recovery-source',
    pass: true,
    failedRun: run.id,
  };
}

module.exports = {
  workflow,
  from,
  to,
  settings,
  validate,
  prepare,
  freeze,
  load,
  preparation,
  lease,
  compose,
  observeSource,
  recoverySource,
};
