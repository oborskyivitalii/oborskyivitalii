'use strict';
// Imports verified previous immutable inputs; never uploads or prunes a host.
const fs = require('node:fs'),
  path = require('node:path');
const artifact = require('../quality/artifact.cjs'),
  snapshot = require('./snapshot.cjs');
function retain(dir, record, destination) {
  artifact.verify(dir, record);
  snapshot.verify(dir, record);
  fs.mkdirSync(destination, { recursive: true });
  const old = path.join(destination, 'manifest.json');
  const manifest = fs.existsSync(old) ? JSON.parse(fs.readFileSync(old)) : { schema: 1, files: {} };
  if (manifest.schema !== 1 || !manifest.files) throw Error('Invalid retained source manifest');
  for (const [name, info] of Object.entries(record.files).filter(([name]) =>
    snapshot.immutable(name)
  )) {
    const file = path.join(destination, name),
      bytes = fs.readFileSync(path.join(dir, name));
    if (fs.existsSync(file) && artifact.digest(fs.readFileSync(file)) !== info.sha256)
      throw Error('Immutable name collision');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
    manifest.files[name] = info.sha256;
  }
  manifest.files = Object.fromEntries(
    Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b))
  );
  fs.writeFileSync(old, JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
if (require.main === module) {
  const [dir, manifest] = process.argv.slice(2);
  if (!dir || !manifest) throw Error('Usage: retain.cjs PREVIOUS_PUBLIC PREVIOUS_ARTIFACT_JSON');
  console.log(
    JSON.stringify({
      retained: Object.keys(
        retain(
          path.resolve(dir),
          JSON.parse(fs.readFileSync(manifest)),
          path.resolve(__dirname, '../../site/retained')
        ).files
      ).length,
    })
  );
}
module.exports = { retain };
