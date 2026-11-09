'use strict';
// One escaped metadata block for the existing default and declared article covers.
const { escapeAttribute } = require('./html.cjs');
const assert = require('node:assert/strict');

function validate(image, assets) {
  assert.deepEqual(Object.keys(image).sort(), ['alt', 'file', 'height', 'type', 'width']);
  assert.match(image.file, /^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*-social\.jpg$/);
  assert.ok(assets.includes(image.file), 'social image missing from article closure');
  assert.equal(image.type, 'image/jpeg');
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
  assert.ok(typeof image.alt === 'string' && image.alt.trim() && image.alt.length <= 1000);
}

function metadata(image, origin) {
  const values = {
    'og:image': origin + '/' + image.file,
    'og:image:type': image.type,
    'og:image:width': image.width,
    'og:image:height': image.height,
    'og:image:alt': image.alt,
    'twitter:image': origin + '/' + image.file,
    'twitter:image:alt': image.alt,
  };
  return Object.entries(values)
    .map(
      ([key, value]) =>
        `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escapeAttribute(value)}">\n`
    )
    .join('');
}

module.exports = { metadata, validate };
