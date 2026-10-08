'use strict';
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
function names(source, context) {
  return [...source.matchAll(/^\s+name: (site-[^\n]+)$/gm)].flatMap(([, name]) => {
    const platforms = name.includes('matrix.platform')
      ? [...source.matchAll(/^\s+platform: ([a-z0-9]+)$/gm)].map(([, platform]) => platform)
      : [''];
    assert.ok(platforms.length, 'missing artifact platform matrix');
    return platforms.map((platform) =>
      name.replace(/\$\{\{\s*([^}]+?)\s*\}\}/g, (_, key) => {
        const values = {
          'github.run_id': context.run,
          'github.run_attempt': context.attempt,
          'inputs.profile': context.profile,
          'matrix.platform': platform,
        };
        assert.ok(Object.hasOwn(values, key), 'unknown artifact discriminator ' + key);
        return values[key];
      })
    );
  });
}
function check(root = path.resolve(__dirname, '../..'), sources) {
  sources ??= Object.fromEntries(
    ['site-checks', 'site-release-checks'].map((id) => [
      id,
      fs.readFileSync(path.join(root, '.github/workflows/' + id + '.yml'), 'utf8'),
    ])
  );
  const all = [];
  for (const attempt of [1, 2]) {
    all.push(...names(sources['site-checks'], { run: 123, attempt, profile: 'basic' }));
    for (const profile of ['staging', 'production', 'release'])
      all.push(...names(sources['site-release-checks'], { run: 123, attempt, profile }));
  }
  assert.equal(new Set(all).size, all.length, 'immutable artifact namespace collision');
  assert.match(
    sources['site-checks'],
    /gate_artifact_id: \$\{\{ steps\.gate\.outputs\.artifact-id \}\}/
  );
  assert.match(
    sources['site-release-checks'],
    /artifact_id: \$\{\{ steps\.gate_upload\.outputs\.artifact-id \}\}/
  );
  assert.ok(
    !/overwrite:\s*true/.test(Object.values(sources).join('\n')),
    'immutable gate cannot be overwritten'
  );
  const pattern = sources['site-release-checks'].match(/pattern: (site-reports-[^\n]+)/)?.[1];
  assert.equal(
    pattern,
    'site-reports-*-${{ inputs.profile }}-${{ github.run_id }}-${{ github.run_attempt }}',
    'reports must belong to this stage/attempt'
  );
  return { uploads: all.length, unique: true, idConsumption: true };
}
module.exports = { names, check };
