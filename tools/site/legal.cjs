'use strict';
// Four authored owners supply exact full texts; the template owns their layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { escapeText, validateFragment, stableTagEndings } = require('./html.cjs');
const sources = {
  scope: 'LICENSING.md',
  code: 'LICENSE-CODE.md',
  content: 'LICENSE-CONTENT.md',
  notices: 'NOTICE.md',
};
const template = 'site/templates/components/legal-notices.html';
const marker = '<!-- SITE_LEGAL_NOTICES -->';
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function compile(root) {
  let html = fs.readFileSync(path.join(root, template), 'utf8');
  const files = {};
  for (const [id, source] of Object.entries(sources)) {
    const file = path.join(root, source);
    const info = fs.lstatSync(file);
    assert.ok(info.isFile() && !info.isSymbolicLink(), 'regular authored legal source required');
    const bytes = fs.readFileSync(file);
    assert.ok(bytes.length > 0 && bytes.length <= 65536, 'legal source size bound');
    assert.ok(Buffer.from(bytes.toString('utf8')).equals(bytes), 'UTF-8 legal source required');
    const token = '{{LEGAL_' + id.toUpperCase() + '}}';
    assert.equal(html.split(token).length, 2, 'one exact legal text slot');
    html = html.replace(token, () => escapeText(bytes.toString('utf8')));
    files[id] = { source, sha256: digest(bytes), anchor: 'license-' + id };
  }
  assert.doesNotMatch(html, /\{\{/, 'unknown legal text slot');
  html = stableTagEndings(html);
  validateFragment(html, 'full legal notices');
  return { html, files, inputs: [template, ...Object.values(sources)] };
}

function attach(main, notices) {
  assert.equal(main.split(marker).length, 2, 'one Credits legal notice marker');
  return main.replace(marker, () => notices.html);
}

module.exports = { sources, template, marker, compile, attach };
