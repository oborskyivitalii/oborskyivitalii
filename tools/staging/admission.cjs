'use strict';
// Only real current-source jobs admit stable staging; skipped Draft jobs cannot.
const assert = require('node:assert/strict');
const routes = [
  ['site-checks.yml', 'checks'],
  ['navigation.yml', 'Local navigation and RI freshness'],
  ['issue-acceptance.yml', 'Owning issue deterministic acceptance mapping'],
];

function validateRun(run, jobs, source, number, name) {
  assert.equal(run.head_sha, source, 'admission source differs');
  assert.equal(run.event, 'pull_request', 'admission must be PR evidence');
  assert.equal(run.head_repository?.full_name, 'oborskyivitalii/oborskyivitalii');
  assert.ok(
    run.pull_requests.some((pr) => pr.number === number),
    'wrong admission PR'
  );
  assert.equal(run.status, 'completed', 'admission still running');
  assert.equal(run.conclusion, 'success', 'admission workflow failed');
  const matches = jobs.filter((job) => job.name === name);
  assert.equal(matches.length, 1, 'missing or ambiguous admission job: ' + name);
  assert.equal(matches[0].status, 'completed', 'admission job incomplete');
  assert.equal(matches[0].conclusion, 'success', 'skipped/failed admission job: ' + name);
  return { workflowRun: run.id, attempt: run.run_attempt, job: matches[0].id, source };
}

async function requireAdmission(github, context, pr) {
  assert.equal(pr.draft, false, 'approve the prototype and mark the PR ready before /stage');
  const evidence = [];
  for (const [workflow, name] of routes) {
    const { data } = await github.rest.actions.listWorkflowRuns({
      ...context.repo,
      workflow_id: workflow,
      head_sha: pr.head.sha,
      event: 'pull_request',
      per_page: 100,
    });
    const run = data.workflow_runs
      .filter((item) => item.pull_requests.some((itemPr) => itemPr.number === pr.number))
      .sort((left, right) => right.id - left.id)[0];
    assert.ok(run, 'missing admission workflow: ' + workflow);
    assert.equal(run.status, 'completed', 'admission still running');
    assert.equal(run.conclusion, 'success', 'admission workflow failed');
    const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRun, {
      ...context.repo,
      run_id: run.id,
      filter: 'latest',
      per_page: 100,
    });
    evidence.push(validateRun(run, jobs, pr.head.sha, pr.number, name));
  }
  return evidence;
}

function controller(context, pr, main, expectedSource) {
  const flow = require('./review-flow.cjs');
  flow.controller(context, main);
  assert.equal(context.actor, context.repo.owner);
  flow.lease(pr, expectedSource);
  assert.equal(pr.base.ref, 'main');
  assert.equal(pr.base.repo.full_name, flow.repository);
  return flow;
}

function executionIdentity(context, attempt) {
  const flow = require('./review-flow.cjs');
  return String(flow.positive(context.runId)) + '/' + String(flow.positive(attempt));
}

async function beginMergeAdmission(
  github,
  context,
  pr,
  main,
  attempt = process.env.GITHUB_RUN_ATTEMPT
) {
  const flow = controller(context, pr, main, pr.head.sha);
  const identity = executionIdentity(context, attempt);
  const { data } = await github.rest.checks.create({
    ...context.repo,
    name: 'Staging admission',
    head_sha: pr.head.sha,
    status: 'in_progress',
    external_id: identity,
    details_url: 'https://github.com/' + flow.repository + '/actions/runs/' + context.runId,
    output: {
      title: 'Cloudflare staging must accept this attempt',
      summary: 'A previous successful staging attempt cannot admit this new attempt.',
    },
  });
  return data.id;
}

async function finishMergeAdmission(
  github,
  context,
  source,
  id,
  conclusion,
  output,
  attempt = process.env.GITHUB_RUN_ATTEMPT
) {
  const identity = executionIdentity(context, attempt);
  const { data } = await github.rest.checks.get({ ...context.repo, check_run_id: Number(id) });
  assert.equal(data.name, 'Staging admission');
  assert.equal(data.head_sha, source);
  assert.equal(data.external_id, identity);
  return github.rest.checks.update({
    ...context.repo,
    check_run_id: data.id,
    status: 'completed',
    conclusion,
    output,
  });
}

async function publishMergeAdmission(
  github,
  context,
  pr,
  main,
  expectedSource,
  outcomes,
  id,
  attempt = process.env.GITHUB_RUN_ATTEMPT
) {
  controller(context, pr, main, expectedSource);
  const evidence = await requireAdmission(github, context, pr);
  const comparison = (
    await github.rest.repos.compareCommitsWithBasehead({
      ...context.repo,
      basehead: main.commit.sha + '...' + expectedSource,
    })
  ).data;
  assert.equal(
    comparison.merge_base_commit.sha,
    main.commit.sha,
    'update the PR from current main before admission'
  );
  assert.equal(comparison.behind_by, 0);
  assert.equal(outcomes.promote, 'success', 'stable Cloudflare verification failed');
  return finishMergeAdmission(
    github,
    context,
    expectedSource,
    id,
    'success',
    {
      title: 'Exact PR source accepted on Cloudflare staging',
      summary:
        'Source admission: ' +
        evidence.map((item) => item.workflowRun + '/' + item.attempt).join(', ') +
        '. Protected main: ' +
        main.commit.sha +
        '. This result does not authorize production.',
    },
    attempt
  );
}

async function stagingEvidence(github, context, pr) {
  const flow = require('./review-flow.cjs');
  const checks = await github.paginate(github.rest.checks.listForRef, {
    ...context.repo,
    ref: pr.head.sha,
    check_name: 'Staging admission',
    filter: 'all',
    per_page: 100,
  });
  const check = checks
    .filter(
      (item) => item.name === 'Staging admission' && /^[1-9]\d*\/[1-9]\d*$/.test(item.external_id)
    )
    .sort((left, right) => right.id - left.id)[0];
  assert.ok(check, 'missing staging admission');
  assert.equal(check.head_sha, pr.head.sha);
  assert.equal(check.app.id, 15368);
  assert.equal(check.status, 'completed');
  assert.equal(check.conclusion, 'success');
  assert.match(check.external_id, /^[1-9]\d*\/[1-9]\d*$/);
  const [runId, attempt] = check.external_id.split('/').map(flow.positive);
  const run = (await github.rest.actions.getWorkflowRun({ ...context.repo, run_id: runId })).data;
  assert.equal(run.id, runId);
  assert.equal(run.path, flow.workflow);
  assert.equal(run.head_branch, 'main');
  assert.equal(run.head_repository.full_name, flow.repository);
  assert.equal(run.actor.login, context.repo.owner);
  assert.ok(['workflow_dispatch', 'issue_comment'].includes(run.event));
  assert.equal(run.run_attempt, attempt);
  assert.equal(run.status, 'completed');
  assert.equal(run.conclusion, 'success');
  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: runId,
    attempt_number: attempt,
    per_page: 100,
  });
  for (const name of ['promote', 'merge-admission']) {
    const matches = jobs.filter((job) => job.name === name);
    assert.equal(matches.length, 1, 'missing/ambiguous merged staging job: ' + name);
    assert.equal(matches[0].status, 'completed');
    assert.equal(matches[0].conclusion, 'success');
  }
  return { check, run, runId, attempt };
}

async function verifyMerge(github, context, pr) {
  const flow = require('./review-flow.cjs');
  assert.equal(pr.merged, true);
  assert.equal(pr.base.ref, 'main');
  for (const endpoint of [pr.base, pr.head]) assert.equal(endpoint.repo.full_name, flow.repository);
  const commits = await Promise.all(
    [pr.head.sha, pr.merge_commit_sha].map(
      async (ref) => (await github.rest.repos.getCommit({ ...context.repo, ref })).data
    )
  );
  assert.equal(
    commits[0].commit.tree.sha,
    commits[1].commit.tree.sha,
    'merged source tree differs from the tested PR; stage the changed source'
  );
  const { runId, attempt } = await stagingEvidence(github, context, pr);
  return {
    schema: 1,
    kind: 'accepted-staging-merge',
    pass: true,
    pr: pr.number,
    testedSource: pr.head.sha,
    mergedSource: pr.merge_commit_sha,
    sourceTree: commits[0].commit.tree.sha,
    stagingRun: runId,
    attempt,
    publicBytesUnchanged: true,
    method: 'Identical complete source trees; preserve the tested package without rebuilding',
  };
}

// PR body edits may start a fresh owning-policy run on the same source.
// Wait only for actual in-progress source admission, never missing/failed proof.
async function waitForAdmission(github, context, pr, runtime = {}) {
  const now = runtime.now || Date.now,
    delay = runtime.delay || ((ms) => new Promise((resolve) => setTimeout(resolve, ms))),
    deadline = now() + 240000;
  while (true) {
    try {
      return await requireAdmission(github, context, pr);
    } catch (error) {
      if (!error.message.includes('admission still running') || now() >= deadline) throw error;
      await delay(Math.min(5000, deadline - now()));
    }
  }
}

async function verifyPR(github, context, pr, main) {
  const flow = require('./review-flow.cjs');
  assert.equal(context.eventName, 'pull_request', 'eligible PR event required');
  assert.equal(context.actor, context.repo.owner, 'owner PR refresh required');
  assert.equal(context.payload.sender.login, context.repo.owner);
  assert.equal(context.payload.pull_request.number, pr.number);
  flow.lease(pr, context.payload.pull_request.head.sha);
  assert.equal(pr.base.ref, 'main');
  assert.equal(pr.base.repo.full_name, flow.repository);
  assert.equal(main.protected, true);
  assert.equal(pr.base.sha, main.commit.sha, 'current main changed');
  const proof = await stagingEvidence(github, context, pr);
  assert.equal(proof.run.head_sha, main.commit.sha, 'staging controller moved');
  assert.equal(proof.run.triggering_actor.login, context.repo.owner);
  const sourceAdmission = await waitForAdmission(github, context, pr);
  const comparison = (
    await github.rest.repos.compareCommitsWithBasehead({
      ...context.repo,
      basehead: main.commit.sha + '...' + pr.head.sha,
    })
  ).data;
  assert.equal(comparison.merge_base_commit.sha, main.commit.sha);
  assert.equal(comparison.behind_by, 0, 'update the PR from current main');
  assert.match(pr.merge_commit_sha, /^[a-f0-9]{40}$/, 'prospective merge not calculated');
  const commits = await Promise.all(
    [pr.head.sha, pr.merge_commit_sha].map(
      async (ref) => (await github.rest.repos.getCommit({ ...context.repo, ref })).data
    )
  );
  assert.equal(commits[0].commit.tree.sha, commits[1].commit.tree.sha, 'prospective tree differs');
  const currentMain = (await github.rest.repos.getBranch({ ...context.repo, branch: 'main' })).data;
  assert.equal(currentMain.protected, true);
  assert.equal(currentMain.commit.sha, main.commit.sha, 'main moved during verification');
  const currentPR = (await github.rest.pulls.get({ ...context.repo, pull_number: pr.number })).data;
  flow.lease(currentPR, pr.head.sha);
  assert.equal(currentPR.base.sha, main.commit.sha);
  assert.equal((await stagingEvidence(github, context, currentPR)).check.id, proof.check.id);
  return {
    schema: 1,
    kind: 'accepted-pr-staging',
    pass: true,
    pr: pr.number,
    testedSource: pr.head.sha,
    sourceTree: commits[0].commit.tree.sha,
    protectedMain: main.commit.sha,
    stagingRun: proof.runId,
    attempt: proof.attempt,
    checkpointCheck: proof.check.id,
    sourceAdmission,
    fullGate: false,
    productionEligible: false,
    deploymentAuthorized: false,
  };
}

module.exports = {
  routes,
  validateRun,
  requireAdmission,
  beginMergeAdmission,
  finishMergeAdmission,
  publishMergeAdmission,
  verifyMerge,
  stagingEvidence,
  waitForAdmission,
  verifyPR,
};
