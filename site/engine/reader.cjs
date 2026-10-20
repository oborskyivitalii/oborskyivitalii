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
    const currentLabel = main.querySelector('[data-reader-current]');
    if (contents) {
      contents.open = false;
      contents.setAttribute('data-reader-enhanced', '');
    }
    let activeDialog = null;
    const finishDialog = (record, returnFocus) => {
      if (!record) return;
      if (activeDialog === record) activeDialog = null;
      const trigger = record.trigger;
      record.trigger = null;
      record.reset();
      if (returnFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
    const closeDialog = (returnFocus = true) => {
      const record = activeDialog;
      if (!record) return;
      activeDialog = null;
      if (record.element.open) record.element.close();
      finishDialog(record, returnFocus);
    };
    const dialog = (selector, reset) => {
      const element = main.querySelector(selector);
      if (
        !element ||
        typeof element.showModal !== 'function' ||
        typeof element.close !== 'function'
      )
        return null;
      const close = element.querySelector('[data-reader-close]');
      if (!close) return null;
      const record = { element, close, reset, trigger: null };
      element.hidden = false;
      listen(close, 'click', () => closeDialog());
      listen(element, 'cancel', (event) => {
        event.preventDefault();
        closeDialog();
      });
      listen(element, 'click', (event) => {
        if (event.target === element) closeDialog();
      });
      listen(element, 'close', () => {
        if (!element.open && activeDialog === record) finishDialog(record, true);
      });
      return record;
    };
    const openDialog = (record, trigger) => {
      if (!record) return false;
      closeDialog(false);
      record.trigger = trigger;
      try {
        record.element.showModal();
      } catch {
        finishDialog(record, false);
        return false;
      }
      activeDialog = record;
      record.close.focus({ preventScroll: true });
      return true;
    };
    const imageStage = main.querySelector('[data-reader-image]');
    const imageCaption = main.querySelector('[data-reader-image-caption]');
    const imageOriginal = main.querySelector('[data-reader-image-original]');
    const zoom = main.querySelector('[data-reader-zoom]');
    const imageDialog =
      imageStage && imageCaption && imageOriginal && zoom
        ? dialog('.reader-image-dialog', () => {
            imageStage.replaceChildren();
            imageCaption.textContent = '';
            imageDialog.element.classList.remove('reader-zoomed');
            zoom.setAttribute('aria-pressed', 'false');
          })
        : null;
    if (imageDialog)
      listen(zoom, 'click', () => {
        const enlarged = imageDialog.element.classList.toggle('reader-zoomed');
        zoom.setAttribute('aria-pressed', String(enlarged));
      });
    const noteBody = main.querySelector('[data-reader-note-body]');
    const noteTitle = main.querySelector('[data-reader-note-title]');
    const noteFull = main.querySelector('[data-reader-note-full]');
    const noteDialog =
      noteBody && noteTitle && noteFull
        ? dialog('.reader-note-dialog', () => noteBody.replaceChildren())
        : null;
    const enhancedLinks = [...main.querySelectorAll('.reader-citation, .reader-image-open')].filter(
      (anchor) => (anchor.classList.contains('reader-citation') ? noteDialog : imageDialog)
    );
    for (const anchor of enhancedLinks) anchor.setAttribute('aria-haspopup', 'dialog');
    const showImage = (anchor) => {
      const image = anchor.querySelector('img');
      if (!imageDialog || !image) return false;
      const copy = image.cloneNode(false);
      copy.removeAttribute('id');
      const caption = anchor.closest('figure')?.querySelector('figcaption > p');
      if (!openDialog(imageDialog, anchor)) return false;
      imageStage.replaceChildren(copy);
      imageCaption.textContent = caption?.textContent || image.alt;
      imageOriginal.href = anchor.href;
      return true;
    };
    const showNote = (anchor, url) => {
      const note = document.getElementById(fragmentId(url.hash));
      if (!noteDialog || !note || !main.contains(note) || !note.closest('.reader-appendix'))
        return false;
      const copy = note.cloneNode(true);
      // Cloned source text retains links and caveats, never duplicate anchors or return controls.
      for (const child of copy.querySelectorAll('.reader-note-returns, [role="doc-backlink"]'))
        child.remove();
      for (const child of copy.querySelectorAll('[id], [aria-labelledby], [aria-describedby]')) {
        child.removeAttribute('id');
        child.removeAttribute('aria-labelledby');
        child.removeAttribute('aria-describedby');
      }
      if (!openDialog(noteDialog, anchor)) return false;
      noteTitle.textContent = anchor.getAttribute('aria-label') || 'Reference';
      noteDialog.element.setAttribute('aria-label', noteTitle.textContent);
      noteBody.replaceChildren(...copy.childNodes);
      noteFull.setAttribute('href', url.hash);
      return true;
    };
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
    listen(window, 'hashchange', () => {
      closeDialog(false);
      reveal(window.location.hash);
    });
    listen(main, 'click', (event) => {
      if (
        event.defaultPrevented ||
        (event.button !== undefined && event.button !== 0) ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = event.target.closest?.('a[href]');
      if (!anchor) return;
      if (anchor.hasAttribute?.('download') || anchor.getAttribute?.('target')) return;
      if (anchor.classList?.contains('reader-image-open') && showImage(anchor)) {
        event.preventDefault();
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search
      )
        return;
      if (anchor.classList?.contains('reader-citation') && showNote(anchor, url)) {
        event.preventDefault();
        return;
      }
      if (anchor === noteFull) closeDialog(false);
      reveal(url.hash);
      if (anchor.closest('.article-toc') && contents) contents.open = false;
    });
    const current = (id) => {
      for (const link of links) {
        if (fragmentId(link.hash) === id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      if (currentLabel) currentLabel.textContent = document.getElementById(id)?.textContent || '';
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
      closeDialog(false);
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
    listen(window, 'pagehide', () => closeDialog(false));
    for (const detail of details)
      listen(detail, 'toggle', () => {
        if (!printState.size) window.dispatchEvent(new window.Event('site:reader-state'));
      });
    dispose = () => {
      closeDialog(false);
      contents?.removeAttribute('data-reader-enhanced');
      for (const anchor of enhancedLinks) anchor.removeAttribute('aria-haspopup');
      observer?.disconnect();
      for (const remove of listeners) remove();
      restorePrint();
    };
  }
  return { mount, destroy, snapshot: () => snapshot(), restore: (state) => restore(state) };
};
