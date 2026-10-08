'use strict';
// Bounded #58 measurements. Local lab evidence is never a hosted/release gate.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { environment, toolRequire, launchOptions, variant } = require('./common.cjs');
const artifact = require('./artifact.cjs');
const motion = require('./motion.cjs');
const budgets = require('./budgets.json');
const { cache: formulaCache } = require('./writing-paradigm-validate.cjs');
const { paintProbe } = require('./color-browser.cjs');
const { colorPaint } = require('./validate.cjs');

// R2 remains a semantic checkpoint. It is not a comparable measurement baseline:
// approved main removed active ribbons before this refactor was integrated.
const frozenR2 = Object.freeze({
  sourceCommit: '8c6cf877fee92b4d2493b4c1a07df7080b987c29',
  sourceTree: '2725ae4743032b2aeaafd7f2d7f7c91a08265906',
});
const baselineCommit = 'a8149a0a65579d6977ccef9bb0e6e4367fd9e9dd';
const baselineTree = '776610667df0c606d29891f582a7fc329faaa570';
const protocol = {
  schema: 2,
  baseline: { kind: 'approved-main', sourceCommit: baselineCommit, sourceTree: baselineTree },
  routes: ['research', 'writing'],
  profiles: [
    {
      id: 'desktop',
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      cpuRate: 1,
    },
    {
      id: 'mobile-x4',
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      cpuRate: 4,
    },
  ],
  theme: 'dark',
  warmupMs: 10000,
  measurementMs: 4000,
  hotspotMs: 2000,
  stoppedMs: 1000,
  lifecycleCycles: 10,
  variants: ['base', 'color'],
  effects: { base: [], color: ['travel'] },
  reducedMotion: 'no-preference',
};

function identity(manifest) {
  return {
    sourceCommit: manifest.sourceCommit,
    sourceTree: manifest.sourceTree,
    candidateCommit: manifest.candidateCommit,
    sourceDirty: manifest.sourceDirty,
    artifactDigest: manifest.artifactDigest,
    engine: manifest.components.engine,
    variant: variant(manifest),
  };
}

function checkIdentity(source, expected) {
  for (const name of ['sourceCommit', 'sourceTree', 'candidateCommit'])
    assert.match(source[name] || '', /^[a-f0-9]{40}$/, 'missing exact source ' + name);
  assert.equal(source.sourceCommit, source.candidateCommit, 'candidate/source mismatch');
  assert.equal(source.sourceDirty, false, 'dirty measurement source');
  assert.match(source.artifactDigest || '', /^[a-f0-9]{64}$/, 'missing artifact digest');
  assert.match(source.engine || '', /^[a-f0-9]{64}$/, 'missing runtime engine');
  assert.ok(protocol.variants.includes(source.variant?.id), 'unknown runtime variant');
  assert.equal(source.variant.contract, 1, 'unsupported runtime contract');
  assert.match(source.variant.fingerprint || '', /^[a-f0-9]{64}$/, 'missing variant identity');
  assert.deepEqual(
    source.variant.effects === undefined ? [] : source.variant.effects,
    protocol.effects[source.variant.id],
    'wrong active effect composition'
  );
  if (source.variant.id === 'color')
    assert.equal(source.engine, source.variant.fingerprint, 'Color engine mismatch');
  if (expected) assert.deepEqual(source, expected, 'wrong source/artifact identity');
}

function validateSample(sample, kind, { limits = true } = {}) {
  assert.equal(sample.kind, kind, 'wrong sample kind');
  assert.equal(sample.probeVersion, 2, 'missing actual motion probe');
  const duration = ['off', 'reduced'].includes(kind)
    ? protocol.stoppedMs
    : kind === 'warmup'
      ? protocol.warmupMs
      : kind === 'hotspot'
        ? protocol.hotspotMs
        : protocol.measurementMs;
  assert.ok(Number.isFinite(sample.elapsedMs) && sample.elapsedMs >= duration - 50);
  assert.ok(sample.window.endMs > sample.window.startMs, 'missing observation window');
  assert.ok(
    Math.abs(sample.window.endMs - sample.window.startMs - sample.elapsedMs) < 1e-6,
    'inconsistent observation window'
  );
  for (const name of ['rawFrames', 'rawLongTasks', 'rawPreparation'])
    assert.ok(Array.isArray(sample[name]), 'missing raw ' + name);
  for (const frame of sample.rawFrames) {
    assert.ok(Number.isFinite(frame.time) && Number.isFinite(frame.started));
    assert.ok(frame.started >= sample.window.startMs && frame.started <= sample.window.endMs);
    assert.ok(Number.isFinite(frame.duration) && frame.duration >= 0);
    assert.equal(typeof frame.painted, 'boolean');
  }
  for (const task of sample.rawLongTasks)
    assert.ok(
      Number.isFinite(task.start) &&
        Number.isFinite(task.duration) &&
        task.duration >= 0 &&
        task.start >= sample.window.startMs &&
        task.start + task.duration <= sample.window.endMs,
      'long task outside measurement'
    );
  for (const preparation of sample.rawPreparation)
    assert.ok(
      ['model', 'layout', 'route'].includes(preparation.kind) &&
        Number.isFinite(preparation.start) &&
        Number.isFinite(preparation.duration) &&
        Number.isFinite(preparation.time) &&
        preparation.duration >= 0 &&
        preparation.start >= sample.window.startMs &&
        preparation.start + preparation.duration <= sample.window.endMs &&
        preparation.time >= sample.window.startMs &&
        preparation.time <= sample.window.endMs,
      'preparation outside measurement'
    );
  const raw = {
    schema: sample.probeVersion,
    frames: sample.rawFrames,
    longTasks: sample.rawLongTasks,
    events: sample.rawPreparation,
    start: sample.window.startMs,
    end: sample.window.endMs,
    elapsed: sample.elapsedMs,
    quality: sample.quality,
    cadence: sample.cadence,
    state: sample.state,
    motion: sample.motion,
  };
  const computed = motion.summarize(raw, kind);
  for (const name of [
    'callbacks',
    'paints',
    'paintRateHz',
    'paintIntervalsMs',
    'paintCallbackMs',
    'callbackBusyPercent',
    'preparationMs',
  ])
    assert.deepEqual(sample[name], computed[name], 'summary differs from raw ' + name);
  if (['off', 'reduced'].includes(kind)) {
    assert.equal(sample.paints, 0, 'stopped motion paints');
    assert.equal(sample.callbacks, 0, 'stopped motion callbacks');
  } else if (!['warmup', 'hotspot'].includes(kind)) {
    assert.ok(sample.paints >= budgets.motion.minimumPaints, 'no actual paint');
    if (limits)
      assert.ok(sample.paintCallbackMs.p95 <= budgets.motion.paintCallbackP95Ms, 'paint budget');
    if (limits && kind === 'idle')
      assert.ok(
        sample.callbackBusyPercent <= budgets.motion.idleCallbackBusyPercent,
        'idle busy budget'
      );
  }
}

function checkRooms(diagnostics) {
  assert.ok(Array.isArray(diagnostics.rooms), 'missing room cache observations');
  assert.ok(diagnostics.rooms.length > 0 && diagnostics.rooms.length <= 3, 'room cache bound');
  assert.equal(new Set(diagnostics.rooms.map((room) => room.route)).size, diagnostics.rooms.length);
  for (const room of diagnostics.rooms) {
    assert.ok(budgets.routes.includes(room.route), 'unknown cached route');
    assert.ok(room.models.length > 0 && room.models.length <= 2, 'detail cache bound');
    assert.equal(new Set(room.models.map((model) => model.compact)).size, room.models.length);
    for (const model of room.models) {
      assert.equal(typeof model.compact, 'boolean');
      assert.ok(Number.isFinite(model.serializedChars) && model.serializedChars > 0);
      assert.equal(
        model.formulaAnchors,
        room.route === 'writing' ? 1 : 0,
        'formula anchor ownership'
      );
    }
  }
  if (diagnostics.formula?.status === 'unused') {
    for (const name of ['cacheBuilds', 'width', 'height', 'bytes', 'failures'])
      assert.equal(diagnostics.formula[name], 0, 'unused formula cache allocation');
  } else formulaCache(diagnostics.formula);
}

function cpuHotspots(profile) {
  assert.ok(Array.isArray(profile.nodes) && Array.isArray(profile.samples), 'missing CPU profile');
  assert.ok(profile.nodes.length > 0 && profile.samples.length > 0, 'empty CPU observation');
  assert.ok(
    Number.isFinite(profile.startTime) &&
      Number.isFinite(profile.endTime) &&
      profile.endTime > profile.startTime,
    'invalid CPU interval'
  );
  assert.ok(Array.isArray(profile.timeDeltas), 'missing actual CPU durations');
  assert.equal(profile.samples.length, profile.timeDeltas.length, 'incomplete CPU samples');
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  assert.equal(nodes.size, profile.nodes.length, 'duplicate CPU node');
  const totals = new Map();
  for (const [index, id] of profile.samples.entries()) {
    assert.ok(nodes.has(id), 'CPU sample points to absent node');
    assert.ok(Number.isFinite(profile.timeDeltas[index]) && profile.timeDeltas[index] >= 0);
    totals.set(id, (totals.get(id) || 0) + profile.timeDeltas[index]);
  }
  assert.ok([...totals.values()].reduce((sum, value) => sum + value, 0) > 0, 'empty CPU duration');
  return [...totals]
    .map(([id, micros]) => ({
      function: nodes.get(id).callFrame.functionName,
      path: nodes.get(id).callFrame.url.replace(/^https?:\/\/[^/]+/, ''),
      line: nodes.get(id).callFrame.lineNumber,
      sampledSelfMs: micros / 1000,
    }))
    .sort((left, right) => right.sampledSelfMs - left.sampledSelfMs);
}

function qualityStates(row, sample) {
  const trace = row.qualityTrace;
  assert.ok(Array.isArray(trace) && trace.length > 0, 'missing whole-window quality trace');
  for (const [index, state] of trace.entries()) {
    assert.ok(Number.isFinite(state.time) && state.time >= 0);
    if (index) assert.ok(state.time >= trace[index - 1].time, 'unordered quality trace');
    assert.equal(typeof state.quality, 'string');
    assert.equal(typeof state.cadence, 'string');
  }
  const before = trace.filter((state) => state.time <= sample.window.startMs).at(-1);
  assert.ok(before, 'quality trace begins after measurement');
  const within = trace.filter(
    (state) => state.time > sample.window.startMs && state.time <= sample.window.endMs
  );
  return [before, ...within].map(({ quality, cadence }) => ({ quality, cadence }));
}

function collectorSources() {
  return Object.fromEntries(
    [
      'refactor-metrics.cjs',
      'motion.cjs',
      'common.cjs',
      'writing-probe.cjs',
      'artifact.cjs',
      'budgets.json',
      'writing-paradigm-validate.cjs',
      'validate.cjs',
      'color-browser.cjs',
    ].map((name) => [name, artifact.digest(fs.readFileSync(path.join(__dirname, name)))])
  );
}

function validateReport(report, expected, { limits = true } = {}) {
  assert.equal(report.schema, 1);
  assert.equal(report.kind, 'refactor-metrics');
  assert.equal(report.fullGate, false);
  assert.equal(report.performanceAcceptance, false);
  assert.equal(report.target, 'loopback-exact-public-artifact');
  assert.deepEqual(report.protocol, protocol, 'measurement protocol changed');
  assert.deepEqual(report.budgets, budgets, 'original resource budgets changed');
  assert.deepEqual(report.collectorSources, collectorSources(), 'collector source changed');
  checkIdentity(report.identity, expected);
  assert.ok(typeof report.browser === 'string' && report.browser.length > 0);
  assert.deepEqual(
    report.browserSettings,
    { engine: 'chromium', launch: launchOptions('chromium') },
    'browser launch settings changed'
  );
  assert.equal(report.playwright, toolRequire('playwright/package.json').version);
  assert.deepEqual(
    report.rows.map((row) => ({ route: row.route, settings: row.settings })),
    protocol.profiles.flatMap((settings) => protocol.routes.map((route) => ({ route, settings }))),
    'missing/duplicate/out-of-order profile cases'
  );
  for (const row of report.rows) {
    assert.deepEqual(row.errors, [], 'browser errors');
    validateSample(row.warmup, 'warmup');
    assert.deepEqual(
      row.samples.map((sample) => sample.kind),
      ['idle', 'scroll', 'off', 'reduced']
    );
    const applicable = row.settings.width === 390 && row.settings.cpuRate === 4;
    for (const sample of row.samples)
      validateSample(sample, sample.kind, { limits: limits && applicable });
    validateSample(row.hotspotWindow, 'hotspot');
    assert.ok(row.hotspotWindow.paints >= budgets.motion.minimumPaints, 'missing hotspot paint');
    for (const sample of [row.warmup, ...row.samples, row.hotspotWindow])
      qualityStates(row, sample);
    assert.deepEqual(row.hotspots, cpuHotspots(row.rawCPUProfile), 'CPU summary differs from raw');
    checkRooms(row.diagnostics);
    colorPaint(row);
    assert.equal(
      row.runtime.navigationHook,
      report.identity.variant.id === 'color' ? 'function' : 'undefined',
      'wrong actual navigation effect'
    );
    assert.equal(row.runtime.variant, report.identity.variant.id, 'wrong served runtime variant');
    assert.equal(row.runtime.engine, report.identity.engine, 'wrong served runtime engine');
    assert.equal(row.runtime.theme, protocol.theme, 'wrong actual theme');
    assert.deepEqual(
      row.runtime.viewport,
      { width: row.settings.width, height: row.settings.height },
      'wrong actual viewport'
    );
    assert.equal(row.runtime.deviceScaleFactor, row.settings.deviceScaleFactor, 'wrong actual DPR');
  }
  assert.equal(report.sizes.artifactDigest, report.identity.artifactDigest, 'wrong sizes artifact');
  assert.equal(
    artifact.digest(JSON.stringify(report.sizes.files)),
    report.identity.artifactDigest,
    'size metadata differs from artifact digest'
  );
  assert.deepEqual(
    report.sizes.rows.map((row) => row.route),
    budgets.routes
  );
  for (const row of report.sizes.rows) {
    const recorded = report.sizes.files[row.route + '.html'];
    for (const name of ['sha256', 'raw', 'gzip'])
      assert.equal(row[name], recorded[name], 'route size differs from actual metadata');
    const assets = [
      'styles.css',
      'theme.js',
      'space.js',
      'archive.js',
      'navigation.js',
      'assets/favicon.svg',
      ...(row.route === 'index' ? ['assets/vitalii-oborskyi-cutout.webp'] : []),
    ];
    assert.equal(
      row.totalGzipBytes,
      recorded.gzip + assets.reduce((sum, name) => sum + report.sizes.files[name].gzip, 0),
      'transfer differs from artifact metadata'
    );
    assert.ok(row.raw > 0 && row.raw <= budgets.htmlRawBytes, 'HTML byte budget');
    assert.ok(row.totalGzipBytes > 0 && row.totalGzipBytes <= budgets.routeGzipBytes);
    assert.ok(row.svgNodes > 0 && row.svgNodes <= budgets.svgElements);
  }
  const cycle = report.lifecycle;
  assert.equal(cycle.cycles, protocol.lifecycleCycles);
  assert.deepEqual(cycle.warmedRoutes, [...budgets.routes.slice(1), budgets.routes[0]]);
  assert.equal(
    cycle.samples.length,
    protocol.lifecycleCycles + 1,
    'incomplete lifecycle observation'
  );
  for (const [index, sample] of cycle.samples.entries()) {
    assert.equal(sample.cycle, index);
    assert.equal(
      sample.route,
      index === 0 ? 'index' : budgets.routes[index % budgets.routes.length]
    );
    assert.ok(sample.heapUsedBytes > 0 && sample.dom.documents > 0 && sample.dom.nodes > 0);
    assert.ok(sample.dom.jsEventListeners >= 0);
    assert.equal(sample.pendingRAF, 0, 'stopped motion retained RAF');
    checkRooms(sample.diagnostics);
  }
  // Compare the same warm Index state, not unrelated route node counts.
  const first = cycle.samples[0];
  const last = cycle.samples.at(-1);
  assert.equal(last.dom.documents, first.dom.documents, 'retained document growth');
  assert.ok(last.dom.nodes <= first.dom.nodes, 'retained DOM node growth');
  assert.ok(last.dom.jsEventListeners <= first.dom.jsEventListeners, 'retained listener growth');
  assert.deepEqual(cycle.errors, []);
  return true;
}

function compare(baseline, candidate) {
  validateReport(baseline, undefined, { limits: false });
  validateReport(candidate);
  assert.equal(baseline.identity.sourceCommit, baselineCommit, 'wrong approved-main baseline');
  assert.equal(baseline.identity.sourceTree, baselineTree, 'wrong approved-main baseline tree');
  assert.notEqual(candidate.identity.sourceCommit, baselineCommit, 'candidate is baseline');
  assert.equal(baseline.identity.variant.id, candidate.identity.variant.id, 'variant mismatch');
  assert.deepEqual(
    baseline.identity.variant.effects,
    candidate.identity.variant.effects,
    'effect composition mismatch'
  );
  assert.equal(baseline.browser, candidate.browser, 'browser changed');
  assert.deepEqual(baseline.environment, candidate.environment, 'runner changed');
  const observations = baseline.rows.map((before, index) => {
    const after = candidate.rows[index];
    return {
      route: before.route,
      profile: before.settings.id,
      qualityComparable: before.samples.every((sample, i) => {
        const baselineStates = qualityStates(before, sample);
        const candidateStates = qualityStates(after, after.samples[i]);
        return (
          baselineStates.every(
            (state) => JSON.stringify(state) === JSON.stringify(candidateStates[0])
          ) &&
          candidateStates.every(
            (state) => JSON.stringify(state) === JSON.stringify(baselineStates[0])
          )
        );
      }),
      samples: before.samples.map((sample, i) => ({
        kind: sample.kind,
        baselineP95Ms: sample.paintCallbackMs.p95,
        candidateP95Ms: after.samples[i].paintCallbackMs.p95,
        baselineBusyPercent: sample.callbackBusyPercent,
        candidateBusyPercent: after.samples[i].callbackBusyPercent,
      })),
    };
  });
  return {
    schema: 1,
    kind: 'refactor-metrics-comparison',
    measurementBaseline: protocol.baseline,
    baseline: baseline.identity,
    candidate: candidate.identity,
    observations,
    optimization: {
      disposition: 'deferred',
      demonstratedBenefit: false,
      reason:
        'One bounded lab comparison establishes applicable limits and hotspots, not a repeatable speedup. No speculative runtime optimization was introduced.',
    },
    fullGate: false,
    performanceAcceptance: false,
  };
}

function installLifecycleProbe() {
  const request = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  const pending = new Set();
  window.__refactorRAF = pending;
  window.requestAnimationFrame = (callback) => {
    const id = request((time) => {
      pending.delete(id);
      callback(time);
    });
    pending.add(id);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    pending.delete(id);
    cancel(id);
  };
  if (['http:', 'https:'].includes(location.protocol)) {
    localStorage.setItem('vo.theme', 'dark');
    localStorage.setItem('vo.motion', 'on');
  }
}

function measurementProbeScript() {
  // One init script gives the RAF/lifecycle and existing paint probes a defined
  // installation order. Both observers receive the same authored engine event.
  return `(() => {
    (${installLifecycleProbe.toString()})();
    (${motion.installProbe.toString()})();
    const motionProbe = window.SiteEngineProbe;
    (${paintProbe.toString()})();
    const ordinaryPaintProbe = window.SiteEngineProbe;
    window.SiteEngineProbe = (event) => {
      motionProbe(event);
      ordinaryPaintProbe(event);
    };
  })();`;
}

async function collectRow(browser, url, route, settings) {
  const context = await browser.newContext({
    viewport: { width: settings.width, height: settings.height },
    deviceScaleFactor: settings.deviceScaleFactor,
    reducedMotion: protocol.reducedMotion,
  });
  await context.addInitScript({ content: measurementProbeScript() });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const cdp = await context.newCDPSession(page);
  try {
    await cdp.send('Emulation.setCPUThrottlingRate', {
      rate: settings.cpuRate,
    });
    await page.goto(`${url}/${route}.html`);
    await page.waitForFunction(
      () => {
        const scene = document.querySelector('.space-scene');
        // Geometry readiness precedes the first paint that publishes quality.
        return (
          scene.dataset.ready === 'true' &&
          typeof scene.dataset.quality === 'string' &&
          typeof scene.dataset.cadence === 'string'
        );
      }
    );
    await page.evaluate(() => {
      const scene = document.querySelector('.space-scene');
      const rows = [
        { time: performance.now(), quality: scene.dataset.quality, cadence: scene.dataset.cadence },
      ];
      const observer = new MutationObserver((records) => {
        // Retain transient changes rather than only the final quality tier.
        for (const [index, mutation] of records.entries()) {
          const next = records
            .slice(index + 1)
            .find((candidate) => candidate.attributeName === mutation.attributeName);
          const value = next?.oldValue ?? scene.getAttribute(mutation.attributeName);
          const previous = rows.at(-1);
          rows.push({
            time: performance.now(),
            quality: mutation.attributeName === 'data-quality' ? value : previous.quality,
            cadence: mutation.attributeName === 'data-cadence' ? value : previous.cadence,
          });
        }
      });
      observer.observe(scene, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['data-quality', 'data-cadence'],
      });
      window.__refactorQuality = { rows, observer };
    });
    const warmup = await motion.collect(page, 'warmup', protocol.warmupMs);
    const samples = [await motion.collect(page, 'idle', protocol.measurementMs)];
    samples.push(await motion.collect(page, 'scroll', protocol.measurementMs));
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.start');
    const hotspotWindow = await motion.collect(page, 'hotspot', protocol.hotspotMs);
    const { profile: rawCPUProfile } = await cdp.send('Profiler.stop');
    await cdp.send('Profiler.disable');
    await page.locator('#space-motion').evaluate((element) => element.click());
    await page.waitForTimeout(200);
    samples.push(await motion.collect(page, 'off', protocol.stoppedMs));
    await page.locator('#space-motion').evaluate((element) => element.click());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(200);
    samples.push(await motion.collect(page, 'reduced', protocol.stoppedMs));
    const detail = await page.evaluate(() => ({
      diagnostics: window.SiteScene.diagnostics(),
      ribbons: {
        sceneHook: typeof window.SiteEffects?.scene,
        dataset: Object.fromEntries(
          Object.entries(document.querySelector('.space-scene').dataset).filter(([key]) =>
            key.startsWith('ribbon')
          )
        ),
      },
      paint: { ...window.__colorPaint },
      runtime: {
        navigationHook: typeof window.SiteEffects?.navigation,
        variant: document.querySelector('meta[name="site-variant"]').content,
        engine: document.querySelector('meta[name="site-engine"]').content,
        theme: document.documentElement.dataset.theme,
        viewport: { width: innerWidth, height: innerHeight },
        deviceScaleFactor: devicePixelRatio,
      },
    }));
    const qualityTrace = await page.evaluate(() => {
      window.__refactorQuality.observer.disconnect();
      return window.__refactorQuality.rows;
    });
    return {
      route,
      settings,
      warmup,
      samples,
      rawCPUProfile,
      hotspotWindow,
      qualityTrace,
      hotspots: cpuHotspots(rawCPUProfile),
      ...detail,
      errors,
    };
  } finally {
    await context.close();
  }
}

async function lifecycle(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: protocol.reducedMotion,
  });
  await context.addInitScript(installLifecycleProbe);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const cdp = await context.newCDPSession(page);
  async function navigate(route) {
    await page.evaluate((route) => {
      const href = route === 'index' ? './' : route + '.html';
      document.querySelector(`a[href="${href}"]`).click();
    }, route);
    await page.waitForFunction(
      (route) =>
        document.body.dataset.page === route &&
        !document.querySelector('#site-content').hasAttribute('aria-busy'),
      route
    );
    await page.waitForTimeout(50);
  }
  async function sample(cycle) {
    await page.evaluate(() => {
      if (window.__qualityMotion) {
        window.__qualityMotion.frames = [];
        window.__qualityMotion.events = [];
      }
    });
    await cdp.send('HeapProfiler.collectGarbage');
    return {
      cycle,
      heapUsedBytes: (await cdp.send('Runtime.getHeapUsage')).usedSize,
      dom: await cdp.send('Memory.getDOMCounters'),
      ...(await page.evaluate(() => ({
        route: document.body.dataset.page,
        pendingRAF: window.__refactorRAF.size,
        diagnostics: window.SiteScene.diagnostics(),
      }))),
    };
  }
  try {
    await page.goto(url + '/index.html');
    await page.waitForFunction(
      () => document.querySelector('.space-scene').dataset.ready === 'true'
    );
    await page.locator('#space-motion').evaluate((element) => element.click());
    const warmedRoutes = [...budgets.routes.slice(1), budgets.routes[0]];
    for (const route of warmedRoutes) await navigate(route);
    const samples = [await sample(0)];
    for (let cycle = 1; cycle <= protocol.lifecycleCycles; cycle++) {
      await navigate(budgets.routes[cycle % budgets.routes.length]);
      samples.push(await sample(cycle));
    }
    return { cycles: protocol.lifecycleCycles, warmedRoutes, samples, errors };
  } finally {
    await context.close();
  }
}

async function collect(directory, destination) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  const publicDir = path.join(directory, 'public');
  artifact.verify(publicDir, manifest);
  const source = identity(manifest);
  checkIdentity(source);
  let browser;
  const result = {
    schema: 1,
    kind: 'refactor-metrics',
    identity: source,
    protocol,
    budgets,
    browser: null,
    browserSettings: { engine: 'chromium', launch: launchOptions('chromium') },
    playwright: toolRequire('playwright/package.json').version,
    environment: environment(),
    collectorSources: collectorSources(),
    target: 'loopback-exact-public-artifact',
    sizes: artifact.checkSize(publicDir),
    rows: [],
    fullGate: false,
    performanceAcceptance: false,
  };
  const save = () => fs.writeFileSync(destination, JSON.stringify(result, null, 2) + '\n');
  const served = await require('./writing-probe.cjs').serve({ sample: { publicDir } });
  const server = served.server;
  const url = served.url + '/sample';
  try {
    browser = await toolRequire('playwright').chromium.launch(result.browserSettings.launch);
    result.browser = browser.version();
    for (const settings of protocol.profiles)
      for (const route of protocol.routes) {
        result.rows.push(await collectRow(browser, url, route, settings));
        save();
        process.stdout.write(`${source.variant.id} ${settings.id} ${route} measured\n`);
      }
    result.lifecycle = await lifecycle(browser, url);
    artifact.verify(publicDir, manifest);
    assert.deepEqual(
      result.collectorSources,
      collectorSources(),
      'collector changed during observation'
    );
    save();
    validateReport(result, source);
    return result;
  } catch (error) {
    result.error = error.stack;
    save();
    throw error;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

if (require.main === module) {
  const [mode, first, second, destination] = process.argv.slice(2);
  if (mode === 'collect')
    collect(path.resolve(first), path.resolve(second)).catch((error) => {
      console.error(error.stack);
      process.exitCode = 1;
    });
  else if (mode === 'compare')
    fs.writeFileSync(
      destination,
      JSON.stringify(
        compare(JSON.parse(fs.readFileSync(first)), JSON.parse(fs.readFileSync(second))),
        null,
        2
      ) + '\n'
    );
  else if (mode === 'verify') {
    assert.ok(second, 'trusted artifact directory required');
    const report = JSON.parse(fs.readFileSync(first));
    const manifest = JSON.parse(fs.readFileSync(path.join(second, 'artifact.json')));
    const publicDir = path.join(second, 'public');
    artifact.verify(publicDir, manifest);
    assert.deepEqual(
      report.sizes,
      artifact.checkSize(publicDir),
      'output byte observations differ from verified artifact'
    );
    validateReport(report, identity(manifest));
  } else
    throw Error(
      'Usage: refactor-metrics.cjs collect ARTIFACT OUT | compare BASE CAND OUT | verify REPORT ARTIFACT'
    );
}

module.exports = {
  frozenR2,
  baselineCommit,
  baselineTree,
  protocol,
  identity,
  checkIdentity,
  validateSample,
  checkRooms,
  cpuHotspots,
  collectorSources,
  measurementProbeScript,
  validateReport,
  compare,
  collect,
};
