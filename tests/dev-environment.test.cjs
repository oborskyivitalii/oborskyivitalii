'use strict';
// Issue219: the vendor-neutral development container and command entry.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const { pinnedVersions, plans, serveOptions, reviewArgs } = require('../tools/dev/cli.cjs');
const runners = require('../tools/dev/runners.cjs');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function literalPins(text, key) {
  const pattern = new RegExp('^\\s*' + key + ':\\s*[\'"]?(\\d+\\.\\d+\\.\\d+)[\'"]?\\s*$', 'gm');
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

test('Containerfile Node pin equals every literal workflow Node pin', () => {
  const pins = pinnedVersions();
  const directory = path.join(root, '.github/workflows');
  const observed = fs
    .readdirSync(directory)
    .filter((name) => /\.ya?ml$/.test(name))
    .flatMap((name) => literalPins(read('.github/workflows/' + name), 'node-version'));
  assert.ok(observed.length > 10);
  assert.deepEqual([...new Set(observed)], [pins.node]);
});

test('Containerfile Python pin equals the Basic lane Python pin', () => {
  const pins = pinnedVersions();
  const observed = literalPins(read('.github/workflows/site-checks.yml'), 'python-version');
  assert.ok(observed.length > 0);
  assert.deepEqual([...new Set(observed)], [pins.python]);
});

test('literal pin parsing accepts quoted values and ignores expressions', () => {
  const text =
    'node-version: \'24.19.0\'\n  node-version: "24.19.0"\nnode-version: ${{ matrix.n }}\n';
  assert.deepEqual(literalPins(text, 'node-version'), ['24.19.0', '24.19.0']);
});

test('Containerfile verifies the Node archive and uses a digest-bound base', () => {
  const text = read('.devcontainer/Containerfile');
  assert.match(text, /sha256sum --check --strict/);
  assert.match(text, /^ARG NODE_SHA256_X64=[0-9a-f]{64}$/m);
  assert.match(text, /^ARG NODE_SHA256_ARM64=[0-9a-f]{64}$/m);
  assert.doesNotMatch(text, /apt-get|curl[^\n]*\|\s*(ba)?sh/);
});

test('version parsing rejects an unpinned base or Node version', () => {
  assert.throws(() => pinnedVersions('FROM python:3.12\nARG NODE_VERSION=24\n'));
  assert.throws(() =>
    pinnedVersions('FROM docker.io/library/python:3.12.14-bookworm\nARG NODE_VERSION=24.19.0\n')
  );
});

test('devcontainer uses only open-spec fields and the shared command entry', () => {
  const config = JSON.parse(read('.devcontainer/devcontainer.json'));
  assert.equal(config.build.dockerfile, 'Containerfile');
  assert.equal(
    config.postCreateCommand,
    'node tools/dev/cli.cjs setup && node tools/dev/cli.cjs agents'
  );
  assert.equal(config.containerEnv.OPENCODE_DISABLE_CLAUDE_CODE, '1');
  assert.equal(config.features, undefined);
  assert.equal(config.customizations, undefined);
  assert.equal(config.image, undefined);
});

test('setup delegates to the existing locked installers only', () => {
  const steps = plans.setup().map((step) => step.join(' '));
  assert.deepEqual(steps, [
    'npm ci --prefix tools/quality/toolchain --ignore-scripts',
    'npm ci --prefix tools/publishing/toolchain --ignore-scripts',
    'npm ci --prefix tools/dev/agents --ignore-scripts',
    'python3 -m venv tools/quality/toolchain/venv',
    'tools/quality/toolchain/venv/bin/python -m pip install --disable-pip-version-check' +
      ' --no-deps -r tools/quality/toolchain/requirements.txt',
    'tools/quality/toolchain/venv/bin/python tools/quality/python_toolchain.py',
  ]);
});

test('build and check reuse the existing producer and source checks', () => {
  assert.deepEqual(plans.build(), [['node', 'tools/site/build.cjs']]);
  const check = plans.check().map((step) => step.slice(1).join(' '));
  assert.deepEqual(check, [
    'tools/quality/format.cjs --check',
    'tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify',
    'tools/check_repository_layout.py verify',
    'tools/quality/local.cjs',
  ]);
});

test('serve defaults to loopback and rejects unknown or malformed arguments', () => {
  assert.deepEqual(serveOptions([]), { port: 4173, host: '127.0.0.1' });
  assert.deepEqual(serveOptions(['--port', '8080', '--host', '0.0.0.0']), {
    port: 8080,
    host: '0.0.0.0',
  });
  const invalid = [['--port=8080'], ['foo'], ['--port'], ['--port', 'x'], ['--port', '0']];
  for (const args of invalid) {
    assert.throws(() => serveOptions(args), args.join(' '));
  }
});

test('runner agents are generated from every repository reviewer prompt', () => {
  const readme = read('agents/reviewers/README.md');
  const roles = runners.reviewerRoles(readme);
  assert.deepEqual(
    roles.map((role) => role.file),
    [
      'requirements-acceptance.md',
      'code-review.md',
      'white-box-qa.md',
      'exploratory-interaction-qa.md',
    ]
  );
  for (const agent of runners.opencodeAgents()) {
    const prompt = read('agents/reviewers/' + agent.name + '.md');
    assert.ok(agent.body.startsWith('---\ndescription: Independent '));
    assert.match(agent.body, /mode: subagent\n/);
    assert.match(agent.body, /\npermission:\n {2}edit: deny\n {2}task: deny\n/);
    assert.match(agent.body, /\n {2}bash:\n {4}"\*": deny\n/);
    assert.doesNotMatch(agent.body, /"git (push|commit|add)/);
    const rules = agent.body.slice(agent.body.indexOf('  bash:'), agent.body.indexOf('\n---'));
    const lastWildcardAllow = rules.lastIndexOf(' *": allow');
    for (const flag of ['--output', '--ext-diff', '--textconv', 'difftool']) {
      assert.ok(rules.indexOf(`"*${flag}*": deny`) > lastWildcardAllow, flag + ' denied later');
    }
    assert.doesNotMatch(rules, /"node --test[^"]*\*[^"]*": allow/, 'tests are exact commands');
    assert.match(agent.body, /README\.md sha256:[0-9a-f]{64}, /);
    assert.ok(agent.body.includes(readme.trimEnd()));
    assert.ok(agent.body.includes(prompt.trimEnd()));
    assert.ok(agent.body.includes(runners.marker));
  }
  assert.throws(() => runners.reviewerRoles('| Role | Prompt |\n'));
});

// Mirrors OpenCode 1.19.6 wildcard rules: `\` is read as `/` on both sides, `*` is
// any text, a trailing ` *` makes the arguments optional and the last match wins.
function bashAction(body, command) {
  const rules = [...body.matchAll(/^ {4}("(?:[^"\\]|\\.)*"): (allow|deny)$/gm)];
  let action = 'ask';
  for (const [, key, value] of rules) {
    let source = JSON.parse(key)
      .replaceAll('\\', '/')
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    if (source.endsWith(' .*')) source = source.slice(0, -3) + '( .*)?';
    if (new RegExp('^' + source + '$', 's').test(command.replaceAll('\\', '/'))) {
      action = value;
    }
  }
  return action;
}

test('reviewer shell rules allow inspection and deny known write or exec forms', () => {
  const [agent] = runners.opencodeAgents();
  const allowed = [
    'git diff',
    'git diff origin/main...HEAD',
    'git diff origin/main...HEAD -- tests/dev-environment.test.cjs tools/dev/',
    'git log -p -3',
    'git show HEAD:README.md',
    'git status --short',
    'git rev-parse HEAD',
    'node --test tests/dev-environment.test.cjs',
  ];
  const denied = [
    'git difftool -y -x "touch x" HEAD~1',
    'git diff HEAD --output=x',
    'git diff HEAD --out"put"=x',
    "git log --out'put'=x",
    'git diff --outpu$x=y',
    'git diff --ext-diff',
    'git -c diff.external=x diff',
    'git push',
    'git status && touch x',
    'node --test --import data:x tests/a.cjs',
    'node --test tests/../../x.mjs',
    'node --test tests/dev-environment.test.cjs /tmp/x.mjs',
    'node --test tests/dev-environment.test.cjs tools/dev/cli.cjs',
    'node --test tests/dev-environment.test.cjs --cpu-prof',
    'node --test',
    'rm -rf docs',
  ];
  for (const command of allowed) assert.equal(bashAction(agent.body, command), 'allow', command);
  for (const command of denied) assert.equal(bashAction(agent.body, command), 'deny', command);
});

test('runner configuration stays outside the checkout and keeps hand-written files', (t) => {
  assert.throws(() => runners.writeOpencodeAgents(path.join(root, '.opencode/agents')));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-agents-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  assert.equal(runners.writeOpencodeAgents(directory).length, 4);
  assert.equal(runners.writeOpencodeAgents(directory).length, 4);
  const retired = path.join(directory, 'retired-role.md');
  const own = path.join(directory, 'my-agent.md');
  fs.writeFileSync(retired, '<!-- ' + runners.marker + ' old -->\n');
  fs.writeFileSync(own, 'my own agent\n');
  runners.writeOpencodeAgents(directory);
  assert.equal(fs.existsSync(retired), false, 'generated agent for a retired role is removed');
  assert.equal(fs.existsSync(own), true, 'hand-written agents are kept');
  fs.writeFileSync(retired, '<!-- ' + runners.marker + ' old -->\n');
  fs.writeFileSync(path.join(directory, 'code-review.md'), 'my own agent\n');
  assert.throws(() => runners.writeOpencodeAgents(directory), /hand-written/);
  assert.equal(fs.existsSync(retired), true, 'a refused update changes nothing');
  fs.rmSync(path.join(directory, 'code-review.md'));
  fs.mkdirSync(path.join(directory, 'folder.md'));
  assert.equal(runners.writeOpencodeAgents(directory).length, 4, 'non-file entries are skipped');
  const dangling = path.join(directory, 'code-review.md');
  fs.rmSync(dangling);
  fs.symlinkSync(path.join(directory, 'missing-target'), dangling);
  assert.throws(() => runners.writeOpencodeAgents(directory), /hand-written/);
  assert.equal(fs.existsSync(path.join(directory, 'missing-target')), false);
  fs.rmSync(dangling);
  assert.throws(() => runners.writeOpencodeAgents(root));
  const link = path.join(directory, 'checkout-link');
  fs.symlinkSync(root, link);
  assert.throws(() => runners.writeOpencodeAgents(path.join(link, 'agents')), /outside/);
  assert.equal(runners.opencodeAgentDirectory({ XDG_CONFIG_HOME: '/x' }), '/x/opencode/agents');
});

test('review runs Codex against a validated base branch only', () => {
  assert.deepEqual(reviewArgs([]), ['review', '--base', 'origin/main']);
  assert.deepEqual(reviewArgs(['--base', 'origin/main']), ['review', '--base', 'origin/main']);
  const invalid = [['--base'], ['--base', 'a;b'], ['--base', '--uncommitted'], ['x', 'y']];
  for (const args of invalid) {
    assert.throws(() => reviewArgs(args), args.join(' '));
  }
  assert.throws(() => runners.runnerCommand('other', []), /Unknown runner/);
});

test('repository tracks no vendor-specific agent instruction files', () => {
  const tracked = cp
    .execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
  const vendor = new RegExp(
    '(^|/)(CLAUDE\\.md|GEMINI\\.md|\\.claude|\\.opencode|\\.codex|\\.cursor|\\.cursorrules|' +
      '\\.windsurfrules|\\.clinerules|\\.roo|\\.continue|\\.junie|\\.aider[^/]*|' +
      '\\.github/copilot-instructions\\.md|\\.github/instructions)(/|$)'
  );
  assert.deepEqual(
    tracked.filter((file) => vendor.test(file) && !file.startsWith('review/')),
    []
  );
});
