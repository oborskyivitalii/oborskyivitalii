# R7 native reorder provenance and reproduction

R7 exchanges R6 delivery positions 3 and 4. It preserves the nine native slides,
all content and layout, and the R13 spoken wording. Its source is the complete R6
package at commit `75ca39219685dc279ec8301ed7602d4769201b3f`. R7 is an author-review
draft. It does not replace the event-selected R3 or establish author approval,
timed rehearsal, presenting-device acceptance, merge or publication.

| R7 delivery position | R6 / historical R13 source position | Content                              |
| -------------------- | ----------------------------------- | ------------------------------------ |
| 1–2                  | 1–2                                 | Opening and delivery system          |
| 3                    | 4                                   | Review, understanding and ownership  |
| 4                    | 3                                   | Qualified empirical evidence         |
| 5–9                  | 5–9                                 | Responses, runtime control and close |

## Exact bounded changes

`reorder-recipe.json` pins the complete R6 input SHA-256 and the original slide
part order. The helper changes exactly five of the 58 ZIP payloads:

- `ppt/presentation.xml`: exchange the third and fourth slide IDs.
- `ppt/slides/slide3.xml`: shape 56 footer `03` becomes `04`.
- `ppt/slides/slide4.xml`: shape 36 footer `04` becomes `03`.
- `ppt/notesSlides/notesSlide3.xml`: stage-script delivery label `03` becomes `04`.
- `ppt/notesSlides/notesSlide4.xml`: stage-script delivery label `04` becomes `03`.

All other 53 payloads and all 23 relationship parts remain byte-identical. The
internal slide and note filenames keep their source identities. The slide list
controls delivery order; existing relationships keep each note with its slide.
No native content is flattened, regenerated or imported as an image.

`speaker-notes.md` follows the new delivery order. Each native spoken section,
after its delivery heading, matches R6 exactly; the reference sections also match
exactly. The historical standalone R13 script remains unchanged at SHA-256
`8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84`.

## Nonspoken continuity effects

Two preserved reference-note transitions on source slide 4, now R7 slide 3, are
less immediate after the exchange. “Our research examples measured activity,
merges, releases and structure, not how well a team understands its system.” now
anticipates the larger evidence page. Later the notes say the wider system
“brings us to the next question of what can replace manual inspection.” The
evidence page now intervenes before the response hypotheses on slide 5. These
sentences are outside the stage script and retain their source wording. No
spoken transition requires rewriting for this reorder.

## Reproduction

From the repository root, use a fresh scratch output path:

```bash
python3 tools/presentations/reorder_native_slides.py \
  --source drafts/devcon-romania-2026/r6/devcon-romania-2026-r6.pptx \
  --recipe drafts/devcon-romania-2026/r7/reorder-recipe.json \
  --output /tmp/devcon-romania-2026-r7-candidate.pptx
```

The recipe reproduces the native PPTX bytes. The helper rejects a wrong input
hash, invalid permutation, different source order, unexpected footer text/ID,
missing or repeated note header, changed package inventory, and an existing
output. It preserves ZIP entry metadata. If writing is interrupted, retain the
partial output for diagnosis and retry at a new path; the helper refuses to
overwrite it and does not promise atomic promotion.

The build used the existing presentation `finalizePresentation` workflow with
nine slides, Arial reference-font policy, source dimensions 12192000 × 6858000
EMU, native package integrity, bullet geometry, heading fit and Artifact Tool
import checks. Its reference-font source was the unchanged R6 input
`../r6/sources/scratch-r13-native-full-deck.pptx` at SHA-256
`6e62b5b83c55fa09e63cf25806bdcf4472ffe313e89b85d1f26d1484c777ebbf`.
The finalized PPTX matches the candidate bytes exactly.

Export the final PPTX through the existing native LibreOffice Impress filter:

```bash
soffice -env:UserInstallation=file:///tmp/devcon-r7-reproduction-lo \
  --headless --convert-to pdf:impress_pdf_Export \
  --outdir /tmp/devcon-r7-reproduction \
  drafts/devcon-romania-2026/r7/devcon-romania-2026-r7.pptx
```

A new PDF export can have different metadata bytes. Compare its page text,
links and rendered pixels to the retained PDF, and verify the QR code, rather
than assuming identical PDF bytes. This rendition retains native text/vector
content and links; PNG renders are inspection outputs only.
