/* One document, one header and one canvas. Every route remains ordinary HTML. */
(() => {
  'use strict';
  const scrollEntry = window.SiteScrollEntry;
  scrollEntry?.boot();
  const routes = ['index', 'research', 'writing', 'talks', 'credits'];
  const bundle = document.getElementById('site-pages');
  const embedded = bundle ? JSON.parse(bundle.textContent) : null;
  const entry = new URL(window.location.href);
  const directory = new URL(
    document.querySelector('meta[name="site-base"]')?.content || '.',
    entry
  );
  const documentIndex = document.getElementById('site-documents');
  const articles = documentIndex ? JSON.parse(documentIndex.textContent) : {};
  const embeddedAssetURLs = new Map();
  let embeddedAssetsReady = null;
  if (embedded?.assets) {
    for (const image of document.querySelectorAll('img[data-offline-resource]')) {
      const name = image.getAttribute('data-offline-resource');
      const value = image.getAttribute('src');
      if (embeddedAssetURLs.has(name) && embeddedAssetURLs.get(name) !== value) return;
      embeddedAssetURLs.set(name, value);
    }
  }
  if (Object.keys(articles).length > 50) return;
  for (const [key, article] of Object.entries(articles)) {
    if (
      !/^[a-z][a-z0-9-]{0,79}:(?:en|uk)$/.test(key) ||
      !/^articles\/[a-z][a-z0-9-]{0,79}\.html$/.test(article.url) ||
      (article.snapshot &&
        !/^article-snapshots\/[a-f0-9]{64}\/[a-z][a-z0-9-]{0,79}\.html$/.test(article.snapshot))
    )
      return;
  }
  const shellEngine = document.querySelector('meta[name="site-engine"]')?.content;
  const initialVersion = document.querySelector('meta[name="site-route"]')?.content;
  const initialPage = document.body.dataset.article
    ? 'article:' + document.body.dataset.article
    : document.body.dataset.page;
  let pinned = null;
  let page = initialPage,
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
  if (
    !(routes.includes(page) || articles[page.slice(8)]) ||
    !window.fetch ||
    !window.DOMParser ||
    !window.history.pushState
  )
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
  // History changes the document's base URL. Preserve each persistent header
  // destination, then keep its native relative link correct for every mount.
  const headerURLs = new Map(
    [...document.querySelectorAll('.site-header a[href]')].map((link) => [
      link,
      new URL(link.getAttribute('href'), entry),
    ])
  );
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
    'meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],meta[name="robots"],meta[name="site-article"],meta[name="site-route"],link[rel="canonical"],link[rel="alternate"],script[type="application/ld+json"],style[data-critical-media]';
  function resolveResources(data, sourceURL) {
    for (const root of [data.main, data.footer, data.fallback, ...data.metadata])
      for (const element of [root, ...root.querySelectorAll('[href],[src]')])
        for (const attribute of ['href', 'src']) {
          const value = element.getAttribute(attribute);
          if (value && !/^(?:https:|mailto:|#|data:)/.test(value))
            element.setAttribute(attribute, new URL(value, sourceURL).href);
        }
  }
  function rebaseResources(data, url) {
    if (embedded) return;
    const depth = url.pathname.slice(directory.pathname.length).split('/').length - 1;
    for (const root of [data.main, data.footer, data.fallback])
      for (const element of [root, ...root.querySelectorAll('[href],[src]')])
        for (const attribute of ['href', 'src']) {
          const value = element.getAttribute(attribute);
          if (!value || /^(?:mailto:|#|data:)/.test(value)) continue;
          const target = new URL(value, data.sourceURL || entry);
          if (target.origin !== entry.origin || !target.pathname.startsWith(directory.pathname))
            continue;
          const relative =
            '../'.repeat(Math.max(0, depth)) + target.pathname.slice(directory.pathname.length);
          element.setAttribute(attribute, (relative || './') + target.search + target.hash);
        }
  }
  function extract(doc, immutable = false, sourceURL = null) {
    const scene = doc.body.dataset.page;
    const article = doc.body.dataset.article;
    const next = article ? 'article:' + article : scene;
    const main = doc.querySelector('main'),
      footer = doc.querySelector('footer'),
      fallback = doc.querySelector('.space-fallback');
    if (
      !routes.includes(scene) ||
      (article && (!articles[article] || scene !== 'writing')) ||
      !main ||
      !footer ||
      !fallback
    )
      throw Error('Incomplete site route');
    const version = doc.querySelector('meta[name="site-route"]')?.content,
      engine = doc.querySelector('meta[name="site-engine"]')?.content;
    const data = {
      page: next,
      scene,
      article,
      version,
      engine,
      sourceURL: sourceURL || window.location.href,
      title: doc.title,
      lang: doc.documentElement.lang,
      main: main.cloneNode(true),
      footer: footer.cloneNode(true),
      fallback: fallback.cloneNode(true),
      metadata: [...doc.head.querySelectorAll(metadata)].map((node) => node.cloneNode(true)),
    };
    if (immutable) resolveResources(data, sourceURL);
    return data;
  }
  cache.set(page, extract(document));
  function routeFor(url) {
    if (url.origin !== entry.origin) return null;
    if (embedded) {
      if (url.pathname === entry.pathname)
        return routes.includes(url.searchParams.get('view')) ||
          (url.searchParams.get('view')?.startsWith('article:') &&
            Object.hasOwn(embedded.pages, url.searchParams.get('view')))
          ? url.searchParams.get('view')
          : document.body.dataset.entryPage;
      return (
        Object.keys(embedded.files).find(
          (name) => new URL(embedded.files[name], directory).pathname === url.pathname
        ) || null
      );
    }
    const article = Object.entries(articles).find(([, descriptor]) =>
      [descriptor.url, descriptor.snapshot]
        .filter(Boolean)
        .some((file) => new URL(file, directory).pathname === url.pathname)
    );
    if (article) return 'article:' + article[0];
    return (
      routes.find((name) =>
        [name, name + '.html', ...(name === 'index' ? ['./'] : [])].some(
          (file) => new URL(file, directory).pathname === url.pathname
        )
      ) || null
    );
  }
  function address(url, next) {
    if (!embedded) {
      if (!next.startsWith('article:')) return url;
      const result = new URL(articles[next.slice(8)].url, directory);
      result.search = url.search;
      result.hash = url.hash;
      return result;
    }
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
  function save(fallbackFocus = null) {
    if (departureUnavailable() || routeFor(new URL(window.location.href)) !== page) return;
    try {
      history.replaceState(
        {
          ...history.state,
          site: {
            page,
            scroll: [window.scrollX, window.scrollY],
            focus:
              document.activeElement?.id ||
              document.activeElement?.getAttribute?.('href') ||
              fallbackFocus ||
              null,
          },
        },
        '',
        window.location.href
      );
    } catch {
      /* Native navigation still works. */
    }
  }
  function departureUnavailable() {
    return (
      content.inert ||
      content.querySelector('main')?.getAttribute('data-route-blocks') === 'departing'
    );
  }
  function departureFocus() {
    // Retargeting an unmounted flight can leave its departure link blurred by
    // visibility or inert. Keep captured focus unless the reader focused a control.
    return departureUnavailable() &&
      history.state?.site?.page === page &&
      (!document.activeElement || document.activeElement === document.body)
      ? history.state.site.focus
      : undefined;
  }
  function departurePosition() {
    const saved =
      departureUnavailable() && history.state?.site?.page === page
        ? history.state.site.scroll
        : null;
    return [saved?.[0] ?? window.scrollX, saved?.[1] ?? window.scrollY];
  }
  function saveDeparture(destination, pop, initial, fallbackFocus) {
    if (!pop && !initial && destination.href !== window.location.href) save(fallbackFocus);
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
    const articleRows = revision.articles || {};
    if (Object.keys(articleRows).length !== Object.keys(articles).length) return false;
    for (const [key, data] of Object.entries(articleRows)) {
      if (
        !articles[key] ||
        data.scene !== 'writing' ||
        data.alias !== articles[key].url ||
        data.articleId !== key.split(':')[0] ||
        !/^[a-z][a-z0-9-]{0,79}$/.test(data.contentEdition) ||
        !/^[a-f0-9]{64}$/.test(data.sourceSha256) ||
        !/^[a-f0-9]{64}$/.test(data.semanticSha256) ||
        !/^[a-f0-9]{64}$/.test(data.version) ||
        !/^[a-f0-9]{64}$/.test(data.sha256) ||
        data.url !== `article-snapshots/${data.version}/${data.alias.split('/').pop()}` ||
        (articles[key].snapshot && data.url !== articles[key].snapshot)
      )
        return false;
    }
    const initial = initialPage.startsWith('article:')
      ? articleRows[initialPage.slice(8)]
      : revision.routes[initialPage];
    return initial?.version === initialVersion;
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
      if (new TextEncoder().encode(bytes).byteLength > 32000) throw Error('Revision too large');
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
  async function verifyEmbeddedAssets() {
    if (!embedded?.assets) return;
    if (!embeddedAssetsReady)
      embeddedAssetsReady = (async () => {
        const entries = Object.entries(embedded.assets);
        if (entries.length > 50 || entries.length !== embeddedAssetURLs.size)
          throw Error('Embedded asset inventory differs');
        for (const [name, asset] of entries) {
          const value = embeddedAssetURLs.get(name);
          if (
            !/^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*\.png$/.test(name) ||
            asset.mime !== 'image/png' ||
            asset.sha256 !== name.split('/')[1] ||
            !Number.isSafeInteger(asset.bytes) ||
            asset.bytes < 1 ||
            asset.bytes > 2000000 ||
            typeof value !== 'string' ||
            !/^data:image\/png;base64,[A-Za-z0-9+/]*={0,2}$/.test(value) ||
            value.length > 4 * Math.ceil(asset.bytes / 3) + 22
          )
            throw Error('Invalid embedded article resource');
          const raw = window.atob(value.slice(22));
          if (raw.length !== asset.bytes) throw Error('Embedded asset byte length differs');
          const bytes = Uint8Array.from(raw, (character) => character.charCodeAt(0));
          const digest = await window.crypto.subtle.digest('SHA-256', bytes);
          const hash = [...new Uint8Array(digest)]
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
          if (hash !== asset.sha256) throw Error('Embedded article asset bytes changed');
        }
      })();
    await embeddedAssetsReady;
  }
  function hydrateEmbeddedImages(result, descriptor) {
    const used = new Set();
    for (const image of result.main.querySelectorAll('img[src]')) {
      const name = image.getAttribute('src');
      if (!name.startsWith('article-media/')) continue;
      if (!descriptor.assets.includes(name) || !embeddedAssetURLs.has(name))
        throw Error('Unknown embedded article image');
      image.setAttribute('src', embeddedAssetURLs.get(name));
      used.add(name);
    }
    if (used.size !== descriptor.assets.length)
      throw Error('Embedded article image closure differs');
  }
  async function read(next, signal) {
    await pin(signal);
    if (embedded && next.startsWith('article:')) await verifyEmbeddedAssets();
    if (cache.has(next)) return cache.get(next);
    let html;
    const descriptor = next.startsWith('article:')
      ? pinned.articles[next.slice(8)]
      : pinned.routes[next];
    const sourceURL = new URL(descriptor.url, directory);
    if (embedded) {
      html = embedded.pages[next];
      if (
        typeof html !== 'string' ||
        (next.startsWith('article:') &&
          (new TextEncoder().encode(html).byteLength > 100000 ||
            !(await matchesBytes(html, descriptor.sha256))))
      )
        throw Error('Embedded document bytes changed');
    } else {
      const response = await fetch(sourceURL, {
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
      if (
        new TextEncoder().encode(html).byteLength > 100000 ||
        !(await matchesBytes(html, descriptor.sha256))
      )
        throw Error('Snapshot bytes changed');
    }
    const result = extract(
      new DOMParser().parseFromString(html, 'text/html'),
      !embedded,
      sourceURL
    );
    if (embedded && next.startsWith('article:')) hydrateEmbeddedImages(result, descriptor);
    if (
      result.page !== next ||
      result.engine !== shellEngine ||
      result.version !== descriptor.version
    )
      throw Error('Unexpected route/version');
    cache.set(next, result);
    const cachedArticles = [...cache.keys()].filter((key) => key.startsWith('article:'));
    if (cachedArticles.length > 10) cache.delete(cachedArticles[0]);
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
    rebaseResources(data, url);
    content.replaceChildren(data.main, data.footer);
    document.body.dataset.page = data.scene || data.page;
    if (data.article) document.body.dataset.article = data.article;
    else delete document.body.dataset.article;
    page = data.page;
    if (document.documentElement.lang !== data.lang) document.documentElement.lang = data.lang;
    document.title = data.title;
    for (const node of document.head.querySelectorAll(metadata)) node.remove();
    document.head.append(...data.metadata);
    const fallback = document.querySelector('.space-fallback');
    if (fallback) fallback.replaceWith(data.fallback);
    for (const link of document.querySelectorAll('.site-header a')) {
      const target = headerURLs.get(link) || new URL(link.href, window.location.href);
      if (target.origin === entry.origin && target.pathname.startsWith(directory.pathname)) {
        const depth = url.pathname.slice(directory.pathname.length).split('/').length - 1;
        const relative =
          '../'.repeat(Math.max(0, depth)) + target.pathname.slice(directory.pathname.length);
        link.setAttribute('href', (relative || './') + target.search + target.hash);
      }
      if (routeFor(target) === (data.scene || page)) link.setAttribute('aria-current', 'page');
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
    const nextScene = routes.includes(next) ? next : 'writing';
    const currentScene = routes.includes(page) ? page : 'writing';
    const direction = routes.indexOf(nextScene) >= routes.indexOf(currentScene) ? 1 : -1;
    const interruptedFocus = departureFocus();
    const interruptedPosition = departurePosition();
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
      // Stop a native smooth focus/anchor scroll inherited from activation.
      // Fresh reading input during the asynchronous read still reaches saveDeparture.
      restoreScroll(interruptedPosition[0], interruptedPosition[1]);
      const data = await read(next, controller.signal);
      if (own !== serial) return;
      const prepared = prepare(data);
      const destination = address(url, next);
      // Departure visibility and inert can both blur native links. Capture
      // reading state before either owner makes the outgoing content inaccessible.
      saveDeparture(destination, pop, initial, interruptedFocus);
      let animate = !initial && nextScene !== currentScene && motionAllowed();
      let blocks = animate && (presentation?.contentFlight?.() ?? true);
      if (blocks) {
        const result = await scrollEntry?.depart?.(direction, own);
        blocks = result?.completed === true;
      }
      animate = animate && motionAllowed();
      if (own !== serial) return;
      await flight(
        nextScene,
        animate,
        () => {
          const start = window.SiteEngineStages ? performance.now() : 0;
          if (!pop && !initial && destination.href !== window.location.href) {
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
        const savedFocus = pop ? history.state?.site?.focus : null;
        const focused = savedFocus
          ? document.getElementById(savedFocus) ||
            [...content.querySelectorAll('a[href]')].find(
              (link) => link.getAttribute('href') === savedFocus || link.href === savedFocus
            )
          : null;
        (focused || content.querySelector('main')).focus({
          preventScroll: true,
        });
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
