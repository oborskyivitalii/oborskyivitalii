'use strict';
// A bounded passive scan is confined to the configured production origin.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const edition = require('./edition.cjs');
const routes = require('../site/snapshot.cjs').routes.map(edition.routeURL);
const image =
  'ghcr.io/zaproxy/zaproxy@sha256:7aaa659b0d43078febd82e29bad112285c370727e86ab8340444220e17d9f0d2';
// Pages cannot configure arbitrary response headers. Retain these findings as warnings.
const warningRules = new Set(['10015', '10016', '10020', '10038', '10055', '10063']);

function disposition(rule, risk) {
  assert.match(rule, /^\d+$/);
  assert.ok(Number.isInteger(risk) && risk >= 0 && risk <= 3);
  assert.ok(
    risk === 0 || (risk < 3 && warningRules.has(rule)),
    'untriaged passive finding: ' + rule
  );
  return risk === 0 ? 'info' : 'warn';
}

function plan() {
  const escaped = edition.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    env: {
      contexts: [
        {
          name: 'author-production',
          urls: [edition.origin + '/'],
          includePaths: ['^' + escaped + '/.*$'],
          excludePaths: ['^' + escaped + '/staging(?:[/?].*)?$'],
        },
      ],
      parameters: {
        failOnError: true,
        failOnWarning: true,
        continueOnFailure: false,
      },
    },
    jobs: [
      { type: 'passiveScan-config', parameters: { scanOnlyInScope: true } },
      {
        type: 'requestor',
        requests: routes.map((url) => ({ url, method: 'GET', responseCode: 200 })),
      },
      {
        type: 'spider',
        parameters: {
          context: 'author-production',
          maxDuration: 1,
          threadCount: 2,
          processForm: false,
          postForm: false,
        },
        tests: [
          {
            name: 'Production spider discovered URLs',
            type: 'stats',
            statistic: 'automation.spider.urls.added',
            operator: '>=',
            value: 1,
            onFail: 'error',
          },
        ],
      },
      {
        type: 'passiveScan-wait',
        parameters: { maxDuration: 3 },
        tests: [
          {
            name: 'Actual messages entered passive scanning',
            type: 'stats',
            statistic: 'stats.pscan.recordsToScan',
            operator: '>=',
            value: 1,
            onFail: 'error',
          },
        ],
      },
      {
        type: 'export',
        parameters: {
          context: 'author-production',
          type: 'har',
          source: 'all',
          fileName: '/zap/wrk/coverage.har',
        },
      },
      {
        type: 'report',
        parameters: { template: 'traditional-json', reportDir: '/zap/wrk', reportFile: 'zap.json' },
      },
    ],
  };
}

function authorizedURL(uri) {
  const url = new URL(uri);
  assert.equal(url.origin, edition.origin, 'passive traffic left the authorized origin');
  assert.ok(!url.username && !url.password, 'authenticated passive traffic is not authorized');
  assert.ok(
    !/^\/staging(?:\/|$)/.test(decodeURIComponent(url.pathname)),
    'passive traffic included staging'
  );
  return url.href;
}

function coverage(traffic) {
  const messages = traffic?.log?.entries;
  assert.ok(
    Array.isArray(messages) && messages.length >= routes.length && messages.length <= 1000,
    'missing or unbounded actual passive HTTP coverage'
  );
  const visited = new Set();
  for (const message of messages) {
    const url = authorizedURL(message.request.url);
    assert.equal(message.request.method, 'GET', 'passive coverage must use read-only requests');
    assert.ok(
      Number.isInteger(message.response.status) &&
        message.response.status >= 100 &&
        message.response.status <= 599,
      'missing actual passive response'
    );
    if (message.response.status === 200) visited.add(url);
  }
  for (const url of routes) assert.ok(visited.has(url), 'passive coverage missed route ' + url);
  return { messages: messages.length, routes: [...routes], visitedURLs: [...visited].sort() };
}

function verifyReport(report) {
  assert.equal(report.schema, 1);
  assert.equal(report.kind, 'production-passive');
  assert.equal(report.pass, true);
  assert.equal(report.origin, edition.origin);
  assert.equal(report.image, image);
  assert.ok(typeof report.version === 'string' && report.version.length > 0);
  const scanned = report.coverage;
  assert.ok(
    Number.isInteger(scanned?.messages) &&
      scanned.messages >= routes.length &&
      scanned.messages <= 1000,
    'missing actual passive message count'
  );
  assert.deepEqual(scanned.routes, routes, 'passive route inventory differs');
  assert.ok(
    Array.isArray(scanned.visitedURLs) && scanned.visitedURLs.length <= scanned.messages,
    'missing actual passive visited URLs'
  );
  const visited = new Set(scanned.visitedURLs.map(authorizedURL));
  assert.equal(visited.size, scanned.visitedURLs.length, 'duplicate passive visited URL');
  for (const url of routes) assert.ok(visited.has(url), 'passive coverage missed route ' + url);
  assert.ok(
    Array.isArray(report.rows) && report.rows.length <= 1000,
    'missing passive finding policy'
  );
  for (const row of report.rows)
    assert.equal(
      row.disposition,
      disposition(row.rule, row.risk),
      'passive finding disposition differs'
    );
  return true;
}

function validate(report, traffic) {
  const scanned = coverage(traffic);
  assert.ok(
    Array.isArray(report.site) && report.site.length === 1,
    'missing or out-of-origin passive coverage'
  );
  assert.equal(report.site[0]['@name'], edition.origin);
  assert.ok(typeof report['@version'] === 'string' && report['@version'].length > 0);
  const rows = [];
  for (const alert of report.site[0].alerts) {
    assert.ok(Array.isArray(alert.instances) && alert.instances.length > 0);
    for (const item of alert.instances) authorizedURL(item.uri);
    const risk = Number(alert.riskcode);
    const rule = String(alert.pluginid);
    rows.push({ rule, risk, disposition: disposition(rule, risk) });
  }
  return {
    schema: 1,
    kind: 'production-passive',
    pass: true,
    origin: edition.origin,
    image,
    version: report['@version'],
    coverage: scanned,
    rows,
  };
}

if (require.main === module) {
  const [mode, file, output] = process.argv.slice(2);
  if (mode === 'plan') fs.writeFileSync(file, JSON.stringify(plan(), null, 2) + '\n');
  else if (mode === 'verify')
    fs.writeFileSync(
      output,
      JSON.stringify(
        validate(
          JSON.parse(fs.readFileSync(file)),
          JSON.parse(fs.readFileSync(path.join(path.dirname(file), 'coverage.har')))
        ),
        null,
        2
      ) + '\n'
    );
  else throw Error('Usage: passive.cjs plan FILE | verify RAW_JSON REPORT_JSON');
}
module.exports = { image, warningRules, plan, coverage, verifyReport, validate };
