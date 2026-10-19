'use strict';
// Explicit local synthetic evidence for the content path; never a publication or release gate.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const builder = require('../site/build.cjs');
const contentRelease = require('../site/content-release.cjs');
const artifact = require('./artifact.cjs');
const { root, toolRequire, launchOptions, environment } = require('./common.cjs');
const ARTICLE = 'content-check-fixture';
const KEY = ARTICLE + ':en';

function write(directory, file, bytes) {
  const target = path.join(directory, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
}

function json(directory, file, value) {
  write(directory, file, JSON.stringify(value, null, 2) + '\n');
}

function manuscript(revised = false) {
  const paragraph =
    'This is synthetic diagnostic prose for a content release browser fixture. ' +
    'It exercises native reading, scroll, anchors and history without supplying any author article. ' +
    'The fixture stays in an isolated temporary directory and is never published.';
  const sections = ['Scope', 'Verified generation', 'Native reading'];
  return (
    '# Content release browser fixture\n\n' +
    sections
      .map((heading) => '## ' + heading + '\n\n' + Array(5).fill(paragraph).join('\n\n'))
      .join('\n\n') +
    (revised ? '\n\nA changed synthetic paragraph verifies one article rebuild.\n' : '\n')
  );
}

function publication(directory, revised = false) {
  const owner = 'site/publications/' + ARTICLE;
  const body = manuscript(revised) + '\n\n![Synthetic one-pixel figure](asset:fixture-image)\n';
  const image = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=',
    'base64'
  );
  const imagePath = 'site/assets/publications/' + ARTICLE + '/fixture.png';
  write(directory, imagePath, image);
  const launch = 'Synthetic diagnostic fixture; never a publication.\n';
  const metadata = {
    schema: 1,
    id: ARTICLE,
    slug: ARTICLE,
    title: 'Content release browser fixture',
    summary: 'A synthetic diagnostic article for the content release path.',
    authors: [{ name: 'Vitalii Oborskyi' }],
    language: 'en',
    topic: 'systems',
    owner: { repository: 'oborskyivitalii/oborskyivitalii', path: owner },
    status: 'draft',
    source: 'manuscript.en.md',
    edition: 'fixture-edition',
    profile: 'profile.json',
    canonical: null,
    references: [],
    assets: [
      {
        id: 'fixture-image',
        path: imagePath,
        sha256: builder.sha(image),
        width: 1,
        height: 1,
        alt: 'Synthetic one-pixel figure',
        caption: 'Synthetic diagnostic image.',
        credit: 'Controlled fixture; never a publication.',
      },
    ],
    rights: { status: 'review-pending', notice: 'Synthetic fixture only.', references: [] },
    platforms: {
      linkedin: { mode: 'equivalent-rendition' },
      medium: { mode: 'equivalent-rendition' },
    },
  };
  const edition = {
    schema: 1,
    id: metadata.edition,
    articleId: ARTICLE,
    language: 'en',
    kind: 'full-article',
    source: { path: metadata.source, sha256: builder.sha(body), commit: null, blob: null },
    owner: 'site',
    derivation: null,
    rights: 'review-pending',
  };
  edition.semanticSha256 = require('../publishing/semantic.cjs').semanticDigest(
    metadata,
    edition.source
  );
  write(directory, owner + '/' + metadata.source, body);
  write(directory, owner + '/launch-post.en.md', launch);
  json(directory, owner + '/publication.json', metadata);
  json(directory, owner + '/editions/' + metadata.edition + '.json', edition);
  json(directory, owner + '/profile.json', {
    schema: 1,
    id: ARTICLE,
    platforms: {
      linkedin: { formats: ['txt'], relationship: 'equivalent-rendition' },
      medium: { formats: ['txt'], relationship: 'equivalent-rendition' },
    },
    launch: { source: 'launch-post.en.md', sha256: builder.sha(launch) },
    seo: { title: metadata.title, summary: metadata.summary },
    assets: {
      cover: { omitReason: 'Synthetic fixture uses one body image, without a cover.' },
      hero: { omitReason: 'Synthetic fixture uses one body image, without a hero.' },
    },
    limits: {},
  });
}

function prepare({ sourceRoot = root, temporaryRoot = os.tmpdir() } = {}) {
  const directory = fs.mkdtempSync(path.join(temporaryRoot, 'site-content-browser-'));
  try {
    cp.execFileSync(
      'git',
      ['clone', '--shared', '--no-checkout', '--quiet', sourceRoot, directory],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    for (const source of [
      'site',
      'tools/site',
      'tools/publishing',
      'tools/build_scene_fallbacks.cjs',
      ...Object.values(require('../site/legal.cjs').sources),
    ]) {
      fs.mkdirSync(path.dirname(path.join(directory, source)), { recursive: true });
      fs.cpSync(path.join(sourceRoot, source), path.join(directory, source), {
        recursive: true,
        filter: (file) => !file.split(path.sep).includes('node_modules'),
      });
    }
    publication(directory);
    const baseline = path.join(directory, 'baseline');
    const generation = builder.build({
      root: directory,
      output: baseline,
      all: true,
      candidateArticles: [ARTICLE],
      cacheFile: path.join(directory, 'baseline-cache.json'),
    });
    const baselineLock = baseline + '.output-lock.json';
    const expectedBaselineLockSha256 = builder.sha(fs.readFileSync(baselineLock));
    const catalogFile = 'site/content/catalog.json';
    const catalog = JSON.parse(fs.readFileSync(path.join(directory, catalogFile)));
    const recordId = Object.keys(catalog.records).find(
      (id) =>
        !catalog.featured.includes(id) && catalog.records[id].edition?.url?.startsWith('https:')
    );
    assert.ok(recordId, 'fixture requires one existing external record');
    catalog.records[recordId].edition.url += '-synthetic-content-check';
    json(directory, catalogFile, catalog);
    publication(directory, true);
    const events = JSON.parse(fs.readFileSync(path.join(directory, 'site/content/events.json')));
    const added = structuredClone(events.groups[1].events[0]);
    added.id = 'synthetic-event-' + events.groups[1].events.length;
    added.anchor = added.id;
    added.title = 'Synthetic event fixture ' + added.id;
    events.groups[1].events.push(added);
    events.groups[0].events[0].description += ' Synthetic event edit fixture.';
    json(directory, 'site/content/events.json', events);
    const output = path.join(directory, 'current');
    const result = contentRelease.release({
      root: directory,
      baseline,
      baselineLock,
      expectedBaselineLockSha256,
      output,
      candidateArticles: [ARTICLE],
    });
    assert.deepEqual(result.report.builtRoutes, ['writing', 'talks']);
    assert.deepEqual(result.report.builtArticles, [KEY]);
    assert.deepEqual(result.report.reusedRoutes, ['index', 'research', 'credits']);
    assert.equal(result.report.engine, builder.runtimeVersion(generation.components));
    const manifest = {
      schema: 1,
      sourceDirty: true,
      syntheticFixture: true,
      ...artifact.manifest(output),
      contentRelease: result.report,
    };
    manifest.components = require('../site/snapshot.cjs').verify(output, manifest);
    return { directory, output, manifest, changedRecord: recordId };
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}

async function main({ reportFile = process.argv[2] } = {}) {
  assert.ok(reportFile, 'content fixture requires an explicit report destination');
  const fixture = prepare();
  const { server, url } = await require('./serve.cjs').start({
    publicDir: fixture.output,
    localOnly: true,
  });
  const source = (ref) =>
    cp.execFileSync('git', ['rev-parse', ref], { cwd: root, encoding: 'utf8' }).trim();
  const report = {
    schema: 1,
    kind: 'content-release-fixture',
    syntheticFixture: true,
    pass: false,
    parentSourceCommit: source('HEAD'),
    parentSourceTree: source('HEAD^{tree}'),
    parentSourceDirty:
      cp.execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim() !==
      '',
    environment: environment(),
    target: url,
    fixtureArtifactDigest: fixture.manifest.artifactDigest,
    fixtureSourceDirty: true,
    changedRecord: fixture.changedRecord,
    contentRelease: fixture.manifest.contentRelease,
    fullGate: false,
    productionEligible: false,
    deploymentAuthorized: false,
  };
  let browser;
  try {
    browser = await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
    report.browser = browser.version();
    report.content = await require('./local-browser.cjs').contentJourney(
      browser,
      url,
      fixture.manifest
    );
    assert.equal(report.content.writing.length, 2);
    assert.equal(report.content.articles.length, 1);
    assert.equal(report.content.articles[0].observations.length, 5);
    report.contentDocuments = await require('./content-browser.cjs').observe(
      browser,
      url,
      fixture.manifest
    );
    require('./content-gate.cjs').validateDocuments(report.contentDocuments, fixture.manifest);
    assert.equal(report.contentDocuments.media.length >= 1, true);
    const file = report.contentDocuments.media.find((row) =>
      row.file.endsWith('/fixture.png')
    ).file;
    const corrupt = fs.readFileSync(path.join(fixture.output, file)).subarray(0, 33);
    const brokenDirectory = path.join(fixture.directory, 'corrupt-media');
    fs.cpSync(fixture.output, brokenDirectory, { recursive: true });
    fs.writeFileSync(path.join(brokenDirectory, file), corrupt);
    const broken = await require('./serve.cjs').start({
      publicDir: brokenDirectory,
      localOnly: true,
    });
    try {
      const manifest = structuredClone(fixture.manifest);
      manifest.files[file].sha256 = builder.sha(corrupt);
      const media = await require('./content-browser.cjs').observeMedia(
        browser,
        broken.url,
        manifest
      );
      const observed = media.find((row) => row.file === file);
      assert.equal(observed.status, 200);
      assert.equal(observed.sha256, builder.sha(corrupt));
      assert.equal(observed.pass, false, 'valid MIME/signature/hash cannot replace actual decode');
      report.corruptMedia = {
        file,
        status: observed.status,
        digestVerified: true,
        decodeRejected: true,
      };
    } finally {
      await new Promise((resolve) => broken.server.close(resolve));
    }
    report.pass = true;
    return report;
  } catch (error) {
    report.error = error.message;
    if (error.articleObservations) report.articleObservations = error.articleObservations;
    throw error;
  } finally {
    fs.mkdirSync(path.dirname(path.resolve(reportFile)), { recursive: true });
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(fixture.directory, { recursive: true, force: true });
  }
}

if (require.main === module)
  main().catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = { ARTICLE, KEY, publication, prepare, main };
