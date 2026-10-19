'use strict';
// Hosted rendition adapter. Original publication assets and editions stay unchanged.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const { readSource } = require('../publishing/safety.cjs');
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function encode(assets) {
  const venv = path.resolve(__dirname, '../quality/toolchain/venv/bin/python');
  const python = process.env.SITE_MEDIA_PYTHON || (fs.existsSync(venv) ? venv : 'python3');
  const child = cp.spawnSync(python, [path.resolve(__dirname, '../publishing/web-media.py')], {
    input: JSON.stringify({
      schema: 1,
      images: assets.map((asset) => ({
        sha256: asset.digest,
        width: asset.width,
        height: asset.height,
        base64: asset.bytes.toString('base64'),
      })),
    }),
    encoding: 'utf8',
    timeout: 60000,
    maxBuffer: 32000000,
  });
  if (child.error || child.status !== 0)
    throw Error('Lossless article media preparation failed: ' + (child.stderr || child.error));
  const result = JSON.parse(child.stdout);
  if (result.schema !== 1 || result.images?.length !== assets.length)
    throw Error('Lossless article media inventory differs');
  return result.images.map((item, index) => {
    const source = assets[index];
    const bytes = Buffer.from(item.base64, 'base64');
    if (
      item.sourceSha256 !== source.digest ||
      item.sha256 !== digest(bytes) ||
      item.width !== source.width ||
      item.height !== source.height ||
      bytes.toString('ascii', 0, 4) !== 'RIFF' ||
      bytes.toString('ascii', 8, 12) !== 'WEBP' ||
      !/^[a-f0-9]{64}$/.test(item.pixelSha256) ||
      !/^[a-f0-9]{64}$/.test(item.iccSha256)
    )
      throw Error('Lossless article media source or output identity differs');
    return {
      ...source,
      bytes,
      digest: item.sha256,
      sourceDigest: source.digest,
      outputName: path.posix.basename(source.path).replace(/\.png$/, '.webp'),
      mime: 'image/webp',
      rendition: {
        schema: 1,
        kind: 'webp-lossless',
        sourceSha256: source.digest,
        pixelSha256: item.pixelSha256,
        iccSha256: item.iccSha256,
        pillow: result.pillow,
        webp: result.webp,
      },
    };
  });
}

function render(root, article, assetName) {
  if (article.profile.reader?.images !== 'webp-lossless' || !article.assets.length) return article;
  const assets = encode(article.assets).map((asset) => ({ ...asset, url: assetName(asset) }));
  const source = readSource(root, article.source.path);
  if (source.sha256 !== article.source.sha256)
    throw Error('Article changed during media preparation');
  const rendered = require('../publishing/article.cjs').compile(
    new TextDecoder('utf-8', { fatal: true }).decode(source.bytes),
    assets,
    { title: article.metadata.title }
  );
  return {
    ...article,
    ...rendered,
    fullHtml: rendered.html,
    html: rendered.bodyHtml,
    sections: rendered.model.sections.filter((section) => section.id !== rendered.titleId),
    assets,
  };
}

module.exports = { encode, render };
