'use strict';
// Explicit candidate source reconstruction owns delivery composition above leaf artifact hashing.
const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const root = path.resolve(__dirname, '../..');
const { previewSelection, manifest, verify } = require('./artifact.cjs');
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
  if (!candidates.length) {
    if (candidateArtifact)
      throw Error('Candidate artifact requires its explicit preview declaration');
    return true;
  }
  if (
    JSON.stringify(candidates) !== JSON.stringify(previewSelection('true', repoRoot)) ||
    record.components?.preview !== true
  )
    throw Error('Candidate artifact differs from its explicit preview declaration');
  const temporary = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'article-source-proof-'));
  try {
    const output = path.join(temporary, 'public');
    require('../site/build.cjs').build({
      root: repoRoot,
      output,
      all: true,
      cacheFile: path.join(temporary, 'cache.json'),
      candidateArticles: candidates,
    });
    const raw = {
      schema: 1,
      sourceCommit: record.sourceCommit,
      sourceTree: record.sourceTree,
      candidateCommit: record.candidateCommit,
      sourceDirty: record.sourceDirty,
      articleCandidates: candidates,
      ...manifest(output),
    };
    raw.components = require('../site/snapshot.cjs').verify(output, raw);
    fs.writeFileSync(path.join(temporary, 'artifact.json'), JSON.stringify(raw, null, 2) + '\n');
    if (record.components.variant?.id === 'color') require('../staging/color.cjs').build(temporary);
    if (record.edition?.id === 'staging') require('../staging/edition.cjs').build(temporary);
    else if (record.edition?.id) throw Error('Article candidates cannot use a production edition');
    const generated = manifest(output);
    if (
      generated.artifactDigest !== record.artifactDigest ||
      JSON.stringify(generated.files) !== JSON.stringify(record.files)
    )
      throw Error('Candidate artifact differs from cold current source generation');
    verify(directory, record);
    return true;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

module.exports = { verifyCandidateSource };
