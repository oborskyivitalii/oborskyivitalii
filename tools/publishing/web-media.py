#!/usr/bin/env python3
"""Bounded lossless web renditions; source files are never opened or modified."""

import base64
import hashlib
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAX_PIXELS = 32_000_000
WEBP_VERSION = "1.6.0"


def requirement():
    lines = (ROOT / "tools/quality/toolchain/requirements.txt").read_text().splitlines()
    pins = [line for line in lines if re.fullmatch(r"pillow==[0-9.]+", line)]
    if len(pins) != 1:
        raise ValueError("One canonical Pillow pin is required")
    return pins[0]


def digest(value):
    return hashlib.sha256(value).hexdigest()


def encode(request):
    import PIL
    from PIL import Image, features

    if PIL.__version__ != requirement().split("==")[1]:
        raise ValueError("Pillow differs from the canonical toolchain pin")
    if features.version("webp") != WEBP_VERSION:
        raise ValueError("Unsupported lossless WebP codec version")
    if set(request) != {"schema", "images"} or request["schema"] != 1:
        raise ValueError("Unknown web-media request")
    images = request["images"]
    if not isinstance(images, list) or not 1 <= len(images) <= 50:
        raise ValueError("Finite web-media image inventory required")
    budget = json.loads((ROOT / "tools/quality/budgets.json").read_text())["assetRawBytes"]
    Image.MAX_IMAGE_PIXELS = 16_000_000
    results = []
    pixels = 0
    source_bytes = 0
    for item in images:
        if set(item) != {"sha256", "width", "height", "base64"}:
            raise ValueError("Unknown web-media image fields")
        width, height = item["width"], item["height"]
        if (
            type(width) is not int
            or type(height) is not int
            or not 1 <= width <= 8000
            or not 1 <= height <= 8000
        ):
            raise ValueError("Invalid web-media dimensions")
        pixels += width * height
        if width * height > 16_000_000 or pixels > MAX_PIXELS:
            raise ValueError("Web-media decoded pixel budget")
        raw = base64.b64decode(item["base64"], validate=True)
        source_bytes += len(raw)
        if len(raw) > 5_000_000 or source_bytes > 16_000_000 or digest(raw) != item["sha256"]:
            raise ValueError("Web-media source identity or byte budget differs")
        if len(raw) < 33 or raw[:8] != b"\x89PNG\r\n\x1a\n" or raw[24] > 8:
            raise ValueError("Only bounded eight-bit PNG sources are supported")
        with Image.open(io.BytesIO(raw)) as source:
            if (
                source.format != "PNG"
                or source.size != (width, height)
                or getattr(source, "n_frames", 1) != 1
            ):
                raise ValueError("PNG dimensions, format or frame count differs")
            source.load()
            if source.getexif().get(274, 1) != 1:
                raise ValueError("Oriented PNG requires explicit editorial preparation")
            icc = source.info.get("icc_profile", b"")
            if (
                not icc
                and "srgb" not in source.info
                and any(key in source.info for key in ["gamma", "chromaticity"])
            ):
                raise ValueError("Non-ICC PNG color metadata requires explicit preparation")
            rgba = source.convert("RGBA")
            original_pixels = rgba.tobytes()
            output = io.BytesIO()
            rgba.save(
                output,
                format="WEBP",
                lossless=True,
                exact=True,
                method=6,
                quality=100,
                icc_profile=icc,
            )
            encoded = output.getvalue()
        if len(encoded) > budget:
            raise ValueError("Web rendition exceeds the existing asset budget")
        with Image.open(io.BytesIO(encoded)) as decoded:
            if (
                decoded.size != (width, height)
                or decoded.convert("RGBA").tobytes() != original_pixels
            ):
                raise ValueError("Lossless rendition changed RGBA pixels")
            if decoded.info.get("icc_profile", b"") != icc:
                raise ValueError("Lossless rendition changed the color profile")
        results.append(
            {
                "sourceSha256": item["sha256"],
                "sha256": digest(encoded),
                "width": width,
                "height": height,
                "pixelSha256": digest(original_pixels),
                "iccSha256": digest(icc),
                "base64": base64.b64encode(encoded).decode("ascii"),
            }
        )
    return {"schema": 1, "pillow": PIL.__version__, "webp": WEBP_VERSION, "images": results}


def main():
    if sys.argv[1:] == ["--requirement"]:
        print(requirement())
        return
    if sys.argv[1:]:
        raise ValueError("Use stdin JSON or --requirement")
    request = sys.stdin.buffer.read(24_000_001)
    if len(request) > 24_000_000:
        raise ValueError("Web-media request byte budget")
    print(json.dumps(encode(json.loads(request)), separators=(",", ":")))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
