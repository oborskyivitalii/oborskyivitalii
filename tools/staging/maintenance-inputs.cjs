'use strict';
// Owner-operated CI repair evidence. This collector never grants merge or deployment authority.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const repository = 'oborskyivitalii/oborskyivitalii';
const ownerId = 248754648;
const marker = '<!-- controller-maintenance-v1 -->';
const sourceContexts = [
  'checks',
  'Local navigation and RI freshness',
  'Owning issue deterministic acceptance mapping',
];
const exactPaths = new Set([
  'AGENTS.md',
  'CONTRIBUTING.md',
  'MEMORY.md',
  'REPOSITORY-MAP.md',
  'guides/SITE-STAGING.md',
  'guides/SITE-CHECK-PROFILES.md',
  'guides/CODE-STYLE.md',
  'guides/CI-MAINTENANCE.md',
  '.github/ACCEPTANCE.md',
  '.github/REPOSITORY-INTELLIGENCE.md',
  '.github/repository-paths.json',
  '.github/repository-layout.json',
  '.github/repository-intelligence-config.json',
  '.github/ri-ci-map.json',
  '.github/repository-intelligence/agent-context.json',
  ...[
    'navigation',
    'site-checks',
    'issue-acceptance',
    'site-color-review',
    'site-release-checks',
    'site-staging-merge',
    'ci-maintenance',
  ].map((name) => '.github/workflows/' + name + '.yml'),
  ...['admission.cjs', 'review-flow.cjs', 'maintenance.cjs', 'maintenance-inputs.cjs'].map(
    (name) => 'tools/staging/' + name
  ),
  ...[
    'ubuntu_downloads.py',
    'source-tests.cjs',
    'source-test-worker.cjs',
    'test-profiles.json',
  ].map((name) => 'tools/quality/' + name),
  ...[
    'repository_intelligence.py',
    'check_repository_layout.py',
    'check_ri_ci.py',
    'check_code_style.py',
    'issue_acceptance.py',
    'run_repository_tests.py',
  ].map((name) => 'tools/' + name),
  ...['protect-main-before', 'source-admission', 'staging-admission'].map(
    (name) => '.github/rulesets/' + name + '.json'
  ),
]);

function digest(value) {
  return crypto
    .createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');
}
function sha(value) {
  assert.match(value, /^[a-f0-9]{40}$/);
  return value;
}
function eligiblePath(name, issue) {
  assert.ok(
    !/[\\\r\n\0]/.test(name) &&
      !name.split('/').some((part) => !part || part === '.' || part === '..')
  );
  return (
    exactPaths.has(name) ||
    /^tests\/[A-Za-z0-9_-]+(?:\.test)?\.cjs$/.test(name) ||
    /^tests\/[A-Za-z0-9_-]+\.py$/.test(name) ||
    name === '.github/acceptance/issue-' + issue + '.json' ||
    new RegExp('^review/issue-' + issue + '/[A-Za-z0-9_.-]+\\.(?:md|json)$').test(name)
  );
}
function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30000,
    maxBuffer: 8 * 1024 * 1024,
  });
}
function rawChanges(raw, issue) {
  const fields = raw.split('\0');
  assert.equal(fields.pop(), '', 'unterminated Git delta');
  const changes = [];
  while (fields.length) {
    const match = /^:(\d{6}) (\d{6}) ([a-f0-9]{40}) ([a-f0-9]{40}) ([ADMR])\d*$/.exec(
      fields.shift()
    );
    assert.ok(match, 'unsupported Git status or incomplete delta');
    const [, beforeMode, afterMode, beforeBlob, afterBlob, status] = match;
    for (const mode of [beforeMode, afterMode])
      assert.ok(
        ['000000', '100644'].includes(mode),
        'symlink/type/executable changes require normal admission'
      );
    const beforePath = fields.shift(),
      afterPath = status === 'R' ? fields.shift() : beforePath;
    for (const name of [beforePath, afterPath])
      assert.ok(
        typeof name === 'string' && eligiblePath(name, issue),
        'non-CI or unknown repair path: ' + name
      );
    changes.push({ beforeMode, afterMode, beforeBlob, afterBlob, status, beforePath, afterPath });
    assert.ok(changes.length <= 2000, 'maintenance delta too large');
  }
  return changes;
}
function collect(base, head, issue, cwd = process.cwd()) {
  sha(base);
  sha(head);
  assert.ok(Number.isSafeInteger(issue) && issue > 0);
  assert.equal(
    git(cwd, ['rev-parse', '--is-shallow-repository']).trim(),
    'false',
    'full history required'
  );
  git(cwd, ['merge-base', '--is-ancestor', base, head]);
  const tree = (ref) => git(cwd, ['rev-parse', ref + '^{tree}']).trim();
  const rows = git(cwd, ['rev-list', '--reverse', '--topo-order', '--parents', base + '..' + head])
    .trim()
    .split('\n')
    .filter(Boolean);
  assert.ok(rows.length > 0 && rows.length <= 100, 'empty or oversized maintenance history');
  const history = [];
  for (const row of rows) {
    const [commit, ...parents] = row.split(' ');
    assert.ok(parents.length > 0 && parents.length <= 2, 'unsupported repair ancestry');
    for (const parent of parents) {
      const raw = git(cwd, [
        'diff',
        '--raw',
        '--no-abbrev',
        '-z',
        '--find-renames=50%',
        parent,
        commit,
      ]);
      history.push({ parent, commit, changes: rawChanges(raw, issue) });
    }
  }
  const changes = rawChanges(
    git(cwd, ['diff', '--raw', '--no-abbrev', '-z', '--find-renames=50%', base, head]),
    issue
  );
  assert.ok(changes.length, 'no net repair');
  const paths = [
    ...new Set(history.flatMap((edge) => edge.changes.flatMap((r) => [r.beforePath, r.afterPath]))),
  ].sort();
  assert.ok(paths.length <= 500, 'maintenance path inventory too large');
  const result = {
    base,
    head,
    baseTree: tree(base),
    headTree: tree(head),
    history,
    changes,
    paths,
  };
  return { ...result, diffDigest: digest(result) };
}
function reviewPaths(head, reviews, cwd = process.cwd()) {
  for (const review of reviews) git(cwd, ['cat-file', '-e', sha(head) + ':' + review.path]);
}
function payload(record) {
  return Object.fromEntries(
    ['name', 'target', 'enforcement', 'bypass_actors', 'conditions', 'rules'].map((key) => [
      key,
      structuredClone(record[key]),
    ])
  );
}
function plan(original) {
  const before = payload(original);
  assert.equal(before.target, 'branch');
  assert.equal(before.enforcement, 'active');
  assert.deepEqual(before.bypass_actors, [], 'unexpected original bypass');
  assert.deepEqual(before.conditions, { ref_name: { exclude: [], include: ['~DEFAULT_BRANCH'] } });
  const checks = before.rules.filter((r) => r.type === 'required_status_checks');
  assert.equal(checks.length, 1);
  assert.equal(checks[0].parameters.strict_required_status_checks_policy, true);
  assert.deepEqual(
    [...checks[0].parameters.required_status_checks].sort((a, b) =>
      a.context.localeCompare(b.context)
    ),
    ['checks', 'Local navigation and RI freshness', 'Staging admission']
      .map((context) => ({ context, integration_id: 15368 }))
      .sort((a, b) => a.context.localeCompare(b.context))
  );
  assert.deepEqual(
    before.rules.map((r) => r.type).sort(),
    ['deletion', 'non_fast_forward', 'pull_request', 'required_status_checks'].sort()
  );
  const status = (contexts) => ({
    type: 'required_status_checks',
    parameters: {
      ...checks[0].parameters,
      required_status_checks: contexts.map((context) => ({ context, integration_id: 15368 })),
    },
  });
  return {
    before,
    baseline: {
      ...before,
      name: 'source-admission',
      rules: [
        ...before.rules.filter((r) => r.type !== 'required_status_checks'),
        status(sourceContexts),
      ],
    },
    staging: {
      ...before,
      name: 'staging-admission',
      bypass_actors: [{ actor_id: ownerId, actor_type: 'User', bypass_mode: 'pull_request' }],
      rules: [status(['Staging admission'])],
    },
  };
}
function canonical(value) {
  if (Array.isArray(value))
    return value.map(canonical).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])])
    );
  return value;
}
function layered(actual, expected) {
  assert.deepEqual(
    canonical(payload(actual)),
    canonical(expected),
    'live protection differs from reviewed ruleset'
  );
  return true;
}
module.exports = {
  repository,
  ownerId,
  marker,
  sourceContexts,
  digest,
  sha,
  eligiblePath,
  rawChanges,
  collect,
  reviewPaths,
  payload,
  plan,
  canonical,
  layered,
};
if (require.main === module) {
  assert.equal(process.argv.length, 5, 'usage: maintenance-inputs.cjs BASE HEAD ISSUE');
  const [base, head, issue] = process.argv.slice(2);
  process.stdout.write(JSON.stringify(collect(base, head, Number(issue)), null, 2) + '\n');
}
