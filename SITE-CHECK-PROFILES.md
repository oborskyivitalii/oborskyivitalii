# Site check profiles

Issues #8/#13 own hosting/checks. Controller PRs #26/#29 and the accepted
#18/#22/#23 runtime lineage and the #28 reading/content follow-up are on protected
main. Current source/deployment observations belong in [MEMORY](MEMORY.md) and
the live issue/PR. Fresh full staging and stable verification precede each
authorized runtime/content merge.

| Profile | Trigger | Work |
| --- | --- | --- |
| Basic | PR updates | Focused theme/archive tests, current-source generation, finite worlds, executable syntax, coherent snapshots/links and size budgets. Authored Color sources add their scoped flight/motif checks when present. Counts are reported from actual Node tests. |
| Preview | Same-repository PR updates | Build once, publish via official Wrangler Action, exact HTTP/runtime bytes and Chromium at 1440/390; normal/no-Canvas controls/navigation/history checks; Color adds authored ribbon/spatial-flight/edge checks. |
| Full staging | Explicit owner `/stage` PR comment or dispatch from protected main | Full source, lint/security/advisories, exact hosted HTTPS/MIME/cache/noindex/redirects/404, Linux Chromium/Firefox plus full native macOS WebKit, Windows smoke, original Linux Color checks, accessibility/failure fixtures, Lighthouse, sequential CPU/soak and captures. |
| Full production | Authorized production release | Same full hosted automation plus existing independent/device/rights/production indexing requirements. |

Full functional coverage remains 390 unique scenarios / 12 navigation / 39
analytics: Linux Chromium/Firefox 260/8/26 and native macOS WebKit 130/4/13.
All disabled-JavaScript and failure modes remain mandatory. Windows smoke
40/8/26 and twelve Linux Color checks retain separate raw provenance. Legacy
nonfull checks still use all three Linux engines. Pins and original 45m Linux /
40m native jobs and page/performance budgets are unchanged. Mac smoke cannot
substitute for full WebKit coverage; missing or wrong-source reports fail.

Default local command: `node tools/quality/local.cjs`; no browser/advisory network
or soak is needed. `site-checks.yml` provides this bounded source profile.
`navigation.yml` verifies complete path coverage, both RI views and focused
RI/agent-memory tests; runtime/navigation diagnostic
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
