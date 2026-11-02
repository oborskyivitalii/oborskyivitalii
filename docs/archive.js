/* Optional current publication metadata. */
window.SiteArticleTags=(function articleTags() {
  const limit = 200000;
  const id = /^[a-z][a-z0-9-]{0,79}$/;
  const key = /^[a-z][a-z0-9-]{0,79}:(en|uk)$/;
  let cached = null,
    cachedKey = '';
  function exact(value, keys) {
    return (
      value &&
      !Array.isArray(value) &&
      typeof value === 'object' &&
      Object.keys(value).sort().join(',') === keys.slice().sort().join(',')
    );
  }
  function text(value, maximum) {
    return (
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value.length <= maximum &&
      [...value].every((character) => character.charCodeAt(0) >= 32)
    );
  }
  function tags(values, vocabulary) {
    if (
      !Array.isArray(values) ||
      values.length < 1 ||
      values.length > 6 ||
      new Set(values).size !== values.length ||
      values.some((value) => !Object.hasOwn(vocabulary, value))
    )
      throw Error('Invalid publication tags');
    return values;
  }
  function validate(data) {
    if (
      !exact(data, ['schema', 'labels', 'vocabulary', 'articles', 'readers']) ||
      data.schema !== 1 ||
      !exact(data.labels, ['tags', 'related', 'all', 'filter']) ||
      Object.values(data.labels).some((value) => !text(value, 100))
    )
      throw Error('Unknown article-index schema or labels');
    const vocabulary = data.vocabulary;
    if (
      !vocabulary ||
      Array.isArray(vocabulary) ||
      typeof vocabulary !== 'object' ||
      Object.keys(vocabulary).length < 1 ||
      Object.keys(vocabulary).length > 64 ||
      Object.entries(vocabulary).some(([name, label]) => !id.test(name) || !text(label, 100))
    )
      throw Error('Invalid tag vocabulary');
    if (!Array.isArray(data.articles) || data.articles.length > 250)
      throw Error('Unbounded article index');
    const ids = new Set(),
      urls = new Set();
    for (const article of data.articles) {
      if (
        !exact(article, ['id', 'title', 'url', 'language', 'tags']) ||
        !id.test(article.id) ||
        !text(article.title, 500) ||
        !['en', 'uk'].includes(article.language) ||
        !text(article.url, 2000)
      )
        throw Error('Invalid indexed article');
      if (!/^articles\/[a-z][a-z0-9-]{0,79}\.html$/.test(article.url)) {
        const url = new URL(article.url);
        if (url.protocol !== 'https:' || url.username || url.password)
          throw Error('Unsafe indexed article URL');
      }
      const identity = new URL(article.url, 'https://publication-index.invalid/');
      identity.hash = '';
      if (ids.has(article.id) || urls.has(identity.href))
        throw Error('Duplicate indexed publication');
      ids.add(article.id);
      urls.add(identity.href);
      tags(article.tags, vocabulary);
    }
    if (
      !data.readers ||
      Array.isArray(data.readers) ||
      typeof data.readers !== 'object' ||
      Object.keys(data.readers).length > 50
    )
      throw Error('Unbounded article tag readers');
    for (const [name, reader] of Object.entries(data.readers)) {
      if (
        !key.test(name) ||
        !exact(reader, ['tags', 'publication']) ||
        (reader.publication !== null && !ids.has(reader.publication))
      )
        throw Error('Invalid article tag reader');
      tags(reader.tags, vocabulary);
    }
    return data;
  }
  function related(data, reader) {
    tags(reader.tags, data.vocabulary);
    return data.articles
      .filter((article) => article.id !== reader.publication)
      .map((article) => {
        const overlap = article.tags.filter((tag) => reader.tags.includes(tag)).length;
        return {
          article,
          overlap,
          score: overlap / (reader.tags.length + article.tags.length - overlap),
        };
      })
      .filter((row) => row.overlap > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.overlap - a.overlap ||
          (a.article.id < b.article.id ? -1 : a.article.id > b.article.id ? 1 : 0)
      )
      .slice(0, 3)
      .map((row) => row.article);
  }
  async function read(response, signal) {
    if (
      !response.ok ||
      !/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') || '') ||
      Number(response.headers.get('content-length') || 0) > limit ||
      !response.body?.getReader
    )
      throw Error('Invalid article-index response');
    const stream = response.body.getReader(),
      chunks = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await stream.read();
        if (signal.aborted) throw Error('Cancelled article-index request');
        if (done) break;
        length += value.byteLength;
        if (length > limit) throw Error('Article-index byte budget');
        chunks.push(value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return validate(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
    } finally {
      await stream.cancel().catch(() => {});
    }
  }
  function mount({ document, window, root, fetch: load = window.fetch.bind(window) }) {
    if (!['https:', 'http:'].includes(root.protocol)) return () => {};
    if (root.origin !== window.location.origin) return () => {};
    const cards = [...document.querySelectorAll('li.publication')];
    const article = document.querySelector('main.article-reader > article');
    if (!cards.length && !article) return () => {};
    const controller = new AbortController(),
      created = [],
      listeners = [];
    document.body.dataset.tagsState = 'loading';
    let stopped = false;
    const timer = window.setTimeout(() => controller.abort(), 8000);
    const make = (name, label) => {
      const node = document.createElement(name);
      if (label) node.textContent = label;
      return node;
    };
    const add = (parent, child) => {
      parent.append(child);
      created.push(child);
      return child;
    };
    const link = (title, url) => {
      const node = make('a', title);
      node.href = new URL(url, root).href;
      return node;
    };
    function tagList(values, data) {
      const list = make('ul');
      list.className = 'publication-tags';
      list.setAttribute('aria-label', data.labels.tags);
      for (const tag of values) {
        const item = make('li');
        item.append(link(data.vocabulary[tag], 'writing.html?tag=' + tag));
        list.append(item);
      }
      const click = (event) => {
        const anchor = event.target.closest('a');
        const select = document.getElementById('archive-tag');
        if (
          !anchor ||
          !select ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        select.value = new URL(anchor.href).searchParams.get('tag');
        select.dispatchEvent(new window.Event('change', { bubbles: true }));
      };
      list.addEventListener('click', click);
      listeners.push(() => list.removeEventListener('click', click));
      return list;
    }
    const clear = () => {
      for (const remove of listeners.splice(0)) remove();
      for (const node of created.splice(0)) node.remove();
      for (const card of cards) delete card.dataset.tags;
    };
    function appendRecommendations(data, reader) {
      const recommendations = related(data, reader);
      if (recommendations.length) {
        const slot = article.querySelector('.reader-related-slot') || article;
        const section = make('section');
        section.className = 'article-related';
        section.setAttribute('aria-label', data.labels.related);
        if (!slot.closest('.reader-endnote')) section.append(make('h2', data.labels.related));
        const list = make('ul');
        for (const entry of recommendations) {
          const item = make('li');
          const anchor = link(entry.title, entry.url);
          anchor.lang = entry.language;
          item.append(anchor);
          const language = make(
            'span',
            typeof Intl.DisplayNames === 'function'
              ? new Intl.DisplayNames(['en'], { type: 'language' }).of(entry.language)
              : entry.language.toUpperCase()
          );
          language.className = 'reader-language';
          language.lang = 'en';
          item.append(language);
          list.append(item);
        }
        section.append(list);
        add(slot, section);
      }
    }
    const render = (data, preservePosition = false) => {
      const position = preservePosition ? { left: window.scrollX, top: window.scrollY } : null;
      clear();
      const indexed = new Map(data.articles.map((entry) => [new URL(entry.url, root).href, entry]));
      for (const card of cards) {
        const anchor = card.querySelector('a.publication-title');
        const entry = anchor && indexed.get(anchor.href);
        if (!entry) continue;
        card.dataset.tags = entry.tags.join(' ');
        add(anchor.parentElement, tagList(entry.tags, data));
      }
      const form = document.getElementById('archive-filters');
      if (form) {
        const label = make('label', data.labels.filter),
          select = make('select');
        select.id = 'archive-tag';
        const all = make('option', data.labels.all);
        all.value = 'all';
        select.append(all);
        for (const [tag, title] of Object.entries(data.vocabulary)) {
          if (!data.articles.some((entry) => entry.tags.includes(tag))) continue;
          const option = make('option', title);
          option.value = tag;
          select.append(option);
        }
        label.append(select);
        add(form, label);
        const reset = form.querySelector('button[type="reset"]');
        if (reset) form.insertBefore(label, reset);
      }
      const current = document.body.dataset.article;
      const reader = Object.hasOwn(data.readers, current) ? data.readers[current] : null;
      if (article && reader) {
        const tagSlot = article.querySelector('.reader-tags-slot');
        if (tagSlot) add(tagSlot, tagList(reader.tags, data));
        appendRecommendations(data, reader);
      }
      window.dispatchEvent(new window.CustomEvent('site:tags-ready'));
      if (!form) window.dispatchEvent(new window.CustomEvent('site:archive-layout'));
      if (position) window.scrollTo({ ...position, behavior: 'instant' });
    };
    // Reuse only this tab's last validated snapshot before the router restores
    // history geometry. Every mount still reads current metadata from the server.
    const initialKey = cachedKey;
    if (cached) render(cached);
    load(new URL('publication-index.json', root).href, {
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
    })
      .then((response) => read(response, controller.signal))
      .then((data) => {
        if (stopped || controller.signal.aborted) return;
        const currentKey = JSON.stringify(data);
        if (currentKey !== initialKey) render(data, Boolean(initialKey));
        cached = data;
        cachedKey = currentKey;
        document.body.dataset.tagsState = 'ready';
      })
      .catch(() => {
        if (!stopped) document.body.dataset.tagsState = 'unavailable';
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      stopped = true;
      controller.abort();
      window.clearTimeout(timer);
      clear();
      delete document.body.dataset.tagsState;
    };
  }
  return { validate, tags, related, read, mount, limit };
})();
/* Progressive filtering: the complete, dated catalog remains HTML without JS. */
(() => {
  'use strict';
  let detach = () => {},
    print = () => {};
  const tagRoot =
    window.SiteArticleTags &&
    new URL(document.querySelector('meta[name="site-base"]')?.content || '.', window.location.href);
  function mount() {
    detach();
    print = () => {};
    const stopTags = window.SiteArticleTags?.mount({ document, window, root: tagRoot });
    detach = () => stopTags?.();
    const listeners = [];
    const on = (target, name, handler) => {
      target.addEventListener(name, handler);
      listeners.push(() => target.removeEventListener(name, handler));
    };
    detach = () => {
      stopTags?.();
      for (const remove of listeners) remove();
    };
    const form = document.getElementById('archive-filters');
    if (!form) return;
    const controls = Object.fromEntries(
      ['topic', 'year', 'language'].map((key) => [key, document.getElementById(`archive-${key}`)])
    );
    const cachedTag = document.getElementById('archive-tag');
    if (cachedTag) controls.tag = cachedTag;
    const results = document.getElementById('archive-results');
    const rows = [...results.querySelectorAll('li.publication')];
    const groups = [...results.querySelectorAll('.archive-group')];
    const years = [...results.querySelectorAll('.archive-year')];
    const topics = [...controls.topic.options]
      .map((option) => option.value)
      .filter((value) => value !== 'all');
    const yearValues = [...controls.year.options]
      .map((option) => option.value)
      .filter((value) => value !== 'all');
    const countLabel = document.getElementById('archive-count');
    const heading = document.getElementById('archive-heading');
    const countText = (name, count) =>
      countLabel.dataset[name]
        .replaceAll('{count}', String(count))
        .replaceAll('{total}', String(rows.length));
    let lastTopic = null;
    function label(control) {
      const option = [...control.options].find((option) => option.value === control.value);
      return option.textContent;
    }
    function emit(name, detail) {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
    function restoreURL() {
      const params = new URLSearchParams(window.location.search);
      for (const [key, control] of Object.entries(controls)) {
        const value = params.get(key);
        control.value = [...control.options].some((option) => option.value === value)
          ? value
          : 'all';
      }
      const topic = window.location.hash.match(/^#topic-([a-z][a-z0-9-]*?)(?:-(\d{4}|undated))?$/);
      const year = window.location.hash.match(/^#year-(\d{4}|undated)$/);
      if (topic && topics.includes(topic[1])) {
        controls.topic.value = topic[1];
        if (yearValues.includes(topic[2])) controls.year.value = topic[2];
      } else if (year && yearValues.includes(year[1])) controls.year.value = year[1];
    }
    function writeURL() {
      const url = new URL(window.location.href);
      for (const [key, control] of Object.entries(controls)) {
        if (control.value === 'all') url.searchParams.delete(key);
        else url.searchParams.set(key, control.value);
      }
      // An old fragment must not override a control change on reload.
      url.hash = '';
      if (url.href !== window.location.href) {
        try {
          if (window.SiteNavigation) window.SiteNavigation.push(url);
          else window.history.pushState(null, '', url);
        } catch {
          /* Downloaded files still filter locally. */
        }
      }
    }
    function refresh(reason = 'layout') {
      const active = Object.entries(controls)
        .filter(([, control]) => control.value !== 'all')
        .map(([key, control]) => [key, control.value]);
      const visibleYears = new Set();
      let count = 0;
      for (const row of rows) {
        const hidden = active.some(([key, value]) =>
          key === 'tag' ? !row.dataset.tags?.split(' ').includes(value) : row.dataset[key] !== value
        );
        if (row.hidden !== hidden) row.hidden = hidden;
        if (!hidden) {
          count++;
          visibleYears.add(row.dataset.year);
        }
      }
      for (const group of groups) {
        const hidden = !group.querySelector('li.publication:not([hidden])');
        if (group.hidden !== hidden) group.hidden = hidden;
      }
      for (const year of years) {
        const hidden = !year.querySelector('.archive-group:not([hidden])');
        if (year.hidden !== hidden) year.hidden = hidden;
      }
      for (const topic of topics)
        document.getElementById(`topic-${topic}`).hidden = controls.topic.value !== topic;
      for (const year of yearValues) {
        document.getElementById(`year-${year}`).hidden =
          controls.year.value !== year && !visibleYears.has(year);
      }
      heading.hidden = false;
      heading.textContent =
        `${label(controls.topic)} · ${label(controls.year)} · ${label(controls.language)}` +
        (controls.tag && controls.tag.value !== 'all' ? ' · ' + label(controls.tag) : '');
      countLabel.textContent = countText(count === rows.length ? 'print' : 'count', count);
      document.getElementById('archive-empty').hidden = count !== 0;
      emit('site:archive-layout', {});
      if (lastTopic !== controls.topic.value || reason === 'initial' || reason === 'reset') {
        emit('site:scene-focus', { focus: controls.topic.value, reason });
        lastTopic = controls.topic.value;
      }
    }
    function landOnVisibleTarget() {
      const hash = window.location.hash;
      if (!/^#(?:topic-|year-)/.test(hash)) return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      const destination = target.getClientRects().length ? target : heading;
      destination.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    function onNavigation(reason) {
      restoreURL();
      refresh(reason);
      landOnVisibleTarget();
    }
    form.hidden = false;
    for (const nav of document.querySelectorAll('[data-archive-navigation]')) nav.hidden = true;
    on(form, 'change', () => {
      writeURL();
      refresh('filter');
    });
    on(form, 'submit', (event) => event.preventDefault());
    on(form, 'reset', (event) => {
      event.preventDefault();
      for (const control of Object.values(controls)) control.value = 'all';
      writeURL();
      refresh('reset');
    });
    on(window, 'hashchange', () => onNavigation('navigation'));
    on(window, 'popstate', () => onNavigation('history'));
    on(window, 'site:tags-ready', () => {
      const tag = document.getElementById('archive-tag');
      if (tag) {
        controls.tag = tag;
        onNavigation('tags');
      } else emit('site:archive-layout', {});
    });
    print = () => {
      for (const element of [...rows, ...groups, ...years]) element.hidden = false;
      for (const year of yearValues) document.getElementById(`year-${year}`).hidden = false;
      countLabel.textContent = countText('print', rows.length);
      document.getElementById('archive-empty').hidden = true;
    };
    on(window, 'beforeprint', print);
    on(window, 'afterprint', () => refresh('print-return'));
    onNavigation('initial');
  }
  window.SiteArchive = { mount, destroy: () => detach(), print: () => print() };
  mount();
})();
