"""Issue5 executes maintained publisher/reader/delivery behavior; human gates stay distinct."""

import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue5AcceptanceTests(unittest.TestCase):
    def run_node_contracts(self, modules, minimum):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", *modules],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=180,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        rows = re.findall(
            r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$",
            result.stdout,
            re.M,
        )
        self.assertEqual(len(rows), 6, result.stdout)
        counts = {key: int(value) for key, value in rows}
        self.assertGreaterEqual(counts.get("tests", 0), minimum, result.stdout)
        self.assertEqual(counts.get("pass"), counts.get("tests"), result.stdout)
        for key in ["fail", "skipped", "cancelled", "todo"]:
            self.assertEqual(counts.get(key), 0, result.stdout)

    def test_publisher_contracts(self):
        self.run_node_contracts(
            [
                "tests/publishing.test.cjs",
                "tests/publishing-history.test.cjs",
                "tests/publishing-profile.test.cjs",
                "tests/publishing-safety.test.cjs",
                "tests/publishing-print.test.cjs",
            ],
            32,
        )

    def test_article_reader_and_generation(self):
        self.run_node_contracts(
            [
                "tests/site-articles.test.cjs",
                "tests/site-transaction.test.cjs",
                "tests/article-offline.test.cjs",
                "tests/local-catalog-relationships.test.cjs",
                "tests/navigation.test.cjs",
            ],
            40,
        )

    def test_article_delivery(self):
        self.run_node_contracts(
            [
                "tests/article-delivery.test.cjs",
                "tests/article-budgets.test.cjs",
                "tests/article-browser-evidence.test.cjs",
                "tests/article-candidate-source.test.cjs",
                "tests/pages-delivery.test.cjs",
                "tests/color-build.test.cjs",
                "tests/release-controller.test.cjs",
            ],
            10,
        )

    def test_writing_catalog_contracts(self):
        self.run_node_contracts(
            [
                "tests/content-rendering.test.cjs",
                "tests/content.test.cjs",
                "tests/archive.test.cjs",
                "tests/local-catalog-relationships.test.cjs",
            ],
            30,
        )

    def test_content_release_contracts(self):
        self.run_node_contracts(
            [
                "tests/content-release.test.cjs",
                "tests/article-candidate-source.test.cjs",
                "tests/site-articles.test.cjs",
            ],
            20,
        )

    def test_content_check_selection(self):
        self.run_node_contracts(
            [
                "tests/content-baseline.test.cjs",
                "tests/content-fixture.test.cjs",
                "tests/test-profile-selection.test.cjs",
            ],
            10,
        )


if __name__ == "__main__":
    unittest.main()
