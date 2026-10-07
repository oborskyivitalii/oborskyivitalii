# SPDX-License-Identifier: Apache-2.0
"""Issue #36 controller compatibility phase; feature acceptance remains pending."""
import unittest
from pathlib import Path

from test_issue35_acceptance import run_node

REPO = Path(__file__).resolve().parents[1]


class Issue36ControllerTests(unittest.TestCase):
    def test_declared_media_and_legacy_package_regressions(self):
        result = run_node(REPO / "tests/staging.test.cjs")
        self.assertGreaterEqual(result["tests"], 12)
        self.assertIn(
            "controller package consumer rechecks formula media binding even when package manifests are internally consistent",
            result["case_names"],
        )
