'use strict';

// Explicit browser diagnostic, run after installing the locked renderer.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const { frameMarkup, documentHTML, renderDocuments } = require('../tools/distribution/render.cjs');

const root = path.resolve(__dirname, '..');
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1ioAAAAASUVORK5CYII=',
  'base64'
);

function frame(layout = 'text', image = null, headline = 'A bounded source argument') {
  return frameMarkup(
    {
      TEMPLATE: layout,
      SPEAKER: 'Test author',
      EDITION: 'Review',
      KICKER: 'Synthetic diagnostic',
      HEADLINE: headline,
      EVENT: '',
      SUPPORT: 'This is a renderer fixture, not an observed result.',
      DATE: 'Synthetic essay',
      DETAILS: '',
      DESTINATION: '',
      CREDIT: 'Test fixture',
    },
    image
  );
}

test('actual renderer emits seven equal-size pages and frame PNGs with decoded cover media', async (t) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'article-render-positive-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  const frames = [frame('cover', png), ...Array.from({ length: 6 }, () => frame())];
  const report = await renderDocuments(
    [{ id: 'carousel', html: documentHTML(root, 'en', 'Fixture', frames) }],
    output
  );
  assert.deepEqual(report.pages, [
    { piece: 'carousel', width: 1080, height: 1350, frames: 7, images: 1, overflow: [] },
  ]);
  const info = cp.execFileSync(
    'pdfinfo',
    ['-f', '1', '-l', '7', path.join(output, 'carousel.pdf')],
    { encoding: 'utf8' }
  );
  assert.match(info, /Pages:\s+7\b/);
  const sizes = [...info.matchAll(/Page\s+\d+ size:\s+([\d.]+) x ([\d.]+) pts/g)].map((match) => [
    Number(match[1]),
    Number(match[2]),
  ]);
  assert.equal(sizes.length, 7);
  assert.ok(
    sizes.every(([width, height]) => Math.abs(width - 810) < 1 && Math.abs(height - 1012.5) < 1)
  );
  for (let index = 1; index <= 7; index++) {
    const bytes = fs.readFileSync(
      path.join(output, `carousel-${String(index).padStart(2, '0')}.png`)
    );
    assert.equal(bytes.readUInt32BE(16), 1080);
    assert.equal(bytes.readUInt32BE(20), 1350);
  }
});

test('actual renderer refuses undecodable media, hidden media and overflowing text before export', async (t) => {
  const cases = [
    [frame('cover', png.subarray(0, 33)), /Undecodable promotion image/],
    [frame('text', png), /decoded and visible/],
    [frame('text', null, 'Overflowing heading '.repeat(70)), /text overflow/],
  ];
  for (const [fragment, expected] of cases) {
    const output = fs.mkdtempSync(path.join(os.tmpdir(), 'article-render-negative-'));
    t.after(() => fs.rmSync(output, { recursive: true, force: true }));
    await assert.rejects(
      renderDocuments(
        [{ id: 'invalid', html: documentHTML(root, 'en', 'Fixture', [fragment]) }],
        output
      ),
      expected
    );
    assert.equal(fs.existsSync(path.join(output, 'invalid.png')), false);
    assert.equal(fs.existsSync(path.join(output, 'invalid.pdf')), false);
  }
});
