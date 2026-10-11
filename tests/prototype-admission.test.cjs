'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const flow = require('../tools/staging/review-flow.cjs');
const admission = require('../tools/staging/admission.cjs');
const source = 'a'.repeat(40),
  mainSHA = 'b'.repeat(40);
const context = {
  repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
  actor: 'oborskyivitalii',
  eventName: 'workflow_dispatch',
  ref: 'refs/heads/main',
  sha: mainSHA,
  runId: 900,
};
function pr(draft = false) {
  return {
    number: 73,
    state: 'open',
    draft,
    head: { sha: source, repo: { full_name: flow.repository } },
    base: { ref: 'main', repo: { full_name: flow.repository } },
  };
}
function run() {
  return {
    id: 10,
    run_attempt: 1,
    head_sha: source,
    event: 'pull_request',
    head_repository: { full_name: flow.repository },
    pull_requests: [{ number: 73 }],
    status: 'completed',
    conclusion: 'success',
  };
}
function job(name) {
  return { id: 20, name, status: 'completed', conclusion: 'success' };
}
function github(mutator = () => {}) {
  const writes = [];
  return {
    writes,
    paginate: async (_method, args) => [job(admission.routes[args.run_id - 10][1])],
    rest: {
      actions: {
        listWorkflowRuns: async ({ workflow_id }) => {
          const result = run();
          result.id += admission.routes.findIndex(([file]) => file === workflow_id);
          mutator(result);
          return { data: { workflow_runs: [result] } };
        },
        listJobsForWorkflowRun: () => {},
      },
      repos: {
        compareCommitsWithBasehead: async () => ({
          data: { merge_base_commit: { sha: mainSHA }, behind_by: 0 },
        }),
      },
      checks: {
        create: async (value) => {
          writes.push(value);
          return { data: { ...value, id: 30 } };
        },
        get: async () => ({ data: { ...writes[0], id: 30 } }),
        update: async (value) => {
          writes.push(value);
          return value;
        },
      },
    },
  };
}

test('Draft iterations use prototype mode while explicit stage evidence retains regression', () => {
  const p = pr(true),
    c = {
      ...context,
      eventName: 'pull_request',
      payload: { action: 'synchronize', pull_request: p },
    };
  assert.equal(flow.resolve(c, p).prototype, true);
  p.draft = false;
  assert.equal(flow.resolve(c, p).prototype, false);
  p.draft = true;
  Object.assign(c.payload, {
    action: 'labeled',
    label: { name: 'staging-regression' },
    sender: { login: context.actor },
  });
  assert.equal(flow.resolve(c, p).prototype, false);
});

test('admission rejects skipped, missing, stale, forked, running and failed jobs', () => {
  assert.equal(admission.validateRun(run(), [job('checks')], source, 73, 'checks').source, source);
  for (const mutate of [
    (r, jobs) => {
      jobs[0].conclusion = 'skipped';
    },
    (r, jobs) => {
      jobs.length = 0;
    },
    (r, jobs) => {
      jobs.push(job('checks'));
    },
    (r) => {
      r.head_sha = mainSHA;
    },
    (r) => {
      r.head_repository.full_name = 'other/repo';
    },
    (r) => {
      r.pull_requests = [{ number: 74 }];
    },
    (r) => {
      r.event = 'push';
    },
    (r) => {
      r.status = 'in_progress';
    },
    (r) => {
      r.conclusion = 'failure';
    },
  ]) {
    const r = run(),
      jobs = [job('checks')];
    mutate(r, jobs);
    assert.throws(() => admission.validateRun(r, jobs, source, 73, 'checks'));
  }
});

test('all exact source workflows must finish before owner staging', async () => {
  assert.equal((await admission.requireAdmission(github(), context, pr())).length, 3);
  await assert.rejects(
    admission.requireAdmission(github(), context, pr(true)),
    /mark the PR ready/
  );
  const api = github();
  api.rest.actions.listWorkflowRuns = async () => ({
    data: { workflow_runs: [run(), { ...run(), id: 30, status: 'in_progress' }] },
  });
  await assert.rejects(admission.requireAdmission(api, context, pr()), /still running/);
  assert.equal(api.writes.length, 0);
});

test('merge admission is written only for current owner source accepted on both hosts', async () => {
  const main = { protected: true, commit: { sha: mainSHA } },
    api = github();
  const id = await admission.beginMergeAdmission(api, context, pr(), main, '1');
  const result = await admission.publishMergeAdmission(
    api,
    context,
    pr(),
    main,
    source,
    {
      promote: 'success',
      pages: 'success',
    },
    id,
    '1'
  );
  assert.equal(api.writes[0].status, 'in_progress');
  assert.equal(api.writes[0].head_sha, source);
  assert.equal(result.conclusion, 'success');
  for (const outcomes of [
    { promote: 'failure', pages: 'success' },
    { promote: 'success', pages: 'skipped' },
  ]) {
    const rejected = github();
    await assert.rejects(
      admission.publishMergeAdmission(rejected, context, pr(), main, source, outcomes)
    );
    assert.equal(rejected.writes.length, 0);
  }
  await assert.rejects(
    admission.publishMergeAdmission(github(), context, pr(), main, mainSHA, {
      promote: 'success',
      pages: 'success',
    }),
    /head moved/
  );
  const behind = github();
  behind.rest.repos.compareCommitsWithBasehead = async () => ({
    data: { merge_base_commit: { sha: source }, behind_by: 1 },
  });
  await assert.rejects(
    admission.publishMergeAdmission(behind, context, pr(), main, source, {
      promote: 'success',
      pages: 'success',
    }),
    /current main/
  );
  assert.equal(behind.writes.length, 0);
});

test('a fresh staging attempt supersedes old success and failure completes only its own check', async () => {
  const api = github(),
    main = { protected: true, commit: { sha: mainSHA } };
  const id = await admission.beginMergeAdmission(api, context, pr(), main, '1');
  assert.equal(api.writes[0].status, 'in_progress');
  assert.equal(api.writes[0].external_id, '900/1');
  await admission.finishMergeAdmission(
    api,
    context,
    source,
    id,
    'failure',
    { title: 'Failed mirror', summary: 'fixture' },
    '1'
  );
  assert.equal(api.writes[1].conclusion, 'failure');
  await assert.rejects(
    admission.finishMergeAdmission(api, { ...context, runId: 901 }, source, id, 'success', {}, '1')
  );
  await assert.rejects(
    admission.finishMergeAdmission(api, context, mainSHA, id, 'success', {}, '1')
  );
  assert.equal(api.writes.length, 2);
});

test('rerun admission uses the actual environment attempt and rejects missing or invalid identity', async () => {
  const main = { protected: true, commit: { sha: mainSHA } };
  const previousAttempt = process.env.GITHUB_RUN_ATTEMPT;
  try {
    process.env.GITHUB_RUN_ATTEMPT = '2';
    const api = github();
    const id = await admission.beginMergeAdmission(api, context, pr(), main);
    assert.equal(api.writes[0].external_id, '900/2');
    await assert.rejects(
      admission.finishMergeAdmission(api, context, source, id, 'success', {}, '1')
    );
    assert.equal(api.writes.length, 1);
    await admission.publishMergeAdmission(
      api,
      context,
      pr(),
      main,
      source,
      { promote: 'success', pages: 'success' },
      id
    );
    assert.equal(api.writes[1].conclusion, 'success');
    assert.equal(api.writes[0].external_id, '900/2');
    for (const attempt of [undefined, '', '0', '-1', '1.5', '2x']) {
      if (attempt === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
      else process.env.GITHUB_RUN_ATTEMPT = attempt;
      const rejected = github();
      await assert.rejects(
        admission.beginMergeAdmission(rejected, { ...context, runAttempt: 1 }, pr(), main)
      );
      assert.equal(rejected.writes.length, 0);
    }
  } finally {
    if (previousAttempt === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
    else process.env.GITHUB_RUN_ATTEMPT = previousAttempt;
  }
});

test('actual merge identity requires the complete tested tree and the real latest two-host admission', async () => {
  const tree = 'c'.repeat(40),
    check = {
      id: 30,
      name: 'Staging admission',
      head_sha: source,
      app: { id: 15368 },
      status: 'completed',
      conclusion: 'success',
      external_id: '900/1',
    };
  const r = {
    id: 900,
    run_attempt: 1,
    path: flow.workflow,
    event: 'workflow_dispatch',
    head_branch: 'main',
    head_repository: { full_name: flow.repository },
    actor: { login: context.actor },
    status: 'completed',
    conclusion: 'success',
  };
  const jobs = ['promote', 'pages / Pages publication', 'merge-admission'].map(job);
  let mergedTree = tree;
  const api = {
    rest: {
      repos: {
        getCommit: async ({ ref }) => ({
          data: { commit: { tree: { sha: ref === source ? tree : mergedTree } } },
        }),
      },
      checks: { listForRef: 'checks' },
      actions: { getWorkflowRun: async () => ({ data: r }), listJobsForWorkflowRunAttempt: 'jobs' },
    },
    paginate: async (method) => (method === 'checks' ? [check] : jobs),
  };
  const p = { ...pr(), merged: true, merge_commit_sha: mainSHA };
  const record = await admission.verifyMerge(api, context, p);
  assert.equal(record.publicBytesUnchanged, true);
  assert.equal(record.testedSource, source);
  check.external_id = '900/2';
  r.run_attempt = 2;
  assert.equal((await admission.verifyMerge(api, context, p)).attempt, 2);
  check.external_id = '900/1';
  r.run_attempt = 1;
  mergedTree = mainSHA;
  await assert.rejects(admission.verifyMerge(api, context, p), /tree differs/);
  mergedTree = tree;
  for (const mutate of [
    () => (check.conclusion = 'failure'),
    () => (check.app.id = 1),
    () => (r.run_attempt = 2),
    () => (r.path = '.github/workflows/other.yml'),
    () => (jobs[1].conclusion = 'skipped'),
  ]) {
    mutate();
    await assert.rejects(admission.verifyMerge(api, context, p));
    check.conclusion = 'success';
    check.app.id = 15368;
    r.run_attempt = 1;
    r.path = flow.workflow;
    jobs[1].conclusion = 'success';
  }
});

test('Draft jobs cannot impersonate required contexts and browser installation is deferred', () => {
  for (const [file, deferred] of [
    ['site-checks.yml', 'Prototype source admission deferred'],
    ['navigation.yml', 'Prototype RI admission deferred'],
  ]) {
    const yaml = fs.readFileSync('.github/workflows/' + file, 'utf8');
    assert.ok(yaml.includes(deferred));
    assert.match(
      yaml,
      /if: github.event_name != 'pull_request' \|\| github.event.pull_request.draft == false/
    );
    assert.match(yaml, /ready_for_review/);
  }
  const yaml = fs.readFileSync('.github/workflows/site-color-review.yml', 'utf8');
  const smoke = yaml.slice(yaml.indexOf('  smoke:'), yaml.indexOf('  stage-evidence:'));
  assert.match(
    smoke,
    /Install locked Chromium smoke tools\n\s+if: needs.target.outputs.prototype != 'true'/
  );
  assert.match(
    smoke,
    /Minimal two-width hosted rendition smoke\n\s+if: needs.target.outputs.prototype != 'true'/
  );
  assert.match(yaml, /PAGES_RESULT: \$\{\{ needs.pages.result \}\}/);
  assert.match(yaml, /pages:process.env.PAGES_RESULT/);
  assert.match(yaml, /beginMergeAdmission/);
});
