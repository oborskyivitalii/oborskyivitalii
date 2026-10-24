'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  crypto = require('node:crypto');
const {
  artifactFile,
  verifyResponse,
  verifyRequest,
  identity,
  verifyRuntimeIdentity,
  analyticsRequest,
  documentNavigation,
  navigationAction,
} = require('../tools/quality/local-browser.cjs');
const { validate } = require('../tools/quality/flight-detail.cjs');
test('native document navigation waits for owned byte reads and preserves their failures', async () => {
  let finish,
    finishLate,
    navigated = false;
  const response = new Promise((resolve) => {
    finish = resolve;
  });
  const page = {
    goto: async () => {
      navigated = true;
    },
  };
  const checks = [response],
    pending = documentNavigation(page, 'https://example.test/research.html', checks);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    navigated,
    false,
    'departing response remains readable until verification completes'
  );
  checks.push(
    new Promise((resolve) => {
      finishLate = resolve;
    })
  );
  finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(navigated, false, 'responses added while draining remain owned by the old document');
  finishLate();
  await pending;
  assert.equal(navigated, true);
  navigated = false;
  await assert.rejects(
    documentNavigation(page, 'https://example.test/research.html', [
      Promise.reject(Error('served bytes differ')),
    ]),
    /served bytes differ/
  );
  assert.equal(navigated, false, 'failed verification cannot be discarded by navigation');
});
test('the byte collector owns requests before headers and retains body-read and failed-request errors', async () => {
  const base = 'https://example.test',
    bytes = Buffer.from('exact candidate document'),
    checked = new Set(),
    manifest = {
      files: { 'index.html': { sha256: crypto.createHash('sha256').update(bytes).digest('hex') } },
    };
  let headers,
    body,
    navigated = false;
  const request = {
    url: () => base + '/index.html',
    response: () =>
      new Promise((resolve) => {
        headers = resolve;
      }),
  };
  const page = {
    goto: async () => {
      navigated = true;
    },
  };
  const verification = verifyRequest(request, base, manifest, checked),
    navigation = documentNavigation(page, base, [verification]);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(navigated, false, 'a request without response headers blocks document replacement');
  headers({
    url: request.url,
    status: () => 200,
    body: () =>
      new Promise((resolve) => {
        body = resolve;
      }),
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    navigated,
    false,
    'headers alone do not make the browser-owned bytes safe to discard'
  );
  body(bytes);
  await navigation;
  assert.equal(navigated, true);
  assert.deepEqual([...checked], ['index.html']);
  await assert.rejects(
    verifyRequest({ ...request, response: async () => null }, base, manifest, checked),
    /request failed before response/
  );
  await assert.rejects(
    verifyRequest(
      {
        ...request,
        response: async () => ({
          url: request.url,
          status: () => 200,
          body: async () => {
            throw Error('unavailable response body');
          },
        }),
      },
      base,
      manifest,
      checked
    ),
    /unavailable response body/
  );
});
test('instant in-shell navigation verifies the outgoing publication index before unmount can abort it', async () => {
  const base = 'https://example.test',
    bytes = Buffer.from('{"articles":[]}'),
    file = 'publication-index.json',
    manifest = {
      files: { [file]: { sha256: crypto.createHash('sha256').update(bytes).digest('hex') } },
    },
    controller = new AbortController(),
    checked = new Set(),
    errors = [];
  let headers, body;
  const request = {
    url: () => base + '/' + file,
    response: () =>
      new Promise((resolve) => {
        headers = resolve;
        controller.signal.addEventListener('abort', () => resolve(null), { once: true });
      }),
  };
  const verification = verifyRequest(request, base, manifest, checked).catch((error) => {
      errors.push(error.message);
    }),
    navigation = navigationAction([verification], () => controller.abort());
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(controller.signal.aborted, false, 'instant route mount waits for response headers');
  headers({
    url: request.url,
    status: () => 200,
    body: () =>
      new Promise((resolve) => {
        body = resolve;
      }),
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    controller.signal.aborted,
    false,
    'the departing fetch remains owned through hashing'
  );
  body(bytes);
  await navigation;
  assert.equal(controller.signal.aborted, true, 'ordinary route cleanup still runs');
  assert.deepEqual([...checked], [file]);
  assert.deepEqual(errors, []);
});
test('content smoke requires every rebuilt article descriptor and retains explicit no-article catalog cases', () => {
  const { contentDocuments } = require('../tools/quality/local-browser.cjs');
  assert.equal(contentDocuments({}), null);
  const manifest = {
    contentRelease: { kind: 'content-release', builtArticles: [] },
    components: { articles: {} },
  };
  assert.deepEqual(contentDocuments(manifest), []);
  manifest.components.articles['example:en'] = { alias: 'articles/example.html' };
  manifest.contentRelease.builtArticles = ['example:en'];
  assert.deepEqual(contentDocuments(manifest), ['example:en']);
  for (const builtArticles of [
    null,
    ['missing:en'],
    ['example:en', 'example:en'],
    Array(51).fill('example:en'),
  ])
    assert.throws(() =>
      contentDocuments({ ...manifest, contentRelease: { kind: 'content-release', builtArticles } })
    );
  assert.throws(() => contentDocuments({ ...manifest, contentRelease: { kind: 'preview' } }));
});

test('smoke permits only exact configured production analytics and retains other external rejection', () => {
  const base = 'https://vitaliioborskyi.ai';
  const manifest = { edition: { id: 'production', indexable: true, origin: base } };
  const settings = {
    schema: 1,
    provider: 'cloudflare',
    enabled: true,
    siteURL: base + '/',
    token: 'a'.repeat(32),
    searchConsoleVerification: null,
  };
  const vendor = [
    'https://static.cloudflareinsights.com/beacon.min.js',
    'https://cloudflareinsights.com/cdn-cgi/rum',
  ];
  for (const value of vendor) {
    assert.equal(analyticsRequest(value, base, manifest, settings), true);
    for (const edition of [undefined, { id: 'staging' }, { ...manifest.edition, indexable: false }])
      assert.equal(analyticsRequest(value, base, { edition }, settings), false);
    for (const target of ['https://preview.example.com', 'http://127.0.0.1:3000'])
      assert.equal(analyticsRequest(value, target, manifest, settings), false);
    assert.equal(analyticsRequest(value, base, manifest, { ...settings, enabled: false }), false);
    assert.equal(
      analyticsRequest(value, base, manifest, { ...settings, siteURL: base + '/other/' }),
      false
    );
    assert.equal(
      analyticsRequest(
        value,
        base,
        { edition: { ...manifest.edition, origin: 'https://other.example.com' } },
        settings
      ),
      false
    );
  }
  for (const value of [
    vendor[0] + '?injected=1',
    vendor[1] + '/other',
    'http://static.cloudflareinsights.com/beacon.min.js',
    'https://static.cloudflareinsights.com/other.js',
    'https://cloudflareinsights.com.evil.example/cdn-cgi/rum',
    'https://other.example.com/beacon.min.js',
  ])
    assert.equal(analyticsRequest(value, base, manifest, settings), false, value);
});
test('preview identity preserves real base descriptor and Color runtime fingerprints with exact bindings', (t) => {
  const fs = require('node:fs'),
    path = require('node:path'),
    os = require('node:os'),
    color = require('../tools/staging/color.cjs'),
    artifact = require('../tools/quality/artifact.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-identity-'));
  const keys = ['SITE_CANDIDATE_SHA', 'SITE_EXPECTED_PUBLIC_DIGEST', 'SITE_PUBLIC_VARIANT'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  t.after(() => {
    fs.rmSync(directory, { recursive: true, force: true });
    for (const key of keys)
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
  });
  for (const key of keys) delete process.env[key];
  const baseManifest = artifact.build(directory),
    components = baseManifest.components,
    colorManifest = color.build(directory),
    variant = colorManifest.components.variant;
  assert.notEqual(components.variant.fingerprint, components.engine, 'base descriptor is separate');
  assert.strictEqual(identity(baseManifest), components.variant, 'declared base identity retained');
  assert.strictEqual(identity(colorManifest), variant, 'declared Color identity retained');
  for (const manifest of [baseManifest, colorManifest]) {
    const declared = identity(manifest);
    verifyRuntimeIdentity(
      { engine: manifest.components.engine, variant: declared.id },
      manifest,
      declared,
      'index'
    );
    assert.throws(
      () =>
        verifyRuntimeIdentity(
          { engine: '0'.repeat(64), variant: declared.id },
          manifest,
          declared,
          'index'
        ),
      /engine identity/
    );
    assert.throws(
      () =>
        verifyRuntimeIdentity(
          { engine: manifest.components.engine, variant: 'unknown' },
          manifest,
          declared,
          'index'
        ),
      /variant identity/
    );
    for (const engine of ['not-an-engine', 'A'.repeat(64), undefined]) {
      const invalid = structuredClone(manifest);
      invalid.components.engine = engine;
      assert.throws(() => identity(invalid));
    }
    const conflict = structuredClone(manifest);
    conflict.variant = { ...declared, fingerprint: '0'.repeat(64) };
    assert.throws(() => identity(conflict), /conflicting tested runtime identity/);
  }
  const wrongColorEngine = structuredClone(colorManifest);
  wrongColorEngine.components.engine = '0'.repeat(64);
  assert.throws(() => identity(wrongColorEngine));
  const wrongColorFingerprint = structuredClone(colorManifest);
  wrongColorFingerprint.variant.fingerprint = '0'.repeat(64);
  wrongColorFingerprint.components.variant.fingerprint = '0'.repeat(64);
  assert.throws(() => identity(wrongColorFingerprint));
  for (const name of ['styles.css', 'space.js'])
    for (const file of [name, 'runtime/' + variant.fingerprint + '/' + name]) {
      const absent = structuredClone(colorManifest);
      delete absent.files[file];
      assert.throws(() => identity(absent), /Color bytes/, 'missing ' + file);
      const substituted = structuredClone(colorManifest);
      substituted.files[file].sha256 = '0'.repeat(64);
      assert.throws(() => identity(substituted), /Color bytes/, 'substituted ' + file);
    }
  for (const mutate of [
    (m) => (m.components.variant.id = 'unknown'),
    (m) => (m.components.variant.contract = 2),
    (m) => (m.components.variant.fingerprint = 'not-a-fingerprint'),
  ]) {
    const invalid = structuredClone(baseManifest);
    mutate(invalid);
    assert.throws(() => identity(invalid));
  }
  const legacy = structuredClone(baseManifest);
  delete legacy.components.variant;
  assert.deepEqual(identity(legacy), {
    id: 'base',
    contract: 1,
    fingerprint: components.engine,
  });
  const bound = {
    SITE_CANDIDATE_SHA: baseManifest.candidateCommit,
    SITE_EXPECTED_PUBLIC_DIGEST: baseManifest.artifactDigest,
    SITE_PUBLIC_VARIANT: 'base',
  };
  Object.assign(process.env, bound);
  assert.strictEqual(identity(baseManifest), components.variant);
  for (const [key, invalid] of [
    ['SITE_CANDIDATE_SHA', 'c'.repeat(40)],
    ['SITE_EXPECTED_PUBLIC_DIGEST', 'd'.repeat(64)],
    ['SITE_PUBLIC_VARIANT', 'color'],
  ]) {
    process.env[key] = invalid;
    assert.throws(() => identity(baseManifest), key);
    process.env[key] = bound[key];
  }
});
test('preview detail observer rejects the old flight downgrade and retains adaptive/mobile detail', () => {
  const rows = (detail) =>
    ['flying', 'settled'].map((travel) => ({
      travel,
      geometry: detail ? 'compact' : 'full',
      detail,
      rooms: 2,
      models: 2,
      narrow: false,
    }));
  for (const detail of [0, 1]) assert.equal(validate(rows(detail)).length, 2);
  assert.equal(
    validate(rows(0).map((row) => ({ ...row, narrow: true, geometry: 'compact' }))).length,
    2
  );
  assert.throws(
    () => validate(rows(0).map((row) => ({ ...row, geometry: 'compact' }))),
    /normal viewport/
  );
  assert.throws(() => validate(rows(0).slice(1)), /travelling paints/);
  assert.throws(
    () => validate(rows(0).map((row) => ({ ...row, models: 7 }))),
    /bounded model cache/
  );
});
const base = 'https://candidate.example.test',
  hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const content = {
  'index.html': '<h1>Home</h1>',
  'research.html': '<h1>Research</h1>',
  'writing.html': '<h1>Writing</h1>',
  'snapshots/revision/index.html': '<h1>Snapshot home</h1>',
  'snapshots/revision/research.html': '<h1>Snapshot research</h1>',
  'runtime/revision/space.js': 'window.scene=true;',
};
const manifest = {
  files: Object.fromEntries(
    Object.entries(content).map(([name, bytes]) => [name, { sha256: hash(bytes) }])
  ),
};
function response(
  path,
  {
    status = 200,
    location,
    body = content[artifactFile(base + path, base, manifest)],
    origin = base,
  } = {}
) {
  let bodyReads = 0;
  return {
    url: () => origin + path,
    status: () => status,
    headers: () => (location === undefined ? {} : { location }),
    body: async () => {
      bodyReads++;
      if (status >= 300 && status < 400)
        throw Error('Response body is unavailable for redirect responses');
      return Buffer.from(body ?? '');
    },
    reads: () => bodyReads,
  };
}
test('Cloudflare canonical routes map extensionless HTML, root, index and nested index aliases', () => {
  for (const [pathname, file] of [
    ['/', 'index.html'],
    ['/index', 'index.html'],
    ['/index.html', 'index.html'],
    ['/research', 'research.html'],
    ['/research?topic=systems', 'research.html'],
    ['/snapshots/revision/', 'snapshots/revision/index.html'],
    ['/snapshots/revision/index', 'snapshots/revision/index.html'],
    ['/snapshots/revision/research', 'snapshots/revision/research.html'],
    ['/runtime/revision/space.js', 'runtime/revision/space.js'],
  ])
    assert.equal(artifactFile(base + pathname, base, manifest), file, pathname);
  assert.equal(artifactFile(base + '/missing', base, manifest), null);
  assert.equal(artifactFile('https://other.example.test/research', base, manifest), null);
});
test('canonical HTML redirects are validated without reading a body or counting verified bytes', async () => {
  for (const status of [301, 302, 303, 307, 308])
    for (const [from, to, file] of [
      ['/research.html', '/research', 'research.html'],
      ['/index.html', '/', 'index.html'],
      ['/snapshots/revision/index.html', './', 'snapshots/revision/index.html'],
    ]) {
      const observed = response(from, { status, location: to }),
        checked = new Set();
      const result = await verifyResponse(observed, base, manifest, checked);
      assert.equal(result.file, file);
      assert.equal(result.status, status);
      assert.equal(result.redirect, new URL(to, base + from).href);
      assert.equal(observed.reads(), 0);
      assert.equal(checked.size, 0);
    }
});
test('final canonical responses hash exact artifact bytes and mark the corresponding HTML file', async () => {
  for (const [pathname, file] of [
    ['/', 'index.html'],
    ['/research', 'research.html'],
    ['/snapshots/revision/', 'snapshots/revision/index.html'],
    ['/snapshots/revision/research', 'snapshots/revision/research.html'],
  ]) {
    const observed = response(pathname),
      checked = new Set();
    const result = await verifyResponse(observed, base, manifest, checked);
    assert.equal(observed.reads(), 1);
    assert.deepEqual([...checked], [file]);
    assert.equal(result.sha256, manifest.files[file].sha256);
  }
});
test('redirect and final-response chain keeps the full hash requirement', async () => {
  const checked = new Set(),
    redirect = response('/research.html', { status: 301, location: '/research' });
  await verifyResponse(redirect, base, manifest, checked);
  assert.equal(redirect.reads(), 0);
  assert.equal(checked.size, 0);
  await assert.rejects(
    verifyResponse(
      response('/research', { body: '<h1>Stale research</h1>' }),
      base,
      manifest,
      checked
    ),
    /served bytes research\.html/
  );
  assert.equal(checked.size, 0, 'failed final bytes never qualify');
  await verifyResponse(response('/research'), base, manifest, checked);
  assert.deepEqual([...checked], ['research.html']);
});
test('cross-origin, different route, missing Location and non-HTML redirects fail without a body read', async () => {
  for (const [pathname, location, pattern] of [
    ['/research.html', 'https://other.example.test/research', /left the selected site/],
    ['/research.html', '/writing', /changed artifact/],
    ['/research.html', '/missing', /changed artifact/],
    ['/research.html', undefined, /missing canonical redirect Location/],
    ['/runtime/revision/space.js', '/runtime/revision/space.js', /non-HTML artifact redirect/],
  ]) {
    const observed = response(pathname, { status: 302, location }),
      checked = new Set();
    await assert.rejects(verifyResponse(observed, base, manifest, checked), pattern);
    assert.equal(observed.reads(), 0);
    assert.equal(checked.size, 0);
  }
});
test('redirects cannot leave a selected site subdirectory', async () => {
  const scoped = base + '/site',
    observed = response('/site/research.html', { status: 301, location: '/research' });
  await assert.rejects(
    verifyResponse(observed, scoped, manifest, new Set()),
    /left the selected path/
  );
  assert.equal(observed.reads(), 0);
  const valid = response('/site/research.html', { status: 301, location: 'research' });
  assert.equal((await verifyResponse(valid, scoped, manifest, new Set())).file, 'research.html');
  assert.equal(valid.reads(), 0);
});
test('known and unknown same-site HTTP failures are never ignored', async () => {
  for (const status of [400, 404, 429, 500, 503])
    for (const pathname of ['/research', '/unexpected-resource']) {
      const observed = response(pathname, { status }),
        checked = new Set();
      await assert.rejects(verifyResponse(observed, base, manifest, checked), /HTTP failure/);
      assert.equal(observed.reads(), 0);
      assert.equal(checked.size, 0);
    }
  const unexpected = response('/research', { status: 304 });
  await assert.rejects(
    verifyResponse(unexpected, base, manifest, new Set()),
    /public response research\.html/
  );
  assert.equal(unexpected.reads(), 0);
});
