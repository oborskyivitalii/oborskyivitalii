# Issue177 Exploratory / Interaction QA — actual public preview observation

2026-11-08. Continuation of `/tmp/issue177-ci-exploratory-pre.md` by distinct nonauthor reviewer `/root/issue177_ci_exploratory`. No peer reports, implementation, external writes or delegation. Only safe public preview navigation and read-only DOM/AX/screenshot/log inspection. CUA completion_summary was submitted once after the bounded final observation.

## Surface and identity

Own fresh CUA Chrome/CDP tab **16**, created by this reviewer; parent tab15 was neither claimed nor controlled. Source preview supplied by orchestration: `https://4d570c02.oborskyi-author-ci-staging.pages.dev`, from publish job128821791747. The actual browser independently displayed **STAGING · 042a2eac** throughout. This is public staging product navigation evidence for that source, not execution of the corrected-source enabled SDK fixture and not independent authentication of the complete CI artifact/run chain.

Starting request: `https://4d570c02.oborskyi-author-ci-staging.pages.dev/articles/the-sdlc-is-out-of-balance.html`. Browser returned the extensionless URL `https://4d570c02.oborskyi-author-ci-staging.pages.dev/articles/the-sdlc-is-out-of-balance` and the expected reader.

The initial packet and role identities are retained in the pre-CI report. This continuation concerns the immutable public source042 preview; the later test-helper correction and its exact current-source CI are a separate pending evidence gate.

## Charter

Exercise actual article canonical-request/extensionless entry, reload, reader return to Writing, discover the exact actual catalog anchor after article-first navigation, activate it, and browser Back/Forward. Check URL, reader identity/title, Writing identity and busy state. Do not infer SDK requests or pageviews from staging DOM. Preserve first timeouts/transients and do not alter settings or retry local Chromium.

Expected article key: `sdlc-out-of-balance:en`. Expected article heading: `The SDLC Is Out of Balance: Beyond the AI Code Review Bottleneck`. Expected Writing heading visually: `AI architecture, delivery and operating models.` (raw DOM text concatenates the line break as `AI architecture, deliveryand operating models.`).

## Actual observations

Raw observations are the CUA tool outputs for own tab16 in this execution; final output includes the complete17-entry `navObservations` array. AX snapshots and screenshots show source badge and navigation progress. The table preserves completed results separately from transient/incomplete ones.

| Action | Expected | Actual result |
| --- | --- | --- |
| Canonical `.html` request | Reader for expected article | Completed after hosted redirect to extensionless URL; correct key/title; `page=writing`, `aria-busy` absent |
| Reload | Same reader identity/title | Completed, same extensionless URL/key/title; busy absent |
| Direct extensionless `?entry=alias#content` | Same reader despite query/fragment | Completed, query/fragment retained; correct key/title; busy absent |
| Click `← Back to Writing` | Writing, no article key, archive link discoverable | Initially busy with article URL/key and disappearing content; next title-link lookup timed out. Without repeating the click, later completed at `/writing.html`, article key null, busy absent, Writing content present |
| Inspect actual local article anchor | Exactly one appropriate link | Exactly one title-matched link. Actual href is `article-snapshots/58266d79d47fee85bdff4ef29aaeb933d5e0cade6b095cd16c8348c6e3330f43/the-sdlc-is-out-of-balance.html`; it is not the static canonical href |
| Semantic title-link click | Start reader navigation | Immediate observation stayed settled Writing; subsequent article-key locator timed out. Screenshot/DOM showed visible ordinary same-tab anchor, no target attribute, no obstructing dialog. This first activation did not establish navigation success |
| Keyboard Enter on that same focused/visible title link | Start reader navigation | Started busy transition; later reached `/articles/the-sdlc-is-out-of-balance.html`, correct key/title, and eventually busy absent. This establishes actual snapshot-link routing semantics through keyboard activation, not a clean first-click pass |
| Browser Back | Restore Writing | Busy/transient observations and one locator timeout retained; eventually Writing URL, null article key, correct heading and busy absent |
| Browser Forward | Restore expected article | URL/key/title restored and reader content reappeared in AX. **Final bounded observation still had `aria-busy=true`**, screenshot showed transition scene; fully settled Forward remains **not observed** |

All17 DOM observation records had `sdkElements=0`, consistent with staging suppression. No network-level collector capture was performed; this does not establish zero traffic independently, one-SDK-per-document acceptance, SDK-generated pageviews or aggregate collector receipt.

## Limits, failures and treatment

Actual runtime interaction is now observed, so the applicable browser surface is no longer wholly unobserved. It is still incomplete for a clean fully settled Back/Forward journey and provides no enabled SDK fixture evidence.

The CUA locator waits requested `timeoutMs:30000` but returned `Playwright selector deadline exceeded` after approximately3.6–3.8seconds according to tool wall times. Their failures are retained rather than treated as proof of a30-second site timeout. No controlled end-to-end transition timer was collected. `document.visibilityState=visible`, `document.hidden=false` was observed during the internal transition. The bounded console sample contained extension-attributed metadata errors and no site-attributed error; it cannot exclude uncaptured errors. A read-only `document.getAnimations()` diagnostic was unsupported in the CUA DOM facade and raised TypeError, so it supplied no animation diagnosis.

**Diagnostic finding (medium, unresolved cause):** source042 public Color preview navigation repeatedly remained busy across observations; initial title-link click did not establish activation, keyboard activation subsequently completed, and Forward settlement was not observed before the bounded stop. Relevant surface: reader return / actual Writing snapshot anchor / history transition. This limits product-journey confidence; it does not identify a defect in the analytics correction. Cause may involve product transition behavior, observation/tool scheduling or environment; none is established. Preserve these observations. Do not modify browser settings, broaden the campaign, or weaken SDK-fixture waits based on them. The next bounded evidence is the existing strict current-source CI compiled-fixture journey, with its original readiness/count assertions.

The exact observed snapshot anchor supports a test selector that admits the catalog alias or the exact generated descriptor and demands one match. It supplies no basis for a wildcard, first-match fallback or changed title/key/count oracle. I did not author or accept implementation changes here.

## Verdict and next gate

**Partial actual browser observation; acceptance pending.** Canonical-request/extensionless/reload reader identity, eventual reader-to-Writing, exact snapshot catalog-link semantics and settled Back were observed on immutable source042. Forward restored article identity/title but remained busy in the final observation. No stable promotion, merge, production action, analytics provider interaction or live telemetry check was performed by this reviewer.

Await corrected-source raw CI fixture reports. Verify all seven article phases, exact source/artifact/run binding, strict request/element counts, existing blocked/delayed/staging/offline/isolation cases, full terminal accounting and observed no stable promotion. The cancelled first evidence-only CI42510243025 remains cancelled historical evidence and is not a successful browser campaign. Whole issue ACs and real provider receipt remain open.
