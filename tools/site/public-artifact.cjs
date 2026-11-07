'use strict';
// Shared byte inventory for complete public generations and delivery artifacts.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const gzipSizes = new Map();
const maximumGzipEntries = 2048;
let gzipProducer = zlib.gzipSync;

function gzipSize(bytes, sha256) {
  if (gzipProducer !== zlib.gzipSync) {
    gzipSizes.clear();
    gzipProducer = zlib.gzipSync;
  }
  const key = sha256 + ':' + bytes.length;
  if (!gzipSizes.has(key)) {
    const size = zlib.gzipSync(bytes).length;
    if (gzipSizes.size >= maximumGzipEntries) gzipSizes.delete(gzipSizes.keys().next().value);
    gzipSizes.set(key, size);
  }
  return gzipSizes.get(key);
}

function digest(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function entries(directory, base = directory) {
  return fs
    .readdirSync(directory)
    .sort()
    .flatMap((name) => {
      const file = path.join(directory, name);
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) throw Error('Symlink in public artifact');
      if (stat.isDirectory()) return entries(file, base);
      if (!stat.isFile()) throw Error('Non-file in public artifact');
      return [
        {
          path: path.relative(base, file).split(path.sep).join('/'),
          bytes: fs.readFileSync(file),
        },
      ];
    });
}

function manifest(directory) {
  const files = Object.fromEntries(
    entries(directory).map((entry) => {
      // Inventory, reads and hashes always run; only deterministic compression size is reused.
      const sha256 = digest(entry.bytes);
      return [
        entry.path,
        {
          sha256,
          raw: entry.bytes.length,
          gzip: gzipSize(entry.bytes, sha256),
        },
      ];
    })
  );
  return { files, artifactDigest: digest(JSON.stringify(files)) };
}

module.exports = { digest, entries, manifest };
