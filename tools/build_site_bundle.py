"""Deterministic offline review handoff; no deployment or external dependency."""
import hashlib
import json
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT.parent / "deliverables/site-v1-20261003-v8.zip"
MANIFEST = ROOT / "review/site-v1-offline-bundle-v8.json"


def build():
    inputs = {}
    for folder, prefix in [(ROOT / "docs", "site"), (ROOT / "review", "review")]:
        candidates = sorted(folder.rglob("*")) if prefix == "site" else sorted(folder.glob("site-v1-20261003-v8-*.html"))
        for file in candidates:
            if file.is_file():
                inputs[f"{prefix}/{file.relative_to(folder).as_posix()}"] = file.read_bytes()
    capture_dir = ROOT / "review/site-v1-20261003-v8-captures"
    capture_manifest = capture_dir / "captures.json"
    if capture_manifest.exists():
        admitted = ["captures.json", *json.loads(capture_manifest.read_text())["files"]]
        for name in sorted(admitted):
            file = capture_dir / name
            inputs[f"review/{file.relative_to(ROOT / 'review').as_posix()}"] = file.read_bytes()
    inputs["index.html"] = (
        '<!doctype html><html lang="en"><meta charset="utf-8">'
        '<meta name="robots" content="noindex,nofollow">'
        '<meta http-equiv="refresh" content="0;url=review/site-v1-20261003-v8-index.html">'
        '<title>All five pages</title><a href="review/site-v1-20261003-v8-index.html">'
        'Open all five pages, Day/Night, mobile views and recordings</a></html>\n'
    ).encode()
    inputs["OPEN-ME.txt"] = (
        "Author site v8 review, 2026-10-03. Review candidate, not deployment.\n"
        "Extract this whole ZIP, then open index.html for the all-page gallery.\n"
        "Home, Research, Writing, Talks and Credits share theme and motion controls.\n"
        "Native scrolling moves each page's related motif; Writing topics select its path.\n"
        "Pointer/hover do not move it. Motion Off freezes the current view; reduced motion wins.\n"
        "The structures breathe in a 48-second loop, even on short pages. Themes recolor the view.\n"
        "Writing filters by topic/year/language; queries, fragments and history restore visible state.\n"
        "If your viewer blocks JavaScript, open review/site-v1-20261003-v8-day.html\n"
        "or review/site-v1-20261003-v8-night.html. Keep the extracted files together.\n"
        "Static copies show all articles with year/topic navigation.\n"
        "site/ retains exact production-source bytes; review/ contains noindex renditions.\n"
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
        "indexing_scope": "site/ retains exact docs bytes; separate review/ HTML is noindex, nofollow",
        "zip_sha256": hashlib.sha256(payload).hexdigest(),
        "entries": {name: hashlib.sha256(content).hexdigest() for name, content in sorted(inputs.items())},
    }
    return payload, (json.dumps(manifest, indent=2) + "\n").encode()


if __name__ == "__main__":
    if sys.argv[1:] not in ([], ["--check"]):
        raise SystemExit("Usage: python3 tools/build_site_bundle.py [--check]")
    payload, manifest = build()
    if sys.argv[1:] == ["--check"]:
        # The committed manifest binds every entry AND the complete ZIP digest.
        # CI reconstructs that digest without storing a duplicate 18 MB binary.
        if not MANIFEST.exists() or MANIFEST.read_bytes() != manifest or (OUTPUT.exists() and OUTPUT.read_bytes() != payload):
            raise SystemExit("Stale offline bundle; run python3 tools/build_site_bundle.py")
    else:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_bytes(payload)
        MANIFEST.write_bytes(manifest)
    print("Offline handoff and entry hashes are fresh.")
