'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateArticleJourney,
  validateArticleFlight,
  validateArticleBlocks,
  installArticleFlightDiagnostics,
  installArticleHistoryDiagnostics,
  articleHistoryCheckpoint,
  articleAnchorCount,
  validateReaderInteractions,
  waitForReaderAnchor,
} = require('../tools/quality/article-browser.cjs');
const stage = require('../tools/quality/staging-regression.cjs');
const fixture = require('./fixtures/staging-evidence.cjs');

const key = 'representative:en';
const descriptors = { [key]: { version: 'f'.repeat(64), candidate: true } };
const engine = fixture.manifest().components.engine;
const baseURL = 'https://candidate.example.invalid/author';

const { flight } = require('./fixtures/article-flight.cjs');

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
        relatedDeparture: { present: false, departed: false },
        nativeHistory: [
          flight('writing', 'article:' + key, -1),
          flight('article:' + key, 'writing', 1),
        ],
        flights: [
          flight('writing', 'article:' + key, 1),
          flight('article:' + key, 'writing', -1),
          flight('writing', 'article:' + key, 1),
          flight('article:' + key, 'research', -1),
          ...['index', 'writing', 'talks', 'credits'].map((to) =>
            flight('article:' + key, to, ['index', 'writing'].includes(to) ? -1 : 1)
          ),
        ],
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
          ...(mode === 'off' ? { reducedMotion: true } : {}),
          basePath: '/author/',
        },
      })),
    ],
  };
}

function readerObserved(mode) {
  const before = {
    url: 'https://candidate.example.invalid/author/article.html',
    scroll: 600,
  };
  const rect = {
    top: 24,
    bottom: 700,
    left: 16,
    right: 374,
    width: 358,
    height: 676,
  };
  const opened = {
    ...before,
    open: true,
    focusInside: true,
    focusRestored: false,
    viewport: { width: 390, height: 844 },
    bounds: rect,
    close: {
      top: 44,
      bottom: 88,
      left: 270,
      right: 354,
      width: 84,
      height: 44,
    },
    image: {
      src: 'https://candidate.example.invalid/author/image.webp',
      alt: 'Synthetic grid',
      width: 310,
      naturalWidth: 640,
    },
    original: 'https://candidate.example.invalid/author/image.webp',
    stage: { width: 310, overflow: 'auto' },
    pressed: 'false',
    zoomed: false,
  };
  const closed = {
    ...opened,
    open: false,
    focusInside: false,
    focusRestored: true,
    image: null,
  };
  const fragment = (hash) => ({
    hash,
    top: 190,
    bottom: 220,
    height: 844,
    occlusion: 170,
    appendixOpen: true,
    dialogs: 0,
  });
  return {
    inventory: {
      headings: ['inspecting-a-figure'],
      topics: [{ href: '#inspecting-a-figure', label: 'Inspecting a figure' }],
      images: [
        {
          src: opened.image.src,
          href: opened.image.src,
          alt: opened.image.alt,
        },
      ],
      citations: [{ id: 'reader-cite-1-1', href: '#reader-note-1', target: true }],
    },
    image:
      mode === 'no-js'
        ? null
        : {
            before,
            opened,
            zoomed: {
              ...opened,
              pressed: 'true',
              zoomed: true,
              image: { ...opened.image, width: 640 },
            },
            escape: closed,
            close: closed,
          },
    source: {
      expected: 'Format reference',
      ...(mode === 'no-js'
        ? { native: fragment('#reader-note-1') }
        : {
            before,
            opened: {
              ...opened,
              image: null,
              text: 'Format reference',
              full: '#reader-note-1',
              duplicateIds: 0,
              returns: 0,
            },
            escape: closed,
            full: fragment('#reader-note-1'),
          }),
      returned: fragment('#reader-cite-1-1'),
    },
    topic: {
      ...fragment('#inspecting-a-figure'),
      menu: {
        before: {
          top: 90,
          bottom: 142,
          scroll: 900,
          scrollPaddingTop: 80,
          summary: { top: 90, bottom: 142 },
        },
        opened: { top: 90, bottom: 500, scroll: 900 },
      },
    },
    ...(mode === 'no-js' ? { native: { count: 2, hidden: true } } : {}),
    ...(mode === 'normal'
      ? {
          cleanup: {
            opened: true,
            open: false,
            images: 0,
            connected: false,
            live: 0,
            overflow: 'auto',
          },
        }
      : {}),
  };
}

test('reader interaction evidence covers native fallbacks and measured dialog usability', () => {
  for (const mode of ['normal', 'off', 'no-canvas', 'no-js'])
    assert.doesNotThrow(() => validateReaderInteractions(readerObserved(mode), mode));
  for (const corrupt of [
    (row) => {
      row.inventory.topics = [];
    },
    (row) => {
      row.inventory.images[0].href += '?different';
    },
    (row) => {
      row.inventory.citations[0].target = false;
    },
    (row) => {
      row.image.opened.url += '#changed';
    },
    (row) => {
      row.image.opened.scroll += 40;
    },
    (row) => {
      row.image.opened.close.bottom = 900;
    },
    (row) => {
      row.image.opened.focusInside = false;
    },
    (row) => {
      row.image.zoomed.image.width = 310;
    },
    (row) => {
      row.image.zoomed.stage.overflow = 'hidden';
    },
    (row) => {
      row.image.escape.focusRestored = false;
    },
    (row) => {
      row.image.close.image = row.image.opened.image;
    },
    (row) => {
      row.source.opened.full = '#wrong-source';
    },
    (row) => {
      row.source.opened.text = 'Truncated reference';
    },
    (row) => {
      row.source.opened.duplicateIds = 1;
    },
    (row) => {
      row.source.opened.returns = 1;
    },
    (row) => {
      row.source.full.appendixOpen = false;
    },
    (row) => {
      row.source.returned.hash = '#wrong-passage';
    },
    (row) => {
      row.topic.top = 100;
    },
    (row) => {
      row.topic.menu.opened.scroll = 400;
    },
    (row) => {
      row.topic.menu.before.summary.top = 79;
    },
    (row) => {
      row.topic.menu.opened.bottom = 1000;
    },
    (row) => {
      row.topic.menu.opened.top = -1;
    },
    (row) => {
      row.topic.menu.opened.bottom = row.topic.menu.opened.top;
    },
    (row) => {
      row.cleanup.open = true;
    },
    (row) => {
      row.cleanup.images = 1;
    },
    (row) => {
      row.cleanup.overflow = 'hidden';
    },
  ]) {
    const wrong = structuredClone(readerObserved('normal'));
    corrupt(wrong);
    assert.throws(() => validateReaderInteractions(wrong, 'normal'));
  }
  const native = readerObserved('no-js');
  native.native.hidden = false;
  assert.throws(() => validateReaderInteractions(native, 'no-js'));
});

test('native anchor stabilization uses host time without relaxing its deadline or sample count', async () => {
  const run = (observe) => {
    let elapsed = 0,
      reads = 0;
    const page = {
      async evaluate() {
        return observe(reads++);
      },
      waitForFunction() {
        throw Error('Page timers are disabled');
      },
    };
    return {
      wait: () =>
        waitForReaderAnchor(page, '#source', {
          now: () => elapsed,
          pause: async (duration) => {
            elapsed += duration;
          },
        }),
      state: () => ({ elapsed, reads }),
    };
  };
  const settled = run((index) => ({ hash: '#source', scroll: index === 0 ? 100 : 200 }));
  await settled.wait();
  assert.deepEqual(
    settled.state(),
    { elapsed: 200, reads: 5 },
    'scroll movement resets the three stable sample requirement'
  );
  for (const observe of [
    () => ({ hash: '#wrong', scroll: 200 }),
    (index) => ({ hash: '#source', scroll: index * 10 }),
  ]) {
    const blocked = run(observe);
    await assert.rejects(blocked.wait(), /did not settle within 2000 ms.*"fragment":"#source"/);
    assert.deepEqual(
      blocked.state(),
      { elapsed: 2000, reads: 40 },
      'wrong anchors and ongoing motion fail inside the original deadline'
    );
  }
});

test('article anchor lookup accepts numeric HTML IDs and literal CSS punctuation', async () => {
  const numeric = '1-when-ideas-outlive-their-authors';
  const punctuated = '2-section:"quoted"[detail]';
  const unicode = '3-розділ';
  const elements = [{ id: numeric }, { id: punctuated }, { id: unicode }];
  const page = {
    locator(selector) {
      assert.equal(selector, '[id]', 'HTML fragment text never becomes a CSS selector');
      return {
        async evaluateAll(inspect, id) {
          return inspect(elements, id);
        },
      };
    },
  };
  assert.equal(await articleAnchorCount(page, '#' + numeric), 1);
  assert.equal(await articleAnchorCount(page, '#' + encodeURIComponent(punctuated)), 1);
  assert.equal(await articleAnchorCount(page, '#' + encodeURIComponent(unicode)), 1);
  assert.equal(await articleAnchorCount(page, '#missing'), 0);
  elements.push({ id: numeric });
  assert.equal(
    await articleAnchorCount(page, '#' + numeric),
    2,
    'duplicate targets remain visible'
  );
});

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

test('reader-mode evidence requires stationary paragraphs while preserving legacy entry evidence', () => {
  const motion = require('../tools/quality/color-motion-contract.cjs');
  const current = motion.reviewedRuntime('issue5-reader-mode-staging').variant.fingerprint;
  const detail = observed();
  for (const row of detail.observations) {
    row.head.engine = current;
    if (row.reading) {
      row.reading.entered = [];
      row.reading.maxEntering = 0;
    }
  }
  assert.deepEqual(validateArticleJourney(detail, descriptors, { engine: current, baseURL }), {
    documents: 1,
    observations: 5,
  });
  for (const corrupt of [
    (row) => {
      row.reading.entered = ['section'];
    },
    (row) => {
      row.reading.maxEntering = 1;
    },
    (row) => {
      row.reading.departed = [];
    },
    (row) => {
      row.reading.maxRoute = 25;
    },
  ]) {
    const wrong = structuredClone(detail);
    corrupt(wrong.observations[0]);
    assert.throws(() => validateArticleJourney(wrong, descriptors, { engine: current, baseURL }));
  }
  assert.equal(motion.articleReadingMode(current), 'stationary');
  assert.equal(
    motion.articleReadingMode(
      motion.reviewedRuntime('issue5-reader-mode-plain').variant.baseEngine
    ),
    'stationary'
  );
  assert.equal(
    motion.articleReadingMode(
      motion.reviewedRuntime('issue5-real-article-staging').variant.fingerprint
    ),
    'entry'
  );
  assert.equal(motion.articleReadingMode('d'.repeat(64)), 'entry');
  assert.doesNotThrow(() => validateArticleJourney(observed(), descriptors, { engine, baseURL }));
});

test('reader-block evidence is required for every current identity while historical reports remain valid', () => {
  const motion = require('../tools/quality/color-motion-contract.cjs');
  const identities = [
    'issue5-reader-blocks',
    'issue5-reader-block-elements',
    'issue5-reader-visible-blocks',
    'issue5-reader-interactions',
  ].flatMap((family) =>
    ['plain', 'staging', 'production'].map(
      (edition) => motion.reviewedRuntime(family + '-' + edition).variant
    )
  );
  const make = (selectedEngine) => {
    const detail = observed();
    for (const row of detail.observations) {
      row.head.engine = selectedEngine;
      if (motion.readerInteractionsRequired(selectedEngine)) row.reader = readerObserved(row.mode);
      if (row.mode !== 'normal') continue;
      row.reading.entered = [];
      row.reading.maxEntering = 0;
      for (const item of [...row.flights, ...row.nativeHistory])
        item.blocks = ['departure', 'arrival'].map((stage) => {
          const departure = stage === 'departure';
          const source = departure ? item.from : item.to;
          const other = departure ? item.to : item.from;
          const sign =
            source.startsWith('article:') && !other.startsWith('article:') ? 1 : item.direction;
          return {
            stage,
            direction: sign > 0 ? 'forward' : 'backward',
            navigationId: item.events[0].navigationId,
            rows: 1,
            plannedDurationMs: 1000,
            units: [
              {
                tag: 'P',
                classes: '',
                distance: (departure ? -sign : sign) * 600,
                row: 0,
                state: departure ? 'departing' : 'arriving',
                frames: [{ computedOffset: 0 }, { computedOffset: 1 }],
              },
            ],
          };
        });
    }
    return detail;
  };
  for (const current of new Set(
    identities.flatMap((item) => [item.baseEngine, item.fingerprint])
  )) {
    assert.deepEqual(
      validateArticleJourney(make(current), descriptors, {
        engine: current,
        baseURL,
      }),
      {
        documents: 1,
        observations: 5,
      }
    );
    for (const inventory of ['flights', 'nativeHistory']) {
      const absent = make(current);
      delete absent.observations[0][inventory][0].blocks;
      assert.throws(
        () =>
          validateArticleJourney(absent, descriptors, {
            engine: current,
            baseURL,
          }),
        /block evidence/
      );
    }
    if (motion.readerInteractionsRequired(current)) {
      for (const row of make(current).observations) {
        const absent = make(current);
        delete absent.observations.find(
          (item) => item.mode === row.mode && item.width === row.width
        ).reader;
        assert.throws(
          () => validateArticleJourney(absent, descriptors, { engine: current, baseURL }),
          /interaction observations/
        );
      }
    }
  }
  const current = identities[0].baseEngine;
  for (const corrupt of [
    (item) => {
      item.blocks = [];
    },
    (item) => {
      item.blocks[0].stage = 'arrival';
    },
    (item) => {
      item.blocks[0].direction = 'backward';
    },
    (item) => {
      item.blocks[0].navigationId++;
    },
    (item) => {
      item.blocks[0].units = [];
    },
    (item) => {
      item.blocks[0].units[0].distance *= -1;
    },
    (item) => {
      item.blocks[0].units[0].frames = [];
    },
    (item) => {
      item.blocks[0].units[0].classes = 'reader-chapter';
    },
    (item) => {
      item.blocks[0].units[0].classes = 'reader-introduction';
    },
    (item) => {
      item.blocks[0].units[0].state = 'holding';
    },
    (item) => {
      item.blocks[0].units[0].row = 24;
    },
  ]) {
    const detail = make(current);
    corrupt(detail.observations[0].flights[0]);
    assert.throws(() => validateArticleJourney(detail, descriptors, { engine: current, baseURL }));
  }
  const historical = motion.reviewedRuntime('issue5-calm-reader-plain').variant.baseEngine;
  const legacy = make(historical);
  for (const row of legacy.observations)
    for (const item of [...(row.flights || []), ...(row.nativeHistory || [])]) delete item.blocks;
  assert.doesNotThrow(() =>
    validateArticleJourney(legacy, descriptors, {
      engine: historical,
      baseURL,
    })
  );
});

test('block diagnostics omit empty shells, collect later child animations and retain bare painted text', () => {
  const vm = require('node:vm');
  const frames = [{ computedOffset: 0 }, { computedOffset: 1 }];
  const node = ({
    tag = 'DIV',
    width = 200,
    height = 24,
    children = [],
    animations = [],
  } = {}) => ({
    tagName: tag,
    className: '',
    children,
    dataset: { routeRow: '0', routeBlock: 'departing' },
    style: { getPropertyValue: () => '-600px' },
    getBoundingClientRect: () => ({ width, height }),
    getAnimations: () => animations,
  });
  const animated = () => node({ animations: [{ effect: { getKeyframes: () => frames } }] });
  const empty = node({ height: 0 });
  const hiddenFirst = node({
    children: [node({ width: 0, height: 0 }), animated()],
  });
  const childOnly = node({ height: 0, children: [animated()] });
  const units = [empty, hiddenFirst, childOnly];
  const scope = {
    window: {},
    document: { querySelectorAll: () => units },
    structuredClone,
  };
  vm.runInNewContext('(' + installArticleFlightDiagnostics.toString() + ')();', scope);
  const phase = {
    kind: 'route-block',
    stage: 'departure',
    direction: 'forward',
    navigationId: 1,
    rows: 1,
    plannedDurationMs: 1000,
  };
  scope.window.SiteEngineProbe(phase);
  const recorded = JSON.parse(JSON.stringify(scope.window.__articleBlockEvents[0]));
  assert.equal(recorded.units.length, 2, 'zero-area placeholder has no painted motion to prove');
  assert.deepEqual(
    recorded.units.map((unit) => unit.frames),
    [frames, frames]
  );
  const observedFlight = flight('article:' + key, 'writing', -1);
  observedFlight.blocks = [
    recorded,
    {
      ...recorded,
      stage: 'arrival',
      direction: 'backward',
      units: recorded.units.map((unit) => ({ ...unit, state: 'arriving' })),
    },
  ];
  validateArticleBlocks(observedFlight);
  units.push(node({ tag: 'H4' }));
  scope.window.SiteEngineProbe(phase);
  observedFlight.blocks[0] = JSON.parse(JSON.stringify(scope.window.__articleBlockEvents[1]));
  const bare = observedFlight.blocks[0].units.at(-1);
  assert.equal(bare.tag, 'H4', 'positive-area bare text must remain in the diagnostic inventory');
  assert.deepEqual(bare.frames, []);
  assert.throws(() => validateArticleBlocks(observedFlight), /actual common CSS animation/);
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

test('reader reference evidence requires served immutable material links in every observation', () => {
  const name = 'reader-reference:en';
  const make = () => {
    const detail = observed();
    detail.documents = [name];
    detail.availableDocuments = [name];
    for (const row of detail.observations) {
      if (row.flights)
        row.flights = row.flights.map((item) =>
          flight(item.from.replace(key, name), item.to.replace(key, name), item.direction)
        );
      if (row.nativeHistory)
        row.nativeHistory = row.nativeHistory.map((item) =>
          flight(item.from.replace(key, name), item.to.replace(key, name), item.direction)
        );
      if (row.relatedDeparture) row.relatedDeparture = { present: true, departed: true };
      row.key = name;
      row.head.key = name;
      row.head.materials = [
        {
          label: 'Original diagram',
          status: 200,
          sha256: 'a'.repeat(64),
          href: baseURL + '/article-media/' + 'a'.repeat(64) + '/diagram.webp',
        },
      ];
    }
    return detail;
  };
  const selected = { [name]: descriptors[key] };
  validateArticleJourney(make(), selected);
  for (const mutate of [
    (detail) => {
      delete detail.observations[0].head.materials;
    },
    (detail) => {
      detail.observations[4].head.materials[0].status = 404;
    },
    (detail) => {
      detail.observations[1].head.materials[0].sha256 = 'b'.repeat(64);
    },
  ]) {
    const detail = make();
    mutate(detail);
    assert.throws(() => validateArticleJourney(detail, selected));
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

test('article flight admission rejects axial excursions, reversed orbits, scene swaps and incomplete evidence', () => {
  const good = flight('writing', 'article:' + key, 1);
  validateArticleFlight(good.events, good.from, good.to, good.direction);
  for (const corrupt of [
    (events) =>
      events
        .filter((event) => event.kind === 'paint')
        .forEach((event) => (event.current.position[2] = -250)),
    (events) =>
      events
        .filter((event) => event.kind === 'paint' && event.elapsed >= 400 && event.elapsed < 1400)
        .forEach((event) => (event.current.position[2] = -186)),
    (events) =>
      events
        .filter((event) => event.kind === 'paint' && event.elapsed >= 400 && event.elapsed < 1400)
        .forEach((event) => {
          event.current.position[0] *= -1;
        }),
    (events) => {
      events.find((event) => event.kind === 'paint').paintedRooms = ['research'];
    },
    (events) => {
      events.find((event) => event.kind === 'paint' && event.elapsed === 800).current.target = [
        0, 0, -250,
      ];
    },
    (events) => {
      events.find(
        (event) => event.kind === 'paint' && event.elapsed === 1000
      ).current.position[0] += 10;
    },
    (events) => {
      events[2].navigationId = 2;
    },
    (events) => events.splice(1, 2),
    (events) => events.pop(),
    (events) => {
      events[0].localDocument = false;
    },
    (events) => {
      events.at(-2).current.target[0] = 1;
    },
  ]) {
    const bad = structuredClone(good);
    corrupt(bad.events);
    assert.throws(() => validateArticleFlight(bad.events, bad.from, bad.to, bad.direction));
  }
  assert.throws(() => validateArticleFlight([good.events[0]], good.from, good.to, good.direction));
});
