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
STAMP_RE = re.compile(r"<!-- CAIUCTUCUC v[\d.]+(?: build)? -->")
COPY_ITEMS = ("index.html", "src", "assets", ".htaccess")


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


def copy_item(item: str) -> None:
    src = ROOT / item
    if not src.exists():
        return
    if src.is_dir():
        shutil.copytree(src, DIST / item)
    else:
        shutil.copy2(src, DIST / item)


def stamp_index(version: str) -> None:
    stamp = DIST / "index.html"
    text = stamp.read_text(encoding="utf-8")
    stamped = STAMP_RE.sub(f"<!-- CAIUCTUCUC v{version} build -->", text, count=1)
    if stamped == text:
        stamped = text.replace("<html", f"<!-- CAIUCTUCUC v{version} build -->\n<html", 1)
    plain = 'src=' + '"' + 'src/boot.js' + '"'
    marked = 'src=' + '"' + 'src/boot.js?v=' + version + '"'
    stamped = stamped.replace(plain, marked)
    stamp.write_text(stamped, encoding="utf-8")


def main() -> int:
    bad = check_dashes()
    if bad:
        print(f"build failed: {bad} forbidden dash(es)")
        return 1
    version = get_version()
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for item in COPY_ITEMS:
        copy_item(item)
    stamp_index(version)
    print(f"built v{version} into dist/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
