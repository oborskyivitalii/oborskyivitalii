'use strict';
// A staging edition is generated and hashed before any hosted test or upload.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('../site/snapshot.cjs');
const analytics = require('../site/analytics.cjs');

function render(html, base, identity, source) {
  html = analytics.stripForPreview(html).replaceAll(base.engine, identity.engine);
  for (const id of snapshot.routes) {
    html = html.replaceAll(base.routes[id].version, identity.versions[id]);
  }
  assert.doesNotMatch(html, /name="site-environment"/, 'edition already applied');
  html = html.replace(/<meta name="robots"[^>]*>/g, '');
  // Preserve structured data while reclaiming formatting bytes within the
  // existing HTML budget; staging metadata is not a budget exception.
  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (_, data) =>
      '<script type="application/ld+json">' + JSON.stringify(JSON.parse(data)) + '</script>'
  );
  html = html.replace(
    '</head>',
    '<meta name="robots" content="noindex,nofollow">\n' +
      '<meta name="site-environment" content="staging">\n</head>'
  );
  return html.replace(
    '</body>',
    '<aside class="site-environment" aria-label="Staging version">STAGING · ' +
      source.slice(0, 8) +
      '</aside>\n</body>'
  );
}

function build(directory) {
  const publicDir = path.join(directory, 'public');
  const manifestFile = path.join(directory, 'artifact.json');
  const source = JSON.parse(fs.readFileSync(manifestFile));
  artifact.verify(publicDir, source);
  assert.match(source.sourceCommit, /^[a-f0-9]{40}$/);
  const base = JSON.parse(fs.readFileSync(path.join(publicDir, 'site-revision.json')));
  const css = fs.readFileSync(path.join(__dirname, '../../site/effects/environment.css'), 'utf8');
  const engine = artifact.digest(
    JSON.stringify({
      contract: 1,
      edition: 'staging',
      baseEngine: base.engine,
      css,
      producer: render.toString(),
    })
  );
  const versions = Object.fromEntries(
    snapshot.routes.map((id) => [
      id,
      artifact.digest(
        'staging:' + base.routes[id].version + ':' + engine + ':' + source.sourceCommit
      ),
    ])
  );
  const identity = { engine, versions };
  const scripts = Object.fromEntries(
    snapshot.runtimeFiles.map((name) => [name, fs.readFileSync(path.join(publicDir, name), 'utf8')])
  );
  const pages = Object.fromEntries(
    snapshot.routes.map((id) => [
      id,
      {
        alias: render(
          fs.readFileSync(path.join(publicDir, id + '.html'), 'utf8'),
          base,
          identity,
          source.sourceCommit
        ),
        snapshot: render(
          fs.readFileSync(path.join(publicDir, base.routes[id].url), 'utf8'),
          base,
          identity,
          source.sourceCommit
        ),
      },
    ])
  );
  fs.rmSync(path.join(publicDir, 'runtime'), { recursive: true });
  fs.rmSync(path.join(publicDir, 'snapshots'), { recursive: true });
  const revision = {
    ...base,
    engine,
    variant: { ...(base.variant || { id: 'base', contract: 1 }), fingerprint: engine },
    edition: { id: 'staging', indexable: false, analytics: false },
    routes: {},
  };
  const write = (name, bytes) => {
    const file = path.join(publicDir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  };
  for (const name of snapshot.runtimeFiles) {
    const bytes = scripts[name] + (name === 'styles.css' ? '\n' + css : '');
    write(name, bytes);
    write('runtime/' + engine + '/' + name, bytes);
  }
  for (const id of snapshot.routes) {
    const html = pages[id].alias;
    const page = pages[id].snapshot;
    const url = 'snapshots/' + versions[id] + '/' + id + '.html';
    write(id + '.html', html);
    write(url, page);
    revision.routes[id] = {
      ...base.routes[id],
      version: versions[id],
      url,
      sha256: artifact.digest(page),
    };
  }
  revision.content = artifact.digest(JSON.stringify(versions));
  write('site-revision.json', JSON.stringify(revision, null, 2) + '\n');
  const result = {
    ...source,
    ...artifact.manifest(publicDir),
    variant: revision.variant,
    edition: revision.edition,
    derivation: { kind: 'staging-edition', parentDigest: source.artifactDigest },
  };
  result.components = snapshot.verify(publicDir, result);
  artifact.verify(publicDir, result);
  fs.writeFileSync(manifestFile, JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(
    path.join(directory, 'sizes.json'),
    JSON.stringify(artifact.checkSize(publicDir), null, 2) + '\n'
  );
  return result;
}

if (require.main === module) console.log(JSON.stringify(build(path.resolve(process.argv[2]))));
module.exports = { render, build };
