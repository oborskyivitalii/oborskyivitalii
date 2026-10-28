'use strict';
// Read-only adapter for the existing manual cause workflow and immutable release.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const archive = require('../release/archive.cjs');
const controller = require('../release/controller.cjs');
const probe = require('./analytics-live.cjs');

function authorize(context, candidate) {
  assert.equal(context.eventName, 'workflow_dispatch');
  assert.equal(context.repo.owner + '/' + context.repo.repo, 'oborskyivitalii/oborskyivitalii');
  assert.equal(context.actor, context.repo.owner);
  assert.match(candidate, /^[a-f0-9]{40}$/);
  assert.equal(context.sha, candidate, 'workflow and diagnostic checkout must be identical');
}

async function productionLease(github, context) {
  const [branch, accepted] = await Promise.all([
    github.rest.repos.getBranch({ ...context.repo, branch: 'production' }),
    require('../pages/controller.cjs').activeProduction(github, context),
  ]);
  assert.ok(accepted, 'missing current accepted production deployment');
  assert.equal(branch.data.commit.sha, accepted.sourceCommit, 'production bookkeeping differs');
  return {
    branchSource: branch.data.commit.sha,
    tag: accepted.tag,
    sourceCommit: accepted.sourceCommit,
    publicDigest: accepted.publicDigest,
    deploymentId: accepted.deploymentId,
  };
}

function bindRelease(record, production) {
  probe.target(record, production.sourceCommit);
  assert.equal(record.tag, production.tag, 'requested release is not current production');
  assert.equal(record.publicDigest, production.publicDigest, 'current production digest differs');
}

function save(directory, name, value) {
  fs.writeFileSync(path.join(directory, name), JSON.stringify(value, null, 2) + '\n');
}

async function prepare(github, context) {
  authorize(context, process.env.SITE_CANDIDATE_SHA);
  assert.equal(
    cp.execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    context.sha
  );
  assert.equal(cp.execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(), '');
  const directory = process.env.SITE_ANALYTICS_LIVE_DIR;
  const releaseDirectory = path.join(directory, 'release');
  const tag = archive.tag(process.env.SITE_ANALYTICS_RELEASE);
  const production = await productionLease(github, context);
  const record = await controller.restoreArchive(github, context, tag, releaseDirectory);
  bindRelease(record, production);
  await controller.wasAccepted(github, context, record);
  cp.execFileSync('python3', [
    'tools/release/package.py',
    'unpack',
    path.join(releaseDirectory, 'public.tar.gz'),
    directory + '/target',
    record.packageDigest,
  ]);
  fs.copyFileSync(
    path.join(releaseDirectory, 'rights.json'),
    path.join(directory, 'target/rights.json')
  );
  archive.verify(
    directory + '/target',
    record,
    fs.readFileSync(path.join(releaseDirectory, 'public.tar.gz'))
  );
  require('../release/edition-archive.cjs').verify(directory + '/target', record.public);
  save(directory + '/target', 'archive.json', record);
  save(directory + '/target', 'binding.json', {
    collectorSource: context.sha,
    productionSource: production.sourceCommit,
    production,
    tag,
    publicDigest: record.publicDigest,
    workflow: process.env.GITHUB_WORKFLOW_REF,
    workflowSHA: process.env.GITHUB_WORKFLOW_SHA,
    runId: context.runId,
    attempt: process.env.GITHUB_RUN_ATTEMPT,
  });
  assert.deepEqual(
    await productionLease(github, context),
    production,
    'production moved during preparation'
  );
}

async function finish(github, context) {
  const directory = process.env.SITE_ANALYTICS_LIVE_DIR;
  const binding = JSON.parse(fs.readFileSync(path.join(directory, 'target/binding.json')));
  const report = JSON.parse(
    fs.readFileSync(path.join(process.env.SITE_REPORT_DIR, 'analytics-live.json'))
  );
  let observed;
  let leaseError;
  try {
    observed = await productionLease(github, context);
    assert.deepEqual(observed, binding.production, 'production moved during observation');
  } catch (error) {
    report.pass = false;
    leaseError = error;
  }
  report.productionLease = {
    expected: binding.production,
    observed: observed || null,
    error: leaseError?.message || null,
  };
  save(process.env.SITE_REPORT_DIR, 'analytics-live.json', report);
  if (leaseError) throw leaseError;
  assert.equal(report.pass, true, 'retain failed diagnostic result');
}

module.exports = { authorize, bindRelease, productionLease, prepare, finish };
