'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const factory = require('../site/engine/scroll-entry.cjs');

function surface() {
  const events = new Map();
  return {
    events,
    addEventListener(name, handler) {
      if (!events.has(name)) events.set(name, new Set());
      events.get(name).add(handler);
    },
    removeEventListener(name, handler) {
      events.get(name)?.delete(handler);
    },
    emit(name, detail = {}) {
      for (const handler of [...(events.get(name) || [])]) handler(detail);
    },
  };
}
function harness({
  count = 8,
  footerCount = 0,
  ready = true,
  enabled = true,
  blockPreference = true,
  supported = true,
  clipSupported = true,
  heroDisplay = null,
} = {}) {
  const tasks = new Map();
  const observers = [];
  let id = 0;
  let now = 100;
  let motion = { ready, enabled };
  let blocks = blockPreference;
  const group = {};
  const selectors = [];
  const probes = [];
  function block(index) {
    const attributes = new Map();
    const styles = new Map();
    const element = {
      attributes,
      styles,
      style: {
        setProperty: (name, value) => styles.set(name, value),
        removeProperty: (name) => styles.delete(name),
        getPropertyValue: (name) => styles.get(name) || '',
      },
      top: 100 + index * 900,
      height: 300,
      hidden: false,
      display: 'block',
      children: [],
      borders: {},
      parentElement: group,
      contains: (node) => node === element,
      matches: () => false,
      getBoundingClientRect: () =>
        element.display === 'contents'
          ? { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }
          : {
              top: element.top - window.scrollY,
              bottom: element.top + element.height - window.scrollY,
              left: 0,
              right: 100,
              width: 100,
              height: element.height,
            },
      getClientRects: () => (element.hidden || element.display === 'contents' ? [] : [{}]),
      setAttribute: (name, value) => attributes.set(name, value),
      hasAttribute: (name) => attributes.has(name),
      removeAttribute: (name) => attributes.delete(name),
      closest: () => element,
      append: (node) => {
        element.children.push(node);
        node.parentElement = element;
      },
      remove: () => {
        if (element.parentElement?.children)
          element.parentElement.children = element.parentElement.children.filter(
            (child) => child !== element
          );
      },
    };
    return element;
  }
  const elements = Array.from({ length: count }, (_, index) => block(index));
  if (heroDisplay) {
    elements[0].display = heroDisplay;
    elements[0].children = elements.slice(1, 6);
    elements[0].contains = (node) => node === elements[0] || elements[0].children.includes(node);
    elements.slice(1, 7).forEach((element, index) => {
      element.top = 100 + index * 90;
    });
  }
  const footerElements = Array.from({ length: footerCount }, (_, index) => block(count + index));
  function container(units) {
    const node = { ...block(0), ...surface(), contains: () => true };
    node.querySelectorAll = (selector) => {
      selectors.push(selector);
      return units;
    };
    return node;
  }
  const root = container(elements);
  const footer = footerCount ? container(footerElements) : null;
  const document = {
    ...surface(),
    readyState: 'complete',
    hidden: false,
    documentElement: { scrollHeight: 12000 },
    querySelector: (selector) => (selector === 'main' ? root : footer),
    fonts: surface(),
    createElement: () => block(-1),
  };
  const window = {
    ...surface(),
    scrollY: 0,
    innerHeight: 900,
    innerWidth: 1000,
    performance: { now: () => now },
    CSS: { supports: (property) => supported && (property !== 'overflow' || clipSupported) },
    SiteScene: { motionState: () => motion },
    SiteNavigation: { contentFlight: () => blocks },
    SiteEngineProbe: (value) => probes.push(value),
    getComputedStyle: (element) => ({
      display: element.display,
      getPropertyValue: (name) => {
        if (name === '--scroll-entry-distance') return '88px';
        if (name === '--block-motion-duration') return '700ms';
        if (name === '--block-motion-stagger') return '80ms';
        if (name === '--block-motion-phase') return '1000ms';
        if (name.endsWith('-color') && element.attributes?.has('data-entry-border-source'))
          return 'transparent';
        return element.borders[name] || (name.endsWith('-width') ? '0px' : 'none');
      },
    }),
    setTimeout(handler, delay) {
      tasks.set(++id, { handler, delay });
      return id;
    },
    clearTimeout: (id) => tasks.delete(id),
    IntersectionObserver: class {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observed = new Set();
        observers.push(this);
      }
      observe(element) {
        this.observed.add(element);
      }
      unobserve(element) {
        this.observed.delete(element);
      }
      disconnect() {
        this.observed.clear();
      }
    },
  };
  const controller = vm.runInNewContext(`(${factory.toString()})()`, { window, document });
  const state = (index) => elements[index].attributes.get('data-scroll-entry');
  function scroll(y) {
    window.scrollY = y;
    window.emit('scroll');
  }
  function intersect(indices, observer = observers.at(-1), isIntersecting = true) {
    observer.callback(
      indices.map((index) => ({
        target: elements[index],
        isIntersecting,
        boundingClientRect: elements[index].getBoundingClientRect(),
      }))
    );
  }
  function task(delay) {
    for (const [key, value] of [...tasks]) {
      if (value.delay !== delay) continue;
      tasks.delete(key);
      value.handler();
    }
  }
  function routeWatchdog() {
    const nodes = new Set();
    function visit(element) {
      nodes.add(element);
      for (const child of element?.children || []) visit(child);
    }
    for (const element of [...elements, ...footerElements]) visit(element);
    const end = Math.max(
      0,
      ...[...nodes].map(
        (element) =>
          (Number.parseFloat(element.styles?.get('--route-block-delay')) || 0) +
          (Number.parseFloat(element.styles?.get('--route-block-duration')) || 0)
      )
    );
    task(end + 1000);
  }
  controller.boot();
  return {
    controller,
    window,
    document,
    root,
    elements,
    footer,
    footerElements,
    selectors,
    probes,
    observers,
    tasks,
    state,
    scroll,
    intersect,
    leave: (indices) => intersect(indices, observers.at(-1), false),
    task,
    routeWatchdog,
    preference(next) {
      blocks = next;
      controller.refreshPreference();
    },
    motion(next) {
      motion = next;
      window.emit('site:motion-state');
    },
    tick(ms) {
      now += ms;
    },
  };
}

test('native CSS completion remains valid when the wall clock advances between frame samples', async () => {
  for (const direction of [1, -1]) {
    for (const stage of ['departing', 'arriving']) {
      const h = harness({ count: 1 });
      h.document.timeline = { currentTime: 84 };
      if (stage === 'arriving') h.controller.prepareArrival(direction);
      const phase =
        stage === 'departing' ? h.controller.depart(direction) : h.controller.arrive(direction);
      h.tick(985);
      h.document.timeline.currentTime = 1084;
      h.root.emit('animationend', {
        animationName: stage === 'departing' ? 'route-block-depart' : 'route-block-arrive',
        target: h.elements[0],
      });
      h.routeWatchdog();
      assert.equal(
        (await phase).completedBy,
        'animationend',
        'the genuine1000ms CSS wave completed'
      );
      h.controller.cancel();
    }
  }
  const reading = harness();
  reading.document.timeline = { currentTime: 84 };
  reading.scroll(200);
  reading.intersect([1]);
  reading.tick(685);
  reading.document.timeline.currentTime = 784;
  reading.root.emit('animationend', {
    animationName: 'scroll-entry-rise',
    target: reading.elements[1],
  });
  assert.equal(reading.state(1), undefined, 'the genuine700ms CSS reveal completed');
  reading.controller.cancel();
});

test('elapsed wall time cannot admit a stale event before the current CSS phase ends', async () => {
  const h = harness({ count: 1 });
  h.document.timeline = { currentTime: 84 };
  const phase = h.controller.depart(1);
  h.tick(1000);
  h.document.timeline.currentTime = 984;
  h.root.emit('animationend', {
    animationName: 'route-block-depart',
    target: h.elements[0],
  });
  assert.equal(h.probes.at(-1).completedBy, null, 'the current CSS phase is still900ms old');
  h.tick(100);
  h.document.timeline.currentTime = 1084;
  h.root.emit('animationend', {
    animationName: 'route-block-depart',
    target: h.elements[0],
  });
  h.routeWatchdog();
  assert.equal((await phase).completedBy, 'animationend');
  h.controller.cancel();
});

test('unavailable CSS timeline marks retain the paired wall-clock completion fallback', async () => {
  for (const value of [null, undefined, NaN, Infinity]) {
    const h = harness({ count: 1 });
    h.document.timeline = { currentTime: value };
    const phase = h.controller.depart(1);
    h.tick(1000);
    h.document.timeline.currentTime = 1084;
    h.root.emit('animationend', {
      animationName: 'route-block-depart',
      target: h.elements[0],
    });
    h.routeWatchdog();
    assert.equal((await phase).completedBy, 'animationend');
    h.controller.cancel();
  }
});

test('entry boot keeps the first fold steady and arms only safe below-fold shells', () => {
  const h = harness();
  assert.equal(h.state(0), undefined);
  assert.equal(h.state(1), 'waiting');
  assert.equal(h.observers[0].options.rootMargin, '0px');
  h.elements[7].top = 11900;
  h.window.emit('resize');
  h.task(0);
  assert.equal(h.state(7), undefined, 'bottom guard prevents transformed overflow growth');
});

test('reconciliation snapshots native page extent once for all reading candidates', () => {
  const h = harness({ count: 24 });
  let reads = 0;
  Object.defineProperty(h.document.documentElement, 'scrollHeight', {
    get() {
      reads++;
      return 24000;
    },
  });
  h.window.emit('resize');
  h.task(0);
  assert.equal(reads, 1, 'arming each shell cannot trigger another native extent read');
  assert.equal(h.state(1), 'waiting');
  assert.equal(h.state(20), 'waiting');
});

function readingBatchProbe(h) {
  const events = [];
  let writing = false;
  function read(name) {
    events.push({ kind: 'read', name, writing });
  }
  for (const [owner, name] of [
    [h.window, 'innerHeight'],
    [h.window, 'scrollY'],
    [h.document, 'activeElement'],
    [h.document.documentElement, 'scrollHeight'],
  ]) {
    let value = owner[name];
    Object.defineProperty(owner, name, {
      configurable: true,
      get() {
        read(name);
        return value;
      },
      set(next) {
        value = next;
      },
    });
  }
  for (const element of h.elements) {
    for (const name of ['getBoundingClientRect', 'getClientRects']) {
      const original = element[name];
      element[name] = (...args) => {
        read(name);
        return original(...args);
      };
    }
    const setAttribute = element.setAttribute;
    element.setAttribute = (name, value) => {
      if (name === 'data-scroll-entry' && value === 'waiting') {
        writing = true;
        events.push({ kind: 'arm', element });
      }
      return setAttribute(name, value);
    };
  }
  return {
    events,
    reset() {
      writing = false;
      events.length = 0;
    },
    verify() {
      assert.ok(events.filter((entry) => entry.kind === 'arm').length >= 2);
      assert.deepEqual(
        events.filter((entry) => entry.kind === 'read' && entry.writing),
        [],
        'native geometry/focus reads must precede the per-unit arming writes'
      );
      const cleanup = events.findIndex((entry) => entry.kind === 'cleanup-complete');
      for (const name of ['innerHeight', 'activeElement', 'scrollHeight'])
        assert.equal(
          events.slice(cleanup + 1).filter((entry) => entry.kind === 'read' && entry.name === name)
            .length,
          1,
          name + ' is one fresh snapshot for the batch'
        );
    },
  };
}

test('reconciliation uses fresh post-cleanup geometry and focus before all arming writes', () => {
  const h = harness();
  const probe = readingBatchProbe(h);
  const focus = [{}, {}];
  h.elements[2].contains = (node) => node === focus[0];
  h.elements[4].contains = (node) => node === focus[1];
  [100, 800, 900, 1000, 1100, 1400, 1450, 1200].forEach((top, index) => {
    h.elements[index].top = top;
  });
  h.elements[3].hidden = true;
  const cleanup = h.elements[7].removeAttribute;
  let next;
  h.elements[7].removeAttribute = (name) => {
    cleanup(name);
    if (name !== 'data-scroll-delay' || !next) return;
    const values = next;
    next = null;
    h.window.innerHeight = values.height;
    h.window.scrollY = values.scrollY;
    h.document.activeElement = values.focus;
    h.document.documentElement.scrollHeight = values.bottom;
    probe.events.push({ kind: 'cleanup-complete' });
  };
  for (const [values, expected] of [
    [
      { height: 700, scrollY: 100, focus: focus[0], bottom: 1820 },
      [undefined, 'waiting', undefined, undefined, 'waiting', undefined, undefined, 'waiting'],
    ],
    [
      { height: 650, scrollY: 200, focus: focus[1], bottom: 2420 },
      [undefined, undefined, 'waiting', undefined, undefined, 'waiting', 'waiting', 'waiting'],
    ],
  ]) {
    probe.reset();
    next = values;
    h.window.emit('resize');
    h.task(0);
    assert.equal(next, null, 'cleanup changed the native geometry before this measurement');
    assert.deepEqual(
      h.elements.map((_, index) => h.state(index)),
      expected
    );
    probe.verify();
    const boundary = probe.events.findIndex((entry) => entry.kind === 'cleanup-complete');
    for (const name of ['innerHeight', 'scrollY', 'activeElement', 'scrollHeight']) {
      const first = probe.events.findIndex((entry) => entry.kind === 'read' && entry.name === name);
      assert.ok(first > boundary, name + ' must use the post-cleanup value');
    }
  }
  h.controller.destroy();
});

test('upward rearming batches cleanup and fresh native reads before multiple unit writes', () => {
  const h = harness();
  const probe = readingBatchProbe(h);
  const focused = {};
  h.elements[3].contains = (node) => node === focused;
  const cleanup = h.elements[4].removeAttribute;
  let next;
  h.elements[4].removeAttribute = (name) => {
    cleanup(name);
    if (name !== 'data-scroll-delay' || !next) return;
    const values = next;
    next = null;
    h.window.innerHeight = values.height;
    h.window.scrollY = values.scrollY;
    h.document.activeElement = values.focus;
    probe.events.push({ kind: 'cleanup-complete' });
  };
  for (const [values, expected] of [
    [{ height: 700, scrollY: 100, focus: focused }, ['waiting', 'waiting', undefined, 'waiting']],
    [{ height: 650, scrollY: 200, focus: null }, [undefined, 'waiting', 'waiting', 'waiting']],
  ]) {
    h.scroll(400);
    h.scroll(0);
    [800, 900, 1000, 1100].forEach((top, index) => {
      h.elements[index + 1].top = top;
    });
    // Observer rectangles are captured before callback cleanup/scroll anchoring.
    const entries = [1, 2, 3, 4].map((index) => ({
      target: h.elements[index],
      isIntersecting: false,
      boundingClientRect: { top: 2000, bottom: 2300 },
    }));
    probe.reset();
    next = values;
    h.observers.at(-1).callback(entries);
    assert.equal(next, null);
    assert.deepEqual([1, 2, 3, 4].map(h.state), expected);
    probe.verify();
    const boundary = probe.events.findIndex((entry) => entry.kind === 'cleanup-complete');
    for (const name of [
      'scrollY',
      'activeElement',
      'scrollHeight',
      'getBoundingClientRect',
      'getClientRects',
    ]) {
      const first = probe.events.findIndex((entry) => entry.kind === 'read' && entry.name === name);
      assert.ok(first > boundary, name + ' must follow every exited-state cleanup');
    }
  }
  h.controller.destroy();
});

test('entry repeats on every full downward re-entry and never animates upward', () => {
  const h = harness();
  for (let pass = 0; pass < 4; pass++) {
    h.scroll(200);
    h.intersect([1]);
    assert.equal(h.state(1), 'entering');
    h.tick(700);
    h.root.emit('animationend', { animationName: 'scroll-entry-rise', target: h.elements[1] });
    assert.equal(h.state(1), undefined);
    assert.equal(h.tasks.size, 0);
    assert.ok(h.observers.at(-1).observed.has(h.elements[1]), 'settled shells retain crossings');
    h.scroll(150);
    h.intersect([1]);
    assert.equal(h.state(1), undefined, 'upward reading remains native');
    h.scroll(0);
    h.leave([1]);
    assert.equal(h.state(1), 'waiting', 'only a complete offscreen bottom exit rearms');
  }
});

test('zero-delta notifications and delayed ordinary crossings preserve the downward reveal', () => {
  const h = harness();
  h.scroll(400);
  h.scroll(800);
  h.scroll(800);
  h.intersect([1]);
  assert.equal(
    h.state(1),
    'entering',
    'queued crossing is not mistaken for an upward or idle visit'
  );
  h.controller.destroy();
  assert.equal(h.tasks.size, 0);
});

test('the initial fold only becomes repeatable after leaving completely below the viewport', () => {
  const h = harness();
  h.scroll(200);
  h.intersect([0]);
  assert.equal(h.state(0), undefined, 'initial visible content stays native');
  h.elements[0].top = 500;
  h.scroll(0);
  h.leave([0]);
  assert.equal(h.state(0), undefined, 'a partial native viewport exit cannot prepare visible ink');
  h.controller.destroy();
});

test('entry tall blocks use a low threshold and sibling delay stays local and bounded', () => {
  const h = harness();
  h.elements[1].height = 5000;
  h.elements[2].top = 1020;
  h.elements[3].top = 1040;
  h.elements[4].top = 1060;
  h.scroll(200);
  h.intersect([1, 2, 3, 4]);
  assert.equal(h.observers[0].options.threshold, 0.001);
  assert.deepEqual(
    [1, 2, 3, 4].map((i) => h.elements[i].attributes.get('data-scroll-delay')),
    ['0', '1', '2', '2']
  );
  assert.equal(h.state(1), 'entering');
});

test('entry large native jumps and upward movement settle immediately', () => {
  const h = harness();
  h.scroll(950);
  h.intersect([1]);
  assert.equal(h.state(1), undefined);
  h.tick(300);
  h.elements[2].top = 1800;
  h.scroll(1050);
  h.intersect([2]);
  assert.equal(h.state(2), 'entering');
  h.scroll(1000);
  assert.equal(h.state(2), undefined);
});

test('dense ordinary entries queue instead of consuming the excess and keep six active timers', () => {
  const h = harness({ count: 10 });
  h.elements.forEach((element, index) => {
    element.top = 1000 + index * 8;
    element.height = 24;
  });
  h.window.emit('resize');
  h.task(0);
  h.scroll(200);
  h.intersect([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(h.controller.diagnostics().active, 6);
  assert.equal(h.state(7), 'waiting');
  assert.equal(h.tasks.size, 6);
  h.tick(700);
  h.root.emit('animationend', { animationName: 'scroll-entry-rise', target: h.elements[1] });
  assert.equal(h.state(7), 'entering', 'first completed slot starts the next native shell');
  assert.equal(h.controller.diagnostics().active, 6);
  h.tick(80);
  h.root.emit('animationend', { animationName: 'scroll-entry-rise', target: h.elements[2] });
  assert.equal(h.state(8), 'entering');
  assert.equal(h.tasks.size, 6);
  h.task(2000);
  assert.equal(h.controller.diagnostics().active, 0);
  assert.equal(h.tasks.size, 0);
});

test('forward mixed observer entries preserve queue order while an active shell exits', () => {
  const h = harness({ count: 10 });
  h.elements.forEach((element, index) => {
    element.top = 1000 + index * 8;
    element.height = 24;
  });
  h.window.emit('resize');
  h.task(0);
  h.scroll(200);
  h.intersect([1, 2, 3, 4, 5, 6]);
  h.elements[1].top = 0;
  h.observers.at(-1).callback([
    {
      target: h.elements[7],
      isIntersecting: true,
      boundingClientRect: h.elements[7].getBoundingClientRect(),
    },
    {
      target: h.elements[1],
      isIntersecting: false,
      boundingClientRect: h.elements[1].getBoundingClientRect(),
    },
  ]);
  assert.equal(h.state(7), 'waiting', 'the first crossing saw all six occupied slots');
  assert.equal(h.state(1), undefined);
  assert.equal(h.controller.diagnostics().active, 5);
  h.tick(900);
  h.root.emit('animationend', { animationName: 'scroll-entry-rise', target: h.elements[2] });
  assert.equal(h.state(7), 'entering', 'normal completion drains the preserved queued crossing');
  assert.equal(h.controller.diagnostics().active, 5);
  h.controller.destroy();
});

test('queued entries settle on watchdog failure, upward interruption and native jumps', () => {
  for (const interruption of ['watchdog', 'upward', 'jump', 'off', 'destroy']) {
    const h = harness({ count: 10 });
    h.elements.forEach((element, index) => {
      element.top = 1000 + index * 8;
      element.height = 24;
    });
    h.window.emit('resize');
    h.task(0);
    h.scroll(200);
    h.intersect([1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(h.state(8), 'waiting');
    if (interruption === 'watchdog') h.task(2000);
    if (interruption === 'upward') h.scroll(150);
    if (interruption === 'jump') h.scroll(1200);
    if (interruption === 'off') h.preference(false);
    if (interruption === 'destroy') h.controller.destroy();
    assert.equal(h.state(8), undefined, interruption + ' releases queued native ink');
    assert.equal(h.controller.diagnostics().active, 0);
    assert.equal(h.tasks.size, 0);
  }
});

test('entry stale callbacks and cached-node remount cannot leak old state or listeners', () => {
  const h = harness();
  const old = h.observers[0];
  h.scroll(200);
  h.controller.suspend();
  h.intersect([1], old);
  assert.equal(h.state(1), undefined);
  h.controller.mount(h.root);
  h.controller.resume();
  assert.equal(h.window.events.get('scroll').size, 1);
  h.intersect([1], old);
  assert.equal(h.state(1), undefined, 'visible on restored mount remains steady');
  h.controller.destroy();
  assert.equal(h.tasks.size, 0);
  assert.equal(h.window.events.get('scroll').size, 0);
  assert.ok(h.elements.every((element) => element.attributes.size === 0));
});

test('a stale reading completion cannot settle a newer retained-shell reveal early', () => {
  const h = harness();
  h.scroll(200);
  h.intersect([1]);
  h.tick(600);
  h.scroll(0);
  h.leave([1]);
  h.scroll(200);
  h.intersect([1]);
  h.tick(100);
  h.root.emit('animationend', { animationName: 'scroll-entry-rise', target: h.elements[1] });
  assert.equal(h.state(1), 'entering', 'old completion cannot consume the fresh animation');
  h.tick(600);
  h.root.emit('animationend', { animationName: 'scroll-entry-rise', target: h.elements[1] });
  assert.equal(h.state(1), undefined);
  assert.equal(h.tasks.size, 0);
});

test('entry awaits effective motion readiness and settles on Off, hold or failure', () => {
  const h = harness({ ready: false, enabled: false });
  assert.equal(h.observers.length, 0);
  h.motion({ ready: true, enabled: true });
  assert.equal(h.state(1), 'waiting');
  h.scroll(200);
  h.intersect([1]);
  h.motion({ ready: true, enabled: false });
  assert.equal(h.state(1), undefined);
  assert.equal(h.tasks.size, 0);
  assert.ok(h.elements.every((element) => element.attributes.size === 0));
  h.motion({ ready: true, enabled: true });
  assert.equal(h.state(1), undefined, 'enabling never replays previously settled reading');
});

test('entry unsupported APIs and observer errors leave fully native content', () => {
  const unsupported = harness({ supported: false });
  assert.equal(unsupported.observers.length, 0);
  const h = harness();
  h.window.IntersectionObserver = class {
    constructor() {
      throw Error('unavailable');
    }
  };
  h.controller.resume();
  assert.ok(h.elements.every((element) => element.attributes.size === 0));
  assert.equal(h.tasks.size, 0);
});

test('entry focus, browser find, hidden tabs, print and bfcache settle readable content', () => {
  for (const kind of ['focus', 'find', 'hidden', 'print', 'pagehide']) {
    const h = harness();
    h.scroll(200);
    h.intersect([1]);
    if (kind === 'focus') h.root.emit('focusin', { target: h.elements[1] });
    if (kind === 'find') h.document.emit('keydown', { ctrlKey: true, key: 'f' });
    if (kind === 'hidden') {
      h.document.hidden = true;
      h.document.emit('visibilitychange');
    }
    if (kind === 'print') h.window.emit('beforeprint');
    if (kind === 'pagehide') h.window.emit('pagehide');
    assert.equal(h.state(1), undefined, kind);
    assert.equal(h.tasks.size, 0, kind);
    h.window.emit('pageshow');
    h.task(0);
    assert.equal(h.state(1), undefined, kind + ' does not replay on restore');
  }
});

test('entry archive reconciliation waits for landing and never arms hidden rows', () => {
  const h = harness();
  h.elements[1].hidden = true;
  h.window.emit('site:archive-layout');
  h.scroll(950);
  h.task(0);
  assert.equal(h.state(1), undefined);
  h.elements[1].hidden = false;
  h.window.emit('site:archive-layout');
  h.task(0);
  assert.equal(h.state(1), undefined, 'newly visible landing settles');
  assert.equal(h.state(3), 'waiting');
  h.root.emit('focusin', { target: h.root });
  assert.equal(h.state(3), 'waiting', 'router main focus does not settle the whole route');
});

test('route blocks leave in page order and remain held until the destination is prepared', async () => {
  for (const direction of [1, -1]) {
    const h = harness({ footerCount: 1 });
    h.elements[1].top = 250;
    h.elements[2].top = 500;
    h.footerElements[0].top = 700;
    const departing = h.controller.depart(direction);
    assert.equal(h.controller.diagnostics().suspended, true);
    assert.equal(h.root.attributes.get('data-route-blocks'), 'departing');
    assert.equal(h.footer.attributes.get('data-route-blocks'), 'departing');
    assert.equal(
      h.elements[3].attributes.get('data-route-block'),
      undefined,
      'offscreen work is omitted'
    );
    h.tick(1000);
    for (const element of [h.elements[0], h.elements[1], h.elements[2], h.footerElements[0]]) {
      const distance = Number.parseFloat(element.styles.get('--route-block-distance'));
      const rect = element.getBoundingClientRect();
      assert.ok(direction > 0 ? rect.bottom + distance < 0 : rect.top + distance > 900);
      assert.equal(element.attributes.get('data-route-block'), 'departing');
      (h.footerElements.includes(element) ? h.footer : h.root).emit('animationend', {
        animationName: 'route-block-depart',
        target: element,
      });
    }
    assert.equal((await departing).completed, true);
    assert.equal(h.root.attributes.get('data-route-blocks'), 'holding');
    assert.equal(h.footer.attributes.get('data-route-blocks'), 'holding');
    assert.deepEqual(
      h.probes.map((probe) => probe.stage),
      ['departure', 'holding']
    );
    h.controller.cancel();
    assert.equal(h.tasks.size, 0);
  }
});

test('route arrival starts outside the correct edge and releases only after every visible block', async () => {
  for (const direction of [1, -1]) {
    const h = harness({ count: 8 });
    h.elements[1].top = 250;
    h.elements[2].top = 500;
    h.controller.prepareArrival(direction);
    assert.equal(h.root.attributes.get('data-route-blocks'), 'holding');
    const arriving = h.controller.arrive(direction);
    h.tick(1000);
    for (const [index, element] of h.elements.slice(0, 3).entries()) {
      const distance = Number.parseFloat(element.styles.get('--route-block-distance'));
      const rect = element.getBoundingClientRect();
      assert.ok(direction > 0 ? rect.top + distance > 900 : rect.bottom + distance < 0);
      assert.equal(element.attributes.get('data-route-block'), 'arriving');
      h.root.emit('animationend', { animationName: 'route-block-arrive', target: element });
      if (index < 2) assert.equal(h.root.attributes.get('data-route-blocks'), 'arriving');
    }
    assert.equal((await arriving).completed, true);
    assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
    assert.equal(h.tasks.size, 0);
    h.controller.resume();
    assert.equal(h.state(1), undefined, 'arrived first-fold content does not replay');
    assert.equal(h.state(3), 'waiting', 'below-fold content keeps downward reading entry');
    assert.ok(h.elements.every((element) => !element.styles.has('--route-block-distance')));
  }
});

test('route cancellation and cached-node remount settle old promises without completing a new phase', async () => {
  const h = harness();
  const old = h.controller.depart(1);
  h.controller.mount(h.root);
  assert.equal((await old).cancelled, true);
  h.controller.prepareArrival(-1);
  const next = h.controller.arrive(-1);
  h.root.emit('animationend', { animationName: 'route-block-depart', target: h.elements[0] });
  assert.equal(h.controller.diagnostics().routeStage, 'arriving');
  h.controller.cancel();
  assert.equal((await next).cancelled, true);
  assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
  assert.equal(h.tasks.size, 0);
  assert.ok(h.elements.every((element) => !element.attributes.has('data-route-block')));
});

test('route phase and flight hold have finite timer bounds and stagger stays bounded', async () => {
  const h = harness({ count: 10 });
  h.elements.forEach((element, index) => {
    element.top = 100 + index * 40;
    element.height = 24;
  });
  const departing = h.controller.depart(1);
  assert.deepEqual(
    h.elements.map((element) => element.attributes.get('data-route-delay')),
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  );
  h.task(1600);
  assert.equal(
    h.controller.diagnostics().routeStage,
    'departing',
    'the phase watchdog preserves its completion allowance'
  );
  h.routeWatchdog();
  assert.equal((await departing).completed, true);
  assert.equal(h.root.attributes.get('data-route-blocks'), 'holding');
  h.task(8000);
  assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
  assert.equal(h.tasks.size, 0);
  h.controller.prepareArrival(-1);
  const arriving = h.controller.arrive(-1);
  h.routeWatchdog();
  assert.equal((await arriving).completed, true);
  assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
  assert.equal(h.tasks.size, 0);
});

test('route fallback, focus, find, print, hidden and motion failure restore native content immediately', async () => {
  for (const kind of ['focus', 'find', 'hidden', 'print', 'pagehide', 'motion']) {
    const h = harness({ footerCount: 1 });
    const departing = h.controller.depart(1);
    if (kind === 'focus') h.footer.emit('focusin', { target: h.footerElements[0] });
    if (kind === 'find') h.document.emit('keydown', { metaKey: true, key: 'f' });
    if (kind === 'hidden') {
      h.document.hidden = true;
      h.document.emit('visibilitychange');
    }
    if (kind === 'print') h.window.emit('beforeprint');
    if (kind === 'pagehide') h.window.emit('pagehide');
    if (kind === 'motion') h.motion({ ready: true, enabled: false });
    assert.equal((await departing).cancelled, true, kind);
    assert.equal(h.root.attributes.get('data-route-blocks'), undefined, kind);
    assert.equal(h.footer.attributes.get('data-route-blocks'), undefined, kind);
    assert.equal(h.tasks.size, 0, kind);
  }
  for (const options of [{ supported: false }, { enabled: false }]) {
    const h = harness(options);
    assert.equal((await h.controller.depart(1)).cancelled, true);
    assert.equal(h.controller.prepareArrival(1), false);
    assert.equal((await h.controller.arrive(1)).cancelled, true);
    assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
    assert.equal(h.tasks.size, 0);
  }
});

test('route inventory prunes nested content and ignores hidden or invalid native boxes', async () => {
  const h = harness({ count: 5 });
  h.elements[0].contains = (element) => element === h.elements[0] || element === h.elements[1];
  h.elements[1].top = 200;
  h.elements[2].top = 300;
  h.elements[2].hidden = true;
  h.elements[3].top = Number.NaN;
  h.elements[4].top = -400;
  h.controller.mount(h.root);
  const departing = h.controller.depart(1);
  assert.equal(h.controller.diagnostics().routeActive, 1);
  assert.equal(
    h.elements[1].attributes.get('data-route-block'),
    undefined,
    'ancestor is the sole shell'
  );
  h.controller.destroy();
  assert.equal((await departing).cancelled, true);
  assert.equal(h.tasks.size, 0);
  assert.equal(h.window.events.get('scroll').size, 0);
});

test('route DOM measurement failure returns a settled promise and diagnostic failure cannot retain content', async () => {
  const h = harness();
  h.elements[0].getBoundingClientRect = () => {
    throw Error('detached layout');
  };
  assert.equal((await h.controller.depart(1)).cancelled, true);
  assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
  assert.equal(h.tasks.size, 0);
  const observed = harness();
  observed.window.SiteEngineProbe = () => {
    throw Error('diagnostic observer');
  };
  observed.controller.prepareArrival(1);
  const arriving = observed.controller.arrive(1);
  observed.routeWatchdog();
  assert.equal((await arriving).completed, true);
  assert.equal(observed.root.attributes.get('data-route-blocks'), undefined);
  assert.equal(observed.tasks.size, 0);
});

test('boxless mobile hero groups animate their visible children and adapt when the viewport crosses the layout breakpoint', async () => {
  const h = harness({ heroDisplay: 'contents' });
  const departure = h.controller.depart(1);
  assert.equal(
    h.elements[0].attributes.get('data-route-block'),
    undefined,
    'boxless shell never suppresses ink'
  );
  for (const element of h.elements.slice(1, 7)) {
    assert.equal(
      element.attributes.get('data-route-block'),
      'departing',
      'mobile text and portrait move'
    );
  }
  h.controller.cancel();
  assert.equal((await departure).cancelled, true);
  h.controller.resume();
  h.elements[0].display = 'block';
  h.window.emit('resize');
  h.task(0);
  const grouped = h.controller.depart(-1);
  assert.equal(h.elements[0].attributes.get('data-route-block'), 'departing');
  assert.ok(h.elements.slice(1, 6).every((element) => !element.attributes.has('data-route-block')));
  h.controller.cancel();
  assert.equal((await grouped).cancelled, true);
  h.controller.resume();
  h.elements[0].display = 'contents';
  h.window.emit('resize');
  h.task(0);
  assert.ok(
    h.elements.slice(1, 6).every((element) => !element.attributes.has('data-scroll-entry')),
    'responsive regrouping never replays visible reading content'
  );
  h.controller.prepareArrival(1);
  const arrival = h.controller.arrive(1);
  for (const element of h.elements.slice(1, 7)) {
    assert.equal(element.attributes.get('data-route-block'), 'arriving');
  }
  h.window.emit('resize');
  assert.equal((await arrival).cancelled, true, 'mid-animation resize releases stale measurements');
  assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
});

test('route movement includes media extending outside the semantic shell visual envelope', async () => {
  for (const direction of [1, -1]) {
    const h = harness();
    const element = h.elements[0];
    element.children = [{ getBoundingClientRect: () => ({ top: 16, bottom: 600 }) }];
    const departure = h.controller.depart(direction);
    const exit = Number.parseFloat(element.styles.get('--route-block-distance'));
    assert.ok(
      direction > 0 ? 600 + exit < 0 : 16 + exit > 900,
      'oversized facets finish completely outside the viewport'
    );
    h.controller.cancel();
    assert.equal((await departure).cancelled, true);
    h.controller.prepareArrival(direction);
    const arrival = h.controller.arrive(direction);
    const entry = Number.parseFloat(element.styles.get('--route-block-distance'));
    assert.ok(
      direction > 0 ? 16 + entry > 900 : 600 + entry < 0,
      'oversized facets begin completely outside the viewport'
    );
    h.controller.cancel();
    assert.equal((await arrival).cancelled, true);
    assert.equal(h.tasks.size, 0);
  }
});

test('route blocks require clip support even when translate and CSS animation remain available', async () => {
  const h = harness({ clipSupported: false });
  assert.equal(h.state(1), 'waiting', 'bounded native reading still has its independent support');
  assert.equal((await h.controller.depart(1)).cancelled, true);
  assert.equal(h.controller.prepareArrival(1), false);
  assert.equal((await h.controller.arrive(1)).cancelled, true);
  assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
  assert.ok(h.elements.every((element) => !element.attributes.has('data-route-block')));
  assert.equal(h.tasks.size, 0);
});

test('route-only cleanup cancels transient promises without consuming below-fold reading entries', async () => {
  const h = harness();
  const departure = h.controller.depart(1);
  h.controller.cancelRoute();
  assert.equal((await departure).cancelled, true);
  assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
  h.controller.resume();
  assert.equal(h.state(1), 'waiting');
  h.controller.prepareArrival(1);
  const arrival = h.controller.arrive(1);
  h.routeWatchdog();
  assert.equal((await arrival).completed, true);
  h.controller.cancelRoute();
  h.controller.resume();
  assert.equal(h.state(1), 'waiting', 'normal navigation finally preserves unseen content');
  h.scroll(200);
  h.intersect([1]);
  assert.equal(h.state(1), 'entering');
  h.controller.cancelRoute();
  assert.equal(
    h.state(1),
    'entering',
    'route preference cleanup leaves ordinary active reading intact'
  );
  h.tick(700);
  h.root.emit('animationend', { animationName: 'scroll-entry-rise', target: h.elements[1] });
  assert.equal(h.state(1), undefined);
  h.controller.cancel();
  assert.equal(h.state(3), undefined, 'full fallback settlement remains distinct');
  assert.equal(h.tasks.size, 0);
});

test('route visual rows overlap within a shared phase while preserving native order in both directions', async () => {
  const cases = [390, 1440].flatMap((width) =>
    [1, -1].flatMap((direction) =>
      ['departing', 'arriving'].map((stage) => ({ width, direction, stage }))
    )
  );
  for (const { width, direction, stage } of cases) {
    const h = harness({ count: 4 });
    h.window.innerWidth = width;
    [500, 100, 100, 300].forEach((top, index) => {
      h.elements[index].top = top;
      h.elements[index].height = index === 2 ? 120 : 60;
    });
    h.elements[0].children = [{ getBoundingClientRect: () => ({ top: 100, bottom: 660 }) }];
    if (stage === 'arriving') h.controller.prepareArrival(direction, 9);
    const phase =
      stage === 'departing' ? h.controller.depart(direction, 9) : h.controller.arrive(direction, 9);
    assert.deepEqual(
      h.elements.map((element) => element.attributes.get('data-route-row')),
      ['2', '0', '0', '1'],
      'expanded media envelope never merges disjoint native rows'
    );
    const ordered = [h.elements[1], h.elements[3], h.elements[0]];
    if (direction < 0) ordered.reverse();
    let end = 0;
    const durationMs = 700;
    const stepMs = 150;
    for (const [order, element] of ordered.entries()) {
      const delay = Number.parseFloat(element.styles.get('--route-block-delay'));
      const duration = Number.parseFloat(element.styles.get('--route-block-duration'));
      assert.equal(delay, order * stepMs, 'each row follows the same directional wave');
      if (order) assert.ok(delay < end, 'next row starts before the previous row settles');
      assert.equal(duration, durationMs, 'each native row retains visible movement');
      end = delay + duration;
    }
    assert.equal(end, 1000, 'row count and viewport cannot extend the common phase');
    assert.equal(
      h.elements[1].styles.get('--route-block-delay'),
      h.elements[2].styles.get('--route-block-delay')
    );
    assert.equal(
      h.elements[1].styles.get('--route-block-distance'),
      h.elements[2].styles.get('--route-block-distance')
    );
    const upward = stage === 'departing' ? direction > 0 : direction < 0;
    const envelopes = [
      { top: 100, bottom: 220 },
      { top: 300, bottom: 360 },
      { top: 100, bottom: 660 },
    ];
    for (const element of h.elements) {
      const envelope = envelopes[Number(element.attributes.get('data-route-row'))];
      const distance = Number.parseFloat(element.styles.get('--route-block-distance'));
      assert.equal(
        distance,
        upward ? -(envelope.bottom + 32) : 900 - envelope.top + 32,
        'each row uses minimal clearance for its complete visual envelope'
      );
      const edge = upward
        ? { coordinate: envelope.bottom, outside: -32 }
        : { coordinate: envelope.top, outside: 932 };
      assert.equal(
        edge.coordinate + distance,
        edge.outside,
        'every row clears the correct viewport edge'
      );
    }
    assert.notEqual(
      h.elements[1].styles.get('--route-block-distance'),
      h.elements[3].styles.get('--route-block-distance'),
      'disjoint rows avoid a shared viewport-length flight'
    );
    const probe = h.probes.findLast(
      (probe) => probe.stage === (stage === 'departing' ? 'departure' : 'arrival')
    );
    assert.equal(probe.rows, 3);
    assert.equal(probe.rowDurationMs, durationMs);
    assert.equal(probe.rowStepMs, stepMs);
    assert.equal(probe.plannedDurationMs, end);
    assert.equal(probe.completedBy, null);
    assert.equal(probe.navigationId, 9);
    h.controller.cancelRoute();
    assert.equal((await phase).cancelled, true);
  }
});

test('queued or early animation events cannot finish a newer retained-node phase before its rows', async () => {
  const h = harness({ count: 2 });
  h.elements[1].top = 500;
  const previous = h.controller.depart(1, 40);
  h.tick(500);
  h.controller.cancelRoute();
  assert.equal((await previous).completedBy, 'cancelled');
  const current = h.controller.depart(1, 41);
  h.tick(200);
  h.root.emit('animationend', { animationName: 'route-block-depart', target: h.elements[0] });
  assert.equal(h.controller.diagnostics().routeStage, 'departing');
  h.tick(500);
  h.root.emit('animationend', { animationName: 'route-block-depart', target: h.elements[0] });
  h.root.emit('animationend', { animationName: 'route-block-depart', target: h.elements[1] });
  assert.equal(
    h.controller.diagnostics().routeStage,
    'departing',
    'later native row still owns its complete movement'
  );
  h.tick(300);
  h.root.emit('animationend', { animationName: 'route-block-depart', target: h.elements[1] });
  assert.equal((await current).completedBy, 'animationend');
  assert.equal(h.probes.at(-1).navigationId, 41);
  assert.equal(h.probes.at(-1).plannedDurationMs, 1000);
  h.controller.cancelRoute();
});

test('route phase completion identifies animation events, empty content, watchdog and cancellation', async () => {
  const animated = harness();
  const departure = animated.controller.depart(1, 21);
  animated.tick(1000);
  animated.root.emit('animationend', {
    animationName: 'route-block-depart',
    target: animated.elements[0],
  });
  assert.equal((await departure).completedBy, 'animationend');
  let completion = animated.probes.at(-1);
  assert.equal(completion.stage, 'holding');
  assert.equal(completion.phase, 'departure');
  assert.equal(completion.navigationId, 21);
  assert.equal(completion.plannedDurationMs, 1000);
  assert.equal(completion.completedBy, 'animationend');
  animated.controller.prepareArrival(1, 21);
  const arrival = animated.controller.arrive(1, 21);
  animated.tick(1000);
  animated.root.emit('animationend', {
    animationName: 'route-block-arrive',
    target: animated.elements[0],
  });
  assert.equal((await arrival).completedBy, 'animationend');
  completion = animated.probes.at(-1);
  assert.equal(completion.stage, 'settled');
  assert.equal(completion.phase, 'arrival');
  assert.equal(completion.navigationId, 21);
  assert.equal(completion.plannedDurationMs, 1000);
  assert.equal(completion.completedBy, 'animationend');
  const empty = harness({ count: 0 });
  assert.equal((await empty.controller.depart(1, 22)).completedBy, 'empty');
  assert.equal(empty.probes.at(-1).rows, 0);
  assert.equal(empty.probes.at(-1).plannedDurationMs, 0);
  empty.controller.cancelRoute();
  const watched = harness({ count: 5 });
  watched.elements.forEach((element, index) => {
    element.top = 100 + index * 120;
    element.height = 50;
  });
  const stalled = watched.controller.depart(-1, 23);
  watched.task(1600);
  assert.equal(watched.controller.diagnostics().routeStage, 'departing');
  assert.ok([...watched.tasks.values()].some((task) => task.delay === 2000));
  watched.routeWatchdog();
  assert.equal((await stalled).completedBy, 'watchdog');
  assert.equal(watched.probes.at(-1).plannedDurationMs, 1000);
  assert.equal(watched.probes.at(-1).completedBy, 'watchdog');
  watched.task(8000);
  assert.equal(watched.probes.at(-1).stage, 'cancelled');
  assert.equal(
    watched.probes.at(-1).completedBy,
    'watchdog',
    'stalled camera hold is separately identifiable'
  );
  const retargeted = watched.controller.depart(1, 24);
  watched.controller.cancelRoute();
  assert.equal((await retargeted).completedBy, 'cancelled');
  assert.equal(watched.probes.at(-1).navigationId, 24);
  assert.equal(watched.probes.at(-1).completedBy, 'cancelled');
});

test('the native-row limit preserves the fixed phase and falls back without hidden excess or orphan paint', async () => {
  const admitted = harness({ count: 24 });
  admitted.elements.forEach((element, index) => {
    element.top = 20 + index * 35;
    element.height = 16;
  });
  admitted.controller.prepareArrival(-1, 30);
  const arrival = admitted.controller.arrive(-1, 30);
  assert.equal(admitted.probes.at(-1).rows, 24);
  assert.equal(admitted.probes.at(-1).plannedDurationMs, 1000);
  assert.ok(
    admitted.elements.every((element) => element.styles.get('--route-block-duration') === '700ms')
  );
  assert.ok([...admitted.tasks.values()].some((task) => task.delay === 2000));
  admitted.task(8000);
  assert.equal(
    admitted.controller.diagnostics().routeStage,
    'arriving',
    'the independent hold deadline cannot terminate an arrival'
  );
  admitted.routeWatchdog();
  assert.equal((await arrival).completedBy, 'watchdog');
  assert.equal(admitted.root.attributes.get('data-route-blocks'), undefined);
  const rejected = harness({ count: 26 });
  rejected.elements.slice(0, 24).forEach((element, index) => {
    element.top = 20 + index * 32;
    element.height = 16;
  });
  rejected.elements[24].top = 950;
  const source = rejected.elements[25];
  source.top = 840;
  source.height = 800;
  source.borders = {
    'border-top-width': '1px',
    'border-top-style': 'solid',
    'border-top-color': 'rgb(20, 30, 40)',
  };
  source.contains = (node) => node === source || node === rejected.elements[24];
  rejected.elements[24].parentElement = source;
  rejected.root.querySelectorAll = (selector) =>
    selector.startsWith('.shift-intro,') ? [source] : rejected.elements.slice(0, 25);
  rejected.controller.mount(rejected.root);
  const result = await rejected.controller.depart(1, 31);
  assert.equal(result.completed, false);
  assert.equal(result.completedBy, 'fallback');
  assert.equal(rejected.probes.at(-1).attemptedRows, 25);
  assert.equal(
    rejected.probes.at(-1).plannedDurationMs,
    0,
    'native fallback receives no intended animation credit'
  );
  assert.equal(rejected.probes.at(-1).navigationId, 31);
  assert.equal(rejected.root.attributes.get('data-route-blocks'), undefined);
  assert.equal(source.children.length, 0, 'unattached isolated border shell is removed');
  assert.ok(rejected.elements.every((element) => !element.attributes.has('data-route-block')));
  assert.equal(rejected.tasks.size, 0);
});

test('separator layers preserve every native side and restore paint across hold, arrival and disposal', async () => {
  const h = harness();
  const element = h.elements[0];
  for (const side of ['top', 'right', 'bottom', 'left']) {
    element.borders[`border-${side}-width`] = side === 'top' ? '2px' : '1px';
    element.borders[`border-${side}-style`] = 'solid';
    element.borders[`border-${side}-color`] = 'rgb(10, 40, 70)';
  }
  const departure = h.controller.depart(-1);
  assert.equal(element.attributes.get('data-entry-border-source'), 'route');
  assert.equal(element.children.length, 4);
  for (const layer of element.children) {
    const side = layer.attributes.get('data-entry-separator');
    assert.equal(
      layer.styles.get('--entry-separator-width'),
      element.borders[`border-${side}-width`]
    );
    assert.equal(layer.styles.get('--entry-separator-color'), 'rgb(10, 40, 70)');
    assert.equal(
      layer.attributes.get('data-entry-border-owner'),
      element.attributes.get(`data-entry-border-${side}-owner`)
    );
  }
  h.routeWatchdog();
  assert.equal((await departure).completed, true);
  h.controller.prepareArrival(-1);
  const arrival = h.controller.arrive(-1);
  assert.equal(element.children.length, 4, 'held proxies are replaced instead of accumulating');
  assert.ok(
    element.children.every(
      (layer) => layer.styles.get('--entry-separator-color') === 'rgb(10, 40, 70)'
    ),
    'new phase reads restored native paint rather than suppressed transparent color'
  );
  h.routeWatchdog();
  assert.equal((await arrival).completed, true);
  assert.equal(element.children.length, 0);
  assert.equal(element.attributes.get('data-entry-border-source'), undefined);
  h.controller.destroy();
  assert.equal(element.attributes.size, 0);
});

test('repeat reading keeps shared ancestor side ownership and native paint while a sibling is armed', () => {
  const h = harness({ count: 4 });
  const [first, second] = h.elements;
  const source = h.elements[3];
  first.top = 1000;
  second.top = 1900;
  source.top = 950;
  source.height = 2000;
  source.contains = (node) => [source, first, second].includes(node);
  first.parentElement = source;
  second.parentElement = source;
  for (const side of ['top', 'bottom']) {
    source.borders[`border-${side}-width`] = '1px';
    source.borders[`border-${side}-style`] = 'solid';
    source.borders[`border-${side}-color`] = 'rgb(10, 40, 70)';
  }
  h.root.querySelectorAll = (selector) =>
    selector.startsWith('.shift-intro,') ? [source] : [first, second];
  h.controller.resume();
  assert.equal(first.children[0].attributes.get('data-entry-separator'), 'top');
  assert.equal(second.children[0].attributes.get('data-entry-separator'), 'bottom');
  for (let pass = 0; pass < 3; pass++) {
    h.scroll(200);
    h.intersect([0]);
    h.tick(700);
    h.root.emit('animationend', { animationName: 'scroll-entry-rise', target: first });
    h.scroll(0);
    h.leave([0]);
    assert.equal(first.children.length, 1, 'rearmed owner receives only its original native side');
    assert.equal(first.children[0].attributes.get('data-entry-separator'), 'top');
    assert.equal(first.children[0].styles.get('--entry-separator-color'), 'rgb(10, 40, 70)');
    assert.equal(second.children.length, 1, 'sibling retains its own bottom divider');
    assert.equal(second.children[0].attributes.get('data-entry-separator'), 'bottom');
    assert.equal(second.children[0].styles.get('--entry-separator-color'), 'rgb(10, 40, 70)');
    assert.notEqual(
      source.attributes.get('data-entry-border-top-owner'),
      source.attributes.get('data-entry-border-bottom-owner')
    );
  }
  for (const side of ['top', 'bottom']) source.borders[`border-${side}-color`] = 'rgb(70, 40, 10)';
  h.window.emit('resize');
  h.task(0);
  assert.ok(
    [first, second].every(
      (element) => element.children[0].styles.get('--entry-separator-color') === 'rgb(70, 40, 10)'
    ),
    'full reconciliation replaces retained models with current restored native paint'
  );
  h.controller.destroy();
  assert.equal(source.attributes.has('data-entry-border-source'), false);
  assert.equal(first.children.length, 0);
  assert.equal(second.children.length, 0);
});

test('visible isolated ancestor separators move without pulling unseen content into the phase', async () => {
  const h = harness({ count: 2 });
  h.elements[0].top = 950;
  const source = h.elements[1];
  source.top = 840;
  source.height = 800;
  source.borders = {
    'border-top-width': '1px',
    'border-top-style': 'solid',
    'border-top-color': 'rgb(20, 30, 40)',
  };
  source.contains = (node) => node === source || node === h.elements[0];
  h.elements[0].parentElement = source;
  h.root.querySelectorAll = (selector) =>
    selector.startsWith('.shift-intro,') ? [source] : [h.elements[0]];
  h.controller.mount(h.root);
  const departure = h.controller.depart(1);
  assert.equal(h.elements[0].attributes.get('data-route-block'), undefined);
  assert.equal(h.controller.diagnostics().routeActive, 1);
  assert.equal(source.children[0].attributes.get('data-entry-separator-shell'), '');
  assert.equal(source.children[0].attributes.get('data-route-block'), 'departing');
  h.controller.cancelRoute();
  assert.equal((await departure).cancelled, true);
  assert.equal(source.children.length, 0);
  assert.equal(source.attributes.get('data-entry-border-source'), undefined);
  h.controller.resume();
  assert.equal(
    h.elements[0].attributes.get('data-scroll-entry'),
    'waiting',
    'unseen reading eligibility stays intact'
  );
});

test('hidden bordered sources cannot create phantom separators or delay an empty route phase', async () => {
  const h = harness({ count: 2 });
  h.elements[0].top = 1000;
  h.elements[1].hidden = true;
  h.elements[1].top = 0;
  h.elements[1].borders = {
    'border-top-width': '1px',
    'border-top-style': 'solid',
    'border-top-color': 'rgb(20, 30, 40)',
  };
  const departure = h.controller.depart(1);
  assert.equal((await departure).completed, true);
  assert.equal(h.controller.diagnostics().routeActive, 0);
  assert.equal(h.elements[1].children.length, 0);
  assert.ok(
    [...h.tasks.values()].every((task) => task.delay !== 1600),
    'empty phase has no animation fallback wait'
  );
  h.controller.cancelRoute();
  assert.equal(h.tasks.size, 0);
});

test('the common block control cancels active work and preserves unread eligibility across toggles', async () => {
  const h = harness();
  h.scroll(200);
  h.intersect([1]);
  assert.equal(h.state(1), 'entering');
  h.preference(false);
  assert.equal(h.state(1), undefined, 'currently visible ink settles immediately');
  assert.equal(h.state(3), undefined, 'Off leaves unread content native');
  assert.equal(h.observers.at(-1).observed.size, 0);
  assert.equal(h.tasks.size, 0);
  h.preference(true);
  assert.equal(h.state(1), undefined, 'settled active content cannot replay');
  assert.equal(h.state(3), 'waiting', 'unread below-fold content becomes eligible again');
  h.controller.prepareArrival(1);
  const arriving = h.controller.arrive(1);
  h.preference(false);
  assert.equal((await arriving).cancelled, true, 'one control also releases route animations');
  assert.equal(h.root.attributes.get('data-route-blocks'), undefined);
  assert.equal(h.tasks.size, 0);
});

test('a stored Off preference survives motion readiness without consuming unread entries', () => {
  const h = harness({ ready: false, blockPreference: false });
  assert.equal(h.observers.length, 0);
  h.motion({ ready: true, enabled: true });
  assert.equal(h.state(3), undefined);
  h.preference(true);
  assert.equal(h.state(3), 'waiting', 'later On can observe untouched unread content');
  h.controller.destroy();
  assert.equal(h.tasks.size, 0);
});
