'use strict';
// Curated fragments + JSON; native factories preserve the offline browser API.
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto'),
  cp = require('node:child_process');
const { catalog, catalogCounts, routeInput, fragment, validateFragment } = require('./content.cjs');
const { contentLabel } = require('./render-content.cjs');
const { scriptJSON, stableTagEndings } = require('./html.cjs');
const { renderPage } = require('./render-page.cjs');
const defaultRoot = path.resolve(__dirname, '../..');
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';

function files(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const file = path.join(dir, name),
        stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) throw Error('Symlink source/output: ' + file);
      return stat.isDirectory()
        ? files(file, base)
        : [path.relative(base, file).split(path.sep).join('/')];
    });
}
function read(root, name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
function load(root, name) {
  return JSON.parse(read(root, name));
}
function configuration(root) {
  const config = load(root, 'site/routes.json'),
    paths = load(root, 'site/scenes/paths.json');
  if (
    config.schema !== 1 ||
    config.contract !== 1 ||
    !Array.isArray(config.routes) ||
    config.routes.length !== 5
  )
    throw Error('Invalid route contract');
  const ids = new Set(),
    urls = new Set();
  for (const route of config.routes) {
    if (
      !/^[a-z][a-z0-9-]*$/.test(route.id) ||
      route.url !== route.id + '.html' ||
      route.scene !== route.id ||
      ids.has(route.id) ||
      urls.has(route.url) ||
      !Object.hasOwn(paths.poses, route.initialPose)
    )
      throw Error('Invalid finite route descriptor');
    if (!route.stops || Object.values(route.stops).some((id) => !Object.hasOwn(paths.poses, id)))
      throw Error('Invalid route stops');
    ids.add(route.id);
    urls.add(route.url);
  }
  if (
    JSON.stringify(config.routes.map((route) => route.id)) !==
    JSON.stringify(['index', 'research', 'writing', 'talks', 'credits'])
  )
    throw Error('Finite route contract changed');
  for (const pose of Object.values(paths.poses))
    for (const key of ['position', 'target'])
      if (!Array.isArray(pose[key]) || pose[key].length !== 3 || !pose[key].every(Number.isFinite))
        throw Error('Invalid scene pose');
  for (const ids of Object.values(paths.topicPaths))
    if (!Array.isArray(ids) || ids.length < 2 || ids.some((id) => !Object.hasOwn(paths.poses, id)))
      throw Error('Invalid scene path');
  if (!Number.isFinite(paths.roomSpacing) || paths.roomSpacing < 100)
    throw Error('Invalid room spacing');
  return {
    config,
    definitions: {
      ...paths,
      pageStops: Object.fromEntries(
        config.routes.filter((x) => Object.keys(x.stops).length).map((x) => [x.id, x.stops])
      ),
      initialPoses: Object.fromEntries(config.routes.map((x) => [x.id, x.initialPose])),
      routeOrder: config.routes.map((x) => x.id),
    },
  };
}
const factories = [
  'site/engine/math.cjs',
  'site/scenes/world.cjs',
  'site/engine/projection.cjs',
  'site/engine/lifecycle.cjs',
  'site/engine/renderer.cjs',
];
function factory(root, name) {
  const file = path.join(root, name);
  delete require.cache[require.resolve(file)];
  const fn = require(file);
  if (typeof fn !== 'function') throw Error('Invalid native factory ' + name);
  return fn;
}
function sceneCompiler(root) {
  const file = path.join(root, 'tools/site/scene-assets.cjs');
  delete require.cache[require.resolve(file)];
  return require(file);
}
function model(root, definitions) {
  const math = factory(root, factories[0])();
  const compiler = sceneCompiler(root),
    sceneAsset = compiler.load(root);
  return {
    ...math,
    ...definitions,
    sceneAsset,
    ...factory(root, factories[1])(math),
    ...factory(root, factories[2])(math, definitions),
    ...factory(root, factories[4])(compiler.runtime(sceneAsset)),
  };
}
function runtime(root, definitions) {
  const [math, world, projection, lifecycle, renderer] = factories.map((name) =>
    factory(root, name).toString()
  );
  const compiler = sceneCompiler(root),
    art = compiler.runtime(compiler.load(root));
  return (
    '/* Generated from site/engine and site/scenes by tools/site/build.cjs. */\n(()=>{\n"use strict";\n' +
    `const math=(${math})();\nconst definitions=${scriptJSON(definitions)};\nconst world=(${world})(math);\nconst projection=(${projection})(math,definitions);\nconst renderer=(${renderer})(${scriptJSON(art)});\nconst api={...math,...definitions,...world,...projection,...renderer};\n` +
    `if(typeof module!=="undefined"&&module.exports)module.exports=api;\n(${lifecycle})(api);\n})();\n`
  );
}
function fallback(api, page) {
  // Keep the established bounded SVG rendition and exact coordinates.
  return require('./fallback.cjs').fromModel(api, page);
}
function render(root, route, input, api, measurement = '') {
  const c = catalog(root);
  return renderPage({
    route,
    input,
    measurement,
    templates: {
      head: read(root, 'site/templates/head.html'),
      shell: read(root, 'site/templates/shell.html'),
    },
    headerHTML: fragment(root, 'site/content/shared/header.json', c).html,
    footerHTML: fragment(root, 'site/content/shared/footer.json', c).html,
    fallbackHTML: fallback(api, route.id),
    routeLabel: contentLabel(c, 'route.' + route.id),
  });
}

function fileDigests(root, names) {
  return Object.fromEntries(
    names.sort().map((name) => [name, sha(fs.readFileSync(path.join(root, name)))])
  );
}
function runtimeVersion(components) {
  return sha(
    json({
      engine: components.engine,
      scenes: components.scenes,
      assets: components.assets,
      producer: components.producer,
      routes: components.routes,
      variant: components.variant,
      contract: components.contract,
    })
  );
}
function versionHTML(html, version, components) {
  const engine = runtimeVersion(components),
    media = components.assets;
  const headEnd = /<\/head[ \t\r\n]*>/g;
  if ([...html.matchAll(headEnd)].length !== 1) throw Error('Expected one document head');
  html = html.replace(
    headEnd,
    `  <meta name="site-engine" content="${engine}">\n  <meta name="site-route" content="${version}">\n  <meta name="site-contract" content="${components.contract}">\n  <meta name="site-variant" content="base">\n</head>`
  );
  for (const name of ['theme.js', 'space.js', 'archive.js', 'navigation.js', 'styles.css'])
    html = html.replaceAll(`="${name}"`, `="runtime/${engine}/${name}"`);
  for (const name of ['favicon.svg', 'vitalii-oborskyi-cutout.webp', 'vitalii-oborskyi.jpg'])
    html = html.replaceAll(`="assets/${name}"`, `="media/${media}/${name}"`);
  return html;
}
function snapshotHTML(html) {
  return html.replace(/\b(href|src)="([^"]+)"/g, (original, attribute, value) =>
    /^(?:https:|mailto:|#|data:)/.test(value) ? original : `${attribute}="../../${value}"`
  );
}
function retain(root, put) {
  const directory = path.join(root, 'site/retained'),
    names = files(directory);
  if (!names.length) return;
  const manifest = load(root, 'site/retained/manifest.json');
  if (
    manifest.schema !== 1 ||
    !manifest.files ||
    JSON.stringify(names.filter((x) => x !== 'manifest.json')) !==
      JSON.stringify(Object.keys(manifest.files).sort())
  )
    throw Error('Incomplete retained snapshot inputs');
  for (const [name, hash] of Object.entries(manifest.files)) {
    if (
      !/^(?:runtime|media|snapshots)\/[a-f0-9]{64}\/[a-z0-9.-]+$/.test(name) ||
      sha(fs.readFileSync(path.join(directory, name))) !== hash
    )
      throw Error('Invalid retained immutable file ' + name);
    put(name, fs.readFileSync(path.join(directory, name)));
  }
}
function fingerprints(root, config, c = catalog(root)) {
  const producers = files(path.join(root, 'tools/site'))
    .map((x) => 'tools/site/' + x)
    .concat('tools/build_scene_fallbacks.cjs');
  return {
    contract: config.contract,
    variant: sha(json({ id: 'base', contract: 1 })),
    producer: sha(json(fileDigests(root, producers))),
    engine: sha(
      json(
        fileDigests(
          root,
          files(path.join(root, 'site/engine')).map((x) => 'site/engine/' + x)
        )
      )
    ),
    scenes: sha(
      json(
        fileDigests(
          root,
          files(path.join(root, 'site/scenes')).map((x) => 'site/scenes/' + x)
        )
      )
    ),
    assets: sha(
      json(
        fileDigests(
          root,
          files(path.join(root, 'site/assets')).map((x) => 'site/assets/' + x)
        )
      )
    ),
    templates: sha(
      json({
        files: fileDigests(
          root,
          files(path.join(root, 'site/templates'))
            .filter((name) => !name.startsWith('pages/'))
            .map((x) => 'site/templates/' + x)
            .concat(
              files(path.join(root, 'site/content/shared')).map((x) => 'site/content/shared/' + x)
            )
        ),
        // Shared data resolves catalog labels; their rendered bytes are dependencies too.
        rendered: Object.fromEntries(
          files(path.join(root, 'site/content/shared'))
            .filter((name) => name.endsWith('.json'))
            .map((name) => [
              'site/content/shared/' + name,
              fragment(root, 'site/content/shared/' + name, c).html,
            ])
        ),
      })
    ),
    analytics: sha(
      json(
        fileDigests(root, [
          'site/analytics.json',
          ...files(path.join(root, 'site/integrations')).map((x) => 'site/integrations/' + x),
        ])
      )
    ),
    routes: sha(json(config)),
  };
}
function validCache(file) {
  try {
    const cache = JSON.parse(fs.readFileSync(file));
    return cache.schema === 1 && cache.routes && cache.files ? cache : null;
  } catch {
    return null;
  }
}
function outputLock(result) {
  return { schema: 1, components: result.components, routes: result.routes, files: result.files };
}
function finish(root, output, cacheFile, temporary, result, check, lockFile) {
  if (check) {
    const stale = [...new Set([...Object.keys(result.files), ...files(output)])].filter(
      (name) =>
        !Object.hasOwn(result.files, name) ||
        !fs.existsSync(path.join(output, name)) ||
        sha(fs.readFileSync(path.join(output, name))) !== result.files[name]
    );
    if (stale.length) throw Error('Generated-only output is stale: ' + stale.join(', '));
    if (
      !fs.existsSync(lockFile) ||
      read(root, 'site/output-lock.json') !== json(outputLock(result))
    )
      throw Error('Generated output lock is stale');
  } else {
    const backup = output + '.previous';
    if (fs.existsSync(backup)) throw Error('Unresolved previous generation ' + backup);
    if (fs.existsSync(output)) fs.renameSync(output, backup);
    try {
      fs.renameSync(temporary, output);
    } catch (error) {
      if (fs.existsSync(backup)) fs.renameSync(backup, output);
      throw error;
    }
    fs.rmSync(backup, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    fs.writeFileSync(cacheFile, json(result));
    fs.writeFileSync(lockFile, json(outputLock(result)));
  }
}
function build({
  root = defaultRoot,
  output = path.join(root, 'docs'),
  cacheFile = path.join(root, '.site-cache/build.json'),
  all = false,
  check = false,
  versioned = true,
} = {}) {
  const { config, definitions } = configuration(root),
    c = catalog(root),
    components = fingerprints(root, config, c);
  const measurement = require('./analytics.cjs').compile(
    root,
    config.routes.map((route) => route.url)
  );
  const previous = !all && !check ? validCache(cacheFile) : null;
  const lockFile = path.join(root, 'site/output-lock.json'),
    trusted = validCache(lockFile);
  const parent = path.dirname(output);
  fs.mkdirSync(parent, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(parent, '.site-build-'));
  const result = {
    schema: 1,
    built: [],
    reused: [],
    removed: [],
    components,
    routes: {},
    files: {},
  };
  const put = (name, bytes) => {
    const target = path.join(temporary, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
    result.files[name] = sha(bytes);
  };
  let api;
  try {
    for (const route of config.routes) {
      const input = routeInput(root, route, c),
        version = sha(
          json({
            components,
            route,
            inputs: fileDigests(root, input.inputs),
            records: input.records,
            discussions: input.discussions,
            schema: input.schema,
            rendered: sha(input.main),
            versioned,
          })
        );
      const old = previous?.routes[route.id],
        file = path.join(output, route.url);
      let html;
      if (
        old?.version === version &&
        trusted?.routes[route.id]?.version === version &&
        previous.files[route.url] === trusted.files[route.url] &&
        fs.existsSync(file) &&
        sha(fs.readFileSync(file)) === trusted.files[route.url]
      ) {
        html = fs.readFileSync(file, 'utf8');
        result.reused.push(route.id);
      } else {
        api ??= model(root, definitions);
        html = render(root, route, input, api, measurement.head);
        if (versioned) html = versionHTML(html, version, components);
        result.built.push(route.id);
      }
      put(route.url, html);
      result.routes[route.id] = {
        version,
        url: route.url,
        inputs: input.inputs,
        records: Object.keys(input.records),
      };
      if (versioned) {
        const name = `snapshots/${version}/${route.url}`;
        put(name, snapshotHTML(html));
        result.routes[route.id].snapshotSHA = result.files[name];
      }
    }
    for (const name of ['theme.js', 'archive.js', 'navigation.js'])
      put(name, read(root, 'site/engine/' + name));
    put(
      'styles.css',
      read(root, 'site/engine/styles.css') + '\n' + read(root, 'site/engine/reading-surfaces.css')
    );
    put('space.js', runtime(root, definitions));
    for (const name of files(path.join(root, 'site/assets')))
      put(
        name === 'nojekyll' ? '.nojekyll' : 'assets/' + name,
        fs.readFileSync(path.join(root, 'site/assets', name))
      );
    for (const [name, bytes] of Object.entries(measurement.assets)) put(name, bytes);
    if (versioned) {
      const engine = runtimeVersion(components);
      for (const name of ['theme.js', 'space.js', 'archive.js', 'navigation.js', 'styles.css'])
        put(`runtime/${engine}/${name}`, fs.readFileSync(path.join(temporary, name)));
      for (const name of files(path.join(root, 'site/assets')).filter((x) => x !== 'nojekyll'))
        put(
          `media/${components.assets}/${name}`,
          fs.readFileSync(path.join(root, 'site/assets', name))
        );
      const revision = {
        schema: 1,
        contract: components.contract,
        variant: { id: 'base', contract: 1, fingerprint: components.variant },
        engine,
        scenes: components.scenes,
        assets: components.assets,
        mediaFiles: require('./snapshot.cjs').mediaFiles,
        content: sha(
          json(
            Object.fromEntries(
              Object.entries(result.routes).map(([id, route]) => [id, route.version])
            )
          )
        ),
        routes: Object.fromEntries(
          Object.entries(result.routes).map(([id, route]) => [
            id,
            {
              version: route.version,
              url: `snapshots/${route.version}/${route.url}`,
              sha256: route.snapshotSHA,
            },
          ])
        ),
      };
      retain(root, put);
      put('site-revision.json', json(revision));
    }
    result.removed = files(output).filter((name) => !Object.hasOwn(result.files, name));
    finish(root, output, cacheFile, temporary, result, check, lockFile);
    return result;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 2 && args[0] === '--changed') {
    const r = cp.spawnSync('git', ['rev-parse', '--verify', args[1] + '^{commit}'], {
      cwd: defaultRoot,
      encoding: 'utf8',
    });
    if (r.status !== 0) throw Error('Invalid changed baseline');
  } else if (args.length > 1 || !['--all', '--check', undefined].includes(args[0]))
    throw Error('Usage: node tools/site/build.cjs [--all | --changed BASE | --check]');
  const result = build({ all: args[0] === '--all', check: args[0] === '--check' });
  console.log(
    JSON.stringify({ built: result.built, reused: result.reused, removed: result.removed })
  );
}
module.exports = {
  build,
  render,
  model,
  runtime,
  configuration,
  routeInput,
  catalog,
  catalogCounts,
  fingerprints,
  sha,
  files,
  validateFragment,
  scriptJSON,
  runtimeVersion,
  versionHTML,
  snapshotHTML,
  stableTagEndings,
};
