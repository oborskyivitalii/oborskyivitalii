'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const stage = require('../tools/quality/staging-regression.cjs'),
  fixture = require('./fixtures/staging-evidence.cjs');
test('selected journeys compare actual base runtime and Color identities without replacing descriptor hashes', () => {
  const fs = require('node:fs'),
    path = require('node:path'),
    color = require('../tools/staging/color.cjs');
  const components = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../docs/site-revision.json'))
  );
  const base = { ...fixture.manifest(), components };
  const { variant } = color.identities(components, color.authoredEffects());
  const colored = {
    ...base,
    variant,
    components: { ...components, variant, engine: variant.fingerprint },
  };
  const reviewed = require('../tools/quality/color-motion-contract.cjs').reviewedRuntime(
    'issue5-reader-deferred-media-plain'
  );
  assert.deepEqual(variant, reviewed.variant, 'fixture uses the reviewed authored runtime');
  for (const [name, sha256] of Object.entries(reviewed.files))
    for (const file of [name, 'runtime/' + variant.fingerprint + '/' + name])
      colored.files[file] = {
        ...(colored.files[file] || { raw: 5000, gzip: 1000 }),
        sha256,
      };
  assert.notEqual(components.variant.fingerprint, components.engine, 'base descriptor is separate');
  for (const manifest of [base, colored]) {
    const journey = fixture.journeyRow(
      { engine: 'chromium', width: 1440, mode: 'normal' },
      manifest
    );
    for (const row of journey.rows) row.state.engine = manifest.components.engine;
    assert.doesNotThrow(() => stage.validateJourney(journey, manifest));
    const wrongRuntime = structuredClone(journey);
    wrongRuntime.rows[0].state.engine = '0'.repeat(64);
    assert.throws(() => stage.validateJourney(wrongRuntime, manifest));
    const wrongVariant = structuredClone(journey);
    wrongVariant.rows[0].state.variant = 'unknown';
    assert.throws(() => stage.validateJourney(wrongVariant, manifest));
    for (const engine of ['not-an-engine', 'A'.repeat(64), undefined]) {
      const invalid = structuredClone(manifest);
      invalid.components.engine = engine;
      assert.throws(() => stage.validateJourney(journey, invalid));
    }
    const conflict = structuredClone(manifest);
    conflict.variant = {
      ...manifest.components.variant,
      fingerprint: '0'.repeat(64),
    };
    assert.throws(() => stage.validateJourney(journey, conflict));
  }
  const fingerprintAsRuntime = fixture.journeyRow(
    { engine: 'chromium', width: 1440, mode: 'normal' },
    base
  );
  assert.throws(() => stage.validateJourney(fingerprintAsRuntime, base));
  for (const mutate of [
    (manifest) => (manifest.components.engine = '0'.repeat(64)),
    (manifest) => {
      manifest.variant.fingerprint = '0'.repeat(64);
      manifest.components.variant.fingerprint = '0'.repeat(64);
    },
  ]) {
    const wrongColor = structuredClone(colored);
    mutate(wrongColor);
    const observed = fixture.journeyRow(
      { engine: 'chromium', width: 1440, mode: 'normal' },
      wrongColor
    );
    for (const row of observed.rows) row.state.engine = wrongColor.components.engine;
    assert.throws(() => stage.validateJourney(observed, wrongColor));
  }
});
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
  assert.equal(stage.analyticsCases().length, 7, 'preserve released controller coverage schema');
  assert.deepEqual(
    stage
      .analyticsCases()
      .filter((row) => row.mode === 'enabled')
      .map((row) => row.entry),
    ['index', 'writing']
  );
  const analytics = require('../tools/quality/analytics-browser.cjs');
  const entries = stage
    .analyticsCases()
    .filter((row) => row.mode === 'enabled')
    .flatMap((row) => analytics.entryRoutes(row.entry));
  assert.deepEqual(entries.slice().sort(), ['credits', 'index', 'research', 'talks', 'writing']);
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
test('CSS-blocked fixture requires canonical Home head CSS across persistent routes and history', () => {
  const selected = stage.failureCases().find((row) => row.mode === 'css-blocked'),
    observed = fixture.failureRow(selected);
  assert.doesNotThrow(() => stage.validateFailure(observed));
  const mutations = [
    (journey) => journey.states.pop(),
    (journey) => (journey.states[0].page = 'index'),
    (journey) => (journey.states[1].criticalMedia = []),
    (journey) => journey.states[1].criticalMedia.push(journey.states[1].criticalMedia[0]),
    (journey) => (journey.states[1].criticalMedia[0] += '\n'),
    (journey) => (journey.states[1].criticalMedia[0] = journey.states[1].criticalMedia[0].trim()),
    (journey) => (journey.states[0].criticalMedia = journey.states[1].criticalMedia.slice()),
    (journey) => (journey.states[1].criticalMediaOutsideHead = 1),
    (journey) => delete journey.states[0].criticalMediaOutsideHead,
    (journey) => (journey.states[3].overflow = true),
    (journey) => delete journey.states[1].documentPreserved,
    (journey) => (journey.states[1].documentPreserved = false),
    (journey) => (journey.states[3].portrait.width = 828),
    (journey) => (journey.states[3].portrait.width = 0),
    (journey) => (journey.states[3].portrait.width = Infinity),
    (journey) => (journey.states[3].portrait.viewportWidth = 1440),
    (journey) => (journey.states[0].portrait = journey.states[1].portrait),
    (journey) => delete journey.history,
    (journey) => (journey.history = false),
    (journey) => delete journey.documentPreserved,
    (journey) => (journey.documentPreserved = false),
  ];
  for (const mutate of mutations) {
    const row = structuredClone(observed);
    mutate(row.checks.criticalMediaJourney);
    assert.throws(() => stage.validateFailure(row));
  }
  const missing = structuredClone(observed);
  delete missing.checks.criticalMediaJourney;
  assert.throws(() => stage.validateFailure(missing), /missing CSS-blocked route observations/);
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
    (r) => (r.navigation[0].scrollArrivals[0].samples[3].camera = 'moving-camera'),
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
    (r) => delete r.analytics[0].entryForms,
    (r) => (r.analytics[0].entryForms = ['canonical']),
    (r) => (r.analytics[0].entryForms = ['canonical', 'canonical']),
    (r) => delete r.analytics[0].entryRoutes,
    (r) => r.analytics.find((row) => row.entry === 'writing').entryRoutes.pop(),
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
test('every staging measurement requires the observed active renderer state', () => {
  for (const index of [0, 1, 2, 3, 4])
    for (const state of [undefined, 'stopped']) {
      const report = fixture.performanceReport(),
        row = index === 4 ? report.flights[0] : report.samples[0].measurements[index];
      assert.equal(row.state, 'active');
      if (state === undefined) delete row.state;
      else row.state = state;
      assert.throws(
        () => stage.validatePerformance(report),
        /staging measurement lacks an active renderer/
      );
    }
});
test('flight preparation timestamps require finite numbers inside the original measurement window', () => {
  const selected = stage.flightCases().find((row) => row.to === 'research' && row.phase === 'cold');
  for (const field of ['start', 'duration', 'time']) {
    for (const value of ['2', undefined, NaN, Infinity, -Infinity, -1, 100000]) {
      const row = fixture.flight('research', 'index', 'cold');
      if (value === undefined) delete row.rawPreparation[0][field];
      else row.rawPreparation[0][field] = value;
      assert.throws(
        () => stage.validateFlight(row, selected),
        (error) => {
          assert.match(error.message, /invalid preparation sample/);
          assert.equal(
            require('../tools/quality/validate.cjs').performanceBudgetFailure(error),
            null
          );
          return true;
        }
      );
    }
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
test('conditional Color smoke keeps two travel cases with ordinary paint and absent ribbons', () => {
  const evidence = fixture.aggregateFixture(true);
  const report = evidence.reports.at(-1);
  assert.equal(stage.validateColor(report, evidence.manifest), 2);
  const zeroDataset = structuredClone(report);
  zeroDataset.rows[0].ribbons.dataset = {
    ribbons: '0',
    ribbonFaces: '0',
    ribbonSignals: '0',
  };
  assert.equal(stage.validateColor(zeroDataset, evidence.manifest), 2);
  const mutations = [
    (value) => (value.variant.effects = ['ribbons', 'travel']),
    (value) => (value.variant.fingerprint = 'f'.repeat(64)),
    (value) => value.rows.pop(),
    (value) => (value.rows[0] = structuredClone(value.rows[1])),
    (value) => (value.rows[0].engine = 'webkit'),
    (value) => (value.rows[0].checks.reverseNativeBottom = false),
    (value) => (value.rows[0].flight = []),
    (value) => (value.rows[0].ribbons.sceneHook = 'function'),
    (value) => (value.rows[0].ribbons.dataset = { ribbons: '3' }),
    (value) => (value.rows[0].ribbons.dataset = { ribbonFaces: '1' }),
    (value) => (value.rows[0].ribbons.dataset = { ribbonSignals: '1' }),
    (value) => (value.rows[0].ribbons.dataset = { ribbonMaterial: 'opaque-rgb' }),
    (value) => (value.rows[0].ribbons.dataset = null),
    (value) => (value.rows[0].paint.completed = 0),
    (value) => (value.rows[0].paint.ordinaryShapes = 0),
    (value) => (value.rows[0].paint.customShapes = 1),
    (value) => delete value.rows[0].paint,
  ];
  for (const mutate of mutations) {
    const copy = structuredClone(report);
    mutate(copy);
    assert.throws(() => stage.validateColor(copy, evidence.manifest));
  }
});
test('Color paint observer records completed scene submission rather than preparation', () => {
  const vm = require('node:vm');
  const { paintProbe } = require('../tools/quality/color-browser.cjs');
  const sandbox = { window: {} };
  vm.runInNewContext('(' + paintProbe.toString() + ')()', sandbox);
  const sample = { kind: 'paint', ordinaryShapes: 12, customShapes: 0 };
  sandbox.window.SiteEngineProbe({ ...sample, kind: 'model' });
  assert.equal(sandbox.window.__colorPaint.completed, 0);
  sandbox.window.SiteEngineProbe(sample);
  sandbox.window.SiteEngineProbe({ ...sample, ordinaryShapes: 8 });
  assert.deepEqual(
    { ...sandbox.window.__colorPaint },
    {
      completed: 2,
      ordinaryShapes: 8,
      customShapes: 0,
    }
  );
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
  assert.deepEqual(closed.sort(), ['chromium', 'firefox']);
  assert.deepEqual(
    report.browsers.map((row) => row.engine),
    ['chromium', 'firefox']
  );
  for (const [group, expected] of [
    ['journey', stage.journeyCases()],
    ['navigation', stage.navigationCases()],
    ['failure', stage.failureCases()],
    ['analytics', stage.analyticsCases()],
  ]) {
    const observed = calls
      .filter((row) => row.group === group)
      .map((row) => {
        const selected = { ...row };
        delete selected.group;
        return selected;
      });
    assert.equal(observed.length, expected.length);
    for (const selected of expected)
      assert.equal(
        observed.filter((row) => JSON.stringify(row) === JSON.stringify(selected)).length,
        1,
        'each selected functional case executes exactly once'
      );
  }
  assert.deepEqual(report.startupFailures, []);
  assert.equal(
    stage.validateFunctional({ ...fixture.identity(m), kind: 'stage-functional', ...report }, m)
      .failures,
    10
  );
});
test('functional overlap is bounded to two engine groups and joins failed cleanup before returning', async () => {
  let release,
    active = 0,
    maximum = 0,
    finished = false;
  const gate = new Promise((resolve) => (release = resolve)),
    closed = [],
    calls = [];
  const pending = stage
    .collectFunctional(fixture.target, fixture.manifest(), {
      launch: async (engine) => {
        active++;
        maximum = Math.max(maximum, active);
        calls.push('launch ' + engine);
        return {
          engine,
          executable: 'controlled fixture',
          version: () => 'fixture',
          close: async () => {
            closed.push(engine);
            active--;
            if (engine === 'chromium') throw Error('controlled close failure');
          },
        };
      },
      preview: async (browser, url, manifest, variant, width, mode) => {
        if (browser.engine === 'chromium') throw Error('controlled first-group failure');
        await gate;
        calls.push('preview ' + browser.engine);
        return fixture.journeyRow({ engine: browser.engine, width, mode }, manifest);
      },
      nav: async (browser, url, selected) => fixture.navigationRow(selected),
    })
    .then(
      (report) => {
        finished = true;
        return { report };
      },
      (error) => {
        finished = true;
        return { error, report: error.detail };
      }
    );
  for (let turn = 0; turn < 10; turn++) await Promise.resolve();
  assert.equal(maximum, 2, 'only two functional browsers can overlap');
  assert.equal(finished, false, 'a failed group cannot skip the other group join');
  assert.deepEqual(closed, ['chromium']);
  assert.equal(active, 1);
  release();
  const { error, report } = await pending;
  assert.equal(error.functionalCleanupFailed, true, 'failed closure prevents isolated benchmarks');
  assert.equal(active, 0, 'all functional browser cleanup finished');
  assert.deepEqual(closed, ['chromium', 'firefox']);
  assert.deepEqual(
    report.browsers.map((row) => row.engine),
    ['chromium', 'firefox'],
    'report order follows the selected engine order despite completion order'
  );
  assert.deepEqual(report.startupFailures, [
    { engine: 'chromium', error: 'controlled first-group failure' },
    { engine: 'chromium', error: 'browser close: controlled close failure' },
  ]);
  assert.equal(report.journeys.length, 2, 'the independent second engine completes every case');
  assert.equal(calls.filter((call) => call.startsWith('launch ')).length, 2);
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
    stage.validatePerformance({
      ...fixture.identity(),
      kind: 'stage-performance',
      ...report,
    }).soakSeconds,
    0
  );
});
function resourceEntry(name, startTime = 110, responseEnd = 200) {
  return {
    name,
    initiatorType: 'fetch',
    startTime,
    duration: responseEnd - startTime,
    fetchStart: startTime,
    requestStart: startTime + 10,
    responseStart: responseEnd - 10,
    responseEnd,
    responseStatus: 200,
    transferSize: 1300,
    encodedBodySize: 1000,
    decodedBodySize: 2000,
  };
}
test('post-flight resource collection selects only the two current same-origin fetches without truncating overflow', () => {
  const vm = require('node:vm'),
    directory = fixture.target + '/staging/',
    snapshot = directory + 'snapshots/' + 'a'.repeat(64) + '/research.html',
    selected = [resourceEntry(directory + 'site-revision.json'), resourceEntry(snapshot, 210, 900)];
  let resources = [
    ...selected,
    resourceEntry(directory + 'site-revision.json', 1, 50),
    resourceEntry(directory + 'site-revision.json', 5001, 5010),
    resourceEntry('https://other.example/site-revision.json'),
    resourceEntry(directory + 'snapshots/' + 'a'.repeat(64) + '/writing.html'),
    { ...resourceEntry(directory + 'index.html'), initiatorType: 'navigation' },
  ];
  const collect = () =>
    vm.runInNewContext('(' + stage.flightResourceTiming.toString() + ')(selected)', {
      URL,
      selected: { startMs: 100, endMs: 5000, destination: 'research' },
      location: { href: directory + 'research.html' },
      performance: {
        now: () => 5005,
        getEntriesByType: (kind) => {
          assert.equal(kind, 'resource');
          return resources;
        },
      },
    });
  const evidence = JSON.parse(JSON.stringify(collect()));
  assert.deepEqual(evidence, {
    schema: 1,
    documentURL: directory + 'research.html',
    collectedAtMs: 5005,
    entries: selected,
  });
  resources = [...selected, resourceEntry(snapshot, 1000, 1100)];
  assert.throws(collect, /overflowing current-flight resource timing/);
});
test('flight fetch evidence separates response completion from preparation and rejects invalid unbounded records', () => {
  const directory = fixture.target + '/staging/',
    snapshot = directory + 'snapshots/' + 'a'.repeat(64) + '/research.html',
    row = {
      to: 'research',
      window: { startMs: 100, endMs: 5000 },
      rawChoreography: [{ kind: 'navigation-start', time: 105 }],
      rawPreparation: [{ kind: 'route', page: 'research', start: 1000 }],
      transitionPhase: 'cold',
      pass: true,
    },
    evidence = {
      schema: 1,
      documentURL: directory + 'research.html',
      collectedAtMs: 5005,
      entries: [resourceEntry(directory + 'site-revision.json'), resourceEntry(snapshot, 210, 900)],
    },
    read = (input = evidence, flight = row) =>
      stage.flightReadTiming(input, flight, directory + 'index.html');
  assert.deepEqual(read(), {
    navigationStartMs: 105,
    preparationStartMs: 1000,
    navigationToPreparationMs: 895,
    lastResponseEndMs: 900,
    navigationToLastResponseEndMs: 795,
    responseEndToPreparationMs: 100,
  });
  const cached = structuredClone(evidence);
  Object.assign(cached.entries[1], { transferSize: 0, responseStatus: 0 });
  assert.deepEqual(
    read(cached),
    read(),
    'zero transfer/status remain raw observations, not wire-latency claims'
  );
  const warm = read({ ...evidence, entries: [] }, { ...row, transitionPhase: 'warm' });
  assert.equal(warm.navigationToPreparationMs, 895);
  assert.equal(warm.lastResponseEndMs, null, 'a warm cache does not manufacture network timing');
  assert.equal(warm.responseEndToPreparationMs, null);
  for (const mutate of [
    (value) => (value.schema = 2),
    (value) => (value.collectedAtMs = 4999),
    (value) => (value.collectedAtMs = Infinity),
    (value) => (value.collectedAtMs = Number.MAX_VALUE),
    (value) => (value.documentURL = 'https://other.example/staging/research.html'),
    (value) =>
      (value.documentURL = value.documentURL.replace('https://', 'https://user:password@')),
    (value) => (value.documentURL = fixture.target + '/different/research.html'),
    (value) => value.entries.push(resourceEntry(snapshot, 1000, 1100)),
    (value) => value.entries.pop(),
    (value) => (value.entries[1] = structuredClone(value.entries[0])),
    (value) => (value.entries[0].name = 'https://other.example/site-revision.json'),
    (value) => (value.entries[1].name = snapshot.replace('https://', 'https://user:password@')),
    (value) => (value.entries[0].name = directory + 'site-revision.json?unbound=1'),
    (value) => (value.entries[0].name = directory + 'x'.repeat(2049)),
    (value) => (value.entries[1].name = snapshot.replace('/research.html', '/writing.html')),
    (value) => (value.entries[1].name = snapshot.replace('a'.repeat(64), 'not-a-version')),
    (value) => (value.entries[1].name = snapshot + '/extra'),
    (value) => (value.entries[0].initiatorType = 'navigation'),
    (value) => (value.entries[0].startTime = 99),
    (value) => (value.entries[0].fetchStart = 1),
    (value) =>
      Object.assign(value.entries[1], { fetchStart: 999, requestStart: 0, responseStart: 0 }),
    (value) => (value.entries[0].requestStart = 201),
    (value) => (value.entries[0].responseStart = Number.NaN),
    (value) => (value.entries[0].responseEnd = 5001),
    (value) => (value.entries[0].duration = 1),
    (value) => (value.entries[0].responseStatus = 600),
    (value) => (value.entries[0].transferSize = -1),
    (value) => (value.entries[0].encodedBodySize = 0.5),
    (value) => (value.entries[0].decodedBodySize = Infinity),
    (value) => (value.entries[0].decodedBodySize = Number.MAX_SAFE_INTEGER + 1),
    (value) => (value.entries[0].decodedBodySize = 2000001),
  ]) {
    const invalid = structuredClone(evidence);
    mutate(invalid);
    assert.throws(() => read(invalid));
  }
  const late = structuredClone(evidence);
  late.entries[1].responseEnd = 1100;
  late.entries[1].duration = 890;
  assert.throws(() => read(late), /response completed after route preparation/);
  assert.throws(
    () => read(evidence, { ...row, transitionPhase: 'warm' }),
    /cold\/warm fetch timing/
  );
  const failed = read({ ...evidence, entries: [] }, { ...row, pass: false, rawPreparation: [] });
  assert.equal(
    failed.preparationStartMs,
    null,
    'an interrupted read retains an explicit missing endpoint'
  );
});
test('flight driver collects resources only after the original window and preserves the native latency failure', async () => {
  const data = fixture.flightData('research', 'index', 'cold'),
    calls = [],
    documentURL = fixture.target + '/index.html';
  data.end = data.elapsed = 4875;
  data.events.find((event) => event.kind === 'navigation-ready').time = 4875;
  data.events.push({ kind: 'route', page: 'research', start: 6, time: 8, duration: 2 });
  const resources = {
    schema: 1,
    documentURL: fixture.target + '/research.html',
    collectedAtMs: 4999,
    entries: [
      resourceEntry(fixture.target + '/site-revision.json', 0.1, 2),
      resourceEntry(fixture.target + '/snapshots/' + 'a'.repeat(64) + '/research.html', 2.1, 4),
    ],
  };
  for (const entry of resources.entries) {
    entry.requestStart = entry.startTime;
    entry.responseStart = entry.responseEnd;
  }
  const selected = { from: 'index', to: 'research', phase: 'cold' },
    page = {
      url: () => documentURL,
      locator: () => ({ getAttribute: async () => 'index' }),
      evaluate: async (fn, argument) => {
        if (fn === stage.flightResourceTiming) {
          calls.push('resources after capture');
          assert.deepEqual(argument, { startMs: 0, endMs: 4875, destination: 'research' });
          return structuredClone(resources);
        }
        if (argument === 'research') calls.push('original click');
        else {
          calls.push('original raw capture');
          return structuredClone(data);
        }
      },
      waitForFunction: async (fn, destination, options) => {
        calls.push('original ready wait');
        assert.equal(destination, 'research');
        assert.deepEqual(options, {
          polling: 40,
          timeout: require('../tools/quality/motion.cjs').transitionReadyDeadlineMs(390),
        });
      },
    },
    setup = fixture.flightSetup('research', 'cold'),
    row = await stage.measureFlight({ page, errors: [] }, selected, setup);
  assert.deepEqual(calls, [
    'original click',
    'original ready wait',
    'original raw capture',
    'resources after capture',
  ]);
  const expected = require('../tools/quality/motion.cjs').summarize(data, 'flight', {
    from: 'index',
    to: 'research',
    width: 390,
  });
  for (const [key, value] of Object.entries(expected)) assert.deepEqual(row[key], value);
  assert.equal(row.readyMs, 4875);
  assert.equal(row.equivalentReadyMs, 3383);
  assert.throws(() => stage.validateFlight(row, selected), /invalid\/slow input-to-ready latency/);
  resources.entries.push(structuredClone(resources.entries[0]));
  const invalid = await stage.measureFlight({ page, errors: [] }, selected, setup);
  assert.equal(invalid.pass, false);
  assert.match(invalid.error, /resource timing/);
  assert.deepEqual(
    invalid.rawFrames,
    row.rawFrames,
    'invalid telemetry cannot erase the failing measurement'
  );
  assert.equal(invalid.equivalentReadyMs, 3383);
  resources.entries.pop();
  page.waitForFunction = async () => {
    throw Error('controlled readiness timeout');
  };
  const interrupted = await stage.measureFlight({ page, errors: [] }, selected, setup);
  assert.equal(interrupted.pass, false);
  assert.equal(interrupted.error, 'controlled readiness timeout');
  assert.deepEqual(interrupted.resourceTiming.entries, row.resourceTiming.entries);
  assert.deepEqual(interrupted.rawFrames, row.rawFrames);
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
      return {
        ...fixture.flight(selected.to, selected.from, selected.phase),
        setup,
      };
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
    rows.map(({ from, to, transitionPhase }) => ({
      from,
      to,
      phase: transitionPhase,
    })),
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
      diagnostics: () => ({
        rooms: [{ route: 'research', models: [{ compact: true }] }],
      }),
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
            : {
                ...fixture.flight('research', 'index', 'warm'),
                transitionPhase: 'cold',
              },
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
function completedSlowFlight(to = 'writing') {
  const data = fixture.flightData(to, 'index', 'cold');
  data.end = data.elapsed = to === 'writing' ? 4620.9 : 4875;
  data.events.at(-1).time = data.end;
  return {
    from: 'index',
    to,
    width: 390,
    rate: 4,
    ...require('../tools/quality/motion.cjs').summarize(data, 'flight', {
      from: 'index',
      to,
      width: 390,
    }),
    setup: fixture.flightSetup(to, 'cold'),
    errors: [],
    pass: true,
  };
}
test('a completed over-budget cold flight retains its failure and collects the remaining declared flights and audits', async () => {
  const calls = [],
    slow = completedSlowFlight(),
    raw = structuredClone(slow),
    detail = await stage.collectPerformance(fixture.target, {
      launch: async () => ({
        version: () => 'controlled fixture',
        close: async () => calls.push('close measurement browser'),
      }),
      sample: async (browser, url, route) =>
        fixture.performanceReport().samples.find((s) => s.route === route),
      flights: async (browser, url) =>
        stage.selectedFlights(browser, url, {
          open: async () => ({ page: {}, close: async () => calls.push('close pair') }),
          setup: async (page, selected) => fixture.flightSetup(selected.to, selected.phase),
          measure: async (pair, selected) => {
            calls.push(selected.to + ' ' + selected.phase);
            return selected.to === 'writing' && selected.phase === 'cold'
              ? slow
              : fixture.flight(selected.to, selected.from, selected.phase);
          },
          restore: async () => calls.push('restore index'),
        }),
      lighthouse: async (url, route) => {
        calls.push('lighthouse ' + route);
        return fixture.lighthouseRow(route);
      },
    });
  assert.deepEqual(calls, [
    'research cold',
    'restore index',
    'research warm',
    'close pair',
    'writing cold',
    'restore index',
    'writing warm',
    'close pair',
    'close measurement browser',
    'lighthouse research',
    'lighthouse writing',
  ]);
  assert.equal(detail.flights.length, 4);
  assert.equal(detail.lighthouse.length, 2);
  const failed = detail.flights[2];
  assert.equal(failed.pass, false);
  assert.ok(Math.abs(failed.equivalentReadyMs - 3382.9) < 1e-8);
  for (const key of ['rawFrames', 'rawPreparation', 'rawChoreography', 'readyMs'])
    assert.deepEqual(failed[key], raw[key], 'budget failure preserves ' + key);
  assert.equal(failed.validationFailure.kind, 'performance-budget');
  assert.deepEqual(
    failed.validationFailure.violations.map(({ metric, actual, limit }) => ({
      metric,
      actual,
      limit,
    })),
    [{ metric: 'equivalentReadyMs', actual: failed.equivalentReadyMs, limit: 3200 }]
  );
  const aggregate = fixture.aggregateFixture();
  Object.assign(
    aggregate.reports.find((report) => report.kind === 'stage-performance'),
    detail
  );
  assert.throws(
    () => require('../tools/quality/staging-gate.cjs').aggregate(aggregate),
    /invalid\/slow input-to-ready latency/
  );
});
test('budget continuation cannot bypass bad cache or renderer state, failed warm setup, forged error types or cleanup failure', async () => {
  for (const defect of [
    'cache',
    'raw-integrity',
    'preparation-start-type',
    'preparation-time-missing',
    'preparation-time-window',
    'missing-state',
    'stopped-state',
    'warm-setup',
    'forged-error',
    'cleanup',
  ]) {
    const calls = [],
      slow = completedSlowFlight('research');
    await assert.rejects(
      () =>
        stage.collectPerformance(fixture.target, {
          launch: async () => ({ version: () => 'controlled fixture', close: async () => {} }),
          sample: async (browser, url, route) =>
            fixture.performanceReport().samples.find((s) => s.route === route),
          flights: async (browser, url) =>
            stage.selectedFlights(browser, url, {
              open: async () => ({
                page: {},
                close: async () => {
                  if (defect === 'cleanup') throw Error('controlled cleanup failure');
                },
              }),
              setup: async (page, selected) => {
                calls.push('setup ' + selected.phase);
                if (defect === 'warm-setup' && selected.phase === 'warm')
                  throw Error('controlled warm setup failure');
                return fixture.flightSetup(selected.to, selected.phase);
              },
              measure: async (pair, selected) => {
                calls.push('measure ' + selected.phase);
                if (defect === 'forged-error') {
                  const error = Error('controlled collection failure');
                  error.name = 'PerformanceBudgetError';
                  error.violations = [{ metric: 'equivalentReadyMs', actual: 3382.9, limit: 3200 }];
                  throw error;
                }
                if (defect === 'cache') slow.setup.samples.at(-1).targetCached = true;
                if (defect === 'raw-integrity') slow.rawPreparation[0].duration = -1;
                if (defect === 'preparation-start-type')
                  slow.rawPreparation[0].start = String(slow.rawPreparation[0].start);
                if (defect === 'preparation-time-missing') delete slow.rawPreparation[0].time;
                if (defect === 'preparation-time-window')
                  slow.rawPreparation[0].time = slow.window.endMs + 1;
                if (defect === 'missing-state') delete slow.state;
                if (defect === 'stopped-state') slow.state = 'stopped';
                return selected.phase === 'cold'
                  ? slow
                  : fixture.flight('research', 'index', 'warm');
              },
              restore: async () => calls.push('restore'),
            }),
          lighthouse: async () => assert.fail('unsafe collection failure must prevent Lighthouse'),
        }),
      (error) => {
        assert.ok(
          error.detail.flights.every((row) => row.pass === false || row.transitionPhase === 'warm')
        );
        if (defect === 'warm-setup') {
          assert.equal(error.detail.flights.length, 2);
          assert.equal(error.detail.flights[1].expectedPhase, 'warm');
          assert.equal(error.detail.flights[1].pass, false);
          assert.equal(error.detail.flights[1].setup, null);
          assert.equal(calls.includes('measure warm'), false);
        }
        if (
          [
            'cache',
            'raw-integrity',
            'preparation-start-type',
            'preparation-time-missing',
            'preparation-time-window',
            'missing-state',
            'stopped-state',
          ].includes(defect)
        ) {
          assert.equal(error.detail.flights.length, 1);
          assert.equal(error.detail.flights[0].validationFailure, undefined);
          assert.equal(calls.includes('restore'), false);
          assert.equal(calls.includes('setup warm'), false);
        }
        return true;
      }
    );
  }
});
