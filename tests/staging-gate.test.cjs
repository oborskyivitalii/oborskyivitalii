'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const gate = require('../tools/quality/staging-gate.cjs'),
  fixture = require('./fixtures/staging-evidence.cjs');

function articleAggregateFixture(count, color) {
  const f = fixture.aggregateFixture(color);
  if (!count) return f;
  const manifest = f.manifest;
  const hosted = f.reports.find((report) => report.kind === 'hosted');
  const assets = [
    'styles.css',
    'theme.js',
    'space.js',
    'archive.js',
    'navigation.js',
    'assets/favicon.svg',
  ];
  const addFile = (file) => {
    if (!manifest.files[file]) {
      manifest.files[file] = { sha256: 'e'.repeat(64), raw: 5000, gzip: 1000 };
      hosted.rows.push({
        file,
        status: 200,
        sha256: manifest.files[file].sha256,
        url: fixture.target + '/' + file,
        mime: file.endsWith('.html')
          ? 'text/html'
          : file.endsWith('.svg')
            ? 'image/svg+xml'
            : 'application/javascript',
      });
    }
    return manifest.files[file];
  };
  assets.forEach(addFile);
  manifest.components.articles = {};
  f.sizes.articleRows = [];
  for (let index = 0; index < count; index++) {
    const key = 'sample-' + index + ':en';
    const alias = 'articles/sample-' + index + '-en.html';
    const record = addFile(alias);
    manifest.components.articles[key] = {
      alias,
      assets: [],
      version: String(index + 1).repeat(64),
      candidate: true,
    };
    f.sizes.articleRows.push({
      key,
      alias,
      ...record,
      svgNodes: 1,
      assets,
      totalGzipBytes:
        record.gzip + assets.reduce((total, name) => total + manifest.files[name].gzip, 0),
    });
  }
  const keys = Object.keys(manifest.components.articles);
  const key = keys[0];
  const head = {
    key,
    lang: 'en',
    routeVersion: manifest.components.articles[key].version,
    engine: manifest.components.engine,
    title: 'Controlled article fixture',
    description: 'Validator input, not a browser observation.',
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
  const normalChecks = Object.fromEntries(
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
  f.reports.find((report) => report.kind === 'stage-functional').articles = {
    kind: 'bounded-article-journey',
    browser: 'Controlled validator fixture, not a browser observation',
    documents: [key],
    availableDocuments: keys,
    observations: [
      ...[1440, 390].map((width) => ({
        key,
        width,
        mode: 'normal',
        head: structuredClone(head),
        reading: { entered: ['section'], departed: ['section'], maxEntering: 1, maxRoute: 1 },
        checks: { ...normalChecks, basePath: '/author/' },
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
  return f;
}

test('staging aggregate preserves exact bounded article coverage for empty and larger catalogs', () => {
  for (const color of [false, true]) {
    const legacy = gate.aggregate(fixture.aggregateFixture(color)).coverage.functional;
    for (const count of [0, 1, 2]) {
      const f = articleAggregateFixture(count, color);
      const result = gate.aggregate(f);
      const { articleObservations, ...fiveRoomCoverage } = result.coverage.functional;
      assert.deepEqual(fiveRoomCoverage, legacy, 'all existing five-room coverage is retained');
      assert.equal(articleObservations ?? 0, count ? 5 : 0);
      assert.equal(Object.hasOwn(result.coverage.functional, 'articleObservations'), count > 0);
      for (const observedCount of count ? [undefined, 0, 4, 6, 10] : [0, 5]) {
        const invalid = structuredClone(result);
        if (observedCount === undefined) delete invalid.coverage.functional.articleObservations;
        else invalid.coverage.functional.articleObservations = observedCount;
        assert.throws(() => gate.validateGate(f.manifest, invalid, f.hostedURL));
      }
      if (!count) continue;
      for (const change of [
        (report) => delete report.articles,
        (report) => report.articles.observations.pop(),
        (report) =>
          report.articles.observations.push(structuredClone(report.articles.observations[0])),
      ]) {
        const invalid = articleAggregateFixture(count, color);
        change(invalid.reports.find((report) => report.kind === 'stage-functional'));
        assert.throws(() => gate.aggregate(invalid));
      }
    }
  }
});

test('complete selected hosted automation creates only an explicitly staging gate', () => {
  for (const color of [false, true]) {
    const f = fixture.aggregateFixture(color),
      g = gate.aggregate(f);
    assert.equal(g.kind, 'staging-gate');
    assert.equal(g.fullGate, false);
    assert.equal(g.productionEligible, false);
    assert.equal(g.coverage.color, color ? 2 : 0);
    assert.equal(gate.validateGate(f.manifest, g, f.hostedURL), true);
  }
});
test('staging gate rejects missing, duplicate, wrong-source and preview-as-regression evidence', () => {
  const changes = [
    (f) => f.reports.pop(),
    (f) => f.reports.push(structuredClone(f.reports[0])),
    (f) => (f.reports[4].kind = 'preview-smoke'),
    (f) => (f.reports[5].kind = 'motion'),
    (f) => (f.reports[4].sourceCommit = 'f'.repeat(40)),
    (f) => (f.reports[5].sourceTree = 'f'.repeat(40)),
    (f) => (f.reports[4].candidateCommit = 'f'.repeat(40)),
    (f) => (f.reports[4].artifactDigest = 'f'.repeat(64)),
    (f) => (f.reports[4].variant = { ...f.reports[4].variant, fingerprint: 'f'.repeat(64) }),
    (f) => (f.reports[4].target = null),
    (f) => (f.reports[0].target = 'https://other.example.invalid'),
    (f) => (f.reports[4].profile = 'production'),
    (f) => (f.reports[4].pass = false),
    (f) => (f.manifest.sourceDirty = true),
    (f) => (f.manifest.candidateCommit = 'f'.repeat(40)),
    (f) => f.reports[0].rows.pop(),
    (f) => (f.reports[0].rows[0] = structuredClone(f.reports[0].rows[1])),
    (f) => (f.reports[0].rows[0].sha256 = 'f'.repeat(64)),
    (f) => (f.reports[0].rows[0].url = 'https://other.example.invalid/index.html'),
    (f) => (f.reports[0].rows[0].mime = 'application/octet-stream'),
    (f) => (f.reports[0].actual404 = false),
    (f) => (f.reports[0].redirectsStayWithinSite = false),
    (f) => (f.reports[1].detail.tools.stylelint = ''),
    (f) => (f.reports[2].detail.semgrep.rules = 6),
    (f) => (f.reports[2].detail.semgrep.errors = 1),
    (f) => (f.reports[2].detail.bandit.findings = 1),
    (f) => (f.reports[3].detail.runtimeDependencies = 'unscanned'),
    (f) => (f.jobs.static.result = 'failure'),
    (f) => (f.jobs.host.result = 'skipped'),
    (f) => delete f.jobs.staging,
    (f) => (f.jobs.native = { result: 'success' }),
    (f) => (f.sourceChecks = 'skipped'),
    (f) => (f.sourceChecks = null),
    (f) => (f.sizes.rows[0].raw = 5001),
    (f) => (f.sizes.rows[0].svgNodes = 251),
    (f) => (f.sizes.rows[0].totalGzipBytes = 800001),
    (f) => f.sizes.rows.pop(),
    (f) => (f.hostedURL = 'http://candidate.example.invalid/author'),
    (f) => (f.profile = 'production'),
  ];
  for (const change of changes) {
    const f = fixture.aggregateFixture();
    change(f);
    assert.throws(() => gate.aggregate(f));
  }
});
test('Color evidence cannot disappear or describe a different rendition', () => {
  for (const mutate of [
    (f) => f.reports.pop(),
    (f) => (f.reports.at(-1).variant.id = 'base'),
    (f) => (f.reports.at(-1).rows[0].identity.engine = 'f'.repeat(64)),
    (f) => (f.reports.at(-1).rows[0].checks.blockFlight = false),
  ]) {
    const f = fixture.aggregateFixture(true);
    mutate(f);
    assert.throws(() => gate.aggregate(f));
  }
});
test('staging promotion consumers must reject malformed or reclassified gate summaries', () => {
  const f = fixture.aggregateFixture(),
    original = gate.aggregate(f);
  for (const mutate of [
    (g) => (g.kind = 'preview-smoke'),
    (g) => (g.kind = 'hosted-gate'),
    (g) => (g.profile = 'production'),
    (g) => (g.validationLevel = 'production'),
    (g) => (g.stageContract = 0),
    (g) => (g.pass = false),
    (g) => (g.fullGate = true),
    (g) => (g.productionEligible = true),
    (g) => (g.deploymentAuthorized = true),
    (g) => (g.sourceChecks = 'skipped'),
    (g) => (g.sourceTree = 'f'.repeat(40)),
    (g) => (g.components.variant.fingerprint = 'f'.repeat(64)),
    (g) => (g.hostedOrigin = 'https://other.example.invalid'),
    (g) => (g.jobs.staging.result = 'skipped'),
    (g) => (g.coverage.performance.flights = 0),
    (g) => (g.coverage.functional.analytics = 39),
    (g) => g.checkedReports.pop(),
    (g) => (g.checkedReports[0].sha256 = ''),
    (g) => (g.reportsDigest = 'f'.repeat(64)),
  ]) {
    const copy = structuredClone(original);
    mutate(copy);
    assert.throws(() => gate.validateGate(f.manifest, copy, f.hostedURL));
  }
});
test('reusable workflow results explicitly exclude only skipped production jobs', () => {
  const jobs = fixture.aggregateFixture().jobs,
    expanded = {
      ...jobs,
      ...Object.fromEntries(
        ['linux', 'native', 'performance', 'captures'].map((name) => [name, { result: 'skipped' }])
      ),
    };
  assert.deepEqual(gate.selectedJobs(expanded), jobs);
  for (const name of ['linux', 'native', 'performance', 'captures'])
    assert.throws(() => gate.selectedJobs({ ...expanded, [name]: { result: 'success' } }));
  assert.throws(() => gate.selectedJobs({ ...expanded, unknown: { result: 'skipped' } }));
});
test('selected staging evidence cannot satisfy the unchanged production promotion or full regression guard', () => {
  const f = fixture.aggregateFixture(),
    selected = gate.aggregate(f);
  assert.throws(() => require('../tools/quality/promotion.cjs').validate(f.manifest, selected, {}));
  assert.throws(() =>
    require('../tools/quality/validate.cjs').aggregate({ ...f, full: true, automatedOnly: true })
  );
  assert.equal(
    selected.coverage.performance.lighthouseTrials,
    2,
    'single trials remain a distinct staging signal'
  );
});
