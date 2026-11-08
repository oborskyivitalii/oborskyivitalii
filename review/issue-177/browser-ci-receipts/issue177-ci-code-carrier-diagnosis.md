# Issue177 — CI42511286540 source/SEO refusal diagnosis

Read-only Code reviewer `/root/issue177_ci_code`, 2026-11-08. Inspected retained `/tmp/issue177-ci-failure-42511286540/reports` TAP, source runner JSON, SEO stderr and formatting report, canonical `tools/check_site_seo.cjs`, `tests/executive.test.cjs`, `tests/content.test.cjs`, current producer delta and existing carrier owner. No edits, workflow rerun, external writes or delegation.

## Observed failure mechanism

Four individual source-test failures share the stale carrier producer identity: executive Writing proof, executive Research proof, executive frozen SEO proof, and fresh SEO CLI in content-rendering. The standalone SEO prepublication step fails identically. Current actual `tools/site/build.cjs` SHA256 is `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee`; existing reviewed successor pin is `3d9b80f989008ae487cccf4b38aea630bd4ddf62782a971e7e62142c9fbbc869`.

`tools/check_site_seo.cjs:235-246` obtains the current successor from `review/issue-169/writing-carrier.json`. Both `verifyWritingCarrier` and `verifyResearchCarrier` consume that same record through `carrierProducer`. The historical before SHA is verified against the fixed `predecessorSource`; the current after SHA is deliberately required to equal current producer bytes. This is the canonical active rebind owner; changing SEO verification code or historic issue159 pins would bypass the intended chain.

A **separate fifth individual test failure** occurs in `tests/content.test.cjs:491-524`: expected analytics loader is compiled using principal routes only. Current output correctly has new `1c34e640.../analytics.js`, while this stale oracle expects old `7ebed494.../analytics.js`. This is route-inventory/oracle drift, not metadata or page-schema drift. The meaningful exact script-count/content/schema checks should remain intact.

Formatting report's `changed` array contains only `.github/ri-ci-map.json`; no blanket formatting is justified.

## Independent geometry/source proof

Inspected actual build delta against mainfdfc8cb6: finite `analyticsURLs(config,catalog)` adds validated local-article URLs to SDK compilation and analytics fingerprint; no model, fallback geometry, rights or metadata implementation changed.

A bounded read-only Node probe independently recomputed current Writing and Research fallback geometry and compared each exact SVG with the historical source used by its canonical proof. It also verified accepted SVG digest, resource path and bytes, then reconstructed alias and immutable-route carrier SVG from current docs. All passed:

- Writing: `943eaad6a4a49f83671d25ae9f9d766e80196f8b25b5aa68173715be5e955874`.
- Research: `afd670d4651035dce324acb94b6efb83b7b7e0372d978a4f5a961f0eb86d7341`.

This supports a bounded producer-identity refresh; it does not establish whole SEO acceptance before the canonical verifier completes. No rights authority, semantic claim or accepted geometry changes are required by the diagnosed fix.

## Smallest correction and verification plan

1. Retain current failed CI/source accounting and exact logs. Record dated issue177 rationale that this is successor producer rebinding after reviewed analytics-only changes.
2. In active `review/issue-169/writing-carrier.json`, update only `producerChanges['tools/site/build.cjs'].afterSHA256` to actual `ee69b995...`. Preserve `beforeSHA256`, predecessorSource, issue/schema, scope, accepted SVG digest, resource, all other producer pins and historical review packets. Existing Git history retains the previous accepted after identity. The full canonical proof will then check geometry/resource invariants rather than stop at stale producer bytes.
3. Correct the metadata test's independent analytics route oracle to principal routes plus accepted validated native article URLs, preserving finite catalog ownership and all exact script/schema assertions. Do not merely hardcode the new loader digest or remove the assertion.
4. Format only `.github/ri-ci-map.json` with existing pinned formatter; refresh deterministic RI identities/views as required and verify no bound/scanner/budget changes.
5. Before another campaign, run the directly affected executive/content-rendering/content source suites and actual `node tools/check_site_seo.cjs`, plus relevant formatting/RI checks. Inspect any newly exposed canonical refusal before patching or rerunning. Obtain source-bound independent correction review. Then run the required exact-source full prepublication/browser checkpoint in the existing lane.

No new SEO feature, metadata, geometry or rights changes are indicated by the observed failures. Original AC04 SEO implementation remains outside this checkpoint. AC01/AC07 require correction and checks; AC02 browser evidence remains pending. This report is diagnosis/proposed treatment, not implementation approval or a passing campaign claim.
