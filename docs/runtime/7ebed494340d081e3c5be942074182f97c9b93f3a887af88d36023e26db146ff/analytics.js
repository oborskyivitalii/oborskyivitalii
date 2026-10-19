/* Generated optional Cloudflare integration. */
"use strict";
(function cloudflare(config) {
  if (
    location.protocol !== 'https:' ||
    location.origin !== config.origin ||
    !config.pathnames.some(
      (pathname) =>
        location.pathname === pathname ||
        (pathname.endsWith('.html') && location.pathname === pathname.slice(0, -5))
    )
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
})({"origin":"https://vitaliioborskyi.ai","pathnames":["/","/index.html","/research.html","/writing.html","/talks.html","/credits.html"],"token":"b01c620f5f154a24b782fe2f970e5af8"});
