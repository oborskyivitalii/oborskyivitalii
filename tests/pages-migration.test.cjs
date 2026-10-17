'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const child = require('node:child_process');
const fixture = require('./fixtures/delivery.cjs');
const migration = require('../tools/pages/migration.cjs');
const controller = require('../tools/pages/controller.cjs');
const pkg = require('../tools/pages/package.cjs');
const http = require('../tools/pages/http.cjs');
const artifact = require('../tools/quality/artifact.cjs');
const flow = require('../tools/staging/review-flow.cjs');

function hosted(directory, prefix = '/', responseChange = null) {
  return async (url) => {
    const name = new URL(url).pathname.slice(prefix.length) || 'index.html';
    const file = path.join(directory, 'public', name.endsWith('/') ? name + 'index.html' : name);
    const response = fs.existsSync(file)
      ? fixture.response(url, fs.readFileSync(file))
      : fixture.response(url, fs.readFileSync(path.join(directory, 'public/404.html')), 404);
    return responseChange ? responseChange(response, url) : response;
  };
}

function zip(directory, output) {
  child.execFileSync('python3', [
    '-c',
    [
      'import pathlib,sys,zipfile',
      'root=pathlib.Path(sys.argv[1])',
      'with zipfile.ZipFile(sys.argv[2],"w") as archive:',
      '    for file in sorted(root.rglob("*")):',
      '        if file.is_file(): archive.write(file,"pages-package/"+str(file.relative_to(root)))',
    ].join('\n'),
    directory,
    output,
  ]);
}

function setup(t) {
  const temp = fixture.temporary(t);
  const stage = fixture.staging(temp, true);
  const previousDir = path.join(temp, 'old');
  const receipt = {
    kind: 'ci-pages',
    runId: '7',
    attempt: '1',
    controller: 'd'.repeat(40),
  };
  const old = pkg.build(stage.directory, previousDir, null, null, receipt, '/oborskyivitalii/');
  const upload = path.join(temp, 'previous.zip');
  zip(previousDir, upload);
  const context = {
    repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
    ref: 'refs/heads/main',
    actor: 'oborskyivitalii',
    sha: 'c'.repeat(40),
    eventName: 'workflow_dispatch',
    runId: 101,
  };
  const run = {
    id: 7,
    run_attempt: 1,
    head_sha: receipt.controller,
    head_branch: 'main',
    path: flow.workflow,
    repository: { full_name: flow.repository },
    actor: { login: context.actor },
    triggering_actor: { login: context.actor },
    status: 'completed',
    conclusion: 'success',
    event: 'workflow_dispatch',
  };
  const item = {
    id: 9,
    expired: false,
    name: 'site-pages-7-1',
    digest: 'sha256:' + artifact.digest(fs.readFileSync(upload)),
    workflow_run: { id: 7, head_sha: run.head_sha, head_branch: 'main' },
  };
  const main = { protected: true, commit: { sha: context.sha } };
  const pages = {
    html_url: migration.from + '/',
    cname: null,
    build_type: 'workflow',
    https_enforced: true,
  };
  const github = {
    rest: {
      repos: {
        getBranch: async () => ({ data: main }),
        getPages: async () => ({ data: pages }),
        listDeployments: 'deployments',
      },
      actions: {
        getWorkflowRun: async () => ({ data: run }),
        getArtifact: async () => ({ data: item }),
        listJobsForWorkflowRunAttempt: 'jobs',
        listWorkflowRunArtifacts: 'artifacts',
      },
    },
    paginate: async (method) => {
      if (method === 'deployments') return [];
      if (method === 'jobs') return [{ name: 'pages / Pages publication', conclusion: 'success' }];
      if (method === 'artifacts') return [item];
      throw Error('unexpected fixture method');
    },
  };
  return {
    temp,
    stage,
    previousDir,
    old,
    upload,
    context,
    run,
    item,
    main,
    pages,
    github,
  };
}

async function frozen(t) {
  const value = setup(t);
  const previousAttempt = process.env.GITHUB_RUN_ATTEMPT;
  process.env.GITHUB_RUN_ATTEMPT = '1';
  t.after(() => {
    if (previousAttempt === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
    else process.env.GITHUB_RUN_ATTEMPT = previousAttempt;
  });
  const plan = await migration.prepare(
    value.github,
    value.context,
    value.main,
    value.pages,
    hosted(value.previousDir, '/oborskyivitalii/')
  );
  const directory = path.join(value.temp, 'prepared');
  await migration.freeze(
    value.previousDir,
    value.upload,
    plan,
    directory,
    hosted(value.previousDir, '/oborskyivitalii/')
  );
  return { ...value, plan, directory };
}

test('production recovery preserves canonical settings and authenticates an unchanged historical capsule', async (t) => {
  const value = await frozen(t);
  const actions = require('../tools/release/actions.cjs');
  const current = { ...value.context, sha: 'e'.repeat(40) };
  value.main.commit.sha = current.sha;
  Object.assign(value.pages, {
    html_url: migration.to + '/',
    cname: new URL(migration.to).hostname,
  });
  Object.assign(value.run, { id: 101, head_sha: value.plan.controller, path: migration.workflow });
  Object.assign(value.item, {
    id: 19,
    name: 'site-pages-migration-preparation-101-1',
    workflow_run: { id: 101, head_sha: value.run.head_sha, head_branch: 'main' },
  });
  let ancestor = value.run.head_sha;
  value.github.rest.repos.compareCommitsWithBasehead = async () => ({
    data: { merge_base_commit: { sha: ancestor } },
  });
  value.github.paginate = async (endpoint) =>
    endpoint === 'deployments'
      ? []
      : endpoint === 'jobs'
        ? [{ name: 'Pages migration preparation', conclusion: 'success' }]
        : [value.item];
  const proof = await actions.preparation(value.github, current, 101, 1);
  const before = structuredClone(value.pages);
  const result = await actions.canonicalPredecessor(
    value.github,
    current,
    value.directory,
    proof,
    hosted(value.previousDir)
  );
  assert.equal(result.observation.pass, true);
  assert.equal(result.observation.packageDigest, value.old.packageDigest);
  assert.deepEqual(value.pages, before, 'production recovery must never rewrite Pages settings');
  ancestor = 'a'.repeat(40);
  await assert.rejects(
    actions.canonicalPredecessor(
      value.github,
      current,
      value.directory,
      proof,
      hosted(value.previousDir)
    )
  );
  ancestor = value.run.head_sha;
  value.pages.https_enforced = false;
  await assert.rejects(
    actions.canonicalPredecessor(
      value.github,
      current,
      value.directory,
      proof,
      hosted(value.previousDir)
    )
  );
  value.pages.https_enforced = true;
  await assert.rejects(
    actions.canonicalPredecessor(
      value.github,
      current,
      value.directory,
      proof,
      hosted(value.previousDir, '/', (response) => ({
        ...response,
        arrayBuffer: async () => Buffer.from('changed'),
      }))
    )
  );
  await assert.rejects(
    actions.canonicalPredecessor(
      value.github,
      { ...current, actor: 'other' },
      value.directory,
      proof,
      hosted(value.previousDir)
    )
  );
});

test('first production consumes the authenticated predecessor for recovery without republishing staging', async (t) => {
  const value = await frozen(t);
  Object.assign(value.pages, {
    html_url: migration.to + '/',
    cname: new URL(migration.to).hostname,
  });
  const observed = await migration.firstPublication(
    value.github,
    value.context,
    value.directory,
    value.plan.preparation,
    hosted(value.previousDir)
  );
  assert.deepEqual(observed, value.plan.previous);
  assert.deepEqual(migration.load(value.directory).previous, observed);
  for (const invalid of [
    { ...value.plan.preparation, runId: 999 },
    { ...value.plan.preparation, attempt: 2 },
  ]) {
    await assert.rejects(
      migration.firstPublication(
        value.github,
        value.context,
        value.directory,
        invalid,
        hosted(value.previousDir)
      )
    );
  }
  await assert.rejects(
    migration.firstPublication(
      value.github,
      { ...value.context, sha: 'b'.repeat(40) },
      value.directory,
      value.plan.preparation,
      hosted(value.previousDir)
    )
  );
  await assert.rejects(
    migration.firstPublication(
      value.github,
      value.context,
      value.directory,
      value.plan.preparation,
      hosted(value.previousDir, '/', (response) => ({
        ...response,
        arrayBuffer: async () => Buffer.from('changed'),
      }))
    )
  );
});

test('first-publication settings recovery accepts only the captured configuration and observes ambiguous writes', async (t) => {
  const value = await frozen(t);
  const original = structuredClone(value.pages);
  const canonical = {
    ...original,
    html_url: migration.to + '/',
    cname: new URL(migration.to).hostname,
  };
  let writes = 0;
  value.github.rest.repos.updateInformationAboutPagesSite = async (request) => {
    writes++;
    assert.equal(request.cname, null);
    assert.equal(request.build_type, 'workflow');
    assert.equal(request.https_enforced, original.https_enforced);
    Object.assign(value.pages, original);
    throw Object.assign(Error('committed then connection lost'), {
      status: 502,
    });
  };
  Object.assign(value.pages, canonical);
  assert.deepEqual(
    await migration.restoreSettings(value.github, value.context, value.plan),
    value.plan.settings
  );
  assert.equal(writes, 1);
  await migration.restoreSettings(value.github, value.context, value.plan);
  assert.equal(writes, 1, 'already-restored configuration must not be rewritten');
  Object.assign(value.pages, canonical);
  value.github.rest.repos.updateInformationAboutPagesSite = async () => {
    writes++;
    throw Object.assign(Error('Pages authority missing'), { status: 403 });
  };
  await assert.rejects(
    migration.restoreSettings(value.github, value.context, value.plan),
    /Pages authority missing/
  );
  Object.assign(value.pages, { ...canonical, cname: 'unrelated.example' });
  const before = writes;
  await assert.rejects(migration.restoreSettings(value.github, value.context, value.plan));
  assert.equal(writes, before, 'unrelated settings must never be overwritten');
});

test('migration authenticates old prefix before binding and preserves all staged/root source bytes', async (t) => {
  const value = await frozen(t);
  assert.equal(migration.load(value.directory).previousPackageDigest, value.old.packageDigest);
  const publication = {
    kind: 'ci-pages',
    runId: '102',
    attempt: '1',
    controller: value.context.sha,
  };
  const output = path.join(value.temp, 'next');
  const next = migration.compose(value.directory, output, publication);
  assert.equal(next.state.basePath, '/');
  assert.equal(next.state.production, null);
  assert.deepEqual(next.state.publication, publication);
  assert.deepEqual(next.root, value.old.root);
  assert.deepEqual(next.staging, value.old.staging);
  const changed = Object.keys(next.files).filter(
    (name) => next.files[name].sha256 !== value.old.files[name]?.sha256
  );
  assert.deepEqual(changed.sort(), ['404.html', '_delivery/state.json']);
  await migration.observeSource(value.directory, hosted(value.previousDir));
  const checked = await http.check(
    path.join(output, 'pages-package'),
    migration.to,
    hosted(path.join(output, 'pages-package'))
  );
  assert.equal(checked.basePath, '/');
  assert.equal(checked.actual404, true);
  await assert.rejects(
    http.check(
      path.join(output, 'pages-package'),
      migration.to,
      hosted(path.join(output, 'pages-package'), '/', (response, url) =>
        new URL(url).pathname === '/__delivery_missing' ? { ...response, status: 200 } : response
      )
    ),
    /missing route to Home/
  );
  await assert.rejects(
    controller.previous(value.github, value.context, migration.to, null, hosted(value.previousDir)),
    /receipt base path differs/
  );
  Object.assign(value.run, {
    id: 102,
    path: migration.workflow,
    head_sha: value.context.sha,
  });
  Object.assign(value.item, {
    name: 'site-pages-102-1',
    workflow_run: { id: 102, head_sha: value.context.sha, head_branch: 'main' },
  });
  const ordinary = await controller.previous(
    value.github,
    value.context,
    migration.to,
    null,
    hosted(path.join(output, 'pages-package'))
  );
  assert.deepEqual(ordinary.state, next.state);
  assert.equal(ordinary.runId, 102);
});

test('migration rejects host/prefix/settings, run and retained/source byte tampering', async (t) => {
  const value = await frozen(t);
  for (const change of [
    { from: 'https://oborskyivitalii.github.io' },
    { from: migration.from + '/other' },
    { to: 'https://attacker.invalid' },
    {
      previous: {
        ...value.plan.previous,
        state: { ...value.plan.previous.state, basePath: '/' },
      },
    },
    {
      previous: {
        ...value.plan.previous,
        state: { ...value.plan.previous.state, production: {} },
      },
    },
    { settings: { ...value.plan.settings, cname: 'attacker.invalid' } },
  ])
    assert.throws(() => migration.validate({ ...value.plan, ...change }));
  await assert.rejects(
    migration.observeSource(
      value.directory,
      hosted(value.previousDir, '/', (response, url) =>
        url.endsWith('staging/index.html') ? fixture.response(url, 'changed') : response
      )
    ),
    /source bytes changed/
  );
  await assert.rejects(
    migration.observeSource(value.directory, async (url) => fixture.response(url, '', 301)),
    /canonical Pages origin/
  );
  await assert.rejects(
    migration.observeSource(value.directory, async () =>
      fixture.response('https://attacker.invalid/index.html', '')
    )
  );
  fs.appendFileSync(path.join(value.directory, 'previous-upload.zip'), 'tamper');
  assert.throws(() => migration.load(value.directory), /upload changed/);
});

test('migration preparation requires actual accepted source workflow, owner and exact attempt', async (t) => {
  for (const change of [
    { path: '.github/workflows/attacker.yml' },
    { head_sha: 'a'.repeat(40) },
    { triggering_actor: { login: 'someone-else' } },
    { run_attempt: 2 },
    { conclusion: 'failure' },
    { repository: { full_name: 'attacker/oborskyivitalii' } },
  ]) {
    const value = setup(t);
    Object.assign(value.run, change);
    process.env.GITHUB_RUN_ATTEMPT = '1';
    await assert.rejects(
      migration.prepare(
        value.github,
        value.context,
        value.main,
        value.pages,
        hosted(value.previousDir, '/oborskyivitalii/')
      )
    );
  }
});

test('execution preparation proof authenticates controller, job, artifact and run identity', async (t) => {
  const value = setup(t);
  Object.assign(value.run, {
    id: 101,
    path: migration.workflow,
    head_sha: value.context.sha,
  });
  Object.assign(value.item, {
    name: 'site-pages-migration-preparation-101-1',
    workflow_run: { id: 101, head_sha: value.context.sha },
  });
  value.github.paginate = async (method) =>
    method === 'jobs'
      ? [{ name: 'Pages migration preparation', conclusion: 'success' }]
      : [value.item];
  const proof = await migration.preparation(value.github, value.context, '101', '1');
  assert.equal(proof.artifactId, 9);
  for (const change of [
    { path: flow.workflow },
    { event: 'pull_request' },
    { run_attempt: 2 },
    { head_sha: 'a'.repeat(40) },
    { conclusion: 'failure' },
  ]) {
    const original = { ...value.run };
    Object.assign(value.run, change);
    await assert.rejects(migration.preparation(value.github, value.context, '101', '1'));
    Object.assign(value.run, original);
  }
  value.item.expired = true;
  await assert.rejects(migration.preparation(value.github, value.context, '101', '1'));
});

test('migration execution and recovery lease admit only frozen controller and captured settings', async (t) => {
  const value = await frozen(t);
  await assert.rejects(migration.lease(value.github, value.context, value.plan, 'execute'));
  value.pages.html_url = migration.to;
  value.pages.cname = new URL(migration.to).hostname;
  await migration.lease(value.github, value.context, value.plan, 'execute');
  await assert.rejects(migration.lease(value.github, value.context, value.plan, 'recover'));
  value.main.commit.sha = 'b'.repeat(40);
  await assert.rejects(
    migration.lease(value.github, value.context, value.plan, 'execute'),
    /moved/
  );
  value.main.commit.sha = value.context.sha;
  value.pages.html_url = migration.from;
  value.pages.cname = null;
  await migration.lease(value.github, value.context, value.plan, 'recover');
  value.pages.https_enforced = false;
  await assert.rejects(
    migration.lease(value.github, value.context, value.plan, 'recover'),
    /captured Pages settings/
  );
  value.pages.https_enforced = true;
  value.github.rest.repos.listDeploymentStatuses = async () => ({
    data: [{ state: 'success' }],
  });
  value.github.paginate = async () => [
    {
      id: 1,
      creator: { login: 'github-actions[bot]' },
      sha: value.context.sha,
      payload: {
        kind: 'accepted-production',
        tag: 'prod-2026-10-15.1',
        sourceCommit: value.context.sha,
        publicDigest: 'a'.repeat(64),
      },
    },
  ];
  await assert.rejects(
    migration.lease(value.github, value.context, value.plan, 'recover'),
    /production became active/
  );
});

test('recovery admits only frozen predecessor or exact failed migration receipt, never a successful successor', async (t) => {
  const value = await frozen(t);
  Object.assign(value.run, {
    id: 102,
    path: migration.workflow,
    head_sha: value.context.sha,
    conclusion: 'failure',
  });
  value.github.paginate = async () => [{ name: 'Pages publication', conclusion: 'failure' }];
  await migration.recoverySource(
    value.github,
    value.context,
    value.directory,
    '102',
    '1',
    hosted(value.previousDir, '/oborskyivitalii/')
  );
  const output = path.join(value.temp, 'failed');
  migration.compose(value.directory, output, {
    kind: 'ci-pages',
    runId: '102',
    attempt: '1',
    controller: value.context.sha,
  });
  await migration.recoverySource(
    value.github,
    value.context,
    value.directory,
    '102',
    '1',
    hosted(path.join(output, 'pages-package'), '/oborskyivitalii/')
  );
  value.run.conclusion = 'success';
  await assert.rejects(
    migration.recoverySource(
      value.github,
      value.context,
      value.directory,
      '102',
      '1',
      hosted(value.previousDir, '/oborskyivitalii/')
    ),
    /failed migration/
  );
  value.run.conclusion = 'failure';
  await assert.rejects(
    migration.recoverySource(
      value.github,
      value.context,
      value.directory,
      '102',
      '1',
      async (url) =>
        fixture.response(
          url,
          JSON.stringify({
            ...value.plan.previous.state,
            staging: {
              sourceCommit: 'a'.repeat(40),
              publicDigest: 'b'.repeat(64),
            },
          })
        )
    ),
    /source receipt/
  );
});

test('authenticated migration ZIP extraction rejects digest mismatch, traversal and symlinks', (t) => {
  const value = setup(t);
  const unpack = (file, digest, suffix) =>
    child.execFileSync(
      'python3',
      ['tools/pages/unpack.py', file, path.join(value.temp, suffix), digest],
      { stdio: 'pipe' }
    );
  unpack(value.upload, value.item.digest, 'extracted');
  assert.throws(() => unpack(value.upload, 'a'.repeat(64), 'wrong-digest'), /digest differs/);
  for (const [name, mode] of [
    ['../escape', 0],
    ['linked', 0o120777],
  ]) {
    const file = path.join(value.temp, mode ? 'link.zip' : 'traversal.zip');
    child.execFileSync('python3', [
      '-c',
      [
        'import sys,zipfile',
        'with zipfile.ZipFile(sys.argv[1],"w") as archive:',
        '    item=zipfile.ZipInfo(sys.argv[2]);item.external_attr=int(sys.argv[3])<<16',
        '    archive.writestr(item,"fixture")',
      ].join('\n'),
      file,
      name,
      String(mode),
    ]);
    assert.throws(
      () => unpack(file, artifact.digest(fs.readFileSync(file)), mode ? 'link' : 'traversal'),
      /Unsafe Pages migration ZIP entry/
    );
  }
});
