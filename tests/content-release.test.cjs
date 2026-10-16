'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const builder = require('../tools/site/build.cjs');
const content = require('../tools/site/content-release.cjs');
const artifact = require('../tools/quality/artifact.cjs');
const snapshot = require('../tools/site/snapshot.cjs');
const { verifyCandidateSource } = require('../tools/quality/candidate-source.cjs');
const { legacyCatalog } = require('./fixtures/catalog.cjs');
const repo = path.resolve(__dirname, '..');
const candidates = ['first-profile', 'second-profile'];
let prepared;

function write(root, name, bytes) {
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
}

function json(root, name, value) {
  write(root, name, JSON.stringify(value, null, 2) + '\n');
}

function readJSON(root, name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}

function publication(root, id, body = 'An authored bounded test article.') {
  const directory = 'site/publications/' + id;
  const manuscript = '# ' + id + '\n\n## One section\n\n' + body + '\n';
  const launch = 'An authored launch post.\n';
  const metadata = {
    schema: 1,
    id,
    slug: id,
    title: id,
    summary: 'A bounded test article.',
    authors: [{ name: 'Vitalii Oborskyi' }],
    language: 'en',
    topic: 'systems',
    owner: { repository: 'oborskyivitalii/oborskyivitalii', path: directory },
    status: 'draft',
    source: 'manuscript.en.md',
    edition: 'first-edition',
    profile: 'profile.json',
    canonical: null,
    references: [],
    assets: [],
    rights: { status: 'review-pending', notice: 'Review pending.', references: [] },
    platforms: {
      linkedin: { mode: 'equivalent-rendition' },
      medium: { mode: 'equivalent-rendition' },
    },
  };
  const edition = {
    schema: 1,
    id: 'first-edition',
    articleId: id,
    language: 'en',
    kind: 'full-article',
    source: { path: metadata.source, sha256: builder.sha(manuscript), commit: null, blob: null },
    owner: 'site',
    derivation: null,
    rights: 'review-pending',
  };
  edition.semanticSha256 = require('../tools/publishing/semantic.cjs').semanticDigest(
    metadata,
    edition.source
  );
  write(root, directory + '/' + metadata.source, manuscript);
  write(root, directory + '/launch-post.en.md', launch);
  json(root, directory + '/publication.json', metadata);
  json(root, directory + '/editions/first-edition.json', edition);
  json(root, directory + '/profile.json', {
    schema: 1,
    id,
    platforms: {
      linkedin: { formats: ['txt'], relationship: 'equivalent-rendition' },
      medium: { formats: ['txt'], relationship: 'equivalent-rendition' },
    },
    launch: { source: 'launch-post.en.md', sha256: builder.sha(launch) },
    seo: { title: id, summary: metadata.summary },
    assets: {
      cover: { omitReason: 'Text-only test profile.' },
      hero: { omitReason: 'Text-only test profile.' },
    },
    limits: {},
  });
}

test.before(() => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-release-prepared-'));
  for (const name of [
    'site',
    'tools/site',
    'tools/publishing',
    'tools/build_scene_fallbacks.cjs',
  ]) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.cpSync(path.join(repo, name), path.join(root, name), {
      recursive: true,
      filter: (file) => !file.split(path.sep).includes('node_modules'),
    });
  }
  // This synthetic fixture owns its articles; live accepted catalog entries
  // would otherwise point at owners deliberately absent from this directory.
  json(root, 'site/content/catalog.json', legacyCatalog(repo));
  fs.rmSync(path.join(root, 'site/publications'), { recursive: true, force: true });
  publication(root, candidates[0]);
  publication(root, candidates[1]);
  json(root, 'site/article-preview.json', { schema: 1, candidates });
  const directory = path.join(root, 'baseline');
  const output = path.join(directory, 'public');
  const generation = builder.build({
    root,
    output,
    all: true,
    candidateArticles: candidates,
    cacheFile: path.join(root, 'baseline-cache.json'),
  });
  const lockBytes = fs.readFileSync(output + '.output-lock.json');
  const record = {
    schema: 1,
    sourceCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    candidateCommit: 'a'.repeat(40),
    sourceDirty: false,
    articleCandidates: candidates,
    generation: artifact.storeGeneration(directory, output, lockBytes),
    ...artifact.manifest(output),
  };
  record.components = snapshot.verify(output, record);
  json(directory, 'artifact.json', record);
  require('../tools/staging/color.cjs').build(directory);
  require('../tools/staging/edition.cjs').build(directory);
  prepared = { root, generation };
});

test.after(() => {
  if (prepared) fs.rmSync(prepared.root, { recursive: true, force: true });
});

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-release-'));
  fs.cpSync(prepared.root, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const directory = path.join(root, 'baseline');
  const raw = artifact.generationPaths(directory);
  const record = readJSON(directory, 'artifact.json');
  return {
    root,
    directory,
    raw,
    record,
    baseline: {
      directory,
      expectedGenerationSha256: record.generation.outputLockSha256,
      expectedArtifactDigest: record.artifactDigest,
    },
  };
}

function release(f, options = {}) {
  return content.release({
    root: f.root,
    baseline: f.raw.publicDir,
    baselineLock: f.raw.lockFile,
    expectedBaselineLockSha256: f.record.generation.outputLockSha256,
    output: path.join(f.root, 'release'),
    candidateArticles: candidates,
    ...options,
  });
}

function changedCatalog(f) {
  const catalog = readJSON(f.root, 'site/content/catalog.json');
  const id = Object.keys(catalog.records).find((key) => !catalog.featured.includes(key));
  catalog.records[id].edition.url += '-content-update';
  json(f.root, 'site/content/catalog.json', catalog);
}

test('an external link changes Writing while verified runtime and other routes are reused', (t) => {
  const f = fixture(t);
  changedCatalog(f);
  const result = release(f);
  assert.deepEqual(result.report.builtRoutes, ['writing']);
  assert.deepEqual(result.report.reusedArticles, ['first-profile:en', 'second-profile:en']);
  assert.deepEqual(result.report.builtArticles, []);
  for (const name of snapshot.runtimeFiles) {
    assert.deepEqual(
      fs.readFileSync(path.join(f.root, 'release', name)),
      fs.readFileSync(path.join(f.raw.publicDir, name))
    );
  }
  for (const id of ['index', 'research', 'talks', 'credits'])
    assert.equal(result.generation.files[id + '.html'], prepared.generation.files[id + '.html']);
  snapshot.verify(path.join(f.root, 'release'), result.manifest);
});

test('changing one article and adding another preserve unrelated article and platform bytes', (t) => {
  const f = fixture(t);
  publication(f.root, candidates[0], 'A changed complete test article.');
  publication(f.root, 'third-profile');
  const result = release(f, { candidateArticles: [...candidates, 'third-profile'] });
  assert.deepEqual(result.report.builtRoutes, ['writing']);
  assert.deepEqual(result.report.builtArticles, ['first-profile:en', 'third-profile:en']);
  assert.deepEqual(result.report.reusedArticles, ['second-profile:en']);
  const prior = prepared.generation.articles['second-profile:en'];
  assert.equal(result.generation.articles['second-profile:en'].version, prior.version);
  assert.equal(result.generation.files[prior.snapshot], prepared.generation.files[prior.snapshot]);
  assert.ok(result.generation.files[prepared.generation.articles['first-profile:en'].snapshot]);
});

test('platform, page-template and other page edits fail without replacing an existing output', (t) => {
  const f = fixture(t);
  const output = path.join(f.root, 'release');
  write(output, 'sentinel.txt', 'Previous output.\n');
  for (const name of ['site/engine/styles.css', 'site/templates/pages/writing/main.html']) {
    const file = path.join(f.root, name);
    const original = fs.readFileSync(file);
    fs.appendFileSync(file, '\n');
    assert.throws(() => release(f), /platform changed/);
    fs.writeFileSync(file, original);
    assert.equal(fs.readFileSync(path.join(output, 'sentinel.txt'), 'utf8'), 'Previous output.\n');
  }
  const section = readJSON(f.root, 'site/content/pages/research/intro.json');
  section.text.T001 += ' Changed.';
  json(f.root, 'site/content/pages/research/intro.json', section);
  assert.throws(() => release(f), /changed another page/);
  assert.equal(fs.readFileSync(path.join(output, 'sentinel.txt'), 'utf8'), 'Previous output.\n');
});

test('wrong lock, missing asset, altered runtime and extra partial-baseline files are rejected', (t) => {
  const f = fixture(t);
  assert.throws(() => release(f, { expectedBaselineLockSha256: 'f'.repeat(64) }), /trusted SHA256/);
  const asset = path.join(f.raw.publicDir, 'assets/favicon.svg');
  const originalAsset = fs.readFileSync(asset);
  fs.rmSync(asset);
  assert.throws(() => release(f), /inventory differs/);
  fs.writeFileSync(asset, originalAsset);
  const runtime = path.join(f.raw.publicDir, 'navigation.js');
  const originalRuntime = fs.readFileSync(runtime);
  fs.appendFileSync(runtime, '\n');
  assert.throws(() => release(f), /bytes differ/);
  fs.writeFileSync(runtime, originalRuntime);
  write(f.raw.publicDir, 'partial.txt', 'Untrusted.\n');
  assert.throws(() => release(f), /inventory differs/);
});

test('preview baseline reuse cannot carry draft snapshots into ordinary public output', (t) => {
  const f = fixture(t);
  assert.throws(() => release(f, { candidateArticles: [] }), /Preview candidate baseline/);
  assert.throws(
    () =>
      artifact.composeContentGeneration({
        projectRoot: f.root,
        out: path.join(f.root, 'artifact'),
        contentBaseline: f.baseline,
        articleCandidates: [],
      }),
    /candidate selection changed/
  );
});

function compose(f, layers = []) {
  const directory = path.join(f.root, 'content-artifact');
  const result = artifact.composeContentGeneration({
    projectRoot: f.root,
    out: directory,
    contentBaseline: f.baseline,
    articleCandidates: candidates,
  });
  const record = {
    schema: 1,
    sourceCommit: 'c'.repeat(40),
    sourceTree: 'd'.repeat(40),
    candidateCommit: 'c'.repeat(40),
    sourceDirty: false,
    articleCandidates: candidates,
    generation: result.declaration,
    contentRelease: result.report,
    ...artifact.manifest(path.join(directory, 'public')),
  };
  record.components = snapshot.verify(path.join(directory, 'public'), record);
  json(directory, 'artifact.json', record);
  for (const layer of layers) require('../tools/staging/' + layer + '.cjs').build(directory);
  return { directory, record: readJSON(directory, 'artifact.json') };
}

test('content artifact retains prior deployed Color/staging snapshots and proves exact current source', (t) => {
  const f = fixture(t);
  changedCatalog(f);
  publication(f.root, candidates[0], 'Changed content with prior deployed reader retained.');
  const articleDirectory = 'site/publications/' + candidates[0];
  const metadata = readJSON(f.root, articleDirectory + '/publication.json');
  metadata.slug = 'renamed-first-profile';
  const edition = readJSON(f.root, articleDirectory + '/editions/first-edition.json');
  edition.semanticSha256 = require('../tools/publishing/semantic.cjs').semanticDigest(
    metadata,
    edition.source
  );
  json(f.root, articleDirectory + '/publication.json', metadata);
  json(f.root, articleDirectory + '/editions/first-edition.json', edition);
  const output = compose(f, ['color', 'edition']);
  assert.ok(output.record.files['articles/renamed-first-profile.html']);
  assert.equal(output.record.files['articles/first-profile.html'], undefined);
  for (const [name, info] of Object.entries(f.record.files)) {
    if (!snapshot.immutable(name)) continue;
    assert.equal(output.record.files[name].sha256, info.sha256, name);
  }
  assert.equal(
    verifyCandidateSource(path.join(output.directory, 'public'), output.record, {
      repoRoot: f.root,
    }),
    true
  );
  const original = readJSON(f.root, 'site/content/catalog.json');
  changedCatalog(f);
  assert.throws(
    () =>
      verifyCandidateSource(path.join(output.directory, 'public'), output.record, {
        repoRoot: f.root,
      }),
    /differs from verified current source/
  );
  json(f.root, 'site/content/catalog.json', original);
});

test('exact content source proof rejects substituted stored baseline, declaration and retained bytes', (t) => {
  const f = fixture(t);
  changedCatalog(f);
  const output = compose(f);
  const publicDir = path.join(output.directory, 'public');
  const stored = path.join(output.directory, 'content-baseline/generation/output-lock.json');
  const original = fs.readFileSync(stored);
  fs.appendFileSync(stored, '\n');
  assert.throws(
    () => verifyCandidateSource(publicDir, output.record, { repoRoot: f.root }),
    /trusted SHA256/
  );
  fs.writeFileSync(stored, original);
  const record = structuredClone(output.record);
  record.contentRelease.trustedBaseline.sourceCommit = 'f'.repeat(40);
  assert.throws(
    () => verifyCandidateSource(publicDir, record, { repoRoot: f.root }),
    /baseline source differs/
  );
  const retained = f.record.components.routes.writing.url;
  fs.appendFileSync(path.join(publicDir, retained), '\n');
  assert.throws(
    () => verifyCandidateSource(publicDir, output.record, { repoRoot: f.root }),
    /bytes do not match/
  );
});

test('CLI content arguments require explicit trusted identities and reject duplicates', () => {
  assert.deepEqual(
    content.argumentsFor([
      '--baseline',
      '/baseline',
      '--baseline-lock',
      '/lock',
      '--baseline-lock-sha256',
      'a'.repeat(64),
      '--output',
      '/output',
      '--candidate',
      'example',
    ]).candidateArticles,
    ['example']
  );
  assert.throws(
    () => content.argumentsFor(['--baseline', '/one', '--baseline', '/two']),
    /duplicate/
  );
  const local = require('../tools/quality/local.cjs');
  assert.throws(
    () => local.contentArguments(['/output', '--content-base', 'a'.repeat(40)]),
    /requires an exact source base/
  );
});

test('canonical CI Basic dispatches platform or fully declared content and never falls back on error', () => {
  const { ciPackage } = require('../tools/quality/local.cjs');
  const calls = [];
  const checks = {
    platformCheck: () => calls.push('platform'),
    artifactBuild: (out) => {
      calls.push(out);
      return 'platform artifact';
    },
    contentCheck: (options) => {
      calls.push(options);
      return 'content artifact';
    },
  };
  for (const mode of [undefined, '', 'platform']) {
    calls.length = 0;
    assert.equal(
      ciPackage('/output', { ...checks, environment: { CONTENT_MODE: mode } }),
      'platform artifact'
    );
    assert.deepEqual(calls, ['platform', '/output']);
  }
  const environment = {
    CONTENT_MODE: 'content',
    CONTENT_BASELINE: '/trusted',
    CONTENT_BASE_SHA: 'a'.repeat(40),
    CONTENT_GENERATION_SHA256: 'b'.repeat(64),
    CONTENT_BASELINE_DIGEST: 'c'.repeat(64),
  };
  calls.length = 0;
  assert.equal(ciPackage('/output', { ...checks, environment }), 'content artifact');
  assert.deepEqual(calls, [
    {
      out: '/output',
      base: environment.CONTENT_BASE_SHA,
      contentBaseline: {
        directory: '/trusted',
        expectedGenerationSha256: environment.CONTENT_GENERATION_SHA256,
        expectedArtifactDigest: environment.CONTENT_BASELINE_DIGEST,
      },
    },
  ]);
  for (const field of [
    'CONTENT_BASELINE',
    'CONTENT_BASE_SHA',
    'CONTENT_GENERATION_SHA256',
    'CONTENT_BASELINE_DIGEST',
  ]) {
    const incomplete = { ...environment };
    delete incomplete[field];
    calls.length = 0;
    assert.throws(
      () => ciPackage('/output', { ...checks, environment: incomplete }),
      /content CI Basic requires/
    );
    assert.deepEqual(calls, []);
  }
  calls.length = 0;
  assert.throws(
    () => ciPackage('/output', { ...checks, environment: { CONTENT_MODE: 'unknown' } }),
    /unknown CI Basic/
  );
  assert.deepEqual(calls, []);
  assert.throws(
    () =>
      ciPackage('/output', {
        ...checks,
        environment,
        contentCheck: () => {
          throw Error('Failed content proof');
        },
      }),
    /Failed content proof/
  );
  assert.deepEqual(calls, []);
});
