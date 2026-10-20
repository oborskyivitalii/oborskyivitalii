"""Issue5 controller prerequisite only; PR79 retains the feature acceptance policy."""

import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue5ControllerAcceptanceTests(unittest.TestCase):
    def test_article_controller_contracts(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/reader-controller.test.cjs"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        rows = re.findall(
            r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$", result.stdout, re.M
        )
        self.assertEqual(len(rows), 6, result.stdout)
        counts = {key: int(value) for key, value in rows}
        self.assertGreaterEqual(counts.get("tests", 0), 7, result.stdout)
        self.assertEqual(counts.get("pass"), counts.get("tests"), result.stdout)
        for key in ["fail", "skipped", "cancelled", "todo"]:
            self.assertEqual(counts.get(key), 0, result.stdout)

    def test_bootstrap_preserves_site_producers_and_public_bytes(self):
        # This task-only checkpoint retires when PR79 restores its feature policy.
        result = subprocess.run(
            [
                "git",
                "diff",
                "--exit-code",
                "82b57b8948c6c30143213b846ee2848d06f8d200",
                "--",
                "docs",
                "site",
                "tools/site",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
