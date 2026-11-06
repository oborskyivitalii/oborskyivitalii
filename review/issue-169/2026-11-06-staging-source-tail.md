# Issue169 — native source tail and HTML startup

Owner169 / PR170. Base53102d7d55012d6bd954d7d4b248d75dc75e9600,
controller main312fbe4347eda332aa8ade885b07c98beadd6da5. Accepted R10.
User authorizes verified stable staging and STOP/show; no PR170 merge/production.
This is an execution correction, not whole-AC acceptance (AC05/11 apply).

## Retained observations and diagnosis

Owner staging42309808371/1 failed before candidate upload. Exact clean source
53102d7/tree f07f15dde663943842783e559b058c00539c15eb reached the unchanged
300-second source deadline:75modules dequeued,74completed successfully,
1146partial TAP ok records and no complete accounting. Profile selection started
at290036ms and remained unfinished. Python143/143passed in92.243s; final
prepublication/scanner accounting was absent when the10-minute build expired.
No full hosted regression or stable alias promotion occurred.

Native artifact13547969296 retains raw reports under run42309808371;
ZIP SHA256 f33f4d4c764ce4745101e2d78f5404c42714e0bca6779f7237ff929585b95fb1.
Preview42309145683 smoke128206811778 actually PASSED: hosted routes,
R10 reader desktop/mobile, PDF digest/MIME and publication tags. Its separate
Staging admission was red because owner staging had not completed; it was not
a reader failure. Preview artifact13547368991 ZIP SHA256
ac81063d43e4be65bab07b675ffd8a6383c72a7d632686b4e92daf77223876f1.

The completed native wrappers sum1174.264worker-seconds. A fixed-duration
four-worker simulation has almost no margin before the unfinished suite;
reordering cannot establish sufficient native speed. Separate pinned-Node
profile48/48passed in9.153s. Publishing dependency copy measurement saved only
about0.4s across fixtures; that change was rejected as insufficient.

An observation-only preload measured the existing executive contact/title case:
359 actual Python parser calls,448unique HTML requests,10.788s parser time of
11.565s wall. Zero repeated inputs disproves cache-eviction speculation. A
separate same-case HTML-only no-site startup probe passed in10.449s; observer
and process conditions differ, so this is bounded directional evidence, not a
controlled native speed guarantee. Exact parser event/refusal parity remains
required. No unknown-input parse or test assertion is omitted.

## Bounded correction and invariants

Source worker uses descending measured module durations; profile selection uses
twice its separate pinned-Node duration because native execution was incomplete.
Unknown future files retain deterministic path order. Profile inventories and
all assertions remain. Existing order tests cover the new measured order and
unknown-file fallback, including real profile-suite scheduling.

Only nonempty all-HTML helper requests start the SAME locked Python interpreter
with -S. The unchanged Python helper HTML branch uses only the standard library;
YAML, mixed, empty, unknown-language and non-HTML batches retain normal startup.
HTML-shaped rows with source errors still use the same parser and refusals.
A real-interpreter regression compares ordered events with ordinary startup,
raw script/style/inline/SVG bytes and identical duplicate-attribute refusal;
a mixed YAML/HTML batch and empty batch exercise ordinary routing.

No site/docs/content/PDF/media changes, selector/case retirement, gzip/cache
bound change, worker increase, deadline/output/reporting-grace relaxation,
scanner waiver or staging/production gate change. CS01/04/05/07/08/09/10 apply.
New parser parity case uses the existing format-parity module and maintained
PR/staging/production routes; no diagnostic becomes a routine suite.

## Review and acceptance

Requirements preflight ran before both changes. Four distinct none-fork roles
reviewed the scheduling subset independently; each received the parser delta in
its separate correction phase. Original reports and later corrections remain
separate. Shared filesystem/instructions are not provider context attestation;
provider-internal model/history injection remains unknown.

Clean local9ff3d352/tree48fbf56 full production source passed1250/1250,
zero fail/cancel/skip/TODO, plus Basic, formatting, style, architecture and
RI/coupling verification. Both source-before/after were clean. This includes
the new parser parity case;78modules retain complete accounting. Four final
correction roles completed without code/test blockers; Requirements identified
and corrected the overbroad malformed-request wording above.
Native current-head checks and full owner staging remain pending. Local/source fixtures and simulations cannot accept the native timing
gate. Preserve original failed runs; do not retry an unchanged failed campaign.
Before advancement record final role outcomes and exact prepared manifests,
then fresh current-source CI, complete owner staging and stable R10/PDF checks.
Whole issue ACs remain open except historicalAC06. STOP after verified staging.

Literal review receipts are in `timing-correction-reviews.tar.xz` alongside this
report. Complete raw diagnostic/prepared-source evidence is retained in data-only
[evidence commit0ee937be](https://github.com/oborskyivitalii/oborskyivitalii/blob/0ee937be916c8402527c217f7597d4830f9ab8a4/review/issue-169/timing-correction-proof.tar.xz),
SHA25640185919034e18800a42767ea630c0323d91470454f2fbe3a08847fd7f491b37.
It is a receipt archive, not a successful current-head/native staging campaign.
