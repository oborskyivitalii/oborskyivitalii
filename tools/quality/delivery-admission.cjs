'use strict';

// Trusted-main admission; candidate code is inspected as immutable Git data.
const assert = require('node:assert/strict');
const path = require('node:path');
const git = require('./delivery-git.cjs');
const json = require('./delivery-json.cjs');
const routing = require('./delivery-routing.cjs');
const observation = require('./delivery-observation.cjs');
const repository = 'oborskyivitalii/oborskyivitalii';
const owner = 'oborskyivitalii';
const workflow = '.github/workflows/change-admission.yml';
const stageWorkflow = '.github/workflows/site-color-review.yml';
const routes = [
  ['site-checks.yml', 'checks'],
  ['navigation.yml', 'Local navigation and RI freshness'],
  ['issue-acceptance.yml', 'Owning issue deterministic acceptance mapping'],
  ['site-color-review.yml', 'Staging admission'],
];
const stageJobs = [
  'target',
  'begin-admission',
  'build',
  'publish',
  'full / build',
  'full / static',
  'full / host',
  'full / staging',
  'full / gate',
  'promote',
  'merge-admission',
  'change-admission-receipt',
];
const receiptStep = 'Retain independently produced staging identity';
class AdmissionBlocked extends Error {
  constructor(message, nextAction) {
    super(message);
    this.name = 'AdmissionBlocked';
    this.nextAction = nextAction;
  }
}
function requireEvidence(condition, message, nextAction) {
  if (!condition) throw new AdmissionBlocked(message, nextAction);
}
function completed(item, description) {
  assert.ok(
    ['queued', 'in_progress', 'waiting', 'pending', 'requested', 'completed'].includes(item.status),
    'unknown ' + description + ' status'
  );
  assert.ok(
    [
      null,
      'success',
      'failure',
      'neutral',
      'cancelled',
      'skipped',
      'timed_out',
      'action_required',
      'stale',
      'startup_failure',
    ].includes(item.conclusion),
    'unknown ' + description + ' conclusion'
  );
  requireEvidence(
    item.status === 'completed',
    description + ' is running',
    'Wait for the selected checks, then dispatch this PR again.'
  );
  requireEvidence(
    item.conclusion === 'success',
    description + ' failed',
    'Repair or complete the selected checks, then dispatch this PR again.'
  );
}
function positive(value) {
  assert.match(String(value), /^[1-9][0-9]*$/, 'positive decimal identity required');
  assert.ok(Number.isSafeInteger(Number(value)), 'identity exceeds safe integer range');
  return Number(value);
}
function sha(value) {
  assert.match(value || '', /^[a-f0-9]{40}$/, 'full immutable commit required');
  return value;
}
function executionPath(file) {
  return routing.control(file);
}
function definitions(before, after) {
  const names = [...new Set([...before.keys(), ...after.keys()])].sort();
  const inventory = [],
    changed = [];
  for (const file of names) {
    for (const entry of [before.get(file), after.get(file)].filter(Boolean)) {
      assert.ok(['100644', '100755'].includes(entry.mode), 'unsupported source mode: ' + file);
    }
    if (!executionPath(file)) continue;
    const old = before.get(file),
      next = after.get(file);
    if (old) inventory.push([file, old.mode, old.object]);
    if (!old || !next || old.mode !== next.mode || old.object !== next.object) changed.push(file);
  }
  assert.ok(inventory.length, 'empty pre-change execution inventory');
  return { digest: json.digest(json.canonical(inventory)), inventory, changed };
}
function completeJobs(run, jobs, names) {
  positive(run.id);
  positive(run.run_attempt);
  completed(run, 'required workflow');
  assert.ok(Array.isArray(jobs), 'invalid required job inventory');
  const ids = new Set();
  for (const job of jobs) {
    positive(job.id);
    assert.ok(!ids.has(job.id), 'duplicate job identity');
    ids.add(job.id);
    assert.equal(job.run_id, run.id, 'foreign job run');
    if (job.run_attempt !== undefined)
      assert.equal(job.run_attempt, run.run_attempt, 'mixed job attempts');
  }
  return names.map((name) => {
    const matches = jobs.filter((job) => job.name === name);
    assert.ok(matches.length <= 1, 'ambiguous required job: ' + name);
    requireEvidence(
      matches.length === 1,
      'missing required job: ' + name,
      'Run the required workflow completely, then dispatch this PR again.'
    );
    const job = matches[0];
    completed(job, 'required job ' + name);
    return {
      name,
      id: job.id,
      run: run.id,
      attempt: run.run_attempt,
      state: 'passed',
    };
  });
}
function receiptName(pr, source, base, run, attempt) {
  return [
    'change-stage',
    positive(pr),
    sha(source),
    sha(base),
    positive(run),
    positive(attempt),
  ].join('-');
}
function stageReceipt(artifacts, run, jobs, pr, base) {
  const expected = receiptName(pr.number, pr.head.sha, base, run.id, run.run_attempt);
  const matches = artifacts.filter((item) => item.name === expected);
  assert.ok(matches.length <= 1, 'ambiguous independent staging receipt');
  requireEvidence(
    matches.length === 1,
    'missing independent staging receipt',
    'Complete owner staging for this exact PR, then dispatch it again.'
  );
  const artifact = matches[0];
  positive(artifact.id);
  assert.equal(typeof artifact.expired, 'boolean', 'invalid receipt expiry');
  requireEvidence(
    !artifact.expired,
    'staging receipt expired',
    'Run fresh owner staging, then dispatch this PR again.'
  );
  assert.match(artifact.digest || '', /^sha256:[a-f0-9]{64}$/, 'missing native receipt digest');
  assert.equal(artifact.workflow_run?.id, run.id, 'receipt belongs to another run');
  assert.equal(artifact.workflow_run?.head_sha, base, 'receipt controller differs');
  const job = jobs.find((item) => item.name === 'change-admission-receipt');
  assert.ok(job, 'missing independent receipt job');
  assert.equal(job.status, 'completed');
  assert.equal(job.conclusion, 'success', 'independent receipt job did not pass');
  const steps = (job.steps || []).filter((step) => step.name === receiptStep);
  assert.equal(steps.length, 1, 'missing or ambiguous receipt upload step');
  assert.equal(steps[0].status, 'completed');
  assert.equal(steps[0].conclusion, 'success', 'receipt upload did not pass');
  return {
    id: artifact.id,
    name: expected,
    digest: artifact.digest,
    producerJob: job.id,
  };
}
async function pages(method, args, key) {
  const rows = [],
    identities = new Set();
  let expectedCount;
  for (let page = 1; page <= 10; page += 1) {
    const { data } = await method({ ...args, per_page: 100, page });
    assert.ok(Array.isArray(data[key]), 'invalid paginated API response');
    const count = data.total_count;
    if (expectedCount === undefined) expectedCount = count;
    assert.equal(count, expectedCount, 'moving API inventory count');
    assert.ok(
      Number.isSafeInteger(count) && count >= 0 && count <= 1000,
      'API inventory exceeds bound'
    );
    for (const row of data[key]) {
      positive(row.id);
      assert.ok(!identities.has(row.id), 'duplicate or moving API pagination');
      identities.add(row.id);
      rows.push(row);
    }
    if (rows.length === count) return rows;
    assert.ok(rows.length < count && data[key].length === 100, 'truncated or moving API inventory');
  }
  assert.fail('incomplete API pagination');
}
async function selectedRun(github, repo, pr, file, names) {
  const definition = (await github.rest.actions.getWorkflow({ ...repo, workflow_id: file })).data;
  positive(definition.id);
  assert.equal(definition.path, '.github/workflows/' + file, 'wrong workflow definition');
  const runs = await pages(
    github.rest.actions.listWorkflowRuns,
    {
      ...repo,
      workflow_id: definition.id,
      head_sha: pr.head.sha,
      event: 'pull_request',
    },
    'workflow_runs'
  );
  const run = runs
    .filter((item) => item.pull_requests?.some((p) => p.number === pr.number))
    .sort((a, b) => b.id - a.id)[0];
  requireEvidence(
    run,
    'missing required workflow: ' + file,
    'Run the required checks for this head, then dispatch this PR again.'
  );
  assert.equal(run.workflow_id, definition.id, 'wrong workflow identity');
  assert.equal(run.path, definition.path, 'wrong workflow path');
  assert.equal(run.head_sha, pr.head.sha, 'stale workflow source');
  assert.equal(run.head_repository?.full_name, repository, 'foreign workflow repository');
  assert.equal(run.event, 'pull_request', 'wrong workflow event');
  const jobs = await pages(
    github.rest.actions.listJobsForWorkflowRunAttempt,
    {
      ...repo,
      run_id: run.id,
      attempt_number: positive(run.run_attempt),
    },
    'jobs'
  );
  return {
    workflow: definition.path,
    run: run.id,
    attempt: run.run_attempt,
    jobs: completeJobs(run, jobs, names),
  };
}
async function latestStage(github, repo, base, pr) {
  const definition = (
    await github.rest.actions.getWorkflow({
      ...repo,
      workflow_id: 'site-color-review.yml',
    })
  ).data;
  positive(definition.id);
  assert.equal(definition.path, stageWorkflow);
  const runs = await pages(
    github.rest.actions.listWorkflowRuns,
    {
      ...repo,
      workflow_id: definition.id,
      head_sha: base,
    },
    'workflow_runs'
  );
  for (const run of runs.sort((a, b) => b.id - a.id)) {
    if (
      !['issue_comment', 'workflow_dispatch'].includes(run.event) ||
      run.head_branch !== 'main' ||
      run.actor?.login !== owner ||
      run.display_title !== 'Site staging PR #' + positive(pr.number)
    )
      continue;
    assert.equal(run.path, stageWorkflow);
    assert.equal(run.workflow_id, definition.id);
    assert.equal(run.head_sha, base);
    assert.equal(run.head_repository?.full_name, repository);
    assert.equal(run.triggering_actor?.login, owner);
    const jobs = await pages(
      github.rest.actions.listJobsForWorkflowRunAttempt,
      {
        ...repo,
        run_id: run.id,
        attempt_number: positive(run.run_attempt),
      },
      'jobs'
    );
    const targets = jobs.filter((job) => job.name === 'target');
    assert.ok(targets.length <= 1, 'latest owner workflow has ambiguous target jobs');
    // Only a completed harmless comment with no executed work is inapplicable.
    // A cancelled /stage or dispatch may skip target; it must still block older green.
    if (
      run.event === 'issue_comment' &&
      run.status === 'completed' &&
      ['success', 'skipped'].includes(run.conclusion) &&
      jobs.every((job) => job.status === 'completed' && job.conclusion === 'skipped')
    )
      continue;
    const artifacts = await pages(
      github.rest.actions.listWorkflowRunArtifacts,
      { ...repo, run_id: run.id },
      'artifacts'
    );
    const target = targets[0];
    if (target?.status === 'completed' && target.conclusion === 'success') {
      assert.equal(target.run_id, run.id);
      if (target.run_attempt !== undefined) assert.equal(target.run_attempt, run.run_attempt);
      const response = await github.rest.actions.downloadJobLogsForWorkflowRun({
        ...repo,
        job_id: positive(target.id),
      });
      const logs =
        typeof response.data === 'string' ? response.data : git.text(Buffer.from(response.data));
      assert.ok(Buffer.byteLength(logs) <= 2 * 1024 * 1024, 'oversized trusted target log');
      const lines = logs
        .split(/\r?\n/)
        .map((line) => line.match(/(?:^| )change-stage-target-v1 (\{.*\})$/))
        .filter(Boolean);
      requireEvidence(
        lines.length === 1,
        'unavailable unique trusted staging target',
        'Run fresh owner staging; target logs cannot prove this attempt inapplicable.'
      );
      const binding = json.parse(Buffer.from(lines[0][1]));
      assert.equal(binding.pr, pr.number);
      assert.equal(binding.base, base);
      assert.equal(binding.run, run.id);
      assert.equal(binding.attempt, run.run_attempt);
      sha(binding.source);
      // Only the completed protected-main job log can establish an older head.
      // Early artifacts remain diagnostics: candidate jobs can replace them.
      if (binding.source !== pr.head.sha) continue;
    }
    // An unresolved same-PR attempt blocks old green conservatively.
    return { run, jobs, artifacts };
  }
  throw new AdmissionBlocked(
    'missing genuine owner staging execution',
    'Complete owner staging for this exact PR, then dispatch it again.'
  );
}
function runtime(context) {
  assert.equal(context.repo.owner + '/' + context.repo.repo, repository);
  assert.equal(context.ref, 'refs/heads/main', 'controller must execute from main');
  assert.ok(
    ['workflow_run', 'workflow_dispatch', 'issue_comment', 'push'].includes(context.eventName)
  );
  sha(context.sha);
}
async function collect(github, context, number, root = path.resolve(__dirname, '../..')) {
  runtime(context);
  const repo = context.repo;
  const main = (await github.rest.repos.getBranch({ ...repo, branch: 'main' })).data;
  assert.equal(main.protected, true, 'main is unprotected');
  sha(main.commit.sha);
  requireEvidence(
    main.commit.sha === context.sha,
    'controller main moved',
    'Dispatch this PR again from the current main.'
  );
  git.clean(root, context.sha);
  const pr = (await github.rest.pulls.get({ ...repo, pull_number: positive(number) })).data;
  assert.ok(['open', 'closed'].includes(pr.state), 'unknown PR state');
  assert.equal(typeof pr.draft, 'boolean', 'invalid PR draft state');
  requireEvidence(pr.state === 'open', 'PR is closed', 'Select an open PR.');
  assert.equal(pr.base.ref, 'main');
  for (const side of [pr.head, pr.base])
    assert.equal(side.repo?.full_name, repository, 'foreign PR repository');
  sha(pr.head.sha);
  sha(pr.base.sha);
  requireEvidence(
    pr.base.sha === main.commit.sha,
    'PR base moved',
    'Update this PR from current main, finish its checks, then dispatch it again.'
  );
  if (git.invoke(root, ['cat-file', '-e', pr.head.sha + '^{commit}']).status !== 0) {
    const remote = git.text(git.git(root, ['remote', 'get-url', 'origin'])).trim();
    assert.ok(
      [`https://github.com/${repository}`, `https://github.com/${repository}.git`].includes(remote)
    );
    git.git(root, ['fetch', '--no-tags', 'origin', pr.head.sha]);
  }
  const candidate = git.resolve(root, pr.head.sha),
    controller = git.resolve(root, context.sha);
  const policy = definitions(git.tree(root, context.sha), git.tree(root, pr.head.sha));
  const selection = observation.selection(root, context.sha, pr.head.sha);
  const result = {
    kind: 'change-admission-snapshot',
    version: 1,
    authority: { merge: false, deploy: false, reuseEvidence: false },
    controller,
    candidate,
    policy,
    controlReview: policy.changed.length
      ? { reviewedSHA: context.payload?.inputs?.reviewed_sha || null, reviewer: context.actor }
      : null,
    pr: pr.number,
    state: 'blocked',
    lane: selection.repositoryOnly ? 'repository' : 'current-full-route',
    selection,
    nextAction: 'Resolve the listed blockers, then dispatch this PR again from current main.',
    evidence: [],
    blockers: [],
    freshness:
      'Snapshot and final lease only; asynchronous invalidation is not a synchronous merge guarantee.',
  };
  if (pr.draft) result.blockers.push('Draft-deferred');
  if (policy.changed.length && !reviewedControl(context, pr.head.sha)) {
    result.blockers.push('review-exact-control-head');
    result.nextAction =
      'Review the control diff, then dispatch this PR with reviewed_sha=' +
      pr.head.sha +
      '. Full checks and staging are still required.';
  }
  if (git.invoke(root, ['merge-base', '--is-ancestor', context.sha, pr.head.sha]).status !== 0) {
    result.blockers.push('update-from-current-main');
  }
  if (result.blockers.length) return result;
  const selectedRoutes = selection.repositoryOnly ? routes.slice(0, 3) : routes;
  for (const [file, name] of selectedRoutes)
    result.evidence.push(await selectedRun(github, repo, pr, file, [name]));
  if (!selection.repositoryOnly) {
    // A candidate-created Actions check cannot choose the authoritative staging run.
    const { run, jobs, artifacts } = await latestStage(github, repo, context.sha, pr);
    const required = completeJobs(run, jobs, stageJobs);
    const receipt = stageReceipt(artifacts, run, jobs, pr, context.sha);
    result.evidence.push({
      workflow: stageWorkflow,
      run: run.id,
      attempt: run.run_attempt,
      jobs: required,
      receipt,
      unselected: jobs
        .filter((job) => !stageJobs.includes(job.name))
        .map((job) => ({
          name: job.name,
          conclusion: job.conclusion,
          reason:
            'Not a selected admission obligation in the unchanged trusted workflow; actual conclusion retained.',
        })),
    });
  }
  const currentMain = (await github.rest.repos.getBranch({ ...repo, branch: 'main' })).data;
  const currentPR = (await github.rest.pulls.get({ ...repo, pull_number: pr.number })).data;
  assert.equal(currentMain.protected, true);
  sha(currentMain.commit.sha);
  sha(currentPR.head.sha);
  sha(currentPR.base.sha);
  assert.ok(['open', 'closed'].includes(currentPR.state), 'unknown PR state');
  assert.equal(typeof currentPR.draft, 'boolean', 'invalid PR draft state');
  requireEvidence(
    currentMain.commit.sha === context.sha && currentPR.base.sha === context.sha,
    'main or PR base moved during collection',
    'Dispatch this PR again from current main.'
  );
  requireEvidence(
    currentPR.state === 'open' && currentPR.draft === false,
    'PR is no longer ready',
    'Finish the open PR, mark it ready, then dispatch it again.'
  );
  requireEvidence(
    currentPR.head.sha === pr.head.sha,
    'PR head moved during collection',
    'Finish checks on the new head, then dispatch this PR again.'
  );
  result.state = 'eligible-snapshot';
  result.nextAction =
    'Continue protected merge with this exact head and current base; no deployment is authorized.';
  return result;
}
function sameSnapshot(first, last) {
  assert.ok(['eligible-snapshot', 'blocked'].includes(last.state), 'unknown snapshot state');
  requireEvidence(
    last.state === 'eligible-snapshot',
    'latest evidence no longer passes',
    last.nextAction || 'Resolve the blockers, then dispatch this PR again.'
  );
  requireEvidence(
    json.canonical(first) === json.canonical(last),
    'source, policy or selected evidence moved',
    'Dispatch this PR again from current main.'
  );
}
function reviewedControl(context, head) {
  const value = context.payload?.inputs?.reviewed_sha;
  if (!value) return false;
  assert.equal(context.eventName, 'workflow_dispatch', 'control review requires manual dispatch');
  assert.equal(context.actor, owner, 'only the owner can attest a reviewed control head');
  sha(value);
  return value === head;
}
async function issuedCheck(github, repo, pr, base) {
  const checks = await pages(
    github.rest.checks.listForRef,
    { ...repo, ref: sha(pr.head.sha), check_name: 'Change admission', filter: 'all' },
    'check_runs'
  );
  const check = checks
    .filter((item) => item.name === 'Change admission' && item.app?.id === 5453173)
    .sort((a, b) => b.id - a.id)[0];
  requireEvidence(
    check,
    'missing dedicated App admission',
    'Dispatch Change admission for this PR, then refresh its PR checks.'
  );
  assert.equal(check.head_sha, pr.head.sha);
  completed(check, 'dedicated App admission');
  const identity = (check.external_id || '').match(/^([1-9][0-9]*)\/([1-9][0-9]*)\/([1-9][0-9]*)$/);
  assert.ok(identity, 'malformed dedicated check identity');
  assert.equal(Number(identity[3]), pr.number);
  const run = (await github.rest.actions.getWorkflowRun({ ...repo, run_id: positive(identity[1]) }))
    .data;
  assert.equal(run.path, workflow);
  assert.equal(run.head_sha, sha(base), 'admission controller base differs');
  assert.equal(run.head_branch, 'main');
  assert.equal(run.head_repository?.full_name, repository);
  assert.equal(run.event, 'workflow_dispatch');
  assert.equal(run.actor?.login, owner);
  assert.equal(run.triggering_actor?.login, owner);
  assert.equal(run.run_attempt, positive(identity[2]), 'admission attempt moved');
  completed(run, 'dedicated issuer workflow');
  return { check: check.id, run: run.id, attempt: run.run_attempt, protectedMain: base };
}
async function targets(github, context) {
  runtime(context);
  assert.equal(context.eventName, 'workflow_dispatch', 'manual dispatch required');
  assert.equal(context.actor, owner, 'only owner dispatch can request refresh');
  return [positive(context.payload.inputs?.pr_number)];
}
async function stageIdentity(github, context, number, expectedSource) {
  runtime(context);
  assert.ok(['issue_comment', 'workflow_dispatch'].includes(context.eventName));
  assert.equal(context.actor, owner);
  const main = (await github.rest.repos.getBranch({ ...context.repo, branch: 'main' })).data;
  assert.equal(main.protected, true);
  assert.equal(main.commit.sha, context.sha);
  const pr = (
    await github.rest.pulls.get({
      ...context.repo,
      pull_number: positive(number),
    })
  ).data;
  assert.equal(pr.state, 'open');
  assert.equal(pr.draft, false);
  assert.equal(pr.head.repo?.full_name, repository);
  assert.equal(pr.base.repo?.full_name, repository);
  assert.equal(pr.base.ref, 'main');
  assert.equal(pr.base.sha, context.sha);
  assert.equal(pr.head.sha, sha(expectedSource));
  return {
    kind: 'independent-stage-identity',
    version: 1,
    repository,
    pr: pr.number,
    source: pr.head.sha,
    protectedMain: context.sha,
    run: positive(context.runId),
    attempt: positive(process.env.GITHUB_RUN_ATTEMPT),
    artifactName: receiptName(
      pr.number,
      pr.head.sha,
      context.sha,
      context.runId,
      process.env.GITHUB_RUN_ATTEMPT
    ),
  };
}

module.exports = {
  AdmissionBlocked,
  repository,
  workflow,
  routes,
  stageJobs,
  receiptStep,
  positive,
  executionPath,
  reviewedControl,
  issuedCheck,
  definitions,
  completeJobs,
  receiptName,
  stageReceipt,
  pages,
  selectedRun,
  latestStage,
  collect,
  sameSnapshot,
  targets,
  stageIdentity,
};
