'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../tools/quality/functional.cjs'), 'utf8');
const begin = source.indexOf('async function navigateDocument('),
  end = source.indexOf('\nasync function settled(', begin);
assert.ok(begin >= 0 && end > begin, 'real functional fixture helpers must be present');
const helpersSource = source.slice(begin, end);
const plain = (value) => JSON.parse(JSON.stringify(value));
function criticalJourneyPage(defect) {
  const css =
    '\n' + fs.readFileSync(path.join(__dirname, '../site/engine/critical-media.css'), 'utf8');
  let page = 'index',
    blocks = [{ textContent: css }],
    outside = [],
    imageWidth = 304;
  const history = ['index'],
    events = [];
  const document = {
    body: { dataset: { page } },
    documentElement: { scrollWidth: 320 },
    head: { querySelectorAll: () => blocks },
    querySelectorAll: () => [...blocks, ...outside],
    querySelector: (selector) =>
      selector === 'img.portrait-media'
        ? page === 'index'
          ? { getBoundingClientRect: () => ({ width: imageWidth }) }
          : null
        : { hasAttribute: () => false },
  };
  const context = vm.createContext({
    assert,
    fs,
    path,
    document,
    window: {},
    innerWidth: 320,
    __dirname: path.join(__dirname, '../tools/quality'),
  });
  const start = source.indexOf('async function criticalMediaJourney('),
    finish = source.indexOf('\nasync function failure(', start);
  assert.ok(start >= 0 && finish > start);
  const run = vm.runInContext('(' + source.slice(start, finish) + ')', context);
  function mount(route) {
    page = route;
    document.body.dataset.page = route;
    blocks = route === 'index' ? [{ textContent: css }] : [];
    if (route === 'index') {
      if (defect === 'missing') blocks = [];
      if (defect === 'duplicate') blocks.push({ textContent: css });
      if (defect === 'changed') blocks[0].textContent = css.replace('100%', '780px');
      if (defect === 'outside') outside = [{ textContent: css }];
      if (defect === 'intrinsic-width') imageWidth = 780;
      if (defect === 'overflow') document.documentElement.scrollWidth = 780;
    }
    if (defect === 'document-replaced') delete context.window.__criticalMediaDocument;
    events.push(route);
  }
  return {
    run,
    events,
    page: {
      evaluate: async (fn) => fn(),
      locator(selector) {
        const route = selector.includes('"./"') ? 'index' : 'research';
        return {
          evaluate: async (fn) =>
            fn({
              click() {
                history.push(route);
                mount(route);
              },
            }),
        };
      },
      async waitForFunction(fn, route, options) {
        assert.deepEqual(plain(options), { polling: 40, timeout: 6000 });
        if (!fn(route)) throw Error('Controlled CSS-unavailable route deadline');
      },
      async goBack() {
        if (defect === 'no-back') return;
        history.pop();
        mount(history.at(-1));
      },
    },
  };
}
test('CSS-unavailable fixture observes route-owned critical media through real click and Back steps', async () => {
  const h = criticalJourneyPage(),
    result = plain(await h.run(h.page));
  assert.deepEqual(h.events, ['research', 'index', 'research', 'index']);
  assert.deepEqual(
    result.states.map((row) => row.page),
    h.events
  );
  assert.equal(result.history, true);
  assert.equal(result.documentPreserved, true);
  assert.ok(result.states.every((row) => row.documentPreserved));
  assert.deepEqual(
    result.states.map((row) => row.criticalMedia.length),
    [0, 1, 0, 1]
  );
  assert.deepEqual(
    result.states.map((row) => row.criticalMediaOutsideHead),
    [0, 0, 0, 0]
  );
});
test('CSS-unavailable fixture fails missing, duplicate, changed, misplaced and overflowing media or a lost journey', async () => {
  for (const defect of [
    'missing',
    'duplicate',
    'changed',
    'outside',
    'intrinsic-width',
    'overflow',
    'document-replaced',
    'no-back',
  ]) {
    const h = criticalJourneyPage(defect);
    await assert.rejects(h.run(h.page), undefined, defect);
  }
});
test('complete engine leases run serially and a failed engine does not suppress later engines', async () => {
  const begin = source.indexOf('async function serialEngines('),
    end = source.indexOf('\nasync function runEngine(', begin);
  const run = vm.runInNewContext('(' + source.slice(begin, end) + ')');
  let active = 0,
    maxActive = 0;
  const seen = [],
    fault = Error('Firefox failure');
  const results = await run(['chromium', 'firefox', 'webkit'], async (engine) => {
    active++;
    maxActive = Math.max(maxActive, active);
    seen.push(engine);
    await Promise.resolve();
    active--;
    if (engine === 'firefox') throw fault;
  });
  assert.equal(maxActive, 1);
  assert.deepEqual(seen, ['chromium', 'firefox', 'webkit']);
  assert.deepEqual(plain(results.map((row) => row.status)), ['fulfilled', 'rejected', 'fulfilled']);
  assert.equal(results[1].reason, fault);
});
function helpers() {
  let time = 0;
  const scene = { dataset: { camera: 'opening', phase: '0', quality: 'full', ready: 'true' } },
    motion = { textContent: 'Motion: on', hidden: false, disabled: false },
    attached = new Set();
  const context = vm.createContext({
    assert,
    window: { __quality: { paints: 0, callbacks: 0 } },
    document: {
      hidden: false,
      visibilityState: 'visible',
      hasFocus: () => true,
      querySelector: (selector) =>
        selector === '.space-scene'
          ? attached.has(selector) && scene
          : selector === '#space-motion'
            ? attached.has(selector) && motion
            : attached.has(selector) && {},
    },
    performance: { now: () => time },
    scrollY: 0,
    state: async (page) => page.snapshot(),
  });
  const methods = vm.runInContext(
    helpersSource +
      '\n({navigateDocument,forwardCamera,forwardCameraResponded,nextPaintReady,nextPaintSample})',
    context
  );
  return {
    ...methods,
    context,
    scene,
    motion,
    attached,
    time: () => time,
    setTime: (value) => (time = value),
    snapshot: () => ({
      scrollY: context.scrollY,
      camera: scene.dataset.camera,
      phase: scene.dataset.phase,
      quality: scene.dataset.quality,
      ready: scene.dataset.ready === 'true',
      paints: context.window.__quality.paints,
      callbacks: context.window.__quality.callbacks,
      forwardResponse: context.window.__forwardCameraResponse
        ? plain(context.window.__forwardCameraResponse)
        : null,
    }),
  };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function cssPage(
  h,
  { attachAt = () => 0, domError, paintAfterHold = false, navigationError } = {}
) {
  const load = deferred(),
    events = [];
  let released = false,
    finished = false;
  const page = {
    snapshot() {
      events.push({ kind: 'state', time: h.time() });
      return h.snapshot();
    },
    goto(url, options) {
      events.push({ kind: 'goto', url, options: plain(options) });
      return load.promise;
    },
    async waitForFunction(fn, arg, options) {
      assert.deepEqual(plain(options), { polling: 50, timeout: 3000 });
      if (domError) throw domError;
      for (let elapsed = 0; elapsed <= options.timeout; elapsed += options.polling) {
        h.setTime(elapsed);
        for (const selector of ['.space-scene', '#space-motion', 'main', 'footer'])
          if (elapsed >= attachAt(selector)) h.attached.add(selector);
        const result = Boolean(fn(arg));
        events.push({ kind: 'dom', time: elapsed, attached: [...h.attached], ready: result });
        if (result) return;
      }
      throw Error('Controlled DOM deadline');
    },
    async waitForTimeout(delay) {
      events.push({ kind: 'hold', delay });
      h.setTime(h.time() + delay);
      if (paintAfterHold) h.context.window.__quality.paints++;
    },
  };
  function release() {
    if (released) return;
    released = true;
    events.push({ kind: 'release', time: h.time() });
    queueMicrotask(() => {
      finished = true;
      if (navigationError) load.reject(navigationError);
      else load.resolve();
    });
  }
  return { page, events, load, release, released: () => released, finished: () => finished };
}
test('held CSS waits for the actual scene, controls and document before both no-paint assertions', async () => {
  const h = helpers(),
    attachment = { '.space-scene': 0, '#space-motion': 50, main: 100, footer: 150 };
  const fixture = cssPage(h, { attachAt: (selector) => attachment[selector] });
  await h.navigateDocument(fixture.page, 'https://owned.invalid/writing.html', fixture.release);
  assert.deepEqual(
    fixture.events.filter((event) => event.kind === 'dom').map((event) => event.ready),
    [false, false, false, true]
  );
  assert.deepEqual(
    fixture.events.filter((event) => event.kind === 'state').map((event) => event.time),
    [150, 350]
  );
  assert.deepEqual(
    fixture.events.filter((event) => event.kind === 'hold'),
    [{ kind: 'hold', delay: 200 }]
  );
  assert.equal(fixture.events.find((event) => event.kind === 'release').time, 350);
  assert.equal(
    fixture.finished(),
    true,
    'CSS navigation has finished before the caller can close its context'
  );
  assert.deepEqual(fixture.events[0], {
    kind: 'goto',
    url: 'https://owned.invalid/writing.html',
    options: { waitUntil: 'load' },
  });
});
test('missing DOM is a bounded failure and still releases and drains the held navigation', async () => {
  const h = helpers(),
    fixture = cssPage(h, { attachAt: (selector) => (selector === 'footer' ? Infinity : 0) });
  await assert.rejects(
    h.navigateDocument(fixture.page, 'https://owned.invalid/research.html', fixture.release),
    /Controlled DOM deadline/
  );
  assert.equal(h.time(), 3000);
  assert.equal(fixture.events.filter((event) => event.kind === 'dom').length, 61);
  assert.equal(
    fixture.events.some((event) => event.kind === 'state'),
    false
  );
  assert.equal(fixture.released(), true);
  assert.equal(fixture.finished(), true);
});
test('painting either before valid CSS or during its hold remains a failure with navigation cleanup', async () => {
  for (const paintAfterHold of [false, true]) {
    const h = helpers(),
      fixture = cssPage(h, { paintAfterHold });
    if (!paintAfterHold) h.context.window.__quality.paints = 1;
    await assert.rejects(
      h.navigateDocument(fixture.page, 'https://owned.invalid/research.html', fixture.release),
      paintAfterHold ? /no paint throughout the held CSS request/ : /no paint before valid CSS/
    );
    assert.equal(fixture.released(), true);
    assert.equal(fixture.finished(), true);
    assert.equal(
      fixture.events.some((event) => event.kind === 'hold'),
      paintAfterHold
    );
  }
});
test('an early DOM failure handles a later goto rejection and awaits it before returning', async () => {
  const h = helpers(),
    domError = Error('DOM did not attach'),
    closed = Error('Target page, context or browser has been closed'),
    load = deferred();
  let released = false,
    returned = false,
    drained = false;
  const page = {
    goto: () => load.promise,
    waitForFunction: async () => {
      throw domError;
    },
  };
  const pending = h
    .navigateDocument(page, 'https://owned.invalid/credits.html', () => {
      released = true;
    })
    .then(
      () => {
        returned = true;
      },
      (error) => {
        returned = true;
        assert.equal(error, domError);
      }
    );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(released, true);
  assert.equal(returned, false, 'failure cannot return while goto remains pending');
  load.promise.then(
    () => {
      drained = true;
    },
    () => {
      drained = true;
    }
  );
  load.reject(closed);
  await pending;
  assert.equal(drained, true);
  assert.equal(returned, true);
  // A real event-loop turn exposes any unhandled goto rejection to node:test.
  await new Promise((resolve) => setImmediate(resolve));
});
test('a failed actual navigation is still reported after releasing CSS, and ordinary navigation skips its hold', async () => {
  const h = helpers(),
    navigationError = Error('Navigation timed out'),
    fixture = cssPage(h, { navigationError });
  await assert.rejects(
    h.navigateDocument(fixture.page, 'https://owned.invalid/index.html', fixture.release),
    (error) => error === navigationError
  );
  assert.equal(fixture.released(), true);
  assert.equal(fixture.finished(), true);
  let calls = 0;
  await h.navigateDocument(
    {
      goto: async () => {
        calls++;
      },
    },
    'https://owned.invalid/talks.html'
  );
  assert.equal(calls, 1);
  await assert.rejects(
    h.navigateDocument(
      {
        goto: async () => {
          throw navigationError;
        },
      },
      'https://owned.invalid/talks.html'
    ),
    (error) => error === navigationError
  );
});
function cameraPage(h, change) {
  h.attached.add('.space-scene');
  return {
    snapshot: () => h.snapshot(),
    evaluate: async (fn, arg) => fn(arg),
    async waitForFunction(fn, arg, options) {
      assert.deepEqual(plain(options), { polling: 50, timeout: 2000 });
      for (let elapsed = 0; elapsed <= options.timeout; elapsed += options.polling) {
        h.setTime(elapsed);
        change(elapsed, h);
        if (fn(arg)) return;
      }
      throw Error('Controlled forward response deadline');
    },
  };
}
test('native forward response waits for the scroll target while preserving the fixed camera', async () => {
  const h = helpers(),
    travel = { range: 9000, target: 2400, y: 0 };
  const page = cameraPage(h, (time, current) => {
    current.context.scrollY = time < 200 ? 1200 : 2400;
    current.scene.dataset.camera = time < 450 ? 'unsettled' : 'opening';
  });
  const result = await h.forwardCamera(page, 'opening', travel),
    probe = result.forwardResponse;
  assert.equal(result.camera, 'opening');
  assert.equal(result.scrollY, 2400);
  assert.equal(probe.status, 'responded');
  assert.equal(probe.timeoutMs, 2000);
  assert.equal(probe.elapsedMs, 450);
  assert.equal(probe.baseline, 'opening');
  assert.deepEqual(probe.travel, travel);
  assert.equal(probe.samples.length, 10);
  assert.equal(probe.samples[0].y, 1200);
  assert.equal(probe.samples[0].camera, 'unsettled');
  assert.equal(probe.samples.at(-1).camera, 'opening');
});
test('wrong native target or scroll-driven camera movement never passes, retaining deadline samples', async () => {
  for (const defect of ['target', 'camera']) {
    const h = helpers(),
      page = cameraPage(h, (time, current) => {
        current.context.scrollY = defect === 'target' ? 2398 : 2400;
        current.scene.dataset.camera = defect === 'camera' ? 'journey' : 'opening';
        current.context.window.__quality.paints = time / 50;
      });
    await assert.rejects(
      h.forwardCamera(page, 'opening', { range: 9000, target: 2400, y: 2400 }),
      /Controlled forward response deadline/
    );
    const probe = plain(h.context.window.__forwardCameraResponse);
    assert.equal(h.time(), 2000);
    assert.equal(probe.status, 'failed');
    assert.match(probe.error, /forward response deadline/);
    assert.equal(probe.timeoutMs, 2000);
    assert.equal(probe.samples.length, 41);
    assert.equal(probe.samples[0].time, 0);
    assert.equal(probe.samples.at(-1).time, 2000);
    assert.equal(probe.samples.at(-1).paints, 40);
    assert.equal(probe.samples.at(-1).y, defect === 'target' ? 2398 : 2400);
    assert.equal(probe.samples.at(-1).camera, defect === 'camera' ? 'journey' : 'opening');
  }
});
test('forward response allows native subpixel rounding but does not demand travel on a short page', async () => {
  const h = helpers(),
    page = cameraPage(h, (_time, current) => {
      current.context.scrollY = 2400.75;
      current.scene.dataset.camera = 'opening';
    });
  assert.equal(
    (await h.forwardCamera(page, 'opening', { range: 9000, target: 2400 })).forwardResponse.status,
    'responded'
  );
  const short = helpers();
  short.attached.add('.space-scene');
  const result = await short.forwardCamera({ snapshot: () => short.snapshot() }, 'opening', {
    range: 1,
    target: 1,
  });
  assert.equal(result.camera, 'opening');
  assert.equal(result.forwardResponse, null);
});
function paintPage(h, change) {
  h.attached.add('.space-scene');
  h.attached.add('#space-motion');
  return {
    snapshot: () => h.snapshot(),
    evaluate: async (fn, arg) => fn(arg),
    async waitForFunction(fn, arg, options) {
      assert.deepEqual(plain(options), { polling: 50, timeout: 1500 });
      for (let elapsed = 0; elapsed <= options.timeout; elapsed += options.polling) {
        h.setTime(elapsed);
        change(elapsed, h);
        if (fn(arg)) return;
      }
      throw Error('Controlled next-paint deadline after 1500ms');
    },
  };
}
test('next-paint observation waits for an actual late paint without changing the 1500ms budget', async () => {
  const h = helpers();
  h.context.window.__quality = { paints: 1, callbacks: 1 };
  const before = h.snapshot();
  const page = paintPage(h, (time, current) => {
    if (time >= 450) {
      current.context.window.__quality.paints = 2;
      current.context.window.__quality.callbacks = 2;
      current.scene.dataset.phase = '.45';
    }
  });
  await h.nextPaintReady(page, before);
  const probe = plain(h.context.window.__nextPaintObserver);
  assert.equal(probe.status, 'painted');
  assert.equal(probe.elapsedMs, 450);
  assert.equal(probe.timeoutMs, 1500);
  assert.deepEqual(probe.baseline, before);
  assert.equal(probe.samples.length, 10);
  assert.equal(probe.samples[0].paints, 1);
  assert.equal(probe.samples.at(-1).paints, 2);
  assert.equal(probe.samples.at(-1).time, 450);
  assert.ok(probe.samples.every((sample) => sample.camera === 'opening'));
});
test('ready visible focused phase-zero with only its initial paint fails at 1500ms and retains all observations', async () => {
  const h = helpers();
  h.context.window.__quality = { paints: 1, callbacks: 1 };
  const before = h.snapshot();
  const page = paintPage(h, () => {});
  await assert.rejects(
    h.nextPaintReady(page, before),
    /Controlled next-paint deadline after 1500ms/
  );
  const probe = plain(h.context.window.__nextPaintObserver);
  assert.equal(h.time(), 1500);
  assert.equal(probe.status, 'failed');
  assert.match(probe.error, /1500ms/);
  assert.equal(probe.timeoutMs, 1500);
  assert.deepEqual(probe.baseline, before);
  assert.equal(probe.samples.length, 31);
  assert.equal(probe.samples[0].time, 0);
  assert.equal(probe.samples.at(-1).time, 1500);
  for (const sample of probe.samples) {
    assert.equal(sample.paints, 1);
    assert.equal(sample.callbacks, 1);
    assert.equal(sample.phase, '0');
    assert.equal(sample.ready, true);
    assert.equal(sample.hidden, false);
    assert.equal(sample.visibility, 'visible');
    assert.equal(sample.focus, true);
    assert.equal(sample.motion, 'Motion: on');
    assert.equal(sample.y, 0);
  }
});
test('RAF callbacks or a changed phase cannot fabricate a positive paint observation', async () => {
  for (const paints of [0, 1, undefined, NaN]) {
    const h = helpers();
    h.context.window.__quality = { paints: 1, callbacks: 1 };
    const before = h.snapshot();
    const page = paintPage(h, (time, current) => {
      current.context.window.__quality.paints = paints;
      current.context.window.__quality.callbacks = 1 + time / 50;
      current.scene.dataset.phase = String(time / 50);
    });
    await assert.rejects(
      h.nextPaintReady(page, before),
      /Controlled next-paint deadline after 1500ms/
    );
    const probe = plain(h.context.window.__nextPaintObserver);
    assert.equal(probe.status, 'failed');
    assert.equal(probe.samples.length, 31);
    assert.equal(probe.samples.at(-1).callbacks, 31);
    assert.equal(probe.samples.at(-1).phase, '30');
    assert.equal(probe.samples.at(-1).paints, Number.isNaN(paints) ? null : paints);
  }
});
test('scenario tracing is explicit and its installation does not schedule extra RAF work', async () => {
  const setupStart = source.indexOf('function probe('),
    setupEnd = source.indexOf('async function state(page)');
  assert.ok(setupStart >= 0 && setupEnd > setupStart, 'actual diagnostic setup boundaries');
  const setupSource = source.slice(setupStart, setupEnd);
  const scenarioSource = source.slice(
    source.indexOf('async function scenario('),
    source.indexOf('\nfunction scenarios(', source.indexOf('async function scenario('))
  );
  for (const trace of [undefined, false, true]) {
    let requests = 0,
      traceLoads = 0,
      closed = false;
    const window = {
      performance: { now: () => 0 },
      requestAnimationFrame() {
        requests++;
        return requests;
      },
      cancelAnimationFrame() {},
      addEventListener() {},
    };
    const document = {
      hidden: false,
      visibilityState: 'visible',
      readyState: 'complete',
      hasFocus: () => true,
      body: { dataset: { page: 'index' } },
      querySelector: () => null,
      addEventListener() {},
    };
    const context = vm.createContext({
      assert,
      window,
      document,
      process: { env: {} },
      localStorage: { setItem() {} },
      CanvasRenderingContext2D: class CanvasRenderingContext2D {
        clearRect() {}
      },
      normal: async () => ({ positiveProbe: true }),
      failure: async () => ({}),
      navigateDocument: async () => {},
      state: async () => null,
      path,
      out: '/unused',
      require(name) {
        assert.equal(name, './browser-gate-trace.cjs');
        traceLoads++;
        return require('../tools/quality/browser-gate-trace.cjs');
      },
    });
    vm.runInContext(setupSource, context);
    const scenario = vm.runInContext('(' + scenarioSource + ')', context);
    const page = { on() {}, evaluate: async (fn) => fn() },
      ctx = {
        addInitScript: async ({ content }) => vm.runInContext(content, context),
        newPage: async () => page,
        close: async () => {
          closed = true;
        },
      };
    const result = await scenario({ newContext: async () => ctx }, 'https://owned.invalid', {
      engine: 'webkit',
      route: 'index',
      width: 1440,
      theme: 'light',
      mode: 'normal',
      ...(trace === undefined ? {} : { trace }),
    });
    assert.equal(result.pass, true);
    assert.equal(closed, true);
    assert.equal(requests, 0, 'diagnostics may not create animation work');
    assert.equal(traceLoads, trace === true ? 1 : 0);
    assert.equal(typeof window.__browserGateTrace, trace === true ? 'object' : 'undefined');
    assert.equal(result.diagnosticTrace?.installed, trace === true ? true : undefined);
    if (trace === true) assert.equal(result.diagnosticTrace.events[0].kind, 'installed');
  }
});
