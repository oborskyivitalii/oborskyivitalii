'use strict';
// An explicit owner maintenance decision is separate from successful website staging.
const assert = require('node:assert/strict');
const inputs = require('./maintenance-inputs.cjs');
const admission = require('./admission.cjs');
const flow = require('./review-flow.cjs');

async function ownerDecision(github, context, pr) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    ...context.repo,
    issue_number: pr.number,
    per_page: 100,
  });
  assert.ok(comments.length < 1000, 'maintenance comment inventory too large');
  const comment = comments
    .filter(
      (item) =>
        item.user?.id === inputs.ownerId &&
        item.user.type === 'User' &&
        item.user.login === context.repo.owner &&
        item.body.startsWith(inputs.marker)
    )
    .sort((a, b) => b.id - a.id)[0];
  if (!comment) return null;
  assert.equal(comment.created_at, comment.updated_at, 'edited maintenance decision');
  const match = /^<!-- controller-maintenance-v1 -->\n```json\n([\s\S]+)\n```\s*$/.exec(
    comment.body
  );
  assert.ok(match, 'malformed latest owner maintenance decision');
  const decision = JSON.parse(match[1]);
  assert.equal(decision.schema, 1);
  assert.equal(
    decision.kind,
    'controller-maintenance-decision',
    'latest decision revokes maintenance'
  );
  assert.equal(decision.repository, inputs.repository);
  assert.equal(decision.pr, pr.number);
  assert.ok(Number.isSafeInteger(decision.issue) && decision.issue > 0);
  const created = Date.parse(comment.created_at),
    expires = Date.parse(decision.expiresAt);
  const time = pr.merged ? Date.parse(pr.merged_at) : Date.now();
  assert.ok(
    Number.isFinite(created) && created <= time && time < expires && expires <= created + 3600000,
    'future or expired maintenance decision'
  );
  const observed = Date.parse(decision.protection?.observedAt);
  assert.ok(
    Number.isFinite(observed) && observed <= created && created - observed <= 3600000,
    'fresh owner administration readback required'
  );
  assert.ok(typeof decision.reason === 'string' && decision.reason.length >= 20);
  assert.ok(Number.isSafeInteger(decision.failedRun) && decision.failedRun > 0);
  assert.ok(Number.isSafeInteger(decision.failedAttempt) && decision.failedAttempt > 0);
  assert.ok(Number.isSafeInteger(decision.failedJob) && decision.failedJob > 0);
  inputs.sha(decision.base);
  inputs.sha(decision.head);
  inputs.sha(decision.tree);
  assert.match(decision.diffDigest, /^[a-f0-9]{64}$/);
  assert.match(decision.preservedSite?.uploadDigest, /^sha256:[a-f0-9]{64}$/);
  assert.match(decision.preservedSite?.recoveryDigest, /^[a-f0-9]{64}$/);
  assert.ok(Array.isArray(decision.reviews) && decision.reviews.length === 4);
  assert.deepEqual(
    decision.reviews.map((r) => r.role).sort(),
    ['requirements', 'code', 'whitebox', 'exploratory'].sort()
  );
  for (const review of decision.reviews) {
    assert.match(review.receiptSha256, /^[a-f0-9]{64}$/);
    assert.ok(
      inputs.eligiblePath(review.path, decision.issue) &&
        review.path.startsWith('review/issue-' + decision.issue + '/')
    );
  }
  return {
    decision,
    comment: {
      id: comment.id,
      bodyDigest: inputs.digest(comment.body),
      ownerId: comment.user.id,
      createdAt: comment.created_at,
      expiresAt: decision.expiresAt,
    },
  };
}
async function protection(github, context, receipt) {
  const list = (
    await github.request('GET /repos/{owner}/{repo}/rulesets', {
      ...context.repo,
      per_page: 100,
    })
  ).data;
  assert.ok(Array.isArray(list) && list.length < 100, 'incomplete ruleset inventory');
  const candidates = list.filter(
    (r) => r.name === 'source-admission' && r.source === inputs.repository
  );
  assert.equal(candidates.length, 1, 'missing or ambiguous non-bypass baseline');
  const baseline = (
    await github.request('GET /repos/{owner}/{repo}/rulesets/{ruleset_id}', {
      ...context.repo,
      ruleset_id: candidates[0].id,
    })
  ).data;
  const staging = (
    await github.request('GET /repos/{owner}/{repo}/rulesets/{ruleset_id}', {
      ...context.repo,
      ruleset_id: 24568553,
    })
  ).data;
  const visibility = [];
  for (const [actual, expected] of [
    [baseline, require('../../.github/rulesets/source-admission.json')],
    [staging, require('../../.github/rulesets/staging-admission.json')],
  ]) {
    const retained = receipt?.[expected.name];
    assert.equal(retained?.id, actual.id, 'owner readback ruleset ID differs');
    assert.equal(
      retained?.payloadDigest,
      inputs.digest(inputs.canonical(expected)),
      'owner readback payload differs'
    );
    // GitHub hides bypass actors from read-only tokens. Never invent a live observation.
    if (Object.hasOwn(actual, 'bypass_actors')) {
      inputs.layered(actual, expected);
      visibility.push('api-visible');
    } else {
      const publicExpected = structuredClone(expected);
      delete publicExpected.bypass_actors;
      const publicActual = structuredClone(actual);
      delete publicActual.bypass_actors;
      const visible = inputs.payload(publicActual);
      delete visible.bypass_actors;
      assert.deepEqual(inputs.canonical(visible), inputs.canonical(publicExpected));
      visibility.push('owner-attested');
    }
  }
  return {
    baseline: baseline.id,
    staging: staging.id,
    ownerId: inputs.ownerId,
    sourceContexts: inputs.sourceContexts,
    pathScopedByGitHub: false,
    bypassVisibility: { baseline: visibility[0], staging: visibility[1] },
    adminReadback: receipt,
  };
}
async function focusedProof(github, context, pr, selected) {
  assert.ok(selected && Number.isSafeInteger(selected.runId) && selected.runId > 0);
  assert.ok(
    inputs.eligiblePath(selected.workflow, 1) && selected.workflow.startsWith('.github/workflows/')
  );
  const runs = (
    await github.rest.actions.listWorkflowRuns({
      ...context.repo,
      workflow_id: selected.workflow.split('/').pop(),
      head_sha: pr.head.sha,
      event: 'pull_request',
      per_page: 100,
    })
  ).data.workflow_runs.sort((a, b) => b.id - a.id);
  assert.ok(runs.length < 100, 'incomplete focused-run inventory');
  for (const run of runs) {
    if (!run.pull_requests.some((p) => p.number === pr.number)) continue;
    assert.equal(run.head_sha, pr.head.sha);
    assert.equal(run.head_repository?.full_name, inputs.repository);
    assert.equal(run.path, selected.workflow);
    assert.equal(run.event, 'pull_request');
    assert.equal(run.status, 'completed', 'focused proof still running');
    const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRun, {
      ...context.repo,
      run_id: run.id,
      filter: 'latest',
      per_page: 100,
    });
    const matches = jobs.filter((job) => job.name === selected.jobName);
    assert.ok(matches.length <= 1, 'ambiguous focused job');
    if (!matches.length || matches[0].conclusion === 'skipped') continue;
    assert.equal(run.id, selected.runId, 'newer focused execution supersedes the decision');
    assert.equal(run.run_attempt, selected.attempt, 'focused attempt changed');
    assert.equal(matches[0].id, selected.jobId);
    assert.equal(matches[0].status, 'completed');
    assert.equal(matches[0].conclusion, 'success', 'focused repair proof failed');
    return selected;
  }
  assert.fail('missing executed focused repair proof');
}
function sourceBinding(pr, decision, cwd) {
  assert.equal(pr.base.ref, 'main');
  for (const endpoint of [pr.base, pr.head])
    assert.equal(endpoint.repo.full_name, inputs.repository);
  assert.equal(pr.head.sha, decision.head, 'maintenance head moved');
  const delta = inputs.collect(decision.base, decision.head, decision.issue, cwd);
  assert.equal(delta.headTree, decision.tree, 'maintenance tree differs');
  assert.equal(delta.diffDigest, decision.diffDigest, 'maintenance history/diff differs');
  assert.deepEqual(delta.paths, decision.paths, 'maintenance path inventory differs');
  inputs.reviewPaths(decision.head, decision.reviews, cwd);
  return delta;
}
function executionBinding(context, pr, cwd) {
  assert.equal(context.eventName, 'pull_request', 'maintenance requires a PR event');
  const event = context.payload.pull_request;
  assert.equal(event.number, pr.number);
  assert.equal(event.head.sha, pr.head.sha, 'maintenance event head differs');
  assert.equal(event.base.sha, pr.base.sha, 'maintenance event base differs');
  assert.equal(event.base.ref, 'main');
  assert.equal(event.merged, pr.merged, 'maintenance event merge state differs');
  const expected = pr.merged ? pr.merge_commit_sha : pr.head.sha;
  if (pr.merged) {
    assert.equal(event.merge_commit_sha, expected);
    assert.equal(context.sha, expected, 'maintenance merge event source differs');
  }
  const { execFileSync } = require('node:child_process');
  const checkedOut = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd,
    encoding: 'utf8',
    timeout: 30000,
  }).trim();
  assert.equal(checkedOut, expected, 'maintenance checkout source differs');
}
function prLease(current, original, decision) {
  assert.equal(current.number, original.number);
  assert.equal(current.draft, false, 'maintenance PR became Draft');
  assert.equal(current.state, original.merged ? 'closed' : 'open');
  assert.equal(current.merged, original.merged);
  for (const endpoint of ['base', 'head']) {
    assert.equal(
      current[endpoint].sha,
      original[endpoint].sha,
      'maintenance ' + endpoint + ' moved'
    );
    assert.equal(current[endpoint].ref, original[endpoint].ref);
    assert.equal(current[endpoint].repo.full_name, inputs.repository);
  }
  assert.equal(current.merge_commit_sha, original.merge_commit_sha);
  if (original.merged) {
    assert.equal(current.merged_by.id, inputs.ownerId);
    assert.equal(current.merged_at, original.merged_at);
  } else assert.equal(current.base.sha, decision.base);
}
async function failureProof(github, context, selected) {
  const run = (
    await github.rest.actions.getWorkflowRun({ ...context.repo, run_id: selected.failedRun })
  ).data;
  assert.equal(run.head_repository?.full_name, inputs.repository);
  assert.ok(
    [selected.base, selected.head].includes(run.head_sha),
    'broken CI belongs to another source'
  );
  assert.equal(run.run_attempt, selected.failedAttempt, 'failure attempt changed');
  assert.equal(run.status, 'completed');
  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: run.id,
    attempt_number: selected.failedAttempt,
    per_page: 100,
  });
  const matches = jobs.filter((job) => job.id === selected.failedJob);
  assert.equal(matches.length, 1, 'missing broken CI job');
  assert.ok(
    ['failure', 'cancelled', 'timed_out'].includes(matches[0].conclusion),
    'broken CI evidence is not failed'
  );
  return {
    runId: run.id,
    attempt: run.run_attempt,
    jobId: matches[0].id,
    conclusion: matches[0].conclusion,
  };
}
async function verify(github, context, pr, approval, cwd = process.cwd()) {
  assert.equal(context.repo.owner + '/' + context.repo.repo, inputs.repository);
  assert.ok(approval, 'explicit owner maintenance decision required');
  const { decision, comment } = approval;
  executionBinding(context, pr, cwd);
  const delta = sourceBinding(pr, decision, cwd);
  const rules = await protection(github, context, decision.protection);
  const sourceChecks = await admission.requireAdmission(github, context, pr);
  assert.deepEqual(sourceChecks, decision.sourceChecks, 'current source admission changed');
  const focused = await focusedProof(github, context, pr, decision.focused);
  const failed = await failureProof(github, context, decision);
  const previous = await flow.findRecovery(github, context);
  assert.ok(previous, 'accepted staging identity is unavailable');
  assert.deepEqual(
    previous,
    decision.preservedSite.previous,
    'accepted staging predecessor changed'
  );
  const artifact = (
    await github.rest.actions.getArtifact({
      ...context.repo,
      artifact_id: Number(previous.stateId),
    })
  ).data;
  assert.equal(artifact.expired, false);
  assert.equal(artifact.workflow_run.id, Number(previous.runId));
  assert.equal(artifact.workflow_run.head_sha, previous.controller);
  assert.equal(artifact.name, 'site-staging-recovery-' + previous.runId + '-' + previous.attempt);
  assert.equal(artifact.digest, decision.preservedSite.uploadDigest);
  const main = (await github.rest.repos.getBranch({ ...context.repo, branch: 'main' })).data;
  assert.equal(main.protected, true);
  if (pr.merged) {
    assert.equal(
      pr.merged_by.id,
      inputs.ownerId,
      'maintenance merge must be performed by the owner'
    );
    assert.equal(main.commit.sha, pr.merge_commit_sha, 'main moved after maintenance merge');
    const merged = (
      await github.rest.repos.getCommit({ ...context.repo, ref: pr.merge_commit_sha })
    ).data;
    assert.equal(merged.commit.tree.sha, decision.tree, 'maintenance merge tree differs');
    assert.deepEqual(
      merged.parents.map((p) => p.sha),
      [decision.base, decision.head],
      'maintenance merge parents differ'
    );
  } else {
    assert.equal(pr.state, 'open');
    assert.equal(pr.base.sha, decision.base);
    assert.equal(main.commit.sha, decision.base, 'main moved before maintenance merge');
  }
  const current = (await github.rest.pulls.get({ ...context.repo, pull_number: pr.number })).data;
  prLease(current, pr, decision);
  executionBinding(context, current, cwd);
  assert.deepEqual(
    await ownerDecision(github, context, current),
    approval,
    'owner decision changed'
  );
  assert.deepEqual(await admission.requireAdmission(github, context, current), sourceChecks);
  await focusedProof(github, context, current, decision.focused);
  assert.deepEqual(await protection(github, context, decision.protection), rules);
  const finalMain = (await github.rest.repos.getBranch({ ...context.repo, branch: 'main' })).data;
  assert.equal(finalMain.protected, true);
  assert.equal(finalMain.commit.sha, main.commit.sha, 'main moved during maintenance verification');
  return {
    schema: 1,
    kind: pr.merged ? 'controller-maintenance-merge' : 'controller-maintenance-preflight',
    pass: true,
    pr: pr.number,
    testedSource: decision.head,
    sourceTree: decision.tree,
    protectedBase: decision.base,
    mergedSource: pr.merged ? pr.merge_commit_sha : null,
    diffDigest: delta.diffDigest,
    paths: delta.paths,
    ownerDecision: comment,
    rules,
    sourceChecks,
    focused,
    failed,
    preservedSite: decision.preservedSite,
    stagingAccepted: false,
    productionEligible: false,
    deploymentAuthorized: false,
  };
}
async function preserveSite(
  github,
  context,
  record,
  recoveryBytes,
  fetcher = fetch,
  cwd = process.cwd()
) {
  assert.equal(record.kind, 'controller-maintenance-merge');
  assert.equal(record.pass, true);
  for (const key of ['stagingAccepted', 'productionEligible', 'deploymentAuthorized'])
    assert.equal(record[key], false, 'maintenance cannot authorize staging or publication');
  assert.equal(inputs.digest(recoveryBytes.toString('utf8')), record.preservedSite.recoveryDigest);
  const state = JSON.parse(recoveryBytes);
  flow.recoveryState(state, record.preservedSite.previous);
  assert.deepEqual(state, record.preservedSite.state, 'retained accepted-site identity differs');
  const artifact = (
    await github.rest.actions.getArtifact({
      ...context.repo,
      artifact_id: Number(state.packageArtifactId),
    })
  ).data;
  flow.recoveryArtifact(state, record.preservedSite.previous, artifact);
  await flow.priorStable('https://staging.oborskyi-author-ci-staging.pages.dev', state, fetcher);
  const current = (await github.rest.pulls.get({ ...context.repo, pull_number: record.pr })).data;
  const approval = await ownerDecision(github, context, current);
  assert.deepEqual(
    approval?.comment,
    record.ownerDecision,
    'owner decision changed after recovery download'
  );
  assert.equal(current.head.sha, record.testedSource);
  assert.equal(current.merge_commit_sha, record.mergedSource);
  assert.equal(approval.decision.tree, record.sourceTree);
  assert.equal(approval.decision.diffDigest, record.diffDigest);
  assert.deepEqual(approval.decision.preservedSite, record.preservedSite);
  executionBinding(context, current, cwd);
  prLease(current, context.payload.pull_request, approval.decision);
  assert.deepEqual(await admission.requireAdmission(github, context, current), record.sourceChecks);
  await focusedProof(github, context, current, approval.decision.focused);
  assert.deepEqual(await protection(github, context, approval.decision.protection), record.rules);
  const main = (await github.rest.repos.getBranch({ ...context.repo, branch: 'main' })).data;
  assert.equal(main.protected, true);
  assert.equal(main.commit.sha, record.mergedSource, 'main moved during maintenance observation');
  return { ...record, acceptedSiteIdentityPreserved: true };
}
module.exports = {
  ownerDecision,
  protection,
  focusedProof,
  sourceBinding,
  failureProof,
  verify,
  preserveSite,
};
