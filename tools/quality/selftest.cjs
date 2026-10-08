'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  cp = require('node:child_process'),
  assert = require('node:assert/strict'),
  crypto = require('node:crypto');
const { tools, root } = require('./common.cjs');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'site-gate-fixtures-'));
const py = (name) =>
  path.join(tools, 'venv', process.platform === 'win32' ? 'Scripts' : 'bin', name);
function run(command, args) {
  const r = cp.spawnSync(command, args, {
    cwd: temp,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    env: {
      ...process.env,
      SEMGREP_SETTINGS_FILE: path.join(temp, 'settings.yml'),
      SEMGREP_LOG_FILE: path.join(temp, 'semgrep.log'),
    },
  });
  assert.ok([0, 1].includes(r.status), r.stderr || String(r.error));
  return JSON.parse(r.stdout);
}
try {
  const repository = cp.spawnSync('git', ['init', '--quiet', temp], { encoding: 'utf8' });
  assert.equal(repository.status, 0, 'controlled scanner fixture needs a repository root');
  fs.mkdirSync(path.join(temp, 'docs'));
  fs.writeFileSync(
    path.join(temp, 'docs/probe.js'),
    'document.body.' + 'innerHTML = location.search;\n'
  );
  const semgrep = run(py('semgrep'), [
    'scan',
    '--config',
    path.join(root, 'tools/quality/security-rules.yml'),
    '--metrics',
    'off',
    '--disable-version-check',
    '--jobs',
    '1',
    '--json',
    'docs',
  ]);
  assert.ok(
    semgrep.results.some((x) => x.check_id.endsWith('browser-html-injection')),
    'security rule did not detect controlled sink'
  );
  assert.deepEqual(semgrep.errors, []);
  const value = crypto
    .createHash('sha256')
    .update('non-functional gate fixture; never a credential')
    .digest('hex');
  fs.writeFileSync(
    path.join(temp, 'credential_fixture.txt'),
    '# Deliberately non-functional scanner fixture\napi_key = "' + value + '"\n'
  );
  const secrets = run(py('detect-secrets'), ['scan', '--no-verify', 'credential_fixture.txt']);
  assert.ok(
    Object.values(secrets.results).flat().length > 0,
    'secret probe did not detect controlled value'
  );
  console.log(
    'Controlled security sink and non-functional credential fixture were detected. Aggregate failure propagation is covered by tests/quality.test.cjs.'
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
