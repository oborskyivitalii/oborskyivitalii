#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import resources from './print-resource.cjs';
import provenance from './provenance.cjs';

const {
  assertSafePath,
  captureResources,
  hashRegularFile,
  infoIfExists,
  printOrigin,
  readRegularFile,
  sha256,
} = resources;
const require = createRequire(import.meta.url);
const toolchainRoot = fileURLToPath(new URL('./toolchain/', import.meta.url));
const producerPath = fileURLToPath(import.meta.url);
const digestPattern = /^[a-f0-9]{64}$/;
const commitPattern = /^[a-f0-9]{40}$/;
const { verifySource } = provenance;

export function manifestPathFor(outputPath) {
  if (path.extname(outputPath).toLowerCase() !== '.pdf') {
    throw new Error('Print output must have a .pdf extension');
  }
  return outputPath.replace(/\.pdf$/i, '.manifest.json');
}

function transactionPathFor(outputPath) {
  return outputPath + '.transaction';
}

function recoveryError(message, directory, cause) {
  const error = new Error(message, { cause });
  error.recoveryPaths = [directory];
  return error;
}

async function assertNoPendingTransaction(outputPath) {
  const directory = transactionPathFor(outputPath);
  if (await infoIfExists(directory)) {
    throw recoveryError(
      'Pending print transaction requires explicit recoverPrint: ' + directory,
      directory
    );
  }
}

async function writeDurably(candidate, bytes) {
  const handle = await fs.open(candidate, 'wx');
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function writeJournal(directory, journal) {
  const candidate = path.join(directory, 'journal.next.json');
  await fs.rm(candidate, { force: true });
  await writeDurably(candidate, JSON.stringify(journal, null, 2) + '\n');
  await fs.rename(candidate, path.join(directory, 'journal.json'));
}

function sourceIdentity(expectedSource) {
  if (
    !expectedSource ||
    typeof expectedSource.articleId !== 'string' ||
    !expectedSource.articleId ||
    typeof expectedSource.editionId !== 'string' ||
    !expectedSource.editionId
  ) {
    throw new Error('Print source requires article and edition identities');
  }
  if (
    typeof expectedSource.repositoryRoot !== 'string' ||
    !path.isAbsolute(expectedSource.repositoryRoot)
  ) {
    throw new Error('Print provenance requires an explicit absolute repositoryRoot');
  }
  const source = expectedSource.source;
  if (
    !source ||
    typeof source.path !== 'string' ||
    !source.path ||
    !digestPattern.test(source.sha256) ||
    !['working-tree-review', 'committed'].includes(source.state)
  ) {
    throw new Error('Print source requires its path, SHA-256 and provenance state');
  }
  for (const key of ['blob', 'commit']) {
    if (source[key] !== null && !commitPattern.test(source[key])) {
      throw new Error('Print source ' + key + ' must be null or an exact Git identity');
    }
  }
  if (source.state === 'committed' && (!source.blob || !source.commit)) {
    throw new Error('Committed print source requires both commit and blob identities');
  }
  const repositoryRoot = path.resolve(expectedSource.repositoryRoot);
  const absolute = path.resolve(source.path);
  const relative = path.relative(repositoryRoot, absolute).split(path.sep).join('/');
  const verified = verifySource(repositoryRoot, relative, source);
  if (
    verified.state !== source.state ||
    verified.sha256 !== source.sha256 ||
    verified.blob !== source.blob ||
    verified.commit !== source.commit
  ) {
    throw new Error('Print source provenance state differs from verified source identity');
  }
  return Object.freeze({
    articleId: expectedSource.articleId,
    editionId: expectedSource.editionId,
    repositoryRoot,
    source: Object.freeze({ ...source, path: absolute }),
  });
}

async function assertOutputTargets(outputPath, protectedPaths) {
  const outputManifest = manifestPathFor(outputPath);
  const targets = [
    outputPath,
    outputManifest,
    transactionPathFor(outputPath),
    outputPath + '.artifacts',
  ];
  for (const target of targets) {
    await assertSafePath(target, { allowMissing: true });
    if (protectedPaths.includes(target)) {
      throw new Error('Print output aliases a declared input: ' + target);
    }
    const info = await infoIfExists(target);
    if (info && (target === outputPath || target === outputManifest) && !info.isFile()) {
      throw new Error('Print output must be a regular file: ' + target);
    }
  }
}

function assertPdf(bytes) {
  if (
    !Buffer.isBuffer(bytes) ||
    bytes.length > 32_000_000 ||
    bytes.length < 1024 ||
    bytes.subarray(0, 5).toString('ascii') !== '%PDF-' ||
    !bytes.toString('latin1').includes('%%EOF')
  ) {
    throw new Error('Print producer did not return a usable PDF');
  }
  const pages = bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length ?? 0;
  if (pages < 1) {
    throw new Error('Print PDF has no identifiable pages');
  }
  return pages;
}

export async function verifyPrintPair(pdfPath, manifestPath = manifestPathFor(pdfPath)) {
  const [pdf, manifestFile] = await Promise.all([
    readRegularFile(pdfPath),
    readRegularFile(manifestPath),
  ]);
  const manifest = JSON.parse(manifestFile.bytes.toString('utf8'));
  if (
    manifest.kind !== 'article-pdf' ||
    manifest.schema !== 1 ||
    manifest.pdf?.sha256 !== pdf.sha256 ||
    manifest.pdf?.bytes !== pdf.bytes.length ||
    manifest.pdf?.pages !== assertPdf(pdf.bytes)
  ) {
    throw new Error('Print PDF and manifest identity mismatch');
  }
  const { artifactId, ...record } = manifest;
  if (!digestPattern.test(artifactId) || artifactId !== sha256(JSON.stringify(record))) {
    throw new Error('Print artifact record identity mismatch');
  }
  return manifest;
}

async function pairState(outputPath) {
  const manifestPath = manifestPathFor(outputPath);
  const [pdfInfo, manifestInfo] = await Promise.all([
    infoIfExists(outputPath),
    infoIfExists(manifestPath),
  ]);
  if (Boolean(pdfInfo) !== Boolean(manifestInfo)) {
    throw new Error('Existing print pair is incomplete; refusing to replace it');
  }
  if (!pdfInfo) {
    return null;
  }
  await verifyPrintPair(outputPath, manifestPath);
  return {
    pdf: (await readRegularFile(outputPath)).sha256,
    manifest: (await readRegularFile(manifestPath)).sha256,
  };
}

async function restoreFile(backup, target, previousHash, candidateHash, renameImpl) {
  if (await infoIfExists(backup)) {
    const backupFile = await readRegularFile(backup);
    if (backupFile.sha256 !== previousHash) {
      throw new Error('Print recovery backup checksum mismatch: ' + backup);
    }
    if (await infoIfExists(target)) {
      const current = await readRegularFile(target);
      if (current.sha256 !== candidateHash && current.sha256 !== previousHash) {
        throw new Error('Print recovery target has unrelated bytes: ' + target);
      }
      await fs.rm(target);
    }
    await renameImpl(backup, target);
    return;
  }
  const current = await infoIfExists(target);
  if (previousHash) {
    if (!current || (await readRegularFile(target)).sha256 !== previousHash) {
      throw new Error('Print recovery cannot restore previous file: ' + target);
    }
  } else if (current) {
    if ((await readRegularFile(target)).sha256 !== candidateHash) {
      throw new Error('Print recovery target has unrelated bytes: ' + target);
    }
    await fs.rm(target);
  }
}

export async function recoverPrint(outputPath, { renameImpl = fs.rename } = {}) {
  const output = path.resolve(outputPath);
  const directory = transactionPathFor(output);
  if (!(await infoIfExists(directory))) {
    return { recovered: false };
  }
  await assertSafePath(directory);
  const journalFile = await readRegularFile(path.join(directory, 'journal.json'));
  const journal = JSON.parse(journalFile.bytes.toString('utf8'));
  if (
    journal.schema !== 1 ||
    journal.output !== path.basename(output) ||
    !digestPattern.test(journal.candidate?.pdf) ||
    !digestPattern.test(journal.candidate?.manifest) ||
    !['prepared', 'committed'].includes(journal.state) ||
    (journal.previous !== null &&
      (!digestPattern.test(journal.previous?.pdf) ||
        !digestPattern.test(journal.previous?.manifest)))
  ) {
    throw new Error('Invalid print recovery journal: ' + directory);
  }
  const manifestPath = manifestPathFor(output);
  await assertOutputTargets(output, []);
  if (journal.state === 'committed') {
    await verifyPrintPair(output, manifestPath);
    if (
      (await readRegularFile(output)).sha256 !== journal.candidate.pdf ||
      (await readRegularFile(manifestPath)).sha256 !== journal.candidate.manifest
    ) {
      throw new Error('Committed print recovery pair has changed');
    }
  } else {
    const errors = [];
    for (const [name, target] of [
      ['pdf', output],
      ['manifest', manifestPath],
    ]) {
      try {
        await restoreFile(
          path.join(directory, 'previous.' + name),
          target,
          journal.previous?.[name] ?? null,
          journal.candidate[name],
          renameImpl
        );
      } catch (error) {
        errors.push(error.message);
      }
    }
    if (errors.length) {
      throw recoveryError(
        'Print rollback incomplete; recovery retained at ' + directory + ': ' + errors.join('; '),
        directory
      );
    }
    if (journal.previous) {
      await verifyPrintPair(output, manifestPath);
    }
  }
  await fs.rm(directory, { recursive: true });
  return { recovered: true, action: journal.state === 'committed' ? 'finish' : 'rollback' };
}

export async function finalizePrintPair(
  candidatePdf,
  candidateManifest,
  outputPath,
  { renameImpl = fs.rename } = {}
) {
  const output = path.resolve(outputPath);
  const outputManifest = manifestPathFor(output);
  await assertOutputTargets(output, [path.resolve(candidatePdf), path.resolve(candidateManifest)]);
  await assertNoPendingTransaction(output);
  await verifyPrintPair(candidatePdf, candidateManifest);
  const previous = await pairState(output);
  const candidate = {
    pdf: (await readRegularFile(candidatePdf)).sha256,
    manifest: (await readRegularFile(candidateManifest)).sha256,
  };
  const directory = transactionPathFor(output);
  await fs.mkdir(directory);
  const journal = {
    schema: 1,
    output: path.basename(output),
    state: 'prepared',
    previous,
    candidate,
  };
  let committed = false;
  try {
    await writeJournal(directory, journal);
    if (previous) {
      await renameImpl(output, path.join(directory, 'previous.pdf'));
      await renameImpl(outputManifest, path.join(directory, 'previous.manifest'));
    }
    await renameImpl(candidatePdf, output);
    await renameImpl(candidateManifest, outputManifest);
    await verifyPrintPair(output, outputManifest);
    await writeJournal(directory, { ...journal, state: 'committed' });
    committed = true;
  } catch (error) {
    try {
      await recoverPrint(output, { renameImpl });
    } catch (rollbackError) {
      throw recoveryError(error.message + '; ' + rollbackError.message, directory, rollbackError);
    }
    throw error;
  } finally {
    if (committed) {
      await fs.rm(directory, { recursive: true, force: true });
    }
  }
}

async function storeArtifact(outputPath, pdf, manifestBytes, artifactId) {
  const root = outputPath + '.artifacts';
  const directory = path.join(root, artifactId);
  await assertSafePath(directory, { allowMissing: true });
  await fs.mkdir(root, { recursive: true });
  if (await infoIfExists(directory)) {
    const record = await verifyPrintPair(
      path.join(directory, 'artifact.pdf'),
      path.join(directory, 'manifest.json')
    );
    if (
      record.artifactId !== artifactId ||
      !(await readRegularFile(path.join(directory, 'manifest.json'))).bytes.equals(manifestBytes)
    ) {
      throw new Error('Immutable print artifact collision: ' + artifactId);
    }
    return directory;
  }
  const staging = await fs.mkdtemp(path.join(root, '.candidate-'));
  try {
    await writeDurably(path.join(staging, 'artifact.pdf'), pdf);
    await writeDurably(path.join(staging, 'manifest.json'), manifestBytes);
    await fs.rename(staging, directory);
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
  return directory;
}

async function chromiumProducer({ htmlUrl, resourcePolicy, reviewBrowser = null }) {
  const toolchainPackage = JSON.parse(
    (await readRegularFile(path.join(toolchainRoot, 'package.json'))).bytes.toString('utf8')
  );
  const lockFile = await readRegularFile(path.join(toolchainRoot, 'package-lock.json'));
  const lock = JSON.parse(lockFile.bytes.toString('utf8'));
  const playwright = require(path.join(toolchainRoot, 'node_modules', 'playwright'));
  const installedPackage = require(
    path.join(toolchainRoot, 'node_modules', 'playwright', 'package.json')
  );
  const expectedVersion = toolchainPackage.dependencies?.playwright;
  if (
    !/^\d+\.\d+\.\d+$/.test(expectedVersion) ||
    installedPackage.version !== expectedVersion ||
    lock.packages?.['node_modules/playwright']?.version !== expectedVersion
  ) {
    throw new Error('Print requires the exact locked publishing Playwright version');
  }
  const browserDefinitions = require(
    path.join(toolchainRoot, 'node_modules', 'playwright-core', 'browsers.json')
  );
  const browserDefinition = browserDefinitions.browsers.find((entry) => entry.name === 'chromium');
  const executablePath = reviewBrowser?.executablePath ?? playwright.chromium.executablePath();
  let executable;
  try {
    executable = await hashRegularFile(executablePath, { maxBytes: 512_000_000 });
  } catch (error) {
    throw new Error(
      'Locked publishing Chromium is unavailable; install it with node ' +
        'tools/publishing/toolchain/node_modules/playwright/cli.js install chromium: ' +
        error.message,
      { cause: error }
    );
  }
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath,
    args: reviewBrowser?.args ?? [],
  });
  const rejected = [];
  try {
    if (!reviewBrowser && browser.version() !== browserDefinition.browserVersion) {
      throw new Error('Publishing Chromium version differs from the locked browser definition');
    }
    const context = await browser.newContext({
      javaScriptEnabled: false,
      serviceWorkers: 'block',
      locale: 'en-US',
      timezoneId: 'UTC',
    });
    await context.route('**/*', async (route) => {
      try {
        const response = resourcePolicy.resolveRequest(
          route.request().url(),
          route.request().method()
        );
        await route.fulfill({
          status: 200,
          body: response.body,
          contentType: response.contentType,
          headers: {
            'Content-Security-Policy':
              "default-src 'none'; style-src " +
              printOrigin +
              '; img-src ' +
              printOrigin +
              '; font-src ' +
              printOrigin +
              "; base-uri 'none'; form-action 'none'; frame-src 'none'",
          },
        });
      } catch (error) {
        rejected.push(error.message);
        await route.abort('blockedbyclient');
      }
    });
    const page = await context.newPage();
    page.on('requestfailed', (request) => {
      rejected.push(
        'Print request failed: ' +
          request.url() +
          ': ' +
          (request.failure()?.errorText ?? 'unknown error')
      );
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        rejected.push('Print browser rejected content: ' + message.text());
      }
    });
    await page.emulateMedia({ media: 'print' });
    try {
      await page.goto(htmlUrl, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      if (!rejected.length) {
        throw error;
      }
    }
    if (rejected.length) {
      throw new Error('Print resources rejected: ' + [...new Set(rejected)].join('; '));
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    const pdf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
      outline: true,
    });
    if (rejected.length) {
      throw new Error('Print resources rejected: ' + [...new Set(rejected)].join('; '));
    }
    return {
      pdf,
      browser: {
        name: 'chromium',
        version: browser.version(),
        revision: reviewBrowser ? null : browserDefinition.revision,
        executableSha256: executable.sha256,
        managedBrowser: !reviewBrowser,
        reviewOnly: Boolean(reviewBrowser),
        ...(reviewBrowser ? { package: reviewBrowser.package } : {}),
      },
      toolchain: { playwrightVersion: expectedVersion, lockSha256: lockFile.sha256 },
    };
  } finally {
    await browser.close();
  }
}

export function createReviewProducer({ executablePath, packagePath, archivePath, args = [] }) {
  if (
    !path.isAbsolute(executablePath) ||
    !path.isAbsolute(packagePath) ||
    !path.isAbsolute(archivePath) ||
    !Array.isArray(args) ||
    args.some((argument) => typeof argument !== 'string')
  ) {
    throw new Error('Review Chromium requires absolute binary, package and archive paths');
  }
  return async (inputs) => {
    const packageFile = await readRegularFile(packagePath);
    const packageMetadata = JSON.parse(packageFile.bytes.toString('utf8'));
    const archive = await hashRegularFile(archivePath, { maxBytes: 512_000_000 });
    if (
      packageMetadata.name !== '@sparticuz/chromium' ||
      !/^\d+\.\d+\.\d+$/.test(packageMetadata.version)
    ) {
      throw new Error('Review Chromium requires an exact @sparticuz/chromium package');
    }
    return chromiumProducer({
      ...inputs,
      reviewBrowser: {
        executablePath,
        args,
        package: {
          name: packageMetadata.name,
          version: packageMetadata.version,
          packageSha256: packageFile.sha256,
          archiveSha256: archive.sha256,
        },
      },
    });
  };
}

export async function printArticle({
  htmlPath,
  outputPath,
  resourceRoot,
  expectedSource,
  producer = chromiumProducer,
}) {
  const identity = sourceIdentity(expectedSource);
  const before = await readRegularFile(identity.source.path, { maxBytes: 1_000_000 });
  if (before.sha256 !== identity.source.sha256) {
    throw new Error('Print source checksum mismatch before rendering');
  }
  const policy = await captureResources({
    htmlPath,
    resourceRoot,
    resources: expectedSource.resources,
  });
  const output = path.resolve(outputPath);
  const protectedPaths = [...policy.protectedPaths, identity.source.path];
  await assertOutputTargets(output, protectedPaths);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await assertNoPendingTransaction(output);
  await pairState(output);
  const rendered = await producer({ htmlUrl: policy.htmlUrl, resourcePolicy: policy });
  const pages = assertPdf(rendered.pdf);
  await policy.verifyUnchanged();
  const after = await readRegularFile(identity.source.path, { maxBytes: 1_000_000 });
  if (after.sha256 !== before.sha256 || after.dev !== before.dev || after.ino !== before.ino) {
    throw new Error('Print source changed during rendering');
  }
  const contentId = sha256(
    JSON.stringify({
      articleId: identity.articleId,
      editionId: identity.editionId,
      sourceSha256: identity.source.sha256,
    })
  );
  const record = {
    schema: 1,
    kind: 'article-pdf',
    contentId,
    ...identity,
    render: {
      generatedAt: new Date().toISOString(),
      resources: policy.resources,
      resourceLimits: policy.limits,
      producerSha256: (await readRegularFile(producerPath)).sha256,
      resourcePolicySha256: (
        await readRegularFile(fileURLToPath(new URL('./print-resource.cjs', import.meta.url)))
      ).sha256,
      provenanceSha256: (
        await readRegularFile(fileURLToPath(new URL('./provenance.cjs', import.meta.url)))
      ).sha256,
      pathSafetySha256: (
        await readRegularFile(fileURLToPath(new URL('./safety.cjs', import.meta.url)))
      ).sha256,
      browser: rendered.browser,
      toolchain: rendered.toolchain,
    },
    pdf: { sha256: sha256(rendered.pdf), bytes: rendered.pdf.length, pages },
  };
  if (!record.render.browser?.name || !record.render.browser?.version || !record.render.toolchain) {
    throw new Error('Print producer must report browser and toolchain metadata');
  }
  const manifest = { ...record, artifactId: sha256(JSON.stringify(record)) };
  const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
  const artifactPath = await storeArtifact(
    output,
    rendered.pdf,
    manifestBytes,
    manifest.artifactId
  );
  const staging = await fs.mkdtemp(path.join(path.dirname(output), '.article-print-'));
  try {
    const candidatePdf = path.join(staging, 'candidate.pdf');
    const candidateManifest = path.join(staging, 'candidate.manifest.json');
    await writeDurably(candidatePdf, rendered.pdf);
    await writeDurably(candidateManifest, manifestBytes);
    await finalizePrintPair(candidatePdf, candidateManifest, output);
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
  return Object.freeze({
    outputPath: output,
    manifestPath: manifestPathFor(output),
    artifactPath,
    manifest: Object.freeze(manifest),
  });
}

export function parseArgs(argv) {
  const options = {};
  const names = {
    '--html': 'htmlPath',
    '--output': 'outputPath',
    '--resources': 'resourceRoot',
    '--source-manifest': 'sourceManifest',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      return { help: true };
    }
    const name = names[argument];
    if (!name || options[name] || !argv[index + 1] || argv[index + 1].startsWith('--')) {
      throw new Error('Unknown, duplicate or incomplete print argument: ' + argument);
    }
    options[name] = argv[++index];
  }
  for (const name of ['htmlPath', 'outputPath', 'resourceRoot']) {
    if (!options[name]) {
      throw new Error('Print requires --html, --output and --resources');
    }
  }
  options.sourceManifest ??= options.htmlPath + '.source.json';
  return options;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      'Usage: node tools/publishing/print.mjs --html <print.html> ' +
        '--output <article.pdf> --resources <kit-root> [--source-manifest <json>]'
    );
    return;
  }
  await assertOutputTargets(path.resolve(args.outputPath), [path.resolve(args.sourceManifest)]);
  const expectedSource = JSON.parse(
    (await readRegularFile(args.sourceManifest)).bytes.toString('utf8')
  );
  const result = await printArticle({
    ...args,
    htmlPath: path.resolve(args.htmlPath),
    resourceRoot: path.resolve(args.resourceRoot),
    expectedSource,
  });
  console.log(
    JSON.stringify({
      outputPath: result.outputPath,
      manifestPath: result.manifestPath,
      artifactPath: result.artifactPath,
      artifactId: result.manifest.artifactId,
    })
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === producerPath) {
  main().catch((error) => {
    console.error('Article print failed: ' + error.message);
    process.exitCode = 1;
  });
}
