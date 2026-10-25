# PMDay article — review candidate

Owning [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5) and separate [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2) acceptance.
This is prepared content; editorial/rights/publication decisions remain pending.

- [Full manuscript](../../../site/publications/pmday-two-shifts/manuscript.en.md), [blueprint](../../../site/publications/pmday-two-shifts/blueprint.md) and [authored LinkedIn adaptation](../../../site/publications/pmday-two-shifts/adaptations/linkedin.en.md).
- [Article PDF](article.pdf): five A4 pages; all five rendered pages inspected and pixel-identical to the independently reviewed final layout at the same72dpi rendering settings. [PDF manifest](article.manifest.json).
- [Publication kit](publication-kit.zip): complete27-output verified kit plus its manifest. Full article HTML/MD/TXT, LinkedIn adaptation, Medium equivalent/copy-ready/ordered upload instructions, authored launch/SEO and declared cover/hero PNGs.
- [Offline article](offline-article.html): five rooms plus exactly one article, one embedded native PNG and verified finite asset hydration. [Offline manifest](offline-article.manifest.json). Native article75,782bytes/314,649totalgzip; standalone1,118,006bytes/494,844gzip within existing budgets.
- [Kit manifest](artifact.json): edition `pmday-two-shifts-en-review-20261012`, semantic identity and exact inputs/transformations/omissions/output hashes. Kit artifact `572ca4abc9e609f4819797407e3e47569c9b2048aa2d6fb888b003eb91ad0ba6`.
- The separate [v35 slide review PDF](../../../site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) and [deck provenance](../../../site/publications/pmday-two-shifts/deck-review.json) are distinct from the article PDF; fifteen slides/notes and source hashes were checked. Font substitution and physical-device/third-party-rights review remain explicit.

The source declaration remains `working-tree-review` with null freeze commit/blob,
intentionally pending editorial acceptance. The manuscript SHA256 is
`ddbf94e087037feda8996f03b5564eaa7cedd897bdffb03ad54298b799cbae7a`; the committed source and this artifact are reviewed
through the exact final PR head and clean-source evidence linked in PR79. A Git
commit or checksum does not approve content, rights or actual publication.

Article PDF uses explicitly selected review Chromium153.0.8010.0 via exact
`@sparticuz/chromium`153.0.0 package/archive/binary hashes in its manifest.
`managedBrowser:false` and `reviewOnly:true` are preserved. Locked Playwright1.63.0
managed Chromium is unavailable locally; its default path fails with a named
error and leaves no partial output. This review does not establish managed/native
browser, actual hosted admission, native-editor transfer or publication acceptance.

After extracting the ZIP into an independent directory, run:

```sh
node tools/publishing/cli.cjs verify /absolute/path/to/extracted-kit
```

Default site builds and fifteen ordinary previews exclude this draft and its assets.
Medium requires ordered manual image upload and native-editor inspection. Canonical,
publication dates and observed events stay pending. Production, external posting,
merge and UA113/Subprime disposition have not been performed.
