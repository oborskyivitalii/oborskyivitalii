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
    data: {
      workflow_runs: [run(), { ...run(), id: 30, status: 'in_progress' }],
    },
  });
  await assert.rejects(admission.requireAdmission(api, context, pr()), /still running/);
  assert.equal(api.writes.length, 0);
});

test('merge admission is written only for current owner source accepted on Cloudflare', async () => {
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
    },
    id,
    '1'
  );
  assert.equal(api.writes[0].status, 'in_progress');
  assert.equal(api.writes[0].head_sha, source);
  assert.equal(result.conclusion, 'success');
  for (const outcomes of [{ promote: 'failure' }, { promote: 'skipped' }, {}]) {
    const rejected = github();
    await assert.rejects(
      admission.publishMergeAdmission(rejected, context, pr(), main, source, outcomes)
    );
    assert.equal(rejected.writes.length, 0);
  }
  await assert.rejects(
    admission.publishMergeAdmission(github(), context, pr(), main, mainSHA, {
      promote: 'success',
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
    { title: 'Failed promotion', summary: 'fixture' },
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
      { promote: 'success' },
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

test('actual merge identity requires the complete tested tree and the real latest Cloudflare admission', async () => {
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
  const jobs = ['promote', 'merge-admission'].map(job);
  let mergedTree = tree;
  const api = {
    rest: {
      repos: {
        getCommit: async ({ ref }) => ({
          data: {
            commit: { tree: { sha: ref === source ? tree : mergedTree } },
          },
        }),
      },
      checks: { listForRef: 'checks' },
      actions: {
        getWorkflowRun: async () => ({ data: r }),
        listJobsForWorkflowRunAttempt: 'jobs',
      },
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

test('Draft jobs cannot impersonate admission; issue5 real-article preview alone opts into bounded browser smoke', () => {
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
    /Install locked Chromium smoke tools\n\s+if: needs.target.outputs.prototype != 'true' \|\| needs.target.outputs.number == '79'\n/
  );
  assert.match(
    smoke,
    /Minimal two-width hosted rendition smoke\n\s+if: needs.target.outputs.prototype != 'true' \|\| needs.target.outputs.number == '79'\n/
  );
  const articlePreview = [...yaml.matchAll(/^ {6}SITE_ARTICLE_PREVIEW: (.+)$/gm)];
  assert.equal(articlePreview.length, 1);
  assert.equal(
    articlePreview[0][1],
    "${{ needs.target.outputs.prototype == 'true' && needs.target.outputs.number == '79' && 'true' || 'false' }}"
  );
  assert.doesNotMatch(
    yaml,
    /SITE_PAGES_STAGING_ENABLED|PAGES_RESULT|PAGES_ENABLED|needs\.pages|mirror-recovery|site-pages\.yml/
  );
  assert.equal(fs.existsSync('.github/workflows/site-pages.yml'), false);
  assert.match(yaml, /promote:process.env.PROMOTE_RESULT/);
  assert.match(yaml, /beginMergeAdmission/);
});

function stagedPRFixture() {
  const p = { ...pr(), merge_commit_sha: 'd'.repeat(40) };
  p.base.sha = mainSHA;
  const main = { protected: true, commit: { sha: mainSHA } };
  const c = {
    ...context,
    eventName: 'pull_request',
    payload: {
      action: 'edited',
      sender: { login: context.actor },
      pull_request: structuredClone(p),
    },
  };
  const checkpoint = {
    id: 30,
    name: 'Staging admission',
    head_sha: source,
    app: { id: 15368 },
    status: 'completed',
    conclusion: 'success',
    external_id: '900/1',
  };
  const checks = [
    checkpoint,
    { ...checkpoint, id: 40, external_id: undefined, status: 'in_progress' },
  ];
  const stagingRun = {
    id: 900,
    run_attempt: 1,
    path: flow.workflow,
    event: 'issue_comment',
    head_sha: mainSHA,
    head_branch: 'main',
    head_repository: { full_name: flow.repository },
    actor: { login: context.actor },
    triggering_actor: { login: context.actor },
    status: 'completed',
    conclusion: 'success',
  };
  const jobs = ['promote', 'merge-admission'].map(job),
    api = github();
  const sourcePaginate = api.paginate;
  api.paginate = async (method, args) => {
    if (method === 'staged-checks') {
      assert.equal(args.filter, 'all');
      return checks;
    }
    if (method === 'stage-jobs') return jobs;
    return sourcePaginate(method, args);
  };
  api.rest.checks.listForRef = 'staged-checks';
  api.rest.actions.listJobsForWorkflowRunAttempt = 'stage-jobs';
  api.rest.actions.getWorkflowRun = async () => ({ data: stagingRun });
  api.rest.repos.getCommit = async () => ({
    data: { commit: { tree: { sha: 'c'.repeat(40) } } },
  });
  api.rest.repos.getBranch = async () => ({ data: main });
  api.rest.pulls = { get: async () => ({ data: p }) };
  return { p, main, c, checkpoint, checks, stagingRun, jobs, api };
}

test('eligible read-only PR verification authenticates actual staged bytes without mistaking its own same-name job for proof', async () => {
  const f = stagedPRFixture(),
    record = await admission.verifyPR(f.api, f.c, f.p, f.main);
  assert.equal(record.kind, 'accepted-pr-staging');
  assert.equal(record.testedSource, source);
  assert.equal(record.sourceTree, 'c'.repeat(40));
  assert.equal(record.checkpointCheck, 30);
  assert.equal(record.stagingRun, 900);
  assert.equal(record.attempt, 1);
  assert.equal(record.sourceAdmission.length, 3);
  assert.equal(record.fullGate, false);
  assert.equal(record.productionEligible, false);
  assert.equal(record.deploymentAuthorized, false);
  assert.deepEqual(f.api.writes, []);
  f.p.merged = true;
  assert.equal((await admission.verifyMerge(f.api, f.c, f.p)).stagingRun, 900);
});

test('PR staging proof rejects stale source, actor, controller, attempt, jobs, current leases and a newer failed attempt', async () => {
  for (const mutate of [
    (f) => (f.c.eventName = 'issue_comment'),
    (f) => (f.c.actor = 'another-user'),
    (f) => (f.c.payload.sender.login = 'another-user'),
    (f) => (f.c.payload.pull_request.head.sha = mainSHA),
    (f) => (f.p.draft = true),
    (f) => (f.p.head.repo.full_name = 'another/repo'),
    (f) => (f.p.base.sha = source),
    (f) => (f.main.protected = false),
    (f) => (f.checks.length = 0),
    (f) => (f.checkpoint.app.id = 1),
    (f) => (f.checkpoint.conclusion = 'failure'),
    (f) =>
      f.checks.push({
        ...f.checkpoint,
        id: 50,
        external_id: '901/1',
        status: 'in_progress',
      }),
    (f) =>
      f.checks.push({
        ...f.checkpoint,
        id: 50,
        external_id: '901/1',
        conclusion: 'failure',
      }),
    (f) => (f.stagingRun.id = 901),
    (f) => (f.stagingRun.head_sha = source),
    (f) => (f.stagingRun.triggering_actor.login = 'another-user'),
    (f) => (f.stagingRun.run_attempt = 2),
    (f) => (f.stagingRun.status = 'in_progress'),
    (f) => (f.stagingRun.path = '.github/workflows/unrelated.yml'),
    (f) => (f.jobs[0].conclusion = 'skipped'),
    (f) => (f.jobs[1].conclusion = 'failure'),
    (f) =>
      (f.api.rest.actions.listWorkflowRuns = async () => ({
        data: { workflow_runs: [{ ...run(), conclusion: 'failure' }] },
      })),
    (f) =>
      (f.api.rest.repos.compareCommitsWithBasehead = async () => ({
        data: { merge_base_commit: { sha: mainSHA }, behind_by: 1 },
      })),
    (f) =>
      (f.api.rest.repos.getCommit = async ({ ref }) => ({
        data: { commit: { tree: { sha: ref } } },
      })),
    (f) =>
      (f.api.rest.repos.getBranch = async () => ({
        data: { protected: true, commit: { sha: source } },
      })),
    (f) =>
      (f.api.rest.pulls.get = async () => ({
        data: { ...f.p, head: { ...f.p.head, sha: mainSHA } },
      })),
    (f) => {
      const paginate = f.api.paginate;
      let reads = 0;
      f.api.paginate = async (method, args) => {
        if (method === 'staged-checks' && ++reads > 1) f.checkpoint.conclusion = 'failure';
        return paginate(method, args);
      };
    },
  ]) {
    const f = stagedPRFixture();
    mutate(f);
    await assert.rejects(admission.verifyPR(f.api, f.c, f.p, f.main));
    assert.deepEqual(f.api.writes, []);
  }
});

test('source-admission refresh waits boundedly for running jobs but never retries missing or failed evidence', async () => {
  let clock = 0,
    pauses = 0;
  const runtime = {
    now: () => clock,
    delay: async (ms) => {
      assert.ok(ms <= 5000);
      clock += ms;
      pauses++;
    },
  };
  const running = github((r) => {
    if (clock < 10000) r.status = 'in_progress';
  });
  assert.equal((await admission.waitForAdmission(running, context, pr(), runtime)).length, 3);
  assert.equal(clock, 10000);
  assert.equal(pauses, 2);
  for (const conclusion of ['failure', 'skipped']) {
    const failed = github((r) => (r.conclusion = conclusion));
    await assert.rejects(admission.waitForAdmission(failed, context, pr(), runtime));
    assert.equal(pauses, 2);
  }
  const missing = github();
  missing.rest.actions.listWorkflowRuns = async () => ({
    data: { workflow_runs: [] },
  });
  await assert.rejects(admission.waitForAdmission(missing, context, pr(), runtime));
  assert.equal(pauses, 2);
  clock = 0;
  await assert.rejects(
    admission.waitForAdmission(
      github((r) => (r.status = 'in_progress')),
      context,
      pr(),
      runtime
    )
  );
  assert.equal(clock, 240000);
});

test('repository App outage uses only the complete protected full-route proof', async () => {
  const f = stagedPRFixture();
  // App API is unavailable, while the existing main-owned stage proof remains genuine.
  f.api.rest.checks.listForRef = async () => {
    throw Error('App unavailable');
  };
  const original = f.api.paginate;
  f.api.paginate = async (method, args) =>
    method === f.api.rest.checks.listForRef ? f.checks : original(method, args);
  const record = await admission.verifyRepositoryPR(f.api, f.c, f.p, f.main);
  assert.equal(record.admissionMode, 'full-route-recovery');
  assert.equal(record.stagingRun, 900);
  f.p.merged = true;
  assert.equal(
    (await admission.verifyMerge(f.api, f.c, f.p, mainSHA)).admissionMode,
    'full-route-recovery'
  );
  f.p.merged = false;
  f.checkpoint.conclusion = 'failure';
  await assert.rejects(admission.verifyRepositoryPR(f.api, f.c, f.p, f.main));
});

test('manual evaluation revokes and completes only its own source-bound aggregate', async () => {
  const previous = process.env.GITHUB_RUN_ATTEMPT;
  process.env.GITHUB_RUN_ATTEMPT = '2';
  try {
    const p = pr();
    p.base.sha = mainSHA;
    let check;
    const writes = [];
    const api = {
      rest: {
        checks: {
          create: async (body) => ({ data: (check = { ...body, id: 901, app: { id: 15368 } }) }),
          get: async () => ({ data: check }),
          update: async (body) => {
            writes.push(body);
            return body;
          },
        },
        pulls: { get: async () => ({ data: p }) },
        repos: { getBranch: async () => ({ data: { protected: true, commit: { sha: mainSHA } } }) },
      },
    };
    const id = await admission.beginChangeAdmission(api, context, p);
    assert.equal(check.status, 'in_progress');
    assert.equal(
      (await admission.finishChangeAdmission(api, context, p.number, source, id, false)).conclusion,
      'failure'
    );
    assert.equal(
      (await admission.finishChangeAdmission(api, context, p.number, source, id, true)).conclusion,
      'success'
    );
    p.head.sha = mainSHA;
    assert.equal(
      (await admission.finishChangeAdmission(api, context, p.number, source, id, true)).conclusion,
      'failure'
    );
    check.external_id = 'another-request';
    const count = writes.length;
    await assert.rejects(admission.finishChangeAdmission(api, context, p.number, source, id, true));
    assert.equal(writes.length, count);
  } finally {
    if (previous === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
    else process.env.GITHUB_RUN_ATTEMPT = previous;
  }
});
