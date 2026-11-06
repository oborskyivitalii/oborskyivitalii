# R7 — independent White-box QA first judgment

Role/task: `/root/r7_whitebox`; nonauthor; first result. Launch reported explicit `fork_turns="none"`, model and effort omitted. Provider model/context internals and parent launch-tool acceptance are not independently observable here. No current peer reports, requirements preflight, MEMORY, private history or parent scratch notes were read.

## Verdict

PASS for the bounded swap/preservation invariants, subject to the raw results and limits below. No source defect found. Full conference acceptance, author approval, physical projection and timed rehearsal are outside this execution. Candidate is a prepared staged subset in a dirty checkout, not a clean commit.

## Risk → structural fault → scenario → oracle → route

| Case | Protected invariant and fault | Independent oracle / owner |
|---|---|---|
| C1 | Wrong/stale candidate or modified predecessor | Manifest hashes and git base; issue109 AC02/04; manual diagnostic |
| C2 | Permutation loses/duplicates slides or edits layout | Actual presentation relationships; exactly five payload edits; footer reversal; AC01/02/13/14 |
| C3 | Notes bind to wrong slide or speech drifts | Actual note relationships, exact R6 bodies, historical R13 sections; AC01/02 and AC11–19 |
| C4 | Export order/text/link/render drift | Actual final PDF versus mapped R6 pages; text, links, rendered pixels; AC01/02/04/07 |
| C5 | Nonreproducible output/destructive overwrite | Scratch reproduction, existing-output rejection and original-byte preservation; AC09/10 |
| C6 | Broken edition count/hash contract | Existing tools/presentations/validate_edition.py; AC04/09 |

Allocation: six targeted issue109 manual/diagnostic cases under SITE-CHECK-PROFILES; no new permanent CI tests or hosted suite. No branch-coverage measurement. No accepted source/tests changed. Temporary scratch output removed after checks.

## Execution accounting and limits

First Python heredoc exited 1 after C1/C2 passed: reviewer relationship resolver retained the leading slash in legal package-root targets, yielding a nonexistent `/ppt/slides/_rels/slide1.xml.rels` ZIP path. This was a reviewer harness defect, not candidate failure. Diagnosis: normalize package-root targets by stripping the leading slash. Follow-up changed that resolver and continued C3–C6; C1/C2 evidence was reused, not blindly rerun. No candidate fix was made.

Checks use Python stdlib, PyMuPDF and NumPy. PDF raster comparison is 72 dpi and does not substitute for a human projection or native PowerPoint observation. R13 comparisons normalize whitespace only; R6→R7 attached note text compares exactly after the authorized label reversal. All 23 relationships and all media payloads remain byte-identical. QR decoding was not separately rerun in this bounded allocation; unchanged closing-page pixels/native media establish preservation but do not independently establish decoded destination. Error branches beyond existing-output rejection (wrong hash, invalid permutation, malformed IDs/XML, interrupted output) were inspected in source but not executed. No export regeneration or browser/UI actions were performed.

## Raw results

### C1 identity (completed first invocation)

```json
{
  "packet_sha256": "5d5d4d4e48626c67b8c6efff066309c61b590bf20c8c9d019db3eaae936abc92",
  "manifest_entries": 33,
  "mismatches": [],
  "git_base": "75ca39219685dc279ec8301ed7602d4769201b3f",
  "base_R6_pptx_pdf_and_R13_equal": true
}
```

### C2 native mapping/payload (completed first invocation)

```json
{
  "actual_order": [
    1,
    2,
    4,
    3,
    5,
    6,
    7,
    8,
    9
  ],
  "inventory_equal": true,
  "members": 58,
  "changed": [
    "ppt/presentation.xml",
    "ppt/slides/slide3.xml",
    "ppt/notesSlides/notesSlide3.xml",
    "ppt/slides/slide4.xml",
    "ppt/notesSlides/notesSlide4.xml"
  ],
  "exact_allowed_set": true,
  "footer_only_changes": [
    true,
    true
  ],
  "unchanged_relationships": 23
}
```

### C3 nine notes/R13

```json
[
  {
    "delivery": 1,
    "source": 1,
    "note": "ppt/notesSlides/notesSlide1.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  },
  {
    "delivery": 2,
    "source": 2,
    "note": "ppt/notesSlides/notesSlide2.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  },
  {
    "delivery": 3,
    "source": 4,
    "note": "ppt/notesSlides/notesSlide4.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  },
  {
    "delivery": 4,
    "source": 3,
    "note": "ppt/notesSlides/notesSlide3.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  },
  {
    "delivery": 5,
    "source": 5,
    "note": "ppt/notesSlides/notesSlide5.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  },
  {
    "delivery": 6,
    "source": 6,
    "note": "ppt/notesSlides/notesSlide6.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  },
  {
    "delivery": 7,
    "source": 7,
    "note": "ppt/notesSlides/notesSlide7.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  },
  {
    "delivery": 8,
    "source": 8,
    "note": "ppt/notesSlides/notesSlide8.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  },
  {
    "delivery": 9,
    "source": 9,
    "note": "ppt/notesSlides/notesSlide9.xml",
    "label_ok": true,
    "preserved": true,
    "r13_equal": true,
    "markdown_contains_all_note_text": true
  }
]
```

### C4 PDF page/text/links/pixels

```json
{
  "pagecounts": [
    9,
    9
  ],
  "pages": [
    {
      "page": 1,
      "source": 1,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 0,
      "changed_pixels": 0,
      "changed_pixel_bounds": null
    },
    {
      "page": 2,
      "source": 2,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 0,
      "changed_pixels": 0,
      "changed_pixel_bounds": null
    },
    {
      "page": 3,
      "source": 4,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 0,
      "changed_pixels": 35,
      "changed_pixel_bounds": [
        906,
        521,
        911,
        528
      ]
    },
    {
      "page": 4,
      "source": 3,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 0,
      "changed_pixels": 47,
      "changed_pixel_bounds": [
        888,
        520,
        893,
        528
      ]
    },
    {
      "page": 5,
      "source": 5,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 0,
      "changed_pixels": 0,
      "changed_pixel_bounds": null
    },
    {
      "page": 6,
      "source": 6,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 0,
      "changed_pixels": 0,
      "changed_pixel_bounds": null
    },
    {
      "page": 7,
      "source": 7,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 0,
      "changed_pixels": 0,
      "changed_pixel_bounds": null
    },
    {
      "page": 8,
      "source": 8,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 0,
      "changed_pixels": 0,
      "changed_pixel_bounds": null
    },
    {
      "page": 9,
      "source": 9,
      "dimensions_equal": true,
      "text_equal_except_label": true,
      "links_equal": true,
      "link_count": 3,
      "changed_pixels": 0,
      "changed_pixel_bounds": null
    }
  ]
}
```

### C5 reproduction and overwrite rejection

```json
{
  "command": [
    "/opt/codex/runtimes/codex-primary-runtime/dependencies/python/bin/python",
    "tools/presentations/reorder_native_slides.py",
    "--source",
    "drafts/devcon-romania-2026/r6/devcon-romania-2026-r6.pptx",
    "--recipe",
    "drafts/devcon-romania-2026/r7/reorder-recipe.json",
    "--output",
    "/tmp/r7-whitebox-tc_ojnrd/reproduction.pptx"
  ],
  "success_exit": 0,
  "candidate_byte_equal": true,
  "negative_exit": 1,
  "negative_stderr": "Native slide reorder refused: Output already exists",
  "existing_bytes_preserved": true
}
```

### C6 edition validator

```json
{
  "command": [
    "/opt/codex/runtimes/codex-primary-runtime/dependencies/python/bin/python",
    "tools/presentations/validate_edition.py",
    "drafts/devcon-romania-2026/r7"
  ],
  "exit": 0,
  "stdout": "OK R7: {'pptx': {'bytes': 1422905, 'sha256': 'ec8478a8c55d7db17a922e761a137759cb4c2de86b135f9153b709f76c7a9b29'}, 'pdf': {'bytes': 1114624, 'sha256': '7056f7423652563aaeafe722a22ab6b139e77c4e630710dd90eaf02aa59d8517'}, 'notes': {'bytes': 35191, 'sha256': '0d98a801a8f1af30ecf1716c37bff8a819cc19cb31eea4fd876f409560373945'}, 'pptx_slide_count': 9, 'pptx_notes_count': 9, 'pdf_page_count': 9}\n",
  "stderr": ""
}
```

## Source identities

- Packet SHA-256: `5d5d4d4e48626c67b8c6efff066309c61b590bf20c8c9d019db3eaae936abc92`.
- Base: `75ca39219685dc279ec8301ed7602d4769201b3f`.
- `agents/reviewers/README.md`: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- `agents/reviewers/white-box-qa.md`: `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`.
- `review/issue-109/r7-reviewer-receipts/request.md`: `61ec228672cdc8717c2769f7338f49b0c05c9b890a2b8a37f096cfecea26e0e3`.
- `.github/acceptance/issue-109.json`: `5127a6003b4d425005c7470283758e8c412ce394ad8860c1f1e92f8245298eaa`.
- `tools/presentations/reorder_native_slides.py`: `9423597518bee6ea2fcbb8e5c57b7e0d997f4612901c929a8597c7e8e4ae9225`.
- `drafts/devcon-romania-2026/r7/devcon-romania-2026-r7.pptx`: `ec8478a8c55d7db17a922e761a137759cb4c2de86b135f9153b709f76c7a9b29`.
- `drafts/devcon-romania-2026/r7/devcon-romania-2026-r7.pdf`: `7056f7423652563aaeafe722a22ab6b139e77c4e630710dd90eaf02aa59d8517`.
- `drafts/devcon-romania-2026/devcon-romania-2026-r13-concise-stage-script.md`: `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84`.

## C2 targeted completion and final disposition

To close the remaining mutation-scope risk, compared note XML bytes after only reversing the authorized delivery label, and presentation XML bytes outside the slide-ID list. Both notes and the presentation remainder match exactly. This is completion of C2, not a new test case.

```json
{
  "ppt/notesSlides/notesSlide3.xml_only_label_changed": true,
  "ppt/notesSlides/notesSlide4.xml_only_label_changed": true,
  "presentation_outside_slide_list_byte_identical": true
}
```

No actionable findings (no P0/P1/P2/P3 defects). All six cases completed: native mapping and preservation, nine matching notes/R13 sections, final PDF text and three closing-page links, native byte reproduction, overwrite refusal and edition validator pass. PDF differences occur only in the two renumbered footer regions: 35 pixels at x906–911/y521–528 and 47 pixels at x888–893/y520–528 at 72 dpi; every other mapped page is pixel-identical. The retained native source remains editable by payload identity; native PowerPoint editing behavior was not exercised. Primary request and ACs were interpreted directly; candidate proof was not used as oracle. This first judgment does not approve unobserved conference/release gates.
