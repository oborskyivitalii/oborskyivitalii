# Executive site implementation checkpoint — 2026-10-03

Owner #14, staging #8, Draft PR #10. Maintainer instruction: “Зроби”. Starting
live/local head `93002d2`; the supplied research attachments are not new public
inputs and remain outside this site work.

## Implemented first increment

- Exact reference-slider 70% depth visibility, shared by faces/edges/seams.
- Broad theme-aware atmosphere, opacity about .80, with tiny position/light
  changes evaluated on the existing painted 24-second phase. No new timer, CSS
  animation, renderer or production dependency. Off/reduced/hidden/print/hold
  reuse the existing phase/freeze lifecycle.
- Paper/ink/subdued teal/bronze and blue-graphite Night; separate text/control/CTA
  pairs and explicit link/visited/focus button ink; local reading protection.
- Problem-led Home H1, bounded visible author lead, Help before Research, matching
  local navigation and camera sequence. All meaningful copy preserved.
- Same `vo.` identity with bronze dot and small high-contrast favicon.
- Quieter Writing/Credits geometry; route motifs/topology/pulse/portrait unchanged.
- New v10 review edition: historical v9 outputs/evidence are preserved, not reused
  as acceptance of changed source.

Local suites initially passed 58 Node + 18 Python tests; the staging increment
now passes all 68 Node + 18 Python tests. SEO-PRESERVATION records the exact
reversible source comparison. Hosted staging and independent acceptance remain
pending; actual source-bound CI and root inspection are recorded below.

## First actual source-bound CI and visual inspection

Design commit `9c12900`, [full evidence run](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37153498373):
build, 390 Linux Chromium/Firefox/WebKit cases, 40 native Windows cases, 20 macOS
WebKit cases, performance and captures passed. Static stopped on 59 new v10
manifest SHA values detected as entropy candidates, not a proven credential.
Both producers' freshness/byte checks passed, every detector hash was matched to
its precise metadata line, and 59 exact path/type/hash entries were appended to
the existing registry. Previous entries, scanner rules and budgets are unchanged;
fresh CI must verify this correction. The full release gate remains unsatisfied.

The capture ZIP's recorded SHA256 and all 53 recorded image/video hashes plus
all 13 public input hashes were verified locally. Root inspected the 20-view
desktop/mobile contact sheets, Home desktop/Talks mobile Day details and three
actual video frames per route (15 total). Foreground, author/portrait, controls
and publication text remain readable; backgrounds remain visible in open regions.
This is root inspection, not an independent acceptance decision.

The actual composited-pixel sampler passed 40 views/4,418 samples in both themes;
minimum normal-text ratio 4.570, large text 3.897. Normal/hover/focus CTA states are
included in the maintained three-engine checks. This sampled lab result is not
complete WCAG or physical-device certification. No old v9 captures are reused.

The performance archive's recorded ZIP hash and validators were checked locally:
30 Lighthouse samples, all 15 motion profiles and the 300-second mobile Home
soak pass the unchanged budgets. Median performance 97–100; mobile LCP
1.185–1.431 s, TBT 82.5–183 ms, CLS 0–.0565; desktop LCP .342–.419 s. Mobile
CPU×4 painted callback p95 is 10.4–15.6 ms at idle / 11.4–13.3 ms scrolling;
idle callback busy time 6.18–9.12%. Forced-GC soak heap delta −225,756 bytes,
no runtime errors. These are instrumented lab observations, not device/FPS
guarantees or evidence of the eventual hosted origin.

## Staging implementation increment

`tools/staging/` and the post-PR-gate reusable workflow implement the separate
noindex/404/revision package, exact public-byte checks, bounded hosted HTTP and
browser smoke, current-tip rejection, serialized candidate→stable promotion,
last-verified immutable-package recovery and one GitHub Deployment/PR status.
Initial project creation is opt-in secure configuration; permission/quota errors
stop and existing projects are not converted. Eight controlled local tests pass;
a maintained loopback Pages model will exercise the real browser code in CI.
Its result is explicitly synthetic and cannot authorize a deployment.

Combined-source `920fe2f` PR run
[37154826154](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37154826154)
and full run
[37154879431](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37154879431)
passed build/static, including the exact false-positive registry corrections.
The new Pages browser model stopped before the existing functional matrix:
after reload it read `innerText` from the closed native Appearance details,
which correctly returned an empty string. The follow-up reopens the menu before
checking the visible persisted Off state; persistence/freeze assertions remain.
No public file changed. Fresh CI is required; latest exact-source results belong
in PR #10/#8/#14, not an invented hosted or independent acceptance record.

Final verification also found the full-gate capture reader still selected the
historical v9 directory while the new producer emits v10. The reader now selects
and byte-verifies only the current v10 record, without counting its raw metadata
as a duplicate source-bound report. A regression checks single admission and
rejection of missing/current-versus-old/tampered media records. No release budget
or external independent/device requirement is relaxed; fresh full CI is required.

Repeated full capture run on `5ab5b46` produced a 4.4775 ratio for hidden `Theme`
text in closed native Appearance details (Home Day desktop/middle). Its parent
retained Range geometry while that text was not painted; the menu's actual open
surface is opaque paper. The sampler now uses CSS/native-details visibility and
point occlusion before admitting text, explicitly tests both closed and open
Appearance (80 views), and asserts Theme is admitted only when open. Controlled
regressions cover cached closed boxes, visible summary/control, CSS-hidden and
covered text. The 4.5/3 thresholds and public CSS/content are unchanged. Old
40-view results above are historical, not the final expanded check; fresh CI must
verify the correction and actual open controls. No independent acceptance is
inferred. [CSSOM checkVisibility](https://drafts.csswg.org/cssom-view/#dom-element-checkvisibility)
defines the opted-in visibility/opacity checks.

The token is supplied only by the callee's protected environment; repository
secrets are not inherited into PR code. One exact dummy user:pass URL detector
finding is retained as a negative unit-test false positive: userinfo is rejected
before requests, and the fixture is never used to authenticate. Scanner rules
are unchanged; this exact test/registry entry still needs independent review.

Cloudflare account/token configuration is still missing. [Secure setup](../../SITE-STAGING.md)
records the exact environment/variable names and protection/ownership/recovery
limits. No live URL, provider provisioning, hosted-origin success or demonstrated
provider rollback is claimed. Full production, independent/device/rights and
maintainer visual acceptance remain open; PR #10 stays Draft on #9.

## Contrast and blur decision

The maintainer's white-on-white report is accepted as an input, not dismissed by
old green checks. Explicit semantic pairs harden inherited panel/CTA colors. A
local browser launch could not start because the installed Playwright executable
is missing; no affected-selector reproduction or visual acceptance is invented.
Fresh maintained CI will inspect actual composited pixels and states. Static
token ratios alone are only an initial check.

Defocus is not added: the approved fog/atmosphere is implemented first. A blur
trial is optional, not required, and would add a buffer/composition cost without
current rendered evidence of need. Keep the fog-only path; no measured blur
comparison or performance guarantee is claimed.

## Hosting and remaining work

No configured Cloudflare account/token is available in the current environment.
Plugin discovery found an unconnected Vercel integration but not a suitable
Cloudflare Pages connection; the agreed default is not silently changed. Prepare
secure staging code/config and precise owner setup. Do not fabricate a server URL
or upload repository/research material. Production/merge/domain/payment remain
unauthorized. Independent/device/editorial/rights acceptance remain explicit.
