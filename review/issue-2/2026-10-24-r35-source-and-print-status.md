# Issue #5 / editorial issue #2 — R35 source and print synchronization checkpoint (24 October 2026)

**Owning PR:** [Draft #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), head after source pin [`7e3f96b`](https://github.com/oborskyivitalii/oborskyivitalii/commit/7e3f96b1b54bd88e6f662d3f28487abc853f552e), before this handoff. R35 manuscript originated in [`45c6d34`](https://github.com/oborskyivitalii/oborskyivitalii/commit/45c6d34c926470516e5b1d00593e98a1187aed28).

## Intent / scope

User authorised the next bounded step: align R35 manuscript with its publication edition/profile/launch and produce the matching PDF without revising the essay's argument or enlarging CI/harness scope. Preserve all R30/R32/R33/R34 history; no new public publication or changes to release gates.

## Implemented authored-source integration

- Canonical `manuscript.en.md`: R35, git blob `a3dabe1cc423ab9731383fcd48050ed8fdc68dc7`; SHA-256 `aa2d8db00076f21c613b657acccd911f217e2a2e8762cbfcb017ec7a03d0c869`; 52,802 JS-character units / 53,200 UTF-8 bytes. 37 numbered references, 12 bold “What if not?” prompts, four figure declarations, two substantive tables.
- New immutable source edition: `pmday-ai-both-sides-en-review-20261024-r35`, referencing exact manuscript digest and semantic digest `d57b0fee9a985ea0cb3ce47f581dd537bb844fcd17a7790b31216c01ce081629`. Semantic hashing algorithm was checked against the unchanged R30 pinned semantic hash before computing R35.
- `publication.json`: selects R35 and registers `source-45` pointing to the 5 January 2026 DOU original. Earlier 42 reference entries are preserved.
- `profile.json`: R35 identity, updated title-byline block hash `d2b54c9afab29d79f629949b0fc81f58c05ea61793dfebd53bf412998ff51057`, new launch SHA-256 `b30cd9e63905bd8985e2695a2a67ef61d38cb16673776a03bceaa36323167426`. Other source-anchored print and reader roles retained.
- `launch-post.en.md`: removed outdated R30 editorial statement; draft still states review-only/no canonical publication.
- The public [DOU article](https://dou.ua/forums/topic/57244/) supports the earlier dated assertion, **not** an exclusive-first claim.

## PDF observation — local review only

A separate **17-page A4 R35 text-layout PDF** was generated in a local WeasyPrint review environment from the exact R35 Markdown; checked 23 headings, all 37 references, 12 question prompts, both tables, citations, 146 link annotations, all 17 page images and word boxes against page boundaries. The PDF is **not** committed to this repository: the available connected GitHub write interface accepts UTF-8 or an explicitly supplied base64 payload, but the container's rendered binary cannot be passed into that interface, and direct public binary download is unavailable in this session. The four author-selected images are **linked as explicitly labelled omissions rather than silently substituted or misattributed**. The local output therefore proves prose pagination and link viability, **not** a complete matching native/illustrated R35 PDF. The PR's existing R34 binary is deliberately untouched.

## Independent review and acceptance

| Gate | Observation | Decision |
| --- | --- | --- |
| Author/source/edition/launch linkage | Source metadata updated, hashes computed and GitHub readback to be completed on final head | Implemented, **not current-source QA accepted** |
| Local R35 text-only PDF rendering | 17 A4 pages, links/sections verified, original images missing | **Review-only**, not matching illustrated/native binary |
| Requirements & Acceptance Reviewer | Separate role not available / not launched | **Pending** |
| Independent code/artifact reviewer | Separate role not available / not launched | **Pending** |
| White-box QA | Separate role not available / not launched | **Pending** |
| Exploratory / Interaction QA | Separate role not available / not launched | **Pending** |
| Current-source publisher validate/render/platform outputs | No full checkout/toolchain in this session | **Pending** |
| RI/CI/source-bound acceptance | Inherited RI 250,000,000-byte bound issue, no matching accepted source runs | **Pending / inherited blocker** |
| Main merge conflict, rights, staging and production | Unresolved, separate maintainer decisions | **Not done** |

**Important:** no four-role review, native publisher pass, full PDF parity, new site release or source-clean 12/12 is claimed. Historical R30 success and R34 bytes are not transferable to R35. Preserve original test budgets and hard failures.

## Small next sequence

1. In an environment with the original figure assets and publisher, generate exact R35 native PDF and the existing eight platform files; inspect original cover+slides and reference hyperlinks. Commit binary and outputs in PR79 without changing legacy artifact files.
2. Rebuild/verify RI and current-source generated lock/catalog within the original fixed size bound. Fix only actual stale owners or bounded duplicate history, never disable the guard.
3. Obtain the mandatory four distinct independent role reviews; run the issue5 current-source checks, issue2 editorial/rights checks, existing Draft/preview route. Reconcile ACs and leave anything missing unchecked.
4. Handle inherited main conflict/protected staging as the existing issue route directs; **no automatic merge or production promotion**.

This is a bounded self-review handoff, **not** independently signed approval.
