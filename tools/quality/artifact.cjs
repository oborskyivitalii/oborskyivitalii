'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process');
const budgets = require('./budgets.json'),
  root = path.resolve(__dirname, '../..');
const { digest, entries, manifest } = require('../site/public-artifact.cjs');
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
    const downloads = require('../site/snapshot.cjs').downloads(descriptor, html, (name) =>
      fs.readFileSync(path.join(dir, name))
    );
    const svg = html.match(/<svg class="space-fallback"[\s\S]*?<\/svg>/)?.[0];
    if (!svg) throw Error('Missing article fallback ' + key);
    let svgNodes = (svg.match(/<[a-z][\w-]*(?:\s|>)/gi) || []).length;
    const fallback = svg.match(/<use href="(?:\.\.\/)*([^"#]+)#writing-fallback"><\/use>/)?.[1];
    if (fallback) {
      if (!descriptor.assets.includes(fallback)) throw Error('Undeclared article fallback');
      const content = require('../site/fallback.cjs').resourceContent(
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
function previewSelection(enabled = process.env.SITE_ARTICLE_PREVIEW, projectRoot = root) {
  return require('../site/article-selection.cjs').select(enabled, projectRoot);
}

function generationPaths(directory) {
  return {
    publicDir: path.join(directory, 'generation/public'),
    lockFile: path.join(directory, 'generation/output-lock.json'),
  };
}

function persistGeneration(directory, publicDir, lockBytes) {
  const destination = generationPaths(directory);
  const outputLockSha256 = digest(lockBytes);
  require('../site/content-release.cjs').verifyBaseline({
    baseline: publicDir,
    baselineLock: destination.lockFile,
    expectedBaselineLockSha256: outputLockSha256,
  });
  return {
    schema: 1,
    outputLockSha256,
    artifactDigest: manifest(publicDir).artifactDigest,
  };
}

function storeGeneration(directory, publicDir, lockBytes) {
  const destination = generationPaths(directory);
  fs.mkdirSync(path.dirname(destination.lockFile), { recursive: true });
  fs.writeFileSync(destination.lockFile, lockBytes);
  const declaration = persistGeneration(directory, publicDir, lockBytes);
  fs.rmSync(destination.publicDir, { recursive: true, force: true });
  fs.cpSync(publicDir, destination.publicDir, { recursive: true });
  return declaration;
}

function trustedContentBaseline({ directory, expectedGenerationSha256, expectedArtifactDigest }) {
  if (
    !/^[a-f0-9]{64}$/.test(expectedGenerationSha256 || '') ||
    !/^[a-f0-9]{64}$/.test(expectedArtifactDigest || '')
  )
    throw Error('Content artifact requires trusted generation and baseline artifact digests');
  const record = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json'), 'utf8'));
  verify(path.join(directory, 'public'), record, expectedArtifactDigest);
  if (
    record.generation?.schema !== 1 ||
    record.generation.outputLockSha256 !== expectedGenerationSha256
  )
    throw Error('Content artifact baseline lacks its trusted generation declaration');
  const raw = generationPaths(directory);
  const generation = require('../site/content-release.cjs').verifyBaseline({
    baseline: raw.publicDir,
    baselineLock: raw.lockFile,
    expectedBaselineLockSha256: expectedGenerationSha256,
  });
  if (manifest(raw.publicDir).artifactDigest !== record.generation.artifactDigest)
    throw Error('Content artifact raw generation differs from its baseline declaration');
  return { record, generation, ...raw };
}

function retainFinalSnapshots(directory, record, output, generation) {
  const immutable = require('../site/snapshot.cjs').immutable;
  const retained = {};
  for (const [name, info] of Object.entries(record.files)) {
    if (!immutable(name)) continue;
    const bytes = fs.readFileSync(path.join(directory, 'public', name));
    if (digest(bytes) !== info.sha256) throw Error('Trusted final snapshot changed ' + name);
    if (Object.hasOwn(generation.files, name)) {
      if (generation.files[name] !== info.sha256)
        throw Error('Content release immutable baseline collision ' + name);
    } else {
      const target = path.join(output, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes);
      generation.files[name] = info.sha256;
    }
    retained[name] = info.sha256;
  }
  return retained;
}

function storeContentBaseline(directory, baseline) {
  const target = path.join(directory, 'content-baseline');
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  for (const name of [
    'artifact.json',
    'public',
    'generation/public',
    'generation/output-lock.json',
    ...(fs.existsSync(path.join(baseline, 'content-admission.json'))
      ? ['content-admission.json']
      : []),
  ]) {
    fs.mkdirSync(path.dirname(path.join(target, name)), { recursive: true });
    fs.cpSync(path.join(baseline, name), path.join(target, name), {
      recursive: true,
    });
  }
}

function composeContentGeneration({ projectRoot = root, out, contentBaseline, articleCandidates }) {
  const baselineDirectory = path.resolve(contentBaseline.directory);
  const targetDirectory = path.resolve(out);
  for (const [first, second] of [
    [baselineDirectory, targetDirectory],
    [targetDirectory, baselineDirectory],
  ]) {
    const relative = path.relative(first, second);
    if (relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep)))
      throw Error('Content artifact output must be separate from its trusted baseline');
  }
  const trusted = trustedContentBaseline(contentBaseline);
  const admissionFile = path.join(baselineDirectory, 'content-admission.json');
  let admission, lane;
  if (fs.existsSync(admissionFile)) {
    admission = JSON.parse(fs.readFileSync(admissionFile));
    const candidate = git(['rev-parse', 'HEAD']);
    require('./content-baseline.cjs').verifyHistory(
      projectRoot,
      admission.history,
      admission.mergedSource,
      candidate
    );
    const selection = require('./delivery-observation.cjs').selection(
      projectRoot,
      admission.mergedSource,
      candidate
    );
    if (!selection.contentOnly) throw Error('Accepted content baseline rejects platform changes');
    lane = selection.content.lane;
  }
  if (JSON.stringify(trusted.record.articleCandidates || []) !== JSON.stringify(articleCandidates))
    throw Error('Content baseline candidate selection changed; run an explicit full build');
  const target = path.join(out, 'public');
  const result = require('../site/content-release.cjs').release({
    root: projectRoot,
    baseline: trusted.publicDir,
    baselineLock: trusted.lockFile,
    expectedBaselineLockSha256: contentBaseline.expectedGenerationSha256,
    output: target,
    cacheFile: path.join(out, 'content-cache.json'),
    lockFile: path.join(out, 'content-output-lock.json'),
    candidateArticles: articleCandidates,
  });
  const retained = retainFinalSnapshots(
    baselineDirectory,
    trusted.record,
    target,
    result.generation
  );
  const lockBytes =
    JSON.stringify(require('../site/content-release.cjs').lockFor(result.generation), null, 2) +
    '\n';
  require('../site/snapshot.cjs').verify(target, manifest(target));
  const declaration = storeGeneration(out, target, lockBytes);
  storeContentBaseline(out, baselineDirectory);
  fs.rmSync(path.join(out, 'content-cache.json'), { force: true });
  fs.rmSync(path.join(out, 'content-output-lock.json'), { force: true });
  return {
    declaration,
    report: {
      ...result.report,
      ...(admission ? { admission, lane } : {}),
      artifactDigest: declaration.artifactDigest,
      retainedFinalSnapshots: retained,
      trustedBaseline: {
        artifactDigest: trusted.record.artifactDigest,
        generationSha256: contentBaseline.expectedGenerationSha256,
        sourceCommit: trusted.record.sourceCommit,
        sourceTree: trusted.record.sourceTree,
      },
    },
  };
}

function stagedGeneration(out, directory, articleCandidates) {
  for (const [first, second] of [
    [out, directory],
    [directory, out],
  ]) {
    const relative = path.relative(path.resolve(first), path.resolve(second));
    if (relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep)))
      throw Error('Accepted generation output must be separate from its immutable input');
  }
  const staged = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  if (
    staged.sourceDirty ||
    staged.sourceTree !== git(['rev-parse', 'HEAD^{tree}']) ||
    staged.edition?.id !== 'staging' ||
    JSON.stringify(staged.articleCandidates || []) !== JSON.stringify(articleCandidates)
  )
    throw Error('Accepted generation requires the identical staged source tree and selection');
  const trusted = trustedContentBaseline({
    directory,
    expectedGenerationSha256: staged.generation?.outputLockSha256,
    expectedArtifactDigest: staged.artifactDigest,
  });
  const builder = require('../site/build.cjs');
  const { config } = builder.configuration(root);
  if (
    !require('node:util').isDeepStrictEqual(
      trusted.generation.components,
      builder.fingerprints(root, config, builder.catalog(root))
    )
  )
    throw Error('Staged generation platform differs from current source');
  fs.mkdirSync(out, { recursive: true });
  const output = path.join(out, 'public');
  fs.rmSync(output, { recursive: true, force: true });
  fs.cpSync(trusted.publicDir, output, { recursive: true });
  const generation = storeGeneration(
    out,
    output,
    JSON.stringify(builder.outputLock(trusted.generation), null, 2) + '\n'
  );
  if (staged.contentRelease) storeContentBaseline(out, path.join(directory, 'content-baseline'));
  return { generation, contentRelease: staged.contentRelease };
}

function build(
  out,
  {
    contentBaseline,
    acceptedGeneration,
    articlePreviewMode = process.env.SITE_ARTICLE_PREVIEW,
  } = {}
) {
  const articleCandidates = previewSelection(articlePreviewMode);
  const target = path.join(out, 'public');
  let generation;
  let contentRelease;
  if (acceptedGeneration) {
    if (contentBaseline) throw Error('Choose one generation input');
    ({ generation, contentRelease } = stagedGeneration(out, acceptedGeneration, articleCandidates));
  } else if (contentBaseline) {
    const composed = composeContentGeneration({
      out,
      contentBaseline,
      articleCandidates,
    });
    generation = composed.declaration;
    contentRelease = composed.report;
  } else {
    require('../site/build.cjs').build({ check: true });
    fs.mkdirSync(out, { recursive: true });
    fs.rmSync(target, { recursive: true, force: true });
    let lockBytes;
    if (articleCandidates.length) {
      require('../site/build.cjs').build({
        root,
        output: target,
        all: true,
        cacheFile: path.join(out, 'candidate-cache.json'),
        candidateArticles: articleCandidates,
      });
      lockBytes = fs.readFileSync(target + '.output-lock.json');
      fs.rmSync(path.join(out, 'candidate-cache.json'), { force: true });
      fs.rmSync(target + '.output-lock.json', { force: true });
    } else {
      fs.cpSync(path.join(root, 'docs'), target, { recursive: true });
      lockBytes = fs.readFileSync(path.join(root, 'site/output-lock.json'));
    }
    generation = storeGeneration(out, target, lockBytes);
  }
  const m = {
    schema: 1,
    sourceCommit: git(['rev-parse', 'HEAD']),
    sourceDirty: git(['status', '--porcelain']) !== '',
    sourceTree: git(['rev-parse', 'HEAD^{tree}']),
    candidateCommit: process.env.SITE_CANDIDATE_SHA || git(['rev-parse', 'HEAD']),
    articleCandidates,
    ...(articlePreviewMode === 'template' ? { articlePreviewMode: 'template' } : {}),
    generation,
    ...(contentRelease ? { contentRelease } : {}),
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
  require('../site/snapshot.cjs').verify(dir, record);
  return true;
}
if (require.main === module) {
  const mode = process.argv[2],
    dir = process.argv[3];
  if (mode === 'build') {
    const extra = process.argv.slice(4);
    if (extra[0] === '--accepted-generation') {
      if (extra.length !== 2) throw Error('Accepted generation requires one explicit directory');
      console.log(
        build(path.resolve(dir), {
          acceptedGeneration: path.resolve(extra[1]),
        })
      );
    } else {
      const contentBaseline = {};
      const options = {
        '--content-baseline': 'directory',
        '--generation-sha256': 'expectedGenerationSha256',
        '--baseline-digest': 'expectedArtifactDigest',
      };
      for (let index = 0; index < extra.length; index += 2) {
        const option = extra[index];
        const value = extra[index + 1];
        if (!options[option] || !value || Object.hasOwn(contentBaseline, options[option]))
          throw Error('Unknown, duplicate or incomplete artifact content argument ' + option);
        contentBaseline[options[option]] = value;
      }
      if (extra.length && Object.keys(contentBaseline).length !== 3)
        throw Error('Content artifact requires baseline, generation SHA256 and artifact digest');
      console.log(build(path.resolve(dir), extra.length ? { contentBaseline } : {}));
    }
  } else if (mode === 'sizes') console.log(checkSize(path.resolve(dir)));
  else if (mode === 'verify')
    verify(path.resolve(dir), JSON.parse(fs.readFileSync(process.argv[4])));
  else throw Error('Usage: artifact.cjs build OUT | sizes DIR | verify DIR MANIFEST');
}
module.exports = {
  manifest,
  checkSize,
  validateArticleSizes,
  previewSelection,
  build,
  verify,
  digest,
  entries,
  generationPaths,
  storeGeneration,
  trustedContentBaseline,
  composeContentGeneration,
  stagedGeneration,
  retainFinalSnapshots,
};
