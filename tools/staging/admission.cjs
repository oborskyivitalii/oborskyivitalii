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

async function publishMergeAdmission(github, context, pr, main, expectedSource, outcomes) {
  const flow = require('./review-flow.cjs');
  flow.controller(context, main);
  assert.equal(context.actor, context.repo.owner);
  flow.lease(pr, expectedSource);
  assert.equal(pr.base.ref, 'main');
  assert.equal(pr.base.repo.full_name, flow.repository);
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
  assert.equal(outcomes.pages, 'success', 'Pages mirror must be activated and verified');
  return github.rest.checks.create({
    ...context.repo,
    name: 'Staging admission',
    head_sha: expectedSource,
    status: 'completed',
    conclusion: 'success',
    details_url: 'https://github.com/' + flow.repository + '/actions/runs/' + context.runId,
    output: {
      title: 'Exact PR source accepted on both staging hosts',
      summary:
        'Source admission: ' +
        evidence.map((item) => item.workflowRun + '/' + item.attempt).join(', ') +
        '. Protected main: ' +
        main.commit.sha +
        '. This result does not authorize production.',
    },
  });
}

module.exports = { routes, validateRun, requireAdmission, publishMergeAdmission };
