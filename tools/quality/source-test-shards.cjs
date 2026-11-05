'use strict';
// Eight exact-source, fail-closed, bounded test receipts replace an impossible
// 81-module single-runner 300s PR campaign. Nothing is skipped or implicitly reused.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const source = require('./source-tests.cjs');
const COUNT = 8;
const COST = Object.freeze({
  'tests/release-rights.test.cjs': 260,
  'tests/release-controller.test.cjs': 196,
  'tests/pages-delivery.test.cjs': 140,
  'tests/pages-migration.test.cjs': 115,
  'tests/publication-records.test.cjs': 115,
  'tests/space.test.cjs': 106,
  'tests/executive.test.cjs': 98,
  'tests/staging.test.cjs': 48,
  'tests/site-engine.test.cjs': 29,
  'tests/publishing.test.cjs': 29,
  'tests/site-articles.test.cjs': 25,
  'tests/article-media.test.cjs': 22,
});
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const fingerprint = (value) => sha(JSON.stringify(value));
function split(modules) {
  assert.ok(Array.isArray(modules), 'source module array required');
  assert.equal(new Set(modules).size, modules.length, 'duplicate module');
  for (const file of modules) {
    source.safePath(file);
    assert.match(file, /^tests\/(?:[^/]+\/)*[^/]+\.test\.cjs$/);
  }
  assert.deepEqual(modules, [...modules].sort(), 'canonical source module order');
  const groups = Array.from({ length: COUNT }, () => []);
  const load = Array(COUNT).fill(0);
  for (const file of [...modules].sort(
    (a, b) => (COST[b] || 12) - (COST[a] || 12) || a.localeCompare(b)
  )) {
    const index = load.indexOf(Math.min(...load));
    groups[index].push(file);
    load[index] += COST[file] || 12;
  }
  return groups.map((files) => files.sort());
}
function exactGroups(modules, groups) {
  assert.equal(groups.length, COUNT, 'all eight source shards required');
  const expected = split(modules);
  for (let i = 0; i < COUNT; i++) assert.deepEqual(groups[i], expected[i], 'shard identity ' + i);
  const flattened = groups.flat();
  assert.equal(new Set(flattened).size, flattened.length, 'duplicated module in shards');
  assert.deepEqual(flattened.sort(), modules, 'incomplete selected source coverage');
  return true;
}
function selected(root, profile, base, head) {
  assert.ok(profile === 'pr' || profile === 'staging', 'unknown source profile');
  assert.match(head || '', /^[a-f0-9]{40}$/);
  const identity = source.sourceIdentity(root);
  assert.equal(identity.sourceCommit, head, 'source checkout differs');
  assert.equal(identity.sourceDirty, false, 'source checkout must be clean');
  if (profile === 'staging') return source.select(root, 'staging');
  assert.match(base || '', /^[a-f0-9]{40}$/);
  const observation = require('./delivery-observation.cjs').selection(root, base, head);
  assert.equal(observation.base.commit, base);
  assert.equal(observation.candidate.commit, head);
  return source.select(root, 'pr', {
    base,
    head,
    repositoryOnly: observation.repositoryOnly,
  });
}
function packet(plan, index, identity, report, tap, stderr) {
  return {
    schema: 1,
    kind: 'source-test-shard',
    index,
    count: COUNT,
    profile: plan.profile,
    source: identity,
    fullModulesSha256: fingerprint(plan.modules),
    modules: split(plan.modules)[index],
    reportSha256: fingerprint(report),
    tapSha256: sha(tap),
    stderrSha256: sha(stderr),
    pass: report.pass === true || (report.status === 'not-applicable' && !report.modules.length),
  };
}
function runOne(root, plan, index, output) {
  assert.ok(Number.isInteger(index) && index >= 0 && index < COUNT);
  const directory = path.resolve(root, output);
  assert.ok(directory.startsWith(path.resolve(root, 'quality-reports') + path.sep));
  fs.mkdirSync(directory, { recursive: true });
  const filename = path.join(directory, 'source-tests.json');
  source.run(
    root,
    { ...plan, modules: split(plan.modules)[index] },
    {
      requireClean: true,
      report: filename,
    }
  );
  const report = JSON.parse(fs.readFileSync(filename));
  const tap = fs.readFileSync(path.join(directory, 'source-tests.tap'), 'utf8');
  const stderr = fs.readFileSync(path.join(directory, 'source-tests.stderr'), 'utf8');
  const result = packet(plan, index, source.sourceIdentity(root), report, tap, stderr);
  assert.equal(result.pass, true, 'only complete shards can be admitted');
  fs.writeFileSync(path.join(directory, 'shard.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}
function verify(root, plan, receipts, identity) {
  assert.equal(receipts.length, COUNT, 'shard receipt count');
  const groups = split(plan.modules);
  let total = 0;
  const admitted = [];
  for (let i = 0; i < COUNT; i++) {
    const receipt = receipts[i];
    assert.ok(receipt, 'missing shard ' + i);
    const { meta, report, tap, stderr } = receipt;
    assert.deepEqual(meta, packet(plan, i, identity, report, tap, stderr));
    assert.equal(meta.pass, true);
    assert.equal(report.kind, 'source-tests');
    assert.equal(report.schema, 1);
    assert.equal(report.profile, plan.profile);
    assert.deepEqual(report.modules, groups[i], 'source report module mismatch');
    assert.deepEqual(report.source, identity, 'source report identity mismatch');
    assert.deepEqual(report.sourceAfter, identity, 'source changed during execution');
    assert.equal(report.cleanSourceRequired, true, 'shard must use clean checkout');
    if (groups[i].length) {
      assert.equal(report.pass, true);
      assert.equal(report.status, 'passed');
      assert.equal(report.execution?.status, 0);
      assert.equal(report.execution?.error, null);
      assert.equal(report.execution?.signal, null);
      assert.equal(report.execution?.timeoutMs, source.executionLimits.timeoutMs);
      assert.equal(report.execution?.stdoutBytes, Buffer.byteLength(tap));
      assert.equal(report.execution?.stderrBytes, Buffer.byteLength(stderr));
      const counts = source.accounting(tap, { modules: groups[i], root });
      for (const [name, value] of Object.entries(counts))
        assert.equal(report.result[name], value, 'native TAP differs from result: ' + name);
      total += counts.total;
    } else {
      assert.equal(report.status, 'not-applicable');
      assert.equal(report.pass, null);
      for (const name of ['total', 'passed'])
        assert.equal(report.result?.[name], 0, 'empty shard result must have zero ' + name);
      for (const name of ['failed', 'cancelled', 'skipped', 'todo'])
        assert.ok(
          report.result[name] === undefined || report.result[name] === 0,
          'empty shard result cannot contain ' + name
        );
      assert.equal(report.execution, undefined);
      assert.equal(tap, '');
      assert.equal(stderr, '', 'empty shard cannot contain process errors');
    }
    admitted.push({
      index: i,
      modules: groups[i],
      tests: report.result?.total || 0,
      receiptSha256: fingerprint(meta),
    });
  }
  exactGroups(
    plan.modules,
    admitted.map((row) => row.modules)
  );
  if (plan.modules.length) {
    assert.ok(total > 0, 'no selected source tests were executed');
  } else {
    assert.equal(plan.profile, 'pr', 'only PR selection can be inapplicable');
  }
  return {
    schema: 1,
    kind: 'source-tests',
    status: plan.modules.length ? 'passed' : 'not-applicable',
    pass: plan.modules.length ? true : null,
    profile: plan.profile,
    mode: 'eight-bounded-shards',
    source: identity,
    modules: plan.modules,
    fullModulesSha256: fingerprint(plan.modules),
    total,
    passed: total,
    failed: 0,
    cancelled: 0,
    skipped: 0,
    todo: 0,
    shards: admitted,
  };
}
function aggregate(root, plan, input, output) {
  const identity = source.sourceIdentity(root);
  assert.equal(identity.sourceDirty, false, 'aggregation source must be clean');
  const runId = process.env.GITHUB_RUN_ID;
  const attempt = process.env.GITHUB_RUN_ATTEMPT;
  assert.match(runId || '', /^[0-9]+$/);
  assert.match(attempt || '', /^[0-9]+$/);
  const prefix = 'site-source-shard-' + runId + '-' + attempt + '-';
  assert.deepEqual(
    fs.readdirSync(input).sort(),
    Array.from({ length: COUNT }, (_, i) => prefix + i).sort(),
    'missing, cross-run or extra source shard'
  );
  const receipts = Array.from({ length: COUNT }, (_, i) => {
    const directory = path.join(input, prefix + i);
    const read = (name) => fs.readFileSync(path.join(directory, name), 'utf8');
    return {
      meta: JSON.parse(read('shard.json')),
      report: JSON.parse(read('source-tests.json')),
      tap: read('source-tests.tap'),
      stderr: read('source-tests.stderr'),
    };
  });
  const result = verify(root, plan, receipts, identity);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  return result;
}
function argumentsFor(args) {
  const mode = args[0];
  assert.ok(mode === 'run' || mode === 'aggregate', 'run or aggregate required');
  const options = { mode };
  for (let i = 1; i < args.length; i += 2) {
    const name = args[i];
    assert.ok(['--profile', '--base', '--head', '--index', '--output', '--input'].includes(name));
    assert.ok(args[i + 1] && !args[i + 1].startsWith('--'), 'missing argument ' + name);
    const key = name.slice(2);
    assert.equal(options[key], undefined, 'duplicate argument');
    options[key] = args[i + 1];
  }
  assert.ok(options.profile && options.head && options.output);
  if (mode === 'run') {
    assert.match(options.index || '', /^[0-7]$/);
    assert.equal(options.input, undefined);
  } else {
    assert.ok(options.input);
    assert.equal(options.index, undefined);
  }
  return options;
}
function main(argv = process.argv.slice(2)) {
  const options = argumentsFor(argv);
  const root = path.resolve(__dirname, '../..');
  const plan = selected(root, options.profile, options.base, options.head);
  const result =
    options.mode === 'run'
      ? runOne(root, plan, Number(options.index), options.output)
      : aggregate(root, plan, options.input, options.output);
  console.log(JSON.stringify({ status: result.status || 'passed', mode: options.mode, result }));
}
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
module.exports = {
  COUNT,
  split,
  exactGroups,
  selected,
  packet,
  runOne,
  verify,
  aggregate,
  argumentsFor,
  main,
};
