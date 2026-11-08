"""Owning article analytics checks; provider and release evidence stay external."""

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue177AcceptanceTests(unittest.TestCase):
    def test_article_analytics_contracts(self):
        modules = [
            "tests/analytics.test.cjs",
            "tests/site-articles.test.cjs",
            "tests/preview-smoke.test.cjs",
        ]
        script = """
const runner = require('./tools/quality/source-tests.cjs');
process.stdout.write(JSON.stringify(runner.run(process.cwd(), {
  profile: 'issue177', modules: JSON.parse(process.argv[1]),
})));
"""
        result = subprocess.run(
            ["node", "-e", script, json.dumps(modules)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
            timeout=190,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["status"], "passed")
        self.assertEqual(report["modules"], modules)
        self.assertGreater(report["total"], 0)
        self.assertEqual(report["passed"], report["total"])
        for key in ("failed", "cancelled", "skipped", "todo"):
            self.assertEqual(report[key], 0)
