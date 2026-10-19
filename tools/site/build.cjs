'use strict';
// Curated fragments + JSON; native factories preserve the offline browser API.
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto'),
  cp = require('node:child_process');
const { catalog, catalogCounts, routeInput, fragment, validateFragment } = require('./content.cjs');
const { contentLabel } = require('./render-content.cjs');
const { scriptJSON, stableTagEndings } = require('./html.cjs');
const { renderPage, validateCriticalMedia } = require('./render-page.cjs');
const articles = require('./articles.cjs');
const defaultRoot = path.resolve(__dirname, '../..');
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const criticalMediaSource = 'site/engine/critical-media.css';
const criticalMediaMarker = '/* {{CRITICAL_MEDIA}} */\n';

function files(dir, base = dir, ignored = []) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .sort()
    .flatMap((name) => {
      if (ignored.includes(name)) return [];
      const file = path.join(dir, name),
        stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) throw Error('Symlink source/output: ' + file);
      return stat.isDirectory()
        ? files(file, base, ignored)
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
function render(root, route, input, api, measurement = '', fallbackHTML = null) {
  const c = catalog(root);
  return renderPage({
    route,
    input,
    measurement,
    criticalMediaCSS: route.id === 'index' ? read(root, criticalMediaSource) : '',
    templates: {
      head: read(root, 'site/templates/head.html'),
      shell: read(root, 'site/templates/shell.html'),
    },
    headerHTML: fragment(root, 'site/content/shared/header.json', c).html,
    footerHTML: fragment(root, 'site/content/shared/footer.json', c).html,
    fallbackHTML: fallbackHTML ?? fallback(api, route.id),
    routeLabel: contentLabel(c, 'route.' + route.id),
  });
}

function styles(root) {
  const source = read(root, 'site/engine/styles.css'),
    reading = read(root, 'site/engine/reading-surfaces.css'),
    critical = validateCriticalMedia(read(root, criticalMediaSource));
  if (source.split(criticalMediaMarker).length !== 2 || /\.portrait-media\b/.test(source + reading))
    throw Error('Expected one canonical critical media stylesheet include');
  return (
    source.replace(criticalMediaMarker, critical) +
    '\n' +
    reading +
    '\n' +
    read(root, 'site/engine/scroll-entry.css')
  );
}

function sceneMedia(root) {
  return files(path.join(root, 'site/assets')).filter((name) => !name.startsWith('publications/'));
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
    `  <meta name="site-engine" content="${engine}">\n  <meta name="site-route" content="${version}">\n  <meta name="site-contract" content="${components.contract}">\n  <meta name="site-article-renderer" content="1">\n  <meta name="site-variant" content="base">\n</head>`
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
      !require('./snapshot.cjs').immutable(name) ||
      sha(fs.readFileSync(path.join(directory, name))) !== hash
    )
      throw Error('Invalid retained immutable file ' + name);
    put(name, fs.readFileSync(path.join(directory, name)));
  }
}
function fingerprints(root, config, c = catalog(root)) {
  const producers = files(path.join(root, 'tools/site'))
    .map((x) => 'tools/site/' + x)
    .concat(
      'tools/build_scene_fallbacks.cjs',
      files(path.join(root, 'tools/publishing'), undefined, ['node_modules']).map(
        (x) => 'tools/publishing/' + x
      ),
      ['package.json', 'package-lock.json'].filter((name) => fs.existsSync(path.join(root, name)))
    );
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
          sceneMedia(root).map((x) => 'site/assets/' + x)
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
    pageTemplates: sha(
      json(
        fileDigests(
          root,
          files(path.join(root, 'site/templates/pages')).map(
            (name) => 'site/templates/pages/' + name
          )
        )
      )
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
  return {
    schema: 1,
    components: result.components,
    routes: result.routes,
    ...(Object.keys(result.articles || {}).length ? { articles: result.articles } : {}),
    files: result.files,
  };
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
    if (!fs.existsSync(lockFile) || fs.readFileSync(lockFile, 'utf8') !== json(outputLock(result)))
      throw Error('Generated output lock is stale');
  } else {
    require('./transaction.cjs').commitGeneration({
      output,
      temporary,
      cacheFile,
      lockFile,
      cacheBytes: json(result),
      lockBytes: json(outputLock(result)),
    });
  }
}
function documentComponents(components) {
  // Page templates are a platform-release admission boundary. Each document
  // already hashes only its own template inputs for ordinary incremental builds.
  const shared = { ...components };
  delete shared.pageTemplates;
  return shared;
}

function prepareArticles(root, selectedArticles, components, versioned, preview) {
  for (const article of selectedArticles) {
    article.input = articles.input(root, article);
    article.inputDigests = fileDigests(root, article.input.inputs);
    if (
      article.inputDigests[article.source.path] !== article.source.sha256 ||
      article.assets.some(
        (asset) => article.inputDigests[asset.path] !== (asset.sourceDigest || asset.digest)
      ) ||
      Object.values(article.adaptations || {}).some(
        (adaptation) => article.inputDigests[adaptation.source.path] !== adaptation.source.sha256
      )
    )
      throw Error('Article source changed during compilation');
    article.version = sha(
      json({
        components: documentComponents(components),
        key: article.key,
        inputs: article.inputDigests,
        rendered: sha(article.input.main),
        metadata: article.metadata,
        alternates: articles.alternates(article, selectedArticles).map((alternate) => ({
          language: alternate.metadata.language,
          url: alternate.url,
        })),
        preview,
        versioned,
      })
    );
    article.snapshot = `article-snapshots/${article.version}/${path.posix.basename(article.url)}`;
  }
  // Reciprocal translation links intentionally share a finite dependency group.
  // Unrelated publications never participate in another article's identity.
  const contentVersions = new Map(
    selectedArticles.map((article) => [article.key, article.version])
  );
  for (const article of selectedArticles) {
    const related = new Set([article]);
    for (const member of related)
      for (const alternate of articles.alternates(member, selectedArticles)) related.add(alternate);
    if (related.size > 1) {
      article.version = sha(
        json({
          contentVersion: contentVersions.get(article.key),
          translations: [...related]
            .map((member) => ({
              key: member.key,
              contentVersion: contentVersions.get(member.key),
            }))
            .sort((left, right) => left.key.localeCompare(right.key)),
        })
      );
      article.snapshot = `article-snapshots/${article.version}/${path.posix.basename(article.url)}`;
    }
  }
}

function emitArticles({
  root,
  config,
  definitions,
  components,
  selectedArticles,
  api,
  measurement,
  put,
  result,
  versioned,
  preview,
  previous,
  trusted,
  output,
  contentOnly,
}) {
  for (const article of selectedArticles) {
    const input = article.input;
    const version = article.version;
    if (!contentOnly) api ??= model(root, definitions);
    const fallbackResource = require('./fallback.cjs').articleResource(
      contentOnly ? baselineFallback(output, 'writing') : fallback(api, 'writing')
    );
    const reusable =
      previous?.articles?.[article.key]?.version === version &&
      trusted?.articles?.[article.key]?.version === version &&
      [article.url, article.snapshot].every(
        (name) =>
          previous.files[name] === trusted.files[name] &&
          fs.existsSync(path.join(output, name)) &&
          sha(fs.readFileSync(path.join(output, name))) === trusted.files[name]
      );
    if (reusable) {
      put(article.url, fs.readFileSync(path.join(output, article.url)));
      put(article.snapshot, fs.readFileSync(path.join(output, article.snapshot)));
      result.reusedArticles.push(article.key);
    } else {
      if (!contentOnly) api ??= model(root, definitions);
      let html = render(
        root,
        config.routes.find((route) => route.id === 'writing'),
        input,
        api,
        measurement.head,
        fallbackResource.html
      );
      if (versioned) html = versionHTML(html, version, components);
      html = articles.attachHead(html, article, selectedArticles, preview);
      // Hosted documents carry only their own boot identity. The first user
      // navigation pins the complete verified registry from site-revision.json.
      html = articles.documentIndex(html, [article]);
      const alias = articles.rebase(html, article.url);
      if (Buffer.byteLength(alias, 'utf8') > 100000)
        throw Error('Article HTML byte budget ' + article.key);
      put(article.url, alias);
      const snapshotBytes = articles.rebase(
        articles.immutableLinks(html, selectedArticles),
        article.snapshot
      );
      if (Buffer.byteLength(snapshotBytes, 'utf8') > 100000)
        throw Error('Article snapshot byte budget ' + article.key);
      put(article.snapshot, snapshotBytes);
      result.builtArticles.push(article.key);
    }
    for (const asset of article.assets) {
      if (asset.bytes.length > 2000000) throw Error('Article asset byte budget ' + asset.id);
      put(articles.assetName(asset), asset.bytes);
    }
    put(fallbackResource.name, fallbackResource.bytes);
    result.articles[article.key] = {
      version,
      url: article.url,
      snapshot: article.snapshot,
      sha256: result.files[article.snapshot],
      inputs: input.inputs,
      assets: [...article.assets.map(articles.assetName), fallbackResource.name],
      candidate: article.candidate,
      articleId: article.metadata.id,
      contentEdition: article.edition.id,
      sourceSha256: article.source.sha256,
      semanticSha256: article.edition.semanticSha256,
    };
  }
}

function emitRevision({ root, components, selectedArticles, result, temporary, put, preview }) {
  const engine = runtimeVersion(components);
  for (const name of ['theme.js', 'space.js', 'archive.js', 'navigation.js', 'styles.css'])
    put(`runtime/${engine}/${name}`, fs.readFileSync(path.join(temporary, name)));
  for (const name of sceneMedia(root).filter((x) => x !== 'nojekyll'))
    put(
      `media/${components.assets}/${name}`,
      fs.readFileSync(path.join(root, 'site/assets', name))
    );
  const revision = {
    schema: 1,
    contract: components.contract,
    navigation: { contract: 1, articleRenderer: 1 },
    variant: { id: 'base', contract: 1, fingerprint: components.variant },
    engine,
    scenes: components.scenes,
    assets: components.assets,
    mediaFiles: require('./snapshot.cjs').mediaFiles,
    content: sha(
      json(
        Object.fromEntries(
          [...Object.entries(result.routes), ...Object.entries(result.articles)].map(
            ([id, route]) => [id, route.version]
          )
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
    ...(selectedArticles.length
      ? {
          articles: Object.fromEntries(
            Object.entries(result.articles).map(([key, article]) => [
              key,
              {
                version: article.version,
                url: article.snapshot,
                sha256: article.sha256,
                alias: article.url,
                scene: 'writing',
                assets: article.assets,
                candidate: article.candidate,
                articleId: article.articleId,
                contentEdition: article.contentEdition,
                sourceSha256: article.sourceSha256,
                semanticSha256: article.semanticSha256,
              },
            ])
          ),
        }
      : {}),
    ...(preview ? { preview: true } : {}),
  };
  retain(root, put);
  put('site-revision.json', json(revision));
  if (Buffer.byteLength(json(revision), 'utf8') > 32000) throw Error('Revision byte budget');
}

function verifyArticleInputs(root, selectedArticles) {
  for (const article of selectedArticles)
    if (json(fileDigests(root, article.input.inputs)) !== json(article.inputDigests))
      throw Error('Article source changed during generation');
}

function baselineFallback(output, route) {
  const html = fs.readFileSync(path.join(output, route + '.html'), 'utf8');
  const matches = [...html.matchAll(/<svg\b[^>]*\bclass="space-fallback"[^>]*>[\s\S]*?<\/svg>/g)];
  if (matches.length !== 1) throw Error('Content baseline fallback is incomplete');
  return matches[0][0];
}

function verifyContentBaseline(output, previous, trusted, components, versioned) {
  if (
    !versioned ||
    !previous ||
    !trusted ||
    json(previous.components) !== json(components) ||
    json(trusted.components) !== json(components) ||
    json(previous.files) !== json(trusted.files)
  )
    throw Error('Content release requires a verified matching platform baseline');
  if (json(files(output)) !== json(Object.keys(trusted.files).sort()))
    throw Error('Content baseline public inventory differs');
  for (const [name, digest] of Object.entries(trusted.files))
    if (sha(fs.readFileSync(path.join(output, name))) !== digest)
      throw Error('Content baseline bytes differ: ' + name);
  const revision = require('./snapshot.cjs').verify(output, { files: trusted.files });
  if (revision.engine !== runtimeVersion(components) || revision.navigation?.articleRenderer !== 1)
    throw Error('Content baseline runtime contract differs');
}

function emitRoutes({
  root,
  config,
  definitions,
  catalog,
  components,
  selectedArticles,
  measurement,
  previous,
  trusted,
  contentOnly,
  versioned,
  preview,
  result,
  put,
  output,
}) {
  let api;
  for (const route of config.routes) {
    const input = routeInput(root, route, catalog);
    input.main = articles.listing(input.main, selectedArticles, route.id);
    const pageInputs = input.inputs.concat(route.id === 'index' ? [criticalMediaSource] : []),
      version = sha(
        json({
          components: documentComponents(components),
          route,
          inputs: fileDigests(root, pageInputs),
          records: input.records,
          discussions: input.discussions,
          schema: input.schema,
          rendered: sha(input.main),
          versioned,
          preview: preview,
          linkedArticles: selectedArticles
            .filter((article) => input.main.includes(`href="${article.url}`))
            .map((article) => ({ key: article.key, snapshot: article.snapshot })),
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
      if (!contentOnly) api ??= model(root, definitions);
      html = render(
        root,
        route,
        input,
        api,
        measurement.head,
        contentOnly ? baselineFallback(output, route.id) : null
      );
      if (versioned) html = versionHTML(html, version, components);
      html = articles.documentIndex(html, [], preview);
      result.built.push(route.id);
    }
    put(route.url, html);
    result.routes[route.id] = {
      version,
      url: route.url,
      inputs: pageInputs,
      records: Object.keys(input.records),
    };
    if (versioned) {
      const name = `snapshots/${version}/${route.url}`;
      put(name, snapshotHTML(articles.immutableLinks(html, selectedArticles)));
      result.routes[route.id].snapshotSHA = result.files[name];
    }
  }
  return api;
}

function retainContentBaseline(output, trusted, put) {
  for (const name of Object.keys(trusted.files).filter(require('./snapshot.cjs').immutable))
    put(name, fs.readFileSync(path.join(output, name)));
}

function build({
  root = defaultRoot,
  output = path.join(root, 'docs'),
  cacheFile = path.join(root, '.site-cache/build.json'),
  all = false,
  check = false,
  versioned = true,
  contentOnly = false,
  candidateArticles = [],
  lockFile = candidateArticles.length
    ? output + '.output-lock.json'
    : path.join(root, 'site/output-lock.json'),
} = {}) {
  if (candidateArticles.length && path.resolve(output) === path.join(root, 'docs'))
    throw Error('Candidate articles require an isolated preview output');
  const { config, definitions } = configuration(root),
    c = catalog(root),
    components = fingerprints(root, config, c);
  const selectedArticles = articles.select(root, candidateArticles, c);
  require('./validate-catalog.cjs').validateLocalCatalog(c, (id) =>
    selectedArticles.find((article) => article.metadata.id === id && !article.candidate)
  );
  prepareArticles(root, selectedArticles, components, versioned, candidateArticles.length > 0);
  const measurement = require('./analytics.cjs').compile(
    root,
    config.routes.map((route) => route.url)
  );
  const previous = !all && !check ? validCache(cacheFile) : null;
  const trusted = validCache(lockFile);
  if (contentOnly) verifyContentBaseline(output, previous, trusted, components, versioned);
  const parent = path.dirname(output);
  fs.mkdirSync(parent, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(parent, '.site-build-'));
  const result = {
    schema: 1,
    built: [],
    reused: [],
    builtArticles: [],
    reusedArticles: [],
    removed: [],
    components,
    routes: {},
    articles: {},
    files: {},
  };
  const put = (name, bytes) => {
    if (
      result.files[name] &&
      result.files[name] !== sha(bytes) &&
      require('./snapshot.cjs').immutable(name)
    )
      throw Error('Immutable content baseline collision: ' + name);
    const target = path.join(temporary, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
    result.files[name] = sha(bytes);
  };
  try {
    if (contentOnly) retainContentBaseline(output, trusted, put);
    const api = emitRoutes({
      root,
      config,
      definitions,
      catalog: c,
      components,
      selectedArticles,
      measurement,
      previous,
      trusted,
      contentOnly,
      versioned,
      preview: candidateArticles.length > 0,
      result,
      put,
      output,
    });
    emitArticles({
      root,
      config,
      definitions,
      components,
      selectedArticles,
      api,
      measurement,
      put,
      result,
      versioned,
      preview: candidateArticles.length > 0,
      previous,
      trusted,
      output,
      contentOnly,
    });
    if (contentOnly) {
      const platformFiles = ['theme.js', 'archive.js', 'navigation.js', 'styles.css', 'space.js'];
      for (const name of platformFiles) put(name, fs.readFileSync(path.join(output, name)));
    } else {
      for (const name of ['theme.js', 'archive.js']) put(name, read(root, 'site/engine/' + name));
      put(
        'navigation.js',
        `/* Shared native reading-entry controller. */\nwindow.SiteScrollEntry=(${factory(root, 'site/engine/scroll-entry.cjs').toString()})();\n` +
          read(root, 'site/engine/navigation.js')
      );
      put('styles.css', styles(root));
      put('space.js', runtime(root, definitions));
    }
    for (const name of sceneMedia(root)) {
      const target = name === 'nojekyll' ? '.nojekyll' : 'assets/' + name;
      put(
        target,
        fs.readFileSync(
          path.join(contentOnly ? output : root, contentOnly ? target : 'site/assets/' + name)
        )
      );
    }
    for (const [name, bytes] of Object.entries(measurement.assets))
      put(name, contentOnly ? fs.readFileSync(path.join(output, name)) : bytes);
    if (versioned)
      emitRevision({
        root,
        components,
        selectedArticles,
        result,
        temporary,
        put,
        preview: candidateArticles.length > 0,
      });
    result.removed = files(output).filter((name) => !Object.hasOwn(result.files, name));
    verifyArticleInputs(root, selectedArticles);
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
  const result = build({
    all: args[0] === '--all',
    check: args[0] === '--check',
  });
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
  outputLock,
};
