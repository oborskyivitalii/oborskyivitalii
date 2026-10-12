'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const pkg = require('./package.cjs');

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

async function check(directory, value, fetcher = fetch) {
  const base = baseURL(value);
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'pages-package.json')));
  pkg.verify(directory, record);
  const prefix = pkg.basePath(new URL(base).pathname);
  assert.equal(record.state.basePath || '/', prefix, 'Pages package base path differs');
  const rows = [];
  const names = Object.keys(record.files).filter((name) => !name.endsWith('.nojekyll'));
  for (let start = 0; start < names.length; start += 4) {
    const observations = await Promise.allSettled(
      names.slice(start, start + 4).map(async (name) => {
        const { response, bytes } = await request(base + '/' + name, base, fetcher);
        assert.equal(response.status, 200, 'Pages file unavailable: ' + name);
        assert.equal(
          artifact.digest(bytes),
          record.files[name].sha256,
          'wrong Pages bytes: ' + name
        );
        if (name.endsWith('.png')) {
          assert.match(
            response.headers?.get('content-type') || '',
            /image\/png/i,
            'PNG content type ' + name
          );
        }
        return { file: name, sha256: artifact.digest(bytes), status: response.status };
      })
    );
    const failed = observations.find((item) => item.status === 'rejected');
    if (failed) throw failed.reason;
    rows.push(...observations.map((item) => item.value));
  }
  for (const [url, file] of [
    ['/', 'index.html'],
    ['/staging/', 'staging/index.html'],
    ['/staging/writing.html?topic=systems&language=uk', 'staging/writing.html'],
  ]) {
    const { response, bytes } = await request(base + url, base, fetcher);
    assert.equal(response.status, 200);
    assert.equal(artifact.digest(bytes), record.files[file].sha256);
  }
  const articles = Object.values(record.staging.components.articles || {});
  for (const article of articles) {
    for (const file of [article.alias, article.url]) {
      const name = 'staging/' + file;
      const { response, bytes } = await request(base + '/' + name, base, fetcher);
      assert.equal(response.status, 200, 'Pages article deep link unavailable');
      assert.equal(
        artifact.digest(bytes),
        record.files[name].sha256,
        'Pages article deep link differs'
      );
    }
  }
  const missing = await request(base + '/staging/__delivery_missing', base, fetcher);
  assert.equal(missing.response.status, 404, 'Pages converted a missing route to Home');
  assert.equal(artifact.digest(missing.bytes), record.files['404.html'].sha256);
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
    staging: true,
    query: true,
    actual404: true,
    ...(articles.length ? { articleDocuments: articles.length, articleDeepLinks: true } : {}),
  };
}

if (require.main === module) {
  const [directory, base, report] = process.argv.slice(2);
  check(directory, base)
    .then((result) => {
      fs.mkdirSync(path.dirname(report), { recursive: true });
      fs.writeFileSync(report, JSON.stringify(result, null, 2) + '\n');
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
module.exports = { origin, baseURL, request, check };
