#!/usr/bin/env python3
"""Keep brand/tokens.json in sync with brand/tokens.css and enforce "tokens only".

Usage:
  python3 tools/tokens.py sync    rewrite tokens.json from tokens.css (keeps descriptions)
  python3 tools/tokens.py check   fail if tokens.json is out of sync, or if any page
                                  stylesheet hardcodes a value that should be a token

No dependencies beyond the Python 3 standard library.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "brand" / "tokens.css"
JSON = ROOT / "brand" / "tokens.json"

BREAKPOINTS = {"sm": "40rem", "md": "48rem", "lg": "64rem", "xl": "80rem"}

# Prefix of a token name -> group in tokens.json (longest prefix wins).
GROUPS = [
    ("--color-", "color"),
    ("--font-weight-", "fontWeight"),
    ("--font-", "fontFamily"),
    ("--text-", "fontSize"),
    ("--leading-", "lineHeight"),
    ("--tracking-", "letterSpacing"),
    ("--measure", "typography"),
    ("--underline-", "typography"),
    ("--space-", "space"),
    ("--container-", "layout"),
    ("--gutter", "layout"),
    ("--grid-", "layout"),
    ("--tap-", "layout"),
    ("--nav-", "layout"),
    ("--border-", "border"),
    ("--focus-", "border"),
    ("--radius-", "radius"),
    ("--shadow-", "shadow"),
    ("--duration-", "motion"),
    ("--stagger", "motion"),
    ("--ease-", "motion"),
    ("--motion-", "motion"),
    ("--press-", "motion"),
    ("--z-", "zIndex"),
    ("--opacity-", "opacity"),
    ("--fig-", "figmaVariants"),
    ("--vo-", "color"),
    ("--logo-", "layout"),
]

BLOCK_RE = re.compile(r"([^{}]+)\{([^{}]*)\}", re.S)
DECL_RE = re.compile(r"(--[\w-]+)\s*:\s*([^;]+);")
COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)


def group_of(name):
    for prefix, group in sorted(GROUPS, key=lambda g: -len(g[0])):
        if name.startswith(prefix):
            return group
    return "other"


def parse_css():
    """Return {"tokens": {...}, "themes": {...}, "reducedMotion": {...}} from tokens.css."""
    text = COMMENT_RE.sub("", CSS.read_text(encoding="utf-8"))
    tokens, themes, reduced = {}, {}, {}
    # Pull the reduced-motion block out first so its :root is not mistaken for the main one.
    rm = re.search(r"@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{(.*)\}\s*$", text, re.S)
    if rm:
        for name, value in DECL_RE.findall(rm.group(1)):
            reduced[name] = " ".join(value.split())
        text = text[: rm.start()]
    for selector, body in BLOCK_RE.findall(text):
        selector = " ".join(selector.split())
        decls = {n: " ".join(v.split()) for n, v in DECL_RE.findall(body)}
        brands = re.findall(r'\[data-brand="([\w-]+)"\]', selector)
        if brands:
            for brand in brands:
                themes[brand] = decls
        elif selector == ":root":
            tokens.update(decls)
    return {"tokens": tokens, "themes": themes, "reducedMotion": reduced}


def flatten_json(data):
    tokens = {}
    for group in data.get("tokens", {}).values():
        for name, entry in group.items():
            tokens[name] = entry["value"]
    return {
        "tokens": tokens,
        "themes": data.get("themes", {}),
        "reducedMotion": data.get("reducedMotion", {}),
    }


def sync():
    parsed = parse_css()
    old = json.loads(JSON.read_text(encoding="utf-8")) if JSON.exists() else {}
    old_desc = {}
    for group in old.get("tokens", {}).values():
        for name, entry in group.items():
            if entry.get("description"):
                old_desc[name] = entry["description"]
    grouped = {}
    for name, value in parsed["tokens"].items():
        entry = {"value": value}
        if name in old_desc:
            entry["description"] = old_desc[name]
        grouped.setdefault(group_of(name), {})[name] = entry
    out = {
        "$meta": old.get("$meta", {
            "source": "brand/tokens.css",
            "status": "working draft: colours, fonts and brand accents are placeholders",
        }),
        "breakpoints": BREAKPOINTS,
        "tokens": grouped,
        "themes": parsed["themes"],
        "reducedMotion": parsed["reducedMotion"],
    }
    JSON.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"tokens.json written: {len(parsed['tokens'])} tokens, {len(parsed['themes'])} themes")


# ---------- hardcoded-value lint ----------

LINT_DIRS = ["styleguide", "deck", "site", "brand"]
LINT_SKIP = {CSS}
STYLE_TAG_RE = re.compile(r"<style[^>]*>(.*?)</style>", re.S | re.I)
STYLE_ATTR_RE = re.compile(r'style="([^"]*)"', re.I)
BAD_PATTERNS = [
    (re.compile(r"#[0-9a-fA-F]{3,8}\b"), "hex colour"),
    (re.compile(r"\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\("), "colour function"),
    (re.compile(r"(?<![\w-])\d*\.?\d+(?:px|rem|em|pt)\b"), "length"),
    (re.compile(r"(?<![\w-])\d*\.?\d+m?s\b"), "duration"),
    (re.compile(r"cubic-bezier\("), "easing"),
    (re.compile(r"font-family\s*:(?!\s*(?:var\(|inherit))"), "font family"),
]


def lint_css(css, origin):
    """Flag hardcoded values. A line ending in /* lint-ok */ is exempt (technical, non-visual values only)."""
    problems = []
    original = css.splitlines()
    css = COMMENT_RE.sub(lambda m: "\n" * m.group(0).count("\n"), css)
    for lineno, line in enumerate(css.splitlines(), 1):
        if "lint-ok" in original[lineno - 1]:
            continue
        stripped = line.strip()
        if stripped.startswith("@media") or stripped.startswith("@supports") or "url(" in stripped:
            continue
        for pattern, label in BAD_PATTERNS:
            hits = [m.group(0) for m in pattern.finditer(line)]
            # A zero length or duration is not a design value.
            hits = [h for h in hits if not re.fullmatch(r"0*\.?0+[a-z]*", h)]
            if hits:
                problems.append(f"{origin}:{lineno}: hardcoded {label}: {stripped}")
                break
    return problems


def lint():
    problems = []
    for d in LINT_DIRS:
        base = ROOT / d
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if path in LINT_SKIP or not path.is_file():
                continue
            rel = path.relative_to(ROOT)
            if path.suffix == ".css":
                problems += lint_css(path.read_text(encoding="utf-8"), rel)
            elif path.suffix == ".html":
                html = path.read_text(encoding="utf-8")
                for m in STYLE_TAG_RE.finditer(html):
                    problems += lint_css(m.group(1), f"{rel} <style>")
                for m in STYLE_ATTR_RE.finditer(html):
                    problems += lint_css(m.group(1), f"{rel} style=")
    root_index = ROOT / "index.html"
    if root_index.exists():
        html = root_index.read_text(encoding="utf-8")
        for m in STYLE_TAG_RE.finditer(html):
            problems += lint_css(m.group(1), "index.html <style>")
        for m in STYLE_ATTR_RE.finditer(html):
            problems += lint_css(m.group(1), "index.html style=")
    return problems


def check():
    ok = True
    parsed = parse_css()
    if not JSON.exists():
        print("tokens.json missing: run python3 tools/tokens.py sync")
        return False
    current = flatten_json(json.loads(JSON.read_text(encoding="utf-8")))
    for key in ("tokens", "themes", "reducedMotion"):
        if parsed[key] != current[key]:
            ok = False
            a, b = parsed[key], current[key]
            for name in sorted(set(a) | set(b)):
                if a.get(name) != b.get(name):
                    print(f"out of sync [{key}] {name}: css={a.get(name)!r} json={b.get(name)!r}")
    problems = lint()
    for p in problems:
        print(p)
    if problems:
        ok = False
    print("tokens: OK" if ok else "tokens: FAILED")
    return ok


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if cmd == "sync":
        sync()
    elif cmd == "check":
        sys.exit(0 if check() else 1)
    else:
        print(__doc__)
        sys.exit(2)
