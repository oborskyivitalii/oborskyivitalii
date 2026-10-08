"""Issue58 phase checks: accepted R2 snapshot and current candidate contracts.

The fixed R2 baseline is observed with frozen tools, independently of later code.
Actual hosted/scanner/review/merge decisions are separately recorded in the issue.
"""

import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = "2138131b718d1ac4734f6b2c55520eb37e98ca6a"


def execute(arguments):
    result = subprocess.run(
        arguments, cwd=ROOT, capture_output=True, text=True, check=False, timeout=180
    )
    assert result.returncode == 0, result.stdout + result.stderr
    return result.stdout


def node_cases(files):
    output = execute(["node", "--test", "--test-reporter=tap", *files])
    counts = {
        key: int(value)
        for key, value in re.findall(
            r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$", output, re.M
        )
    }
    assert counts.get("tests", 0) > 0, output
    assert counts["pass"] == counts["tests"], output
    assert all(counts.get(key) == 0 for key in ["fail", "skipped", "cancelled", "todo"]), output


class Issue58R2AcceptanceTests(unittest.TestCase):
    def test_actual_maintained_formatting(self):
        output = execute(["node", "tools/quality/format.cjs", "--check"])
        self.assertTrue(output.strip())

    def test_formatter_and_semantic_failure_contracts(self):
        node_cases(["tests/format.test.cjs", "tests/format-parity.test.cjs"])

    def test_original_maintained_source_semantics(self):
        output = execute(["node", "tools/quality/phase-checkpoint.cjs"])
        report = json.loads(output)
        self.assertTrue(report["pass"])
        self.assertEqual(report["baselineCommit"], BASELINE)
        self.assertEqual(report["checkpointCommit"], "8c6cf877fee92b4d2493b4c1a07df7080b987c29")

    def test_phase_checkpoint_failure_contracts(self):
        node_cases(["tests/phase-checkpoint.test.cjs"])

    def test_source_coverage_and_exact_debt_contracts(self):
        node_cases(["tests/quality-sources.test.cjs"])

    def test_serialized_generation_and_incremental_contracts(self):
        node_cases(
            [
                "tests/effects.test.cjs",
                "tests/site-engine.test.cjs",
                "tests/preview.test.cjs",
                "tests/color-build.test.cjs",
            ]
        )

    def test_original_budgets_and_frozen_security_baseline(self):
        for name in ["tools/quality/budgets.json", "tools/quality/secrets-baseline.json"]:
            before = subprocess.check_output(["git", "show", BASELINE + ":" + name], cwd=ROOT)
            current = (ROOT / name).read_bytes()
            if name.endswith("budgets.json"):
                self.assertEqual(json.loads(current), json.loads(before), name)
            else:
                self.assertEqual(current, before, name)


class Issue58PhaseAcceptanceTests(unittest.TestCase):
    def test_content_ownership_and_parity(self):
        node_cases(
            [
                "tests/content-rendering.test.cjs",
                "tests/content-migration.test.cjs",
                "tests/content.test.cjs",
                "tests/archive.test.cjs",
            ]
        )

    def test_runtime_build_cohesion_and_lifecycle(self):
        node_cases(
            [
                "tests/architecture.test.cjs",
                "tests/build-cohesion.test.cjs",
                "tests/camera-view.test.cjs",
                "tests/ribbons.test.cjs",
                "tests/navigation.test.cjs",
                "tests/space.test.cjs",
            ]
        )

    def test_static_css_ownership_and_parity(self):
        node_cases(["tests/effects.test.cjs", "tests/executive.test.cjs"])

    def test_resource_measurement_failure_contracts(self):
        node_cases(["tests/refactor-metrics.test.cjs"])


if __name__ == "__main__":
    unittest.main()
