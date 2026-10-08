'use strict';
// Six balanced repetitions of one Writing diagnosis, not the release matrix.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http'),
  zlib = require('node:zlib');
const { toolRequire, launchOptions, environment, variant } = require('./common.cjs');
const { installProbe, summarize } = require('./motion.cjs'),
  artifact = require('./artifact.cjs'),
  { transition } = require('./validate.cjs');
const labels = ['pr23-base', 'current-base', 'current-color'];
const orders = [
  labels,
  [...labels].reverse(),
  [labels[1], labels[2], labels[0]],
  [labels[0], labels[2], labels[1]],
  [labels[2], labels[0], labels[1]],
  [labels[1], labels[0], labels[2]],
];
const profile = { width: 390, height: 844, deviceScaleFactor: 3, cpuRate: 4, theme: 'dark' };
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
};
function serve(inputs) {
  const files = new Map();
  for (const [label, input] of Object.entries(inputs))
    for (const row of artifact.entries(input.publicDir))
      files.set('/' + label + '/' + row.path, {
        bytes: zlib.gzipSync(row.bytes),
        type: types[path.extname(row.path)] || 'application/octet-stream',
      });
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1'),
      name = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname,
      item = files.get(name);
    if (!item) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      'Content-Type': item.type,
      'Content-Encoding': 'gzip',
      'Content-Length': item.bytes.length,
      'Cache-Control': 'no-store',
    });
    res.end(item.bytes);
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () =>
      resolve({ server, url: 'http://127.0.0.1:' + server.address().port })
    )
  );
}
function initialize({ theme = 'dark', contentFlight = true, fineStages = false } = {}) {
  localStorage.setItem('vo.theme', theme);
  localStorage.setItem('vo.content-flight', contentFlight ? 'on' : 'off');
  if (fineStages) window.SiteEngineStages = true;
  window.__writingReady = null;
  const observer = new MutationObserver(() => {
    if (
      window.__writingReady === null &&
      document.querySelector('.space-scene')?.dataset.ready === 'true'
    ) {
      window.__writingReady = performance.now();
      observer.disconnect();
    }
  });
  observer.observe(document, { subtree: true, attributes: true, attributeFilter: ['data-ready'] });
}
async function open(settings = profile, options = {}) {
  const browser = await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
  const context = await browser.newContext({
    viewport: { width: settings.width, height: settings.height },
    deviceScaleFactor: settings.deviceScaleFactor,
    serviceWorkers: 'block',
  });
  await context.addInitScript(installProbe);
  await context.addInitScript(initialize, { theme: settings.theme, ...options });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: settings.cpuRate });
  return { browser, context, page, cdp, errors };
}
async function ready(page, route) {
  await page.waitForFunction(
    (route) =>
      document.body.dataset.page === route &&
      document.querySelector('.space-scene')?.dataset.ready === 'true' &&
      !document.querySelector('#site-content').hasAttribute('aria-busy') &&
      document.querySelector('.space-scene').dataset.travel === 'settled',
    route,
    { polling: 40, timeout: 10000 }
  );
}
async function reset(page) {
  await page.evaluate(() => {
    window.__qualityMotion.frames = [];
    window.__qualityMotion.longTasks = [];
    window.__qualityMotion.events = [];
    window.__qualityStart = performance.now();
  });
}
async function measure(page, kind) {
  const raw = await page.evaluate(() => {
    const start = window.__qualityStart || 0,
      end = performance.now(),
      scene = document.querySelector('.space-scene');
    return {
      ...window.__qualityMotion,
      start,
      end,
      elapsed: end - start,
      state: scene.dataset.state,
      quality: scene.dataset.quality,
      cadence: scene.dataset.cadence,
    };
  });
  const row = summarize(raw, kind);
  assert.ok(row.paints > 0, 'positive actual Canvas paints');
  assert.equal(row.state, 'active');
  return { ...row, events: raw.events };
}
async function boot(url) {
  const { browser, page, errors } = await open();
  try {
    await page.goto(url + '/writing.html', { waitUntil: 'domcontentloaded' });
    await ready(page, 'writing');
    await page.waitForFunction(
      () => window.__qualityMotion.frames.filter((frame) => frame.painted).length >= 3,
      null,
      { polling: 20, timeout: 6000 }
    );
    const startup = await measure(page, 'cold-boot');
    const timing = await page.evaluate(() => ({
      sceneReadyMs: window.__writingReady,
      domReadyMs: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,
      fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
      publications: document.querySelectorAll('li.publication').length,
      engine: document.querySelector('meta[name="site-engine"]')?.content || null,
    }));
    assert.equal(timing.publications, 27);
    assert.ok(Number.isFinite(timing.sceneReadyMs));
    await reset(page);
    const before = await page.locator('.space-scene').getAttribute('data-camera');
    await page.evaluate(() => scrollTo({ top: 100, behavior: 'instant' }));
    await page.waitForTimeout(450);
    const after = await page.locator('.space-scene').getAttribute('data-camera');
    assert.notEqual(after, before, 'first Writing gesture moves the camera');
    await page.evaluate(() => scrollTo({ top: 200, behavior: 'instant' }));
    await page.waitForTimeout(450);
    const firstScroll = await measure(page, 'first-scroll');
    assert.deepEqual(errors, []);
    return { timing, startup, firstScroll, errors, browser: browser.version() };
  } finally {
    await browser.close();
  }
}
async function flights(url) {
  const { browser, page, errors } = await open(),
    rows = [];
  try {
    await page.goto(url + '/research.html', { waitUntil: 'domcontentloaded' });
    await ready(page, 'research');
    await page.waitForTimeout(300);
    for (const to of ['writing', 'research', 'writing']) {
      const from = await page.locator('body').getAttribute('data-page');
      await reset(page);
      await page.evaluate(
        (to) => document.querySelector('.site-header a[href="' + to + '.html"]').click(),
        to
      );
      await ready(page, to);
      const row = { from, to, ...(await measure(page, 'flight')) };
      try {
        transition(row);
        row.budgetPass = true;
      } catch (error) {
        row.budgetPass = false;
        row.budgetError = error.message;
      }
      rows.push(row);
    }
    assert.equal(rows[0].transitionPhase, 'cold', 'first Writing entry must build its cold model');
    assert.equal(rows[2].transitionPhase, 'warm', 'return must reuse the Writing model');
    assert.deepEqual(errors, []);
    return { rows, errors };
  } finally {
    await browser.close();
  }
}
function stats(values) {
  const v = [...values].sort((a, b) => a - b);
  return { median: (v[2] + v[3]) / 2, min: v[0], max: v.at(-1), values };
}
function aggregate(rows) {
  return Object.fromEntries(
    labels.map((label) => {
      const set = rows.filter((row) => row.label === label);
      if (set.length !== 6 || set.some((row) => row.error))
        return [label, { complete: false, trials: set.length }];
      const metric = (fn) => stats(set.map(fn));
      return [
        label,
        {
          complete: true,
          trials: set.length,
          sceneReadyMs: metric((r) => r.boot.timing.sceneReadyMs),
          bootPaintMaxMs: metric((r) => r.boot.startup.paintCallbackMs.max),
          bootPreparationMaxMs: metric((r) => r.boot.startup.preparationMs.max),
          firstScrollP95Ms: metric((r) => r.boot.firstScroll.paintCallbackMs.p95),
          coldWritingP95Ms: metric((r) => r.navigation.rows[0].paintCallbackMs.p95),
          coldWritingMaxMs: metric((r) => r.navigation.rows[0].paintCallbackMs.max),
          coldWritingReadyMs: metric((r) => r.navigation.rows[0].readyMs),
          coldWritingPreparationMaxMs: metric((r) => r.navigation.rows[0].preparationMs.max),
          warmWritingP95Ms: metric((r) => r.navigation.rows[2].paintCallbackMs.p95),
          coldFailures: set.filter((r) => !r.navigation.rows[0].budgetPass).length,
          warmFailures: set.filter((r) => !r.navigation.rows[2].budgetPass).length,
        },
      ];
    })
  );
}
async function main(inputRoot, output) {
  fs.mkdirSync(output, { recursive: true });
  const inputs = {};
  for (const label of labels) {
    const dir = path.join(inputRoot, label),
      manifest = JSON.parse(fs.readFileSync(path.join(dir, 'artifact.json'))),
      publicDir = path.join(dir, 'public');
    artifact.verify(publicDir, manifest);
    assert.equal(manifest.sourceDirty, false);
    assert.equal(manifest.sourceCommit, manifest.candidateCommit);
    inputs[label] = { publicDir, manifest, variant: variant(manifest) };
  }
  assert.equal(inputs['pr23-base'].manifest.sourceCommit, process.env.WRITING_REFERENCE_SHA);
  for (const label of ['current-base', 'current-color'])
    assert.equal(inputs[label].manifest.sourceCommit, process.env.SITE_CANDIDATE_SHA);
  assert.equal(
    inputs['current-color'].manifest.derivation.baseArtifactDigest,
    inputs['current-base'].manifest.artifactDigest
  );
  assert.deepEqual(
    labels.map((label) => inputs[label].variant.id),
    ['base', 'base', 'color']
  );
  const { server, url } = await serve(inputs),
    record = {
      schema: 1,
      kind: 'writing-cold-comparison',
      fullGate: false,
      environment: environment(),
      profile,
      orders,
      budgets: require('./budgets.json').motion.transition,
      protocol:
        'Six balanced serial rounds; new Chromium process/context per cold boot and per cold-entry itinerary; browser cache disabled; identical loopback gzip serving; no tracing or fine-stage probe. CPU x4 is synthetic. Retain every trial and every budget failure. No hosted/native-device or release acceptance.',
      identities: Object.fromEntries(
        labels.map((label) => [label, { ...inputs[label].manifest, files: undefined }])
      ),
      rows: [],
    };
  const save = () => {
    record.summary = aggregate(record.rows);
    fs.writeFileSync(path.join(output, 'comparison.json'), JSON.stringify(record, null, 2) + '\n');
  };
  try {
    for (let round = 0; round < orders.length; round++)
      for (const label of orders[round]) {
        const row = { round, label };
        record.rows.push(row);
        try {
          row.boot = await boot(url + '/' + label);
          row.navigation = await flights(url + '/' + label);
        } catch (error) {
          row.error = error.stack;
        }
        save();
        console.log(
          JSON.stringify({
            round,
            label,
            error: row.error || null,
            coldP95: row.navigation?.rows[0].paintCallbackMs.p95,
            coldPass: row.navigation?.rows[0].budgetPass,
          })
        );
      }
    record.complete = record.rows.length === 18 && record.rows.every((row) => !row.error);
    save();
    assert.ok(record.complete, 'incomplete Writing comparison; see all retained trials');
  } finally {
    server.close();
  }
}
if (require.main === module)
  main(path.resolve(process.argv[2]), path.resolve(process.argv[3])).catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = { aggregate, orders, serve, open, ready, reset, measure };
