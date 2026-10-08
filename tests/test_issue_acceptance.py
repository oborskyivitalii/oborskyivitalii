# SPDX-License-Identifier: Apache-2.0
"""Negative accounting and binding tests for the issue acceptance runner."""

import importlib.util
import json
import os
import py_compile
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "issue_acceptance", REPO / "tools/issue_acceptance.py"
)
acceptance = importlib.util.module_from_spec(SPEC)
exec(
    compile(
        (REPO / "tools/issue_acceptance.py").read_bytes(),
        str(REPO / "tools/issue_acceptance.py"),
        "exec",
        dont_inherit=True,
    ),
    acceptance.__dict__,
)

FIXTURE_TESTS = """import unittest
class FixtureTests(unittest.TestCase):
    def test_ok(self):
        self.assertEqual(2 + 2, 4)
    def test_failed(self):
        self.fail('deliberate fixture failure')
    @unittest.skip('deliberate fixture skip')
    def test_skipped(self):
        self.fail('must never pass')
    @unittest.expectedFailure
    def test_expected_failure(self):
        self.fail('known failure still does not satisfy acceptance')
class EmptyTests(unittest.TestCase):
    def test_ok(self):
        pass
    def run(self, result):
        return result
"""


class AcceptanceRunnerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "tests").mkdir()
        (self.root / "tests/test_acceptance_fixture.py").write_text(FIXTURE_TESTS)
        (self.root / ".gitignore").write_text("__pycache__/\n")
        (self.root / "source.txt").write_text("Original source\n")
        self.path = self.root / "policy.json"
        self.policy = {
            "schema_version": 1,
            "repository": "example/repo",
            "issue": 31,
            "issue_url": "https://github.com/example/repo/issues/31",
            "criteria": [
                {
                    "id": "AC01",
                    "intent": "One observable criterion",
                    "automated_scope": "Fixture arithmetic, not semantic review",
                    "checks": ["CHECK1"],
                    "gates": ["REVIEW", "MERGE"],
                }
            ],
            "checks": {
                "CHECK1": {
                    "kind": "unittest",
                    "test": "test_acceptance_fixture.FixtureTests.test_ok",
                }
            },
            "gates": {
                "REVIEW": {"kind": "human", "description": "Independent review"},
                "MERGE": {"kind": "merge", "description": "Normal protected merge"},
            },
        }
        self.save()
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        subprocess.run(["git", "-C", str(self.root), "add", "."], check=True)
        subprocess.run(
            [
                "git",
                "-C",
                str(self.root),
                "-c",
                "user.name=Acceptance fixture",
                "-c",
                "user.email=fixture@example.invalid",
                "commit",
                "-qm",
                "Fixture",
            ],
            check=True,
        )

    def save(self):
        self.path.write_text(json.dumps(self.policy), encoding="utf-8")

    def run_policy(self, **kwargs):
        return acceptance.run_policy(self.root, self.path, **kwargs)

    def test_success_reports_exact_source_and_pending_gates(self):
        first = self.run_policy(require_clean=True)
        second = self.run_policy(require_clean=True)
        self.assertEqual(first, second)
        self.assertTrue(first["automation_pass"])
        self.assertFalse(first["ready_for_issue_closure"])
        self.assertFalse(first["source"]["source_dirty"])
        self.assertEqual(
            first["source"]["commit_sha"], acceptance.git(self.root, "rev-parse", "HEAD")
        )
        self.assertEqual(first["policy_sha256"], acceptance.digest(self.path.read_bytes()))
        self.assertEqual(first["checks"]["CHECK1"]["tests_run"], 1)
        self.assertTrue(
            all(
                gate["status"] == "pending" and gate["evidence"] is None
                for gate in first["gates"].values()
            )
        )

    def test_empty_and_unmapped_criteria_fail(self):
        for mutation in [
            lambda: self.policy.update(criteria=[]),
            lambda: self.policy.update(checks={}),
            lambda: self.policy["criteria"][0].update(checks=[], gates=[]),
            lambda: self.policy["criteria"][0].update(checks=["MISSING"]),
            lambda: self.policy["criteria"][0].update(checks=[{}]),
        ]:
            original = json.loads(json.dumps(self.policy))
            mutation()
            self.save()
            with self.subTest(policy=self.policy):
                self.assertFalse(self.run_policy()["automation_pass"])
            self.policy = original

    def test_duplicate_or_orphan_mapping_fails(self):
        for mutation in [
            lambda: self.policy["criteria"].append(dict(self.policy["criteria"][0])),
            lambda: self.policy["criteria"][0].update(checks=["CHECK1", "CHECK1"]),
            lambda: self.policy["checks"].update(ORPHAN=dict(self.policy["checks"]["CHECK1"])),
            lambda: self.policy["gates"].update(ORPHAN={"kind": "human", "description": "Orphan"}),
        ]:
            original = json.loads(json.dumps(self.policy))
            mutation()
            self.save()
            with self.subTest(policy=self.policy):
                self.assertFalse(self.run_policy()["automation_pass"])
            self.policy = original

    def test_skipped_failed_expected_and_empty_tests_cannot_pass(self):
        names = [
            "FixtureTests.test_failed",
            "FixtureTests.test_skipped",
            "FixtureTests.test_expected_failure",
            "EmptyTests.test_ok",
        ]
        for name in names:
            self.policy["checks"]["CHECK1"]["test"] = "test_acceptance_fixture." + name
            self.save()
            with self.subTest(name=name):
                report = self.run_policy()
                self.assertFalse(report["automation_pass"])
                self.assertEqual(report["criteria"][0]["status"], "failed")

    def test_missing_named_tests_fail(self):
        for name in [
            "test_absent.FixtureTests.test_ok",
            "test_acceptance_fixture.AbsentTests.test_ok",
            "test_acceptance_fixture.FixtureTests.test_absent",
        ]:
            self.policy["checks"]["CHECK1"]["test"] = name
            self.save()
            with self.subTest(name=name):
                self.assertEqual(self.run_policy()["checks"]["CHECK1"]["status"], "failed")

    def test_policy_cannot_supply_shell_code_arguments_or_approval(self):
        for mutation in [
            lambda: self.policy["checks"]["CHECK1"].update(kind="shell", command="echo pass"),
            lambda: self.policy["checks"]["CHECK1"].update(test="os.system"),
            lambda: self.policy["checks"]["CHECK1"].update(args=["--ignore-failure"]),
            lambda: self.policy["gates"]["REVIEW"].update(status="passed"),
            lambda: self.policy["gates"]["MERGE"].update(kind="automatic"),
        ]:
            original = json.loads(json.dumps(self.policy))
            mutation()
            self.save()
            with self.subTest(policy=self.policy):
                self.assertFalse(self.run_policy()["automation_pass"])
            self.policy = original

    def test_manual_only_criterion_is_pending(self):
        self.policy["criteria"].append(
            {
                "id": "AC02",
                "intent": "Human semantic judgment",
                "automated_scope": "No automated claim",
                "checks": [],
                "gates": ["REVIEW"],
            }
        )
        self.save()
        report = self.run_policy()
        self.assertTrue(report["automation_pass"])
        self.assertEqual(report["criteria"][1]["status"], "manual-only-pending")
        self.assertFalse(report["ready_for_issue_closure"])

    def test_dirty_or_wrong_head_cannot_be_clean_source_evidence(self):
        report = self.run_policy(expected_source="0" * 40)
        self.assertFalse(report["automation_pass"])
        self.assertEqual(report["criteria"][0]["status"], "not-run")
        (self.root / "source.txt").write_text("Changed source\n")
        self.assertFalse(self.run_policy(require_clean=True)["automation_pass"])
        local = self.run_policy()
        self.assertTrue(local["automation_pass"])
        self.assertTrue(local["source"]["source_dirty"])
        self.assertFalse(local["ready_for_issue_closure"])

    def test_source_mutation_during_checks_invalidates_evidence(self):
        def mutation(root, name):
            (root / "source.txt").write_text("Changed while checking\n")
            return {"status": "passed"}

        with patch.object(acceptance, "unittest_check", mutation):
            report = self.run_policy()
        self.assertFalse(report["automation_pass"])
        self.assertIn("Source identity changed", report["errors"][0])
        self.assertEqual(report["criteria"][0]["status"], "invalidated")
        self.assertFalse(report["evidence_valid"])

    def test_policy_mutation_during_checks_invalidates_evidence(self):
        def mutation(root, name):
            self.path.write_text(self.path.read_text() + "\n")
            return {"status": "passed"}

        with patch.object(acceptance, "unittest_check", mutation):
            report = self.run_policy()
        self.assertFalse(report["automation_pass"])
        self.assertTrue(report["errors"])
        self.assertEqual(report["criteria"][0]["status"], "invalidated")
        self.assertFalse(report["evidence_valid"])

    def test_node_basic_is_fixed_and_missing_accounting_fails(self):
        valid = {
            "profile": "local",
            "pass": True,
            "checks": ["source"],
            "focusedTests": {"total": 2, "passed": 2, "failed": 0, "skipped": 0},
        }
        variants = [
            valid,
            {**valid, "focusedTests": {"total": 0, "passed": 0, "failed": 0, "skipped": 0}},
            {**valid, "focusedTests": {"total": 2, "passed": 1, "failed": 0, "skipped": 1}},
            {"pass": True},
        ]
        for payload in variants:
            process = subprocess.CompletedProcess([], 0, json.dumps(payload), "")
            with (
                self.subTest(payload=payload),
                patch.object(acceptance.subprocess, "run", return_value=process) as call,
            ):
                result = acceptance.node_basic_check(self.root)
                self.assertEqual(call.call_args.args[0], ["node", "tools/quality/local.cjs"])
                self.assertEqual(result["status"], "passed" if payload is valid else "failed")

    def test_cli_preserves_a_failure_report(self):
        self.policy["criteria"][0]["checks"] = ["MISSING"]
        self.save()
        report_path = self.root.parent / (self.root.name + "-acceptance.json")
        self.addCleanup(lambda: report_path.unlink(missing_ok=True))
        process = subprocess.run(
            [
                "python3",
                str(REPO / "tools/issue_acceptance.py"),
                "run",
                "--root",
                str(self.root),
                "--policy",
                str(self.path),
                "--report",
                str(report_path),
            ],
            text=True,
            capture_output=True,
        )
        self.assertEqual(process.returncode, 1)
        self.assertFalse(json.loads(report_path.read_text())["automation_pass"])

    def selection_fixture(self, body="Refs #31\n"):
        policy_directory = self.root / ".github/acceptance"
        policy_directory.mkdir(parents=True, exist_ok=True)
        (policy_directory / "issue-31.json").write_text(json.dumps(self.policy))
        event = {"repository": {"full_name": "example/repo"}, "pull_request": {"body": body}}
        path = self.root / "event.json"
        path.write_text(json.dumps(event))
        return event, path

    def test_selector_uses_only_explicit_local_refs(self):
        body = (
            "Refs #31\n\nPrior https://github.com/example/repo/issues/99 and #14.\n"
            "Refs https://github.com/upstream/research/issues/8\n"
        )
        event, path = self.selection_fixture(body)
        result = acceptance.select_policy(self.root, path, "pull_request")
        self.assertEqual(result["policy"], ".github/acceptance/issue-31.json")
        self.assertEqual(result["issue"], 31)
        event["pull_request"]["body"] = "Refs https://github.com/example/repo/issues/31\n"
        path.write_text(json.dumps(event))
        self.assertEqual(acceptance.select_policy(self.root, path, "pull_request")["issue"], 31)

    def test_selector_missing_ambiguous_or_malformed_owner_fails(self):
        bodies = [
            None,
            "https://github.com/example/repo/issues/31",
            "Refs #31\nRefs #32\n",
            "Refs #31, #32\n",
            "Refs #31\nRefs #N\n",
            "Refs #31; echo pass\n",
        ]
        for body in bodies:
            event, path = self.selection_fixture(body)
            with self.subTest(body=body), self.assertRaises(ValueError):
                acceptance.select_policy(self.root, path, "pull_request")

    def test_selector_dispatch_bounds_and_missing_policy_fail(self):
        event, path = self.selection_fixture()
        event["inputs"] = {"issue_number": "31"}
        path.write_text(json.dumps(event))
        self.assertEqual(
            acceptance.select_policy(self.root, path, "workflow_dispatch")["issue"], 31
        )
        for value in ["32", "../31", "31\nINJECTED=pass", "31;echo pass", "0", "9999999999", 31]:
            event["inputs"]["issue_number"] = value
            path.write_text(json.dumps(event))
            with self.subTest(value=value), self.assertRaises((ValueError, FileNotFoundError)):
                acceptance.select_policy(self.root, path, "workflow_dispatch")
        with self.assertRaises(ValueError):
            acceptance.select_policy(self.root, path, "push")

    def test_selector_wrong_policy_owner_and_symlink_fail(self):
        event, path = self.selection_fixture()
        policy_path = self.root / ".github/acceptance/issue-31.json"
        changed = dict(
            self.policy,
            repository="another/repo",
            issue_url="https://github.com/another/repo/issues/31",
        )
        policy_path.write_text(json.dumps(changed))
        with self.assertRaisesRegex(ValueError, "does not match"):
            acceptance.select_policy(self.root, path, "pull_request")
        policy_path.unlink()
        policy_path.symlink_to(self.path)
        with self.assertRaisesRegex(ValueError, "symlink"):
            acceptance.select_policy(self.root, path, "pull_request")

    def test_cli_selector_writes_safe_env_and_keeps_failure_report(self):
        event, path = self.selection_fixture()
        env_path = self.root / "github-env.txt"
        report_path = self.root.parent / (self.root.name + "-selection.json")
        self.addCleanup(lambda: report_path.unlink(missing_ok=True))
        command = [
            "python3",
            str(REPO / "tools/issue_acceptance.py"),
            "select",
            "--root",
            str(self.root),
            "--event",
            str(path),
            "--event-name",
            "pull_request",
            "--github-env",
            str(env_path),
            "--report",
            str(report_path),
        ]
        success = subprocess.run(command, text=True, capture_output=True)
        self.assertEqual(success.returncode, 0, success.stderr)
        self.assertEqual(
            env_path.read_text(),
            "ACCEPTANCE_POLICY=.github/acceptance/issue-31.json\nACCEPTANCE_ISSUE=31\n",
        )
        event["pull_request"]["body"] = "Refs #31; INJECTED=pass"
        path.write_text(json.dumps(event))
        failure = subprocess.run(command, text=True, capture_output=True)
        self.assertEqual(failure.returncode, 1)
        self.assertTrue(json.loads(report_path.read_text())["errors"])
        self.assertNotIn("INJECTED", env_path.read_text())

    def test_same_size_same_timestamp_bytecode_cannot_hide_new_source(self):
        path = self.root / "tests/test_acceptance_fixture.py"
        py_compile.compile(str(path), doraise=True)
        before = path.stat()
        original = path.read_bytes()
        changed = original.replace(b"self.assertEqual(2 + 2, 4)", b"self.assertEqual(2 + 2, 5)")
        self.assertEqual(len(original), len(changed))
        self.assertNotEqual(original, changed)
        path.write_bytes(changed)
        os.utime(path, ns=(before.st_atime_ns, before.st_mtime_ns))
        self.assertEqual(path.stat().st_mtime_ns, before.st_mtime_ns)
        result = acceptance.unittest_check(
            self.root, "test_acceptance_fixture.FixtureTests.test_ok"
        )
        self.assertEqual(result["status"], "failed")
        self.assertEqual(result["test_file_sha256"], acceptance.digest(changed))

    def test_module_setup_teardown_errors_and_skips_cannot_pass(self):
        path = self.root / "tests/test_acceptance_fixture.py"
        for hook in ["setUpModule", "tearDownModule"]:
            for outcome in [
                "raise RuntimeError('module hook failure')",
                "raise unittest.SkipTest('module hook skip')",
            ]:
                path.write_text(FIXTURE_TESTS + f"\ndef {hook}():\n    {outcome}\n")
                with self.subTest(hook=hook, outcome=outcome):
                    result = acceptance.unittest_check(
                        self.root, "test_acceptance_fixture.FixtureTests.test_ok"
                    )
                    self.assertEqual(result["status"], "failed")
                    self.assertTrue(result["failures"] or result["skipped"])
                    self.assertEqual(result["tests_run"], 0 if hook == "setUpModule" else 1)

    def test_temporary_test_module_registration_preserves_previous_module(self):
        marker = object()
        key = "test_acceptance_fixture"
        previous = sys.modules.get(key)
        sys.modules[key] = marker
        try:
            self.assertEqual(
                acceptance.unittest_check(self.root, key + ".FixtureTests.test_ok")["status"],
                "passed",
            )
            self.assertIs(sys.modules[key], marker)
            with self.assertRaises(AttributeError):
                acceptance.unittest_check(self.root, key + ".MissingTests.test_ok")
            self.assertIs(sys.modules[key], marker)
        finally:
            if previous is None:
                sys.modules.pop(key, None)
            else:
                sys.modules[key] = previous

    def test_filled_repository_pr_template_selects_its_owning_issue(self):
        template = (REPO / ".github/pull_request_template.md").read_text()
        self.assertIn("Refs #N", template)
        event, path = self.selection_fixture(template.replace("Refs #N", "Refs #31", 1))
        self.assertEqual(acceptance.select_policy(self.root, path, "pull_request")["issue"], 31)

    def test_selector_ignores_fenced_indented_and_commented_examples(self):
        examples = [
            "```md\nRefs #31\n```\n",
            "~~~\nRefs #31\n~~~\n",
            "<!--\nRefs #31\n-->\n",
            "    Refs #31\n",
            "\tRefs #31\n",
            "```html\n<!--\nRefs #31\n```\n",
        ]
        for example in examples:
            event, path = self.selection_fixture(example)
            with self.subTest(example=example), self.assertRaises(ValueError):
                acceptance.select_policy(self.root, path, "pull_request")
            active = dict(
                self.policy, issue=50, issue_url="https://github.com/example/repo/issues/50"
            )
            (self.root / ".github/acceptance/issue-50.json").write_text(json.dumps(active))
            event["pull_request"]["body"] = "Refs #50\n" + example
            path.write_text(json.dumps(event))
            self.assertEqual(acceptance.select_policy(self.root, path, "pull_request")["issue"], 50)

    def test_hidden_index_flags_cannot_claim_clean_exact_source(self):
        path = self.root / "source.txt"
        for flag in ["assume-unchanged", "skip-worktree"]:
            subprocess.run(
                ["git", "-C", str(self.root), "update-index", "--" + flag, "source.txt"], check=True
            )
            path.write_text("Edited behind hidden index flag\n")
            with self.subTest(flag=flag):
                report = self.run_policy(require_clean=True)
                self.assertFalse(report["automation_pass"])
                self.assertIn("Hidden index", report["errors"][0])
                self.assertFalse(report["evidence_valid"])
            subprocess.run(
                ["git", "-C", str(self.root), "update-index", "--no-" + flag, "source.txt"],
                check=True,
            )
            path.write_text("Original source\n")

    def test_selector_inline_code_comment_literals_cannot_change_owner(self):
        bodies = [
            "Literal `<!--` in a note.\nRefs #50\n```html\n-->\nRefs #31\n```\n",
            "```html <!--\nRefs #31\n```\nRefs #50\n",
        ]
        for body in bodies:
            event, path = self.selection_fixture(body)
            active = dict(
                self.policy, issue=50, issue_url="https://github.com/example/repo/issues/50"
            )
            (self.root / ".github/acceptance/issue-50.json").write_text(json.dumps(active))
            with self.subTest(body=body):
                self.assertEqual(
                    acceptance.select_policy(self.root, path, "pull_request")["issue"], 50
                )
        event["pull_request"]["body"] = "Literal `<!--\n`\nRefs #50\n"
        path.write_text(json.dumps(event))
        with self.assertRaisesRegex(ValueError, "Unsupported"):
            acceptance.select_policy(self.root, path, "pull_request")


if __name__ == "__main__":
    unittest.main()
