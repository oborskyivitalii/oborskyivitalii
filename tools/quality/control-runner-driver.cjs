'use strict';

// Runs inside the container. Its output is hostile data, never an assertion receipt.
const fs = require('node:fs');
const probes = JSON.parse(fs.readFileSync('/probes.json', 'utf8'));
const subject = require('/candidate.cjs');
const rows = probes.map(({ operation, value }) => {
  try {
    const input = operation === 'parse' ? Buffer.from(value) : value;
    return { ok: true, value: subject[operation](input) };
  } catch {
    return { ok: false };
  }
});
process.stdout.write(JSON.stringify(rows) + '\n');
