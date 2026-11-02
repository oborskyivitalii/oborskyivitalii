'use strict';

// Site-specific implementation; this file is not extracted from the UA helpers.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { readSource } = require('./safety.cjs');

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH = /^[a-f0-9]{40}$/;

function gitResult(root, arguments_) {
  const result = cp.spawnSync(
    'git',
    ['--no-replace-objects', '--literal-pathspecs', ...arguments_],
    {
      cwd: root,
      encoding: null,
      maxBuffer: 2_000_000,
      timeout: 10000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  if (result.error) {
    throw new Error('Publication history Git operation failed: ' + result.error.message, {
      cause: result.error,
    });
  }
  return result;
}

function git(root, arguments_) {
  const result = gitResult(root, arguments_);
  if (result.status !== 0) {
    throw new Error('Publication history Git operation failed: ' + result.stderr.toString().trim());
  }
  return result.stdout;
}

function resolveCommit(root, value, context) {
  if (typeof value !== 'string' || !HASH.test(value)) {
    throw new Error(context + ' requires an immutable full Git commit hash');
  }
  const resolved = git(root, ['rev-parse', '--verify', '--end-of-options', value + '^{commit}'])
    .toString()
    .trim();
  if (resolved !== value) {
    throw new Error(context + ' does not identify its exact Git commit');
  }
  return resolved;
}

function directory(root, relative) {
  const absolute = path.join(root, relative);
  try {
    const info = fs.lstatSync(absolute);
    if (!info.isDirectory() || info.isSymbolicLink() || fs.realpathSync(absolute) !== absolute) {
      throw new Error('Publication history directory must be real: ' + relative);
    }
    return absolute;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function currentRecords(root, relative) {
  const absolute = directory(root, relative);
  const records = new Map();
  if (absolute === null) {
    return records;
  }
  const stream = fs.opendirSync(absolute);
  try {
    let entry;
    while ((entry = stream.readSync()) !== null) {
      const id = entry.name.endsWith('.json') ? entry.name.slice(0, -5) : '';
      if (!ID.test(id) || id.length > 80) {
        throw new Error('Unknown publication history record: ' + entry.name);
      }
      if (records.size >= 200) {
        throw new Error('Publication history exceeds 200 records per directory');
      }
      const name = relative + '/' + entry.name;
      records.set(name, readSource(root, name, { maxBytes: 100_000 }).bytes);
    }
  } finally {
    stream.closeSync();
  }
  return records;
}

function recordPath(relative, prefixes) {
  const prefix = prefixes.find((candidate) => relative.startsWith(candidate + '/'));
  if (!prefix) {
    throw new Error('Git returned a record outside the article history');
  }
  const name = relative.slice(prefix.length + 1);
  const id = name.endsWith('.json') ? name.slice(0, -5) : '';
  if (!ID.test(id) || id.length > 80) {
    throw new Error('Unknown committed publication history record: ' + relative);
  }
  return { prefix, id };
}

function parsedRecord(bytes, relative, articleId, { edition = false } = {}) {
  let record;
  try {
    record = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    throw new Error('Invalid committed history JSON: ' + relative, { cause: error });
  }
  const expectedId = path.posix.basename(relative, '.json');
  if (!record || record.id !== expectedId || record.articleId !== articleId) {
    throw new Error('History record identity does not match its article/path: ' + relative);
  }
  if (edition) {
    const source = record.source;
    if (!source || typeof source.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(source.sha256)) {
      throw new Error('Historical edition requires its source SHA256 pin: ' + relative);
    }
    if (source.commit === null && source.blob === null) {
      return { frozen: false };
    }
    if (
      typeof source.commit !== 'string' ||
      typeof source.blob !== 'string' ||
      !HASH.test(source.commit) ||
      !HASH.test(source.blob)
    ) {
      throw new Error(
        'Historical edition must declare null review or exact Git identities: ' + relative
      );
    }
    return { frozen: true };
  }
  return record;
}

function historicalBlob(root, blob, context) {
  if (!context.blobs.has(blob)) {
    const size = Number(git(root, ['cat-file', '-s', blob]).toString().trim());
    if (!Number.isSafeInteger(size) || size < 0 || size > 100_000) {
      throw new Error('Committed history record exceeds the 100000 byte limit');
    }
    const bytes = git(root, ['cat-file', 'blob', blob]);
    context.blobBytes += bytes.length;
    if (context.blobBytes > 50_000_000 || context.blobs.size >= 2000) {
      throw new Error('Publication history exceeds its 50 MB or 2000 distinct blob limit');
    }
    context.blobs.set(blob, bytes);
  }
  return context.blobs.get(blob);
}

function freeze(pins, relative, bytes, commit, context) {
  const pinned = pins.get(relative);
  if (pinned && !pinned.bytes.equals(bytes)) {
    throw new Error(context + ' rewrites its first committed identity: ' + relative);
  }
  if (!pinned) {
    if (pins.size >= 200) {
      throw new Error('Publication history exceeds 200 immutable records per kind');
    }
    pins.set(relative, { bytes, firstCommit: commit });
  }
}

function inspectChange(root, fields, relative, commit, context) {
  const [oldMode, newMode, oldBlob, newBlob, status] = fields;
  const { prefix } = recordPath(relative, context.prefixes);
  const edition = prefix === context.editionPrefix;
  const description = edition ? 'Frozen edition' : 'Publication event';
  const oldBytes = oldBlob === '0'.repeat(40) ? null : historicalBlob(root, oldBlob, context);
  const newBytes = newBlob === '0'.repeat(40) ? null : historicalBlob(root, newBlob, context);
  if (
    (oldBytes && !['100644', '100755'].includes(oldMode)) ||
    (newBytes && !['100644', '100755'].includes(newMode))
  ) {
    throw new Error('Committed history record must be a regular file: ' + relative);
  }
  const prior = oldBytes ? parsedRecord(oldBytes, relative, context.articleId, { edition }) : null;
  const next = newBytes ? parsedRecord(newBytes, relative, context.articleId, { edition }) : null;
  const priorImmutable = oldBytes && (!edition || prior.frozen);
  if (priorImmutable && (!newBytes || !oldBytes.equals(newBytes))) {
    throw new Error(
      description +
        (status === 'D' ? ' was deleted' : ' was rewritten') +
        ' after commitment: ' +
        relative
    );
  }
  if (newBytes && (!edition || next.frozen)) {
    freeze(edition ? context.editions : context.events, relative, newBytes, commit, description);
  }
}

function verifyCurrent(current, pins, context) {
  for (const [relative, pin] of pins) {
    const bytes = current.get(relative);
    if (!bytes) {
      throw new Error(context + ' was deleted from the working tree: ' + relative);
    }
    if (!bytes.equals(pin.bytes)) {
      throw new Error(context + ' rewrites its first committed identity: ' + relative);
    }
  }
}

function verifyAppendOnlyHistory(root, articleId, { baseCommit } = {}) {
  if (typeof articleId !== 'string' || articleId.length > 80 || !ID.test(articleId)) {
    throw new Error('Invalid article id for publication history');
  }
  const trusted = path.resolve(root);
  const info = fs.lstatSync(trusted);
  if (!info.isDirectory() || info.isSymbolicLink() || fs.realpathSync(trusted) !== trusted) {
    throw new Error('Publication history requires a real explicit root');
  }
  const top = gitResult(trusted, ['rev-parse', '--show-toplevel']);
  if (top.status !== 0) {
    if (baseCommit !== undefined || !top.stderr.toString().includes('not a git repository')) {
      throw new Error('Publication history baseline requires an available Git repository');
    }
    return { state: 'unversioned-review', baseCommit: null };
  }
  if (fs.realpathSync(top.stdout.toString().trim()) !== trusted) {
    throw new Error('Publication history requires the explicit repository root');
  }
  const headResult = gitResult(trusted, ['rev-parse', '--verify', 'HEAD^{commit}']);
  if (headResult.status !== 0) {
    if (baseCommit !== undefined) {
      throw new Error('Publication history baseline requires a committed HEAD');
    }
    return { state: 'unversioned-review', baseCommit: null };
  }
  const head = headResult.stdout.toString().trim();
  const baseline =
    baseCommit === undefined
      ? head
      : resolveCommit(trusted, baseCommit, 'Publication history baseline');
  const ancestor = gitResult(trusted, ['merge-base', '--is-ancestor', baseline, head]);
  if (ancestor.status !== 0) {
    throw new Error('Publication history baseline is not an ancestor of the current HEAD');
  }
  if (git(trusted, ['rev-parse', '--is-shallow-repository']).toString().trim() !== 'false') {
    throw new Error('Publication history requires complete ancestry, not a shallow Git history');
  }
  const directory = 'site/publications/' + articleId;
  const eventPrefix = directory + '/publication-events';
  const editionPrefix = directory + '/editions';
  const prefixes = [eventPrefix, editionPrefix];
  const commits = git(trusted, [
    'rev-list',
    '--full-history',
    '--topo-order',
    '--max-count=101',
    head,
    '--',
    ...prefixes,
  ])
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);
  if (commits.length > 100) {
    throw new Error('Publication history exceeds the 100 changing commit verification limit');
  }
  const context = {
    articleId,
    prefixes,
    editionPrefix,
    blobs: new Map(),
    blobBytes: 0,
    events: new Map(),
    editions: new Map(),
  };
  for (const commit of commits.reverse()) {
    const changes = git(trusted, [
      'diff-tree',
      '--root',
      '-m',
      '--no-renames',
      '--no-commit-id',
      '-r',
      '--raw',
      '--no-abbrev',
      '-z',
      commit,
      '--',
      ...prefixes,
    ])
      .toString('utf8')
      .split('\0')
      .filter(Boolean);
    for (let index = 0; index < changes.length; index += 2) {
      const header = changes[index];
      const relative = changes[index + 1];
      const fields = header.slice(1).split(' ');
      if (
        !header.startsWith(':') ||
        !relative ||
        fields.length !== 5 ||
        !['A', 'M', 'D', 'T'].includes(fields[4])
      ) {
        throw new Error('Unexpected Git publication history change format');
      }
      inspectChange(trusted, fields, relative, commit, context);
    }
  }
  const events = currentRecords(trusted, eventPrefix);
  const editions = currentRecords(trusted, editionPrefix);
  verifyCurrent(events, context.events, 'Publication event');
  verifyCurrent(editions, context.editions, 'Frozen edition');
  return {
    state: 'verified-history',
    baseCommit: baseline,
    checkedCommits: commits.length,
    eventCount: context.events.size,
    frozenEditionCount: context.editions.size,
  };
}

module.exports = { verifyAppendOnlyHistory };
