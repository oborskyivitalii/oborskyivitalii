'use strict';

const { readSource } = require('./safety.cjs');

const formats = ['html', 'md', 'txt', 'copy-ready'];
const relationships = ['adaptation', 'equivalent-rendition'];
const platforms = ['linkedin', 'medium'];
const assetRoles = ['cover', 'hero'];
const digestPattern = /^[a-f0-9]{64}$/;
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function object(value, keys, context) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Profile ' + context + ' must be an object');
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) {
      throw new Error('Unknown profile ' + context + ' field: ' + key);
    }
  }
  return value;
}

function text(value, maximum, context) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.length > maximum ||
    value.includes('\0')
  ) {
    throw new Error('Invalid profile ' + context);
  }
  return value;
}

function utf8(bytes, context) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (error) {
    throw new Error('Profile ' + context + ' must be valid UTF-8', {
      cause: error,
    });
  }
}

function freeze(value) {
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') {
      freeze(child);
    }
  }
  return Object.freeze(value);
}

function platformSelection(profile, article, platform) {
  const selection = object(profile.platforms[platform], ['formats', 'relationship'], platform);
  if (
    !Array.isArray(selection.formats) ||
    selection.formats.length < 1 ||
    selection.formats.length > formats.length ||
    selection.formats.some((format) => !formats.includes(format)) ||
    new Set(selection.formats).size !== selection.formats.length
  ) {
    throw new Error('Invalid profile ' + platform + ' format selection');
  }
  if (
    !relationships.includes(selection.relationship) ||
    selection.relationship !== article.metadata.platforms[platform]?.mode
  ) {
    throw new Error('Profile ' + platform + ' relationship differs from the authored selection');
  }
  if (selection.relationship === 'adaptation' && !article.adaptations[platform]) {
    throw new Error('Profile ' + platform + ' adaptation is not declared by the article');
  }
}

function characterLimits(profile, article) {
  object(profile.limits, ['linkedinCharacters', 'mediumCharacters'], 'limits');
  for (const platform of platforms) {
    const name = platform + 'Characters';
    if (!Object.hasOwn(profile.limits, name)) {
      continue;
    }
    const limit = profile.limits[name];
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1_000_000) {
      throw new Error('Profile ' + name + ' must be an integer from 1 to 1000000');
    }
    const selected =
      profile.platforms[platform].relationship === 'adaptation'
        ? article.adaptations[platform]
        : article;
    if (typeof selected.text !== 'string') {
      throw new Error('Profile character limit requires compiled ' + platform + ' text');
    }
    // These authored bounds count Unicode code points, not a claimed platform rule.
    if (Array.from(selected.text).length > limit) {
      throw new Error('Profile ' + platform + ' text exceeds its authored character limit');
    }
  }
}

function namedLink(link, reference) {
  return (
    link.url === reference.url &&
    typeof link.text === 'string' &&
    link.text.trim() !== '' &&
    link.text.trim() !== reference.id &&
    link.text.trim() !== reference.url
  );
}

function readerSelection(profile, article) {
  if (profile.reader === undefined) {
    return;
  }
  const reader = object(
    profile.reader,
    ['references', 'presentation', 'images', 'equivalentImages'],
    'reader'
  );
  if (
    Object.keys(reader).length === 0 ||
    (reader.references !== undefined && reader.references !== 'inline') ||
    (reader.presentation !== undefined && !['links', 'download'].includes(reader.presentation)) ||
    (reader.images !== undefined && reader.images !== 'webp-lossless')
  ) {
    throw new Error('Invalid profile reader selection');
  }
  if (reader.equivalentImages !== undefined) {
    const selected = object(
      reader.equivalentImages,
      article.assets.map((asset) => asset.id),
      'equivalent images'
    );
    if (reader.images !== 'webp-lossless' || !Object.keys(selected).length)
      throw Error('Equivalent images require explicit lossless reader preparation');
    for (const entry of Object.values(selected)) {
      object(entry, ['path', 'sha256'], 'equivalent image');
      if (
        Object.keys(entry).length !== 2 ||
        !/^site\/assets\/[a-zA-Z0-9/_.-]+\.jpg$/.test(entry.path) ||
        entry.path.split('/').includes('..') ||
        !/^[a-f0-9]{64}$/.test(entry.sha256)
      )
        throw Error('Equivalent image requires a pinned source JPEG');
    }
  }
  const links = article.model?.links || [];
  if (
    reader.references === 'inline' &&
    article.metadata.references.some(
      (reference) => !links.some((link) => namedLink(link, reference))
    )
  ) {
    throw new Error('Inline references require a named manuscript link for every source');
  }
  if (['links', 'download'].includes(reader.presentation)) {
    const deck = article.presentation;
    if (
      !deck ||
      links.filter((link) => namedLink(link, { url: deck.sourceUrl })).length !== 1 ||
      links.filter((link) => link.url === deck.sourceUrl).length !== 1 ||
      article.model.figures.includes(deck.poster.id)
    ) {
      throw new Error('Linked presentation requires exactly one named PDF link and no poster');
    }
  }
}

function assetSelection(root, article, selection, role) {
  object(selection, ['id', 'omitReason'], role);
  if (Object.keys(selection).length !== 1) {
    throw new Error('Profile ' + role + ' requires one asset id or an authored omission reason');
  }
  if (Object.hasOwn(selection, 'omitReason')) {
    text(selection.omitReason, 1000, role + ' omission reason');
    return null;
  }
  const id = text(selection.id, 80, role + ' asset id');
  const asset = article.assets.find((entry) => entry.id === id);
  if (!asset) {
    throw new Error('Profile ' + role + ' refers to an undeclared article asset: ' + id);
  }
  const source = readSource(root, asset.path, { maxBytes: 5_000_000 });
  if (source.sha256 !== asset.sha256) {
    throw new Error('Profile ' + role + ' asset checksum mismatch');
  }
  const { path, sha256, width, height, alt, caption, credit } = asset;
  return Object.freeze({
    id,
    path,
    sha256,
    width,
    height,
    alt,
    caption,
    credit,
  });
}

function loadProfile(root, article) {
  if (
    !article?.metadata ||
    article.metadata.profile !== 'profile.json' ||
    !idPattern.test(article.metadata.id)
  ) {
    throw new Error('Article must declare its bounded profile.json owner');
  }
  const directory = 'site/publications/' + article.metadata.id;
  const profilePath = directory + '/profile.json';
  const input = readSource(root, profilePath, { maxBytes: 100_000 });
  const profile = object(
    JSON.parse(utf8(input.bytes, 'source')),
    ['schema', 'id', 'platforms', 'launch', 'seo', 'assets', 'limits', 'reader'],
    'record'
  );
  if (profile.schema !== 1 || !idPattern.test(text(profile.id, 80, 'id'))) {
    throw new Error('Invalid publication profile schema or id');
  }
  object(profile.platforms, platforms, 'platforms');
  for (const platform of platforms) {
    platformSelection(profile, article, platform);
  }
  object(profile.seo, ['title', 'summary'], 'SEO');
  text(profile.seo.title, 250, 'SEO title');
  text(profile.seo.summary, 1500, 'SEO summary');
  object(profile.launch, ['source', 'sha256'], 'launch');
  if (
    profile.launch.source !== 'launch-post.' + article.metadata.language + '.md' ||
    !digestPattern.test(profile.launch.sha256)
  ) {
    throw new Error('Profile launch requires its language-specific authored source and SHA-256');
  }
  const launchPath = directory + '/' + profile.launch.source;
  const launch = readSource(root, launchPath, { maxBytes: 50_000 });
  if (launch.sha256 !== profile.launch.sha256) {
    throw new Error('Profile launch post checksum mismatch');
  }
  text(utf8(launch.bytes, 'launch post'), 50_000, 'launch post');
  characterLimits(profile, article);
  readerSelection(profile, article);
  object(profile.assets, assetRoles, 'assets');
  const furniture = { seo: { ...profile.seo } };
  const inputs = [profilePath, launchPath];
  for (const role of assetRoles) {
    const asset = assetSelection(root, article, profile.assets[role], role);
    if (asset) {
      furniture[role] = asset;
      inputs.push(asset.path);
    }
  }
  return {
    profile: freeze(profile),
    inputs: [...new Set(inputs)].sort(),
    launch: { path: launchPath, sha256: launch.sha256, bytes: launch.bytes },
    furniture: freeze(furniture),
  };
}

module.exports = { loadProfile };
