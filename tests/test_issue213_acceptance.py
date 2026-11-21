"""Issue213 selects maintained SEO/material contracts; outcome gates stay external."""

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue213AcceptanceTests(unittest.TestCase):
    def test_discovery_and_material_contracts(self):
        timeout_ms = int(
            subprocess.check_output(
                ["node", "-p", "require('./tools/quality/source-tests.cjs').wrapperTimeout()"],
                cwd=ROOT,
                text=True,
                timeout=10,
            )
        )
        self.assertGreater(timeout_ms, 0)
        script = """
const runner = require('./tools/quality/source-tests.cjs');
process.stdout.write(JSON.stringify(runner.run(process.cwd(), {
  profile: 'issue213',
  modules: [
    'tests/executive.test.cjs', 'tests/article-materials.test.cjs',
    'tests/site-articles.test.cjs',
    'tests/edition-retention.test.cjs', 'tests/article-candidate-source.test.cjs',
    'tests/content-release.test.cjs', 'tests/release-rights.test.cjs',
  ],
})));
"""
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
            timeout=timeout_ms / 1000,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["status"], "passed")
        self.assertGreater(report["total"], 0)
        self.assertEqual(report["passed"], report["total"])
        for key in ("failed", "cancelled", "skipped", "todo"):
            self.assertEqual(report[key], 0)
