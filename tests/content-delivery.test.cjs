'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const content = require('../tools/quality/content-gate.cjs');
const stage = require('../tools/quality/staging-gate.cjs');
const fixture = require('./fixtures/staging-evidence.cjs');
const controller = require('../tools/release/controller.cjs');
const source = require('../tools/quality/source-tests.cjs');
const root = require('node:path').resolve(__dirname, '..');

test('production generation copies identical staged raw bytes and rejects dirty, moved, corrupt and overlapping inputs', (t) => {
  const fs = require('node:fs'),
    path = require('node:path'),
    os = require('node:os');
  const cp = require('node:child_process');
  const artifact = require('../tools/quality/artifact.cjs');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'staged-generation-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const directory = path.join(temp, 'staged');
  fs.mkdirSync(directory);
  const output = path.join(directory, 'public');
  fs.cpSync(path.join(root, 'docs'), output, { recursive: true });
  const source = (ref) =>
    cp.execFileSync('git', ['rev-parse', ref], { cwd: root, encoding: 'utf8' }).trim();
  const record = {
    schema: 1,
    syntheticFixture: true,
    sourceDirty: false,
    sourceCommit: source('HEAD'),
    sourceTree: source('HEAD^{tree}'),
    candidateCommit: source('HEAD'),
    articleCandidates: [],
    generation: artifact.storeGeneration(
      directory,
      output,
      fs.readFileSync(path.join(root, 'site/output-lock.json'))
    ),
    ...artifact.manifest(output),
  };
  record.components = require('../tools/site/snapshot.cjs').verify(output, record);
  const file = path.join(directory, 'artifact.json');
  fs.writeFileSync(file, JSON.stringify(record));
  require('../tools/staging/color.cjs').build(directory);
  const staged = require('../tools/staging/edition.cjs').build(directory);
  const result = artifact.stagedGeneration(path.join(temp, 'production'), directory, []);
  assert.deepEqual(result.generation, staged.generation);
  assert.deepEqual(
    artifact.manifest(path.join(temp, 'production/public')),
    artifact.manifest(path.join(directory, 'generation/public'))
  );
  for (const change of [
    (value) => {
      value.sourceDirty = true;
    },
    (value) => {
      value.sourceTree = '0'.repeat(40);
    },
    (value) => {
      value.articleCandidates = ['unaccepted'];
    },
    (value) => {
      value.generation.outputLockSha256 = '0'.repeat(64);
    },
  ]) {
    const invalid = structuredClone(staged);
    change(invalid);
    fs.writeFileSync(file, JSON.stringify(invalid));
    assert.throws(() => artifact.stagedGeneration(path.join(temp, 'invalid'), directory, []));
  }
  fs.writeFileSync(file, JSON.stringify(staged));
  assert.throws(() => artifact.stagedGeneration(directory, directory, []), /separate/);
  fs.appendFileSync(path.join(directory, 'generation/public/navigation.js'), '\n');
  assert.throws(
    () => artifact.stagedGeneration(path.join(temp, 'corrupt'), directory, []),
    /baseline bytes/
  );
});

test('content/media observations preserve a nested Pages base and reject path escapes', () => {
  const { resourceURL } = require('../tools/quality/content-browser.cjs');
  assert.equal(
    resourceURL('https://example.invalid/author', 'articles/example.html'),
    'https://example.invalid/author/articles/example.html'
  );
  assert.equal(
    resourceURL('https://example.invalid/author/', 'article-media/hash/image.png'),
    'https://example.invalid/author/article-media/hash/image.png'
  );
  for (const file of [
    '../outside.png',
    '/outside.png',
    'https://other.invalid/file',
    'article-media/%2e%2e/file',
  ])
    assert.throws(() => resourceURL('https://example.invalid/author', file));
});

test('workflow selection can read accepted checks and feeds economical admission through the shared protected publisher', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const yaml = require('../tools/quality/common.cjs').toolRequire('yaml');
  const workflow = (name) =>
    yaml.parse(fs.readFileSync(path.join(root, '.github/workflows', name), 'utf8'));
  const review = workflow('site-color-review.yml');
  for (const permission of ['contents', 'actions', 'checks', 'pull-requests'])
    assert.equal(review.jobs.build.permissions[permission], 'read');
  const selector = review.jobs.build.steps.find((step) => step.id === 'content_baseline');
  assert.match(selector.with.script, /selectAccepted/);
  assert.ok(
    !selector.if.includes("mode == 'preview'"),
    'accepted content is available to owner staging'
  );
  const checks = workflow('site-release-checks.yml');
  const stagingRun = checks.jobs.staging.steps.map((step) => step.run || '').join('\n');
  assert.match(stagingRun, /content-browser\.cjs/);
  assert.match(stagingRun, /staging-regression\.cjs/);
  const candidate = workflow('site-release-candidate.yml');
  const buildRun = candidate.jobs.build.steps.map((step) => step.run || '').join('\n');
  assert.match(buildRun, /--accepted-generation quality-reports\/staging\/public/);
  assert.match(buildRun, /staging-policy\.cjs bind[^\n]+publication-base\.json/);
  assert.equal(workflow('site-production.yml').concurrency.group, 'author-pages-publication');
});

function candidate() {
  const f = fixture.aggregateFixture(false);
  f.manifest.components.articles = {};
  f.manifest.contentRelease = {
    schema: 1,
    kind: 'content-release',
    lane: 'content',
    engine: f.manifest.components.engine,
    builtRoutes: ['talks'],
    reusedRoutes: ['index', 'research', 'writing', 'credits'],
    builtArticles: [],
    reusedArticles: [],
    platformFiles: Object.fromEntries(
      ['a.js', 'b.js', 'c.js', 'd.js', 'e.js', 'styles.css'].map((name) => [name, 'f'.repeat(64)])
    ),
    trustedBaseline: { sourceCommit: 'a'.repeat(40), sourceTree: 'b'.repeat(40) },
    admission: {
      schema: 1,
      kind: 'accepted-content-baseline',
      mergedSource: 'c'.repeat(40),
      gateSha256: 'd'.repeat(64),
      authentication: {
        kind: 'accepted-staging-source',
        pass: true,
        sourceCommit: 'a'.repeat(40),
        sourceTree: 'b'.repeat(40),
        mergedSource: 'c'.repeat(40),
      },
    },
  };
  const historyRecord = {
    kind: 'accepted-content-history',
    pass: true,
    accepted: 'c'.repeat(40),
    protectedMain: 'c'.repeat(40),
    candidate: f.manifest.sourceCommit,
    commits: [{ commit: f.manifest.sourceCommit, parent: 'c'.repeat(40), lane: 'content' }],
    repositoryCommits: [],
    repositoryMerges: [],
  };
  const historyIdentity = require('../tools/quality/delivery-json.cjs');
  f.manifest.contentRelease.admission.history = {
    ...historyRecord,
    digest: historyIdentity.digest(historyIdentity.canonical(historyRecord)),
  };
  const identity = f.reports.find((report) => report.kind === 'stage-functional');
  f.reports = f.reports.filter((report) =>
    ['hosted', 'lint', 'security', 'advisories'].includes(report.kind)
  );
  for (const report of f.reports.filter((row) => row.kind !== 'hosted')) {
    report.target = null;
    report.environment.runId = '1';
    report.environment.attempt = '1';
  }
  f.reports.push({
    ...identity,
    kind: 'content-functional',
    profile: 'staging',
    contentContract: 1,
    browser: 'Controlled fixture; not an observed browser',
    elapsedMs: 1,
    policy: content.policy,
    platformRegression: 'inherited; not rerun',
    articles: undefined,
    media: [],
    rows: content.cases(f.manifest).map((selected) => ({
      ...selected,
      pass: true,
      status: 200,
      sha256: f.manifest.files[selected.file].sha256,
      h1: 1,
      overflow: false,
      imagesDecoded: true,
      errors: [],
    })),
  });
  return f;
}

test('distinct content gate inherits accepted platform and requires every affected desktop/mobile native document', () => {
  const f = candidate();
  const gate = stage.aggregate(f);
  assert.equal(gate.kind, 'content-staging-gate');
  assert.equal(gate.coverage.performanceRerun, false);
  assert.equal(gate.coverage.contentRows, 8);
  assert.equal(stage.validateGate(f.manifest, gate, f.hostedURL), true);
});

test('content admission rejects missing acceptance, runtime mismatch, omitted/no-JS/wrong-source/undecoded observations', () => {
  for (const change of [
    (f) => {
      delete f.manifest.contentRelease.admission;
    },
    (f) => {
      f.manifest.contentRelease.admission.authentication.pass = false;
    },
    (f) => {
      f.manifest.contentRelease.engine = '0'.repeat(64);
    },
    (f) => {
      f.manifest.contentRelease.builtRoutes.push('research');
    },
    (f) => {
      f.reports.at(-1).rows.pop();
    },
    (f) => {
      f.reports.at(-1).rows[0].sha256 = '0'.repeat(64);
    },
    (f) => {
      f.reports.at(-1).rows[0].imagesDecoded = false;
    },
    (f) => {
      f.reports.at(-1).rows[0].errors.push('decode error');
    },
    (f) => {
      f.sourceChecks = 'skipped';
    },
    (f) => {
      f.jobs.staging.result = 'skipped';
    },
  ]) {
    const f = candidate();
    change(f);
    assert.throws(() => stage.aggregate(f));
  }
});

test('event insertion/edit, article/tag and local media select economical routes; global/compiler/mixed changes do not', () => {
  const registry = source.loadRegistry(root);
  for (const file of [
    'site/content/events.json',
    'site/content/pages/talks/talks.json',
    'site/publications/example/manuscript.en.md',
    'site/content/article-tags.json',
  ])
    assert.equal(source.classifyContent(registry, [file]).lane, 'content');
  assert.equal(
    source.classifyContent(registry, ['site/assets/publications/example/figure.png']).lane,
    'media'
  );
  for (const file of [
    'site/assets/favicon.svg',
    'tools/site/article-media.cjs',
    'site/templates/components/event.html',
    '.github/workflows/site-production.yml',
    'unknown.json',
  ])
    assert.equal(
      source.classifyContent(registry, ['site/content/events.json', file]).lane,
      'platform'
    );
});

test('serialized publication rejects a candidate that lost its main or accepted composition lease', () => {
  const current = {
    tag: 'prod-2026-10-19.1',
    sourceCommit: 'a'.repeat(40),
    publicDigest: 'b'.repeat(64),
  };
  const record = { sourceCommit: 'c'.repeat(40) };
  const gate = { publicationBase: current };
  assert.equal(controller.currentCandidate(record, record.sourceCommit, gate, current), true);
  assert.throws(() => controller.currentCandidate(record, 'd'.repeat(40), gate, current), /stale/);
  assert.throws(
    () =>
      controller.currentCandidate(record, record.sourceCommit, gate, {
        ...current,
        publicDigest: 'e'.repeat(64),
      }),
    /composition moved/
  );
  assert.throws(
    () =>
      controller.currentCandidate(
        record,
        record.sourceCommit,
        { staging: { gate: { kind: 'content-staging-gate' } } },
        current
      ),
    /predecessor/
  );
});

test('decoded media coverage is exact and rejects failed decode, substituted bytes and excessive dimensions', () => {
  const f = candidate();
  const file = 'article-media/' + 'a'.repeat(64) + '/image.png';
  f.manifest.components.articles['example:en'] = { assets: [file] };
  f.manifest.files[file] = { sha256: 'a'.repeat(64), raw: 100, gzip: 80 };
  const report = f.reports.at(-1);
  report.media = [
    { file, status: 200, sha256: 'a'.repeat(64), width: 640, height: 480, pass: true },
  ];
  assert.equal(content.validateDocuments(report, f.manifest).decodedMedia, 1);
  for (const change of [
    (value) => value.media.pop(),
    (value) => {
      value.media[0].pass = false;
    },
    (value) => {
      value.media[0].sha256 = 'b'.repeat(64);
    },
    (value) => {
      value.media[0].width = 0;
    },
    (value) => {
      value.media[0].height = 8001;
    },
    (value) => {
      value.media[0].width = 8000;
      value.media[0].height = 8000;
    },
  ]) {
    const invalid = structuredClone(report);
    change(invalid);
    assert.throws(() => content.validateDocuments(invalid, f.manifest));
  }
});
