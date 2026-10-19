"""Current PMDay source checks; human decisions and actual releases are separate."""

import unittest

from test_issue48_acceptance import node_checks


class Issue108AcceptanceTests(unittest.TestCase):
    def test_current_events_and_historical_preservation(self):
        node_checks(
            ["tests/content.test.cjs", "tests/executive.test.cjs"],
            [
                "PMDay upcoming and Autumn naming preserve confirmed facts and existing presentation",
                "Talks curates distinct events with source-supported dates, language and resources",
                "Talks reconciliation rejects missing events, substituted sources and invented dates or resources",
                "executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy",
            ],
        )


if __name__ == "__main__":
    unittest.main()
