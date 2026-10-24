'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const limits = Object.freeze({
  wallMs: 5000,
  commandMs: 30000,
  outputBytes: 65536,
  moduleBytes: 65536,
  runtimeBytes: 256 * 1024 * 1024,
  memoryBytes: 256 * 1024 * 1024,
  scratchBytes: 8 * 1024 * 1024,
  sharedMemoryBytes: 1024 * 1024,
  pids: 32,
});
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const environment = () => ({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
function command(program, args, options = {}) {
  return cp.spawnSync(program, args, {
    env: environment(),
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: limits.commandMs,
    killSignal: 'SIGKILL',
    maxBuffer: limits.outputBytes,
    ...options,
  });
}
function successful(result, operation) {
  assert.ok(!result.error && !result.signal && result.status === 0, operation + ' failed');
  return result.stdout;
}
function docker(config, args, options) {
  return command(
    '/usr/bin/docker',
    ['--config=' + config, '--host=unix:///var/run/docker.sock', ...args],
    options
  );
}
function capability(call) {
  assert.equal(process.platform, 'linux', 'Linux Docker containment required');
  assert.equal(process.arch, 'x64', 'only Linux x64 runtime supported');
  assert.ok(fs.statSync('/var/run/docker.sock').isSocket(), 'local Docker socket required');
  const info = JSON.parse(successful(call(['info', '--format', '{{json .}}']), 'Docker info'));
  assert.equal(info.OSType, 'linux');
  assert.equal(info.CgroupVersion, '2', 'cgroup v2 required');
  for (const field of ['MemoryLimit', 'SwapLimit', 'PidsLimit', 'CpuCfsQuota'])
    assert.equal(info[field], true, 'missing enforced Docker capability: ' + field);
  assert.ok(info.SecurityOptions.some((value) => value.startsWith('name=seccomp,')));
  assert.ok(!info.SecurityOptions.some((value) => value.includes('rootless')));
  const version = JSON.parse(
    successful(call(['version', '--format', '{{json .}}']), 'Docker version')
  );
  return {
    endpoint: 'unix:///var/run/docker.sock',
    cliSha256: digest(fs.readFileSync('/usr/bin/docker')),
    client: version.Client.Version,
    server: version.Server.Version,
    components: version.Server.Components,
    kernel: info.KernelVersion,
    cgroupVersion: info.CgroupVersion,
    securityOptions: info.SecurityOptions,
  };
}
function runtime() {
  const executable = fs.realpathSync(process.execPath);
  const output = successful(command('/usr/bin/ldd', [executable]), 'trusted runtime inventory');
  const files = [{ source: executable, target: 'bin/node' }];
  for (const line of output.toString('utf8').trim().split('\n')) {
    if (/^\s*linux-vdso\.so\.1 \(0x[a-f0-9]+\)$/.test(line)) continue;
    const match = line.match(/^\s*(?:\S+ => )?(\/(?:usr\/)?lib[^ ]*) \(0x[a-f0-9]+\)$/);
    assert.ok(match, 'unsupported runtime library inventory');
    const target = match[1].slice(1);
    assert.ok(target.split('/').every((part) => part && part !== '.' && part !== '..'));
    files.push({ source: fs.realpathSync(match[1]), target });
  }
  assert.ok(files.length > 1 && files.length <= 32, 'runtime file bound');
  assert.equal(new Set(files.map((file) => file.target)).size, files.length);
  let total = 0;
  return files.map(({ source, target }) => {
    const stat = fs.statSync(source);
    assert.ok(stat.isFile() && stat.size > 0 && stat.size <= limits.runtimeBytes);
    total += stat.size;
    assert.ok(total <= limits.runtimeBytes, 'runtime byte bound');
    const bytes = fs.readFileSync(source);
    return { target, bytes, sha256: digest(bytes) };
  });
}
function createArguments(name, image) {
  return [
    'create',
    '--name',
    name,
    '--label',
    'control-runner=' + name,
    '--pull=never',
    '--network=none',
    '--read-only',
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges',
    '--user=65534:65534',
    '--cgroupns=private',
    '--ipc=private',
    '--pids-limit=' + limits.pids,
    '--memory=' + limits.memoryBytes,
    '--memory-swap=' + limits.memoryBytes,
    '--cpus=1',
    '--ulimit=nofile=64:64',
    '--ulimit=core=0:0',
    '--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=' + limits.scratchBytes + ',mode=1777',
    '--shm-size=' + limits.sharedMemoryBytes,
    '--log-driver=none',
    '--env=PATH=/bin',
    '--env=HOME=/nonexistent',
    '--env=HOSTNAME=control-runner',
    '--env=LANG=C',
    '--workdir=/',
    image,
    '/bin/node',
    '/driver.cjs',
  ];
}
function verifyConfiguration(value, name, image) {
  const h = value.HostConfig,
    c = value.Config;
  assert.equal(value.Name, '/' + name);
  assert.equal(value.Image, image);
  assert.equal(c.Image, image);
  assert.equal(c.User, '65534:65534');
  assert.deepEqual(c.Cmd, ['/bin/node', '/driver.cjs']);
  assert.equal(c.Entrypoint, null);
  assert.deepEqual([...c.Env].sort(), [
    'HOME=/nonexistent',
    'HOSTNAME=control-runner',
    'LANG=C',
    'PATH=/bin',
  ]);
  assert.equal(c.WorkingDir, '/');
  assert.equal(c.Labels['control-runner'], name);
  assert.equal(c.Volumes, null);
  assert.equal(c.Tty, false);
  assert.equal(c.OpenStdin, false);
  assert.equal(h.Privileged, false);
  assert.equal(h.ReadonlyRootfs, true);
  assert.equal(h.NetworkMode, 'none');
  assert.equal(h.PidMode, '');
  assert.equal(h.UTSMode, '');
  assert.equal(h.IpcMode, 'private');
  assert.equal(h.CgroupnsMode, 'private');
  assert.equal(h.UsernsMode, '');
  assert.equal(h.Memory, limits.memoryBytes);
  assert.equal(h.MemorySwap, limits.memoryBytes);
  assert.equal(h.PidsLimit, limits.pids);
  assert.equal(h.NanoCpus, 1000000000);
  assert.equal(h.ShmSize, limits.sharedMemoryBytes);
  assert.deepEqual(h.CapDrop, ['ALL']);
  assert.ok(!h.CapAdd?.length);
  assert.deepEqual(h.SecurityOpt, ['no-new-privileges']);
  assert.deepEqual(h.Tmpfs, {
    '/tmp': 'rw,noexec,nosuid,nodev,size=' + limits.scratchBytes + ',mode=1777',
  });
  assert.equal(h.LogConfig.Type, 'none');
  assert.equal(h.RestartPolicy.Name, 'no');
  assert.deepEqual(h.Ulimits, [
    { Name: 'nofile', Hard: 64, Soft: 64 },
    { Name: 'core', Hard: 0, Soft: 0 },
  ]);
  for (const field of ['Binds', 'Devices', 'DeviceRequests', 'VolumesFrom', 'Links'])
    assert.ok(!h[field]?.length, 'unexpected host attachment: ' + field);
  assert.ok(!Object.keys(h.PortBindings || {}).length);
  assert.ok(!value.Mounts.length, 'unexpected user mounts');
  assert.equal(value.State.Status, 'created', 'container must not have started');
  return true;
}
function absent(call, kind, name) {
  const rows = successful(
    call([
      kind,
      'ls',
      '--all',
      '--quiet',
      '--filter',
      kind === 'container' ? 'name=^/' + name + '$' : 'reference=' + name,
    ]),
    'cleanup verification'
  );
  assert.equal(rows.toString().trim(), '', 'owned ' + kind + ' remains: ' + name);
}
function cleanup(call, owned) {
  const { name, image, container, uncertain } = owned;
  if (!name) return;
  // A lost import/create response cannot be reconciled by one instantaneous empty list.
  // Best-effort removal still runs, but the receipt must retain the uncertainty.
  const removals = [];
  if (container || uncertain)
    removals.push({
      result: call(['container', 'rm', '--force', container || name]),
      kind: 'container',
    });
  if (image || uncertain)
    removals.push({
      result: call(['image', 'rm', '--force', name]),
      kind: 'image',
    });
  assert.ok(!uncertain, 'daemon creation outcome uncertain: ' + name);
  for (const removal of removals) successful(removal.result, removal.kind + ' removal');
  absent(call, 'container', name);
  absent(call, 'image', name);
  for (const [kind, identity] of [
    ['container', container],
    ['image', image],
  ]) {
    if (!identity) continue;
    const rows = successful(
      call([kind, 'ls', '--all', '--quiet', '--no-trunc']),
      kind + ' cleanup inventory'
    )
      .toString()
      .trim()
      .split('\n');
    assert.ok(!rows.includes(identity), 'owned ' + kind + ' remains: ' + identity);
  }
}
function execute(moduleBytes, probes) {
  const record = {
    state: 'blocked',
    executed: false,
    cleanupVerified: false,
    limits,
    stdout: '',
    stderr: '',
    error: null,
  };
  let directory, name, image, container;
  const owned = { uncertain: false };
  const call = (args, options) => docker(path.join(directory, 'docker-config'), args, options);
  try {
    assert.ok(Buffer.isBuffer(moduleBytes) && moduleBytes.length <= limits.moduleBytes);
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'control-runner-'));
    fs.mkdirSync(path.join(directory, 'docker-config'));
    record.platform = capability(call);
    const files = runtime();
    const driver = fs.readFileSync(path.join(__dirname, 'control-runner-driver.cjs'));
    files.push(
      { target: 'driver.cjs', bytes: driver },
      { target: 'candidate.cjs', bytes: moduleBytes },
      { target: 'probes.json', bytes: Buffer.from(JSON.stringify(probes)) }
    );
    record.inventory = files.map(({ target, bytes }) => ({
      path: target,
      bytes: bytes.length,
      sha256: digest(bytes),
    }));
    const root = path.join(directory, 'root');
    fs.mkdirSync(root);
    for (const { target, bytes } of files) {
      fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
      fs.writeFileSync(path.join(root, target), bytes, {
        mode: target === 'bin/node' || target.startsWith('lib') ? 0o555 : 0o444,
        flag: 'wx',
      });
    }
    const archive = path.join(directory, 'root.tar');
    successful(
      command('/bin/tar', [
        '--format=ustar',
        '--owner=0',
        '--group=0',
        '--mtime=@0',
        '-cf',
        archive,
        '-C',
        root,
        '--',
        ...files.map((file) => file.target),
      ]),
      'fixed runtime archive'
    );
    record.archiveSha256 = digest(fs.readFileSync(archive));
    name = 'control-runner-' + crypto.randomUUID();
    record.resourceName = name;
    absent(call, 'container', name);
    absent(call, 'image', name);
    owned.name = name;
    owned.uncertain = true;
    image = successful(call(['image', 'import', archive, name]), 'local image import')
      .toString()
      .trim();
    assert.match(image, /^sha256:[a-f0-9]{64}$/);
    owned.image = image;
    owned.uncertain = false;
    record.image = image;
    owned.uncertain = true;
    container = successful(call(createArguments(name, image)), 'contained process creation')
      .toString()
      .trim();
    assert.match(container, /^[a-f0-9]{64}$/);
    owned.container = container;
    owned.uncertain = false;
    record.container = container;
    const config = JSON.parse(successful(call(['inspect', container]), 'container inspect'))[0];
    verifyConfiguration(config, name, image);
    assert.equal(config.Id, container, 'created container identity mismatch');
    record.configuration = config;
    const started = Date.now();
    record.executed = true;
    const result = call(['start', '--attach', container], { timeout: limits.wallMs });
    record.elapsedMs = Date.now() - started;
    record.stdout = result.stdout?.subarray(0, limits.outputBytes).toString('base64') || '';
    record.stderr = result.stderr?.subarray(0, limits.outputBytes).toString('base64') || '';
    record.exitCode = result.status;
    record.signal = result.signal;
    record.executionError = result.error?.code || null;
    // Go straight to whole-container cleanup after watchdog/output failure.
    assert.ok(!result.error && !result.signal, 'contained execution interrupted');
    const state = JSON.parse(successful(call(['inspect', container]), 'terminal inspect'))[0].State;
    record.terminal = state;
    assert.ok(!state.Running && state.Status === 'exited', 'container did not terminate');
    assert.ok(!state.OOMKilled && !state.Error, 'contained execution failed');
    successful(result, 'contained execution');
    assert.equal(state.ExitCode, 0, 'candidate exit failure');
    assert.equal(result.stderr.length, 0, 'unexpected candidate stderr');
    record.state = 'executed';
  } catch (error) {
    record.error = error.message;
  } finally {
    try {
      cleanup(call, owned);
      record.cleanupVerified = true;
    } catch (error) {
      record.state = 'blocked';
      record.cleanupError = error.message;
    }
    if (directory) fs.rmSync(directory, { recursive: true, force: true });
  }
  return record;
}
module.exports = {
  limits,
  digest,
  environment,
  createArguments,
  verifyConfiguration,
  cleanup,
  execute,
};
