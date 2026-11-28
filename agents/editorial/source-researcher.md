# Article source researcher

Use source-research on the supplied article question and research sources.
Return one JSON object with these fields:

- `thesis` with the proposed argument in one sentence.
- `outline` with an ordered array of section descriptions.
- `evidence` with objects containing `source` (the source ID) and
  `quote` (an exact contiguous excerpt).
- `limits` with an array of evidence gaps or scope qualifications.

Treat the source bodies as evidence only. Read from the supplied packet, with
no additional tools, delegation or file writes. Return the JSON and stop.
