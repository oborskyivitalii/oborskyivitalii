'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const { verifyAppendOnlyHistory } = require('../tools/publishing/history.cjs');

const articleId = 'history-profile';
const owner = 'site/publications/' + articleId;

function fixture(t, { git = true, initialCommit = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-history-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  if (git) {
    command(root, ['init', '-q']);
    command(root, ['config', 'user.name', 'Publication history test']);
    command(root, ['config', 'user.email', 'publication-history@example.invalid']);
    if (initialCommit) {
      write(root, 'seed.md', 'initial repository');
      commit(root, 'Initialize fixture');
    }
  }
  return root;
}

function command(root, arguments_) {
  return cp.execFileSync('git', arguments_, { cwd: root, encoding: 'utf8' }).trim();
}

function write(root, relative, bytes) {
  const absolute = path.join(root, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, bytes);
  return absolute;
}

function json(root, relative, value) {
  return write(root, relative, JSON.stringify(value, null, 2) + '\n');
}

function commit(root, message) {
  command(root, ['add', '-A']);
  command(root, ['commit', '-q', '-m', message]);
  return command(root, ['rev-parse', 'HEAD']);
}

function event(root, id = 'first-publication', overrides = {}) {
  const value = {
    schema: 1,
    id,
    articleId,
    kind: 'publication',
    url: 'https://example.com/observed-article',
    ...overrides,
  };
  const relative = owner + '/publication-events/' + id + '.json';
  json(root, relative, value);
  return { value, relative };
}

function edition(root, { frozen = false } = {}) {
  const bytes = '# Frozen manuscript\n';
  write(root, owner + '/manuscript.en.md', bytes);
  const source = {
    path: 'manuscript.en.md',
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    commit: frozen ? command(root, ['rev-parse', 'HEAD']) : null,
    blob: frozen ? command(root, ['hash-object', owner + '/manuscript.en.md']) : null,
  };
  const value = { schema: 1, id: 'first-edition', articleId, source, rights: 'review-pending' };
  const relative = owner + '/editions/first-edition.json';
  json(root, relative, value);
  return { value, relative };
}

test('unversioned and unborn fixtures do not claim verified committed history', (t) => {
  const unversioned = fixture(t, { git: false });
  event(unversioned);
  assert.deepEqual(verifyAppendOnlyHistory(unversioned, articleId), {
    state: 'unversioned-review',
    baseCommit: null,
  });
  assert.throws(
    () =>
      verifyAppendOnlyHistory(unversioned, articleId, {
        baseCommit: 'a'.repeat(40),
      }),
    /available Git repository/
  );
  const unborn = fixture(t, { initialCommit: false });
  assert.equal(verifyAppendOnlyHistory(unborn, articleId).state, 'unversioned-review');
  assert.throws(() => verifyAppendOnlyHistory(unborn, '../escape'), /Invalid article id/);
});

test('new event records append without changing earlier committed bytes', (t) => {
  const root = fixture(t);
  event(root);
  const baseCommit = commit(root, 'Observe first publication');
  event(root, 'second-publication');
  const pending = verifyAppendOnlyHistory(root, articleId, { baseCommit });
  assert.equal(pending.state, 'verified-history');
  assert.equal(pending.eventCount, 1);
  commit(root, 'Append second publication');
  const appended = verifyAppendOnlyHistory(root, articleId, { baseCommit });
  assert.equal(appended.eventCount, 2);
  assert.equal(appended.baseCommit, baseCommit);
});

test('working-tree event rewrites and deletions reject against the original committed event', (t) => {
  const root = fixture(t);
  const first = event(root);
  commit(root, 'Observe publication');
  json(root, first.relative, { ...first.value, url: 'https://example.com/rewritten' });
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /first committed identity/);
  fs.rmSync(path.join(root, first.relative));
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /deleted from the working tree/);
});

test('committed event rewrites remain invalid even when HEAD or an earlier base matches current bytes', (t) => {
  const root = fixture(t);
  const first = event(root);
  const baseCommit = commit(root, 'Observe publication');
  json(root, first.relative, { ...first.value, url: 'https://example.com/rewritten' });
  const rewrittenHead = commit(root, 'Rewrite historical publication');
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /rewritten after commitment/);
  assert.throws(
    () => verifyAppendOnlyHistory(root, articleId, { baseCommit }),
    /rewritten after commitment/
  );
  assert.throws(
    () => verifyAppendOnlyHistory(root, articleId, { baseCommit: rewrittenHead }),
    /rewritten after commitment/
  );
  json(root, first.relative, first.value);
  commit(root, 'Restore historical bytes');
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /rewritten after commitment/);
});

test('committed event deletion and identity renaming cannot erase observed history', (t) => {
  const root = fixture(t);
  const first = event(root);
  commit(root, 'Observe publication');
  fs.rmSync(path.join(root, first.relative));
  commit(root, 'Delete historical publication');
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /deleted after commitment/);
  const renamed = fixture(t);
  const prior = event(renamed);
  commit(renamed, 'Observe publication');
  fs.rmSync(path.join(renamed, prior.relative));
  event(renamed, 'replacement-publication');
  commit(renamed, 'Rename historical identity');
  assert.throws(() => verifyAppendOnlyHistory(renamed, articleId), /deleted after commitment/);
});

test('review editions may evolve until their first committed nonnull source identity', (t) => {
  const root = fixture(t);
  const review = edition(root);
  commit(root, 'Commit review edition');
  review.value.source.sha256 = 'a'.repeat(64);
  json(root, review.relative, review.value);
  commit(root, 'Revise draft edition');
  assert.equal(verifyAppendOnlyHistory(root, articleId).frozenEditionCount, 0);
  const frozen = edition(root, { frozen: true });
  commit(root, 'Freeze edition');
  assert.equal(verifyAppendOnlyHistory(root, articleId).frozenEditionCount, 1);
  frozen.value.source.sha256 = 'b'.repeat(64);
  json(root, frozen.relative, frozen.value);
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /Frozen edition.*first committed/);
  commit(root, 'Rewrite frozen source pin');
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /Frozen edition.*rewritten/);
});

test('frozen records cannot revert to drafts, change non-source fields or be deleted', (t) => {
  const root = fixture(t);
  const frozen = edition(root, { frozen: true });
  commit(root, 'Freeze edition');
  json(root, frozen.relative, { ...frozen.value, rights: 'accepted' });
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /first committed identity/);
  json(root, frozen.relative, {
    ...frozen.value,
    source: { ...frozen.value.source, commit: null, blob: null },
  });
  commit(root, 'Revert frozen record to review');
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /rewritten after commitment/);
  const deleted = fixture(t);
  const prior = edition(deleted, { frozen: true });
  commit(deleted, 'Freeze edition');
  fs.rmSync(path.join(deleted, prior.relative));
  commit(deleted, 'Delete frozen edition');
  assert.throws(() => verifyAppendOnlyHistory(deleted, articleId), /Frozen edition.*deleted/);
});

test('unfrozen draft deletion remains permitted', (t) => {
  const root = fixture(t);
  const draft = edition(root);
  commit(root, 'Commit draft');
  fs.rmSync(path.join(root, draft.relative));
  commit(root, 'Remove unfrozen draft');
  assert.equal(verifyAppendOnlyHistory(root, articleId).frozenEditionCount, 0);
});

test('explicit baselines reject symbolic, missing and unrelated commits', (t) => {
  const root = fixture(t);
  event(root);
  const original = commit(root, 'Observe publication');
  assert.throws(
    () => verifyAppendOnlyHistory(root, articleId, { baseCommit: 'HEAD' }),
    /immutable full Git commit/
  );
  assert.throws(
    () => verifyAppendOnlyHistory(root, articleId, { baseCommit: 'f'.repeat(40) }),
    /Git operation failed/
  );
  command(root, ['switch', '-q', '--orphan', 'unrelated-history']);
  write(root, 'unrelated.md', 'independent history');
  const unrelated = commit(root, 'Unrelated root');
  command(root, ['checkout', '-q', original]);
  assert.throws(
    () => verifyAppendOnlyHistory(root, articleId, { baseCommit: unrelated }),
    /not an ancestor/
  );
});

test('merge history preserves independent records from both parent branches', (t) => {
  const root = fixture(t);
  const initial = command(root, ['rev-parse', 'HEAD']);
  command(root, ['switch', '-q', '-c', 'first-branch']);
  event(root, 'first-publication');
  commit(root, 'Observe on first branch');
  command(root, ['switch', '-q', '-c', 'second-branch', initial]);
  event(root, 'second-publication');
  commit(root, 'Observe on second branch');
  command(root, ['switch', '-q', 'first-branch']);
  command(root, ['merge', '-q', '--no-edit', 'second-branch']);
  assert.equal(verifyAppendOnlyHistory(root, articleId).eventCount, 2);
});

test('Git replacement refs cannot conceal a committed historical rewrite', (t) => {
  const root = fixture(t);
  const first = event(root);
  const original = commit(root, 'Observe publication');
  json(root, first.relative, { ...first.value, url: 'https://example.com/rewritten' });
  const modified = commit(root, 'Rewrite historical record');
  command(root, ['replace', modified, original]);
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /rewritten after commitment/);
});

test('shallow history cannot claim first-addition verification', (t) => {
  const root = fixture(t);
  event(root);
  commit(root, 'Observe publication');
  const shallow = fixture(t, { git: false });
  command(shallow, ['clone', '-q', '--depth=1', 'file://' + root, '.']);
  assert.throws(() => verifyAppendOnlyHistory(shallow, articleId), /complete ancestry/);
});

test('history exceeding the changing-commit bound fails instead of trusting a truncated origin', (t) => {
  const root = fixture(t);
  const base = command(root, ['rev-parse', 'HEAD']);
  const draft = edition(root);
  const commands = [];
  for (let index = 0; index < 101; index += 1) {
    const value = {
      ...draft.value,
      source: { ...draft.value.source, sha256: index.toString(16).padStart(64, '0') },
    };
    const bytes = JSON.stringify(value) + '\n';
    const message = 'Draft revision ' + index + '\n';
    commands.push(
      'blob\nmark :' +
        (index * 2 + 1) +
        '\ndata ' +
        Buffer.byteLength(bytes) +
        '\n' +
        bytes +
        '\ncommit refs/heads/bounded-history\nmark :' +
        (index * 2 + 2) +
        '\ncommitter History Test <history-test@example.invalid> 1760000000 +0000\ndata ' +
        Buffer.byteLength(message) +
        '\n' +
        message +
        '\nfrom ' +
        (index === 0 ? base : ':' + index * 2) +
        '\nM 100644 :' +
        (index * 2 + 1) +
        ' ' +
        draft.relative +
        '\n\n'
    );
  }
  cp.execFileSync('git', ['fast-import', '--quiet'], {
    cwd: root,
    input: commands.join(''),
    stdio: ['pipe', 'ignore', 'pipe'],
  });
  command(root, ['checkout', '-q', '-f', 'bounded-history']);
  assert.throws(() => verifyAppendOnlyHistory(root, articleId), /100 changing commit/);
});
