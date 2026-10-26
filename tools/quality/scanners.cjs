'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process'),
  os = require('node:os'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..'),
  tools = path.resolve(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain')),
  out = path.resolve(process.env.SITE_REPORT_DIR || path.join(os.tmpdir(), 'site-quality'));
fs.mkdirSync(out, { recursive: true });
function run(command, args, accepted = [0], observed = () => {}) {
  const r = cp.spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: {
      ...process.env,
      SITE_AUDIT_TOOLS: tools,
      SEMGREP_SETTINGS_FILE: path.join(out, 'semgrep-settings.yml'),
      SEMGREP_LOG_FILE: path.join(out, 'semgrep.log'),
      RUFF_CACHE_DIR: path.join(out, 'ruff-cache'),
    },
  });
  observed({
    tool: path.basename(command),
    exitStatus: r.status,
    signal: r.signal || null,
  });
  if (!accepted.includes(r.status))
    throw Error(`${path.basename(command)} exit ${r.status}: ${r.stderr?.slice(-1500) || r.error}`);
  return r.stdout;
}
const binary = (name) =>
  path.join(tools, 'node_modules/.bin', name + (process.platform === 'win32' ? '.cmd' : ''));
const py = (name) =>
  path.join(tools, 'venv', process.platform === 'win32' ? 'Scripts' : 'bin', name);
const read = (file) => JSON.parse(fs.readFileSync(path.join(out, file), 'utf8'));
function storedReport(execute, command, args, file, redact, accepted = [0]) {
  let toolError;
  try {
    execute(command, args, accepted);
  } catch (error) {
    toolError = error;
  }
  let report;
  try {
    report = read(file);
    redact(report);
    fs.writeFileSync(path.join(out, file), JSON.stringify(report, null, 2));
  } catch (error) {
    if (toolError)
      throw Error(toolError.message + '; raw report: ' + error.message, {
        cause: error,
      });
    throw error;
  }
  if (toolError) throw toolError;
  return report;
}
function collectEngines(engines, directory = out) {
  assert.ok(Array.isArray(engines) && engines.length, 'missing scanner engines');
  assert.equal(new Set(engines.map((engine) => engine.name)).size, engines.length);
  const outcomes = [],
    values = {};
  for (const engine of engines) {
    const outcome = {
      name: engine.name,
      pass: false,
      commands: [],
      rawReports: [],
    };
    for (const file of engine.reports) {
      assert.equal(path.basename(file), file, 'invalid scanner report path');
      fs.rmSync(path.join(directory, file), { force: true });
    }
    try {
      values[engine.name] = engine.run((command, args, accepted) =>
        run(command, args, accepted, (result) => outcome.commands.push(result))
      );
      outcome.pass = true;
    } catch (error) {
      outcome.error = error.message;
    }
    for (const file of engine.reports) {
      const absolute = path.join(directory, file);
      if (fs.existsSync(absolute)) {
        const bytes = fs.readFileSync(absolute);
        outcome.rawReports.push({
          file,
          bytes: bytes.length,
          sha256: require('./artifact.cjs').digest(bytes),
        });
      }
    }
    outcomes.push(outcome);
  }
  if (outcomes.some((engine) => !engine.pass)) {
    const error = Error(
      'Scanner engines failed: ' +
        outcomes
          .filter((engine) => !engine.pass)
          .map((engine) => engine.name)
          .join(', ')
    );
    error.detail = { engines: outcomes };
    throw error;
  }
  return { engines: outcomes, values };
}
function pinnedPythonRequirements(text) {
  const pins = new Map();
  for (const line of text
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter((value) => value && !value.startsWith('#'))) {
    const match = line.match(/^([A-Za-z0-9][A-Za-z0-9_.-]*)==([A-Za-z0-9][A-Za-z0-9_.+!-]*)$/);
    assert.ok(match, 'Python advisory inputs require exact name==version pins');
    const name = match[1].toLowerCase().replace(/[-_.]+/g, '-');
    assert.ok(!pins.has(name), 'duplicate Python advisory input: ' + name);
    pins.set(name, match[2]);
  }
  assert.ok(pins.size, 'empty Python advisory input');
  return pins;
}
function admitPythonAdvisories(report, requirements) {
  const pins = pinnedPythonRequirements(requirements);
  assert.ok(
    Array.isArray(report?.dependencies) && report.dependencies.length,
    'missing Python advisory coverage'
  );
  const observed = new Set();
  for (const dependency of report.dependencies) {
    assert.ok(
      dependency && typeof dependency.name === 'string',
      'invalid Python advisory dependency'
    );
    const name = dependency.name.toLowerCase().replace(/[-_.]+/g, '-');
    assert.ok(pins.has(name), 'unknown Python advisory dependency: ' + name);
    assert.ok(!observed.has(name), 'duplicate Python advisory dependency: ' + name);
    observed.add(name);
    assert.ok(
      !Object.hasOwn(dependency, 'skip_reason'),
      'skipped Python advisory dependency: ' + name
    );
    assert.equal(dependency.version, pins.get(name), 'Python advisory version mismatch: ' + name);
    assert.ok(Array.isArray(dependency.vulns), 'missing Python vulnerability result: ' + name);
    assert.equal(dependency.vulns.length, 0, 'Python advisory findings: ' + name);
  }
  assert.deepEqual(
    [...observed].sort(),
    [...pins.keys()].sort(),
    'incomplete Python advisory coverage'
  );
  return { dependencies: pins.size };
}
function admitNpmAdvisories(
  npm,
  {
    projectRoot = root,
    toolchain = tools,
    exceptions = require('./advisory-exceptions.json'),
    now = new Date(),
  } = {}
) {
  assert.ok(npm && !npm.error && npm.metadata, 'npm advisory feed failure');
  assert.ok(
    npm.metadata.dependencies &&
      typeof npm.metadata.dependencies === 'object' &&
      !Array.isArray(npm.metadata.dependencies) &&
      Number.isInteger(npm.metadata.dependencies.total) &&
      npm.metadata.dependencies.total > 0,
    'missing npm dependency coverage'
  );
  assert.ok(
    Number.isInteger(npm.metadata.vulnerabilities?.total) &&
      npm.metadata.vulnerabilities.total >= 0,
    'invalid npm advisory counts'
  );
  const leaf = [];
  for (const value of Object.values(npm.vulnerabilities || {}))
    for (const item of value.via || []) if (typeof item === 'object') leaf.push(item);
  const lock = JSON.parse(fs.readFileSync(path.join(toolchain, 'package-lock.json')));
  for (const finding of leaf) {
    const exception = exceptions.find(
      (entry) => entry.url === finding.url && entry.package === finding.name
    );
    assert.ok(exception, 'Untriaged npm advisory ' + finding.url);
    assert.ok(
      /^\d{4}-\d{2}-\d{2}$/.test(exception.expires) &&
        Number.isFinite(Date.parse(exception.expires)) &&
        new Date(exception.expires).toISOString().slice(0, 10) === exception.expires,
      'invalid npm advisory review expiry'
    );
    assert.ok(new Date(exception.expires) >= now, 'expired npm advisory review');
    assert.equal(
      lock.packages['node_modules/' + exception.package]?.version,
      exception.version,
      'npm advisory version changed'
    );
    assert.equal(
      require('./artifact.cjs').digest(
        fs.readFileSync(path.join(projectRoot, exception.reviewedSource))
      ),
      exception.reviewedSourceSha256,
      'Advisory reachability review is stale'
    );
    for (const [file, expectedHash] of Object.entries(exception.reviewedMaterials))
      assert.equal(
        require('./artifact.cjs').digest(fs.readFileSync(path.join(projectRoot, file))),
        expectedHash,
        'Advisory reviewed config/lock changed'
      );
    assert.equal(
      require('./artifact.cjs').digest(fs.readFileSync(path.join(toolchain, 'package-lock.json'))),
      exception.reviewedMaterials['tools/quality/toolchain/package-lock.json'],
      'Installed toolchain differs from reviewed lock'
    );
  }
  assert.ok(
    npm.metadata.vulnerabilities.total === 0 || leaf.length > 0,
    'Unresolved npm advisory chain'
  );
  return {
    dependencies: npm.metadata.dependencies,
    findings: npm.metadata.vulnerabilities.total,
    reviewed: [...new Set(leaf.map((item) => item.url))],
  };
}
// The same manifest owns the browser effect import closure and build identity.
// Missing active sources must fail coverage rather than quietly shrink the scan.
const { effectSources: authoredRuntimeSources, effectInputs } = require('../site/effects.cjs');
function authoredRuntime(
  tracked,
  exists = (file) => fs.existsSync(path.join(root, file)),
  catalog = JSON.parse(fs.readFileSync(path.join(root, '.github/repository-paths.json'), 'utf8'))
    .entries
) {
  const files = new Set(tracked);
  if (
    !authoredRuntimeSources.length ||
    new Set(authoredRuntimeSources).size !== authoredRuntimeSources.length
  ) {
    throw Error('Invalid authored effect source manifest');
  }
  for (const file of effectInputs) {
    if (!files.has(file) || !exists(file)) throw Error('Missing active effect input: ' + file);
  }
  for (const file of authoredRuntimeSources) {
    if (
      !/^site\/effects\/[^/]+\.cjs$/.test(file) ||
      !effectInputs.includes(file) ||
      catalog[file]?.role !== 'source' ||
      catalog[file]?.kind !== 'file'
    ) {
      throw Error('Misclassified authored effect source: ' + file);
    }
  }
  return [...authoredRuntimeSources];
}
function lintEffectCoverage(report, expected = authoredRuntimeSources) {
  for (const file of expected) {
    const rows = report.filter(
      (row) =>
        path
          .relative(root, row.filePath || '')
          .split(path.sep)
          .join('/') === file
    );
    if (
      rows.length !== 1 ||
      !Array.isArray(rows[0].messages) ||
      rows[0].messages.some((message) => message.fatal || /ignored/i.test(message.message || ''))
    ) {
      throw Error('Missing or misclassified effect lint coverage: ' + file);
    }
  }
}
function lintFileCoverage(actual, expected, label, projectRoot = root) {
  if (
    !Array.isArray(actual) ||
    !Array.isArray(expected) ||
    !expected.length ||
    new Set(expected).size !== expected.length
  ) {
    throw Error('Invalid ' + label + ' coverage inventory');
  }
  const scanned = actual.map((file) =>
    path
      .relative(projectRoot, path.resolve(projectRoot, file || ''))
      .split(path.sep)
      .join('/')
  );
  const counts = new Map();
  for (const file of scanned) counts.set(file, (counts.get(file) || 0) + 1);
  for (const file of expected) {
    if (counts.get(file) !== 1)
      throw Error('Missing or duplicated ' + label + ' coverage: ' + file);
  }
  for (const file of scanned) {
    if (!expected.includes(file)) throw Error('Unexpected ' + label + ' coverage: ' + file);
  }
  return [...scanned].sort();
}
function lintSourceCoverage(report, expected, projectRoot = root) {
  if (!Array.isArray(report)) throw Error('Invalid ESLint report');
  const scanned = lintFileCoverage(
    report.map((row) => row.filePath),
    expected,
    'ESLint',
    projectRoot
  );
  for (const row of report) {
    if (
      !Array.isArray(row.messages) ||
      row.messages.some(
        (message) =>
          message.fatal || /ignored/i.test(message.message || '') || message.severity !== 1
      )
    ) {
      throw Error('Ignored, unparsed or incorrect ESLint source: ' + row.filePath);
    }
    if (row.errorCount || row.fatalErrorCount)
      throw Error('ESLint source correctness findings: ' + row.filePath);
  }
  return scanned;
}
function generatedJavaScript(projectRoot = root) {
  const outputs = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'site/output-lock.json'), 'utf8')
  ).files;
  if (!outputs || typeof outputs !== 'object')
    throw Error('Missing generated lint output inventory');
  const files = Object.keys(outputs).filter(
    (file) => !file.includes('/') && /\.(?:js|cjs|mjs)$/.test(file)
  );
  if (!files.length) throw Error('Missing generated JavaScript lint coverage');
  const present = fs
    .readdirSync(path.join(projectRoot, 'docs'))
    .filter((file) => /\.(?:js|cjs|mjs)$/.test(file));
  lintFileCoverage(present, files, 'generated JavaScript', path.join(projectRoot, 'docs'));
  for (const file of files) {
    if (!fs.lstatSync(path.join(projectRoot, 'docs', file)).isFile()) {
      throw Error('Missing or symlinked generated JavaScript: ' + file);
    }
  }
  return files.map((file) => 'docs/' + file).sort();
}
function reviewComplexity(
  warnings,
  policy,
  {
    now = new Date(),
    sourceBytes = (file) => fs.readFileSync(path.join(root, file)),
    baselineBytes = (commit, file) => run('git', ['show', commit + ':' + file]),
  } = {}
) {
  if (
    !Number.isFinite(Date.parse(policy.reviewBy)) ||
    (policy.complexity.length > 0 && new Date(policy.reviewBy) < now)
  ) {
    throw Error('Lint exceptions expired');
  }
  const digest = (bytes) => require('node:crypto').createHash('sha256').update(bytes).digest('hex');
  for (const warning of warnings) {
    const matches = policy.complexity.filter(
      (entry) =>
        entry.path === warning.file &&
        entry.rule === warning.rule &&
        entry.message === warning.message
    );
    if (matches.length !== 1)
      throw Error('Lint blocked: New or duplicated complexity debt ' + JSON.stringify(warning));
  }
  for (const entry of policy.complexity) {
    const matches = warnings.filter(
      (warning) =>
        entry.path === warning.file &&
        entry.rule === warning.rule &&
        entry.message === warning.message
    );
    if (!matches.length) throw Error('Stale complexity debt: ' + entry.path);
    if (matches.length !== 1) throw Error('New or duplicated complexity debt: ' + entry.path);
    // Newly exposed migrated code is an exact source-bound allowance, not a
    // license to increase complexity elsewhere or alter the admitted source.
    if (!entry.source_sha256 && authoredRuntimeSources.includes(entry.path)) {
      throw Error('Invalid source-bound complexity debt: ' + entry.path);
    }
    if (!entry.source_sha256) continue;
    const baseline = entry.baseline;
    if (
      entry.rule !== 'sonarjs/cognitive-complexity' ||
      !Number.isInteger(entry.issue) ||
      entry.issue < 1 ||
      !entry.removalTask ||
      !entry.reason ||
      !/^[a-f0-9]{64}$/.test(entry.source_sha256) ||
      !/^[a-f0-9]{40}$/.test(baseline?.commit || '') ||
      !/^[a-f0-9]{64}$/.test(baseline?.sha256 || '') ||
      !/^review\/[a-zA-Z0-9_./-]+\.cjs$/.test(baseline?.path || '') ||
      baseline.path.includes('..')
    ) {
      throw Error('Invalid source-bound complexity debt: ' + entry.path);
    }
    if (
      digest(sourceBytes(entry.path)) !== entry.source_sha256 ||
      digest(baselineBytes(baseline.commit, baseline.path)) !== baseline.sha256
    ) {
      throw Error('Changed source-bound complexity debt: ' + entry.path);
    }
  }
}
function verifiedChecksumIds(values) {
  const ids = new Set();
  for (const value of values) {
    require('node:assert/strict').match(
      value,
      /^[a-f0-9]{64}$/,
      'invalid verified public checksum'
    );
    ids.add(require('node:crypto').createHash('sha1').update(value).digest('hex'));
  }
  return ids;
}
function verifiedChecksumFinding(file, finding, proved) {
  return (
    ['.github/repository-intelligence/agent-context.json', '.github/ri-ci-map.json'].includes(
      file
    ) &&
    finding.type === 'Hex High Entropy String' &&
    proved.get(file)?.has(finding.hashed_secret) === true
  );
}
const secretReviewInputs = Object.freeze([
  'tools/quality/secrets-baseline.json',
  'tools/quality/secrets-reviewed.json',
  'tools/quality/secrets-reviewed-checksums.json',
  'tools/quality/secrets-publication.json',
]);
function secretReviewMetadata(review, file) {
  const baseline = file === secretReviewInputs[0];
  const keys = ['owner', 'issue', 'reviewedAt', 'scope', 'findings'];
  if (!baseline) keys.push('schema_version');
  if (
    !review ||
    typeof review !== 'object' ||
    Array.isArray(review) ||
    Object.keys(review).sort().join(':') !== keys.sort().join(':') ||
    (!baseline && review.schema_version !== 1) ||
    typeof review.owner !== 'string' ||
    !review.owner.trim() ||
    typeof review.issue !== 'string' ||
    !/^https:\/\/github\.com\/oborskyivitalii\/oborskyivitalii\/issues\/[1-9][0-9]*$/.test(
      review.issue || ''
    ) ||
    typeof review.reviewedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt || '') ||
    !Number.isFinite(Date.parse(review.reviewedAt)) ||
    new Date(review.reviewedAt).toISOString().slice(0, 10) !== review.reviewedAt ||
    typeof review.scope !== 'string' ||
    !review.scope.trim() ||
    !Array.isArray(review.findings)
  ) {
    throw Error('Invalid secret review metadata: ' + file);
  }
}
function secretReviewPath(file) {
  if (
    typeof file !== 'string' ||
    !file ||
    path.posix.isAbsolute(file) ||
    /[\\:*?[\]{}]/.test(file)
  ) {
    return false;
  }
  for (const character of file) {
    if (character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) return false;
  }
  return file.split('/').every((part) => part && part !== '.' && part !== '..');
}
function secretReviewEntry(entry, file) {
  const checksumOnly = file === secretReviewInputs[2];
  const rules = checksumOnly
    ? ['Hex High Entropy String']
    : ['Hex High Entropy String', 'Secret Keyword', 'Basic Auth Credentials'];
  // npm's published integrity strings have a distinct scanner type. This one
  // exact inventory path additionally requires a current lock proof at admission.
  if (file === secretReviewInputs[3] && entry?.path === 'tools/publishing/toolchain/licenses.json')
    rules.push('Base64 High Entropy String');
  if (file === secretReviewInputs[2] && entry?.path === 'tools/quality/browser-archives.json')
    rules.push('Base64 High Entropy String');
  if (
    !entry ||
    typeof entry !== 'object' ||
    Array.isArray(entry) ||
    Object.keys(entry).sort().join(':') !== 'disposition:id:path:reason:rule' ||
    !secretReviewPath(entry.path) ||
    !rules.includes(entry.rule) ||
    entry.disposition !== 'false positive' ||
    typeof entry.reason !== 'string' ||
    !entry.reason.trim() ||
    typeof entry.id !== 'string' ||
    !/^[a-f0-9]{40}$/.test(entry.id.slice(-40)) ||
    entry.id !== entry.path + ':' + entry.rule + ':' + entry.id.slice(-40)
  ) {
    throw Error('Invalid exact secret review entry: ' + file);
  }
}
function loadSecretReviews(projectRoot = root) {
  const reviewed = new Map();
  // A closed input list keeps a neighboring JSON file from silently becoming
  // an admission authority. Each ledger retains the existing 2 MB byte bound.
  for (const file of secretReviewInputs) {
    const absolute = path.join(projectRoot, file);
    const stat = fs.lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 2000000) {
      throw Error('Invalid or oversized secret review input: ' + file);
    }
    const review = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    secretReviewMetadata(review, file);
    for (const entry of review.findings) {
      secretReviewEntry(entry, file);
      if (reviewed.has(entry.id)) throw Error('Duplicate secret review ID: ' + entry.id);
      reviewed.set(entry.id, entry);
    }
  }
  return reviewed;
}
function publicationIntegrityProof(projectRoot = root) {
  const inventoryPath = 'tools/publishing/toolchain/licenses.json';
  const lockPath = 'tools/publishing/toolchain/package-lock.json';
  const readBounded = (relative) => {
    const absolute = path.join(projectRoot, relative);
    const stat = fs.lstatSync(absolute);
    if (
      !stat.isFile() ||
      stat.isSymbolicLink() ||
      stat.size > 2000000 ||
      fs.realpathSync(absolute) !== path.join(fs.realpathSync(projectRoot), relative)
    )
      throw Error('Invalid publication integrity proof input: ' + relative);
    return fs.readFileSync(absolute);
  };
  const lockBytes = readBounded(lockPath);
  const lock = JSON.parse(lockBytes);
  const inventory = JSON.parse(readBounded(inventoryPath));
  const locations = Object.keys(lock.packages || {}).filter((name) =>
    name.startsWith('node_modules/')
  );
  if (
    inventory.schema !== 1 ||
    inventory.dependencyLockSha256 !== require('./artifact.cjs').digest(lockBytes) ||
    !Array.isArray(inventory.packages) ||
    inventory.packages.length === 0 ||
    inventory.packages.length > 500 ||
    inventory.packages.length !== locations.length
  )
    throw Error('Publication integrity inventory differs from its exact dependency lock');
  const seen = new Set();
  const proved = new Set();
  for (const entry of inventory.packages) {
    const pinned = lock.packages[entry.location];
    if (
      !locations.includes(entry.location) ||
      seen.has(entry.location) ||
      entry.name !== entry.location.split('node_modules/').at(-1) ||
      entry.version !== pinned?.version ||
      entry.integrity !== pinned?.integrity ||
      typeof entry.integrity !== 'string' ||
      !/^sha512-[A-Za-z0-9+/]{86}==$/.test(entry.integrity) ||
      Buffer.from(entry.integrity.slice(7), 'base64').toString('base64') !==
        entry.integrity.slice(7)
    )
      throw Error('Unproved publication package integrity: ' + entry.location);
    seen.add(entry.location);
    proved.add(require('node:crypto').createHash('sha1').update(entry.integrity).digest('hex'));
  }
  return proved;
}
function browserIntegrityProof(projectRoot = root, selectedToolchain = tools) {
  const readInput = (base, relative) => {
    const file = require('./bandit-triage.cjs').safePath(base, relative);
    assert.ok(fs.statSync(file).size <= 2000000, 'Oversized browser integrity proof input');
    return fs.readFileSync(file);
  };
  const registry = JSON.parse(readInput(projectRoot, 'tools/quality/browser-archives.json'));
  const lockBytes = readInput(projectRoot, 'tools/quality/toolchain/package-lock.json');
  assert.deepEqual(
    readInput(selectedToolchain, 'package-lock.json'),
    lockBytes,
    'Selected browser toolchain lock differs'
  );
  const lock = JSON.parse(lockBytes);
  const installed = JSON.parse(readInput(selectedToolchain, 'node_modules/.package-lock.json'));
  const names = ['playwright', 'playwright-core'];
  const packages = {};
  for (const name of names) {
    const location = 'node_modules/' + name;
    const pinned = lock.packages?.[location];
    const actual = installed.packages?.[location];
    const metadata = JSON.parse(readInput(selectedToolchain, location + '/package.json'));
    assert.ok(
      pinned && typeof pinned.version === 'string' && typeof pinned.resolved === 'string',
      'Missing browser package lock entry'
    );
    assert.ok(
      /^sha512-[A-Za-z0-9+/]{86}==$/.test(pinned.integrity || '') &&
        Buffer.from(pinned.integrity.slice(7), 'base64').toString('base64') ===
          pinned.integrity.slice(7),
      'Noncanonical browser package integrity'
    );
    for (const key of ['version', 'integrity', 'resolved'])
      assert.equal(actual?.[key], pinned[key], 'Installed browser package lock differs');
    assert.equal(metadata.name, name, 'Installed browser package name differs');
    assert.equal(metadata.version, pinned.version, 'Installed browser package version differs');
    packages[name] = { version: pinned.version, integrity: pinned.integrity };
  }
  assert.ok(
    registry.schema === 1 &&
      Array.isArray(registry.archives) &&
      registry.archives.length > 0 &&
      registry.archives.length <= 16,
    'Invalid browser integrity inventory'
  );
  const fields = new Set();
  registry.archives.forEach((record, index) => {
    assert.deepEqual(record.identity?.packages, packages, 'Browser inventory package differs');
    for (const name of names)
      fields.add(JSON.stringify(['archives', index, 'identity', 'packages', name, 'integrity']));
  });
  const integrities = names.map((name) => packages[name].integrity);
  function checkFields(value, parts = []) {
    if (typeof value === 'string') {
      if (integrities.some((integrity) => value.includes(integrity)))
        assert.ok(fields.has(JSON.stringify(parts)), 'Browser integrity outside its package field');
    } else if (value && typeof value === 'object') {
      for (const [name, child] of Object.entries(value)) {
        assert.ok(
          !integrities.some((integrity) => name.includes(integrity)),
          'Browser integrity in an object property name'
        );
        checkFields(child, [...parts, Array.isArray(value) ? Number(name) : name]);
      }
    }
  }
  checkFields(registry);
  return new Set(
    integrities.map((value) =>
      require('node:crypto').createHash('sha1').update(value).digest('hex')
    )
  );
}
function reviewedSecretFinding(
  file,
  finding,
  reviewed,
  publicationIntegrities = new Set(),
  browserIntegrities = new Set()
) {
  const reviewedValue = reviewed.has([file, finding.type, finding.hashed_secret].join(':'));
  if (finding.type !== 'Base64 High Entropy String') return reviewedValue;
  return (
    reviewedValue &&
    ((file === 'tools/publishing/toolchain/licenses.json' &&
      publicationIntegrities.has(finding.hashed_secret)) ||
      (file === 'tools/quality/browser-archives.json' &&
        browserIntegrities.has(finding.hashed_secret)))
  );
}
function lint() {
  const inventory = require('./format.cjs').sourceInventory(root);
  const offlineRuntime = authoredRuntime(
    run('git', ['ls-files', 'site', 'tools']).trim().split('\n')
  );
  const javascript = [...inventory.byLanguage.js, ...generatedJavaScript(root)];
  const python = inventory.byLanguage.python;
  const result = collectEngines([
    {
      name: 'eslint',
      reports: ['eslint.json'],
      run: (run) => {
        run(
          binary('eslint'),
          [
            '--config',
            'tools/quality/eslint.config.cjs',
            '--no-ignore',
            '--no-inline-config',
            ...javascript,
            '--format',
            'json',
            '--output-file',
            path.join(out, 'eslint.json'),
          ],
          [0, 1]
        );
        const eslint = read('eslint.json');
        lintSourceCoverage(eslint, javascript);
        lintEffectCoverage(eslint, offlineRuntime);
        const warnings = eslint.flatMap((f) =>
          f.messages
            .filter((m) => m.severity === 1)
            .map((m) => ({
              file: path.relative(root, f.filePath).split(path.sep).join('/'),
              rule: m.ruleId,
              message: m.message,
            }))
        );
        reviewComplexity(warnings, require('./exceptions.json'));
        return { report: eslint, warnings };
      },
    },
    {
      name: 'stylelint',
      reports: ['stylelint.json'],
      run: (run) => {
        run(process.execPath, ['tools/quality/stylelint.cjs']);
        return read('stylelint.json');
      },
    },
    {
      name: 'ruff',
      reports: ['ruff.json', 'ruff-coverage.json'],
      run: (run) => {
        const ruffArguments = [
          'check',
          '--no-cache',
          '--isolated',
          '--no-respect-gitignore',
          '--ignore-noqa',
          '--select',
          'E4,E7,E9,F,I',
          ...python,
        ];
        const ruff = JSON.parse(
          run(py('ruff'), [...ruffArguments, '--output-format', 'json'], [0, 1])
        );
        fs.writeFileSync(path.join(out, 'ruff.json'), JSON.stringify(ruff, null, 2));
        const pythonFiles = lintFileCoverage(
          run(py('ruff'), [
            'check',
            '--no-cache',
            '--isolated',
            '--no-respect-gitignore',
            '--show-files',
            ...python,
          ])
            .trim()
            .split('\n')
            .filter(Boolean),
          python,
          'Ruff'
        );
        fs.writeFileSync(
          path.join(out, 'ruff-coverage.json'),
          JSON.stringify(pythonFiles, null, 2) + '\n'
        );
        if (!Array.isArray(ruff) || ruff.length)
          throw Error('Ruff correctness findings or invalid report');
        return pythonFiles;
      },
    },
  ]);
  const eslint = result.values.eslint.report,
    css = result.values.stylelint,
    pythonFiles = result.values.ruff;
  return {
    engines: result.engines,
    scannedFiles: eslint.length + css.length + pythonFiles.length,
    sourceInventory: inventory.files,
    javascriptFiles: javascript,
    effectSources: offlineRuntime,
    cssFiles: css.map((row) => path.relative(root, row.source).split(path.sep).join('/')),
    pythonFiles,
    warnings: result.values.eslint.warnings,
    tools: {
      eslint: run(binary('eslint'), ['--version']).trim(),
      stylelint: run(binary('stylelint'), ['--version']).trim(),
      ruff: run(py('ruff'), ['--version']).trim(),
    },
  };
}
function security() {
  const offlineRuntime = authoredRuntime(
    run('git', ['ls-files', 'site', 'tools']).trim().split('\n')
  );
  const expected = [
    ...new Set([
      ...run('git', ['ls-files', 'docs', 'site', 'tools', '.github/workflows'])
        .trim()
        .split('\n')
        .filter(
          (file) => /\.(?:js|cjs|mjs|html|py)$/.test(file) || file.startsWith('.github/workflows/')
        ),
      ...offlineRuntime,
    ]),
  ];
  const result = collectEngines([
    {
      name: 'semgrep',
      reports: ['semgrep.json'],
      run: (run) => {
        // Files are scanned at their real paths, including inline HTML. Reports retain
        // coverage/errors. Source snippets are removed before artifact upload.
        const semgrep = storedReport(
          run,
          py('semgrep'),
          [
            'scan',
            '--config',
            'tools/quality/security-rules.yml',
            '--metrics',
            'off',
            '--disable-version-check',
            '--jobs',
            '1',
            '--max-target-bytes',
            '5000000',
            '--json',
            '--output',
            path.join(out, 'semgrep.json'),
            'docs',
            'site',
            'tools',
            '.github/workflows',
            ...offlineRuntime,
          ],
          'semgrep.json',
          (report) => {
            for (const finding of report.results || [])
              if (finding.extra) delete finding.extra.lines;
          }
        );
        if (semgrep.results?.length || semgrep.errors?.length || !semgrep.paths?.scanned?.length)
          throw Error('Semgrep findings, errors, or empty coverage');
        const scanned = new Set(semgrep.paths.scanned);
        for (const file of expected)
          if (!scanned.has(file)) throw Error('Unscanned source ' + file);
        return { files: semgrep.paths.scanned, rules: 8, errors: 0, expected };
      },
    },
    {
      name: 'bandit',
      reports: ['bandit.json', 'bandit-triage.json'],
      run: (run) => {
        const bandit = storedReport(
          run,
          py('bandit'),
          [
            '-r',
            'tools',
            '-x',
            'tools/quality/toolchain/venv',
            '-f',
            'json',
            '-o',
            path.join(out, 'bandit.json'),
          ],
          'bandit.json',
          (report) => {
            for (const finding of report.results || []) delete finding.code;
          },
          [0, 1]
        );
        let banditReview;
        try {
          banditReview = require('./bandit-triage.cjs').admit(
            root,
            bandit,
            expected.filter((file) => file.endsWith('.py')),
            {
              rawReportSha256: require('./artifact.cjs').digest(
                fs.readFileSync(path.join(out, 'bandit.json'))
              ),
            }
          );
        } catch (error) {
          fs.writeFileSync(
            path.join(out, 'bandit-triage.json'),
            JSON.stringify(
              {
                schema: 1,
                kind: 'bandit-triage',
                pass: false,
                rawFindings: bandit.results?.length ?? null,
                error: error.message,
              },
              null,
              2
            )
          );
          throw error;
        }
        fs.writeFileSync(
          path.join(out, 'bandit-triage.json'),
          JSON.stringify(banditReview, null, 2)
        );
        if (
          bandit.errors?.length ||
          banditReview.untriagedFindings ||
          !bandit.metrics?._totals?.loc
        )
          throw Error('Bandit coverage or finding');
        for (const file of expected.filter((x) => x.endsWith('.py')))
          if (!bandit.metrics[file] && !bandit.metrics['./' + file])
            throw Error('Bandit missed tracked Python ' + file);
        return {
          loc: bandit.metrics._totals.loc,
          findings: banditReview.untriagedFindings,
          rawFindings: banditReview.rawFindings,
          reviewedFindings: banditReview.reviewedFindings,
          policySha256: banditReview.policySha256,
        };
      },
    },
    {
      name: 'secrets',
      reports: ['detect-secrets.json'],
      run: (run) => {
        const tracked = run('git', ['ls-files', '-z']).split('\0').filter(Boolean),
          text = tracked.filter((f) => {
            const bytes = fs.readFileSync(path.join(root, f));
            return !bytes.includes(0) && !f.endsWith('.gz');
          });
        const secrets = JSON.parse(run(py('detect-secrets'), ['scan', '--no-verify', ...text]));
        fs.writeFileSync(path.join(out, 'detect-secrets.json'), JSON.stringify(secrets, null, 2));
        const reviewed = loadSecretReviews(),
          publicationIntegrities = publicationIntegrityProof(),
          browserIntegrities = (secrets.results['tools/quality/browser-archives.json'] || []).some(
            (finding) => finding.type === 'Base64 High Entropy String'
          )
            ? browserIntegrityProof(root, tools)
            : new Set(),
          newFindings = [];
        const navigationFile = '.github/repository-intelligence/agent-context.json';
        run(py('python'), [
          'tools/repository_intelligence.py',
          '--config',
          '.github/repository-intelligence-config.json',
          'verify',
        ]);
        const navigation = JSON.parse(fs.readFileSync(path.join(root, navigationFile))),
          publicHashes = [
            navigation.source_identity.digest,
            navigation.producer.sha256,
            navigation.producer.config_sha256,
            ...navigation.source_identity.inputs.map((x) => x.sha256).filter(Boolean),
          ];
        run(py('python'), ['tools/check_ri_ci.py', 'verify']);
        const coupling = JSON.parse(
          fs.readFileSync(path.join(root, '.github/ri-ci-map.json'))
        ).reviewed_source_identity;
        const proved = new Map([
          [navigationFile, verifiedChecksumIds(publicHashes)],
          [
            '.github/ri-ci-map.json',
            verifiedChecksumIds([coupling.digest, ...coupling.inputs.map((x) => x.sha256)]),
          ],
        ]);
        const generatedChecksums = require('./generated-checksums.cjs');
        const generatedProof = generatedChecksums.proveGeneratedChecksums(root);
        const generatedAdmitted = generatedChecksums.admitGeneratedChecksumFindings(
          secrets.results,
          generatedProof
        );
        for (const [file, findings] of Object.entries(secrets.results))
          for (const finding of findings) {
            const provedChecksum = verifiedChecksumFinding(file, finding, proved);
            if (
              !provedChecksum &&
              !generatedAdmitted.has(generatedChecksums.findingKey(file, finding)) &&
              !reviewedSecretFinding(
                file,
                finding,
                reviewed,
                publicationIntegrities,
                browserIntegrities
              )
            )
              newFindings.push({
                file,
                type: finding.type,
                hash: finding.hashed_secret,
              });
          }
        if (newFindings.length)
          throw Error(
            `${newFindings.length} untriaged secret candidates; see hashed-only detect-secrets.json`
          );
        return {
          trackedTextFiles: text.length,
          reviewedCandidates: Object.values(secrets.results).flat().length,
          generatedCandidates: generatedAdmitted.size,
          generatedChecksumProof: generatedProof.detail,
        };
      },
    },
  ]);
  return {
    engines: result.engines,
    semgrep: result.values.semgrep,
    bandit: result.values.bandit,
    secrets: result.values.secrets,
    historyScan: false,
  };
}
function advisories() {
  const publicationToolchain = path.join(root, 'tools/publishing/toolchain');
  const result = collectEngines([
    {
      name: 'npm',
      reports: ['npm-audit.json'],
      run: (run) => {
        const npm = JSON.parse(
          run(
            process.platform === 'win32' ? 'npm.cmd' : 'npm',
            ['audit', '--prefix', tools, '--json'],
            [0, 1]
          )
        );
        fs.writeFileSync(path.join(out, 'npm-audit.json'), JSON.stringify(npm, null, 2));
        return admitNpmAdvisories(npm);
      },
    },
    {
      name: 'publicationNpm',
      reports: ['publication-npm-audit.json'],
      run: (run) => {
        const npm = JSON.parse(
          run(
            process.platform === 'win32' ? 'npm.cmd' : 'npm',
            ['audit', '--prefix', publicationToolchain, '--json'],
            [0, 1]
          )
        );
        fs.writeFileSync(
          path.join(out, 'publication-npm-audit.json'),
          JSON.stringify(npm, null, 2)
        );
        const admitted = admitNpmAdvisories(npm, {
          toolchain: publicationToolchain,
          exceptions: [],
        });
        assert.equal(admitted.findings, 0, 'Publication dependency advisory finding');
        return {
          dependencies: admitted.dependencies,
          lockSha256: require('./artifact.cjs').digest(
            fs.readFileSync(path.join(publicationToolchain, 'package-lock.json'))
          ),
        };
      },
    },
    {
      name: 'pip',
      reports: ['pip-audit.json'],
      run: (run) => {
        run(py('python'), ['tools/quality/python_toolchain.py']);
        run(py('pip-audit'), [
          '-r',
          'tools/quality/toolchain/requirements.txt',
          '--no-deps',
          '--disable-pip',
          '--format',
          'json',
          '--output',
          path.join(out, 'pip-audit.json'),
        ]);
        return admitPythonAdvisories(
          read('pip-audit.json'),
          fs.readFileSync(path.join(root, 'tools/quality/toolchain/requirements.txt'), 'utf8')
        );
      },
    },
  ]);
  return {
    engines: result.engines,
    feedDate: new Date().toISOString(),
    npm: result.values.npm.dependencies,
    npmFindingCount: result.values.npm.findings,
    reviewedNpmAdvisories: result.values.npm.reviewed,
    pythonDependencies: result.values.pip.dependencies,
    runtimeDependencies: 'none',
    publicationDependencies: result.values.publicationNpm.dependencies,
    publicationLockSha256: result.values.publicationNpm.lockSha256,
  };
}
function repositoryLint() {
  const git = require('./delivery-git.cjs'),
    common = require('./common.cjs');
  const commit = git.text(git.git(root, ['rev-parse', 'HEAD'])).trim();
  const source = git.resolve(root, commit);
  git.clean(root, commit);
  if (process.env.SITE_CANDIDATE_SHA) assert.equal(commit, process.env.SITE_CANDIDATE_SHA);
  const report = {
    schema: 1,
    kind: 'repository-source-lint',
    pass: false,
    sourceCommit: commit,
    sourceTree: source.tree,
    candidateCommit: commit,
    website: 'not-applicable',
    environment: common.environment(),
  };
  try {
    report.detail = lint();
    git.clean(root, commit);
    report.pass = true;
    common.save('repository-lint', report);
    return report;
  } catch (error) {
    report.error = error.message;
    if (error.detail) report.detail = error.detail;
    common.save('repository-lint', report);
    throw error;
  }
}
function main(kind = process.argv[2]) {
  if (kind === 'lint' && process.env.SITE_REPOSITORY_ONLY === 'true') return repositoryLint();
  try {
    const identity = require('./common.cjs').identity();
    for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit'])
      assert.match(identity[key], /^[a-f0-9]{40}$/, 'invalid scanner source identity');
    assert.match(identity.artifactDigest, /^[a-f0-9]{64}$/, 'invalid scanner artifact identity');
    const detail =
      kind === 'lint'
        ? lint()
        : kind === 'security'
          ? security()
          : kind === 'advisories'
            ? advisories()
            : (() => {
                throw Error('Unknown scanner stage');
              })();
    require('./common.cjs').report(kind, { detail });
  } catch (e) {
    require('./common.cjs').report(
      kind,
      { error: e.message, ...(e.detail ? { detail: e.detail } : {}) },
      false
    );
    throw e;
  }
}
if (require.main === module) main();
module.exports = {
  main,
  collectEngines,
  pinnedPythonRequirements,
  admitPythonAdvisories,
  admitNpmAdvisories,
  authoredRuntimeSources,
  authoredRuntime,
  lintEffectCoverage,
  lintFileCoverage,
  lintSourceCoverage,
  generatedJavaScript,
  reviewComplexity,
  verifiedChecksumIds,
  verifiedChecksumFinding,
  loadSecretReviews,
  reviewedSecretFinding,
  publicationIntegrityProof,
  browserIntegrityProof,
};
