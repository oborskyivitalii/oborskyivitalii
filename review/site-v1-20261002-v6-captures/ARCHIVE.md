# Historical v6 capture archive

The 5 loose contact-sheet/recording copies listed below were removed under
[issue189](https://github.com/oborskyivitalii/oborskyivitalii/issues/189).
Their exact originals remain in [the existing ZIP](../site-v1-20261002-v6.zip),
with the full original relative directory layout. Other captures in this folder remain.
This guide is a locator, not replacement media or visual acceptance.

- ZIP SHA256: `afe6784c18da5d5be6f4311d153e870bccd3ab7e8cb10275a883476b45a8cb42`
- ZIP bytes: 11726610
- [Every-file recovery index](../issue-189/archive-index.json)
- [Gallery locator](../site-v1-20261002-v6-index.html)

## Restore the complete gallery

From the repository root, extract into a new temporary directory:

```sh
restore_dir="$(mktemp -d)"
shasum -a 256 review/site-v1-20261002-v6.zip
unzip -q review/site-v1-20261002-v6.zip -d "$restore_dir"
printf '%s\n' "$restore_dir/review/site-v1-20261002-v6-index.html"
```

Compare the ZIP checksum above, then open the printed HTML path. Keep the
extracted `review/` directory together: the gallery uses relative media links.
The [original gzip HTML](../site-v1-20261002-v6-index.html.gz) is also preserved;
its HTML alone does not restore those relative media files. Do not extract over
this working tree merely to inspect old evidence.

## Recover one original

The ZIP member equals the original repository path: `review/site-v1-20261002-v6-captures/<filename>`.
For example, from the repository root:

```sh
restore_dir="$(mktemp -d)"
unzip -p review/site-v1-20261002-v6.zip review/site-v1-20261002-v6-captures/desktop-contact-sheet.png > "$restore_dir/desktop-contact-sheet.png"
shasum -a 256 "$restore_dir/desktop-contact-sheet.png"
```

Compare its checksum with the table. The JSON index records every original path,
size, SHA256, Git blob, archive/member and individual command. Historical JSON
manifests still refer to original archived bytes; they have not been rewritten.
The removed loose-media URLs on this branch are recovered through the ZIP/index;
Git-pinned historical originals remain available.

| Filename | Original bytes | SHA256 |
| --- | ---: | --- |
| `desktop-contact-sheet.png` | 1022390 | `4e6970584ca1ee28863daefbe293e15a689ec32b574d252f79d78474c115db76` |
| `index-motion.webm` | 423417 | `cfc466bd97723bbf76dc0d7971523ad0d633c13ea59210c50c5c0590bafb9b37` |
| `mobile-contact-sheet.png` | 711774 | `478a9d0491786ef819b6936290e9da4242ba5c0eb34b1d7a8dc2e41fe0842c97` |
| `research-motion.webm` | 393859 | `50e8cbc3984a81731715b381edb68d8c45a8bd8b411fad6b7b75472107fdc9a1` |
| `writing-motion.webm` | 475878 | `e2b07aa1dbcad372b10e1edb1d5d46d72f606ae9d86773742282b3a5f8c786f4` |
