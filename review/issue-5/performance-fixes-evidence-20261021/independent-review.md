# Independent performance and archive receipts

Reviewer `/root/reader_loading_review` is separate from the implementer and did
not author the reviewed correction. Source, RF03/RF04/RF05 and R19 integration
receipts are preserved in the Q4 implementation record. No new measurements or
scanners were run during this final independent review.

## Final raw matrix — PASS

Copied verbatim from the separate reviewer on21October2026:

> Final independent Q4 performance review PASS (bounded local lab). Permanent validators revalidated all3stage raw reports and exact source/variant binding; all36 full LHRs match stored rows/configs/metrics,24 retained Trace/Devtools hashes match, and recomputed40-file public inventory exactly matches5f9df1b1…. Actual browser SHA matches declared153.0.8010.0 override; source remains clean. The single Q4 run is sequential06:16:30.909→06:31:57.400, all3exit0, artifactbefore/aftertrue, no retry. Exact coverage36LH/72shortwindows/24flights/120cycles/300.083ssoak. Reader mobile medianLCP2400.942ms (all3<2500), desktop521.110ms; all6reader LHRs load cover only/226363B. Primary10groups median scores99–100; reader mobile97. Max singleTBT172.5ms, all36CLS≤0.000697. All36Off/reduced windows zero callbacks/paints; CPU4paint maxp9525.2/33ms and maxidlebusy13.192/20%. Transition normalizedmax3020.7/3200ms (actualreadymax4264.9ms); other transition budgets pass. DOM/listeners unchanged acrossall3profiles; soak heap+859700B supporting observation, no leak claim. No remaining performance blocker within declared scope. Preserve Q3FAIL and qualify R18 causal comparisons versus finalR19; no managedCI/device/CDN/production or whole-issue acceptance implied. No new measurements/scanners by reviewer.

## Archive and exact restoration — PASS

Copied verbatim:

> Independent archive/restore verification PASS: all52 ZIP hashes+CRCs,753 unique regular-file members and2212 logical aliases match; restored inventory is exactly2212 files with every length/SHA correct, no extras. Total159318993 compressed bytes; max ZIP3485520B. Ukrainian report matches raw metrics, actual/equivalent readiness, heap qualification and R18/R19 limits. One factual wording correction before promotion: RF01/RF02 table says registry 'не знав нові bytes'; RF02 actually rejected the new fingerprint while all5 runtime bytes were unchanged. Please say 'не допускав нову ідентичність за незмінних runtime bytes'. Also ensure independent-review/native-readback and actualPR-head claims in the last paragraph are made true before final branch/comment promotion (they are still pending now). Finishing summary/upload-plan consistency checks; no new measurements.

Disposition: RF02 wording corrected exactly; report explicitly labels native
readback and actual PR-head promotion pending at this raw checkpoint. No source,
runtime, artifact or sample changes were made after Q4 acceptance.

## Native readback — pending at initial raw checkpoint

All uploaded native blob OIDs match their local Git object hashes. A subsequent
metadata-only child will record a fresh native Git readback of every archive,
manifest/member/alias hash and CRC, then final scope receipts will bind the
actual PR head. This pending entry is not a remote-readback PASS claim.

Refs #5
