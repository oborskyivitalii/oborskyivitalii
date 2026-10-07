"""Issue #39 preparation evidence only; live provider admission is separate."""
import copy
import importlib.util
import json
import re
import subprocess
import unittest
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = "ec9b8361b619f1042bce5a3ec224d3e0c9054b01"
PLAN = "guides/github-pages-domains.json"
SNAPSHOT = "review/issue-39/2026-10-07-provider-inventory.json"
RULE_HOSTS = {"vitaliioborskyi.com", "www.vitaliioborskyi.com"}


def read(path):
    return json.loads((ROOT / path).read_text())


def validate_plan(plan):
    """Admit this finite desired topology; no provider API calls are performed."""
    if (plan["schema"], plan["issue"], plan["phase"]) != (1, 39, "prepare-only"):
        raise ValueError("Preparation scope")
    if plan["canonical_origin"] != "https://vitaliioborskyi.ai" or plan["canonical_host"] != "vitaliioborskyi.ai":
        raise ValueError("Canonical origin")
    github = plan["github"]
    if github["repository"] != "oborskyivitalii/oborskyivitalii" or github["publishing_source"] != "GitHub Actions":
        raise ValueError("GitHub source")
    if github["custom_domain"] != plan["canonical_host"] or github["environment"] != "github-pages" or github["allowed_branch"] != "main":
        raise ValueError("GitHub production control")
    if github["ownership_txt_value"] is not None or github["pages_settings_verified"] or github["production_activated"]:
        raise ValueError("Unobserved ownership or activation")
    if github["ownership_txt_name"] != "_github-pages-challenge-oborskyivitalii.vitaliioborskyi.ai":
        raise ValueError("Ownership name")
    expected = {
        "vitaliioborskyi.ai": {
            ("A", "@", f"185.199.{octet}.153", False, 1) for octet in range(108, 112)
        } | {("CNAME", "www", "oborskyivitalii.github.io", False, 1)},
        "vitaliioborskyi.com": {("A", name, "192.0.2.1", True, 1) for name in ["@", "www"]},
    }
    if set(plan["dns"]) != set(expected):
        raise ValueError("DNS zones")
    for zone, records in plan["dns"].items():
        actual = [(r["type"], r["name"], r["content"], r["proxied"], r["ttl"]) for r in records]
        if len(actual) != len(expected[zone]) or set(actual) != expected[zone]:
            raise ValueError("Finite DNS topology")
    redirect = plan["com_redirect"]
    rule = redirect["rule"]
    if redirect["phase"] != "http_request_dynamic_redirect" or redirect["applied"]:
        raise ValueError("Redirect scope")
    if rule["expression"] != '(http.host eq "vitaliioborskyi.com" or http.host eq "www.vitaliioborskyi.com")':
        raise ValueError("Redirect hosts")
    value = rule["action_parameters"]["from_value"]
    if rule["action"] != "redirect" or not rule["enabled"] or value["status_code"] != 301:
        raise ValueError("Permanent redirect")
    if value["target_url"] != {"expression": 'concat("https://vitaliioborskyi.ai", http.request.uri.path)'} or value["preserve_query_string"] is not True:
        raise ValueError("Lossless redirect")
    if plan["activation_applied"] or plan["analytics_activation"]:
        raise ValueError("Activation claim")
    order = plan["activation_order"]
    required = [
        "prepare-repository", "github-generate-ownership-txt", "cloudflare-add-verification-txt",
        "github-verify-ownership", "implement-exact-artifact-pages-workflow",
        "admit-production-artifact-and-owner-release", "github-set-actions-source-and-custom-domain",
        "cloudflare-apply-ai-routing-dns", "github-wait-certificate-and-enforce-https",
        "publish-admitted-artifact-and-verify-ai", "cloudflare-check-com-certificate-and-apply-redirect",
        "verify-all-hosts-and-existing-staging",
    ]
    if order != required:
        raise ValueError("Ownership/admission/routing order")


def planned_redirect(plan, source):
    """Interpret only the finite planned CF fields for URL fixture expectations."""
    validate_plan(plan)
    url = urlsplit(source)
    if url.scheme not in {"http", "https"} or url.netloc not in RULE_HOSTS:
        raise ValueError("Outside finite redirect hosts")
    # A fragment is not sent to HTTP; tests do not invent server-side fragment handling.
    return 301, urlunsplit(("https", plan["canonical_host"], url.path or "/", url.query, ""))


class Issue39AcceptanceTests(unittest.TestCase):
    def test_provider_snapshot_records_observations_and_unknown_admin_state(self):
        data = read(SNAPSHOT)
        self.assertEqual((data["schema"], data["issue"], data["source_commit"]), (1, 39, BASE))
        self.assertEqual(data["repository"], "oborskyivitalii/oborskyivitalii")
        self.assertFalse(data["github"]["pages_administration"]["available_via_plugin"])
        self.assertEqual(data["github"]["pages_administration"]["live_pages_settings"], "unobserved")
        self.assertFalse(data["github"]["active_pages_deploy_workflow"])
        self.assertEqual({z["name"] for z in data["cloudflare"]["zones"]},
                         {"vitaliioborskyi.ai", "vitaliioborskyi.com"})
        for zone in data["cloudflare"]["zones"]:
            self.assertEqual(zone["status"], "active")
            self.assertEqual(zone["dns_records"], [])
            self.assertEqual(zone["redirect_entrypoint"], "absent")
            self.assertEqual((zone["page_rules_count"], zone["worker_routes_count"]), (0, 0))
            self.assertTrue(zone["universal_ssl_enabled"])
            self.assertEqual(zone["universal_certificate_status"], "active")
        self.assertTrue(data["mutations"])
        self.assertFalse(any(data["mutations"].values()))
        self.assertIn("no write attempted", data["cloudflare"]["capabilities"]["dns_edit"])

    def test_finite_dns_and_redirect_contract(self):
        validate_plan(read(PLAN))

    def test_bad_origin_proxy_hosts_query_and_order_are_rejected(self):
        original = read(PLAN)
        mutations = [
            lambda p: p.update(canonical_origin="http://vitaliioborskyi.ai"),
            lambda p: p.update(canonical_origin="https://vitaliioborskyi.ai/oborskyivitalii"),
            lambda p: p["dns"]["vitaliioborskyi.ai"][0].update(proxied=True),
            lambda p: p["dns"]["vitaliioborskyi.ai"][0].update(content="192.0.2.1"),
            lambda p: p["dns"]["vitaliioborskyi.com"][0].update(proxied=False),
            lambda p: p["dns"]["vitaliioborskyi.ai"][0].update(name="*"),
            lambda p: p["dns"]["vitaliioborskyi.ai"].append(copy.deepcopy(p["dns"]["vitaliioborskyi.ai"][0])),
            lambda p: p["com_redirect"]["rule"].update(expression='http.host contains "vitaliioborskyi"'),
            lambda p: p["com_redirect"]["rule"]["action_parameters"]["from_value"].update(preserve_query_string=False),
            lambda p: p["com_redirect"]["rule"]["action_parameters"]["from_value"].update(status_code=302),
            lambda p: p["github"].update(publishing_source="Deploy from a branch"),
            lambda p: p["github"].update(ownership_txt_value="invented-challenge"),
            lambda p: p.update(activation_applied=True),
            lambda p: p["activation_order"].reverse(),
        ]
        for index, mutate in enumerate(mutations):
            with self.subTest(mutation=index):
                changed = copy.deepcopy(original)
                mutate(changed)
                with self.assertRaises(ValueError):
                    validate_plan(changed)

    def test_planned_redirect_fixtures_preserve_path_and_query(self):
        plan = read(PLAN)
        for host in RULE_HOSTS:
            for scheme in ["http", "https"]:
                for suffix in ["/", "/writing.html?topic=systems&language=uk",
                               "/research.html", "/media/example%20file.svg?x=1&x=2",
                               "/writing.html?empty=&encoded=%2F%3F"]:
                    self.assertEqual(planned_redirect(plan, f"{scheme}://{host}{suffix}"),
                                     (301, f"https://vitaliioborskyi.ai{suffix}"))
        for source in ["https://vitaliioborskyi.ai/", "https://www.vitaliioborskyi.ai/",
                       "https://evilvitaliioborskyi.com/", "https://vitaliioborskyi.com.evil.test/",
                       "https://user@vitaliioborskyi.com/", "ftp://vitaliioborskyi.com/"]:
            with self.subTest(source=source), self.assertRaises(ValueError):
                planned_redirect(plan, source)

    def test_preparation_preserves_public_runtime_and_deploy_workflows(self):
        protected = ["site", "docs", "tools/site", "tools/staging", "tools/quality",
                     ".github/workflows", "tests/content.test.cjs", "tools/check_site_seo.cjs"]
        entries = subprocess.check_output(
            ["git", "ls-tree", "-r", BASE, "--", *protected], cwd=ROOT, text=True).splitlines()
        self.assertGreater(len(entries), 100)
        baseline = {}
        for entry in entries:
            metadata, name = entry.split("\t")
            mode, kind, blob = metadata.split()
            self.assertEqual((mode, kind), ("100644", "blob"))
            baseline[name] = blob
        current = {path.relative_to(ROOT).as_posix() for parent in protected
                   for path in ([ROOT / parent] if (ROOT / parent).is_file()
                                else (ROOT / parent).rglob("*")) if path.is_file()}
        self.assertEqual(current, set(baseline))
        import hashlib
        for name, blob in baseline.items():
            data = (ROOT / name).read_bytes()
            actual = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
            self.assertEqual(actual, blob, name)

    def test_operator_routes_and_policy_keep_external_gates_pending(self):
        path = ROOT / "tools/issue_acceptance.py"
        spec = importlib.util.spec_from_file_location("issue39_acceptance", path)
        module = importlib.util.module_from_spec(spec)
        exec(compile(path.read_bytes(), str(path), "exec"), module.__dict__)
        policy, _ = module.load_policy(ROOT / ".github/acceptance/issue-39.json")
        self.assertEqual(policy["issue"], 39)
        self.assertEqual([c["id"] for c in policy["criteria"]], [f"AC{i:02}" for i in range(1, 6)])
        self.assertEqual(policy["gates"]["LIVE-DOMAINS"]["kind"], "human")
        self.assertIn("LIVE-DOMAINS", policy["criteria"][-1]["gates"])
        guide = (ROOT / "guides/SITE-PRODUCTION.md").read_text()
        for url in ["https://github.com/settings/pages",
                    "https://github.com/oborskyivitalii/oborskyivitalii/settings/pages",
                    "https://github.com/oborskyivitalii/oborskyivitalii/settings/environments"]:
            self.assertIn(url, guide)
        # These assertions prove routes/policy structure, not usefulness or actual UI completion.
        analysis = (ROOT / "review/issue-39/2026-10-07-analysis.md").read_text()
        self.assertIn("issues/39", analysis)
        self.assertIn(BASE, analysis)
        self.assertRegex(analysis, r"(?m)^## Sol tasks$")


if __name__ == "__main__":
    unittest.main()
