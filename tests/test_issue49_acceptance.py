"""Current Issue49 shared transition contracts; visual/cost admission stays explicit.

Inherited Issue48 checks are selected individually by the shared policy. Its
historical whole-policy acceptance is not rerun as a second execution owner.
"""

import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def node_cases(files):
    result = subprocess.run(
        ["node", "--test", "--test-reporter=tap", *files],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
        timeout=180,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    counts = {
        key: int(value)
        for key, value in re.findall(
            r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$",
            result.stdout,
            re.MULTILINE,
        )
    }
    assert counts.get("tests", 0) > 0, result.stdout
    assert counts.get("pass") == counts["tests"], result.stdout
    assert all(counts.get(key) == 0 for key in ["fail", "skipped", "cancelled", "todo"]), (
        counts,
        result.stdout,
    )


class Issue49AcceptanceTests(unittest.TestCase):
    def test_fragment_plan_and_resource_contracts(self):
        node_cases(["tests/fragment-plan.test.cjs"])

    def test_fragment_dom_native_handoff_contracts(self):
        node_cases(["tests/fragment-dom.test.cjs", "tests/flight.test.cjs"])

    def test_stationary_reading_and_lifecycle_contracts(self):
        node_cases(["tests/space.test.cjs", "tests/navigation.test.cjs"])


if __name__ == "__main__":
    unittest.main()
