'use strict';
// Actual bounded observations are reusable by the explicitly synthetic local diagnostic.
// Only run() authenticates admission and can produce a content-functional report.
const path = require('node:path');
const gate = require('./content-gate.cjs');
const artifact = require('./artifact.cjs');
const common = require('./common.cjs');

function resourceURL(base, file) {
  if (!/^[a-z0-9][a-z0-9/._-]*$/.test(file) || file.includes('..'))
    throw Error('Unsafe content observation path');
  return new URL(file, base.replace(/\/$/, '') + '/').href;
}

async function observeDocuments(browser, base, manifest) {
  const rows = [];
  for (const selected of gate.cases(manifest)) {
    const row = { ...selected, pass: false, errors: [] };
    const context = await browser.newContext({
      viewport: { width: selected.width, height: 900 },
      javaScriptEnabled: selected.mode !== 'no-js',
    });
    try {
      const page = await context.newPage();
      page.on('pageerror', (error) => row.errors.push(error.message));
      const response = await page.goto(resourceURL(base, selected.file), {
        waitUntil: 'networkidle',
      });
      row.status = response.status();
      row.sha256 = artifact.digest(await response.body());
      if (
        selected.file === 'writing.html' &&
        selected.mode === 'normal' &&
        manifest.files['publication-index.json']
      ) {
        await page.waitForFunction(() => document.body.dataset.tagsState === 'ready');
        const select = page.locator('#archive-tag');
        const tag = await select.locator('option').nth(1).getAttribute('value');
        await select.selectOption(tag);
        await page.waitForFunction(
          (expected) => new URL(location.href).searchParams.get('tag') === expected,
          tag
        );
        const visible = await page.locator('#archive-results li.publication:visible').count();
        if (visible < 1) throw Error('tag filter produced no current publication');
        const invalid = await page
          .locator('#archive-results li.publication:visible')
          .evaluateAll(
            (cards, expected) =>
              cards.some((card) => !card.dataset.tags?.split(' ').includes(expected)),
            tag
          );
        if (invalid) throw Error('tag filter includes an unrelated publication');
        await select.selectOption('all');
        row.tagFilter = true;
      }
      Object.assign(
        row,
        await page.evaluate(async () => {
          const images = [...document.images];
          await Promise.race([
            Promise.all(
              images.map((image) => {
                image.loading = 'eager';
                return image.decode();
              })
            ),
            new Promise((_, reject) =>
              setTimeout(() => reject(Error('Image decode timed out')), 10000)
            ),
          ]);
          return {
            h1: document.querySelectorAll('h1').length,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            imagesDecoded: images.every(
              (image) => image.naturalWidth > 0 && image.naturalHeight > 0
            ),
          };
        })
      );
      row.pass =
        row.status === 200 &&
        row.sha256 === manifest.files[row.file].sha256 &&
        row.h1 === 1 &&
        !row.overflow &&
        row.imagesDecoded &&
        !row.errors.length;
    } catch (error) {
      row.error = error.message;
    } finally {
      await context.close();
      rows.push(row);
    }
  }
  return rows;
}

async function observeMedia(browser, base, manifest) {
  const media = [];
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(resourceURL(base, 'writing.html'));
    for (const file of gate.mediaFiles(manifest)) {
      const row = { file, pass: false };
      try {
        const response = await context.request.get(resourceURL(base, file));
        row.status = response.status();
        row.sha256 = artifact.digest(await response.body());
        Object.assign(
          row,
          await page.evaluate(
            async (url) => {
              const image = new Image();
              image.src = url;
              await Promise.race([
                image.decode(),
                new Promise((_, reject) =>
                  setTimeout(() => reject(Error('Media decode timed out')), 10000)
                ),
              ]);
              return { width: image.naturalWidth, height: image.naturalHeight };
            },
            resourceURL(base, file)
          )
        );
        row.pass =
          row.status === 200 &&
          row.sha256 === manifest.files[file].sha256 &&
          row.width > 0 &&
          row.height > 0;
      } catch (error) {
        row.error = error.message;
      }
      media.push(row);
    }
  } finally {
    await context.close();
  }
  return media;
}

async function observe(browser, base, manifest) {
  return {
    browser: browser.version(),
    rows: await observeDocuments(browser, base, manifest),
    media: await observeMedia(browser, base, manifest),
  };
}

async function run(directory) {
  const started = Date.now();
  let browser;
  const detail = {
    policy: gate.policy,
    profile: 'staging',
    contentContract: 1,
    platformRegression: 'inherited; not rerun',
    rows: [],
    media: [],
  };
  try {
    const manifest = gate.verifyReuse(directory);
    const base = require('./hosted-origin.cjs').target(process.env.SITE_TEST_BASE_URL, 'staging');
    browser = await common
      .toolRequire('playwright')
      .chromium.launch(common.launchOptions('chromium'));
    Object.assign(detail, await observe(browser, base, manifest));
    if (Object.keys(manifest.components.articles || {}).length)
      detail.articles = await require('./article-browser.cjs').articleJourney(
        base,
        manifest.components.articles,
        { browser }
      );
    detail.elapsedMs = Date.now() - started;
    gate.validateFunctional(
      { ...detail, kind: 'content-functional', target: base, pass: true },
      manifest
    );
    return common.report('content-functional', detail);
  } catch (error) {
    detail.elapsedMs = Date.now() - started;
    common.report(
      'content-functional',
      { ...detail, error: error.stack, articleObservations: error.articleObservations },
      false
    );
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
if (require.main === module)
  run(path.resolve(process.argv[2] || 'quality-artifact')).catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = { resourceURL, observeDocuments, observeMedia, observe, run };
