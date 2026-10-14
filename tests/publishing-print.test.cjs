'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { execFileSync, spawnSync } = require('node:child_process');
const { fileURLToPath, pathToFileURL } = require('node:url');
const { captureResources, sha256 } = require('../tools/publishing/print-resource.cjs');

const modulePath = pathToFileURL(path.resolve(__dirname, '../tools/publishing/print.mjs'));
const printModule = import(modulePath.href);

function fixturePdf(label) {
  return Buffer.from(
    '%PDF-1.7\n1 0 obj\n<< /Type /Page >>\nendobj\n' + label + '\n' + ' '.repeat(1100) + '\n%%EOF\n'
  );
}

function fixtureProducer(label = 'first') {
  return async ({ htmlUrl, resourcePolicy }) => {
    assert.match(resourcePolicy.resolveRequest(htmlUrl).body.toString(), /Print fixture/);
    return {
      pdf: fixturePdf(label),
      browser: {
        name: 'transaction-fixture',
        version: 'unit-test',
        revision: null,
        executableSha256: null,
      },
      toolchain: { playwrightVersion: null, lockSha256: null },
    };
  };
}

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'publishing-print-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const kit = path.join(root, 'kit');
  await fs.mkdir(kit);
  const htmlPath = path.join(kit, 'print.html');
  const cssPath = path.join(kit, 'article-print.css');
  const sourcePath = path.join(root, 'source.md');
  const css = Buffer.from('body { color: #171717; }\n');
  const source = Buffer.from('# Print fixture\n\nA source with stable identity.\n');
  await Promise.all([
    fs.writeFile(
      htmlPath,
      '<!doctype html><html><head><link rel="stylesheet" ' +
        'href="article-print.css"></head><body><h1>Print fixture</h1></body></html>'
    ),
    fs.writeFile(cssPath, css),
    fs.writeFile(sourcePath, source),
  ]);
  const expectedSource = {
    articleId: 'print-fixture',
    editionId: 'en-v1',
    repositoryRoot: root,
    source: {
      path: sourcePath,
      sha256: sha256(source),
      blob: null,
      commit: null,
      state: 'working-tree-review',
    },
    resources: [{ path: 'article-print.css', sha256: sha256(css) }],
  };
  return {
    root,
    kit,
    htmlPath,
    cssPath,
    sourcePath,
    expectedSource,
    outputPath: path.join(root, 'article.pdf'),
  };
}

async function renderFixture(inputs, label = 'first') {
  const { printArticle } = await printModule;
  return printArticle({ ...inputs, resourceRoot: inputs.kit, producer: fixtureProducer(label) });
}

test('print pair binds source, local resources and immutable artifact records', async (t) => {
  const inputs = await fixture(t);
  const { verifyPrintPair } = await printModule;
  const first = await renderFixture(inputs);
  const manifest = await verifyPrintPair(first.outputPath, first.manifestPath);
  assert.equal(manifest.source.sha256, inputs.expectedSource.source.sha256);
  assert.equal(manifest.source.state, 'working-tree-review');
  assert.deepEqual(
    manifest.render.resources.map((entry) => entry.path),
    ['article-print.css', 'print.html']
  );
  assert.equal(manifest.render.browser.name, 'transaction-fixture');
  const immutablePdf = await fs.readFile(path.join(first.artifactPath, 'artifact.pdf'));
  const immutableManifest = await fs.readFile(path.join(first.artifactPath, 'manifest.json'));
  const second = await renderFixture(inputs, 'second');
  assert.equal(second.manifest.contentId, manifest.contentId);
  assert.notEqual(second.manifest.artifactId, manifest.artifactId);
  assert.deepEqual(await fs.readFile(path.join(first.artifactPath, 'artifact.pdf')), immutablePdf);
  assert.deepEqual(
    await fs.readFile(path.join(first.artifactPath, 'manifest.json')),
    immutableManifest
  );
  assert.equal((await verifyPrintPair(inputs.outputPath)).artifactId, second.manifest.artifactId);
});

test('resource interception rejects all undeclared and external requests', async (t) => {
  const inputs = await fixture(t);
  const policy = await captureResources({
    ...inputs,
    resourceRoot: inputs.kit,
    resources: inputs.expectedSource.resources,
  });
  assert.equal(
    policy.resolveRequest('https://article-print.invalid/article-print.css').contentType,
    'text/css; charset=utf-8'
  );
  for (const request of [
    'https://example.org/image.png',
    'http://article-print.invalid/article-print.css',
    'file://' + inputs.sourcePath,
    'data:image/png;base64,aGVsbG8=',
    'https://article-print.invalid/undeclared.png',
    'https://article-print.invalid/%252e%252e/source.md',
    'https://article-print.invalid/%2fsource.md',
    'https://article-print.invalid/article-print.css?remote=1',
  ]) {
    assert.throws(() => policy.resolveRequest(request), /rejected|forbidden|outside/);
  }
  assert.throws(() => policy.resolveRequest(policy.htmlUrl, 'POST'), /method rejected/);
});

test('presentation changes preserve content identity and create another render artifact', async (t) => {
  const inputs = await fixture(t);
  const first = await renderFixture(inputs);
  const changedCss = Buffer.from('body { color: #222; }\n');
  await fs.writeFile(inputs.cssPath, changedCss);
  const expectedSource = {
    ...inputs.expectedSource,
    resources: [{ path: 'article-print.css', sha256: sha256(changedCss) }],
  };
  const second = await renderFixture({ ...inputs, expectedSource });
  assert.equal(second.manifest.contentId, first.manifest.contentId);
  assert.notEqual(second.manifest.artifactId, first.manifest.artifactId);
  assert.notDeepEqual(second.manifest.render.resources, first.manifest.render.resources);
});

test('committed print provenance requires the real repository commit and source blob', async (t) => {
  const inputs = await fixture(t);
  const first = await renderFixture(inputs);
  const oldPdf = await fs.readFile(first.outputPath);
  const oldManifest = await fs.readFile(first.manifestPath);
  const { printArticle } = await printModule;
  let called = false;
  const producer = async (args) => {
    called = true;
    return fixtureProducer()(args);
  };
  const forged = {
    ...inputs.expectedSource,
    source: {
      ...inputs.expectedSource.source,
      state: 'committed',
      commit: '1'.repeat(40),
      blob: '2'.repeat(40),
    },
  };
  await assert.rejects(
    printArticle({ ...inputs, expectedSource: forged, resourceRoot: inputs.kit, producer }),
    /Git provenance check failed/
  );
  assert.equal(called, false);
  assert.deepEqual(await fs.readFile(first.outputPath), oldPdf);
  assert.deepEqual(await fs.readFile(first.manifestPath), oldManifest);
  const git = (args) =>
    execFileSync('git', args, {
      cwd: inputs.root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  git(['init', '--quiet']);
  git(['add', 'source.md']);
  git([
    '-c',
    'user.name=Print Test',
    '-c',
    'user.email=print@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'Pinned print fixture',
  ]);
  const pins = {
    ...inputs.expectedSource.source,
    state: 'committed',
    commit: git(['rev-parse', 'HEAD']),
    blob: git(['rev-parse', 'HEAD:source.md']),
  };
  for (const source of [
    { ...pins, blob: 'f'.repeat(40) },
    { ...pins, commit: 'e'.repeat(40) },
    { ...pins, state: 'working-tree-review' },
  ]) {
    await assert.rejects(
      printArticle({
        ...inputs,
        expectedSource: { ...inputs.expectedSource, source },
        resourceRoot: inputs.kit,
        producer,
      }),
      /blob does not match|Git provenance check failed|provenance state differs/
    );
    assert.equal(called, false);
    assert.deepEqual(await fs.readFile(first.outputPath), oldPdf);
    assert.deepEqual(await fs.readFile(first.manifestPath), oldManifest);
  }
  const valid = await printArticle({
    ...inputs,
    expectedSource: { ...inputs.expectedSource, source: pins },
    resourceRoot: inputs.kit,
    producer,
  });
  assert.equal(called, true);
  assert.equal(valid.manifest.source.commit, pins.commit);
  assert.equal(valid.manifest.source.blob, pins.blob);
  assert.equal(valid.manifest.source.state, 'committed');
});

test('resource byte, count and aggregate limits reject before production and preserve the pair', async (t) => {
  const inputs = await fixture(t);
  const first = await renderFixture(inputs);
  const oldPdf = await fs.readFile(first.outputPath);
  const oldManifest = await fs.readFile(first.manifestPath);
  const { printArticle } = await printModule;
  let called = false;
  const producer = async (args) => {
    called = true;
    return fixtureProducer()(args);
  };
  const originalCss = await fs.readFile(inputs.cssPath);
  const tooLargeCss = Buffer.alloc(1_000_001, 32);
  await fs.writeFile(inputs.cssPath, tooLargeCss);
  await assert.rejects(
    printArticle({
      ...inputs,
      resourceRoot: inputs.kit,
      producer,
      expectedSource: {
        ...inputs.expectedSource,
        resources: [{ path: 'article-print.css', sha256: sha256(tooLargeCss) }],
      },
    }),
    /byte limit/
  );
  await fs.writeFile(inputs.cssPath, originalCss);
  const tooLargeHtml = Buffer.alloc(1_000_001, 32);
  const originalHtml = await fs.readFile(inputs.htmlPath);
  await fs.writeFile(inputs.htmlPath, tooLargeHtml);
  await assert.rejects(
    printArticle({ ...inputs, resourceRoot: inputs.kit, producer }),
    /byte limit/
  );
  await fs.writeFile(inputs.htmlPath, originalHtml);
  const tooLargeImage = Buffer.alloc(5_000_001, 0);
  await fs.writeFile(path.join(inputs.kit, 'oversized.png'), tooLargeImage);
  await assert.rejects(
    printArticle({
      ...inputs,
      resourceRoot: inputs.kit,
      producer,
      expectedSource: {
        ...inputs.expectedSource,
        resources: [{ path: 'oversized.png', sha256: sha256(tooLargeImage) }],
      },
    }),
    /byte limit/
  );
  await assert.rejects(
    printArticle({
      ...inputs,
      resourceRoot: inputs.kit,
      producer,
      expectedSource: {
        ...inputs.expectedSource,
        resources: Array.from({ length: 65 }, (_, index) => ({
          path: 'image-' + index + '.png',
          sha256: '0'.repeat(64),
        })),
      },
    }),
    /resource count/
  );
  const imageBytes = Buffer.alloc(3_000_000, 0);
  const resources = [];
  for (let index = 0; index < 6; index += 1) {
    const relative = 'aggregate-' + index + '.png';
    await fs.writeFile(path.join(inputs.kit, relative), imageBytes);
    resources.push({ path: relative, sha256: sha256(imageBytes) });
  }
  await assert.rejects(
    printArticle({
      ...inputs,
      resourceRoot: inputs.kit,
      producer,
      expectedSource: { ...inputs.expectedSource, resources },
    }),
    /aggregate byte limit/
  );
  assert.equal(called, false);
  assert.deepEqual(await fs.readFile(first.outputPath), oldPdf);
  assert.deepEqual(await fs.readFile(first.manifestPath), oldManifest);
});

test('declared local resources reject traversal, symbolic links and hardlinks', async (t) => {
  const inputs = await fixture(t);
  const outside = path.join(inputs.root, 'outside.css');
  await fs.writeFile(outside, 'body {}');
  const symlink = path.join(inputs.kit, 'symbolic.css');
  const hardlink = path.join(inputs.kit, 'hard.css');
  await fs.symlink(outside, symlink);
  await fs.link(outside, hardlink);
  for (const resource of ['../outside.css', symlink, hardlink]) {
    await assert.rejects(
      captureResources({
        ...inputs,
        resourceRoot: inputs.kit,
        resources: [{ path: resource, sha256: sha256('body {}') }],
      }),
      /traversal|symbolic link|hardlink/
    );
  }
  const linkedRoot = path.join(inputs.root, 'linked-kit');
  await fs.symlink(inputs.kit, linkedRoot);
  await assert.rejects(
    captureResources({
      htmlPath: path.join(linkedRoot, 'print.html'),
      resourceRoot: linkedRoot,
      resources: inputs.expectedSource.resources,
    }),
    /symbolic link/
  );
});

test('resource rejection preserves the current valid print pair', async (t) => {
  const inputs = await fixture(t);
  const first = await renderFixture(inputs);
  const oldPdf = await fs.readFile(first.outputPath);
  const oldManifest = await fs.readFile(first.manifestPath);
  const { printArticle } = await printModule;
  await assert.rejects(
    printArticle({
      ...inputs,
      resourceRoot: inputs.kit,
      producer: async ({ resourcePolicy }) => {
        resourcePolicy.resolveRequest('https://example.org/rejected.png');
        return fixtureProducer()();
      },
    }),
    /resource rejected/
  );
  assert.deepEqual(await fs.readFile(first.outputPath), oldPdf);
  assert.deepEqual(await fs.readFile(first.manifestPath), oldManifest);
});

test('source and resource changes during production cannot replace the current pair', async (t) => {
  const inputs = await fixture(t);
  const first = await renderFixture(inputs);
  const oldPdf = await fs.readFile(first.outputPath);
  const { printArticle } = await printModule;
  for (const changedPath of [inputs.cssPath, inputs.sourcePath]) {
    const original = await fs.readFile(changedPath);
    await assert.rejects(
      printArticle({
        ...inputs,
        resourceRoot: inputs.kit,
        producer: async (args) => {
          await fs.appendFile(changedPath, '\nchanged');
          return fixtureProducer('changed')(args);
        },
      }),
      /changed during rendering/
    );
    await fs.writeFile(changedPath, original);
    assert.deepEqual(await fs.readFile(first.outputPath), oldPdf);
  }
});

test('output aliases, symbolic links and hardlinks are rejected before production', async (t) => {
  const inputs = await fixture(t);
  const { printArticle } = await printModule;
  let called = false;
  const producer = async () => {
    called = true;
    return fixtureProducer()();
  };
  const sourcePdf = path.join(inputs.root, 'source.pdf');
  await fs.rename(inputs.sourcePath, sourcePdf);
  const expectedSource = {
    ...inputs.expectedSource,
    source: { ...inputs.expectedSource.source, path: sourcePdf },
  };
  await assert.rejects(
    printArticle({
      ...inputs,
      expectedSource,
      outputPath: sourcePdf,
      resourceRoot: inputs.kit,
      producer,
    }),
    /aliases/
  );
  const linkOutput = path.join(inputs.root, 'linked.pdf');
  await fs.symlink(sourcePdf, linkOutput);
  await assert.rejects(
    printArticle({
      ...inputs,
      expectedSource,
      outputPath: linkOutput,
      resourceRoot: inputs.kit,
      producer,
    }),
    /symbolic link/
  );
  const hardOutput = path.join(inputs.root, 'hard.pdf');
  await fs.link(sourcePdf, hardOutput);
  await assert.rejects(
    printArticle({
      ...inputs,
      expectedSource,
      outputPath: hardOutput,
      resourceRoot: inputs.kit,
      producer,
    }),
    /hardlink/
  );
  assert.equal(called, false);
});

test('rename failure rolls both files back to the prior valid pair', async (t) => {
  const inputs = await fixture(t);
  const first = await renderFixture(inputs);
  const oldPdf = await fs.readFile(first.outputPath);
  const oldManifest = await fs.readFile(first.manifestPath);
  const candidate = await renderFixture(
    { ...inputs, outputPath: path.join(inputs.root, 'next.pdf') },
    'candidate'
  );
  const { finalizePrintPair, verifyPrintPair } = await printModule;
  let failed = false;
  await assert.rejects(
    finalizePrintPair(candidate.outputPath, candidate.manifestPath, first.outputPath, {
      renameImpl: async (from, to) => {
        if (!failed && from === candidate.manifestPath) {
          failed = true;
          throw new Error('Injected manifest rename failure');
        }
        await fs.rename(from, to);
      },
    }),
    /Injected manifest rename failure/
  );
  assert.deepEqual(await fs.readFile(first.outputPath), oldPdf);
  assert.deepEqual(await fs.readFile(first.manifestPath), oldManifest);
  assert.equal((await verifyPrintPair(first.outputPath)).artifactId, first.manifest.artifactId);
  await assert.rejects(fs.stat(first.outputPath + '.transaction'), { code: 'ENOENT' });
});

test('incomplete rollback retains its journal and can recover the old pair', async (t) => {
  const inputs = await fixture(t);
  const first = await renderFixture(inputs);
  const oldPdf = await fs.readFile(first.outputPath);
  const oldManifest = await fs.readFile(first.manifestPath);
  const candidate = await renderFixture(
    { ...inputs, outputPath: path.join(inputs.root, 'next.pdf') },
    'candidate'
  );
  const { finalizePrintPair, recoverPrint, verifyPrintPair } = await printModule;
  await assert.rejects(
    finalizePrintPair(candidate.outputPath, candidate.manifestPath, first.outputPath, {
      renameImpl: async (from, to) => {
        if (from === candidate.manifestPath || from.endsWith('previous.pdf')) {
          throw new Error('Injected rename failure');
        }
        await fs.rename(from, to);
      },
    }),
    (error) => {
      assert.match(error.message, /rollback incomplete; recovery retained/);
      assert.deepEqual(error.recoveryPaths, [first.outputPath + '.transaction']);
      return true;
    }
  );
  assert.equal((await fs.stat(first.outputPath + '.transaction/journal.json')).isFile(), true);
  await assert.rejects(renderFixture(inputs), /requires explicit recoverPrint/);
  assert.deepEqual(await recoverPrint(first.outputPath), { recovered: true, action: 'rollback' });
  assert.deepEqual(await fs.readFile(first.outputPath), oldPdf);
  assert.deepEqual(await fs.readFile(first.manifestPath), oldManifest);
  assert.equal((await verifyPrintPair(first.outputPath)).artifactId, first.manifest.artifactId);
});

test('failed first installation removes its partial pair', async (t) => {
  const inputs = await fixture(t);
  const candidate = await renderFixture(
    { ...inputs, outputPath: path.join(inputs.root, 'next.pdf') },
    'candidate'
  );
  const { finalizePrintPair } = await printModule;
  await assert.rejects(
    finalizePrintPair(candidate.outputPath, candidate.manifestPath, inputs.outputPath, {
      renameImpl: async (from, to) => {
        if (from === candidate.manifestPath) {
          throw new Error('Injected first installation failure');
        }
        await fs.rename(from, to);
      },
    }),
    /Injected first installation failure/
  );
  for (const target of [
    inputs.outputPath,
    inputs.outputPath.replace('.pdf', '.manifest.json'),
    inputs.outputPath + '.transaction',
  ]) {
    await assert.rejects(fs.stat(target), { code: 'ENOENT' });
  }
});

test('an orphaned or corrupt existing pair is never replaced', async (t) => {
  const inputs = await fixture(t);
  const { printArticle } = await printModule;
  await fs.writeFile(inputs.outputPath, fixturePdf('orphan'));
  await assert.rejects(renderFixture(inputs), /pair is incomplete/);
  await fs.rm(inputs.outputPath);
  const first = await renderFixture(inputs);
  await fs.appendFile(first.outputPath, 'corrupt');
  let called = false;
  await assert.rejects(
    printArticle({
      ...inputs,
      resourceRoot: inputs.kit,
      producer: async () => {
        called = true;
      },
    }),
    /identity mismatch/
  );
  assert.equal(called, false);
});

test('print CLI accepts a declared kit and rejects ambiguous options', async () => {
  const { parseArgs } = await printModule;
  assert.deepEqual(
    parseArgs(['--html', '/kit/print.html', '--output', '/out/article.pdf', '--resources', '/kit']),
    {
      htmlPath: '/kit/print.html',
      outputPath: '/out/article.pdf',
      resourceRoot: '/kit',
      sourceManifest: '/kit/print.html.source.json',
    }
  );
  for (const args of [[], ['--html'], ['--network'], ['--html', '/kit/a', '--html', '/kit/b']]) {
    assert.throws(() => parseArgs(args), /requires|argument/);
  }
});

test('relative CLI kit paths reach the named missing managed browser failure without partial output', async (t) => {
  const inputs = await fixture(t);
  await fs.writeFile(inputs.htmlPath + '.source.json', JSON.stringify(inputs.expectedSource));
  const emptyBrowserCache = path.join(inputs.root, 'empty-browser-cache');
  await fs.mkdir(emptyBrowserCache);
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(modulePath),
      '--html',
      'kit/print.html',
      '--output',
      'article.pdf',
      '--resources',
      'kit',
    ],
    {
      cwd: inputs.root,
      encoding: 'utf8',
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: emptyBrowserCache },
      timeout: 30_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Locked publishing Chromium is unavailable/);
  assert.match(result.stderr, /empty-browser-cache/);
  assert.doesNotMatch(result.stderr, /kit\/kit/);
  for (const target of [
    inputs.outputPath,
    inputs.outputPath.replace('.pdf', '.manifest.json'),
    inputs.outputPath + '.artifacts',
    inputs.outputPath + '.transaction',
  ]) {
    await assert.rejects(fs.stat(target), { code: 'ENOENT' });
  }
});

function managedEvidenceFixture() {
  const expected = {
    articleId: 'print-fixture',
    editionId: 'review-edition',
    selection: 'draft',
    repositoryRoot: '/repository',
    source: {
      path: 'site/publications/print-fixture/manuscript.en.md',
      sha256: '1'.repeat(64),
      commit: null,
      blob: null,
      state: 'working-tree-review',
    },
    browser: {
      version: '153.0.8010.0',
      revision: '1234',
      executableSha256: '2'.repeat(64),
    },
    toolchain: { playwrightVersion: '1.63.0', lockSha256: '3'.repeat(64) },
  };
  const kit = {
    kind: 'article-render-artifact',
    articleId: expected.articleId,
    contentEdition: expected.editionId,
    selection: 'draft',
    source: { ...expected.source },
    producer: { dependencyLockSha256: expected.toolchain.lockSha256 },
    artifactId: '4'.repeat(64),
  };
  const printed = {
    kind: 'article-pdf',
    articleId: expected.articleId,
    editionId: expected.editionId,
    repositoryRoot: expected.repositoryRoot,
    source: {
      ...expected.source,
      path: path.resolve(expected.repositoryRoot, expected.source.path),
    },
    render: {
      browser: {
        name: 'chromium',
        ...expected.browser,
        managedBrowser: true,
        reviewOnly: false,
      },
      toolchain: { ...expected.toolchain },
    },
    pdf: { bytes: 2048, pages: 1, sha256: '5'.repeat(64) },
    artifactId: '6'.repeat(64),
  };
  return { kit, printed, expected };
}

test('managed evidence binds the exact toolchain while preserving an unfrozen draft identity', () => {
  const { validateEvidence } = require('../tools/quality/article-print.cjs');
  const { kit, printed, expected } = managedEvidenceFixture();
  const result = validateEvidence(kit, printed, expected);
  assert.equal(result.selection, 'draft');
  assert.deepEqual(result.source, expected.source);
  assert.equal(result.source.state, 'working-tree-review');
  assert.equal(result.source.commit, null);
  assert.equal(result.source.blob, null);
  assert.equal(result.browser.managedBrowser, true);
  assert.equal(result.pdf.sha256, printed.pdf.sha256);
});

test('managed evidence rejects alternate browsers and mismatched binary, lock, edition and source', async (t) => {
  const { validateEvidence } = require('../tools/quality/article-print.cjs');
  for (const [name, mutate, message] of [
    ['unmanaged', ({ printed }) => (printed.render.browser.managedBrowser = false), /managed/],
    ['review-only', ({ printed }) => (printed.render.browser.reviewOnly = true), /review/],
    ['wrong browser', ({ printed }) => (printed.render.browser.name = 'firefox'), /Chromium/],
    [
      'alternate package',
      ({ printed }) => (printed.render.browser.package = { name: '@sparticuz/chromium' }),
      /alternate/,
    ],
    ['wrong version', ({ printed }) => (printed.render.browser.version = '152.0.0.0'), /version/],
    ['missing revision', ({ printed }) => (printed.render.browser.revision = null), /revision/],
    [
      'changed executable',
      ({ printed }) => (printed.render.browser.executableSha256 = 'f'.repeat(64)),
      /executableSha256/,
    ],
    [
      'wrong Playwright',
      ({ printed }) => (printed.render.toolchain.playwrightVersion = '1.62.0'),
      /toolchain/,
    ],
    [
      'wrong PDF lock',
      ({ printed }) => (printed.render.toolchain.lockSha256 = 'f'.repeat(64)),
      /toolchain/,
    ],
    [
      'wrong kit lock',
      ({ kit }) => (kit.producer.dependencyLockSha256 = 'f'.repeat(64)),
      /toolchain/,
    ],
    ['wrong PDF source', ({ printed }) => (printed.source.sha256 = 'f'.repeat(64)), /source/],
    ['wrong kit source', ({ kit }) => (kit.source.sha256 = 'f'.repeat(64)), /source/],
    ['wrong edition', ({ printed }) => (printed.editionId = 'another-edition'), /edition/],
    ['forged source pin', ({ printed }) => (printed.source.commit = 'f'.repeat(40)), /source/],
    ['accepted draft', ({ kit }) => (kit.selection = 'accepted'), /publication status/],
  ]) {
    await t.test(name, () => {
      const candidate = managedEvidenceFixture();
      mutate(candidate);
      assert.throws(
        () => validateEvidence(candidate.kit, candidate.printed, candidate.expected),
        message
      );
    });
  }
});
