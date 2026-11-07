# Issue169 — browser fixture media controller

Owner169; publication PR170 at ec35807bec4a233cf7e80eb39f455c1f6b19434a.
Prepared controller correction is based on protected main312fbe4347eda332aa8ade885b07c98beadd6da5.
User endpoint: verified stable R10 staging, then STOP/show. No PR170 merge or
production activation. Prior exact-head acceptance of PR173d06640cb does not
accept this new controller; its full diff and final head need maintainer review.

## Retained native observations

Owner staging42314101070/1, controller312fbe4, publicationEC/tree
e2c1ae7b8ed6dd41f3580d292d6e0c8ad89cbcf6 passed26/26prepublication guards,
including current-source lint/security/advisories. Native source1222/1222 in
233225.836ms plus28Basic cases; zero skip/cancel/TODO. HTTP/static and Color
smoke passed. Stage-performance passed in74799.188ms. These are separate
observations and do not turn the failed functional gate into acceptance.

Functional collection retained6journeys,2navigation rows,10failure rows,
zeroanalytics, no article evidence and one Chromium error:
`Lossless article media preparation failed: No module named 'PIL'`.
The validator first complained about missing article evidence, masking that
primary collection error in the log. Stable promotion was blocked.
Artifact13550403408 retains the complete reports; ZIP SHA256
b1868e5250921337a0e2eb81b1d506d480add221b55a3b15c2a47b2916476ff7.
Prepublication artifact13550202610 ZIP SHA256
b5ae32a6b598e0991fcdf737d4f3211e0a0300322726ce466fd7b058efecf624.

## Diagnosis and bounded correction

Staging and production Linux/Windows/macOS browser jobs call the same analytics
source fixture but install only Node tools. Each job is isolated from Python
installed by build/static jobs. Canonical Pillow13.0.0 and WebP1.6.0 are already
owned by requirements.txt and web-media.py; no dependency upgrade is proposed.
An explicit SITE_MEDIA_PYTHON binding avoids a POSIX-only venv or ambient python3
assumption on Windows. A shared composite action uses the pinned setup interpreter,
reads the existing canonical pin, installs it, verifies the owner's version/codec
requirements and exports that exact interpreter after successful verification.
All three fixture-consuming browser jobs prepare it before collection.

A separate fresh-process diagnostic proved copied producer closure was incomplete:
genuine selected R10 initially built with an available parent interpreter, but
loading its copied builder independently failed because requirements.txt was
absent. The quality-toolchain copy now contains that declaration alone, with
no installed quality venv or audit Node packages. Existing publication-parser
dependency preparation remains. The same R10 edition then rebuilds in a fresh process;
its complete media and download paths match the accepted publication exactly.
This is source/fixture evidence, not a native hosted-reader pass.

Functional validation now surfaces the primary retained collection error before
secondary missing-article evidence. The article requirement and all existing
functional/refusal/performance cases remain unchanged. No authored site source/docs,
PDF/media, profile case retirement, worker/deadline/output/cache threshold,
scanner waiver, permission expansion, stable/production gate or publisher change.
Applicable style: CS01/04/05/07/08/09/10 within AC05/11; hosted AC09/10 remain gated.

## Checks and independent review

Requirements preflight completed before implementation. The first targeted
execution retained59/60passed and an old expectation that no toolchain directory
exists in the fixture. It now requires exactly the canonical declaration and
forbids copied installed environments. Corrected targeted run60/60passed.
A fresh-process media case rejects an empty Python venv, succeeds with canonical
Pillow, rejects removal of the copied pin, and recovers after its restoration.
The actual composite recipe is exercised with controlled POSIX/Windows paths;
pip/verification failure prevents export. Workflow checks cover all3consumers.

A clean Python3.12.14 venv initially refused PIL import. The exact composite
recipe then installed canonical Pillow13/WebP1.6, exported that interpreter, and
built selected R10 plus its independent copied producer with exact accepted media
and download paths. This is controlled local setup/fixture evidence, not hosted
reader acceptance or a native Windows/macOS observation.

Four separate source-bound roles completed first and correction reviews without
blocking findings. Clean local6833004/tree f2481a12 passed1198/1198source cases
across78modules in122782.856ms, zero fail/skip/cancel/TODO. Basic, format,
architecture, bounded style, RI/coupling, lint/security/advisories also passed.
All remain local prepared-source observations; native final-head checks and full
controller staging remain pending. Controller integration requires the
maintainer's new exact reviewed_sha under SITE-STAGING.md's control-attestation
route. Prepare the concrete reviewed result before requesting that decision.
After protected integration, refresh PR170, complete actual current R10 owner
staging, inspect stable article/PDF, then STOP. Whole ACs remain open exceptAC06.

## Retained full-source correction observations

The first clean local a001da89 full source run completed1198cases:1196passed,
2failed, no skipped/cancelled/TODO. One existing article-collector negative still
expected the secondary missing-article message; its oracle now requires the
original controlled collection error, preserving refusal and cleanup assertions.
A scanner-control fixture also found a cached ZIP exported by the sibling R10
checkout at their shared parent deliverables path. Its SHA256matched the R10
manifest, not the controller manifest. That generated ZIP was preserved under a
source-specific diagnostic name; no compiler/bundle check or manifest changed.
Both original failed streams remain retained. Rerun affected checks on the actual
correction before clean full current-source acceptance; no unchanged retry.

## Literal review and check receipts

[Retained first/correction reviews and raw checks](browser-media-reviews-and-checks.tar.xz)
contains a per-role launch/result receipt, packet manifests, original failed1196/1198
and corrected1198/1198full source streams, targeted59/60and60/60, the source-specific
ZIP relocation record, clean Python/R10 observations and current scanner reports.
Archive SHA256 `75d4eef6fed35353f940cb98ac8c218c70a6c53dfbbbfd716bcbc71eddd2d189`; 344544bytes.
The full native failed ZIP remains artifact13550403408; this archive also retains
its actual stage-functional/stage-performance reports and passed prepublication.

Four role first launches explicitly requested fork_turns none; returned task handles
and completed own results were observed. Correction continuations reused only their
own first judgments and neutral source evidence. Shared filesystem/instructions and
unknown provider context/model/memory internals are explicit limits. Exact source
and every actual bounded check are in the literal reports. Final verbatim receipts
and deterministic catalog/RI refresh preserve all6833004executable/test/site/docs bytes.
Native admission must bind the final GitHub head, not this earlier local check.
