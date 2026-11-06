# Presentation edition versioning

Use this contract for repository-owned presentation artifacts.

## Revision identity

- A repository edition is named `R<number>`: `R1`, `R2`, `R3`, ...
- Increment the revision when a coherent package is retained for author or reviewer comparison.
- Do not use nested public labels such as `R5 v2`, `R5-final`, or `final-final`.
- Status is separate from revision identity: `draft`, `author-review-draft`, `approved`, or `conference-final`.
- Scratch exports may use local working names, but they do not become repository editions and must not be cited as durable artifacts.
- When several scratch labels have accumulated outside the repository, consolidate them into the next single repository revision and record the aliases in `edition.json`.

## Required edition package

Store each retained edition in `drafts/<event>/rN/` with one revision number across all files:

- `<event>-rN.pptx` — editable native source;
- `<event>-rN.pdf` — rendition exported from that exact PPTX;
- `speaker-notes.md` — human-readable script or cues synchronized with attached PPTX notes;
- `edition.json` — identity, source pins, slide count, timing status, hashes, predecessor and acceptance state.

Optional renders and review packages may be generated locally or stored under a dated review path. They are not the editable source.

## Immutability and progression

1. Preserve an edition after it has been retained for comparison.
2. Make substantive changes in a new `R<number>` directory.
3. Use Git history for mechanical corrections made before an edition is presented to the author.
4. Never replace or relabel an older edition as a newer one.
5. The next revision is `max(repository editions) + 1`; chat names and temporary file names do not reset it.

## Status and selection are different

- `current_author_review` identifies the newest package being reviewed.
- `event selection` identifies the exact PDF currently bound to an event record.
- `approved` records author acceptance of an exact package.
- `conference-final` additionally requires timing and presenting-device acceptance.
- `published` is a separate distribution decision.

A newer author-review edition does not silently replace the event-selected or published artifact.

## Manifest rules

`edition.json` must record at least:

- event slug, revision and status;
- issue and pull request;
- predecessor edition and immutable source commit;
- any consolidated scratch aliases;
- PPTX/PDF/notes paths, byte sizes and SHA-256 values;
- slide count and PDF page count;
- native notes count;
- source repositories and pinned commits;
- timing target and whether rehearsal has verified it;
- QR target where applicable;
- event-selection and acceptance status.

## Validation

Run:

```bash
python tools/presentations/validate_edition.py drafts/<event>/rN
```

The validator checks package naming, hashes, byte sizes, PPTX slide/notes counts and PDF page count. It does not establish content quality, source correctness, QR readability, timing, author acceptance or projector compatibility; those remain explicit review gates.
