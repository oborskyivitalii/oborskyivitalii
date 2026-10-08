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
