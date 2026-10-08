"""Canonical source contracts for the R2 mechanical-formatting check.

This helper never executes inspected Python, templates, or YAML. HTML preserves
normal whitespace separators, including inline boundaries; raw-text elements
retain their exact contents. Runtime/output contracts have their own suites.
"""

import ast
import json
import re
import sys
from decimal import Decimal
from html.parser import HTMLParser

import yaml


class ObjectPairs(list):
    """Keep JSON object-key order without confusing objects with arrays."""


def object_pairs(pairs):
    names = [name for name, _ in pairs]
    if len(names) != len(set(names)):
        raise ValueError("Duplicate JSON object key")
    return ObjectPairs(pairs)


def json_value(value):
    if isinstance(value, ObjectPairs):
        return ["object", [[name, json_value(item)] for name, item in value]]
    if isinstance(value, list):
        return ["array", [json_value(item) for item in value]]
    if isinstance(value, Decimal):
        # Exact decimal comparison also protects large numbers from JS rounding.
        sign, digits, exponent = value.as_tuple()
        digits = list(digits)
        while len(digits) > 1 and digits[-1] == 0:
            digits.pop()
            exponent += 1
        return ["number", sign, digits, 0 if digits == [0] else exponent]
    return [type(value).__name__, value]


def yaml_value(node, active=None):
    active = set() if active is None else active
    if node is None:
        return None
    if id(node) in active:
        raise ValueError("Recursive YAML aliases are outside the source contract")
    active.add(id(node))
    try:
        if isinstance(node, yaml.ScalarNode):
            return ["scalar", node.tag, node.value]
        if isinstance(node, yaml.SequenceNode):
            return ["sequence", node.tag, [yaml_value(item, active) for item in node.value]]
        if isinstance(node, yaml.MappingNode):
            pairs = [
                [yaml_value(key, active), yaml_value(value, active)] for key, value in node.value
            ]
            names = [json.dumps(key, ensure_ascii=False) for key, _ in pairs]
            if len(names) != len(set(names)):
                raise ValueError("Duplicate YAML mapping key")
            return ["mapping", node.tag, pairs]
        raise ValueError("Unsupported YAML node")
    finally:
        active.remove(id(node))


class HTMLContract(HTMLParser):
    """Keep element/attribute order and rendered normal-whitespace separators.

    Formatting can change the width of an existing ASCII whitespace run. It
    cannot add/delete a separator around an inline tag. Only leading/trailing
    whitespace outside a fragment is ignored; no block-display assumptions hide
    internal spaces that a stylesheet could make visible.
    """

    VOID = {
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr",
    }
    RAW = {"pre", "textarea", "script", "style"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.events = []
        self.raw_stack = []
        self.svg_stack = []
        self.math_stack = []

    def handle_starttag(self, tag, attrs):
        names = [name for name, _ in attrs]
        if len(names) != len(set(names)):
            raise ValueError("Duplicate HTML attribute")
        self.events.append(["start", tag, attrs])
        if tag in self.RAW:
            self.raw_stack.append(tag)
        if (tag == "svg" or self.svg_stack) and tag not in self.VOID:
            self.svg_stack.append(tag)
        if (tag == "math" or self.math_stack) and tag not in self.VOID:
            self.math_stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        svg = (tag == "svg" or self.svg_stack) and "foreignobject" not in self.svg_stack
        math = (tag == "math" or self.math_stack) and not any(
            point in self.math_stack
            for point in {"mi", "mo", "mn", "ms", "mtext", "annotation-xml"}
        )
        if tag not in self.VOID and not svg and not math:
            # In HTML the slash is ignored for ordinary non-void elements. Treat
            # that unsupported spelling as invalid, never as an explicit close.
            raise ValueError("Non-void HTML self-closing syntax is outside the source contract")
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag not in self.VOID:
            self.events.append(["end", tag])
        if self.raw_stack and self.raw_stack[-1] == tag:
            self.raw_stack.pop()
        if self.svg_stack and self.svg_stack[-1] == tag:
            self.svg_stack.pop()
        if self.math_stack and self.math_stack[-1] == tag:
            self.math_stack.pop()

    def handle_data(self, data):
        # Element-only SVG indentation cannot paint glyphs. SVG text and embedded
        # HTML retain their separators and all non-whitespace wording is kept.
        if (
            self.svg_stack
            and not any(
                tag in {"text", "tspan", "textpath", "foreignobject"} for tag in self.svg_stack
            )
            and re.fullmatch(r"[\t\n\f\r ]+", data)
        ):
            return
        kind = "raw" if self.raw_stack else "text"
        value = data if self.raw_stack else re.sub(r"[\t\n\f\r ]+", " ", data)
        if not value:
            return
        if self.events and self.events[-1][0] == kind:
            self.events[-1][1] += value
            if kind == "text":
                self.events[-1][1] = re.sub(r" +", " ", self.events[-1][1])
        else:
            self.events.append([kind, value])

    def handle_comment(self, data):
        # A narrow formatter directive controls source layout, not page content.
        # Other comments remain part of the comparison contract.
        if data.strip() == "prettier-ignore":
            return
        self.events.append(["comment", data])

    def handle_decl(self, decl):
        self.events.append(["declaration", re.sub(r"\s+", " ", decl).strip()])

    def handle_pi(self, data):
        self.events.append(["processing-instruction", data])

    def contract(self):
        events = self.events
        while events and events[0] == ["text", " "]:
            events = events[1:]
        while events and events[-1] == ["text", " "]:
            events = events[:-1]
        return events


def contract(language, source):
    if language == "python":
        return ast.dump(ast.parse(source), include_attributes=False)
    if language == "json":
        return json_value(
            json.loads(
                source,
                object_pairs_hook=object_pairs,
                parse_int=Decimal,
                parse_float=Decimal,
                parse_constant=lambda value: (_ for _ in ()).throw(
                    ValueError("Invalid JSON number")
                ),
            )
        )
    if language == "yaml":
        return [
            yaml_value(document) for document in yaml.compose_all(source, Loader=yaml.SafeLoader)
        ]
    if language == "html":
        parser = HTMLContract()
        parser.feed(source)
        parser.close()
        return parser.contract()
    raise ValueError("Unsupported helper language: " + language)


def main():
    requests = json.load(sys.stdin)
    results = []
    for request in requests:
        try:
            results.append({"contract": contract(request["language"], request["source"])})
        except (ValueError, SyntaxError, yaml.YAMLError) as error:
            results.append({"error": type(error).__name__ + ": " + str(error)})
    json.dump(results, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
