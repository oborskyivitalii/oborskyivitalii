#!/usr/bin/env python3
"""Pinned browser archives. No CDN fallback and no consumer browser launch."""

import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import platform
import re
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
import urllib.parse
import urllib.request
import urllib.error
import zipfile

ROOT = Path(__file__).resolve().parents[2]
REPOSITORY = "oborskyivitalii/oborskyivitalii"
WORKFLOW = ".github/workflows/browser-archives.yml"
MAX_ARCHIVE = 2 * 1024**3
MAX_EXPANDED = 8 * 1024**3
MAX_FILES = 50000
PRODUCERS = [WORKFLOW, "tools/quality/browser-runtime.cjs", "tools/quality/browser_archives.py"]


def digest(value):
    return hashlib.sha256(value).hexdigest()


def file_hash(file):
    result = hashlib.sha256()
    with Path(file).open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def write_json(file, value):
    Path(file).parent.mkdir(parents=True, exist_ok=True)
    Path(file).write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def safe_name(name):
    require(
        isinstance(name, str) and name and "\\" not in name and ":" not in name,
        "Unsafe browser archive path",
    )
    require(
        not name.startswith("/") and not any(ord(char) < 32 for char in name),
        "Unsafe browser archive path",
    )
    require(
        all(part not in ("", ".", "..") for part in name.split("/")),
        "Unsafe browser archive component",
    )
    return name


def within(root, name):
    target = root.joinpath(*PurePosixPath(safe_name(name)).parts)
    require(target.resolve().is_relative_to(root.resolve()), "Browser archive path escapes root")
    return target


def system_identity():
    machine = platform.machine().lower()
    architecture = {"amd64": "x64", "x86_64": "x64", "aarch64": "arm64", "arm64": "arm64"}.get(
        machine
    )
    require(architecture is not None, "Unsupported browser architecture")
    if sys.platform == "linux":
        release = platform.freedesktop_os_release()
        operating_system = release["ID"] + "-" + release["VERSION_ID"]
    elif sys.platform == "darwin":
        operating_system = "macos-" + platform.mac_ver()[0].split(".")[0]
    elif sys.platform == "win32":
        operating_system = "windows-" + ".".join(platform.win32_ver()[1].split(".")[:3])
    else:
        raise ValueError("Unsupported browser operating system")
    return {"platform": sys.platform, "os": operating_system, "architecture": architecture}


def describe(browsers, browser_root, command="describe"):
    names = browsers.split(",") if isinstance(browsers, str) else browsers
    require(
        names and len(set(names)) == len(names) and set(names) <= {"chromium", "firefox", "webkit"},
        "Unknown or duplicate browser selection",
    )
    environment = {**os.environ, "PLAYWRIGHT_BROWSERS_PATH": str(browser_root)}
    raw = subprocess.check_output(
        ["node", str(ROOT / "tools/quality/browser-runtime.cjs"), command, ",".join(names)],
        env=environment,
        timeout=120,
    )
    return json.loads(raw)


def producer_identity():
    return {name: file_hash(ROOT / name) for name in PRODUCERS}


def identity(description):
    return {
        "schema": 1,
        "system": system_identity(),
        "packages": description["packages"],
        "registrySha256": description["registrySha256"],
        "browsers": description["browsers"],
    }


def inventory(root, normalize=False):
    rows = []
    for file in sorted(root.rglob("*")):
        relative = file.relative_to(root).as_posix()
        if relative == ".links" or relative.startswith(".links/"):
            continue
        safe_name(relative)
        mode = stat.S_IMODE(file.lstat().st_mode)
        if file.is_symlink():
            target = os.readlink(file)
            require(
                not os.path.isabs(target) and "\\" not in target, "Unsafe browser archive symlink"
            )
            require(file.resolve().is_relative_to(root.resolve()), "Browser symlink escapes root")
            rows.append({"path": relative, "kind": "symlink", "target": target})
        elif file.is_file():
            rows.append(
                {
                    "path": relative,
                    "kind": "file",
                    "size": file.stat().st_size,
                    "sha256": file_hash(file),
                    "mode": mode & ~0o022 if normalize and sys.platform != "win32" else mode,
                }
            )
        else:
            require(file.is_dir(), "Nonregular browser archive member")
    require(0 < len(rows) <= MAX_FILES, "Browser archive inventory bound")
    require(sum(row.get("size", 0) for row in rows) <= MAX_EXPANDED, "Browser expansion bound")
    return rows


def verify_tree(root, manifest):
    require(inventory(root) == manifest["files"], "Browser inventory, bytes, modes or links differ")
    for browser in manifest["identity"]["browsers"]:
        executable = within(root, browser["executable"])
        require(executable.is_file(), "Required browser executable missing")
        if sys.platform != "win32":
            require(os.access(executable, os.X_OK), "Browser executable permission missing")


def pack(options):
    browser_root = Path(options.directory).resolve()
    output = Path(options.output).resolve()
    require(not output.is_relative_to(browser_root), "Archive output overlaps browser input")
    description = describe(options.browsers, browser_root, "probe")
    source = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    require(
        not subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True).strip(),
        "Browser producer source must be clean",
    )
    manifest = {
        "schema": 1,
        "identity": identity(description),
        "producer": producer_identity(),
        "source": source,
        "launchProbe": description["launchProbe"],
        "files": inventory(browser_root, normalize=True),
    }
    manifest["key"] = digest(canonical(manifest["identity"]))
    output.mkdir(parents=True, exist_ok=True)
    archive = output / "browsers.tar.gz"
    with archive.open("wb") as raw, gzip.GzipFile(fileobj=raw, mode="wb", mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode="w|") as bundle:
            for row in manifest["files"]:
                file = browser_root / row["path"]
                info = bundle.gettarinfo(str(file), arcname=row["path"])
                info.uid = info.gid = info.mtime = 0
                info.uname = info.gname = ""
                if row["kind"] == "file":
                    info.mode = row["mode"]
                with file.open("rb") if row["kind"] == "file" else io.BytesIO() as stream:
                    bundle.addfile(info, stream if row["kind"] == "file" else None)
    require(archive.stat().st_size <= MAX_ARCHIVE, "Compressed browser archive bound")
    manifest["archiveSha256"] = file_hash(archive)
    with tempfile.TemporaryDirectory(prefix="browser-selfcheck-", dir=output.parent) as temporary:
        extract(archive, Path(temporary), manifest)
    write_json(output / "manifest.json", manifest)
    print(
        json.dumps(
            {
                "key": manifest["key"],
                "source": source,
                "archiveSha256": manifest["archiveSha256"],
                "files": len(manifest["files"]),
            }
        )
    )


class SecureRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, url):
        require(urllib.parse.urlparse(url).scheme == "https", "Non-HTTPS browser artifact redirect")
        return super().redirect_request(request, response, code, message, headers, url)


def request(url, token):
    require(url.startswith("https://api.github.com/"), "Unexpected browser artifact API")
    item = urllib.request.Request(
        url, headers={"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    )
    item.add_unredirected_header("Authorization", "Bearer " + token)
    try:
        return urllib.request.build_opener(SecureRedirect()).open(item, timeout=60)
    except urllib.error.HTTPError as error:
        if error.code in (404, 410) and "/actions/" in url:
            raise ValueError(
                "Pinned browser archive or seed is missing; run browser-archives.yml and pin its fresh record"
            ) from error
        raise


def api(path, token):
    with request("https://api.github.com/repos/" + REPOSITORY + path, token) as response:
        require("json" in response.headers.get("Content-Type", ""), "Expected GitHub JSON metadata")
        raw = response.read(4 * 1024 * 1024 + 1)
        require(len(raw) <= 4 * 1024 * 1024, "Browser artifact API response bound")
        return json.loads(raw)


def authenticate(record, token, provider=None):
    provider = provider or api
    run = provider(f'/actions/runs/{record["run"]}/attempts/{record["attempt"]}', token)
    require(
        run["status"] == "completed" and run["conclusion"] == "success",
        "Browser seed run failed or pending",
    )
    require(
        run["path"].split("@")[0] == WORKFLOW and run["head_sha"] == record["source"],
        "Wrong browser seed workflow or source",
    )
    require(run["event"] in ("workflow_dispatch", "pull_request"), "Unexpected browser seed event")
    for owner in (run["actor"]["login"], run["triggering_actor"]["login"]):
        require(owner == REPOSITORY.split("/")[0], "Browser preparation requires owner execution")
    require(run["head_repository"]["full_name"] == REPOSITORY, "Foreign browser seed repository")
    current = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    comparison = provider(f'/compare/{record["source"]}...{current}?per_page=1&page=2', token)
    require(
        comparison["status"] in ("ahead", "identical"),
        "Browser seed is outside current source history",
    )
    artifact = provider(f'/actions/artifacts/{record["artifact"]}', token)
    require(
        not artifact["expired"] and artifact["workflow_run"]["id"] == record["run"],
        "Browser archive expired or belongs to another run; refresh browser-archives.yml",
    )
    require(
        artifact["name"] == record["name"] and artifact["digest"] == record["uploadDigest"],
        "Browser artifact name or native digest differs",
    )
    require(
        artifact["workflow_run"]["head_sha"] == record["source"], "Wrong browser artifact source"
    )
    require(0 < artifact["size_in_bytes"] <= MAX_ARCHIVE, "Browser artifact size bound")


def download(record, token, destination):
    hasher = hashlib.sha256()
    size = 0
    with request(
        f'https://api.github.com/repos/{REPOSITORY}/actions/artifacts/{record["artifact"]}/zip',
        token,
    ) as response:
        require(
            "html" not in response.headers.get("Content-Type", "").lower(),
            "Browser supply returned HTML instead of an archive",
        )
        with destination.open("wb") as stream:
            while block := response.read(1024 * 1024):
                size += len(block)
                require(size <= MAX_ARCHIVE, "Browser download size bound")
                hasher.update(block)
                stream.write(block)
    require(
        "sha256:" + hasher.hexdigest() == record["uploadDigest"],
        "Browser native ZIP digest mismatch",
    )


def unpack_package(archive, output, record):
    with zipfile.ZipFile(archive) as bundle:
        names = bundle.namelist()
        require(
            sorted(names) == ["browsers.tar.gz", "manifest.json"],
            "Unexpected browser package inventory",
        )
        require(
            sum(row.file_size for row in bundle.infolist()) <= MAX_ARCHIVE,
            "Browser ZIP expansion bound",
        )
        for name in names:
            with bundle.open(name) as source, (output / name).open("wb") as target:
                shutil.copyfileobj(source, target)
    require(
        file_hash(output / "manifest.json") == record["manifestSha256"],
        "Browser manifest digest mismatch",
    )
    manifest = json.loads((output / "manifest.json").read_text(encoding="utf-8"))
    require(
        file_hash(output / "browsers.tar.gz")
        == record["archiveSha256"]
        == manifest["archiveSha256"],
        "Browser archive digest mismatch",
    )
    require(
        manifest["key"] == record["key"] == digest(canonical(manifest["identity"])),
        "Browser archive key mismatch",
    )
    require(
        manifest["producer"] == producer_identity() and manifest["source"] == record["source"],
        "Browser producer identity differs",
    )
    return manifest


def extract(archive, root, manifest):
    expected = {row["path"]: row for row in manifest["files"]}
    require(
        len(expected) == len(manifest["files"]) and 0 < len(expected) <= MAX_FILES,
        "Duplicate or excessive browser inventory",
    )
    with tarfile.open(archive, "r:gz") as bundle:
        rows, names, size = [], set(), 0
        for row in bundle:
            require(len(rows) < MAX_FILES, "Browser TAR member bound")
            size += row.size
            require(size <= MAX_EXPANDED, "Browser TAR expansion bound")
            require(row.name not in names, "Duplicate browser TAR member")
            names.add(row.name)
            within(root, row.name)
            require(
                row.name in expected and (row.isfile() or row.issym()), "Unsafe browser TAR member"
            )
            entry = expected[row.name]
            require(row.issym() == (entry["kind"] == "symlink"), "Browser TAR member type differs")
            if row.issym():
                require(
                    row.linkname == entry["target"] and not os.path.isabs(row.linkname),
                    "Browser link differs",
                )
            else:
                require(
                    row.size == entry["size"] and stat.S_IMODE(row.mode) == entry["mode"],
                    "Browser file metadata differs",
                )
            rows.append(row)
        require(len(rows) == len(expected), "Browser TAR inventory differs")
        bundle.extractall(root, members=rows, filter="data")
    verify_tree(root, manifest)


def select_record(config, description):
    require(
        config["schema"] == 1
        and config["repository"] == REPOSITORY
        and config["workflow"] == WORKFLOW,
        "Unknown browser archive registry",
    )
    selected = []
    expected = identity(description)
    for row in config["archives"]:
        source = row["identity"]
        required = {item["name"] for item in expected["browsers"]}
        available = {item["name"] for item in source["browsers"]}
        if (
            all(source[key] == expected[key] for key in ["system", "packages", "registrySha256"])
            and required <= available
        ):
            require(
                all(item in source["browsers"] for item in expected["browsers"]),
                "Browser revision or executable differs",
            )
            selected.append(row)
    require(
        len(selected) == 1,
        "No unique pinned browser archive for this toolchain/OS; run browser-archives.yml and pin its record",
    )
    record = selected[0]
    for name in ("source",):
        require(re.fullmatch(r"[a-f0-9]{40}", record[name]) is not None, "Invalid browser source")
    for name in ("archiveSha256", "manifestSha256", "key"):
        require(re.fullmatch(r"[a-f0-9]{64}", record[name]) is not None, "Invalid browser digest")
    require(
        re.fullmatch(r"sha256:[a-f0-9]{64}", record["uploadDigest"]) is not None,
        "Invalid native digest",
    )
    require(
        all(
            isinstance(record[name], int) and record[name] > 0
            for name in ["artifact", "run", "attempt"]
        ),
        "Invalid browser artifact identity",
    )
    return record


def restore(options):
    destination = Path(options.directory).resolve()
    require(
        not destination.exists(), "Browser destination already exists; use a fresh setup directory"
    )
    description = describe(options.browsers, destination)
    config = json.loads((ROOT / "tools/quality/browser-archives.json").read_text(encoding="utf-8"))
    record = select_record(config, description)
    token = os.environ.get("GITHUB_TOKEN", "")
    require(token, "Browser artifact metadata requires the scoped read token")
    authenticate(record, token)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="browser-supply-", dir=destination.parent) as temporary:
        temporary = Path(temporary)
        download(record, token, temporary / "native.zip")
        manifest = unpack_package(temporary / "native.zip", temporary, record)
        require(manifest["identity"] == record["identity"], "Pinned browser metadata differs")
        extracted = temporary / "browsers"
        extracted.mkdir()
        extract(temporary / "browsers.tar.gz", extracted, manifest)
        extracted.rename(destination)
    github_env = os.environ.get("GITHUB_ENV")
    if github_env:
        with open(github_env, "a", encoding="utf-8") as stream:
            stream.write("PLAYWRIGHT_BROWSERS_PATH=" + str(destination) + "\n")
    return {
        "schema": 1,
        "pass": True,
        "key": record["key"],
        "artifact": record["artifact"],
        "uploadDigest": record["uploadDigest"],
        "directory": str(destination),
        "browsers": options.browsers.split(","),
        "consumerLaunches": 0,
    }


def record(options):
    directory = Path(options.directory)
    manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
    value = {key: manifest[key] for key in ["key", "identity", "source", "archiveSha256"]}
    value.update(
        {
            "manifestSha256": file_hash(directory / "manifest.json"),
            "artifact": int(options.artifact),
            "uploadDigest": options.digest,
            "run": int(os.environ["GITHUB_RUN_ID"]),
            "attempt": int(os.environ["GITHUB_RUN_ATTEMPT"]),
            "name": options.name,
        }
    )
    write_json(options.output, value)
    print(json.dumps(value))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["pack", "restore", "record"])
    parser.add_argument("--directory", required=True)
    parser.add_argument("--browsers")
    parser.add_argument("--output")
    parser.add_argument("--artifact")
    parser.add_argument("--digest")
    parser.add_argument("--name")
    options = parser.parse_args()
    report = {"schema": 1, "pass": False, "consumerLaunches": 0}
    try:
        if options.command == "pack":
            pack(options)
        elif options.command == "record":
            record(options)
        else:
            report = restore(options)
            print(json.dumps(report))
    except Exception as error:
        report["error"] = str(error)
        print("Browser preparation blocked: " + str(error), file=sys.stderr)
        return 1
    finally:
        if options.command == "restore":
            write_json(
                os.environ.get("BROWSER_ARCHIVE_REPORT", str(ROOT / "browser-setup-report.json")),
                report,
            )
    return 0


if __name__ == "__main__":
    sys.exit(main())
