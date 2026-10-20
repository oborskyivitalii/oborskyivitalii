"""Bounded source checks for the opt-in Home LCP investigation, not browser proof."""

import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "ca70a66f340a8e804e4263c02aa9abe79a062765"


class Issue112AcceptanceTests(unittest.TestCase):
    def test_diagnostic_behavior_and_negative_controls(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/lcp-diagnostic.test.cjs"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        counts = dict(
            re.findall(r"^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$", result.stdout, re.M)
        )
        self.assertGreater(int(counts["tests"]), 0)
        self.assertEqual(counts["tests"], counts["pass"])
        for name in ["fail", "cancelled", "skipped", "todo"]:
            self.assertEqual(counts[name], "0")

    def test_production_sources_and_budgets_unchanged(self):
        paths = [
            "site",
            "docs",
            "tools/site",
            "tools/staging",
            "tools/release",
            ".github/workflows",
            "tools/quality/budgets.json",
        ]
        changed = subprocess.check_output(
            ["git", "diff", "--name-only", BASE, "--", *paths], cwd=ROOT, text=True
        )
        added = subprocess.check_output(
            ["git", "ls-files", "--others", "--exclude-standard", "--", *paths],
            cwd=ROOT,
            text=True,
        )
        self.assertEqual(changed, "", "no production/runtime/pipeline or budget edits")
        self.assertEqual(added, "", "no untracked public/runtime additions")

    def test_opt_in_test_disposition(self):
        registry = json.loads((ROOT / "tools/quality/test-profiles.json").read_text())
        row = next(
            item for item in registry["tests"] if item["path"] == "tests/lcp-diagnostic.test.cjs"
        )
        self.assertEqual(row["lifecycle"], "diagnostic")
        self.assertEqual(set(row["profiles"]), {"diagnostic", "pr-targeted"})
        result = subprocess.run(
            [
                "node",
                "-e",
                "const r=require('./tools/quality/source-tests.cjs');"
                "const x=r.validateRegistry(process.cwd(),r.loadRegistry(process.cwd()));"
                "if(!x)process.exit(1);",
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
