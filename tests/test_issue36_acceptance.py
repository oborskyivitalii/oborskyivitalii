"""Issue 36 source checks; actual browser/performance runs stay source-bound."""

import gzip
import math
import re
import subprocess
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "site/assets/writing-paradigm.svg"
NS = "{http://www.w3.org/2000/svg}"
EXPRESSION = "y = f(x) → y ∼ P(y|x)"
PALETTE = ["#ff2535", "#ff008e", "#8500ff", "#0063ff"]


def validate_asset(data):
    """Bound the candidate's bytes, inert SVG vocabulary and control geometry.

    Glyph metadata cannot establish visual meaning; inspect the rendered proof.
    This deliberately narrow checker is not a general-purpose SVG sanitizer.
    """
    assert len(data) <= 8192, "raw byte budget"
    assert len(gzip.compress(data, mtime=0)) <= 3072, "gzip byte budget"
    assert b"<!" not in data, "no XML entities, declarations or embedded payloads"
    root = ET.fromstring(data)
    assert root.tag == NS + "svg"
    assert root.attrib == {
        "width": "1380", "height": "240", "viewBox": "0 0 1380 240",
        "role": "img", "aria-labelledby": "title description",
    }
    allowed = {
        "svg": set(root.attrib), "title": {"id"}, "desc": {"id"},
        "defs": set(),
        "linearGradient": {"id", "x1", "y1", "x2", "y2", "gradientUnits"},
        "stop": {"offset", "stop-color"},
        "g": {"fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"},
        "path": {"data-glyph", "d", "stroke-width"},
    }
    elements = list(root.iter())
    assert len(elements) <= 40, "element budget"
    for element in elements:
        assert element.tag.startswith(NS), "foreign namespace"
        tag = element.tag[len(NS):]
        assert tag in allowed, "external, executable or expensive element"
        assert set(element.attrib) <= allowed[tag], "unapproved SVG attribute"
    assert root.find(NS + "title").text == EXPRESSION, "expression metadata"
    ids = [element.attrib["id"] for element in elements if "id" in element.attrib]
    assert sorted(ids) == ["description", "ribbon", "title"], "local identity"
    gradient = root.find(f"{NS}defs/{NS}linearGradient")
    assert gradient.attrib == {
        "id": "ribbon", "x1": "50", "y1": "0", "x2": "1330", "y2": "0",
        "gradientUnits": "userSpaceOnUse",
    }, "continuous world-independent asset gradient"
    stops = gradient.findall(NS + "stop")
    assert [stop.get("stop-color") for stop in stops] == PALETTE
    assert [stop.get("offset") for stop in stops] == ["0", "0.34", "0.64", "1"]
    group = root.find(NS + "g")
    assert group.attrib == {
        "fill": "none", "stroke": "url(#ribbon)", "stroke-width": "14",
        "stroke-linecap": "round", "stroke-linejoin": "round",
    }, "transparent stroke-only composition"
    paths = group.findall(NS + "path")
    assert "".join(path.get("data-glyph", "") for path in paths) == EXPRESSION.replace(" ", "")
    commands = 0
    for path in paths:
        assert path.get("stroke-width", "14") in {"10", "14"}
        inset = float(path.get("stroke-width", "14")) / 2
        geometry = path.get("d", "")
        tokens = re.findall(r"[MLHVC]|-?\d+(?:\.\d+)?", geometry)
        assert "".join(tokens) == re.sub(r"[\s,]", "", geometry), "unsupported geometry"
        assert tokens and tokens[0] == "M"
        index = 0
        while index < len(tokens):
            command = tokens[index]
            assert command in {"M", "L", "H", "V", "C"}, "explicit commands required"
            count = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6}[command]
            values = [float(value) for value in tokens[index + 1:index + count + 1]]
            assert len(values) == count
            for axis, value in enumerate(values):
                limit = 240 if command == "V" or (command != "H" and axis % 2) else 1380
                assert math.isfinite(value) and inset <= value <= limit - inset, "clipped control geometry"
            commands += 1
            index += count + 1
    assert commands <= 80, "path command budget"


class Issue36AssetTests(unittest.TestCase):
    def test_original_vector_is_small_inert_and_finite(self):
        validate_asset(ASSET.read_bytes())

    def test_active_external_and_unbounded_assets_fail(self):
        original = ASSET.read_bytes()
        mutations = [
            original.replace(b"<defs>", b"<defs><script>alert(1)</script>"),
            original.replace(b"<defs>", b'<defs><image href="https://invalid.example/a.png"/>'),
            original.replace(b"<defs>", b"<defs><filter id=\"blur\"/>"),
            original.replace(b"<g fill", b'<g onclick="bad()" fill'),
            original.replace(b"url(#ribbon)", b"url(https://invalid.example/paint)"),
            original.replace(b"M57 95", b"M9999 95"),
            original.replace(b"M57 95", b"MNaN 95"),
            original + b" " * 8192,
        ]
        for mutated in mutations:
            with self.subTest(size=len(mutated)), self.assertRaises((AssertionError, ValueError)):
                validate_asset(mutated)

    def test_wrong_expression_palette_and_gradient_fail(self):
        original = ASSET.read_bytes()
        for before, after in [
            ('data-glyph="∼"', 'data-glyph="="'),
            (EXPRESSION, "y = f(x)"),
            ("#8500ff", "#ffffff"),
            ('gradientUnits="userSpaceOnUse"', 'gradientUnits="objectBoundingBox"'),
        ]:
            with self.subTest(before=before), self.assertRaises(AssertionError):
                validate_asset(original.replace(before.encode(), after.encode()))


def node_checks(files, expected, pattern=None):
    """Run only the fixed maintained fixture families selected by this task."""
    arguments = ["node", "--test", "--test-reporter=tap"]
    if pattern:
        arguments.append("--test-name-pattern=" + pattern)
    result = subprocess.run(arguments + files, cwd=ROOT, text=True,
                            capture_output=True, check=False, timeout=120)
    assert result.returncode == 0, result.stdout + result.stderr
    counts = {key: int(value) for key, value in re.findall(
        r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$", result.stdout, re.M)}
    assert counts.get("tests") == expected, (counts, result.stdout)
    assert counts.get("pass") == expected, (counts, result.stdout)
    assert all(counts.get(key) == 0 for key in ["fail", "skipped", "cancelled", "todo"])


class Issue36RuntimeTests(unittest.TestCase):
    def test_scene_producer_projection_and_immutable_artwork(self):
        node_checks(["tests/site-engine.test.cjs"], 5,
                    "^the canonical formula|^Writing formula is|^embedded formula artwork|^missing canonical formula|^formula media declaration")

    def test_single_bounded_cache_depth_order_and_failure_containment(self):
        node_checks(["tests/renderer.test.cjs"], 2,
                    "^one fixed formula cache|^formula raster failure")

    def test_source_bound_performance_validator_and_adversarial_reports(self):
        node_checks(["tests/writing-paradigm-quality.test.cjs"], 5)

    def test_opt_in_ci_preserves_exact_source_and_failure_evidence(self):
        node_checks(["tests/writing-paradigm-ci.test.cjs"], 3)

    def test_browser_validator_rejects_missing_misbound_and_clipped_evidence(self):
        node_checks(["tests/writing-paradigm-browser.test.cjs"], 4)


class Issue36ControllerTests(unittest.TestCase):
    def test_declared_media_and_legacy_package_regressions(self):
        node_checks(["tests/staging.test.cjs"], 12)


if __name__ == "__main__":
    unittest.main()
