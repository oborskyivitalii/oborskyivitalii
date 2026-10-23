"""DevCon announcement policy; hosted, independent and release gates stay separate."""

import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path

from test_issue48_acceptance import node_checks


ROOT = Path(__file__).resolve().parents[1]


def hex_values(value):
    if isinstance(value, str) and re.fullmatch(r"[a-f0-9]{64}", value):
        return {value}
    if isinstance(value, dict):
        return set().union(set(), *(hex_values(v) for v in value.values()))
    if isinstance(value, list):
        return set().union(set(), *(hex_values(v) for v in value))
    return set()


class Issue126AcceptanceTests(unittest.TestCase):
    def test_exact_public_checksums_and_predecessor(self):
        ledger_path = "tools/quality/secrets-reviewed-checksums.json"
        base = json.loads((ROOT / "review/issue-126/content-amendment.json").read_text())[
            "baseline"
        ]
        previous = json.loads(
            subprocess.check_output(["git", "show", base + ":" + ledger_path], cwd=ROOT, text=True)
        )
        current = json.loads((ROOT / ledger_path).read_text())
        self.assertEqual(current["findings"][: len(previous["findings"])], previous["findings"])
        added = current["findings"][len(previous["findings"]) :]
        self.assertEqual(len(added), 56)
        generated = [
            "site/output-lock.json",
            "docs/site-revision.json",
            "review/site-v1-static-previews-v11.json",
            "review/site-v1-offline-bundle-v11.json",
        ]
        known = {p: hex_values(json.loads((ROOT / p).read_text())) for p in generated}
        public = known[generated[0]] | known[generated[1]]
        amendment_path = "review/issue-126/content-amendment.json"
        amendment = json.loads((ROOT / amendment_path).read_text())
        amendment_values = {amendment["baseline"]}
        self.assertEqual(
            subprocess.check_output(
                ["git", "cat-file", "-t", amendment["baseline"]], cwd=ROOT, text=True
            ).strip(),
            "commit",
        )
        for change in amendment["changes"]:
            for version in ["before", "after"]:
                digest = hashlib.sha256(change[version].encode()).hexdigest()
                self.assertEqual(digest, change[version + "SHA256"])
                amendment_values.add(digest)
        for row in added:
            path = row["path"]
            allowed = known.get(path)
            if path == amendment_path:
                allowed = amendment_values
            elif path.endswith(".html") and (
                path.startswith("docs/") or path.startswith("review/site-v1-")
            ):
                allowed = public
            self.assertIsNotNone(allowed, "unreviewed public-checksum path")
            candidates = {hashlib.sha1(v.encode()).hexdigest() for v in allowed}
            value_hash = row["id"].rsplit(":", 1)[1]
            self.assertIn(value_hash, candidates)
            self.assertEqual(row["id"], path + ":Hex High Entropy String:" + value_hash)
            self.assertEqual(row["disposition"], "false positive")
            self.assertTrue(
                any(
                    hashlib.sha1(v.encode()).hexdigest() == value_hash
                    and v in (ROOT / path).read_text()
                    for v in allowed
                )
            )

    def test_announcement_facts_and_preservation(self):
        node_checks(
            ["tests/content.test.cjs", "tests/executive.test.cjs"],
            [
                "DevCon announcement preserves previous events and rejects changed public facts",
                "PMDay upcoming and Autumn naming preserve confirmed facts and existing presentation",
                "Talks curates distinct events with source-supported dates, language and resources",
                "Talks reconciliation rejects missing events, substituted sources and invented dates or resources",
                "executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy",
            ],
        )
