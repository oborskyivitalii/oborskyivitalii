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
        navigate(next, animate, update, landing, metadata) {
          sceneCalls.push({ next, animate, landing, metadata });
          callback = update;
          update(animate ? 0 : 1);
        },
        detachTravel() {
          detachCount++;
        },
      };
  const context = {
    scrollEntry: { suspend() {} },
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
    `let serial=1,transition=null,request={abort(){}};${interruptSource}${flightSource}${finishSource}
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
    progress: (progress) => callback(progress),
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
    assert.equal(h.sceneCalls[0].metadata.navigationId, h.api.serial());
    assert.ok(Number.isInteger(h.sceneCalls[0].metadata.navigationId));
    assert.ok(h.sceneCalls[0].metadata.navigationId > 0);
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
function routeHarness({ holdDeparture = false } = {}) {
  const calls = [],
    probes = [],
    assigned = [],
    tasks = new Map();
  let timer = 0,
    clock = 10,
    resolveDeparture,
    releaseDeparture;
  const departureStarted = new Promise((resolve) => (resolveDeparture = resolve)),
    departureGate = new Promise((resolve) => (releaseDeparture = resolve));
  const node = () => ({ setAttribute() {}, focus() {} });
  const content = {
    inert: false,
    style: {},
    setAttribute() {},
    removeAttribute() {},
    replaceChildren(main) {
      this.main = main;
    },
    querySelector: () => content.main,
  };
  const scrollEntry = {
    suspend() {},
    destroy() {},
    mount() {},
    resume() {},
    settle() {},
    cancelRoute() {},
    async depart(direction, navigationId) {
      calls.push({ kind: 'departure', direction, navigationId });
      if (holdDeparture && navigationId === 1) {
        resolveDeparture();
        await departureGate;
      }
      return { completed: true };
    },
    prepareArrival(direction, navigationId) {
      calls.push({ kind: 'prepare-arrival', direction, navigationId });
    },
    async arrive(direction, navigationId) {
      calls.push({ kind: 'arrival', direction, navigationId });
    },
  };
  const window = {
    location: { href: 'https://fixture.test/index.html', assign: (url) => assigned.push(url) },
    setTimeout(fn) {
      tasks.set(++timer, fn);
      return timer;
    },
    clearTimeout: (id) => tasks.delete(id),
    dispatchEvent() {},
    SiteEngineProbe: (event) => probes.push(event),
    SiteScene: {
      canTravel: () => true,
      refresh() {},
      detachTravel() {},
      navigate(next, animate, update, landing, metadata) {
        calls.push({ kind: 'scene', next, animate, landing, navigationId: metadata.navigationId });
        update(1);
      },
    },
  };
  const context = {
    window,
    scrollEntry,
    content,
    effects: { measure: (run) => run() },
    presentation: null,
    announcement: {},
    document: {
      hidden: false,
      body: { dataset: { page: 'index' } },
      documentElement: { lang: 'en', scrollHeight: 1200 },
      head: { querySelectorAll: () => [], append() {} },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
    },
    history: { pushState() {}, replaceState() {} },
    performance: { now: () => clock++ },
    AbortController,
    CustomEvent: class {
      constructor(type, options) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    URL,
    innerHeight: 600,
    metadata: 'fixture-metadata',
    routes: ['index', 'research', 'writing', 'talks', 'credits'],
    routeFor: (url) => url.pathname.slice(1).replace('.html', ''),
    address: (url) => url,
    read: async (next) => ({
      page: next,
      title: next,
      lang: 'en',
      main: node(),
      footer: node(),
      metadata: [],
    }),
    prepare: (data) => data,
    save() {},
    clearText() {},
    releaseEndpoint() {},
    releaseTail() {},
    arriveEndpoint() {},
    mountEndpoint() {},
    restoreScroll() {},
    rebaseResources() {},
  };
  const start = source.indexOf('  async function navigate('),
    end = source.indexOf('  document.body.dataset.entryPage = page;', start);
  assert.ok(start > 0 && end > start, 'missing authored navigation lifecycle boundary');
  vm.runInNewContext(
    `let page='index',serial=0,request=null,transition=null,endpoint=null,inputTail=null,lastKey=null;
    ${interruptSource}${section('motionAllowed', 'restoreScroll')}${flightSource}
    ${section('mount', 'prepare')}${source.slice(start, end)}
    globalThis.navigate=navigate;`,
    context
  );
  return {
    navigate: context.navigate,
    calls,
    probes,
    assigned,
    tasks,
    departureStarted,
    releaseDeparture,
  };
}
test('router-owned navigation IDs follow departure, native arrival preparation, camera and completion', async () => {
  const h = routeHarness();
  for (const [next, direction, position] of [
    ['research', 1, [0, 450]],
    ['index', -1, 'end'],
  ]) {
    const url = new URL(`https://fixture.test/${next}.html?topic=fixture#topics`);
    await h.navigate(url, { position });
    const start = h.probes.filter((event) => event.kind === 'navigation-start').at(-1),
      ready = h.probes.filter((event) => event.kind === 'navigation-ready').at(-1),
      stages = h.calls.filter((call) => call.navigationId === start.navigationId);
    assert.ok(Number.isInteger(start.navigationId) && start.navigationId > 0);
    assert.equal(ready.navigationId, start.navigationId);
    assert.equal(ready.page, next);
    assert.deepEqual(
      stages.map((call) => call.kind),
      ['departure', 'scene', 'prepare-arrival', 'arrival']
    );
    for (const call of stages.filter((entry) => entry.kind !== 'scene'))
      assert.equal(call.direction, direction);
    const scene = stages.find((call) => call.kind === 'scene');
    assert.equal(scene.next, next);
    assert.equal(scene.animate, true);
    assert.equal(scene.landing.position, position);
    assert.equal(scene.landing.hash, '#topics');
    assert.equal(scene.landing.search, '?topic=fixture');
  }
  assert.deepEqual(
    h.probes
      .filter((event) => event.kind === 'navigation-start')
      .map((event) => event.navigationId),
    [1, 2]
  );
  assert.deepEqual(h.assigned, [], 'the full native mount succeeds without fallback navigation');
  assert.equal(h.tasks.size, 0, 'completed routes release their fetch timeout');
});
test('retargeted departure retains its ID and cannot emit a camera, arrival or ready event for the new route', async () => {
  const h = routeHarness({ holdDeparture: true }),
    stale = h.navigate(new URL('https://fixture.test/research.html'));
  await h.departureStarted;
  await h.navigate(new URL('https://fixture.test/writing.html'));
  h.releaseDeparture();
  await stale;
  assert.deepEqual(
    h.calls.filter((call) => call.navigationId === 1).map((call) => call.kind),
    ['departure']
  );
  assert.deepEqual(
    h.calls.filter((call) => call.navigationId === 2).map((call) => call.kind),
    ['departure', 'scene', 'prepare-arrival', 'arrival']
  );
  const ready = h.probes.filter((event) => event.kind === 'navigation-ready');
  assert.equal(ready.length, 1);
  assert.equal(ready[0].navigationId, 2);
  assert.equal(ready[0].page, 'writing');
  assert.deepEqual(h.assigned, []);
  assert.equal(h.tasks.size, 0);
});
test('animated Color yields the completed camera paint before native mount, with no second animation clock', async () => {
  const h = harness(),
    promise = h.api.start();
  let settled = false;
  promise.then(() => (settled = true));
  h.progress(0.56);
  assert.deepEqual(h.commits, []);
  assert.equal(h.tasks.size, 1);
  assert.equal(h.content.style.opacity, undefined, 'the held blocks replace whole-plane fades');
  assert.equal(h.content.style.transform, undefined, 'the camera alone traverses depth');
  h.progress(0.63);
  assert.equal(h.tasks.size, 1, 'only one native task per flight');
  h.task();
  assert.deepEqual(h.commits, ['writing']);
  assert.equal(
    h.presented.at(-1).progress,
    0.63,
    'presentation metadata follows the latest painted camera pose'
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
test('base and Color share the same yielded native mount while destination blocks stay held', async () => {
  const h = harness({ base: true }),
    promise = h.api.start();
  h.progress(0.49);
  assert.deepEqual(h.commits, []);
  h.progress(0.5);
  assert.deepEqual(h.commits, []);
  assert.equal(h.tasks.size, 1);
  h.task();
  assert.deepEqual(h.commits, ['writing']);
  assert.equal(h.content.style.opacity, undefined);
  assert.equal(h.content.style.transform, undefined);
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
    scrollEntry: { destroy() {}, mount() {} },
    window: { location: { href: 'https://site.test/research.html' }, dispatchEvent() {} },
    content: { replaceChildren() {} },
    cache: new Map(),
    routes: ['index', 'research', 'writing', 'talks', 'credits'],
    restoreScroll() {},
    rebaseResources() {},
    URL,
    CustomEvent: class CustomEvent {},
  };
  const prepare = source.slice(
    source.indexOf('  function prepare('),
    source.indexOf('  async function navigate(')
  );
  vm.runInNewContext(
    `let page='research',serial=0;${declaration}${section('extract', 'routeFor')}${section('mountNative', 'prepare')}${prepare}
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

function sequenceHarness() {
  const events = [];
  const deferred = () => {
    let resolve;
    const promise = new Promise((done) => {
      resolve = done;
    });
    return { promise, resolve };
  };
  let departure = deferred(),
    camera = deferred(),
    arrival = deferred();
  let motion = true;
  const content = {
    setAttribute() {},
    removeAttribute() {},
    querySelector: () => ({
      focus() {
        events.push('focus');
      },
    }),
  };
  const context = {
    routes: ['index', 'research', 'writing', 'talks', 'credits'],
    routeFor: (url) => url.pathname.slice(1).replace('.html', ''),
    interrupt() {
      events.push('interrupt');
    },
    read: async (next) => ({ page: next, title: next }),
    prepare: (data) => data,
    motionAllowed: () => motion,
    presentation: null,
    scrollEntry: {
      depart(direction) {
        events.push(['depart', direction]);
        return departure.promise;
      },
      arrive(direction) {
        events.push(['arrive', direction]);
        return arrival.promise;
      },
      resume() {
        events.push('resume');
      },
      cancelRoute() {
        events.push('cancel-route');
      },
      settle() {},
    },
    async flight(next, animate, commit) {
      events.push(['camera', next, animate]);
      if (animate) await camera.promise;
      commit();
      events.push('camera-restored');
    },
    mount(data, url, position, direction) {
      events.push(['mount', data.page, position, direction]);
      context.currentPage(data.page);
    },
    address: (url) => url,
    save() {},
    arriveEndpoint() {},
    clearText() {},
    releaseEndpoint() {},
    releaseTail() {},
    history: { pushState() {}, replaceState() {} },
    announcement: {},
    content,
    window: {
      location: {
        href: 'https://site.test/index.html',
        assign() {
          events.push('fallback');
        },
      },
      setTimeout: () => 1,
      clearTimeout() {},
    },
    AbortController,
  };
  const start = source.indexOf('  async function navigate(');
  const end = source.indexOf('  document.body.dataset.entryPage', start);
  vm.runInNewContext(
    `let page='index',serial=0,request=null,endpoint=null,inputTail=null,lastKey=null;
    ${source.slice(start, end)}
    globalThis.currentPage=value=>page=value;
    globalThis.go=navigate;
    globalThis.invalidate=()=>serial++;`,
    context
  );
  return {
    events,
    go: context.go,
    currentPage: context.currentPage,
    invalidate: context.invalidate,
    departing: () => departure.resolve({ completed: true }),
    restored: () => camera.resolve(),
    arriving: () => arrival.resolve({ completed: true }),
    noMotion() {
      motion = false;
    },
    flush: async () => {
      for (let i = 0; i < 6; i++) await Promise.resolve();
    },
  };
}

test('forward and reverse navigation wait for blocks, restored camera, then assembly before reading resumes', async () => {
  for (const [from, to, direction] of [
    ['index', 'research', 1],
    ['research', 'index', -1],
    ['talks', 'credits', 1],
    ['research', 'credits', 1],
    ['credits', 'index', -1],
  ]) {
    const h = sequenceHarness();
    h.currentPage(from);
    const promise = h.go(new URL(`https://site.test/${to}.html`));
    await h.flush();
    assert.deepEqual(h.events, ['interrupt', ['depart', direction]]);
    h.departing();
    await h.flush();
    assert.deepEqual(h.events.at(-1), ['camera', to, true]);
    assert.equal(
      h.events.some((event) => event === 'resume'),
      false
    );
    h.restored();
    await h.flush();
    assert.deepEqual(h.events.slice(-3), [
      ['mount', to, null, direction],
      'camera-restored',
      ['arrive', direction],
    ]);
    assert.equal(
      h.events.includes('focus'),
      false,
      'native focus cannot prematurely settle assembly'
    );
    h.arriving();
    await promise;
    assert.ok(h.events.indexOf('camera-restored') < h.events.indexOf('resume'));
    assert.ok(h.events.includes('focus'));
    assert.equal(
      h.events.at(-1),
      'cancel-route',
      'finally clears route state without settling reading'
    );
  }
});

test('stale departure or arrival cannot commit or resume a superseded navigation', async () => {
  for (const stage of ['departure', 'arrival']) {
    const h = sequenceHarness(),
      promise = h.go(new URL('https://site.test/research.html'));
    await h.flush();
    if (stage === 'arrival') {
      h.departing();
      await h.flush();
      h.restored();
      await h.flush();
    }
    h.invalidate();
    if (stage === 'departure') h.departing();
    else h.arriving();
    await promise;
    assert.equal(h.events.includes('resume'), false);
    assert.equal(h.events.includes('focus'), false);
    if (stage === 'departure')
      assert.equal(
        h.events.some((e) => Array.isArray(e) && e[0] === 'mount'),
        false
      );
  }
});

test('motion disabled during departure switches to immediate native mounting without an arrival animation', async () => {
  const h = sequenceHarness(),
    promise = h.go(new URL('https://site.test/research.html'));
  await h.flush();
  h.noMotion();
  h.departing();
  await promise;
  assert.ok(h.events.some((e) => Array.isArray(e) && e[0] === 'camera' && e[2] === false));
  assert.equal(
    h.events.some((e) => Array.isArray(e) && e[0] === 'arrive'),
    false
  );
  assert.ok(h.events.includes('resume'));
});

test('one public block control delegates persistence and refreshes all block motion exactly once', () => {
  const method = source.match(/^ {4}contentFlight\(value\) \{[\s\S]*?^ {4}\},/m)?.[0];
  assert.ok(method, 'public block control is present');
  for (const initial of [true, false]) {
    let preference = initial;
    const writes = [];
    let refreshed = 0;
    const context = {
      presentation: {
        contentFlight(value) {
          if (typeof value === 'boolean') {
            preference = value;
            writes.push(value);
          }
          return preference;
        },
      },
      scrollEntry: { refreshPreference: () => refreshed++ },
    };
    const control = vm.runInNewContext('({' + method + '})', context);
    assert.equal(control.contentFlight(), initial);
    assert.equal(refreshed, 0, 'reading the preference cannot reset active motion');
    for (const value of [false, true]) {
      assert.equal(control.contentFlight(value), value);
      assert.equal(writes.at(-1), value);
      assert.equal(refreshed, writes.length, 'each setter has one motion lifecycle owner');
    }
  }
});

test('verified snapshot resources regain native root and nested article links at mount', () => {
  const entry = new URL('https://fixture.test/project/writing.html');
  const directory = new URL('.', entry);
  const element = (attributes = {}, children = []) => ({
    attributes: { ...attributes },
    getAttribute(name) {
      return this.attributes[name] || null;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    querySelectorAll() {
      return children;
    },
  });
  const context = { URL, entry, directory, embedded: null };
  vm.runInNewContext(
    section('rebaseResources', 'extract') + '\nglobalThis.rebase=rebaseResources;',
    context
  );
  for (const [alias, prefix] of [
    ['credits.html', ''],
    ['articles/reader.html', '../'],
  ]) {
    const credits = element({ href: '../../credits.html' });
    const research = element({ href: '../../research.html#ua-advisors' });
    const image = element({ src: '../../article-media/verified/diagram.png' });
    const external = element({ href: 'https://external.test/article' });
    const outside = element({ href: 'https://fixture.test/other/article.html' });
    const anchor = element({ href: '#section' });
    const inline = element({ src: 'data:image/png;base64,AA==' });
    const canonical = element({ href: 'https://fixture.test/project/articles/reader.html' });
    const data = {
      sourceURL: new URL('snapshots/verified/credits.html', directory),
      main: element({}, [research, image, external, outside, anchor, inline]),
      footer: element({}, [credits]),
      fallback: element(),
      metadata: [canonical],
    };
    context.rebase(data, new URL(alias, directory));
    assert.equal(credits.attributes.href, prefix + 'credits.html');
    assert.equal(research.attributes.href, prefix + 'research.html#ua-advisors');
    assert.equal(image.attributes.src, prefix + 'article-media/verified/diagram.png');
    assert.equal(external.attributes.href, 'https://external.test/article');
    assert.equal(outside.attributes.href, 'https://fixture.test/other/article.html');
    assert.equal(anchor.attributes.href, '#section');
    assert.equal(inline.attributes.src, 'data:image/png;base64,AA==');
    assert.equal(canonical.attributes.href, 'https://fixture.test/project/articles/reader.html');
  }
  context.embedded = {};
  const footerLink = element({ href: '?view=credits' });
  context.rebase({ footer: element({}, [footerLink]) }, entry);
  assert.equal(footerLink.attributes.href, '?view=credits', 'offline query links stay native');
});
