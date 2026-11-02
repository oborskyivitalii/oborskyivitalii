'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { commitGeneration, commitFiles } = require('../tools/site/transaction.cjs');

function tree(directory) {
  if (!fs.existsSync(directory)) return null;
  const entries = {};
  function visit(current, prefix) {
    for (const name of fs.readdirSync(current).sort()) {
      const file = path.join(current, name);
      const relative = prefix + name;
      if (fs.statSync(file).isDirectory()) {
        entries[relative + '/'] = null;
        visit(file, relative + '/');
      } else {
        entries[relative] = fs.readFileSync(file).toString('base64');
      }
    }
  }
  visit(directory, '');
  return entries;
}

function generation(options) {
  return {
    output: tree(options.output),
    cache: fs.existsSync(options.cacheFile) ? fs.readFileSync(options.cacheFile) : null,
    lock: fs.existsSync(options.lockFile) ? fs.readFileSync(options.lockFile) : null,
  };
}

function fixture(t, originals = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-transaction-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const options = {
    output: path.join(root, 'docs'),
    temporary: path.join(root, '.site-build-new'),
    cacheFile: path.join(root, '.site-cache/build.json'),
    lockFile: path.join(root, 'site/output-lock.json'),
    cacheBytes: '{"generation":"new","built":["index"]}\n',
    lockBytes: Buffer.from('{"generation":"new","files":{"index.html":"new"}}\n'),
  };
  fs.mkdirSync(path.join(options.temporary, 'nested'), { recursive: true });
  fs.writeFileSync(path.join(options.temporary, 'index.html'), 'new page\n');
  fs.writeFileSync(path.join(options.temporary, 'nested/new.bin'), Buffer.from([0, 255, 7]));
  if (originals) {
    fs.mkdirSync(path.join(options.output, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(options.output, 'index.html'), 'old page\n');
    fs.writeFileSync(path.join(options.output, 'nested/old.bin'), Buffer.from([255, 0, 9]));
    fs.mkdirSync(path.dirname(options.cacheFile), { recursive: true });
    fs.mkdirSync(path.dirname(options.lockFile), { recursive: true });
    fs.writeFileSync(options.cacheFile, '{"generation":"old","reused":["index"]}\n');
    fs.writeFileSync(options.lockFile, '{"generation":"old","files":{"index.html":"old"}}\n');
  }
  return {
    options,
    before: generation(options),
    expected: {
      output: tree(options.temporary),
      cache: Buffer.from(options.cacheBytes),
      lock: options.lockBytes,
    },
  };
}

function injectFailure(predicate) {
  const calls = [];
  const filesystem = { ...fs };
  for (const operation of ['mkdirSync', 'writeFileSync', 'renameSync', 'rmSync']) {
    filesystem[operation] = (...args) => {
      calls.push({ operation, args });
      const failure = predicate(operation, args);
      if (failure) throw failure;
      return fs[operation](...args);
    };
  }
  return { filesystem, calls };
}

function pendingFiles(options) {
  return [options.cacheFile, options.lockFile].flatMap((file) => {
    const parent = path.dirname(file);
    if (!fs.existsSync(parent)) return [];
    return fs.readdirSync(parent).filter((name) => name.includes('.pending-'));
  });
}

function assertNoBackups(options) {
  for (const target of [options.output, options.cacheFile, options.lockFile]) {
    assert.equal(fs.existsSync(target + '.previous'), false, target);
  }
}

test('generation commits directory, cache and mandatory lock only after staging and backing up all originals', (t) => {
  const { options, expected } = fixture(t);
  const { filesystem, calls } = injectFailure(() => null);
  commitGeneration(options, filesystem);
  assert.deepEqual(generation(options), expected);
  assertNoBackups(options);
  assert.deepEqual(pendingFiles(options), []);
  assert.equal(fs.existsSync(options.temporary), false);
  const writes = calls.filter((call) => call.operation === 'writeFileSync');
  assert.equal(writes.length, 2);
  for (const [index, file] of [options.cacheFile, options.lockFile].entries()) {
    assert.equal(path.dirname(writes[index].args[0]), path.dirname(file));
    assert.equal(writes[index].args[2].flag, 'wx');
  }
  const renames = calls.filter((call) => call.operation === 'renameSync');
  const targets = [options.output, options.cacheFile, options.lockFile];
  assert.deepEqual(
    renames.slice(0, 3).map((call) => call.args),
    targets.map((file) => [file, file + '.previous'])
  );
  assert.deepEqual(
    renames.slice(3).map((call) => call.args[1]),
    targets
  );
  assert.ok(calls.indexOf(writes[1]) < calls.indexOf(renames[0]));
  const firstBackupDeletion = calls.findIndex(
    (call) => call.operation === 'rmSync' && call.args[0].endsWith('.previous')
  );
  assert.ok(firstBackupDeletion > calls.indexOf(renames[5]));
});

for (const field of ['cacheFile', 'lockFile']) {
  test(
    field + ' staging write failure leaves every original byte intact and removes partial metadata',
    (t) => {
      const { options, before } = fixture(t);
      const problem = Error('partial ' + field + ' staging failure');
      const { filesystem, calls } = injectFailure((operation, args) => {
        if (operation !== 'writeFileSync' || path.dirname(args[0]) !== path.dirname(options[field]))
          return null;
        fs.writeFileSync(...args);
        return problem;
      });
      assert.throws(
        () => commitGeneration(options, filesystem),
        (error) => error === problem
      );
      assert.deepEqual(generation(options), before);
      assert.deepEqual(pendingFiles(options), []);
      assertNoBackups(options);
      assert.equal(
        calls.some((call) => call.operation === 'renameSync'),
        false
      );
      assert.ok(fs.existsSync(options.temporary));
    }
  );
}

for (const field of ['output', 'cacheFile', 'lockFile']) {
  test(field + ' backup failure restores every original already moved', (t) => {
    const { options, before } = fixture(t);
    const problem = Error(field + ' backup failure');
    const { filesystem } = injectFailure((operation, args) =>
      operation === 'renameSync' &&
      args[0] === options[field] &&
      args[1] === options[field] + '.previous'
        ? problem
        : null
    );
    assert.throws(
      () => commitGeneration(options, filesystem),
      (error) => error === problem
    );
    assert.deepEqual(generation(options), before);
    assertNoBackups(options);
    assert.deepEqual(pendingFiles(options), []);
  });

  test(
    field + ' installation failure rolls directory, cache and lock back to one old generation',
    (t) => {
      const { options, before, expected } = fixture(t);
      const problem = Error(field + ' install failure');
      let failed = false;
      const { filesystem } = injectFailure((operation, args) => {
        if (operation === 'renameSync' && args[1] === options[field] && !failed) {
          failed = true;
          return problem;
        }
        return null;
      });
      assert.throws(
        () => commitGeneration(options, filesystem),
        (error) => error === problem
      );
      assert.deepEqual(generation(options), before);
      assert.deepEqual(tree(options.temporary), expected.output);
      assertNoBackups(options);
      assert.deepEqual(pendingFiles(options), []);
    }
  );
}

test('initial generation creates both mandatory metadata parents and leaves no backups', (t) => {
  const { options, expected } = fixture(t, false);
  commitGeneration(options);
  assert.deepEqual(generation(options), expected);
  assertNoBackups(options);
  assert.deepEqual(pendingFiles(options), []);
});

test('failed initial generation removes replacements instead of inventing old targets', (t) => {
  const { options, before, expected } = fixture(t, false);
  const problem = Error('initial lock install failure');
  const { filesystem } = injectFailure((operation, args) =>
    operation === 'renameSync' && args[1] === options.lockFile ? problem : null
  );
  assert.throws(
    () => commitGeneration(options, filesystem),
    (error) => error === problem
  );
  assert.deepEqual(generation(options), before);
  assert.deepEqual(tree(options.temporary), expected.output);
  assertNoBackups(options);
  assert.deepEqual(pendingFiles(options), []);
});

test('rollback restore failure reports every error, preserves unrecovered old bytes and restores remaining targets', (t) => {
  const { options, before } = fixture(t);
  const installProblem = Error('lock installation failed');
  const restoreProblem = Error('cache restoration failed');
  const { filesystem } = injectFailure((operation, args) => {
    if (operation !== 'renameSync') return null;
    if (args[1] === options.lockFile && args[0] !== options.lockFile + '.previous')
      return installProblem;
    if (args[0] === options.cacheFile + '.previous') return restoreProblem;
    return null;
  });
  assert.throws(
    () => commitGeneration(options, filesystem),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.equal(error.cause, installProblem);
      assert.match(error.message, /rollback is incomplete/);
      assert.ok(error.message.includes(options.cacheFile + '.previous'));
      assert.deepEqual(error.retainedBackups, [options.cacheFile + '.previous']);
      assert.equal(error.errors[0], installProblem);
      assert.equal(error.errors[1].cause, restoreProblem);
      return true;
    }
  );
  assert.deepEqual(tree(options.output), before.output);
  assert.deepEqual(fs.readFileSync(options.lockFile), before.lock);
  assert.deepEqual(fs.readFileSync(options.cacheFile + '.previous'), before.cache);
  assert.equal(fs.existsSync(options.cacheFile), false);
  assert.deepEqual(pendingFiles(options), []);
});

test('rollback withdrawal failures retain all affected backups and never stop restoring independent targets', (t) => {
  const { options, before, expected } = fixture(t);
  const installProblem = Error('lock installation failed');
  const { filesystem } = injectFailure((operation, args) => {
    if (operation !== 'renameSync') return null;
    if (args[1] === options.lockFile && args[0] !== options.lockFile + '.previous')
      return installProblem;
    if (args[0] === options.output || args[0] === options.cacheFile) {
      if (!args[1].endsWith('.previous')) return Error('replacement withdrawal failed');
    }
    return null;
  });
  assert.throws(
    () => commitGeneration(options, filesystem),
    (error) => {
      assert.match(error.message, /rollback is incomplete/);
      assert.deepEqual(error.retainedBackups, [
        options.output + '.previous',
        options.cacheFile + '.previous',
      ]);
      assert.equal(error.errors.length, 3);
      for (const backup of error.retainedBackups) assert.ok(error.message.includes(backup));
      return true;
    }
  );
  assert.deepEqual(tree(options.output + '.previous'), before.output);
  assert.deepEqual(fs.readFileSync(options.cacheFile + '.previous'), before.cache);
  assert.deepEqual(tree(options.output), expected.output);
  assert.deepEqual(fs.readFileSync(options.cacheFile), expected.cache);
  assert.deepEqual(fs.readFileSync(options.lockFile), before.lock);
  assert.equal(fs.existsSync(options.lockFile + '.previous'), false);
});

for (const field of ['output', 'cacheFile', 'lockFile']) {
  test('unresolved ' + field + ' backup blocks all writes and retains recovery bytes', (t) => {
    const { options, before } = fixture(t);
    const backup = options[field] + '.previous';
    fs.writeFileSync(backup, 'unresolved old bytes\n');
    const { filesystem, calls } = injectFailure(() => null);
    assert.throws(() => commitGeneration(options, filesystem), /Unresolved previous generation/);
    assert.deepEqual(generation(options), before);
    assert.equal(fs.readFileSync(backup, 'utf8'), 'unresolved old bytes\n');
    assert.deepEqual(calls, []);
  });
}

test('cleanup failure is explicit after commit and leaves the previous generation backup recoverable', (t) => {
  const { options, before, expected } = fixture(t);
  const problem = Error('backup deletion failed');
  const { filesystem } = injectFailure((operation, args) =>
    operation === 'rmSync' && args[0] === options.output + '.previous' ? problem : null
  );
  assert.throws(
    () => commitGeneration(options, filesystem),
    (error) => {
      assert.match(error.message, /Generation committed, but cleanup failed/);
      assert.deepEqual(error.retainedBackups, [options.output + '.previous']);
      assert.equal(error.errors[0].cause, problem);
      return true;
    }
  );
  assert.deepEqual(generation(options), expected);
  assert.deepEqual(tree(options.output + '.previous'), before.output);
});

test('missing lock path and overlapping cache paths fail before mutating the generation', (t) => {
  const { options, before } = fixture(t);
  assert.throws(() => commitGeneration({ ...options, lockFile: undefined }), /lockFile paths/);
  assert.throws(
    () =>
      commitGeneration({
        ...options,
        cacheFile: path.join(options.output, 'cache.json'),
      }),
    /must be disjoint/
  );
  assert.deepEqual(generation(options), before);
  assertNoBackups(options);
});

test('document and manifest installation is one file transaction, including metadata failure rollback', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'review-pair-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const targets = [
    path.join(directory, 'article.html'),
    path.join(directory, 'article.html.manifest.json'),
  ];
  for (const target of targets) fs.writeFileSync(target, 'old:' + path.basename(target));
  const before = targets.map((target) => fs.readFileSync(target));
  const entries = targets.map((target) => ({ target, bytes: 'new:' + path.basename(target) }));
  const fault = injectFailure((operation, args) =>
    operation === 'renameSync' && args[0].includes('.pending-') && args[1] === targets[1]
      ? Error('Manifest install failed')
      : null
  );
  assert.throws(() => commitFiles(entries, fault.filesystem), /Manifest install failed/);
  for (const [index, target] of targets.entries())
    assert.deepEqual(fs.readFileSync(target), before[index]);
  assert.ok(!fs.readdirSync(directory).some((name) => /pending|previous/.test(name)));
  commitFiles(entries);
  for (const entry of entries) assert.equal(fs.readFileSync(entry.target, 'utf8'), entry.bytes);
});

test('document pair rollback reports retained old bytes when manifest recovery fails', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'review-pair-recovery-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const output = path.join(directory, 'article.html');
  const manifest = output + '.manifest.json';
  for (const target of [output, manifest]) fs.writeFileSync(target, 'old pair');
  const fault = injectFailure((operation, args) => {
    if (operation !== 'renameSync') return null;
    if (args[0].includes('.pending-') && args[1] === manifest)
      return Error('Manifest install failed');
    if (args[0] === manifest + '.previous') return Error('Manifest restore failed');
    return null;
  });
  assert.throws(
    () =>
      commitFiles(
        [
          { target: output, bytes: 'new article' },
          { target: manifest, bytes: 'new manifest' },
        ],
        fault.filesystem
      ),
    (error) => {
      assert.match(error.message, /rollback is incomplete/);
      assert.deepEqual(error.retainedBackups, [manifest + '.previous']);
      return true;
    }
  );
  assert.equal(fs.readFileSync(output, 'utf8'), 'old pair');
  assert.equal(fs.readFileSync(manifest + '.previous', 'utf8'), 'old pair');
});
