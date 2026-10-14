"""Issue 41 implementation evidence; selected only by its owning policy.

The explicit 2026-10-07 implementation phase supersedes the preparation-only
byte assertion. Its original evidence remains pinned at d7ce5d3. The approved
2026-10-09 positioning phase reverses its exact new content delta before those
historical assertions and preserves the current protected-main runtime bytes.
The dated 2026-10-10 decisions admit only the recorded acknowledgements and
scroll-camera successor. The later topic-first editorial instruction supersedes
the historical hidden-card decision without claiming new personal approval.
Source reading, editorial/independent review, browser observations and merge
are separate gates; structural copy assertions do not prove factual truth.
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
# The 9 October positioning amendment starts at protected main after accepted
# #36/#48/#54/#58/#61/#65 work. Their old runtime evidence stays in Git history;
# this content phase cannot silently edit that current engine or its routes.
RUNTIME_BASE = '338e3ff341dc35b64cba7854289e1385cbaf1562'
POSITIONING = 'review/issue-41/2026-10-09-positioning-amendment.json'
SITECASE = 'review/issue-41/2026-10-09-sitecase-amendment.json'
SITECASE_BASE = 'da36ccf03e1d749a540aa6bb39fe7b4083f1ef66'
ARKADIY = 'review/issue-41/2026-10-10-arkadiy-amendment.json'
ARKADIY_BASE = '93a818dbc3239b97b47b7d56edb83f5a7ebf65fc'
ARKADIY_TOPIC = 'review/issue-41/2026-10-10-arkadiy-topic-amendment.json'
ARKADIY_TOPIC_BASE = 'ca4ee44e50c70cb036ccca3fa6d97d7108ecd423'
ARKADIY_PROFILE = 'https://www.linkedin.com/in/arkadiydobkin/'
PUBLIC_RESPONSES_NOTE = (
    'These entries summarize public discussions of specific publications. They do not imply '
    'endorsement of this website, the research programme as a whole, or the author’s services. '
    'Organizational affiliations are provided for identification only.'
)
INVENTORY = 'review/issue-41/source-inventory.json'
INPUT_SHA256 = '2483f7f9d70e38ffcaf3c9eb4f2bdc8f75ce6dda0d87d37ae40815f2fa2e3968'
UNCHANGED = [
    '.github/workflows',
    'site/scenes',
    'site/engine',
    'site/effects',
    'site/assets',
    'site/routes.json',
    'site/analytics.json',
    'tools/site',
    'tools/build_site_previews.cjs',
    'tools/build_site_bundle.py',
]
SNAPSHOTS = {
    'S1': (
        '1u7rwok',
        'softwarearchitecture',
        None,
        'd27778e3a566f05f8a3200c8a1bd61dacb2207f0688753a0a2648ecf666c2c92',
        '287e11459342ca190e11e99eee91c088f34af0a0ff6ccf51bc610b5c69507c6a',
    ),
    'S2': (
        '1u5tjy8',
        'softwarearchitecture',
        'publication-07',
        '796bf27b48e93319df4e089808e757f830fe7c9e043fd4edb402e6639d78529e',
        'c3ebcc52802a5c25dfcb422ceab69b74a322aca33b855fc98b72d12d0f8a545a',
    ),
    'S3': (
        '1pjxsb4',
        'learndatascience',
        'publication-09',
        '5c146f839d3f796b2e3109a1b8fe0065aa877dad41b1a9b882f0280896bf3d25',
        '69d602ff269897e5daadfee46324f6dda13fc6dcb780f7eea041717d8b93d02f',
    ),
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
    payload = json.dumps(
        {
            'submitted': [by_id[key]['submitted_url'] for key in data['submission_order']],
            'reddit': [r['submitted_url'] for r in data['reddit']],
        },
        sort_keys=True,
        separators=(',', ':'),
    ).encode()
    require(hashlib.sha256(payload).hexdigest() == INPUT_SHA256, 'changed original inputs')
    require(
        {r['id'] for r in rows if r['access'] == 'unavailable'} == {'L15', 'L19'},
        'access accounting',
    )
    require(
        {r['id'] for r in rows if r['proposed_treatment'] == 'new-candidate'} == {'L07', 'L09'},
        'new candidates',
    )
    require(
        by_id['L02']['proposed_treatment'] == 'already-rendition'
        and by_id['L04']['proposed_treatment'] == 'already-primary',
        'existing LinkedIn identity',
    )
    for row in rows:
        url = urlsplit(row['submitted_url'])
        require(
            url.scheme == 'https'
            and url.netloc == 'www.linkedin.com'
            and url.path.startswith('/pulse/')
            and not url.query
            and not url.fragment,
            'invalid source URL',
        )
        if row['record']:
            require(row['record'] in catalog['records'], 'unknown target')
            require(
                row['primary_url'] == catalog['records'][row['record']]['edition']['url'],
                'changed primary identity',
            )
        else:
            require(
                row['proposed_treatment'] == 'new-candidate' and row['primary_url'] is None,
                'false target',
            )
        require(row['exact_body_equivalence_verified'] is False, 'unobserved equivalence')
        if row['access'] == 'unavailable':
            require(
                row['proposed_treatment'] == 'defer-unavailable'
                and all(
                    row[key] is None
                    for key in [
                        'observed_title',
                        'observed_author',
                        'observed_date_published',
                        'observed_language',
                    ]
                ),
                'unread source promoted',
            )
        else:
            require(
                row['access'] == 'metadata-read'
                and row['observed_title']
                and row['observed_author'] == 'Vitalii Oborskyi'
                and row['observed_language'] == 'en',
                'missing metadata',
            )
            date.fromisoformat(row['observed_date_published'])
    for row in data['reddit']:
        require(
            row['canonical_url'] is None
            and row['access'] == 'unresolved-short-link'
            and row['proposed_treatment'] == 'defer',
            'unresolved Reddit promoted',
        )
    require(
        data['discovered_candidate']['matched_to_submitted_input'] is False
        and data['discovered_candidate']['matched_to_supplied_snapshot'] == 'S3',
        'candidate conflation',
    )


def validate_reddit_metrics(data, catalog):
    rows = data['reddit_snapshots']
    require(
        len(rows) == 3 and {r['id'] for r in rows} == set(SNAPSHOTS), 'missing/duplicate snapshot'
    )
    require(len({r['post_id'] for r in rows}) == 3, 'duplicate thread')
    for row in rows:
        post_id, subreddit, record, attachment_hash, excerpt_hash = SNAPSHOTS[row['id']]
        url = urlsplit(row['canonical_url'])
        require(
            url.scheme == 'https'
            and url.netloc == 'www.reddit.com'
            and url.path.startswith(f'/r/{subreddit}/comments/{post_id}/')
            and not url.query
            and not url.fragment
            and row['post_id'] == post_id
            and row['subreddit'] == subreddit,
            'wrong thread identity',
        )
        require(
            row['observed_title']
            and row['observed_author_handle'] == 'Much-Expression4581'
            and row['identity_evidence']
            and row['original_short_link_id'] is None,
            'unobserved identity',
        )
        require(
            row['record'] == record and (record is None or record in catalog['records']),
            'wrong discussion relation',
        )
        require(row['attachment']['sha256'] == attachment_hash, 'changed input snapshot')
        excerpt = row['raw_post_ui']['text']
        require(
            hashlib.sha256(excerpt.encode()).hexdigest() == excerpt_hash, 'changed counter excerpt'
        )
        match = re.fullmatch(
            r'Upvote\s+(\d+)\s+Downvote\s+(\d+)\s+Go to comments\s+'
            r'(?:(\d+)\s+)?Repost\s+Share\s+Promote Post\s+(\d+K) views\s+See More Insights',
            excerpt,
        )
        require(match is not None, 'invalid post counter excerpt')
        score, comments, reposts, views = match.groups()
        metrics = row['metrics']
        require(
            metrics['views']
            == {
                'display': views,
                'approximate_value': int(views[:-1]) * 1000,
                'unit': 'post_views',
                'rounded': True,
            },
            'inflated or mislabelled views',
        )
        require(
            metrics['comments']
            == {'display': comments, 'value': int(comments), 'unit': 'comments_including_replies'},
            'inflated or mislabelled comments',
        )
        require(
            metrics['vote_control']
            == {'display': score, 'value': int(score), 'unit': 'displayed_vote_score'},
            'vote score misinterpreted',
        )
        require(
            metrics['reposts'] == (int(reposts) if reposts else None) and metrics['shares'] is None,
            'invented shares or zero',
        )
        require(
            row['captured_at'] is None
            and row['published_at'] is None
            and row['received_at'] == row['reviewed_at'] == '2026-10-07',
            'invented capture/publication date',
        )
        require(
            row['metric_provenance'] == 'author-supplied-pasted-ui'
            and row['metrics_independently_verified'] is False,
            'unobserved metric verification',
        )
        require(
            row['recommended_public_metrics'] == ['views', 'comments'], 'unsupported public metric'
        )
    historical = data['reddit_historical_metrics']
    require(len(historical) == 1, 'repeated historical report counted twice')
    old = historical[0]
    require(
        old['snapshot_id'] == 'S3'
        and old['occurrences'] == [55, 374]
        and old['observation_count'] == 1
        and old['displayed_mentions'] == 2
        and old['window'] == 'first-48-hours'
        and old['captured_at'] is None
        and old['include_in_aggregate'] is False
        and old['independently_verified'] is False
        and old['recommended_for_public_display'] is False,
        'historical counts promoted',
    )
    aggregate = data['reddit_aggregate']
    require(
        aggregate['snapshot_ids'] == ['S1', 'S2', 'S3'] and aggregate['distinct_threads'] == 3,
        'aggregate duplicate/unknown input',
    )
    require(
        aggregate['approximate_post_views']
        == sum(r['metrics']['views']['approximate_value'] for r in rows)
        and aggregate['displayed_comments'] == sum(r['metrics']['comments']['value'] for r in rows)
        and aggregate['display'] == '~95K',
        'incorrect or falsely exact aggregate',
    )
    require(
        all(
            aggregate[key] is None
            for key in ['unique_readers', 'unique_participants', 'common_capture_date']
        ),
        'unobserved people or common date',
    )


def base_json(path, source=BASE):
    return json.loads(subprocess.check_output(['git', 'show', f'{source}:{path}'], cwd=ROOT))


def validate_admissions(data, catalog, baseline):
    old = baseline['records']
    require(
        set(catalog['records']) == set(old) | {'publication-28', 'publication-29'},
        'wrong admitted records',
    )
    require(catalog['featured'] == baseline['featured'], 'changed featured identity')
    require(
        [row for row in catalog['structuredOrder'] if row['record'] in old]
        == baseline['structuredOrder'],
        'changed original relative order',
    )
    for key, record in old.items():
        require(catalog['records'][key]['edition'] == record['edition'], 'changed primary edition')
    old_rendition = old['publication-05']['rendition']
    migrated = catalog['records']['publication-05']['editions'][0]
    require(
        all(migrated[key] == old_rendition[key] for key in ['url', 'datePublished', 'inLanguage']),
        'changed existing alternate',
    )
    implementation = data['implementation']
    require(
        implementation['new_records'] == ['publication-28', 'publication-29'],
        'wrong new admissions',
    )
    actual_urls = []
    for source in data['linkedin']:
        treatment = implementation['admissions'][source['id']]
        record = catalog['records'][treatment['record']]
        url = source['submitted_url'].rstrip('/')
        if source['access'] == 'unavailable':
            require(
                treatment['treatment'] == 'deferred-unavailable'
                and url not in [e['url'].rstrip('/') for e in record['editions']],
                'unread edition admitted',
            )
            continue
        if (
            treatment['treatment'].startswith('admitted-new-')
            or treatment['treatment'] == 'preserved-primary'
        ):
            edition = record['edition']
        else:
            matches = [e for e in record['editions'] if e['url'].rstrip('/') == url]
            require(len(matches) == 1, 'missing or duplicate alternate')
            edition = matches[0]
            require(
                edition['relationship'] == 'same-topic-platform-edition'
                and edition['bodyEquivalenceVerified'] is False,
                'invented body equivalence',
            )
        require(
            edition['url'].rstrip('/') == url
            and edition['name'] == source['observed_title']
            and edition['inLanguage'] == source['observed_language']
            and edition['datePublished'] == source['observed_date_published']
            and edition['author']['name'] == source['observed_author'],
            'borrowed platform identity',
        )
        actual_urls.append(url)
    require(len(actual_urls) == len(set(actual_urls)) == 20, 'wrong readable admission count')
    all_editions = [
        e
        for record in catalog['records'].values()
        for e in [record['edition'], *record['editions']]
    ]
    require(
        len(all_editions) == 46 and len({e['url'].rstrip('/') for e in all_editions}) == 46,
        'duplicate or unaccounted edition',
    )


def section(html, identity):
    return re.search(r'<section[^>]*\bid="' + identity + r'"[\s\S]*?</section>', html)[0]


def schema(html):
    return json.loads(
        re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>', html)[1]
    )


def node_checks(names):
    """Select fixed existing content cases; missing/failed/skipped is never pass."""
    node_suite_checks('tests/content.test.cjs', names)


def node_suite_checks(owner, names):
    """Run maintained behavioral cases without reviving a broad historical matrix."""
    pattern = '^(?:' + '|'.join(re.escape(name) for name in names) + ')$'
    result = subprocess.run(
        [
            'node',
            '--test',
            '--test-reporter=tap',
            '--test-name-pattern=' + pattern,
            owner,
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
        timeout=120,
    )
    require(result.returncode == 0, result.stdout + result.stderr)
    counts = {
        key: int(value)
        for key, value in re.findall(
            r'^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$', result.stdout, re.M
        )
    }
    require(counts.get('tests') == counts.get('pass') == len(names), str(counts))
    require(
        all(counts.get(key) == 0 for key in ['fail', 'skipped', 'cancelled', 'todo']), str(counts)
    )


def positioning_projection(record_path=POSITIONING, restore_sitecase=True, restore_arkadiy=True):
    """Normalize immutable/current fragments using the maintained HTML owner."""
    script = r"""
const fs = require('node:fs');
const cp = require('node:child_process');
const {normalizeHTML,restoreContentAmendment} = require('./tools/check_site_seo.cjs');
const {sourceForPreview} = require('./tools/build_site_previews.cjs');
const record = require('./'+process.argv[1]);
const sitecase = require('./review/issue-41/2026-10-09-sitecase-amendment.json');
const arkadiy = require('./review/issue-41/2026-10-10-arkadiy-amendment.json');
const arkadiyTopic = require('./review/issue-41/2026-10-10-arkadiy-topic-amendment.json');
const normalize = html => normalizeHTML(sourceForPreview(html));
const pages = {}, baseline = {};
for (const page of ['index','research','writing','talks','credits']) {
  pages[page] = normalize(fs.readFileSync('docs/'+page+'.html','utf8'));
  if(record.base !== arkadiyTopic.base) pages[page] = restoreContentAmendment(pages[page],page,arkadiyTopic);
  if(process.argv[3] === 'true') pages[page] = restoreContentAmendment(pages[page],page,arkadiy);
  if(process.argv[2] === 'true') pages[page] = restoreContentAmendment(pages[page],page,sitecase);
  baseline[page] = normalize(cp.execFileSync('git',['show',record.base+':docs/'+page+'.html'],{encoding:'utf8'}));
}
process.stdout.write(JSON.stringify({pages,baseline,changes:record.changes.map(change=>({...change,before:normalize(change.before),after:normalize(change.after)}))}));
"""
    return json.loads(
        subprocess.check_output(
            [
                "node",
                "-e",
                script,
                record_path,
                str(restore_sitecase).lower(),
                str(restore_arkadiy).lower(),
            ],
            cwd=ROOT,
        )
    )


def arkadiy_projection():
    """Render canonical sources and compare immutable original/previous compositions."""
    script = r"""
const fs = require('node:fs');
const cp = require('node:child_process');
const {normalizeHTML} = require('./tools/check_site_seo.cjs');
const {renderSlots,documentTemplate} = require('./tools/site/render-content.cjs');
const {stableTagEndings} = require('./tools/site/html.cjs');
const catalog = require('./site/content/catalog.json');
const states = {public:{},baseline:{},previous:{},generated:{}};
for (const page of ['index','research']) {
  {
    const file = 'site/content/pages/'+page+'/acknowledgements.json';
    const content = JSON.parse(fs.readFileSync(file,'utf8'));
    const template = documentTemplate(content,file);
    states.public[page] = normalizeHTML(stableTagEndings(
      renderSlots(fs.readFileSync(template,'utf8'),content,catalog,file)));
  }
  for (const [state,ref] of [['baseline',process.argv[1]],['previous',process.argv[2]]]) {
    const html = cp.execFileSync('git',['show',ref+':docs/'+page+'.html'],{encoding:'utf8'});
    states[state][page] = normalizeHTML(
      html.match(/<section[^>]*\bid="acknowledgements"[\s\S]*?<\/section>/)[0]);
  }
  states.generated[page] = normalizeHTML(fs.readFileSync('docs/'+page+'.html','utf8')
    .match(/<section[^>]*\bid="acknowledgements"[\s\S]*?<\/section>/)[0]);
}
process.stdout.write(JSON.stringify(states));
"""
    return json.loads(
        subprocess.check_output(['node', '-e', script, ARKADIY_BASE, ARKADIY_TOPIC_BASE], cwd=ROOT)
    )


def plain_text(html):
    inline_free = re.sub(r'</?(?:a|em|span|strong)\b[^>]*>', '', html)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', ' ', unescape(inline_free))).strip()


def validate_arkadiy_states(states):
    """Reject missing records, testimonial promotion and changed unrelated relationships."""

    def profile(card):
        profiles = re.findall(r'href="(https://www.linkedin.com/in/[^"]+)"', card)
        require(len(profiles) == 1, 'one source identity per card')
        return profiles[0]

    for page, count in [('index', 3), ('research', 8)]:
        previous = re.findall(r'<article>[\s\S]*?</article>', states['baseline'][page])
        expected_profiles = [profile(card) for card in previous]
        for state in ['public']:
            html = states[state][page]
            cards = re.findall(r'<article>[\s\S]*?</article>', html)
            profiles = [profile(card) for card in cards]
            require(
                len(cards) == count and profiles == expected_profiles,
                'changed card count/order/identity',
            )
            require(
                html.count(PUBLIC_RESPONSES_NOTE) == 1, 'one readable section-level explanation'
            )
            require(
                all(PUBLIC_RESPONSES_NOTE not in card for card in cards),
                'explanation is not per person',
            )
            for identity, card in zip(profiles, cards):
                old = next(row for row in previous if f'href="{identity}"' in row)
                require(
                    re.findall(r'href="([^"]+)"', card) == re.findall(r'href="([^"]+)"', old),
                    'changed exact public/provenance destination',
                )
                if identity != ARKADIY_PROFILE:
                    require(card == old, 'unrelated person card changed')
                else:
                    title = (
                        'Thinking Systems — public discussion'
                        if page == 'index'
                        else 'Thinking Systems: runtime control and differentiation'
                    )
                    require(f'<h3>{title}</h3>' in card, 'topic is the heading')
                    require(
                        f'<h3><a href="{ARKADIY_PROFILE}"' not in card,
                        'source author is an ordinary byline, not a testimonial heading',
                    )
                    require(
                        not re.search(
                            r'<(?:blockquote|q|img|svg)\b|\bstyle=|advisor-role|'
                            r'\b(?:endorsed|validated|backed by|partner|advisor|approved)\b',
                            card,
                            re.I,
                        ),
                        'no testimonial decoration, approval or role promotion',
                    )
            if page == 'research':
                advisors, responses = html.split(
                    '<h3 class="context-heading">Public responses</h3>'
                )
                require(advisors.count('<article>') == 2, 'UA advisor grouping changed')
                require(ARKADIY_PROFILE not in advisors, 'public response promoted to advisor')
                require(responses.count('<article>') == count - 2, 'response grouping changed')


class Issue41ImplementationTests(unittest.TestCase):
    def setUp(self):
        self.inventory = json.loads((ROOT / INVENTORY).read_text())
        self.catalog = json.loads((ROOT / 'site/content/catalog.json').read_text())
        self.pages = {
            name: re.sub(r'\s+', ' ', (ROOT / f'docs/{name}.html').read_text())
            for name in ['index', 'research', 'writing', 'talks', 'credits']
        }

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
            with (
                self.subTest(mutation=mutations.index(mutate)),
                self.assertRaises((ValueError, KeyError)),
            ):
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
            lambda d: d['reddit_historical_metrics'].append(
                copy.deepcopy(d['reddit_historical_metrics'][0])
            ),
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
            lambda c: c['records']['publication-05']['editions'][0].update(
                datePublished='2026-08-28'
            ),
            lambda c: c['records']['publication-02']['editions'].append(
                copy.deepcopy(c['records']['publication-02']['editions'][0])
            ),
            lambda c: c['records']['publication-02']['editions'][0].update(
                bodyEquivalenceVerified=True
            ),
            lambda c: c['records']['publication-02']['editions'][0].update(
                datePublished='2026-06-12'
            ),
            lambda c: c['records']['publication-18']['editions'].append(
                {'url': self.inventory['linkedin'][14]['submitted_url']}
            ),
        ]
        for index, mutate in enumerate(mutations):
            data = copy.deepcopy(self.catalog)
            mutate(data)
            with self.subTest(mutation=index), self.assertRaises((ValueError, KeyError)):
                validate_admissions(self.inventory, data, baseline)

    def test_advisor_grouping_preserves_people_sources_and_compact_home(self):
        # The later 10 October topic-first amendment restores bounded public records.
        # Every unrelated card, source destination and advisory relationship stays exact.
        validate_arkadiy_states(arkadiy_projection())
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
            for unsupported in [
                'vote score',
                'upvotes',
                'shares',
                'reposts',
                'unique readers',
                '95K',
                '126 comments',
            ]:
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
        self.assertEqual(
            [item['item'] for item in main['itemListElement']],
            [records[row['record']]['edition'] for row in self.catalog['structuredOrder']],
        )
        self.assertEqual(
            [
                unescape(re.search(r'class="publication-title" href="([^"]+)"', row)[1])
                for row in rows
            ],
            [item['item']['url'] for item in main['itemListElement']],
        )
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
        # The maintained verifier reverses positioning and all accepted later
        # amendments/presentation seams before the exact historical comparison.
        # Requiring an old raw after-fragment in today's page duplicates that
        # owner and would reject its explicitly approved successor amendments.
        for change in amendment['changes']:
            for version in ['before', 'after']:
                self.assertEqual(
                    hashlib.sha256(change[version].encode()).hexdigest(), change[version + 'SHA256']
                )

    def test_runtime_and_hosting_mechanics_remain_unchanged(self):
        amendment = json.loads((ROOT / ARKADIY).read_text())
        changes = amendment['runtimeChanges']
        self.assertEqual([row['path'] for row in changes], ['site/engine/lifecycle.cjs'])
        admitted = {row['path']: row for row in changes}
        entries = subprocess.check_output(
            ['git', 'ls-tree', '-r', '-z', RUNTIME_BASE, '--', *UNCHANGED], cwd=ROOT
        )
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
            expected = subprocess.check_output(['git', 'show', f'{RUNTIME_BASE}:{path}'], cwd=ROOT)
            if path in admitted:
                change = admitted[path]
                self.assertEqual(hashlib.sha256(expected).hexdigest(), change['beforeSHA256'])
                self.assertEqual(hashlib.sha256(current).hexdigest(), change['afterSHA256'])
                self.assertNotEqual(
                    current, expected, 'authorized scroll removal must be substantive'
                )
                continue
            if path == '.github/workflows/issue-acceptance.yml':
                # Raw-head CI initially failed with ENOENT for the existing
                # format-parity Python owner: only issue58 installed its tools.
                # Admit exactly this installation selector/name repair; the
                # pinned commands, other steps, triggers and all gates remain
                # in the whole-file byte comparison below.
                before = (
                    b'      - name: Install pinned tools for the selected refactoring policy\n'
                    b"        if: env.ACCEPTANCE_POLICY == '.github/acceptance/issue-58.json'\n"
                )
                after = (
                    b'      - name: Install pinned tools for selected acceptance policies\n'
                    b'        if: >-\n'
                    b"          env.ACCEPTANCE_POLICY == '.github/acceptance/issue-58.json' ||\n"
                    b"          env.ACCEPTANCE_POLICY == '.github/acceptance/issue-41.json'\n"
                )
                self.assertEqual(expected.count(before), 1, 'one immutable setup selector')
                expected = expected.replace(before, after)
            self.assertEqual(current, expected, path)

    def test_arkadiy_canonical_copy_preserves_topics_public_sources_and_formulation_provenance(
        self,
    ):
        states = arkadiy_projection()
        validate_arkadiy_states(states)
        expected = {
            'index': [
                'Thinking Systems — public discussion',
                'Arkadiy Dobkin · EPAM founder',
                'In his public response to Thinking Systems, Dobkin recommended reading the '
                'article and added two propositions: a broader market for model-mediated '
                'software and differentiation through domain-specific runtime control architectures.',
            ],
            'research': [
                'Thinking Systems: runtime control and differentiation',
                'Public response by Arkadiy Dobkin · EPAM founder',
                'In a public LinkedIn post about Thinking Systems, Dobkin recommended the '
                'article to readers building systems where model judgment has consequential '
                'effects. He emphasized runtime control and outlined two possibilities: '
                'model-mediated software could address problems previously impractical to '
                'automate, while domain- and client-specific control architectures could '
                'remain differentiating as models and generic infrastructure commoditize.',
                'Formulation provenance',
                'The published article separately credits an earlier exchange with Dobkin '
                'for helping shape the Thinking Systems formulation.',
            ],
        }
        for page in ['index', 'research']:
            card = next(
                row
                for row in re.findall(r'<article>[\s\S]*?</article>', states['public'][page])
                if ARKADIY_PROFILE in row
            )
            text = plain_text(card)
            for paragraph in expected[page]:
                self.assertIn(paragraph, text)
            self.assertIn('<em>Thinking Systems</em>', card)
            self.assertIn('Read the original post ↗', text)
            self.assertNotIn('Principal Founder & Executive Chairman', text)
            if page == 'research':
                self.assertIn('<h4>Formulation provenance</h4>', card)
                self.assertIn('Read the formulation provenance ↗', text)
                self.assertGreater(
                    card.index('<h4>Formulation provenance'), card.index('Read the original post')
                )
        for path in ['site/content/catalog.json'] + [
            f'site/content/pages/{page}/metadata.json'
            for page in ['index', 'research', 'writing', 'talks', 'credits']
        ]:
            self.assertEqual(
                (ROOT / path).read_bytes(),
                subprocess.check_output(['git', 'show', f'{ARKADIY_TOPIC_BASE}:{path}'], cwd=ROOT),
                path,
            )

    def test_arkadiy_canonical_records_publish_without_unconfirmed_approval_claims(self):
        states = arkadiy_projection()
        validate_arkadiy_states(states)
        self.assertEqual(states['generated'], states['public'])
        record = json.loads((ROOT / ARKADIY_TOPIC).read_text())
        self.assertEqual(
            record['publication'],
            {
                'canonicalEditorialRecords': True,
                'personalApprovalConfirmed': False,
                'organizationalEndorsement': False,
                'sourceRightsStatus': 'Public source verified; editorial inclusion instructed by owner; new personal approval of website unconfirmed.',
                'consentOrLegalClearanceClaimed': False,
                'rightsIssue': 7,
            },
        )
        for path in (ROOT / 'docs').rglob('*.html'):
            html = path.read_text()
            if ARKADIY_PROFILE in html:
                self.assertIn(path.name, ['index.html', 'research.html'])
                normalized = subprocess.check_output(
                    [
                        'node',
                        '-e',
                        "const fs=require('node:fs');"
                        "const {normalizeHTML}=require('./tools/check_site_seo.cjs');"
                        "process.stdout.write(normalizeHTML(fs.readFileSync(0,'utf8')));",
                    ],
                    input=html,
                    text=True,
                    cwd=ROOT,
                )
                generated = section(normalized, 'acknowledgements')
                expected = states['generated'][path.stem]
                if path.relative_to(ROOT / 'docs').parts[0] == 'snapshots':
                    # Immutable page snapshots retain the existing two-level link base.
                    for target in ['research.html#ua-advisors', 'research.html#acknowledgements']:
                        expected = expected.replace(f'href="{target}"', f'href="../../{target}"')
                self.assertEqual(generated, expected, str(path))
                self.assertEqual(html.count(ARKADIY_PROFILE), 1)
        for page in ['index', 'research']:
            structured = re.search(
                r'<script type="application/ld\+json">([\s\S]*?)</script>', self.pages[page]
            )[1]
            self.assertNotIn(
                ARKADIY_PROFILE, structured, 'public discussion is not a new endorsement schema'
            )
        historical = json.loads((ROOT / ARKADIY).read_text())
        previous = base_json('site/retained/manifest.json', ARKADIY_BASE)
        current = json.loads((ROOT / 'site/retained/manifest.json').read_text())
        for row in historical['withdrawnRetained']:
            path = 'site/retained/' + row['path']
            old = subprocess.check_output(['git', 'show', f'{ARKADIY_BASE}:{path}'], cwd=ROOT)
            self.assertEqual(hashlib.sha256(old).hexdigest(), row['beforeSHA256'])
            self.assertEqual(previous['files'].pop(row['path']), row['beforeSHA256'])
            self.assertFalse((ROOT / path).exists())
            self.assertFalse((ROOT / 'docs' / row['path']).exists())
        self.assertEqual(current, previous, 'unrelated retained records remain exact')
        for path, digest in current['files'].items():
            self.assertEqual(
                hashlib.sha256((ROOT / 'site/retained' / path).read_bytes()).hexdigest(), digest
            )

    def test_arkadiy_successor_binds_canonical_fragments_and_preserves_superseded_history(self):
        record = json.loads((ROOT / ARKADIY_TOPIC).read_text())
        self.assertEqual(
            (record['schema'], record['issue'], record['base'], record['supersedes']),
            (1, 41, ARKADIY_TOPIC_BASE, ARKADIY),
        )
        self.assertEqual(
            [(r['page'], r['id']) for r in record['changes']],
            [('index', 'arkadiy-topic-home'), ('research', 'arkadiy-topic-research')],
        )
        states = arkadiy_projection()
        validate_arkadiy_states(states)
        self.assertEqual(states['generated'], states['public'])
        projection = positioning_projection(ARKADIY_TOPIC, False, False)
        for change in record['changes']:
            self.assertTrue(change['intent'])
            fragment = next(r for r in projection['changes'] if r['page'] == change['page'])
            for version, state in [('before', 'previous'), ('after', 'public')]:
                self.assertEqual(
                    hashlib.sha256(change[version].encode()).hexdigest(), change[version + 'SHA256']
                )
                self.assertEqual(fragment[version], states[state][change['page']])
            self.assertEqual(projection['baseline'][change['page']].count(fragment['before']), 1)
            self.assertEqual(projection['pages'][change['page']].count(fragment['after']), 1)
            self.assertNotEqual(change['before'], change['after'])
        expected = [
            f'review/issue-41/arkadiy-review/{page}/acknowledgements.{ext}'
            for page in ['index', 'research']
            for ext in ['json', 'html']
        ]
        self.assertEqual(record['inactiveReviewSources'], expected)
        for path in [ARKADIY] + expected:
            self.assertEqual(
                (ROOT / path).read_bytes(),
                subprocess.check_output(['git', 'show', f'{ARKADIY_TOPIC_BASE}:{path}'], cwd=ROOT),
                'superseded evidence remains immutable: ' + path,
            )
        historical = json.loads((ROOT / ARKADIY).read_text())
        for change in historical['changes']:
            for version in ['before', 'after', 'reviewAfter']:
                self.assertEqual(
                    hashlib.sha256(change[version].encode()).hexdigest(), change[version + 'SHA256']
                )
        projection = positioning_projection(ARKADIY, False, False)
        fragment = next(r for r in projection['changes'] if r['page'] == 'credits')
        self.assertEqual(projection['baseline']['credits'].count(fragment['before']), 1)
        self.assertEqual(projection['pages']['credits'].count(fragment['after']), 1)
        self.assertEqual(
            (ROOT / 'site/content/pages/credits/main.json').read_bytes(),
            subprocess.check_output(
                ['git', 'show', f'{ARKADIY_TOPIC_BASE}:site/content/pages/credits/main.json'],
                cwd=ROOT,
            ),
            'Credits correction unchanged',
        )

    def test_arkadiy_missing_topic_records_approval_promotion_wrong_sources_and_other_edits_fail(
        self,
    ):
        original = arkadiy_projection()
        mutations = [
            lambda d: d['public'].update(index=d['previous']['index']),
            lambda d: d['public'].update(
                research=d['public']['research'].replace(PUBLIC_RESPONSES_NOTE, '')
            ),
            lambda d: d['public'].update(
                research=d['public']['research'].replace(
                    'Public responses</h3>', 'Public responses renamed</h3>'
                )
            ),
            lambda d: d['public'].update(
                index=d['public']['index'].replace(
                    'Thinking Systems — public discussion', 'Arkadiy Dobkin'
                )
            ),
            lambda d: d['public'].update(
                index=d['public']['index'].replace('activity-7500661925790240768--I1H', 'feed/')
            ),
            lambda d: d['public'].update(
                index=d['public']['index'].replace('Dobkin recommended', 'Dobkin approved')
            ),
            lambda d: d['public'].update(
                index=d['public']['index'].replace('EPAM founder', 'EPAM advisor')
            ),
            lambda d: d['public'].update(
                index=d['public']['index'].replace('Co-author of Team Topologies', 'Validated UA')
            ),
        ]
        for index, mutate in enumerate(mutations):
            states = copy.deepcopy(original)
            mutate(states)
            with self.subTest(mutation=index), self.assertRaises((ValueError, KeyError)):
                validate_arkadiy_states(states)

    def test_scroll_camera_stays_fixed_on_every_route_and_after_writing_reflow(self):
        node_suite_checks(
            'tests/space.test.cjs',
            [
                'native scroll keeps each route camera steady while bounded ambient motion continues',
                'Writing filters and reflow preserve the steady route view',
            ],
        )

    def test_route_flight_content_fade_and_passive_motion_remain_bounded(self):
        node_suite_checks(
            'tests/space.test.cjs',
            [
                'route flights use one canvas and global space; retarget, Off and hidden preserve the painted pose',
                'history and fragment landings fly to the steady route view independently of native offset',
            ],
        )
        node_suite_checks(
            'tests/navigation.test.cjs',
            [
                'animated Color yields the completed camera paint before native mount, with no second animation clock',
            ],
        )

    def test_steady_camera_preserves_motion_controls_failure_and_scroll_reversal(self):
        node_suite_checks(
            'tests/space.test.cjs',
            [
                'Off freezes the exact displayed camera and phase through theme, resize, layout, hidden and print',
                'reduced overrides saved On; Off persists; hidden and print pause without elapsed-time catch-up',
                'delayed CSS cannot partially activate; post-activation draw failure stops once',
                'rapid scroll reversal cannot move a steady camera on any route',
            ],
        )

    def test_positioning_amendment_binds_exact_current_and_immutable_fragments(self):
        amendment = json.loads((ROOT / POSITIONING).read_text())
        self.assertEqual(
            (amendment['schema'], amendment['issue'], amendment['base']), (1, 41, RUNTIME_BASE)
        )
        expected = [
            ('index', 'positioning-hero'),
            ('index', 'positioning-about'),
            ('index', 'positioning-help'),
            ('talks', 'positioning-talks'),
            ('writing', 'positioning-section-1'),
            ('credits', 'positioning-main'),
        ]
        self.assertEqual([(row['page'], row['id']) for row in amendment['changes']], expected)
        projection = positioning_projection()
        for original, change in zip(amendment['changes'], projection['changes']):
            for version in ['before', 'after']:
                self.assertEqual(
                    hashlib.sha256(original[version].encode()).hexdigest(),
                    original[version + 'SHA256'],
                )
            self.assertNotEqual(change['before'], change['after'])
            self.assertEqual(
                projection['baseline'][change['page']].count(change['before']),
                1,
                'before fragment must come from immutable current-main source',
            )
            self.assertEqual(
                projection['pages'][change['page']].count(change['after']),
                1,
                'one exact new fragment must appear in generated public content',
            )
        self.assertTrue((ROOT / 'review/issue-41/2026-10-09-positioning.md').is_file())
        self.assertIn(
            'Practical positioning — 2026-10-09', (ROOT / 'guides/SITE-SOURCE-AUDIT.md').read_text()
        )

    def test_home_positioning_keeps_problem_author_research_order_and_bounded_outputs(self):
        home = unescape(positioning_projection()['pages']['index'])
        headline = 'AI tools everywhere.<br><span class="accent">Better delivery?</span><br>Harder to tell.'
        self.assertIn(headline, home)
        problem = home.index('I help software organizations investigate why AI adoption')
        author = home.index('More than 20 years in software engineering and technology delivery')
        research = home.index('That experience shapes my research into software delivery')
        self.assertLess(problem, author)
        self.assertLess(author, research)
        self.assertIn('including over a decade in leadership', home)
        self.assertIn('across a portfolio of around 25 projects and more than 120 engineers', home)
        help_section = section(home, 'help')
        for text in [
            'A prioritized diagnosis of delivery constraints and a plan for testing the next changes.',
            'A review of decision authority, operating limits and evidence gaps, with priorities for addressing them.',
            'Potential outputs, depending on the agreed scope.',
            'draft role and decision boundaries',
        ]:
            self.assertIn(text, help_section)
        for text in ['hypotheses to test in context', 'Much remains to develop and test']:
            self.assertIn(text, home)
        self.assertNotRegex(help_section, r'guarantee|proven methodology|guaranteed transformation')

    def test_site_case_amendment_binds_fragments_and_public_evidence_destinations(self):
        """Check exact admission and link structure, not claim truth or live PR status."""
        amendment = json.loads((ROOT / SITECASE).read_text())
        self.assertEqual(
            (amendment["schema"], amendment["issue"], amendment["base"]),
            (1, 41, SITECASE_BASE),
        )
        self.assertEqual(
            [(row["page"], row["id"]) for row in amendment["changes"]],
            [("index", "sitecase-about"), ("credits", "sitecase-main")],
        )
        projection = positioning_projection(SITECASE, False)
        for original, change in zip(amendment["changes"], projection["changes"]):
            for version in ["before", "after"]:
                self.assertEqual(
                    hashlib.sha256(original[version].encode()).hexdigest(),
                    original[version + "SHA256"],
                )
            self.assertNotEqual(change["before"], change["after"])
            self.assertEqual(projection["baseline"][change["page"]].count(change["before"]), 1)
            self.assertEqual(projection["pages"][change["page"]].count(change["after"]), 1)
        home = projection["pages"]["index"]
        credits = projection["pages"]["credits"]
        self.assertEqual(section(home, "about").count('href="credits.html#built-with-ai"'), 1)
        self.assertEqual(credits.count('id="built-with-ai"'), 1)
        case = credits.split('<h2 id="built-with-ai">', 1)[1].split("<h2 ", 1)[0]
        urls = re.findall(r'href="([^"]+)"', case)
        self.assertEqual(len(urls), len(set(urls)))
        self.assertEqual(len(urls), 7)
        blob_paths = []
        pull_paths = []
        for url in urls:
            source = urlsplit(unescape(url))
            self.assertEqual((source.scheme, source.netloc), ("https", "github.com"))
            prefix = "/oborskyivitalii/oborskyivitalii/"
            self.assertTrue(source.path.startswith(prefix))
            target = source.path.removeprefix(prefix)
            if target.startswith("blob/"):
                _, commit, path = target.split("/", 2)
                self.assertEqual(commit, RUNTIME_BASE, "code proofs use the immutable source")
                lines = subprocess.check_output(
                    ["git", "show", f"{commit}:{path}"], cwd=ROOT, text=True
                ).splitlines()
                bounds = re.fullmatch(r"L(\d+)-L(\d+)", source.fragment)
                self.assertIsNotNone(bounds, "bounded public source link")
                start, end = map(int, bounds.groups())
                self.assertTrue(1 <= start <= end <= len(lines))
                blob_paths.append(path)
            else:
                pull_paths.append(target)
        self.assertEqual(
            blob_paths,
            [
                "tools/site/build.cjs",
                "tools/quality/functional.cjs",
                "tools/issue_acceptance.py",
                "tools/quality/test-profiles.json",
                "tools/quality/staging-gate.cjs",
            ],
        )
        self.assertEqual(pull_paths, ["pull/66", "pull/63"])

    def test_talks_positioning_keeps_source_contact_and_known_language_contracts(self):
        projection = positioning_projection()
        talks = projection['pages']['talks']
        home = projection['pages']['index']
        cards = re.findall(r'<article class="publication"[^>]*>[\s\S]*?</article>', talks)
        prior = re.findall(
            r'<article class="publication"[^>]*>[\s\S]*?</article>', projection['baseline']['talks']
        )
        self.assertEqual(len(cards), 4)

        def event_contract(card):
            text = re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', ' ', unescape(card))).strip()
            return (
                re.findall(r'\bdata-language="([^"]+)"', card),
                re.findall(r'<time datetime="([^"]+)"', card),
                re.findall(r'href="([^"]+)"', card),
                text,
            )

        self.assertEqual(
            event_contract(cards[0]),
            event_contract(prior[0]),
            'PMDay event/date/language/text and resources stay exact',
        )
        self.assertIn('PMDay 2026 · Recording in Ukrainian', cards[0])
        self.assertNotRegex(
            talks, r'Language unconfirmed|not yet been confirmed|data-language="unconfirmed"'
        )
        for card in cards[1:]:
            self.assertNotRegex(card, r'data-language|language-badge')
        for old, current in zip(prior, cards):
            for url in re.findall(r'href="([^"]+)"', old):
                self.assertEqual(
                    current.count(f'href="{url}"'), 1, 'each original event link survives'
                )
        self.assertIn(
            'Invited speaker at Corning’s internal technical AI workshop.', unescape(cards[1])
        )
        self.assertIn('architecture, operating models and accountability', cards[1])
        self.assertIn('technology community', unescape(cards[1]))
        self.assertIn('href="talks.html#corning"', section(home, 'about'))
        self.assertIn('id="corning"', cards[1])
        self.assertIn('href="index.html#contact">Invite me to speak</a>', talks)
        self.assertIn(
            'For talks and workshops on AI-assisted delivery, agentic systems and operational responsibility.',
            talks,
        )
        self.assertLess(talks.index('Invite me to speak'), talks.index('<aside class="next-route'))
        self.assertIn('id="contact"', home)
        self.assertNotRegex(
            unescape(cards[1]), r'client|adopted UA|validated approach|institutional endorsement'
        )

    def test_writing_counters_follow_canonical_catalog_mutations(self):
        node_checks(
            [
                'Writing intro and archive counters derive from the same catalog under edition and language changes',
            ]
        )

    def test_changed_page_links_and_existing_contact_contracts(self):
        node_checks(
            [
                'page IDs, ARIA targets, local resources and fragments resolve without draft leakage',
                'Home provides the agreed reader path, precise public actions and a real contact alternative',
                'portrait is a real sized local asset and unverified talk languages are omitted',
                'Talks curates distinct events with source-supported dates, language and resources',
            ]
        )


if __name__ == '__main__':
    unittest.main()
