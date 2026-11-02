#!/usr/bin/env python3
"""Reorder a pinned native presentation and update only its delivery labels.

The recipe pins the complete input, source part order and footer shape IDs.
Slide relationships and every unrelated package payload remain byte-identical.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

from integrate_native_slide import (
    DRAWING_NS,
    PRESENTATION_NS,
    RELATIONSHIP_NS,
    digest,
    relationships,
    require,
)


def replace_once(data: bytes, before: bytes, after: bytes) -> bytes:
    require(data.count(before) == 1, f"Expected one exact label: {before!r}")
    return data.replace(before, after, 1)


def update_footer(data: bytes, shape_id: int, before: str, after: str) -> bytes:
    matches = []
    for match in re.finditer(rb"<p:sp>.*?</p:sp>", data, re.DOTALL):
        # Parse in the parent namespace context while preserving original bytes.
        wrapper = (
            f'<p:sld xmlns:p="{PRESENTATION_NS}" xmlns:a="{DRAWING_NS}" '
            f'xmlns:r="{RELATIONSHIP_NS}" '
            'xmlns:a16="http://schemas.microsoft.com/office/drawing/2014/main">'
        ).encode()
        shape = ET.fromstring(wrapper + match.group() + b"</p:sld>")[0]
        identifier = shape.find(
            f"{{{PRESENTATION_NS}}}nvSpPr/{{{PRESENTATION_NS}}}cNvPr"
        )
        if identifier is not None and identifier.get("id") == str(shape_id):
            texts = [node.text for node in shape.iter(f"{{{DRAWING_NS}}}t")]
            require(texts == [before], f"Footer shape {shape_id} has unexpected text")
            matches.append(match)
    require(len(matches) == 1, f"Expected one footer shape {shape_id}")
    match = matches[0]
    updated = replace_once(
        match.group(), f"<a:t>{before}</a:t>".encode(), f"<a:t>{after}</a:t>".encode()
    )
    return data[: match.start()] + updated + data[match.end() :]


def reorder(source_path: Path, recipe: dict, output_path: Path) -> dict:
    require(
        not output_path.exists() and not output_path.is_symlink(),
        "Output already exists",
    )
    require(recipe["schema"] == "native-slide-reorder.v1", "Unsupported recipe schema")
    source_bytes = source_path.read_bytes()
    require(digest(source_bytes) == recipe["source_sha256"], "Source SHA-256 mismatch")
    order = recipe["source_positions_in_delivery_order"]
    source_order = recipe["source_slide_parts"]
    require(
        all(type(number) is int for number in order)
        and sorted(order) == list(range(1, len(source_order) + 1)),
        "Order must be a complete one-based permutation",
    )
    changed_positions = {old for new, old in enumerate(order, 1) if new != old}
    footers = recipe["footer_shape_ids_by_source_position"]
    require(
        set(footers) == {str(number) for number in changed_positions},
        "Footer coverage mismatch",
    )
    require(
        all(type(value) is int and value > 0 for value in footers.values()),
        "Invalid shape ID",
    )
    with zipfile.ZipFile(source_path) as archive:
        require(
            len(archive.namelist()) == len(set(archive.namelist())),
            "Duplicate ZIP member names",
        )
        require(archive.testzip() is None, "Source ZIP integrity failure")
        parts = {name: archive.read(name) for name in archive.namelist()}
        presentation = parts["ppt/presentation.xml"]
        slide_list = ET.fromstring(presentation).find(f"{{{PRESENTATION_NS}}}sldIdLst")
        require(slide_list is not None, "Missing native slide list")
        rels = relationships(parts, "ppt/presentation.xml")
        actual = []
        for element in slide_list:
            kind, target = rels[element.attrib[f"{{{RELATIONSHIP_NS}}}id"]]
            require(kind == "slide", "Unexpected presentation relationship")
            actual.append(target)
        require(actual == source_order, "Source slide order mismatch")
        entries = re.findall(rb"<p:sldId\s[^>]+/>", presentation)
        require(len(entries) == len(order), "Unsupported native slide list encoding")
        replacements = {
            "ppt/presentation.xml": replace_once(
                presentation,
                b"".join(entries),
                b"".join(entries[old - 1] for old in order),
            )
        }
        for new, old in enumerate(order, 1):
            if new == old:
                continue
            slide = actual[old - 1]
            replacements[slide] = update_footer(
                parts[slide], footers[str(old)], f"{old:02d}", f"{new:02d}"
            )
            note_parts = [
                target
                for kind, target in relationships(parts, slide).values()
                if kind == "notesSlide"
            ]
            require(len(note_parts) == 1, f"Expected one attached notes part: {slide}")
            note = note_parts[0]
            replacements[note] = replace_once(
                parts[note],
                f"R13 STAGE SCRIPT | SLIDE {old:02d} |".encode(),
                f"R13 STAGE SCRIPT | SLIDE {new:02d} |".encode(),
            )
        require(
            len(replacements) == 1 + 2 * len(changed_positions),
            "Unexpected replacement overlap",
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("xb") as stream, zipfile.ZipFile(stream, "w") as output:
            output.comment = archive.comment
            for entry in archive.infolist():
                output.writestr(
                    copy.copy(entry),
                    replacements.get(entry.filename, parts[entry.filename]),
                )
    with zipfile.ZipFile(output_path) as output:
        require(output.testzip() is None, "Output ZIP integrity failure")
        require(output.namelist() == list(parts), "Package member inventory changed")
        changed = [name for name in parts if output.read(name) != parts[name]]
        require(set(changed) == set(replacements), "Unexpected changed payload set")
        require(
            all(output.read(name) == data for name, data in replacements.items()),
            "Replacement payload mismatch",
        )
    require(source_path.read_bytes() == source_bytes, "Source changed during reorder")
    return {
        "source_sha256": digest(source_bytes),
        "output_sha256": digest(output_path.read_bytes()),
        "source_positions_in_delivery_order": order,
        "changed_parts": changed,
        "unchanged_part_count": len(parts) - len(changed),
        "relationship_part_count": sum(name.endswith(".rels") for name in parts),
        "all_relationship_parts_unchanged": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--recipe", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    try:
        result = reorder(args.source, json.loads(args.recipe.read_text()), args.output)
    except (
        ValueError,
        KeyError,
        TypeError,
        OSError,
        ET.ParseError,
        zipfile.BadZipFile,
    ) as error:
        print(f"Native slide reorder refused: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
