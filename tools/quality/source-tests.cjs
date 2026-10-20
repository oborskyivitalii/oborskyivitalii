'use strict';
// Source-only profiles. Hosted scenarios and accepted task snapshots have other owners.
const fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process'),
  assert = require('node:assert/strict');
const { isDeepStrictEqual } = require('node:util');
const REGISTRY = 'tools/quality/test-profiles.json';
const executionLimits = Object.freeze({
  timeoutMs: 180000,
  reportGraceMs: 30000,
  maxBufferBytes: 16 * 1024 * 1024,
});
function safePath(value, { pattern = false } = {}) {
  assert.equal(typeof value, 'string', 'path must be text');
  assert.ok(
    value.length > 0 && !/[\0\r\n\\]/.test(value) && !path.posix.isAbsolute(value),
    'unsafe path ' + value
  );
  assert.ok(
    value.split('/').every((part) => part && part !== '.' && part !== '..'),
    'unsafe path ' + value
  );
  if (!pattern) assert.ok(!value.includes('*'), 'literal path required ' + value);
  else
    assert.ok(
      !['?', '[', ']', '{', '}'].some((token) => value.includes(token)),
      'unsupported path pattern ' + value
    );
  return value;
}
function matches(file, pattern) {
  safePath(file);
  safePath(pattern, { pattern: true });
  let expression = '';
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === '*') {
      if (pattern[i + 1] === '*') {
        expression += '.*';
        i++;
      } else expression += '[^/]*';
    } else expression += char.replace(/[.+^$()|\\]/g, '\\$&');
  }
  return new RegExp('^' + expression + '$').test(file);
}
function actualModules(root) {
  const modules = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      const relative = directory + '/' + entry.name;
      assert.ok(!entry.isSymbolicLink(), 'symlink test inventory entry ' + relative);
      if (entry.isDirectory()) visit(relative);
      else if (
        entry.isFile() &&
        (entry.name.endsWith('.test.cjs') || /^test_.*\.py$/.test(entry.name))
      )
        modules.push(relative);
    }
  }
  visit('tests');
  return modules.sort();
}
function loadRegistry(root) {
  return JSON.parse(fs.readFileSync(path.join(root, REGISTRY), 'utf8'));
}
function validateLifecycle(row) {
  if (/^tests\/test_issue\d+_acceptance\.py$/.test(row.path))
    assert.equal(row.lifecycle, 'task-snapshot', 'numeric task modules are owning-policy-only');
  if (row.lifecycle === 'task-snapshot')
    assert.deepEqual(
      row.profiles,
      ['issue-policy'],
      'task snapshots cannot enter routine profiles'
    );
  if (row.lifecycle === 'diagnostic') {
    assert.ok(
      row.profiles.includes('diagnostic') && row.profiles.includes('pr-targeted'),
      'diagnostic needs explicit replay/changed-helper route'
    );
    assert.ok(
      !row.profiles.some((p) => ['production', 'staging', 'pr-smoke'].includes(p)),
      'diagnostic cannot enter routine profiles'
    );
  }
  if (row.lifecycle === 'permanent')
    assert.ok(
      row.profiles.includes('production') &&
        row.profiles.includes('staging') &&
        row.profiles.includes('pr-targeted'),
      'permanent module needs current profile routes'
    );
}
function validateTestRow(root, row, profiles) {
  safePath(row.path);
  assert.ok(
    /^tests\/(?:[^/]+\/)*[^/]+(?:\.test\.cjs|\.py)$/.test(row.path),
    'unsupported test module ' + row.path
  );
  const stat = fs.lstatSync(path.join(root, row.path));
  assert.equal(stat.isFile(), true, 'test module is not a regular file ' + row.path);
  assert.ok(!stat.isSymbolicLink(), 'symlink test module ' + row.path);
  assert.equal(
    row.language,
    row.path.endsWith('.cjs') ? 'javascript' : 'python',
    'test language mismatch ' + row.path
  );
  assert.ok(
    ['permanent', 'diagnostic', 'task-snapshot'].includes(row.lifecycle),
    'missing test lifecycle ' + row.path
  );
  for (const key of ['purpose', 'owner', 'disposition', 'surviving_route'])
    assert.ok(typeof row[key] === 'string' && row[key].trim(), row.path + ' missing ' + key);
  safePath(row.owner);
  assert.ok(fs.statSync(path.join(root, row.owner)).isFile(), 'missing test owner ' + row.owner);
  assert.ok(
    Array.isArray(row.profiles) &&
      row.profiles.length &&
      new Set(row.profiles).size === row.profiles.length,
    'invalid test profiles ' + row.path
  );
  for (const profile of row.profiles)
    assert.ok(profiles.has(profile), 'unknown test profile ' + profile);
  assert.ok(
    Array.isArray(row.inputs) && row.inputs.includes(row.path),
    'test must target its own changed module ' + row.path
  );
  for (const input of row.inputs) safePath(input, { pattern: true });
  validateLifecycle(row);
}
function validateBaseline(root, registry) {
  const smoke = registry.tests
    .filter((r) => r.profiles.includes('pr-smoke'))
    .map((r) => r.path)
    .sort();
  for (const profile of ['pr', 'staging']) {
    const baseline = registry.source_profiles?.[profile]?.baseline_files;
    assert.ok(
      Array.isArray(baseline) && new Set(baseline).size === baseline.length,
      'missing/duplicate baseline inventory'
    );
    assert.deepEqual(
      [...baseline].sort(),
      smoke,
      'source profile baseline must equal declared smoke modules'
    );
  }
  const local = fs.readFileSync(path.join(root, 'tools/quality/local.cjs'), 'utf8'),
    localTests = new Set();
  for (const call of local.matchAll(/tests\(\[([\s\S]*?)\]\)/g))
    for (const match of call[1].matchAll(/['"](tests\/[^'"]+\.test\.cjs)['"]/g))
      localTests.add(match[1]);
  assert.deepEqual(
    [...localTests].sort(),
    smoke,
    'baseline delegation must match actual local.cjs test calls'
  );
  assert.ok(
    Array.isArray(registry.source_profiles.pr.known_non_node_paths),
    'known non-Node routes must be declared'
  );
  for (const key of ['known_non_node_paths', 'shared_inputs']) {
    assert.ok(Array.isArray(registry.source_profiles.pr[key]), 'missing impact category ' + key);
    for (const input of registry.source_profiles.pr[key]) safePath(input, { pattern: true });
  }
}
function validateRegistry(root, registry) {
  assert.equal(registry.schema_version, 1, 'unsupported test registry');
  assert.equal(
    registry.owner,
    'guides/SITE-CHECK-PROFILES.md',
    'test profile owner must remain explicit'
  );
  assert.ok(Array.isArray(registry.tests) && registry.tests.length > 0, 'empty test inventory');
  const seen = new Set(),
    profiles = new Set([
      'pr-smoke',
      'pr-targeted',
      'staging',
      'production',
      'diagnostic',
      'issue-policy',
      'content',
    ]);
  for (const row of registry.tests) {
    safePath(row.path);
    assert.ok(!seen.has(row.path), 'duplicate test module ' + row.path);
    seen.add(row.path);
    validateTestRow(root, row, profiles);
  }
  assert.deepEqual(
    [...seen].sort(),
    actualModules(root),
    'test inventory must cover every actual module exactly; declare new modules or retire missing ones'
  );
  validateBaseline(root, registry);
  const content = registry.source_profiles.content;
  assert.ok(content && Array.isArray(content.authored_inputs), 'missing content impact policy');
  for (const key of ['authored_inputs', 'derived_inputs']) {
    assert.ok(
      Array.isArray(content[key]) && content[key].length,
      'missing content category ' + key
    );
    for (const input of content[key]) safePath(input, { pattern: true });
  }
  assert.deepEqual(
    [...content.mandatory_files].sort(),
    registry.tests
      .filter((row) => row.profiles.includes('content'))
      .map((row) => row.path)
      .sort(),
    'mandatory content inventory must equal declared content modules'
  );
  assert.ok(
    content.mandatory_files.length > 0 &&
      content.mandatory_files.every((file) =>
        registry.tests.some(
          (row) =>
            row.path === file && row.language === 'javascript' && row.lifecycle === 'permanent'
        )
      ),
    'content modules must retain permanent staging and production routes'
  );
  return registry;
}
function git(root, args) {
  return cp.execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 8 * 1024 * 1024,
  });
}
function readChangedPaths(root, base, head) {
  for (const ref of [base, head])
    assert.match(ref || '', /^[0-9a-f]{40}$/, 'target selection requires exact commit refs');
  assert.equal(
    git(root, ['rev-parse', base + '^{commit}']).trim(),
    base,
    'base must be exact commit'
  );
  assert.equal(
    git(root, ['rev-parse', head + '^{commit}']).trim(),
    head,
    'head must be exact commit'
  );
  assert.equal(
    git(root, ['rev-parse', 'HEAD']).trim(),
    head,
    'target selection head must equal checkout'
  );
  const raw = git(root, [
    'diff',
    '--no-ext-diff',
    '--no-textconv',
    '--name-only',
    '-z',
    base,
    head,
    '--',
  ]);
  const files = raw.split('\0').filter(Boolean);
  for (const file of files) safePath(file);
  return [...new Set(files)].sort();
}
function normalizedChanges(root, options) {
  const files =
    options.changedPaths === undefined
      ? readChangedPaths(root, options.base, options.head)
      : options.changedPaths;
  assert.ok(Array.isArray(files), 'changed paths must be a list');
  return [...new Set(files.map((value) => safePath(value)))].sort();
}
function knownNonNodeChange(registry, affected, changed) {
  return (
    affected.some((row) => row.language === 'python') ||
    registry.tests.some((row) => row.lifecycle === 'task-snapshot' && row.path === changed) ||
    registry.source_profiles.pr.known_non_node_paths.some((input) => matches(changed, input))
  );
}
function selectPRTargets(root, registry, options, permanent, include) {
  const changedPaths = normalizedChanges(root, options),
    conservativeFallback = [];
  for (const changed of changedPaths) {
    if (registry.source_profiles.pr.shared_inputs.some((input) => matches(changed, input)))
      for (const row of permanent) include(row, 'shared source control ' + changed);
    const affected = registry.tests.filter(
      (row) =>
        row.lifecycle !== 'task-snapshot' && row.inputs.some((input) => matches(changed, input))
    );
    for (const row of affected.filter((row) => row.language === 'javascript'))
      include(row, 'changed ' + changed);
    if (!affected.length && !knownNonNodeChange(registry, affected, changed)) {
      conservativeFallback.push(changed);
      for (const row of permanent) include(row, 'unknown changed source ' + changed);
    }
  }
  return { changedPaths, conservativeFallback };
}
function publicationInventoryCompatible(registry, before, after) {
  const derivedEntry = (file) => file === 'docs' || file.startsWith('docs/');
  const withoutPublications = (value) => ({
    ...value,
    entries: Object.fromEntries(
      Object.entries(value.entries || {}).filter(
        ([file]) =>
          !file.startsWith('site/publications/') &&
          !file.startsWith('site/assets/publications/') &&
          !derivedEntry(file)
      )
    ),
  });
  if (!isDeepStrictEqual(withoutPublications(before), withoutPublications(after))) return false;
  // Existing non-content publication inputs can remain pinned, never change or disappear.
  for (const [file, entry] of Object.entries(before.entries || {})) {
    if (
      (file.startsWith('site/publications/') || file.startsWith('site/assets/publications/')) &&
      entry.kind === 'file' &&
      !registry.source_profiles.content.authored_inputs.some((input) => matches(file, input)) &&
      !isDeepStrictEqual(entry, after.entries?.[file])
    )
      return false;
  }
  for (const [file, entry] of Object.entries(after.entries || {})) {
    if (derivedEntry(file)) {
      safePath(file);
      if (
        !isDeepStrictEqual(Object.keys(entry).sort(), ['kind', 'owner', 'purpose', 'role']) ||
        entry.owner !== 'site/README.md' ||
        entry.role !== 'generated' ||
        !['file', 'directory'].includes(entry.kind) ||
        typeof entry.purpose !== 'string' ||
        !entry.purpose.trim()
      )
        return false;
      continue;
    }
    if (!file.startsWith('site/publications/') && !file.startsWith('site/assets/publications/'))
      continue;
    safePath(file);
    if (
      !isDeepStrictEqual(Object.keys(entry).sort(), ['kind', 'owner', 'purpose', 'role']) ||
      entry.owner !== 'guides/ARTICLE-WORKFLOW.md' ||
      !['source', 'generated', 'draft', 'configuration'].includes(entry.role) ||
      typeof entry.purpose !== 'string' ||
      !entry.purpose.trim() ||
      !['file', 'directory'].includes(entry.kind)
    )
      return false;
    if (
      entry.kind === 'file' &&
      !registry.source_profiles.content.authored_inputs.some((input) => matches(file, input)) &&
      !isDeepStrictEqual(entry, before.entries?.[file])
    )
      return false;
  }
  return true;
}
function riIdentityCompatible(before, after) {
  const { reviewed_source_identity: previousIdentity, ...previousPolicy } = before;
  const { reviewed_source_identity: currentIdentity, ...currentPolicy } = after;
  if (!isDeepStrictEqual(previousPolicy, currentPolicy)) return false;
  const validIdentity = (identity) =>
    identity?.algorithm === 'sha256-path-content-map-v1' &&
    isDeepStrictEqual(Object.keys(identity).sort(), ['algorithm', 'digest', 'inputs']) &&
    /^[a-f0-9]{64}$/.test(identity.digest || '') &&
    Array.isArray(identity.inputs) &&
    identity.inputs.every(
      (row) =>
        isDeepStrictEqual(Object.keys(row).sort(), ['path', 'sha256']) &&
        typeof row.path === 'string' &&
        /^[a-f0-9]{64}$/.test(row.sha256 || '')
    );
  if (!validIdentity(previousIdentity) || !validIdentity(currentIdentity)) return false;
  const previousPaths = previousIdentity.inputs.map((row) => safePath(row.path));
  const currentPaths = currentIdentity.inputs.map((row) => safePath(row.path));
  return (
    new Set(currentPaths).size === currentPaths.length &&
    isDeepStrictEqual(previousPaths, currentPaths)
  );
}
function exactDerivedPolicy(root, registry, base, head, file) {
  if (!root || !/^[0-9a-f]{40}$/.test(base || '') || !/^[0-9a-f]{40}$/.test(head || ''))
    return false;
  try {
    const before = JSON.parse(git(root, ['show', base + ':' + file]));
    const after = JSON.parse(git(root, ['show', head + ':' + file]));
    if (file === '.github/repository-paths.json')
      return publicationInventoryCompatible(registry, before, after);
    if (file === '.github/ri-ci-map.json') return riIdentityCompatible(before, after);
    return false;
  } catch {
    return false;
  }
}
function classifyContent(registry, changedPaths, options = {}) {
  const policy = registry.source_profiles.content;
  const authored = [],
    derived = [],
    platform = [];
  for (const file of changedPaths) {
    safePath(file);
    if (policy.authored_inputs.some((input) => matches(file, input))) authored.push(file);
    else if (policy.derived_inputs.some((input) => matches(file, input))) derived.push(file);
    else if (
      ['.github/repository-paths.json', '.github/ri-ci-map.json'].includes(file) &&
      exactDerivedPolicy(options.root, registry, options.base, options.head, file)
    )
      derived.push(file);
    else platform.push(file);
  }
  return {
    mode: authored.length > 0 && platform.length === 0 ? 'content' : 'platform',
    lane:
      authored.length > 0 && platform.length === 0
        ? authored.every((file) => /\.(?:png|jpe?g|webp|avif|svg|pdf)$/.test(file))
          ? 'media'
          : 'content'
        : 'platform',
    authored,
    derived,
    platform,
    reason: platform.length
      ? 'Changed platform, policy or unclassified source requires ordinary checks'
      : authored.length
        ? 'Only declared authored content and derived public bytes changed'
        : 'No declared authored content change; generated-only edits cannot select reuse',
  };
}
function select(root, profile, options = {}) {
  assert.ok(
    ['pr', 'content', 'staging', 'production', 'diagnostic'].includes(profile),
    'unknown source profile ' + profile
  );
  const registry = validateRegistry(root, options.registry || loadRegistry(root));
  const js = registry.tests.filter((row) => row.language === 'javascript'),
    permanent = js.filter((row) => row.lifecycle === 'permanent');
  const baselineFiles = ['pr', 'staging'].includes(profile)
    ? registry.source_profiles[profile].baseline_files
    : [];
  const baseline = new Set(baselineFiles),
    selected = new Set(),
    reasons = {};
  const include = (row, reason) => {
    if (!baseline.has(row.path)) {
      selected.add(row.path);
      (reasons[row.path] ??= []).push(reason);
    }
  };
  let changed = { changedPaths: [], conservativeFallback: [] };
  let classification;
  if (['pr', 'content'].includes(profile)) {
    const changedPaths = normalizedChanges(root, options);
    classification = classifyContent(registry, changedPaths, { root, ...options });
    if (profile === 'content')
      assert.equal(
        classification.mode,
        'content',
        'content profile rejects platform or empty changes'
      );
    if (classification.mode === 'content') {
      changed = { changedPaths, conservativeFallback: [] };
      for (const row of js.filter((row) => row.profiles.includes('content')))
        include(row, 'mandatory authored content safety contract');
    } else changed = selectPRTargets(root, registry, options, permanent, include);
  } else {
    const rows =
      profile === 'diagnostic' ? js.filter((row) => row.lifecycle === 'diagnostic') : permanent;
    const reason =
      profile === 'diagnostic'
        ? 'explicit diagnostic replay'
        : 'all permanent source modules in ' + profile;
    for (const row of rows) include(row, reason);
  }
  return {
    profile,
    registry: REGISTRY,
    modules: [...selected].sort(),
    baselineFiles: [...baselineFiles],
    baselineCommand: baselineFiles.length
      ? registry.source_profiles[profile].baseline_command
      : null,
    ...changed,
    ...(classification ? { classification } : {}),
    reasons,
    pythonRoute: 'python3 tools/run_repository_tests.py',
    taskSnapshots: 'selected owning issue policy only',
  };
}
function requireNonemptySuites(tap) {
  const active = [];
  let completed = null;
  for (const line of tap.split(/\r?\n/)) {
    const caption = line.match(/^([ ]*)# Subtest: (.+)$/);
    if (caption) {
      const indent = caption[1].length;
      if (active.length) active.at(-1).children++;
      active.push({ indent, name: caption[2], children: 0 });
      completed = null;
      continue;
    }
    const outcome = line.match(/^([ ]*)(?:not )?ok [0-9]+(?: |$)/);
    if (outcome) {
      const index = active.findLastIndex((entry) => entry.indent === outcome[1].length);
      completed = index < 0 ? null : active[index];
      if (index >= 0) active.length = index;
      continue;
    }
    const suite = line.match(/^([ ]*)type: ['"]suite['"]$/);
    if (suite)
      assert.ok(
        completed && suite[1].length === completed.indent + 2 && completed.children > 0,
        'empty Node suite cannot establish selected test coverage: ' + completed?.name
      );
  }
}
function accounting(tap, { modules = [], root = '' } = {}) {
  const captions = [...tap.matchAll(/^# Subtest: (.+)\r?$/gm)].map((match) => match[1].trim());
  assert.ok(captions.length > 0, 'no actual named Node test cases');
  const wrappers = new Set(modules.flatMap((file) => [file, path.resolve(root, file)]));
  assert.ok(
    !captions.some((caption) => wrappers.has(caption)),
    'empty selected test module reported only a file wrapper'
  );
  requireNonemptySuites(tap);
  const keys = ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'],
    values = {};
  for (const key of keys) {
    const found = [...tap.matchAll(new RegExp('^# ' + key + ' (\\d+)\\r?$', 'gm'))];
    assert.equal(found.length, 1, 'missing/duplicate Node ' + key + ' accounting');
    values[key] = Number(found[0][1]);
  }
  assert.ok(values.tests > 0, 'empty Node execution cannot report pass');
  assert.equal(values.pass, values.tests, 'not all selected source tests passed');
  for (const key of ['fail', 'cancelled', 'skipped', 'todo'])
    assert.equal(values[key], 0, 'selected source tests ' + key);
  return {
    total: values.tests,
    passed: values.pass,
    failed: values.fail,
    cancelled: values.cancelled,
    skipped: values.skipped,
    todo: values.todo,
  };
}
function requireClean(root) {
  const flags = git(root, ['ls-files', '-v', '-z']).split('\0').filter(Boolean);
  assert.ok(
    !flags.some((entry) => entry[0] === 'S' || /^[a-z]$/.test(entry[0])),
    'hidden index entries cannot bind source tests'
  );
  assert.equal(
    git(root, ['status', '--porcelain', '--untracked-files=all']).trim(),
    '',
    'source tests require clean checkout'
  );
}
function executeSource(root, argv) {
  const environment = { ...process.env };
  delete environment.NODE_TEST_CONTEXT;
  return cp.spawnSync(process.execPath, argv, {
    cwd: root,
    env: environment,
    encoding: 'utf8',
    maxBuffer: executionLimits.maxBufferBytes,
    timeout: executionLimits.timeoutMs,
  });
}
function executeBatch(root, modules, execute) {
  const argv = [path.join(__dirname, 'source-test-worker.cjs'), ...modules],
    started = Date.now(),
    result = execute(argv);
  const output = result.stdout || '',
    failures = output
      .split(/(?=^# Subtest:)/m)
      .filter((block) => /^not ok /m.test(block))
      .join('\n')
      .slice(0, 8000);
  assert.equal(
    result.status,
    0,
    'selected source test process failed: ' +
      [result.error?.message, result.stderr, failures || output.slice(-4000), result.status]
        .filter((value) => value !== undefined && value !== null && value !== '')
        .join('\n')
  );
  return {
    modules,
    ...accounting(output, { modules, root }),
    elapsedMs: Date.now() - started,
    argv,
  };
}
function executeBatches(root, modules, execute) {
  const scene = 'tests/space.test.cjs';
  const batches =
    modules.includes(scene) && modules.length > 1
      ? [[scene], modules.filter((file) => file !== scene)]
      : [modules];
  const outcomes = batches.map((selected) => {
    try {
      return { result: executeBatch(root, selected, execute) };
    } catch (error) {
      return { error };
    }
  });
  const failed = outcomes.find((outcome) => outcome.error);
  if (failed) throw failed.error;
  return outcomes.map((outcome) => outcome.result);
}
function executePlan(root, plan, options = {}) {
  assert.ok(Array.isArray(plan.modules), 'missing selected modules');
  assert.equal(new Set(plan.modules).size, plan.modules.length, 'duplicate selected source module');
  for (const file of plan.modules) {
    safePath(file);
    assert.ok(
      /^tests\/(?:[^/]+\/)*[^/]+\.test\.cjs$/.test(file),
      'unsupported selected source module'
    );
    const stat = fs.lstatSync(path.join(root, file));
    assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'selected source module must be regular');
  }
  if (options.requireClean) requireClean(root);
  if (!plan.modules.length) {
    assert.equal(plan.profile, 'pr', 'empty routine profile');
    return {
      ...plan,
      status: 'not-applicable',
      pass: null,
      total: 0,
      passed: 0,
      reason:
        'No additional Node target; local source smoke and applicable Python/owning-issue checks retain their own evidence.',
    };
  }
  const execute = options.execute || ((argv) => executeSource(root, argv));
  const started = Date.now(),
    batches = executeBatches(root, plan.modules, execute),
    counts = Object.fromEntries(
      ['total', 'passed', 'failed', 'cancelled', 'skipped', 'todo'].map((key) => [
        key,
        batches.reduce((sum, batch) => sum + batch[key], 0),
      ])
    );
  if (options.requireClean) requireClean(root);
  return {
    ...plan,
    status: 'passed',
    pass: true,
    ...counts,
    elapsedMs: Date.now() - started,
    ...(batches.length === 1 ? { argv: batches[0].argv } : { batches }),
  };
}
function sourceIdentity(root) {
  return {
    sourceCommit: git(root, ['rev-parse', 'HEAD']).trim(),
    sourceTree: git(root, ['rev-parse', 'HEAD^{tree}']).trim(),
    sourceDirty: git(root, ['status', '--porcelain', '--untracked-files=all']).trim() !== '',
  };
}
function reportPaths(root, file) {
  assert.ok(typeof file === 'string' && file && !file.includes('\0'), 'report path required');
  const json = path.resolve(file);
  assert.ok(json.endsWith('.json'), 'source test report must end in .json');
  const prefix = json.slice(0, -'.json'.length),
    files = { json, tap: prefix + '.tap', stderr: prefix + '.stderr' };
  for (const destination of Object.values(files)) {
    const relative = path.relative(root, destination);
    if (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative))
      git(root, ['check-ignore', '--', relative]);
    if (fs.existsSync(destination))
      assert.ok(!fs.lstatSync(destination).isSymbolicLink(), 'symlink source test report');
  }
  return files;
}
function run(root, plan, options = {}) {
  if (!Object.hasOwn(options, 'report')) return executePlan(root, plan, options);
  const files = reportPaths(root, options.report),
    report = {
      schema: 1,
      kind: 'source-tests',
      profile: plan.profile,
      modules: plan.modules,
      cleanSourceRequired: options.requireClean === true,
      status: 'failed',
      pass: false,
      files,
    };
  let result, failure;
  const children = [];
  const writeRaw = () => {
    fs.mkdirSync(path.dirname(files.json), { recursive: true });
    fs.writeFileSync(files.tap, children.map((entry) => entry.child.stdout || '').join(''));
    fs.writeFileSync(files.stderr, children.map((entry) => entry.child.stderr || '').join(''));
  };
  try {
    report.source = sourceIdentity(root);
    result = executePlan(root, plan, {
      ...options,
      execute(argv) {
        const child = (options.execute || ((args) => executeSource(root, args)))(argv);
        report.execution = {
          argv,
          status: child.status,
          signal: child.signal || null,
          error: child.error
            ? { name: child.error.name, message: child.error.message, code: child.error.code }
            : null,
          timeoutMs: executionLimits.timeoutMs,
          maxBufferBytes: executionLimits.maxBufferBytes,
          stdoutBytes: Buffer.byteLength(child.stdout || ''),
          stderrBytes: Buffer.byteLength(child.stderr || ''),
        };
        report.observedAccounting = Object.fromEntries(
          ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'].map((key) => [
            key,
            [...(child.stdout || '').matchAll(new RegExp('^# ' + key + ' (\\d+)\\r?$', 'gm'))].map(
              (match) => Number(match[1])
            ),
          ])
        );
        children.push({
          child,
          execution: report.execution,
          accounting: report.observedAccounting,
        });
        // Persist complete bounded child streams before status/accounting can throw.
        writeRaw();
        return child;
      },
    });
  } catch (error) {
    failure = error;
  }
  try {
    report.sourceAfter = sourceIdentity(root);
    if (!failure)
      assert.deepEqual(report.sourceAfter, report.source, 'source changed during tests');
    if (!children.length) writeRaw();
  } catch (error) {
    failure ||= error;
  }
  if (result) report.result = result;
  if (children.length > 1) {
    report.rawFormat = 'concatenated-native-tap-batches';
    report.executions = children.map((entry) => entry.execution);
    report.observedAccountingByBatch = children.map((entry) => entry.accounting);
    delete report.execution;
    delete report.observedAccounting;
  }
  if (!failure) {
    report.status = result.status;
    report.pass = result.pass;
  } else report.error = { name: failure.name, message: failure.message.slice(0, 8000) };
  try {
    fs.writeFileSync(files.json, JSON.stringify(report, null, 2) + '\n');
  } catch (error) {
    failure = error;
    report.status = 'failed';
    report.pass = false;
    report.reportWriteError = { name: error.name, message: error.message };
  }
  if (failure) {
    failure.report = report;
    throw failure;
  }
  return result;
}
function argumentsFor(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    assert.ok(
      [
        '--profile',
        '--base',
        '--head',
        '--require-clean',
        '--plan',
        '--ci-profile',
        '--report',
      ].includes(flag),
      'unknown source-test argument ' + flag
    );
    const key = flag.slice(2).replace(/-([a-z])/g, (_, x) => x.toUpperCase());
    assert.ok(!Object.hasOwn(options, key), 'duplicate source-test argument ' + flag);
    if (['--require-clean', '--plan', '--ci-profile'].includes(flag)) options[key] = true;
    else {
      assert.ok(argv[i + 1] && !argv[i + 1].startsWith('--'), 'missing argument ' + flag);
      options[key] = argv[++i];
    }
  }
  assert.ok(options.profile || options.ciProfile, '--profile is required');
  if (options.ciProfile)
    assert.ok(
      !options.profile && !options.base && !options.head && !options.plan,
      'CI profile uses only the bound workflow environment'
    );
  assert.ok(!(options.plan && options.report), '--report requires execution, not --plan');
  return options;
}
function verifyContentExecution(plan, record) {
  const executed = record.contentChecks?.sourceTests;
  assert.equal(record.contentChecks?.pass, true, 'content Basic checks were not successful');
  assert.equal(executed?.profile, 'content', 'missing actual content source execution');
  assert.equal(executed.status, 'passed', 'content source execution incomplete');
  assert.equal(executed.pass, true, 'content source execution failed');
  assert.ok(
    Number.isInteger(executed.total) && executed.total > 0,
    'empty content source execution'
  );
  assert.equal(executed.passed, executed.total, 'partial content source execution');
  for (const key of ['failed', 'cancelled', 'skipped', 'todo'])
    assert.equal(executed[key], 0, 'content source execution ' + key);
  assert.deepEqual(executed.modules, plan.modules, 'content source execution inventory differs');
  assert.deepEqual(
    executed.changedPaths,
    plan.changedPaths,
    'content source execution diff differs'
  );
  return { ...executed, executionReusedWithinJob: true };
}
function ciProfile(root, options, environment = process.env) {
  const mode = environment.CONTENT_MODE || 'platform';
  assert.ok(['content', 'platform'].includes(mode), 'unknown CI content mode');
  if (mode === 'content') {
    if (options.requireClean) requireClean(root);
    const plan = select(root, 'content', {
      base: environment.CONTENT_BASE_SHA,
      head: environment.SITE_CANDIDATE_SHA,
    });
    assert.ok(environment.SITE_SOURCE_MANIFEST, 'content source manifest is required');
    const record = JSON.parse(fs.readFileSync(environment.SITE_SOURCE_MANIFEST));
    assert.equal(record.sourceDirty, false);
    assert.equal(record.sourceCommit, environment.SITE_CANDIDATE_SHA);
    assert.equal(record.sourceTree, git(root, ['rev-parse', 'HEAD^{tree}']).trim());
    assert.equal(
      record.contentRelease?.trustedBaseline?.sourceCommit,
      environment.CONTENT_BASE_SHA,
      'content execution baseline differs'
    );
    const result = verifyContentExecution(plan, record);
    if (options.report) {
      const files = reportPaths(root, options.report);
      const report = JSON.parse(fs.readFileSync(files.json));
      assert.equal(report.kind, 'source-tests', 'content source report kind differs');
      assert.equal(report.pass, true, 'content source report did not pass');
      assert.equal(
        report.cleanSourceRequired,
        true,
        'content source report did not bind clean source'
      );
      assert.deepEqual(
        report.source,
        sourceIdentity(root),
        'content source report identity differs'
      );
      assert.deepEqual(report.sourceAfter, report.source, 'content source report changed source');
      assert.deepEqual(report.files, files, 'content source report destinations differ');
      assert.deepEqual(
        report.result,
        record.contentChecks.sourceTests,
        'content source report execution differs'
      );
      assert.equal(report.execution?.status, 0, 'content source process did not pass');
      const tap = fs.readFileSync(files.tap, 'utf8');
      const stderr = fs.readFileSync(files.stderr, 'utf8');
      assert.equal(report.execution.stdoutBytes, Buffer.byteLength(tap));
      assert.equal(report.execution.stderrBytes, Buffer.byteLength(stderr));
      const counts = accounting(tap, { modules: plan.modules, root });
      for (const [key, value] of Object.entries(counts))
        assert.equal(report.result[key], value, 'content source raw accounting differs');
    }
    return result;
  }
  const profile = environment.SITE_SOURCE_EVENT === 'pull_request' ? 'pr' : 'staging';
  const plan = select(root, profile, {
    base: environment.SITE_BASE_SHA,
    head: environment.SITE_CANDIDATE_SHA,
  });
  return run(root, plan, options);
}
function main(argv = process.argv.slice(2)) {
  const root = path.resolve(__dirname, '../..'),
    options = argumentsFor(argv);
  if (options.ciProfile) {
    const result = ciProfile(root, options);
    console.log(JSON.stringify(result));
    return result;
  }
  const plan = select(root, options.profile, options);
  if (options.requireClean && options.plan) requireClean(root);
  const result = options.plan
    ? { ...plan, status: 'planned', pass: null }
    : run(root, plan, options);
  console.log(JSON.stringify(result));
  return result;
}
if (require.main === module) {
  try {
    main();
  } catch (error) {
    if (error.report) console.log(JSON.stringify(error.report));
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = {
  REGISTRY,
  executionLimits,
  safePath,
  matches,
  classifyContent,
  publicationInventoryCompatible,
  riIdentityCompatible,
  actualModules,
  loadRegistry,
  validateRegistry,
  readChangedPaths,
  select,
  accounting,
  run,
  argumentsFor,
  requireClean,
  sourceIdentity,
  reportPaths,
  main,
  ciProfile,
  verifyContentExecution,
};
