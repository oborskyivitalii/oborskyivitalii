"""Issue #39 production preparation; live release decisions remain separate."""

import copy
import gzip
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
import unittest
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = "ec9b8361b619f1042bce5a3ec224d3e0c9054b01"
CURRENT_MAIN = "cc115c4241197d59205934bdc18f209109d5ee87"
PLAN = "guides/github-pages-domains.json"
SNAPSHOT = "review/issue-39/2026-10-07-provider-inventory.json"
RULE_HOSTS = {"vitaliioborskyi.com", "www.vitaliioborskyi.com"}
LEGAL_CSS = b"""
/* Full legal copies remain readable when expanded on narrow screens. */
.legal-notices pre {
  max-inline-size: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
"""


def node_contracts(case, modules):
    """Reuse the maintained runner's 180-second/16-MiB bound and TAP accounting."""
    script = """
const runner = require('./tools/quality/source-tests.cjs');
const report = runner.run(process.cwd(), {
  profile: 'issue39',
  modules: JSON.parse(process.argv[1]),
});
process.stdout.write(JSON.stringify(report));
"""
    result = subprocess.run(
        ["node", "-e", script, json.dumps(modules)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
        timeout=190,
    )
    case.assertEqual(result.returncode, 0, result.stdout + result.stderr)
    report = json.loads(result.stdout)
    case.assertEqual(report["status"], "passed")
    case.assertEqual(report["modules"], modules)
    case.assertGreater(report["total"], 0)
    case.assertEqual(report["passed"], report["total"])
    for key in ("failed", "cancelled", "skipped", "todo"):
        case.assertEqual(report[key], 0)


def read(path):
    return json.loads((ROOT / path).read_text())


def validate_plan(plan):
    """Admit this finite desired topology; no provider API calls are performed."""
    if (plan["schema"], plan["issue"], plan["phase"]) != (1, 39, "prepare-only"):
        raise ValueError("Preparation scope")
    if (
        plan["canonical_origin"] != "https://vitaliioborskyi.ai"
        or plan["canonical_host"] != "vitaliioborskyi.ai"
    ):
        raise ValueError("Canonical origin")
    github = plan["github"]
    if (
        github["repository"] != "oborskyivitalii/oborskyivitalii"
        or github["publishing_source"] != "GitHub Actions"
    ):
        raise ValueError("GitHub source")
    if (
        github["custom_domain"] != plan["canonical_host"]
        or github["environment"] != "github-pages"
        or github["allowed_branch"] != "main"
    ):
        raise ValueError("GitHub production control")
    if (
        github["ownership_txt_value"] is not None
        or github["pages_settings_verified"]
        or github["production_activated"]
    ):
        raise ValueError("Unobserved ownership or activation")
    if github["ownership_txt_name"] != "_github-pages-challenge-oborskyivitalii.vitaliioborskyi.ai":
        raise ValueError("Ownership name")
    expected = {
        "vitaliioborskyi.ai": {
            ("A", "@", f"185.199.{octet}.153", False, 1) for octet in range(108, 112)
        }
        | {("CNAME", "www", "oborskyivitalii.github.io", False, 1)},
        "vitaliioborskyi.com": {("A", name, "192.0.2.1", True, 1) for name in ["@", "www"]},
    }
    if set(plan["dns"]) != set(expected):
        raise ValueError("DNS zones")
    for zone, records in plan["dns"].items():
        actual = [(r["type"], r["name"], r["content"], r["proxied"], r["ttl"]) for r in records]
        if len(actual) != len(expected[zone]) or set(actual) != expected[zone]:
            raise ValueError("Finite DNS topology")
    redirect = plan["com_redirect"]
    rule = redirect["rule"]
    if redirect["phase"] != "http_request_dynamic_redirect" or redirect["applied"]:
        raise ValueError("Redirect scope")
    if (
        rule["expression"]
        != '(http.host eq "vitaliioborskyi.com" or http.host eq "www.vitaliioborskyi.com")'
    ):
        raise ValueError("Redirect hosts")
    value = rule["action_parameters"]["from_value"]
    if rule["action"] != "redirect" or not rule["enabled"] or value["status_code"] != 301:
        raise ValueError("Permanent redirect")
    if (
        value["target_url"]
        != {"expression": 'concat("https://vitaliioborskyi.ai", http.request.uri.path)'}
        or value["preserve_query_string"] is not True
    ):
        raise ValueError("Lossless redirect")
    if plan["activation_applied"] or plan["analytics_activation"]:
        raise ValueError("Activation claim")
    order = plan["activation_order"]
    required = [
        "prepare-repository",
        "github-generate-ownership-txt",
        "cloudflare-add-verification-txt",
        "github-verify-ownership",
        "implement-exact-artifact-pages-workflow",
        "admit-production-artifact-and-owner-release",
        "github-set-actions-source-and-custom-domain",
        "cloudflare-apply-ai-routing-dns",
        "github-wait-certificate-and-enforce-https",
        "publish-admitted-artifact-and-verify-ai",
        "cloudflare-check-com-certificate-and-apply-redirect",
        "verify-all-hosts-and-existing-staging",
    ]
    if order != required:
        raise ValueError("Ownership/admission/routing order")


def planned_redirect(plan, source):
    """Interpret only the finite planned CF fields for URL fixture expectations."""
    validate_plan(plan)
    url = urlsplit(source)
    if url.scheme not in {"http", "https"} or url.netloc not in RULE_HOSTS:
        raise ValueError("Outside finite redirect hosts")
    # A fragment is not sent to HTTP; tests do not invent server-side fragment handling.
    return 301, urlunsplit(("https", plan["canonical_host"], url.path or "/", url.query, ""))


class Issue39AcceptanceTests(unittest.TestCase):
    def test_original_secret_reviews_and_advisory_policy_are_retained(self):
        original = "16d4b1cd03afbb3d01194bbda3d5a2db2edab2d4"
        for filename in (
            "secrets-baseline.json",
            "secrets-reviewed.json",
            "secrets-reviewed-checksums.json",
            "advisory-exceptions.json",
        ):
            name = "tools/quality/" + filename
            expected = subprocess.check_output(["git", "show", original + ":" + name], cwd=ROOT)
            self.assertEqual((ROOT / name).read_bytes(), expected, name)
        name = "tools/quality/secrets-publication.json"
        previous = json.loads(
            subprocess.check_output(["git", "show", original + ":" + name], cwd=ROOT)
        )
        current = read(name)
        indexed = {row["id"]: row for row in current["findings"]}
        self.assertEqual(len(indexed), len(current["findings"]))
        for row in previous["findings"]:
            self.assertEqual(indexed[row["id"]], row)
        with gzip.open(
            ROOT / "review/issue-39/2026-10-16-secret-ledger-merge.json.gz", "rt"
        ) as handle:
            provenance = json.load(handle)
        main = json.loads(
            subprocess.check_output(
                ["git", "show", provenance["trustedMain"] + ":" + name], cwd=ROOT
            )
        )
        main_rows = {row["id"]: row for row in main["findings"]}
        self.assertEqual(len(provenance["reasonVariants"]), 6)
        for row in provenance["reasonVariants"]:
            self.assertEqual(indexed[row["id"]], row["originalPR40"])
            self.assertEqual(main_rows[row["id"]], row["trustedMainReason"])
            for key in ("id", "path", "rule", "disposition"):
                self.assertEqual(row["originalPR40"][key], row["trustedMainReason"][key])

    def test_compact_tuple_proof_and_closed_selector(self):
        with gzip.open(ROOT / "review/issue-39/2026-10-16-compact-tuples.json.gz", "rt") as handle:
            proof = json.load(handle)
        self.assertEqual(proof["kind"], "issue39-compact-metadata-runtime-identity")
        self.assertFalse(proof["sourceObservation"]["dirty"])
        self.assertTrue(proof["pythonDerivationVerified"])
        self.assertEqual(
            [row["kind"] for row in proof["editions"]], ["plain", "staging", "production"]
        )
        components = proof["baseComponents"]
        base = {
            key: components[key]
            for key in ["engine", "scenes", "assets", "producer", "routes", "variant", "contract"]
        }
        base_engine = hashlib.sha256(
            (json.dumps(base, ensure_ascii=False, indent=2) + "\n").encode()
        ).hexdigest()

        def digest(value):
            return hashlib.sha256(
                json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()
            ).hexdigest()

        plain = digest({"contract": 1, "baseEngine": base_engine, "parts": proof["parts"]})
        descriptor = proof["descriptors"]["staging"]
        staged = digest(
            {
                "contract": 1,
                "edition": descriptor["edition"],
                "baseEngine": plain,
                "css": descriptor["css"],
                "producer": descriptor["producer"],
                "inputs": descriptor["inputs"],
            }
        )
        descriptor = proof["descriptors"]["production"]
        production = digest(
            {
                "contract": 1,
                "edition": descriptor["edition"],
                "baseEngine": plain,
                "css": descriptor["css"],
                "producer": descriptor["producer"],
                "inputs": descriptor["inputs"],
            }
        )
        for row, expected in zip(proof["editions"], [plain, staged, production], strict=True):
            self.assertEqual(row["variant"]["baseEngine"], base_engine)
            self.assertEqual(row["variant"]["fingerprint"], expected)
            self.assertFalse(row["sourceDirty"])
            self.assertEqual(
                set(row["files"]),
                {"styles.css", "space.js", "navigation.js", "theme.js", "archive.js"},
            )
            for record in row["files"].values():
                self.assertTrue(record["baselineBytesEqual"])
                self.assertTrue(record["canonicalAndImmutableEqual"])
                self.assertEqual(record["sha256"], record["independentPythonSha256"])
        script = """
const fs=require('node:fs'),z=require('node:zlib'),a=require('node:assert/strict'),m=require('./tools/quality/color-motion-contract.cjs');
const p=JSON.parse(z.gunzipSync(fs.readFileSync('review/issue-39/2026-10-16-compact-tuples.json.gz')));
for(const row of p.editions){const id='issue39-licensed-compact-'+row.kind,known=m.reviewedRuntime(id),old=m.reviewedRuntime('issue39-licensed-'+row.kind),files={};
a.deepEqual(known.variant,row.variant);a.deepEqual(known.files,old.files);
for(const [name,record]of Object.entries(row.files)){a.equal(record.sha256,known.files[name]);for(const file of [name,'runtime/'+row.variant.fingerprint+'/'+name])files[file]=record;}
const candidate={variant:row.variant,components:{contract:1,engine:row.variant.fingerprint,variant:row.variant},files,...(row.edition?{edition:row.edition}:{})};a.equal(m.select(candidate).id,id);}
"""
        result = subprocess.run(
            ["node", "-e", script], cwd=ROOT, capture_output=True, text=True, timeout=30
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_installed_python_graph_contracts(self):
        original = subprocess.check_output(
            [
                "git",
                "show",
                "315da39d0294d970809648cdc0725f7e63187602:tools/quality/toolchain/requirements.txt",
            ],
            cwd=ROOT,
        )
        expected = original.replace(b"mcp==1.29.0\n", b"mcp==1.30.0\n").replace(
            b"pillow==12.3.0\n", b"pillow==12.3.0\npip==26.2.1\n"
        )
        self.assertEqual((ROOT / "tools/quality/toolchain/requirements.txt").read_bytes(), expected)
        tools = Path(os.environ.get("SITE_AUDIT_TOOLS", ROOT / "tools/quality/toolchain"))
        executable = (
            tools / "venv" / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
        )
        script = """
import json, unittest
suite = unittest.defaultTestLoader.discover('tests', pattern='test_python_toolchain.py')
result = unittest.TextTestRunner(verbosity=1).run(suite)
print(json.dumps({'pass': result.wasSuccessful(), 'tests': result.testsRun,
                  'skips': len(result.skipped), 'expectedFailures': len(result.expectedFailures)}))
"""
        result = subprocess.run(
            [str(executable), "-c", script],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report, {"pass": True, "tests": 4, "skips": 0, "expectedFailures": 0})

    def test_provider_snapshot_records_observations_and_unknown_admin_state(self):
        data = read(SNAPSHOT)
        self.assertEqual((data["schema"], data["issue"], data["source_commit"]), (1, 39, BASE))
        self.assertEqual(data["repository"], "oborskyivitalii/oborskyivitalii")
        self.assertFalse(data["github"]["pages_administration"]["available_via_plugin"])
        self.assertEqual(
            data["github"]["pages_administration"]["live_pages_settings"], "unobserved"
        )
        self.assertFalse(data["github"]["active_pages_deploy_workflow"])
        self.assertEqual(
            {z["name"] for z in data["cloudflare"]["zones"]},
            {"vitaliioborskyi.ai", "vitaliioborskyi.com"},
        )
        for zone in data["cloudflare"]["zones"]:
            self.assertEqual(zone["status"], "active")
            self.assertEqual(zone["dns_records"], [])
            self.assertEqual(zone["redirect_entrypoint"], "absent")
            self.assertEqual((zone["page_rules_count"], zone["worker_routes_count"]), (0, 0))
            self.assertTrue(zone["universal_ssl_enabled"])
            self.assertEqual(zone["universal_certificate_status"], "active")
        self.assertTrue(data["mutations"])
        self.assertFalse(any(data["mutations"].values()))
        self.assertIn("no write attempted", data["cloudflare"]["capabilities"]["dns_edit"])

    def test_finite_dns_and_redirect_contract(self):
        validate_plan(read(PLAN))

    def test_bad_origin_proxy_hosts_query_and_order_are_rejected(self):
        original = read(PLAN)
        mutations = [
            lambda p: p.update(canonical_origin="http://vitaliioborskyi.ai"),
            lambda p: p.update(canonical_origin="https://vitaliioborskyi.ai/oborskyivitalii"),
            lambda p: p["dns"]["vitaliioborskyi.ai"][0].update(proxied=True),
            lambda p: p["dns"]["vitaliioborskyi.ai"][0].update(content="192.0.2.1"),
            lambda p: p["dns"]["vitaliioborskyi.com"][0].update(proxied=False),
            lambda p: p["dns"]["vitaliioborskyi.ai"][0].update(name="*"),
            lambda p: p["dns"]["vitaliioborskyi.ai"].append(
                copy.deepcopy(p["dns"]["vitaliioborskyi.ai"][0])
            ),
            lambda p: p["com_redirect"]["rule"].update(
                expression='http.host contains "vitaliioborskyi"'
            ),
            lambda p: p["com_redirect"]["rule"]["action_parameters"]["from_value"].update(
                preserve_query_string=False
            ),
            lambda p: p["com_redirect"]["rule"]["action_parameters"]["from_value"].update(
                status_code=302
            ),
            lambda p: p["github"].update(publishing_source="Deploy from a branch"),
            lambda p: p["github"].update(ownership_txt_value="invented-challenge"),
            lambda p: p.update(activation_applied=True),
            lambda p: p["activation_order"].reverse(),
        ]
        for index, mutate in enumerate(mutations):
            with self.subTest(mutation=index):
                changed = copy.deepcopy(original)
                mutate(changed)
                with self.assertRaises(ValueError):
                    validate_plan(changed)

    def test_planned_redirect_fixtures_preserve_path_and_query(self):
        plan = read(PLAN)
        for host in RULE_HOSTS:
            for scheme in ["http", "https"]:
                for suffix in [
                    "/",
                    "/writing.html?topic=systems&language=uk",
                    "/research.html",
                    "/media/example%20file.svg?x=1&x=2",
                    "/writing.html?empty=&encoded=%2F%3F",
                ]:
                    self.assertEqual(
                        planned_redirect(plan, f"{scheme}://{host}{suffix}"),
                        (301, f"https://vitaliioborskyi.ai{suffix}"),
                    )
        for source in [
            "https://vitaliioborskyi.ai/",
            "https://www.vitaliioborskyi.ai/",
            "https://evilvitaliioborskyi.com/",
            "https://vitaliioborskyi.com.evil.test/",
            "https://user@vitaliioborskyi.com/",
            "ftp://vitaliioborskyi.com/",
        ]:
            with self.subTest(source=source), self.assertRaises(ValueError):
                planned_redirect(plan, source)

    def test_current_main_authored_edition_and_runtime_bytes_are_preserved(self):
        # The 2026-10-15 implementation decision permits changed delivery owners
        # and generated identities. The later approved licensing selection names
        # exact Credits owners and one legal-copy wrapping rule below. Keep every
        # other authored/runtime byte and the complete retained history unchanged.
        runtime = [
            "docs/" + name
            for name in ("styles.css", "theme.js", "space.js", "archive.js", "navigation.js")
        ]
        protected = ["site", *runtime]
        changed_configuration = {"site/analytics.json", "site/output-lock.json"}
        additions = {
            "site/content/production-social.json",
            "site/rights.json",
            "site/templates/components/legal-notices.html",
        }
        legal_amendments = {
            # Selected in live #7/#39 licensing-selection-20261015; all other
            # original tokens and routes remain protected by the baseline below.
            'site/content/pages/credits/main.json': "4d3b70b91dca37af7dd67a9b3de9b5a8e8f48825b689f982d046539f3e8f69a2",
            'site/templates/pages/credits/main.html': "14e369575829e251620e2b3ca3400c7c4c6b02f9d81876e33a83540070437e0c",
        }
        # Exact selected PR68 edition; remaining current-main bytes stay protected.
        # Source commit: c3b8fb7d0b7a127363f24cdacb8a36c3f811054a.
        editorial_amendments = {
            "site/content/pages/index/about.json": "ab5c825a5e899b37ac45935dd76610f5fd09b551",
            "site/content/pages/index/acknowledgements.json": "a6f293f39aef21ad38627a3f677cb846dc41c267",
            "site/content/pages/index/contact.json": "c5e831bdd277c1105181d97bc0981b1d4a5893d2",
            "site/content/pages/index/help.json": "1265e8d20ce4b0d9249fb5d87ec6e19470da665d",
            "site/content/pages/index/hero.json": "57b847b3a62cb9f3702e52b3e8d4375e5404411d",
            "site/content/pages/index/main.json": "d4912bee32ed3ef7a0d3f3bb1b63eb5d61128c14",
            "site/content/pages/research/acknowledgements.json": "88131da87ebf3fe2ba81226df036dafeb2bebd99",
            "site/templates/pages/index/acknowledgements.html": "e12511ddaf39a6d41439d4a3e97da083be549366",
            "site/templates/pages/research/acknowledgements.html": "e22f50a3fbc6f0c32a5c7116aac33f480fa0d67f",
        }
        entries = subprocess.check_output(
            ["git", "ls-tree", "-r", CURRENT_MAIN, "--", *protected],
            cwd=ROOT,
            text=True,
        ).splitlines()
        self.assertGreater(len(entries), 100)
        baseline = {}
        for entry in entries:
            metadata, name = entry.split("\t")
            mode, kind, blob = metadata.split()
            self.assertEqual((mode, kind), ("100644", "blob"))
            baseline[name] = blob
        self.assertTrue(set(editorial_amendments).issubset(baseline))
        current = set()
        for parent in protected:
            owner = ROOT / parent
            paths = [owner] if owner.is_file() else owner.rglob("*")
            for path in paths:
                self.assertFalse(path.is_symlink(), str(path))
                if path.is_file():
                    current.add(path.relative_to(ROOT).as_posix())
        self.assertEqual(current, set(baseline) | additions)
        for name, blob in baseline.items():
            self.assertFalse((ROOT / name).is_symlink(), name)
            if name in changed_configuration:
                continue
            data = (ROOT / name).read_bytes()
            if name == "site/README.md":
                # #39 readiness-execution-20261016 corrects this delivery wording
                # only. Every remaining source-contract byte stays protected.
                current_wording = (
                    b"The base edition is the default producer selection. The delivery adapters select\n"
                    b"Color explicitly for preview, staging and the separately frozen production\n"
                    b"candidate; each requires its own matching verification. Offline exports accept\n"
                )
                self.assertEqual(data.count(current_wording), 1)
                data = data.replace(
                    current_wording,
                    b"The base edition remains the deployable producer selection. Offline exports accept\n",
                    1,
                )
            if name in legal_amendments:
                self.assertEqual(hashlib.sha256(data).hexdigest(), legal_amendments[name], name)
                continue
            if name in {"site/engine/styles.css", "docs/styles.css"}:
                self.assertEqual(data.count(LEGAL_CSS), 1, name)
                data = data.replace(LEGAL_CSS, b"", 1)
            actual = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
            self.assertEqual(actual, editorial_amendments.get(name, blob), name)
        credits_path = "site/content/pages/credits/main.json"
        original_credits = json.loads(
            subprocess.check_output(
                ["git", "show", CURRENT_MAIN + ":" + credits_path], cwd=ROOT, text=True
            )
        )
        current_credits = read(credits_path)
        for key, value in original_credits["text"].items():
            if key not in {"T006", "T012"}:
                self.assertEqual(current_credits["text"][key], value, key)
        for key, value in original_credits["urls"].items():
            self.assertEqual(current_credits["urls"][key], value, key)
        self.assertEqual(current_credits["attributes"], original_credits["attributes"])
        component = ROOT / "site/templates/components/legal-notices.html"
        self.assertEqual(
            hashlib.sha256(component.read_bytes()).hexdigest(),
            "5014d96005546362b44cd9191e1c0d6fcd904bdb2553b8453ead6d6e9cad6148",
        )
        analytics = read("site/analytics.json")
        self.assertEqual(analytics["provider"], "cloudflare")
        self.assertIs(analytics["enabled"], True)
        self.assertEqual(analytics["siteURL"], "https://vitaliioborskyi.ai/")
        self.assertRegex(analytics["token"], r"^[a-f0-9]{32}$")

    def test_production_color_seo_retention_rights_and_analytics_contracts(self):
        node_contracts(
            self,
            [
                "tests/release-controller.test.cjs",
                "tests/release-archive.test.cjs",
                "tests/color-motion-contract.test.cjs",
                "tests/edition-retention.test.cjs",
                "tests/release-rights.test.cjs",
                "tests/analytics.test.cjs",
            ],
        )

    def test_pages_migration_authenticates_settings_source_and_recovery(self):
        node_contracts(
            self,
            ["tests/pages-migration.test.cjs", "tests/pages-delivery.test.cjs"],
        )

    def test_operator_routes_and_policy_keep_external_gates_pending(self):
        path = ROOT / "tools/issue_acceptance.py"
        spec = importlib.util.spec_from_file_location("issue39_acceptance", path)
        module = importlib.util.module_from_spec(spec)
        exec(compile(path.read_bytes(), str(path), "exec"), module.__dict__)
        policy, _ = module.load_policy(ROOT / ".github/acceptance/issue-39.json")
        self.assertEqual(policy["issue"], 39)
        self.assertEqual([c["id"] for c in policy["criteria"]], [f"AC{i:02}" for i in range(1, 6)])
        self.assertEqual(policy["gates"]["LIVE-DOMAINS"]["kind"], "human")
        self.assertIn("LIVE-DOMAINS", policy["criteria"][-1]["gates"])
        for criterion in policy["criteria"]:
            self.assertTrue(criterion["gates"], criterion["id"])
        self.assertEqual(policy["gates"]["PRODUCTION-ADMISSION"]["kind"], "human")
        self.assertEqual(policy["gates"]["OWNER-SETTINGS"]["kind"], "human")
        self.assertEqual(policy["gates"]["REVIEW"]["kind"], "human")
        self.assertEqual(policy["gates"]["MERGE"]["kind"], "merge")
        guide = (ROOT / "guides/SITE-PRODUCTION.md").read_text()
        for url in [
            "https://github.com/settings/pages",
            "https://github.com/oborskyivitalii/oborskyivitalii/settings/pages",
            "https://github.com/oborskyivitalii/oborskyivitalii/settings/environments",
        ]:
            self.assertIn(url, guide)
        # These assertions prove routes/policy structure, not usefulness or actual UI completion.
        analysis = (ROOT / "review/issue-39/2026-10-07-analysis.md").read_text()
        self.assertIn("issues/39", analysis)
        self.assertIn(BASE, analysis)
        self.assertRegex(analysis, r"(?m)^## Sol tasks$")

    def test_flight_resource_telemetry_preserves_original_failure(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/staging-regression.test.cjs"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        for name in (
            "post-flight resource collection selects only the two current same-origin fetches without truncating overflow",
            "flight fetch evidence separates response completion from preparation and rejects invalid unbounded records",
            "flight driver collects resources only after the original window and preserves the native latency failure",
        ):
            self.assertIn("# Subtest: " + name + "\n", result.stdout)
        for label in ("fail", "cancelled", "skipped", "todo"):
            self.assertRegex(result.stdout, rf"(?m)^# {label} 0$", result.stdout)
        total = re.search(r"(?m)^# tests ([1-9][0-9]*)$", result.stdout)
        passed = re.search(r"(?m)^# pass ([1-9][0-9]*)$", result.stdout)
        self.assertIsNotNone(total, result.stdout)
        self.assertIsNotNone(passed, result.stdout)
        self.assertEqual(total.group(1), passed.group(1), result.stdout)

    def test_versioned_snapshot_host_policy_preserves_legacy_and_rejects_arbitrary_routes(self):
        result = subprocess.run(
            [
                "node",
                "--test",
                "--test-reporter=tap",
                "tests/staging.test.cjs",
                "tests/review-flow.test.cjs",
            ],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        for name in (
            "default staging host generation and archived legacy verification preserve exact pinned-main bytes",
            "versioned snapshot proxy policy binds only admitted immutable HTML and preserves source bytes",
            "snapshot proxy policy rejects missing flags, mutated rules and inconsistent source or package records",
            "selected snapshot proxy staging requires zero redirects and exact immutable response bodies",
            "finite snapshot proxy preview observes direct 200 and exact immutable bodies before admission",
        ):
            self.assertIn("# Subtest: " + name + "\n", result.stdout)
        for label in ("fail", "cancelled", "skipped", "todo"):
            self.assertRegex(result.stdout, rf"(?m)^# {label} 0$", result.stdout)
        total = re.search(r"(?m)^# tests ([1-9][0-9]*)$", result.stdout)
        passed = re.search(r"(?m)^# pass ([1-9][0-9]*)$", result.stdout)
        self.assertIsNotNone(total, result.stdout)
        self.assertIsNotNone(passed, result.stdout)
        self.assertEqual(total.group(1), passed.group(1), result.stdout)


if __name__ == "__main__":
    unittest.main()
