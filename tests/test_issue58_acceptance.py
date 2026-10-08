"""R2 phase evidence for issue58; future phases retain their own open acceptance.

The fixed baseline belongs to mechanical formatting, not routine site regression.
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
        output = execute(
            [
                "node",
                "tools/quality/format-parity.cjs",
                "--baseline",
                BASELINE,
                "--controls",
                "tools/quality/format-parity-controls.json",
            ]
        )
        self.assertTrue(output.strip())

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


if __name__ == "__main__":
    unittest.main()
