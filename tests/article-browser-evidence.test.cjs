'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateArticleJourney } = require('../tools/quality/article-browser.cjs');
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
  assert.deepEqual(validateArticleJourney(undefined, {}), { documents: 0, observations: 0 });
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
      const report = { ...fixture.identity(manifest), kind: 'stage-functional', ...detail };
      if (fails) {
        assert.deepEqual(detail.startupFailures, [
          { engine: 'chromium', error: 'controlled article collection failure' },
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
