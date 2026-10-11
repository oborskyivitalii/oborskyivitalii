'use strict';
// Edition inputs are applied once, before hashing, tests and publication.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('./snapshot.cjs');

function compactData(html) {
  return html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (_, data) =>
      '<script type="application/ld+json">' + JSON.stringify(JSON.parse(data)) + '</script>'
  );
}

function build(directory, descriptor) {
  const publicDir = path.join(directory, 'public');
  const source = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  artifact.verify(publicDir, source);
  assert.equal(source.edition, undefined, 'edition already applied');
  assert.match(source.sourceCommit, /^[a-f0-9]{40}$/);
  const base = JSON.parse(fs.readFileSync(path.join(publicDir, 'site-revision.json')));
  const engine = artifact.digest(
    JSON.stringify({
      contract: 1,
      edition: descriptor.edition,
      baseEngine: base.engine,
      css: descriptor.css,
      producer: descriptor.render.toString(),
      inputs: descriptor.inputs,
    })
  );
  const versions = Object.fromEntries(
    snapshot.routes.map((id) => [
      id,
      artifact.digest(
        descriptor.edition.id +
          ':' +
          base.routes[id].version +
          ':' +
          engine +
          ':' +
          source.sourceCommit
      ),
    ])
  );
  const scripts = Object.fromEntries(
    snapshot.runtimeFiles.map((name) => [name, fs.readFileSync(path.join(publicDir, name), 'utf8')])
  );
  const pages = Object.fromEntries(
    snapshot.routes.map((id) => [
      id,
      Object.fromEntries(
        [
          ['alias', id + '.html'],
          ['snapshot', base.routes[id].url],
        ].map(([kind, file]) => {
          let html = fs.readFileSync(path.join(publicDir, file), 'utf8');
          html = html.replaceAll(base.engine, engine);
          for (const route of snapshot.routes)
            html = html.replaceAll(base.routes[route].version, versions[route]);
          return [kind, descriptor.render(html, id, source.sourceCommit)];
        })
      ),
    ])
  );
  // Optional analytics loaders have their own content digest, separate from runtime identity.
  const analytics = Object.keys(source.files)
    .filter((name) => /^runtime\/[a-f0-9]{64}\/analytics\.js$/.test(name))
    .map((name) => [name, fs.readFileSync(path.join(publicDir, name))]);
  fs.rmSync(path.join(publicDir, 'runtime'), { recursive: true });
  fs.rmSync(path.join(publicDir, 'snapshots'), { recursive: true });
  const write = (name, bytes) => {
    const file = path.join(publicDir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  };
  if (descriptor.edition.analytics !== false)
    for (const [name, bytes] of analytics) write(name, bytes);
  for (const name of snapshot.runtimeFiles) {
    const bytes =
      scripts[name] + (name === 'styles.css' && descriptor.css ? '\n' + descriptor.css : '');
    write(name, bytes);
    write('runtime/' + engine + '/' + name, bytes);
  }
  const revision = {
    ...base,
    engine,
    variant: { ...(base.variant || { id: 'base', contract: 1 }), fingerprint: engine },
    edition: descriptor.edition,
    routes: {},
  };
  for (const id of snapshot.routes) {
    const page = pages[id].snapshot;
    const url = 'snapshots/' + versions[id] + '/' + id + '.html';
    write(id + '.html', pages[id].alias);
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
  for (const [name, bytes] of Object.entries(descriptor.files || {})) write(name, bytes);
  const record = {
    ...source,
    ...artifact.manifest(publicDir),
    variant: revision.variant,
    edition: revision.edition,
    derivation: { kind: descriptor.edition.id + '-edition', parentDigest: source.artifactDigest },
  };
  record.components = snapshot.verify(publicDir, record);
  fs.writeFileSync(path.join(directory, 'artifact.json'), JSON.stringify(record, null, 2) + '\n');
  fs.writeFileSync(
    path.join(directory, 'sizes.json'),
    JSON.stringify(artifact.checkSize(publicDir), null, 2) + '\n'
  );
  return record;
}

module.exports = { compactData, build };
