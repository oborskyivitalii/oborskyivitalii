# R8 White-box QA — metadata correction

**Verdict: provenance finding resolved.** Targeted continuation of `/root/r8_whitebox`; first receipt preserved.

Compared retained `edition-before-provenance-correction.json` with the current manifest. Their sole JSON value change is `pdf_export.method`: “exact final R7 PPTX” becomes “exact final R8 PPTX”. Compared initial/final packet entries: only the manifest identity changed. Recomputed all final-packet file hashes; all matched. Final assertions exited0.

Final packet (`candidate-final-packet.json`) SHA256: `f92fd8c31460cbddb1ce1ea322f63483f353b5a35c3aa92c2040f9c8c483375e`.
Manifest SHA256: `b74de7f91e7ac8c5ed62187a1f9c07b25a147d1f29f229d94e170e43c41b756b`.

A preliminary probe used the retained initial packet and failed its final-digest assertion; locating the separately named final packet resolved that probe error.

Original structural checks remain applicable to unchanged artifacts. No broad tests, artifact edits or external writes. This is not a fresh first review. PowerPoint UI, physical projection, links and rehearsal remain unobserved; provider internals remain unknown.
