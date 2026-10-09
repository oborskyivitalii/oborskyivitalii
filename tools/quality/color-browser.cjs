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
      backdrops: [],
      vectors: [],
    };
  let lastSeamSettled = 0,
    backdropLayer = null,
    backdropTiles = new WeakSet(),
    vectorLayer = null,
    vectorTiles = new WeakSet(),
    portraitEligible = false;
  function hiddenOwner(node) {
    for (let owner = node; owner && owner !== content; owner = owner.parentElement)
      if (owner.style.visibility === 'hidden') return true;
    return false;
  }
  function paintIdentity(node) {
    return (
      node.tagName +
      ':' +
      [...node.classList]
        .filter((name) => !name.startsWith('fragment-'))
        .sort()
        .join(' ') +
      ':' +
      node.textContent
    );
  }
  function pseudoPaint(node, pseudo) {
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(
      [
        'content',
        'background-color',
        'background-image',
        'opacity',
        'top',
        'left',
        'width',
        'height',
        'box-sizing',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'border-top-style',
        'border-right-style',
        'border-bottom-style',
        'border-left-style',
        'border-radius',
        'box-shadow',
        'box-decoration-break',
      ].map((property) => [property, style.getPropertyValue(property)])
    );
  }
  function copiedCells(box, copies) {
    const copyPlacements = copies.map(({ copy }) => {
      const matrix = new DOMMatrix(copy.style.transform);
      return { transform: copy.style.transform, translation: [matrix.m41, matrix.m42] };
    });
    return {
      nativeOrigin: [box.left, box.top],
      copyPlacements,
      cells: copies.map(({ tile }, index) => [
        box.left - copyPlacements[index].translation[0],
        box.top - copyPlacements[index].translation[1],
        parseFloat(tile.style.width),
        parseFloat(tile.style.height),
      ]),
    };
  }
  function backdropRecord(native, copy, placement, pseudo = null) {
    const box = native.getBoundingClientRect(),
      style = getComputedStyle(native);
    return {
      kind: pseudo ? 'pseudo' : 'direct',
      tag: native.tagName,
      classes: [...native.classList],
      nativeText: native.textContent,
      copiedText: copy.textContent,
      nativeHidden: hiddenOwner(native),
      nativeRect: [box.left, box.top, box.width, box.height],
      nativeBorder: [
        parseFloat(style.getPropertyValue('border-left-width')) || 0,
        parseFloat(style.getPropertyValue('border-top-width')) || 0,
      ],
      nativeBoxes: pseudo
        ? null
        : [...native.getClientRects()].map((rect) => [
            rect.left,
            rect.top,
            rect.width,
            rect.height,
          ]),
      pseudo,
      native: pseudoPaint(native, pseudo),
      copied: pseudoPaint(copy, pseudo),
      ...placement,
    };
  }
  function visibleDecodedPortrait() {
    const portrait = content.querySelector('figure.portrait-composition'),
      portraitBox = portrait?.getBoundingClientRect(),
      image = portrait?.querySelector('img');
    return !!(
      portraitBox &&
      portraitBox.width > 0 &&
      portraitBox.height > 0 &&
      portraitBox.right > -64 &&
      portraitBox.left < innerWidth + 64 &&
      portraitBox.bottom > -64 &&
      portraitBox.top < innerHeight + 64 &&
      image?.complete &&
      image.naturalWidth > 0 &&
      image.currentSrc
    );
  }
  function copiedBackdrops(native, copy, placement) {
    const originals = [native, ...native.querySelectorAll('*')],
      paints = [copy, ...copy.querySelectorAll('*')],
      owners = [];
    for (let index = 0; index < paints.length; index++) {
      const paint = paints[index];
      if (paint.namespaceURI === 'http://www.w3.org/2000/svg') continue;
      if (paint.classList.contains('fragment-surface-paint'))
        owners.push(backdropRecord(originals[index], paint, placement));
      for (const side of ['before', 'after'])
        if (paint.classList.contains('fragment-surface-' + side))
          owners.push(backdropRecord(originals[index], paint, placement, '::' + side));
    }
    return owners;
  }
  function observeBackdrops(tiles, phase) {
    const current = tiles[0]?.closest('.fragment-layer');
    if (!current || current === backdropLayer) return;
    backdropLayer = current;
    backdropTiles = new WeakSet();
    vectorLayer = null;
    vectorTiles = new WeakSet();
    portraitEligible = visibleDecodedPortrait();
    const groups = new Map();
    const selector = '.fragment-surface-paint,.fragment-surface-before,.fragment-surface-after';
    for (const tile of tiles) {
      const copy = tile.querySelector('.fragment-paint');
      if (!copy?.matches(selector) && !copy?.querySelector?.(selector)) continue;
      backdropTiles.add(tile);
      const id = paintIdentity(copy);
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push({ tile, copy });
    }
    const owners = [];
    for (const native of content.querySelectorAll('[style*="visibility"]')) {
      if (native.style.visibility !== 'hidden') continue;
      const copies = groups.get(paintIdentity(native));
      if (!copies) continue;
      const placement = copiedCells(native.getBoundingClientRect(), copies);
      owners.push(...copiedBackdrops(native, copies[0].copy, placement));
    }
    observation.backdrops.push({
      timeMs: performance.now(),
      phase,
      viewport: [innerWidth, innerHeight],
      owners,
    });
  }
  function vectorPaint(node) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return {
      tag: node.tagName,
      namespace: node.namespaceURI,
      points: node.getAttribute('points'),
      paint: Object.fromEntries(
        ['fill', 'stroke', 'fill-opacity', 'stroke-opacity', 'stroke-width', 'opacity'].map(
          (name) => [name, style.getPropertyValue(name)]
        )
      ),
    };
  }
  function vectorImage(image) {
    return image
      ? {
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          currentSrc: image.currentSrc,
          src: image.src,
        }
      : null;
  }
  function vectorViewport(svg) {
    if (!svg) return null;
    const style = getComputedStyle(svg);
    return { x: style.getPropertyValue('overflow-x'), y: style.getPropertyValue('overflow-y') };
  }
  function vectorFigure(native, copies, phase) {
    const root = copies[0].copy,
      box = native.getBoundingClientRect(),
      nativeSvg = native.querySelector('svg'),
      copiedSvg = root.querySelector('svg'),
      svgBox = nativeSvg.getBoundingClientRect();
    return {
      timeMs: performance.now(),
      phase,
      viewport: [innerWidth, innerHeight],
      nativeHidden: native.style.visibility === 'hidden',
      nativeRect: [box.left, box.top, box.width, box.height],
      svgRect: [svgBox.left, svgBox.top, svgBox.width, svgBox.height],
      namespace: nativeSvg.namespaceURI,
      copiedNamespace: copiedSvg?.namespaceURI ?? null,
      nativeOverflow: vectorViewport(nativeSvg),
      copiedOverflow: vectorViewport(copiedSvg),
      viewBox: nativeSvg.getAttribute('viewBox'),
      copiedViewBox: copiedSvg?.getAttribute('viewBox') ?? null,
      nativeImage: vectorImage(native.querySelector('img')),
      copiedImage: vectorImage(root.querySelector('img')),
      nativeNodes: [...nativeSvg.querySelectorAll('*')].map(vectorPaint),
      copiedNodes: [...(copiedSvg?.querySelectorAll('*') || [])].map(vectorPaint),
      ...copiedCells(box, copies),
    };
  }
  function observeVectors(tiles, phase) {
    const current = tiles[0]?.closest('.fragment-layer');
    if (!portraitEligible || !current || current === vectorLayer) return;
    const native = content.querySelector('figure.portrait-composition'),
      copies = tiles
        .map((tile) => ({
          tile,
          copy: tile.querySelector('figure.portrait-composition.fragment-paint'),
        }))
        .filter(({ copy }) => copy);
    if (
      !copies.some(
        ({ tile }) =>
          Number(tile.style.opacity || 0) > 0 && tile.style.transform.startsWith('matrix3d(')
      )
    )
      return;
    const image = copies[0].copy.querySelector('img');
    // Cached cloned media may finish its load task after initial acquisition.
    // Observe its first real decoded paint within the existing flight window.
    if (image && (!image.complete || !image.naturalWidth || !image.currentSrc)) return;
    observation.vectors.push(vectorFigure(native, copies, phase));
    for (const { tile } of copies) vectorTiles.add(tile);
    vectorLayer = current;
  }
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
    if (!native || !hiddenOwner(native)) return;
    const nativeBox = native.getBoundingClientRect();
    // A settled piece has its complete cloned heading at the native border
    // box, even though only its own shard mask is painted. Compare the actual
    // glyph line boxes once, before that paint is removed at native handoff.
    for (const tile of tiles) {
      const copy = tile.querySelector('h1.fragment-paint,.fragment-paint h1');
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
    if (content.dataset.fragmentPhase) observeBackdrops(tiles, content.dataset.fragmentPhase);
    if (content.dataset.fragmentPhase) observeVectors(tiles, content.dataset.fragmentPhase);
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
      backdropPieces: tiles.filter((tile) => backdropTiles.has(tile)).length,
      paintedBackdropPieces: tiles.filter(
        (tile) =>
          backdropTiles.has(tile) &&
          Number(tile.style.opacity || 0) > 0 &&
          tile.style.transform.startsWith('matrix3d(')
      ).length,
      portraitEligible,
      vectorPieces: tiles.filter((tile) => vectorTiles.has(tile)).length,
      paintedVectorPieces: tiles.filter(
        (tile) =>
          vectorTiles.has(tile) &&
          Number(tile.style.opacity || 0) > 0 &&
          tile.style.transform.startsWith('matrix3d(')
      ).length,
      nativeOpacity: Number(content.style.opacity || 1),
      nativeHidden: [...content.querySelectorAll('[style*="visibility"]')].filter(
        (owner) => owner.style.visibility === 'hidden'
      ).length,
      headingSelected: hiddenOwner(content.querySelector('main h1')),
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
function directBackdropBounds(owner) {
  assert.ok(owner.nativeBoxes.length > 0, 'missing actual native inline paint rectangles');
  for (const box of owner.nativeBoxes)
    assert.ok(box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0);
  let spread = 0;
  if (owner.classes.includes('reading-title')) {
    const lengths = (owner.native['box-shadow'].match(/[-+]?(?:\d*\.)?\d+px/g) || []).map(
      parseFloat
    );
    assert.deepEqual(
      lengths.slice(0, 3),
      [0, 0, 0],
      'inline title needs its authored simple spread shadow'
    );
    assert.ok(lengths.length === 4 && Number.isFinite(lengths[3]) && lengths[3] > 0);
    spread = lengths[3];
  }
  return [
    Math.min(...owner.nativeBoxes.map((box) => box[0])) - spread,
    Math.min(...owner.nativeBoxes.map((box) => box[1])) - spread,
    Math.max(...owner.nativeBoxes.map((box) => box[0] + box[2])) + spread,
    Math.max(...owner.nativeBoxes.map((box) => box[1] + box[3])) + spread,
  ];
}
function backdropBounds(owner) {
  if (owner.kind === 'direct') return directBackdropBounds(owner);
  const [x, y, width, height] = owner.nativeRect,
    style = owner.native,
    [borderLeft, borderTop] = owner.nativeBorder,
    left = x + borderLeft + parseFloat(style.left),
    top = y + borderTop + parseFloat(style.top);
  let paperWidth = parseFloat(style.width),
    paperHeight = parseFloat(style.height);
  if (style['box-sizing'] !== 'border-box') {
    for (const side of ['left', 'right'])
      paperWidth +=
        parseFloat(style['padding-' + side]) + parseFloat(style['border-' + side + '-width']);
    for (const side of ['top', 'bottom'])
      paperHeight +=
        parseFloat(style['padding-' + side]) + parseFloat(style['border-' + side + '-width']);
  }
  assert.ok([left, top, paperWidth, paperHeight].every(Number.isFinite));
  assert.ok(paperWidth > 0 && paperHeight > 0);
  return [
    Math.min(x, left),
    Math.min(y, top),
    Math.max(x + width, left + paperWidth),
    Math.max(y + height, top + paperHeight),
  ];
}
function validateBackdropOwner(owner, viewport) {
  assert.equal(owner.nativeHidden, true, 'whole native paper block remained visible');
  assert.equal(owner.copiedText, owner.nativeText, 'paper and its native content were separated');
  if (owner.kind !== 'direct') {
    assert.ok(['::before', '::after'].includes(owner.pseudo));
    assert.ok(!['none', 'normal', ''].includes(owner.native.content));
  }
  assert.ok(Number(owner.native.opacity) > 0);
  assert.ok(
    !['transparent', 'rgba(0, 0, 0, 0)', ''].includes(owner.native['background-color']) ||
      owner.native['background-image'] !== 'none' ||
      owner.native['box-shadow'] !== 'none' ||
      ['top', 'right', 'bottom', 'left'].some(
        (side) => parseFloat(owner.native['border-' + side + '-width']) > 0
      ),
    'native pseudo lacks actual paper paint'
  );
  for (const property of [
    'content',
    'background-color',
    'background-image',
    'opacity',
    'border-radius',
    'box-shadow',
    'box-sizing',
    'box-decoration-break',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
  ])
    assert.equal(
      owner.copied[property],
      owner.native[property],
      'copied paper changed ' + property
    );
  const dimensions = owner.kind === 'direct' ? [] : ['left', 'top', 'width', 'height'];
  for (const property of [
    ...dimensions,
    'padding-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'border-left-width',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
  ]) {
    const native = parseFloat(owner.native[property]),
      copied = parseFloat(owner.copied[property]);
    assert.ok(
      Number.isFinite(native) && Number.isFinite(copied) && Math.abs(native - copied) <= 0.75,
      'copied paper changed its native ' + property
    );
  }
  for (const values of [owner.nativeRect, owner.nativeBorder, viewport])
    assert.ok(Array.isArray(values) && values.every(Number.isFinite));
  assert.equal(owner.nativeRect.length, 4);
  assert.equal(owner.nativeBorder.length, 2);
  assert.equal(viewport.length, 2);
  validateCopyPlacement(owner);
  validatePaintCoverage(owner.cells, backdropBounds(owner), viewport);
}
function serializedTranslation(transform) {
  assert.ok(
    typeof transform === 'string' && transform.startsWith('translate3d(') && transform.endsWith(')')
  );
  const lengths = transform
    .slice(12, -1)
    .split(',')
    .map((value) => value.trim());
  assert.equal(lengths.length, 3);
  for (const [axis, length] of lengths.entries())
    assert.ok(
      /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?px$/i.test(length) ||
        (axis === 2 && length === '0'),
      'clone translation needs finite CSS pixel lengths'
    );
  const values = lengths.map(parseFloat);
  assert.ok(values.every(Number.isFinite) && values[2] === 0);
  return values;
}
function validateCopyPlacement(record) {
  assert.ok(record.nativeOrigin.length === 2 && record.nativeOrigin.every(Number.isFinite));
  assert.equal(record.copyPlacements.length, record.cells.length);
  for (const [index, placement] of record.copyPlacements.entries()) {
    const values = serializedTranslation(placement.transform);
    assert.ok(placement.translation.length === 2 && placement.translation.every(Number.isFinite));
    for (const axis of [0, 1]) {
      // CSS transform parsing may store translation components as Float32.
      // Match the exact resolved representation rather than a decimal epsilon.
      assert.ok(
        placement.translation[axis] === values[axis] ||
          placement.translation[axis] === Math.fround(values[axis]),
        'raw clone transform disagrees with its actual DOMMatrix translation'
      );
      assert.ok(
        Math.abs(
          record.cells[index][axis] + placement.translation[axis] - record.nativeOrigin[axis]
        ) <= 1e-8,
        'fragment cell origin no longer reconstructs its native border box'
      );
    }
  }
}
function validatePaintCoverage(cells, bounds, viewport) {
  assert.ok(cells.length > 0);
  for (const cell of cells)
    assert.ok(cell.length === 4 && cell.every(Number.isFinite) && cell[2] > 0 && cell[3] > 0);
  const coverage = [
      Math.min(...cells.map((cell) => cell[0])),
      Math.min(...cells.map((cell) => cell[1])),
      Math.max(...cells.map((cell) => cell[0] + cell[2])),
      Math.max(...cells.map((cell) => cell[1] + cell[3])),
    ],
    expected = [
      Math.max(-64, bounds[0]),
      Math.max(-64, bounds[1]),
      Math.min(viewport[0] + 64, bounds[2]),
      Math.min(viewport[1] + 64, bounds[3]),
    ];
  assert.ok(
    coverage[0] <= expected[0] + 0.75 &&
      coverage[1] <= expected[1] + 0.75 &&
      coverage[2] >= expected[2] - 0.75 &&
      coverage[3] >= expected[3] - 0.75,
    'fragment cells omit the complete native paint envelope'
  );
}
function validateVectorNode(native, copied) {
  assert.equal(native.namespace, 'http://www.w3.org/2000/svg');
  assert.equal(copied.namespace, native.namespace);
  assert.equal(native.tag.toLowerCase(), 'polygon');
  assert.equal(copied.tag, native.tag);
  assert.equal(copied.points, native.points);
  const points = native.points
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  assert.ok(points.length >= 6 && points.length % 2 === 0 && points.every(Number.isFinite));
  for (const property of [
    'fill',
    'stroke',
    'fill-opacity',
    'stroke-opacity',
    'stroke-width',
    'opacity',
  ]) {
    assert.equal(
      copied.paint[property],
      native.paint[property],
      'copied vector changed native ' + property
    );
    assert.ok(typeof native.paint[property] === 'string' && native.paint[property].length > 0);
    assert.ok(!/url\s*\(/i.test(native.paint[property]));
  }
  for (const property of ['fill-opacity', 'stroke-opacity', 'opacity'])
    assert.ok(
      Number.isFinite(Number(native.paint[property])) &&
        Number(native.paint[property]) > 0 &&
        Number(native.paint[property]) <= 1
    );
  assert.ok(
    Number.isFinite(parseFloat(native.paint['stroke-width'])) &&
      parseFloat(native.paint['stroke-width']) > 0
  );
  assert.ok(native.paint.fill !== 'none' && native.paint.stroke !== 'none');
}
function validateVectorFigure(record) {
  assert.equal(record.nativeHidden, true, 'portrait image flew without hiding its vector figure');
  assert.equal(record.namespace, 'http://www.w3.org/2000/svg');
  assert.equal(record.copiedNamespace, record.namespace);
  assert.equal(record.copiedViewBox, record.viewBox);
  assert.deepEqual(
    record.viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number),
    [0, 0, 500, 550]
  );
  for (const axis of ['x', 'y']) {
    assert.ok(
      ['hidden', 'clip'].includes(record.nativeOverflow[axis]),
      'native vector viewport is unbounded'
    );
    assert.equal(record.copiedOverflow[axis], record.nativeOverflow[axis]);
  }
  for (const image of [record.nativeImage, record.copiedImage]) {
    assert.equal(image?.complete, true, 'atomic portrait image was not decoded');
    assert.ok(image.naturalWidth > 0 && image.naturalHeight > 0 && image.currentSrc);
  }
  assert.equal(record.copiedImage.currentSrc, record.nativeImage.currentSrc);
  assert.equal(record.copiedImage.src, record.nativeImage.currentSrc);
  assert.equal(record.copiedImage.naturalWidth, record.nativeImage.naturalWidth);
  assert.equal(record.copiedImage.naturalHeight, record.nativeImage.naturalHeight);
  assert.equal(record.nativeNodes.length, 6, 'missing actual six-facet native portrait');
  assert.equal(
    record.copiedNodes.length,
    record.nativeNodes.length,
    'image-only copy lost its vector backdrop'
  );
  record.nativeNodes.forEach((node, index) => validateVectorNode(node, record.copiedNodes[index]));
  for (const rect of [record.nativeRect, record.svgRect])
    assert.ok(rect.length === 4 && rect.every(Number.isFinite) && rect[2] > 0 && rect[3] > 0);
  assert.ok(record.viewport.length === 2 && record.viewport.every(Number.isFinite));
  const [figure, svg] = [record.nativeRect, record.svgRect];
  validateCopyPlacement(record);
  validatePaintCoverage(
    record.cells,
    [
      Math.min(figure[0], svg[0]),
      Math.min(figure[1], svg[1]),
      Math.max(figure[0] + figure[2], svg[0] + svg[2]),
      Math.max(figure[1] + figure[3], svg[1] + svg[3]),
    ],
    record.viewport
  );
}
function validateFragmentVectors(observation, phase) {
  const samples = observation.samples.filter((sample) => sample.phase === phase);
  if (!samples.some((sample) => sample.portraitEligible)) return { figures: 0, paintedPieces: 0 };
  const records = (observation.vectors || []).filter((record) => record.phase === phase);
  assert.ok(records.length > 0, 'visible Home portrait lacks its atomic SVG/image fragments');
  for (const record of records) validateVectorFigure(record);
  assert.ok(
    samples.some((sample) => sample.paintedVectorPieces > 0),
    'no visible transformed portrait-vector shards'
  );
  for (const sample of samples)
    assert.ok(
      Number.isInteger(sample.vectorPieces) &&
        Number.isInteger(sample.paintedVectorPieces) &&
        sample.paintedVectorPieces >= 0 &&
        sample.paintedVectorPieces <= sample.vectorPieces &&
        sample.vectorPieces <= sample.pieces
    );
  return {
    figures: records.length,
    paintedPieces: Math.max(...samples.map((sample) => sample.paintedVectorPieces)),
  };
}
function validateFragmentBackdrops(observation, phase) {
  const acquisitions = (observation.backdrops || []).filter((record) => record.phase === phase),
    samples = observation.samples.filter((sample) => sample.phase === phase);
  assert.ok(acquisitions.length > 0, 'missing actual ' + phase + ' paper acquisition');
  for (const record of acquisitions) {
    assert.ok(record.owners.length > 0, 'paper remained outside the whole-block fragments');
    for (const owner of record.owners) validateBackdropOwner(owner, record.viewport);
  }
  if (
    samples.some(
      (sample) => sample.headingSelected && ['research', 'writing', 'talks'].includes(sample.page)
    )
  )
    assert.ok(
      acquisitions.some((record) =>
        record.owners.some(
          (owner) => owner.kind === 'direct' && owner.classes.includes('reading-title')
        )
      ),
      'selected intro heading lacks its actual inline title paper'
    );
  assert.ok(
    samples.some((sample) => sample.paintedBackdropPieces > 0),
    'no visible transformed ' + phase + ' paper shards'
  );
  for (const sample of samples)
    assert.ok(
      Number.isInteger(sample.backdropPieces) &&
        Number.isInteger(sample.paintedBackdropPieces) &&
        sample.paintedBackdropPieces >= 0 &&
        sample.paintedBackdropPieces <= sample.backdropPieces &&
        sample.backdropPieces <= sample.pieces,
      'invalid actual paper shard counts'
    );
  return {
    owners: acquisitions.reduce((total, record) => total + record.owners.length, 0),
    paintedPieces: Math.max(...samples.map((sample) => sample.paintedBackdropPieces)),
  };
}
function validateFragmentRoute(observation, measured, expected) {
  const active = observation.samples.filter((sample) => sample.phase),
    final = observation.samples.at(-1),
    backdrops = {},
    vectors = {};
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
    backdrops[phase] = validateFragmentBackdrops(observation, phase);
    vectors[phase] = validateFragmentVectors(observation, phase);
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
    backdrops,
    vectors,
    nativeHandoff: final,
    measured,
    observation,
  };
}
function fragmentTransaction(observation, expected) {
  const starts = observation.events.filter((event) => event.kind === 'navigation-start');
  assert.equal(starts.length, 1, 'fragment observation needs one actual navigation start');
  const navigationStart = starts[0];
  assert.ok(Number.isFinite(navigationStart.time), 'missing finite navigation boundary');
  assert.ok(
    observation.samples.every((sample) => Number.isFinite(sample.timeMs)),
    'missing finite fragment sample time'
  );
  assert.ok(
    (observation.backdrops || []).every((record) => Number.isFinite(record.timeMs)),
    'missing finite backdrop acquisition time'
  );
  assert.ok(
    (observation.vectors || []).every((record) => Number.isFinite(record.timeMs)),
    'missing finite vector acquisition time'
  );
  assert.equal(navigationStart.from, expected.from);
  assert.equal(navigationStart.to, expected.to);
  return {
    navigationStart,
    previous: {
      samples: observation.samples.filter((sample) => sample.timeMs < navigationStart.time),
      frames: observation.frames.filter((frame) => frame.started < navigationStart.time),
      events: observation.events.filter((event) => event.time < navigationStart.time),
      longTasks: observation.longTasks.filter((task) => task.start < navigationStart.time),
      backdrops: (observation.backdrops || []).filter(
        (record) => record.timeMs < navigationStart.time
      ),
      vectors: (observation.vectors || []).filter((record) => record.timeMs < navigationStart.time),
    },
    observation: {
      ...observation,
      samples: observation.samples.filter((sample) => sample.timeMs >= navigationStart.time),
      backdrops: (observation.backdrops || []).filter(
        (record) => record.timeMs >= navigationStart.time
      ),
      vectors: (observation.vectors || []).filter(
        (record) => record.timeMs >= navigationStart.time
      ),
    },
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
    evidence.backdrops = Object.fromEntries(
      ['depart', 'arrive'].map((phase) => [
        phase,
        validateFragmentBackdrops(evidence.observation, phase),
      ])
    );
    evidence.vectors = Object.fromEntries(
      ['depart', 'arrive'].map((phase) => [
        phase,
        validateFragmentVectors(evidence.observation, phase),
      ])
    );

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
    const departureStart = await state(page);
    await page.evaluate(observeFragmentFlight);
    await page.locator('.site-header nav a[href="research.html"]').click();
    await page.waitForFunction(
      (initialCamera) =>
        document.getElementById('site-content').dataset.fragmentPhase === 'depart' &&
        JSON.parse(document.querySelector('.space-scene').dataset.camera).position[2] <
          JSON.parse(initialCamera).position[2] &&
        [...document.querySelectorAll('.fragment-piece')].some(
          (piece) => Number(piece.style.opacity) > 0
        ),
      departureStart.scene.camera,
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
    const transaction = fragmentTransaction(observation, { from: 'index', to: 'index' });
    // The observer starts before VO is clicked, so retain the abandoned paint
    // in its own raw record and validate the new transaction from its real
    // navigation-start. Inclusive callback/timing measurements stay unchanged.
    interrupted.retargetBoundary = {
      navigationStart: transaction.navigationStart,
      ...transaction.previous,
    };
    evidence.interruption = {
      ...validateFragmentRoute(transaction.observation, measured, {
        from: 'index',
        to: 'index',
        direction: 'backward',
        trigger: 'wordmark-interruption',
        sourceCamera: retarget.before,
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
  observeFragmentFlight,
  validateFragmentAssembly,
  fragmentAssembly,
  fragmentCancellationReady,
  validateFragmentRoute,
  validateFragmentBackdrops,
  validateFragmentVectors,
  validateCopyPlacement,
  fragmentTransaction,
  fragmentRouteCoverage,
};
