"""Actual spawn/termination tests, fixed nonpersonal messages, no listeners."""
import importlib.util
import json
import time
import unittest
from unittest.mock import patch

from ml_service.research.development_jobs import DevelopmentJobSupervisor, OUTPUT_LIMIT
from ml_service.research.development_policy import DevelopmentScienceUnavailable
from ml_service.research.micom_reference import VERSION

DEV = {"BLOOM_RUNTIME_ENV": "development", "BLOOM_LOCAL_SCIENCE_ENABLED": "true"}
COMMAND = {"version": VERSION, "scenario": "baseline"}


# These replace only the internal worker in tests. Callers/requests cannot choose
# a function, code string, executable, model file, or command line.
def _hang(connection, command):
    while True:
        time.sleep(0.02)


def _success(connection, command):
    connection.send_bytes(json.dumps({"ok": True, "result": {"synthetic": True}}).encode())
    connection.close()


def _oversized(connection, command):
    try:
        connection.send_bytes(b"x" * (OUTPUT_LIMIT + 1))
    except (BrokenPipeError, ConnectionResetError):
        # Expected only in this oversized-output fixture: recv_bytes(maxlength)
        # rejects the header and the parent may close before sending finishes.
        pass
    finally:
        connection.close()


def _crash(connection, command):
    connection.close()


def wait_for_terminal(supervisor, job_id, timeout=6):
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        state = supervisor.status(job_id, DEV)
        if state["state"] not in {"running", "cancelling"}:
            return state
        time.sleep(0.02)
    raise AssertionError("Job did not terminate within test bound")


class DevelopmentJobTests(unittest.TestCase):
    def test_failed_termination_withholds_result_and_blocks_new_work(self):
        from ml_service.research.development_jobs import _stop
        for failure in ({"return_value": False}, {"side_effect": PermissionError("Synthetic termination denial")}):
            supervisor = DevelopmentJobSupervisor(timeout_seconds=0.05)
            job_id = None
            try:
                with patch("ml_service.research.development_jobs._run_child", _hang), \
                     patch("ml_service.research.development_jobs._stop", **failure):
                    job_id = supervisor.submit(COMMAND, DEV)
                    terminal = wait_for_terminal(supervisor, job_id)
                self.assertEqual(terminal["state"], "termination-failed")
                self.assertIsNone(terminal["result"])
                with self.assertRaisesRegex(RuntimeError, "busy"):
                    supervisor.submit(COMMAND, DEV)
                with self.assertRaisesRegex(RuntimeError, "termination incomplete"):
                    supervisor.close()
            finally:
                if job_id is not None:
                    _stop(supervisor._jobs[job_id]["process"])

    def test_delayed_resource_probe_cannot_admit_result_past_deadline(self):
        supervisor = DevelopmentJobSupervisor(timeout_seconds=0.05)
        def slow_probe(process):
            time.sleep(0.2)
            return 1
        with patch("ml_service.research.development_jobs._run_child", _success), \
             patch("ml_service.research.development_jobs._rss_bytes", slow_probe):
            job_id = supervisor.submit(COMMAND, DEV)
            terminal = wait_for_terminal(supervisor, job_id)
        self.assertEqual(terminal["state"], "timed-out")
        self.assertIsNone(terminal["result"])
        supervisor.close()

    def test_memory_budget_and_missing_telemetry_stop_worker_and_allow_recovery(self):
        for unavailable in (False, True):
            supervisor = DevelopmentJobSupervisor(memory_mib=128)
            sampler = {"side_effect": RuntimeError("Synthetic telemetry outage")} if unavailable else {"return_value": 129 * 1024 * 1024}
            with patch("ml_service.research.development_jobs._run_child", _hang), \
                 patch("ml_service.research.development_jobs._rss_bytes", **sampler):
                job_id = supervisor.submit(COMMAND, DEV)
                terminal = wait_for_terminal(supervisor, job_id)
            self.assertEqual(terminal["state"], "resource-unavailable" if unavailable else "memory-exceeded")
            self.assertIsNone(terminal["result"])
            self.assertFalse(supervisor._jobs[job_id]["process"].is_alive())
            with patch("ml_service.research.development_jobs._run_child", _success):
                recovered = supervisor.submit(COMMAND, DEV)
            self.assertEqual(wait_for_terminal(supervisor, recovered)["state"], "completed")
            supervisor.close()
        for invalid in (0, 127, 4097, True, "1024"):
            with self.assertRaises(ValueError):
                DevelopmentJobSupervisor(memory_mib=invalid)

    def test_oversized_fixture_closes_quietly_after_expected_parent_pipe_rejection(self):
        class RejectedPipe:
            closed = False
            def send_bytes(self, payload):
                if len(payload) != OUTPUT_LIMIT + 1:
                    raise AssertionError("Oversized fixture lost its negative control")
                raise BrokenPipeError("Synthetic parent size rejection")
            def close(self):
                self.closed = True
        connection = RejectedPipe()
        _oversized(connection, COMMAND)
        self.assertTrue(connection.closed)

    def test_disabled_or_unsafe_commands_never_start_worker(self):
        supervisor = DevelopmentJobSupervisor()
        with patch.object(supervisor._context, "Process", side_effect=AssertionError("must not spawn")):
            with self.assertRaises(DevelopmentScienceUnavailable):
                supervisor.submit(COMMAND, {})
            with self.assertRaises(ValueError):
                supervisor.submit({**COMMAND, "python": "untrusted"}, DEV)

    def test_actual_hard_timeout_and_recovery_without_polling(self):
        supervisor = DevelopmentJobSupervisor(timeout_seconds=0.15)
        with patch("ml_service.research.development_jobs._run_child", _hang):
            job_id = supervisor.submit(COMMAND, DEV)
        # Monitor, not a status call, must stop the worker.
        time.sleep(0.8)
        self.assertEqual(supervisor.status(job_id, DEV)["state"], "timed-out")
        self.assertFalse(supervisor._jobs[job_id]["process"].is_alive())
        with patch("ml_service.research.development_jobs._run_child", _success):
            # Give spawn enough time for an ordinary completion.
            supervisor._timeout = 3
            recovered = supervisor.submit(COMMAND, DEV)
        self.assertEqual(wait_for_terminal(supervisor, recovered)["state"], "completed")

    def test_cancellation_busy_admission_and_no_late_result(self):
        supervisor = DevelopmentJobSupervisor(timeout_seconds=3)
        with patch("ml_service.research.development_jobs._run_child", _hang):
            job_id = supervisor.submit(COMMAND, DEV)
        with self.assertRaisesRegex(RuntimeError, "busy"):
            supervisor.submit(COMMAND, DEV)
        supervisor.cancel(job_id, DEV)
        terminal = wait_for_terminal(supervisor, job_id)
        self.assertEqual(terminal["state"], "cancelled")
        self.assertIsNone(terminal["result"])
        self.assertFalse(supervisor._jobs[job_id]["process"].is_alive())

    def test_worker_crash_and_oversized_output_fail_without_raw_response(self):
        for worker in (_oversized, _crash):
            supervisor = DevelopmentJobSupervisor(timeout_seconds=3)
            with patch("ml_service.research.development_jobs._run_child", worker):
                job_id = supervisor.submit(COMMAND, DEV)
            terminal = wait_for_terminal(supervisor, job_id)
            self.assertEqual(terminal["state"], "failed")
            self.assertIsNone(terminal["result"])

    def test_results_are_copied_and_access_is_rechecked(self):
        supervisor = DevelopmentJobSupervisor(timeout_seconds=3)
        with patch("ml_service.research.development_jobs._run_child", _success):
            job_id = supervisor.submit(COMMAND, DEV)
        terminal = wait_for_terminal(supervisor, job_id)
        terminal["result"]["synthetic"] = False
        self.assertTrue(supervisor.status(job_id, DEV)["result"]["synthetic"])
        with self.assertRaises(DevelopmentScienceUnavailable):
            supervisor.status(job_id, {})
        with self.assertRaises(DevelopmentScienceUnavailable):
            supervisor.cancel(job_id, {})
        with self.assertRaises(KeyError):
            supervisor.status("unknown-job", DEV)

    def test_rate_and_capacity_limits_and_deadline_validation(self):
        supervisor = DevelopmentJobSupervisor()
        supervisor._admissions.extend([time.monotonic()] * 10)
        with self.assertRaisesRegex(RuntimeError, "rate limit"):
            supervisor.submit(COMMAND, DEV)
        supervisor._admissions.clear()
        supervisor._jobs.update({str(i): {"state": "completed", "created": time.monotonic()}
                                 for i in range(16)})
        with self.assertRaisesRegex(RuntimeError, "capacity"):
            supervisor.submit(COMMAND, DEV)
        for value in (0, -1, 61, float("nan"), "45", True):
            with self.assertRaises(ValueError):
                DevelopmentJobSupervisor(timeout_seconds=value)

    def test_close_cancels_even_after_development_access_revoked(self):
        supervisor = DevelopmentJobSupervisor(timeout_seconds=3)
        with patch("ml_service.research.development_jobs._run_child", _hang):
            job_id = supervisor.submit(COMMAND, DEV)
        supervisor.close()
        self.assertEqual(wait_for_terminal(supervisor, job_id)["state"], "cancelled")
        with self.assertRaisesRegex(RuntimeError, "closed"):
            supervisor.submit(COMMAND, DEV)

    @unittest.skipUnless(importlib.util.find_spec("micom"), "Optional science environment required")
    def test_real_reference_runs_in_isolated_spawned_worker(self):
        supervisor = DevelopmentJobSupervisor()
        job_id = supervisor.submit(COMMAND, DEV)
        terminal = wait_for_terminal(supervisor, job_id, timeout=45)
        self.assertEqual(terminal["state"], "completed")
        self.assertEqual(terminal["result"]["status"], "optimal")
        self.assertFalse(terminal["result"]["observedBiology"])
        self.assertGreater(terminal["resources"]["maxObservedRssBytes"], 0)
        self.assertLessEqual(terminal["resources"]["maxObservedRssBytes"], terminal["resources"]["memoryLimitBytes"])
