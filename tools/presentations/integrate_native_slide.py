#!/usr/bin/env python3
"""Graft a self-contained native slide and append-only notes into a compatible deck.

This bounded helper retains the source package and all its relationships. It
refuses new media, hyperlinks, charts or other dependencies instead of attempting
to import them. It never rewrites either input or an existing output.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import posixpath
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


PRESENTATION_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
DRAWING_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
RELATIONSHIP_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PACKAGE_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def relationships(parts: dict[str, bytes], owner: str) -> dict[str, tuple[str, str]]:
    directory, filename = posixpath.split(owner)
    rel_path = posixpath.join(directory, "_rels", filename + ".rels")
    if rel_path not in parts:
        return {}
    result = {}
    for rel in ET.fromstring(parts[rel_path]).findall(f"{{{PACKAGE_NS}}}Relationship"):
        require(rel.get("TargetMode", "Internal") == "Internal", f"External link: {owner}")
        kind = rel.attrib["Type"]
        require(kind.startswith(RELATIONSHIP_NS + "/"), f"Unsupported relation: {kind}")
        target = rel.attrib["Target"]
        target = posixpath.normpath(
            target.lstrip("/") if target.startswith("/") else posixpath.join(directory, target)
        )
        require(target in parts, f"Missing relationship target: {target}")
        identifier = rel.attrib["Id"]
        require(identifier not in result, f"Duplicate relationship ID in {owner}")
        result[identifier] = (kind.removeprefix(RELATIONSHIP_NS + "/"), target)
    return result


def dependency_targets(parts: dict[str, bytes], owner: str, allowed: set[str]) -> dict[str, str]:
    rels = relationships(parts, owner)
    targets = {kind: target for kind, target in rels.values()}
    require(len(targets) == len(rels), f"Multiple dependencies of the same kind: {owner}")
    require(set(targets) == allowed, f"Unsupported dependencies in {owner}: {sorted(targets)}")
    return targets


def slide_part(parts: dict[str, bytes], number: int) -> str:
    root = ET.fromstring(parts["ppt/presentation.xml"])
    slides = root.findall(f"{{{PRESENTATION_NS}}}sldIdLst/{{{PRESENTATION_NS}}}sldId")
    require(1 <= number <= len(slides), f"Slide {number} is outside this deck's slide list")
    rel_id = slides[number - 1].attrib[f"{{{RELATIONSHIP_NS}}}id"]
    kind, target = relationships(parts, "ppt/presentation.xml")[rel_id]
    require(kind == "slide", f"Presentation entry {number} does not target a slide")
    return target


def normalized_xml(parts: dict[str, bytes], owner: str) -> str:
    """Compare master meaning while accepting regenerated relationship IDs."""
    root = ET.fromstring(parts[owner])
    rels = relationships(parts, owner)
    for element in root.iter():
        for name, value in element.attrib.items():
            if name.startswith("{" + RELATIONSHIP_NS + "}"):
                require(value in rels, f"Unresolved relationship in {owner}")
                element.set(name, "|".join(rels[value]))
    return ET.canonicalize(ET.tostring(root, encoding="unicode"))


def note_text(data: bytes) -> str:
    root = ET.fromstring(data)
    return "\n".join("".join(paragraph.itertext()) for paragraph in root.iter(f"{{{DRAWING_NS}}}p"))


def check_compatibility(
    source: dict[str, bytes], donor: dict[str, bytes], slide: int, donor_slide: int
) -> tuple[dict[str, bytes], list[str]]:
    source_slide = slide_part(source, slide)
    donor_slide_part = slide_part(donor, donor_slide)
    source_targets = dependency_targets(source, source_slide, {"slideLayout", "notesSlide"})
    donor_targets = dependency_targets(donor, donor_slide_part, {"slideLayout", "notesSlide"})
    source_notes = source_targets["notesSlide"]
    donor_notes = donor_targets["notesSlide"]
    source_note_targets = dependency_targets(source, source_notes, {"slide", "notesMaster"})
    donor_note_targets = dependency_targets(donor, donor_notes, {"slide", "notesMaster"})
    require(source_note_targets["slide"] == source_slide, "Source notes point to another slide")
    require(donor_note_targets["slide"] == donor_slide_part, "Donor notes point to another slide")

    for parts, owners in (
        (source, [source_slide, source_notes]),
        (donor, [donor_slide_part, donor_notes]),
    ):
        for owner in owners:
            root = ET.fromstring(parts[owner])
            require(
                not any(
                    name.startswith("{" + RELATIONSHIP_NS + "}")
                    for element in root.iter()
                    for name in element.attrib
                ),
                f"Embedded dependency or relationship reference in {owner}",
            )

    for tag in ("sldSz", "notesSz"):
        source_size = ET.fromstring(source["ppt/presentation.xml"]).find(
            f"{{{PRESENTATION_NS}}}{tag}"
        )
        donor_size = ET.fromstring(donor["ppt/presentation.xml"]).find(
            f"{{{PRESENTATION_NS}}}{tag}"
        )
        require(source_size is not None and donor_size is not None, f"Missing {tag}")
        require(source_size.attrib == donor_size.attrib, f"Incompatible {tag}")

    layout = source_targets["slideLayout"]
    notes_master = source_note_targets["notesMaster"]
    require(layout == donor_targets["slideLayout"], "Different layout paths")
    require(notes_master == donor_note_targets["notesMaster"], "Different notes master paths")
    layout_targets = dependency_targets(source, layout, {"slideMaster"})
    require(
        layout_targets == dependency_targets(donor, layout, {"slideMaster"}),
        "Different layout dependencies",
    )
    master = layout_targets["slideMaster"]
    master_targets = dependency_targets(source, master, {"slideLayout", "theme"})
    require(
        master_targets == dependency_targets(donor, master, {"slideLayout", "theme"}),
        "Different slide master dependencies",
    )
    require(master_targets["slideLayout"] == layout, "Unsupported additional master layout")
    notes_targets = dependency_targets(source, notes_master, {"theme"})
    require(
        notes_targets == dependency_targets(donor, notes_master, {"theme"}),
        "Different notes master dependencies",
    )

    shared = [layout, notes_master, master_targets["theme"], notes_targets["theme"]]
    for owner in shared:
        require(source[owner] == donor[owner], f"Shared part differs: {owner}")
    for theme in (master_targets["theme"], notes_targets["theme"]):
        require(
            not relationships(source, theme) and not relationships(donor, theme),
            f"Unsupported theme dependency: {theme}",
        )
    require(
        normalized_xml(source, master) == normalized_xml(donor, master),
        "Slide masters differ beyond regenerated relationship IDs",
    )
    require(
        note_text(donor[donor_notes]).startswith(note_text(source[source_notes])),
        "Donor notes do not preserve the complete source notes as a prefix",
    )
    return {source_slide: donor[donor_slide_part], source_notes: donor[donor_notes]}, shared


def integrate(
    source_path: Path, donor_path: Path, slide: int, donor_slide: int, output_path: Path
) -> dict:
    require(
        not output_path.exists() and not output_path.is_symlink(),
        f"Refusing to overwrite: {output_path}",
    )
    source_bytes = source_path.read_bytes()
    donor_bytes = donor_path.read_bytes()
    with zipfile.ZipFile(source_path) as source_zip, zipfile.ZipFile(donor_path) as donor_zip:
        for archive in (source_zip, donor_zip):
            require(
                len(archive.namelist()) == len(set(archive.namelist())),
                "Duplicate ZIP member names are unsupported",
            )
            require(archive.testzip() is None, "Input ZIP integrity check failed")
        source = {name: source_zip.read(name) for name in source_zip.namelist()}
        donor = {name: donor_zip.read(name) for name in donor_zip.namelist()}
        replacements, shared = check_compatibility(source, donor, slide, donor_slide)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("xb") as stream, zipfile.ZipFile(stream, "w") as output_zip:
            output_zip.comment = source_zip.comment
            for entry in source_zip.infolist():
                output_zip.writestr(
                    copy.copy(entry), replacements.get(entry.filename, source[entry.filename])
                )

    with zipfile.ZipFile(output_path) as output_zip:
        require(output_zip.testzip() is None, "Output ZIP integrity check failed")
        require(output_zip.namelist() == list(source), "Package member inventory changed")
        changed = [name for name in source if output_zip.read(name) != source[name]]
        require(set(changed).issubset(replacements), "An unrelated package payload changed")
        require(
            all(output_zip.read(name) == data for name, data in replacements.items()),
            "Replacement payload does not match the donor",
        )
    require(source_path.read_bytes() == source_bytes, "Source file changed during integration")
    require(donor_path.read_bytes() == donor_bytes, "Donor file changed during integration")
    return {
        "source_sha256": digest(source_bytes),
        "donor_sha256": digest(donor_bytes),
        "output_sha256": digest(output_path.read_bytes()),
        "source_part_count": len(source),
        "donor_part_count": len(donor),
        "output_part_count": len(source),
        "changed_parts": changed,
        "unchanged_part_count": len(source) - len(changed),
        "all_existing_relationships_preserved": True,
        "shared_parts_equal": shared,
        "master_equal_after_relationship_resolution": True,
        "complete_source_notes_prefix_preserved": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--donor", required=True, type=Path)
    parser.add_argument("--slide", required=True, type=int, help="One-based source slide position")
    parser.add_argument(
        "--donor-slide", required=True, type=int, help="One-based donor slide position"
    )
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    try:
        result = integrate(args.source, args.donor, args.slide, args.donor_slide, args.output)
    except (ValueError, KeyError, OSError, ET.ParseError, zipfile.BadZipFile) as error:
        print(f"Native slide integration refused: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
