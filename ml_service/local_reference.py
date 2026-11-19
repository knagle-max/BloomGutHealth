"""Offline operator workflow; fixed controls, no server, VPN or AI provider."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import time

from .research.development_credentials import _path
from .research.development_jobs import DevelopmentJobSupervisor
from .research.development_policy import require_development_science
from .research.micom_reference import VERSION


def run_local(output, environment=None):
    require_development_science(environment)
    path = _path(output)  # Existing owner-private parent; rejects Git/symlink ancestors.
    if path.exists() or path.is_symlink():
        raise ValueError("Output already exists")
    records = []
    supervisor = DevelopmentJobSupervisor()
    try:
        for scenario in ("baseline", "closed-medium"):
            job = supervisor.submit({"version": VERSION, "scenario": scenario}, environment)
            while True:
                record = supervisor.status(job, environment)
                if record["state"] not in ("running", "cancelling"):
                    break
                time.sleep(0.1)
            if record["state"] != "completed" or not isinstance(record["result"], dict):
                raise RuntimeError("Reference worker unavailable")
            records.append(record)
    finally:
        supervisor.close()
    expected = (records[0]["result"].get("status") == "optimal"
                and records[1]["result"].get("status") == "infeasible")
    body = json.dumps({"version": "bloom-local-reference-pair-v1",
                       "createdAt": datetime.now(timezone.utc).isoformat(),
                       "classification": "nonpersonal-engineering-control",
                       "biologicalValidation": False, "predictiveValidation": False,
                       "clinicalValidation": False, "expectedControlStatuses": expected,
                       "records": records}, allow_nan=False).encode() + b"\n"
    if len(body) > 131072:
        raise ValueError("Bounded output exceeded")
    path = _path(path)  # Recheck private storage immediately before exclusive creation.
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, "wb") as handle:
        handle.write(body)
        handle.flush()
        os.fsync(handle.fileno())
    return expected


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path,
                        help="New JSON file in an existing private0700 directory outside Git")
    args = parser.parse_args()
    try:
        passed = run_local(args.output)
        print("Reference pair recorded privately; expected controls " + ("PASS" if passed else "FAIL"))
        return 0 if passed else 1
    except Exception:
        print("Local reference unavailable; check development flags, private output and pinned environment.")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
