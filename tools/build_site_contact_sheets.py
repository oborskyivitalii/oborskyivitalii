"""Labelled thumbnails of real captures; optional Pillow review tooling."""
import hashlib
import io
import json
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "review/site-v1-20261004-v11-captures"
PAGES = {"index": "Home", "research": "Research", "writing": "Writing", "talks": "Talks", "credits": "Credits"}
FONT = ImageFont.truetype("DejaVuSans.ttf", 18)


def save_image(image, target, format, **options):
    payload = io.BytesIO()
    image.save(payload, format=format, **options)
    temporary = target.with_suffix(target.suffix + ".tmp")
    with temporary.open("wb") as stream:
        stream.write(payload.getvalue())
        stream.flush()
        os.fsync(stream.fileno())
    temporary.replace(target)


def build():
    thumbnails = []
    for route in PAGES:
        for theme in ["day", "night"]:
            for device in ["desktop", "mobile"]:
                name = f"{route}-{theme}-{device}-gallery.jpg"
                with Image.open(OUT / f"{route}-{theme}-{device}.png") as source:
                    image = source.convert("RGB")
                    image.thumbnail((720, 900), Image.Resampling.LANCZOS)
                    save_image(image, OUT / name, "JPEG", quality=86, optimize=True)
                thumbnails.append(name)
    desktop = Image.new("RGB", (1080, 5 * 378), "#f8f7f3")
    draw = ImageDraw.Draw(desktop)
    for row, (route, label) in enumerate(PAGES.items()):
        for col, theme in enumerate(["day", "night"]):
            source = Image.open(OUT / f"{route}-{theme}-desktop.png").convert("RGB")
            source.thumbnail((532, 333), Image.Resampling.LANCZOS)
            x, y = col * 540 + 4, row * 378
            draw.text((x + 4, y + 6), f"{label} / {theme.title()} / 1440 x 900", font=FONT, fill="#142632")
            desktop.paste(source, (x, y + 36))
    save_image(desktop, OUT / "desktop-contact-sheet.png", "PNG")

    mobile = Image.new("RGB", (1050, 2 * 478), "#f8f7f3")
    draw = ImageDraw.Draw(mobile)
    for row, theme in enumerate(["day", "night"]):
        for col, (route, label) in enumerate(PAGES.items()):
            source = Image.open(OUT / f"{route}-{theme}-mobile.png").convert("RGB")
            source.thumbnail((202, 437), Image.Resampling.LANCZOS)
            x, y = col * 210 + 4, row * 478
            draw.text((x, y + 6), f"{label} / {theme.title()}", font=FONT, fill="#142632")
            mobile.paste(source, (x, y + 36))
    save_image(mobile, OUT / "mobile-contact-sheet.png", "PNG")
    manifest_path = OUT / "captures.json"
    manifest = json.loads(manifest_path.read_text())
    for name in ["desktop-contact-sheet.png", "mobile-contact-sheet.png", "contrast.json", *thumbnails]:
        file = OUT / name
        if file.exists():
            manifest["files"][name] = hashlib.sha256(file.read_bytes()).hexdigest()
    manifest["contact_sheets"] = "tools/build_site_contact_sheets.py; scaled real browser PNGs with route/theme labels"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    build()
    print("Desktop and mobile real-capture contact sheets saved.")
