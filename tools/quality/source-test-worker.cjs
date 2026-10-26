'use strict';
// Start measured long files early and use the reported capacity without changing coverage.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  { run } = require('node:test'),
  { tap } = require('node:test/reporters'),
  { safePath } = require('./source-tests.cjs');
const priority = [
  'tests/space.test.cjs',
  'tests/executive.test.cjs',
  'tests/article-media.test.cjs',
  'tests/release-rights.test.cjs',
  'tests/release-controller.test.cjs',
  'tests/publishing.test.cjs',
  'tests/quality-sources.test.cjs',
  'tests/site-articles.test.cjs',
  'tests/pages-migration.test.cjs',
  'tests/site-engine.test.cjs',
  'tests/pages-delivery.test.cjs',
  'tests/publication-records.test.cjs',
  'tests/staging.test.cjs',
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
