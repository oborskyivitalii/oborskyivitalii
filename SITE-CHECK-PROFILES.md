# Site check profiles

Issues #8/#13 own hosting/checks. Existing PR #26 isolates the CI controller;
#18/#22/#23 retain their unfinished runtime work.

| Profile | Trigger | Work |
| --- | --- | --- |
| Basic | PR updates | Focused theme/archive tests, current-source generation, finite worlds, executable syntax, coherent snapshots/links and size budgets. Authored Color sources add their scoped flight/motif checks when present. Counts are reported from actual Node tests. |
| Preview | Same-repository PR updates | Build once, publish via official Wrangler Action, exact HTTP/runtime bytes and Chromium at 1440/390; normal/no-Canvas controls/navigation/history checks; Color adds authored ribbon/spatial-flight/edge checks. |
| Full staging | Explicit owner `/stage` PR comment or dispatch from protected main | Full source, lint/security/advisories, exact hosted HTTPS/MIME/cache/noindex/redirects/404, three Linux engines, Windows/macOS, accessibility/failure fixtures, Lighthouse, sequential CPU/soak and captures. |
| Full production | Authorized production release | Same full hosted automation plus existing independent/device/rights/production indexing requirements. |

Default local command: `node tools/quality/local.cjs`; no browser/advisory network
or soak is needed. `site-checks.yml` provides this bounded source profile.
`navigation.yml` verifies RI freshness only; runtime/navigation diagnostic
workflows are manual. Full source/browser/security suites run only in the explicit
hosted profile, not automatically on each PR update.

Preview reports carry a distinct kind and cannot authorize staging. The full gate
requires all mandatory jobs/reports and the exact source/tree/artifact/variant.
Missing runtime telemetry fails full testing honestly; the base infrastructure
PR does not inherit performance acceptance from the experimental runtime.

Read [SITE-STAGING](SITE-STAGING.md) for credentials, controller/owner command,
immutable URLs, source leases, stable promotion and automatic retained recovery.
New opt-ins are `SITE_PR_PREVIEW_ENABLED` and `SITE_PR_STAGING_ENABLED`; legacy
`SITE_STAGING_ENABLED` remains absent/false. Production activation stays separate.
