'use strict';
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const common = require('./common.cjs');
const stage = require('./staging-regression.cjs');
const { performanceBudgetFailure } = require('./validate.cjs');
const budgets = require('./budgets.json');

// Verified public review upload 13806490173 from the original failed stage.
const deployment = {
  run: 42905616039,
  attempt: 1,
  upload: 13806490173,
  target: 'https://fc14f6de.oborskyi-author-ci-staging.pages.dev',
  source: '1746a7afc1698502d95a426f4b75927b9fbce0f9',
  tree: '23ef14003b2d550c0783177e5581206c5442b7c3',
  artifactDigest: '537f24bcb2718c175a2c637d2ad1aa71160a955b193d4fcf4f5168dc64fb1dc4',
  revisionDigest: '390f250480d6245dd170a3fb663d364c966303c4cd77b94151fbe08d0956f929',
};

async function verifyRevision() {
  const response = await fetch(deployment.target + '/site-revision.json', {
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, 'immutable deployment revision unavailable');
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    deployment.revisionDigest,
    'served revision differs from the original staging upload'
  );
  return JSON.parse(bytes).variant;
}

async function collectPair(pair, report) {
  const cases = stage.flightCases().filter((entry) => entry.to === 'writing');
  assert.deepEqual(
    cases.map(({ phase }) => phase),
    ['cold', 'warm']
  );
  for (const selected of cases) {
    report.pending = { phase: selected.phase };
    assert.equal(new URL(pair.page.url()).origin, deployment.target);
    const setup = await stage.waitForFlightSetup(pair.page, selected);
    report.pending.setup = setup;
    stage.validateFlightSetup(setup, selected);
    const row = await stage.measureFlight(pair, selected, setup);
    report.rows.push(row);
    assert.equal(new URL(pair.page.url()).origin, deployment.target);
    try {
      stage.validateFlight(row, selected);
    } catch (error) {
      row.pass = false;
      row.error = error.message;
      row.validationFailure = performanceBudgetFailure(error);
      if (!row.validationFailure) throw error;
    }
    if (selected.phase === 'cold') await stage.restoreFlightIndex(pair);
    report.pending = null;
  }
}

async function main() {
  const report = {
    kind: 'issue189-writing-pair',
    deployment,
    diagnosticSource: process.env.GITHUB_SHA,
    diagnosticTree: execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim(),
    environment: common.environment(),
    budgetMs: budgets.motion.transition.readyMaxMs,
    rows: [],
    cleanupErrors: [],
    complete: false,
  };
  let browser;
  let pair;
  try {
    report.variant = await verifyRevision();
    browser = await common
      .toolRequire('playwright')
      .chromium.launch(common.launchOptions('chromium'));
    report.browser = browser.version();
    pair = await stage.openFlightPair(browser, deployment.target);
    await collectPair(pair, report);
    assert.deepEqual(await verifyRevision(), report.variant);
    report.complete = true;
  } catch (error) {
    report.error = { message: error.message, setup: error.setupEvidence || null };
  } finally {
    for (const resource of [pair, browser]) {
      if (resource) {
        await resource.close().catch((error) => report.cleanupErrors.push(error.message));
      }
    }
    common.save('writing-pair', report);
  }
  const lines = [
    'Issue 189 Home → Writing diagnostic',
    'Complete: ' + report.complete + ', equivalent readiness budget: ' + report.budgetMs + ' ms',
    ...report.rows.map(
      (row) =>
        row.transitionPhase +
        ': raw ' +
        row.readyMs +
        ' ms, equivalent ' +
        row.equivalentReadyMs +
        ' ms, within budget and valid: ' +
        row.pass
    ),
  ];
  console.log(JSON.stringify({ complete: report.complete, error: report.error || null }));
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
  }
  const pass =
    report.complete && !report.cleanupErrors.length && report.rows.every((row) => row.pass);
  process.exitCode = pass ? 0 : 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
