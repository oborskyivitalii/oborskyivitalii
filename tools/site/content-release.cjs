'use strict';
// A content release reuses an explicitly trusted complete generation, never a partial upload.
const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const builder = require('./build.cjs');
const snapshot = require('./snapshot.cjs');
const { commitGeneration } = require('./transaction.cjs');
const publicArtifact = require('./public-artifact.cjs');
const defaultRoot = path.resolve(__dirname, '../..');
const digestPattern = /^[a-f0-9]{64}$/;

function json(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

function overlaps(first, second) {
  const relative = path.relative(first, second);
  return relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep));
}

function rejectSymlinks(file) {
  let current = path.resolve(file);
  while (true) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink())
      throw Error('Symlink content release path ' + current);
    const parent = path.dirname(current);
    if (parent === current) return;
    current = parent;
  }
}

function verifyBaseline({ baseline, baselineLock, expectedBaselineLockSha256 }) {
  if (!digestPattern.test(expectedBaselineLockSha256 || ''))
    throw Error('Content release requires an explicit trusted baseline lock SHA256');
  for (const file of [baseline, baselineLock]) rejectSymlinks(file);
  const bytes = fs.readFileSync(baselineLock);
  if (builder.sha(bytes) !== expectedBaselineLockSha256)
    throw Error('Content baseline lock differs from its trusted SHA256');
  const generation = JSON.parse(bytes.toString('utf8'));
  if (
    generation.schema !== 1 ||
    !generation.components ||
    !generation.routes ||
    !generation.files ||
    !isDeepStrictEqual(Object.keys(generation.routes), snapshot.routes)
  )
    throw Error('Content baseline requires a complete versioned generation lock');
  const actualNames = builder.files(baseline);
  const declaredNames = Object.keys(generation.files).sort();
  if (!isDeepStrictEqual(actualNames, declaredNames))
    throw Error('Content baseline inventory differs from its complete generation lock');
  for (const name of declaredNames) {
    const declared = generation.files[name];
    if (
      !digestPattern.test(declared) ||
      builder.sha(fs.readFileSync(path.join(baseline, name))) !== declared
    )
      throw Error('Content baseline bytes differ from their trusted lock: ' + name);
  }
  const revision = snapshot.verify(baseline, { files: generation.files });
  if (revision.variant?.id !== 'base' || revision.edition !== undefined)
    throw Error('Content baseline requires an undecorated base generation');
  if (builder.runtimeVersion(generation.components) !== revision.engine)
    throw Error('Content baseline platform identity differs from its generation lock');
  return generation;
}

function currentComponents(root) {
  const { config } = builder.configuration(root);
  return builder.fingerprints(root, config, builder.catalog(root));
}

function lockFor(result) {
  return builder.outputLock(result);
}

function fileChanges(previous, current) {
  const names = [...new Set([...Object.keys(previous), ...Object.keys(current)])].sort();
  return {
    changed: names.filter((name) => current[name] && previous[name] !== current[name]),
    reused: names.filter((name) => current[name] && previous[name] === current[name]),
    removed: names.filter((name) => !Object.hasOwn(current, name)),
  };
}

function verifyEditions(previous, current) {
  for (const [key, before] of Object.entries(previous.articles || {})) {
    const after = current.articles?.[key];
    if (
      before.candidate !== true &&
      after &&
      before.semanticSha256 !== after.semanticSha256 &&
      before.contentEdition === after.contentEdition
    )
      throw Error('Changed accepted article semantics require a new content edition: ' + key);
  }
}

function release({
  root = defaultRoot,
  baseline,
  baselineLock,
  expectedBaselineLockSha256,
  output,
  cacheFile = output && output + '.cache.json',
  lockFile = output && output + '.output-lock.json',
  candidateArticles = [],
} = {}) {
  if ([baseline, baselineLock, output, cacheFile, lockFile].some((file) => !file))
    throw Error('Content release requires explicit baseline, lock and output paths');
  const destinations = [output, cacheFile, lockFile].map((file) => path.resolve(file));
  const inputs = [baseline, baselineLock].map((file) => path.resolve(file));
  for (const destination of destinations) {
    rejectSymlinks(destination);
    for (const input of inputs)
      if (overlaps(destination, input) || overlaps(input, destination))
        throw Error('Content release output and metadata must be separate from the baseline');
  }
  if (candidateArticles.length && path.resolve(output) === path.join(root, 'docs'))
    throw Error('Candidate articles require an isolated content release output');
  const previous = verifyBaseline({ baseline, baselineLock, expectedBaselineLockSha256 });
  const priorCandidates = Object.entries(previous.articles || {})
    .filter(([, article]) => article.candidate === true)
    .map(([key]) => key.split(':')[0]);
  if (priorCandidates.some((id) => !candidateArticles.includes(id)))
    throw Error('Preview candidate baseline cannot feed an ordinary public content release');
  const platform = currentComponents(root);
  if (!isDeepStrictEqual(platform, previous.components))
    throw Error('Content release platform changed; run an explicit full build');

  const parent = path.dirname(path.resolve(output));
  fs.mkdirSync(parent, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(parent, '.site-content-'));
  const stagedOutput = path.join(temporary, 'public');
  const stagedCache = path.join(temporary, 'cache.json');
  const stagedLock = path.join(temporary, 'output-lock.json');
  try {
    fs.cpSync(baseline, stagedOutput, { recursive: true });
    fs.writeFileSync(stagedCache, json(previous));
    fs.writeFileSync(stagedLock, json(previous));
    const generation = builder.build({
      root,
      output: stagedOutput,
      cacheFile: stagedCache,
      lockFile: stagedLock,
      candidateArticles,
      contentOnly: true,
    });
    verifyEditions(previous, generation);
    if (generation.built.some((route) => !['index', 'writing', 'talks'].includes(route)))
      throw Error('Content release changed a platform page; run an explicit full build');
    const platformFiles = Object.fromEntries(
      Object.entries(previous.files).filter(([name]) =>
        /^(?:runtime\/|media\/|assets\/)|\.(?:js|css)$/.test(name)
      )
    );
    for (const [name, digest] of Object.entries(platformFiles))
      if (generation.files[name] !== digest)
        throw Error('Content release changed platform bytes: ' + name);
    const manifest = publicArtifact.manifest(stagedOutput);
    snapshot.verify(stagedOutput, manifest);
    if (!isDeepStrictEqual(platform, currentComponents(root)))
      throw Error('Content release platform source changed during generation');
    verifyBaseline({ baseline, baselineLock, expectedBaselineLockSha256 });
    const report = {
      schema: 1,
      kind: 'content-release',
      baselineLockSha256: expectedBaselineLockSha256,
      engine: builder.runtimeVersion(platform),
      platformFiles,
      builtRoutes: generation.built,
      reusedRoutes: generation.reused,
      builtArticles: generation.builtArticles || [],
      reusedArticles: generation.reusedArticles || [],
      files: fileChanges(previous.files, generation.files),
      artifactDigest: manifest.artifactDigest,
    };
    commitGeneration({
      output,
      temporary: stagedOutput,
      cacheFile,
      lockFile,
      cacheBytes: json({ ...generation, contentRelease: report }),
      lockBytes: json(lockFor(generation)),
    });
    return { generation, report, manifest };
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

function argumentsFor(argv) {
  const names = {
    '--root': 'root',
    '--baseline': 'baseline',
    '--baseline-lock': 'baselineLock',
    '--baseline-lock-sha256': 'expectedBaselineLockSha256',
    '--output': 'output',
  };
  const options = { candidateArticles: [] };
  for (let index = 0; index < argv.length; index += 2) {
    const option = argv[index];
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw Error('Missing content release argument ' + option);
    if (option === '--candidate') options.candidateArticles.push(value);
    else if (!names[option] || Object.hasOwn(options, names[option]))
      throw Error('Unknown or duplicate content release argument ' + option);
    else options[names[option]] = value;
  }
  return options;
}

if (require.main === module) {
  const { report } = release(argumentsFor(process.argv.slice(2)));
  console.log(json(report));
}

module.exports = { release, verifyBaseline, verifyEditions, lockFor, argumentsFor };
