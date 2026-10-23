#!/usr/bin/env python3
"""Prepare signed Ubuntu downloads for the existing ephemeral CI browser jobs."""

import json
import re
import sys
from pathlib import Path

AZURE = re.compile(r"https?://azure\.archive\.ubuntu\.com/ubuntu(?=/|\s|$)")
PRIMARY = "https://archive.ubuntu.com/ubuntu"
BOUNDS = 'Acquire::http::Timeout "30";\nAcquire::https::Timeout "30";\nAcquire::Retries "0";\n'


def checked_path(root, target, *, required=False, directory=False):
    """Reject indirection before privileged writes or source-file reads."""
    relative = target.relative_to(root)
    current = root
    for part in relative.parts:
        current = current / part
        if current.is_symlink():
            raise ValueError("Symlink APT path: " + str(current))
    if target.exists():
        valid = target.is_dir() if directory else target.is_file()
        if not valid:
            raise ValueError("Invalid APT path type: " + str(target))
    elif required:
        raise ValueError("Missing APT path: " + str(target))
    return target


def mirror_path(root, uri):
    if uri.startswith("///"):
        uri = uri[2:]
    if not uri.startswith("/etc/apt/"):
        raise ValueError("Nonlocal APT mirror reference: " + uri)
    relative = uri.removeprefix("/etc/apt/")
    if any(part in {"", ".", ".."} for part in relative.split("/")):
        raise ValueError("Unsafe APT mirror reference: " + uri)
    return checked_path(root, root / relative, required=True)


def prepare(apt_root):
    """Validate a complete change plan, then preserve signed-source metadata."""
    root = Path(apt_root)
    if root.is_symlink() or not root.is_dir():
        raise ValueError("Invalid APT root: " + str(root))
    sources_dir = checked_path(root, root / "sources.list.d", directory=True)
    config_dir = checked_path(root, root / "apt.conf.d", directory=True)
    output = checked_path(root, config_dir / "99-site-download-bounds")
    sources = [root / "sources.list"]
    for pattern in ("*.list", "*.sources"):
        sources.extend(sorted(sources_dir.glob(pattern)))
    contents = {}
    for source in sources:
        checked_path(root, source)
        if source.exists():
            contents[source] = source.read_text(encoding="utf-8")
    mirrors = {checked_path(root, root / "apt-mirrors.txt")}
    for before in contents.values():
        active = "\n".join(line.split("#", 1)[0] for line in before.splitlines())
        for uri in re.findall(r"(?<!\S)mirror\+file:([^\s#]+)", active):
            mirrors.add(mirror_path(root, uri))
    for mirror in sorted(mirrors):
        if mirror.exists():
            contents[mirror] = mirror.read_text(encoding="utf-8")
    changes = {
        source: AZURE.sub(PRIMARY, before)
        for source, before in contents.items()
        if AZURE.sub(PRIMARY, before) != before
    }
    # No earlier source is changed if a later reference or output is invalid.
    for source, after in changes.items():
        source.write_text(after, encoding="utf-8")
    config_dir.mkdir(exist_ok=True)
    output.write_text(BOUNDS, encoding="utf-8")
    return {
        "changedSources": [str(source) for source in changes],
        "downloadConfig": str(output),
    }


if __name__ == "__main__":
    if len(sys.argv) != 1:
        raise SystemExit("Usage: ubuntu_downloads.py (fixed /etc/apt root)")
    print(json.dumps(prepare(Path("/etc/apt")), sort_keys=True))
