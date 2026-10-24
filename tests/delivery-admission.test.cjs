'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const admission = require('../tools/quality/delivery-admission.cjs');
const issuing = require('../tools/quality/delivery-admission-issuer.cjs');
const base = 'a'.repeat(40),
  source = 'b'.repeat(40);
function run(id = 20) {
  return {
    id,
    workflow_id: 9,
    path: '.github/workflows/site-color-review.yml',
    run_attempt: 2,
    head_sha: base,
    head_branch: 'main',
    head_repository: { full_name: admission.repository },
    event: 'issue_comment',
    actor: { login: 'oborskyivitalii' },
    triggering_actor: { login: 'oborskyivitalii' },
    status: 'completed',
    conclusion: 'success',
    pull_requests: [{ number: 122 }],
  };
}
function job(name, id = 30, runId = 20) {
  return {
    name,
    id,
    run_id: runId,
    run_attempt: 2,
    status: 'completed',
    conclusion: 'success',
  };
}
function proof() {
  const r = run(),
    j = job('change-admission-receipt');
  j.steps = [{ name: admission.receiptStep, status: 'completed', conclusion: 'success' }];
  const artifact = {
    id: 40,
    name: admission.receiptName(122, source, base, 20, 2),
    expired: false,
    digest: 'sha256:' + 'c'.repeat(64),
    workflow_run: { id: 20, head_sha: base },
  };
  return { r, j, artifact, pr: { number: 122, head: { sha: source } } };
}
function snapshot() {
  return {
    state: 'eligible-snapshot',
    candidate: { commit: source },
    controller: { commit: base },
    policy: { digest: 'd'.repeat(64) },
    evidence: [{ run: 20, attempt: 2 }],
    authority: { merge: false },
    freshness: 'Observed snapshot only.',
  };
}
test('closed execution definitions reject no-op wrappers, changed modes and both rename endpoints', () => {
  const entry = { mode: '100644', object: base };
  const before = new Map([
    ['tools/quality/local.cjs', entry],
    ['README.md', entry],
  ]);
  assert.deepEqual(admission.definitions(before, before).changed, []);
  for (const file of [
    'tools/quality/local.cjs',
    'tests/guard.test.cjs',
    '.github/workflows/site-checks.yml',
    '.github/actions/run/action.yml',
    '.github/acceptance/issue-122.json',
    '.github/code-style.json',
    '.github/ri-ci-map.json',
    '.npmrc',
    'requirements-ci.txt',
    'eslint.config.cjs',
  ]) {
    const after = new Map(before);
    after.set(file, { ...entry, object: source });
    assert.ok(admission.definitions(before, after).changed.includes(file), file);
  }
  const renamed = new Map(before);
  renamed.delete('tools/quality/local.cjs');
  renamed.set('tools/quality/renamed.cjs', entry);
  assert.deepEqual(admission.definitions(before, renamed).changed, [
    'tools/quality/local.cjs',
    'tools/quality/renamed.cjs',
  ]);
  const mode = new Map(before);
  mode.set('tools/quality/local.cjs', { ...entry, mode: '100755' });
  assert.equal(admission.definitions(before, mode).changed.length, 1);
  const docs = new Map(before);
  docs.set('README.md', { ...entry, object: source });
  assert.deepEqual(admission.definitions(before, docs).changed, []);
  docs.set('site/link', { ...entry, mode: '120000' });
  assert.throws(() => admission.definitions(before, docs), /unsupported source mode/);
});
test('empty execution inventory is never trusted', () => {
  assert.throws(() => admission.definitions(new Map(), new Map()), /empty/);
});
test('required job accounting rejects incomplete, unsuccessful, foreign and mixed attempts', () => {
  assert.equal(admission.completeJobs(run(), [job('checks')], ['checks']).length, 1);
  const cases = [
    (r) => {
      r.status = 'in_progress';
    },
    (r) => {
      r.conclusion = 'failure';
    },
    (r, jobs) => {
      jobs.pop();
    },
    (r, jobs) => {
      jobs.push({ ...jobs[0], id: 31 });
    },
    (r, jobs) => {
      jobs.push({ ...jobs[0] });
    },
    (r, jobs) => {
      jobs[0].run_id = 21;
    },
    (r, jobs) => {
      jobs[0].run_attempt = 1;
    },
    ...['skipped', 'cancelled', 'neutral', 'failure', 'timed_out'].map((state) => (r, jobs) => {
      jobs[0].conclusion = state;
    }),
  ];
  for (const mutate of cases) {
    const r = run(),
      jobs = [job('checks')];
    mutate(r, jobs);
    assert.throws(() => admission.completeJobs(r, jobs, ['checks']));
  }
  assert.throws(() => admission.completeJobs(run(), [job('A')], ['A', 'B']), /missing/);
});
test('a copied receipt name cannot replace its successful independent producer and upload', () => {
  const { r, j, artifact, pr } = proof();
  assert.equal(admission.stageReceipt([artifact], r, [j], pr, base).id, 40);
  for (const mutate of [
    (a) => {
      a.name = a.name.replace(source, 'd'.repeat(40));
    },
    (a) => {
      a.expired = true;
    },
    (a) => {
      a.digest = null;
    },
    (a) => {
      a.workflow_run.id += 1;
    },
    (a) => {
      a.workflow_run.head_sha = source;
    },
    (a, item) => {
      item.steps = [];
    },
    (a, item) => {
      item.steps[0].conclusion = 'failure';
    },
    (a, item) => {
      item.steps.push({ ...item.steps[0] });
    },
  ]) {
    const p = proof();
    mutate(p.artifact, p.j);
    assert.throws(() => admission.stageReceipt([p.artifact], p.r, [p.j], p.pr, base));
  }
  assert.throws(
    () => admission.stageReceipt([artifact, { ...artifact, id: 41 }], r, [j], pr, base),
    /ambiguous/
  );
  assert.throws(
    () => admission.stageReceipt([artifact], { ...r, run_attempt: 3 }, [j], pr, base),
    /missing/
  );
  // Collision cannot become accepted by ignoring the producer's failed upload.
  const failed = { ...r, conclusion: 'failure' };
  assert.throws(() => admission.completeJobs(failed, [j], ['change-admission-receipt']), /failed/);
});
test('pagination is complete, bounded and rejects duplicates or truncated results', async () => {
  const rows = Array.from({ length: 101 }, (_, i) => ({ id: i + 1 }));
  const calls = [];
  const method = async ({ page, per_page }) => {
    calls.push(page);
    assert.equal(per_page, 100);
    return {
      data: {
        jobs: rows.slice((page - 1) * 100, page * 100),
        total_count: rows.length,
      },
    };
  };
  assert.equal((await admission.pages(method, {}, 'jobs')).length, 101);
  assert.deepEqual(calls, [1, 2]);
  for (const data of [
    { jobs: [], total_count: 1 },
    { jobs: rows, total_count: 1001 },
    { jobs: [{ id: 1 }, { id: 1 }], total_count: 2 },
    { jobs: [], total_count: undefined },
  ]) {
    await assert.rejects(admission.pages(async () => ({ data }), {}, 'jobs'));
  }
});
test('selected source evidence uses workflow identity and exact attempt endpoint', async () => {
  const r = {
    ...run(),
    workflow_id: 9,
    path: '.github/workflows/site-checks.yml',
    head_sha: source,
    event: 'pull_request',
  };
  const args = [];
  const github = {
    rest: {
      actions: {
        getWorkflow: async () => ({ data: { id: 9, path: r.path } }),
        listWorkflowRuns: async () => ({
          data: { workflow_runs: [r], total_count: 1 },
        }),
        listJobsForWorkflowRunAttempt: async (input) => {
          args.push(input);
          return { data: { jobs: [job('checks')], total_count: 1 } };
        },
      },
    },
  };
  const pr = { number: 122, head: { sha: source } };
  const collect = () => admission.selectedRun(github, {}, pr, 'site-checks.yml', ['checks']);
  assert.equal((await collect()).attempt, 2);
  assert.equal(args[0].attempt_number, 2);
  for (const [key, value] of [
    ['event', 'push'],
    ['head_sha', base],
    ['workflow_id', 99],
    ['path', '.github/workflows/forged.yml'],
  ]) {
    const previous = r[key];
    r[key] = value;
    await assert.rejects(collect());
    r[key] = previous;
  }
  r.run_attempt = 3;
  await assert.rejects(collect(), /mixed job attempts/);
});
test('latest genuine failed/running staging supersedes an older green; ordinary comments are ignored', async () => {
  const recent = run(21),
    old = run(20);
  let recentTarget = 'skipped';
  const github = {
    rest: {
      actions: {
        getWorkflow: async () => ({ data: { id: 9, path: old.path } }),
        listWorkflowRuns: async () => ({
          data: { workflow_runs: [old, recent], total_count: 2 },
        }),
        listJobsForWorkflowRunAttempt: async ({ run_id }) => ({
          data: {
            total_count: 1,
            jobs: [
              {
                ...job('target', run_id + 10, run_id),
                conclusion: run_id === 21 ? recentTarget : 'success',
              },
            ],
          },
        }),
      },
    },
  };
  assert.equal((await admission.latestStage(github, {}, base)).run.id, 20);
  recentTarget = 'success';
  recent.conclusion = 'failure';
  let selected = await admission.latestStage(github, {}, base);
  assert.equal(selected.run.id, 21);
  assert.throws(() => admission.completeJobs(selected.run, selected.jobs, ['target']), /failed/);
  recent.status = 'in_progress';
  selected = await admission.latestStage(github, {}, base);
  assert.equal(selected.run.id, 21);
  assert.throws(() => admission.completeJobs(selected.run, selected.jobs, ['target']), /running/);
});
test('observed head, policy and attempt changes invalidate publication', () => {
  const before = snapshot();
  admission.sameSnapshot(before, snapshot());
  for (const mutate of [
    (r) => {
      r.candidate.commit = base;
    },
    (r) => {
      r.policy.digest = 'e'.repeat(64);
    },
    (r) => {
      r.evidence[0].attempt = 3;
    },
    (r) => {
      r.state = 'blocked';
    },
  ]) {
    const after = snapshot();
    mutate(after);
    assert.throws(() => admission.sameSnapshot(before, after));
  }
});
test('cancelled skipped targets and dispatch skips cannot reuse older green staging', async () => {
  const recent = run(21),
    old = run(20);
  const jobs = [{ ...job('target', 31, 21), conclusion: 'skipped' }];
  const github = {
    rest: {
      actions: {
        getWorkflow: async () => ({ data: { id: 9, path: old.path } }),
        listWorkflowRuns: async () => ({
          data: { workflow_runs: [old, recent], total_count: 2 },
        }),
        listJobsForWorkflowRunAttempt: async ({ run_id }) => ({
          data: {
            jobs: run_id === 21 ? jobs : [job('target')],
            total_count: run_id === 21 ? jobs.length : 1,
          },
        }),
      },
    },
  };
  for (const event of ['issue_comment', 'workflow_dispatch']) {
    for (const conclusion of ['cancelled', 'failure']) {
      Object.assign(recent, { event, conclusion });
      const selected = await admission.latestStage(github, {}, base);
      assert.equal(selected.run.id, 21, event + '/' + conclusion);
      assert.throws(() => admission.completeJobs(selected.run, selected.jobs, ['target']));
    }
  }
  Object.assign(recent, { event: 'workflow_dispatch', conclusion: 'success' });
  assert.equal((await admission.latestStage(github, {}, base)).run.id, 21);
  Object.assign(recent, { event: 'issue_comment', conclusion: 'success' });
  jobs.push(job('ambiguous executed branch', 32, 21));
  assert.equal((await admission.latestStage(github, {}, base)).run.id, 21);
  jobs.pop();
  assert.equal((await admission.latestStage(github, {}, base)).run.id, 20);
});
test('authentication revokes minted tokens after readback request or scope validation fails', async () => {
  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  for (const failure of ['http', 'scope', 'revocation-unreachable']) {
    const calls = [];
    const request = async (url, input) => {
      calls.push({ url, method: input.method });
      if (input.method === 'DELETE') {
        if (failure === 'revocation-unreachable') throw Error('network unavailable');
        return { ok: true, status: 204 };
      }
      const data = url.endsWith('/app')
        ? { id: 50 }
        : url.endsWith('/app/installations/60')
          ? {
              app_id: 50,
              account: { login: 'oborskyivitalii' },
              repository_selection: 'selected',
              permissions: {
                checks: 'write',
                statuses: 'write',
                metadata: 'read',
              },
            }
          : url.endsWith('/access_tokens')
            ? { token: 'synthetic-token' }
            : { total_count: 2, repositories: [] };
      return {
        ok: !(failure === 'http' && url.endsWith('/installation/repositories')),
        status: failure === 'http' && url.endsWith('/installation/repositories') ? 503 : 200,
        json: async () => data,
      };
    };
    await assert.rejects(
      issuing.authenticate({ app: 50, installation: 60, privateKey }, 70, request),
      failure === 'http' ? /HTTP 503/ : /repository-scoped/
    );
    assert.equal(calls.at(-1).method, 'DELETE');
    assert.equal(calls.at(-1).url, 'https://api.github.com/installation/token');
  }
});
test('diagnostic retention failure cannot prevent terminal failure publication', async () => {
  const previous = process.env.GITHUB_RUN_ATTEMPT;
  process.env.GITHUB_RUN_ATTEMPT = '2';
  try {
    for (const missingEvidence of [true, false]) {
      const issuer = fakeIssuer();
      await assert.rejects(
        issuing.publish(
          issuer,
          { runId: 90, sha: base },
          122,
          source,
          async () => {
            if (missingEvidence) throw Error('required evidence missing');
            return snapshot();
          },
          async () => {
            throw Error('report disk unavailable');
          }
        ),
        missingEvidence ? /required evidence missing/ : /report disk unavailable/
      );
      assert.equal(issuer.writes[0].status, 'in_progress');
      assert.equal(issuer.writes.at(-1).status, 'completed');
      assert.equal(issuer.writes.at(-1).conclusion, 'failure');
      assert.ok(!issuer.writes.some((item) => item.conclusion === 'success'));
    }
  } finally {
    if (previous === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
    else process.env.GITHUB_RUN_ATTEMPT = previous;
  }
});
test('missing or disabled configuration never falls back to the Actions issuer', () => {
  assert.equal(issuing.configuration({}), null);
  assert.equal(issuing.configuration({ CHANGE_ADMISSION_ENABLED: 'false' }), null);
  assert.throws(() => issuing.configuration({ CHANGE_ADMISSION_ENABLED: 'true' }));
});
test('App JWT uses the configured RSA identity and bounded lifetime', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const token = issuing.jwt({ app: 50, privateKey }, 1000);
  const [header, payload, signature] = token.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(payload, 'base64url')), {
    iat: 940,
    exp: 1300,
    iss: '50',
  });
  assert.equal(
    crypto.verify(
      'RSA-SHA256',
      Buffer.from(header + '.' + payload),
      publicKey,
      Buffer.from(signature, 'base64url')
    ),
    true
  );
});
test('App authentication scopes token and rejects unexpected issuer or installation permissions', async () => {
  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const config = { app: 50, installation: 60, privateKey };
  const calls = [];
  const installation = {
    app_id: 50,
    account: { login: 'oborskyivitalii' },
    repository_selection: 'selected',
    permissions: { checks: 'write', statuses: 'write', metadata: 'read' },
  };
  const request = async (url, input) => {
    calls.push({ url, input });
    const data = url.endsWith('/app')
      ? { id: 50 }
      : url.endsWith('/app/installations/60')
        ? installation
        : url.endsWith('/access_tokens')
          ? { token: 'synthetic-token' }
          : {
              total_count: 1,
              repositories: [{ id: 70, full_name: admission.repository }],
            };
    return { ok: true, status: 200, json: async () => data };
  };
  assert.equal((await issuing.authenticate(config, 70, request)).app, 50);
  assert.deepEqual(JSON.parse(calls[2].input.body), {
    repository_ids: [70],
    permissions: { checks: 'write', statuses: 'write' },
  });
  installation.permissions.contents = 'write';
  await assert.rejects(issuing.authenticate(config, 70, request), /unexpected App permission/);
});
function fakeIssuer() {
  const writes = [];
  let record;
  return {
    writes,
    app: 50,
    create: async (body) => {
      record = { ...body, id: 80, app: { id: 50 } };
      writes.push(body);
      return record;
    },
    get: async () => record,
    update: async (id, body) => {
      assert.equal(id, 80);
      writes.push(body);
      return body;
    },
  };
}
test('manual admission selects one owner PR and has no automatic workflow triggers', async () => {
  const context = {
    repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
    ref: 'refs/heads/main',
    sha: base,
    eventName: 'workflow_dispatch',
    actor: 'oborskyivitalii',
    payload: { inputs: { pr_number: '79' } },
  };
  const github = {
    rest: { pulls: { list: () => assert.fail('must not list other PRs') } },
  };
  assert.deepEqual(await admission.targets(github, context), [79]);
  for (const eventName of ['push', 'workflow_run', 'issue_comment']) {
    await assert.rejects(admission.targets(github, { ...context, eventName }), /manual dispatch/);
  }
  await assert.rejects(
    admission.targets(github, { ...context, actor: 'other-owner' }),
    /only owner/
  );
  await assert.rejects(
    admission.targets(github, { ...context, ref: 'refs/heads/candidate' }),
    /main/
  );
  await assert.rejects(
    admission.targets(github, {
      ...context,
      payload: { inputs: { pr_number: '79,117' } },
    })
  );
  const workflow = fs.readFileSync(
    path.join(__dirname, '../.github/workflows/change-admission.yml'),
    'utf8'
  );
  const triggers = workflow.match(/^on:\n([\s\S]*?)^permissions:/m)[1];
  assert.deepEqual(
    [...triggers.matchAll(/^  ([a-z_]+):$/gm)].map((match) => match[1]),
    ['workflow_dispatch']
  );
});
test('ordinary evidence refusals keep a failed App check while controller and storage faults reject', async () => {
  const previous = process.env.GITHUB_RUN_ATTEMPT;
  process.env.GITHUB_RUN_ATTEMPT = '2';
  try {
    const refusals = [
      () =>
        admission.completeJobs(
          { ...run(), status: 'in_progress', conclusion: null },
          [],
          ['checks']
        ),
      () => admission.completeJobs(run(), [], ['checks']),
      () =>
        admission.completeJobs(run(), [{ ...job('checks'), conclusion: 'failure' }], ['checks']),
      () => ({ ...snapshot(), state: 'blocked', blockers: ['Draft-deferred'] }),
    ];
    for (const evaluate of refusals) {
      const issuer = fakeIssuer(),
        reports = [];
      const result = await issuing.publish(
        issuer,
        { runId: 90, sha: base },
        122,
        source,
        async () => evaluate(),
        async (report) => reports.push(report)
      );
      assert.equal(result.conclusion, 'failure');
      assert.match(result.output.summary, /Next:/);
      assert.equal(reports[0].candidate.commit, source);
      assert.ok(!issuer.writes.some((item) => item.conclusion === 'success'));
    }
    for (const evaluate of [
      () => {
        throw Error('API unavailable');
      },
      () => admission.completeJobs(run(), [{ ...job('checks'), run_id: 99 }], ['checks']),
      () => admission.completeJobs({ ...run(), status: 'unexpected' }, [], ['checks']),
      () => ({ ...snapshot(), candidate: { commit: 'not-a-sha' } }),
    ]) {
      const issuer = fakeIssuer();
      await assert.rejects(
        issuing.publish(
          issuer,
          { runId: 90, sha: base },
          122,
          source,
          async () => evaluate(),
          async () => {}
        )
      );
      assert.equal(issuer.writes.at(-1).conclusion, 'failure');
      assert.equal(issuer.writes.at(-1).output.title, 'Admission controller failed');
    }
    for (const field of ['candidate', 'controller']) {
      const issuer = fakeIssuer();
      let reads = 0;
      await assert.rejects(
        issuing.publish(
          issuer,
          { runId: 90, sha: base },
          122,
          source,
          async () => {
            const report = snapshot();
            if (++reads === 2) report[field].commit = 'not-a-sha';
            return report;
          },
          async () => {}
        )
      );
      assert.equal(issuer.writes.at(-1).output.title, 'Admission controller failed');
      assert.ok(!issuer.writes.some((item) => item.conclusion === 'success'));
    }
    const issuer = fakeIssuer();
    await assert.rejects(
      issuing.publish(
        issuer,
        { runId: 90, sha: base },
        122,
        source,
        async () => admission.completeJobs(run(), [], ['checks']),
        async () => {
          throw Error('report disk unavailable');
        }
      ),
      /report disk unavailable/
    );
    assert.equal(issuer.writes.at(-1).conclusion, 'failure');
  } finally {
    if (previous === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
    else process.env.GITHUB_RUN_ATTEMPT = previous;
  }
});
test('a head moved after selection refuses the originally bound check instead of following it', async () => {
  const previous = process.env.GITHUB_RUN_ATTEMPT;
  process.env.GITHUB_RUN_ATTEMPT = '2';
  try {
    const issuer = fakeIssuer(),
      reports = [];
    const moved = snapshot();
    moved.candidate.commit = 'c'.repeat(40);
    const result = await issuing.publish(
      issuer,
      { runId: 90, sha: base },
      122,
      source,
      async () => moved,
      async (report) => reports.push(report)
    );
    assert.equal(result.conclusion, 'failure');
    assert.equal(issuer.writes[0].head_sha, source);
    assert.equal(reports[0].candidate.commit, source);
    assert.match(reports[0].error, /head moved/);
    assert.ok(!issuer.writes.some((item) => item.conclusion === 'success'));
  } finally {
    if (previous === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
    else process.env.GITHUB_RUN_ATTEMPT = previous;
  }
});
test('dedicated publisher first revokes the head and only emits success for unchanged observed snapshots', async () => {
  const previous = process.env.GITHUB_RUN_ATTEMPT;
  process.env.GITHUB_RUN_ATTEMPT = '2';
  try {
    const issuer = fakeIssuer(),
      reports = [];
    const result = await issuing.publish(
      issuer,
      { runId: 90, sha: base },
      122,
      source,
      async () => snapshot(),
      async (report) => reports.push(report)
    );
    assert.equal(issuer.writes[0].status, 'in_progress');
    assert.equal(result.conclusion, 'success');
    assert.equal(reports[0].authority.merge, false);
    for (const failed of ['failure', 'cancelled', 'running']) {
      const api = fakeIssuer();
      let count = 0;
      await assert.rejects(
        issuing.publish(
          api,
          { runId: 90, sha: base },
          122,
          source,
          async () => {
            count += 1;
            const r = snapshot();
            if (count === 2) r.state = failed;
            return r;
          },
          async () => {}
        )
      );
      assert.equal(api.writes.at(-1).conclusion, 'failure');
      assert.ok(!api.writes.some((write) => write.conclusion === 'success'));
    }
  } finally {
    if (previous === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
    else process.env.GITHUB_RUN_ATTEMPT = previous;
  }
});

test('real Git collection keeps candidate bytes as data and rejects an otherwise green no-op wrapper', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'delivery-admission-'));
  const git = (...args) => cp.execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  try {
    git('init', '-q');
    git('config', 'user.name', 'Admission fixture');
    git('config', 'user.email', 'fixture@example.invalid');
    fs.mkdirSync(path.join(root, 'tools'));
    fs.writeFileSync(
      path.join(root, 'tools/wrapper.cjs'),
      'throw new Error("candidate code must never execute");\n'
    );
    fs.writeFileSync(path.join(root, 'README.md'), 'before\n');
    git('add', '.');
    git('commit', '-qm', 'base');
    const main = git('rev-parse', 'HEAD');
    fs.writeFileSync(path.join(root, 'README.md'), 'after\n');
    git('add', '.');
    git('commit', '-qm', 'candidate');
    const head = git('rev-parse', 'HEAD');
    git('checkout', '-q', main);
    const pr = {
      number: 122,
      state: 'open',
      draft: false,
      head: { sha: head, repo: { full_name: admission.repository } },
      base: {
        sha: main,
        ref: 'main',
        repo: { full_name: admission.repository },
      },
    };
    const files = admission.routes.map(([file]) => file);
    const stage = { ...run(200), head_sha: main };
    const github = {
      rest: {
        repos: {
          getBranch: async () => ({
            data: { protected: true, commit: { sha: main } },
          }),
        },
        pulls: { get: async () => ({ data: pr }) },
        actions: {
          getWorkflow: async ({ workflow_id }) => ({
            data: {
              id: files.indexOf(workflow_id) + 1,
              path: '.github/workflows/' + workflow_id,
            },
          }),
          listWorkflowRuns: async ({ workflow_id, event }) => {
            const item = event
              ? {
                  ...run(100 + workflow_id),
                  event,
                  workflow_id,
                  path: '.github/workflows/' + files[workflow_id - 1],
                  head_sha: pr.head.sha,
                }
              : { ...stage, workflow_id };
            return { data: { workflow_runs: [item], total_count: 1 } };
          },
          listJobsForWorkflowRunAttempt: async ({ run_id, attempt_number }) => {
            assert.equal(attempt_number, 2);
            const jobs =
              run_id === 200
                ? admission.stageJobs.map((name, i) => ({
                    ...job(name, 300 + i, run_id),
                    steps:
                      name === 'change-admission-receipt'
                        ? [
                            {
                              name: admission.receiptStep,
                              status: 'completed',
                              conclusion: 'success',
                            },
                          ]
                        : [],
                  }))
                : [job(admission.routes[run_id - 101][1], run_id + 500, run_id)];
            return { data: { jobs, total_count: jobs.length } };
          },
          listWorkflowRunArtifacts: async () => ({
            data: {
              total_count: 1,
              artifacts: [
                {
                  id: 800,
                  name: admission.receiptName(122, pr.head.sha, main, 200, 2),
                  expired: false,
                  digest: 'sha256:' + 'c'.repeat(64),
                  workflow_run: { id: 200, head_sha: main },
                },
              ],
            },
          }),
        },
      },
    };
    const context = {
      repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
      ref: 'refs/heads/main',
      sha: main,
      eventName: 'workflow_run',
    };
    const first = await admission.collect(github, context, 122, root);
    assert.equal(first.state, 'eligible-snapshot');
    assert.equal(first.authority.merge, false);
    assert.equal(first.candidate.commit, head);
    assert.equal(first.evidence.length, 5);
    pr.base.sha = 'a'.repeat(40);
    await assert.rejects(
      admission.collect(github, context, 122, root),
      (error) => error instanceof admission.AdmissionBlocked && /PR base moved/.test(error.message)
    );
    pr.base.sha = main;
    git('checkout', '-q', head);
    fs.writeFileSync(path.join(root, 'tools/wrapper.cjs'), 'process.exit(0);\n');
    git('add', '.');
    git('commit', '-qm', 'successful no-op wrapper');
    pr.head.sha = git('rev-parse', 'HEAD');
    git('checkout', '-q', main);
    const blocked = await admission.collect(github, context, 122, root);
    assert.equal(blocked.state, 'blocked');
    assert.deepEqual(blocked.blockers, ['unsupported-execution-control-change']);
    assert.deepEqual(blocked.policy.changed, ['tools/wrapper.cjs']);
    pr.draft = true;
    assert.ok(
      (await admission.collect(github, context, 122, root)).blockers.includes('Draft-deferred')
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
