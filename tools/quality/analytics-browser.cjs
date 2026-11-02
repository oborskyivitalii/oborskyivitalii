'use strict';
// Enabled source fixture with a stubbed vendor. Never sends real visitor data.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  cp = require('node:child_process'),
  { pathToFileURL } = require('node:url');
const { root } = require('./common.cjs'),
  { routes } = require('../site/snapshot.cjs');
const qaIsolation = require('./analytics-isolation.cjs');
const model = 'enabled source fixture; vendor stubbed';
const primaryCount = require('../site/validate-catalog.cjs').writingEntries(
  require('../site/content.cjs').catalog(root)
).length;
const settings = {
  schema: 1,
  provider: 'cloudflare',
  enabled: true,
  siteURL: 'https://analytics.example.com/author/',
  token: 'a'.repeat(32),
  searchConsoleVerification: null,
};
const modes = ['enabled', 'blocked', 'delayed', 'staging', 'offline'];
const checks = [
  'fiveRoutes',
  'persistentShell',
  'history',
  'reload',
  'archive',
  'oneVendorPerDocument',
  'originIsolation',
  'offlineIsolation',
];

async function isolationJourney(browser) {
  // A local network sink owns every request, including the ordinary contrast.
  // Use the actual adapter with a fake token; never contact the real provider.
  const origin = 'https://analytics.example.com';
  const collector = qaIsolation.collector;
  const factory = require('../../site/integrations/cloudflare.cjs');
  const options = {
    origin,
    pathnames: [
      '/author/',
      '/author/index.html',
      '/author/writing.html',
      '/author/articles/fixture.html',
    ],
    token: 'a'.repeat(32),
  };
  const adapter = '(' + factory.toString() + ')(' + JSON.stringify(options) + ');';
  const documents = new Set(
    options.pathnames.flatMap((name) =>
      name.endsWith('.html') ? [name, name.slice(0, -5)] : [name]
    )
  );
  const undeclared = [
    '/author/articles/unknown.html',
    '/author/articles/fixture/',
    '/author/snapshots/fixture.html',
  ];
  const observations = [];
  for (const isolated of [true, false]) {
    const isolation = [];
    const allowed = [];
    let vendors = 0;
    const fixtureBrowser = {
      async newContext(contextOptions) {
        const context = await browser.newContext(contextOptions);
        await context.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          if (qaIsolation.collectorRequest(url)) {
            allowed.push(url.href);
            await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
          } else if (url.href === 'https://static.cloudflareinsights.com/beacon.min.js') {
            vendors++;
            await route.fulfill({
              contentType: 'text/javascript',
              body: 'window.__vendorFixtureLoads=(window.__vendorFixtureLoads||0)+1;',
            });
          } else if (
            url.origin === origin &&
            (documents.has(url.pathname) || undeclared.includes(url.pathname))
          ) {
            await route.fulfill({
              contentType: 'text/html',
              body:
                '<!doctype html><title>QA isolation fixture</title><h1>Fixture</h1>' +
                '<script>' +
                adapter +
                adapter +
                '</script>',
            });
          } else await route.abort('blockedbyclient');
        });
        return context;
      },
    };
    const context = isolated
      ? await qaIsolation.createContext(fixtureBrowser, {}, isolation)
      : await fixtureBrowser.newContext({ serviceWorkers: 'block' });
    const outcomes = [];
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(6000);
      page.setDefaultNavigationTimeout(30000);
      const emit = async () => {
        await page.waitForFunction(() => window.__vendorFixtureLoads === 1);
        assert.equal(await page.locator('#site-cloudflare-beacon').count(), 1);
        outcomes.push(
          await page.evaluate(async (url) => {
            try {
              await fetch(url, { method: 'POST', body: 'synthetic', credentials: 'omit' });
              return 'allowed-to-fixture';
            } catch {
              return 'blocked';
            }
          }, collector + '?fixture=qa')
        );
      };
      await page.goto(origin + '/author/index?entry=alias#content');
      await emit();
      await page.evaluate(() => history.pushState({}, '', 'writing?tag=systems'));
      await emit();
      await page.reload();
      await emit();
      await page.evaluate(() => history.pushState({}, '', '?tag=delivery'));
      await page.goBack();
      await emit();
      await page.goForward();
      await emit();
      await page.goto(origin + '/author/articles/fixture.html');
      await emit();
      assert.equal(vendors, 3, 'one SDK for each of three documents, none for history');
      assert.deepEqual(outcomes, Array(6).fill(isolated ? 'blocked' : 'allowed-to-fixture'));
      assert.equal(
        allowed.length,
        isolated ? 0 : 6,
        'collector cannot leak or suppress next context'
      );
      if (isolated) {
        qaIsolation.validate(isolation);
        assert.equal(isolation[0].blocked, 6, 'every attempted fixture beacon intercepted');
      }
      await page.goto(origin + '/author/articles/fixture?entry=alias');
      await page.waitForFunction(() => window.__vendorFixtureLoads === 1);
      assert.equal(vendors, 4, 'declared article alias loads one SDK');
      for (const pathname of undeclared) {
        await page.goto(origin + pathname);
        assert.equal(await page.locator('#site-cloudflare-beacon').count(), 0);
      }
      assert.equal(vendors, 4, 'undeclared article/snapshot variants cannot start the SDK');
      observations.push({
        isolated,
        vendors,
        attempted: outcomes.length,
        allowedToFixture: allowed.length,
        isolation,
        outcomes,
        undeclaredRejected: undeclared,
      });
    } finally {
      await context.close();
    }
  }
  return {
    model: 'actual adapter; vendor stub and local network sink',
    pass: true,
    observations,
    liveTelemetryValidated: false,
  };
}
function cases(engine) {
  return [
    ...routes.map((entry) => ({ engine, entry, mode: 'enabled' })),
    { engine, entry: 'index', mode: 'blocked' },
    { engine, entry: 'index', mode: 'delayed' },
    { engine, entry: 'index', mode: 'staging' },
    ...routes.map((entry) => ({ engine, entry, mode: 'offline' })),
  ];
}
async function ready(page, id) {
  await page.waitForFunction(
    (id) =>
      document.body.dataset.page === id &&
      !document.querySelector('#site-content').hasAttribute('aria-busy'),
    id,
    { polling: 40, timeout: 6000 }
  );
}
async function navigate(page, id, producer, offline) {
  const href = offline ? producer.interactiveFilename(id) : id === 'index' ? './' : id + '.html';
  await page
    .locator(`a[href="${href}"]`)
    .first()
    .evaluate((el) => el.click());
  await ready(page, id);
}
async function vendorState(page, mode) {
  if (['staging', 'offline'].includes(mode)) {
    assert.equal(await page.locator('#site-cloudflare-beacon').count(), 0);
    return;
  }
  await page.waitForFunction(
    (status) =>
      document
        .querySelector('#site-cloudflare-beacon')
        ?.getAttribute('data-site-analytics-status') === status,
    mode === 'blocked' ? 'blocked' : mode === 'delayed' ? 'loading' : 'loaded',
    { polling: 40, timeout: 6000 }
  );
  assert.equal(await page.locator('#site-cloudflare-beacon').count(), 1);
  assert.equal(
    await page.evaluate(() => window.__vendorFixtureLoads || 0),
    ['blocked', 'delayed'].includes(mode) ? 0 : 1
  );
}
async function scenario(browser, dir, producer, s) {
  const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    }),
    page = await ctx.newPage(),
    errors = [],
    requests = [],
    vendor = [],
    unexpected = [];
  page.setDefaultTimeout(6000);
  // Navigation uses the existing runner's 30s bound; readiness/SDK checks keep 6s.
  page.setDefaultNavigationTimeout(30000);
  const result = {
    ...s,
    model,
    pass: false,
    checks: {},
    errors,
    vendorRequests: vendor,
    externalRequests: unexpected,
  };
  const origin =
    s.mode === 'staging' ? 'https://staging.example.com' : 'https://analytics.example.com';
  const prefix = origin + '/author/';
  let releaseVendor;
  const vendorGate = new Promise((resolve) => (releaseVendor = resolve));
  if (s.mode !== 'delayed') releaseVendor();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await ctx.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.href === 'https://static.cloudflareinsights.com/beacon.min.js') {
      vendor.push(url.href);
      if (s.mode === 'blocked') await route.abort('failed');
      else {
        await vendorGate;
        await route.fulfill({
          contentType: 'text/javascript',
          body: 'window.__vendorFixtureLoads=(window.__vendorFixtureLoads||0)+1;',
        });
      }
    } else if (url.href.startsWith(prefix)) {
      const name = decodeURIComponent(url.pathname.slice('/author/'.length)) || 'index.html',
        filename = routes.includes(name) ? name + '.html' : name,
        target = path.join(dir, 'docs', filename);
      assert.ok(!name.includes('..'), 'finite fixture path');
      if (!fs.existsSync(target)) {
        await route.fulfill({ status: 404, body: 'Missing fixture resource' });
        return;
      }
      const types = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
      };
      await route.fulfill({
        contentType: types[path.extname(filename)] || 'application/octet-stream',
        body: fs.readFileSync(target),
      });
    } else if (url.protocol === 'file:') await route.continue();
    else {
      unexpected.push(url.origin);
      await route.abort('failed');
    }
  });
  try {
    const url =
      s.mode === 'offline'
        ? pathToFileURL(path.join(dir, 'review', producer.interactiveFilename(s.entry))).href
        : prefix + s.entry + '.html';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await ready(page, s.entry);
    await vendorState(page, s.mode);
    if (s.mode === 'enabled') {
      for (const [index, entry] of entryRoutes(s.entry).entries()) {
        if (index > 0) {
          vendor.length = 0;
          await page.goto(prefix + entry + '.html', { waitUntil: 'domcontentloaded' });
          await ready(page, entry);
          await vendorState(page, s.mode);
        }
        assert.equal(vendor.length, 1, entry + ' canonical entry loads one vendor');
        vendor.length = 0;
        await page.goto(prefix + entry + '?entry=alias#content', {
          waitUntil: 'domcontentloaded',
        });
        await ready(page, entry);
        await vendorState(page, s.mode);
        assert.equal(vendor.length, 1, entry + ' extensionless entry loads one vendor');
      }
      result.entryForms = ['canonical', 'extensionless'];
      result.entryRoutes = entryRoutes(s.entry);
    }
    await page.evaluate(() => {
      window.__analyticsShell = {
        header: document.querySelector('header'),
        canvas: document.querySelector('canvas'),
      };
    });
    for (const id of routes) {
      await navigate(page, id, producer, s.mode === 'offline');
      assert.equal(
        await page.evaluate(
          () =>
            document.querySelector('header') === window.__analyticsShell.header &&
            document.querySelector('canvas') === window.__analyticsShell.canvas
        ),
        true
      );
      if (id === 'writing') {
        await page.locator('#archive-topic').selectOption('systems');
        assert.ok((await page.locator('#archive-results li.publication:visible').count()) > 0);
        await page.locator('.filter-reset').evaluate((el) => el.click());
        assert.equal(
          await page.locator('#archive-results li.publication:visible').count(),
          primaryCount
        );
      }
      await vendorState(page, s.mode);
    }
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await ready(page, 'talks');
    await page.goForward({ waitUntil: 'domcontentloaded' });
    await ready(page, 'credits');
    await vendorState(page, s.mode);
    assert.equal(
      vendor.length,
      ['staging', 'offline'].includes(s.mode) ? 0 : 1,
      'one vendor request in a persistent document'
    );
    result.readyWhileSDKPending = s.mode === 'delayed' ? true : 'not applicable';
    releaseVendor();
    if (s.mode === 'delayed') await vendorState(page, 'enabled');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await ready(page, 'credits');
    await vendorState(page, s.mode === 'delayed' ? 'enabled' : s.mode);
    assert.equal(
      vendor.length,
      ['staging', 'offline'].includes(s.mode) ? 0 : 2,
      'one vendor request after full reload'
    );
    assert.deepEqual(
      requests.filter(
        (url) =>
          /^https?:/.test(url) &&
          !url.startsWith(prefix) &&
          url !== 'https://static.cloudflareinsights.com/beacon.min.js'
      ),
      []
    );
    if (s.mode === 'offline')
      assert.deepEqual(
        requests.filter((url) => /^https?:/.test(url)),
        []
      );
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpected, []);
    result.checks = Object.fromEntries(checks.map((key) => [key, true]));
    result.pass = true;
  } catch (error) {
    result.error = error.message;
    result.stack = error.stack;
  } finally {
    releaseVendor();
    await ctx.close();
  }
  return result;
}
function selectedCases(engine, selection = cases(engine)) {
  const owned = cases(engine),
    ids = selection.map((row) => JSON.stringify(row));
  assert.ok(ids.length > 0, 'empty analytics fixture selection');
  assert.equal(new Set(ids).size, ids.length, 'duplicate analytics fixture selection');
  for (const row of selection)
    assert.ok(
      owned.some((expected) => JSON.stringify(expected) === JSON.stringify(row)),
      'unowned analytics fixture selection'
    );
  return selection;
}
function entryRoutes(entry) {
  return entry === 'writing'
    ? ['writing', ...routes.filter((id) => !['index', 'writing'].includes(id))]
    : [entry];
}
function validateEntryForms(row) {
  assert.deepEqual(
    row.entryForms,
    row.mode === 'enabled' ? ['canonical', 'extensionless'] : undefined,
    'missing or invalid analytics entry-form evidence'
  );
  assert.deepEqual(
    row.entryRoutes,
    row.mode === 'enabled' ? entryRoutes(row.entry) : undefined,
    'missing or invalid analytics entry-route evidence'
  );
}
function fixtureInputs(sourceRoot = root) {
  const inputs = [
    'site',
    'tools/site',
    'tools/build_scene_fallbacks.cjs',
    'tools/build_site_previews.cjs',
  ];
  const legalModule = path.join(sourceRoot, 'tools/site/legal.cjs');
  if (fs.existsSync(legalModule)) {
    assert.ok(
      fs.lstatSync(legalModule).isFile() && !fs.lstatSync(legalModule).isSymbolicLink(),
      'regular legal producer required'
    );
    const owners = Object.values(require(legalModule).sources);
    assert.ok(owners.length > 0 && owners.length <= 16, 'bounded declared legal owners required');
    assert.equal(new Set(owners).size, owners.length, 'duplicate declared legal owner');
    for (const name of owners) {
      assert.ok(
        typeof name === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(name),
        'root legal owner path required'
      );
      const file = path.join(sourceRoot, name);
      assert.ok(
        fs.lstatSync(file).isFile() && !fs.lstatSync(file).isSymbolicLink(),
        'regular declared legal owner required'
      );
      inputs.push(name);
    }
  }
  return inputs;
}

function buildFixture(dir, sourceRoot = root) {
  const inputs = fixtureInputs(sourceRoot);
  // Accepted articles keep their frozen commit objects while all fixture writes
  // remain isolated. Validate declared legal owners before creating any output.
  if (fs.existsSync(path.join(sourceRoot, '.git'))) {
    cp.execFileSync('git', ['clone', '--shared', '--no-checkout', '--quiet', sourceRoot, dir], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }
  if (fs.existsSync(path.join(sourceRoot, 'tools/publishing'))) {
    inputs.push('tools/publishing', 'tools/quality/artifact.cjs', 'tools/quality/budgets.json');
  }
  for (const name of inputs) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.cpSync(path.join(sourceRoot, name), path.join(dir, name), { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'site/analytics.json'), JSON.stringify(settings, null, 2) + '\n');
  require(path.join(sourceRoot, 'tools/site/build.cjs')).build({ root: dir, all: true });
  const producer = require(path.join(dir, 'tools/build_site_previews.cjs'));
  for (const [name, bytes] of Object.entries(producer.buildPreviews())) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), bytes);
  }
  return producer;
}

async function run(browser, engine, selection = cases(engine)) {
  const selected = selectedCases(engine, selection);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-analytics-browser-'));
  try {
    const producer = buildFixture(dir);
    const rows = [];
    for (const s of selected) {
      rows.push(await scenario(browser, dir, producer, s));
      process.stdout.write(
        `analytics fixture ${engine} ${s.entry} ${s.mode}: ${rows.at(-1).pass ? 'pass' : rows.at(-1).error}\n`
      );
    }
    return rows;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
module.exports = {
  isolationJourney,
  run,
  cases,
  selectedCases,
  validateEntryForms,
  entryRoutes,
  checks,
  modes,
  model,
  fixtureInputs,
  buildFixture,
};
if (require.main === module)
  (async () => {
    const { toolRequire, launchOptions, save } = require('./common.cjs'),
      engine = 'chromium',
      browser = await toolRequire('playwright')[engine].launch(launchOptions(engine));
    try {
      const rows = await run(browser, engine);
      save('analytics-fixture', {
        model,
        browser: browser.version(),
        rows,
        liveTelemetryValidated: false,
      });
      assert.ok(
        rows.every((row) => row.pass),
        'Analytics fixture failed'
      );
    } finally {
      await browser.close();
    }
  })().catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
