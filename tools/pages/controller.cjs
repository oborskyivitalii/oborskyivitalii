'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const flow = require('../staging/review-flow.cjs');

function controller(context, main) {
  assert.equal(context.repo.owner + '/' + context.repo.repo, flow.repository);
  assert.equal(context.ref, 'refs/heads/main', 'Pages publisher must use protected main');
  assert.equal(context.sha, main.commit.sha, 'Pages controller moved');
  assert.equal(main.protected, true);
  assert.equal(context.actor, context.repo.owner, 'Pages publication requires the owner request');
}

function stagingRun(run, jobs) {
  assert.equal(run.path, flow.workflow);
  assert.equal(run.head_branch, 'main');
  assert.ok(['workflow_dispatch', 'issue_comment'].includes(run.event));
  assert.equal(run.actor?.login, 'oborskyivitalii');
  assert.ok(['in_progress', 'completed'].includes(run.status));
  const promotions = jobs.filter((job) => job.name === 'promote');
  assert.equal(promotions.length, 1, 'missing/ambiguous stable promotion');
  assert.equal(promotions[0].conclusion, 'success', 'stable staging was not verified');
  return true;
}

function artifactIdentity(item, run, id, digest, name) {
  assert.equal(item.expired, false);
  assert.equal(String(item.id), String(flow.positive(id)));
  assert.equal(item.workflow_run.id, run.id);
  assert.equal(item.name, name);
  assert.equal(item.digest.replace(/^sha256:/, ''), digest.replace(/^sha256:/, ''));
}

async function activeProduction(github, context) {
  const deployments = await github.paginate(github.rest.repos.listDeployments, {
    ...context.repo,
    environment: 'production',
    per_page: 100,
  });
  for (const deployment of deployments.sort((left, right) => right.id - left.id)) {
    const { data } = await github.rest.repos.listDeploymentStatuses({
      ...context.repo,
      deployment_id: deployment.id,
      per_page: 1,
    });
    if (data[0]?.state !== 'success') continue;
    const payload =
      typeof deployment.payload === 'string' ? JSON.parse(deployment.payload) : deployment.payload;
    // Native environment successes also include authorization jobs, not accepted releases.
    if (payload?.kind !== 'accepted-production') continue;
    assert.equal(deployment.creator?.login, 'github-actions[bot]');
    require('../release/archive.cjs').tag(payload.tag);
    assert.equal(payload.sourceCommit, deployment.sha);
    return { ...payload, deploymentId: deployment.id };
  }
  return null;
}

function sameProduction(actual, expected) {
  assert.deepEqual(
    actual,
    expected
      ? {
          tag: expected.tag,
          sourceCommit: expected.sourceCommit,
          publicDigest: expected.publicDigest,
        }
      : null,
    'live production differs from accepted deployment bookkeeping'
  );
}

function firstFailedPublication(run, publisher, state, production, context, attempt) {
  assert.equal(context.repo.owner + '/' + context.repo.repo, flow.repository);
  assert.equal(production, null, 'failed first staging cannot recover active production');
  assert.equal(state.production, null);
  assert.equal(run.repository?.full_name, flow.repository);
  assert.equal(run.path, flow.workflow, 'failed recovery requires the staging workflow');
  assert.ok(['workflow_dispatch', 'issue_comment'].includes(run.event));
  assert.equal(run.triggering_actor?.login, context.repo.owner);
  assert.equal(run.status, 'completed');
  assert.equal(run.conclusion, 'failure');
  assert.equal(attempt, 1, 'failed first staging cannot reuse a rerun');
  assert.equal(run.run_attempt, attempt, 'failed receipt is not the exact run attempt');
  assert.equal(publisher.name, 'pages / Pages publication');
  assert.equal(publisher.status, 'completed');
  assert.equal(publisher.conclusion, 'failure');
  const browser = (publisher.steps || []).filter(
    (step) => step.name === 'Verify actual staged navigation on the Pages subpath'
  );
  assert.equal(browser.length, 1, 'failed first publication has no unique browser observation');
  assert.equal(browser[0].status, 'completed');
  // REST can report success for a failed continue-on-error command; acceptance
  // comes from the failed job/red guard, never this browser step conclusion.
  assert.ok(['success', 'failure'].includes(browser[0].conclusion));
  const steps = {
    success: [
      'Authenticate controller and actual successful staging producer',
      'Verify actual bounded gate and frozen staging edition',
      'Resolve the currently accepted production archive',
      'Authenticate the current Pages receipt and retained recovery',
      'Compose staging while preserving accepted production file hashes',
      'Retain the complete new package before touching the live site',
      'Recheck the publication controller and active production lease',
      'Run actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e',
      'Verify every hosted Pages byte, staging path and real 404',
      'Retain actual publication observations before acceptance',
    ],
    skipped: [
      'Verify retained and currently hosted recovery bytes before publication',
      'Restore durable production bytes when production is active',
      'Extract and verify the production archive',
      'Retain the previous complete Pages artifact for exact recovery',
      'Restore the previous exact combined Pages artifact on a failed update',
      'Verify the restored Pages publication',
    ],
    failure: ['Keep failed publication or recovery red'],
  };
  for (const [conclusion, names] of Object.entries(steps))
    for (const name of names) {
      const matches = (publisher.steps || []).filter((step) => step.name === name);
      assert.equal(matches.length, 1, 'missing/ambiguous failed-first Pages step: ' + name);
      assert.equal(matches[0].status, 'completed');
      assert.equal(
        matches[0].conclusion,
        conclusion,
        'not a first failed Pages publication: ' + name
      );
    }
}

async function previousPublication(
  github,
  context,
  baseURL,
  production,
  fetcher = fetch,
  allowFailedInitial = false
) {
  const http = require('./http.cjs'),
    base = http.baseURL(baseURL);
  const result = await http.request(base + '/_delivery/state.json', base, fetcher);
  if (result.response.status === 404) {
    assert.equal(production, null, 'active production has no Pages recovery receipt');
    const root = await http.request(base + '/', base, fetcher);
    assert.equal(root.response.status, 404, 'untracked existing Pages publication');
    return null;
  }
  assert.equal(result.response.status, 200, 'cannot observe previous Pages state');
  const state = JSON.parse(result.bytes);
  assert.equal(state.schema, 1);
  assert.equal(
    state.basePath || '/',
    require('./package.cjs').basePath(new URL(base).pathname),
    'live Pages receipt base path differs'
  );
  sameProduction(state.production, production);
  const receipt = state.publication;
  assert.equal(receipt.kind, 'ci-pages');
  const runId = flow.positive(receipt.runId),
    attempt = flow.positive(receipt.attempt);
  assert.match(receipt.controller, /^[a-f0-9]{40}$/);
  const run = (await github.rest.actions.getWorkflowRun({ ...context.repo, run_id: runId })).data;
  assert.equal(run.head_sha, receipt.controller);
  assert.equal(run.head_branch, 'main');
  assert.equal(run.actor?.login, context.repo.owner);
  assert.ok(
    ['site-color-review.yml', 'site-production.yml', 'site-pages-migration.yml'].some(
      (name) => run.path === '.github/workflows/' + name
    )
  );
  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: runId,
    attempt_number: attempt,
    per_page: 100,
  });
  const accepted = jobs.filter(
    (job) => job.name.endsWith(' / Pages publication') || job.name === 'Pages publication'
  );
  assert.equal(accepted.length, 1, 'previous Pages publisher is missing/ambiguous');
  const failedInitial = accepted[0].conclusion === 'failure' && allowFailedInitial;
  if (failedInitial) {
    assert.equal(run.id, runId);
    firstFailedPublication(run, accepted[0], state, production, context, attempt);
  } else
    assert.equal(accepted[0].conclusion, 'success', 'previous Pages publication was not accepted');
  const artifacts = await github.paginate(github.rest.actions.listWorkflowRunArtifacts, {
    ...context.repo,
    run_id: runId,
    per_page: 100,
  });
  const matches = artifacts.filter((item) => item.name === 'site-pages-' + runId + '-' + attempt);
  assert.equal(matches.length, 1, 'previous Pages recovery expired or is ambiguous');
  const item = matches[0];
  assert.equal(
    item.expired,
    false,
    'previous Pages recovery expired; reconcile before publication'
  );
  const record = { runId, attempt, artifactId: item.id, uploadDigest: item.digest, state };
  if (failedInitial) {
    require('../staging/trust.cjs').digest(item.digest);
    artifactIdentity(item, run, item.id, item.digest, matches[0].name);
    assert.equal(item.workflow_run.head_sha, run.head_sha);
    assert.equal(item.workflow_run.head_branch, 'main');
    record.accepted = false;
    record.recoveryKind = 'failed-initial-staging';
    record.receiptDigest = require('../quality/artifact.cjs').digest(result.bytes);
  }
  return record;
}

// Only the staging publisher opts in; production still requires accepted Pages.
function previous(github, context, baseURL, production, fetcher = fetch) {
  return previousPublication(github, context, baseURL, production, fetcher);
}

function previousStaging(github, context, baseURL, production, fetcher = fetch) {
  return previousPublication(github, context, baseURL, production, fetcher, true);
}

function uploadedInventory(bytes) {
  // Inspect authenticated ZIP bytes without extracting or executing their contents.
  const script = `import hashlib, io, json, sys, zipfile
with zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())) as archive:
    entries = archive.infolist()
    if len(entries) > 2001 or len({item.filename for item in entries}) != len(entries):
        raise ValueError('Invalid recovery ZIP inventory')
    if sum(item.file_size for item in entries) > 300_000_000:
        raise ValueError('Recovery ZIP is too large')
    files = {}
    for item in entries:
        name = item.filename
        if name.startswith('/') or '\\\\' in name or any(part in {'.', '..'} for part in name.split('/')):
            raise ValueError('Unsafe recovery ZIP path')
        if (item.external_attr >> 16) & 0o170000 == 0o120000:
            raise ValueError('Recovery ZIP contains a link')
        if name.startswith('pages-package/') and not item.is_dir():
            files[name[len('pages-package/'):]] = hashlib.sha256(archive.read(item)).hexdigest()
    print(json.dumps(files))
`;
  return JSON.parse(
    require('node:child_process').execFileSync('python3', ['-c', script], {
      input: bytes,
      timeout: 20000,
      maxBuffer: 1_000_000,
      encoding: 'utf8',
    })
  );
}

function retained(directory, previousRecord, uploadBytes = null) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'pages-package.json')));
  require('./package.cjs').verify(directory, record);
  assert.deepEqual(
    record.state,
    previousRecord.state,
    'retained recovery differs from live receipt'
  );
  if (previousRecord.accepted === false) {
    assert.equal(previousRecord.recoveryKind, 'failed-initial-staging');
    assert.ok(Buffer.isBuffer(uploadBytes), 'failed first recovery requires its exact upload ZIP');
  }
  if (Buffer.isBuffer(uploadBytes)) {
    const artifact = require('../quality/artifact.cjs');
    assert.equal(
      artifact.digest(uploadBytes),
      require('../staging/trust.cjs').digest(previousRecord.uploadDigest),
      'retained recovery upload changed'
    );
    assert.deepEqual(
      uploadedInventory(uploadBytes),
      {
        'pages-package.json': artifact.digest(
          fs.readFileSync(path.join(directory, 'pages-package.json'))
        ),
        ...Object.fromEntries(
          Object.entries(record.files).map(([name, info]) => ['public/' + name, info.sha256])
        ),
      },
      'retained recovery differs from its authenticated ZIP'
    );
  }
  if (previousRecord.accepted === false) {
    assert.equal(
      record.files['_delivery/state.json'].sha256,
      previousRecord.receiptDigest,
      'failed first recovery receipt bytes differ'
    );
    assert.equal(record.state.production, null);
    assert.deepEqual(record.root, record.staging, 'failed first recovery root is not staging');
    assert.equal(record.staging.sourceDirty, false);
    assert.equal(record.staging.sourceCommit, record.staging.candidateCommit);
    assert.deepEqual(record.state.staging, {
      sourceCommit: record.staging.sourceCommit,
      publicDigest: record.staging.artifactDigest,
    });
    require('./package.cjs').checkStaging(directory, record.root);
  }
  return record;
}

function productionLease(previousRecord, current) {
  sameProduction(previousRecord?.state.production || null, current);
}

function sourceFromPackage(directory, output) {
  const staged = JSON.parse(fs.readFileSync(path.join(directory, 'staging-package.json')));
  require('../staging/package.cjs').verify(directory, staged);
  fs.mkdirSync(path.join(output, 'public'), { recursive: true });
  for (const name of Object.keys(staged.source.files)) {
    const target = path.join(output, 'public', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(directory, 'public', name), target);
  }
  fs.writeFileSync(
    path.join(output, 'artifact.json'),
    JSON.stringify(staged.source, null, 2) + '\n'
  );
  if (staged.rights) {
    fs.writeFileSync(
      path.join(output, 'rights.json'),
      JSON.stringify(staged.rights, null, 2) + '\n'
    );
  }
  return staged.source;
}

function stagingFromPages(directory, output) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'pages-package.json')));
  require('./package.cjs').verify(directory, record);
  fs.mkdirSync(path.join(output, 'public'), { recursive: true });
  for (const name of Object.keys(record.staging.files)) {
    const target = path.join(output, 'public', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(directory, 'public/staging', name), target);
  }
  fs.writeFileSync(
    path.join(output, 'artifact.json'),
    JSON.stringify(record.staging, null, 2) + '\n'
  );
  if (record.rights?.staging) {
    fs.writeFileSync(
      path.join(output, 'rights.json'),
      JSON.stringify(record.rights.staging, null, 2) + '\n'
    );
  }
  require('./package.cjs').checkStaging(output, record.staging);
  return record.staging;
}

module.exports = {
  controller,
  stagingRun,
  artifactIdentity,
  activeProduction,
  sameProduction,
  previous,
  previousStaging,
  retained,
  productionLease,
  sourceFromPackage,
  stagingFromPages,
};
