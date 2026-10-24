'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const runner = require('../tools/quality/control-runner.cjs');
const sandbox = require('../tools/quality/control-runner-docker.cjs');
const root = path.resolve(__dirname, '..');
function git(directory, args) {
  return cp
    .execFileSync('git', args, {
      cwd: directory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    .trim();
}
function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'control-runner-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  git(directory, ['init', '-q']);
  git(directory, ['config', 'user.name', 'Fixture']);
  git(directory, ['config', 'user.email', 'fixture@example.invalid']);
  fs.mkdirSync(path.join(directory, 'tools/quality'), { recursive: true });
  const write = (bytes) => fs.writeFileSync(path.join(directory, runner.modulePath), bytes);
  const commit = () => {
    git(directory, ['add', '.']);
    git(directory, ['commit', '-qm', 'fixture']);
    return git(directory, ['rev-parse', 'HEAD']);
  };
  write(fs.readFileSync(path.join(root, runner.modulePath)));
  return { directory, write, commit, base: commit() };
}
function configuration() {
  return {
    Name: '/owned',
    Image: 'sha256:local',
    Mounts: [],
    State: { Status: 'created' },
    Config: {
      Image: 'sha256:local',
      User: '65534:65534',
      Cmd: ['/bin/node', '/driver.cjs'],
      Entrypoint: null,
      Env: ['PATH=/bin', 'HOME=/nonexistent', 'HOSTNAME=control-runner', 'LANG=C'],
      WorkingDir: '/',
      Labels: { 'control-runner': 'owned' },
      Volumes: null,
      Tty: false,
      OpenStdin: false,
    },
    HostConfig: {
      Privileged: false,
      ReadonlyRootfs: true,
      NetworkMode: 'none',
      PidMode: '',
      UTSMode: '',
      IpcMode: 'private',
      CgroupnsMode: 'private',
      UsernsMode: '',
      Memory: 268435456,
      MemorySwap: 268435456,
      PidsLimit: 32,
      NanoCpus: 1000000000,
      ShmSize: 1048576,
      CapDrop: ['ALL'],
      CapAdd: null,
      SecurityOpt: ['no-new-privileges'],
      Tmpfs: { '/tmp': 'rw,noexec,nosuid,nodev,size=8388608,mode=1777' },
      LogConfig: { Type: 'none' },
      RestartPolicy: { Name: 'no' },
      Ulimits: [
        { Name: 'nofile', Hard: 64, Soft: 64 },
        { Name: 'core', Hard: 0, Soft: 0 },
      ],
      Binds: null,
      Devices: [],
      DeviceRequests: null,
      VolumesFrom: null,
      Links: null,
      PortBindings: {},
    },
  };
}
test('immutable module extraction does not import H or read its working files', (t) => {
  const f = fixture(t);
  const marker = path.join(f.directory, 'executed');
  f.write(`require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'bad');`);
  const head = f.commit();
  f.write('working tree must not be read');
  const input = runner.input(f.directory, head);
  assert.match(input.bytes.toString(), /writeFileSync/);
  assert.equal(input.commit, head);
  assert.equal(fs.existsSync(marker), false);
  assert.equal(input.sha256, sandbox.digest(input.bytes));
});
test('mutable refs, missing modules, executable mode and oversized inputs reject', (t) => {
  const f = fixture(t);
  assert.throws(() => runner.input(f.directory, 'HEAD'), /immutable/);
  git(f.directory, ['update-index', '--chmod=+x', runner.modulePath]);
  git(f.directory, ['commit', '-qm', 'mode']);
  assert.throws(
    () => runner.input(f.directory, git(f.directory, ['rev-parse', 'HEAD'])),
    /regular/
  );
  git(f.directory, ['update-index', '--chmod=-x', runner.modulePath]);
  f.write(Buffer.alloc(65537, 97));
  assert.throws(() => runner.input(f.directory, f.commit()), /byte bound/);
  fs.unlinkSync(path.join(f.directory, runner.modulePath));
  assert.throws(() => runner.input(f.directory, f.commit()), /regular/);
});
test('nonancestor and invalid identities block without candidate execution', (t) => {
  const f = fixture(t);
  f.write('throw Error("must not execute");');
  const head = f.commit();
  const report = runner.assess(f.directory, head, f.base);
  assert.equal(report.state, 'blocked');
  assert.equal(report.observations.length, 0);
  assert.ok(Object.values(report.authority).every((value) => value === false));
});
test('configuration matches mandatory containment and independently rejects weakened controls', () => {
  assert.equal(sandbox.verifyConfiguration(configuration(), 'owned', 'sha256:local'), true);
  const mutations = {
    Privileged: true,
    ReadonlyRootfs: false,
    NetworkMode: 'host',
    PidMode: 'host',
    UTSMode: 'host',
    IpcMode: 'host',
    CgroupnsMode: 'host',
    UsernsMode: 'host',
    Memory: 0,
    MemorySwap: -1,
    PidsLimit: 0,
    NanoCpus: 0,
    ShmSize: 67108864,
    CapDrop: [],
    CapAdd: ['SYS_ADMIN'],
    SecurityOpt: ['seccomp=unconfined'],
    Tmpfs: {},
    LogConfig: { Type: 'json-file' },
    RestartPolicy: { Name: 'always' },
    Ulimits: [],
    Binds: ['/var/run/docker.sock:/socket'],
    Devices: [{ PathOnHost: '/dev/sda' }],
    DeviceRequests: [{}],
    VolumesFrom: ['other'],
    Links: ['other'],
    PortBindings: { '80/tcp': [] },
  };
  for (const [key, value] of Object.entries(mutations)) {
    const config = configuration();
    config.HostConfig[key] = value;
    assert.throws(() => sandbox.verifyConfiguration(config, 'owned', 'sha256:local'), key);
  }
});
test('configuration rejects injected command, environment, input mount and wrong resource', () => {
  for (const mutation of [
    (c) => {
      c.Config.User = '0';
    },
    (c) => {
      c.Config.Cmd = ['/bin/sh'];
    },
    (c) => {
      c.Config.Entrypoint = ['/bin/node'];
    },
    (c) => {
      c.Config.Env.push('NODE_OPTIONS=--require=/host');
    },
    (c) => {
      c.Config.Volumes = { '/host': {} };
    },
    (c) => {
      c.Config.OpenStdin = true;
    },
    (c) => {
      c.Config.Tty = true;
    },
    (c) => {
      c.Mounts.push({ Type: 'bind', Source: '/', Destination: '/host' });
    },
    (c) => {
      c.Image = 'sha256:other';
    },
    (c) => {
      c.State.Status = 'running';
    },
  ]) {
    const config = configuration();
    mutation(config);
    assert.throws(() => sandbox.verifyConfiguration(config, 'owned', 'sha256:local'));
  }
});

test('daemon limit ordering is irrelevant while exact names, values and multiplicity remain required', () => {
  const config = configuration();
  config.HostConfig.Ulimits.reverse();
  assert.equal(sandbox.verifyConfiguration(config, 'owned', 'sha256:local'), true);
  for (const limits of [
    [{ Name: 'core', Hard: 0, Soft: 0 }],
    [
      { Name: 'core', Hard: 0, Soft: 0 },
      { Name: 'nofile', Hard: 64, Soft: 65 },
    ],
    [
      { Name: 'core', Hard: 0, Soft: 0 },
      { Name: 'nofile', Hard: 65, Soft: 64 },
    ],
    [...config.HostConfig.Ulimits, { Name: 'nofile', Hard: 64, Soft: 64 }],
    [...config.HostConfig.Ulimits, { Name: 'other', Hard: 64, Soft: 64 }],
  ]) {
    config.HostConfig.Ulimits = limits;
    assert.throws(() => sandbox.verifyConfiguration(config, 'owned', 'sha256:local'));
  }
});
test('Docker arguments forbid image pulling and ambient environment does not cross boundary', () => {
  const args = sandbox.createArguments('owned', 'sha256:local');
  assert.ok(args.includes('--pull=never'));
  assert.ok(!args.some((value) => value.startsWith('--mount') || value.startsWith('--volume')));
  assert.deepEqual(sandbox.environment(), { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
  assert.deepEqual(args.slice(-3), ['sha256:local', '/bin/node', '/driver.cjs']);
});
test('host oracle rejects fabricated reports, missing responses, extra output and incomplete cleanup', () => {
  const good = {
    state: 'executed',
    executed: true,
    cleanupVerified: true,
    stdout: runner.expected().toString('base64'),
  };
  assert.equal(runner.evaluate(good), true);
  for (const stdout of [
    '',
    '[]\n',
    '{"pass":true,"total":10}\n',
    runner.expected().toString() + 'extra',
    runner.expected().toString().replace('hello', 'wrong'),
  ])
    assert.equal(
      runner.evaluate({ ...good, stdout: Buffer.from(stdout).toString('base64') }),
      false
    );
  for (const delta of [{ state: 'blocked' }, { executed: false }, { cleanupVerified: false }])
    assert.equal(runner.evaluate({ ...good, ...delta }), false);
});
test('missing local daemon fails before candidate import with explicit cleanup state', () => {
  // Force capability failure independently of the actual host's Docker installation.
  const script = `const fs=require('node:fs');const original=fs.statSync;
    fs.statSync=function(p,...args){if(p==='/var/run/docker.sock')throw Error('fixture unavailable');
    return original.call(this,p,...args)};
    const s=require(${JSON.stringify(path.join(root, 'tools/quality/control-runner-docker.cjs'))});
    process.stdout.write(JSON.stringify(s.execute(Buffer.from('process.exit(97)'),[])));`;
  const result = cp.spawnSync(process.execPath, ['-e', script], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.state, 'blocked');
  assert.equal(report.executed, false);
  assert.equal(report.cleanupVerified, true);
});

test('unknown creation outcome cannot claim cleanup from an empty instantaneous inventory', () => {
  const calls = [];
  const empty = (args) => {
    calls.push(args);
    return { status: 0, stdout: Buffer.from(''), stderr: Buffer.from('') };
  };
  assert.throws(() => sandbox.cleanup(empty, { name: 'owned', uncertain: true }), /uncertain/);
  assert.deepEqual(calls, [
    ['container', 'rm', '--force', 'owned'],
    ['image', 'rm', '--force', 'owned'],
  ]);
});

test('acknowledged container cleanup requires successful removal and exact identity absence', () => {
  const owned = {
    name: 'owned',
    image: 'sha256:image',
    container: 'container-id',
    uncertain: false,
  };
  const calls = [];
  const reply = (args) => {
    calls.push(args);
    return { status: 0, stdout: Buffer.from(''), stderr: Buffer.from('') };
  };
  assert.doesNotThrow(() => sandbox.cleanup(reply, owned));
  assert.deepEqual(calls[0], ['container', 'rm', '--force', 'container-id']);
  for (const failed of ['container', 'image']) {
    assert.throws(
      () =>
        sandbox.cleanup((args) => {
          if (args[0] === failed && args[1] === 'rm')
            return { status: 1, stdout: Buffer.from(''), stderr: Buffer.from('lost response') };
          return reply(args);
        }, owned),
      /removal/
    );
  }
  assert.throws(
    () =>
      sandbox.cleanup((args) => {
        if (args[0] === 'container' && args.includes('--no-trunc'))
          return { status: 0, stdout: Buffer.from('container-id\n'), stderr: Buffer.from('') };
        return reply(args);
      }, owned),
    /remains/
  );
});
