'use strict';
// A selected hosted regression profile. Full release evidence has a different contract.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const { pathToFileURL } = require('node:url');
const budgets = require('./budgets.json'),
  common = require('./common.cjs'),
  motion = require('./motion.cjs');
const routes = budgets.routes,
  engines = ['chromium', 'firefox'],
  widths = [1440, 390];
const failureModes = [
  'no-js',
  'no-raf',
  'no-match-media',
  'blocked-storage',
  'reduced',
  'missing-hasOwn',
  'css-delayed',
  'css-blocked',
  'draw-fault',
  'context-loss',
];
const performanceRoutes = ['research', 'writing'],
  flightDestinations = ['research', 'research', 'writing', 'writing'];
const themeByRoute = {
  index: 'light',
  research: 'dark',
  writing: 'light',
  talks: 'dark',
  credits: 'light',
};
function journeyCases() {
  return engines.flatMap((engine) =>
    widths
      .map((width) => ({ engine, width, mode: 'normal' }))
      .concat(
        engine === 'chromium' ? widths.map((width) => ({ engine, width, mode: 'no-canvas' })) : []
      )
  );
}
function navigationCases() {
  return [
    { engine: 'chromium', width: 1440, theme: 'light' },
    { engine: 'firefox', width: 390, theme: 'dark' },
  ];
}
function failureCases() {
  return failureModes.map((mode) => ({
    engine: 'chromium',
    route: 'index',
    width: 320,
    theme: 'light',
    mode,
  }));
}
function analyticsCases() {
  return [
    ['index', 'enabled'],
    ['writing', 'enabled'],
    ['index', 'blocked'],
    ['index', 'delayed'],
    ['index', 'staging'],
    ['index', 'offline'],
    ['writing', 'offline'],
  ].map(([entry, mode]) => ({ engine: 'chromium', entry, mode }));
}
function contract() {
  return {
    engines,
    routes,
    widths,
    normal_journeys: 4,
    normal_route_observations: 20,
    theme_by_route: themeByRoute,
    no_canvas_journeys: 2,
    no_canvas_route_observations: 10,
    navigation_rows: 2,
    navigation_cases: navigationCases(),
    failure_modes: failureModes,
    failure_rows: 10,
    failure_engine: 'chromium',
    failure_route: 'index',
    failure_width: 320,
    analytics_rows: 7,
    analytics_cases: analyticsCases(),
  };
}
function flightCases() {
  return performanceRoutes.flatMap((to) =>
    ['cold', 'warm'].map((phase) => ({ from: 'index', to, phase }))
  );
}
function performanceContract() {
  return {
    cpu_rate: 4,
    route_samples: performanceRoutes,
    flight_destinations: flightDestinations,
    flight_cases: flightCases(),
    flight_cold: 2,
    flight_warm: 2,
    lighthouse: performanceRoutes.map((route) => ({ route, form_factor: 'mobile', runs: 1 })),
  };
}
function registryCheck(registry = require('./test-profiles.json')) {
  const stage = registry.hosted_profiles.staging;
  assert.deepEqual(
    stage.functional,
    contract(),
    'staging registry differs from executed browser selection'
  );
  assert.deepEqual(
    stage.performance,
    performanceContract(),
    'staging registry differs from executed performance selection'
  );
  assert.deepEqual(stage.color, {
    kind: 'color-preview-smoke',
    engine: 'chromium',
    theme: 'light',
    widths,
    rows: 2,
  });
  assert.equal(stage.job_budget_minutes, 15);
  assert.equal(stage.full_gate, false);
  assert.deepEqual(stage.required_jobs, ['build', 'static', 'host', 'staging']);
  assert.deepEqual(stage.report_kinds, [
    'hosted',
    'lint',
    'security',
    'advisories',
    'stage-functional',
    'stage-performance',
  ]);
  return true;
}
function exactRows(rows, expected, keys, label) {
  assert.ok(Array.isArray(rows), `missing ${label}`);
  assert.equal(rows.length, expected.length, `incomplete ${label}`);
  const id = (row) => JSON.stringify(keys.map((key) => row[key])),
    ids = rows.map(id);
  assert.equal(new Set(ids).size, ids.length, `duplicate ${label}`);
  assert.deepEqual([...ids].sort(), expected.map(id).sort(), `unexpected ${label} selection`);
}
function stageReport(report, kind) {
  assert.equal(report.schema, 1);
  assert.equal(report.kind, kind);
  assert.equal(report.profile, 'staging');
  assert.equal(report.stageContract, 1);
  assert.equal(report.pass, true, report.error || `${kind} failed`);
  assert.equal(report.fullGate, false);
  assert.equal(report.productionEligible, false);
  assert.equal(report.environment?.platform, 'linux');
  assert.ok(
    Number.isFinite(report.elapsedMs) && report.elapsedMs > 0,
    'missing measured profile duration'
  );
  assert.ok(report.elapsedMs <= 15 * 60 * 1000, 'selected profile exceeded its active-job budget');
}
function clean(row, label) {
  assert.equal(row.pass, true, row.error || `${label} failed`);
  assert.deepEqual(row.errors, [], `${label} runtime errors`);
  assert.deepEqual(row.externalRequests, [], `${label} external requests`);
}
function validateFailure(row) {
  clean(row, 'capability fixture');
  const checks = row.checks,
    before = checks?.evidence?.before,
    after = checks?.evidence?.after;
  assert.ok(before && after, 'missing actual failure-state observations');
  for (const s of [before, after]) {
    assert.equal(s.h1, 1);
    assert.equal(s.overflow, false);
    assert.ok(Number.isInteger(s.paints) && s.paints >= 0);
    assert.ok(Number.isInteger(s.callbacks) && s.callbacks >= 0);
  }
  const fallback = ['no-js', 'no-raf', 'no-match-media', 'css-blocked'].includes(row.mode),
    frozen = fallback || ['reduced', 'draw-fault', 'context-loss'].includes(row.mode);
  if (frozen)
    for (const key of ['phase', 'camera', 'paints', 'callbacks'])
      assert.equal(after[key], before[key], `unsettled ${row.mode} ${key}`);
  if (fallback) {
    assert.equal(checks.fallback, true);
    for (const s of [before, after]) {
      assert.equal(s.ready, false);
      assert.equal(s.fallback, true);
      assert.equal(s.motion.hidden || s.motion.disabled, true);
      assert.equal(s.paints, 0);
      assert.equal(s.callbacks, 0);
    }
  } else if (row.mode === 'reduced') {
    assert.equal(checks.reducedFreeze, true);
    assert.equal(after.ready, true);
    assert.equal(after.motion.disabled, true);
    assert.match(after.motion.label, /reduced/);
  } else if (['draw-fault', 'context-loss'].includes(row.mode)) {
    assert.equal(checks.boundedFailure, true);
    assert.equal(checks.synthetic, true);
    assert.equal(after.ready, false);
    assert.equal(after.fallback, true);
    assert.equal(after.motion.disabled, true);
    assert.match(after.motion.label, /unavailable/);
  } else {
    assert.equal(checks.positiveProbe, true);
    assert.equal(after.ready, true);
    assert.ok(after.paints > before.paints, 'failure fixture did not observe an actual new paint');
  }
  if (row.mode === 'css-delayed') assert.equal(checks.beforeCSSNoPaint, true);
}
function validateJourney(journey, manifest) {
  const variant = common.variant(manifest);
  clean(journey, 'route journey');
  assert.equal(journey.history, true);
  assert.equal(journey.motionOff, journey.mode === 'normal');
  assert.deepEqual(
    journey.rows.map((row) => row.route),
    routes,
    'missing route observations'
  );
  exactRows(
    journey.served,
    routes.map((route) => ({ route })),
    ['route'],
    'served routes'
  );
  for (const served of journey.served) {
    assert.equal(served.status, 200);
    assert.equal(
      served.sha256,
      manifest.files[served.route + '.html'].sha256,
      'wrong served route identity'
    );
  }
  for (const row of journey.rows) {
    assert.equal(row.pass, true);
    assert.equal(row.state.page, row.route);
    assert.equal(row.state.h1, 1);
    assert.equal(row.state.overflow, false);
    assert.equal(row.state.engine, variant.fingerprint);
    assert.equal(row.state.variant, variant.id);
    assert.deepEqual(row.checks, [
      'exact identity',
      'heading',
      'viewport',
      'persistent shell',
      'theme control',
      journey.mode === 'normal' ? 'canvas active' : 'no-canvas fallback',
    ]);
    if (journey.mode === 'normal') {
      assert.equal(row.state.ready, true);
      assert.equal(row.state.fallback, false);
      if (row.route === 'writing') require('./flight-detail.cjs').validate(row.detail);
    } else {
      assert.equal(row.state.ready, false);
      assert.equal(row.state.fallback, true);
      assert.equal(row.state.motion.hidden || row.state.motion.disabled, true);
    }
  }
  for (const key of ['cta', 'localNavigation', 'history', 'directAnchor'])
    assert.equal(journey.discussion?.[key], true, 'missing discussion navigation smoke');
  assert.ok(
    Array.isArray(journey.verifiedResponses) && journey.verifiedResponses.length > 0,
    'unobserved browser responses'
  );
}
function validateNavigation(row) {
  const nav = require('./navigation.cjs');
  assert.equal(row.pass, true, row.error);
  assert.deepEqual(row.errors, []);
  for (const key of nav.checks) assert.equal(row.checks?.[key], true, 'missing navigation ' + key);
  assert.deepEqual(
    row.scrollArrivals?.map((s) => s.route),
    routes.slice(1)
  );
  for (const arrival of row.scrollArrivals) {
    assert.ok(Number.isFinite(arrival.end) && arrival.end >= 0);
    assert.deepEqual(
      arrival.samples.map((s) => s.fraction),
      [0.9, 0.95, 0.99, 1]
    );
    assert.equal(arrival.samples.at(-1).y, arrival.end);
    if (arrival.end > 100)
      for (let i = 1; i < arrival.samples.length; i++)
        assert.notEqual(
          arrival.samples[i].camera,
          arrival.samples[i - 1].camera,
          'post-arrival scroll plateau'
        );
  }
}
function validateAnalytics(row) {
  const analytics = require('./analytics-browser.cjs');
  clean(row, 'analytics fixture');
  assert.equal(row.model, analytics.model);
  for (const key of analytics.checks)
    assert.equal(row.checks?.[key], true, 'missing analytics ' + key);
  assert.equal(row.readyWhileSDKPending, row.mode === 'delayed' ? true : 'not applicable');
  assert.equal(row.vendorRequests?.length, ['staging', 'offline'].includes(row.mode) ? 0 : 2);
  for (const url of row.vendorRequests)
    assert.equal(url, 'https://static.cloudflareinsights.com/beacon.min.js');
}
function validateFunctional(report, manifest) {
  stageReport(report, 'stage-functional');
  assert.deepEqual(report.startupFailures, [], 'browser startup or collection failed');
  assert.deepEqual(report.selection, contract());
  exactRows(
    report.browsers,
    engines.map((engine) => ({ engine })),
    ['engine'],
    'browser engines'
  );
  for (const browser of report.browsers)
    assert.ok(browser.version && browser.executable, 'missing actual browser identity');
  exactRows(report.journeys, journeyCases(), ['engine', 'width', 'mode'], 'route journeys');
  for (const journey of report.journeys) validateJourney(journey, manifest);
  exactRows(report.navigation, navigationCases(), ['engine', 'width', 'theme'], 'navigation cases');
  for (const row of report.navigation) validateNavigation(row);
  exactRows(
    report.failures,
    failureCases(),
    ['engine', 'route', 'width', 'theme', 'mode'],
    'capability fixtures'
  );
  for (const row of report.failures) validateFailure(row);
  exactRows(report.analytics, analyticsCases(), ['engine', 'entry', 'mode'], 'analytics fixtures');
  for (const row of report.analytics) validateAnalytics(row);
  return {
    normalJourneys: 4,
    normalRouteObservations: 20,
    noCanvasJourneys: 2,
    noCanvasRouteObservations: 10,
    navigation: 2,
    failures: 10,
    analytics: 7,
  };
}
function validateMeasurement(row, kind, zero = false) {
  assert.equal(row.kind, kind);
  assert.equal(row.probeVersion, 2, 'missing raw motion probe');
  assert.ok(
    Number.isFinite(row.elapsedMs) &&
      row.elapsedMs >= (['idle', 'scroll'].includes(kind) ? 3900 : 900),
    'incomplete observed measurement window'
  );
  assert.ok(Number.isFinite(row.window?.startMs) && Number.isFinite(row.window?.endMs));
  assert.ok(
    Math.abs(row.window.endMs - row.window.startMs - row.elapsedMs) < 1e-8,
    'inconsistent measurement window'
  );
  assert.ok(
    Array.isArray(row.rawFrames) && Array.isArray(row.rawLongTasks),
    'missing raw motion records'
  );
  for (const [i, frame] of row.rawFrames.entries()) {
    assert.ok(
      Number.isFinite(frame.time) &&
        frame.time >= 0 &&
        Number.isFinite(frame.started) &&
        Number.isFinite(frame.duration) &&
        frame.duration >= 0 &&
        typeof frame.painted === 'boolean',
      'invalid raw callback'
    );
    assert.ok(
      frame.started >= row.window.startMs &&
        frame.started + frame.duration <= row.window.endMs + 1e-8,
      'callback outside observed window'
    );
    if (i)
      assert.ok(
        frame.time >= row.rawFrames[i - 1].time && frame.started >= row.rawFrames[i - 1].started,
        'unordered callback records'
      );
  }
  for (const task of row.rawLongTasks)
    assert.ok(
      Number.isFinite(task.start) &&
        Number.isFinite(task.duration) &&
        task.duration >= 0 &&
        task.start >= row.window.startMs &&
        task.start + task.duration <= row.window.endMs,
      'long task outside window'
    );
  const expected = motion.summarize(
    {
      schema: 2,
      start: row.window.startMs,
      end: row.window.endMs,
      elapsed: row.elapsedMs,
      frames: row.rawFrames,
      longTasks: row.rawLongTasks,
      events: [],
    },
    kind
  );
  for (const key of [
    'callbacks',
    'paints',
    'paintRateHz',
    'paintIntervalsMs',
    'paintCallbackMs',
    'callbackBusyPercent',
  ])
    assert.deepEqual(row[key], expected[key], 'declared ' + key + ' differs from actual samples');
  if (zero) {
    assert.equal(row.callbacks, 0, kind + ' callbacks');
    assert.equal(row.paints, 0, kind + ' paints');
    assert.match(
      row.motion,
      kind === 'off' ? /^Motion: off$/ : /^Motion: reduced$/,
      'zero work came from the wrong public motion mode'
    );
  } else {
    assert.ok(row.paints >= budgets.motion.minimumPaints, 'unobserved active motion');
    assert.notEqual(row.state, 'fallback');
  }
}
function validatePerformance(report) {
  stageReport(report, 'stage-performance');
  assert.deepEqual(report.selection, performanceContract());
  assert.equal(
    report.lighthouseAggregation,
    'single trial per selected route; not release medians'
  );
  assert.equal(report.soakPerformed, false);
  assert.equal(report.retentionCycles, 0);
  exactRows(
    report.samples,
    performanceRoutes.map((route) => ({ route, width: 390, rate: 4 })),
    ['route', 'width', 'rate'],
    'CPU samples'
  );
  for (const sample of report.samples) {
    assert.deepEqual(sample.errors, []);
    assert.equal(sample.positiveProbe, true);
    assert.equal(sample.measurements?.length, 4);
    for (const [i, kind] of ['idle', 'scroll', 'off', 'reduced'].entries()) {
      const row = sample.measurements[i];
      validateMeasurement(row, kind, i >= 2);
      if (i < 2)
        assert.ok(
          row.paintCallbackMs.p95 <= budgets.motion.paintCallbackP95Ms,
          'slow staging motion callback'
        );
      if (kind === 'idle')
        assert.ok(
          row.callbackBusyPercent <= budgets.motion.idleCallbackBusyPercent,
          'staging idle busy budget'
        );
    }
  }
  assert.equal(report.flights?.length, 4);
  assert.deepEqual(
    report.flights.map((row) => row.to),
    flightDestinations
  );
  assert.deepEqual(
    report.flights.map((row) => row.from),
    ['index', 'index', 'index', 'index']
  );
  for (const [i, row] of report.flights.entries()) validateFlight(row, flightCases()[i]);
  exactRows(
    report.lighthouse,
    performanceRoutes.map((route) => ({ route, formFactor: 'mobile', run: 1 })),
    ['route', 'formFactor', 'run'],
    'Lighthouse smoke trials'
  );
  for (const row of report.lighthouse) {
    assert.equal(row.configSettings?.formFactor, 'mobile');
    assert.equal(row.configSettings.throttlingMethod, 'simulate');
    assert.ok(!row.runtimeError, 'Lighthouse runtime error');
    assert.ok(
      row.lighthouseVersion && row.environment?.networkUserAgent && row.fetchTime,
      'missing actual Lighthouse environment'
    );
    for (const [group, values] of Object.entries(budgets.lighthouse.profiles.mobile))
      for (const [key, value] of Object.entries(values))
        assert.equal(
          row.configSettings[group]?.[key],
          value,
          'unexpected Lighthouse profile setting'
        );
    for (const [metric, limit] of Object.entries(budgets.lighthouse.mobile)) {
      const actual = row.metrics[metric]?.numericValue;
      assert.ok(
        Number.isFinite(actual) && actual >= 0 && actual <= limit,
        `${row.route} smoke ${metric}: ${actual} > ${limit}`
      );
    }
  }
  return {
    routeSamples: 2,
    measurementWindows: 8,
    flights: 4,
    coldFlights: 2,
    warmFlights: 2,
    lighthouseTrials: 2,
    soakSeconds: 0,
    retentionCycles: 0,
  };
}
function validateFlightSetup(setup, selected) {
  assert.equal(setup?.status, 'settled', 'unobserved settled flight setup');
  assert.equal(setup.destination, selected.to);
  assert.equal(setup.phase, selected.phase);
  assert.equal(setup.timeoutMs, 3000);
  assert.equal(setup.quietMs, 200);
  assert.ok(Array.isArray(setup.samples) && setup.samples.length > 0);
  const observed = setup.samples.at(-1);
  assert.ok(
    observed.elapsedMs >= setup.quietMs && observed.elapsedMs <= setup.timeoutMs,
    'unbounded setup observation'
  );
  assert.equal(observed.page, 'index');
  assert.equal(observed.sceneRoute, 'index');
  assert.equal(observed.travel, 'settled');
  assert.equal(observed.ready, true);
  assert.equal(observed.hidden, false);
  assert.equal(observed.motion, 'Motion: on');
  assert.ok(observed.paints >= 2, 'setup lacks actual live paints');
  assert.ok(
    observed.lastPreparationAgeMs >= setup.quietMs,
    'setup was still preparing models/layout'
  );
  assert.equal(
    observed.targetCached,
    selected.phase === 'warm',
    'unexpected actual destination cache state'
  );
}
function validateFlight(row, selected) {
  assert.equal(row.pass, true, row.error);
  assert.equal(row.from, selected.from);
  assert.equal(row.to, selected.to);
  assert.equal(row.width, 390);
  assert.equal(row.rate, 4);
  assert.deepEqual(row.errors, []);
  validateFlightSetup(row.setup, selected);
  validateMeasurement(row, 'flight');
  require('./validate.cjs').transition(row);
  assert.equal(row.transitionPhase, selected.phase, 'unobserved cold/warm flight phase');
  const targetModels = row.rawPreparation.filter(
    (sample) => sample.kind === 'model' && sample.route === selected.to
  );
  if (selected.phase === 'cold')
    assert.ok(
      targetModels.length > 0,
      'cold flight did not observe destination model construction'
    );
  else assert.equal(targetModels.length, 0, 'warm flight reconstructed its destination model');
}
function validateColor(report, manifest) {
  assert.equal(common.variant(manifest).id, 'color');
  assert.equal(report.kind, 'color-preview-smoke');
  assert.equal(report.pass, true);
  assert.equal(report.smoke, true);
  assert.equal(report.profile, 'preview');
  assert.equal(report.fullGate, false);
  exactRows(report.browsers, [{ engine: 'chromium' }], ['engine'], 'Color engines');
  assert.ok(report.browsers[0].version);
  exactRows(
    report.rows,
    widths.map((width) => ({ engine: 'chromium', width, theme: 'light' })),
    ['engine', 'width', 'theme'],
    'Color cases'
  );
  for (const row of report.rows) {
    assert.equal(row.pass, true, row.error);
    assert.equal(row.identity.id, 'color');
    assert.equal(row.identity.engine, common.variant(manifest).fingerprint);
    assert.equal(row.ribbons.count, '3');
    assert.equal(row.ribbons.material, 'opaque-rgb');
    assert.ok(row.ribbons.faces > 0);
    for (const key of [
      'shortenedHomeRange',
      'homeForwardEdge',
      'spatialFlight',
      'forwardEdge',
      'reverseNativeBottom',
      'disabledEdge',
      'creditsBoundary',
      'homeBoundary',
      'retiredReadingEffectAbsent',
    ])
      assert.equal(row.checks?.[key], true, 'missing Color ' + key);
    assert.ok(
      row.flight?.some((x) => x.plane.flightStage === 'depart' && Number(x.plane.flightDepth) > 0)
    );
    assert.ok(
      row.flight.some((x) => x.plane.flightStage === 'arrive' && Number(x.plane.flightDepth) < 0)
    );
  }
  return 2;
}
async function collectFunctional(url, manifest, helpers = {}) {
  const live = () => ({
    launch: (engine) =>
      common.toolRequire('playwright')[engine].launch(common.launchOptions(engine)),
    preview: require('./local-browser.cjs').scenario,
    nav: require('./navigation.cjs').scenario,
    failure: require('./functional.cjs').scenario,
    analytics: require('./analytics-browser.cjs').run,
  });
  const api = { ...(!helpers.launch ? live() : {}), ...helpers },
    variant = common.variant(manifest),
    started = performance.now();
  const detail = {
    profile: 'staging',
    stageContract: 1,
    fullGate: false,
    productionEligible: false,
    selection: contract(),
    browsers: [],
    journeys: [],
    navigation: [],
    failures: [],
    analytics: [],
    startupFailures: [],
  };
  for (const engine of engines) {
    let browser;
    try {
      browser = await api.launch(engine);
      detail.browsers.push({
        engine,
        version: browser.version(),
        executable: browser.executable || common.toolRequire('playwright')[engine].executablePath(),
      });
      for (const selected of journeyCases().filter((row) => row.engine === engine))
        detail.journeys.push({
          ...selected,
          ...(await api.preview(browser, url, manifest, variant, selected.width, selected.mode)),
        });
      for (const selected of navigationCases().filter((row) => row.engine === engine))
        detail.navigation.push(await api.nav(browser, url, selected));
      if (engine === 'chromium') {
        for (const selected of failureCases())
          detail.failures.push(await api.failure(browser, url, selected));
        detail.analytics.push(...(await api.analytics(browser, engine, analyticsCases())));
      }
    } catch (error) {
      detail.startupFailures.push({ engine, error: error.message });
    } finally {
      if (browser) await browser.close();
    }
  }
  detail.elapsedMs = performance.now() - started;
  return detail;
}
function flightSetupSample() {
  const probe = window.__stageFlightSetup,
    scene = document.querySelector('.space-scene'),
    events = window.__qualityMotion.events;
  const now = performance.now(),
    preparation = events.filter((event) => ['model', 'layout', 'route'].includes(event.kind));
  const rooms = window.SiteScene.diagnostics().rooms,
    lastPreparation = preparation.at(-1)?.time ?? probe.start;
  const sample = {
    elapsedMs: now - probe.start,
    page: document.body.dataset.page,
    sceneRoute: scene.dataset.route,
    travel: scene.dataset.travel,
    ready: scene.dataset.ready === 'true',
    hidden: document.hidden,
    motion: document.querySelector('#space-motion').textContent,
    paints: window.__qualityMotion.paints - probe.startPaints,
    lastPreparationAgeMs: now - lastPreparation,
    targetCached: rooms.some(
      (room) =>
        room.route === probe.destination && room.models.some((model) => model.compact === true)
    ),
  };
  probe.samples.push(sample);
  if (sample.elapsedMs > probe.timeoutMs) return false;
  const current =
    sample.page === 'index' &&
    sample.sceneRoute === 'index' &&
    sample.travel === 'settled' &&
    sample.ready &&
    !sample.hidden &&
    sample.motion === 'Motion: on';
  const observed =
    sample.elapsedMs >= probe.quietMs &&
    sample.paints >= 2 &&
    sample.lastPreparationAgeMs >= probe.quietMs;
  return current && observed && sample.targetCached === (probe.phase === 'warm');
}
async function waitForFlightSetup(page, selected) {
  await require('./navigation.cjs').publicMotionMode(page, 'on', 'staging-performance');
  await page.evaluate(
    (selected) =>
      (window.__stageFlightSetup = {
        destination: selected.to,
        phase: selected.phase,
        start: performance.now(),
        startPaints: window.__qualityMotion.paints,
        timeoutMs: 3000,
        quietMs: 200,
        status: 'sampling',
        samples: [],
      }),
    selected
  );
  try {
    await page.waitForFunction(flightSetupSample, null, { polling: 50, timeout: 3000 });
    return await page.evaluate(() => ({ ...window.__stageFlightSetup, status: 'settled' }));
  } catch (error) {
    error.setupEvidence = await page
      .evaluate(() => ({ ...window.__stageFlightSetup, status: 'failed' }))
      .catch(() => null);
    throw error;
  }
}
async function openFlightPair(browser, url) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(motion.installProbe);
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto(url + '/index.html');
    await page.waitForFunction(
      () => document.querySelector('.space-scene').dataset.ready === 'true'
    );
    return { page, errors, close: () => context.close() };
  } catch (error) {
    await context.close();
    throw error;
  }
}
async function measureFlight(pair, selected, setup) {
  const { page, errors } = pair,
    from = await page.locator('body').getAttribute('data-page');
  let failure;
  await page.evaluate((destination) => {
    window.__qualityMotion.frames = [];
    window.__qualityMotion.longTasks = [];
    window.__qualityMotion.events = [];
    window.__qualityStart = performance.now();
    document.querySelector(`a[href="${destination + '.html'}"]`).click();
  }, selected.to);
  try {
    await page.waitForFunction(
      (destination) =>
        document.body.dataset.page === destination &&
        !document.querySelector('#site-content').hasAttribute('aria-busy') &&
        document.querySelector('.space-scene').dataset.travel === 'settled',
      selected.to,
      { polling: 40, timeout: 8000 }
    );
  } catch (error) {
    failure = error.message;
  }
  const data = await page.evaluate(() => {
    const end = performance.now(),
      start = window.__qualityStart;
    return {
      ...window.__qualityMotion,
      start,
      end,
      elapsed: end - start,
      state: document.querySelector('.space-scene').dataset.state,
    };
  });
  return {
    from,
    to: selected.to,
    width: 390,
    rate: 4,
    ...motion.summarize(data, 'flight'),
    setup,
    errors: [...errors],
    pass: !failure,
    ...(failure ? { error: failure } : {}),
  };
}
async function restoreFlightIndex(pair) {
  await pair.page
    .locator('header nav[aria-label="Main navigation"] a[href="./"]')
    .evaluate((el) => el.click());
  await pair.page.waitForFunction(
    () =>
      document.body.dataset.page === 'index' &&
      !document.querySelector('#site-content').hasAttribute('aria-busy') &&
      document.querySelector('.space-scene').dataset.travel === 'settled',
    null,
    { polling: 40, timeout: 8000 }
  );
}
async function closeCollectedContext(handle, failure) {
  if (!handle) return failure;
  try {
    await handle.close();
  } catch (error) {
    if (!failure) return error;
    failure.cleanupError = error.message;
  }
  return failure;
}
async function selectedFlights(browser, url, helpers = {}) {
  const api = {
      open: openFlightPair,
      setup: waitForFlightSetup,
      measure: measureFlight,
      restore: restoreFlightIndex,
      ...helpers,
    },
    rows = [];
  for (const destination of performanceRoutes) {
    let pair, selected, setup, measured, failure;
    try {
      // Each destination gets a fresh cold cache, then the same context supplies its warm measurement.
      pair = await api.open(browser, url);
      for (const planned of flightCases().filter((row) => row.to === destination)) {
        selected = planned;
        measured = false;
        setup = await api.setup(pair.page, selected);
        const row = await api.measure(pair, selected, setup);
        rows.push(row);
        measured = true;
        try {
          validateFlight(row, selected);
        } catch (error) {
          row.pass = false;
          row.error = error.message;
          throw error;
        }
        if (selected.phase === 'cold') await api.restore(pair);
      }
    } catch (error) {
      if (selected && !measured)
        rows.push({
          from: selected.from,
          to: selected.to,
          expectedPhase: selected.phase,
          width: 390,
          rate: 4,
          pass: false,
          error: error.message,
          setup: error.setupEvidence || setup,
        });
      failure = error;
    }
    failure = await closeCollectedContext(pair, failure);
    if (failure) {
      failure.flightEvidence = rows;
      throw failure;
    }
  }
  return rows;
}
async function lighthouseTrial(url, route) {
  const { default: lighthouse } = await import(
      pathToFileURL(common.toolRequire.resolve('lighthouse')).href
    ),
    launcher = await import(pathToFileURL(common.toolRequire.resolve('chrome-launcher')).href);
  const chrome = await launcher.launch({
    chromePath:
      process.env.SITE_AUDIT_CHROME || common.toolRequire('playwright').chromium.executablePath(),
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const result = await lighthouse(`${url}/${route}.html`, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
    });
    const rows = [];
    require('./lighthouse.cjs').recordTrial(route, 'mobile', 1, result, rows);
    return rows[0];
  } finally {
    await chrome.kill();
  }
}
async function collectPerformance(url, helpers = {}) {
  const api = {
      launch: () =>
        common.toolRequire('playwright').chromium.launch(common.launchOptions('chromium')),
      sample: motion.sample,
      flights: selectedFlights,
      lighthouse: lighthouseTrial,
      ...helpers,
    },
    started = performance.now();
  const detail = {
    profile: 'staging',
    stageContract: 1,
    fullGate: false,
    productionEligible: false,
    selection: performanceContract(),
    samples: [],
    flights: [],
    lighthouse: [],
    lighthouseAggregation: 'single trial per selected route; not release medians',
    soakPerformed: false,
    retentionCycles: 0,
  };
  let browser, collectionError;
  try {
    // Benchmarks run sequentially, after all functional browsers have closed.
    try {
      browser = await api.launch();
      detail.browser = browser.version();
      for (const route of performanceRoutes)
        detail.samples.push(await api.sample(browser, url, route, { width: 390, rate: 4 }));
      detail.flights = await api.flights(browser, url);
    } catch (error) {
      collectionError = error;
    }
    collectionError = await closeCollectedContext(browser, collectionError);
    if (collectionError) throw collectionError;
    for (const route of performanceRoutes) detail.lighthouse.push(await api.lighthouse(url, route));
    detail.elapsedMs = performance.now() - started;
    return detail;
  } catch (error) {
    if (error.flightEvidence) detail.flights = error.flightEvidence;
    detail.elapsedMs = performance.now() - started;
    error.detail = detail;
    throw error;
  }
}
async function main() {
  registryCheck();
  assert.equal(process.env.SITE_TEST_PROFILE, 'staging', 'staging-only runtime profile');
  const url = require('./hosted-origin.cjs').target(process.env.SITE_TEST_BASE_URL, 'staging'),
    manifest = JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST));
  require('./artifact.cjs').verify(process.env.SITE_PUBLIC_DIR, manifest);
  fs.mkdirSync(common.out, { recursive: true });
  let failed = false;
  for (const [kind, collect, validate] of [
    [
      'stage-functional',
      () => collectFunctional(url, manifest),
      (report) => validateFunctional(report, manifest),
    ],
    ['stage-performance', () => collectPerformance(url), validatePerformance],
  ]) {
    let detail = {
      profile: 'staging',
      stageContract: 1,
      fullGate: false,
      productionEligible: false,
    };
    try {
      detail = await collect();
      const report = common.report(kind, detail);
      validate(report);
    } catch (error) {
      failed = true;
      common.report(kind, { ...(error.detail || detail), error: error.message }, false);
      console.error(kind + ': ' + error.stack);
    }
  }
  if (common.variant(manifest).id === 'color') {
    try {
      await require('./color-browser.cjs').main({ smoke: true });
      validateColor(
        JSON.parse(fs.readFileSync(path.join(common.out, 'color-preview-smoke.json'))),
        manifest
      );
    } catch (error) {
      failed = true;
      console.error('Color staging smoke: ' + error.stack);
    }
  }
  assert.equal(failed, false, 'selected staging regressions failed');
}
if (require.main === module)
  main().catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = {
  contract,
  performanceContract,
  flightCases,
  registryCheck,
  journeyCases,
  navigationCases,
  failureCases,
  analyticsCases,
  exactRows,
  validateFailure,
  validateJourney,
  validateNavigation,
  validateAnalytics,
  validateFunctional,
  validateMeasurement,
  validatePerformance,
  validateFlightSetup,
  validateFlight,
  validateColor,
  collectFunctional,
  collectPerformance,
  flightSetupSample,
  waitForFlightSetup,
  openFlightPair,
  measureFlight,
  restoreFlightIndex,
  selectedFlights,
  lighthouseTrial,
  main,
};
