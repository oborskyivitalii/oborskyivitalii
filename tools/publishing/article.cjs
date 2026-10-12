const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { readSource } = require('./safety.cjs');
const { verifySource } = require('./provenance.cjs');
const { publicationEvents } = require('./events.cjs');
const { verifyAppendOnlyHistory } = require('./history.cjs');
const { semanticDigest, adaptationDigest } = require('./semantic.cjs');
const { loadProfile } = require('./profile.cjs');
const { decodeUtf8 } = require('./text.cjs');

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA = /^[0-9a-f]{64}$/;

function object(value, keys, context) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${context} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) {
      throw new Error(`Unknown ${context} field: ${key}`);
    }
  }
  return value;
}

function string(value, context, maximum = 1000) {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum || /\0/.test(value)) {
    throw new Error(`Invalid ${context}`);
  }
  return value;
}

function id(value, context) {
  if (!ID.test(string(value, context, 80))) {
    throw new Error(`Invalid ${context}`);
  }
  return value;
}

function https(value, context) {
  string(value, context, 2500);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid ${context} URL`);
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`Unsafe ${context} URL`);
  }
  return value;
}

function array(value, context, maximum) {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new Error(`Invalid ${context}`);
  }
  return value;
}

function readJson(root, relative) {
  const input = readSource(root, relative, { maxBytes: 100_000 });
  return { value: JSON.parse(decodeUtf8(input.bytes, relative)), input };
}

function validateReferences(references) {
  const referenceIds = new Set();
  for (const reference of array(references, 'references', 100)) {
    object(reference, ['id', 'url', 'commit', 'path', 'sha256'], 'source reference');
    id(reference.id, 'reference id');
    if (referenceIds.has(reference.id)) {
      throw new Error(`Duplicate reference ${reference.id}`);
    }
    referenceIds.add(reference.id);
    https(reference.url, 'source reference');
    if (reference.commit !== undefined && !/^[0-9a-f]{40}$/.test(reference.commit)) {
      throw new Error('Source reference requires an immutable full commit');
    }
    if (reference.path !== undefined) {
      string(reference.path, 'reference path', 1000);
      if (reference.path.startsWith('/') || reference.path.split('/').includes('..')) {
        throw new Error('Unsafe source reference path');
      }
    }
    if (reference.sha256 !== undefined && !SHA.test(reference.sha256)) {
      throw new Error('Invalid reference digest');
    }
  }
}

function validatePlatforms(metadata) {
  object(metadata.platforms, ['linkedin', 'medium'], 'platform selections');
  for (const platform of ['linkedin', 'medium']) {
    const selection = object(metadata.platforms[platform], ['mode', 'source', 'edition'], platform);
    if (!['equivalent-rendition', 'adaptation'].includes(selection.mode)) {
      throw new Error(`Unknown ${platform} relationship`);
    }
    if (selection.mode === 'adaptation') {
      if (selection.source !== `adaptations/${platform}.${metadata.language}.md`) {
        throw new Error(`Invalid authored ${platform} adaptation source`);
      }
      id(selection.edition, `${platform} edition`);
      if (selection.edition === metadata.edition) {
        throw new Error('An adaptation cannot reuse the full content edition identity');
      }
    } else if (selection.source !== undefined || selection.edition !== undefined) {
      throw new Error('Equivalent rendition cannot declare a second editable source');
    }
  }
}

function validateMetadata(metadata, articleId) {
  object(
    metadata,
    [
      'schema',
      'id',
      'slug',
      'title',
      'summary',
      'authors',
      'language',
      'topic',
      'owner',
      'status',
      'source',
      'edition',
      'rights',
      'references',
      'assets',
      'platforms',
      'canonical',
      'translationOf',
      'profile',
    ],
    'publication'
  );
  if (metadata.schema !== 1 || id(metadata.id, 'article id') !== articleId) {
    throw new Error('Publication schema/id does not match its source directory');
  }
  id(metadata.slug, 'article slug');
  string(metadata.title, 'title', 250);
  string(metadata.summary, 'summary', 1500);
  string(metadata.topic, 'topic', 100);
  if (!['en', 'uk'].includes(metadata.language)) {
    throw new Error('Publication language must be en or uk');
  }
  if (!['draft', 'review', 'accepted'].includes(metadata.status)) {
    throw new Error('Unknown publication selection state');
  }
  if (metadata.source !== `manuscript.${metadata.language}.md`) {
    throw new Error('Full source must be the language-specific manuscript owner');
  }
  id(metadata.edition, 'content edition');
  if (metadata.profile !== 'profile.json') {
    throw new Error('Publication must declare its bounded profile.json owner');
  }
  const authors = array(metadata.authors, 'authors', 10);
  if (!authors.length) {
    throw new Error('At least one authored author is required');
  }
  for (const author of authors) {
    object(author, ['name', 'url'], 'author');
    string(author.name, 'author name', 150);
    if (author.url !== undefined) {
      https(author.url, 'author');
    }
  }
  object(metadata.owner, ['repository', 'path'], 'owner');
  if (
    metadata.owner.repository !== 'oborskyivitalii/oborskyivitalii' ||
    metadata.owner.path !== `site/publications/${articleId}`
  ) {
    throw new Error('Publication must declare its exact editable site owner');
  }
  object(metadata.rights, ['status', 'notice', 'references'], 'rights');
  if (!['review-pending', 'accepted'].includes(metadata.rights.status)) {
    throw new Error('Unknown rights decision state');
  }
  string(metadata.rights.notice, 'rights notice', 3000);
  for (const reference of array(metadata.rights.references, 'rights references', 30)) {
    https(reference, 'rights reference');
  }
  validateReferences(metadata.references);
  validatePlatforms(metadata);
  if (metadata.canonical !== null) {
    https(metadata.canonical, 'canonical');
  }
  if (metadata.translationOf !== undefined) {
    object(metadata.translationOf, ['articleId', 'editionId', 'sourceSha256'], 'translation');
    id(metadata.translationOf.articleId, 'translation source article');
    id(metadata.translationOf.editionId, 'translation source edition');
    if (
      metadata.translationOf.articleId === metadata.id ||
      !SHA.test(metadata.translationOf.sourceSha256)
    ) {
      throw new Error('Translation requires a distinct article and exact source digest');
    }
  }
  if (metadata.status === 'accepted' && metadata.rights.status !== 'accepted') {
    throw new Error('Accepted selection requires its per-item rights decision');
  }
  return metadata;
}

function validateAsset(root, asset, articleId, assetUrl) {
  object(asset, ['id', 'path', 'sha256', 'width', 'height', 'alt', 'caption', 'credit'], 'asset');
  id(asset.id, 'asset id');
  if (!SHA.test(asset.sha256)) {
    throw new Error('Asset requires its exact SHA256');
  }
  const prefix = `site/assets/publications/${articleId}/`;
  if (
    typeof asset.path !== 'string' ||
    !asset.path.startsWith(prefix) ||
    !asset.path.endsWith('.png')
  ) {
    throw new Error('Article assets must be declared local PNG files in their asset owner');
  }
  for (const dimension of ['width', 'height']) {
    if (!Number.isInteger(asset[dimension]) || asset[dimension] < 1 || asset[dimension] > 8000) {
      throw new Error('Asset dimensions exceed the 8000 pixel boundary');
    }
  }
  if (asset.width * asset.height > 16_000_000) {
    throw new Error('Asset exceeds 16 million pixels');
  }
  string(asset.alt, 'image alt', 1000);
  string(asset.caption, 'figure caption', 2000);
  string(asset.credit, 'figure credit', 2000);
  const input = readSource(root, asset.path, { maxBytes: 5_000_000 });
  const png = input.bytes;
  if (
    png.length < 33 ||
    png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
    png.subarray(12, 16).toString() !== 'IHDR' ||
    png.readUInt32BE(16) !== asset.width ||
    png.readUInt32BE(20) !== asset.height ||
    input.sha256 !== asset.sha256
  ) {
    throw new Error(`Asset bytes/dimensions do not match declaration: ${asset.id}`);
  }
  const result = { ...asset, digest: asset.sha256, mime: 'image/png', ...input };
  result.url = assetUrl ? assetUrl(result) : `/${asset.path.slice(5)}`;
  if (
    typeof result.url !== 'string' ||
    /[\0\r\n<>"']/.test(result.url) ||
    /^(?:javascript|data|file|http):/i.test(result.url)
  ) {
    throw new Error('Unsafe generated asset URL');
  }
  return result;
}

function loadEdition(root, directory, editionId, metadata, kind, expectedSource, baseEdition) {
  const relative = `${directory}/editions/${editionId}.json`;
  const { value: edition } = readJson(root, relative);
  object(
    edition,
    [
      'schema',
      'id',
      'articleId',
      'language',
      'kind',
      'source',
      'owner',
      'derivation',
      'rights',
      'semanticSha256',
    ],
    'content edition'
  );
  if (
    edition.schema !== 1 ||
    edition.id !== editionId ||
    edition.articleId !== metadata.id ||
    edition.language !== metadata.language ||
    edition.kind !== kind ||
    edition.owner !== 'site'
  ) {
    throw new Error('Content edition identity does not match its declared source');
  }
  object(edition.source, ['path', 'sha256', 'commit', 'blob'], 'edition source');
  if (edition.source.path !== expectedSource) {
    throw new Error('Content edition names a different source owner');
  }
  if (!['review-pending', 'accepted'].includes(edition.rights)) {
    throw new Error('Unknown edition rights decision');
  }
  if (!SHA.test(edition.semanticSha256)) {
    throw new Error('Content edition requires a semantic SHA256 pin');
  }
  if (kind === 'full-article' && edition.derivation !== null) {
    throw new Error('Full article cannot be an implicit platform adaptation');
  }
  if (kind === 'adaptation') {
    object(
      edition.derivation,
      ['relationship', 'baseEdition', 'baseSourceSha256', 'baseSemanticSha256'],
      'derivation'
    );
    if (
      edition.derivation.relationship !== 'adaptation' ||
      edition.derivation.baseEdition !== baseEdition.id ||
      edition.derivation.baseSourceSha256 !== baseEdition.source.sha256 ||
      edition.derivation.baseSemanticSha256 !== baseEdition.semanticSha256
    ) {
      throw new Error('Adaptation must pin the exact full content edition');
    }
  }
  const source = verifySource(root, `${directory}/${expectedSource}`, edition.source);
  const expectedSemantic =
    kind === 'full-article'
      ? semanticDigest(metadata, source)
      : adaptationDigest(metadata, source, baseEdition, expectedSource.split('/')[1].split('.')[0]);
  if (edition.semanticSha256 !== expectedSemantic) {
    throw new Error('Content edition semantic identity drifted; freeze a new edition');
  }
  if (
    metadata.status === 'accepted' &&
    (source.state !== 'committed' || edition.rights !== 'accepted')
  ) {
    throw new Error('Accepted content requires committed source and edition rights');
  }
  return { edition, source, input: relative };
}

function compile(markdown, assets, { title } = {}) {
  const toolchain = path.join(__dirname, 'toolchain');
  const declaration = JSON.parse(fs.readFileSync(path.join(toolchain, 'package.json'), 'utf8'));
  for (const name of ['unified', 'remark-parse', 'remark-gfm', 'remark-stringify']) {
    const installedPath = path.join(toolchain, 'node_modules', name, 'package.json');
    if (!fs.existsSync(installedPath)) {
      throw new Error(
        'Publisher dependencies are missing; run npm ci --ignore-scripts in its toolchain'
      );
    }
    const installed = JSON.parse(fs.readFileSync(installedPath, 'utf8'));
    if (installed.version !== declaration.dependencies[name]) {
      throw new Error(`Publisher dependency differs from its exact lock: ${name}`);
    }
  }
  const child = spawnSync(process.execPath, [path.join(__dirname, 'ast.mjs')], {
    input: JSON.stringify({
      markdown,
      title,
      assets: assets.map((asset) => ({
        id: asset.id,
        url: asset.url,
        uploadPath: asset.uploadPath,
        width: asset.width,
        height: asset.height,
        alt: asset.alt,
        caption: asset.caption,
        credit: asset.credit,
      })),
    }),
    encoding: 'utf8',
    maxBuffer: 8_000_000,
    timeout: 30_000,
  });
  if (child.error || child.status !== 0) {
    throw new Error(
      child.error
        ? `Article compiler failed: ${child.error.message}; ${child.stderr || ''}`
        : child.stderr.trim()
    );
  }
  return JSON.parse(child.stdout);
}

function enumerateArticles(root) {
  const directory = path.join(root, 'site/publications');
  if (!fs.existsSync(directory)) {
    return [];
  }
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && ID.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function validateTranslation(root, metadata) {
  if (!metadata.translationOf) {
    return [];
  }
  const declared = metadata.translationOf;
  const directory = `site/publications/${declared.articleId}`;
  const metadataPath = `${directory}/publication.json`;
  const { value: original } = readJson(root, metadataPath);
  validateMetadata(original, declared.articleId);
  const editionPath = `${directory}/editions/${declared.editionId}.json`;
  const { value: edition } = readJson(root, editionPath);
  if (
    original.language === metadata.language ||
    original.edition !== declared.editionId ||
    edition.id !== declared.editionId ||
    edition.articleId !== declared.articleId ||
    edition.kind !== 'full-article' ||
    edition.source.sha256 !== declared.sourceSha256
  ) {
    throw new Error('Translation does not match a distinct-language selected content edition');
  }
  const sourcePath = `${directory}/${original.source}`;
  const selected = loadEdition(
    root,
    directory,
    original.edition,
    original,
    'full-article',
    original.source
  );
  const assets = original.assets.map((asset) => validateAsset(root, asset, original.id));
  if (selected.edition.semanticSha256 !== semanticDigest(original, selected.source, assets)) {
    throw new Error('Translation target semantic edition drifted');
  }
  return [metadataPath, editionPath, sourcePath, ...assets.map((asset) => asset.path)];
}

function loadArticle(root, articleId, { assetUrl } = {}) {
  id(articleId, 'selected article');
  const directory = `site/publications/${articleId}`;
  const { value } = readJson(root, `${directory}/publication.json`);
  const metadata = validateMetadata(value, articleId);
  const assets = array(metadata.assets, 'assets', 50).map((asset) =>
    validateAsset(root, asset, articleId, assetUrl)
  );
  if (new Set(assets.map((asset) => asset.id)).size !== assets.length) {
    throw new Error('Duplicate article asset identity');
  }
  if (assets.reduce((total, asset) => total + asset.bytes.length, 0) > 16_000_000) {
    throw new Error('Declared article images exceed their 16 MB aggregate boundary');
  }
  const full = loadEdition(
    root,
    directory,
    metadata.edition,
    metadata,
    'full-article',
    metadata.source
  );
  const sourceBytes = readSource(root, `${directory}/${metadata.source}`);
  const result = compile(decodeUtf8(sourceBytes.bytes, full.source.path), assets, {
    title: metadata.title,
  });
  if (
    result.model.sections.some((section) => section.depth === 1 && section.id !== result.titleId)
  ) {
    throw new Error(
      'The full manuscript may contain only one leading title matching publication metadata'
    );
  }
  const inputs = [
    `${directory}/publication.json`,
    full.input,
    full.source.path,
    ...assets.map((asset) => asset.path),
    ...validateTranslation(root, metadata),
  ];
  const adaptations = {};
  for (const platform of ['linkedin', 'medium']) {
    const selection = metadata.platforms[platform];
    if (selection.mode === 'adaptation') {
      const adaptation = loadEdition(
        root,
        directory,
        selection.edition,
        metadata,
        'adaptation',
        selection.source,
        full.edition
      );
      const bytes = readSource(root, `${directory}/${selection.source}`);
      adaptations[platform] = {
        ...adaptation,
        ...compile(decodeUtf8(bytes.bytes, adaptation.source.path), assets),
      };
      inputs.push(adaptation.input, adaptation.source.path);
    }
  }
  const history = publicationEvents(root, directory, full.edition.id);
  const historyProof = verifyAppendOnlyHistory(root, articleId);
  if (
    metadata.canonical !== null &&
    !history.events.some(
      (event) =>
        event.platform === 'site' &&
        event.editionId === full.edition.id &&
        event.url === metadata.canonical
    )
  ) {
    throw new Error('Canonical must stay pending until exact production-served edition inspection');
  }
  inputs.push(...history.inputs);
  const article = {
    metadata: {
      ...metadata,
      published: history.published || null,
      modified: history.modified || null,
    },
    ...result,
    fullHtml: result.html,
    html: result.bodyHtml,
    sections: result.model.sections.filter((section) => section.id !== result.titleId),
    assets,
    source: full.source,
    edition: full.edition,
    adaptations,
    events: history.events,
    historyProof,
  };
  const selectedProfile = loadProfile(root, article);
  return {
    ...article,
    ...selectedProfile,
    inputs: [...new Set([...inputs, ...selectedProfile.inputs])].sort(),
  };
}

module.exports = {
  loadArticle,
  enumerateArticles,
  compile,
  validateMetadata,
  semanticDigest,
  adaptationDigest,
};
