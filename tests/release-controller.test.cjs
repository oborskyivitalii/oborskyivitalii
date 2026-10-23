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
  const rights = fixture.rightsInventory(source, true);
  const proof = fixture.fullProof(source.record, rights.report);
  const directory = path.join(temp, 'assets');
  fs.mkdirSync(directory);
  fs.copyFileSync(source.directory + '/rights.json', directory + '/rights.json');
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
  return { temp, directory, source, proof, record, rights };
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

test('production draft archive writes wait for complete local Pages and licensing verification', (t) => {
  const f = releaseFixture(t);
  const directory = path.join(f.temp, 'action-order');
  fs.mkdirSync(directory);
  fs.cpSync(f.source.directory, path.join(directory, 'production-source'), { recursive: true });
  fs.cpSync(f.directory, path.join(directory, 'release-assets'), { recursive: true });
  const stage = fixture.staging(path.join(f.temp, 'action-stage'));
  const previousDirectory = path.join(directory, 'pages-previous/pages-package');
  const predecessor = pages.build(stage.directory, previousDirectory);
  const previousBytes = fs.readFileSync(path.join(previousDirectory, 'pages-package.json'));
  fs.mkdirSync(path.join(directory, 'release-control'));
  fs.writeFileSync(
    path.join(directory, 'release-control/previous.json'),
    JSON.stringify({ state: predecessor.state })
  );
  const combinedDirectory = path.join(directory, 'pages-package');
  cp.execFileSync(
    process.execPath,
    [
      '-e',
      'require(process.argv[1]).compose()',
      path.join(__dirname, '../tools/release/actions.cjs'),
    ],
    {
      cwd: directory,
      env: {
        ...process.env,
        GITHUB_RUN_ID: '900',
        GITHUB_RUN_ATTEMPT: '1',
        GITHUB_SHA: context.sha,
      },
    }
  );
  const combined = JSON.parse(fs.readFileSync(path.join(combinedDirectory, 'pages-package.json')));
  assert.equal(combined.staging, null);
  assert.deepEqual(
    fs.readFileSync(path.join(previousDirectory, 'pages-package.json')),
    previousBytes
  );
  pages.verify(previousDirectory, predecessor);
  const script = `
    const assert=require('node:assert/strict');
    const actions=require(process.argv[1]);
    if(process.argv[2]==='verify') actions.verifyPreparedArchive();
    else {
      let calls=0;
      const provider=new Proxy({}, {get(){calls+=1;throw Error('provider reached before local rejection')}});
      (async()=>{
        await assert.rejects(actions.publishPreparedArchive(provider,{}));
        assert.equal(calls,0,'local failure reached provider authentication/mutation');
      })().catch(error=>{console.error(error);process.exitCode=1});
    }
  `;
  const run = (mode) =>
    cp.spawnSync(
      process.execPath,
      ['-e', script, path.join(__dirname, '../tools/release/actions.cjs'), mode],
      {
        cwd: directory,
        encoding: 'utf8',
        timeout: 30000,
      }
    );
  let result = run('verify');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const packageFile = path.join(combinedDirectory, 'pages-package.json');
  const original = fs.readFileSync(packageFile);
  for (const mutate of [
    (record) => {
      delete record.rights;
    },
    (record) => {
      record.rights.root.legalCopies.code.sha256 = 'f'.repeat(64);
    },
    (record) => {
      record.root.sourceTree = 'f'.repeat(40);
    },
    (record) => {
      record.state.production.tag = 'prod-2026-10-12.2';
    },
    (record) => {
      record.staging = stage.record;
    },
  ]) {
    const invalid = structuredClone(combined);
    mutate(invalid);
    fs.writeFileSync(packageFile, JSON.stringify(invalid));
    result = run('reject-before-provider');
    assert.equal(result.status, 0, result.stdout + result.stderr);
  }
  fs.writeFileSync(packageFile, original);
  fs.rmSync(path.join(directory, 'production-source/rights.json'));
  result = run('reject-before-provider');
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

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
        state.releases.has(tag) && !state.releases.get(tag).draft
          ? { data: state.releases.get(tag) }
          : missing(),
      listReleases: 'releases',
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
        assert.ok(labels.length > 0, 'GitHub rejects an empty additive label request');
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
      if (method === 'releases') return [...state.releases.values()];
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

test('metadata recovery authenticates the unique failed owner-main attempt and retained result', async () => {
  const run = {
    id: 801,
    run_attempt: 1,
    head_sha: 'c'.repeat(40),
    head_branch: 'main',
    path: controller.workflow,
    repository: { full_name: 'oborskyivitalii/oborskyivitalii' },
    head_repository: { full_name: 'oborskyivitalii/oborskyivitalii' },
    actor: { login: context.actor },
    triggering_actor: { login: context.actor },
    event: 'workflow_dispatch',
    status: 'completed',
    conclusion: 'failure',
  };
  const item = {
    id: 802,
    expired: false,
    name: 'site-production-result-801-1',
    digest: 'sha256:' + 'a'.repeat(64),
    workflow_run: { id: 801, head_sha: run.head_sha, head_branch: 'main' },
  };
  const state = {
    run,
    item,
    ancestor: run.head_sha,
    jobs: [{ name: 'Pages publication', conclusion: 'failure' }],
  };
  const api = {
    rest: {
      actions: {
        getWorkflowRun: async () => ({ data: state.run }),
        listJobsForWorkflowRunAttempt: 'jobs',
        listWorkflowRunArtifacts: 'artifacts',
      },
      repos: {
        compareCommitsWithBasehead: async () => ({
          data: { merge_base_commit: { sha: state.ancestor } },
        }),
      },
    },
    paginate: async (endpoint) => (endpoint === 'jobs' ? state.jobs : [state.item]),
  };
  const proof = await controller.failedPublication(api, context, 801, 1);
  assert.equal(proof.artifactId, 802);
  for (const change of [
    { conclusion: 'success' },
    { path: '.github/workflows/other.yml' },
    { head_branch: 'work' },
    { actor: { login: 'another-user' } },
    { triggering_actor: { login: 'another-user' } },
    { run_attempt: 2 },
    { repository: { full_name: 'other/repository' } },
  ]) {
    state.run = { ...run, ...change };
    await assert.rejects(controller.failedPublication(api, context, 801, 1));
  }
  state.run = run;
  state.ancestor = 'd'.repeat(40);
  await assert.rejects(controller.failedPublication(api, context, 801, 1));
  state.ancestor = run.head_sha;
  for (const change of [
    { expired: true },
    { name: 'site-production-result-801-2' },
    { workflow_run: { ...item.workflow_run, head_sha: 'd'.repeat(40) } },
  ]) {
    state.item = { ...item, ...change };
    await assert.rejects(controller.failedPublication(api, context, 801, 1));
  }
});

test('first-release compensation rejects unrelated or accepted metadata before restoring exact pending state', async (t) => {
  const f = releaseFixture(t);
  const api = github();
  api.rest.pulls.get = async () => ({
    data: {
      merged: true,
      base: { ref: 'main', repo: { full_name: 'oborskyivitalii/oborskyivitalii' } },
      head: { sha: f.record.sourceCommit, repo: { full_name: 'oborskyivitalii/oborskyivitalii' } },
      labels: [...api.state.flags.get(73)].map((name) => ({ name })),
    },
  });
  api.rest.repos.getCommit = async () => ({
    data: { commit: { tree: { sha: f.record.sourceTree } } },
  });
  api.rest.repos.compareCommitsWithBasehead = async () => ({
    data: { merge_base_commit: { sha: f.record.sourceCommit } },
  });
  api.rest.repos.getDeployment = async () => ({ data: api.state.deployments[0] });
  const transaction = await controller.plan(api, context, null, f.record);
  await controller.pending(api, context, transaction);
  api.state.refs.set('heads/production', f.record.sourceCommit);
  const proof = { source: f.record.sourceCommit };
  await controller.recoveryState(api, context, proof, transaction, f.record.tag);
  const writes = api.state.calls.slice();
  api.state.deployments[0].payload.packageDigest = 'a'.repeat(64);
  await assert.rejects(controller.recoveryState(api, context, proof, transaction, f.record.tag));
  api.state.deployments[0].payload.packageDigest = f.record.packageDigest;
  api.state.refs.set('heads/production', '0'.repeat(40));
  await assert.rejects(controller.recoveryState(api, context, proof, transaction, f.record.tag));
  api.state.refs.set('heads/production', f.record.sourceCommit);
  api.state.flags.get(67).add('active-production');
  await assert.rejects(controller.recoveryState(api, context, proof, transaction, f.record.tag));
  api.state.flags.get(67).clear();
  api.state.deployments[0].statuses.unshift({ state: 'success' });
  await assert.rejects(controller.recoveryState(api, context, proof, transaction, f.record.tag));
  api.state.deployments[0].statuses.shift();
  assert.deepEqual(api.state.calls, writes);
  await controller.recover(api, context, transaction, { pass: true, productionTag: null }, api);
  assert.equal(await controller.branch(api, context), null);
  assert.equal(api.state.deployments[0].statuses[0].state, 'failure');
  assert.equal(api.state.releases.size, 0);
});

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

test('production admission requires the exact rights inventory and an actual recorded owner policy', (t) => {
  const temp = fixture.temporary(t);
  const source = fixture.source(temp, 'pending-rights');
  source.record = edition.build(source.directory);
  const pending = fixture.rightsInventory(source);
  let proof = fixture.fullProof(source.record, pending.report);
  const item = { id: 41, digest: proof.gate.githubArtifact.uploadDigest, expired: false };
  const admit = () => controller.admission(source.directory, proof.gate, proof.external, item);
  assert.throws(admit, /maintainer reuse policy remains pending/);
  const confirmed = fixture.rightsInventory(source, true);
  proof = fixture.fullProof(source.record, confirmed.report);
  assert.equal(admit().artifactDigest, source.record.artifactDigest);
  for (const key of ['reviewer', 'record', 'inventoryDigest']) {
    const original = proof.external.rights[key];
    delete proof.external.rights[key];
    assert.throws(admit, /rights/);
    proof.external.rights[key] = original;
  }
  proof.external.rights.inventoryDigest = 'f'.repeat(64);
  assert.throws(admit, /rights digest differs/);
  proof.external.rights.inventoryDigest = confirmed.report.inventoryDigest;
  fs.appendFileSync(path.join(source.directory, 'rights.json'), 'corrupted');
  assert.throws(admit);
});

test('explicit production Color preserves approved runtime and rejects a different selected variant', (t) => {
  const temp = fixture.temporary(t),
    source = fixture.source(temp, 'production-color'),
    color = require('../tools/staging/color.cjs').build(source.directory),
    before = fs.readFileSync(source.directory + '/public/research.html', 'utf8');
  assert.throws(() => edition.build(source.directory), /wrong production rendition/);
  assert.throws(() => edition.build(source.directory, 'other'), /explicit production rendition/);
  source.record = edition.build(source.directory, 'color');
  assert.equal(edition.verify(source.directory, source.record), true);
  assert.equal(
    require('../tools/quality/color-motion-contract.cjs').select(source.record).id,
    'issue5-review-print-production'
  );
  assert.notEqual(source.record.variant.fingerprint, color.variant.fingerprint);
  for (const name of require('../tools/site/snapshot.cjs').runtimeFiles)
    assert.deepEqual(source.record.files[name], color.files[name], 'approved runtime ' + name);
  const after = fs.readFileSync(source.directory + '/public/research.html', 'utf8');
  assert.equal(after.match(/<body[\s\S]*$/)[0], before.match(/<body[\s\S]*$/)[0]);
  const analytics = (html) =>
    [
      ...html.matchAll(/<script data-site-analytics="cloudflare" src="([^"]+)" defer><\/script>/g),
    ].map((match) => [match[0], match[1]]);
  assert.equal(analytics(before).length, require('../site/analytics.json').enabled ? 1 : 0);
  assert.deepEqual(analytics(after), analytics(before), 'production retains the selected loader');
  for (const [, name] of analytics(before))
    assert.deepEqual(source.record.files[name], color.files[name], 'analytics bytes remain exact');
  assert.doesNotThrow(() => artifact.checkSize(source.directory + '/public'));
  const base = fixture.source(temp, 'wrong-base');
  assert.throws(() => edition.build(base.directory, 'color'), /wrong production rendition/);
  const staged = fixture.staging(temp, true);
  assert.throws(() => edition.build(staged.directory, 'color'), /already applied/);
  const report = fixture.rightsInventory(source, true).report,
    summaryFile = path.join(temp, 'candidate-summary.md'),
    workflow = fs.readFileSync(
      path.join(__dirname, '../.github/workflows/site-release-candidate.yml'),
      'utf8'
    ),
    summaryStep = workflow.slice(
      workflow.indexOf(
        '      - name: Show production admission and optional full diagnostic inputs\n'
      )
    ),
    bindings = Object.fromEntries(
      [...summaryStep.matchAll(/^ {10}([A-Z_]+): \$\{\{ ([^}]+) \}\}$/gm)].map(
        ([, name, value]) => [name, value]
      )
    );
  assert.deepEqual(bindings, {
    CANDIDATE_URL: 'needs.publish.outputs.url',
    PUBLIC_ID: 'needs.build.outputs.public_id',
    PUBLIC_DIGEST: 'needs.build.outputs.digest',
    UPLOAD_DIGEST: 'needs.build.outputs.upload_digest',
    RIGHTS_DIGEST: 'needs.build.outputs.rights_digest',
    RIGHTS_POLICY_STATUS: 'needs.build.outputs.rights_policy_status',
  });
  const summaryScript = summaryStep.match(/node - <<'JS'\n([\s\S]*?)\n {10}JS/)[1],
    expectedInputs = {
      candidate_sha: source.record.sourceCommit,
      public_variant: 'color',
      base_url: 'https://candidate.invalid/frozen-edition/',
      public_artifact_id: '123',
      public_run_id: '456',
      public_digest: source.record.artifactDigest,
      public_upload_digest: 'sha256:' + 'c'.repeat(64),
      rights_inventory_digest: report.inventoryDigest,
      rights_policy_status: report.policy.status,
    };
  cp.execFileSync(process.execPath, ['-e', summaryScript], {
    env: {
      ...process.env,
      GITHUB_STEP_SUMMARY: summaryFile,
      SITE_CANDIDATE_SHA: expectedInputs.candidate_sha,
      CANDIDATE_URL: expectedInputs.base_url,
      PUBLIC_ID: expectedInputs.public_artifact_id,
      GITHUB_RUN_ID: expectedInputs.public_run_id,
      PUBLIC_DIGEST: expectedInputs.public_digest,
      UPLOAD_DIGEST: expectedInputs.public_upload_digest,
      RIGHTS_DIGEST: expectedInputs.rights_inventory_digest,
      RIGHTS_POLICY_STATUS: expectedInputs.rights_policy_status,
    },
  });
  const summary = fs.readFileSync(summaryFile, 'utf8');
  assert.deepEqual(JSON.parse(summary.slice(summary.indexOf('{'))), expectedInputs);
});

test('production social metadata binds all five routes to the shipped JPEG and rejects omissions or changed bytes', (t) => {
  const temp = fixture.temporary(t),
    source = fixture.source(temp, 'production-social');
  source.record = edition.build(source.directory);
  const bytes = fs.readFileSync(source.directory + '/public/' + edition.social.file);
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'actual JPEG signature');
  let dimensions;
  for (let offset = 2; offset < bytes.length; ) {
    assert.equal(bytes[offset], 0xff);
    const marker = bytes[offset + 1],
      length = bytes.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      dimensions = [bytes.readUInt16BE(offset + 7), bytes.readUInt16BE(offset + 5)];
      break;
    }
    assert.ok(length > 1);
    offset += 2 + length;
  }
  assert.deepEqual(dimensions, [edition.social.width, edition.social.height]);
  assert.equal(edition.social.type, 'image/jpeg');
  for (const id of require('../tools/site/snapshot.cjs').routes) {
    for (const name of [id + '.html', source.record.components.routes[id].url]) {
      const file = source.directory + '/public/' + name,
        original = fs.readFileSync(file, 'utf8');
      for (const attribute of ['property="og:image"', 'name="twitter:image"']) {
        assert.ok(
          original.includes(
            attribute + ' content="' + edition.origin + '/' + edition.social.file + '"'
          )
        );
        fs.writeFileSync(file, original.replace(attribute, 'name="missing-image"'));
        assert.throws(() => edition.verify(source.directory, source.record), /social image/);
        fs.writeFileSync(file, original);
      }
      fs.writeFileSync(
        file,
        original.replace(
          '</head>',
          '<meta property="og:image" content="https://attacker.invalid/image.jpg"></head>'
        )
      );
      assert.throws(() => edition.verify(source.directory, source.record));
      fs.writeFileSync(file, original);
    }
  }
  fs.writeFileSync(source.directory + '/public/' + edition.social.file, bytes.subarray(0, 100));
  assert.throws(() => edition.verify(source.directory, source.record), /social image/);
});

test('live production social metadata requires the exact reachable JPEG with its declared HTTP MIME', async (t) => {
  const temp = fixture.temporary(t),
    source = fixture.source(temp, 'live-social');
  require('../tools/staging/color.cjs').build(source.directory);
  source.record = edition.build(source.directory, 'color');
  const record = { public: source.record, publicDigest: source.record.artifactDigest };
  function fetcher(imageType) {
    return async (url) => {
      const name = new URL(url).pathname.slice(1) || 'index.html',
        file = path.join(source.directory, 'public', name),
        found = fs.existsSync(file);
      const mime =
        name === edition.social.file
          ? imageType
          : require('../tools/quality/serve.cjs').canonicalType(found ? name : '404.html');
      return new Response(found ? fs.readFileSync(file) : 'Missing', {
        status: found ? 200 : 404,
        headers: { 'content-type': mime },
      });
    };
  }
  const observation = await releaseLive.check(source.directory, record, fetcher('image/jpeg'));
  assert.equal(observation.pass, true);
  assert.equal(observation.publicDigest, source.record.artifactDigest);
  await assert.rejects(
    () => releaseLive.check(source.directory, record, fetcher('text/plain')),
    /incorrect Content-Type.*\.jpg|social image MIME/
  );
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
  assert.deepEqual(
    fs.readFileSync(f.temp + '/restored/rights.json'),
    fs.readFileSync(f.directory + '/rights.json')
  );
  assert.equal(f.record.rights.inventoryDigest, f.proof.external.rights.inventoryDigest);
  assert.equal(
    f.record.rights.reportSHA256,
    artifact.digest(fs.readFileSync(f.directory + '/rights.json'))
  );
  fs.appendFileSync(f.directory + '/public.tar.gz', 'tamper');
  await assert.rejects(
    controller.publishArchive(api, context, f.directory, f.record, activation, api),
    /cannot be replaced/
  );
});

test('draft discovery preserves orphan-tag, source, asset, ambiguity and permission rejection before writes', async (t) => {
  const f = releaseFixture(t);
  for (const mode of ['orphan', 'source', 'asset', 'extra', 'ambiguous', 'permission']) {
    const api = github();
    if (mode === 'orphan') api.state.refs.set('tags/' + f.record.tag, f.record.sourceCommit);
    else await controller.publishArchive(api, context, f.directory, f.record, null, api);
    if (mode === 'source') api.state.refs.set('tags/' + f.record.tag, 'e'.repeat(40));
    if (mode === 'asset') {
      const item = api.state.assets.find((asset) => asset.name === 'archive.json');
      item.bytes = Buffer.concat([item.bytes, Buffer.from('changed')]);
      item.size = item.bytes.length;
      item.digest = 'sha256:' + artifact.digest(item.bytes);
    }
    if (mode === 'extra') api.state.assets.push({ name: 'untracked.bin', release_id: 1 });
    if (['ambiguous', 'permission'].includes(mode)) {
      const paginate = api.paginate;
      api.paginate = async (method, value) => {
        if (method !== 'releases') return paginate(method, value);
        if (mode === 'permission')
          throw Object.assign(Error('release listing forbidden'), { status: 403 });
        const release = api.state.releases.get(f.record.tag);
        return [release, { ...release, id: release.id + 100 }];
      };
    }
    const before = api.state.calls.slice();
    const errors = {
      orphan: /untracked tag/,
      source: /source tag moved/,
      asset: /cannot be replaced/,
      extra: /unexpected existing archive asset/,
      ambiguous: /ambiguous archive release identity/,
      permission: /listing forbidden/,
    };
    await assert.rejects(
      controller.publishArchive(api, context, f.directory, f.record, null, api),
      errors[mode]
    );
    assert.deepEqual(api.state.calls, before, mode + ' must not mutate remote state');
  }
});

test('draft discovery selects the exact tag among unrelated releases and resumes without duplicate writes', async (t) => {
  const f = releaseFixture(t),
    api = github();
  api.state.releases.set('prod-2026-10-15.1', {
    id: 9000,
    tag_name: 'prod-2026-10-15.1',
    draft: true,
  });
  const first = await controller.publishArchive(api, context, f.directory, f.record, null, api),
    before = api.state.calls.slice();
  const resumed = await controller.publishArchive(api, context, f.directory, f.record, null, api);
  assert.equal(resumed.id, first.id);
  assert.equal(resumed.draft, true);
  assert.equal(api.state.releases.size, 2);
  assert.deepEqual(api.state.calls, before);
  assert.equal(api.state.refs.get('tags/' + f.record.tag), f.record.sourceCommit);
});

test('a changed rights release asset fails before any publication or historical restoration', async (t) => {
  const f = releaseFixture(t);
  const api = github();
  const rightsFile = path.join(f.directory, 'rights.json');
  const rightsBytes = fs.readFileSync(rightsFile);
  fs.appendFileSync(rightsFile, ' ');
  await assert.rejects(
    controller.publishArchive(api, context, f.directory, f.record, null, api),
    /archived rights bytes changed/
  );
  assert.equal(api.state.refs.size, 0);
  fs.writeFileSync(rightsFile, rightsBytes);
  await controller.publishArchive(api, context, f.directory, f.record, null, api);
  const observations = Buffer.from('fixture observations');
  const activation = {
    tag: f.record.tag,
    packageDigest: f.record.packageDigest,
    productionDeploymentId: 900,
    observationsDigest: artifact.digest(observations),
    observation: live(f.record),
  };
  fs.writeFileSync(path.join(f.directory, 'observations.tar.gz'), observations);
  fs.writeFileSync(path.join(f.directory, 'activation.json'), JSON.stringify(activation));
  await controller.publishArchive(api, context, f.directory, f.record, activation, api);
  const item = api.state.assets.find((asset) => asset.name === 'rights.json');
  item.bytes = Buffer.concat([item.bytes, Buffer.from(' ')]);
  item.size = item.bytes.length;
  item.digest = 'sha256:' + artifact.digest(item.bytes);
  await assert.rejects(
    controller.restoreArchive(api, context, f.record.tag, path.join(f.temp, 'changed-rights')),
    /archived rights bytes changed/
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
  for (const name of ['listReleases', 'createRelease', 'uploadReleaseAsset', 'updateRelease'])
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

test('live report reduction binds production-only bytes, retired staging paths, owned origin and retained observations', (t) => {
  const f = releaseFixture(t),
    stage = fixture.staging(f.temp);
  const combined = pages.build(
    null,
    f.temp + '/combined',
    f.source.directory,
    f.record.tag,
    null,
    '/',
    { productionRightsDigest: f.record.rights.inventoryDigest }
  );
  const browser = (record, target) => ({
    ...fixture.fullProof(record).external,
    kind: 'preview-smoke',
    target,
    rows: Array.from({ length: 4 }, () => ({ pass: true })),
  });
  const reports = {
    pages: { pass: true, packageDigest: combined.packageDigest, staging: false, actual404: true },
    policy: {
      pass: true,
      sourceCommit: f.record.sourceCommit,
      publicDigest: f.record.publicDigest,
      origin: edition.origin,
    },
    productionBrowser: browser(f.record.public, edition.origin),
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
    (r) => (r.productionBrowser.rows[0].pass = false),
    (r) => (r.pages.staging = true),
    (r) => (r.pages.actual404 = false),
    (r) => (r.stagingBrowser = browser(stage.record, edition.origin + '/staging')),
    (r) => (r.retained = false),
  ]) {
    const invalid = structuredClone(reports);
    mutate(invalid);
    assert.throws(() => releaseLive.observation(f.record, combined, invalid));
  }
  delete reports.passive;
  const smoke = releaseLive.observation(f.record, combined, reports);
  assert.equal(smoke.smokePolicy, 'production-smoke-v1');
  controller.live(f.record, smoke);
  assert.equal(smoke.passiveScan, undefined, 'optional diagnostics are not a smoke result');
  const legacy = pages.build(
    stage.directory,
    f.temp + '/legacy-combined',
    f.source.directory,
    f.record.tag
  );
  assert.throws(
    () =>
      releaseLive.observation(f.record, legacy, {
        ...reports,
        pages: { ...reports.pages, packageDigest: legacy.packageDigest },
      }),
    /republish staging/
  );
});

function stagingAuthenticationFixture() {
  const policy = require('../tools/release/staging-policy.cjs');
  const state = {
    pr: {
      number: 88,
      merged: true,
      merge_commit_sha: 'c'.repeat(40),
      head: { sha: 'a'.repeat(40), repo: { full_name: 'oborskyivitalii/oborskyivitalii' } },
      base: { ref: 'main', repo: { full_name: 'oborskyivitalii/oborskyivitalii' } },
    },
    check: {
      id: 700,
      name: 'Staging admission',
      head_sha: 'a'.repeat(40),
      app: { id: 15368 },
      status: 'completed',
      conclusion: 'success',
      external_id: '800/1',
    },
    run: {
      id: 800,
      run_attempt: 1,
      path: '.github/workflows/site-color-review.yml',
      head_branch: 'main',
      head_sha: 'f'.repeat(40),
      head_repository: { full_name: 'oborskyivitalii/oborskyivitalii' },
      actor: { login: 'oborskyivitalii' },
      triggering_actor: { login: 'oborskyivitalii' },
      event: 'issue_comment',
      status: 'completed',
      conclusion: 'success',
    },
    tree: 'b'.repeat(40),
    // The actual staging graph in run39028272999 skips preview smoke and
    // label-only evidence; its bounded regression runs under full / staging.
    jobs: Object.entries({
      target: 'success',
      'begin-admission': 'success',
      build: 'success',
      publish: 'success',
      smoke: 'skipped',
      'full / build': 'success',
      'full / static': 'success',
      'full / host': 'success',
      'full / staging': 'success',
      'full / gate': 'success',
      'stage-evidence': 'skipped',
      promote: 'success',
      'merge-admission': 'success',
    }).map(([name, conclusion]) => ({ name, status: 'completed', conclusion })),
  };
  const names = policy.names(800, 1);
  state.artifacts = [names.public, names.gate, ...names.reports].map((name, index) => ({
    id: 300 + index,
    name,
    expired: false,
    digest: 'sha256:' + 'd'.repeat(64),
    workflow_run: { id: 800, head_sha: state.run.head_sha },
  }));
  const api = {
    rest: {
      pulls: { get: async () => ({ data: state.pr }) },
      repos: {
        getCommit: async ({ ref }) => ({
          data: {
            commit: { tree: { sha: ref === state.pr.head.sha ? 'b'.repeat(40) : state.tree } },
          },
        }),
      },
      checks: { listForRef: 'checks' },
      actions: {
        getWorkflowRun: async () => ({ data: state.run }),
        listJobsForWorkflowRunAttempt: 'jobs',
        listWorkflowRunArtifacts: 'artifacts',
      },
    },
    paginate: async (endpoint) => {
      if (endpoint === 'checks') return [state.check];
      if (endpoint === 'jobs') return state.jobs;
      assert.equal(endpoint, 'artifacts');
      return state.artifacts;
    },
  };
  return { state, api };
}

async function stagedProductionFixture(t) {
  const policy = require('../tools/release/staging-policy.cjs');
  const f = stagingAuthenticationFixture();
  const authentication = await policy.authenticate(f.api, context, 88, 'c'.repeat(40));
  const temp = fixture.temporary(t),
    tested = fixture.staging(temp, true);
  const source = fixture.source(temp, 'staged-production', 'c'.repeat(40));
  require('../tools/staging/color.cjs').build(source.directory);
  source.record = edition.build(source.directory, 'color');
  const rights = fixture.rightsInventory(source, true);
  const controlled = require('./fixtures/staging-evidence.cjs');
  const input = controlled.aggregateFixture(true),
    manifest = tested.record;
  const identity = controlled.identity(manifest);
  const host = {
    ...identity,
    kind: 'hosted',
    profile: 'staging',
    root: true,
    actual404: true,
    redirectsStayWithinSite: true,
    rows: Object.keys(manifest.files)
      .filter((file) => file !== '.nojekyll')
      .map((file) => ({
        file,
        status: 200,
        sha256: manifest.files[file].sha256,
        url: input.hostedURL + '/' + file,
        mime: require('../tools/quality/serve.cjs').canonicalType(file),
      })),
  };
  input.manifest = manifest;
  input.sizes.artifactDigest = manifest.artifactDigest;
  input.sizes.files = manifest.files;
  for (const row of input.sizes.rows) Object.assign(row, manifest.files[row.route + '.html']);
  input.reports = [
    host,
    ...input.reports
      .filter((row) => ['lint', 'security', 'advisories'].includes(row.kind))
      .map((row) => ({ ...row, ...identity })),
    controlled.functional(manifest),
    controlled.performanceReport(manifest),
    controlled.colorReport(manifest),
  ];
  const gate = require('../tools/quality/staging-gate.cjs').aggregate(input);
  gate.githubArtifact = {
    id: authentication.public.id,
    uploadDigest: authentication.public.digest,
  };
  const authFile = path.join(temp, 'authentication.json'),
    gateFile = path.join(temp, 'stage-gate.json');
  fs.writeFileSync(authFile, JSON.stringify(authentication));
  fs.writeFileSync(gateFile, JSON.stringify(gate));
  policy.bind(source.directory, authFile, tested.directory, gateFile);
  const expected = { artifactId: 900, uploadDigest: 'sha256:' + 'e'.repeat(64) };
  const admission = policy.gate(
    source.directory,
    path.join(temp, 'release-manifest.json'),
    expected
  );
  const external = fixture.fullProof(source.record, rights.report).external;
  for (const key of ['independentReview', 'iosSafari', 'androidChrome']) delete external[key];
  external.optionalFull = { pass: false, kind: 'controlled failed optional diagnostic' };
  return { temp, tested, source, rights, admission, external, expected };
}

test('production reuses the successful staged source tree without requiring optional full or device reports', async (t) => {
  const f = await stagedProductionFixture(t);
  const policy = require('../tools/release/staging-policy.cjs');
  assert.equal(policy.validate(f.source.record, f.admission, f.expected), true);
  assert.equal(
    require('../tools/release/archive.cjs').candidate(
      f.source.record,
      f.admission,
      f.external,
      f.rights.report
    ),
    true
  );
  assert.equal(f.admission.fullGate, false);
  assert.notEqual(f.admission.artifactDigest, f.admission.staging.manifest.artifactDigest);
  assert.notEqual(f.admission.sourceCommit, f.admission.staging.manifest.sourceCommit);
  assert.equal(f.admission.sourceTree, f.admission.staging.manifest.sourceTree);
  const noRights = structuredClone(f.external);
  delete noRights.rights;
  assert.throws(() =>
    require('../tools/release/archive.cjs').candidate(
      f.source.record,
      f.admission,
      noRights,
      f.rights.report
    )
  );
});

test('production staging admission rejects changed sources, incomplete stages, mixed runtimes and artifact substitution', async (t) => {
  const f = await stagedProductionFixture(t);
  const policy = require('../tools/release/staging-policy.cjs');
  for (const mutate of [
    (a) => (a.fullGate = true),
    (a) => (a.sourceTree = '0'.repeat(40)),
    (a) => (a.staging.authentication.sourceTree = '0'.repeat(40)),
    (a) => (a.staging.authentication.testedSource = '0'.repeat(40)),
    (a) => (a.staging.authentication.attempt = 2),
    (a) => (a.staging.authentication.reports[0].id = a.staging.authentication.public.id),
    (a) => (a.staging.gate.pass = false),
    (a) => (a.staging.gate.jobs.staging.result = 'skipped'),
    (a) => a.staging.gate.checkedReports.pop(),
    (a) => (a.staging.manifest.files['navigation.js'].sha256 = '0'.repeat(64)),
    (a) => (a.githubArtifact.id = '901'),
    (a) => (a.githubArtifact.uploadDigest = 'sha256:' + '0'.repeat(64)),
  ]) {
    const invalid = structuredClone(f.admission);
    mutate(invalid);
    assert.throws(() => policy.validate(f.source.record, invalid, f.expected));
  }
});

test('production authenticates the real successful stage attempt, every existing job and raw artifact before derivation', async () => {
  const policy = require('../tools/release/staging-policy.cjs');
  const good = stagingAuthenticationFixture();
  assert.equal((await policy.authenticate(good.api, context, 88, 'c'.repeat(40))).pass, true);
  for (const mutate of [
    (s) => (s.pr.merged = false),
    (s) => (s.tree = '0'.repeat(40)),
    (s) => (s.check.conclusion = 'failure'),
    (s) => (s.run.run_attempt = 2),
    (s) => (s.run.triggering_actor.login = 'other-user'),
    (s) => (s.jobs.find((job) => job.name === 'full / staging').conclusion = 'failure'),
    (s) => (s.jobs.find((job) => job.name === 'full / staging').conclusion = 'skipped'),
    (s) => (s.jobs.find((job) => job.name === 'smoke').conclusion = 'success'),
    (s) => (s.jobs.find((job) => job.name === 'stage-evidence').conclusion = 'failure'),
    (s) =>
      s.jobs.splice(
        s.jobs.findIndex((job) => job.name === 'smoke'),
        1
      ),
    (s) => (s.artifacts[0].expired = true),
    (s) => (s.artifacts[1].workflow_run.head_sha = '0'.repeat(40)),
    (s) => s.artifacts.push(structuredClone(s.artifacts[0])),
  ]) {
    const invalid = stagingAuthenticationFixture();
    mutate(invalid.state);
    await assert.rejects(policy.authenticate(invalid.api, context, 88, 'c'.repeat(40)));
  }
});

test('the production publisher consumes frozen staging admission and never queries the optional full run', async () => {
  const run = {
    id: 900,
    run_attempt: 1,
    path: '.github/workflows/site-release-candidate.yml',
    event: 'workflow_dispatch',
    head_branch: 'main',
    head_sha: context.sha,
    head_repository: { full_name: 'oborskyivitalii/oborskyivitalii' },
    actor: { login: context.repo.owner },
    triggering_actor: { login: context.repo.owner },
    status: 'completed',
    conclusion: 'success',
  };
  const jobs = ['build', 'publish', 'http'].map((name) => ({
    name,
    status: 'completed',
    conclusion: 'success',
  }));
  const artifacts = [
    'site-production-admission-900-1',
    'site-production-candidate-observations-900-1',
  ].map((name, index) => ({
    id: 500 + index,
    name,
    expired: false,
    digest: 'sha256:' + 'd'.repeat(64),
    workflow_run: { id: 900, head_sha: context.sha },
  }));
  const api = {
    rest: {
      actions: {
        getWorkflowRun: async ({ run_id }) => {
          assert.equal(run_id, 900);
          return { data: run };
        },
        listJobsForWorkflowRunAttempt: 'jobs',
        listWorkflowRunArtifacts: 'artifacts',
      },
    },
    paginate: async (endpoint) => (endpoint === 'jobs' ? jobs : artifacts),
  };
  assert.equal((await controller.stagingValidation(api, context, 900)).gate.id, 500);
  jobs[2].conclusion = 'failure';
  await assert.rejects(controller.stagingValidation(api, context, 900), /candidate job/);
  jobs[2].conclusion = 'success';
  run.path = '.github/workflows/site-candidate-evidence.yml';
  await assert.rejects(controller.stagingValidation(api, context, 900), /untrusted evidence/);
});
