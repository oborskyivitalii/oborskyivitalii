/* One document, one header and one canvas. Every route remains ordinary HTML. */
(() => {
  'use strict';
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
  presentation?.mount?.();
  const announcement = document.createElement('p');
  announcement.className = 'sr-only';
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  document.body.append(announcement);
  const metadata =
    'meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],script[type="application/ld+json"]';
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
      const mountAt = presentation?.mountAt ?? 0.18;
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
        // The Color midpoint has hidden the old plane. Yield the completed
        // Canvas paint before native archive construction/layout, using the
        // existing browser task queue rather than another animation clock.
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
            if (animate && presentation?.mountAt === 0.5 && progress < 1) queueMount();
            else mountNow(mountTimer !== null);
          }
          if (settled || own !== serial) {
            cancel();
            return;
          }
          // Do not reveal the old DOM if a painted progress jumps past the
          // midpoint before its queued native mount has completed.
          if (!mounted && mountTimer !== null) progress = mountAt;
          if (presentation) {
            if (progress === 1) finish();
            else
              presentation.present(
                progress,
                document.querySelector('.space-scene')?.dataset.direction || 'forward',
                departure
              );
            return;
          }
          // Smooth exit, empty tunnel, then arrival. No independent clock/RAF.
          const t = progress < 0.18 ? progress / 0.18 : Math.max(0, (progress - 0.72) / 0.28);
          const eased = t * t * (3 - 2 * t);
          // CSS serializes values near 1 as fully opaque before arrival.
          // Reserve full visibility for the renderer's actual arrival paint.
          const opacity =
            progress < 0.18 ? departure * (1 - eased) : progress === 1 ? 1 : Math.min(0.999, eased);
          content.style.opacity = String(opacity);
          content.style.transform =
            'translateY(' + (progress < 0.18 ? -10 * eased : 12 * (1 - eased)) + 'px)';
          if (progress === 1) finish();
        } catch (error) {
          fail(error);
        }
      };
      update.cancel = cancel;
      transition = update;
      content.inert = true;
      if (window.SiteScene) window.SiteScene.navigate(next, animate, transition, landing);
      else transition(1);
    });
  }
  function mount(data, url, position) {
    // History captured the old reading position before this layout-affecting
    // write. Clearing the plane before history's scroll read would flush the
    // old page, then immediately flush the newly mounted archive again.
    presentation?.prepareMount?.();
    // Clear the presentation transform before DOM writes and landing. The
    // nested scene measurement then reuses that same native layout snapshot.
    const run = () => mountNative(data, url, position);
    return effects?.measure ? effects.measure(run) : run();
  }
  function mountNative(data, url, position) {
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
    span('mount-unmount');
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
    const departure = presentation?.departure?.() ?? Number(content.style.opacity || 1);
    const own = ++serial;
    interrupt();
    if (position === 'end') endpoint = { own, page: next, mounted: false, arrived: false };
    if (input === 'wheel' || input === 'key') {
      inputTail = { own, type: input, key: lastKey };
    }
    if (presentation) presentation.restoreDeparture(departure);
    else {
      content.style.opacity = String(departure);
      content.inert = departure < 1;
    }
    window.SiteEngineProbe?.({
      kind: 'navigation-start',
      time: performance.now(),
      from: page,
      to: next,
    });
    const controller = new AbortController();
    request = controller;
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    content.setAttribute('aria-busy', 'true');
    try {
      const data = await read(next, controller.signal);
      if (own !== serial) return;
      const prepared = prepare(data);
      const animate =
        !initial && primaryRoutes.includes(page) && primaryRoutes.includes(next) && motionAllowed();
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
          mount(prepared, destination, position);
        },
        own,
        departure,
        { position, hash: url.hash, search: url.search }
      );
      // Arrival removes the content transform. Its temporary overflow/offset
      // must not remain the page's scroll range or semantic waypoint geometry.
      if (own === serial) {
        if (!presentation?.layoutStableDuringTravel)
          window.SiteScene?.refresh({ reason: 'arrival' });
        arriveEndpoint();
        content.querySelector('main').focus({ preventScroll: true });
        announcement.textContent = data.title;
        save();
        window.SiteEngineProbe?.({ kind: 'navigation-ready', time: performance.now(), page: next });
      }
    } catch {
      if (own === serial) {
        releaseEndpoint('failed');
        releaseTail();
        window.location.assign(address(url, next).href);
      }
    } finally {
      window.clearTimeout(timeout);
      if (own === serial) {
        content.removeAttribute('aria-busy');
        request = null;
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
      if (link.getAttribute('href').startsWith('#')) return;
      event.preventDefault();
      const dest = address(url, next);
      if (dest.href !== window.location.href) push(dest);
      window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
      if (dest.hash)
        document.getElementById(dest.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
      else restoreScroll(0, 0);
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
    }
  });
  function finishText() {
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
      return presentation?.contentFlight?.(value) ?? false;
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
