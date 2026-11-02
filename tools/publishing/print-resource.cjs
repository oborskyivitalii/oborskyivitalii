'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const constants = require('node:fs').constants;
const path = require('node:path');

const printOrigin = 'https://article-print.invalid';
const sha256Pattern = /^[a-f0-9]{64}$/;
const resourceLimits = Object.freeze({
  count: 64,
  aggregateBytes: 16_000_000,
  htmlBytes: 1_000_000,
  stylesheetBytes: 1_000_000,
  imageBytes: 5_000_000,
  fontBytes: 2_000_000,
});
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === '' ||
    (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))
  );
}

async function infoIfExists(candidate) {
  try {
    return await fs.lstat(candidate);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function assertSafePath(candidate, { allowMissing = false } = {}) {
  const absolute = path.resolve(candidate);
  const parsed = path.parse(absolute);
  const segments = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
  let current = parsed.root;
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    const info = await infoIfExists(current);
    if (!info) {
      if (allowMissing) {
        return;
      }
      throw new Error('Print path does not exist: ' + current);
    }
    if (info.isSymbolicLink()) {
      throw new Error('Print path must not contain a symbolic link: ' + current);
    }
    if (index < segments.length - 1 && !info.isDirectory()) {
      throw new Error('Print parent must be a directory: ' + current);
    }
    if (info.isFile() && info.nlink !== 1) {
      throw new Error('Print file must not be a hardlink: ' + current);
    }
  }
}

async function withRegularFile(candidate, consume, { maxBytes = 32_000_000 } = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new Error('Print byte limit must be a nonnegative safe integer');
  }
  await assertSafePath(candidate);
  const handle = await fs.open(candidate, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.nlink !== 1) {
      throw new Error('Print input must be a regular file without hardlinks: ' + candidate);
    }
    if (before.size > maxBytes) {
      throw new Error('Print input exceeds the ' + maxBytes + ' byte limit: ' + candidate);
    }
    const result = await consume(handle, before, maxBytes);
    const after = await handle.stat();
    const current = await fs.lstat(candidate);
    if (
      current.isSymbolicLink() ||
      current.dev !== before.dev ||
      current.ino !== before.ino ||
      after.nlink !== 1 ||
      current.nlink !== 1 ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs ||
      before.ctimeMs !== after.ctimeMs ||
      before.size !== current.size ||
      before.ctimeMs !== current.ctimeMs
    ) {
      throw new Error('Print input changed while reading: ' + candidate);
    }
    return { ...result, dev: before.dev, ino: before.ino };
  } finally {
    await handle.close();
  }
}

async function readRegularFile(candidate, options) {
  return withRegularFile(
    candidate,
    async (handle, before, maxBytes) => {
      const buffer = Buffer.alloc(Math.min(before.size + 1, maxBytes + 1));
      let length = 0;
      while (length < buffer.length) {
        const { bytesRead } = await handle.read(buffer, length, buffer.length - length, null);
        if (bytesRead === 0) {
          break;
        }
        length += bytesRead;
      }
      if (length !== before.size) {
        throw new Error('Print input changed while reading: ' + candidate);
      }
      const bytes = buffer.subarray(0, length);
      return { bytes, sha256: sha256(bytes) };
    },
    options
  );
}

async function hashRegularFile(candidate, options) {
  return withRegularFile(
    candidate,
    async (handle, before) => {
      const digest = crypto.createHash('sha256');
      const chunk = Buffer.alloc(1024 * 1024);
      let size = 0;
      while (size < before.size) {
        const { bytesRead } = await handle.read(
          chunk,
          0,
          Math.min(chunk.length, before.size - size),
          null
        );
        if (bytesRead === 0) {
          throw new Error('Print input changed while hashing: ' + candidate);
        }
        size += bytesRead;
        digest.update(chunk.subarray(0, bytesRead));
      }
      return { sha256: digest.digest('hex'), bytes: size };
    },
    options
  );
}

function resourcePath(root, declared) {
  if (typeof declared !== 'string' || declared === '' || declared.includes('\0')) {
    throw new Error('Print resource requires a local path');
  }
  if (declared.split(/[\\/]/).some((segment) => segment === '..' || segment === '.')) {
    throw new Error('Print resource traversal is forbidden: ' + declared);
  }
  const absolute = path.isAbsolute(declared) ? declared : path.resolve(root, declared);
  if (!isInside(root, absolute) || absolute === root) {
    throw new Error('Print resource is outside its declared root: ' + declared);
  }
  return absolute;
}

function resourceUrl(root, absolute) {
  const relative = path.relative(root, absolute).split(path.sep).map(encodeURIComponent).join('/');
  return printOrigin + '/' + relative;
}

function resourceByteLimit(extension) {
  if (extension === '.html') {
    return resourceLimits.htmlBytes;
  }
  if (extension === '.css') {
    return resourceLimits.stylesheetBytes;
  }
  if (extension === '.woff' || extension === '.woff2') {
    return resourceLimits.fontBytes;
  }
  return resourceLimits.imageBytes;
}

async function captureResource(absolute, htmlAbsolute, entry, availableBytes) {
  if (entry.sha256 !== null && !sha256Pattern.test(entry.sha256)) {
    throw new Error('Print resource requires a SHA-256: ' + entry.path);
  }
  if (entry.sha256 === null && absolute !== htmlAbsolute) {
    throw new Error('Only prepared print HTML can have an automatically captured hash');
  }
  const extension = path.extname(absolute).toLowerCase();
  const contentType = contentTypes[extension];
  if (!contentType || (extension === '.html' && absolute !== htmlAbsolute)) {
    throw new Error('Unsupported print resource type: ' + entry.path);
  }
  const info = await infoIfExists(absolute);
  if (info && info.size > availableBytes) {
    throw new Error(
      'Print resources exceed the aggregate byte limit: ' + resourceLimits.aggregateBytes
    );
  }
  const file = await readRegularFile(absolute, { maxBytes: resourceByteLimit(extension) });
  if (file.bytes.length > availableBytes) {
    throw new Error(
      'Print resources exceed the aggregate byte limit: ' + resourceLimits.aggregateBytes
    );
  }
  if (entry.sha256 && file.sha256 !== entry.sha256) {
    throw new Error('Print resource checksum mismatch: ' + entry.path);
  }
  return { ...file, contentType };
}

async function captureResources({ htmlPath, resourceRoot, resources }) {
  const root = path.resolve(resourceRoot);
  await assertSafePath(root);
  if (!(await fs.lstat(root)).isDirectory()) {
    throw new Error('Print resource root must be a directory');
  }
  if (!Array.isArray(resources)) {
    throw new Error('Print source must declare its resources');
  }
  if (resources.length > resourceLimits.count) {
    throw new Error('Print declared resource count exceeds ' + resourceLimits.count);
  }
  const htmlAbsolute = resourcePath(root, htmlPath);
  const declared = [...resources];
  if (!declared.some((entry) => resourcePath(root, entry.path) === htmlAbsolute)) {
    declared.push({ path: htmlAbsolute, sha256: null });
  }
  if (declared.length > resourceLimits.count) {
    throw new Error('Print declared resource count including HTML exceeds ' + resourceLimits.count);
  }
  const captured = new Map();
  const identities = [];
  let aggregateBytes = 0;
  for (const entry of declared) {
    const absolute = resourcePath(root, entry.path);
    if (captured.has(absolute)) {
      throw new Error('Duplicate declared print resource: ' + entry.path);
    }
    const file = await captureResource(
      absolute,
      htmlAbsolute,
      entry,
      resourceLimits.aggregateBytes - aggregateBytes
    );
    aggregateBytes += file.bytes.length;
    captured.set(absolute, file);
    identities.push(
      Object.freeze({
        path: path.relative(root, absolute).split(path.sep).join('/'),
        sha256: file.sha256,
        bytes: file.bytes.length,
      })
    );
  }
  identities.sort((left, right) => left.path.localeCompare(right.path, 'en'));

  function resolveRequest(url, method = 'GET') {
    if (method !== 'GET') {
      throw new Error('Print resource method rejected: ' + method);
    }
    const parsed = new URL(url);
    if (
      parsed.origin !== printOrigin ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error('Print network or nonlocal resource rejected: ' + url);
    }
    let relative;
    try {
      relative = decodeURIComponent(parsed.pathname.slice(1));
    } catch {
      throw new Error('Print resource URL has invalid encoding: ' + url);
    }
    if (
      relative.includes('%') ||
      relative.includes('\\') ||
      relative.startsWith('/') ||
      relative.split('/').some((segment) => segment === '.' || segment === '..')
    ) {
      throw new Error('Print resource URL traversal rejected: ' + url);
    }
    const absolute = resourcePath(root, relative);
    const file = captured.get(absolute);
    if (!file) {
      throw new Error('Undeclared print resource rejected: ' + relative);
    }
    return { body: Buffer.from(file.bytes), contentType: file.contentType };
  }

  async function verifyUnchanged() {
    for (const [absolute, before] of captured) {
      const after = await readRegularFile(absolute);
      if (after.sha256 !== before.sha256 || after.dev !== before.dev || after.ino !== before.ino) {
        throw new Error('Declared print resource changed during rendering: ' + absolute);
      }
    }
  }

  return Object.freeze({
    htmlUrl: resourceUrl(root, htmlAbsolute),
    resources: Object.freeze(identities),
    limits: resourceLimits,
    protectedPaths: Object.freeze([...captured.keys()]),
    resolveRequest,
    verifyUnchanged,
  });
}

module.exports = {
  assertSafePath,
  captureResources,
  hashRegularFile,
  infoIfExists,
  printOrigin,
  readRegularFile,
  resourceLimits,
  sha256,
};
