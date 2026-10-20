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
  const tap = run('--test', ['--test-reporter=tap', ...files]),
    counts = require('./source-tests.cjs').accounting(tap, { modules: files, root });
  const result = {
    files,
    total: counts.total,
    passed: counts.passed,
    failed: counts.failed,
    skipped: counts.skipped,
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
  const source = sourceTests.run(root, plan, {
    requireClean: true,
    report: path.join(root, 'quality-reports/source-tests.json'),
  });
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
function sourceIdentity() {
  const git = (args) => cp.execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  return {
    sourceCommit: git(['rev-parse', 'HEAD']),
    sourceTree: git(['rev-parse', 'HEAD^{tree}']),
    sourceDirty: git(['status', '--porcelain', '--untracked-files=all']) !== '',
  };
}

function prepublication(level, directory, options = {}) {
  assert.ok(['staging', 'production'].includes(level), 'unknown prepublication level');
  const input = path.resolve(directory),
    sourceTests = require('./source-tests.cjs');
  const reportFile = path.resolve(
    options.report ||
      path.join(
        process.env.SITE_REPORT_DIR || path.join(os.tmpdir(), 'site-quality'),
        'prepublication-' + level + '.json'
      )
  );
  const reportDirectory = path.dirname(reportFile);
  fs.mkdirSync(reportDirectory, { recursive: true });
  const actualReport = path.join(fs.realpathSync(reportDirectory), path.basename(reportFile));
  if (!path.relative(root, actualReport).startsWith('..') && path.isAbsolute(actualReport))
    assert.equal(
      cp.spawnSync('git', ['check-ignore', '--quiet', '--', actualReport], { cwd: root }).status,
      0,
      'prepublication reports must be outside source or in an ignored output directory'
    );
  if (fs.existsSync(reportFile)) assert.equal(fs.lstatSync(reportFile).isSymbolicLink(), false);
  const reportStem = path.basename(reportFile).replace(/\.json$/, '');
  let artifactRecord = null;
  let artifactManifestDigest = null;
  try {
    const bytes = fs.readFileSync(path.join(input, 'artifact.json'));
    artifactManifestDigest = artifact.digest(bytes);
    artifactRecord = JSON.parse(bytes);
  } catch {
    // The artifact guard records this failure while source guards still run.
  }
  const identify = options.identify || sourceIdentity;
  const identity = identify();
  const environment = {
    ...process.env,
    SITE_CANDIDATE_SHA: process.env.SITE_CANDIDATE_SHA || identity.sourceCommit,
    SITE_ARTIFACT_MANIFEST: path.join(input, 'artifact.json'),
    SITE_PUBLIC_DIR: path.join(input, 'public'),
    SITE_REPORT_DIR: reportDirectory,
    SITE_VALIDATION_LEVEL: level,
  };
  const execute =
    options.execute || ((command, args, execution) => cp.spawnSync(command, args, execution));
  const checks = [];
  function check(id, command, args, dependencies = []) {
    const blocked = dependencies.filter(
      (name) => !checks.some((row) => row.id === name && row.pass)
    );
    if (blocked.length) {
      checks.push({ id, pass: false, status: 'blocked', blockedBy: blocked });
      return;
    }
    const started = Date.now();
    // The reporting wrapper must outlive its own bounded test child so timeout
    // cleanup and original TAP/stderr can finish before the outer deadline.
    let timeoutMs = 180000;
    let result;
    try {
      if (id === 'source-tests')
        timeoutMs = sourceTests.wrapperTimeout(root, args[args.indexOf('--profile') + 1]);
      result = execute(command, args, {
        cwd: root,
        env: environment,
        encoding: 'utf8',
        timeout: timeoutMs,
        maxBuffer: 16 * 1024 * 1024,
      });
    } catch (error) {
      result = { status: null, error, stdout: '', stderr: error.message };
    }
    const stdout = path.join(reportDirectory, reportStem + '-' + id + '.stdout');
    const stderr = path.join(reportDirectory, reportStem + '-' + id + '.stderr');
    fs.writeFileSync(stdout, String(result.stdout || ''));
    fs.writeFileSync(stderr, String(result.stderr || result.error?.message || ''));
    checks.push({
      id,
      command: [command, ...args],
      pass: result.status === 0 && !result.error,
      status: result.status === 0 && !result.error ? 'passed' : 'failed',
      exitCode: result.status ?? null,
      signal: result.signal || null,
      error: result.error
        ? { name: result.error.name, message: result.error.message, code: result.error.code }
        : null,
      timeoutMs,
      elapsedMs: Date.now() - started,
      stdout,
      stderr,
    });
  }
  const node = (id, file, args = [], dependencies = []) =>
    check(id, process.execPath, [file, ...args], dependencies);
  const python = (id, file, args = []) => check(id, 'python3', [file, ...args]);
  checks.push({
    id: 'clean-source',
    pass: !identity.sourceDirty && identity.sourceCommit === environment.SITE_CANDIDATE_SHA,
    status:
      !identity.sourceDirty && identity.sourceCommit === environment.SITE_CANDIDATE_SHA
        ? 'passed'
        : 'failed',
    error: identity.sourceDirty
      ? 'prepublication requires clean source'
      : identity.sourceCommit !== environment.SITE_CANDIDATE_SHA
        ? 'candidate/source differs'
        : null,
  });
  // Independent source guards still run when another source guard fails.
  if (level === 'staging') node('basic', 'tools/quality/local.cjs');
  const contentAdmission = artifactRecord?.contentRelease?.admission;
  const contentSourceArgs = contentAdmission
    ? ['--base', contentAdmission.mergedSource, '--head', identity.sourceCommit]
    : [];
  node('source-tests', 'tools/quality/source-tests.cjs', [
    '--profile',
    contentAdmission ? 'content' : level,
    ...contentSourceArgs,
    '--require-clean',
    '--report',
    path.join(reportDirectory, reportStem + '-source-tests-runner.json'),
  ]);
  // Audit-graph regressions import dependencies installed only in the locked venv.
  check(
    'python-tests',
    path.join(
      require('./common.cjs').tools,
      'venv',
      process.platform === 'win32' ? 'Scripts' : 'bin',
      process.platform === 'win32' ? 'python.exe' : 'python'
    ),
    ['tools/run_repository_tests.py']
  );
  python('code-style', 'tools/check_code_style.py');
  python('ri', 'tools/repository_intelligence.py', [
    '--config',
    '.github/repository-intelligence-config.json',
    'verify',
  ]);
  python('ri-ci', 'tools/check_ri_ci.py', ['verify']);
  node('format', 'tools/quality/format.cjs', ['--check']);
  node('architecture', 'tools/quality/architecture.cjs');
  node('generated', 'tools/site/build.cjs', ['--check']);
  node('seo', 'tools/check_site_seo.cjs');
  node('fallbacks', 'tools/build_scene_fallbacks.cjs', ['--check']);
  node('previews', 'tools/build_site_previews.cjs', ['--check']);
  python('bundle', 'tools/build_site_bundle.py', ['--check']);
  node('artifact', 'tools/quality/artifact.cjs', [
    'verify',
    path.join(input, 'public'),
    path.join(input, 'artifact.json'),
  ]);
  node(
    'artifact-source',
    '-e',
    [
      "const a=require('node:assert/strict'),c=require('node:child_process'),m=require(process.argv[1]);" +
        'a.equal(m.sourceCommit,process.env.SITE_CANDIDATE_SHA);a.equal(m.candidateCommit,m.sourceCommit);' +
        "a.equal(m.sourceDirty,false);a.equal(m.sourceTree,c.execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim());",
      path.join(input, 'artifact.json'),
    ],
    ['artifact', 'clean-source']
  );
  node('sizes', 'tools/quality/artifact.cjs', ['sizes', path.join(input, 'public')], ['artifact']);
  node(
    'edition-rights',
    '-e',
    [
      "const fs=require('node:fs'),p=require('node:path'),a=require('node:assert/strict'),d=process.argv[1],l=process.argv[2],m=require(p.join(d,'artifact.json'));" +
        "if(l==='production')require('./tools/release/edition.cjs').verify(d,m);" +
        "else {a.notEqual(m.edition?.id,'production');if(m.edition)require('./tools/pages/package.cjs').checkStaging(d,m);}" +
        "const f=p.join(d,'rights.json');require('./tools/staging/package.cjs').publicationRights(p.join(d,'public'),m,fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):undefined);" +
        "if(fs.existsSync('./tools/release/rights.cjs'))require('./tools/release/rights.cjs').readPublication(d,m,l,{verifySource:true});",
      input,
      level,
    ],
    ['artifact-source']
  );
  // Scanner reports need a real frozen artifact identity, never a fabricated manifest.
  for (const kind of ['lint', 'security', 'advisories'])
    node(kind, 'tools/quality/scanners.cjs', [kind], ['artifact-source']);
  node('selftest', 'tools/quality/selftest.cjs');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'site-prepublication-'));
  try {
    node(
      'package-proof',
      'tools/quality/local.cjs',
      ['--package-gate', input],
      ['artifact-source', 'edition-rights']
    );
    node(
      'package',
      'tools/staging/package.cjs',
      ['build', input, path.join(temporary, 'package')],
      ['package-proof']
    );
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
  node(
    'artifact-unchanged',
    '-e',
    [
      "const fs=require('node:fs'),p=require('node:path'),a=require('node:assert/strict'),f=require('./tools/quality/artifact.cjs'),d=process.argv[1],b=fs.readFileSync(p.join(d,'artifact.json'));" +
        "a.equal(f.digest(b),process.argv[2],'frozen artifact manifest changed during prepublication');const m=JSON.parse(b);f.verify(p.join(d,'public'),m,m.artifactDigest);",
      input,
      artifactManifestDigest || '',
    ],
    ['artifact-source']
  );
  const finalIdentity = identify();
  checks.push({
    id: 'unchanged-source',
    pass: JSON.stringify(identity) === JSON.stringify(finalIdentity),
    status: JSON.stringify(identity) === JSON.stringify(finalIdentity) ? 'passed' : 'failed',
  });
  const result = {
    schema: 1,
    kind: 'prepublication-preflight',
    execution: {
      runId: process.env.GITHUB_RUN_ID || null,
      attempt: process.env.GITHUB_RUN_ATTEMPT || null,
    },
    ...identity,
    candidateCommit: environment.SITE_CANDIDATE_SHA,
    validationLevel: level,
    artifactManifest: path.join(input, 'artifact.json'),
    checks,
    artifactDigest: artifactRecord?.artifactDigest || null,
    artifactManifestDigest,
    edition: artifactRecord?.edition || null,
    pass: checks.every((row) => row.pass),
    fullGate: false,
    productionEligible: false,
    deploymentAuthorized: false,
  };
  assert.deepEqual(
    checks.map((row) => row.id),
    require('./prepublication.cjs').checkIds(level)
  );
  result.files = require('./prepublication.cjs').capture(reportDirectory, reportFile);
  fs.writeFileSync(reportFile, JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (require.main === module) {
  try {
    if (process.argv[2] === '--prepublication') {
      const [level, directory, flag, report, ...extra] = process.argv.slice(3);
      assert.ok(
        level && directory && !extra.length && (!flag || (flag === '--report' && report)),
        'Usage: local.cjs --prepublication staging|production DIRECTORY [--report FILE]'
      );
      const result = prepublication(level, directory, { report });
      console.log(JSON.stringify(result));
      if (!result.pass) process.exitCode = 1;
    } else if (process.argv[2] === '--ci-package') ciPackage(path.resolve(process.argv[3]));
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
module.exports = {
  check,
  checkContent,
  contentArguments,
  ciPackage,
  gate,
  finiteGeometry,
  tests,
  prepublication,
};
