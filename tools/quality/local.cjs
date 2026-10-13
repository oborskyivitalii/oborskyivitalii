'use strict';
// Economical source checks. The separate hosted profiles own the full matrix.
const fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  cp = require('node:child_process'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const root = path.resolve(__dirname, '../..'),
  artifact = require('./artifact.cjs');
function run(file, args = []) {
  const result = cp.spawnSync(process.execPath, [file, ...args], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw Error(result.stderr || result.stdout || String(result.error));
  return result.stdout;
}
function tests(files) {
  const tap = run('--test', ['--test-reporter=tap', ...files]);
  const count = (key) => Number(tap.match(new RegExp('^# ' + key + ' (\\d+)$', 'm'))?.[1]);
  const result = {
    files,
    total: count('tests'),
    passed: count('pass'),
    failed: count('fail'),
    skipped: count('skipped'),
  };
  assert.ok(Number.isInteger(result.total) && result.total > 0, 'missing Node test accounting');
  assert.equal(result.passed, result.total, 'focused tests must all pass');
  assert.equal(result.failed, 0);
  assert.equal(result.skipped, 0);
  return result;
}
function finiteGeometry(world, compact) {
  assert.ok(
    Array.isArray(world.objects) && Array.isArray(world.faces) && Array.isArray(world.lines)
  );
  return { ...require('./geometry.cjs').check(world, compact), finite: true, budget: 'configured' };
}

function checkPublicScripts(publicDir, config) {
  const scripts = new Set();
  for (const entry of artifact.entries(publicDir)) {
    if (entry.path.endsWith('.js')) {
      const hash = artifact.digest(entry.bytes);
      if (!scripts.has(hash)) {
        new vm.Script(entry.bytes.toString('utf8'), { filename: entry.path });
        scripts.add(hash);
      }
    }
  }
  for (const route of config.routes) {
    const html = fs.readFileSync(path.join(publicDir, route.url), 'utf8');
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route.id + ' has one main heading');
    assert.match(
      html,
      /<a href="credits\.html">Reuse &amp; credits<\/a>/,
      'footer reaches utility page'
    );
    for (const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))
      if (!script[1].includes('application/')) new vm.Script(script[2], { filename: route.url });
  }
  return scripts.size;
}
function checkMotifs(api, config) {
  const shared = api.worldFor('index', true).objects.filter((x) => x.family === 'shared'),
    symbols = new Set(shared.map((x) => x.symbol));
  const newMotifs = [
    'brain',
    'line-chart',
    'bar-chart',
    'scatter-chart',
    'attention',
    'softmax',
    'entropy',
  ];
  if (!newMotifs.some((symbol) => symbols.has(symbol)))
    return {
      status: 'not-applicable',
      reason: 'This source edition predates the authored shared motifs',
    };
  for (const route of config.routes)
    for (const compact of [false, true]) {
      const objects = api.worldFor(route.id, compact).objects.filter((x) => x.family === 'shared'),
        actual = new Set(objects.map((x) => x.symbol));
      assert.equal(objects.length, 56, 'bounded shared grammar');
      for (const symbol of newMotifs) assert.ok(actual.has(symbol), route.id + ' lacks ' + symbol);
    }
  return { status: 'checked', symbols: newMotifs };
}
function checkColor(config) {
  const colorFiles = [...require('../site/effects.cjs').effectInputs, 'tests/flight.test.cjs'];
  const missing = colorFiles.filter((name) => !fs.existsSync(path.join(root, name)));
  if (missing.length) return { status: 'not-applicable', missing };
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'site-local-'));
  try {
    run('tools/site/export.cjs', [directory]);
    const html = fs.readFileSync(
      path.join(directory, 'Vitalii-Oborskyi-Color-Prototype.html'),
      'utf8'
    );
    assert.doesNotMatch(
      html,
      /backdrop-filter|data-glass|vo\.reading-surface|id=["']surface-mode/,
      'retired reading effect is absent'
    );
    for (const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))
      if (!script[1].includes('application/')) new vm.Script(script[2]);
    const payload = JSON.parse(html.match(/id="site-pages">([\s\S]*?)<\/script>/)[1]);
    for (const route of config.routes)
      assert.match(payload.pages[route.id], /href="\?view=credits"/, 'footer reaches utility page');
    return { status: 'checked', focusedTests: tests(['tests/flight.test.cjs']) };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}
function check() {
  run('tools/site/build.cjs', ['--check']);
  const { configuration, model } = require('../site/build.cjs'),
    { config, definitions } = configuration(root),
    api = model(root, definitions),
    geometry = [];
  const focused = tests(['tests/theme.test.cjs', 'tests/archive.test.cjs']);
  const helpers = fs.existsSync(path.join(__dirname, 'workflow-artifacts.cjs'));
  const workflow = helpers
    ? require('./workflow-artifacts.cjs').check(root)
    : {
        status: 'not-applicable',
        reason: 'This source edition has no additional workflow namespace helper',
      };
  for (const route of config.routes)
    for (const compact of [false, true])
      geometry.push({
        route: route.id,
        compact,
        ...finiteGeometry(api.worldFor(route.id, compact), compact),
      });
  const publicDir = path.join(root, 'docs'),
    uniqueScripts = checkPublicScripts(publicDir, config);
  const manifest = artifact.manifest(publicDir);
  artifact.verify(publicDir, manifest);
  const sizes = artifact.checkSize(publicDir),
    extensions = { sharedMotifs: checkMotifs(api, config), color: checkColor(config) };
  const result = {
    profile: 'local',
    pass: true,
    focusedTests: focused,
    routes: config.routes.length,
    workflow,
    geometry,
    extensions,
    checks: [
      'generated source',
      'finite geometry',
      'script syntax',
      'single main heading',
      'footer links',
      'artifact snapshot integrity',
      'size budgets',
    ],
    uniqueScripts,
    maxHtmlBytes: Math.max(...sizes.rows.map((x) => x.raw)),
    deploymentAuthorized: false,
  };
  console.log(JSON.stringify(result));
  return result;
}

function checkContent({ out, contentBaseline, base }) {
  const sourceTests = require('./source-tests.cjs');
  sourceTests.requireClean(root);
  const head = cp
    .execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    })
    .trim();
  const trusted = artifact.trustedContentBaseline(contentBaseline);
  assert.equal(trusted.record.sourceCommit, base, 'content diff must start at trusted baseline');
  const plan = sourceTests.select(root, 'content', { base, head });
  const source = sourceTests.run(root, plan, { requireClean: true });
  assert.equal(source.pass, true, 'mandatory content source checks must pass');
  const record = artifact.build(out, { contentBaseline });
  require('./candidate-source.cjs').verifyCandidateSource(path.join(out, 'public'), record);
  const config = require('../site/build.cjs').configuration(root).config;
  const uniqueScripts = checkPublicScripts(path.join(out, 'public'), config);
  const sizes = artifact.checkSize(path.join(out, 'public'));
  const catalog = require('../site/build.cjs').catalog(root);
  const total = require('../site/validate-catalog.cjs').catalogCounts(catalog).primary.total;
  const writing = fs.readFileSync(path.join(out, 'public/writing.html'), 'utf8');
  assert.equal(
    [...writing.matchAll(/<li class="publication"/g)].length,
    total,
    'Writing displayed entries equal the catalog count'
  );
  const result = {
    profile: 'content',
    pass: true,
    sourceTests: source,
    platform: {
      status: 'reused',
      engine: record.contentRelease.engine,
      baselineArtifactDigest: contentBaseline.expectedArtifactDigest,
      baselineGenerationSha256: contentBaseline.expectedGenerationSha256,
    },
    checks: [
      'exact current content source',
      'trusted unchanged platform',
      'complete current and retained snapshot closure',
      'public script syntax',
      'Writing entries and count',
      'size budgets',
    ],
    uniqueScripts,
    maxHtmlBytes: Math.max(...sizes.rows.map((row) => row.raw)),
    deploymentAuthorized: false,
  };
  fs.writeFileSync(
    path.join(out, 'artifact.json'),
    JSON.stringify({ ...record, contentChecks: result }, null, 2) + '\n'
  );
  console.log(JSON.stringify(result));
  return result;
}

function contentArguments(argv) {
  const names = {
    '--content-baseline': 'directory',
    '--generation-sha256': 'expectedGenerationSha256',
    '--baseline-digest': 'expectedArtifactDigest',
  };
  const options = { out: path.resolve(argv[0]), contentBaseline: {} };
  for (let index = 1; index < argv.length; index += 2) {
    const option = argv[index];
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw Error('Missing content Basic argument ' + option);
    if (option === '--content-base' && !options.base) options.base = value;
    else if (!names[option] || Object.hasOwn(options.contentBaseline, names[option]))
      throw Error('Unknown or duplicate content Basic argument ' + option);
    else options.contentBaseline[names[option]] = value;
  }
  if (!options.base || Object.keys(options.contentBaseline).length !== 3)
    throw Error('Content Basic requires an exact source base and trusted artifact baseline');
  return options;
}

function ciPackage(
  out,
  {
    environment = process.env,
    contentCheck = checkContent,
    platformCheck = check,
    artifactBuild = artifact.build,
  } = {}
) {
  assert.ok(typeof out === 'string' && out.length > 0, 'CI Basic requires an output directory');
  const mode = environment.CONTENT_MODE || 'platform';
  assert.ok(['content', 'platform'].includes(mode), 'unknown CI Basic content mode');
  if (mode === 'content') {
    const options = {
      out,
      base: environment.CONTENT_BASE_SHA,
      contentBaseline: {
        directory: environment.CONTENT_BASELINE,
        expectedGenerationSha256: environment.CONTENT_GENERATION_SHA256,
        expectedArtifactDigest: environment.CONTENT_BASELINE_DIGEST,
      },
    };
    assert.ok(
      typeof options.contentBaseline.directory === 'string' &&
        options.contentBaseline.directory.length > 0,
      'content CI Basic requires its trusted baseline directory'
    );
    assert.match(
      options.base || '',
      /^[a-f0-9]{40}$/,
      'content CI Basic requires an exact source base'
    );
    for (const field of ['expectedGenerationSha256', 'expectedArtifactDigest'])
      assert.match(
        options.contentBaseline[field] || '',
        /^[a-f0-9]{64}$/,
        'content CI Basic requires trusted baseline digests'
      );
    return contentCheck(options);
  }
  platformCheck();
  return artifactBuild(out);
}

function gate(directory, { profile = 'local' } = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
  artifact.verify(path.join(directory, 'public'), manifest);
  assert.equal(manifest.sourceDirty, false);
  assert.ok(['local', 'package'].includes(profile), 'unknown source gate profile');
  if (profile === 'package') {
    assert.equal(
      cp
        .execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
          cwd: root,
          encoding: 'utf8',
        })
        .trim(),
      '',
      'package proof requires clean source'
    );
    if (!manifest.contentRelease) run('tools/site/build.cjs', ['--check']);
    assert.equal(
      manifest.sourceCommit,
      cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
    );
    assert.equal(
      manifest.sourceTree,
      cp.execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: root, encoding: 'utf8' }).trim()
    );
    assert.equal(manifest.candidateCommit, manifest.sourceCommit);
    artifact.checkSize(path.join(directory, 'public'));
    require('./candidate-source.cjs').verifyCandidateSource(
      path.join(directory, 'public'),
      manifest
    );
    checkPublicScripts(path.join(directory, 'public'), {
      routes: require('../site/snapshot.cjs').routes.map((id) => ({ id, url: id + '.html' })),
    });
  }
  const result = {
    ...manifest,
    schema: 1,
    kind: profile === 'package' ? 'package-gate' : 'pr-gate',
    profile,
    pass: true,
    jobs: { build: { result: 'success' } },
    checkedAt: new Date().toISOString(),
    deploymentAuthorized: false,
    githubArtifact: {
      id: process.env.SITE_ARTIFACT_ID || null,
      uploadDigest: process.env.SITE_UPLOAD_DIGEST || null,
    },
  };
  if (profile === 'package')
    Object.assign(result, {
      checks: [
        manifest.contentRelease ? 'verified current content source' : 'generated source',
        'artifact snapshot integrity',
        'size budgets',
      ],
      sourceTestsRun: false,
      fullGate: false,
      productionEligible: false,
    });
  fs.mkdirSync(path.join(directory, 'gate'), { recursive: true });
  fs.writeFileSync(
    path.join(directory, 'gate/release-manifest.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
}
if (require.main === module) {
  try {
    if (process.argv[2] === '--ci-package') ciPackage(path.resolve(process.argv[3]));
    else if (process.argv[2] === '--content-package')
      checkContent(contentArguments(process.argv.slice(3)));
    else if (process.argv[2] === '--gate' || process.argv[2] === '--package-gate')
      gate(path.resolve(process.argv[3]), {
        profile: process.argv[2] === '--package-gate' ? 'package' : 'local',
      });
    else {
      check();
      if (process.argv[2] === '--package') artifact.build(path.resolve(process.argv[3]));
      else if (process.argv.length > 2)
        throw Error('Usage: local.cjs [--package OUT | --gate OUT | --package-gate OUT]');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { check, checkContent, contentArguments, ciPackage, gate, finiteGeometry };
