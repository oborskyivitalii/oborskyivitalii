'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const remote = require('../tools/quality/lcp-remote.cjs');
const SDK = 'https://static.cloudflareinsights.com/beacon.min.js';

function response(overrides = {}) {
  return {
    url: SDK,
    status: 200,
    headers: { 'content-type': 'application/javascript; charset=utf-8' },
    body: Buffer.from('/* fixture, never a vendor substitute */'.repeat(40) + 'void 0;'),
    ...overrides,
  };
}

test('SDK admission rejects blocked, redirected, HTML, empty and invalid JavaScript', () => {
  assert.equal(remote.admitSDK(response()).status, 200);
  for (const wrong of [
    { status: 403 },
    { status: 302 },
    { url: 'https://mirror.invalid/beacon.min.js' },
    { headers: { 'content-type': 'text/html' } },
    { body: Buffer.from('') },
    { body: Buffer.from('! invalid {'.repeat(200)) },
    { body: Buffer.alloc(1024 * 1024 + 1) },
  ])
    assert.throws(() => remote.admitSDK(response(wrong)));
});

test('SDK input uses module grammar without evaluating imports or side effects', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lcp-module-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const marker = path.join(directory, 'must-not-exist');
  const module =
    '/* Explicit grammar fixture, not vendor evidence. */'.repeat(25) +
    'import fs from "node:fs"; fs.writeFileSync(' +
    JSON.stringify(marker) +
    ', "executed");' +
    'export {};';
  assert.equal(remote.admitSDK(response({ body: Buffer.from(module) })).status, 200);
  assert.equal(fs.existsSync(marker), false, 'Module checking must never run side effects');
  assert.throws(() => remote.admitSDK(response({ body: Buffer.from(module + 'export {;') })));
});

test('acquisition makes exactly one canonical nonredirecting GET and retains a block', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lcp-acquisition-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  let calls = 0;
  const receipt = await remote.acquireSDK(directory, async (url, options) => {
    calls++;
    assert.equal(url, SDK);
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers, undefined);
    return {
      status: 403,
      url,
      headers: new Headers({ 'content-type': 'text/plain' }),
      body: [Buffer.from('error code: 1010')],
    };
  });
  assert.equal(calls, 1);
  assert.equal(receipt.admitted, false);
  assert.equal(receipt.status, 403);
  assert.equal(fs.readFileSync(path.join(directory, 'beacon.min.js'), 'utf8'), 'error code: 1010');
  assert.equal(JSON.parse(fs.readFileSync(path.join(directory, 'sdk.json'))).admitted, false);
});

test('network failure is retained without a retry', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lcp-network-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  let calls = 0;
  const receipt = await remote.acquireSDK(directory, async () => {
    calls++;
    throw Error('blocked fixture');
  });
  assert.equal(calls, 1);
  assert.equal(receipt.admitted, false);
  assert.match(receipt.error, /blocked fixture/);
});

test('stream size overflow fails acquisition before admitting bytes', async () => {
  await assert.rejects(
    remote.download(SDK, 4, async () => ({
      status: 200,
      url: SDK,
      headers: new Headers(),
      body: [Buffer.alloc(5)],
    })),
    /bounded acquisition/
  );
});

const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicKey = keys.publicKey.export({ type: 'spki', format: 'pem' });
test('encrypted evidence roundtrips binary bytes, is randomized and contains no plaintext', () => {
  const plain = Buffer.concat([
    Buffer.from('private same-navigation payload'),
    crypto.randomBytes(8000),
  ]);
  const first = remote.seal(plain, publicKey);
  const second = remote.seal(plain, publicKey);
  assert.deepEqual(remote.unseal(first, keys.privateKey), plain);
  assert.notEqual(first.ciphertext, second.ciphertext);
  assert.equal(JSON.stringify(first).includes('private same-navigation payload'), false);
});

test('ciphertext, tag, envelope domain and recipient tampering are rejected', () => {
  const envelope = remote.seal(Buffer.from('private'), publicKey);
  for (const field of ['ciphertext', 'tag', 'wrappedKey', 'iv']) {
    const wrong = structuredClone(envelope);
    const bytes = Buffer.from(wrong[field], 'base64');
    bytes[0] ^= 1;
    wrong[field] = bytes.toString('base64');
    assert.throws(() => remote.unseal(wrong, keys.privateKey));
  }
  assert.throws(() => remote.unseal({ ...envelope, kind: 'another envelope' }, keys.privateKey));
  const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  assert.throws(() => remote.unseal(envelope, other.privateKey), /recipient/);
});

test('authentication cannot be downgraded with truncated tags or changed IV lengths', () => {
  const envelope = remote.seal(Buffer.from('private'), publicKey);
  for (const length of [0, 4, 8, 12, 15, 17]) {
    const bytes = Buffer.alloc(length);
    Buffer.from(envelope.tag, 'base64').copy(bytes);
    assert.throws(
      () => remote.unseal({ ...envelope, tag: bytes.toString('base64') }, keys.privateKey),
      /tag/
    );
  }
  for (const length of [0, 4, 11, 13]) {
    const bytes = Buffer.alloc(length);
    Buffer.from(envelope.iv, 'base64').copy(bytes);
    assert.throws(
      () => remote.unseal({ ...envelope, iv: bytes.toString('base64') }, keys.privateKey),
      /IV/
    );
  }
});

test('interrupted partial rows and unknown cleanup survive encrypted packaging', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lcp-interrupted-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const raw = path.join(directory, 'raw');
  const sealed = path.join(directory, 'sealed');
  fs.mkdirSync(raw);
  const partial = JSON.stringify({
    kind: 'explicit interrupted fixture',
    rows: [{ trial: 1 }],
    unexecuted: [2, 3],
  });
  fs.writeFileSync(path.join(raw, 'partial.json'), partial);
  remote.packageEvidence(raw, sealed, publicKey, 'cancelled');
  assert.deepEqual(fs.readdirSync(sealed), ['capture.sealed.json']);
  const archive = remote.unseal(
    JSON.parse(fs.readFileSync(path.join(sealed, 'capture.sealed.json'))),
    keys.privateKey
  );
  const extract = (name) =>
    cp.execFileSync('tar', ['-xOzf', '-', './' + name], { input: archive, encoding: 'utf8' });
  assert.equal(extract('partial.json'), partial);
  const outcome = JSON.parse(extract('hosted-outcome.json'));
  assert.equal(outcome.outcome, 'cancelled');
  assert.match(outcome.cleanup, /unknown/);
});

test('private output rejects checkout paths and symlinks into the checkout', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lcp-path-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const root = path.join(directory, 'checkout');
  fs.mkdirSync(root);
  assert.throws(() => remote.privateDirectory(root, root));
  fs.symlinkSync(root, path.join(directory, 'link'), 'dir');
  assert.throws(() => remote.privateDirectory(path.join(directory, 'link'), root));
  assert.equal(
    remote.privateDirectory(path.join(directory, 'private'), root),
    path.join(directory, 'private')
  );
});
