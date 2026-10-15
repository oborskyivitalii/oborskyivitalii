'use strict';
// Security-stage proof of maintained generated fields, never a secret-ledger rewrite.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto'),
  cp = require('node:child_process');
const root = path.resolve(__dirname, '../..'),
  authorities = new WeakMap(),
  hex = /(?<![a-zA-Z0-9])(?:[a-f0-9]{64}|[a-f0-9]{40})(?![a-zA-Z0-9])/g;
const digest = (bytes, algorithm = 'sha256') =>
  crypto.createHash(algorithm).update(bytes).digest('hex');
const key = (parts, property = false) => JSON.stringify([property, ...parts]);

function readRegular(projectRoot, relative) {
  assert.ok(
    typeof relative === 'string' &&
      relative !== '' &&
      !relative.includes('\\') &&
      !path.posix.isAbsolute(relative) &&
      relative.split('/').every((part) => part !== '' && part !== '.' && part !== '..'),
    'Unsafe generated checksum path'
  );
  let current = path.parse(path.resolve(projectRoot)).root;
  for (const part of path.resolve(projectRoot).slice(current.length).split(path.sep)) {
    current = path.join(current, part);
    assert.ok(!fs.lstatSync(current).isSymbolicLink(), 'Symlinked generated checksum root');
  }
  const parts = relative.split('/');
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    assert.ok(!stat.isSymbolicLink(), 'Symlinked generated checksum input');
    assert.ok(
      index === parts.length - 1 ? stat.isFile() && stat.size <= 20000000 : stat.isDirectory(),
      'Invalid generated checksum input'
    );
  }
  return fs.readFileSync(current);
}

function bind(fields, parts, value, property = false) {
  if (typeof value !== 'string') return;
  const token = JSON.stringify(value),
    spans = new Set();
  if (/^[a-f0-9]{64}$/.test(value)) spans.add(1);
  else {
    const match = token.match(
      /^"(?:site\/)?(?:runtime|media|article-media|snapshots|article-snapshots)\/([a-f0-9]{64})\//
    );
    if (match) spans.add(match[0].indexOf(match[1]));
  }
  fields.set(key(parts, property), { value, spans });
}

function revisionFields(revision) {
  const fields = new Map();
  for (const name of ['engine', 'scenes', 'assets', 'content'])
    bind(fields, [name], revision[name]);
  bind(fields, ['variant', 'fingerprint'], revision.variant?.fingerprint);
  for (const [id, route] of Object.entries(revision.routes || {})) {
    for (const name of ['version', 'sha256', 'url'])
      bind(fields, ['routes', id, name], route[name]);
  }
  for (const [id, article] of Object.entries(revision.articles || {})) {
    for (const name of ['version', 'sha256', 'url', 'sourceSha256', 'semanticSha256'])
      bind(fields, ['articles', id, name], article[name]);
    for (const [index, asset] of (article.assets || []).entries())
      bind(fields, ['articles', id, 'assets', index], asset);
  }
  return fields;
}

function lockFields(lock) {
  const fields = new Map();
  for (const name of [
    'variant',
    'producer',
    'engine',
    'scenes',
    'assets',
    'templates',
    'pageTemplates',
    'analytics',
    'routes',
  ])
    bind(fields, ['components', name], lock.components?.[name]);
  for (const [id, route] of Object.entries(lock.routes || {})) {
    for (const name of ['version', 'snapshotSHA']) bind(fields, ['routes', id, name], route[name]);
  }
  for (const [id, article] of Object.entries(lock.articles || {})) {
    for (const name of ['version', 'sha256', 'snapshot', 'sourceSha256', 'semanticSha256'])
      bind(fields, ['articles', id, name], article[name]);
    for (const [index, asset] of (article.assets || []).entries())
      bind(fields, ['articles', id, 'assets', index], asset);
  }
  for (const [file, checksum] of Object.entries(lock.files || {})) {
    bind(fields, ['files', file], checksum);
    bind(fields, ['files', file], file, true);
  }
  return fields;
}

function jsonSpans(text, fields, embedded = () => new Set()) {
  const tokens = [...text.matchAll(/"(?:[^"\\]|\\.)*"/g)];
  const spans = new Set();
  let index = 0;
  function string(value, parts, property = false) {
    const token = tokens[index++];
    assert.equal(JSON.parse(token[0]), value, 'Generated JSON token identity');
    const expected = fields.get(key(parts, property));
    const nested = property ? new Set() : embedded(value, parts);
    for (const match of token[0].matchAll(hex))
      if ((expected?.value === value && expected.spans.has(match.index)) || nested.has(match[0]))
        spans.add(token.index + match.index);
  }
  function visit(value, parts = []) {
    if (typeof value === 'string') string(value, parts);
    else if (Array.isArray(value)) value.forEach((child, i) => visit(child, [...parts, i]));
    else if (value && typeof value === 'object')
      for (const [name, child] of Object.entries(value)) {
        string(name, [...parts, name], true);
        visit(child, [...parts, name]);
      }
  }
  visit(JSON.parse(text));
  assert.equal(index, tokens.length, 'Generated JSON token coverage');
  return spans;
}

function approvedValues(text, spans) {
  const result = new Map();
  for (const match of text.matchAll(hex)) {
    if (!result.has(match[0])) result.set(match[0], true);
    if (!spans.has(match.index)) result.set(match[0], false);
  }
  return new Set([...result].filter(([, approved]) => approved).map(([value]) => value));
}

function checksumRecord(text, spans) {
  const values = approvedValues(text, spans),
    locations = new Map();
  for (const match of text.matchAll(hex)) {
    if (!values.has(match[0])) continue;
    const id = digest(match[0], 'sha1');
    if (!locations.has(id)) locations.set(id, new Set());
    locations.get(id).add(text.slice(0, match.index).split('\n').length);
  }
  return { text, locations };
}

function editionFields(edition, source, baseEdition) {
  const fields = new Map();
  bind(fields, ['source', 'sha256'], source.sha256);
  bind(fields, ['semanticSha256'], edition.semanticSha256);
  if (source.state === 'committed')
    for (const name of ['commit', 'blob']) {
      assert.match(source[name], /^[a-f0-9]{40}$/, 'Verified local Git source identity');
      fields.set(key(['source', name]), {
        value: source[name],
        spans: new Set([1]),
      });
    }
  if (baseEdition) {
    bind(fields, ['derivation', 'baseSourceSha256'], baseEdition.source.sha256);
    bind(fields, ['derivation', 'baseSemanticSha256'], baseEdition.semanticSha256);
  }
  return fields;
}

const gitRouting = [
  'GIT_DIR',
  'GIT_WORK_TREE',
  'GIT_COMMON_DIR',
  'GIT_INDEX_FILE',
  'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_NAMESPACE',
  'GIT_PREFIX',
];
const unsafeGitEnvironment = (variable) =>
  gitRouting.includes(variable.toUpperCase()) || /^GIT_CONFIG(?:$|_)/i.test(variable);
function gitEnvironment() {
  const environment = {
    ...process.env,
    GIT_NO_LAZY_FETCH: '1',
    GIT_NO_REPLACE_OBJECTS: '1',
  };
  for (const variable of Object.keys(environment))
    if (unsafeGitEnvironment(variable)) delete environment[variable];
  return environment;
}

function publicationGit(projectRoot, args, { missing = false, maxBuffer = 1024 * 1024 } = {}) {
  const result = cp.spawnSync('git', ['--no-replace-objects', ...args], {
    cwd: projectRoot,
    env: gitEnvironment(),
    maxBuffer,
    timeout: 10000,
  });
  if (missing && result.status === 128) return null;
  assert.equal(result.status, 0, 'Unable to verify local publication Git history');
  return result.stdout;
}

function selectedEditions(article) {
  return [
    { edition: article.edition, source: article.source },
    ...Object.values(article.adaptations).map((adaptation) => ({
      ...adaptation,
      baseEdition: article.edition,
    })),
  ];
}

function materializePublication(projectRoot, snapshot, commit, id, seen) {
  if (seen.has(id)) return;
  seen.add(id);
  assert.ok(
    seen.size <= require('../site/articles.cjs').maximumArticles,
    'Bounded historical publication dependencies'
  );
  const directory = 'site/publications/' + id;
  const metadata = require('../publishing/article.cjs').validateMetadata(
    JSON.parse(
      publicationGit(projectRoot, [
        'show',
        commit + ':' + directory + '/publication.json',
      ]).toString('utf8')
    ),
    id
  );
  const entries = publicationGit(projectRoot, [
    'ls-tree',
    '-r',
    '-z',
    commit,
    '--',
    directory,
    'site/publications/policy.json',
  ])
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  for (const entry of entries) {
    const match = entry.match(/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/);
    assert.ok(match, 'Historical publication inputs must be regular Git data');
    const relative = match[3];
    assert.ok(
      relative.split('/').every((part) => part && part !== '.' && part !== '..'),
      'Unsafe historical publication input'
    );
    const bytes = publicationGit(projectRoot, ['cat-file', 'blob', match[2]], {
      maxBuffer: 32000000,
    });
    const target = path.join(snapshot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  }
  let assetBytes = 0;
  for (const asset of metadata.assets) {
    assert.ok(
      asset.path.startsWith('site/assets/publications/' + id + '/') &&
        asset.path.split('/').every((part) => part && part !== '.' && part !== '..'),
      'Historical asset remains in its local owner'
    );
    const entry = publicationGit(projectRoot, ['ls-tree', '-z', commit, '--', asset.path]).toString(
      'utf8'
    );
    const match = entry.match(/^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)\0$/);
    assert.ok(
      match && match[3] === asset.path,
      'Historical asset must be its exact regular Git blob'
    );
    const bytes = publicationGit(projectRoot, ['cat-file', 'blob', match[2]], {
      maxBuffer: 5000000,
    });
    assetBytes += bytes.length;
    assert.ok(assetBytes <= 16000000, 'Existing historical article asset aggregate bound');
    const target = path.join(snapshot, asset.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  }
  if (metadata.translationOf)
    materializePublication(projectRoot, snapshot, commit, metadata.translationOf.articleId, seen);
}

function historicalSnapshot(projectRoot, commit, id, cache) {
  if (cache.has(commit)) {
    const existing = cache.get(commit);
    materializePublication(projectRoot, existing.directory, commit, id, existing.ids);
    return existing.directory;
  }
  const snapshot = fs.mkdtempSync(
    path.join(require('node:os').tmpdir(), 'publication-checksum-history-')
  );
  const ids = new Set();
  cache.set(commit, { directory: snapshot, ids });
  cp.execFileSync(
    'git',
    [
      '-c',
      'core.hooksPath=/dev/null',
      'clone',
      '--shared',
      '--no-checkout',
      '--template=',
      '--quiet',
      projectRoot,
      snapshot,
    ],
    {
      env: gitEnvironment(),
      stdio: 'pipe',
      timeout: 10000,
    }
  );
  publicationGit(snapshot, [
    '-c',
    'core.hooksPath=/dev/null',
    'config',
    'core.hooksPath',
    '/dev/null',
  ]);
  publicationGit(snapshot, ['-c', 'core.hooksPath=/dev/null', 'update-ref', 'HEAD', commit]);
  materializePublication(projectRoot, snapshot, commit, id, ids);
  return snapshot;
}

function historicalPublication(projectRoot, id, file, bytes, cache, histories) {
  const directory = 'site/publications/' + id;
  const record = JSON.parse(bytes.toString('utf8'));
  if (record.source?.commit === null || record.source?.blob === null) return null;
  if (!histories.has(id))
    histories.set(
      id,
      publicationGit(projectRoot, [
        'rev-list',
        '--full-history',
        '--topo-order',
        'HEAD',
        '--',
        directory + '/editions',
        directory + '/publication-events',
        directory + '/publication.json',
      ])
        .toString('utf8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .reverse()
    );
  const contexts = new Set();
  for (const commit of histories.get(id)) {
    const stored = publicationGit(projectRoot, ['show', commit + ':' + file], {
      missing: true,
    });
    if (!stored?.equals(bytes)) continue;
    const metadataBytes = publicationGit(
      projectRoot,
      ['show', commit + ':' + directory + '/publication.json'],
      { missing: true }
    );
    if (!metadataBytes) continue;
    const context = digest(metadataBytes);
    if (contexts.has(context)) continue;
    contexts.add(context);
    const metadata = require('../publishing/article.cjs').validateMetadata(
      JSON.parse(metadataBytes.toString('utf8')),
      id
    );
    const editionId = path.posix.basename(file, '.json');
    if (
      metadata.edition !== editionId &&
      !Object.values(metadata.platforms).some(
        (platform) => platform.mode === 'adaptation' && platform.edition === editionId
      )
    )
      continue;
    const snapshot = historicalSnapshot(projectRoot, commit, id, cache);
    assert.ok(readRegular(snapshot, file).equals(bytes), 'Historical edition bytes differ');
    // Historical files are inert input; only the CURRENT imported publisher executes.
    const article = require('../publishing/article.cjs').loadArticle(snapshot, id);
    const selection = selectedEditions(article).find((entry) => entry.edition.id === editionId);
    assert.equal(
      selection?.source.state,
      'committed',
      'Historical edition requires committed local source'
    );
    return selection;
  }
  return null;
}

// Strict publisher models prove local bytes, semantics, assets and profile launch sources.
// References, rights and arbitrary evidence checksums never enter this field set.
function collectPublicationChecksumFields(projectRoot, read) {
  assert.ok(
    Object.keys(process.env).every(
      (variable) => !unsafeGitEnvironment(variable) || !process.env[variable]
    ),
    'Inherited Git routing cannot establish a local publication proof'
  );
  const publisher = require('../publishing/article.cjs'),
    result = new Map(),
    historical = new Map(),
    histories = new Map();
  const ids = publisher.enumerateArticles(projectRoot);
  assert.ok(
    ids.length <= require('../site/articles.cjs').maximumArticles,
    'Bounded publication checksum inventory'
  );
  function record(file, fields) {
    const text = read(file);
    result.set(file, checksumRecord(text, jsonSpans(text, fields)));
  }
  try {
    for (const id of ids) {
      const article = publisher.loadArticle(projectRoot, id),
        directory = 'site/publications/' + id;
      record(
        directory + '/editions/' + article.edition.id + '.json',
        editionFields(article.edition, article.source)
      );
      for (const adaptation of Object.values(article.adaptations))
        record(
          directory + '/editions/' + adaptation.edition.id + '.json',
          editionFields(adaptation.edition, adaptation.source, article.edition)
        );
      const assets = new Map();
      for (const [index, asset] of article.assets.entries())
        bind(assets, ['assets', index, 'sha256'], digest(asset.bytes));
      if (article.presentation)
        bind(assets, ['presentation', 'pdf', 'sha256'], digest(article.presentation.file.bytes));
      if (article.metadata.translationOf)
        bind(
          assets,
          ['translationOf', 'sourceSha256'],
          article.metadata.translationOf.sourceSha256
        );
      record(directory + '/publication.json', assets);
      const profile = new Map();
      bind(profile, ['launch', 'sha256'], digest(article.launch.bytes));
      record(directory + '/profile.json', profile);
      const editions = fs.readdirSync(path.join(projectRoot, directory, 'editions'));
      assert.ok(editions.length <= 200, 'Publication edition inventory exceeds its existing bound');
      for (const name of editions) {
        const file = directory + '/editions/' + name;
        if (result.has(file)) continue;
        const selected = historicalPublication(
          projectRoot,
          id,
          file,
          readRegular(projectRoot, file),
          historical,
          histories
        );
        if (selected)
          record(file, editionFields(selected.edition, selected.source, selected.baseEdition));
      }
    }
  } finally {
    for (const snapshot of historical.values())
      fs.rmSync(snapshot.directory, { recursive: true, force: true });
  }
  return result;
}

function payloadSpans(text, revision, resources) {
  const payload = JSON.parse(text),
    fields = new Map();
  for (const [field, expected] of revisionFields(revision)) {
    const [property, ...parts] = JSON.parse(field);
    bind(fields, ['revision', ...parts], expected.value, property);
  }
  for (const id of Object.keys(payload.revision?.routes || {})) {
    if (revision.routes?.[id] && typeof payload.pages?.[id] === 'string')
      bind(fields, ['revision', 'routes', id, 'sha256'], digest(payload.pages[id]));
  }
  return jsonSpans(text, fields, (html, parts) => {
    if (parts.length !== 2 || parts[0] !== 'pages') return new Set();
    const id = parts[1],
      descriptor = revision.routes?.[id] || revision.articles?.[id.replace(/^article:/, '')];
    return descriptor
      ? approvedValues(html, htmlSpans(html, revision, descriptor.version, resources))
      : new Set();
  });
}

function emittedResource(element, attribute, kind) {
  return (
    (element === 'script' && attribute.startsWith('src=') && kind === 'runtime') ||
    (element === 'link' && attribute.startsWith('href=') && ['runtime', 'media'].includes(kind)) ||
    (['img', 'source'].includes(element) &&
      attribute.startsWith('src=') &&
      ['media', 'article-media'].includes(kind)) ||
    (element === 'a' &&
      attribute.startsWith('href=') &&
      ['article-media', 'article-snapshots'].includes(kind))
  );
}

function resourceSpans(tag, resources) {
  const spans = new Set(),
    element = tag.match(/^<(script|link|img|source|a)\b/i)?.[1]?.toLowerCase();
  if (!element) return spans;
  for (const attribute of tag
    .slice(0, tag.indexOf('>') + 1)
    .matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = attribute[1].replace(/^(?:\.\.\/)+|^\.\//, '');
    const match = url.match(/^(runtime|media|article-media|article-snapshots)\/([a-f0-9]{64})\//);
    if (match && emittedResource(element, attribute[0], match[1]) && resources.has(url))
      spans.add(
        attribute.index +
          attribute[0].indexOf(attribute[1]) +
          attribute[1].indexOf(url) +
          match[0].indexOf(match[2])
      );
  }
  return spans;
}

function documentSpans(text, revision) {
  const fields = new Map();
  for (const [id, article] of Object.entries(revision.articles || {}))
    bind(fields, [id, 'snapshot'], article.url);
  return jsonSpans(text, fields);
}

function htmlSpans(text, revision, version, resources) {
  const spans = new Set();
  // Treat comments and raw-text elements as complete tokens; metadata-looking prose is inert.
  const tags = new RegExp(
    '<!--[\\s\\S]*?-->|<(script|style|textarea|title)\\b[^>]*>[\\s\\S]*?</\\1\\s*>|<[^>]+>',
    'gi'
  );
  let head = false;
  for (const token of text.matchAll(tags)) {
    const tag = token[0];
    if (/^<head(?:\s|>)/i.test(tag)) head = true;
    if (/^<\/head\s*>/i.test(tag)) head = false;
    const meta = tag.match(
      /^<meta name="(site-engine|site-route)" content="([a-f0-9]{64})"\s*\/?\s*>$/
    );
    if (head && meta && meta[2] === (meta[1] === 'site-engine' ? revision.engine : version))
      spans.add(token.index + tag.indexOf(meta[2]));
    for (const position of resourceSpans(tag, resources)) spans.add(token.index + position);
    const script = tag.match(
      /^<script type="application\/json" id="(site-pages|site-documents)">([\s\S]*?)<\/script>$/
    );
    if (script) {
      const nested =
        script[1] === 'site-pages'
          ? payloadSpans(script[2], revision, resources)
          : documentSpans(script[2], revision);
      const offset = token.index + tag.indexOf('>') + 1;
      for (const position of nested) spans.add(offset + position);
    }
  }
  return spans;
}

// Pure fixture seam: field collection alone never creates an admission authority.
function collectChecksumFields({ lock, revision, previews, bundle, read, readBytes = read }) {
  const result = new Map(),
    resources = new Set(
      Object.keys(lock.files).filter(
        (file) =>
          file.startsWith('runtime/' + revision.engine + '/') ||
          file.startsWith('media/' + revision.assets + '/') ||
          file.startsWith('article-media/')
      )
    );
  const documents = new Map();
  for (const [id, route] of Object.entries(revision.routes)) {
    documents.set(id + '.html', route.version);
    documents.set(route.url, route.version);
  }
  for (const article of Object.values(revision.articles || {})) {
    documents.set(article.alias, article.version);
    documents.set(article.url, article.version);
    resources.add(article.url);
  }
  function record(file, spans) {
    result.set(file, checksumRecord(read(file), spans));
  }
  record('site/output-lock.json', jsonSpans(read('site/output-lock.json'), lockFields(lock)));
  record(
    'docs/site-revision.json',
    jsonSpans(read('docs/site-revision.json'), revisionFields(revision))
  );
  for (const [file, version] of documents)
    record('docs/' + file, htmlSpans(read('docs/' + file), revision, version, resources));
  for (const [file, html] of Object.entries(previews)) {
    if (!file.endsWith('.html')) continue;
    const route = file.match(
      /^review\/site-v1-20261004-v11-(?:(research|writing|talks|credits)-)?(?:day|night|interactive)\.html$/
    );
    if (route)
      record(
        file,
        htmlSpans(html, revision, revision.routes[route[1] || 'index'].version, resources)
      );
  }
  const manifestFile = 'review/site-v1-static-previews-v11.json',
    manifest = JSON.parse(read(manifestFile)),
    fields = new Map();
  const sources = [
    'docs/site-revision.json',
    'docs/assets/favicon.svg',
    'docs/styles.css',
    'docs/assets/vitalii-oborskyi-cutout.webp',
    ...['theme', 'space', 'archive', 'navigation'].map((name) => 'docs/' + name + '.js'),
    ...Object.keys(revision.routes).map((id) => 'docs/' + id + '.html'),
  ];
  for (const file of sources) bind(fields, ['sources', file], digest(readBytes(file)));
  for (const [file, html] of Object.entries(previews))
    if (file.endsWith('.html')) bind(fields, ['files', file], digest(html));
  for (const file of Object.keys(manifest.evidence || {}))
    if (file === 'review/site-v1-20261004-v11-captures/captures.json')
      bind(fields, ['evidence', file], digest(readBytes(file)));
  record(manifestFile, jsonSpans(read(manifestFile), fields));
  const bundleFields = new Map();
  bind(bundleFields, ['zip_sha256'], bundle.zip_sha256);
  for (const [file, checksum] of Object.entries(bundle.entries)) {
    bind(bundleFields, ['entries', file], checksum);
    bind(bundleFields, ['entries', file], file, true);
  }
  const bundleFile = 'review/site-v1-offline-bundle-v11.json';
  record(bundleFile, jsonSpans(read(bundleFile), bundleFields));
  return result;
}

function sourceIdentity(projectRoot) {
  const builder = require(path.join(projectRoot, 'tools/site/build.cjs'));
  const files = ['site', 'tools/site', 'tools/publishing'].flatMap((directory) =>
    builder
      .files(path.join(projectRoot, directory), undefined, ['node_modules'])
      .map((file) => directory + '/' + file)
  );
  files.push(
    'tools/build_scene_fallbacks.cjs',
    'tools/build_site_previews.cjs',
    'tools/build_site_bundle.py'
  );
  for (const file of ['package.json', 'package-lock.json', 'tools/quality/generated-checksums.cjs'])
    if (fs.existsSync(path.join(projectRoot, file))) files.push(file);
  const captures = 'review/site-v1-20261004-v11-captures';
  for (const file of builder.files(path.join(projectRoot, captures)))
    files.push(captures + '/' + file);
  return digest(
    JSON.stringify([
      publicationGit(projectRoot, ['rev-parse', 'HEAD^{commit}', 'HEAD^{tree}']).toString('utf8'),
      files.sort().map((file) => [file, digest(readRegular(projectRoot, file))]),
    ])
  );
}

function proveGeneratedChecksums(projectRoot = root) {
  projectRoot = path.resolve(projectRoot);
  const readBytes = (file) => readRegular(projectRoot, file),
    read = (file) => {
      const bytes = readBytes(file),
        text = bytes.toString('utf8');
      assert.ok(Buffer.from(text).equals(bytes), 'Invalid UTF-8 generated checksum input');
      return text;
    };
  read('site/output-lock.json');
  const source = sourceIdentity(projectRoot);
  const builder = require(path.join(projectRoot, 'tools/site/build.cjs'));
  builder.build({ root: projectRoot, check: true });
  const previews = require(path.join(projectRoot, 'tools/build_site_previews.cjs')).buildPreviews();
  for (const [file, expected] of Object.entries(previews))
    assert.equal(read(file), expected, 'Stale generated checksum preview');
  cp.execFileSync('python', ['tools/build_site_bundle.py', '--check'], {
    cwd: projectRoot,
    stdio: 'pipe',
    maxBuffer: 1024 * 1024,
  });
  const collected = collectChecksumFields({
    lock: JSON.parse(read('site/output-lock.json')),
    revision: JSON.parse(read('docs/site-revision.json')),
    previews,
    bundle: JSON.parse(read('review/site-v1-offline-bundle-v11.json')),
    read,
    readBytes,
  });
  for (const [file, record] of collectPublicationChecksumFields(projectRoot, read))
    collected.set(file, record);
  const proved = new Map(),
    privateFiles = new Map();
  for (const [file, record] of collected) {
    proved.set(file, new Set(record.locations.keys()));
    privateFiles.set(file, {
      locations: record.locations,
      sha256: digest(readBytes(file)),
    });
  }
  const proof = {
    proved,
    detail: {
      files: proved.size,
      checksumIds: [...proved.values()].reduce((sum, ids) => sum + ids.size, 0),
    },
  };
  assert.equal(
    sourceIdentity(projectRoot),
    source,
    'Generated checksum source changed during proof'
  );
  authorities.set(proof, { projectRoot, files: privateFiles, source });
  return proof;
}

function verifiedGeneratedChecksumFinding(file, finding, proof) {
  const authority = authorities.get(proof),
    record = authority?.files.get(file);
  if (
    !record ||
    finding.type !== 'Hex High Entropy String' ||
    !Number.isInteger(finding.line_number) ||
    !record.locations.get(finding.hashed_secret)?.has(finding.line_number)
  )
    return false;
  return (
    sourceIdentity(authority.projectRoot) === authority.source &&
    digest(readRegular(authority.projectRoot, file)) === record.sha256
  );
}

const findingKey = (file, finding) =>
  JSON.stringify([file, finding.type, finding.hashed_secret, finding.line_number]);

function validateAuthority(authority) {
  assert.ok(authority, 'Unverified generated checksum proof');
  assert.equal(
    sourceIdentity(authority.projectRoot),
    authority.source,
    'Stale generated checksum source'
  );
  for (const [file, record] of authority.files)
    assert.equal(
      digest(readRegular(authority.projectRoot, file)),
      record.sha256,
      'Stale generated checksum bytes'
    );
}

function admitGeneratedChecksumFindings(results, proof) {
  const authority = authorities.get(proof),
    admitted = new Set();
  validateAuthority(authority);
  for (const [file, findings] of Object.entries(results)) {
    const record = authority.files.get(file);
    if (!record) continue;
    for (const finding of findings)
      if (
        finding.type === 'Hex High Entropy String' &&
        Number.isInteger(finding.line_number) &&
        record.locations.get(finding.hashed_secret)?.has(finding.line_number)
      )
        admitted.add(findingKey(file, finding));
  }
  validateAuthority(authority);
  return admitted;
}

module.exports = {
  proveGeneratedChecksums,
  verifiedGeneratedChecksumFinding,
  collectChecksumFields,
  collectPublicationChecksumFields,
  admitGeneratedChecksumFindings,
  findingKey,
};
