'use strict';
// Explicit managed-browser proof for Refs #5; article acceptance stays separate.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { loadArticle } = require('../publishing/article.cjs');
const { verifyKit } = require('../publishing/kit.cjs');
const { hashRegularFile, sha256 } = require('../publishing/print-resource.cjs');
const root = path.resolve(__dirname, '../..');

function validateEvidence(kit, printed, expected) {
  assert.equal(kit.kind, 'article-render-artifact', 'complete article render kit');
  assert.equal(printed.kind, 'article-pdf', 'article PDF manifest');
  assert.equal(kit.articleId, expected.articleId, 'kit article identity');
  assert.equal(printed.articleId, expected.articleId, 'PDF article identity');
  assert.equal(kit.contentEdition, expected.editionId, 'kit edition identity');
  assert.equal(printed.editionId, expected.editionId, 'PDF edition identity');
  assert.equal(kit.selection, expected.selection, 'authored publication status');
  assert.match(expected.source.sha256, /^[a-f0-9]{64}$/, 'source SHA-256');
  assert.deepEqual(kit.source, expected.source, 'kit source identity');
  assert.equal(printed.repositoryRoot, expected.repositoryRoot, 'PDF repository identity');
  assert.deepEqual(
    printed.source,
    { ...expected.source, path: path.resolve(expected.repositoryRoot, expected.source.path) },
    'PDF source identity'
  );
  const browser = printed.render?.browser;
  assert.equal(browser?.name, 'chromium', 'managed Chromium name');
  assert.equal(browser.managedBrowser, true, 'managed Chromium required');
  assert.equal(browser.reviewOnly, false, 'review browser cannot supply managed evidence');
  assert.equal(Object.hasOwn(browser, 'package'), false, 'alternate browser package rejected');
  assert.match(expected.browser.version, /^\d+\.\d+\.\d+\.\d+$/, 'locked Chromium version');
  assert.match(expected.browser.revision, /^\d+$/, 'locked Chromium revision');
  assert.match(expected.browser.executableSha256, /^[a-f0-9]{64}$/, 'browser SHA-256');
  for (const key of ['version', 'revision', 'executableSha256']) {
    assert.equal(browser[key], expected.browser[key], 'managed Chromium ' + key);
  }
  assert.match(expected.toolchain.playwrightVersion, /^\d+\.\d+\.\d+$/, 'locked Playwright');
  assert.match(expected.toolchain.lockSha256, /^[a-f0-9]{64}$/, 'dependency lock SHA-256');
  assert.deepEqual(printed.render.toolchain, expected.toolchain, 'PDF locked toolchain');
  assert.equal(
    kit.producer.dependencyLockSha256,
    expected.toolchain.lockSha256,
    'kit locked toolchain'
  );
  assert.ok(Number.isSafeInteger(printed.pdf?.pages) && printed.pdf.pages > 0, 'PDF pages');
  return {
    articleId: expected.articleId,
    contentEdition: expected.editionId,
    selection: kit.selection,
    source: kit.source,
    browser,
    toolchain: printed.render.toolchain,
    pdf: printed.pdf,
    kitArtifactId: kit.artifactId,
    pdfArtifactId: printed.artifactId,
  };
}

function checkout() {
  const git = (args) =>
    execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      timeout: 10_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  return {
    commit: git(['rev-parse', 'HEAD']),
    tree: git(['rev-parse', 'HEAD^{tree}']),
    dirty: git(['status', '--porcelain', '--untracked-files=all']) !== '',
  };
}

async function expectedEvidence(articleId) {
  const article = loadArticle(root, articleId);
  const toolchain = path.join(root, 'tools/publishing/toolchain');
  const metadata = require(path.join(toolchain, 'package.json'));
  const lockBytes = await fs.readFile(path.join(toolchain, 'package-lock.json'));
  const lock = JSON.parse(lockBytes);
  const installed = require(path.join(toolchain, 'node_modules/playwright/package.json'));
  const playwrightVersion = metadata.dependencies.playwright;
  assert.equal(installed.version, playwrightVersion, 'installed publishing Playwright');
  assert.equal(
    lock.packages['node_modules/playwright'].version,
    playwrightVersion,
    'locked publishing Playwright'
  );
  const playwright = require(path.join(toolchain, 'node_modules/playwright'));
  const browsers = require(path.join(toolchain, 'node_modules/playwright-core/browsers.json'));
  const chromium = browsers.browsers.find((entry) => entry.name === 'chromium');
  assert.ok(chromium, 'publishing Chromium definition');
  const executable = await hashRegularFile(playwright.chromium.executablePath(), {
    maxBytes: 512_000_000,
  });
  return {
    articleId,
    editionId: article.edition.id,
    selection: article.metadata.status,
    repositoryRoot: root,
    source: article.source,
    browser: {
      version: chromium.browserVersion,
      revision: chromium.revision,
      executableSha256: executable.sha256,
    },
    toolchain: { playwrightVersion, lockSha256: sha256(lockBytes) },
  };
}

async function main(articleId, outputDirectory) {
  assert.match(articleId || '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'explicit article ID');
  assert.ok(outputDirectory, 'explicit evidence output directory');
  const output = path.resolve(outputDirectory);
  const report = {
    schema: 1,
    kind: 'managed-article-pdf',
    issue: 'Refs #5',
    pass: false,
    articleId,
    generatedAt: new Date().toISOString(),
    run: {
      id: process.env.GITHUB_RUN_ID || null,
      attempt: process.env.GITHUB_RUN_ATTEMPT || null,
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
    },
  };
  await fs.mkdir(output, { recursive: true });
  try {
    report.before = checkout();
    assert.equal(report.before.dirty, false, 'managed PDF requires a clean checkout');
    if (process.env.SITE_CANDIDATE_SHA) {
      assert.match(process.env.SITE_CANDIDATE_SHA, /^[a-f0-9]{40}$/, 'exact candidate SHA');
      assert.equal(report.before.commit, process.env.SITE_CANDIDATE_SHA, 'candidate checkout');
    }
    const command = ['tools/publishing/cli.cjs', 'render', articleId, '--pdf'];
    report.command = [process.execPath, ...command];
    const directory = execFileSync(process.execPath, command, {
      cwd: root,
      encoding: 'utf8',
      timeout: 120_000,
      maxBuffer: 1_000_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    const { verifyPrintPair } = await import('../publishing/print.mjs');
    const kit = await verifyKit(directory);
    const printed = await verifyPrintPair(path.join(directory, 'article.pdf'));
    Object.assign(report, validateEvidence(kit, printed, await expectedEvidence(articleId)));
    for (const [source, destination] of [
      ['article.pdf', 'article.pdf'],
      ['article.manifest.json', 'article.manifest.json'],
      ['manifest.json', 'kit.manifest.json'],
    ]) {
      await fs.copyFile(path.join(directory, source), path.join(output, destination));
    }
    await verifyPrintPair(path.join(output, 'article.pdf'));
    report.kitDirectory = directory;
    report.after = checkout();
    assert.deepEqual(report.after, report.before, 'managed PDF preserves clean source identity');
    report.pass = true;
    return report;
  } catch (error) {
    report.error = error.message;
    if (error.stderr) report.stderr = String(error.stderr).slice(-16_000);
    throw error;
  } finally {
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
}

if (require.main === module) {
  const [articleId, outputDirectory, ...extra] = process.argv.slice(2);
  Promise.resolve()
    .then(() => {
      assert.equal(extra.length, 0, 'Usage: article-print.cjs <article-id> <output-dir>');
      return main(articleId, outputDirectory);
    })
    .then((report) => process.stdout.write(JSON.stringify(report, null, 2) + '\n'))
    .catch((error) => {
      process.stderr.write('Managed article PDF: ' + error.message + '\n');
      process.exitCode = 1;
    });
}

module.exports = { validateEvidence, main };
