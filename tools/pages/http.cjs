'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const pkg = require('./package.cjs');
const { assertContentType } = require('../quality/serve.cjs');
const pending = new WeakSet();

function same(actual, expected, message, retryable = true) {
  try {
    assert.equal(actual, expected, message);
  } catch (error) {
    if (retryable) pending.add(error);
    throw error;
  }
}

function origin(value) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.username + url.password + url.search + url.hash, '');
  assert.equal(url.pathname, '/', 'author Pages is rooted at the origin');
  assert.equal(url.port, '');
  return url.origin;
}

function baseURL(value) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.username + url.password + url.search + url.hash, '');
  assert.equal(url.port, '');
  assert.ok(!value.includes('\\'), 'invalid Pages base URL');
  const supplied = value.match(/^https:\/\/[^/?#]+(\/[^?#]*)?$/);
  assert.ok(supplied, 'invalid Pages base URL');
  const suppliedPath = supplied[1] || '/';
  assert.equal(url.pathname, suppliedPath, 'Pages base path was normalized unexpectedly');
  const prefix = pkg.basePath(url.pathname);
  return url.origin + (prefix === '/' ? '' : prefix.slice(0, -1));
}

async function request(url, expected, fetcher) {
  const base = new URL(baseURL(expected));
  const target = new URL(url);
  const prefix = pkg.basePath(base.pathname);
  assert.equal(target.origin, base.origin);
  assert.ok(target.pathname.startsWith(prefix), 'Pages request left configured base path');
  const response = await fetcher(url, {
    redirect: 'manual',
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  assert.ok(
    ![301, 302, 303, 307, 308].includes(response.status),
    'use the configured canonical Pages origin'
  );
  const actual = new URL(response.url || url);
  assert.equal(actual.origin, base.origin);
  assert.ok(actual.pathname.startsWith(prefix), 'Pages response left configured base path');
  assert.equal(actual.href, target.href, 'Pages response changed requested URL');
  return { response, bytes: Buffer.from(await response.arrayBuffer()) };
}

async function check(directory, value, fetcher = fetch, observe = () => {}) {
  const base = baseURL(value);
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'pages-package.json')));
  pkg.verify(directory, record);
  const prefix = pkg.basePath(new URL(base).pathname);
  assert.equal(record.state.basePath || '/', prefix, 'Pages package base path differs');
  const rows = [];
  const observedRequest = async (url, file, status = 200) => {
    const result = await request(url, base, fetcher);
    observe({
      file,
      url,
      status: result.response.status,
      expectedStatus: status,
      sha256: artifact.digest(result.bytes),
      expectedSha256: record.files[file].sha256,
      mime: result.response.headers.get('content-type'),
    });
    same(
      result.response.status,
      status,
      status === 200
        ? 'Pages file unavailable: ' + file
        : 'Pages converted a missing route to Home',
      [200, 404].includes(result.response.status)
    );
    assertContentType(file, result.response.headers.get('content-type'));
    same(artifact.digest(result.bytes), record.files[file].sha256, 'wrong Pages bytes: ' + file);
    return result;
  };
  const names = Object.keys(record.files).filter((name) => !name.endsWith('.nojekyll'));
  for (let start = 0; start < names.length; start += 4) {
    const observations = await Promise.allSettled(
      names.slice(start, start + 4).map(async (name) => {
        const { response, bytes } = await observedRequest(base + '/' + name, name);
        return { file: name, sha256: artifact.digest(bytes), status: response.status };
      })
    );
    const failed =
      observations.find((item) => item.status === 'rejected' && !pending.has(item.reason)) ||
      observations.find((item) => item.status === 'rejected');
    if (failed) throw failed.reason;
    rows.push(...observations.map((item) => item.value));
  }
  const journeys = [
    ['/', 'index.html'],
    ...(record.staging
      ? [
          ['/staging/', 'staging/index.html'],
          ['/staging/writing.html?topic=systems&language=uk', 'staging/writing.html'],
        ]
      : [['/writing.html?topic=systems&language=uk', 'writing.html']]),
  ];
  for (const [url, file] of journeys) {
    await observedRequest(base + url, file);
  }
  const missingPaths = ['/__delivery_missing', '/staging/__delivery_missing'];
  if (!record.staging) missingPaths.push('/staging/', '/staging/writing.html');
  for (const missingPath of missingPaths) {
    await observedRequest(base + missingPath, '404.html', 404);
  }
  return {
    schema: 1,
    kind: 'pages-http',
    pass: true,
    origin: new URL(base).origin,
    baseURL: base + '/',
    basePath: prefix,
    packageDigest: record.packageDigest,
    rows,
    root: true,
    staging: record.staging !== null,
    query: true,
    actual404: true,
  };
}

async function ready(directory, base, fetcher = fetch, options = {}) {
  const canonical = baseURL(base),
    record = JSON.parse(fs.readFileSync(path.join(directory, 'pages-package.json')));
  const deadlineMs = options.deadlineMs ?? 60000,
    pollMs = options.pollMs ?? 2000;
  assert.ok(Number.isInteger(deadlineMs) && deadlineMs > 0 && deadlineMs <= 60000);
  assert.ok(Number.isInteger(pollMs) && pollMs > 0 && pollMs <= 2000);
  const clock = options.clock || (() => performance.now()),
    wait = options.wait || ((ms) => new Promise((resolve) => setTimeout(resolve, ms))),
    retain = options.retain || (() => {}),
    started = clock(),
    deadline = started + deadlineMs;
  const result = {
    schema: 1,
    kind: 'pages-http',
    pass: false,
    origin: new URL(canonical).origin,
    baseURL: canonical + '/',
    packageDigest: record.packageDigest,
    readiness: { deadlineMs, pollMs, requestTimeoutMs: 20000, attempts: [] },
  };
  const expired = () =>
    Object.assign(Error('Pages package did not converge within ' + deadlineMs + 'ms'), {
      code: 'PAGES_READINESS_DEADLINE',
    });
  const save = () => {
    result.readiness.elapsedMs = Math.max(0, clock() - started);
    retain(structuredClone(result));
  };
  save();
  while (
    clock() < deadline &&
    result.readiness.attempts.length < Math.ceil(deadlineMs / pollMs) + 1
  ) {
    const abort = new AbortController(),
      began = clock(),
      rows = [];
    const attempt = {
      number: result.readiness.attempts.length + 1,
      startedAt: new Date().toISOString(),
    };
    let timer, value, error;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(
        () => {
          const failure = expired();
          abort.abort(failure);
          reject(failure);
        },
        Math.max(1, deadline - clock())
      );
    });
    try {
      value = await Promise.race([
        check(
          directory,
          canonical,
          (url, init) => {
            abort.signal.throwIfAborted();
            if (clock() >= deadline) throw expired();
            return fetcher(url, { ...init, signal: AbortSignal.any([init.signal, abort.signal]) });
          },
          (row) => rows.push(row)
        ),
        timeout,
      ]);
      if (clock() >= deadline) throw expired();
      assert.equal(value.packageDigest, record.packageDigest, 'readiness package changed');
    } catch (failure) {
      error = failure;
      abort.abort(failure);
    } finally {
      clearTimeout(timer);
    }
    Object.assign(attempt, {
      pass: !error,
      elapsedMs: Math.max(0, clock() - began),
      rows: structuredClone(rows),
    });
    if (error)
      Object.assign(attempt, {
        error: error.message,
        code: error.code || null,
        retryable: pending.has(error),
      });
    result.readiness.attempts.push(attempt);
    if (!error) {
      Object.assign(result, value, { pass: true });
      delete result.error;
      save();
      return result;
    }
    result.error = error.message;
    if (!pending.has(error)) {
      if (error.code === 'PAGES_READINESS_DEADLINE') result.readiness.deadlineExceeded = true;
      save();
      return result;
    }
    save();
    const remaining = deadline - clock();
    if (remaining > 0) await wait(Math.min(pollMs, remaining));
  }
  result.error = expired().message;
  result.readiness.deadlineExceeded = true;
  save();
  return result;
}

if (require.main === module) {
  const [directory, base, report] = process.argv.slice(2);
  const retain = (result) => {
    fs.mkdirSync(path.dirname(report), { recursive: true });
    fs.writeFileSync(report, JSON.stringify(result, null, 2) + '\n');
  };
  ready(directory, base, fetch, { retain })
    .then((result) => {
      if (!result.pass) {
        console.error(result.error);
        process.exitCode = 1;
      }
    })
    .catch((error) => {
      fs.mkdirSync(path.dirname(report), { recursive: true });
      fs.writeFileSync(
        report,
        JSON.stringify(
          { schema: 1, kind: 'pages-http', pass: false, error: error.message },
          null,
          2
        ) + '\n'
      );
      console.error(error.message);
      process.exitCode = 1;
    });
}
module.exports = { origin, baseURL, request, check, ready };
