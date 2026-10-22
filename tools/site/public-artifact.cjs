'use strict';
// Shared byte inventory for complete public generations and delivery artifacts.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

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
    entries(directory).map((entry) => [
      entry.path,
      {
        sha256: digest(entry.bytes),
        raw: entry.bytes.length,
        gzip: zlib.gzipSync(entry.bytes).length,
      },
    ])
  );
  return { files, artifactDigest: digest(JSON.stringify(files)) };
}

module.exports = { digest, entries, manifest };
