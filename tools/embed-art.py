"""Embed assets/*.png into client.js as data URLs.

File naming: <formId>-<stateId>.png  ->  ART["<formId>/<stateId>"].

Run from anywhere:  python tools/embed-art.py
"""

import base64
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
CLIENT = ROOT / "client.js"
PATTERN = re.compile(r"const ART = \{[^}]*\}", re.DOTALL)


def collect():
    if not ASSETS.is_dir():
        sys.exit(f"missing assets directory: {ASSETS}")
    entries = {}
    for png in sorted(ASSETS.glob("*.png")):
        stem = png.stem
        if "-" not in stem:
            print(f"  skip (no <form>-<state> in name): {png.name}")
            continue
        form, state = stem.split("-", 1)
        data = base64.b64encode(png.read_bytes()).decode("ascii")
        entries[f"{form}/{state}"] = "data:image/png;base64," + data
    return entries


def main():
    entries = collect()
    if not entries:
        sys.exit("no artwork found under assets/*.png")

    lines = ["const ART = {"]
    for key, url in entries.items():
        lines.append(f"  '{key}': '{url}',")
    lines.append("}")
    table = "\n".join(lines)

    source = CLIENT.read_text(encoding="utf-8")
    updated, count = PATTERN.subn(table, source, count=1)
    if count != 1:
        sys.exit("client.js has no 'const ART = {}' anchor to replace")

    CLIENT.write_text(updated, encoding="utf-8")
    total = sum(len(v) for v in entries.values())
    print(f"embedded {len(entries)} image(s), {total} chars")
    for key in entries:
        print(f"  {key}")


if __name__ == "__main__":
    main()
