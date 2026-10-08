"""Enduring code-style guard negatives and actual agent/RI entry routes."""

import copy
import hashlib
import json
import runpy
import subprocess
import tempfile
import types
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
style = types.SimpleNamespace(**runpy.run_path(str(REPO / "tools/check_code_style.py")))


class CodeStyleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.history = "review/old/effect.cjs"
        self.importer = "tools/staging/color.cjs"
        self.html = "site/content/pages/home/main.html"
        self.catalog = {
            "entries": {
                self.history: {"kind": "file", "role": "source", "owner": "site/README.md"},
            }
        }
        self.write(style.CATALOG, json.dumps(self.catalog))
        self.write(self.history, "module.exports = {};\n")
        self.write(self.importer, "require('../../review/old/effect.cjs');\n")
        self.write("tools/site/build.cjs", "module.exports = {};\n")
        self.write(self.html, '<img style="max-width:100%;height:auto" src="portrait.webp">')
        self.write("site/templates/shell.html", "<main>{{content}}</main>\n")
        for owner, tokens in style.TOKEN_OWNERS.items():
            self.write(owner, ":root {\n" + "\n".join(token + ": 1;" for token in tokens) + "\n}\n")
        self.policy = {
            "schema_version": 1,
            "legacy": [
                self.allowance(
                    "CS01-history-source", self.history, "active source in review/", "R1"
                ),
                self.allowance("CS01-history-import", self.importer, self.history, "R1"),
                self.allowance(
                    "CS03-inline-style", self.html, "img style=max-width:100%;height:auto", "R4"
                ),
            ],
        }
        self.save_policy()
        self.baseline = {
            path.relative_to(self.root).as_posix(): path.read_text()
            for path in self.root.rglob("*")
            if path.is_file()
        }

    def write(self, path, text):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")

    def allowance(self, rule, path, detail, task):
        return {
            "rule": rule,
            "path": path,
            "detail": detail,
            "count": 1,
            "issue": 54,
            "remove_in": task,
            "reason": "Fixture: migrate existing source debt while retaining parity.",
        }

    def save_policy(self):
        self.write(style.POLICY, json.dumps(self.policy))

    def verify(self):
        return style.verify(self.root, self.baseline.__getitem__)

    def test_exact_baseline_and_same_owner_theme_overrides_pass(self):
        owner = "site/engine/reading-surfaces.css"
        self.write(
            owner,
            (self.root / owner).read_text()
            + "@media (prefers-reduced-transparency: reduce) { :root { --reading-surface-alpha: 100%; } }",
        )
        self.assertTrue(self.verify()["pass"])
        self.assertEqual(self.verify()["legacy_occurrences"], 3)

    def test_new_inline_styles_style_elements_and_debt_growth_fail(self):
        original = (self.root / self.html).read_text()
        for addition in ['<p style="color:red">text</p>', "<STYLE>p{color:red}</STYLE>", original]:
            with self.subTest(addition=addition):
                self.write(self.html, original + addition)
                with self.assertRaisesRegex(ValueError, "violations"):
                    self.verify()
        self.write(self.html, original)
        self.write("site/templates/new.html", '<div STYLE="padding:1px"></div>')
        with self.assertRaisesRegex(ValueError, "violations"):
            self.verify()

    def test_debt_removal_requires_ledger_trim_and_then_passes(self):
        self.write(self.html, '<img class="portrait" src="portrait.webp">')
        with self.assertRaisesRegex(ValueError, "stale"):
            self.verify()
        self.policy["legacy"].pop()
        self.save_policy()
        self.assertTrue(self.verify()["pass"])

    def test_expanded_duplicate_unowned_and_wildcard_allowances_fail(self):
        original = copy.deepcopy(self.policy)
        mutations = [
            lambda p: p["legacy"][2].update(count=2),
            lambda p: p["legacy"].append(copy.deepcopy(p["legacy"][0])),
            lambda p: p["legacy"][0].update(issue=None),
            lambda p: p["legacy"][0].update(path="review/**"),
            lambda p: p["legacy"][0].update(count=True),
            lambda p: p["legacy"][0].update(remove_in="whenever"),
            lambda p: p.update(schema_version=True),
            lambda p: p["legacy"][0].update(rule=[]),
            lambda p: p.update(ignored_paths=["site/"]),
        ]
        for index, mutate in enumerate(mutations):
            with self.subTest(index=index):
                self.policy = copy.deepcopy(original)
                mutate(self.policy)
                self.save_policy()
                with self.assertRaises(ValueError):
                    self.verify()

    def test_new_debt_cannot_be_admitted_by_adding_an_exception(self):
        self.write(self.html, (self.root / self.html).read_text() + '<p style="color:red">text</p>')
        self.policy["legacy"].append(
            self.allowance("CS03-inline-style", self.html, "p style=color:red", "R4")
        )
        self.save_policy()
        with self.assertRaisesRegex(ValueError, "immutable baseline"):
            self.verify()

    def test_competing_or_missing_canonical_css_token_fails(self):
        self.write("site/engine/new.css", ":root { --reading-surface-radius: 9px; }")
        with self.assertRaisesRegex(ValueError, "Competing CSS token owner"):
            self.verify()
        self.write("site/engine/new.css", "/* --reading-surface-radius: 9px; */")
        self.assertTrue(self.verify()["pass"])
        (self.root / "site/engine/reading-surfaces.css").unlink()
        with self.assertRaisesRegex(ValueError, "Missing canonical CSS token"):
            self.verify()

    def test_prior_immutable_output_is_not_an_authored_owner_or_import_source(self):
        retained = "site/retained/runtime/" + "a" * 64
        css = ":root { --paper: white; }"
        self.write(retained + "/styles.css", css)
        self.write(retained + "/space.js", "module.exports = {};\n")
        manifest = {"schema": 1, "files": {
            retained.removeprefix(style.RETAINED) + "/styles.css":
                hashlib.sha256(css.encode()).hexdigest(),
        }}
        self.write(style.RETAINED + "manifest.json", json.dumps(manifest))
        self.assertTrue(self.verify()["pass"])
        for invalid in [css + " /* changed */", css.replace("white", "red")]:
            self.write(retained + "/styles.css", invalid)
            with self.assertRaisesRegex(ValueError, "Unverified retained style"):
                self.verify()
        self.write(retained + "/styles.css", css)
        self.write(style.RETAINED + "manifest.json", '{"schema":1,"files":{}}')
        with self.assertRaisesRegex(ValueError, "Unverified retained style"):
            self.verify()
        for invalid in [[], {**manifest, "schema": True}]:
            self.write(style.RETAINED + "manifest.json", json.dumps(invalid))
            with self.assertRaisesRegex(ValueError, "Invalid retained style manifest"):
                self.verify()
        self.write(style.RETAINED + "manifest.json", json.dumps(manifest))
        self.write("site/engine/new.css", ":root { --paper: red; }")
        self.catalog["entries"]["site/engine/new.css"] = {"kind": "file", "role": "generated"}
        self.write(style.CATALOG, json.dumps(self.catalog))
        with self.assertRaisesRegex(ValueError, "Competing CSS token owner"):
            self.verify()
        (self.root / "site/engine/new.css").unlink()
        for target in ["../retained", "../retained/runtime/" + "a" * 64 + "/space.js"]:
            self.write("site/engine/new.cjs", "require('" + target + "');\n")
            with self.assertRaisesRegex(ValueError, "generated-or-tool-import"):
                self.verify()

    def test_new_active_history_source_and_hidden_dependency_fail(self):
        new = "review/old/new.cjs"
        self.write(new, "module.exports = {};\n")
        self.catalog["entries"][new] = {"kind": "file", "role": "source"}
        self.write(style.CATALOG, json.dumps(self.catalog))
        with self.assertRaisesRegex(ValueError, "violations"):
            self.verify()
        del self.catalog["entries"][new]
        self.catalog["entries"][self.history]["role"] = "history"
        self.write(style.CATALOG, json.dumps(self.catalog))
        with self.assertRaisesRegex(ValueError, "Uncatalogued active history import"):
            self.verify()

    def test_new_history_generated_and_reverse_tool_imports_fail(self):
        for statement in [
            "require('../../review/old/effect.cjs');",
            "import x from '../../docs/space.js';",
            "import('../../tools/site/build.cjs');",
        ]:
            with self.subTest(statement=statement):
                self.write("site/engine/new.cjs", statement)
                with self.assertRaisesRegex(ValueError, "violations"):
                    self.verify()

    def test_missing_source_and_missing_scan_scope_fail(self):
        (self.root / self.history).unlink()
        with self.assertRaisesRegex(ValueError, "Missing/indirect active source"):
            self.verify()
        self.write(self.history, "module.exports = {};\n")
        (self.root / "tools/site/build.cjs").unlink()
        (self.root / "tools/site").rmdir()
        with self.assertRaisesRegex(ValueError, "Missing style scan coverage"):
            self.verify()


class CodeStyleRepositoryTests(unittest.TestCase):
    def test_current_repository_guard(self):
        self.assertTrue(style.verify(REPO)["pass"])

    def test_code_path_and_bilingual_ri_queries_route_to_guide_and_check(self):
        command = [
            "python3",
            "tools/repository_intelligence.py",
            "--config",
            ".github/repository-intelligence-config.json",
        ]
        for query in [
            "site/engine/navigation.js",
            "tools/staging/color.cjs",
            "tests/test_code_style.py",
            "code style",
            "стиль коду",
        ]:
            with self.subTest(query=query):
                output = subprocess.check_output(
                    command + ["context-for-task", query], cwd=REPO, text=True
                )
                result = json.loads(output)
                routes = result["validation_routes"]
                self.assertTrue(
                    any(
                        "guides/CODE-STYLE.md" in route.get("read", [])
                        and "python3 tools/check_code_style.py" in route["commands"]
                        for route in routes
                    )
                )
                self.assertIn("AGENTS.md", result["instructions"])

    def test_mandatory_agent_contributor_and_acceptance_routes(self):
        for path in [
            "AGENTS.md",
            "CONTRIBUTING.md",
            ".github/ACCEPTANCE.md",
            ".github/ISSUE_TEMPLATE/work-item.md",
            ".github/pull_request_template.md",
            "guides/README.md",
        ]:
            with self.subTest(path=path):
                self.assertIn("CODE-STYLE.md", (REPO / path).read_text())
        self.assertIn("code-style AC", (REPO / ".github/ISSUE_TEMPLATE/work-item.md").read_text())
        self.assertIn("Rule IDs", (REPO / ".github/pull_request_template.md").read_text())


if __name__ == "__main__":
    unittest.main()
