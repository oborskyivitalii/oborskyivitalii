"""Issue 45 reuses maintained checks; measured browser and review gates stay open.

These bounded selections prove formula/ribbon/lifecycle/foreground contracts.
They do not claim that the new contour or reading margins look right, that the
60-case geometry diagnostic ran, or that a maintainer accepted the result.
"""

import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def node_checks(files, expected, pattern):
    """Select fixed existing cases and reject missing, failed or skipped tests."""
    result = subprocess.run(
        ["node", "--test", "--test-reporter=tap", "--test-name-pattern=" + pattern] + files,
        cwd=ROOT, text=True, capture_output=True, check=False, timeout=120,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    counts = {key: int(value) for key, value in re.findall(
        r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$", result.stdout, re.M)}
    assert counts.get("tests") == expected, (counts, result.stdout)
    assert counts.get("pass") == expected, (counts, result.stdout)
    assert all(counts.get(key) == 0 for key in ["fail", "skipped", "cancelled", "todo"])


class Issue45AcceptanceTests(unittest.TestCase):
    def test_crisp_world_layers_keep_one_bounded_cache_and_failure_containment(self):
        node_checks(["tests/renderer.test.cjs"], 3,
                    "^one fixed formula cache|^formula raster failure|^the Writing landmark inhabits")

    def test_same_artwork_drives_live_static_and_immutable_producer_identity(self):
        node_checks(["tests/site-engine.test.cjs"], 5,
                    "^the canonical formula|^Writing formula is|^embedded formula artwork|"
                    "^missing canonical formula|^formula media declaration")

    def test_formula_and_navigation_retain_the_existing_freeze_lifecycle(self):
        node_checks(["tests/space.test.cjs", "tests/navigation.test.cjs"], 5,
                    "^Off freezes|^reduced overrides|^Writing world formula stays|"
                    "^animated Color yields|^Off/reduced/hidden/print completion")

    def test_foreground_contrast_keeps_no_blur_or_independent_animation(self):
        node_checks(["tests/executive.test.cjs"], 1,
                    "^Day/Night semantic text and CTA pairs")

    def test_ribbon_world_samples_material_and_phase_stay_continuous(self):
        node_checks(["tests/ribbons.test.cjs"], 3,
                    "^axial twist, position, pulse and velocity|^opaque RGB material|"
                    "^fixed world cells keep projected ribbon stations stable")

    def test_displayed_camera_retargets_keep_detail_clock_and_failure_bounds(self):
        node_checks(["tests/space.test.cjs", "tests/navigation.test.cjs"], 7,
                    "^midflight destination layout retargeting preserves|"
                    "^flight models have their settled detail|^flight preparation preserves|"
                    "^travel progress is emitted|^detail fades across a tier change|"
                    "^quality recovery uses hysteresis|^retarget cancellation prevents")


if __name__ == "__main__":
    unittest.main()
