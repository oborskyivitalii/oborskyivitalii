'use strict';

const http = require('node:http');
const { digest } = require('./artifact.cjs');
const { canonicalType } = require('./serve.cjs');
const diagnostic = require('./lcp-diagnostic.cjs');

// Explicit loopback counterfactual. Header changes are fixture metadata; body
// bytes remain immutable. No routing interception disables the browser cache.
async function start(artifact) {
  const requests = [];
  let truncated = false;
  const server = http.createServer((request, response) => {
    const plan = diagnostic.requestPlan(artifact.origin + request.url, request.method, artifact);
    if (requests.length >= 4096 || plan.kind !== 'artifact') {
      response.writeHead(403).end();
      if (requests.length < 4096)
        requests.push({ rejected: true, url: request.url, method: request.method });
      else truncated = true;
      return;
    }
    const body = artifact.files[plan.file],
      sha256 = digest(body),
      etag = '"' + sha256 + '"';
    const status = request.headers['if-none-match'] === etag ? 304 : 200;
    requests.push({
      file: plan.file,
      sha256,
      status,
      ifNoneMatch: request.headers['if-none-match'] || null,
    });
    response.writeHead(status, {
      'Content-Type': canonicalType(plan.file),
      'Cache-Control': 'public, max-age=600',
      ETag: etag,
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; worker-src 'none'; frame-src 'none'",
      ...(status === 200 ? { 'Content-Length': body.length } : {}),
    });
    response.end(status === 200 ? body : undefined);
  });
  await new Promise((resolve, reject) => {
    let expired = false;
    const timer = setTimeout(() => {
      expired = true;
      server.close();
      reject(Error('Cache fixture listen deadline'));
    }, 5000);
    server.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    server.listen(0, '127.0.0.1', () => {
      clearTimeout(timer);
      if (expired) server.close();
      else resolve();
    });
  });
  return {
    origin: 'http://127.0.0.1:' + server.address().port,
    requests,
    get truncated() {
      return truncated;
    },
    close: () =>
      new Promise((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

function monitor(cdp, row, origin) {
  const records = new Map();
  function record(id) {
    if (!records.has(id)) {
      if (records.size >= 4096) {
        row.error ||= 'Network evidence exceeded4096 requests';
        return {};
      }
      const item = { requestId: id };
      records.set(id, item);
      row.network.push(item);
    }
    return records.get(id);
  }
  cdp.on('Network.requestWillBeSent', (event) => {
    const item = record(event.requestId);
    Object.assign(item, { url: event.request.url, method: event.request.method });
    if (new URL(event.request.url).origin !== origin || event.request.method !== 'GET')
      row.unexpectedRequests.push({ url: event.request.url, method: event.request.method });
  });
  cdp.on('Network.requestServedFromCache', (event) => {
    record(event.requestId).servedFromCache = true;
  });
  cdp.on('Network.responseReceived', (event) => {
    Object.assign(record(event.requestId), {
      url: event.response.url,
      status: event.response.status,
      fromDiskCache: Boolean(event.response.fromDiskCache),
      fromServiceWorker: Boolean(event.response.fromServiceWorker),
      cacheControl:
        event.response.headers['Cache-Control'] || event.response.headers['cache-control'] || null,
    });
  });
}

function evidence(row) {
  return ['vitalii-oborskyi-cutout.webp', 'styles.css', 'space.js'].map((leaf) => {
    const resource = row.snapshot?.resources.find((item) =>
      new URL(item.name).pathname.endsWith('/' + leaf)
    );
    const network = row.network.filter((item) => item.url === resource?.name);
    const pathname = resource && new URL(resource.name).pathname.slice(1);
    const requests = row.serverRequests.filter((item) => item.file === pathname);
    const available = resource && resource.decodedBodySize > 0 && resource.encodedBodySize > 0;
    const corroborated =
      network.length > 0 &&
      network.every(
        (item) =>
          item.method === 'GET' &&
          [200, 304].includes(item.status) &&
          item.fromServiceWorker === false
      );
    const revalidated =
      available &&
      corroborated &&
      requests.length > 0 &&
      requests.every((item) => item.status === 304 && item.ifNoneMatch);
    const cached =
      available &&
      corroborated &&
      resource.transferSize === 0 &&
      network.some((item) => item.servedFromCache || item.fromDiskCache) &&
      requests.length === 0;
    const cold =
      available &&
      corroborated &&
      resource.transferSize > 0 &&
      network.every(
        (item) => item.status === 200 && !item.servedFromCache && !item.fromDiskCache
      ) &&
      requests.length > 0 &&
      requests.every((item) => item.status === 200);
    return {
      leaf,
      confirmed: Boolean(row.cacheMode === 'cold' ? cold : revalidated || cached),
      mechanism: revalidated
        ? '304-revalidation'
        : cached
          ? 'browser-cache'
          : cold
            ? 'full-response'
            : 'unproven',
      transferSize: resource?.transferSize ?? null,
      encodedBodySize: resource?.encodedBodySize ?? null,
      decodedBodySize: resource?.decodedBodySize ?? null,
    };
  });
}

function validate(rows) {
  const failures = [];
  if (rows.length !== 9) failures.push('expected9 document observations');
  for (let trial = 1; trial <= 3; trial++) {
    const group = rows.filter((row) => row.trial === trial);
    if (
      JSON.stringify(group.map((row) => row.cacheMode)) !==
      JSON.stringify(['cold', 'reload', 'reopen'])
    )
      failures.push('missing/incorrect dependent order in trial' + trial);
    if (
      group.some(
        (row) => !(row.snapshot?.timeOrigin > 0 && Number.isFinite(row.snapshot.timeOrigin))
      ) ||
      new Set(group.map((row) => row.snapshot?.timeOrigin)).size !== 3
    )
      failures.push('document identity reused in trial' + trial);
    for (const row of group) {
      let analysis, currentEvidence;
      try {
        analysis = diagnostic.analyze(row.snapshot);
        currentEvidence = evidence(row);
      } catch {
        failures.push('malformed cache/document evidence: ' + row.scenario + '/' + trial);
        continue;
      }
      if (
        row.error ||
        analysis.status !== 'instrumentation-valid' ||
        row.analysis?.status !== analysis.status ||
        row.unexpectedRequests.length ||
        row.consoleErrors.length ||
        !Array.isArray(row.snapshot?.errors) ||
        row.snapshot.errors.length ||
        row.serverTruncated ||
        !Array.isArray(row.serverRequests) ||
        row.serverRequests.some((item) => item.rejected) ||
        !currentEvidence.every((item) => item.confirmed) ||
        JSON.stringify(row.cacheEvidence) !== JSON.stringify(currentEvidence) ||
        row.snapshot.sdkState !== null ||
        row.snapshot.navigation?.type !== (row.cacheMode === 'reload' ? 'reload' : 'navigate')
      )
        failures.push('incomplete cache/document evidence: ' + row.scenario + '/' + trial);
    }
  }
  return {
    pass: failures.length === 0,
    failures,
    scope: 'loopback fixture runtime/cache only; no production SDK or transport',
  };
}

module.exports = { start, monitor, evidence, validate };
