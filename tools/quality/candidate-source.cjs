'use strict';
// Explicit candidate source reconstruction owns delivery composition above leaf artifact hashing.
const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const root = path.resolve(__dirname, '../..');
const artifact = require('./artifact.cjs');
const { previewSelection, manifest, verify } = artifact;

function contentBaselineFor(directory, record) {
  const release = record.contentRelease;
  const trusted = release?.trustedBaseline;
  if (
    release?.schema !== 1 ||
    release.kind !== 'content-release' ||
    !trusted ||
    !/^[a-f0-9]{40}$/.test(trusted.sourceCommit || '') ||
    !/^[a-f0-9]{40}$/.test(trusted.sourceTree || '')
  )
    throw Error('Content artifact requires its explicit trusted baseline source');
  const contentBaseline = {
    directory: path.join(path.dirname(directory), 'content-baseline'),
    expectedGenerationSha256: trusted.generationSha256,
    expectedArtifactDigest: trusted.artifactDigest,
  };
  const observed = artifact.trustedContentBaseline(contentBaseline);
  if (
    observed.record.sourceCommit !== trusted.sourceCommit ||
    observed.record.sourceTree !== trusted.sourceTree
  )
    throw Error('Content artifact baseline source differs from its trusted declaration');
  return contentBaseline;
}

function applyDeliveryLayers(directory, record, content, candidates) {
  if (record.components.variant?.id === 'color') require('../staging/color.cjs').build(directory);
  const edition = record.edition?.id;
  if (edition === 'staging') require('../staging/edition.cjs').build(directory);
  else if (edition === 'production' && content && !candidates.length)
    require('../release/edition.cjs').build(directory, record.components.variant?.id || 'base');
  else if (edition) throw Error('Article candidates cannot use a production edition');
}

function verifyCandidateSource(directory, record, { repoRoot = root } = {}) {
  verify(directory, record);
  const observed = JSON.parse(fs.readFileSync(path.join(directory, 'site-revision.json'), 'utf8'));
  const candidateArtifact =
    observed.preview === true ||
    Object.values(observed.articles || {}).some((article) => article.candidate === true);
  if (candidateArtifact && !isDeepStrictEqual(record.components, observed))
    throw Error('Candidate artifact requires matching verified public components');
  const declared = record.articleCandidates;
  if (declared !== undefined && !Array.isArray(declared))
    throw Error('Candidate declaration must be an explicit array');
  const candidates = declared || [];
  if (record.articlePreviewMode !== undefined && record.articlePreviewMode !== 'template')
    throw Error('Unknown candidate preview purpose');
  if (record.articlePreviewMode === 'template' && !candidates.length)
    throw Error('Template preview requires its explicit candidate selection');
  if (!candidates.length) {
    if (candidateArtifact)
      throw Error('Candidate artifact requires its explicit preview declaration');
    if (!record.contentRelease) return true;
  }
  if (
    candidates.length &&
    (JSON.stringify(candidates) !==
      JSON.stringify(previewSelection(record.articlePreviewMode || 'true', repoRoot)) ||
      record.components?.preview !== true)
  )
    throw Error('Candidate artifact differs from its explicit preview declaration');
  const temporary = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'article-source-proof-'));
  try {
    const output = path.join(temporary, 'public');
    let content;
    if (record.contentRelease) {
      const contentBaseline = contentBaselineFor(directory, record);
      content = artifact.composeContentGeneration({
        projectRoot: repoRoot,
        out: temporary,
        contentBaseline,
        articleCandidates: candidates,
      });
      if (
        !isDeepStrictEqual(content.declaration, record.generation) ||
        !isDeepStrictEqual(content.report, record.contentRelease)
      )
        throw Error('Content artifact differs from verified current source generation');
      const current = artifact.generationPaths(path.dirname(directory));
      require('../site/content-release.cjs').verifyBaseline({
        baseline: current.publicDir,
        baselineLock: current.lockFile,
        expectedBaselineLockSha256: record.generation.outputLockSha256,
      });
      if (manifest(current.publicDir).artifactDigest !== record.generation.artifactDigest)
        throw Error('Content artifact current generation evidence differs');
    } else {
      require('../site/build.cjs').build({
        root: repoRoot,
        output,
        all: true,
        cacheFile: path.join(temporary, 'cache.json'),
        candidateArticles: candidates,
      });
    }
    const raw = {
      schema: 1,
      sourceCommit: record.sourceCommit,
      sourceTree: record.sourceTree,
      candidateCommit: record.candidateCommit,
      sourceDirty: record.sourceDirty,
      articleCandidates: candidates,
      ...(content ? { generation: content.declaration, contentRelease: content.report } : {}),
      ...manifest(output),
    };
    raw.components = require('../site/snapshot.cjs').verify(output, raw);
    fs.writeFileSync(path.join(temporary, 'artifact.json'), JSON.stringify(raw, null, 2) + '\n');
    applyDeliveryLayers(temporary, record, content, candidates);
    const generated = manifest(output);
    if (
      generated.artifactDigest !== record.artifactDigest ||
      JSON.stringify(generated.files) !== JSON.stringify(record.files)
    )
      throw Error(
        content
          ? 'Content artifact differs from verified current source generation'
          : 'Candidate artifact differs from cold current source generation'
      );
    verify(directory, record);
    return true;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

module.exports = { verifyCandidateSource, contentBaselineFor };
