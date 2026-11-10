# Historical v5 capture archive

The 7 loose contact-sheet/recording copies listed below were removed under
[issue189](https://github.com/oborskyivitalii/oborskyivitalii/issues/189).
Their exact originals remain in [the existing ZIP](../site-v1-20261002-v5.zip),
with the full original relative directory layout. Other captures in this folder remain.
This guide is a locator, not replacement media or visual acceptance.

- ZIP SHA256: `721900d71fc91b9db33aa2758fab8d73f092bdfd811d4e5933ac6e2be3273ef1`
- ZIP bytes: 10266858
- [Every-file recovery index](../issue-189/archive-index.json)
- [Gallery locator](../site-v1-20261002-v5-index.html)

## Restore the complete gallery

From the repository root, extract into a new temporary directory:

```sh
restore_dir="$(mktemp -d)"
shasum -a 256 review/site-v1-20261002-v5.zip
unzip -q review/site-v1-20261002-v5.zip -d "$restore_dir"
printf '%s\n' "$restore_dir/review/site-v1-20261002-v5-index.html"
```

Compare the ZIP checksum above, then open the printed HTML path. Keep the
extracted `review/` directory together: the gallery uses relative media links.
The [original gzip HTML](../site-v1-20261002-v5-index.html.gz) is also preserved;
its HTML alone does not restore those relative media files. Do not extract over
this working tree merely to inspect old evidence.

## Recover one original

The ZIP member equals the original repository path: `review/site-v1-20261002-v5-captures/<filename>`.
For example, from the repository root:

```sh
restore_dir="$(mktemp -d)"
unzip -p review/site-v1-20261002-v5.zip review/site-v1-20261002-v5-captures/credits-motion.webm > "$restore_dir/credits-motion.webm"
shasum -a 256 "$restore_dir/credits-motion.webm"
```

Compare its checksum with the table. The JSON index records every original path,
size, SHA256, Git blob, archive/member and individual command. Historical JSON
manifests still refer to original archived bytes; they have not been rewritten.
The removed loose-media URLs on this branch are recovered through the ZIP/index;
Git-pinned historical originals remain available.

| Filename | Original bytes | SHA256 |
| --- | ---: | --- |
| `credits-motion.webm` | 468472 | `ee3808d10d658bdfcebe48f0dd4669c2f43b52ba34928b552ad1209339cf9aa0` |
| `desktop-contact-sheet.png` | 937144 | `cde4a620b0eaa77ecd88d9c89a37e442a399ad4dcbbc41506a6a7fa47754fbc2` |
| `index-motion.webm` | 427494 | `eb1fdba70a41ca06b0f9b25eb1ed489be1cc7565715d60a588ef5ab2ed682ed7` |
| `mobile-contact-sheet.png` | 666631 | `8616d6edf20ec2c1de4f6dce8acdffa8796ca3e99223dd73ec1c1392f929ef48` |
| `research-motion.webm` | 425564 | `0d8139f7abda392af23bcb0dcc28c137002e3c4c4fb5429d6a0c985f47c05f29` |
| `talks-motion.webm` | 415650 | `31ae6c1a73caaf5f0c0758851ec2e82e69d6dad8a0d378d4839acb9c24944387` |
| `writing-motion.webm` | 522466 | `40993d1c7981d720a07731ed72bf58cf5b28ceeb9770d42429a2b36c699f6e01` |
