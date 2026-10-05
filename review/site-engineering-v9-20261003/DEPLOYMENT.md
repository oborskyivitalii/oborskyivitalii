# Prepared deployment dependency, activation still owned by #8

The reusable `site-release-checks.yml` exports an immutable public artifact ID,
GitHub archive digest and deterministic public digest. Its full aggregate fails
until automated, independent review and physical-device evidence matches those
bytes. Repository rules/host/URL and launch/rights decisions have not been changed.

At #8 activation, the host-specific deployment job must `needs: checks` on a full
call, download **that artifact ID from that run**, verify its `artifact.json` with
`node tools/quality/artifact.cjs verify`, then deploy `public/` without rebuilding
or resolving a moving branch. Give read-only checks no deployment credentials.
The deploy job alone receives Pages/host permissions after a successful full gate.

For a Pages Actions workflow, the reviewed action revisions on 2026-10-03 are
`actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b`
(v4) and `actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e`
(v4). Upload the already verified `public/` directory for Pages; the packaging
format differs but every public file must retain its tested SHA256. Archive digest
and public-file digest are separate identities, never interchangeable.

Activation must inspect actual repository/environment controls, disable direct
branch publication as a bypass, and record the immutable deployment input. Before
the first production release, bind the selected owned preview origin to #8, run
bounded OWASP ZAP Baseline passive checks on that origin only, and verify real TLS,
redirects, MIME, headers and mixed content. Do not crawl linked external articles.
Loopback browser tests do not establish any of those host properties.

After authorized deployment verify every served route/asset against the manifest,
controls and canonical/robots/sitemap policy before declaring the release healthy.
Retain the previous accepted artifact and restore it under the reviewed recovery
procedure if smoke fails. No host-origin evidence or physical-device pass has been
invented; both remain explicit release dependencies. This document prepares the
job dependency and exact inputs; it does not authorize or activate deployment.
