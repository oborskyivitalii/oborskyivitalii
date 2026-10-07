"""Failure-oriented checks for maintained RI/CI coupling and invocation routes."""
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("ri_ci_checker", REPO / "tools/check_ri_ci.py")
ci = importlib.util.module_from_spec(SPEC)
# Local evidence must use the admitted source bytes, including same-size edits
# within one timestamp tick; importlib's reusable bytecode cache is insufficient.
exec(compile((REPO / "tools/check_ri_ci.py").read_bytes(), str(REPO / "tools/check_ri_ci.py"), "exec"), ci.__dict__)


class RICICouplingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.workflow = ".github/workflows/navigation.yml"
        self.command = ["python3", "-m", "unittest", "discover", "-s", "tests", "-p", "ri_ci_fixturetests.py"]
        self.write("AGENTS.md", "# Agent instructions\n")
        self.write("tools/repository_intelligence.py", "# Fixture producer\n")
        self.write("ri_ci_fixturetests.py", "# Not a selected test path\n")
        self.write("tests/ri_ci_fixturetests.py", "import unittest\nclass FixtureCheckTests(unittest.TestCase):\n    def test_pass(self):\n        self.assertEqual(1 + 1, 2)\n")
        self.write(ci.CATALOG, json.dumps({"entries": {}}))
        self.write(self.workflow, "name: Fixture\non:\n  pull_request:\njobs:\n  navigation:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Required fixture test\n        run: " + " ".join(self.command) + "\n")
        self.data = {
            "schema_version": 1,
            "layers": [{"id": "fixture", "purpose": "Exercise real mapped paths and CI argv",
                        "paths": ["AGENTS.md", "tools/repository_intelligence.py", ci.CATALOG,
                                  self.workflow, "tests/ri_ci_fixturetests.py"],
                        "checks": ["fixture-test"]}],
            "checks": [{"id": "fixture-test", "workflow": self.workflow, "job": "navigation",
                        "argv": self.command, "test_selectors": ["ri_ci_fixturetests.FixtureCheckTests.test_pass"]}],
        }
        self.refresh()

    def write(self, path, content):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)

    def save(self):
        self.write(ci.MAP, json.dumps(self.data))

    def refresh(self):
        ci.validate_definition(self.root, self.data)
        self.data["reviewed_source_identity"] = ci.source_identity(self.root, self.data)
        self.save()

    def test_current_repository_map_and_ci_routes(self):
        result = ci.verify(REPO)
        self.assertTrue(result["pass"])
        data = json.loads((REPO / ci.MAP).read_text())
        self.assertEqual({layer["id"] for layer in data["layers"]}, {
            "authority-instructions", "intent-acceptance", "path-catalog", "producer-identity",
            "generated-views", "lookup-validation-routes", "continuity", "github-live-overlay-ci-boundary"})
        self.assertFalse(result["live_github_state_verified"])

    def test_verified_definition_and_source_identity_are_deterministic(self):
        first = ci.verify(self.root)
        self.refresh()
        self.assertEqual(ci.verify(self.root), first)

    def test_source_edits_require_mapping_refresh(self):
        for path in ["AGENTS.md", "tools/repository_intelligence.py", ci.CATALOG, self.workflow]:
            original = (self.root / path).read_text()
            with self.subTest(path=path):
                self.write(path, original + "\n")
                with self.assertRaisesRegex(ValueError, "Stale RI/CI mapping"):
                    ci.verify(self.root)
                self.write(path, original)

    def test_definition_edits_invalidate_mapping_digest(self):
        self.data["layers"][0]["purpose"] = "Changed layer interpretation"
        self.save()
        with self.assertRaisesRegex(ValueError, "Stale RI/CI mapping"):
            ci.verify(self.root)

    def test_new_workflow_and_owned_control_must_be_mapped(self):
        self.write(".github/workflows/unmapped.yml", (self.root / self.workflow).read_text())
        with self.assertRaisesRegex(ValueError, "Unmapped.*unmapped.yml"):
            self.refresh()
        (self.root / ".github/workflows/unmapped.yml").unlink()
        self.write("tools/new_ri_control.py", "# New catalog-owned control\n")
        self.write(ci.CATALOG, json.dumps({"entries": {"tools/new_ri_control.py": {
            "kind": "file", "role": "validator", "owner": ".github/REPOSITORY-INTELLIGENCE.md"}}}))
        with self.assertRaisesRegex(ValueError, "Unmapped.*new_ri_control.py"):
            self.refresh()

    def test_missing_path_and_dangling_check_fail(self):
        (self.root / "AGENTS.md").unlink()
        with self.assertRaisesRegex(ValueError, "Missing mapped path"):
            ci.verify(self.root)
        self.write("AGENTS.md", "# Agent instructions\n")
        self.data["layers"][0]["checks"].append("nonexistent")
        self.save()
        with self.assertRaisesRegex(ValueError, "Dangling.*nonexistent"):
            ci.verify(self.root)

    def test_test_selector_exists_and_is_selected_by_workflow(self):
        self.data["checks"][0]["test_selectors"] = ["ri_ci_fixturetests.FixtureCheckTests.test_missing"]
        self.save()
        with self.assertRaisesRegex(ValueError, "Missing mapped test selector"):
            ci.verify(self.root)
        self.data["checks"][0]["test_selectors"] = ["ri_ci_fixturetests.FixtureCheckTests.test_pass"]
        self.data["checks"][0]["argv"][-1] = "different-tests.py"
        self.write(self.workflow, (self.root / self.workflow).read_text().replace("ri_ci_fixturetests.py", "different-tests.py"))
        self.save()
        with self.assertRaisesRegex(ValueError, "not selected by CI discovery"):
            ci.verify(self.root)

    def test_current_test_source_is_loaded_instead_of_cached_module(self):
        ci.verify(self.root)
        self.write("tests/ri_ci_fixturetests.py", "import unittest\nclass FixtureCheckTests(unittest.TestCase):\n    def test_renamed(self):\n        self.assertEqual(2, 2)\n")
        with self.assertRaisesRegex(ValueError, "Missing mapped test selector"):
            self.refresh()

    def test_command_mentions_and_shell_guards_do_not_prove_invocation(self):
        original = (self.root / self.workflow).read_text()
        argv = " ".join(self.command)
        for replacement in ["echo " + argv, "false && " + argv, "if false; then " + argv + "; fi", "|\n          echo report\n          " + argv]:
            with self.subTest(replacement=replacement):
                self.write(self.workflow, original.replace(argv, replacement))
                with self.assertRaisesRegex(ValueError, "not invoked unconditionally"):
                    self.refresh()

    def test_conditionally_skipped_or_optional_jobs_and_steps_fail(self):
        original = (self.root / self.workflow).read_text()
        modifications = [
            original.replace("    runs-on:", "    if: false\n    runs-on:"),
            original.replace("        run:", "        if: false\n        run:"),
            original.replace("        run:", "        continue-on-error: true\n        run:"),
            original.replace("        run:", "        'if': false\n        run:"),
            original.replace("        run:", "        shell: bash -c false {0}\n        run:"),
            original.replace("        run:", "        working-directory: unrelated\n        run:"),
        ]
        for changed in modifications:
            self.write(self.workflow, changed)
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                self.refresh()

    def test_missing_job_event_or_filtered_event_fails(self):
        original = (self.root / self.workflow).read_text()
        for changed in [original.replace("  navigation:", "  renamed:"),
                        original.replace("  pull_request:", "  push:"),
                        original.replace("  pull_request:", "  pull_request:\n    paths: [elsewhere/**]")]:
            self.write(self.workflow, changed)
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                self.refresh()

    def test_pr_event_filters_and_types_cannot_skip_mapped_checks(self):
        original = (self.root / self.workflow).read_text()
        for field in ["branches: [never-used-branch]", "branches-ignore: ['**']",
                      "paths-ignore: ['**']", "types: [closed]", "types: [opened]",
                      "types: [synchronize]", "types: []", "types:\n      - closed"]:
            self.write(self.workflow, original.replace("  pull_request:", "  pull_request:\n    " + field))
            with self.subTest(field=field), self.assertRaises(ValueError):
                self.refresh()
        # No explicit types uses GitHub's opened/synchronize/reopened defaults.
        # Push branch filtering does not restrict the independent PR trigger.
        for suffix in ["", "\n    types: [opened, synchronize]",
                       "\n    types: ['opened', \"synchronize\", closed]",
                       "\n    types:\n      - opened\n      - synchronize",
                       "\n  push:\n    branches: [main]"]:
            self.write(self.workflow, original.replace("  pull_request:", "  pull_request:" + suffix))
            with self.subTest(accepted=suffix):
                self.refresh()
                self.assertTrue(ci.verify(self.root)["pass"])

    def test_mapped_job_needs_cannot_hide_unreachable_checks(self):
        original = (self.root / self.workflow).read_text()
        upstream = ("  never:\n    if: false\n    runs-on: ubuntu-latest\n"
                    "    steps:\n      - run: echo unreachable\n")
        for needs in ["never", "[never]"]:
            changed = original.replace("  navigation:", upstream + "  navigation:\n    needs: " + needs)
            self.write(self.workflow, changed)
            with self.subTest(needs=needs), self.assertRaisesRegex(ValueError, "reachability adapter"):
                self.refresh()

    def test_unsafe_and_symlink_map_paths_fail(self):
        for path in ["../outside.md", "/tmp/outside.md", "a/../AGENTS.md"]:
            self.data["layers"][0]["paths"].append(path)
            self.save()
            with self.subTest(path=path), self.assertRaisesRegex(ValueError, "Unsafe map path"):
                ci.verify(self.root)
            self.data["layers"][0]["paths"].pop()
        (self.root / "alias.md").symlink_to(self.root / "AGENTS.md")
        self.data["layers"][0]["paths"].append("alias.md")
        self.save()
        with self.assertRaisesRegex(ValueError, "Symlink map path"):
            ci.verify(self.root)

    def test_generated_views_do_not_create_a_coupling_hash_cycle(self):
        self.write("REPOSITORY-MAP.md", "first derived output\n")
        self.data["layers"][0]["paths"].append("REPOSITORY-MAP.md")
        self.refresh()
        first = ci.verify(self.root)
        self.write("REPOSITORY-MAP.md", "different derived output\n")
        self.assertEqual(ci.verify(self.root), first)

    def test_fixed_diff_requires_commits_exact_checkout_and_clean_controls(self):
        def git(*args):
            return subprocess.check_output(["git", "-C", str(self.root), *args], text=True).strip()
        git("init", "-q")
        git("config", "user.name", "RI CI fixture")
        git("config", "user.email", "fixture@example.invalid")
        git("add", ".")
        git("commit", "-qm", "Fixture base")
        base = git("rev-parse", "HEAD")
        self.write("AGENTS.md", "# Changed agent instructions\n")
        self.refresh()
        git("add", ".")
        git("commit", "-qm", "Fixture head")
        head = git("rev-parse", "HEAD")
        result = ci.verify(self.root, base=base, head=head)
        self.assertEqual(result["comparison"]["base_sha"], base)
        self.assertEqual(result["comparison"]["head_sha"], head)
        self.assertIn("AGENTS.md", result["comparison"]["changed_controls"])
        for wrong_base, wrong_head in [("HEAD~1", head), (base, "HEAD"), (base, base)]:
            with self.subTest(refs=(wrong_base, wrong_head)), self.assertRaises(ValueError):
                ci.verify(self.root, base=wrong_base, head=wrong_head)
        self.write("AGENTS.md", "# Dirty instructions\n")
        self.refresh()
        with self.assertRaisesRegex(ValueError, "clean control files"):
            ci.verify(self.root, base=base, head=head)


if __name__ == "__main__":
    unittest.main()
