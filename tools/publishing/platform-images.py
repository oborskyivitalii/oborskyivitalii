#!/usr/bin/env python3
"""Decode and fit native publication uploads using the pinned media toolchain."""

import base64
import io
import json
import math
import runpy
import struct
import sys
import zlib
from pathlib import Path

import PIL
from PIL import Image, ImageChops, ImageCms, ImageFilter, ImageMath, PngImagePlugin

Image.MAX_IMAGE_PIXELS = 16_000_000
PNG_END = bytes.fromhex("0000000049454e44ae426082")
SRGB_PRIMARIES = (0.3127, 0.3290, 0.6400, 0.3300, 0.3000, 0.6000, 0.1500, 0.0600)
IMAGE_ERRORS = (
    ValueError,
    OSError,
    SyntaxError,
    KeyError,
    Image.DecompressionBombError,
    ImageCms.PyCMSError,
)


def scanline_bytes(header):
    width, height, depth, color, compression, filter_method, interlace = header
    depths = {0: (1, 2, 4, 8, 16), 2: (8, 16), 3: (1, 2, 4, 8), 4: (8, 16), 6: (8, 16)}
    if (
        depth not in depths.get(color, ())
        or compression
        or filter_method
        or interlace not in (0, 1)
    ):
        raise ValueError("PNG has unsupported or invalid IHDR fields")
    if not width or not height or width * height > Image.MAX_IMAGE_PIXELS:
        raise ValueError("Decoded image exceeds its pixel budget")
    bits_per_pixel = depth * {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color]
    if interlace == 0:
        return height * (1 + (width * bits_per_pixel + 7) // 8)
    # Adam7 samples seven independent grids, each with its own filtered rows.
    grids = (
        (0, 0, 8, 8),
        (4, 0, 8, 8),
        (0, 4, 4, 8),
        (2, 0, 4, 4),
        (0, 2, 2, 4),
        (1, 0, 2, 2),
        (0, 1, 1, 2),
    )
    size = 0
    for x, y, dx, dy in grids:
        columns, rows = (width - x + dx - 1) // dx, (height - y + dy - 1) // dy
        if columns > 0 and rows > 0:
            size += rows * (1 + (columns * bits_per_pixel + 7) // 8)
    return size


def verify_png_data(parts, expected):
    inflater = zlib.decompressobj()
    remaining = expected
    last_data = max((i for i, payload in enumerate(parts) if payload), default=-1)
    try:
        for index, payload in enumerate(parts):
            if payload and inflater.eof:
                raise ValueError("PNG has unused bytes before the end of the final IDAT")
            while payload and not inflater.eof:
                remaining -= len(inflater.decompress(payload, min(65_536, remaining + 1)))
                if remaining < 0:
                    raise ValueError("PNG IDAT contains excess scanline data")
                payload = inflater.unconsumed_tail
            if inflater.unused_data and index < last_data:
                raise ValueError("PNG has unused bytes before the end of the final IDAT")
    except zlib.error as error:
        raise ValueError("PNG IDAT has invalid compressed data or checksum") from error
    if not inflater.eof or remaining:
        raise ValueError("PNG IDAT must contain a complete scanline stream and its checksum")


def verify_png_chunks(raw):
    offset = 8
    cicp = False
    palette_size = 0
    key = None
    ended_data = False
    data = []
    view = memoryview(raw)
    while offset + 12 <= len(raw):
        length, kind = struct.unpack_from(">I4s", raw, offset)
        end = offset + 12 + length
        if end > len(raw):
            break
        payload = view[offset + 8 : end - 4]
        if offset == 8:
            if kind != b"IHDR" or length != 13:
                raise ValueError("PNG must start with one valid IHDR chunk")
            header = struct.unpack(">IIBBBBB", payload)
            expected = scanline_bytes(header)
        elif kind == b"IEND":
            if raw[offset:] != PNG_END:
                break
            if not data:
                raise ValueError("PNG must include IDAT data")
            verify_png_data(data, expected)
            return cicp, palette_size, key
        elif kind == b"IDAT":
            if ended_data or (header[3] == 3 and not palette_size):
                raise ValueError("PNG must have consecutive IDAT chunks after any required palette")
            data.append(payload)
        else:
            ended_data = bool(data)
            if kind == b"PLTE":
                if (
                    palette_size
                    or key is not None
                    or ended_data
                    or header[3] in (0, 4)
                    or not 0 < length <= 768
                    or length % 3
                ):
                    raise ValueError("PNG has an invalid palette")
                if header[3] == 3 and length // 3 > 2 ** header[2]:
                    raise ValueError("PNG palette exceeds the indexed bit depth")
                palette_size = length // 3
            elif 65 <= kind[0] <= 90:
                raise ValueError(f"Unexpected critical PNG chunk {kind!r}")
            elif kind == b"cICP":
                cicp = True
            elif kind == b"tRNS":
                color = header[3]
                if ended_data or key is not None:
                    raise ValueError("PNG has misplaced or repeated tRNS")
                if color == 0 and length == 2:
                    key = struct.unpack(">H", payload)[0]
                elif color == 2 and length == 6:
                    key = struct.unpack(">3H", payload)
                elif color == 3 and 0 < length <= palette_size:
                    key = bytes(payload)
                else:
                    raise ValueError("PNG has invalid transparency data")
        offset = end
    raise ValueError("PNG must end with a complete IEND chunk and its CRC")


def decode(raw):
    with Image.open(io.BytesIO(raw), formats=["PNG", "JPEG"]) as image:
        cicp, palette_size, key = (
            verify_png_chunks(raw) if image.format == "PNG" else (False, 0, None)
        )
        image.verify()
    image = Image.open(io.BytesIO(raw), formats=["PNG", "JPEG"])
    if image.width * image.height > Image.MAX_IMAGE_PIXELS:
        raise ValueError("Decoded image exceeds its pixel budget")
    if getattr(image, "n_frames", 1) != 1 or image.getexif().get(274, 1) != 1:
        raise ValueError("Publication images require one frame and normal orientation")
    image.load()
    if image.format == "PNG":
        depth, color = raw[24:26]
        image.info["sampleDepth"] = depth
        image.info["colorType"] = color
        if isinstance(key, int):
            mask = (1 << depth) - 1
            image.info["transparency"] = (key & mask) * 255 // mask if depth < 16 else key
        elif color == 2 and key is not None and depth == 8:
            image.info["transparency"] = tuple(value & 255 for value in key)
        icc = image.info.get("icc_profile")
        if icc:
            space = ImageCms.ImageCmsProfile(io.BytesIO(icc)).profile.xcolor_space.strip()
            if space != ("GRAY" if color in (0, 4) else "RGB"):
                raise ValueError("PNG ICC profile does not match its grayscale or RGB image data")
        if image.mode == "P" and image.getextrema()[1] >= palette_size:
            raise ValueError("PNG references a missing palette entry")
        if cicp:
            image.info["codedColor"] = True
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


def gray_alpha(image):
    # Preserve keyed transparency before interpolation can change the sample values.
    samples = image.convert("I")
    gray = samples.point(lambda value: value / 257 + 0.5).convert("L")
    transparency = image.info.get("transparency")
    if isinstance(transparency, int):
        alpha = ImageMath.lambda_eval(
            lambda args: (args["samples"] != transparency) * 255,
            samples=samples,
        ).convert("L")
        gray.putalpha(alpha)
    gray.info.pop("transparency", None)
    return gray


def srgb_colors(image, rgb, gray):
    icc = image.info.get("icc_profile")
    if icc:
        profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        source = gray if profile.profile.xcolor_space.strip() == "GRAY" else rgb
        return ImageCms.profileToProfile(
            source, profile, ImageCms.createProfile("sRGB"), outputMode="RGB"
        )
    if "srgb" in image.info:
        return rgb
    primaries = image.info.get("chromaticity", SRGB_PRIMARIES)
    if any(abs(value - expected) > 0.0001 for value, expected in zip(primaries, SRGB_PRIMARIES)):
        raise ValueError("Convert non-sRGB PNG primaries to sRGB or embed their ICC profile")
    gamma = image.info.get("gamma")
    if gamma is None:
        return rgb
    if gamma <= 0:
        raise ValueError("Convert PNG with invalid gamma to sRGB")

    def encode_sample(sample):
        linear = (sample / 255) ** (1 / gamma)
        srgb = 12.92 * linear if linear <= 0.0031308 else 1.055 * linear ** (1 / 2.4) - 0.055
        return round(srgb * 255)

    return rgb.point([encode_sample(sample) for sample in range(256)] * 3)


def with_alpha(image):
    if image.mode.startswith("I;16"):
        return gray_alpha(image)
    return image.convert("LA" if image.mode in ("1", "L") else "RGBA")


def linear_sample(value):
    srgb = value / 255
    return srgb / 12.92 if srgb <= 0.04045 else ((srgb + 0.055) / 1.055) ** 2.4


LINEAR = [round(linear_sample(value) * 255) for value in range(256)]


def composite_art(rgb, alpha):
    if alpha.getextrema()[0] == 255:
        return rgb, "white"
    # Broad low-opacity marks matter too. Only ignore faint isolated edge pixels.
    interior = alpha.filter(ImageFilter.MinFilter(3)).point(lambda value: 255 if value else 0)
    visible = ImageChops.lighter(interior, alpha.point(lambda value: 255 if value >= 16 else 0))
    # A thin connected stroke has at least three marked pixels in a local window.
    # Use zero padding so an isolated corner pixel is not counted more than once.
    ink = alpha.point(lambda value: 255 if value else 0)
    width, height = alpha.size
    padded = Image.new("L", (width + 2, height + 2))
    padded.paste(ink, (1, 1))
    neighbors = padded.filter(ImageFilter.RankFilter(3, 6)).crop((1, 1, width + 1, height + 1))
    strokes = ImageChops.darker(ink, neighbors)
    visible = ImageChops.lighter(visible, strokes)
    ignored = ImageChops.invert(visible if visible.getbbox() else ink)
    foreground_luminance = rgb.point(LINEAR * 3).convert("L", (0.2126, 0.7152, 0.0722, 0))
    best = None
    for level in (255, 118, 32, 0):
        backdrop = (level,) * 3
        canvas = Image.new("RGB", rgb.size, backdrop)
        canvas.paste(rgb, mask=alpha)
        luminance = canvas.point(LINEAR * 3).convert("L", (0.2126, 0.7152, 0.0722, 0))
        background = LINEAR[level]
        # Relative luminance contrast is measured after compositing.
        contrast = [
            min(
                255,
                round(
                    64 * ((max(value, background) + 12.75) / (min(value, background) + 12.75) - 1)
                ),
            )
            for value in range(256)
        ]
        score = min(
            ImageChops.lighter(luminance.point(contrast), ignored).getextrema()[0],
            ImageChops.lighter(foreground_luminance.point(contrast), ignored).getextrema()[0],
        )
        if level == 255 and score >= 64:
            return canvas, backdrop
        if best is None or score > best[0]:
            best = score, canvas, backdrop
    if best[0] < 4:
        raise ValueError("Compose the cover on an explicit background that preserves contrast")
    return best[1], best[2]


def jpeg_art(image, bounds, *, upscale=False):
    require_derivable_source(image)
    rgba = with_alpha(image).convert("RGBA")
    rgb = srgb_colors(image, rgba.convert("RGB"), rgba.convert("L"))
    if rgba.getchannel("A").getextrema()[0] == 255:
        return contained(rgb, bounds, upscale=upscale), "white"
    rgb.putalpha(rgba.getchannel("A"))
    # Judge authored opacity before enlarging and introducing new edge pixels.
    measured = contained(rgb, bounds)
    alpha = measured.getchannel("A")
    if alpha.getbbox() is None:
        raise ValueError(
            "Cover artwork is fully transparent at output size; select visible artwork"
        )
    art, backdrop = composite_art(measured.convert("RGB"), alpha)
    if upscale:
        fitted = contained(rgb, bounds, upscale=True)
        if fitted.size != measured.size:
            art = Image.new("RGB", fitted.size, backdrop)
            art.paste(fitted.convert("RGB"), mask=fitted.getchannel("A"))
    return art, backdrop


def contained(image, bounds, *, upscale=False):
    scale = min(bounds[0] / image.width, bounds[1] / image.height)
    if not upscale:
        scale = min(scale, 1)
    size = tuple(max(1, round(dimension * scale)) for dimension in image.size)
    return image.resize(size, Image.Resampling.LANCZOS) if size != image.size else image


def require_derivable_source(image):
    if image.info.get("codedColor"):
        raise ValueError(
            "Convert PNG cICP color to sRGB or an ICC-tagged PNG before deriving an upload"
        )

    if image.mode == "RGB" and image.info.get("sampleDepth") == 16 and "transparency" in image.info:
        raise ValueError(
            "Convert 16-bit RGB keyed transparency to explicit alpha before deriving an upload"
        )


def fit(image, raw, policy):
    width, height, maximum = (policy[k] for k in ("width", "height", "bytes"))
    if policy["role"] == "cover":
        inner = (width * 9 // 10, height * 9 // 10)
        art, backdrop = jpeg_art(image, inner, upscale=True)
        canvas = Image.new("RGB", (width, height), backdrop)
        canvas.paste(art, ((width - art.width) // 2, (height - art.height) // 2))
        return encode_jpeg(canvas, maximum)
    if policy["role"] == "featured":
        art, _ = jpeg_art(image, (width, height))
        return encode_jpeg(art, maximum)
    if (
        policy["role"] == "inline"
        and image.width <= width
        and image.height <= height
        and len(raw) <= maximum
    ):
        return raw
    require_derivable_source(image)
    original = image
    keyed = "transparency" in image.info
    if keyed:
        original = with_alpha(image)
    elif image.info.get("colorType") == 4 and image.mode == "RGBA":
        # Pillow expands 16-bit grayscale-alpha to RGBA; keep the GRAY ICC compatible.
        original = image.convert("LA")
    elif image.mode == "P":
        original = image.convert("RGBA")
    elif image.mode == "1":
        original = image.convert("L")
    if original.mode in ("LA", "RGBA"):
        original.info.pop("transparency", None)
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
        try:
            raw = base64.b64decode(item["base64"], validate=True)
            image = decode(raw)
            measurement = {}
            if "policy" in item:
                policy = item["policy"]
                output = fit(image, raw, policy)
                if len(output) > policy["bytes"]:
                    raise ValueError("Platform image exceeds its byte budget")
                image = decode(output)
                total += len(output)
                if total > 20_000_000:
                    raise ValueError("Platform upload files exceed their aggregate byte budget")
                measurement["base64"] = base64.b64encode(output).decode("ascii")
            result.append(
                dict(measurement, width=image.width, height=image.height, format=image.format)
            )
        except IMAGE_ERRORS as error:
            label = item.get("label", "image")
            raise ValueError(f"{label}: {error}") from error
    json.dump(result, sys.stdout, separators=(",", ":"))


if __name__ == "__main__":
    try:
        main()
    except IMAGE_ERRORS as error:
        sys.exit(str(error))
