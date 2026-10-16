#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify installed audit dependencies and the single reviewed MCP compatibility override."""

import importlib.metadata
import json
import re
from pathlib import Path


def locked_packages(text):
    from packaging.version import Version

    locked = {}
    for line in text.splitlines():
        if not line or line.startswith("#"):
            continue
        match = re.fullmatch(r"([A-Za-z0-9][A-Za-z0-9_.-]*)==([^\s;*]+)", line)
        if match is None:
            raise ValueError("Audit dependency must have one exact version pin")
        name, version = match.groups()
        name = re.sub(r"[-_.]+", "-", name).lower()
        Version(version)
        if name in locked:
            raise ValueError("Duplicate locked audit dependency: " + name)
        locked[name] = version
    if not locked:
        raise ValueError("Empty audit dependency lock")
    return locked


def verify(text, distributions):
    from packaging.requirements import Requirement
    from packaging.utils import canonicalize_name

    locked = locked_packages(text)
    installed = {}
    for distribution in distributions:
        declared_name = distribution.metadata.get("Name")
        if not isinstance(declared_name, str) or not re.fullmatch(
            r"[A-Za-z0-9][A-Za-z0-9_.-]*", declared_name
        ):
            raise ValueError("Malformed installed audit dependency metadata")
        name = canonicalize_name(declared_name)
        if name in installed:
            raise ValueError("Duplicate installed audit dependency: " + name)
        installed[name] = distribution
    for name, version in locked.items():
        if name not in installed or installed[name].version != version:
            raise ValueError("Missing or changed installed audit dependency: " + name)
    if set(installed) - set(locked):
        raise ValueError("Unexpected installed audit dependency")
    if "semgrep" in locked and (locked["semgrep"] != "1.179.0" or locked.get("mcp") != "1.30.0"):
        raise ValueError("Unreviewed Semgrep/MCP compatibility pair")

    extras = {name: {""} for name in locked}
    changed = True
    while changed:
        changed = False
        for name in locked:
            for declaration in installed[name].requires or []:
                requirement = Requirement(declaration)
                if requirement.marker and not any(
                    requirement.marker.evaluate({"extra": extra}) for extra in extras[name]
                ):
                    continue
                dependency = canonicalize_name(requirement.name)
                if requirement.url or dependency not in locked:
                    raise ValueError("Unfrozen installed dependency of " + name)
                requested = requirement.extras - extras[dependency]
                if requested:
                    extras[dependency].update(requested)
                    changed = True

    overrides = []
    checked = 0
    for name in locked:
        distribution = installed[name]
        for declaration in distribution.requires or []:
            requirement = Requirement(declaration)
            if requirement.marker and not any(
                requirement.marker.evaluate({"extra": extra}) for extra in extras[name]
            ):
                continue
            dependency = canonicalize_name(requirement.name)
            if requirement.url or dependency not in locked:
                raise ValueError("Unfrozen installed dependency of " + name)
            checked += 1
            if locked[dependency] in requirement.specifier:
                continue
            # Semgrep CE's unchanged scan command uses the patched 1.x SDK.
            # This changes one dependency constraint, never an advisory result.
            if (
                name == "semgrep"
                and distribution.version == "1.179.0"
                and str(requirement) == "mcp==1.29.0"
                and locked[dependency] == "1.30.0"
            ):
                overrides.append(
                    {
                        "package": name,
                        "declared": str(requirement),
                        "installed": "mcp==1.30.0",
                    }
                )
                continue
            raise ValueError("Incompatible installed dependency of " + name + ": " + dependency)
    if "semgrep" in locked and len(overrides) != 1:
        raise ValueError("Changed or duplicated Semgrep/MCP constraint")
    return {
        "verified": True,
        "packages": len(locked),
        "dependencies": checked,
        "compatibilityOverrides": overrides,
    }


if __name__ == "__main__":
    requirements = Path(__file__).with_name("toolchain") / "requirements.txt"
    result = verify(requirements.read_text(), importlib.metadata.distributions())
    print(json.dumps(result, sort_keys=True))
