"""Read-only local preflight; findings never contain matched values.

Run with detect-secrets==1.5.0 in an isolated tooling environment. No verification
API is called: only local pattern detectors' analyze_string methods are used.
This is conservative triage, not certification that a repository contains no PHI.
"""
import argparse
from collections import Counter
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import re
import subprocess

MAX_BYTES = 2 * 1024 * 1024
MAX_LINE = 16384
RECORD_PATTERNS = {
    "possible-vcf-records": re.compile(r"(?m)^##fileformat=VCF|^#CHROM\tPOS\t"),
    "possible-clinical-records": re.compile(r'"resourceType"\s*:\s*"(?:Patient|Observation|DiagnosticReport)"'),
    "possible-personal-data-table": re.compile(r"(?im)^(?:patient_name|patient_id|date_of_birth)[,\t]"),
}


def scan_text(data, plugins):
    if len(data) > MAX_BYTES:
        return {"uninspected-large-object"}
    if b"\x00" in data[:8192]:
        return {"binary-not-inspected"}
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return {"non-utf8-not-inspected"}
    findings = {name for name, pattern in RECORD_PATTERNS.items() if pattern.search(text)}
    lines = text.splitlines()
    if any(len(line) > MAX_LINE for line in lines):
        findings.add("uninspected-long-line")
    lines = [line for line in lines if len(line) <= MAX_LINE]
    # No matched value, excerpt or reversible secret digest enters the report.
    # No verify/analyze_line calls: provider credential verification could network.
    for plugin in plugins:
        for line in lines:
            if next(iter(plugin.analyze_string(line)), None) is not None:
                findings.add("potential-secret:" + plugin.secret_type)
                break
    return findings


def _git(root, arguments, data=None):
    process = subprocess.run(["git", "-C", str(root), *arguments], input=data,
                             stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=False)
    if process.returncode:
        raise RuntimeError("Git inventory failed; preflight incomplete.")
    return process.stdout


def preflight(root, plugins):
    findings = []
    counts = Counter()
    content_cache = {}
    history_cache = {}
    index_snapshot = _git(root, ["ls-files", "--stage", "-z"])

    def record_types(scope, identity, types):
        counts[scope] += 1
        if types:
            findings.append({"scope": scope, "object": identity, "categories": sorted(types)})

    def record(scope, identity, data):
        digest = hashlib.sha256(data).digest()
        if digest not in content_cache:
            content_cache[digest] = scan_text(data, plugins)
        types = content_cache[digest]
        record_types(scope, identity, types)
        return types

    # Include every ref and local reflog, not merely HEAD/new files. Read each
    # object once. Commit/tag messages are scanned as well as file contents.
    ids = _git(root, ["rev-list", "--objects", "--all", "--reflog", "--no-object-names"])
    metadata = _git(root, ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"], ids)
    objects = []
    for line in metadata.splitlines():
        oid, kind, size = line.decode("ascii").split()
        if kind in {"blob", "commit", "tag"}:
            objects.append((oid, int(size)))
    # Persistent batch process avoids one child process per historic blob.
    process = subprocess.Popen(["git", "-C", str(root), "cat-file", "--batch"],
                               stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    try:
        for oid, size in objects:
            if size > MAX_BYTES:
                history_cache[oid] = {"uninspected-large-object"}
                record_types("history", oid, history_cache[oid])
                continue
            process.stdin.write((oid + "\n").encode())
            process.stdin.flush()
            header = process.stdout.readline().decode().split()
            if len(header) != 3 or header[0] != oid or int(header[2]) != size:
                raise RuntimeError("History object read failed; preflight incomplete.")
            data = process.stdout.read(size)
            if len(data) != size or process.stdout.read(1) != b"\n":
                raise RuntimeError("History object read failed; preflight incomplete.")
            history_cache[oid] = record("history", oid, data)
    finally:
        process.stdin.close()
        process.stdout.close()
        process.wait()

    for entry in index_snapshot.split(b"\x00"):
        if not entry:
            continue
        metadata, filename = entry.split(b"\t", 1)
        mode, oid, stage = metadata.split()
        if stage != b"0":
            raise RuntimeError("Unmerged index; preflight incomplete.")
        identity = oid.decode()
        if identity in history_cache:
            record_types("index", identity, history_cache[identity])
        elif int(_git(root, ["cat-file", "-s", identity])) > MAX_BYTES:
            record_types("index", identity, {"uninspected-large-object"})
        else:
            record("index", identity, _git(root, ["cat-file", "blob", identity]))

    for name in _git(root, ["ls-files", "--cached", "--others", "--exclude-standard", "-z"]).split(b"\x00"):
        if not name:
            continue
        path = root / os.fsdecode(name)
        # Do not follow repository links to private files outside the checkout.
        identity = hashlib.sha256(name).hexdigest()
        if path.is_symlink() or not path.resolve().is_relative_to(root):
            findings.append({"scope": "worktree", "object": identity,
                             "categories": ["symlink-not-inspected"]})
        elif path.is_file():
            with path.open("rb") as handle:
                record("worktree", identity, handle.read(MAX_BYTES + 1))
    incomplete = False
    if index_snapshot != _git(root, ["ls-files", "--stage", "-z"]):
        incomplete = True
        findings.append({"scope": "index", "object": "changed-during-scan",
                         "categories": ["index-changed-during-scan"]})
    if set(ids.splitlines()) != set(_git(root, ["rev-list", "--objects", "--all", "--reflog", "--no-object-names"]).splitlines()):
        incomplete = True
        findings.append({"scope": "history", "object": "changed-during-scan",
                         "categories": ["history-changed-during-scan"]})
    categories = Counter(category for item in findings for category in item["categories"])
    return {"status": "INCOMPLETE" if incomplete else "REVIEW_REQUIRED" if findings else "NO_PATTERN_FINDINGS",
            "scanner": "detect-secrets local pattern detectors",
            "scannerVersion": importlib.metadata.version("detect-secrets"),
            "networkVerification": False, "objectsScanned": dict(counts),
            "categoryCounts": dict(categories), "findings": findings,
            "limitations": ["Pattern findings are candidates, not confirmed credential or PHI incidents.",
                            "Binary/images, large/non-UTF8 objects, long lines and arbitrary biological record formats need separate review.",
                            "Unfetched refs, hosted caches and objects unreachable from local refs/reflogs are outside scope.",
                            "No pattern findings is not a privacy certification or permission to commit/push."]}


def main():
    parser = argparse.ArgumentParser(description="Local read-only privacy preflight; no matched values printed.")
    parser.add_argument("--report", required=True, type=Path, help="New private JSON path outside Git")
    arguments = parser.parse_args()
    root = Path(_git(Path.cwd(), ["rev-parse", "--show-toplevel"]).decode().strip()).resolve()
    report_path = arguments.report.expanduser().absolute()
    if report_path.resolve().is_relative_to(root):
        raise RuntimeError("Report must be outside the repository.")
    from detect_secrets.settings import default_settings, get_plugins
    with default_settings():
        report = preflight(root, get_plugins())
    descriptor = os.open(report_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, "w") as handle:
        json.dump(report, handle, indent=2)
    # No filenames, values or excerpts in command/CI output.
    print(json.dumps({key: report[key] for key in ("status", "objectsScanned", "categoryCounts")}))
    return 2 if report["status"] == "INCOMPLETE" else 1 if report["findings"] else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception:
        print('{"status":"INCOMPLETE","detail":"Local preflight failed; no publish authorization."}')
        raise SystemExit(2)
