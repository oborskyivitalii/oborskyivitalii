'use strict';
// Native function factory; the producer serializes this exact authored function.
module.exports = function (api) {
  const {
    sub,
    mix,
    clamp,
    LOOP_MS,
    rates,
    owns,
    atmosphereState,
    cadenceFor,
    nextDeadline,
    cameraView,
    poses,
    initialPoses,
    routeOrder,
    roomSpacing,
    worldFor,
    projectedWorld,
    paintShapes,
    routePose,
    roomOffset,
    translatePose,
  } = api;
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('space-canvas');
  const control = document.getElementById('space-motion');
  if (!canvas || !control || !window.matchMedia || !window.requestAnimationFrame) return;
  let ctx;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    return;
  }
  if (!ctx) return;
  const scene = canvas.parentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 640px)');
  let page = document.body.dataset.page;
  const key = 'vo.motion';
  let choice = null;
  try {
    choice = localStorage.getItem(key);
  } catch {
    /* In-tab controls remain useful. */
  }
  let enabled = choice !== 'off' && !reduced.matches,
    printing = false,
    pending = null,
    initialized = false,
    failed = false;
  // Deferred scripts run while readyState is interactive. Archive filtering
  // and the navigation content plane must finish before the first layout read.
  let domReady = document.readyState !== 'loading' && document.readyState !== 'interactive';
  let width = 1,
    height = 1,
    ratio = 1;
  const initial = initialPoses[page] || 'overview';
  const rooms = new Map();
  let compact = narrow.matches,
    ambientTime = 0,
    lastFrame = null,
    nextDraw = null;
  let layoutDirty = true,
    layoutReasons = new Set(['initial']),
    layoutPasses = 0;
  let idleRate = 30,
    costAverage = 0,
    costSamples = 0,
    cadenceSlow = 0,
    cadenceFast = 0,
    lastCadenceChange = 0,
    detailTier = 0,
    displayedTier = 0;
  let tier = 0,
    slow = 0,
    fast = 0,
    lastQualityChange = 0,
    hold = false;
  const clock = () => window.performance?.now() ?? Date.now();
  let current = routePose(page, poses[initial]),
    displayedTime = 0,
    displayedCamera = current,
    displayedWidth = width,
    displayedHeight = height,
    displayedCompact = compact,
    painted = false,
    displayedProgress = 0,
    journey = null;
  let travelUpdate = null;
  let travelAnchor = null;
  let travelStartedAt = 0;
  let colors = { cyan: '#075d7b', amber: '#895710', paper: '#f8f7f3' };
  let paletteRevision = 0,
    colorFills = new Map();
  const settledPose = () => routePose(page, poses[initialPoses[page] || 'overview']);
  const effects = window.SiteEffects;
  if (effects && effects.contract !== 1) throw Error('Incompatible scene effect contract');
  effects?.registerView?.(cameraView);
  const sceneEffects = effects?.scene?.(api);
  // The decorative mobile bitmap uses one physical pixel per CSS pixel.
  // Text and controls retain their native resolution; timing is independent.
  const pixelRatio = () =>
    Math.min(compact || tier === 2 ? 1 : tier === 1 ? 1.25 : 1.5, window.devicePixelRatio || 1);
  function measure() {
    const read = () => measureNative();
    if (effects?.measure) return effects.measure(read);
    return read();
  }
  function measureNative() {
    let stage = window.SiteEngineStages ? clock() : 0;
    const span = (part) => {
      if (stage) {
        const time = clock();
        diagnostic('stage', { part, start: stage, duration: time - stage });
        stage = time;
      }
    };
    layoutPasses++;
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    ratio = pixelRatio();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - height);
    window.SiteNavigation?.reconcileEndpoint?.(maxScroll);
    span('layout-range');
  }
  function flushLayout() {
    if (!initialized || !layoutDirty || failed) return;
    // During departure the engine already owns the next route, while the old
    // DOM is still shown. Its geometry cannot describe the destination.
    if (document.body.dataset.page !== page) return;
    layoutDirty = false;
    const reasons = [...layoutReasons];
    layoutReasons.clear();
    const start = window.SiteEngineProbe ? clock() : 0;
    measure();
    if (window.SiteEngineProbe)
      diagnostic('layout', { reasons, passes: layoutPasses, start, duration: clock() - start });
    // Native landing and layout belong to the router. Neither reading position
    // nor content reflow can change the route's settled camera or flight target.
    nextDraw = null;
  }
  function invalidateLayout(reason) {
    layoutDirty = true;
    layoutReasons.add(reason);
    if (failed) {
      window.SiteNavigation?.reconcileEndpoint?.();
      return;
    }
    if (!initialized) {
      initialize();
      return;
    }
    if (!failed) schedule();
  }
  // Opt-in measurements emit no timing/JSON work on an ordinary visitor path.
  function diagnostic(kind, detail) {
    window.SiteEngineProbe?.({ kind, time: clock(), page, ...detail });
  }
  function readColors() {
    const css = window.getComputedStyle(document.documentElement);
    const next = {
      cyan: css.getPropertyValue('--accent').trim(),
      amber: css.getPropertyValue('--systems').trim(),
      paper: css.getPropertyValue('--paper').trim(),
      sheet: (css.getPropertyValue('--scene-sheet') || '#fffefa').trim(),
    };
    if (!Object.values(next).every((v) => /^#[0-9a-f]{6}$/i.test(v))) return false;
    colors = next;
    paletteRevision++;
    colorFills.clear();
    return true;
  }
  function paintColors(room) {
    const start = window.SiteEngineStages ? clock() : 0;
    room.faceColors = api.facePalette(room.world.faces, colors, colorFills);
    room.paletteRevision = paletteRevision;
    if (start)
      diagnostic('stage', {
        part: 'model-color',
        route: room.name,
        start,
        duration: clock() - start,
      });
  }
  function roomFor(name, detail = compact || detailTier >= 0.5) {
    // Reduce actual model/paint work on a slow desktop as well as on mobile.
    // The same motif IDs, macro positions and recursive topology survive.
    if (!rooms.has(name)) {
      while (rooms.size >= 3) {
        const oldest = [...rooms.keys()].find((id) => id !== page && id !== name);
        rooms.delete(oldest);
      }
      rooms.set(name, new Map());
    }
    const variants = rooms.get(name);
    if (!variants.has(detail)) {
      const start = window.SiteEngineProbe ? clock() : 0;
      const room = { world: worldFor(name, detail), name, compact: detail, faceColors: [] };
      variants.set(detail, room);
      // Prepare once during the existing room work, never inside timed paint.
      if (name === 'writing') api.prepareFormula?.();
      if (window.SiteEngineStages)
        diagnostic('stage', { part: 'model-build', route: name, start, duration: clock() - start });
      paintColors(room);
      if (window.SiteEngineProbe)
        diagnostic('model', {
          route: name,
          compact: detail,
          start,
          duration: clock() - start,
          objects: room.world.objects.length,
          vertices: room.world.objects.reduce((n, o) => n + o.points.length, 0),
          faces: room.world.faces.length,
          lines: room.world.lines.length,
        });
    }
    rooms.delete(name);
    rooms.set(name, variants);
    while (rooms.size > 3) {
      const oldest = [...rooms.keys()].find((id) => id !== page && id !== name);
      rooms.delete(oldest);
    }
    const room = variants.get(detail);
    if (room.paletteRevision !== paletteRevision) paintColors(room);
    return room;
  }
  function schedule() {
    if (initialized && !failed && pending === null && !document.hidden && !printing)
      pending = window.requestAnimationFrame(frame);
  }
  function cancel() {
    if (pending !== null) window.cancelAnimationFrame(pending);
    pending = null;
    lastFrame = null;
    nextDraw = null;
    ambientTime = displayedTime;
    current = displayedCamera;
    detailTier = displayedTier;
    if (journey) {
      rebaseJourney(journey.to, displayedProgress);
      journey.started = false;
    }
  }
  function visibleRooms() {
    if (!journey) {
      const room = roomFor(page);
      const shapes = projectedWorld(
        room.world,
        translatePose(current, -roomOffset(page)),
        width,
        height,
        ambientTime,
        detailTier,
        true,
        false
      );
      for (const shape of shapes) shape.room = room;
      return shapes;
    }
    // Render at most the two rooms around the camera, including intermediate
    // rooms on a multi-page flight. Models are lazy and the cache is bounded.
    const near = Math.max(
      0,
      Math.min(routeOrder.length - 1, Math.floor((24 - current.position[2]) / roomSpacing))
    );
    const names = [routeOrder[near], routeOrder[Math.min(near + 1, routeOrder.length - 1)]];
    const active = [...new Set(names)];
    const shapes = active.flatMap((name) => {
      // Entire room envelope behind the camera cannot contribute geometry.
      const local = translatePose(current, -roomOffset(name));
      const forward = api.normalize(sub(local.target, local.position));
      if (api.dot(sub([0, 0, -48], local.position), forward) + 110 < 0.5) return [];
      const room = roomFor(name);
      return projectedWorld(
        room.world,
        translatePose(current, -roomOffset(name)),
        width,
        height,
        ambientTime,
        detailTier,
        true,
        false
      ).map((shape) => {
        shape.room = room;
        return shape;
      });
    });
    return shapes;
  }
  function draw() {
    let stage = window.SiteEngineStages ? clock() : 0;
    const span = (part) => {
      if (stage) {
        const time = clock();
        diagnostic('stage', { part, start: stage, duration: time - stage });
        stage = time;
      }
    };
    // Resize only inside the protected paint, retaining the last valid bitmap.
    const w = Math.round(width * ratio),
      h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const state = { current, width, height, ambientTime, compact, scene, detailTier };
    if (window.SiteRibbonProbe) state.journey = journey;
    const geometry = visibleRooms();
    span('draw-project');
    const custom = sceneEffects?.collect(state) || [];
    span('draw-effects');
    const shapes = geometry.concat(custom).sort((a, b) => b.depth - a.depth);
    span('draw-sort');
    paintShapes(ctx, shapes, colors, sceneEffects?.paint);
    span('draw-paint');
    const air = atmosphereState(ambientTime);
    scene.style?.setProperty('--air-x', air.x.toFixed(3) + 'px');
    scene.style?.setProperty('--air-y', air.y.toFixed(3) + 'px');
    scene.style?.setProperty('--air-light', air.light.toFixed(5));
    ctx.globalAlpha = 1;
    scene.dataset.ready = 'true';
    displayedTime = ambientTime;
    displayedCamera = current;
    displayedWidth = width;
    displayedHeight = height;
    displayedCompact = compact;
    painted = true;
    displayedTier = detailTier;
    displayedProgress = journeyProgress();
    scene.dataset.phase = String(ambientTime);
    scene.dataset.camera = JSON.stringify(current);
    scene.dataset.detail = String(detailTier);
    scene.dataset.route = page;
    scene.dataset.travel = journey ? 'flying' : 'settled';
    scene.dataset.rooms = String(rooms.size);
    scene.dataset.geometry = compact || detailTier >= 0.5 ? 'compact' : 'full';
    scene.dataset.roomModels = String(
      [...rooms.values()].reduce((count, variants) => count + variants.size, 0)
    );
    span('draw-state');
    if (window.SiteEngineProbe) {
      diagnostic('paint', {
        current,
        ambientTime,
        width,
        height,
        compact,
        detailTier,
        journey,
        ordinaryShapes: geometry.length,
        customShapes: custom.length,
      });
    }
  }
  function fail() {
    failed = true;
    cancel();
    delete scene.dataset.ready;
    scene.dataset.state = 'fallback';
    control.hidden = false;
    control.disabled = true;
    control.setAttribute('aria-pressed', 'false');
    control.textContent = 'Motion: unavailable';
    reportTravel(1);
  }
  function reportTravel(progress) {
    scene.dataset.progress = String(progress);
    const update = travelUpdate;
    if (!update) return;
    const active = enabled && !hold && !failed && !printing && !document.hidden && !reduced.matches;
    const capturedAt = clock();
    // Route notification may precede a paint or complete an unavailable scene.
    // Snapshot only the last successful paint, never a newer layout/solver state.
    // The router's callback closure owns the transaction; this adds no clock/cache.
    const pose = Object.freeze({
      position: Object.freeze([...displayedCamera.position]),
      target: Object.freeze([...displayedCamera.target]),
    });
    const projection = cameraView(pose, displayedWidth, displayedHeight, displayedCompact);
    for (const axis of ['forward', 'right', 'up', 'origin']) Object.freeze(projection[axis]);
    const completed = update(
      progress,
      Object.freeze({
        progress,
        pose,
        width: displayedWidth,
        height: displayedHeight,
        compact: displayedCompact,
        projection: Object.freeze(projection),
        anchor: travelAnchor,
        remainingMs: journey ? Math.max(0, journey.duration - journey.elapsed) : 0,
        capturedAt,
        travelElapsedMs: Math.max(0, capturedAt - travelStartedAt),
        painted,
        active,
      })
    );
    // The existing painted clock may own a bounded presentation tail after the
    // camera has settled. Legacy callbacks retain their immediate completion.
    if (progress === 1 && (completed !== false || !active) && travelUpdate === update)
      travelUpdate = null;
  }
  function adaptCadence(cost, time) {
    // Ignore the one-time initial paint for cadence estimation. Adapt to actual
    // cost before considering a slower detail tier; retain a strict mobile idle
    // share with headroom. Sustained votes/cooldown prevent threshold oscillation.
    if (costSamples++ > 0) {
      costAverage = costAverage === 0 ? cost : costAverage * 0.8 + cost * 0.2;
      const desired = cadenceFor(costAverage, compact);
      if (desired < idleRate) {
        cadenceSlow++;
        cadenceFast = 0;
      } else if (desired > idleRate && costAverage * desired < (compact ? 0.145 : 0.32) * 1000) {
        cadenceFast++;
        cadenceSlow = 0;
      } else cadenceSlow = cadenceFast = 0;
      if (cadenceSlow >= 5 && time - lastCadenceChange >= 400) {
        idleRate = desired;
        lastCadenceChange = time;
        cadenceSlow = cadenceFast = 0;
        nextDraw = null;
      } else if (cadenceFast >= 60 && time - lastCadenceChange >= 2500) {
        idleRate = rates[rates.indexOf(idleRate) - 1];
        lastCadenceChange = time;
        cadenceSlow = cadenceFast = 0;
        nextDraw = null;
      }
    }
  }
  function quality(cost, time) {
    adaptCadence(cost, time);
    scene.dataset.cadence = String(idleRate);
    if (cost > 25) {
      slow++;
      fast = 0;
    } else if (cost < 10) {
      fast++;
      slow = Math.max(0, slow - 1);
    } else {
      slow = Math.max(0, slow - 1);
      fast = 0;
    }
    if (time - lastQualityChange < 2500) return;
    if (slow >= 8 && tier < 2) {
      tier++;
      slow = fast = 0;
      lastQualityChange = time;
      ratio = pixelRatio();
    } else if (slow >= 16 && tier === 2 && cost > 50) {
      const arrival = journey?.to;
      hold = true;
      cancel();
      // A device hold completes an explicitly requested route with one still
      // destination paint. User Off/hidden/print still freeze the exact frame.
      if (arrival) {
        current = arrival;
        journey = null;
        schedule();
      } else if (travelUpdate) reportTravel(1);
      updateControl();
    } else if (fast >= 100 && tier > 0) {
      tier--;
      ratio = pixelRatio();
      slow = fast = 0;
      lastQualityChange = time;
    }
    scene.dataset.quality = hold ? 'still' : String(tier);
  }
  function journeyProgress() {
    return journey
      ? journey.progressStart +
          (1 - journey.progressStart) * clamp(journey.elapsed / journey.duration)
      : 1;
  }
  function rebaseJourney(target, progress = journeyProgress()) {
    // Pause/cancellation resumes from the actual displayed camera, preserving
    // the remaining flight duration and monotonically painted progress.
    const segment = clamp(
        (progress - journey.progressStart) / Math.max(1e-12, 1 - journey.progressStart)
      ),
      remaining = Math.max(1, journey.duration * (1 - segment));
    journey = {
      from: current,
      to: target,
      elapsed: 0,
      duration: remaining,
      progressStart: progress,
      started: journey.started,
    };
  }
  function advanceJourney(delta, living) {
    if (journey && living) {
      // A cold room preparation cannot consume the new flight before its first
      // displayed frame. Ambient time still advances on the shared RAF clock.
      if (journey.started) journey.elapsed += delta;
      else journey.started = true;
      const t = clamp(journey.elapsed / journey.duration);
      // Eased suffix of the original global progress. Cancelling its squared
      // remaining factor avoids numerical division near arrival and keeps
      // retargets moving instead of restarting smooth() at zero velocity.
      const remainder = 1 - journey.progressStart,
        v = 1 - t,
        eased = 1 - (v * v * (3 - 2 * remainder * v)) / (3 - 2 * remainder);
      current = mix(journey.from, journey.to, eased);
      if (t === 1) {
        current = journey.to;
        journey = null;
      }
    }
  }
  function frame(time) {
    pending = null;
    if (document.hidden || printing || !initialized || failed) return;
    try {
      flushLayout();
    } catch {
      fail();
      return;
    }
    const delta = lastFrame === null ? 0 : Math.min(80, Math.max(0, time - lastFrame));
    lastFrame = time;
    const living = enabled && !hold && owns(initialPoses, page);
    if (living) {
      ambientTime = (ambientTime + delta) % LOOP_MS;
      detailTier += (tier - detailTier) * (1 - Math.exp(-delta / 180));
    }
    advanceJourney(delta, living);
    // Camera response gets a temporary, cost-bounded higher cadence. Deadlines
    // retain fractional phase instead of rounding every frame down to 20/15Hz.
    const cameraRate = Math.min([30, 20, 15][tier], cadenceFor(costAverage, compact, true));
    const interval = 1000 / (journey ? Math.max(idleRate, cameraRate) : idleRate);
    if (nextDraw === null || time + 0.5 >= nextDraw || !living) {
      const start = clock();
      try {
        draw();
      } catch {
        fail();
        return;
      }
      const renderCost = clock() - start;
      // Text follows the painted camera, including skipped frames and stalls.
      if (travelUpdate) reportTravel(journeyProgress());
      nextDraw = nextDeadline(nextDraw, time, interval);
      // Decorative quality responds to rendering cost. The entire callback,
      // including route mount, is still measured by the outer frame/ready gate.
      if (living) quality(renderCost, time);
    }
    if (living && !hold) schedule();
  }
  function updateControl() {
    if (failed) return;
    control.hidden = false;
    control.disabled = reduced.matches;
    control.setAttribute('aria-pressed', String(enabled && !hold));
    control.textContent = reduced.matches
      ? 'Motion: reduced'
      : !enabled
        ? 'Motion: off'
        : hold
          ? 'Motion: still (device)'
          : 'Motion: on';
  }
  function preferenceChanged() {
    const was = enabled;
    enabled = choice !== 'off' && !reduced.matches;
    if (enabled && !was) {
      lastFrame = null;
    }
    if (!enabled) {
      if (was) cancel();
    }
    updateControl();
    schedule();
    if (window.dispatchEvent) window.dispatchEvent(new CustomEvent('site:motion-preference'));
  }
  control.addEventListener('click', () => {
    choice = enabled ? 'off' : 'on';
    if (choice === 'on' && hold) {
      hold = false;
      slow = fast = 0;
      lastFrame = null;
    }
    try {
      localStorage.setItem(key, choice);
    } catch {
      /* In-tab preference still applies. */
    }
    preferenceChanged();
  });
  const resize = () => {
    if (failed) return;
    if (compact !== narrow.matches) compact = narrow.matches;
    if (!initialized) {
      initialize();
      return;
    }
    invalidateLayout('resize');
  }; // Layout never changes a frozen camera/ambient phase or starts a flight.
  window.addEventListener('site:archive-layout', resize);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('load', resize, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancel();
    else resize();
  });
  window.addEventListener('beforeprint', () => {
    printing = true;
    cancel();
  });
  window.addEventListener('afterprint', () => {
    printing = false;
    resize();
  });
  if (reduced.addEventListener) reduced.addEventListener('change', preferenceChanged);
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      try {
        choice = localStorage.getItem(key);
      } catch {
        choice = null;
      }
      preferenceChanged();
    }
  });
  if (window.MutationObserver)
    new window.MutationObserver(() => {
      if (!initialized) {
        initialize();
        return;
      }
      if (!failed && readColors()) schedule();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const observer = window.ResizeObserver
    ? new window.ResizeObserver(() => invalidateLayout('size'))
    : null;
  const contentObserver = window.MutationObserver
    ? new window.MutationObserver(() => invalidateLayout('content'))
    : null;
  let observedMain = null;
  function observeLayout() {
    const main = document.querySelector('main');
    if (main === observedMain) return;
    observedMain = main;
    observer?.disconnect();
    contentObserver?.disconnect();
    // Body also covers an expanded footer/header. Subtree edits cover moving
    // interior waypoints even when the total main height stays unchanged.
    observer?.observe(document.body);
    observer?.observe(main);
    contentObserver?.observe(main, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['hidden', 'class', 'style', 'data-space-stop'],
    });
  }
  observeLayout();
  document.fonts?.addEventListener?.('loadingdone', resize);
  window.SiteScene = {
    managesLayout: true,
    canTravel: () =>
      initialized &&
      !failed &&
      enabled &&
      !reduced.matches &&
      !hold &&
      !printing &&
      !document.hidden,
    navigate(next, animate = true, update = null) {
      if (!owns(initialPoses, next)) return;
      travelStartedAt = clock();
      // Media-query state can change before its queued change event is delivered.
      if (reduced.matches && enabled) {
        enabled = false;
        cancel();
        updateControl();
      }
      const from = displayedCamera,
        sourcePage = page;
      page = next;
      const travelling = animate && this.canTravel(),
        target = settledPose();
      current = from;
      displayedProgress = 0;
      const forward =
        target.position[2] === from.position[2]
          ? routeOrder.indexOf(page) > routeOrder.indexOf(sourcePage)
          : target.position[2] < from.position[2];
      scene.dataset.direction = forward ? 'forward' : 'backward';
      if (travelling) {
        journey = {
          from,
          to: target,
          elapsed: 0,
          duration: Math.min(1700, 1000 + Math.abs(target.position[2] - from.position[2]) * 2),
          progressStart: 0,
          started: false,
        };
      } else {
        journey = null;
        current = target;
      }
      scene.dataset.travel = journey ? 'flying' : 'settled';
      travelUpdate = update;
      travelAnchor = null;
      // Prepare the bounded source/target working set at its settled detail
      // before either can be painted in flight. Avoid a visible downgrade and
      // post-arrival rebuild; mobile/adaptive compact detail still applies.
      // Probe costs remain part of input-to-ready evidence.
      if (journey) {
        try {
          roomFor(sourcePage);
          const root = roomFor(page).world.objects.find((object) => object.rootCenter)?.rootCenter;
          if (root) travelAnchor = Object.freeze([root[0], root[1], root[2] + roomOffset(page)]);
        } catch {
          fail();
          return;
        }
      }
      reportTravel(journey ? 0 : 1);
      observeLayout();
      nextDraw = null;
      schedule();
    },
    refresh({ sync = false, reason = 'mount' } = {}) {
      observeLayout();
      invalidateLayout(reason);
      if (sync) flushLayout();
    },
    formulaDiagnostics: () => api.formulaDiagnostics?.() || null,
    diagnostics() {
      return {
        rooms: [...rooms].map(([route, variants]) => ({
          route,
          models: [...variants].map(([compact, room]) => ({
            compact,
            serializedChars: JSON.stringify(room.world).length,
            formulaAnchors: room.world.formulas?.length || 0,
          })),
        })),
        paletteEntries: colorFills.size,
        layoutPasses,
        formula: api.formulaDiagnostics?.() || null,
      };
    },
    detachTravel() {
      travelUpdate = null;
    },
  };
  // Stylesheet load/error is authoritative, including early WebKit deferral.
  function initialize() {
    if (!domReady || initialized || failed || !readColors()) return;
    measure();
    layoutDirty = false;
    layoutReasons.clear();
    initialized = true;
    scene.dataset.state = 'active';
    updateControl();
    schedule();
  }
  const stylesheet = document.querySelector('link[rel="stylesheet"]');
  stylesheet?.addEventListener?.('load', initialize, { once: true });
  stylesheet?.addEventListener?.(
    'error',
    () => {
      if (!initialized) fail();
    },
    { once: true }
  );
  canvas.addEventListener?.('contextlost', fail);
  if (!domReady)
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        domReady = true;
        initialize();
      },
      { once: true }
    );
  initialize();
};
