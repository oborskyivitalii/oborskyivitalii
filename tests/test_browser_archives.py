"""Browser supply integrity and origin; no browser download or launch in consumers."""

import copy
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import tarfile
import tempfile
import unittest
from unittest.mock import patch
import urllib.error
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "browser_archives", ROOT / "tools/quality/browser_archives.py"
)
SUPPLY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SUPPLY)


class BrowserArchivesTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.payload = self.root / "payload"
        (self.payload / "browser").mkdir(parents=True)
        executable = self.payload / "browser/chrome"
        executable.write_bytes(b"controlled test executable, never launched\n")
        executable.chmod(0o755)
        self.description = {
            "packages": {"playwright": {"version": "1.63.0", "integrity": "controlled"}},
            "registrySha256": "b" * 64,
            "browsers": [
                {
                    "name": "chromium",
                    "revision": "1243",
                    "version": "153.0.8010.12",
                    "executable": "browser/chrome",
                }
            ],
        }
        self.manifest = {
            "schema": 1,
            "identity": SUPPLY.identity(self.description),
            "producer": SUPPLY.producer_identity(),
            "source": "a" * 40,
            "files": SUPPLY.inventory(self.payload),
        }
        self.manifest["key"] = SUPPLY.digest(SUPPLY.canonical(self.manifest["identity"]))

    def tar(self, name="browsers.tar.gz", mutate=None):
        archive = self.root / name
        with tarfile.open(archive, "w:gz") as bundle:
            for row in self.manifest["files"]:
                info = bundle.gettarinfo(str(self.payload / row["path"]), arcname=row["path"])
                info.mode = row["mode"]
                if mutate:
                    mutate(info)
                with (self.payload / row["path"]).open("rb") as stream:
                    bundle.addfile(info, stream)
        return archive

    def record(self):
        return {
            "key": self.manifest["key"],
            "identity": self.manifest["identity"],
            "source": "a" * 40,
            "archiveSha256": "c" * 64,
            "manifestSha256": "d" * 64,
            "artifact": 11,
            "run": 12,
            "attempt": 1,
            "name": "controlled-browser-archive",
            "uploadDigest": "sha256:" + "e" * 64,
        }

    def test_exact_payload_extraction_preserves_required_executable_and_bytes(self):
        output = self.root / "restored"
        output.mkdir()
        SUPPLY.extract(self.tar(), output, self.manifest)
        self.assertEqual(
            (output / "browser/chrome").read_bytes(),
            b"controlled test executable, never launched\n",
        )
        self.assertEqual(SUPPLY.inventory(output), self.manifest["files"])
        self.assertTrue((output / "browser/chrome").stat().st_mode & stat.S_IXUSR)

    def test_wrong_bytes_missing_executable_and_unsafe_paths_are_rejected(self):
        archive = self.tar()
        for change in [
            lambda m: m["files"][0].update(sha256="0" * 64),
            lambda m: m["identity"]["browsers"][0].update(executable="browser/missing"),
            lambda m: m["files"].append(copy.deepcopy(m["files"][0])),
        ]:
            manifest = copy.deepcopy(self.manifest)
            change(manifest)
            with tempfile.TemporaryDirectory(dir=self.root) as directory:
                with self.assertRaises(ValueError):
                    SUPPLY.extract(archive, Path(directory), manifest)
        for name in [
            "../escaped",
            "/absolute",
            "C:/drive",
            "browser/../../escaped",
            "browser\\escaped",
        ]:
            bad = self.tar("bad.tar.gz", lambda info: setattr(info, "name", name))
            with tempfile.TemporaryDirectory(dir=self.root) as directory:
                with self.assertRaises(ValueError):
                    SUPPLY.extract(bad, Path(directory), self.manifest)
        self.assertFalse((self.root.parent / "escaped").exists())

    def test_symlink_escape_is_rejected_without_following_it(self):
        archive = self.root / "link.tar.gz"
        manifest = copy.deepcopy(self.manifest)
        manifest["files"] = [{"path": "browser/link", "kind": "symlink", "target": "../../outside"}]
        with tarfile.open(archive, "w:gz") as bundle:
            item = tarfile.TarInfo("browser/link")
            item.type = tarfile.SYMTYPE
            item.linkname = "../../outside"
            bundle.addfile(item)
        output = self.root / "link-output"
        output.mkdir()
        with self.assertRaises((ValueError, tarfile.TarError)):
            SUPPLY.extract(archive, output, manifest)

    def test_html_and_substituted_package_or_manifest_are_rejected(self):
        html = self.root / "html.zip"
        html.write_bytes(b"<html><h1>Site Unavailable</h1></html>")
        with self.assertRaises(zipfile.BadZipFile):
            SUPPLY.unpack_package(html, self.root, self.record())
        archive = self.root / "substituted.zip"
        with zipfile.ZipFile(archive, "w") as bundle:
            bundle.writestr("manifest.json", json.dumps(self.manifest))
            bundle.writestr("browsers.tar.gz", b"substituted")
        with self.assertRaisesRegex(ValueError, "manifest digest"):
            SUPPLY.unpack_package(archive, self.root, self.record())

    def test_registry_requires_exact_platform_packages_revisions_and_one_pin(self):
        config = {
            "schema": 1,
            "repository": SUPPLY.REPOSITORY,
            "workflow": SUPPLY.WORKFLOW,
            "archives": [self.record()],
        }
        self.assertEqual(SUPPLY.select_record(config, self.description)["artifact"], 11)
        for change in [
            lambda r: r["identity"]["system"].update(architecture="different"),
            lambda r: r["identity"]["packages"]["playwright"].update(version="different"),
            lambda r: r["identity"]["browsers"][0].update(revision="different"),
            lambda r: r.update(uploadDigest="invalid"),
        ]:
            mutated = copy.deepcopy(config)
            change(mutated["archives"][0])
            with self.assertRaises(ValueError):
                SUPPLY.select_record(mutated, self.description)
        config["archives"].append(copy.deepcopy(config["archives"][0]))
        with self.assertRaisesRegex(ValueError, "unique pinned"):
            SUPPLY.select_record(config, self.description)

    def test_native_origin_rejects_wrong_actor_workflow_source_expiry_and_digest(self):
        record = self.record()
        run = {
            "status": "completed",
            "conclusion": "success",
            "path": SUPPLY.WORKFLOW,
            "head_sha": record["source"],
            "event": "workflow_dispatch",
            "actor": {"login": "oborskyivitalii"},
            "triggering_actor": {"login": "oborskyivitalii"},
            "head_repository": {"full_name": SUPPLY.REPOSITORY},
        }
        artifact = {
            "expired": False,
            "workflow_run": {"id": 12, "head_sha": record["source"]},
            "name": record["name"],
            "digest": record["uploadDigest"],
            "size_in_bytes": 100,
        }

        def provider(path, token):
            return (
                {"status": "ahead"}
                if path.startswith("/compare/")
                else artifact
                if "/artifacts/" in path
                else run
            )

        SUPPLY.authenticate(record, "controlled-token", provider)
        for target, name, value in [
            (run, "conclusion", "failure"),
            (run, "path", ".github/workflows/other.yml"),
            (run, "head_sha", "0" * 40),
            (run, "actor", {"login": "other"}),
            (artifact, "expired", True),
            (artifact, "digest", "sha256:" + "0" * 64),
        ]:
            original = target[name]
            target[name] = value
            with self.assertRaises(ValueError):
                SUPPLY.authenticate(record, "controlled-token", provider)
            target[name] = original

    def test_html_download_response_is_a_setup_failure_before_zip_or_browser(self):
        class Response(io.BytesIO):
            headers = {"Content-Type": "text/html", "Content-Length": "195"}

        with patch.object(
            SUPPLY, "request", return_value=Response(b"<html>Site Unavailable</html>")
        ):
            with self.assertRaisesRegex(ValueError, "HTML instead of an archive"):
                SUPPLY.download(self.record(), "controlled-token", self.root / "download.zip")
        self.assertFalse((self.root / "download.zip").exists())

    def test_complete_restore_exports_storage_and_corruption_leaves_no_install(self):
        repository = self.root / "repo"
        for name in SUPPLY.PRODUCERS:
            target = repository / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / name, target)
        subprocess.run(["git", "init", "-q", str(repository)], check=True)
        subprocess.run(["git", "add", "."], cwd=repository, check=True)
        subprocess.run(
            [
                "git",
                "-c",
                "user.name=Fixture",
                "-c",
                "user.email=fixture@example.invalid",
                "commit",
                "-qm",
                "controlled browser source",
            ],
            cwd=repository,
            check=True,
        )
        source = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=repository, text=True
        ).strip()
        archive = self.tar()
        self.manifest.update(source=source, archiveSha256=SUPPLY.file_hash(archive))
        manifest_bytes = (json.dumps(self.manifest) + "\n").encode()
        payload = io.BytesIO()
        with zipfile.ZipFile(payload, "w") as bundle:
            bundle.writestr("manifest.json", manifest_bytes)
            bundle.write(archive, "browsers.tar.gz")
        record = self.record()
        record.update(
            source=source,
            archiveSha256=SUPPLY.file_hash(archive),
            manifestSha256=SUPPLY.digest(manifest_bytes),
            uploadDigest="sha256:" + SUPPLY.digest(payload.getvalue()),
        )
        config = {
            "schema": 1,
            "repository": SUPPLY.REPOSITORY,
            "workflow": SUPPLY.WORKFLOW,
            "archives": [record],
        }
        SUPPLY.write_json(repository / "tools/quality/browser-archives.json", config)
        run = {
            "status": "completed",
            "conclusion": "success",
            "path": SUPPLY.WORKFLOW,
            "head_sha": source,
            "event": "workflow_dispatch",
            "actor": {"login": "oborskyivitalii"},
            "triggering_actor": {"login": "oborskyivitalii"},
            "head_repository": {"full_name": SUPPLY.REPOSITORY},
        }
        native = {
            "expired": False,
            "workflow_run": {"id": 12, "head_sha": source},
            "name": record["name"],
            "digest": record["uploadDigest"],
            "size_in_bytes": len(payload.getvalue()),
        }

        def provider(path, token):
            return (
                {"status": "identical"}
                if path.startswith("/compare/")
                else native
                if "/artifacts/" in path
                else run
            )

        class Response(io.BytesIO):
            headers = {"Content-Type": "application/zip"}

        options = type(
            "Options", (), {"directory": str(self.root / "installed"), "browsers": "chromium"}
        )()
        environment = self.root / "github-env"
        with (
            patch.object(SUPPLY, "ROOT", repository),
            patch.object(SUPPLY, "api", side_effect=provider),
            patch.object(SUPPLY, "describe", return_value=self.description) as describe,
            patch.dict(os.environ, GITHUB_TOKEN="controlled-token", GITHUB_ENV=str(environment)),
            patch.object(SUPPLY, "request", return_value=Response(payload.getvalue())),
        ):
            result = SUPPLY.restore(options)
            self.assertEqual(result["consumerLaunches"], 0)
            self.assertEqual(
                (Path(options.directory) / "browser/chrome").read_bytes(),
                b"controlled test executable, never launched\n",
            )
            self.assertEqual(
                environment.read_text(), "PLAYWRIGHT_BROWSERS_PATH=" + options.directory + "\n"
            )
            describe.assert_called_once()
        options.directory = str(self.root / "corrupt-install")
        environment.unlink()
        with (
            patch.object(SUPPLY, "ROOT", repository),
            patch.object(SUPPLY, "api", side_effect=provider),
            patch.object(SUPPLY, "describe", return_value=self.description),
            patch.dict(os.environ, GITHUB_TOKEN="controlled-token", GITHUB_ENV=str(environment)),
            patch.object(SUPPLY, "request", return_value=Response(payload.getvalue()[:-5])),
        ):
            with self.assertRaisesRegex(ValueError, "native ZIP digest"):
                SUPPLY.restore(options)
        self.assertFalse(Path(options.directory).exists())
        self.assertFalse(environment.exists())
        self.assertEqual(list(self.root.glob("browser-supply-*")), [])

    def test_deleted_supply_names_refresh_but_authentication_failures_remain_separate(self):
        url = "https://api.github.com/repos/oborskyivitalii/oborskyivitalii/actions/artifacts/11"
        for code in [404, 410, 401, 403]:
            opener = type("Opener", (), {"open": lambda *args, **kwargs: None})()
            error = urllib.error.HTTPError(url, code, "controlled failure", {}, None)
            with (
                patch.object(SUPPLY.urllib.request, "build_opener", return_value=opener),
                patch.object(opener, "open", side_effect=error),
            ):
                if code in (404, 410):
                    with self.assertRaisesRegex(ValueError, "browser-archives.yml and pin"):
                        SUPPLY.request(url, "controlled-token")
                else:
                    with self.assertRaises(urllib.error.HTTPError) as caught:
                        SUPPLY.request(url, "controlled-token")
                    self.assertEqual(caught.exception.code, code)


if __name__ == "__main__":
    unittest.main()
