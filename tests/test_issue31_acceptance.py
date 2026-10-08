# SPDX-License-Identifier: Apache-2.0
"""Issue #31 observables on the actual repository, not assertions of live approval.

These checks prove identities, bounded formats, checked navigation and documented
routes. Whether the writing satisfies the maintainer's intent needs independent
review; issue/PR linkage and protected merge need current GitHub evidence.
"""

import hashlib
import importlib.util
import json
import subprocess
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
BASE = "07f936a8733f56d73f34b89e2ad96d1b2ef605c7"
UPSTREAM = "345c8f50745e5fde1303d0d7952634f7899220c9"
ARCHIVE = "review/repository-maintenance-20261007/AGENTS.before.md"
ARCHIVE_SHA256 = "be34d9ada2f71dc96d188874a22446add242f535d6c45fa820ee130729f5a513"
PUBLIC_PATHS = ["site", "docs", "tools/site", "tools/quality", "tools/staging"]


def load_tool(name):
    spec = importlib.util.spec_from_file_location(name, REPO / "tools" / (name + ".py"))
    module = importlib.util.module_from_spec(spec)
    source = REPO / "tools" / (name + ".py")
    exec(compile(source.read_bytes(), str(source), "exec", dont_inherit=True), module.__dict__)
    return module


def text(path):
    return (REPO / path).read_text(encoding="utf-8")


class Issue31AcceptanceTests(unittest.TestCase):
    def test_upstream_pin_and_component_notices(self):
        config = json.loads(text(".github/repository-intelligence-config.json"))
        upstream = config["upstream"]
        self.assertEqual(
            upstream["repository"], "UncertaintyArchitectureGroup/uncertainty-architecture"
        )
        self.assertEqual(upstream["ref"], UPSTREAM)
        self.assertEqual(upstream["producer_version"], 6)
        self.assertEqual(upstream["producer_path"], ".github/scripts/repository_intelligence.py")
        for key in ["producer_blob", "architecture_blob"]:
            self.assertRegex(upstream[key], r"\A[0-9a-f]{40}\Z")
        self.assertIn(UPSTREAM, text("tools/RI-NOTICE.md"))
        self.assertIn("Apache", text("tools/RI-LICENSE.md"))
        architecture = text(".github/REPOSITORY-INTELLIGENCE.md")
        self.assertIn(UPSTREAM, architecture)
        self.assertIn("## Upstream and adapted scope", architecture)
        self.assertRegex(architecture, r"(?i)upgrade")

    def test_complete_catalog_and_fresh_generated_views(self):
        ri = load_tool("repository_intelligence")
        surface = ri.verify(REPO, ".github/repository-intelligence-config.json")
        inventory = {item["path"] for item in surface["artifacts"]}
        tracked = set(
            subprocess.check_output(["git", "-C", str(REPO), "ls-files", "-z"])
            .decode()
            .rstrip("\0")
            .split("\0")
        )
        self.assertTrue(tracked <= inventory, "Tracked paths must not be omitted from RI")
        expected_directories = {"."}
        for path in inventory:
            expected_directories.update(parent.as_posix() for parent in Path(path).parents)
        self.assertEqual({item["path"] for item in surface["directories"]}, expected_directories)
        catalog = json.loads(text(".github/repository-paths.json"))["entries"]
        self.assertEqual(set(catalog), inventory | expected_directories)
        root_paths = [path for path in inventory if "/" not in path]
        self.assertTrue(root_paths)
        self.assertEqual(len({catalog[path]["purpose"] for path in root_paths}), len(root_paths))
        for path in root_paths:
            self.assertGreater(len(catalog[path]["purpose"].strip()), 10)

    def test_compact_agent_route(self):
        guide = text("AGENTS.md")
        self.assertLessEqual(len(guide.splitlines()), 100)
        for path in [
            "MEMORY.md",
            "REPOSITORY-MAP.md",
            "CONTRIBUTING.md",
            ".github/REPOSITORY-INTELLIGENCE.md",
            ".github/ACCEPTANCE.md",
        ]:
            self.assertIn(path, guide)
            self.assertTrue((REPO / path).is_file())
        self.assertIn("## Start from an issue", guide)
        self.assertNotRegex(guide, r"actions/runs/[0-9]+|## .*2026-10-0[1-6]")

    def test_archived_guide_exactly_matches_baseline(self):
        archived = (REPO / ARCHIVE).read_bytes()
        original = subprocess.check_output(["git", "-C", str(REPO), "show", f"{BASE}:AGENTS.md"])
        self.assertEqual(archived, original)
        self.assertEqual(hashlib.sha256(archived).hexdigest(), ARCHIVE_SHA256)
        surface = json.loads(text(".github/repository-intelligence/agent-context.json"))
        self.assertNotIn(ARCHIVE, {item["path"] for item in surface["instructions"]})

    def test_memory_is_bounded_dated_and_has_sections(self):
        memory = text("MEMORY.md")
        self.assertLessEqual(len(memory.splitlines()), 120)
        for heading in ["Snapshot", "Decisions", "Open work", "Next session", "Maintenance"]:
            self.assertEqual(memory.count("## " + heading + "\n"), 1)
        self.assertRegex(memory, r"Last verified:.*[0-9]{4}-[0-9]{2}-[0-9]{2}")
        self.assertIn("issues/31", memory)
        self.assertIn("pull/32", memory)
        self.assertRegex(memory, r"(?i)revalidat|recheck")
        # This checks the dated contract; truth of live facts is a pending gate.

    def test_issue_and_pr_templates_expose_evidence_routes(self):
        contributing = text("CONTRIBUTING.md")
        for heading in [
            "## Acceptance criteria and session evidence",
            "## Review, analysis and model handoff",
        ]:
            self.assertIn(heading, contributing)
        self.assertIn(".github/ACCEPTANCE.md", contributing)
        self.assertIn("Refs #N", contributing)
        for path in [".github/ISSUE_TEMPLATE/work-item.md", ".github/pull_request_template.md"]:
            template = text(path)
            self.assertRegex(template, r"AC[0-9]{2}|ACxx")
            self.assertRegex(template, r"(?i)acceptance")
            self.assertRegex(template, r"(?i)report|evidence")

    def test_public_and_runtime_paths_match_immutable_baseline(self):
        expected = subprocess.check_output(
            [
                "git",
                "-C",
                str(REPO),
                "ls-tree",
                "-r",
                "--name-only",
                "-z",
                BASE,
                "--",
                *PUBLIC_PATHS,
            ]
        )
        actual = subprocess.check_output(
            [
                "git",
                "-C",
                str(REPO),
                "ls-files",
                "--cached",
                "--others",
                "--exclude-standard",
                "-z",
                "--",
                *PUBLIC_PATHS,
            ]
        )
        # The sole site documentation exception was part of the original cleanup.
        guide_exception = b"site/README.md"
        self.assertEqual(
            set(expected.split(b"\0")) - {guide_exception},
            set(actual.split(b"\0")) - {guide_exception},
            "Public/runtime path set changed",
        )
        difference = subprocess.run(
            [
                "git",
                "-C",
                str(REPO),
                "diff",
                "--no-ext-diff",
                "--no-textconv",
                "--exit-code",
                BASE,
                "--",
                *PUBLIC_PATHS,
                ":(exclude)site/README.md",
            ],
            text=True,
            capture_output=True,
        )
        self.assertEqual(
            difference.returncode,
            0,
            "Public/runtime source differs from immutable baseline: " + difference.stdout[:4000],
        )

    def test_policy_maps_all_agreed_ids_and_has_nonautomated_gates(self):
        acceptance = load_tool("issue_acceptance")
        policy, _ = acceptance.load_policy(REPO / ".github/acceptance/issue-31.json")
        self.assertEqual(policy["repository"], "oborskyivitalii/oborskyivitalii")
        self.assertEqual(policy["issue"], 31)
        self.assertEqual(
            [criterion["id"] for criterion in policy["criteria"]],
            [f"AC{number:02}" for number in range(1, 12)],
        )
        self.assertEqual(policy["gates"]["G02"]["kind"], "merge")
        self.assertEqual(policy["gates"]["G01"]["kind"], "human")
        self.assertEqual(policy["gates"]["G03"]["kind"], "human")
        workflow = text(".github/workflows/issue-acceptance.yml")
        self.assertIn("--require-clean", workflow)
        self.assertIn("--expected-source", workflow)
        self.assertIn("if: always()", workflow)
        self.assertIn("fetch-depth: 0", workflow)
        self.assertIn("persist-credentials: false", workflow)

    def test_canonical_review_and_analysis_artifact_routes(self):
        for path in ["review/REVIEW-TEMPLATE.md", "review/issue-31/2026-10-07-analysis.md"]:
            self.assertTrue((REPO / path).is_file(), path)
        analysis = text("review/issue-31/2026-10-07-analysis.md")
        self.assertIn("## Sol tasks", analysis)
        self.assertIn("issues/31", analysis)
        self.assertIn("pull/32", analysis)
        contributing = text("CONTRIBUTING.md")
        self.assertIn("review/REVIEW-TEMPLATE.md", contributing)
        self.assertRegex(contributing, r"(?i)anchor")
        # Existence/topology is automated; findings and attribution need review.

    def test_bootstrap_prompt_is_repository_anchored(self):
        prompt = text("PROJECT-BOOTSTRAP.md")
        for fragment in [
            "oborskyivitalii/oborskyivitalii",
            "README.md",
            "AGENTS.md",
            "MEMORY.md",
            "REPOSITORY-MAP.md",
        ]:
            self.assertIn(fragment, prompt)
        self.assertLessEqual(len(prompt), 1000)
        self.assertLessEqual(len([line for line in prompt.splitlines() if line.strip()]), 12)
        # #33 explicitly supersedes the former long prompt; #31 evidence is pinned.
        # Semantic usefulness/language is part of independent review.


if __name__ == "__main__":
    unittest.main()
