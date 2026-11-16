const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { gunzipSync } = require('node:zlib');
const { spawnSync } = require('node:child_process');
const { assertSourceRelative, readSource } = require('./safety.cjs');
const { decodeUtf8 } = require('./text.cjs');
const { verifyCommittedPins } = require('./provenance.cjs');
const { htmlRawLimit } = require('../quality/html-budget.cjs');
const { assetRawBytes } = require('../quality/budgets.json');

function digest(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function git(root, arguments_) {
  const result = spawnSync('git', ['--no-replace-objects', ...arguments_], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10_000,
    maxBuffer: 100_000,
  });
  if (result.error || result.status !== 0) {
    throw new Error('Site artifact requires exact verifiable Git source identity');
  }
  return result.stdout.trim();
}

function inventory(directory, prefix = '', files = []) {
  if (!prefix && !fs.lstatSync(directory).isDirectory()) {
    throw new Error('Site publication artifact requires an ordinary inventory directory');
  }
  for (const entry of fs.readdirSync(path.join(directory, prefix), {
    withFileTypes: true,
  })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink() || files.length >= 1000) {
      throw new Error('Site publication artifact contains unsafe or excessive entries');
    }
    if (entry.isDirectory()) {
      inventory(directory, name, files);
    } else if (entry.isFile()) {
      files.push(name);
    } else {
      throw new Error('Site publication artifact contains a non-file resource');
    }
  }
  return files.sort();
}

function archivedSource(root, relative, maximum, compressed = false) {
  const source = readSource(root, relative, {
    maxBytes: maximum + (compressed ? 65_536 : 0),
  });
  return compressed ? gunzipSync(source.bytes, { maxOutputLength: maximum }) : source.bytes;
}

function archivedFiles(root, owner, shared, files) {
  const directory = `${owner}/${shared ? 'files' : 'public'}`;
  if (!shared) {
    return inventory(path.join(root, directory)).map((file) => ({
      file,
      relative: `${directory}/${file}`,
      compressed: false,
    }));
  }
  return inventory(path.join(root, directory)).map((stored) => {
    const match = /^(\d{3})(\.gz)?$/.exec(stored);
    const file = files[Number(match?.[1])];
    if (!file) throw new Error('Invalid site evidence member index');
    return { file, relative: `${directory}/${stored}`, compressed: Boolean(match[2]) };
  });
}

function validateSiteArtifact(root, directory, event) {
  const artifact = event.artifact;
  const shared =
    /^site\/publication-evidence\/(prod-\d{4}-\d{2}-\d{2}\.[1-9]\d*)\/artifact\.json\.gz$/.exec(
      artifact.manifestPath
    );
  const legacyRoots = [
    `${directory}/site-artifacts/${artifact.id}`,
    `dist/site-artifacts/${artifact.id}`,
  ];
  const owner = shared
    ? `site/publication-evidence/${shared[1]}`
    : legacyRoots.find((candidate) => artifact.manifestPath === `${candidate}/artifact.json`);
  if (!owner) {
    throw new Error('Site event must bind its coherent archived site artifact');
  }
  const sharedArchive = Boolean(shared);
  const manifestBytes = archivedSource(root, artifact.manifestPath, 1_000_000, sharedArchive);
  const manifest = JSON.parse(decodeUtf8(manifestBytes, artifact.manifestPath));
  if (
    digest(manifestBytes) !== artifact.manifestSha256 ||
    manifest.schema !== 1 ||
    manifest.artifactDigest !== artifact.id ||
    !manifest.files ||
    digest(JSON.stringify(manifest.files)) !== artifact.id ||
    manifest.sourceDirty !== false ||
    manifest.edition?.id !== 'production' ||
    !/^[0-9a-f]{40}$/.test(manifest.sourceCommit) ||
    !/^[0-9a-f]{40}$/.test(manifest.sourceTree)
  ) {
    throw new Error('Site publication requires a clean coherent production artifact');
  }
  const descriptor = Object.values(manifest.components?.articles || {}).find(
    (article) => article.articleId === event.articleId
  );
  const editionPath = `${directory}/editions/${event.editionId}.json`;
  const edition = JSON.parse(decodeUtf8(readSource(root, editionPath).bytes, editionPath));
  if (
    !descriptor ||
    descriptor.contentEdition !== event.editionId ||
    descriptor.sourceSha256 !== edition.source.sha256 ||
    descriptor.semanticSha256 !== edition.semanticSha256 ||
    ![descriptor.alias, descriptor.url].includes(artifact.documentPath)
  ) {
    throw new Error('Site reader document does not bind the declared content edition');
  }
  verifyCommittedPins(root, `${directory}/${edition.source.path}`, edition.source);
  if (
    git(root, ['rev-parse', '--verify', `${manifest.sourceCommit}^{tree}`]) !== manifest.sourceTree
  ) {
    throw new Error('Site artifact commit and source tree do not match');
  }
  git(root, ['merge-base', '--is-ancestor', edition.source.commit, manifest.sourceCommit]);
  const policyPath = 'site/publications/policy.json';
  const policy = JSON.parse(decodeUtf8(readSource(root, policyPath).bytes, policyPath));
  const origin = new URL(policy.productionOrigin);
  if (
    policy.schema !== 1 ||
    Object.keys(policy).length !== 2 ||
    origin.protocol !== 'https:' ||
    origin.origin !== policy.productionOrigin ||
    manifest.edition.origin !== origin.origin ||
    event.url !== `${origin.origin}/${descriptor.alias}`
  ) {
    throw new Error('Observed site URL must match the production policy and exact reader alias');
  }
  const files = Object.keys(manifest.files).sort();
  const stored = archivedFiles(root, owner, sharedArchive, files);
  if (
    files.length > 1000 ||
    JSON.stringify(stored.map((item) => item.file).sort()) !== JSON.stringify(files)
  ) {
    throw new Error('Site publication artifact inventory differs from its manifest');
  }
  let total = 0;
  let revision;
  const inputs = [artifact.manifestPath, editionPath, policyPath];
  for (const { file, relative, compressed } of stored) {
    assertSourceRelative(file);
    const maximum = file.endsWith('.html') ? htmlRawLimit(file) : assetRawBytes;
    const bytes = archivedSource(root, relative, maximum, compressed);
    total += bytes.length;
    if (
      total > 250_000_000 ||
      digest(bytes) !== manifest.files[file].sha256 ||
      bytes.length !== manifest.files[file].raw
    ) {
      throw new Error('Site publication artifact has corrupt or excessive public bytes');
    }
    if (file === 'site-revision.json') {
      revision = JSON.parse(decodeUtf8(bytes, 'Site revision'));
    }
    inputs.push(relative);
  }
  const revisionArticle = Object.values(revision?.articles || {}).find(
    (article) => article.articleId === event.articleId
  );
  if (
    revision?.preview === true ||
    revision?.edition?.id !== 'production' ||
    JSON.stringify(revisionArticle) !== JSON.stringify(descriptor) ||
    descriptor.sha256 !== manifest.files[descriptor.url]?.sha256
  ) {
    throw new Error('Site publication revision and reader snapshot disagree');
  }
  const document = manifest.files[artifact.documentPath];
  if (
    !document ||
    !descriptor.alias.startsWith('articles/') ||
    !descriptor.url.startsWith('article-snapshots/')
  ) {
    throw new Error('Site publication event names an undeclared reader document');
  }
  return { documentSha256: document.sha256, inputs };
}

module.exports = { validateSiteArtifact };
