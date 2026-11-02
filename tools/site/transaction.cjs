'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function exists(filesystem, file) {
  try {
    filesystem.lstatSync(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function overlaps(first, second) {
  const relative = path.relative(first, second);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..');
}

function recordsFor({ output, temporary, cacheFile, lockFile, cacheBytes, lockBytes }) {
  for (const file of [output, temporary, cacheFile, lockFile]) {
    if (typeof file !== 'string' || !file.length) {
      throw Error('Generation requires output, temporary, cacheFile and lockFile paths');
    }
  }
  const records = [
    { target: path.resolve(output), staged: path.resolve(temporary) },
    { target: path.resolve(cacheFile), bytes: cacheBytes },
    { target: path.resolve(lockFile), bytes: lockBytes },
  ];
  const destinations = records.map((record) => record.target);
  const reserved = destinations.concat(destinations.map((file) => file + '.previous'));
  for (let first = 0; first < reserved.length; first++) {
    for (let second = first + 1; second < reserved.length; second++) {
      if (
        overlaps(reserved[first], reserved[second]) ||
        overlaps(reserved[second], reserved[first])
      ) {
        throw Error('Generation targets and backup paths must be disjoint');
      }
    }
    if (
      overlaps(reserved[first], records[0].staged) ||
      overlaps(records[0].staged, reserved[first])
    ) {
      throw Error('Temporary generation must be separate from targets and backup paths');
    }
  }
  for (const record of records) {
    record.backup = record.target + '.previous';
    record.backedUp = false;
    record.installed = false;
    if (!record.staged) {
      record.staged = path.join(
        path.dirname(record.target),
        '.' + path.basename(record.target) + '.pending-' + randomUUID()
      );
    }
  }
  return records;
}

function failure(operation, file, error) {
  return Error(operation + ' ' + file + ': ' + error.message, { cause: error });
}

function cleanStaged(records, filesystem, first = 1) {
  const errors = [];
  for (const record of records.slice(first)) {
    try {
      filesystem.rmSync(record.staged, { force: true });
    } catch (error) {
      errors.push(failure('Unable to remove staged metadata', record.staged, error));
    }
  }
  return errors;
}

function rollback(records, filesystem) {
  const errors = [];
  for (const record of [...records].reverse()) {
    if (record.installed) {
      try {
        filesystem.renameSync(record.target, record.staged);
        record.installed = false;
      } catch (error) {
        errors.push(failure('Unable to withdraw replacement', record.target, error));
        continue;
      }
    }
    if (record.backedUp) {
      try {
        filesystem.renameSync(record.backup, record.target);
        record.backedUp = false;
      } catch (error) {
        errors.push(failure('Unable to restore previous generation', record.backup, error));
      }
    }
  }
  return errors;
}

function transactionError(message, errors, records, cause) {
  const retainedBackups = records
    .filter((record) => record.backedUp)
    .map((record) => record.backup);
  const detail = retainedBackups.length
    ? ' Retained previous-generation backups: ' + retainedBackups.join(', ')
    : '';
  const error = new AggregateError(errors, message + detail, { cause });
  error.retainedBackups = retainedBackups;
  return error;
}

// The caller owns the rendered directory; this owner stages both metadata files
// before moving any original and retains old bytes until all installs succeed.
function commitRecords(records, filesystem, firstStaged = 1) {
  for (const record of records) {
    if (exists(filesystem, record.backup)) {
      throw Error('Unresolved previous generation ' + record.backup);
    }
    record.hadOriginal = exists(filesystem, record.target);
  }
  try {
    for (const record of records.slice(firstStaged)) {
      filesystem.mkdirSync(path.dirname(record.target), { recursive: true });
      filesystem.writeFileSync(record.staged, record.bytes, { flag: 'wx' });
    }
    for (const record of records) {
      if (record.hadOriginal) {
        filesystem.renameSync(record.target, record.backup);
        record.backedUp = true;
      }
    }
    for (const record of records) {
      filesystem.renameSync(record.staged, record.target);
      record.installed = true;
    }
  } catch (error) {
    const rollbackErrors = rollback(records, filesystem);
    const cleanupErrors = cleanStaged(records, filesystem, firstStaged);
    if (rollbackErrors.length || cleanupErrors.length) {
      const state = rollbackErrors.length ? 'rollback is incomplete' : 'staged cleanup failed';
      throw transactionError(
        'Generation commit failed: ' + error.message + '; ' + state + '.',
        [error, ...rollbackErrors, ...cleanupErrors],
        records,
        error
      );
    }
    throw error;
  }

  const cleanupErrors = cleanStaged(records, filesystem, firstStaged);
  if (!cleanupErrors.length) {
    for (const record of records) {
      if (!record.backedUp) continue;
      try {
        filesystem.rmSync(record.backup, { recursive: true });
        record.backedUp = false;
      } catch (error) {
        cleanupErrors.push(failure('Unable to remove previous generation', record.backup, error));
      }
    }
  }
  if (cleanupErrors.length) {
    throw transactionError('Generation committed, but cleanup failed.', cleanupErrors, records);
  }
}

function commitGeneration(options, filesystem = fs) {
  return commitRecords(recordsFor(options), filesystem);
}

function commitFiles(entries, filesystem = fs) {
  if (!Array.isArray(entries) || entries.length !== 2)
    throw Error('A review file transaction requires its document and manifest pair');
  const records = entries.map((entry) => {
    if (
      typeof entry.target !== 'string' ||
      !entry.target.length ||
      (typeof entry.bytes !== 'string' && !Buffer.isBuffer(entry.bytes))
    )
      throw Error('A review file transaction requires explicit target bytes');
    const target = path.resolve(entry.target);
    return {
      target,
      bytes: entry.bytes,
      backup: target + '.previous',
      backedUp: false,
      installed: false,
      staged: path.join(
        path.dirname(target),
        '.' + path.basename(target) + '.pending-' + randomUUID()
      ),
    };
  });
  const reserved = records.flatMap((record) => [record.target, record.backup, record.staged]);
  for (let first = 0; first < reserved.length; first++)
    for (let second = first + 1; second < reserved.length; second++)
      if (
        overlaps(reserved[first], reserved[second]) ||
        overlaps(reserved[second], reserved[first])
      )
        throw Error('Review targets, staging and backup paths must be disjoint');
  return commitRecords(records, filesystem, 0);
}

module.exports = { commitGeneration, commitFiles };
