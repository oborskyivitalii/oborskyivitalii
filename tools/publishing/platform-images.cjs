'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { figureHtml } = require('./render.cjs');
const { readSource } = require('./safety.cjs');
const { decodeUtf8 } = require('./text.cjs');

const platforms = ['linkedin', 'medium'];
const policies = {
  linkedin: { cover: [1920, 1080], inline: [1920, 1920] },
  medium: { featured: [1600, 1600], inline: [2000, 2000] },
};
const maxBytes = 2_000_000;
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');

function worker(images) {
  if (!images.length) return [];
  const venv = path.resolve(__dirname, '../quality/toolchain/venv/bin/python');
  const python = process.env.SITE_MEDIA_PYTHON || (fs.existsSync(venv) ? venv : 'python3');
  const child = spawnSync(python, [path.join(__dirname, 'platform-images.py')], {
    input: JSON.stringify(images),
    encoding: 'utf8',
    timeout: 60000,
    maxBuffer: 29_000_000,
  });
  if (child.error || child.status !== 0) {
    throw new Error('Platform image decoding/export failed: ' + (child.stderr || child.error));
  }
  const result = JSON.parse(child.stdout);
  if (!Array.isArray(result) || result.length !== images.length) {
    throw new Error('Platform image worker returned a different inventory');
  }
  return result;
}

function outputPath(platform, role, id) {
  if (role === 'inline') return `${platform}/inline/${id}.png`;
  return `${platform}/${role}.jpg`;
}

function makeImages(platform, inline, cover) {
  const coverRole = platform === 'linkedin' ? 'cover' : 'featured';
  const inputs = cover ? [{ source: cover, role: coverRole }] : [];
  const sharedFeatured = coverRole === 'featured' && inline.some((asset) => asset.id === cover?.id);
  for (const source of inline) {
    if (!sharedFeatured || source.id !== cover.id) inputs.push({ source, role: 'inline' });
  }
  const outputs = worker(
    inputs.map(({ source, role }) => {
      const [width, height] = policies[platform][role];
      return {
        base64: source.bytes.toString('base64'),
        policy: { role, width, height, bytes: maxBytes },
      };
    })
  ).map((image, index) => {
    const { source, role } = inputs[index];
    const bytes = Buffer.from(image.base64, 'base64');
    return {
      record: {
        id: source.id,
        role,
        path: outputPath(platform, role, source.id),
        sourceSha256: source.sha256,
        sha256: digest(bytes),
        width: image.width,
        height: image.height,
        bytes: bytes.length,
        mime: role === 'inline' ? 'image/png' : 'image/jpeg',
        alt: source.alt,
        caption: source.caption,
        credit: source.credit,
      },
      bytes,
    };
  });
  return {
    outputs,
    images: inline.map(
      (source) =>
        outputs.find(({ record }) => record.id === source.id && record.role !== 'cover').record
    ),
    cover: outputs.find(({ record }) => record.role === coverRole)?.record ?? null,
  };
}

function figure(record, url, leading = false) {
  return figureHtml({ ...record, id: leading ? 'medium:featured-upload' : record.id, url }, true);
}

function embedded(record, bytes) {
  return `data:${record.mime};base64,${bytes.toString('base64')}`;
}

function leadingFeatured(inventory) {
  return (
    inventory.platform === 'medium' &&
    inventory.cover &&
    !inventory.images.some((image) => image.path === inventory.cover.path)
  );
}

function placeImages(body, inventory, assets, outputs, inlineData) {
  const url = (record) =>
    inlineData
      ? embedded(record, outputs.find((entry) => entry.record.path === record.path).bytes)
      : record.path;
  for (const record of inventory.images) {
    const source = assets.find((asset) => asset.id === record.id);
    body = body.replace(figureHtml(source, true), () => figure(record, url(record)));
  }
  if (leadingFeatured(inventory)) {
    body = figure(inventory.cover, url(inventory.cover), true) + body;
  }
  return body;
}

function verifyImages(directory, manifest) {
  const sources = new Map();
  const originalFiles = manifest.assets.map((item) =>
    readSource(directory, item.path, { maxBytes: 5_000_000 })
  );
  if (originalFiles.reduce((total, file) => total + file.bytes.length, 0) > 16_000_000) {
    throw new Error('Platform source images exceed the aggregate byte budget');
  }
  const decodedSources = worker(
    originalFiles.map((file) => ({ base64: file.bytes.toString('base64') }))
  );
  for (const [index, file] of originalFiles.entries()) {
    if (file.sha256 !== manifest.assets[index].sha256 || decodedSources[index].format !== 'PNG') {
      throw new Error('Platform source image bytes differ from their identity');
    }
    const item = manifest.assets[index];
    sources.set(item.id, { ...item, ...decodedSources[index] });
  }
  for (const platform of platforms) {
    verifyPlatform(directory, manifest, sources, platform);
  }
}

function verifyPlatform(directory, manifest, sources, platform) {
  const inventoryPath = `${platform}-upload-kit.json`;
  const { bytes } = readSource(directory, inventoryPath);
  const inventory = JSON.parse(decodeUtf8(bytes, inventoryPath));
  const { images, cover } = inventory;
  const selectedCover = manifest.profile.furniture.cover;
  const selection = manifest.transformations.find((item) => item.platform === platform);
  const sourceBound =
    manifest.platformImages === 2 ||
    selection?.figures !== undefined ||
    selection?.uploadInventorySha256 !== undefined;
  const figureFields = ({ id, alt, caption, credit }) => ({ id, alt, caption, credit });
  if (
    inventory.schema !== 2 ||
    inventory.platform !== platform ||
    inventory.articleId !== manifest.articleId ||
    inventory.contentEdition !== selection?.contentEdition ||
    Boolean(cover) !== Boolean(selectedCover) ||
    (cover &&
      (cover.id !== selectedCover.id ||
        cover.role !== (platform === 'linkedin' ? 'cover' : 'featured'))) ||
    !Array.isArray(images) ||
    images.length > 50 ||
    (sourceBound &&
      JSON.stringify(images.map(figureFields)) !== JSON.stringify(selection.figures)) ||
    new Set(images.map((item) => item.id)).size !== images.length ||
    images.some(
      (item) =>
        item.role !== 'inline' &&
        (platform !== 'medium' || !cover || JSON.stringify(item) !== JSON.stringify(cover))
    )
  ) {
    throw new Error('Platform upload inventory does not match its edition and roles');
  }
  if (sourceBound && digest(bytes) !== selection.uploadInventorySha256) {
    throw new Error('Platform upload inventory differs from the source-bound rendition');
  }

  const records = new Map([...(cover ? [cover] : []), ...images].map((item) => [item.path, item]));
  const platformOutputs = manifest.outputs.filter((file) => file.path.startsWith(platform + '/'));
  if (
    platformOutputs.length !== records.size ||
    platformOutputs.some((file) => !records.has(file.path))
  ) {
    throw new Error('Platform upload inventory differs from its output files');
  }
  const files = [...records.values()].map((item) => {
    const expectedPath = outputPath(platform, item.role, item.id);
    if (
      !sources.has(item.id) ||
      item.path !== expectedPath ||
      item.sourceSha256 !== sources.get(item.id).sha256
    ) {
      throw new Error('Platform image source or path differs from its declared role');
    }
    if (
      item.role !== 'inline' &&
      (item.sourceSha256 !== selectedCover.sha256 ||
        item.alt !== selectedCover.alt ||
        item.caption !== selectedCover.caption ||
        item.credit !== selectedCover.credit)
    ) {
      throw new Error('Platform cover metadata differs from its source');
    }
    const file = readSource(directory, item.path, { maxBytes });
    if (file.sha256 !== item.sha256 || file.bytes.length !== item.bytes) {
      throw new Error('Platform image bytes differ from the upload inventory');
    }
    return file;
  });
  if (files.reduce((total, file) => total + file.bytes.length, 0) > 20_000_000) {
    throw new Error('Platform upload files exceed their aggregate byte budget');
  }
  const measured = worker(files.map((file) => ({ base64: file.bytes.toString('base64') })));
  const payloads = new Map();
  const fitsSource = (item) => {
    const source = sources.get(item.id);
    return (
      item.width <= source.width &&
      item.height <= source.height &&
      Math.abs(item.width * source.height - item.height * source.width) <=
        Math.max(source.width, source.height)
    );
  };
  for (const [index, item] of [...records.values()].entries()) {
    const actual = measured[index];
    const [width, height] = policies[platform][item.role];
    const format = item.role === 'inline' ? 'PNG' : 'JPEG';
    if (
      item.mime !== 'image/' + format.toLowerCase() ||
      actual.format !== format ||
      actual.width !== item.width ||
      actual.height !== item.height ||
      item.width > width ||
      item.height > height ||
      (item.role === 'cover' ? item.width !== width || item.height !== height : !fitsSource(item))
    ) {
      throw new Error('Decoded platform image does not match its format or size contract');
    }
    payloads.set(item.path, files[index].bytes);
  }
  for (const format of ['html', 'copy-ready']) {
    if (!manifest.profile.selection.platforms[platform].formats.includes(format)) continue;
    const copy = format === 'copy-ready';
    const file = copy ? `${platform}-copy-ready.html` : `${platform}.html`;
    const html = decodeUtf8(readSource(directory, file, { maxBytes: 32_000_000 }).bytes, file);
    const url = (item) => (copy ? embedded(item, payloads.get(item.path)) : item.path);
    const expected = images.map((item) => figure(item, url(item)));
    if (leadingFeatured(inventory)) expected.unshift(figure(cover, url(cover), true));
    const actual = html.match(/<figure id="figure-[^"]+">[\s\S]*?<\/figure>\n/g) || [];
    if (
      actual.length !== expected.length ||
      actual.some((markup, index) => markup !== expected[index])
    ) {
      throw new Error('Platform HTML images differ from the upload inventory');
    }
  }
}

module.exports = { platforms, makeImages, placeImages, verifyImages, leadingFeatured };
