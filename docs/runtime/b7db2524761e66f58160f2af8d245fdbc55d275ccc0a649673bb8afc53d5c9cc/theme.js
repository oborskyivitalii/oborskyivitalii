/* Two visual themes. Auto follows the visitor's device clock, without location data. */
(() => {
  'use strict';
  const storageKey = 'vo.theme';
  const allowedModes = new Set(['auto', 'light', 'dark']);
  let timer;

  function readMode() {
    try {
      const saved = localStorage.getItem(storageKey);
      return allowedModes.has(saved) ? saved : 'auto';
    } catch {
      return 'auto';
    }
  }

  let mode = readMode();

  function refresh() {
    const now = new Date();
    const hour = now.getHours();
    const automaticTheme = hour >= 7 && hour < 19 ? 'light' : 'dark';
    document.documentElement.dataset.theme = mode === 'auto' ? automaticTheme : mode;
    const control = document.getElementById('theme-mode');
    if (control) control.value = mode;

    window.clearTimeout(timer);
    if (mode === 'auto') {
      const next = new Date(now.getTime());
      if (hour < 7) next.setHours(7, 0, 0, 0);
      else if (hour < 19) next.setHours(19, 0, 0, 0);
      else {
        next.setDate(next.getDate() + 1);
        next.setHours(7, 0, 0, 0);
      }
      timer = window.setTimeout(refresh, Math.max(1000, next.getTime() - now.getTime()));
    }
  }

  // Apply before the stylesheet/body so a night visit starts in the dark theme.
  refresh();

  function attachControl() {
    const control = document.getElementById('theme-mode');
    if (!control) return;
    control.value = mode;
    control.parentElement.hidden = false;
    control.addEventListener('change', () => {
      mode = allowedModes.has(control.value) ? control.value : 'auto';
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        /* Choice still works in this tab. */
      }
      refresh();
    });
    const appearance = document.querySelector?.('.appearance');
    if (appearance)
      document.addEventListener('keydown', (event) => {
        // Safari mouse activation may leave focus outside the open details.
        if (event.key === 'Escape' && appearance.open) {
          appearance.open = false;
          appearance.querySelector('summary').focus();
        }
      });
    const header = document.querySelector?.('.site-header');
    if (header) {
      const clearance = () =>
        document.documentElement.style.setProperty(
          '--header-clearance',
          `${Math.ceil(header.getBoundingClientRect().height + 16)}px`
        );
      clearance();
      window.addEventListener('resize', clearance, { passive: true });
      if (window.ResizeObserver) new window.ResizeObserver(clearance).observe(header);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachControl, { once: true });
  } else attachControl();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) {
      mode = readMode();
      refresh();
    }
  });
})();
