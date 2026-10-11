'use strict';
const fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path');
const artifact = require('../../tools/quality/artifact.cjs');
function source(parent, name, commit = 'a'.repeat(40)) {
  const directory = path.join(parent, name);
  fs.cpSync(path.join(__dirname, '../../docs'), path.join(directory, 'public'), {
    recursive: true,
  });
  const record = {
    schema: 1,
    sourceDirty: false,
    sourceCommit: commit,
    candidateCommit: commit,
    sourceTree: 'b'.repeat(40),
    ...artifact.manifest(path.join(directory, 'public')),
  };
  record.components = require('../../tools/site/snapshot.cjs').verify(
    path.join(directory, 'public'),
    record
  );
  fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(record, null, 2) + '\n');
  return { directory, record };
}
function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'author-delivery-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}
function staging(parent, color = false) {
  const result = source(parent, 'staging');
  if (color) require('../../tools/staging/color.cjs').build(result.directory);
  result.record = require('../../tools/staging/edition.cjs').build(result.directory);
  return result;
}
function response(url, bytes, status = 200) {
  return { url, status, arrayBuffer: async () => Buffer.from(bytes) };
}
module.exports = { source, staging, temporary, response };
