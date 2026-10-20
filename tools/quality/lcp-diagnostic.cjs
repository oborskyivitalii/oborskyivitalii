'use strict';

// Opt-in diagnosis. None of these observations grant staging/release admission.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { digest, entries } = require('./artifact.cjs');

function loadArtifact(directory, archiveFile, packageFile) {
  const archive = JSON.parse(fs.readFileSync(archiveFile, 'utf8'));
  assert.equal(archive.kind, 'production-archive');
  assert.match(archive.sourceCommit, /^[a-f0-9]{40}$/);
  assert.match(archive.sourceTree, /^[a-f0-9]{40}$/);
  assert.equal(archive.public.sourceCommit, archive.sourceCommit, 'embedded source commit');
  assert.equal(archive.public.candidateCommit, archive.sourceCommit, 'embedded candidate commit');
  assert.equal(archive.public.sourceTree, archive.sourceTree, 'embedded source tree');
  assert.equal(archive.public.sourceDirty, false, 'archive source must be clean');
  assert.equal(archive.public.artifactDigest, archive.publicDigest, 'embedded artifact digest');
  assert.equal(digest(fs.readFileSync(packageFile)), archive.packageDigest, 'archive package hash');
  assert.equal(
    digest(JSON.stringify(archive.public.files)),
    archive.publicDigest,
    'public manifest hash'
  );
  const files = Object.fromEntries(entries(directory).map((row) => [row.path, row.bytes]));
  assert.deepEqual(
    Object.keys(files).sort(),
    Object.keys(archive.public.files).sort(),
    'exact inventory'
  );
  for (const [file, bytes] of Object.entries(files)) {
    assert.equal(digest(bytes), archive.public.files[file].sha256, 'artifact bytes: ' + file);
    assert.equal(bytes.length, archive.public.files[file].raw, 'artifact length: ' + file);
  }
  const revision = JSON.parse(files['site-revision.json']);
  assert.equal(revision.edition.id, 'production');
  assert.equal(revision.edition.origin, 'https://vitaliioborskyi.ai');
  return { archive, files, origin: revision.edition.origin, directory: path.resolve(directory) };
}

function requestPlan(url, method, artifact) {
  const parsed = new URL(url);
  if (
    parsed.pathname === '/cdn-cgi/rum' &&
    method === 'POST' &&
    [artifact.origin, 'https://cloudflareinsights.com'].includes(parsed.origin)
  )
    return { kind: 'telemetry', forward: false };
  if (method !== 'GET') return { kind: 'blocked', forward: false };
  if (url === 'https://static.cloudflareinsights.com/beacon.min.js')
    return { kind: 'sdk', forward: false };
  if (parsed.origin !== artifact.origin) return { kind: 'blocked', forward: false };
  const file = parsed.pathname === '/' ? 'index.html' : parsed.pathname.slice(1);
  if (!Object.hasOwn(artifact.files, file)) return { kind: 'blocked', forward: false };
  return { kind: 'artifact', file, forward: false };
}

// Serialized by Playwright before the document's first script, with no imports.
function observeDocument() {
  const maximum = 2048;
  const state = {
    schema: 1,
    timeOrigin: performance.timeOrigin,
    initialPath: location.pathname,
    initialVisibility: document.visibilityState,
    lcp: [],
    paints: [],
    longTasks: [],
    events: [],
    errors: [],
    truncated: false,
    sceneReadyMs: null,
    supported: PerformanceObserver.supportedEntryTypes,
  };
  function append(name, value) {
    if (state[name].length < maximum) state[name].push(value);
    else state.truncated = true;
  }
  function selector(element) {
    if (!element) return null;
    return (
      element.tagName.toLowerCase() +
      (element.id ? '#' + element.id : '') +
      [...element.classList].map((value) => '.' + value).join('')
    );
  }
  for (const [type, name] of [
    ['largest-contentful-paint', 'lcp'],
    ['paint', 'paints'],
    ['longtask', 'longTasks'],
  ]) {
    if (!state.supported.includes(type)) continue;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        append(name, {
          ...entry.toJSON(),
          ...(type === 'largest-contentful-paint' ? { selector: selector(entry.element) } : {}),
          observedAtMs: performance.now(),
          observedPath: location.pathname,
        });
    });
    observer.observe({ type, buffered: true });
  }
  function event(value) {
    append('events', {
      type: value.type,
      time: performance.now(),
      path: location.pathname,
      visibility: document.visibilityState,
      persisted: value.persisted ?? null,
    });
  }
  for (const type of [
    'pageshow',
    'pagehide',
    'popstate',
    'load',
    'keydown',
    'pointerdown',
    'wheel',
  ])
    addEventListener(type, event, { capture: true, passive: true });
  document.addEventListener('visibilitychange', event);
  document.addEventListener(
    'DOMContentLoaded',
    (value) => {
      event(value);
      const scene = document.querySelector('.space-scene');
      if (!scene) return;
      const probe = () => {
        if (scene.dataset.ready === 'true') {
          state.sceneReadyMs = performance.now();
          observer.disconnect();
        }
      };
      const observer = new MutationObserver(probe);
      observer.observe(scene, { attributes: true, attributeFilter: ['data-ready'] });
      probe();
    },
    { once: true }
  );
  addEventListener('error', (value) => append('errors', String(value.message || 'resource error')));
  addEventListener('unhandledrejection', (value) => append('errors', String(value.reason)));
  window.__siteLCPDiagnostic = () => ({
    ...state,
    path: location.pathname,
    capturedAtMs: performance.now(),
    navigation: performance.getEntriesByType('navigation')[0]?.toJSON() || null,
    resources: performance.getEntriesByType('resource').map((entry) => entry.toJSON()),
    scene: { ...document.querySelector('.space-scene')?.dataset },
    sdkState: document.getElementById('site-cloudflare-beacon')?.dataset || null,
  });
}

function analyze(snapshot) {
  assert.equal(snapshot.schema, 1);
  assert.ok(Array.isArray(snapshot.lcp) && Array.isArray(snapshot.resources));
  const candidate = snapshot.lcp.at(-1);
  if (!candidate) return { status: 'inconclusive', reason: 'No LCP candidate', reproduced: null };
  assert.ok(Number.isFinite(candidate.startTime) && candidate.startTime >= 0, 'finite LCP');
  const navigation = snapshot.navigation;
  const resource = candidate.url
    ? snapshot.resources.find((row) => row.name === candidate.url)
    : null;
  const timingValid =
    navigation &&
    Number.isFinite(navigation.responseStart) &&
    navigation.responseStart > 0 &&
    (!candidate.url ||
      (resource &&
        Number.isFinite(resource.requestStart) &&
        resource.requestStart > 0 &&
        Number.isFinite(resource.responseEnd) &&
        resource.responseEnd > 0));
  const firstInput = snapshot.events.find((row) =>
    ['keydown', 'pointerdown', 'wheel'].includes(row.type)
  );
  const initiallyVisible = snapshot.initialVisibility === 'visible';
  const result = {
    status:
      !snapshot.truncated && initiallyVisible && timingValid
        ? 'instrumentation-valid'
        : 'incomplete',
    reproduced: candidate.startTime > 4000,
    lcpMs: candidate.startTime,
    selector: candidate.selector,
    candidateCount: snapshot.lcp.length,
    initialPath: snapshot.initialPath,
    currentPath: snapshot.path,
    attribution: 'initial document; not a new LCP for later routes',
    firstInputMs: firstInput?.time ?? null,
    sceneReadyMs: snapshot.sceneReadyMs,
    missing: [
      !navigation || !Number.isFinite(navigation.responseStart) || navigation.responseStart <= 0
        ? 'navigation'
        : null,
      candidate.url && (!resource || !(resource.responseEnd > 0)) ? 'resource' : null,
      candidate.url &&
      (!resource || !Number.isFinite(resource.requestStart) || resource.requestStart <= 0)
        ? 'resource request start'
        : null,
      !initiallyVisible ? 'initial visibility' : null,
      snapshot.truncated ? 'truncated collector' : null,
    ].filter(Boolean),
    breakdown: null,
    availableTimings: {
      lcpMs: candidate.startTime,
      ttfbMs: navigation?.responseStart ?? null,
      resourceRequestStartMs: resource?.requestStart ?? null,
      resourceResponseEndMs: resource?.responseEnd ?? null,
    },
    longTasksBeforeLCP: snapshot.longTasks.filter((row) => row.startTime < candidate.startTime),
  };
  if (timingValid) {
    const ttfb = navigation.responseStart;
    const resourceStart = resource ? resource.requestStart : ttfb;
    const resourceEnd = resource ? resource.responseEnd : ttfb;
    result.breakdown = {
      ttfbMs: ttfb,
      resourceDelayMs: resourceStart - ttfb,
      resourceLoadMs: resourceEnd - resourceStart,
      renderDelayMs: candidate.startTime - resourceEnd,
    };
    if (Object.values(result.breakdown).some((value) => !Number.isFinite(value) || value < 0)) {
      result.status = 'incomplete';
      result.missing.push('inconsistent timing order');
      result.breakdown = null;
    }
  }
  return result;
}

function validateCalibration(rows) {
  const expected = ['baseline', 'resource-delay', 'main-thread-stall', 'missing-timing'];
  assert.equal(rows.length, expected.length * 3, 'all predefined calibration trials');
  const grouped = Object.fromEntries(
    expected.map((id) => [id, rows.filter((row) => row.control === id)])
  );
  const baselineLCP = grouped.baseline
    .map((row) => analyze(row.snapshot).lcpMs)
    .sort((a, b) => a - b)[1];
  for (const id of expected) {
    assert.deepEqual(grouped[id].map((row) => row.trial).sort(), [1, 2, 3], 'unique trials: ' + id);
    for (const row of grouped[id]) {
      assert.ok(!row.error && !row.unexpectedRequests.length, 'clean controlled browser');
      const result = analyze(row.snapshot);
      if (id === 'missing-timing') {
        assert.equal(result.status, 'incomplete');
        assert.equal(result.breakdown, null);
      } else {
        assert.equal(result.status, 'instrumentation-valid');
        if (id === 'baseline')
          assert.ok(result.lcpMs < 1000, 'controlled baseline must be healthy');
        if (id === 'resource-delay') {
          assert.ok(result.breakdown.resourceLoadMs >= 1700, 'injected resource delay');
          assert.ok(result.lcpMs - baselineLCP >= 1700, 'resource injection shifts LCP');
        }
        if (id === 'main-thread-stall') {
          assert.ok(
            result.longTasksBeforeLCP.some(
              (task) => task.duration >= 1700 && task.startTime + task.duration <= result.lcpMs + 50
            ),
            'injected long task'
          );
          assert.ok(result.breakdown.renderDelayMs >= 1700, 'stall injection delays render');
          assert.ok(result.lcpMs - baselineLCP >= 1700, 'stall injection shifts LCP');
        }
      }
    }
  }
  return {
    pass: true,
    trials: rows.length,
    scope: 'instrumentation calibration, not site performance',
  };
}

function sdkPayloads(beacons) {
  return beacons.flatMap((row) => {
    try {
      return [{ path: row.path, payload: JSON.parse(row.body) }];
    } catch {
      return [{ path: row.path, unparsed: true, bytes: row.body.length }];
    }
  });
}

module.exports = {
  loadArtifact,
  requestPlan,
  observeDocument,
  analyze,
  validateCalibration,
  sdkPayloads,
};
