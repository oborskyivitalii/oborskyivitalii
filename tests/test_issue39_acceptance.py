"""Issue39's narrow controller dependency; full launch acceptance stays in PR40."""

import gzip
import hashlib
import json
import os
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "321b706653d210129205878cebac3ccd1dd7f866"
LOCK_BASE = "315da39d0294d970809648cdc0725f7e63187602"
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
        for record in filter(None, git("ls-tree", "-rz", BASE, "--", *paths).split(b"\0")):
            metadata, filename = record.split(b"\t", 1)
            mode, kind, object_id = metadata.decode().split()
            self.assertEqual((mode, kind), ("100644", "blob"))
            baseline[filename.decode()] = object_id
        self.assertEqual(len(baseline), 607)
        before = b"  const licensed = [\n    'issue39-licensed-plain',\n    'issue39-licensed-staging',\n    'issue39-licensed-compact-plain',\n    'issue39-licensed-compact-staging',\n  ].map(motion.reviewedRuntime);"
        after = b"  const licensed = [\n    'issue39-licensed-plain',\n    'issue39-licensed-staging',\n    'issue39-licensed-compact-plain',\n    'issue39-licensed-compact-staging',\n    'issue39-writing-tbt-plain',\n    'issue39-writing-tbt-staging',\n  ].map(motion.reviewedRuntime);"
        actual = {}
        for source in paths:
            owner = ROOT / source
            self.assertFalse(owner.is_symlink(), source)
            for ancestor in owner.parents:
                if ancestor == ROOT:
                    break
                self.assertFalse(ancestor.is_symlink(), source)
            for filename in owner.rglob("*") if owner.is_dir() else [owner]:
                self.assertFalse(filename.is_symlink(), str(filename))
                if not filename.is_file():
                    continue
                self.assertEqual(filename.stat().st_mode & 0o111, 0)
                name = filename.relative_to(ROOT).as_posix()
                raw = filename.read_bytes()
                if name == "tools/staging/package.cjs":
                    self.assertEqual(raw.count(after), 1)
                    self.assertEqual(git("show", BASE + ":" + name).count(before), 1)
                    raw = raw.replace(after, before)
                actual[name] = hashlib.sha1(
                    b"blob " + str(len(raw)).encode() + b"\0" + raw, usedforsecurity=False
                ).hexdigest()
        self.assertEqual(set(actual), set(baseline))
        self.assertEqual(actual, baseline, "byte changed outside the exact mandatory-rights list")

    def test_writing_runtime_proof_and_closed_selector(self):
        with gzip.open(
            ROOT / "review/issue-39/2026-10-16-writing-controller-tuples.json.gz", "rt"
        ) as handle:
            proof = json.load(handle)
        self.assertEqual(proof["kind"], "issue39-writing-runtime-controller-identity")
        self.assertFalse(proof["sourceObservation"]["dirty"])
        self.assertEqual(
            proof["sourceObservation"]["commit"], "64559870de11b6f394cdb2197ff5fa07f4a90f11"
        )
        self.assertEqual([row["kind"] for row in proof["editions"]], ["plain", "staging"])
        components = proof["baseComponents"]
        base = {
            key: components[key]
            for key in ["engine", "scenes", "assets", "producer", "routes", "variant", "contract"]
        }
        base_engine = hashlib.sha256(
            (json.dumps(base, ensure_ascii=False, indent=2) + "\n").encode()
        ).hexdigest()

        def digest(value):
            return hashlib.sha256(
                json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()
            ).hexdigest()

        plain = digest({"contract": 1, "baseEngine": base_engine, "parts": proof["parts"]})
        descriptor = proof["descriptor"]
        staged = digest(
            {
                "contract": 1,
                "edition": descriptor["edition"],
                "baseEngine": plain,
                "css": descriptor["css"],
                "producer": descriptor["producer"],
                "inputs": descriptor["inputs"],
            }
        )
        for row, expected in zip(proof["editions"], [plain, staged], strict=True):
            self.assertEqual(row["variant"]["baseEngine"], base_engine)
            self.assertEqual(row["variant"]["fingerprint"], expected)
            self.assertFalse(row["sourceDirty"])
            self.assertEqual(row["sourceCommit"], proof["sourceObservation"]["commit"])
            self.assertEqual(row["sourceTree"], proof["sourceObservation"]["tree"])
            self.assertEqual(
                set(row["files"]),
                {"styles.css", "space.js", "navigation.js", "theme.js", "archive.js"},
            )
            for record in row["files"].values():
                self.assertTrue(record["canonicalAndImmutableEqual"])
                self.assertEqual(record["sha256"], record["independentPythonSha256"])
        script = """
const fs=require('node:fs'),z=require('node:zlib'),a=require('node:assert/strict'),m=require('./tools/quality/color-motion-contract.cjs');
const p=JSON.parse(z.gunzipSync(fs.readFileSync('review/issue-39/2026-10-16-writing-controller-tuples.json.gz')));
for(const row of p.editions){const id='issue39-writing-tbt-'+row.kind,known=m.reviewedRuntime(id),files={};
a.deepEqual(known.variant,row.variant);
for(const [name,record]of Object.entries(row.files)){a.equal(record.sha256,known.files[name]);for(const file of [name,'runtime/'+row.variant.fingerprint+'/'+name])files[file]=record;}
const candidate={variant:row.variant,components:{contract:1,engine:row.variant.fingerprint,variant:row.variant},files,...(row.edition?{edition:row.edition}:{})};a.equal(m.select(candidate).id,id);}
a.throws(()=>m.reviewedRuntime('issue39-writing-tbt-production'));
"""
        result = subprocess.run(
            ["node", "-e", script], cwd=ROOT, capture_output=True, text=True, timeout=30
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_compact_tuple_proof_and_closed_selector(self):
        with gzip.open(ROOT / "review/issue-39/2026-10-16-compact-tuples.json.gz", "rt") as handle:
            proof = json.load(handle)
        self.assertEqual(proof["kind"], "issue39-compact-metadata-runtime-identity")
        self.assertFalse(proof["sourceObservation"]["dirty"])
        self.assertTrue(proof["pythonDerivationVerified"])
        self.assertEqual([row["kind"] for row in proof["editions"]], ["plain", "staging"])
        components = proof["baseComponents"]
        base = {
            key: components[key]
            for key in ["engine", "scenes", "assets", "producer", "routes", "variant", "contract"]
        }
        base_engine = hashlib.sha256(
            (json.dumps(base, ensure_ascii=False, indent=2) + "\n").encode()
        ).hexdigest()

        def digest(value):
            return hashlib.sha256(
                json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()
            ).hexdigest()

        plain = digest({"contract": 1, "baseEngine": base_engine, "parts": proof["parts"]})
        descriptor = proof["descriptors"]["staging"]
        staged = digest(
            {
                "contract": 1,
                "edition": descriptor["edition"],
                "baseEngine": plain,
                "css": descriptor["css"],
                "producer": descriptor["producer"],
                "inputs": descriptor["inputs"],
            }
        )
        for row, expected in zip(proof["editions"], [plain, staged], strict=True):
            self.assertEqual(row["variant"]["baseEngine"], base_engine)
            self.assertEqual(row["variant"]["fingerprint"], expected)
            self.assertFalse(row["sourceDirty"])
            self.assertEqual(
                set(row["files"]),
                {"styles.css", "space.js", "navigation.js", "theme.js", "archive.js"},
            )
            for record in row["files"].values():
                self.assertTrue(record["baselineBytesEqual"])
                self.assertTrue(record["canonicalAndImmutableEqual"])
                self.assertEqual(record["sha256"], record["independentPythonSha256"])
        script = """
const fs=require('node:fs'),z=require('node:zlib'),a=require('node:assert/strict'),m=require('./tools/quality/color-motion-contract.cjs');
const p=JSON.parse(z.gunzipSync(fs.readFileSync('review/issue-39/2026-10-16-compact-tuples.json.gz')));
for(const row of p.editions){const id='issue39-licensed-compact-'+row.kind,known=m.reviewedRuntime(id),old=m.reviewedRuntime('issue39-licensed-'+row.kind),files={};
a.deepEqual(known.variant,row.variant);a.deepEqual(known.files,old.files);
for(const [name,record]of Object.entries(row.files)){a.equal(record.sha256,known.files[name]);for(const file of [name,'runtime/'+row.variant.fingerprint+'/'+name])files[file]=record;}
const candidate={variant:row.variant,components:{contract:1,engine:row.variant.fingerprint,variant:row.variant},files,...(row.edition?{edition:row.edition}:{})};a.equal(m.select(candidate).id,id);}
"""
        result = subprocess.run(
            ["node", "-e", script], cwd=ROOT, capture_output=True, text=True, timeout=30
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_installed_python_graph_contracts(self):
        original = git("show", LOCK_BASE + ":tools/quality/toolchain/requirements.txt")
        expected = original.replace(b"mcp==1.29.0\n", b"mcp==1.30.0\n").replace(
            b"pillow==12.3.0\n", b"pillow==12.3.0\npip==26.2.1\n"
        )
        self.assertEqual((ROOT / "tools/quality/toolchain/requirements.txt").read_bytes(), expected)
        tools = Path(os.environ.get("SITE_AUDIT_TOOLS", ROOT / "tools/quality/toolchain"))
        executable = (
            tools / "venv" / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
        )
        script = """
import json, unittest
suite = unittest.defaultTestLoader.discover('tests', pattern='test_python_toolchain.py')
result = unittest.TextTestRunner(verbosity=1).run(suite)
print(json.dumps({'pass': result.wasSuccessful(), 'tests': result.testsRun,
                  'skips': len(result.skipped), 'expectedFailures': len(result.expectedFailures)}))
"""
        result = subprocess.run(
            [str(executable), "-c", script],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report, {"pass": True, "tests": 4, "skips": 0, "expectedFailures": 0})

    def test_frozen_publication_records_and_actual_legacy_pages_bytes(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/publication-records.test.cjs"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        for name in (
            "known licensed publications require frozen rights by actual runtime bytes even through default API",
            "staging retains exact frozen license records for default and finite proxy packages",
            "frozen reports reject rehashed source, edition, scope, notice and full-copy substitutions",
            "Pages requires modern records and binds root and staging reports in the published receipt",
            "both controller extraction routes retain the validated frozen report and every source byte",
            "default Pages output and historical verification preserve actual pinned-main bytes",
        ):
            self.assertIn("# Subtest: " + name + "\n", result.stdout)
        for label in ("fail", "cancelled", "skipped", "todo"):
            self.assertRegex(result.stdout, rf"(?m)^# {label} 0$", result.stdout)
        total = re.search(r"(?m)^# tests ([1-9][0-9]*)$", result.stdout)
        passed = re.search(r"(?m)^# pass ([1-9][0-9]*)$", result.stdout)
        self.assertIsNotNone(total, result.stdout)
        self.assertIsNotNone(passed, result.stdout)
        self.assertEqual(total.group(1), passed.group(1), result.stdout)

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
