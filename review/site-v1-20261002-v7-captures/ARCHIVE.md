# Historical v7 capture archive

The 7 loose contact-sheet/recording copies listed below were removed under
[issue189](https://github.com/oborskyivitalii/oborskyivitalii/issues/189).
Their exact originals remain in [the existing ZIP](../site-v1-20261002-v7.zip),
with the full original relative directory layout. Other captures in this folder remain.
This guide is a locator, not replacement media or visual acceptance.

- ZIP SHA256: `f6675361394d7d9caba65e6d127c397535f5cb6b705cdcfd806f559581014df6`
- ZIP bytes: 11065237
- [Every-file recovery index](../issue-189/archive-index.json)
- [Gallery locator](../site-v1-20261002-v7-index.html)

## Restore the complete gallery

From the repository root, extract into a new temporary directory:

```sh
restore_dir="$(mktemp -d)"
shasum -a 256 review/site-v1-20261002-v7.zip
unzip -q review/site-v1-20261002-v7.zip -d "$restore_dir"
printf '%s\n' "$restore_dir/review/site-v1-20261002-v7-index.html"
```

Compare the ZIP checksum above, then open the printed HTML path. Keep the
extracted `review/` directory together: the gallery uses relative media links.
The [original gzip HTML](../site-v1-20261002-v7-index.html.gz) is also preserved;
its HTML alone does not restore those relative media files. Do not extract over
this working tree merely to inspect old evidence.

## Recover one original

The ZIP member equals the original repository path: `review/site-v1-20261002-v7-captures/<filename>`.
For example, from the repository root:

```sh
restore_dir="$(mktemp -d)"
unzip -p review/site-v1-20261002-v7.zip review/site-v1-20261002-v7-captures/credits-motion.webm > "$restore_dir/credits-motion.webm"
shasum -a 256 "$restore_dir/credits-motion.webm"
```

Compare its checksum with the table. The JSON index records every original path,
size, SHA256, Git blob, archive/member and individual command. Historical JSON
manifests still refer to original archived bytes; they have not been rewritten.
The removed loose-media URLs on this branch are recovered through the ZIP/index;
Git-pinned historical originals remain available.

| Filename | Original bytes | SHA256 |
| --- | ---: | --- |
| `credits-motion.webm` | 554545 | `d8956d2ff1676cd01f3b8dcbb874536ffc02e58e3d224204ade185b16b0c4f80` |
| `desktop-contact-sheet.png` | 871862 | `bcf8416f6b348224f0586a3c1412e1a2e28321c3ba627b6cc71ab1ac59b9eb30` |
| `index-motion.webm` | 655138 | `27393e9f396f4d3ab785068202ce006ff7b9178322114b9b43d87e37e9348823` |
| `mobile-contact-sheet.png` | 645910 | `bb965d0d311b65ce94784fb5bf82735f02da93d0f7ecc4138a289850d4250e2e` |
| `research-motion.webm` | 624890 | `0b08ed27776ba58d34d9ec09fbfd34ccf8841ad237d7375b1d2f2d5cffe4c8b1` |
| `talks-motion.webm` | 496684 | `578cbc66673e471004a08e4cfc001c5c6252b7d486ec20ad4dd9d4c0602a11f8` |
| `writing-motion.webm` | 647006 | `a3bfd239334323a15fb80e41aca24c8f0e4902e1d178203712f85ed74d1c3831` |
