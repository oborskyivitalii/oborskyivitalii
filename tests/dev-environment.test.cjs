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
  for (const args of [['--port=8080'], ['foo'], ['--port'], ['--port', 'x'], ['--port', '0']])
    assert.throws(() => serveOptions(args), args.join(' '));
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
    assert.match(agent.body, /\npermission:\n {2}edit: deny\n/);
    assert.ok(agent.body.includes(readme.trimEnd()));
    assert.ok(agent.body.includes(prompt.trimEnd()));
    assert.ok(agent.body.includes(runners.marker));
  }
  assert.throws(() => runners.reviewerRoles('| Role | Prompt |\n'));
});

test('runner configuration stays outside the checkout and keeps hand-written files', (t) => {
  assert.throws(() => runners.writeOpencodeAgents(path.join(root, '.opencode/agents')));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-agents-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  assert.equal(runners.writeOpencodeAgents(directory).length, 4);
  assert.equal(runners.writeOpencodeAgents(directory).length, 4);
  fs.writeFileSync(path.join(directory, 'code-review.md'), 'my own agent\n');
  assert.throws(() => runners.writeOpencodeAgents(directory), /hand-written/);
  assert.equal(runners.opencodeAgentDirectory({ XDG_CONFIG_HOME: '/x' }), '/x/opencode/agents');
});

test('review runs Codex against a validated base branch only', () => {
  assert.deepEqual(reviewArgs([]), ['review', '--base', 'main']);
  assert.deepEqual(reviewArgs(['--base', 'origin/main']), ['review', '--base', 'origin/main']);
  for (const args of [['--base'], ['--base', 'a;b'], ['--uncommitted'], ['x', 'y']])
    assert.throws(() => reviewArgs(args), args.join(' '));
  assert.throws(() => runners.runnerCommand('other', []), /Unknown runner/);
});

test('repository tracks no vendor-specific agent instruction files', () => {
  const tracked = cp
    .execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
  const vendor =
    /(^|\/)(CLAUDE\.md|GEMINI\.md|\.claude|\.opencode|\.codex|\.cursor|\.cursorrules|\.windsurfrules|\.github\/copilot-instructions\.md)(\/|$)/;
  assert.deepEqual(
    tracked.filter((file) => vendor.test(file) && !file.startsWith('review/')),
    []
  );
});
