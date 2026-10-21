from pathlib import Path
import json, hashlib, zipfile, sys

source = Path(sys.argv[1])
dest = Path(sys.argv[2])
manifest = json.loads((source / 'manifest.json').read_text())
dest.mkdir(parents=True, exist_ok=False)
archives = {}
for row in manifest['archives']:
    data = (source / row['path']).read_bytes()
    assert len(data) == row['bytes'] and hashlib.sha256(data).hexdigest() == row['sha256']
    archives[row['path']] = zipfile.ZipFile(source / row['path'])
    assert archives[row['path']].testzip() is None
for row in manifest['files']:
    target = dest / row['path']
    assert target.resolve().is_relative_to(dest.resolve())
    data = archives[row['archive']].read(row['member'])
    assert len(data) == row['bytes'] and hashlib.sha256(data).hexdigest() == row['sha256']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
for archive in archives.values():
    archive.close()
print(f"Verified and restored {len(manifest['files'])} files without discarding repeated trials.")
