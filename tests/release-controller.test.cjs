'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const fixture = require('./fixtures/delivery.cjs');
const controller = require('../tools/release/controller.cjs');
const edition = require('../tools/release/edition.cjs');
const artifact = require('../tools/quality/artifact.cjs');
const pages = require('../tools/pages/package.cjs');
const passive = require('../tools/release/passive.cjs');
const releaseLive = require('../tools/release/live.cjs');
const context = {
  repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
  actor: 'oborskyivitalii',
  ref: 'refs/heads/main',
  sha: 'f'.repeat(40),
  eventName: 'workflow_dispatch',
  runId: 900,
};

function releaseFixture(t) {
  const temp = fixture.temporary(t);
  const source = fixture.source(temp, 'production');
  source.record = edition.build(source.directory);
  const proof = fixture.fullProof(source.record);
  const directory = path.join(temp, 'assets');
  fs.mkdirSync(directory);
  cp.execFileSync('python3', [
    'tools/release/package.py',
    'pack',
    source.directory,
    directory + '/public.tar.gz',
  ]);
  const reports = Array.from({ length: 7 }, (_, i) => {
    const bytes = Buffer.from('raw fixture evidence ' + i);
    const item = { id: 100 + i, digest: 'sha256:' + artifact.digest(bytes) };
    fs.writeFileSync(directory + '/evidence-' + item.id + '.zip', bytes);
    return item;
  });
  const evidenceFiles = controller.evidenceFiles(directory, { reports });
  const record = controller.createArchive(
    source.directory,
    {
      run: { id: 800, run_attempt: 1, head_sha: context.sha },
      gate: { id: 50, digest: 'sha256:' + 'd'.repeat(64) },
    },
    proof.gate,
    proof.external,
    {
      tag: 'prod-2026-10-11.1',
      releasePR: 73,
      previousTag: null,
      packageDigest: artifact.digest(fs.readFileSync(directory + '/public.tar.gz')),
      createdAt: '2026-10-11T00:00:00Z',
      runURL: 'https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/800',
      evidenceFiles,
    }
  );
  fs.writeFileSync(directory + '/archive.json', JSON.stringify(record, null, 2) + '\n');
  return { temp, directory, source, proof, record };
}

function live(record) {
  return {
    pass: true,
    sourceCommit: record.sourceCommit,
    publicDigest: record.publicDigest,
    deploymentURL: edition.origin + '/',
    pages: true,
    productionPolicy: true,
    browser: true,
    passiveScan: true,
    retained: true,
  };
}

function github(immutable = true) {
  const state = {
    refs: new Map(),
    releases: new Map(),
    assets: [],
    deployments: [],
    flags: new Map([
      [73, new Set()],
      [67, new Set()],
    ]),
    calls: [],
  };
  const missing = () => {
    throw Object.assign(Error('not found'), { status: 404 });
  };
  let serial = 1;
  const rest = {
    git: {
      getRef: async ({ ref }) =>
        state.refs.has(ref)
          ? { data: { object: { type: 'commit', sha: state.refs.get(ref) } } }
          : missing(),
      createRef: async ({ ref, sha }) => {
        state.refs.set(ref.replace(/^refs\//, ''), sha);
        state.calls.push('ref');
        return { data: {} };
      },
      updateRef: async ({ ref, sha, force }) => {
        assert.equal(force, true);
        state.refs.set(ref, sha);
        state.calls.push('ref');
        return { data: {} };
      },
      deleteRef: async ({ ref }) => {
        state.refs.delete(ref);
        return { data: {} };
      },
    },
    repos: {
      getReleaseByTag: async ({ tag }) =>
        state.releases.has(tag) ? { data: state.releases.get(tag) } : missing(),
      createRelease: async (value) => {
        assert.equal(value.draft, true);
        const release = { ...value, id: serial++, immutable: false };
        state.releases.set(value.tag_name, release);
        state.calls.push('draft');
        return { data: release };
      },
      listReleaseAssets: 'assets',
      uploadReleaseAsset: async ({ release_id, name, data }) => {
        const item = {
          id: serial++,
          release_id,
          name,
          bytes: Buffer.from(data),
          size: data.length,
          state: 'uploaded',
          digest: 'sha256:' + artifact.digest(data),
        };
        state.assets.push(item);
        state.calls.push('asset:' + name);
        return { data: item };
      },
      getReleaseAsset: async ({ asset_id }) => ({
        data: state.assets.find((item) => item.id === asset_id).bytes,
      }),
      updateRelease: async ({ release_id }) => {
        const release = [...state.releases.values()].find((item) => item.id === release_id);
        release.draft = false;
        release.immutable = immutable;
        state.calls.push('immutable');
        return { data: release };
      },
      listDeployments: 'deployments',
      listDeploymentStatuses: 'statuses',
      createDeployment: async (value) => {
        const deployment = {
          ...value,
          id: serial++,
          sha: value.ref,
          creator: { login: 'github-actions[bot]' },
          statuses: [],
        };
        state.deployments.push(deployment);
        return { data: deployment };
      },
      createDeploymentStatus: async ({ deployment_id, state: status }) => {
        const deployment = state.deployments.find((item) => item.id === deployment_id);
        deployment.statuses.unshift({ state: status });
        state.calls.push('status:' + status);
        return { data: {} };
      },
    },
    pulls: {
      get: async ({ pull_number }) => ({
        data: { labels: [...state.flags.get(pull_number)].map((name) => ({ name })) },
      }),
    },
    issues: {
      listForRepo: 'active-labels',
      getLabel: async ({ name }) => ({ data: { name } }),
      createLabel: async (value) => ({ data: value }),
      addLabels: async ({ issue_number, labels }) => {
        for (const name of labels) state.flags.get(issue_number).add(name);
        state.calls.push('label');
        return { data: {} };
      },
      removeLabel: async ({ issue_number, name }) => {
        if (!state.flags.get(issue_number).delete(name)) return missing();
        return { data: {} };
      },
    },
  };
  rest.repos.listDeploymentStatuses = async ({ deployment_id }) => ({
    data: state.deployments.find((item) => item.id === deployment_id).statuses.slice(0, 1),
  });
  return {
    state,
    rest,
    paginate: async (method, value) => {
      if (method === 'active-labels')
        return [...state.flags]
          .filter(([, names]) => names.has('active-production'))
          .map(([number]) => ({ number }));
      if (method === 'assets')
        return state.assets.filter((item) => item.release_id === value.release_id);
      if (method === 'deployments') return state.deployments.slice();
      return state.deployments.find((item) => item.id === value.deployment_id).statuses;
    },
  };
}

test('production remains disabled except an owner dispatch on the exact protected main', () => {
  const main = { commit: { sha: context.sha }, protected: true };
  controller.authorize(context, main, 'true');
  for (const flag of [undefined, '', 'false'])
    assert.throws(() => controller.authorize(context, main, flag), /disabled/);
  for (const mutation of [
    { actor: 'another-user' },
    { eventName: 'push' },
    { ref: 'refs/heads/work' },
    { sha: 'b'.repeat(40) },
  ])
    assert.throws(() => controller.authorize({ ...context, ...mutation }, main, 'true'));
});

test('production metadata is a separately hashed edition and Pages preserves its actual 404 bytes', (t) => {
  const f = releaseFixture(t);
  assert.equal(edition.verify(f.source.directory, f.source.record), true);
  artifact.checkSize(f.source.directory + '/public');
  assert.throws(() => edition.build(f.source.directory), /already applied/);
  const stage = fixture.staging(f.temp);
  const combined = pages.build(
    stage.directory,
    f.temp + '/combined',
    f.source.directory,
    f.record.tag
  );
  assert.deepEqual(combined.root.files, f.source.record.files);
  assert.deepEqual(combined.files['404.html'], f.source.record.files['404.html']);
  assert.equal(pages.verify(f.temp + '/combined', combined), true);
  assert.throws(() => controller.admission(stage.directory, f.proof.gate, f.proof.external, {}));
  const item = { id: 41, digest: f.proof.gate.githubArtifact.uploadDigest, expired: false };
  assert.equal(
    controller.admission(f.source.directory, f.proof.gate, f.proof.external, item).artifactDigest,
    f.record.publicDigest
  );
  assert.throws(
    () =>
      controller.admission(
        f.source.directory,
        f.proof.gate,
        { ...f.proof.external, rights: { pass: false } },
        item
      ),
    /rights/
  );
  fs.writeFileSync(f.source.directory + '/public/robots.txt', 'User-agent: *\nDisallow: /\n');
  assert.throws(() => edition.verify(f.source.directory, f.source.record));
});

test('archive uploads bind all raw evidence and become immutable only after retained live observations', async (t) => {
  const f = releaseFixture(t),
    api = github();
  const staged = await controller.publishArchive(api, context, f.directory, f.record, null, api);
  assert.equal(staged.draft, true);
  assert.equal(api.state.deployments.length, 0);
  assert.equal(api.state.refs.has('heads/production'), false);
  const observations = Buffer.from('retained fixture live observations');
  fs.writeFileSync(f.directory + '/observations.tar.gz', observations);
  const activation = {
    tag: f.record.tag,
    packageDigest: f.record.packageDigest,
    productionDeploymentId: 900,
    observationsDigest: artifact.digest(observations),
    observation: live(f.record),
  };
  fs.writeFileSync(f.directory + '/activation.json', JSON.stringify(activation, null, 2) + '\n');
  const accepted = await controller.publishArchive(
    api,
    context,
    f.directory,
    f.record,
    activation,
    api
  );
  assert.equal(accepted.immutable, true);
  assert.ok(
    api.state.calls.indexOf('asset:observations.tar.gz') < api.state.calls.indexOf('immutable')
  );
  const restored = await controller.restoreArchive(
    api,
    context,
    f.record.tag,
    f.temp + '/restored'
  );
  assert.deepEqual(restored, f.record);
  assert.deepEqual(
    fs.readFileSync(f.temp + '/restored/public.tar.gz'),
    fs.readFileSync(f.directory + '/public.tar.gz')
  );
  fs.appendFileSync(f.directory + '/public.tar.gz', 'tamper');
  await assert.rejects(
    controller.publishArchive(api, context, f.directory, f.record, activation, api),
    /cannot be replaced/
  );
});

test('unprotected Releases and moved tags cannot become production identity', async (t) => {
  const f = releaseFixture(t),
    api = github(false);
  await controller.publishArchive(api, context, f.directory, f.record, null, api);
  const activation = {
    tag: f.record.tag,
    packageDigest: f.record.packageDigest,
    productionDeploymentId: 900,
    observationsDigest: artifact.digest(Buffer.from('fixture')),
    observation: live(f.record),
  };
  fs.writeFileSync(f.directory + '/observations.tar.gz', 'fixture');
  fs.writeFileSync(f.directory + '/activation.json', JSON.stringify(activation, null, 2) + '\n');
  await assert.rejects(
    controller.publishArchive(api, context, f.directory, f.record, activation, api),
    /immutable Releases/
  );
  assert.equal(api.state.refs.has('heads/production'), false);
  api.state.refs.set('tags/' + f.record.tag, 'e'.repeat(40));
  await assert.rejects(
    controller.releaseSource(api, context, f.record.tag, f.record.sourceCommit),
    /moved/
  );
});

test('failed or missing live observations cannot update any production source or label', async (t) => {
  const f = releaseFixture(t),
    api = github();
  const transaction = await controller.plan(api, context, null, f.record);
  await controller.pending(api, context, transaction);
  for (const name of ['pass', 'pages', 'productionPolicy', 'browser', 'passiveScan', 'retained'])
    await assert.rejects(
      controller.accept(api, context, transaction, { ...live(f.record), [name]: false }, api)
    );
  assert.equal(await controller.branch(api, context), null);
  assert.deepEqual([...api.state.flags.get(73)], []);
  assert.equal(api.state.deployments[0].statuses[0].state, 'in_progress');
  await controller.accept(api, context, transaction, live(f.record), api);
  assert.equal(await controller.branch(api, context), f.record.sourceCommit);
  assert.deepEqual([...api.state.flags.get(73)], ['active-production']);
  assert.equal(api.state.deployments[0].statuses[0].state, 'success');
});

test('failed bookkeeping restores the pre-release ref and exact label state after verified Pages recovery', async (t) => {
  const f = releaseFixture(t),
    api = github();
  const transaction = await controller.plan(api, context, null, f.record);
  await controller.pending(api, context, transaction);
  const add = api.rest.issues.addLabels;
  api.rest.issues.addLabels = async () => {
    throw Error('fixture label write failed');
  };
  await assert.rejects(
    controller.accept(api, context, transaction, live(f.record), api),
    /label write failed/
  );
  assert.equal(await controller.branch(api, context), f.record.sourceCommit);
  await assert.rejects(
    controller.recover(api, context, transaction, { pass: false, productionTag: null }, api),
    /restored Pages/
  );
  api.rest.issues.addLabels = add;
  await controller.recover(api, context, transaction, { pass: true, productionTag: null }, api);
  assert.equal(await controller.branch(api, context), null);
  assert.deepEqual([...api.state.flags.get(73)], []);
  assert.equal(api.state.deployments[0].statuses[0].state, 'failure');
  api.state.refs.set('heads/production', 'd'.repeat(40));
  await assert.rejects(
    controller.recover(api, context, transaction, { pass: true, productionTag: null }, api),
    /unrelated/
  );
});

test('successor and rollback retain immutable identities and swap only the actual live PR labels', async (t) => {
  const f = releaseFixture(t),
    api = github();
  api.state.flags.get(67).add('active-production');
  await assert.rejects(controller.plan(api, context, null, f.record), /labels\/accepted/);
  api.state.flags.get(67).clear();
  const first = await controller.plan(api, context, null, f.record);
  await controller.pending(api, context, first);
  await controller.accept(api, context, first, live(f.record), api);
  const previous = { ...api.state.deployments[0].payload, deploymentId: first.deploymentId };
  const next = {
    ...f.record,
    tag: 'prod-2026-10-11.2',
    sourceCommit: 'e'.repeat(40),
    releasePR: 67,
  };
  const second = await controller.plan(api, context, previous, next);
  await controller.pending(api, context, second);
  await controller.accept(api, context, second, live(next), api);
  assert.deepEqual([...api.state.flags.get(73)], ['archived-production']);
  assert.deepEqual([...api.state.flags.get(67)], ['active-production']);
  const accepted = { ...api.state.deployments[1].payload, deploymentId: second.deploymentId };
  const rollback = await controller.plan(api, context, accepted, f.record);
  await controller.pending(api, context, rollback);
  await controller.accept(api, context, rollback, live(f.record), api);
  assert.equal(await controller.branch(api, context), f.record.sourceCommit);
  assert.deepEqual([...api.state.flags.get(73)], ['active-production']);
  assert.deepEqual([...api.state.flags.get(67)], ['archived-production']);
  assert.equal(await controller.wasAccepted(api, context, f.record), true);
  await assert.rejects(
    controller.wasAccepted(api, context, { ...f.record, tag: 'prod-2026-10-11.9' }),
    /previously live/
  );
});

test('compensated remote success cannot qualify a failed publication as a rollback archive', async (t) => {
  const f = releaseFixture(t),
    api = github();
  const transaction = await controller.plan(api, context, null, f.record);
  await controller.pending(api, context, transaction);
  const status = api.rest.repos.createDeploymentStatus;
  api.rest.repos.createDeploymentStatus = async (value) => {
    await status(value);
    if (value.state === 'success') throw Error('fixture response lost after remote success');
    return { data: {} };
  };
  await assert.rejects(
    controller.accept(api, context, transaction, live(f.record), api),
    /response lost/
  );
  assert.equal(api.state.deployments[0].statuses[0].state, 'success');
  api.rest.repos.createDeploymentStatus = status;
  await controller.recover(api, context, transaction, { pass: true, productionTag: null }, api);
  assert.equal(await controller.branch(api, context), null);
  assert.deepEqual([...api.state.flags.get(73)], []);
  assert.deepEqual(
    api.state.deployments[0].statuses.map((item) => item.state),
    ['failure', 'success', 'in_progress']
  );
  await assert.rejects(controller.wasAccepted(api, context, f.record), /previously live/);

  const accepted = await controller.plan(api, context, null, f.record);
  await controller.pending(api, context, accepted);
  await controller.accept(api, context, accepted, live(f.record), api);
  assert.equal(await controller.wasAccepted(api, context, f.record), true);
  await status({ deployment_id: accepted.deploymentId, state: 'inactive' });
  assert.equal(await controller.wasAccepted(api, context, f.record), true);
});

test('production rules must protect creation, update, deletion and force moves with only the publisher bypass', async () => {
  const rule = {
    id: 9,
    name: 'protect-production',
    enforcement: 'active',
    target: 'branch',
    conditions: { ref_name: { include: ['refs/heads/production'], exclude: [] } },
    rules: ['creation', 'deletion', 'non_fast_forward', 'update'].map((type) => ({ type })),
    bypass_actors: [{ actor_id: 424242, actor_type: 'Integration', bypass_mode: 'always' }],
  };
  const api = { request: async (route) => ({ data: route.endsWith('/rulesets') ? [rule] : rule }) };
  assert.equal(await controller.protection({}, context, api, 424242), 9);
  await assert.rejects(controller.protection({}, context, api, 424243));
  rule.rules.pop();
  await assert.rejects(controller.protection({}, context, api, 424242));
  rule.rules.push({ type: 'update' });
  rule.bypass_actors.push({ actor_id: 1, actor_type: 'Team', bypass_mode: 'always' });
  await assert.rejects(controller.protection({}, context, api, 424242));
});

test('production settings inspection uses a separate client and rejects hidden bypass actors', async () => {
  const rule = {
    id: 9,
    name: 'protect-production',
    enforcement: 'active',
    target: 'branch',
    conditions: { ref_name: { include: ['refs/heads/production'], exclude: [] } },
    rules: ['creation', 'deletion', 'non_fast_forward', 'update'].map((type) => ({ type })),
    bypass_actors: [{ actor_id: 424242, actor_type: 'Integration', bypass_mode: 'always' }],
  };
  const calls = [];
  const publication = {
    request: async () => {
      throw Error('publication credentials cannot inspect hidden settings');
    },
  };
  const settings = {
    request: async (route) => {
      calls.push(route);
      return { data: route.endsWith('/rulesets') ? [rule] : rule };
    },
  };
  assert.equal(await controller.protection(publication, context, settings, 424242), 9);
  assert.deepEqual(calls, [
    'GET /repos/{owner}/{repo}/rulesets',
    'GET /repos/{owner}/{repo}/rulesets/{ruleset_id}',
  ]);
  delete rule.bypass_actors;
  await assert.rejects(controller.protection(publication, context, settings, 424242));
});

test('the settings client requires explicit credentials without replacing publication authentication', () => {
  const publication = {
    auth: 'fixture-publication-only',
    constructor: class SettingsClient {
      constructor(options) {
        this.auth = options.auth;
      }
    },
  };
  assert.throws(() => controller.productionClient(publication, ''), /installation token/);
  const settings = controller.productionClient(publication, 'fixture-settings-only');
  assert.equal(settings.auth, 'fixture-settings-only');
  assert.equal(publication.auth, 'fixture-publication-only');
  assert.notEqual(settings, publication);
  assert.equal(controller.productionAppId('424242'), 424242);
  assert.throws(() => controller.productionAppId(''), /not configured/);
  assert.throws(() => controller.productionAppId('15368'), /internal GitHub Actions/);
});

test('only protected refs and Release operations use the installed production App client', async (t) => {
  const f = releaseFixture(t),
    api = github();
  const clone = () => ({
    ...api,
    rest: {
      ...api.rest,
      git: { ...api.rest.git },
      repos: { ...api.rest.repos },
      issues: { ...api.rest.issues },
    },
  });
  const publication = clone(),
    control = clone();
  const forbidden = async () => {
    throw Error('credential used outside its production role');
  };
  for (const name of ['createRef', 'updateRef', 'deleteRef'])
    publication.rest.git[name] = forbidden;
  for (const name of ['createRelease', 'uploadReleaseAsset', 'updateRelease'])
    publication.rest.repos[name] = forbidden;
  for (const name of ['createDeployment', 'createDeploymentStatus'])
    control.rest.repos[name] = forbidden;
  for (const name of ['addLabels', 'removeLabel', 'createLabel'])
    control.rest.issues[name] = forbidden;
  await controller.publishArchive(publication, context, f.directory, f.record, null, control);
  const transaction = await controller.plan(publication, context, null, f.record);
  await controller.pending(publication, context, transaction);
  await controller.accept(publication, context, transaction, live(f.record), control);
  assert.equal(await controller.branch(publication, context), f.record.sourceCommit);
  assert.deepEqual([...api.state.flags.get(73)], ['active-production']);
  assert.equal(api.state.deployments[0].creator.login, 'github-actions[bot]');
  await controller.recover(
    publication,
    context,
    transaction,
    { pass: true, productionTag: null },
    control
  );
  assert.equal(await controller.branch(publication, context), null);
  assert.equal(api.state.deployments[0].statuses[0].state, 'failure');
});

test('full run admission requires both named native platforms, actual successful jobs and all raw reports', async () => {
  const run = {
    id: 800,
    run_attempt: 1,
    path: '.github/workflows/site-candidate-evidence.yml',
    event: 'workflow_dispatch',
    head_branch: 'main',
    head_sha: context.sha,
    head_repository: { full_name: 'oborskyivitalii/oborskyivitalii' },
    actor: { login: context.actor },
    status: 'completed',
    conclusion: 'success',
  };
  let jobs = [
    'build',
    'static',
    'linux',
    'Native darwin',
    'Native win32',
    'performance',
    'captures',
    'host',
    'gate',
  ].map((name) => ({ name: 'evidence / ' + name, status: 'completed', conclusion: 'success' }));
  let items = [
    'gate-full',
    'reports-host',
    'reports-static',
    'reports-linux',
    'reports-darwin',
    'reports-win32',
    'reports-performance',
    'reports-captures',
  ].map((name, i) => ({
    id: 50 + i,
    name: 'site-' + name + '-staging-800-1',
    expired: false,
    digest: 'sha256:' + 'd'.repeat(64),
    workflow_run: { id: 800 },
  }));
  const api = {
    rest: {
      actions: {
        getWorkflowRun: async () => ({ data: run }),
        listJobsForWorkflowRunAttempt: 'jobs',
        listWorkflowRunArtifacts: 'artifacts',
      },
    },
    paginate: async (method) => (method === 'jobs' ? jobs : items),
  };
  assert.equal((await controller.validation(api, context, 800)).reports.length, 7);
  jobs[3].conclusion = 'skipped';
  await assert.rejects(controller.validation(api, context, 800), /did not pass/);
  jobs[3].conclusion = 'success';
  items = items.slice(0, -1);
  await assert.rejects(controller.validation(api, context, 800), /missing or ambiguous/);
  jobs = jobs.slice(0, 3);
  await assert.rejects(controller.validation(api, context, 800), /missing\/ambiguous/);
  run.actor.login = 'another-user';
  await assert.rejects(controller.validation(api, context, 800));
});

test('passive scanner uses a pinned image, an exact bounded origin and explicit finding policy', () => {
  const plan = passive.plan();
  const scope = new RegExp(plan.env.contexts[0].includePaths[0]);
  assert.ok(scope.test(edition.origin + '/research.html'));
  assert.equal(scope.test('https://medium.com/article'), false);
  assert.equal(scope.test(edition.origin.replace('.ai', '.ai.attacker.invalid') + '/'), false);
  assert.ok(plan.jobs.find((job) => job.type === 'spider').parameters.maxDuration <= 1);
  assert.ok(plan.jobs.find((job) => job.type === 'passiveScan-wait').parameters.maxDuration <= 3);
  assert.ok(!plan.jobs.some((job) => job.type === 'activeScan'));
  assert.match(passive.image, /@sha256:[a-f0-9]{64}$/);
  const raw = { '@version': 'fixture', site: [{ '@name': edition.origin, alerts: [] }] };
  const traffic = {
    log: {
      entries: require('../tools/site/snapshot.cjs').routes.map((id) => ({
        request: { method: 'GET', url: edition.routeURL(id) },
        response: { status: 200 },
      })),
    },
  };
  assert.throws(() => passive.validate(raw));
  assert.equal(passive.validate(raw, traffic).pass, true);
  raw.site[0].alerts.push({
    pluginid: '10038',
    riskcode: '2',
    instances: [{ uri: edition.origin + '/' }],
  });
  assert.equal(passive.validate(raw, traffic).rows[0].disposition, 'warn');
  raw.site[0].alerts[0].pluginid = 'untriaged';
  assert.throws(() => passive.validate(raw, traffic));
  raw.site[0].alerts[0].pluginid = '10038';
  raw.site[0].alerts[0].riskcode = '3';
  assert.throws(() => passive.validate(raw, traffic), /untriaged/);
  raw.site[0].alerts[0].riskcode = '2';
  raw.site[0].alerts[0].instances[0].uri = 'https://medium.com/';
  assert.throws(() => passive.validate(raw, traffic), /authorized origin/);
});

test('live report reduction binds both browser editions, exact Pages digest, owned origin and retained observations', (t) => {
  const f = releaseFixture(t),
    stage = fixture.staging(f.temp);
  const combined = pages.build(
    stage.directory,
    f.temp + '/combined',
    f.source.directory,
    f.record.tag
  );
  const browser = (record, target) => ({
    ...fixture.fullProof(record).external,
    kind: 'preview-smoke',
    target,
    rows: Array.from({ length: 4 }, () => ({ pass: true })),
  });
  const reports = {
    pages: { pass: true, packageDigest: combined.packageDigest },
    policy: {
      pass: true,
      sourceCommit: f.record.sourceCommit,
      publicDigest: f.record.publicDigest,
      origin: edition.origin,
    },
    productionBrowser: browser(f.record.public, edition.origin),
    stagingBrowser: browser(stage.record, edition.origin + '/staging'),
    passive: passive.validate(
      { '@version': 'fixture', site: [{ '@name': edition.origin, alerts: [] }] },
      {
        log: {
          entries: require('../tools/site/snapshot.cjs').routes.map((id) => ({
            request: { method: 'GET', url: edition.routeURL(id) },
            response: { status: 200 },
          })),
        },
      }
    ),
    retained: true,
  };
  assert.equal(releaseLive.observation(f.record, combined, reports).pass, true);
  for (const mutate of [
    (r) => (r.pages.packageDigest = '0'.repeat(64)),
    (r) => (r.policy.sourceCommit = context.sha),
    (r) => (r.productionBrowser.artifactDigest = stage.record.artifactDigest),
    (r) => (r.stagingBrowser.target = edition.origin),
    (r) => (r.stagingBrowser.rows[0].pass = false),
    (r) => (r.passive.origin = 'https://medium.com'),
    (r) => delete r.passive.kind,
    (r) => delete r.passive.coverage,
    (r) => (r.retained = false),
  ]) {
    const invalid = structuredClone(reports);
    mutate(invalid);
    assert.throws(() => releaseLive.observation(f.record, combined, invalid));
  }
});
