/* One document, one header and one canvas. Every route remains ordinary HTML. */
(() => {
  'use strict';
  const scrollEntry = window.SiteScrollEntry;
  scrollEntry?.boot();
  function mountInitialReader() {
    window.SiteReader?.mount({ state: history.state?.site?.reader });
  }
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
  function embeddedResources(doc, declared) {
    const urls = new Map();
    if (!declared) return urls;
    for (const element of doc.querySelectorAll('[data-offline-resource]')) {
      const name = element.getAttribute('data-offline-resource');
      const value = element.getAttribute(element.tagName === 'IMG' ? 'src' : 'href');
      if (urls.has(name) && urls.get(name) !== value) return null;
      urls.set(name, value);
    }
    return urls;
  }
  const embeddedAssetURLs = embeddedResources(document, embedded?.assets);
  if (!embeddedAssetURLs) return mountInitialReader();
  let embeddedAssetsReady = null;
  if (Object.keys(articles).length > 50) return mountInitialReader();
  for (const [key, article] of Object.entries(articles)) {
    if (
      !/^[a-z][a-z0-9-]{0,79}:(?:en|uk)$/.test(key) ||
      !/^articles\/[a-z][a-z0-9-]{0,79}\.html$/.test(article.url) ||
      (article.snapshot &&
        !/^article-snapshots\/[a-f0-9]{64}\/[a-z][a-z0-9-]{0,79}\.html$/.test(article.snapshot))
    )
      return mountInitialReader();
  }
  const shellEngine = document.querySelector('meta[name="site-engine"]')?.content;
  const initialVersion = document.querySelector('meta[name="site-route"]')?.content;
  const initialPage = document.body.dataset.article
    ? 'article:' + document.body.dataset.article
    : document.body.dataset.page;
  let pinned = null;
  const readingEntries = new Map();
  let readingAddress = window.location.href;
  let page = initialPage,
    historyIndex = Number.isSafeInteger(history.state?.site?.index) ? history.state.site.index : 0,
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
    return mountInitialReader();
  const cache = new Map();
  // Cache snapshots have no browsing context; cloning must not fetch deferred media.
  const cacheDocument = document.implementation.createHTMLDocument('');
  const content = document.createElement('div');
  content.id = 'site-content';
  const effects = window.SiteEffects;
  if (effects && effects.contract !== 1) throw Error('Incompatible navigation effect contract');
  const presentation = effects?.navigation?.(content);
  const main = document.querySelector('main'),
    footer = document.querySelector('footer');
  if (!main || !footer) return mountInitialReader();
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
      main: cacheDocument.importNode(main, true),
      footer: cacheDocument.importNode(footer, true),
      fallback: cacheDocument.importNode(fallback, true),
      metadata: [...doc.head.querySelectorAll(metadata)].map((node) =>
        cacheDocument.importNode(node, true)
      ),
    };
    if (immutable) resolveResources(data, sourceURL);
    return data;
  }
  cache.set(page, extract(document));
  let slideSession = null;
  function closeSlides() {
    if (!slideSession) return;
    const { control, host, controller, url } = slideSession;
    slideSession = null;
    controller.abort();
    if (url) URL.revokeObjectURL(url);
    host.replaceChildren();
    host.hidden = true;
    control.removeAttribute('aria-busy');
    control.setAttribute('aria-expanded', 'false');
    control.textContent = 'View slides here';
  }
  async function slideBytes(source, signal) {
    const response = await fetch(source, {
      signal,
      credentials: 'same-origin',
      redirect: 'error',
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) {
      throw Error('Presentation PDF unavailable');
    }
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2000000) throw Error('Presentation PDF exceeds its byte budget');
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    return new Uint8Array(await new Blob(chunks).arrayBuffer());
  }
  document.addEventListener('click', async (event) => {
    const control = event.target.closest?.('.article-presentation .presentation-toggle');
    if (
      !control ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const section = control.closest('.article-presentation');
    const host = section.querySelector('.presentation-viewer');
    if (!host || !page.startsWith('article:')) return;
    event.preventDefault();
    const closing = slideSession?.control === control;
    closeSlides();
    if (closing) return;
    const session = {
      control,
      host,
      controller: new AbortController(),
      url: null,
    };
    slideSession = session;
    control.setAttribute('aria-busy', 'true');
    control.textContent = 'Loading slides…';
    const timeout = window.setTimeout(() => session.controller.abort(), 8000);
    try {
      await pin(session.controller.signal);
      if (embedded) await verifyEmbeddedAssets();
      const source = new URL(control.href);
      const descriptor = pinned.articles[page.slice(8)];
      const name = embedded
        ? control.getAttribute('data-offline-resource')
        : source.pathname.slice(directory.pathname.length);
      if (
        !descriptor.assets.includes(name) ||
        !name.endsWith('.pdf') ||
        (!embedded &&
          (source.origin !== entry.origin ||
            !source.pathname.startsWith(directory.pathname) ||
            source.search ||
            source.hash))
      )
        throw Error('Undeclared presentation resource');
      const bytes = await slideBytes(source.href, session.controller.signal);
      const digest = await window.crypto.subtle.digest('SHA-256', bytes);
      const hash = [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('');
      if (hash !== name.split('/')[1]) throw Error('Presentation PDF identity changed');
      if (slideSession !== session || !control.isConnected) return;
      // A verified local Blob retains the host's frame-denial policy for site pages.
      session.url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const viewer = document.createElement('iframe');
      viewer.title = section.querySelector('strong')?.textContent || 'Presentation PDF';
      viewer.src = session.url;
      host.replaceChildren(viewer);
      host.hidden = false;
      control.setAttribute('aria-expanded', 'true');
      control.textContent = 'Close slide viewer';
    } catch {
      if (slideSession === session) {
        closeSlides();
        control.textContent = 'Use Open PDF below';
      }
    } finally {
      window.clearTimeout(timeout);
      if (slideSession === session) control.removeAttribute('aria-busy');
    }
  });
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
      [descriptor.url, descriptor.snapshot].filter(Boolean).some((file) => {
        const path = new URL(file, directory).pathname;
        return (
          path === url.pathname ||
          (file === descriptor.url && path.endsWith('.html') && path.slice(0, -5) === url.pathname)
        );
      })
    );
    if (article) return 'article:' + article[0];
    // Only the original validated document may use a principal snapshot URL;
    // other immutable paths do not become new router destinations.
    return (
      routes.find((name) =>
        [name, name + '.html', ...(name === 'index' ? ['./'] : [])].some(
          (file) => new URL(file, directory).pathname === url.pathname
        )
      ) || (url.pathname === entry.pathname ? initialPage : null)
    );
  }
  function addressPage() {
    return routeFor(new URL(window.location.href));
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
  function routeHref(next) {
    if (!routes.includes(next)) return null;
    return address(
      new URL(embedded?.files[next] || (next === 'index' ? './' : next + '.html'), directory),
      next
    ).href;
  }
  // The scroll/flight itinerary follows the header; utility links stay accessible.
  const primaryRoutes = Object.freeze(
    [...document.querySelectorAll('.site-header nav a[href]')]
      .map((link) => routeFor(new URL(link.href, entry)))
      .filter((route, index, list) => route && list.indexOf(route) === index)
  );
  function save(fallbackFocus = null, retainDeparture = false) {
    const unavailable = departureUnavailable();
    if (
      (unavailable && !retainDeparture) ||
      content.querySelector('main')?.getAttribute('data-route-blocks') === 'arriving' ||
      routeFor(new URL(window.location.href)) !== page
    )
      return;
    try {
      const snapshot = readingSnapshot(fallbackFocus);
      const prior = history.state?.site;
      // A persistent header control can receive focus during the wave. Retain
      // that focus without sampling the outgoing layout after it has moved.
      if (
        unavailable &&
        (prior?.page !== page || !snapshot.focus || prior.focus === snapshot.focus)
      )
        return;
      history.replaceState(
        {
          ...history.state,
          site: unavailable ? { ...prior, focus: snapshot.focus } : snapshot,
        },
        '',
        window.location.href
      );
      readingAddress = window.location.href;
      readingEntries.delete(historyIndex);
    } catch {
      /* Native navigation still works. */
    }
  }
  function readingSnapshot(fallbackFocus = null) {
    const reader = window.SiteReader?.snapshot?.();
    return {
      page,
      index: historyIndex,
      scroll: [window.scrollX, window.scrollY],
      ...(reader ? { reader } : {}),
      focus:
        document.activeElement?.id ||
        document.activeElement?.getAttribute?.('href') ||
        fallbackFocus ||
        null,
    };
  }
  function rememberReadingDeparture(event) {
    // popstate has already selected the incoming entry. Capture the still-mounted
    // document without writing its position into that incoming history.state.
    if (
      request ||
      departureUnavailable() ||
      !Number.isSafeInteger(event.state?.site?.index) ||
      event.state.site.index === historyIndex ||
      !routeFor(new URL(window.location.href))
    )
      return;
    readingEntries.delete(historyIndex);
    readingEntries.set(historyIndex, { url: readingAddress, site: readingSnapshot() });
    // Recent uncommitted entries supplement serialized browser history. Older
    // entries retain their ordinary persisted-state fallback.
    if (readingEntries.size > 128) readingEntries.delete(readingEntries.keys().next().value);
  }
  function readingState(state = history.state?.site) {
    const recent = readingEntries.get(state?.index);
    return recent && recent.site.page === state?.page && recent.url === window.location.href
      ? recent.site
      : state;
  }
  function departureUnavailable() {
    const stage = content.querySelector('main')?.getAttribute('data-route-blocks');
    return content.inert || stage === 'departing' || stage === 'holding';
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
  function saveDeparture(destination, pop, initial, fallbackFocus, retainDeparture = false) {
    if (!pop && !initial && destination.href !== window.location.href)
      save(fallbackFocus, retainDeparture);
  }
  function push(url) {
    save();
    pruneForwardReading();
    history.pushState(
      {
        site: {
          page,
          index: ++historyIndex,
          scroll: [window.scrollX, window.scrollY],
        },
      },
      '',
      url
    );
    readingAddress = window.location.href;
  }
  function pruneForwardReading() {
    for (const index of readingEntries.keys())
      if (index > historyIndex) readingEntries.delete(index);
  }
  function revisionValid(revision) {
    if (
      revision?.schema !== 1 ||
      revision.contract !== 1 ||
      revision.navigation?.contract !== 1 ||
      revision.navigation?.articleRenderer !== 1 ||
      Object.keys(revision.navigation).length !== 2 ||
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
    if (Object.keys(articleRows).length > 50) return false;
    const aliases = new Set();
    for (const [key, data] of Object.entries(articleRows)) {
      if (
        !/^[a-z][a-z0-9-]{0,79}:(?:en|uk)$/.test(key) ||
        !data ||
        data.scene !== 'writing' ||
        !/^articles\/[a-z][a-z0-9-]{0,79}\.html$/.test(data.alias) ||
        aliases.has(data.alias) ||
        data.articleId !== key.split(':')[0] ||
        !/^[a-z][a-z0-9-]{0,79}$/.test(data.contentEdition) ||
        !/^[a-f0-9]{64}$/.test(data.sourceSha256) ||
        !/^[a-f0-9]{64}$/.test(data.semanticSha256) ||
        !/^[a-f0-9]{64}$/.test(data.version) ||
        !/^[a-f0-9]{64}$/.test(data.sha256) ||
        data.url !== `article-snapshots/${data.version}/${data.alias.split('/').pop()}` ||
        !Array.isArray(data.assets) ||
        data.assets.length > 50 ||
        new Set(data.assets).size !== data.assets.length ||
        data.assets.some(
          (name) => !/^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*$/.test(name)
        ) ||
        (data.candidate === true && revision.preview !== true)
      )
        return false;
      aliases.add(data.alias);
    }
    if (embedded) {
      if (Object.keys(articleRows).length !== Object.keys(articles).length) return false;
      for (const [key, data] of Object.entries(articleRows))
        if (articles[key]?.url !== data.alias || articles[key]?.snapshot !== data.url) return false;
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
    if (signal?.aborted) throw Error('Revision request cancelled');
    // A completed first gesture owns one immutable registry for this session.
    // A concurrent cancelled request cannot replace a newer pinned revision.
    if (pinned) return;
    if (!revisionValid(revision)) throw Error('Site snapshot changed');
    if (!embedded)
      for (const [key, data] of Object.entries(revision.articles || {}))
        articles[key] = { url: data.alias, snapshot: data.url };
    pinned = revision;
  }
  function articleTarget(url) {
    return (
      !embedded &&
      url.origin === entry.origin &&
      url.pathname.startsWith(directory.pathname) &&
      /^articles\/[a-z][a-z0-9-]{0,79}(?:\.html)?$/.test(
        url.pathname.slice(directory.pathname.length)
      )
    );
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
          const mime = name.endsWith('.pdf')
            ? 'application/pdf'
            : name.endsWith('.webp')
              ? 'image/webp'
              : /\.jpe?g$/.test(name)
                ? 'image/jpeg'
                : 'image/png';
          const prefix = 'data:' + mime + ';base64,';
          if (
            !/^article-media\/[a-f0-9]{64}\/[a-z0-9][a-z0-9._-]*\.(?:png|webp|jpe?g|pdf)$/.test(
              name
            ) ||
            asset.mime !== mime ||
            asset.sha256 !== name.split('/')[1] ||
            !Number.isSafeInteger(asset.bytes) ||
            asset.bytes < 1 ||
            asset.bytes > 2000000 ||
            typeof value !== 'string' ||
            !value.startsWith(prefix) ||
            !/^[A-Za-z0-9+/]*={0,2}$/.test(value.slice(prefix.length)) ||
            value.length > 4 * Math.ceil(asset.bytes / 3) + prefix.length
          )
            throw Error('Invalid embedded article resource');
          const raw = window.atob(value.slice(prefix.length));
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
    for (const image of result.main.querySelectorAll(
      'img[src],.reader-image-open[href],.article-presentation a[href],#article-materials a[href]'
    )) {
      const attribute = image.tagName === 'IMG' ? 'src' : 'href';
      const name = image.getAttribute(attribute);
      if (!name.startsWith('article-media/')) continue;
      if (!descriptor.assets.includes(name) || !embeddedAssetURLs.has(name))
        throw Error('Unknown embedded article image');
      image.setAttribute(attribute, embeddedAssetURLs.get(name));
      image.setAttribute('data-offline-resource', name);
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
    closeSlides();
    scrollEntry?.cancelRoute?.();
    scrollEntry?.suspend();
    const travelling = transition !== null;
    releaseEndpoint('interrupt');
    releaseTail();
    window.SiteScene?.stopDocumentPulse?.();
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
  function flight(next, animate, commit, own, departure, landing = null, documentTravel = null) {
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
            if (progress < 1) queueMount();
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
        window.SiteScene.navigate(next, animate, transition, landing, {
          navigationId: own,
          ...documentTravel,
        });
      else transition(1);
    });
  }
  function mount(
    data,
    url,
    position,
    blockDirection = null,
    navigationId = serial,
    deferArrival = false
  ) {
    // History captured the old reading position before this layout-affecting
    // write. Clearing the plane before history's scroll read would flush the
    // old page, then immediately flush the newly mounted archive again.
    presentation?.prepareMount?.();
    // Clear the presentation transform before DOM writes and landing. The
    // nested scene measurement then reuses that same native layout snapshot.
    const run = () => mountNative(data, url, position, blockDirection, navigationId, deferArrival);
    return effects?.measure ? effects.measure(run) : run();
  }
  function mountNative(data, url, position, blockDirection, navigationId, deferArrival) {
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
    window.SiteReader?.destroy();
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
    window.SiteReader?.mount({ state: readingState()?.reader });
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
    window.SiteScene?.refresh({ sync: true, preserveDocumentPaint: deferArrival });
    span('mount-layout');
    window.dispatchEvent(new CustomEvent('site:page-ready', { detail: { page } }));
    scrollEntry?.mount(data.main, { footer: data.footer });
    if (blockDirection) scrollEntry?.prepareArrival?.(blockDirection, navigationId, deferArrival);
    span('mount-ready');
  }
  function prepare(data) {
    const start = window.SiteEngineProbe ? performance.now() : 0;
    const clone = (node) => cacheDocument.importNode(node, true);
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
  function documentDirection(next, nextScene, currentScene, pop, targetIndex) {
    if (nextScene !== currentScene)
      return routes.indexOf(nextScene) > routes.indexOf(currentScene) ? 1 : -1;
    if (pop && targetIndex !== null && targetIndex !== historyIndex)
      return Math.sign(targetIndex - historyIndex);
    return next === 'writing' ? -1 : 1;
  }
  function restoreReadingFocus(pop) {
    const savedFocus = pop ? readingState()?.focus : null;
    const focused = savedFocus
      ? document.getElementById(savedFocus) ||
        [...content.querySelectorAll('a[href]')].find(
          (link) => link.getAttribute('href') === savedFocus || link.href === savedFocus
        )
      : null;
    (focused || content.querySelector('main')).focus({
      preventScroll: true,
    });
  }
  function blocksHeld() {
    return content.querySelector('main')?.getAttribute('data-route-blocks') === 'holding';
  }
  function contentFlightAllowed() {
    return presentation?.contentFlight?.() ?? true;
  }
  function navigationJourney(next, pop, initial) {
    const nextScene = routes.includes(next) ? next : 'writing';
    const currentScene = routes.includes(page) ? page : 'writing';
    const targetIndex =
      pop && Number.isSafeInteger(history.state?.site?.index) ? history.state.site.index : null;
    const direction = documentDirection(next, nextScene, currentScene, pop, targetIndex);
    const fromDocument = page;
    // Hierarchy controls the block wave independently of camera/history travel.
    const departureDirection = fromDocument.startsWith('article:') ? 1 : direction;
    const sameSceneDocument =
      !initial && next !== fromDocument && nextScene === 'writing' && currentScene === 'writing';
    return {
      nextScene,
      targetIndex,
      direction,
      fromDocument,
      departureDirection,
      sameSceneDocument,
    };
  }
  function overlapDocumentRead(url, next, pop, interruptedFocus, depart, sameSceneDocument) {
    if (!sameSceneDocument || !scrollEntry || !motionAllowed() || !contentFlightAllowed())
      return null;
    // Save while outgoing controls are visible. The first article can still be an alias.
    saveDeparture(next ? address(url, next) : url, pop, false, interruptedFocus);
    return depart();
  }
  function canArriveWithBlocks(blocks, sameSceneDocument) {
    return (
      blocks && (!sameSceneDocument || blocksHeld()) && motionAllowed() && contentFlightAllowed()
    );
  }
  async function navigate(
    url,
    { pop = false, position = null, initial = false, input = null } = {}
  ) {
    let next = routeFor(url);
    if (!navigableDestination(url, next)) return;
    const {
      nextScene,
      targetIndex,
      direction,
      fromDocument,
      departureDirection,
      sameSceneDocument,
    } = navigationJourney(next, pop, initial);
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
    const stopPulse = () => {
      if (sameSceneDocument && own === serial) window.SiteScene?.stopDocumentPulse?.();
    };
    const depart = () => {
      const wave = scrollEntry?.depart?.(departureDirection, own, sameSceneDocument);
      if (!sameSceneDocument || !wave) return wave;
      return wave.then(async (result) => {
        if (result?.completedBy === 'empty') return null;
        if (result?.completedBy === 'watchdog') {
          if (own === serial) scrollEntry.cancelRoute();
          return null;
        }
        if (
          result?.completed &&
          blocksHeld() &&
          request === controller &&
          own === serial &&
          !controller.signal.aborted &&
          motionAllowed() &&
          contentFlightAllowed()
        ) {
          const painted = await window.SiteScene?.playDocumentPulse?.(own);
          if (painted !== true) return null;
        }
        return result;
      });
    };
    const abortDocument = () => {
      if (own !== serial) return;
      stopPulse();
      scrollEntry?.cancelRoute?.('aborted');
    };
    if (sameSceneDocument)
      controller.signal.addEventListener('abort', abortDocument, { once: true });
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    content.setAttribute('aria-busy', 'true');
    try {
      // Stop an inherited smooth focus/anchor scroll before reading the departure pose.
      restoreScroll(interruptedPosition[0], interruptedPosition[1]);
      let departure = overlapDocumentRead(
        url,
        next,
        pop,
        interruptedFocus,
        depart,
        sameSceneDocument
      );
      next = await admittedDestination(url, next, controller.signal);
      const arrivalDirection = next.startsWith('article:') ? 1 : direction;
      const data = await read(next, controller.signal);
      if (own !== serial) return;
      if (controller.signal.aborted) throw Error('Navigation request cancelled');
      // The request deadline belongs to the read. The block waves have their
      // own bounded completion and must survive an already admitted response.
      window.clearTimeout(timeout);
      const prepared = prepare(data);
      const destination = address(url, next);
      let animate = !initial && next !== page && motionAllowed();
      const overlappedDeparture = Boolean(departure);
      if (!departure) {
        saveDeparture(destination, pop, initial, interruptedFocus);
        if (animate && contentFlightAllowed()) departure = depart();
      }
      // Reading overlaps departure and the single showcase on the uncovered scene.
      const departed = departure && (await departure)?.completed === true;
      let blocks = false;
      animate = animate && motionAllowed();
      if (own !== serial) return;
      if (overlappedDeparture) saveDeparture(destination, pop, initial, interruptedFocus, true);
      await flight(
        nextScene,
        animate && !sameSceneDocument,
        () => {
          const start = window.SiteEngineStages ? performance.now() : 0;
          if (!pop && !initial && destination.href !== window.location.href) {
            pruneForwardReading();
            history.pushState(
              { site: { page: next, index: ++historyIndex, scroll: [0, 0] } },
              '',
              destination
            );
          } else if (initial)
            history.replaceState(
              { site: { page: next, index: historyIndex, scroll: [0, 0] } },
              '',
              destination
            );
          else if (pop && targetIndex !== null) historyIndex = targetIndex;
          readingAddress = window.location.href;
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
          blocks = departed && (!sameSceneDocument || blocksHeld());
          mount(
            prepared,
            new URL(window.location.href),
            position,
            blocks ? arrivalDirection : null,
            own,
            sameSceneDocument
          );
        },
        own,
        null,
        { position, hash: url.hash, search: url.search },
        {
          documentChange: next !== fromDocument,
          sameSceneDocument,
          fromDocument,
          toDocument: next,
          direction,
        }
      );
      if (own !== serial) return;
      if (canArriveWithBlocks(blocks, sameSceneDocument))
        await scrollEntry?.arrive?.(arrivalDirection, own);
      else scrollEntry?.cancelRoute?.();
      if (own === serial) {
        arriveEndpoint();
        restoreReadingFocus(pop);
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
        stopPulse();
        releaseEndpoint('failed');
        scrollEntry?.cancelRoute?.();
        scrollEntry?.settle();
        releaseTail();
        window.location.assign(nativeDestination(url, next));
      }
    } finally {
      window.clearTimeout(timeout);
      controller.signal.removeEventListener('abort', abortDocument);
      if (own === serial) {
        content.removeAttribute('aria-busy');
        request = null;
        scrollEntry?.cancelRoute?.();
        clearText();
      }
    }
  }
  function navigableDestination(url, next) {
    return next || articleTarget(url);
  }
  async function admittedDestination(url, next, signal) {
    if (next) return next;
    await pin(signal);
    const admitted = routeFor(url);
    if (!admitted) throw Error('Article is absent from the pinned revision');
    return admitted;
  }
  function nativeDestination(url, next) {
    return next ? address(url, next).href : url.href;
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
    if (!navigableDestination(url, next)) return;
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
  // Capture before archive/filter listeners mutate the outgoing document, while
  // the ordinary restoration listener keeps its existing ordering afterward.
  window.addEventListener('popstate', rememberReadingDeparture, true);
  window.addEventListener('popstate', (event) => {
    const url = new URL(window.location.href),
      next = routeFor(url),
      state = readingState(event.state?.site);
    if (next && (next !== page || request))
      return navigate(url, { pop: true, position: state?.scroll || null });
    else {
      if (Number.isSafeInteger(event.state?.site?.index)) historyIndex = event.state.site.index;
      ++serial;
      if (interrupt()) window.SiteScene?.navigate(page, motionAllowed());
      window.SiteReader?.restore(state?.reader);
      if (state?.scroll) restoreScroll(state.scroll[0], state.scroll[1]);
      if (next && state?.page === next) restoreReadingFocus(true);
      readingAddress = window.location.href;
      scrollEntry?.resume();
    }
  });
  window.addEventListener('site:reader-state', () => save());
  function finishText() {
    scrollEntry?.cancelRoute?.();
    window.SiteScene?.stopDocumentPulse?.();
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
    closeSlides();
    save();
    window.SiteScene?.stopDocumentPulse?.();
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
    href: routeHref,
    addressPage,
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
      navigate(new URL(routeHref(next)), { position: atEnd ? 'end' : null, input });
      return true;
    },
  };
  // Measure the admitted reader after its persistent content frame is mounted.
  mountInitialReader();
  const first = embedded ? routeFor(new URL(window.location.href)) : page;
  if (first !== page) navigate(new URL(window.location.href), { initial: true });
  else save();
})();
