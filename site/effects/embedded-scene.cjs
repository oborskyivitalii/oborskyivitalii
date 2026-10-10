'use strict';
// Persistent page fields attach to the existing recursive world and painted clock.
module.exports = function (api, { fragmentPlan, embeddedPlan, embeddedTexture }) {
  const geometry = fragmentPlan({ cameraView: api.cameraView });
  const solids = embeddedPlan({
    cameraView: api.cameraView,
    depthVisibility: api.depthVisibility,
    loopTransform: api.loopTransform,
  });
  const textures = embeddedTexture();
  const statusOwner = document.getElementById?.('space-canvas')?.parentElement;
  const bank = new Map();
  const surfaces = new Map();
  const settings = Object.freeze({
    entries: 3,
    arrivalStart: 0.12,
    skippedHostSpan: 0.7,
    stagger: 0.04,
    handoffMs: 180,
  });
  let generation = 0;
  let state = null;
  let incoming = null;
  let outgoing = null;
  let phase = null;
  let context = null;
  let travelProgress = 0;
  let progress = 0;
  let handoff = 0;
  let tailStarted = null;
  let pending = null;
  let pendingRoute = null;
  let queuedPrime = null;
  let hidden = [];
  let faces = [];
  let departureFaces = [];
  let lastFailure = null;
  let publishedStatus = null;
  const clamp = (amount) => Math.max(0, Math.min(1, amount));
  const validRoute = (route) => api.routeOrder.includes(route);
  const caps = () => geometry.settings.caps[state?.compact ? 'compact' : 'full'];
  const rectangle = (rect) => ({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  });
  function reject(stage, route, detail) {
    if (lastFailure) return;
    const token = (value) =>
      typeof value === 'string' && /^[a-zA-Z0-9-]{1,64}$/.test(value) ? value : null;
    const report = typeof detail === 'string' ? { reason: detail } : detail || {};
    lastFailure = {
      stage,
      route: validRoute(route) ? route : null,
      reason: token(report.reason) || 'adapter-rejected',
    };
    for (const key of ['tag', 'limit', 'property']) {
      const value = token(report[key]);
      if (value) lastFailure[key] = value;
    }
    if (
      Array.isArray(report.path) &&
      report.path.length <= 32 &&
      report.path.every((index) => Number.isInteger(index) && index >= 0 && index <= 4096)
    )
      lastFailure.path = [...report.path];
  }
  function restore() {
    for (const { owner, visibility, opacity } of hidden) {
      if (visibility) owner.style.visibility = visibility;
      else owner.style.removeProperty('visibility');
      if (opacity) owner.style.opacity = opacity;
      else owner.style.removeProperty('opacity');
    }
    hidden = [];
    for (const entry of bank.values()) for (const group of entry.groups) group.native = null;
  }
  function dispose(entry) {
    if (!entry || entry.disposed) return;
    entry.disposed = true;
    for (const group of entry.groups) {
      group.asset.dispose();
      surfaces.delete(group.key);
    }
  }
  function cancel() {
    generation++;
    pending?.abort();
    pending = null;
    pendingRoute = null;
    queuedPrime = null;
    restore();
    phase = null;
    context = null;
    incoming = null;
    outgoing = null;
    travelProgress = 0;
    progress = 0;
    handoff = 0;
    tailStarted = null;
    faces = [];
    departureFaces = [];
  }
  function invalidate() {
    cancel();
    for (const entry of bank.values()) dispose(entry);
    bank.clear();
  }
  function usage(entry) {
    const result = Object.fromEntries(Object.keys(caps()).map((key) => [key, 0]));
    for (const { asset, model, sources } of entry?.groups || []) {
      result.pieces += model.shards.length;
      result.owners++;
      result.descendants += asset.descendants || 0;
      result.textBytes +=
        asset.textBytes ||
        sources.reduce((total, owner) => total + owner.textContent.length * 3, 0);
      result.layerPixels += asset.pixelCount;
    }
    return result;
  }
  function reservation() {
    if (!bank.size) return null;
    const total = Object.fromEntries(Object.keys(caps()).map((key) => [key, 0]));
    for (const entry of bank.values()) {
      const own = usage(entry);
      for (const key of Object.keys(total)) total[key] += own[key];
    }
    return total;
  }
  function touch(entry) {
    bank.delete(entry.route);
    bank.set(entry.route, entry);
  }
  function remove(route) {
    const entry = bank.get(route);
    if (entry) dispose(entry);
    bank.delete(route);
  }
  function makeRoom(route, protectedRoutes) {
    remove(route);
    while (bank.size >= settings.entries) {
      const oldest = [...bank.keys()].find((name) => !protectedRoutes.includes(name));
      if (!oldest) return false;
      remove(oldest);
    }
    return true;
  }
  function remainingBudget() {
    const retained = reservation() || {};
    return Object.fromEntries(
      Object.entries(caps()).map(([key, value]) => [key, Math.max(0, value - (retained[key] || 0))])
    );
  }
  function targetPose(route) {
    const pose = api.poses[api.initialPoses[route]];
    if (!pose) return null;
    return api.routePose
      ? api.routePose(route, pose)
      : {
          position: pose.position.map(
            (value, index) =>
              value + (index === 2 ? -api.roomSpacing * api.routeOrder.indexOf(route) : 0)
          ),
          target: pose.target.map(
            (value, index) =>
              value + (index === 2 ? -api.roomSpacing * api.routeOrder.indexOf(route) : 0)
          ),
        };
  }
  function hostFor(route) {
    return api.routeOrder[Math.max(0, api.routeOrder.indexOf(route) - 1)];
  }
  function branchMembers(host, cells, seed, root = 1) {
    const world = api.worldForRoom?.(host);
    const objects = world?.objects || [];
    let branches = objects.filter(
      (object) => object.depth === 2 && object.root === root && object.points?.length
    );
    if (!branches.length)
      branches = objects.filter((object) => object.points?.length && object.rootCenter);
    if (!branches.length) return null;
    return cells.map((_, index) => {
      const branch = branches[(seed + index * 7) % branches.length];
      const attachment = branch.points[(seed + index * 11) % branch.points.length];
      return {
        name: branch.name,
        parent: branch.parent || null,
        center: [...branch.center],
        rootCenter: [...branch.rootCenter],
        root: branch.root,
        phase: branch.phase,
        attachment: [...attachment],
      };
    });
  }
  function sourceMetadata(asset) {
    return (
      asset.sourceOwners || [
        {
          ownerPath: asset.ownerPath || [],
          rect: asset.rect,
          lines: asset.lines || [],
          envelope: asset.envelope,
          textContent: asset.owner?.textContent || '',
        },
      ]
    ).map((owner) => ({
      ownerPath: [...owner.ownerPath],
      rect: { ...owner.rect },
      envelope: { ...owner.envelope },
      lines: owner.lines.map((line) => ({ ...line })),
      textContent: owner.textContent,
      paintFingerprint: owner.paintFingerprint,
      controls: (owner.controls || []).map((control) => ({
        ...control,
        ownerPath: [...control.ownerPath],
      })),
    }));
  }
  function build(assets, route, limits, stage) {
    const pose = targetPose(route);
    const host = hostFor(route);
    const maximum = Math.min(Math.floor(caps().pieces / settings.entries), limits.pieces);
    if (!assets?.length || !pose || assets.length > maximum) {
      reject(stage, route, 'capture-unavailable');
      return null;
    }
    const counts = assets.map(() => 1);
    for (let extra = maximum - assets.length; extra > 0; extra--) {
      const index = counts.reduce(
        (best, count, candidate) =>
          count < (solids.settings?.maxPieces || 32) && count < counts[best] ? candidate : best,
        0
      );
      if (counts[index] >= (solids.settings?.maxPieces || 32)) break;
      counts[index]++;
    }
    const groups = [];
    for (const [index, asset] of assets.entries()) {
      const rect = rectangle(asset.envelope);
      const cells = geometry.partition(
        rect,
        { count: counts[index], seed: 49 + index * 997 },
        { maxPieces: counts[index] }
      );
      const members = branchMembers(host, cells, index * 19 + api.routeOrder.indexOf(route) * 37);
      if (!members) {
        reject(stage, route, 'world-membership-unavailable');
        return null;
      }
      const key = `${route}:${textures.captureField ? 'field' : asset.ownerPath?.join('.') || index}`;
      const model = solids.prepare({
        id: key,
        rect,
        cells,
        pose,
        width: state.width,
        height: state.height,
        members,
        returnMembers:
          host !== route
            ? branchMembers(route, cells, index * 19 + api.routeOrder.indexOf(route) * 37, 3)
            : null,
        returnOffset: api.roomOffset
          ? api.roomOffset(route)
          : -api.roomSpacing * api.routeOrder.indexOf(route),
        hostOffset: api.roomOffset
          ? api.roomOffset(host)
          : -api.roomSpacing * api.routeOrder.indexOf(host),
      });
      if (!model) {
        reject(stage, route, 'model-geometry');
        return null;
      }
      groups.push({ key, asset, model, cells, sources: sourceMetadata(asset), native: null });
    }
    const entry = { route, host, groups, pose, disposed: false, landingKey: null };
    const allocated = usage(entry);
    if (!geometry.admit(allocated, limits)) {
      reject(stage, route, {
        reason: 'model-capacity',
        limit: Object.keys(limits).find((key) => allocated[key] > limits[key]),
      });
      return null;
    }
    for (const group of groups) {
      surfaces.set(group.key, group.asset.canvas);
      // A bitmap bank must not retain a detached full-page DOM through its owner.
      group.asset.owner = null;
    }
    return entry;
  }
  const landingKey = (landing) =>
    JSON.stringify([landing?.position || [0, 0], landing?.hash || '', landing?.search || '']);
  function place(stage, top, landing) {
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
  function captureOptions(controller, limits, stage, route, own) {
    return {
      width: state.width,
      height: state.height,
      dpr: state.compact ? 1 : Math.min(1.5, window.devicePixelRatio || 1),
      signal: controller.signal,
      caps: limits,
      preparationMs: geometry.settings.preparationMs,
      acquisitionMs: geometry.settings.acquisitionMs,
      onReject(detail) {
        if (own === generation) reject(stage, route, detail);
      },
    };
  }
  async function acquire(root, options) {
    if (textures.captureField) {
      const asset = await textures.captureField(root, options);
      return asset ? [asset] : null;
    }
    if (textures.captureAll) return textures.captureAll(root, options);
    const asset = await textures.capture(root, options);
    return asset ? [asset] : null;
  }
  async function prime(data, top, landing = null, options = {}) {
    const from = document.body.dataset.page;
    if (!validRoute(from) || !validRoute(data.page) || from === data.page || phase) return false;
    if (
      !state ||
      state.width !== (window.innerWidth || state.width) ||
      state.height !== (window.innerHeight || state.height)
    ) {
      queuedPrime = { data, top, landing, options };
      return false;
    }
    const key = landingKey(landing);
    const cached = bank.get(data.page);
    if (cached?.landingKey === key) {
      incoming = cached;
      touch(cached);
      return true;
    }
    if (pending || !window.SiteScene?.canTravel() || options.signal?.aborted) return false;
    if (!makeRoom(data.page, [from])) return false;
    const own = ++generation;
    lastFailure = null;
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
    stage.append(document.importNode(data.main, true));
    if (data.footer) stage.append(document.importNode(data.footer, true));
    document.body.append(stage);
    let assets = null;
    try {
      window.SiteArchive?.preparePreview?.(stage, {
        search: landing?.search || '',
        hash: landing?.hash || '',
      });
      if (!place(stage, top, landing)) {
        reject('incoming', data.page, 'landing-unavailable');
        return false;
      }
      const limits = remainingBudget();
      assets = await acquire(stage, captureOptions(controller, limits, 'incoming', data.page, own));
      if (own !== generation || controller.signal.aborted || document.body.dataset.page !== from)
        return false;
      const entry = build(assets, data.page, limits, 'incoming');
      if (!entry) return false;
      entry.landingKey = key;
      bank.set(entry.route, entry);
      incoming = entry;
      assets = null;
      return true;
    } catch {
      if (own === generation) reject('incoming', data.page, 'capture-exception');
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
  function resolve(content, path) {
    let owner = content;
    for (const index of path) owner = owner?.children?.[index];
    return owner || null;
  }
  const sameRect = (rect, original) =>
    ['left', 'top', 'width', 'height'].every((key) => Math.abs(rect[key] - original[key]) <= 0.75);
  function matching(entry, content) {
    if (!content) return false;
    const managed = hidden.find(({ owner }) => owner === content);
    const current = managed && {
      visibility: content.style.visibility,
      opacity: content.style.opacity,
    };
    function appearance(snapshot) {
      for (const key of ['visibility', 'opacity']) {
        if (snapshot[key]) content.style[key] = snapshot[key];
        else content.style.removeProperty(key);
      }
    }
    // The native oracle sees ordinary layout during this synchronous read.
    // A lifecycle-owned crossfade must not invalidate its own captured paint.
    if (managed) appearance(managed);
    try {
      if (
        textures.matchesField &&
        !entry.groups.every((group) =>
          textures.matchesField(content, group.sources, {
            width: state.width,
            height: state.height,
            dpr: state.compact ? 1 : Math.min(1.5, window.devicePixelRatio || 1),
            caps: caps(),
            acquisitionMs: geometry.settings.acquisitionMs,
            decorations: group.asset.decorations,
          })
        )
      )
        return false;
      return entry.groups.every((group) =>
        group.sources.every((source) => {
          const owner = resolve(content, source.ownerPath);
          return (
            owner &&
            owner.textContent === source.textContent &&
            sameRect(owner.getBoundingClientRect(), source.rect) &&
            source.controls.every((control) => {
              const node = resolve(content, control.ownerPath);
              return (
                node &&
                node.selectedIndex === control.selectedIndex &&
                (!control.text || node.selectedOptions?.[0]?.textContent === control.text)
              );
            })
          );
        })
      );
    } finally {
      if (current) appearance(current);
    }
  }
  async function prepareDeparture(content, options = {}) {
    const route = document.body.dataset.page;
    if (!incoming || phase || pending || options.signal?.aborted) {
      reject('departure', route, 'source-not-ready');
      return false;
    }
    if (
      (content.style?.transform && content.style.transform !== 'none') ||
      (content.style?.opacity && Number(content.style.opacity) !== 1)
    ) {
      reject('departure', route, 'source-plane-interrupted');
      return false;
    }
    const cached = bank.get(route);
    if (cached && matching(cached, content)) {
      outgoing = cached;
      for (const group of cached.groups) group.native = content;
      touch(cached);
      return true;
    }
    if (!makeRoom(route, [incoming.route])) return false;
    const own = generation;
    lastFailure = null;
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    pending = controller;
    let assets = null;
    try {
      const limits = remainingBudget();
      assets = await acquire(content, captureOptions(controller, limits, 'departure', route, own));
      if (own !== generation || controller.signal.aborted) return false;
      const entry = build(assets, route, limits, 'departure');
      if (!entry) return false;
      entry.landingKey = landingKey({
        position: [window.scrollX || 0, window.scrollY || 0],
        search: window.location?.search || '',
        hash: window.location?.hash || '',
      });
      for (const group of entry.groups) group.native = content;
      bank.set(route, entry);
      outgoing = entry;
      assets = null;
      return true;
    } catch {
      if (own === generation) reject('departure', route, 'capture-exception');
      return false;
    } finally {
      for (const asset of assets || []) asset.dispose();
      options.signal?.removeEventListener('abort', abort);
      if (own === generation) pending = null;
    }
  }
  function hide(owner) {
    hidden.push({ owner, visibility: owner.style.visibility, opacity: owner.style.opacity });
    owner.style.visibility = 'hidden';
  }
  function begin(next) {
    if (
      !incoming ||
      !outgoing ||
      incoming.route !== next.to ||
      outgoing.route !== next.from ||
      next.from === next.to ||
      incoming.landingKey !== landingKey(next.landing)
    ) {
      reject('begin', next.to, 'paired-session-unavailable');
      cancel();
      return false;
    }
    context = next;
    phase = 'departing';
    travelProgress = 0;
    progress = 0;
    handoff = 0;
    tailStarted = null;
    hide(outgoing.groups[0].native);
    return true;
  }
  function land(content) {
    if (phase !== 'departing') return;
    restore();
    if (!matching(incoming, content)) {
      reject('landing', incoming.route, 'native-geometry-mismatch');
      cancel();
      return;
    }
    for (const group of incoming.groups) group.native = content;
    hide(content);
    phase = 'assembling';
  }
  function present(amount) {
    if (phase && Number.isFinite(amount)) travelProgress = clamp(amount);
  }
  function groupDiagnostics(entry) {
    return (entry?.groups || []).map(({ key, asset, model, cells, sources }) => ({
      key,
      route: entry.route,
      host: entry.host,
      ownerPath: [],
      sourceOwners: sources,
      rect: asset.rect,
      lines: asset.lines || [],
      envelope: asset.envelope,
      ids: model.shards.map(({ id }) => id),
      pieces: model.shards.length,
      pixels: asset.pixelCount,
      descendants: asset.descendants || 0,
      textBytes: asset.textBytes || 0,
      members: model.shards.map((shard) => ({
        id: shard.id,
        name: shard.member?.name,
        parent: shard.member?.parent,
        root: shard.member?.root,
        rootCenter: shard.member?.rootCenter,
        hostOffset: shard.hostOffset,
        worldCenter: shard.member
          ? api
              .loopTransform(
                shard.member,
                state?.ambientTime || 0
              )(shard.restCenter)
              .map((value, index) => value + (index === 2 ? shard.hostOffset : 0))
          : shard.restCenter,
      })),
      topology: {
        closed: true,
        fronts: cells.length,
        rears: cells.length,
        sides: cells.reduce((sum, cell) => sum + cell.polygon.length, 0),
      },
    }));
  }
  const faceDiagnostics = (items) =>
    items.map(({ id, face, points, alpha, textureMix, progress: amount }) => ({
      id,
      face,
      points,
      alpha,
      textureMix,
      progress: amount,
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
    nativeOpacity: () => (phase === 'assembling' ? handoff : 1),
    owner: () => hidden[0]?.owner || null,
    owners: () => hidden.map(({ owner }) => owner),
    complete() {
      if (!phase) return true;
      if (phase !== 'assembling' || travelProgress < 1 || handoff < 1) return false;
      const arrival = incoming;
      cancel();
      incoming = arrival;
      touch(arrival);
      const crossed = bank.get(arrival.host);
      if (crossed && crossed !== arrival) touch(crossed);
      return true;
    },
    reservation,
    diagnostics: () => ({
      ready: !!incoming,
      pendingRoute,
      lastFailure,
      route: incoming?.route || null,
      phase,
      progress,
      physicalProgress: faces
        .filter((face) => face.ownerKey === incoming?.groups[0]?.key && face.face === 'front')
        .reduce((maximum, face) => Math.max(maximum, face.progress), 0),
      travelProgress,
      arrivalStart: arrivalStart(),
      handoff,
      clock: state?.ambientTime || 0,
      texturePixels: reservation()?.layerPixels || 0,
      nativeRect: incoming?.groups[0]?.asset.rect || null,
      nativeLines: incoming?.groups[0]?.asset.lines || [],
      envelope: incoming?.groups[0]?.asset.envelope || null,
      ids: incoming?.groups.flatMap(({ model }) => model.shards.map(({ id }) => id)) || [],
      groups: groupDiagnostics(incoming),
      bank: [...bank.values()].map((entry) => ({
        route: entry.route,
        host: entry.host,
        groups: groupDiagnostics(entry),
      })),
      coverage: {
        expected: incoming?.groups.reduce((sum, group) => sum + group.sources.length, 0) || 0,
        selected: incoming?.groups.reduce((sum, group) => sum + group.sources.length, 0) || 0,
        complete: !!incoming,
      },
      caps: caps(),
      faces: faceDiagnostics(faces),
      departure: {
        ready: !!outgoing,
        progress: travelProgress,
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
      if (phase === 'assembling' && incoming && !matching(incoming, hidden[0]?.owner)) cancel();
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
  function arrivalAmount() {
    const start = arrivalStart();
    return clamp((travelProgress - start) / (1 - start));
  }
  function arrivalStart() {
    if (!context || !incoming) return settings.arrivalStart;
    const from = api.routeOrder.indexOf(context.from);
    const to = api.routeOrder.indexOf(context.to);
    const host = api.routeOrder.indexOf(incoming.host);
    const hostFraction = to > from ? clamp((host - from) / (to - from)) : 0;
    // Start before the camera crosses the field's last host. A skipped room
    // remains in its own world instead of following the departing camera.
    return settings.arrivalStart + settings.skippedHostSpan * hostFraction;
  }
  function sample(entry, frame, amount) {
    const produced = [];
    for (const group of entry.groups) {
      const progresses = group.model.shards.map((_, index) => {
        if (amount <= 0 || amount >= 1) return amount;
        const delay = (settings.stagger * index) / Math.max(1, group.model.shards.length - 1);
        return clamp((amount - delay) / (1 - delay));
      });
      const shapes = solids.sample(group.model, {
        pose: frame.current,
        width: frame.width,
        height: frame.height,
        progress: amount,
        progresses,
        time: frame.ambientTime,
        clearance: phase && (entry === incoming || entry === outgoing),
        returnPath:
          phase &&
          entry === incoming &&
          context?.direction === 'backward' &&
          entry.host !== entry.route,
      });
      for (const shape of shapes) {
        shape.ownerKey = group.key;
        produced.push(shape);
      }
    }
    return produced;
  }
  function advanceHandoff(frame) {
    if (phase !== 'assembling' || travelProgress !== 1 || !incoming) return;
    const aligned =
      incoming.pose.position.every((value, index) => value === frame.current.position[index]) &&
      incoming.pose.target.every((value, index) => value === frame.current.target[index]);
    if (!aligned) return;
    if (tailStarted === null) tailStarted = frame.ambientTime;
    handoff = clamp(
      ((frame.ambientTime - tailStarted + api.LOOP_MS) % api.LOOP_MS) / settings.handoffMs
    );
    for (const entry of hidden) {
      entry.owner.style.visibility = handoff > 0 ? entry.visibility || 'visible' : 'hidden';
      entry.owner.style.opacity = String(handoff);
    }
  }
  function publishStatus() {
    if (!statusOwner?.dataset) return;
    const routes = [...bank.keys()].join(' ');
    const failure = lastFailure || {};
    const signature = [
      routes,
      phase,
      pendingRoute,
      failure.stage,
      failure.route,
      failure.reason,
      failure.tag,
      failure.limit,
    ].join('|');
    if (signature === publishedStatus) return;
    publishedStatus = signature;
    const values = {
      embeddedBank: routes,
      embeddedPhase: phase || 'idle',
      embeddedPending: pendingRoute,
      embeddedFailureStage: failure.stage,
      embeddedFailureRoute: failure.route,
      embeddedFailureReason: failure.reason,
      embeddedFailureTag: failure.tag,
      embeddedFailureLimit: failure.limit,
    };
    for (const [key, value] of Object.entries(values)) {
      if (value) statusOwner.dataset[key] = value;
      else delete statusOwner.dataset[key];
    }
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
      faces = [];
      departureFaces = [];
      if (phase) progress = arrivalAmount();
      advanceHandoff(frame);
      const native = document.body.dataset.page;
      for (const entry of bank.values()) {
        let amount = 0;
        if (phase && entry === incoming) amount = progress;
        else if (phase && entry === outgoing) amount = 1 - travelProgress;
        else if (entry.route === native) continue;
        const shapes = sample(entry, frame, amount);
        if (phase && entry === incoming && handoff > 0)
          for (const shape of shapes) shape.alpha *= 1 - handoff;
        if (phase && entry === outgoing) departureFaces = shapes;
        faces.push(...shapes);
      }
      publishStatus();
      return faces;
    },
    paint: (ctx, shape) => solids.paint(ctx, shape, surfaces.get(shape.ownerKey), state?.colors),
  };
};
