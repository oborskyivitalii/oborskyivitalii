'use strict';
// Deliberate ordinary live observations; never release or performance admission.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { performance } = require('node:perf_hooks');
const artifact = require('./artifact.cjs');
const { collectorRequest } = require('./analytics-isolation.cjs');
const { toolRequire, launchOptions, environment } = require('./common.cjs');
const browserIdentity = require('./local-browser.cjs');

const origin = require('../release/edition.cjs').origin;
const sdkURL = 'https://static.cloudflareinsights.com/beacon.min.js';
const limits = Object.freeze({
  attachedMs: 6000,
  costMs: 6000,
  samplingUs: 1000,
  events: 800,
});
const phaseNames = Object.freeze(['forward-after-mount', 'forward-after-settled', 'sdk-cost']);

function target(record, source) {
  assert.equal(record.origin, origin, 'fixed canonical production origin required');
  assert.equal(record.sourceCommit, source, 'production source lease changed');
  assert.equal(record.public.sourceCommit, source);
  assert.equal(record.public.candidateCommit, source);
  assert.equal(record.public.sourceTree, record.sourceTree);
  assert.equal(record.public.artifactDigest, record.publicDigest);
  assert.match(record.sourceCommit, /^[a-f0-9]{40}$/);
  assert.match(record.publicDigest, /^[a-f0-9]{64}$/);
  assert.equal(record.public.sourceDirty, false);
  for (const route of ['index', 'writing', 'talks'])
    assert.ok(record.public.files[route + '.html'], 'missing declared room ' + route);
  return record.public;
}

function cpuSummary(profile) {
  assert.ok(Array.isArray(profile.nodes) && profile.nodes.length > 0, 'missing CPU nodes');
  assert.ok(Array.isArray(profile.samples) && profile.samples.length > 0, 'missing CPU samples');
  assert.equal(profile.samples.length, profile.timeDeltas?.length, 'incomplete CPU sample timing');
  assert.ok(
    Number.isFinite(profile.startTime) &&
      Number.isFinite(profile.endTime) &&
      profile.endTime > profile.startTime,
    'missing CPU observation duration'
  );
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  assert.equal(nodes.size, profile.nodes.length, 'duplicate CPU node');
  const parents = new Map();
  for (const node of profile.nodes)
    for (const child of node.children || []) {
      assert.ok(nodes.has(child), 'unknown CPU child');
      assert.ok(!parents.has(child), 'ambiguous CPU parent');
      parents.set(child, node.id);
    }
  let exclusiveUs = 0;
  let inclusiveUs = 0;
  let matchingSamples = 0;
  let sampledUs = 0;
  for (let i = 0; i < profile.samples.length; i++) {
    const id = profile.samples[i];
    const delta = profile.timeDeltas[i];
    assert.ok(nodes.has(id), 'unknown CPU sample');
    assert.ok(Number.isFinite(delta) && delta >= 0, 'invalid CPU sample delta');
    sampledUs += delta;
    let cursor = id;
    let matching = false;
    const seen = new Set();
    while (cursor !== undefined) {
      assert.ok(!seen.has(cursor), 'cyclic CPU profile');
      seen.add(cursor);
      if (nodes.get(cursor).callFrame?.url === sdkURL) matching = true;
      cursor = parents.get(cursor);
    }
    if (nodes.get(id).callFrame?.url === sdkURL) exclusiveUs += delta;
    if (matching) {
      inclusiveUs += delta;
      matchingSamples++;
    }
  }
  assert.ok(sampledUs <= profile.endTime - profile.startTime, 'CPU samples exceed observation');
  return {
    samplingIntervalUs: limits.samplingUs,
    durationUs: profile.endTime - profile.startTime,
    samples: profile.samples.length,
    sampledUs,
    matchingSamples,
    sdkExclusiveSampledMs: exclusiveUs / 1000,
    sdkInclusiveSampledMs: inclusiveUs / 1000,
    interpretation: matchingSamples
      ? 'Sampled execution attribution, not exact CPU accounting or an SDK budget pass.'
      : 'SDK execution unresolved at this sampling granularity; not zero cost.',
  };
}

function instrument({ maximum, transitions = true }) {
  const events = [];
  let dropped = 0;
  function snapshot() {
    return {
      timeMs: performance.now(),
      epochMs: Date.now(),
      path: location.pathname + location.search + location.hash,
      page: document.body?.dataset.page || null,
      engine: document.querySelector('meta[name="site-engine"]')?.content || null,
      variant: document.querySelector('meta[name="site-variant"]')?.content || 'base',
      routeVersion: document.querySelector('meta[name="site-route"]')?.content || null,
      busy: document.getElementById('site-content')?.hasAttribute('aria-busy') ?? null,
      loaderCount: document.querySelectorAll('script[data-site-analytics]').length,
      sdk: [...document.querySelectorAll('script#site-cloudflare-beacon')].map((script) => ({
        src: script.src,
        status: script.getAttribute('data-site-analytics-status'),
      })),
    };
  }
  function mark(kind, detail = {}) {
    if (events.length >= maximum) dropped++;
    else events.push({ kind, ...snapshot(), ...detail });
  }
  window.__analyticsLive = { events, snapshot, mark, dropped: () => dropped };
  if (transitions)
    window.SiteEngineProbe = (event) => {
      if (['navigation-start', 'navigation-ready'].includes(event.kind))
        mark(event.kind, {
          runtimeTimeMs: event.time,
          navigationId: event.navigationId,
        });
    };
  window.addEventListener('popstate', () => mark('popstate'));
  window.addEventListener('site:page-mount', () => mark('page-mount'));
  window.addEventListener('DOMContentLoaded', () => {
    mark('document-ready');
    new MutationObserver(() => mark('state-change')).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-page', 'aria-busy'],
    });
  });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const probe = window.__analyticsLive;
    return {
      state: probe.snapshot(),
      events: probe.events,
      dropped: probe.dropped(),
    };
  });
}

async function ready(page, id, settled = true, timeout = limits.attachedMs) {
  await page.waitForFunction(
    ({ id, settled }) =>
      document.body.dataset.page === id &&
      (!settled ||
        (document.getElementById('site-content') &&
          !document.getElementById('site-content').hasAttribute('aria-busy'))),
    { id, settled },
    { polling: 20, timeout }
  );
}

function timing(result) {
  const events = result.capture?.events || [];
  const start = events.find((event) => event.kind === 'forward-request');
  assert.ok(start, 'missing Forward request timestamp');
  assert.ok(Number.isFinite(start.timeMs) && Number.isFinite(start.epochMs));
  const after = events.filter((event) => event.timeMs >= start.timeMs);
  const pop = after.find((event) => event.kind === 'popstate');
  const mount = after.find((event) => event.kind === 'page-mount' && event.page === 'talks');
  const settled = after.find(
    (event) => event.page === 'talks' && event.busy === false && event.timeMs >= mount?.timeMs
  );
  const ready = after.find((event) => event.kind === 'navigation-ready' && event.page === 'talks');
  assert.ok(pop && mount && settled && ready, 'incomplete Forward browser milestones');
  for (const event of [pop, mount, settled, ready])
    assert.ok(Number.isFinite(event.timeMs) && event.timeMs >= start.timeMs);
  assert.ok(
    pop.timeMs <= mount.timeMs && mount.timeMs <= ready.timeMs && ready.timeMs <= settled.timeMs,
    'invalid Forward milestone order'
  );
  return {
    requestedAtEpochMs: start.epochMs,
    issuedWhileBusy: start.busy,
    popstateMs: pop ? pop.timeMs - start.timeMs : null,
    mountedMs: mount ? mount.timeMs - start.timeMs : null,
    settledMs: settled ? settled.timeMs - start.timeMs : null,
    navigationReadyMs: ready.timeMs - start.timeMs,
    attachedWithin6000ms: Boolean(mount && mount.timeMs - start.timeMs <= limits.attachedMs),
  };
}

async function forward(page, result, afterSettled) {
  const settledMs = require('./transition-pacing.cjs').deadline();
  await page.goto(origin + '/index.html', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await ready(page, 'index', true, settledMs);
  await page.locator('.site-header nav a[href="writing.html"]').click();
  await ready(page, 'writing', true, settledMs);
  await page.locator('#archive-topic').selectOption('systems');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.locator('.site-header nav a[href="talks.html"]').click();
  await ready(page, 'talks', true, settledMs);
  await page.goBack({ waitUntil: 'commit', timeout: 30000 });
  await ready(page, 'writing', afterSettled, settledMs);
  await page.evaluate(() => window.__analyticsLive.mark('forward-request'));
  const started = performance.now();
  await page.goForward({ waitUntil: 'commit', timeout: limits.attachedMs });
  await ready(page, 'talks', false, Math.max(1, limits.attachedMs - (performance.now() - started)));
  result.attachedObservedMs = performance.now() - started;
  const remaining = settledMs - (performance.now() - started);
  await ready(page, 'talks', true, Math.max(1, remaining));
  result.settledObservedMs = performance.now() - started;
}

async function network(page, cdp, result, manifest) {
  const pending = [];
  const requests = new Set();
  result.network = {
    sdk: [],
    collectorRequests: 0,
    collectorResponses: [],
    failures: [],
    artifactResponses: [],
  };
  const checked = new Set();
  page.on('request', (request) => {
    if (collectorRequest(request.url())) result.network.collectorRequests++;
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url === sdkURL || collectorRequest(url) || new URL(url).origin === origin)
      result.network.failures.push({
        kind: url === sdkURL ? 'SDK' : collectorRequest(url) ? 'collector' : 'artifact',
        path: new URL(url).origin + new URL(url).pathname,
        error: request.failure()?.errorText || 'native request failed',
      });
  });
  page.on('response', (response) => {
    if (collectorRequest(response.url()))
      result.network.collectorResponses.push({
        status: response.status(),
        at: new Date().toISOString(),
      });
    if (new URL(response.url()).origin === origin && !collectorRequest(response.url()))
      pending.push(
        browserIdentity
          .verifyResponse(response, origin, manifest, checked)
          .then((observed) => {
            assert.equal(observed.observed, true, 'undeclared browser artifact response');
            result.network.artifactResponses.push(observed);
          })
          .catch((error) =>
            result.network.failures.push({ kind: 'artifact', error: error.message })
          )
      );
    if (response.url() === sdkURL)
      pending.push(
        response
          .body()
          .then((bytes) => {
            result.network.sdk.push({
              url: sdkURL,
              status: response.status(),
              decodedBytes: bytes.length,
              sha256: artifact.digest(bytes),
            });
          })
          .catch((error) =>
            result.network.failures.push({ kind: 'SDK-body', error: error.message })
          )
      );
  });
  cdp.on('Network.requestWillBeSent', (event) => {
    if (event.request.url === sdkURL) requests.add(event.requestId);
  });
  cdp.on('Network.responseReceived', (event) => {
    if (!requests.has(event.requestId)) return;
    result.sdkResponse = {
      status: event.response.status,
      fromDiskCache: event.response.fromDiskCache || false,
      fromServiceWorker: event.response.fromServiceWorker || false,
      fromPrefetchCache: event.response.fromPrefetchCache || false,
      protocol: event.response.protocol,
    };
  });
  cdp.on('Network.loadingFinished', (event) => {
    if (requests.has(event.requestId)) result.sdkEncodedDataLength = event.encodedDataLength;
  });
  await cdp.send('Network.enable');
  return async () => {
    let timer;
    try {
      await Promise.race([
        Promise.all(pending),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('SDK response body deadline')), limits.costMs);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
}

async function cost(page, cdp, result, output) {
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', {
    interval: limits.samplingUs,
  });
  await cdp.send('Profiler.start');
  const started = performance.now();
  result.profileStartedAt = new Date().toISOString();
  let primaryError;
  try {
    await page.goto(origin + '/index.html', {
      waitUntil: 'domcontentloaded',
      timeout: limits.costMs,
    });
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(0, limits.costMs - (performance.now() - started)))
    );
  } catch (error) {
    primaryError = error;
  } finally {
    try {
      const { profile } = await cdp.send('Profiler.stop');
      result.profileObservedMs = performance.now() - started;
      fs.writeFileSync(path.join(output, 'sdk-cpu-profile.json'), JSON.stringify(profile) + '\n');
      result.cpu = cpuSummary(profile);
    } catch (error) {
      result.diagnosticErrors.push({ kind: 'CPU-stop', error: error.message });
      primaryError ||= error;
    }
  }
  if (primaryError) throw primaryError;
}

function validatePhase(result) {
  assert.ok(phaseNames.includes(result.name), 'unknown live diagnostic phase');
  assert.equal(result.pass, true, 'diagnostic phase failed: ' + result.name);
  assert.equal(result.capture.dropped, 0, 'incomplete browser timeline');
  assert.equal(result.capture.state.sdk.length, 1, 'one SDK per ordinary document');
  assert.equal(result.capture.state.sdk[0].src, sdkURL);
  assert.equal(result.capture.state.sdk[0].status, 'loaded', 'real SDK did not load');
  assert.deepEqual(result.network.failures, []);
  assert.equal(result.network.sdk.length, 1, 'missing/duplicate actual SDK response');
  assert.equal(result.network.sdk[0].status, 200);
  assert.equal(result.network.sdk[0].url, sdkURL);
  assert.ok(result.network.sdk[0].decodedBytes > 0);
  assert.match(result.network.sdk[0].sha256, /^[a-f0-9]{64}$/);
  if (result.name === 'sdk-cost') {
    assert.ok(Number.isFinite(result.sdkEncodedDataLength) && result.sdkEncodedDataLength >= 0);
    assert.ok(result.cpu?.samples > 0, 'actual CPU profile required');
    assert.ok(result.sdkResponse, 'missing SDK cache/transport observation');
  } else {
    const observed = timing(result);
    assert.equal(
      observed.issuedWhileBusy,
      result.name === 'forward-after-mount',
      'Forward trial did not observe its declared starting condition'
    );
    assert.equal(observed.attachedWithin6000ms, true, 'Forward exceeded original attached bound');
    for (const key of ['attachedObservedMs', 'settledObservedMs'])
      assert.ok(Number.isFinite(result[key]) && result[key] >= 0, 'invalid ' + key);
    assert.ok(result.attachedObservedMs <= limits.attachedMs);
    assert.ok(result.settledObservedMs >= result.attachedObservedMs);
    assert.ok(observed.settledMs <= require('./transition-pacing.cjs').deadline());
    assert.ok(result.settledObservedMs <= require('./transition-pacing.cjs').deadline());
  }
  return true;
}

function validateBrowserIdentity(result, manifest) {
  const observed = result.capture.events.filter((event) =>
    ['document-ready', 'page-mount'].includes(event.kind)
  );
  observed.push(result.capture.state);
  const pages = new Set();
  for (const state of observed) {
    assert.ok(manifest.components.routes[state.page], 'undeclared mounted room');
    browserIdentity.verifyRuntimeIdentity(state, manifest, manifest.variant, state.page);
    assert.equal(
      state.routeVersion,
      manifest.components.routes[state.page].version,
      'mounted route version'
    );
    pages.add(state.page);
  }
  const required = result.name === 'sdk-cost' ? ['index'] : ['index', 'writing', 'talks'];
  for (const route of required) assert.ok(pages.has(route), 'missing mounted room ' + route);
  assert.ok(
    result.network.artifactResponses.some((row) => row.file === 'index.html' && row.sha256),
    'missing actual initial document bytes'
  );
  for (const state of observed) {
    const descriptor = manifest.components.routes[state.page];
    assert.ok(
      result.network.artifactResponses.some(
        (row) => row.sha256 && (row.file === state.page + '.html' || row.file === descriptor.url)
      ),
      'missing actual mounted room bytes ' + state.page
    );
  }
}

async function phase(browser, name, output, manifest) {
  const result = {
    name,
    pass: false,
    startedAt: new Date().toISOString(),
    diagnosticErrors: [],
  };
  let context;
  let page;
  let drain = async () => {};
  try {
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    await context.addInitScript(instrument, {
      maximum: limits.events,
      transitions: name !== 'sdk-cost',
    });
    page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    drain = await network(page, cdp, result, manifest);
    if (name === 'sdk-cost') await cost(page, cdp, result, output);
    else await forward(page, result, name === 'forward-after-settled');
    result.pass = true;
  } catch (error) {
    result.error = error.stack;
  } finally {
    // Capture before body draining, screenshots and cleanup can lose the failed state.
    if (page) {
      try {
        result.capture = await snapshot(page);
      } catch (error) {
        result.diagnosticErrors.push({ kind: 'capture', error: error.message });
      }
    }
    try {
      await drain();
    } catch (error) {
      result.diagnosticErrors.push({ kind: 'drain', error: error.message });
    }
    try {
      if (context) await context.close();
      result.contextClosed = true;
    } catch (error) {
      result.diagnosticErrors.push({ kind: 'close', error: error.message });
    }
    try {
      assert.deepEqual(result.diagnosticErrors, []);
      validatePhase(result);
      validateBrowserIdentity(result, manifest);
    } catch (error) {
      result.pass = false;
      result.validationError = error.message;
    }
    if (name !== 'sdk-cost' && result.capture) {
      try {
        result.timing = timing(result);
      } catch (error) {
        result.pass = false;
        result.diagnosticErrors.push({ kind: 'timing', error: error.message });
      }
    }
    result.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(output, name + '.json'), JSON.stringify(result, null, 2) + '\n');
  }
  return result;
}

async function main(directory, output) {
  const root = path.resolve(__dirname, '../..');
  assert.ok(
    path.resolve(output) !== root && !path.resolve(output).startsWith(root + path.sep),
    'reports outside source checkout'
  );
  fs.mkdirSync(output, { recursive: true });
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'archive.json')));
  const binding = JSON.parse(fs.readFileSync(path.join(directory, 'binding.json')));
  const manifest = target(record, binding.productionSource);
  const report = {
    schema: 1,
    kind: 'analytics-live-diagnostic',
    pass: false,
    fullGate: false,
    performanceAcceptance: false,
    deploymentAuthorized: false,
    target: {
      release: record.tag,
      sourceCommit: record.sourceCommit,
      artifactDigest: record.publicDigest,
    },
    collector: {
      commit: cp
        .execFileSync('git', ['rev-parse', 'HEAD'], {
          cwd: root,
          encoding: 'utf8',
        })
        .trim(),
      environment: environment(),
    },
    limits: {
      ...limits,
      settledMs: require('./transition-pacing.cjs').deadline(),
    },
    contextPolicy:
      'Three bounded deliberate ordinary contexts; real SDK/collector; no routing, cache override or payload capture.',
    rows: [],
    binding,
  };
  const save = () =>
    fs.writeFileSync(
      path.join(output, 'analytics-live.json'),
      JSON.stringify(report, null, 2) + '\n'
    );
  save();
  let browser;
  try {
    assert.equal(
      report.collector.commit,
      binding.collectorSource,
      'diagnostic source lease changed'
    );
    artifact.verify(path.join(directory, 'public'), manifest);
    report.before = await require('../quality/hosted.cjs').verify(origin, 'production', manifest);
    browser = await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
    report.browser = browser.version();
    for (const name of phaseNames) {
      const row = await phase(browser, name, output, manifest);
      report.rows.push(row);
      save();
      assert.equal(
        row.contextClosed,
        true,
        'uncertain context disposal; stop further live browsing'
      );
    }
    report.after = await require('../quality/hosted.cjs').verify(origin, 'production', manifest);
    assert.ok(
      report.rows.every((row) => row.pass),
      'one or more diagnostic phases failed'
    );
    report.pass = true;
  } catch (error) {
    report.error = error.stack;
  } finally {
    if (browser)
      await browser.close().catch((error) => {
        report.pass = false;
        report.cleanupError = error.message;
      });
    save();
  }
  assert.equal(report.pass, true, report.error);
}

if (require.main === module)
  main(...process.argv.slice(2)).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
module.exports = {
  target,
  cpuSummary,
  timing,
  validatePhase,
  validateBrowserIdentity,
  instrument,
  phase,
  main,
  limits,
  phaseNames,
  sdkURL,
};
