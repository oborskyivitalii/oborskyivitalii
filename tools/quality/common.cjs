'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../..');
const tools = path.resolve(process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain'));
const toolRequire = createRequire(path.join(tools, 'package.json'));
const out = path.resolve(process.env.SITE_REPORT_DIR || path.join(os.tmpdir(), 'site-quality'));
function environment() {
  return {
    platform: process.platform,
    os: os.release(),
    architecture: os.arch(),
    node: process.version,
    runnerImage: process.env.ImageOS || null,
    imageVersion: process.env.ImageVersion || null,
    cpus: os.cpus().map((x) => x.model),
    memoryBytes: os.totalmem(),
    runId: process.env.GITHUB_RUN_ID || null,
    attempt: process.env.GITHUB_RUN_ATTEMPT || null,
  };
}
function variant(manifest) {
  const declared = manifest.components?.variant || manifest.variant;
  if (declared) {
    assert.ok(['base', 'color'].includes(declared.id), 'unknown tested runtime variant');
    assert.equal(declared.contract, 1, 'unsupported tested runtime contract');
    assert.match(declared.fingerprint, /^[a-f0-9]{64}$/);
    if (manifest.components?.variant && manifest.variant)
      assert.deepEqual(
        manifest.components.variant,
        manifest.variant,
        'conflicting tested runtime identity'
      );
    return declared;
  }
  const revision = manifest.components;
  if (revision?.contract === 1 && /^[a-f0-9]{64}$/.test(revision.engine || ''))
    return { id: 'base', contract: revision.contract, fingerprint: revision.engine };
  throw Error('Missing tested runtime variant identity');
}
function identity() {
  const m = JSON.parse(
    fs.readFileSync(process.env.SITE_ARTIFACT_MANIFEST || path.join(out, 'artifact.json'))
  );
  return {
    sourceCommit: m.sourceCommit,
    sourceTree: m.sourceTree,
    candidateCommit: m.candidateCommit,
    artifactDigest: m.artifactDigest,
    variant: variant(m),
  };
}
function save(name, value) {
  fs.mkdirSync(out, { recursive: true });
  const target = path.join(out, name + '.json');
  const temporary = target + '.tmp';
  const file = fs.openSync(temporary, 'w');
  const ancestors = new Set();
  let buffer = '';
  function write(text) {
    buffer += text;
    if (buffer.length >= 65536) {
      fs.writeSync(file, buffer);
      buffer = '';
    }
  }
  function serialize(item, key = '') {
    if (item && typeof item.toJSON === 'function') item = item.toJSON(key);
    if (!item || typeof item !== 'object') {
      write(JSON.stringify(item) ?? 'null');
      return;
    }
    if (ancestors.has(item)) throw new TypeError('Circular evidence record');
    ancestors.add(item);
    const array = Array.isArray(item);
    write(array ? '[' : '{');
    const keys = array
      ? Array.from({ length: item.length }, (_, index) => index)
      : Object.keys(item);
    let count = 0;
    for (const name of keys) {
      if (!array && ['undefined', 'function', 'symbol'].includes(typeof item[name])) continue;
      if (count++) write(',');
      if (!array) write(JSON.stringify(name) + ':');
      serialize(item[name], String(name));
    }
    write(array ? ']' : '}');
    ancestors.delete(item);
  }
  try {
    // Preserve every raw observation without constructing one V8 string for
    // hundreds of painted frames and repeated native geometry records.
    serialize(value);
    write('\n');
    if (buffer) fs.writeSync(file, buffer);
  } catch (error) {
    fs.closeSync(file);
    fs.rmSync(temporary, { force: true });
    throw error;
  }
  fs.closeSync(file);
  fs.renameSync(temporary, target);
}
function report(kind, detail, pass = true) {
  const r = {
    schema: 1,
    kind,
    pass,
    ...identity(),
    environment: environment(),
    target: process.env.SITE_TEST_BASE_URL
      ? require('./hosted-origin.cjs').target(
          process.env.SITE_TEST_BASE_URL,
          process.env.SITE_TEST_PROFILE
        )
      : null,
    ...detail,
  };
  save(kind, r);
  return r;
}
function launchOptions(engine) {
  return {
    headless: true,
    timeout: 30000,
    ...(engine === 'chromium' && process.env.SITE_AUDIT_CHROME
      ? { executablePath: process.env.SITE_AUDIT_CHROME }
      : {}),
    ...(engine === 'chromium' ? { args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}),
  };
}
module.exports = {
  root,
  tools,
  toolRequire,
  out,
  environment,
  variant,
  identity,
  save,
  report,
  launchOptions,
};
