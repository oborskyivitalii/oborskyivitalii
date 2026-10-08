import importlib.util
import unittest
from pathlib import Path

file = (
    Path(__file__).resolve().parents[1]
    / 'review/site-scroll-sync-20261004/check-offline-security.py'
)
spec = importlib.util.spec_from_file_location('offline_export_security', file)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class OfflineExportTrustTests(unittest.TestCase):
    def test_generated_metadata_is_data_and_executable_scripts_are_extracted(self):
        parser = module.ExportParser()
        parser.feed(
            '<script type="application/ld+json">{"name":"Author"}</script>'
            '<script>const valid = 1 < 2;</script>'
        )
        self.assertEqual(parser.runtime, ['const valid = 1 < 2;'])
        self.assertEqual(parser.violations, [])

    def test_encoded_executable_urls_and_unexpected_active_content_are_rejected(self):
        for html in [
            '<a href="j&#x61;vascript:alert(1)">x</a>',
            '<a href="java\nscript:alert(1)">x</a>',
            '<img src="x" onerror="alert(1)">',
            '<script src="https://example.org/x.js"></script>',
            '<base href="https://example.org/">',
            '<iframe src="https://example.org/"></iframe>',
        ]:
            with self.subTest(html=html):
                parser = module.ExportParser()
                parser.feed(html)
                self.assertTrue(parser.violations)

    def test_citations_and_embedded_images_do_not_expand_executable_trust(self):
        parser = module.ExportParser()
        parser.feed(
            '<a href="https://example.org/paper">Citation</a>'
            '<img src="data:image/png;base64,AA==">'
            '<style>body { color: #123; }</style>'
        )
        self.assertEqual(parser.violations, [])
        self.assertEqual(parser.runtime, [])
        self.assertIn('body { color: #123; }', parser.styles)


if __name__ == '__main__':
    unittest.main()
