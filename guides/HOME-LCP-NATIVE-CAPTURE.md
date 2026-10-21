# One native Chrome Home capture

Owner: issue112 / Draft PR117. Capture one real desktop opening of
<https://vitaliioborskyi.ai/>. This runbook is preparation, not evidence that a
native/slow/SDK session has occurred. Do not repeat opens until a slow number
appears. Retain a fast or failed first capture as its actual outcome.

The owner is currently on iPad. This desktop procedure is optional pending work,
not a required owner action. The bounded remote SDK alternative is documented in
[check profiles](SITE-CHECK-PROFILES.md#registry-and-issue-completion); it can
investigate vendor execution in replay without supplying native-device evidence.

Use your normal desktop Chrome and network, with the existing extensions and
preferences recorded. Do not use mobile emulation, CPU/network throttling,
Lighthouse, hard reload, cache clearing, a private window or a new profile.
Those would change the scenario. DevTools itself has measurement overhead.
Keep the content viewport unchanged through export; undock DevTools before
recording if needed to retain the usual browser-window size.

## 1. Prepare before opening Home

1. Open an `about:blank` tab and DevTools: macOS `Command+Option+I`,
   Windows/Linux `Ctrl+Shift+I`. Keep DevTools open through all exports.
2. In Network enable **Preserve log**, select **No throttling**, leave
   **Disable cache unchecked**, and clear filters. Leave the ordinary cache intact.
3. Open the Command menu (`Command+Shift+P` / `Ctrl+Shift+P`) and choose
   **Show Request conditions** (older Chrome: **Show Network request blocking**).
   Record the existing rules, order and enabled states, then temporarily disable
   all other Request conditions rules. Add these two **blocking**, not throttling,
   patterns, enable them and move them to the top of the ordered list:

   - `*cloudflareinsights.com/cdn-cgi/rum*`
   - `*vitaliioborskyi.ai/cdn-cgi/rum*`

   Keep `static.cloudflareinsights.com/beacon.min.js` allowed. This lets the
   genuine SDK execute but prevents its measurement requests reaching Cloudflare.
   Chrome uses the first matching rule; an earlier throttling rule can override
   a later block. Only these two temporary rules should be active during capture.
   A blocked request should show **(blocked:devtools)**. Do not close DevTools
   while the diagnostic document is alive: closing it disables request blocking.
4. In Performance select **No throttling** for both CPU and network. Enable
   screenshots and JavaScript samples if available; avoid advanced paint
   instrumentation. Start **Record** on the blank tab, not Record and reload.

## 2. Open and retain the same document

1. With recording active, enter <https://vitaliioborskyi.ai/> in that tab's address
   bar. Wait30 seconds in the foreground. Do not click/scroll/type in the page,
   change theme/motion, navigate internally or reload. Record whether it looked
   slow, plus device/Chrome version, extensions and power/network conditions.
2. Switch to another browser tab for2 seconds, then return. This is a real
   visibility transition that may flush the SDK's current-document payload.
   Do not dispatch synthetic visibility events or force a vendor request.
3. Stop recording through DevTools. Leave Home open. In Performance download
   **Save trace** as `home-trace.json.gz`, with **Include resource content** on,
   **Include script source maps** off and gzip on. This can retain actual
   HTML/JS/CSS, including a successful SDK response; verify contents afterward.
4. In Network clear filters, export **HAR (sanitized)** as `home-network.har`.
   Keep the blocked RUM attempts and SDK response in the export. If the HAR omits
   a blocked request's body, copy its **Payload** separately to `home-beacon.txt`.
   If SDK source is absent from both exports, right-click its request under
   **Name → Copy → Copy response**
   to save `beacon.min.js`; retain the same HAR response headers/status.
5. Still on this Home document, run the following once in DevTools Console. It
   downloads `home-timing-<timeOrigin>.json`. It makes no network request, reads
   no cookies/storage and only exports post-load Timing/current runtime state.

```js
(() => {
  if (
    location.origin !== 'https://vitaliioborskyi.ai' ||
    !['/', '/index.html'].includes(location.pathname)
  ) {
    throw new Error('Export from the recorded production Home document');
  }
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!navigation) throw new Error('Navigation Timing unavailable');
  const scene = document.querySelector('.space-scene');
  const canvas = document.getElementById('space-canvas');
  const sdk = document.getElementById('site-cloudflare-beacon');
  const snapshot = {
    schema: 1,
    kind: 'native-home-postload-export',
    capturedUTC: new Date().toISOString(),
    timeOrigin: performance.timeOrigin,
    url: location.href,
    userAgent: navigator.userAgent,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    visibilityAtExport: document.visibilityState,
    initialVisibility: null,
    startupLifecycle: null,
    sceneReadyMs: null,
    lcpCandidates: null,
    longTasks: null,
    missing: ['startup lifecycle/readiness were not observed by this late export'],
    traceRequiredFor: ['LCP candidates/elements', 'main-thread tasks', 'lifecycle'],
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    theme: document.documentElement.dataset.theme || null,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scene: scene ? { ...scene.dataset } : null,
    canvas: canvas
      ? {
          width: canvas.width,
          height: canvas.height,
          cssWidth: canvas.clientWidth,
          cssHeight: canvas.clientHeight,
        }
      : null,
    sdkState: sdk ? { ...sdk.dataset } : null,
    navigation: navigation.toJSON(),
    resources: performance.getEntriesByType('resource').map((entry) => entry.toJSON()),
    paints: performance.getEntriesByType('paint').map((entry) => entry.toJSON()),
  };
  let url;
  try {
    url = URL.createObjectURL(
      new Blob([JSON.stringify(snapshot, null, 2)], {
        type: 'application/json',
      })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'home-timing-' + Math.floor(performance.timeOrigin) + '.json';
    link.click();
  } catch (error) {
    console.warn('Timing download unavailable; use the Console copy fallback.', error);
  } finally {
    if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return snapshot;
})();
```

The expression also returns the exact captured object. If the file does not
download, immediately run `copy(JSON.stringify($_, null, 2))` in Console, before
evaluating another expression. Save that clipboard text as `home-timing.json`
in a plain-text editor, privately. Do not rerun the capture or export just to
recover the file; the returned snapshot preserves the original timeOrigin/state.

After all exports, navigate this tab to `about:blank` while DevTools and blocking
remain active; wait at least2 seconds and confirm final RUM attempts have settled
as blocked. While still on `about:blank`, remove the two temporary rules and
restore the prior rules/order/enabled states. Only then close the blank tab. If a RUM request
was actually delivered, retain that fact; do not claim zero forwarded telemetry.
Share the three main files and any missing-body supplements
privately with the investigator. Keep raw traces/HAR out of GitHub. Sanitized HAR
removes common credential headers; URLs, request bodies and trace sources may
still contain private information.

## What the investigator must establish

- Bind the native navigation's URL/time to the trace's navigationId/main frame
  and Timing.timeOrigin. Match the real SDK payload's `startTime`/`pageloadId`
  where present; SDK field names/version can vary. A pageloadId alone is not a
  timing/source binding. Reject mixed reloads, internal-route or old-page frames.
- Verify SDK200/body/hash and retained real payload. Loaded script alone does
  not prove a CWV payload; missing/sampled/blocked/failed remains incomplete.
  The local blocked-delivery arm cannot prove ingestion into Cloudflare.
- Compare captured Home/runtime/CSS/media bytes and revision identities to the
  actual release for this capture; do not silently reuse an earlier source pin.
  If response bodies are missing, request the relevant original exports.
- Derive LCP candidates, resource/render path and main-thread tasks from this
  trace. Use real visibility events where exposed. Startup visibility/pageshow
  details absent from the trace remain unknown; the late snapshot cannot recover
  them. It is never an instrumentation-valid substitute for pre-script collection.
- Classify the actual outcome. A fast capture is useful non-reproduction; a Poor
  result is a candidate for RCA only after identity/timing checks. No automatic
  fix, release, traffic reclassification or analytics setting change follows.

Sources verified21October2026: [Chrome recording](https://developer.chrome.com/docs/devtools/performance/overview),
[trace export](https://developer.chrome.com/docs/devtools/performance/save-trace),
[HAR export](https://developer.chrome.com/docs/devtools/network/reference/#save-as-har),
[request blocking](https://developer.chrome.com/docs/devtools/request-conditions),
[Console copy/last result](https://developer.chrome.com/docs/devtools/console/utilities),
[Cloudflare RUM fields](https://developers.cloudflare.com/speed/observatory/rum-beacon/).
