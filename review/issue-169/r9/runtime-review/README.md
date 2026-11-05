# Reader/history runtime review receipts

Refs #169 / PR170. Four distinct first executions used explicit `fork_turns="none"`; same-role follow-ups are continuations, not fresh contexts. Requested and accepted task handles are recorded below; provider model/context-memory internals remain unknown. No implementation was authored by these reviewers. Original first judgments and subsequent reconciliations are preserved losslessly.

Initial source packet SHA256 `b726f00ba9c4b65d37bc6c034be64aa6bf708ff2d06e90971f92eaf1b586fe6c`; final dirty admission packet SHA256 `affddd872b54b87669eede7a91eae60445997eeea49c89e9a277ea35dbebeeb8`. Prompt hashes and inspected files are pinned by those packets.

| Role / accepted handle | Original review SHA256 | Complete original |
| --- | --- | --- |
| requirements / `/root/reader_runtime_requirements` | `f4801450970cf141b576ed50f970b7d23ee8080116f1665cf65f25d7a7eddd00` | [requirements.md.gz](requirements.md.gz) |
| code / `/root/reader_runtime_code` | `e825d708e7251bed2d027e441a18dde7921c017a140708e2ef7503c3f8cbd2bb` | [code.md.gz](code.md.gz) |
| whitebox / `/root/reader_runtime_whitebox` | `28b5d51a8e6921d78d4f6a11048c2b41b0406f3559b110571152f22d7a043d5f` | [whitebox.md.gz](whitebox.md.gz) |
| exploratory / `/root/reader_runtime_exploratory` | `70853dc653099dd5bfa0649931f73aad213db1a752cbd336e2eb4c5558ccc2f3` | [exploratory.md.gz](exploratory.md.gz) |

All four completed their final bounded review with no unresolved scoped blocker. This does not establish current full CI, hosted delivery, staging, merge or production acceptance. Raw browser report/hash, private dirty production lineage, unchanged application/probe bytes, source failures and actual checks remain distinguished in each original.
