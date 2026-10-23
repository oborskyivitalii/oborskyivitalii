"""Mechanical ruleset and postmerge wiring checks; owner decisions remain external."""

import copy
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def ruleset(name):
    return json.loads((ROOT / '.github/rulesets' / (name + '.json')).read_text())


def baseline_contract(value):
    assert value['enforcement'] == 'active'
    assert value['target'] == 'branch'
    assert value['bypass_actors'] == []
    assert value['conditions'] == {'ref_name': {'exclude': [], 'include': ['~DEFAULT_BRANCH']}}
    rows = {row['type']: row for row in value['rules']}
    assert set(rows) == {'deletion', 'non_fast_forward', 'pull_request', 'required_status_checks'}
    checks = rows['required_status_checks']['parameters']
    assert checks['strict_required_status_checks_policy'] is True
    assert {
        (row['context'], row['integration_id']) for row in checks['required_status_checks']
    } == {
        ('checks', 15368),
        ('Local navigation and RI freshness', 15368),
        ('Owning issue deterministic acceptance mapping', 15368),
    }


class CIMaintenanceTests(unittest.TestCase):
    def test_current_layered_ruleset_contract(self):
        baseline = ruleset('source-admission')
        baseline_contract(baseline)
        old = ruleset('protect-main-before')
        self.assertEqual(
            [row for row in baseline['rules'] if row['type'] != 'required_status_checks'],
            [row for row in old['rules'] if row['type'] != 'required_status_checks'],
        )
        staging = ruleset('staging-admission')
        self.assertEqual(staging['conditions'], baseline['conditions'])
        self.assertEqual(staging['enforcement'], 'active')
        self.assertEqual(
            staging['bypass_actors'],
            [{'actor_id': 248754648, 'actor_type': 'User', 'bypass_mode': 'pull_request'}],
        )
        self.assertEqual(len(staging['rules']), 1)
        self.assertEqual(
            staging['rules'][0]['parameters']['required_status_checks'],
            [{'context': 'Staging admission', 'integration_id': 15368}],
        )
        self.assertTrue(staging['rules'][0]['parameters']['strict_required_status_checks_policy'])

    def test_baseline_faults_cannot_exempt_the_owner_or_omit_source_obligations(self):
        original = ruleset('source-admission')
        for fault in ['bypass', 'owning', 'strict', 'main']:
            value = copy.deepcopy(original)
            checks = next(row for row in value['rules'] if row['type'] == 'required_status_checks')
            if fault == 'bypass':
                value['bypass_actors'] = [{'actor_id': 248754648, 'actor_type': 'User'}]
            elif fault == 'owning':
                checks['parameters']['required_status_checks'].pop()
            elif fault == 'strict':
                checks['parameters']['strict_required_status_checks_policy'] = False
            else:
                value['conditions']['ref_name']['exclude'].append('refs/heads/main')
            with self.subTest(fault=fault), self.assertRaises(AssertionError):
                baseline_contract(value)

    def test_postmerge_uses_explicit_read_only_maintenance_and_normal_paths(self):
        workflow = (ROOT / '.github/workflows/site-staging-merge.yml').read_text()
        # Anchored executable statements/step guards, not comments containing method names.
        for line in [
            "              const approval=await maintenance.ownerDecision(github,context,pr);",
            "              if(!approval){core.setOutput('maintenance','false');return;}",
            "              const record=await maintenance.verify(github,context,pr,approval);",
            "        if: steps.path.outputs.maintenance == 'false'",
            "        if: steps.path.outputs.maintenance == 'true'",
        ]:
            self.assertRegex(workflow, re.compile('^' + re.escape(line) + '$', re.MULTILINE))
        self.assertNotRegex(workflow, r'(?:contents|actions|checks|issues|deployments): write')
        self.assertNotIn('CLOUDFLARE_API_TOKEN', workflow)


if __name__ == '__main__':
    unittest.main()
