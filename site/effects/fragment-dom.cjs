'use strict';
// Temporary native-paint prototype. The producer injects the pure geometry factory.
module.exports = function (content, geometry, onFallback = null) {
  let layer = null,
    pieces = [],
    hidden = [],
    phase = null,
    viewState = null,
    arrivalStartedAt = null,
    arrivalElapsedMs = 0,
    arrivalWindowMs = 0,
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
    arrivalStartedAt = null;
    arrivalElapsedMs = 0;
    arrivalWindowMs = 0;
    delete content.dataset.fragmentPhase;
    delete content.dataset.fragmentPieces;
    delete content.dataset.fragmentOwners;
    delete content.dataset.fragmentElapsedMs;
    delete content.dataset.fragmentSettled;
    delete content.dataset.fragmentDurationMs;
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
  function candidateRect(owner, snapshot) {
    const rect = owner.getBoundingClientRect();
    return rect.width > 0 &&
      rect.height > 0 &&
      rect.right > -64 &&
      rect.left < snapshot.width + 64 &&
      rect.bottom > -64 &&
      rect.top < snapshot.height + 64 &&
      !owner.closest('[hidden]') &&
      getComputedStyle(owner).visibility === 'visible'
      ? rect
      : null;
  }
  function inspectCandidate(owner, snapshot, nextPhase, start) {
    if (clock() - start > 160) return false;
    if (
      owner.matches('p') &&
      (owner.textContent?.trim().length || 0) < (nextPhase === 'arrive' ? 1 : 60)
    )
      return null;
    const rect = candidateRect(owner, snapshot);
    if (clock() - start > 160) return false;
    if (!rect || (nextPhase === 'arrive' && (rect.width < 4 || rect.height < 4))) return null;
    if (owner.matches('img') && (!owner.complete || !owner.naturalWidth || !owner.currentSrc))
      return false;
    // No SVG IDs/references, media, controls or dynamic paint in this backend.
    if (owner.querySelector('svg,canvas,video,iframe,input,button,select,textarea')) return false;
    return { owner, rect };
  }
  function candidates(snapshot, nextPhase, start) {
    const result = [];
    const selectors =
      nextPhase === 'arrive'
        ? ['main h1, main h2, main h3, main p, main img']
        : ['main h1, main h2, main h3', 'main p', 'main img'];
    for (const selector of selectors) {
      for (const owner of content.querySelectorAll(selector)) {
        const candidate = inspectCandidate(owner, snapshot, nextPhase, start);
        if (candidate === false) return null;
        if (!candidate) continue;
        result.push(candidate);
        if (nextPhase === 'depart') break;
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
      snapshot.active === false ||
      !(snapshot.progress >= 0.5 && snapshot.progress <= 1) ||
      !Number.isFinite(snapshot.capturedAt) ||
      clock() - snapshot.capturedAt > 160
    )
      return 'fallback';
    const center = view.camera(snapshot.anchor);
    if (center[2] <= 0.5) return snapshot.progress === 1 ? 'fallback' : 'wait';
    const point = view.project(center);
    return point.every(Number.isFinite) &&
      point[0] >= -64 &&
      point[0] <= snapshot.width + 64 &&
      point[1] >= -64 &&
      point[1] <= snapshot.height + 64
      ? 'ready'
      : snapshot.progress === 1
        ? 'fallback'
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
        'line-height',
        'color',
        'box-sizing',
        'display',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'letter-spacing',
        'word-spacing',
        'text-align',
        'text-indent',
        'text-transform',
        'white-space',
        'overflow-wrap',
        'word-break',
        'hyphens',
        'direction',
        'vertical-align',
        'text-decoration',
        'object-fit',
        'object-position',
        'background-color',
        'box-shadow',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left',
        'border-radius',
      ])
        copy.style.setProperty(property, paint.getPropertyValue(property));
      // Copies leave their original parent selectors. Their native border-box
      // padding and line layout must survive that move so the final glyphs land
      // at their reading positions, not just their outer element rectangles.
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
  function planOwners(snapshot, view, start, nextPhase) {
    const compact = snapshot.compact,
      maxPieces = compact ? 40 : 96,
      caps = {
        pieces: maxPieces,
        owners: compact ? 20 : 32,
        descendants: compact ? 600 : 1500,
        textBytes: compact ? 12288 : 32768,
        layerPixels: compact ? 3000000 : 8000000,
      },
      usage = {
        pieces: 0,
        owners: 0,
        descendants: 2,
        textBytes: 0,
        layerPixels: 0,
      },
      planned = [];
    const pixelRatio = window.devicePixelRatio || 1;
    if (!Number.isFinite(pixelRatio) || pixelRatio <= 0) return false;
    // All native reads and admission happen before any clone or visibility write.
    const selected = candidates(snapshot, nextPhase, start);
    if (!selected) return false;
    const measured = selected.map((item) => ({
      ...item,
      descendants: item.owner.querySelectorAll('*').length,
    }));
    const arrivalCount =
      nextPhase === 'arrive' ? arrivalAllowance(measured, caps, pixelRatio) : Infinity;
    if (arrivalCount < 1) return false;
    for (const { owner, rect, descendants } of measured) {
      const image = owner.matches('img'),
        count = Math.min(arrivalCount, compact ? (image ? 8 : 6) : image ? 12 : 10),
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
      usage.descendants += (descendants + 5) * cells.length + descendants + 1;
      usage.textBytes += (owner.textContent?.length || 0) * 3 * (cells.length + 1);
      // Native DOM paint uses actual device DPR, unlike the separately capped Canvas.
      const volumePixels = cells.reduce(
        (sum, cell) => sum + (cell.width + 36) * (cell.height + 36),
        0
      );
      usage.layerPixels +=
        (rect.width * rect.height * cells.length + volumePixels) * pixelRatio ** 2;
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
  function arrivalAllowance(measured, caps, pixelRatio) {
    if (!measured.length || measured.length > caps.owners) return 0;
    const descendantCopies = measured.reduce((sum, item) => sum + item.descendants + 5, 0);
    const retainedDescendants = measured.reduce((sum, item) => sum + item.descendants + 1, 0);
    const textBytes = measured.reduce(
      (sum, item) => sum + (item.owner.textContent?.length || 0) * 3,
      0
    );
    const nativePixels = measured.reduce(
      (sum, item) =>
        sum +
        (item.rect.width * item.rect.height + (item.rect.width + 36) * (item.rect.height + 36)) *
          pixelRatio ** 2,
      0
    );
    // Share the unchanged transaction caps across all visible incoming owners,
    // instead of spending the allowance on only one heading and one paragraph.
    return Math.floor(
      Math.min(
        caps.pieces / measured.length,
        (caps.descendants - 2 - retainedDescendants) / descendantCopies,
        textBytes ? caps.textBytes / textBytes - 1 : Infinity,
        caps.layerPixels / nativePixels
      )
    );
  }
  function prepare(nextPhase, snapshot) {
    clear();
    if (
      failed ||
      !document.createElementNS ||
      !window.CSS?.supports('clip-path', 'polygon(0 0,100% 0,0 100%)') ||
      !reduced?.addEventListener ||
      reduced.matches ||
      document.hidden ||
      document.fonts?.status === 'loading'
    )
      return false;
    const view = camera(snapshot);
    if (!view || (nextPhase === 'arrive' && arrivalStatus(snapshot) !== 'ready')) return false;
    const start = clock();
    const planned = planOwners(snapshot, view, start, nextPhase);
    if (!planned) return false;
    const timings =
      nextPhase === 'arrive'
        ? geometry.arrivalSchedule(
            planned.map(({ rect, cells }) => ({
              rect: {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
              },
              cells: cells.map(({ cell }) => cell),
            }))
          )
        : null;
    if (nextPhase === 'arrive' && !timings) return false;
    const container = document.createElement('div');
    container.className = 'fragment-layer';
    container.inert = true;
    container.setAttribute('aria-hidden', 'true');
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const volume = document.createElementNS(svgNamespace, 'svg');
    volume.setAttribute('class', 'fragment-volume');
    volume.setAttribute('width', String(snapshot.width));
    volume.setAttribute('height', String(snapshot.height));
    volume.setAttribute('viewBox', '0 0 ' + snapshot.width + ' ' + snapshot.height);
    container.append(volume);
    try {
      for (let ownerIndex = 0; ownerIndex < planned.length; ownerIndex++) {
        const { owner, rect, cells } = planned[ownerIndex];
        const nativePaint = freezePaint(owner, owner.cloneNode(true));
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
          const { cell, geometry: prepared } = cells[cellIndex];
          const tile = document.createElement('div');
          tile.className = 'fragment-piece';
          tile.style.width = cell.width + 'px';
          tile.style.height = cell.height + 'px';
          tile.style.clipPath =
            'polygon(' +
            prepared.polygon.map(([x, y]) => x * 100 + '% ' + y * 100 + '%').join(',') +
            ')';
          const paint = nativePaint.cloneNode(true);
          paint.style.width = rect.width + 'px';
          paint.style.height = rect.height + 'px';
          paint.style.left = rect.left - cell.x + 'px';
          paint.style.top = rect.top - cell.y + 'px';
          tile.append(paint);
          container.append(tile);
          const solid = document.createElementNS(svgNamespace, 'g');
          const facets = ['light', 'dark'].map((shade) => {
            const face = document.createElementNS(svgNamespace, 'path');
            face.setAttribute('class', 'fragment-facet-' + shade);
            solid.append(face);
            return face;
          });
          volume.append(solid);
          pieces.push({
            tile,
            solid,
            facets,
            prepared,
            facetAreaLimit: (cell.width + 36) * (cell.height + 36),
            timing: timings?.[ownerIndex][cellIndex],
          });
        }
      }
      if (clock() - start > 160) throw Error('Fragment preparation deadline');
      if (nextPhase === 'arrive') {
        arrivalWindowMs = geometry.arrivalWindow(
          snapshot.travelElapsedMs ?? 0,
          clock() - (snapshot.capturedAt ?? start)
        );
        if (!arrivalWindowMs) throw Error('Fragment assembly deadline');
        const scale = arrivalWindowMs / geometry.arrivalDurationMs;
        for (const item of pieces) {
          item.timing = {
            delayMs: item.timing.delayMs * scale,
            durationMs: item.timing.durationMs * scale,
          };
        }
      }
      layer = container;
      content.after(layer);
      for (const { owner } of planned) {
        hidden.push([owner, owner.style.visibility]);
        owner.style.visibility = 'hidden';
      }
      phase = nextPhase;
      viewState = snapshot;
      if (nextPhase === 'arrive') arrivalStartedAt = clock();
      content.dataset.fragmentPieces = String(pieces.length);
      content.dataset.fragmentOwners = String(planned.length);
      content.dataset.fragmentPhase = phase;
      if (nextPhase === 'arrive') content.dataset.fragmentDurationMs = String(arrivalWindowMs);
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
  function presentFacets(solid, facets, projected, facetAreaLimit, opacity) {
    solid.style.opacity = opacity;
    const sidePoints = projected?.facets.flatMap((face) => face.points) || [];
    const sideArea = sidePoints.length
      ? (Math.max(...sidePoints.map((point) => point[0])) -
          Math.min(...sidePoints.map((point) => point[0]))) *
        (Math.max(...sidePoints.map((point) => point[1])) -
          Math.min(...sidePoints.map((point) => point[1])))
      : 0;
    // Cull only decorative sides if rotation/near-plane scale expands their
    // projected surface beyond its reserved pixels. Native text keeps flying.
    const showFacets = projected && Number.isFinite(sideArea) && sideArea <= facetAreaLimit;
    for (let index = 0; index < facets.length; index++) {
      const faces = showFacets
        ? projected.facets.filter((face) => face.light === (index === 0))
        : [];
      facets[index].setAttribute(
        'd',
        faces
          .map(({ points }) => 'M' + points.map((point) => point.join(' ')).join('L') + 'Z')
          .join('')
      );
    }
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
    if (phase === 'arrive') {
      if (!Number.isFinite(snapshot.capturedAt)) {
        invalidate();
        return false;
      }
      arrivalElapsedMs = Math.max(arrivalElapsedMs, snapshot.capturedAt - arrivalStartedAt);
    }
    let settledPieces = 0;
    for (const { tile, solid, facets, prepared, facetAreaLimit, timing } of pieces) {
      const local = Math.max(
        0,
        Math.min(
          1,
          phase === 'depart'
            ? progress / 0.46
            : (arrivalElapsedMs - timing.delayMs) / timing.durationMs
        )
      );
      if (phase === 'arrive' && local === 1) settledPieces++;
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
      presentFacets(
        solid,
        facets,
        transform ? projected : null,
        facetAreaLimit,
        tile.style.opacity
      );
    }
    if (phase === 'arrive') {
      content.dataset.fragmentElapsedMs = String(arrivalElapsedMs);
      content.dataset.fragmentSettled = String(settledPieces);
    }
    content.style.transform = 'none';
    content.style.opacity = String(
      phase === 'depart' ? 1 - smooth(progress / 0.18) : smooth(arrivalElapsedMs / 300)
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
    complete: () => phase === 'arrive' && arrivalElapsedMs >= arrivalWindowMs,
  };
};
