"""Check the actual standalone export, including its intentionally inline runtime."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess


class ExportParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.runtime = []
        self.violations = []
        self.script = None
        self.styles = []
        self.in_style = False

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for name, value in attrs:
            if name.startswith("on"):
                self.violations.append(f"event attribute: {tag}.{name}")
            if name in {"href", "src", "action", "formaction", "xlink:href"} and value:
                scheme = "".join(value.split()).lower()
                if scheme.startswith(("javascript:", "vbscript:")):
                    self.violations.append(f"executable URL: {tag}.{name}")
        if tag in {"base", "iframe", "object", "embed"}:
            self.violations.append(f"unexpected trust boundary: {tag}")
        if tag == "script":
            if "src" in values:
                self.violations.append("external executable script")
            self.script = [] if values.get("type", "").lower() not in {
                "application/json", "application/ld+json"
            } else None
        if tag == "link" and values.get("rel") == "stylesheet":
            self.violations.append("external stylesheet")
        if tag == "style":
            self.in_style = True

    def handle_data(self, data):
        if self.script is not None:
            self.script.append(data)
        if self.in_style:
            self.styles.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.script is not None:
            self.runtime.append("".join(self.script))
            self.script = None
        if tag == "style":
            self.in_style = False


def main():
    cli = argparse.ArgumentParser()
    cli.add_argument("html", type=Path)
    cli.add_argument("output", type=Path)
    args = cli.parse_args()
    raw = args.html.read_bytes()
    parser = ExportParser()
    parser.feed(raw.decode("utf-8"))
    assert not parser.violations, parser.violations
    assert len(parser.runtime) == 5, "missing or additional executable runtime"
    assert "@import" not in "".join(parser.styles).lower(), "external CSS import"
    args.output.mkdir(parents=True, exist_ok=True)
    files = []
    for number, code in enumerate(parser.runtime):
        file = args.output / f"runtime-{number}.js"
        file.write_text(code, encoding="utf-8")
        subprocess.run(["node", "--check", str(file)], check=True, capture_output=True)
        files.append({"file": file.name, "sha256": hashlib.sha256(code.encode()).hexdigest()})
    record = {
        "source": hashlib.sha256(raw).hexdigest(),
        "runtimeScripts": len(files), "files": files, "violations": [],
        "scope": "HTML trust boundaries and syntax; parser-aware JS scan is separate."
    }
    (args.output / "offline-security.json").write_text(json.dumps(record, indent=2))
    print(json.dumps(record))


if __name__ == "__main__":
    main()
