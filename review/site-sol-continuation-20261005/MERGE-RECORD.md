# Sol integration record — 5 October 2026

Ready fixes were merged with merge commits into the reviewed candidate **Draft #18**,
branch `work/site-followup-20261005`. Expected head SHAs were pinned at each merge;
current base/head and every required GitHub job step were checked. No main/release
or hosting promotion is implied.

| PR | Exact source head | Source tree | Merge into #18 |
| --- | --- | --- | --- |
| [#20 R1](https://github.com/oborskyivitalii/oborskyivitalii/pull/20) | `77691e7de42af607e7ade363b2e9202300754c7f` | `df985f224c7df52f3d96d09393ef1b658eed5cf7` | `afca690e55745fe72d348968424bbabf3821fab8` |
| [#21 H1](https://github.com/oborskyivitalii/oborskyivitalii/pull/21) | `b404fcdf2c0c18fd8d0546e3ff6eaac91c8b2b31` | `46d5607f2266e936dfb4dfe7b8ff9c6a9c6238e8` | `5020f05f3764b2a3141514795960a8dd98764165` |
| [#24 H2](https://github.com/oborskyivitalii/oborskyivitalii/pull/24) | `3629b26e248b03338952bb5234b6639bda726b4e` | `a31dd365393c1dc4d201170494641809f8162a30` | `51611505d941ae2996a87782840da418722451f6` |

Order: R1 first; H1 retargeted from R1 to #18 after that merge, then merged;
independent Cloudflare setup record H2 followed after its exact-head checks. Main
remains `2ebdd731d5dcf1e12f43f60dd0b3a6ec49b94684`, tree
`24be24f317d7580a8c8a06fc9047d86d5af31a7d`. Its live branch reports protected=false.
Both false hosting guards remain false. R1/H1 did not change provider settings.
The later H2 request authorized Cloudflare preparation: Pages read/create/edit
were verified and an isolated Direct Upload project was created without asset
upload. No DNS, analytics activation, GitHub protection or Environment change
was made. External Git-integrated deployments are recorded separately in H2-CLOUDFLARE.

R1: [basic](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37376273438),
[RI](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37376273103).
H1: [basic](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37376356533),
[RI](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37376355745).
H2: [basic](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37380255856),
[RI](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37380254860).
All required job steps succeeded; staging was intentionally skipped. Source trees
match local reviewed commits f0ba8fa, ea1da49 and 3ec6c3b exactly; API commit identity differs.
Issue #19 closes this source repair. Parent #12/#13/#14 and hosting #8 remain open.

P1 and V1 are stacked Draft increments. Cold Writing still fails a current-source
window, so they and #18 are not promoted to main. See REPORT and SOL-TASKS.
