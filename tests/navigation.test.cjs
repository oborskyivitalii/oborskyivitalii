'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../site/engine/navigation.js'), 'utf8');
const section = (name, next) => {
  const start = source.indexOf('  function ' + name + '('),
    end = source.indexOf('  function ' + next + '(', start);
  assert.ok(start >= 0 && end > start, 'missing authored navigation boundary ' + name);
  return source.slice(start, end);
};
const flightSource = section('flight', 'mount'),
  interruptSource = section('interrupt', 'motionAllowed');
const finishSource = source.match(/^ {2}function finishText\s*\(\s*\)\s*\{[\s\S]*?^ {2}\}/m)[0];
function harness(options = {}) {
  const tasks = new Map(),
    presented = [],
    commits = [],
    probes = [],
    sceneCalls = [];
  let timer = 0,
    clock = 10,
    callback = null,
    route = 'research',
    throwCommit = false,
    clearCount = 0,
    detachCount = 0;
  const content = { inert: false, style: {}, removeAttribute() {} };
  const presentation = options.base
    ? null
    : {
        mountAt: 0.5,
        canTravel: () => true,
        present(progress, direction) {
          presented.push({ progress, direction, route });
          if (progress === 1 && options.tail) return options.tail();
        },
      };
  const window = {
    setTimeout(fn, delay) {
      assert.equal(delay, 0);
      const id = ++timer;
      tasks.set(id, fn);
      return id;
    },
    clearTimeout(id) {
      tasks.delete(id);
    },
    SiteEngineProbe: options.probe === false ? null : (event) => probes.push(event),
  };
  window.SiteScene = options.noScene
    ? null
    : {
        navigate(next, animate, update, landing) {
          sceneCalls.push({ next, animate, landing });
          callback = update;
          update(animate ? 0 : 1);
        },
        detachTravel() {
          detachCount++;
        },
      };
  const context = {
    window,
    document: { querySelector: () => ({ dataset: { direction: 'forward' } }) },
    content,
    presentation,
    performance: { now: () => clock++ },
    clearText() {
      clearCount++;
      content.inert = false;
    },
    releaseEndpoint() {},
    releaseTail() {},
    Promise,
  };
  vm.runInNewContext(
    `let serial=1,transition=null,request={abort(){}},warmRequest=null,warmAgain=false;${interruptSource}${flightSource}${finishSource}
    globalThis.api={start(next='writing',animate=true,landing=null){return flight(next,animate,()=>{commitHook(next);},serial,presentation?{opacity:1,z:0}:1,landing);},interrupt(){serial++;return interrupt();},finishText,transition:()=>transition,serial:()=>serial};`,
    context
  );
  context.commitHook = (next) => {
    if (throwCommit) throw Error('native mount failed');
    commits.push(next);
    route = next;
  };
  return {
    api: context.api,
    content,
    tasks,
    presented,
    commits,
    probes,
    sceneCalls,
    progress: (progress, snapshot = null) => callback(progress, snapshot),
    task() {
      const [id, fn] = tasks.entries().next().value || [];
      assert.ok(fn, 'expected queued mount');
      tasks.delete(id);
      fn();
    },
    captureTask() {
      return tasks.values().next().value;
    },
    failCommit() {
      throwCommit = true;
    },
    clears: () => clearCount,
    detaches: () => detachCount,
  };
}
test('navigation flight forwards native endpoint, history and fragment landing intent to the scene', async () => {
  for (const landing of [
    { position: 'end', hash: '' },
    { position: [0, 7050], hash: '' },
    { position: null, hash: '#topics' },
    { position: 'end', hash: '', search: '?topic=leadership' },
  ]) {
    const h = harness(),
      promise = h.api.start('writing', true, landing);
    assert.equal(h.sceneCalls.length, 1);
    assert.equal(h.sceneCalls[0].next, 'writing');
    assert.equal(h.sceneCalls[0].animate, true);
    assert.equal(
      h.sceneCalls[0].landing,
      landing,
      'the renderer receives the exact native landing request before its first paint'
    );
    h.progress(0.56);
    assert.deepEqual(h.commits, []);
    h.task();
    h.progress(1);
    await promise;
    assert.deepEqual(h.commits, ['writing']);
  }
});
test('animated Color yields the completed camera paint before native mount, with no second animation clock', async () => {
  const h = harness(),
    promise = h.api.start();
  let settled = false;
  promise.then(() => (settled = true));
  h.progress(0.56);
  assert.deepEqual(h.commits, []);
  assert.equal(h.tasks.size, 1);
  assert.equal(
    h.presented.at(-1).progress,
    0.5,
    'old DOM stays hidden if painted progress overshoots midpoint'
  );
  h.progress(0.63);
  assert.equal(h.tasks.size, 1, 'only one native task per flight');
  h.task();
  assert.deepEqual(h.commits, ['writing']);
  assert.equal(
    h.presented.at(-1).progress,
    0.63,
    'new plane resumes the latest painted camera pose'
  );
  assert.equal(settled, false);
  assert.equal(h.probes.length, 1);
  assert.equal(h.probes[0].kind, 'navigation-task');
  assert.ok(h.probes[0].duration > 0);
  h.progress(1);
  await promise;
  assert.equal(h.tasks.size, 0);
  assert.equal(h.api.transition(), null);
  assert.equal(h.content.inert, false);
  assert.doesNotMatch(flightSource, /requestAnimationFrame/);
});
test('retarget cancellation prevents even an already captured stale task from mounting old content', async () => {
  const h = harness(),
    old = h.api.start();
  h.progress(0.5);
  const stale = h.captureTask();
  assert.equal(h.api.interrupt(), true);
  await old;
  assert.equal(h.tasks.size, 0);
  assert.deepEqual(h.commits, []);
  assert.equal(h.api.transition(), null);
  const latest = h.api.start('talks');
  h.progress(0.5);
  stale();
  assert.deepEqual(h.commits, [], 'stale leased callback never writes a route');
  assert.notEqual(h.api.transition(), null, 'stale callback never clears the new flight');
  h.task();
  h.progress(1);
  await latest;
  assert.deepEqual(h.commits, ['talks']);
});
test('Off/reduced/hidden/print completion flushes pending mount before the navigation promise resolves', async () => {
  for (const reason of ['off', 'reduced', 'hidden', 'print']) {
    const h = harness(),
      promise = h.api.start();
    h.progress(0.5);
    const stale = h.captureTask();
    h.api.finishText();
    assert.deepEqual(h.commits, ['writing'], reason);
    assert.equal(h.tasks.size, 0);
    assert.equal(h.content.inert, false);
    await promise;
    stale();
    assert.deepEqual(h.commits, ['writing'], 'flush remains exactly once');
  }
});
test('instant Color and missing Canvas retain synchronous native route mounting', async () => {
  for (const options of [{}, { noScene: true }]) {
    const h = harness(options),
      promise = h.api.start('writing', false);
    assert.deepEqual(h.commits, ['writing']);
    assert.equal(h.tasks.size, 0);
    await promise;
    assert.equal(h.api.transition(), null);
  }
});
test('base native midpoint remains synchronous and does not inherit Color task policy', async () => {
  const h = harness({ base: true }),
    promise = h.api.start();
  h.progress(0.17);
  assert.deepEqual(h.commits, []);
  h.progress(0.18);
  assert.deepEqual(h.commits, ['writing']);
  assert.equal(h.tasks.size, 0);
  h.progress(1);
  await promise;
});
test('queued mount failure rejects the flight and detaches its callback without a leftover route task', async () => {
  const h = harness(),
    promise = h.api.start();
  h.progress(0.5);
  h.failCommit();
  const rejected = assert.rejects(promise, /native mount failed/);
  h.task();
  await rejected;
  assert.deepEqual(h.commits, []);
  assert.equal(h.tasks.size, 0);
  assert.equal(h.api.transition(), null);
  assert.ok(h.detaches() > 0);
  assert.equal(h.probes.length, 1, 'failed native work remains in opt-in inclusive task evidence');
});
test('jump directly to arrival commits synchronously rather than waiting on a throttled timer', async () => {
  const h = harness(),
    promise = h.api.start();
  h.progress(0.5);
  h.progress(1);
  assert.deepEqual(h.commits, ['writing']);
  assert.equal(h.tasks.size, 0);
  await promise;
});
test('ordinary visitor has no diagnostic task clock/event work', async () => {
  const h = harness({ probe: false }),
    promise = h.api.start();
  h.progress(0.5);
  h.task();
  h.progress(1);
  await promise;
  assert.deepEqual(h.probes, []);
});

test('finite fragment assembly keeps one painted callback after camera arrival and then resolves once', async () => {
  let ready = false;
  const h = harness({ tail: () => ready });
  let resolved = false;
  const promise = h.api.start().then(() => {
    resolved = true;
  });
  h.progress(0.5, { painted: true });
  h.task();
  assert.equal(h.progress(1, { painted: true, capturedAt: 1300 }), false);
  await Promise.resolve();
  assert.equal(resolved, false);
  assert.equal(h.tasks.size, 0, 'assembly uses the scene callback without a second mount or timer');
  assert.equal(h.content.inert, true);
  assert.equal(h.progress(1, { painted: true, capturedAt: 2000 }), false);
  ready = true;
  h.progress(1, { painted: true, capturedAt: 2600 });
  await promise;
  assert.equal(resolved, true);
  assert.equal(h.content.inert, false);
  assert.equal(h.api.transition(), null);
  assert.deepEqual(h.commits, ['writing']);
});

test('forced completion and retarget cannot leave a retained fragment tail inert or pending', async () => {
  for (const stop of ['finishText', 'interrupt']) {
    const h = harness({ tail: () => false });
    const promise = h.api.start();
    h.progress(0.5, { painted: true });
    h.task();
    assert.equal(h.progress(1, { painted: true }), false);
    h.api[stop]();
    await promise;
    assert.equal(h.api.transition(), null);
    assert.equal(h.content.inert, false);
    assert.equal(h.tasks.size, 0);
    assert.deepEqual(h.commits, ['writing']);
  }
});
function routeNavigationHarness(options = {}) {
  const routes = require('../site/routes.json').routes.map((route) => route.id),
    reads = [],
    timers = new Map(),
    flights = [],
    mounts = [],
    historyEntries = [],
    beginnings = [],
    warmed = [],
    events = new Map();
  let timer = 0,
    callback = null;
  const attributes = new Set(),
    style = {
      removeProperty(name) {
        delete this[name];
      },
    },
    content = {
      style,
      inert: false,
      setAttribute(name) {
        attributes.add(name);
      },
      removeAttribute(name) {
        attributes.delete(name);
      },
      querySelector: () => ({ focus() {} }),
    };
  const document = { hidden: false, body: { dataset: { page: 'index' } } },
    window = {
      SiteRoutes: {
        order: routes,
        direction: (from, to) =>
          routes.indexOf(to) > routes.indexOf(from) ? 'forward' : 'backward',
      },
      location: { href: 'https://site.test/', assign: assert.fail },
      SiteScene: {
        canTravel: () => options.motion !== false,
        direction: (next) =>
          options.direction || window.SiteRoutes.direction(document.body.dataset.page, next),
        navigate(next, animate, update, landing) {
          callback = update;
          flights.push({ next, animate, landing });
          update(animate ? 0 : 1);
        },
        detachTravel() {
          callback = null;
        },
        refresh() {},
      },
      setTimeout(fn, delay) {
        const id = ++timer;
        timers.set(id, { fn, delay });
        return id;
      },
      clearTimeout(id) {
        timers.delete(id);
      },
      addEventListener(name, fn) {
        events.set(name, fn);
      },
      dispatchEvent(event) {
        events.get(event.type)?.(event);
      },
    };
  document.querySelector = () => ({ dataset: { direction: options.direction || 'forward' } });
  document.addEventListener = window.addEventListener;
  const presentation = {
    mountAt: 0.5,
    canTravel: () => true,
    departure: () => ({ opacity: 1 }),
    restoreDeparture() {},
    begin(animate, itinerary) {
      beginnings.push({ animate, itinerary });
    },
    present() {},
  };
  if (options.warm) presentation.prepareNext = (data) => warmed.push(data.page);
  const context = {
    window,
    document,
    content,
    presentation,
    routes,
    primaryRoutes: routes,
    embedded: null,
    directory: new URL('https://site.test/'),
    performance: { now: () => 0 },
    AbortController,
    URL,
    PopStateEvent: class PopStateEvent {
      constructor(type, values) {
        this.type = type;
        Object.assign(this, values);
      }
    },
    history: {
      pushState(state, _, url) {
        historyEntries.push({ state, url: url.href });
        window.location.href = url.href;
      },
    },
    announcement: {},
    routeFor: (url) =>
      url.pathname === '/' ? 'index' : url.pathname.slice(1).replace('.html', ''),
    read(next, signal) {
      return new Promise((resolve) => reads.push({ next, signal, resolve }));
    },
    prepare: (data) => data,
    address: (url) => url,
    clearText() {
      content.inert = false;
    },
    releaseEndpoint() {},
    releaseTail() {},
    arriveEndpoint() {},
    save() {},
    push() {},
    reconcileEndpoint() {},
    restoreScroll() {},
  };
  const navigateSource = source.slice(
      source.indexOf('  async function navigate('),
      source.indexOf('  document.body.dataset.entryPage')
    ),
    apiSource = source.slice(
      source.indexOf('  window.SiteNavigation = {'),
      source.indexOf('  const first =')
    ),
    eventSource = source.slice(
      source.indexOf("  document.addEventListener('click'"),
      source.indexOf('  function finishText(')
    ),
    neighborSource = source.slice(
      source.indexOf('  async function prepareNeighbor('),
      source.indexOf('  async function navigate(')
    );
  vm.runInNewContext(
    `let page='index',serial=0,request=null,requestedPage=null,transition=null,endpoint=null,inputTail=null,lastKey=null,warmRequest=null,warmAgain=false;
    ${interruptSource}${section('motionAllowed', 'restoreScroll')}${flightSource}${neighborSource}${navigateSource}${apiSource}${eventSource}
    globalThis.readPage=()=>page;globalThis.mountRoute=(next)=>{page=next;document.body.dataset.page=next;};globalThis.prepareNeighbor=prepareNeighbor;`,
    context
  );
  context.mount = (data, url, position) => {
    context.mountRoute(data.page);
    mounts.push({ page: data.page, url: url.href, position });
  };
  return {
    api: window.SiteNavigation,
    content,
    attributes,
    reads,
    flights,
    beginnings,
    mounts,
    historyEntries,
    warmed,
    warm: context.prepareNeighbor,
    emit(name) {
      window.dispatchEvent({ type: name });
    },
    click(next) {
      let prevented = false;
      const link = {
        href: 'https://site.test/' + (next === 'index' ? '' : next + '.html'),
        getAttribute: () => next + '.html',
        hasAttribute: () => false,
      };
      events.get('click')({
        button: 0,
        target: { closest: () => link },
        preventDefault: () => (prevented = true),
      });
      return prevented;
    },
    pop(next, scroll) {
      window.location.href = 'https://site.test/' + (next === 'index' ? '' : next + '.html');
      events.get('popstate')({ state: { site: { page: next, scroll } } });
    },
    page: context.readPage,
    async resolve(next) {
      const read = reads.find((entry) => entry.next === next && !entry.resolved);
      assert.ok(read, 'expected route read ' + next);
      read.resolved = true;
      read.resolve({ page: next, title: next });
      await Promise.resolve();
      await Promise.resolve();
    },
    async arrive() {
      callback(1);
      await Promise.resolve();
      await Promise.resolve();
    },
    midpoint() {
      callback(0.5, { painted: true });
      const [id, task] = [...timers].find(([, entry]) => entry.delay === 0);
      timers.delete(id);
      task.fn();
    },
  };
}
test('all five authored routes animate through one itinerary, including Credits and Home reversals', async () => {
  const h = routeNavigationHarness();
  assert.deepEqual(h.api.primaryRoutes, ['index', 'research', 'writing', 'talks', 'credits']);
  for (const next of ['research', 'writing', 'talks', 'credits', 'talks', 'index']) {
    const from = h.page();
    assert.equal(h.api.go(next), true);
    assert.equal(h.api.pendingRoute(), next);
    await h.resolve(next);
    assert.equal(h.flights.at(-1).animate, true);
    assert.deepEqual(JSON.parse(JSON.stringify(h.beginnings.at(-1).itinerary)), {
      from,
      to: next,
      landing: { position: null, hash: '', search: '' },
      direction:
        h.api.primaryRoutes.indexOf(next) > h.api.primaryRoutes.indexOf(from)
          ? 'forward'
          : 'backward',
    });
    await h.arrive();
    assert.equal(h.page(), next);
    assert.equal(h.api.pendingRoute(), null);
    assert.equal(h.attributes.has('aria-busy'), false);
    assert.equal(h.content.inert, false);
  }
});
test('API travel accepts fresh fetch, departure and incoming reversals while rejecting duplicate destinations', async () => {
  const h = routeNavigationHarness({ direction: 'backward' });
  assert.equal(h.api.go('credits'), true);
  assert.equal(h.api.go('credits'), false);
  const stale = h.reads[0];
  assert.equal(
    h.api.go('index'),
    true,
    'return to mounted source before the first destination mounts'
  );
  assert.equal(stale.signal.aborted, true);
  await h.resolve('credits');
  assert.equal(h.flights.length, 0, 'a stale fetch cannot start the old flight');
  await h.resolve('index');
  assert.equal(h.beginnings.at(-1).itinerary.direction, 'backward');
  assert.equal(h.api.go('research'), true, 'a fresh route replaces an active departure');
  await h.resolve('research');
  h.midpoint();
  assert.equal(h.page(), 'research');
  assert.equal(h.api.go('credits', { atEnd: true, input: 'wheel' }), true);
  await h.resolve('credits');
  assert.equal(h.flights.at(-1).landing.position, 'end');
  await h.arrive();
  assert.deepEqual(
    h.mounts.map((entry) => entry.page),
    ['research', 'credits']
  );
  assert.equal(h.api.go('unknown'), false);
  assert.equal(h.api.go('credits'), false);
  assert.equal(h.api.pendingRoute(), null);
  assert.equal(h.attributes.has('aria-busy'), false);
  assert.equal(h.content.inert, false);
});
test('all-five native routes retain instant completion when motion cannot travel', async () => {
  const h = routeNavigationHarness({ motion: false });
  assert.equal(h.api.go('credits'), true);
  await h.resolve('credits');
  await Promise.resolve();
  assert.equal(h.flights[0].animate, false);
  assert.equal(h.page(), 'credits');
  assert.equal(h.api.pendingRoute(), null);
  assert.equal(h.content.inert, false);
});
test('VO Home click reverses a pending departure and Credits arrival through the shared transaction', async () => {
  const h = routeNavigationHarness({ direction: 'backward' });
  assert.equal(h.click('research'), true);
  await h.resolve('research');
  assert.equal(h.page(), 'index', 'source Home can still be mounted at any native scroll position');
  assert.equal(
    h.click('index'),
    true,
    'VO Home does not take the idle same-page branch while busy'
  );
  await h.resolve('index');
  await h.arrive();
  assert.deepEqual(
    h.mounts.map((entry) => entry.page),
    ['index']
  );
  assert.equal(h.click('credits'), true);
  await h.resolve('credits');
  await h.arrive();
  assert.equal(h.click('index'), true);
  await h.resolve('index');
  assert.equal(h.flights.at(-1).animate, true);
  assert.equal(h.beginnings.at(-1).itinerary.direction, 'backward');
  await h.arrive();
  assert.equal(h.page(), 'index');
  assert.equal(h.api.pendingRoute(), null);
});
test('history retargets an active incoming flight and preserves its native stored scroll landing', async () => {
  const h = routeNavigationHarness({ direction: 'backward' });
  h.click('writing');
  await h.resolve('writing');
  h.midpoint();
  h.pop('credits', [0, 7190]);
  await h.resolve('credits');
  await h.arrive();
  assert.equal(h.page(), 'credits');
  assert.deepEqual(h.mounts.at(-1).position, [0, 7190]);
  assert.equal(h.historyEntries.length, 1, 'popstate does not push a replacement history entry');
  assert.equal(h.flights.at(-1).animate, true);
  assert.equal(h.api.pendingRoute(), null);
});

test('neighbor warming coalesces page, theme and resize triggers into one pending read and one follow-up', async () => {
  const h = routeNavigationHarness({ warm: true });
  const first = h.warm();
  assert.equal(h.reads.length, 1);
  for (let index = 0; index < 5; index++) {
    h.emit('site:page-ready');
    h.emit('site:embedded-invalidated');
    h.emit('resize');
  }
  assert.equal(h.reads.length, 1, 'only one speculative route acquisition may remain pending');
  assert.equal(h.reads[0].signal.aborted, false);
  await h.resolve('research');
  await first;
  assert.equal(h.reads.length, 2, 'all pending invalidations coalesce into one fresh preparation');
  await h.resolve('research');
  await new Promise(setImmediate);
  assert.deepEqual(h.warmed, ['research', 'research']);
  assert.equal(h.reads.length, 2);
  assert.equal(h.api.pendingRoute(), null);
  assert.deepEqual(h.mounts, [], 'speculative warming never mounts content or changes history');
  assert.deepEqual(h.historyEntries, []);
});

test('navigation aborts stale neighbor warming and each successful Home return warms again', async () => {
  const h = routeNavigationHarness({ warm: true });
  const stale = h.warm();
  const oldRead = h.reads[0];
  assert.equal(h.api.go('writing'), true);
  assert.equal(oldRead.signal.aborted, true);
  await h.resolve('research');
  await stale;
  assert.deepEqual(h.warmed, [], 'an aborted warm read cannot prepare after navigation starts');
  await h.resolve('writing');
  await h.arrive();
  for (let turn = 0; turn < 2; turn++) {
    assert.equal(h.api.go('index'), true);
    await h.resolve('index');
    await h.arrive();
    await new Promise(setImmediate);
    const warmRead = h.reads.find((read) => read.next === 'research' && !read.resolved);
    assert.ok(warmRead, 'a successful Home return must acquire its visible destination again');
    assert.equal(warmRead.signal.aborted, false);
    await h.resolve('research');
    await new Promise(setImmediate);
    assert.equal(h.warmed.length, turn + 1);
    assert.equal(h.page(), 'index');
    assert.equal(h.api.pendingRoute(), null);
    assert.equal(h.api.go('writing'), true);
    await h.resolve('writing');
    await h.arrive();
  }
  assert.deepEqual(h.warmed, ['research', 'research']);
});

function routeHeadHarness(candidate = source) {
  const css =
    '\n' + fs.readFileSync(path.join(__dirname, '../site/engine/critical-media.css'), 'utf8');
  class Node {
    constructor(tag, attributes = {}, text = '') {
      this.tag = tag;
      this.attributes = attributes;
      this.textContent = text;
      this.content = attributes.content;
    }
    cloneNode() {
      return new Node(this.tag, { ...this.attributes }, this.textContent);
    }
    remove() {
      this.owner.nodes.splice(this.owner.nodes.indexOf(this), 1);
    }
    replaceWith() {}
  }
  function head(nodes) {
    const owner = {
      nodes: [],
      append(...added) {
        for (const node of added) {
          node.owner = owner;
          owner.nodes.push(node);
        }
      },
      querySelectorAll(selector) {
        return owner.nodes.filter((node) =>
          selector.split(',').some((part) => {
            const match = part.match(/^([a-z]+)(?:\[([\w-]+)(?:(\^?=)"([^"]*)")?\])?$/);
            assert.ok(match, 'unsupported DOM fixture selector ' + part);
            const [, tag, key, operator, value] = match;
            return (
              node.tag === tag &&
              (!key ||
                (Object.hasOwn(node.attributes, key) &&
                  (!operator ||
                    (operator === '^='
                      ? node.attributes[key].startsWith(value)
                      : node.attributes[key] === value))))
            );
          })
        );
      },
    };
    owner.append(...nodes);
    return owner;
  }
  function routeDocument(route, critical = route === 'index' ? [css] : []) {
    const elements = {
      main: new Node('main'),
      footer: new Node('footer'),
      '.space-fallback': new Node('svg'),
    };
    return {
      title: route,
      body: { dataset: { page: route } },
      documentElement: { lang: 'en' },
      head: head([
        new Node('meta', { name: 'description', content: route }),
        new Node('script', { type: 'application/ld+json' }, '{}'),
        ...critical.map((text) => new Node('style', { 'data-critical-media': '' }, text)),
      ]),
      querySelector: (selector) => elements[selector] || new Node('meta', { content: 'version' }),
    };
  }
  const document = routeDocument('research');
  document.head.append(new Node('style', { 'data-unrelated': '' }, '.persistent{}'));
  document.querySelectorAll = () => [];
  document.importNode = (node) => node.cloneNode(true);
  const declaration = candidate.match(/ {2}const metadata =\n[\s\S]*?;/)[0];
  const context = {
    document,
    window: { location: { href: 'https://site.test/research.html' }, dispatchEvent() {} },
    content: { replaceChildren() {} },
    cache: new Map(),
    routes: ['index', 'research', 'writing', 'talks', 'credits'],
    restoreScroll() {},
    URL,
    CustomEvent: class CustomEvent {},
  };
  const prepare = source.slice(
    source.indexOf('  function prepare('),
    source.indexOf('  async function navigate(')
  );
  vm.runInNewContext(
    `let page='research';${declaration}${section('extract', 'routeFor')}${section('mountNative', 'prepare')}${prepare}
    globalThis.api={extract,prepare,mountNative};`,
    context
  );
  return {
    css,
    document,
    read: (route, critical) => context.api.extract(routeDocument(route, critical)),
    mount: (data) =>
      context.api.mountNative(context.api.prepare(data), new URL('https://site.test/'), null),
    blocks: () =>
      document.head.querySelectorAll('style[data-critical-media]').map((node) => node.textContent),
  };
}
test('verified Home critical media head is cloned on mount and Back, and removed on other routes', () => {
  const h = routeHeadHarness(),
    home = h.read('index'),
    research = h.read('research');
  for (const route of [home, research, home]) {
    h.mount(route);
    assert.deepEqual(h.blocks(), route.page === 'index' ? [h.css] : []);
    assert.equal(h.document.head.querySelectorAll('style[data-unrelated]').length, 1);
    if (route.page === 'index') {
      const mounted = h.document.head.querySelectorAll('style[data-critical-media]')[0];
      assert.notEqual(
        mounted,
        home.metadata.find((node) => node.tag === 'style')
      );
    }
  }
});
test('route-head preservation contract rejects missing, duplicate or changed Home rules and a block on Research', () => {
  const h = routeHeadHarness();
  for (const [route, blocks] of [
    ['index', []],
    ['index', [h.css, h.css]],
    ['index', [h.css.replace('100%', '780px')]],
    ['research', [h.css]],
  ]) {
    h.mount(h.read(route, blocks));
    assert.throws(() => assert.deepEqual(h.blocks(), route === 'index' ? [h.css] : []));
  }
  const dropped = routeHeadHarness(source.replace(',style[data-critical-media]', ''));
  dropped.mount(dropped.read('index'));
  assert.throws(
    () => assert.deepEqual(dropped.blocks(), [dropped.css]),
    'removing the real transfer selector loses the former intrinsic media fallback'
  );
});
