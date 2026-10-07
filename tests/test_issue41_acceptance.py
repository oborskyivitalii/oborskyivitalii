"""Issue 41 preparation evidence only; selected by its owning policy."""
import copy
import hashlib
import json
import re
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
SNAPSHOTS = {
    'S1': ('1u7rwok', 'softwarearchitecture', None,
           'd27778e3a566f05f8a3200c8a1bd61dacb2207f0688753a0a2648ecf666c2c92',
           '287e11459342ca190e11e99eee91c088f34af0a0ff6ccf51bc610b5c69507c6a'),
    'S2': ('1u5tjy8', 'softwarearchitecture', 'publication-07',
           '796bf27b48e93319df4e089808e757f830fe7c9e043fd4edb402e6639d78529e',
           'c3ebcc52802a5c25dfcb422ceab69b74a322aca33b855fc98b72d12d0f8a545a'),
    'S3': ('1pjxsb4', 'learndatascience', 'publication-09',
           '5c146f839d3f796b2e3109a1b8fe0065aa877dad41b1a9b882f0280896bf3d25',
           '69d602ff269897e5daadfee46324f6dda13fc6dcb780f7eea041717d8b93d02f'),
}


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
    require(data['discovered_candidate']['matched_to_submitted_input'] is False and
            data['discovered_candidate']['matched_to_supplied_snapshot'] == 'S3', 'candidate conflation')


def validate_reddit_metrics(data, catalog):
    rows = data['reddit_snapshots']
    require(len(rows) == 3 and {r['id'] for r in rows} == set(SNAPSHOTS), 'missing/duplicate snapshot')
    require(len({r['post_id'] for r in rows}) == 3, 'duplicate thread')
    for row in rows:
        post_id, subreddit, record, attachment_hash, excerpt_hash = SNAPSHOTS[row['id']]
        url = urlsplit(row['canonical_url'])
        require(url.scheme == 'https' and url.netloc == 'www.reddit.com' and
                url.path.startswith(f'/r/{subreddit}/comments/{post_id}/') and
                not url.query and not url.fragment and row['post_id'] == post_id and
                row['subreddit'] == subreddit, 'wrong thread identity')
        require(row['observed_title'] and row['observed_author_handle'] == 'Much-Expression4581' and
                row['identity_evidence'] and row['original_short_link_id'] is None, 'unobserved identity')
        require(row['record'] == record and (record is None or record in catalog['records']), 'wrong discussion relation')
        require(row['attachment']['sha256'] == attachment_hash, 'changed input snapshot')
        excerpt = row['raw_post_ui']['text']
        require(hashlib.sha256(excerpt.encode()).hexdigest() == excerpt_hash, 'changed counter excerpt')
        match = re.fullmatch(r'Upvote\s+(\d+)\s+Downvote\s+(\d+)\s+Go to comments\s+'
                             r'(?:(\d+)\s+)?Repost\s+Share\s+Promote Post\s+(\d+K) views\s+See More Insights', excerpt)
        require(match is not None, 'invalid post counter excerpt')
        score, comments, reposts, views = match.groups()
        metrics = row['metrics']
        require(metrics['views'] == {'display': views, 'approximate_value': int(views[:-1]) * 1000,
                                    'unit': 'post_views', 'rounded': True}, 'inflated or mislabelled views')
        require(metrics['comments'] == {'display': comments, 'value': int(comments),
                                       'unit': 'comments_including_replies'}, 'inflated or mislabelled comments')
        require(metrics['vote_control'] == {'display': score, 'value': int(score),
                                           'unit': 'displayed_vote_score'}, 'vote score misinterpreted')
        require(metrics['reposts'] == (int(reposts) if reposts else None) and
                metrics['shares'] is None, 'invented shares or zero')
        require(row['captured_at'] is None and row['published_at'] is None and
                row['received_at'] == row['reviewed_at'] == '2026-10-07', 'invented capture/publication date')
        require(row['metric_provenance'] == 'author-supplied-pasted-ui' and
                row['metrics_independently_verified'] is False, 'unobserved metric verification')
        require(row['recommended_public_metrics'] == ['views', 'comments'], 'unsupported public metric')
    historical = data['reddit_historical_metrics']
    require(len(historical) == 1, 'repeated historical report counted twice')
    old = historical[0]
    require(old['snapshot_id'] == 'S3' and old['occurrences'] == [55, 374] and
            old['observation_count'] == 1 and old['displayed_mentions'] == 2 and
            old['window'] == 'first-48-hours' and old['captured_at'] is None and
            old['include_in_aggregate'] is False and old['independently_verified'] is False and
            old['recommended_for_public_display'] is False, 'historical counts promoted')
    aggregate = data['reddit_aggregate']
    require(aggregate['snapshot_ids'] == ['S1', 'S2', 'S3'] and aggregate['distinct_threads'] == 3,
            'aggregate duplicate/unknown input')
    require(aggregate['approximate_post_views'] == sum(r['metrics']['views']['approximate_value'] for r in rows) and
            aggregate['displayed_comments'] == sum(r['metrics']['comments']['value'] for r in rows) and
            aggregate['display'] == '~95K', 'incorrect or falsely exact aggregate')
    require(all(aggregate[key] is None for key in ['unique_readers', 'unique_participants', 'common_capture_date']),
            'unobserved people or common date')


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

    def test_reddit_snapshot_metrics_and_provenance(self):
        validate_reddit_metrics(self.inventory, self.catalog)

    def test_reddit_metric_inflation_and_identity_errors_fail(self):
        mutations = [
            lambda d: d['reddit_snapshots'].pop(),
            lambda d: d['reddit_snapshots'][1].update(post_id='1u7rwok'),
            lambda d: d['reddit_snapshots'][0].update(original_short_link_id='R1'),
            lambda d: d['reddit_snapshots'][1].update(record='publication-09'),
            lambda d: d['reddit_snapshots'][0].update(captured_at='2026-10-07'),
            lambda d: d['reddit_snapshots'][0].update(metrics_independently_verified=True),
            lambda d: d['reddit_snapshots'][0]['metrics']['views'].update(approximate_value=54000),
            lambda d: d['reddit_snapshots'][0]['metrics']['views'].update(unit='unique_readers'),
            lambda d: d['reddit_snapshots'][1]['metrics']['comments'].update(value=56),
            lambda d: d['reddit_snapshots'][2]['metrics'].update(shares=4),
            lambda d: d['reddit_snapshots'][0]['metrics'].update(reposts=0),
            lambda d: d['reddit_historical_metrics'].append(copy.deepcopy(d['reddit_historical_metrics'][0])),
            lambda d: d['reddit_historical_metrics'][0].update(include_in_aggregate=True),
            lambda d: d['reddit_aggregate'].update(approximate_post_views=108000),
            lambda d: d['reddit_aggregate'].update(display='95K+'),
            lambda d: d['reddit_aggregate'].update(unique_readers=95000),
            lambda d: d['reddit_aggregate'].update(displayed_comments=127),
            lambda d: d['reddit_snapshots'][0]['raw_post_ui'].update(text='54K Weekly visitors'),
        ]
        for index, mutate in enumerate(mutations):
            data = copy.deepcopy(self.inventory)
            mutate(data)
            with self.subTest(mutation=index), self.assertRaises((ValueError, KeyError)):
                validate_reddit_metrics(data, self.catalog)

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
