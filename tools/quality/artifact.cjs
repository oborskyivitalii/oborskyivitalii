'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto'),
  zlib = require('node:zlib'),
  cp = require('node:child_process');
const budgets = require('./budgets.json'),
  root = path.resolve(__dirname, '../..');
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function entries(dir, base = dir) {
  return fs
    .readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const file = path.join(dir, name),
        stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) throw Error('Symlink in public artifact');
      return stat.isDirectory()
        ? entries(file, base)
        : [
            {
              path: path.relative(base, file).split(path.sep).join('/'),
              bytes: fs.readFileSync(file),
            },
          ];
    });
}
function manifest(dir) {
  const files = Object.fromEntries(
    entries(dir).map((x) => [
      x.path,
      { sha256: digest(x.bytes), raw: x.bytes.length, gzip: zlib.gzipSync(x.bytes).length },
    ])
  );
  return { files, artifactDigest: digest(JSON.stringify(files)) };
}
function checkSize(dir) {
  const m = manifest(dir),
    rows = [];
  for (const route of budgets.routes) {
    const file = route + '.html',
      html = fs.readFileSync(path.join(dir, file), 'utf8'),
      svg = html.match(/<svg class="space-fallback"[\s\S]*?<\/svg>/)?.[0];
    if (!svg) throw Error('Missing static fallback ' + route);
    const nodes = (svg.match(/<[a-z][\w-]*(?:\s|>)/gi) || []).length;
    if (m.files[file].raw > budgets.htmlRawBytes || nodes > budgets.svgElements)
      throw Error('Size budget ' + route);
    const assets = [
      'styles.css',
      'theme.js',
      'space.js',
      'archive.js',
      'navigation.js',
      'assets/favicon.svg',
      ...(m.files['publication-index.json'] ? ['publication-index.json'] : []),
      ...(route === 'index' ? ['assets/vitalii-oborskyi-cutout.webp'] : []),
    ];
    const transfer = m.files[file].gzip + assets.reduce((n, f) => n + m.files[f].gzip, 0);
    if (transfer > budgets.routeGzipBytes) throw Error('Route transfer ' + route);
    rows.push({
      route,
      ...m.files[file],
      svgNodes: nodes,
      totalGzipBytes: transfer,
    });
  }
  for (const [file, info] of Object.entries(m.files)) {
    if (file.endsWith('.html') && info.raw > budgets.htmlRawBytes) throw Error('HTML size ' + file);
    if (!file.endsWith('.html') && info.raw > budgets.assetRawBytes)
      throw Error('Asset size ' + file);
  }
  const revision = JSON.parse(fs.readFileSync(path.join(dir, 'site-revision.json'), 'utf8'));
  const articleRows = Object.entries(revision.articles || {}).map(([key, descriptor]) => {
    const html = fs.readFileSync(path.join(dir, descriptor.alias), 'utf8');
    const downloads = require('../staging/reader-snapshot.cjs').downloads(
      descriptor,
      html,
      (name) => fs.readFileSync(path.join(dir, name))
    );
    const svg = html.match(/<svg class="space-fallback"[\s\S]*?<\/svg>/)?.[0];
    if (!svg) throw Error('Missing article fallback ' + key);
    let svgNodes = (svg.match(/<[a-z][\w-]*(?:\s|>)/gi) || []).length;
    const fallback = svg.match(/<use href="(?:\.\.\/)*([^"#]+)#writing-fallback"><\/use>/)?.[1];
    if (fallback) {
      if (!descriptor.assets.includes(fallback)) throw Error('Undeclared article fallback');
      const content = require('../staging/reader-snapshot.cjs').resourceContent(
        fallback,
        fs.readFileSync(path.join(dir, fallback))
      );
      svgNodes += 1 + (content.match(/<[a-z][\w-]*(?:\s|>)/gi) || []).length;
    }
    const assets = [
      'styles.css',
      'theme.js',
      'space.js',
      'archive.js',
      'navigation.js',
      'assets/favicon.svg',
      ...(m.files['publication-index.json'] ? ['publication-index.json'] : []),
      ...descriptor.assets,
    ];
    const totalGzipBytes =
      m.files[descriptor.alias].gzip +
      assets.reduce((total, file) => {
        if (!m.files[file]) throw Error('Missing article size dependency ' + file);
        return total + (downloads.includes(file) ? 0 : m.files[file].gzip);
      }, 0);
    if (svgNodes > budgets.svgElements || totalGzipBytes > budgets.routeGzipBytes)
      throw Error('Article transfer size ' + key);
    return {
      key,
      alias: descriptor.alias,
      ...m.files[descriptor.alias],
      svgNodes,
      assets,
      downloads,
      downloadGzipBytes: downloads.reduce((total, file) => total + m.files[file].gzip, 0),
      totalGzipBytes,
    };
  });
  return { schema: 1, kind: 'sizes', pass: true, ...m, rows, articleRows };
}

function validateArticleSizes(sizes, record) {
  const aliases = Object.keys(record.files)
    .filter((file) => /^articles\/[^/]+\.html$/.test(file))
    .sort();
  const rows = sizes.articleRows || [];
  if (JSON.stringify(rows.map((row) => row.alias).sort()) !== JSON.stringify(aliases))
    throw Error('Missing, extra or duplicate article size evidence');
  const descriptors = record.components?.articles || {};
  for (const row of rows) {
    const descriptor = descriptors[row.key];
    const file = record.files[row.alias];
    if (
      !descriptor ||
      descriptor.alias !== row.alias ||
      row.sha256 !== file.sha256 ||
      row.raw !== file.raw ||
      row.gzip !== file.gzip ||
      !Number.isInteger(row.svgNodes) ||
      row.svgNodes < 1 ||
      row.svgNodes > budgets.svgElements ||
      row.raw > budgets.htmlRawBytes
    )
      throw Error('Wrong-source or oversized article evidence ' + row.key);
    const assets = [
      'styles.css',
      'theme.js',
      'space.js',
      'archive.js',
      'navigation.js',
      'assets/favicon.svg',
      ...(record.files['publication-index.json'] ? ['publication-index.json'] : []),
      ...descriptor.assets,
    ];
    if (JSON.stringify(row.assets) !== JSON.stringify(assets))
      throw Error('Article size dependency evidence differs ' + row.key);
    const downloads = descriptor.downloads === undefined ? [] : descriptor.downloads;
    if (
      !Array.isArray(downloads) ||
      downloads.length > 1 ||
      downloads.some(
        (name) =>
          !assets.includes(name) ||
          !/^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*\.pdf$/.test(name)
      ) ||
      JSON.stringify(row.downloads || []) !== JSON.stringify(downloads) ||
      (row.downloadGzipBytes || 0) !==
        downloads.reduce((total, name) => total + record.files[name].gzip, 0)
    )
      throw Error('Article download evidence differs ' + row.key);
    const transfer =
      file.gzip +
      assets.reduce((total, name) => {
        if (!record.files[name]) throw Error('Missing article size dependency ' + name);
        return total + (downloads.includes(name) ? 0 : record.files[name].gzip);
      }, 0);
    if (row.totalGzipBytes !== transfer || transfer > budgets.routeGzipBytes)
      throw Error('Article transfer budget evidence ' + row.key);
  }
  for (const [name, file] of Object.entries(record.files)) {
    const maximum = name.endsWith('.html') ? budgets.htmlRawBytes : budgets.assetRawBytes;
    if (
      !Number.isInteger(file.raw) ||
      file.raw < 0 ||
      file.raw > maximum ||
      !Number.isInteger(file.gzip) ||
      file.gzip < 0
    )
      throw Error('Public byte budget ' + name);
  }
  return true;
}
function git(arg) {
  const r = cp.spawnSync('git', arg, { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) throw Error(r.stderr);
  return r.stdout.trim();
}
function build(out) {
  require('../site/build.cjs').build({ check: true });
  fs.mkdirSync(out, { recursive: true });
  const target = path.join(out, 'public');
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(path.join(root, 'docs'), target, { recursive: true });
  const m = {
    schema: 1,
    sourceCommit: git(['rev-parse', 'HEAD']),
    sourceDirty: git(['status', '--porcelain']) !== '',
    sourceTree: git(['rev-parse', 'HEAD^{tree}']),
    candidateCommit: process.env.SITE_CANDIDATE_SHA || git(['rev-parse', 'HEAD']),
    ...manifest(target),
  };
  m.components = require('../site/snapshot.cjs').verify(target, m);
  if (process.env.CI && m.sourceDirty) throw Error('CI source must be clean');
  fs.writeFileSync(path.join(out, 'artifact.json'), JSON.stringify(m, null, 2) + '\n');
  fs.writeFileSync(path.join(out, 'sizes.json'), JSON.stringify(checkSize(target), null, 2) + '\n');
  return m;
}
function verify(dir, record, expectedDigest = process.env.SITE_EXPECTED_PUBLIC_DIGEST) {
  const actual = manifest(dir);
  if (expectedDigest && actual.artifactDigest !== expectedDigest)
    throw Error('Public digest differs from trusted build output');
  if (
    actual.artifactDigest !== record.artifactDigest ||
    JSON.stringify(actual.files) !== JSON.stringify(record.files)
  )
    throw Error('Artifact bytes do not match tested manifest');
  require('../staging/reader-snapshot.cjs').verify(dir, record);
  return true;
}
if (require.main === module) {
  const mode = process.argv[2],
    dir = process.argv[3];
  if (mode === 'build') console.log(build(path.resolve(dir)));
  else if (mode === 'sizes') console.log(checkSize(path.resolve(dir)));
  else if (mode === 'verify')
    verify(path.resolve(dir), JSON.parse(fs.readFileSync(process.argv[4])));
  else throw Error('Usage: artifact.cjs build OUT | sizes DIR | verify DIR MANIFEST');
}
module.exports = { manifest, checkSize, validateArticleSizes, build, verify, digest, entries };
