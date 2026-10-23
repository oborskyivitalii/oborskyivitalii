'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const inputs = require('../tools/staging/maintenance-inputs.cjs');
const maintenance = require('../tools/staging/maintenance.cjs');
const admission = require('../tools/staging/admission.cjs');
const production = require('../tools/release/staging-policy.cjs');
const flow = require('../tools/staging/review-flow.cjs');
const original = require('../.github/rulesets/protect-main-before.json');
const baseline = require('../.github/rulesets/source-admission.json');
const staging = require('../.github/rulesets/staging-admission.json');
const hash = (letter) => letter.repeat(64);

function repository() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'maintenance-'));
  const git = (...args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  const write = (name, value) => {
    fs.mkdirSync(path.dirname(path.join(cwd, name)), { recursive: true });
    fs.writeFileSync(path.join(cwd, name), value);
  };
  git('init', '-b', 'main');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.test');
  fs.mkdirSync(path.join(cwd, 'tests'));
  write('tools/quality/ubuntu_downloads.py', 'before\n');
  write('site/index.html', 'accepted\n');
  write(
    'review/issue-122/2026-10-23-t04-setup-review.md',
    'Versioned review traceability; execution remains external.\n'
  );
  git('add', '.');
  git('commit', '-m', 'baseline');
  const base = git('rev-parse', 'HEAD');
  const commit = () => {
    git('add', '-A');
    git('commit', '-m', 'Refs #122 repair');
    return git('rev-parse', 'HEAD');
  };
  return {
    cwd,
    git,
    write,
    commit,
    base,
    close: () => fs.rmSync(cwd, { recursive: true, force: true }),
  };
}
function repaired() {
  const f = repository();
  f.write('tools/quality/ubuntu_downloads.py', 'after\n');
  f.head = f.commit();
  f.delta = inputs.collect(f.base, f.head, 122, f.cwd);
  return f;
}
function apiFixture(f, merged = false) {
  const merge = f.git(
      'commit-tree',
      f.delta.headTree,
      '-p',
      f.base,
      '-p',
      f.head,
      '-m',
      'Fixture merge'
    ),
    now = Date.now();
  f.git('checkout', '--detach', merged ? merge : f.head);
  const endpoint = (sha) => ({ sha, ref: 'main', repo: { full_name: inputs.repository } });
  const pr = {
    number: 132,
    state: merged ? 'closed' : 'open',
    draft: false,
    base: endpoint(f.base),
    head: endpoint(f.head),
    merged,
    merged_by: { id: inputs.ownerId },
    merge_commit_sha: merge,
    merged_at: new Date(now - 500).toISOString(),
  };
  const context = {
    repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
    runId: 999,
    eventName: 'pull_request',
    payload: { pull_request: structuredClone(pr) },
    sha: merged ? merge : f.head,
  };
  const previous = { runId: '401', attempt: '1', controller: f.base, stateId: '901' };
  const state = {
    schema: 1,
    kind: 'ci-staging-recovery',
    project: flow.project,
    workflow: flow.workflow,
    ...previous,
    sourceCommit: f.base,
    publicDigest: hash('d'),
    packageDigest: hash('e'),
    packageArtifactId: '902',
    packageUploadDigest: hash('f'),
    packageAttempt: '1',
  };
  delete state.stateId;
  const recoveryBytes = Buffer.from(JSON.stringify(state, null, 2) + '\n');
  const sourceChecks = [101, 102, 103].map((workflowRun, i) => ({
    workflowRun,
    attempt: 1,
    job: 1001 + i,
    source: f.head,
  }));
  const decision = {
    schema: 1,
    kind: 'controller-maintenance-decision',
    repository: inputs.repository,
    issue: 122,
    pr: 132,
    base: f.base,
    head: f.head,
    tree: f.delta.headTree,
    diffDigest: f.delta.diffDigest,
    paths: f.delta.paths,
    expiresAt: new Date(now + 1800000).toISOString(),
    reason: 'Repair broken Ubuntu CI dependency installation',
    failedRun: 301,
    failedAttempt: 1,
    failedJob: 3001,
    reviews: ['requirements', 'code', 'whitebox', 'exploratory'].map((role) => ({
      role,
      path: 'review/issue-122/2026-10-23-t04-setup-review.md',
      receiptSha256: hash('a'),
    })),
    sourceChecks,
    protection: {
      observedAt: new Date(now - 2000).toISOString(),
      'source-admission': { id: 700, payloadDigest: inputs.digest(inputs.canonical(baseline)) },
      'staging-admission': {
        id: 24568553,
        payloadDigest: inputs.digest(inputs.canonical(staging)),
      },
    },
    focused: { workflow: flow.workflow, runId: 201, attempt: 1, jobId: 2001, jobName: 'smoke' },
    preservedSite: {
      previous,
      uploadDigest: 'sha256:' + hash('b'),
      recoveryDigest: inputs.digest(recoveryBytes.toString()),
      state,
    },
  };
  const comment = {
    id: 800,
    user: { id: inputs.ownerId, login: context.repo.owner, type: 'User' },
    created_at: new Date(now - 1000).toISOString(),
    updated_at: new Date(now - 1000).toISOString(),
    body: '',
  };
  const refresh = () => {
    comment.body = inputs.marker + '\n```json\n' + JSON.stringify(decision, null, 2) + '\n```';
  };
  refresh();
  const comments = [comment],
    sources = ['site-checks.yml', 'navigation.yml', 'issue-acceptance.yml'];
  const run = (id, name, head = f.head) => ({
    id,
    path: '.github/workflows/' + name,
    head_sha: head,
    head_repository: { full_name: inputs.repository },
    event: 'pull_request',
    status: 'completed',
    conclusion: 'success',
    run_attempt: 1,
    pull_requests: [{ number: 132 }],
  });
  const focus = run(201, 'site-color-review.yml');
  const sourceRuns = sources.map((name, index) => run(101 + index, name));
  const sourceJobs = sourceRuns.map((r, index) => [
    {
      id: 1001 + index,
      name: inputs.sourceContexts[index],
      status: 'completed',
      conclusion: 'success',
    },
  ]);
  const prior = {
    ...run(401, 'site-color-review.yml', f.base),
    event: 'issue_comment',
    head_branch: 'main',
    actor: { login: context.repo.owner },
  };
  const failure = { ...run(301, 'site-color-review.yml', f.base), conclusion: 'cancelled' };
  const focusJobs = [{ id: 2001, name: 'smoke', status: 'completed', conclusion: 'success' }];
  const artifacts = {
    901: {
      id: 901,
      name: 'site-staging-recovery-401-1',
      expired: false,
      workflow_run: { id: 401, head_sha: f.base },
      digest: 'sha256:' + hash('b'),
    },
    902: {
      id: 902,
      name: 'site-review-package-401-1',
      expired: false,
      workflow_run: { id: 401, head_sha: f.base },
      digest: 'sha256:' + hash('f'),
    },
  };
  const liveBaseline = { id: 700, ...structuredClone(baseline) },
    liveStaging = { id: 24568553, ...structuredClone(staging) };
  const main = { protected: true, commit: { sha: merged ? merge : f.base } };
  const mergedCommit = {
    commit: { tree: { sha: f.delta.headTree } },
    parents: [{ sha: f.base }, { sha: f.head }],
  };
  const api = {
    request: async (route, params) => {
      assert.ok(route.startsWith('GET '), 'maintenance API write');
      return {
        data: params.ruleset_id
          ? params.ruleset_id === 700
            ? liveBaseline
            : liveStaging
          : [{ id: 700, name: 'source-admission', source: inputs.repository }],
      };
    },
    rest: {
      issues: { listComments: 'comments' },
      checks: { listForRef: 'checks' },
      pulls: { get: async () => ({ data: structuredClone(pr) }) },
      repos: {
        getBranch: async () => ({ data: structuredClone(main) }),
        getCommit: async () => ({ data: structuredClone(mergedCommit) }),
      },
      actions: {
        listJobsForWorkflowRun: 'jobs',
        listJobsForWorkflowRunAttempt: 'attemptJobs',
        listWorkflowRunArtifacts: 'artifacts',
        listWorkflowRuns: async (params) => ({
          data: {
            workflow_runs: params.branch
              ? [prior]
              : params.workflow_id === 'site-color-review.yml'
                ? [focus]
                : [sourceRuns[sources.indexOf(params.workflow_id)]],
          },
        }),
        getWorkflowRun: async (params) => ({ data: params.run_id === 301 ? failure : focus }),
        getArtifact: async (params) => ({ data: structuredClone(artifacts[params.artifact_id]) }),
      },
    },
    paginate: async (method, params) => {
      if (method === 'comments') return structuredClone(comments);
      if (method === 'artifacts') return [structuredClone(artifacts[901])];
      if (typeof method === 'function') return [prior];
      if (method === 'checks')
        return [
          {
            id: 77,
            name: 'Staging admission',
            head_sha: f.head,
            app: { id: 15368 },
            status: 'completed',
            conclusion: 'success',
            external_id: '201/1',
          },
        ];
      if (params.run_id === focus.id) return structuredClone(focusJobs);
      if (params.run_id === 301)
        return [{ id: 3001, status: 'completed', conclusion: 'cancelled' }];
      if (params.run_id === 401)
        return ['promote', 'merge-admission'].map((name) => ({
          name,
          conclusion: 'success',
          status: 'completed',
          run_attempt: 1,
        }));
      return structuredClone(sourceJobs[params.run_id - 101]);
    },
  };
  return {
    api,
    context,
    pr,
    decision,
    comment,
    comments,
    refresh,
    focus,
    focusJobs,
    sourceRuns,
    sourceJobs,
    failure,
    liveBaseline,
    liveStaging,
    main,
    mergedCommit,
    state,
    recoveryBytes,
  };
}

test('complete CI history records real blobs, modes, trees and both rename paths', () => {
  const f = repaired();
  try {
    f.git('mv', 'tools/quality/ubuntu_downloads.py', 'tests/repair_setup.py');
    const head = f.commit();
    const delta = inputs.collect(f.base, head, 122, f.cwd);
    assert.deepEqual(delta.paths, ['tests/repair_setup.py', 'tools/quality/ubuntu_downloads.py']);
    assert.ok(
      delta.history.some((edge) =>
        edge.changes.some((row) => row.status === 'R' && row.beforePath !== row.afterPath)
      )
    );
    assert.equal(delta.headTree, f.git('rev-parse', head + '^{tree}'));
  } finally {
    f.close();
  }
});
test('a forbidden website change followed by revert still denies maintenance', () => {
  const f = repository();
  try {
    f.write('site/index.html', 'changed\n');
    f.commit();
    f.write('site/index.html', 'accepted\n');
    f.write('tools/quality/ubuntu_downloads.py', 'fixed\n');
    const head = f.commit();
    assert.throws(() => inputs.collect(f.base, head, 122, f.cwd), /non-CI/);
  } finally {
    f.close();
  }
});
test('maintained Node test filenames are eligible and CLI refuses extra arguments', () => {
  const f = repaired();
  try {
    f.write('tests/controller-maintenance.test.cjs', "'use strict';\n");
    const head = f.commit();
    assert.ok(
      inputs
        .collect(f.base, head, 122, f.cwd)
        .paths.includes('tests/controller-maintenance.test.cjs')
    );
    for (const name of [
      'tests/nested/a.test.cjs',
      'tests/a.test.test.cjs',
      'tests/a.js',
      'tests/a.test.py',
    ])
      assert.equal(inputs.eligiblePath(name, 122), false);
    assert.throws(
      () =>
        execFileSync(
          process.execPath,
          [
            require.resolve('../tools/staging/maintenance-inputs.cjs'),
            f.base,
            head,
            '122',
            '--unexpected',
          ],
          { cwd: f.cwd, stdio: 'pipe' }
        ),
      /usage/
    );
  } finally {
    f.close();
  }
});
test('second-parent histories are inspected and ordinary CI merges retain both edges', () => {
  for (const forbidden of [false, true]) {
    const f = repository();
    try {
      f.git('checkout', '-b', 'side');
      f.write(forbidden ? 'site/index.html' : 'MEMORY.md', 'side\n');
      f.commit();
      if (forbidden) {
        f.write('site/index.html', 'accepted\n');
        f.commit();
      }
      f.git('checkout', 'main');
      f.write('tools/quality/ubuntu_downloads.py', 'main\n');
      f.commit();
      f.git('merge', '--no-ff', '--no-edit', 'side');
      const head = f.git('rev-parse', 'HEAD');
      if (forbidden) assert.throws(() => inputs.collect(f.base, head, 122, f.cwd), /non-CI/);
      else
        assert.equal(
          inputs.collect(f.base, head, 122, f.cwd).history.filter((edge) => edge.commit === head)
            .length,
          2
        );
    } finally {
      f.close();
    }
  }
});
test('renames out of site, unknown inputs, symlinks and executable changes deny maintenance', () => {
  for (const operation of [
    (f) => f.git('mv', 'site/index.html', 'tests/moved.cjs'),
    (f) => f.write('unknown.txt', 'unknown'),
    (f) => {
      fs.unlinkSync(path.join(f.cwd, 'tools/quality/ubuntu_downloads.py'));
      fs.symlinkSync('other.py', path.join(f.cwd, 'tools/quality/ubuntu_downloads.py'));
    },
    (f) => fs.chmodSync(path.join(f.cwd, 'tools/quality/ubuntu_downloads.py'), 0o755),
  ]) {
    const f = repository();
    try {
      operation(f);
      const head = f.commit();
      assert.throws(() => inputs.collect(f.base, head, 122, f.cwd));
    } finally {
      f.close();
    }
  }
});
test('empty, missing, shallow and malformed Git inputs do not grant maintenance', () => {
  const f = repaired();
  try {
    assert.throws(() => inputs.collect(f.head, f.head, 122, f.cwd), /empty/);
    assert.throws(() => inputs.collect('0'.repeat(40), f.head, 122, f.cwd));
    assert.throws(() =>
      inputs.rawChanges(
        ':100644 100644 ' + 'a'.repeat(40) + ' ' + 'b'.repeat(40) + ' T\0tests/x.cjs\0',
        122
      )
    );
    const clone = path.join(os.tmpdir(), 'maintenance-shallow-' + path.basename(f.cwd));
    try {
      execFileSync('git', ['clone', '--depth', '1', 'file://' + f.cwd, clone], { stdio: 'pipe' });
      assert.throws(() => inputs.collect(f.base, f.head, 122, clone), /full history/);
    } finally {
      fs.rmSync(clone, { recursive: true, force: true });
    }
  } finally {
    f.close();
  }
});
test('reviewed protection plans preserve a non-bypass source floor and exact owner staging only', () => {
  const plan = inputs.plan(original);
  assert.deepEqual(plan.baseline, baseline);
  assert.deepEqual(plan.staging, staging);
  assert.deepEqual(baseline.bypass_actors, []);
  assert.deepEqual(
    baseline.rules
      .find((r) => r.type === 'required_status_checks')
      .parameters.required_status_checks.map((r) => r.context),
    inputs.sourceContexts
  );
  for (const mutate of [
    (r) =>
      r.bypass_actors.push({ actor_type: 'User', actor_id: inputs.ownerId, bypass_mode: 'always' }),
    (r) =>
      r.rules
        .find((x) => x.type === 'required_status_checks')
        .parameters.required_status_checks.pop(),
    (r) =>
      (r.rules.find(
        (x) => x.type === 'required_status_checks'
      ).parameters.strict_required_status_checks_policy = false),
    (r) => r.conditions.ref_name.exclude.push('refs/heads/main'),
  ]) {
    const r = structuredClone(baseline);
    mutate(r);
    assert.throws(() => inputs.layered(r, baseline));
  }
  for (const mutate of [
    (r) => (r.bypass_actors[0].bypass_mode = 'always'),
    (r) => r.bypass_actors[0].actor_id++,
    (r) => (r.bypass_actors[0].actor_type = 'RepositoryRole'),
    (r) => r.bypass_actors.push({ ...r.bypass_actors[0] }),
  ]) {
    const r = structuredClone(staging);
    mutate(r);
    assert.throws(() => inputs.layered(r, staging));
  }
});
test('only the latest unedited exact owner decision authorizes the maintenance path', async () => {
  const f = repaired();
  try {
    const a = apiFixture(f);
    assert.ok(await maintenance.ownerDecision(a.api, a.context, a.pr));
    for (const mutate of [
      (a) => a.comment.user.id++,
      (a) => (a.comment.user.type = 'Bot'),
      (a) => (a.comment.user.login = 'github-actions'),
    ]) {
      const a = apiFixture(f);
      mutate(a);
      assert.equal(await maintenance.ownerDecision(a.api, a.context, a.pr), null);
    }
    for (const mutate of [
      (a) => (a.comment.updated_at = new Date().toISOString()),
      (a) => {
        a.comment.created_at = new Date(Date.now() + 60000).toISOString();
        a.comment.updated_at = a.comment.created_at;
      },
      (a) => {
        a.decision.expiresAt = new Date(Date.now() + 7200000).toISOString();
        a.refresh();
      },
      (a) => {
        a.decision.pr++;
        a.refresh();
      },
      (a) => {
        a.decision.expiresAt = new Date(Date.now() - 2000).toISOString();
        a.refresh();
      },
      (a) => {
        a.decision.kind = 'controller-maintenance-revoked';
        a.refresh();
      },
      (a) => {
        a.decision.reviews[0].role = 'code';
        a.refresh();
      },
      (a) => (a.comment.body += '\nextra candidate text'),
    ]) {
      const a = apiFixture(f);
      mutate(a);
      await assert.rejects(maintenance.ownerDecision(a.api, a.context, a.pr));
    }
    const latest = apiFixture(f);
    latest.comments.push({ ...latest.comment, id: 801, body: inputs.marker + '\nbroken' });
    await assert.rejects(
      maintenance.ownerDecision(latest.api, latest.context, latest.pr),
      /latest/
    );
  } finally {
    f.close();
  }
});
test('actual source, repair proof and failed history produce a separate non-deploying preflight', async () => {
  const f = repaired();
  try {
    const a = apiFixture(f);
    const approval = await maintenance.ownerDecision(a.api, a.context, a.pr);
    const record = await maintenance.verify(a.api, a.context, a.pr, approval, f.cwd);
    assert.equal(record.kind, 'controller-maintenance-preflight');
    assert.equal(record.pass, true);
    for (const key of ['stagingAccepted', 'productionEligible', 'deploymentAuthorized'])
      assert.equal(record[key], false);
    assert.equal(record.failed.conclusion, 'cancelled');
    assert.equal(record.sourceChecks.length, 3);
  } finally {
    f.close();
  }
});
test('stale scope, source checks, native proof, failure, rules or current leases fail closed', async () => {
  const f = repaired();
  try {
    for (const mutate of [
      (a) => (a.decision.diffDigest = hash('0')),
      (a) => (a.decision.tree = '0'.repeat(40)),
      (a) => (a.decision.paths = []),
      (a) => a.decision.sourceChecks[0].attempt++,
      (a) => a.focus.run_attempt++,
      (a) => (a.focus.head_sha = f.base),
      (a) => (a.focus.head_repository.full_name = 'fork/repo'),
      (a) => (a.focus.path = '.github/workflows/other.yml'),
      (a) => (a.focusJobs[0].conclusion = 'failure'),
      (a) => (a.focusJobs[0].conclusion = 'skipped'),
      (a) => a.focusJobs.push({ ...a.focusJobs[0] }),
      (a) => a.failure.run_attempt++,
      (a) => (a.sourceRuns[0].conclusion = 'failure'),
      (a) => (a.sourceJobs[0][0].conclusion = 'skipped'),
      (a) => a.sourceJobs[1].push({ ...a.sourceJobs[1][0] }),
      (a) =>
        a.liveBaseline.bypass_actors.push({
          actor_type: 'User',
          actor_id: inputs.ownerId,
          bypass_mode: 'always',
        }),
      (a) => (a.main.commit.sha = f.head),
    ]) {
      const a = apiFixture(f);
      mutate(a);
      a.refresh();
      const approval = await maintenance.ownerDecision(a.api, a.context, a.pr);
      await assert.rejects(maintenance.verify(a.api, a.context, a.pr, approval, f.cwd));
    }
  } finally {
    f.close();
  }
});
test('deleted or edited approval and head movement during preflight invalidate the snapshot', async () => {
  const f = repaired();
  try {
    for (const change of ['delete', 'edit', 'head']) {
      const a = apiFixture(f),
        approval = await maintenance.ownerDecision(a.api, a.context, a.pr);
      if (change === 'delete') a.comments.length = 0;
      else if (change === 'edit') {
        a.decision.reason += ' Changed after snapshot';
        a.refresh();
      } else
        a.api.rest.pulls.get = async () => ({
          data: { ...structuredClone(a.pr), head: { ...a.pr.head, sha: f.base } },
        });
      await assert.rejects(maintenance.verify(a.api, a.context, a.pr, approval, f.cwd));
    }
  } finally {
    f.close();
  }
});
test('newer failed focused execution cannot inherit an older success', async () => {
  const f = repaired();
  try {
    const a = apiFixture(f);
    a.focus.id = 202;
    a.focusJobs[0].conclusion = 'failure';
    await assert.rejects(
      maintenance.focusedProof(a.api, a.context, a.pr, a.decision.focused),
      /newer/
    );
  } finally {
    f.close();
  }
});
test('read-only hidden bypass actors require explicit owner admin readback and never mask visible drift', async () => {
  const f = repaired();
  try {
    const a = apiFixture(f);
    delete a.liveBaseline.bypass_actors;
    delete a.liveStaging.bypass_actors;
    const approval = await maintenance.ownerDecision(a.api, a.context, a.pr);
    const record = await maintenance.verify(a.api, a.context, a.pr, approval, f.cwd);
    assert.deepEqual(record.rules.bypassVisibility, {
      baseline: 'owner-attested',
      staging: 'owner-attested',
    });
    for (const mutate of [
      (a) => delete a.decision.protection,
      (a) => a.decision.protection['source-admission'].id++,
      (a) => (a.decision.protection['staging-admission'].payloadDigest = hash('0')),
      (a) => (a.decision.protection.observedAt = new Date(Date.now() - 7200000).toISOString()),
      (a) => (a.decision.protection.observedAt = new Date(Date.now() + 60000).toISOString()),
      (a) =>
        (a.liveBaseline.bypass_actors = [
          { actor_type: 'User', actor_id: inputs.ownerId, bypass_mode: 'always' },
        ]),
      (a) => (a.liveStaging.rules[0].parameters.strict_required_status_checks_policy = false),
    ]) {
      const a = apiFixture(f);
      delete a.liveBaseline.bypass_actors;
      delete a.liveStaging.bypass_actors;
      mutate(a);
      a.refresh();
      await assert.rejects(async () =>
        maintenance.verify(
          a.api,
          a.context,
          a.pr,
          await maintenance.ownerDecision(a.api, a.context, a.pr),
          f.cwd
        )
      );
    }
  } finally {
    f.close();
  }
});
test('event and actual checkout cannot claim a different source', async () => {
  const f = repaired();
  try {
    for (const change of ['head', 'base', 'checkout', 'merge-checkout', 'merge-event']) {
      const merged = change.startsWith('merge-'),
        a = apiFixture(f, merged);
      if (change === 'head') a.context.payload.pull_request.head.sha = f.base;
      else if (change === 'base') a.context.payload.pull_request.base.sha = f.head;
      else if (change === 'merge-event') a.context.sha = f.head;
      else f.git('checkout', '--detach', f.base);
      await assert.rejects(
        maintenance.verify(
          a.api,
          a.context,
          a.pr,
          await maintenance.ownerDecision(a.api, a.context, a.pr),
          f.cwd
        ),
        /event|checkout/
      );
    }
  } finally {
    f.close();
  }
});
test('late PR, source, focused proof and protection changes invalidate preflight', async () => {
  const f = repaired();
  try {
    for (const mutate of [
      (a) => (a.pr.base.ref = 'other'),
      (a) => (a.pr.base.sha = f.head),
      (a) => (a.pr.state = 'closed'),
      (a) => (a.pr.draft = true),
      (a) => (a.sourceJobs[0][0].conclusion = 'failure'),
      (a) => (a.focusJobs[0].conclusion = 'failure'),
      (a) =>
        a.liveBaseline.bypass_actors.push({
          actor_type: 'User',
          actor_id: inputs.ownerId,
          bypass_mode: 'always',
        }),
    ]) {
      const a = apiFixture(f),
        initial = structuredClone(a.pr),
        getBranch = a.api.rest.repos.getBranch;
      a.api.rest.repos.getBranch = async () => {
        mutate(a);
        return getBranch();
      };
      await assert.rejects(
        maintenance.verify(
          a.api,
          a.context,
          initial,
          await maintenance.ownerDecision(a.api, a.context, initial),
          f.cwd
        )
      );
    }
  } finally {
    f.close();
  }
});
test('maintenance merge verifies exact parents/tree and preserves prior accepted site identity', async () => {
  const f = repaired();
  try {
    const a = apiFixture(f, true);
    const approval = await maintenance.ownerDecision(a.api, a.context, a.pr);
    const record = await maintenance.verify(a.api, a.context, a.pr, approval, f.cwd);
    const before = structuredClone(a.state);
    const fetcher = async (url) => ({
      url,
      status: 200,
      headers: new Headers(),
      arrayBuffer: async () =>
        Buffer.from(
          JSON.stringify({ sourceCommit: a.state.sourceCommit, publicDigest: a.state.publicDigest })
        ),
    });
    const verified = await maintenance.preserveSite(
      a.api,
      a.context,
      record,
      a.recoveryBytes,
      fetcher,
      f.cwd
    );
    assert.equal(verified.kind, 'controller-maintenance-merge');
    assert.equal(verified.acceptedSiteIdentityPreserved, true);
    assert.deepEqual(verified.preservedSite.state, before);
    assert.deepEqual(a.state, before);
    a.focusJobs[0].conclusion = 'failure';
    await assert.rejects(
      maintenance.preserveSite(a.api, a.context, record, a.recoveryBytes, fetcher, f.cwd),
      /focused repair proof failed/
    );
    await assert.rejects(admission.verifyMerge(a.api, a.context, a.pr), /main/);
    await assert.rejects(production.authenticate(a.api, a.context, 132, f.head), /main/);
  } finally {
    f.close();
  }
});
test('wrong merge parents/tree/owner, edited decision or changed accepted identity is rejected', async () => {
  const f = repaired();
  try {
    for (const mutate of [
      (a) => a.mergedCommit.parents.reverse(),
      (a) => (a.mergedCommit.commit.tree.sha = '0'.repeat(40)),
      (a) => a.pr.merged_by.id++,
      (a) => (a.decision.preservedSite.previous.controller = f.head),
    ]) {
      const a = apiFixture(f, true);
      mutate(a);
      a.refresh();
      const approval = await maintenance.ownerDecision(a.api, a.context, a.pr);
      await assert.rejects(maintenance.verify(a.api, a.context, a.pr, approval, f.cwd));
    }
    const a = apiFixture(f, true),
      approval = await maintenance.ownerDecision(a.api, a.context, a.pr);
    const record = await maintenance.verify(a.api, a.context, a.pr, approval, f.cwd);
    await assert.rejects(maintenance.preserveSite(a.api, a.context, record, Buffer.from('{}')));
  } finally {
    f.close();
  }
});
test('postmerge has explicit authenticated branches and no deployment or fallback authority', () => {
  const yaml = fs.readFileSync('.github/workflows/site-staging-merge.yml', 'utf8');
  assert.match(yaml, /maintenance\.ownerDecision\(github,context,pr\)/);
  assert.match(yaml, /if: steps\.path\.outputs\.maintenance == 'false'/);
  assert.match(yaml, /if: steps\.path\.outputs\.maintenance == 'true'/);
  assert.match(yaml, /maintenance\.preserveSite\(/);
  assert.doesNotMatch(
    yaml,
    /CLOUDFLARE_API_TOKEN|checks: write|contents: write|deployments: write/
  );
  const preflight = fs.readFileSync('.github/workflows/ci-maintenance.yml', 'utf8');
  assert.match(preflight, /github\.event\.label\.name == 'ci-maintenance'/);
  assert.match(
    preflight,
    /github\.event\.sender\.id == 248754648 && github\.actor == 'oborskyivitalii'/
  );
  assert.match(preflight, /maintenance\.verify\(github,context,pr,approval\)/);
  assert.doesNotMatch(
    preflight,
    /CLOUDFLARE_API_TOKEN|(?:checks|contents|actions|issues|deployments): write/
  );
});
