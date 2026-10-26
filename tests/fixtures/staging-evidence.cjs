'use strict';
// Controlled validator fixtures. These are not browser, device or performance evidence.
const stage = require('../../tools/quality/staging-regression.cjs'),
  common = require('../../tools/quality/common.cjs'),
  colorMotion = require('../../tools/quality/color-motion-contract.cjs'),
  motion = require('../../tools/quality/motion.cjs'),
  budgets = require('../../tools/quality/budgets.json'),
  fs = require('node:fs'),
  path = require('node:path');
const clone = globalThis.structuredClone;
const target = 'https://candidate.example.invalid/author';
const variant = { id: 'base', contract: 1, fingerprint: 'd'.repeat(64) };
function manifest() {
  return {
    schema: 1,
    sourceDirty: false,
    sourceCommit: 'a'.repeat(40),
    sourceTree: 'b'.repeat(40),
    candidateCommit: 'a'.repeat(40),
    artifactDigest: 'c'.repeat(64),
    components: { variant: { ...variant }, engine: variant.fingerprint, contract: 1 },
    files: Object.fromEntries(
      [
        ...budgets.routes.map((route) => route + '.html'),
        'space.js',
        'styles.css',
        'snapshot.json',
        '.nojekyll',
      ].map((file) => [file, { sha256: 'e'.repeat(64), raw: 5000, gzip: 1000 }])
    ),
  };
}
function identity(m = manifest()) {
  return {
    schema: 1,
    sourceCommit: m.sourceCommit,
    sourceTree: m.sourceTree,
    candidateCommit: m.candidateCommit,
    artifactDigest: m.artifactDigest,
    variant: common.variant(m),
    environment: { platform: 'linux', runId: 'controlled test fixture' },
    target,
    pass: true,
  };
}
function baseState(extra = {}) {
  return {
    ready: true,
    fallback: false,
    phase: '0.1',
    camera: '0,0,0',
    h1: 1,
    overflow: false,
    paints: 4,
    callbacks: 8,
    motion: { hidden: false, disabled: false, label: 'Motion: on' },
    ...extra,
  };
}
function failureRow(selected) {
  let before = baseState(),
    after;
  const frozen = ['no-js', 'no-raf', 'no-match-media', 'css-blocked'].includes(selected.mode);
  let checks;
  if (frozen) {
    before = baseState({
      ready: false,
      fallback: true,
      paints: 0,
      callbacks: 0,
      motion: { hidden: true, disabled: true, label: 'Motion: unavailable' },
    });
    after = clone(before);
    checks = { fallback: true };
  } else if (selected.mode === 'reduced') {
    before = baseState({ motion: { hidden: false, disabled: true, label: 'Motion: reduced' } });
    after = clone(before);
    checks = { reducedFreeze: true };
  } else if (['draw-fault', 'context-loss'].includes(selected.mode)) {
    before = baseState({
      ready: false,
      fallback: true,
      motion: { hidden: false, disabled: true, label: 'Motion: unavailable' },
    });
    after = clone(before);
    checks = { boundedFailure: true, synthetic: true };
  } else {
    after = baseState({ paints: 5, callbacks: 9 });
    checks = {
      positiveProbe: true,
      ...(selected.mode === 'css-delayed' ? { beforeCSSNoPaint: true } : {}),
    };
  }
  if (selected.mode === 'css-blocked') {
    const css =
      '\n' + fs.readFileSync(path.join(common.root, 'site/engine/critical-media.css'), 'utf8');
    checks.criticalMediaJourney = {
      states: ['research', 'index', 'research', 'index'].map((page) => ({
        page,
        criticalMedia: page === 'index' ? [css] : [],
        criticalMediaOutsideHead: 0,
        portrait:
          page === 'index' ? { width: selected.width - 16, viewportWidth: selected.width } : null,
        overflow: false,
        documentPreserved: true,
      })),
      history: true,
      documentPreserved: true,
    };
  }
  return {
    ...selected,
    pass: true,
    errors: [],
    externalRequests: [],
    checks: { ...checks, evidence: { before, after } },
  };
}
function journeyRow(selected, m = manifest()) {
  const current = common.variant(m),
    normal = selected.mode === 'normal';
  return {
    ...selected,
    pass: true,
    history: true,
    motionOff: normal,
    errors: [],
    externalRequests: [],
    verifiedResponses: ['index.html', 'space.js'],
    served: budgets.routes.map((route) => ({
      route,
      status: 200,
      sha256: m.files[route + '.html'].sha256,
    })),
    discussion: { cta: true, localNavigation: true, history: true, directAnchor: true },
    rows: budgets.routes.map((route) => ({
      route,
      pass: true,
      state: {
        page: route,
        h1: 1,
        overflow: false,
        ready: normal,
        fallback: !normal,
        engine: current.fingerprint,
        variant: current.id,
        motion: {
          hidden: !normal,
          disabled: !normal,
          label: normal ? 'Motion: on' : 'Motion: unavailable',
        },
      },
      checks: [
        'exact identity',
        'heading',
        'viewport',
        'persistent shell',
        'theme control',
        normal ? 'canvas active' : 'no-canvas fallback',
      ],
      detail:
        normal && route === 'writing'
          ? ['flying', 'settled'].map((travel) => ({
              travel,
              geometry: 'compact',
              detail: 0.5,
              narrow: selected.width === 390,
              rooms: 2,
              models: 2,
            }))
          : null,
    })),
  };
}
function navigationRow(selected) {
  return {
    ...selected,
    pass: true,
    errors: [],
    checks: Object.fromEntries(
      require('../../tools/quality/navigation.cjs').checks.map((key) => [key, true])
    ),
    scrollArrivals: budgets.routes.slice(1).map((route) => ({
      route,
      end: 1000,
      start: 'reading-camera',
      samples: [0.9, 0.95, 0.99, 1].map((fraction) => ({
        fraction,
        y: 1000 * fraction,
        camera: 'reading-camera',
      })),
    })),
  };
}
function analyticsRow(selected) {
  const analytics = require('../../tools/quality/analytics-browser.cjs');
  return {
    ...selected,
    model: analytics.model,
    pass: true,
    errors: [],
    externalRequests: [],
    entryForms: selected.mode === 'enabled' ? ['canonical', 'extensionless'] : undefined,
    entryRoutes: selected.mode === 'enabled' ? analytics.entryRoutes(selected.entry) : undefined,
    checks: Object.fromEntries(analytics.checks.map((key) => [key, true])),
    readyWhileSDKPending: selected.mode === 'delayed' ? true : 'not applicable',
    vendorRequests: ['offline', 'staging'].includes(selected.mode)
      ? []
      : Array(2).fill('https://static.cloudflareinsights.com/beacon.min.js'),
  };
}
function functional(m = manifest()) {
  return {
    ...identity(m),
    kind: 'stage-functional',
    profile: 'staging',
    stageContract: 1,
    fullGate: false,
    productionEligible: false,
    elapsedMs: 1000,
    selection: stage.contract(),
    browsers: ['chromium', 'firefox'].map((engine) => ({
      engine,
      version: 'controlled fixture; not a real launch',
      executable: 'controlled fixture',
    })),
    journeys: stage.journeyCases().map((selected) => journeyRow(selected, m)),
    navigation: stage.navigationCases().map(navigationRow),
    failures: stage.failureCases().map(failureRow),
    analytics: stage.analyticsCases().map(analyticsRow),
    startupFailures: [],
  };
}
function measurement(kind, zero = ['off', 'reduced'].includes(kind), start = 0) {
  const elapsed = ['idle', 'scroll'].includes(kind) ? 4000 : 2100,
    frames = zero
      ? []
      : Array.from({ length: 12 }, (_, i) => ({
          time: start + i * 100,
          started: start + i * 100 + 10,
          duration: 10,
          painted: true,
        }));
  return {
    ...motion.summarize(
      {
        schema: 2,
        start,
        end: start + elapsed,
        elapsed,
        frames,
        longTasks: [],
        events: [],
        state: 'active',
      },
      kind
    ),
    motion: zero ? 'Motion: ' + kind : 'Motion: on',
  };
}
function flightData(to, from, phase, width = 390, slow = false) {
  const pacing = require('../../tools/quality/transition-pacing.cjs'),
    navigationId = 1,
    direction =
      require('../../site/routes.json').routes.findIndex((route) => route.id === to) >
      require('../../site/routes.json').routes.findIndex((route) => route.id === from)
        ? 'forward'
        : 'backward';
  function rowEvent(part, time, completion = false) {
    const plan = pacing.rowPlan(width, 2);
    return {
      kind: 'route-block',
      time,
      navigationId,
      direction,
      phase: part,
      stage: completion ? (part === 'departure' ? 'holding' : 'settled') : part,
      rows: 2,
      count: 2,
      ...plan,
      completedBy: completion ? 'animationend' : null,
      ...(!completion
        ? {
            observedRowSchedule: [0, 1].map((row) => {
              const order = direction === 'forward' ? row : 1 - row;
              return {
                row,
                order,
                delayMs: order * plan.rowStepMs,
                durationMs: plan.rowDurationMs,
              };
            }),
          }
        : {}),
    };
  }
  const departure = rowEvent('departure', 10),
    departed = rowEvent('departure', 10 + departure.plannedDurationMs, true),
    plan = pacing.cameraPlan(from, to),
    camera = {
      kind: 'camera-travel',
      navigationId,
      time: departed.time + 10,
      elapsedMs: 0,
      ...plan,
    },
    landed = {
      ...camera,
      kind: 'camera-travel-complete',
      time: camera.time + plan.plannedDurationMs,
      elapsedMs: plan.plannedDurationMs,
      disposition: 'arrived',
    },
    arrival = rowEvent('arrival', landed.time + 10),
    arrived = rowEvent('arrival', arrival.time + arrival.plannedDurationMs, true),
    elapsed = arrived.time + 40,
    frames = Array.from({ length: Math.floor(elapsed / 100) }, (_, i) => ({
      time: i * 100,
      started: i * 100 + 10,
      duration: slow && i === 11 ? 900 : 10,
      painted: true,
    })),
    events = [
      { kind: 'navigation-start', time: 0, navigationId, from, to },
      { kind: 'layout', time: 3, start: 2, duration: 1 },
      ...(phase === 'cold' ? [{ kind: 'model', route: to, time: 5, start: 3, duration: 2 }] : []),
      departure,
      departed,
      camera,
      landed,
      arrival,
      arrived,
      { kind: 'navigation-ready', time: elapsed, navigationId, page: to },
    ];
  return {
    schema: 2,
    start: 0,
    end: elapsed,
    elapsed,
    frames,
    longTasks: [],
    events,
    state: 'active',
    viewportWidth: width,
  };
}
function flight(to, from, phase, width = 390, slow = false) {
  return {
    from,
    to,
    width,
    rate: 4,
    ...motion.summarize(flightData(to, from, phase, width, slow), 'flight', { from, to, width }),
    setup: flightSetup(to, phase),
    errors: [],
    pass: true,
  };
}
function flightSetup(to, phase) {
  return {
    destination: to,
    phase,
    timeoutMs: 3000,
    quietMs: 200,
    status: 'settled',
    samples: [
      {
        elapsedMs: 400,
        page: 'index',
        sceneRoute: 'index',
        travel: 'settled',
        ready: true,
        hidden: false,
        motion: 'Motion: on',
        paints: 4,
        lastPreparationAgeMs: 300,
        targetCached: phase === 'warm',
      },
    ],
  };
}
function lighthouseRow(route) {
  return {
    route,
    formFactor: 'mobile',
    run: 1,
    lighthouseVersion: 'controlled fixture; not a real audit',
    fetchTime: '2026-10-07T00:00:00.000Z',
    environment: { networkUserAgent: 'controlled fixture' },
    configSettings: {
      formFactor: 'mobile',
      throttlingMethod: 'simulate',
      ...clone(budgets.lighthouse.profiles.mobile),
    },
    metrics: {
      'largest-contentful-paint': { numericValue: 2000 },
      'total-blocking-time': { numericValue: 100 },
      'cumulative-layout-shift': { numericValue: 0.05 },
    },
  };
}
function performanceReport(m = manifest()) {
  return {
    ...identity(m),
    kind: 'stage-performance',
    profile: 'staging',
    stageContract: 1,
    fullGate: false,
    productionEligible: false,
    elapsedMs: 1000,
    selection: stage.performanceContract(),
    lighthouseAggregation: 'single trial per selected route; not release medians',
    soakPerformed: false,
    retentionCycles: 0,
    browser: 'controlled fixture',
    samples: ['research', 'writing'].map((route) => ({
      route,
      width: 390,
      rate: 4,
      positiveProbe: true,
      errors: [],
      measurements: ['idle', 'scroll', 'off', 'reduced'].map((kind) => measurement(kind)),
    })),
    flights: stage.flightCases().map(({ to, from, phase }) => flight(to, from, phase)),
    lighthouse: ['research', 'writing'].map(lighthouseRow),
  };
}
function blockFlightSamples(width = 1440) {
  function unit(stage, y, row, peer = 0) {
    const plan = require('../../tools/quality/transition-pacing.cjs').rowPlan(width, 2);
    const translate = '0px ' + y + 'px',
      layer = {
        translate,
        distance: Math.sign(y) * 600 + 'px',
        nativeAnimations: [
          {
            name: 'route-block-' + (stage === 'departing' ? 'depart' : 'arrive'),
            startTime: 100,
            currentTime: 300,
            pending: false,
            playState: 'running',
            playbackRate: 1,
            timing: { delay: row * plan.rowStepMs, duration: plan.rowDurationMs },
            keyframes: [
              { computedOffset: 0, translate: stage === 'departing' ? '0px' : '0px 600px' },
              { computedOffset: 1, translate: stage === 'departing' ? '0px -600px' : '0px' },
            ],
          },
        ],
        opacity: 1,
        animation: {
          name: 'route-block-' + (stage === 'departing' ? 'depart' : 'arrive'),
          delay: row * plan.rowStepMs,
          duration: plan.rowDurationMs,
        },
      };
    return {
      stage,
      direction: 'forward',
      row,
      order: row,
      top: row === 0 ? 100 + peer * 8 : 350,
      bottom: row === 0 ? 200 + peer * 30 : 450,
      borderOwner: row === 1 ? '2' : null,
      opacity: 1,
      ink: [translate],
      paper: translate,
      paperContent: '""',
      layers: [
        clone(layer),
        clone(layer),
        ...(row === 1
          ? [
              {
                ...clone(layer),
                separator: 'bottom',
                separatorSource: 'unit',
                borderOwner: '2',
                separatorPaint: { width: 1, length: 300, style: 'solid', color: 'rgb(20, 30, 40)' },
              },
            ]
          : []),
      ],
    };
  }
  const units = (stage, y) => [unit(stage, y, 0), unit(stage, y, 0, 1), unit(stage, y, 1)];
  return [
    { stage: 'departing', cameraStage: 'settled', framing: 0, units: units('departing', -20) },
    { stage: 'departing', cameraStage: 'settled', framing: 0, units: units('departing', -100) },
    { stage: 'holding', cameraStage: 'center', framing: 0.5, units: [] },
    { stage: 'holding', cameraStage: 'transit', framing: 1, units: [] },
    { kind: 'mount', stage: 'holding', cameraStage: 'transit', framing: 1, units: [] },
    { stage: 'holding', cameraStage: 'restore', framing: 0.5, units: [] },
    { stage: 'arriving', cameraStage: 'settled', framing: 0, units: units('arriving', 100) },
    { stage: 'arriving', cameraStage: 'settled', framing: 0, units: units('arriving', 20) },
  ].map((sample, i) => ({
    kind: 'progress',
    progress: i / 8,
    opacity: 1,
    viewportWidth: width,
    transform: 'none',
    borderSources:
      sample.stage === 'departing' || sample.stage === 'arriving'
        ? [{ sides: [{ owner: '2', side: 'bottom', color: 'rgba(0, 0, 0, 0)' }] }]
        : [],
    ...sample,
  }));
}
function fixedHome() {
  const model = require('../../docs/space.js'),
    start = JSON.stringify(model.routePose('index', model.poses[model.initialPoses.index]));
  return {
    scroll: {
      label: 'selected-responses',
      end: 1000,
      start,
      samples: [0.9, 0.95, 0.99, 1].map((fraction) => ({
        fraction,
        y: fraction * 1000,
        camera: start,
      })),
    },
  };
}
function edgeInputs() {
  return [
    ['index', 'research', 1],
    ['research', 'writing', 1],
    ['writing', 'research', -1],
  ].map(([from, to, direction]) => ({
    from,
    to,
    preparation: {
      direction,
      policy: { budgetMs: 900, stableMs: 180, tolerancePx: 2 },
      elapsedMs: 900,
      stableMs: 800,
      range: 1000,
      y: direction < 0 ? 0 : 1000,
      corrections: 1,
      samples: 58,
      changes: [{ t: 900, range: 1000, y: direction < 0 ? 0 : 1000 }],
    },
  }));
}
function colorReport(manifest) {
  const motionContract = colorMotion.select(manifest);
  return {
    ...identity(manifest),
    motionContract,
    kind: 'color-preview-smoke',
    profile: 'preview',
    smoke: true,
    fullGate: false,
    browsers: [{ engine: 'chromium', version: 'controlled fixture' }],
    rows: [1440, 390].map((width) => ({
      engine: 'chromium',
      width,
      theme: 'light',
      pass: true,
      identity: { id: 'color', engine: common.variant(manifest).fingerprint },
      motionContract: clone(motionContract),
      ribbons: { sceneHook: 'undefined', dataset: {} },
      paint: { completed: 2, ordinaryShapes: 12, customShapes: 0 },
      edgeInputs: edgeInputs(),
      checks: Object.fromEntries(
        [
          'shortenedHomeRange',
          'homeForwardEdge',
          'blockFlight',
          'forwardEdge',
          'reverseNativeBottom',
          'disabledEdge',
          'creditsBoundary',
          'homeBoundary',
          'retiredReadingEffectAbsent',
        ].map((key) => [key, true])
      ),
      home: fixedHome(),
      flight: blockFlightSamples(width),
    })),
  };
}
function aggregateFixture(color = false) {
  const m = manifest();
  if (color) {
    const runtime = colorMotion.reviewedRuntime('fixed-plain');
    m.variant = runtime.variant;
    m.components = { variant: runtime.variant, engine: runtime.variant.fingerprint, contract: 1 };
    for (const [name, sha256] of Object.entries(runtime.files))
      for (const file of [name, 'runtime/' + runtime.variant.fingerprint + '/' + name])
        m.files[file] = { ...(m.files[file] || { raw: 5000, gzip: 1000 }), sha256 };
  }
  const host = {
    ...identity(m),
    kind: 'hosted',
    profile: 'staging',
    root: true,
    actual404: true,
    redirectsStayWithinSite: true,
    rows: Object.keys(m.files)
      .filter((file) => file !== '.nojekyll')
      .map((file) => ({
        file,
        status: 200,
        sha256: m.files[file].sha256,
        url: target + '/' + file,
        mime: file.endsWith('.html')
          ? 'text/html'
          : file.endsWith('.js')
            ? 'application/javascript'
            : file.endsWith('.css')
              ? 'text/css'
              : 'application/json',
      })),
  };
  const scan = (kind, detail) => ({ ...identity(m), kind, detail });
  const reports = [
    host,
    scan('lint', {
      scannedFiles: 10,
      tools: {
        eslint: 'controlled fixture',
        stylelint: 'controlled fixture',
        ruff: 'controlled fixture',
      },
    }),
    scan('security', {
      semgrep: { files: ['space.js'], rules: 7, errors: 0 },
      bandit: { loc: 10, findings: 0 },
      secrets: { trackedTextFiles: 10 },
    }),
    scan('advisories', {
      feedDate: '2026-10-07',
      npm: {},
      pythonDependencies: 10,
      runtimeDependencies: 'none',
    }),
    functional(m),
    performanceReport(m),
    ...(color ? [colorReport(m)] : []),
  ];
  return {
    manifest: m,
    sizes: {
      pass: true,
      artifactDigest: m.artifactDigest,
      files: m.files,
      rows: budgets.routes.map((route) => ({
        route,
        ...m.files[route + '.html'],
        svgNodes: 100,
        totalGzipBytes: 10000,
      })),
    },
    reports,
    jobs: Object.fromEntries(
      ['build', 'static', 'host', 'staging'].map((job) => [job, { result: 'success' }])
    ),
    hostedURL: target,
    profile: 'staging',
    sourceChecks: 'success',
  };
}
function contentFixture(f = aggregateFixture(false)) {
  const content = require('../../tools/quality/content-gate.cjs');
  f.manifest.components.articles = {};
  f.manifest.contentRelease = {
    schema: 1,
    kind: 'content-release',
    lane: 'content',
    engine: f.manifest.components.variant?.baseEngine || f.manifest.components.engine,
    builtRoutes: ['talks'],
    reusedRoutes: ['index', 'research', 'writing', 'credits'],
    builtArticles: [],
    reusedArticles: [],
    platformFiles: Object.fromEntries(
      ['a.js', 'b.js', 'c.js', 'd.js', 'e.js', 'styles.css'].map((name) => [name, 'f'.repeat(64)])
    ),
    trustedBaseline: { sourceCommit: 'a'.repeat(40), sourceTree: 'b'.repeat(40) },
    admission: {
      schema: 1,
      kind: 'accepted-content-baseline',
      mergedSource: 'c'.repeat(40),
      gateSha256: 'd'.repeat(64),
      authentication: {
        kind: 'accepted-staging-source',
        pass: true,
        sourceCommit: 'a'.repeat(40),
        sourceTree: 'b'.repeat(40),
        mergedSource: 'c'.repeat(40),
      },
    },
  };
  const historyRecord = {
    kind: 'accepted-content-history',
    pass: true,
    accepted: 'c'.repeat(40),
    protectedMain: 'c'.repeat(40),
    candidate: f.manifest.sourceCommit,
    commits: [{ commit: f.manifest.sourceCommit, parent: 'c'.repeat(40), lane: 'content' }],
    repositoryCommits: [],
    repositoryMerges: [],
  };
  const historyIdentity = require('../../tools/quality/delivery-json.cjs');
  f.manifest.contentRelease.admission.history = {
    ...historyRecord,
    digest: historyIdentity.digest(historyIdentity.canonical(historyRecord)),
  };
  const identity = f.reports.find((report) => report.kind === 'stage-functional');
  f.reports = f.reports.filter((report) =>
    ['hosted', 'lint', 'security', 'advisories'].includes(report.kind)
  );
  for (const report of f.reports.filter((row) => row.kind !== 'hosted')) {
    report.target = null;
    report.environment.runId = '1';
    report.environment.attempt = '1';
  }
  f.reports.push({
    ...identity,
    kind: 'content-functional',
    profile: 'staging',
    contentContract: 1,
    browser: 'Controlled fixture; not an observed browser',
    elapsedMs: 1,
    policy: content.policy,
    platformRegression: 'inherited; not rerun',
    articles: undefined,
    media: [],
    rows: content.cases(f.manifest).map((selected) => ({
      ...selected,
      pass: true,
      status: 200,
      sha256: f.manifest.files[selected.file].sha256,
      h1: 1,
      overflow: false,
      imagesDecoded: true,
      ...(selected.file === 'writing.html' &&
      selected.mode === 'normal' &&
      f.manifest.files['publication-index.json']
        ? { tagFilter: true }
        : {}),
      errors: [],
    })),
  });
  return f;
}

module.exports = {
  target,
  variant,
  manifest,
  identity,
  baseState,
  failureRow,
  journeyRow,
  navigationRow,
  analyticsRow,
  functional,
  measurement,
  flight,
  flightData,
  flightSetup,
  lighthouseRow,
  performanceReport,
  blockFlightSamples,
  colorReport,
  edgeInputs,
  aggregateFixture,
  contentFixture,
};
