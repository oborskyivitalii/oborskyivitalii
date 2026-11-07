# Issue169 distribution — storage-only Requirements & Acceptance rebind

Date: 2026-11-06. Owner: issue169 / PR170. Same nonauthor Requirements & Acceptance role, affected continuation. Preserve prior preflight/v2/v3/v4 results unchanged.

## Verdict

**Pass for the bounded storage delta and reuse of the v4 requirements judgment.** Both additional historical reports are retained exactly in gzip archives with working Markdown locators. No requirement, acceptance meaning, planned URL, source code, platform kit, manuscript, PDF, visual or publication-sequence change was observed.

Final metadata/RI and full exact-source check/review/release admission remain separate pending gates. No campaign or runtime acceptance is supplied by this storage review.

## Source binding and observations

- Base Git HEAD `7c292bd50a4f9a0024c397a290c1de965ceada4f`; dirty prepared candidate.
- Packet `review/issue-169/distribution/candidate-v5.json`, SHA256 `8e557f88ebc451ebd7a03ed2fb7410dc335467a6a67576678ead6ceed28df30f`: all 46 current/deleted entries matched actual bytes. All 41 v4 pins are unchanged. Five new packet entries comprise two Markdown locators, their two gzip archives and the archive manifest.
- Manifest `review/issue-169/distribution/receipt-storage-archive.json`, SHA256 `fb2acc6b5801880915bc1df683607029bee8e335d03cb630aca63a286d25d9e9`.
- Actual gzip decompression was compared byte-for-byte with the exact `7c292bd` original files; both equal their Git originals and declared original SHA256. Actual archive SHA256s match their declared pins. Decoded historical report conclusions were not semantically inspected or used as peer verdicts.
- The existing v4 kit `6b1039925ee49a8349d46ddd8539aa1ad0b6314d896f3132e58bcc98c8f6a75a` remains present; all declared output SHA256s match actual files. Its requirements/sequence evidence is reused because all relevant v4 source pins remain unchanged.

| Historical owner | Original decoded SHA256 | Archive SHA256 | Verified net saving |
| --- | --- | --- | ---: |
| `review/issue-120/2026-10-22-review.md` | `70ee3b02b77fa6dc918dbc2c1b9ffca455154313144fea48976b474e56f859fe` | `c23beee2a93c696de78b4b006451908ddfb04e1b03ee02543e96834407be39da` | 51,746 bytes |
| `review/issue-122/2026-10-24-r3-runtime-compatibility.md` | `ee80dea26b126188458cc6e4ddfc11fc6cd79731fe0adf738ca6492d4450bb2e` | `38150cb23720ea955ec26c29cc1eb88e002eb049d4f0840276a4c3d9f12e1220` | 48,848 bytes |

Net savings total **100,594 bytes**, independently calculated as original bytes minus actual archive and locator sizes, matching the manifest. This is verified delta accounting; a complete final repository-byte-bound check was not run or claimed.

Each locator retains the original path, report identity, linked archive, original/archive digests, decode command and original relative-link context. Existing referring paths continue to resolve to a readable locator. The full archived report is recoverable without changing any finding or acceptance condition. Deep headings now reside in the decoded archive rather than the locator; these are historical reading surfaces, not new acceptance or execution owners.

## Consumer and scope check

Targeted references to the two paths in active `tools`, `site`, `.github`, guides and root owners show repository catalog/RI references and scanner-reason prose. No direct executable/parsed report-body consumer was found in that bounded search. The issue120 path is also listed by the RI/CI map as a source reference, so source catalog/generated RI freshness must still be reconciled; this review does not waive it. There is no change to active publisher/event/material validators or a budget/oracle/guard.

| Intent / AC | Independent oracle | Affected result |
| --- | --- | --- |
| AC05/11 source-bound history and review retention | Actual decoded bytes equal exact original Git blobs; locator/archive identity pins | Preserved. Archive storage changes do not supply or replace current independent-review execution. |
| AC04/09/10 agreed distribution sequence | All prior v4 source pins and kit outputs unchanged | Reuse v4 pass for the bounded preparation/sequence requirements; actual website/platform observations remain pending. |
| AC07/08/09 accepted manuscript/PDF/visual preservation | Unchanged v4 packet/source boundary | No storage exception touches accepted article artifacts. |
| Existing finite repository bound | Net size accounting and unchanged budget owner | Savings verified; no threshold increase, skipped guard or new exception. Final actual-source bound/RI check remains pending. |

## Independence and next gate

Read-only identity/decompression/reference inspection only; no source/test changes, campaign, external writes or delegation. No peer output, MEMORY, private/author conversation or unrelated current history inspected; no unexpected exposure observed. Same-role continuation, not newly fresh-context execution. Provider internals and final clean-head process receipts remain outside this review.

Finish the declared source-catalog/RI and final metadata rebind, then preserve the existing full source/check/reviewer and website-release gates. No new author decision is required for this reversible exact-byte archival treatment.
