// Small loopback-only audit fixture; compresses exact production bytes in memory.
// This is not the production host and cannot validate its TLS, headers or CDN.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const root = path.resolve(process.env.SITE_PUBLIC_DIR || path.join(__dirname, '../../docs'));
const types = {
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
};
function canonicalType(file) {
  if (file.endsWith('/')) return types['.html'];
  return types[path.extname(file).toLowerCase()] || 'application/octet-stream';
}
function assertContentType(file, value) {
  assert.equal(typeof value, 'string', 'missing Content-Type: ' + file);
  assert.match(
    value.trim(),
    /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+(?:[ \t]*;[^\r\n]*)?$/i,
    'invalid Content-Type: ' + file
  );
  const observed = value.split(';', 1)[0].trim().toLowerCase();
  const expected = canonicalType(file).split(';', 1)[0];
  const aliases = {
    'text/javascript': ['application/javascript'],
    'image/x-icon': ['image/vnd.microsoft.icon'],
    'application/xml': ['text/xml'],
  };
  assert.ok(
    [expected, ...(aliases[expected] || [])].includes(observed),
    'incorrect Content-Type for ' + file + ': ' + value
  );
  return observed;
}
const cache = new Map();
function start(publicDirectory) {
  if (!publicDirectory && process.env.SITE_TEST_BASE_URL) {
    const url = require('./hosted-origin.cjs').target(
      process.env.SITE_TEST_BASE_URL,
      process.env.SITE_TEST_PROFILE
    );
    return Promise.resolve({ server: { close() {} }, url });
  }
  const directory = path.resolve(publicDirectory || root);
  const server = http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    const file = path.resolve(directory, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(directory + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    if (!cache.has(file)) {
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404).end();
        return;
      }
      const raw = fs.readFileSync(file);
      cache.set(file, { raw, gzip: zlib.gzipSync(raw) });
    }
    const entry = cache.get(file),
      gzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    const body = gzip ? entry.gzip : entry.raw;
    res.writeHead(200, {
      'Content-Type': canonicalType(file),
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
      ...(gzip ? { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' } : {}),
    });
    res.end(body);
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () =>
      resolve({ server, url: `http://127.0.0.1:${server.address().port}` })
    )
  );
}
module.exports = { start, canonicalType, assertContentType };
