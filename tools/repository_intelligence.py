#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded local RI navigation adapter derived from UA's projection pattern.

Source: UncertaintyArchitectureGroup/uncertainty-architecture at
345c8f50745e5fde1303d0d7952634f7899220c9. See RI-NOTICE.md.
No candidate execution, remote state, semantic authority or full UA graph.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path, PurePosixPath

VERSION = 2
IGNORED = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "public",
    "quality-artifact",
    "quality-reports",
    "quality-results",
    ".site-cache",
    ".ruff_cache",
    "color-artifact",
    "staging-package",
    "staging-rollback",
    "staging-reports",
}
TEXT_SUFFIXES = {".md", ".json", ".toml", ".yml", ".yaml", ".py", ".cff", ".txt"}
MAX_FILES = 5000
MAX_FILE_BYTES = 2_000_000
MAX_TOTAL_BYTES = 50_000_000
MAX_HASH_FILE_BYTES = 32_000_000
MAX_HASH_TOTAL_BYTES = 250_000_000
MAX_MAP_BYTES = 32_768
DEFAULT_PAGE_LIMIT = 20
MAX_PAGE_LIMIT = 100
RESPONSE_ADVISORY_BYTES = 65_536
HASH_HEADROOM_ADVISORY = 10_000_000
SCRIPT = "tools/repository_intelligence.py"
ROLES = {
    "guide",
    "source",
    "configuration",
    "validator",
    "test",
    "workflow",
    "generated",
    "history",
    "draft",
    "license",
    "memory",
}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def digest(data):
    return hashlib.sha256(data).hexdigest()


def serialize_json(value):
    """One byte serialization for generated JSON and printed JSON responses."""
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def safe_path(root, relative):
    """Reject path traversal and every symlink, including inside-root aliases."""
    p = PurePosixPath(relative)
    if not relative or p.is_absolute() or any(x in {"", ".", ".."} for x in relative.split("/")):
        raise ValueError(f"Unsafe repository path: {relative}")
    current = root
    for part in p.parts:
        current = current / part
        if current.is_symlink():
            raise ValueError(f"Symlink is not a repository input/output: {relative}")
    current.resolve().relative_to(root)
    return current


def active_markdown(text, *, plain=False):
    """Extract a bounded active Markdown view without treating code as comments.

    Balanced single-line code spans are supported. A comment-bearing unmatched
    span is visibly unsupported instead of silently losing following inventory.
    Plain mode keeps literal Markdown lines and rejects raw HTML blocks and
    front matter for section detection.
    """
    lines, fence, comment = [], None, False
    source_lines = re.split(r"\r\n?|\n", text) if plain else text.splitlines()
    if plain and source_lines[0].removeprefix("\ufeff").rstrip(" \t") == "---":
        raise ValueError("Front matter is unsupported in continuity sections")
    for line in source_lines:
        if fence is not None:
            if re.fullmatch(
                r" {0,3}" + re.escape(fence[0]) + "{" + str(fence[1]) + r",}[ \t]*", line
            ):
                fence = None
            continue
        if not comment:
            if line.startswith(("    ", "\t")):
                continue
            opening = re.match(r"^ {0,3}(\x60{3,}|~{3,})(.*)$", line)
            if opening:
                marker, info = opening.groups()
                if marker[0] != chr(96) or chr(96) not in info:
                    fence = (marker[0], len(marker))
                    continue
            if plain and re.match(
                r"^ {0,3}<(?:\?|!(?!--)|/?[A-Za-z][A-Za-z0-9-]*(?=[ \t/>]|$))", line
            ):
                raise ValueError("Raw HTML blocks are unsupported in continuity sections")
        remainder, visible = line, ""
        while remainder:
            if comment:
                end = remainder.find("-->")
                if end < 0:
                    remainder = ""
                else:
                    comment = False
                    remainder = remainder[end + 3 :]
            else:
                start = remainder.find("<!--")
                span = re.search(r"\x60+", remainder)
                if start >= 0 and span and span.start() < start:
                    delimiter = span.group()
                    closing = re.search(
                        r"(?<!\x60)" + re.escape(delimiter) + r"(?!\x60)", remainder[span.end() :]
                    )
                    if closing is None:
                        raise ValueError(
                            "Unsupported comment-bearing multiline/unmatched code span"
                        )
                    end = span.end() + closing.end()
                    visible += remainder[:end]
                    remainder = remainder[end:]
                    continue
                if start < 0:
                    visible += remainder
                    remainder = ""
                else:
                    visible += remainder[:start]
                    comment = True
                    remainder = remainder[start + 4 :]
        if not plain or visible == line:
            lines.append(visible)
    return "\n".join(lines)


def repository_files(root, outputs):
    """Common input admission; diagnostics cannot hide files excluded by hashing."""

    def walk_error(error):
        raise error

    for parent, dirs, files in os.walk(root, followlinks=False, onerror=walk_error):
        dirs[:] = sorted(d for d in dirs if d not in IGNORED and not d.startswith(".site-build-"))
        for d in dirs:
            safe_path(root, (Path(parent) / d).relative_to(root).as_posix())
        for name in sorted(files):
            path = Path(parent) / name
            relative = path.relative_to(root).as_posix()
            # A worktree has a .git file where a regular checkout has a directory.
            if name == ".git" or relative in outputs or name.endswith((".pyc", ".tmp")):
                continue
            path = safe_path(root, relative)
            if not path.is_file():
                raise ValueError(f"Unsupported input: {relative}")
            yield relative, path


def scan(root, outputs):
    """Hash every input, decode bounded navigation text, then admit tracked paths."""
    records, texts, size_total, hash_total = [], {}, 0, 0
    for relative, path in repository_files(root, outputs):
        if len(records) >= MAX_FILES - len(outputs):
            raise ValueError("RI file bound exceeded; use direct repository reading")
        size = path.stat().st_size
        hash_total += size
        if size > MAX_HASH_FILE_BYTES or hash_total > MAX_HASH_TOTAL_BYTES:
            raise ValueError(f"RI content hash bound exceeded at {relative}")
        sha = hashlib.sha256()
        hashed = 0
        with path.open("rb") as stream:
            for chunk in iter(lambda: stream.read(1_000_000), b""):
                hashed += len(chunk)
                if hashed > MAX_HASH_FILE_BYTES:
                    raise ValueError(f"RI content hash bound exceeded at {relative}")
                sha.update(chunk)
        if hashed != size:
            raise ValueError(f"Input changed while hashing: {relative}")
        records.append({"path": relative, "identity_mode": "content", "sha256": sha.hexdigest()})
        if path.suffix.lower() in TEXT_SUFFIXES:
            size_total += size
            if size > MAX_FILE_BYTES or size_total > MAX_TOTAL_BYTES:
                raise ValueError(f"RI text bound exceeded at {relative}")
            data = path.read_bytes()
            if digest(data) != sha.hexdigest():
                raise ValueError(f"Input changed while decoding: {relative}")
            texts[relative] = data.decode("utf-8")
    check_tracked_inputs(root, {x["path"] for x in records} | set(outputs))
    records += [{"path": p, "identity_mode": "derived"} for p in outputs]
    return sorted(records, key=lambda x: x["path"]), texts


def check_tracked_inputs(root, scanned):
    # A tracked file must never disappear behind an excluded cache name, a
    # missing checkout path, a temporary suffix, or an unsupported Git mode.
    try:
        tracked = subprocess.run(
            ["git", "-C", str(root), "ls-files", "--stage", "-z"],
            capture_output=True,
            check=False,
            timeout=15,
        )
    except subprocess.TimeoutExpired as exc:
        raise ValueError("Tracked-file inventory timeout; use direct repository reading") from exc
    if tracked.returncode == 0:
        for item in tracked.stdout.decode("utf-8").split("\0"):
            if not item:
                continue
            metadata, relative = item.split("\t", 1)
            if metadata.split()[2] != "0":
                raise ValueError(f"Unresolved tracked merge: {relative}")
            if metadata.split()[0] not in {"100644", "100755"}:
                raise ValueError(f"Unsupported tracked file mode: {relative}")
            if relative not in scanned:
                raise ValueError(f"Tracked file missing or excluded: {relative}")


def load_config(root, config_path):
    config = json.loads(safe_path(root, config_path).read_text(encoding="utf-8"))
    if config.get("schema_version") != VERSION:
        raise ValueError("Unsupported RI config schema")
    output = config["output"]
    if not output.endswith("/repository-intelligence/agent-context.json"):
        raise ValueError(
            "Projection output must be a dedicated repository-intelligence/agent-context.json"
        )
    safe_path(root, output)
    if config.get("map_output") != "REPOSITORY-MAP.md":
        raise ValueError("Readable projection must be REPOSITORY-MAP.md")
    safe_path(root, config["catalog"])
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", config["repository"]):
        raise ValueError("Invalid repository identity")
    for key in ("glossaries", "registries"):
        for path in config.get(key, []):
            safe_path(root, path)
    for owner in config["owners"]:
        safe_path(root, owner["path"])
        if not owner["concern"].strip() or not owner["queries"]:
            raise ValueError("Owner needs a concern and explicit query aliases")
    if len({x["concern"] for x in config["owners"]}) != len(config["owners"]):
        raise ValueError("Duplicate owner concern")
    for link in config.get("cross_repository", []):
        if not link["url"].startswith("https://github.com/"):
            raise ValueError("Cross-repository links must explicitly point to GitHub")
    return config


def instruction_paths(path, instructions):
    return sorted(
        x["path"]
        for x in instructions
        if x["scope_root"] == "." or path == x["path"] or path.startswith(x["scope_root"] + "/")
    )


def path_inventory(root, config, records, texts, instructions):
    catalog = json.loads(texts[config["catalog"]])
    if catalog.get("schema_version") != 1:
        raise ValueError("Unsupported path catalog schema")
    entries = catalog["entries"]
    files = {x["path"] for x in records}
    directories = {"."}
    for path in files:
        directories.update(p.as_posix() for p in PurePosixPath(path).parents)
    actual = files | directories
    if set(entries) != actual:
        missing, stale = sorted(actual - entries.keys()), sorted(entries.keys() - actual)
        raise ValueError(
            f"Path catalog coverage mismatch; unclassified={missing}; missing/stale={stale}"
        )
    artifacts, scopes = [], []
    for path, entry in sorted(entries.items()):
        if path != ".":
            safe_path(root, path)
        kind = "file" if path in files else "directory"
        if not isinstance(entry, dict) or set(entry) != {"kind", "purpose", "role", "owner"}:
            raise ValueError(f"Unsupported path entry fields: {path}")
        if entry.get("kind") != kind or entry.get("role") not in ROLES:
            raise ValueError(f"Invalid path kind/role: {path}")
        if not isinstance(entry.get("purpose"), str) or not entry["purpose"].strip():
            raise ValueError(f"Missing path purpose: {path}")
        if entry.get("owner") not in files:
            raise ValueError(f"Missing path owner: {path}")
        row = {"path": path, **entry, "instructions": instruction_paths(path, instructions)}
        if kind == "file":
            body = texts.get(path, "")
            title = (
                re.search(r"^#\s+(.+)$", active_markdown(body), re.M)
                if path.endswith(".md")
                else None
            )
            row["title"] = title.group(1) if title else PurePosixPath(path).name
            artifacts.append(row)
        else:
            scopes.append(row)
    return artifacts, scopes


def check_continuity(config, texts):
    for path, contract in config.get("continuity", {}).items():
        body = texts[path]
        if len(body.splitlines()) > contract["max_lines"]:
            raise ValueError(f"Continuity line bound exceeded: {path}; move detail to its owner")
        max_bytes = contract.get("max_bytes")
        if max_bytes is not None and len(body.encode("utf-8")) > max_bytes:
            raise ValueError(
                f"Continuity UTF-8 byte bound exceeded: {path}; move detail to its owner"
            )
        headings = contract.get("headings", [])
        if not headings:
            continue
        try:
            active_body = active_markdown(body, plain=True)
        except ValueError as error:
            raise ValueError(f"{error}: {path}") from error
        active_lines = set(active_body.split("\n"))
        for heading in headings:
            if heading not in active_lines:
                raise ValueError(f"Missing continuity section {heading}: {path}")


def in_scope(row, scope):
    if scope == "all":
        return True
    if scope == "history":
        return row["role"] in {"history", "draft"}
    if scope == "current":
        return row["role"] not in {"history", "draft", "generated"}
    raise ValueError("Unknown navigation scope")


def render_map(surface):
    """Compact current entry; the full catalog/projection remains complete."""
    context = next(
        x["path"]
        for x in surface["source_identity"]["inputs"]
        if x["path"].endswith("/repository-intelligence/agent-context.json")
    )
    lines = [
        "# Repository map",
        "",
        "Generated current-repository entry, not an exhaustive history listing.",
        "Read [README.md](README.md), [AGENTS.md](AGENTS.md), the owning issue and",
        "[MEMORY.md](MEMORY.md); revalidate live GitHub refs, checks and delivery.",
        f"The [complete JSON inventory]({context}) retains every file/directory and source identity.",
        f"Edit the catalog/aliases routed by [the config]({surface['producer']['config_path']});",
        "regenerate both views with build/verify. Do not paste the full JSON into routine context.",
        "Roles describe navigation, not scientific, rights, merge or publication acceptance.",
        "",
    ]
    groups = [
        ("Root entry points", [a for a in surface["artifacts"] if "/" not in a["path"]]),
        (
            "Current areas",
            [
                d
                for d in surface["directories"]
                if d["path"] != "." and "/" not in d["path"] and in_scope(d, "current")
            ],
        ),
    ]
    for title, rows in groups:
        lines += [
            f"## {title}",
            "",
            "| Path | Purpose | Role | Editing owner |",
            "| --- | --- | --- | --- |",
        ]
        for row in rows:
            path, owner = row["path"], row["owner"]
            purpose = row["purpose"].replace("|", "\\|").replace("\n", " ")
            lines.append(f"| [{path}]({path}) | {purpose} | {row['role']} | [{owner}]({owner}) |")
        lines.append("")
    lines += ["## Concern owners", "", "| Concern | Read owner |", "| --- | --- |"]
    for owner in surface["owners"]:
        concern = owner["concern"].replace("|", "\\|").replace("\n", " ")
        path = owner["path"]
        lines.append(f"| {concern} | [{path}]({path}) |")
    lines += ["", "## Applicable instruction surfaces", ""]
    for item in surface["instructions"]:
        lines.append(f"- [{item['path']}]({item['path']}) — scope `{item['scope_root']}`.")
    lines += [
        "",
        "## Validation entry points",
        "",
        "Commands are suggestions, not executed checks; read the owner's contract first.",
        "",
    ]
    for route in surface["validation_routes"]:
        workflow = route.get("workflow")
        link = f": [{workflow}]({workflow})." if workflow else " (read configured route)."
        lines.append(f"- {route['concern']}{link}")
        lines.extend(f"  - `{command}`" for command in route["commands"])
    lines += [
        "",
        "## Scoped navigation and direct-source fallback",
        "",
        "Use explicit current scope for routine work. Current excludes history/draft/generated hits;",
        "history includes history/draft. All includes generated artifacts. No input is excluded from integrity.",
        "Unqualified query/inventory keep their complete legacy behavior. Scoped lists default to20 hits;",
        "pagination never removes applicable owner/instruction/check metadata. Inspect returned byte counts",
        "and narrow a broad request if advised. Every CLI lookup still verifies all inputs; no speed claim.",
        "",
        "```sh",
        "python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify",
        "python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json context-for-task 'якість вимог' --scope current",
        "python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json inventory --scope current --prefix site/engine --limit 20",
        "python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json inventory --scope history --prefix review/issue-189",
        "python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json query 'docs/writing.html' --scope all",
        "python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json capacity",
        "```",
        "",
        "Continue with the same command/filters and `--cursor` equal to pagination.next_cursor.",
        "Cursor offsets are bound to request/page size/source digest; changed inputs require a new first page.",
        "For exact file/directory retrieval use inventory --prefix PATH (component boundary, not a lexical prefix).",
        "A miss is not evidence of absence: inspect the catalog/config and direct sources.",
        "",
        "Connector-only: read this small map at the chosen ref, follow the concern/area owner links above,",
        "then read the relevant source and scoped AGENTS directly. Search exact paths in the catalog when needed.",
        "Keep archived editions/manifests in their owning review index/ZIP; they do not define the active task.",
        "Without a local runtime do not claim CLI verification; bind any CI evidence to its actual checkout/ref.",
    ]
    rendered = "\n".join(lines).rstrip() + "\n"
    if len(rendered.encode("utf-8")) > MAX_MAP_BYTES:
        raise ValueError("Readable map byte bound exceeded; narrow the entry in its owners")
    return rendered


def build(root, config_path):
    config = load_config(root, config_path)
    records, texts = scan(root, [config["output"], config["map_output"]])
    required = (
        [config_path, SCRIPT, config["catalog"]]
        + config.get("glossaries", [])
        + config.get("registries", [])
    )
    required += [x["path"] for x in config["owners"]]
    required += list(config.get("continuity", {}))
    missing = sorted(set(required) - texts.keys())
    if missing:
        raise ValueError("Missing represented owner/input: " + ", ".join(missing))
    instructions = [
        {"path": p, "scope_root": PurePosixPath(p).parent.as_posix()}
        for p in texts
        if PurePosixPath(p).name == "AGENTS.md"
    ]
    if not any(x["path"] == "AGENTS.md" for x in instructions):
        raise ValueError("Root AGENTS.md is required")
    check_continuity(config, texts)
    terms = []
    for p in config.get("glossaries", []):
        for title in re.findall(r"^#{2,3}\s+(.+?)\s*$", active_markdown(texts[p]), re.M):
            terms.append({"term": title, "path": p})
    sources = []
    for p in config.get("registries", []):
        headers = 0
        for line in active_markdown(texts[p]).splitlines():
            if line.startswith("|"):
                fields = [x.strip() for x in line.strip().strip("|").split("|")]
                if fields[0] == "ID":
                    if fields != [
                        "ID",
                        "Source",
                        "Evidence review",
                        "Integration audit",
                        "Last verified",
                        "Can support",
                        "Current use",
                    ]:
                        raise ValueError(f"Unsupported source-registry header in {p}")
                    headers += 1
                    continue
                if all(re.fullmatch(r":?-+:?", x) for x in fields):
                    continue
                if len(fields) != 7:
                    raise ValueError(f"Unsupported source-registry row in {p}")
                if not re.fullmatch(r"\*\*(?:P|D|S|M|DS)-\d{4}-\d{2}\*\*", fields[0]):
                    raise ValueError(f"Unsupported source identity in {p}: {fields[0]}")
                source_id = fields[0].strip("*")
                brief = re.search(r"\]\(([^)]+)\)", fields[2])
                brief_path = None
                if brief:
                    joined = str(PurePosixPath(p).parent / brief.group(1))
                    safe_path(root, joined)
                    if joined not in texts:
                        raise ValueError(f"Missing represented brief: {joined}")
                    brief_path = joined
                sources.append(
                    {
                        "id": source_id,
                        "path": p,
                        "source": fields[1],
                        "evidence_review": re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", fields[2]),
                        "integration_audit": fields[3],
                        "last_verified": fields[4],
                        "can_support": fields[5],
                        "current_use": fields[6],
                        "brief_path": brief_path,
                    }
                )
        if not headers:
            raise ValueError(f"Missing supported source-registry schema in {p}")
    if len({x["id"] for x in sources}) != len(sources):
        raise ValueError("Duplicate source ID in represented registries")
    artifacts, directories = path_inventory(root, config, records, texts, instructions)
    entries = {row["path"]: row for row in artifacts + directories}
    for instruction in instructions:
        path = instruction["path"]
        ancestors = [path] + [p.as_posix() for p in PurePosixPath(path).parents]
        if any(not in_scope(entries[p], "current") for p in ancestors):
            raise ValueError(
                f"Historical/generated AGENTS.md must use an inert archive name: {path}"
            )
    return {
        "schema_version": VERSION,
        "repository": config["repository"],
        "capabilities": [
            "local-owner-candidates",
            "complete-file-and-directory-inventory",
            "path-purpose-and-role",
            "validation-routes",
            "content-freshness",
        ],
        "limitations": [
            "Navigation only; read owning sources and current GitHub state.",
            "No semantic graph, impact traversal or trusted tested-merge comparison.",
            "Ignored local build/cache directories are excluded; tracked exclusions fail.",
            "Content hashes attest bytes, not publication rights or scientific acceptance.",
            "Lexical miss or untranslated query does not establish absence.",
        ],
        "source_identity": {
            "algorithm": "sha256-path-content-v2",
            "digest": digest(canonical(records).encode()),
            "inputs": records,
        },
        "producer": {
            "path": SCRIPT,
            "sha256": digest(safe_path(root, SCRIPT).read_bytes()),
            "config_path": config_path,
            "config_sha256": digest(safe_path(root, config_path).read_bytes()),
        },
        "owners": config["owners"],
        "terms": terms,
        "sources": sources,
        "instructions": sorted(instructions, key=lambda x: x["path"]),
        "artifacts": artifacts,
        "directories": directories,
        "validation_routes": config.get("validation_routes", []),
        "upstream": config.get("upstream", {}),
        "cross_repository": config.get("cross_repository", []),
    }


def verify(root, config_path):
    expected = build(root, config_path)
    config = load_config(root, config_path)
    path = safe_path(root, config["output"])
    if not path.is_file():
        raise ValueError("Missing RI context; build it or use direct repository reading")
    if path.read_bytes() != serialize_json(expected).encode("utf-8"):
        raise ValueError("Stale or altered RI context; rebuild or use direct repository reading")
    readable = safe_path(root, config["map_output"])
    if not readable.is_file() or readable.read_bytes() != render_map(expected).encode("utf-8"):
        raise ValueError("Missing, stale or altered repository map; rebuild")
    return expected


def lookup(surface, query):
    q = " ".join(query.casefold().split())
    if not q:
        raise ValueError("Empty query")
    # Explicit aliases are explainable candidates; generic matches cannot claim ownership.
    owners = [
        o
        for o in surface["owners"]
        if any(q in a.casefold() or a.casefold() in q for a in o["queries"])
    ]
    terms = [t for t in surface["terms"] if q in t["term"].casefold()]
    sources = [
        s for s in surface["sources"] if q in s["id"].casefold() or q in s["source"].casefold()
    ]
    artifacts = [
        a
        for a in surface["artifacts"]
        if q in (a["title"] + " " + a["path"] + " " + a["purpose"]).casefold()
    ]
    directories = [
        d for d in surface["directories"] if q in (d["path"] + " " + d["purpose"]).casefold()
    ]
    if sources and not owners:
        owners = [o for o in surface["owners"] if o["path"] in {s["path"] for s in sources}]
    if terms and not owners:
        owners = [o for o in surface["owners"] if o["path"] in {t["path"] for t in terms}]
    return {
        "repository": surface["repository"],
        "query": query,
        "status": "candidates-read-sources"
        if owners or terms or sources or artifacts or directories
        else "unresolved-use-direct-search",
        "owner_candidates": owners,
        "terms": terms,
        "sources": sources,
        "artifacts": artifacts,
        "directories": directories,
    }


def path_under(path, prefix):
    return prefix in {None, "."} or path == prefix or path.startswith(prefix + "/")


def normalize_prefix(prefix):
    if prefix is None or prefix == ".":
        return prefix
    prefix = prefix.rstrip("/")
    if (
        not prefix
        or PurePosixPath(prefix).is_absolute()
        or any(part in {"", ".", ".."} for part in prefix.split("/"))
    ):
        raise ValueError("Unsafe navigation prefix")
    return prefix


def context_metadata(surface, result):
    """Full request context before paging, including directory descendants/owners."""
    rows = result.get("artifacts", result.get("files", [])) + result["directories"]
    directories = [x["path"] for x in result["directories"]]
    context_rows = {x["path"]: x for x in rows}
    context_rows.update(
        {
            x["path"]: x
            for x in surface["artifacts"] + surface["directories"]
            if any(path_under(x["path"], directory) for directory in directories)
        }
    )
    owners = {x["owner"] for x in context_rows.values()}
    paths = set(context_rows) | owners
    paths.update(x["path"] for x in result.get("owner_candidates", []))
    paths.update(x["path"] for x in result.get("terms", []) + result.get("sources", []))
    return {
        "editing_owners": sorted(owners),
        "instructions": sorted(
            {p for path in paths for p in instruction_paths(path, surface["instructions"])}
        ),
        # Configured route prefixes can name file families (e.g. issue-). Keep
        # those lexical semantics distinct from user component-boundary filters.
        "validation_routes": [
            route
            for route in surface["validation_routes"]
            if any(p.startswith(tuple(route["paths"])) for p in paths)
        ],
        "note": "Read owners; commands are suggestions, not executed checks. Revalidate live issue/PR state.",
    }


def response_size(result):
    result["response_bytes"] = 0
    result["response_advisory_threshold_bytes"] = RESPONSE_ADVISORY_BYTES
    result["response_advisory"] = "none"
    for _ in range(10):
        size = len(serialize_json(result).encode("utf-8"))
        if size > RESPONSE_ADVISORY_BYTES:
            result["response_advisory"] = (
                "narrow-request-or-read-direct-owners; metadata-is-complete"
            )
        if size == result["response_bytes"]:
            return result
        result["response_bytes"] = size
    raise ValueError("Response byte accounting did not converge")


def scoped_lookup(
    surface,
    query=None,
    *,
    command="query",
    scope="all",
    prefix=None,
    limit=DEFAULT_PAGE_LIMIT,
    cursor=None,
):
    """Opt-in retrieval only; legacy lookup and stored projection stay complete."""
    if command not in {"query", "context-for-task", "inventory"}:
        raise ValueError("Invalid scoped command")
    if type(limit) is not int or not 1 <= limit <= MAX_PAGE_LIMIT:
        raise ValueError("Page limit must be an integer from1 to100")
    prefix = normalize_prefix(prefix)
    # Validate scope even when no row matches.
    in_scope({"role": "source"}, scope)
    if command == "inventory":
        result = {
            "repository": surface["repository"],
            "files": surface["artifacts"],
            "directories": surface["directories"],
        }
        hit_key = "files"
    else:
        result = lookup(surface, query)
        hit_key = "artifacts"
    indexed = {x["path"]: x for x in surface["artifacts"] + surface["directories"]}

    def selected(row):
        return in_scope(row, scope) and path_under(row["path"], prefix)

    for key in (hit_key, "directories"):
        result[key] = [x for x in result[key] if selected(x)]
    for key in ("owner_candidates", "terms", "sources"):
        if key in result:
            result[key] = [x for x in result[key] if selected(indexed[x["path"]])]
    if command != "inventory":
        result["status"] = (
            "candidates-read-sources"
            if any(
                result[k] for k in ("owner_candidates", "terms", "sources", hit_key, "directories")
            )
            else "unresolved-use-direct-search"
        )
    result.update(context_metadata(surface, result))
    fingerprint = digest(
        canonical(
            {
                "command": command,
                "query": " ".join((query or "").casefold().split()),
                "scope": scope,
                "prefix": prefix,
                "limit": limit,
                "source_digest": surface["source_identity"]["digest"],
            }
        ).encode("utf-8")
    )
    hits = sorted(result[hit_key] + result["directories"], key=lambda x: (x["kind"], x["path"]))
    offset = 0
    if cursor is not None:
        match = re.fullmatch(r"(0|[1-9][0-9]*):([0-9a-f]{64})", cursor)
        if not match or match[2] != fingerprint:
            raise ValueError("Cursor does not match request/source; start a new first page")
        offset = int(match[1])
        if offset > len(hits):
            raise ValueError("Cursor offset exceeds complete hit count")
    page = hits[offset : offset + limit]
    result[hit_key] = [x for x in page if x["kind"] == "file"]
    result["directories"] = [x for x in page if x["kind"] == "directory"]
    remaining = len(hits) - offset - len(page)
    result["scope"], result["prefix"] = scope, prefix
    result["source_digest"] = surface["source_identity"]["digest"]
    result["pagination"] = {
        "order": "kind,path",
        "limit": limit,
        "offset": offset,
        "total": len(hits),
        "returned": len(page),
        "remaining": remaining,
        "request_fingerprint": fingerprint,
        "next_cursor": f"{offset + len(page)}:{fingerprint}" if remaining else None,
    }
    return response_size(result)


def capacity(root, outputs):
    """Complete metadata inventory, not content hashing, catalog or freshness proof.

    Traverse admitted inputs even when over a content bound to explain it. Reads
    are one byte/file for accessibility, not unbounded over-limit content loads.
    Unsafe/missing/unreadable inputs fail visibly rather than receiving a report.
    """
    sizes = []
    for relative, path in repository_files(root, outputs):
        with path.open("rb") as stream:
            stream.read(1)
        sizes.append({"path": relative, "bytes": path.stat().st_size})
    check_tracked_inputs(root, {x["path"] for x in sizes} | set(outputs))
    parsed = [x for x in sizes if PurePosixPath(x["path"]).suffix.lower() in TEXT_SUFFIXES]

    def largest(rows):
        return max(rows, key=lambda x: (x["bytes"], x["path"]), default={"path": None, "bytes": 0})

    hash_max, text_max = largest(sizes), largest(parsed)
    values = {
        "files": (len(sizes) + len(outputs), MAX_FILES),
        "hash_total_bytes": (sum(x["bytes"] for x in sizes), MAX_HASH_TOTAL_BYTES),
        "hash_file_bytes": (hash_max["bytes"], MAX_HASH_FILE_BYTES),
        "text_total_bytes": (sum(x["bytes"] for x in parsed), MAX_TOTAL_BYTES),
        "text_file_bytes": (text_max["bytes"], MAX_FILE_BYTES),
    }
    metrics = {
        key: {"used": used, "limit": bound, "margin": bound - used}
        for key, (used, bound) in values.items()
    }
    derived = []
    for relative in sorted(outputs):
        path = safe_path(root, relative)
        if path.exists() and not path.is_file():
            raise ValueError(f"Unsupported derived output: {relative}")
        derived.append({"path": relative, "bytes": path.stat().st_size if path.is_file() else None})
    violations = [key for key, metric in metrics.items() if metric["margin"] < 0]
    return {
        "kind": "capacity-metadata-diagnostic",
        "inventory_complete": True,
        "content_integrity_verified": False,
        "catalog_and_freshness_verified": False,
        "within_hard_limits": not violations,
        "hard_limit_violations": violations,
        "hash_input_files": len(sizes),
        "metrics": metrics,
        "largest_hash_input": hash_max,
        "largest_parsed_text": text_max,
        "derived_outputs": derived,
        "top_hash_inputs": sorted(sizes, key=lambda x: (-x["bytes"], x["path"]))[:10],
        "advisories": [
            "hash headroom below10000000bytes; use reviewed lossless archival maintenance"
        ]
        if metrics["hash_total_bytes"]["margin"] < HASH_HEADROOM_ADVISORY
        else [],
        "note": "Metadata/readability only; build/verify still enforce every original hard limit and input hash.",
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--config", required=True, help="Repository-relative config path")
    parser.add_argument(
        "command", choices=("build", "verify", "query", "inventory", "context-for-task", "capacity")
    )
    parser.add_argument("query_text", nargs="?")
    parser.add_argument("--scope", choices=("current", "history", "all"))
    parser.add_argument("--prefix", help="Exact file/directory or component-boundary subtree")
    parser.add_argument("--limit", type=int, help="Scoped hit count,1..100 (default20)")
    parser.add_argument(
        "--cursor", help="Continuation offset:request fingerprint from prior response"
    )
    args = parser.parse_args(argv)
    try:
        root = args.root.resolve()
        scoped = any(x is not None for x in (args.scope, args.prefix, args.limit, args.cursor))
        if scoped and args.command not in {"query", "context-for-task", "inventory"}:
            raise ValueError("Scope/page options require a retrieval command")
        if args.query_text is not None and args.command not in {"query", "context-for-task"}:
            raise ValueError("Query text requires query/context-for-task")
        if args.command == "capacity":
            config = load_config(root, args.config)
            result = capacity(root, [config["output"], config["map_output"]])
            print(serialize_json(result), end="")
            return 0 if result["within_hard_limits"] else 1
        if args.command == "build":
            surface = build(root, args.config)
            config = load_config(root, args.config)
            # Render/validate both complete payloads before writing either view.
            views = [
                (config["output"], serialize_json(surface)),
                (config["map_output"], render_map(surface)),
            ]
            for relative, body in views:
                target = safe_path(root, relative)
                target.parent.mkdir(parents=True, exist_ok=True)
                temporary = target.with_suffix(".tmp")
                safe_path(root, temporary.relative_to(root).as_posix())
                temporary.write_bytes(body.encode("utf-8"))
                os.replace(temporary, target)
            print(
                f"Built RI views: {len(surface['artifacts'])} files, {len(surface['directories'])} directories"
            )
        else:
            surface = verify(root, args.config)
            if args.command == "verify":
                print("Repository Intelligence context is fresh.")
                return 0
            if args.command != "inventory" and not args.query_text:
                raise ValueError("query requires text")
            if scoped:
                result = scoped_lookup(
                    surface,
                    args.query_text,
                    command=args.command,
                    scope=args.scope or "all",
                    prefix=args.prefix,
                    limit=args.limit if args.limit is not None else DEFAULT_PAGE_LIMIT,
                    cursor=args.cursor,
                )
            elif args.command == "inventory":
                result = {"files": surface["artifacts"], "directories": surface["directories"]}
            else:
                result = lookup(surface, args.query_text)
                if args.command == "context-for-task":
                    metadata = context_metadata(surface, result)
                    metadata.pop("editing_owners")
                    result.update(metadata)
            print(serialize_json(result), end="")
    except (ValueError, OSError, UnicodeError, KeyError, TypeError) as exc:
        print(f"RI unavailable: {exc}. Read authoritative sources directly.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
