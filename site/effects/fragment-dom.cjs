'use strict';
// Temporary native-paint prototype. The producer injects the pure geometry factory.
module.exports = function (content, geometry, onFallback = null) {
  let layer = null,
    pieces = [],
    hidden = [],
    phase = null,
    viewState = null,
    failed = false,
    subscriptions = [];
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const clock = () => performance.now();
  const smooth = (value) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  function clear() {
    for (const dispose of subscriptions) dispose();
    subscriptions = [];
    layer?.remove();
    layer = null;
    pieces = [];
    for (const [owner, visibility] of hidden) {
      if (visibility) owner.style.visibility = visibility;
      else owner.style.removeProperty('visibility');
    }
    hidden = [];
    phase = null;
    viewState = null;
    delete content.dataset.fragmentPhase;
    delete content.dataset.fragmentPieces;
  }
  function invalidate() {
    if (!phase) return;
    clear();
    failed = true;
    if (onFallback) onFallback();
    else {
      content.style.opacity = '1';
      content.style.transform = 'none';
    }
  }
  // Decorative paint cannot outlive the native layout/theme on which it depends.
  // This small prototype falls back atomically rather than allocating a retarget.
  function watch() {
    const listen = (target, name, handler, options) => {
      if (!target?.addEventListener) return;
      target.addEventListener(name, handler, options);
      subscriptions.push(() => target.removeEventListener(name, handler, options));
    };
    listen(window, 'resize', invalidate, { passive: true });
    listen(window, 'beforeprint', invalidate);
    listen(window, 'pagehide', invalidate);
    listen(document, 'visibilitychange', () => {
      if (document.hidden) invalidate();
    });
    listen(document.fonts, 'loadingdone', invalidate);
    listen(reduced, 'change', invalidate);
    if (window.MutationObserver) {
      const observer = new window.MutationObserver(invalidate);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
      subscriptions.push(() => observer.disconnect());
    }
  }

  function camera(snapshot) {
    if (!snapshot?.painted || !snapshot.projection) return null;
    return {
      ...snapshot.projection,
      position: snapshot.pose.position,
      width: snapshot.width,
      height: snapshot.height,
    };
  }
  function candidates(snapshot) {
    const result = [];
    for (const selector of ['main h1, main h2, main h3', 'main p', 'main img']) {
      for (const owner of content.querySelectorAll(selector)) {
        if (owner.matches('p') && (owner.textContent?.trim().length || 0) < 60) continue;
        const rect = owner.getBoundingClientRect();
        if (
          rect.width <= 0 ||
          rect.height <= 0 ||
          rect.right <= -64 ||
          rect.left >= snapshot.width + 64 ||
          rect.bottom <= -64 ||
          rect.top >= snapshot.height + 64 ||
          owner.closest('[hidden]') ||
          getComputedStyle(owner).visibility !== 'visible'
        )
          continue;
        if (owner.matches('img') && (!owner.complete || !owner.naturalWidth || !owner.currentSrc))
          return null;
        // No SVG IDs/references, media, controls or dynamic paint in this backend.
        if (owner.querySelector('svg,canvas,video,iframe,input,button,select,textarea'))
          return null;
        result.push({ owner, rect });
        break;
      }
    }
    return result;
  }
  function arrivalStatus(snapshot) {
    const view = camera(snapshot);
    if (
      !view ||
      !Array.isArray(snapshot.anchor) ||
      snapshot.anchor.length !== 3 ||
      !snapshot.anchor.every(Number.isFinite) ||
      !(snapshot.progress >= 0.5 && snapshot.progress < 1) ||
      !(snapshot.remainingMs - Math.max(0, clock() - (snapshot.capturedAt ?? clock())) >= 250)
    )
      return 'fallback';
    const center = view.camera(snapshot.anchor);
    if (center[2] <= 0.5) return 'wait';
    const point = view.project(center);
    return point.every(Number.isFinite) &&
      point[0] >= -64 &&
      point[0] <= snapshot.width + 64 &&
      point[1] >= -64 &&
      point[1] <= snapshot.height + 64
      ? 'ready'
      : 'wait';
  }
  function freezePaint(owner, clone) {
    const originals = [owner, ...owner.querySelectorAll('*')];
    const copies = [clone, ...clone.querySelectorAll('*')];
    for (let i = 0; i < originals.length; i++) {
      const original = originals[i],
        copy = copies[i],
        paint = getComputedStyle(original);
      for (const attribute of [...copy.attributes]) {
        if (
          /^(id|name|href|tabindex|autofocus|contenteditable|role|aria-.+|on.+)$/i.test(
            attribute.name
          )
        )
          copy.removeAttribute(attribute.name);
      }
      // These are measured native paint values, never a second authored style sheet.
      for (const property of [
        'font',
        'color',
        'letter-spacing',
        'word-spacing',
        'text-align',
        'text-transform',
        'white-space',
        'text-decoration',
        'object-fit',
        'object-position',
        'border-radius',
      ])
        copy.style.setProperty(property, paint.getPropertyValue(property));
      if (copy.matches('img')) {
        copy.removeAttribute('srcset');
        copy.removeAttribute('sizes');
        copy.src = original.currentSrc;
        copy.draggable = false;
      }
    }
    clone.classList.add('fragment-paint');
    return clone;
  }
  function planOwners(snapshot, view, start) {
    const compact = snapshot.compact,
      maxPieces = compact ? 40 : 96,
      caps = {
        pieces: maxPieces,
        owners: compact ? 20 : 32,
        descendants: compact ? 600 : 1500,
        textBytes: compact ? 12288 : 32768,
        layerPixels: compact ? 3000000 : 8000000,
      },
      usage = { pieces: 0, owners: 0, descendants: 1, textBytes: 0, layerPixels: 0 },
      planned = [];
    const pixelRatio = window.devicePixelRatio || 1;
    if (!Number.isFinite(pixelRatio) || pixelRatio <= 0) return false;
    // All native reads and admission happen before any clone or visibility write.
    const selected = candidates(snapshot);
    if (!selected) return false;
    for (const { owner, rect } of selected) {
      const image = owner.matches('img'),
        count = compact ? (image ? 8 : 6) : image ? 12 : 10,
        visible = {
          x: Math.max(-64, rect.left),
          y: Math.max(-64, rect.top),
          width: Math.min(snapshot.width + 64, rect.right) - Math.max(-64, rect.left),
          height: Math.min(snapshot.height + 64, rect.bottom) - Math.max(-64, rect.top),
        },
        cells = geometry.partition(
          visible,
          { count, seed: planned.length + 1 },
          { maxPieces, usedPieces: usage.pieces }
        );
      if (!cells) return false;
      usage.pieces += cells.length;
      usage.owners++;
      const descendants = owner.querySelectorAll('*').length;
      usage.descendants += (descendants + 2) * cells.length + descendants + 1;
      usage.textBytes += (owner.textContent?.length || 0) * 3 * (cells.length + 1);
      // Native DOM paint uses actual device DPR, unlike the separately capped Canvas.
      usage.layerPixels += rect.width * rect.height * cells.length * pixelRatio ** 2;
      if (!geometry.admit(usage, caps) || clock() - start > 160) return false;
      const cellsPrepared = cells.map((cell) => ({
        cell,
        geometry: geometry.piece(cell, view, { depth: 12 }),
      }));
      if (cellsPrepared.some((cell) => !cell.geometry)) return false;
      planned.push({ owner, rect, cells: cellsPrepared });
    }
    return planned.length ? planned : null;
  }
  function prepare(nextPhase, snapshot) {
    clear();
    if (
      failed ||
      !reduced?.addEventListener ||
      reduced.matches ||
      document.hidden ||
      document.fonts?.status === 'loading'
    )
      return false;
    const view = camera(snapshot);
    if (!view || (nextPhase === 'arrive' && arrivalStatus(snapshot) !== 'ready')) return false;
    const start = clock();
    const arrivalTime = () =>
      snapshot.remainingMs - Math.max(0, clock() - (snapshot.capturedAt ?? start));
    if (nextPhase === 'arrive' && arrivalTime() < 250) return false;
    const planned = planOwners(snapshot, view, start);
    if (!planned) return false;
    const container = document.createElement('div');
    container.className = 'fragment-layer';
    container.inert = true;
    container.setAttribute('aria-hidden', 'true');
    try {
      for (const { owner, rect, cells } of planned) {
        const nativePaint = freezePaint(owner, owner.cloneNode(true));
        for (const { cell, geometry: prepared } of cells) {
          const tile = document.createElement('div');
          tile.className = 'fragment-piece';
          tile.style.width = cell.width + 'px';
          tile.style.height = cell.height + 'px';
          const paint = nativePaint.cloneNode(true);
          paint.style.width = rect.width + 'px';
          paint.style.height = rect.height + 'px';
          paint.style.left = rect.left - cell.x + 'px';
          paint.style.top = rect.top - cell.y + 'px';
          tile.append(paint);
          container.append(tile);
          pieces.push({ tile, prepared });
        }
      }
      if (clock() - start > 160 || (nextPhase === 'arrive' && arrivalTime() < 250))
        throw Error('Fragment preparation deadline');
      layer = container;
      content.after(layer);
      for (const { owner } of planned) {
        hidden.push([owner, owner.style.visibility]);
        owner.style.visibility = 'hidden';
      }
      phase = nextPhase;
      viewState = snapshot;
      content.dataset.fragmentPieces = String(pieces.length);
      content.dataset.fragmentPhase = phase;
      watch();
      return true;
    } catch {
      container.remove();
      clear();
      failed = true;
      return false;
    }
  }
  function matrix(points, width, height) {
    const [a, b, c, d] = points,
      dx1 = b[0] - c[0],
      dx2 = d[0] - c[0],
      dx3 = a[0] - b[0] + c[0] - d[0],
      dy1 = b[1] - c[1],
      dy2 = d[1] - c[1],
      dy3 = a[1] - b[1] + c[1] - d[1],
      determinant = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(determinant) < 1e-9) return null;
    const g = (dx3 * dy2 - dx2 * dy3) / determinant,
      h = (dx1 * dy3 - dx3 * dy1) / determinant,
      values = [
        (b[0] - a[0] + g * b[0]) / width,
        (b[1] - a[1] + g * b[1]) / width,
        0,
        g / width,
        (d[0] - a[0] + h * d[0]) / height,
        (d[1] - a[1] + h * d[1]) / height,
        0,
        h / height,
        0,
        0,
        1,
        0,
        a[0],
        a[1],
        0,
        1,
      ];
    return values.every(Number.isFinite) ? 'matrix3d(' + values.join(',') + ')' : null;
  }
  function present(progress, snapshot) {
    if (!phase || failed) return false;
    if (
      snapshot?.width !== viewState.width ||
      snapshot?.height !== viewState.height ||
      document.hidden ||
      reduced.matches
    ) {
      invalidate();
      return false;
    }
    const view = camera(snapshot);
    if (!view) {
      invalidate();
      return false;
    }
    const arrivalStart = Math.max(0.5, viewState.progress || 0.5);
    const local = Math.max(
      0,
      Math.min(
        1,
        phase === 'depart' ? progress / 0.46 : (progress - arrivalStart) / (1 - arrivalStart)
      )
    );
    for (const { tile, prepared } of pieces) {
      const projected = geometry.sample(prepared, {
        phase,
        progress: local,
        view,
        anchor: viewState.anchor,
      });
      const transform =
        projected && matrix(projected.points, prepared.rect.width, prepared.rect.height);
      tile.style.opacity = transform ? String(projected.opacity) : '0';
      if (transform) tile.style.transform = transform;
    }
    content.style.transform = 'none';
    content.style.opacity = String(
      phase === 'depart' ? 1 - smooth(progress / 0.18) : smooth((progress - 0.78) / 0.22)
    );
    return true;
  }
  return {
    begin() {
      clear();
      failed = false;
    },
    prepare,
    arrivalStatus,
    present,
    clear,
    active: () => phase !== null && !failed,
  };
};
