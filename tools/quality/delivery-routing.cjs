'use strict';

const assert = require('node:assert/strict');
const { safePath } = require('./delivery-json.cjs');
const { compare } = require('./delivery-git.cjs');
const registryPath = 'tools/quality/test-profiles.json';
const policyPath = '.github/acceptance/issue-122.json';
function matches(file, pattern) {
  const expression = pattern
    .split(/(\*\*|\*)/)
    .map((part) =>
      part === '**' ? '.*' : part === '*' ? '[^/]*' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    .join('');
  return new RegExp('^' + expression + '$').test(file);
}
function provenance(manifest) {
  const paths = Object.values(manifest.bases).flatMap((basis) => basis.provenance);
  paths.push(...manifest.notices.map((notice) => notice.path));
  return new Set(paths.map(safePath));
}
function rule(id, impact, control, owner, dependencies, detail) {
  return { id, impact, control, owner, dependencies, detail };
}
function classify(file, rights, contentPaths = new Set()) {
  const rules = [];
  const add = (...args) => rules.push(rule(...args));
  if (rights.has(file))
    add(
      'D07',
      'website',
      false,
      'tools/release/rights.cjs',
      ['site/rights.json'],
      'Exact input is consumed by the rights provenance/notice compiler.'
    );
  if (['LICENSING.md', 'LICENSE-CODE.md', 'LICENSE-CONTENT.md', 'NOTICE.md'].includes(file))
    add(
      'D06',
      'website',
      false,
      'tools/site/legal.cjs',
      ['site/templates/components/legal-notices.html'],
      'Full legal text is rendered in Credits.'
    );
  if (file === 'site/rights.json' || file.startsWith('site/retained/'))
    add(
      'D08',
      'website',
      file === 'site/rights.json',
      'tools/release/rights.cjs',
      ['site/rights.json'],
      'Edition/publication/rights input requires fresh applicable evidence.'
    );
  if (control(file))
    add(
      'D09',
      'website',
      true,
      'guides/SITE-CHECK-PROFILES.md',
      [registryPath, 'guides/SITE-STAGING.md'],
      'Selection, policy, producer or admission control.'
    );
  if (
    [
      'AGENTS.md',
      'MEMORY.md',
      'README.md',
      'CONTRIBUTING.md',
      'PROJECT-BOOTSTRAP.md',
      'review/REVIEW-TEMPLATE.md',
    ].includes(file) ||
    /^review\/issue-\d+\/.*\.md$/.test(file)
  )
    add(
      'D01',
      'repository',
      false,
      'CONTRIBUTING.md',
      ['AGENTS.md'],
      'Instruction/review source retains repository and all current delivery obligations.'
    );
  if (
    [
      '.github/repository-paths.json',
      '.github/repository-intelligence-config.json',
      '.github/repository-layout.json',
      'REPOSITORY-MAP.md',
    ].includes(file) ||
    file === '.github/repository-intelligence/agent-context.json'
  )
    add(
      'D02',
      'repository',
      false,
      'tools/repository_intelligence.py',
      ['.github/repository-intelligence-config.json'],
      'RI inventory/configuration and derived views.'
    );
  if (file === 'tools/repository_intelligence.py')
    add(
      'D03',
      'repository',
      false,
      'tools/repository_intelligence.py',
      ['tests/test_repository_intelligence.py'],
      'Executable RI behavior retains its real Python checks.'
    );
  if (contentPaths.has(file))
    add(
      'D04',
      'content',
      false,
      'tools/site/content.cjs',
      ['site/rights.json'],
      'Authored content retains content/render/reference/rights obligations.'
    );
  if (
    (file.startsWith('site/') &&
      !file.startsWith('site/content/') &&
      !file.startsWith('site/retained/') &&
      file !== 'site/rights.json') ||
    file.startsWith('tools/site/')
  )
    add(
      'D05',
      'website',
      false,
      'tools/site/build.cjs',
      ['site/README.md'],
      'Website implementation, assets, templates or build dependency.'
    );
  if (!rules.length)
    add(
      'D10',
      'website',
      null,
      null,
      [],
      'No complete dependency disposition is established for this exact path.'
    );
  return rules;
}
function control(file) {
  return (
    /^\.github\/workflows\/[^/]+\.ya?ml$/.test(file) ||
    /^\.github\/acceptance\/issue-\d+\.json$/.test(file) ||
    /^tools\/quality\/delivery-(?:git|json|routing|observation)\.cjs$/.test(file) ||
    [
      'tools/staging/admission.cjs',
      'tools/quality/test-profiles.json',
      'tools/quality/source-tests.cjs',
      'tools/quality/source-test-worker.cjs',
      'tools/quality/budgets.json',
      'tools/quality/common.cjs',
      'tools/quality/artifact.cjs',
      'tools/site/edition.cjs',
      'tools/run_repository_tests.py',
      'tools/issue_acceptance.py',
      '.github/ACCEPTANCE.md',
      '.github/ri-ci-map.json',
      'guides/SITE-CHECK-PROFILES.md',
      'guides/SITE-STAGING.md',
      'tools/site/build.cjs',
      'tools/site/snapshot.cjs',
      'tools/site/evidence-policy.cjs',
      'site/output-lock.json',
    ].includes(file)
  );
}
function newObligation(id, category, owner, argv, workflow, profile = null) {
  return {
    id,
    category,
    required: true,
    owner,
    execution: { kind: 'command', command: { argv, cwd: '.' }, gate: null },
    workflow,
    triggerReasonIds: [],
    sourceProfile: profile,
    hostedOriginPolicy: null,
    validationLevel: null,
    state: 'planned',
    evidence: null,
    reason: null,
  };
}
function gate(id, category, owner, name, workflow = null) {
  const row = newObligation(id, category, owner, [], workflow);
  row.execution = { kind: 'external-gate', command: null, gate: name };
  return row;
}
function common(base, candidate) {
  const workflow = (name, job) => ({ path: '.github/workflows/' + name + '.yml', job });
  const rows = [
    newObligation(
      'B',
      'baseline',
      'tools/quality/local.cjs',
      ['node', 'tools/quality/local.cjs', '--package', 'quality-artifact'],
      workflow('site-checks', 'checks'),
      'pr'
    ),
    newObligation(
      'R',
      'repository',
      'tools/repository_intelligence.py',
      [
        'python3',
        'tools/repository_intelligence.py',
        '--config',
        '.github/repository-intelligence-config.json',
        'verify',
      ],
      workflow('navigation', 'navigation')
    ),
    newObligation(
      'R-PYTHON',
      'repository',
      'tools/run_repository_tests.py',
      ['python3', 'tools/run_repository_tests.py'],
      workflow('site-color-review', 'build')
    ),
    gate('H-PREVIEW', 'hosted', policyPath, 'COVERAGE', workflow('site-color-review', 'smoke')),
    gate('H', 'hosted', policyPath, 'DELIVERY', workflow('site-color-review', 'promote')),
    gate(
      'ADMISSION',
      'admission',
      policyPath,
      'DELIVERY',
      workflow('site-color-review', 'pr-admission')
    ),
    gate('REQUIREMENTS', 'external', policyPath, 'REQUIREMENTS'),
    gate('REVIEW', 'external', policyPath, 'REVIEW'),
    gate('WHITEBOX', 'external', policyPath, 'WHITEBOX'),
    gate('EXPLORATORY', 'external', policyPath, 'EXPLORATORY'),
    gate('H-PREFLIGHT', 'external', policyPath, 'COVERAGE'),
  ];
  if (candidate)
    rows.push(
      newObligation(
        'O',
        'owning',
        'tools/issue_acceptance.py',
        [
          'python3',
          'tools/issue_acceptance.py',
          'run',
          '--policy',
          policyPath,
          '--report',
          '/tmp/issue-122-acceptance.json',
          '--require-clean',
          '--expected-source',
          candidate,
        ],
        workflow('issue-acceptance', 'acceptance')
      )
    );
  else
    rows.push(
      gate('O', 'owning', policyPath, 'DELIVERY', workflow('issue-acceptance', 'acceptance'))
    );
  const repositoryCommands = [
    ['R-STYLE', ['python3', 'tools/check_code_style.py']],
    ['R-COUPLING', ['python3', 'tools/check_ri_ci.py', 'verify']],
    ...[
      'test_code_style.py',
      'test_ubuntu_downloads.py',
      'test_ri_ci.py',
      'test_root_layout.py',
      'test_repository_test_selection.py',
      'test_repository_intelligence.py',
    ].map((file) => [
      'R-TEST:' + file,
      ['python3', '-m', 'unittest', 'discover', '-s', 'tests', '-p', file],
    ]),
    [
      'R-FIXTURES',
      [
        'node',
        '--test',
        'tests/test-profile-selection.test.cjs',
        'tests/staging-gate.test.cjs',
        'tests/staging-regression.test.cjs',
        'tests/quality-sources.test.cjs',
      ],
    ],
  ];
  for (const [id, argv] of repositoryCommands)
    rows.push(
      newObligation(
        id,
        'repository',
        '.github/workflows/navigation.yml',
        argv,
        workflow('navigation', 'navigation')
      )
    );
  for (const [id, argv] of [
    ['B-FORMAT', ['node', 'tools/quality/format.cjs', '--check']],
    ['B-ARCHITECTURE', ['node', 'tools/quality/architecture.cjs']],
    ['B-LINT', ['node', 'tools/quality/scanners.cjs', 'lint']],
  ])
    rows.push(
      newObligation(
        id,
        'baseline',
        '.github/workflows/site-checks.yml',
        argv,
        workflow('site-checks', 'checks'),
        'pr'
      )
    );
  for (const row of rows.filter((row) => row.category === 'hosted')) {
    row.hostedOriginPolicy = 'staging';
    row.validationLevel = 'staging';
  }
  rows.push(
    newObligation(
      'H-SOURCE',
      'source',
      'tools/quality/source-tests.cjs',
      ['node', 'tools/quality/source-tests.cjs', '--profile', 'staging', '--require-clean'],
      workflow('site-color-review', 'build'),
      'staging'
    )
  );
  return rows;
}
function selected(registry, file) {
  const targets = registry.tests.filter((row) => row.lifecycle !== 'task-snapshot');
  const shared = registry.source_profiles.pr.shared_inputs.some((input) => matches(file, input));
  const affected = targets.filter((row) => row.inputs.some((input) => matches(file, input)));
  const known =
    affected.length ||
    registry.source_profiles.pr.known_non_node_paths.some((input) => matches(file, input));
  return targets.filter(
    (row) =>
      row.language === 'javascript' &&
      !row.profiles.includes('pr-smoke') &&
      (affected.includes(row) || ((shared || !known) && row.lifecycle === 'permanent'))
  );
}
function validateRegistry(registry) {
  assert.equal(registry?.schema_version, 1, 'unsupported registry');
  assert.ok(Array.isArray(registry.tests) && registry.tests.length, 'empty registry');
  const seen = new Set();
  for (const row of registry.tests) {
    safePath(row.path);
    safePath(row.owner);
    assert.ok(!seen.has(row.path), 'duplicate registry test');
    seen.add(row.path);
    assert.ok(
      ['permanent', 'diagnostic', 'task-snapshot'].includes(row.lifecycle),
      'invalid lifecycle'
    );
    assert.ok(['javascript', 'python'].includes(row.language), 'invalid test language');
    assert.ok(
      row.language === 'javascript'
        ? /^tests\/.*\.test\.cjs$/.test(row.path)
        : /^tests\/(?:.*\/)?test_[^/]+\.py$/.test(row.path),
      'unsupported test path/language'
    );
    assert.ok(Array.isArray(row.inputs) && row.inputs.includes(row.path), 'missing test inputs');
    for (const input of row.inputs) pattern(input);
    assert.ok(
      Array.isArray(row.profiles) &&
        row.profiles.length &&
        new Set(row.profiles).size === row.profiles.length,
      'invalid test profiles'
    );
    for (const profile of row.profiles)
      assert.ok(
        ['pr-smoke', 'pr-targeted', 'staging', 'production', 'diagnostic', 'issue-policy'].includes(
          profile
        ),
        'unknown test profile'
      );
  }
  const pr = registry.source_profiles?.pr;
  for (const key of ['shared_inputs', 'known_non_node_paths', 'baseline_files']) {
    assert.ok(Array.isArray(pr?.[key]), 'missing source profile inputs');
    for (const input of pr[key]) pattern(input);
  }
  return registry;
}
function pattern(value) {
  safePath(value);
  assert.ok(!/[?[\]{}]/.test(value), 'unsupported registry pattern');
}

function contextFor(base, candidate) {
  const obligations = common(base, candidate),
    reasons = [],
    unresolved = [],
    impacts = new Set();
  const byId = new Map(obligations.map((row) => [row.id, row]));
  function attach(reason, obligation) {
    let row = byId.get(obligation.id);
    if (!row) {
      row = obligation;
      byId.set(row.id, row);
      obligations.push(row);
    }
    if (!reason.obligationIds.includes(row.id)) reason.obligationIds.push(row.id);
    if (!row.triggerReasonIds.includes(reason.id)) row.triggerReasonIds.push(reason.id);
  }
  const reason = {
    id: 'common',
    ruleId: 'common',
    path: null,
    side: 'none',
    owner: 'guides/SITE-CHECK-PROFILES.md',
    dependencyPaths: [registryPath],
    obligationIds: [],
    detail:
      'Every current PR retains baseline, repository, owning, hosted, admission and four roles.',
  };
  reasons.push(reason);
  for (const row of obligations) attach(reason, row);
  return { obligations, reasons, unresolved, impacts, byId, attach, knownControl: false };
}
function attachSource(context, reason, file, sources) {
  // A candidate registry cannot remove the independently inspected base obligations.
  for (const source of [sources.base, sources.candidate, sources.policy]) {
    for (const row of selected(source.registry, file))
      context.attach(
        reason,
        newObligation(
          'SOURCE:' + row.path + ':' + row.owner + ':pr',
          'source',
          row.owner,
          ['node', '--test', row.path],
          { path: '.github/workflows/site-checks.yml', job: 'checks' },
          'pr'
        )
      );
  }
}
function appendRule(context, item, record, file, side, sources) {
  context.impacts.add(item.impact);
  context.knownControl ||= item.control === true;
  const reason = {
    id: 'r' + context.reasons.length,
    ruleId: item.id,
    path: file,
    side,
    owner: item.owner,
    dependencyPaths: item.dependencies,
    obligationIds: [],
    detail: item.detail,
  };
  context.reasons.push(reason);
  for (const id of ['B', 'R', 'O', 'H', 'ADMISSION']) context.attach(reason, context.byId.get(id));
  if (item.id === 'D10')
    context.unresolved.push({
      id: 'u' + (context.unresolved.length + 1),
      path: file,
      side,
      baseObject: record.oldObject,
      candidateObject: record.newObject,
      ruleId: 'D10',
      reason: item.detail,
      action: 'inspect-owner',
      obligationIds: ['B', 'R', 'O', 'H', 'ADMISSION'],
    });
  if (['website', 'content'].includes(item.impact))
    context.attach(reason, context.byId.get('H-PREFLIGHT'));
  attachSource(context, reason, file, sources);
}
function appendSide(context, record, side, sources) {
  const file = side === 'base' ? record.oldPath : record.newPath;
  if (!file) return;
  const mode = side === 'base' ? record.oldMode : record.newMode;
  const rules = classify(file, sources[side].rights, sources[side].contentPaths);
  if (!['100644', '100755'].includes(mode))
    rules.push(
      rule(
        'D10',
        'website',
        null,
        null,
        [],
        'Unsupported Git type/mode ' + mode + '; never follow or execute it.'
      )
    );
  for (const item of rules) appendRule(context, item, record, file, side, sources);
}
function analyze(records, sources, base, candidate) {
  const context = contextFor(base, candidate);
  for (const record of records)
    for (const side of ['base', 'candidate']) appendSide(context, record, side, sources);
  const { unresolved, impacts, knownControl, reasons, obligations } = context;
  const status = !records.length ? 'no-change' : unresolved.length ? 'conservative' : 'complete';
  const controlFlag = knownControl ? true : unresolved.length ? null : false;
  const proposedLane = !records.length
    ? null
    : knownControl || impacts.has('website')
      ? 'website'
      : impacts.has('content')
        ? 'content'
        : 'repository';
  return {
    analysis: {
      status,
      impacts: [...impacts].sort(),
      control: controlFlag,
      proposedLane,
      reasons,
      unresolved,
    },
    obligations: obligations.sort((a, b) => compare(a.id, b.id)),
  };
}

module.exports = {
  registryPath,
  policyPath,
  matches,
  provenance,
  classify,
  selected,
  validateRegistry,
  analyze,
};
