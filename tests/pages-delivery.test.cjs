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
  const production = fixture.source(temp, 'production', 'c'.repeat(40));
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
  const production = fixture.source(temp, 'production', 'c'.repeat(40));
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
