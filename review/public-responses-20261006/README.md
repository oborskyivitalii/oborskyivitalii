# Selected Home responses — implementation, 2026-10-06

The maintainer asked Sol to execute the [approved plan in PR #28](https://github.com/oborskyivitalii/oborskyivitalii/pull/28#issuecomment-6018945888), owned by issue #14.

Home presents Dobkin, Skelton and Kopko as three bounded examples. Research retains all eight complete articles in surname order, including the original profile/source/secondary URLs and Thinking Systems formulation credit. The two source blocks preserve their IDs, camera stops and route positions. Contact/backdrop changes already in #28 remain intact. Newer #23 source 614c3e5 (including 38ee0df) is retained, without changing that branch.

## Exact copy reconciliation

The four HTML files here are reviewed before/after fixtures copied byte-exact from the authored blocks. They are separate from mutable source files. `tools/check_site_seo.cjs` reverses only the exact approved after block to the before block and the exact Research local-nav label. It then compares the complete page against the existing frozen baseline. An altered name, link or claim no longer matches that exact block and remains visible to the check. No arbitrary section stripping or semantic exemption is introduced.

Research article byte strings are unchanged as a set. Tests also assert ordered inventories, matching Home profile/primary-source pairs, retained secondary links/credit through complete-article equality, and rejection of missing Skelton, changed source or a stronger validation claim. The old booking-placeholder test and plain-mailto resolver are updated to the previously approved live contacts.

## Validation and review

Local focused run after the final base sync: 49/49 tests across content, executive/frozen-copy, preview exports, site engine, Color build, ribbons scroll-sync and retained browser-gate/cause-probe behavior. Changed helper/tests pass pinned ESLint with zero warnings. Default local profile passes 13 theme/archive and 10 Color-flight tests, freshness, finite geometry, snapshot integrity and size budgets. Another 30 preview-smoke/renderer/functional-fixture/cause-probe tests pass for preserved base work and changed smoke helpers. Final sequential RI, exact-head CI preview and actual browser review are recorded in the PR execution comment after publication.

Independent source/layout review: `/root/people_review` inspected the plan, authored source diff and existing styles. All eight Research article strings equal the prior source byte-for-byte; the 3-column/1-column Home grid and 2-column/1-column Research grid already fit the change, with content-height alignment. No CSS/runtime change is required for this editorial task. Existing generic smoke alone did not establish Home deep links or the shortened endpoint; bounded preview checks are added for those behaviors.

Independent final review by `/root/people_review` also confirms the exact before/after reconciler, negative mutation tests and bounded mailto handling. The normal preview now checks 3/8 names/order, CTA/local/direct anchors and Back/Forward at 390/1440px with normal/no-Canvas modes. Color supplemental smoke tests the actual Home range at 90/95/99/100%, exact reverse/start endpoint and Home→Research native edge continuation. The candidate checkout supplies these additions; no controller change is needed. Their browser results are pending until the new CI run finishes.

No new external verification, research acceptance, full staging, merge or production deployment is asserted by this implementation record.

## Same-PR base synchronization after the completed preview

The next status check found PR #23 had advanced to d6adcf2 after #28's verified fef1848 preview. The existing stack had generated-file conflicts. This same-PR synchronization retains the newer exact-RGB palette cache, isolated Linux GTK tooling and causal evidence from #23. Authored Home/Research selection, contact URLs and backdrop CSS are unchanged; generated outputs and RI are rebuilt from their owners. The earlier independent editorial review remains applicable to identical authored content. New exact-head CI/preview results are recorded in the PR and issue execution comments. This synchronization does not launch full staging or change PR #23's branch.

Local synchronized-source acceptance: 63/63 focused content/export/engine/renderer/native-display/functional-fixture tests pass. Exact byte checks confirm all authored #28 people/contact/backdrop owners are unchanged from the prior checked source, and the newer #23 renderer/lifecycle/native-display owners equal d6adcf2 exactly.
