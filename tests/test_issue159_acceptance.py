"""Current QA isolation checks; external provider/release gates remain pending."""

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue159AcceptanceTests(unittest.TestCase):
    def test_qa_collector_isolation(self):
        script = """
const runner = require('./tools/quality/source-tests.cjs');
process.stdout.write(JSON.stringify(runner.run(process.cwd(), {
  profile: 'issue159', modules: ['tests/preview-smoke.test.cjs'],
})));
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
        self.assertEqual(report["modules"], ["tests/preview-smoke.test.cjs"])
        self.assertGreater(report["total"], 0)
        self.assertEqual(report["passed"], report["total"])
        for key in ("failed", "cancelled", "skipped", "todo"):
            self.assertEqual(report[key], 0)
