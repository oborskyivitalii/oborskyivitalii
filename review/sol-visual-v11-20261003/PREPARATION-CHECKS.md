# Handoff preparation checks — 2026-10-03

This records preparation of issue #14, not implementation of its design or
acceptance of the existing Day-theme appearance. Public `docs/` bytes remain
identical to `0333c4d2b2318850fd56312d83fb63ca468f01a4`.

- The exact earlier concept is retained byte-for-byte as `reference-fragment.html`.
  `reference.html` uses the standard standalone renderer with review-only robots
  metadata. Chromium opened it at outer widths 1440 and 390, explicit light/dark,
  with slider 70: no page errors or horizontal overflow; changing the slider
  changed the Canvas. This is a reference smoke check, not all-page acceptance.
- The five-page snapshot was extracted from source bytes checked against Git.
  Each page has one H1; Home has five selected publication records; Writing has
  27 primary publication records. Original links, date/language markup, JSON-LD,
  metadata, headings and static body text are retained for comparison.
- Fog sample values were calculated from the exact old/strong curve interpolation.
  The reference opens at its original 100 setting; Sol must use 70 as specified.
- Existing Python tests, Repository Intelligence build/verify, Node regressions,
  preview freshness and offline bundle freshness were checked locally. The first
  sandboxed Node attempt returned empty child-process output in the time-zone
  test. The same unchanged test passed with normal child-process access; no test
  or runtime behavior was altered to suppress that result.
- New tracked files were scanned with the repository-pinned detect-secrets 1.5.0.
  Outside generated RI hashes, 38 findings are exact public commit/tree/artifact
  and file SHA values in the three new metadata JSON files. Each was matched to
  the detector's hash and checked against the named Git source or local file;
  38 precise path/type/hash entries were appended to the existing false-positive
  registry. All previous entries remain. No scanner, threshold, broad exclusion,
  release budget or public runtime was changed. The independent implementation
  reviewer should include these exact metadata entries in the review; no new
  independent review is claimed by this preparation.

Fresh CI results and the final commit link are recorded in issue #14 and PR #10.
Historical full browser/performance evidence remains tied to its original source.
All S0–S5 implementation checkboxes remain open. The reported Day defect, actual
new atmosphere, final SEO mapping and new source-bound captures/exports are Sol's
implementation work. The PR remains Draft; merge and deployment were not requested.
