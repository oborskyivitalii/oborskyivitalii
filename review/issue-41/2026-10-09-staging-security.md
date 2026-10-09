# Issue 41 — staging security follow-up, 9 October 2026

Owner: [issue #41](https://github.com/oborskyivitalii/oborskyivitalii/issues/41).
Execution: [PR #67](https://github.com/oborskyivitalii/oborskyivitalii/pull/67).
Root self-analysis; candidate classification receives separate independent AI review.
Inspected source: `c37e511006dc51a48628cd286d217a9c116d5977`,
tree `3262000f8898600bbed2ab10a237290787f3f41e`.

## Intent and decision

The maintainer explicitly authorized merging PR #67 and publishing stable staging
in the current 9 October request. The existing controller requires an open PR,
so exact-head staging admission and stable verification precede merge.
The broader original AC02–06, deferred content and production remain separate.

## Actual failed attempt

[Stage run 37987226919](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37987226919)
failed its security/aggregate gates. Static job 114013345624 reported **193
untriaged candidates**. The hashed-only report is retained in artifact 11643623177,
ZIP SHA256 `da6bd8d3bef49fe59f03e63fb90610f3a5c760b3a51ac1f247cfc12a7cf01d05`.
Every new candidate used Hex High Entropy String; this alone does not prove a
false positive. Exact values must match recomputed public bytes or Git identities.

Build, exact HTTP/artifact identity and staging browser/performance succeeded.
Browser artifact 11643134493 retains those observations; the failed aggregate
never admitted this candidate, promotion was skipped and stable staging stayed
unchanged. The immutable candidate was 167cd705. No failure is relabelled.

## Bounded correction

- Preserve the historical secrets baseline and all previous reviewed entries.
- Append only independently proved exact path/type/hashed-value findings to the
  existing `tools/quality/secrets-reviewed.json`; unknown candidates remain errors.
- The first attempt also exposed a stale offline bundle manifest. Regenerate it
  through `tools/build_site_bundle.py`, then scan the actual corrected tree.
  Do not admit historical bundle checksums as current generation evidence.
- Preserve site sources, generated public bytes, runtime, scanner code, rules,
  workflows, dependencies, budgets and mandatory staging/production boundaries.

The existing build/snapshot/preview owners recompute generated checksum evidence;
Git object reads and exact before/after fragment hashes establish history and
amendment evidence. SHA1 here identifies the scanner's hashed candidate; it is
not the project's integrity algorithm or an authentication credential.

Independent read-only AI review verified the prepared current **193/193**
dispositions: 128 recomputed generated checksums, 49 actual Git identities and
16 exact before/after HTML fragment hashes; zero unknowns or blockers. All prior
3598 records and the frozen baseline remain unchanged. The corrected scan shares
178 findings with the failed attempt; only 15 old bundle IDs are replaced by
15 current ones. No broad path, file-type or entropy allowance is introduced. The append stays
within the unchanged two-million-byte RI text bound; previous records retain
their literal serialization and only new dispositions use concise reasons.
Root authored the audit/routing and generator correction; the triage agent
authored the ledger; separate agents independently checked the complete proof
and append accounting. These are AI observations, not GitHub human approval.

Final reviewed ledger SHA256:
`99a4dd04ec5cae9b749f0b5843663177f294ab1baea508184fa2593e37a27c57`.
Complete proof inventory SHA256:
`000ffa085c829c5a1592ebc62c354c1e40b07ae585a430ab06a23f2b6dc57c19`.
Fresh pre-append tracked-text scan SHA256:
`a16afd4e5bb076e03858925ef32efaacd68eef40f16c20742cb5a3553e774dde`.
The final tracked scan includes the added audit and regenerated RI views; its
actual result and clean commit binding are recorded with the final CI/stage.

## Verification and acceptance route

Applicable CS01/04/05/08/09/10 concern the existing exact data owner, readable
append-only records, unchanged gates and current RI/CI mapping. Runtime CS06/07
behavior is unchanged. No new test suite or scanner exception mechanism is added.

Run current full tracked-text detect-secrets, offline freshness, Basic, format,
owning-policy and RI/CI checks. Independently inspect the added dispositions,
then retain exact final-source PR CI and a new complete staging attempt.
AC15/16/24/25/26 are reconciled against that new source in the issue. Current
head/tree, review result, CI, staging gate, stable verification and merged-source
evidence belong to the linked issue/PR completion record; prepared checks cannot
supply a future successful run or maintainer approval.
