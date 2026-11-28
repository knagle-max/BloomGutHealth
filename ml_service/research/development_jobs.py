"""In-process development job supervisor; no HTTP listener or production imports.

Only fixed nonpersonal reference commands are accepted. Process boundaries provide
hard wall-time/cancellation, not an OS sandbox or permission for private inputs.
Records are bounded, ephemeral and never written to the repository.
"""
from collections import deque
from copy import deepcopy
import json
import multiprocessing
import os
import subprocess
import threading
import time
import uuid

from .development_policy import require_development_science
from .micom_reference import run_reference, validate_reference_command

OUTPUT_LIMIT = 65536
ACTIVE = {"running", "cancelling", "termination-failed"}


def _rss_bytes(process):
    """Sample only this owned child; fixed argv, no shell or request commands.

    macOS ps reports RSS in KiB. This is a sampled watchdog, not a kernel memory
    sandbox; unknown telemetry while a child is alive must fail closed.
    """
    if not process.is_alive():
        return None
    if type(process.pid) is not int or process.pid <= 1:
        raise RuntimeError("Worker memory telemetry unavailable.")
    sample = subprocess.run(["/bin/ps", "-o", "rss=", "-p", str(process.pid)],
                            capture_output=True, timeout=0.5, check=False,
                            env={"PATH": "/usr/bin:/bin", "LC_ALL": "C"})
    value = sample.stdout.strip()
    if sample.returncode or not value.isdigit() or len(value) > 20:
        if not process.is_alive():
            return None
        raise RuntimeError("Worker memory telemetry unavailable.")
    return int(value) * 1024


def _run_child(connection, command):
    try:
        # Prevent native-library fan-out. These affect only the new child.
        for name in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS"):
            os.environ[name] = "1"
        import resource
        resource.setrlimit(resource.RLIMIT_CPU, (30, 30))
        resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024))
        # Solver/library output must not become service or CI logs.
        with open(os.devnull, "w") as sink:
            os.dup2(sink.fileno(), 1)
            os.dup2(sink.fileno(), 2)
        result = run_reference(command, {"BLOOM_RUNTIME_ENV": "development",
                                         "BLOOM_LOCAL_SCIENCE_ENABLED": "true"})
        encoded = json.dumps({"ok": True, "result": result}, allow_nan=False).encode()
        if len(encoded) > OUTPUT_LIMIT:
            raise ValueError("Output limit")
        connection.send_bytes(encoded)
    except Exception:
        # Never include raw input, paths, environment, solver output or exception text.
        connection.send_bytes(b'{"ok":false}')
    finally:
        connection.close()


def _stop(process):
    if process.is_alive():
        process.terminate()
    process.join(0.5)
    if process.is_alive():
        process.kill()
        process.join(0.5)
    return not process.is_alive()


class DevelopmentJobSupervisor:
    """Local-only primitive. Auth/account scope belongs to a future API boundary.

    No persistent recovery: jobs/results are lost on parent restart. The RSS
    watchdog can overshoot between samples; it is not a kernel memory sandbox.
    """
    def __init__(self, *, timeout_seconds=45.0, memory_mib=1024):
        if type(timeout_seconds) not in (int, float) or not 0.05 <= timeout_seconds <= 60:
            raise ValueError("Invalid job deadline.")
        self._timeout = timeout_seconds
        if type(memory_mib) is not int or not 128 <= memory_mib <= 4096:
            raise ValueError("Invalid worker memory budget.")
        self._memory_limit = memory_mib * 1024 * 1024
        self._context = multiprocessing.get_context("spawn")
        self._lock = threading.RLock()
        self._jobs = {}
        self._admissions = deque()
        self._closed = False

    def submit(self, command, environment=None):
        require_development_science(environment)
        validate_reference_command(command)
        command = dict(command)
        with self._lock:
            if self._closed:
                raise RuntimeError("Development supervisor is closed.")
            now = time.monotonic()
            for key, job in list(self._jobs.items()):
                if job["state"] not in ACTIVE and now - job["created"] >= 900:
                    del self._jobs[key]
            while self._admissions and now - self._admissions[0] >= 60:
                self._admissions.popleft()
            if len(self._admissions) >= 10:
                raise RuntimeError("Development calculation rate limit.")
            if any(j["state"] in ACTIVE for j in self._jobs.values()):
                raise RuntimeError("Development calculation is busy.")
            if len(self._jobs) >= 16:
                raise RuntimeError("Development result capacity reached.")
            receiver, sender = self._context.Pipe(duplex=False)
            process = self._context.Process(target=_run_child, args=(sender, command), daemon=True)
            job_id = str(uuid.uuid4())
            job = {"state": "running", "created": now, "process": process,
                   "result": None, "command": command, "peak_rss": None}
            try:
                process.start()
            except Exception:
                receiver.close()
                sender.close()
                raise RuntimeError("Development worker could not start.") from None
            sender.close()
            self._jobs[job_id] = job
            self._admissions.append(now)
            monitor = threading.Thread(target=self._monitor, args=(job_id, receiver), daemon=True)
            job["monitor"] = monitor
            monitor.start()
            return job_id

    def _monitor(self, job_id, receiver):
        job = self._jobs[job_id]
        state, result = "failed", None
        next_sample = 0.0
        try:
            while time.monotonic() - job["created"] < self._timeout:
                with self._lock:
                    if job["state"] == "cancelling":
                        state = "cancelled"
                        break
                if time.monotonic() >= next_sample:
                    try:
                        rss = _rss_bytes(job["process"])
                    except (OSError, RuntimeError, subprocess.TimeoutExpired):
                        state = "resource-unavailable"
                        break
                    next_sample = time.monotonic() + 0.1
                    if rss is not None:
                        job["peak_rss"] = max(job["peak_rss"] or 0, rss)
                        if rss > self._memory_limit:
                            state = "memory-exceeded"
                            break
                if receiver.poll(0.02):
                    message = json.loads(receiver.recv_bytes(OUTPUT_LIMIT))
                    if time.monotonic() - job["created"] >= self._timeout:
                        state = "timed-out"
                        break
                    if (type(message) is dict and message.get("ok") is True
                            and type(message.get("result")) is dict):
                        state, result = "completed", message["result"]
                    break
                if not job["process"].is_alive():
                    break
            else:
                state = "timed-out"
        except (EOFError, OSError, ValueError, TypeError):
            state, result = "failed", None
        finally:
            receiver.close()
            try:
                stopped = _stop(job["process"])
            except (OSError, RuntimeError):
                stopped = False
            with self._lock:
                if not stopped:
                    state, result = "termination-failed", None
                elif job["state"] == "cancelling":
                    state, result = "cancelled", None
                job["state"], job["result"] = state, result

    def status(self, job_id, environment=None):
        require_development_science(environment)
        with self._lock:
            job = self._jobs[job_id]
            return {"id": job_id, "state": job["state"], "result": deepcopy(job["result"]),
                    "resources": {"maxObservedRssBytes": job["peak_rss"], "memoryLimitBytes": self._memory_limit}}

    def cancel(self, job_id, environment=None):
        require_development_science(environment)
        with self._lock:
            job = self._jobs[job_id]
            if job["state"] == "running":
                job["state"] = "cancelling"

    def close(self):
        # Cleanup is always allowed, including after development access is revoked.
        with self._lock:
            self._closed = True
            for job in self._jobs.values():
                if job["state"] == "running":
                    job["state"] = "cancelling"
            monitors = [job["monitor"] for job in self._jobs.values() if "monitor" in job]
        for monitor in monitors:
            monitor.join(3)
            if monitor.is_alive():
                raise RuntimeError("Development worker shutdown incomplete.")
        with self._lock:
            if any(job["state"] == "termination-failed" for job in self._jobs.values()):
                raise RuntimeError("Development worker termination incomplete.")
