# Half-width ribbons and reading glass — 4 October 2026

The later continuous-material/signal refinement and final-file evidence are in
[SIGNALS](SIGNALS.md). The exact bytes and measurements below remain the
previous half-width/Glass baseline.

Owners: #14 optional design, with #12/#13 retaining lifecycle, content-growth
regressions and every existing release budget. This responds to the maintainer's
rejection of the wider comparison: halve the ribbons, reduce their transparency,
lighten text backdrops and compare a macOS-like frosted material. It updates the
same autonomous comparison file, isolated from `site/engine`, `docs/`, public
content, SEO, analytics activation and hosting. Previous wide-ribbon measurements
in [RIBBONS.md](RIBBONS.md) are baseline evidence only.

## Exact treatment

The width and its modulation are exactly half of the inspected `f6b3fb5` version:
nominal 1.1 rather than 2.2 world units. Base face alpha increases from 0.44/0.50
to 0.68/0.74 in Day/Night; depth haze, face orientation and rose/violet/blue
texture still modulate the final visible alpha. The existing world-space torsion,
24-second rotation, bounded breathing and scene depth order remain intact.

Text stays opaque. Soft material uses 72/76/78% paper tint for open/reading/row
backdrops, down from 86/90/91%. Glass uses 64/68/70%, a restrained static tint
gradient, existing feathered edges and 7px desktop backdrop blur (4px at <=640px).
Retaining tint is the design recommendation for long text over moving geometry;
fully clear blur alone would make the reading background depend too strongly on
the current scene. This is web frosted glass, not Apple's native Liquid Glass.

Appearance -> Reading background offers Soft and Glass. Glass defaults only
where CSS backdrop filtering and IntersectionObserver are available; otherwise
Soft remains usable. The local preference `vo.reading-surface` survives route
mounts and reload. Blocked storage still allows in-tab changes. Actual reduced
transparency forces Soft with 96% tint and disables the selector; print disables
filters. Standard and WebKit-prefixed properties are supplied. No new tracking,
dependency, animation loop or timer is added.

A first trial blurred every block and exposed 95/182 desktop compositing layers
on Research/Writing. The final implementation admits at most six visible reading
surfaces using one IntersectionObserver and a child-list observer on the existing
content mount. Detached/offscreen panels lose blur, Soft disconnects admission,
and nested admitted parents avoid redundant child filtering. Custom admission
attributes do not trigger the engine's class/style scroll-map observer. Tint
remains on all reading surfaces. This bounds admitted panel count, not total
pixel cost or GPU load.

## Exact autonomous file

`Vitalii-Oborskyi-Color-Prototype.html`: **588,543 bytes**, SHA-256
`65fa206801fa0c60712f29e68813eae4aa9d64090b865c36c23babf7ce1f07de`.
All current browser checks below used these exact bytes via offline file URLs.
The unchanged baseline `Vitalii-Oborskyi-Final.html` retains SHA-256
`2d9d3312739e5414db892991fab1749bb88394c782bb8e6993dc37f568c52578`.

## Local validation

Actual headless Chromium **153.0.8010.12**, 1440x900 desktop and 390x844 mobile:

- 103 Node tests pass, including an exact half-width regression against five
  frozen broad-version measurements across rooms/phases. Existing geometry,
  orthogonality, exact 24-second position/velocity/twist/pulse closure, drift and
  coherent labelled export tests pass. The existing wildcard Node CI includes
  these maintained tests; no new server CI run is claimed.
- 18 Python tests, focused test-file ESLint and repository diff checks pass.
- 40 route/theme/viewport/material captures pass: five routes, both themes, two
  sizes and Soft/Glass. Off and reduced-motion pixels freeze exactly. All views
  have positive ribbon faces and no script errors or HTTP requests. Implementer
  inspected the desktop/mobile contact sheets and full Research/menu captures.
- Ten all-route content-growth cases pass on the final default Glass variant:
  original content, added/resized blocks, enlarged footer, same-height reorder,
  restoration and changed viewport. Final 90/95/99/100% gestures, exact endpoints,
  short content, Writing's single-record filter, navigation/history/reload pass.
  All ten reordered semantic waypoint world-distances are zero against the
  measured native offset. Existing source/CI regression owners are preserved.
- Each material passes 80 sampled contrast views / 7,178 admitted text points:
  both themes/sizes, opening and 42% scroll, Appearance closed/open. Glass minimum
  normal-text contrast is 5.247, Soft 5.166, large text 3.897 for both; zero sampled
  failures. These are rendered samples, not complete WCAG certification or
  exhaustive coverage of every ambient phase and scroll position.
- 80 route/viewport/material/scroll-position control cases pass with no overflow,
  one selector, at most six actual filtered panels in Glass and zero in Soft.
  Preference persistence, actual CDP reduced-transparency media changes, missing
  backdrop-filter, missing IntersectionObserver and blocked-storage fallbacks
  pass. New source is not claimed tested on native Safari or physical phones.

The corresponding scratch outputs are `glass-qa/{capture,regression,controls,
contrast,contrast-soft,material-performance}.json`; these are session evidence,
not required release artifacts. Node tests are maintained in the repository.

## Bounded material performance trial

Research and Writing, previous broad version / new Soft / bounded Glass, at both
widths. Each profile warmed for 1.5s, then measured 3.5s idle and 3.5s native-scroll
windows. Mobile used deviceScaleFactor 3 and CDP 4x CPU throttling. The actual
renderer reports ANGLE/SwiftShader, so this is a software-rendered Chromium lab,
not native hardware GPU/battery evidence. Work ran serially, without other browser
QA jobs. Values below are painted callback p95 and idle callback busy share.

| Glass profile | Idle p95 | Scroll p95 | Idle busy share | Max observed layers |
| --- | ---: | ---: | ---: | ---: |
| Research desktop | 9.2ms | 15.8ms | 9.83% | 31 |
| Writing desktop | 9.9ms | 13.6ms | 12.99% | 44 |
| Research mobile emulation | 21.2ms | 27.8ms | 13.01% | 21 |
| Writing mobile emulation | 20.8ms | 29.5ms | 13.22% | 31 |

All 24 windows have positive paints and no device hold. Maximum painted-callback
p95 is 29.5ms for Glass, 32.4ms for Soft and 27.0ms for the previous comparison;
maximum idle callback busy shares are 13.22%, 15.25% and 15.82%. The measured
windows satisfy the existing 33ms callback and 20% idle-busy budgets. Variation
does not establish that Glass is faster than Soft or the previous version.

Soft/previous layers peak at 12 on Research, 17 on desktop Writing and 12 on
mobile Writing. Glass still creates extra compositing layers, but viewport
admission reduces observed peaks from the unbounded trial's 95/182 desktop and
93/150 mobile to 31/44 desktop and 21/31 mobile. It therefore has a real rendering
cost; the useful conclusion is that the bounded material fits these short callback
windows, with a no-blur Soft choice available. Browser CPU counters returned zero
delta despite active rendering and are discarded. Callback timing excludes total
compositing/GPU work; repaint intervals are adaptive cadence, not display FPS.
This is not the complete 15-profile/300-second release performance gate.

## Reproduction and scope

```bash
node review/site-scroll-sync-20261004/export.cjs /absolute/output/directory
node --test tests/*.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json build
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify
```

No GitHub push, publication, deployment, merge or analytics activation is part of
this material refinement. Production adoption, independent design acceptance,
complete exact-artifact performance gates and physical-device/native Safari
validation remain distinct from the working offline comparison.
