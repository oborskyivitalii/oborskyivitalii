"""Issue56's frozen R1 migration evidence; excluded from permanent regression.

Baseline comparisons prove source/output parity for this accepted migration.
They cannot observe current hosted CI, independent review or a maintainer gate.
"""

import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = "e501da821c1cf9a3ac4bc8d251aba1bf4dc57d59"


def node_script(source):
    result = subprocess.run(
        ["node", "-e", source], cwd=ROOT, capture_output=True, text=True,
        check=False, timeout=120,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    return result.stdout


def node_checks(files, names):
    """Exact maintained cases must all execute successfully, without skips."""
    pattern = "^(?:" + "|".join(re.escape(name) for name in names) + ")$"
    result = subprocess.run(
        ["node", "--test", "--test-reporter=tap", "--test-name-pattern=" + pattern] + files,
        cwd=ROOT, capture_output=True, text=True, check=False, timeout=120,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    counts = {key: int(value) for key, value in re.findall(
        r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$", result.stdout, re.M)}
    assert counts.get("tests") == len(names), (counts, result.stdout)
    assert counts.get("pass") == len(names), (counts, result.stdout)
    assert all(counts.get(key) == 0 for key in ["fail", "skipped", "cancelled", "todo"]), (
        counts, result.stdout)


class Issue56AcceptanceTests(unittest.TestCase):
    def test_canonical_source_ownership_and_boundary(self):
        sources = json.loads(node_script(
            "console.log(JSON.stringify(require('./tools/site/effects.cjs').effectSources))"))
        self.assertEqual(sources, [
            "site/effects/flight.cjs", "site/effects/ribbons.cjs",
            "site/effects/reading-surfaces.cjs",
        ])
        catalog = json.loads((ROOT / ".github/repository-paths.json").read_text())["entries"]
        for source in sources + ["tools/site/export.cjs", "tools/site/effects.cjs"]:
            self.assertTrue((ROOT / source).is_file(), source)
            self.assertEqual(catalog[source]["role"], "source", source)
            self.assertEqual(catalog[source]["owner"], "site/README.md", source)
        old = "review/site-scroll-sync-20261004/"
        for name in ["FLIGHT-PROTOTYPE.cjs", "RIBBONS-PROTOTYPE.cjs",
                     "READING-SURFACES.cjs", "export.cjs"]:
            self.assertFalse((ROOT / old / name).exists(), name)
            self.assertNotIn(old + name, catalog)
        imports = re.compile(r"\brequire\s*\(\s*['\"](\.[^'\"]+)['\"]\s*\)")
        for source in (ROOT / "site").rglob("*"):
            if source.suffix not in {".cjs", ".js", ".mjs"}:
                continue
            for dependency in imports.findall(source.read_text()):
                target = (source.parent / dependency).resolve().relative_to(ROOT).as_posix()
                self.assertFalse(target.startswith(("tools/", "docs/", "review/")),
                                 str(source) + " -> " + target)
        consumers = [source for source in (ROOT / "tools").rglob("*")
                     if source.suffix in {".cjs", ".js", ".mjs"}
                     and not {"node_modules", "toolchain"}.intersection(source.parts)]
        consumers += [ROOT / path for path in [
            "review/site-scroll-sync-20261004/check-ribbon-fill.cjs",
            "review/site-scroll-sync-20261004/check-ribbon-material.cjs",
            "review/site-engine-optimization-20261005/check-geometry.cjs",
        ]]
        for source in consumers:
            for dependency in imports.findall(source.read_text()):
                target = (source.parent / dependency).resolve().relative_to(ROOT).as_posix()
                self.assertFalse(target.startswith(old), str(source) + " -> " + target)
        debt = json.loads((ROOT / ".github/code-style.json").read_text())["legacy"]
        self.assertFalse(any(row["remove_in"] == "R1" for row in debt), "R1 debt remains")

    def test_explicit_descriptors_reject_bad_composition_and_keep_serialization(self):
        node_checks(["tests/effects.test.cjs"], [
            "explicit effect collection works with a frozen attachment API and returns fresh descriptors",
            "the ordered raw effect contract rejects missing, duplicated, reversed and wrapped inputs",
            "hosted assembly preserves authored JavaScript strings and CSS comments as raw fields",
            "serialized effects execute without build/module closures and retain existing scene hooks",
            "offline adapters keep marker compatibility, safe serialization and duplicate admission",
        ])

    def test_frozen_runtime_and_offline_baseline_parity(self):
        node_script(r"""
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const cp=require('node:child_process'),crypto=require('node:crypto');
const baseline='e501da821c1cf9a3ac4bc8d251aba1bf4dc57d59';
const prefix='review/site-scroll-sync-20261004/';
const variants=require('./tools/site/variants.cjs'),effects=require('./tools/site/effects.cjs');
const color=require('./tools/staging/color.cjs'),runtime=color.runtime(color.authoredEffects());
const expected={
 code:[14274,'58699f8136578e76787a0165a90a84d0bc9cebca6ad396d3e800b55ac41adbc0'],
 styles:[929,'ac1a6c27a09d90d9e0b5f9630cd7e713437b05ab648fb1e9669e06dc2185bceb'],
 controls:[9903,'545c02a0e211ad30a4989b54d87b21beebfcafbab36a1b864cbcfed742a17fee']
};
for(const [field,[bytes,hash]]of Object.entries(expected)){
 assert.equal(Buffer.byteLength(runtime[field]),bytes,field+' length');
 assert.equal(crypto.createHash('sha256').update(runtime[field]).digest('hex'),hash,field);
}
function load(name,imports){
 const source=cp.execFileSync('git',['show',baseline+':'+prefix+name],{encoding:'utf8'});
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,
  require:id=>Object.hasOwn(imports,id)?imports[id]:require(id)},{filename:name});
 return module.exports;
}
const surfaces=load('READING-SURFACES.cjs',{});
const ribbons=load('RIBBONS-PROTOTYPE.cjs',{
 './READING-SURFACES.cjs':surfaces,'../../tools/site/variants.cjs':variants});
const flight=load('FLIGHT-PROTOTYPE.cjs',{'../../tools/site/variants.cjs':variants});
const oldExporter=load('export.cjs',{
 './RIBBONS-PROTOTYPE.cjs':ribbons,'./FLIGHT-PROTOTYPE.cjs':flight});
const preview=fs.readFileSync('review/site-v1-20261004-v11-interactive.html','utf8');
const base=require('./tools/site/export.cjs').standalone(preview);
assert.equal(base,oldExporter.standalone(preview),'standalone links and route payloads');
const before=ribbons.decorate(base),after=effects.decorateRibbons(base);
assert.equal(before,after,'offline ribbons exact bytes');
assert.equal(flight.decorate(before),effects.decorateFlight(after),'offline Color exact bytes');
assert.equal(flight.decorate(base),effects.decorateFlight(base),'offline flight exact bytes');
""")

    def test_authored_content_and_base_runtime_remain_unchanged(self):
        owners = [
            "site/content", "site/templates", "site/engine", "site/scenes", "site/assets",
            "site/integrations", "site/routes.json", "site/analytics.json",
        ]
        listed = subprocess.check_output(
            ["git", "ls-tree", "-r", "--name-only", "-z", BASELINE, "--"] + owners,
            cwd=ROOT,
        ).decode().rstrip("\0").split("\0")
        self.assertTrue(listed)
        current = set()
        for owner in owners:
            target = ROOT / owner
            if target.is_dir():
                current.update(path.relative_to(ROOT).as_posix()
                               for path in target.rglob("*") if path.is_file())
            elif target.is_file():
                current.add(owner)
        self.assertEqual(set(listed), current, "authored parity inventory changed")
        protected = ["docs/" + name for name in [
            "space.js", "styles.css", "theme.js", "archive.js", "navigation.js"]]
        protected += ["tools/site/variants.cjs", "tools/quality/budgets.json"]
        for name in listed + protected:
            with self.subTest(path=name):
                before = subprocess.check_output(["git", "show", BASELINE + ":" + name], cwd=ROOT)
                self.assertEqual((ROOT / name).read_bytes(), before, name)

    def test_generation_delivery_and_offline_source_contracts(self):
        node_checks(["tests/site-engine.test.cjs", "tests/color-build.test.cjs",
                     "tests/preview.test.cjs"], [
            "source migration preserves publication HTML and thematic geometry when shared vocabulary expands",
            "Color keeps the native route inventory and packages all requested authored effects deterministically",
            "manifest records exact inputs/outputs and unknown source shapes fail visibly",
            "interactive copies contain exact executable sources after their required DOM and embed all resources",
        ])

    def test_quality_coverage_and_exact_complexity_debt(self):
        node_checks(["tests/quality-sources.test.cjs"], [
            "effect scanning uses the canonical manifest and rejects missing or misclassified active sources",
            "the effect manifest matches all active browser dependencies and tracked source classification",
            "ESLint coverage rejects an omitted, ignored, duplicated or unparsed browser effect",
            "browser security policies cover the authored effect source directory without diagnostic harness scope",
            "Stylelint covers every authored CSS file and generated stylesheet, including newly added components",
            "newly exposed effect complexity preserves exact source debt and rejects stale or expanded allowances",
        ])

    def test_profile_selection_preserves_inventory_and_bounds(self):
        node_checks(["tests/test-profile-selection.test.cjs"], [
            "registry covers every actual JS/Python module with explicit permanent, diagnostic and issue-only ownership",
            "production keeps all active JS while staging delegates only the real local smoke baseline",
            "PR selection targets affected current contracts, diagnostic helper changes and honest non-Node routes",
            "TAP accounting rejects skips, TODOs, missing, empty, duplicate, cancelled and partial successes",
        ])


if __name__ == "__main__":
    unittest.main()
