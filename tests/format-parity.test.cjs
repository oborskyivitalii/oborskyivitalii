'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const { compareSources, reviewedControls, verify } = require('../tools/quality/format-parity.cjs');

const equal = (file, before, after) => assert.equal(compareSources(file, before, after).pass, true);
const different = (file, before, after) =>
  assert.equal(compareSources(file, before, after).pass, false);

test('JS formatting preserves decoded literals, AST order and operators', () => {
  equal(
    'fixture.cjs',
    "const message='line\\ntext';if(ok&&ready){run(message)}",
    'const message = "line\\ntext";\nif (ok && ready) {\n  run(message);\n}\n'
  );
  equal('fixture.cjs', 'const value = { "property": 1 };', 'const value = { property: 1 };');
  for (const [before, after] of [
    ["const value = 'safe';", "const value = 'changed';"],
    ['if (ok && ready) run();', 'if (ok || ready) run();'],
    ['const rules = { first: 1, second: 2 };', 'const rules = { second: 2, first: 1 };'],
    ['const pattern = /safe/i;', 'const pattern = /safe/g;'],
    ['const value = 9007199254740993n;', 'const value = 9007199254740992n;'],
    ['const text = `one  two`;', 'const text = `one two`;'],
    ['const text = String.raw`\\u0061`;', 'const text = String.raw`a`;'],
    ['const value = { ["property"]: 1 };', 'const value = { [property]: 1 };'],
  ])
    different('fixture.cjs', before, after);
});

test('Python formatting preserves AST and opaque string contents', () => {
  equal(
    'fixture.py',
    "value={'a':1,'b':2}\nif value:\n    print(value)\n",
    'value = {"a": 1, "b": 2}\nif value:\n    print(value)\n'
  );
  different('fixture.py', 'result = left and right\n', 'result = left or right\n');
  different('fixture.py', "fixture = 'one  two'\n", "fixture = 'one two'\n");
});

test('ordered JSON values reject sorting, duplicates and rounded large-number changes', () => {
  equal(
    'fixture.json',
    '{"first":1,"second":[true,"x"]}',
    '{\n  "first": 1,\n  "second": [true, "x"]\n}\n'
  );
  different('fixture.json', '{"first":1,"second":2}', '{"second":2,"first":1}');
  different('fixture.json', '{"2":"two","1":"one"}', '{"1":"one","2":"two"}');
  different('fixture.json', '{"value":9007199254740993}', '{"value":9007199254740992}');
  different(
    'fixture.json',
    '{"value":1234567890123456789012345678901234567891}',
    '{"value":1234567890123456789012345678901234567892}'
  );
  different('fixture.json', '{"values":[1,2]}', '{"values":[2,1]}');
  assert.throws(() => compareSources('fixture.json', '{"x":1,"x":2}', '{"x":2}'), /Duplicate JSON/);
});

test('ordered YAML values preserve expressions, scalar types and folded content', () => {
  equal(
    'fixture.yml',
    "on: [push]\njobs:\n  build:\n    if: '${{ success() }}'\n",
    'on: [push]\njobs:\n  build:\n    if: "${{ success() }}"\n'
  );
  different('fixture.yml', 'first: 1\nsecond: 2\n', 'second: 2\nfirst: 1\n');
  different('fixture.yml', "value: 'true'\n", 'value: true\n');
  different('fixture.yml', 'run: >\n  echo one\n  echo two\n', 'run: |\n  echo one\n  echo two\n');
  different('fixture.yml', 'if: ${{ success() }}\n', 'if: ${{ always() }}\n');
  assert.throws(() => compareSources('fixture.yml', 'x: 1\nx: 2\n', 'x: 2\n'), /Duplicate YAML/);
});

test('CSS formatting preserves ordered rules, declarations, selectors and literal values', () => {
  equal('fixture.css', '.a { margin: .16em; }', '.a { margin: 0.16em; }');
  equal(
    'fixture.css',
    '.a { width: calc(var(--width)/2); }',
    '.a { width: calc(var(--width) / 2); }'
  );
  equal(
    'fixture.css',
    '.a>.b{color:rgb(1,2,3);margin:0 2px}',
    '.a > .b {\n  color: rgb(1, 2, 3);\n  margin: 0 2px;\n}\n'
  );
  for (const [before, after] of [
    ['.a { color: red; color: blue; }', '.a { color: blue; color: red; }'],
    ['.a { color: red; } .a { color: blue; }', '.a { color: blue; } .a { color: red; }'],
    ['.a .b { color: red; }', '.a > .b { color: red; }'],
    [".a { content: 'one  two'; }", ".a { content: 'one two'; }"],
    ['.a { color: red !important; }', '.a { color: red; }'],
    ['.a { margin: .16em; }', '.a { margin: 0.16px; }'],
    ['.a { width: calc(var(--width)/2); }', '.a { width: calc(var(--width) * 2); }'],
    ['.a { width: calc(1px+2px); }', '.a { width: calc(1px + 2px); }'],
  ])
    different('fixture.css', before, after);
});

test('HTML preserves wording, attributes, nonbreaking spaces and inline separator presence', () => {
  equal(
    'fixture.html',
    '  <p class="intro">Hello <a href="/talks">world</a>!</p>\n',
    '<p\n  class="intro"\n>Hello\n  <a href="/talks">world</a>!</p>\n'
  );
  equal('fixture.html', '<p>A &amp; B</p>', '<p>A &#38; B</p>');
  equal('fixture.html', '<math><mi/></math>', '<math><mi></mi></math>');
  equal('fixture.html', '<p>A<br/>B</p>', '<p>A<br>B</p>');
  equal(
    'fixture.html',
    '<svg><polygon points="0,0 1,1"/></svg>',
    '<svg>\n  <polygon points="0,0 1,1"/>\n</svg>'
  );
  equal(
    'fixture.html',
    "<script>const text = 'one  two';</script>",
    "<!-- prettier-ignore -->\n<script>const text = 'one  two';</script>"
  );
  for (const [before, after] of [
    ['<p>Hello <em>world</em></p>', '<p>Hello<em>world</em></p>'],
    ['<p><span>one</span><span>two</span></p>', '<p><span>one</span> <span>two</span></p>'],
    ['<p>A&nbsp;B</p>', '<p>A B</p>'],
    ['<a href="/talks">Talk</a>', '<a href="/writing">Talk</a>'],
    ['<p>One<br>two</p>', '<p>One two</p>'],
    ['<pre>one  two\n</pre>', '<pre>one two\n</pre>'],
    ['<textarea>one  two</textarea>', '<textarea>one two</textarea>'],
    ["<script>const text = 'one  two';</script>", "<script>const text = 'one two';</script>"],
    ['<p>before <a>linked</a></p>', '<p><a>before</a> linked</p>'],
    [
      '<svg><text>one<tspan>two</tspan></text></svg>',
      '<svg><text>one <tspan>two</tspan></text></svg>',
    ],
  ])
    different('fixture.html', before, after);
  assert.throws(
    () => compareSources('fixture.html', '<p id="a" id="b">x</p>', '<p id="b">x</p>'),
    /Duplicate HTML/
  );
  assert.throws(() => compareSources('fixture.html', '<div/>x', '<div></div>x'), /Non-void HTML/);
  assert.throws(
    () =>
      compareSources(
        'fixture.html',
        '<svg><foreignObject><div/></foreignObject></svg>',
        '<svg><foreignObject><div></div></foreignObject></svg>'
      ),
    /Non-void HTML/
  );
});

test('mechanical-parity exceptions require exact documented control owners', () => {
  const record = {
    path: '.github/workflows/site-checks.yml',
    reason: 'Add R2 checks',
    owner: 'issue58',
  };
  assert.deepEqual(reviewedControls([record], [record.path]), [record]);
  assert.throws(
    () => reviewedControls([record, record], [record.path]),
    /duplicate parity control/
  );
  assert.throws(
    () => reviewedControls([{ ...record, path: '.github/**' }], ['.github/**']),
    /wildcard/
  );
  assert.throws(
    () => reviewedControls([{ ...record, reason: '' }], [record.path]),
    /reason and owner/
  );
  assert.throws(() => reviewedControls([record], []), /Unknown/);
  const siteControl = { ...record, path: 'site/engine/space.js' };
  assert.throws(() => reviewedControls([siteControl], [siteControl.path]), /site source cannot/);
});

test('baseline coverage rejects source removal and binds dirty observations to compared bytes', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'format-parity-'));
  const command = (args) =>
    cp.execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim();
  const inventory = (_root, options = {}) => ({
    files: (options.tracked || fs.readdirSync(directory))
      .filter((file) => file.endsWith('.cjs'))
      .sort(),
  });
  try {
    command(['init', '--quiet']);
    command(['config', 'user.name', 'Parity Fixture']);
    command(['config', 'user.email', 'parity-fixture@example.invalid']);
    fs.mkdirSync(path.join(directory, '.github'));
    fs.writeFileSync(path.join(directory, '.github/repository-paths.json'), '{"entries":{}}\n');
    fs.writeFileSync(path.join(directory, 'source.cjs'), 'const value=1;\n');
    command(['add', '.']);
    command(['commit', '--quiet', '-m', 'Baseline']);
    const baseline = command(['rev-parse', 'HEAD']);
    const initial = verify({ root: directory, baseline, inventory });
    assert.equal(initial.pass, true);
    assert.equal(initial.sourceDirty, false);
    assert.equal(initial.comparedFiles, 1);
    assert.equal(initial.observationStable, true);
    fs.writeFileSync(path.join(directory, 'source.cjs'), 'const value = 1;\n');
    fs.writeFileSync(path.join(directory, 'new-control.cjs'), 'module.exports = {};\n');
    const formatted = verify({ root: directory, baseline, inventory });
    assert.equal(formatted.pass, true);
    assert.equal(formatted.sourceDirty, true);
    assert.equal(formatted.sourceCommit, baseline);
    assert.notEqual(formatted.observedSourcesSha256, initial.observedSourcesSha256);
    assert.equal(formatted.changedComparedFiles, 1);
    assert.deepEqual(formatted.addedControls, ['new-control.cjs']);
    let observations = 0;
    const changingInventory = (projectRoot, options = {}) => {
      const result = inventory(projectRoot, options);
      if (!options.tracked && ++observations === 2) {
        fs.writeFileSync(path.join(directory, 'source.cjs'), 'const value = 3;\n');
      }
      return result;
    };
    const changedDuringRead = verify({ root: directory, baseline, inventory: changingInventory });
    assert.equal(changedDuringRead.pass, false);
    assert.equal(changedDuringRead.observationStable, false);
    assert.match(changedDuringRead.failures[0].error, /bytes changed during parity observation/);
    fs.writeFileSync(path.join(directory, 'source.cjs'), 'const value = 2;\n');
    const changed = verify({ root: directory, baseline, inventory });
    assert.equal(changed.pass, false);
    assert.match(changed.failures[0].error, /Semantic source contract/);
    fs.unlinkSync(path.join(directory, 'source.cjs'));
    const removed = verify({ root: directory, baseline, inventory });
    assert.equal(removed.pass, false);
    assert.match(removed.failures[0].error, /removed or excluded/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
