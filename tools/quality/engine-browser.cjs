'use strict';
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  { pathToFileURL } = require('node:url');
const routes = ['index', 'research', 'writing', 'talks', 'credits'];
const { matchesRoute } = require('./fallback-url.cjs');
async function ready(page, id) {
  await page.waitForFunction(
    (id) =>
      document.body.dataset.page === id &&
      !document.querySelector('#site-content').hasAttribute('aria-busy'),
    id,
    { polling: 50, timeout: 6000 }
  );
}
async function move(page, id) {
  await page
    .locator(`header a[href="${id === 'index' ? './' : id + '.html'}"]`)
    .first()
    .evaluate((el) => el.click());
  await ready(page, id);
}
async function camera(page) {
  return page.locator('.space-scene').getAttribute('data-camera');
}
function cameraSettlingSample() {
  const scene = document.querySelector('.space-scene'),
    control = document.querySelector('#space-motion'),
    probe = window.__engineCameraSettling,
    now = performance.now();
  const sample = {
    time: now - probe.start,
    y: scrollY,
    camera: scene.dataset.camera,
    phase: scene.dataset.phase,
    quality: scene.dataset.quality,
    route: scene.dataset.route,
    travel: scene.dataset.travel,
    ready: scene.dataset.ready === 'true',
    hidden: document.hidden,
    motion: control.textContent,
    pressed: control.getAttribute('aria-pressed'),
    disabled: control.disabled,
    controlHidden: control.hidden,
    paints: window.__quality?.paints,
    callbacks: window.__quality?.callbacks,
  };
  sample.held =
    sample.quality === 'still' &&
    sample.motion === 'Motion: still (device)' &&
    sample.pressed === 'false' &&
    !sample.disabled &&
    !sample.controlHidden &&
    sample.ready &&
    !sample.hidden &&
    sample.route === document.body.dataset.page &&
    sample.travel === 'settled';
  probe.samples.push(sample);
  probe.elapsedMs = sample.time;
  const previous = probe.previous;
  probe.previous = sample;
  if (sample.held) {
    probe.same = 0;
    if (
      !previous?.held ||
      ['camera', 'phase', 'y', 'paints', 'callbacks'].some((key) => sample[key] !== previous[key])
    )
      probe.quietStart = now;
    if (now - probe.quietStart < 150) return false;
    probe.status = 'settled';
    probe.policy = 'adaptive-hold';
    probe.quietMs = now - probe.quietStart;
    return true;
  }
  probe.quietStart = null;
  if (previous?.camera !== sample.camera) probe.same = 0;
  if (previous?.phase === sample.phase) return false;
  probe.same = previous?.camera === sample.camera ? (probe.same || 0) + 1 : 0;
  if (probe.same < 2) return false;
  probe.status = 'settled';
  probe.policy = 'live';
  return true;
}
async function settledCamera(page) {
  await page.evaluate(
    () =>
      (window.__engineCameraSettling = {
        start: performance.now(),
        timeoutMs: 3000,
        status: 'sampling',
        samples: [],
      })
  );
  try {
    await page.waitForFunction(cameraSettlingSample, null, { polling: 50, timeout: 3000 });
  } catch (error) {
    await page
      .evaluate((reason) => {
        window.__engineCameraSettling.status = 'failed';
        window.__engineCameraSettling.error = reason;
      }, error.message)
      .catch(() => {});
    throw error;
  }
  return camera(page);
}
function motionState() {
  const scene = document.querySelector('.space-scene'),
    control = document.querySelector('#space-motion');
  return {
    label: control.textContent,
    pressed: control.getAttribute('aria-pressed'),
    disabled: control.disabled,
    hidden: control.hidden,
    quality: scene.dataset.quality,
    ready: scene.dataset.ready === 'true',
    route: scene.dataset.route,
    page: document.body.dataset.page,
    travel: scene.dataset.travel,
    camera: scene.dataset.camera,
    phase: scene.dataset.phase,
    y: scrollY,
    paints: window.__quality?.paints,
    callbacks: window.__quality?.callbacks,
    documentHidden: document.hidden,
    h1: document.querySelectorAll('h1').length,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}
async function storeMotionPrecondition(page, evidence) {
  await page.evaluate((evidence) => (window.__scrollMotionPrecondition = evidence), evidence);
}
async function liveScrollPrecondition(page) {
  const before = await page.evaluate(motionState),
    evidence = { group: 'scroll-sync', before, resumed: false, steps: [], status: 'unchanged' };
  await storeMotionPrecondition(page, evidence);
  if (before.quality !== 'still' || before.label !== 'Motion: still (device)') return evidence;
  try {
    await settledCamera(page);
    evidence.hold = await page.evaluate(() => window.__engineCameraSettling);
    assert.equal(
      evidence.hold.policy,
      'adaptive-hold',
      'only an explicit visible device hold may resume'
    );
    assert.equal(before.h1, 1);
    assert.equal(before.overflow, false, 'held content remains readable');
    evidence.status = 'resuming';
    await storeMotionPrecondition(page, evidence);
    await page.locator('#space-motion').evaluate((el) => el.click());
    const off = await page.evaluate(motionState);
    evidence.steps.push({ action: 'public-off', state: off });
    await storeMotionPrecondition(page, evidence);
    assert.equal(off.label, 'Motion: off');
    assert.equal(off.pressed, 'false');
    await page.locator('#space-motion').evaluate((el) => el.click());
    const on = await page.evaluate(motionState);
    evidence.steps.push({ action: 'public-on', state: on });
    await storeMotionPrecondition(page, evidence);
    assert.equal(on.label, 'Motion: on');
    assert.equal(on.pressed, 'true');
    await settledCamera(page);
    evidence.live = await page.evaluate(() => window.__engineCameraSettling);
    const after = await page.evaluate(motionState);
    evidence.after = after;
    assert.equal(
      evidence.live.policy,
      'live',
      'public resume must produce actual live phase changes'
    );
    assert.equal(after.label, 'Motion: on');
    assert.equal(after.pressed, 'true');
    assert.equal(after.y, before.y, 'public resume preserves the native reading position');
    evidence.resumed = true;
    evidence.status = 'live';
    await storeMotionPrecondition(page, evidence);
    return evidence;
  } catch (error) {
    evidence.status = 'failed';
    evidence.error = error.message;
    await storeMotionPrecondition(page, evidence).catch(() => {});
    throw error;
  }
}
async function writingGestures(page) {
  await page.waitForFunction(
    () => document.querySelector('.space-scene').dataset.travel === 'settled',
    null,
    { polling: 50, timeout: 4000 }
  );
  const single = await page.evaluate(() => {
    const groups = new Map();
    for (const row of document.querySelectorAll('li.publication')) {
      const key = [row.dataset.topic, row.dataset.year, row.dataset.language].join('/');
      groups.set(key, (groups.get(key) || 0) + 1);
    }
    return [...groups].find(([, count]) => count === 1)?.[0].split('/');
  });
  assert.ok(single, 'one-record filter fixture');
  const observations = [];
  for (const filter of [null, single]) {
    if (filter)
      for (const [i, key] of ['topic', 'year', 'language'].entries())
        await page.locator('#archive-' + key).selectOption(filter[i]);
    if (filter) assert.equal(await page.locator('li.publication:visible').count(), 1);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    // Distinct paints prove the scene keeps breathing at its steady route view.
    const start = await settledCamera(page),
      phase = await page.locator('.space-scene').getAttribute('data-phase');
    for (const y of [100, 200, 400]) {
      await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
      const next = await settledCamera(page);
      assert.equal(next, start, 'Writing scroll keeps its route camera at ' + y);
      observations.push({ filter: filter ? 'single' : 'all', y, camera: next });
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(
      (start) => document.querySelector('.space-scene').dataset.camera === start,
      start,
      { polling: 50, timeout: 2000 }
    );
    assert.notEqual(
      await page.locator('.space-scene').getAttribute('data-phase'),
      phase,
      'ambient advances during first gestures'
    );
  }
  await page.locator('.filter-reset').evaluate((el) => el.click());
  for (const [key, value] of [
    ['topic', 'delivery'],
    ['year', '2025'],
    ['language', 'uk'],
  ])
    await page.locator('#archive-' + key).selectOption(value);
  assert.equal(await page.locator('li.publication:visible').count(), 0);
  const empty = await settledCamera(page),
    phase = await page.locator('.space-scene').getAttribute('data-phase');
  await page.waitForFunction(
    (phase) => document.querySelector('.space-scene').dataset.phase !== phase,
    phase,
    { polling: 50, timeout: 1500 }
  );
  assert.equal(await camera(page), empty, 'empty archive keeps camera and breathes');
  await page.locator('.filter-reset').evaluate((el) => el.click());
  return observations;
}
async function snapshotPin(page, url) {
  await page.goto(url + '/index.html');
  await page.locator('#space-motion').evaluate((el) => {
    if (el.textContent === 'Motion: on') el.click();
  });
  const fetched = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'fetch') fetched.push(new URL(request.url()).pathname);
  });
  await page.waitForTimeout(180);
  assert.deepEqual(fetched, [], 'no idle revision polling');
  await move(page, 'research');
  assert.equal(
    fetched.filter((x) => x === new URL('site-revision.json', url + '/').pathname).length,
    1
  );
  assert.ok(fetched.some((x) => /\/snapshots\/[a-f0-9]{64}\/research.html$/.test(x)));
  await page.route('**/site-revision.json', (route) =>
    route.fulfill({ status: 503, body: 'revision changed after pin' })
  );
  await move(page, 'writing');
  await move(page, 'research');
  assert.equal(
    fetched.filter((x) => x === new URL('site-revision.json', url + '/').pathname).length,
    1,
    'pinned revision is reused'
  );
  assert.equal(
    fetched.filter((x) => x.endsWith('/research.html')).length,
    1,
    'verified cached route is reused'
  );
  await page.unroute('**/site-revision.json');
}
async function boundedFallback(page, url, kind, suffix = '') {
  await page.goto(url + '/index.html');
  await page.evaluate(() => (window.__engineDocument = true));
  let faults = 0;
  const pattern = kind === 'revision' ? '**/site-revision.json' : '**/snapshots/**/research.html';
  await page.route(pattern, async (route) => {
    const response = await route.fetch();
    faults++;
    if (kind === 'revision') {
      const data = await response.json();
      data.engine = '0'.repeat(64);
      await route.fulfill({ response, json: data });
    } else
      await route.fulfill({ response, body: (await response.text()) + '<!-- wrong bytes -->' });
  });
  const requested = new URL('research.html' + suffix, url + '/');
  await page.locator('header a[href="research.html"]').evaluate((link, href) => {
    link.href = href;
    link.click();
  }, requested.href);
  await page.waitForURL((actual) => matchesRoute(actual.href, requested.href));
  await page.waitForFunction(
    () => document.body.dataset.page === 'research' && window.__engineDocument === undefined,
    null,
    { polling: 50, timeout: 6000 }
  );
  assert.equal(faults, 1, 'one failed snapshot read then native document');
  await page.waitForTimeout(180);
  assert.equal(faults, 1, 'no reload loop');
  await page.unroute(pattern);
}
async function fetchFallback(page, url, suffix = '') {
  await page.goto(url + '/index.html');
  await page.evaluate(() => (window.__engineDocument = true));
  let faults = 0;
  const pattern = '**/snapshots/**/research.html';
  await page.route(pattern, (route) => {
    if (route.request().resourceType() === 'fetch') {
      faults++;
      return route.fulfill({
        status: 503,
        contentType: 'text/plain',
        body: 'Controlled unavailable route',
      });
    }
    return route.continue();
  });
  const requested = new URL('research.html' + suffix, url + '/');
  await page.locator('header a[href="research.html"]').evaluate((link, href) => {
    link.href = href;
    link.click();
  }, requested.href);
  await page.waitForURL((actual) => matchesRoute(actual.href, requested.href));
  await page.waitForFunction(
    () => document.body.dataset.page === 'research' && window.__engineDocument === undefined
  );
  assert.equal(faults, 1, 'one failed snapshot read');
  await page.waitForTimeout(180);
  assert.equal(faults, 1, 'no reload loop');
  await page.unroute(pattern);
}
async function offline(browser, scenario) {
  const ctx = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.width === 390 ? 844 : 900 },
    }),
    page = await ctx.newPage(),
    errors = [],
    requests = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => requests.push(r.url()));
  page.setDefaultTimeout(6000);
  const producer = require('../build_site_previews.cjs'),
    root = path.resolve(__dirname, '../..');
  try {
    for (const entry of routes) {
      const file = path.join(root, 'review', producer.interactiveFilename(entry));
      assert.ok(fs.existsSync(file));
      requests.length = 0;
      await page.goto(pathToFileURL(file).href);
      await page.waitForFunction(
        () => window.SiteNavigation && document.querySelector('#site-content'),
        null,
        { polling: 50, timeout: 4000 }
      );
      await page.locator('#space-motion').evaluate((el) => {
        if (el.textContent === 'Motion: off') el.click();
      });
      await require('./scroll-browser.cjs').probe(page, 'offline-entry', entry);
      await page.locator('#space-motion').evaluate((el) => {
        if (el.textContent === 'Motion: on') el.click();
      });
      await page.evaluate(() => {
        window.__offlineShell = document.querySelector('header');
        window.__offlineCanvas = document.querySelector('canvas');
      });
      for (const id of routes) {
        const href = producer.interactiveFilename(id);
        await page
          .locator(`a[href="${href}"]`)
          .first()
          .evaluate((el) => el.click());
        await ready(page, id);
        assert.equal(
          await page.evaluate(
            () =>
              document.querySelector('header') === window.__offlineShell &&
              document.querySelector('canvas') === window.__offlineCanvas
          ),
          true
        );
      }
      await page.goBack();
      await ready(page, 'talks');
      await page.goForward();
      await ready(page, 'credits');
      await page.reload();
      await ready(page, 'credits');
      assert.deepEqual(
        requests.filter((x) => /^https?:/.test(x)),
        [],
        'offline network independence'
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await ctx.close();
  }
}
module.exports = {
  writingGestures,
  settledCamera,
  cameraSettlingSample,
  motionState,
  liveScrollPrecondition,
  snapshotPin,
  boundedFallback,
  fetchFallback,
  offline,
};
