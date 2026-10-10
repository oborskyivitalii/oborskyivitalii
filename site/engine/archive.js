/* Progressive filtering: the complete, dated catalog remains HTML without JS. */
(() => {
  'use strict';
  let detach = () => {},
    print = () => {};
  function archiveState(root) {
    if (typeof root?.querySelector !== 'function') return null;
    const form = root.querySelector('#archive-filters');
    if (!form) return null;
    const ids = new Map([...root.querySelectorAll('[id]')].map((node) => [node.id, node]));
    const find = (id) => ids.get(id);
    const controls = Object.fromEntries(
      ['topic', 'year', 'language'].map((key) => [key, find(`archive-${key}`)])
    );
    const countLabel = find('archive-count');
    const heading = find('archive-heading');
    const empty = find('archive-empty');
    if (Object.values(controls).some((control) => !control) || !countLabel || !heading || !empty)
      return null;
    const values = (control) =>
      [...control.options].map((option) => option.value).filter((value) => value !== 'all');
    return {
      find,
      form,
      controls,
      countLabel,
      heading,
      empty,
      rows: [...root.querySelectorAll('li.publication')],
      groups: [...root.querySelectorAll('.archive-group')],
      years: [...root.querySelectorAll('.archive-year')],
      navigation: [...root.querySelectorAll('[data-archive-navigation]')],
      topics: values(controls.topic),
      yearValues: values(controls.year),
    };
  }
  function restoreURL(state, location) {
    const params = new URLSearchParams(location.search);
    for (const [key, control] of Object.entries(state.controls)) {
      const value = params.get(key);
      control.value = [...control.options].some((option) => option.value === value) ? value : 'all';
    }
    const topic = location.hash.match(/^#topic-([a-z][a-z0-9-]*?)(?:-(\d{4}))?$/);
    const year = location.hash.match(/^#year-(\d{4})$/);
    if (topic && state.topics.includes(topic[1])) {
      state.controls.topic.value = topic[1];
      if (state.yearValues.includes(topic[2])) state.controls.year.value = topic[2];
    } else if (year && state.yearValues.includes(year[1])) state.controls.year.value = year[1];
  }
  function countText(state, name, count) {
    return state.countLabel.dataset[name]
      .replaceAll('{count}', String(count))
      .replaceAll('{total}', String(state.rows.length));
  }
  function label(control) {
    const option = [...control.options].find((option) => option.value === control.value);
    return option.textContent;
  }
  function refreshArchive(state) {
    const { controls, rows, groups, years, topics, yearValues, find } = state;
    const active = Object.entries(controls)
      .filter(([, control]) => control.value !== 'all')
      .map(([key, control]) => [key, control.value]);
    const visibleYears = new Set();
    let count = 0;
    for (const row of rows) {
      const hidden = active.some(([key, value]) => row.dataset[key] !== value);
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
    for (const topic of topics) find(`topic-${topic}`).hidden = controls.topic.value !== topic;
    for (const year of yearValues)
      find(`year-${year}`).hidden = controls.year.value !== year && !visibleYears.has(year);
    state.heading.hidden = false;
    state.heading.textContent = `${label(controls.topic)} · ${label(controls.year)} · ${label(controls.language)}`;
    state.countLabel.textContent = countText(state, 'count', count);
    state.empty.hidden = count !== 0;
  }
  function activateArchive(state) {
    state.form.hidden = false;
    for (const nav of state.navigation) nav.hidden = true;
  }
  // Only the supplied root changes. Capture preparation must not mount an
  // interactive archive, emit focus events, scroll or alter the live URL.
  function preparePreview(root, landingURL) {
    const state = archiveState(root);
    if (!state) return false;
    let location;
    try {
      location =
        typeof landingURL === 'string'
          ? new URL(landingURL, 'https://archive-preview.invalid/')
          : landingURL;
      if (typeof location?.search !== 'string' || typeof location.hash !== 'string') return false;
    } catch {
      return false;
    }
    restoreURL(state, location);
    activateArchive(state);
    refreshArchive(state);
    return true;
  }
  function mount() {
    detach();
    print = () => {};
    const listeners = [];
    const on = (target, name, handler) => {
      target.addEventListener(name, handler);
      listeners.push(() => target.removeEventListener(name, handler));
    };
    detach = () => {
      for (const remove of listeners) remove();
    };
    const state = archiveState(document);
    if (!state) return;
    const { form, controls, rows, groups, years, yearValues, countLabel, heading, find } = state;
    let lastTopic = null;
    function emit(name, detail) {
      window.dispatchEvent(new CustomEvent(name, { detail }));
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
      refreshArchive(state);
      emit('site:archive-layout', {});
      if (lastTopic !== controls.topic.value || reason === 'initial' || reason === 'reset') {
        emit('site:scene-focus', { focus: controls.topic.value, reason });
        lastTopic = controls.topic.value;
      }
    }
    function landOnVisibleTarget() {
      const hash = window.location.hash;
      if (!/^#(?:topic-|year-)/.test(hash)) return;
      const target = find(hash.slice(1));
      if (!target) return;
      const destination = target.getClientRects().length ? target : heading;
      destination.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    function onNavigation(reason) {
      restoreURL(state, window.location);
      refresh(reason);
      landOnVisibleTarget();
    }
    activateArchive(state);
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
    print = () => {
      for (const element of [...rows, ...groups, ...years]) element.hidden = false;
      for (const year of yearValues) find(`year-${year}`).hidden = false;
      countLabel.textContent = countText(state, 'print', rows.length);
      state.empty.hidden = true;
    };
    on(window, 'beforeprint', print);
    on(window, 'afterprint', () => refresh('print-return'));
    onNavigation('initial');
  }
  window.SiteArchive = { mount, preparePreview, destroy: () => detach(), print: () => print() };
  mount();
})();
