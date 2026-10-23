/* Shared native reading-entry controller. */
window.SiteScrollEntry=(function () {
  const targets = [
    '.hero-copy',
    '.hero-copy > *',
    '.portrait-composition',
    '.shift-intro > p',
    '.research-note > .note-row',
    '.archive-intro > .eyebrow',
    '.archive-intro > h1',
    '.archive-intro > .hero-description',
    '.section-heading',
    '.research-card',
    '.topic-card',
    '.help-grid article',
    '.ack-leads article',
    '.ack-compact article',
    '.ack-grid article',
    '.discussion-row',
    '.about-grid > div',
    '.about-grid > h2',
    '.about-section > .eyebrow',
    '.context-heading',
    '.archive-link',
    '.contact-grid > div',
    '.publication',
    '.credits-page > p',
    '.credits-page > h1',
    '.credits-page > h2',
    '.archive-heading',
    '.archive-count',
    '.empty-state',
    '.year-landing',
    '.archive-landings > .topic-landing',
    '.writing-topic',
    '.year-heading',
    '.section-note',
    '.next-route > p',
    '.next-route > a',
  ].join(',');
  const routeTargets = `${targets},.archive-filters,.section-nav,.topic-nav`;
  const separatorTargets = [
    '.shift-intro',
    '.research-note',
    '.section',
    '.section-nav',
    '.research-card',
    '.help-grid article',
    '.ack-leads article',
    '.ack-compact article',
    '.ack-grid article',
    '.topic-card',
    '.publication',
    '.next-route',
    '.discussion-row',
    '.empty-state',
  ].join(',');
  const records = new Map();
  const routeUnits = new Map();
  const knownRecords = new Map();
  const separators = new Map();
  const active = new Map();
  const pendingReading = new Map();
  const listeners = [];
  let root = null;
  let footer = null;
  let observer = null;
  let generation = 0;
  let suspended = true;
  let failed = false;
  let reconcileTask = null;
  let previousY = 0;
  let direction = 0;
  let jumpUntil = 0;
  let booted = false;
  let routeGeneration = 0;
  let routePhase = null;
  let routePrepared = null;
  let holdTask = null;
  let nextUnitId = 0;
  let readingDistance = 0;
  let readingDuration = 700;
  let readingStagger = 80;
  let readingBorders = [];
  const routeActive = new Set();
  const clock = () => window.performance?.now() ?? Date.now();

  function animationMark() {
    const timeline = document.timeline?.currentTime;
    return { started: clock(), timelineStarted: Number.isFinite(timeline) ? timeline : null };
  }
  function animationElapsed(mark) {
    const timeline = document.timeline?.currentTime;
    // CSS events and their start marks share the frame-sampled document clock.
    // Retain a paired wall-clock fallback when either timeline mark is absent.
    return Number.isFinite(mark.timelineStarted) && Number.isFinite(timeline)
      ? timeline - mark.timelineStarted
      : clock() - mark.started;
  }
  function listen(target, name, handler, options) {
    target?.addEventListener?.(name, handler, options);
    listeners.push(() => target?.removeEventListener?.(name, handler, options));
  }
  function clearState(element) {
    clearSeparators('reading', element);
    window.clearTimeout(active.get(element)?.timer);
    active.delete(element);
    pendingReading.delete(element);
    element.removeAttribute('data-scroll-entry');
    element.removeAttribute('data-scroll-delay');
  }
  function finish(element) {
    const record = records.get(element);
    if (!record) return;
    record.done = true;
    clearState(element);
    // Keep the native shell observed: a later complete exit below the viewport
    // arms its next ordinary downward entry without measuring every scroll.
  }
  function disconnect() {
    generation++;
    observer?.disconnect();
    observer = null;
    window.clearTimeout(reconcileTask);
    reconcileTask = null;
  }
  function settle(target = null) {
    cancelRoute();
    for (const element of records.keys()) {
      if (!target || element === target || element.contains(target) || target.contains(element))
        finish(element);
    }
  }
  function suspend() {
    suspended = true;
    disconnect();
    for (const element of records.keys()) {
      if (active.has(element)) finish(element);
      else clearState(element);
    }
  }
  function fail() {
    failed = true;
    suspend();
    settle();
  }
  function guarded(action) {
    return (...args) => {
      try {
        return action(...args);
      } catch {
        fail();
      }
    };
  }
  function guardedPhase(action) {
    return (...args) => {
      try {
        return action(...args);
      } catch {
        fail();
        return Promise.resolve({ completed: false, cancelled: true, completedBy: 'fallback' });
      }
    };
  }
  function enabled() {
    return window.SiteNavigation?.contentFlight?.() !== false;
  }
  function allowed() {
    return (
      !failed &&
      enabled() &&
      !document.hidden &&
      window.SiteScene?.motionState?.().enabled === true &&
      window.IntersectionObserver &&
      window.CSS?.supports?.('translate', '0 1px') &&
      window.CSS?.supports?.('animation-name', 'scroll-entry-rise')
    );
  }
  function routeAllowed() {
    return allowed() && window.CSS?.supports?.('overflow', 'clip');
  }
  function refreshInventory() {
    const candidates = [...root.querySelectorAll(targets)];
    const units = [...root.querySelectorAll(routeTargets)];
    if (footer) units.push(...footer.querySelectorAll(':scope > p,:scope > a'));
    // A display:contents group has no movable paper or native box. Its visible
    // children own the animation instead; ordinary groups still prune them.
    const boxless = new Set(
      [...new Set([...candidates, ...units])].filter(
        (element) => window.getComputedStyle(element).display === 'contents'
      )
    );
    const shells = (elements) =>
      elements.filter(
        (element) =>
          !boxless.has(element) &&
          !elements.some(
            (other) => other !== element && !boxless.has(other) && other.contains(element)
          )
      );
    const nextRecords = shells(candidates);
    const nextUnits = shells(units);
    const previous = [...records];
    const recordFor = (element) => {
      let record = knownRecords.get(element);
      if (!record) {
        record = { done: false, ink: null, id: String(++nextUnitId) };
        knownRecords.set(element, record);
      }
      // A responsive group first settles visible content read through its
      // parent or children. Below-fold groups keep their repeatable entry.
      if (
        previous.some(
          ([other, state]) =>
            state.done && (other === element || other.contains(element) || element.contains(other))
        )
      )
        record.done = true;
      return record;
    };
    for (const element of records.keys()) {
      if (nextRecords.includes(element)) continue;
      if (active.has(element)) finish(element);
      else clearState(element);
      observer?.unobserve(element);
    }
    for (const element of routeUnits.keys()) {
      if (nextUnits.includes(element)) continue;
      clearRouteUnit(element);
      routeActive.delete(element);
    }
    records.clear();
    routeUnits.clear();
    for (const element of nextRecords) records.set(element, recordFor(element));
    for (const element of nextUnits) routeUnits.set(element, recordFor(element));
    readingBorders = readingBorders.filter((model) => records.has(model.owner));
  }
  function wrapInk(element, record) {
    // Inline text needs one movable layer; publication/grid children stay intact.
    if (!element.matches('p,h1,h2,h3,a')) return;
    const ink = document.createElement('span');
    ink.setAttribute('data-scroll-ink', '');
    ink.append(...element.childNodes);
    element.append(ink);
    record.ink = ink;
  }
  function clearSeparators(mode, owner = null) {
    const released = new Set();
    for (const [source, entry] of separators) {
      if (entry.mode !== mode) continue;
      const removed = entry.layers.filter((layer) => !owner || layer.owner === owner);
      for (const layer of removed) {
        layer.node.remove();
        released.add(layer.owner);
      }
      entry.layers = entry.layers.filter((layer) => owner && layer.owner !== owner);
      for (const side of ['top', 'right', 'bottom', 'left']) {
        if (!entry.layers.some((layer) => layer.side === side))
          source.removeAttribute(`data-entry-border-${side}-owner`);
      }
      if (!entry.layers.length) {
        source.removeAttribute('data-entry-border-source');
        source.removeAttribute('data-entry-border-owner');
        separators.delete(source);
      }
    }
    for (const element of released) {
      if (
        [...separators.values()].some((entry) =>
          entry.layers.some((layer) => layer.owner === element)
        )
      )
        continue;
      element.removeAttribute('data-entry-separator-owner');
      element.removeAttribute('data-entry-border-owner');
      if (element.hasAttribute('data-entry-separator-shell')) {
        element.remove();
        routeUnits.delete(element);
      }
    }
  }
  function separatorSources(units, isolated) {
    const sources = new Set(isolated ? root.querySelectorAll(separatorTargets) : []);
    if (isolated && footer) sources.add(footer);
    for (const { element } of units) {
      let source = element;
      while (source && source !== root?.parentElement && source !== footer?.parentElement) {
        sources.add(source);
        if (source === root || source === footer) break;
        source = source.parentElement;
      }
    }
    return sources;
  }
  function separatorOwner(source, rect, side, width, descendants, isolated) {
    const coordinate = side === 'bottom' ? rect.bottom - width : rect.top;
    const owned = descendants.find(({ element }) => element === source);
    const eligible = owned ? [owned] : descendants.filter((unit) => unit.visible);
    if (isolated && !owned && (coordinate < -32 || coordinate > window.innerHeight + 32))
      return null;
    let owner = [...eligible].sort(
      (a, b) => Math.abs(a.rect.top - coordinate) - Math.abs(b.rect.top - coordinate)
    )[0];
    if (!owner && isolated && coordinate >= 0 && coordinate < window.innerHeight) {
      owner = { element: null, record: null, native: rect, isolated: true };
    }
    // A restored/initial-fold divider already visible above unseen ink stays
    // native. Its below-fold child retains its independent reading entry.
    if (
      owner &&
      !isolated &&
      !owned &&
      coordinate < window.innerHeight &&
      owner.native.top >= window.innerHeight
    )
      return null;
    return owner;
  }
  function separatorModel(source, rect, side, width, paint, color, owner) {
    const horizontal = side === 'top' || side === 'bottom';
    const ownerRect = owner.native;
    const ownerStyle = window.getComputedStyle(owner.element || source);
    const insetLeft = Number.parseFloat(ownerStyle.getPropertyValue('border-left-width')) || 0;
    const insetTop = Number.parseFloat(ownerStyle.getPropertyValue('border-top-width')) || 0;
    const left = side === 'right' ? rect.right - width : rect.left;
    const top = side === 'bottom' ? rect.bottom - width : rect.top;
    const model = {
      source,
      owner: owner.element,
      record: owner.record,
      side,
      width,
      paint,
      color,
      length: horizontal ? rect.width : rect.height,
      left: left - ownerRect.left - insetLeft,
      top: top - ownerRect.top - insetTop,
      isolated: owner.isolated === true,
      native: {
        top,
        bottom: horizontal ? top + width : rect.bottom,
        left,
        right: horizontal ? rect.right : left + width,
        width: horizontal ? rect.width : width,
        height: horizontal ? width : rect.height,
      },
    };
    if (![model.length, model.left, model.top].every(Number.isFinite) || model.length <= 0)
      return null;
    if (owner.rect) {
      owner.rect.top = Math.min(owner.rect.top, top);
      owner.rect.bottom = Math.max(owner.rect.bottom, model.native.bottom);
    }
    return model;
  }
  function measureSeparators(units, isolated = false) {
    const sources = separatorSources(units, isolated);
    const models = [];
    for (const source of sources) {
      if (!source.getBoundingClientRect || !source.getClientRects?.().length) continue;
      const style = window.getComputedStyle(source);
      const rect = source.getBoundingClientRect();
      const descendants = units.filter(
        ({ element }) => element === source || source.contains(element)
      );
      for (const side of ['top', 'right', 'bottom', 'left']) {
        const width = Number.parseFloat(style.getPropertyValue(`border-${side}-width`));
        const paint = style.getPropertyValue(`border-${side}-style`);
        const color = style.getPropertyValue(`border-${side}-color`);
        if (!Number.isFinite(width) || width <= 0 || ['none', 'hidden'].includes(paint)) continue;
        const owner = separatorOwner(source, rect, side, width, descendants, isolated);
        if (!owner) continue;
        const model = separatorModel(source, rect, side, width, paint, color, owner);
        if (model) models.push(model);
      }
    }
    return models;
  }
  function materializeSeparators(models, measured) {
    for (const model of models) {
      if (!model.isolated) continue;
      const shell = document.createElement('span');
      shell.setAttribute('data-entry-separator-shell', '');
      shell.setAttribute('aria-hidden', 'true');
      for (const name of ['left', 'top'])
        shell.style.setProperty(`--entry-separator-shell-${name}`, `${model[name]}px`);
      for (const name of ['width', 'height'])
        shell.style.setProperty(`--entry-separator-shell-${name}`, `${model.native[name]}px`);
      model.source.append(shell);
      model.owner = shell;
      model.record = { done: false, ink: null, id: String(++nextUnitId), isolated: true };
      model.left = 0;
      model.top = 0;
      routeUnits.set(shell, model.record);
      measured.push({
        element: shell,
        record: model.record,
        native: model.native,
        rect: { ...model.native },
        visible: true,
      });
    }
  }
  function attachSeparators(models, mode, owner = null) {
    for (const model of models) {
      if (owner && model.owner !== owner) continue;
      let entry = separators.get(model.source);
      if (!entry) {
        entry = { mode, layers: [] };
        separators.set(model.source, entry);
      }
      const node = document.createElement('span');
      node.setAttribute('data-entry-separator', model.side);
      node.setAttribute(
        'data-entry-separator-source',
        model.source === model.owner ? 'unit' : 'ancestor'
      );
      node.setAttribute('data-entry-border-owner', model.record.id);
      node.setAttribute('aria-hidden', 'true');
      for (const name of ['width', 'length', 'left', 'top'])
        node.style.setProperty(`--entry-separator-${name}`, `${model[name]}px`);
      node.style.setProperty('--entry-separator-style', model.paint);
      node.style.setProperty('--entry-separator-color', model.color);
      model.owner.setAttribute('data-entry-separator-owner', '');
      model.owner.setAttribute('data-entry-border-owner', model.record.id);
      model.source.setAttribute('data-entry-border-source', mode);
      model.source.setAttribute('data-entry-border-owner', model.record.id);
      model.source.setAttribute(`data-entry-border-${model.side}-owner`, model.record.id);
      model.owner.append(node);
      entry.layers.push({ node, owner: model.owner, side: model.side });
    }
  }
  function routeProbe(stage, travelDirection, count = routeActive.size, details = {}) {
    if (!window.SiteEngineProbe) return;
    try {
      window.SiteEngineProbe({
        kind: 'route-block',
        stage,
        direction: travelDirection > 0 ? 'forward' : 'backward',
        time: clock(),
        active: routeActive.size,
        count,
        rows: details.rows ?? 0,
        rowDurationMs: details.rowDurationMs ?? 0,
        rowStepMs: details.rowStepMs ?? 0,
        plannedDurationMs: details.plannedDurationMs ?? 0,
        completedBy: details.completedBy ?? null,
        phase: details.phase ?? null,
        navigationId: Number.isInteger(details.navigationId) ? details.navigationId : null,
        ...(details.attemptedRows === undefined ? {} : { attemptedRows: details.attemptedRows }),
      });
    } catch {
      // Optional diagnostics cannot retain content or interrupt phase promises.
    }
  }
  function routeState(state, travelDirection) {
    for (const container of [root, footer]) {
      if (!container) continue;
      if (state) {
        container.setAttribute('data-route-blocks', state);
        container.setAttribute(
          'data-route-direction',
          travelDirection > 0 ? 'forward' : 'backward'
        );
      } else {
        container.removeAttribute('data-route-blocks');
        container.removeAttribute('data-route-direction');
      }
    }
  }
  function clearRouteUnit(element) {
    clearSeparators('route', element);
    element.removeAttribute('data-route-block');
    element.removeAttribute('data-route-direction');
    element.removeAttribute('data-route-delay');
    element.removeAttribute('data-route-row');
    element.style.removeProperty('--route-block-distance');
    element.style.removeProperty('--route-block-delay');
    element.style.removeProperty('--route-block-duration');
  }
  function clearRoute() {
    window.clearTimeout(holdTask);
    holdTask = null;
    for (const element of routeUnits.keys()) clearRouteUnit(element);
    routeActive.clear();
    routePrepared = null;
    routeState(null);
  }
  function cancelRoute(completedBy = 'cancelled') {
    routeGeneration++;
    const phase = routePhase;
    routePhase = null;
    if (phase) window.clearTimeout(phase.timer);
    const travelDirection = phase?.direction || routePrepared?.direction || 1;
    const changed = !!phase || !!routePrepared;
    const timing = phase?.timing || routePrepared?.timing;
    clearRoute();
    if (changed) routeProbe('cancelled', travelDirection, 0, { ...timing, completedBy });
    phase?.resolve({ completed: false, cancelled: true, completedBy });
  }
  function holdRoute(travelDirection, timing, completedBy = null) {
    routeState('holding', travelDirection);
    routePrepared = { direction: travelDirection, timing };
    for (const element of routeActive) element.setAttribute('data-route-block', 'holding');
    // The router normally replaces or releases this state within its finite
    // camera flight. A stalled owner must not leave native content unavailable.
    window.clearTimeout(holdTask);
    const own = routeGeneration;
    holdTask = window.setTimeout(
      guarded(() => {
        if (own === routeGeneration) {
          cancelRoute('watchdog');
          settle();
        }
      }),
      8000
    );
    routeProbe('holding', travelDirection, routeActive.size, { ...timing, completedBy });
  }
  function measureRoute() {
    // One native read batch per phase, including footer leaves. Header and
    // appearance controls belong to the persistent shell, never this inventory.
    clearSeparators('route');
    refreshInventory();
    const measured = [...routeUnits].map(([element, record]) => {
      const rect = element.getBoundingClientRect();
      const children = [...(element.children || [])].map((child) => child.getBoundingClientRect());
      // Media may intentionally extend beyond its semantic shell (Home's
      // facets do). Move the complete native visual envelope past the edge.
      return {
        element,
        record,
        native: rect,
        rect: {
          top: Math.min(rect.top, ...children.map((child) => child.top)),
          bottom: Math.max(rect.bottom, ...children.map((child) => child.bottom)),
        },
        visible: element.getClientRects().length > 0,
      };
    });
    const visible = measured.filter(
      (unit) =>
        unit.visible &&
        unit.rect.bottom > 0 &&
        unit.rect.top < window.innerHeight &&
        Number.isFinite(unit.rect.top) &&
        Number.isFinite(unit.rect.bottom)
    );
    measured.separators = measureSeparators(visible, true);
    materializeSeparators(measured.separators, measured);
    const style = window.getComputedStyle(document.documentElement);
    measured.duration = Number.parseFloat(style.getPropertyValue('--block-motion-duration'));
    measured.phase = Number.parseFloat(style.getPropertyValue('--block-motion-phase'));
    return measured;
  }
  function routeTiming(rows, measured, state, navigationId) {
    const specified = measured.duration;
    const specifiedPhase = measured.phase;
    const phaseDuration =
      Number.isFinite(specifiedPhase) && specifiedPhase >= 1000 && specifiedPhase <= 1200
        ? specifiedPhase
        : 1000;
    const duration =
      rows === 1
        ? phaseDuration
        : Number.isFinite(specified) && specified >= 450 && specified <= 700
          ? specified
          : 700;
    // A fixed phase envelope owns latency. Density changes the wave's spacing,
    // while each row retains a visible movement and its directional order.
    return {
      rows,
      rowDurationMs: rows ? duration : 0,
      rowStepMs: rows > 1 ? (phaseDuration - duration) / (rows - 1) : 0,
      plannedDurationMs: rows ? phaseDuration : 0,
      bounded: rows <= 24,
      phase: state === 'departing' ? 'departure' : 'arrival',
      navigationId,
    };
  }
  function prepareRoute(travelDirection, measured, state, navigationId = null) {
    routeActive.clear();
    const selected = measured
      .filter(
        ({ rect, visible }) =>
          visible &&
          Number.isFinite(rect.top) &&
          Number.isFinite(rect.bottom) &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight
      )
      .sort((a, b) => a.native.top - b.native.top);
    const rows = [];
    for (const unit of selected) {
      let row = rows.at(-1);
      if (!row || unit.native.top >= row.bottom - 0.5) {
        row = { top: unit.native.top, bottom: unit.native.bottom, units: [] };
        rows.push(row);
      }
      row.bottom = Math.max(row.bottom, unit.native.bottom);
      row.units.push(unit);
    }
    const timing = routeTiming(rows.length, measured, state, navigationId);
    const duration = timing.rowDurationMs;
    // Exceptional geometry falls back to fully native content. Admitted rows
    // keep their identity and share a fixed-duration directional wave.
    if (!timing.bounded) return timing;
    const upward = state === 'departing' ? travelDirection > 0 : travelDirection < 0;
    for (const { element } of measured) clearRouteUnit(element);
    for (const { element, record } of selected) if (!record.ink) wrapInk(element, record);
    attachSeparators(measured.separators, 'route');
    for (const [index, row] of rows.entries()) {
      // Wave rows only travel far enough to clear their own complete paint.
      // Native peers share this envelope so ink, paper and dividers stay aligned.
      const distance = upward
        ? -(Math.max(...row.units.map((unit) => unit.rect.bottom)) + 32)
        : window.innerHeight - Math.min(...row.units.map((unit) => unit.rect.top)) + 32;
      for (const { element } of row.units) {
        const order = travelDirection > 0 ? index : rows.length - 1 - index;
        element.style.setProperty('--route-block-distance', `${Math.round(distance)}px`);
        element.style.setProperty('--route-block-delay', `${order * timing.rowStepMs}ms`);
        element.style.setProperty('--route-block-duration', `${duration}ms`);
        element.setAttribute('data-route-direction', travelDirection > 0 ? 'forward' : 'backward');
        element.setAttribute('data-route-row', String(index));
        element.setAttribute('data-route-delay', String(order));
        element.setAttribute('data-route-block', state);
        routeActive.add(element);
      }
    }
    return timing;
  }
  function completeRoute(own, completedBy = 'animationend') {
    const phase = routePhase;
    if (!phase || own !== routeGeneration) return;
    routePhase = null;
    window.clearTimeout(phase.timer);
    if (phase.state === 'departing') {
      // Keep every unit hidden until the router mounts the destination. The
      // finished transform is never reset to a visible old-page flash.
      holdRoute(phase.direction, phase.timing, completedBy);
    } else {
      for (const element of routeActive) finish(element);
      clearRoute();
      routeProbe('settled', phase.direction, phase.count, { ...phase.timing, completedBy });
    }
    phase.resolve({ completed: true, cancelled: false, completedBy });
  }
  function fallbackRoute(travelDirection, timing = null) {
    // Orphan separator shells can exist after the read batch, before paint
    // layers are attached. Release them too when the native-row guard rejects.
    for (const [element, record] of routeUnits) {
      if (!record.isolated) continue;
      element.remove();
      routeUnits.delete(element);
    }
    settle();
    routeProbe('cancelled', travelDirection, 0, {
      ...timing,
      rows: 0,
      rowDurationMs: 0,
      rowStepMs: 0,
      plannedDurationMs: 0,
      attemptedRows: timing?.rows ?? 0,
      completedBy: 'fallback',
    });
    return Promise.resolve({ completed: false, cancelled: true, completedBy: 'fallback' });
  }
  function beginRoute(state, travelDirection, measured, navigationId) {
    const own = ++routeGeneration;
    window.clearTimeout(holdTask);
    holdTask = null;
    const timing = prepareRoute(travelDirection, measured, state, navigationId);
    if (!timing.bounded) return fallbackRoute(travelDirection, timing);
    routeState(state, travelDirection);
    routePrepared = null;
    routeProbe(
      state === 'departing' ? 'departure' : 'arrival',
      travelDirection,
      routeActive.size,
      timing
    );
    return new Promise((resolve) => {
      routePhase = {
        state,
        direction: travelDirection,
        count: routeActive.size,
        pending: new Map(
          [...routeActive].map((element) => [
            element,
            Number.parseFloat(element.style.getPropertyValue('--route-block-delay')) +
              timing.rowDurationMs,
          ])
        ),
        ...animationMark(),
        timing,
        resolve,
        timer: null,
      };
      // Missing/cancelled events receive the same finite slack after the fixed
      // wave envelope; page density cannot extend the planned transition.
      routePhase.timer = window.setTimeout(
        guarded(() => completeRoute(own, 'watchdog')),
        timing.plannedDurationMs + 1000
      );
      if (!routeActive.size) completeRoute(own, 'empty');
    });
  }
  function depart(travelDirection = 1, navigationId = null) {
    cancelRoute();
    suspend();
    if (!root || !routeAllowed()) {
      return fallbackRoute(travelDirection, { phase: 'departure', navigationId });
    }
    return beginRoute('departing', travelDirection < 0 ? -1 : 1, measureRoute(), navigationId);
  }
  function prepareArrival(travelDirection = 1, navigationId = null) {
    cancelRoute();
    suspend();
    if (!root || !routeAllowed()) {
      fallbackRoute(travelDirection, { phase: 'arrival', navigationId });
      return false;
    }
    const nextDirection = travelDirection < 0 ? -1 : 1;
    const timing = prepareRoute(nextDirection, measureRoute(), 'holding', navigationId);
    if (!timing.bounded) {
      fallbackRoute(nextDirection, timing);
      return false;
    }
    holdRoute(nextDirection, timing);
    return true;
  }
  function arrive(travelDirection = 1, navigationId = null) {
    if (!root || !routePrepared || !routeAllowed()) {
      return fallbackRoute(travelDirection, { phase: 'arrival', navigationId });
    }
    // Native landing/history restoration may have changed since mount. Re-read
    // once after the camera's rest paint, before any finite layer writes.
    return beginRoute('arriving', travelDirection < 0 ? -1 : 1, measureRoute(), navigationId);
  }
  function cancel() {
    cancelRoute();
    settle();
  }
  function readingViewport() {
    return {
      height: window.innerHeight,
      scrollY: window.scrollY,
      focus: document.activeElement,
    };
  }
  function armReading(unit, borders, pageBottom, viewport) {
    const { element, record, native, visible } = unit;
    if (
      !visible ||
      readingDistance <= 0 ||
      native.top < viewport.height ||
      native.bottom + viewport.scrollY + readingDistance + 32 >= pageBottom ||
      (viewport.focus && element.contains(viewport.focus))
    ) {
      finish(element);
      return;
    }
    record.done = false;
    if (!record.ink) wrapInk(element, record);
    attachSeparators(borders, 'reading', element);
    element.setAttribute('data-scroll-entry', 'waiting');
  }
  function startReading(element, index, own) {
    const mark = animationMark();
    element.setAttribute('data-scroll-delay', String(index));
    element.setAttribute('data-scroll-entry', 'entering');
    // An event normally releases the state. This one-shot fallback also
    // releases it if a stylesheet is replaced or an animation is cancelled.
    const timer = window.setTimeout(() => {
      if (own !== generation) return;
      finish(element);
      // A missing animation event releases queued native content too; failure
      // cannot grow into successive watchdog-length waves.
      for (const queued of pendingReading.keys()) finish(queued);
    }, 2000);
    active.set(element, {
      timer,
      ...mark,
      plannedDurationMs: readingDuration + index * readingStagger,
    });
  }
  function drainReading(own) {
    if (own !== generation || suspended || !allowed()) return;
    const measured = [...pendingReading].map(([element, index]) => ({
      element,
      index,
      rect: element.getBoundingClientRect(),
    }));
    for (const { element, index, rect } of measured) {
      if (
        direction <= 0 ||
        clock() < jumpUntil ||
        rect.bottom <= 0 ||
        rect.top >= window.innerHeight
      ) {
        finish(element);
        continue;
      }
      if (active.size >= 6) break;
      pendingReading.delete(element);
      startReading(element, index, own);
    }
  }
  function enter(entries, own) {
    if (own !== generation || suspended || !allowed()) return;
    const rearming = new Map();
    const height = window.innerHeight;
    // Release exited states together: separator removal can change native
    // layout/scroll anchoring before this batch measures and rearms its units.
    if (direction < 0)
      for (const entry of entries) {
        const element = entry.target;
        const record = records.get(element);
        if (!record || entry.isIntersecting) continue;
        if (entry.boundingClientRect.top >= height) {
          clearState(element);
          rearming.set(element, { element, record });
        } else if (active.has(element) || pendingReading.has(element)) finish(element);
      }
    const viewport = readingViewport();
    const pageBottom = document.documentElement.scrollHeight;
    for (const unit of rearming.values()) {
      unit.native = unit.element.getBoundingClientRect();
      unit.visible = unit.element.getClientRects().length > 0;
    }
    const siblings = new Map();
    for (const entry of entries) {
      const element = entry.target;
      const record = records.get(element);
      if (!record) continue;
      if (!entry.isIntersecting) {
        const unit = rearming.get(element);
        if (unit) armReading(unit, readingBorders, pageBottom, viewport);
        else if (active.has(element) || pendingReading.has(element)) finish(element);
        continue;
      }
      if (record.done || active.has(element) || pendingReading.has(element)) continue;
      if (direction <= 0 || clock() < jumpUntil) {
        finish(element);
        continue;
      }
      const group = element.parentElement;
      const index = Math.min(2, siblings.get(group) || 0);
      siblings.set(group, index + 1);
      // Dense native rows retain their next reveal instead of permanently
      // consuming excess shells. The existing six-active bound stays intact.
      if (active.size >= 6) pendingReading.set(element, index);
      else startReading(element, index, own);
    }
  }
  function releaseReadingStates() {
    for (const element of records.keys()) {
      if (active.has(element)) finish(element);
      else clearState(element);
    }
  }
  function reconcile() {
    disconnect();
    if (suspended || !root) return;
    refreshInventory();
    if (!allowed()) {
      // Readiness is separate from disabled motion; late scene initialization
      // may still arm untouched below-fold content after its owner notifies us.
      if (enabled() && window.SiteScene?.motionState?.().ready) settle();
      else releaseReadingStates();
      return;
    }
    const style = window.getComputedStyle(root);
    const distance = Number.parseFloat(style.getPropertyValue('--scroll-entry-distance'));
    if (!Number.isFinite(distance) || distance <= 0) return;
    readingDistance = distance;
    const duration = Number.parseFloat(style.getPropertyValue('--block-motion-duration'));
    const stagger = Number.parseFloat(style.getPropertyValue('--block-motion-stagger'));
    readingDuration =
      Number.isFinite(duration) && duration >= 450 && duration <= 700 ? duration : 700;
    readingStagger = Number.isFinite(stagger) && stagger >= 0 && stagger <= 120 ? stagger : 80;
    // Batch native reads before any transient layer/state writes. The last
    // block stays steady when its moving ink/paper would grow scroll overflow.
    releaseReadingStates();
    const viewport = readingViewport();
    const pageBottom = document.documentElement.scrollHeight;
    const measured = [...records].map(([element, record]) => {
      const rect = element.getBoundingClientRect();
      return {
        element,
        record,
        rect: {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        },
        native: rect,
        visible: element.getClientRects().length > 0,
      };
    });
    const borders = measureSeparators(measured);
    // Native side paint and ownership are measured together after cleanup.
    // Repeated crossings reuse them until reflow/theme/layout reconciliation,
    // even while a sibling still suppresses another side of the same source.
    readingBorders = borders;
    const own = generation;
    observer = new window.IntersectionObserver(
      guarded((entries) => enter(entries, own)),
      {
        rootMargin: '0px',
        threshold: 0.001,
      }
    );
    for (const { element, record, rect, native, visible } of measured) {
      if (!visible) {
        clearState(element);
        continue;
      }
      armReading({ element, record, native, rect, visible }, borders, pageBottom, viewport);
      observer.observe(element);
    }
    previousY = viewport.scrollY;
  }
  function deferReconcile() {
    window.clearTimeout(reconcileTask);
    const own = generation;
    // Archive notification precedes synchronous hash landing. Reconcile after
    // that landing, once, rather than on every individual hidden-row mutation.
    reconcileTask = window.setTimeout(
      guarded(() => {
        reconcileTask = null;
        if (own === generation) reconcile();
      }),
      0
    );
  }
  function resume() {
    cancelRoute();
    suspended = false;
    reconcile();
  }
  function refreshPreference() {
    cancelRoute();
    disconnect();
    releaseReadingStates();
    if (!suspended && allowed()) reconcile();
  }
  function destroy() {
    cancelRoute();
    suspend();
    for (const remove of listeners.splice(0)) remove();
    for (const [element, record] of knownRecords) {
      if (record.ink) record.ink.replaceWith(...record.ink.childNodes);
      clearState(element);
    }
    records.clear();
    routeUnits.clear();
    knownRecords.clear();
    clearSeparators('reading');
    clearSeparators('route');
    nextUnitId = 0;
    readingDistance = 0;
    readingBorders = [];
    root = null;
    footer = null;
  }
  function mount(main, options = {}) {
    destroy();
    failed = false;
    if (!main) return;
    root = main;
    footer = options.footer || document.querySelector('.site-footer');
    refreshInventory();
    for (const element of records.keys()) clearState(element);
    for (const element of routeUnits.keys()) clearRouteUnit(element);
    previousY = window.scrollY;
    direction = 0;
    jumpUntil = 0;
    const animationFinished = guarded((event) => {
      if (
        event.animationName === 'route-block-depart' ||
        event.animationName === 'route-block-arrive'
      ) {
        const expected =
          routePhase?.state === 'departing' ? 'route-block-depart' : 'route-block-arrive';
        const element = event.target.closest('[data-route-block]');
        if (event.animationName !== expected || !routePhase?.pending.has(element)) return;
        // A queued event from a cancelled animation on this retained node
        // cannot consume its new row before the new planned end has elapsed.
        if (animationElapsed(routePhase) < routePhase.pending.get(element) - 8) return;
        routePhase.pending.delete(element);
        if (!routePhase.pending.size) completeRoute(routeGeneration);
      } else {
        if (event.animationName !== 'scroll-entry-rise') return;
        const element = event.target.closest('[data-scroll-entry]');
        const entry = active.get(element);
        if (entry) {
          // An old queued completion cannot settle this retained shell's new
          // reveal before its own duration and sibling delay have elapsed.
          if (animationElapsed(entry) < entry.plannedDurationMs - 8) return;
          finish(element);
          drainReading(generation);
        }
      }
    });
    listen(root, 'animationend', animationFinished);
    listen(footer, 'animationend', animationFinished);
    const focusSettled = guarded((event) => {
      if (event.target !== root) settle(event.target);
    });
    listen(root, 'focusin', focusSettled);
    listen(footer, 'focusin', focusSettled);
    listen(
      root,
      'beforematch',
      guarded((event) => settle(event.target))
    );
    listen(
      window,
      'scroll',
      guarded(() => {
        const next = window.scrollY;
        const delta = next - previousY;
        // Duplicate browser scroll notifications must not erase the last real
        // direction before the asynchronous observer receives its crossing.
        if (delta !== 0) direction = Math.sign(delta);
        previousY = next;
        if (Math.abs(delta) > Math.max(480, window.innerHeight * 0.75)) {
          jumpUntil = clock() + 250;
          for (const element of active.keys()) finish(element);
          for (const element of pendingReading.keys()) finish(element);
        } else if (direction < 0) {
          for (const element of active.keys()) finish(element);
          for (const element of pendingReading.keys()) finish(element);
        }
      }),
      { passive: true }
    );
    listen(window, 'site:archive-layout', guarded(deferReconcile));
    if (window.MutationObserver) {
      const themeObserver = new window.MutationObserver(
        guarded(() => {
          cancelRoute();
          clearSeparators('reading');
          if (!suspended) deferReconcile();
        })
      );
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
      listeners.push(() => themeObserver.disconnect());
    }
    listen(
      window,
      'resize',
      guarded(() => {
        if (routePhase) cancel();
        deferReconcile();
      }),
      { passive: true }
    );
    listen(document.fonts, 'loadingdone', guarded(deferReconcile));
    listen(
      window,
      'site:motion-state',
      guarded(() => {
        if (!enabled()) {
          refreshPreference();
          return;
        }
        if (!allowed() && window.SiteScene?.motionState?.().ready) {
          cancelRoute();
          disconnect();
          settle();
          return;
        }
        if (suspended) return;
        if (allowed()) reconcile();
        else if (window.SiteScene?.motionState?.().ready) {
          disconnect();
          settle();
        }
      })
    );
    listen(
      document,
      'keydown',
      guarded((event) => {
        if ((event.ctrlKey || event.metaKey) && ['f', 'g'].includes(event.key.toLowerCase()))
          settle();
        if (['PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) jumpUntil = clock() + 500;
      })
    );
    listen(
      document,
      'click',
      guarded((event) => {
        const link = event.target.closest?.('a[href]');
        if (link?.getAttribute('href').startsWith('#')) settle();
      }),
      true
    );
    listen(
      window,
      'hashchange',
      guarded(() => {
        settle();
        deferReconcile();
      })
    );
    listen(
      document,
      'visibilitychange',
      guarded(() => {
        if (document.hidden) {
          disconnect();
          settle();
        } else if (!suspended) reconcile();
      })
    );
    listen(
      window,
      'beforeprint',
      guarded(() => {
        disconnect();
        settle();
      })
    );
    listen(
      window,
      'pagehide',
      guarded(() => {
        disconnect();
        settle();
      })
    );
    listen(
      window,
      'pageshow',
      guarded(() => {
        if (!suspended) deferReconcile();
      })
    );
  }
  function boot() {
    if (booted) return;
    booted = true;
    const ready = guarded(() => {
      if (root) return;
      mount(document.querySelector('main'));
      resume();
    });
    if (document.readyState === 'loading' || document.readyState === 'interactive')
      document.addEventListener('DOMContentLoaded', ready, { once: true });
    else ready();
  }
  return {
    boot: guarded(boot),
    mount: guarded(mount),
    suspend: guarded(suspend),
    resume: guarded(resume),
    settle: guarded(settle),
    destroy: guarded(destroy),
    depart: guardedPhase(depart),
    prepareArrival: guarded(prepareArrival),
    arrive: guardedPhase(arrive),
    cancelRoute: guarded(cancelRoute),
    cancel: guarded(cancel),
    refreshPreference: guarded(refreshPreference),
    diagnostics: () => ({
      targets: records.size,
      active: active.size,
      observing: !!observer,
      suspended,
      routeTargets: routeUnits.size,
      routeActive: routeActive.size,
      routeStage: routePhase?.state || (routePrepared ? 'holding' : null),
    }),
  };
})();
/* One document, one header and one canvas. Every route remains ordinary HTML. */
(() => {
  'use strict';
  const scrollEntry = window.SiteScrollEntry;
  scrollEntry?.boot();
  const routes = ['index', 'research', 'writing', 'talks', 'credits'];
  const bundle = document.getElementById('site-pages');
  const embedded = bundle ? JSON.parse(bundle.textContent) : null;
  const entry = new URL(window.location.href);
  const directory = new URL('.', entry);
  const shellEngine = document.querySelector('meta[name="site-engine"]')?.content;
  const initialVersion = document.querySelector('meta[name="site-route"]')?.content;
  const initialPage = document.body.dataset.page;
  let pinned = null;
  let page = document.body.dataset.page,
    serial = 0,
    request = null,
    transition = null,
    scrollSave = null;
  let endpoint = null,
    endpointTimer = null,
    endpointObserver = null,
    inputTail = null,
    lastWheel = -Infinity,
    lastWheelDirection = 0,
    lastKey = null;
  if (!routes.includes(page) || !window.fetch || !window.DOMParser || !window.history.pushState)
    return;
  const cache = new Map();
  const content = document.createElement('div');
  content.id = 'site-content';
  const effects = window.SiteEffects;
  if (effects && effects.contract !== 1) throw Error('Incompatible navigation effect contract');
  const presentation = effects?.navigation?.(content);
  const main = document.querySelector('main'),
    footer = document.querySelector('footer');
  if (!main || !footer) return;
  main.before(content);
  content.append(main, footer);
  const frame = document.createElement('div');
  frame.id = 'site-content-frame';
  content.before(frame);
  frame.append(content);
  presentation?.mount?.();
  const announcement = document.createElement('p');
  announcement.className = 'sr-only';
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  document.body.append(announcement);
  // The exact Home media fallback travels with the verified route head, including
  // CSS-unavailable navigation. Other routes remove it with their prior metadata.
  const metadata =
    'meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],script[type="application/ld+json"],style[data-critical-media]';
  function extract(doc, immutable = false) {
    const next = doc.body.dataset.page;
    const main = doc.querySelector('main'),
      footer = doc.querySelector('footer'),
      fallback = doc.querySelector('.space-fallback');
    if (!routes.includes(next) || !main || !footer || !fallback)
      throw Error('Incomplete site route');
    const version = doc.querySelector('meta[name="site-route"]')?.content,
      engine = doc.querySelector('meta[name="site-engine"]')?.content;
    const data = {
      page: next,
      version,
      engine,
      title: doc.title,
      lang: doc.documentElement.lang,
      main: main.cloneNode(true),
      footer: footer.cloneNode(true),
      fallback: fallback.cloneNode(true),
      metadata: [...doc.head.querySelectorAll(metadata)].map((node) => node.cloneNode(true)),
    };
    if (immutable)
      for (const root of [data.main, data.footer, data.fallback])
        for (const el of root.querySelectorAll('[href],[src]'))
          for (const attribute of ['href', 'src']) {
            const value = el.getAttribute(attribute);
            if (value?.startsWith('../../')) el.setAttribute(attribute, value.slice(6));
          }
    return data;
  }
  cache.set(page, extract(document));
  function routeFor(url) {
    if (url.origin !== entry.origin) return null;
    if (embedded) {
      if (url.pathname === entry.pathname)
        return routes.includes(url.searchParams.get('view'))
          ? url.searchParams.get('view')
          : document.body.dataset.entryPage;
      return (
        routes.find((name) => new URL(embedded.files[name], directory).pathname === url.pathname) ||
        null
      );
    }
    return (
      routes.find((name) =>
        [name, name + '.html', ...(name === 'index' ? ['./'] : [])].some(
          (file) => new URL(file, directory).pathname === url.pathname
        )
      ) || null
    );
  }
  function address(url, next) {
    if (!embedded) return url;
    const result = new URL(entry);
    result.search = url.search;
    result.hash = url.hash;
    result.searchParams.set('view', next);
    return result;
  }
  // The scroll/flight itinerary follows the header; utility links stay accessible.
  const primaryRoutes = Object.freeze(
    [...document.querySelectorAll('.site-header nav a[href]')]
      .map((link) => routeFor(new URL(link.href, entry)))
      .filter((route, index, list) => route && list.indexOf(route) === index)
  );
  function save() {
    if (routeFor(new URL(window.location.href)) !== page) return;
    try {
      history.replaceState(
        { ...history.state, site: { page, scroll: [window.scrollX, window.scrollY] } },
        '',
        window.location.href
      );
    } catch {
      /* Native navigation still works. */
    }
  }
  function push(url) {
    save();
    history.pushState({ site: { page, scroll: [window.scrollX, window.scrollY] } }, '', url);
  }
  function revisionValid(revision) {
    if (
      revision?.schema !== 1 ||
      revision.contract !== 1 ||
      revision.engine !== shellEngine ||
      Object.keys(revision.routes || {}).length !== routes.length
    )
      return false;
    for (const route of routes) {
      const data = revision.routes[route];
      if (
        !data ||
        !/^[a-f0-9]{64}$/.test(data.version) ||
        !/^[a-f0-9]{64}$/.test(data.sha256) ||
        data.url !== `snapshots/${data.version}/${route}.html`
      )
        return false;
    }
    return revision.routes[initialPage].version === initialVersion;
  }
  async function pin(signal) {
    if (pinned) return;
    let revision = embedded?.revision;
    if (!embedded) {
      const response = await fetch(new URL('site-revision.json', directory), {
        signal,
        credentials: 'same-origin',
        cache: 'no-cache',
      });
      if (
        !response.ok ||
        new URL(response.url).origin !== entry.origin ||
        !response.headers.get('content-type')?.includes('application/json')
      )
        throw Error('Revision unavailable');
      const bytes = await response.text();
      if (bytes.length > 32000) throw Error('Revision too large');
      revision = JSON.parse(bytes);
    }
    if (!revisionValid(revision)) throw Error('Site snapshot changed');
    pinned = revision;
  }
  async function matchesBytes(html, hash) {
    if (!window.crypto?.subtle || !window.TextEncoder)
      throw Error('Snapshot verification unavailable');
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(html));
    return (
      [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('') === hash
    );
  }
  async function read(next, signal) {
    await pin(signal);
    if (cache.has(next)) return cache.get(next);
    let html;
    if (embedded) html = embedded.pages[next];
    else {
      const response = await fetch(new URL(pinned.routes[next].url, directory), {
        signal,
        credentials: 'same-origin',
      });
      if (
        !response.ok ||
        new URL(response.url).origin !== entry.origin ||
        !response.headers.get('content-type')?.includes('text/html')
      )
        throw Error('Route unavailable');
      html = await response.text();
      if (html.length > 100000 || !(await matchesBytes(html, pinned.routes[next].sha256)))
        throw Error('Snapshot bytes changed');
    }
    const result = extract(new DOMParser().parseFromString(html, 'text/html'), !embedded);
    if (
      result.page !== next ||
      result.engine !== shellEngine ||
      result.version !== pinned.routes[next].version
    )
      throw Error('Unexpected route/version');
    cache.set(next, result);
    return result;
  }
  function clearText() {
    content.style.removeProperty('opacity');
    content.style.removeProperty('transform');
    presentation?.clear?.();
    content.inert = false;
  }
  function interrupt() {
    scrollEntry?.cancelRoute?.();
    scrollEntry?.suspend();
    const travelling = transition !== null;
    releaseEndpoint('interrupt');
    releaseTail();
    request?.abort();
    request = null;
    transition?.cancel?.();
    window.SiteScene?.detachTravel();
    transition?.(1);
    transition = null;
    clearText();
    content.removeAttribute('aria-busy');
    return travelling;
  }
  function motionAllowed() {
    return (
      !document.hidden &&
      window.SiteScene?.canTravel() === true &&
      (!presentation || presentation.canTravel())
    );
  }
  function restoreScroll(left, top) {
    // Explicit instant behavior ignores the reader's smooth anchor preference
    // without mutating the root style and forcing another style flush.
    const start = window.SiteEngineStages ? performance.now() : 0;
    window.scrollTo({ left, top, behavior: 'instant' });
    if (start) {
      const time = performance.now();
      window.SiteEngineProbe?.({
        kind: 'stage',
        part: 'scroll-native',
        time,
        start,
        duration: time - start,
        page,
      });
    }
  }
  function endpointProbe(reason, detail = {}) {
    window.SiteEngineProbe?.({
      kind: 'endpoint',
      time: performance.now(),
      reason,
      token: endpoint?.own,
      page,
      ...detail,
    });
  }
  function releaseEndpoint(reason) {
    if (endpoint) endpointProbe(reason);
    endpoint = null;
    window.clearTimeout(endpointTimer);
    endpointTimer = null;
    endpointObserver?.disconnect();
    endpointObserver = null;
  }
  function releaseTail() {
    inputTail = null;
  }
  function reconcileEndpoint(maxScroll) {
    if (!endpoint || !endpoint.mounted) return false;
    if (endpoint.own !== serial || endpoint.page !== page) {
      releaseEndpoint('stale');
      return false;
    }
    if (maxScroll === undefined) {
      const read = () =>
        reconcileEndpoint(Math.max(0, document.documentElement.scrollHeight - innerHeight));
      return effects?.measure ? effects.measure(read) : read();
    }
    const gap = maxScroll - window.scrollY;
    if (Math.abs(gap) > 2) {
      restoreScroll(0, maxScroll);
      endpointProbe('reflow', { maxScroll, gap });
    }
    return true;
  }
  function mountEndpoint() {
    if (!endpoint || endpoint.own !== serial || endpoint.page !== page) return;
    endpoint.mounted = true;
    // The scene's native measurement invokes reconcileEndpoint before reading
    // waypoints. Only a missing Canvas/layout engine needs a bounded observer.
    if (!window.SiteScene?.managesLayout && window.ResizeObserver) {
      endpointObserver = new ResizeObserver(() => reconcileEndpoint());
      endpointObserver.observe(document.body);
    }
  }
  function arriveEndpoint() {
    if (!endpoint || endpoint.own !== serial) return;
    endpoint.arrived = true;
    window.SiteScene?.refresh({ sync: true, reason: 'arrival-end' });
    reconcileEndpoint();
    // Expiry bounds takeover, it never drives correctness or a render clock.
    const own = endpoint.own;
    endpointTimer = window.setTimeout(() => {
      if (endpoint?.own === own) releaseEndpoint('settled');
    }, 1000);
  }
  window.addEventListener(
    'wheel',
    (event) => {
      // Use input creation time, not delayed main-thread dispatch time. A slow
      // mount cannot turn queued inertia into a supposedly fresh wheel gesture.
      const now =
          event.timeStamp > performance.timeOrigin
            ? event.timeStamp - performance.timeOrigin
            : event.timeStamp,
        direction = Math.sign(event.deltaY);
      const fresh =
        now - lastWheel > 180 ||
        (direction && lastWheelDirection && direction !== lastWheelDirection);
      lastWheel = now;
      if (direction) lastWheelDirection = direction;
      if (!event.isTrusted || !event.deltaY) return;
      if (fresh) {
        releaseEndpoint('wheel');
        releaseTail();
      } else if (
        inputTail?.own === serial &&
        inputTail.type === 'wheel' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ) {
        // Consume only the accepted gesture's tail. It must not scroll an instant
        // destination before the reader starts a new deliberate gesture.
        if (event.cancelable) event.preventDefault();
      }
    },
    { passive: false }
  );
  window.addEventListener(
    'touchstart',
    (event) => {
      if (event.isTrusted) {
        releaseEndpoint('touch');
        releaseTail();
      }
    },
    { passive: true }
  );
  window.addEventListener(
    'pointerdown',
    (event) => {
      if (event.isTrusted) {
        releaseEndpoint('pointer');
        releaseTail();
      }
    },
    { passive: true }
  );
  window.addEventListener('keydown', (event) => {
    const scrolling = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(
      event.key
    );
    if (scrolling && !event.repeat) lastKey = event.key;
    if (!event.isTrusted) return;
    if (
      inputTail?.own === serial &&
      inputTail.type === 'key' &&
      event.repeat &&
      event.key === inputTail.key
    ) {
      if (event.cancelable) event.preventDefault();
      return;
    }
    if (scrolling && !event.repeat) {
      releaseEndpoint('key');
      releaseTail();
    }
  });
  window.addEventListener('keyup', (event) => {
    if (inputTail?.type === 'key' && event.key === inputTail.key) releaseTail();
  });
  window.addEventListener('blur', () => {
    releaseEndpoint('blur');
    releaseTail();
  });
  window.addEventListener(
    'resize',
    () => {
      if (!window.SiteScene?.managesLayout) reconcileEndpoint();
    },
    { passive: true }
  );
  document.fonts?.addEventListener?.('loadingdone', () => {
    if (!window.SiteScene?.managesLayout) reconcileEndpoint();
  });
  function flight(next, animate, commit, own, departure, landing = null) {
    return new Promise((resolve, reject) => {
      let mounted = false,
        mountTimer = null,
        settled = false,
        lastProgress = 0;
      const mountAt = 0.5;
      const cancelTask = () => {
        if (mountTimer !== null) window.clearTimeout(mountTimer);
        mountTimer = null;
      };
      const cancel = () => {
        if (settled) return;
        settled = true;
        cancelTask();
        if (transition === update) transition = null;
        resolve();
      };
      const fail = (error) => {
        if (settled) return;
        settled = true;
        cancelTask();
        if (transition === update) {
          window.SiteScene?.detachTravel();
          transition = null;
        }
        reject(error);
      };
      function mountNow(task = false) {
        cancelTask();
        if (settled || own !== serial) {
          cancel();
          return;
        }
        if (mounted) return;
        const start = task && window.SiteEngineProbe ? performance.now() : 0;
        try {
          mounted = true;
          commit();
        } finally {
          if (start) {
            const time = performance.now();
            window.SiteEngineProbe?.({
              kind: 'navigation-task',
              part: 'mount-task',
              time,
              start,
              duration: time - start,
              page: next,
            });
          }
        }
      }
      function queueMount() {
        if (mountTimer !== null) return;
        // Outgoing blocks have already left. Yield the completed Canvas paint
        // before native archive construction/layout; the new blocks stay held
        // offscreen until the camera restores its destination reading framing.
        mountTimer = window.setTimeout(() => {
          mountTimer = null;
          if (settled || own !== serial) {
            cancel();
            return;
          }
          try {
            mountNow(true);
            if (!settled) update(lastProgress);
          } catch (error) {
            fail(error);
          }
        }, 0);
      }
      function finish() {
        clearText();
        settled = true;
        cancelTask();
        if (transition === update) transition = null;
        resolve();
      }
      const update = (progress) => {
        if (settled) return;
        if (own !== serial) {
          cancel();
          return;
        }
        try {
          lastProgress = progress;
          if (progress >= mountAt && !mounted) {
            if (animate && progress < 1) queueMount();
            else mountNow(mountTimer !== null);
          }
          if (settled || own !== serial) {
            cancel();
            return;
          }
          // Presentation metadata follows the existing scene clock. Native
          // content has no root opacity/depth transform during camera travel.
          if (progress === 1) finish();
          else presentation?.present?.(progress);
        } catch (error) {
          fail(error);
        }
      };
      update.cancel = cancel;
      transition = update;
      content.inert = true;
      if (window.SiteScene)
        window.SiteScene.navigate(next, animate, transition, landing, { navigationId: own });
      else transition(1);
    });
  }
  function mount(data, url, position, blockDirection = null, navigationId = serial) {
    // History captured the old reading position before this layout-affecting
    // write. Clearing the plane before history's scroll read would flush the
    // old page, then immediately flush the newly mounted archive again.
    presentation?.prepareMount?.();
    // Clear the presentation transform before DOM writes and landing. The
    // nested scene measurement then reuses that same native layout snapshot.
    const run = () => mountNative(data, url, position, blockDirection, navigationId);
    return effects?.measure ? effects.measure(run) : run();
  }
  function mountNative(data, url, position, blockDirection = null, navigationId = serial) {
    let stage = window.SiteEngineStages ? performance.now() : 0;
    const span = (part) => {
      if (stage) {
        const time = performance.now();
        window.SiteEngineProbe?.({
          kind: 'stage',
          part,
          time,
          start: stage,
          duration: time - stage,
          page: data.page,
        });
        stage = time;
      }
    };
    window.SiteArchive?.destroy();
    scrollEntry?.destroy();
    span('mount-unmount');
    if (blockDirection) {
      data.main.setAttribute('data-route-blocks', 'holding');
      data.footer.setAttribute('data-route-blocks', 'holding');
    }
    content.replaceChildren(data.main, data.footer);
    document.body.dataset.page = data.page;
    page = data.page;
    if (document.documentElement.lang !== data.lang) document.documentElement.lang = data.lang;
    document.title = data.title;
    for (const node of document.head.querySelectorAll(metadata)) node.remove();
    document.head.append(...data.metadata);
    const fallback = document.querySelector('.space-fallback');
    if (fallback) fallback.replaceWith(data.fallback);
    for (const link of document.querySelectorAll('.site-header a')) {
      const target = new URL(link.href, window.location.href);
      if (routeFor(target) === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    span('mount-dom');
    window.dispatchEvent(new CustomEvent('site:page-mount', { detail: { page } }));
    // Apply filters before the native scroll/style flush, so Writing does not
    // lay out the complete archive and immediately lay it out a second time.
    window.SiteArchive?.mount();
    span('mount-archive');
    if (position === 'end') mountEndpoint();
    if (position === 'end')
      restoreScroll(0, Math.max(0, document.documentElement.scrollHeight - innerHeight));
    else restoreScroll(position?.[0] || 0, position?.[1] || 0);
    span('mount-scroll');
    let target = null;
    try {
      target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    } catch {
      /* Invalid fragments do not block a page. */
    }
    if (!position && target && target.getClientRects().length)
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    span('mount-anchor');
    window.SiteScene?.refresh({ sync: true });
    span('mount-layout');
    window.dispatchEvent(new CustomEvent('site:page-ready', { detail: { page } }));
    scrollEntry?.mount(data.main, { footer: data.footer });
    if (blockDirection) scrollEntry?.prepareArrival?.(blockDirection, navigationId);
    span('mount-ready');
  }
  function prepare(data) {
    const start = window.SiteEngineProbe ? performance.now() : 0;
    const clone = (node) => document.importNode(node, true);
    const result = {
      ...data,
      main: clone(data.main),
      footer: clone(data.footer),
      fallback: clone(data.fallback),
      metadata: data.metadata.map(clone),
    };
    if (window.SiteEngineProbe)
      window.SiteEngineProbe({
        kind: 'route',
        time: performance.now(),
        start,
        duration: performance.now() - start,
        page: data.page,
      });
    return result;
  }
  async function navigate(
    url,
    { pop = false, position = null, initial = false, input = null } = {}
  ) {
    const next = routeFor(url);
    if (!next) return;
    const direction = routes.indexOf(next) >= routes.indexOf(page) ? 1 : -1;
    const own = ++serial;
    interrupt();
    if (position === 'end') endpoint = { own, page: next, mounted: false, arrived: false };
    if (input === 'wheel' || input === 'key') {
      inputTail = { own, type: input, key: lastKey };
    }
    window.SiteEngineProbe?.({
      kind: 'navigation-start',
      time: performance.now(),
      from: page,
      to: next,
      navigationId: own,
    });
    const controller = new AbortController();
    request = controller;
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    content.setAttribute('aria-busy', 'true');
    try {
      const data = await read(next, controller.signal);
      if (own !== serial) return;
      const prepared = prepare(data);
      let animate = !initial && next !== page && motionAllowed();
      let blocks = animate && (presentation?.contentFlight?.() ?? true);
      if (blocks) {
        const result = await scrollEntry?.depart?.(direction, own);
        blocks = result?.completed === true;
      }
      animate = animate && motionAllowed();
      if (own !== serial) return;
      await flight(
        next,
        animate,
        () => {
          const start = window.SiteEngineStages ? performance.now() : 0;
          const destination = address(url, next);
          if (!pop && !initial && destination.href !== window.location.href) {
            save();
            history.pushState({ site: { page: next, scroll: [0, 0] } }, '', destination);
          } else if (initial)
            history.replaceState({ site: { page: next, scroll: [0, 0] } }, '', destination);
          if (start) {
            const time = performance.now();
            window.SiteEngineProbe?.({
              kind: 'stage',
              part: 'mount-history',
              time,
              start,
              duration: time - start,
              page: next,
            });
          }
          mount(prepared, destination, position, blocks ? direction : null, own);
        },
        own,
        null,
        { position, hash: url.hash, search: url.search }
      );
      if (own !== serial) return;
      if (blocks && motionAllowed() && (presentation?.contentFlight?.() ?? true))
        await scrollEntry?.arrive?.(direction, own);
      else scrollEntry?.cancelRoute?.();
      if (own === serial) {
        arriveEndpoint();
        content.querySelector('main').focus({ preventScroll: true });
        scrollEntry?.resume();
        announcement.textContent = data.title;
        save();
        window.SiteEngineProbe?.({
          kind: 'navigation-ready',
          time: performance.now(),
          page: next,
          navigationId: own,
        });
      }
    } catch {
      if (own === serial) {
        releaseEndpoint('failed');
        scrollEntry?.cancelRoute?.();
        scrollEntry?.settle();
        releaseTail();
        window.location.assign(address(url, next).href);
      }
    } finally {
      window.clearTimeout(timeout);
      if (own === serial) {
        content.removeAttribute('aria-busy');
        request = null;
        scrollEntry?.cancelRoute?.();
        clearText();
      }
    }
  }
  document.body.dataset.entryPage = page;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !link ||
      link.hasAttribute('download') ||
      (link.target && link.target !== '_self')
    )
      return;
    const url = new URL(link.href, window.location.href),
      next = routeFor(url);
    if (!next) return;
    if (next === page && request) {
      event.preventDefault();
      navigate(url);
      return;
    }
    if (next === page) {
      ++serial;
      if (interrupt()) window.SiteScene?.navigate(page, motionAllowed());
      if (link.getAttribute('href').startsWith('#')) {
        scrollEntry?.resume();
        return;
      }
      event.preventDefault();
      const dest = address(url, next);
      if (dest.href !== window.location.href) push(dest);
      window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
      if (dest.hash)
        document.getElementById(dest.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
      else restoreScroll(0, 0);
      scrollEntry?.resume();
      return;
    }
    event.preventDefault();
    navigate(url);
  });
  window.addEventListener('popstate', (event) => {
    const url = new URL(window.location.href),
      next = routeFor(url);
    if (next && (next !== page || request))
      navigate(url, { pop: true, position: event.state?.site?.scroll || null });
    else {
      ++serial;
      if (interrupt()) window.SiteScene?.navigate(page, motionAllowed());
      if (event.state?.site?.scroll)
        restoreScroll(event.state.site.scroll[0], event.state.site.scroll[1]);
      scrollEntry?.resume();
    }
  });
  function finishText() {
    scrollEntry?.cancelRoute?.();
    window.SiteScene?.detachTravel();
    transition?.(1);
    transition = null;
    clearText();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finishText();
  });
  window.addEventListener('beforeprint', () => {
    releaseEndpoint('print');
    releaseTail();
    finishText();
    window.SiteArchive?.print();
  });
  window.addEventListener('pagehide', () => {
    save();
    releaseEndpoint('leave');
    releaseTail();
  });
  // One write after a gesture preserves Forward as well as Back without
  // flooding history APIs or adding an idle timer / another RAF scheduler.
  window.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(scrollSave);
      scrollSave = window.setTimeout(() => {
        scrollSave = null;
        save();
      }, 350);
    },
    { passive: true }
  );
  window.addEventListener('site:motion-preference', () => {
    if (!motionAllowed()) finishText();
  });
  window.SiteNavigation = {
    push,
    primaryRoutes,
    reconcileEndpoint,
    contentFlight(value) {
      const enabled = presentation?.contentFlight?.(value) ?? true;
      if (typeof value === 'boolean') scrollEntry?.refreshPreference?.();
      return enabled;
    },
    go(next, { atEnd = false, input = null } = {}) {
      if (
        next === page ||
        !primaryRoutes.includes(page) ||
        !primaryRoutes.includes(next) ||
        request ||
        transition
      )
        return false;
      navigate(
        new URL(embedded?.files[next] || (next === 'index' ? './' : next + '.html'), directory),
        { position: atEnd ? 'end' : null, input }
      );
      return true;
    },
  };
  const first = embedded ? routeFor(new URL(window.location.href)) : page;
  if (first !== page) navigate(new URL(window.location.href), { initial: true });
  else save();
})();
