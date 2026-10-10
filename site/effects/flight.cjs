'use strict';
const fragmentPlan = require('./fragment-plan.cjs');
const fragmentDOM = require('./fragment-dom.cjs');
const embeddedPlan = require('./embedded-plan.cjs');
const embeddedTexture = require('./embedded-texture.cjs');
const embeddedScene = require('./embedded-scene.cjs');
// Optional offline navigation comparison. Authored production sources stay intact.
function flightPose(progress, direction, departure = { z: 0, opacity: 1 }) {
  const clamp = (t) => Math.max(0, Math.min(1, t)),
    smooth = (t) => {
      t = clamp(t);
      return t * t * (3 - 2 * t);
    };
  progress = clamp(progress);
  if (progress === 1) return { stage: 'settled', z: 0, opacity: 1 };
  if (progress < 0.5) {
    const t = clamp(progress / 0.46),
      eased = smooth(t),
      end = direction === 'forward' ? 1050 : -3600;
    return {
      stage: 'depart',
      z: departure.z + (end - departure.z) * eased,
      opacity: departure.opacity * (1 - smooth((t - 0.22) / 0.78)),
    };
  }
  const t = clamp((progress - 0.5) / 0.5),
    near = direction === 'backward' ? 1020 : -4200;
  return {
    stage: 'arrive',
    z: near * (1 - smooth(t)),
    opacity: Math.min(0.999, smooth((t - 0.02) / 0.98)),
  };
}
function endScrollGate() {
  let edges = { top: null, bottom: null },
    selected = null,
    ready = 0,
    last = -Infinity,
    total = 0,
    kind = null,
    wheelIntent = false,
    progress = 0;
  function intent() {
    total = 0;
    wheelIntent = false;
    progress = 0;
  }
  function reset(now = 0) {
    edges = { top: null, bottom: null };
    selected = null;
    ready = Math.max(ready, now + 700);
    last = -Infinity;
    kind = null;
    intent();
  }
  function boundary(bottom, now, top = false) {
    for (const [name, at] of [
      ['top', top],
      ['bottom', bottom],
    ]) {
      if (!at) {
        edges[name] = null;
        if (selected === name) intent();
      } else if (edges[name] === null) edges[name] = now;
    }
  }
  function offer(input) {
    const { bottom, top = false, now, delta, type } = input;
    boundary(bottom, now, top);
    const edge = delta < 0 ? 'top' : delta > 0 ? 'bottom' : null;
    if (!edge || edges[edge] === null || now < ready) {
      intent();
      last = now;
      return false;
    }
    if (type !== kind || edge !== selected || now - last > 900) intent();
    selected = edge;
    if (type === 'wheel' && now - last > 180 && now - edges[edge] >= 180) wheelIntent = true;
    const eligible = type === 'wheel' ? wheelIntent : input.deliberate === true;
    kind = type;
    last = now;
    if (!eligible) return false;
    const limit = type === 'touch' ? 84 : 160;
    total += Math.min(limit, Math.abs(delta));
    progress = Math.min(1, total / limit);
    if (total < limit) return false;
    reset(now);
    ready = now + 1000;
    return true;
  }
  reset();
  return { reset, boundary, offer, progress: () => progress };
}
function atPageEnd(top, scrollHeight, height) {
  const max = Math.max(0, scrollHeight - height),
    clamped = Math.max(0, Math.min(max, top));
  return max - clamped <= 2;
}
function atPageStart(top) {
  return Math.max(0, top) <= 2;
}
function installFlightPreference() {
  function mount() {
    const controls = document.querySelector('.display-controls');
    if (!controls || !window.SiteNavigation?.contentFlight) return;
    const label = document.createElement('label');
    label.className = 'theme-control end-scroll-control';
    label.textContent = 'Content flight ';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'content-flight';
    input.checked = window.SiteNavigation.contentFlight();
    input.setAttribute('aria-label', 'Content flight');
    label.append(input);
    controls.append(label);
    input.addEventListener('change', () => {
      window.SiteNavigation.contentFlight(input.checked);
      try {
        localStorage.setItem('vo.content-flight', input.checked ? 'on' : 'off');
      } catch {
        /* In-tab controls remain useful. */
      }
    });
    const preview = document.createElement('label');
    preview.className = 'theme-control end-scroll-control';
    preview.textContent = 'Fragment flight preview ';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'fragment-flight-preview';
    checkbox.checked = window.SiteNavigation.fragmentPreview();
    checkbox.setAttribute('aria-label', 'Fragment flight preview');
    preview.append(checkbox);
    controls.append(preview);
    checkbox.addEventListener('change', () => {
      window.SiteNavigation.fragmentPreview(checkbox.checked);
    });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
}
function installEndScroll(gateFactory, isEnd, isStart) {
  function mount() {
    const content = document.getElementById('site-content'),
      controls = document.querySelector('.display-controls');
    if (
      !content ||
      !controls ||
      !window.SiteNavigation?.go ||
      document.getElementById('end-scroll')
    )
      return;
    const routes = window.SiteNavigation.primaryRoutes,
      names = ['Home', 'Research', 'Writing', 'Talks', 'Credits'];
    const gate = gateFactory(),
      clock = () => performance.now();
    let enabled = true,
      printing = false,
      touch = null,
      hint = null;
    try {
      enabled = localStorage.getItem('vo.end-scroll') !== 'off';
    } catch {
      /* Works within this tab. */
    }
    const label = document.createElement('label');
    label.className = 'theme-control end-scroll-control';
    label.textContent = 'Scroll between pages ';
    const input = document.createElement('input');
    input.id = 'end-scroll';
    input.type = 'checkbox';
    input.checked = enabled;
    input.setAttribute('aria-label', 'Scroll between pages');
    input.title = 'Continue scrolling at the top or bottom to change section.';
    label.append(input);
    controls.append(label);
    function neighbor(direction) {
      const index = routes.indexOf(document.body.dataset.page);
      return index >= 0 ? routes[index + direction] || null : null;
    }
    function bounds() {
      return {
        top: isStart(scrollY),
        bottom: isEnd(scrollY, document.documentElement.scrollHeight, innerHeight),
      };
    }
    function available(direction = 0) {
      return (
        enabled &&
        !!(direction ? neighbor(direction) : neighbor(1) || neighbor(-1)) &&
        !printing &&
        !document.hidden &&
        !content.hasAttribute('aria-busy') &&
        !document.querySelector('.appearance')?.open
      );
    }
    function updateHint() {
      const footer = content.querySelector('footer'),
        route = neighbor(1);
      if (!footer) return;
      hint = footer.querySelector('.scroll-continue');
      if (!route) {
        hint?.remove();
        hint = null;
        return;
      }
      if (!hint) {
        hint = document.createElement('a');
        hint.className = 'scroll-continue';
        footer.append(hint);
      }
      hint.href = '?view=' + route;
      hint.textContent = 'Keep scrolling for ' + names[routes.indexOf(route)] + ' ↓';
      hint.hidden = !enabled;
    }
    function clear() {
      gate.reset(clock());
      hint?.style.removeProperty('--scroll-intent');
    }
    function discard() {
      touch?.release();
      touch = null;
      clear();
    }
    function routeReady() {
      updateHint();
      if (!touch?.consumed) {
        touch?.release();
        touch = null;
      }
      clear();
      const edge = bounds();
      gate.boundary(edge.bottom, clock(), edge.top);
    }
    function ignored(target) {
      if (
        !(target instanceof Element) ||
        target.closest(
          'input,textarea,select,button,[contenteditable="true"],.appearance,[role="dialog"]'
        )
      )
        return true;
      for (let el = target; el && el !== document.body; el = el.parentElement) {
        if (
          el.scrollHeight > el.clientHeight + 2 &&
          /^(auto|scroll|overlay)$/.test(getComputedStyle(el).overflowY)
        )
          return true;
      }
      return false;
    }
    function offer(type, delta, deliberate = false) {
      const direction = Math.sign(delta);
      if (!direction || !available(direction)) {
        clear();
        return false;
      }
      const accepted = gate.offer({
        type,
        delta,
        deliberate,
        ...bounds(),
        now: clock(),
      });
      hint?.style.setProperty('--scroll-intent', String(direction > 0 ? gate.progress() : 0));
      if (accepted) {
        const route = neighbor(direction);
        if (type === 'touch' && touch) touch.consumed = true;
        clear();
        return route
          ? window.SiteNavigation.go(route, {
              atEnd: direction < 0,
              input: type,
            })
          : false;
      }
      return false;
    }
    input.addEventListener('change', () => {
      enabled = input.checked;
      try {
        localStorage.setItem('vo.end-scroll', enabled ? 'on' : 'off');
      } catch {
        /* In-tab preference is enough. */
      }
      routeReady();
    });
    window.addEventListener(
      'wheel',
      (event) => {
        if (
          event.defaultPrevented ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey ||
          event.shiftKey ||
          Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
          ignored(event.target)
        )
          return;
        const pixels =
          event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
        if (offer('wheel', pixels) && event.cancelable) event.preventDefault();
      },
      { passive: false }
    );
    window.addEventListener(
      'scroll',
      () => {
        const edge = bounds();
        gate.boundary(edge.bottom, clock(), edge.top);
        if (!edge.bottom) hint?.style.removeProperty('--scroll-intent');
      },
      { passive: true }
    );
    window.addEventListener(
      'touchstart',
      (event) => {
        touch?.release();
        touch = null;
        if (event.touches.length !== 1 || ignored(event.target) || !available()) return;
        const point = event.touches[0],
          target = event.target,
          gesture = {
            id: point.identifier,
            x: point.clientX,
            y: point.clientY,
            started: bounds(),
            consumed: false,
          };
        // Touch events keep their original target after its route DOM is removed;
        // they then stop bubbling to window. Retain only this gesture's listeners
        // so its accepted tail cannot scroll the instantaneous destination.
        const consume = (event) => {
          if (gesture.consumed && event.cancelable) event.preventDefault();
        };
        const release = () => {
          target.removeEventListener('touchmove', consume);
          target.removeEventListener('touchend', release);
          target.removeEventListener('touchcancel', release);
          if (touch === gesture) touch = null;
        };
        gesture.release = release;
        target.addEventListener('touchmove', consume, { passive: false });
        target.addEventListener('touchend', release, { passive: true });
        target.addEventListener('touchcancel', release, { passive: true });
        touch = gesture;
      },
      { passive: true }
    );
    window.addEventListener(
      'touchmove',
      (event) => {
        if (!touch) return;
        if (event.touches.length !== 1) {
          touch.release();
          return;
        }
        if (touch.consumed) {
          if (event.cancelable) event.preventDefault();
          return;
        }
        const point = [...event.touches].find((p) => p.identifier === touch.id);
        if (!point) {
          touch.release();
          return;
        }
        const dy = touch.y - point.clientY,
          dx = touch.x - point.clientX;
        touch.y = point.clientY;
        touch.x = point.clientX;
        const edge = dy < 0 ? 'top' : 'bottom';
        if (touch.started[edge] && bounds()[edge] && Math.abs(dy) > Math.abs(dx)) {
          // Consume only continuation beyond the actual edge. Otherwise an instant
          // route change transfers this same gesture's default scroll to its page.
          if (available(Math.sign(dy)) && event.cancelable) event.preventDefault();
          offer('touch', dy, true);
        }
      },
      { passive: false }
    );
    for (const name of ['touchend', 'touchcancel'])
      window.addEventListener(
        name,
        () => {
          touch?.release();
          touch = null;
        },
        { passive: true }
      );
    window.addEventListener('keydown', (event) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (event.shiftKey && event.key !== ' ') ||
        ignored(event.target) ||
        event.target.closest('a,[role="button"]')
      )
        return;
      const direction =
        ['PageUp', 'ArrowUp'].includes(event.key) || (event.key === ' ' && event.shiftKey)
          ? -1
          : ['PageDown', 'ArrowDown', ' '].includes(event.key)
            ? 1
            : 0;
      if (direction) {
        if (offer('key', direction * (event.key.startsWith('Arrow') ? 40 : 160), true))
          event.preventDefault();
      } else if (['Home', 'End'].includes(event.key)) clear();
    });
    window.addEventListener('site:page-ready', routeReady);
    window.addEventListener('site:page-mount', updateHint);
    if (window.MutationObserver)
      new window.MutationObserver(() => {
        if (!content.hasAttribute('aria-busy')) routeReady();
      }).observe(content, { attributes: true, attributeFilter: ['aria-busy'] });
    window.addEventListener('beforeprint', () => {
      printing = true;
      discard();
    });
    window.addEventListener('afterprint', () => {
      printing = false;
      routeReady();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) discard();
      else routeReady();
    });
    window.addEventListener(
      'resize',
      () => {
        discard();
        const edge = bounds();
        gate.boundary(edge.bottom, clock(), edge.top);
      },
      { passive: true }
    );
    routeReady();
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
}
function createPresentation(content) {
  let contentFlight = true,
    fragmentPreview = true,
    useFragments = false,
    useSolids = false,
    phaseFragments = false,
    capturing = false,
    waitingArrival = false,
    fragments = null,
    lastPose = null,
    journeyDirection = 'forward',
    journeyContext = {};
  try {
    contentFlight = localStorage.getItem('vo.content-flight') !== 'off';
    fragmentPreview = localStorage.getItem('vo.fragment-preview') !== 'off';
  } catch {
    /* In-tab preference is sufficient. */
  }
  function setPlane(pose) {
    if (content.dataset.flightStage !== pose.stage) {
      const top = window.SiteEffects?.nativePlaneTop;
      content.style.transformOrigin =
        '50% ' +
        (window.scrollY +
          window.innerHeight * 0.5 -
          (typeof top === 'number' ? top : content.offsetTop)) +
        'px';
    }
    content.dataset.flightStage = pose.stage;
    content.dataset.flightDepth = String(pose.z);
    content.style.opacity = String(pose.opacity);
    if (contentFlight) content.style.transform = 'perspective(1200px) translateZ(' + pose.z + 'px)';
    else content.style.removeProperty('transform');
  }
  function beginFragments() {
    fragments ||= fragmentDOM(
      content,
      fragmentPlan({ cameraView: (...args) => window.SiteEffects.cameraView(...args) }),
      () => {
        phaseFragments = false;
        setPlane(lastPose);
      },
      {
        exclude: () =>
          window.SiteEffects.embedded?.owners?.() || window.SiteEffects.embedded?.owner(),
        reserve: () => window.SiteEffects.embedded?.reservation(),
      }
    );
    fragments.begin(journeyContext);
  }
  function nativeSolidPlane() {
    content.style.opacity = String(window.SiteEffects.embedded?.nativeOpacity?.() ?? 1);
    content.style.transform = 'none';
  }
  return {
    mountAt: 0.5,
    layoutStableDuringTravel: true,
    mount() {
      const frame = document.createElement('div');
      frame.id = 'site-content-frame';
      content.before(frame);
      frame.append(content);
    },
    canTravel: () => window.CSS?.supports?.('overflow', 'clip') === true,
    clear() {
      window.SiteEffects.embedded?.cancel();
      fragments?.clear();
      useFragments = false;
      useSolids = false;
      phaseFragments = false;
      capturing = false;
      waitingArrival = false;
      content.style.removeProperty('transform-origin');
      delete content.dataset.flightStage;
      delete content.dataset.flightDepth;
    },
    departure: () => ({
      opacity: Number(content.style.opacity || 1),
      z: Number(content.dataset.flightDepth || 0),
    }),
    restoreDeparture(departure) {
      if (departure.z || departure.opacity < 1) setPlane({ stage: 'depart', ...departure });
      content.style.opacity = String(departure.opacity);
      content.inert = departure.opacity < 1;
    },
    prepareMount() {
      fragments?.clear();
      phaseFragments = false;
      content.style.transform = 'none';
      content.style.opacity = '0';
      content.style.removeProperty('transform-origin');
      delete content.dataset.flightStage;
    },
    begin(animate, context = {}) {
      journeyDirection = context?.direction || 'forward';
      journeyContext = { ...context, direction: journeyDirection };
      useFragments = animate && contentFlight && fragmentPreview;
      useSolids = false;
      phaseFragments = false;
      capturing = useFragments;
      waitingArrival = false;
      if (useFragments) useSolids = window.SiteEffects.embedded?.begin(context) === true;
      else window.SiteEffects.embedded?.invalidate();
      if (useSolids) {
        capturing = false;
        nativeSolidPlane();
      }
      if (useFragments && !useSolids) {
        beginFragments();
      }
    },
    mounted() {
      capturing = false;
      phaseFragments = false;
      // A newly mounted native page gets a fresh local admission attempt even
      // when departure's clone/deadline fallback rejected its old paint.
      if (useFragments) {
        window.SiteEffects.embedded?.land(content);
        if (useSolids && window.SiteEffects.embedded?.active?.()) {
          nativeSolidPlane();
          waitingArrival = false;
          return;
        }
        useSolids = false;
        beginFragments();
      }
      waitingArrival = useFragments;
    },
    present(progress, direction, departure, snapshot) {
      const painted = snapshot && { ...snapshot, direction: journeyDirection };
      window.SiteEffects.embedded?.present?.(progress, painted);
      lastPose = flightPose(progress, journeyDirection, departure);
      if (snapshot?.active === false) {
        window.SiteEffects.embedded?.invalidate();
        fragments?.clear();
        useFragments = false;
        useSolids = false;
        phaseFragments = false;
        capturing = false;
        waitingArrival = false;
      }
      if (useSolids) {
        nativeSolidPlane();
        if (progress === 1) return window.SiteEffects.embedded?.complete() !== false;
        return;
      }
      if (useFragments && waitingArrival) {
        const status = fragments.arrivalStatus(painted);
        if (status === 'wait') {
          content.style.opacity = '0';
          content.style.transform = 'none';
          return;
        }
        waitingArrival = false;
        phaseFragments = status === 'ready' && fragments.prepare('arrive', painted);
      }
      if (useFragments && capturing && painted?.painted) {
        capturing = false;
        phaseFragments = fragments.prepare('depart', painted);
      }
      if (phaseFragments && fragments.present(progress, painted)) {
        if (window.SiteEffects.embedded?.active?.()) {
          content.style.opacity = '1';
          content.style.transform = 'none';
        }
        const embeddedDone = window.SiteEffects.embedded?.complete() !== false;
        return progress === 1 ? fragments.complete() && embeddedDone : undefined;
      }
      if (phaseFragments && fragments.active() === false) phaseFragments = false;
      setPlane(lastPose);
      if (window.SiteEffects.embedded?.active?.()) {
        content.style.opacity = '1';
        content.style.transform = 'none';
      }
      if (progress === 1 && window.SiteEffects.embedded?.complete() === false) return false;
    },
    contentFlight(value) {
      if (typeof value === 'boolean') {
        contentFlight = value;
        if (!value) {
          window.SiteEffects.embedded?.invalidate();
          fragments?.clear();
          useFragments = false;
          useSolids = false;
          phaseFragments = false;
        } else window.SiteEffects.embedded?.refresh();
        if (content.dataset.flightStage)
          setPlane({
            stage: content.dataset.flightStage,
            z: Number(content.dataset.flightDepth || 0),
            opacity: Number(content.style.opacity || 1),
          });
      }
      return contentFlight;
    },
    fragmentPreview(value) {
      if (typeof value === 'boolean') {
        fragmentPreview = value;
        if (!value) {
          window.SiteEffects.embedded?.invalidate();
          fragments?.clear();
          useFragments = false;
          useSolids = false;
          phaseFragments = false;
        } else window.SiteEffects.embedded?.refresh();
        try {
          localStorage.setItem('vo.fragment-preview', value ? 'on' : 'off');
        } catch {
          /* In-tab preference is sufficient. */
        }
      }
      return fragmentPreview;
    },
    canPrepareNext: () => contentFlight && fragmentPreview,
    async prepareTransition(data, context, signal) {
      if (!contentFlight || !fragmentPreview) return;
      const embedded = window.SiteEffects.embedded;
      if (!embedded) return;
      try {
        for (const neighbor of context.corridor || []) {
          await embedded.prime(neighbor, content.offsetTop, null, { signal });
          if (signal?.aborted) return;
        }
        await embedded.prime(data, content.offsetTop, context.landing, { signal });
        if (signal?.aborted) return;
        await embedded.prepareDeparture?.(content, { signal });
      } catch {
        embedded.invalidate();
      }
    },
    async prepareNext(data, signal) {
      if (!contentFlight || !fragmentPreview) return;
      const embedded = window.SiteEffects.embedded;
      if (await embedded?.prime(data, content.offsetTop, null, { signal })) {
        if (!signal?.aborted) await embedded.prepareDeparture?.(content, { signal });
      }
    },
  };
}
function measurePlane(read) {
  const plane = document.getElementById('site-content'),
    transform = plane?.style.transform;
  if (transform) plane.style.transform = 'none';
  try {
    const result = read();
    // Reuse the same native layout snapshot when presentation resumes. Reading
    // offsetTop after mount restores root styles would force a second flush.
    if (plane) window.SiteEffects.nativePlaneTop = plane.offsetTop;
    return result;
  } finally {
    if (transform) plane.style.transform = transform;
  }
}
function descriptor() {
  const code = `const flightPose=${flightPose.toString()};\nconst fragmentPlan=${fragmentPlan.toString()};\nconst fragmentDOM=${fragmentDOM.toString()};\nconst embeddedPlan=${embeddedPlan.toString()};\nconst embeddedTexture=${embeddedTexture.toString()};\nconst embeddedScene=${embeddedScene.toString()};\nwindow.SiteEffects.scene=(api)=>embeddedScene(api,{fragmentPlan,embeddedPlan,embeddedTexture});\nwindow.SiteEffects.registerView=(view)=>{window.SiteEffects.cameraView=view;};\nwindow.SiteEffects.navigation=${createPresentation.toString()};\nwindow.SiteEffects.measure=${measurePlane.toString()};`;
  const controls =
    '(' +
    installFlightPreference.toString() +
    ')();(' +
    installEndScroll.toString() +
    ')(' +
    endScrollGate.toString() +
    ',' +
    atPageEnd.toString() +
    ',' +
    atPageStart.toString() +
    ');';
  return {
    effect: 'travel',
    code,
    cssSources: ['site/effects/reading-surfaces.css', 'site/effects/flight.css'],
    controls,
    head: '<meta name="review-navigation" content="directional-content-flight-and-edge-scroll">\n',
  };
}
module.exports = {
  flightPose,
  endScrollGate,
  atPageEnd,
  atPageStart,
  installEndScroll,
  installFlightPreference,
  createPresentation,
  measurePlane,
  descriptor,
};
