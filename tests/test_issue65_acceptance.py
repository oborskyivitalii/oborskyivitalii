"""Issue 65 source observables; semantic findings and live decisions need review.

This task suite is selected only by its owning acceptance policy. It reuses
enduring guard negatives without rewriting historical issue snapshots.
"""

import collections
import importlib.util
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "9da2476c9269345a242c7524374a645b0a21c2d4"
EVIDENCE = "review/issue-65/2026-10-09-dispositions.json"
COMMON = ["README.md", "AGENTS.md", "CONTRIBUTING.md", "MEMORY.md"]
ROUTES = {
    "T0": ["site/README.md", ".github/ACCEPTANCE.md", "guides/SITE-CHECK-PROFILES.md"],
    "T1": [
        "site/README.md",
        ".github/ACCEPTANCE.md",
        "guides/SITE-CHECK-PROFILES.md",
        "guides/CODE-STYLE.md",
    ],
    "T2": ["guides/REPOSITORIES.md"],
    "T3": [
        ".github/ACCEPTANCE.md",
        "guides/SITE-CHECK-PROFILES.md",
        "guides/SITE-RELEASE-GATES.md",
        "guides/SITE-STAGING.md",
    ],
    "T4": [
        ".github/ACCEPTANCE.md",
        ".github/REPOSITORY-INTELLIGENCE.md",
        "guides/CODE-STYLE.md",
    ],
}


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


def read(path, ref=None):
    return git("show", f"{ref}:{path}") if ref else (ROOT / path).read_bytes()


def reading_cost(ref=None):
    return {
        task: sum(len(read(path, ref)) for path in dict.fromkeys(COMMON + paths))
        for task, paths in ROUTES.items()
    }


def category(path, rules):
    for rule in rules:
        matches = path in rule.get("exact", []) or any(
            path.startswith(prefix) for prefix in rule.get("prefix", [])
        )
        if matches and (
            "suffix" not in rule or any(path.endswith(suffix) for suffix in rule["suffix"])
        ):
            return rule["category"]
    raise ValueError(f"Unclassified overhead path: {path}")


def anchor_exists(path, anchor):
    headings = re.findall(r"^#{1,6} (.+)$", (ROOT / path).read_text(), re.M)
    slugs = {re.sub(r"[^\w\- ]", "", heading.lower()).replace(" ", "-") for heading in headings}
    return anchor in slugs


class Issue65AcceptanceTests(unittest.TestCase):
    def test_reading_cost_and_existing_bounds(self):
        before, after = reading_cost(BASE), reading_cost()
        for task in ["T0", "T1"]:
            self.assertLess(after[task], before[task], task)
        for name, cap in [("AGENTS.md", 100), ("MEMORY.md", 120)]:
            self.assertLessEqual(len(read(name).splitlines()), cap)
        for section in ["Snapshot", "Decisions", "Open work", "Next session", "Maintenance"]:
            self.assertEqual(read("MEMORY.md").decode().count("## " + section + "\n"), 1)
        guide = read("AGENTS.md").decode()
        for task in ROUTES:
            self.assertRegex(guide, rf"(?m)^\| {task}\b")
        for path in dict.fromkeys(COMMON + sum(ROUTES.values(), [])):
            self.assertTrue((ROOT / path).is_file(), path)

    def test_disposition_structure_and_destination_anchors(self):
        data = json.loads(read(EVIDENCE))
        self.assertEqual(data["base_sha"], BASE)
        self.assertEqual(
            [row["id"] for row in data["findings"]], [f"F{i:02}" for i in range(1, 15)]
        )
        for finding in data["findings"]:
            self.assertIn(finding["status"], ["verified", "corrected", "refuted", "unresolved"])
            self.assertTrue(finding["reason"].strip())
            self.assertTrue(finding["evidence"])
        self.assertEqual([row["id"] for row in data["invariants"]], [f"I{i}" for i in range(1, 9)])
        for row in data["invariants"] + data["changed_rules"]:
            self.assertTrue(row["disposition"].strip())
            self.assertTrue(row["review_route"].strip())
            for destination in row["destinations"]:
                path, anchor = destination.split("#", 1)
                self.assertTrue(anchor_exists(path, anchor), destination)
        # Only topology is proved here; completeness and semantics require review.

    def test_frozen_product_and_debt_sources(self):
        self.assertEqual(
            git("diff", "--no-ext-diff", "--no-textconv", BASE, "--", "site/", "docs/"), b""
        )
        self.assertEqual(
            git("ls-files", "--others", "--exclude-standard", "--", "site/", "docs/"), b""
        )
        self.assertEqual(read(".github/code-style.json"), read(".github/code-style.json", BASE))
        self.assertEqual(read("tools/check_code_style.py"), read("tools/check_code_style.py", BASE))
        self.assertEqual(read("tools/issue_acceptance.py"), read("tools/issue_acceptance.py", BASE))

    def test_overhead_snapshot_matches_pinned_git_diffs(self):
        data = json.loads(read("review/issue-65/2026-10-09-overhead-input.json"))
        self.assertEqual(data["baseline"]["sha"], BASE)
        self.assertEqual(
            [pr["metadata"]["number"] for pr in data["pull_requests"]], [60, 63, 57, 55, 51]
        )
        for pr in data["pull_requests"]:
            meta = pr["metadata"]
            parts = iter(
                git("diff", "--numstat", "-z", meta["base_sha"], meta["head_sha"]).split(b"\0")
            )
            actual = []
            for item in parts:
                if not item:
                    continue
                added, deleted, path = item.split(b"\t", 2)
                previous = None
                if not path:
                    previous, path = next(parts).decode(), next(parts)
                binary = added == b"-" or deleted == b"-"
                actual.append(
                    (
                        path.decode(),
                        previous,
                        None if binary else int(added),
                        None if binary else int(deleted),
                        binary,
                    )
                )
            recorded = [
                (r["path"], r["previous_path"], r["additions"], r["deletions"], r["binary"])
                for r in pr["numstat_rows"]
            ]
            self.assertEqual(actual, recorded, meta["number"])
            self.assertEqual(len(actual), meta["changed_files"])
            self.assertEqual(sum(r[2] or 0 for r in actual), meta["additions"])
            self.assertEqual(sum(r[3] or 0 for r in actual), meta["deletions"])
            counts = collections.Counter(r[0] for r in actual)
            self.assertTrue(all(count == 1 for count in counts.values()))
            totals = {}
            for row in pr["numstat_rows"]:
                label = category(row["path"], data["measurement"]["ordered_rules"])
                self.assertEqual(row["category"], label, row["path"])
                total = totals.setdefault(
                    label, {"files": 0, "additions": 0, "deletions": 0, "binary_files": 0}
                )
                total["files"] += 1
                total["additions"] += row["additions"] or 0
                total["deletions"] += row["deletions"] or 0
                total["binary_files"] += int(row["binary"])
            self.assertEqual(totals, pr["category_totals"], meta["number"])

    def test_current_policy_and_navigation(self):
        spec = importlib.util.spec_from_file_location(
            "acceptance65", ROOT / "tools/issue_acceptance.py"
        )
        module = importlib.util.module_from_spec(spec)
        exec(
            compile((ROOT / "tools/issue_acceptance.py").read_bytes(), str(spec.origin), "exec"),
            module.__dict__,
        )
        policy, _ = module.load_policy(ROOT / ".github/acceptance/issue-65.json")
        self.assertEqual(policy["issue"], 65)
        self.assertEqual(
            [row["id"] for row in policy["criteria"]], [f"AC{i:02}" for i in range(1, 10)]
        )
        self.assertEqual(policy["gates"]["MERGED"]["kind"], "merge")
        self.assertEqual(policy["gates"]["REVIEW"]["kind"], "human")
        subprocess.run(
            [
                "python3",
                "tools/repository_intelligence.py",
                "--config",
                ".github/repository-intelligence-config.json",
                "verify",
            ],
            cwd=ROOT,
            check=True,
            capture_output=True,
        )


if __name__ == "__main__":
    unittest.main()
