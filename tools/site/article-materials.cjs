'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const net = require('node:net');
const { TextDecoder } = require('node:util');
const {
  escapeText,
  escapeAttribute,
  substitute,
  validateFragment,
  stableTagEndings,
} = require('./html.cjs');
const templatePath = 'site/templates/components/article-materials.html';
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const shaPattern = /^[a-f0-9]{64}$/;

function object(value, fields, name) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== fields.length ||
    fields.some((key) => !Object.hasOwn(value, key))
  ) {
    throw Error(`Missing or unknown material ${name} fields`);
  }
}

function text(value, name, maximum = 500) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.length > maximum ||
    /[\0\r]/.test(value)
  ) {
    throw Error(`Invalid material ${name}`);
  }
}

function timestamp(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value.replace('Z', '.000Z')
  ) {
    throw Error('Invalid material observation/review timestamp');
  }
}

function publicURL(value) {
  text(value, 'URL', 2500);
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw Error('Invalid public material URL');
  }
  const host = parsed.hostname.toLowerCase();
  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    net.isIP(host) ||
    host.includes(':') ||
    !host.includes('.') ||
    /(?:^|\.)(?:localhost|local|internal|invalid|example|test)$/.test(host) ||
    host.endsWith('.pages.dev') ||
    /(?:^|[.-])(?:staging|preview|pr-\d+)(?:[.-]|$)/.test(host)
  ) {
    throw Error('Material URL must use an actual public HTTPS host');
  }
  return parsed;
}

function articleLink(article, section = null) {
  if (section !== null && !article.sections.some((entry) => entry.id === section)) {
    throw Error('Unknown article backlink section');
  }
  if (!article.metadata.canonical) return null;
  const url = publicURL(article.metadata.canonical);
  if (url.hash || url.search) throw Error('Article canonical URL must have no query or fragment');
  return url.href + (section === null ? '' : '#' + encodeURIComponent(section));
}

function read(root, relative, maximum = 100000) {
  if (
    typeof relative !== 'string' ||
    path.isAbsolute(relative) ||
    /[\\\0]/.test(relative) ||
    relative.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw Error('Unsafe public material path');
  }
  let current = path.resolve(root);
  const parts = relative.split('/');
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    const stat = fs.lstatSync(current);
    if (
      stat.isSymbolicLink() ||
      (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory())
    ) {
      throw Error('Material input must be regular, not a symlink');
    }
    if (index === parts.length - 1 && (stat.nlink !== 1 || stat.size > maximum)) {
      throw Error('Material input exceeds its regular-file byte bound');
    }
  }
  const fd = fs.openSync(current, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  let bytes;
  try {
    const buffer = Buffer.alloc(maximum + 1);
    const length = fs.readSync(fd, buffer, 0, buffer.length, 0);
    if (length > maximum) throw Error('Material input exceeds byte bound');
    bytes = buffer.subarray(0, length);
  } finally {
    fs.closeSync(fd);
  }
  return { path: relative, bytes, digest: digest(bytes), sha256: digest(bytes) };
}

function pinned(root, directory, declaration, pattern, maximum = 100000) {
  object(declaration, ['path', 'sha256'], 'file pin');
  if (!pattern.test(declaration.path) || !shaPattern.test(declaration.sha256)) {
    throw Error('Invalid public material path/digest');
  }
  const file = read(root, `${directory}/${declaration.path}`, maximum);
  if (file.digest !== declaration.sha256) throw Error('Stale material file/evidence digest');
  if (
    declaration.path.endsWith('.md') &&
    !new TextDecoder('utf-8', { fatal: true }).decode(file.bytes).trim()
  ) {
    throw Error('Empty material review/observation evidence');
  }
  return file;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])])
    );
  }
  return value;
}

function reviewBinding(declaration, item) {
  const input = { ...item };
  delete input.approval;
  return digest(
    JSON.stringify(
      stable({
        schema: 1,
        articleId: declaration.articleId,
        source: declaration.source,
        item: input,
      })
    )
  );
}

function target(root, directory, item, article) {
  if (item.target?.kind === 'asset') {
    object(item.target, ['kind', 'id', 'sha256'], 'existing asset target');
    const asset = article.assets.find((entry) => entry.id === item.target.id);
    if (
      item.kind !== 'image' ||
      !asset ||
      (asset.sourceDigest || asset.sha256 || asset.digest) !== item.target.sha256
    ) {
      throw Error('Stale or unknown existing material asset');
    }
    return {
      href: `article-media/${asset.digest}/${asset.outputName || path.posix.basename(asset.path)}`,
      assets: [],
      inputs: [],
    };
  }
  if (item.target?.kind === 'file') {
    object(item.target, ['kind', 'path', 'sha256', 'mime'], 'file target');
    const assetDirectory = directory.replace('site/publications/', 'site/assets/publications/');
    const file = pinned(
      root,
      assetDirectory,
      { path: item.target.path, sha256: item.target.sha256 },
      /^materials\/[a-z0-9][a-z0-9-]*\.(?:pdf|png)$/,
      2000000
    );
    const expectedMime = item.kind === 'image' ? 'image/png' : 'application/pdf';
    if (
      !['pdf', 'presentation', 'carousel', 'image'].includes(item.kind) ||
      item.target.mime !== expectedMime
    ) {
      throw Error('Material kind does not match its file MIME');
    }
    if (item.target.mime === 'application/pdf') {
      if (!file.path.endsWith('.pdf') || !file.bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
        throw Error('Material PDF signature/extension differs');
      }
    } else if (item.target.mime === 'image/png') {
      if (
        !file.path.endsWith('.png') ||
        file.bytes.length < 33 ||
        !file.bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
        file.bytes.subarray(12, 16).toString() !== 'IHDR'
      ) {
        throw Error('Material PNG signature/extension differs');
      }
      const width = file.bytes.readUInt32BE(16),
        height = file.bytes.readUInt32BE(20);
      if (width < 1 || height < 1 || width > 8000 || height > 8000 || width * height > 16000000)
        throw Error('Material PNG dimensions exceed the bounded image contract');
    } else {
      throw Error('Unsupported public material MIME');
    }
    return {
      href: `article-media/${file.digest}/${path.posix.basename(file.path)}`,
      assets: [{ ...file, mime: item.target.mime, credit: item.credit }],
      inputs: [file.path],
    };
  }
  object(item.target, ['kind', 'url', 'observedAt', 'evidence'], 'external target');
  if (item.target.kind !== 'external') throw Error('Unknown public material target');
  const url = publicURL(item.target.url);
  const domains = {
    linkedin: ['linkedin.com'],
    medium: ['medium.com'],
    video: ['youtube.com', 'youtu.be', 'vimeo.com'],
  };
  if (
    !domains[item.kind]?.some(
      (domain) => url.hostname === domain || url.hostname.endsWith('.' + domain)
    )
  ) {
    throw Error('Material URL host does not match its channel');
  }
  timestamp(item.target.observedAt);
  const proof = pinned(
    root,
    directory,
    item.target.evidence,
    new RegExp(`^materials/observations/${item.id}\\.md$`)
  );
  return { href: url.href, assets: [], inputs: [proof.path] };
}

function load(root, article) {
  const articleId = article.metadata.id;
  if (typeof articleId !== 'string' || !idPattern.test(articleId))
    throw Error('Invalid public materials article id');
  const directory = `site/publications/${articleId}`;
  const file = `${directory}/materials.json`;
  try {
    fs.lstatSync(path.join(root, file));
  } catch (error) {
    if (error.code === 'ENOENT') return { html: '', assets: [], inputs: [], declaration: file };
    throw error;
  }
  const declaration = JSON.parse(
    new TextDecoder('utf-8', { fatal: true }).decode(read(root, file).bytes)
  );
  object(declaration, ['schema', 'articleId', 'source', 'items'], 'declaration');
  object(declaration.source, ['editionId', 'semanticSha256'], 'source');
  if (
    declaration.schema !== 1 ||
    declaration.articleId !== articleId ||
    !Array.isArray(declaration.items) ||
    declaration.items.length > 16
  ) {
    throw Error('Invalid public materials schema/article/count');
  }
  const inputs = [file];
  const assets = [];
  const rows = [];
  const publicItems = [];
  const ids = new Set();
  for (const item of declaration.items) {
    object(
      item,
      ['id', 'kind', 'label', 'description', 'credit', 'visibility', 'target', 'approval'],
      'item'
    );
    if (typeof item.id !== 'string' || !idPattern.test(item.id) || ids.has(item.id))
      throw Error('Invalid/duplicate material id');
    ids.add(item.id);
    if (
      !['pdf', 'presentation', 'carousel', 'image', 'linkedin', 'medium', 'video'].includes(
        item.kind
      ) ||
      !['private', 'public'].includes(item.visibility)
    )
      throw Error('Invalid material kind/visibility');
    if (item.visibility !== 'public' || item.approval === null) continue;
    if (
      declaration.source.editionId !== article.edition.id ||
      declaration.source.semanticSha256 !== article.edition.semanticSha256
    ) {
      throw Error('Stale public material source binding');
    }
    for (const key of ['label', 'description', 'credit']) text(item[key], key);
    object(item.approval, ['bindingSha256', 'reviewedAt', 'evidence'], 'approval');
    timestamp(item.approval.reviewedAt);
    if (item.approval.bindingSha256 !== reviewBinding(declaration, item))
      throw Error('Stale public material review binding');
    const evidence = pinned(
      root,
      directory,
      item.approval.evidence,
      new RegExp(`^materials/reviews/${item.id}\\.md$`)
    );
    const selected = target(root, directory, item, article);
    publicItems.push(item);
    inputs.push(evidence.path, ...selected.inputs);
    assets.push(...selected.assets);
    rows.push(
      `<li><a href="${escapeAttribute(selected.href)}">${escapeText(item.label)}</a>` +
        `<p>${escapeText(item.description)}</p><p>${escapeText(item.credit)}</p></li>`
    );
  }
  if (!rows.length) return { html: '', assets: [], inputs, declaration: file };
  if (article.sections.some((section) => section.id === 'article-materials')) {
    throw Error('Article materials section id conflicts with authored content');
  }
  if (assets.reduce((total, asset) => total + asset.bytes.length, 0) > 16000000) {
    throw Error('Public material aggregate byte bound');
  }
  const template = new TextDecoder('utf-8', { fatal: true }).decode(read(root, templatePath).bytes);
  const binding = digest(
    JSON.stringify(
      stable({
        schema: declaration.schema,
        articleId,
        source: declaration.source,
        items: publicItems,
      })
    )
  );
  const html = stableTagEndings(
    substitute(template, { ITEMS: rows.join('\n'), BINDING: binding }, 'public article materials')
  );
  validateFragment(html, 'public article materials');
  return { html, assets, inputs: [...new Set([...inputs, templatePath])], declaration: file };
}

module.exports = { load, reviewBinding, articleLink };
