'use strict';
// One small Chromium preview matrix. This report never substitutes for a full gate.
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  crypto = require('node:crypto');
const {
    toolRequire,
    report,
    launchOptions,
    out,
    variant: artifactVariant,
  } = require('./common.cjs'),
  { start } = require('./serve.cjs');
const flightDetail = require('./flight-detail.cjs');
const routes = ['index', 'research', 'writing', 'talks', 'credits'];
const catalog = require('../../site/content/catalog.json'),
  primaryCount = Object.keys(catalog.records).length;
const selectedResponses = ['Matthew Skelton', 'Markus Kopko'];
const completeResponses = [
  'Markus Kopko',
  'Otman Basir, Ph.D.',
  'Maximiliano Armesto',
  'Christophe Kolb & Taller',
  'Rod Montgomery',
  'Michael Risch',
  'Matthew Skelton',
];
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function artifactFile(value, base, manifest) {
  const url = new URL(value),
    scope = new URL(base.replace(/\/$/, '') + '/');
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return null;
  const name = decodeURIComponent(url.pathname.slice(scope.pathname.length));
  if (Object.hasOwn(manifest.files, name)) return name;
  const canonical = name.endsWith('/') || name === '' ? name + 'index.html' : name + '.html';
  return Object.hasOwn(manifest.files, canonical) ? canonical : null;
}
async function verifyResponse(response, base, manifest, checkedFiles) {
  const source = new URL(response.url()),
    scope = new URL(base.replace(/\/$/, '') + '/');
  if (source.origin !== scope.origin || !source.pathname.startsWith(scope.pathname))
    return { observed: false };
  const file = artifactFile(source.href, base, manifest),
    status = response.status();
  assert.ok(status < 400, 'HTTP failure ' + status + ' ' + source.pathname);
  if ([301, 302, 303, 307, 308].includes(status)) {
    assert.ok(file?.endsWith('.html'), 'unexpected non-HTML artifact redirect ' + source.pathname);
    const location = response.headers().location;
    assert.ok(location, 'missing canonical redirect Location ' + source.pathname);
    const target = new URL(location, source);
    assert.equal(target.origin, scope.origin, 'canonical redirect left the selected site');
    assert.ok(
      target.pathname.startsWith(scope.pathname),
      'canonical redirect left the selected path'
    );
    assert.equal(
      artifactFile(target.href, base, manifest),
      file,
      'canonical redirect changed artifact ' + file
    );
    return { observed: true, file, status, redirect: target.href };
  }
  if (!file) return { observed: false };
  assert.equal(status, 200, 'public response ' + file);
  const digest = hash(await response.body());
  assert.equal(digest, manifest.files[file].sha256, 'served bytes ' + file);
  checkedFiles.add(file);
  return { observed: true, file, status, sha256: digest };
}
function identity(manifest) {
  if (process.env.SITE_EXPECTED_PUBLIC_DIGEST)
    assert.equal(
      manifest.artifactDigest,
      process.env.SITE_EXPECTED_PUBLIC_DIGEST,
      'preview public digest'
    );
  if (process.env.SITE_CANDIDATE_SHA)
    assert.equal(manifest.candidateCommit, process.env.SITE_CANDIDATE_SHA, 'preview source commit');
  const variant = artifactVariant(manifest);
  assert.match(manifest.components.engine, /^[a-f0-9]{64}$/, 'preview runtime engine identity');
  // Base fingerprints its authored descriptor; Color fingerprints the derived
  // runtime. Both retain their verified manifest identities without rewriting.
  if (variant.id === 'color') assert.equal(variant.fingerprint, manifest.components.engine);
  if (process.env.SITE_PUBLIC_VARIANT) assert.equal(variant.id, process.env.SITE_PUBLIC_VARIANT);
  return variant;
}
function verifyRuntimeIdentity(observed, manifest, variant, route) {
  assert.equal(observed.engine, manifest.components.engine, route + ' engine identity');
  assert.equal(observed.variant, variant.id, route + ' variant identity');
}
async function ready(page, id) {
  await page.waitForFunction(
    (id) =>
      document.body.dataset.page === id &&
      document.getElementById('site-content') &&
      !document.getElementById('site-content').hasAttribute('aria-busy'),
    id,
    { polling: 40, timeout: 10000 }
  );
}
function routeSelector(id) {
  return id === 'credits'
    ? 'footer a[href="credits.html"]'
    : '.site-header nav a[href="' + (id === 'index' ? './' : id + '.html') + '"]';
}
async function state(page) {
  return page.evaluate(() => {
    const scene = document.querySelector('.space-scene'),
      fallback = document.querySelector('.space-fallback'),
      button = document.getElementById('space-motion');
    return {
      page: document.body.dataset.page,
      ready: scene.dataset.ready === 'true',
      travel: scene.dataset.travel || null,
      phase: scene.dataset.phase,
      fallback: getComputedStyle(fallback).visibility !== 'hidden',
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      motion: { hidden: button.hidden, disabled: button.disabled, label: button.textContent },
      engine: document.querySelector('meta[name="site-engine"]').content,
      variant: document.querySelector('meta[name="site-variant"]')?.content || 'base',
    };
  });
}
async function routeBytes(context, url, manifest) {
  return Promise.all(
    routes.map(async (id) => {
      const response = await context.request.get(url + '/' + id + '.html'),
        result = await verifyResponse(response, url, manifest, new Set());
      assert.equal(result.status, 200, id + ' HTTP status');
      assert.equal(result.file, id + '.html', id + ' canonical route');
      return { route: id, sha256: result.sha256, status: result.status };
    })
  );
}
async function responseNames(page, route) {
  const selector = '#acknowledgements article h3 a';
  const names = await page.locator(selector).allTextContents();
  assert.deepEqual(
    names,
    route === 'index' ? selectedResponses : completeResponses,
    route + ' public-response names and order'
  );
  assert.equal(
    await page.locator('#acknowledgements article').count(),
    names.length,
    route + ' no additional discussion cards'
  );
  return names;
}
async function discussionAnchor(page) {
  assert.equal(
    new URL(page.url()).hash,
    '#acknowledgements',
    'public-discussion fragment retained'
  );
  await page.waitForFunction(
    () => {
      const heading = document.querySelector('#acknowledgements .section-heading'),
        rect = heading.getBoundingClientRect();
      return rect.top >= -1 && rect.top < innerHeight;
    },
    null,
    { polling: 40, timeout: 3000 }
  );
}
async function discussionNavigation(page, url) {
  await page.locator(routeSelector('index')).evaluate((el) => el.click());
  await ready(page, 'index');
  const home = await responseNames(page, 'index'),
    cta = page.locator('#acknowledgements > a.text-link');
  assert.equal(await cta.getAttribute('href'), 'research.html#acknowledgements');
  assert.equal(await cta.textContent(), 'Full discussion & source context ↗');
  await cta.evaluate((el) => el.click());
  await ready(page, 'research');
  await discussionAnchor(page);
  const research = await responseNames(page, 'research');
  await page.goBack();
  await ready(page, 'index');
  await responseNames(page, 'index');
  await page.goForward();
  await ready(page, 'research');
  await discussionAnchor(page);
  const nav = page.locator('nav[aria-label="Research sections"] a[href="#acknowledgements"]');
  assert.equal(await nav.textContent(), 'Advisors & responses');
  await page.locator(routeSelector('index')).evaluate((el) => el.click());
  await ready(page, 'index');
  await page
    .locator('#acknowledgements a[href="research.html#ua-advisors"]')
    .evaluate((el) => el.click());
  await ready(page, 'research');
  assert.equal(new URL(page.url()).hash, '#ua-advisors');
  await page.waitForFunction(
    () => {
      const r = document.getElementById('ua-advisors').getBoundingClientRect();
      return r.top >= -1 && r.top < innerHeight;
    },
    null,
    { polling: 40, timeout: 3000 }
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await nav.click();
  await discussionAnchor(page);
  await page.goto(url + '/research.html#acknowledgements', { waitUntil: 'load' });
  await ready(page, 'research');
  await discussionAnchor(page);
  await responseNames(page, 'research');
  return { home, research, cta: true, localNavigation: true, history: true, directAnchor: true };
}
async function writingControls(page) {
  await page.locator('#archive-topic').selectOption('systems');
  assert.ok(
    (await page.locator('li.publication:visible').count()) > 0,
    'Writing filter has results'
  );
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({ media: 'print' });
  assert.equal(
    await page.locator('li.publication:visible').count(),
    primaryCount,
    'print shows all primary records and their edition links'
  );
  assert.match(
    await page.locator('#archive-count').textContent(),
    /their linked platform editions shown for printing/
  );
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await page.locator('.filter-reset').evaluate((el) => el.click());
  assert.equal(
    await page.locator('li.publication:visible').count(),
    primaryCount,
    'Writing Reset retains every primary record'
  );
}
async function researchControls(page, mode, width) {
  assert.equal(
    await page.locator('.discussion-row').count(),
    Object.keys(catalog.discussions).length,
    'discussion rows match the canonical catalog'
  );
  assert.equal(await page.locator('.advisor-role').count(), 2, 'two project advisors');
  if (mode === 'normal' && width === 390) {
    await page.locator('.appearance summary').click();
    await page.locator('#space-motion').click();
    assert.match(await page.locator('#space-motion').textContent(), /off/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  }
  await page.evaluate(() =>
    scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
  );
  const footer = await page.locator('.site-footer').boundingBox();
  assert.ok(
    footer && footer.y < page.viewportSize().height && footer.y + footer.height > 0,
    'Research bottom remains reachable'
  );
  if (mode === 'normal' && width === 390) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('#space-motion').click();
    await page.locator('.appearance summary').click();
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
}
function assertRenderedMode(observed, id, mode) {
  if (mode === 'normal') {
    assert.equal(observed.ready, true, id + ' canvas is ready');
    assert.equal(observed.fallback, false, id + ' animated scene active');
  } else {
    assert.equal(observed.ready, false, id + ' no-canvas fallback');
    assert.equal(observed.fallback, true, id + ' readable static fallback');
    assert.equal(
      observed.motion.hidden || observed.motion.disabled,
      true,
      id + ' unavailable motion control'
    );
  }
}
async function scenario(browser, url, manifest, variant, width, mode) {
  const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      reducedMotion: 'no-preference',
    }),
    page = await context.newPage();
  const errors = [],
    external = [],
    responseChecks = [],
    checkedFiles = new Set(),
    rows = [];
  page.setDefaultTimeout(8000);
  await context.addInitScript((mode) => {
    try {
      localStorage.setItem('vo.theme', 'light');
      localStorage.setItem('vo.motion', 'on');
    } catch {
      /* Denied storage keeps the runtime's ordinary defaults. */
    }
    if (mode === 'no-canvas') HTMLCanvasElement.prototype.getContext = () => null;
  }, mode);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith(url + '/')) external.push(request.url());
  });
  page.on('response', (response) => {
    responseChecks.push(
      verifyResponse(response, url, manifest, checkedFiles).catch((error) => {
        errors.push(error.message);
      })
    );
  });
  try {
    const served = await routeBytes(context, url, manifest);
    await page.goto(url + '/index.html', { waitUntil: 'load' });
    await ready(page, 'index');
    if (mode === 'normal')
      await page.waitForFunction(
        () => document.querySelector('.space-scene').dataset.ready === 'true',
        null,
        { polling: 50, timeout: 5000 }
      );
    await page.evaluate(() => {
      window.__previewShell = {
        header: document.querySelector('header'),
        canvas: document.querySelector('canvas'),
      };
    });
    for (const id of routes) {
      const checkDetail = mode === 'normal' && id === 'writing';
      if (checkDetail) await flightDetail.begin(page);
      if (id !== 'index') {
        await page.locator(routeSelector(id)).evaluate((el) => el.click());
        await ready(page, id);
      }
      const detail = checkDetail ? await flightDetail.finish(page) : null;
      const observed = await state(page);
      assert.equal(observed.h1, 1, id + ' single main heading');
      assert.equal(observed.overflow, false, id + ' horizontal overflow');
      verifyRuntimeIdentity(observed, manifest, variant, id);
      assert.equal(
        await page.evaluate(
          () =>
            window.__previewShell.header === document.querySelector('header') &&
            window.__previewShell.canvas === document.querySelector('canvas')
        ),
        true,
        id + ' persistent header and canvas'
      );
      assertRenderedMode(observed, id, mode);
      await page.locator('.appearance summary').click();
      const theme = id === 'research' || id === 'talks' ? 'dark' : 'light';
      await page.locator('#theme-mode').selectOption(theme);
      assert.equal(
        await page.locator('html').getAttribute('data-theme'),
        theme,
        id + ' theme control'
      );
      if (mode === 'normal' && id === 'index') {
        await page.locator('#space-motion').click();
        await page.waitForTimeout(150);
        const frozen = await page.locator('canvas').evaluate((el) => el.toDataURL());
        await page.waitForTimeout(150);
        assert.equal(
          await page.locator('canvas').evaluate((el) => el.toDataURL()),
          frozen,
          'Motion Off freezes the rendered bitmap'
        );
        assert.match(await page.locator('#space-motion').textContent(), /off/);
        await page.locator('#space-motion').click();
      }
      await page.locator('.appearance summary').click();
      if (id === 'writing') await writingControls(page);
      if (id === 'research') await researchControls(page, mode, width);
      if (id === 'index' || id === 'research') await responseNames(page, id);
      rows.push({
        route: id,
        pass: true,
        state: observed,
        detail,
        checks: [
          'exact identity',
          'heading',
          'viewport',
          'persistent shell',
          'theme control',
          mode === 'normal' ? 'canvas active' : 'no-canvas fallback',
        ],
      });
    }
    await page.goBack();
    await ready(page, 'talks');
    await page.goForward();
    await ready(page, 'credits');
    const discussion = await discussionNavigation(page, url);
    await Promise.all(responseChecks);
    assert.deepEqual(errors, [], 'runtime and served-byte errors');
    assert.deepEqual(external, [], 'unexpected external requests');
    return {
      width,
      mode,
      pass: true,
      served,
      rows,
      history: true,
      discussion,
      motionOff: mode === 'normal',
      errors,
      externalRequests: external,
      verifiedResponses: [...checkedFiles].sort(),
    };
  } catch (error) {
    fs.mkdirSync(out, { recursive: true });
    await page
      .screenshot({ path: path.join(out, 'preview-' + width + '-' + mode + '.png') })
      .catch(() => {});
    await Promise.all(responseChecks);
    return {
      width,
      mode,
      pass: false,
      error: error.message,
      stack: error.stack,
      rows,
      state: await state(page).catch(() => null),
      errors,
      externalRequests: external,
    };
  } finally {
    await context.close();
  }
}
async function main() {
  assert.ok(
    process.argv.includes('--smoke'),
    'Usage: local-browser.cjs --smoke with artifact environment'
  );
  const manifest = JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST)),
    variant = identity(manifest),
    { server, url } = await start();
  const rows = [],
    pw = toolRequire('playwright');
  let browser, pass;
  try {
    browser = await pw.chromium.launch(launchOptions('chromium'));
    for (const width of [1440, 390])
      for (const mode of ['normal', 'no-canvas']) {
        const row = await scenario(browser, url, manifest, variant, width, mode);
        rows.push(row);
        console.log('Preview smoke:', width, mode, row.pass ? 'pass' : row.error);
      }
    pass = rows.length === 4 && rows.every((row) => row.pass);
    report(
      'preview-smoke',
      {
        smoke: true,
        profile: 'preview',
        variant,
        browser: browser.version(),
        routes,
        widths: [1440, 390],
        modes: ['normal', 'no-canvas'],
        rows,
        fullGate: false,
        deploymentAuthorized: false,
      },
      pass
    );
  } catch (error) {
    report(
      'preview-smoke',
      {
        smoke: true,
        profile: 'preview',
        variant,
        rows,
        error: error.message,
        fullGate: false,
        deploymentAuthorized: false,
      },
      false
    );
    throw error;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
  assert.ok(pass, 'preview smoke failed');
  if (variant.id === 'color') await require('./color-browser.cjs').main({ smoke: true });
}
if (require.main === module)
  main().catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = {
  main,
  identity,
  verifyRuntimeIdentity,
  scenario,
  ready,
  state,
  artifactFile,
  verifyResponse,
};
