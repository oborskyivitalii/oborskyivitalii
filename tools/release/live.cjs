'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const edition = require('./edition-archive.cjs');
const pages = require('../pages/http.cjs');
const hosted = require('../quality/hosted.cjs');
const artifact = require('../quality/artifact.cjs');

async function check(directory, record, fetcher = fetch) {
  const social = edition.verify(directory, record.public);
  artifact.verify(path.join(directory, 'public'), record.public, record.publicDigest);
  const observation = await hosted.verify(edition.origin, 'production', record.public, fetcher);
  const image = observation.rows.find((row) => row.file === social.file);
  assert.ok(image, 'missing live production social image');
  assert.match(image.mime, /^image\/jpeg(?:\s*;|$)/i, 'incorrect live social image MIME');
  for (const id of require('../site/snapshot.cjs').routes) {
    const result = await pages.request(edition.routeURL(id), edition.origin, fetcher);
    assert.equal(result.response.status, 200);
    assert.ok(
      result.bytes.toString().includes('<link rel="canonical" href="' + edition.routeURL(id) + '">')
    );
  }
  return {
    schema: 1,
    kind: 'production-policy',
    pass: true,
    sourceCommit: record.sourceCommit,
    publicDigest: record.publicDigest,
    origin: edition.origin,
    ...observation,
  };
}

function observation(record, combined, reports) {
  assert.equal(reports.pages.pass, true);
  assert.equal(reports.pages.packageDigest, combined.packageDigest);
  assert.equal(reports.policy.pass, true);
  assert.equal(reports.policy.publicDigest, record.publicDigest);
  assert.equal(reports.policy.sourceCommit, record.sourceCommit);
  assert.equal(reports.policy.origin, edition.origin);
  for (const [name, manifest] of [
    ['productionBrowser', record.public],
    ['stagingBrowser', combined.staging],
  ]) {
    const result = reports[name];
    require('../quality/validate.cjs').sourceReport(result, manifest);
    assert.equal(result.kind, 'preview-smoke');
    assert.equal(result.rows.length, 4);
    assert.ok(result.rows.every((row) => row.pass));
    assert.equal(result.target, edition.origin + (name === 'stagingBrowser' ? '/staging' : ''));
  }
  require('./passive.cjs').verifyReport(reports.passive);
  assert.equal(reports.retained, true);
  return {
    pass: true,
    sourceCommit: record.sourceCommit,
    publicDigest: record.publicDigest,
    deploymentURL: edition.origin + '/',
    pages: true,
    productionPolicy: true,
    browser: true,
    passiveScan: true,
    retained: true,
  };
}

if (require.main === module) {
  const [directory, recordFile, output] = process.argv.slice(2);
  check(directory, JSON.parse(fs.readFileSync(recordFile)))
    .then((result) => fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n'))
    .catch((error) => {
      fs.writeFileSync(output, JSON.stringify({ pass: false, error: error.message }) + '\n');
      console.error(error.message);
      process.exitCode = 1;
    });
}
module.exports = { check, observation };
