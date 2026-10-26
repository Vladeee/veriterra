#!/usr/bin/env python3
"""Build a copy of the site that can be published as a claude.ai Artifact (the built-in preview).

An Artifact page is wrapped in its own <html><head><body> at publish time, so this strips those
tags from index.html, drops the tags that only make sense on GitHub Pages (manifest, icons,
theme colour) and copies the stylesheets, scripts and fonts next to it. The repository is not
touched.

Usage:
  python3 tools/preview.py OUT_DIR [--title "Vitreeone Presentation"]

Prints the published file list (relative paths, one per line) after the line "FILES:".
No dependencies beyond the Python 3 standard library.
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COPY_DIRS = ["brand", "presentation"]
COPY_SUFFIXES = {".css", ".js", ".woff2"}
DROP_TAGS = [
    r'<meta\s+charset[^>]*>',
    r'<meta\s+name="viewport"[^>]*>',
    r'<meta\s+name="(?:theme-color|description|apple-[^"]*|mobile-web-app-capable)"[^>]*>',
    r'<link\s+rel="(?:manifest|icon|apple-touch-icon)"[^>]*>',
    r'<title>.*?</title>',
]


def build(out, title):
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
    body = re.search(r"<body[^>]*>(.*?)</body>", html, re.S).group(1)
    for pattern in DROP_TAGS:
        head = re.sub(pattern, "", head, flags=re.S)
    head = "\n".join(line for line in head.splitlines() if line.strip())
    page = f"<title>{title}</title>\n{head}\n{body.strip()}\n"

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    (out / "index.html").write_text(page, encoding="utf-8")

    files = []
    for d in COPY_DIRS:
        for path in sorted((ROOT / d).rglob("*")):
            if path.is_file() and path.suffix in COPY_SUFFIXES:
                rel = path.relative_to(ROOT)
                target = out / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, target)
                files.append(rel.as_posix())
    return files


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("out", type=Path)
    ap.add_argument("--title", default="Vitreeone Presentation")
    args = ap.parse_args()
    files = build(args.out.resolve(), args.title)
    print(f"built {args.out} ({len(files)} files + index.html)")
    print("FILES:")
    print("\n".join(files))


if __name__ == "__main__":
    sys.exit(main())
