'use strict';
// Supplemental reader measurements; the original five-route matrix stays complete.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process'),
  { pathToFileURL } = require('node:url');
const { toolRequire, report, launchOptions, out } = require('./common.cjs'),
  artifact = require('./artifact.cjs'),
  motion = require('./motion.cjs'),
  validate = require('./validate.cjs'),
  budgets = require('./budgets.json');

function inventory(manifest, revision) {
  assert.ok(revision && typeof revision === 'object', 'missing verified public revision');
  assert.deepEqual(
    manifest.components?.articles || {},
    revision.articles || {},
    'reader metadata differs from verified public revision'
  );
  return Object.entries(revision.articles || {}).map(([key, article], index) => {
    assert.match(article.alias, /^articles\/[a-z0-9-]+\.html$/, 'unsafe reader alias');
    assert.ok(manifest.files[article.alias], 'missing reader artifact');
    return { key, route: 'reader-' + (index + 1), alias: article.alias };
  });
}

function checkMotion(sample) {
  assert.deepEqual(sample.errors, []);
  assert.equal(sample.positiveProbe, true, 'missing reader Motion-on paints');
  assert.equal(sample.measurements.length, 4);
  for (const [index, kind] of ['idle', 'scroll', 'off', 'reduced'].entries())
    validate.measure(sample.measurements[index], kind, index >= 2);
  if (sample.width === 390 && sample.rate === 4) {
    for (const row of sample.measurements.slice(0, 2))
      assert.ok(row.paintCallbackMs.p95 <= budgets.motion.paintCallbackP95Ms, 'reader paint p95');
    assert.ok(
      sample.measurements[0].callbackBusyPercent <= budgets.motion.idleCallbackBusyPercent,
      'reader idle busy'
    );
  }
}

async function main() {
  for (const file of ['reader-performance.json', 'lighthouse-summary.json'])
    assert.ok(!fs.existsSync(path.join(out, file)), 'Use a fresh reader report directory');
  const manifest = JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST));
  artifact.verify(process.env.SITE_PUBLIC_DIR, manifest);
  const revision = require('../site/snapshot.cjs').verify(process.env.SITE_PUBLIC_DIR, manifest),
    readers = inventory(manifest, revision),
    details = {
      readers,
      rows: [],
      samples: [],
      violations: [],
      productionEligible: false,
      collector: {
        commit: cp.execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        tree: cp
          .execFileSync('git', ['rev-parse', 'HEAD^{tree}'], {
            encoding: 'utf8',
          })
          .trim(),
        sourceDirty:
          cp
            .execFileSync('git', ['status', '--porcelain'], {
              encoding: 'utf8',
            })
            .trim() !== '',
        scriptSha256: artifact.digest(fs.readFileSync(__filename)),
      },
    };
  const { server, url } = await require('./serve.cjs').start();
  const record = (pass = false) => report('reader-performance', details, pass);
  fs.mkdirSync(out, { recursive: true });
  let browser;
  try {
    if (readers.length === 0) {
      details.notApplicable = 'No article documents in the verified artifact';
      record(true);
      return;
    }
    const { default: lighthouse } = await import(
        pathToFileURL(toolRequire.resolve('lighthouse')).href
      ),
      launcher = await import(pathToFileURL(toolRequire.resolve('chrome-launcher')).href),
      { default: desktop } = await import(
        pathToFileURL(toolRequire.resolve('lighthouse/core/config/desktop-config.js')).href
      ),
      { recordTrial, retainResearchEvidence } = require('./lighthouse.cjs');
    for (const formFactor of ['mobile', 'desktop'])
      for (const reader of readers)
        for (let run = 1; run <= budgets.lighthouse.runs; run++) {
          const chrome = await launcher.launch({
            chromePath:
              process.env.SITE_AUDIT_CHROME || toolRequire('playwright').chromium.executablePath(),
            chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
          });
          try {
            const result = await lighthouse(
              url + '/' + reader.alias,
              {
                port: chrome.port,
                output: 'json',
                logLevel: 'error',
                onlyCategories: ['performance', 'accessibility', 'best-practices'],
              },
              formFactor === 'desktop' ? desktop : undefined
            );
            recordTrial(reader.route, formFactor, run, result, details.rows);
            details.rows.at(-1).originalEvidence = retainResearchEvidence(
              `lighthouse-${reader.route}-${formFactor}-${run}`,
              result
            );
            record();
          } catch (error) {
            details.violations.push({
              check: 'lighthouse-trial',
              reader: reader.key,
              formFactor,
              run,
              error: error.message,
            });
            record();
          } finally {
            await chrome.kill();
          }
        }
    // A metric failure must not suppress the independent motion observations.
    try {
      details.lighthouse = validate.lighthouse(
        { rows: details.rows },
        readers.map((row) => row.route)
      );
    } catch (error) {
      details.violations.push({ check: 'lighthouse', error: error.message });
    }
    browser = await toolRequire('playwright').chromium.launch(launchOptions('chromium'));
    details.browser = browser.version();
    for (const profile of [
      { width: 1440, rate: 1 },
      { width: 390, rate: 1 },
      { width: 390, rate: 4 },
    ])
      for (const reader of readers) {
        try {
          const sample = await motion.sample(
            browser,
            url,
            reader.alias.replace(/\.html$/, ''),
            profile
          );
          details.samples.push({ ...sample, key: reader.key });
          checkMotion(sample);
        } catch (error) {
          details.violations.push({
            check: 'motion',
            reader: reader.key,
            ...profile,
            error: error.message,
            failedSample: error.motionSample || null,
          });
        }
        record();
      }
    artifact.verify(process.env.SITE_PUBLIC_DIR, manifest);
    record(details.violations.length === 0);
    assert.equal(details.violations.length, 0, 'reader performance budgets failed');
  } catch (error) {
    details.error = error.stack;
    record(false);
    throw error;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}
if (require.main === module)
  main().catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = { inventory, checkMotion };
