'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const stage = require('../tools/quality/staging-regression.cjs'),
  fixture = require('./fixtures/staging-evidence.cjs');
test('selected mobile Lighthouse traces retain original Writing failure evidence without changing admission', () => {
  const fs = require('node:fs'),
    path = require('node:path'),
    os = require('node:os'),
    cp = require('node:child_process'),
    zlib = require('node:zlib'),
    crypto = require('node:crypto');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-trace-'));
  try {
    cp.execFileSync(
      process.execPath,
      [
        '-e',
        `
      const {recordTrial}=require('./tools/quality/lighthouse.cjs'),summaries=[];
      for(const [route,formFactor]of [['research','mobile'],['writing','mobile'],['writing','desktop'],['index','mobile']]){
        const lhr={configSettings:{formFactor,throttlingMethod:'simulate',throttling:{cpuSlowdownMultiplier:4}},categories:{},audits:{'total-blocking-time':{numericValue:269}},runWarnings:[]};
        recordTrial(route,formFactor,1,{lhr,artifacts:{Trace:{traceEvents:[{name:'RunTask',dur:129000}]},DevtoolsLog:[{method:'Network.responseReceived'}]}},summaries);
      }
    `,
      ],
      {
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, SITE_REPORT_DIR: directory },
        stdio: 'pipe',
      }
    );
    const rows = JSON.parse(fs.readFileSync(path.join(directory, 'lighthouse-summary.json')));
    for (const row of rows) {
      assert.equal(row.metrics['total-blocking-time'].numericValue, 269);
      assert.equal(row.configSettings.throttlingMethod, 'simulate');
      assert.equal(row.configSettings.throttling.cpuSlowdownMultiplier, 4);
      const selected = row.formFactor === 'mobile' && ['research', 'writing'].includes(row.route);
      assert.equal(Boolean(row.originalEvidence), selected);
      if (!selected) continue;
      for (const [key, expected] of Object.entries({
        Trace: { traceEvents: [{ name: 'RunTask', dur: 129000 }] },
        DevtoolsLog: [{ method: 'Network.responseReceived' }],
      })) {
        const record = row.originalEvidence[key],
          bytes = fs.readFileSync(path.join(directory, record.file));
        assert.equal(record.bytes, bytes.length);
        assert.equal(record.sha256, crypto.createHash('sha256').update(bytes).digest('hex'));
        assert.deepEqual(JSON.parse(zlib.gunzipSync(bytes)), expected);
      }
    }
    const failed = fixture.performanceReport();
    failed.lighthouse.find((row) => row.route === 'writing').metrics[
      'total-blocking-time'
    ].numericValue = 269;
    assert.throws(
      () => stage.validatePerformance(failed),
      /writing smoke total-blocking-time: 269 > 200/
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
test('staging registry matches the actual bounded selectors and owns each analytics case', () => {
  assert.equal(stage.registryCheck(), true);
  assert.equal(stage.journeyCases().length, 6);
  assert.equal(stage.failureCases().length, 10);
  const analytics = require('../tools/quality/analytics-browser.cjs');
  assert.deepEqual(
    analytics.selectedCases('chromium', stage.analyticsCases()),
    stage.analyticsCases()
  );
  assert.equal(
    analytics.selectedCases('chromium').length,
    13,
    'full analytics remains the default'
  );
  for (const selection of [
    [],
    [...stage.analyticsCases(), stage.analyticsCases()[0]],
    [{ engine: 'chromium', entry: 'credits', mode: 'blocked' }],
  ])
    assert.throws(() => analytics.selectedCases('chromium', selection));
  const changed = structuredClone(require('../tools/quality/test-profiles.json'));
  changed.hosted_profiles.staging.functional.analytics_rows = 6;
  assert.throws(() => stage.registryCheck(changed));
});
test('selected browser regression requires all route observations, navigation, failures and analytics', () => {
  assert.equal(
    stage.validateFunctional(fixture.functional(), fixture.manifest()).normalRouteObservations,
    20
  );
  const mutations = [
    (r) => r.journeys.pop(),
    (r) => (r.journeys[0] = structuredClone(r.journeys[1])),
    (r) => r.journeys[0].rows.pop(),
    (r) => (r.journeys[0].served[0].sha256 = 'f'.repeat(64)),
    (r) => (r.journeys[0].rows[0].state.ready = false),
    (r) => (r.journeys[0].rows[0].state.fallback = true),
    (r) => (r.journeys[0].rows[0].state.engine = 'f'.repeat(64)),
    (r) => (r.journeys[0].rows.find((x) => x.route === 'writing').detail = []),
    (r) =>
      (r.journeys.find((x) => x.mode === 'no-canvas').rows[0].state.motion = {
        hidden: false,
        disabled: false,
      }),
    (r) => r.navigation.pop(),
    (r) => (r.navigation[0] = structuredClone(r.navigation[1])),
    (r) => (r.navigation[0].checks.flightTiming = false),
    (r) => r.navigation[0].scrollArrivals.pop(),
    (r) => (r.navigation[0].scrollArrivals[0].samples[3].y = 999),
    (r) =>
      (r.navigation[0].scrollArrivals[0].samples[3].camera =
        r.navigation[0].scrollArrivals[0].samples[2].camera),
    (r) => r.failures.pop(),
    (r) => (r.failures[0] = structuredClone(r.failures[1])),
    (r) => delete r.failures[0].checks.evidence,
    (r) => (r.failures[0].checks.evidence.after.paints = 1),
    (r) =>
      (r.failures[0].checks.evidence.before.paints = r.failures[0].checks.evidence.after.paints =
        1),
    (r) => r.failures.find((x) => x.mode === 'reduced').checks.evidence.after.callbacks++,
    (r) => (r.failures.find((x) => x.mode === 'blocked-storage').checks.evidence.after.paints = 4),
    (r) => (r.failures.find((x) => x.mode === 'css-delayed').checks.beforeCSSNoPaint = false),
    (r) => (r.failures.find((x) => x.mode === 'draw-fault').checks.evidence.after.ready = true),
    (r) => r.analytics.pop(),
    (r) => (r.analytics[0] = structuredClone(r.analytics[1])),
    (r) => (r.analytics[0].checks.originIsolation = false),
    (r) =>
      r.analytics
        .find((x) => x.mode === 'offline')
        .vendorRequests.push('https://static.cloudflareinsights.com/beacon.min.js'),
    (r) => (r.analytics.find((x) => x.mode === 'delayed').readyWhileSDKPending = false),
    (r) => (r.environment.platform = 'darwin'),
    (r) => (r.profile = 'preview'),
    (r) => (r.fullGate = true),
    (r) => (r.productionEligible = true),
    (r) => (r.journeys[0].pass = false),
    (r) => (r.elapsedMs = 0),
    (r) => r.browsers.pop(),
    (r) => (r.browsers[0].version = ''),
  ];
  for (const mutate of mutations) {
    const report = fixture.functional();
    mutate(report);
    assert.throws(() => stage.validateFunctional(report, fixture.manifest()));
  }
});
test('staging performance validates actual raw windows, cold/warm flights and two single Lighthouse trials', () => {
  assert.equal(stage.validatePerformance(fixture.performanceReport()).lighthouseTrials, 2);
  const mutations = [
    (r) => r.samples.pop(),
    (r) => (r.samples[0] = structuredClone(r.samples[1])),
    (r) => (r.samples[0].rate = 1),
    (r) => (r.samples[0].positiveProbe = false),
    (r) => r.samples[0].measurements.pop(),
    (r) => (r.samples[0].measurements[0].rawFrames = []),
    (r) => (r.samples[0].measurements[0].paints = 0),
    (r) => (r.samples[0].measurements[0].paintCallbackMs.p95 = 1),
    (r) => (r.samples[0].measurements[0].rawFrames[0].started = -1),
    (r) => (r.samples[0].measurements[0].window.endMs = 3000),
    (r) => (r.samples[0].measurements[0].elapsedMs = 0),
    (r) => (r.samples[0].measurements[2] = fixture.measurement('off', false)),
    (r) => (r.samples[0].measurements[3] = fixture.measurement('reduced', false)),
    (r) => (r.samples[0].measurements[2].motion = 'Motion: still (device)'),
    (r) => (r.samples[0].measurements[3].motion = 'Motion: off'),
    (r) => (r.samples[0].measurements[0].state = 'fallback'),
    (r) => (r.samples[0].measurements[0].rawLongTasks = [{ start: 3999, duration: 2 }]),
    (r) => r.flights.pop(),
    (r) => (r.flights[0].transitionPhase = 'warm'),
    (r) => (r.flights[1].transitionPhase = 'cold'),
    (r) => (r.flights[0].readyMs = 4000),
    (r) => (r.flights[0].paints = 0),
    (r) => (r.flights[0].rawPreparation = []),
    (r) => (r.flights[0].paintIntervalsMs.max = 400),
    (r) => (r.flights[0].rawPreparation.find((x) => x.kind === 'model').route = 'writing'),
    (r) => (r.flights[0].pass = false),
    (r) => (r.flights[0].setup.samples[0].lastPreparationAgeMs = 0),
    (r) => (r.flights[1].setup.samples[0].targetCached = false),
    (r) => (r.flights[0].setup.samples[0].paints = 0),
    (r) => (r.flights[0].setup.status = 'sampling'),
    (r) => (r.flights[0].setup.samples[0].elapsedMs = 3100),
    (r) => r.lighthouse.pop(),
    (r) => (r.lighthouse[0] = structuredClone(r.lighthouse[1])),
    (r) => (r.lighthouse[0].run = 2),
    (r) => (r.lighthouse[0].configSettings.formFactor = 'desktop'),
    (r) => (r.lighthouse[0].configSettings.throttling.cpuSlowdownMultiplier = 1),
    (r) => (r.lighthouse[0].metrics['largest-contentful-paint'].numericValue = 2600),
    (r) => (r.lighthouse[0].metrics['total-blocking-time'].numericValue = 201),
    (r) => (r.lighthouse[0].metrics['cumulative-layout-shift'].numericValue = 0.11),
    (r) => (r.lighthouse[0].runtimeError = { code: 'controlled failure' }),
    (r) => (r.lighthouseAggregation = 'three-run release median'),
    (r) => (r.soakPerformed = true),
    (r) => (r.retentionCycles = 40),
  ];
  for (const mutate of mutations) {
    const report = fixture.performanceReport();
    mutate(report);
    assert.throws(() => stage.validatePerformance(report));
  }
});
test('observed slow motion is rejected even when its derived metrics are internally consistent', () => {
  const report = fixture.performanceReport(),
    row = report.samples[0].measurements[0];
  const raw = row.rawFrames.map((frame) => ({ ...frame, duration: 40 }));
  Object.assign(
    row,
    require('../tools/quality/motion.cjs').summarize(
      {
        schema: 2,
        start: 0,
        end: 4000,
        elapsed: 4000,
        frames: raw,
        longTasks: [],
        events: [],
        state: 'active',
      },
      'idle'
    )
  );
  assert.throws(() => stage.validatePerformance(report), /slow staging motion/);
});
test('conditional Color smoke keeps its exact two-case feature coverage', () => {
  const f = fixture.aggregateFixture(true),
    report = f.reports.at(-1);
  assert.equal(stage.validateColor(report, f.manifest), 2);
  for (const mutate of [
    (r) => r.rows.pop(),
    (r) => (r.rows[0] = structuredClone(r.rows[1])),
    (r) => (r.rows[0].engine = 'webkit'),
    (r) => (r.rows[0].checks.reverseNativeBottom = false),
    (r) => (r.rows[0].flight = []),
    (r) => (r.rows[0].ribbons.material = 'transparent'),
  ]) {
    const copy = structuredClone(report);
    mutate(copy);
    assert.throws(() => stage.validateColor(copy, f.manifest));
  }
});
test('the functional driver executes precisely its selected helpers and closes each engine', async () => {
  const calls = [],
    closed = [],
    m = fixture.manifest();
  const report = await stage.collectFunctional(fixture.target, m, {
    launch: async (engine) => ({
      version: () => engine + ' controlled fixture',
      executable: 'controlled fixture',
      engine,
      close: async () => closed.push(engine),
    }),
    preview: async (browser, url, manifest, variant, width, mode) => {
      calls.push({ group: 'journey', engine: browser.engine, width, mode });
      return fixture.journeyRow({ engine: browser.engine, width, mode }, manifest);
    },
    nav: async (browser, url, s) => {
      calls.push({ group: 'navigation', ...s });
      return fixture.navigationRow(s);
    },
    failure: async (browser, url, s) => {
      calls.push({ group: 'failure', ...s });
      return fixture.failureRow(s);
    },
    analytics: async (browser, engine, selection) => {
      calls.push(...selection.map((s) => ({ group: 'analytics', ...s })));
      return selection.map(fixture.analyticsRow);
    },
  });
  assert.deepEqual(closed, ['chromium', 'firefox']);
  for (const [group, expected] of [
    ['journey', stage.journeyCases()],
    ['navigation', stage.navigationCases()],
    ['failure', stage.failureCases()],
    ['analytics', stage.analyticsCases()],
  ]) {
    assert.deepEqual(
      calls
        .filter((row) => row.group === group)
        .map((row) => {
          const selected = { ...row };
          delete selected.group;
          return selected;
        }),
      expected
    );
  }
  assert.deepEqual(report.startupFailures, []);
  assert.equal(
    stage.validateFunctional({ ...fixture.identity(m), kind: 'stage-functional', ...report }, m)
      .failures,
    10
  );
});
test('performance driver runs two route samples and two audits serially with a closed measurement browser', async () => {
  const calls = [];
  let active = false;
  const report = await stage.collectPerformance(fixture.target, {
    launch: async () => {
      active = true;
      calls.push('launch');
      return {
        version: () => 'controlled fixture',
        close: async () => {
          active = false;
          calls.push('close');
        },
      };
    },
    sample: async (browser, url, route, profile) => {
      assert.equal(active, true);
      assert.deepEqual(profile, { width: 390, rate: 4 });
      calls.push('sample ' + route);
      return fixture.performanceReport().samples.find((s) => s.route === route);
    },
    flights: async () => {
      assert.equal(active, true);
      calls.push('flights');
      return fixture.performanceReport().flights;
    },
    lighthouse: async (url, route) => {
      assert.equal(active, false, 'functional/measurement browser cannot compete with Lighthouse');
      calls.push('audit ' + route);
      return fixture.lighthouseRow(route);
    },
  });
  assert.deepEqual(calls, [
    'launch',
    'sample research',
    'sample writing',
    'flights',
    'close',
    'audit research',
    'audit writing',
  ]);
  assert.equal(
    stage.validatePerformance({ ...fixture.identity(), kind: 'stage-performance', ...report })
      .soakSeconds,
    0
  );
});
test('selected flight driver uses a fresh context for each destination and measures its actual cold/warm pair', async () => {
  const calls = [];
  let pairId = 0;
  const rows = await stage.selectedFlights({}, fixture.target, {
    open: async () => {
      const id = ++pairId;
      calls.push('open ' + id);
      return { page: { id }, id, close: async () => calls.push('close ' + id) };
    },
    setup: async (page, selected) => {
      calls.push('setup ' + page.id + ' ' + selected.to + ' ' + selected.phase);
      return fixture.flightSetup(selected.to, selected.phase);
    },
    measure: async (pair, selected, setup) => {
      calls.push('measure ' + pair.id + ' ' + selected.to + ' ' + selected.phase);
      return { ...fixture.flight(selected.to, selected.from, selected.phase), setup };
    },
    restore: async (pair) => calls.push('restore index ' + pair.id),
  });
  assert.deepEqual(calls, [
    'open 1',
    'setup 1 research cold',
    'measure 1 research cold',
    'restore index 1',
    'setup 1 research warm',
    'measure 1 research warm',
    'close 1',
    'open 2',
    'setup 2 writing cold',
    'measure 2 writing cold',
    'restore index 2',
    'setup 2 writing warm',
    'measure 2 writing warm',
    'close 2',
  ]);
  assert.deepEqual(
    rows.map(({ from, to, transitionPhase }) => ({ from, to, phase: transitionPhase })),
    stage.flightCases()
  );
});
test('flight setup observes live paints and quiet preparation while preserving actual cache state', () => {
  const vm = require('node:vm'),
    probe = {
      destination: 'research',
      phase: 'warm',
      start: 0,
      startPaints: 0,
      timeoutMs: 3000,
      quietMs: 200,
      samples: [],
    };
  let now = 400;
  const window = {
    __stageFlightSetup: probe,
    __qualityMotion: { paints: 4, events: [{ kind: 'model', time: 100 }] },
    SiteScene: {
      diagnostics: () => ({ rooms: [{ route: 'research', models: [{ compact: true }] }] }),
    },
  };
  const document = {
    hidden: false,
    body: { dataset: { page: 'index' } },
    querySelector: (selector) =>
      selector === '.space-scene'
        ? { dataset: { route: 'index', travel: 'settled', ready: 'true' } }
        : { textContent: 'Motion: on' },
  };
  const observe = () =>
    vm.runInNewContext('(' + stage.flightSetupSample.toString() + ')()', {
      window,
      document,
      performance: { now: () => now },
    });
  assert.equal(observe(), true);
  window.__qualityMotion.events.push({ kind: 'model', time: 350 });
  assert.equal(observe(), false, 'late prefetch must settle before a warm measurement');
  now = 650;
  assert.equal(observe(), true);
  probe.phase = 'cold';
  assert.equal(observe(), false, 'cached target cannot pretend to be cold');
  probe.phase = 'warm';
  window.__qualityMotion.paints = 1;
  assert.equal(observe(), false, 'quiet unpainted state cannot pretend to be live');
  window.__qualityMotion.paints = 4;
  now = 3100;
  assert.equal(observe(), false, 'bounded setup cannot accept late readiness');
});
test('failed flight collection retains previous and failing raw records instead of erasing them', async () => {
  const closed = [],
    cold = fixture.flight('research', 'index', 'cold');
  await assert.rejects(
    () =>
      stage.selectedFlights({}, fixture.target, {
        open: async () => ({ page: {}, close: async () => closed.push(true) }),
        setup: async (page, selected) => fixture.flightSetup(selected.to, selected.phase),
        restore: async () => {},
        measure: async (pair, selected) =>
          selected.phase === 'cold'
            ? cold
            : { ...fixture.flight('research', 'index', 'warm'), transitionPhase: 'cold' },
      }),
    (error) => {
      assert.equal(error.flightEvidence.length, 2);
      assert.deepEqual(error.flightEvidence[0].rawFrames, cold.rawFrames);
      assert.equal(error.flightEvidence[1].pass, false);
      assert.equal(error.flightEvidence[1].transitionPhase, 'cold');
      return true;
    }
  );
  assert.deepEqual(closed, [true]);
  let measurementClosed = false;
  await assert.rejects(
    () =>
      stage.collectPerformance(fixture.target, {
        launch: async () => ({
          version: () => 'controlled fixture',
          close: async () => {
            measurementClosed = true;
          },
        }),
        sample: async (browser, url, route) =>
          fixture.performanceReport().samples.find((s) => s.route === route),
        flights: async () => {
          const error = new Error('controlled collection failure');
          error.flightEvidence = [cold];
          throw error;
        },
        lighthouse: async () =>
          assert.fail('failed flight collection cannot manufacture successful audit completion'),
      }),
    (error) => {
      assert.equal(error.detail.samples.length, 2);
      assert.deepEqual(error.detail.flights, [cold]);
      assert.ok(error.detail.elapsedMs > 0);
      return true;
    }
  );
  assert.equal(measurementClosed, true);
});
