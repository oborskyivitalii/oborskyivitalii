'use strict';
// Explicit authored Color rendition; staging and production editions bind it separately.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const artifact = require('../quality/artifact.cjs'),
  snapshot = require('../site/snapshot.cjs');
const retention = require('../site/edition-retention.cjs');
function authoredEffects() {
  return require('../site/effects.cjs').descriptors();
}
function runtime(parts) {
  return require('../site/effects.cjs').runtime(parts);
}
function identities(base, parts) {
  const fingerprint = artifact.digest(
    JSON.stringify({ contract: 1, baseEngine: base.engine, parts })
  );
  const variant = {
    id: 'color',
    contract: 1,
    fingerprint,
    baseEngine: base.engine,
    effects: parts.map((p) => p.effect),
  };
  const versions = Object.fromEntries(
    snapshot.routes
      .map((id) => [id, artifact.digest('color:' + base.routes[id].version + ':' + fingerprint)])
      .concat(
        Object.entries(base.articles || {}).map(([key, article]) => [
          'article:' + key,
          artifact.digest('color:' + article.version + ':' + fingerprint),
        ])
      )
  );
  return { variant, versions };
}
function render(html, base, identity) {
  html = html.replaceAll(base.engine, identity.variant.fingerprint);
  for (const id of snapshot.routes)
    html = html.replaceAll(base.routes[id].version, identity.versions[id]);
  for (const [key, article] of Object.entries(base.articles || {})) {
    html = html.replaceAll(article.version, identity.versions['article:' + key]);
  }
  assert.deepEqual(
    [...html.matchAll(/<meta name="site-variant" content="([^"]*)"\s*\/?\s*>/g)].map(
      (match) => match[1]
    ),
    ['base'],
    'one canonical base variant metadata for Color palette selection'
  );
  return html.replaceAll(
    'name="site-variant" content="base"',
    'name="site-variant" content="color"'
  );
}
function write(dir, name, bytes) {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
}
function decoratePublic(dir) {
  const base = JSON.parse(fs.readFileSync(path.join(dir, 'site-revision.json')));
  assert.ok(!base.variant || base.variant.id === 'base', 'Color is applied exactly once');
  const parts = authoredEffects(),
    effects = runtime(parts),
    identity = identities(base, parts);
  const scripts = Object.fromEntries(
    snapshot.runtimeFiles.map((name) => [name, fs.readFileSync(path.join(dir, name), 'utf8')])
  );
  scripts['space.js'] = "'use strict';\n" + effects.code + '\n' + scripts['space.js'];
  scripts['navigation.js'] += '\n' + effects.controls + '\n';
  scripts['styles.css'] += '\n' + effects.styles + '\n';
  const aliases = Object.fromEntries(
    snapshot.routes.map((id) => [
      id,
      render(fs.readFileSync(path.join(dir, id + '.html'), 'utf8'), base, identity),
    ])
  );
  const pages = Object.fromEntries(
    snapshot.routes.map((id) => [
      id,
      render(fs.readFileSync(path.join(dir, base.routes[id].url), 'utf8'), base, identity),
    ])
  );
  const articles = Object.fromEntries(
    Object.entries(base.articles || {}).map(([key, article]) => [
      key,
      {
        alias: render(fs.readFileSync(path.join(dir, article.alias), 'utf8'), base, identity),
        snapshot: render(fs.readFileSync(path.join(dir, article.url), 'utf8'), base, identity),
      },
    ])
  );
  const retained = retention.capture(dir, base, { preserveActive: true });
  fs.rmSync(path.join(dir, 'runtime'), { recursive: true });
  fs.rmSync(path.join(dir, 'snapshots'), { recursive: true });
  fs.rmSync(path.join(dir, 'article-snapshots'), { recursive: true, force: true });
  for (const [name, text] of Object.entries(scripts)) {
    write(dir, name, text);
    write(dir, 'runtime/' + identity.variant.fingerprint + '/' + name, text);
  }
  const revision = {
    ...base,
    engine: identity.variant.fingerprint,
    variant: identity.variant,
    routes: {},
    ...(base.articles ? { articles: {} } : {}),
  };
  for (const id of snapshot.routes) {
    const url = 'snapshots/' + identity.versions[id] + '/' + id + '.html';
    write(dir, id + '.html', aliases[id]);
    write(dir, url, pages[id]);
    revision.routes[id] = {
      ...base.routes[id],
      version: identity.versions[id],
      url,
      sha256: artifact.digest(pages[id]),
    };
  }
  for (const [key, article] of Object.entries(base.articles || {})) {
    const version = identity.versions['article:' + key];
    const url = 'article-snapshots/' + version + '/' + path.posix.basename(article.alias);
    write(dir, article.alias, articles[key].alias);
    write(dir, url, articles[key].snapshot);
    revision.articles[key] = {
      ...article,
      version,
      url,
      sha256: artifact.digest(articles[key].snapshot),
    };
  }
  revision.content = artifact.digest(JSON.stringify(identity.versions));
  write(dir, 'site-revision.json', JSON.stringify(revision, null, 2) + '\n');
  retention.restore(dir, retained);
  return { base, revision };
}
function build(directory) {
  const manifestFile = path.join(directory, 'artifact.json'),
    publicDir = path.join(directory, 'public');
  const source = JSON.parse(fs.readFileSync(manifestFile));
  artifact.verify(publicDir, source);
  const baseArtifactDigest = source.artifactDigest,
    { revision } = decoratePublic(publicDir);
  const result = {
    ...source,
    ...artifact.manifest(publicDir),
    variant: revision.variant,
    derivation: { kind: 'authored-color-effects', baseArtifactDigest },
  };
  result.components = snapshot.verify(publicDir, result);
  artifact.verify(publicDir, result);
  const sizes = artifact.checkSize(publicDir);
  write(directory, 'artifact.json', JSON.stringify(result, null, 2) + '\n');
  write(directory, 'sizes.json', JSON.stringify(sizes, null, 2) + '\n');
  return result;
}
if (require.main === module) console.log(JSON.stringify(build(path.resolve(process.argv[2]))));
module.exports = { authoredEffects, runtime, identities, render, decoratePublic, build };
