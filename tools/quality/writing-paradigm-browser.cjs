'use strict';
// Focused #36 evidence; this does not replace hosted/native release profiles.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const { pathToFileURL } = require('node:url');
const artifact = require('./artifact.cjs'),
  { toolRequire, launchOptions, environment, variant } = require('./common.cjs');
const { serve, ready } = require('./writing-probe.cjs'),
  functional = require('./functional.cjs');
function physicalFormulaBounds(args, matrix, canvas, viewport) {
  // Canvas commands are backing-store coordinates after its current transform.
  // CSS zoom and DPR are reflected by the physical rectangle/backing ratios.
  const [x, y, width, height] = args.length === 8 ? args.slice(4) : args;
  const corners = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ].map(([u, v]) => [
    canvas.x + ((matrix.a * u + matrix.c * v + matrix.e) * canvas.width) / canvas.backingWidth,
    canvas.y + ((matrix.b * u + matrix.d * v + matrix.f) * canvas.height) / canvas.backingHeight,
  ]);
  const xs = corners.map((point) => point[0]),
    ys = corners.map((point) => point[1]),
    left = Math.min(...xs),
    top = Math.min(...ys);
  return {
    x: left,
    y: top,
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - top,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    coordinateSpace: 'physical-css-pixels',
    canvas,
  };
}
async function initialize(context, options) {
  await context.addInitScript({
    content: 'window.__physicalFormulaBounds=' + physicalFormulaBounds.toString() + ';',
  });
  await context.addInitScript({
    content: 'window.__formulaOwnershipSnapshot=' + ownershipSnapshot.toString() + ';',
  });
  await context.addInitScript(observeFormula, options);
}
function ownershipSnapshot() {
  const probe = window.__formulaQA,
    scene = document.querySelector('.space-scene'),
    fallback = document.querySelector('.space-fallback [data-formula="writing-paradigm"]'),
    style = fallback && getComputedStyle(fallback);
  return {
    time: performance.now(),
    route: document.body.dataset.page,
    mode: scene.dataset.ready === 'true' ? 'canvas' : 'static',
    motion: document.querySelector('#space-motion').textContent,
    fallbackVisible: !!style && style.visibility !== 'hidden' && style.display !== 'none',
    bitmapFormula: !!probe.bitmapFormula,
    paints: probe.paints,
    draws: probe.draws,
    callbacks: probe.callbacks,
    phase: scene.dataset.phase,
    camera: scene.dataset.camera,
    scrollY,
    formula: window.SiteScene.formulaDiagnostics(),
  };
}
function observeFormula({ theme = 'dark', cacheFault = false, motion = 'on' } = {}) {
  // Playwright also injects into the initial opaque about:blank document.
  // Observe only served/offline site documents; storage failures there still fail.
  if (!['http:', 'https:', 'file:'].includes(location.protocol)) return;
  localStorage.setItem('vo.theme', theme);
  localStorage.setItem('vo.content-flight', 'on');
  localStorage.setItem('vo.motion', motion);
  window.__formulaQA = {
    paints: 0,
    draws: 0,
    drawSubmissions: 0,
    callbacks: 0,
    maxPerPaint: 0,
    maxSubmissionsPerPaint: 0,
    bounds: [],
    duplicate: false,
    startPaintCount: 0,
    bitmapFormula: false,
  };
  const record = (kind) => {
    if (window.__formulaOwnership)
      window.__formulaOwnership.events.push({ kind, ...window.__formulaOwnershipSnapshot() });
  };
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = function (callback) {
    return raf.call(this, (time) => {
      window.__formulaQA.callbacks++;
      return callback(time);
    });
  };
  const proto = CanvasRenderingContext2D.prototype,
    clear = proto.clearRect,
    draw = proto.drawImage,
    paths = new WeakMap(),
    clips = new WeakMap(),
    stacks = new WeakMap();
  const begin = proto.beginPath,
    move = proto.moveTo,
    line = proto.lineTo,
    clip = proto.clip,
    save = proto.save,
    restore = proto.restore;
  proto.beginPath = function (...args) {
    paths.set(this, []);
    return begin.apply(this, args);
  };
  for (const [name, original] of [
    ['moveTo', move],
    ['lineTo', line],
  ])
    proto[name] = function (x, y, ...args) {
      paths.get(this)?.push([x, y]);
      return original.call(this, x, y, ...args);
    };
  proto.clip = function (...args) {
    const matrix = this.getTransform(),
      rect = this.canvas.getBoundingClientRect();
    clips.set(
      this,
      (paths.get(this) || []).map(([x, y]) => ({
        raw: [x, y],
        physical: [
          rect.x + ((matrix.a * x + matrix.c * y + matrix.e) * rect.width) / this.canvas.width,
          rect.y + ((matrix.b * x + matrix.d * y + matrix.f) * rect.height) / this.canvas.height,
        ],
      }))
    );
    return clip.apply(this, args);
  };
  proto.save = function (...args) {
    const stack = stacks.get(this) || [];
    stack.push(clips.get(this));
    stacks.set(this, stack);
    return save.apply(this, args);
  };
  proto.restore = function (...args) {
    clips.set(this, stacks.get(this)?.pop());
    return restore.apply(this, args);
  };
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    const visible = this.canvas.id === 'space-canvas';
    if (visible) {
      window.__formulaQA.paints++;
      window.__formulaQA.perPaint = 0;
      window.__formulaQA.perPaintSubmissions = 0;
      window.__formulaQA.bitmapFormula = false;
    }
    const result = clear.apply(this, args);
    if (visible) record('paint-clear');
    return result;
  };
  CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
    if (this.canvas.id === 'space-canvas' && image.width === 1380 && image.height === 240) {
      const probe = window.__formulaQA,
        projection = window.SiteScene.formulaDiagnostics().projection;
      probe.drawSubmissions++;
      probe.perPaintSubmissions = (probe.perPaintSubmissions || 0) + 1;
      probe.bitmapFormula = true;
      const first = probe.perPaintSubmissions === 1;
      if (first) {
        probe.draws++;
        probe.perPaint = 1;
      }
      probe.maxPerPaint = Math.max(probe.maxPerPaint, probe.perPaint);
      probe.maxSubmissionsPerPaint = Math.max(
        probe.maxSubmissionsPerPaint,
        probe.perPaintSubmissions
      );
      const budget = projection?.layers * projection?.strips * 2;
      probe.duplicate =
        probe.duplicate ||
        !(Number.isInteger(budget) && budget > 0) ||
        probe.perPaintSubmissions > budget;
      const rect = this.canvas.getBoundingClientRect();
      const canvas = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        backingWidth: this.canvas.width,
        backingHeight: this.canvas.height,
      };
      if (first)
        probe.bounds.push({
          route: document.body.dataset.page,
          viewportWidth: innerWidth,
          viewportHeight: innerHeight,
          coordinateSpace: 'physical-css-pixels',
          canvas,
          projection: JSON.parse(JSON.stringify(projection)),
          clips: [],
          rawVertices: [],
        });
      const row = probe.bounds.at(-1),
        triangle = clips.get(this) || [];
      row.clips.push(triangle.map((point) => point.physical));
      row.rawVertices.push(...triangle.map((point) => point.raw));
      const points = row.clips.flat(),
        xs = points.map((point) => point[0]),
        ys = points.map((point) => point[1]);
      row.x = Math.min(...xs);
      row.y = Math.min(...ys);
      row.width = Math.max(...xs) - row.x;
      row.height = Math.max(...ys) - row.y;
      if (probe.bounds.length > 2000) probe.bounds.shift();
      if (first) record('formula-draw');
    }
    return draw.call(this, image, ...args);
  };
  if (cacheFault) {
    const context = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args) {
      if (this.width === 1380 && this.height === 240) throw Error('Controlled formula cache fault');
      return context.apply(this, args);
    };
  }
}
function finiteBounds(rows) {
  assert.ok(rows.length > 0, 'actual formula draw evidence');
  for (const row of rows) {
    for (const key of ['x', 'y', 'width', 'height'])
      assert.ok(Number.isFinite(row[key]), 'finite formula ' + key);
    assert.ok(row.width > 0 && row.height > 0, 'positive formula size');
    assert.ok(
      row.x >= 15 && row.x + row.width <= row.viewportWidth - 15,
      'whole expression fits horizontally'
    );
    assert.ok(
      row.y >= 0 && row.y + row.height <= row.viewportHeight,
      'whole expression fits vertically'
    );
    assert.equal(row.coordinateSpace, 'physical-css-pixels', 'physical Canvas evidence');
    for (const key of ['x', 'y', 'width', 'height', 'backingWidth', 'backingHeight'])
      assert.ok(Number.isFinite(row.canvas?.[key]), 'finite Canvas ' + key);
    for (const key of ['width', 'height', 'backingWidth', 'backingHeight'])
      assert.ok(row.canvas[key] > 0, 'positive Canvas ' + key);
    const projection = row.projection;
    assert.equal(projection?.strategy, 'perspective-extruded');
    assert.equal(projection.layers, 3);
    assert.equal(projection.strips, 4);
    for (const key of ['worldCenter', 'rootCenter'])
      assert.ok(
        Array.isArray(projection[key]) &&
          projection[key].length === 3 &&
          projection[key].every(Number.isFinite),
        'finite world ' + key
      );
    assert.ok(
      Math.hypot(
        ...projection.worldCenter.map((value, index) => value - projection.rootCenter[index])
      ) < 1,
      'formula remains at Writing fractal center'
    );
    assert.ok(
      projection.depth > 0.5 &&
        projection.extrusion > 0 &&
        projection.pulse > 0 &&
        Number.isFinite(projection.clock),
      'world depth/extrusion/shared-clock evidence'
    );
    assert.ok(
      Array.isArray(projection.worldCorners) &&
        projection.worldCorners.length === 4 &&
        projection.worldCorners.every(
          (point) => point.length === 3 && point.every(Number.isFinite)
        ),
      'world plane corners'
    );
    assert.ok(
      Array.isArray(projection.corners) &&
        projection.corners.length === 4 &&
        projection.corners.every((point) => point.length === 2 && point.every(Number.isFinite)),
      'projected world quadrilateral'
    );
    assert.ok(
      Array.isArray(row.clips) &&
        row.clips.length === 24 &&
        row.clips.every(
          (triangle) =>
            triangle.length === 3 &&
            triangle.every((point) => point.length === 2 && point.every(Number.isFinite))
        ),
      'bounded actual triangle-clipped Canvas submissions'
    );
    for (const corner of projection.corners)
      assert.ok(
        row.rawVertices.some(
          (point) => Math.hypot(point[0] - corner[0], point[1] - corner[1]) < 1e-6
        ),
        'projected front corner occurs in actual Canvas clip'
      );
    const [a, b, c, d] = projection.corners;
    assert.ok(
      Math.hypot(a[0] + c[0] - b[0] - d[0], a[1] + c[1] - b[1] - d[1]) > 0.001,
      'perspective quadrilateral differs from screen rectangle'
    );
  }
}
async function frameBand(page) {
  await page.waitForSelector('[data-writing-formula-description]', {
    state: 'attached',
    timeout: 5000,
  });
  const description = await page.locator('[data-writing-formula-description]').textContent();
  assert.match(description || '', /y\s*=\s*f\(x\)/);
  assert.match(description || '', /P\(y\|x\)/);
  await require('./engine-browser.cjs').liveScrollPrecondition(page);
  for (const fraction of [0, 0.15, 0.3, 0.45, 0.6, 0.75]) {
    await page.evaluate(
      (fraction) =>
        scrollTo({
          top: (document.documentElement.scrollHeight - innerHeight) * fraction,
          behavior: 'instant',
        }),
      fraction
    );
    await require('./engine-browser.cjs').settledCamera(page);
    const framed = await page.evaluate(() => {
      const row = window.__formulaQA.bounds.at(-1);
      return (
        window.SiteScene.formulaDiagnostics().lastPaintCount === 1 &&
        row &&
        row.x >= 15 &&
        row.x + row.width <= innerWidth - 15 &&
        row.y >= 0 &&
        row.y + row.height <= innerHeight
      );
    });
    if (framed) return { description, fraction };
  }
  assert.fail('Writing world plane must be fully framed along its scroll camera path');
}
async function visible(page) {
  await page.waitForFunction(() => window.__formulaQA.draws > 0, null, {
    polling: 40,
    timeout: 5000,
  });
  const observed = await page.evaluate(() => ({
    probe: window.__formulaQA,
    formula: window.SiteScene.formulaDiagnostics(),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  }));
  assert.equal(observed.overflow, false);
  assert.equal(observed.probe.duplicate, false);
  assert.equal(observed.formula.cacheBuilds, 1);
  assert.equal(observed.formula.width, 1380);
  assert.equal(observed.formula.height, 240);
  assert.equal(observed.formula.bytes, 1380 * 240 * 4);
  assert.equal(
    observed.formula.paintCount - observed.probe.startPaintCount,
    observed.probe.draws,
    'fresh formula draw delta matches actual submissions'
  );
  finiteBounds(observed.probe.bounds);
  return observed;
}
async function freshObservation(page) {
  await frameBand(page);
  await page.evaluate(() => {
    const probe = window.__formulaQA,
      formula = window.SiteScene.formulaDiagnostics();
    probe.draws = 0;
    probe.drawSubmissions = 0;
    probe.bounds = [];
    probe.startPaintCount = formula.paintCount;
    probe.startDrawSubmissions = formula.drawSubmissions;
  });
  return visible(page);
}
async function ownership(browser, url) {
  const rows = [];
  for (const kind of ['off', 'reduced']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await initialize(context, { motion: 'off' });
    const page = await context.newPage(),
      errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await page.goto(url + '/writing.html');
      await ready(page, 'writing');
      await page.waitForFunction(() => window.__formulaQA.draws > 0, null, {
        polling: 40,
        timeout: 3000,
      });
      const off = await page.evaluate(() => window.__formulaOwnershipSnapshot());
      assert.equal(off.mode, 'canvas');
      assert.equal(off.fallbackVisible, false);
      assert.equal(off.bitmapFormula, true);
      assert.equal(off.formula.cacheBuilds, 1);
      assert.equal(off.formula.lastPaintCount, 1);
      await page.waitForTimeout(400);
      const startupFrozen = await page.evaluate(() => window.__formulaOwnershipSnapshot());
      for (const key of ['paints', 'draws', 'callbacks', 'phase', 'camera'])
        assert.equal(startupFrozen[key], off[key], 'startup Off keeps one frozen world landmark');
      const onSynchronous = await page.evaluate(() => {
        document.querySelector('#space-motion').click();
        return window.__formulaOwnershipSnapshot();
      });
      assert.equal(
        onSynchronous.formula.cacheBuilds,
        1,
        'On reuses the bounded frozen-world cache'
      );
      const painted = await freshObservation(page);
      const started = await page.evaluate((kind) => {
        window.__formulaOwnership = { events: [] };
        const before = window.__formulaOwnershipSnapshot();
        window.__formulaOwnership.events.push({ kind: 'before', ...before });
        if (kind === 'off') document.querySelector('#space-motion').click();
        const immediate = window.__formulaOwnershipSnapshot();
        window.__formulaOwnership.events.push({ kind: 'preference-return', ...immediate });
        return { before, immediate };
      }, kind);
      const before = started.before;
      assert.equal(before.mode, 'canvas');
      assert.equal(before.fallbackVisible, false);
      assert.equal(before.bitmapFormula, true);
      assert.equal(before.formula.lastPaintCount, 1);
      let immediate = started.immediate;
      if (kind === 'reduced') {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        immediate = await page.evaluate(() => {
          const state = window.__formulaOwnershipSnapshot();
          window.__formulaOwnership.events.push({ kind: 'preference-return', ...state });
          return state;
        });
      }
      await page.waitForFunction(
        (before) =>
          window.__formulaQA.paints > before &&
          window.SiteScene.formulaDiagnostics().lastPaintCount === 1,
        before.paints,
        { polling: 40, timeout: 1500 }
      );
      const after = await page.evaluate(() => {
        const state = window.__formulaOwnershipSnapshot();
        window.__formulaOwnership.events.push({ kind: 'settled', ...state });
        return state;
      });
      assert.equal(after.mode, 'canvas');
      assert.equal(after.fallbackVisible, false);
      assert.equal(after.bitmapFormula, true);
      const scroll = await page.evaluate(() => {
        const beforeY = scrollY,
          maxScroll = document.documentElement.scrollHeight - innerHeight,
          target = Math.min(maxScroll, beforeY + 100);
        scrollTo({ top: target, behavior: 'instant' });
        const state = window.__formulaOwnershipSnapshot();
        window.__formulaOwnership.events.push({ kind: 'native-scroll', ...state });
        return { beforeY, target, after: state };
      });
      await page.waitForTimeout(400);
      const end = await page.evaluate(() => {
        const state = window.__formulaOwnershipSnapshot();
        window.__formulaOwnership.events.push({ kind: 'freeze-end', ...state });
        return { state, events: window.__formulaOwnership.events };
      });
      const frozen = {
        elapsedMs: end.state.time - after.time,
        paintDelta: end.state.paints - after.paints,
        drawDelta: end.state.draws - after.draws,
        callbackDelta: end.state.callbacks - after.callbacks,
        scroll,
        after: end.state,
      };
      const targetMotion = kind === 'off' ? 'Motion: off' : 'Motion: reduced',
        events = end.events.filter(
          (state) => state.time <= after.time && state.motion === targetMotion
        ),
        start = events[0];
      assert.ok(start, 'actual preference transition evidence');
      const settle = {
        timeoutMs: 1500,
        start,
        elapsedMs: after.time - start.time,
        paintDelta: events.filter((state) => state.kind === 'paint-clear').length,
        drawDelta: events.filter((state) => state.kind === 'formula-draw').length,
        callbackDelta: after.callbacks - start.callbacks + (start.kind === 'paint-clear' ? 1 : 0),
      };
      assert.equal(
        settle.paintDelta,
        1,
        'preference settles the scene with one bounded Canvas paint'
      );
      assert.equal(settle.drawDelta, 1, 'one world formula in the frozen scene');
      assert.equal(settle.callbackDelta, 1);
      assert.equal(after.phase, start.phase);
      assert.equal(after.camera, start.camera);
      assert.ok(frozen.elapsedMs >= 400);
      assert.equal(frozen.paintDelta, 0);
      assert.equal(frozen.drawDelta, 0);
      assert.equal(frozen.callbackDelta, 0);
      assert.equal(end.state.phase, after.phase);
      assert.equal(end.state.camera, after.camera);
      assert.ok(end.state.scrollY > scroll.beforeY + 50, 'real native scroll while frozen');
      for (const state of end.events)
        assert.equal(
          state.bitmapFormula && state.fallbackVisible,
          false,
          'Canvas and static fallback never own the expression together'
        );
      assert.deepEqual(errors, []);
      rows.push({
        kind,
        startup: { off, startupFrozen, onSynchronous, painted },
        before,
        immediate,
        settle,
        after,
        frozen,
        events: end.events,
        errors,
      });
    } finally {
      await context.close();
    }
  }
  return rows;
}
async function custom(browser, url, output) {
  const captures = [],
    rows = [];
  for (const width of [320, 390, 768, 1440])
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width, height: width === 1440 ? 900 : 844 },
      });
      await initialize(context, { theme });
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      try {
        await page.goto(url + '/writing.html');
        await ready(page, 'writing');
        const initial = await freshObservation(page);
        const file = `writing-${width}-${theme}.png`;
        await page.screenshot({ path: path.join(output, file) });
        captures.push(file);
        for (const fraction of [1, 0.5, 0]) {
          await page.evaluate(
            (f) =>
              scrollTo({
                top: (document.documentElement.scrollHeight - innerHeight) * f,
                behavior: 'instant',
              }),
            fraction
          );
          await page.waitForTimeout(450);
        }
        const after = await freshObservation(page);
        assert.equal(after.formula.cacheBuilds, 1);
        let zoom;
        if (width === 390) {
          await page.evaluate(() => {
            document.body.style.zoom = '2';
            dispatchEvent(new Event('resize'));
          });
          zoom = await freshObservation(page);
          await page.screenshot({ path: path.join(output, `writing-${theme}-zoom200.png`) });
          captures.push(`writing-${theme}-zoom200.png`);
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
            false
          );
        }
        assert.deepEqual(errors, []);
        rows.push({ width, theme, initial, after, ...(zoom ? { zoom } : {}), errors });
      } finally {
        await context.close();
      }
    }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await initialize(context);
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(url + '/writing.html');
    await ready(page, 'writing');
    await freshObservation(page);
    for (const route of [
      'research',
      'writing',
      'talks',
      'writing',
      'credits',
      'index',
      'writing',
    ]) {
      await page
        .locator(`a[href="${route === 'index' ? './' : route + '.html'}"]`)
        .first()
        .evaluate((el) => el.click());
      await ready(page, route);
      if (route === 'writing') await freshObservation(page);
      else {
        await page.evaluate(() => (window.__formulaQA.draws = 0));
        await page.waitForTimeout(400);
      }
      const state = await page.evaluate(() => ({
        route: document.body.dataset.page,
        probe: window.__formulaQA,
        formula: window.SiteScene.formulaDiagnostics(),
      }));
      assert.equal(state.probe.duplicate, false);
      assert.equal(state.formula.cacheBuilds, 1);
      if (route === 'writing') assert.ok(state.probe.draws > 0);
      else assert.equal(state.probe.draws, 0, 'formula absent from settled ' + route);
      rows.push({ journey: route, ...state });
    }
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
  const fault = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await initialize(fault, { cacheFault: true });
  const fp = await fault.newPage(),
    faultErrors = [];
  fp.on('pageerror', (e) => faultErrors.push(e.message));
  try {
    await fp.goto(url + '/writing.html');
    await ready(fp, 'writing');
    await fp.waitForTimeout(500);
    const state = await fp.evaluate(() => ({
      probe: window.__formulaQA,
      formula: window.SiteScene.formulaDiagnostics(),
      h1: document.querySelectorAll('h1').length,
      ready: document.querySelector('.space-scene').dataset.ready,
    }));
    assert.equal(state.h1, 1);
    assert.equal(state.ready, 'true');
    assert.ok(state.probe.paints > 0);
    assert.equal(state.probe.draws, 0);
    assert.equal(state.formula.failures, 1);
    await fp.waitForTimeout(400);
    assert.equal(await fp.evaluate(() => window.SiteScene.formulaDiagnostics().failures), 1);
    assert.deepEqual(faultErrors, []);
    rows.push({ cacheFault: state, errors: faultErrors });
  } finally {
    await fault.close();
  }
  return { rows, captures, ownership: await ownership(browser, url) };
}
async function offline(browser, output) {
  const directory = path.join(output, 'offline');
  require('../../tools/site/export.cjs').exportVariants(directory, { variant: 'color' });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await initialize(context);
  const page = await context.newPage(),
    requests = [],
    errors = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) requests.push(r.url());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(
      pathToFileURL(path.join(directory, 'Vitalii-Oborskyi-Color-Prototype.html')).href +
        '?view=writing'
    );
    await ready(page, 'writing');
    const observed = await freshObservation(page);
    assert.deepEqual(requests, []);
    assert.deepEqual(errors, []);
    return { observed, requests, errors };
  } finally {
    await context.close();
  }
}
async function main(input, output) {
  fs.mkdirSync(output, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(input, 'artifact.json'))),
    publicDir = path.join(input, 'public');
  artifact.verify(publicDir, manifest);
  assert.equal(manifest.sourceDirty, false);
  assert.equal(manifest.sourceCommit, process.env.SITE_CANDIDATE_SHA);
  assert.equal(variant(manifest).id, 'color');
  const record = {
    schema: 1,
    kind: 'writing-paradigm-browser',
    pass: false,
    fullGate: false,
    environment: environment(),
    sourceCommit: manifest.sourceCommit,
    sourceTree: manifest.sourceTree,
    artifactDigest: manifest.artifactDigest,
    variant: variant(manifest),
    engines: [],
    rows: [],
    limits:
      'Linux browser emulation, synthetic visibility and CSS zoom; no native-device or release acceptance',
  };
  const save = () =>
    fs.writeFileSync(path.join(output, 'browser.json'), JSON.stringify(record, null, 2) + '\n');
  const { server, url } = await serve({ candidate: { publicDir } });
  const target = url + '/candidate';
  try {
    for (const engine of ['chromium', 'firefox']) {
      const options = launchOptions(engine);
      let browser;
      try {
        browser = await toolRequire('playwright')[engine].launch(options);
        record.engines.push({
          engine,
          version: browser.version(),
          headless: options.headless,
          port: 'native',
          displayBackend: null,
        });
        for (const s of [
          { width: 1440, theme: 'light', mode: 'normal' },
          { width: 390, theme: 'dark', mode: 'normal' },
          { width: 320, theme: 'dark', mode: 'no-js' },
          { width: 320, theme: 'light', mode: 'no-canvas' },
          { width: 390, theme: 'dark', mode: 'reduced' },
        ]) {
          const row = await functional.scenario(browser, target, {
            engine,
            route: 'writing',
            ...s,
          });
          record.rows.push(row);
          save();
        }
        if (engine === 'chromium') {
          record.formula = await custom(browser, target, output);
          save();
          record.offline = await offline(browser, output);
          save();
        }
      } catch (error) {
        record.rows.push({ engine, pass: false, error: error.stack });
        save();
      } finally {
        await browser?.close();
      }
    }
    record.pass =
      record.engines.length === 2 &&
      record.rows.length === 10 &&
      record.rows.every((row) => row.pass) &&
      !!record.formula &&
      !!record.offline;
    if (record.pass) {
      try {
        require('./writing-paradigm-validate.cjs').browser(record, manifest);
      } catch (error) {
        record.pass = false;
        record.validationError = error.stack;
        save();
        throw error;
      }
    }
    save();
    assert.equal(
      record.pass,
      true,
      'focused Writing browser checks failed; retain browser.json/captures'
    );
  } finally {
    server.close();
    save();
  }
  return record;
}
if (require.main === module)
  main(path.resolve(process.argv[2]), path.resolve(process.argv[3])).catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = { main, finiteBounds, physicalFormulaBounds };
