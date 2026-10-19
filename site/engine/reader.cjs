'use strict';
// Optional article-only enhancement. Native HTML remains complete without it.
module.exports = function readerMode() {
  let dispose = () => {};
  let snapshot = () => null;
  let restore = () => {};
  function destroy() {
    dispose();
    dispose = () => {};
    snapshot = () => null;
    restore = () => {};
  }
  function mount({ state = null } = {}) {
    destroy();
    const main = document.querySelector('main.article-reader');
    if (!main) return;
    const listeners = [],
      printState = new Map();
    const details = [...main.querySelectorAll('details')];
    const listen = (target, event, handler) => {
      target.addEventListener(event, handler);
      listeners.push(() => target.removeEventListener(event, handler));
    };
    const fragmentId = (hash) => {
      try {
        return decodeURIComponent(hash.slice(1));
      } catch {
        return '';
      }
    };
    const links = [...main.querySelectorAll('.article-toc a')];
    const headings = links
      .map((link) => document.getElementById(fragmentId(link.hash)))
      .filter(Boolean);
    const contents = main.querySelector('.reader-contents');
    const wide = window.matchMedia('(min-width: 1100px)');
    if (contents) contents.open = wide.matches;
    listen(wide, 'change', () => {
      if (contents) contents.open = wide.matches;
    });
    const reveal = (hash) => {
      let target;
      try {
        target = document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch {
        return;
      }
      if (!target || !main.contains(target)) return;
      for (let node = target.parentElement; node && node !== main; node = node.parentElement)
        if (node.tagName === 'DETAILS') node.open = true;
    };
    for (const appendix of main.querySelectorAll('.reader-appendix')) appendix.open = false;
    restore = (saved) => {
      if (
        Array.isArray(saved) &&
        saved.length === details.length &&
        saved.length <= 256 &&
        saved.every((open) => typeof open === 'boolean')
      )
        details.forEach((detail, index) => {
          detail.open = saved[index];
        });
      reveal(window.location.hash);
    };
    snapshot = () => details.map((detail) => printState.get(detail) ?? detail.open);
    restore(state);
    listen(window, 'hashchange', () => reveal(window.location.hash));
    listen(main, 'click', (event) => {
      const anchor = event.target.closest('a[href]');
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search
      )
        return;
      reveal(url.hash);
      if (anchor.closest('.article-toc') && contents && !wide.matches) contents.open = false;
    });
    const current = (id) => {
      for (const link of links) {
        if (fragmentId(link.hash) === id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };
    const visible = new Set();
    const observer = window.IntersectionObserver
      ? new window.IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) visible.add(entry.target);
              else visible.delete(entry.target);
            }
            const active = headings.find((heading) => visible.has(heading));
            if (active) current(active.id);
          },
          { rootMargin: '-110px 0px -60% 0px', threshold: 0 }
        )
      : null;
    for (const heading of headings) observer?.observe(heading);
    listen(window, 'beforeprint', () => {
      for (const detail of main.querySelectorAll('details')) {
        printState.set(detail, detail.open);
        detail.open = true;
      }
    });
    const restorePrint = () => {
      for (const [detail, open] of printState) detail.open = open;
      printState.clear();
    };
    listen(window, 'afterprint', restorePrint);
    for (const detail of details)
      listen(detail, 'toggle', () => {
        if (!printState.size) window.dispatchEvent(new window.Event('site:reader-state'));
      });
    dispose = () => {
      observer?.disconnect();
      for (const remove of listeners) remove();
      restorePrint();
    };
  }
  return { mount, destroy, snapshot: () => snapshot(), restore: (state) => restore(state) };
};
