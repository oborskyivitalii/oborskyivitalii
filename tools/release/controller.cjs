'use strict';
// Only an owner dispatch on protected main can consume full evidence or change production.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const archive = require('./archive.cjs');
const pages = require('../pages/controller.cjs');
const flow = require('../staging/review-flow.cjs');
const edition = require('./edition.cjs');
const workflow = '.github/workflows/site-production.yml';
const labels = ['active-production', 'archived-production'];

function authorize(context, main, enabled) {
  pages.controller(context, main);
  assert.equal(context.eventName, 'workflow_dispatch');
  assert.equal(enabled, 'true', 'production activation is disabled');
}

async function optional(operation) {
  try {
    return (await operation()).data;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

function producer(run, context, paths) {
  assert.ok(paths.includes(run.path), 'untrusted evidence workflow');
  assert.equal(run.event, 'workflow_dispatch');
  assert.equal(run.head_branch, 'main');
  assert.match(run.head_sha, /^[a-f0-9]{40}$/);
  assert.equal(run.head_repository.full_name, flow.repository);
  assert.equal(run.actor.login, context.repo.owner);
  assert.equal(run.status, 'completed');
  assert.equal(run.conclusion, 'success');
  return run;
}

async function validation(github, context, runId) {
  const run = producer(
    (await github.rest.actions.getWorkflowRun({ ...context.repo, run_id: flow.positive(runId) }))
      .data,
    context,
    ['.github/workflows/site-candidate-evidence.yml', '.github/workflows/site-release-checks.yml']
  );
  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: run.id,
    attempt_number: run.run_attempt,
    per_page: 100,
  });
  for (const name of [
    'build',
    'static',
    'linux',
    'Native darwin',
    'Native win32',
    'performance',
    'captures',
    'host',
    'gate',
  ]) {
    const matches = jobs.filter((job) => job.name.split(' / ').at(-1) === name);
    assert.equal(matches.length, 1, 'missing/ambiguous full production job: ' + name);
    assert.equal(matches[0].status, 'completed');
    assert.equal(matches[0].conclusion, 'success', 'full production job did not pass: ' + name);
  }
  const items = await github.paginate(github.rest.actions.listWorkflowRunArtifacts, {
    ...context.repo,
    run_id: run.id,
    per_page: 100,
  });
  const gates = items.filter(
    (item) => item.name === 'site-gate-full-staging-' + run.id + '-' + run.run_attempt
  );
  assert.equal(gates.length, 1, 'full gate artifact missing/ambiguous');
  const reports = items.filter(
    (item) =>
      item.name.startsWith('site-reports-') &&
      item.name.endsWith('-staging-' + run.id + '-' + run.run_attempt)
  );
  assert.deepEqual(
    reports.map((item) => item.name).sort(),
    ['host', 'static', 'linux', 'darwin', 'win32', 'performance', 'captures']
      .map((name) => 'site-reports-' + name + '-staging-' + run.id + '-' + run.run_attempt)
      .sort(),
    'raw full production reports are missing or ambiguous'
  );
  for (const item of [gates[0], ...reports]) {
    assert.equal(item.expired, false, 'full production evidence expired');
    assert.match(item.digest, /^sha256:[a-f0-9]{64}$/);
    assert.equal(item.workflow_run.id, run.id);
  }
  return { run, gate: gates[0], reports };
}

function productionClient(github, token = process.env.PRODUCTION_APP_TOKEN) {
  assert.ok(token, 'protected production App installation token is not configured');
  // Octokit's token-auth hook overwrites per-request Authorization headers.
  // The installed App owns protected refs/releases; Pages, labels and deployment
  // records keep the ordinary workflow client and its authenticated identity.
  return new github.constructor({ auth: token });
}

function productionAppId(value = process.env.PRODUCTION_APP_ID) {
  assert.ok(value, 'installed production App ID is not configured');
  const id = flow.positive(value);
  assert.notEqual(id, 15368, 'the internal GitHub Actions App is not the installed publisher');
  return id;
}

async function protection(github, context, settingsGithub = null, appId = undefined) {
  const id = productionAppId(appId);
  if (!settingsGithub) settingsGithub = productionClient(github);
  const { data: rules } = await settingsGithub.request('GET /repos/{owner}/{repo}/rulesets', {
    ...context.repo,
    per_page: 100,
  });
  const matches = rules.filter(
    (rule) => rule.name === 'protect-production' && rule.enforcement === 'active'
  );
  assert.equal(matches.length, 1, 'protected production source ruleset is not configured');
  const { data: rule } = await settingsGithub.request(
    'GET /repos/{owner}/{repo}/rulesets/{ruleset_id}',
    {
      ...context.repo,
      ruleset_id: matches[0].id,
    }
  );
  assert.equal(rule.name, 'protect-production');
  assert.equal(rule.enforcement, 'active');
  assert.equal(rule.target, 'branch');
  assert.deepEqual(rule.conditions.ref_name, { include: ['refs/heads/production'], exclude: [] });
  assert.deepEqual(rule.rules.map((item) => item.type).sort(), [
    'creation',
    'deletion',
    'non_fast_forward',
    'update',
  ]);
  assert.deepEqual(rule.bypass_actors, [
    { actor_id: id, actor_type: 'Integration', bypass_mode: 'always' },
  ]);
  return rule.id;
}

async function sourcePR(github, context, record, number) {
  const pr = (await github.rest.pulls.get({ ...context.repo, pull_number: flow.positive(number) }))
    .data;
  assert.equal(pr.merged, true, 'production source must first be merged');
  assert.equal(pr.base.ref, 'main');
  assert.equal(pr.base.repo.full_name, flow.repository);
  assert.equal(pr.head.repo.full_name, flow.repository);
  assert.ok(
    [pr.head.sha, pr.merge_commit_sha].includes(record.sourceCommit),
    'wrong production PR/source'
  );
  const commit = (await github.rest.repos.getCommit({ ...context.repo, ref: record.sourceCommit }))
    .data;
  assert.equal(commit.commit.tree.sha, record.sourceTree);
  const comparison = (
    await github.rest.repos.compareCommitsWithBasehead({
      ...context.repo,
      basehead: record.sourceCommit + '...' + context.sha,
    })
  ).data;
  assert.equal(
    comparison.merge_base_commit.sha,
    record.sourceCommit,
    'source is not accepted main history'
  );
  return pr;
}

async function publicArtifact(github, context, gate) {
  const item = (
    await github.rest.actions.getArtifact({
      ...context.repo,
      artifact_id: flow.positive(gate.githubArtifact.id),
    })
  ).data;
  assert.equal(item.expired, false);
  assert.equal(
    item.digest.replace(/^sha256:/, ''),
    gate.githubArtifact.uploadDigest.replace(/^sha256:/, '')
  );
  const run = producer(
    (
      await github.rest.actions.getWorkflowRun({
        ...context.repo,
        run_id: item.workflow_run.id,
      })
    ).data,
    context,
    ['.github/workflows/site-release-candidate.yml']
  );
  assert.equal(item.name, 'site-production-candidate-' + run.id + '-' + run.run_attempt);
  return item;
}

async function wasAccepted(github, context, record) {
  const deployments = await github.paginate(github.rest.repos.listDeployments, {
    ...context.repo,
    environment: 'production',
    sha: record.sourceCommit,
    per_page: 100,
  });
  for (const deployment of deployments) {
    const payload =
      typeof deployment.payload === 'string' ? JSON.parse(deployment.payload) : deployment.payload;
    if (
      deployment.creator.login !== 'github-actions[bot]' ||
      payload.kind !== 'accepted-production' ||
      payload.tag !== record.tag ||
      payload.publicDigest !== record.publicDigest
    )
      continue;
    const statuses = await github.paginate(github.rest.repos.listDeploymentStatuses, {
      ...context.repo,
      deployment_id: deployment.id,
      per_page: 100,
    });
    // A remotely committed success can still be followed by failed-response
    // compensation. Preserve ordinary superseded releases, but do not let that
    // historical status admit a failed transaction as a rollback target.
    if (
      ['success', 'inactive'].includes(statuses[0]?.state) &&
      statuses.some((item) => item.state === 'success')
    )
      return true;
  }
  throw Error('rollback requires a previously live accepted release');
}

function admission(directory, gate, evidence, publicItem) {
  const record = require('../pages/package.cjs').read(directory);
  edition.verify(directory, record);
  archive.candidate(record, gate, evidence);
  assert.equal(String(gate.githubArtifact.id), String(publicItem.id));
  assert.equal(
    gate.githubArtifact.uploadDigest.replace(/^sha256:/, ''),
    publicItem.digest.replace(/^sha256:/, '')
  );
  assert.equal(publicItem.expired, false);
  assert.ok(
    evidence.rights?.pass === true && evidence.rights.reviewer && evidence.rights.record,
    'applicable publication rights acceptance remains pending'
  );
  return record;
}

function evidenceFiles(directory, proof) {
  const files = {};
  for (const item of proof.reports) {
    const name = 'evidence-' + item.id + '.zip';
    const bytes = fs.readFileSync(path.join(directory, name));
    assert.equal(
      'sha256:' + artifact.digest(bytes),
      item.digest,
      'raw production evidence changed'
    );
    files[name] = { sha256: artifact.digest(bytes), raw: bytes.length, artifactId: item.id };
  }
  return files;
}

function createArchive(directory, proof, gate, evidence, options) {
  const record = archive.create(
    require('../pages/package.cjs').read(directory),
    gate,
    evidence,
    options
  );
  record.releasePR = flow.positive(options.releasePR);
  record.origin = edition.origin;
  record.validation = {
    runId: proof.run.id,
    attempt: proof.run.run_attempt,
    controller: proof.run.head_sha,
    gateArtifactId: proof.gate.id,
    gateUploadDigest: proof.gate.digest,
  };
  record.evidenceFiles = options.evidenceFiles;
  assert.ok(Object.keys(record.evidenceFiles).length >= 6);
  return record;
}

async function releaseAsset(github, context, item) {
  assert.equal(item.state, 'uploaded');
  assert.ok(item.size > 0 && item.size <= 300_000_000, 'release asset exceeds the transfer bound');
  const response = await github.rest.repos.getReleaseAsset({
    ...context.repo,
    asset_id: item.id,
    headers: { accept: 'application/octet-stream' },
  });
  const bytes = Buffer.from(response.data);
  assert.equal(bytes.length, item.size);
  assert.equal('sha256:' + artifact.digest(bytes), item.digest, 'durable release asset changed');
  return bytes;
}

async function releaseSource(github, context, tag, source) {
  const ref = (await github.rest.git.getRef({ ...context.repo, ref: 'tags/' + archive.tag(tag) }))
    .data;
  assert.equal(ref.object.type, 'commit', 'release must retain the exact source commit');
  assert.equal(ref.object.sha, source, 'immutable source tag moved');
}

async function restoreArchive(github, context, tag, directory) {
  const release = (
    await github.rest.repos.getReleaseByTag({ ...context.repo, tag: archive.tag(tag) })
  ).data;
  assert.equal(release.draft, false);
  assert.equal(
    release.immutable,
    true,
    'release assets/tags are not protected by GitHub immutability'
  );
  const items = await github.paginate(github.rest.repos.listReleaseAssets, {
    ...context.repo,
    release_id: release.id,
    per_page: 100,
  });
  const records = items.filter((item) => item.name === 'archive.json');
  assert.equal(records.length, 1);
  const recordBytes = await releaseAsset(github, context, records[0]);
  const record = JSON.parse(recordBytes);
  assert.equal(record.tag, tag);
  assert.equal(record.origin, edition.origin);
  flow.positive(record.releasePR);
  for (const name of Object.keys(record.evidenceFiles))
    assert.match(name, /^evidence-(?:run-)?[1-9]\d*\.zip$/);
  await releaseSource(github, context, tag, record.sourceCommit);
  const expected = [
    'archive.json',
    'public.tar.gz',
    'activation.json',
    'observations.tar.gz',
    ...Object.keys(record.evidenceFiles),
  ].sort();
  assert.deepEqual(
    items.map((item) => item.name).sort(),
    expected,
    'durable evidence inventory differs'
  );
  fs.mkdirSync(directory, { recursive: true });
  assert.equal(fs.readdirSync(directory).length, 0, 'release restore directory must be empty');
  const activationItem = items.find((item) => item.name === 'activation.json');
  const activationBytes = await releaseAsset(github, context, activationItem);
  const activation = JSON.parse(activationBytes);
  live(record, activation.observation);
  assert.equal(activation.tag, record.tag);
  assert.equal(activation.packageDigest, record.packageDigest);
  flow.positive(activation.productionDeploymentId);
  assert.match(activation.observationsDigest, /^[a-f0-9]{64}$/);
  for (const item of items) {
    const bytes =
      item.name === 'archive.json' ? recordBytes : await releaseAsset(github, context, item);
    if (item.name === 'public.tar.gz') assert.equal(artifact.digest(bytes), record.packageDigest);
    else if (item.name === 'observations.tar.gz') {
      assert.equal(artifact.digest(bytes), activation.observationsDigest);
    } else if (item.name === 'activation.json') {
      assert.deepEqual(bytes, activationBytes);
    } else if (item.name !== 'archive.json') {
      assert.match(item.name, /^evidence-(?:run-)?[1-9]\d*\.zip$/);
      assert.equal(artifact.digest(bytes), record.evidenceFiles[item.name].sha256);
    }
    fs.writeFileSync(path.join(directory, item.name), bytes);
  }
  return record;
}

async function publishArchive(
  github,
  context,
  directory,
  record,
  activation = null,
  control = productionClient(github)
) {
  const tag = archive.tag(record.tag);
  let release = await optional(() => control.rest.repos.getReleaseByTag({ ...context.repo, tag }));
  const names = [
    'archive.json',
    'public.tar.gz',
    ...Object.keys(record.evidenceFiles),
    ...(activation ? ['activation.json', 'observations.tar.gz'] : []),
  ].sort();
  if (activation) {
    live(record, activation.observation);
    assert.equal(activation.tag, record.tag);
    assert.equal(activation.packageDigest, record.packageDigest);
    flow.positive(activation.productionDeploymentId);
    assert.equal(
      artifact.digest(fs.readFileSync(path.join(directory, 'observations.tar.gz'))),
      activation.observationsDigest
    );
  }
  const expected = Object.fromEntries(
    names.map((name) => [name, fs.readFileSync(path.join(directory, name))])
  );
  if (!release) {
    const ref = await optional(() =>
      control.rest.git.getRef({ ...context.repo, ref: 'tags/' + tag })
    );
    assert.equal(ref, null, 'untracked tag cannot be reused for an archive');
    await control.rest.git.createRef({
      ...context.repo,
      ref: 'refs/tags/' + tag,
      sha: record.sourceCommit,
    });
    release = (
      await control.rest.repos.createRelease({
        ...context.repo,
        tag_name: tag,
        target_commitish: record.sourceCommit,
        name: tag,
        body: 'Exact admitted production package and complete evidence. Active identity is the production deployment record.',
        draft: true,
        prerelease: false,
        make_latest: 'false',
      })
    ).data;
  }
  await releaseSource(control, context, tag, record.sourceCommit);
  let items = await control.paginate(control.rest.repos.listReleaseAssets, {
    ...context.repo,
    release_id: release.id,
    per_page: 100,
  });
  for (const item of items) {
    assert.ok(Object.hasOwn(expected, item.name), 'unexpected existing archive asset');
    assert.deepEqual(
      await releaseAsset(control, context, item),
      expected[item.name],
      'archive asset cannot be replaced'
    );
  }
  for (const name of names) {
    if (items.some((item) => item.name === name)) continue;
    assert.equal(release.draft, true, 'published archive cannot gain new assets');
    const bytes = expected[name];
    await control.rest.repos.uploadReleaseAsset({
      ...context.repo,
      release_id: release.id,
      name,
      data: bytes,
      headers: { 'content-type': 'application/octet-stream', 'content-length': bytes.length },
    });
  }
  items = await control.paginate(control.rest.repos.listReleaseAssets, {
    ...context.repo,
    release_id: release.id,
    per_page: 100,
  });
  assert.deepEqual(items.map((item) => item.name).sort(), names);
  for (const item of items)
    assert.deepEqual(await releaseAsset(control, context, item), expected[item.name]);
  await releaseSource(control, context, tag, record.sourceCommit);
  if (!activation) {
    assert.equal(
      release.draft,
      true,
      'new publication cannot reuse an accepted immutable identity'
    );
    return release;
  }
  if (release.draft)
    release = (
      await control.rest.repos.updateRelease({
        ...context.repo,
        release_id: release.id,
        draft: false,
        make_latest: 'false',
      })
    ).data;
  assert.equal(release.immutable, true, 'enable repository immutable Releases before production');
  await releaseSource(control, context, tag, record.sourceCommit);
  return release;
}

async function branch(github, context) {
  const ref = await optional(() =>
    github.rest.git.getRef({ ...context.repo, ref: 'heads/production' })
  );
  return ref?.object.sha || null;
}

async function plan(github, context, current, desired) {
  assert.equal(
    await branch(github, context),
    current?.sourceCommit || null,
    'production source/accepted deployment differ'
  );
  const active = await github.paginate(github.rest.issues.listForRepo, {
    ...context.repo,
    labels: labels[0],
    state: 'all',
    per_page: 100,
  });
  assert.deepEqual(
    active.map((item) => item.number).sort((a, b) => a - b),
    current ? [current.releasePR] : [],
    'active production labels/accepted deployment differ'
  );
  const saved = {};
  for (const number of new Set([current?.releasePR, desired.releasePR].filter(Boolean))) {
    const pr = (await github.rest.pulls.get({ ...context.repo, pull_number: number })).data;
    saved[number] = pr.labels.map((item) => item.name).filter((name) => labels.includes(name));
  }
  return { schema: 1, kind: 'production-transition', before: current, desired, savedLabels: saved };
}

async function setLabels(github, context, number, wanted) {
  for (const name of labels) {
    if (wanted.includes(name)) {
      if (!(await optional(() => github.rest.issues.getLabel({ ...context.repo, name }))))
        await github.rest.issues.createLabel({
          ...context.repo,
          name,
          color: name === labels[0] ? '0E8A16' : '6E7781',
          description:
            name === labels[0]
              ? 'PR source of the verified active production deployment'
              : 'PR source previously accepted in production',
        });
      await github.rest.issues.addLabels({
        ...context.repo,
        issue_number: Number(number),
        labels: [name],
      });
    } else
      await optional(() =>
        github.rest.issues.removeLabel({ ...context.repo, issue_number: Number(number), name })
      );
  }
}

async function move(github, context, expected, source, control = productionClient(github)) {
  assert.equal(await branch(github, context), expected, 'production ref moved during publication');
  if (source === null) {
    if (expected) await control.rest.git.deleteRef({ ...context.repo, ref: 'heads/production' });
  } else if (expected === null) {
    await control.rest.git.createRef({
      ...context.repo,
      ref: 'refs/heads/production',
      sha: source,
    });
  } else if (source !== expected) {
    await control.rest.git.updateRef({
      ...context.repo,
      ref: 'heads/production',
      sha: source,
      force: true,
    });
  }
  assert.equal(await branch(github, context), source);
}

async function pending(github, context, transaction) {
  const release = transaction.desired;
  const deployment = (
    await github.rest.repos.createDeployment({
      ...context.repo,
      ref: release.sourceCommit,
      environment: 'production',
      auto_merge: false,
      required_contexts: [],
      transient_environment: false,
      production_environment: true,
      payload: {
        kind: 'accepted-production',
        tag: release.tag,
        sourceCommit: release.sourceCommit,
        publicDigest: release.publicDigest,
        packageDigest: release.packageDigest,
        releasePR: release.releasePR,
        origin: release.origin,
      },
    })
  ).data;
  transaction.deploymentId = deployment.id;
  await github.rest.repos.createDeploymentStatus({
    ...context.repo,
    deployment_id: deployment.id,
    state: 'in_progress',
    log_url: 'https://github.com/' + flow.repository + '/actions/runs/' + context.runId,
    auto_inactive: false,
  });
  return transaction;
}

function live(release, observation) {
  archive.transition(null, release, observation);
  assert.equal(observation.deploymentURL, edition.origin + '/');
  for (const check of ['pages', 'productionPolicy', 'browser', 'passiveScan', 'retained'])
    assert.equal(observation[check], true, 'production live acceptance missing: ' + check);
}

async function accept(
  github,
  context,
  transaction,
  observation,
  control = productionClient(github)
) {
  const release = transaction.desired;
  live(release, observation);
  assert.deepEqual(
    await pages.activeProduction(github, context),
    transaction.before,
    'active production changed'
  );
  await move(
    github,
    context,
    transaction.before?.sourceCommit || null,
    release.sourceCommit,
    control
  );
  for (const number of Object.keys(transaction.savedLabels))
    await setLabels(github, context, number, [
      Number(number) === release.releasePR ? labels[0] : labels[1],
    ]);
  await github.rest.repos.createDeploymentStatus({
    ...context.repo,
    deployment_id: transaction.deploymentId,
    state: 'success',
    environment_url: observation.deploymentURL,
    auto_inactive: true,
    log_url: 'https://github.com/' + flow.repository + '/actions/runs/' + context.runId,
  });
  return archive.transition(
    transaction.before ? { active: transaction.before, archived: [] } : null,
    release,
    observation
  );
}

async function recover(
  github,
  context,
  transaction,
  observation,
  control = productionClient(github)
) {
  assert.equal(observation.pass, true, 'verify restored Pages bytes before restoring bookkeeping');
  assert.equal(observation.productionTag, transaction.before?.tag || null);
  const actual = await branch(github, context);
  assert.ok(
    [transaction.before?.sourceCommit || null, transaction.desired.sourceCommit].includes(actual),
    'unrelated production ref cannot be overwritten'
  );
  await move(github, context, actual, transaction.before?.sourceCommit || null, control);
  for (const [number, wanted] of Object.entries(transaction.savedLabels))
    await setLabels(github, context, number, wanted);
  await github.rest.repos.createDeploymentStatus({
    ...context.repo,
    deployment_id: transaction.deploymentId,
    state: 'failure',
    description: 'Publication failed; previous exact Pages package restored and verified',
    auto_inactive: false,
  });
  if (transaction.before)
    await github.rest.repos.createDeploymentStatus({
      ...context.repo,
      deployment_id: transaction.before.deploymentId,
      state: 'success',
      environment_url: edition.origin + '/',
      auto_inactive: true,
    });
  return true;
}

module.exports = {
  workflow,
  authorize,
  producer,
  validation,
  productionClient,
  productionAppId,
  protection,
  sourcePR,
  publicArtifact,
  wasAccepted,
  admission,
  evidenceFiles,
  createArchive,
  releaseAsset,
  releaseSource,
  restoreArchive,
  publishArchive,
  branch,
  plan,
  move,
  pending,
  live,
  accept,
  recover,
};
