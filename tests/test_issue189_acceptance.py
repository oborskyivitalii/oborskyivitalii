# SPDX-License-Identifier: Apache-2.0
"""Issue189 exact-source archive/protection facts; selected only by its own policy.

These checks do not establish archive eligibility, independent review, ownership
acceptance, hosted delivery or media playback. Those remain explicit policy gates.
"""

import gzip
import hashlib
import importlib.util
import json
import posixpath
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
    ".github/workflows/issue-acceptance.yml",
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


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        self.links.extend(
            value for key, value in attrs if key in {"href", "src", "poster"} and value
        )


class Issue189AcceptanceTests(unittest.TestCase):
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
                        for field in ("path", "bytes", "sha256", "git_blob", "archive", "member"):
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
                    zipped.read(gallery), gzip.decompress((REPO / (gallery + ".gz")).read_bytes())
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
                    {stem + ".zip", stem + "-index.html.gz", stem + "-captures/ARCHIVE.md"},
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
                ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd=REPO
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
        spec = importlib.util.spec_from_file_location(
            "issue189_ri", REPO / "tools/repository_intelligence.py"
        )
        ri = importlib.util.module_from_spec(spec)
        exec(
            compile(
                (REPO / "tools/repository_intelligence.py").read_bytes(), str(spec.origin), "exec"
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
        outputs = ["REPOSITORY-MAP.md", ".github/repository-intelligence/agent-context.json"]
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
