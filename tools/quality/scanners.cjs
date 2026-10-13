'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process'),
  os = require('node:os');
const root = path.resolve(__dirname, '../..'),
  tools = path.resolve(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain')),
  out = path.resolve(process.env.SITE_REPORT_DIR || path.join(os.tmpdir(), 'site-quality'));
fs.mkdirSync(out, { recursive: true });
function run(command, args, accepted = [0]) {
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
  if (!accepted.includes(r.status))
    throw Error(`${path.basename(command)} exit ${r.status}: ${r.stderr?.slice(-1500) || r.error}`);
  return r.stdout;
}
const binary = (name) =>
  path.join(tools, 'node_modules/.bin', name + (process.platform === 'win32' ? '.cmd' : ''));
const py = (name) =>
  path.join(tools, 'venv', process.platform === 'win32' ? 'Scripts' : 'bin', name);
const read = (file) => JSON.parse(fs.readFileSync(path.join(out, file), 'utf8'));
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
      throw Error('New or duplicated complexity debt ' + JSON.stringify(warning));
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
function reviewedSecretFinding(file, finding, reviewed, publicationIntegrities = new Set()) {
  const reviewedValue = reviewed.has([file, finding.type, finding.hashed_secret].join(':'));
  if (finding.type !== 'Base64 High Entropy String') return reviewedValue;
  return (
    reviewedValue &&
    file === 'tools/publishing/toolchain/licenses.json' &&
    publicationIntegrities.has(finding.hashed_secret)
  );
}
function lint() {
  const inventory = require('./format.cjs').sourceInventory(root);
  const offlineRuntime = authoredRuntime(
    run('git', ['ls-files', 'site', 'tools']).trim().split('\n')
  );
  const javascript = [...inventory.byLanguage.js, ...generatedJavaScript(root)];
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
  run(process.execPath, ['tools/quality/stylelint.cjs']);
  const css = read('stylelint.json');
  const python = inventory.byLanguage.python;
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
  const ruff = JSON.parse(run(py('ruff'), [...ruffArguments, '--output-format', 'json'], [0, 1]));
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
  return {
    scannedFiles: eslint.length + css.length + pythonFiles.length,
    sourceInventory: inventory.files,
    javascriptFiles: javascript,
    effectSources: offlineRuntime,
    cssFiles: css.map((row) => path.relative(root, row.source).split(path.sep).join('/')),
    pythonFiles,
    warnings,
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
  // Files are scanned at their real paths, including inline HTML. Reports retain
  // coverage/errors. Source snippets are removed before artifact upload.
  run(py('semgrep'), [
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
  ]);
  const semgrep = read('semgrep.json');
  for (const finding of semgrep.results || []) if (finding.extra) delete finding.extra.lines;
  fs.writeFileSync(path.join(out, 'semgrep.json'), JSON.stringify(semgrep, null, 2));
  if (semgrep.results?.length || semgrep.errors?.length || !semgrep.paths?.scanned?.length)
    throw Error('Semgrep findings, errors, or empty coverage');
  const scanned = new Set(semgrep.paths.scanned),
    expected = [
      ...new Set([
        ...run('git', ['ls-files', 'docs', 'site', 'tools', '.github/workflows'])
          .trim()
          .split('\n')
          .filter((f) => /\.(?:js|cjs|mjs|html|py)$/.test(f) || f.startsWith('.github/workflows/')),
        ...offlineRuntime,
      ]),
    ];
  for (const file of expected) if (!scanned.has(file)) throw Error('Unscanned source ' + file);
  run(
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
    [0, 1]
  );
  const bandit = read('bandit.json');
  for (const finding of bandit.results || []) delete finding.code;
  fs.writeFileSync(path.join(out, 'bandit.json'), JSON.stringify(bandit, null, 2));
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
  fs.writeFileSync(path.join(out, 'bandit-triage.json'), JSON.stringify(banditReview, null, 2));
  if (bandit.errors?.length || banditReview.untriagedFindings || !bandit.metrics?._totals?.loc)
    throw Error('Bandit coverage or finding');
  for (const file of expected.filter((x) => x.endsWith('.py')))
    if (!bandit.metrics[file] && !bandit.metrics['./' + file])
      throw Error('Bandit missed tracked Python ' + file);
  const tracked = run('git', ['ls-files', '-z']).split('\0').filter(Boolean),
    text = tracked.filter((f) => {
      const bytes = fs.readFileSync(path.join(root, f));
      return !bytes.includes(0) && !f.endsWith('.gz');
    });
  const secrets = JSON.parse(run(py('detect-secrets'), ['scan', '--no-verify', ...text]));
  fs.writeFileSync(path.join(out, 'detect-secrets.json'), JSON.stringify(secrets, null, 2));
  const reviewed = loadSecretReviews(),
    publicationIntegrities = publicationIntegrityProof(),
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
        !reviewedSecretFinding(file, finding, reviewed, publicationIntegrities)
      )
        newFindings.push({ file, type: finding.type, hash: finding.hashed_secret });
    }
  if (newFindings.length)
    throw Error(
      `${newFindings.length} untriaged secret candidates; see hashed-only detect-secrets.json`
    );
  return {
    semgrep: { files: semgrep.paths.scanned, rules: 8, errors: 0, expected },
    bandit: {
      loc: bandit.metrics._totals.loc,
      findings: banditReview.untriagedFindings,
      rawFindings: banditReview.rawFindings,
      reviewedFindings: banditReview.reviewedFindings,
      policySha256: banditReview.policySha256,
    },
    secrets: {
      trackedTextFiles: text.length,
      reviewedCandidates: Object.values(secrets.results).flat().length,
      generatedCandidates: generatedAdmitted.size,
      generatedChecksumProof: generatedProof.detail,
    },
    historyScan: false,
  };
}
function advisories() {
  const publicationToolchain = path.join(root, 'tools/publishing/toolchain');
  const publicationAudit = JSON.parse(
    run(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['audit', '--prefix', publicationToolchain, '--json'],
      [0, 1]
    )
  );
  fs.writeFileSync(
    path.join(out, 'publication-npm-audit.json'),
    JSON.stringify(publicationAudit, null, 2)
  );
  if (
    publicationAudit.error ||
    !publicationAudit.metadata?.dependencies ||
    publicationAudit.metadata.vulnerabilities?.total !== 0
  )
    throw Error('Publication dependency advisory feed failed or has an unreviewed finding');
  const npm = JSON.parse(
    run(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['audit', '--prefix', path.join(tools), '--json'],
      [0, 1]
    )
  );
  fs.writeFileSync(path.join(out, 'npm-audit.json'), JSON.stringify(npm, null, 2));
  if (npm.error || !npm.metadata) throw Error('npm advisory feed failure');
  const exceptions = require('./advisory-exceptions.json'),
    leaf = [];
  for (const value of Object.values(npm.vulnerabilities || {}))
    for (const item of value.via || []) if (typeof item === 'object') leaf.push(item);
  const lock = JSON.parse(fs.readFileSync(path.join(tools, 'package-lock.json')));
  for (const finding of leaf) {
    const exception = exceptions.find((x) => x.url === finding.url && x.package === finding.name);
    if (
      !exception ||
      new Date(exception.expires) < new Date() ||
      lock.packages['node_modules/' + exception.package]?.version !== exception.version
    )
      throw Error('Untriaged/expired npm advisory ' + finding.url);
    const hash = require('./artifact.cjs').digest(
      fs.readFileSync(path.join(root, exception.reviewedSource))
    );
    if (hash !== exception.reviewedSourceSha256)
      throw Error('Advisory reachability review is stale');
    for (const [file, expectedHash] of Object.entries(exception.reviewedMaterials))
      if (require('./artifact.cjs').digest(fs.readFileSync(path.join(root, file))) !== expectedHash)
        throw Error('Advisory reviewed config/lock changed');
    if (
      require('./artifact.cjs').digest(fs.readFileSync(path.join(tools, 'package-lock.json'))) !==
      exception.reviewedMaterials['tools/quality/toolchain/package-lock.json']
    )
      throw Error('Installed toolchain differs from reviewed lock');
  }
  if (npm.metadata.vulnerabilities.total > 0 && leaf.length === 0)
    throw Error('Unresolved npm advisory chain');
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
  const python = read('pip-audit.json');
  if (!python.dependencies?.length || python.dependencies.some((x) => x.vulns?.length))
    throw Error('Python advisories or missing coverage');
  return {
    feedDate: new Date().toISOString(),
    npm: npm.metadata.dependencies,
    npmFindingCount: npm.metadata.vulnerabilities.total,
    reviewedNpmAdvisories: [...new Set(leaf.map((x) => x.url))],
    pythonDependencies: python.dependencies.length,
    runtimeDependencies: 'none',
    publicationDependencies: publicationAudit.metadata.dependencies,
    publicationLockSha256: require('./artifact.cjs').digest(
      fs.readFileSync(path.join(publicationToolchain, 'package-lock.json'))
    ),
  };
}
function main(kind = process.argv[2]) {
  try {
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
    require('./common.cjs').report(kind, { error: e.message }, false);
    throw e;
  }
}
if (require.main === module) main();
module.exports = {
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
};
