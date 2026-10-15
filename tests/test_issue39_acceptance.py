"""Issue39's narrow controller dependency; full launch acceptance stays in PR40."""

import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "cc115c4241197d59205934bdc18f209109d5ee87"
# Live issue39: staging-snapshot-proxy-preparation-20261015 permits this owner only.
HOST_POLICY_AMENDMENT = "tools/staging/package.cjs"
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
            self.assertFalse(owner.is_symlink(), source)
            for ancestor in owner.parents:
                if ancestor == ROOT:
                    break
                self.assertFalse(ancestor.is_symlink(), source)
            files = owner.rglob("*") if owner.is_dir() else [owner]
            for filename in files:
                self.assertFalse(filename.is_symlink(), str(filename))
                if filename.is_file():
                    self.assertEqual(filename.stat().st_mode & 0o111, 0)
                    relative = filename.relative_to(ROOT).as_posix()
                    raw = filename.read_bytes()
                    actual[relative] = hashlib.sha1(
                        b"blob " + str(len(raw)).encode() + b"\0" + raw,
                        usedforsecurity=False,
                    ).hexdigest()
        self.assertEqual(len(baseline), 607, "pinned protected main inventory changed")
        self.assertIn(HOST_POLICY_AMENDMENT, baseline)
        self.assertEqual(set(actual), set(baseline), "protected main path inventory changed")
        self.assertEqual(
            {name: value for name, value in actual.items() if name != HOST_POLICY_AMENDMENT},
            {name: value for name, value in baseline.items() if name != HOST_POLICY_AMENDMENT},
            "compatibility changed a byte outside the named staging host-policy amendment",
        )

    def test_versioned_snapshot_host_policy_preserves_legacy_and_rejects_arbitrary_routes(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/staging.test.cjs"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        for name in (
            "default staging host generation and archived legacy verification preserve exact pinned-main bytes",
            "versioned snapshot proxy policy binds only admitted immutable HTML and preserves source bytes",
            "snapshot proxy policy rejects missing flags, mutated rules and inconsistent source or package records",
        ):
            self.assertIn("# Subtest: " + name + "\n", result.stdout)
        for label in ("fail", "cancelled", "skipped", "todo"):
            self.assertRegex(result.stdout, rf"(?m)^# {label} 0$", result.stdout)
        total = re.search(r"(?m)^# tests ([1-9][0-9]*)$", result.stdout)
        passed = re.search(r"(?m)^# pass ([1-9][0-9]*)$", result.stdout)
        self.assertIsNotNone(total, result.stdout)
        self.assertIsNotNone(passed, result.stdout)
        self.assertEqual(total.group(1), passed.group(1), result.stdout)

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

    def test_flight_resource_telemetry_preserves_original_failure(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/staging-regression.test.cjs"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        for name in (
            "post-flight resource collection selects only the two current same-origin fetches without truncating overflow",
            "flight fetch evidence separates response completion from preparation and rejects invalid unbounded records",
            "flight driver collects resources only after the original window and preserves the native latency failure",
        ):
            self.assertIn("# Subtest: " + name + "\n", result.stdout)
        for label in ("fail", "cancelled", "skipped", "todo"):
            self.assertRegex(result.stdout, rf"(?m)^# {label} 0$", result.stdout)
        total = re.search(r"(?m)^# tests ([1-9][0-9]*)$", result.stdout)
        passed = re.search(r"(?m)^# pass ([1-9][0-9]*)$", result.stdout)
        self.assertIsNotNone(total, result.stdout)
        self.assertIsNotNone(passed, result.stdout)
        self.assertEqual(total.group(1), passed.group(1), result.stdout)

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
