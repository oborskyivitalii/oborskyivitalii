'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function validText(value) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(++i);
      assert.ok(next >= 0xdc00 && next <= 0xdfff, 'unpaired Unicode surrogate');
    } else assert.ok(code < 0xdc00 || code > 0xdfff, 'unpaired Unicode surrogate');
  }
  return value;
}
function canonical(value) {
  if (value === null || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), 'nonfinite JSON number');
    return JSON.stringify(value);
  }
  if (typeof value === 'string') return JSON.stringify(validText(value));
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  assert.ok(value && Object.getPrototypeOf(value) === Object.prototype, 'JSON object required');
  return (
    '{' +
    Object.keys(value)
      .sort()
      .map((key) => JSON.stringify(validText(key)) + ':' + canonical(value[key]))
      .join(',') +
    '}'
  );
}
function parse(bytes) {
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const value = JSON.parse(text);
  const stack = [];
  // JSON.parse checks the grammar; this second lexical pass preserves duplicate-key faults.
  for (const match of text.matchAll(/"(?:[^"\\]|\\.)*"|[{}[\]:,]|[^{}[\]:,\s]+/g)) {
    const token = match[0],
      frame = stack.at(-1);
    if (token === '{') stack.push({ keys: new Set(), key: true });
    else if (token === '[') stack.push({ keys: null });
    else if (token === '}' || token === ']') stack.pop();
    else if (token === ',' && frame?.keys) frame.key = true;
    else if (token.startsWith('"') && frame?.keys && frame.key) {
      const key = JSON.parse(token);
      assert.ok(!frame.keys.has(key), 'duplicate JSON key ' + key);
      frame.keys.add(key);
      frame.key = false;
    }
  }
  canonical(value);
  return value;
}
function safePath(value) {
  assert.equal(typeof value, 'string', 'path must be text');
  validText(value);
  assert.ok(value && !/[\0\r\n\\]/.test(value), 'unsafe path');
  assert.ok(
    value.split('/').every((part) => part && part !== '.' && part !== '..'),
    'unsafe path'
  );
  return value;
}

module.exports = { digest, validText, canonical, parse, safePath };
