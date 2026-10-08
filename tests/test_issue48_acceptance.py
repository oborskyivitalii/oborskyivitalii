"""Issue 48 selects maintained theory, landmark, response, Talks and generation checks.

These selections prove source invariants and reject unapproved semantic changes.
Current-preview visual acceptance, source/editorial and independent review, CI
artifact binding and the maintainer's merge decision remain explicit gates.
"""

import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def node_checks(files, names):
    """Run fixed exact cases; missing, failed or skipped selections cannot pass."""
    pattern = "^(?:" + "|".join(re.escape(name) for name in names) + ")$"
    result = subprocess.run(
        ["node", "--test", "--test-reporter=tap", "--test-name-pattern=" + pattern] + files,
        cwd=ROOT, text=True, capture_output=True, check=False, timeout=120,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    counts = {key: int(value) for key, value in re.findall(
        r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$", result.stdout, re.M)}
    assert counts.get("tests") == len(names), (counts, result.stdout)
    assert counts.get("pass") == len(names), (counts, result.stdout)
    assert all(counts.get(key) == 0 for key in ["fail", "skipped", "cancelled", "todo"]), (
        counts, result.stdout)


class Issue48AcceptanceTests(unittest.TestCase):
    def test_theories_retain_project_order_and_responsive_named_association(self):
        node_checks(["tests/content.test.cjs", "tests/executive.test.cjs"], [
            "research theories retain project alignment and explicit association on narrow layouts",
            "Day/Night semantic text and CTA pairs exceed normal-text contrast with no independent atmosphere clock",
            "reading surfaces have one shared CSS authority across base and Color renditions",
        ])

    def test_formula_midpoint_keeps_world_transform_projection_and_static_rendition(self):
        node_checks(["tests/site-engine.test.cjs", "tests/renderer.test.cjs"], [
            "the canonical formula compiles once into finite strong glyphs and rejects executable, malformed and changed artwork",
            "Writing formula is a tilted moving world landmark with one same-scene static rendition and no layout band",
            "the Writing landmark inhabits the book fractal and follows its periodic world transform and forward camera",
            "one fixed formula cache preserves scene order and is reused across room visits and viewport sizes",
        ])

    def test_verified_response_and_exact_amendment_preserve_unrelated_evidence(self):
        node_checks(["tests/content.test.cjs", "tests/executive.test.cjs"], [
            "selected Home responses link to the complete Research inventory with preserved evidence",
            "response reconciliation rejects missing people, sources and stronger participation claims",
            "issue48 amendment reverses only declared theory and Matthew changes",
        ])

    def test_generated_publication_and_seo_retain_all_unrelated_semantics(self):
        node_checks(["tests/executive.test.cjs", "tests/site-engine.test.cjs"], [
            "executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy",
            "source migration preserves publication HTML and thematic geometry when shared vocabulary expands",
        ])

    def test_talks_curates_distinct_sourced_events_and_rejects_invented_details(self):
        node_checks(["tests/content.test.cjs", "tests/executive.test.cjs"], [
            "Talks curates distinct events with source-supported dates, language and resources",
            "Talks reconciliation rejects missing events, substituted sources and invented dates or resources",
        ])


if __name__ == "__main__":
    unittest.main()
