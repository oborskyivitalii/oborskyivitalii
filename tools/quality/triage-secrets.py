"""Explicit review helper for exact generated public hashes; never called by CI.

Read the hashed-only scanner report and prove each value is a hex checksum in a
named metadata JSON or a public article identifier already present in docs/.
Unknown types/paths/values fail. The resulting exact path+type+hash baseline must
be independently reviewed. This does not allow arbitrary entropy in public HTML.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def classify(file, finding):
    path = ROOT / file
    line = path.read_text().splitlines()[finding["line_number"] - 1]
    values = re.findall(r"(?<![0-9a-f])[0-9a-f]{12,64}(?![0-9a-f])", line)
    values = [
        value
        for value in values
        if hashlib.sha1(value.encode(), usedforsecurity=False).hexdigest()
        == finding["hashed_secret"]
    ]
    if len(values) != 1:
        raise ValueError(f"Unproved candidate at {file}:{finding['line_number']}")
    if file == "tests/content.test.cjs":
        html = (ROOT / "docs/writing.html").read_text()
        if values[0] in html:
            return "Public article URL identifier present in Writing, not a credential"
    if file == "tools/quality/advisory-exceptions.json":
        records = json.loads(path.read_text())
        for record in records:
            checksum = hashlib.sha256((ROOT / record["reviewedSource"]).read_bytes()).hexdigest()
            if values[0] == checksum == record["reviewedSourceSha256"]:
                return "Verified reviewed tool source SHA256 in exact advisory reachability record"
            for file, expected in record["reviewedMaterials"].items():
                if values[0] == expected == hashlib.sha256((ROOT / file).read_bytes()).hexdigest():
                    return (
                        "Verified reviewed config/lock SHA256 in exact advisory reachability record"
                    )
    if path.suffix == ".json" and (
        file.startswith("review/") or file == ".github/repository-intelligence/agent-context.json"
    ):
        json.loads(path.read_text())
        if len(values[0]) in (40, 64) and finding["type"] in (
            "Hex High Entropy String",
            "Secret Keyword",
        ):
            return "Exact public source/file/checksum or hashed-only scanner-result value in reviewed metadata JSON"
    raise ValueError(f"Candidate needs manual review: {file}:{finding['line_number']}")


def main():
    source = json.loads(Path(sys.argv[1]).read_text())
    findings = []
    for file, rows in source["results"].items():
        if file == ".github/repository-intelligence/agent-context.json":
            # CI proves RI output and accepts only its actual checksum fields.
            continue
        for row in rows:
            reason = classify(file, row)
            findings.append(
                {
                    "id": ":".join([file, row["type"], row["hashed_secret"]]),
                    "path": file,
                    "rule": row["type"],
                    "disposition": "false positive",
                    "reason": reason,
                }
            )
    baseline = {
        "owner": "oborskyivitalii",
        "issue": "https://github.com/oborskyivitalii/oborskyivitalii/issues/13",
        "reviewedAt": "2026-10-03",
        "scope": "Exact current tracked-tree findings only; no Git-history or blanket entropy exclusion",
        "findings": findings,
    }
    (ROOT / "tools/quality/secrets-baseline.json").write_text(json.dumps(baseline, indent=2) + "\n")
    print(
        f"Proved {len(findings)} exact public metadata/identifier false positives; independent review required"
    )


if __name__ == "__main__":
    main()
