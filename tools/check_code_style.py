#!/usr/bin/env python3
"""Small, deterministic subset of guides/CODE-STYLE.md; not a full style audit.

Inspect authored HTML/CSS and literal local JS imports in the site/build path.
Legacy allowances must describe debt present at the immutable inspected base.
This is checked-out repository validation, not a hostile-code security boundary.
"""

import hashlib
import json
import posixpath
import re
import subprocess
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

BASELINE = "aa1cfa97bf42103c0547c9332b885391f0e6fe6b"
POLICY = ".github/code-style.json"
CATALOG = ".github/repository-paths.json"
SCOPE = ("site", "tools/site", "tools/staging")
RETAINED = "site/retained/"
JS = {".js", ".cjs", ".mjs"}
EXTENSIONS = JS | {".css", ".html"}
TOKEN_OWNERS = {
    "site/engine/styles.css": ("--paper", "--ink", "--muted", "--accent"),
    "site/engine/reading-surfaces.css": (
        "--reading-surface-alpha",
        "--reading-surface-color",
        "--reading-surface-opacity",
        "--reading-surface-radius",
        "--reading-title-outset",
        "--surface-gutter",
    ),
}
LEGACY_RULES = {"CS01-history-source", "CS01-history-import", "CS03-inline-style"}
LOCAL_IMPORT = re.compile(
    r"(?:\brequire\s*\(\s*|\bimport\s*\(\s*|\bfrom\s+|\bimport\s+)"
    r"(['\"])(\.[^'\"\n]+)\1"
)


def imports(path, text):
    """Literal imports only; comments/string lookalikes may need review.

    Computed imports, aliases, JS-generated CSS and semantic coupling require
    review/AST follow-up. This scanner does not claim complete JS analysis.
    """
    return [
        posixpath.normpath(posixpath.join(posixpath.dirname(path), match[1]))
        for match in LOCAL_IMPORT.findall(text)
    ]


def safe_path(path):
    if not isinstance(path, str) or not path or path.startswith("/"):
        raise ValueError("Invalid exact style path: " + str(path))
    if any(part in {"", ".", ".."} for part in path.split("/")) or any(
        char in path for char in "*?[]\\"
    ):
        raise ValueError("Invalid exact style path: " + path)
    return path


def source_entries(catalog):
    return {
        path
        for path, entry in catalog["entries"].items()
        if path.startswith("review/")
        and Path(path).suffix in JS
        and entry.get("kind") == "file"
        and entry.get("role") not in {"history", "draft", "generated"}
    }


def load_sources(root, catalog):
    paths = set()
    for prefix in SCOPE:
        directory = root / prefix
        if not directory.is_dir():
            raise ValueError("Missing style scan coverage: " + prefix)
        paths.update(
            path.relative_to(root).as_posix()
            for path in directory.rglob("*")
            if path.is_file() and path.suffix in EXTENSIONS and "node_modules" not in path.parts
        )
    paths.update(source_entries(catalog))
    files = {}
    for path in sorted(paths):
        target = root / safe_path(path)
        if target.is_symlink() or not target.is_file():
            raise ValueError("Missing/indirect active source: " + path)
        files[path] = target.read_text(encoding="utf-8")
    # An imported historic source cannot disappear from coverage by relabelling
    # its catalog role. Keep the existing four explicit until their migration.
    for path, text in files.items():
        if Path(path).suffix not in JS:
            continue
        for target in imports(path, text):
            if target.startswith("review/"):
                candidates = (
                    [target]
                    if Path(target).suffix
                    else [target + suffix for suffix in (".js", ".cjs", ".mjs")]
                )
                if not any(candidate in files for candidate in candidates):
                    raise ValueError(
                        "Uncatalogued active history import: " + path + " -> " + target
                    )
    return files


class HTMLStyles(HTMLParser):
    def __init__(self, path, findings):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.findings = findings

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name == "style":
                self.findings[("CS03-inline-style", self.path, tag + " style=" + str(value))] += 1
        if tag == "style":
            self.findings[("CS03-inline-style", self.path, "style element")] += 1


def collect_findings(files, catalog):
    findings = Counter()
    for path in source_entries(catalog):
        findings[("CS01-history-source", path, "active source in review/")] += 1
    for path, text in files.items():
        if path.startswith(("site/content/", "site/templates/")) and path.endswith(".html"):
            HTMLStyles(path, findings).feed(text)
        if Path(path).suffix in JS:
            for target in imports(path, text):
                if target.startswith("review/"):
                    findings[("CS01-history-import", path, target)] += 1
                elif target == RETAINED.rstrip("/") or target.startswith(("docs/", RETAINED)) or (
                    path.startswith("site/") and target.startswith("tools/")
                ):
                    findings[("CS01-generated-or-tool-import", path, target)] += 1
    return findings


def verified_retained_styles(root, files):
    """Only manifest-bound prior public CSS copies are not authored owners."""
    copies = {path for path in files if re.fullmatch(
        r"site/retained/runtime/[a-f0-9]{64}/styles\.css", path)}
    if not copies:
        return copies
    manifest = json.loads((root / RETAINED / "manifest.json").read_text(encoding="utf-8"))
    if not isinstance(manifest, dict) or type(manifest.get("schema")) is not int \
            or manifest["schema"] != 1 or not isinstance(manifest.get("files"), dict):
        raise ValueError("Invalid retained style manifest")
    for path in copies:
        expected = manifest["files"].get(path.removeprefix(RETAINED))
        actual = hashlib.sha256((root / path).read_bytes()).hexdigest()
        if not isinstance(expected, str) or not re.fullmatch(r"[a-f0-9]{64}", expected) \
                or expected != actual:
            raise ValueError("Unverified retained style copy: " + path)
    return copies


def check_tokens(files, retained_styles=()):
    declared = {}
    for path, text in files.items():
        if path.startswith("site/") and path.endswith(".css") and path not in retained_styles:
            clean = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
            declared[path] = set(re.findall(r"(--[\w-]+)\s*:", clean))
    for owner, tokens in TOKEN_OWNERS.items():
        for token in tokens:
            if token not in declared.get(owner, set()):
                raise ValueError("Missing canonical CSS token: " + owner + " " + token)
            competing = [
                path for path, names in declared.items() if token in names and path != owner
            ]
            if competing:
                raise ValueError(
                    "Competing CSS token owner: " + token + " in " + ", ".join(competing)
                )


def validate_legacy(policy, baseline_read):
    if (
        not isinstance(policy, dict)
        or set(policy) != {"schema_version", "legacy"}
        or type(policy["schema_version"]) is not int
        or policy["schema_version"] != 1
    ):
        raise ValueError("Invalid code style policy schema")
    if not isinstance(policy["legacy"], list):
        raise ValueError("Legacy allowances must be a list")
    allowances = Counter()
    for row in policy["legacy"]:
        fields = {"rule", "path", "detail", "count", "issue", "remove_in", "reason"}
        if not isinstance(row, dict) or set(row) != fields:
            raise ValueError("Malformed legacy allowance")
        safe_path(row["path"])
        if (
            not isinstance(row["rule"], str)
            or row["rule"] not in LEGACY_RULES
            or row["issue"] != 54
        ):
            raise ValueError("Unsupported or unowned legacy allowance")
        if (
            not isinstance(row["remove_in"], str)
            or row["remove_in"] not in {"R1", "R3", "R4"}
            or not isinstance(row["reason"], str)
            or len(row["reason"].strip()) < 20
        ):
            raise ValueError("Legacy allowance needs a removal task and reason")
        if (
            not isinstance(row["detail"], str)
            or not row["detail"]
            or type(row["count"]) is not int
            or row["count"] < 1
        ):
            raise ValueError("Invalid legacy detail/count")
        key = (row["rule"], row["path"], row["detail"])
        if key in allowances:
            raise ValueError("Duplicate legacy allowance: " + str(key))
        allowances[key] = row["count"]
    baseline_catalog = json.loads(baseline_read(CATALOG))
    baseline_files = {path: baseline_read(path) for _, path, _ in allowances}
    baseline = collect_findings(baseline_files, baseline_catalog)
    for key, count in allowances.items():
        if count > baseline[key]:
            raise ValueError("Expanded legacy allowance beyond immutable baseline: " + str(key))
    return allowances


def verify(root, baseline_read=None):
    if baseline_read is None:

        def baseline_read(path):
            return subprocess.check_output(
                ["git", "show", BASELINE + ":" + safe_path(path)],
                cwd=root,
                text=True,
                stderr=subprocess.PIPE,
            )

    catalog = json.loads((root / CATALOG).read_text(encoding="utf-8"))
    policy = json.loads((root / POLICY).read_text(encoding="utf-8"))
    files = load_sources(root, catalog)
    check_tokens(files, verified_retained_styles(root, files))
    allowances = validate_legacy(policy, baseline_read)
    findings = collect_findings(files, catalog)
    violations = findings - allowances
    stale = allowances - findings
    if violations or stale:
        raise ValueError(
            "Code style debt changed; fix violations/remove stale allowances: "
            + json.dumps({"violations": list(violations.items()), "stale": list(stale.items())})
        )
    return {
        "pass": True,
        "guide": "guides/CODE-STYLE.md",
        "baseline": BASELINE,
        "scanned_files": len(files),
        "legacy_occurrences": sum(allowances.values()),
        "scope": "HTML inline styles, reserved CSS owners, catalogued history and literal imports",
    }


def main():
    try:
        print(json.dumps(verify(Path(__file__).resolve().parents[1]), sort_keys=True))
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError) as error:
        print("Code style check failed: " + str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
