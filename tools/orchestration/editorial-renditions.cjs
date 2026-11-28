'use strict';

const path = require('node:path');
const { createHash } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { isDeepStrictEqual } = require('node:util');
const { evaluate } = require('./editorial-article.cjs');
const { readSource } = require('../publishing/safety.cjs');

const digest = /^[0-9a-f]{64}$/;
const articleAlias = /^articles\/[a-z][a-z0-9-]{0,79}\.html$/;

function requireEdition(record, article, edition, source) {
  if (
    record.articleId !== article.id ||
    edition !== article.edition ||
    source !== article.sourceSha256 ||
    record.semanticSha256 !== article.semanticSha256
  ) {
    throw new Error('Rendition differs from the selected editorial edition');
  }
}

async function observeWriting(browser, directory, alias) {
  if (!browser) throw new Error('Editorial HTML requires a local review browser');
  if (typeof alias !== 'string' || !articleAlias.test(alias)) {
    throw new Error('Editorial browser requires a native article alias');
  }
  const publicDir = path.resolve(directory, 'generation/public');
  const writingUrl = pathToFileURL(path.join(publicDir, 'writing.html')).href;
  const articleUrl = pathToFileURL(path.join(publicDir, alias)).href;
  const page = await browser.newPage({
    javaScriptEnabled: false,
    offline: true,
    serviceWorkers: 'block',
  });
  try {
    const writing = await page.goto(writingUrl, { timeout: 5000 });
    if (!writing?.ok() || writing.url() !== writingUrl)
      throw new Error('Editorial browser could not open Writing');
    const writingSha256 = createHash('sha256')
      .update(await writing.body())
      .digest('hex');
    const link = page
      .locator(`.article-list a[href="${alias}"], .publication-list a[href="${alias}"]`)
      .filter({ visible: true })
      .first();
    const [article] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url() === articleUrl &&
          response.request().isNavigationRequest() &&
          response.frame() === page.mainFrame(),
        { timeout: 5000 }
      ),
      link.click({ timeout: 5000 }),
    ]);
    await page.waitForURL(articleUrl, { timeout: 5000 });
    if (!article.ok()) throw new Error('Editorial browser could not open the native article');
    return {
      alias,
      writingSha256,
      articleSha256: createHash('sha256')
        .update(await article.body())
        .digest('hex'),
    };
  } finally {
    await page.close();
  }
}

async function siteOutput({ directory, identity, browser }, article) {
  const publicDir = path.join(directory, 'generation/public');
  const lock = require('../site/content-release.cjs').verifyBaseline({
    baseline: publicDir,
    baselineLock: path.join(directory, 'generation/output-lock.json'),
    expectedBaselineLockSha256: identity,
  });
  const matching = Object.entries(lock.articles ?? {}).filter(
    ([, entry]) => entry.articleId === article.id
  );
  if (matching.length !== 1)
    throw new Error('Editorial article is absent or ambiguous in the site');
  const [[key, record]] = matching;
  requireEdition(record, article, record.contentEdition, record.sourceSha256);
  const revisionFile = readSource(publicDir, 'site-revision.json');
  if (revisionFile.sha256 !== lock.files['site-revision.json']) {
    throw new Error('Editorial site revision changed during verification');
  }
  const revision = JSON.parse(revisionFile.bytes);
  const entry = revision.articles?.[key];
  if (
    !entry ||
    entry.alias !== record.url ||
    entry.url !== record.snapshot ||
    entry.sha256 !== record.sha256 ||
    !articleAlias.test(entry.alias)
  ) {
    throw new Error('Editorial article route differs from the site revision');
  }
  requireEdition(entry, article, entry.contentEdition, entry.sourceSha256);

  const writing = readSource(publicDir, 'writing.html');
  const page = readSource(publicDir, entry.alias);
  if (writing.sha256 !== lock.files['writing.html'] || page.sha256 !== lock.files[entry.alias]) {
    throw new Error('Editorial route bytes changed during verification');
  }
  const observation = await observeWriting(browser, directory, entry.alias);
  if (
    observation.alias !== entry.alias ||
    observation.writingSha256 !== writing.sha256 ||
    observation.articleSha256 !== page.sha256
  ) {
    throw new Error('Editorial HTML requires a matching Writing navigation observation');
  }
  return { artifact: page.sha256, file: entry.alias };
}

async function printOutput({ directory, identity }, article) {
  const { verifyKit } = require('../publishing/kit.cjs');
  const kit = await verifyKit(directory, { expectedId: identity });
  requireEdition(kit, article, kit.contentEdition, kit.source.sha256);
  const inventory = new Map(kit.outputs.map((entry) => [entry.path, entry]));
  if (inventory.get('article.md')?.sha256 !== article.sourceSha256) {
    throw new Error('Editorial PDF kit does not contain the accepted manuscript');
  }
  const { verifyPrintPair } = await import('../publishing/print.mjs');
  const pdf = await verifyPrintPair(path.resolve(directory, 'article.pdf'));
  const record = readSource(directory, 'article.manifest.json');
  const declaration = readSource(directory, 'print.html.source.json');
  if (
    record.sha256 !== inventory.get('article.manifest.json')?.sha256 ||
    declaration.sha256 !== inventory.get('print.html.source.json')?.sha256 ||
    pdf.pdf.sha256 !== inventory.get('article.pdf')?.sha256 ||
    !isDeepStrictEqual(JSON.parse(record.bytes), pdf)
  ) {
    throw new Error('Editorial PDF pair differs from the pinned kit');
  }
  const source = JSON.parse(declaration.bytes);
  if (
    pdf.articleId !== article.id ||
    source.articleId !== article.id ||
    pdf.editionId !== article.edition ||
    source.editionId !== article.edition ||
    pdf.source.sha256 !== article.sourceSha256 ||
    source.source.sha256 !== article.sourceSha256
  ) {
    throw new Error('Editorial PDF source differs from the pinned kit edition');
  }
  const resources = new Map(
    [...source.resources, { path: 'print.html', sha256: inventory.get('print.html')?.sha256 }].map(
      ({ path, sha256 }) => [path, sha256]
    )
  );
  if (
    resources.size !== source.resources.length + 1 ||
    resources.size !== pdf.render.resources.length ||
    new Set(pdf.render.resources.map((resource) => resource.path)).size !== resources.size ||
    !pdf.render.resources.every(({ path, sha256, bytes }) => {
      const output = inventory.get(path);
      return resources.get(path) === sha256 && output?.sha256 === sha256 && output.bytes === bytes;
    })
  ) {
    throw new Error('Editorial PDF resources differ from the pinned kit');
  }
  return { artifact: pdf.pdf.sha256, file: 'article.pdf' };
}

async function prepareRendition(replay, request) {
  const state = evaluate(replay);
  const input = JSON.parse(replay);
  const { article, output, manuscript, previous } = request;
  if (
    state.manuscript?.decision?.choice !== 'accept' ||
    state.manuscript.review !== manuscript ||
    state.manuscript.artifact !== article?.sourceSha256
  ) {
    throw new Error('Rendition requires the current accepted manuscript');
  }
  if (!input.outputs.includes(output)) throw new Error('Editorial output was not requested');
  if ((state.artifacts[output]?.review ?? null) !== previous)
    throw new Error('Editorial output slot has changed');
  if (
    typeof request.identity !== 'string' ||
    typeof article.semanticSha256 !== 'string' ||
    !digest.test(request.identity) ||
    !digest.test(article.semanticSha256)
  ) {
    throw new Error('Editorial rendition requires pinned artifact and edition digests');
  }

  const artifact =
    output === 'html' ? await siteOutput(request, article) : await printOutput(request, article);
  const event = { type: 'render', manuscript, output, previous, artifact: artifact.artifact };
  const next = evaluate(JSON.stringify({ ...input, events: [...input.events, event] }));
  return { event, file: artifact.file, review: next.artifacts[output].review };
}

module.exports = { observeWriting, prepareRendition };
