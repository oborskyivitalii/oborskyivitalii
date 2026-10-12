'use strict';
// Native function factory; the producer serializes this exact authored function.
module.exports = function (api) {
  const {
    sub,
    mix,
    clamp,
    smooth,
    LOOP_MS,
    rates,
    owns,
    atmosphereState,
    cadenceFor,
    nextDeadline,
    poses,
    initialPoses,
    routeOrder,
    worldFor,
    projectedWorld,
    paintShapes,
    routePose,
    centerPose,
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
    displayedElapsed = 0,
    journey = null;
  let travelUpdate = null;
  let colors = { cyan: '#075d7b', amber: '#895710', paper: '#f8f7f3' };
  let paletteRevision = 0,
    colorFills = new Map();
  const readingPose = (name = page) => routePose(name, poses[initialPoses[name] || 'overview']);
  const effects = window.SiteEffects;
  if (effects && effects.contract !== 1) throw Error('Incompatible scene effect contract');
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
    // The old DOM can remain mounted during the centered route flight.
    // Wait for the destination mount before measuring its native endpoint.
    if (document.body.dataset.page !== page) return;
    layoutDirty = false;
    const reasons = [...layoutReasons];
    layoutReasons.clear();
    const start = window.SiteEngineProbe ? clock() : 0;
    measure();
    if (window.SiteEngineProbe)
      diagnostic('layout', { reasons, passes: layoutPasses, start, duration: clock() - start });
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
  function cameraDiagnostic(kind, planned, disposition) {
    if (!window.SiteEngineProbe || !planned) return;
    diagnostic(kind, {
      navigationId: planned.navigationId,
      from: planned.fromPage,
      to: planned.toPage,
      fromZ: planned.from.position[2],
      toZ: planned.to.position[2],
      plannedDurationMs: planned.duration,
      centerDurationMs: planned.centerDuration,
      transitDurationMs: planned.transitDuration,
      restoreDurationMs: planned.restoreDuration,
      elapsedMs: kind === 'camera-travel-cancelled' ? displayedElapsed : planned.elapsed,
      ...(disposition ? { disposition } : {}),
    });
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
      // Keep the exact displayed phase of all three stages through a pause.
      journey.elapsed = displayedElapsed;
      journey.started = false;
    }
  }
  function travelRoomIndices(travel, pose, elapsed = travel.elapsed) {
    // A replacement keeps the displayed pair while it centers the same camera.
    // Its logical source page may still be several rooms away from that paint.
    if (elapsed < travel.centerDuration && travel.fromRooms.length > 1) return travel.fromRooms;
    const targetIndex = routeOrder.indexOf(travel.toPage);
    const first = Math.min(...travel.fromRooms, targetIndex),
      last = Math.max(...travel.fromRooms, targetIndex);
    let near = first;
    while (near < last - 1 && pose.position[2] < readingPose(routeOrder[near + 1]).position[2])
      near++;
    return [near, Math.min(near + 1, routeOrder.length - 1)];
  }
  function roomVisibility(name, pose) {
    const index = routeOrder.indexOf(name),
      depth = readingPose(name).position[2],
      cameraDepth = pose.position[2];
    // Each room has zero ink at its neighboring reading anchors and full ink
    // at its own. The pair switches only where the departing weight is zero.
    // Real route anchors include their differing opening-pose depths.
    if (cameraDepth > depth) {
      if (index === 0) return 1;
      const previous = readingPose(routeOrder[index - 1]).position[2];
      return smooth(clamp((previous - cameraDepth) / (previous - depth)));
    }
    if (index === routeOrder.length - 1) return 1;
    const next = readingPose(routeOrder[index + 1]).position[2];
    return smooth(clamp((cameraDepth - next) / (depth - next)));
  }
  function visibleRooms() {
    if (!journey || journeyStage() === 'restore') {
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
    // Opening poses can cross the next cell just before restoration. Keep the
    // pair within the displayed departure rooms and intended destination.
    const names = travelRoomIndices(journey, current).map((index) => routeOrder[index]);
    const active = [...new Set(names)];
    const shapes = active.flatMap((name) => {
      const opacity = roomVisibility(name, current);
      if (opacity === 0) return [];
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
        shape.alpha *= opacity;
        if (shape.edgeAlpha !== undefined) shape.edgeAlpha *= opacity;
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
    displayedTier = detailTier;
    displayedElapsed = journey?.elapsed || 0;
    scene.dataset.phase = String(ambientTime);
    scene.dataset.camera = JSON.stringify(current);
    scene.dataset.detail = String(detailTier);
    scene.dataset.route = page;
    scene.dataset.travel = journey ? 'flying' : 'settled';
    scene.dataset.cameraStage = journeyStage();
    scene.dataset.framing = String(current.framing || 0);
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
        paintedRooms: [...new Set(geometry.map((shape) => shape.room.name))],
        roomVisibility: (!journey || journeyStage() === 'restore'
          ? [page]
          : travelRoomIndices(journey, current).map((index) => routeOrder[index])
        ).map((name) => ({ route: name, opacity: roomVisibility(name, current) })),
        ordinaryShapes: geometry.length,
        customShapes: custom.length,
      });
    }
  }
  function fail() {
    failed = true;
    cancel();
    cameraDiagnostic('camera-travel-cancelled', journey, 'failed');
    journey = null;
    delete scene.dataset.ready;
    scene.dataset.state = 'fallback';
    control.hidden = false;
    control.disabled = true;
    control.setAttribute('aria-pressed', 'false');
    control.textContent = 'Motion: unavailable';
    notifyMotion();
    reportTravel(1);
  }
  function reportTravel(progress) {
    scene.dataset.progress = String(progress);
    const update = travelUpdate;
    if (progress === 1) travelUpdate = null;
    update?.(progress);
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
      cameraDiagnostic('camera-travel-cancelled', journey, 'device-hold');
      hold = true;
      cancel();
      // A device hold completes an explicitly requested route with one still
      // destination paint. User Off/hidden/print still freeze the exact frame.
      if (arrival) {
        current = arrival;
        journey = null;
        schedule();
      }
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
    return journey ? clamp(journey.elapsed / journey.duration) : 1;
  }
  function journeyStage() {
    if (!journey) return 'settled';
    if (journey.elapsed < journey.centerDuration) return 'center';
    if (journey.elapsed < journey.centerDuration + journey.transitDuration) return 'transit';
    return 'restore';
  }
  function advanceJourney(delta, living) {
    if (!journey || !living) return;
    // Cold room preparation cannot consume the flight before its first paint.
    if (journey.started) journey.elapsed += delta;
    else journey.started = true;
    const elapsed = Math.min(journey.elapsed, journey.duration),
      centerEnd = journey.centerDuration,
      transitEnd = centerEnd + journey.transitDuration;
    if (elapsed === 0) {
      current = journey.from;
    } else if (elapsed < centerEnd) {
      current = mix(journey.from, journey.centeredFrom, smooth(elapsed / centerEnd));
    } else if (elapsed < transitEnd) {
      current = mix(
        journey.centeredFrom,
        journey.centeredTo,
        smooth((elapsed - centerEnd) / (transitEnd - centerEnd))
      );
    } else if (elapsed < journey.duration) {
      current = mix(
        journey.centeredTo,
        journey.to,
        smooth((elapsed - transitEnd) / journey.restoreDuration)
      );
    } else {
      current = journey.to;
      journey.elapsed = journey.duration;
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
      const start = clock(),
        arrived = journey && journey.elapsed === journey.duration ? journey : null;
      try {
        // Completion belongs to the actual arrival paint, never a skipped RAF.
        if (journey && journey.elapsed === journey.duration) journey = null;
        draw();
      } catch {
        cameraDiagnostic('camera-travel-cancelled', arrived, 'failed');
        fail();
        return;
      }
      const renderCost = clock() - start;
      cameraDiagnostic('camera-travel-complete', arrived, 'arrived');
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
    notifyMotion();
  }
  function motionState() {
    return {
      ready: initialized || failed,
      enabled:
        initialized &&
        !failed &&
        enabled &&
        !reduced.matches &&
        !hold &&
        !printing &&
        !document.hidden,
    };
  }
  function notifyMotion() {
    if (window.dispatchEvent)
      window.dispatchEvent(new CustomEvent('site:motion-state', { detail: motionState() }));
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
  // Native page scrolling moves reading blocks, never the scene camera.
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
    motionState,
    managesLayout: true,
    canTravel: () =>
      initialized &&
      !failed &&
      enabled &&
      !reduced.matches &&
      !hold &&
      !printing &&
      !document.hidden,
    navigate(next, animate = true, update = null, ...options) {
      if (!owns(initialPoses, next)) return;
      // Media-query state can change before its queued change event is delivered.
      if (reduced.matches && enabled) {
        enabled = false;
        cancel();
        updateControl();
      }
      const from = displayedCamera,
        sourcePage = page,
        fromRooms =
          journey && displayedElapsed < journey.centerDuration + journey.transitDuration
            ? travelRoomIndices(journey, from, displayedElapsed)
            : [routeOrder.indexOf(sourcePage)];
      page = next;
      const travelling = animate && next !== sourcePage && this.canTravel(),
        target = readingPose();
      cameraDiagnostic('camera-travel-cancelled', journey, travelling ? 'retargeted' : 'instant');
      current = from;
      const forward =
        target.position[2] === from.position[2]
          ? routeOrder.indexOf(page) > routeOrder.indexOf(sourcePage)
          : target.position[2] < from.position[2];
      scene.dataset.direction = forward ? 'forward' : 'backward';
      if (travelling) {
        // The fourth router argument remains its native landing contract;
        // the optional fifth argument carries navigation measurement identity.
        const navigationId = options[1]?.navigationId,
          centerDuration = 400,
          transitDuration = 1000,
          restoreDuration = 350;
        journey = {
          navigationId:
            Number.isSafeInteger(navigationId) && navigationId > 0 ? navigationId : null,
          fromPage: sourcePage,
          toPage: page,
          fromRooms,
          from,
          to: target,
          elapsed: 0,
          centeredFrom: centerPose(from),
          centeredTo: centerPose(target),
          // Center, depth travel and reading restoration share a fixed camera
          // budget. Direct route choices change distance, never waiting time.
          centerDuration,
          transitDuration,
          restoreDuration,
          duration: centerDuration + transitDuration + restoreDuration,
          started: false,
        };
      } else {
        journey = null;
        current = target;
      }
      scene.dataset.travel = journey ? 'flying' : 'settled';
      travelUpdate = update;
      // Prepare the bounded displayed-source/target set at its settled detail
      // before either can be painted in flight. Avoid a visible downgrade and
      // post-arrival rebuild; mobile/adaptive compact detail still applies.
      // Probe costs remain part of input-to-ready evidence.
      if (journey) {
        try {
          for (const route of new Set([
            ...fromRooms.map((index) => routeOrder[index]),
            ...travelRoomIndices(journey, from).map((index) => routeOrder[index]),
            page,
          ]))
            roomFor(route);
        } catch {
          fail();
          return;
        }
        cameraDiagnostic('camera-travel', journey);
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
    current = readingPose();
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
