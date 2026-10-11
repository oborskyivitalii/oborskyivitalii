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

function hosted(directory) {
  return async (url) => {
    const u = new URL(url);
    let name = u.pathname.slice(1);
    if (!name || name.endsWith('/')) name += 'index.html';
    const file = path.join(directory, 'public', name);
    return fs.existsSync(file)
      ? fixture.response(url, fs.readFileSync(file))
      : fixture.response(url, pkg.notFound, 404);
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
