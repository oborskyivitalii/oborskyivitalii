"""Issue72 current-source contracts; host/settings/release decisions stay external."""

import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run_node(case, module):
    result = subprocess.run(
        ["node", "--test", "--test-reporter=tap", str(ROOT / module)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=60,
        check=False,
    )
    case.assertEqual(result.returncode, 0, result.stdout + result.stderr)
    counts = {}
    for name in ("tests", "pass", "fail", "cancelled", "skipped", "todo"):
        values = re.findall(rf"^# {name} ([0-9]+)$", result.stdout, re.MULTILINE)
        case.assertEqual(len(values), 1, result.stdout)
        counts[name] = int(values[0])
    case.assertGreater(counts["tests"], 0)
    case.assertEqual(counts["pass"], counts["tests"])
    case.assertEqual(sum(counts[key] for key in ("fail", "cancelled", "skipped", "todo")), 0)
    case.assertRegex(result.stdout, r"# Subtest: ")


class Issue72AcceptanceTests(unittest.TestCase):
    def test_prototype_and_exact_head_admission(self):
        run_node(self, "tests/prototype-admission.test.cjs")

    def test_same_run_preflight_reuse(self):
        run_node(self, "tests/prepublication-reuse.test.cjs")

    def test_pages_edition_preservation_and_recovery(self):
        run_node(self, "tests/pages-delivery.test.cjs")

    def test_durable_archive_and_verified_transitions(self):
        run_node(self, "tests/release-archive.test.cjs")
        run_node(self, "tests/release-controller.test.cjs")

    def test_complete_production_gate_and_candidate_wiring(self):
        run_node(self, "tests/quality.test.cjs")
        workflow = (ROOT / ".github/workflows/site-candidate-evidence.yml").read_text()
        for key in (
            "base_url",
            "public_artifact_id",
            "public_run_id",
            "public_digest",
            "public_upload_digest",
        ):
            self.assertIn(key + ": ${{ inputs." + key + " }}", workflow)
        self.assertIn("validation_level: production", workflow)
        self.assertIn("full: true", workflow)
        self.assertIn("automated_only: true", workflow)

    def test_profile_and_catalog_allocation(self):
        registry = json.loads((ROOT / "tools/quality/test-profiles.json").read_text())
        rows = {row["path"]: row for row in registry["tests"]}
        catalog = json.loads((ROOT / ".github/repository-paths.json").read_text())["entries"]
        for name in (
            "prototype-admission",
            "prepublication-reuse",
            "pages-delivery",
            "release-archive",
            "release-controller",
        ):
            file = "tests/" + name + ".test.cjs"
            self.assertEqual(rows[file]["lifecycle"], "permanent")
            self.assertEqual(rows[file]["profiles"], ["pr-targeted", "staging", "production"])
            self.assertEqual(catalog[file]["role"], "test")
        self.assertEqual(rows["tests/test_issue72_acceptance.py"]["profiles"], ["issue-policy"])


if __name__ == "__main__":
    unittest.main()
