"""Reproduce the bounded R13 review-PDF correction from the preserved R12 PDF.

This edits PDF text operators, retaining native text order, typeface families, images,
links, bookmarks, geometry and pagination. It is a review artifact operation,
not the managed publication exporter. The two revised BibTeX lines re-embed
DejaVu Sans Mono because the old subset lacks digit 3. Requires PyMuPDF and
the named system font; byte-identical reproduction across environments is unverified.
"""

import hashlib
import re
from pathlib import Path

import fitz


def unicode_map(document, font_xref):
    reference = document.xref_get_key(font_xref, "ToUnicode")[1]
    if reference == "null":
        return None
    stream = document.xref_stream(int(reference.split()[0])).decode("ascii")
    mapping = {}
    for block in re.findall(r"beginbfchar(.*?)endbfchar", stream, re.S):
        for cid, value in re.findall(r"<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>", block):
            mapping[int(cid, 16)] = bytes.fromhex(value).decode("utf-16-be")
    if not mapping:
        raise ValueError("Expected the source PDF's explicit Unicode map")
    return mapping


def revise_pdf(source, destination):
    expected = "aa6ef80d0a7f02ce9355df91137737e106b0493078d69ffd1bf12a3ed47eca01"
    if hashlib.sha256(source.read_bytes()).hexdigest() != expected:
        raise ValueError("Unexpected R12 source bytes")
    document = fitz.open(source)
    prompt_changes = 0
    label_changes = 0
    mono_path = Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf")
    mono_font = fitz.Font(fontfile=str(mono_path))
    edited_streams = set()
    for index, page in enumerate(document):
        maps = {font[4]: unicode_map(document, font[0]) for font in page.get_fonts()}

        def revise_object(match):
            nonlocal prompt_changes, label_changes
            text_object = match.group(0)
            mapping = None
            current_font = None
            current_size = None

            def revise_token(token_match):
                nonlocal mapping, current_font, current_size, prompt_changes, label_changes
                token = token_match.group(0)
                if token_match.group(1):
                    current_font = token_match.group(1)
                    current_size = token_match.group(2)
                    mapping = maps.get(current_font)
                    return token
                if mapping is None:
                    if "R12" in token:
                        label_changes += token.count("R12")
                        return token.replace("R12", "R13")
                    def revise_ansi(hex_match):
                        nonlocal label_changes
                        raw = bytes.fromhex(hex_match.group(1))
                        label_changes += raw.count(b"R12")
                        return "<" + raw.replace(b"R12", b"R13").hex() + ">"
                    return re.sub(r"<([0-9a-fA-F]+)>", revise_ansi, token)
                reverse = {value: cid for cid, value in mapping.items() if len(value) == 1}
                codes = re.findall(r"<([0-9a-fA-F]+)>", token)
                glyphs = [int(code[offset:offset + 4], 16)
                          for code in codes for offset in range(0, len(code), 4)]
                characters = [mapping[cid] for cid in glyphs]
                decoded = "".join(characters)
                if "R12" in decoded and "3" not in reverse:
                    if current_font != "IKCJUC":
                        raise ValueError("Unexpected font missing revision digit")
                    page.insert_font(fontname="R13Mono", fontfile=str(mono_path))
                    replacement = decoded.replace("R12", "R13")
                    encoded = "".join(f"{mono_font.has_glyph(ord(char)):04x}"
                                      for char in replacement)
                    label_changes += decoded.count("R12")
                    return (f"/R13Mono {current_size} Tf [<{encoded}>] TJ "
                            f"/{current_font} {current_size} Tf")
                if index == 11 and decoded == "What if not?":
                    replacement = "The two shifts fail differently"
                    prompt_changes += 1
                    encoded = "".join(f"{reverse[character]:04x}" for character in replacement)
                    return "[<" + encoded + ">] TJ"
                changes = {}
                for position in range(len(characters) - 2):
                    if characters[position:position + 3] == ["R", "1", "2"]:
                        changes[position + 2] = reverse["3"]
                        label_changes += 1
                position = 0

                def revise_hex(hex_match):
                    nonlocal position
                    raw = hex_match.group(1)
                    output = ""
                    for offset in range(0, len(raw), 4):
                        output += (f"{changes[position]:04x}" if position in changes
                                   else raw[offset:offset + 4])
                        position += 1
                    return "<" + output + ">"
                return re.sub(r"<([0-9a-fA-F]+)>", revise_hex, token)

            return re.sub(
                r"/([A-Za-z0-9_-]+)\s+([\d.]+)\s+Tf|\[[^\]]*\]\s*TJ|"
                r"<[0-9a-fA-F]+>\s*Tj|\([^)]*\)\s*Tj",
                revise_token,
                text_object,
            )

        streams = page.get_contents() + [item[0] for item in page.get_xobjects()]
        for xref in streams:
            if xref in edited_streams:
                continue
            edited_streams.add(xref)
            old = document.xref_stream(xref).decode("latin1")
            new = re.sub(r"BT\b.*?\bET", revise_object, old, flags=re.S)
            if new != old:
                document.update_stream(xref, new.encode("latin1"))
    if prompt_changes != 1:
        raise ValueError(f"Expected exactly one chapter-6 prompt; got {prompt_changes}")
    metadata = document.metadata
    metadata["title"] = metadata["title"].replace("R12", "R13")
    metadata["subject"] = "Editorial R13: declarative chapter-6 transition; R12 layout preserved."
    metadata["producer"] += "; bounded PyMuPDF editorial text correction"
    document.set_metadata(metadata)
    document.save(destination, garbage=4, deflate=True)
    result = fitz.open(destination)
    baseline = fitz.open(source)
    assert len(result) == len(baseline) == 15
    assert result.get_toc() == baseline.get_toc()
    for index, (old_page, new_page) in enumerate(zip(baseline, result)):
        expected_text = old_page.get_text().replace("R12", "R13").replace("R 1 2", "R 1 3")
        if index == 11:
            expected_text = expected_text.replace("What if not?", "The two shifts fail differently")
        assert new_page.get_text() == expected_text, index + 1
        assert new_page.rect == old_page.rect
        assert [link.get("uri") for link in new_page.get_links()] == [
            link.get("uri") for link in old_page.get_links()
        ]
    print(f"R13 PDF: {prompt_changes} prompt, {label_changes} revision labels, 15 pages")
    print(hashlib.sha256(destination.read_bytes()).hexdigest())


if __name__ == "__main__":
    directory = Path(__file__).resolve().parent
    revise_pdf(
        directory / "The_Sum_of_Our_Technology_R12_Cover02_Compact.pdf",
        directory / "The_Sum_of_Our_Technology_R13_Cover02_Compact.pdf",
    )
