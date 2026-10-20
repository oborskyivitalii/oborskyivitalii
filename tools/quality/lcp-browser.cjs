'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createRequire } = require('node:module');
const { parseArgs } = require('node:util');
const { gzipSync } = require('node:zlib');
const cp = require('node:child_process');
const diagnostic = require('./lcp-diagnostic.cjs');
const { digest } = require('./artifact.cjs');
const { canonicalType } = require('./serve.cjs');
const common = require('./common.cjs');

const SDK = 'https://static.cloudflareinsights.com/beacon.min.js';
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function deadline(work, ms, label) {
  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(work),
      new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(Error(label + ' deadline')), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function fixture(artifact, control) {
  const portrait = Object.keys(artifact.files).find((name) =>
    name.endsWith('/vitalii-oborskyi-cutout.webp')
  );
  assertInput(portrait, 'missing calibration portrait');
  // Explicit synthetic input, never a modified production rendition.
  return Buffer.from(
    '<!doctype html><meta charset="utf-8"><title>Controlled LCP calibration</title>' +
      '<h1>LCP calibration</h1><img width="780" height="721" fetchpriority="high" src="/' +
      portrait +
      '">' +
      (control === 'main-thread-stall'
        ? '<script>const until=performance.now()+2000;while(performance.now()<until){}</script>'
        : '')
  );
}

function assertInput(condition, message) {
  if (!condition) throw Error(message);
}

function loadSDK(file, metadata) {
  if (!file && !metadata) return null;
  assertInput(file && metadata, 'SDK needs captured bytes and retrieval metadata');
  const bytes = fs.readFileSync(file);
  const record = JSON.parse(fs.readFileSync(metadata, 'utf8'));
  assertInput(
    record.url === SDK && record.sha256 === digest(bytes) && record.bytes === bytes.length,
    'SDK retrieval metadata/bytes mismatch'
  );
  return { ...record, body: bytes };
}

async function installRoutes(context, artifact, sdk, mode, control, observed, wait = pause) {
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    const plan = diagnostic.requestPlan(url, request.method(), artifact);
    if (plan.kind === 'telemetry') {
      observed.beacons.push({
        path: new URL(url).pathname,
        body: request.postData() || '',
        receivedAt: Date.now(),
      });
      await route.fulfill({ status: 204 });
      return;
    }
    if (plan.kind === 'sdk') {
      if (!sdk || mode === 'blocked') {
        observed.sdkRequests.push({ action: 'blocked' });
        await route.abort();
      } else {
        if (mode === 'delayed') await wait(5000);
        observed.sdkRequests.push({ action: 'fulfilled', sha256: digest(sdk.body) });
        await route.fulfill({ contentType: 'text/javascript', body: sdk.body });
      }
      return;
    }
    if (plan.kind === 'artifact') {
      if (control === 'resource-delay' && plan.file.endsWith('/vitalii-oborskyi-cutout.webp'))
        await pause(2000);
      const body =
        control && plan.file === 'index.html'
          ? fixture(artifact, control)
          : artifact.files[plan.file];
      observed.served.push({
        file: plan.file,
        sha256: digest(body),
        synthetic: Boolean(control && plan.file === 'index.html'),
      });
      await route.fulfill({
        status: 200,
        contentType: canonicalType(plan.file),
        body,
        headers: { 'Cache-Control': 'no-store' },
      });
      return;
    }
    observed.unexpectedRequests.push({ url, method: request.method() });
    await route.abort();
  });
}

async function startTrace(cdp) {
  await cdp.send('Tracing.start', {
    categories: 'devtools.timeline,blink.user_timing,loading',
    transferMode: 'ReturnAsStream',
  });
}

async function finishTrace(cdp, file, budgetMs = 15000) {
  let completed;
  let active = true;
  const finished = new Promise((resolve) => {
    completed = resolve;
    cdp.once('Tracing.tracingComplete', completed);
  });
  try {
    return await deadline(
      async () => {
        const [, { stream }] = await Promise.all([cdp.send('Tracing.end'), finished]);
        const chunks = [];
        let size = 0;
        try {
          for (;;) {
            assertInput(active, 'Trace deadline expired');
            const part = await cdp.send('IO.read', { handle: stream });
            assertInput(active, 'Trace deadline expired');
            const bytes = Buffer.from(part.data, part.base64Encoded ? 'base64' : 'utf8');
            size += bytes.length;
            assertInput(size <= 64 * 1024 * 1024, 'bounded trace exceeded 64MiB');
            chunks.push(bytes);
            if (part.eof) break;
          }
        } finally {
          if (active) await cdp.send('IO.close', { handle: stream });
        }
        assertInput(active, 'Trace deadline expired');
        const bytes = gzipSync(Buffer.concat(chunks));
        fs.writeFileSync(file, bytes);
        return { file: path.basename(file), sha256: digest(bytes), bytes: bytes.length };
      },
      budgetMs,
      'Trace end/read/close'
    );
  } finally {
    active = false;
    cdp.removeListener('Tracing.tracingComplete', completed);
  }
}

async function observe(browser, artifact, sdk, options) {
  let context;
  const row = {
    scenario: options.scenario,
    trial: options.trial,
    control: options.control || null,
    mode: options.mode || 'blocked',
    beacons: [],
    sdkRequests: [],
    served: [],
    unexpectedRequests: [],
    snapshots: [],
    consoleErrors: [],
    cache: 'disabled by routing; not warm',
    telemetryForwarded: false,
    initialWindowMs: options.windowMs,
  };
  let cdp;
  let tracing = false;
  try {
    context = await deadline(
      () =>
        browser.newContext({
          viewport: { width: 1440, height: 900 },
          deviceScaleFactor: 1,
          colorScheme: 'light',
          serviceWorkers: 'block',
        }),
      options.observationBudgetMs || 15000,
      'Context creation'
    );
    await deadline(
      async () => {
        await installRoutes(context, artifact, sdk, row.mode, row.control, row);
        await context.addInitScript(diagnostic.observeDocument);
        const page = await context.newPage();
        page.setDefaultTimeout(12000);
        page.on('pageerror', (error) => row.consoleErrors.push(error.message));
        cdp = await context.newCDPSession(page);
        await cdp.send('Network.enable');
        await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
        if (options.trace) {
          await startTrace(cdp);
          tracing = true;
        }
        const begun = Date.now();
        await page.goto(artifact.origin + options.entry, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });
        await pause(Math.max(0, options.windowMs - (Date.now() - begun)));
        const take = async (phase) => {
          const snapshot = await page.evaluate(() => window.__siteLCPDiagnostic());
          row.snapshots.push({ phase, snapshot, analysis: diagnostic.analyze(snapshot) });
        };
        await take('initial');
        if (options.journey) {
          for (const destination of ['research', 'writing', 'index']) {
            await page.locator('.site-header a[href="' + destination + '.html"]').click();
            await page.waitForFunction(
              (route) =>
                document.body.dataset.page === route &&
                document.querySelector('.space-scene')?.dataset.travel !== 'flying',
              destination
            );
            await pause(1300);
            await take(destination);
          }
          await page.goBack({ waitUntil: 'domcontentloaded' });
          await pause(4500);
          await take('back');
          await page.goForward({ waitUntil: 'domcontentloaded' });
          await pause(4500);
          await take('forward');
        }
        // Attempt real tab hiding; headless may stay visible. Record the observed
        // state instead of dispatching a synthetic visibility event or assuming flush.
        const second = await context.newPage();
        await second.bringToFront();
        await pause(800);
        row.finalVisibility = await page.evaluate(() => document.visibilityState);
        await take('final');
        row.snapshot = row.snapshots[0].snapshot;
        if (row.control === 'missing-timing') {
          row.originalSnapshot = row.snapshot;
          row.snapshot = {
            ...row.snapshot,
            navigation: null,
            resources: [],
            syntheticTimingOmission: true,
          };
        }
        row.analysis = diagnostic.analyze(row.snapshot);
        row.sdkPayloads = diagnostic.sdkPayloads(row.beacons);
      },
      options.observationBudgetMs || options.windowMs + 30000 + (options.journey ? 60000 : 0),
      'Observation'
    );
  } catch (error) {
    row.error = error.stack;
  } finally {
    try {
      if (tracing)
        row.trace = await finishTrace(
          cdp,
          path.join(options.output, options.scenario + '-' + options.trial + '.trace.json.gz'),
          options.traceBudgetMs || 15000
        );
    } catch (error) {
      row.error ||= error.stack;
      row.traceError = error.message;
    } finally {
      try {
        if (context)
          await deadline(() => context.close(), options.cleanupBudgetMs || 5000, 'Context cleanup');
      } catch (error) {
        row.error ||= error.stack;
        row.cleanupError = error.message;
      }
    }
  }
  return structuredClone(row);
}

function summarize(rows) {
  return rows.map((row) => ({
    scenario: row.scenario,
    trial: row.trial,
    mode: row.mode,
    control: row.control,
    error: row.error || null,
    analysis: row.analysis,
    unexpectedRequests: row.unexpectedRequests.length,
    sdkRequests: row.sdkRequests,
    beacons: row.beacons.length,
    finalVisibility: row.finalVisibility,
    consoleErrors: row.consoleErrors,
    initialWindowMs: row.initialWindowMs,
    trace: row.trace || null,
    traceError: row.traceError || null,
    cleanupError: row.cleanupError || null,
  }));
}

async function collectTrials(scenarios, observeTrial, retain) {
  const planned = [];
  for (let trial = 1; trial <= 3; trial++)
    for (const scenario of trial === 2 ? [...scenarios].reverse() : scenarios)
      planned.push({ ...scenario, trial });
  for (const [index, scenario] of planned.entries()) {
    const row = await observeTrial(scenario);
    await retain(row, planned.slice(index + 1));
    // A timed-out operation may still own a live context. Never overlap it with
    // another measurement; run() now enters owned-browser disposal immediately.
    assertInput(!row.error, 'Trial failed; remaining scenarios not executed');
  }
}

async function run(options) {
  const artifact = diagnostic.loadArtifact(options.public, options.archive, options.package);
  const sdk = loadSDK(options.sdk, options['sdk-metadata']);
  assertInput(['calibration', 'routes', 'sdk'].includes(options.suite), 'unknown diagnostic suite');
  assertInput(
    options.suite !== 'sdk' || sdk,
    'Real SDK bytes required; do not replace them with a stub'
  );
  const output = path.resolve(options.output);
  const root = path.resolve(__dirname, '../..');
  assertInput(
    !output.startsWith(root + path.sep) && output !== root,
    'private reports must be outside checkout'
  );
  fs.mkdirSync(output, { recursive: true });
  const canonicalOutput = fs.realpathSync(output),
    canonicalRoot = fs.realpathSync(root);
  assertInput(
    canonicalOutput !== canonicalRoot && !canonicalOutput.startsWith(canonicalRoot + path.sep),
    'private report destination resolves inside checkout'
  );
  const playwrightRequire = createRequire(path.join(path.resolve(options.tools), 'package.json'));
  const { chromium } = playwrightRequire('playwright');
  const launchArgs = ['--no-sandbox', '--disable-dev-shm-usage'];
  const server = await chromium.launchServer({
    headless: true,
    ...(options.chrome ? { executablePath: options.chrome } : {}),
    args: launchArgs,
  });
  let browser;
  try {
    browser = await chromium.connect(server.wsEndpoint(), { timeout: 15000 });
  } catch (error) {
    await closeOwnedBrowser(null, server);
    throw error;
  }
  const report = {
    schema: 1,
    kind: 'home-lcp-diagnostic',
    suite: options.suite,
    sourceCommit: artifact.archive.sourceCommit,
    sourceTree: artifact.archive.sourceTree,
    archivePackageSHA256: artifact.archive.packageDigest,
    publicDigest: artifact.archive.publicDigest,
    collectorSHA256: digest(fs.readFileSync(require.resolve('./lcp-diagnostic.cjs'))),
    runnerSHA256: digest(fs.readFileSync(__filename)),
    diagnosticCommit: cp
      .execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' })
      .trim(),
    diagnosticDirty: Boolean(
      cp.execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim()
    ),
    environment: {
      ...common.environment(),
      browser: browser.version(),
      playwright: playwrightRequire('playwright/package.json').version,
      requestedExecutable: options.chrome || chromium.executablePath(),
      nativePlatform: os.platform(),
      headless: true,
      launchArgs,
    },
    profile: {
      width: 1440,
      height: 900,
      dpr: 1,
      cpuRate: 1,
      network: 'production-origin replay; no real CDN',
      cache: 'disabled by routing',
      initialWindowMs: options.suite === 'calibration' ? 5000 : options.windowMs,
      requestedWindowMs: options.windowMs,
      trials: 3,
    },
    sdk: sdk ? { url: sdk.url, sha256: sdk.sha256, bytes: sdk.bytes } : null,
    rows: [],
    unexecuted: [],
    fullGate: false,
    performanceAcceptance: false,
    productionEligible: false,
    telemetryForwarded: false,
    artifactUnchangedAfter: false,
  };
  const save = () =>
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  try {
    let scenarios;
    if (options.suite === 'calibration')
      scenarios = ['baseline', 'resource-delay', 'main-thread-stall', 'missing-timing'].map(
        (control) => ({
          scenario: control,
          control,
          entry: '/',
          windowMs: 5000,
          trace: control === 'baseline' || control === 'main-thread-stall',
        })
      );
    if (options.suite === 'routes')
      scenarios = ['/', '/index.html', '/research.html', '/writing.html'].map((entry) => ({
        scenario: entry === '/' ? 'root' : entry.slice(1, -5),
        entry,
        windowMs: options.windowMs,
        trace: entry === '/',
      }));
    if (options.suite === 'sdk')
      scenarios = ['normal', 'delayed', 'blocked'].map((mode) => ({
        scenario: 'sdk-' + mode,
        mode,
        entry: '/',
        windowMs: options.windowMs,
        journey: true,
        trace: mode === 'normal',
      }));
    // Balanced order; never parallelize benchmarks or discard a failed trial.
    await collectTrials(
      scenarios,
      (scenario) => observe(browser, artifact, sdk, { ...scenario, output }),
      async (row, remaining) => {
        report.rows.push(row);
        report.unexecuted = remaining;
        save();
        process.stdout.write(JSON.stringify(summarize([row])[0]) + '\n');
      }
    );
    if (options.suite === 'calibration')
      report.calibration = diagnostic.validateCalibration(report.rows);
    report.collectionComplete =
      report.rows.length === scenarios.length * 3 &&
      report.rows.every((row) => !row.error && !row.unexpectedRequests.length);
    if (options.suite === 'sdk')
      report.sdkExecution = report.rows.map((row) => ({
        scenario: row.scenario,
        trial: row.trial,
        confirmed:
          row.mode === 'blocked'
            ? false
            : row.beacons.length > 0 && row.sdkRequests.some((item) => item.sha256 === sdk.sha256),
        status:
          row.mode === 'blocked'
            ? 'intentionally-blocked'
            : row.beacons.length
              ? 'observed'
              : 'inconclusive',
      }));
    diagnostic.loadArtifact(options.public, options.archive, options.package);
    report.artifactUnchangedAfter = true;
  } catch (error) {
    report.collectionComplete = false;
    report.error = error.stack;
    throw error;
  } finally {
    try {
      await closeOwnedBrowser(browser, server);
    } catch (error) {
      report.collectionComplete = false;
      report.cleanupError = error.message;
    }
    save();
  }
  return report;
}

async function closeOwnedBrowser(browser, server, budgetMs = 5000) {
  const errors = [];
  try {
    if (browser) await deadline(() => browser.close(), budgetMs, 'Browser cleanup');
  } catch (error) {
    errors.push(error);
  }
  try {
    await deadline(() => server.close(), budgetMs, 'Owned browser process cleanup');
  } catch (error) {
    errors.push(error);
  }
  if (errors.length) {
    const child = server.process();
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise((resolve) => child.once('exit', resolve));
      child.kill('SIGKILL');
      await deadline(() => exited, budgetMs, 'Owned browser process exit');
    }
    throw new AggregateError(errors, errors.map((error) => error.message).join('; '));
  }
}

async function main() {
  const { values } = parseArgs({
    options: Object.fromEntries(
      [
        'suite',
        'public',
        'archive',
        'package',
        'sdk',
        'sdk-metadata',
        'tools',
        'chrome',
        'output',
        'window-ms',
      ].map((key) => [key, { type: 'string' }])
    ),
  });
  for (const key of ['suite', 'public', 'archive', 'package', 'output'])
    assertInput(values[key], 'Missing --' + key);
  values.tools ||= path.resolve(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain'));
  values.windowMs = Number(values['window-ms'] || 10000);
  assertInput(
    Number.isInteger(values.windowMs) && values.windowMs >= 5000 && values.windowMs <= 30000,
    'Observation window must be 5000–30000 ms'
  );
  const report = await run(values);
  if (!report.collectionComplete) process.exitCode = 1;
}

if (require.main === module)
  main().catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = {
  fixture,
  loadSDK,
  installRoutes,
  finishTrace,
  closeOwnedBrowser,
  observe,
  collectTrials,
  summarize,
  run,
};
