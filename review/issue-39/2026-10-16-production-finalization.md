# Issue39 — production configuration and regression blockers,16 October2026

Owner:[issue39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39).
Execution:follow-up to mergedPR40; self-analysis, not independent release review.
Inspected source96a7a10dcf0a7afd2d4ea0618fc5d590922f7cc0/tree60fbe98c25f85957e1ef68d07939efef6033f6e6.
The maintainer authorized production continuation, maximum autonomous GitHub
setup and the concrete dedicated App installation/permissions/production bypass.
Private-key creation/entry, external acceptance and publication remain distinct.

## Intent and acceptance

Complete production preparation under the existing issue and release controls.
Keep Cloudflare as the sole preview/staging publisher, preserve the admitted
runtime/public bytes and original budgets, retain actual native failures and
correct only confirmed delivery/test-contract blockers. AC03/AC04 retain their
style subcondition:CS01/04/05/07/08/09/10 ownership, readable scoped edits,
unchanged public behavior/budgets, meaningful negative fixtures, bounded style,
Basic/source/format/RI checks and explicit self/independent review distinction.

## Verified GitHub configuration

- Release immutability enabled in the actual repository settings.
- Active protect-main24568553:strict checks, Local navigation and RI freshness,
  Staging admission, all integration15368; no bypass.
- Active protect-production25276926:only refs/heads/production; creation,
  update,deletion,non-fast-forward restrictions. Exactly Integration5351234
  bypass mode always; no production branch created.
- Registered oborskyivitalii-prod/App5351234/ClientID Iv23liivJUZJP0kyhVMe;
  installation172222773 selects only oborskyivitalii/oborskyivitalii.
  Administration/Contents/Workflows write, Metadata read; other permissions,
  webhook,OAuth installation/device flow absent. Both protected main-only
  environments have the exact App/Client identifiers. Owner-created key4899234 is present; secret names verified in both environments. Token mint is not yet exercised.
- SITE_PRODUCTION_ENABLED=false; retired SITE_PAGES_STAGING_ENABLED=false.
  Cloudflare preview/staging remain enabled. Pages uses Actions, no CNAME,
  enforced HTTPS on the original project-prefix origin. No DNS/canonical cutover.

## Native preparation and findings

[Frozen candidate38970827240/1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38970827240)
succeeded:25/25 prepublication,615/615 source tests in49modules,115/115 Python
in8modules, isolated preview publication and exact HTTP checks. Native public
artifact12076902293/upload d7d07a523edf197af408f76825e352de161d320a2f4e3e064ba09a565803ac17;
public307f689d955cd8f64953510c9f3a3c5cbb9a6a68b2fbfe96f7a1349099bf3d8e.
All44 public file hashes and prepublication raw hashes verified. Rights inventory
8da9998f6e1d0cce24267aa5585756a2fb931914a453ceab43e9eb23c9bf50aa:
inventoryPass=true,approvalPass=false. Full/deployment admission not supplied.

[Recovery preparation38971280141/1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38971280141)
succeeded without publication. Captured workflow source,cname null,HTTPS true;
authenticated predecessor38239942377/1/source10d3211f/package3ffcbe8e and complete
previous HTTP pass. Native ZIP12076986820,2504004bytes/66entries,
SHA256 f98ee7d21c084c4ffb5e639f8506f7118e7bce60c5b0f1dd050e98dca7428fc5 verified.

[Full production run38971767557/1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38971767557)
consumes those exact native artifact/run/digests and immutable preview
https://a107b9fb.oborskyi-author-ci-staging.pages.dev. Keep every actual result;
the original run must not be relabelled or replayed to select favorable metrics.

| ID | Evidence | Finding / acceptance | Disposition |
| --- | --- | --- | --- |
| F01 | captures117213722590; artifact12077023565 SHA2563e71646e11900968b6f6482ef798ed6a75814ad5207c4ecd6d502d5e37a1c379 | Fails at index forward scroll moves camera. site/README,space.test and functional.cjs require stationary reading cameras. Capture producer still enforces retired behavior. AC03/04. | Correct actual forward/reverse observations and consumer negatives; preserve failure. |
| F02 | tools/release/actions.cjs and Pages composition; SITE-STAGING | Historical staging subtree still required by production publisher. CF-only staging explicitly deferred this production cleanup to39. AC03. | Production-only composition implemented; predecessor remains exact recovery input. Canonical transition/configuration recovery remains pending. |
| F03 | Actual App Key pairs and environment tables | Initial key pairs0; subsequent fresh UI shows key4899234 and PRODUCTION_APP_PRIVATE_KEY in both main-only environments. | Owner credential setup complete; App token mint remains unverified. |
| F04 | Native full/source-bound release contracts | Full native results, independent/device/rights/live-domain gates do not follow from bounded staging or general visual acceptance. | Preserve required gates and exact-source evidence. |
| F05 | Linux117213722670; artifact12077203218 SHA25654f264a1e512acd213bf37a1418d514e22984f8ca389f2c96cf5470f7a2386b6 | Controlled selftest stops at robots.txt application/octet-stream before functional collection. Its MIME table omits production txt/xml inputs. | Correct only the loopback MIME table; integration-test production robots/sitemap types and exact bytes, preserving hosted MIME negatives. |
| F06 | Native macOS117213722558; artifact12077493310 SHA256e10e88dfbc3490148f9da2520fa9222e269eaaa3e63a05113621317fe2054b7b | Three WebKit navigation rows fail exact separator/ink translate equality; Linux Color has two analogous WebKit failures and four Firefox6950ms timeouts. | Unresolved. Preserve raw computed values and deadlines; no rounding/tolerance, skipping or runtime claim without diagnosis. |

## Execution tasks and checks

| Task | Owner / expected result | Check | Status |
| --- | --- | --- | --- |
| T01 | Capture actual native forward/reverse positions and stationary cameras; retain ambient,lower PNGs,all20views/5recordings,Off/reduced/fallbacks. Full consumer rejects moving camera,blocked scroll and missing observations. | Existing quality fixtures plus meaningful negative mutations; Basic/source/format/style/RI and native capture execution. | Implemented;20/20 quality tests pass. Local real capture unavailable because pinned Chromium installation received truncated/invalid vendor ZIPs; never substitute browser or claim capture pass. Native verification still required. |
| T02 | Production-only package/bootstrap/predecessor/recovery, without second staging publisher. | Existing archive/controller/Pages negative fixtures plus actual recovery/live observations. | Production-only composition, null staging/license receipts and retired-path 404 validation implemented.53/53 delivery tests pass; actual adapter/recovery negatives further extended. Authenticated canonical migration/configuration compensation remains pending before publication. |
| T03 | Reconcile full native run and source-bound candidate/checks after corrections. | Genuine full workflow and retained raw artifacts; no budget changes or fabricated reruns. | Running original96; not admitted. |
| T04 | Protected key,external records,canonical cutover and existing publisher. | Actual provider/full/rights/device/independent/live evidence. | Key/secret metadata verified complete; external/native/canonical/publication acceptance pending. |

Whole AC01–AC05 stay open. No production ref/tag/Release, DNS route or live
production edition was created. Source tests, merges, settings and publication
are separate observations. This follow-up changes no authored runtime/content
without an independently identified need and the existing acceptance route.

## Implemented change and verification boundary

Capture producer and aggregate now require observed before/forward/reverse native
positions and the fixed reading pose, including genuine non-scrollable pages.
Moving camera, blocked forward/reverse, missing/out-of-range observations and
contradictory flags are rejected. All20 views,lower PNGs,5recordings,ambient,
Off/reduced/fallback contracts remain. This changes no renderer or performance budget.

The controlled loopback adds text/plain for txt and application/xml for xml.
Integration assertions verify exact robots/sitemap bytes and MIME, including
owned HTML404 for a missing text path; existing hosted wrong-MIME negatives remain.
Quality and staging source tests pass37/37 without skips.

Production composition authenticates the old complete package but never extracts
or republishes its staging subtree. New packages require an explicit admitted
production source, exact archive rights digest, production receipt bound to the
root, null staging/license receipts and an empty staging inventory. The publisher
retains full local verification before any provider/draft write; HTTP requires
retired staging paths to return the exact owned404. Actual composition adapter
fixtures retain/verifies the predecessor and reject malformed rights,receipts,
content and second staging evidence. Legacy package/HTTP consumers remain for
historical migration and compensation, not a new staging publisher.

Basic24/24 and five-route generated/artifact/geometry/size checks pass. Bounded
style guard passes92files with0legacy occurrences; architecture passes34files/
37edges. These are self-verification, not independent review or full native
release admission. Current source/runtime/public content and original budgets
are unchanged. Permanent tests retain PR-targeted/staging/production coverage;
capture producer is now an explicit quality-suite changed-path input. Historical
fixture and current production-only acceptance are distinct failure surfaces.

Original failure logs, all Linux/macOS report JSON, source/attempt/job metadata
and verified artifact ZIP digests are preserved in the adjacent
2026-10-16-production-finalization-native.json.gz,481093bytes,
SHA256d8b8bf1050bcd40cb1ff662a619f8e4d22c05f3a44a50dde126a5a0323dda773.
No replay has replaced the original native failures. Native performance117213722609 subsequently passed:30 original Lighthouse
rows/10 three-run medians,15 motion samples,3 journeys and300s Writing soak.
Writing mobile TBT median132.5ms,LCP2238.36ms,CLS0,performance0.96; all unchanged
limits pass. Artifact12078670574,22998173bytes/45entries,upload SHA256
8fde004818bdd8540b3c8eec289ad4d539a05ab82fa4ccc4d6603a490752fd64
verified,including every referenced original trace/log hash/size. Adjacent gzip
also retains performance reports,all45file digests and actual job log. Windows
was still running; original Linux/macOS/capture failures remain failed.

Latest self-checks:complete maintained lint and pinned formatting pass; RI build/
verify and RI-CI refresh/verify pass; RI28/28 and RI-CI20/20 tests pass. Actual
composition-adapter and Pages tests pass38/38,including unchanged predecessor
verification. Current-source owning/full source verification follows the clean
checkpoint; no independent review, device evidence or production admission is claimed.

Clean local implementation checkpoint6be3679572e70eff8d3888e4bdc993064c88ed16/
tree69140c6f5ae1e361b038c648ce59714ac92de1a4 passed the complete registered
production source suite:618/618 in49modules,115554ms,zero failures/skips.
Selected owning issue39 policy passes19/19 checks with all manual gates pending,
automation_pass=true,ready_for_issue_closure=false. Original source report,TAP,
stderr,owning policy and commit object are preserved in the adjacent gzip.
Subsequent edits only reconcile this evidence,credential metadata,memory and RI.

Owner credential completion was independently observed through fresh GitHub UI:
key pairs1/key4899234 and PRODUCTION_APP_PRIVATE_KEY in both production and
github-pages; exact App/Client IDs and main-only restrictions retained. No key
value was read or copied. No further owner credential entry is requested.
