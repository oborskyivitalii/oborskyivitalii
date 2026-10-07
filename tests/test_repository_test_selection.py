# SPDX-License-Identifier: Apache-2.0
"""Real selection coverage and module lifecycle/failure regressions."""
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SOURCE = REPO / "tools/run_repository_tests.py"
SPEC = importlib.util.spec_from_file_location("repository_test_runner", SOURCE)
runner = importlib.util.module_from_spec(SPEC)
exec(compile(SOURCE.read_bytes(), str(SOURCE), "exec"), runner.__dict__)


class RepositoryTestSelectionTests(unittest.TestCase):
    def test_actual_permanent_modules_and_explicit_task_policy_methods_are_available(self):
        selected = {path.name for path in runner.selected_modules(REPO / "tests")}
        self.assertTrue({"test_issue_acceptance.py", "test_repository_intelligence.py",
                         "test_ri_ci.py", "test_root_layout.py", "test_offline_export_security.py",
                         "test_repository_test_selection.py"} <= selected)
        self.assertNotIn("test_issue31_acceptance.py", selected)
        self.assertNotIn("test_issue33_acceptance.py", selected)
        # Task snapshots remain accessible to the owning acceptance policies.
        for policy_path in (REPO / ".github/acceptance").glob("issue-*.json"):
            policy = json.loads(policy_path.read_text())
            for check in policy["checks"].values():
                if check["kind"] != "unittest":
                    continue
                module_name, class_name, method_name = check["test"].split(".")
                source = REPO / "tests" / (module_name + ".py")
                spec = importlib.util.spec_from_file_location("selection_" + module_name, source)
                module = importlib.util.module_from_spec(spec)
                exec(compile(source.read_bytes(), str(source), "exec"), module.__dict__)
                self.assertTrue(callable(getattr(getattr(module, class_name), method_name)), check["test"])

    def test_future_arbitrary_modules_are_run_and_exact_numeric_task_modules_are_not_imported(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            permanent = {"test_new_future_regression.py", "test_issue_acceptance.py",
                         "test_issue_tools_acceptance.py", "test_issue33_acceptance_extra.py",
                         "test_issue33.py", "test_issues33_acceptance.py", "nested/test_future.py"}
            for name in permanent:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("import unittest\nclass NewTests(unittest.TestCase):\n    def test_case(self):\n        self.assertEqual(2 + 3, 5)\n")
            for name in ["test_issue31_acceptance.py", "test_issue3333_acceptance.py"]:
                (root / name).write_text("raise AssertionError('task module must not be imported')\n")
            self.assertEqual({path.relative_to(root).as_posix() for path in runner.selected_modules(root)}, permanent)
            result = runner.run(root, io.StringIO())
            self.assertTrue(result["pass"])
            self.assertEqual(result["tests_run"], len(permanent))
            cli = subprocess.run([sys.executable, str(SOURCE), "--tests", str(root)],
                                 capture_output=True, text=True, timeout=20)
            self.assertEqual(cli.returncode, 0, cli.stderr)
            self.assertEqual(json.loads(cli.stdout)["tests_run"], len(permanent))

    def test_standard_module_class_and_case_setup_teardown_are_honored(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            log = root / "lifecycle.txt"
            body = "import unittest\nfrom pathlib import Path\nlog = Path(" + repr(str(log)) + ")\n"
            body += "def record(value):\n    with log.open('a') as stream: stream.write(value + '\\n')\n"
            body += "def setUpModule(): record('module-up')\ndef tearDownModule(): record('module-down')\n"
            body += "class LifecycleTests(unittest.TestCase):\n    @classmethod\n    def setUpClass(cls): record('class-up')\n    @classmethod\n    def tearDownClass(cls): record('class-down')\n    def setUp(self): record('case-up')\n    def tearDown(self): record('case-down')\n    def test_case(self): record('body')\n"
            (root / "test_lifecycle.py").write_text(body)
            self.assertTrue(runner.run(root, io.StringIO())["pass"])
            self.assertEqual(log.read_text().splitlines(), ["module-up", "class-up", "case-up", "body",
                                                           "case-down", "class-down", "module-down"])

    def test_empty_failed_skipped_and_module_hook_errors_cannot_report_pass(self):
        variants = ["# No tests\n", "import unittest\nclass BadTests(unittest.TestCase):\n    def test_case(self): self.fail('failure')\n",
                    "import unittest\nclass BadTests(unittest.TestCase):\n    @unittest.skip('unavailable')\n    def test_case(self): pass\n",
                    "import unittest\ndef setUpModule(): raise RuntimeError('setup failed')\nclass BadTests(unittest.TestCase):\n    def test_case(self): pass\n"]
        for body in variants:
            with self.subTest(body=body), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                (root / "test_failure.py").write_text(body)
                self.assertFalse(runner.run(root, io.StringIO())["pass"])
        with tempfile.TemporaryDirectory() as directory:
            result = runner.run(Path(directory), io.StringIO())
            self.assertFalse(result["pass"])
            self.assertEqual(result["tests_run"], 0)
            cli = subprocess.run([sys.executable, str(SOURCE), "--tests", directory],
                                 capture_output=True, text=True, timeout=20)
            self.assertEqual(cli.returncode, 1, cli.stderr)
            self.assertFalse(json.loads(cli.stdout)["pass"])


if __name__ == "__main__":
    unittest.main()
