# Capacity maintenance — Requirements preflight

**PASS: bounded maintenance within the authorized repository delivery; no additional user permission needed.**

Independently inspected `tools/repository_intelligence.py:41–45,145–190` and `.github/REPOSITORY-INTELLIGENCE.md:204–209`. The producer enforces 250,000,000 aggregate hashed bytes, 32,000,000 per hashed file, 2,000,000 per decoded file, 50,000,000 decoded total and 5,000 files. Tracked inventory independently totals 254,641,424 bytes across 1,932 files, consistent with the reported capacity failure.

Raising only the aggregate hash bound to 260,000,000 bytes (+4%) and synchronizing the guide preserves finite resource limits and complete source coverage while admitting the retained edition. No artifact edits, history deletion, new exclusions, remote action or publication is authorized by this adjustment.

Acceptance: unchanged remaining bounds and exclusion rules; successful RI build/verify, existing RI regressions and required policy checks. The scan also includes eligible untracked files, so final build success—not tracked-size arithmetic—establishes capacity sufficiency. Final implementation review remains separate. No implementation performed.
