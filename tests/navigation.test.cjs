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
const extractSource = source.slice(
  source.indexOf('  function extract('),
  source.indexOf('  cache.set(page, extract(document));')
);
const finishSource = source.match(/^ {2}function finishText\s*\(\s*\)\s*\{[\s\S]*?^ {2}\}/m)[0];

test('embedded resources preserve image and PDF URL contexts and reject conflicting identities', () => {
  const start = source.indexOf('  function embeddedResources(');
  const end = source.indexOf('  const embeddedAssetURLs =', start);
  assert.ok(start >= 0 && end > start, 'authored embedded resource boundary');
  const context = {};
  vm.runInNewContext(source.slice(start, end) + '\nglobalThis.collect=embeddedResources;', context);
  const imageURL = 'data:image/png;base64,cG9zdGVy';
  const pdfURL = 'data:application/pdf;base64,c2xpZGVz';
  const element = (tagName, name, src, href) => ({
    tagName,
    getAttribute: (attribute) => ({ 'data-offline-resource': name, src, href })[attribute],
  });
  const elements = [
    element('IMG', 'poster', imageURL, 'unused-image-href'),
    element('A', 'slides', 'unused-link-src', pdfURL),
    element('A', 'slides', 'another-unused-src', pdfURL),
  ];
  let queries = 0;
  const document = {
    querySelectorAll(selector) {
      assert.equal(selector, '[data-offline-resource]');
      queries++;
      return elements;
    },
  };
  assert.deepEqual(Object.fromEntries(context.collect(document, null)), {});
  assert.equal(queries, 0, 'ordinary documents do not scan for embedded resources');
  assert.deepEqual(Object.fromEntries(context.collect(document, {})), {
    poster: imageURL,
    slides: pdfURL,
  });
  elements.push(element('A', 'slides', 'unused-src', pdfURL + 'changed'));
  assert.equal(context.collect(document, {}), null, 'conflicting PDF hrefs abort initialization');
  elements.pop();
  elements.push(element('IMG', 'poster', imageURL + 'changed', 'unused-href'));
  assert.equal(context.collect(document, {}), null, 'conflicting image srcs abort initialization');
});

test('a canceled slide hash cannot clear the busy state of a reopened viewer', async () => {
  const bytes = Buffer.from('%PDF-1.7\nviewer lifecycle fixture\n%%EOF\n');
  const digest = require('node:crypto').createHash('sha256').update(bytes).digest();
  const name = 'article-media/' + digest.toString('hex') + '/slides.pdf';
  const attributes = new Map();
  const tasks = new Map();
  const liveURLs = new Set();
  const revokedURLs = [];
  const hashes = [];
  const hashWaiters = new Map();
  const signals = [];
  const host = {
    hidden: true,
    children: [],
    replaceChildren(...children) {
      this.children = children;
    },
  };
  const section = {
    querySelector: (selector) =>
      selector === '.presentation-viewer' ? host : { textContent: 'Presentation' },
  };
  const control = {
    href: 'https://author.invalid/project/' + name,
    isConnected: true,
    closest: () => section,
    setAttribute: (key, value) => attributes.set(key, value),
    removeAttribute: (key) => attributes.delete(key),
  };
  let click;
  class ResourceURL extends URL {
    static createObjectURL() {
      const value = 'blob:https://author.invalid/' + (liveURLs.size + revokedURLs.length);
      liveURLs.add(value);
      return value;
    }
    static revokeObjectURL(value) {
      liveURLs.delete(value);
      revokedURLs.push(value);
    }
  }
  const context = {
    page: 'article:reader:en',
    embedded: null,
    pinned: { articles: { 'reader:en': { assets: [name] } } },
    entry: new URL('https://author.invalid/project/articles/reader.html'),
    directory: new URL('https://author.invalid/project/'),
    pin: async () => {},
    document: {
      addEventListener(type, listener) {
        assert.equal(type, 'click');
        click = listener;
      },
      createElement: (tagName) => ({ tagName }),
    },
    window: {
      setTimeout(callback, delay) {
        assert.equal(delay, 8000);
        const id = tasks.size + 1;
        tasks.set(id, callback);
        return id;
      },
      clearTimeout: (id) => tasks.delete(id),
      crypto: {
        subtle: {
          digest(algorithm, actualBytes) {
            assert.equal(algorithm, 'SHA-256');
            assert.deepEqual(Buffer.from(actualBytes), bytes);
            return new Promise((resolve) => {
              const index = hashes.length;
              const complete = () => resolve(digest);
              hashes.push(complete);
              hashWaiters.get(index)?.(complete);
            });
          },
        },
      },
    },
    async fetch(url, options) {
      assert.equal(url, control.href);
      signals.push(options.signal);
      return new Response(bytes, { headers: { 'Content-Type': 'application/pdf' } });
    },
    URL: ResourceURL,
    Uint8Array,
    Blob,
    AbortController,
  };
  const start = source.indexOf('  let slideSession = null;');
  const end = source.indexOf('  function routeFor(', start);
  assert.ok(start >= 0 && end > start, 'authored slide lifecycle boundary');
  vm.runInNewContext(source.slice(start, end), context);
  const activate = () =>
    click({
      target: { closest: () => control },
      button: 0,
      preventDefault() {},
    });
  const hashAt = (index) =>
    hashes[index]
      ? Promise.resolve(hashes[index])
      : new Promise((resolve) => hashWaiters.set(index, resolve));

  const abandoned = activate();
  const finishAbandonedHash = await hashAt(0);
  await activate();
  assert.equal(signals[0].aborted, true, 'close cancels the abandoned resource owner');
  const surviving = activate();
  const finishSurvivingHash = await hashAt(1);
  finishAbandonedHash();
  await abandoned;
  assert.equal(attributes.get('aria-busy'), 'true', 'reopened viewer still owns its loading state');
  assert.equal(host.hidden, true);
  assert.equal(host.children.length, 0, 'stale verified bytes cannot mount a frame');
  finishSurvivingHash();
  await surviving;
  assert.equal(attributes.has('aria-busy'), false);
  assert.equal(attributes.get('aria-expanded'), 'true');
  assert.equal(host.children.length, 1);
  assert.equal(liveURLs.has(host.children[0].src), true);
  assert.equal(tasks.size, 0, 'both resource deadlines are released');
  await activate();
  assert.equal(host.hidden, true);
  assert.equal(host.children.length, 0);
  assert.equal(liveURLs.size, 0, 'closing releases the surviving PDF');
  assert.equal(revokedURLs.length, 1, 'the abandoned session never creates a PDF URL');
});

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
    closeSlides() {},
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
function routeHarness({
  holdDeparture = false,
  holdScene = false,
  holdRead = false,
  blurDeparture = false,
  failNativeScroll = false,
  initialPage = 'index',
} = {}) {
  const calls = [],
    probes = [],
    assigned = [],
    tasks = new Map(),
    timerDelays = new Map(),
    listeners = new Map(),
    historyEntries = [],
    historyWrites = [],
    blurredFocus = [],
    nativeScrollCalls = [];
  let timer = 0,
    clock = 10,
    historyIndex = 0,
    inert = false,
    finishScene,
    resolveScene,
    resolveRead,
    releaseRead,
    resolveDeparture,
    releaseDeparture,
    nativeSmooth = null;
  const departureStarted = new Promise((resolve) => (resolveDeparture = resolve)),
    departureGate = new Promise((resolve) => (releaseDeparture = resolve)),
    sceneStarted = new Promise((resolve) => (resolveScene = resolve)),
    readStarted = new Promise((resolve) => (resolveRead = resolve)),
    readGate = new Promise((resolve) => (releaseRead = resolve));
  const node = (id = 'main', href = null) => {
    const attributes = new Map();
    return {
      id,
      inContent: true,
      href: href ? new URL(href, 'https://fixture.test/').href : null,
      getAttribute: (name) => (name === 'href' ? href : (attributes.get(name) ?? null)),
      setAttribute: (name, value) => attributes.set(name, value),
      removeAttribute: (name) => attributes.delete(name),
      focus() {
        context.document.activeElement = this;
      },
    };
  };
  const routeMain = (next) => ({
    ...node(),
    links: next === 'writing' ? [node('article-sample-en', 'articles/sample-en.html')] : [],
    controls: next === 'writing' ? [node('archive-topic'), node('archive-language')] : [],
  });
  function blurContentFocus() {
    if (context.document.activeElement?.inContent) {
      blurredFocus.push(context.document.activeElement.id);
      context.document.activeElement = context.document.body;
    }
  }
  const content = {
    get inert() {
      return inert;
    },
    set inert(value) {
      inert = value;
      if (value) blurContentFocus();
    },
    style: {},
    attributes: new Map(),
    main: routeMain(initialPage),
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
    hasAttribute(name) {
      return this.attributes.has(name);
    },
    replaceChildren(main) {
      this.main = main;
    },
    querySelector: () => content.main,
    querySelectorAll: () => content.main.links,
  };
  const scrollEntry = {
    suspend() {},
    destroy() {},
    mount() {},
    resume() {},
    settle() {},
    cancelRoute() {
      content.main.removeAttribute('data-route-blocks');
    },
    async depart(direction, navigationId) {
      calls.push({ kind: 'departure', direction, navigationId });
      content.main.setAttribute('data-route-blocks', 'departing');
      if (blurDeparture) blurContentFocus();
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
    location: {
      href: `https://fixture.test/${initialPage}.html`,
      assign: (url) => assigned.push(url),
    },
    scrollX: 0,
    scrollY: 0,
    scrollTo({ left, top, behavior }) {
      assert.equal(behavior, 'instant', 'native restoration explicitly cancels smooth scrolling');
      nativeScrollCalls.push({ left, top, behavior });
      if (failNativeScroll) throw Error('native scroll unavailable');
      nativeSmooth = null;
      window.scrollX = left;
      window.scrollY = top;
    },
    setTimeout(fn, delay) {
      tasks.set(++timer, fn);
      timerDelays.set(timer, delay);
      return timer;
    },
    clearTimeout(id) {
      tasks.delete(id);
      timerDelays.delete(id);
    },
    addEventListener: (name, listener) => listeners.set(name, listener),
    dispatchEvent() {},
    SiteEngineProbe: (event) => probes.push(event),
    SiteScene: {
      canTravel: () => true,
      refresh() {},
      detachTravel() {},
      navigate(next, animate, update, landing, metadata) {
        calls.push({ kind: 'scene', next, animate, landing, navigationId: metadata.navigationId });
        if (holdScene && metadata.navigationId === 1) {
          finishScene = () => update(1);
          resolveScene();
          update(0);
        } else update(1);
      },
    },
  };
  historyEntries.push({
    url: window.location.href,
    state: { unrelated: 'retained', site: { page: initialPage, scroll: [0, 0] } },
  });
  const history = {
    get state() {
      return historyEntries[historyIndex].state;
    },
    pushState(state, unused, url) {
      const entry = { url: String(url), state: JSON.parse(JSON.stringify(state)) };
      historyEntries.splice(++historyIndex, Infinity, entry);
      window.location.href = entry.url;
      historyWrites.push({ kind: 'push', ...entry });
    },
    replaceState(state, unused, url) {
      const entry = { url: String(url), state: JSON.parse(JSON.stringify(state)) };
      historyEntries[historyIndex] = entry;
      window.location.href = entry.url;
      historyWrites.push({ kind: 'replace', ...entry });
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
      body: { dataset: { page: initialPage } },
      documentElement: { lang: 'en', scrollHeight: 1200 },
      head: { querySelectorAll: () => [], append() {} },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: (id) =>
        [content.main, ...content.main.links, ...content.main.controls].find(
          (element) => element.id === id
        ) || null,
    },
    history,
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
    routeFor: (url) =>
      url.pathname === '/articles/sample-en.html'
        ? 'article:sample:en'
        : url.pathname.slice(1).replace('.html', ''),
    address: (url) => url,
    async read(next) {
      if (holdRead && next.startsWith('article:')) {
        resolveRead();
        await readGate;
      }
      return {
        page: next,
        scene: next.startsWith('article:') ? 'writing' : next,
        article: next.startsWith('article:') ? next.slice(8) : null,
        title: next,
        lang: 'en',
        main: routeMain(next),
        footer: node(),
        metadata: [],
      };
    },
    prepare: (data) => data,
    clearText() {
      content.inert = false;
    },
    releaseEndpoint() {},
    releaseTail() {},
    closeSlides() {},
    arriveEndpoint() {},
    mountEndpoint() {},
    rebaseResources() {},
  };
  context.document.activeElement = context.document.body;
  const start = source.indexOf('  async function navigate('),
    end = source.indexOf('  document.body.dataset.entryPage = page;', start),
    scrollStart = source.indexOf('  // One write after a gesture'),
    scrollEnd = source.indexOf("  window.addEventListener('site:motion-preference'", scrollStart);
  assert.ok(start > 0 && end > start, 'missing authored navigation lifecycle boundary');
  assert.ok(scrollStart > 0 && scrollEnd > scrollStart, 'missing authored scroll-save boundary');
  vm.runInNewContext(
    `let page=${JSON.stringify(initialPage)},serial=0,request=null,transition=null,endpoint=null,inputTail=null,lastKey=null,scrollSave=null;
    ${section('save', 'push')}
    ${interruptSource}${section('motionAllowed', 'restoreScroll')}${section('restoreScroll', 'endpointProbe')}${flightSource}
    ${section('mount', 'prepare')}${source.slice(start, end)}
    ${source.slice(scrollStart, scrollEnd)}
    globalThis.navigate=navigate;`,
    context
  );
  return {
    navigate: context.navigate,
    content,
    calls,
    probes,
    assigned,
    tasks,
    departureStarted,
    releaseDeparture,
    sceneStarted,
    finishScene: () => finishScene(),
    readStarted,
    releaseRead,
    historyEntries,
    historyWrites,
    nativeScrollCalls,
    blurredFocus,
    document: context.document,
    window,
    beginSmooth(top) {
      nativeSmooth = top;
    },
    advanceSmooth() {
      if (nativeSmooth === null) return false;
      window.scrollY = nativeSmooth;
      listeners.get('scroll')?.();
      return true;
    },
    scheduleScrollSave: () => listeners.get('scroll')(),
    runTimer(delay) {
      const [id, callback] = [...tasks].find(([key]) => timerDelays.get(key) === delay) || [];
      assert.ok(callback, 'expected queued timer with delay ' + delay);
      window.clearTimeout(id);
      callback();
    },
    focus(id) {
      const target = context.document.getElementById(id);
      assert.ok(target, 'expected focusable fixture ' + id);
      target.focus();
    },
    travel(delta) {
      historyIndex += delta;
      assert.ok(historyEntries[historyIndex], 'expected native history entry');
      const entry = historyEntries[historyIndex];
      window.location.href = entry.url;
      return context.navigate(new URL(entry.url), { pop: true, position: entry.state.site.scroll });
    },
  };
}
test('an early native scroll failure uses ordinary HTML fallback and releases navigation ownership', async () => {
  const h = routeHarness({ initialPage: 'writing', failNativeScroll: true });
  h.focus('article-sample-en');
  h.window.scrollY = 2297;
  const destination = new URL(
    'https://fixture.test/articles/sample-en.html?source=archive#section'
  );
  await assert.doesNotReject(h.navigate(destination));
  assert.deepEqual(h.assigned, [destination.href]);
  assert.deepEqual(h.nativeScrollCalls, [{ left: 0, top: 2297, behavior: 'instant' }]);
  assert.equal(h.content.hasAttribute('aria-busy'), false);
  assert.equal(h.content.inert, false);
  assert.equal(h.content.main.getAttribute('data-route-blocks'), null);
  assert.equal(h.historyEntries.length, 1, 'failed boundary does not enter route history');
  assert.deepEqual(h.calls, [], 'failed boundary cannot begin departure or a camera flight');
  assert.equal(h.tasks.size, 0, 'the native failure releases its abort timer');
});
test('inherited native smooth scrolling stops at navigation while deliberate read-time input still wins', async () => {
  for (const explicitInput of [false, true]) {
    const h = routeHarness({ initialPage: 'writing', holdRead: true });
    h.focus('article-sample-en');
    h.window.scrollY = 2297;
    h.beginSmooth(2004);
    const navigation = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
    await h.readStarted;
    assert.equal(h.advanceSmooth(), false, 'the inherited native animation was cancelled');
    assert.equal(h.window.scrollY, 2297);
    assert.deepEqual(h.nativeScrollCalls, [{ left: 0, top: 2297, behavior: 'instant' }]);
    if (explicitInput) {
      h.focus('archive-language');
      h.beginSmooth(2350);
      assert.equal(
        h.advanceSmooth(),
        true,
        'new native input during asynchronous reading remains live'
      );
      h.runTimer(350);
      assert.equal(h.historyEntries[0].state.site.scroll[1], 2350);
    }
    h.releaseRead();
    await navigation;
    const expected = explicitInput ? 2350 : 2297;
    assert.equal(h.historyEntries[0].state.site.scroll[1], expected);
    await h.travel(-1);
    assert.equal(h.window.scrollY, expected);
    assert.equal(
      h.document.activeElement.id,
      explicitInput ? 'archive-language' : 'article-sample-en'
    );
    assert.deepEqual(h.assigned, []);
    assert.equal(h.tasks.size, 0);
  }
});
test('hidden and inert retarget restore matching saved departure instead of transient viewport coordinates', async () => {
  for (const hidden of [true, false]) {
    const h = routeHarness({
      initialPage: 'writing',
      holdDeparture: hidden,
      blurDeparture: hidden,
      holdScene: !hidden,
      holdRead: true,
    });
    h.focus('archive-topic');
    h.window.scrollX = 13;
    h.window.scrollY = 5722;
    const stale = h.navigate(new URL('https://fixture.test/talks.html'));
    await (hidden ? h.departureStarted : h.sceneStarted);
    const saved = h.historyEntries[0].state;
    h.window.scrollX = 17;
    h.window.scrollY = 2004;
    const latest = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
    await h.readStarted;
    assert.equal(h.window.scrollX, 13);
    assert.equal(
      h.window.scrollY,
      5722,
      'retarget restored the captured outgoing reading position'
    );
    h.releaseRead();
    await latest;
    if (hidden) h.releaseDeparture();
    else h.finishScene();
    await stale;
    assert.deepEqual(h.historyEntries[0].state, saved);
    assert.equal(h.historyEntries.length, 2);
    await h.travel(-1);
    assert.equal(h.window.scrollY, 5722);
    assert.equal(h.document.activeElement.id, 'archive-topic');
    assert.deepEqual(h.assigned, []);
    assert.equal(h.tasks.size, 0);
  }
});
test('article Back restores the archive link and scroll captured before inert blurs content focus', async () => {
  const h = routeHarness({ initialPage: 'writing' });
  h.window.location.href += '?topic=systems&language=en';
  h.focus('article-sample-en');
  h.window.scrollY = 705;
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  assert.deepEqual(h.blurredFocus, ['article-sample-en']);
  assert.deepEqual(h.historyEntries[0].state, {
    unrelated: 'retained',
    site: { page: 'writing', scroll: [0, 705], focus: 'article-sample-en' },
  });
  const articleState = h.historyEntries[1].state;
  await h.travel(-1);
  assert.equal(h.document.activeElement.id, 'article-sample-en');
  assert.equal(h.window.scrollY, 705);
  assert.equal(new URL(h.window.location.href).search, '?topic=systems&language=en');
  assert.equal(h.historyEntries.length, 2, 'pop navigation never creates a replacement entry');
  assert.deepEqual(h.historyEntries[1].state, articleState);
  await h.travel(1);
  assert.equal(h.document.body.dataset.article, 'sample:en');
  assert.equal(h.document.activeElement.id, articleState.site.focus);
  assert.equal(h.window.scrollY, articleState.site.scroll[1]);
  assert.deepEqual(h.assigned, []);
});
test('initial navigation replaces the entry without storing departure state or pushing history', async () => {
  const h = routeHarness({ initialPage: 'writing' });
  h.focus('article-sample-en');
  h.window.scrollY = 705;
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'), { initial: true });
  assert.equal(h.historyEntries.length, 1);
  assert.deepEqual(
    h.historyWrites.map((entry) => entry.kind),
    ['replace', 'replace']
  );
  assert.deepEqual(h.historyEntries[0].state.site, {
    page: 'article:sample:en',
    scroll: [0, 0],
    focus: 'main',
  });
  assert.deepEqual(h.assigned, []);
});
test('departure visibility cannot erase the focus saved for Back', async () => {
  const h = routeHarness({ initialPage: 'writing', blurDeparture: true });
  h.focus('article-sample-en');
  h.window.scrollY = 705;
  await h.navigate(new URL('https://fixture.test/research.html'));
  assert.deepEqual(h.blurredFocus, ['article-sample-en']);
  assert.equal(h.historyEntries[0].state.site.focus, 'article-sample-en');
  await h.travel(-1);
  assert.equal(h.document.activeElement.id, 'article-sample-en');
  assert.equal(h.window.scrollY, 705);
  assert.deepEqual(h.assigned, []);
});
test('a departing visibility scroll-save tick cannot erase offscreen control focus before inert', async () => {
  const h = routeHarness({ initialPage: 'writing', holdDeparture: true, blurDeparture: true });
  h.window.location.href += '?topic=systems&language=en';
  h.focus('archive-topic');
  h.window.scrollY = 5722;
  h.scheduleScrollSave();
  const navigation = h.navigate(new URL('https://fixture.test/talks.html'));
  await h.departureStarted;
  assert.equal(h.content.inert, false, 'visibility departure precedes inert flight');
  assert.equal(h.content.main.getAttribute('data-route-blocks'), 'departing');
  assert.equal(h.document.activeElement, h.document.body, 'hidden control lost native focus');
  const departure = h.historyEntries[0].state;
  assert.equal(departure.site.focus, 'archive-topic');
  const writes = h.historyWrites.length;
  h.runTimer(350);
  assert.equal(h.historyWrites.length, writes, 'departure cannot replace captured reading state');
  assert.deepEqual(h.historyEntries[0].state, departure);
  h.releaseDeparture();
  await navigation;
  await h.travel(-1);
  assert.equal(h.document.activeElement.id, 'archive-topic');
  assert.equal(h.window.scrollY, 5722);
  assert.equal(new URL(h.window.location.href).search, '?topic=systems&language=en');
  assert.equal(h.historyEntries.length, 2);
  assert.deepEqual(h.assigned, []);
  assert.equal(h.tasks.size, 0);
});
test('hidden departure retarget preserves captured focus while explicit read-time controls and scroll still win', async () => {
  for (const explicitFocus of [false, true]) {
    const h = routeHarness({
      initialPage: 'writing',
      holdDeparture: true,
      blurDeparture: true,
      holdRead: true,
    });
    h.focus('archive-topic');
    h.window.scrollY = 5722;
    const stale = h.navigate(new URL('https://fixture.test/talks.html'));
    await h.departureStarted;
    assert.equal(h.content.inert, false);
    const latest = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
    await h.readStarted;
    assert.equal(
      h.content.main.getAttribute('data-route-blocks'),
      null,
      'interruption restored native visibility'
    );
    if (explicitFocus) {
      h.focus('archive-language');
      h.window.scrollY = 5750;
      const writes = h.historyWrites.length;
      h.scheduleScrollSave();
      h.runTimer(350);
      assert.equal(
        h.historyWrites.length,
        writes + 1,
        'ordinary asynchronous reading remains saveable'
      );
      assert.equal(h.historyEntries[0].state.site.focus, 'archive-language');
    }
    h.releaseRead();
    await latest;
    h.releaseDeparture();
    await stale;
    const focus = explicitFocus ? 'archive-language' : 'archive-topic';
    const scroll = explicitFocus ? 5750 : 5722;
    assert.deepEqual(h.historyEntries[0].state.site, {
      page: 'writing',
      scroll: [0, scroll],
      focus,
    });
    assert.equal(h.historyEntries.length, 2, 'stale departure never enters history');
    assert.equal(h.historyEntries[1].state.site.page, 'article:sample:en');
    await h.travel(-1);
    assert.equal(h.document.activeElement.id, focus);
    assert.equal(h.window.scrollY, scroll);
    assert.deepEqual(h.assigned, []);
    assert.equal(h.tasks.size, 0);
  }
});
test('an inert scroll-save tick and rapid unmounted retarget retain the departure link', async () => {
  const h = routeHarness({ initialPage: 'writing', holdScene: true });
  h.focus('article-sample-en');
  h.window.scrollY = 705;
  h.scheduleScrollSave();
  const stale = h.navigate(new URL('https://fixture.test/research.html'));
  await h.sceneStarted;
  const departure = h.historyEntries[0].state;
  const writes = h.historyWrites.length;
  h.runTimer(350);
  assert.equal(h.historyWrites.length, writes, 'inert cannot replace the captured departure entry');
  assert.deepEqual(h.historyEntries[0].state, departure);
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  h.finishScene();
  await stale;
  assert.equal(h.historyEntries.length, 2, 'the interrupted destination never enters history');
  assert.deepEqual(h.historyEntries[0].state, departure);
  assert.equal(h.historyEntries[1].state.site.page, 'article:sample:en');
  await h.travel(-1);
  assert.equal(h.document.activeElement.id, 'article-sample-en');
  assert.equal(h.window.scrollY, 705);
  assert.deepEqual(h.assigned, []);
  assert.equal(h.tasks.size, 0);
});
test('explicit focus during a retargeted read replaces the captured departure focus', async () => {
  const h = routeHarness({ initialPage: 'writing', holdScene: true, holdRead: true });
  h.focus('article-sample-en');
  const stale = h.navigate(new URL('https://fixture.test/research.html'));
  await h.sceneStarted;
  const latest = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.readStarted;
  h.document.activeElement = { id: 'appearance', getAttribute: () => null };
  h.releaseRead();
  await latest;
  h.finishScene();
  await stale;
  assert.equal(h.historyEntries[0].state.site.focus, 'appearance');
  assert.equal(h.historyEntries.length, 2);
  assert.deepEqual(h.assigned, []);
});
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
    `let page='research',serial=0;${declaration}${extractSource}${section('mountNative', 'prepare')}${prepare}
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
      getAttribute: () => null,
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
    restoreScroll(left, top) {
      context.window.scrollX = left;
      context.window.scrollY = top;
    },
    arriveEndpoint() {},
    clearText() {},
    releaseEndpoint() {},
    releaseTail() {},
    history: { pushState() {}, replaceState() {} },
    announcement: {},
    content,
    window: {
      scrollX: 0,
      scrollY: 0,
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
    ${section('departureUnavailable', 'push')}
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
