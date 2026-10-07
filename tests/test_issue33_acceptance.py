# SPDX-License-Identifier: Apache-2.0
"""Issue #33 immutable task evidence, selected by that owning policy only."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]


def load_tool(name):
    source = REPO / "tools" / (name + ".py")
    spec = importlib.util.spec_from_file_location("issue33_" + name, source)
    module = importlib.util.module_from_spec(spec)
    exec(compile(source.read_bytes(), str(source), "exec"), module.__dict__)
    return module


layout = load_tool("check_repository_layout")


class Issue33AcceptanceTests(unittest.TestCase):
    def test_existing_review_evidence_is_unchanged_at_accepted_base(self):
        entries = layout.baseline_entries(REPO, ["review"])
        self.assertTrue(entries)
        layout.validate_unchanged(REPO, entries, "existing review evidence")

    def test_site_publications_and_runtime_bytes_are_unchanged(self):
        layout.validate_public(REPO, layout.read_json(REPO, layout.LAYOUT))

    def test_changed_or_deleted_protected_bytes_fail_against_fixed_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            path = root / "docs/index.html"
            source = b"<main>Accepted publication</main>\n"
            expected = {"docs/index.html": layout.blob_digest(source)}
            path.write_bytes(source)
            layout.validate_unchanged(root, expected, "public/runtime")
            path.write_bytes(source.replace(b"Accepted", b"Modified"))
            with self.assertRaisesRegex(ValueError, "Changed public/runtime bytes"):
                layout.validate_unchanged(root, expected, "public/runtime")
            path.unlink()
            with self.assertRaisesRegex(ValueError, "Missing layout file"):
                layout.validate_unchanged(root, expected, "public/runtime")

    def test_locator_exceptions_do_not_allow_semantic_or_publication_edits(self):
        data = layout.read_json(REPO, layout.LAYOUT)
        for path in ["site/README.md", "tools/quality/README.md", "site/content/catalog.json",
                     ".github/workflows/site-color-review.yml"]:
            expected = layout.allowed_locator_bytes(REPO, path, data)
            layout.validate_locator_content((REPO / path).read_bytes(), expected, path)
            with self.subTest(path=path), self.assertRaisesRegex(ValueError, "Non-locator adaptation"):
                layout.validate_locator_content(expected + b"New semantic scope\n", expected, path)
        catalog = layout.allowed_locator_bytes(REPO, "site/content/catalog.json", data)
        modified = json.loads(catalog)
        modified["records"].pop(next(iter(modified["records"])))
        with self.assertRaisesRegex(ValueError, "Non-locator adaptation"):
            layout.validate_locator_content(json.dumps(modified).encode(), catalog, "site/content/catalog.json")

    def test_policy_covers_six_criteria_and_separate_required_gates(self):
        acceptance = load_tool("issue_acceptance")
        policy, _ = acceptance.load_policy(REPO / ".github/acceptance/issue-33.json")
        self.assertEqual(policy["repository"], layout.REPOSITORY)
        self.assertEqual(policy["issue"], 33)
        self.assertEqual([criterion["id"] for criterion in policy["criteria"]],
                         [f"AC{number:02}" for number in range(1, 7)])
        self.assertEqual({key: gate["kind"] for key, gate in policy["gates"].items()},
                         {"G01": "human", "G02": "merge", "G03": "human"})
        self.assertEqual(policy["checks"]["NODE-BASIC"], {"kind": "node-basic"})
        workflow = (REPO / ".github/workflows/issue-acceptance.yml").read_text()
        for bound in ["--require-clean", "--expected-source", "if: always()", "fetch-depth: 0"]:
            self.assertIn(bound, workflow)

    def test_current_handoff_and_versioned_analysis_point_to_owner(self):
        memory = (REPO / "MEMORY.md").read_text(encoding="utf-8")
        self.assertIn("issues/31", memory)
        self.assertIn("issues/33", memory)
        self.assertIn("pull/32", memory)
        self.assertLessEqual(len(memory.splitlines()), 120)
        analysis = (REPO / "review/issue-33/2026-10-07-analysis.md").read_text(encoding="utf-8")
        self.assertIn(layout.BASE, analysis)
        self.assertIn("issues/33", analysis)
        self.assertRegex(analysis, r"(?m)^## .*tasks")
        # Live PR/commit/review/CI linkage and independence are gate evidence.


if __name__ == "__main__":
    unittest.main()
