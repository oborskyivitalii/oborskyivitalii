# DevCon Romania 2026 — R9

R9 is the current author-review draft: nine editable slides with matching PDF
and attached notes. It follows R8 at
`9330c424b2dd66177de9e5e50db5f132b2c57001` in the same
[issue109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109) /
[Draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).

- [Editable PowerPoint](devcon-romania-2026-r9.pptx)
- [Matching PDF](devcon-romania-2026-r9.pdf)
- [Complete attached notes](speaker-notes.md)
- [Identity, source pins and hashes](edition.json)
- [Review and remaining acceptance](../../../review/issue-109/2026-11-02-r9-review.md)

## What changed

The second act now moves from the changed engineering problem (S06), to
architecture and project commitment (S07), to conditional authority during
operation (S08), then the sole overall conclusion (S09). R8 positions7/8 are
exchanged. R6/R13 source positions are now `1,2,4,3,5,6,8,7,9`.

S07 has two reading levels: the closed observe–decide–intervene–operate loop,
then control, operating and business-case evidence before delivery commitment.
The action boundary, feedback and conditional human architectural dependencies
stay visible. Missing evidence can lead to discovery, reduced scope, redesign
or no-go; a successful demo remains useful capability evidence.

S08 follows admit → monitor → reassess and act. The illustrative 196/3/1 example,
severity qualification, risk-conditioned exposure, service/behavior/control/
people monitoring, changing conditions beyond the app SHA and staffed fallback
remain visible. The privacy-leak example is hypothetical, not production data.

All nine slides were reviewed for alignment. Page markers are consistent;
headers and selected evidence qualifications have more usable frames. S05's
six hypotheses have consistent card spacing and no incomplete numbering.
No empirical findings were added. Source citations and qualifications remain
in the native notes. Media and all 23 relationship parts are identical to R8.

## Native source and reproduction

The exact R8 native input is pinned in `edition.json`. Three native donor layouts
were authored with Artifact Tool and integrated using the existing
`tools/presentations/integrate_native_slide.py`; the existing
`reorder_native_slides.py` then exchanged positions7/8. Native layout and
reference-label corrections were applied without flattening slides.

The `sources/` directory holds every changed OOXML payload, preserving its
package path. Reconstruct the delivered PPTX by replacing those entries in the
exact R8 package while retaining each original ZipInfo and archive comment:

```python
from copy import copy
from pathlib import Path
from zipfile import ZipFile

edition = Path("drafts/devcon-romania-2026/r9")
source = Path("drafts/devcon-romania-2026/r8/devcon-romania-2026-r8.pptx")
output = Path("/tmp/devcon-romania-2026-r9-reproduced.pptx")
with ZipFile(source) as old, ZipFile(output, "w") as new:
    new.comment = old.comment
    for entry in old.infolist():
        replacement = edition / "sources" / entry.filename
        data = replacement.read_bytes() if replacement.is_file() else old.read(entry.filename)
        new.writestr(copy(entry), data)
```

Verify the result against `artifacts.pptx.sha256` before exporting. PDF was
exported from that exact final PPTX with LibreOffice Impress. Re-export to a new
scratch directory; PDF metadata can differ, so also compare pages, text and links.

```bash
soffice --headless --convert-to pdf:impress_pdf_Export \
  --outdir /tmp/devcon-r9-export \
  drafts/devcon-romania-2026/r9/devcon-romania-2026-r9.pptx
python3 tools/presentations/validate_edition.py drafts/devcon-romania-2026/r9
```

All nine R13 spoken bodies remain unchanged. Only delivery labels and relevant
reference navigation were synchronized. The standalone R13 script and all
earlier editions stay historical. Native notes retain the inherited R8 addenda;
use the current delivery order, rather than the historical script's numbering.

## Acceptance boundary

Planning envelope: at most 23 minutes speaking and 7 minutes Q&A in the
30-minute slot. This is not measured rehearsal evidence. Older estimates in
inherited reference notes are historical. Exact R9 author review, English
rehearsal and the real presenting-device/projector check remain pending.
R3 remains event-selected; preparing R9 does not merge, publish or select it.
