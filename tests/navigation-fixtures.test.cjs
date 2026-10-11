'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const {
  archiveHistoryReady,
  historyPositionReady,
  historyPositionSample,
  nativeScrollSettlement,
  beginInterruption,
  checkTiming,
  timingProbe,
} = require('../tools/quality/navigation.cjs');
test('same-document archive history waits for URL, popstate controls and finished route mounting', async () => {
  const state = {
    location: { href: 'https://owned.invalid/writing.html?topic=systems&language=uk' },
    values: { topic: 'systems', language: 'uk' },
    busy: false,
  };
  const document = {
    body: { dataset: { page: 'writing' } },
    querySelector: () => ({ hasAttribute: () => state.busy }),
    getElementById: (id) => ({ value: state.values[id.slice('archive-'.length)] }),
  };
  let predicate,
    expected,
    release,
    finished = false;
  const page = {
    waitForFunction(fn, arg, options) {
      predicate = fn;
      expected = arg;
      assert.deepEqual(options, { polling: 40, timeout: 6000 });
      return new Promise((resolve) => (release = resolve));
    },
  };
  const url = 'https://owned.invalid/writing.html?topic=systems';
  const pending = archiveHistoryReady(page, url, { topic: 'systems', language: 'all' }).then(
    () => (finished = true)
  );
  const restored = () =>
    vm.runInNewContext('(' + predicate.toString() + ')(expected)', {
      location: state.location,
      document,
      expected,
    });
  assert.equal(restored(), false);
  state.location.href = url;
  assert.equal(restored(), false, 'URL acknowledgement alone is not restored filtering');
  state.values.language = 'all';
  state.busy = true;
  assert.equal(restored(), false, 'matching controls during a route mount are not ready');
  await Promise.resolve();
  assert.equal(finished, false);
  state.busy = false;
  assert.equal(restored(), true);
  release();
  await pending;
  assert.equal(finished, true);
  await assert.rejects(
    () =>
      archiveHistoryReady(
        {
          waitForFunction: async () => {
            throw Error('Controlled popstate deadline');
          },
        },
        url,
        { language: 'all' }
      ),
    /popstate deadline/,
    'unrestored history remains a failure'
  );
});
function scrolling(position) {
  let time = 0;
  const timers = [];
  const context = {
    window: {},
    performance: { now: () => time },
    document: { documentElement: { scrollHeight: 10000 } },
    innerHeight: 844,
    setTimeout(fn, delay) {
      assert.equal(delay, 50);
      timers.push({ fn, time: time + delay });
    },
  };
  Object.defineProperty(context, 'scrollY', { get: () => position(time) });
  const pending = vm.runInNewContext('(' + nativeScrollSettlement.toString() + ')()', context);
  return {
    pending,
    advance() {
      const timer = timers.shift();
      assert.ok(timer);
      time = timer.time;
      timer.fn();
    },
    timers,
    time: () => time,
    evidence: () => context.window.__wheelSettlement,
  };
}
test('endpoint takeover begins after the complete native wheel, retaining a strict stall deadline', async () => {
  const moving = scrolling((time) => (time < 100 ? 8557 : 8399));
  let complete = false;
  moving.pending.then(() => (complete = true));
  moving.advance();
  await Promise.resolve();
  assert.equal(
    complete,
    false,
    'one early wheel position cannot serve as the footer-growth baseline'
  );
  while (moving.timers.length) moving.advance();
  const result = await moving.pending;
  assert.equal(result.y, 8399);
  assert.equal(result.elapsedMs, 250);
  assert.equal(result.quietMs, 150);
  assert.ok(result.samples.some((sample) => sample.y === 8557));
  const stalled = scrolling((time) => 9000 - time),
    rejected = assert.rejects(stalled.pending, /did not settle within 2000ms/);
  while (stalled.timers.length) stalled.advance();
  await rejected;
  assert.equal(stalled.time(), 2000);
  const evidence = stalled.evidence();
  assert.equal(evidence.status, 'failed');
  assert.match(evidence.error, /did not settle within 2000ms/);
  assert.equal(evidence.elapsedMs, 2000);
  assert.equal(evidence.timeoutMs, 2000);
  assert.equal(evidence.samples.length, 41);
  assert.equal(evidence.samples[0].y, 9000);
  assert.equal(evidence.samples.at(-1).y, 7000);
  assert.equal(evidence.samples.at(-1).time, 2000);
  assert.equal(
    evidence.max,
    9156,
    'failed native observations remain available to the scenario report'
  );
});
function interruption({ animated, skipFlight = false } = {}) {
  const listeners = new Map(),
    events = [],
    scene = { dataset: { travel: 'settled', progress: '0' } },
    attrs = { href: 'writing.html' };
  let observer,
    disconnected = 0,
    buttonClicks = 0;
  const document = {
    hidden: false,
    body: { dataset: { page: 'talks' } },
    dispatchEvent: (event) => events.push(event.type),
  };
  function emit(name) {
    for (const fn of [...(listeners.get(name) || [])]) fn();
  }
  const window = {
    SiteScene: { canTravel: () => animated },
    SiteEffects: { navigation() {} },
    CSS: { supports: () => true },
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
    },
    removeEventListener(name, fn) {
      listeners.get(name)?.delete(fn);
    },
    dispatchEvent: (event) => events.push(event.type),
  };
  const link = {
    getAttribute: (name) => attrs[name],
    setAttribute: (name, value) => (attrs[name] = value),
    click() {
      if (animated && !skipFlight) {
        scene.dataset.travel = 'flying';
        scene.dataset.progress = '.12';
        observer.callback();
      }
      document.body.dataset.page = 'writing';
      scene.dataset.travel = 'settled';
      scene.dataset.progress = '1';
      emit('site:page-ready');
    },
  };
  document.querySelector = (selector) =>
    selector === '.space-scene'
      ? scene
      : selector === '#space-motion'
        ? {
            click() {
              buttonClicks++;
            },
          }
        : link;
  const context = {
    document,
    window,
    Event: class Event {
      constructor(type) {
        this.type = type;
      }
    },
    MutationObserver: class MutationObserver {
      constructor(callback) {
        this.callback = callback;
        observer = this;
      }
      observe() {}
      disconnect() {
        disconnected++;
      }
    },
  };
  const begin = vm.runInNewContext('(' + beginInterruption.toString() + ')', context);
  return {
    begin,
    window,
    document,
    events,
    attrs,
    repeat() {
      observer?.callback();
      emit('site:page-ready');
    },
    disconnected: () => disconnected,
    buttonClicks: () => buttonClicks,
  };
}
test('print/off/hidden fixtures execute exactly once on recorded animated or instant paths', () => {
  for (const animated of [false, true])
    for (const kind of ['print', 'off', 'hidden']) {
      const h = interruption({ animated });
      h.begin(kind);
      const probe = h.window.__interruption;
      assert.equal(probe.triggered, true);
      assert.equal(probe.expected, animated ? 'animated' : 'instant');
      assert.equal(probe.trigger, animated ? 'flight' : 'instant-arrival');
      assert.equal(probe.progress, animated ? 0.12 : 1);
      assert.equal(h.attrs.href, 'writing.html');
      h.repeat();
      assert.equal(
        h.events.filter((name) => name === 'beforeprint').length,
        kind === 'print' ? 1 : 0
      );
      assert.equal(
        h.events.filter((name) => name === 'visibilitychange').length,
        kind === 'hidden' ? 1 : 0
      );
      assert.equal(h.buttonClicks(), kind === 'off' ? 1 : 0);
      if (animated) assert.equal(h.disconnected(), 1);
    }
});
test('a declared animated interruption without a flight never fabricates a print pass', () => {
  const h = interruption({ animated: true, skipFlight: true });
  h.begin('print');
  assert.equal(h.window.__interruption.triggered, false);
  assert.equal(h.window.__interruption.missedArrival, true);
  assert.deepEqual(h.events, []);
  assert.equal(h.disconnected(), 1);
});
function blockSamples(direction = 'forward') {
  function unit(stage, y, row, peer = 0) {
    const plan = require('../tools/quality/transition-pacing.cjs').rowPlan(1440, 2);
    const order = direction === 'forward' ? row : 1 - row,
      translate = '0px ' + y + 'px',
      layer = {
        translate,
        opacity: 1,
        animation: {
          name: 'route-block-' + (stage === 'departing' ? 'depart' : 'arrive'),
          delay: order * plan.rowStepMs,
          duration: plan.rowDurationMs,
        },
      };
    return {
      stage,
      direction,
      row,
      order,
      top: row === 0 ? 100 + peer * 8 : 350,
      bottom: row === 0 ? 200 + peer * 30 : 450,
      borderOwner: row === 1 ? '2' : null,
      opacity: 1,
      ink: [translate],
      paper: translate,
      layers: [
        structuredClone(layer),
        structuredClone(layer),
        ...(row === 1
          ? [
              {
                ...structuredClone(layer),
                separator: 'bottom',
                separatorSource: 'unit',
                borderOwner: '2',
                separatorPaint: { width: 1, length: 300, style: 'solid', color: 'rgb(20, 30, 40)' },
              },
            ]
          : []),
      ],
    };
  }
  const units = (stage, y) => [unit(stage, y, 0), unit(stage, y, 0, 1), unit(stage, y, 1)];
  const sign = direction === 'forward' ? 1 : -1;
  return [
    {
      stage: 'departing',
      cameraStage: 'settled',
      framing: 0,
      units: units('departing', -20 * sign),
    },
    {
      stage: 'departing',
      cameraStage: 'settled',
      framing: 0,
      units: units('departing', -200 * sign),
    },
    { stage: 'holding', cameraStage: 'center', framing: 0.4, units: [] },
    { stage: 'holding', cameraStage: 'transit', framing: 1, units: [] },
    { kind: 'mount', stage: 'holding', cameraStage: 'transit', framing: 1, units: [] },
    { stage: 'holding', cameraStage: 'restore', framing: 0.4, units: [] },
    {
      stage: 'arriving',
      cameraStage: 'settled',
      framing: 0,
      units: units('arriving', 200 * sign),
    },
    { stage: 'arriving', cameraStage: 'settled', framing: 0, units: units('arriving', 20 * sign) },
  ].map((sample, i) => ({
    kind: 'progress',
    progress: i / 8,
    opacity: 1,
    viewportWidth: 1440,
    transform: 'none',
    borderSources:
      sample.stage === 'departing' || sample.stage === 'arriving'
        ? [{ sides: [{ owner: '2', side: 'bottom', color: 'rgba(0, 0, 0, 0)' }] }]
        : [],
    ...sample,
  }));
}
test('block navigation requires directional departure, centered flight, restored framing and arrival', () => {
  for (const direction of ['forward', 'backward']) checkTiming(blockSamples(direction), 'color');
  const invalid = [
    (samples) => (samples[0].opacity = 0.5),
    (samples) => (samples[0].transform = 'matrix(1,0,0,1,0,10)'),
    (samples) => (samples[3].framing = 0.8),
    (samples) => (samples[3].stage = 'arriving'),
    (samples) => (samples[6].cameraStage = 'restore'),
    (samples) => (samples[6].framing = 0.2),
    (samples) => (samples[0].units[0].ink = ['0px 20px']),
    (samples) => (samples[6].units[0].paper = '0px -20px'),
    (samples) => samples.splice(2, 0, { ...samples[6] }),
    (samples) => samples.splice(6, 0, { ...samples[0] }),
    (samples) => samples.splice(2, 1),
    (samples) => samples.splice(4, 1),
    (samples) => samples.push({ ...samples[4] }),
    (samples) => (samples[4].stage = 'arriving'),
    (samples) =>
      samples.splice(0, samples.length, ...samples.filter((sample) => sample.stage !== 'arriving')),
  ];
  for (const mutate of invalid) {
    const samples = blockSamples();
    mutate(samples);
    assert.throws(() => checkTiming(samples, 'color'));
  }
});
test('native row timing rejects reversed order, serial or wrong waves and separators that disappear or stay still', () => {
  const invalid = [
    (samples) => (samples[0].units[0].order = 1),
    (samples) => (samples[0].units[2].top = 50),
    (samples) => {
      for (const unit of samples[0].units) {
        unit.row = 0;
        unit.order = 0;
        for (const layer of unit.layers) layer.animation.delay = 0;
      }
    },
    (samples) => {
      for (const layer of samples[0].units[2].layers) layer.animation.delay = 150;
    },
    (samples) => {
      for (const unit of samples[0].units)
        for (const layer of unit.layers)
          layer.animation.delay = unit.order * layer.animation.duration;
    },
    (samples) => {
      for (const layer of samples[0].units[1].layers) layer.animation.delay = 10;
    },
    (samples) => samples[0].units[2].layers.pop(),
    (samples) => (samples[6].units[2].layers.at(-1).translate = 'none'),
    (samples) => (samples[6].units[2].layers.at(-1).animation.name = 'none'),
    (samples) =>
      samples[0].borderSources.push({
        sides: [{ owner: '2', side: 'bottom', color: 'rgba(0, 0, 0, 0)' }],
      }),
    (samples) => (samples[0].units[2].layers.at(-1).separatorPaint.color = 'rgba(0, 0, 0, 0)'),
    (samples) => (samples[0].units[2].layers.at(-1).separatorPaint.length = 0),
    (samples) => (samples[0].borderSources[0].sides[0].color = 'rgb(20, 30, 40)'),
  ];
  for (const mutate of invalid) {
    const samples = blockSamples();
    mutate(samples);
    assert.throws(() => checkTiming(samples));
  }
  for (const phase of [0, 6]) {
    const samples = blockSamples('backward');
    for (const unit of samples[phase].units) {
      unit.order = unit.row;
      for (const layer of unit.layers) layer.animation.delay = unit.row * layer.animation.duration;
    }
    assert.throws(() => checkTiming(samples), /motion order follows route direction/);
  }
});

function fractionalBlockSamples(rows, direction, serialize) {
  const samples = blockSamples(direction);
  const plan = require('../tools/quality/transition-pacing.cjs').rowPlan(1440, rows);
  for (const sample of samples) {
    if (!sample.units.length) continue;
    const first = sample.units[0];
    const last = sample.units[2];
    sample.units = Array.from({ length: rows }, (_, row) => {
      const unit = structuredClone(row === rows - 1 ? last : first);
      unit.row = row;
      unit.order = direction === 'backward' ? rows - 1 - row : row;
      unit.top = 100 + row * 30;
      unit.bottom = unit.top + 20;
      for (const layer of unit.layers) {
        layer.animation.delay = serialize(unit.order * plan.rowStepMs);
        layer.animation.duration = plan.rowDurationMs;
      }
      return unit;
    });
    const peer = structuredClone(sample.units[0]);
    peer.top += 5;
    sample.units.splice(1, 0, peer);
  }
  return samples;
}

function checkFractionalTimingViolations(samples, rows) {
  const mutations = [
    (unit) => {
      for (const layer of unit.layers) layer.animation.delay += 0.002;
    },
    (unit) => {
      for (const layer of unit.layers) layer.animation.duration += 0.001;
    },
    (unit) => {
      for (const layer of unit.layers)
        layer.animation.delay = unit.order * layer.animation.duration;
    },
  ];
  for (const phase of [0, 6])
    for (const mutate of mutations) {
      const wrong = structuredClone(samples);
      const unit = wrong[phase].units.find((unit) => unit.order === 1);
      mutate(unit);
      assert.throws(() => checkTiming(wrong));
    }
  const last = structuredClone(samples);
  for (const unit of last[0].units.filter((unit) => unit.order === rows - 1))
    for (const layer of unit.layers) layer.animation.delay += 0.002;
  assert.throws(() => checkTiming(last), /approved overlapping native row wave/);
}

test('computed CSS fractional waves admit microsecond serialization and reject timing changes', () => {
  const serializers = [
    (ms) => Number((ms / 1000).toPrecision(6)) * 1000,
    (ms) => Number((ms / 1000).toFixed(6)) * 1000,
  ];
  for (const rows of [8, 24])
    for (const direction of ['forward', 'backward'])
      for (const serialize of serializers) {
        const samples = fractionalBlockSamples(rows, direction, serialize);
        assert.ok(
          samples[0].units.some((unit) => unit.layers[0].animation.delay % 1 !== 0),
          'the regression exercises actual fractional serialized delays'
        );
        for (const width of [390, 1440]) {
          for (const sample of samples) sample.viewportWidth = width;
          assert.doesNotThrow(() => checkTiming(samples));
        }
        checkFractionalTimingViolations(samples, rows);
      }
});

function noPaperSamples(direction, isolated) {
  const samples = blockSamples(direction);
  for (const sample of samples) {
    if (!sample.units.length) continue;
    const unit = sample.units[2];
    unit.tag = isolated ? 'SPAN' : 'NAV';
    unit.row = 0;
    unit.order = 0;
    unit.paper = null;
    unit.paperContent = 'none';
    unit.layers = isolated
      ? unit.layers.filter((layer) => layer.separator)
      : unit.layers.filter((_, index) => index !== 1);
    for (const layer of unit.layers) {
      layer.animation.delay = 0;
      layer.animation.duration = 1000;
    }
    unit.ink = unit.layers.map((layer) => layer.translate);
    sample.units = [unit];
  }
  return samples;
}
test('navigation without a paper pseudo-element and isolated dividers retain actual animated layers', () => {
  for (const isolated of [false, true])
    for (const direction of ['forward', 'backward']) {
      const samples = noPaperSamples(direction, isolated);
      checkTiming(samples);
      const missingAnimation = structuredClone(samples);
      missingAnimation[0].units[0].layers.at(-1).animation.name = 'none';
      assert.throws(() => checkTiming(missingAnimation));
      if (isolated) {
        const staticDivider = structuredClone(samples);
        for (const sample of staticDivider.filter((sample) => sample.stage === 'departing')) {
          sample.units[0].ink = ['none'];
          sample.units[0].layers[0].translate = 'none';
        }
        assert.throws(() => checkTiming(staticDivider), /actual signed block movement/);
      }
    }
});
test('timing evidence records the hidden native mount, camera framing and opaque native content', () => {
  const routeUnits = [],
    borderSources = [];
  const scene = {
      dataset: { progress: '.56', direction: 'forward', cameraStage: 'transit', framing: '1' },
    },
    main = { dataset: { routeBlocks: 'holding' } },
    content = {
      hasAttribute: () => true,
      querySelector: () => main,
      querySelectorAll: (selector) =>
        selector === '[data-route-block]' ? routeUnits : borderSources,
    },
    listeners = new Map();
  let observer,
    time = 100;
  const context = {
    window: { addEventListener: (name, fn) => listeners.set(name, fn) },
    document: {
      body: { dataset: { page: 'writing' } },
      querySelector: (selector) => (selector === '.space-scene' ? scene : content),
    },
    performance: { now: () => time },
    innerWidth: 1440,
    innerHeight: 844,
    getComputedStyle: (element, pseudo) => ({
      opacity: '1',
      transform: 'none',
      translate: '0px 40px',
      animationName: 'route-block-depart',
      animationDelay: '0.2s',
      animationDuration: '200ms',
      content: pseudo && element.noPaper ? 'none' : '""',
      width: '300px',
      height: '0px',
      getPropertyValue: (name) =>
        name === 'border-top-width'
          ? '2px'
          : name.endsWith('-width')
            ? '0px'
            : name.endsWith('-color')
              ? element.dataset?.entrySeparator
                ? 'rgb(20, 30, 40)'
                : 'rgba(0, 0, 0, 0)'
              : 'solid',
    }),
    MutationObserver: class MutationObserver {
      constructor(callback) {
        observer = callback;
      }
      observe() {}
    },
  };
  vm.runInNewContext('(' + timingProbe.toString() + ')()', context);
  listeners.get('site:page-mount')();
  observer();
  assert.equal(context.window.__flightSamples.length, 1, 'same-stage progress is bounded');
  time += 100;
  observer();
  const samples = context.window.__flightSamples;
  assert.equal(samples.length, 2);
  assert.equal(samples[0].kind, 'mount');
  assert.equal(samples[0].progress, 0.56);
  assert.equal(samples[0].opacity, 1);
  assert.equal(samples[0].transform, 'none');
  assert.equal(samples[0].stage, 'holding');
  assert.equal(samples[0].cameraStage, 'transit');
  assert.equal(samples[0].framing, 1);
  assert.equal(samples[0].page, 'writing');
  assert.equal(samples[1].kind, 'progress');
  routeUnits.push({
    tagName: 'ARTICLE',
    id: 'native-block',
    className: 'research-card',
    dataset: {
      routeBlock: 'departing',
      routeDirection: 'backward',
      routeRow: '1',
      routeDelay: '0',
      entryBorderOwner: '2',
    },
    children: [
      { dataset: {} },
      {
        dataset: { entrySeparator: 'top', entrySeparatorSource: 'ancestor', entryBorderOwner: '2' },
      },
    ],
    getBoundingClientRect: () => ({ top: 320, bottom: 450 }),
  });
  borderSources.push({
    dataset: { entryBorderTopOwner: '2' },
    getBoundingClientRect: () => ({ top: 300, bottom: 450 }),
  });
  main.dataset.routeBlocks = 'departing';
  observer();
  const actual = samples[2].units[0];
  assert.equal(actual.row, 1);
  assert.equal(actual.order, 0);
  assert.equal(actual.top, 320);
  assert.equal(actual.bottom, 450);
  assert.equal(actual.layers[0].animation.delay, 200);
  assert.equal(actual.layers[0].animation.duration, 200);
  assert.equal(actual.layers[1].separator, 'top');
  assert.equal(actual.layers[1].separatorSource, 'ancestor');
  assert.equal(actual.layers[1].borderOwner, '2');
  assert.equal(actual.layers[1].translate, actual.paper);
  assert.equal(actual.layers[1].separatorPaint.width, 2);
  assert.equal(actual.layers[1].separatorPaint.length, 300);
  assert.equal(actual.layers[1].separatorPaint.color, 'rgb(20, 30, 40)');
  assert.deepEqual(JSON.parse(JSON.stringify(samples[2].borderSources)), [
    { sides: [{ owner: '2', side: 'top', color: 'rgba(0, 0, 0, 0)' }] },
  ]);
  routeUnits.push({
    tagName: 'NAV',
    id: 'native-navigation',
    className: 'section-nav',
    dataset: {
      routeBlock: 'departing',
      routeDirection: 'backward',
      routeRow: '0',
      routeDelay: '1',
    },
    children: [{ dataset: {} }],
    noPaper: true,
    getBoundingClientRect: () => ({ top: 200, bottom: 260 }),
  });
  time += 100;
  observer();
  assert.equal(samples[3].units[1].paper, null);
  assert.equal(samples[3].units[1].paperContent, 'none');
  assert.equal(samples[3].units[1].layers.length, 1);
  const before = samples.length;
  for (let frame = 0; frame < 100; frame++) {
    time += 10;
    scene.dataset.progress = String(frame / 100);
    observer();
  }
  assert.equal(samples.length - before, 10, 'progress reads run at most every100ms');
  scene.dataset.cameraStage = 'center';
  observer();
  scene.dataset.cameraStage = 'transit';
  observer();
  listeners.get('site:page-mount')();
  assert.equal(
    samples
      .slice(-3)
      .map((sample) => sample.kind)
      .join('/'),
    'progress/progress/mount'
  );
  assert.equal(samples.at(-3).cameraStage, 'center', 'stage changes are recorded without throttle');
});
function historyPositionFixture(update = () => {}) {
  let time = 0;
  const scene = { dataset: { route: 'writing', travel: 'settled' } },
    content = {
      busy: false,
      hasAttribute() {
        return this.busy;
      },
    },
    context = {
      window: {},
      performance: { now: () => time },
      scrollY: 400,
      location: { href: 'https://owned.invalid/writing.html' },
      history: { state: { site: { page: 'writing', scroll: [0, 400] } } },
      document: {
        body: { dataset: { page: 'writing' } },
        querySelector: (selector) => (selector === '.space-scene' ? scene : content),
      },
    };
  const invoke = (fn, arg) =>
    vm.runInNewContext('(' + fn.toString() + ')(arg)', { ...context, arg });
  const page = {
    async evaluate(fn, arg) {
      return invoke(fn, arg);
    },
    async waitForFunction(fn, arg, options) {
      assert.deepEqual(options, { polling: 50, timeout: 2000 });
      for (time = 0; time <= options.timeout; time += options.polling) {
        update(time, context, scene, content);
        if (invoke(fn, arg)) return;
      }
      throw Error('Controlled history position timeout after 2000ms');
    },
  };
  return { page, context, scene, content, invoke, time: (value) => (time = value) };
}
const middleExpected = {
  route: 'writing',
  y: 400,
  url: 'https://owned.invalid/writing.html',
  part: 'saved',
};
test('middle history waits for actual scroll, saved native position and finished matching scene', async () => {
  const h = historyPositionFixture((time, context, scene, content) => {
    context.scrollY = time < 100 ? 4368 : 400;
    context.history.state.site.scroll[1] = time < 450 ? 4368 : 400;
    scene.dataset.route = time < 150 ? 'talks' : 'writing';
    scene.dataset.travel = time < 200 ? 'flying' : 'settled';
    content.busy = time < 250;
  });
  const evidence = await historyPositionReady(h.page, middleExpected);
  assert.equal(evidence.status, 'ready');
  assert.equal(evidence.elapsedMs, 450);
  assert.equal(evidence.samples.length, 10);
  assert.equal(evidence.samples[0].y, 4368);
  assert.equal(evidence.samples.at(-1).savedY, 400);
  const controls = [
    (h) => (h.context.scrollY = 7073),
    (h) => (h.context.history.state.site.scroll[1] = 7073),
    (h) => (h.context.history.state.site.page = 'talks'),
    (h) => (h.context.document.body.dataset.page = 'talks'),
    (h) => (h.scene.dataset.route = 'talks'),
    (h) => (h.scene.dataset.travel = 'flying'),
    (h) => (h.content.busy = true),
    (h) => (h.context.location.href = 'https://owned.invalid/talks.html'),
  ];
  for (const mutate of controls) {
    const invalid = historyPositionFixture();
    mutate(invalid);
    assert.equal(invalid.invoke(historyPositionSample, middleExpected), false);
  }
});
test('restoration timeout retains every position sample and actual history mismatch', async () => {
  const h = historyPositionFixture(() => {
    h.context.scrollY = 7073;
  });
  await assert.rejects(
    () => historyPositionReady(h.page, { ...middleExpected, part: 'restored' }),
    /history position timeout/
  );
  const evidence = h.context.window.__historyMiddle;
  assert.equal(evidence.status, 'failed');
  assert.equal(evidence.timeoutMs, 2000);
  assert.equal(evidence.elapsedMs, 2000);
  assert.equal(evidence.samples.length, 41);
  assert.equal(evidence.samples.at(-1).y, 7073);
  assert.equal(evidence.samples.at(-1).savedY, 400);
  assert.match(evidence.error, /2000ms/);
});
