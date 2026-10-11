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

async function request(url, expected, fetcher) {
  const response = await fetcher(url, {
    redirect: 'manual',
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  assert.ok(
    ![301, 302, 303, 307, 308].includes(response.status),
    'use the configured canonical Pages origin'
  );
  assert.equal(new URL(response.url || url).origin, expected);
  return { response, bytes: Buffer.from(await response.arrayBuffer()) };
}

async function check(directory, value, fetcher = fetch) {
  const base = origin(value);
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'pages-package.json')));
  pkg.verify(directory, record);
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
  const missing = await request(base + '/staging/__delivery_missing', base, fetcher);
  assert.equal(missing.response.status, 404, 'Pages converted a missing route to Home');
  assert.equal(artifact.digest(missing.bytes), record.files['404.html'].sha256);
  return {
    schema: 1,
    kind: 'pages-http',
    pass: true,
    origin: base,
    packageDigest: record.packageDigest,
    rows,
    root: true,
    staging: true,
    query: true,
    actual404: true,
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
module.exports = { origin, request, check };
