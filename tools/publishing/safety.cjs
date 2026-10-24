'use strict';

// Modified 2026-10-12 from UA publication-path-safety.mjs; see NOTICE.md and origin.json.
// Apache-2.0: the complete license is in ../RI-LICENSE.md.
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative === '' ||
    (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative))
  );
}

function existing(candidate) {
  try {
    return fs.lstatSync(candidate);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function realDirectory(candidate) {
  const info = fs.lstatSync(candidate);
  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw new Error('Expected a real directory: ' + candidate);
  }
  if (fs.realpathSync(candidate) !== candidate) {
    throw new Error('Directory path contains a symbolic-link component: ' + candidate);
  }
  return info;
}

function checkChain(root, target) {
  const relative = path.relative(root, target);
  let cursor = root;
  const parts = relative === '' ? [] : relative.split(path.sep);
  for (let index = 0; index < parts.length; index += 1) {
    cursor = path.join(cursor, parts[index]);
    const info = existing(cursor);
    if (!info) {
      break;
    }
    if (info.isSymbolicLink()) {
      throw new Error('Path contains a symbolic-link component: ' + cursor);
    }
    if (index < parts.length - 1 && !info.isDirectory()) {
      throw new Error('Path parent must be a directory: ' + cursor);
    }
  }
}

function unsafeCharacters(value) {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (character === '\\' || code < 32 || code === 127) {
      return true;
    }
  }
  return false;
}

function sourcePath(relative) {
  if (
    typeof relative !== 'string' ||
    relative.length === 0 ||
    unsafeCharacters(relative) ||
    path.posix.isAbsolute(relative) ||
    path.win32.isAbsolute(relative) ||
    /^[a-z]:/i.test(relative) ||
    relative.split('/').some((part) => part === '' || part === '.' || part === '..')
  ) {
    throw new Error('Source must use a relative slash path without traversal');
  }
  return relative;
}

function digest(bytes, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(bytes).digest('hex');
}

function gitBlob(bytes) {
  return crypto
    .createHash('sha1')
    .update('blob ' + bytes.length + '\0')
    .update(bytes)
    .digest('hex');
}

function regularSource(info, absolute, maxBytes) {
  if (!info.isFile() || info.isSymbolicLink()) {
    throw new Error('Source must be a regular file: ' + absolute);
  }
  if (info.nlink !== 1) {
    throw new Error('Source must not be a hardlink: ' + absolute);
  }
  if (info.size > maxBytes) {
    throw new Error('Source exceeds the ' + maxBytes + ' byte limit: ' + absolute);
  }
}

function sameFile(first, second) {
  return first.dev === second.dev && first.ino === second.ino;
}

function readSource(root, relative, { maxBytes = 1e6 } = {}) {
  sourcePath(relative);
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new Error('Source byte limit must be a nonnegative safe integer');
  }
  const trusted = path.resolve(root);
  realDirectory(trusted);
  const absolute = path.resolve(trusted, relative);
  if (!isInside(trusted, absolute) || absolute === trusted) {
    throw new Error('Source must remain inside its explicit root');
  }
  checkChain(trusted, absolute);
  const before = fs.lstatSync(absolute);
  regularSource(before, absolute, maxBytes);
  const descriptor = fs.openSync(absolute, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  let bytes;
  try {
    const opened = fs.fstatSync(descriptor);
    regularSource(opened, absolute, maxBytes);
    if (!sameFile(before, opened)) {
      throw new Error('Source changed during opening: ' + absolute);
    }
    // Read at most the declared bound plus one byte, even if the file grows after stat.
    const buffer = Buffer.alloc(Math.min(opened.size + 1, maxBytes + 1));
    let length = 0;
    while (length < buffer.length) {
      const count = fs.readSync(descriptor, buffer, length, buffer.length - length, null);
      if (count === 0) {
        break;
      }
      length += count;
    }
    const after = fs.fstatSync(descriptor);
    regularSource(after, absolute, maxBytes);
    checkChain(trusted, absolute);
    const current = fs.lstatSync(absolute);
    if (
      !sameFile(opened, current) ||
      opened.size !== after.size ||
      length !== after.size ||
      opened.mtimeMs !== after.mtimeMs ||
      opened.ctimeMs !== after.ctimeMs
    ) {
      throw new Error('Source changed during reading: ' + absolute);
    }
    bytes = buffer.subarray(0, length);
  } finally {
    fs.closeSync(descriptor);
  }
  return { absolute, relative, bytes, sha256: digest(bytes), blob: gitBlob(bytes) };
}

async function assertOutput(root, allowedRoot, target, forbiddenPaths = []) {
  const trusted = path.resolve(root);
  const allowed = path.resolve(trusted, allowedRoot);
  const candidate = path.resolve(trusted, target);
  realDirectory(trusted);
  if (!isInside(trusted, allowed) || allowed === trusted) {
    throw new Error('Allowed output root must be inside the trusted root');
  }
  if (!isInside(allowed, candidate) || candidate === allowed) {
    throw new Error('Output must be a descendant of its allowed root: ' + allowed);
  }
  if (!Array.isArray(forbiddenPaths)) {
    throw new Error('Protected source paths must be an array');
  }
  for (const forbidden of forbiddenPaths) {
    const protectedPath = path.resolve(trusted, forbidden);
    if (isInside(candidate, protectedPath) || isInside(protectedPath, candidate)) {
      throw new Error('Output overlaps a protected source path: ' + protectedPath);
    }
    const candidateInfo = existing(candidate);
    if (candidateInfo && existing(protectedPath)) {
      const protectedInfo = fs.statSync(protectedPath);
      if (sameFile(candidateInfo, protectedInfo)) {
        throw new Error('Output aliases a protected source: ' + protectedPath);
      }
    }
  }
  checkChain(trusted, candidate);
  const targetInfo = existing(candidate);
  if (targetInfo && !targetInfo.isFile() && !targetInfo.isDirectory()) {
    throw new Error('Output target must be a regular file or directory: ' + candidate);
  }
  if (targetInfo && targetInfo.isFile() && targetInfo.nlink !== 1) {
    throw new Error('Output target must not be a hardlink: ' + candidate);
  }
  await fsp.mkdir(path.dirname(candidate), { recursive: true });
  checkChain(trusted, candidate);
  realDirectory(allowed);
  realDirectory(path.dirname(candidate));
  return { root: trusted, allowedRoot: allowed, target: candidate };
}

async function directoryInventory(root) {
  realDirectory(root);
  const records = [];
  let totalBytes = 0;
  async function visit(relative) {
    const directory = path.join(root, relative);
    const entries = [];
    for await (const entry of await fsp.opendir(directory)) {
      entries.push(entry);
      if (entries.length > 1000 - records.length) {
        throw new Error('Generation directory exceeds the 1000 entry limit');
      }
    }
    entries.sort((first, second) =>
      first.name < second.name ? -1 : first.name > second.name ? 1 : 0
    );
    for (const entry of entries) {
      const name = relative ? relative + '/' + entry.name : entry.name;
      const absolute = path.join(root, name);
      const info = await fsp.lstat(absolute);
      if (info.isSymbolicLink()) {
        throw new Error('Generation directory contains a symbolic link: ' + absolute);
      }
      if (records.length >= 1000) {
        throw new Error('Generation directory exceeds the 1000 entry limit');
      }
      if (info.isDirectory()) {
        records.push({ path: name, type: 'directory' });
        await visit(name);
      } else if (info.isFile() && info.nlink === 1) {
        const source = readSource(root, name, { maxBytes: 250e6 - totalBytes });
        totalBytes += source.bytes.length;
        records.push({ path: name, type: 'file', sha256: source.sha256 });
      } else {
        throw new Error('Generation entry must be a regular independent file: ' + absolute);
      }
    }
  }
  await visit('');
  return records;
}

async function verifyDirectory(target, expected) {
  const actual = await directoryInventory(target);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('Installed generation failed byte and inventory verification: ' + target);
  }
}

function recoveryError(error, rollbackError, paths) {
  const failure = new Error(
    'Generation failed: ' +
      error.message +
      '; rollback failed: ' +
      rollbackError.message +
      '. Recover preserved paths: ' +
      JSON.stringify(paths),
    { cause: error }
  );
  failure.code = 'PUBLISHING_RECOVERY_REQUIRED';
  failure.recoveryPaths = paths;
  failure.rollbackError = rollbackError;
  return failure;
}

async function installDirectory(staging, target, { renameImpl = fsp.rename, verifyImpl } = {}) {
  const staged = path.resolve(staging);
  const output = path.resolve(target);
  const backup = output + '.previous';
  if (
    typeof renameImpl !== 'function' ||
    (verifyImpl !== undefined && typeof verifyImpl !== 'function')
  ) {
    throw new Error('Generation rename and verification adapters must be functions');
  }
  if (isInside(staged, output) || isInside(output, staged)) {
    throw new Error('Staging and output directories must be independent');
  }
  realDirectory(path.dirname(output));
  const expected = await directoryInventory(staged);
  if (existing(backup)) {
    const error = new Error(
      'Unresolved previous generation; recover preserved directory: ' + backup
    );
    error.code = 'PUBLISHING_RECOVERY_REQUIRED';
    error.recoveryPaths = { staging: staged, target: output, backup };
    throw error;
  }
  const prior = existing(output) ? await directoryInventory(output) : null;
  let backedUp = false;
  let installed = false;
  try {
    if (prior !== null) {
      await renameImpl(output, backup);
      backedUp = true;
    }
    await renameImpl(staged, output);
    installed = true;
    await verifyDirectory(output, expected);
    if (verifyImpl) {
      await verifyImpl(output);
      await verifyDirectory(output, expected);
    }
  } catch (error) {
    try {
      if (installed) {
        if (existing(staged)) {
          throw new Error('Staging recovery path is already occupied: ' + staged, { cause: error });
        }
        await renameImpl(output, staged);
      }
      if (backedUp) {
        if (existing(output)) {
          throw new Error('Output recovery path is already occupied: ' + output, { cause: error });
        }
        await renameImpl(backup, output);
        await verifyDirectory(output, prior);
      }
    } catch (rollbackError) {
      throw recoveryError(error, rollbackError, { staging: staged, target: output, backup });
    }
    const failure = new Error(
      'Generation installation failed; previous output restored: ' + error.message,
      { cause: error }
    );
    failure.code = 'PUBLISHING_INSTALL_FAILED';
    throw failure;
  }
  try {
    if (backedUp) {
      await fsp.rm(backup, { recursive: true });
    }
  } catch (error) {
    const failure = new Error(
      'Installed generation verified, but backup cleanup failed. ' +
        'Recover preserved directory: ' +
        backup,
      { cause: error }
    );
    failure.code = 'PUBLISHING_RECOVERY_REQUIRED';
    failure.recoveryPaths = { target: output, backup };
    throw failure;
  }
  return { target: output, inventory: expected };
}

module.exports = { readSource, assertOutput, installDirectory, assertSourceRelative: sourcePath };
