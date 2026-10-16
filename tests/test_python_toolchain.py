"""Installed audit-graph verification, including the exact patched MCP override."""

import importlib.util
import unittest
from pathlib import Path
from types import SimpleNamespace

SOURCE = Path(__file__).resolve().parents[1] / "tools/quality/python_toolchain.py"
SPEC = importlib.util.spec_from_file_location("audit_python_toolchain", SOURCE)
TOOLCHAIN = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(TOOLCHAIN)


def distribution(name, version, requires=()):
    return SimpleNamespace(metadata={"Name": name}, version=version, requires=requires)


class PythonToolchainTests(unittest.TestCase):
    lock = "semgrep==1.179.0\nmcp==1.30.0\npackaging==26.3\n"

    def graph(self):
        return [
            distribution("semgrep", "1.179.0", ["mcp==1.29.0", "packaging>=20"]),
            distribution("mcp", "1.30.0", ["packaging>=20", "absent; extra == 'unused'"]),
            distribution("packaging", "26.3"),
        ]

    def test_exact_patched_pair_and_all_other_constraints_pass(self):
        graph = self.graph()
        result = TOOLCHAIN.verify(self.lock, graph)
        self.assertTrue(result["verified"])
        self.assertEqual((result["packages"], result["dependencies"]), (3, 3))
        self.assertEqual(
            result["compatibilityOverrides"],
            [
                {
                    "package": "semgrep",
                    "declared": "mcp==1.29.0",
                    "installed": "mcp==1.30.0",
                }
            ],
        )
        self.assertEqual(graph[0].requires[0], "mcp==1.29.0", "metadata stays unmodified")
        graph[1].requires.append("packaging[verify]>=20")
        graph[2].requires = ["mcp>=1.30; extra == 'verify'"]
        self.assertEqual(TOOLCHAIN.verify(self.lock, graph)["dependencies"], 5)

    def test_missing_changed_duplicate_and_unlocked_distributions_fail(self):
        mutations = [
            lambda rows: rows.pop(),
            lambda rows: setattr(rows[1], "version", "1.29.0"),
            lambda rows: rows.append(rows[0]),
            lambda rows: rows.append(distribution("unlocked", "1.0")),
            lambda rows: rows.append(distribution("", "1.0")),
            lambda rows: setattr(rows[2], "requires", ["absent>=1"]),
        ]
        for mutate in mutations:
            graph = self.graph()
            mutate(graph)
            with self.subTest(mutation=mutate), self.assertRaises(ValueError):
                TOOLCHAIN.verify(self.lock, graph)
        graph = self.graph()
        graph[0].requires.append("mcp[child]==1.29.0")
        graph[1].requires.append("packaging[grandchild]>=20; extra == 'child'")
        graph[2].requires = ["missing>=1; extra == 'grandchild'"]
        with self.assertRaisesRegex(ValueError, "Unfrozen installed dependency of packaging"):
            TOOLCHAIN.verify(self.lock, graph)

    def test_override_cannot_hide_another_conflict_or_constraint_change(self):
        mutations = [
            lambda rows: rows[0].requires.append("packaging<20"),
            lambda rows: setattr(rows[0], "requires", ["mcp>=1.29.0", "packaging>=20"]),
            lambda rows: rows[0].requires.append("mcp==1.29.0"),
            lambda rows: setattr(rows[2], "requires", ["mcp==1.29.0"]),
            lambda rows: setattr(rows[2], "requires", ["mcp @ https://example.invalid/mcp"]),
        ]
        for mutate in mutations:
            graph = self.graph()
            mutate(graph)
            with self.subTest(mutation=mutate), self.assertRaises(ValueError):
                TOOLCHAIN.verify(self.lock, graph)
        for version in ["1.29.0", "1.30.1", "2.2.0"]:
            graph = self.graph()
            graph[1].version = version
            with self.subTest(version=version), self.assertRaises(ValueError):
                TOOLCHAIN.verify(self.lock.replace("mcp==1.30.0", "mcp==" + version), graph)
        graph = self.graph()
        graph[1].requires.append("packaging[verify]>=20")
        graph[2].requires = ["mcp<1; extra == 'verify'"]
        with self.assertRaisesRegex(ValueError, "Incompatible installed dependency of packaging"):
            TOOLCHAIN.verify(self.lock, graph)

    def test_empty_ambiguous_and_nonexact_locks_fail(self):
        for text in [
            "",
            "mcp>=1.30",
            "mcp==1.*",
            "mcp==1.30.0\nmcp==1.30.0",
            "mcp==1.30.0; python_version>'3'",
        ]:
            with self.subTest(lock=text), self.assertRaises(ValueError):
                TOOLCHAIN.locked_packages(text)


if __name__ == "__main__":
    unittest.main()
