# Pinned browser supply

Owner: [issue122](https://github.com/oborskyivitalii/oborskyivitalii/issues/122).
The locked Playwright packages and their browser registry own browser versions.
This route supplies those exact binaries through existing immutable GitHub
Actions artifacts. It adds no site publisher or deployment permission.

## Prepare once, then pin

Run **Prepare pinned browser archives**, operation `prepare`, from the intended source. During the
first reviewed integration, the repository owner may add `browser-archive-seed`
to its same-repository PR; this runs the same unprivileged preparer before the
new workflow exists on main. Other label actors, forks and upstream events
cannot request it. The workflow has read permissions and no site environment.

Its existing-platform sets are Ubuntu24.04 Chromium/Firefox/WebKit,
Windows2025 Chromium/Firefox and macOS15 WebKit. Native architecture and OS
generation are recorded rather than assumed. Linux retains Python3.12.14;
the new native Windows/macOS stdlib archive helper uses Python3.13.17 because
the3.12.14 release has no Windows/macOS binaries. It installs locked packages and
OS dependencies, downloads the browsers once, actually launches each engine
in this preparer, then creates and independently re-extracts a bounded archive.
Each package contains `browsers.tar.gz` and `manifest.json`, including exact
file hashes/modes/links, browser revisions, package integrity, producer hashes
and source. Original native upload digests are retained separately.

Download the three `browser-pin-*` artifacts from that successful run and put
their JSON records into `tools/quality/browser-archives.json`'s `archives` list.
Review the actual source/run/attempt, immutable upload digest and archive bytes.
Do not type guessed IDs/hashes or substitute a record from another toolchain.
Pins are explicit; a consumer never selects a mutable latest successful run.

GitHub Actions artifacts expire after90days. Refresh before expiry with the
same owner operation and review the new exact records. Changed package/revision,
producer, OS or architecture requires a matching seed. Missing/expired records
block setup and name this refresh route; they never enable CDN fallback or
turn missing browser tests into success.

## Consume without warming the test machine

After installing the existing locked Node dependencies and the job's existing
OS dependencies, use the shared local action:

```yaml
- uses: ./.github/actions/browser-archive
  with:
    browsers: chromium,firefox
```

Jobs retain `actions: read` for native origin/attempt/digest verification. The
consumer verifies exact toolchain/system/revisions, owner/workflow/repository,
successful run, source ancestry, ZIP and inner digests, bounded safe extraction,
complete inventory and executable permissions. It sets `PLAYWRIGHT_BROWSERS_PATH`;
an existing explicit browser directory may be passed with `directory`.
Nested checkouts use the action at their actual checkout path and pass
`working-directory`; the five Writing jobs retain `candidate`. Setup report
names include a unique receipt suffix, so parallel cells with the same job ID
retain their own evidence.

| Existing workflow | Preserved browser consumers |
| --- | --- |
| site-release-checks | Linux C/F/W; Windows C/F and macOS W; performance C; captures C; staging C/F |
| site-staging | deploy C; promote C |
| site-production; site-pages-migration | publication navigation C |
| site-color-review | conditional hosted smoke C |
| site-navigation-probe | Windows Firefox |
| site-browser-gate-probe | C/F/W |
| site-cause-probe | two Chromium jobs; three-engine diagnosis |
| site-cause-fix-probe | three WebKit jobs; Chromium research pair |
| site-gtk-native-probe; site-gtk-target-probe | WebKit, with existing display checks |
| site-writing-probe | four Chromium jobs; Chromium/Firefox paradigm |

C/F/W mean Chromium, Firefox and WebKit. These are26 existing download-step
declarations across12 workflows; matrix declarations retain their original
platform expansion. The permanent archive suite guards the complete mapping,
selection, read permissions and failure propagation with negative cases.

**Consumers never launch a browser.** Cold/performance/GTK jobs retain their
no-prior-launch contract. Their actual tests perform the first launch exactly
where they did before. The preparer's launch check runs on a different machine.
All browser sets, test selections, metrics, budgets, native platforms and OS
dependency steps remain owned by their current workflows.

After pinning, operation `verify` (or the owner-only `browser-archive-verify` PR
label) restores the same three existing native sets on fresh runners and then
performs their first launch. This bounded supply proof is separate from site
test/profile acceptance; it cannot replace the existing browser suites.

The setup report is retained even on failure. An HTTP200 HTML error page,
wrong/missing/expired archive or mismatched binary is a preparation failure,
before the test suite. Do not rerun unchanged failures or silently choose a
system Chrome, another revision, a public mirror or a broader cache key.

`node tools/quality/browser-runtime.cjs restore --browsers chromium --directory
PATH` is also available locally after the identical pinned package install;
it needs a repository-scoped read token in `GITHUB_TOKEN`. The archive pin and
source checks remain the same. This command has no publication authority.
