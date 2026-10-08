# SPDX-License-Identifier: Apache-2.0
"""Issue #35 task evidence. The owning policy selects this module explicitly.

These source-bound tests do not manufacture a hosted run, an independent review,
production acceptance, or a decision to close issue #13.
"""

import hashlib
import importlib.util
import json
import re
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
BASE = "ec9b8361b619f1042bce5a3ec224d3e0c9054b01"
POLICY = ".github/acceptance/issue-35.json"
ACCOUNTING = ("tests", "suites", "pass", "fail", "cancelled", "skipped", "todo")


def git(*arguments):
    return subprocess.check_output(["git", "-C", str(REPO), *arguments])


def base_files(*prefixes):
    return {
        path.decode("utf-8")
        for path in git("ls-tree", "-r", "--name-only", "-z", BASE, "--", *prefixes).split(b"\0")
        if path
    }


def base_bytes(path):
    return git("show", f"{BASE}:{path}")


def blob_digest(content):
    return hashlib.sha1(b"blob " + str(len(content)).encode() + b"\0" + content).hexdigest()


def base_blobs(*prefixes):
    records = git("ls-tree", "-r", "-z", BASE, "--", *prefixes).split(b"\0")
    result = {}
    for record in records:
        if record:
            identity, path = record.split(b"\t", 1)
            mode, kind, sha = identity.split()
            if kind != b"blob" or mode not in {b"100644", b"100755"}:
                raise ValueError("Unsupported accepted source kind")
            result[path.decode("utf-8")] = sha.decode("ascii")
    return result


def unchanged_bytes(root, expected, *, git_blobs=False):
    for path, digest in expected.items():
        actual = root / path
        if not actual.is_file() or actual.is_symlink():
            raise ValueError(f"Missing accepted source: {path}")
        content = actual.read_bytes()
        observed = blob_digest(content) if git_blobs else hashlib.sha256(content).hexdigest()
        if observed != digest:
            raise ValueError(f"Changed accepted source: {path}")


def tap_accounting(tap, module=None):
    """Require one complete real Node summary, with no omitted/skipped failures."""
    result = {}
    for key in ACCOUNTING:
        matches = re.findall(rf"^# {key} ([0-9]+)$", tap, flags=re.MULTILINE)
        if len(matches) != 1:
            raise ValueError(f"Missing or ambiguous TAP accounting: {key}")
        result[key] = int(matches[0])
    if result["tests"] < 1 or result["pass"] != result["tests"]:
        raise ValueError("Node tests must execute and all pass")
    if any(result[key] != 0 for key in ("fail", "cancelled", "skipped", "todo")):
        raise ValueError("Failed, cancelled, skipped or TODO tests cannot pass")
    # Node reports an empty file itself as one passing test. That file wrapper
    # cannot establish that a targeted regression case actually executed.
    titles = re.findall(r"^\s*# Subtest: (.+)$", tap, flags=re.MULTILINE)
    if module is not None:
        titles = [title for title in titles if Path(title).resolve() != Path(module).resolve()]
    if not titles:
        raise ValueError("Node module executed no named regression cases")
    result["case_names"] = titles
    return result


def run_node(module):
    process = subprocess.run(
        ["node", "--test", "--test-reporter=tap", str(module)],
        cwd=REPO,
        capture_output=True,
        text=True,
        timeout=120,
        check=False,
    )
    if process.returncode != 0:
        raise AssertionError(
            f"Node module failed: {module}\n{process.stdout[-5000:]}\n{process.stderr[-2000:]}"
        )
    return tap_accounting(process.stdout, module)


def load_tool(name):
    source = REPO / "tools" / (name + ".py")
    spec = importlib.util.spec_from_file_location("issue35_" + name, source)
    module = importlib.util.module_from_spec(spec)
    exec(compile(source.read_bytes(), str(source), "exec"), module.__dict__)
    return module


class Issue35AcceptanceTests(unittest.TestCase):
    def test_complete_base_test_audit_has_identity_and_dispositions(self):
        audit = json.loads((REPO / "review/issue-35/2026-10-07-test-audit.json").read_text())
        self.assertEqual(audit["issue"], 35)
        self.assertEqual(audit["inspected_source"], BASE)
        expected = {
            path
            for path in base_files("tests")
            if re.fullmatch(r"tests/(?:[a-z0-9-]+\.test\.cjs|test_[a-z0-9_]+\.py)", path)
        }
        rows = audit["tests"]
        self.assertTrue(expected)
        self.assertEqual(len(rows), len(expected))
        self.assertEqual({row["path"] for row in rows}, expected)
        self.assertEqual(audit["counts"]["all_modules"], len(expected))
        for row in rows:
            with self.subTest(path=row["path"]):
                self.assertEqual(
                    row["source_sha256"], hashlib.sha256(base_bytes(row["path"])).hexdigest()
                )
                for key in ("purpose", "owner", "disposition", "surviving_route"):
                    self.assertTrue(row[key], key)
                self.assertTrue(row["profiles"])
                self.assertTrue((REPO / row["owner"]).is_file())
        self.assertTrue(audit["findings"])
        for finding in audit["findings"]:
            self.assertTrue(finding["id"])
            self.assertTrue(finding["evidence"])
            self.assertTrue(finding["recommendation"])

    def test_test_profile_registry_selection_and_accounting(self):
        run_node(REPO / "tests/test-profile-selection.test.cjs")

    def test_staging_regression_matrix_and_raw_measurements(self):
        run_node(REPO / "tests/staging-regression.test.cjs")

    def test_staging_gate_exact_identity_and_failure_propagation(self):
        run_node(REPO / "tests/staging-gate.test.cjs")

    def test_profile_controller_candidate_leases_and_promotion_boundaries(self):
        run_node(REPO / "tests/review-flow.test.cjs")

    def test_staging_caller_source_and_recovery_artifact_trust(self):
        run_node(REPO / "tests/staging-trust.test.cjs")

    def test_original_production_guard_controlled_negative_fixtures(self):
        # Includes the complete production fixture plus missing native, duplicate,
        # raw-metric, source/artifact/variant and external device-evidence failures.
        report = run_node(REPO / "tests/quality.test.cjs")
        original_names = re.findall(
            r"(?m)^test\('([^'\n]+)'", base_bytes("tests/quality.test.cjs").decode()
        )
        self.assertTrue(original_names)
        self.assertEqual(
            report["case_names"],
            original_names,
            "Every original production guard case must actually execute once",
        )

    def test_node_bridge_rejects_empty_failed_skipped_and_todo_modules(self):
        with tempfile.TemporaryDirectory() as directory:
            module = Path(directory) / "fixture.test.cjs"
            module.write_text("const test=require('node:test');test('control',()=>{});\n")
            self.assertEqual(run_node(module)["tests"], 1)
            for source, error in [
                ("", ValueError),
                (
                    "const test=require('node:test');test('controlled failure',()=>{throw Error('failure');});",
                    AssertionError,
                ),
                (
                    "const test=require('node:test');test('controlled skip',{skip:true},()=>{});",
                    ValueError,
                ),
                ("const test=require('node:test');test.todo('controlled TODO');", ValueError),
            ]:
                module.write_text(source)
                with self.subTest(source=source), self.assertRaises(error):
                    run_node(module)
        summary = "# Subtest: control\nok 1 - control\n" + "\n".join(
            f"# {key} {1 if key in {'tests', 'pass'} else 0}" for key in ACCOUNTING
        )
        self.assertEqual(tap_accounting(summary)["pass"], 1)
        for bad in (
            summary.replace("# skipped 0", ""),
            summary + "\n# tests 1",
            summary.replace("# cancelled 0", "# cancelled 1"),
        ):
            with self.assertRaises(ValueError):
                tap_accounting(bad)

    def test_production_validators_and_metric_security_budgets_are_unchanged(self):
        protected = [
            "tools/quality/validate.cjs",
            "tools/quality/promotion.cjs",
            "tools/quality/budgets.json",
            "tools/quality/selftest.cjs",
            "tools/quality/security-rules.yml",
            "tools/quality/exceptions.json",
            "tools/quality/advisory-exceptions.json",
            "tools/quality/toolchain/package-lock.json",
            "tools/quality/toolchain/requirements.txt",
        ]
        unchanged_bytes(
            REPO, {path: hashlib.sha256(base_bytes(path)).hexdigest() for path in protected}
        )

    def test_public_runtime_and_previous_review_evidence_are_unchanged(self):
        expected = base_blobs("docs", "site", "review")
        self.assertTrue(expected)
        # One source-tree query binds the immutable original Git blobs, avoiding
        # a separate subprocess for each of the many historical/public files.
        unchanged_bytes(REPO, expected, git_blobs=True)
        # New internal review records are allowed; new served/runtime bytes are not.
        for directory in ("docs", "site"):
            actual = {
                path.relative_to(REPO).as_posix()
                for path in (REPO / directory).rglob("*")
                if path.is_file()
            }
            self.assertEqual(
                actual, {path for path in expected if path.startswith(directory + "/")}
            )

    def test_fixed_source_invariants_reject_modified_or_deleted_bytes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            path = root / "docs/index.html"
            source = b"<main>Accepted publication</main>\n"
            for git_blobs in (False, True):
                digest = blob_digest(source) if git_blobs else hashlib.sha256(source).hexdigest()
                expected = {"docs/index.html": digest}
                path.write_bytes(source)
                unchanged_bytes(root, expected, git_blobs=git_blobs)
                path.write_bytes(source + b"<!-- changed -->\n")
                with self.assertRaisesRegex(ValueError, "Changed accepted source"):
                    unchanged_bytes(root, expected, git_blobs=git_blobs)
                path.unlink()
                with self.assertRaisesRegex(ValueError, "Missing accepted source"):
                    unchanged_bytes(root, expected, git_blobs=git_blobs)

    def test_policy_has_seven_criteria_shared_checks_and_external_gates(self):
        acceptance = load_tool("issue_acceptance")
        policy, _ = acceptance.load_policy(REPO / POLICY)
        self.assertEqual(policy["repository"], "oborskyivitalii/oborskyivitalii")
        self.assertEqual(policy["issue"], 35)
        self.assertEqual(
            [row["id"] for row in policy["criteria"]], [f"AC{n:02}" for n in range(1, 8)]
        )
        self.assertEqual(
            {key: value["kind"] for key, value in policy["gates"].items()},
            {"G01": "human", "G02": "merge", "G03": "human"},
        )
        self.assertTrue(
            all(check["kind"] == "unittest" for check in policy["checks"].values()),
            "The targeted policy must not repeat the separately executed Basic smoke",
        )
        methods = [check["test"] for check in policy["checks"].values()]
        self.assertEqual(
            len(methods), len(set(methods)), "One shared check ID executes each test once"
        )
        self.assertFalse(
            any(
                "test_issue31_acceptance." in method or "test_issue33_acceptance." in method
                for method in methods
            )
        )
        workflow = (REPO / ".github/workflows/issue-acceptance.yml").read_text()
        for bound in ("--require-clean", "--expected-source", "if: always()", "fetch-depth: 0"):
            self.assertIn(bound, workflow)

    def test_current_profile_controls_have_canonical_ri_owners_and_ci_routes(self):
        ri = load_tool("repository_intelligence")
        ci = load_tool("check_ri_ci")
        surface = ri.verify(REPO, ".github/repository-intelligence-config.json")
        self.assertTrue(ci.verify(REPO)["pass"])
        catalog = json.loads((REPO / ".github/repository-paths.json").read_text())["entries"]
        profile_controls = [
            "tools/quality/test-profiles.json",
            "tools/quality/source-tests.cjs",
            "tests/test-profile-selection.test.cjs",
            "tools/quality/staging-regression.cjs",
            "tools/quality/staging-gate.cjs",
            "tests/staging-regression.test.cjs",
            "tests/staging-gate.test.cjs",
        ]
        artifact_paths = {row["path"] for row in surface["artifacts"]}
        for path in profile_controls:
            with self.subTest(path=path):
                self.assertIn(path, artifact_paths)
                self.assertIn(path, catalog)
                self.assertTrue((REPO / catalog[path]["owner"]).is_file())
                self.assertIn(
                    catalog[path]["owner"],
                    {
                        "guides/SITE-CHECK-PROFILES.md",
                        "guides/SITE-RELEASE-GATES.md",
                        "guides/SITE-STAGING.md",
                        ".github/REPOSITORY-INTELLIGENCE.md",
                    },
                )

    def test_issue13_reconciliation_records_all_original_criteria_and_remaining_gates(self):
        text = (REPO / "review/issue-35/2026-10-07-issue13-audit.md").read_text()
        self.assertIn(BASE, text)
        rows = [line for line in text.splitlines() if re.match(r"\| 13-AC[1-7]:", line)]
        self.assertEqual(len(rows), 7)
        self.assertEqual({re.search(r"13-AC([1-7]):", row)[1] for row in rows}, set("1234567"))
        for row in rows:
            self.assertEqual(len(row.split("|")), 6)
            self.assertTrue(all(cell.strip() for cell in row.split("|")[1:-1]))
        self.assertIn("## Remaining current-release obligations", text)
        for pending in (
            "Physical iPhone/iPad",
            "Independent production-release review",
            "ZAP",
            "rollback",
        ):
            self.assertIn(pending, text)
        # This proves a complete recorded disposition, never that gates passed or
        # that GitHub #13 was closed. Those are G03 live/human observations.

    def test_analysis_and_current_continuity_route_to_owning_issue(self):
        memory = (REPO / "MEMORY.md").read_text()
        self.assertIn("issues/35", memory)
        self.assertLessEqual(len(memory.splitlines()), 120)
        analysis = (REPO / "review/issue-35/2026-10-07-analysis.md").read_text()
        self.assertIn(BASE, analysis)
        self.assertIn("issues/35", analysis)
        self.assertIn("tools/quality/test-profiles.json", analysis)
        self.assertRegex(analysis, r"(?m)^## .*tasks")


if __name__ == "__main__":
    unittest.main()
