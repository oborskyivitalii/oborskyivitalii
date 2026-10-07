#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Run enduring Python regressions; numbered task acceptance uses its own policy."""
import argparse
import contextlib
import importlib.util
import json
import re
import sys
import unittest
from pathlib import Path

TASK_MODULE = re.compile(r"test_issue[0-9]+_acceptance\.py\Z")


def selected_modules(tests_directory):
    tests_directory = Path(tests_directory).resolve()
    if not tests_directory.is_dir():
        raise ValueError("Missing repository tests directory")
    paths = sorted(path for path in tests_directory.rglob("test_*.py")
                   if not TASK_MODULE.fullmatch(path.name))
    if any(path.is_symlink() for path in paths):
        raise ValueError("Symlink is not an enduring test module")
    return paths


@contextlib.contextmanager
def enduring_suite(tests_directory):
    tests_directory = Path(tests_directory).resolve()
    paths = selected_modules(tests_directory)
    previous_path = list(sys.path)
    previous_modules = {}
    absent = object()
    sys.path.insert(0, str(tests_directory))
    try:
        loader = unittest.TestLoader()
        suite = unittest.TestSuite()
        for path in paths:
            name = ".".join(path.relative_to(tests_directory).with_suffix("").parts)
            previous_modules[name] = sys.modules.get(name, absent)
            spec = importlib.util.spec_from_file_location(name, path)
            module = importlib.util.module_from_spec(spec)
            sys.modules[name] = module
            # Execute current bytes rather than reusable same-timestamp bytecode.
            exec(compile(path.read_bytes(), str(path), "exec", dont_inherit=True), module.__dict__)
            suite.addTests(loader.loadTestsFromModule(module))
        yield suite, paths
    finally:
        sys.path[:] = previous_path
        for name, previous in previous_modules.items():
            if previous is absent:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = previous


def run(tests_directory, stream=None):
    with enduring_suite(tests_directory) as (suite, paths):
        expected = suite.countTestCases()
        result = unittest.TextTestRunner(stream=stream, verbosity=1).run(suite)
        passed = (expected > 0 and result.testsRun == expected and result.wasSuccessful()
                  and not result.skipped and not result.expectedFailures and not result.unexpectedSuccesses)
        return {"pass": passed, "modules": [path.relative_to(tests_directory).as_posix() for path in paths],
                "tests_expected": expected, "tests_run": result.testsRun,
                "failures": len(result.failures), "errors": len(result.errors),
                "skipped": len(result.skipped), "expected_failures": len(result.expectedFailures),
                "unexpected_successes": len(result.unexpectedSuccesses)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tests", type=Path, default=Path(__file__).resolve().parents[1] / "tests")
    arguments = parser.parse_args()
    try:
        report = run(arguments.tests.resolve())
    except (ValueError, OSError, ImportError, SyntaxError) as error:
        parser.exit(1, f"Repository test selection failed: {error}\n")
    print(json.dumps(report, sort_keys=True))
    raise SystemExit(0 if report["pass"] else 1)
