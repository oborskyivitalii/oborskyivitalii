'use strict';
const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  vm = require('node:vm');
const root = path.resolve(__dirname, '..'),
  b = require('../tools/site/build.cjs'),
  analytics = require('../tools/site/analytics.cjs'),
  snapshot = require('../tools/site/snapshot.cjs'),
  artifact = require('../tools/quality/artifact.cjs');
const disabled = () => ({
  schema: 1,
  provider: 'cloudflare',
  enabled: false,
  siteURL: null,
  token: null,
  searchConsoleVerification: null,
});
const enabled = () => ({
  schema: 1,
  provider: 'cloudflare',
  enabled: true,
  siteURL: 'https://analytics.example.com/author/',
  token: 'a'.repeat(32),
  searchConsoleVerification: 'verification-fixture-'.repeat(2),
});
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-analytics-'));
  for (const name of [
    'site',
    'tools/site',
    'tools/build_scene_fallbacks.cjs',
    'tools/build_site_previews.cjs',
    ...Object.values(require('../tools/site/legal.cjs').sources),
  ]) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
  }
  configure(dir, disabled());
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function configure(dir, value) {
  fs.writeFileSync(path.join(dir, 'site/analytics.json'), JSON.stringify(value, null, 2) + '\n');
}
function publicFiles(dir) {
  return artifact.manifest(path.join(dir, 'docs'));
}
function retainedAnalytics(dir) {
  const retained = JSON.parse(fs.readFileSync(path.join(dir, 'site/retained/manifest.json')));
  return Object.keys(retained.files).filter((name) => name.endsWith('/analytics.js'));
}
function browser(bytes, url, appendThrows = false) {
  const elements = [],
    location = new URL(url),
    listeners = new Map();
  const document = {
    getElementById: (id) => elements.find((element) => element.id === id),
    createElement: (tag) => ({
      tag,
      attributes: {},
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      addEventListener(name, fn, options) {
        listeners.set(name, { fn, options });
      },
    }),
    body: {
      appendChild(element) {
        if (appendThrows) throw Error('blocked by policy');
        elements.push(element);
      },
    },
  };
  const context = vm.createContext({ location, document });
  const run = () => vm.runInContext(bytes, context);
  run();
  return { elements, listeners, run };
}
test('disabled analytics emits no runtime asset or external script regardless of current production settings', (t) => {
  const dir = fixture(t);
  assert.deepEqual(
    analytics.compile(
      dir,
      snapshot.routes.map((id) => id + '.html')
    ),
    { head: '', assets: {} }
  );
});
test('missing settings or an enabled adapter fail before replacing coherent public output', (t) => {
  const dir = fixture(t);
  b.build({ root: dir });
  const before = publicFiles(dir),
    configFile = path.join(dir, 'site/analytics.json');
  fs.rmSync(configFile);
  assert.throws(() => b.build({ root: dir }), /ENOENT/);
  assert.deepEqual(publicFiles(dir), before);
  fs.writeFileSync(configFile, '{');
  assert.throws(() => b.build({ root: dir }), SyntaxError);
  assert.deepEqual(publicFiles(dir), before);
  configure(dir, enabled());
  fs.rmSync(path.join(dir, 'site/integrations/cloudflare.cjs'));
  assert.throws(() => b.build({ root: dir }), /Cannot find module/);
  assert.deepEqual(publicFiles(dir), before);
});
test('activation validates finite fields and rejects incomplete, noncanonical or unsafe public settings before output replacement', (t) => {
  const dir = fixture(t);
  b.build({ root: dir });
  const before = publicFiles(dir),
    good = enabled();
  const credentialURL = new URL(good.siteURL);
  credentialURL.username = 'fixture';
  credentialURL.password = 'fixture';
  const invalid = [
    null,
    [],
    { ...good, schema: 2 },
    Object.fromEntries(Object.entries(good).filter(([key]) => key !== 'enabled')),
    { ...good, enabled: 'true' },
    { ...good, provider: 'other' },
    { ...good, extra: 'unclassified' },
    { ...good, siteURL: null },
    { ...good, token: null },
    { ...good, token: 'api-secret' },
    { ...good, searchConsoleVerification: '"><script>alert(1)</script>' },
    ...[
      'http://analytics.example.com/author/',
      'https://localhost/',
      'https://127.0.0.1/',
      'https://analytics.example.com:444/',
      credentialURL.href,
      'https://analytics.example.com/author',
      'https://analytics.example.com/author/?mode=test',
      'https://analytics.example.com/author/#preview',
      'https://analytics.example.com/../author/',
      'https://analytics.example.com/author%2f/',
      'https://analytics.example.com\\author/',
    ].map((siteURL) => ({ ...good, siteURL })),
    { ...good, enabled: false, token: 'malformed' },
    { ...good, enabled: false, siteURL: null },
  ];
  for (const value of invalid) {
    configure(dir, value);
    assert.throws(() => b.build({ root: dir }), /analytics|Cloudflare|Search Console/);
    assert.deepEqual(publicFiles(dir), before);
  }
  configure(dir, { ...good, enabled: false, token: null });
  b.build({ root: dir });
  assert.match(
    fs.readFileSync(path.join(dir, 'docs/index.html'), 'utf8'),
    /google-site-verification/
  );
  assert.deepEqual(
    b
      .files(path.join(dir, 'docs'))
      .filter((name) => name.endsWith('/analytics.js'))
      .sort(),
    retainedAnalytics(dir).sort()
  );
  assert.doesNotMatch(
    fs.readFileSync(path.join(dir, 'docs/index.html'), 'utf8'),
    /data-site-analytics=/
  );
});
test('source checks reject missing or duplicate loaders, missing verification, asset loss and unexpected disabled tracking', (t) => {
  const dir = fixture(t);
  configure(dir, enabled());
  const result = b.build({ root: dir }),
    page = path.join(dir, 'docs/writing.html'),
    html = fs.readFileSync(page, 'utf8');
  const loader = html.match(/^ {2}<script data-site-analytics="cloudflare"[^\n]+\n/m)[0],
    verification = html.match(/^ {2}<meta name="google-site-verification"[^\n]+\n/m)[0];
  for (const changed of [
    html.replace(loader, ''),
    html.replace(loader, loader + loader),
    html.replace(verification, ''),
  ]) {
    fs.writeFileSync(page, changed);
    assert.throws(() => b.build({ root: dir, check: true }), /Generated-only output is stale/);
    assert.equal(fs.readFileSync(page, 'utf8'), changed);
  }
  fs.writeFileSync(page, html);
  const asset = path.join(
      dir,
      'docs',
      Object.keys(result.files).find((name) => name.endsWith('/analytics.js'))
    ),
    bytes = fs.readFileSync(asset);
  fs.rmSync(asset);
  assert.throws(() => b.build({ root: dir, check: true }), /Generated-only output is stale/);
  assert.equal(fs.existsSync(asset), false);
  fs.writeFileSync(asset, bytes);
  b.build({ root: dir, check: true });
  configure(dir, disabled());
  b.build({ root: dir });
  const inactive = fs.readFileSync(page, 'utf8');
  fs.writeFileSync(page, inactive.replace('</head>', loader + '</head>'));
  assert.throws(() => b.build({ root: dir, check: true }), /Generated-only output is stale/);
});
test('one shared immutable adapter covers all five routes and changes metadata without changing the engine or media', (t) => {
  const dir = fixture(t),
    before = b.build({ root: dir });
  configure(dir, enabled());
  const after = b.build({ root: dir });
  assert.deepEqual(after.built, snapshot.routes);
  for (const name of [
    'theme.js',
    'space.js',
    'archive.js',
    'navigation.js',
    'styles.css',
    'assets/favicon.svg',
    'assets/vitalii-oborskyi-cutout.webp',
  ])
    assert.equal(after.files[name], before.files[name], name);
  assert.equal(b.runtimeVersion(after.components), b.runtimeVersion(before.components));
  const names = Object.keys(
    analytics.compile(
      dir,
      snapshot.routes.map((id) => id + '.html')
    ).assets
  );
  assert.equal(names.length, 1);
  assert.deepEqual(
    Object.keys(after.files)
      .filter((name) => name.endsWith('/analytics.js'))
      .sort(),
    [...new Set([...retainedAnalytics(dir), ...names])].sort()
  );
  assert.equal(names[0].split('/')[1], b.sha(fs.readFileSync(path.join(dir, 'docs', names[0]))));
  for (const id of snapshot.routes) {
    const html = fs.readFileSync(path.join(dir, 'docs', id + '.html'), 'utf8');
    assert.equal(html.split('data-site-analytics="cloudflare"').length, 2);
    assert.ok(html.includes(`src="${names[0]}"`));
    assert.match(html, /google-site-verification/);
  }
  snapshot.verify(path.join(dir, 'docs'), publicFiles(dir));
  assert.deepEqual(b.build({ root: dir }).built, []);
  b.build({ root: dir, check: true });
});
test('the vendor loads once at canonical and extensionless declared routes with exact origin and project isolation', (t) => {
  const dir = fixture(t);
  configure(dir, enabled());
  const { assets } = analytics.compile(
      dir,
      snapshot.routes.map((id) => id + '.html')
    ),
    bytes = Object.values(assets)[0];
  const entries = [
    '/author/',
    ...snapshot.routes.flatMap((id) => ['/author/' + id + '.html', '/author/' + id]),
  ];
  for (const pathname of entries) {
    const page = browser(
      bytes,
      'https://analytics.example.com' + pathname + '?topic=systems#section'
    );
    page.run();
    assert.equal(page.elements.length, 1);
    const script = page.elements[0];
    assert.equal(script.src, 'https://static.cloudflareinsights.com/beacon.min.js');
    assert.equal(script.type, 'module');
    assert.equal(script.async, true);
    assert.deepEqual(JSON.parse(script.attributes['data-cf-beacon']), {
      token: enabled().token,
      spa: true,
    });
    assert.equal(script.attributes['data-site-analytics-status'], 'loading');
    page.listeners.get('load').fn();
    assert.equal(script.attributes['data-site-analytics-status'], 'loaded');
  }
  for (const url of [
    'file:///tmp/author/index.html',
    'http://analytics.example.com/author/',
    'https://staging.example.com/author/',
    'https://analytics.example.com:444/author/',
    'https://analytics.example.com/',
    'https://analytics.example.com/other/writing.html',
    'https://analytics.example.com/author/review.html',
    'https://analytics.example.com/author/review',
    'https://analytics.example.com/author/writing/',
    'https://analytics.example.com/author/writing-extra',
    'https://analytics.example.com/author/articles/unpublished',
    'https://analytics.example.com/author/staging/writing',
    'https://analytics.example.com/author/snapshots/version/writing.html',
    'https://analytics.example.com/author/snapshots/version/writing',
  ])
    assert.equal(browser(bytes, url).elements.length, 0, url);
  configure(dir, { ...enabled(), siteURL: 'https://analytics.example.com/' });
  const rootBytes = Object.values(
    analytics.compile(
      dir,
      snapshot.routes.map((id) => id + '.html')
    ).assets
  )[0];
  for (const pathname of [
    '/',
    ...snapshot.routes.flatMap((id) => ['/' + id + '.html', '/' + id]),
  ]) {
    const page = browser(
      rootBytes,
      'https://analytics.example.com' + pathname + '?topic=systems#row'
    );
    page.run();
    assert.equal(page.elements.length, 1, pathname);
  }
  assert.equal(
    browser(rootBytes, 'https://analytics.example.com/author/writing.html').elements.length,
    0
  );
});
test('blocked analytics stays bounded and does not require a history, timer, storage or engine API', (t) => {
  const dir = fixture(t);
  configure(dir, enabled());
  const bytes = Object.values(
    analytics.compile(
      dir,
      snapshot.routes.map((id) => id + '.html')
    ).assets
  )[0];
  const page = browser(bytes, enabled().siteURL);
  page.listeners.get('error').fn();
  page.run();
  assert.equal(page.elements.length, 1);
  assert.equal(page.elements[0].attributes['data-site-analytics-status'], 'blocked');
  assert.equal(page.listeners.get('error').options.once, true);
  assert.equal(browser(bytes, enabled().siteURL, true).elements.length, 0);
});
test('old analytics bytes and route dependencies survive a token rotation; forged immutable bytes fail', (t) => {
  const dir = fixture(t);
  configure(dir, enabled());
  b.build({ root: dir });
  const publicDir = path.join(dir, 'docs'),
    before = publicFiles(dir);
  require('../tools/site/retain.cjs').retain(publicDir, before, path.join(dir, 'site/retained'));
  configure(dir, { ...enabled(), token: 'b'.repeat(32) });
  b.build({ root: dir });
  const after = publicFiles(dir);
  snapshot.verify(publicDir, after);
  for (const [name, info] of Object.entries(before.files).filter(([name]) =>
    snapshot.immutable(name)
  ))
    assert.deepEqual(after.files[name], info, name);
  const loaders = Object.keys(after.files).filter((name) => name.endsWith('/analytics.js'));
  const oldLoaders = Object.keys(before.files).filter((name) => name.endsWith('/analytics.js'));
  const currentLoaders = Object.keys(
    analytics.compile(
      dir,
      snapshot.routes.map((id) => id + '.html')
    ).assets
  );
  assert.equal(currentLoaders.length, 1);
  assert.equal(loaders.length, oldLoaders.length + 1);
  assert.deepEqual(loaders.sort(), [...new Set([...oldLoaders, ...currentLoaders])].sort());
  fs.appendFileSync(path.join(publicDir, loaders[0]), '\n// forged');
  assert.throws(() => snapshot.verify(publicDir, after), /immutable analytics digest/);
});
test('all fifteen standalone exports and their inert route payloads remove enabled tracking and verification', (t) => {
  const dir = fixture(t);
  configure(dir, enabled());
  b.build({ root: dir });
  const exported = require(path.join(dir, 'tools/build_site_previews.cjs')).buildPreviews(),
    pages = Object.entries(exported).filter(
      ([name]) => name.endsWith('.html') && !name.endsWith('-index.html')
    );
  assert.equal(pages.length, 15);
  for (const [name, html] of pages) {
    assert.doesNotMatch(
      html,
      /cloudflareinsights|analytics\.js|data-site-analytics|google-site-verification|verification-fixture/
    );
    if (name.endsWith('interactive.html')) assert.match(html, /id="site-pages"/);
  }
});
test('analytics and unknown component changes force the full advisory scope without skipping checks', () => {
  const { config } = b.configuration(root),
    components = b.fingerprints(root, config),
    policy = require('../tools/site/evidence-policy.cjs');
  assert.equal(policy.propose(components, components).scope, 'content-only');
  for (const next of [
    { ...components, analytics: '0'.repeat(64) },
    { ...components, unknown: '0'.repeat(64) },
    Object.fromEntries(Object.entries(components).filter(([key]) => key !== 'analytics')),
  ])
    assert.equal(policy.propose(components, next).scope, 'full');
  assert.equal(policy.propose(components, components).evidenceReuse, false);
});

test('actual analytics browser fixture builds its real hosted and offline producer dependency closure', (t) => {
  const fixture = require('../tools/quality/analytics-browser.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'analytics-real-fixture-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const inputs = fixture.fixtureInputs();
  assert.deepEqual(inputs.slice(0, 4), [
    'site',
    'tools/site',
    'tools/build_scene_fallbacks.cjs',
    'tools/build_site_previews.cjs',
  ]);
  const producer = fixture.buildFixture(dir);
  b.build({ root: dir, check: true });
  const manifest = artifact.manifest(path.join(dir, 'docs'));
  snapshot.verify(path.join(dir, 'docs'), manifest);
  for (const id of snapshot.routes) {
    assert.ok(fs.existsSync(path.join(dir, 'docs', id + '.html')));
    const file = producer.interactiveFilename(id);
    assert.ok(
      fs.existsSync(path.join(dir, 'review', file)),
      'actual offline fixture missing ' + file
    );
  }
  const legalModule = path.join(root, 'tools/site/legal.cjs');
  if (fs.existsSync(legalModule)) {
    const legal = require(legalModule);
    assert.deepEqual(inputs.slice(4), Object.values(legal.sources));
    const credits = fs.readFileSync(path.join(dir, 'docs/credits.html'), 'utf8');
    for (const name of Object.values(legal.sources)) {
      const bytes = fs.readFileSync(path.join(root, name));
      assert.ok(fs.readFileSync(path.join(dir, name)).equals(bytes));
      assert.ok(credits.includes(require('../tools/site/html.cjs').escapeText(bytes.toString())));
    }
  } else {
    assert.equal(inputs.length, 4, 'legacy producer has no declared legal owner');
  }
});

test('actual analytics browser fixture refuses a declared legal owner that is missing or a symlink', (t) => {
  const fixture = require('../tools/quality/analytics-browser.cjs');
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'analytics-missing-legal-'));
  t.after(() => fs.rmSync(parent, { recursive: true, force: true }));
  const sourceRoot = path.join(parent, 'source');
  fs.mkdirSync(path.join(sourceRoot, 'tools/site'), { recursive: true });
  fs.writeFileSync(
    path.join(sourceRoot, 'tools/site/legal.cjs'),
    "module.exports={sources:{code:'LICENSE-CODE.md'}};\n"
  );
  assert.throws(() => fixture.buildFixture(path.join(parent, 'missing'), sourceRoot), /ENOENT/);
  assert.equal(fs.existsSync(path.join(parent, 'missing/docs')), false);
  fs.symlinkSync(path.join(root, 'LICENSE-CODE.md'), path.join(sourceRoot, 'LICENSE-CODE.md'));
  assert.throws(
    () => fixture.buildFixture(path.join(parent, 'symlink'), sourceRoot),
    /regular declared legal owner/
  );
  assert.equal(fs.existsSync(path.join(parent, 'symlink/docs')), false);
});
