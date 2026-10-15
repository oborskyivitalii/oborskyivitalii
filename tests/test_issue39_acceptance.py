"""Issue39's narrow controller dependency; full launch acceptance stays in PR40."""

import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "cc115c4241197d59205934bdc18f209109d5ee87"
PROTECTED = (
    "site",
    "docs",
    "tools/site",
    "tools/staging",
    "tools/pages",
    "tools/release",
    ".github/workflows",
    "tools/build_scene_fallbacks.cjs",
    "tools/build_site_previews.cjs",
    "tools/build_site_bundle.py",
)


def git(*arguments):
    return subprocess.check_output(["git", *arguments], cwd=ROOT)


def protected_paths():
    exports = git("ls-tree", "-r", "--name-only", BASE, "--", "review").decode().splitlines()
    return (*PROTECTED, *(name for name in exports if name.startswith("review/site-v1-")))


class Issue39AcceptanceTests(unittest.TestCase):
    def test_current_main_public_and_producer_bytes_are_preserved(self):
        paths = protected_paths()
        baseline = {}
        records = git("ls-tree", "-rz", BASE, "--", *paths).split(b"\0")
        for record in filter(None, records):
            metadata, filename = record.split(b"\t", 1)
            mode, kind, object_id = metadata.decode().split()
            self.assertEqual((mode, kind), ("100644", "blob"))
            baseline[filename.decode()] = object_id

        actual = {}
        for source in paths:
            owner = ROOT / source
            files = owner.rglob("*") if owner.is_dir() else [owner]
            for filename in files:
                if filename.is_file():
                    self.assertFalse(filename.is_symlink())
                    relative = filename.relative_to(ROOT).as_posix()
                    raw = filename.read_bytes()
                    actual[relative] = hashlib.sha1(
                        b"blob " + str(len(raw)).encode() + b"\0" + raw,
                        usedforsecurity=False,
                    ).hexdigest()
        self.assertTrue(baseline, "protected main source inventory is empty")
        self.assertEqual(actual, baseline, "compatibility changed a public or producer byte")

    def test_current_selector_and_bounded_negative_guards(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/color-motion-contract.test.cjs"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        for label in ("fail", "cancelled", "skipped", "todo"):
            self.assertRegex(result.stdout, rf"(?m)^# {label} 0$", result.stdout)
        total = re.search(r"(?m)^# tests ([1-9][0-9]*)$", result.stdout)
        self.assertIsNotNone(total, result.stdout)

    def test_recorded_license_tuples_match_closed_selector(self):
        proof = ROOT / "review/issue-39/2026-10-15-license-tuples.json"
        record = json.loads(proof.read_text())
        self.assertEqual(record["kind"], "issue39-licensed-color-byte-proof")
        self.assertEqual(
            [row["id"] for row in record["families"]],
            ["issue39-licensed-plain", "issue39-licensed-staging"],
        )
        for row in record["families"]:
            self.assertTrue(row["sourceObservation"]["sourceDirty"])
            self.assertFalse(row["extraLicensePaths"])
            self.assertTrue(row["mainArtifactAndSnapshotValidatorsPass"])
            self.assertLessEqual(row["creditsBytes"], 100000)
            self.assertEqual(set(row["embeddedLegal"]), {"scope", "code", "content", "notices"})
            for file in (*row["files"].values(), *row["embeddedLegal"].values()):
                self.assertRegex(file["sha256"], r"^[a-f0-9]{64}$")
                self.assertGreater(file["raw"], 0)
            for file in row["files"].values():
                self.assertTrue(file["canonicalAndImmutableBytesEqual"])
            for file in row["embeddedLegal"].values():
                self.assertTrue(file["aliasAndSnapshotFullTextEqual"])
        result = subprocess.run(
            [
                "node",
                "-e",
                (
                    "const a=require('node:assert/strict'),m=require('./tools/quality/color-motion-contract.cjs'),"
                    "p=require('./review/issue-39/2026-10-15-license-tuples.json');"
                    "for(const row of p.families){const files={};"
                    "for(const [name,value] of Object.entries(row.files))"
                    "for(const key of [name,'runtime/'+row.variant.fingerprint+'/'+name])files[key]=value;"
                    "const candidate={variant:row.variant,components:{contract:1,engine:row.variant.fingerprint,"
                    "variant:row.variant},files,...(row.edition?{edition:row.edition}:{})};"
                    "a.equal(m.select(candidate).id,row.id);}"
                    "console.log(JSON.stringify(p.families.map(row=>row.id)));"
                ),
            ],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertEqual(json.loads(result.stdout), [row["id"] for row in record["families"]])


if __name__ == "__main__":
    unittest.main()
