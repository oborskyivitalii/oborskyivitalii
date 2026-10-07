#!/usr/bin/env python3
"""Verify the maintained RI → checks map against source bytes and CI entrypoints.

This is ordinary checked-out repository validation, not a target-owned interpreter
for hostile candidate code. It records invocation routes; it does not claim that a
GitHub run passed or that a human/release acceptance criterion is satisfied.
"""
import argparse
import fnmatch
import hashlib
import importlib.util
import json
import re
import shlex
import subprocess
import sys
import unittest
from pathlib import Path

MAP = ".github/ri-ci-map.json"
CATALOG = ".github/repository-paths.json"
CONTROL_FILES = {
    "AGENTS.md", "CONTRIBUTING.md", "PROJECT-BOOTSTRAP.md", "review/REVIEW-TEMPLATE.md",
    ".github/REPOSITORY-INTELLIGENCE.md", ".github/ACCEPTANCE.md", CATALOG,
    ".github/repository-intelligence-config.json", ".github/pull_request_template.md",
    "tools/repository_intelligence.py", "tools/check_ri_ci.py", "tools/issue_acceptance.py",
    "tests/test_repository_intelligence.py", "tests/test_ri_ci.py",
    "tests/test_issue_acceptance.py", "tests/test_issue31_acceptance.py",
}
CONTROL_PATTERNS = (
    ".github/workflows/*.yml", ".github/workflows/*.yaml",
    ".github/ISSUE_TEMPLATE/*.md", ".github/acceptance/*.json",
    "tools/*intelligence*.py", "tools/*ri_ci*.py",
    "tests/test_*intelligence*.py", "tests/test_ri*.py",
)
CONTROL_OWNERS = {".github/REPOSITORY-INTELLIGENCE.md", ".github/ACCEPTANCE.md"}
DERIVED = {MAP, "REPOSITORY-MAP.md", ".github/repository-intelligence/agent-context.json"}


def safe_path(root, path):
    if not isinstance(path, str) or not path or Path(path).is_absolute() or \
            any(part in {"", ".", ".."} for part in path.split("/")):
        raise ValueError("Unsafe map path: " + str(path))
    target = root / path
    if any(part.is_symlink() for part in (target, *target.parents) if part != root.parent):
        raise ValueError("Symlink map path: " + path)
    if not target.is_file():
        raise ValueError("Missing mapped path: " + path)
    return target


def control_paths(root):
    """Fixed input families plus catalog-owned RI/acceptance controls.

    MEMORY content is deliberately outside coupling identity: its bounded format
    is a producer contract; changing a dated handoff still invalidates RI itself.
    All workflow definitions are watched, including new workflow files.
    """
    paths = {p for p in CONTROL_FILES if (root / p).is_file()}
    for pattern in CONTROL_PATTERNS:
        paths.update(p.relative_to(root).as_posix() for p in root.glob(pattern) if p.is_file())
    catalog = json.loads(safe_path(root, CATALOG).read_text())
    for path, entry in catalog["entries"].items():
        if entry.get("kind") == "file" and entry.get("owner") in CONTROL_OWNERS \
                and entry.get("role") not in {"generated", "history", "draft", "memory"}:
            paths.add(path)
    return sorted(paths - DERIVED)


def workflow_commands(root, path, job):
    """Read the narrow YAML execution shape used by these mapped workflows.

    Only the first actual command of an unconditional job/step is eligible. No
    substring search, shell evaluation, YAML aliases or conditional command can
    establish invocation. Complex workflow syntax needs a reviewed adapter.
    """
    text = safe_path(root, path).read_text()
    lines = text.splitlines()
    if any(re.search(r"(?:^|\s)[&*][A-Za-z_]|<<:", line) for line in lines):
        raise ValueError("Unsupported workflow alias/merge: " + path)
    if any(re.match(r" {0,8}(?:-\s+)?['\"][^'\"]+['\"]\s*:", line) for line in lines) or "defaults:" in lines:
        raise ValueError("Unsupported quoted workflow keys/defaults: " + path)
    starts = [i for i, line in enumerate(lines) if re.fullmatch(r"on:\s*", line)]
    if len(starts) != 1:
        raise ValueError("Unsupported workflow event shape: " + path)
    event_lines = []
    for line in lines[starts[0] + 1:]:
        if line and not line.startswith(" ") and not line.startswith("#"):
            break
        event_lines.append(line)
    pr_starts = [i for i, line in enumerate(event_lines) if re.fullmatch(r"  pull_request:\s*", line)]
    if not pr_starts:
        raise ValueError("Mapped workflow has no pull_request event: " + path)
    if len(pr_starts) != 1:
        raise ValueError("Duplicate pull_request event: " + path)
    pr_lines = []
    for line in event_lines[pr_starts[0] + 1:]:
        if re.match(r"  [A-Za-z_][A-Za-z0-9_-]*:", line):
            break
        pr_lines.append(line)
    if any(re.match(r"    (?:paths|paths-ignore|branches|branches-ignore):", line) for line in pr_lines):
        raise ValueError("Mapped workflow uses pull_request path/branch filters: " + path)
    type_fields = [(i, re.fullmatch(r"    types:\s*(.*?)\s*", line))
                   for i, line in enumerate(pr_lines)]
    type_fields = [(i, hit.group(1)) for i, hit in type_fields if hit]
    if len(type_fields) > 1:
        raise ValueError("Duplicate pull_request types: " + path)
    if type_fields:
        index, value = type_fields[0]
        if re.fullmatch(r"\[[^\[\]]*\]", value):
            tokens = value[1:-1].split(",")
        elif not value:
            tokens = []
            for line in pr_lines[index + 1:]:
                if not line.strip() or line.lstrip().startswith("#"):
                    continue
                hit = re.fullmatch(r"      - (.+)", line)
                if not hit:
                    raise ValueError("Unsupported pull_request types list: " + path)
                tokens.append(hit.group(1))
        else:
            raise ValueError("Unsupported pull_request types shape: " + path)
        types = set()
        for token in tokens:
            values = shlex.split(token)
            if len(values) != 1 or not re.fullmatch(r"[a-z_]+", values[0]):
                raise ValueError("Unsupported pull_request type: " + path)
            types.add(values[0])
        if not {"opened", "synchronize"} <= types:
            raise ValueError("Mapped pull_request types must include opened and synchronize: " + path)
    try:
        start = lines.index("jobs:") + 1
    except ValueError as exc:
        raise ValueError("Missing workflow jobs: " + path) from exc
    jobs = {}
    for line in lines[start:]:
        hit = re.fullmatch(r"  ([A-Za-z_][A-Za-z0-9_-]*):\s*", line)
        if hit:
            current = hit.group(1)
            if current in jobs:
                raise ValueError("Duplicate workflow job: " + path + ":" + current)
            jobs[current] = []
        elif line and not line.startswith(" ") and not line.startswith("#"):
            raise ValueError("Unsupported workflow jobs shape: " + path)
        elif jobs:
            jobs[current].append(line)
    if job not in jobs:
        raise ValueError("Missing mapped workflow job: " + path + ":" + job)
    body = jobs[job]
    if any(re.match(r"    needs:", line) for line in body):
        raise ValueError("Mapped job dependencies require a reviewed reachability adapter: " + path + ":" + job)
    if any(re.match(r"    (?:if|continue-on-error|strategy|defaults):", line) for line in body):
        raise ValueError("Mapped job is conditional, optional or matrix-based: " + path + ":" + job)
    steps = []
    for line in body:
        if re.match(r"      - ", line):
            steps.append([line])
        elif steps:
            steps[-1].append(line)
    commands = []
    for step in steps:
        if any(re.match(r"(?:      - |        )(?:if|continue-on-error):", line) for line in step):
            continue
        if any(re.match(r"(?:      - |        )(?:shell|working-directory):", line) for line in step):
            raise ValueError("Unsupported mapped step shell/working-directory: " + path)
        runs = [(i, re.match(r"(?:      - |        )run:\s*(.*)$", line))
                for i, line in enumerate(step)]
        runs = [(i, hit.group(1)) for i, hit in runs if hit]
        if not runs:
            continue
        if len(runs) != 1:
            raise ValueError("Ambiguous workflow run: " + path)
        index, value = runs[0]
        if value in {"|", "|-", "|+"}:
            script = [line[10:] for line in step[index + 1:]
                      if line.startswith("          ")]
            first = next((line for line in script if line.strip() and not line.lstrip().startswith("#")), "")
            if first != first.lstrip():
                continue  # A nested shell block/function is not unconditional evidence.
        elif value.startswith(("'", '"', ">")):
            raise ValueError("Unsupported quoted/folded workflow run: " + path)
        else:
            first = value
        if re.search(r"[;&|<>`]|\$\(|\$\{\{", first):
            continue
        try:
            commands.append(shlex.split(first, posix=True))
        except ValueError as exc:
            raise ValueError("Invalid mapped shell command: " + path) from exc
    return commands


def resolve_tests(root, check):
    selectors = check.get("test_selectors", [])
    if not selectors:
        return
    argv = check["argv"]
    if len(argv) not in {8, 9} or argv[:4] != ["python3", "-m", "unittest", "discover"] \
            or argv[4:7] != ["-s", "tests", "-p"]:
        raise ValueError("Test selectors require a mapped unittest discovery command: " + check["id"])
    pattern = argv[7]
    # len=8 is the standard shape; reject extra switches rather than silently
    # interpreting commands that select different tests.
    if argv[8:] not in ([], ["--verbose"]):
        raise ValueError("Unsupported mapped unittest options: " + check["id"])
    sys.path.insert(0, str(root / "tests"))
    try:
        for selector in selectors:
            module = selector.split(".")[0]
            path = safe_path(root, "tests/" + module + ".py")
            if not fnmatch.fnmatchcase(module + ".py", pattern):
                raise ValueError("Mapped test is not selected by CI discovery: " + selector)
            spec = importlib.util.spec_from_file_location(module, path)
            test_module = importlib.util.module_from_spec(spec)
            previous = sys.modules.get(module)
            sys.modules[module] = test_module
            try:
                # Resolve selectors from the admitted bytes, including same-size
                # edits within one filesystem timestamp tick.
                exec(compile(path.read_bytes(), str(path), "exec"), test_module.__dict__)
            finally:
                if previous is None:
                    sys.modules.pop(module, None)
                else:
                    sys.modules[module] = previous
            loader = unittest.TestLoader()
            suffix = selector.partition(".")[2]
            suite = loader.loadTestsFromName(suffix, test_module) if suffix else loader.loadTestsFromModule(test_module)
            if loader.errors or not suite.countTestCases():
                raise ValueError("Missing mapped test selector: " + selector)
    finally:
        sys.path.pop(0)


def source_identity(root, data):
    inputs = [{"path": p, "sha256": hashlib.sha256(safe_path(root, p).read_bytes()).hexdigest()}
              for p in control_paths(root)]
    definition = {key: value for key, value in data.items() if key != "reviewed_source_identity"}
    payload = json.dumps({"definition": definition, "inputs": inputs}, sort_keys=True, separators=(",", ":")).encode()
    return {"algorithm": "sha256-path-content-map-v1", "digest": hashlib.sha256(payload).hexdigest(), "inputs": inputs}


def validate_definition(root, data):
    if data.get("schema_version") != 1 or not data.get("layers") or not data.get("checks"):
        raise ValueError("Invalid RI/CI map schema")
    checks = {check["id"]: check for check in data["checks"]}
    if len(checks) != len(data["checks"]):
        raise ValueError("Duplicate mapped check")
    paths, ids, used = set(), set(), set()
    for layer in data["layers"]:
        if layer["id"] in ids or not layer.get("purpose", "").strip() or not layer.get("paths"):
            raise ValueError("Invalid or duplicate RI layer")
        ids.add(layer["id"])
        for path in layer["paths"]:
            safe_path(root, path)
            paths.add(path)
        for check in layer["checks"]:
            if check not in checks:
                raise ValueError("Dangling RI layer check: " + check)
            used.add(check)
    missing = set(control_paths(root)) - paths
    if missing:
        raise ValueError("Unmapped RI/CI control paths: " + ", ".join(sorted(missing)))
    if used != set(checks):
        raise ValueError("Unused mapped checks: " + ", ".join(sorted(set(checks) - used)))
    for check in checks.values():
        if check["argv"] not in workflow_commands(root, check["workflow"], check["job"]):
            raise ValueError("Mapped check is not invoked unconditionally: " + check["id"])
        resolve_tests(root, check)
    return paths


def fixed_diff(root, base, head):
    if not re.fullmatch(r"[0-9a-f]{40}", base or "") or not re.fullmatch(r"[0-9a-f]{40}", head or ""):
        raise ValueError("Both base and head must be full immutable commit SHAs")
    def git(*args):
        return subprocess.check_output(["git", "-C", str(root), *args], text=True).strip()
    for ref in (base, head):
        if git("cat-file", "-t", ref) != "commit":
            raise ValueError("RI/CI diff ref is not a commit: " + ref)
    if git("rev-parse", "HEAD") != head:
        raise ValueError("RI/CI fixed head does not match the checkout")
    paths = set(control_paths(root)) | {MAP}
    dirty = git("status", "--porcelain", "--untracked-files=all", "--", *sorted(paths))
    if dirty:
        raise ValueError("RI/CI fixed diff requires clean control files")
    # Include removed/renamed catalog-owned controls from the fixed base; relying
    # only on the head's catalog would erase those changes from the report.
    base_paths = set(git("ls-tree", "-r", "--name-only", "-z", base).split("\0"))
    base_controls = {p for p in base_paths if p in CONTROL_FILES or
                     any(fnmatch.fnmatchcase(p, glob) for glob in CONTROL_PATTERNS)}
    if CATALOG in base_paths:
        base_catalog = json.loads(git("show", base + ":" + CATALOG))
        base_controls.update(p for p, entry in base_catalog["entries"].items()
                             if entry.get("kind") == "file" and entry.get("owner") in CONTROL_OWNERS
                             and entry.get("role") not in {"generated", "history", "draft", "memory"})
    changed = git("diff", "--name-only", "-z", "--no-renames", base, head).split("\0")
    return {"base_sha": base, "head_sha": head,
            "changed_controls": [p for p in changed if p and (p in (paths | base_controls) or p in CONTROL_FILES
                                 or any(fnmatch.fnmatchcase(p, glob) for glob in CONTROL_PATTERNS))]}


def verify(root, map_path=MAP, base=None, head=None):
    data = json.loads(safe_path(root, map_path).read_text())
    validate_definition(root, data)
    identity = source_identity(root, data)
    if data.get("reviewed_source_identity") != identity:
        raise ValueError("Stale RI/CI mapping: review affected checks and refresh the coupling digest")
    result = {"kind": "ri-ci-coupling", "pass": True, "source_digest": identity["digest"],
              "layers": len(data["layers"]), "checks": len(data["checks"]),
              "live_github_state_verified": False}
    if base is not None or head is not None:
        result["comparison"] = fixed_diff(root, base, head)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["verify", "refresh"])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--map", default=MAP)
    parser.add_argument("--base-sha")
    parser.add_argument("--head-sha")
    args = parser.parse_args()
    root = args.root.resolve()
    try:
        if args.command == "refresh":
            if args.base_sha or args.head_sha:
                raise ValueError("Refresh does not compare commits; verify the committed map with fixed refs")
            path = safe_path(root, args.map)
            data = json.loads(path.read_text())
            validate_definition(root, data)
            data["reviewed_source_identity"] = source_identity(root, data)
            path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print(json.dumps(verify(root, args.map, args.base_sha, args.head_sha), sort_keys=True))
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as exc:
        print(str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
