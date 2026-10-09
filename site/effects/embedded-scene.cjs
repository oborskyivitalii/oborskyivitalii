'use strict';
// One experimental native block; scene collection owns all animation frames.
module.exports = function (api, { fragmentPlan, embeddedPlan, embeddedTexture }) {
  const geometry = fragmentPlan({ cameraView: api.cameraView });
  const solids = embeddedPlan({
    cameraView: api.cameraView,
    depthVisibility: api.depthVisibility,
  });
  const textures = embeddedTexture();
  let generation = 0,
    asset = null,
    prepared = null,
    state = null,
    phase = null,
    started = 0,
    progress = 0,
    hidden = null,
    savedVisibility = '',
    savedOpacity = '',
    handoff = 0,
    pending = null,
    queuedPrime = null,
    faces = [];
  const sceneSettings = Object.freeze({
    route: 'research',
    selector: textures.settings.selector,
    durationMs: geometry.settings.arrivalDurationMs,
    embeddedAnchor: Object.freeze([0, 5, -8]),
    pieces: Object.freeze({ full: 12, compact: 8 }),
  });
  function restore() {
    if (!hidden) return;
    if (savedVisibility) hidden.style.visibility = savedVisibility;
    else hidden.style.removeProperty('visibility');
    if (savedOpacity) hidden.style.opacity = savedOpacity;
    else hidden.style.removeProperty('opacity');
    hidden = null;
  }
  function cancel() {
    restore();
    if (phase === 'assembling') {
      asset?.dispose();
      asset = null;
      prepared = null;
      faces = [];
    }
    phase = null;
    progress = 0;
    handoff = 0;
  }
  function invalidate() {
    generation++;
    pending?.abort();
    pending = null;
    queuedPrime = null;
    cancel();
    asset?.dispose();
    asset = null;
    prepared = null;
    faces = [];
  }
  const nativeRect = (rect) => ({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  });
  async function prime(data, top) {
    if (document.body.dataset.page !== 'index' || data.page !== sceneSettings.route) return false;
    if (
      !state ||
      state.width !== (window.innerWidth || state.width) ||
      state.height !== (window.innerHeight || state.height)
    ) {
      queuedPrime = { data, top };
      return false;
    }
    if (prepared || pending || !window.SiteScene?.canTravel()) return !!prepared;
    const own = ++generation;
    const controller = new AbortController();
    pending = controller;
    const stage = document.createElement('div');
    stage.className = 'embedded-stage';
    stage.inert = true;
    stage.setAttribute('aria-hidden', 'true');
    stage.style.setProperty('--embedded-stage-width', document.documentElement.clientWidth + 'px');
    stage.style.setProperty('--embedded-stage-top', top + 'px');
    const intro = data.main.querySelector('.archive-intro');
    if (!intro) {
      pending = null;
      return false;
    }
    stage.append(document.importNode(intro, true));
    for (const node of stage.querySelectorAll('[id]')) node.removeAttribute('id');
    document.body.append(stage);
    let captured = null;
    try {
      captured = await textures.capture(stage, {
        width: state.width,
        height: state.height,
        dpr: Math.min(2, window.devicePixelRatio || 1),
        signal: controller.signal,
      });
      if (!captured || own !== generation || document.body.dataset.page !== 'index') {
        captured?.dispose();
        return false;
      }
      const rect = nativeRect(captured.envelope);
      const count = state.compact ? sceneSettings.pieces.compact : sceneSettings.pieces.full;
      const cells = geometry.partition(rect, { count, seed: 49 }, { maxPieces: count });
      const pose = api.poses[api.initialPoses.research];
      const offset = -api.roomSpacing * api.routeOrder.indexOf('research');
      const targetPose = {
        position: pose.position.map((value, index) => value + (index === 2 ? offset : 0)),
        target: pose.target.map((value, index) => value + (index === 2 ? offset : 0)),
      };
      const model = solids.prepare({
        id: 'research-intro',
        rect,
        cells,
        pose: targetPose,
        width: state.width,
        height: state.height,
        anchor: sceneSettings.embeddedAnchor,
      });
      if (!model) {
        captured.dispose();
        return false;
      }
      asset = captured;
      prepared = model;
      return true;
    } catch {
      captured?.dispose();
      return false;
    } finally {
      stage.remove();
      if (own === generation) pending = null;
    }
  }
  function begin(context) {
    if (
      !prepared ||
      context.from !== 'index' ||
      context.to !== sceneSettings.route ||
      context.direction !== 'forward' ||
      context.landing?.hash ||
      context.landing?.position === 'end' ||
      context.landing?.position?.some((value) => value !== 0)
    ) {
      invalidate();
      return false;
    }
    phase = 'assembling';
    started = state.ambientTime;
    progress = 0;
    return true;
  }
  function land(content) {
    if (phase !== 'assembling') return;
    const owner = content.querySelector(sceneSettings.selector);
    if (!owner || owner.textContent !== asset.owner.textContent) {
      invalidate();
      return;
    }
    const rect = owner.getBoundingClientRect();
    const original = asset.rect;
    if (
      ['left', 'top', 'width', 'height'].some((key) => Math.abs(rect[key] - original[key]) > 0.75)
    ) {
      invalidate();
      return;
    }
    hidden = owner;
    savedVisibility = owner.style.visibility;
    savedOpacity = owner.style.opacity;
    owner.style.visibility = 'hidden';
  }
  const bridge = {
    prime,
    begin,
    land,
    cancel,
    invalidate,
    refresh,
    owner: () => hidden,
    complete() {
      if (phase !== 'assembling') return true;
      if (progress < 1) return false;
      invalidate();
      return true;
    },
    reservation: () =>
      prepared
        ? {
            pieces: prepared.shards.length,
            owners: 1,
            descendants: 0,
            textBytes: asset.owner.textContent.length * 3,
            layerPixels: asset.pixelCount,
          }
        : null,
    diagnostics: () => ({
      ready: !!prepared,
      phase,
      progress,
      physicalProgress: Math.min(1, progress / 0.9),
      handoff,
      texturePixels: asset?.pixelCount || 0,
      nativeRect: asset?.rect || null,
      nativeLines: asset?.lines || [],
      envelope: asset?.envelope || null,
      ids: prepared?.shards?.map((shard) => shard.id) || [],
      faces: faces.map(({ id, face, points, alpha, textureMix }) => ({
        id,
        face,
        points,
        alpha,
        textureMix,
      })),
    }),
  };
  window.SiteEffects.embedded = bridge;
  function refresh() {
    invalidate();
    if (window.CustomEvent)
      window.dispatchEvent(new window.CustomEvent('site:embedded-invalidated'));
  }
  for (const name of ['resize', 'beforeprint', 'pagehide'])
    window.addEventListener(name, invalidate);
  window.addEventListener(
    'scroll',
    () => {
      if (!hidden) return;
      const rect = hidden.getBoundingClientRect();
      if (
        ['left', 'top', 'width', 'height'].some(
          (key) => Math.abs(rect[key] - asset.rect[key]) > 0.75
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
  return {
    collect(frame) {
      state = frame;
      if (queuedPrime) {
        const queued = queuedPrime;
        queuedPrime = null;
        Promise.resolve().then(() => prime(queued.data, queued.top));
      }
      if (!prepared || !asset || (phase !== 'assembling' && frame.page !== 'index')) return [];
      if (phase === 'assembling')
        progress = Math.min(
          1,
          ((frame.ambientTime - started + api.LOOP_MS) % api.LOOP_MS) / sceneSettings.durationMs
        );
      const aligned =
        prepared.pose.position.every((value, index) => value === frame.current.position[index]) &&
        prepared.pose.target.every((value, index) => value === frame.current.target[index]);
      handoff = hidden && aligned ? Math.max(0, (progress - 0.9) / 0.1) : 0;
      if (handoff > 0) {
        hidden.style.visibility = savedVisibility || 'visible';
        hidden.style.opacity = String(Math.min(1, handoff));
      }
      faces = solids.sample(prepared, {
        pose: frame.current,
        width: frame.width,
        height: frame.height,
        progress: Math.min(1, progress / 0.9),
      });
      if (handoff > 0) for (const face of faces) face.alpha *= 1 - Math.min(1, handoff);
      return faces;
    },
    paint: (ctx, shape) => solids.paint(ctx, shape, asset?.canvas, state?.colors),
  };
};
