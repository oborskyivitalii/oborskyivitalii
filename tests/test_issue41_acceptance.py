"""Issue 41 implementation evidence; selected only by its owning policy.

The explicit 2026-10-07 implementation phase supersedes the preparation-only
byte assertion. Its original evidence remains pinned at d7ce5d3. Source reading,
editorial/independent review, browser observations and merge are separate gates.
"""
import copy
import hashlib
import json
import re
import subprocess
import unittest
from datetime import date
from html import unescape
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = 'c4539ad18f4f35169eda792a9a40677a7ea9abac'
# The maintainer's joint-staging decision pins the formula companion from #36.
# Catalog/edition baselines stay at BASE; only the protected runtime comparison
# follows this immutable companion. Any additional runtime/workflow edit fails.
RUNTIME_BASE = '73020e86b02da64d5e7256cbaffc641a0cc5d649'
INVENTORY = 'review/issue-41/source-inventory.json'
INPUT_SHA256 = '2483f7f9d70e38ffcaf3c9eb4f2bdc8f75ce6dda0d87d37ae40815f2fa2e3968'
UNCHANGED = ['.github/workflows', 'site/scenes', 'site/engine/archive.js', 'site/engine/navigation.js',
             'site/engine/theme.js', 'site/engine/renderer.cjs', 'site/engine/lifecycle.cjs',
             'site/engine/math.cjs', 'site/engine/projection.cjs']
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


def base_json(path):
    return json.loads(subprocess.check_output(['git', 'show', f'{BASE}:{path}'], cwd=ROOT))


def validate_admissions(data, catalog, baseline):
    old = baseline['records']
    require(set(catalog['records']) == set(old) | {'publication-28', 'publication-29'}, 'wrong admitted records')
    require(catalog['featured'] == baseline['featured'], 'changed featured identity')
    require([row for row in catalog['structuredOrder'] if row['record'] in old] == baseline['structuredOrder'],
            'changed original relative order')
    for key, record in old.items():
        require(catalog['records'][key]['edition'] == record['edition'], 'changed primary edition')
    old_rendition = old['publication-05']['rendition']
    migrated = catalog['records']['publication-05']['editions'][0]
    require(all(migrated[key] == old_rendition[key] for key in ['url', 'datePublished', 'inLanguage']), 'changed existing alternate')
    implementation = data['implementation']
    require(implementation['new_records'] == ['publication-28', 'publication-29'], 'wrong new admissions')
    actual_urls = []
    for source in data['linkedin']:
        treatment = implementation['admissions'][source['id']]
        record = catalog['records'][treatment['record']]
        url = source['submitted_url'].rstrip('/')
        if source['access'] == 'unavailable':
            require(treatment['treatment'] == 'deferred-unavailable' and
                    url not in [e['url'].rstrip('/') for e in record['editions']], 'unread edition admitted')
            continue
        if treatment['treatment'].startswith('admitted-new-') or treatment['treatment'] == 'preserved-primary':
            edition = record['edition']
        else:
            matches = [e for e in record['editions'] if e['url'].rstrip('/') == url]
            require(len(matches) == 1, 'missing or duplicate alternate')
            edition = matches[0]
            require(edition['relationship'] == 'same-topic-platform-edition' and
                    edition['bodyEquivalenceVerified'] is False, 'invented body equivalence')
        require(edition['url'].rstrip('/') == url and edition['name'] == source['observed_title'] and
                edition['inLanguage'] == source['observed_language'] and
                edition['datePublished'] == source['observed_date_published'] and
                edition['author']['name'] == source['observed_author'], 'borrowed platform identity')
        actual_urls.append(url)
    require(len(actual_urls) == len(set(actual_urls)) == 20, 'wrong readable admission count')
    all_editions = [e for record in catalog['records'].values()
                    for e in [record['edition'], *record['editions']]]
    require(len(all_editions) == 46 and len({e['url'].rstrip('/') for e in all_editions}) == 46,
            'duplicate or unaccounted edition')


def section(html, identity):
    return re.search(r'<section[^>]*\bid="' + identity + r'"[\s\S]*?</section>', html)[0]


def schema(html):
    return json.loads(re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>', html)[1])


class Issue41ImplementationTests(unittest.TestCase):
    def setUp(self):
        self.inventory = json.loads((ROOT / INVENTORY).read_text())
        self.catalog = json.loads((ROOT / 'site/content/catalog.json').read_text())
        self.pages = {name: (ROOT / f'docs/{name}.html').read_text()
                      for name in ['index', 'research', 'writing', 'talks', 'credits']}

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

    def test_admitted_editions_preserve_primary_identity_and_deferred_inputs(self):
        validate_admissions(self.inventory, self.catalog, base_json('site/content/catalog.json'))

    def test_primary_mutation_duplicate_missing_and_unread_editions_fail(self):
        baseline = base_json('site/content/catalog.json')
        mutations = [
            lambda c: c['records']['publication-01']['edition'].update(datePublished='2026-10-07'),
            lambda c: c['records'].pop('publication-03'),
            lambda c: c['featured'].reverse(),
            lambda c: c['records']['publication-05']['editions'][0].update(datePublished='2026-08-28'),
            lambda c: c['records']['publication-02']['editions'].append(copy.deepcopy(c['records']['publication-02']['editions'][0])),
            lambda c: c['records']['publication-02']['editions'][0].update(bodyEquivalenceVerified=True),
            lambda c: c['records']['publication-02']['editions'][0].update(datePublished='2026-06-12'),
            lambda c: c['records']['publication-18']['editions'].append({'url': self.inventory['linkedin'][14]['submitted_url']}),
        ]
        for index, mutate in enumerate(mutations):
            data = copy.deepcopy(self.catalog)
            mutate(data)
            with self.subTest(mutation=index), self.assertRaises((ValueError, KeyError)):
                validate_admissions(self.inventory, data, baseline)

    def test_advisor_grouping_preserves_people_sources_and_compact_home(self):
        for page, count in [('index', 3), ('research', 8)]:
            current = section(self.pages[page], 'acknowledgements')
            old = subprocess.check_output(['git', 'show', f'{BASE}:site/content/pages/{page}/acknowledgements.html'], cwd=ROOT).decode()
            articles = re.findall(r'<article>[\s\S]*?</article>', current)
            self.assertEqual(len(articles), count)
            profiles = re.findall(r'<h3><a href="([^"]+)"', current)
            self.assertEqual(len(set(profiles)), count)
            for original in re.findall(r'<article>[\s\S]*?</article>', old):
                profile = re.search(r'<h3><a href="([^"]+)"', original)[1]
                replacement = next(a for a in articles if f'href="{profile}"' in a)
                self.assertEqual(re.findall(r'href="([^"]+)"', replacement), re.findall(r'href="([^"]+)"', original))
        research = section(self.pages['research'], 'acknowledgements')
        advisors, responses = research.split('<h3 class="context-heading">Public responses</h3>')
        self.assertEqual(advisors.count('<article>'), 2)
        self.assertEqual(responses.count('<article>'), 6)
        self.assertIn('Strategic Advisor on Governance and Alignment', advisors)
        self.assertIn('Professor of Intelligent Systems at the University of Waterloo', advisors)
        self.assertIn('Academic Advisor', advisors)
        self.assertIn('CPMAI Lead Coach | PMI AI Standards Core Team', advisors)
        self.assertIn('institutional endorsement, certification or adoption', advisors)
        self.assertIn('href="research.html#ua-advisors"', self.pages['index'])
        self.assertNotIn('discussion-row', self.pages['index'])
        self.assertNotIn('trained', research)

    def test_discussion_rows_use_only_supplied_snapshot_metrics_and_relations(self):
        research = self.pages['research']
        rows = re.findall(r'<li class="discussion-row">[\s\S]*?</li>', research)
        self.assertEqual(len(rows), 3)
        mapping = self.inventory['implementation']['discussions']
        for source in self.inventory['reddit_snapshots']:
            record = self.catalog['discussions'][mapping[source['id']]]
            self.assertEqual(record['url'], source['canonical_url'])
            self.assertIn('/comments/' + source['post_id'] + '/', record['url'])
            self.assertEqual(record['snapshot']['attachmentSHA256'], source['attachment']['sha256'])
            self.assertIsNone(record['snapshot']['capturedAt'])
            row = next(r for r in rows if f'href="{source["canonical_url"]}"' in r)
            self.assertIn('≈' + source['metrics']['views']['display'] + ' post views', row)
            self.assertIn(str(source['metrics']['comments']['value']) + ' comments', row)
            self.assertIn(unescape(record['summary']), unescape(row))
            for unsupported in ['vote score', 'upvotes', 'shares', 'reposts', 'unique readers', '95K', '126 comments']:
                self.assertNotIn(unsupported, row)
            writing = self.pages['writing']
            self.assertEqual(writing.count(source['canonical_url']), 1 if source['record'] else 0)
        self.assertIn('capture dates were not recorded', research)
        self.assertIn('comments include replies by the author and other participants', research)
        self.assertIn('Views are approximate, not unique readers', research)
        self.assertNotIn('post views', self.pages['writing'])
        self.assertIn('https://www.tocinstitute.org/theory-of-constraints.html', research)
        self.assertIn('<h3>Control Theory</h3>', research)

    def test_visible_archive_counts_and_schema_match_primary_catalog(self):
        writing = self.pages['writing']
        rows = re.findall(r'<li class="publication"[^>]*>[\s\S]*?</li>', writing)
        records = self.catalog['records']
        self.assertEqual(len(rows), len(records))
        main = schema(writing)['mainEntity']
        self.assertEqual(main['numberOfItems'], len(records))
        self.assertEqual([item['item'] for item in main['itemListElement']],
                         [records[row['record']]['edition'] for row in self.catalog['structuredOrder']])
        self.assertEqual([unescape(re.search(r'class="publication-title" href="([^"]+)"', row)[1]) for row in rows],
                         [item['item']['url'] for item in main['itemListElement']])
        for text in ['29 primary archive records', '46 platform editions', '22 EN / 7 UA']:
            self.assertTrue(text in writing, 'missing catalog label: ' + text)
        for html in self.pages.values():
            data = json.dumps(schema(html))
            self.assertNotRegex(data, r'reddit.com|Review|Rating|InteractionCounter|PMI|Waterloo')

    def test_seo_exact_amendment_and_unrelated_semantics_reconcile(self):
        output = subprocess.check_output(['node', 'tools/check_site_seo.cjs'], cwd=ROOT)
        result = json.loads(output)
        self.assertTrue(result['pass'])
        self.assertEqual(len(result['rows']), 5)
        amendment = json.loads((ROOT / 'review/issue-41/content-amendment.json').read_text())
        for change in amendment['changes']:
            page = self.pages[change['page']]
            if change['page'] == 'writing':
                description = ('<p class="sr-only" data-writing-formula-description>'
                               'y = f(x) → y ∼ P(y|x): a shift from deterministic mapping '
                               'to conditional probabilistic modeling.</p>')
                self.assertEqual(page.count(description), 1)
                page = page.replace(description, '')
            self.assertIn(change['after'], page)
            for version in ['before', 'after']:
                self.assertEqual(hashlib.sha256(change[version].encode()).hexdigest(), change[version + 'SHA256'])

    def test_runtime_and_hosting_mechanics_remain_unchanged(self):
        entries = subprocess.check_output(['git', 'ls-tree', '-r', '-z', RUNTIME_BASE, '--', *UNCHANGED], cwd=ROOT)
        files = [r.split(b'\t', 1)[1].decode() for r in entries.split(b'\0') if r]
        self.assertGreater(len(files), 10)
        actual = set()
        for prefix in UNCHANGED:
            target = ROOT / prefix
            if target.is_dir():
                actual.update(str(p.relative_to(ROOT)) for p in target.rglob('*') if p.is_file())
            else:
                actual.add(prefix)
        self.assertEqual(set(files), actual)
        for path in files:
            current = (ROOT / path).read_bytes()
            if path == 'site/engine/archive.js':
                current = current.replace(b'all records and their linked platform editions shown for printing.',
                                          b'all records and the additional LinkedIn rendition shown for printing.')
            self.assertEqual(current, subprocess.check_output(['git', 'show', f'{RUNTIME_BASE}:{path}'], cwd=ROOT), path)


if __name__ == '__main__':
    unittest.main()
