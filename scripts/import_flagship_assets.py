#!/usr/bin/env python3
"""Import the original Bloom Flagship branding archive with byte-for-byte verification.

Usage:
  python scripts/import_flagship_assets.py /path/to/Bloom_Flagship_Visual_Direction_Design_Assets_2026-10-26.zip

Requires only Python standard library. Does not download, alter or recreate artwork.
Run from repository root; review git diff, commit generated assets to the development branch.
"""
from __future__ import annotations
import hashlib
import json
import pathlib
import sys
import zipfile

ARCHIVE_SHA256 = "d69ea7927eea6a57081556cd56c7f3424b12a43f1f5cc748360f2a6a85894c37"
DEST = pathlib.Path("design/bloom/flagship/2026-10-26")
EXPECTED = {
    "README.md",
    "MANIFEST.json",
    "prototype/index.html",
    "prototype/styles.css",
    "contracts/IMPLEMENTATION_CONTRACT.md",
    "contracts/UX_BLUEPRINT.md",
    "existing-editable/01-fast-food-entry.svg",
    "existing-editable/02-canonical-food-review.svg",
    "existing-editable/03-fast-workout-log.svg",
    "existing-editable/04-evidence-progress.svg",
    "existing-editable/05-adaptation-review.svg",
    "reference/concept-five-screens.png",
    "reference/concept-three-modes.png",
}

def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Supply the local path to the original Bloom flagship ZIP.")
    source = pathlib.Path(sys.argv[1])
    if not source.is_file():
        raise SystemExit("Archive unavailable. Use original shared Library package; do not regenerate assets.")
    data = source.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != ARCHIVE_SHA256:
        raise SystemExit(f"Archive SHA-256 mismatch: {digest}; expected {ARCHIVE_SHA256}. Refusing import.")
    records = []
    with zipfile.ZipFile(source) as archive:
        names = {i.filename for i in archive.infolist() if not i.is_dir()}
        if names != EXPECTED:
            raise SystemExit(f"Archive manifest mismatch. Missing: {sorted(EXPECTED - names)} Extra: {sorted(names - EXPECTED)}")
        for name in sorted(EXPECTED):
            blob = archive.read(name)
            target = DEST / name
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists() and target.read_bytes() != blob:
                raise SystemExit(f"Existing file differs; inspect before overwriting: {target}")
            target.write_bytes(blob)
            records.append({"path": str(target), "size": len(blob), "sha256": hashlib.sha256(blob).hexdigest()})
    print(json.dumps({"archive_sha256": digest, "files": records}, indent=2))
    print("Source import complete. Commit all 13 original files and report exact Git SHA;")
    print("then demonstrate functionality on Render and obtain Branding acceptance.")

if __name__ == "__main__":
    main()
