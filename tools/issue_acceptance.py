# SPDX-License-Identifier: Apache-2.0
"""Bounded issue acceptance evidence; reviewed repository tests, never shell policy.

This is an ordinary developer/CI runner, not a target-owned security validator.
Automated observations cannot supply independent review, a merge or live linkage.
"""
import argparse
import contextlib
import hashlib
import importlib.util
import io
import json
import os
import re
import subprocess
import sys
import unittest
from pathlib import Path

VERSION = 1
MAX_POLICY_BYTES = 128 * 1024
MAX_CRITERIA = 64
MAX_CHECKS = 256
MAX_EVENT_BYTES = 2 * 1024 * 1024
ID = re.compile(r"[A-Z][A-Z0-9_-]{1,63}\Z")
AC_ID = re.compile(r"AC[0-9]{2,3}\Z")
TEST_ID = re.compile(r"(test_[a-z0-9_]+)\.([A-Z][A-Za-z0-9]+)\.(test_[a-z0-9_]+)\Z")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def exact_keys(value, allowed, required, label):
    if not isinstance(value, dict) or set(value) - allowed or required - set(value):
        raise ValueError(f"Invalid {label} fields")


def nonempty(value, label):
    if not isinstance(value, str) or not value.strip() or len(value) > 4000:
        raise ValueError(f"Missing or invalid {label}")


def load_policy(path):
    data = Path(path).read_bytes()
    if len(data) > MAX_POLICY_BYTES:
        raise ValueError("Acceptance policy exceeds byte bound")
    policy = json.loads(data)
    exact_keys(policy, {"schema_version", "repository", "issue", "issue_url", "criteria", "checks", "gates"},
               {"schema_version", "repository", "issue", "issue_url", "criteria", "checks", "gates"}, "policy")
    if policy["schema_version"] != VERSION:
        raise ValueError("Unsupported acceptance policy version")
    if not isinstance(policy["repository"], str) or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", policy["repository"]):
        raise ValueError("Invalid repository")
    if isinstance(policy["issue"], bool) or not isinstance(policy["issue"], int) or policy["issue"] < 1:
        raise ValueError("Invalid issue number")
    expected_url = f"https://github.com/{policy['repository']}/issues/{policy['issue']}"
    if policy["issue_url"] != expected_url:
        raise ValueError("Issue URL does not match repository and number")
    checks, gates, criteria = policy["checks"], policy["gates"], policy["criteria"]
    if not isinstance(checks, dict) or not 1 <= len(checks) <= MAX_CHECKS:
        raise ValueError("Missing, empty or excessive acceptance checks")
    if not isinstance(gates, dict) or not gates or len(gates) > MAX_CRITERIA:
        raise ValueError("At least one non-automated issue gate is required")
    for key, check in checks.items():
        if not isinstance(key, str) or not ID.fullmatch(key):
            raise ValueError("Invalid check ID")
        if not isinstance(check, dict) or check.get("kind") not in {"unittest", "node-basic"}:
            raise ValueError(f"Unsupported check kind: {key}")
        if check["kind"] == "unittest":
            exact_keys(check, {"kind", "test"}, {"kind", "test"}, "unittest check")
            if not isinstance(check["test"], str) or not TEST_ID.fullmatch(check["test"]):
                raise ValueError(f"A single named repository test is required: {key}")
        else:
            exact_keys(check, {"kind"}, {"kind"}, "node-basic check")
    for key, gate in gates.items():
        if not isinstance(key, str) or not ID.fullmatch(key):
            raise ValueError("Invalid gate ID")
        exact_keys(gate, {"kind", "description"}, {"kind", "description"}, "gate")
        if gate["kind"] not in {"human", "merge"}:
            raise ValueError("Gates must require human or merge evidence")
        nonempty(gate["description"], "gate description")
    if not isinstance(criteria, list) or not 1 <= len(criteria) <= MAX_CRITERIA:
        raise ValueError("Missing, empty or excessive acceptance criteria")
    ids, used_checks, used_gates = set(), set(), set()
    for criterion in criteria:
        exact_keys(criterion, {"id", "intent", "automated_scope", "checks", "gates"},
                   {"id", "intent", "automated_scope", "checks", "gates"}, "criterion")
        key = criterion["id"]
        if not isinstance(key, str) or not AC_ID.fullmatch(key) or key in ids:
            raise ValueError("Invalid or duplicate acceptance criterion ID")
        ids.add(key)
        nonempty(criterion["intent"], "criterion intent")
        nonempty(criterion["automated_scope"], "automated scope and limitation")
        for field, registry, used in [("checks", checks, used_checks), ("gates", gates, used_gates)]:
            names = criterion[field]
            if (not isinstance(names, list) or any(not isinstance(x, str) or x not in registry for x in names)
                    or len(names) != len(set(names))):
                raise ValueError(f"Missing, duplicate or unmapped {field} for {key}")
            used.update(names)
        if not criterion["checks"] and not criterion["gates"]:
            raise ValueError(f"Unmapped acceptance criterion: {key}")
    if used_checks != set(checks) or used_gates != set(gates):
        raise ValueError("Orphan checks or gates are not mapped to acceptance criteria")
    return policy, digest(data)


def select_policy(root, event_path, event_name):
    """Explicit owning References lines, never incidental URLs or shell text."""
    root = Path(root).resolve()
    payload = Path(event_path).read_bytes()
    if len(payload) > MAX_EVENT_BYTES:
        raise ValueError("GitHub event exceeds byte bound")
    event = json.loads(payload)
    repository = event["repository"]["full_name"]
    if not isinstance(repository, str) or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        raise ValueError("Invalid event repository")
    if event_name == "pull_request":
        body = event["pull_request"].get("body") or ""
        if not isinstance(body, str):
            raise ValueError("Invalid PR body")
        owners = set()
        for line in visible_reference_lines(body):
            if not re.match(r"\s*Refs(?:\s|:)", line, flags=re.I):
                continue
            match = re.fullmatch(r"\s*Refs\s+(?:#([1-9][0-9]{0,8})|https://github\.com/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)/issues/([1-9][0-9]{0,8}))\.?\s*", line, flags=re.I)
            if not match:
                raise ValueError("Owning References must be a complete `Refs #N` or issue URL line")
            local_number, owner, full_number = match.groups()
            if local_number or owner == repository:
                owners.add(int(local_number or full_number))
        if len(owners) != 1:
            raise ValueError("PR needs exactly one explicit local owning issue; missing or ambiguous Refs")
        number = owners.pop()
    elif event_name == "workflow_dispatch":
        number = event.get("inputs", {}).get("issue_number")
        if not isinstance(number, str) or not re.fullmatch(r"[1-9][0-9]{0,8}", number):
            raise ValueError("Dispatch needs a bounded numeric issue_number")
        number = int(number)
    else:
        raise ValueError("Only PR or explicit issue dispatch selects an acceptance policy")
    relative = f".github/acceptance/issue-{number}.json"
    target = root / relative
    if any(parent.is_symlink() for parent in [target, *target.parents] if parent != root.parent):
        raise ValueError("Acceptance policy path must not contain symlinks")
    policy, policy_digest = load_policy(target)
    if policy["repository"] != repository or policy["issue"] != number:
        raise ValueError("Selected policy does not match the owning issue and repository")
    return {"policy": relative, "issue": number, "repository": repository, "policy_sha256": policy_digest}


def visible_reference_lines(body):
    """Reuse RI's checked literal handling instead of a competing Markdown parser."""
    source = Path(__file__).with_name("repository_intelligence.py")
    spec = importlib.util.spec_from_file_location("acceptance_markdown", source)
    module = importlib.util.module_from_spec(spec)
    exec(compile(source.read_bytes(), str(source), "exec", dont_inherit=True), module.__dict__)
    return module.active_markdown(body).splitlines()


def git(root, *args):
    return subprocess.check_output(["git", "-C", str(root), *args], text=True).strip()


def source_identity(root):
    """A clean source is exactly the reported Git commit; dirty evidence is local."""
    entries = subprocess.check_output(["git", "-C", str(root), "ls-files", "-v", "-z"]).split(b"\0")
    if any(entry and (entry[:1].islower() or entry[:1].upper() == b"S") for entry in entries):
        raise ValueError("Hidden index entries (assume-unchanged/skip-worktree) cannot bind exact source evidence")
    identity = {
        "commit_sha": git(root, "rev-parse", "HEAD"),
        "tree_sha": git(root, "rev-parse", "HEAD^{tree}"),
        "source_dirty": bool(git(root, "status", "--porcelain", "--untracked-files=all")),
    }
    # This also binds a dirty local report to actual changed bytes, and detects
    # a source mutation while tests run. Clean CI still requires exact HEAD.
    fingerprint = hashlib.sha256(subprocess.check_output([
        "git", "-C", str(root), "diff", "--no-ext-diff", "--no-textconv", "--binary", "HEAD"]))
    for path in sorted(subprocess.check_output([
            "git", "-C", str(root), "ls-files", "--others", "--exclude-standard", "-z"]).split(b"\0")):
        if not path:
            continue
        target = root / os.fsdecode(path)
        if target.is_symlink() or not target.is_file():
            raise ValueError("Unsupported untracked source kind")
        fingerprint.update(path + b"\0")
        with target.open("rb") as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b""):
                fingerprint.update(block)
        fingerprint.update(b"\0")
    identity["working_tree_digest"] = fingerprint.hexdigest()
    surface = root / ".github/repository-intelligence/agent-context.json"
    if surface.is_file():
        payload = surface.read_bytes()
        identity["ri_surface_sha256"] = digest(payload)
        identity["ri_source_digest"] = json.loads(payload)["source_identity"]["digest"]
    return identity


def unittest_check(root, name):
    """Load exactly one existing public test method; empty and skipped cannot pass."""
    module_name, class_name, method_name = TEST_ID.fullmatch(name).groups()
    module_path = root / "tests" / (module_name + ".py")
    if not module_path.is_file() or module_path.is_symlink():
        raise ValueError(f"Missing repository test module: {name}")
    test_directory = str(root / "tests")
    sys.path.insert(0, test_directory)
    capture = io.StringIO()
    absent = object()
    previous_module = sys.modules.get(module_name, absent)
    try:
        # Ordinary reviewed tests may execute Python; the policy supplies no code.
        with contextlib.redirect_stdout(capture), contextlib.redirect_stderr(capture):
            spec = importlib.util.spec_from_file_location(module_name, module_path)
            module = importlib.util.module_from_spec(spec)
            # Compile admitted current bytes: SourceFileLoader may otherwise use
            # a stale same-size/same-timestamp .pyc while we report a fresh hash.
            admitted_source = module_path.read_bytes()
            sys.modules[module_name] = module
            exec(compile(admitted_source, str(module_path), "exec", dont_inherit=True), module.__dict__)
            case = getattr(module, class_name)
            if not isinstance(case, type) or not issubclass(case, unittest.TestCase):
                raise ValueError(f"Not a unittest case: {name}")
            if not callable(getattr(case, method_name, None)):
                raise ValueError(f"Missing named test: {name}")
            suite = unittest.TestSuite([case(method_name)])
            result = unittest.TestResult()
            suite.run(result)
        failures = [{"test": test.id(), "detail": detail} for test, detail in result.failures + result.errors]
        skipped = [{"test": test.id(), "reason": reason} for test, reason in result.skipped]
        expected = [{"test": test.id(), "detail": detail} for test, detail in result.expectedFailures]
        unexpected = [test.id() for test in result.unexpectedSuccesses]
        passed = result.testsRun == 1 and result.wasSuccessful() and not skipped and not expected and not unexpected
        return {"status": "passed" if passed else "failed", "kind": "unittest", "test": name,
                "tests_run": result.testsRun, "failures": failures, "skipped": skipped,
                "expected_failures": expected, "unexpected_successes": unexpected,
                "test_file_sha256": digest(admitted_source),
                "captured_output_sha256": digest(capture.getvalue().encode())}
    finally:
        if previous_module is absent:
            sys.modules.pop(module_name, None)
        else:
            sys.modules[module_name] = previous_module
        sys.path.remove(test_directory)


def node_basic_check(root):
    # Fixed repository command. Policy cannot choose shell, arguments or paths.
    result = subprocess.run(["node", "tools/quality/local.cjs"], cwd=root, text=True,
                            capture_output=True, timeout=300, check=False)
    payload = None
    try:
        payload = json.loads(result.stdout.strip().splitlines()[-1])
        tests = payload["focusedTests"]
        passed = (result.returncode == 0 and payload["profile"] == "local" and payload["pass"] is True
                  and tests["total"] > 0 and tests["passed"] == tests["total"]
                  and tests["failed"] == 0 and tests["skipped"] == 0 and bool(payload["checks"]))
    except (ValueError, KeyError, TypeError, IndexError):
        passed = False
    return {"status": "passed" if passed else "failed", "kind": "node-basic",
            "command": ["node", "tools/quality/local.cjs"], "returncode": result.returncode,
            "result": payload, "stdout_sha256": digest(result.stdout.encode()),
            "stderr_sha256": digest(result.stderr.encode()),
            "failure_detail": result.stderr[-4000:] if not passed else None}


def run_policy(root, path, require_clean=False, expected_source=None):
    root = Path(root).resolve()
    report = {"schema_version": VERSION, "automation_pass": False, "evidence_valid": False,
              "ready_for_issue_closure": False, "policy_path": str(path),
              "limitations": ["Repository-owned developer tests; not a target-owned untrusted-candidate validator.",
                              "Policy is an issue mapping, not proof it reproduces live issue intent.",
                              "Manual gates remain pending; this runner does not review, merge, deploy or close issues."],
              "checks": {}, "criteria": [], "gates": {}, "errors": []}
    try:
        policy, policy_digest = load_policy(path)
        report.update({"repository": policy["repository"], "issue": policy["issue"],
                       "issue_url": policy["issue_url"], "policy_sha256": policy_digest,
                       "producer_sha256": digest(Path(__file__).read_bytes())})
        report["gates"] = {key: {**gate, "status": "pending", "evidence": None}
                           for key, gate in policy["gates"].items()}
        report["criteria"] = [{**criterion, "status": "not-run", "gates_status": "pending"}
                              for criterion in policy["criteria"]]
        identity = source_identity(root)
        report["source"] = identity
        report["github"] = {key: os.environ.get(key) for key in
                            ["GITHUB_RUN_ID", "GITHUB_RUN_ATTEMPT", "GITHUB_EVENT_NAME", "GITHUB_REPOSITORY"]}
        if expected_source is not None and (not re.fullmatch(r"[0-9a-f]{40}", expected_source)
                                            or expected_source != identity["commit_sha"]):
            raise ValueError("Expected source does not match exact checkout HEAD")
        if require_clean and identity["source_dirty"]:
            raise ValueError("A clean checkout is required to bind acceptance to the reported commit")
        for key, check in policy["checks"].items():
            try:
                result = (unittest_check(root, check["test"]) if check["kind"] == "unittest"
                          else node_basic_check(root))
            except Exception as error:
                result = {"status": "failed", "kind": check["kind"], "error": f"{type(error).__name__}: {error}"}
            report["checks"][key] = result
        report["criteria"] = []
        for criterion in policy["criteria"]:
            names = criterion["checks"]
            status = ("failed" if any(report["checks"][key]["status"] != "passed" for key in names)
                      else "automated-pass" if names else "manual-only-pending")
            report["criteria"].append({**criterion, "status": status,
                                      "gates_status": "pending" if criterion["gates"] else "none"})
        if source_identity(root) != identity:
            raise ValueError("Source identity changed during acceptance checks")
        if digest(Path(path).read_bytes()) != policy_digest:
            raise ValueError("Policy changed during acceptance checks")
        report["evidence_valid"] = True
        report["automation_pass"] = bool(report["checks"]) and all(
            check["status"] == "passed" for check in report["checks"].values())
    except Exception as error:
        report["errors"].append(f"{type(error).__name__}: {error}")
        for criterion in report["criteria"]:
            if criterion["status"] == "automated-pass":
                criterion["status"] = "invalidated"
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["run", "validate", "select"])
    parser.add_argument("--policy")
    parser.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--report")
    parser.add_argument("--require-clean", action="store_true")
    parser.add_argument("--expected-source")
    parser.add_argument("--event")
    parser.add_argument("--event-name")
    parser.add_argument("--github-env")
    args = parser.parse_args()
    if args.command == "select":
        if not all([args.event, args.event_name, args.github_env, args.report]):
            parser.error("select requires --event, --event-name, --github-env and --report")
        output = Path(args.report).resolve()
        root = Path(args.root).resolve()
        if output == root or root in output.parents:
            parser.error("The acceptance report must be outside the checkout")
        report = {"schema_version": VERSION, "automation_pass": False,
                  "ready_for_issue_closure": False, "selection": None, "errors": []}
        try:
            selection = select_policy(root, args.event, args.event_name)
            report["selection"] = selection
            report["source"] = source_identity(root)
            with Path(args.github_env).open("a", encoding="utf-8") as stream:
                stream.write(f"ACCEPTANCE_POLICY={selection['policy']}\nACCEPTANCE_ISSUE={selection['issue']}\n")
        except Exception as error:
            report["errors"].append(f"{type(error).__name__}: {error}")
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(json.dumps(report, sort_keys=True))
        return 1 if report["errors"] else 0
    if not args.policy:
        parser.error("run and validate require --policy")
    if args.command == "validate":
        try:
            policy, policy_digest = load_policy(args.policy)
            print(json.dumps({"policy_sha256": policy_digest, "criteria": [x["id"] for x in policy["criteria"]]}, sort_keys=True))
            return 0
        except Exception as error:
            print(f"Invalid acceptance policy: {error}", file=sys.stderr)
            return 1
    if not args.report:
        parser.error("run requires --report (use a path outside the checkout)")
    output = Path(args.report).resolve()
    root = Path(args.root).resolve()
    if output == root or root in output.parents:
        parser.error("The acceptance report must be outside the checkout")
    report = run_policy(root, args.policy, args.require_clean, args.expected_source)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".tmp")
    temporary.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(output)
    print(json.dumps({"issue": report.get("issue"), "source": report.get("source"),
                      "automation_pass": report["automation_pass"],
                      "ready_for_issue_closure": report["ready_for_issue_closure"],
                      "criteria": {x["id"]: x["status"] for x in report["criteria"]},
                      "pending_gates": list(report["gates"]), "errors": report["errors"],
                      "report": str(output)}, sort_keys=True))
    return 0 if report["automation_pass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
