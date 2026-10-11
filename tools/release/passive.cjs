'use strict';
// A bounded passive scan is confined to the configured production origin.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const edition = require('./edition.cjs');
const image =
  'ghcr.io/zaproxy/zaproxy@sha256:7aaa659b0d43078febd82e29bad112285c370727e86ab8340444220e17d9f0d2';
// Pages cannot configure arbitrary response headers. Retain these findings as warnings.
const warningRules = new Set(['10015', '10016', '10020', '10038', '10055', '10063']);

function plan() {
  const escaped = edition.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    env: {
      contexts: [
        {
          name: 'author-production',
          urls: [edition.origin + '/'],
          includePaths: ['^' + escaped + '/.*$'],
          excludePaths: ['^' + escaped + '/staging/.*$'],
        },
      ],
      parameters: {
        failOnError: true,
        failOnWarning: true,
        continueOnFailure: false,
        maxDuration: 300,
      },
    },
    jobs: [
      { type: 'passiveScan-config', parameters: { scanOnlyInScope: true } },
      {
        type: 'spider',
        parameters: { context: 'author-production', maxDuration: 1, maxChildren: 10 },
      },
      { type: 'passiveScan-wait', parameters: { maxDuration: 3 } },
      {
        type: 'report',
        parameters: { template: 'traditional-json', reportDir: '/zap/wrk', reportFile: 'zap.json' },
      },
    ],
  };
}

function validate(report) {
  assert.ok(
    Array.isArray(report.site) && report.site.length === 1,
    'missing or out-of-origin passive coverage'
  );
  assert.equal(report.site[0]['@name'], edition.origin);
  assert.ok(typeof report['@version'] === 'string' && report['@version'].length > 0);
  const rows = [];
  for (const alert of report.site[0].alerts) {
    assert.match(String(alert.pluginid), /^\d+$/);
    assert.ok(Array.isArray(alert.instances) && alert.instances.length > 0);
    for (const item of alert.instances) {
      const url = new URL(item.uri);
      assert.equal(url.origin, edition.origin, 'passive scan left the authorized origin');
      assert.ok(!url.pathname.startsWith('/staging/'));
    }
    const risk = Number(alert.riskcode);
    assert.ok(Number.isInteger(risk) && risk >= 0 && risk <= 3);
    assert.ok(
      risk === 0 || (risk < 3 && warningRules.has(String(alert.pluginid))),
      'untriaged passive finding: ' + alert.pluginid
    );
    rows.push({ rule: String(alert.pluginid), risk, disposition: risk === 0 ? 'info' : 'warn' });
  }
  return {
    schema: 1,
    kind: 'production-passive',
    pass: true,
    origin: edition.origin,
    image,
    version: report['@version'],
    rows,
  };
}

if (require.main === module) {
  const [mode, file, output] = process.argv.slice(2);
  if (mode === 'plan') fs.writeFileSync(file, JSON.stringify(plan(), null, 2) + '\n');
  else if (mode === 'verify')
    fs.writeFileSync(
      output,
      JSON.stringify(validate(JSON.parse(fs.readFileSync(file))), null, 2) + '\n'
    );
  else throw Error('Usage: passive.cjs plan FILE | verify RAW_JSON REPORT_JSON');
}
module.exports = { image, warningRules, plan, validate };
