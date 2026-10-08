'use strict';
// Serialized by the producer only for an explicitly enabled production config.
module.exports = function cloudflare(config) {
  if (
    location.protocol !== 'https:' ||
    location.origin !== config.origin ||
    !config.pathnames.includes(location.pathname)
  )
    return;
  const id = 'site-cloudflare-beacon';
  if (!document.body || document.getElementById(id)) return;
  try {
    const script = document.createElement('script');
    script.id = id;
    script.type = 'module';
    script.async = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: config.token, spa: true }));
    script.setAttribute('data-site-analytics-status', 'loading');
    script.addEventListener(
      'load',
      () => script.setAttribute('data-site-analytics-status', 'loaded'),
      { once: true }
    );
    script.addEventListener(
      'error',
      () => script.setAttribute('data-site-analytics-status', 'blocked'),
      { once: true }
    );
    document.body.appendChild(script);
  } catch {
    // Analytics is optional: a blocked script must not interrupt the site.
  }
};
