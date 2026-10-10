'use strict';
// Staging promotion evidence is deliberately distinct from production release evidence.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process');
const artifact = require('./artifact.cjs'),
  common = require('./common.cjs'),
  budgets = require('./budgets.json');
const regression = require('./staging-regression.cjs'),
  full = require('./validate.cjs');
const requiredJobs = ['build', 'static', 'host', 'staging'];
const requiredKinds = [
  'hosted',
  'lint',
  'security',
  'advisories',
  'stage-functional',
  'stage-performance',
];
function expectedKinds(manifest) {
  return [
    ...requiredKinds,
    ...(common.variant(manifest).id === 'color' ? ['color-preview-smoke'] : []),
  ];
}
function expectedCoverage(manifest) {
  return {
    functional: {
      normalJourneys: 4,
      normalRouteObservations: 20,
      noCanvasJourneys: 2,
      noCanvasRouteObservations: 10,
      navigation: 2,
      failures: 10,
      analytics: 7,
    },
    performance: {
      routeSamples: 2,
      measurementWindows: 8,
      flights: 4,
      coldFlights: 2,
      warmFlights: 2,
      lighthouseTrials: 2,
      soakSeconds: 0,
      retentionCycles: 0,
    },
    static: ['lint', 'security', 'advisories'],
    color: common.variant(manifest).id === 'color' ? 2 : 0,
    hostedFiles: Object.keys(manifest.files).filter((file) => file !== '.nojekyll').length,
  };
}
function validateIdentity(manifest) {
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.sourceDirty, false, 'dirty staging source');
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit'])
    assert.match(manifest[key], /^[a-f0-9]{40}$/, 'missing exact ' + key);
  assert.equal(manifest.candidateCommit, manifest.sourceCommit);
  assert.match(manifest.artifactDigest, /^[a-f0-9]{64}$/);
  common.variant(manifest);
  assert.ok(manifest.files && Object.keys(manifest.files).length > 0, 'missing artifact inventory');
}
function validateHost(report, manifest, hostedURL) {
  assert.equal(report.kind, 'hosted');
  assert.equal(report.profile, 'staging');
  assert.equal(report.target, hostedURL);
  for (const key of ['root', 'actual404', 'redirectsStayWithinSite'])
    assert.equal(report[key], true, 'missing hosted ' + key);
  const files = Object.keys(manifest.files).filter((file) => file !== '.nojekyll');
  regression.exactRows(
    report.rows,
    files.map((file) => ({ file })),
    ['file'],
    'served artifact files'
  );
  for (const row of report.rows) {
    assert.equal(row.status, 200);
    assert.equal(row.sha256, manifest.files[row.file].sha256, 'served artifact byte mismatch');
    assert.equal(
      require('./local-browser.cjs').artifactFile(row.url, hostedURL, manifest),
      row.file,
      'served redirect changed artifact identity'
    );
    const types = {
      '.html': /text\/html/i,
      '.js': /(?:application|text)\/javascript/i,
      '.css': /text\/css/i,
      '.json': /application\/json/i,
      '.svg': /image\/svg\+xml/i,
    };
    if (types[path.extname(row.file)])
      assert.match(row.mime, types[path.extname(row.file)], 'missing hosted MIME evidence');
  }
}
function validateSizes(sizes, manifest) {
  assert.equal(sizes.pass, true);
  assert.equal(sizes.artifactDigest, manifest.artifactDigest);
  assert.deepEqual(sizes.files, manifest.files, 'size report inventory differs from artifact');
  regression.exactRows(
    sizes.rows,
    budgets.routes.map((route) => ({ route })),
    ['route'],
    'route sizes'
  );
  for (const row of sizes.rows) {
    const source = manifest.files[row.route + '.html'];
    assert.equal(row.raw, source.raw);
    assert.equal(row.sha256, source.sha256);
    assert.ok(
      row.raw <= budgets.htmlRawBytes &&
        Number.isFinite(row.svgNodes) &&
        row.svgNodes <= budgets.svgElements &&
        Number.isFinite(row.totalGzipBytes) &&
        row.totalGzipBytes <= budgets.routeGzipBytes,
      'staging page size budget'
    );
  }
  for (const [file, record] of Object.entries(manifest.files)) {
    assert.match(record.sha256, /^[a-f0-9]{64}$/);
    assert.ok(
      Number.isInteger(record.raw) &&
        record.raw >= 0 &&
        Number.isInteger(record.gzip) &&
        record.gzip >= 0,
      'invalid source file size'
    );
    if (!file.endsWith('.html'))
      assert.ok(record.raw <= budgets.assetRawBytes, 'staging asset size budget');
  }
}
function validateGate(manifest, gate, hostedURL) {
  validateIdentity(manifest);
  const target = require('./hosted-origin.cjs').target(hostedURL, 'staging');
  assert.equal(gate.schema, 1);
  assert.equal(
    gate.kind,
    'staging-gate',
    'preview/full release reports are not selected staging evidence'
  );
  assert.equal(gate.profile, 'staging');
  assert.equal(gate.validationLevel, 'staging');
  assert.equal(gate.stageContract, 1);
  assert.equal(gate.pass, true, gate.error);
  assert.equal(gate.fullGate, false);
  assert.equal(gate.productionEligible, false);
  assert.equal(gate.deploymentAuthorized, false);
  assert.equal(gate.sourceChecks, 'success', 'missing successful staging source checks');
  assert.equal(gate.hostedOrigin, target);
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'])
    assert.equal(gate[key], manifest[key], 'staging edition ' + key);
  assert.deepEqual(
    common.variant(gate),
    common.variant(manifest),
    'staging runtime rendition mismatch'
  );
  assert.deepEqual(
    Object.keys(gate.jobs).sort(),
    [...requiredJobs].sort(),
    'wrong staging job selection'
  );
  for (const job of requiredJobs)
    assert.equal(gate.jobs[job]?.result, 'success', 'missing successful staging job ' + job);
  regression.exactRows(
    gate.checkedReports,
    expectedKinds(manifest).map((kind) => ({ kind })),
    ['kind'],
    'staging report kinds'
  );
  for (const row of gate.checkedReports)
    assert.match(row.sha256, /^[a-f0-9]{64}$/, 'missing report identity');
  assert.equal(
    gate.reportsDigest,
    artifact.digest(JSON.stringify(gate.checkedReports)),
    'staging report summary changed'
  );
  assert.deepEqual(gate.coverage, expectedCoverage(manifest), 'incomplete staging coverage');
  return true;
}
function selectedJobs(jobs) {
  // A reusable workflow also exposes the deliberately skipped production jobs.
  for (const [name, job] of Object.entries(jobs))
    if (!requiredJobs.includes(name)) {
      assert.ok(
        ['linux', 'native', 'performance', 'captures'].includes(name),
        'unexpected unselected job ' + name
      );
      assert.equal(
        job.result,
        'skipped',
        'production job unexpectedly ran in the staging profile: ' + name
      );
    }
  return Object.fromEntries(requiredJobs.map((name) => [name, jobs[name]]));
}
function aggregate({
  manifest,
  sizes,
  reports,
  jobs,
  hostedURL,
  profile = 'staging',
  sourceChecks = null,
}) {
  regression.registryCheck();
  validateIdentity(manifest);
  assert.equal(profile, 'staging', 'staging-only aggregate');
  const target = require('./hosted-origin.cjs').target(hostedURL, profile);
  validateSizes(sizes, manifest);
  regression.exactRows(
    reports,
    expectedKinds(manifest).map((kind) => ({ kind })),
    ['kind'],
    'staging reports'
  );
  for (const report of reports) {
    full.sourceReport(report, manifest);
    assert.equal(report.target, target, 'local/different-origin results cannot authorize staging');
  }
  for (const kind of ['lint', 'security', 'advisories'])
    full.scanner(reports.find((row) => row.kind === kind));
  validateHost(
    reports.find((row) => row.kind === 'hosted'),
    manifest,
    target
  );
  const coverage = expectedCoverage(manifest);
  coverage.functional = regression.validateFunctional(
    reports.find((row) => row.kind === 'stage-functional'),
    manifest
  );
  coverage.performance = regression.validatePerformance(
    reports.find((row) => row.kind === 'stage-performance')
  );
  if (coverage.color)
    coverage.color = regression.validateColor(
      reports.find((row) => row.kind === 'color-preview-smoke'),
      manifest
    );
  const checkedReports = reports
    .map((report) => ({
      kind: report.kind,
      platform: report.environment?.platform || null,
      sha256: common.jsonDigest(report),
    }))
    .sort((a, b) => a.kind.localeCompare(b.kind));
  const gate = {
    ...manifest,
    schema: 1,
    kind: 'staging-gate',
    profile: 'staging',
    validationLevel: 'staging',
    stageContract: 1,
    pass: true,
    fullGate: false,
    productionEligible: false,
    deploymentAuthorized: false,
    sourceChecks,
    jobs,
    hostedOrigin: target,
    coverage,
    checkedReports,
    reportsDigest: artifact.digest(JSON.stringify(checkedReports)),
    checkedAt: new Date().toISOString(),
  };
  validateGate(manifest, gate, target);
  return gate;
}
function files(dir) {
  return fs
    .readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const file = path.join(dir, name);
      return fs.statSync(file).isDirectory() ? files(file) : [file];
    });
}
function readReports(dir) {
  const names = new Set([
    ...requiredKinds,
    'color-preview-smoke',
    'preview-smoke',
    'functional',
    'color-functional',
    'lighthouse',
    'motion',
    'captures',
  ]);
  return files(dir)
    .filter((file) => names.has(path.basename(file, '.json')) && file.endsWith('.json'))
    .map((file) => common.readJson(file));
}
function main() {
  const directory = path.resolve(process.argv[2]),
    read = (name) => JSON.parse(fs.readFileSync(path.join(directory, name)));
  const manifest = read('artifact.json'),
    git = (args) => {
      const result = cp.spawnSync('git', args, { cwd: common.root, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      return result.stdout.trim();
    };
  assert.equal(
    manifest.sourceCommit,
    git(['rev-parse', 'HEAD']),
    'staging gate source differs from checkout'
  );
  assert.equal(manifest.sourceTree, git(['rev-parse', 'HEAD^{tree}']));
  if (process.env.SITE_CANDIDATE_SHA)
    assert.equal(manifest.candidateCommit, process.env.SITE_CANDIDATE_SHA);
  artifact.verify(path.join(directory, 'public'), manifest);
  const gate = aggregate({
    manifest,
    sizes: read('sizes.json'),
    reports: readReports(path.join(directory, 'reports')),
    jobs: selectedJobs(JSON.parse(process.env.SITE_JOB_RESULTS || '{}')),
    hostedURL: process.env.SITE_TEST_BASE_URL,
    profile: process.env.SITE_TEST_PROFILE,
    sourceChecks: process.env.SITE_SOURCE_CHECKS_OUTCOME,
  });
  gate.githubArtifact = {
    id: process.env.SITE_ARTIFACT_ID || null,
    uploadDigest: process.env.SITE_UPLOAD_DIGEST || null,
  };
  fs.writeFileSync(
    path.join(directory, 'release-manifest.json'),
    JSON.stringify(gate, null, 2) + '\n'
  );
  console.log(JSON.stringify(gate));
}
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Staging gate failed: ' + error.stack);
    process.exitCode = 1;
    try {
      const directory = path.resolve(process.argv[2]),
        manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
      fs.writeFileSync(
        path.join(directory, 'release-manifest.json'),
        JSON.stringify(
          {
            ...manifest,
            schema: 1,
            kind: 'staging-gate',
            profile: 'staging',
            validationLevel: 'staging',
            stageContract: 1,
            pass: false,
            fullGate: false,
            productionEligible: false,
            deploymentAuthorized: false,
            error: error.message,
          },
          null,
          2
        ) + '\n'
      );
    } catch {
      /* Missing public artifacts already fail closed. */
    }
  }
}
module.exports = {
  requiredJobs,
  requiredKinds,
  expectedKinds,
  expectedCoverage,
  validateIdentity,
  validateHost,
  validateSizes,
  validateGate,
  selectedJobs,
  aggregate,
  readReports,
  main,
};
