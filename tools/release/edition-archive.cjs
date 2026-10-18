'use strict';
// Historical admission consumes only the frozen public edition, never today's
// portrait, authored social descriptor or reviewed-runtime selection table.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const artifact = require('../quality/artifact.cjs');
const snapshot = require('../site/snapshot.cjs');
const origin = 'https://vitaliioborskyi.ai';
const routeURL = (id) => origin + (id === 'index' ? '/' : '/' + id + '.html');
const socialKeys = [
  'og:image',
  'og:image:type',
  'og:image:width',
  'og:image:height',
  'og:image:alt',
  'twitter:image',
  'twitter:image:alt',
];

function socialTags(html) {
  const tags = [
    ...html.matchAll(
      /<meta (?:property|name)="((?:og|twitter):image(?::[a-z]+)?)" content="([^"]*)">/g
    ),
  ];
  assert.deepEqual(
    tags.map((tag) => tag[1]).sort(),
    [...socialKeys].sort(),
    'archived social metadata inventory'
  );
  return Object.fromEntries(tags.map((tag) => [tag[1], tag[2]]));
}

function jpegDimensions(bytes) {
  assert.ok(
    bytes.length > 4 && bytes.readUInt16BE(0) === 0xffd8,
    'archived social image is not JPEG'
  );
  for (let offset = 2; offset + 9 <= bytes.length; ) {
    assert.equal(bytes[offset], 0xff, 'invalid archived JPEG marker');
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    assert.ok(length >= 2 && offset + 2 + length <= bytes.length, 'invalid archived JPEG segment');
    if (
      [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
        marker
      )
    ) {
      assert.ok(length >= 8, 'invalid archived JPEG dimensions');
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  throw Error('missing archived JPEG dimensions');
}

function socialDescriptor(tags, record, read) {
  const url = new URL(tags['og:image']);
  assert.equal(url.origin, origin, 'archived social image has a foreign origin');
  assert.equal(url.search + url.hash, '');
  const file = url.pathname.slice(1);
  assert.match(file, /^assets\/[a-z0-9.-]+$/, 'invalid archived social image path');
  assert.ok(Object.hasOwn(record.files, file), 'missing archived social image');
  assert.equal(tags['twitter:image'], tags['og:image']);
  assert.equal(tags['og:image:type'], 'image/jpeg');
  assert.ok(
    tags['og:image:alt'] && tags['og:image:alt'].length <= 500,
    'missing archived social image alt'
  );
  assert.equal(tags['twitter:image:alt'], tags['og:image:alt']);
  const dimensions = jpegDimensions(read(file));
  for (const key of ['width', 'height']) {
    assert.ok(dimensions[key] > 0 && dimensions[key] <= 8192, 'invalid archived social image size');
    assert.equal(
      tags['og:image:' + key],
      String(dimensions[key]),
      'archived social image dimensions differ'
    );
  }
  return { file, type: tags['og:image:type'], ...dimensions, alt: tags['og:image:alt'] };
}

function verify(directory, record) {
  assert.deepEqual(record.edition, { id: 'production', indexable: true, origin });
  assert.ok(['base', 'color'].includes(record.components.variant?.id || 'base'));
  const publicDirectory = path.join(directory, 'public');
  artifact.verify(publicDirectory, record, record.artifactDigest);
  const read = (name) => fs.readFileSync(path.join(publicDirectory, name));
  const tags = socialTags(read('index.html').toString());
  const social = socialDescriptor(tags, record, read);
  for (const id of snapshot.routes) {
    for (const file of [id + '.html', record.components.routes[id].url]) {
      const html = read(file).toString();
      assert.match(html, /name="robots" content="index,follow"/);
      assert.ok(html.includes('<link rel="canonical" href="' + routeURL(id) + '">'));
      assert.deepEqual(socialTags(html), tags, 'archived route social metadata differs');
      assert.doesNotMatch(html, /class="site-environment"|name="robots" content="noindex/);
    }
  }
  const robots = read('robots.txt').toString();
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Disallow: \/staging\/$/m);
  assert.ok(robots.includes('Sitemap: ' + origin + '/sitemap.xml'));
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m);
  const locations = [
    ...read('sitemap.xml')
      .toString()
      .matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  assert.deepEqual(locations, snapshot.routes.map(routeURL), 'archived sitemap routes differ');
  const notFound = read('404.html').toString();
  assert.match(notFound, /name="robots" content="noindex,nofollow"/);
  assert.ok(notFound.includes('href="/"'), 'archived 404 has no home route');
  return social;
}

module.exports = { origin, routeURL, verify };
