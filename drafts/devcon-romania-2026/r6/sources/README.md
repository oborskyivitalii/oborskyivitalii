# R6 native input provenance

These retained input copies reproduce the approved integration. They are source
inputs to repository edition **R6**, not additional repository editions.

- `scratch-r13-native-full-deck.pptx` is the complete nine-slide conversation input
  originally named `devcon-romania-2026-r13-final.pptx`. Its R13 label identifies
  the native speech revision in scratch history. It does not declare a repository
  R13 edition or conference-final status.
- `approved-slide-04-native.pptx` is the approved one-slide native donor from the
  `systemic-first` preview. Its slide and notes XML replace slide 4 and notes 4.
- `approved-slide-04-preview.png` retains the approved visual reference. It is not
  embedded as a replacement for the editable slide.
- `slide-05-spacing-donor-full-package.pptx` copies the full original native input
  and changes only slide 5's shape 30 vertical position. It is a native layout
  donor, not another repository edition. `slide-05-spacing-recipe.json` records
  the exact source and donor hashes and the single-coordinate change.
- `provenance.json` records the original local paths, exact byte counts and SHA-256
  identities. Both standalone input files remain unchanged.

The integration changes only slide 4, notes 4 and the documented slide 5 geometry.
The other 55 package payloads and every relationship remain unchanged. It preserves
all R13 spoken sections. The slide 4 donor appends explanations and citations after
the existing nonspoken reference-notes boundary.

On slide 5, shape 30, `Scope Disposable implementation`, moves from y=4069079 to
y=4196079 EMU, a downward move of exactly 10 points. Its x=4599432, cx=3054096,
cy=338328, wording, font, anchor and other properties remain unchanged. Shape 29's
two-line heading and shape 31's question remain unchanged. This separates the body
from the heading while retaining space above the question. The original PDF text
extents overlapped; the words were readable and no ink collision was established.

From the repository root, reproduce the bounded native integration into a new
scratch output:

```bash
python3 tools/presentations/integrate_native_slide.py \
  --source drafts/devcon-romania-2026/r6/sources/scratch-r13-native-full-deck.pptx \
  --donor drafts/devcon-romania-2026/r6/sources/approved-slide-04-native.pptx \
  --slide 4 \
  --donor-slide 1 \
  --output /tmp/devcon-romania-2026-r6-slide04.pptx

python3 tools/presentations/integrate_native_slide.py \
  --source /tmp/devcon-romania-2026-r6-slide04.pptx \
  --donor drafts/devcon-romania-2026/r6/sources/slide-05-spacing-donor-full-package.pptx \
  --slide 5 \
  --donor-slide 5 \
  --output /tmp/devcon-romania-2026-r6-candidate.pptx
```

The helper refuses an existing output or incompatible embedded dependencies.
Export the verified final PPTX with LibreOffice Impress's `impress_pdf_Export`
filter, following the repository's existing presentation rendition method.

If integration is interrupted during its new output write, retain that file for
diagnosis and retry with a fresh output path. The helper refuses to overwrite a
partial output; it does not implement atomic promotion or automatic cleanup.
