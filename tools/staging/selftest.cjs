'use strict';
// Controlled loopback Pages routing/header model. This is NOT a hosted result,
// a real PR aggregate or deployable package; no credentials/provider API is used.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http'),
  os = require('node:os');
const artifact = require('../quality/artifact.cjs'),
  pkg = require('./package.cjs'),
  hosted = require('./hosted.cjs');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
};
function start(dir) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    let relative;
    const headers = pkg.policyHeaders(url.pathname.slice(1));
    try {
      relative = decodeURIComponent(url.pathname).replace(/^\//, '');
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (relative.endsWith('.html')) {
      res.writeHead(301, { ...headers, Location: '/' + relative.slice(0, -5) + url.search }).end();
      return;
    }
    if (!relative) relative = 'index';
    if (!path.extname(relative) && fs.existsSync(path.join(dir, relative + '.html')))
      relative += '.html';
    const target = path.resolve(dir, relative),
      valid =
        target.startsWith(dir + path.sep) && fs.existsSync(target) && fs.statSync(target).isFile();
    const file = valid ? target : path.join(dir, '404.html'),
      bytes = fs.readFileSync(file);
    res.writeHead(valid ? 200 : 404, {
      ...headers,
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Content-Length': bytes.length,
    });
    res.end(bytes);
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () =>
      resolve({ server, url: 'http://127.0.0.1:' + server.address().port })
    )
  );
}
async function main() {
  const source = JSON.parse(fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST)),
    original = path.resolve(process.env.SITE_PUBLIC_DIR);
  artifact.verify(original, source);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'site-staging-model-')),
    dir = path.join(temporary, 'public');
  fs.cpSync(original, dir, { recursive: true });
  for (const [file, text] of Object.entries(pkg.additions(source))) {
    const target = path.join(dir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
  const record = { source, files: artifact.manifest(dir).files },
    { server, url } = await start(dir);
  try {
    const httpResult = await hosted.httpSmoke(url, record),
      browser = await hosted.browserSmoke(url);
    assert.equal(browser.views.length, 20);
    assert.equal(browser.fallback.length, 10);
    require('../quality/common.cjs').report('staging-model', {
      synthetic: true,
      providerCalled: false,
      http: httpResult,
      browser,
    });
    console.log(
      'Controlled Pages model: exact bytes, redirects/query, real 404, 20 browser views, 10 fallbacks and archive history passed. Not live hosting.'
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    require('../quality/common.cjs').report(
      'staging-model',
      { synthetic: true, providerCalled: false, error: e.message },
      false
    );
    process.exitCode = 1;
  });
module.exports = { start };
