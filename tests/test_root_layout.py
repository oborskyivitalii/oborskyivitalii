# SPDX-License-Identifier: Apache-2.0
"""Maintained root/guide routes and failure cases, without freezing future content."""

import copy
import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SOURCE = REPO / "tools/check_repository_layout.py"
SPEC = importlib.util.spec_from_file_location("root_layout_validator", SOURCE)
layout = importlib.util.module_from_spec(SPEC)
exec(compile(SOURCE.read_bytes(), str(SOURCE), "exec"), layout.__dict__)


class RootLayoutTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = layout.baseline_entries(REPO, recursive=False)

    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.data = copy.deepcopy(layout.read_json(REPO, layout.LAYOUT))
        self.archive = copy.deepcopy(layout.read_json(REPO, layout.ARCHIVE))
        for path in self.data["root_files"]:
            self.write(path, "# Maintained entry\n")
        for item in self.data["dispositions"].values():
            self.write(item["destination"], "# Canonical guide\n")
            if "archive_path" in item:
                self.write(item["archive_path"], (REPO / item["archive_path"]).read_bytes())
        for path in self.data["active_markdown"]:
            relative = os.path.relpath(self.root / "AGENTS.md", (self.root / path).parent)
            self.write(path, "# Active route\n\n[Agent rules](" + relative + ")\n")
        self.write(
            "tools/repository_intelligence.py",
            (REPO / "tools/repository_intelligence.py").read_bytes(),
        )
        entries = {
            path.relative_to(self.root).as_posix(): {
                "role": "guide",
                "owner": path.relative_to(self.root).as_posix(),
            }
            for path in self.root.rglob("*.md")
        }
        for row in self.archive["records"]:
            entries[row["archive_path"]] = {"role": "history", "owner": row["current_owner"]}
        self.write(".github/repository-paths.json", json.dumps({"entries": entries}))
        self.config = {
            "owners": [{"path": "AGENTS.md"}, {"path": "guides/SITE-ROADMAP.md"}],
            "validation_routes": [{"paths": ["guides/"], "read": ["guides/SITE-STAGING.md"]}],
        }
        self.save_config()

    def write(self, path, content):
        destination = self.root / path
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content.encode() if isinstance(content, str) else content)

    def save_config(self):
        self.write(".github/repository-intelligence-config.json", json.dumps(self.config))

    def test_bootstrap_is_bounded_and_routes_to_canonical_entries(self):
        layout.validate_bootstrap((REPO / "PROJECT-BOOTSTRAP.md").read_text(encoding="utf-8"))

    def test_bootstrap_oversize_and_missing_authority_routes_fail(self):
        route = (
            "https://github.com/"
            + layout.REPOSITORY
            + " refs\nREADME.md\nAGENTS.md scoped AGENTS.md\nREPOSITORY-MAP.md\nMEMORY.md\n"
        )
        layout.validate_bootstrap(route)
        for body, message in [
            (route + "я" * 1000, "character bound"),
            (route + "more\n" * 8, "nonempty line bound"),
            (route.replace("README.md", "purpose elsewhere"), "missing route"),
            (route.replace(" refs", ""), "omits live refs"),
        ]:
            with self.subTest(message=message), self.assertRaisesRegex(ValueError, message):
                layout.validate_bootstrap(body)

    def test_complete_current_root_and_dispositions(self):
        data = layout.read_json(REPO, layout.LAYOUT)
        layout.validate_layout(REPO, data, self.original)

    def test_new_root_file_and_missing_entrypoint_fail(self):
        layout.validate_layout(self.root, self.data, self.original)
        self.write("SESSION-HANDOFF.md", "Unowned task ledger\n")
        with self.assertRaisesRegex(ValueError, "Unexpected/missing root"):
            layout.validate_layout(self.root, self.data, self.original)
        (self.root / "SESSION-HANDOFF.md").unlink()
        (self.root / "MEMORY.md").unlink()
        with self.assertRaisesRegex(ValueError, "Unexpected/missing root"):
            layout.validate_layout(self.root, self.data, self.original)

    def test_omitted_disposition_and_missing_destination_fail(self):
        broken = copy.deepcopy(self.data)
        del broken["dispositions"]["BACKLOG.md"]
        with self.assertRaisesRegex(ValueError, "Incomplete original root"):
            layout.validate_layout(self.root, broken, self.original)
        (self.root / "guides/SITE-ANALYTICS.md").unlink()
        with self.assertRaisesRegex(ValueError, "Missing layout file"):
            layout.validate_layout(self.root, self.data, self.original)

    def test_root_contract_and_noncanonical_destinations_cannot_hide_junk(self):
        self.write("extra.md", "Unowned\n")
        broken = copy.deepcopy(self.data)
        broken["root_files"].append("extra.md")
        with self.assertRaisesRegex(ValueError, "Root file contract"):
            layout.validate_layout(self.root, broken, self.original)
        (self.root / "extra.md").unlink()
        broken = copy.deepcopy(self.data)
        broken["dispositions"]["SITE-ANALYTICS.md"]["destination"] = "guides/SITE-SEO.md"
        with self.assertRaisesRegex(ValueError, "Noncanonical destination"):
            layout.validate_layout(self.root, broken, self.original)

    def test_archived_originals_have_exact_git_and_sha256_provenance(self):
        layout.validate_archives(
            REPO,
            layout.read_json(REPO, layout.LAYOUT),
            layout.read_json(REPO, layout.ARCHIVE),
            self.original,
        )

    def test_archive_byte_changes_cannot_be_hidden_by_updated_sha256(self):
        layout.validate_archives(self.root, self.data, self.archive, self.original)
        row = self.archive["records"][0]
        self.write(row["archive_path"], b"Edited historical evidence\n")
        row["sha256"] = layout.hashlib.sha256(
            (self.root / row["archive_path"]).read_bytes()
        ).hexdigest()
        with self.assertRaisesRegex(ValueError, "Archive blob mismatch"):
            layout.validate_archives(self.root, self.data, self.archive, self.original)

    def test_archive_missing_record_wrong_source_or_historical_owner_fail(self):
        for mutation, message in [
            (lambda value: value["records"].pop(), "coverage mismatch"),
            (
                lambda value: value["records"][0].update(
                    source_url="https://github.com/example/blob/main/BACKLOG.md"
                ),
                "not immutable",
            ),
            (
                lambda value: value["records"][0].update(
                    current_owner=value["records"][0]["archive_path"]
                ),
                "Archived instruction owner",
            ),
        ]:
            broken = copy.deepcopy(self.archive)
            mutation(broken)
            with self.subTest(message=message), self.assertRaisesRegex(ValueError, message):
                layout.validate_archives(self.root, self.data, broken, self.original)
        # Coordinated policy/manifest edits must not silently retire an original.
        changed_layout = copy.deepcopy(self.data)
        changed_archive = copy.deepcopy(self.archive)
        changed_layout["dispositions"]["SITE-CONTENT-REVIEW.md"] = {
            "treatment": "move",
            "destination": "guides/SITE-CONTENT-REVIEW.md",
        }
        changed_archive["records"] = [
            row
            for row in changed_archive["records"]
            if row["original_path"] != "SITE-CONTENT-REVIEW.md"
        ]
        with self.assertRaisesRegex(ValueError, "six-original preservation dispositions changed"):
            layout.validate_layout(self.root, changed_layout, self.original)
        with self.assertRaisesRegex(ValueError, "six-original preservation dispositions changed"):
            layout.validate_archives(self.root, changed_layout, changed_archive, self.original)

    def test_current_active_relative_links_resolve(self):
        self.assertGreater(layout.validate_links(REPO, layout.read_json(REPO, layout.LAYOUT)), 0)

    def test_broken_reference_inline_links_and_omitted_active_guide_fail(self):
        layout.validate_links(self.root, self.data)
        for body in ["[missing](missing.md)\n", "[rules][owner]\n\n[owner]: missing.md\n"]:
            self.write("guides/README.md", body)
            with (
                self.subTest(body=body),
                self.assertRaisesRegex(ValueError, "Broken active local link"),
            ):
                layout.validate_links(self.root, self.data)
        self.write("guides/README.md", "[missing](../AGENTS.md#missing-heading)\n")
        with self.assertRaisesRegex(ValueError, "Broken active local fragment"):
            layout.validate_links(self.root, self.data)
        self.write("docs/index.html", '<main id="about">Author</main>\n')
        self.write(
            "guides/README.md",
            "[live](../docs/index.html#about)\n[heading](../AGENTS.md#active-route)\n",
        )
        layout.validate_links(self.root, self.data)
        self.write("guides/README.md", "[missing](../docs/index.html#absent)\n")
        with self.assertRaisesRegex(ValueError, "Broken active local fragment"):
            layout.validate_links(self.root, self.data)
        self.write("guides/README.md", "[rules](../AGENTS.md)\n")
        broken = copy.deepcopy(self.data)
        broken["active_markdown"].remove("guides/README.md")
        with self.assertRaisesRegex(ValueError, "Omitted active Markdown"):
            layout.validate_links(self.root, broken)
        broken = copy.deepcopy(self.data)
        broken["active_markdown"].remove("review/root-history-20261007/README.md")
        with self.assertRaisesRegex(ValueError, "Omitted active Markdown"):
            layout.validate_links(self.root, broken)

    def test_code_and_source_pinned_external_history_links_do_not_become_current_routes(self):
        body = """# Guide
[rules](../AGENTS.md)
`[example](missing.md)`
<!-- [old example](also-missing.md) -->
```md
[historical example](absent.md)
```
[original](https://github.com/oborskyivitalii/oborskyivitalii/blob/3ca14c54824ac6b9e7225bc88429b4b8fb3bcf10/BACKLOG.md)
"""
        self.write("guides/README.md", body)
        layout.validate_links(self.root, self.data)
        self.write("guides/README.md", "[escape](../../outside.md)\n")
        with self.assertRaisesRegex(ValueError, "escapes repository"):
            layout.validate_links(self.root, self.data)

    def test_current_guide_owners_and_configured_routes_are_live(self):
        layout.validate_current_owners(REPO, layout.read_json(REPO, layout.LAYOUT))

    def test_stale_alias_archived_owner_and_missing_configured_route_fail(self):
        layout.validate_current_owners(self.root, self.data)
        for path, message in [
            ("SITE-STAGING.md", "Missing layout file"),
            ("review/root-history-20261007/BACKLOG.md", "Historical or retired current owner"),
        ]:
            self.config["owners"][0]["path"] = path
            self.save_config()
            with self.subTest(path=path), self.assertRaisesRegex(ValueError, message):
                layout.validate_current_owners(self.root, self.data)
        self.config["owners"][0]["path"] = "AGENTS.md"
        self.config["validation_routes"][0]["read"] = ["missing-control.md"]
        self.save_config()
        with self.assertRaisesRegex(ValueError, "Missing executable/configured locator"):
            layout.validate_current_owners(self.root, self.data)

    def test_historical_role_and_canonical_guide_ownership_cannot_be_reversed(self):
        catalog = layout.read_json(self.root, ".github/repository-paths.json")
        catalog["entries"]["guides/SITE-STAGING.md"]["owner"] = "guides/SITE-ROADMAP.md"
        self.write(".github/repository-paths.json", json.dumps(catalog))
        with self.assertRaisesRegex(ValueError, "not its canonical owner"):
            layout.validate_current_owners(self.root, self.data)
        catalog["entries"]["guides/SITE-STAGING.md"]["owner"] = "guides/SITE-STAGING.md"
        catalog["entries"]["review/root-history-20261007/BACKLOG.md"]["role"] = "guide"
        self.write(".github/repository-paths.json", json.dumps(catalog))
        with self.assertRaisesRegex(ValueError, "Archive is not historical"):
            layout.validate_current_owners(self.root, self.data)


if __name__ == "__main__":
    unittest.main()
