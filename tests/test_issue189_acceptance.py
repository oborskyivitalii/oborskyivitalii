# SPDX-License-Identifier: Apache-2.0
"""Issue189 exact-source archive/protection facts; selected only by its own policy.

These checks do not establish archive eligibility, independent review, ownership
acceptance, hosted delivery or media playback. Those remain explicit policy gates.
"""

import gzip
import hashlib
import importlib.util
import io
import json
import posixpath
import re
import stat
import subprocess
import unittest
import zipfile
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit

REPO = Path(__file__).resolve().parents[1]
BASE = "ca756417590b9176f9fc33428321ffe1f64158cc"
SELECTION_SHA256 = "cee9263e5928946e6acd595ac3a0853ed2aad324837766fd89443d70de96e8bb"
SECURITY_PROOF_SHA256 = "10feb73c27d8123d87da8f2387519257d46151fdbdae697944e219cde2cd7bdb"
# Reviewed scope exceptions are authored independently of observed HEAD drift.
MUTABLE = {
    "AGENTS.md",
    "README.md",
    "MEMORY.md",
    "REPOSITORY-MAP.md",
    ".github/REPOSITORY-INTELLIGENCE.md",
    ".github/repository-intelligence-config.json",
    ".github/repository-paths.json",
    ".github/ri-ci-map.json",
    ".github/repository-intelligence/agent-context.json",
    "tools/repository_intelligence.py",
    "tools/RI-NOTICE.md",
    "tests/test_repository_intelligence.py",
    "tools/quality/bandit-policy.json",
    "tools/quality/test-profiles.json",
    "tools/quality/secrets-reviewed-checksums.json",
    ".github/workflows/issue-acceptance.yml",
    # Maintainer's10November routing amendment; public/other controls stay frozen.
    "tools/quality/delivery-routing.cjs",
    "tools/quality/delivery-observation.cjs",
    "tests/delivery-observation.test.cjs",
    "tests/delivery-admission.test.cjs",
    "guides/SITE-CHECK-PROFILES.md",
    "guides/SITE-STAGING.md",
    *{f"review/site-v1-20261002-v{v}-index.html" for v in (5, 6, 7)},
}
ADDITIONS = {
    ".github/acceptance/issue-189.json",
    "tests/test_issue189_acceptance.py",
    "review/issue-189/2026-11-10-analysis.md",
    "review/issue-189/selected-files.json",
    "review/issue-189/archive-index.json",
    "review/issue-189/planning-review-evidence.tar.xz",
    "review/issue-189/audit-review-evidence.tar.xz",
    "review/issue-189/archive-review-evidence.tar.xz",
    "review/issue-189/navigation-review-evidence.tar.xz",
    "review/issue-189/delivery-review-evidence.tar.xz",
    "review/issue-189/security-proof.json.gz",
    "review/issue-189/routing-review-evidence.tar.xz",
    *{f"review/site-v1-20261002-v{v}-captures/ARCHIVE.md" for v in (5, 6, 7)},
}


def blob_digest(data):
    return hashlib.sha1(
        b"blob " + str(len(data)).encode() + b"\0" + data, usedforsecurity=False
    ).hexdigest()


def selection():
    payload = (REPO / "review/issue-189/selected-files.json").read_bytes()
    if hashlib.sha256(payload).hexdigest() != SELECTION_SHA256:
        raise AssertionError("Frozen selection changed; original oracle must not follow HEAD")
    return json.loads(payload)


def checked_secret_tail():
    """Read the fixed, bounded per-ID proof, independently of candidate ledger rows."""
    payload = (REPO / "review/issue-189/security-proof.json.gz").read_bytes()
    if len(payload) > 32768 or hashlib.sha256(payload).hexdigest() != SECURITY_PROOF_SHA256:
        raise AssertionError("Exact reviewed security proof changed")
    with gzip.GzipFile(fileobj=io.BytesIO(payload)) as compressed:
        plain = compressed.read(200001)
    if len(plain) > 200000:
        raise AssertionError("Security proof decompression bound exceeded")
    proof = json.loads(plain)
    if proof["schema"] != 1 or proof["issue"] != 189 or len(proof["findings"]) != 108:
        raise AssertionError("Unexpected security proof contract")
    tail = []
    sources = {}
    for row in proof["findings"]:
        file, value = row["file"], row["public_value"]
        if not re.fullmatch(r"(?:[a-f0-9]{40}|[a-f0-9]{64})", value):
            raise AssertionError("Proof value is not its reviewed public identity")
        if file not in sources:
            sources[file] = subprocess.check_output(
                ["git", "show", proof["source"] + ":" + file], cwd=REPO, timeout=30
            )
        source = sources[file]
        detector_hash = hashlib.sha1(value.encode(), usedforsecurity=False).hexdigest()
        rule = "Hex High Entropy String"
        if (
            blob_digest(source) != row["source_blob"]
            or value not in source.decode().splitlines()[row["line"] - 1]
            or detector_hash != row["hash"]
            or row["type"] != rule
            or row["id"] != file + ":" + rule + ":" + detector_hash
            or row["classification"] != "public-checksum-or-Git-identity"
        ):
            raise AssertionError("Finding identity or immutable source binding differs")
        tail.append(
            {
                "id": row["id"],
                "path": file,
                "rule": rule,
                "disposition": "false positive",
                "reason": row["ledger_reason"],
            }
        )
    proof_hash_id = hashlib.sha1(SECURITY_PROOF_SHA256.encode(), usedforsecurity=False).hexdigest()
    tail.append(
        {
            "id": "tests/test_issue189_acceptance.py:Hex High Entropy String:" + proof_hash_id,
            "path": "tests/test_issue189_acceptance.py",
            "rule": "Hex High Entropy String",
            "disposition": "false positive",
            "reason": "Public SHA256 of the exact pinned issue189 per-ID proof; recomputed from compressed bytes. This entry does not admit other values or confer historical validation.",
        }
    )
    if len({row["id"] for row in tail}) != 109:
        raise AssertionError("Duplicate security disposition")
    return tail


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        self.links.extend(
            value for key, value in attrs if key in {"href", "src", "poster"} and value
        )


class Issue189AcceptanceTests(unittest.TestCase):
    def test_source_only_maintenance_routing(self):
        result = subprocess.run(
            [
                "node",
                "--test",
                "--test-reporter=tap",
                "tests/delivery-observation.test.cjs",
                "tests/delivery-admission.test.cjs",
            ],
            cwd=REPO,
            text=True,
            capture_output=True,
            timeout=300,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertRegex(result.stdout, r"# fail 0\b")
        self.assertRegex(result.stdout, r"# skipped 0\b")

    def test_every_selected_original_and_complete_gallery_is_recoverable(self):
        frozen = selection()
        index = json.loads((REPO / "review/issue-189/archive-index.json").read_text())
        self.assertEqual(index["selectionSha256"], SELECTION_SHA256)
        self.assertEqual(index["ownerIssue"], 189)
        self.assertEqual(len(frozen["files"]), 19)
        self.assertEqual(sum(x["bytes"] for x in frozen["files"]), 11386774)
        items = {x["path"]: x for x in index["items"]}
        self.assertEqual(len(items), len(index["items"]))
        self.assertEqual(set(items), {x["path"] for x in frozen["files"]})
        for archive, expected in frozen["archives"].items():
            path = REPO / archive
            self.assertEqual(path.stat().st_size, expected["bytes"])
            payload = path.read_bytes()
            self.assertEqual(hashlib.sha256(payload).hexdigest(), expected["sha256"])
            self.assertEqual(blob_digest(payload), expected["git_blob"])
            self.assertEqual(index["archives"][archive], expected)
            with zipfile.ZipFile(path) as zipped:
                names = zipped.namelist()
                self.assertEqual(len(names), len(set(names)))
                self.assertEqual(len(names), 85)
                for name in names:
                    self.assertFalse(PurePosixPath(name).is_absolute())
                    self.assertNotIn("..", name.split("/"))
                for original in (x for x in frozen["files"] if x["archive"] == archive):
                    with self.subTest(original=original["path"]):
                        row = items[original["path"]]
                        for field in (
                            "path",
                            "bytes",
                            "sha256",
                            "git_blob",
                            "archive",
                            "member",
                        ):
                            self.assertEqual(row[field], original[field])
                        self.assertEqual(row["archiveSha256"], expected["sha256"])
                        self.assertEqual(zipped.getinfo(row["member"]).file_size, row["bytes"])
                        recovered = zipped.read(row["member"])
                        actual = subprocess.run(
                            ["unzip", "-p", str(path), row["member"]],
                            check=True,
                            capture_output=True,
                            timeout=30,
                        ).stdout
                        self.assertEqual(actual, recovered)
                        self.assertEqual(len(actual), row["bytes"])
                        self.assertEqual(hashlib.sha256(actual).hexdigest(), row["sha256"])
                        self.assertEqual(blob_digest(actual), row["git_blob"])
                        self.assertFalse((REPO / row["path"]).exists())
                gallery = archive.removesuffix(".zip") + "-index.html"
                self.assertEqual(
                    zipped.read(gallery),
                    gzip.decompress((REPO / (gallery + ".gz")).read_bytes()),
                )
                targets = set(names) | {
                    p.as_posix() for name in names for p in PurePosixPath(name).parents
                }
                for name in (name for name in names if name.endswith(".html")):
                    links = Links()
                    links.feed(zipped.read(name).decode("utf-8"))
                    for link in links.links:
                        url = urlsplit(link)
                        if url.scheme or url.netloc or not url.path:
                            continue
                        target = posixpath.normpath(
                            posixpath.join(str(PurePosixPath(name).parent), unquote(url.path))
                        )
                        self.assertIn(target, targets, (name, link))
                locator = Links()
                locator.feed((REPO / gallery).read_text())
                stem = PurePosixPath(archive).stem
                self.assertEqual(
                    set(locator.links),
                    {
                        stem + ".zip",
                        stem + "-index.html.gz",
                        stem + "-captures/ARCHIVE.md",
                    },
                )
                for target in locator.links:
                    self.assertTrue((REPO / "review" / target).is_file())

    def test_complete_protected_closure_and_final_capacity(self):
        frozen = selection()
        selected = {x["path"]: x for x in frozen["files"]}
        tree = subprocess.check_output(["git", "ls-tree", "-r", BASE], cwd=REPO, text=True)
        base = {}
        for line in tree.splitlines():
            metadata, path = line.split("\t", 1)
            mode, kind, digest = metadata.split()
            base[path] = (mode, kind, digest)
        current = set(
            subprocess.check_output(
                ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
                cwd=REPO,
            )
            .decode()
            .rstrip("\0")
            .split("\0")
        )
        self.assertEqual(set(base) - current, set(selected))
        self.assertEqual(current - set(base), ADDITIONS)
        protected = 0
        for path, (mode, kind, digest) in base.items():
            if path in selected:
                self.assertEqual(digest, selected[path]["git_blob"])
                continue
            if path in MUTABLE:
                continue
            with self.subTest(protected=path):
                native = REPO / path
                self.assertTrue(native.is_file())
                self.assertFalse(native.is_symlink())
                self.assertEqual(blob_digest(native.read_bytes()), digest)
                self.assertEqual(
                    "100755" if native.stat().st_mode & stat.S_IXUSR else "100644", mode
                )
                protected += 1
        # One separately reviewed control correction, not a blanket policy exemption.
        policy_path = "tools/quality/bandit-policy.json"
        before = json.loads(
            subprocess.check_output(["git", "show", BASE + ":" + policy_path], cwd=REPO)
        )
        after = json.loads((REPO / policy_path).read_text())
        self.assertEqual(set(before), set(after))
        for key in before.keys() - {"scope", "entries"}:
            self.assertEqual(before[key], after[key])
        self.assertTrue(after["scope"].startswith(before["scope"]))
        self.assertEqual(len(before["entries"]), len(after["entries"]))
        bindings = {"line", "source_sha256", "line_sha256", "rationale"}
        rebound = 0
        for old, new in zip(before["entries"], after["entries"]):
            if old["path"] != "tools/repository_intelligence.py":
                self.assertEqual(old, new)
                continue
            self.assertEqual(set(old), set(new))
            for key in old.keys() - bindings:
                self.assertEqual(old[key], new[key])
            self.assertTrue(new["rationale"].startswith(old["rationale"]))
            rebound += 1
        self.assertEqual(rebound, 3)
        # Only the four bootstrap conditions may admit this new owning policy.
        workflow_path = ".github/workflows/issue-acceptance.yml"
        workflow = subprocess.check_output(
            ["git", "show", BASE + ":" + workflow_path], cwd=REPO, text=True
        )
        policy_179 = "env.ACCEPTANCE_POLICY == '.github/acceptance/issue-179.json'"
        policy_189 = "env.ACCEPTANCE_POLICY == '.github/acceptance/issue-189.json'"
        expected_workflow = (
            workflow.replace(
                "          " + policy_179 + " ||",
                "          " + policy_179 + " ||\n          " + policy_189 + " ||",
            )
            .replace(
                "          " + policy_179 + "\n",
                "          " + policy_179 + " ||\n          " + policy_189 + "\n",
            )
            .replace(
                "        if: env.ACCEPTANCE_POLICY == '.github/acceptance/issue-177.json' || "
                + policy_179,
                "        if: >-\n          env.ACCEPTANCE_POLICY == '.github/acceptance/issue-177.json' ||\n          "
                + policy_179
                + " ||\n          "
                + policy_189,
            )
        )
        self.assertEqual(expected_workflow.count(policy_189), 4)
        self.assertEqual((REPO / workflow_path).read_bytes().decode("utf-8"), expected_workflow)
        # Preserve the complete old registry; only this owning-only row is added.
        registry_path = "tools/quality/test-profiles.json"
        old_registry = json.loads(
            subprocess.check_output(["git", "show", BASE + ":" + registry_path], cwd=REPO)
        )
        new_registry = json.loads((REPO / registry_path).read_bytes())
        expected_row = {
            'path': 'tests/test_issue189_acceptance.py',
            'language': 'python',
            'purpose': 'Issue189 archive recovery, protected closure/capacity and source-only maintenance routing; semantic eligibility, review and actual delivery remain external.',
            'owner': '.github/ACCEPTANCE.md',
            'lifecycle': 'task-snapshot',
            'profiles': ['issue-policy'],
            'disposition': 'Owning issue189 policy only; permanent RI and source-profile suites retain their existing routes without recurring historical task execution.',
            'surviving_route': '.github/acceptance/issue-189.json',
            'inputs': [
                'tests/test_issue189_acceptance.py',
                '.github/acceptance/issue-189.json',
                'review/issue-189/selected-files.json',
                'review/issue-189/archive-index.json',
                'review/issue-189/security-proof.json.gz',
                'tools/repository_intelligence.py',
                'tools/quality/test-profiles.json',
                'tools/quality/secrets-reviewed-checksums.json',
                'tools/quality/delivery-routing.cjs',
                'tools/quality/delivery-observation.cjs',
                'tests/delivery-observation.test.cjs',
                'tests/delivery-admission.test.cjs',
            ],
        }
        self.assertEqual(set(new_registry), set(old_registry))
        for key in old_registry.keys() - {"tests"}:
            self.assertEqual(new_registry[key], old_registry[key])
        self.assertEqual(new_registry["tests"], old_registry["tests"] + [expected_row])
        # One exact append-only companion correction; the other ledgers stay protected.
        ledger_path = "tools/quality/secrets-reviewed-checksums.json"
        old_ledger = json.loads(
            subprocess.check_output(["git", "show", BASE + ":" + ledger_path], cwd=REPO)
        )
        ledger_bytes = (REPO / ledger_path).read_bytes()
        self.assertLessEqual(len(ledger_bytes), 2000000)
        new_ledger = json.loads(ledger_bytes)
        self.assertEqual(set(old_ledger), set(new_ledger))
        for key in old_ledger.keys() - {"findings"}:
            self.assertEqual(old_ledger[key], new_ledger[key])
        self.assertEqual(new_ledger["findings"], old_ledger["findings"] + checked_secret_tail())
        # Python owning selection alone cannot establish the shared Node inventory.
        inventory = subprocess.run(
            [
                "node",
                "-e",
                "const s=require('./tools/quality/source-tests.cjs');"
                "s.validateRegistry(process.cwd(),s.loadRegistry(process.cwd()));"
                "require('./tools/quality/scanners.cjs').loadSecretReviews(process.cwd());",
            ],
            cwd=REPO,
            capture_output=True,
            text=True,
            timeout=30,
        )
        self.assertEqual(inventory.returncode, 0, inventory.stderr)
        spec = importlib.util.spec_from_file_location(
            "issue189_ri", REPO / "tools/repository_intelligence.py"
        )
        ri = importlib.util.module_from_spec(spec)
        exec(
            compile(
                (REPO / "tools/repository_intelligence.py").read_bytes(),
                str(spec.origin),
                "exec",
            ),
            ri.__dict__,
        )
        self.assertEqual(
            (
                ri.MAX_FILES,
                ri.MAX_HASH_TOTAL_BYTES,
                ri.MAX_HASH_FILE_BYTES,
                ri.MAX_TOTAL_BYTES,
                ri.MAX_FILE_BYTES,
            ),
            (5000, 250000000, 32000000, 50000000, 2000000),
        )
        surface = ri.verify(REPO, ".github/repository-intelligence-config.json")
        outputs = [
            "REPOSITORY-MAP.md",
            ".github/repository-intelligence/agent-context.json",
        ]
        diagnostic = ri.capacity(REPO, outputs)
        self.assertTrue(diagnostic["within_hard_limits"])
        self.assertGreaterEqual(diagnostic["metrics"]["hash_total_bytes"]["margin"], 10000000)
        inputs = [
            x["path"]
            for x in surface["source_identity"]["inputs"]
            if x["identity_mode"] == "content"
        ]
        hashed = sum((REPO / path).stat().st_size for path in inputs)
        derived = sum((REPO / path).stat().st_size for path in outputs)
        tracked = sum((REPO / path).stat().st_size for path in current)
        self.assertEqual(hashed, diagnostic["metrics"]["hash_total_bytes"]["used"])
        self.assertEqual(tracked, hashed + derived)
        print(
            json.dumps(
                {
                    "protected_paths": protected,
                    "hash_input_bytes": hashed,
                    "hash_headroom": 250000000 - hashed,
                    "tracked_bytes": tracked,
                    "derived_bytes": derived,
                    "metrics": diagnostic["metrics"],
                },
                sort_keys=True,
            )
        )


if __name__ == "__main__":
    unittest.main()
