'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const maintainedRoles = new Set(['source', 'validator', 'configuration', 'workflow', 'test']);
const requiredRoots = ['site/', 'tools/', 'tests/', '.github/'];
const requiredDirectories = [
  'docs/',
  'review/',
  'drafts/',
  'site/retained/',
  '.github/repository-intelligence/',
];
const requiredExactExclusions = [
  'site/output-lock.json',
  'tools/quality/toolchain/package-lock.json',
  'tools/quality/secrets-baseline.json',
  'tools/quality/secrets-reviewed.json',
];
const requiredNonSourceDirectories = [
  'node_modules',
  'venv',
  '.venv',
  '__pycache__',
  '.ruff_cache',
  '.site-cache',
  'quality-results',
  'quality-artifact',
  'color-artifact',
  'quality-reports',
  'staging-package',
  'staging-rollback',
  'staging-reports',
];
const languages = {
  js: ['.js', '.cjs', '.mjs'],
  css: ['.css'],
  html: ['.html'],
  python: ['.py'],
  json: ['.json'],
  yaml: ['.yml', '.yaml'],
};

function readJson(projectRoot, file) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, file), 'utf8'));
}

function classifyLanguage(file) {
  const extension = path.posix.extname(file);
  return Object.keys(languages).find((language) => languages[language].includes(extension));
}

function safePath(file) {
  return (
    typeof file === 'string' &&
    file.length > 0 &&
    !file.includes('\\') &&
    !file.includes('\0') &&
    !path.posix.isAbsolute(file) &&
    !file.split('/').some((part) => part === '..' || part === '' || part === '.')
  );
}

function equalEntries(actual, expected) {
  return (
    Array.isArray(actual) &&
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function validateScope(scope) {
  if (
    scope?.schemaVersion !== 1 ||
    scope.issue !== 58 ||
    !equalEntries(scope.roots, requiredRoots) ||
    JSON.stringify(scope.languages) !== JSON.stringify(languages)
  ) {
    throw Error('Formatter scope must cover all maintained roots and six languages');
  }
  if (scope.versions?.prettier !== '3.6.2' || scope.versions?.ruff !== '0.16.10') {
    throw Error('Formatter scope has an unexpected exact tool version');
  }
  for (const field of ['directoryExclusions', 'exactExclusions']) {
    if (!Array.isArray(scope[field])) {
      throw Error('Missing formatter exclusions: ' + field);
    }
    const paths = new Set();
    for (const entry of scope[field]) {
      const file = field === 'directoryExclusions' ? entry.path?.replace(/\/$/, '') : entry.path;
      if (
        !safePath(file) ||
        paths.has(entry.path) ||
        !safePath(entry.owner) ||
        typeof entry.reason !== 'string' ||
        !entry.reason.trim() ||
        typeof entry.reviewCondition !== 'string' ||
        !entry.reviewCondition.trim()
      ) {
        throw Error('Invalid formatter exclusion disposition');
      }
      paths.add(entry.path);
    }
  }
  if (
    !equalEntries(
      scope.directoryExclusions.map((entry) => entry.path),
      requiredDirectories
    )
  ) {
    throw Error('Formatter directory exclusion scope changed');
  }
  for (const file of requiredExactExclusions) {
    if (!scope.exactExclusions.some((entry) => entry.path === file)) {
      throw Error('Missing exact formatter exclusion: ' + file);
    }
  }
  if (!equalEntries(scope.nonSourceDirectories, requiredNonSourceDirectories)) {
    throw Error('Invalid installed/cache formatter exclusions');
  }
  return scope;
}

function excludedPath(file, scope) {
  const declared =
    scope.exactExclusions.find((entry) => entry.path === file) ||
    scope.directoryExclusions.find((entry) => file.startsWith(entry.path));
  if (declared) {
    return declared;
  }
  if (file.split('/').some((part) => scope.nonSourceDirectories.includes(part))) {
    return {
      path: file,
      owner: 'tools/quality/README.md',
      reason: 'Installed dependency, transient cache or generated local report.',
      reviewCondition:
        'Reproduce from maintained inputs; never format installed or captured bytes.',
    };
  }
  return undefined;
}

function gitFiles(projectRoot) {
  return cp
    .execFileSync('git', ['ls-files', '-z'], {
      cwd: projectRoot,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
    .split('\0')
    .filter(Boolean);
}

function diskInventory(projectRoot, scope, catalog) {
  const files = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(path.join(projectRoot, directory), {
      withFileTypes: true,
    })) {
      const file = directory ? directory + '/' + entry.name : entry.name;
      if (excludedPath(file + (entry.isDirectory() ? '/' : ''), scope)) {
        continue;
      }
      if (entry.isSymbolicLink() && fs.statSync(path.join(projectRoot, file)).isDirectory()) {
        throw Error('Formatter source directory cannot be a symlink: ' + file);
      }
      if (entry.isDirectory()) {
        visit(file);
      } else if (classifyLanguage(file)) {
        files.push(file);
      }
    }
  }
  for (const directory of scope.roots) {
    const name = directory.slice(0, -1);
    if (fs.existsSync(path.join(projectRoot, name))) {
      if (!fs.lstatSync(path.join(projectRoot, name)).isDirectory()) {
        throw Error('Formatter source root must be a directory, not a symlink: ' + name);
      }
      visit(name);
    }
  }
  for (const entry of fs.readdirSync(projectRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() && classifyLanguage(entry.name)) {
      files.push(entry.name);
    }
  }
  for (const [file, record] of Object.entries(catalog)) {
    if (
      record?.kind === 'file' &&
      maintainedRoles.has(record.role) &&
      classifyLanguage(file) &&
      !scope.roots.some((prefix) => file.startsWith(prefix)) &&
      file.includes('/') &&
      !excludedPath(file, scope) &&
      fs.existsSync(path.join(projectRoot, file))
    ) {
      files.push(file);
    }
  }
  return [...new Set(files)];
}

function classifySource(
  file,
  { projectRoot, scope, catalog, tracked, exists, requireRegularFile }
) {
  if (!safePath(file)) {
    throw Error('Unsafe formatter source path: ' + file);
  }
  const record = catalog[file];
  const exclusion = excludedPath(file, scope);
  if (exclusion) {
    if (
      record?.kind === 'file' &&
      ['source', 'validator', 'test', 'workflow'].includes(record.role)
    ) {
      throw Error('Active source is misclassified into formatter exclusions: ' + file);
    }
    return tracked.has(file) ? { ...exclusion, path: file } : undefined;
  }
  const managed =
    scope.roots.some((prefix) => file.startsWith(prefix)) ||
    !file.includes('/') ||
    maintainedRoles.has(record?.role);
  if (!managed) {
    throw Error('Unclassified supported formatter source: ' + file);
  }
  if (!tracked.has(file)) {
    throw Error('Untracked or ignored formatter source: ' + file);
  }
  if (!exists(file)) {
    throw Error('Missing formatter source: ' + file);
  }
  if (
    record?.kind !== 'file' ||
    !maintainedRoles.has(record.role) ||
    !safePath(record.owner) ||
    !exists(record.owner)
  ) {
    throw Error('Misclassified formatter source or missing owner: ' + file);
  }
  if (requireRegularFile) {
    const absolute = path.join(projectRoot, file);
    const canonical = path.join(fs.realpathSync(projectRoot), file);
    if (!fs.lstatSync(absolute).isFile() || fs.realpathSync(absolute) !== canonical) {
      throw Error('Formatter source must be a regular file, not a symlink: ' + file);
    }
  }
  return file;
}

function sourceInventory(projectRoot = root, options = {}) {
  const scope = validateScope(
    options.scope || readJson(projectRoot, 'tools/quality/format-scope.json')
  );
  const catalog = options.catalog || readJson(projectRoot, '.github/repository-paths.json').entries;
  const tracked = options.tracked || gitFiles(projectRoot);
  const exists = options.exists || ((file) => fs.existsSync(path.join(projectRoot, file)));
  const diskFiles = options.diskFiles || diskInventory(projectRoot, scope, catalog);
  if (
    !catalog ||
    typeof catalog !== 'object' ||
    Array.isArray(catalog) ||
    !Array.isArray(tracked) ||
    new Set(tracked).size !== tracked.length ||
    !Array.isArray(diskFiles) ||
    new Set(diskFiles).size !== diskFiles.length
  ) {
    throw Error('Invalid formatter source inventory');
  }
  const trackedSet = new Set(tracked);
  const files = new Set();
  const excluded = [];
  const context = {
    projectRoot,
    scope,
    catalog,
    tracked: trackedSet,
    exists,
    requireRegularFile: !options.exists,
  };
  for (const file of new Set([...tracked, ...diskFiles, ...Object.keys(catalog)])) {
    if (!classifyLanguage(file)) {
      continue;
    }
    const classified = classifySource(file, context);
    if (typeof classified === 'string') {
      files.add(classified);
    } else if (classified) {
      excluded.push(classified);
    }
  }
  const effects =
    options.effects || require(path.join(projectRoot, 'tools/site/effects.cjs')).effectInputs;
  if (!Array.isArray(effects) || new Set(effects).size !== effects.length) {
    throw Error('Invalid canonical effect formatter inventory');
  }
  for (const file of effects) {
    if (!files.has(file)) {
      throw Error('Missing active effect formatter input: ' + file);
    }
  }
  const included = [...files].sort();
  const byLanguage = Object.fromEntries(
    Object.keys(languages).map((language) => [
      language,
      included.filter((file) => classifyLanguage(file) === language),
    ])
  );
  return {
    files: included,
    included,
    byLanguage,
    excluded: excluded.sort((a, b) => a.path.localeCompare(b.path)),
  };
}

function formatterSettings(projectRoot = root) {
  const prettier = readJson(projectRoot, 'tools/quality/prettier.config.json');
  const expected = {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    endOfLine: 'lf',
    htmlWhitespaceSensitivity: 'strict',
    embeddedLanguageFormatting: 'off',
    proseWrap: 'preserve',
    singleQuote: true,
    trailingComma: 'es5',
  };
  if (JSON.stringify(prettier) !== JSON.stringify(expected)) {
    throw Error('Unexpected explicit Prettier configuration');
  }
  const ruff = fs.readFileSync(path.join(projectRoot, 'tools/quality/ruff-format.toml'), 'utf8');
  const expectedRuff = [
    'line-length = 100',
    'indent-width = 4',
    'exclude = []',
    'extend-exclude = []',
    'respect-gitignore = false',
    '[format]',
    'quote-style = "preserve"',
    'indent-style = "space"',
    'line-ending = "lf"',
    'docstring-code-format = false',
  ];
  const settings = ruff
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean);
  if (!equalEntries(settings, expectedRuff)) {
    throw Error('Unexpected explicit Ruff formatting configuration');
  }
  return prettier;
}

function runTool(command, args, projectRoot, accepted = [0]) {
  const result = cp.spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error || !accepted.includes(result.status)) {
    throw Error(
      path.basename(command) + ' failed: ' + (result.stderr || result.error || result.stdout)
    );
  }
  return result;
}

function installedTools(projectRoot, scope) {
  const toolchain = path.resolve(
    process.env.SITE_AUDIT_TOOLS || path.join(projectRoot, 'tools/quality/toolchain')
  );
  const manifest = readJson(projectRoot, 'tools/quality/toolchain/package.json');
  const requirements = fs.readFileSync(
    path.join(projectRoot, 'tools/quality/toolchain/requirements.txt'),
    'utf8'
  );
  if (
    manifest.dependencies?.prettier !== scope.versions.prettier ||
    !requirements.split(/\r?\n/).includes('ruff==' + scope.versions.ruff)
  ) {
    throw Error('Formatter toolchain manifest does not use the exact declared pins');
  }
  const prettierPath = path.join(toolchain, 'node_modules/prettier');
  if (readJson(prettierPath, 'package.json').version !== scope.versions.prettier) {
    throw Error('Installed Prettier version drift');
  }
  const ruff = path.join(
    toolchain,
    'venv',
    process.platform === 'win32' ? 'Scripts' : 'bin',
    'ruff'
  );
  if (runTool(ruff, ['--version'], projectRoot).stdout.trim() !== 'ruff ' + scope.versions.ruff) {
    throw Error('Installed Ruff version drift');
  }
  return { prettier: require(prettierPath), ruff };
}

function exactCoverage(actual, expected, label) {
  if (
    !Array.isArray(actual) ||
    new Set(actual).size !== actual.length ||
    actual.length !== expected.length ||
    expected.some((file) => !actual.includes(file))
  ) {
    throw Error(label + ' has missing, duplicated or unexpected formatter coverage');
  }
}

async function formatPrettier(projectRoot, prettier, settings, files, write) {
  const ignorePath = path.join(projectRoot, '.prettierignore');
  const checked = [];
  const changed = [];
  const pending = [];
  for (const file of files) {
    const absolute = path.join(projectRoot, file);
    const info = await prettier.getFileInfo(absolute, {
      ignorePath: fs.existsSync(ignorePath) ? ignorePath : undefined,
      withNodeModules: false,
    });
    if (info.ignored || !info.inferredParser) {
      throw Error('Ignored or unsupported maintained Prettier source: ' + file);
    }
    const source = fs.readFileSync(absolute, 'utf8');
    const formatted = await prettier.format(source, { ...settings, filepath: absolute });
    checked.push(file);
    if (source !== formatted) {
      changed.push(file);
      pending.push({ absolute, formatted });
    }
  }
  exactCoverage(checked, files, 'Prettier');
  if (write) {
    for (const { absolute, formatted } of pending) {
      fs.writeFileSync(absolute, formatted);
    }
  }
  return changed;
}

function ruffFindings(projectRoot, result, files) {
  const findings = JSON.parse(result.stdout);
  const reported = [];
  for (const finding of findings) {
    const file = path
      .relative(projectRoot, path.resolve(projectRoot, finding.filename))
      .split(path.sep)
      .join('/');
    if (finding.code !== 'unformatted' || !files.includes(file) || reported.includes(file)) {
      throw Error('Unexpected or duplicated Ruff formatter finding: ' + file);
    }
    reported.push(file);
  }
  if (result.status !== (reported.length ? 1 : 0)) {
    throw Error('Ruff formatting failed without a covered formatting finding: ' + result.stderr);
  }
  return reported;
}

function formatPython(projectRoot, ruff, pythonFiles, write) {
  if (!pythonFiles.length) {
    return [];
  }
  const config = path.join(projectRoot, 'tools/quality/ruff-format.toml');
  const args = ['--config', config, '--no-cache', '--no-respect-gitignore', ...pythonFiles];
  const selected = runTool(ruff, ['check', '--show-files', ...args], projectRoot).stdout;
  const resolved = selected
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((file) =>
      path.relative(projectRoot, path.resolve(projectRoot, file)).split(path.sep).join('/')
    );
  exactCoverage(resolved, pythonFiles, 'Ruff');
  const before = new Map(
    pythonFiles.map((file) => [file, fs.readFileSync(path.join(projectRoot, file))])
  );
  const result = runTool(
    ruff,
    ['format', ...(write ? [] : ['--check', '--output-format', 'json']), ...args],
    projectRoot,
    [0, 1]
  );
  if (write) {
    const changed = [];
    for (const file of pythonFiles) {
      if (!before.get(file).equals(fs.readFileSync(path.join(projectRoot, file)))) {
        changed.push(file);
      }
    }
    if (result.status !== 0) {
      throw Error('Ruff formatting failed: ' + result.stderr);
    }
    return changed;
  }
  return ruffFindings(projectRoot, result, pythonFiles);
}

async function formatSources(projectRoot = root, { write = false } = {}) {
  const inventory = sourceInventory(projectRoot);
  const settings = formatterSettings(projectRoot);
  const scope = readJson(projectRoot, 'tools/quality/format-scope.json');
  const { prettier, ruff } = installedTools(projectRoot, scope);
  const prettierFiles = inventory.files.filter((file) => classifyLanguage(file) !== 'python');
  const changed = await formatPrettier(projectRoot, prettier, settings, prettierFiles, write);
  changed.push(...formatPython(projectRoot, ruff, inventory.byLanguage.python, write));
  return {
    pass: write || changed.length === 0,
    mode: write ? 'write' : 'check',
    files: inventory.files,
    counts: Object.fromEntries(
      Object.entries(inventory.byLanguage).map(([language, files]) => [language, files.length])
    ),
    changed: changed.sort(),
    versions: scope.versions,
  };
}

async function main(args) {
  if (args.length !== 1 || !['--check', '--write', '--inventory'].includes(args[0])) {
    throw Error('Usage: node tools/quality/format.cjs --check|--write|--inventory');
  }
  const report =
    args[0] === '--inventory'
      ? sourceInventory()
      : await formatSources(root, { write: args[0] === '--write' });
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  if (report.pass === false) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  });
}

module.exports = {
  classifyLanguage,
  validateScope,
  sourceInventory,
  inventory: sourceInventory,
  formatterSettings,
  installedTools,
  exactCoverage,
  formatSources,
};
