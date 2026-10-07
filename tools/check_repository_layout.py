#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Issue #33 layout/locator invariants; no semantic or live acceptance claim."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

BASE = "3ca14c54824ac6b9e7225bc88429b4b8fb3bcf10"
REPOSITORY = "oborskyivitalii/oborskyivitalii"
LAYOUT = ".github/repository-layout.json"
ARCHIVE = "review/root-history-20261007/manifest.json"
ROOT_FILES = {".gitattributes", ".gitignore", "README.md", "AGENTS.md",
              "CONTRIBUTING.md", "MEMORY.md", "PROJECT-BOOTSTRAP.md", "REPOSITORY-MAP.md"}
REQUIRED_PRESERVATION = {"BACKLOG.md": "archive", "SOL-HANDOFF.md": "archive",
                         "SITE-OPERATIONS.md": "archive", "SITE-VISUAL-REVIEW.md": "archive",
                         "SITE-ROADMAP.md": "replace", "SITE-CONTENT-REVIEW.md": "replace"}
PROTECTED = ["site", "docs", "tools/site", "tools/quality", "tools/staging"]
LOCATOR_FILES = {"site/README.md": "../", "tools/quality/README.md": "../../",
                 ".github/workflows/site-color-review.yml": ""}
NAVIGATION = ".github/workflows/navigation.yml"
FULL_WORKFLOW = ".github/workflows/site-release-checks.yml"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def file_path(root, path):
    require(isinstance(path, str) and path and not Path(path).is_absolute()
            and all(part not in {"", ".", ".."} for part in path.split("/")),
            f"Unsafe layout path: {path}")
    current = root
    for part in path.split("/"):
        current /= part
        require(not current.is_symlink(), f"Symlink layout path: {path}")
    require(current.is_file(), f"Missing layout file: {path}")
    return current


def read_json(root, path):
    return json.loads(file_path(root, path).read_text(encoding="utf-8"))


def blob_digest(content):
    return hashlib.sha1(b"blob " + str(len(content)).encode() + b"\0" + content).hexdigest()


def baseline_entries(root, paths=(), recursive=True):
    argv = ["git", "-C", str(root), "ls-tree", "-z"]
    if recursive:
        argv.append("-r")
    argv.extend([BASE, "--", *paths])
    records = subprocess.check_output(argv).split(b"\0")
    return {record.split(b"\t", 1)[1].decode(): record.split(b" ")[2].split(b"\t")[0].decode()
            for record in records if record and record.split(b" ")[1] == b"blob"}


def baseline_bytes(root, path):
    return subprocess.check_output(["git", "-C", str(root), "show", f"{BASE}:{path}"])


def validate_bootstrap(body):
    require(0 < len(body) <= 1000, "Bootstrap character bound exceeded or empty")
    require(len([line for line in body.splitlines() if line.strip()]) <= 12,
            "Bootstrap nonempty line bound exceeded")
    for route in [REPOSITORY, "README.md", "AGENTS.md", "REPOSITORY-MAP.md", "MEMORY.md"]:
        require(route in body, f"Bootstrap missing route: {route}")
    require(re.search(r"\brefs\b", body, re.I) and body.count("AGENTS.md") >= 2,
            "Bootstrap omits live refs or scoped instruction route")
    # Language and absence of duplicated semantic policy require independent review.


def validate_layout(root, data, original_root):
    require(data.get("schema_version") == 1 and data.get("issue") == 33
            and data.get("base_commit") == BASE, "Layout identity mismatch")
    declared = data.get("root_files", [])
    require(len(declared) == len(set(declared)) and set(declared) == ROOT_FILES,
            "Root file contract mismatch")
    # A linked Git worktree uses an infrastructure .git file, not a root document.
    actual = {path.name for path in root.iterdir() if not path.is_dir() and path.name != ".git"}
    require(actual == ROOT_FILES, f"Unexpected/missing root files: {sorted(actual ^ ROOT_FILES)}")
    dispositions = data.get("dispositions", {})
    require(set(dispositions) == set(original_root), "Incomplete original root dispositions")
    preserved_dispositions(data)
    destinations = []
    for source, item in dispositions.items():
        treatment, destination = item.get("treatment"), item.get("destination")
        require(treatment in {"keep", "move", "archive", "replace"}, f"Invalid disposition: {source}")
        file_path(root, destination)
        destinations.append(destination)
        if treatment == "keep":
            require(source in ROOT_FILES and destination == source, f"Invalid retained root: {source}")
        else:
            require(source not in ROOT_FILES and not (root / source).exists(), f"Retired root still active: {source}")
            prefix = "review/root-history-20261007/" if treatment == "archive" else "guides/"
            require(destination == prefix + source, f"Noncanonical destination: {source}")
        if treatment in {"archive", "replace"}:
            require(item.get("archive_path") == "review/root-history-20261007/" + source,
                    f"Missing preserved original: {source}")
            file_path(root, item["archive_path"])
        else:
            require("archive_path" not in item, f"Unexpected archive disposition: {source}")
    require(len(set(destinations)) == len(destinations), "Competing root destinations")
    return dispositions


def preserved_dispositions(data):
    dispositions = data.get("dispositions", {})
    require({source: item.get("treatment") for source, item in dispositions.items()
             if item.get("treatment") in {"archive", "replace"}} == REQUIRED_PRESERVATION,
            "Required six-original preservation dispositions changed")
    return {source: dispositions[source] for source in REQUIRED_PRESERVATION}


def validate_archives(root, data, manifest, original_blobs):
    require(manifest.get("schema_version") == 1 and manifest.get("source_commit") == BASE,
            "Archive source identity mismatch")
    expected = preserved_dispositions(data)
    records = manifest.get("records", [])
    require(len(records) == len(expected) and {row["original_path"] for row in records} == set(expected),
            "Archive manifest coverage mismatch")
    for row in records:
        source = row["original_path"]
        require(row["archive_path"] == expected[source]["archive_path"], f"Wrong original-location route: {source}")
        content = file_path(root, row["archive_path"]).read_bytes()
        require(row["git_blob"] == original_blobs[source] == blob_digest(content), f"Archive blob mismatch: {source}")
        require(row["sha256"] == hashlib.sha256(content).hexdigest(), f"Archive SHA-256 mismatch: {source}")
        require(row["source_url"] == f"https://github.com/{REPOSITORY}/blob/{BASE}/{source}",
                f"Archive source URL is not immutable: {source}")
        owner = row["current_owner"]
        require(owner in ROOT_FILES or owner.startswith("guides/"), f"Archived instruction owner: {source}")
        file_path(root, owner)
        if expected[source]["treatment"] == "replace":
            require(owner == expected[source]["destination"], f"Replacement owner mismatch: {source}")


def active_markdown(root, body, strip_inline_code=True):
    path = root / "tools/repository_intelligence.py"
    spec = importlib.util.spec_from_file_location("layout_ri", path)
    module = importlib.util.module_from_spec(spec)
    exec(compile(path.read_bytes(), str(path), "exec"), module.__dict__)
    visible = module.active_markdown(body)
    return re.sub(r"(`+)(.*?)\1", "", visible) if strip_inline_code else visible


class HTMLAnchors(HTMLParser):
    def __init__(self):
        super().__init__()
        self.anchors = set()

    def handle_starttag(self, tag, attributes):
        self.anchors.update(value for name, value in attributes
                            if value is not None and (name == "id" or (tag == "a" and name == "name")))


def document_anchors(root, path):
    body = path.read_text(encoding="utf-8")
    html = HTMLAnchors()
    html.feed(body)
    anchors = html.anchors
    if path.suffix == ".md":
        counts = {}
        for heading in re.findall(r"^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$", active_markdown(root, body, False), re.M):
            heading = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", heading)
            heading = re.sub(r"<[^>]*>", "", heading).lower()
            slug = "".join(character for character in heading
                           if character in "-_" or not unicodedata.category(character).startswith(("P", "S", "C")))
            slug = slug.replace(" ", "-")
            number = counts.get(slug, 0)
            anchors.add(slug + (f"-{number}" if number else ""))
            counts[slug] = number + 1
    return anchors


def local_markdown_targets(body):
    """Inline and used full/collapsed/reference Markdown links; URLs stay external."""
    definitions = {match.group(1).strip().casefold(): match.group(2)
                   for match in re.finditer(r"^ {0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?", body, re.M)}
    for match in re.finditer(r"!?\[[^\]]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+[^)]*)?\)", body):
        yield match.group(1).strip("<>")
    no_definitions = re.sub(r"^ {0,3}\[[^\]]+\]:.*$", "", body, flags=re.M)
    for match in re.finditer(r"!?\[([^\]]+)\](?:\[([^\]]*)\])?(?![\[(])", no_definitions):
        key = (match.group(2) or match.group(1)).strip().casefold()
        if key in definitions:
            yield definitions[key]


def validate_links(root, data):
    declared = data.get("active_markdown", [])
    require(len(declared) == len(set(declared)), "Duplicate active Markdown routes")
    required = {path for path in ROOT_FILES if path.endswith(".md")}
    required.update(path.relative_to(root).as_posix() for path in (root / "guides").rglob("*.md"))
    required.update(path.relative_to(root).as_posix() for path in (root / ".github").glob("*.md"))
    required.update(path.relative_to(root).as_posix() for path in (root / ".github/ISSUE_TEMPLATE").glob("*.md"))
    required.update({"site/README.md", "tools/quality/README.md", "review/REVIEW-TEMPLATE.md",
                     "review/root-history-20261007/README.md"})
    require(required <= set(declared), f"Omitted active Markdown: {sorted(required - set(declared))}")
    resolved = root.resolve()
    count = 0
    for source in declared:
        require(source.endswith(".md"), f"Non-Markdown active source: {source}")
        path = file_path(root, source)
        for target in local_markdown_targets(active_markdown(root, path.read_text(encoding="utf-8"))):
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc:
                continue
            destination = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path.resolve()
            require(destination.is_relative_to(resolved), f"Local link escapes repository: {source} -> {target}")
            require(destination.exists(), f"Broken active local link: {source} -> {target}")
            if parsed.fragment and destination.suffix in {".md", ".html"}:
                require(unquote(parsed.fragment) in document_anchors(root, destination),
                        f"Broken active local fragment: {source} -> {target}")
            count += 1
    require(count > 0, "No local links accounted")
    return count


def validate_current_owners(root, data):
    retired = set(data["dispositions"]) - ROOT_FILES
    catalog = read_json(root, ".github/repository-paths.json")["entries"]
    require(not (retired & set(catalog)), "Retired root remains in path catalog")
    for path in (root / "guides").glob("*.md"):
        name = path.relative_to(root).as_posix()
        entry = catalog.get(name, {})
        require(entry.get("role") == "guide" and entry.get("owner") == name,
                f"Guide is not its canonical owner: {name}")
    for item in data["dispositions"].values():
        if item["treatment"] in {"archive", "replace"}:
            require(catalog.get(item["archive_path"], {}).get("role") == "history",
                    f"Archive is not historical: {item['archive_path']}")
    config = read_json(root, ".github/repository-intelligence-config.json")
    for owner in config["owners"]:
        path = owner["path"]
        file_path(root, path)
        require(path not in retired and catalog.get(path, {}).get("role") != "history",
                f"Historical or retired current owner: {path}")
    for route in config["validation_routes"]:
        for path in route.get("paths", []) + route.get("read", []):
            require(path not in retired, f"Retired executable/configured locator: {path}")
            require((root / path).exists() or any(candidate.startswith(path) for candidate in catalog),
                    f"Missing executable/configured locator: {path}")


def validate_unchanged(root, entries, kind):
    for path, expected in entries.items():
        actual = file_path(root, path).read_bytes()
        require(blob_digest(actual) == expected, f"Changed {kind} bytes: {path}")


def allowed_locator_bytes(root, path, data):
    expected = baseline_bytes(root, path)
    if path == "site/content/catalog.json":
        return expected.replace(b'"provenance": "SITE-SOURCE-AUDIT.md"',
                                b'"provenance": "guides/SITE-SOURCE-AUDIT.md"')
    prefix = LOCATOR_FILES[path]
    for source, item in data["dispositions"].items():
        if item["treatment"] in {"move", "replace"}:
            expected = expected.replace((prefix + source).encode(), (prefix + item["destination"]).encode())
    return expected


def allowed_navigation_bytes(root):
    original = baseline_bytes(root, NAVIGATION)
    anchor = b"      - name: Check RI inventory and agent-memory contract\n"
    addition = (b"      - name: Check repository entry points, guide routes and preserved history\n"
                b"        run: python3 -m unittest discover -s tests -p 'test_root_layout.py'\n"
                b"      - name: Check enduring and owning-issue test selection\n"
                b"        run: python3 -m unittest discover -s tests -p 'test_repository_test_selection.py'\n")
    require(original.count(anchor) == 1, "Ambiguous navigation validator insertion")
    checkout = re.search(rb"^        uses: actions/checkout@[^\n]+\n", original, re.M)
    require(checkout is not None and original.count(b"actions/checkout@") == 1,
            "Ambiguous navigation history retrieval insertion")
    retrieval = checkout.group() + b"        with:\n          persist-credentials: false\n"
    require(original.count(retrieval) == 1, "Ambiguous navigation checkout configuration")
    with_history = original.replace(retrieval, checkout.group() + b"        with:\n          fetch-depth: 0\n          persist-credentials: false\n")
    return with_history.replace(anchor, addition + anchor)


def validate_locator_content(actual, expected, path):
    require(actual == expected, f"Non-locator adaptation: {path}")


def allowed_full_workflow_bytes(root):
    original = baseline_bytes(root, FULL_WORKFLOW)
    previous = b"          check python -m unittest discover -s tests -p 'test_*.py'\n"
    require(original.count(previous) == 1, "Ambiguous enduring-test selection substitution")
    return original.replace(previous, b"          check python tools/run_repository_tests.py\n")


def validate_public(root, data):
    validate_unchanged(root, baseline_entries(root, [".gitattributes", ".gitignore"]), "Git configuration")
    entries = baseline_entries(root, PROTECTED)
    current = subprocess.check_output(["git", "-C", str(root), "ls-files", "--cached", "--others",
                                       "--exclude-standard", "-z", "--", *PROTECTED]).decode().split("\0")
    require(set(filter(None, current)) == set(entries), "Protected public/runtime path set changed")
    exceptions = set(LOCATOR_FILES) | {"site/content/catalog.json"}
    validate_unchanged(root, {path: blob for path, blob in entries.items() if path not in exceptions}, "public/runtime")
    for path in exceptions:
        validate_locator_content(file_path(root, path).read_bytes(), allowed_locator_bytes(root, path, data), path)
    # All other existing workflows retain their exact source bytes.
    workflows = baseline_entries(root, [".github/workflows"])
    validate_unchanged(root, {path: blob for path, blob in workflows.items()
                              if path not in LOCATOR_FILES and path not in {NAVIGATION, FULL_WORKFLOW}}, "workflow")
    require(file_path(root, NAVIGATION).read_bytes() == allowed_navigation_bytes(root),
            "Non-validation navigation workflow adaptation")
    require(file_path(root, FULL_WORKFLOW).read_bytes() == allowed_full_workflow_bytes(root),
            "Non-selection Full workflow adaptation")
    before = json.loads(baseline_bytes(root, "site/content/catalog.json"))
    after = read_json(root, "site/content/catalog.json")
    require(before["records"] == after["records"], "Publication records changed")


def verify(root, task_snapshot=False):
    root = root.resolve()
    data = read_json(root, LAYOUT)
    original = baseline_entries(root, recursive=False)
    validate_bootstrap(file_path(root, "PROJECT-BOOTSTRAP.md").read_text(encoding="utf-8"))
    validate_layout(root, data, original)
    validate_archives(root, data, read_json(root, ARCHIVE), original)
    links = validate_links(root, data)
    validate_current_owners(root, data)
    if task_snapshot:
        validate_unchanged(root, baseline_entries(root, ["review"]), "existing review evidence")
        validate_public(root, data)
    return {"pass": True, "base_commit": BASE, "original_root_files": len(original),
            "current_root_files": len(ROOT_FILES), "active_local_links": links,
            "live_github_state_verified": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["verify"])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--task-snapshot", action="store_true",
                        help="Also enforce issue #33's historical public/review snapshot")
    arguments = parser.parse_args()
    try:
        print(json.dumps(verify(arguments.root, task_snapshot=arguments.task_snapshot), sort_keys=True))
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        parser.exit(1, f"Layout validation failed: {error}\n")
