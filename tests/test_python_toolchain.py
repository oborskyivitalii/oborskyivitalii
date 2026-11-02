"""Installed audit-graph verification and the complete reviewed compatibility set."""

import copy
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
    lock = (
        "semgrep==1.179.0\nmcp==1.30.0\npackaging==26.3\n"
        "opentelemetry-api==1.45.1\nopentelemetry-sdk==1.45.1\n"
        "opentelemetry-exporter-otlp-proto-http==1.45.1\n"
        "opentelemetry-semantic-conventions==0.66b1\n"
    )
    declarations = [
        "mcp==1.29.0",
        "opentelemetry-api~=1.37.0",
        "opentelemetry-sdk~=1.37.0",
        "opentelemetry-exporter-otlp-proto-http~=1.37.0",
    ]

    def graph(self):
        return [
            distribution("semgrep", "1.179.0", [*self.declarations, "packaging>=20"]),
            distribution("mcp", "1.30.0", ["packaging>=20", "absent; extra == 'unused'"]),
            distribution("packaging", "26.3"),
            distribution("opentelemetry-api", "1.45.1"),
            distribution(
                "opentelemetry-sdk",
                "1.45.1",
                ["opentelemetry-api==1.45.1", "opentelemetry-semantic-conventions==0.66b1"],
            ),
            distribution(
                "opentelemetry-exporter-otlp-proto-http",
                "1.45.1",
                ["opentelemetry-api~=1.15", "opentelemetry-sdk~=1.45.1"],
            ),
            distribution(
                "opentelemetry-semantic-conventions", "0.66b1", ["opentelemetry-api==1.45.1"]
            ),
        ]

    def test_exact_reviewed_set_and_all_other_constraints_pass(self):
        graph = self.graph()
        original = copy.deepcopy(graph)
        result = TOOLCHAIN.verify(self.lock, graph)
        self.assertTrue(result["pass"])
        self.assertEqual((result["packages"], result["dependencies"]), (7, 11))
        self.assertEqual(
            result["compatibilityOverrides"],
            [
                {
                    "package": "semgrep",
                    "declared": "mcp==1.29.0",
                    "installed": "mcp==1.30.0",
                },
                {
                    "package": "semgrep",
                    "declared": "opentelemetry-api~=1.37.0",
                    "installed": "opentelemetry-api==1.45.1",
                },
                {
                    "package": "semgrep",
                    "declared": "opentelemetry-sdk~=1.37.0",
                    "installed": "opentelemetry-sdk==1.45.1",
                },
                {
                    "package": "semgrep",
                    "declared": "opentelemetry-exporter-otlp-proto-http~=1.37.0",
                    "installed": "opentelemetry-exporter-otlp-proto-http==1.45.1",
                },
            ],
        )
        self.assertEqual(graph, original, "all distribution metadata stays unmodified")
        graph[1].requires.append("packaging[verify]>=20")
        graph[2].requires = ["mcp>=1.30; extra == 'verify'"]
        self.assertEqual(TOOLCHAIN.verify(self.lock, graph)["dependencies"], 13)

    def test_graph_without_semgrep_needs_no_compatibility_record(self):
        result = TOOLCHAIN.verify(
            "mcp==1.30.0\npackaging==26.3\n",
            [distribution("mcp", "1.30.0", ["packaging>=20"]), distribution("packaging", "26.3")],
        )
        self.assertEqual(result["compatibilityOverrides"], [])
        self.assertEqual(result["dependencies"], 1)

    def test_each_reviewed_constraint_is_required_exactly_once(self):
        for declaration in self.declarations:
            for mutation in ["missing", "duplicate", "broader", "changed", "marker", "extra"]:
                graph = self.graph()
                requirement = next(value for value in graph[0].requires if value == declaration)
                name = requirement.split("==")[0].split("~=")[0]
                if mutation == "missing":
                    graph[0].requires.remove(requirement)
                elif mutation == "duplicate":
                    graph[0].requires.append(requirement)
                else:
                    replacement = {
                        "broader": name + ">=0",
                        "changed": name + "<1",
                        "marker": requirement + "; python_version >= '3.10'",
                        "extra": requirement.replace(name, name + "[unreviewed]", 1),
                    }[mutation]
                    graph[0].requires[graph[0].requires.index(requirement)] = replacement
                with self.subTest(declaration=declaration, mutation=mutation):
                    with self.assertRaises(ValueError):
                        TOOLCHAIN.verify(self.lock, graph)

    def test_duplicate_cannot_replace_a_missing_record_at_the_same_count(self):
        graph = self.graph()
        graph[0].requires[1] = graph[0].requires[0]
        with self.assertRaisesRegex(ValueError, "Duplicated reviewed Semgrep constraint"):
            TOOLCHAIN.verify(self.lock, graph)

    def test_unreviewed_versions_fail_even_when_lock_matches_installation(self):
        cases = [
            ("semgrep", "1.180.0"),
            ("mcp", "1.29.0"),
            ("mcp", "1.30.1"),
            ("mcp", "2.2.0"),
            ("opentelemetry-api", "1.37.0"),
            ("opentelemetry-api", "1.45.0"),
            ("opentelemetry-api", "1.45.2"),
            ("opentelemetry-sdk", "1.37.0"),
            ("opentelemetry-sdk", "1.45.2"),
            ("opentelemetry-exporter-otlp-proto-http", "1.37.0"),
            ("opentelemetry-exporter-otlp-proto-http", "1.45.2"),
            ("opentelemetry-semantic-conventions", "0.58b0"),
        ]
        for name, version in cases:
            graph = self.graph()
            row = next(row for row in graph if row.metadata["Name"] == name)
            lock = self.lock.replace(name + "==" + row.version + "\n", name + "==" + version + "\n")
            row.version = version
            with self.subTest(name=name, version=version), self.assertRaises(ValueError):
                TOOLCHAIN.verify(lock, graph)

    def test_foreign_package_cannot_use_any_reviewed_constraint(self):
        for declaration in self.declarations:
            graph = self.graph()
            graph[2].requires = [declaration]
            with self.subTest(declaration=declaration):
                with self.assertRaisesRegex(
                    ValueError, "Incompatible installed dependency of packaging"
                ):
                    TOOLCHAIN.verify(self.lock, graph)

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
