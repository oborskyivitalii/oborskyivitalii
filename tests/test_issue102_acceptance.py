"""Issue102 reuses maintained analytics behavior; live telemetry remains a gate."""

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue102AcceptanceTests(unittest.TestCase):
    def test_declared_entry_aliases_and_isolation(self):
        script = """
const runner = require('./tools/quality/source-tests.cjs');
const report = runner.run(process.cwd(), {
  profile: 'issue102',
  modules: ['tests/analytics.test.cjs'],
});
process.stdout.write(JSON.stringify(report));
"""
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
            timeout=190,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["status"], "passed")
        self.assertEqual(report["modules"], ["tests/analytics.test.cjs"])
        self.assertGreater(report["total"], 0)
        self.assertEqual(report["passed"], report["total"])
        for key in ("failed", "cancelled", "skipped", "todo"):
            self.assertEqual(report[key], 0)
