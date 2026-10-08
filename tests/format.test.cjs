'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const control = require('../tools/quality/format.cjs');
const root = path.resolve(__dirname, '..');
const scope = JSON.parse(
  fs.readFileSync(path.join(root, 'tools/quality/format-scope.json'), 'utf8')
);

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'maintained-format-'));
  const contents = {
    'OWNER.md': 'Fixture source ownership\n',
    'site/engine/main.cjs': "'use strict';\nconst value={answer:42};\nmodule.exports=value;\n",
    'site/engine/styles.css': '.reading{color:red}\n',
    'site/content/pages/index/body.html': '<p>Left <strong>middle</strong> right.</p>\n',
    'tools/tool.py': 'def answer( ):\n    return  42\n',
    'tests/sample.test.cjs': "'use strict';\nmodule.exports={answer:42};\n",
    '.github/workflows/check.yml': 'name: Test\non: [push]\njobs: {}\n',
    'site/routes.json': '{"routes":["index"]}\n',
    'tools/site/effects.cjs':
      "'use strict';\nmodule.exports = {effectInputs: ['site/engine/main.cjs']};\n",
    'tools/quality/toolchain/package.json':
      '{"private":true,"dependencies":{"prettier":"3.6.2"}}\n',
    'tools/quality/toolchain/requirements.txt': 'ruff==0.16.10\n',
  };
  for (const file of ['format-scope.json', 'prettier.config.json', 'ruff-format.toml']) {
    contents['tools/quality/' + file] = fs.readFileSync(
      path.join(root, 'tools/quality', file),
      'utf8'
    );
  }
  const catalog = {};
  for (const [file, bytes] of Object.entries(contents)) {
    fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    fs.writeFileSync(path.join(directory, file), bytes);
    catalog[file] = {
      kind: 'file',
      role: file.startsWith('tests/') ? 'test' : 'source',
      owner: 'OWNER.md',
    };
  }
  catalog['.github/repository-paths.json'] = {
    kind: 'file',
    role: 'configuration',
    owner: 'OWNER.md',
  };
  fs.writeFileSync(
    path.join(directory, '.github/repository-paths.json'),
    JSON.stringify({ entries: catalog }) + '\n'
  );
  cp.execFileSync('git', ['init', '-q'], { cwd: directory });
  cp.execFileSync('git', ['add', '.'], { cwd: directory });
  return {
    directory,
    catalog,
    add(file, bytes, tracked = false) {
      fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
      fs.writeFileSync(path.join(directory, file), bytes);
      if (tracked) {
        cp.execFileSync('git', ['add', '--', file], { cwd: directory });
      }
    },
    cleanup() {
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
}

test('Git and catalog classify every maintained language, including tools and fixture helpers', () => {
  const f = fixture();
  try {
    const inventory = control.sourceInventory(f.directory);
    assert.deepEqual(inventory.byLanguage.python, ['tools/tool.py']);
    assert.deepEqual(inventory.byLanguage.html, ['site/content/pages/index/body.html']);
    assert.ok(inventory.byLanguage.js.includes('tests/sample.test.cjs'));
    assert.ok(inventory.byLanguage.js.includes('tools/site/effects.cjs'));
    assert.ok(inventory.byLanguage.json.includes('.github/repository-paths.json'));
    assert.ok(inventory.byLanguage.yaml.includes('.github/workflows/check.yml'));
    assert.ok(inventory.byLanguage.css.includes('site/engine/styles.css'));
    assert.equal(inventory.files.length, new Set(inventory.files).size);
  } finally {
    f.cleanup();
  }
});

test('missing, untracked and Git-ignored maintained files block shrinking the formatter scope', () => {
  const f = fixture();
  try {
    fs.unlinkSync(path.join(f.directory, 'tools/tool.py'));
    assert.throws(() => control.sourceInventory(f.directory), /Missing formatter source/);
    f.add('tools/tool.py', 'value = 42\n');
    f.add('site/engine/new.cjs', 'module.exports = 1;\n');
    assert.throws(
      () => control.sourceInventory(f.directory),
      /Untracked or ignored formatter source/
    );
    fs.unlinkSync(path.join(f.directory, 'site/engine/new.cjs'));
    f.add('.gitignore', 'tools/ignored.py\n');
    f.add('tools/ignored.py', 'value = 1\n');
    assert.throws(
      () => control.sourceInventory(f.directory),
      /Untracked or ignored formatter source/
    );
  } finally {
    f.cleanup();
  }
});

test('catalog role, kind, owner and regular-file identity cannot conceal maintained sources', () => {
  const f = fixture();
  try {
    const file = 'site/engine/main.cjs';
    for (const record of [
      undefined,
      { kind: 'directory', role: 'source', owner: 'OWNER.md' },
      { kind: 'file', role: 'history', owner: 'OWNER.md' },
      { kind: 'file', role: 'source', owner: 'missing.md' },
    ]) {
      const catalog = { ...f.catalog, [file]: record };
      assert.throws(
        () => control.sourceInventory(f.directory, { catalog }),
        /Misclassified formatter source/
      );
    }
    fs.unlinkSync(path.join(f.directory, file));
    fs.symlinkSync(path.join(f.directory, 'tests/sample.test.cjs'), path.join(f.directory, file));
    assert.throws(() => control.sourceInventory(f.directory), /regular file, not a symlink/);
    fs.unlinkSync(path.join(f.directory, file));
    f.add(file, 'module.exports = 42;\n');
    fs.symlinkSync(path.join(f.directory, 'tests'), path.join(f.directory, 'tools/linked'));
    assert.throws(
      () => control.sourceInventory(f.directory),
      /source directory cannot be a symlink/
    );
  } finally {
    f.cleanup();
  }
});

test('generated, retained, evidence, locks and security ledgers retain bytes without hiding active code', () => {
  const f = fixture();
  try {
    const excluded = [
      'docs/index.html',
      'review/evidence.cjs',
      'drafts/proposal.html',
      'site/retained/accepted.js',
      '.github/repository-intelligence/agent-context.json',
      ...scope.exactExclusions.map((entry) => entry.path),
    ];
    for (const file of excluded) f.add(file, 'Opaque exact historical bytes\n', true);
    f.add('tools/quality/toolchain/node_modules/example.js', 'Installed dependency bytes\n');
    const inventory = control.sourceInventory(f.directory);
    assert.deepEqual(inventory.excluded.map((entry) => entry.path).sort(), excluded.sort());
    assert.ok(
      inventory.files.includes('tests/sample.test.cjs'),
      'fixture helper remains authored code'
    );
    const catalog = {
      ...f.catalog,
      'review/evidence.cjs': { kind: 'file', role: 'source', owner: 'OWNER.md' },
    };
    assert.throws(
      () => control.sourceInventory(f.directory, { catalog }),
      /Active source is misclassified/
    );
    const missingEffects = ['site/effects/missing.cjs'];
    assert.throws(
      () => control.sourceInventory(f.directory, { effects: missingEffects }),
      /Missing active effect/
    );
  } finally {
    f.cleanup();
  }
});

test('scope configuration rejects disappearing languages, broad exclusions and unowned exemptions', () => {
  for (const mutate of [
    (value) => value.roots.pop(),
    (value) => delete value.languages.python,
    (value) => value.languages.js.pop(),
    (value) => value.directoryExclusions.push({ ...value.directoryExclusions[0], path: 'tests/' }),
    (value) => value.exactExclusions.pop(),
    (value) =>
      value.exactExclusions.push({ path: 'tools/new.py', owner: 'OWNER.md', reason: 'Temporary' }),
    (value) => (value.versions.prettier = '^3.6.2'),
    (value) => value.nonSourceDirectories.push('tests'),
  ]) {
    const changed = structuredClone(scope);
    mutate(changed);
    assert.throws(() => control.validateScope(changed));
  }
  const reviewed = structuredClone(scope);
  reviewed.exactExclusions.push({
    path: 'tests/exact-byte-fixture.json',
    owner: 'OWNER.md',
    reason: 'Explicit exact byte fixture.',
    reviewCondition: 'Revisit when its format identity changes.',
  });
  control.validateScope(reviewed);
});

test('explicit options retain HTML and opaque-language boundaries and reject configuration drift', () => {
  const f = fixture();
  try {
    const settings = control.formatterSettings(f.directory);
    assert.equal(settings.htmlWhitespaceSensitivity, 'strict');
    assert.equal(settings.embeddedLanguageFormatting, 'off');
    assert.equal(settings.proseWrap, 'preserve');
    for (const mutate of [
      (value) => (value.htmlWhitespaceSensitivity = 'css'),
      (value) => (value.embeddedLanguageFormatting = 'auto'),
      (value) => (value.printWidth = 80),
      (value) =>
        (value.overrides = [{ files: '*.html', options: { htmlWhitespaceSensitivity: 'ignore' } }]),
    ]) {
      const changed = structuredClone(settings);
      mutate(changed);
      f.add('tools/quality/prettier.config.json', JSON.stringify(changed));
      assert.throws(() => control.formatterSettings(f.directory), /Prettier configuration/);
    }
    f.add('tools/quality/prettier.config.json', JSON.stringify(settings));
    fs.appendFileSync(
      path.join(f.directory, 'tools/quality/ruff-format.toml'),
      'skip-magic-trailing-comma = true\n'
    );
    assert.throws(() => control.formatterSettings(f.directory), /Ruff formatting configuration/);
  } finally {
    f.cleanup();
  }
});

test('coverage rejects missing, duplicate and unexpected actual tool inputs', () => {
  const expected = ['site/engine/main.cjs', 'tools/tool.py'];
  control.exactCoverage([...expected].reverse(), expected, 'Fixture tool');
  for (const actual of [
    [],
    [expected[0]],
    [...expected, expected[0]],
    [expected[0], 'unexpected.py'],
  ]) {
    assert.throws(
      () => control.exactCoverage(actual, expected, 'Fixture tool'),
      /formatter coverage/
    );
  }
});

test('exact installation and manifest pins reject version drift before tool execution', () => {
  const f = fixture();
  const previous = process.env.SITE_AUDIT_TOOLS;
  try {
    process.env.SITE_AUDIT_TOOLS = path.join(f.directory, 'installed');
    f.add('installed/node_modules/prettier/package.json', '{"version":"3.5.0"}\n');
    assert.throws(
      () => control.installedTools(f.directory, scope),
      /Installed Prettier version drift/
    );
    f.add('tools/quality/toolchain/package.json', '{"dependencies":{"prettier":"^3.6.2"}}\n');
    assert.throws(() => control.installedTools(f.directory, scope), /exact declared pins/);
  } finally {
    if (previous === undefined) {
      delete process.env.SITE_AUDIT_TOOLS;
    } else {
      process.env.SITE_AUDIT_TOOLS = previous;
    }
    f.cleanup();
  }
});

test('real pinned formatter detects drift, preserves inline and embedded bytes, then becomes idempotent', async () => {
  const f = fixture();
  const previous = process.env.SITE_AUDIT_TOOLS;
  try {
    process.env.SITE_AUDIT_TOOLS = path.resolve(
      previous || path.join(root, 'tools/quality/toolchain')
    );
    const embedded = 'const opaque={a:1,b:2};';
    const html =
      '<p>Before<strong>middle</strong>after <em>word</em>.</p>\n' +
      '<script>' +
      embedded +
      '</script>\n';
    f.add('site/content/pages/index/body.html', html);
    const before = await control.formatSources(f.directory);
    assert.equal(before.pass, false);
    assert.ok(before.changed.includes('tools/tool.py'));
    assert.ok(before.changed.includes('site/engine/main.cjs'));
    const firstWrite = await control.formatSources(f.directory, { write: true });
    assert.ok(firstWrite.changed.length > 0);
    const formatted = fs.readFileSync(
      path.join(f.directory, 'site/content/pages/index/body.html'),
      'utf8'
    );
    assert.ok(
      formatted.includes('Before<strong>middle</strong>after <em>word</em>.'),
      'inline word boundaries and adjacent inline spacing remain exact'
    );
    assert.ok(formatted.includes(embedded), 'opaque embedded code remains exact');
    const secondWrite = await control.formatSources(f.directory, { write: true });
    assert.deepEqual(secondWrite.changed, []);
    assert.equal((await control.formatSources(f.directory)).pass, true);
    f.add('.prettierignore', 'site/engine/main.cjs\n');
    await assert.rejects(
      control.formatSources(f.directory),
      /Ignored or unsupported maintained Prettier source/
    );
  } finally {
    if (previous === undefined) {
      delete process.env.SITE_AUDIT_TOOLS;
    } else {
      process.env.SITE_AUDIT_TOOLS = previous;
    }
    f.cleanup();
  }
});
