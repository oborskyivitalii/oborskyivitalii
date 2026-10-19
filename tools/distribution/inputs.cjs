'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { TextDecoder } = require('node:util');
const { digest } = require('./campaign.cjs');

// One bounded reader per kit. Asset limits belong to offline promotion, not site delivery.
function inputs(root) {
  const records = new Map();
  let total = 0;
  function read(relative, expected, binary = false) {
    if (
      typeof relative !== 'string' ||
      !/^[a-z0-9][a-z0-9./-]*$/.test(relative) ||
      relative.split('/').some((part) => !part || part === '.' || part === '..')
    ) {
      throw Error('Unsafe promotion input path');
    }
    const segments = relative.split('/');
    let current = root;
    const maximum = binary ? 50 * 1024 * 1024 : 100000;
    segments.forEach((segment, index) => {
      current = path.join(current, segment);
      const stat = fs.lstatSync(current);
      const regular = index === segments.length - 1 ? stat.isFile() : stat.isDirectory();
      if (stat.isSymbolicLink() || !regular || stat.size > maximum) {
        throw Error('Promotion input must be a bounded regular file/directory');
      }
    });
    const bytes = fs.readFileSync(current);
    if (bytes.length > maximum) throw Error('Promotion input too large');
    const sha256 = digest(bytes);
    if (expected && sha256 !== expected) throw Error('Changed promotion input: ' + relative);
    if (!records.has(relative)) total += bytes.length;
    if (total > 128 * 1024 * 1024) throw Error('Promotion aggregate too large');
    records.set(relative, { path: relative, sha256, bytes: bytes.length });
    if (binary) return bytes;
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (!value.trim() || value.includes('\0')) throw Error('Invalid promotion text');
    return value;
  }
  return { read, records };
}

module.exports = { inputs };
