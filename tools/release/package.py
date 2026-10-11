"""Deterministic release packages; extraction admits only manifest-declared files."""

import gzip
import hashlib
import io
import json
import sys
import tarfile
from pathlib import Path


def safe_name(name):
    if (
        not isinstance(name, str)
        or Path(name).is_absolute()
        or any(part in {"", ".", ".."} for part in name.split("/"))
        or "\\" in name
    ):
        raise ValueError("Unsafe release path")


def inventory(directory):
    root = Path(directory)
    manifest = json.loads((root / "artifact.json").read_text())
    names = ["artifact.json", *["public/" + name for name in manifest["files"]]]
    if not 1 < len(names) <= 1001:
        raise ValueError("Invalid release inventory")
    for name in names:
        safe_name(name)
    return sorted(names)


def pack(directory, output):
    root = Path(directory)
    with Path(output).open("wb") as raw:
        with gzip.GzipFile(fileobj=raw, mode="wb", mtime=0, filename="") as compressed:
            with tarfile.open(fileobj=compressed, mode="w") as archive:
                for name in inventory(root):
                    file = root / name
                    parts = Path(name).parts
                    if not file.is_file() or any(
                        root.joinpath(*parts[:index]).is_symlink()
                        for index in range(len(parts) + 1)
                    ):
                        raise ValueError("Non-file in release")
                    data = file.read_bytes()
                    info = tarfile.TarInfo(name)
                    info.size = len(data)
                    info.mode = 0o644
                    archive.addfile(info, io.BytesIO(data))


def unpack(package, output, expected_digest):
    data = Path(package).read_bytes()
    if hashlib.sha256(data).hexdigest() != expected_digest:
        raise ValueError("Release archive digest differs")
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
        members = archive.getmembers()
        if not 1 < len(members) <= 1001:
            raise ValueError("Invalid archive member count")
        names = [member.name for member in members]
        if len(names) != len(set(names)) or "artifact.json" not in names:
            raise ValueError("Duplicate or missing archive entries")
        if any(not member.isfile() or member.size > 5_000_000 for member in members):
            raise ValueError("Unsafe archive member type/size")
        if sum(member.size for member in members) > 100_000_000:
            raise ValueError("Archive exceeds extraction bound")
        manifest = json.load(archive.extractfile("artifact.json"))
        expected = {"artifact.json", *["public/" + name for name in manifest["files"]]}
        if set(names) != expected:
            raise ValueError("Archive inventory differs from manifest")
        for name in names:
            safe_name(name)
        root = Path(output)
        root.mkdir(parents=True, exist_ok=True)
        if any(root.iterdir()):
            raise ValueError("Release extraction directory is not empty")
        for member in members:
            name = member.name
            file = root / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes(archive.extractfile(member).read())


if __name__ == "__main__":
    mode, *args = sys.argv[1:]
    if mode == "pack":
        pack(*args)
    elif mode == "unpack":
        unpack(*args)
    else:
        raise ValueError("Usage: package.py pack DIR FILE | unpack FILE EMPTY_DIR DIGEST")
