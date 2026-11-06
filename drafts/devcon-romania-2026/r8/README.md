# R8 — human capacity and the control architecture

Source: complete R7 at `1044c6ee6effc3580ec735ead4f4f7f9ea26a069`.
R8 retains the swap of slides 3 and 4 and preserves the other seven slide visuals.

- S07 adds a fourth monitoring card: **PEOPLE / CAPACITY**, with availability,
  workload, queues and response time.
- S08 presents one closed **Sensors → Controller → Actuators → Controlled system**
  loop with returning outcome feedback and explicit pre-consequence constraints.
  Human sensing and decisions are attached to their components. Where the design
  relies on them, operators are an architectural dependency.
- A successful demo alone is insufficient. Assess whether the loop can detect
  failures, prevent or limit harm, support timely intervention and justify its
  full cost for the business case. Insufficient evidence can lead to discovery,
  narrower scope, redesign or no-go.

All elements are native/editable in the existing dark theme. The R13 source notes
remain exact prefixes; two labeled R8 delivery addenda explain the new visible
points. These addenda are not a timed rehearsal or a replacement historical R13
script. Event selection remains R3; this is an author-review draft.

## Source and generation

`sources/` retains the four changed native OOXML payloads. The complete native
source is the R8 PPTX itself; no image-only slide or PDF is used for editing.
The existing `tools/presentations/integrate_native_slide.py` integrated compatible
native donors for positions7 and8 while verifying unchanged dependencies and
complete source-note prefixes. No presentation engine/helper was changed.

The native finalizer verifies nine slides, package integrity, geometry, Arial
policy and Artifact Tool import. PDF export uses the existing Impress filter:

```bash
soffice --headless --convert-to pdf:impress_pdf_Export \
  --outdir /tmp/devcon-r8-export \
  drafts/devcon-romania-2026/r8/devcon-romania-2026-r8.pptx
python3 tools/presentations/validate_edition.py drafts/devcon-romania-2026/r8
```

The four source payloads, exact source/output hashes and preservation observations
are recorded in `edition.json` and the [R8 review](../../../review/issue-109/2026-11-02-r8-review.md).
Earlier editions remain immutable. Re-exported PDF metadata can differ; compare
page text, links and rasters rather than assuming byte-identical PDFs.
