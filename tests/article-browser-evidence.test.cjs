'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateArticleJourney,
  installArticleHistoryDiagnostics,
  articleHistoryCheckpoint,
} = require('../tools/quality/article-browser.cjs');
const stage = require('../tools/quality/staging-regression.cjs');
const fixture = require('./fixtures/staging-evidence.cjs');

const key = 'representative:en';
const descriptors = { [key]: { version: 'f'.repeat(64), candidate: true } };
const engine = fixture.manifest().components.engine;
const baseURL = 'https://candidate.example.invalid/author';

function observed() {
  const normal = Object.fromEntries(
    [
      'metadataTransition',
      'filtersBackForward',
      'focusAndScrollHistory',
      'persistentCanvas',
      'nativeAnchors',
      'deepRefresh',
      'readingBlocks',
      'routeDeparture',
      'rapidCancellation',
      'assetsDecoded',
    ].map((name) => [name, true])
  );
  const head = {
    key,
    lang: 'en',
    routeVersion: descriptors[key].version,
    engine,
    title: 'Controlled article fixture',
    description: 'This fixture validates evidence; it is not a browser observation.',
    author: 'Fixture author',
    robots: 'noindex,nofollow',
    canonical: [],
    alternates: [],
    schemas: [
      {
        '@type': 'Article',
        headline: 'Controlled article fixture',
        author: { '@type': 'Person', name: 'Fixture author' },
        inLanguage: 'en',
      },
    ],
  };
  return {
    kind: 'bounded-article-journey',
    browser: 'Controlled validator fixture; not a browser observation',
    documents: [key],
    availableDocuments: [key],
    observations: [
      ...[1440, 390].map((width) => ({
        key,
        width,
        mode: 'normal',
        head: structuredClone(head),
        reading: {
          entered: ['first-section'],
          departed: ['first-section'],
          maxEntering: 1,
          maxRoute: 1,
        },
        checks: { ...normal, basePath: '/author/' },
      })),
      ...['off', 'no-canvas', 'no-js'].map((mode) => ({
        key,
        width: 390,
        mode,
        head: structuredClone(head),
        checks: {
          nativeReading: true,
          anchors: true,
          writingLink: true,
          singleCanvas: true,
          basePath: '/author/',
        },
      })),
    ],
  };
}

test('article evidence is conditional and complete without changing the five-room stage matrix', () => {
  assert.deepEqual(validateArticleJourney(undefined, {}), {
    documents: 0,
    observations: 0,
  });
  assert.deepEqual(validateArticleJourney(observed(), descriptors, { engine, baseURL }), {
    documents: 1,
    observations: 5,
  });
  const manifest = fixture.manifest();
  const report = fixture.functional(manifest);
  const before = stage.validateFunctional(report, manifest);
  manifest.components.articles = descriptors;
  manifest.components.engine = engine;
  report.articles = observed();
  const after = stage.validateFunctional(report, manifest);
  assert.equal(after.articleObservations, 5);
  delete after.articleObservations;
  assert.deepEqual(after, before);
});

test('selected articles reject omitted, duplicate, failed or wrong-source browser observations', () => {
  assert.throws(() => validateArticleJourney(undefined, descriptors), /require actual browser/);
  assert.throws(() => validateArticleJourney(observed(), {}), /without selected/);
  for (const mutate of [
    (detail) => {
      detail.observations.pop();
    },
    (detail) => {
      detail.observations.push(structuredClone(detail.observations[0]));
    },
    (detail) => {
      detail.availableDocuments = [];
    },
    (detail) => {
      detail.documents = ['other:en'];
    },
    (detail) => {
      detail.observations[0].key = 'other:en';
    },
    (detail) => {
      detail.observations[0].head.lang = 'uk';
    },
    (detail) => {
      detail.observations[0].head.routeVersion = 'a'.repeat(64);
    },
    (detail) => {
      detail.observations[0].head.engine = 'b'.repeat(64);
    },
    (detail) => {
      detail.observations[0].checks.basePath = '/outside/';
    },
    (detail) => {
      detail.observations[0].checks.assetsDecoded = false;
    },
    (detail) => {
      detail.observations[4].checks.nativeReading = false;
    },
    (detail) => {
      detail.observations[4].head.engine = 'b'.repeat(64);
    },
    (detail) => {
      detail.observations[4].checks.basePath = '/outside/';
    },
    (detail) => {
      detail.observations[0].reading.entered = [];
    },
    (detail) => {
      detail.observations[0].reading.departed = [];
    },
    (detail) => {
      detail.observations[0].reading.maxEntering = 7;
    },
    (detail) => {
      detail.observations[0].reading.maxRoute = 25;
    },
    (detail) => {
      detail.observations.forEach((row) => {
        row.head.title = '';
      });
    },
    (detail) => {
      detail.observations.forEach((row) => {
        row.head.canonical = ['https://candidate.example.invalid/'];
      });
    },
    (detail) => {
      detail.observations.forEach((row) => {
        row.head.schemas[0].datePublished = '2026-10-12';
      });
    },
  ]) {
    const detail = observed();
    mutate(detail);
    assert.throws(() => validateArticleJourney(detail, descriptors, { engine, baseURL }));
  }
});

test('the staging collector exercises articles only on its admitted Chromium and joins failures and cleanup', async () => {
  for (const articles of [true, false]) {
    for (const fails of articles ? [false, true] : [false]) {
      const manifest = fixture.manifest();
      if (articles) manifest.components.articles = descriptors;
      const calls = [];
      const closed = [];
      const helpers = {
        launch: async (engine) => ({
          engine,
          executable: 'controlled fixture',
          version: () => 'controlled fixture; not an actual browser',
          close: async () => closed.push(engine),
        }),
        preview: async (browser, _url, source, _variant, width, mode) =>
          fixture.journeyRow({ engine: browser.engine, width, mode }, source),
        nav: async (_browser, _url, selected) => fixture.navigationRow(selected),
        failure: async (_browser, _url, selected) => fixture.failureRow(selected),
        analytics: async (_browser, _engine, selection) => selection.map(fixture.analyticsRow),
        article: async (browser, url, source) => {
          calls.push({ engine: browser.engine, url, source });
          if (fails) throw Error('controlled article collection failure');
          return observed();
        },
      };
      const detail = await stage.collectFunctional(baseURL, manifest, helpers);
      assert.deepEqual(closed.sort(), ['chromium', 'firefox']);
      assert.deepEqual(
        calls,
        articles ? [{ engine: 'chromium', url: baseURL, source: manifest }] : []
      );
      const report = {
        ...fixture.identity(manifest),
        kind: 'stage-functional',
        ...detail,
      };
      if (fails) {
        assert.deepEqual(detail.startupFailures, [
          {
            engine: 'chromium',
            error: 'controlled article collection failure',
          },
        ]);
        assert.throws(() => stage.validateFunctional(report, manifest), /require actual browser/);
      } else {
        assert.deepEqual(detail.startupFailures, []);
        assert.equal(
          stage.validateFunctional(report, manifest).articleObservations,
          articles ? 5 : undefined
        );
      }
    }
  }
});

test('bounded article history diagnostics retain original Back state and geometry without changing native owners', () => {
  const listeners = new Map();
  const anchorListeners = new Map();
  const events = (target) => ({
    addEventListener(type, callback, options) {
      const rows = target.get(type) || [];
      rows.push({ callback, once: options?.once === true });
      target.set(type, rows);
    },
    removeEventListener(type, callback) {
      target.set(
        type,
        (target.get(type) || []).filter((row) => row.callback !== callback)
      );
    },
  });
  const emit = (target, type, event = {}) => {
    for (const row of [...(target.get(type) || [])]) {
      row.callback(event);
      if (row.once)
        target.set(
          type,
          target.get(type).filter((next) => next !== row)
        );
    }
  };
  let observer;
  let reads = 0;
  let heightReads = 0;
  let documentHeight = 4666;
  let activationLayoutPending = true;
  const content = { inert: false, hasAttribute: () => false };
  const rect = { top: 105, bottom: 4472, height: 4367 };
  const element = {
    getBoundingClientRect() {
      reads++;
      if (activationLayoutPending) {
        activationLayoutPending = false;
        scope.scrollY = 3607;
        scope.document.activeElement = { id: 'changed-by-layout' };
      }
      return rect;
    },
  };
  const scope = {
    ...events(listeners),
    performance: { now: () => 100 },
    scrollY: 3770,
    innerHeight: 844,
    structuredClone,
    location: { href: baseURL + '/writing?topic=systems&language=en' },
    history: {
      state: { site: { page: 'writing', scroll: [0, 0], focus: null } },
    },
    scrollTo() {
      assert.fail('an observational diagnostic cannot scroll');
    },
    document: {
      documentElement: {
        get scrollHeight() {
          heightReads++;
          return documentHeight;
        },
        set scrollHeight(value) {
          documentHeight = value;
        },
      },
      activeElement: { id: 'article-link-representative-en' },
      body: { dataset: { page: 'writing' } },
      querySelector: (selector) => (selector === '#site-content' ? content : element),
      querySelectorAll: () => [],
    },
    MutationObserver: class {
      constructor(callback) {
        this.callback = callback;
        observer = this;
      }
      observe(target, options) {
        assert.equal(target, content);
        assert.deepEqual(options.attributeFilter, ['data-scroll-entry']);
      }
      disconnect() {
        this.disconnected = true;
      }
    },
  };
  const anchor = events(anchorListeners);
  const originalHistory = scope.history;
  const originalScroll = scope.scrollTo;
  installArticleHistoryDiagnostics(anchor, scope);
  emit(anchorListeners, 'click');
  assert.deepEqual(scope.__articleArchiveDeparture, {
    scroll: 3770,
    focus: 'article-link-representative-en',
  });
  assert.equal(reads, 0, 'activation does not read rectangles before navigation');
  assert.equal(heightReads, 0, 'activation does not read scroll height before navigation');
  assert.equal(scope.scrollY, 3770, 'activation preserves the live viewport');
  assert.equal(scope.document.activeElement.id, 'article-link-representative-en');
  assert.deepEqual(scope.__articleHistoryDiagnostics.activation, {
    kind: 'activation',
    time: 100,
    scroll: 3770,
    focus: 'article-link-representative-en',
  });
  scope.document.activeElement = { id: 'article-link-representative-en' };
  scope.scrollY = 3733;
  observer.callback([{ oldValue: 'waiting', target: { hasAttribute: () => false } }]);
  assert.equal(scope.__articleHistoryDiagnostics.cleanup.scroll, 3733);
  assert.equal(scope.scrollY, 3607, 'later geometry reads exercise the adverse fixture');
  assert.equal(scope.document.activeElement.id, 'changed-by-layout');
  assert.deepEqual(scope.__articleArchiveDeparture, {
    scroll: 3770,
    focus: 'article-link-representative-en',
  });
  const diagnostic = scope.__articleHistoryDiagnostics;
  for (let index = 0; index < 50; index++) emit(listeners, 'scroll', { isTrusted: true });
  assert.equal(diagnostic.samples.length, 24);
  assert.ok(diagnostic.dropped > 0);
  const boundedReads = reads;
  emit(listeners, 'scroll', { isTrusted: true });
  assert.equal(reads, boundedReads, 'samples beyond the bound do not force layout');
  emit(listeners, 'site:page-mount');
  const popped = {
    page: 'writing',
    scroll: [0, 3770],
    focus: 'article-link-representative-en',
  };
  scope.scrollY = 3607;
  scope.history.state.site = { ...popped, scroll: [0, 3607] };
  scope.document.documentElement.scrollHeight = 4451;
  emit(listeners, 'site:page-mount', { detail: { page: 'writing' } });
  emit(listeners, 'site:page-ready');
  emit(listeners, 'popstate', { state: { site: popped } });
  popped.scroll[1] = 3607;
  assert.equal(diagnostic.popstate.saved.scroll[1], 3770, 'original saved Back position');
  assert.equal(diagnostic.restoration.scroll, 3607, 'actual native restoration');
  assert.equal(diagnostic.restoration.maxScroll, 3607, 'restoration maximum explains clamp');
  const completedReads = reads;
  emit(listeners, 'scroll', { isTrusted: true });
  emit(listeners, 'site:page-ready');
  assert.equal(reads, completedReads, 'completed critical snapshots do not repeat layout');
  const checkpoint = articleHistoryCheckpoint(scope);
  assert.equal(checkpoint.history.scroll[1], 3607);
  assert.equal(checkpoint.historyDiagnostics.popstate.saved.scroll[1], 3770);
  assert.equal(checkpoint.geometry.maxScroll, 3607);
  scope.__articleHistoryCleanup();
  assert.equal(observer.disconnected, true);
  assert.ok([...listeners.values(), ...anchorListeners.values()].every((rows) => !rows.length));
  assert.equal(scope.history, originalHistory);
  assert.equal(scope.scrollTo, originalScroll);
  assert.equal(content.inert, false);
});
