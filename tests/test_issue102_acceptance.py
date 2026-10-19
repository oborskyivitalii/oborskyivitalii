"""Issue102 reuses maintained analytics behavior; live telemetry remains a gate."""

import gzip
import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue102AcceptanceTests(unittest.TestCase):
    def test_exact_public_metadata_and_predecessor_preservation(self):
        ledger_path = "tools/quality/secrets-publication.json"
        proof_path = "review/issue-102/2026-10-18-public-metadata-proof.json.gz"
        proof = json.loads(gzip.decompress((ROOT / proof_path).read_bytes()))
        ledger = json.loads((ROOT / ledger_path).read_text())
        predecessor = json.loads(
            subprocess.check_output(
                ["git", "show", "3af9100989c7dd6edc18b0b94c2d59f177cfd465:" + ledger_path],
                cwd=ROOT,
                text=True,
            )
        )
        current = {row["id"]: row for row in ledger["findings"]}
        previous = {row["id"]: row for row in predecessor["findings"]}
        for key, row in previous.items():
            self.assertEqual(current[key], row, "preserve predecessor dispositions")
        owners = {
            "site/output-lock.json",
            "docs/site-revision.json",
            "review/site-v1-static-previews-v11.json",
            "review/site-v1-offline-bundle-v11.json",
        }
        ids = set()
        for row in proof["findings"]:
            key = ":".join([row["path"], row["rule"], row["hashed_secret"]])
            self.assertNotIn(key, ids)
            ids.add(key)
            self.assertEqual(current[key]["path"], row["path"])
            self.assertEqual(current[key]["disposition"], "false positive")
            value = row["public_value"]
            self.assertEqual(hashlib.sha1(value.encode()).hexdigest(), row["hashed_secret"])
            line = (ROOT / row["path"]).read_text().splitlines()[row["line_number"] - 1]
            self.assertIn(value, line)
            if row["category"] == "public-beacon":
                self.assertTrue(row["path"].endswith("/analytics.js"))
                self.assertEqual(
                    value, json.loads((ROOT / "site/analytics.json").read_text())["token"]
                )
            else:
                self.assertEqual(row["category"], "generated-checksum")
                self.assertIn(row["provenance"], owners)
                source = json.loads((ROOT / row["provenance"]).read_text())
                hashes = set(
                    re.findall(r"(?<![a-f0-9])[a-f0-9]{40,64}(?![a-f0-9])", json.dumps(source))
                )
                self.assertIn(value, hashes)
        self.assertEqual(len(ids), 159)
        self.assertEqual(set(current) - set(previous), ids)

    def test_declared_entry_aliases_and_isolation(self):
        script = """
const runner = require('./tools/quality/source-tests.cjs');
const report = runner.run(process.cwd(), {
  profile: 'issue102',
  modules: ['tests/analytics.test.cjs', 'tests/quality.test.cjs',
    'tests/staging-gate.test.cjs', 'tests/staging-regression.test.cjs'],
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
        self.assertEqual(
            report["modules"],
            [
                "tests/analytics.test.cjs",
                "tests/quality.test.cjs",
                "tests/staging-gate.test.cjs",
                "tests/staging-regression.test.cjs",
            ],
        )
        self.assertGreater(report["total"], 0)
        self.assertEqual(report["passed"], report["total"])
        for key in ("failed", "cancelled", "skipped", "todo"):
            self.assertEqual(report[key], 0)
