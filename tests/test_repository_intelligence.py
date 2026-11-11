# SPDX-License-Identifier: Apache-2.0
"""Behavioral and adversarial checks for the bounded local RI adapter."""

import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("local_ri", REPO / "tools/repository_intelligence.py")
ri = importlib.util.module_from_spec(SPEC)
exec(
    compile(
        (REPO / "tools/repository_intelligence.py").read_bytes(),
        str(REPO / "tools/repository_intelligence.py"),
        "exec",
    ),
    ri.__dict__,
)


class NavigationSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.cfg = "governance/config.json"
        self.config = {
            "schema_version": ri.VERSION,
            "repository": "example/research",
            "output": "governance/repository-intelligence/agent-context.json",
            "map_output": "REPOSITORY-MAP.md",
            "catalog": "governance/paths.json",
            "glossaries": ["GLOSSARY.md"],
            "registries": ["evidence/SOURCES.md"],
            "owners": [
                {
                    "concern": "source status",
                    "path": "evidence/SOURCES.md",
                    "queries": ["source registry", "джерела"],
                }
            ],
            "cross_repository": [],
        }
        self.write("AGENTS.md", "# Root instructions\n")
        self.write("evidence/AGENTS.md", "# Evidence instructions\n")
        self.write(
            "evidence/SOURCES.md",
            "# Sources\n\n| ID | Source | Evidence review | Integration audit | Last verified | Can support | Current use |\n"
            "| --- | --- | --- | --- | --- | --- | --- |\n"
            "| **P-2025-01** | A null finding | Registered | Not started | — | Bounded observation | Report |\n"
            "| **DS-2026-01** | Dataset | Registered | Not started | — | Dataset | None |\n",
        )
        self.write("GLOSSARY.md", "# Glossary\n\n## Technical Bankruptcy\nDefinition\n")
        self.write(ri.SCRIPT, (REPO / ri.SCRIPT).read_text())
        self.save_config()

    def write(self, path, text):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")

    def save_config(self):
        self.write(self.cfg, json.dumps(self.config))
        self.save_catalog()

    def save_catalog(self):
        paths = {
            p.relative_to(self.root).as_posix()
            for p in self.root.rglob("*")
            if p.is_file()
            and ".git" not in p.relative_to(self.root).parts
            and "__pycache__" not in p.parts
            and not p.name.endswith((".tmp", ".pyc"))
        }
        paths |= {self.config["catalog"], self.config["output"], self.config["map_output"]}
        directories = {"."}
        for path in paths:
            directories.update(p.as_posix() for p in Path(path).parents)
        entries = {
            p: {
                "kind": "file" if p in paths else "directory",
                "purpose": "Fixture purpose: " + p,
                "role": "source",
                "owner": "AGENTS.md",
            }
            for p in paths | directories
        }
        self.write(self.config["catalog"], json.dumps({"schema_version": 1, "entries": entries}))

    def materialize(self):
        self.save_catalog()
        data = ri.build(self.root, self.cfg)
        self.write(self.config["output"], ri.serialize_json(data))
        self.write(self.config["map_output"], ri.render_map(data))
        return data

    def roles_surface(self, roles):
        self.save_catalog()
        catalog = json.loads((self.root / self.config["catalog"]).read_text())
        for path, role in roles.items():
            catalog["entries"][path]["role"] = role
        self.write(self.config["catalog"], json.dumps(catalog))
        return ri.build(self.root, self.cfg)

    def test_serialized_freshness_and_actual_cli_round_trip(self):
        data = self.materialize()
        for body in [
            json.dumps(data),
            ri.serialize_json(data) + "\n",
            ri.serialize_json(data).replace("\n", "\r\n"),
        ]:
            with self.subTest(serialization=body[:20]):
                self.write(self.config["output"], body)
                with self.assertRaisesRegex(ValueError, "Stale or altered"):
                    ri.verify(self.root, self.cfg)
        command = ["python3", str(REPO / ri.SCRIPT), "--root", str(self.root), "--config", self.cfg]
        for action in ("build", "verify"):
            result = subprocess.run(command + [action], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            (self.root / self.config["output"]).read_bytes(),
            ri.serialize_json(ri.build(self.root, self.cfg)).encode("utf-8"),
        )
        inventory = subprocess.check_output(command + ["inventory"], text=True)
        surface = ri.verify(self.root, self.cfg)
        self.assertEqual(
            json.loads(inventory),
            {"files": surface["artifacts"], "directories": surface["directories"]},
        )
        query = subprocess.check_output(command + ["query", "джерела"], text=True)
        self.assertEqual(json.loads(query), ri.lookup(surface, "джерела"))
        scoped = subprocess.check_output(
            command + ["inventory", "--scope", "current", "--limit", "1"]
        )
        self.assertEqual(len(scoped), json.loads(scoped)["response_bytes"])
        readable = self.root / self.config["map_output"]
        readable.write_bytes(readable.read_bytes().replace(b"\n", b"\r\n"))
        with self.assertRaisesRegex(ValueError, "repository map"):
            ri.verify(self.root, self.cfg)

    def test_scopes_prefixes_and_legacy_lookup_remain_complete(self):
        for path in [
            "active/needle.md",
            "active-old/needle.md",
            "archive/needle.md",
            "draft/needle.md",
            "generated/needle.html",
        ]:
            self.write(path, "# Needle\n")
        data = self.roles_surface(
            {
                "archive": "history",
                "archive/needle.md": "history",
                "draft": "draft",
                "draft/needle.md": "draft",
                "generated": "generated",
                "generated/needle.html": "generated",
            }
        )
        self.assertEqual(
            {x["path"] for x in ri.lookup(data, "needle")["artifacts"]},
            {
                "active/needle.md",
                "active-old/needle.md",
                "archive/needle.md",
                "draft/needle.md",
                "generated/needle.html",
            },
        )
        expected = {
            "current": {"active/needle.md", "active-old/needle.md"},
            "history": {"archive/needle.md", "draft/needle.md"},
            "all": {
                "active/needle.md",
                "active-old/needle.md",
                "archive/needle.md",
                "draft/needle.md",
                "generated/needle.html",
            },
        }
        for scope, paths in expected.items():
            result = ri.scoped_lookup(data, "needle", scope=scope)
            self.assertEqual({x["path"] for x in result["artifacts"]}, paths)
        for prefix in ("active", "active/", "active/needle.md"):
            result = ri.scoped_lookup(data, command="inventory", scope="all", prefix=prefix)
            self.assertEqual([x["path"] for x in result["files"]], ["active/needle.md"])
        self.assertEqual(
            ri.scoped_lookup(data, "джерела", scope="current")["owner_candidates"][0]["path"],
            "evidence/SOURCES.md",
        )
        self.assertEqual(
            ri.scoped_lookup(data, "no-such-lexeme")["status"], "unresolved-use-direct-search"
        )
        empty = ri.scoped_lookup(data, command="inventory", prefix="not-present")
        self.assertEqual(empty["pagination"]["total"], 0)
        self.assertIsNone(empty["pagination"]["next_cursor"])
        for prefix in ("", "/", "/active", "../active", "active//file", "active/./file"):
            with self.subTest(prefix=prefix), self.assertRaises(ValueError):
                ri.scoped_lookup(data, "needle", prefix=prefix)

    def test_paging_parity_and_request_source_bound_continuation(self):
        data = self.materialize()
        expected = sorted((x["kind"], x["path"]) for x in data["artifacts"] + data["directories"])
        result = ri.scoped_lookup(data, command="inventory", limit=2)
        first_cursor = result["pagination"]["next_cursor"]
        actual, cursor = [], None
        while True:
            result = ri.scoped_lookup(data, command="inventory", limit=2, cursor=cursor)
            page = sorted((x["kind"], x["path"]) for x in result["files"] + result["directories"])
            actual.extend(page)
            self.assertEqual(result["pagination"]["returned"], len(page))
            self.assertEqual(result["pagination"]["remaining"], len(expected) - len(actual))
            self.assertEqual(
                result["response_bytes"], len(ri.serialize_json(result).encode("utf-8"))
            )
            cursor = result["pagination"]["next_cursor"]
            if cursor is None:
                break
        self.assertEqual(actual, expected)
        for options in (
            {"scope": "current"},
            {"prefix": "evidence"},
            {"limit": 3},
            {"command": "query", "query": "source registry"},
        ):
            arguments = {"command": "inventory", "limit": 2, "cursor": first_cursor, **options}
            with self.subTest(options=options), self.assertRaisesRegex(ValueError, "Cursor"):
                ri.scoped_lookup(data, **arguments)
        changed = json.loads(json.dumps(data))
        changed["source_identity"]["digest"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "Cursor"):
            ri.scoped_lookup(changed, command="inventory", limit=2, cursor=first_cursor)
        for cursor in (
            "bad",
            "-1:" + first_cursor.split(":")[1],
            "000:" + first_cursor.split(":")[1],
            "99999:" + first_cursor.split(":")[1],
        ):
            with self.subTest(cursor=cursor), self.assertRaises(ValueError):
                ri.scoped_lookup(data, command="inventory", limit=2, cursor=cursor)
        end = str(len(expected)) + ":" + first_cursor.split(":")[1]
        self.assertEqual(
            ri.scoped_lookup(data, command="inventory", limit=2, cursor=end)["pagination"][
                "returned"
            ],
            0,
        )
        for limit in (0, -1, 101, True, 1.5):
            with self.subTest(limit=limit), self.assertRaises(ValueError):
                ri.scoped_lookup(data, limit=limit, command="inventory")
        for limit in (1, 100):
            self.assertLessEqual(
                ri.scoped_lookup(data, limit=limit, command="inventory")["pagination"]["returned"],
                limit,
            )
        query_page = ri.scoped_lookup(data, "Fixture", limit=1)
        with self.assertRaisesRegex(ValueError, "Cursor"):
            ri.scoped_lookup(
                data, "different", limit=1, cursor=query_page["pagination"]["next_cursor"]
            )

    def test_directory_context_is_complete_before_paging_and_routes_keep_families(self):
        for path in (
            "area/AGENTS.md",
            "area/deep/AGENTS.md",
            "area/deep/file-a.md",
            "area-other/AGENTS.md",
            "area-other/file-b.md",
        ):
            self.write(path, "# Area input\n")
        self.config["validation_routes"] = [
            {
                "concern": "file family",
                "paths": ["area/deep/file-"],
                "commands": ["python3 check-family.py"],
                "workflow": "family.yml",
            },
            {
                "concern": "other area",
                "paths": ["area-other/"],
                "commands": ["python3 check-other.py"],
                "workflow": "other.yml",
            },
        ]
        self.save_config()
        data = self.materialize()
        for command, query in (("inventory", None), ("context-for-task", "area")):
            result = ri.scoped_lookup(data, query, command=command, prefix="area", limit=1)
            self.assertEqual(
                result["instructions"], ["AGENTS.md", "area/AGENTS.md", "area/deep/AGENTS.md"]
            )
            self.assertEqual([x["concern"] for x in result["validation_routes"]], ["file family"])
            self.assertEqual(result["editing_owners"], ["AGENTS.md"])
            self.assertEqual(result["pagination"]["returned"], 1)
        # A directory-only hit still includes live nested instructions and routes.
        result = {
            "artifacts": [],
            "directories": [next(x for x in data["directories"] if x["path"] == "area")],
            "owner_candidates": [],
            "terms": [],
            "sources": [],
        }
        metadata = ri.context_metadata(data, result)
        self.assertIn("area/deep/AGENTS.md", metadata["instructions"])
        self.assertEqual([x["concern"] for x in metadata["validation_routes"]], ["file family"])

    def test_directory_only_context_keeps_external_descendant_owner_instructions_and_checks(self):
        for path in ("area/deep/item.md", "owners/canonical.md", "owners/AGENTS.md"):
            self.write(path, "# Fixture input\n")
        self.config["validation_routes"] = [
            {
                "concern": "owner-only check",
                "paths": ["owners/canonical.md"],
                "commands": ["owner-check"],
            },
            {
                "concern": "descendant family",
                "paths": ["area/deep/item"],
                "commands": ["family-check"],
            },
        ]
        self.save_config()
        catalog = json.loads((self.root / self.config["catalog"]).read_text())
        catalog["entries"]["area"]["purpose"] = "directory-only-owner-oracle"
        catalog["entries"]["area/deep/item.md"]["owner"] = "owners/canonical.md"
        self.write(self.config["catalog"], json.dumps(catalog))
        data = ri.build(self.root, self.cfg)
        result = ri.scoped_lookup(data, "directory-only-owner-oracle", scope="current", limit=1)
        self.assertEqual(result["artifacts"], [])
        self.assertEqual([x["path"] for x in result["directories"]], ["area"])
        self.assertEqual(result["pagination"]["total"], 1)
        self.assertEqual(result["editing_owners"], ["AGENTS.md", "owners/canonical.md"])
        self.assertEqual(result["instructions"], ["AGENTS.md", "owners/AGENTS.md"])
        self.assertEqual(
            {x["commands"][0] for x in result["validation_routes"]}, {"owner-check", "family-check"}
        )
        # The same complete context also backs unqualified context-for-task.
        metadata = ri.context_metadata(data, ri.lookup(data, "directory-only-owner-oracle"))
        self.assertEqual(metadata["instructions"], result["instructions"])
        self.assertEqual(metadata["validation_routes"], result["validation_routes"])

    def test_response_measurement_and_large_metadata_are_not_silently_truncated(self):
        data = self.materialize()
        note = "Повний опис " * 7000
        data["validation_routes"] = [
            {
                "concern": "broad metadata",
                "paths": ["evidence/"],
                "commands": ["check"],
                "workflow": "test.yml",
                "note": note,
            }
        ]
        result = ri.scoped_lookup(data, "source registry", limit=1)
        self.assertEqual(result["validation_routes"][0]["note"], note)
        self.assertGreater(result["response_bytes"], 65536)
        self.assertEqual(result["response_bytes"], len(ri.serialize_json(result).encode("utf-8")))
        self.assertIn("narrow", result["response_advisory"])
        self.assertIn("evidence/AGENTS.md", result["instructions"])

    def test_map_is_short_current_entry_and_enforces_exact_byte_bound(self):
        self.write("archive/unique-historical-dump.md", "# Historical text\n")
        data = self.roles_surface(
            {"archive": "history", "archive/unique-historical-dump.md": "history"}
        )
        data["validation_routes"] = [
            {
                "concern": "source-only route",
                "paths": ["evidence/"],
                "commands": ["source-only-check"],
            }
        ]
        text = ri.render_map(data)
        self.assertIn("source-only-check", text)
        self.assertLessEqual(len(text.encode("utf-8")), 32768)
        self.assertNotIn("unique-historical-dump.md", text)
        self.assertIn("evidence/SOURCES.md", text)
        self.assertIn("--scope current", text)
        data["owners"][0]["concern"] = "і" * 32768
        with self.assertRaisesRegex(ValueError, "map byte bound"):
            ri.render_map(data)

    def test_exact_historical_agents_name_cannot_activate_or_be_suppressed(self):
        self.write("archive/AGENTS.md", "# Historical instructions\n")
        for role in ("history", "draft", "generated"):
            with self.subTest(role=role), self.assertRaisesRegex(ValueError, "inert archive name"):
                self.roles_surface({"archive/AGENTS.md": role})
            with (
                self.subTest(ancestor_role=role),
                self.assertRaisesRegex(ValueError, "inert archive name"),
            ):
                self.roles_surface({"archive": role})
        (self.root / "archive/AGENTS.md").rename(self.root / "archive/AGENTS.before.md")
        data = self.roles_surface({"archive": "history", "archive/AGENTS.before.md": "history"})
        self.assertNotIn("archive/AGENTS.before.md", {x["path"] for x in data["instructions"]})
        self.assertIn("evidence/AGENTS.md", {x["path"] for x in data["instructions"]})

    def test_capacity_independent_totals_and_all_hard_limit_boundaries(self):
        from unittest.mock import patch

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "a.bin").write_bytes(b"1234")
            (root / "b.md").write_bytes("є".encode("utf-8"))
            outputs = ["result.json", "REPOSITORY-MAP.md"]
            for path in outputs:
                (root / path).write_bytes(b"x" * 1000)
            result = ri.capacity(root, outputs)
            self.assertEqual(result["hash_input_files"], 2)
            expected = {
                "files": 4,
                "hash_total_bytes": 6,
                "hash_file_bytes": 4,
                "text_total_bytes": 2,
                "text_file_bytes": 2,
            }
            self.assertEqual({k: v["used"] for k, v in result["metrics"].items()}, expected)
            self.assertEqual(sum(x["bytes"] for x in result["derived_outputs"]), 2000)
            self.assertFalse(result["content_integrity_verified"])
            constants = {
                "files": "MAX_FILES",
                "hash_total_bytes": "MAX_HASH_TOTAL_BYTES",
                "hash_file_bytes": "MAX_HASH_FILE_BYTES",
                "text_total_bytes": "MAX_TOTAL_BYTES",
                "text_file_bytes": "MAX_FILE_BYTES",
            }
            for metric, attribute in constants.items():
                with self.subTest(metric=metric), patch.object(ri, attribute, expected[metric]):
                    self.assertEqual(ri.capacity(root, outputs)["metrics"][metric]["margin"], 0)
                    self.assertTrue(ri.capacity(root, outputs)["within_hard_limits"])
                    # Exact bound accepted by the actual scanner, then limit+1 refused.
                    ri.scan(root, outputs)
                with self.subTest(over=metric), patch.object(ri, attribute, expected[metric] - 1):
                    over = ri.capacity(root, outputs)
                    self.assertIn(metric, over["hard_limit_violations"])
                    self.assertEqual(over["metrics"][metric]["margin"], -1)
                    self.assertFalse(over["within_hard_limits"])
                    with self.assertRaises(ValueError):
                        ri.scan(root, outputs)
            for spare, warned in ((10000000, False), (9999999, True)):
                with patch.object(ri, "MAX_HASH_TOTAL_BYTES", 6 + spare):
                    self.assertEqual(bool(ri.capacity(root, outputs)["advisories"]), warned)
                    self.assertTrue(ri.capacity(root, outputs)["within_hard_limits"])

    def test_capacity_refuses_unsafe_missing_and_unreadable_inputs(self):
        from unittest.mock import patch

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            file = root / "input.bin"
            file.write_bytes(b"data")
            (root / "alias").symlink_to(file)
            with self.assertRaisesRegex(ValueError, "Symlink"):
                ri.capacity(root, [])
            (root / "alias").unlink()
            with patch.object(ri.os, "scandir", side_effect=PermissionError("fixture directory")):
                with self.assertRaises(PermissionError):
                    ri.capacity(root, [])
            original_open = Path.open

            def deny_input(path, *args, **kwargs):
                if path == file:
                    raise PermissionError("fixture unreadable input")
                return original_open(path, *args, **kwargs)

            with patch.object(Path, "open", deny_input), self.assertRaises(PermissionError):
                ri.capacity(root, [])
            subprocess.run(["git", "init", "-q", str(root)], check=True)
            subprocess.run(["git", "-C", str(root), "add", "input.bin"], check=True)
            file.unlink()
            with self.assertRaisesRegex(ValueError, "Tracked file missing or excluded"):
                ri.capacity(root, [])

    def test_capacity_cli_reports_over_limit_without_freshness_claim(self):
        # A real sparse over-limit file proves diagnostics do not call build/verify.
        with (self.root / "over-limit.zip").open("wb") as stream:
            stream.truncate(32000001)
        command = ["python3", str(REPO / ri.SCRIPT), "--root", str(self.root), "--config", self.cfg]
        result = subprocess.run(command + ["capacity"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 1)
        data = json.loads(result.stdout)
        self.assertFalse(data["within_hard_limits"])
        self.assertFalse(data["catalog_and_freshness_verified"])
        self.assertIn("hash_file_bytes", data["hard_limit_violations"])
        result = subprocess.run(command + ["build"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 1)
        self.assertIn("hash bound exceeded", result.stderr)

    def test_deterministic_complete_inventory_and_scopes(self):
        first = self.materialize()
        self.assertEqual(first, ri.build(self.root, self.cfg))
        paths = {a["path"] for a in first["artifacts"]}
        self.assertEqual(
            paths,
            {
                "AGENTS.md",
                "GLOSSARY.md",
                "evidence/AGENTS.md",
                "evidence/SOURCES.md",
                self.cfg,
                ri.SCRIPT,
                self.config["catalog"],
                self.config["output"],
                self.config["map_output"],
            },
        )
        self.assertEqual(
            {d["path"] for d in first["directories"]},
            {".", "evidence", "governance", "governance/repository-intelligence", "tools"},
        )
        evidence = next(a for a in first["artifacts"] if a["path"] == "evidence/SOURCES.md")
        self.assertEqual(evidence["instructions"], ["AGENTS.md", "evidence/AGENTS.md"])
        glossary = next(a for a in first["artifacts"] if a["path"] == "GLOSSARY.md")
        self.assertEqual(glossary["instructions"], ["AGENTS.md"])
        self.assertEqual(ri.verify(self.root, self.cfg), first)

    def test_add_modify_and_remove_each_invalidate_context(self):
        operations = [
            lambda: self.write("NEW.md", "# New\n"),
            lambda: self.write("GLOSSARY.md", "# Glossary\n## Changed term\n"),
            lambda: (self.root / "GLOSSARY.md").unlink(),
        ]
        for op in operations:
            with self.subTest(op=op):
                self.materialize()
                op()
                with self.assertRaises(ValueError):
                    ri.verify(self.root, self.cfg)
                if not (self.root / "GLOSSARY.md").exists():
                    self.write("GLOSSARY.md", "# Glossary\n")

    def test_context_is_portable_between_checkout_and_worktree(self):
        self.write(".git/config", "[core]\nrepositoryformatversion = 0\n")
        original = self.materialize()
        (self.root / ".git/config").unlink()
        (self.root / ".git").rmdir()
        self.write(".git", "gitdir: /example/repo/.git/worktrees/review\n")
        self.assertEqual(ri.verify(self.root, self.cfg), original)
        self.write(".git", "gitdir: /another/repo/.git/worktrees/review\n")
        self.assertEqual(ri.verify(self.root, self.cfg), original)
        (self.root / ".git").unlink()
        self.write(".git/config", "[core]\nrepositoryformatversion = 0\n")
        self.assertEqual(ri.verify(self.root, self.cfg), original)

    def test_config_and_producer_edits_invalidate(self):
        self.materialize()
        self.config["owners"][0]["queries"].append("new alias")
        self.save_config()
        with self.assertRaises(ValueError):
            ri.verify(self.root, self.cfg)
        self.materialize()
        self.write(ri.SCRIPT, "# Changed interpreter\n")
        with self.assertRaises(ValueError):
            ri.verify(self.root, self.cfg)

    def test_missing_and_tampered_context_fail_visibly(self):
        with self.assertRaisesRegex(ValueError, "Missing RI context"):
            ri.verify(self.root, self.cfg)
        data = self.materialize()
        data["repository"] = "wrong/owner"
        self.write(self.config["output"], json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Stale or altered"):
            ri.verify(self.root, self.cfg)

    def test_source_identity_and_status_are_not_promoted(self):
        data = self.materialize()
        result = ri.lookup(data, "P-2025-01")
        self.assertEqual(result["owner_candidates"][0]["path"], "evidence/SOURCES.md")
        self.assertEqual(result["sources"][0]["integration_audit"], "Not started")
        self.assertEqual(result["sources"][0]["last_verified"], "—")
        self.assertEqual({s["id"] for s in data["sources"]}, {"P-2025-01", "DS-2026-01"})
        self.assertEqual(
            ri.lookup(data, "джерела")["owner_candidates"][0]["path"], "evidence/SOURCES.md"
        )

    def test_miss_and_generic_matches_do_not_invent_owners(self):
        data = self.materialize()
        self.assertEqual(
            ri.lookup(data, "completely unrelated")["status"], "unresolved-use-direct-search"
        )
        self.assertEqual(ri.lookup(data, "AGENTS")["owner_candidates"], [])
        self.assertEqual(data["repository"], "example/research")
        self.assertNotIn("00-doctrine/glossary.md", {a["path"] for a in data["artifacts"]})

    def test_symlink_input_and_directory_escape_rejected(self):
        for path, target in [
            ("alias.md", self.root / "GLOSSARY.md"),
            ("external", self.root.parent),
        ]:
            with self.subTest(path=path):
                (self.root / path).symlink_to(target, target_is_directory=target.is_dir())
                with self.assertRaisesRegex(ValueError, "Symlink"):
                    ri.build(self.root, self.cfg)
                (self.root / path).unlink()

    def test_output_path_cannot_overwrite_owner_or_escape(self):
        for output in [
            "AGENTS.md",
            "../repository-intelligence/agent-context.json",
            "/tmp/repository-intelligence/agent-context.json",
        ]:
            self.config["output"] = output
            self.save_config()
            with self.subTest(output=output), self.assertRaises(ValueError):
                ri.build(self.root, self.cfg)

    def test_unrepresented_owner_and_oversize_text_fail(self):
        self.config["owners"][0]["path"] = "missing.md"
        self.save_config()
        with self.assertRaisesRegex(ValueError, "Missing represented"):
            ri.build(self.root, self.cfg)
        self.config["owners"][0]["path"] = "evidence/SOURCES.md"
        self.save_config()
        self.write("large.md", "x" * (ri.MAX_FILE_BYTES + 1))
        with self.assertRaisesRegex(ValueError, "bound exceeded"):
            ri.build(self.root, self.cfg)

    def test_inactive_terms_and_sources_are_not_indexed(self):
        self.write(
            "GLOSSARY.md",
            "# Glossary\n~~~md\n## Fake term\n~~~\n<!--\n## Comment term\n-->\n## Real term\n",
        )
        data = self.materialize()
        self.assertEqual([t["term"] for t in data["terms"]], ["Real term"])

    def test_code_comment_markers_cannot_hide_active_terms(self):
        tick = chr(96) * 3
        examples = [
            "# Glossary\n" + tick + "html\n<!--\n" + tick + "\n## Real term\nDefinition",
            "# Glossary\n    <!--\n## Real term\nDefinition",
        ]
        for body in examples:
            self.write("GLOSSARY.md", body)
            with self.subTest(body=body):
                self.assertEqual(
                    [x["term"] for x in ri.build(self.root, self.cfg)["terms"]], ["Real term"]
                )

    def test_invalid_closer_keeps_fenced_heading_inactive(self):
        tick = chr(96) * 3
        body = (
            "# Glossary\n"
            + tick
            + "md\n"
            + tick
            + "not-a-closing-fence\n## Fake term\n"
            + tick
            + "\n## Real term\n"
        )
        self.write("GLOSSARY.md", body)
        self.assertEqual([x["term"] for x in ri.build(self.root, self.cfg)["terms"]], ["Real term"])

    def test_fence_info_and_inline_span_comment_literals_are_inert(self):
        tick = chr(96)
        examples = [
            "# Glossary\n" + tick * 3 + "html <!--\nExample\n" + tick * 3 + "\n## Real term\n",
            "# Glossary\nLiteral " + tick + "<!--" + tick + "\n## Real term\n",
        ]
        for body in examples:
            self.write("GLOSSARY.md", body)
            with self.subTest(body=body):
                self.assertEqual(
                    [x["term"] for x in ri.build(self.root, self.cfg)["terms"]], ["Real term"]
                )

    def test_comment_bearing_multiline_span_is_visibly_unavailable(self):
        tick = chr(96)
        self.write(
            "GLOSSARY.md", "# Glossary\nLiteral " + tick + "<!--\n" + tick + "\n## Real term\n"
        )
        with self.assertRaisesRegex(ValueError, "Unsupported"):
            ri.build(self.root, self.cfg)

    def test_unknown_registry_schema_and_source_identity_fail(self):
        original = (self.root / "evidence/SOURCES.md").read_text()
        for changed in [
            original.replace("Integration audit", "Audit"),
            original.replace("P-2025-01", "P-2025-100"),
        ]:
            self.write("evidence/SOURCES.md", changed)
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                ri.build(self.root, self.cfg)

    def test_binary_byte_changes_invalidate_freshness(self):
        (self.root / "deck.pdf").write_bytes(b"version one")
        first = self.materialize()
        (self.root / "deck.pdf").write_bytes(b"version two")
        with self.assertRaisesRegex(ValueError, "Stale or altered"):
            ri.verify(self.root, self.cfg)
        record = next(x for x in first["source_identity"]["inputs"] if x["path"] == "deck.pdf")
        self.assertEqual(
            record,
            {"path": "deck.pdf", "identity_mode": "content", "sha256": ri.digest(b"version one")},
        )

    def test_code_css_html_and_assets_are_all_indexed_and_hashed(self):
        for path in ["engine.js", "helper.cjs", "style.css", "block.html", "portrait.webp"]:
            self.write(path, "version one")
        first = self.materialize()
        for path in ["engine.js", "helper.cjs", "style.css", "block.html", "portrait.webp"]:
            with self.subTest(path=path):
                self.assertIn(path, {a["path"] for a in first["artifacts"]})
                self.write(path, "version two")
                with self.assertRaisesRegex(ValueError, "Stale or altered"):
                    ri.verify(self.root, self.cfg)
                self.write(path, "version one")

    def test_new_root_and_nested_files_fail_without_purpose_entries(self):
        self.materialize()
        for path in ["UNKNOWN.md", "new/module.cjs"]:
            with self.subTest(path=path):
                self.write(path, "new input")
                with self.assertRaisesRegex(ValueError, "unclassified"):
                    ri.build(self.root, self.cfg)
                (self.root / path).unlink()

    def test_removed_file_and_dangling_directory_entries_fail(self):
        self.materialize()
        (self.root / "evidence/AGENTS.md").unlink()
        with self.assertRaisesRegex(ValueError, "missing/stale"):
            ri.build(self.root, self.cfg)

    def test_blank_purpose_wrong_kind_and_dangling_owner_fail(self):
        self.materialize()
        original = json.loads((self.root / self.config["catalog"]).read_text())
        for key, value in [("purpose", " "), ("kind", "directory"), ("owner", "missing.md")]:
            changed = json.loads(json.dumps(original))
            changed["entries"]["AGENTS.md"][key] = value
            self.write(self.config["catalog"], json.dumps(changed))
            with self.subTest(key=key), self.assertRaises(ValueError):
                ri.build(self.root, self.cfg)

    def test_map_missing_or_tampered_fails_and_is_not_recursive(self):
        first = self.materialize()
        self.assertEqual(ri.build(self.root, self.cfg), first)
        self.write(self.config["map_output"], "tampered map")
        with self.assertRaisesRegex(ValueError, "repository map"):
            ri.verify(self.root, self.cfg)
        (self.root / self.config["map_output"]).unlink()
        with self.assertRaisesRegex(ValueError, "repository map"):
            ri.verify(self.root, self.cfg)

    def test_history_is_searchable_but_not_scoped_agent_instructions(self):
        self.write("archive/AGENTS.before.md", "# Former instructions\nDo old task\n")
        self.materialize()
        catalog = json.loads((self.root / self.config["catalog"]).read_text())
        catalog["entries"]["archive/AGENTS.before.md"]["role"] = "history"
        self.write(self.config["catalog"], json.dumps(catalog))
        data = ri.build(self.root, self.cfg)
        hit = ri.lookup(data, "Former instructions")["artifacts"][0]
        self.assertEqual(hit["role"], "history")
        self.assertNotIn("archive/AGENTS.before.md", {i["path"] for i in data["instructions"]})

    def test_memory_and_agent_bounds_and_required_sections_fail(self):
        headings = [
            "## Snapshot",
            "## Decisions",
            "## Open work",
            "## Next session",
            "## Maintenance",
        ]
        memory_contract = {"max_lines": 120, "max_bytes": 8192, "headings": headings}
        current_config = ri.load_config(REPO, ".github/repository-intelligence-config.json")
        self.assertEqual(current_config["continuity"]["MEMORY.md"], memory_contract)
        self.config["continuity"] = {
            "AGENTS.md": {"max_lines": 2},
            "MEMORY.md": memory_contract,
        }
        memory = "# Memory\n" + "\n".join(headings) + "\n"
        self.write("MEMORY.md", memory)
        self.save_config()
        self.materialize()

        line_boundary = memory + "a\n" * (120 - len(memory.splitlines()))
        available_bytes = 8192 - len(memory.encode("utf-8")) - 1
        byte_boundary = memory + "ї" * (available_bytes // 2) + "a" * (available_bytes % 2) + "\n"
        self.assertEqual(len(line_boundary.splitlines()), 120)
        self.assertEqual(len(byte_boundary.encode("utf-8")), 8192)
        for body in (line_boundary, byte_boundary):
            self.write("MEMORY.md", body)
            ri.build(self.root, self.cfg)

        byte_overage = byte_boundary[:-1] + "a\n"
        self.assertEqual(len(byte_overage.encode("utf-8")), 8193)
        self.assertLess(len(byte_overage), 8192)
        self.write("MEMORY.md", memory)
        with self.assertRaisesRegex(ValueError, r"Continuity line bound exceeded: AGENTS\.md"):
            self.write("AGENTS.md", "a\nb\nc\n")
            ri.build(self.root, self.cfg)
        self.write("AGENTS.md", "# Root instructions\n")

        missing = memory.replace("## Snapshot\n", "")
        cases = [
            ("line overage", line_boundary + "a\n", r"Continuity line bound exceeded: MEMORY\.md"),
            ("byte overage", byte_overage, r"Continuity UTF-8 byte bound exceeded: MEMORY\.md"),
            ("missing section", missing, r"Missing continuity section ## Snapshot: MEMORY\.md"),
            (
                "fenced heading",
                missing + "```md\n## Snapshot\n```\n",
                r"Missing continuity section ## Snapshot: MEMORY\.md",
            ),
            (
                "commented heading",
                missing + "<!--\n## Snapshot\n-->\n",
                r"Missing continuity section ## Snapshot: MEMORY\.md",
            ),
        ]
        for case, body, error in cases:
            with self.subTest(case=case), self.assertRaisesRegex(ValueError, error):
                self.write("MEMORY.md", body)
                ri.build(self.root, self.cfg)

    def test_tracked_files_cannot_hide_in_excluded_directories(self):
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        self.write("node_modules/hidden.js", "tracked input")
        subprocess.run(["git", "-C", str(self.root), "add", "node_modules/hidden.js"], check=True)
        self.save_catalog()
        with self.assertRaisesRegex(ValueError, "Tracked file missing or excluded"):
            ri.build(self.root, self.cfg)

    def test_hash_bounds_fail_without_silently_omitting_binary(self):
        with (self.root / "large.zip").open("wb") as stream:
            stream.truncate(ri.MAX_HASH_FILE_BYTES + 1)
        with self.assertRaisesRegex(ValueError, "hash bound exceeded"):
            ri.build(self.root, self.cfg)

    def test_catalog_cannot_override_a_projected_path(self):
        self.materialize()
        catalog = json.loads((self.root / self.config["catalog"]).read_text())
        catalog["entries"]["AGENTS.md"]["path"] = "invented-owner.md"
        self.write(self.config["catalog"], json.dumps(catalog))
        with self.assertRaisesRegex(ValueError, "Unsupported path entry"):
            ri.build(self.root, self.cfg)

    def test_real_adapter_owners_and_cross_repo_isolation(self):
        configs = [
            REPO / "governance/repository-intelligence-config.json",
            REPO / ".github/repository-intelligence-config.json",
        ]
        path = next(p for p in configs if p.exists())
        surface = ri.build(REPO, path.relative_to(REPO).as_posix())
        self.assertNotIn(
            surface["repository"], {x["repository"] for x in surface["cross_repository"]}
        )
        for item in surface["owners"]:
            self.assertTrue((REPO / item["path"]).is_file())
        self.assertLessEqual(len(ri.render_map(surface).encode("utf-8")), 32768)
        complete_paths = {x["path"] for x in surface["artifacts"] + surface["directories"]}
        self.assertEqual(
            set(json.loads((REPO / ".github/repository-paths.json").read_text())["entries"]),
            complete_paths,
        )
        for query in ("requirements quality", "якість вимог"):
            result = ri.scoped_lookup(surface, query, scope="current", command="context-for-task")
            self.assertIn(
                "agents/reviewers/requirements-acceptance.md",
                {x["path"] for x in result["owner_candidates"]},
            )
            self.assertIn("AGENTS.md", result["instructions"])
            self.assertEqual(
                result["response_bytes"], len(ri.serialize_json(result).encode("utf-8"))
            )
        if surface["repository"].endswith("The-Subprime-Code-Crisis"):
            s = next(s for s in surface["sources"] if s["id"] == "P-2026-01")
            self.assertEqual(s["integration_audit"], "Verified")
            self.assertEqual(
                ri.lookup(surface, "P-2026-01")["owner_candidates"][0]["path"],
                "evidence/SOURCES.md",
            )
        else:
            self.assertEqual(surface["sources"], [])
            self.assertEqual(
                ri.lookup(surface, "pmday")["owner_candidates"][0]["path"], "guides/SITE-ROADMAP.md"
            )

    def test_quality_agent_queries_and_context_route_to_existing_checks(self):
        config = ".github/repository-intelligence-config.json"
        surface = ri.build(REPO, config)
        for query in [
            "requirements quality",
            "якість вимог",
            "independent code review",
            "ревʼю коду",
            "white-box testing",
            "white box testing",
            "вайтбокс тестування",
            "exploratory testing",
            "ручне тестування",
            "separate agent launches",
            "independent agents",
            "окремі запуски агентів",
        ]:
            with self.subTest(query=query):
                result = ri.lookup(surface, query)
                self.assertIn(
                    "CONTRIBUTING.md", {owner["path"] for owner in result["owner_candidates"]}
                )
                self.assertEqual(result["status"], "candidates-read-sources")

        prompt_queries = {
            "reviewer launch contract": "README.md",
            "requirements quality": "requirements-acceptance.md",
            "якість вимог": "requirements-acceptance.md",
            "independent code review": "code-review.md",
            "ревʼю коду": "code-review.md",
            "white-box testing": "white-box-qa.md",
            "вайтбокс тестування": "white-box-qa.md",
            "exploratory testing": "exploratory-interaction-qa.md",
            "ручне тестування": "exploratory-interaction-qa.md",
        }
        for query, prompt in prompt_queries.items():
            with self.subTest(prompt_query=query):
                self.assertIn(
                    "agents/reviewers/" + prompt,
                    {owner["path"] for owner in ri.lookup(surface, query)["owner_candidates"]},
                )

        command = ["python3", "tools/repository_intelligence.py", "--config", config]
        required_reads = {
            "agents/reviewers/README.md",
            "CONTRIBUTING.md",
            ".github/ACCEPTANCE.md",
            "review/REVIEW-TEMPLATE.md",
            "guides/SITE-CHECK-PROFILES.md",
            "tools/quality/test-profiles.json",
            ".github/workflows/issue-acceptance.yml",
        }
        for query in [
            *prompt_queries,
            "tools/quality/source-tests.cjs",
        ]:
            with self.subTest(context=query):
                result = json.loads(
                    subprocess.check_output(
                        command + ["context-for-task", query], cwd=REPO, text=True
                    )
                )
                self.assertIn("AGENTS.md", result["instructions"])
                self.assertTrue(
                    any(
                        required_reads <= set(route.get("read", []))
                        and route.get("workflow") == ".github/workflows/navigation.yml"
                        and "python3 tools/check_ri_ci.py verify" in route["commands"]
                        for route in result["validation_routes"]
                    )
                )
                prompt = prompt_queries.get(query)
                if query == "agents/reviewers/code-review.md":
                    prompt = "code-review.md"
                if prompt and prompt != "README.md":
                    self.assertTrue(
                        any(
                            {"agents/reviewers/README.md", "agents/reviewers/" + prompt}
                            <= set(route.get("read", []))
                            and route.get("workflow") == ".github/workflows/navigation.yml"
                            and "python3 tools/check_ri_ci.py verify" in route["commands"]
                            for route in result["validation_routes"]
                        )
                    )
                if query != "tools/quality/source-tests.cjs":
                    self.assertTrue(
                        any(
                            route.get("workflow") == ".github/workflows/issue-acceptance.yml"
                            for route in result["validation_routes"]
                        )
                    )


if __name__ == "__main__":
    unittest.main()
