'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const fs = require('node:fs'),
  path = require('node:path');
const fixture = require('./fixtures/delivery.cjs');
const pkg = require('../tools/pages/package.cjs'),
  http = require('../tools/pages/http.cjs');
const controller = require('../tools/pages/controller.cjs');
const artifact = require('../tools/quality/artifact.cjs');
const badge = require('../tools/staging/edition.cjs');

test('base and Color staging editions preserve JSON content, snapshots and original size budgets', (t) => {
  const temp = fixture.temporary(t);
  for (const color of [false, true]) {
    const stage = fixture.staging(path.join(temp, String(color)), color);
    pkg.checkStaging(stage.directory, stage.record);
    artifact.checkSize(path.join(stage.directory, 'public'));
    const before = fs
      .readFileSync('docs/writing.html', 'utf8')
      .match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    const after = fs
      .readFileSync(path.join(stage.directory, 'public/writing.html'), 'utf8')
      .match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    assert.deepEqual(JSON.parse(after), JSON.parse(before));
    assert.throws(() => badge.build(stage.directory), /already applied/);
  }
});

test('edition suppresses analytics and verification before hashing without inline styles', () => {
  const routes = Object.fromEntries(
    require('../tools/site/snapshot.cjs').routes.map((id) => [id, { version: id + '-old' }])
  );
  const html =
    '<html><head>\n<script data-site-analytics="cloudflare" src="runtime/sdk.js" defer></script>\n<meta name="google-site-verification" content="abcdefghijklmnopqrst">\n</head><body></body></html>';
  const result = badge.render(
    html,
    { engine: 'old-engine', routes },
    { engine: 'new-engine', versions: {} },
    'a'.repeat(40)
  );
  assert.doesNotMatch(result, /data-site-analytics|google-site-verification|style=/);
  assert.match(result, /STAGING · aaaaaaaa/);
  assert.match(result, /name="robots" content="noindex,nofollow"/);
});

test('Pages initial root is staging and subsequent staging changes preserve every accepted production byte', (t) => {
  const temp = fixture.temporary(t),
    stage = fixture.staging(temp);
  const initial = pkg.build(stage.directory, path.join(temp, 'initial'));
  assert.equal(initial.state.production, null);
  assert.deepEqual(initial.root.files, stage.record.files);
  const production = fixture.production(temp, 'production', 'c'.repeat(40));
  const directory = path.join(temp, 'combined');
  const record = pkg.build(stage.directory, directory, production.directory, 'prod-2026-10-11.1');
  assert.deepEqual(pkg.subtree(record.files, 'staging/'), stage.record.files);
  for (const [name, info] of Object.entries(production.record.files))
    assert.deepEqual(record.files[name], info);
  fs.appendFileSync(path.join(directory, 'public/index.html'), '<!-- untested -->');
  assert.throws(() => pkg.verify(directory, record), /changed/);
  const altered = { ...record, ...artifact.manifest(path.join(directory, 'public')) };
  altered.packageDigest = altered.artifactDigest;
  assert.throws(() => pkg.verify(directory, altered), /accepted production root changed/);
  assert.throws(() => pkg.build(production.directory, path.join(temp, 'wrong-stage')));
});

function hosted(directory, deploymentPath = '/') {
  const prefix = pkg.basePath(deploymentPath);
  return async (url) => {
    const u = new URL(url);
    assert.ok(u.pathname.startsWith(prefix), 'fixture request escaped deployment base');
    let name = u.pathname.slice(prefix.length);
    if (!name || name.endsWith('/')) name += 'index.html';
    const file = path.join(directory, 'public', name);
    return fs.existsSync(file)
      ? fixture.response(url, fs.readFileSync(file))
      : fixture.response(url, fs.readFileSync(path.join(directory, 'public/404.html')), 404);
  };
}

test('production-only Pages retains exact admitted bytes and rights while retiring every staging route', async (t) => {
  const temp = fixture.temporary(t),
    production = fixture.production(temp),
    rights = JSON.parse(fs.readFileSync(path.join(production.directory, 'rights.json'))),
    directory = path.join(temp, 'production-pages');
  const record = pkg.build(null, directory, production.directory, 'prod-2026-10-16.1', null, '/', {
    productionRightsDigest: rights.inventoryDigest,
  });
  assert.equal(record.staging, null);
  assert.equal(record.state.staging, null);
  assert.equal(record.rights.staging, null);
  assert.deepEqual(pkg.subtree(record.files, 'staging/'), {});
  for (const [file, info] of Object.entries(production.record.files))
    assert.deepEqual(record.files[file], info, 'frozen production bytes changed');
  const result = await http.check(directory, 'https://author.invalid/', hosted(directory));
  assert.equal(result.pass, true);
  assert.equal(result.staging, false);
  assert.equal(result.actual404, true);
  await assert.rejects(
    http.check(directory, 'https://author.invalid/', async (url) => {
      if (new URL(url).pathname === '/staging/')
        return fixture.response(url, fs.readFileSync(path.join(directory, 'public/index.html')));
      return hosted(directory)(url);
    }),
    /missing route/
  );
  for (const mutate of [
    (r) => (r.state.production = null),
    (r) => (r.state.production.sourceCommit = 'f'.repeat(40)),
    (r) => (r.state.production.publicDigest = 'f'.repeat(64)),
    (r) => (r.state.staging = { sourceCommit: production.record.sourceCommit }),
    (r) => delete r.rights.productionArchiveDigest,
    (r) => (r.rights.staging = r.rights.root),
  ]) {
    const invalid = structuredClone(record);
    mutate(invalid);
    assert.throws(() => pkg.verify(directory, invalid));
  }
  assert.throws(() => pkg.build(null, path.join(temp, 'without-production')));
  assert.throws(() =>
    pkg.build(null, path.join(temp, 'without-rights'), production.directory, 'prod-2026-10-16.1')
  );
  const stage = fixture.staging(path.join(temp, 'retired-stage'));
  fs.cpSync(path.join(stage.directory, 'public'), path.join(directory, 'public/staging'), {
    recursive: true,
  });
  const altered = { ...record, ...artifact.manifest(path.join(directory, 'public')) };
  altered.packageDigest = altered.artifactDigest;
  assert.throws(() => pkg.verify(directory, altered), /staging copy/);
});

test('Pages HTTP checks exact root, staging, queries, all assets and an actual 404', async (t) => {
  const temp = fixture.temporary(t),
    stage = fixture.staging(temp),
    directory = path.join(temp, 'pages');
  const record = pkg.build(stage.directory, directory);
  const result = await http.check(directory, 'https://author.invalid/', hosted(directory));
  assert.equal(result.pass, true);
  assert.equal(result.actual404, true);
  assert.equal(
    result.rows.length,
    Object.keys(record.files).filter((name) => !name.endsWith('.nojekyll')).length
  );
  for (const extension of ['.jpg', '.webp']) {
    const file = Object.keys(record.files).find((name) => name.endsWith(extension));
    assert.ok(file, 'real package image fixture missing: ' + extension);
    for (const mime of [null, '', 'text/plain'])
      await assert.rejects(
        http.check(directory, 'https://author.invalid/', async (url) => {
          const response = await hosted(directory)(url);
          if (new URL(url).pathname === '/' + file) {
            if (mime === null) response.headers.delete('content-type');
            else response.headers.set('content-type', mime);
          }
          return response;
        }),
        /Content-Type/
      );
  }
  for (const bad of [
    'http://author.invalid/',
    'https://author.invalid/project/',
    'https://author.invalid/?x=1',
  ])
    assert.throws(() => http.origin(bad));
  await assert.rejects(
    http.request('https://author.invalid/', 'https://author.invalid', async (url) =>
      fixture.response(url, '', 301)
    ),
    /canonical/
  );
  await assert.rejects(
    http.request('https://author.invalid/', 'https://author.invalid', async () =>
      fixture.response('https://other.invalid/', '', 200)
    )
  );
  await assert.rejects(
    http.check(directory, 'https://author.invalid/', async (url) =>
      fixture.response(url, fs.readFileSync(path.join(directory, 'public/index.html')))
    ),
    /wrong Pages bytes/
  );
});

test('Pages project base preserves public bytes and confines inventory, query and 404 navigation', async (t) => {
  const temp = fixture.temporary(t),
    stage = fixture.staging(temp),
    directory = path.join(temp, 'project');
  const prefix = '/oborskyivitalii/';
  const record = pkg.build(stage.directory, directory, null, null, null, prefix);
  assert.deepEqual(record.root.files, stage.record.files);
  assert.deepEqual(pkg.subtree(record.files, 'staging/'), stage.record.files);
  assert.equal(record.state.basePath, prefix);
  const requests = [];
  const fetcher = hosted(directory, prefix);
  const result = await http.check(directory, 'https://author.invalid/oborskyivitalii/', (url) => {
    requests.push(url);
    return fetcher(url);
  });
  assert.equal(result.pass, true);
  assert.equal(result.origin, 'https://author.invalid');
  assert.equal(result.baseURL, 'https://author.invalid' + prefix);
  assert.ok(requests.every((url) => new URL(url).pathname.startsWith(prefix)));
  for (const relative of ['staging/', 'staging/__delivery_missing', ''])
    assert.ok(requests.includes('https://author.invalid' + prefix + relative));
  assert.ok(requests.some((url) => url.endsWith('staging/writing.html?topic=systems&language=uk')));
  const fallback = fs.readFileSync(path.join(directory, 'public/404.html'), 'utf8');
  const links = Array.from(fallback.matchAll(/href="([^"]+)"/g), (match) => match[1]);
  assert.deepEqual(links, [prefix, prefix + 'staging/']);
  for (const link of links)
    assert.ok(
      new URL(link, 'https://author.invalid' + prefix + 'missing').pathname.startsWith(prefix)
    );
  await assert.rejects(
    http.check(directory, 'https://author.invalid/', fetcher),
    /base path differs/
  );
  await assert.rejects(
    http.check(directory, 'https://author.invalid/other/', fetcher),
    /base path differs/
  );
  await assert.rejects(
    http.check(directory, 'https://author.invalid' + prefix, async (url) => {
      const response = await fetcher(url);
      return url.endsWith('__delivery_missing') ? { ...response, status: 200 } : response;
    }),
    /missing route to Home/
  );
});

test('Pages base normalization rejects ambiguous paths and leaves production origin root-only', async () => {
  for (const input of ['https://author.invalid/project', 'https://author.invalid/project/'])
    assert.equal(http.baseURL(input), 'https://author.invalid/project');
  assert.equal(http.baseURL('https://author.invalid/'), 'https://author.invalid');
  for (const bad of [
    'http://author.invalid/project/',
    'https://owner@author.invalid/project/',
    'https://author.invalid:444/project/',
    'https://author.invalid/project/?x=1',
    'https://author.invalid/project/#fragment',
    'https://author.invalid/project/../other/',
    'https://author.invalid/project/./',
    'https://author.invalid/project//nested/',
    'https://author.invalid/project%2fother/',
    'https://author.invalid/project%5cother/',
    'https://author.invalid/project\\other/',
  ])
    assert.throws(() => http.baseURL(bad), bad);
  const productionOrigin = require('../tools/release/edition.cjs').origin;
  assert.equal(http.origin(productionOrigin), productionOrigin);
  assert.throws(() => http.origin(productionOrigin + '/project/'), /rooted at the origin/);
  let fetched = false;
  await assert.rejects(
    http.request(
      'https://author.invalid/project-other/index.html',
      'https://author.invalid/project',
      async () => {
        fetched = true;
      }
    ),
    /request left configured base path/
  );
  assert.equal(fetched, false);
  for (const responseURL of [
    'https://author.invalid/index.html',
    'https://author.invalid/project-other/index.html',
    'https://other.invalid/project/index.html',
    'https://author.invalid/project/other.html',
  ])
    await assert.rejects(
      http.request(
        'https://author.invalid/project/index.html',
        'https://author.invalid/project',
        async () => fixture.response(responseURL, '')
      )
    );
});

test('Pages project receipt and bootstrap stay inside the selected base', async () => {
  const context = { repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' } };
  const base = 'https://author.invalid/project';
  const requested = [];
  const absent = async (url) => {
    requested.push(url);
    assert.ok(new URL(url).pathname.startsWith('/project/'));
    return fixture.response(url, '', 404);
  };
  assert.equal(await controller.previous({}, context, base, null, absent), null);
  assert.deepEqual(requested, [base + '/_delivery/state.json', base + '/']);
  await assert.rejects(
    controller.previous({}, context, base, null, async (url) =>
      fixture.response(url, '', url.endsWith('state.json') ? 404 : 200)
    ),
    /untracked existing/
  );
  for (const basePath of [undefined, '/', '/other/'])
    await assert.rejects(
      controller.previous({}, context, base, null, async (url) =>
        fixture.response(url, JSON.stringify({ schema: 1, production: null, basePath }))
      ),
      /receipt base path differs/
    );
});

test('Pages project recovery retains its prefix and cannot compose an accepted production root', (t) => {
  const temp = fixture.temporary(t),
    stage = fixture.staging(temp),
    directory = path.join(temp, 'project');
  const record = pkg.build(stage.directory, directory, null, null, null, '/project/');
  controller.retained(directory, { state: record.state });
  assert.throws(
    () => controller.retained(directory, { state: { ...record.state, basePath: '/other/' } }),
    /receipt/
  );
  const production = fixture.production(temp, 'production', 'c'.repeat(40));
  assert.throws(
    () =>
      pkg.build(
        stage.directory,
        path.join(temp, 'wrong-production'),
        production.directory,
        'prod-2026-10-11.1',
        null,
        '/project/'
      ),
    /production Pages requires origin root/
  );
  for (const bad of ['', 'project/', '/project//', '/project/../', '/project%2fother/'])
    assert.throws(() => pkg.basePath(bad));
});

test('legacy Pages root recovery verifies exact retained bytes without granting a project prefix', async (t) => {
  const temp = fixture.temporary(t),
    stage = fixture.staging(temp),
    directory = path.join(temp, 'legacy');
  const record = pkg.build(stage.directory, directory);
  delete record.state.basePath;
  fs.writeFileSync(
    path.join(directory, 'public/_delivery/state.json'),
    JSON.stringify(record.state, null, 2) + '\n'
  );
  const manifest = artifact.manifest(path.join(directory, 'public'));
  record.files = manifest.files;
  record.packageDigest = manifest.artifactDigest;
  fs.writeFileSync(
    path.join(directory, 'pages-package.json'),
    JSON.stringify(record, null, 2) + '\n'
  );
  controller.retained(directory, { state: record.state });
  assert.equal(
    (await http.check(directory, 'https://author.invalid/', hosted(directory))).pass,
    true
  );
  await assert.rejects(
    http.check(directory, 'https://author.invalid/project/', hosted(directory)),
    /base path differs/
  );
});

test('failed Pages observations settle all launched requests before recovery', async (t) => {
  const temp = fixture.temporary(t),
    stage = fixture.staging(temp),
    directory = path.join(temp, 'pages');
  pkg.build(stage.directory, directory);
  let active = 0,
    peak = 0;
  await assert.rejects(
    http.check(directory, 'https://author.invalid/', async (url) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active--;
      return fixture.response(url, 'incorrect');
    })
  );
  assert.equal(peak, 4);
  assert.equal(active, 0);
});

test('Pages production lease and retained receipt reject unknown or replaced state', (t) => {
  const temp = fixture.temporary(t),
    stage = fixture.staging(temp),
    directory = path.join(temp, 'pages');
  const record = pkg.build(stage.directory, directory, null, null, {
    kind: 'ci-pages',
    runId: '900',
    attempt: '1',
    controller: 'a'.repeat(40),
  });
  controller.retained(directory, { state: record.state });
  assert.throws(
    () => controller.retained(directory, { state: { ...record.state, staging: null } }),
    /receipt/
  );
  const production = {
    tag: 'prod-2026-10-11.1',
    sourceCommit: 'b'.repeat(40),
    publicDigest: 'c'.repeat(64),
  };
  assert.throws(
    () => controller.productionLease({ state: record.state }, production),
    /production differs/
  );
});

test('Pages accepted production ignores native environment success and authenticates release records', async () => {
  const context = {
    repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' },
  };
  const native = {
    id: 102,
    creator: { login: context.repo.owner },
    sha: 'a'.repeat(40),
    payload: {},
  };
  const accepted = {
    id: 101,
    creator: { login: 'github-actions[bot]' },
    sha: 'b'.repeat(40),
    payload: {
      kind: 'accepted-production',
      tag: 'prod-2026-10-17.1',
      sourceCommit: 'b'.repeat(40),
      publicDigest: 'c'.repeat(64),
    },
  };
  const deployments = [native];
  const statuses = new Map([
    [native.id, 'success'],
    [accepted.id, 'success'],
  ]);
  const api = {
    rest: {
      repos: {
        listDeployments: 'deployments',
        listDeploymentStatuses: async ({ deployment_id }) => ({
          data: [{ state: statuses.get(deployment_id) }],
        }),
      },
    },
    paginate: async (method, args) => {
      assert.equal(method, 'deployments');
      assert.equal(args.environment, 'production');
      return deployments.slice();
    },
  };
  assert.equal(await controller.activeProduction(api, context), null);
  deployments.push(accepted);
  assert.deepEqual(await controller.activeProduction(api, context), {
    ...accepted.payload,
    deploymentId: accepted.id,
  });
  for (const mutate of [
    (value) => (value.creator.login = context.repo.owner),
    (value) => (value.payload.tag = 'latest'),
    (value) => (value.payload.sourceCommit = 'd'.repeat(40)),
  ]) {
    const invalid = structuredClone(accepted);
    mutate(invalid);
    deployments[1] = invalid;
    await assert.rejects(controller.activeProduction(api, context));
  }
  deployments[1] = { ...accepted, payload: JSON.stringify(accepted.payload) };
  statuses.set(accepted.id, 'failure');
  assert.equal(await controller.activeProduction(api, context), null);
  statuses.set(accepted.id, 'success');
  assert.equal((await controller.activeProduction(api, context)).tag, accepted.payload.tag);
});

test('Pages recovery trusts the exact successful attempt and stops on untracked roots or expired recovery', async () => {
  const context = { repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' } };
  const state = {
    schema: 1,
    production: null,
    publication: { kind: 'ci-pages', runId: '900', attempt: '1', controller: 'a'.repeat(40) },
  };
  const run = {
    head_sha: 'a'.repeat(40),
    head_branch: 'main',
    actor: { login: context.repo.owner },
    path: '.github/workflows/site-color-review.yml',
  };
  const api = {
    rest: {
      actions: {
        getWorkflowRun: async () => ({ data: run }),
        listJobsForWorkflowRunAttempt: 'jobs',
        listWorkflowRunArtifacts: 'artifacts',
      },
    },
    paginate: async (method, args) => {
      if (method === 'jobs') {
        assert.equal(args.attempt_number, 1);
        return [{ name: 'pages / Pages publication', conclusion: 'success' }];
      }
      return [
        { id: 123, name: 'site-pages-900-1', expired: false, digest: 'sha256:' + 'd'.repeat(64) },
      ];
    },
  };
  const fetcher = async (url) => fixture.response(url, JSON.stringify(state));
  assert.equal(
    (await controller.previous(api, context, 'https://author.invalid/', null, fetcher)).artifactId,
    123
  );
  const project = 'https://author.invalid/project';
  assert.equal(
    (
      await controller.previous(api, context, project, null, async (url) => {
        assert.equal(url, project + '/_delivery/state.json');
        return fixture.response(url, JSON.stringify({ ...state, basePath: '/project/' }));
      })
    ).artifactId,
    123
  );
  api.paginate = async (method) =>
    method === 'jobs'
      ? [{ name: 'pages / Pages publication', conclusion: 'success' }]
      : [{ id: 123, name: 'site-pages-900-1', expired: true }];
  await assert.rejects(
    controller.previous(api, context, 'https://author.invalid/', null, fetcher),
    /expired/
  );
  await assert.rejects(
    controller.previous(api, context, 'https://author.invalid/', null, async (url) =>
      fixture.response(url, '', url.endsWith('state.json') ? 404 : 200)
    ),
    /untracked/
  );
});

function failedInitialFixture(t) {
  const temp = fixture.temporary(t),
    stage = fixture.staging(temp),
    directory = path.join(temp, 'first-failed');
  const context = { repo: { owner: 'oborskyivitalii', repo: 'oborskyivitalii' } };
  const record = pkg.build(
    stage.directory,
    directory,
    null,
    null,
    {
      kind: 'ci-pages',
      runId: '900',
      attempt: '1',
      controller: 'a'.repeat(40),
    },
    '/project/'
  );
  const upload = require('node:child_process').execFileSync(
    'python3',
    [
      '-c',
      `
import io, pathlib, sys, zipfile
root = pathlib.Path(sys.argv[1])
output = io.BytesIO()
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        if file.is_file():
            archive.write(file, 'pages-package/' + file.relative_to(root).as_posix())
sys.stdout.buffer.write(output.getvalue())
`,
      directory,
    ],
    { timeout: 20000, maxBuffer: 300_000_000 }
  );
  const run = {
    id: 900,
    repository: { full_name: 'oborskyivitalii/oborskyivitalii' },
    head_sha: 'a'.repeat(40),
    head_branch: 'main',
    actor: { login: context.repo.owner },
    triggering_actor: { login: context.repo.owner },
    path: '.github/workflows/site-color-review.yml',
    event: 'issue_comment',
    status: 'completed',
    conclusion: 'failure',
    run_attempt: 1,
  };
  const steps = [
    ...[
      'Authenticate controller and actual successful staging producer',
      'Verify actual bounded gate and frozen staging edition',
      'Resolve the currently accepted production archive',
      'Authenticate the current Pages receipt and retained recovery',
      'Compose staging while preserving accepted production file hashes',
      'Retain the complete new package before touching the live site',
      'Recheck the publication controller and active production lease',
      'Run actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e',
      'Verify every hosted Pages byte, staging path and real 404',
      // continue-on-error masks the failed browser outcome in the REST conclusion.
      'Verify actual staged navigation on the Pages subpath',
      'Retain actual publication observations before acceptance',
    ].map((name) => ({ name, status: 'completed', conclusion: 'success' })),
    ...[
      'Verify retained and currently hosted recovery bytes before publication',
      'Restore durable production bytes when production is active',
      'Extract and verify the production archive',
      'Retain the previous complete Pages artifact for exact recovery',
      'Restore the previous exact combined Pages artifact on a failed update',
      'Verify the restored Pages publication',
    ].map((name) => ({ name, status: 'completed', conclusion: 'skipped' })),
    { name: 'Keep failed publication or recovery red', status: 'completed', conclusion: 'failure' },
  ];
  const publisher = {
    name: 'pages / Pages publication',
    status: 'completed',
    conclusion: 'failure',
    steps,
  };
  const item = {
    id: 123,
    name: 'site-pages-900-1',
    expired: false,
    digest: 'sha256:' + artifact.digest(upload),
    workflow_run: { id: 900, head_sha: run.head_sha, head_branch: 'main' },
  };
  const inputs = { run, jobs: [publisher], artifacts: [item] };
  const api = {
    rest: {
      actions: {
        getWorkflowRun: async () => ({ data: inputs.run }),
        listJobsForWorkflowRunAttempt: 'jobs',
        listWorkflowRunArtifacts: 'artifacts',
      },
    },
    paginate: async (method, args) => {
      assert.equal(args.run_id, 900);
      if (method === 'jobs') assert.equal(args.attempt_number, 1);
      return inputs[method];
    },
  };
  return {
    directory,
    context,
    record,
    upload,
    inputs,
    api,
    fetcher: hosted(directory, '/project/'),
  };
}

test('only staging can use an authenticated failed first Pages publication as unaccepted recovery', async (t) => {
  const f = failedInitialFixture(t),
    base = 'https://author.invalid/project';
  await assert.rejects(
    controller.previous(f.api, f.context, base, null, f.fetcher, true),
    /was not accepted/
  );
  const previous = await controller.previousStaging(f.api, f.context, base, null, f.fetcher);
  assert.equal(previous.accepted, false);
  assert.equal(previous.recoveryKind, 'failed-initial-staging');
  assert.equal(previous.artifactId, 123);
  controller.retained(f.directory, previous, f.upload);
  const observed = await http.check(f.directory, base, f.fetcher);
  assert.equal(observed.pass, true);
  assert.equal(observed.packageDigest, f.record.packageDigest);
  assert.equal(f.record.state.publication.runId, '900');
});

test('failed first Pages recovery rejects foreign, incomplete, stale and ambiguous provenance', async (t) => {
  const f = failedInitialFixture(t),
    original = structuredClone(f.inputs);
  const changes = [
    (x) => x.run.id++,
    (x) => (x.run.repository.full_name = 'other/other'),
    (x) => (x.run.head_sha = 'b'.repeat(40)),
    (x) => (x.run.head_branch = 'candidate'),
    (x) => (x.run.actor.login = 'other'),
    (x) => (x.run.triggering_actor.login = 'other'),
    (x) => (x.run.path = '.github/workflows/site-production.yml'),
    (x) => (x.run.event = 'pull_request'),
    (x) => (x.run.status = 'in_progress'),
    (x) => (x.run.conclusion = 'cancelled'),
    (x) => (x.run.run_attempt = 2),
    (x) => (x.jobs[0].status = 'in_progress'),
    (x) => (x.jobs[0].conclusion = 'cancelled'),
    (x) => (x.jobs[0].name = 'other / Pages publication'),
    (x) => x.jobs.push(structuredClone(x.jobs[0])),
    (x) => x.jobs[0].steps.pop(),
    (x) => x.jobs[0].steps.push(structuredClone(x.jobs[0].steps[0])),
    (x) => (x.artifacts.length = 0),
    (x) => x.artifacts.push(structuredClone(x.artifacts[0])),
    (x) => (x.artifacts[0].expired = true),
    (x) => x.artifacts[0].workflow_run.id++,
    (x) => (x.artifacts[0].workflow_run.head_sha = 'b'.repeat(40)),
    (x) => (x.artifacts[0].workflow_run.head_branch = 'candidate'),
    (x) => (x.artifacts[0].digest = 'unknown'),
    (x) => (x.artifacts[0].id = 'invalid'),
    (x) =>
      (x.jobs[0].steps = x.jobs[0].steps.filter(
        (step) => step.name !== 'Verify actual staged navigation on the Pages subpath'
      )),
    (x) =>
      (x.jobs[0].steps.find(
        (step) => step.name === 'Verify actual staged navigation on the Pages subpath'
      ).status = 'in_progress'),
  ];
  for (const change of changes) {
    Object.assign(f.inputs, structuredClone(original));
    change(f.inputs);
    await assert.rejects(
      controller.previousStaging(
        f.api,
        f.context,
        'https://author.invalid/project',
        null,
        f.fetcher
      )
    );
  }
});

test('a prior Pages baseline, failed rollback or active production cannot become first-failed recovery', async (t) => {
  const f = failedInitialFixture(t),
    original = structuredClone(f.inputs);
  for (const name of [
    'Verify retained and currently hosted recovery bytes before publication',
    'Retain the previous complete Pages artifact for exact recovery',
    'Restore the previous exact combined Pages artifact on a failed update',
    'Verify the restored Pages publication',
  ]) {
    Object.assign(f.inputs, structuredClone(original));
    f.inputs.jobs[0].steps.find((step) => step.name === name).conclusion = 'success';
    await assert.rejects(
      controller.previousStaging(
        f.api,
        f.context,
        'https://author.invalid/project',
        null,
        f.fetcher
      ),
      /not a first failed/
    );
  }
  Object.assign(f.inputs, structuredClone(original));
  await assert.rejects(
    controller.previousStaging(
      f.api,
      f.context,
      'https://author.invalid/project',
      {
        tag: 'prod-2026-10-11.1',
        sourceCommit: 'b'.repeat(40),
        publicDigest: 'c'.repeat(64),
      },
      f.fetcher
    ),
    /production differs/
  );
});

test('failed first Pages recovery requires the exact upload, receipt and current hosted bytes', async (t) => {
  const f = failedInitialFixture(t),
    base = 'https://author.invalid/project';
  const previous = await controller.previousStaging(f.api, f.context, base, null, f.fetcher);
  assert.throws(() => controller.retained(f.directory, previous), /exact upload ZIP/);
  assert.throws(
    () => controller.retained(f.directory, previous, Buffer.from('changed')),
    /upload changed/
  );
  assert.throws(
    () =>
      controller.retained(
        f.directory,
        {
          ...previous,
          receiptDigest: 'e'.repeat(64),
        },
        f.upload
      ),
    /receipt bytes differ/
  );
  assert.throws(
    () =>
      controller.retained(
        f.directory,
        {
          ...previous,
          state: { ...previous.state, staging: null },
        },
        f.upload
      ),
    /differs from live receipt/
  );
  const metadata = path.join(f.directory, 'pages-package.json');
  const original = fs.readFileSync(metadata);
  const substituted = structuredClone(f.record);
  substituted.root.sourceTree = substituted.staging.sourceTree = 'e'.repeat(40);
  fs.writeFileSync(metadata, JSON.stringify(substituted, null, 2) + '\n');
  assert.throws(
    () => controller.retained(f.directory, previous, f.upload),
    /rights source\/artifact differs/
  );
  const extraMetadata = { ...f.record, unauthenticatedMetadata: 'substituted' };
  fs.writeFileSync(metadata, JSON.stringify(extraMetadata, null, 2) + '\n');
  assert.throws(() => controller.retained(f.directory, previous, f.upload), /authenticated ZIP/);
  fs.writeFileSync(metadata, original);
  await assert.rejects(
    http.check(f.directory, base, async (url) => {
      const response = await f.fetcher(url);
      return url.endsWith('/index.html') ? fixture.response(url, 'changed live bytes') : response;
    }),
    /wrong Pages bytes/
  );
  const file = path.join(f.directory, 'public/index.html');
  fs.appendFileSync(file, '<!-- changed recovery -->');
  assert.throws(() => controller.retained(f.directory, previous, f.upload), /bytes changed/);
});
