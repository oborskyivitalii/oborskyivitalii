'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
const {
  flightPose,
  endScrollGate,
  atPageEnd,
  atPageStart,
  prepareEndScrollFooter,
  descriptor,
  createPresentation,
} = require('../site/effects/flight.cjs');
const { decorateFlight: decorate } = require('../tools/site/effects.cjs');

function presentationFixture(options = {}) {
  const calls = [],
    stored = new Map(Object.entries(options.preferences || {})),
    style = {
      opacity: '1',
      transform: 'none',
      removeProperty(name) {
        delete this[name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())];
      },
    },
    content = { style, dataset: {}, offsetTop: 80, inert: false },
    states = {
      departureReady: true,
      arrivalStatus: 'ready',
      arrivalReady: true,
      complete: false,
      active: false,
      failed: false,
    },
    effects = {
      embedded: options.embedded && {
        cancel() {},
        invalidate() {},
        land() {},
        refresh() {},
        ...options.embedded,
      },
      cameraView(...args) {
        calls.push({ name: 'cameraView', args });
        return options.view;
      },
    };
  let projection;
  const fragments = {
    begin(context) {
      calls.push({ name: 'begin', context });
      states.active = false;
      states.failed = false;
    },
    prepare(phase, snapshot) {
      calls.push({ name: 'prepare', phase, snapshot });
      states.active =
        !states.failed && (phase === 'depart' ? states.departureReady : states.arrivalReady);
      if (options.stickyFailure && !states.active) states.failed = true;
      return states.active;
    },
    arrivalStatus(snapshot) {
      calls.push({ name: 'arrivalStatus', snapshot });
      return states.arrivalStatus;
    },
    present(progress, snapshot) {
      calls.push({ name: 'present', progress, snapshot });
      return states.active;
    },
    complete() {
      calls.push({ name: 'complete' });
      return states.complete;
    },
    active: () => states.active,
    clear() {
      calls.push({ name: 'clear' });
      states.active = false;
    },
  };
  const presentation = vm.runInNewContext('(' + createPresentation.toString() + ')(content)', {
    content,
    flightPose,
    localStorage: {
      getItem(key) {
        if (options.storageUnavailable) throw new Error('storage unavailable');
        return stored.get(key) ?? null;
      },
      setItem: (key, value) => stored.set(key, value),
    },
    window: {
      scrollY: 640,
      innerHeight: 800,
      SiteEffects: effects,
      CSS: { supports: () => true },
      ...options.window,
    },
    fragmentPlan(input) {
      calls.push({ name: 'plan' });
      projection = input.cameraView;
      return input;
    },
    fragmentDOM(owner, plan) {
      assert.equal(owner, content);
      assert.equal(plan.cameraView, projection);
      calls.push({ name: 'dom' });
      return fragments;
    },
  });
  return {
    presentation,
    content,
    states,
    effects,
    stored,
    calls,
    called: (name) => calls.filter((call) => call.name === name),
    cameraView: (...args) => projection(...args),
  };
}

function paintedSnapshot(overrides = {}) {
  return { painted: true, active: true, progress: 0.12, frameId: 1, ...overrides };
}

function footerFixture({ readyState = 'complete', preference = null } = {}) {
  const documentEvents = {},
    windowEvents = {},
    stored = new Map([['vo.end-scroll', preference]]);
  let queries = 0,
    writes = 0;
  const document = {
    readyState,
    body: { dataset: { page: 'index' } },
    documentElement: { scrollHeight: 2000 },
    createElement(tag) {
      return {
        tag,
        ownerDocument: document,
        children: [],
        events: {},
        hidden: false,
        style: { removeProperty() {} },
        setAttribute(name, value) {
          this[name] = value;
        },
        addEventListener(name, callback) {
          this.events[name] = callback;
        },
        append(node) {
          this.children.push(node);
          node.parent = this;
        },
        remove() {
          this.parent.children = this.parent.children.filter((node) => node !== this);
        },
        querySelector(selector) {
          return this.children.find((node) =>
            selector === 'footer' ? node.tag === 'footer' : node.className === selector.slice(1)
          );
        },
      };
    },
    addEventListener(name, callback) {
      documentEvents[name] = callback;
    },
    getElementById(id) {
      queries++;
      return id === 'site-content' ? live : null;
    },
    querySelector(selector) {
      queries++;
      return selector === '.display-controls' ? controls : null;
    },
  };
  const root = () => {
    const node = document.createElement('div');
    node.append(document.createElement('footer'));
    return node;
  };
  const live = root(),
    controls = document.createElement('div'),
    window = {
      SiteEffects: {},
      SiteNavigation: {
        primaryRoutes: ['index', 'research', 'writing', 'talks', 'credits'],
        go() {},
      },
      addEventListener(name, callback) {
        windowEvents[name] = callback;
      },
    },
    context = {
      document,
      window,
      performance: { now: () => 0 },
      scrollY: 0,
      innerHeight: 800,
      localStorage: {
        getItem: (key) => stored.get(key),
        setItem(key, value) {
          writes++;
          stored.set(key, value);
        },
      },
    };
  vm.runInNewContext(descriptor().controls, context);
  return {
    document,
    documentEvents,
    windowEvents,
    live,
    root,
    controls,
    window,
    stored,
    effects: () => [queries, writes, Object.keys(documentEvents), Object.keys(windowEvents)],
  };
}

test('inert footer preparation shares native route labels, visibility and control preference', () => {
  const fixture = footerFixture(),
    preview = fixture.window.SiteEffects.preparePreview,
    input = fixture.controls.children[0].children[0];
  assert.equal(input['aria-label'], 'Scroll between pages');
  const expected = [
    ['index', 'research', 'Research'],
    ['research', 'writing', 'Writing'],
    ['writing', 'talks', 'Talks'],
    ['talks', 'credits', 'Credits'],
    ['credits', null, null],
  ];
  for (const enabled of [false, true]) {
    input.checked = enabled;
    input.events.change();
    assert.equal(fixture.stored.get('vo.end-scroll'), enabled ? 'on' : 'off');
    for (const [page, route, name] of expected) {
      fixture.document.body.dataset.page = page;
      fixture.windowEvents['site:page-mount']();
      const stage = fixture.root(),
        footer = stage.querySelector('footer'),
        before = fixture.effects(),
        staged = preview(stage, page),
        native = fixture.live.querySelector('footer').querySelector('.scroll-continue');
      assert.deepEqual(fixture.effects(), before, 'preparation cannot add global effects');
      if (!route) {
        assert.equal(staged, null);
        assert.equal(native, undefined);
        assert.equal(footer.children.length, 0);
        continue;
      }
      assert.equal(staged.href, '?view=' + route);
      assert.equal(staged.textContent, 'Keep scrolling for ' + name + ' ↓');
      assert.equal(staged.hidden, !enabled);
      for (const key of ['tag', 'className', 'href', 'textContent', 'hidden'])
        assert.equal(staged[key], native[key], 'staged footer changed native ' + key);
      assert.equal(preview(stage, page), staged, 'repeated preparation must reuse its hint');
      assert.equal(footer.children.length, 1);
      assert.deepEqual(staged.events, {});
    }
  }
});

test('serialized preview is available before DOMReady and confines changes to its supplied root', () => {
  const fixture = footerFixture({ readyState: 'loading', preference: 'off' }),
    stage = fixture.root(),
    before = fixture.effects(),
    preview = fixture.window.SiteEffects.preparePreview;
  const hint = preview(stage, 'research');
  assert.equal(hint.textContent, 'Keep scrolling for Writing ↓');
  assert.equal(hint.hidden, true);
  assert.deepEqual(fixture.effects(), before);
  assert.equal(fixture.live.querySelector('footer').children.length, 0);
  assert.equal(preview(stage, 'credits'), null);
  assert.equal(stage.querySelector('footer').children.length, 0);
  assert.equal(preview(null, 'index'), null);
  assert.equal(prepareEndScrollFooter(stage, 'index', null, true), null);
  assert.equal(preview(stage, 'invalid'), null);
});

test('solid preview remains default, while unavailable scenes use native fade without DOM capture', () => {
  for (const storageUnavailable of [false, true]) {
    const fixture = presentationFixture({ storageUnavailable });
    assert.equal(fixture.presentation.fragmentPreview(), true);
    fixture.presentation.begin(true, { from: 'index', to: 'research', direction: 'forward' });
    fixture.presentation.present(0.12, 'forward', undefined, paintedSnapshot());
    assert.equal(fixture.called('dom').length, 0);
    assert.equal(fixture.called('prepare').length, 0);
    assert.equal(fixture.content.dataset.flightMode, 'fade');
    assert.ok(Number(fixture.content.style.opacity) > 0);
    assert.ok(Number(fixture.content.style.opacity) < 1);
  }
  for (const preferences of [{ 'vo.fragment-preview': 'off' }, { 'vo.content-flight': 'off' }]) {
    let acquisitions = 0;
    const fixture = presentationFixture({
      preferences,
      embedded: { begin: () => ++acquisitions },
    });
    fixture.presentation.begin(true);
    assert.equal(acquisitions, 0);
    assert.equal(fixture.called('dom').length, 0);
  }
  let acquisitions = 0;
  const inactive = presentationFixture({ embedded: { begin: () => ++acquisitions } });
  inactive.presentation.begin(false);
  assert.equal(acquisitions, 0);
  const optedOut = presentationFixture({ preferences: { 'vo.fragment-preview': 'off' } });
  optedOut.presentation.fragmentPreview(true);
  assert.equal(optedOut.stored.get('vo.fragment-preview'), 'on');
  optedOut.presentation.begin(true);
  assert.equal(optedOut.called('dom').length, 0);
});

test('world preparation shares landing context, stages intermediate rooms and respects Off', async () => {
  const calls = [];
  const embedded = {
    async prime(data, top, landing, options) {
      calls.push({ name: 'prime', page: data.page, top, landing, signal: options.signal });
    },
    async prepareDeparture(owner, options) {
      calls.push({ name: 'depart', owner, signal: options.signal });
    },
  };
  const fixture = presentationFixture({ embedded });
  const controller = new AbortController();
  for (const [from, to] of [
    ['index', 'research'],
    ['research', 'index'],
  ]) {
    const landing = { position: [0, 780] };
    await fixture.presentation.prepareTransition(
      { page: to },
      { from, to, landing },
      controller.signal
    );
    assert.equal(calls.at(-2).landing, landing);
    assert.equal(calls.at(-2).page, to);
    assert.equal(calls.at(-1).owner, fixture.content);
    assert.equal(calls.at(-1).signal, controller.signal);
  }
  const count = calls.length;
  await fixture.presentation.prepareTransition(
    { page: 'writing' },
    { from: 'index', to: 'writing', corridor: [{ page: 'research' }] }
  );
  assert.deepEqual(
    calls.slice(count).map(({ name, page }) => [name, page]),
    [
      ['prime', 'research'],
      ['prime', 'writing'],
      ['depart', undefined],
    ]
  );
  const preparedCount = calls.length;
  const disabled = presentationFixture({ embedded, preferences: { 'vo.fragment-preview': 'off' } });
  await disabled.presentation.prepareTransition(
    { page: 'research' },
    { from: 'index', to: 'research' }
  );
  assert.equal(calls.length, preparedCount);
  controller.abort();
  await fixture.presentation.prepareTransition(
    { page: 'research' },
    { from: 'index', to: 'research' },
    controller.signal
  );
  assert.equal(calls.at(-1).name, 'prime', 'an aborted preparation cannot acquire outgoing paint');
});

test('next-page warming prepares the settled source only after a ready, uncancelled destination', async () => {
  const calls = [];
  let resolve;
  const embedded = {
    prime(data, top, landing, options) {
      calls.push({ name: 'prime', data, top, landing, signal: options.signal });
      return new Promise((done) => {
        resolve = done;
      });
    },
    async prepareDeparture(owner, options) {
      calls.push({ name: 'depart', owner, signal: options.signal, cacheOnly: options.cacheOnly });
    },
  };
  const fixture = presentationFixture({ embedded });
  const controller = new AbortController();
  const data = { page: 'research' };
  const warm = fixture.presentation.prepareNext(data, controller.signal);
  assert.deepEqual(
    calls.map(({ name }) => name),
    ['prime']
  );
  assert.equal(calls[0].data, data);
  assert.equal(calls[0].top, fixture.content.offsetTop);
  assert.equal(calls[0].landing, null);
  resolve(true);
  await warm;
  assert.equal(calls.at(-1).owner, fixture.content);
  assert.equal(calls.at(-1).signal, controller.signal);
  assert.equal(calls.at(-1).cacheOnly, true);

  const failed = fixture.presentation.prepareNext(data, controller.signal);
  resolve(false);
  await failed;
  assert.equal(calls.at(-1).name, 'prime', 'failed destination capture cannot prewarm its source');
  const aborted = fixture.presentation.prepareNext(data, controller.signal);
  controller.abort();
  resolve(true);
  await aborted;
  assert.equal(calls.at(-1).name, 'prime', 'cancelled warming cannot capture a stale source');
  const count = calls.length;
  const disabled = presentationFixture({ embedded, preferences: { 'vo.fragment-preview': 'off' } });
  await disabled.presentation.prepareNext(data);
  assert.equal(calls.length, count);
});

test('speculative capture waits for startup idle and navigation cancels its queued work', async () => {
  const calls = [];
  const tasks = new Map();
  let serial = 0;
  const fixture = presentationFixture({
    window: {
      requestIdleCallback(callback) {
        tasks.set(++serial, callback);
        return serial;
      },
      cancelIdleCallback: (ticket) => tasks.delete(ticket),
    },
    embedded: {
      async prime(data) {
        calls.push(data.page);
        return true;
      },
      async prepareDeparture() {
        calls.push('departure');
      },
    },
  });
  const controller = new AbortController();
  const stale = fixture.presentation.prepareNext({ page: 'research' }, controller.signal);
  assert.deepEqual(calls, []);
  assert.equal(tasks.size, 1);
  controller.abort();
  await stale;
  assert.equal(tasks.size, 0);
  assert.deepEqual(calls, [], 'cancelled warm-up never captures or hides content');
  const fresh = fixture.presentation.prepareNext({ page: 'writing' });
  tasks.values().next().value();
  await fresh;
  assert.deepEqual(calls, ['writing', 'departure']);
  assert.equal(tasks.size, 0);
});

test('solid-owned native handoff stays at native opacity and transform while Canvas assembles', () => {
  const samples = [];
  const embedded = {
    begin: () => true,
    present: (progress, snapshot) => samples.push({ progress, snapshot }),
    active: () => true,
    complete: () => false,
  };
  const fixture = presentationFixture({ embedded });
  fixture.presentation.begin(true, { from: 'research', to: 'index', direction: 'backward' });
  fixture.states.departureReady = false;
  fixture.presentation.present(0.3, 'backward', undefined, paintedSnapshot());
  assert.equal(fixture.content.style.opacity, '1');
  assert.equal(fixture.content.style.transform, 'none');
  assert.equal(samples.at(-1).snapshot.direction, 'backward');
  assert.equal(samples.at(-1).progress, 0.3);
});

test('page-owned solids preserve their native crossfade and avoid a second DOM replay', () => {
  let opacity = 0;
  let complete = false;
  const embedded = {
    begin: () => true,
    land() {},
    present() {},
    active: () => true,
    nativeOpacity: () => opacity,
    complete: () => complete,
    cancel() {},
  };
  const fixture = presentationFixture({ embedded });
  fixture.presentation.begin(true, { from: 'index', to: 'writing' });
  fixture.presentation.prepareMount();
  fixture.presentation.mounted();
  for (const amount of [0, 0.25, 0.75]) {
    opacity = amount;
    assert.equal(fixture.presentation.present(1, 'forward', undefined, paintedSnapshot()), false);
    assert.equal(fixture.content.style.opacity, String(amount));
    assert.equal(fixture.content.style.transform, 'none');
  }
  assert.equal(fixture.called('dom').length, 0);
  complete = true;
  opacity = 1;
  assert.equal(fixture.presentation.present(1, 'forward', undefined, paintedSnapshot()), true);
});

test('native fallback locks the original route direction during retargeted caller updates', () => {
  for (const direction of ['forward', 'backward']) {
    const fixture = presentationFixture(),
      context = { from: 'writing', to: 'research', direction };
    fixture.presentation.begin(true, context);
    context.direction = direction === 'forward' ? 'backward' : 'forward';
    fixture.presentation.present(0.3, context.direction, undefined, paintedSnapshot());
    assert.equal(
      Math.sign(Number(fixture.content.dataset.flightDepth)),
      direction === 'forward' ? 1 : -1
    );
    assert.equal(fixture.content.dataset.flightMode, 'fade');
    assert.equal(fixture.called('dom').length, 0);
  }
});

test('rejected world admission retains the native plane on both legs and never reacquires DOM paint', () => {
  let attempts = 0,
    mounts = 0;
  const fixture = presentationFixture({
    embedded: {
      begin() {
        attempts++;
        return false;
      },
      land() {
        mounts++;
      },
      active: () => false,
    },
  });
  fixture.presentation.begin(true, { from: 'index', to: 'research', direction: 'forward' });
  fixture.presentation.present(0.2, 'forward', undefined, paintedSnapshot());
  assert.equal(fixture.content.dataset.flightStage, 'depart');
  assert.ok(Number(fixture.content.style.opacity) > 0);
  assert.ok(Number(fixture.content.style.opacity) < 1);
  fixture.presentation.prepareMount();
  fixture.presentation.mounted();
  assert.equal(fixture.content.style.opacity, '0');
  fixture.presentation.present(0.7, 'forward', undefined, paintedSnapshot({ progress: 0.7 }));
  assert.equal(fixture.content.dataset.flightStage, 'arrive');
  assert.ok(Number(fixture.content.style.opacity) > 0);
  assert.ok(Number(fixture.content.style.opacity) < 1);
  fixture.presentation.present(1, 'forward', undefined, paintedSnapshot({ progress: 1 }));
  assert.equal(fixture.content.style.opacity, '1');
  assert.equal(attempts, 1);
  assert.equal(mounts, 0);
  assert.equal(fixture.called('dom').length, 0);
  assert.equal(fixture.called('prepare').length, 0);
});

test('a failed solid landing resumes native fade without a second capture or shard controller', () => {
  let active = true,
    attempts = 0,
    mounts = 0;
  const fixture = presentationFixture({
    embedded: {
      begin() {
        attempts++;
        return true;
      },
      land() {
        mounts++;
        active = false;
      },
      active: () => active,
    },
  });
  fixture.presentation.begin(true, { from: 'index', to: 'research' });
  assert.equal(fixture.content.dataset.flightMode, 'solids');
  fixture.presentation.prepareMount();
  fixture.presentation.mounted();
  fixture.presentation.present(0.7, 'forward', undefined, paintedSnapshot({ progress: 0.7 }));
  assert.equal(fixture.content.dataset.flightMode, 'fade');
  assert.ok(Number(fixture.content.style.opacity) > 0 && Number(fixture.content.style.opacity) < 1);
  assert.equal(attempts, 1);
  assert.equal(mounts, 1);
  assert.equal(fixture.called('dom').length, 0);
});

test('solid readiness owns the terminal handoff while fallback settles at the camera endpoint', () => {
  let active = true,
    complete = false;
  const fixture = presentationFixture({
    embedded: {
      begin: () => true,
      active: () => active,
      complete: () => complete,
      nativeOpacity: () => (complete ? 1 : 0),
    },
  });
  fixture.presentation.begin(true, { direction: 'backward' });
  assert.equal(
    fixture.presentation.present(1, 'forward', undefined, paintedSnapshot({ progress: 1 })),
    false
  );
  assert.equal(fixture.content.style.opacity, '0');
  complete = true;
  assert.equal(
    fixture.presentation.present(1, 'forward', undefined, paintedSnapshot({ progress: 1 })),
    true
  );
  assert.equal(fixture.content.style.opacity, '1');
  active = false;
  fixture.presentation.present(1, 'backward', undefined, paintedSnapshot({ active: false }));
  assert.equal(fixture.content.style.opacity, '1');
  assert.equal(fixture.content.dataset.flightDepth, '0');
  assert.equal(fixture.content.dataset.flightStage, 'settled');
  assert.equal(fixture.called('dom').length, 0);
});

test('cancelled camera travel restores the native endpoint and clears presentation state', () => {
  let invalidations = 0;
  const fixture = presentationFixture({
    embedded: {
      begin: () => true,
      active: () => true,
      invalidate() {
        invalidations++;
      },
    },
  });
  fixture.presentation.begin(true, { direction: 'forward' });
  fixture.presentation.present(0.12, 'forward', undefined, paintedSnapshot());
  fixture.presentation.prepareMount();
  fixture.presentation.mounted();
  fixture.presentation.present(1, 'forward', undefined, paintedSnapshot({ active: false }));
  assert.equal(invalidations, 1);
  assert.equal(fixture.content.style.opacity, '1');
  assert.equal(fixture.content.dataset.flightMode, 'fade');
  fixture.presentation.clear();
  assert.equal(fixture.content.dataset.flightStage, undefined);
  assert.equal(fixture.content.dataset.flightDepth, undefined);
  assert.equal(fixture.content.dataset.flightMode, undefined);
  assert.equal(fixture.content.style.transformOrigin, undefined);
  assert.equal(fixture.called('dom').length, 0);
});

test('disabling either flight control releases solid ownership and keeps fallback free of shards', () => {
  for (const control of ['contentFlight', 'fragmentPreview']) {
    let invalidations = 0;
    const fixture = presentationFixture({
      embedded: {
        begin: () => true,
        active: () => true,
        invalidate() {
          invalidations++;
        },
      },
    });
    fixture.presentation.begin(true, { direction: 'forward' });
    fixture.presentation.present(0.12, 'forward', undefined, paintedSnapshot());
    fixture.presentation[control](false);
    assert.equal(invalidations, 1);
    fixture.presentation.present(1, 'forward', undefined, paintedSnapshot());
    assert.equal(fixture.content.style.opacity, '1');
    assert.equal(fixture.content.dataset.flightMode, 'fade');
    if (control === 'contentFlight') assert.equal(fixture.content.style.transform, undefined);
    assert.equal(fixture.called('dom').length, 0);
    assert.equal(fixture.called('prepare').length, 0);
  }
});

test('forward passes the current page toward the viewer; reverse sends it into distance', () => {
  for (const direction of ['forward', 'backward']) {
    for (let i = 0; i <= 100; i++) {
      const p = flightPose(i / 100, direction);
      assert.ok(Number.isFinite(p.z) && p.z < 1200);
      assert.ok(p.opacity >= 0 && p.opacity <= 1);
    }
    const a = flightPose(0.1, direction),
      b = flightPose(0.3, direction),
      entry = flightPose(0.65, direction);
    assert.equal(Math.sign(b.z - a.z), direction === 'forward' ? 1 : -1);
    assert.equal(Math.sign(entry.z), direction === 'forward' ? -1 : 1);
    assert.ok(entry.opacity > 0 && entry.opacity < 1, 'fog accompanies spatial approach');
    assert.deepEqual(flightPose(1, direction), { stage: 'settled', z: 0, opacity: 1 });
    assert.equal(flightPose(0.49, direction).opacity, 0);
    assert.equal(
      flightPose(0.5, direction).opacity,
      0,
      'mount while the old/new plane is outside view'
    );
  }
});
test('retargeting preserves the actual displayed plane instead of flashing it at full size', () => {
  for (const direction of ['forward', 'backward'])
    for (const progress of [0.08, 0.31, 0.65, 0.89]) {
      const displayed = flightPose(progress, direction),
        retarget = flightPose(0, direction === 'forward' ? 'backward' : 'forward', displayed);
      assert.equal(retarget.z, displayed.z);
      assert.equal(retarget.opacity, displayed.opacity);
    }
});
test('bottom detection uses the real rounded range and tolerates native overscroll', () => {
  assert.equal(atPageEnd(7197, 8000, 800), false);
  assert.equal(atPageEnd(7199.25, 8000, 800), true);
  assert.equal(atPageEnd(7280, 8000, 800), true);
  assert.equal(atPageEnd(-70, 8000, 800), false);
  assert.equal(atPageEnd(0, 700, 800), true);
});
test('wheel inertia reaching the bottom does not navigate; a fresh additional gesture does', () => {
  const g = endScrollGate();
  g.reset(0);
  g.offer({ bottom: false, now: 1000, type: 'wheel', delta: 200 });
  g.boundary(true, 1200);
  for (const [now, delta] of [
    [1250, 120],
    [1320, 90],
    [1400, 60],
    [1480, 30],
  ])
    assert.equal(g.offer({ bottom: true, now, type: 'wheel', delta }), false);
  assert.equal(g.offer({ bottom: true, now: 1800, type: 'wheel', delta: 80 }), false);
  assert.equal(g.progress(), 0.5);
  assert.equal(g.offer({ bottom: true, now: 1880, type: 'wheel', delta: 80 }), true);
  assert.equal(
    g.offer({ bottom: true, now: 2400, type: 'wheel', delta: 1000 }),
    false,
    'cooldown stops chained route skips'
  );
});
test('leaving the bottom or reversing input clears accumulated continuation intent', () => {
  const g = endScrollGate();
  g.reset();
  g.boundary(true, 1000);
  assert.equal(g.offer({ bottom: true, now: 1300, type: 'wheel', delta: 80 }), false);
  g.boundary(false, 1350);
  assert.equal(g.progress(), 0);
  g.boundary(true, 1600);
  assert.equal(g.offer({ bottom: true, now: 1900, type: 'wheel', delta: 80 }), false);
  assert.equal(g.offer({ bottom: true, now: 1940, type: 'wheel', delta: -30 }), false);
  assert.equal(g.progress(), 0);
  assert.equal(g.offer({ bottom: true, now: 1980, type: 'wheel', delta: 160 }), false);
});
test('touch and keyboard require explicit continuation intent and work on short pages', () => {
  for (const type of ['touch', 'key']) {
    const g = endScrollGate();
    g.reset();
    g.boundary(true, 0);
    assert.equal(g.offer({ bottom: true, now: 500, type, delta: 1000, deliberate: true }), false);
    assert.equal(g.offer({ bottom: true, now: 1000, type, delta: 1000, deliberate: false }), false);
    assert.equal(g.offer({ bottom: true, now: 1100, type, delta: 1000, deliberate: true }), true);
  }
});
test('top overscroll and fractional rounding use the same native edge tolerance', () => {
  assert.equal(atPageStart(-70), true);
  assert.equal(atPageStart(1.75), true);
  assert.equal(atPageStart(3), false);
});
test('reverse wheel continuation requires a fresh gesture after reaching the top', () => {
  const g = endScrollGate();
  g.offer({ top: false, bottom: false, now: 1000, type: 'wheel', delta: -200 });
  g.boundary(false, 1200, true);
  for (const [now, delta] of [
    [1250, -120],
    [1320, -90],
    [1400, -60],
    [1480, -30],
  ])
    assert.equal(g.offer({ top: true, bottom: false, now, type: 'wheel', delta }), false);
  assert.equal(g.offer({ top: true, bottom: false, now: 1800, type: 'wheel', delta: -80 }), false);
  assert.equal(g.progress(), 0.5);
  assert.equal(g.offer({ top: true, bottom: false, now: 1880, type: 'wheel', delta: -80 }), true);
  g.reset(1900);
  assert.equal(
    g.offer({ top: true, bottom: false, now: 2750, type: 'key', delta: -160, deliberate: true }),
    false,
    'route reset retains the accepted-input cooldown'
  );
});
test('short-page reversal clears the other direction, and reverse key/touch are deliberate', () => {
  const g = endScrollGate();
  g.boundary(true, 1000, true);
  assert.equal(g.offer({ top: true, bottom: true, now: 1300, type: 'wheel', delta: 80 }), false);
  assert.equal(g.offer({ top: true, bottom: true, now: 1340, type: 'wheel', delta: -80 }), false);
  assert.equal(g.progress(), 0);
  assert.equal(g.offer({ top: true, bottom: true, now: 1600, type: 'wheel', delta: -80 }), false);
  assert.equal(g.progress(), 0.5);
  for (const type of ['key', 'touch']) {
    const gate = endScrollGate();
    gate.boundary(false, 0, true);
    assert.equal(
      gate.offer({ top: true, bottom: false, now: 1000, type, delta: -1000, deliberate: false }),
      false
    );
    assert.equal(
      gate.offer({ top: true, bottom: false, now: 1100, type, delta: -1000, deliberate: true }),
      true
    );
  }
});
test('optional exporter compiles, keeps one scheduler and changes both embedded engine identities', () => {
  const { standalone } = require('../tools/site/export.cjs'),
    ribbons = { decorate: require('../tools/site/effects.cjs').decorateRibbons };
  const source = standalone(
    fs.readFileSync(
      require('node:path').join(__dirname, '../review/site-v1-20261004-v11-interactive.html'),
      'utf8'
    )
  );
  const previous = ribbons.decorate(source),
    output = decorate(previous),
    hash = output.match(/name="site-engine" content="([a-f0-9]{64})"/)[1];
  const createPresentation = require('../site/effects/flight.cjs').createPresentation;
  for (const supports of [undefined, () => false, () => true]) {
    assert.equal(
      vm.runInNewContext('(' + createPresentation.toString() + ')({}).canTravel()', {
        window: { CSS: { supports } },
      }),
      supports?.() === true,
      'missing capability cannot become the scene API default On'
    );
  }
  assert.notEqual(hash, previous.match(/name="site-engine" content="([a-f0-9]{64})"/)[1]);
  const payload = JSON.parse(
    output.match(/<script type="application\/json" id="site-pages">([\s\S]*?)<\/script>/)[1]
  );
  assert.equal(payload.revision.engine, hash);
  for (const page of Object.values(payload.pages))
    assert.ok(page.includes('name="site-engine" content="' + hash + '"'));
  for (const script of output.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))
    if (!script[1].includes('application/')) new vm.Script(script[2]);
  assert.equal(
    (output.match(/requestAnimationFrame/g) || []).length,
    (previous.match(/requestAnimationFrame/g) || []).length
  );
  assert.match(output, /\bpassive\s*:\s*true\b/);
  assert.match(output, /overflow\s*:\s*clip/);
  assert.match(
    output,
    /\bfinally\s*\{\s*if\s*\(\s*transform\s*\)\s*plane\.style\.transform\s*=\s*transform\b/
  );
  assert.throws(() => decorate(output), /duplicate offline travel/);
  let reformatted = source;
  for (const name of ['measure', 'flight']) {
    const declaration = new RegExp('(\\bfunction\\s+' + name + '\\s*\\([^)]*\\))\\s*\\{');
    assert.match(reformatted, declaration, name + ' declaration must be exercised');
    const next = reformatted.replace(declaration, '$1\n  {');
    assert.notEqual(next, reformatted, name + ' probe must actually change declaration whitespace');
    reformatted = next;
  }
  assert.doesNotThrow(
    () => decorate(ribbons.decorate(reformatted)),
    'authored runtime formatting is not the extension boundary'
  );
  assert.throws(
    () =>
      decorate(
        source.replaceAll(
          'name="site-effects-contract" content="1"',
          'name="site-effects-contract" content="2"'
        )
      ),
    /compatible authored/
  );
});
