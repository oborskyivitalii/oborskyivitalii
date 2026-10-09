'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const factory = require('../site/effects/embedded-scene.cjs');
const fragmentFactory = require('../site/effects/fragment-plan.cjs');
const math = require('../site/engine/math.cjs')();

function events() {
  const listeners = new Map();
  return {
    addEventListener(name, listener) {
      const existing = listeners.get(name) || [];
      existing.push(listener);
      listeners.set(name, existing);
    },
    emit(name) {
      for (const listener of listeners.get(name) || []) listener();
    },
  };
}

function style(visibility = '') {
  return {
    visibility,
    setProperty(name, value) {
      this[name] = value;
    },
    removeProperty(name) {
      delete this[name];
    },
  };
}

function harness({ deferred = false } = {}) {
  const captures = [];
  const samples = [];
  const preparations = [];
  const assets = [];
  const stages = [];
  const dispatched = [];
  let canTravel = true;
  let themeChange;
  const rect = { left: 80.25, top: 150.5, width: 540.75, height: 110.25 };
  const envelope = {
    left: rect.left - 12,
    top: rect.top - 12,
    width: rect.width + 24,
    height: rect.height + 24,
  };
  const text = 'Delegated model judgment changes control and responsibility.';
  const documentEvents = events();
  const body = {
    dataset: { page: 'index' },
    append(node) {
      stages.push(node);
      node.connected = true;
    },
  };
  const document = {
    ...documentEvents,
    body,
    hidden: false,
    documentElement: { clientWidth: 1440 },
    fonts: events(),
    createElement() {
      return {
        style: style(),
        children: [],
        attributes: {},
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        append(node) {
          this.children.push(node);
        },
        querySelectorAll() {
          return [];
        },
        remove() {
          this.connected = false;
        },
      };
    },
    importNode(node) {
      return { ...node };
    },
  };
  const windowEvents = events();
  const window = {
    ...windowEvents,
    innerWidth: 1440,
    innerHeight: 900,
    devicePixelRatio: 2,
    SiteEffects: {},
    SiteScene: { canTravel: () => canTravel },
    MutationObserver: class {
      constructor(callback) {
        themeChange = callback;
      }
      observe() {}
    },
    CustomEvent: class {
      constructor(type) {
        this.type = type;
      }
    },
    dispatchEvent(event) {
      dispatched.push(event.type);
      windowEvents.emit(event.type);
      return true;
    },
  };
  const embeddedTexture = () => ({
    settings: { selector: '.archive-intro > .hero-description' },
    capture(stage, options) {
      const asset = {
        owner: { textContent: text },
        rect: { ...rect },
        envelope: { ...envelope },
        canvas: { width: 1129, height: 269 },
        pixelCount: 1129 * 269,
        disposeCount: 0,
        dispose() {
          this.disposeCount++;
        },
      };
      assets.push(asset);
      let resolve;
      let reject;
      const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      });
      const capture = {
        stage,
        options,
        asset,
        resolve: (result = asset) => resolve(result),
        reject,
      };
      captures.push(capture);
      if (!deferred) resolve(asset);
      return promise;
    },
  });
  const embeddedPlan = () => ({
    prepare(options) {
      preparations.push(options);
      return {
        ...options,
        shards: options.cells.map((_, index) => ({ id: `${options.id}:${index}` })),
      };
    },
    sample(prepared, frame) {
      samples.push({ prepared, ...frame });
      return prepared.shards.map((shard) => ({
        kind: 'embedded-face',
        id: shard.id,
        depth: 12,
        alpha: 1,
        progress: frame.progress,
      }));
    },
    paint(ctx, shape, surface) {
      if (shape.kind !== 'embedded-face') return false;
      ctx.drawImage(surface);
      return true;
    },
  });
  const api = {
    ...math,
    poses: { researchStart: { position: [0, 0, 24], target: [0, 0, -12] } },
    initialPoses: { research: 'researchStart' },
    routeOrder: ['index', 'research', 'writing', 'talks', 'credits'],
    roomSpacing: 128,
  };
  const install = vm.runInNewContext(`(${factory.toString()})`, {
    document,
    window,
    AbortController,
    Promise,
  });
  const effect = install(api, {
    fragmentPlan: fragmentFactory,
    embeddedPlan,
    embeddedTexture,
  });
  const bridge = window.SiteEffects.embedded;
  const data = { page: 'research', main: { querySelector: () => ({ textContent: text }) } };
  const frame = {
    width: 1440,
    height: 900,
    compact: false,
    ambientTime: 100,
    current: { position: [0, 0, 24], target: [0, 0, -12] },
    colors: { paper: '#102030', cyan: '#abcdef', amber: '#cdefab' },
    page: 'index',
  };
  function owner(overrides = {}) {
    return {
      textContent: text,
      style: style(),
      getBoundingClientRect: () => ({ ...rect }),
      ...overrides,
    };
  }
  return {
    effect,
    bridge,
    data,
    frame,
    document,
    window,
    captures,
    preparations,
    samples,
    assets,
    stages,
    dispatched,
    owner,
    setTravel(value) {
      canTravel = value;
    },
    themeChange: () => themeChange(),
    landing: { from: 'index', to: 'research', direction: 'forward', landing: { position: [0, 0] } },
  };
}

test('warm acquisition waits for a scene frame and persists once until navigation', async () => {
  const h = harness();
  assert.equal(await h.bridge.prime(h.data, 78), false);
  assert.equal(h.captures.length, 0);
  h.effect.collect(h.frame);
  await new Promise(setImmediate);
  assert.equal(h.bridge.diagnostics().ready, true);
  assert.equal(h.captures.length, 1);
  assert.equal(await h.bridge.prime(h.data, 78), true);
  assert.equal(h.captures.length, 1);
  const shapes = h.effect.collect(h.frame);
  const ids = shapes.map((shape) => shape.id);
  assert.ok(ids.length > 0);
  assert.deepEqual(
    h.effect.collect({ ...h.frame, ambientTime: 500 }).map((shape) => shape.id),
    ids
  );
  assert.ok(h.samples.every((sample) => sample.progress === 0));
  assert.equal(h.stages.filter((stage) => stage.connected).length, 0);
  assert.equal(h.assets[0].disposeCount, 0);
});

test('the same rest IDs assemble on the existing ambient clock and land before native restoration', async () => {
  const h = harness();
  h.effect.collect(h.frame);
  await h.bridge.prime(h.data, 78);
  const ids = h.effect.collect(h.frame).map((shape) => shape.id);
  assert.equal(h.bridge.begin(h.landing), true);
  const first = h.effect.collect({ ...h.frame, ambientTime: 100 });
  assert.ok(first.every((shape) => shape.progress === 0));
  const halfway = h.effect.collect({ ...h.frame, ambientTime: 1000 });
  assert.ok(halfway.every((shape) => Math.abs(shape.progress - 5 / 9) < 1e-12));
  assert.equal(
    h.bridge.diagnostics().progress,
    0.5,
    'the physical endpoint reserves a native handoff tail'
  );
  assert.deepEqual(
    halfway.map((shape) => shape.id),
    ids
  );
  h.document.body.dataset.page = 'research';
  const owner = h.owner();
  h.bridge.land({ querySelector: () => owner });
  assert.equal(owner.style.visibility, 'hidden');
  assert.equal(h.bridge.owner(), owner);
  assert.equal(h.bridge.complete(), false);
  const last = h.effect.collect({ ...h.frame, page: 'research', ambientTime: 1900 });
  assert.ok(last.every((shape) => shape.progress === 1));
  assert.deepEqual(
    last.map((shape) => shape.id),
    ids
  );
  assert.equal(h.bridge.complete(), true);
  assert.notEqual(owner.style.visibility, 'hidden');
  assert.equal(h.bridge.owner(), null);
  assert.equal(h.bridge.reservation(), null);
  assert.equal(h.effect.collect({ ...h.frame, page: 'research' }).length, 0);
  assert.equal(h.assets[0].disposeCount, 1);
});

test('failed capture and aborted stale decode cannot replace a newer prepared plate', async () => {
  const h = harness({ deferred: true });
  h.effect.collect(h.frame);
  const failed = h.bridge.prime(h.data, 78);
  h.captures[0].reject(new Error('decode failed'));
  assert.equal(await failed, false);
  assert.equal(h.bridge.reservation(), null);
  assert.equal(h.stages.filter((stage) => stage.connected).length, 0);
  const stale = h.bridge.prime(h.data, 78);
  h.window.emit('resize');
  assert.equal(h.captures[1].options.signal.aborted, true);
  const current = h.bridge.prime(h.data, 78);
  h.captures[2].resolve();
  assert.equal(await current, true);
  h.captures[1].resolve();
  assert.equal(await stale, false);
  assert.equal(h.assets[1].disposeCount, 1);
  assert.equal(h.assets[2].disposeCount, 0);
  assert.equal(h.bridge.diagnostics().ready, true);
  assert.equal(h.stages.filter((stage) => stage.connected).length, 0);
});

test('reservation shares finite piece, owner, byte and pixel caps until cancellation', async () => {
  const h = harness();
  assert.equal(h.bridge.reservation(), null);
  h.effect.collect(h.frame);
  await h.bridge.prime(h.data, 78);
  const reserved = h.bridge.reservation();
  assert.equal(reserved.owners, 1);
  assert.equal(reserved.pieces, h.bridge.diagnostics().ids.length);
  assert.equal(reserved.layerPixels, h.assets[0].pixelCount);
  h.effect.collect({ ...h.frame, compact: true });
  assert.equal(h.bridge.reservation().pieces, reserved.pieces);
  assert.equal(
    h.bridge.reservation().pieces,
    12,
    'changing a frame flag cannot shrink live allocation accounting'
  );
  const geometry = fragmentFactory(math);
  const caps = geometry.settings.caps.full;
  assert.equal(geometry.admit(reserved, caps), true);
  const outgoing = {
    pieces: 48,
    owners: 7,
    descendants: 100,
    textBytes: 8192,
    layerPixels: 1000000,
  };
  const combined = Object.fromEntries(
    Object.keys(caps).map((key) => [key, reserved[key] + outgoing[key]])
  );
  assert.equal(geometry.admit(combined, caps), true);
  const full = { ...combined, pieces: caps.pieces + 1 };
  assert.equal(geometry.admit(full, caps), false);
  assert.equal(h.bridge.begin(h.landing), true);
  h.bridge.cancel();
  assert.equal(h.bridge.reservation(), null);
  assert.equal(h.assets[0].disposeCount, 1);
});

test('assembly progresses monotonically through the canonical ambient loop boundary', async () => {
  const h = harness();
  const startingFrame = { ...h.frame, ambientTime: math.LOOP_MS - 600 };
  h.effect.collect(startingFrame);
  await h.bridge.prime(h.data, 78);
  assert.equal(h.bridge.begin(h.landing), true);
  for (const [ambientTime, expected] of [
    [math.LOOP_MS - 600, 0],
    [math.LOOP_MS - 150, 0.25],
    [300, 0.5],
    [750, 0.75],
    [1200, 1],
  ]) {
    const shapes = h.effect.collect({ ...h.frame, ambientTime });
    assert.ok(shapes.length > 0);
    const physical = Math.min(1, expected / 0.9);
    assert.ok(shapes.every((shape) => shape.progress === physical));
    assert.equal(h.bridge.diagnostics().progress, expected);
    const frozen = h.effect.collect({ ...h.frame, ambientTime });
    assert.ok(
      frozen.every((shape) => shape.progress === physical),
      'a frozen shared clock cannot advance assembly'
    );
  }
  assert.equal(h.bridge.complete(), true);
});

test('native handoff waits for the exact destination camera and crossfades the last 180ms', async () => {
  const h = harness();
  h.effect.collect(h.frame);
  await h.bridge.prime(h.data, 78);
  assert.equal(h.bridge.begin(h.landing), true);
  const owner = h.owner();
  h.bridge.land({ querySelector: () => owner });
  const target = h.preparations[0].pose;
  h.effect.collect({ ...h.frame, page: 'research', current: target, ambientTime: 1700 });
  assert.equal(
    owner.style.visibility,
    'hidden',
    'native paint cannot appear before solids reach their endpoint'
  );
  for (const current of [
    {
      ...target,
      position: target.position.map((value, index) => value + (index === 0 ? 1e-9 : 0)),
    },
    { ...target, target: target.target.map((value, index) => value + (index === 1 ? 1e-9 : 0)) },
  ]) {
    const faces = h.effect.collect({ ...h.frame, page: 'research', current, ambientTime: 1774 });
    assert.ok(faces.every((face) => face.progress === 1 && face.alpha === 1));
    assert.equal(h.bridge.diagnostics().handoff, 0);
    assert.equal(
      owner.style.visibility,
      'hidden',
      'even a tiny camera mismatch must keep native paint hidden'
    );
  }
  const middle = h.effect.collect({
    ...h.frame,
    page: 'research',
    current: target,
    ambientTime: 1810,
  });
  const nativeAlpha = Number(owner.style.opacity);
  assert.equal(owner.style.visibility, 'visible');
  assert.ok(Math.abs(nativeAlpha - 0.5) < 1e-12);
  assert.ok(Math.abs(h.bridge.diagnostics().handoff - 0.5) < 1e-12);
  assert.ok(middle.every((face) => face.progress === 1 && Math.abs(face.alpha - 0.5) < 1e-12));
  assert.ok(middle.every((face) => Math.abs(face.alpha + nativeAlpha - 1) < 1e-12));
  assert.equal(h.bridge.complete(), false);
  const endpoint = h.effect.collect({
    ...h.frame,
    page: 'research',
    current: target,
    ambientTime: 1900,
  });
  assert.ok(endpoint.every((face) => face.alpha < 1e-12));
  assert.ok(Math.abs(Number(owner.style.opacity) - 1) < 1e-12);
  assert.equal(h.bridge.complete(), true);
  assert.equal(
    Object.hasOwn(owner.style, 'opacity'),
    false,
    'completion removes its temporary native opacity'
  );
  assert.notEqual(owner.style.visibility, 'hidden');
  assert.equal(h.bridge.owner(), null);
  assert.equal(h.assets[0].disposeCount, 1);
});

test('cancel or completion during handoff restores the exact original opacity and visibility', async () => {
  for (const finish of ['cancel', 'complete']) {
    const h = harness();
    h.effect.collect(h.frame);
    await h.bridge.prime(h.data, 78);
    assert.equal(h.bridge.begin(h.landing), true);
    const originalStyle = { ...style('visible'), opacity: '0.42' };
    const owner = h.owner({ style: originalStyle });
    h.bridge.land({ querySelector: () => owner });
    const target = h.preparations[0].pose;
    h.effect.collect({ ...h.frame, page: 'research', current: target, ambientTime: 1810 });
    assert.notEqual(
      owner.style.opacity,
      '0.42',
      'the crossfade must actually own a temporary opacity'
    );
    if (finish === 'complete')
      h.effect.collect({ ...h.frame, page: 'research', current: target, ambientTime: 1900 });
    h.bridge[finish]();
    assert.equal(owner.style.visibility, 'visible');
    assert.equal(owner.style.opacity, '0.42');
    assert.equal(h.bridge.owner(), null);
    assert.equal(h.bridge.reservation(), null);
    assert.equal(h.assets[0].disposeCount, 1);
  }
});

test('native scroll invalidates moved hidden or crossfading paint while preserving unchanged mount scroll', async () => {
  for (const phase of ['hidden', 'handoff']) {
    const h = harness();
    h.effect.collect(h.frame);
    await h.bridge.prime(h.data, 78);
    h.window.emit('scroll');
    assert.equal(
      h.bridge.diagnostics().ready,
      true,
      'idle Home scroll retains world-anchored decoration'
    );
    assert.equal(h.assets[0].disposeCount, 0);
    assert.equal(h.bridge.begin(h.landing), true);
    let nativeRect = h.owner().getBoundingClientRect();
    const owner = h.owner({
      style: { ...style('visible'), opacity: '0.42' },
      getBoundingClientRect: () => ({ ...nativeRect }),
    });
    h.bridge.land({ querySelector: () => owner });
    const current = phase === 'handoff' ? h.preparations[0].pose : h.frame.current;
    h.effect.collect({
      ...h.frame,
      page: 'research',
      current,
      ambientTime: phase === 'handoff' ? 1810 : 1000,
    });
    h.window.emit('scroll');
    assert.equal(
      h.bridge.owner(),
      owner,
      'the programmatic mount scroll keeps matching native geometry'
    );
    assert.equal(h.assets[0].disposeCount, 0);
    assert.equal(owner.style.visibility, phase === 'handoff' ? 'visible' : 'hidden');
    nativeRect = { ...nativeRect, top: nativeRect.top - 32 };
    h.window.emit('scroll');
    assert.equal(owner.style.visibility, 'visible');
    assert.equal(owner.style.opacity, '0.42');
    assert.equal(h.bridge.owner(), null);
    assert.equal(h.bridge.reservation(), null);
    assert.equal(h.bridge.diagnostics().ready, false);
    assert.equal(h.assets[0].disposeCount, 1);
    assert.equal(h.effect.collect({ ...h.frame, page: 'research' }).length, 0);
  }
});

test('prime waits for the resized scene dimensions instead of rasterizing against stale paint', async () => {
  const h = harness();
  h.effect.collect(h.frame);
  h.window.innerWidth = 390;
  h.window.innerHeight = 844;
  h.document.documentElement.clientWidth = 390;
  assert.equal(await h.bridge.prime(h.data, 78), false);
  assert.equal(h.captures.length, 0);
  h.effect.collect(h.frame);
  await new Promise(setImmediate);
  assert.equal(h.captures.length, 0, 'a second stale frame still must not admit a raster');
  h.effect.collect({ ...h.frame, width: 390, height: 844, compact: true });
  await new Promise(setImmediate);
  assert.equal(h.bridge.diagnostics().ready, true);
  assert.equal(h.captures.length, 1);
  assert.equal(h.captures[0].options.width, 390);
  assert.equal(h.captures[0].options.height, 844);
  assert.equal(h.bridge.reservation().pieces, 8);
});

test('font, theme and motion reactivation notify cached route warming and prepare a fresh texture', async () => {
  for (const trigger of ['font', 'theme', 'motion']) {
    const h = harness();
    h.effect.collect(h.frame);
    await h.bridge.prime(h.data, 78);
    h.window.addEventListener('site:embedded-invalidated', () => h.bridge.prime(h.data, 78));
    if (trigger === 'font') h.document.fonts.emit('loadingdone');
    else if (trigger === 'theme') h.themeChange();
    else {
      h.setTravel(false);
      h.window.emit('site:motion-preference');
      assert.equal(h.dispatched.length, 0, 'motion Off must not request new raster work');
      assert.equal(h.bridge.diagnostics().ready, false);
      h.setTravel(true);
      h.window.emit('site:motion-preference');
    }
    await new Promise(setImmediate);
    assert.equal(h.assets[0].disposeCount, 1);
    assert.equal(h.dispatched.filter((name) => name === 'site:embedded-invalidated').length, 1);
    assert.equal(h.captures.length, 2);
    assert.equal(h.bridge.diagnostics().ready, true);
    assert.equal(h.assets[1].disposeCount, 0);
    assert.equal(h.stages.filter((stage) => stage.connected).length, 0);
  }
});

test('unsupported routes and nonmatching native landing keep the full block visible', async () => {
  for (const context of [
    { from: 'writing', to: 'research', direction: 'backward' },
    { from: 'index', to: 'talks', direction: 'forward' },
    { from: 'index', to: 'research', direction: 'forward', landing: { hash: '#details' } },
    { from: 'index', to: 'research', direction: 'forward', landing: { position: [0, 10] } },
  ]) {
    const h = harness();
    h.effect.collect(h.frame);
    await h.bridge.prime(h.data, 78);
    assert.equal(h.bridge.begin(context), false);
    assert.equal(h.bridge.diagnostics().ready, false);
    assert.equal(h.assets[0].disposeCount, 1);
  }
  for (const mismatch of ['text', 'bounds', 'missing']) {
    const h = harness();
    h.effect.collect(h.frame);
    await h.bridge.prime(h.data, 78);
    assert.equal(h.bridge.begin(h.landing), true);
    const owner = h.owner(mismatch === 'text' ? { textContent: 'Changed content' } : {});
    if (mismatch === 'bounds') {
      const original = owner.getBoundingClientRect();
      owner.getBoundingClientRect = () => ({ ...original, left: original.left + 1 });
    }
    h.bridge.land({ querySelector: () => (mismatch === 'missing' ? null : owner) });
    assert.notEqual(owner.style.visibility, 'hidden');
    assert.equal(h.bridge.owner(), null);
    assert.equal(h.bridge.reservation(), null);
    assert.equal(h.bridge.complete(), true);
  }
});

test('Off, theme, resize and visibility cancellation restore paint and release one texture', async () => {
  for (const event of ['off', 'theme', 'resize', 'hidden']) {
    const h = harness();
    h.effect.collect(h.frame);
    await h.bridge.prime(h.data, 78);
    assert.equal(h.bridge.begin(h.landing), true);
    const owner = h.owner({ style: style('visible') });
    h.bridge.land({ querySelector: () => owner });
    assert.equal(owner.style.visibility, 'hidden');
    if (event === 'off') {
      h.setTravel(false);
      h.window.emit('site:motion-preference');
    } else if (event === 'theme') h.themeChange();
    else if (event === 'hidden') {
      h.document.hidden = true;
      h.document.emit('visibilitychange');
    } else h.window.emit('resize');
    assert.equal(owner.style.visibility, 'visible');
    assert.equal(h.bridge.owner(), null);
    assert.equal(h.bridge.reservation(), null);
    assert.equal(h.assets[0].disposeCount, 1);
    const context = new Proxy(
      {},
      {
        get() {
          throw Error('declining paint changed context');
        },
      }
    );
    assert.equal(h.effect.paint(context, { kind: 'face' }), false);
  }
});
