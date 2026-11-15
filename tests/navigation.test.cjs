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
const cacheDocumentSource = source.match(/^ {2}const cacheDocument = .+$/m)[0];
const finishSource = source.match(/^ {2}function finishText\s*\(\s*\)\s*\{[\s\S]*?^ {2}\}/m)[0];

test('footer links share native and embedded destination rules with the router', () => {
  const { installEndScroll } = require('../site/effects/flight.cjs');
  const effect = installEndScroll.toString();
  const hintSource = effect.slice(
    effect.indexOf('    function updateHint()'),
    effect.indexOf('    function clear()')
  );
  const hrefSource = source.match(/^ {2}function routeHref\(next\) \{[\s\S]*?^ {2}\}/m)[0];
  const routes = ['index', 'research', 'writing', 'talks', 'credits'];
  const declaredArticle = {
    url: 'articles/reader-profile.html',
    snapshot: `article-snapshots/${'a'.repeat(64)}/reader-profile.html`,
  };
  for (const context of [
    { entry: 'https://author.invalid/writing.html', directory: 'https://author.invalid/' },
    {
      entry: 'https://author.invalid/project/snapshots/abc/writing.html',
      directory: 'https://author.invalid/project/',
    },
    {
      entry: 'https://author.invalid/project/' + declaredArticle.snapshot,
      directory: 'https://author.invalid/project/',
      initialPage: 'article:reader-profile:en',
    },
    {
      entry: 'file:///review/ColorPrototype.html?view=writing',
      directory: 'file:///review/',
      embedded: {
        files: { talks: 'talks.html' },
        pages: { 'article:reader-profile:en': {} },
      },
    },
  ]) {
    const entry = new URL(context.entry);
    const currentWindow = { location: new URL(context.entry) };
    const navigation = vm.runInNewContext(
      '(() => {' +
        section('routeFor', 'address') +
        section('address', 'routeHref') +
        hrefSource +
        '; return { href: routeHref, routeFor, addressPage }; })()',
      {
        URL,
        routes,
        entry,
        window: currentWindow,
        initialPage: context.initialPage || 'writing',
        directory: new URL(context.directory),
        embedded: context.embedded || null,
        articles: { 'reader-profile:en': declaredArticle },
        document: { body: { dataset: { entryPage: 'writing' } } },
      }
    );
    assert.equal(
      navigation.addressPage(),
      context.initialPage || 'writing',
      'the initial document owns its filter address'
    );
    for (const route of routes) {
      currentWindow.location = new URL(navigation.href(route));
      assert.equal(navigation.routeFor(currentWindow.location), route, context.entry);
      assert.equal(navigation.addressPage(), route, 'live destination, not the mounted prior page');
    }
    for (const file of [
      declaredArticle.url,
      declaredArticle.url.slice(0, -5),
      declaredArticle.snapshot,
    ]) {
      currentWindow.location = context.embedded
        ? new URL(context.entry)
        : new URL(file, context.directory);
      if (context.embedded)
        currentWindow.location.searchParams.set('view', 'article:reader-profile:en');
      assert.equal(navigation.addressPage(), 'article:reader-profile:en', file);
    }
    currentWindow.location = new URL('unknown.html', context.directory);
    assert.equal(navigation.addressPage(), null, 'unknown different document stays unresolved');
    currentWindow.location = new URL('snapshots/another/writing.html', context.directory);
    assert.equal(navigation.addressPage(), null, 'another principal snapshot is not admitted');
    currentWindow.location = new URL('https://elsewhere.invalid/writing.html');
    assert.equal(navigation.addressPage(), null, 'a different origin never owns the archive');
    currentWindow.location = new URL(context.entry);
    currentWindow.location.searchParams.set('topic', 'delivery');
    currentWindow.location.hash = 'topic-delivery';
    assert.equal(
      navigation.addressPage(),
      context.initialPage || 'writing',
      'initial native snapshot or embedded document keeps query/hash ownership'
    );
    assert.equal(navigation.href('https://other.invalid/'), null);
    const footer = { querySelector: () => null, append() {} };
    const hint = vm.runInNewContext(
      '(() => { let hint = null;' + hintSource + '; updateHint(); return hint; })()',
      {
        content: { querySelector: () => footer },
        neighbor: () => 'talks',
        document: { body: { dataset: {} }, createElement: () => ({}) },
        window: { SiteNavigation: { href: navigation.href } },
        routes,
        names: ['Home', 'Research', 'Writing', 'Talks'],
        enabled: true,
      }
    );
    assert.equal(navigation.routeFor(new URL(hint.href, entry)), 'talks');
    const target = new URL(hint.href);
    if (context.embedded) {
      assert.equal(target.pathname, entry.pathname, 'offline stays in its one document');
      assert.equal(target.searchParams.get('view'), 'talks');
    } else {
      assert.equal(target.href, new URL('talks.html', context.directory).href);
      assert.equal(
        navigation.routeFor(new URL('writing.html?view=talks', context.directory)),
        'writing',
        'the observed old query link cannot select a native Talks document'
      );
    }
  }
});

for (const admission of [
  'router',
  'no-fetch',
  'no-parser',
  'no-history',
  'too-many-articles',
  'invalid-descriptor',
  'conflicting-resources',
  'missing-footer',
])
  test('native reader initializes once with ' + admission, () => {
    const calls = [];
    class Element {
      constructor(id = '') {
        this.id = id;
        this.children = [];
        this.dataset = {};
        this.attributes = new Map();
      }
      append(...nodes) {
        for (const node of nodes) {
          if (node.parent)
            node.parent.children = node.parent.children.filter((child) => child !== node);
          node.parent = this;
          this.children.push(node);
        }
      }
      before(node) {
        node.parent = this.parent;
        this.parent.children.splice(this.parent.children.indexOf(this), 0, node);
      }
      querySelector(selector) {
        return selector === 'main' ? this.children.find((node) => node.id === 'main') : null;
      }
      querySelectorAll() {
        return [];
      }
      getAttribute(name) {
        return this.attributes.get(name) ?? null;
      }
      setAttribute(name, value) {
        this.attributes.set(name, value);
      }
      addEventListener() {}
    }
    const body = new Element('body'),
      main = new Element('main'),
      footer = new Element('footer'),
      fallback = new Element('fallback');
    body.dataset = { page: 'writing', article: 'fixture:en' };
    body.append(main, footer, fallback);
    const saved = [false, true];
    const history = {
      state: { site: { reader: saved } },
      pushState: admission === 'no-history' ? undefined : () => {},
      replaceState(state) {
        assert.deepEqual(state.site.reader, saved);
        calls.push('history');
      },
    };
    const document = {
      body,
      head: new Element(),
      documentElement: { lang: 'en' },
      activeElement: body,
      implementation: {
        createHTMLDocument: () => ({ importNode: () => new Element() }),
      },
      createElement: () => new Element(),
      addEventListener() {},
      querySelector(selector) {
        if (selector === 'main') return main;
        if (selector === 'footer') return admission === 'missing-footer' ? null : footer;
        if (selector === '.space-fallback') return fallback;
        return {
          content: selector.includes('site-base') ? '../' : 'a'.repeat(64),
        };
      },
      querySelectorAll: () =>
        admission === 'conflicting-resources'
          ? ['one', 'two'].map((url) => ({
              tagName: 'IMG',
              getAttribute: (name) => (name === 'data-offline-resource' ? 'fixture' : url),
            }))
          : [],
      getElementById(id) {
        if (id === 'site-pages' && admission === 'conflicting-resources')
          return { textContent: '{"assets":{}}' };
        if (id !== 'site-documents') return null;
        const articles = { 'fixture:en': { url: 'articles/fixture.html' } };
        if (admission === 'invalid-descriptor') articles['fixture:en'].url = '../invalid';
        if (admission === 'too-many-articles')
          for (let index = 0; index < 50; index++) articles['extra' + index] = {};
        return { textContent: JSON.stringify(articles) };
      },
    };
    const window = {
      location: { href: 'https://fixture.test/articles/fixture.html' },
      fetch: admission === 'no-fetch' ? undefined : () => {},
      DOMParser: admission === 'no-parser' ? undefined : class {},
      history,
      addEventListener() {},
      SiteReader: {
        mount({ state }) {
          assert.deepEqual(state, saved);
          assert.equal(main.parent.id, admission === 'router' ? 'site-content' : 'body');
          if (admission === 'router') assert.equal(main.parent.parent.id, 'site-content-frame');
          calls.push('reader');
        },
        snapshot: () => saved,
      },
    };
    vm.runInNewContext(source, { window, document, history, URL });
    assert.deepEqual(calls, admission === 'router' ? ['reader', 'history'] : ['reader']);
  });

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
  departureCompletion = 'animationend',
  holdPulse = false,
  holdScene = false,
  holdRead = false,
  blurDeparture = false,
  failNativeScroll = false,
  initialPage = 'index',
  contentFlight = true,
  lazyArticleAdmission = false,
  holdArrival = null,
  initialURL = null,
  realRouter = false,
  siteBase = 'https://fixture.test/',
} = {}) {
  const calls = [],
    probes = [],
    assigned = [],
    tasks = new Map(),
    timerDelays = new Map(),
    listeners = new Map(),
    captureListeners = new Map(),
    historyEntries = [],
    historyWrites = [],
    blurredFocus = [],
    nativeScrollCalls = [],
    rebaseTargets = [],
    pulses = [],
    pulseNavigationIds = [];
  let timer = 0,
    clock = 10,
    historyIndex = 0,
    inert = false,
    finishScene,
    resolveScene,
    resolveRead,
    releaseRead,
    resolvePrepared,
    resolveDeparture,
    releaseDeparture,
    resolvePulseStarted,
    finishPulse,
    resolveArrival,
    releaseArrival,
    nativeSmooth = null,
    articleRegistryReady = !lazyArticleAdmission;
  const departureStarted = new Promise((resolve) => (resolveDeparture = resolve)),
    departureGate = new Promise((resolve) => (releaseDeparture = resolve)),
    pulseStarted = new Promise((resolve) => (resolvePulseStarted = resolve)),
    sceneStarted = new Promise((resolve) => (resolveScene = resolve)),
    readStarted = new Promise((resolve) => (resolveRead = resolve)),
    readGate = new Promise((resolve) => (releaseRead = resolve)),
    prepared = new Promise((resolve) => (resolvePrepared = resolve)),
    arrivalStarted = new Promise((resolve) => (resolveArrival = resolve)),
    arrivalGate = new Promise((resolve) => (releaseArrival = resolve));
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
    refreshPreference() {
      this.cancelRoute();
    },
    async depart(direction, navigationId, preserveResize) {
      calls.push({ kind: 'departure', direction, navigationId, preserveResize });
      content.main.setAttribute('data-route-blocks', 'departing');
      if (blurDeparture) blurContentFocus();
      if (holdDeparture && navigationId === 1) {
        resolveDeparture();
        await departureGate;
      }
      if (content.main.getAttribute('data-route-blocks') === 'departing')
        content.main.setAttribute('data-route-blocks', 'holding');
      return { completed: true, completedBy: departureCompletion };
    },
    prepareArrival(direction, navigationId, deferMeasure) {
      calls.push({ kind: 'prepare-arrival', direction, navigationId, deferMeasure });
      content.main.setAttribute('data-route-blocks', 'holding');
    },
    async arrive(direction, navigationId) {
      calls.push({ kind: 'arrival', direction, navigationId });
      content.main.setAttribute('data-route-blocks', 'arriving');
      if (holdArrival === navigationId) {
        resolveArrival();
        await arrivalGate;
      }
      content.main.removeAttribute('data-route-blocks');
    },
  };
  const window = {
    location: {
      href: initialURL || new URL(initialPage + '.html', siteBase).href,
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
    addEventListener: (name, listener, capture) =>
      (capture === true ? captureListeners : listeners).set(name, listener),
    dispatchEvent() {},
    SiteEngineProbe: (event) => probes.push(event),
    SiteScene: {
      canTravel: () => true,
      playDocumentPulse(navigationId) {
        pulses.push('start');
        pulseNavigationIds.push(navigationId);
        resolvePulseStarted();
        if (holdPulse) return new Promise((resolve) => (finishPulse = resolve));
        return Promise.resolve(true);
      },
      stopDocumentPulse() {
        if (!finishPulse) return;
        pulses.push('stop');
        finishPulse(false);
        finishPulse = null;
      },
      refresh() {},
      detachTravel() {},
      navigate(next, animate, update, landing, metadata) {
        calls.push({ kind: 'scene', next, animate, landing, ...metadata });
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
    presentation: {
      contentFlight(value) {
        if (typeof value === 'boolean') contentFlight = value;
        return contentFlight;
      },
      canTravel: () => true,
    },
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
    entry: new URL(window.location.href),
    directory: new URL(siteBase),
    embedded: null,
    initialPage,
    articles: {
      'sample:en': {
        url: 'articles/sample-en.html',
        snapshot: `article-snapshots/${'a'.repeat(64)}/sample-en.html`,
      },
    },
    innerHeight: 600,
    metadata: 'fixture-metadata',
    routes: ['index', 'research', 'writing', 'talks', 'credits'],
    routeFor(url) {
      if (!url.pathname.startsWith('/articles/')) return url.pathname.slice(1).replace('.html', '');
      if (!articleRegistryReady) return null;
      return 'article:' + url.pathname.split('/').at(-1).replace('-en.html', ':en');
    },
    articleTarget: (url) => url.pathname.startsWith('/articles/'),
    async pin() {
      articleRegistryReady = true;
      calls.push({ kind: 'admission' });
    },
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
    prepare(data) {
      resolvePrepared();
      return data;
    },
    clearText() {
      content.inert = false;
    },
    releaseEndpoint() {},
    releaseTail() {},
    closeSlides() {},
    arriveEndpoint() {},
    mountEndpoint() {},
    rebaseResources(data, url) {
      rebaseTargets.push(url.href);
    },
  };
  context.document.activeElement = context.document.body;
  const start = source.indexOf('  function documentDirection('),
    end = source.indexOf('  document.body.dataset.entryPage = page;', start),
    scrollStart = source.indexOf('  // One write after a gesture'),
    scrollEnd = source.indexOf("  window.addEventListener('site:motion-preference'", scrollStart),
    popStart = source.indexOf("  window.addEventListener('popstate', rememberReadingDeparture"),
    popEnd = source.indexOf("  window.addEventListener('site:reader-state'", popStart);
  assert.ok(start > 0 && end > start, 'missing authored navigation lifecycle boundary');
  assert.ok(scrollStart > 0 && scrollEnd > scrollStart, 'missing authored scroll-save boundary');
  assert.ok(popStart > 0 && popEnd > popStart, 'missing native history event boundary');
  vm.runInNewContext(
    `let page=${JSON.stringify(initialPage)},historyIndex=0,serial=0,request=null,transition=null,endpoint=null,inputTail=null,lastKey=null,scrollSave=null,readingAddress=window.location.href;
    const readingEntries=new Map();
    ${realRouter ? section('routeFor', 'routeHref') : ''}
    ${section('save', 'push')}${section('push', 'revisionValid')}
    ${interruptSource}${section('motionAllowed', 'restoreScroll')}${section('restoreScroll', 'endpointProbe')}${flightSource}
    ${section('mount', 'prepare')}${source.slice(start, end)}
    ${source.slice(scrollStart, scrollEnd)}
    ${source.slice(popStart, popEnd)}
    globalThis.navigate=navigate; globalThis.push=push;`,
    context
  );
  return {
    navigate: context.navigate,
    content,
    calls,
    pulses,
    pulseNavigationIds,
    probes,
    assigned,
    tasks,
    departureStarted,
    releaseDeparture,
    pulseStarted,
    finishPulse: (painted = true) => finishPulse(painted),
    sceneStarted,
    finishScene: () => finishScene(),
    readStarted,
    releaseRead,
    prepared,
    arrivalStarted,
    releaseArrival,
    historyEntries,
    historyWrites,
    push: (url) => context.push(new URL(url, window.location.href)),
    nativeScrollCalls,
    rebaseTargets,
    blurredFocus,
    document: context.document,
    window,
    setContentFlight(value) {
      contentFlight = value;
    },
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
      const event = { state: entry.state };
      captureListeners.get('popstate')?.(event);
      return listeners.get('popstate')(event);
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
test('without block motion, navigation stops inherited smooth scrolling and accepts deliberate read-time input', async () => {
  for (const explicitInput of [false, true]) {
    const h = routeHarness({ initialPage: 'writing', holdRead: true, contentFlight: false });
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
    site: { page: 'writing', index: 0, scroll: [0, 705], focus: 'article-sample-en' },
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
test('recent reading survives native Forward and Back before the scroll persistence debounce', async () => {
  const h = routeHarness({ initialPage: 'writing' });
  h.window.location.href += '?topic=delivery';
  h.focus('article-sample-en');
  h.window.scrollY = 2163;
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.travel(-1);
  h.window.scrollY = 574;
  h.focus('archive-topic');
  h.scheduleScrollSave();
  const writingBefore = structuredClone(h.historyEntries[0]);
  const articleBefore = structuredClone(h.historyEntries[1]);
  const writesBefore = h.historyWrites.length;
  await h.travel(1);
  assert.deepEqual(
    h.historyEntries[0],
    writingBefore,
    'capture never writes the departed entry through incoming history'
  );
  assert.equal(h.historyWrites.length, writesBefore + 1, 'only ordinary arrival writes history');
  assert.equal(h.historyEntries[1].state.site.page, articleBefore.state.site.page);
  h.runTimer(350);
  await h.travel(-1);
  assert.equal(h.window.scrollY, 574, 'latest native reading position, without waiting350ms');
  assert.equal(h.document.activeElement.id, 'archive-topic');
  assert.equal(new URL(h.window.location.href).search, '?topic=delivery');
  assert.equal(h.historyEntries.length, 2);
  assert.equal(h.historyEntries[0].state.unrelated, 'retained');
  assert.equal(h.historyEntries[0].state.site.scroll[1], 574);
  assert.deepEqual(h.assigned, []);
});

test('an arrival-time scroll timer preserves the recent target until focus restoration', async () => {
  const h = routeHarness({ initialPage: 'writing', holdArrival: 4 });
  h.focus('article-sample-en');
  h.window.scrollY = 2163;
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.travel(-1);
  h.window.scrollY = 574;
  h.focus('archive-topic');
  h.scheduleScrollSave();
  await h.travel(1);
  const back = h.travel(-1);
  await h.arrivalStarted;
  const writes = h.historyWrites.length;
  assert.equal(h.content.inert, false);
  assert.equal(h.content.main.getAttribute('data-route-blocks'), 'arriving');
  h.runTimer(350);
  assert.equal(
    h.historyWrites.length,
    writes,
    'transient arrival cannot serialize or retire the target'
  );
  h.releaseArrival();
  await back;
  assert.equal(h.window.scrollY, 574);
  assert.equal(h.document.activeElement.id, 'archive-topic');
  assert.equal(h.historyEntries[0].state.site.focus, 'archive-topic');
  assert.equal(h.historyWrites.length, writes + 1, 'one ordinary final-ready commit');
});

test('a direct initial principal snapshot restores its Writing document and recent state after native history', async () => {
  const original = `https://fixture.test/snapshots/${'b'.repeat(64)}/writing.html?topic=delivery`;
  const h = routeHarness({ initialPage: 'writing', initialURL: original, realRouter: true });
  h.focus('article-sample-en');
  h.window.scrollY = 705;
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.travel(-1);
  assert.equal(h.window.location.href, original);
  assert.equal(h.document.body.dataset.article, undefined);
  assert.equal(h.window.scrollY, 705);
  assert.equal(h.document.activeElement.id, 'article-sample-en');
  h.window.scrollY = 574;
  h.focus('archive-topic');
  await h.travel(1);
  await h.travel(-1);
  assert.equal(h.window.location.href, original);
  assert.equal(h.document.body.dataset.article, undefined);
  assert.equal(h.window.scrollY, 574);
  assert.equal(h.document.activeElement.id, 'archive-topic');
  assert.equal(h.historyEntries.length, 2);
  assert.deepEqual(h.assigned, []);
});

test('native history keeps duplicate Writing entries and new forward branches independent', async () => {
  const h = routeHarness({ initialPage: 'writing' });
  h.focus('archive-topic');
  h.window.scrollY = 100;
  h.push('?topic=delivery');
  h.window.scrollY = 200;
  h.focus('archive-language');
  h.push('?topic=delivery');
  h.window.scrollY = 300;
  h.focus('article-sample-en');
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.travel(-1);
  h.window.scrollY = 350;
  h.scheduleScrollSave();
  await h.travel(-1);
  assert.equal(h.window.scrollY, 200, 'earlier same-URL entry keeps its own position');
  assert.equal(h.document.activeElement.id, 'archive-language');
  await h.travel(1);
  assert.equal(h.window.scrollY, 350, 'later duplicate entry keeps recent reading');
  assert.equal(h.document.activeElement.id, 'article-sample-en');
  await h.travel(-1);
  h.push('?topic=systems');
  h.window.scrollY = 475;
  h.focus('archive-topic');
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.travel(-1);
  assert.equal(h.window.scrollY, 475, 'abandoned forward entry cannot replace a new branch');
  assert.equal(new URL(h.window.location.href).search, '?topic=systems');
  assert.equal(h.document.activeElement.id, 'archive-topic');
  assert.equal(h.historyEntries.length, 4);
  assert.deepEqual(h.assigned, []);
});

test('a direct immutable article entry retains its exact address and latest reading position', async () => {
  const original = `https://fixture.test/article-snapshots/${'a'.repeat(64)}/sample-en.html#detail`;
  const h = routeHarness({
    initialPage: 'article:sample:en',
    initialURL: original,
    realRouter: true,
  });
  h.focus('main');
  h.window.scrollY = 725;
  await h.navigate(new URL('https://fixture.test/writing.html'));
  await h.travel(-1);
  assert.equal(h.window.location.href, original);
  assert.equal(h.window.scrollY, 725);
  h.window.scrollY = 620;
  await h.travel(1);
  await h.travel(-1);
  assert.equal(h.window.location.href, original);
  assert.equal(h.window.scrollY, 620, 'history ownership uses the actual immutable address');
  assert.equal(h.document.body.dataset.article, 'sample:en');
  assert.equal(h.historyEntries.length, 2);
  assert.deepEqual(h.assigned, []);
});

test('recent history matches the exact entry and remains bounded without writing incoming state', () => {
  const entries = new Map();
  let departing = false;
  const context = {
    URL,
    page: 'writing',
    historyIndex: 0,
    readingAddress: 'https://fixture.test/writing.html?topic=delivery',
    readingEntries: entries,
    request: null,
    content: {
      inert: false,
      querySelector: () => ({ getAttribute: () => (departing ? 'departing' : null) }),
    },
    document: { activeElement: { id: 'archive-topic' } },
    history: {
      replaceState() {
        throw Error('incoming entry must not be written');
      },
    },
    routeFor: (url) => (url.pathname === '/unknown.html' ? null : 'writing'),
    window: {
      location: { href: 'https://fixture.test/articles/sample-en.html' },
      scrollX: 12,
      scrollY: 574,
    },
  };
  vm.runInNewContext(
    section('save', 'push') +
      section('push', 'revisionValid') +
      ';globalThis.recent={capture:rememberReadingDeparture,state:readingState,prune:pruneForwardReading};',
    context
  );
  const event = { state: { site: { index: 1 } } };
  context.recent.capture(event);
  assert.equal(entries.size, 1);
  const persisted = { page: 'writing', index: 0, scroll: [0, 2163], focus: 'article-sample-en' };
  context.window.location.href = context.readingAddress;
  assert.equal(context.recent.state(persisted).scroll[1], 574);
  assert.equal(context.recent.state(persisted).focus, 'archive-topic');
  for (const state of [
    { ...persisted, page: 'talks' },
    { ...persisted, index: 1 },
  ])
    assert.equal(context.recent.state(state), state);
  context.window.location.href += '&language=en';
  assert.equal(
    context.recent.state(persisted),
    persisted,
    'another query cannot reuse entry state'
  );
  assert.equal(context.recent.state(null), null);
  context.window.location.href = 'https://fixture.test/articles/sample-en.html';
  for (const mode of ['request', 'inert', 'departure', 'same-entry', 'unknown', 'missing-index']) {
    context.request = mode === 'request' ? {} : null;
    context.content.inert = mode === 'inert';
    departing = mode === 'departure';
    context.window.location.href =
      'https://fixture.test/' + (mode === 'unknown' ? 'unknown.html' : 'writing.html');
    const guarded = { state: { site: { index: mode === 'same-entry' ? 0 : 1 } } };
    if (mode === 'missing-index') delete guarded.state.site.index;
    context.window.scrollY = 999;
    context.recent.capture(guarded);
    assert.equal(entries.get(0).site.scroll[1], 574, mode + ' preserves captured reading');
  }
  context.request = null;
  context.content.inert = false;
  departing = false;
  for (let index = 1; index <= 130; index++) {
    context.historyIndex = index;
    context.readingAddress = 'https://fixture.test/writing.html?entry=' + index;
    context.recent.capture({ state: { site: { index: index + 1 } } });
  }
  assert.equal(entries.size, 128);
  context.window.location.href = 'https://fixture.test/writing.html?topic=delivery';
  assert.equal(
    context.recent.state(persisted),
    persisted,
    'evicted entry keeps serialized fallback'
  );
  context.historyIndex = 129;
  context.recent.prune();
  assert.ok(entries.has(129));
  assert.ok(!entries.has(130), 'a new branch discards abandoned future state');
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
    index: 0,
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
test('retargeting a hidden departure with blocks Off restores native read-time controls and scroll', async () => {
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
    h.setContentFlight(false);
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
      index: 0,
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
  const inertDocument = {
    importNode(node) {
      const copy = node.cloneNode(true);
      copy.ownerDocument = inertDocument;
      return copy;
    },
  };
  document.implementation = { createHTMLDocument: () => inertDocument };
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
    `let page='research',serial=0;${declaration}${cacheDocumentSource}${extractSource}${section('mountNative', 'prepare')}${prepare}
    globalThis.api={extract,prepare,mountNative};`,
    context
  );
  return {
    css,
    document,
    inertDocument,
    prepare: (data) => context.api.prepare(data),
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
test('route cache snapshots import independent nodes into an inert owner before live mounting', () => {
  const h = routeHeadHarness();
  const first = h.read('index');
  const second = h.read('index');
  for (const field of ['main', 'footer', 'fallback']) {
    assert.equal(first[field].ownerDocument, h.inertDocument);
    assert.notEqual(first[field], second[field]);
  }
  for (const node of first.metadata) assert.equal(node.ownerDocument, h.inertDocument);
  const prepared = h.prepare(first);
  for (const field of ['main', 'footer', 'fallback']) {
    assert.equal(
      prepared[field].ownerDocument,
      h.inertDocument,
      'URL rebasing stays inert until mount'
    );
    assert.notEqual(prepared[field], first[field]);
  }
  for (const node of prepared.metadata) assert.equal(node.ownerDocument, h.inertDocument);
  assert.equal(
    first.sourceURL,
    'https://site.test/research.html',
    'routing source remains explicit'
  );
  h.mount(first);
  h.mount(second);
  assert.deepEqual(h.blocks(), [h.css]);
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
    history: {
      pushState(state, unused, url) {
        context.window.location.href = String(url);
      },
      replaceState() {},
    },
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
    URL,
  };
  const start = source.indexOf('  function documentDirection(');
  const end = source.indexOf('  document.body.dataset.entryPage', start);
  vm.runInNewContext(
    `let page='index',historyIndex=0,serial=0,request=null,endpoint=null,inputTail=null,lastKey=null,readingAddress=window.location.href;
    const readingEntries=new Map();
    ${section('readingState', 'departureUnavailable')}${section('push', 'revisionValid')}
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

test('native immutable history mounts against the browser base for frozen reader resources and header links', async () => {
  const projection = require('./fixtures/reader-resource-links.json');
  const imageSource = projection.imageSrc;
  const pdfSource = projection.pdfHref;
  const headerHrefs = projection.headerHrefs;
  const snapshotPath = projection.origin.htmlPath.replace(/^docs\//, '');
  assert.ok(headerHrefs.length >= 5);
  const headerStart = source.indexOf(
    "    for (const link of document.querySelectorAll('.site-header a'))"
  );
  const headerEnd = source.indexOf("    span('mount-dom');", headerStart);
  assert.ok(headerStart > 0 && headerEnd > headerStart);
  const element = (attributes = {}, children = []) => ({
    attributes: { ...attributes },
    getAttribute(name) {
      return this.attributes[name] || null;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    querySelectorAll() {
      return children;
    },
  });
  for (const siteBase of ['https://fixture.test/', 'https://fixture.test/project/']) {
    const original = new URL(`article-snapshots/${'a'.repeat(64)}/sample-en.html`, siteBase);
    const h = routeHarness({
      initialPage: 'article:sample:en',
      initialURL: original.href,
      realRouter: true,
      siteBase,
    });
    await h.navigate(new URL('writing.html', siteBase));
    await h.travel(-1);
    const url = new URL(h.rebaseTargets.at(-1));
    const sourceURL = new URL(snapshotPath, siteBase);
    const image = element({ src: imageSource });
    const pdf = element({ href: pdfSource });
    const links = headerHrefs.map((href) => element({ href }));
    const headerURLs = new Map(
      links.map((link) => [link, new URL(link.getAttribute('href'), sourceURL)])
    );
    const data = {
      sourceURL,
      main: element({}, [image, pdf]),
      footer: element(),
      fallback: element(),
      scene: 'writing',
    };
    const context = {
      URL,
      entry: original,
      directory: new URL(siteBase),
      embedded: null,
      data,
      url,
      page: 'article:sample:en',
      headerURLs,
      routeFor: () => 'writing',
      document: { querySelectorAll: () => links },
    };
    vm.runInNewContext(
      section('rebaseResources', 'extract') +
        '\nrebaseResources(data,url);' +
        source.slice(headerStart, headerEnd),
      context
    );
    assert.equal(
      new URL(image.getAttribute('src'), h.window.location.href).href,
      new URL(imageSource, sourceURL).href
    );
    assert.equal(
      new URL(pdf.getAttribute('href'), h.window.location.href).href,
      new URL(pdfSource, sourceURL).href
    );
    for (const link of links)
      assert.equal(
        new URL(link.getAttribute('href'), h.window.location.href).href,
        headerURLs.get(link).href
      );
    assert.equal(
      url.href,
      original.href,
      'the actual immutable address owns native mount geometry'
    );
  }
});

test('first hosted article activation begins departure while its registry is admitted', async () => {
  const h = routeHarness({ initialPage: 'writing', lazyArticleAdmission: true });
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  assert.deepEqual(
    h.calls.map((call) => call.kind),
    ['departure', 'admission', 'scene', 'prepare-arrival', 'arrival']
  );
  assert.equal(h.calls.find((call) => call.kind === 'scene').toDocument, 'article:sample:en');
  for (const kind of ['departure', 'prepare-arrival', 'arrival'])
    assert.equal(h.calls.find((call) => call.kind === kind).direction, 1);
  assert.equal(h.content.main.getAttribute('data-route-blocks'), null);
  assert.deepEqual(h.assigned, []);
});

test('a watchdog departure releases native content without starting a document pulse', async () => {
  const h = routeHarness({ initialPage: 'writing', departureCompletion: 'watchdog' });
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  assert.deepEqual(h.pulses, []);
  assert.equal(
    h.calls.some(({ kind }) => kind === 'arrival'),
    false
  );
  assert.equal(h.content.main.getAttribute('data-route-blocks'), null);
  assert.deepEqual(h.assigned, []);
});

test('reader documents share the stationary Writing scene and preserve history and corridor direction', async () => {
  const h = routeHarness({ initialPage: 'writing' });
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.navigate(new URL('https://fixture.test/articles/second-en.html'));
  await h.travel(-1);
  await h.travel(1);
  await h.navigate(new URL('https://fixture.test/writing.html'));
  const flights = h.calls.filter((call) => call.kind === 'scene');
  assert.deepEqual(
    flights.map((call) => call.direction),
    [1, 1, -1, 1, -1]
  );
  assert.ok(flights.every((call) => !call.animate && call.documentChange));
  assert.deepEqual(h.pulses, Array(5).fill('start'));
  assert.deepEqual(h.pulseNavigationIds, [1, 2, 3, 4, 5]);
  assert.ok(
    h.calls.filter((call) => call.kind === 'departure').every((call) => call.preserveResize)
  );
  assert.ok(
    h.calls.filter((call) => call.kind === 'prepare-arrival').every((call) => call.deferMeasure)
  );
  assert.deepEqual(
    flights.map((call) => call.toDocument),
    ['article:sample:en', 'article:second:en', 'article:sample:en', 'article:second:en', 'writing']
  );
  assert.deepEqual(h.assigned, []);
  assert.deepEqual(
    h.calls.filter((call) => call.kind === 'departure').map((call) => call.direction),
    [1, 1, 1, 1, 1],
    'every article exits upward across both history directions'
  );
  assert.deepEqual(
    h.calls.filter((call) => call.kind === 'arrival').map((call) => call.direction),
    [1, 1, 1, 1, -1],
    'every article arrives from below, including backward article history'
  );
  for (const destination of ['index', 'research', 'writing', 'talks', 'credits']) {
    const reader = routeHarness({ initialPage: 'article:sample:en' });
    await reader.navigate(new URL('https://fixture.test/' + destination + '.html'));
    const flight = reader.calls.find((call) => call.kind === 'scene');
    assert.equal(flight.animate, destination !== 'writing', destination);
    assert.equal(flight.toDocument, destination);
    assert.equal(reader.calls.find((call) => call.kind === 'departure').direction, 1);
    assert.deepEqual(reader.assigned, []);
  }
  const back = routeHarness({ initialPage: 'writing' });
  await back.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await back.travel(-1);
  await back.travel(1);
  assert.deepEqual(
    back.calls.filter((call) => call.kind === 'departure').map((call) => call.direction),
    [1, 1, 1]
  );
  assert.deepEqual(
    back.calls.filter((call) => call.kind === 'arrival').map((call) => call.direction),
    [1, -1, 1],
    'article arrives from below on both entry and Forward; principal arrival keeps its policy'
  );
});

test('Block transitions Off skips the entire document showcase', async () => {
  const h = routeHarness({ initialPage: 'writing', contentFlight: false });
  await h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  assert.equal(h.calls.find((call) => call.kind === 'scene').animate, false);
  assert.deepEqual(h.pulses, []);
  assert.equal(
    h.calls.some((call) => ['departure', 'arrival'].includes(call.kind)),
    false
  );
  assert.deepEqual(h.assigned, []);
});

test('a timed-out read releases a running showcase and cannot mount a late article', async () => {
  const h = routeHarness({ initialPage: 'writing', holdRead: true, holdPulse: true });
  const article = new URL('https://fixture.test/articles/sample-en.html');
  const pending = h.navigate(article);
  await h.readStarted;
  await h.pulseStarted;
  assert.deepEqual(h.pulses, ['start']);
  assert.equal(h.calls[0].kind, 'departure');
  assert.equal(
    h.calls.some((call) => call.kind === 'scene'),
    false
  );
  h.runTimer(8000);
  assert.deepEqual(h.pulses, ['start', 'stop']);
  assert.equal(h.content.main.getAttribute('data-route-blocks'), null);
  h.releaseRead();
  await pending;
  assert.equal(
    h.calls.some((call) => call.kind === 'scene'),
    false
  );
  assert.deepEqual(h.assigned, [article.href]);
  assert.equal(h.content.hasAttribute('aria-busy'), false);
});

test('a ready article waits for the outgoing wave and one finished showcase before entering', async () => {
  const h = routeHarness({
    initialPage: 'writing',
    holdDeparture: true,
    holdPulse: true,
    holdArrival: 1,
  });
  const pending = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.departureStarted;
  assert.deepEqual(h.pulses, []);
  assert.deepEqual(
    h.calls.map((call) => call.kind),
    ['departure']
  );
  h.content.main.setAttribute('data-route-blocks', 'holding');
  h.window.scrollY = 400;
  h.scheduleScrollSave();
  h.runTimer(350);
  assert.deepEqual(h.historyEntries[0].state.site.scroll, [0, 0]);
  await h.prepared;
  h.document.activeElement = { id: 'appearance', getAttribute: () => null };
  h.releaseDeparture();
  await h.pulseStarted;
  assert.deepEqual(
    h.calls.map((call) => call.kind),
    ['departure']
  );
  assert.deepEqual(h.pulses, ['start']);
  assert.equal(h.content.main.getAttribute('data-route-blocks'), 'holding');
  h.finishPulse();
  await h.arrivalStarted;
  assert.deepEqual(h.historyEntries[0].state.site.scroll, [0, 0]);
  assert.equal(h.historyEntries[0].state.site.focus, 'appearance');
  assert.deepEqual(
    h.calls.map((call) => call.kind),
    ['departure', 'scene', 'prepare-arrival', 'arrival']
  );
  assert.deepEqual(h.pulses, ['start']);
  assert.equal(h.calls.find((call) => call.kind === 'scene').animate, false);
  assert.equal(h.calls.find((call) => call.kind === 'prepare-arrival').deferMeasure, true);
  assert.equal(h.content.main.getAttribute('data-route-blocks'), 'arriving');
  assert.equal(h.tasks.size, 0, 'the read deadline cannot clear a valid arrival wave');
  h.releaseArrival();
  await pending;
  assert.equal(h.content.main.getAttribute('data-route-blocks'), null);
});

test('a read can outlast the showcase without replaying it or mounting early', async () => {
  const h = routeHarness({ initialPage: 'writing', holdRead: true, holdPulse: true });
  const pending = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.readStarted;
  await h.pulseStarted;
  h.finishPulse();
  assert.deepEqual(
    h.calls.map((call) => call.kind),
    ['departure']
  );
  h.releaseRead();
  await pending;
  assert.deepEqual(h.pulses, ['start']);
  assert.equal(h.calls.at(-1).kind, 'arrival');
});
test('a cancelled showcase mounts without starting the incoming block animation', async () => {
  const h = routeHarness({ initialPage: 'writing', holdPulse: true });
  const pending = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.pulseStarted;
  h.finishPulse(false);
  await pending;
  assert.deepEqual(
    h.calls.map((call) => call.kind),
    ['departure', 'scene']
  );
  assert.equal(h.content.main.getAttribute('data-route-blocks'), null);
});

test('releasing the hold after a showcase prevents an arrival from rearming on a slow read', async () => {
  const h = routeHarness({ initialPage: 'writing', holdRead: true, holdPulse: true });
  const pending = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.pulseStarted;
  h.finishPulse();
  h.content.main.removeAttribute('data-route-blocks');
  h.releaseRead();
  await pending;
  assert.deepEqual(
    h.calls.map((call) => call.kind),
    ['departure', 'scene']
  );
});

test('retargeting during a showcase releases it and commits only the new corridor', async () => {
  const h = routeHarness({ initialPage: 'writing', holdPulse: true });
  const stale = h.navigate(new URL('https://fixture.test/articles/sample-en.html'));
  await h.pulseStarted;
  const latest = h.navigate(new URL('https://fixture.test/research.html'));
  await Promise.all([stale, latest]);
  assert.deepEqual(h.pulses, ['start', 'stop']);
  const flights = h.calls.filter((call) => call.kind === 'scene');
  assert.deepEqual(
    flights.map((call) => [call.next, call.animate]),
    [['research', true]]
  );
  assert.equal(h.historyEntries.length, 2);
  assert.equal(h.historyEntries[1].state.site.page, 'research');
});
