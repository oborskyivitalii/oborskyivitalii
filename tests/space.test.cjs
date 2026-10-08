'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const sourceFile = process.env.SITE_SPACE_SOURCE || path.join(__dirname, '../docs/space.js');
const source = fs.readFileSync(sourceFile, 'utf8'),
  model = require(sourceFile);
function visit(options = {}) {
  const events = {},
    docEvents = {},
    buttonEvents = {},
    stylesheetEvents = {},
    canvasEvents = {},
    pending = new Map(),
    calls = [];
  let formulaConstructions = 0;
  let failDraw = false,
    styled = options.styled !== false,
    paintClock = 0,
    bitmapValid = false,
    resizeCount = 0,
    draws = 0,
    serial = 0,
    time = 0,
    stored = options.saved ?? null,
    mutation,
    rangeReads = 0,
    styleReads = 0,
    maxHeight = 15000;
  const media = {
    matches: !!options.reduced,
    addEventListener: (_, fn) => {
      media.change = fn;
    },
  };
  const narrow = { matches: !!options.narrow },
    scene = { dataset: {} };
  const context = Object.fromEntries(
    [
      'setTransform',
      'clearRect',
      'beginPath',
      'moveTo',
      'lineTo',
      'stroke',
      'arc',
      'fill',
      'closePath',
    ].map((name) => [
      name,
      (...args) => {
        for (const arg of args) assert.ok(Number.isFinite(arg));
        if (name === 'clearRect') {
          if (failDraw) throw Error('injected');
          draws++;
          bitmapValid = false;
          paintClock += options.paintCost ?? 0;
        }
        if (name === 'fill' || name === 'stroke') bitmapValid = true;
      },
    ])
  );
  const canvas = {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    parentElement: scene,
    getContext: () => (options.noCanvas ? null : context),
    addEventListener: (name, fn) => {
      canvasEvents[name] = fn;
    },
  };
  for (const [key, initial] of [
    ['width', 300],
    ['height', 150],
  ]) {
    let value = initial;
    Object.defineProperty(canvas, key, {
      get: () => value,
      set: (v) => {
        value = v;
        bitmapValid = false;
        resizeCount++;
      },
    });
  }
  const button = {
    hidden: true,
    disabled: false,
    setAttribute: (key, value) => {
      button[key] = value;
    },
    addEventListener: (name, fn) => {
      buttonEvents[name] = fn;
    },
  };
  const window = {
    performance: { now: () => paintClock },
    innerWidth: options.narrow ? 390 : 1440,
    innerHeight: 900,
    devicePixelRatio: 4,
    scrollY: options.scrollY || 0,
    matchMedia: (query) => (query.includes('reduced') ? media : narrow),
    requestAnimationFrame: (fn) => {
      const id = ++serial;
      pending.set(id, fn);
      return id;
    },
    cancelAnimationFrame: (id) => pending.delete(id),
    addEventListener: (name, fn) => {
      events[name] = fn;
    },
    getComputedStyle: () => {
      styleReads++;
      return {
        getPropertyValue: (name) =>
          !styled
            ? ''
            : { '--accent': '#075d7b', '--systems': '#895710', '--paper': '#f8f7f3' }[name],
      };
    },
  };
  const makeStop = ([id, top], hidden = false) => ({
    hidden,
    dataset: { spaceStop: id },
    getClientRects: () => (hidden ? [] : [{}]),
    getBoundingClientRect: () => ({ top: top - window.scrollY, height: 300 }),
  });
  const keys = Object.keys(model.pageStops[options.page || 'index'] || {});
  let stops = (options.stops || keys.map((id, i) => [id, i * 1100])).map((pair) => makeStop(pair));
  let resultRects = options.empty
    ? []
    : options.coincident
      ? [[1000, 1000]]
      : options.single
        ? [[1000, 1160]]
        : [
            [1000, 1160],
            [1800, 1960],
          ];
  const results = {
    querySelectorAll: () =>
      resultRects.map(([top, bottom]) => ({
        hidden: false,
        getClientRects: () => [{}],
        getBoundingClientRect: () => ({
          top: top - window.scrollY,
          bottom: bottom - window.scrollY,
        }),
      })),
  };
  Object.assign(context, {
    save() {},
    restore() {},
    clip() {},
    transform(...values) {
      assert.ok(values.every(Number.isFinite));
    },
    drawImage() {
      bitmapValid = true;
    },
  });
  const raster = {
    beginPath() {},
    moveTo() {},
    lineTo() {},
    bezierCurveTo() {},
    stroke() {},
    createLinearGradient() {
      return { addColorStop() {} };
    },
  };
  const stylesheet = {
    addEventListener: (name, fn) => {
      stylesheetEvents[name] = fn;
    },
  };
  const document = {
    readyState: options.readyState,
    hidden: false,
    body: { dataset: { page: options.page || 'index' } },
    documentElement: {
      get scrollHeight() {
        rangeReads++;
        return maxHeight;
      },
      set scrollHeight(value) {
        maxHeight = value;
      },
    },
    getElementById: (id) =>
      id === 'space-canvas' ? canvas : id === 'space-motion' ? button : results,
    createElement: () => {
      formulaConstructions++;
      return { getContext: () => raster };
    },
    querySelectorAll: () => stops,
    querySelector: (selector) =>
      selector === 'link[rel="stylesheet"]'
        ? stylesheet
        : selector === '[data-writing-formula]'
          ? assert.fail('world formula never queries a DOM band')
          : selector === '.site-header'
            ? { getBoundingClientRect: () => ({ bottom: 100 }) }
            : {},
    addEventListener: (name, fn) => {
      docEvents[name] = fn;
    },
  };
  class MutationObserver {
    constructor(fn) {
      this.callback = fn;
    }
    observe(_, options) {
      if (options?.attributeFilter?.includes('data-theme')) mutation = this.callback;
    }
    disconnect() {}
  }
  window.MutationObserver = MutationObserver;
  if (options.probe) window.SiteEngineProbe = options.probe;
  if (options.ribbonProbe) {
    window.SiteRibbonProbe = () => {};
    window.SiteEffects = {
      contract: 1,
      scene: () => ({
        collect: (state) => {
          options.ribbonProbe(
            JSON.parse(
              JSON.stringify({
                current: state.current,
                ambientTime: state.ambientTime,
                journey: state.journey,
              })
            )
          );
          return [];
        },
        paint: () => false,
      }),
    };
  }
  const localStorage = {
    getItem() {
      if (options.blockedStorage) throw Error('blocked');
      return stored;
    },
    setItem(_, value) {
      if (options.blockedStorage) throw Error('blocked');
      stored = value;
    },
  };
  vm.runInNewContext(source, { document, window, localStorage });
  const api = {
    window,
    document,
    button,
    canvas,
    scene,
    pending,
    calls,
    media,
    narrow,
    events,
    formulaConstructions: () => formulaConstructions,
    drawingFault() {
      failDraw = true;
    },
    styling(value) {
      styled = value;
      events.load();
    },
    paintCost(value) {
      options.paintCost = value;
    },
    bitmapValid: () => bitmapValid,
    resizeCount: () => resizeCount,
    domReady() {
      document.readyState = 'interactive';
      docEvents.DOMContentLoaded?.();
    },
    stylesheetLoad(value = true) {
      styled = value;
      stylesheetEvents.load?.();
    },
    stylesheetError() {
      stylesheetEvents.error?.();
    },
    contextLost() {
      canvasEvents.contextlost?.();
    },
    rangeReads: () => rangeReads,
    styleReads: () => styleReads,
    frame(delta = 20) {
      const jobs = [...pending.values()];
      pending.clear();
      calls.length = 0;
      time += delta;
      for (const fn of jobs) fn(time);
    },
    settle() {
      for (let i = 0; i < 12 && pending.size; i++) api.frame(60);
    },
    trace: () => scene.dataset.camera,
    phase: () => Number(scene.dataset.phase),
    draws: () => draws,
    scroll(y) {
      window.scrollY = y;
      events.scroll?.();
    },
    event(name, detail) {
      events[name]?.({ detail });
    },
    click() {
      buttonEvents.click();
    },
    hidden(value) {
      document.hidden = value;
      docEvents.visibilitychange();
    },
    mutate() {
      mutation();
    },
    layout(rects) {
      resultRects = rects;
      events['site:archive-layout']();
    },
    stops(value) {
      stops = value.map((pair) => makeStop(pair));
      events.resize();
    },
    stored: () => stored,
  };
  return api;
}
test('native-scroll camera is reversible while the bounded ambient loop continues at idle', () => {
  const p = visit();
  p.settle();
  const start = p.trace(),
    phase = p.phase();
  p.scroll(1400);
  p.scroll(1750);
  assert.equal(p.pending.size, 1);
  p.settle();
  assert.notEqual(p.trace(), start);
  p.scroll(0);
  p.settle();
  assert.equal(p.trace(), start);
  assert.ok(p.phase() > phase);
  assert.equal(p.pending.size, 1);
  const fixed = p.trace();
  p.frame(60);
  assert.equal(p.trace(), fixed);
  assert.equal(p.canvas.width, 2160);
});
test('continuous gestures move immediately; pointer events never influence the camera', () => {
  const p = visit();
  p.settle();
  let last = p.trace();
  for (let i = 0; i < 8; i++) {
    p.scroll(200 + i * 140);
    p.frame(65);
    assert.notEqual(p.trace(), last);
    last = p.trace();
  }
  p.settle();
  last = p.trace();
  for (const type of ['pointermove', 'pointerout', 'mouseover', 'mouseenter', 'focus']) {
    p.event(type, { clientX: 12 });
    assert.equal(p.events[type], undefined);
  }
  p.frame(60);
  assert.equal(p.trace(), last);
  assert.equal(p.pending.size, 1);
});
test('Off freezes the exact displayed camera and phase through theme, resize, layout, hidden and print', () => {
  const p = visit({ blockedStorage: true });
  p.settle();
  p.scroll(1900);
  p.frame();
  p.frame();
  const fixed = p.trace(),
    phase = p.phase();
  p.click();
  p.settle();
  assert.equal(p.trace(), fixed);
  assert.equal(p.phase(), phase);
  assert.equal(p.pending.size, 0);
  p.scroll(5000);
  p.mutate();
  p.settle();
  p.event('resize');
  p.settle();
  p.layout([]);
  p.settle();
  p.hidden(true);
  p.mutate();
  assert.equal(p.pending.size, 0);
  p.hidden(false);
  p.settle();
  p.events.beforeprint();
  p.scroll(1000);
  assert.equal(p.pending.size, 0);
  p.events.afterprint();
  p.settle();
  assert.equal(p.trace(), fixed);
  assert.equal(p.phase(), phase);
  assert.equal(p.pending.size, 0);
});
test('reduced overrides saved On; Off persists; hidden and print pause without elapsed-time catch-up', () => {
  const off = visit({ saved: 'off' });
  off.settle();
  const p = visit({ reduced: true, saved: 'on', scrollY: 4000 });
  p.settle();
  assert.equal(p.trace(), off.trace());
  assert.equal(p.phase(), 0);
  assert.equal(p.button.disabled, true);
  assert.equal(p.pending.size, 0);
  p.media.matches = false;
  p.media.change();
  p.settle();
  const phase = p.phase();
  p.hidden(true);
  assert.equal(p.pending.size, 0);
  p.frame(120000);
  p.hidden(false);
  p.frame();
  assert.equal(p.phase(), phase);
  p.settle();
  assert.ok(p.phase() > phase);
  const before = p.phase();
  p.events.beforeprint();
  p.frame(120000);
  p.events.afterprint();
  p.frame();
  assert.equal(p.phase(), before);
  p.click();
  p.settle();
  assert.equal(p.stored(), 'off');
  p.media.matches = true;
  p.media.change();
  p.media.matches = false;
  p.media.change();
  p.settle();
  assert.equal(p.pending.size, 0);
});
test('cheap ambient paints reach 30Hz at both 60/120Hz RAF; a stall never causes a paint burst', () => {
  for (const narrow of [false, true])
    for (const fps of [60, 120]) {
      const p = visit({ narrow });
      p.settle();
      const n = p.draws();
      for (let i = 0; i < fps; i++) p.frame(1000 / fps);
      assert.ok(p.draws() - n >= 29 && p.draws() - n <= 31, `30Hz at ${fps}Hz, compact=${narrow}`);
      const before = p.draws();
      p.frame(1000);
      assert.equal(p.draws(), before + 1);
    }
  const missing = visit({ noCanvas: true });
  assert.equal(missing.pending.size, 0);
  assert.equal(missing.button.hidden, true);
  const unknown = visit({ page: 'unknown' });
  unknown.settle();
  unknown.scroll(5000);
  assert.equal(unknown.pending.size, 0);
});
test('short/degenerate pages keep their camera and still breathe without manufactured scroll', () => {
  for (const stops of [
    [],
    [['unknown', 100]],
    [['research', 0]],
    [
      ['hero', 0],
      ['research', 0],
    ],
  ]) {
    const p = visit({ stops });
    p.settle();
    const camera = p.trace(),
      phase = p.phase();
    p.scroll(9000);
    p.settle();
    assert.equal(p.trace(), camera);
    assert.ok(p.phase() > phase);
  }
  for (const page of ['research', 'talks', 'credits']) {
    const p = visit({ page });
    p.settle();
    const start = p.trace();
    p.scroll(1200);
    p.settle();
    assert.notEqual(p.trace(), start);
    p.scroll(0);
    p.settle();
    assert.equal(p.trace(), start);
  }
});
test('Writing topic travel, reflow, empty restoration and unchanged scroll preserve local progress', () => {
  const p = visit({ page: 'writing' });
  p.event('site:scene-focus', { focus: 'systems', reason: 'initial' });
  p.settle();
  p.scroll(1500);
  p.settle();
  const fixed = p.trace();
  p.layout([
    [400, 560],
    [2800, 2960],
  ]);
  p.settle();
  assert.equal(p.trace(), fixed);
  p.scroll(1500);
  p.settle();
  assert.equal(p.trace(), fixed);
  p.layout([]);
  p.settle();
  p.layout([[1000, 1160]]);
  p.settle();
  p.scroll(1500);
  p.settle();
  assert.equal(p.trace(), fixed);
  p.scroll(1450);
  p.settle();
  assert.notEqual(p.trace(), fixed);
  p.event('site:scene-focus', { focus: 'delivery', reason: 'filter' });
  p.settle();
  const changed = p.trace();
  for (const focus of ['__proto__', 'verification', 'unknown'])
    p.event('site:scene-focus', { focus });
  p.settle();
  assert.equal(p.trace(), changed);
  p.click();
  p.settle();
  const frozen = p.trace(),
    phase = p.phase();
  p.event('site:scene-focus', { focus: 'leadership', reason: 'initial' });
  p.layout([]);
  p.scroll(3000);
  p.settle();
  assert.equal(p.trace(), frozen);
  assert.equal(p.phase(), phase);
});
test('loop closes in position and velocity, stays bounded, and never mutates rest geometry', () => {
  for (const page of Object.keys(model.initialPoses)) {
    const world = model.worldFor(page),
      original = JSON.stringify(world);
    for (const o of world.objects.filter((_, i) => i % 13 === 0)) {
      const point = o.faceCount
        ? world.faces[o.firstFace].points[0]
        : o.lineCount
          ? world.lines[o.firstLine].a
          : o.center;
      const at = (t) => model.loopTransform(o, t)(point),
        start = at(0),
        end = at(model.LOOP_MS);
      assert.deepEqual(start, end);
      const h = 0.01,
        left = at(-h),
        right = at(h),
        endLeft = at(model.LOOP_MS - h),
        endRight = at(model.LOOP_MS + h);
      for (let j = 0; j < 3; j++)
        assert.ok(Math.abs(right[j] - left[j] - (endRight[j] - endLeft[j])) < 1e-9);
      for (let t = 0; t < model.LOOP_MS; t += 1000) {
        const transform = model.loopTransform(o, t),
          p = transform(point),
          rest = transform.inverse(p);
        assert.ok(p.every(Number.isFinite));
        assert.ok(Math.hypot(...p.map((v, i) => v - point[i])) < 2.2);
        assert.ok(
          rest.every((v, i) => Math.abs(v - point[i]) < 1e-10),
          'inverse recovers immutable coordinates for culling'
        );
      }
    }
    assert.equal(JSON.stringify(world), original);
  }
});
test('every page has eight semantic motifs, three recursive depths, immutable topology and bounded mobile detail', () => {
  const identities = new Set();
  for (const page of Object.keys(model.initialPoses)) {
    const w = model.worldFor(page),
      small = model.worldFor(page, true);
    identities.add(JSON.stringify(w.faces));
    assert.deepEqual(w, model.worldFor(page));
    assert.equal(
      new Set(w.objects.filter((o) => o.family === 'thematic').map((o) => o.symbol)).size,
      8
    );
    assert.deepEqual([...new Set(w.objects.map((o) => o.depth))].sort(), [0, 1, 2]);
    const lookup = new Map(w.objects.map((o) => [o.name, o]));
    for (const o of w.objects.filter((o) => o.parent)) {
      assert.equal(lookup.get(o.parent).depth, o.depth - 1);
      assert.ok(o.scale < lookup.get(o.parent).scale);
    }
    assert.ok(w.faces.length + w.lines.length < 14000);
    assert.ok(small.faces.length + small.lines.length <= w.faces.length + w.lines.length);
  }
  assert.equal(identities.size, 5);
});
test('all five worlds share the same multiscale angular geometry beside their own motifs', () => {
  const common = (page) => model.worldFor(page).objects.filter((o) => o.family === 'shared');
  const first = common('index');
  assert.equal(first.length, 56);
  for (const symbol of [
    'brain',
    'line-chart',
    'bar-chart',
    'scatter-chart',
    'attention',
    'softmax',
    'entropy',
  ])
    assert.ok(first.some((o) => o.symbol === symbol));
  assert.deepEqual([...new Set(first.map((o) => o.depth))].sort(), [0, 1, 2]);
  const signature = (objects) =>
    objects.map(({ name, center, scale, depth, parent, symbol }) => ({
      name,
      center,
      scale,
      depth,
      parent,
      symbol,
    }));
  for (const page of model.routeOrder) assert.deepEqual(signature(common(page)), signature(first));
});
test('route flights use one canvas and global space; retarget, Off and hidden preserve the painted pose', () => {
  const p = visit();
  p.settle();
  const canvas = p.canvas,
    scene = p.window.SiteScene;
  scene.navigate('research');
  p.frame(80);
  p.frame(80);
  const flying = JSON.parse(p.trace());
  assert.ok(flying.position[2] < 24);
  assert.equal(p.scene.dataset.direction, 'forward');
  p.click();
  p.settle();
  const frozen = p.trace(),
    phase = p.phase();
  p.frame(1000);
  assert.equal(p.trace(), frozen);
  assert.equal(p.phase(), phase);
  assert.equal(p.pending.size, 0);
  p.click();
  p.frame(80);
  scene.navigate('index');
  p.frame(80);
  assert.equal(p.scene.dataset.direction, 'backward');
  p.hidden(true);
  const paused = p.trace();
  p.frame(30000);
  assert.equal(p.trace(), paused);
  p.hidden(false);
  for (let i = 0; i < 30; i++) p.frame(80);
  assert.deepEqual(JSON.parse(p.trace()), model.routePose('index', model.poses.overview));
  assert.equal(p.scene.dataset.travel, 'settled');
  assert.equal(p.canvas, canvas);
  assert.ok(Number(p.scene.dataset.rooms) <= 3);
  p.click();
  p.settle();
  scene.navigate('credits', false);
  p.settle();
  assert.equal(p.scene.dataset.route, 'credits');
  assert.equal(p.scene.dataset.travel, 'settled');
  assert.equal(p.pending.size, 0);
});
test('short pages and empty archives finish in their destination room', () => {
  const p = visit({ empty: true });
  p.settle();
  for (const page of ['credits', 'writing']) {
    p.window.SiteScene.navigate(page);
    p.window.SiteScene.refresh();
    for (let i = 0; i < 30; i++) p.frame(80);
    assert.equal(p.scene.dataset.travel, 'settled');
    assert.deepEqual(
      JSON.parse(p.trace()),
      model.routePose(page, model.poses[model.initialPoses[page]])
    );
  }
});
test('flight models have their settled detail before the first paint, without an arrival refinement', () => {
  for (const narrow of [false, true]) {
    const models = [],
      p = visit({
        page: 'research',
        narrow,
        probe: (event) => {
          if (event.kind === 'model') models.push(event);
        },
      });
    p.settle();
    models.length = 0;
    const before = p.draws();
    p.window.SiteScene.navigate('writing');
    assert.equal(p.draws(), before, 'preparation precedes the travelling paint');
    assert.deepEqual(
      models.map(({ route, compact }) => [route, compact]),
      [['writing', narrow]],
      'reuse the source and prepare the destination at its normal detail'
    );
    p.frame(80);
    assert.equal(p.scene.dataset.travel, 'flying');
    for (let i = 0; i < 32; i++) {
      assert.equal(p.scene.dataset.geometry, narrow ? 'compact' : 'full');
      p.frame(80);
    }
    assert.equal(p.scene.dataset.travel, 'settled');
    assert.equal(models.length, 1, 'no post-arrival model rebuild');
    assert.ok(Number(p.scene.dataset.rooms) <= 3);
    assert.ok(Number(p.scene.dataset.roomModels) <= 6);
  }
});
test('flight preparation preserves adaptive compact detail and bounded multi-room retargeting', () => {
  const p = visit({ paintCost: 30 });
  advanceUntil(p, () => p.scene.dataset.geometry === 'compact', 'adapt before flight');
  p.window.SiteScene.navigate('writing');
  p.frame(80);
  assert.equal(p.scene.dataset.geometry, 'compact');
  const q = visit();
  q.settle();
  for (const destination of ['credits', 'index', 'writing']) {
    q.window.SiteScene.navigate(destination);
    for (let i = 0; i < 28; i++) {
      q.frame(80);
      assert.equal(q.scene.dataset.geometry, 'full');
      assert.ok(Number(q.scene.dataset.rooms) <= 3);
      assert.ok(Number(q.scene.dataset.roomModels) <= 6);
    }
  }
});
test('camera traverses multiple structures, is continuous/reversible and clips safely through near planes', () => {
  for (const ids of [
    ...Object.values(model.topicPaths),
    ...Object.values(model.pageStops).map(Object.values),
  ]) {
    assert.deepEqual(model.journeyPose(ids, 0), model.poses[ids[0]]);
    assert.deepEqual(model.journeyPose(ids, 1), model.poses[ids.at(-1)]);
    assert.ok(model.poses[ids[0]].position[2] - model.poses[ids.at(-1)].position[2] > 60);
    for (let i = 0; i <= 80; i++) {
      const p = model.journeyPose(ids, i / 80);
      assert.ok([...p.position, ...p.target].every(Number.isFinite));
      assert.ok(p.target[2] < p.position[2] - 5);
    }
    for (let i = 1; i < ids.length - 1; i++) {
      const t = i / (ids.length - 1),
        a = model.journeyPose(ids, t - 1e-5),
        b = model.journeyPose(ids, t + 1e-5);
      assert.ok(Math.hypot(...a.position.map((v, j) => v - b.position[j])) < 0.02);
    }
  }
  assert.equal(model.clipSegment([0, 0, -2], [2, 3, -1]), null);
  assert.deepEqual(model.clipSegment([0, 0, -1], [2, 3, 2]), [
    [1, 1.5, 0.5],
    [2, 3, 2],
  ]);
  const polygon = [
      [0, 0, -1],
      [2, 0, 2],
      [2, 2, 2],
      [0, 2, -1],
    ],
    copy = JSON.stringify(polygon);
  assert.ok(model.clipPolygon(polygon).every((p) => p[2] >= 0.5));
  assert.equal(JSON.stringify(polygon), copy);
  for (const page of Object.keys(model.initialPoses)) {
    const w = model.worldFor(page),
      ids = page === 'writing' ? model.topicPaths.all : Object.values(model.pageStops[page]);
    for (let i = 0; i <= 12; i++) {
      const shapes = model.projectedWorld(w, model.journeyPose(ids, i / 12), 1440, 900, i * 3200);
      assert.ok(shapes.length > 30, 'environment remains visible through the journey');
      assert.ok(shapes.every((s) => s.points.flat().every(Number.isFinite)));
    }
  }
});

test('rapid reversal clears obsolete targets on every route', () => {
  for (const page of Object.keys(model.initialPoses)) {
    const p = visit({ page });
    p.settle();
    const initial = p.trace();
    p.scroll(1800);
    p.scroll(0);
    p.settle();
    assert.equal(p.trace(), initial);
    p.scroll(2200);
    p.frame(65);
    p.scroll(0);
    p.settle();
    assert.equal(p.trace(), initial);
  }
});
test('delayed CSS cannot partially activate; post-activation draw failure stops once', () => {
  const p = visit({ styled: false });
  assert.equal(p.pending.size, 0);
  assert.equal(p.button.hidden, true);
  assert.equal(p.scene.dataset.ready, undefined);
  p.styling(true);
  p.settle();
  assert.equal(p.scene.dataset.ready, 'true');
  assert.equal(p.button.hidden, false);
  p.drawingFault();
  p.frame(80);
  assert.equal(p.pending.size, 0);
  assert.equal(p.scene.dataset.ready, undefined);
  assert.equal(p.button.disabled, true);
  assert.equal(p.button['aria-pressed'], 'false');
  p.event('resize');
  p.mutate();
  assert.equal(p.pending.size, 0);
});
test('direct boot waits for deferred archive/navigation setup and measures the final range once', () => {
  for (const readyState of ['loading', 'interactive']) {
    const p = visit({ page: 'writing', readyState });
    const ranges = [];
    p.window.SiteNavigation = { reconcileEndpoint: (value) => ranges.push(value) };
    assert.equal(p.rangeReads(), 0);
    assert.equal(p.styleReads(), 0);
    assert.equal(p.pending.size, 0);
    // Archive's initial visibility and focus events precede navigation's
    // content-plane mount, which can request an immediate layout refresh.
    p.layout([
      [420, 580],
      [2800, 2960],
    ]);
    p.event('site:scene-focus', { focus: 'leadership', reason: 'initial' });
    p.document.documentElement.scrollHeight = 11000;
    p.window.SiteScene.refresh({ sync: true });
    p.mutate();
    p.stylesheetLoad();
    p.event('resize');
    assert.equal(p.rangeReads(), 0, 'no geometry read before all deferred modules finish');
    assert.equal(p.styleReads(), 0, 'early theme and stylesheet events retain readiness guard');
    assert.equal(p.window.SiteScene.diagnostics().layoutPasses, 0);
    assert.equal(p.pending.size, 0);
    p.domReady();
    assert.equal(p.rangeReads(), 1);
    assert.equal(p.window.SiteScene.diagnostics().layoutPasses, 1);
    assert.deepEqual(ranges, [10100], 'initial endpoint uses the completed native document range');
    assert.equal(p.pending.size, 1, 'the existing RAF paints immediately after setup');
    p.settle();
    assert.deepEqual(
      JSON.parse(p.trace()),
      model.routePose('writing', model.journeyPose(model.topicPaths.leadership, 0, false)),
      'initial archive focus survives the deferred initialization'
    );
    p.domReady();
    p.stylesheetLoad();
    assert.equal(p.rangeReads(), 1, 'repeated readiness notifications cannot initialize twice');
    p.document.documentElement.scrollHeight = 18000;
    p.window.SiteScene.refresh({ sync: true });
    assert.equal(p.rangeReads(), 2, 'later native range changes still invalidate normally');
    assert.deepEqual(ranges, [10100, 17100]);
  }
});
test('post-DOMContentLoaded stylesheet load activates, while an early failure stays failed', () => {
  const late = visit({ readyState: 'interactive', styled: false });
  late.domReady();
  assert.equal(late.rangeReads(), 0);
  assert.equal(late.pending.size, 0);
  late.stylesheetLoad();
  assert.equal(late.rangeReads(), 1);
  assert.equal(late.pending.size, 1);
  late.settle();
  assert.equal(late.scene.dataset.ready, 'true');
  assert.equal(late.button.hidden, false);
  for (const failure of ['stylesheetError', 'contextLost']) {
    const p = visit({ readyState: 'interactive' });
    p[failure]();
    p.domReady();
    p.stylesheetLoad();
    p.mutate();
    assert.equal(p.rangeReads(), 0);
    assert.equal(p.pending.size, 0);
    assert.equal(p.scene.dataset.state, 'fallback');
    assert.equal(p.button.disabled, true);
  }
});
test('boot readiness preserves reduced/no-Canvas fallback and latest viewport detail', () => {
  const reduced = visit({ readyState: 'interactive', reduced: true, saved: 'on' });
  reduced.domReady();
  reduced.settle();
  assert.equal(reduced.rangeReads(), 1);
  assert.equal(reduced.phase(), 0);
  assert.equal(reduced.pending.size, 0);
  assert.equal(reduced.button.disabled, true);
  const missing = visit({ readyState: 'interactive', noCanvas: true });
  missing.domReady();
  assert.equal(missing.rangeReads(), 0);
  assert.equal(missing.pending.size, 0);
  assert.equal(missing.button.hidden, true);
  const resized = visit({ readyState: 'interactive' });
  resized.narrow.matches = true;
  resized.window.innerWidth = 390;
  resized.event('resize');
  resized.domReady();
  resized.settle();
  assert.equal(resized.scene.dataset.geometry, 'compact');
  assert.equal(resized.canvas.width, 390);
  for (const readyState of ['complete', undefined]) {
    const p = visit({ readyState });
    assert.equal(p.rangeReads(), 1);
    assert.equal(p.pending.size, 1);
  }
});
test('24-second cycle doubles v8 speed without changing geometry or camera', () => {
  assert.equal(model.LOOP_MS, 24000);
  const w = model.worldFor('writing'),
    o = w.objects[0],
    point = w.faces[0].points[0];
  assert.deepEqual(model.loopTransform(o, 6000)(point), model.loopTransform(o, 30000)(point));
  const compact = model.worldFor('writing', true);
  assert.deepEqual(
    w.objects.map((o) => [o.name, o.center]),
    compact.objects.map((o) => [o.name, o.center])
  );
});
function advanceUntil(p, predicate, message, maxFrames = 300) {
  for (let i = 0; i < maxFrames && !predicate(); i++) p.frame(125);
  assert.ok(predicate(), message);
}
test('observed-cost adaptation preserves the bitmap and DPR caps through resize and Off', () => {
  const p = visit({ paintCost: 30 });
  p.frame(125);
  assert.equal(p.bitmapValid(), true);
  let previousQuality = p.scene.dataset.quality;
  for (const target of ['1', '2']) {
    let changed = false;
    for (let i = 0; i < 80 && !changed; i++) {
      const oldWidth = p.canvas.width,
        oldResizes = p.resizeCount();
      p.frame(125);
      if (p.scene.dataset.quality !== previousQuality) {
        assert.equal(p.scene.dataset.quality, target);
        assert.equal(p.canvas.width, oldWidth);
        assert.equal(p.resizeCount(), oldResizes);
        assert.equal(p.bitmapValid(), true);
        previousQuality = target;
        changed = true;
      }
    }
    assert.ok(changed);
    p.frame(125);
    assert.equal(p.canvas.width, Math.round(1440 * (target === '1' ? 1.25 : 1)));
    assert.equal(p.bitmapValid(), true);
  }
  const fixed = p.trace(),
    phase = p.phase(),
    width = p.canvas.width;
  assert.equal(p.scene.dataset.geometry, 'compact');
  p.click();
  p.settle();
  assert.equal(p.stored(), 'off');
  assert.equal(p.pending.size, 0);
  assert.equal(p.trace(), fixed);
  assert.equal(p.phase(), phase);
  p.events.resize();
  assert.equal(p.bitmapValid(), true);
  p.settle();
  assert.equal(p.canvas.width, width);
  assert.equal(p.trace(), fixed);
  assert.equal(p.phase(), phase);
  p.mutate();
  p.settle();
  p.hidden(true);
  p.hidden(false);
  p.settle();
  assert.equal(p.phase(), phase);
  assert.equal(p.trace(), fixed);
  assert.equal(p.pending.size, 0);
  assert.equal(p.scene.dataset.geometry, 'compact');
});
test('quality recovery uses hysteresis and restores resolution without changing composition', () => {
  const p = visit({ paintCost: 30 });
  advanceUntil(p, () => p.scene.dataset.quality === '2', 'reach low tier');
  p.frame(125);
  const pose = p.trace();
  p.paintCost(5);
  for (let i = 0; i < 20; i++) p.frame(125);
  assert.equal(p.scene.dataset.quality, '2');
  advanceUntil(p, () => p.scene.dataset.quality === '1', 'recover one tier');
  p.frame(125);
  assert.equal(p.canvas.width, 1800);
  assert.equal(p.trace(), pose);
  advanceUntil(p, () => p.scene.dataset.quality === '0', 'recover full tier');
  p.frame(125);
  assert.equal(p.canvas.width, 2160);
  assert.equal(p.trace(), pose);
  assert.equal(p.bitmapValid(), true);
  p.settle();
  assert.equal(p.scene.dataset.geometry, 'full');
});
test('severe hold is bounded, preserves preference, and explicit On retries at the safe tier', () => {
  const p = visit({ paintCost: 60, saved: 'on' });
  advanceUntil(p, () => p.scene.dataset.quality === 'still', 'device hold');
  const fixed = p.trace(),
    phase = p.phase(),
    draws = p.draws();
  assert.equal(p.pending.size, 0);
  assert.equal(p.stored(), 'on');
  assert.equal(p.button.textContent, 'Motion: still (device)');
  assert.equal(p.button['aria-pressed'], 'false');
  for (let i = 0; i < 8; i++) p.frame(125);
  assert.equal(p.draws(), draws);
  assert.equal(p.trace(), fixed);
  assert.equal(p.phase(), phase);
  p.events.resize();
  p.settle();
  assert.equal(p.canvas.width, 1440);
  assert.equal(p.trace(), fixed);
  assert.equal(p.phase(), phase);
  p.click();
  p.settle();
  assert.equal(p.stored(), 'off');
  assert.equal(p.button.textContent, 'Motion: off');
  assert.equal(p.pending.size, 0);
  p.paintCost(5);
  p.click();
  p.settle();
  assert.equal(p.stored(), 'on');
  assert.equal(p.button['aria-pressed'], 'true');
  assert.equal(p.button.textContent, 'Motion: on');
  assert.ok(p.pending.size > 0);
  assert.equal(p.canvas.width, 1440);
  assert.ok(p.phase() > phase);
  assert.equal(p.trace(), fixed);
});
test('device overload during a long route flight finishes with one still destination paint', () => {
  const p = visit({ paintCost: 100, saved: 'on' });
  advanceUntil(p, () => p.scene.dataset.quality === '2', 'reach low tier before travelling');
  p.window.SiteScene.navigate('credits');
  for (let i = 0; i < 30 && p.scene.dataset.quality !== 'still'; i++) p.frame(300);
  assert.equal(p.scene.dataset.quality, 'still');
  assert.equal(p.scene.dataset.travel, 'flying');
  const phase = p.phase(),
    draws = p.draws();
  p.frame(300);
  assert.equal(p.scene.dataset.travel, 'settled');
  assert.equal(p.phase(), phase);
  assert.deepEqual(JSON.parse(p.trace()), model.routePose('credits', model.poses.network));
  assert.equal(p.draws(), draws + 1);
  assert.equal(p.pending.size, 0);
  assert.equal(p.stored(), 'on');
});

test('camera convergence depends on elapsed time, not the RAF frequency', () => {
  const target = model.poses.closing,
    from = model.poses.overview,
    poses = [];
  for (const fps of [30, 60, 120]) {
    let p = from;
    for (let i = 0; i < fps / 5; i++) p = model.followCamera(p, target, 1000 / fps);
    poses.push(p);
  }
  for (const p of poses)
    for (const key of ['position', 'target'])
      for (let i = 0; i < 3; i++) assert.ok(Math.abs(p[key][i] - poses[0][key][i]) < 1e-10);
  assert.deepEqual(model.followCamera(from, target, 0), from);
});
test('the live RAF camera uses actual elapsed time from its first scroll frame', () => {
  const reference = visit();
  reference.settle();
  reference.scroll(1800);
  reference.settle();
  const target = JSON.parse(reference.trace());
  for (const fps of [30, 60, 120]) {
    const p = visit();
    p.settle();
    const start = JSON.parse(p.trace()),
      phase = p.phase();
    p.scroll(1800);
    for (let i = 0; i < fps / 5; i++) p.frame(1000 / fps);
    const actual = JSON.parse(p.trace()),
      expected = model.followCamera(start, target, p.phase() - phase);
    for (const key of ['position', 'target'])
      for (let i = 0; i < 3; i++)
        assert.ok(Math.abs(actual[key][i] - expected[key][i]) < 1e-10, `live camera at ${fps}Hz`);
  }
});
test('Writing initialization events cannot change a held, hidden or printing camera', () => {
  const held = visit({ page: 'writing', paintCost: 60 });
  advanceUntil(held, () => held.scene.dataset.quality === 'still', 'Writing device hold');
  const fixed = held.trace(),
    phase = held.phase();
  held.event('site:scene-focus', { focus: 'leadership', reason: 'initial' });
  held.settle();
  assert.equal(held.trace(), fixed);
  assert.equal(held.phase(), phase);
  assert.equal(held.pending.size, 0);
  for (const mode of ['hidden', 'print']) {
    const p = visit({ page: 'writing' });
    p.settle();
    const camera = p.trace();
    if (mode === 'hidden') p.hidden(true);
    else p.events.beforeprint();
    p.event('site:scene-focus', { focus: 'leadership', reason: 'initial' });
    assert.equal(p.pending.size, 0);
    if (mode === 'hidden') p.hidden(false);
    else p.events.afterprint();
    p.frame();
    assert.equal(p.trace(), camera);
  }
});
test("crossing the near plane cannot jump a face's centroid, fog or depth order", () => {
  const rest = [
      [-1, -1, 0.5],
      [1, -1, 1.4],
      [1, 1, 2.9],
      [-1, 1, 2],
    ],
    f = { indices: [0, 1, 2, 3] },
    project = (p) => [p[0] / p[2], p[1] / p[2]];
  const face = (delta) => {
    const v = rest.map((p) => [p[0], p[1], p[2] + delta]);
    return model.projectedFace(
      f,
      v,
      v.map((p) => (p[2] >= 0.5 ? project(p) : null)),
      project
    );
  };
  const a = face(-1e-8),
    b = face(1e-8);
  assert.equal(a.points.length, 5);
  assert.equal(b.points.length, 4);
  assert.ok(Math.abs(a.depth - b.depth) < 3e-8);
  assert.ok(Math.abs(model.depthVisibility(a.depth) - model.depthVisibility(b.depth)) < 1e-8);
});
test('fog is bounded, smooth and monotone and surfaces/outlines use the same depth factor', () => {
  let previous = 1;
  for (let z = -10; z <= 120; z += 0.1) {
    const v = model.depthVisibility(z);
    assert.ok(v >= 0.0355 - 1e-12 && v <= 1);
    assert.ok(v <= previous + 1e-12);
    previous = v;
  }
  assert.equal(model.depthVisibility(8), 1);
  assert.ok(Math.abs(model.depthVisibility(100) - 0.0355) < 1e-12);
  for (const edge of [8, 100])
    assert.ok(
      Math.abs(model.depthVisibility(edge - 1e-3) - model.depthVisibility(edge + 1e-3)) < 1e-8
    );
  for (const sample of require('../review/sol-visual-v11-20261003/design-settings.json').fog
    .samples)
    assert.ok(
      Math.abs(model.depthVisibility(sample.cameraDepth) - sample.acceptedVisibility) < 1e-11
    );
  const w = model.worldFor('writing');
  w.objects = w.objects.filter((o) => o.depth === 0);
  for (const shape of model
    .projectedWorld(w, model.poses.library, 1440, 900, 6000)
    .filter((s) => s.kind === 'face')) {
    const f = w.faces[shape.material],
      haze = model.depthVisibility(shape.depth);
    assert.ok(Math.abs(shape.alpha - (f.opacity ?? 0.82) * haze) < 1e-12);
    assert.ok(Math.abs(shape.edgeAlpha - (f.edgeAlpha ?? 0.36) * haze) < 1e-12);
  }
});
test('atmosphere shares the finite 24-second phase with continuous position and velocity', () => {
  for (const time of [0, 175, 6000, 18345, 23999])
    assert.deepEqual(model.atmosphereState(time), model.atmosphereState(time + model.LOOP_MS));
  const a = model.atmosphereState(-0.01),
    b = model.atmosphereState(0.01);
  for (const key of ['x', 'y', 'light']) assert.ok(Math.abs(a[key] - b[key]) < 0.0001);
  assert.doesNotMatch(source, /setInterval|\.animate\(/);
});
test('all pulse envelopes preserve inverse transforms, conservative bounds and immutable rest coordinates', () => {
  for (const page of Object.keys(model.initialPoses)) {
    const w = model.worldFor(page),
      before = JSON.stringify(w);
    for (const o of w.objects)
      for (const t of [0, 3000, 6000, 9000, 12000, 18000, 21000]) {
        const transform = model.loopTransform(o, t);
        assert.ok(transform.scale >= 0.96 - 1e-12 && transform.scale <= 1.04 + 1e-12);
        for (const point of [o.points[0], o.points.at(-1)]) {
          const moved = transform(point),
            recovered = transform.inverse(moved);
          assert.ok(recovered.every((v, i) => Math.abs(v - point[i]) < 1e-10));
          assert.ok(
            Math.hypot(...moved.map((v, i) => v - transform.center[i])) <=
              o.radius * transform.scale + 1e-10
          );
        }
      }
    assert.equal(JSON.stringify(w), before);
  }
});
test('composed object/camera matrix matches independent world-space point projection', () => {
  const right = [0.6, 0, 0.8],
    up = [0, 1, 0],
    forward = [-0.8, 0, 0.6],
    eye = [4, 2, 23],
    dot = (p, a) => p.reduce((s, v, i) => s + (v - eye[i]) * a[i], 0);
  for (const page of Object.keys(model.initialPoses))
    for (const o of model.worldFor(page).objects.filter((_, i) => i % 17 === 0))
      for (const time of [0, 3000, 9000]) {
        const transform = model.loopTransform(o, time),
          center = [right, up, forward].map((a) => dot(transform.center, a));
        const actual = model.cameraVertices(o, transform, center, right, up, forward);
        for (let i = 0; i < o.points.length; i++) {
          const point = transform(o.points[i]),
            expected = [right, up, forward].map((a) => dot(point, a));
          assert.ok(actual[i].every((v, j) => Math.abs(v - expected[j]) < 1e-10));
        }
      }
});
test('mobile cadence responds to sustained cost with recovery headroom and no threshold oscillation', () => {
  assert.equal(model.cadenceFor(4, true), 30);
  assert.equal(model.cadenceFor(8, true), 20);
  assert.equal(model.cadenceFor(14, true), 12);
  assert.equal(model.cadenceFor(8, true, true), 30);
  assert.equal(model.cadenceFor(14, true, true), 20);
  const p = visit({ narrow: true, paintCost: 8 });
  advanceUntil(p, () => p.scene.dataset.cadence === '20', 'cost-aware 20Hz');
  for (let i = 0; i < 20; i++) {
    p.paintCost(i % 2 ? 8 : 8.4);
    p.frame(125);
    assert.equal(p.scene.dataset.cadence, '20');
  }
  p.paintCost(4);
  for (let i = 0; i < 10; i++) p.frame(125);
  assert.equal(p.scene.dataset.cadence, '20');
  advanceUntil(p, () => p.scene.dataset.cadence === '30', 'cheap paints recover one cadence step');
  assert.equal(p.scene.dataset.quality, '0');
});
test('detail fades across a tier change and Off freezes the exact displayed detail', () => {
  const p = visit({ paintCost: 30 });
  advanceUntil(p, () => p.scene.dataset.quality === '1', 'reach first tier');
  p.frame(20);
  const first = Number(p.scene.dataset.detail);
  assert.ok(first >= 0 && first < 1);
  for (let i = 0; i < 8; i++) p.frame(20);
  const next = Number(p.scene.dataset.detail);
  assert.ok(next > first && next < 1);
  const fixed = p.scene.dataset.detail,
    phase = p.phase();
  p.click();
  p.settle();
  p.mutate();
  p.events.resize();
  p.settle();
  assert.equal(p.scene.dataset.detail, fixed);
  assert.equal(p.phase(), phase);
  assert.equal(p.pending.size, 0);
});
test('travel progress is emitted with the displayed camera, retargets cleanly and completes on draw failure', () => {
  const p = visit();
  p.settle();
  const records = [];
  p.window.SiteScene.navigate('research', true, (value) =>
    records.push({ value, camera: p.trace() })
  );
  assert.equal(records.length, 1);
  assert.equal(records[0].value, 0);
  for (let i = 0; i < 30; i++) p.frame(60);
  assert.equal(records.at(-1).value, 1);
  assert.equal(records.at(-1).camera, p.trace());
  assert.ok(records.some((x) => x.value > 0.2 && x.value < 0.7));
  assert.ok(records.every((x, i) => i === 0 || x.value >= records[i - 1].value));
  const next = [];
  p.window.SiteScene.navigate('credits', true, (value) => next.push(value));
  p.frame(80);
  p.window.SiteScene.detachTravel();
  const detached = next.length;
  p.frame(80);
  assert.equal(next.length, detached);
  p.window.SiteScene.navigate('index', true, (value) => next.push(value));
  p.drawingFault();
  p.frame(80);
  assert.equal(next.at(-1), 1);
  assert.equal(p.pending.size, 0);
});

function assertFlightDepths(paints, sourceZ, endpointZ) {
  const direction = Math.sign(endpointZ - sourceZ),
    lower = Math.min(sourceZ, endpointZ),
    upper = Math.max(sourceZ, endpointZ);
  const depths = paints.map((state) => state.current.position[2]);
  assert.ok(
    depths.length > 10,
    'the assertion observes the displayed flight before and after mount'
  );
  assert.ok(
    depths.every((z) => z >= lower - 1e-8 && z <= upper + 1e-8),
    'the camera never passes its actual landing depth'
  );
  for (let i = 1; i < depths.length; i++)
    assert.ok(
      direction * (depths[i] - depths[i - 1]) >= -1e-8,
      'content mount cannot reverse the camera depth direction'
    );
}
function mountSceneFixture(p, page, y, focus = null) {
  p.document.body.dataset.page = page;
  p.window.scrollY = y;
  if (focus) p.event('site:scene-focus', { focus, reason: 'initial' });
  p.stops(Object.keys(model.pageStops[page] || {}).map((id, index) => [id, index * 1100]));
  p.window.SiteScene.refresh({ sync: true });
}
function nativeReadingPose(page, y, { narrow = false, height = 900, focus = null } = {}) {
  const p = visit({ page, narrow });
  p.window.innerHeight = height;
  if (focus) p.event('site:scene-focus', { focus, reason: 'initial' });
  p.event('resize');
  p.settle();
  p.scroll(y);
  p.settle();
  return JSON.parse(p.trace());
}
function assertInstantLanding(to, landing, options) {
  const p = visit(options);
  p.settle();
  let progress = 0;
  p.window.SiteScene.navigate(
    to,
    options.animate !== false,
    (value) => (progress = value),
    landing
  );
  p.settle();
  assert.deepEqual(
    JSON.parse(p.trace()),
    model.routePose(to, model.poses[model.initialPoses[to]]),
    'an unresolved landing cannot retain the old room on an instant arrival'
  );
  assert.equal(progress, 1);
  assert.equal(p.scene.dataset.travel, 'settled');
}
function reverseEndpointFlight(from, to, narrow) {
  const target = nativeReadingPose(to, 14100, { narrow }),
    paints = [],
    p = visit({ page: from, narrow, ribbonProbe: (state) => paints.push(state) });
  p.settle();
  for (const warm of [false, true]) {
    if (warm) {
      p.window.SiteScene.navigate(from, false);
      mountSceneFixture(p, from, 0);
      p.settle();
    }
    const sourceZ = JSON.parse(p.trace()).position[2];
    let progress = 0;
    paints.length = 0;
    p.window.SiteScene.navigate(to, true, (value) => (progress = value), {
      position: 'end',
      hash: '',
    });
    p.frame(80);
    assert.equal(p.document.body.dataset.page, from);
    assert.deepEqual(
      paints.at(-1).journey.to,
      target,
      'the native bottom is the flight target before incoming DOM exists'
    );
    p.scroll(0);
    advanceUntil(
      p,
      () => progress >= 0.5,
      'reverse endpoint flight reaches the hidden content mount',
      20
    );
    mountSceneFixture(p, to, 14100);
    for (let i = 0; i < 30; i++) p.frame(80);
    assert.deepEqual(JSON.parse(p.trace()), target);
    assert.equal(progress, 1);
    assertFlightDepths(paints, sourceZ, target.position[2]);
  }
}
test('departure scroll events cannot retarget a flight through source page geometry', () => {
  const paints = [],
    p = visit({ ribbonProbe: (state) => paints.push(state) });
  p.settle();
  p.scroll(14100);
  p.settle();
  const sourceZ = JSON.parse(p.trace()).position[2],
    target = model.routePose('research', model.poses[model.initialPoses.research]);
  let progress = 0;
  paints.length = 0;
  p.window.SiteScene.navigate('research', true, (value) => (progress = value));
  // A queued native scroll from the source page can arrive after scene routing,
  // while the incoming DOM has not been mounted at the hidden midpoint yet.
  p.scroll(14100);
  p.frame(80);
  assert.equal(p.document.body.dataset.page, 'index');
  assert.deepEqual(
    paints.at(-1).journey.to,
    target,
    'source semantic stops cannot supply a destination target'
  );
  advanceUntil(
    p,
    () => progress >= 0.5,
    'the real displayed flight reaches its mount midpoint',
    20
  );
  mountSceneFixture(p, 'research', 0);
  for (let i = 0; i < 30; i++) p.frame(80);
  assert.deepEqual(JSON.parse(p.trace()), target);
  assert.equal(progress, 1);
  assertFlightDepths(paints, sourceZ, target.position[2]);
});
test('reverse endpoint flights target the destination bottom before content mount and retain depth direction', () => {
  for (const narrow of [false, true])
    for (const [from, to] of [
      ['credits', 'talks'],
      ['talks', 'writing'],
      ['writing', 'research'],
      ['research', 'index'],
    ])
      reverseEndpointFlight(from, to, narrow);
});
test('unknown history and fragment landings hold the displayed camera until destination mount', () => {
  const cases = [
    ['research', { position: [0, 7050], hash: '' }, 7050, null],
    ['research', { position: null, hash: '#topics' }, 2200, null],
    ['writing', { position: 'end', hash: '', search: '?topic=leadership' }, 14300, 'leadership'],
  ];
  for (const [to, landing, y, focus] of cases) {
    const paints = [],
      p = visit({ ribbonProbe: (state) => paints.push(state) });
    p.settle();
    p.scroll(14100);
    p.settle();
    const displayed = p.trace(),
      phase = p.phase();
    let progress = 0;
    paints.length = 0;
    p.window.SiteScene.navigate(to, true, (value) => (progress = value), landing);
    assert.equal(p.scene.dataset.direction, 'forward');
    p.scroll(14100);
    p.window.innerHeight = 700;
    p.event('resize');
    advanceUntil(
      p,
      () => progress >= 0.5,
      'an unresolved landing still reaches the hidden content mount',
      20
    );
    assert.equal(
      p.trace(),
      displayed,
      'unknown native geometry must not cause a speculative camera departure'
    );
    assert.ok(p.phase() > phase, 'holding the camera does not stop the shared ambient clock');
    const target = nativeReadingPose(to, y, { height: 700, focus });
    mountSceneFixture(p, to, y, focus);
    for (let i = 0; i < 30; i++) p.frame(80);
    assert.deepEqual(JSON.parse(p.trace()), target);
    assert.equal(progress, 1);
    assertFlightDepths(paints, JSON.parse(displayed).position[2], target.position[2]);
  }
  for (const options of [{ animate: false }, { saved: 'off' }, { reduced: true }])
    for (const [to, landing] of [
      ['research', { position: [0, 7050], hash: '' }],
      ['research', { position: null, hash: '#topics' }],
      ['writing', { position: null, hash: '', search: '?topic=leadership' }],
    ])
      assertInstantLanding(to, landing, options);
});

test('midflight destination layout retargeting preserves the displayed camera and shared ribbon clock', () => {
  const paints = [],
    p = visit({ ribbonProbe: (state) => paints.push(state) });
  p.settle();
  const records = [],
    before = p.trace(),
    phase = p.phase();
  p.window.SiteScene.navigate('research', true, (value) => records.push(value));
  p.frame(80);
  assert.equal(
    p.trace(),
    before,
    'cold route preparation cannot advance before the first flight paint'
  );
  assert.ok(p.phase() > phase, 'the existing ambient clock continues at flight start');
  assert.equal(records.at(-1), 0);
  for (let i = 0; i < 6; i++) p.frame(80);
  const mountedCamera = p.trace(),
    mountedPhase = p.phase(),
    mountedProgress = records.at(-1);
  p.document.body.dataset.page = 'research';
  p.window.scrollY = 14100;
  p.stops(Object.keys(model.pageStops.research).map((id, index) => [id, index * 1100]));
  p.window.SiteScene.refresh({ sync: true });
  p.frame(0);
  assert.equal(
    p.trace(),
    mountedCamera,
    'a destination bottom/history landing rebases rather than snapping the camera'
  );
  assert.equal(p.phase(), mountedPhase);
  assert.equal(records.at(-1), mountedProgress);
  const retained = paints.at(-1).journey;
  assert.deepEqual(JSON.parse(p.trace()), retained.from);
  assert.ok(retained.duration > 0 && retained.duration < 1300);
  // A skipped RAF can advance the solver without painting. Cancellation must
  // preserve actual displayed progress, not that newer unseen solver state.
  p.frame(80);
  const displayedCamera = p.trace(),
    displayedPhase = p.phase(),
    displayedProgress = records.at(-1),
    paintCount = paints.length;
  p.frame(10);
  assert.equal(paints.length, paintCount);
  p.hidden(true);
  p.frame(30000);
  p.hidden(false);
  p.frame(0);
  assert.equal(p.trace(), displayedCamera);
  assert.equal(p.phase(), displayedPhase);
  assert.equal(records.at(-1), displayedProgress);
  for (let i = 0; i < 30; i++) p.frame(80);
  assert.deepEqual(JSON.parse(p.trace()), model.routePose('research', model.poses.closing));
  assert.equal(records.at(-1), 1);
  assert.ok(
    records.every((value, index) => index === 0 || value >= records[index - 1]),
    'layout/pause retargets keep painted progress monotone'
  );
  // Reversal before DOM mount targets a new route from the last real paint.
  p.window.SiteScene.navigate('writing');
  for (let i = 0; i < 5; i++) p.frame(80);
  const reversal = p.trace();
  p.window.SiteScene.navigate('index');
  p.document.body.dataset.page = 'index';
  p.window.scrollY = 0;
  p.stops(Object.keys(model.pageStops.index).map((id, index) => [id, index * 1100]));
  p.window.SiteScene.refresh({ sync: true });
  p.frame(80);
  assert.equal(
    p.trace(),
    reversal,
    'quick reversal plus synchronous layout retains its first displayed camera'
  );
  for (let i = 0; i < 30; i++) p.frame(80);
  assert.deepEqual(JSON.parse(p.trace()), model.routePose('index', model.poses.overview));
  assert.ok(
    paints.every((state) =>
      [...state.current.position, ...state.current.target].every(Number.isFinite)
    )
  );
  assert.ok(Number(p.scene.dataset.rooms) <= 3 && Number(p.scene.dataset.roomModels) <= 6);
  assert.equal(p.pending.size, 1);
});

test('a route chosen before the reduced-motion change event paints its static arrival', () => {
  const p = visit();
  p.settle();
  p.media.matches = true;
  assert.equal(p.window.SiteScene.canTravel(), false);
  p.window.SiteScene.navigate('research');
  p.media.change();
  p.settle();
  assert.equal(p.scene.dataset.travel, 'settled');
  assert.deepEqual(
    JSON.parse(p.trace()),
    model.routePose('research', model.poses[model.initialPoses.research])
  );
  assert.equal(p.pending.size, 0);
});

// User-visible regression: archive-bound progress formerly stayed zero here.
test('Writing responds to the first small gestures before the archive, including after route arrival', () => {
  for (const arrival of [false, true])
    for (const single of [false, true]) {
      const p = visit({ page: arrival ? 'index' : 'writing', single });
      if (arrival) {
        p.window.SiteScene.navigate('writing');
        // The real router installs the destination DOM before its mount flush.
        p.document.body.dataset.page = 'writing';
        p.window.SiteScene.refresh({ sync: true });
        for (let i = 0; i < 30; i++) p.frame(80);
      }
      p.settle();
      const start = p.trace(),
        phase = p.phase(),
        draws = p.draws();
      let last = start;
      for (const y of [100, 200, 400]) {
        p.scroll(y);
        p.settle();
        assert.notEqual(p.trace(), last, `first gesture at ${y}px`);
        last = p.trace();
      }
      p.scroll(0);
      p.settle();
      assert.equal(p.trace(), start);
      assert.ok(p.phase() > phase);
      assert.ok(p.draws() > draws);
    }
});

// The world landmark shares the Canvas ownership and existing freeze lifecycle.
// No DOM band appears or moves when a preference stops the living scene.
test('Writing world formula stays singular and frozen through Off/reduced and resumes with one retained cache', () => {
  for (const reduced of [false, true]) {
    const p = visit({ page: 'writing' });
    p.settle();
    const before = p.window.SiteScene.diagnostics().formula;
    assert.ok(before.paintCount > 0);
    assert.equal(before.lastPaintCount, 1);
    assert.equal(before.lastDrawSubmissions, 24);
    assert.equal(p.document.body.dataset.formulaMode, undefined);
    assert.equal(p.scene.dataset.ready, 'true');
    const fixed = p.trace(),
      phase = p.phase(),
      corners = JSON.stringify(before.projection.corners);
    if (reduced) {
      p.media.matches = true;
      p.media.change();
    } else p.click();
    p.settle();
    const frozen = p.window.SiteScene.diagnostics().formula;
    assert.equal(frozen.lastPaintCount, 1, 'the frozen Canvas retains its sole world landmark');
    assert.equal(frozen.cacheBuilds, 1);
    assert.equal(JSON.stringify(frozen.projection.corners), corners);
    assert.equal(p.document.body.dataset.formulaMode, undefined);
    const paints = p.draws(),
      formulaPaints = frozen.paintCount;
    p.scroll(60);
    for (let i = 0; i < 8; i++) p.frame(60);
    assert.equal(p.draws(), paints);
    assert.equal(p.window.SiteScene.diagnostics().formula.paintCount, formulaPaints);
    assert.equal(p.trace(), fixed);
    assert.equal(p.phase(), phase);
    assert.equal(p.pending.size, 0);
    if (reduced) {
      p.media.matches = false;
      p.media.change();
    } else p.click();
    for (let i = 0; i < 30; i++) p.frame(60);
    assert.ok(
      p.window.SiteScene.diagnostics().formula.paintCount > formulaPaints,
      'resuming moves the existing world landmark with the camera and ambient phase'
    );
    assert.equal(p.formulaConstructions(), 1);
    assert.equal(p.window.SiteScene.diagnostics().formula.lastPaintCount, 1);
  }
  for (const options of [{ saved: 'off' }, { reduced: true, saved: 'on' }]) {
    const p = visit({ page: 'writing', ...options });
    p.settle();
    const frozen = p.window.SiteScene.diagnostics().formula;
    assert.equal(frozen.cacheBuilds, 1);
    assert.equal(frozen.lastPaintCount, 1);
    assert.equal(frozen.projection.clock, 0);
    assert.equal(p.pending.size, 0);
    assert.equal(p.formulaConstructions(), 1);
    const paints = p.draws();
    for (let i = 0; i < 8; i++) p.frame(60);
    assert.equal(p.draws(), paints, 'startup frozen world requires no continuing work');
    if (options.reduced) {
      p.media.matches = false;
      p.media.change();
    } else p.click();
    assert.equal(p.draws(), paints, 'activation queues the existing shared paint');
    assert.equal(p.window.SiteScene.diagnostics().formula.cacheBuilds, 1);
    p.settle();
    assert.ok(p.window.SiteScene.diagnostics().formula.paintCount > frozen.paintCount);
    assert.equal(p.formulaConstructions(), 1);
  }
});
