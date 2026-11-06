# DevCon Romania R10

Nine-slide article-aligned author-review edition, revised 6 November 2026.
Owner: [issue109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109)
with the same [Draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).

- [Editable PowerPoint](devcon-romania-2026-r10.pptx)
- [Matching deck PDF](devcon-romania-2026-r10.pdf)
- [Full speech and nonspoken cues/sources](speaker-notes.md)
- [Reading speech PDF](devcon-romania-2026-r10-speech.pdf)
- [Edition identity and hashes](edition.json)
- [Source-bound review](../../../review/issue-109/2026-11-06-r10-review.md)

## Source and scope

R10 follows repository R9. The delivered 3-Nov external R12 is the content
baseline, bound by existing external file IDs and hashes in `edition.json`; it is
not duplicated here, and is not a repository edition or the older
R12 concise script. Article R10 is retained from immutable commit
`fc205b17774ba703c63fdd7d142ddac178afffdd`. Manifest pins retain upstream PMDay
and earlier article provenance. This package retains existing native artwork,
editable diagrams, text, qualifications and links; historical editions remain
unchanged. Original content licensing and third-party media exceptions continue
under the repository licensing map; no institutional endorsement is inferred.

S01–S05 cover systemic diagnosis, admission and demand/adoption, verification
versus competent-ownership learning, corrected November evidence and contextual
operating models with empowered ownership and a bounded recovery-drill pilot.
All six hypothesis cards and Agarwal quantities remain. S06–S09 visible native
content, PDF pixels and spoken bodies match the delivered external R12 exactly.
All nine attached note bodies match the corresponding R10 speech section.

The older account-recovery-specific S06 wording is superseded by the authorized
frozen R12 treatment: acceptable runtime paths, evaluation, controls and fallback.
S08 retains the unsafe recovery-plan example and forbidden-outcome veto. Earlier
native notes retain inherited operating/control qualifications as nonspoken
references. This is a scope reconciliation, not a claim of new author acceptance.

## Re-export and validate

The imported native PPTX is the editable source; the PDF is its rendition.
Use a new scratch output directory. PDF metadata may differ; compare text,
links and all rendered pages rather than assuming byte-identical export.

```bash
soffice --headless --convert-to pdf:impress_pdf_Export \
  --outdir /tmp/devcon-r10-export \
  drafts/devcon-romania-2026/r10/devcon-romania-2026-r10.pptx
python3 tools/presentations/validate_edition.py drafts/devcon-romania-2026/r10
```

Spoken text: 1,434 words versus 1,423 in the exact external baseline (+11),
using whitespace tokens in nine spoken sections. The <=22-minute target is
planning only. Exact author acceptance, timed rehearsal, real projection and
Presenter View, full rights and independent reuse remain separate gates.
The event record still selects R3. No merge, selection or public release occurs.
