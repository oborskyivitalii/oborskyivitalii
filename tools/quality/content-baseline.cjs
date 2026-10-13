'use strict';
// A previous successful immutable preview can supply bytes, never new release acceptance.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { isDeepStrictEqual } = require('node:util');
const sourceTests = require('./source-tests.cjs');
const WORKFLOW = 'site-color-review.yml';
const MAX_ARCHIVE_BYTES = 128 * 1024 * 1024;

function git(root, args) {
  return cp
    .execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    .trim();
}

function trustedRun(run, repository, branch, candidate, workflow = WORKFLOW) {
  return (
    run.status === 'completed' &&
    run.conclusion === 'success' &&
    run.head_repository?.full_name === repository &&
    run.head_branch === branch &&
    /^[0-9a-f]{40}$/.test(run.head_sha || '') &&
    run.head_sha !== candidate &&
    String(run.path || '').split('@')[0] === '.github/workflows/' + workflow &&
    Number.isSafeInteger(run.id) &&
    run.id > 0 &&
    Number.isSafeInteger(run.run_attempt) &&
    run.run_attempt > 0
  );
}

function trustedArtifact(artifact, run, workflow = WORKFLOW) {
  const prefix = workflow === 'site-checks.yml' ? 'site-public-basic' : 'site-public-review';
  return (
    artifact.name === `${prefix}-${run.id}-${run.run_attempt}` &&
    artifact.expired === false &&
    Number.isSafeInteger(artifact.id) &&
    artifact.id > 0 &&
    Number.isSafeInteger(artifact.size_in_bytes) &&
    artifact.size_in_bytes > 0 &&
    artifact.size_in_bytes <= MAX_ARCHIVE_BYTES &&
    /^sha256:[0-9a-f]{64}$/.test(artifact.digest || '') &&
    (!artifact.workflow_run ||
      (artifact.workflow_run.id === run.id && artifact.workflow_run.head_sha === run.head_sha))
  );
}

function unpack(bytes, directory) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length > 0 && bytes.length <= MAX_ARCHIVE_BYTES);
  const archive = path.join(directory, 'baseline.zip');
  const output = path.join(directory, 'artifact');
  fs.writeFileSync(archive, bytes);
  const script = `
import pathlib, stat, sys, zipfile
archive, output = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
with zipfile.ZipFile(archive) as z:
    rows = z.infolist()
    assert 0 < len(rows) <= 4000, 'bounded baseline archive inventory'
    assert sum(row.file_size for row in rows) <= 256 * 1024 * 1024, 'baseline expansion bound'
    seen = set()
    for row in rows:
        name = row.filename.rstrip('/')
        parts = name.split('/')
        assert name and not name.startswith('/') and '\\\\' not in name, 'unsafe baseline archive path'
        assert all(part and part not in ('.', '..') for part in parts), 'unsafe archive component'
        assert not any(ord(char) < 32 for char in name), 'archive control character'
        assert name not in seen, 'duplicate archive path'
        seen.add(name)
        kind = stat.S_IFMT(row.external_attr >> 16)
        assert kind in (0, stat.S_IFREG, stat.S_IFDIR), 'non-regular archive entry'
        target = output.joinpath(*parts)
        if row.is_dir(): target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(z.read(row))
`;
  cp.execFileSync('python3', ['-c', script, archive, output], {
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30000,
    maxBuffer: 1024 * 1024,
  });
  fs.rmSync(archive);
  return output;
}

function inspect(directory, run, artifact, expectedTree, expectedCandidates, currentComponents) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  assert.equal(manifest.sourceDirty, false, 'baseline source was dirty');
  assert.equal(manifest.sourceCommit, run.head_sha, 'baseline source/run identity');
  assert.equal(manifest.candidateCommit, run.head_sha, 'baseline candidate/run identity');
  assert.match(expectedTree || '', /^[0-9a-f]{40}$/, 'expected baseline tree identity');
  assert.equal(manifest.sourceTree, expectedTree, 'baseline tree/source identity');
  require('./artifact.cjs').verify(path.join(directory, 'public'), manifest);
  if (!manifest.generation)
    return { reusable: false, reason: 'Prior artifact has no generation declaration' };
  if (
    expectedCandidates !== undefined &&
    JSON.stringify(manifest.articleCandidates || []) !== JSON.stringify(expectedCandidates)
  )
    return {
      reusable: false,
      reason: 'Publication and preview selection differ; ordinary build required',
    };
  assert.match(
    manifest.generation.outputLockSha256 || '',
    /^[0-9a-f]{64}$/,
    'generation lock identity'
  );
  const { generation } = require('./artifact.cjs').trustedContentBaseline({
    directory,
    expectedGenerationSha256: manifest.generation.outputLockSha256,
    expectedArtifactDigest: manifest.artifactDigest,
  });
  if (
    currentComponents !== undefined &&
    !isDeepStrictEqual(generation.components, currentComponents)
  )
    return {
      reusable: false,
      reason: 'Platform or shared rendered content differs; ordinary build required',
    };
  return {
    reusable: true,
    directory,
    runId: run.id,
    artifactId: artifact.id,
    sourceCommit: run.head_sha,
    sourceTree: manifest.sourceTree,
    artifactDigest: manifest.artifactDigest,
    uploadDigest: artifact.digest,
    generationSha256: manifest.generation.outputLockSha256,
  };
}

async function sourceEvidence(github, repo, run) {
  const numbers = [...new Set((run.pull_requests || []).map((pr) => pr.number))];
  if (numbers.length !== 1)
    return { pass: false, reason: 'Baseline has no unique owning PR admission' };
  try {
    const evidence = await require('../staging/admission.cjs').requireAdmission(
      github,
      { repo },
      { draft: false, number: numbers[0], head: { sha: run.head_sha } }
    );
    return { pass: true, evidence };
  } catch (error) {
    return {
      pass: false,
      reason: 'Baseline source/RI/owning admission unavailable: ' + error.message,
    };
  }
}

async function inspectRun({
  github,
  repo,
  root,
  run,
  candidate,
  registry,
  workflow,
  temporaryRoot,
  expectedCandidates,
}) {
  const changedPaths = sourceTests.readChangedPaths(root, run.head_sha, candidate);
  const classification = sourceTests.classifyContent(registry, changedPaths, {
    root,
    base: run.head_sha,
    head: candidate,
  });
  if (classification.mode !== 'content') {
    return { mode: 'platform', runId: run.id, reason: classification.reason };
  }
  const admission = await sourceEvidence(github, repo, run);
  if (!admission.pass) {
    return { mode: 'platform', runId: run.id, reason: admission.reason };
  }
  const artifacts = await github.rest.actions.listWorkflowRunArtifacts({
    ...repo,
    run_id: run.id,
    per_page: 100,
  });
  const artifact = artifacts.data.artifacts.find((row) => trustedArtifact(row, run, workflow));
  if (!artifact) {
    return {
      mode: 'platform',
      runId: run.id,
      reason: 'No live immutable public artifact with archive digest',
    };
  }
  const download = await github.rest.actions.downloadArtifact({
    ...repo,
    artifact_id: artifact.id,
    archive_format: 'zip',
  });
  const bytes = Buffer.from(download.data);
  assert.equal(
    'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex'),
    artifact.digest,
    'baseline upload archive digest'
  );
  const directory = fs.mkdtempSync(path.join(temporaryRoot, 'site-content-baseline-'));
  let result;
  try {
    const builder = require('../site/build.cjs');
    const { config } = builder.configuration(root);
    const currentComponents = builder.fingerprints(root, config, builder.catalog(root));
    result = inspect(
      unpack(bytes, directory),
      run,
      artifact,
      git(root, ['rev-parse', run.head_sha + '^{tree}']),
      expectedCandidates,
      currentComponents
    );
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }
  if (result.reusable)
    return {
      mode: 'content',
      ...result,
      classification,
      sourceEvidence: admission.evidence,
    };
  fs.rmSync(directory, { recursive: true, force: true });
  return { mode: 'platform', runId: run.id, reason: result.reason };
}

async function select({
  github,
  repo,
  branch,
  candidate,
  root,
  base,
  workflow = WORKFLOW,
  temporaryRoot = os.tmpdir(),
}) {
  assert.match(candidate || '', /^[0-9a-f]{40}$/);
  assert.ok([WORKFLOW, 'site-checks.yml'].includes(workflow), 'unsupported baseline workflow');
  if (base !== undefined) assert.match(base, /^[0-9a-f]{40}$/);
  assert.equal(git(root, ['rev-parse', 'HEAD']), candidate, 'baseline checkout identity');
  const repository = repo.owner + '/' + repo.repo;
  const registry = sourceTests.validateRegistry(root, sourceTests.loadRegistry(root));
  const observations = [];
  const expectedCandidates = require('./artifact.cjs').previewSelection(undefined, root);
  for (const selectedBranch of [...new Set([branch, 'main', ...(base ? [null] : [])])]) {
    assert.ok(
      selectedBranch === null || (typeof selectedBranch === 'string' && selectedBranch.length > 0)
    );
    const response = await github.rest.actions.listWorkflowRuns({
      ...repo,
      workflow_id: workflow,
      ...(selectedBranch ? { branch: selectedBranch } : {}),
      status: 'success',
      per_page: selectedBranch ? 10 : 30,
    });
    for (const run of response.data.workflow_runs) {
      if (!trustedRun(run, repository, selectedBranch || run.head_branch, candidate, workflow))
        continue;
      if (
        selectedBranch === null &&
        cp.spawnSync('git', ['merge-base', '--is-ancestor', run.head_sha, base], {
          cwd: root,
          stdio: 'ignore',
        }).status !== 0
      )
        continue;
      const ancestor = cp.spawnSync(
        'git',
        ['merge-base', '--is-ancestor', run.head_sha, candidate],
        {
          cwd: root,
          stdio: 'ignore',
        }
      );
      if (ancestor.status !== 0) continue;
      const result = await inspectRun({
        github,
        repo,
        root,
        run,
        candidate,
        registry,
        workflow,
        temporaryRoot,
        expectedCandidates,
      });
      if (result.mode === 'content') return { ...result, observations };
      observations.push({ runId: result.runId, reason: result.reason });
    }
  }
  return {
    mode: 'platform',
    reason: 'No compatible trusted earlier generation; ordinary platform build required',
    observations,
  };
}

module.exports = {
  WORKFLOW,
  MAX_ARCHIVE_BYTES,
  trustedRun,
  trustedArtifact,
  unpack,
  inspect,
  sourceEvidence,
  select,
};
