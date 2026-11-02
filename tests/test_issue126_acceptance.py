"""DevCon announcement policy; hosted, independent and release gates stay separate."""

import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path

from test_issue48_acceptance import node_checks

ROOT = Path(__file__).resolve().parents[1]
RETENTION = "review/issue-126/production-retention.json"
ANNOUNCEMENT_CHECKPOINT = "f02da82add16e8ee1ad1771a4cce6367cab4540a"
RETENTION_REFERENCE_SHA256 = "1be5e332b2fe22c7f0104d5225f9c7cb445f962714c21c2a82818380c3c66074"


def retention_reference():
    reference = json.loads((ROOT / RETENTION).read_text())
    if reference["announcementCheckpoint"] != ANNOUNCEMENT_CHECKPOINT:
        raise ValueError("announcement checkpoint differs from reviewed source")
    payload = {
        key: reference[key] for key in ["announcementCheckpoint", "previous", "immutableFiles"]
    }
    digest = hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    if digest != RETENTION_REFERENCE_SHA256 or reference["referenceDigest"] != digest:
        raise ValueError("authenticated previous production reference changed")
    return reference


def git_text(commit, path):
    return subprocess.check_output(["git", "show", commit + ":" + path], cwd=ROOT, text=True)


def retention_values(reference):
    values = hex_values(reference)
    for path in reference["immutableFiles"]:
        values.update(re.findall(r"[a-f0-9]{64}", path))
    values.update(
        [
            reference["announcementCheckpoint"],
            reference["previous"]["sourceCommit"],
            reference["previous"]["sourceTree"],
        ]
    )
    return values


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
        checkpoint = retention_reference()["announcementCheckpoint"]

        def read(path):
            return git_text(checkpoint, path)

        base = json.loads((ROOT / "review/issue-126/content-amendment.json").read_text())[
            "baseline"
        ]
        previous = json.loads(
            subprocess.check_output(["git", "show", base + ":" + ledger_path], cwd=ROOT, text=True)
        )
        current = json.loads(read(ledger_path))
        maintained = json.loads((ROOT / ledger_path).read_text())
        self.assertEqual(maintained["findings"][: len(current["findings"])], current["findings"])
        self.assertEqual(current["findings"][: len(previous["findings"])], previous["findings"])
        added = current["findings"][len(previous["findings"]) :]
        self.assertEqual(len(added), 56)
        generated = [
            "site/output-lock.json",
            "docs/site-revision.json",
            "review/site-v1-static-previews-v11.json",
            "review/site-v1-offline-bundle-v11.json",
        ]
        known = {p: hex_values(json.loads(read(p))) for p in generated}
        public = known[generated[0]] | known[generated[1]]
        amendment_path = "review/issue-126/content-amendment.json"
        amendment = json.loads(read(amendment_path))
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
            elif path.endswith(".html") and path.startswith(("docs/", "review/site-v1-")):
                allowed = public
            self.assertIsNotNone(allowed, "unreviewed public-checksum path")
            candidates = {hashlib.sha1(v.encode()).hexdigest() for v in allowed}
            value_hash = row["id"].rsplit(":", 1)[1]
            self.assertIn(value_hash, candidates)
            self.assertEqual(row["id"], path + ":Hex High Entropy String:" + value_hash)
            self.assertEqual(row["disposition"], "false positive")
            self.assertTrue(
                any(
                    hashlib.sha1(v.encode()).hexdigest() == value_hash and v in read(path)
                    for v in allowed
                )
            )

    def test_previous_production_retention_and_checksum_provenance(self):
        reference = retention_reference()
        self.assertEqual(reference["previous"]["tag"], "prod-2026-10-21.1")
        self.assertEqual(
            reference["previous"]["sourceCommit"], "44aef6e4d0f0cbc063a5269fa01a039c4979422e"
        )
        expected = reference["immutableFiles"]
        self.assertEqual(len(expected), 30)
        retained = json.loads((ROOT / "site/retained/manifest.json").read_text())["files"]
        rights = json.loads((ROOT / "site/rights.json").read_text())["retained"]
        before = json.loads(
            git_text(reference["announcementCheckpoint"], "site/retained/manifest.json")
        )["files"]
        self.assertEqual(len(set(retained) - set(before)), 5)
        for path, digest in before.items():
            self.assertEqual(retained[path], digest)
        for path, digest in expected.items():
            self.assertEqual(retained[path], digest)
            self.assertEqual(rights[path]["sha256"], digest)
            for prefix in ["site/retained", "docs"]:
                self.assertEqual(
                    hashlib.sha256((ROOT / prefix / path).read_bytes()).hexdigest(), digest
                )
        ledger_path = "tools/quality/secrets-reviewed-checksums.json"
        previous = json.loads(git_text(reference["announcementCheckpoint"], ledger_path))
        current = json.loads((ROOT / ledger_path).read_text())
        added = current["findings"][len(previous["findings"]) :]
        self.assertEqual(len(added), reference["checksumFindingCount"])
        self.assertEqual(len({row["id"] for row in added}), len(added))
        generated = ["site/output-lock.json", "review/site-v1-offline-bundle-v11.json"]
        known = {path: hex_values(json.loads((ROOT / path).read_text())) for path in generated}
        public = retention_values(reference)
        allowed_paths = {
            RETENTION,
            "site/rights.json",
            "site/retained/manifest.json",
            "tests/test_issue126_acceptance.py",
            ".github/repository-paths.json",
        }
        allowed_paths.update(
            prefix + "/" + path for prefix in ["docs", "site/retained"] for path in expected
        )
        for row in added:
            allowed = public if row["path"] in allowed_paths else known.get(row["path"])
            self.assertIsNotNone(allowed, "unreviewed retention-checksum path")
            self.assertEqual(row["rule"], "Hex High Entropy String")
            self.assertEqual(row["disposition"], "false positive")
            candidates = {hashlib.sha1(v.encode()).hexdigest(): v for v in allowed}
            value_hash = row["id"].rsplit(":", 1)[1]
            self.assertIn(value_hash, candidates)
            self.assertEqual(row["id"], row["path"] + ":Hex High Entropy String:" + value_hash)
            self.assertIn(candidates[value_hash], (ROOT / row["path"]).read_text())

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
