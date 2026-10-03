# Reproduce the v8 audit

Run from the repository root on the exact source version identified in REPORT.md.
Production files are unchanged by these scripts. The optional tools and browser
binaries are not site runtime dependencies. Use a suitable trusted local/CI
environment that permits browser subprocesses and a loopback HTTP server.

## Tool setup

```sh
mkdir -p /tmp/site-v8-audit
cp review/site-audit-v8-20261003/toolchain/package*.json /tmp/site-v8-audit/
npm ci --prefix /tmp/site-v8-audit
python3 -m venv /tmp/site-v8-audit/venv
/tmp/site-v8-audit/venv/bin/pip install -r review/site-audit-v8-20261003/toolchain/requirements.txt
export SITE_AUDIT_TOOLS=/tmp/site-v8-audit
export PLAYWRIGHT_BROWSERS_PATH=/tmp/site-v8-audit/browsers
/tmp/site-v8-audit/node_modules/.bin/playwright install chromium firefox webkit
```

Use Playwright's documented OS dependency setup on a normal runner. Set
`SITE_AUDIT_CHROME` to the actual Chrome/Chromium executable; the audit workspace
used `/tmp/site-chrome/opt/google/chrome/chrome` (154.0.8037.97). Its path is a
workspace convenience, not a system requirement.

In this restricted workspace, Ubuntu dependencies for WebKit were downloaded and
unpacked with `dpkg-deb -x` into `/tmp/site-v8-audit/sysroot`. No system package was
installed. Because Playwright's default wrapper/cache check does not account for
these private libraries, the documented custom-executable launch option was used:

```sh
export SITE_AUDIT_WEBKIT=/tmp/site-v8-audit/browsers/webkit-2359/minibrowser-wpe
export SITE_AUDIT_WEBKIT_LIBS=/tmp/site-v8-audit/sysroot/usr/lib/x86_64-linux-gnu:/tmp/site-v8-audit/sysroot/lib/x86_64-linux-gnu
```

Omit those two variables on a standard Playwright installation. The script sets
the same execution/resource paths as the supplied WPE launcher, plus the local
library directory. This is Linux WebKit, not Safari/iOS. Browser versions and
hardware must accompany any comparison.

## Static tools

Commands reporting reviewed findings may exit nonzero. Keep their full output;
do not equate a nonzero lint count with a security failure.

```sh
/tmp/site-v8-audit/node_modules/.bin/eslint --config review/site-audit-v8-20261003/eslint.config.cjs docs/*.js tools/*.cjs tests/*.cjs --format json --output-file review/site-audit-v8-20261003/results/eslint-sonarjs.json
/tmp/site-v8-audit/node_modules/.bin/stylelint docs/styles.css --config review/site-audit-v8-20261003/stylelint.config.cjs --formatter json --output-file review/site-audit-v8-20261003/results/stylelint.json
/tmp/site-v8-audit/venv/bin/ruff check --isolated --select E4,E7,E9,F,I,C90 tools tests --output-format json --output-file review/site-audit-v8-20261003/results/ruff.json
/tmp/site-v8-audit/venv/bin/bandit -r tools -f json -o review/site-audit-v8-20261003/results/bandit.json
/tmp/site-v8-audit/venv/bin/detect-secrets scan --no-verify --exclude-files '^(review/|drafts/)' > review/site-audit-v8-20261003/results/detect-secrets.json
export SEMGREP_SETTINGS_FILE=/tmp/site-v8-audit/semgrep-settings.yml
export SEMGREP_LOG_FILE=/tmp/site-v8-audit/semgrep.log
/tmp/site-v8-audit/venv/bin/semgrep scan --config p/security-audit --metrics off --disable-version-check --jobs 2 --max-target-bytes 5000000 --json --output review/site-audit-v8-20261003/results/semgrep.json docs tools .github/workflows
```

The 5 MB Semgrep limit admits the full HTML pages. Semgrep 1.179.0 partially parses
valid compressed decimal ternaries. The second scan closes that specific gap:

```sh
node review/site-audit-v8-20261003/normalize-semgrep.cjs
```

Then run Semgrep with the same flags against `/tmp/site-v8-audit/normalized/docs`
and `/tmp/site-v8-audit/normalized/tools`, with `--no-git-ignore`, writing to
`results/semgrep-normalized.json`. Normalization inserts whitespace only and
verifies identical Espree token type/value sequences; production code is untouched.
Registry rules are fetched live and can change; package versions alone do not
freeze that external ruleset. No Semgrep account or cloud project was used.

## Browser measurements and failures

Run performance jobs **sequentially**, without other benchmarks/scanners. The
server binds only to 127.0.0.1, uses a random port and serves the exact docs/ files
with gzip. No production origin is scanned.

```sh
node review/site-audit-v8-20261003/run-lighthouse.cjs
node review/site-audit-v8-20261003/run-browser-audit.cjs performance
node review/site-audit-v8-20261003/run-browser-audit.cjs
node review/site-audit-v8-20261003/check-css-readiness.cjs
node review/site-audit-v8-20261003/reproduce-v8.cjs
```

The first two scripts record load and sustained-rendering costs separately.
The matrix also performs bounded local URL-input probes and explicitly labelled
fault injection. `check-css-readiness.cjs` runs normal/delayed/blocked CSS in three
engines. `reproduce-v8.cjs` reuses the existing VM fixture for rapid reversal;
it prints the observed result instead of incorrectly declaring it a passing test.

The browser matrix supports `SITE_AUDIT_ENGINES=webkit` to rerun only that engine,
replacing its rows while retaining other engine evidence. The first incomplete
matrix was preserved separately after a hidden-control timeout; the completed
matrix records that behavior as a finding. Normal matrix/failure tests are not
performance benchmarks.

Full Lighthouse reports and raw runtime frames are archived as deterministic gzip
JSON to reduce repository weight. Scripts emit plain JSON on reproduction; read
archived files with `gzip -dc <file.json.gz>` or Python `gzip.open`. Summaries are
ordinary JSON. Machine output is evidence from v8; do not overwrite it with future
candidate results. Use a new versioned review directory for Sol's comparison.

## Existing repository checks

```sh
node --test tests/theme.test.cjs tests/space.test.cjs tests/archive.test.cjs tests/content.test.cjs tests/preview.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json build
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify
git diff --check
```

These existing checks passed during this audit. They do not constitute acceptance
of the unfixed browser/performance findings or a future optimized version.
