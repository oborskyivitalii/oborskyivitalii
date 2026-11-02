'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const safety = require('../tools/publishing/safety.cjs');
const { verifySource, verifyCommittedPins } = require('../tools/publishing/provenance.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publishing-safety-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, relative, bytes) {
  const absolute = path.join(root, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, bytes);
  return absolute;
}

function git(root, arguments_) {
  return cp.execFileSync('git', arguments_, { cwd: root, encoding: 'utf8' }).trim();
}

function repository(t) {
  const root = fixture(t);
  git(root, ['init', '-q']);
  git(root, ['config', 'user.name', 'Publication test']);
  git(root, ['config', 'user.email', 'publication-test@example.invalid']);
  write(root, 'article/manuscript.md', '# Source edition\n');
  git(root, ['add', 'article/manuscript.md']);
  git(root, ['commit', '-q', '-m', 'Fixture source']);
  return root;
}

function pins(root, relative) {
  const source = safety.readSource(root, relative);
  return { sha256: source.sha256, commit: git(root, ['rev-parse', 'HEAD']), blob: source.blob };
}

function directories(root) {
  const staging = path.join(root, 'staging');
  const target = path.join(root, 'output');
  write(root, 'staging/new.html', 'new edition\n');
  write(root, 'output/old.html', 'previous edition\n');
  return { staging, target, backup: target + '.previous' };
}

test('source reading returns actual bounded bytes and Git blob identity', (t) => {
  const root = repository(t);
  const source = safety.readSource(root, 'article/manuscript.md');
  assert.equal(source.absolute, path.join(root, 'article/manuscript.md'));
  assert.equal(source.relative, 'article/manuscript.md');
  assert.ok(Buffer.isBuffer(source.bytes));
  assert.equal(source.bytes.toString('utf8'), '# Source edition\n');
  assert.equal(source.sha256, crypto.createHash('sha256').update(source.bytes).digest('hex'));
  assert.equal(source.blob, git(root, ['hash-object', source.absolute]));
  assert.throws(() => safety.readSource(root, source.relative, { maxBytes: 3 }), /byte limit/);
  assert.throws(() => safety.readSource(root, source.relative, { maxBytes: Infinity }), /integer/);
  fs.mkdirSync(path.join(root, 'directory'));
  assert.throws(() => safety.readSource(root, 'directory'), /regular file/);
});

test('source paths reject traversal and alternative path spellings', (t) => {
  const root = fixture(t);
  write(root, 'safe.md', 'safe');
  for (const name of [
    '../safe.md',
    'inside/../../safe.md',
    './safe.md',
    'inside/../safe.md',
    'safe.md/',
    'inside//safe.md',
    '/safe.md',
    'C:\\safe.md',
    'C:safe.md',
    'inside\\safe.md',
    'safe.md\0',
    'safe.md\n',
    '',
  ]) {
    assert.throws(() => safety.readSource(root, name), /relative slash path/, name);
  }
});

test('source paths reject leaf, parent, and root symlinks and hardlinks', (t) => {
  const root = fixture(t);
  const source = write(root, 'real/source.md', 'protected source');
  fs.symlinkSync(source, path.join(root, 'leaf.md'));
  fs.symlinkSync(path.join(root, 'real'), path.join(root, 'parent'));
  fs.symlinkSync(path.join(root, 'real'), path.join(root, 'root-link'));
  assert.throws(() => safety.readSource(root, 'leaf.md'), /symbolic-link/);
  assert.throws(() => safety.readSource(root, 'parent/source.md'), /symbolic-link/);
  assert.throws(
    () => safety.readSource(path.join(root, 'root-link'), 'source.md'),
    /real directory/
  );
  fs.linkSync(source, path.join(root, 'hardlink.md'));
  assert.throws(() => safety.readSource(root, 'hardlink.md'), /hardlink/);
  assert.throws(() => safety.readSource(root, 'real/source.md'), /hardlink/);
  assert.equal(fs.readFileSync(source, 'utf8'), 'protected source');
});

test('output validation rejects escapes, source overlap and link aliases', async (t) => {
  const root = fixture(t);
  const source = write(root, 'source/manuscript.md', 'protected source');
  const outside = path.join(root, 'outside');
  fs.mkdirSync(outside);
  fs.mkdirSync(path.join(root, 'dist'));
  fs.symlinkSync(outside, path.join(root, 'dist/alias'));
  await assert.rejects(safety.assertOutput(root, '../outside', '../outside/out'), /trusted root/);
  await assert.rejects(safety.assertOutput(root, 'dist', 'elsewhere/out'), /allowed root/);
  await assert.rejects(safety.assertOutput(root, 'dist', 'dist/alias/out'), /symbolic-link/);
  await assert.rejects(
    safety.assertOutput(root, 'source', 'source/manuscript.md', [source]),
    /protected source/
  );
  await assert.rejects(
    safety.assertOutput(root, 'source', 'source/nested', [path.join(root, 'source')]),
    /protected source/
  );
  fs.linkSync(source, path.join(root, 'dist/alias.md'));
  await assert.rejects(safety.assertOutput(root, 'dist', 'dist/alias.md', [source]), /aliases/);
  await assert.rejects(safety.assertOutput(root, 'dist', 'dist/alias.md'), /hardlink/);
  const checked = await safety.assertOutput(root, 'dist', 'dist/new/article', [source]);
  assert.equal(checked.target, path.join(root, 'dist/new/article'));
  assert.ok(fs.statSync(path.join(root, 'dist/new')).isDirectory());
  assert.equal(fs.readFileSync(source, 'utf8'), 'protected source');
});

test('directory installation retains its backup until byte and caller verification succeed', async (t) => {
  const root = fixture(t);
  const { staging, target, backup } = directories(root);
  fs.mkdirSync(path.join(staging, 'empty'));
  const installed = await safety.installDirectory(staging, target, {
    verifyImpl: async (output) => {
      assert.equal(output, target);
      assert.equal(fs.readFileSync(path.join(backup, 'old.html'), 'utf8'), 'previous edition\n');
      assert.equal(fs.readFileSync(path.join(output, 'new.html'), 'utf8'), 'new edition\n');
    },
  });
  assert.equal(installed.target, target);
  assert.ok(fs.statSync(path.join(target, 'empty')).isDirectory());
  assert.equal(fs.existsSync(backup), false);
  assert.equal(fs.existsSync(staging), false);
  assert.equal(fs.existsSync(path.join(target, 'old.html')), false);
});

test('failed final rename restores the exact prior generation without deleting staging', async (t) => {
  const root = fixture(t);
  const { staging, target, backup } = directories(root);
  await assert.rejects(
    safety.installDirectory(staging, target, {
      renameImpl: async (from, to) => {
        if (from === staging && to === target) {
          throw new Error('injected install failure');
        }
        await fsp.rename(from, to);
      },
    }),
    /previous output restored.*injected install failure/
  );
  assert.equal(fs.readFileSync(path.join(target, 'old.html'), 'utf8'), 'previous edition\n');
  assert.equal(fs.readFileSync(path.join(staging, 'new.html'), 'utf8'), 'new edition\n');
  assert.equal(fs.existsSync(backup), false);
});

test('verification failure restores old output and preserves the rejected generation', async (t) => {
  const root = fixture(t);
  const { staging, target, backup } = directories(root);
  await assert.rejects(
    safety.installDirectory(staging, target, {
      verifyImpl: async (output) => write(output, 'injected.html', 'unexpected bytes'),
    }),
    /inventory verification/
  );
  assert.equal(fs.readFileSync(path.join(target, 'old.html'), 'utf8'), 'previous edition\n');
  assert.equal(fs.readFileSync(path.join(staging, 'injected.html'), 'utf8'), 'unexpected bytes');
  assert.equal(fs.existsSync(backup), false);
});

test('failed first installation restores staging and leaves no unverified output', async (t) => {
  const root = fixture(t);
  const staging = path.join(root, 'staging');
  const target = path.join(root, 'output');
  write(root, 'staging/new.html', 'new edition');
  await assert.rejects(
    safety.installDirectory(staging, target, {
      verifyImpl: async () => {
        throw new Error('post-install check failed');
      },
    }),
    /post-install check failed/
  );
  assert.equal(fs.existsSync(target), false);
  assert.equal(fs.readFileSync(path.join(staging, 'new.html'), 'utf8'), 'new edition');
});

test('rollback rename failure reports recovery paths and retains old and staged bytes', async (t) => {
  const root = fixture(t);
  const { staging, target, backup } = directories(root);
  await assert.rejects(
    safety.installDirectory(staging, target, {
      renameImpl: async (from, to) => {
        if (from === staging || from === backup) {
          throw new Error(
            from === backup ? 'injected rollback failure' : 'injected install failure'
          );
        }
        await fsp.rename(from, to);
      },
    }),
    (error) => {
      assert.equal(error.code, 'PUBLISHING_RECOVERY_REQUIRED');
      assert.deepEqual(error.recoveryPaths, { staging, target, backup });
      assert.match(error.message, /rollback failed.*injected rollback failure/);
      assert.ok(error.message.includes(backup));
      return true;
    }
  );
  assert.equal(fs.readFileSync(path.join(backup, 'old.html'), 'utf8'), 'previous edition\n');
  assert.equal(fs.readFileSync(path.join(staging, 'new.html'), 'utf8'), 'new edition\n');
  assert.equal(fs.existsSync(target), false);
});

test('failure moving rejected output aside preserves both output and its backup', async (t) => {
  const root = fixture(t);
  const { staging, target, backup } = directories(root);
  await assert.rejects(
    safety.installDirectory(staging, target, {
      renameImpl: async (from, to) => {
        if (from === target && to === staging) {
          throw new Error('cannot move rejected output');
        }
        await fsp.rename(from, to);
      },
      verifyImpl: async () => {
        throw new Error('review check failed');
      },
    }),
    (error) =>
      error.code === 'PUBLISHING_RECOVERY_REQUIRED' && error.recoveryPaths.backup === backup
  );
  assert.equal(fs.readFileSync(path.join(backup, 'old.html'), 'utf8'), 'previous edition\n');
  assert.equal(fs.readFileSync(path.join(target, 'new.html'), 'utf8'), 'new edition\n');
});

test('unresolved backups and unsafe generation entries reject before replacing output', async (t) => {
  const root = fixture(t);
  const { staging, target, backup } = directories(root);
  write(root, 'output.previous/recovery.html', 'saved recovery');
  await assert.rejects(safety.installDirectory(staging, target), /Unresolved previous generation/);
  assert.equal(fs.readFileSync(path.join(backup, 'recovery.html'), 'utf8'), 'saved recovery');
  fs.rmSync(backup, { recursive: true });
  fs.symlinkSync(path.join(target, 'old.html'), path.join(staging, 'alias.html'));
  await assert.rejects(safety.installDirectory(staging, target), /symbolic link/);
  fs.rmSync(path.join(staging, 'alias.html'));
  fs.linkSync(path.join(target, 'old.html'), path.join(staging, 'alias.html'));
  await assert.rejects(safety.installDirectory(staging, target), /regular independent file/);
  assert.equal(fs.readFileSync(path.join(target, 'old.html'), 'utf8'), 'previous edition\n');
});

test('uncommitted review provenance keeps both Git pins null and verifies its SHA256', (t) => {
  const root = fixture(t);
  write(root, 'manuscript.md', 'review candidate');
  const sha256 = safety.readSource(root, 'manuscript.md').sha256;
  const review = verifySource(root, 'manuscript.md', { sha256, commit: null, blob: null });
  assert.deepEqual(review, {
    path: 'manuscript.md',
    sha256,
    commit: null,
    blob: null,
    state: 'working-tree-review',
  });
  assert.throws(
    () =>
      verifySource(root, 'manuscript.md', {
        sha256: '0'.repeat(64),
        commit: null,
        blob: null,
      }),
    /SHA256 pin/
  );
  assert.throws(
    () =>
      verifySource(root, 'manuscript.md', {
        sha256,
        commit: 'a'.repeat(40),
        blob: null,
      }),
    /both be null/
  );
  assert.throws(() => verifySource(root, 'manuscript.md', { sha256 }), /both be null/);
});

test('frozen provenance compares the exact commit, tree blob and committed content', (t) => {
  const root = repository(t);
  const relative = 'article/manuscript.md';
  const declaration = pins(root, relative);
  assert.deepEqual(verifySource(root, relative, declaration), {
    path: relative,
    ...declaration,
    state: 'committed',
  });
  assert.throws(
    () => verifySource(root, relative, { ...declaration, commit: 'f'.repeat(40) }),
    /Git provenance check failed/
  );
  assert.throws(
    () => verifySource(root, relative, { ...declaration, blob: 'a'.repeat(40) }),
    /blob does not match/
  );
  assert.throws(
    () => verifySource(root, relative, { ...declaration, commit: 'HEAD' }),
    /full 40-character/
  );
  write(root, 'untracked.md', 'untracked candidate');
  const untracked = safety.readSource(root, 'untracked.md');
  assert.throws(
    () =>
      verifySource(
        root,
        'untracked.md',
        {
          sha256: untracked.sha256,
          commit: declaration.commit,
          blob: untracked.blob,
        },
        { allowDirtyPreview: true }
      ),
    /not present at the declared commit/
  );
});

test('dirty previews require an explicit flag and never bypass a declared SHA256 or blob pin', (t) => {
  const root = repository(t);
  const relative = 'article/manuscript.md';
  const declaration = pins(root, relative);
  write(root, relative, '# Modified review edition\n');
  const changed = safety.readSource(root, relative);
  assert.throws(
    () => verifySource(root, relative, declaration, { allowDirtyPreview: true }),
    /SHA256 pin/
  );
  const previewPins = { ...declaration, sha256: changed.sha256 };
  assert.throws(() => verifySource(root, relative, previewPins), /frozen edition requires/);
  assert.deepEqual(verifySource(root, relative, previewPins, { allowDirtyPreview: true }), {
    path: relative,
    sha256: changed.sha256,
    commit: declaration.commit,
    blob: changed.blob,
    state: 'dirty-preview',
  });
  assert.throws(
    () =>
      verifySource(
        root,
        relative,
        { ...previewPins, blob: changed.blob },
        {
          allowDirtyPreview: true,
        }
      ),
    /blob does not match/
  );
});

test('committed symlinks cannot establish frozen regular-file provenance', (t) => {
  const root = repository(t);
  write(root, 'real.md', 'regular working bytes');
  fs.symlinkSync('real.md', path.join(root, 'link.md'));
  git(root, ['add', 'real.md', 'link.md']);
  git(root, ['commit', '-q', '-m', 'Fixture symbolic link']);
  const commit = git(root, ['rev-parse', 'HEAD']);
  const blob = git(root, ['rev-parse', commit + ':link.md']);
  fs.rmSync(path.join(root, 'link.md'));
  write(root, 'link.md', 'regular working bytes');
  const sha256 = safety.readSource(root, 'link.md').sha256;
  assert.throws(
    () =>
      verifySource(
        root,
        'link.md',
        { sha256, commit, blob },
        {
          allowDirtyPreview: true,
        }
      ),
    /Committed source must be a regular file/
  );
});

test('Git replacement refs cannot substitute another tree for a pinned source commit', (t) => {
  const root = repository(t);
  const relative = 'article/manuscript.md';
  const original = pins(root, relative);
  write(root, relative, '# Replacement edition\n');
  git(root, ['add', relative]);
  git(root, ['commit', '-q', '-m', 'Replacement tree']);
  const replacement = pins(root, relative);
  git(root, ['replace', original.commit, replacement.commit]);
  assert.throws(
    () =>
      verifySource(root, relative, {
        ...replacement,
        commit: original.commit,
      }),
    /blob does not match/
  );
  write(root, relative, '# Source edition\n');
  assert.equal(verifySource(root, relative, original).state, 'committed');
});

test('committed source filenames are looked up literally rather than as Git pathspec syntax', (t) => {
  const root = repository(t);
  const relative = ':(literal)manuscript.md';
  write(root, relative, 'literal path source');
  git(root, ['--literal-pathspecs', 'add', '--', relative]);
  git(root, ['commit', '-q', '-m', 'Literal source path']);
  const declaration = pins(root, relative);
  assert.equal(verifySource(root, relative, declaration).state, 'committed');
});

test('historical committed pins remain valid after working source changes or removal', (t) => {
  const root = repository(t);
  const relative = 'article/manuscript.md';
  const declaration = pins(root, relative);
  write(root, relative, '# New substantive edition\n');
  const working = safety.readSource(root, relative);
  assert.deepEqual(verifyCommittedPins(root, relative, declaration), {
    path: relative,
    ...declaration,
    state: 'committed',
  });
  assert.throws(
    () => verifyCommittedPins(root, relative, { ...declaration, sha256: working.sha256 }),
    /Committed source bytes.*SHA256 pin/
  );
  assert.throws(
    () => verifyCommittedPins(root, relative, { ...declaration, blob: working.blob }),
    /blob does not match/
  );
  assert.throws(
    () => verifyCommittedPins(root, relative, { ...declaration, commit: null, blob: null }),
    /nonnull Git/
  );
  fs.rmSync(path.join(root, relative));
  assert.equal(verifyCommittedPins(root, relative, declaration).state, 'committed');
  assert.throws(
    () => verifyCommittedPins(root, '../article/manuscript.md', declaration),
    /relative slash path/
  );
});
