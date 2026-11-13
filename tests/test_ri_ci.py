"""Failure-oriented checks for maintained RI/CI coupling and invocation routes."""

import importlib.util
import json
import shlex
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("ri_ci_checker", REPO / "tools/check_ri_ci.py")
ci = importlib.util.module_from_spec(SPEC)
# Local evidence must use the admitted source bytes, including same-size edits
# within one timestamp tick; importlib's reusable bytecode cache is insufficient.
exec(
    compile(
        (REPO / "tools/check_ri_ci.py").read_bytes(), str(REPO / "tools/check_ri_ci.py"), "exec"
    ),
    ci.__dict__,
)


class RICICouplingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.workflow = ".github/workflows/navigation.yml"
        self.command = [
            "python3",
            "-m",
            "unittest",
            "discover",
            "-s",
            "tests",
            "-p",
            "ri_ci_fixturetests.py",
        ]
        self.write("AGENTS.md", "# Agent instructions\n")
        self.write("tools/repository_intelligence.py", "# Fixture producer\n")
        self.write("ri_ci_fixturetests.py", "# Not a selected test path\n")
        self.write(
            "tests/ri_ci_fixturetests.py",
            "import unittest\nclass FixtureCheckTests(unittest.TestCase):\n    def test_pass(self):\n        self.assertEqual(1 + 1, 2)\n",
        )
        self.write(ci.CATALOG, json.dumps({"entries": {}}))
        self.write(
            self.workflow,
            "name: Fixture\non:\n  pull_request:\njobs:\n  navigation:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Required fixture test\n        run: "
            + " ".join(self.command)
            + "\n",
        )
        self.data = {
            "schema_version": 1,
            "layers": [
                {
                    "id": "fixture",
                    "purpose": "Exercise real mapped paths and CI argv",
                    "paths": [
                        "AGENTS.md",
                        "tools/repository_intelligence.py",
                        ci.CATALOG,
                        self.workflow,
                        "tests/ri_ci_fixturetests.py",
                    ],
                    "checks": ["fixture-test"],
                }
            ],
            "checks": [
                {
                    "id": "fixture-test",
                    "workflow": self.workflow,
                    "job": "navigation",
                    "argv": self.command,
                    "test_selectors": ["ri_ci_fixturetests.FixtureCheckTests.test_pass"],
                }
            ],
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
        self.assertEqual(
            {layer["id"] for layer in data["layers"]},
            {
                "authority-instructions",
                "reviewer-prompts",
                "offline-web-orchestration",
                "reviewer-admission",
                "intent-acceptance",
                "path-catalog",
                "producer-identity",
                "generated-views",
                "lookup-validation-routes",
                "continuity",
                "github-live-overlay-ci-boundary",
                "entry-root-guides",
                "test-profile-selection",
                "code-style-architecture",
                "maintained-source-quality",
                "refactoring-contracts",
                "delivery-observation",
                "delivery-admission-preparation",
                "control-lock-prototype",
                "control-runner-prototype",
            },
        )
        quality = next(
            layer for layer in data["layers"] if layer["id"] == "maintained-source-quality"
        )
        self.assertTrue(
            {"maintained-format-check", "maintained-source-lint", "acceptance-policy"}.issubset(
                quality["checks"]
            )
        )
        self.assertIn("tools/quality/format.cjs", quality["paths"])
        self.assertIn("tests/test_issue58_acceptance.py", quality["paths"])
        refactoring = next(
            layer for layer in data["layers"] if layer["id"] == "refactoring-contracts"
        )
        self.assertTrue(
            {"authored-dependencies", "site-basic", "acceptance-policy"}.issubset(
                refactoring["checks"]
            )
        )
        self.assertIn("tools/quality/architecture.cjs", refactoring["paths"])
        self.assertIn("tools/quality/refactor-metrics.cjs", refactoring["paths"])
        self.assertFalse(result["live_github_state_verified"])

    def test_staging_and_production_share_actual_ri_freshness_preflight(self):
        workflow = (REPO / ".github/workflows/site-release-checks.yml").read_text()
        start = workflow.index(
            "      - name: Complete host-independent guards before candidate upload or hosted jobs\n"
        )
        end = workflow.index("      - ", start + 8)
        step = workflow[start:end].splitlines()
        self.assertEqual(
            step[1:3],
            [
                "        id: source_checks",
                "        if: ${{ !cancelled() && steps.source_identity.outcome == 'success' && inputs.prepublication_artifact_id == '' }}",
            ],
        )
        self.assertEqual(
            len(step), 6, "fresh preflight remains explicit with host-independent scanner reports"
        )
        self.assertEqual(step[3], "        env:")
        self.assertIn("SITE_TEST_BASE_URL:", step[4])
        self.assertTrue(step[5].startswith("        run: "))
        argv = shlex.split(step[5].removeprefix("        run: "))
        self.assertEqual(
            argv,
            [
                "node",
                "tools/quality/local.cjs",
                "--prepublication",
                "$SITE_VALIDATION_LEVEL",
                "quality-artifact",
                "--report",
                "quality-reports/prepublication.json",
            ],
        )
        self.assertIn("  SITE_VALIDATION_LEVEL: ${{ inputs.validation_level }}\n", workflow)
        self.assertIn("steps.reuse_source_checks.outcome || steps.source_checks.outcome", workflow)
        self.assertIn("prepublication.cjs').authenticate", workflow)
        self.assertIn("id: reuse_source_checks", workflow)
        # Execute the workflow's actual orchestration owner at both levels. The
        # finite child-process seam avoids recursively running this test suite;
        # removing, conditioning or swallowing either RI guard fails these cases.
        script = """
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const argv = JSON.parse(process.argv[1]);
const output = process.argv[2];
const prepublication = require(path.resolve(argv[1])).prepublication;
const identity = {
  sourceCommit: process.env.SITE_CANDIDATE_SHA || 'a'.repeat(40),
  sourceTree: 'b'.repeat(40),
  sourceDirty: false,
};
const commands = {
  ri: ['python3', 'tools/repository_intelligence.py', '--config',
       '.github/repository-intelligence-config.json', 'verify'],
  'ri-ci': ['python3', 'tools/check_ri_ci.py', 'verify'],
};
const observations = [];
for (const level of ['staging', 'production']) {
  for (const failed of [null, 'ri', 'ri-ci']) {
    const calls = [];
    const report = prepublication(level, path.join(output, 'artifact'), {
      report: path.join(output, level + '-' + (failed || 'pass'), 'preflight.json'),
      identify: () => identity,
      execute: (command, args) => {
        const call = [command, ...args];
        calls.push(call);
        const failing = failed && JSON.stringify(call) === JSON.stringify(commands[failed]);
        return { status: failing ? 1 : 0, stdout: 'observed child output',
                 stderr: failing ? 'controlled ' + failed + ' freshness failure' : '' };
      },
    });
    assert.equal(report.validationLevel, level);
    assert.equal(report.pass, failed === null);
    for (const [id, command] of Object.entries(commands)) {
      assert.equal(calls.filter((call) => JSON.stringify(call) === JSON.stringify(command)).length, 1);
      const row = report.checks.find((check) => check.id === id);
      assert.deepEqual(row.command, command);
      assert.equal(row.pass, id !== failed);
      assert.equal(row.status, id === failed ? 'failed' : 'passed');
      if (id === failed) {
        assert.equal(row.exitCode, 1);
        assert.match(fs.readFileSync(row.stderr, 'utf8'), /freshness failure/);
      }
    }
    observations.push({ level, failed, pass: report.pass });
  }
}
process.stdout.write(JSON.stringify(observations));
"""
        result = subprocess.run(
            ["node", "-e", script, json.dumps(argv), str(self.root / "prepublication")],
            cwd=REPO,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(json.loads(result.stdout)), 6)

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
        self.write(
            ci.CATALOG,
            json.dumps(
                {
                    "entries": {
                        "tools/new_ri_control.py": {
                            "kind": "file",
                            "role": "validator",
                            "owner": ".github/REPOSITORY-INTELLIGENCE.md",
                        }
                    }
                }
            ),
        )
        with self.assertRaisesRegex(ValueError, "Unmapped.*new_ri_control.py"):
            self.refresh()

    def test_new_profile_owned_control_family_must_be_mapped(self):
        path = "tools/quality/new-profile-selector.cjs"
        self.write(path, "// New maintained profile-selection control\n")
        self.write(
            ci.CATALOG,
            json.dumps(
                {
                    "entries": {
                        path: {
                            "kind": "file",
                            "role": "validator",
                            "owner": "guides/SITE-CHECK-PROFILES.md",
                        }
                    }
                }
            ),
        )
        # Fixed profile families cannot disappear from CI coupling merely because
        # their editing owner differs from RI/acceptance architecture owners.
        self.assertIn(path, ci.control_paths(self.root))
        with self.assertRaisesRegex(ValueError, "Unmapped.*new-profile-selector.cjs"):
            self.refresh()
        self.data["layers"][0]["paths"].append(path)
        self.refresh()
        self.assertTrue(ci.verify(self.root)["pass"])
        self.write(path, "// Changed profile-selection behavior\n")
        with self.assertRaisesRegex(ValueError, "Stale RI/CI mapping"):
            ci.verify(self.root)

    def test_reviewer_prompt_edits_and_unmapped_additions_require_review(self):
        existing = "agents/reviewers/README.md"
        self.write(existing, "# Common reviewer contract\n")
        self.data["layers"][0]["paths"].append(existing)
        self.refresh()
        self.assertTrue(ci.verify(self.root)["pass"])
        self.write(existing, "# Changed reviewer launch contract\n")
        with self.assertRaisesRegex(ValueError, "Stale RI/CI mapping"):
            ci.verify(self.root)
        self.refresh()
        self.assertTrue(ci.verify(self.root)["pass"])

        added = "agents/reviewers/new-role.md"
        for entries in [{}, {added: {"kind": "file", "role": "guide", "owner": added}}]:
            with self.subTest(catalog_entries=entries):
                self.write(added, "# New reviewer role\n")
                self.write(ci.CATALOG, json.dumps({"entries": entries}))
                with self.assertRaisesRegex(ValueError, "Unmapped.*new-role.md"):
                    self.refresh()
        self.data["layers"][0]["paths"].append(added)
        self.refresh()
        self.assertTrue(ci.verify(self.root)["pass"])

    def test_fixed_diff_retains_removed_and_renamed_reviewer_prompts(self):
        def git(*args):
            return subprocess.check_output(["git", "-C", str(self.root), *args], text=True).strip()

        deleted = "agents/reviewers/deleted.md"
        renamed = "agents/reviewers/renamed.md"
        self.write(deleted, "# Deleted role\n")
        self.write(renamed, "# Renamed role\n")
        self.data["layers"][0]["paths"].extend([deleted, renamed])
        self.refresh()
        git("init", "-q")
        git("config", "user.name", "RI CI fixture")
        git("config", "user.email", "fixture@example.invalid")
        git("add", ".")
        git("commit", "-qm", "Reviewer fixture base")
        base = git("rev-parse", "HEAD")
        (self.root / deleted).unlink()
        (self.root / renamed).rename(self.root / "role-contract.md")
        self.data["layers"][0]["paths"].remove(deleted)
        self.data["layers"][0]["paths"].remove(renamed)
        self.refresh()
        git("add", ".")
        git("commit", "-qm", "Reviewer fixture head")
        result = ci.verify(self.root, base=base, head=git("rev-parse", "HEAD"))
        self.assertTrue({deleted, renamed} <= set(result["comparison"]["changed_controls"]))

    def test_new_code_style_owned_control_must_be_mapped(self):
        path = "tools/check_new_style_rule.py"
        self.write(path, "# Maintained code style control\n")
        self.write(
            ci.CATALOG,
            json.dumps(
                {
                    "entries": {
                        path: {"kind": "file", "role": "validator", "owner": "guides/CODE-STYLE.md"}
                    }
                }
            ),
        )
        with self.assertRaisesRegex(ValueError, "Unmapped.*check_new_style_rule.py"):
            self.refresh()
        self.data["layers"][0]["paths"].append(path)
        self.refresh()
        self.assertTrue(ci.verify(self.root)["pass"])

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
        self.data["checks"][0]["test_selectors"] = [
            "ri_ci_fixturetests.FixtureCheckTests.test_missing"
        ]
        self.save()
        with self.assertRaisesRegex(ValueError, "Missing mapped test selector"):
            ci.verify(self.root)
        self.data["checks"][0]["test_selectors"] = [
            "ri_ci_fixturetests.FixtureCheckTests.test_pass"
        ]
        self.data["checks"][0]["argv"][-1] = "different-tests.py"
        self.write(
            self.workflow,
            (self.root / self.workflow)
            .read_text()
            .replace("ri_ci_fixturetests.py", "different-tests.py"),
        )
        self.save()
        with self.assertRaisesRegex(ValueError, "not selected by CI discovery"):
            ci.verify(self.root)

    def test_current_test_source_is_loaded_instead_of_cached_module(self):
        ci.verify(self.root)
        self.write(
            "tests/ri_ci_fixturetests.py",
            "import unittest\nclass FixtureCheckTests(unittest.TestCase):\n    def test_renamed(self):\n        self.assertEqual(2, 2)\n",
        )
        with self.assertRaisesRegex(ValueError, "Missing mapped test selector"):
            self.refresh()

    def test_command_mentions_and_shell_guards_do_not_prove_invocation(self):
        original = (self.root / self.workflow).read_text()
        argv = " ".join(self.command)
        for replacement in [
            "echo " + argv,
            "false && " + argv,
            "if false; then " + argv + "; fi",
            "|\n          echo report\n          " + argv,
        ]:
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

    def test_ready_pr_adapter_requires_exact_guard_and_ready_event(self):
        original = (self.root / self.workflow).read_text()
        guard = "github.event_name != 'pull_request' || github.event.pull_request.draft == false"
        ready = original.replace(
            "  pull_request:", "  pull_request:\n    types: [opened, synchronize, ready_for_review]"
        ).replace("    runs-on:", "    if: " + guard + "\n    runs-on:")
        self.data["checks"][0]["event_scope"] = "ready-pr"
        self.write(self.workflow, ready)
        self.refresh()
        self.assertTrue(ci.verify(self.root)["pass"])
        for changed in [
            ready.replace(", ready_for_review", ""),
            ready.replace("draft == false", "draft == true"),
            ready.replace("    if: " + guard, "    if: true"),
            ready.replace("    if: " + guard + "\n", ""),
            ready.replace("    runs-on:", "    continue-on-error: true\n    runs-on:"),
            ready.replace("    runs-on:", "    if: false\n    runs-on:"),
        ]:
            self.write(self.workflow, changed)
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                self.refresh()
        self.write(self.workflow, ready)
        self.data["checks"][0]["event_scope"] = "invented"
        with self.assertRaises(ValueError):
            self.refresh()

    def test_missing_job_event_or_filtered_event_fails(self):
        original = (self.root / self.workflow).read_text()
        for changed in [
            original.replace("  navigation:", "  renamed:"),
            original.replace("  pull_request:", "  push:"),
            original.replace("  pull_request:", "  pull_request:\n    paths: [elsewhere/**]"),
        ]:
            self.write(self.workflow, changed)
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                self.refresh()

    def test_pr_event_filters_and_types_cannot_skip_mapped_checks(self):
        original = (self.root / self.workflow).read_text()
        for field in [
            "branches: [never-used-branch]",
            "branches-ignore: ['**']",
            "paths-ignore: ['**']",
            "types: [closed]",
            "types: [opened]",
            "types: [synchronize]",
            "types: []",
            "types:\n      - closed",
        ]:
            self.write(
                self.workflow, original.replace("  pull_request:", "  pull_request:\n    " + field)
            )
            with self.subTest(field=field), self.assertRaises(ValueError):
                self.refresh()
        # No explicit types uses GitHub's opened/synchronize/reopened defaults.
        # Push branch filtering does not restrict the independent PR trigger.
        for suffix in [
            "",
            "\n    types: [opened, synchronize]",
            "\n    types: ['opened', \"synchronize\", closed]",
            "\n    types:\n      - opened\n      - synchronize",
            "\n  push:\n    branches: [main]",
        ]:
            self.write(
                self.workflow, original.replace("  pull_request:", "  pull_request:" + suffix)
            )
            with self.subTest(accepted=suffix):
                self.refresh()
                self.assertTrue(ci.verify(self.root)["pass"])

    def test_source_shard_ready_adapter_requires_exact_fail_closed_edge(self):
        workflow = ".github/workflows/site-checks.yml"
        original = (REPO / workflow).read_text()
        self.write(workflow, original)

        def check():
            return ci.workflow_commands(
                self.root, workflow, "checks", "ready-pr", "source-shards-v1"
            )

        self.assertIn(
            ["node", "tools/quality/local.cjs", "--delivery", "quality-artifact"], check()
        )
        with self.assertRaisesRegex(ValueError, "reachability adapter"):
            ci.workflow_commands(self.root, workflow, "checks", "ready-pr")
        for old, new in [
            ("    needs: source_shards", "    needs: unrelated"),
            ("    needs: source_shards", ""),
            ("        shard: [0, 1, 2, 3, 4, 5, 6, 7]", "        shard: [0, 1]"),
            ("      fail-fast: false", "      fail-fast: true"),
            (
                "    if: ${{ always() && (github.event_name != 'pull_request' || github.event.pull_request.draft == false) }}",
                "    if: ${{ success() && (github.event_name != 'pull_request' || github.event.pull_request.draft == false) }}",
            ),
            (
                '        run: test "${{ needs.source_shards.result }}" = "success"',
                "        run: echo green",
            ),
            ("          if-no-files-found: error", "          if-no-files-found: warn"),
            ("        if: always()", "        if: success()"),
            (
                "    if: github.event_name != 'pull_request' || github.event.pull_request.draft == false",
                "    if: false",
            ),
        ]:
            self.assertIn(old, original)
            self.write(workflow, original.replace(old, new, 1))
            with self.subTest(old=old), self.assertRaises(ValueError):
                check()
        self.write(workflow, original)
        self.assertIn(
            ["node", "tools/quality/local.cjs", "--delivery", "quality-artifact"], check()
        )

    def test_mapped_job_needs_cannot_hide_unreachable_checks(self):
        original = (self.root / self.workflow).read_text()
        upstream = (
            "  never:\n    if: false\n    runs-on: ubuntu-latest\n"
            "    steps:\n      - run: echo unreachable\n"
        )
        for needs in ["never", "[never]"]:
            changed = original.replace(
                "  navigation:", upstream + "  navigation:\n    needs: " + needs
            )
            self.write(self.workflow, changed)
            with (
                self.subTest(needs=needs),
                self.assertRaisesRegex(ValueError, "reachability adapter"),
            ):
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


class WorkflowGuideReviewTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        self.git("init", "-q")
        self.write(ci.GUIDE, "# Guide\n\n## Agents\n\nAgents review candidates.\n")
        self.write(
            ci.CATALOG,
            json.dumps(
                {
                    "entries": {
                        "custom/control": {
                            "owner": "guides/WEB-ORCHESTRATION.md",
                            "role": "source",
                        }
                    }
                }
            ),
        )
        catalog_path = self.root / ci.CATALOG
        catalog = json.loads(catalog_path.read_text())
        catalog["entries"].update(
            {
                "tools/quality/source-test-worker.cjs": {"owner": "guides/SITE-CHECK-PROFILES.md"},
                "tools/quality/source-test-shards.cjs": {"owner": "guides/SITE-CHECK-PROFILES.md"},
                "tools/quality/content-baseline.cjs": {"owner": "guides/SITE-CHECK-PROFILES.md"},
                "tools/quality/content-gate.cjs": {"owner": "guides/SITE-CONTENT-RELEASE.md"},
                "tools/quality/hosted.cjs": {"owner": "guides/SITE-RELEASE-GATES.md"},
                "tools/quality/validate.cjs": {"owner": "guides/SITE-RELEASE-GATES.md"},
                "tools/quality/functional.cjs": {"owner": "guides/SITE-RELEASE-GATES.md"},
                "tools/quality/bandit-policy.json": {"owner": "guides/SITE-RELEASE-GATES.md"},
            }
        )
        self.write(ci.CATALOG, json.dumps(catalog))
        self.write(ci.MAP, '{"layers":[1],"reviewed_source_identity":{"digest":"old"}}')
        self.write("custom/control", "original")
        self.write(".github/workflows/retired.yml", "obsolete workflow")
        self.base = self.commit()

    def git(self, *args):
        return subprocess.check_output(["git", "-C", str(self.root), *args], text=True).strip()

    def write(self, path, value):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(value)

    def commit(self):
        self.git("add", "-A")
        self.git(
            "-c",
            "user.name=Fixture",
            "-c",
            "user.email=fixture@example.com",
            "commit",
            "-qm",
            "candidate",
        )
        return self.git("rev-parse", "HEAD")

    def test_covered_changes_require_current_guide_or_review(self):
        paths = [
            ".github/workflows/new.yml",
            ".github/actions/new/action.yml",
            "nested/AGENTS.md",
            "agents/new.md",
            "tools/orchestration/new.cjs",
            ".github/repository-intelligence-config.json",
            "tools/quality/delivery-routing.cjs",
            "tools/quality/source-test-worker.cjs",
            "tools/quality/source-test-shards.cjs",
            "tools/quality/content-baseline.cjs",
            "tools/quality/content-gate.cjs",
            "tools/pages/controller.cjs",
            "tools/release/staging-policy.cjs",
            "tools/quality/scanners.cjs",
            "tools/quality/budgets.json",
            "tools/quality/security-rules.yml",
            "tools/quality/artifact.cjs",
            "tools/quality/hosted.cjs",
            "tools/quality/validate.cjs",
            "tools/quality/functional.cjs",
            "tools/quality/bandit-policy.json",
        ]
        for path in paths:
            self.write(path, "change")
        self.git("rm", ".github/workflows/retired.yml")
        self.git("mv", "custom/control", "custom/renamed")
        paths.extend(
            [".github/workflows/retired.yml", "custom/control", "custom/renamed", ci.CATALOG]
        )
        self.write(ci.CATALOG, '{"entries":{"custom/control":{"owner":"site/README.md"}}}')
        head = self.commit()
        self.assertEqual(ci.guide_review(self.root, self.base, head, True)["paths"], sorted(paths))
        with self.assertRaisesRegex(ValueError, "Update"):
            ci.guide_review(self.root, self.base, head)
        self.write(
            ci.GUIDE,
            "# Guide\n\n## Agents\n\nAgents review  candidates.\n<!-- no-op -->\n",
        )
        with self.assertRaisesRegex(ValueError, "Update"):
            ci.guide_review(self.root, self.base, self.commit())
        for definition in (
            "[unused]:\nhttps://example.com/\n",
            "> [unused]: https://example.com/\n",
            "[multiline\nlabel]: https://example.com/\n",
            "[<!--hidden-->]: https://example.com/\n",
            "[^unused]:\n    [actual]: https://example.com/\n",
            "[alpha" + chr(92) + "\nbeta]: https://example.com/\n",
        ):
            with self.subTest(definition=definition):
                self.write(
                    ci.GUIDE, "# Guide\n\n## Agents\n\nAgents review candidates.\n\n" + definition
                )
                with self.assertRaisesRegex(ValueError, "Write inline links"):
                    ci.guide_review(self.root, self.base, self.commit())
        baseline = "# Guide\n\n## Agents\n\nAgents review candidates.\n"
        self.write(ci.GUIDE, baseline + "\n<!-- [example]: https://example.com/ -->\n")
        with self.assertRaisesRegex(ValueError, "Update"):
            ci.guide_review(self.root, self.base, self.commit())
        self.write(
            ci.GUIDE,
            baseline.replace(
                "Agents review candidates.", "Agents <!-- [example]: hidden --> review candidates."
            ),
        )
        with self.assertRaisesRegex(ValueError, "Update"):
            ci.guide_review(self.root, self.base, self.commit())
        self.write(
            ci.GUIDE,
            baseline.replace(
                "Agents review candidates.",
                "Agents <!-- [example]: hidden --> independently review candidates.",
            ),
        )
        self.assertEqual(
            ci.guide_review(self.root, self.base, self.commit())["decision"], "guide-updated"
        )
        for before, after in (
            (
                "See [guide](https://example.com/).",
                "See [guide](https://example.com/). <!-- hidden -->",
            ),
            ("See **the guide**", "See **the guide** <!-- [example]: hidden -->"),
            ("See **the guide**", "See <!-- hidden --> **the guide**"),
            ("", "<!-- [example]: unclosed"),
            ("", "[^unused]: Hidden note."),
            ("", "[^one]: Unused [^two].\n\n[^two]: Also unused."),
        ):
            with self.subTest(comment=after):
                base_guide = baseline + "\n" + before + "\n"
                self.assertEqual(*ci.guide_contents(base_guide, baseline + "\n" + after + "\n"))
        self.assertEqual(
            *ci.guide_contents("```text old\nexample\n```", "```text new\nexample\n```")
        )
        for markup in (
            "<div>foo <!-- hidden --> bar</div>",
            "<div>\n<!-- hidden\n\n## Phantom heading\n-->\ntext\n</div>",
            '<span title="<!-- one -->">text</span>',
            "[^unused]: <span>raw</span>",
            "<!--> <span>raw</span>",
        ):
            with self.subTest(markup=markup):
                with self.assertRaisesRegex(ValueError, "Use Markdown for guide markup"):
                    ci.guide_contents(markup)
        self.assertEqual(
            *ci.guide_contents(
                "Text [^one].\n\n[^one]: Visible",
                "Text [^one].\n\n[^one]: Visible\n\n[^one]: Hidden duplicate",
            )
        )
        self.assertNotEqual(
            *ci.guide_contents(
                "| A | B | C |\n| - | - | - |\n| | value | |",
                "| A | B | C |\n| - | - | - |\n| value | | |",
            )
        )
        self.assertNotEqual(*ci.guide_contents("- a\n-", "- a"))
        self.assertEqual(*ci.guide_contents("##", "## <!-- hidden -->"))
        self.assertNotEqual(*ci.guide_contents("##", ""))
        self.assertEqual(*ci.guide_contents("2 < 3", "<!-- note --> 2 < 3"))
        self.assertEqual(*ci.guide_contents("> 2 < 3", "> <!-- note --> 2 < 3"))
        self.assertEqual(*ci.guide_contents("> 2 &amp; 3", "> <!-- note --> 2 &amp; 3"))
        self.assertEqual(*ci.guide_contents("- 2 &#38; 3", "- <!-- note --> 2 &#38; 3"))
        self.assertNotEqual(*ci.guide_contents("> 2 &amp; 3", "> <!-- note --> 4 &amp; 5"))
        self.assertEqual(
            *ci.guide_contents(r"> Keep \&amp; literal.", r"> <!-- note --> Keep \&amp; literal.")
        )
        self.assertEqual(
            *ci.guide_contents("> Keep `&amp;` literal.", "> <!-- note --> Keep `&amp;` literal.")
        )
        self.assertNotEqual(
            *ci.guide_contents("> <!-- note --> Keep `&amp;`.", "> <!-- note --> Keep `&`.")
        )
        self.assertEqual(*ci.guide_contents("> &nbsp;", "> <!-- note --> &nbsp;"))
        self.assertEqual(*ci.guide_contents("> Keep `<em>`.", "> <!-- note --> Keep `<em>`."))
        self.assertNotEqual(
            *ci.guide_contents("> <!-- note --> Keep `<em>`.", "> <!-- note --> Keep `<b>`.")
        )
        self.assertEqual(*ci.guide_contents("- 2 < 3", "- <!-- note --> 2 < 3"))
        self.assertEqual(*ci.guide_contents(">", "> <!-- hidden -->"))

        for example in (
            "Explain `[example]:` in the review.\n",
            "```text\n<!-- [example]: literal -->\n```\n",
            "> ~~~text\n> [example]: literal\n> ~~~\n",
            "    [example]: literal\n",
        ):
            with self.subTest(example=example):
                self.write(ci.GUIDE, baseline + "\n" + example)
                self.assertEqual(
                    ci.guide_review(self.root, self.base, self.commit())["decision"],
                    "guide-updated",
                )
                self.write(ci.GUIDE, baseline + "\n" + example + "\n[real]: https://example.com/\n")
                with self.assertRaisesRegex(ValueError, "Write inline links"):
                    ci.guide_review(self.root, self.base, self.commit())
        self.write(ci.GUIDE, "# Guide\n\n## Agents\n\nAgents independently review candidates.\n")
        self.assertEqual(
            ci.guide_review(self.root, self.base, self.commit())["decision"], "guide-updated"
        )

    def test_derived_and_ordinary_content_are_inapplicable(self):
        self.write(ci.MAP, '{"layers":[1],"reviewed_source_identity":{"digest":"new"}}')
        self.write("REPOSITORY-MAP.md", "generated")
        self.write("MEMORY.md", "handoff")
        self.write("site/content/news.md", "ordinary content")
        self.write(".github/acceptance/issue-999.json", "{}")
        catalog = json.loads((self.root / ci.CATALOG).read_text())
        catalog["entries"]["site/content/news.md"] = {"owner": "guides/ARTICLE-WORKFLOW.md"}
        self.write(ci.CATALOG, json.dumps(catalog))
        self.assertEqual(
            ci.guide_review(self.root, self.base, self.commit())["decision"], "inapplicable"
        )
        self.write(ci.MAP, '{"layers":[2],"reviewed_source_identity":{"digest":"new"}}')
        self.assertEqual(
            ci.guide_review(self.root, self.base, self.commit(), True)["paths"], [ci.MAP]
        )

    def test_unchanged_guide_requires_current_scope_sections_and_receipt(self):
        destination = "archive/navigation.yml"
        (self.root / destination).parent.mkdir()
        self.git("mv", ".github/workflows/retired.yml", destination)
        scope = ci.guide_review(self.root, self.base, self.commit(), True)
        self.assertIn(destination, scope["paths"])
        record = {key: scope[key] for key in ("base_sha", "scope_sha256", "paths")}
        receipt = "review/issue-999/workflow-guide-evidence.json"
        record.update(
            sections=["Agents"],
            reviewer_execution="",
            rationale="The updated invocation preserves the existing isolated reviewer launch semantics.",
        )
        self.write(receipt, json.dumps(record))
        with self.assertRaisesRegex(ValueError, "reviewer execution"):
            ci.guide_review(self.root, self.base, self.commit())
        record["reviewer_execution"] = "recorded execution QA-999"
        self.write(
            ci.GUIDE,
            (self.root / ci.GUIDE).read_text()
            + "\n<!-- [example]: hidden\n## Phantom heading\n-->\n",
        )
        self.write(receipt, json.dumps({**record, "sections": ["Phantom heading"]}))
        with self.assertRaisesRegex(ValueError, "actual guide section titles"):
            ci.guide_review(self.root, self.base, self.commit())
        self.write(receipt, json.dumps(record))
        self.assertEqual(
            ci.guide_review(self.root, self.base, self.commit())["decision"], "reviewed-unchanged"
        )
        self.write(destination, "obsolete workflow\n# edit\n")
        with self.assertRaisesRegex(ValueError, "current review"):
            ci.guide_review(self.root, self.base, self.commit())

    def test_guide_cannot_be_removed(self):
        (self.root / ci.GUIDE).unlink()
        with self.assertRaisesRegex(ValueError, "missing or empty"):
            ci.guide_review(self.root, self.base, self.commit())


if __name__ == "__main__":
    unittest.main()
