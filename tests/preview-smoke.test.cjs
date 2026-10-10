'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  crypto = require('node:crypto');
const {
  artifactFile,
  verifyResponse,
  identity,
  verifyRuntimeIdentity,
  state,
  routeSelector,
  researchControls,
  responseNames,
} = require('../tools/quality/local-browser.cjs');
const { validate } = require('../tools/quality/flight-detail.cjs');
test('preview heading measurements count the native page while a separate warm stage is present', async () => {
  const vm = require('node:vm');
  let nativeHeadings = 1;
  const page = {
    evaluate: async (callback) =>
      vm.runInNewContext('(' + callback.toString() + ')()', {
        document: {
          body: { dataset: { page: 'research' } },
          documentElement: { scrollWidth: 1440 },
          getElementById: () => ({ hidden: false, disabled: false, textContent: 'Motion: on' }),
          querySelectorAll: (selector) =>
            Array.from({
              length: selector === '#site-content h1' ? nativeHeadings : nativeHeadings + 1,
            }),
          querySelector: (selector) => ({
            dataset: { ready: 'true', travel: 'settled', phase: '0.5' },
            content: selector.includes('site-variant') ? 'color' : 'a'.repeat(64),
          }),
        },
        innerWidth: 1440,
        getComputedStyle: () => ({ visibility: 'hidden' }),
      }),
  };
  assert.equal((await state(page)).h1, 1, 'warm heading is outside the current native page');
  nativeHeadings = 2;
  assert.equal((await state(page)).h1, 2, 'duplicate native headings remain a failed measurement');
});
test('preview native cards, footer and Credits link stay strict when a warm page duplicates them', async () => {
  const catalog = require('../site/content/catalog.json');
  let nativeFooters = 1;
  const warmFooters = 1;
  const selected = ['Arkadiy Dobkin', 'Matthew Skelton', 'Markus Kopko'];
  const resolve = (selector) => {
    const native = selector.startsWith('#site-content ');
    const bare = selector.replace(/^#site-content /, '');
    if (bare === '.site-footer')
      return Array(native ? nativeFooters : nativeFooters + warmFooters).fill({
        y: 800,
        height: 80,
      });
    if (bare === 'footer a[href="credits.html"]')
      return Array(native ? 1 : 2).fill({ href: 'credits.html' });
    if (bare === '.discussion-row')
      return Array(Object.keys(catalog.discussions).length * (native ? 1 : 2)).fill({});
    if (bare === '.advisor-role') return Array(native ? 2 : 4).fill({});
    if (bare === '#acknowledgements .ack-leads article h3 a')
      return native ? selected : [...selected, 'Warm stage response'];
    if (bare === '#acknowledgements article')
      return Array(native ? selected.length : selected.length + 1).fill({});
    assert.fail('unexpected preview selector ' + selector);
  };
  const page = {
    evaluate: async () => {},
    viewportSize: () => ({ width: 1440, height: 900 }),
    locator: (selector) => ({
      count: async () => resolve(selector).length,
      allTextContents: async () => resolve(selector),
      boundingBox: async () => {
        const matches = resolve(selector);
        assert.equal(matches.length, 1, 'strict native footer resolution');
        return matches[0];
      },
      getAttribute: async (name) => {
        const matches = resolve(selector);
        assert.equal(matches.length, 1, 'strict native navigation resolution');
        return matches[0][name];
      },
    }),
  };
  await researchControls(page, 'no-canvas', 1440);
  assert.deepEqual(await responseNames(page, 'index'), selected);
  assert.equal(await page.locator(routeSelector('credits')).getAttribute('href'), 'credits.html');
  nativeFooters = 2;
  await assert.rejects(researchControls(page, 'no-canvas', 1440), /strict native footer/);
});
test('preview identity preserves real base descriptor and Color runtime fingerprints with exact bindings', (t) => {
  const fs = require('node:fs'),
    path = require('node:path'),
    color = require('../tools/staging/color.cjs');
  const components = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../docs/site-revision.json'))
  );
  const baseManifest = {
    candidateCommit: 'a'.repeat(40),
    artifactDigest: 'b'.repeat(64),
    components,
  };
  const { variant } = color.identities(components, color.authoredEffects());
  const colorManifest = {
    ...baseManifest,
    variant,
    components: { ...components, variant, engine: variant.fingerprint },
  };
  const keys = ['SITE_CANDIDATE_SHA', 'SITE_EXPECTED_PUBLIC_DIGEST', 'SITE_PUBLIC_VARIANT'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys)
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
  });
  for (const key of keys) delete process.env[key];
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
