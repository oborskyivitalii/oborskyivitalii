"""Issue69 executes maintained entry behavior; browser/device gates stay distinct."""

import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue69AcceptanceTests(unittest.TestCase):
    def test_entry_behavior_and_failure_containment(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/scroll-entry.test.cjs"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        counts = {
            key: int(value)
            for key, value in re.findall(
                r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$",
                result.stdout,
                re.M,
            )
        }
        self.assertGreaterEqual(counts.get("tests", 0), 25, result.stdout)
        self.assertEqual(counts.get("pass"), counts.get("tests"), result.stdout)
        for key in ["fail", "skipped", "cancelled", "todo"]:
            self.assertEqual(counts.get(key), 0, result.stdout)

    def test_stationary_camera_and_sequenced_navigation(self):
        result = subprocess.run(
            [
                "node",
                "--test",
                "--test-reporter=tap",
                "tests/space.test.cjs",
                "tests/camera-view.test.cjs",
                "tests/navigation.test.cjs",
                "tests/flight.test.cjs",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=180,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        counts = {
            key: int(value)
            for key, value in re.findall(
                r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$",
                result.stdout,
                re.M,
            )
        }
        self.assertGreaterEqual(counts.get("tests", 0), 80, result.stdout)
        self.assertEqual(counts.get("pass"), counts.get("tests"), result.stdout)
        for key in ["fail", "skipped", "cancelled", "todo"]:
            self.assertEqual(counts.get(key), 0, result.stdout)

    def test_entry_shared_delivery(self):
        result = subprocess.run(
            [
                "node",
                "--test",
                "--test-reporter=tap",
                "--test-name-pattern=^reading entry shares",
                "tests/site-engine.test.cjs",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        counts = dict(
            re.findall(
                r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$",
                result.stdout,
                re.M,
            )
        )
        self.assertEqual(
            counts,
            {
                "tests": "1",
                "pass": "1",
                "fail": "0",
                "skipped": "0",
                "cancelled": "0",
                "todo": "0",
            },
            result.stdout,
        )


if __name__ == "__main__":
    unittest.main()
