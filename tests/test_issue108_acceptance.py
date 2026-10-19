"""Current PMDay source checks; human decisions and actual releases are separate."""

import gzip
import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path

from test_issue48_acceptance import node_checks

ROOT = Path(__file__).resolve().parents[1]


class Issue108AcceptanceTests(unittest.TestCase):
    def test_exact_public_findings_and_predecessor_preservation(self):
        proof = json.loads(
            gzip.decompress(
                (ROOT / "review/issue-108/2026-10-19-public-checksum-proof.json.gz").read_bytes()
            )
        )
        ledger_path = "tools/quality/secrets-publication.json"
        current = {r["id"]: r for r in json.loads((ROOT / ledger_path).read_text())["findings"]}
        previous = {
            r["id"]: r
            for r in json.loads(
                subprocess.check_output(
                    ["git", "show", proof["sourceCommit"] + ":" + ledger_path], cwd=ROOT, text=True
                )
            )["findings"]
        }
        for key, row in previous.items():
            self.assertEqual(current[key], row, "predecessor dispositions remain exact")
        self.assertEqual(
            subprocess.check_output(
                ["git", "rev-parse", proof["sourceCommit"] + "^{tree}"], cwd=ROOT, text=True
            ).strip(),
            proof["sourceTree"],
        )
        self.assertEqual(
            set(proof["generatedOwners"]),
            {
                "site/output-lock.json",
                "docs/site-revision.json",
                "review/site-v1-static-previews-v11.json",
                "review/site-v1-offline-bundle-v11.json",
            },
        )
        ids = set()
        for row in proof["findings"]:
            value = row["public_value"]
            self.assertEqual(hashlib.sha1(value.encode()).hexdigest(), row["hashed_secret"])
            line = (ROOT / row["path"]).read_text().splitlines()[row["line_number"] - 1]
            self.assertIn(value, line)
            key = ":".join([row["path"], row["rule"], row["hashed_secret"]])
            self.assertNotIn(key, ids)
            ids.add(key)
            self.assertEqual(current[key]["disposition"], "false positive")
            self.assertEqual(current[key]["path"], row["path"])
            source = json.loads((ROOT / row["provenance"]).read_text())
            if row["category"] == "generated-checksum":
                self.assertIn(row["provenance"], proof["generatedOwners"])
                self.assertIn(
                    value, re.findall(r"(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])", json.dumps(source))
                )
            else:
                self.assertEqual(row["provenance"], "review/issue-108/content-amendment.json")
                if row["category"] == "source-commit":
                    self.assertEqual(value, source["baseline"])
                    self.assertEqual(
                        subprocess.check_output(
                            ["git", "cat-file", "-t", value], cwd=ROOT, text=True
                        ).strip(),
                        "commit",
                    )
                else:
                    self.assertEqual(row["category"], "content-checksum")
                    recomputed = set()
                    for change in source["changes"]:
                        for field in ["before", "after"]:
                            digest = hashlib.sha256(change[field].encode()).hexdigest()
                            self.assertEqual(digest, change[field + "SHA256"])
                            recomputed.add(digest)
                    self.assertIn(value, recomputed)
        self.assertEqual(len(ids), 56)
        self.assertEqual(set(current) - set(previous), ids)

    def test_current_events_and_historical_preservation(self):
        node_checks(
            ["tests/content.test.cjs", "tests/executive.test.cjs"],
            [
                "PMDay upcoming and Autumn naming preserve confirmed facts and existing presentation",
                "Talks curates distinct events with source-supported dates, language and resources",
                "Talks reconciliation rejects missing events, substituted sources and invented dates or resources",
                "executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy",
            ],
        )


if __name__ == "__main__":
    unittest.main()
