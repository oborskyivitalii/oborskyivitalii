'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const observer = require('../tools/quality/delivery-observation.cjs');
const collector = require('../tools/quality/delivery-git.cjs');
const json = require('../tools/quality/delivery-json.cjs');
const root = path.resolve(__dirname, '..');
const executable = path.join(root, 'tools/quality/delivery-observation.cjs');
function git(directory, ...args) {
  return cp
    .execFileSync('git', args, {
      cwd: directory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    .trim();
}
function write(directory, file, bytes = 'fixture\n') {
  fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
  fs.writeFileSync(path.join(directory, file), bytes);
}
function commit(directory) {
  git(directory, 'add', '-A');
  git(directory, 'commit', '-qm', 'Fixture; Refs #122');
  return git(directory, 'rev-parse', 'HEAD');
}
function fixture(t, before, after) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'delivery-observer-test-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const directory = path.join(temporary, 'repo');
  fs.mkdirSync(directory);
  git(directory, 'init', '-q');
  git(directory, 'config', 'user.name', 'Fixture');
  git(directory, 'config', 'user.email', 'fixture@example.invalid');
  git(directory, 'config', 'core.autocrlf', 'false');
  for (const file of observer.policyFiles)
    write(directory, file, fs.readFileSync(path.join(root, file)));
  before?.(directory);
  const base = commit(directory);
  after?.(directory);
  const head = git(directory, 'status', '--porcelain') ? commit(directory) : base;
  function run(extra = {}, environment = {}) {
    const output = path.join(temporary, 'output-' + fs.readdirSync(temporary).length);
    const options = { repo: directory, base, head, policy: head, out: output, ...extra };
    const args = Object.entries(options).flatMap(([key, value]) => ['--' + key, value]);
    const processResult = cp.spawnSync(process.execPath, [executable, ...args], {
      cwd: root,
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 4 * 1024 * 1024,
      env: { ...process.env, GITHUB_ACTIONS: 'false', ...environment },
    });
    const file = path.join(output, 'observation.json');
    assert.ok(fs.existsSync(file), processResult.stderr || processResult.error?.message);
    const report = JSON.parse(fs.readFileSync(file));
    assert.equal(
      processResult.status,
      report.analysis.status === 'invalid' ? 1 : 0,
      JSON.stringify(report.changes.errors)
    );
    invariants(report);
    return report;
  }
  return { directory, temporary, base, head, run };
}
function invariants(report) {
  assert.deepEqual(report.authority, { merge: false, deploy: false, reuseEvidence: false });
  assert.equal(report.acceptedSite, null);
  assert.equal(report.history, null);
  assert.equal(report.base.authority, 'local-input');
  assert.equal(report.base.protection, null);
  assert.equal(report.producer.context, 'local');
  const ids = new Set(report.obligations.map((row) => row.id));
  assert.equal(ids.size, report.obligations.length);
  for (const id of [
    'B',
    'R',
    'R-PYTHON',
    'O',
    'H',
    'H-PREVIEW',
    'ADMISSION',
    'REQUIREMENTS',
    'REVIEW',
    'WHITEBOX',
    'EXPLORATORY',
  ])
    assert.ok(ids.has(id), id);
  assert.deepEqual(new Set(report.nextAction.blockingObligations), ids);
  for (const row of report.obligations) {
    assert.equal(row.state, 'planned');
    assert.equal(row.evidence, null);
    if (row.execution.command) {
      assert.ok(Array.isArray(row.execution.command.argv) && row.execution.command.argv.length);
      assert.ok(row.execution.command.argv.every((value) => typeof value === 'string' && value));
      json.safePath(row.owner);
    }
    for (const reasonId of row.triggerReasonIds)
      assert.ok(
        report.analysis.reasons.find(
          (reason) => reason.id === reasonId && reason.obligationIds.includes(row.id)
        )
      );
  }
  for (const reason of report.analysis.reasons)
    for (const id of reason.obligationIds)
      assert.ok(
        report.obligations.find((row) => row.id === id && row.triggerReasonIds.includes(reason.id))
      );
}
const cases = [
  ['AGENTS.md', 'repository', false, 'D01'],
  ['review/REVIEW-TEMPLATE.md', 'repository', false, 'D01'],
  ['tools/repository_intelligence.py', 'repository', false, 'D03'],
  ['.github/repository-intelligence-config.json', 'repository', false, 'D02'],
  ['site/content/pages/writing/main.json', 'content', false, 'D04'],
  ['site/templates/pages/writing/main.html', 'website', false, 'D05'],
  ['LICENSE-CODE.md', 'website', false, 'D06'],
  ['guides/SITE-SOURCE-AUDIT.md', 'website', false, 'D07'],
  ['site/retained/manifest.json', 'website', false, 'D08'],
  ['tools/staging/admission.cjs', 'website', true, 'D09'],
  ['tools/site/edition.cjs', 'website', true, 'D09'],
  ['tools/quality/common.cjs', 'website', true, 'D09'],
  ['tools/quality/artifact.cjs', 'website', true, 'D09'],
  ['review/REVIEW-TEMPLATE-nearby.txt', 'website', null, 'D10'],
];
for (const [file, lane, control, rule] of cases)
  test('real Git owner: ' + file, (t) => {
    const f = fixture(t, null, (directory) => write(directory, file, 'new fixture\n'));
    const report = f.run();
    assert.equal(report.analysis.proposedLane, lane);
    assert.equal(report.analysis.control, control);
    assert.ok(
      report.analysis.reasons.some((reason) => reason.path === file && reason.ruleId === rule)
    );
    assert.equal(report.nextAction.action, rule === 'D10' ? 'inspect-owner' : 'run-current-checks');
  });
test('mixed content/template and repository/content union has independent reasons', (t) => {
  const f = fixture(t, null, (directory) => {
    write(directory, '.github/repository-intelligence-config.json', '{}\n');
    write(directory, 'site/content/pages/writing/main.json', '{}\n');
  });
  const report = f.run();
  assert.equal(report.analysis.proposedLane, 'content');
  assert.deepEqual(report.analysis.impacts, ['content', 'repository']);
  write(f.directory, 'site/templates/pages/writing/main.html');
  const head = commit(f.directory);
  const mixed = f.run({ head, policy: head });
  assert.equal(mixed.analysis.proposedLane, 'website');
  assert.deepEqual(mixed.analysis.impacts, ['content', 'repository', 'website']);
});
test('runtime move and control deletion retain base-side owner and tests regardless of rename settings', (t) => {
  const f = fixture(
    t,
    (directory) => {
      write(directory, 'site/engine/scroll-entry.cjs');
      write(directory, 'tools/staging/admission.cjs');
    },
    (directory) => {
      fs.mkdirSync(path.join(directory, 'review/issue-122'), { recursive: true });
      fs.renameSync(
        path.join(directory, 'site/engine/scroll-entry.cjs'),
        path.join(directory, 'review/issue-122/moved.md')
      );
      fs.unlinkSync(path.join(directory, 'tools/staging/admission.cjs'));
    }
  );
  for (const setting of ['true', 'false', 'copies']) {
    git(f.directory, 'config', 'diff.renames', setting);
    const report = f.run();
    assert.equal(report.analysis.proposedLane, 'website');
    assert.equal(report.analysis.control, true);
    assert.ok(
      report.changes.records.some(
        (row) => row.status === 'D' && row.oldPath === 'site/engine/scroll-entry.cjs'
      )
    );
    assert.ok(
      report.changes.records.some(
        (row) => row.status === 'A' && row.newPath === 'review/issue-122/moved.md'
      )
    );
    assert.ok(
      report.obligations.some((row) => row.id.startsWith('SOURCE:tests/scroll-entry.test.cjs:'))
    );
    assert.ok(report.analysis.reasons.some((row) => row.side === 'base' && row.ruleId === 'D09'));
  }
});
test('candidate registry removal cannot erase a base-owned obligation', (t) => {
  const f = fixture(
    t,
    (directory) => write(directory, 'site/engine/scroll-entry.cjs'),
    (directory) => {
      write(directory, 'site/engine/scroll-entry.cjs', 'changed\n');
      const file = path.join(directory, 'tools/quality/test-profiles.json');
      const registry = JSON.parse(fs.readFileSync(file));
      registry.tests = registry.tests.filter((row) => row.path !== 'tests/scroll-entry.test.cjs');
      fs.writeFileSync(file, JSON.stringify(registry));
    }
  );
  const report = f.run();
  assert.ok(
    report.obligations.some((row) => row.id.startsWith('SOURCE:tests/scroll-entry.test.cjs:'))
  );
  assert.equal(report.analysis.control, true);
});
test('base-side rights provenance cannot disappear through a candidate manifest edit', (t) => {
  const f = fixture(
    t,
    (directory) => {
      write(directory, 'review/issue-122/provenance.md');
      const file = path.join(directory, 'site/rights.json'),
        rights = JSON.parse(fs.readFileSync(file));
      rights.bases['linked-metadata'].provenance.push('review/issue-122/provenance.md');
      fs.writeFileSync(file, JSON.stringify(rights));
    },
    (directory) => {
      const file = path.join(directory, 'site/rights.json'),
        rights = JSON.parse(fs.readFileSync(file));
      rights.bases['linked-metadata'].provenance = rights.bases[
        'linked-metadata'
      ].provenance.filter((file) => file !== 'review/issue-122/provenance.md');
      fs.writeFileSync(file, JSON.stringify(rights));
      write(directory, 'review/issue-122/provenance.md', 'changed\n');
    }
  );
  const report = f.run();
  assert.ok(
    report.analysis.reasons.some(
      (row) => row.path === 'review/issue-122/provenance.md' && row.ruleId === 'D07'
    )
  );
});
test('mode-only, type, copy and non-ASCII literal paths retain true Git identities', (t) => {
  const f = fixture(
    t,
    (directory) => write(directory, 'AGENTS.md'),
    (directory) => {
      fs.chmodSync(path.join(directory, 'AGENTS.md'), 0o755);
      write(directory, 'review/issue-122/Копія *.md');
      fs.symlinkSync('/no-follow-target', path.join(directory, 'link'));
      const moduleDirectory = path.join(directory, 'module');
      fs.mkdirSync(moduleDirectory);
      git(moduleDirectory, 'init', '-q');
      git(moduleDirectory, 'config', 'user.name', 'Fixture');
      git(moduleDirectory, 'config', 'user.email', 'fixture@example.invalid');
      write(moduleDirectory, 'file');
      commit(moduleDirectory);
    }
  );
  const report = f.run();
  const mode = report.changes.records.find((row) => row.newPath === 'AGENTS.md');
  assert.equal(mode.status, 'M');
  assert.equal(mode.oldMode, '100644');
  assert.equal(mode.newMode, '100755');
  assert.equal(mode.oldObject, mode.newObject);
  assert.equal(report.analysis.status, 'conservative');
  assert.ok(report.analysis.unresolved.some((row) => row.path === 'link'));
  assert.ok(report.analysis.unresolved.some((row) => row.path === 'module'));
  assert.ok(report.changes.records.some((row) => row.newPath === 'review/issue-122/Копія *.md'));
});
test('complete empty diff is distinct from invalid or successful delivery', (t) => {
  const f = fixture(t);
  const report = f.run();
  assert.equal(report.analysis.status, 'no-change');
  assert.equal(report.analysis.proposedLane, null);
  assert.equal(report.changes.collector.complete, true);
  assert.equal(report.changes.records.length, 0);
  assert.equal(report.nextAction.action, 'no-change');
});
test('missing ref, dirty checkout, hidden index and wrong policy never become empty success', (t) => {
  const f = fixture(t, null, (directory) => write(directory, 'AGENTS.md'));
  assert.equal(f.run({ base: '0'.repeat(40) }).analysis.status, 'invalid');
  write(f.directory, 'AGENTS.md', 'dirty\n');
  assert.equal(f.run().analysis.status, 'invalid');
  git(f.directory, 'checkout', '--', 'AGENTS.md');
  git(f.directory, 'update-index', '--assume-unchanged', 'AGENTS.md');
  assert.equal(f.run().analysis.status, 'invalid');
  git(f.directory, 'update-index', '--no-assume-unchanged', 'AGENTS.md');
  write(f.directory, 'tools/quality/delivery-json.cjs', 'wrong implementation\n');
  const head = commit(f.directory);
  assert.equal(f.run({ head, policy: head }).analysis.status, 'invalid');
});
test('unsafe Git path and duplicate policy keys are invalid, not cheap paths', (t) => {
  const f = fixture(t, null, (directory) => write(directory, 'bad\\name.md'));
  assert.equal(f.run().analysis.status, 'invalid');
  fs.unlinkSync(path.join(f.directory, 'bad\\name.md'));
  write(f.directory, 'tools/quality/test-profiles.json', '{"schema_version":1,"schema_version":1}');
  const head = commit(f.directory);
  assert.equal(f.run({ head, policy: head }).analysis.status, 'invalid');
});
test('collector output and independently pinned policy bytes authenticate exactly', (t) => {
  const f = fixture(t, null, (directory) => write(directory, 'AGENTS.md'));
  const report = f.run({ policy: f.base });
  assert.equal(report.policy.revision, f.base);
  const bytes = fs.readFileSync(report.changes.collector.output.location);
  assert.equal(json.digest(bytes), report.changes.collector.output.sha256);
  const captured = JSON.parse(bytes);
  const records = collector.parseRaw(
    Buffer.from(captured.stdout, 'base64'),
    collector.tree(f.directory, f.base),
    collector.tree(f.directory, f.head)
  );
  assert.deepEqual(records, report.changes.records);
  const pairs = report.policy.files.map((row) => {
    const bytes = cp.execFileSync('git', ['show', f.base + ':' + row.path], { cwd: f.directory });
    assert.equal(json.digest(bytes), row.sha256);
    return [row.path, row.sha256];
  });
  assert.deepEqual(
    pairs.map((row) => row[0]),
    pairs.map((row) => row[0]).sort()
  );
  assert.equal(json.digest(json.canonical(pairs)), report.policy.digest);
});
test('raw record negatives detect partial capture, duplicate paths and object/mode tampering', () => {
  const object = '1'.repeat(40),
    entries = new Map([['AGENTS.md', { mode: '100644', object }]]);
  const raw = Buffer.from(':000000 100644 ' + '0'.repeat(40) + ' ' + object + ' A\0AGENTS.md\0');
  assert.equal(collector.parseRaw(raw, new Map(), entries).length, 1);
  assert.throws(() => collector.parseRaw(raw.subarray(0, -1), new Map(), entries), /incomplete/);
  assert.throws(
    () => collector.parseRaw(Buffer.concat([raw, raw]), new Map(), entries),
    /duplicate/
  );
  assert.throws(
    () => collector.parseRaw(raw, new Map(), new Map([['AGENTS.md', { mode: '100755', object }]])),
    /mode/
  );
  assert.throws(
    () =>
      collector.parseRaw(
        raw,
        new Map(),
        new Map([['AGENTS.md', { mode: '100644', object: '2'.repeat(40) }]])
      ),
    /object/
  );
  assert.throws(
    () => collector.parseRaw(Buffer.from([0xff, 0]), new Map(), entries),
    /encoded|encoding/
  );
});
test('JCS handles UTF-16 ordering/escapes and rejects duplicate keys, invalid Unicode and numbers', () => {
  assert.equal(
    json.canonical({ '\u20ac': 1, '\r': 2, '\ufb33': 3, 1: 4, '\ud83d\ude00': 5 }),
    '{"\\r":2,"1":4,"€":1,"😀":5,"דּ":3}'
  );
  assert.equal(json.canonical({ n: -0, a: [1e30, 0.002] }), '{"a":[1e+30,0.002],"n":0}');
  for (const text of ['{"a":1,"\\u0061":2}', '{"n":1e999}', '{"s":"\\ud800"}'])
    assert.throws(() => json.parse(Buffer.from(text)));
  assert.throws(() => json.parse(Buffer.from([0xff])));
});

test('nearby unknown content, RI, quality and keyword rights files remain unresolved', (t) => {
  const paths = [
    'site/content/unknown.cjs',
    '.github/repository-intelligence/unknown.cjs',
    'tools/quality/unknown-note.md',
    'review/issue-122/not-a-rights-policy.json',
  ];
  const f = fixture(t, null, (directory) => paths.forEach((file) => write(directory, file)));
  const report = f.run();
  assert.equal(report.analysis.status, 'conservative');
  assert.equal(report.analysis.proposedLane, 'website');
  assert.equal(report.analysis.control, null);
  for (const file of paths) assert.ok(report.analysis.unresolved.some((row) => row.path === file));
});
test('changed gitlink cannot be suppressed by submodule or relative Git configuration', (t) => {
  const f = fixture(
    t,
    (directory) => {
      const sub = path.join(directory, 'module');
      fs.mkdirSync(sub);
      git(sub, 'init', '-q');
      git(sub, 'config', 'user.name', 'Fixture');
      git(sub, 'config', 'user.email', 'fixture@example.invalid');
      write(sub, 'file');
      commit(sub);
      fs.mkdirSync(path.join(directory, 'nested'));
    },
    (directory) => {
      const sub = path.join(directory, 'module');
      write(sub, 'file', 'changed\n');
      commit(sub);
    }
  );
  git(f.directory, 'config', 'diff.ignoreSubmodules', 'all');
  git(f.directory, 'config', 'diff.relative', 'true');
  const report = f.run({ repo: path.join(f.directory, 'nested') });
  assert.equal(report.analysis.status, 'conservative');
  assert.equal(report.changes.records.length, 1);
  assert.equal(report.changes.records[0].oldMode, '160000');
  assert.notEqual(report.changes.records[0].oldObject, report.changes.records[0].newObject);
  const before = collector.tree(f.directory, f.base),
    after = collector.tree(f.directory, f.head);
  assert.throws(() => collector.parseRaw(Buffer.alloc(0), before, after), /incomplete endpoint/);
});
test('copy with source retained remains one addition independently of similarity settings', (t) => {
  const f = fixture(
    t,
    (directory) => write(directory, 'AGENTS.md'),
    (directory) =>
      write(
        directory,
        'review/issue-122/copy.md',
        fs.readFileSync(path.join(directory, 'AGENTS.md'))
      )
  );
  git(f.directory, 'config', 'diff.renames', 'copies');
  const report = f.run();
  assert.equal(report.changes.records.length, 1);
  assert.equal(report.changes.records[0].status, 'A');
  assert.equal(report.changes.records[0].oldPath, null);
});
test('invalid candidate registry cannot emit unsafe commands or drop valid base requirements', (t) => {
  const f = fixture(
    t,
    (directory) => write(directory, 'site/engine/scroll-entry.cjs'),
    (directory) => {
      write(directory, 'site/engine/scroll-entry.cjs', 'changed\n');
      const file = path.join(directory, 'tools/quality/test-profiles.json');
      const registry = JSON.parse(fs.readFileSync(file));
      registry.tests.push({
        path: '../outside.test.cjs',
        owner: '../outside.cjs',
        language: 'javascript',
        lifecycle: 'permanent',
        profiles: ['pr-targeted'],
        inputs: ['AGENTS.md'],
      });
      fs.writeFileSync(file, JSON.stringify(registry));
    }
  );
  const report = f.run();
  assert.equal(report.analysis.status, 'invalid');
  assert.ok(
    report.obligations.some((row) => row.id.startsWith('SOURCE:tests/scroll-entry.test.cjs:'))
  );
  assert.ok(!report.obligations.some((row) => row.owner.includes('..')));
});
test('PR-selected diagnostic lifecycle uses actual pr execution dimensions', (t) => {
  const f = fixture(t, null, (directory) =>
    write(directory, '.github/workflows/site-cause-probe.yml')
  );
  const report = f.run();
  const existing = require('../tools/quality/source-tests.cjs').select(root, 'pr', {
    changedPaths: ['.github/workflows/site-cause-probe.yml'],
  });
  assert.ok(existing.modules.includes('tests/cause-probe.test.cjs'));
  const rows = report.obligations.filter((row) =>
    row.id.startsWith('SOURCE:tests/cause-probe.test.cjs:')
  );
  assert.ok(rows.length);
  assert.ok(rows.every((row) => row.sourceProfile === existing.profile));
});
test('existing policy gates and all actual navigation commands remain planned', (t) => {
  const f = fixture(t, null, (directory) => write(directory, 'AGENTS.md'));
  const report = f.run(),
    policy = JSON.parse(fs.readFileSync(path.join(root, '.github/acceptance/issue-122.json')));
  for (const row of report.obligations)
    if (row.execution.kind === 'external-gate')
      assert.ok(Object.hasOwn(policy.gates, row.execution.gate), row.execution.gate);
  for (const file of [
    'test_code_style.py',
    'test_ri_ci.py',
    'test_root_layout.py',
    'test_repository_test_selection.py',
    'test_repository_intelligence.py',
  ])
    assert.ok(report.obligations.some((row) => row.execution.command?.argv.includes(file)));
  assert.ok(
    report.obligations.some((row) => row.execution.command?.argv.includes('tools/check_ri_ci.py'))
  );
});
test('existing receipt symlinks and inside-source output are rejected without mutating source', (t) => {
  const f = fixture(t, (directory) => write(directory, 'AGENTS.md'));
  const original = fs.readFileSync(path.join(f.directory, 'AGENTS.md'));
  for (const name of ['collector.json', 'observation.json']) {
    const output = path.join(f.temporary, 'symlink-' + name);
    fs.mkdirSync(output);
    fs.symlinkSync(path.join(f.directory, 'AGENTS.md'), path.join(output, name));
    const result = cp.spawnSync(
      process.execPath,
      [
        executable,
        '--repo',
        f.directory,
        '--base',
        f.base,
        '--head',
        f.head,
        '--policy',
        f.head,
        '--out',
        output,
      ],
      { cwd: root, encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'false' } }
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /EEXIST/);
    assert.deepEqual(fs.readFileSync(path.join(f.directory, 'AGENTS.md')), original);
    assert.equal(git(f.directory, 'status', '--porcelain'), '');
  }
  const output = path.join(f.directory, 'must-not-create');
  const result = cp.spawnSync(
    process.execPath,
    [
      executable,
      '--repo',
      f.directory,
      '--base',
      f.base,
      '--head',
      f.head,
      '--policy',
      f.head,
      '--out',
      output,
    ],
    { encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'false' } }
  );
  assert.equal(result.status, 1);
  assert.ok(!fs.existsSync(output));
});
