'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '../..');
const tools = path.resolve(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain'));
const toolRequire = createRequire(path.join(tools, 'package.json'));
const helper = path.join(__dirname, 'format-parity.py');
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const LANGUAGES = {
  '.js': 'js',
  '.cjs': 'js',
  '.mjs': 'js',
  '.css': 'css',
  '.html': 'html',
  '.py': 'python',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
};

function normalizeAst(value) {
  if (typeof value === 'bigint') return { bigint: String(value) };
  if (typeof value === 'number' && Object.is(value, -0)) return { number: '-0' };
  if (value instanceof RegExp) return { pattern: value.source, flags: value.flags };
  if (Array.isArray(value)) return value.map(normalizeAst);
  if (!value || typeof value !== 'object') return value;
  const staticProperty =
    ['Property', 'MethodDefinition', 'PropertyDefinition'].includes(value.type) &&
    value.computed === false;
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          !['start', 'end', 'range', 'loc'].includes(key) &&
          !(key === 'raw' && value.type === 'Literal')
      )
      .map(([key, item]) => {
        // Prettier can unquote an ordinary property name. Computed keys,
        // expression identifiers and all literal values remain strict.
        if (
          key === 'key' &&
          staticProperty &&
          (item.type === 'Identifier' ||
            (item.type === 'Literal' && typeof item.value === 'string'))
        ) {
          return [key, { type: 'StaticPropertyName', value: item.name ?? item.value }];
        }
        return [key, normalizeAst(item)];
      })
  );
}

function javascriptContract(source) {
  const espree = toolRequire('espree');
  const options = {
    ecmaVersion: 'latest',
    sourceType: 'script',
    ecmaFeatures: { globalReturn: true },
  };
  let ast;
  try {
    ast = espree.parse(source, options);
  } catch (scriptError) {
    try {
      ast = espree.parse(source, { ...options, sourceType: 'module' });
    } catch {
      throw scriptError;
    }
  }
  return normalizeAst(ast);
}

function cssNumber(value) {
  const number = value.match(/^([+-]?)(\d*\.\d+|\d+\.?\d*)(?:[eE]([+-]?\d+))?([a-zA-Z%]*)$/);
  if (!number) return value;
  const [, sign, mantissa, power = '0', unit] = number;
  const fraction = mantissa.split('.')[1] || '';
  let digits = mantissa.replace('.', '').replace(/^0+/, '') || '0';
  let exponent = BigInt(power) - BigInt(fraction.length);
  while (digits.length > 1 && digits.endsWith('0')) {
    digits = digits.slice(0, -1);
    exponent += 1n;
  }
  return { sign, digits, exponent: digits === '0' ? '0' : String(exponent), unit };
}

function cssValue(source) {
  const parse = toolRequire('postcss-value-parser');
  function nodes(values, math = false) {
    const optionalMathSpace = (node, index) =>
      math &&
      node.type === 'space' &&
      [values[index - 1], values[index + 1]].some(
        (adjacent) => adjacent?.type === 'word' && ['/', '*'].includes(adjacent.value)
      );
    return values
      .filter((node, index) => !optionalMathSpace(node, index))
      .map((node) => {
        const value =
          node.type === 'space' ? ' ' : node.type === 'word' ? cssNumber(node.value) : node.value;
        const record = { type: node.type, value };
        if (node.nodes)
          record.nodes = nodes(node.nodes, ['calc', 'min', 'max', 'clamp'].includes(node.value));
        if (node.unclosed) throw Error('Unclosed CSS value');
        return record;
      });
  }
  return nodes(parse(source).nodes);
}

function cssSelector(source) {
  const parse = toolRequire('postcss-selector-parser');
  function node(value) {
    const record = { type: value.type };
    for (const key of ['value', 'attribute', 'operator', 'insensitive', 'namespace']) {
      if (value[key] !== undefined) record[key] = value[key];
    }
    if (record.type === 'combinator' && /^\s+$/.test(record.value)) record.value = ' ';
    if (value.nodes) record.nodes = value.nodes.map(node);
    return record;
  }
  return node(parse().astSync(source));
}

function cssContract(source) {
  const postcss = toolRequire('postcss');
  function node(value) {
    const record = { type: value.type };
    if (value.type === 'rule') record.selector = cssSelector(value.selector);
    if (value.type === 'atrule') {
      record.name = value.name;
      record.params = cssValue(value.params);
    }
    if (value.type === 'decl') {
      record.prop = value.prop;
      record.value = cssValue(value.value);
      record.important = Boolean(value.important);
    }
    if (value.type === 'comment') record.text = value.text.replace(/\s+/g, ' ').trim();
    if (value.nodes) record.nodes = value.nodes.map(node);
    return record;
  }
  return node(postcss.parse(source));
}

function helperContracts(requests) {
  const python = path.join(
    tools,
    process.platform === 'win32' ? 'venv/Scripts/python.exe' : 'venv/bin/python'
  );
  const result = cp.spawnSync(python, [helper], {
    input: JSON.stringify(requests),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw Error('Format-parity helper failed: ' + (result.error?.message || result.stderr.trim()));
  }
  const rows = JSON.parse(result.stdout);
  if (rows.length !== requests.length) throw Error('Incomplete format-parity helper coverage');
  return rows.map((row) => {
    if (row.error) throw Error(row.error);
    if (!Object.hasOwn(row, 'contract')) throw Error('Missing format-parity helper contract');
    return row.contract;
  });
}

function compareSources(file, before, after) {
  const language = LANGUAGES[path.extname(file)];
  if (!language) throw Error('Unsupported parity source: ' + file);
  let contracts;
  if (language === 'js') contracts = [javascriptContract(before), javascriptContract(after)];
  else if (language === 'css') contracts = [cssContract(before), cssContract(after)];
  else contracts = helperContracts([before, after].map((source) => ({ language, source })));
  const fingerprints = contracts.map((value) => digest(JSON.stringify(value)));
  return {
    path: file,
    language,
    pass: fingerprints[0] === fingerprints[1],
    sourceChanged: before !== after,
    baselineSourceSha256: digest(before),
    currentSourceSha256: digest(after),
    baselineContractSha256: fingerprints[0],
    currentContractSha256: fingerprints[1],
  };
}

function git(projectRoot, args) {
  return cp
    .execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
    .trim();
}

function gitSource(projectRoot, commit, file) {
  return cp.execFileSync('git', ['show', commit + ':' + file], {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

function reviewedControls(records, files) {
  if (!Array.isArray(records)) throw Error('Parity controls must be an exact path array');
  const seen = new Set();
  for (const record of records) {
    if (!record || typeof record.path !== 'string' || !record.reason || !record.owner) {
      throw Error('Parity control needs exact path, reason and owner');
    }
    if (record.path.startsWith('site/')) {
      throw Error('Authored site source cannot be excluded from mechanical parity: ' + record.path);
    }
    if (/[?*]/.test(record.path) || seen.has(record.path) || !files.includes(record.path)) {
      throw Error('Unknown, wildcard or duplicate parity control: ' + record.path);
    }
    seen.add(record.path);
  }
  return records;
}

function verify(options) {
  const projectRoot = path.resolve(options.root || root);
  const baselineCommit = git(projectRoot, [
    'rev-parse',
    '--verify',
    options.baseline + '^{commit}',
  ]);
  const baselinePaths = git(projectRoot, ['ls-tree', '-r', '--name-only', baselineCommit]).split(
    '\n'
  );
  const baselineCatalog = JSON.parse(
    gitSource(projectRoot, baselineCommit, '.github/repository-paths.json')
  ).entries;
  const inventory = options.inventory || require('./format.cjs').sourceInventory;
  const current = inventory(projectRoot);
  const previous = inventory(projectRoot, {
    tracked: baselinePaths,
    diskFiles: baselinePaths,
    catalog: baselineCatalog,
    exists: () => true,
    effects: [],
  });
  const controls = reviewedControls(options.controls || [], current.files);
  const controlled = new Set(controls.map((record) => record.path));
  const failures = [];
  const rows = [];
  const addedControls = current.files.filter((file) => !previous.files.includes(file));
  for (const file of addedControls.filter((file) => file.startsWith('site/'))) {
    failures.push({ path: file, error: 'New authored site source is outside mechanical R2 scope' });
  }
  const sourceCommit = git(projectRoot, ['rev-parse', 'HEAD']);
  const sourceTree = git(projectRoot, ['rev-parse', 'HEAD^{tree}']);
  const sourceDirty = git(projectRoot, ['status', '--porcelain', '--untracked-files=all']) !== '';
  const observedBytes = new Map(
    current.files.map((file) => [file, fs.readFileSync(path.join(projectRoot, file))])
  );
  const observedSources = [...observedBytes].map(([file, bytes]) => [file, digest(bytes)]);
  for (const file of previous.files) {
    if (!current.files.includes(file)) {
      failures.push({ path: file, error: 'Baseline maintained source removed or excluded' });
      continue;
    }
    if (controlled.has(file)) continue;
    try {
      const row = compareSources(
        file,
        gitSource(projectRoot, baselineCommit, file),
        observedBytes.get(file).toString('utf8')
      );
      rows.push(row);
      if (!row.pass) failures.push({ path: file, error: 'Semantic source contract changed' });
    } catch (error) {
      failures.push({ path: file, error: error.message });
    }
  }
  let observationStable = true;
  if (JSON.stringify(inventory(projectRoot).files) !== JSON.stringify(current.files)) {
    observationStable = false;
    failures.push({ error: 'Maintained source inventory changed during parity observation' });
  }
  for (const [file, bytes] of observedBytes) {
    if (
      !fs.existsSync(path.join(projectRoot, file)) ||
      digest(fs.readFileSync(path.join(projectRoot, file))) !== digest(bytes)
    ) {
      observationStable = false;
      failures.push({ path: file, error: 'Source bytes changed during parity observation' });
    }
  }
  if (git(projectRoot, ['rev-parse', 'HEAD']) !== sourceCommit) {
    observationStable = false;
    failures.push({ error: 'Git source ref changed during parity observation' });
  }
  return {
    schema: 1,
    kind: 'mechanical-format-parity',
    pass: failures.length === 0,
    baselineCommit,
    baselineTree: git(projectRoot, ['rev-parse', baselineCommit + '^{tree}']),
    sourceCommit,
    sourceTree,
    sourceDirty,
    observationStable,
    observedSourcesSha256: digest(JSON.stringify(observedSources)),
    scope:
      'Maintained baseline source AST/ordered data/CSS/HTML contracts; new and reviewed controls are listed separately. Runtime serialization and generated renditions require their registered execution suites.',
    maintainedFiles: current.files.length,
    comparedFiles: rows.length,
    changedComparedFiles: rows.filter((row) => row.sourceChanged).length,
    reviewedControls: controls,
    addedControls,
    failures,
    rows,
  };
}

function argumentsFor(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!['--baseline', '--controls', '--report'].includes(name) || !value) {
      throw Error('Usage: format-parity.cjs --baseline COMMIT [--controls JSON] [--report JSON]');
    }
    options[name.slice(2)] = value;
  }
  if (!options.baseline) throw Error('An immutable formatting baseline commit is required');
  if (options.controls) options.controls = JSON.parse(fs.readFileSync(options.controls, 'utf8'));
  return options;
}

if (require.main === module) {
  try {
    const options = argumentsFor(process.argv.slice(2));
    const report = verify(options);
    if (options.report) {
      fs.mkdirSync(path.dirname(path.resolve(options.report)), { recursive: true });
      fs.writeFileSync(options.report, JSON.stringify(report, null, 2) + '\n');
    }
    console.log(JSON.stringify({ ...report, rows: undefined }));
    if (!report.pass) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  compareSources,
  javascriptContract,
  cssContract,
  helperContracts,
  reviewedControls,
  verify,
};
