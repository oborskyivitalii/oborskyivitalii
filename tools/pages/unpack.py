"""Extract an authenticated Actions ZIP with bounded, ordinary-file-only paths."""

import hashlib
import io
import stat
import sys
import zipfile
from pathlib import Path


def unpack(package, output, expected_digest):
    raw = Path(package).read_bytes()
    if hashlib.sha256(raw).hexdigest() != expected_digest.removeprefix("sha256:"):
        raise ValueError("Pages migration upload digest differs")
    target = Path(output)
    target.mkdir(parents=True, exist_ok=True)
    if any(target.iterdir()):
        raise ValueError("Pages migration extraction target must be empty")
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        entries = archive.infolist()
        if len(entries) > 5000 or len({entry.filename for entry in entries}) != len(entries):
            raise ValueError("Pages migration ZIP inventory exceeds bounds or duplicates paths")
        if sum(entry.file_size for entry in entries) > 650_000_000:
            raise ValueError("Pages migration ZIP exceeds byte bound")
        for entry in entries:
            name = entry.filename
            parts = name.rstrip("/").split("/")
            mode = entry.external_attr >> 16
            if (
                name.startswith("/")
                or "\\" in name
                or any(part in {"", ".", ".."} for part in parts)
                or stat.S_IFMT(mode) not in {0, stat.S_IFREG, stat.S_IFDIR}
            ):
                raise ValueError("Unsafe Pages migration ZIP entry")
        for entry in entries:
            if entry.is_dir():
                continue
            file = target / entry.filename
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes(archive.read(entry))


if __name__ == "__main__":
    unpack(*sys.argv[1:])
