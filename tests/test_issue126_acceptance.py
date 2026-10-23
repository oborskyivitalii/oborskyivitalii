"""DevCon announcement policy; hosted, independent and release gates stay separate."""
import unittest

from test_issue48_acceptance import node_checks


class Issue126AcceptanceTests(unittest.TestCase):
    def test_announcement_facts_and_preservation(self):
        node_checks(
            ["tests/content.test.cjs", "tests/executive.test.cjs"],
            [
                "DevCon announcement preserves previous events and rejects changed public facts",
                "PMDay upcoming and Autumn naming preserve confirmed facts and existing presentation",
                "Talks curates distinct events with source-supported dates, language and resources",
                "Talks reconciliation rejects missing events, substituted sources and invented dates or resources",
                "executive hierarchy preserves the frozen SEO, editions, sources and all unrelated copy",
            ],
        )
