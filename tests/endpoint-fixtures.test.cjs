'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const { requestEndpoint, endpointReady } = require('../tools/quality/navigation.cjs');
const expected = {
  from: 'talks',
  to: 'writing',
  route: 'writing',
  late: true,
  token: 'writing-late-1',
  motion: 'off',
};
function endpointFixture(update = () => {}, options = {}) {
  let time = 0;
  const listeners = new Map(),
    timers = [],
    elements = [],
    calls = [],
    events = [];
  const scene = {
    dataset: {
      route: 'writing',
      travel: 'settled',
      phase: '0',
      quality: 'still',
      camera: 'camera',
      ready: 'true',
    },
  };
  const content = {
      busy: false,
      hasAttribute() {
        return this.busy;
      },
    },
    motion = {
      textContent: 'Motion: off',
      hidden: false,
      disabled: false,
      getAttribute: () => 'false',
    };
  const context = {
    scrollY: 2000,
    innerHeight: 900,
    performance: { now: () => time },
    Event: class Event {
      constructor(type, init) {
        this.type = type;
        this.bubbles = init?.bubbles;
      }
    },
  };
  const body = {
    dataset: { page: 'writing' },
    scrollHeight: 2900,
    offsetHeight: 2900,
    getBoundingClientRect: () => ({ height: 2900 }),
  };
  const root = { scrollHeight: 2900, offsetHeight: 2900, clientHeight: 900 },
    footer = {
      offsetHeight: 200,
      scrollHeight: 200,
      getBoundingClientRect: () => ({ top: 2700, bottom: 2900, height: 200 }),
      append(el) {
        elements.push(el);
        const height = Number.parseInt(el.style.height, 10);
        root.scrollHeight += height;
        body.scrollHeight = root.scrollHeight;
        body.offsetHeight = root.scrollHeight;
      },
    };
  const topic = {
    value: 'all',
    dispatchEvent(event) {
      events.push({ type: event.type, bubbles: event.bubbles, value: this.value });
      if (options.shrinkFilter) root.scrollHeight = 2600;
    },
  };
  function emit(name) {
    for (const entry of [...(listeners.get(name) || [])]) {
      if (entry.once) listeners.get(name).delete(entry);
      entry.fn();
    }
  }
  const window = {
    SiteNavigation: {
      go(to, settings) {
        calls.push({ to, atEnd: settings.atEnd });
        body.dataset.page = to;
        scene.dataset.route = to;
        return options.acceptNavigation !== false;
      },
    },
    addEventListener(name, fn, settings) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add({ fn, once: settings?.once === true });
    },
  };
  const document = {
    body,
    documentElement: root,
    hidden: false,
    hasFocus: () => true,
    querySelector(selector) {
      if (selector === '.space-scene') return scene;
      if (selector === '#site-content') return content;
      if (selector === '#space-motion') return motion;
      if (selector === 'footer') return footer;
      if (selector === '#archive-topic') return topic;
      if (selector.includes('data-endpoint-fixture'))
        return (
          elements.find(
            (el) => selector === '[data-endpoint-fixture="' + el.dataset.endpointFixture + '"]'
          ) || null
        );
      throw Error('Unexpected fixture selector ' + selector);
    },
    createElement() {
      return { dataset: {}, style: {}, getBoundingClientRect: () => ({ height: 900 }) };
    },
  };
  Object.assign(context, {
    window,
    document,
    setTimeout(fn, delay) {
      timers.push({ fn, time: time + delay });
    },
  });
  vm.createContext(context);
  const invoke = (fn, arg) => {
    context.fixtureArg = arg;
    return vm.runInContext('(' + fn.toString() + ')(fixtureArg)', context);
  };
  function advance(value) {
    while (timers.some((timer) => timer.time <= value)) {
      timers.sort((a, b) => a.time - b.time);
      const timer = timers.shift();
      time = timer.time;
      timer.fn();
    }
    time = value;
  }
  const page = {
    async evaluate(fn, arg) {
      return invoke(fn, arg);
    },
    async waitForFunction(fn, arg, settings) {
      assert.deepEqual(settings, { polling: 50, timeout: 1000 });
      const started = time;
      for (let sampleTime = 0; sampleTime <= settings.timeout; sampleTime += settings.polling) {
        advance(started + sampleTime);
        update(sampleTime, context, scene, content);
        if (invoke(fn, arg)) return;
      }
      throw Error('Controlled native endpoint timeout after 1000ms');
    },
  };
  return {
    page,
    context,
    scene,
    content,
    root,
    motion,
    elements,
    calls,
    events,
    emit,
    invoke,
    advance,
    time: () => time,
  };
}
test('late endpoint growth is an actual deferred footer mutation and native reverse request', () => {
  const h = endpointFixture();
  h.context.document.body.dataset.page = 'talks';
  h.invoke(requestEndpoint, expected);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].to, 'writing');
  assert.equal(h.calls[0].atEnd, true);
  assert.equal(h.context.window.__endpointGrowth.executed, false);
  assert.equal(h.elements.length, 0);
  h.emit('site:page-ready');
  h.advance(79);
  assert.equal(h.elements.length, 0, 'the existing late-growth control remains 80 ms');
  h.advance(80);
  const growth = h.context.window.__endpointGrowth;
  assert.equal(growth.executed, true);
  assert.equal(growth.token, expected.token);
  assert.equal(h.elements.length, 1);
  assert.equal(h.elements[0].dataset.endpointFixture, expected.token);
  assert.equal(h.elements[0].style.height, '900px');
  assert.equal(growth.before.max, 2000);
  assert.equal(growth.after.max, 2900);
  assert.equal(growth.after.y, 2000);
  assert.equal(h.events.length, 1);
  assert.equal(h.events[0].type, 'change');
  assert.equal(h.events[0].value, 'systems');
  assert.equal(h.events[0].bubbles, true);
  h.emit('site:page-ready');
  h.advance(200);
  assert.equal(h.elements.length, 1, 'one route-ready fixture must not fabricate repeated growth');
});
test('late endpoint cannot pass at the old bottom before actual growth and delayed native reconciliation', async () => {
  const h = endpointFixture((time, context) => {
    if (time >= 450) context.scrollY = 2900;
  });
  h.invoke(requestEndpoint, expected);
  h.emit('site:page-ready');
  const evidence = await endpointReady(h.page, expected);
  assert.equal(evidence.samples.length, 10);
  assert.equal(evidence.samples[0].y, 2000);
  assert.equal(evidence.samples[0].max, 2000);
  assert.equal(evidence.samples.at(-1).y, 2900);
  assert.equal(evidence.samples.at(-1).max, 2900);
  assert.equal(evidence.elapsedMs, 450);
  assert.equal(evidence.status, 'settled');
  assert.equal(h.context.window.__endpointSettlements.length, 1);
  assert.equal(h.context.window.__endpointSettlements[0].samples, evidence.samples);
});
test('wrong route, unfinished scene, absent growth trigger and wrong native bottom retain strict endpoint failures', async () => {
  const mutations = [
    (h) => (h.context.document.body.dataset.page = 'talks'),
    (h) => (h.scene.dataset.route = 'talks'),
    (h) => (h.scene.dataset.travel = 'flying'),
    (h) => (h.content.busy = true),
    (h) => (h.context.window.__endpointGrowth.executed = false),
    (h) => (h.context.window.__endpointGrowth.token = 'other-fixture'),
    (h) => (h.elements[0].dataset.endpointFixture = 'missing-marker'),
    (h) => (h.context.scrollY = 1800),
  ];
  for (const mutate of mutations) {
    const h = endpointFixture();
    h.invoke(requestEndpoint, expected);
    h.emit('site:page-ready');
    h.advance(80);
    h.context.scrollY = 2900;
    mutate(h);
    await assert.rejects(() => endpointReady(h.page, expected), /endpoint timeout/);
    const evidence = h.context.window.__endpointSettlement;
    assert.equal(evidence.status, 'failed');
    assert.equal(evidence.timeoutMs, 1000);
    assert.equal(evidence.samples.length, 21);
    assert.equal(evidence.elapsedMs, 1000);
    assert.match(evidence.error, /1000ms/);
    assert.equal(h.context.window.__endpointSettlements[0], evidence);
  }
});
test('actual writing filter growth may shrink the range and still requires the exact new native bottom', async () => {
  const h = endpointFixture(
    (time, context) => {
      if (time >= 150) context.scrollY = 1700;
    },
    { shrinkFilter: true }
  );
  h.invoke(requestEndpoint, expected);
  h.emit('site:page-ready');
  const evidence = await endpointReady(h.page, expected),
    growth = h.context.window.__endpointGrowth;
  assert.equal(growth.executed, true);
  assert.equal(growth.before.max, 2000);
  assert.equal(growth.after.max, 1700);
  assert.equal(evidence.samples.at(-1).y, 1700);
  assert.equal(evidence.samples.at(-1).max, 1700);
  assert.equal(evidence.elapsedMs, 150);
});
test('ordinary reverse endpoint needs matching native state but no fabricated late-growth marker', async () => {
  const h = endpointFixture(),
    ordinary = { ...expected, late: false, token: 'writing-normal-1' };
  h.invoke(requestEndpoint, ordinary);
  assert.equal(h.elements.length, 0);
  assert.equal(h.calls.length, 1);
  const evidence = await endpointReady(h.page, ordinary);
  assert.equal(evidence.samples.length, 1);
  assert.equal(evidence.samples[0].y, 2000);
  assert.equal(evidence.samples[0].max, 2000);
});
