"""Issue219 selects the development-environment contracts; host trials stay external."""

import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Issue219AcceptanceTests(unittest.TestCase):
    def test_container_and_command_contracts(self):
        timeout_ms = int(
            subprocess.check_output(
                ["node", "-p", "require('./tools/quality/source-tests.cjs').wrapperTimeout()"],
                cwd=ROOT,
                text=True,
                timeout=10,
            )
        )
        script = """
const runner = require('./tools/quality/source-tests.cjs');
process.stdout.write(JSON.stringify(runner.run(process.cwd(), {
  profile: 'issue219',
  modules: ['tests/dev-environment.test.cjs'],
})));
"""
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
            timeout=timeout_ms / 1000,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["status"], "passed")
        self.assertGreater(report["total"], 0)
        self.assertEqual(report["passed"], report["total"])
        for key in ("failed", "cancelled", "skipped", "todo"):
            self.assertEqual(report[key], 0)

    def test_container_workflow_runs_the_shared_commands(self):
        workflow = (ROOT / ".github/workflows/dev-environment.yml").read_text()
        self.assertIn("--file .devcontainer/Containerfile", workflow)
        for command in ("doctor", "setup", "check"):
            self.assertIn("node tools/dev/cli.cjs " + command, workflow)
        self.assertIn("persist-credentials: false", workflow)
        self.assertNotRegex(workflow, r"secrets\.")

    def test_vendor_neutral_entry_and_guide(self):
        bootstrap = (ROOT / "PROJECT-BOOTSTRAP.md").read_text()
        self.assertNotIn("ChatGPT-проєкту", bootstrap)
        self.assertIn("будь-якого AI-асистента", bootstrap)
        self.assertIn("guides/DEV-ENVIRONMENT.md", bootstrap)
        guide = (ROOT / "guides/DEV-ENVIRONMENT.md").read_text()
        hosts = re.findall(r"Codespaces|Gitpod|Coder|Daytona|DevPod|Docker or Podman", guide)
        self.assertGreaterEqual(len(set(hosts)), 3)
        for owner in ("SITE-STAGING.md", "SITE-PRODUCTION.md", "`docs/`"):
            self.assertIn(owner, guide)
