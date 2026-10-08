'use strict';
// Credential-free checks shared by live source and immutable recovery records.
const assert = require('node:assert/strict');
const repository = 'oborskyivitalii/oborskyivitalii',
  repositoryId = 1400059184,
  branch = 'main',
  workflow = '.github/workflows/site-checks.yml';
function digest(value) {
  assert.match(value || '', /^(?:sha256:)?[0-9a-f]{64}$/, 'missing/invalid upload digest');
  return value.replace(/^sha256:/, '');
}
function context(env = process.env) {
  assert.equal(env.GITHUB_REPOSITORY, repository, 'wrong repository');
  assert.equal(env.GITHUB_EVENT_NAME, 'workflow_dispatch', 'staging accepts manual dispatch only');
  assert.equal(env.GITHUB_REF, 'refs/heads/' + branch, 'staging caller must run on main');
  assert.match(env.SITE_CANDIDATE_SHA || '', /^[0-9a-f]{40}$/, 'invalid approved candidate');
  assert.equal(env.GITHUB_SHA, env.SITE_CANDIDATE_SHA, 'candidate is not the caller source');
  assert.equal(
    env.GITHUB_WORKFLOW_REF,
    repository + '/' + workflow + '@refs/heads/' + branch,
    'unauthorized caller workflow'
  );
  assert.equal(env.GITHUB_WORKFLOW_SHA, env.SITE_CANDIDATE_SHA, 'workflow/source mismatch');
  assert.match(env.GITHUB_RUN_ID || '', /^[1-9][0-9]*$/);
  assert.match(env.GITHUB_RUN_ATTEMPT || '', /^[1-9][0-9]*$/);
  return true;
}
function runSource(run, sha, id, attempt) {
  assert.equal(run.repository?.full_name, repository, 'workflow run repository mismatch');
  assert.equal(run.head_repository?.full_name, repository, 'fork workflow run');
  assert.equal(run.event, 'workflow_dispatch', 'unauthorized run event');
  assert.equal(run.path, workflow, 'unauthorized source workflow');
  assert.equal(run.head_branch, branch, 'unauthorized run branch');
  assert.equal(run.head_sha, sha, 'workflow run/source mismatch');
  assert.equal(String(run.id), String(id), 'workflow run ID mismatch');
  assert.equal(String(run.run_attempt), String(attempt), 'workflow attempt mismatch');
  return true;
}
function trustedHead(head, run, env = process.env) {
  context(env);
  assert.equal(head.name, branch, 'wrong live branch');
  assert.equal(head.protected, true, 'main must be protected');
  assert.equal(
    head.commit?.sha,
    env.SITE_CANDIDATE_SHA,
    'stale main source cannot replace staging'
  );
  return runSource(run, env.SITE_CANDIDATE_SHA, env.GITHUB_RUN_ID, env.GITHUB_RUN_ATTEMPT);
}
function artifactSource(artifact, { id, sha, runId, attempt, name, uploadDigest }) {
  assert.equal(String(artifact.id), String(id), 'artifact ID mismatch');
  assert.equal(artifact.expired, false, 'artifact expired');
  assert.equal(artifact.name, name, 'artifact name/attempt mismatch');
  assert.equal(digest(artifact.digest), digest(uploadDigest), 'artifact upload digest mismatch');
  const run = artifact.workflow_run;
  assert.equal(String(run?.id), String(runId), 'artifact run mismatch');
  assert.equal(run.repository_id, repositoryId, 'artifact repository mismatch');
  assert.equal(run.head_repository_id, repositoryId, 'fork artifact');
  assert.equal(run.head_branch, branch, 'artifact branch mismatch');
  assert.equal(run.head_sha, sha, 'artifact source mismatch');
  assert.match(String(attempt), /^[1-9][0-9]*$/);
  return true;
}
module.exports = {
  repository,
  repositoryId,
  branch,
  workflow,
  digest,
  context,
  runSource,
  trustedHead,
  artifactSource,
};
