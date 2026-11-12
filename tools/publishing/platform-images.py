#!/usr/bin/env python3
"""Decode and fit native publication uploads using the pinned media toolchain."""

import base64
import io
import json
import math
import runpy
import struct
import sys
from pathlib import Path

import PIL
from PIL import Image, ImageCms, ImageMath, PngImagePlugin

Image.MAX_IMAGE_PIXELS = 16_000_000


def decode(raw):
    with Image.open(io.BytesIO(raw), formats=["PNG", "JPEG"]) as image:
        image.verify()
    image = Image.open(io.BytesIO(raw), formats=["PNG", "JPEG"])
    if image.width * image.height > Image.MAX_IMAGE_PIXELS:
        raise ValueError("Decoded image exceeds its pixel budget")
    if getattr(image, "n_frames", 1) != 1 or image.getexif().get(274, 1) != 1:
        raise ValueError("Publication images require one frame and normal orientation")
    image.load()
    return image


def encode_png(image):
    output = io.BytesIO()
    color = PngImagePlugin.PngInfo()
    for key, chunk, layout, values in [
        ("srgb", b"sRGB", ">B", (image.info.get("srgb", 0),)),
        ("gamma", b"gAMA", ">I", (round(image.info.get("gamma", 0) * 100_000),)),
        (
            "chromaticity",
            b"cHRM",
            ">8I",
            tuple(round(v * 100_000) for v in image.info.get("chromaticity", ())),
        ),
    ]:
        if key in image.info:
            color.add(chunk, struct.pack(layout, *values))
    image.save(
        output, "PNG", optimize=True, pnginfo=color, icc_profile=image.info.get("icc_profile")
    )
    return output.getvalue()


def encode_jpeg(image, maximum):
    for quality, subsampling in ((92, 0), (85, 0), (75, 0), (65, 0), (55, 0), (45, 2)):
        output = io.BytesIO()
        image.save(output, "JPEG", quality=quality, subsampling=subsampling)
        if output.tell() <= maximum:
            return output.getvalue()
    raise ValueError("Could not encode native JPEG within its byte budget")


def on_white(image):
    # Scale 16-bit grayscale before conversion, which otherwise clips above 255.
    if image.mode.startswith("I;16"):
        samples = image.convert("I")
        gray = samples.point(lambda value: value / 257 + 0.5).convert("L")
        transparency = image.info.get("transparency")
        alpha = (
            ImageMath.lambda_eval(
                lambda args: (args["samples"] != transparency) * 255,
                samples=samples,
            ).convert("L")
            if isinstance(transparency, int)
            else Image.new("L", image.size, 255)
        )
        rgba = gray.convert("RGBA")
        rgba.putalpha(alpha)
    else:
        rgba = image.convert("RGBA")
        gray = image.convert("L")
    icc = image.info.get("icc_profile")
    rgb = rgba.convert("RGB")
    if icc:
        profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        source = gray if profile.profile.xcolor_space.strip() == "GRAY" else rgb
        rgb = ImageCms.profileToProfile(
            source, profile, ImageCms.createProfile("sRGB"), outputMode="RGB"
        )
    canvas = Image.new("RGB", image.size, "white")
    canvas.paste(rgb, mask=rgba.getchannel("A"))
    return canvas


def contained(image, bounds, *, upscale=False):
    scale = min(bounds[0] / image.width, bounds[1] / image.height)
    if not upscale:
        scale = min(scale, 1)
    size = tuple(max(1, round(dimension * scale)) for dimension in image.size)
    return image.resize(size, Image.Resampling.LANCZOS) if size != image.size else image


def fit(image, raw, policy):
    width, height, maximum = (policy[k] for k in ("width", "height", "bytes"))
    if policy["role"] == "cover":
        inner = (width * 9 // 10, height * 9 // 10)
        art = contained(on_white(image), inner, upscale=True)
        canvas = Image.new("RGB", (width, height), "white")
        canvas.paste(art, ((width - art.width) // 2, (height - art.height) // 2))
        return encode_jpeg(canvas, maximum)
    if policy["role"] == "featured":
        return encode_jpeg(contained(on_white(image), (width, height)), maximum)
    if (
        policy["role"] == "inline"
        and image.width <= width
        and image.height <= height
        and len(raw) <= maximum
    ):
        return raw
    original = image
    if original.mode in ("P", "RGB", "L") and (
        original.mode == "P" or "transparency" in original.info
    ):
        original = original.convert("LA" if original.mode == "L" else "RGBA")
    size = (min(width, image.width), min(height, image.height))
    for _ in range(10):
        fitted = contained(original, size)
        output = encode_png(fitted)
        if len(output) <= maximum:
            return output
        scale = min(0.9, math.sqrt(maximum / len(output)))
        size = tuple(max(1, int(dimension * scale)) for dimension in fitted.size)
    raise ValueError("Could not fit publication image within its byte budget")


def main():
    owner = runpy.run_path(str(Path(__file__).with_name("web-media.py")))
    if PIL.__version__ != owner["requirement"]().split("==")[1]:
        raise ValueError("Pillow differs from the canonical toolchain pin")
    raw_request = sys.stdin.buffer.read(29_000_001)
    if len(raw_request) > 29_000_000:
        raise ValueError("Platform image request exceeds its byte budget")
    request = json.loads(raw_request)
    if len(request) > 51:
        raise ValueError("Platform image request exceeds its inventory budget")
    result = []
    total = 0
    for item in request:
        raw = base64.b64decode(item["base64"], validate=True)
        image = decode(raw)
        if "policy" in item:
            policy = item["policy"]
            output = fit(image, raw, policy)
            if len(output) > policy["bytes"]:
                raise ValueError("Platform image exceeds its byte budget")
            image = decode(output)
            total += len(output)
            if total > 20_000_000:
                raise ValueError("Platform upload files exceed their aggregate byte budget")
        result.append(
            {
                "width": image.width,
                "height": image.height,
                "format": image.format,
                **(
                    {"base64": base64.b64encode(output).decode("ascii")} if "policy" in item else {}
                ),
            }
        )
    json.dump(result, sys.stdout, separators=(",", ":"))


if __name__ == "__main__":
    try:
        main()
    except (
        ValueError,
        OSError,
        KeyError,
        Image.DecompressionBombError,
        ImageCms.PyCMSError,
    ) as error:
        sys.exit(str(error))
