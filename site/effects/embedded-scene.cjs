'use strict';
// Bounded viewport owners share the scene camera, clock and disposal identity.
module.exports = function (api, { fragmentPlan, embeddedPlan, embeddedTexture }) {
  const geometry = fragmentPlan({ cameraView: api.cameraView });
  const solids = embeddedPlan({
    cameraView: api.cameraView,
    depthVisibility: api.depthVisibility,
  });
  const textures = embeddedTexture();
  const sceneSettings = Object.freeze({
    routes: Object.freeze(['index', 'research']),
    durationMs: geometry.settings.arrivalDurationMs,
    handoffFraction: 0.1,
    restDepth: 32,
    prototypePieces: Object.freeze({ full: 12, compact: 8 }),
  });
  let generation = 0;
  let incoming = null;
  let outgoing = null;
  let state = null;
  let phase = null;
  let started = 0;
  let progress = 0;
  let departureProgress = 0;
  let handoff = 0;
  let pending = null;
  let pendingRoute = null;
  let queuedPrime = null;
  let faces = [];
  let departureFaces = [];
  let hidden = [];
  const surfaces = new Map();
  const clamp = (amount) => Math.max(0, Math.min(1, amount));
  const nativeRect = (rect) => ({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  });
  const caps = () => geometry.settings.caps[state?.compact ? 'compact' : 'full'];
  const paired = (from, to) =>
    from !== to && sceneSettings.routes.includes(from) && sceneSettings.routes.includes(to);
  function restore() {
    for (const { owner, visibility, opacity } of hidden) {
      if (visibility) owner.style.visibility = visibility;
      else owner.style.removeProperty('visibility');
      if (opacity) owner.style.opacity = opacity;
      else owner.style.removeProperty('opacity');
    }
    hidden = [];
  }
  function dispose(session) {
    if (!session || session.disposed) return;
    session.disposed = true;
    for (const group of session.groups) {
      group.asset.dispose();
      surfaces.delete(group.key);
    }
  }
  function cancel() {
    const active = phase !== null;
    generation++;
    pending?.abort();
    pending = null;
    pendingRoute = null;
    queuedPrime = null;
    restore();
    if (active) dispose(incoming);
    dispose(outgoing);
    if (active) incoming = null;
    outgoing = null;
    phase = null;
    progress = 0;
    departureProgress = 0;
    handoff = 0;
    faces = [];
    departureFaces = [];
  }
  function invalidate() {
    cancel();
    dispose(incoming);
    incoming = null;
    faces = [];
  }
  function usage(session) {
    const result = Object.fromEntries(Object.keys(caps()).map((key) => [key, 0]));
    for (const { asset, model } of session?.groups || []) {
      result.pieces += model.shards.length;
      result.owners++;
      result.descendants += asset.descendants || 0;
      result.textBytes += asset.textBytes ?? asset.owner.textContent.length * 3;
      result.layerPixels += asset.pixelCount;
    }
    return result;
  }
  function reservation() {
    if (!incoming && !outgoing) return null;
    const arrival = usage(incoming);
    const departure = usage(outgoing);
    return Object.fromEntries(
      Object.keys(arrival).map((key) => [key, arrival[key] + departure[key]])
    );
  }
  function routePose(route) {
    const pose = api.poses[api.initialPoses[route]];
    if (!pose) return null;
    const offset = -api.roomSpacing * api.routeOrder.indexOf(route);
    return {
      position: pose.position.map((value, index) => value + (index === 2 ? offset : 0)),
      target: pose.target.map((value, index) => value + (index === 2 ? offset : 0)),
    };
  }
  function budget(departure = false) {
    const limits = caps();
    if (departure) {
      const allocated = usage(incoming);
      return Object.fromEntries(
        Object.entries(limits).map(([key, value]) => [key, Math.max(0, value - allocated[key])])
      );
    }
    // Both simultaneous fields need pieces and pixels; semantic coverage need
    // not split evenly. A mobile Home may own more blocks than Research.
    return Object.fromEntries(
      Object.entries(limits).map(([key, value]) => [
        key,
        ['pieces', 'layerPixels'].includes(key) ? value / 2 : value,
      ])
    );
  }
  async function acquire(root, options) {
    if (textures.captureAll) return textures.captureAll(root, options);
    const asset = await textures.capture(root, options);
    return asset ? [asset] : null;
  }
  function build(assets, route, pose, limits) {
    if (!assets?.length || !pose) return null;
    const targetCounts = assets.map((asset) =>
      Math.min(solids.settings?.maxPieces || 24, geometry.pieceCount(nativeRect(asset.envelope)))
    );
    const counts = assets.map(() => 1);
    const maximum = textures.captureAll
      ? Math.floor(limits.pieces)
      : sceneSettings.prototypePieces[state.compact ? 'compact' : 'full'];
    if (assets.length > maximum) return null;
    for (let remaining = maximum - assets.length; remaining > 0; remaining--) {
      let chosen = -1;
      let weight = -1;
      assets.forEach((asset, index) => {
        const demand = targetCounts[index] - counts[index];
        const score =
          demand > 0 ? (asset.envelope.width * asset.envelope.height) / counts[index] : -1;
        if (score > weight) {
          chosen = index;
          weight = score;
        }
      });
      if (chosen < 0) break;
      counts[chosen]++;
    }
    const camera = solids.view?.(state.current, state.width, state.height);
    const anchor = camera
      ? camera.position.map(
          (value, index) => value + camera.forward[index] * sceneSettings.restDepth
        )
      : [0, 5, -8];
    const groups = [];
    for (const [index, asset] of assets.entries()) {
      const rect = nativeRect(asset.envelope);
      const cells = geometry.partition(
        rect,
        { count: counts[index], seed: 49 + index * 997 },
        { maxPieces: counts[index] }
      );
      const restAnchor = [...anchor];
      if (camera) {
        const horizontal = ((rect.x + rect.width / 2) / state.width - 0.5) * 18;
        const vertical = (0.5 - (rect.y + rect.height / 2) / state.height) * 12;
        for (let axis = 0; axis < 3; axis++)
          restAnchor[axis] += camera.right[axis] * horizontal + camera.up[axis] * vertical;
      }
      const key = `${route}:${asset.ownerPath?.join('.') || index}`;
      const model = solids.prepare({
        id: textures.captureAll ? key : 'research-intro',
        rect,
        cells,
        pose,
        width: state.width,
        height: state.height,
        anchor: restAnchor,
      });
      if (!model) return null;
      groups.push({ key, asset, model, cells, native: null });
    }
    const session = { route, groups, pose, disposed: false };
    if (!geometry.admit(usage(session), limits)) return null;
    const schedule = geometry.arrivalSchedule(
      groups.map(({ model, cells }) => ({ rect: model.rect, cells }))
    );
    groups.forEach((group, index) => {
      group.schedule = schedule?.[index] || null;
      surfaces.set(group.key, group.asset.canvas);
    });
    return session;
  }
  function landingKey(landing) {
    return JSON.stringify([landing?.position || [0, 0], landing?.hash || '']);
  }
  function place(stage, data, top, landing) {
    let scroll = Array.isArray(landing?.position) ? landing.position[1] : 0;
    if (landing?.position === 'end')
      scroll = Math.max(0, top + stage.getBoundingClientRect().height - state.height);
    else if (!landing?.position && landing?.hash) {
      let id;
      try {
        id = decodeURIComponent(landing.hash.slice(1));
      } catch {
        return false;
      }
      const target = [...stage.querySelectorAll('[id]')].find((node) => node.id === id);
      if (!target) return false;
      scroll = target.getBoundingClientRect().top;
    }
    if (!Number.isFinite(scroll) || scroll < 0) return false;
    stage.style.setProperty('--embedded-stage-top', top - scroll + 'px');
    return true;
  }
  function captureOptions(controller, limits) {
    return {
      width: state.width,
      height: state.height,
      dpr: Math.min(2, window.devicePixelRatio || 1),
      signal: controller.signal,
      caps: limits,
      preparationMs: geometry.settings.preparationMs,
      acquisitionMs: geometry.settings.acquisitionMs,
    };
  }
  async function prime(data, top, landing = null, options = {}) {
    const from = document.body.dataset.page;
    if (!paired(from, data.page) || phase) return false;
    if (
      !state ||
      state.width !== (window.innerWidth || state.width) ||
      state.height !== (window.innerHeight || state.height)
    ) {
      queuedPrime = { data, top, landing, options };
      return false;
    }
    const key = landingKey(landing);
    if (incoming && incoming.route === data.page && incoming.landingKey === key) return true;
    if (pending || !window.SiteScene?.canTravel() || options.signal?.aborted) return false;
    dispose(incoming);
    incoming = null;
    const own = ++generation;
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    pending = controller;
    pendingRoute = data.page;
    const stage = document.createElement('div');
    stage.className = 'embedded-stage';
    stage.inert = true;
    stage.setAttribute('aria-hidden', 'true');
    stage.setAttribute('data-embedded-route', data.page);
    stage.style.setProperty('--embedded-stage-width', document.documentElement.clientWidth + 'px');
    stage.style.setProperty('--embedded-stage-top', top + 'px');
    const native = textures.captureAll ? data.main : data.main.querySelector('.archive-intro');
    if (!native) {
      pending = null;
      pendingRoute = null;
      options.signal?.removeEventListener('abort', abort);
      return false;
    }
    stage.append(document.importNode(native, true));
    if (textures.captureAll && data.footer) stage.append(document.importNode(data.footer, true));
    document.body.append(stage);
    let assets = null;
    try {
      if (!place(stage, data, top, landing)) return false;
      const limits = budget();
      assets = await acquire(stage, captureOptions(controller, limits));
      if (own !== generation || controller.signal.aborted || document.body.dataset.page !== from)
        return false;
      const session = build(assets, data.page, routePose(data.page), limits);
      if (!session) return false;
      session.landingKey = key;
      incoming = session;
      assets = null;
      return true;
    } catch {
      return false;
    } finally {
      for (const asset of assets || []) asset.dispose();
      stage.remove();
      options.signal?.removeEventListener('abort', abort);
      if (own === generation) {
        pending = null;
        pendingRoute = null;
      }
    }
  }
  async function prepareDeparture(content, options = {}) {
    if (!incoming || phase || pending || options.signal?.aborted) return false;
    const transform = content.style?.transform;
    const opacity = content.style?.opacity;
    // An interrupted DOM plane must keep its displayed pose. Its established
    // fallback handles retargeting; solids only replace ordinary native paint.
    if (
      (transform && transform !== 'none') ||
      (opacity && (!Number.isFinite(Number(opacity)) || Number(opacity) !== 1))
    )
      return false;
    dispose(outgoing);
    outgoing = null;
    const own = generation;
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    pending = controller;
    let assets = null;
    try {
      const limits = budget(true);
      assets = await acquire(content, captureOptions(controller, limits));
      if (own !== generation || controller.signal.aborted) return false;
      const session = build(assets, document.body.dataset.page, state.current, limits);
      if (!session) return false;
      for (const group of session.groups) group.native = group.asset.owner;
      outgoing = session;
      assets = null;
      return true;
    } catch {
      return false;
    } finally {
      for (const asset of assets || []) asset.dispose();
      options.signal?.removeEventListener('abort', abort);
      if (own === generation) pending = null;
    }
  }
  function hide(owners) {
    for (const owner of owners) {
      hidden.push({ owner, visibility: owner.style.visibility, opacity: owner.style.opacity });
      owner.style.visibility = 'hidden';
    }
  }
  function begin(context) {
    if (
      !incoming ||
      !paired(context.from, context.to) ||
      incoming.route !== context.to ||
      incoming.landingKey !== landingKey(context.landing) ||
      (textures.captureAll && (!outgoing || outgoing.route !== context.from))
    ) {
      invalidate();
      return false;
    }
    phase = 'departing';
    progress = 0;
    departureProgress = 0;
    if (outgoing) hide(outgoing.groups.map((group) => group.native));
    return true;
  }
  function resolveOwner(content, group) {
    if (!textures.captureAll) return content.querySelector(textures.settings.selector);
    let owner = content;
    for (const index of group.asset.ownerPath || []) owner = owner?.children?.[index];
    return owner || null;
  }
  function sameRect(rect, original) {
    return ['left', 'top', 'width', 'height'].every(
      (key) => Math.abs(rect[key] - original[key]) <= 0.75
    );
  }
  function land(content) {
    if (phase !== 'departing') return;
    const owners = incoming.groups.map((group) => resolveOwner(content, group));
    if (
      owners.some(
        (owner, index) =>
          !owner ||
          owner.textContent !== incoming.groups[index].asset.owner.textContent ||
          !sameRect(owner.getBoundingClientRect(), incoming.groups[index].asset.rect)
      )
    ) {
      invalidate();
      return;
    }
    restore();
    incoming.groups.forEach((group, index) => {
      group.native = owners[index];
    });
    hide(owners);
    phase = 'assembling';
    started = state.ambientTime;
    progress = 0;
    departureProgress = 1;
    departureFaces = [];
  }
  function present(amount) {
    if (phase === 'departing' && Number.isFinite(amount)) departureProgress = clamp(amount);
  }
  function groupDiagnostics(session) {
    return (session?.groups || []).map(({ key, asset, model, cells }) => ({
      key,
      route: session.route,
      ownerPath: asset.ownerPath || null,
      rect: asset.rect,
      lines: asset.lines || [],
      envelope: asset.envelope,
      ids: model.shards.map((shard) => shard.id),
      pieces: model.shards.length,
      pixels: asset.pixelCount,
      descendants: asset.descendants || 0,
      textBytes: asset.textBytes ?? asset.owner.textContent.length * 3,
      topology: {
        closed: true,
        fronts: cells.length,
        rears: cells.length,
        sides: cells.reduce((total, cell) => total + cell.polygon.length, 0),
      },
    }));
  }
  const faceDiagnostics = (items) =>
    items.map(({ id, face, points, alpha, textureMix }) => ({
      id,
      face,
      points,
      alpha,
      textureMix,
    }));
  function refresh() {
    invalidate();
    if (window.CustomEvent)
      window.dispatchEvent(new window.CustomEvent('site:embedded-invalidated'));
  }
  const bridge = {
    prime,
    prepareDeparture,
    begin,
    land,
    present,
    cancel,
    invalidate,
    refresh,
    active: () => phase !== null,
    owner: () => hidden[0]?.owner || null,
    owners: () => hidden.map(({ owner }) => owner),
    complete() {
      if (!phase) return true;
      if (phase !== 'assembling' || progress < 1) return false;
      invalidate();
      return true;
    },
    reservation,
    diagnostics: () => ({
      ready: !!incoming,
      pendingRoute,
      route: incoming?.route || null,
      phase,
      progress,
      physicalProgress: clamp(progress / (1 - sceneSettings.handoffFraction)),
      handoff,
      texturePixels: reservation()?.layerPixels || 0,
      nativeRect: incoming?.groups[0]?.asset.rect || null,
      nativeLines: incoming?.groups[0]?.asset.lines || [],
      envelope: incoming?.groups[0]?.asset.envelope || null,
      ids: incoming?.groups.flatMap(({ model }) => model.shards.map(({ id }) => id)) || [],
      groups: groupDiagnostics(incoming),
      coverage: {
        expected: incoming?.groups.length || 0,
        selected: incoming?.groups.length || 0,
        complete: !!incoming,
      },
      caps: caps(),
      faces: faceDiagnostics(faces),
      departure: {
        ready: !!outgoing,
        progress: departureProgress,
        groups: groupDiagnostics(outgoing),
        faces: faceDiagnostics(departureFaces),
      },
    }),
  };
  window.SiteEffects.embedded = bridge;
  for (const name of ['resize', 'beforeprint', 'pagehide'])
    window.addEventListener(name, invalidate);
  window.addEventListener(
    'scroll',
    () => {
      if (phase !== 'assembling') return;
      if (
        incoming.groups.some(
          (group) => !sameRect(group.native.getBoundingClientRect(), group.asset.rect)
        )
      )
        invalidate();
    },
    { passive: true }
  );
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) invalidate();
    else refresh();
  });
  window.addEventListener('afterprint', refresh);
  window
    .matchMedia?.('(prefers-reduced-transparency: reduce)')
    .addEventListener?.('change', refresh);
  document.fonts?.addEventListener?.('loadingdone', refresh);
  window.addEventListener('site:motion-preference', () => {
    if (!window.SiteScene?.canTravel()) invalidate();
    else refresh();
  });
  new window.MutationObserver(refresh).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  function sample(session, frame, amounts) {
    const result = [];
    session.groups.forEach((group, index) => {
      const produced = solids.sample(group.model, {
        pose: frame.current,
        width: frame.width,
        height: frame.height,
        progress: amounts[index]?.[0] || 0,
        progresses: textures.captureAll ? amounts[index] : null,
      });
      for (const face of produced) {
        face.ownerKey = group.key;
        result.push(face);
      }
    });
    return result;
  }
  return {
    collect(frame) {
      state = frame;
      if (queuedPrime) {
        const queued = queuedPrime;
        queuedPrime = null;
        Promise.resolve().then(() =>
          prime(queued.data, queued.top, queued.landing, queued.options)
        );
      }
      if (!incoming || (!phase && !paired(frame.page, incoming.route))) return [];
      if (phase === 'assembling')
        progress = clamp(
          ((frame.ambientTime - started + api.LOOP_MS) % api.LOOP_MS) / sceneSettings.durationMs
        );
      const aligned =
        incoming.pose.position.every((value, index) => value === frame.current.position[index]) &&
        incoming.pose.target.every((value, index) => value === frame.current.target[index]);
      handoff =
        phase === 'assembling' && hidden.length && aligned
          ? clamp((progress - 1 + sceneSettings.handoffFraction) / sceneSettings.handoffFraction)
          : 0;
      if (handoff > 0)
        for (const entry of hidden) {
          entry.owner.style.visibility = entry.visibility || 'visible';
          entry.owner.style.opacity = String(handoff);
        }
      const elapsed = (progress * sceneSettings.durationMs) / (1 - sceneSettings.handoffFraction);
      const amounts = incoming.groups.map((group) =>
        group.model.shards.map((_, index) => {
          const schedule = textures.captureAll && group.schedule?.[index];
          return schedule
            ? clamp((elapsed - schedule.delayMs) / schedule.durationMs)
            : clamp(progress / (1 - sceneSettings.handoffFraction));
        })
      );
      faces = sample(incoming, frame, amounts);
      if (handoff > 0) for (const face of faces) face.alpha *= 1 - handoff;
      departureFaces = [];
      if (
        phase === 'departing' &&
        outgoing &&
        departureProgress < geometry.settings.departureEndProgress
      ) {
        const amount = clamp(departureProgress / geometry.settings.departureEndProgress);
        const departureAmounts = outgoing.groups.map((group) =>
          group.model.shards.map(() => 1 - amount)
        );
        departureFaces = sample(outgoing, frame, departureAmounts);
        for (const face of departureFaces) face.alpha *= 1 - amount;
      }
      return [...faces, ...departureFaces];
    },
    paint(ctx, shape) {
      return solids.paint(ctx, shape, surfaces.get(shape.ownerKey), state?.colors);
    },
  };
};
