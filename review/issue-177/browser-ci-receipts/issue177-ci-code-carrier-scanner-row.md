# Issue177 — exact public producer-checksum classification

2026-11-08; Code reviewer `/root/issue177_ci_code`, nonauthor continuation; exact source `15a0135f8ea46d00b4839497e4ad7a11ca08d146`. No edits, external writes or delegation.

Independently recomputed SHA256 of current `tools/site/build.cjs`: `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee`. It exactly equals `review/issue-169/writing-carrier.json` producerChanges build afterSHA256. Independently computed SHA1 of that public checksum's ASCII hex value: `ddf7672816a81ef61d7b69a08375380fbd7defe2`.

This is a public source-byte fingerprint, not an authentication credential. Approve bounded false-positive disposition for exactly:

- path `review/issue-169/writing-carrier.json`
- rule `Hex High Entropy String`
- hashed identity `ddf7672816a81ef61d7b69a08375380fbd7defe2`

The reason should name current build SHA256 recomputation and canonical public carrier producer binding. Append one exact row only; preserve all predecessor rows/reasons and scanner/budget configuration. No wildcard/path-wide allowance justified. The row had not yet been added when reviewed; this approves classification and exact scope, not final manifest integration or repeated scanner execution. Earlier canonical carrier proofs remain applicable to unchanged bytes. Clean63/63 result supplied by parent is not newly executed by this reviewer.
