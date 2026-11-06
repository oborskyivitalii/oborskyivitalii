'use strict';
// Start measured long files early and use the reported capacity without changing coverage.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  { run } = require('node:test'),
  { tap } = require('node:test/reporters'),
  { safePath } = require('./source-tests.cjs');
// Start files by descending duration from owner staging42309808371/1.
// Profile selection was unfinished after its late 290-second start; its position
// uses twice its separately measured pinned-Node duration. This is scheduling,
// not selection or a timing guarantee: all modules retain four isolated workers
// and the original 300-second deadline. Unknown future files follow by path.
const priority = [
  'tests/release-rights.test.cjs',
  'tests/executive.test.cjs',
  'tests/space.test.cjs',
  'tests/pages-delivery.test.cjs',
  'tests/publication-records.test.cjs',
  'tests/release-controller.test.cjs',
  'tests/pages-migration.test.cjs',
  'tests/publishing.test.cjs',
  'tests/site-engine.test.cjs',
  'tests/delivery-observation.test.cjs',
  'tests/article-offline.test.cjs',
  'tests/site-articles.test.cjs',
  'tests/content-fixture.test.cjs',
  'tests/content-baseline.test.cjs',
  'tests/analytics.test.cjs',
  'tests/quality-sources.test.cjs',
  'tests/article-media.test.cjs',
  'tests/release-archive.test.cjs',
  'tests/reader-controller.test.cjs',
  'tests/test-profile-selection.test.cjs',
  'tests/content-rendering.test.cjs',
  'tests/color-motion-contract.test.cjs',
  'tests/staging.test.cjs',
  'tests/content-release.test.cjs',
  'tests/prepublication-reuse.test.cjs',
  'tests/article-candidate-source.test.cjs',
  'tests/quality.test.cjs',
  'tests/staging-reporting.test.cjs',
  'tests/content.test.cjs',
  'tests/article-delivery.test.cjs',
  'tests/review-flow.test.cjs',
  'tests/control-lock.test.cjs',
  'tests/publishing-profile.test.cjs',
  'tests/content-delivery.test.cjs',
  'tests/reader-mode.test.cjs',
  'tests/camera-view.test.cjs',
  'tests/build-cohesion.test.cjs',
  'tests/article-tags.test.cjs',
  'tests/preview-smoke.test.cjs',
  'tests/format-parity.test.cjs',
  'tests/renderer.test.cjs',
  'tests/preview.test.cjs',
  'tests/publishing-history.test.cjs',
  'tests/architecture.test.cjs',
  'tests/delivery-admission.test.cjs',
  'tests/edition-retention.test.cjs',
  'tests/publishing-print.test.cjs',
  'tests/article-browser-evidence.test.cjs',
  'tests/refactor-metrics.test.cjs',
  'tests/format.test.cjs',
  'tests/engine-browser-fixtures.test.cjs',
  'tests/effects.test.cjs',
  'tests/color-build.test.cjs',
  'tests/publishing-safety.test.cjs',
  'tests/site-face-preparation.test.cjs',
  'tests/article-budgets.test.cjs',
  'tests/staging-regression.test.cjs',
  'tests/staging-gate.test.cjs',
  'tests/control-runner.test.cjs',
  'tests/scroll-entry.test.cjs',
  'tests/navigation-fixtures.test.cjs',
  'tests/navigation.test.cjs',
  'tests/events.test.cjs',
  'tests/article-materials.test.cjs',
  'tests/local-catalog-relationships.test.cjs',
  'tests/site-transaction.test.cjs',
  'tests/functional-fixtures.test.cjs',
  'tests/prototype-admission.test.cjs',
  'tests/navigation-motion-fixtures.test.cjs',
  'tests/orchestration.test.cjs',
  'tests/endpoint-fixtures.test.cjs',
  'tests/performance-suite.test.cjs',
  'tests/staging-trust.test.cjs',
  'tests/scroll-sync.test.cjs',
  'tests/native-display.test.cjs',
];
function observeFiles(stream, files, parallelism) {
  const selected = new Map(files.map((file) => [path.resolve(file), file]));
  const seen = new Set();
  const started = performance.now();
  const write = (record) => {
    try {
      fs.writeSync(2, JSON.stringify({ kind: 'source-test-timing', ...record }) + '\n');
    } catch {
      // Optional diagnostics cannot decide test success or interrupt the runner.
    }
  };
  write({
    event: 'capacity',
    node: process.version,
    availableParallelism: os.availableParallelism(),
    configuredParallelism: parallelism,
    concurrency: Math.min(4, parallelism),
    files: files.length,
  });
  for (const event of ['dequeue', 'complete'])
    stream.on('test:' + event, (result) => {
      if (result.nesting !== 0 || result.entryFile || typeof result.file !== 'string') return;
      const file = selected.get(path.resolve(result.file));
      const key = event + ':' + file;
      if (!file || result.name !== file || seen.has(key)) return;
      seen.add(key);
      write({
        event,
        file,
        elapsedMs: Math.round(performance.now() - started),
        ...(event === 'complete'
          ? {
              wrapperDurationMs: result.details?.duration_ms ?? null,
              wrapperPassed: result.details?.passed ?? null,
            }
          : {}),
      });
    });
}
function runFiles(files, { parallelism = os.availableParallelism() } = {}) {
  assert.ok(Array.isArray(files) && files.length, 'selected source files required');
  assert.equal(new Set(files).size, files.length, 'duplicate selected source file');
  for (const file of files) {
    safePath(file);
    assert.match(file, /^tests\/(?:[^/]+\/)*[^/]+\.test\.cjs$/);
  }
  assert.ok(Number.isInteger(parallelism) && parallelism > 0, 'invalid source parallelism');
  const ordered = [
    ...priority.filter((file) => files.includes(file)),
    ...files.filter((file) => !priority.includes(file)).sort(),
  ];
  let summary = false;
  const controller = new AbortController();
  const interrupt = (signal) => {
    process.exitCode = 1;
    controller.abort(new Error('source tests interrupted by ' + signal));
  };
  const terminate = () => interrupt('SIGTERM'),
    cancel = () => interrupt('SIGINT');
  const dispose = () => {
    process.removeListener('SIGTERM', terminate);
    process.removeListener('SIGINT', cancel);
  };
  const failed = (error) => {
    console.error(error);
    process.exitCode = 1;
    controller.abort(error);
  };
  process.once('SIGTERM', terminate);
  process.once('SIGINT', cancel);
  const stream = run({
    files: ordered,
    concurrency: Math.min(4, parallelism),
    isolation: 'process',
    cwd: process.cwd(),
    signal: controller.signal,
  });
  observeFiles(stream, ordered, parallelism);
  stream.on('test:summary', (result) => {
    summary = true;
    if (!result.success) process.exitCode = 1;
  });
  stream.on('error', failed);
  stream.on('end', () => {
    dispose();
    if (!summary) process.exitCode = 1;
  });
  stream.once('close', dispose);
  stream.compose(tap).on('error', failed).pipe(process.stdout);
  return stream;
}
if (require.main === module) {
  try {
    runFiles(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { runFiles };
