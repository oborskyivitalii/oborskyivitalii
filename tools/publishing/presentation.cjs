'use strict';

const { readSource } = require('./safety.cjs');

function keys(value, allowed, context) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !allowed.includes(key))
  ) {
    throw Error('Invalid presentation ' + context);
  }
}

function loadPresentation(root, metadata, assets, assetUrl) {
  const value = metadata.presentation;
  if (value === undefined) return null;
  keys(value, ['title', 'poster', 'pdf', 'sourceUrl'], 'declaration');
  keys(value.pdf, ['path', 'sha256'], 'PDF');
  if (typeof value.title !== 'string' || !value.title.trim() || value.title.length > 250) {
    throw Error('Invalid presentation title');
  }
  const poster = assets.find((asset) => asset.id === value.poster);
  if (!poster) throw Error('Presentation poster must be a declared image');
  const prefix = 'site/assets/publications/' + metadata.id + '/';
  if (
    typeof value.pdf.path !== 'string' ||
    !value.pdf.path.startsWith(prefix) ||
    !/^[a-z0-9-]+\.pdf$/.test(value.pdf.path.slice(prefix.length)) ||
    !/^[a-f0-9]{64}$/.test(value.pdf.sha256)
  ) {
    throw Error('Invalid declared presentation PDF path or digest');
  }
  let source;
  try {
    source = new URL(value.sourceUrl);
  } catch {
    throw Error('Invalid presentation source URL');
  }
  if (source.protocol !== 'https:' || source.username || source.password) {
    throw Error('Unsafe presentation source URL');
  }
  const input = readSource(root, value.pdf.path, { maxBytes: 2_000_000 });
  const bytes = input.bytes;
  if (
    input.sha256 !== value.pdf.sha256 ||
    !bytes.subarray(0, 8).toString().startsWith('%PDF-') ||
    !bytes.subarray(-1024).toString().includes('%%EOF')
  ) {
    throw Error('Presentation PDF bytes do not match declaration');
  }
  const file = {
    ...input,
    path: value.pdf.path,
    id: 'presentation-pdf',
    digest: input.sha256,
    mime: 'application/pdf',
  };
  if (assets.some((asset) => asset.id === file.id)) {
    throw Error('Presentation PDF identity conflicts with an image');
  }
  file.url = assetUrl ? assetUrl(file) : '/' + file.path.slice(5);
  return { ...value, poster, file };
}

module.exports = { loadPresentation };
