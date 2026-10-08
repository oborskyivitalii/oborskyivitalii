"""Issue61 maps the existing active Color contracts, without another suite."""

import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue61AcceptanceTests(unittest.TestCase):
    def test_active_color_delivery_excludes_ribbons_and_keeps_navigation(self):
        result = subprocess.run(
            [
                "node",
                "--test",
                "--test-reporter=tap",
                "tests/effects.test.cjs",
                "tests/color-build.test.cjs",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=120,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        counts = {
            key: int(value)
            for key, value in re.findall(
                r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$", result.stdout, re.M
            )
        }
        self.assertGreater(counts.get("tests", 0), 0, result.stdout)
        self.assertEqual(counts.get("pass"), counts["tests"], result.stdout)
        for key in ["fail", "skipped", "cancelled", "todo"]:
            self.assertEqual(counts.get(key), 0, result.stdout)
