'use strict';
// Bounded native-paint adapter. The producer injects the pure geometry factory.
module.exports = function (content, geometry, onFallback = null) {
  const settings = geometry.settings;
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
  const transparency = window.matchMedia?.('(prefers-reduced-transparency: reduce)');
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
  // A transaction falls back atomically rather than allocating a retarget.
  function watch() {
    const listen = (target, name, handler, options) => {
      if (!target?.addEventListener) return;
      target.addEventListener(name, handler, options);
      subscriptions.push(() => target.removeEventListener(name, handler, options));
    };
    listen(window, 'resize', invalidate, { passive: true });
    listen(
      window,
      'scroll',
      () => {
        if (
          (window.scrollX || 0) !== viewState?.scrollX ||
          (window.scrollY || 0) !== viewState?.scrollY
        )
          invalidate();
      },
      { passive: true }
    );
    listen(window, 'beforeprint', invalidate);
    listen(window, 'pagehide', invalidate);
    listen(document, 'visibilitychange', () => {
      if (document.hidden) invalidate();
    });
    listen(document.fonts, 'loadingdone', invalidate);
    listen(reduced, 'change', invalidate);
    listen(transparency, 'change', invalidate);
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
  function painted(style, pseudo = false) {
    const value = (name) => style.getPropertyValue(name);
    if (pseudo && ['none', 'normal', ''].includes(value('content'))) return false;
    if (value('display') === 'none' || value('visibility') === 'hidden' || value('opacity') === '0')
      return false;
    const color = value('background-color');
    return (
      (color && !['transparent', 'rgba(0, 0, 0, 0)'].includes(color)) ||
      (value('background-image') && value('background-image') !== 'none') ||
      (value('box-shadow') && value('box-shadow') !== 'none') ||
      (pseudo &&
        ['top', 'right', 'bottom', 'left'].some(
          (side) => parseFloat(value('border-' + side + '-width')) > 0
        ))
    );
  }
  function nativePaint(owner) {
    return {
      style: getComputedStyle(owner),
      before: getComputedStyle(owner, '::before'),
      after: getComputedStyle(owner, '::after'),
    };
  }
  function paintBounds(rect, paint) {
    const bounds = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    };
    function shadow(box, style) {
      for (const part of style.getPropertyValue('box-shadow').split(/,(?![^()]*\))/)) {
        if (/\binset\b/.test(part)) continue;
        const lengths = (part.match(/[-+]?(?:\d*\.)?\d+px/g) || []).map(parseFloat);
        if (lengths.length < 2 || !lengths.every(Number.isFinite)) continue;
        const spread = Math.max(0, (lengths[2] || 0) * 2 + (lengths[3] || 0));
        bounds.left = Math.min(bounds.left, box.left + lengths[0] - spread);
        bounds.top = Math.min(bounds.top, box.top + lengths[1] - spread);
        bounds.right = Math.max(bounds.right, box.right + lengths[0] + spread);
        bounds.bottom = Math.max(bounds.bottom, box.bottom + lengths[1] + spread);
      }
    }
    shadow(rect, paint.style);
    for (const pseudo of [paint.before, paint.after]) {
      if (!painted(pseudo, true) || pseudo.getPropertyValue('position') !== 'absolute') continue;
      const left = parseFloat(pseudo.getPropertyValue('left'));
      const top = parseFloat(pseudo.getPropertyValue('top'));
      let width = parseFloat(pseudo.getPropertyValue('width'));
      let height = parseFloat(pseudo.getPropertyValue('height'));
      if (pseudo.getPropertyValue('box-sizing') !== 'border-box') {
        for (const side of ['left', 'right'])
          width +=
            (parseFloat(pseudo.getPropertyValue('padding-' + side)) || 0) +
            (parseFloat(pseudo.getPropertyValue('border-' + side + '-width')) || 0);
        for (const side of ['top', 'bottom'])
          height +=
            (parseFloat(pseudo.getPropertyValue('padding-' + side)) || 0) +
            (parseFloat(pseudo.getPropertyValue('border-' + side + '-width')) || 0);
      }
      if (![left, top, width, height].every(Number.isFinite)) continue;
      const x =
        rect.left + (parseFloat(paint.style.getPropertyValue('border-left-width')) || 0) + left;
      const y =
        rect.top + (parseFloat(paint.style.getPropertyValue('border-top-width')) || 0) + top;
      bounds.left = Math.min(bounds.left, x);
      bounds.top = Math.min(bounds.top, y);
      bounds.right = Math.max(bounds.right, x + width);
      bounds.bottom = Math.max(bounds.bottom, y + height);
      shadow({ left: x, top: y, right: x + width, bottom: y + height }, pseudo);
    }
    return { ...bounds, width: bounds.right - bounds.left, height: bounds.bottom - bounds.top };
  }
  function candidateRect(owner, snapshot, paint) {
    const rect = owner.getBoundingClientRect();
    return rect.width > 0 &&
      rect.height > 0 &&
      rect.right > -64 &&
      rect.left < snapshot.width + 64 &&
      rect.bottom > -64 &&
      rect.top < snapshot.height + 64 &&
      !owner.closest('[hidden]') &&
      paint.style.visibility === 'visible'
      ? rect
      : null;
  }
  function inspectCandidate(owner, start, rect, paint, caps) {
    if (clock() - start > settings.acquisitionMs) return false;
    if (!rect) return null;
    const descendants = owner.querySelectorAll('*').length;
    if (descendants + 6 > caps.descendants || (owner.textContent?.length || 0) * 6 > caps.textBytes)
      return null;
    const images = owner.matches('img') ? [owner] : [...owner.querySelectorAll('img')];
    if (images.some((image) => !image.complete || !image.naturalWidth || !image.currentSrc))
      return null;
    // Unsupported dynamic paint is local: ordinary sibling content still flies.
    if (owner.matches('canvas,video,iframe') || owner.querySelector('canvas,video,iframe'))
      return null;
    const vectors = owner.matches('svg') ? [owner] : [...owner.querySelectorAll('svg')];
    const vectorNodes = [
      ...new Set(vectors.flatMap((vector) => [vector, ...vector.querySelectorAll('*')])),
    ];
    const paintChars =
      (owner.textContent?.length || 0) +
      vectorNodes.reduce(
        (sum, node) =>
          sum +
          [...node.attributes].reduce(
            (size, { name, value }) => size + name.length + value.length + 4,
            0
          ),
        0
      );
    if (paintChars * 6 > caps.textBytes) return null;
    if (vectors.some((vector) => !staticVector(vector))) return null;
    if (owner.matches('svg') && (!staticVectorPaint(paint.style) || !vectorViewport(paint.style)))
      return null;
    if (
      !owner.matches('img,input,select,textarea') &&
      !images.length &&
      !vectors.length &&
      !owner.textContent?.trim()
    )
      return null;
    const measuredLineHeight = parseFloat(paint.style.getPropertyValue('line-height'));
    const lineHeight =
      Number.isFinite(measuredLineHeight) && measuredLineHeight > 0
        ? measuredLineHeight
        : undefined;
    const captured = capturePaint(owner, start, rect, paint);
    return captured && { owner, rect, ...captured, descendants, lineHeight, paintChars };
  }
  function capturePaint(owner, start, rect, paint) {
    const paints = [paint],
      bounds = paintBounds(rect, paint);
    // Inline title paper and nested surface outsets are native paint too. Keep
    // their measured line boxes, not just the outer semantic owner's rectangle.
    for (const child of owner.querySelectorAll('*')) {
      if (clock() - start > settings.acquisitionMs) return false;
      const measured = nativePaint(child);
      measured.dimensions = captureDimensions(child, measured.style);
      if (child.namespaceURI === 'http://www.w3.org/2000/svg' && !staticVectorPaint(measured.style))
        return null;
      if (child.matches('svg') && !vectorViewport(measured.style)) return null;
      paints.push(measured);
      if (
        !child.matches('svg') &&
        !painted(measured.style) &&
        !painted(measured.before, true) &&
        !painted(measured.after, true)
      )
        continue;
      const boxes = child.getClientRects
        ? [...child.getClientRects()]
        : [child.getBoundingClientRect()];
      for (const box of boxes) {
        const childBounds = paintBounds(box, measured);
        bounds.left = Math.min(bounds.left, childBounds.left);
        bounds.top = Math.min(bounds.top, childBounds.top);
        bounds.right = Math.max(bounds.right, childBounds.right);
        bounds.bottom = Math.max(bounds.bottom, childBounds.bottom);
      }
    }
    bounds.width = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;
    return { paints, bounds };
  }
  function captureDimensions(owner, paint) {
    if (
      owner.namespaceURI === 'http://www.w3.org/2000/svg' ||
      ['inline', 'contents', 'none'].includes(paint.getPropertyValue('display')) ||
      ['transform', 'translate', 'rotate', 'scale'].some(
        (property) => !['', 'none'].includes(paint.getPropertyValue(property))
      )
    )
      return null;
    const rect = owner.getBoundingClientRect();
    const dimensions = { width: rect.width, height: rect.height };
    // Computed dimensions can serialize below the native layout-unit boundary.
    // Preserve measured block sizes without assigning dimensions to inline runs.
    if (paint.getPropertyValue('box-sizing') !== 'border-box') {
      for (const [axis, sides] of [
        ['width', ['left', 'right']],
        ['height', ['top', 'bottom']],
      ]) {
        for (const side of sides) {
          dimensions[axis] -=
            (parseFloat(paint.getPropertyValue('padding-' + side)) || 0) +
            (parseFloat(paint.getPropertyValue('border-' + side + '-width')) || 0);
        }
      }
    }
    return Object.values(dimensions).every((value) => Number.isFinite(value) && value > 0)
      ? dimensions
      : null;
  }
  function staticVector(vector) {
    return [vector, ...vector.querySelectorAll('*')].every(
      (node) =>
        node.namespaceURI === 'http://www.w3.org/2000/svg' &&
        node.matches('svg,g,polygon,polyline,path,rect,circle,ellipse,line,title,desc') &&
        [...node.attributes].every(
          ({ name, value }) => !/^(?:href|xlink:href|on.+)$/i.test(name) && !/url\s*\(/i.test(value)
        )
    );
  }
  function staticVectorPaint(style) {
    const animation = style.getPropertyValue('animation-name');
    return (
      (!animation || animation === 'none') &&
      ['filter', 'clip-path', 'mask-image'].every((property) =>
        ['none', ''].includes(style.getPropertyValue(property))
      ) &&
      [
        'fill',
        'stroke',
        'filter',
        'clip-path',
        'mask',
        'marker-start',
        'marker-mid',
        'marker-end',
        'cursor',
        'background-image',
        'content',
      ].every((property) => !/url\s*\(/i.test(style.getPropertyValue(property)))
    );
  }
  function vectorViewport(style) {
    return ['overflow-x', 'overflow-y'].every((property) =>
      ['hidden', 'clip'].includes(style.getPropertyValue(property))
    );
  }
  function candidates(snapshot, start) {
    const result = [];
    const caps = snapshot.compact ? settings.caps.compact : settings.caps.full;
    const selectors =
      'h1,h2,h3,h4,h5,h6,p,img,figure,li,dt,dd,figcaption,blockquote,pre,a,button,label,input,select,textarea,span,time,strong,small';
    function visit(owner) {
      if (clock() - start > settings.acquisitionMs || result.length >= caps.owners) return;
      if (owner.matches('canvas,video,iframe')) return;
      const paint = nativePaint(owner);
      if (paint.style.getPropertyValue('display') === 'contents') {
        if (!owner.closest('[hidden]') && paint.style.visibility === 'visible')
          for (const child of owner.children) visit(child);
        return;
      }
      const rect = candidateRect(owner, snapshot, paint);
      if (!rect) return;
      const inlineGroup =
        owner.matches('div') &&
        owner.children.length > 0 &&
        [...owner.children].every((child) => child.matches('span,time,strong,small'));
      const surface =
        painted(paint.style) || painted(paint.before, true) || painted(paint.after, true);
      const atomic = surface || owner.matches('figure,svg');
      if (atomic || owner.matches(selectors) || inlineGroup) {
        const candidate = inspectCandidate(owner, start, rect, paint, caps);
        if (candidate === false) return;
        if (
          candidate &&
          candidate.descendants + 6 <= caps.descendants &&
          (owner.textContent?.length || 0) * 6 <= caps.textBytes
        ) {
          result.push(candidate);
          return;
        }
        // A shared paper block is atomic. A local fallback keeps the whole
        // block native instead of flying its children over a stationary paper.
        if (atomic) return;
      }
      for (const child of owner.children) visit(child);
    }
    // Prune offscreen sections/cards before inspecting their archived descendants.
    // Selecting an ancestor ends traversal, so inline links/glyphs never paint twice.
    for (const root of content.querySelectorAll('main,footer')) visit(root);
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
      clock() - snapshot.capturedAt > settings.preparationMs
    )
      return 'fallback';
    // Reverse arrivals emerge from behind the camera; a forward-anchor gate
    // would suppress the effect precisely on that navigation direction.
    if (snapshot.direction === 'backward') return 'ready';
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
  function freezePseudo(copy, name, pseudo) {
    // Freeze inactive pseudos too: a mobile block must not gain a desktop
    // backdrop merely because its clone left an ancestor-scoped selector.
    copy.style.setProperty(
      '--fragment-' + name + '-content',
      pseudo.getPropertyValue('content') || 'none'
    );
    if (['none', 'normal', ''].includes(pseudo.getPropertyValue('content'))) return;
    for (const property of [
      'position',
      'display',
      'top',
      'right',
      'bottom',
      'left',
      'width',
      'height',
      'box-sizing',
      'padding',
      'background',
      'border',
      'border-radius',
      'box-shadow',
      'opacity',
      'z-index',
      'transform',
    ])
      copy.style.setProperty(
        '--fragment-' + name + '-' + property,
        pseudo.getPropertyValue(property)
      );
    if (painted(pseudo, true)) copy.classList.add('fragment-surface-' + name);
  }
  function freezeVector(original, copy, paint) {
    if (original.namespaceURI !== 'http://www.w3.org/2000/svg') return;
    for (const property of [
      'fill',
      'fill-opacity',
      'fill-rule',
      'stroke',
      'stroke-opacity',
      'stroke-width',
      'stroke-dasharray',
      'stroke-dashoffset',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-miterlimit',
      'vector-effect',
      'paint-order',
    ])
      copy.style.setProperty(property, paint.getPropertyValue(property));
  }
  function freezeLayout(copy, measured) {
    for (const property of [
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'width',
      'height',
      'min-width',
      'max-width',
      'min-height',
      'max-height',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'flex',
      'order',
    ])
      copy.style.setProperty(property, measured.style.getPropertyValue(property));
    if (measured.dimensions) {
      copy.style.width = measured.dimensions.width + 'px';
      copy.style.height = measured.dimensions.height + 'px';
    }
  }
  function freezePaint(owner, clone, paints) {
    const originals = [owner, ...owner.querySelectorAll('*')];
    const copies = [clone, ...clone.querySelectorAll('*')];
    for (let i = 0; i < originals.length; i++) {
      const original = originals[i],
        copy = copies[i],
        measured = paints[i],
        paint = measured.style;
      for (const attribute of [...copy.attributes]) {
        if (
          /^(id|name|href|form|formaction|formmethod|formenctype|formtarget|tabindex|autofocus|contenteditable|role|aria-.+|on.+)$/i.test(
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
        'list-style-type',
        'list-style-position',
        'flex-direction',
        'flex-wrap',
        'align-items',
        'align-self',
        'justify-content',
        'justify-items',
        'justify-self',
        'align-content',
        'grid-template-columns',
        'grid-template-rows',
        'grid-auto-flow',
        'grid-auto-columns',
        'grid-auto-rows',
        'grid-column',
        'grid-row',
        'gap',
        'row-gap',
        'column-gap',
        'text-decoration',
        'object-fit',
        'object-position',
        'background-color',
        'background-image',
        'background-position',
        'background-size',
        'background-repeat',
        'background-origin',
        'background-clip',
        'box-shadow',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left',
        'border-radius',
        'box-decoration-break',
        '-webkit-box-decoration-break',
        'isolation',
        'z-index',
        'opacity',
        'overflow',
      ])
        copy.style.setProperty(property, paint.getPropertyValue(property));
      if (i > 0) freezeLayout(copy, measured);
      freezeVector(original, copy, paint);
      copy.classList.add('fragment-frozen-paint');
      if (painted(paint)) copy.classList.add('fragment-surface-paint');
      for (const name of ['before', 'after']) freezePseudo(copy, name, measured[name]);
      // Copies leave their original parent selectors. Their native border-box
      // padding and line layout must survive that move so the final glyphs land
      // at their reading positions, not just their outer element rectangles.
      if (copy.matches('img')) {
        copy.removeAttribute('srcset');
        copy.removeAttribute('sizes');
        copy.src = original.currentSrc;
        copy.draggable = false;
      }
      if (copy.matches('input,textarea,select')) copy.value = original.value;
      if (copy.matches('input')) copy.checked = original.checked;
    }
    clone.classList.add('fragment-paint');
    return clone;
  }
  function planUsage(planned, pixelRatio) {
    const usage = {
      pieces: 0,
      owners: planned.length,
      descendants: 2,
      textBytes: 0,
      layerPixels: 0,
    };
    for (const { paintChars, descendants, cells } of planned) {
      usage.pieces += cells.length;
      usage.descendants += (descendants + 5) * cells.length + descendants + 1;
      usage.textBytes += paintChars * 3 * (cells.length + 1);
      // contain:paint and the convex mask bound each tile's raster to its clip
      // box. The absolute native clone extends outside it but cannot paint there.
      usage.layerPixels +=
        cells.reduce(
          (sum, cell) =>
            sum +
            cell.width * cell.height +
            (cell.width + settings.facetGutterPx) * (cell.height + settings.facetGutterPx),
          0
        ) *
        pixelRatio ** 2;
    }
    return usage;
  }
  function growShardCounts(planned, caps, pixelRatio, start) {
    let changed = true;
    while (changed && clock() - start <= settings.allocationMs) {
      changed = false;
      for (const item of planned) {
        if (clock() - start > settings.allocationMs) return;
        if (item.blocked || item.cells.length >= item.desired) continue;
        const previous = item.cells;
        const usage = planUsage(planned, pixelRatio);
        const cells = geometry.partition(
          item.visible,
          { count: previous.length + 1, seed: item.seed, minSize: settings.shard.minSizePx },
          { maxPieces: caps.pieces, usedPieces: usage.pieces - previous.length }
        );
        if (!cells) {
          item.blocked = true;
          continue;
        }
        item.cells = cells;
        if (!geometry.admit(planUsage(planned, pixelRatio), caps)) {
          item.cells = previous;
          item.blocked = true;
        } else changed = true;
      }
    }
  }
  function planOwners(snapshot, view, start) {
    const caps = snapshot.compact ? settings.caps.compact : settings.caps.full;
    const pixelRatio = window.devicePixelRatio || 1;
    if (!Number.isFinite(pixelRatio) || pixelRatio <= 0) return false;
    const planned = [];
    const selected = candidates(snapshot, start);
    // Every admitted visible owner gets complete paint coverage first. Extra
    // small shards share the remaining transaction allowance in both directions.
    for (const candidate of selected) {
      const { owner, bounds, lineHeight } = candidate;
      const visible = {
        x: Math.max(-64, bounds.left),
        y: Math.max(-64, bounds.top),
        width: Math.min(snapshot.width + 64, bounds.right) - Math.max(-64, bounds.left),
        height: Math.min(snapshot.height + 64, bounds.bottom) - Math.max(-64, bounds.top),
      };
      const seed = planned.length + 1;
      const cells = geometry.partition(
        visible,
        { count: 1, seed, minSize: settings.shard.minSizePx },
        { maxPieces: caps.pieces, usedPieces: planUsage(planned, pixelRatio).pieces }
      );
      if (!cells) continue;
      const item = {
        ...candidate,
        visible,
        seed,
        cells,
        desired: geometry.pieceCount(visible, {
          image: owner.matches('img,figure,svg'),
          lineHeight,
          compact: snapshot.compact,
        }),
      };
      if (!geometry.admit(planUsage([...planned, item], pixelRatio), caps)) continue;
      planned.push(item);
    }
    if (!planned.length) return null;
    growShardCounts(planned, caps, pixelRatio, start);
    if (clock() - start > settings.preparationMs) return false;
    for (const item of planned) {
      item.cells = item.cells.map((cell) => ({
        cell,
        geometry: geometry.piece(cell, view, { depth: settings.nativeDepth }),
      }));
      if (item.cells.some((cell) => !cell.geometry)) return false;
    }
    return planned;
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
    const planned = planOwners(snapshot, view, start);
    if (!planned) return false;
    const groups = planned.map(({ rect, cells }) => ({
      rect: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
      cells: cells.map(({ cell }) => cell),
    }));
    const timings =
      nextPhase === 'arrive'
        ? geometry.arrivalSchedule(groups)
        : geometry.departureSchedule(groups);
    if (!timings) return false;
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
        const { owner, rect, paints, cells } = planned[ownerIndex];
        const nativePaint = freezePaint(owner, owner.cloneNode(true), paints);
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
          // Paper outsets can fall between layout units. Keep their local
          // offset in the transform so it cancels the shard's exact origin.
          paint.style.left = '0px';
          paint.style.top = '0px';
          paint.style.transform =
            'translate3d(' + (rect.left - cell.x) + 'px,' + (rect.top - cell.y) + 'px,0)';
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
            facetAreaLimit:
              (cell.width + settings.facetGutterPx) * (cell.height + settings.facetGutterPx),
            timing: timings?.[ownerIndex][cellIndex],
          });
        }
      }
      if (clock() - start > settings.preparationMs) throw Error('Fragment preparation deadline');
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
      viewState = { ...snapshot, scrollX: window.scrollX || 0, scrollY: window.scrollY || 0 };
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
      (window.scrollX || 0) !== viewState.scrollX ||
      (window.scrollY || 0) !== viewState.scrollY ||
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
            ? (progress - timing.delayProgress) / timing.durationProgress
            : (arrivalElapsedMs - timing.delayMs) / timing.durationMs
        )
      );
      if (phase === 'arrive' && local === 1) settledPieces++;
      const projected = geometry.sample(prepared, {
        phase,
        progress: local,
        view,
        anchor: viewState.anchor,
        sourceAnchor: viewState.sourceAnchor,
        direction: viewState.direction || 'forward',
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
