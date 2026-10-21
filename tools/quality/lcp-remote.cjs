'use strict';

// One opt-in hosted acquisition and the existing replay suite. No live site visit.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const diagnostic = require('./lcp-diagnostic.cjs');
const runner = require('./lcp-browser.cjs');
const { digest } = require('./artifact.cjs');

const SDK = 'https://static.cloudflareinsights.com/beacon.min.js';
const MAXIMUM = 128 * 1024 * 1024;
const AAD = Buffer.from('issue112-private-evidence-v1');

async function download(url, maximum, fetcher = fetch, redirects = 'error') {
  const response = await fetcher(url, {
    redirect: redirects,
    signal: AbortSignal.timeout(30000),
  });
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body || []) {
    size += chunk.length;
    assert.ok(size <= maximum, 'Response exceeds bounded acquisition size');
    chunks.push(Buffer.from(chunk));
  }
  return {
    body: Buffer.concat(chunks),
    status: response.status,
    url: response.url || url,
    headers: Object.fromEntries(response.headers),
  };
}

function admitSDK(response) {
  assert.equal(response.url, SDK, 'Canonical SDK URL required');
  assert.equal(response.status, 200, 'SDK200 required');
  const mime = (response.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  assert.ok(['application/javascript', 'text/javascript'].includes(mime), 'SDK JavaScript MIME');
  assert.ok(response.body.length >= 1024 && response.body.length <= 1024 * 1024, 'SDK size');
  // Match the production loader's module grammar without executing vendor code.
  cp.execFileSync(process.execPath, ['--check', '--input-type=module'], {
    input: response.body,
    timeout: 5000,
    maxBuffer: 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return { url: SDK, status: 200, sha256: digest(response.body), bytes: response.body.length };
}

async function acquireSDK(output, fetcher = fetch) {
  const receipt = { url: SDK, requestedAtUTC: new Date().toISOString(), attempts: 1 };
  try {
    const response = await download(SDK, 1024 * 1024, fetcher);
    Object.assign(receipt, {
      receivedAtUTC: new Date().toISOString(),
      status: response.status,
      finalURL: response.url,
      headers: response.headers,
      bytes: response.body.length,
      sha256: digest(response.body),
    });
    fs.writeFileSync(path.join(output, 'beacon.min.js'), response.body);
    Object.assign(receipt, admitSDK(response), { admitted: true });
  } catch (error) {
    receipt.admitted = false;
    receipt.error = error.stack;
  }
  fs.writeFileSync(path.join(output, 'sdk.json'), JSON.stringify(receipt, null, 2) + '\n');
  return receipt;
}

function seal(bytes, publicKey) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length <= MAXIMUM, 'Bounded evidence buffer');
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
  cipher.setAAD(AAD);
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  const wrapped = crypto.publicEncrypt(
    { key: publicKey, oaepHash: 'sha256', padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    key
  );
  return {
    schema: 1,
    kind: AAD.toString(),
    recipientSHA256: digest(
      crypto.createPublicKey(publicKey).export({ type: 'spki', format: 'der' })
    ),
    wrappedKey: wrapped.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

function unseal(envelope, privateKey) {
  assert.equal(envelope.schema, 1);
  assert.equal(envelope.kind, AAD.toString());
  const recipient = crypto.createPublicKey(privateKey).export({ type: 'spki', format: 'der' });
  assert.equal(envelope.recipientSHA256, digest(recipient), 'Wrong evidence recipient');
  assert.ok(envelope.ciphertext.length <= Math.ceil(MAXIMUM / 3) * 4, 'Bounded ciphertext');
  const key = crypto.privateDecrypt(
    { key: privateKey, oaepHash: 'sha256', padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(envelope.wrappedKey, 'base64')
  );
  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  assert.equal(iv.length, 12, 'Exact12-byte evidence IV required');
  assert.equal(tag.length, 16, 'Exact16-byte evidence tag required');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
  decipher.setAAD(AAD);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
    decipher.final(),
  ]);
}

function privateDirectory(directory, root) {
  fs.mkdirSync(directory, { recursive: true });
  const actual = fs.realpathSync(directory);
  const source = fs.realpathSync(root);
  assert.ok(
    actual !== source && !actual.startsWith(source + path.sep),
    'Private output outside git'
  );
  return actual;
}

async function capture(directory) {
  const root = path.resolve(__dirname, '../..');
  const output = privateDirectory(path.resolve(directory), root);
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'lcp-remote.json')));
  const receipt = {
    schema: 1,
    kind: 'remote-sdk-replay',
    capturedAtUTC: new Date().toISOString(),
    diagnosticCommit: cp
      .execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' })
      .trim(),
    runId: process.env.GITHUB_RUN_ID || null,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT || null,
    workflowRef: process.env.GITHUB_WORKFLOW_REF || null,
    workflowSHA: process.env.GITHUB_WORKFLOW_SHA || null,
    eventMergeSHA: process.env.GITHUB_SHA || null,
    productionBrowserVisits: 0,
    transport: 'production-origin exact-byte replay; no real CDN or native desktop claim',
    sdkAcquisition: null,
    suiteAttempted: false,
    actualCWVAdmission: 'pending independent payload and same-navigation review',
  };
  try {
    assert.equal(
      digest(crypto.createPublicKey(config.publicKey).export({ type: 'spki', format: 'der' })),
      config.recipientSHA256,
      'Expected private evidence recipient'
    );
    assert.equal(receipt.diagnosticCommit, process.env.SITE_CANDIDATE_SHA, 'Exact raw PR head');
    assert.equal(
      cp.execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim(),
      '',
      'Clean capture source'
    );
    assert.equal(process.env.GITHUB_RUN_ATTEMPT, '1', 'No automatic replay of this capture');
    const input = privateDirectory(path.join(output, 'input'), root);
    for (const [name, expected] of Object.entries(config.releaseFiles)) {
      const response = await download(
        config.releaseURL + '/' + name,
        8 * 1024 * 1024,
        fetch,
        'follow'
      );
      assert.equal(response.status, 200, 'Release asset200');
      assert.equal(digest(response.body), expected, 'Pinned release asset: ' + name);
      fs.writeFileSync(path.join(input, name), response.body);
    }
    cp.execFileSync('tar', ['-xzf', path.join(input, 'public.tar.gz'), '-C', input], {
      timeout: 15000,
    });
    const publicDirectory = path.join(input, 'public');
    const artifact = diagnostic.loadArtifact(
      publicDirectory,
      path.join(input, 'archive.json'),
      path.join(input, 'public.tar.gz')
    );
    assert.equal(artifact.archive.sourceCommit, config.productionCommit);
    assert.equal(artifact.archive.sourceTree, config.productionTree);
    assert.equal(artifact.archive.publicDigest, config.publicDigest);
    receipt.archiveAdmitted = Object.keys(artifact.files).length;
    receipt.sdkAcquisition = await acquireSDK(output);
    assert.equal(
      receipt.sdkAcquisition.admitted,
      true,
      'SDK acquisition blocked; no browser suite'
    );
    receipt.suiteAttempted = true;
    const report = await runner.run({
      suite: 'sdk',
      public: publicDirectory,
      archive: path.join(input, 'archive.json'),
      package: path.join(input, 'public.tar.gz'),
      sdk: path.join(output, 'beacon.min.js'),
      'sdk-metadata': path.join(output, 'sdk.json'),
      tools: process.env.SITE_AUDIT_TOOLS || path.join(__dirname, 'toolchain'),
      output: path.join(output, 'suite'),
      windowMs: 30000,
    });
    receipt.suiteCollected = report.collectionComplete;
    receipt.executed = report.rows.length;
    receipt.unexecuted = report.unexecuted.length;
    assert.equal(report.collectionComplete, true, 'Incomplete remote suite');
  } catch (error) {
    receipt.error = error.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(path.join(output, 'remote.json'), JSON.stringify(receipt, null, 2) + '\n');
  }
}

function packageEvidence(directory, destination, publicKey, outcome = null) {
  const root = path.resolve(__dirname, '../..');
  const output = privateDirectory(path.resolve(directory), root);
  const sealed = privateDirectory(path.resolve(destination), root);
  assert.ok(
    !sealed.startsWith(output + path.sep) && sealed !== output,
    'Separate sealed destination'
  );
  if (outcome) {
    fs.writeFileSync(
      path.join(output, 'hosted-outcome.json'),
      JSON.stringify(
        {
          outcome,
          retainedAtUTC: new Date().toISOString(),
          cleanup:
            'known only if explicitly retained by the runner; interruption can leave it unknown',
        },
        null,
        2
      ) + '\n'
    );
  }
  const archive = cp.execFileSync('tar', ['-czf', '-', '-C', output, '.'], {
    maxBuffer: MAXIMUM,
    timeout: 30000,
  });
  fs.writeFileSync(
    path.join(sealed, 'capture.sealed.json'),
    JSON.stringify(seal(archive, publicKey)) + '\n'
  );
}

async function main(args) {
  if (args[0] === 'capture' && args.length === 2) await capture(args[1]);
  else if (args[0] === 'seal' && args.length === 3) {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'lcp-remote.json')));
    packageEvidence(
      args[1],
      args[2],
      config.publicKey,
      process.env.LCP_OBSERVATION_OUTCOME || null
    );
  } else if (args[0] === 'unseal' && args.length === 4) {
    const bytes = unseal(JSON.parse(fs.readFileSync(args[1])), fs.readFileSync(args[2]));
    fs.writeFileSync(args[3], bytes, { mode: 0o600, flag: 'wx' });
  } else
    throw Error('Usage: lcp-remote.cjs capture DIR | seal RAW SEALED | unseal INPUT KEY OUTPUT');
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(() => {
    process.stderr.write('Remote diagnostic failed; inspect privately retained evidence.\n');
    process.exitCode = 1;
  });
}
module.exports = {
  download,
  admitSDK,
  acquireSDK,
  seal,
  unseal,
  privateDirectory,
  packageEvidence,
};
