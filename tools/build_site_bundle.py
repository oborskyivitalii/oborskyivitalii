"""Deterministic offline review handoff; no deployment or external dependency."""
import hashlib
import json
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "review/site-v1-20261002-v3.zip"
MANIFEST = ROOT / "review/site-v1-offline-bundle-v3.json"


def build():
    inputs = {}
    for folder, prefix in [(ROOT / "docs", "site"), (ROOT / "review", "review")]:
        candidates = sorted(folder.rglob("*")) if prefix == "site" else sorted(folder.glob("site-v1-20261002-v3-*.html"))
        for file in candidates:
            if file.is_file():
                inputs[f"{prefix}/{file.relative_to(folder).as_posix()}"] = file.read_bytes()
    inputs["OPEN-ME.txt"] = (
        "Updated author site review, 2026-10-02. Not deployed or browser-QA approved.\n"
        "Extract this whole ZIP, then open site/index.html in your browser.\n"
        "Home, Research, Writing and Talks share the same theme and motion controls.\n"
        "Scroll or move a mouse for perspective; Motion switches movement off.\n"
        "Writing filters by topic/year/language and supports shareable queries.\n"
        "If your viewer blocks JavaScript, open review/site-v1-20261002-v3-day.html\n"
        "or review/site-v1-20261002-v3-night.html. Keep the extracted files together.\n"
        "Static copies show all articles with year/topic navigation.\n"
    ).encode()
    import io
    result = io.BytesIO()
    with zipfile.ZipFile(result, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, content in sorted(inputs.items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 10, 2, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, content, compresslevel=9)
    payload = result.getvalue()
    manifest = {
        "kind": "Offline site/review handoff, not deployment or visual acceptance",
        "generator": "tools/build_site_bundle.py",
        "zip_sha256": hashlib.sha256(payload).hexdigest(),
        "entries": {name: hashlib.sha256(content).hexdigest() for name, content in sorted(inputs.items())},
    }
    return payload, (json.dumps(manifest, indent=2) + "\n").encode()


if __name__ == "__main__":
    if sys.argv[1:] not in ([], ["--check"]):
        raise SystemExit("Usage: python3 tools/build_site_bundle.py [--check]")
    payload, manifest = build()
    if sys.argv[1:] == ["--check"]:
        if not OUTPUT.exists() or not MANIFEST.exists() or OUTPUT.read_bytes() != payload or MANIFEST.read_bytes() != manifest:
            raise SystemExit("Stale offline bundle; run python3 tools/build_site_bundle.py")
    else:
        OUTPUT.write_bytes(payload)
        MANIFEST.write_bytes(manifest)
    print("Offline handoff and entry hashes are fresh.")
