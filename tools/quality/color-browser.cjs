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
  let lastSeamSettled = 0;
  function textRects(owner) {
    const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT);
    const rects = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects())
        rects.push([rect.left, rect.top, rect.width, rect.height]);
    }
    return rects;
  }
  function observeHeadingSeam(tiles, settled) {
    if (observation.headingSeam || settled <= lastSeamSettled) return;
    lastSeamSettled = settled;
    const native = content.querySelector('main h1');
    if (!native || native.style.visibility !== 'hidden') return;
    const nativeBox = native.getBoundingClientRect();
    // A settled piece has its complete cloned heading at the native border
    // box, even though only its own shard mask is painted. Compare the actual
    // glyph line boxes once, before that paint is removed at native handoff.
    for (const tile of tiles) {
      const copy = tile.querySelector('h1.fragment-paint');
      if (!copy || Number(tile.style.opacity) < 1) continue;
      const copyBox = copy.getBoundingClientRect();
      const boxDeltaPx = Math.max(
        ...['left', 'top', 'width', 'height'].map((key) => Math.abs(copyBox[key] - nativeBox[key]))
      );
      if (boxDeltaPx > 0.0001) continue;
      const nativeGlyphRects = textRects(native);
      const fragmentGlyphRects = textRects(copy);
      const matching =
        native.textContent === copy.textContent &&
        nativeGlyphRects.length > 0 &&
        nativeGlyphRects.length === fragmentGlyphRects.length;
      const glyphDeltaPx = matching
        ? Math.max(
            ...nativeGlyphRects.flatMap((rect, index) =>
              rect.map((value, axis) => Math.abs(value - fragmentGlyphRects[index][axis]))
            )
          )
        : null;
      observation.headingSeam = {
        boxDeltaPx,
        glyphDeltaPx,
        nativeGlyphRects,
        fragmentGlyphRects,
      };
      return;
    }
  }
  const sample = () => {
    if (observation.samples.length >= 400) return;
    const tiles = [...document.querySelectorAll('.fragment-piece')];
    const scene = document.querySelector('.space-scene');
    if (content.dataset.fragmentPhase === 'arrive')
      observeHeadingSeam(tiles, Number(content.dataset.fragmentSettled || 0));
    observation.samples.push({
      timeMs: performance.now(),
      page: document.body.dataset.page,
      direction: scene.dataset.direction,
      camera: scene.dataset.camera,
      y: scrollY,
      busy: content.hasAttribute('aria-busy'),
      inert: content.inert,
      phase: content.dataset.fragmentPhase || null,
      elapsedMs: Number(content.dataset.fragmentElapsedMs || 0),
      durationMs: Number(content.dataset.fragmentDurationMs || 0),
      settled: Number(content.dataset.fragmentSettled || 0),
      owners: Number(content.dataset.fragmentOwners || 0),
      pieces: tiles.length,
      layers: document.querySelectorAll('.fragment-layer').length,
      visiblePieces: tiles.filter((tile) => Number(tile.style.opacity || 0) > 0).length,
      transformedPieces: tiles.filter((tile) => tile.style.transform.startsWith('matrix3d('))
        .length,
      nativeOpacity: Number(content.style.opacity || 1),
      nativeHidden: [...content.querySelectorAll('[style*="visibility"]')].filter(
        (owner) => owner.style.visibility === 'hidden'
      ).length,
      headingSelected: content.querySelector('main h1')?.style.visibility === 'hidden',
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
      observation.longTasks.push({
        start: task.startTime,
        duration: task.duration,
      });
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
  validateHeadingSeam(observation.headingSeam);
  validateFragmentTiming(measured);
  assert.ok(
    arriving.every((row) => row.durationMs === first.durationMs),
    'incoming duration changed during assembly'
  );
  assert.ok(
    Math.abs(durationMs - first.durationMs) <= measured.paintIntervalsMs.max + 25,
    'observed assembly does not match its declared painted duration'
  );
  return {
    durationMs,
    settledCounts: [...counts],
    nativeHandoff: final,
    measured,
  };
}
function validateHeadingSeam(seam) {
  assert.ok(seam, 'settled incoming heading seam was not observed');
  assert.ok(
    Number.isFinite(seam.boxDeltaPx) && seam.boxDeltaPx <= 0.0001 && seam.boxDeltaPx >= 0,
    'heading seam was sampled before its border box settled'
  );
  for (const rects of [seam.nativeGlyphRects, seam.fragmentGlyphRects])
    assert.ok(
      Array.isArray(rects) &&
        rects.length > 0 &&
        rects.every(
          (rect) => Array.isArray(rect) && rect.length === 4 && rect.every(Number.isFinite)
        ),
      'heading seam lacks actual finite glyph line boxes'
    );
  assert.equal(seam.nativeGlyphRects.length, seam.fragmentGlyphRects.length);
  const observedGlyphDeltaPx = Math.max(
    ...seam.nativeGlyphRects.flatMap((rect, index) =>
      rect.map((value, axis) => Math.abs(value - seam.fragmentGlyphRects[index][axis]))
    )
  );
  assert.equal(seam.glyphDeltaPx, observedGlyphDeltaPx, 'heading seam summary is inconsistent');
  assert.ok(observedGlyphDeltaPx <= 0.75, 'incoming heading glyphs shift at native handoff');
}
function validateFragmentTiming(measured) {
  for (const value of [
    measured.paintCallbackMs?.p95,
    measured.paintCallbackMs?.max,
    measured.paintIntervalsMs?.max,
    measured.readyMs,
  ])
    assert.ok(Number.isFinite(value) && value >= 0, 'missing finite flight timing');
  assert.ok(Number.isInteger(measured.paints), 'missing integer actual flight paint count');
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
}
function validateFragmentRoute(observation, measured, expected) {
  const active = observation.samples.filter((sample) => sample.phase),
    final = observation.samples.at(-1);
  for (const phase of ['depart', 'arrive']) {
    const painted = active.filter((sample) => sample.phase === phase);
    assert.ok(
      painted.some(
        (sample) => sample.pieces > 0 && sample.visiblePieces > 0 && sample.transformedPieces > 0
      ),
      expected.from + '→' + expected.to + ' lacks actual ' + phase + ' fragments'
    );
    assert.ok(painted.every((sample) => sample.direction === expected.direction));
    assert.ok(
      painted.every((sample) => sample.page === (phase === 'depart' ? expected.from : expected.to)),
      'fragments belong to the wrong native route'
    );
  }
  assert.equal(final.page, expected.to);
  assert.equal(final.phase, null);
  assert.equal(final.pieces, 0);
  assert.equal(final.layers, 0);
  assert.equal(final.nativeHidden, 0);
  assert.equal(final.nativeOpacity, 1);
  assert.equal(final.busy, false);
  assert.equal(final.inert, false);
  assert.deepEqual(final.fragmentFields, []);
  const sourceCamera = JSON.parse(expected.sourceCamera || active[0].camera),
    targetCamera = JSON.parse(final.camera);
  for (const camera of [sourceCamera, targetCamera])
    for (const vector of [camera.position, camera.target])
      assert.ok(Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite));
  if (sourceCamera.position[2] !== targetCamera.position[2])
    assert.equal(
      expected.direction,
      targetCamera.position[2] < sourceCamera.position[2] ? 'forward' : 'backward',
      'fragment direction differs from the actual camera depth journey'
    );
  if (active.some((sample) => sample.phase === 'arrive' && sample.headingSelected))
    validateHeadingSeam(observation.headingSeam);
  validateFragmentTiming(measured);
  return {
    ...expected,
    departurePieces: Math.max(
      ...active.filter((sample) => sample.phase === 'depart').map((sample) => sample.pieces)
    ),
    arrivalPieces: Math.max(
      ...active.filter((sample) => sample.phase === 'arrive').map((sample) => sample.pieces)
    ),
    headingSeam: observation.headingSeam || null,
    nativeHandoff: final,
    measured,
    observation,
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

    // Keep the same forward route for the established Off cancellation check.
    // All-route and reverse choreography have their own focused observations.
    await preferences(page, 'fragment-flight-preview', false);
    await travel(page, 'index');
    await preferences(page, 'fragment-flight-preview', true);
    await page.locator('.appearance summary').click();
    await page.locator('.site-header nav a[href="research.html"]').click();
    await page.waitForFunction(
      () => document.getElementById('site-content').dataset.fragmentPhase === 'arrive',
      null,
      { polling: 20, timeout: 5000 }
    );
    await page.locator('#space-motion').click();
    // Off preserves the displayed camera and pauses any remaining journey.
    // Native route readiness and cleanup complete without a camera arrival.
    await page.waitForFunction(fragmentCancellationReady, 'research', {
      polling: 25,
      timeout: 10000,
    });
    evidence.canceled = await page.evaluate(fragmentCleanupState);
    assert.deepEqual(evidence.canceled, {
      pieces: 0,
      layers: 0,
      fragmentFields: [],
      nativeOpacity: 1,
      nativeHidden: 0,
      motion: 'Motion: off',
    });
    const before = await page.evaluate(fragmentFrozenState);
    const camera = JSON.parse(before.camera);
    for (const vector of [camera.position, camera.target])
      assert.ok(Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite));
    assert.ok(
      before.phase?.length && Number.isFinite(Number(before.phase)) && Number(before.phase) >= 0
    );
    assert.ok(['flying', 'settled'].includes(before.travel));
    await page.waitForTimeout(120);
    const after = await page.evaluate(fragmentFrozenState);
    assert.deepEqual(after, before, 'Off must preserve the displayed camera and ambient phase');
    evidence.offFreeze = { before, after };
    await page.locator('#space-motion').click();
    await settled(page, 'research');
    await page.locator('.appearance summary').click();
    await preferences(page, 'fragment-flight-preview', false);
    await travel(page, 'index');
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
async function triggerFragmentTrip(page, trip, direction) {
  if (trip.trigger === 'edge') {
    await edge(page, trip.to, direction === 'forward' ? 1 : -1);
    return;
  }
  if (trip.trigger === 'history') {
    await page.goBack();
    await settled(page, trip.to);
    return;
  }
  const selectors = {
    wordmark: '.site-header .wordmark',
    'footer-home': 'footer a[href="./#about"]',
    footer: 'footer a[href="credits.html"]',
    'cross-link': '#site-content main a[href="' + trip.to + '.html"]',
    header: '.site-header nav a[href="' + trip.to + '.html"]',
  };
  const link = page.locator(selectors[trip.trigger]);
  if (trip.trigger === 'cross-link') await link.first().evaluate((element) => element.click());
  else await link.click();
  await settled(page, trip.to);
}
async function fragmentRouteCoverage(page) {
  const evidence = { routes: [], interruption: null };
  try {
    await preferences(page, 'fragment-flight-preview', true);
    const order = await page.evaluate(() => [...window.SiteRoutes.order]);
    assert.deepEqual(order, ['index', 'research', 'writing', 'talks', 'credits']);
    const cases = [
      { to: 'research', trigger: 'header', position: 'middle' },
      { to: 'writing', trigger: 'edge', position: 'bottom' },
      { to: 'talks', trigger: 'header', position: 'middle' },
      { to: 'credits', trigger: 'footer', position: 'bottom' },
      { to: 'talks', trigger: 'edge', position: 'top' },
      { to: 'writing', trigger: 'header', position: 'middle' },
      { to: 'research', trigger: 'header', position: 'bottom' },
      { to: 'index', trigger: 'wordmark', position: 'middle' },
      { to: 'writing', trigger: 'cross-link', position: 'middle' },
      { to: 'credits', trigger: 'footer', position: 'bottom' },
      { to: 'index', trigger: 'footer-home', position: 'bottom' },
      { to: 'credits', trigger: 'history', position: 'preserved' },
      { to: 'index', trigger: 'wordmark', position: 'bottom' },
    ];
    for (const trip of cases) {
      if (trip.position !== 'preserved') {
        await page.evaluate((position) => {
          const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
          scrollTo({
            top: position === 'bottom' ? max : position === 'middle' ? max / 2 : 0,
            behavior: 'instant',
          });
        }, trip.position);
        await page.waitForTimeout(80);
      }
      const before = await state(page),
        direction = order.indexOf(trip.to) > order.indexOf(before.page) ? 'forward' : 'backward';
      evidence.pending = { ...trip, from: before.page, direction, before };
      await page.evaluate(observeFragmentFlight);
      await triggerFragmentTrip(page, trip, direction);
      const observation = await page.evaluate(() => window.__finishFragmentFlight()),
        measured = motion.summarize(observation, 'flight');
      Object.assign(evidence.pending, { observation, measured });
      evidence.routes.push(
        validateFragmentRoute(observation, measured, {
          ...trip,
          from: before.page,
          direction,
          sourceY: before.y,
          sourceMax: before.max,
          sourceCamera: before.scene.camera,
        })
      );
      delete evidence.pending;
    }

    // Reverse a real visible departure through VO while Home is still mounted.
    await page.evaluate(observeFragmentFlight);
    await page.locator('.site-header nav a[href="research.html"]').click();
    await page.waitForFunction(
      () =>
        document.getElementById('site-content').dataset.fragmentPhase === 'depart' &&
        [...document.querySelectorAll('.fragment-piece')].some(
          (piece) => Number(piece.style.opacity) > 0
        ),
      null,
      { polling: 20, timeout: 5000 }
    );
    const interrupted = await page.evaluate(() => window.__finishFragmentFlight());
    evidence.pending = { trigger: 'wordmark-interruption', interrupted };
    await page.evaluate(observeFragmentFlight);
    const retarget = await page.evaluate(() => {
      const scene = document.querySelector('.space-scene'),
        before = scene.dataset.camera;
      document.querySelector('.site-header .wordmark').click();
      return { before, after: scene.dataset.camera, nativePage: document.body.dataset.page };
    });
    assert.equal(retarget.nativePage, 'index');
    assert.equal(retarget.after, retarget.before, 'VO interruption preserves the displayed camera');
    await settled(page, 'index');
    const observation = await page.evaluate(() => window.__finishFragmentFlight()),
      measured = motion.summarize(observation, 'flight');
    Object.assign(evidence.pending, { retarget, observation, measured });
    evidence.interruption = {
      ...validateFragmentRoute(observation, measured, {
        from: 'index',
        to: 'index',
        direction: 'backward',
        trigger: 'wordmark-interruption',
      }),
      retarget,
      interrupted,
    };
    delete evidence.pending;
    return evidence;
  } catch (error) {
    const pending = await page
      .evaluate(() => window.__finishFragmentFlight?.() || null)
      .catch(() => null);
    if (pending) evidence.pending = { ...evidence.pending, observation: pending };
    evidence.failureState = await page.evaluate(fragmentCleanupState).catch(() => null);
    error.fragmentRouteObservation = evidence;
    throw error;
  }
}
function fragmentCancellationReady(route) {
  const content = document.getElementById('site-content');
  return (
    document.body.dataset.page === route &&
    !content.hasAttribute('aria-busy') &&
    document.getElementById('space-motion').textContent === 'Motion: off' &&
    document.querySelectorAll('.fragment-piece, .fragment-layer').length === 0 &&
    !Object.keys(content.dataset).some((key) => key.startsWith('fragment')) &&
    Number(content.style.opacity || 1) === 1 &&
    content.inert === false &&
    [...content.querySelectorAll('[style*="visibility"]')].every(
      (owner) => owner.style.visibility !== 'hidden'
    )
  );
}
function fragmentFrozenState() {
  const scene = document.querySelector('.space-scene');
  return {
    camera: scene.dataset.camera,
    phase: scene.dataset.phase,
    travel: scene.dataset.travel,
  };
}
function fragmentCleanupState() {
  const content = document.getElementById('site-content');
  return {
    pieces: document.querySelectorAll('.fragment-piece').length,
    layers: document.querySelectorAll('.fragment-layer').length,
    fragmentFields: Object.keys(content.dataset).filter((key) => key.startsWith('fragment')),
    nativeOpacity: Number(content.style.opacity || 1),
    nativeHidden: [...content.querySelectorAll('[style*="visibility"]')].filter(
      (owner) => owner.style.visibility === 'hidden'
    ).length,
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
      fragments: document.getElementById('fragment-flight-preview')?.checked,
    }));
    assert.equal(identity.id, 'color');
    assert.equal(identity.engine, artifact.variant.fingerprint);
    assert.equal(identity.flight, true);
    assert.equal(identity.edge, true);
    assert.equal(identity.fragments, true, 'fragment flight is the default Color presentation');
    // Preserve the existing plane observations as an explicit legacy comparison.
    await preferences(page, 'fragment-flight-preview', false);
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
    await page.waitForFunction(() => window.__colorPaint?.completed > 0, null, {
      polling: 50,
    });
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
    await page.evaluate(() =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    );
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(350);
    assert.equal((await state(page)).page, 'credits', 'Credits is the last itinerary route');
    await travel(page, 'index');
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, -320);
    await page.waitForTimeout(350);
    assert.equal((await state(page)).page, 'index', 'Home has no preceding route');
    colorPaint(await state(page));
    const fragments = await fragmentAssembly(page);
    const fragmentRoutes = await fragmentRouteCoverage(page);
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
        defaultFragments: true,
        allRouteFragments: true,
        interruptedFragments: true,
      },
      home: { motion: homeMotion, scroll: homeScroll, edge: homeEdge },
      flight,
      fragments,
      fragmentRoutes,
    };
  } finally {
    await context.close();
  }
}
function failedScenario(error, engine, width, theme) {
  const row = { engine, width, theme, pass: false, error: error.message };
  if (error.fragmentObservation) row.fragments = error.fragmentObservation;
  if (error.fragmentRouteObservation) row.fragmentRoutes = error.fragmentRouteObservation;
  return row;
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
              rows.push(failedScenario(error, engine, width, theme));
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
  fragmentCancellationReady,
  validateFragmentRoute,
  fragmentRouteCoverage,
};
