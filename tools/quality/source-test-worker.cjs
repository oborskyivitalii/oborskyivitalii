'use strict';
// Start the measured long source files early without changing their coverage.
const assert = require('node:assert/strict'),
  os = require('node:os'),
  { run } = require('node:test'),
  { tap } = require('node:test/reporters'),
  { safePath } = require('./source-tests.cjs');
const priority = [
  'tests/space.test.cjs',
  'tests/executive.test.cjs',
  'tests/release-rights.test.cjs',
];
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
    concurrency: Math.max(parallelism - 1, 1),
    isolation: 'process',
    cwd: process.cwd(),
    signal: controller.signal,
  });
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
