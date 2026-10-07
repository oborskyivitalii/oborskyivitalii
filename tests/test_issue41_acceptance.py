"""Issue 41 preparation evidence only; selected by its owning policy."""
import copy
import hashlib
import json
import subprocess
import tempfile
import unittest
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = 'c4539ad18f4f35169eda792a9a40677a7ea9abac'
INVENTORY = 'review/issue-41/source-inventory.json'
INPUT_SHA256 = '2483f7f9d70e38ffcaf3c9eb4f2bdc8f75ce6dda0d87d37ae40815f2fa2e3968'
PROTECTED = ['site', 'docs', 'tools/site', '.github/workflows', 'guides', 'tools/check_site_seo.cjs']


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate_inventory(data, catalog):
    require(data['issue'] == 41 and data['site_base'] == BASE, 'wrong source/issue')
    rows = data['linkedin']
    by_id = {row['id']: row for row in rows}
    require(len(rows) == len(by_id) == 22, 'missing/duplicate input')
    normalized = [row['submitted_url'].rstrip('/') for row in rows]
    require(len(set(normalized)) == 22, 'duplicate URL')
    payload = json.dumps({'submitted': [by_id[key]['submitted_url'] for key in data['submission_order']],
                          'reddit': [r['submitted_url'] for r in data['reddit']]},
                         sort_keys=True, separators=(',', ':')).encode()
    require(hashlib.sha256(payload).hexdigest() == INPUT_SHA256, 'changed original inputs')
    require({r['id'] for r in rows if r['access'] == 'unavailable'} == {'L15', 'L19'}, 'access accounting')
    require({r['id'] for r in rows if r['proposed_treatment'] == 'new-candidate'} == {'L07', 'L09'}, 'new candidates')
    require(by_id['L02']['proposed_treatment'] == 'already-rendition' and
            by_id['L04']['proposed_treatment'] == 'already-primary', 'existing LinkedIn identity')
    for row in rows:
        url = urlsplit(row['submitted_url'])
        require(url.scheme == 'https' and url.netloc == 'www.linkedin.com' and
                url.path.startswith('/pulse/') and not url.query and not url.fragment, 'invalid source URL')
        if row['record']:
            require(row['record'] in catalog['records'], 'unknown target')
            require(row['primary_url'] == catalog['records'][row['record']]['edition']['url'], 'changed primary identity')
        else:
            require(row['proposed_treatment'] == 'new-candidate' and row['primary_url'] is None, 'false target')
        require(row['exact_body_equivalence_verified'] is False, 'unobserved equivalence')
        if row['access'] == 'unavailable':
            require(row['proposed_treatment'] == 'defer-unavailable' and
                    all(row[key] is None for key in ['observed_title', 'observed_author',
                        'observed_date_published', 'observed_language']), 'unread source promoted')
        else:
            require(row['access'] == 'metadata-read' and row['observed_title'] and
                    row['observed_author'] == 'Vitalii Oborskyi' and row['observed_language'] == 'en', 'missing metadata')
            date.fromisoformat(row['observed_date_published'])
    for row in data['reddit']:
        require(row['canonical_url'] is None and row['access'] == 'unresolved-short-link' and
                row['proposed_treatment'] == 'defer', 'unresolved Reddit promoted')
    require(data['discovered_candidate']['matched_to_submitted_input'] is False, 'candidate conflation')


def blob_digest(content):
    return hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content, usedforsecurity=False).hexdigest()


def validate_bytes(root, expected):
    for path, digest in expected.items():
        target = root / path
        require(target.is_file() and not target.is_symlink(), 'missing protected file')
        require(blob_digest(target.read_bytes()) == digest, 'changed protected file')


class Issue41PreparationTests(unittest.TestCase):
    def setUp(self):
        self.inventory = json.loads((ROOT / INVENTORY).read_text())
        self.catalog = json.loads((ROOT / 'site/content/catalog.json').read_text())

    def test_exact_input_coverage_and_candidate_boundaries(self):
        validate_inventory(self.inventory, self.catalog)

    def test_missing_duplicate_wrong_target_and_unread_promotions_fail(self):
        mutations = [
            lambda d: d['linkedin'].pop(),
            lambda d: d['linkedin'].append(copy.deepcopy(d['linkedin'][0])),
            lambda d: d['submission_order'].pop(),
            lambda d: d['linkedin'][0].update(record='publication-02'),
            lambda d: d['linkedin'][14].update(observed_date_published='2025-06-03'),
            lambda d: d['linkedin'][0].update(exact_body_equivalence_verified=True),
            lambda d: d['reddit'][0].update(canonical_url=d['discovered_candidate']['url']),
            lambda d: d['discovered_candidate'].update(matched_to_submitted_input=True),
        ]
        for mutate in mutations:
            data = copy.deepcopy(self.inventory)
            mutate(data)
            with self.subTest(mutation=mutations.index(mutate)), self.assertRaises((ValueError, KeyError)):
                validate_inventory(data, self.catalog)

    def test_preparation_preserves_public_content_runtime_and_workflows(self):
        entries = subprocess.check_output(['git', 'ls-tree', '-r', '-z', BASE, '--', *PROTECTED], cwd=ROOT)
        expected = {r.split(b'\t', 1)[1].decode(): r.split(b' ')[2].split(b'\t')[0].decode()
                    for r in entries.split(b'\0') if r}
        self.assertGreater(len(expected), 100)
        actual = set()
        for prefix in PROTECTED:
            target = ROOT / prefix
            actual.update(str(p.relative_to(ROOT)) for p in target.rglob('*') if p.is_file()) if target.is_dir() else actual.add(prefix)
        self.assertEqual(actual, set(expected), 'added or removed protected paths')
        validate_bytes(ROOT, expected)

    def test_protected_content_mutation_and_deletion_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / 'index.html'
            original = b'<main>Original edition</main>'
            target.write_bytes(original)
            expected = {'index.html': blob_digest(original)}
            validate_bytes(root, expected)
            target.write_bytes(b'<main>Invented endorsement</main>')
            with self.assertRaisesRegex(ValueError, 'changed protected'):
                validate_bytes(root, expected)
            target.unlink()
            with self.assertRaisesRegex(ValueError, 'missing protected'):
                validate_bytes(root, expected)


if __name__ == '__main__':
    unittest.main()
