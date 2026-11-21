# Historical review PDF locator

This locator replaces only the redundant loose PDF copy, not the original review result. The exact original bytes remain in the unchanged native review ZIP. This is historical recovery information, not current editorial or publication acceptance.

- Original path: `review/issue-2/r27-20261023/The_Sum_of_Our_Technology_R27_2026-10-23.pdf`
- Original size: 1412004 bytes
- Original SHA256: `2f5fde5749b6cc294f1026d293df5aa0c9cc645ea7d3cba0ca3c5e9194414ad6`
- Archive: [The_Sum_of_Our_Technology_R27_2026-10-23_Native_Review_Kit.zip](The_Sum_of_Our_Technology_R27_2026-10-23_Native_Review_Kit.zip)
- Archive member: `article.pdf`
- Archive SHA256: `1ba55facb646824c34018e644fc7329bcfd806f1c66b4217bd338b0461fd3069`

From this directory, recover the exact original with:

```sh
unzip -p The_Sum_of_Our_Technology_R27_2026-10-23_Native_Review_Kit.zip article.pdf > /tmp/The_Sum_of_Our_Technology_R27_2026-10-23.pdf
```

The extracted bytes were compared to the loose original before replacement on21November2026 under issue213. Historical artifact manifests retain the original path/hash and are not rewritten.
