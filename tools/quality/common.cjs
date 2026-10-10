'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { randomUUID, createHash } = require('node:crypto');
const { types } = require('node:util');
const { StringDecoder } = require('node:string_decoder');
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
const jsonChunkChars = 65536;
function stringEnd(value, start, size) {
  let end = Math.min(start + size, value.length);
  const last = value.charCodeAt(end - 1),
    next = value.charCodeAt(end);
  if (last >= 0xd800 && last <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) end--;
  return end;
}
function* quotedJson(value) {
  yield '"';
  for (let start = 0; start < value.length; ) {
    // One code unit can expand to six JSON characters. Never stringify the
    // whole scalar, and preserve pairs across both JSON and UTF-8 boundaries.
    const end = stringEnd(value, start, Math.floor(jsonChunkChars / 6));
    yield JSON.stringify(value.slice(start, end)).slice(1, -1);
    start = end;
  }
  yield '"';
}
function jsonValue(value, key) {
  if (value !== null && ['object', 'function', 'bigint'].includes(typeof value)) {
    const toJSON = value.toJSON;
    if (typeof toJSON === 'function') value = toJSON.call(value, key);
  }
  if (types.isNumberObject(value)) return +value;
  if (types.isStringObject(value)) return String(value);
  if (types.isBooleanObject(value)) return Boolean.prototype.valueOf.call(value);
  if (types.isBigIntObject(value)) return BigInt.prototype.valueOf.call(value);
  return value;
}
function omittedJson(value) {
  return ['undefined', 'function', 'symbol'].includes(typeof value);
}
function* jsonArray(value, depth, ancestry, pretty) {
  yield '[';
  const length = Math.min(Math.max(Math.floor(+value.length) || 0, 0), Number.MAX_SAFE_INTEGER),
    indent = pretty ? '\n' + '  '.repeat(depth + 1) : '';
  for (let index = 0; index < length; index++) {
    yield (index ? ',' : '') + indent;
    const item = jsonValue(value[index], String(index));
    yield* jsonTokens(omittedJson(item) ? null : item, depth + 1, ancestry, pretty);
  }
  if (length && pretty) yield '\n' + '  '.repeat(depth);
  yield ']';
}
function* jsonObject(value, depth, ancestry, pretty) {
  yield '{';
  let written = false;
  const keys = Object.keys(value),
    indent = pretty ? '\n' + '  '.repeat(depth + 1) : '';
  for (const key of keys) {
    const item = jsonValue(value[key], key);
    if (omittedJson(item)) continue;
    yield (written ? ',' : '') + indent;
    yield* quotedJson(key);
    yield pretty ? ': ' : ':';
    yield* jsonTokens(item, depth + 1, ancestry, pretty);
    written = true;
  }
  if (written && pretty) yield '\n' + '  '.repeat(depth);
  yield '}';
}
function* jsonTokens(value, depth, ancestry, pretty) {
  if (omittedJson(value)) {
    yield 'undefined';
    return;
  }
  if (typeof value === 'string') {
    yield* quotedJson(value);
    return;
  }
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'bigint') throw new TypeError('Do not know how to serialize a BigInt');
    yield String(JSON.stringify(value));
    return;
  }
  if (JSON.isRawJSON?.(value)) {
    yield value.rawJSON;
    return;
  }
  if (ancestry.has(value)) throw new TypeError('Converting circular structure to JSON');
  ancestry.add(value);
  try {
    yield* Array.isArray(value)
      ? jsonArray(value, depth, ancestry, pretty)
      : jsonObject(value, depth, ancestry, pretty);
  } finally {
    ancestry.delete(value);
  }
}
function* jsonChunks(value, pretty = true) {
  let buffered = '';
  for (const token of jsonTokens(jsonValue(value, ''), 0, new Set(), pretty)) {
    for (let start = 0; start < token.length; ) {
      const end = stringEnd(token, start, jsonChunkChars - buffered.length);
      if (end === start) {
        yield buffered;
        buffered = '';
        continue;
      }
      buffered += token.slice(start, end);
      start = end;
      if (buffered.length === jsonChunkChars) {
        yield buffered;
        buffered = '';
      }
    }
  }
  yield buffered + (pretty ? '\n' : '');
}
function jsonDigest(value) {
  const digest = createHash('sha256');
  for (const chunk of jsonChunks(value, false)) digest.update(chunk);
  return digest.digest('hex');
}
function writeJsonChunk(descriptor, chunk) {
  const bytes = Buffer.from(chunk);
  for (let offset = 0; offset < bytes.length; ) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset);
    assert.ok(written > 0, 'JSON report write made no progress');
    offset += written;
  }
}
function writeJson(file, value) {
  const temporary = file + '.tmp-' + process.pid + '-' + randomUUID();
  try {
    const descriptor = fs.openSync(temporary, 'wx');
    try {
      for (const chunk of jsonChunks(value)) writeJsonChunk(descriptor, chunk);
    } finally {
      fs.closeSync(descriptor);
    }
    fs.renameSync(temporary, file);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}
function jsonCursor(descriptor, chunkBytes) {
  const bytes = Buffer.alloc(chunkBytes),
    decoder = new StringDecoder('utf8');
  let text = '',
    offset = 0,
    ended = false;
  function peek() {
    while (offset === text.length && !ended) {
      const size = fs.readSync(descriptor, bytes, 0, bytes.length, null);
      text = size ? decoder.write(bytes.subarray(0, size)) : decoder.end();
      ended = size === 0;
      offset = 0;
    }
    return text[offset] || '';
  }
  return {
    peek,
    take: () => {
      const value = peek();
      if (value) offset++;
      return value;
    },
  };
}
function invalidJson() {
  throw new SyntaxError('Invalid or truncated JSON report');
}
function jsonString(input) {
  const escapes = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };
  const parts = [];
  let portion = '';
  for (;;) {
    let character = input.take();
    if (!character || character < ' ') invalidJson();
    if (character === '"') return parts.join('') + portion;
    if (character === '\\') {
      const escape = input.take();
      if (escape === 'u') {
        let hex = '';
        for (let digit = 0; digit < 4; digit++) hex += input.take();
        if (!/^[a-fA-F0-9]{4}$/.test(hex)) invalidJson();
        character = String.fromCharCode(parseInt(hex, 16));
      } else {
        if (!Object.hasOwn(escapes, escape)) invalidJson();
        character = escapes[escape];
      }
    }
    portion += character;
    if (portion.length >= jsonChunkChars) {
      parts.push(portion);
      portion = '';
    }
  }
}
function jsonToken(input) {
  while ([' ', '\t', '\r', '\n'].includes(input.peek())) input.take();
  const character = input.take();
  if (!character) return { type: 'end' };
  if ('{}[],:'.includes(character)) return { type: character };
  if (character === '"') return { type: 'string', value: jsonString(input) };
  let scalar = character;
  if (character === '-' || /[0-9]/.test(character)) {
    while (input.peek() && /[-+0-9.eE]/.test(input.peek())) scalar += input.take();
  } else {
    const literal = { t: 'true', f: 'false', n: 'null' }[character];
    if (!literal) invalidJson();
    for (let index = 1; index < literal.length; index++) scalar += input.take();
    if (scalar !== literal) invalidJson();
  }
  return { type: 'scalar', value: JSON.parse(scalar) };
}
function jsonAcceptedValue(token, stack) {
  if (token.type === 'string' || token.type === 'scalar') return token.value;
  if (token.type !== '[' && token.type !== '{') invalidJson();
  const array = token.type === '[';
  const frame = { value: array ? [] : {}, array, state: 'first', key: null };
  stack.push(frame);
  return frame.value;
}
function jsonFrameToken(frame, token, stack) {
  const closing = frame.array ? ']' : '}';
  if (frame.state === 'comma') {
    if (token.type === closing) stack.pop();
    else if (token.type === ',') frame.state = frame.array ? 'value' : 'key';
    else invalidJson();
    return;
  }
  if (frame.state === 'colon') {
    if (token.type !== ':') invalidJson();
    frame.state = 'value';
    return;
  }
  if (frame.state === 'first' && token.type === closing) {
    stack.pop();
    return;
  }
  if (!frame.array && (frame.state === 'first' || frame.state === 'key')) {
    if (token.type !== 'string') invalidJson();
    frame.key = token.value;
    frame.state = 'colon';
    return;
  }
  const value = jsonAcceptedValue(token, stack);
  if (frame.array) frame.value.push(value);
  else
    Object.defineProperty(frame.value, frame.key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  frame.state = 'comma';
}
function parseJsonReport(input) {
  const stack = [];
  let value,
    assigned = false;
  for (;;) {
    const token = jsonToken(input);
    if (stack.length) jsonFrameToken(stack[stack.length - 1], token, stack);
    else if (!assigned) {
      value = jsonAcceptedValue(token, stack);
      assigned = true;
    } else {
      if (token.type !== 'end') invalidJson();
      return value;
    }
  }
}
function readJson(file, chunkBytes = jsonChunkChars) {
  assert.ok(Number.isInteger(chunkBytes) && chunkBytes > 0 && chunkBytes <= jsonChunkChars);
  const descriptor = fs.openSync(file, 'r');
  try {
    return parseJsonReport(jsonCursor(descriptor, chunkBytes));
  } finally {
    fs.closeSync(descriptor);
  }
}
function save(name, value) {
  fs.mkdirSync(out, { recursive: true });
  writeJson(path.join(out, name + '.json'), value);
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
  jsonChunkChars,
  jsonChunks,
  jsonDigest,
  writeJson,
  readJson,
  save,
  report,
  launchOptions,
};
