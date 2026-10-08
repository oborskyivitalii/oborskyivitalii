'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict');
const gate = require('../tools/quality/staging-gate.cjs'),
  fixture = require('./fixtures/staging-evidence.cjs');
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
    (f) => (f.reports.at(-1).rows[0].checks.spatialFlight = false),
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
