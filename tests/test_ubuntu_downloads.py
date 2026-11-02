"""Signed-source preservation, failure boundaries and actual CI installer wiring."""

import importlib.util
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools/quality/ubuntu_downloads.py"
SPEC = importlib.util.spec_from_file_location("ubuntu_downloads", SOURCE)
DOWNLOADS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DOWNLOADS)


def verify_job(text, name, engines, *, preview=False):
    starts = list(re.finditer(r"^  ([\w-]+):\s*$", text, re.MULTILINE))
    matches = [index for index, match in enumerate(starts) if match[1] == name]
    if len(matches) != 1:
        raise AssertionError("Missing or ambiguous job " + name)
    index = matches[0]
    end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
    body = text[starts[index].end() : end]
    steps = re.split(r"^      - ", body, flags=re.MULTILINE)[1:]
    helper = [
        index
        for index, step in enumerate(steps)
        if re.search(
            r"^        run: sudo python3 tools/quality/ubuntu_downloads\.py$",
            step,
            re.MULTILINE,
        )
    ]
    installs = [
        index
        for index, step in enumerate(steps)
        if re.search(
            r"^          tools/quality/toolchain/node_modules/\.bin/playwright "
            + r"install(?: --with-deps|-deps) "
            + re.escape(engines)
            + r"$",
            step,
            re.MULTILINE,
        )
        or "        run: tools/quality/toolchain/node_modules/.bin/playwright "
        + "install-deps "
        + engines
        + "\n"
        in step
    ]
    if len(helper) != 1 or len(installs) != 1 or helper[0] >= installs[0]:
        raise AssertionError("Helper must execute once before engine dependency installation")
    conditions = [line.strip() for line in steps[helper[0]].splitlines() if "if:" in line]
    expected = ["if: needs.target.outputs.prototype != 'true'"] if preview else []
    if conditions != expected or "continue-on-error:" in steps[helper[0]]:
        raise AssertionError("Helper cannot be skipped or ignored before required installation")
    expected_limit = "timeout-minutes: 10" if preview else "timeout-minutes: 15"
    if name == "linux":
        expected_limit = "timeout-minutes: 45"
    if re.findall(r"^    timeout-minutes: [0-9]+$", body, re.MULTILINE) != [
        "    " + expected_limit
    ]:
        raise AssertionError("Existing job deadline changed")


class UbuntuDownloadsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "apt"
        (self.root / "sources.list.d").mkdir(parents=True)
        (self.root / "apt.conf.d").mkdir()

    def write(self, relative, text):
        target = self.root / relative
        target.write_text(text, encoding="utf-8")
        return target

    def snapshot(self):
        return {
            path.relative_to(self.root).as_posix(): path.read_bytes()
            for path in self.root.rglob("*")
            if path.is_file() and not path.is_symlink()
        }

    def test_sources_and_mirror_lists_preserve_signed_metadata(self):
        direct = self.write(
            "sources.list",
            "deb [arch=amd64 signed-by=/usr/share/keyrings/ubuntu.gpg] "
            "http://azure.archive.ubuntu.com/ubuntu/ noble main universe\n",
        )
        deb822 = self.write(
            "sources.list.d/ubuntu.sources",
            "Types: deb\nURIs: mirror+file:///etc/apt/alternate.txt\n"
            "Suites: noble noble-updates noble-security\nComponents: main universe\n"
            "Architectures: amd64\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n",
        )
        mirror = self.write("alternate.txt", "https://azure.archive.ubuntu.com/ubuntu priority:1\n")
        default = self.write("apt-mirrors.txt", "http://azure.archive.ubuntu.com/ubuntu\n")
        before = self.snapshot()
        result = DOWNLOADS.prepare(self.root)
        self.assertEqual(set(result["changedSources"]), {str(direct), str(mirror), str(default)})
        for relative, original in before.items():
            expected = original.replace(
                b"http://azure.archive.ubuntu.com/ubuntu",
                b"https://archive.ubuntu.com/ubuntu",
            ).replace(
                b"https://azure.archive.ubuntu.com/ubuntu",
                b"https://archive.ubuntu.com/ubuntu",
            )
            self.assertEqual((self.root / relative).read_bytes(), expected)
        self.assertEqual(deb822.read_bytes(), before["sources.list.d/ubuntu.sources"])
        self.assertEqual(
            (self.root / "apt.conf.d/99-site-download-bounds").read_text(),
            DOWNLOADS.BOUNDS,
        )
        once = self.snapshot()
        self.assertEqual(DOWNLOADS.prepare(self.root)["changedSources"], [])
        self.assertEqual(self.snapshot(), once)

    def test_unrelated_and_lookalike_hosts_are_preserved(self):
        text = "\n".join(
            [
                "deb https://packages.microsoft.com/ubuntu/24.04/prod noble main",
                "deb https://azure.archive.ubuntu.com.evil/ubuntu noble main",
                "deb https://azure.archive.ubuntu.com/ubuntu-other noble main",
                "# mirror+file:/outside/comment-only.txt",
            ]
        )
        target = self.write("sources.list", text)
        self.assertEqual(DOWNLOADS.prepare(self.root)["changedSources"], [])
        self.assertEqual(target.read_text(), text)

    def test_invalid_later_reference_does_not_modify_valid_sources(self):
        for uri in [
            "/etc/apt/../outside",
            "/elsewhere/mirrors",
            "//host/etc/apt/list",
            "/etc/apt/missing",
        ]:
            with self.subTest(uri=uri):
                self.write(
                    "sources.list",
                    "deb http://azure.archive.ubuntu.com/ubuntu noble main\n",
                )
                self.write("sources.list.d/late.sources", "URIs: mirror+file:" + uri + "\n")
                before = self.snapshot()
                with self.assertRaises(ValueError):
                    DOWNLOADS.prepare(self.root)
                self.assertEqual(self.snapshot(), before)

    def test_symlinks_and_invalid_output_fail_before_writes(self):
        self.write("sources.list", "deb http://azure.archive.ubuntu.com/ubuntu noble main\n")
        outside = Path(self.temp.name) / "outside"
        outside.write_text("unchanged")
        for relative in [
            "sources.list.d/alias.sources",
            "apt-mirrors.txt",
            "apt.conf.d/99-site-download-bounds",
        ]:
            with self.subTest(relative=relative):
                target = self.root / relative
                target.symlink_to(outside)
                before = self.snapshot()
                with self.assertRaises(ValueError):
                    DOWNLOADS.prepare(self.root)
                self.assertEqual(self.snapshot(), before)
                self.assertEqual(outside.read_text(), "unchanged")
                target.unlink()
        mirror = self.root / "indirect"
        mirror.symlink_to(Path(self.temp.name), target_is_directory=True)
        self.write(
            "sources.list.d/ref.sources",
            "URIs: mirror+file:/etc/apt/indirect/outside\n",
        )
        with self.assertRaises(ValueError):
            DOWNLOADS.prepare(self.root)

    def test_production_cli_cannot_take_an_alternate_root(self):
        before = self.snapshot()
        result = subprocess.run(
            [sys.executable, str(SOURCE), str(self.root)],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("fixed /etc/apt root", result.stderr)
        self.assertEqual(self.snapshot(), before)

    def test_workflow_installer_order_and_preserved_commands(self):
        preview = (ROOT / ".github/workflows/site-color-review.yml").read_text()
        release = (ROOT / ".github/workflows/site-release-checks.yml").read_text()
        verify_job(preview, "smoke", "chromium", preview=True)
        verify_job(release, "staging", "chromium firefox")
        verify_job(release, "linux", "chromium firefox webkit")

    def test_workflow_oracle_detects_missing_skipped_and_late_helper(self):
        text = (ROOT / ".github/workflows/site-release-checks.yml").read_text()
        command = "        run: sudo python3 tools/quality/ubuntu_downloads.py\n"
        start = text.index("  staging:\n")
        end = text.index("  gate:\n", start)
        body = text[start:end]
        for replacement in [
            "        run: echo sudo python3 tools/quality/ubuntu_downloads.py\n",
            "        if: false\n" + command,
            "        run: |\n          echo helper-not-executed\n          #" + command,
        ]:
            with self.subTest(replacement=replacement):
                broken = text[:start] + body.replace(command, replacement) + text[end:]
                with self.assertRaises(AssertionError):
                    verify_job(broken, "staging", "chromium firefox")
        changed_budget = body.replace(
            "    timeout-minutes: 15\n",
            "    timeout-minutes: 99\n    # timeout-minutes: 15\n",
        )
        with self.assertRaises(AssertionError):
            verify_job(
                text[:start] + changed_budget + text[end:],
                "staging",
                "chromium firefox",
            )
        helper_start = body.index("      - name: Prepare bounded Ubuntu downloads\n")
        helper_end = body.index("      - name:", helper_start + 10)
        helper = body[helper_start:helper_end]
        late = body.replace(helper, "") + helper
        with self.assertRaises(AssertionError):
            verify_job(text[:start] + late + text[end:], "staging", "chromium firefox")


if __name__ == "__main__":
    unittest.main()
