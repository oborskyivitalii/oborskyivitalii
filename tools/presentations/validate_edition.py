#!/usr/bin/env python3
"""Validate the mechanical identity of a versioned presentation edition."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from typing import Any


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def count_pptx_parts(path: Path, prefix: str, pattern: str) -> int:
    matcher = re.compile(pattern)
    with zipfile.ZipFile(path) as archive:
        return sum(
            1
            for name in archive.namelist()
            if name.startswith(prefix) and matcher.fullmatch(name)
        )


def count_pdf_pages(path: Path) -> int:
    # The repository does not require a PDF library for this bounded structural check.
    data = path.read_bytes()
    return len(re.findall(rb"/Type\s*/Page(?!s)\b", data))


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("edition_dir", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()

    root = args.edition_dir.resolve()
    manifest_path = root / "edition.json"
    errors: list[str] = []
    require(root.is_dir(), f"edition directory does not exist: {root}", errors)
    require(manifest_path.is_file(), f"missing manifest: {manifest_path}", errors)
    if errors:
        print(json.dumps({"ok": False, "errors": errors}, indent=2))
        return 1

    manifest: dict[str, Any] = json.loads(manifest_path.read_text(encoding="utf-8"))
    revision = str(manifest.get("revision", ""))
    match = re.fullmatch(r"R([1-9][0-9]*)", revision)
    require(match is not None, f"invalid revision: {revision!r}", errors)
    expected_dir = revision.lower()
    require(
        root.name == expected_dir,
        f"directory must be {expected_dir}, got {root.name}",
        errors,
    )

    artifacts = manifest.get("artifacts", {})
    required = ("pptx", "pdf", "notes")
    observed: dict[str, Any] = {}
    for key in required:
        item = artifacts.get(key)
        require(isinstance(item, dict), f"missing artifacts.{key}", errors)
        if not isinstance(item, dict):
            continue
        rel = item.get("path")
        require(isinstance(rel, str) and rel, f"missing artifacts.{key}.path", errors)
        if not isinstance(rel, str) or not rel:
            continue
        path = root.parent.parent.parent / rel
        require(path.is_file(), f"missing artifact: {rel}", errors)
        if not path.is_file():
            continue
        actual = {"bytes": path.stat().st_size, "sha256": sha256(path)}
        observed[key] = actual
        require(
            actual["bytes"] == item.get("bytes"),
            f"byte mismatch: {rel}",
            errors,
        )
        require(
            actual["sha256"] == item.get("sha256"),
            f"sha256 mismatch: {rel}",
            errors,
        )
        if key in ("pptx", "pdf") and match:
            require(
                f"-r{match.group(1)}." in path.name,
                f"filename does not carry revision {revision}: {path.name}",
                errors,
            )

    pptx_item = artifacts.get("pptx", {})
    pdf_item = artifacts.get("pdf", {})
    pptx_path = root.parent.parent.parent / pptx_item.get("path", "")
    pdf_path = root.parent.parent.parent / pdf_item.get("path", "")
    if pptx_path.is_file():
        observed["pptx_slide_count"] = count_pptx_parts(
            pptx_path,
            "ppt/slides/",
            r"ppt/slides/slide[0-9]+\.xml",
        )
        observed["pptx_notes_count"] = count_pptx_parts(
            pptx_path,
            "ppt/notesSlides/",
            r"ppt/notesSlides/notesSlide[0-9]+\.xml",
        )
        require(
            observed["pptx_slide_count"] == manifest.get("slide_count"),
            "PPTX slide count mismatch",
            errors,
        )
        require(
            observed["pptx_notes_count"] == manifest.get("notes_count"),
            "PPTX notes count mismatch",
            errors,
        )
    if pdf_path.is_file():
        observed["pdf_page_count"] = count_pdf_pages(pdf_path)
        require(
            observed["pdf_page_count"] == manifest.get("pdf_page_count"),
            "PDF page count mismatch",
            errors,
        )

    report = {
        "ok": not errors,
        "edition": revision,
        "path": str(root),
        "observed": observed,
        "errors": errors,
    }
    if args.as_json or errors:
        print(json.dumps(report, indent=2))
    else:
        print(f"OK {revision}: {observed}")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
