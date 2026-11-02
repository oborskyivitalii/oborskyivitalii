const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { readSource } = require('./safety.cjs');
const { decodeUtf8 } = require('./text.cjs');
const { verifyCommittedPins } = require('./provenance.cjs');

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
  for (const entry of fs.readdirSync(path.join(directory, prefix), { withFileTypes: true })) {
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

function validateSiteArtifact(root, directory, event) {
  const artifact = event.artifact;
  const roots = [
    `${directory}/site-artifacts/${artifact.id}`,
    `dist/site-artifacts/${artifact.id}`,
  ];
  const owner = roots.find((candidate) => artifact.manifestPath === `${candidate}/artifact.json`);
  if (!owner) {
    throw new Error('Site event must bind its coherent archived site artifact');
  }
  const declared = readSource(root, artifact.manifestPath, { maxBytes: 1_000_000 });
  const manifest = JSON.parse(decodeUtf8(declared.bytes, artifact.manifestPath));
  if (
    declared.sha256 !== artifact.manifestSha256 ||
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
  const publicRoot = `${owner}/public`;
  const files = Object.keys(manifest.files).sort();
  if (
    files.length > 1000 ||
    JSON.stringify(inventory(path.join(root, publicRoot))) !== JSON.stringify(files)
  ) {
    throw new Error('Site publication artifact inventory differs from its manifest');
  }
  let total = 0;
  const inputs = [artifact.manifestPath, editionPath, policyPath];
  for (const file of files) {
    const maximum = file.endsWith('.html') ? 100_000 : 2_000_000;
    const input = readSource(root, `${publicRoot}/${file}`, { maxBytes: maximum });
    total += input.bytes.length;
    if (
      total > 250_000_000 ||
      input.sha256 !== manifest.files[file].sha256 ||
      input.bytes.length !== manifest.files[file].raw
    ) {
      throw new Error('Site publication artifact has corrupt or excessive public bytes');
    }
    inputs.push(`${publicRoot}/${file}`);
  }
  const revision = JSON.parse(
    decodeUtf8(readSource(root, `${publicRoot}/site-revision.json`).bytes, 'Site revision')
  );
  const revisionArticle = Object.values(revision.articles || {}).find(
    (article) => article.articleId === event.articleId
  );
  if (
    revision.preview === true ||
    revision.edition?.id !== 'production' ||
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
