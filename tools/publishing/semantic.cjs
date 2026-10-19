const crypto = require('node:crypto');

function canonical(value) {
  if (Array.isArray(value)) {
    return value.map(canonical);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])])
    );
  }
  return value;
}

function digest(identity) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonical(identity)))
    .digest('hex');
}

function semanticDigest(metadata, source, assets = metadata.assets) {
  const identity = {
    schema: 1,
    articleId: metadata.id,
    language: metadata.language,
    manuscriptSha256: source.sha256,
    title: metadata.title,
    summary: metadata.summary,
    authors: metadata.authors,
    topic: metadata.topic,
    owner: metadata.owner,
    references: metadata.references,
    rights: { notice: metadata.rights.notice, references: metadata.rights.references },
    figures: assets.map((asset) => ({
      id: asset.id,
      sha256: asset.sha256,
      width: asset.width,
      height: asset.height,
      alt: asset.alt,
      caption: asset.caption,
      credit: asset.credit,
    })),
  };
  if (metadata.translationOf !== undefined) {
    identity.translationOf = metadata.translationOf;
  }
  if (metadata.presentation !== undefined) {
    identity.presentation = metadata.presentation;
  }
  return digest(identity);
}

function adaptationDigest(metadata, source, fullEdition, platform) {
  const identity = {
    schema: 1,
    kind: 'authored-adaptation',
    articleId: metadata.id,
    language: metadata.language,
    platform,
    sourceSha256: source.sha256,
    baseEdition: fullEdition.id,
    baseSemanticSha256: fullEdition.semanticSha256,
  };
  return digest(identity);
}

module.exports = { semanticDigest, adaptationDigest, blockDigest: digest };
