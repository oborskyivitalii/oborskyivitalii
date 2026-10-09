'use strict';
// Authored Color behavior against the same exact artifact used by generic smoke.
const assert = require('node:assert/strict'),
  fs = require('node:fs');
const { toolRequire, report, launchOptions } = require('./common.cjs'),
  { start } = require('./serve.cjs');
const { paintProbe: canvasPaintProbe, liveScrollPrecondition } = require('./engine-browser.cjs'),
  { probe: scrollProbe } = require('./scroll-browser.cjs');
const { colorPaint } = require('./validate.cjs');
const motion = require('./motion.cjs'),
  { transition: flightBudgets } = require('./budgets.json').motion;
function paintProbe() {
  const paint = { completed: 0, ordinaryShapes: 0, customShapes: 0 };
  const raf = window.requestAnimationFrame;
  window.__colorPaint = paint;
  window.requestAnimationFrame = (callback) =>
    raf((time) => {
      const observation = window.__fragmentFlight;
      if (!observation) return callback(time);
      const started = performance.now(),
        before = window.__quality.paints;
      callback(time);
      observation.frames.push({
        time,
        started,
        duration: performance.now() - started,
        painted: window.__quality.paints > before,
      });
    });
  window.SiteEngineProbe = (sample) => {
    window.__fragmentFlight?.events.push(sample);
    if (sample.kind !== 'paint') return;
    paint.completed++;
    paint.ordinaryShapes = sample.ordinaryShapes;
    paint.customShapes = sample.customShapes;
  };
}
function observeFragmentFlight() {
  const content = document.getElementById('site-content'),
    observation = {
      schema: 2,
      start: performance.now(),
      samples: [],
      frames: [],
      events: [],
      longTasks: [],
    };
  const sample = () => {
    if (observation.samples.length >= 400) return;
    const tiles = [...document.querySelectorAll('.fragment-piece')];
    observation.samples.push({
      timeMs: performance.now(),
      phase: content.dataset.fragmentPhase || null,
      elapsedMs: Number(content.dataset.fragmentElapsedMs || 0),
      durationMs: Number(content.dataset.fragmentDurationMs || 0),
      settled: Number(content.dataset.fragmentSettled || 0),
      owners: Number(content.dataset.fragmentOwners || 0),
      pieces: tiles.length,
      visiblePieces: tiles.filter((tile) => Number(tile.style.opacity || 0) > 0).length,
      transformedPieces: tiles.filter((tile) => tile.style.transform.startsWith('matrix3d('))
        .length,
      nativeOpacity: Number(content.style.opacity || 1),
      nativeHidden: [
        ...content.querySelectorAll('main h1, main h2, main h3, main p, main img'),
      ].filter((owner) => owner.style.visibility === 'hidden').length,
      fragmentFields: Object.keys(content.dataset).filter((key) => key.startsWith('fragment')),
    });
  };
  const observer = new MutationObserver(sample);
  observer.observe(content, {
    attributes: true,
    attributeFilter: [
      'data-fragment-phase',
      'data-fragment-elapsed-ms',
      'data-fragment-duration-ms',
      'data-fragment-settled',
      'data-fragment-pieces',
      'data-fragment-owners',
      'style',
      'aria-busy',
    ],
  });
  let tasks = null;
  try {
    tasks = new PerformanceObserver((list) => {
      for (const task of list.getEntries())
        observation.longTasks.push({
          start: task.startTime,
          duration: task.duration,
        });
    });
    tasks.observe({ type: 'longtask' });
  } catch {
    /* Callback timing and real Canvas observations remain available. */
  }
  window.__fragmentFlight = observation;
  window.__finishFragmentFlight = () => {
    sample();
    observer.disconnect();
    for (const task of tasks?.takeRecords?.() || [])
      observation.longTasks.push({ start: task.startTime, duration: task.duration });
    tasks?.disconnect();
    observation.end = performance.now();
    observation.elapsed = observation.end - observation.start;
    window.__fragmentFlight = null;
    delete window.__finishFragmentFlight;
    return observation;
  };
  sample();
}
function validateFragmentAssembly(observation, measured) {
  const arriving = observation.samples.filter((row) => row.phase === 'arrive');
  assert.ok(arriving.length >= 8, 'missing painted incoming fragment samples');
  const first = arriving[0],
    final = observation.samples.find((row) => row.timeMs > first.timeMs && !row.phase),
    counts = new Set(arriving.map((row) => row.settled));
  assert.ok(final, 'incoming fragments never handed back to native content');
  const durationMs = final.timeMs - first.timeMs;
  assert.ok(durationMs >= 1000 && durationMs <= 2000, 'incoming assembly outside 1–2 seconds');
  assert.ok(
    first.durationMs >= 1000 && first.durationMs <= 1800,
    'missing bounded incoming duration'
  );
  assert.ok(first.elapsedMs < 200, 'incoming start was not observed');
  assert.ok(
    arriving.some((row) => row.elapsedMs >= first.durationMs - 180),
    'incoming tail was not observed'
  );
  assert.ok(counts.size >= 3, 'pieces did not settle in successive groups');
  assert.ok(
    arriving.some((row) => row.settled > 0 && row.settled < row.pieces),
    'all incoming fragments settled together'
  );
  assert.ok(
    arriving.some((row) => row.visiblePieces > 0 && row.transformedPieces > 0),
    'no actual incoming native paint transforms'
  );
  assert.ok(
    arriving.every((row) => row.owners >= 3),
    'incoming visible owners were not captured'
  );
  assert.ok(
    arriving.every((row) => row.nativeHidden >= row.owners),
    'selected native text faded in over its fragment assembly'
  );
  assert.ok(
    arriving.every((row) => row.elapsedMs < 300 || row.nativeOpacity === 1),
    'reading surfaces remained hidden until the final text handoff'
  );
  assert.equal(final.pieces, 0, 'incoming decorative pieces remain');
  assert.equal(final.nativeHidden, 0, 'native owners remain hidden after handoff');
  assert.equal(final.nativeOpacity, 1, 'native reading content was not restored');
  assert.deepEqual(final.fragmentFields, [], 'fragment counters remain after handoff');
  for (const value of [
    measured.paintCallbackMs?.p95,
    measured.paintCallbackMs?.max,
    measured.paintIntervalsMs?.max,
    measured.readyMs,
  ])
    assert.ok(Number.isFinite(value) && value >= 0, 'missing finite flight timing');
  assert.ok(Number.isInteger(measured.paints), 'missing integer actual flight paint count');
  assert.ok(
    arriving.every((row) => row.durationMs === first.durationMs),
    'incoming duration changed during assembly'
  );
  assert.ok(
    Math.abs(durationMs - first.durationMs) <= measured.paintIntervalsMs.max + 25,
    'observed assembly does not match its declared painted duration'
  );
  assert.ok(measured.paints >= flightBudgets.minimumPaints, 'missing actual flight paint work');
  assert.ok(measured.paintCallbackMs.p95 <= flightBudgets.paintCallbackP95Ms, 'slow flight p95');
  assert.ok(
    measured.paintCallbackMs.max <= flightBudgets.paintCallbackMaxMs,
    'slow flight callback'
  );
  assert.ok(measured.paintIntervalsMs.max <= flightBudgets.paintGapMaxMs, 'flight paint stalled');
  assert.ok(
    measured.readyMs > 0 && measured.readyMs <= flightBudgets.readyMaxMs,
    'slow flight ready'
  );
  return {
    durationMs,
    settledCounts: [...counts],
    nativeHandoff: final,
    measured,
  };
}
async function settled(page, route) {
  await page.waitForFunction(
    (id) =>
      document.body.dataset.page === id &&
      !document.getElementById('site-content').hasAttribute('aria-busy') &&
      document.querySelector('.space-scene').dataset.travel === 'settled',
    route,
    { polling: 25, timeout: 10000 }
  );
}
async function travel(page, route) {
  const selector =
    route === 'credits'
      ? 'footer a[href="credits.html"]'
      : '.site-header nav a[href="' + (route === 'index' ? './' : route + '.html') + '"]';
  await page.locator(selector).click();
  await settled(page, route);
}
async function state(page) {
  return page.evaluate(() => {
    const scene = document.querySelector('.space-scene');
    const plane = document.getElementById('site-content');
    const ribbonDataset = Object.fromEntries(
      Object.entries(scene.dataset).filter(([key]) => key.startsWith('ribbon'))
    );
    return {
      page: document.body.dataset.page,
      scene: { ...scene.dataset },
      plane: { ...plane.dataset },
      transform: plane.style.transform,
      y: scrollY,
      max: Math.max(0, document.documentElement.scrollHeight - innerHeight),
      ribbons: {
        sceneHook: typeof window.SiteEffects?.scene,
        dataset: ribbonDataset,
      },
      paint: { ...window.__colorPaint },
    };
  });
}
async function forwardFlight(page) {
  await page.locator('.site-header nav a[href="research.html"]').click();
  const samples = [];
  for (let i = 0; i < 200; i++) {
    const row = await state(page);
    samples.push(row);
    if (row.page === 'research' && row.scene.travel === 'settled') break;
    await page.waitForTimeout(20);
  }
  assert.ok(
    samples.some((s) => s.plane.flightStage === 'depart' && Number(s.plane.flightDepth) > 0),
    'forward departure passes the viewer'
  );
  assert.ok(
    samples.some((s) => s.plane.flightStage === 'arrive' && Number(s.plane.flightDepth) < 0),
    'next text approaches from depth'
  );
  assert.ok(
    samples.some((s) => s.transform.includes('translateZ(')),
    'actual spatial text transform'
  );
  assert.ok(
    samples.some((s) => s.scene.travel === 'flying'),
    'actual camera flight'
  );
  await settled(page, 'research');
  return samples;
}
async function edge(page, route, direction) {
  await page.evaluate(
    (d) =>
      scrollTo({
        top: d < 0 ? 0 : document.documentElement.scrollHeight,
        behavior: 'instant',
      }),
    direction
  );
  await page.waitForTimeout(900);
  await page.mouse.move(200, 150);
  await page.mouse.wheel(0, direction * 320);
  await settled(page, route);
}
async function preferences(page, id, value) {
  await page.evaluate(
    ({ id, value }) => {
      const input = document.getElementById(id);
      input.checked = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    { id, value }
  );
}
async function fragmentAssembly(page) {
  const evidence = {};
  try {
    await preferences(page, 'fragment-flight-preview', true);
    await page.evaluate(observeFragmentFlight);
    await travel(page, 'research');
    evidence.observation = await page.evaluate(() => window.__finishFragmentFlight());
    evidence.measured = motion.summarize(evidence.observation, 'flight');
    Object.assign(evidence, validateFragmentAssembly(evidence.observation, evidence.measured));

    // Use the identical forward route for cancellation, avoiding reverse-anchor
    // admission as a separate concern of this incoming-only refinement.
    await preferences(page, 'fragment-flight-preview', false);
    await travel(page, 'index');
    await preferences(page, 'fragment-flight-preview', true);
    await page.locator('.site-header nav a[href="research.html"]').click();
    await page.waitForFunction(
      () => document.getElementById('site-content').dataset.fragmentPhase === 'arrive',
      null,
      { polling: 20, timeout: 5000 }
    );
    await page.locator('#space-motion').click();
    await settled(page, 'research');
    evidence.canceled = await page.evaluate(fragmentCleanupState);
    assert.deepEqual(evidence.canceled, {
      pieces: 0,
      layers: 0,
      fragmentFields: [],
      nativeOpacity: 1,
      nativeHidden: 0,
      motion: 'Motion: off',
    });
    await preferences(page, 'fragment-flight-preview', false);
    await travel(page, 'index');
    await page.locator('#space-motion').click();
    return evidence;
  } catch (error) {
    // Keep the original failure even if the browser is gone. Measurements made
    // before a wait/validation/cancellation failure remain inspectable in CI.
    const pending = await page
      .evaluate(() => window.__finishFragmentFlight?.() || null)
      .catch(() => null);
    if (pending && !evidence.observation) {
      evidence.observation = pending;
      try {
        evidence.measured = motion.summarize(pending, 'flight');
      } catch (captureError) {
        evidence.captureError = captureError.message;
      }
    }
    evidence.failureState = await page.evaluate(fragmentCleanupState).catch(() => null);
    error.fragmentObservation = evidence;
    throw error;
  }
}
function fragmentCleanupState() {
  const content = document.getElementById('site-content');
  return {
    pieces: document.querySelectorAll('.fragment-piece').length,
    layers: document.querySelectorAll('.fragment-layer').length,
    fragmentFields: Object.keys(content.dataset).filter((key) => key.startsWith('fragment')),
    nativeOpacity: Number(content.style.opacity || 1),
    nativeHidden: [
      ...content.querySelectorAll('main h1, main h2, main h3, main p, main img'),
    ].filter((owner) => owner.style.visibility === 'hidden').length,
    motion: document.getElementById('space-motion').textContent,
  };
}
async function scenario(browser, url, artifact, engine, width, theme) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    reducedMotion: 'no-preference',
  });
  const errors = [];
  try {
    await context.addInitScript(canvasPaintProbe);
    await context.addInitScript(paintProbe);
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url + '/index.html');
    await settled(page, 'index');
    await page.evaluate((mode) => {
      const control = document.getElementById('theme-mode');
      control.value = mode;
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }, theme);
    const identity = await page.evaluate(() => ({
      id: document.querySelector('meta[name="site-variant"]').content,
      engine: document.querySelector('meta[name="site-engine"]').content,
      flight: document.getElementById('content-flight')?.checked,
      edge: document.getElementById('end-scroll')?.checked,
    }));
    assert.equal(identity.id, 'color');
    assert.equal(identity.engine, artifact.variant.fingerprint);
    assert.equal(identity.flight, true);
    assert.equal(identity.edge, true);
    assert.equal(
      await page.locator('#surface-mode,[data-glass-visible]').count(),
      0,
      'retired reading effect has no controls'
    );
    const backdropBlur = await page.evaluate(() =>
      [...document.querySelectorAll('main *')].some((element) => {
        const css = getComputedStyle(element, '::before');
        return css.backdropFilter && css.backdropFilter !== 'none';
      })
    );
    assert.equal(backdropBlur, false, 'no retired backdrop blur');
    await page.waitForFunction(() => window.__colorPaint?.completed > 0, null, { polling: 50 });
    const rendered = await state(page);
    colorPaint(rendered);
    const homeMotion = await liveScrollPrecondition(page);
    const homeScroll = await scrollProbe(page, 'selected-responses', 'index');
    assert.equal(
      homeMotion.after?.label || homeMotion.before.label,
      'Motion: on',
      'Home range checked with live motion'
    );
    await edge(page, 'research', 1);
    const homeEdge = await state(page);
    assert.equal(homeEdge.page, 'research', 'shortened Home continues to Research');
    await travel(page, 'index');
    const flight = await forwardFlight(page);
    await edge(page, 'writing', 1);
    await edge(page, 'research', -1);
    const reverse = await state(page);
    assert.ok(Math.abs(reverse.y - reverse.max) <= 2, 'reverse arrives at real native bottom');
    await preferences(page, 'end-scroll', false);
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(350);
    assert.equal((await state(page)).page, 'research', 'disabled edge scrolling remains native');
    await preferences(page, 'end-scroll', true);
    await travel(page, 'credits');
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(350);
    assert.equal((await state(page)).page, 'credits', 'Credits stays outside itinerary');
    await travel(page, 'index');
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, -320);
    await page.waitForTimeout(350);
    assert.equal((await state(page)).page, 'index', 'Home has no preceding route');
    colorPaint(await state(page));
    const fragments = await fragmentAssembly(page);
    colorPaint(await state(page));
    assert.deepEqual(errors, []);
    return {
      engine,
      width,
      theme,
      pass: true,
      identity,
      ribbons: rendered.ribbons,
      paint: rendered.paint,
      checks: {
        shortenedHomeRange: true,
        homeForwardEdge: true,
        spatialFlight: true,
        forwardEdge: true,
        reverseNativeBottom: true,
        disabledEdge: true,
        creditsBoundary: true,
        homeBoundary: true,
        retiredReadingEffectAbsent: true,
      },
      home: { motion: homeMotion, scroll: homeScroll, edge: homeEdge },
      flight,
      fragments,
    };
  } finally {
    await context.close();
  }
}
async function main(options = {}) {
  const artifact = JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST)),
    pw = toolRequire('playwright'),
    smoke = options.smoke ?? process.argv.includes('--smoke');
  assert.equal(artifact.variant?.id, 'color', 'Color behavior requires a declared Color artifact');
  assert.deepEqual(artifact.variant.effects, ['travel'], 'current Color effect composition');
  assert.equal(artifact.variant.fingerprint, artifact.components.engine);
  assert.deepEqual(artifact.variant, artifact.components.variant);
  const { server, url } = await start(),
    rows = [],
    browsers = [];
  let pass = true;
  try {
    for (const engine of smoke ? ['chromium'] : ['chromium', 'firefox', 'webkit']) {
      const browser = await pw[engine].launch(launchOptions(engine));
      browsers.push({ engine, version: browser.version() });
      try {
        for (const width of [1440, 390])
          for (const theme of smoke ? ['light'] : ['light', 'dark']) {
            try {
              rows.push(await scenario(browser, url, artifact, engine, width, theme));
            } catch (error) {
              pass = false;
              rows.push({
                engine,
                width,
                theme,
                pass: false,
                error: error.message,
                ...(error.fragmentObservation ? { fragments: error.fragmentObservation } : {}),
              });
            }
          }
      } finally {
        await browser.close();
      }
    }
  } finally {
    server.close();
  }
  report(
    smoke ? 'color-preview-smoke' : 'color-functional',
    {
      smoke,
      variant: artifact.variant,
      browsers,
      rows,
      ...(smoke ? { profile: 'preview', fullGate: false, deploymentAuthorized: false } : {}),
    },
    pass
  );
  assert.ok(pass, 'Color browser scenarios failed');
}
if (require.main === module)
  main().catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = {
  main,
  scenario,
  settled,
  paintProbe,
  validateFragmentAssembly,
  fragmentAssembly,
};
