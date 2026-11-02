'use strict';
// Explicit sequential diagnostic. Does not publish or replace release admission.
const fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process');
const { root, out, report } = require('./common.cjs');
const checks = Object.freeze(['lighthouse', 'motion', 'reader-performance']);

function execute(run, checkpoint = () => {}) {
  // Preserve every independent outcome even when an earlier budget fails.
  const rows = [];
  for (const check of checks) {
    let row;
    try {
      row = { check, ...run(check) };
    } catch (error) {
      row = { check, exitCode: null, error: error.message };
    }
    rows.push(row);
    checkpoint(rows);
  }
  return rows;
}
function main() {
  fs.mkdirSync(out, { recursive: true });
  const manifestPath = process.env.SITE_ARTIFACT_MANIFEST,
    manifest = JSON.parse(fs.readFileSync(manifestPath)),
    publicDir = process.env.SITE_PUBLIC_DIR,
    artifact = require('./artifact.cjs');
  if (fs.existsSync(path.join(out, 'performance-suite.json')))
    throw Error('Use a fresh report directory');
  for (const check of checks)
    if (fs.existsSync(path.join(out, check))) throw Error('Use a fresh report directory');
  const details = {
    rows: [],
    verification: { before: false, after: false },
    fullGate: false,
    productionEligible: false,
    collector: {
      commit: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
      tree: cp
        .execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: root, encoding: 'utf8' })
        .trim(),
      sourceDirty:
        cp
          .execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' })
          .trim() !== '',
      scriptSha256: artifact.digest(fs.readFileSync(__filename)),
    },
  };
  const persist = (pass = false) => report('performance-suite', details, pass);
  try {
    artifact.verify(publicDir, manifest);
    details.verification.before = true;
    persist();
    const rows = execute(
      (check) => {
        const directory = path.join(out, check);
        fs.mkdirSync(directory);
        const log = fs.openSync(path.join(directory, 'execution.log'), 'wx'),
          startedAt = new Date().toISOString();
        let result;
        try {
          result = cp.spawnSync(
            process.execPath,
            [path.join(root, 'tools/quality', check + '.cjs')],
            {
              cwd: root,
              env: { ...process.env, SITE_REPORT_DIR: directory },
              stdio: ['ignore', log, log],
              timeout: 50 * 60 * 1000,
            }
          );
        } finally {
          fs.closeSync(log);
        }
        const row = {
          startedAt,
          finishedAt: new Date().toISOString(),
          exitCode: result.status,
          signal: result.signal,
          error: result.error?.message || null,
        };
        process.stdout.write(JSON.stringify({ check, ...row }) + '\n');
        return row;
      },
      (rows) => {
        details.rows = rows;
        persist();
      }
    );
    artifact.verify(publicDir, manifest);
    details.verification.after = true;
    const pass = rows.every((row) => row.exitCode === 0 && !row.signal && !row.error);
    persist(pass);
    if (!pass) process.exitCode = 1;
  } catch (error) {
    details.error = error.stack;
    persist();
    throw error;
  }
}
if (require.main === module)
  try {
    main();
  } catch (error) {
    console.error(error.stack);
    process.exitCode = 1;
  }
module.exports = { execute, checks };
