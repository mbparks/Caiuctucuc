#!/usr/bin/env python3
"""CAIUCTUCUC build: produce a deployable snapshot in dist/.

Build-time static generation, per the standing architecture preference.
The build fails if any em dash or en dash appears anywhere in the tree.
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
CHECK_SUFFIXES = {".md", ".js", ".html", ".json", ".svg", ".py", ".yml"}
DASHES = re.compile("[\u2014\u2013]")


def check_dashes() -> int:
    bad = 0
    for path in ROOT.rglob("*"):
        if path.is_dir() or DIST in path.parents:
            continue
        if any(part in (".git", "node_modules") for part in path.parts):
            continue
        if path.suffix not in CHECK_SUFFIXES:
            continue
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if DASHES.search(line):
                print(f"em dash: {path.relative_to(ROOT)}:{lineno}")
                bad += 1
    return bad


def get_version() -> str:
    text = (ROOT / "src" / "version.js").read_text(encoding="utf-8")
    return re.search(r"'([\d.]+)'", text).group(1)


def main() -> int:
    bad = check_dashes()
    if bad:
        print(f"build failed: {bad} forbidden dash(es)")
        return 1
    version = get_version()
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for item in ("index.html", "src", "assets"):
        src = ROOT / item
        if src.is_dir():
            shutil.copytree(src, DIST / item)
        else:
            shutil.copy2(src, DIST / item)
    stamp = DIST / "index.html"
    stamp.write_text(
        stamp.read_text(encoding="utf-8").replace(
            "<!-- CAIUCTUCUC v0.21.2 -->", f"<!-- CAIUCTUCUC v{version} build -->"
        ),
        encoding="utf-8",
    )
    print(f"built v{version} into dist/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
