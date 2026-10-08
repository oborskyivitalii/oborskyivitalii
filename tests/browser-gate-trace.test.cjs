'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const { install, snapshot } = require('../tools/quality/browser-gate-trace.cjs');
const plain = (value) => JSON.parse(JSON.stringify(value));
function harness(options = {}) {
  let time = 0,
    id = 0;
  const pending = new Map(),
    requests = [],
    cancels = [],
    events = new Map();
  const scene = {
      dataset: { phase: '0', quality: '0', ready: 'true', route: 'index', travel: 'settled' },
    },
    control = {
      textContent: 'Motion: on',
      disabled: false,
      hidden: false,
      getAttribute: () => 'true',
    };
  const document = {
    hidden: false,
    visibilityState: 'visible',
    readyState: 'complete',
    body: { dataset: { page: 'index' } },
    hasFocus: () => true,
    querySelector: (selector) => (selector === '.space-scene' ? scene : control),
    addEventListener(name, fn) {
      events.set('document:' + name, fn);
    },
  };
  const window = {
    performance: { now: () => time },
    addEventListener(name, fn) {
      events.set('window:' + name, fn);
    },
    requestAnimationFrame(fn, ...args) {
      assert.equal(this, window, 'current RAF keeps its required window receiver');
      requests.push(args);
      if (options.requestError) throw options.requestError;
      if (typeof fn !== 'function') throw new TypeError('Native callback required');
      pending.set(++id, fn);
      return id;
    },
    cancelAnimationFrame(own, ...args) {
      assert.equal(this, window, 'current cancel keeps its required window receiver');
      cancels.push({ own, args });
      if (options.cancelError) throw options.cancelError;
      pending.delete(own);
      return 'native-cancel-result';
    },
  };
  if (options.probe) window.SiteEngineProbe = options.probe;
  if (options.scheduler) window.__browserGateScheduler = options.scheduler;
  const context = vm.createContext({ window, document });
  const get = () => plain(vm.runInContext('(' + snapshot.toString() + ')()', context));
  return {
    window,
    document,
    scene,
    control,
    pending,
    requests,
    cancels,
    events,
    get,
    install: () => vm.runInContext('(' + install.toString() + ')()', context),
    advance(amount) {
      time += amount;
    },
    fire(own) {
      const fn = pending.get(own);
      assert.ok(fn);
      pending.delete(own);
      return fn.call(window, time);
    },
    emit(surface, name) {
      const fn = events.get(surface + ':' + name);
      assert.ok(fn);
      fn({ type: name });
    },
  };
}
test('explicit serialized installation adds no RAF/timer work and is idempotent', () => {
  const h = harness();
  assert.equal(h.get().installed, false);
  assert.equal(h.get().completeRetention, false);
  const initial = h.install(),
    request = h.window.requestAnimationFrame,
    cancel = h.window.cancelAnimationFrame;
  assert.equal(initial.installed, true);
  assert.equal(h.window.SiteEngineStages, true);
  assert.equal(h.requests.length, 0);
  assert.equal(h.cancels.length, 0);
  assert.equal(h.pending.size, 0);
  h.install();
  assert.equal(h.window.requestAnimationFrame, request);
  assert.equal(h.window.cancelAnimationFrame, cancel);
  assert.equal(h.get().events.length, 1);
  assert.deepEqual(plain(h.window.__browserGateTrace.snapshot()), h.get());
});
test('RAF preserves native ID, receiver, arguments and exactly one callback while recording pending work', () => {
  const h = harness();
  h.install();
  let calls = 0;
  const own = h.window.requestAnimationFrame(function (timestamp) {
    assert.equal(this, h.window);
    assert.equal(timestamp, 42);
    calls++;
    h.advance(7);
    return 'callback-result';
  }, 'native-extra');
  assert.equal(own, 1);
  assert.deepEqual(h.requests, [['native-extra']]);
  assert.deepEqual(h.get().pendingIds, [own]);
  h.advance(42);
  assert.equal(h.fire(own), 'callback-result');
  assert.equal(calls, 1);
  assert.equal(h.requests.length, 1);
  assert.equal(h.pending.size, 0);
  assert.deepEqual(h.get().pendingIds, []);
  const trace = h.get().events.filter((event) => event.kind !== 'installed');
  assert.deepEqual(
    trace.map((event) => event.kind),
    ['request', 'entry', 'exit']
  );
  assert.ok(trace.every((event) => event.id === own && event.requestId === 1));
  assert.equal(trace[0].status, 'requested');
  assert.equal(trace[1].timestamp, 42);
  assert.equal(trace[2].duration, 7);
  assert.equal(trace[2].start, 42);
  assert.equal(trace[2].time, 49);
  assert.equal(trace[2].state.scene.phase, '0');
});
test('cancellation preserves current receiver and return value and does not invoke a cancelled callback', () => {
  const h = harness();
  h.install();
  let calls = 0;
  const own = h.window.requestAnimationFrame(() => calls++);
  assert.equal(h.window.cancelAnimationFrame(own, 'cancel-extra'), 'native-cancel-result');
  assert.equal(calls, 0);
  assert.equal(h.pending.size, 0);
  assert.deepEqual(h.get().pendingIds, []);
  assert.deepEqual(h.cancels, [{ own, args: ['cancel-extra'] }]);
  const event = h.get().events.at(-1);
  assert.equal(event.kind, 'cancel');
  assert.equal(event.id, own);
  assert.equal(event.status, 'cancelled');
  assert.deepEqual(event.state.pendingIds, [own]);
});
test('a callback can request its one next frame and the trace distinguishes delivered from outstanding IDs', () => {
  const h = harness();
  h.install();
  let calls = 0,
    next;
  const first = h.window.requestAnimationFrame(() => {
    calls++;
    next = h.window.requestAnimationFrame(() => calls++);
  });
  h.fire(first);
  assert.equal(calls, 1);
  assert.equal(h.requests.length, 2);
  assert.deepEqual(h.get().pendingIds, [next]);
  assert.deepEqual(h.get().events.at(-1).state.pendingIds, [next]);
  assert.equal(h.get().events.filter((event) => event.kind === 'entry').length, 1);
  h.fire(next);
  assert.equal(calls, 2);
  assert.deepEqual(h.get().pendingIds, []);
  assert.deepEqual(
    h
      .get()
      .events.filter((event) => event.kind === 'entry')
      .map((event) => event.id),
    [first, next]
  );
});
test('callback and native request/cancel exceptions retain their exact identity and raw failure evidence', () => {
  const callbackError = Error('Callback fault'),
    h = harness();
  h.install();
  const own = h.window.requestAnimationFrame(() => {
    h.advance(3);
    throw callbackError;
  });
  assert.throws(
    () => h.fire(own),
    (error) => error === callbackError
  );
  const exit = h.get().events.at(-1);
  assert.equal(exit.kind, 'exit');
  assert.equal(exit.duration, 3);
  assert.equal(exit.error.message, 'Callback fault');
  assert.deepEqual(h.get().pendingIds, []);
  const requestError = Error('Native request fault'),
    request = harness({ requestError });
  request.install();
  assert.throws(
    () => request.window.requestAnimationFrame(() => {}),
    (error) => error === requestError
  );
  assert.equal(request.get().events.at(-1).status, 'failed');
  assert.deepEqual(request.get().pendingIds, []);
  const cancelError = Error('Native cancel fault'),
    cancel = harness({ cancelError });
  cancel.install();
  const pending = cancel.window.requestAnimationFrame(() => {});
  assert.throws(
    () => cancel.window.cancelAnimationFrame(pending),
    (error) => error === cancelError
  );
  assert.equal(cancel.get().events.at(-1).status, 'failed');
  assert.deepEqual(cancel.get().pendingIds, [pending]);
  assert.throws(() => h.window.requestAnimationFrame(null), /Native callback required/);
  assert.equal(h.get().events.at(-1).status, 'failed');
});
test('lifecycle and existing engine probes preserve real private scheduler/frame data and exceptions', () => {
  let calls = 0,
    receiver;
  const probeError = Error('Existing probe fault');
  const h = harness({
    scheduler: () => ({ pending: 4, enabled: true, hold: false, slow: 7 }),
    probe: function (event) {
      receiver = this;
      calls++;
      if (event.kind === 'fault') throw probeError;
      return 'previous-probe-result';
    },
  });
  h.install();
  const frame = { kind: 'browser-gate-frame', renderCost: 28.75, slow: 7, tier: 0, hold: false };
  assert.equal(h.window.SiteEngineProbe(frame), 'previous-probe-result');
  assert.equal(receiver, h.window);
  assert.equal(calls, 1);
  h.scene.dataset.phase = '80';
  h.document.hidden = true;
  h.document.visibilityState = 'hidden';
  h.emit('document', 'visibilitychange');
  for (const name of ['beforeprint', 'afterprint', 'pageshow', 'pagehide', 'focus', 'blur', 'load'])
    h.emit('window', name);
  assert.throws(
    () => h.window.SiteEngineProbe({ kind: 'fault' }),
    (error) => error === probeError
  );
  assert.equal(calls, 2);
  const trace = h.get();
  assert.deepEqual(trace.events.find((event) => event.kind === 'engine-probe').probe, frame);
  assert.deepEqual(trace.state.scheduler, { pending: 4, enabled: true, hold: false, slow: 7 });
  const hidden = trace.events.find((event) => event.kind === 'visibilitychange');
  assert.equal(hidden.state.hidden, true);
  assert.equal(hidden.state.scene.phase, '80');
  assert.equal(hidden.state.motion.label, 'Motion: on');
  assert.ok(trace.events.some((event) => event.kind === 'pageshow'));
  assert.equal(trace.events.at(-1).probe.kind, 'fault');
});
test('a failing private diagnostic getter is visible without changing RAF callback behavior', () => {
  const h = harness({
    scheduler: () => {
      throw Error('Private getter fault');
    },
  });
  h.install();
  let calls = 0;
  const own = h.window.requestAnimationFrame(() => calls++);
  h.fire(own);
  assert.equal(calls, 1);
  assert.equal(h.get().state.schedulerError.message, 'Private getter fault');
  assert.equal(h.get().events.at(-1).state.schedulerError.message, 'Private getter fault');
});
test('the readonly scheduler object getter is read exactly once for each event and snapshot', () => {
  const h = harness();
  let reads = 0;
  Object.defineProperty(h.window, '__browserGateScheduler', {
    get() {
      reads++;
      return { pending: reads, enabled: true, printing: false, hold: false, slow: 0, tier: 0 };
    },
  });
  const installed = h.install();
  assert.equal(
    reads,
    2,
    'installation event plus its returned snapshot each access the getter once'
  );
  assert.equal(installed.events[0].state.scheduler.pending, 1);
  assert.equal(installed.state.scheduler.pending, 2);
  const own = h.window.requestAnimationFrame(() => {});
  assert.equal(reads, 3);
  h.fire(own);
  assert.equal(reads, 5, 'one access each for entry and exit');
  const trace = h.get();
  assert.equal(reads, 6);
  assert.equal(trace.events.at(-1).state.scheduler.pending, 5);
  assert.equal(trace.state.scheduler.pending, 6);
  assert.equal(trace.state.scheduler.printing, false);
});
test('bounded retention keeps first records and explicitly reports overflow while tracking all live pending IDs', () => {
  const h = harness();
  h.install();
  const first = h.get().events[0];
  let calls = 0;
  for (let i = 0; i < 8400; i++) {
    const own = h.window.requestAnimationFrame(() => calls++);
    h.fire(own);
  }
  const pending = h.window.requestAnimationFrame(() => calls++),
    trace = h.get();
  assert.equal(calls, 8400);
  assert.equal(trace.recordedEvents, 25000);
  assert.equal(trace.events.length, 25000);
  assert.equal(trace.totalEvents, 25202);
  assert.equal(trace.droppedEvents, 202);
  assert.equal(trace.overflow, true);
  assert.equal(trace.completeRetention, false);
  assert.deepEqual(trace.events[0], first);
  assert.equal(trace.events[1].requestId, 1);
  assert.equal(trace.events.at(-1).sequence, 25000);
  assert.deepEqual(trace.pendingIds, [pending]);
  h.window.cancelAnimationFrame(pending);
  assert.deepEqual(h.get().pendingIds, []);
  assert.equal(h.get().droppedEvents, 203);
});
