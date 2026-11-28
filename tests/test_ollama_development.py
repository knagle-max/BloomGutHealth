"""Synthetic Ollama responses through an in-memory transport; never a socket."""
import asyncio
import hashlib
import json
import unittest
from unittest.mock import patch

import httpx
from ml_service.research.ollama_development import (
    GatewayUnavailable, OllamaDevelopmentGateway, VERSION, URL, PROMPT, MAX_RESPONSE_BYTES,
)

MODEL = "synthetic-model:fixture"
ENV = {"BLOOM_RUNTIME_ENV": "development", "BLOOM_LOCAL_SCIENCE_ENABLED": "true",
       "BLOOM_DEV_OLLAMA_ENABLED": "true", "BLOOM_DEV_OLLAMA_MODEL": MODEL, "OLLAMA_NO_CLOUD": "1"}
COMMAND = {"version": VERSION, "model": MODEL}


class Bytes(httpx.AsyncByteStream):
    def __init__(self, data):
        self.data = data

    async def __aiter__(self):
        yield self.data


def reply(payload=None, *, raw=None, status=200, headers=None):
    if raw is None:
        raw = json.dumps(payload if payload is not None else
                         {"model": MODEL, "done": True, "response": "BLOOM_DEV_SMOKE_OK", "eval_count": 8}).encode()
    return httpx.Response(status, headers={"content-type": "application/json", **(headers or {})}, stream=Bytes(raw))


class OllamaGatewayTests(unittest.IsolatedAsyncioTestCase):
    async def test_disabled_and_production_fail_before_transport(self):
        def forbidden(request):
            self.fail("No network admission")
        for env in ({}, {**ENV, "NODE_ENV": "production"}, {**ENV, "BLOOM_DEV_OLLAMA_ENABLED": "false"},
                    {**ENV, "OLLAMA_NO_CLOUD": "0"}, {**ENV, "BLOOM_DEV_OLLAMA_MODEL": "synthetic:cloud"},
                    {**ENV, "BLOOM_DEV_OLLAMA_MODEL": "https://untrusted.invalid/model"}):
            gateway = OllamaDevelopmentGateway(env, transport=httpx.MockTransport(forbidden))
            with self.assertRaises(GatewayUnavailable):
                await gateway.smoke(COMMAND)

    async def test_only_fixed_synthetic_contract_accepted(self):
        def forbidden(request):
            self.fail("Unsafe request reached transport")
        gateway = OllamaDevelopmentGateway(dict(ENV), transport=httpx.MockTransport(forbidden))
        for command in ({}, {**COMMAND, "prompt": "untrusted text"}, {**COMMAND, "user_id": "synthetic"},
                        {**COMMAND, "tools": ["python"]}, {**COMMAND, "model": "different:model"},
                        {**COMMAND, "options": {"num_predict": 100000}}, {**COMMAND, "version": "old"}):
            with self.assertRaises(GatewayUnavailable) as error:
                await gateway.smoke(command)
            self.assertEqual(error.exception.code, "unsupported-request")

    async def test_exact_loopback_request_limits_and_no_upstream_credentials(self):
        captured = []
        def handler(request):
            captured.append(request)
            return reply()
        gateway = OllamaDevelopmentGateway({**ENV, "OLLAMA_HOST": "https://untrusted.invalid"},
                                            transport=httpx.MockTransport(handler))
        result = await gateway.smoke(COMMAND)
        self.assertEqual(str(captured[0].url), URL)
        body = json.loads(captured[0].content)
        self.assertEqual(body, {"model": MODEL, "prompt": PROMPT, "stream": False, "think": False, "keep_alive": 0,
                                "options": {"num_predict": 16, "num_ctx": 1024, "temperature": 0}})
        self.assertNotIn("authorization", captured[0].headers)
        self.assertNotIn("cookie", captured[0].headers)
        self.assertTrue(result["matchedExpectedResponse"])
        self.assertFalse(result["rawModelOutputReleased"])
        self.assertNotIn("response", result)
        self.assertFalse(result["scientificallyValidated"])

    async def test_missing_model_redirect_and_provider_errors_have_no_raw_echo_or_fallback(self):
        for status in (302, 404, 500):
            calls = []
            def handler(request):
                calls.append(request)
                return reply(raw=b"synthetic provider error must not echo", status=status,
                             headers={"location": "https://untrusted.invalid"})
            gateway = OllamaDevelopmentGateway(dict(ENV), transport=httpx.MockTransport(handler))
            with self.assertRaises(GatewayUnavailable) as error:
                await gateway.smoke(COMMAND)
            self.assertEqual(len(calls), 1)
            self.assertNotIn("provider error", str(error.exception))
            self.assertEqual(error.exception.code, "model-unavailable" if status == 404 else "unavailable")

    async def test_oversize_encoded_and_invalid_outputs_fail_closed(self):
        cases = [(reply(raw=b"x" * (MAX_RESPONSE_BYTES + 1)), "oversized-response"),
                 (reply(headers={"content-encoding": "gzip"}), "invalid-response"),
                 (reply(raw=b'{"model":"wrong","done":true,"response":"synthetic"}'), "invalid-response"),
                 (reply({"model": MODEL, "done": False, "response": "partial"}), "invalid-response"),
                 (reply({"model": MODEL, "done": True, "response": "x" * 2049}), "invalid-response"),
                 (reply({"model": MODEL, "done": True, "response": "ok", "eval_count": 17}), "invalid-response"),
                 (reply({"model": MODEL, "done": True, "response": "ok", "eval_count": True}), "invalid-response"),
                 (reply(raw=b'{"model":"a","model":"b"}'), "invalid-response"),
                 (reply(raw=b'{"eval_count":NaN}'), "invalid-response")]
        for response, expected in cases:
            gateway = OllamaDevelopmentGateway(dict(ENV), transport=httpx.MockTransport(lambda request: response))
            with self.assertRaises(GatewayUnavailable) as error:
                await gateway.smoke(COMMAND)
            self.assertEqual(error.exception.code, expected)

    async def test_hard_timeout_outage_and_recovery_release_slot(self):
        mode = ["hang"]
        async def handler(request):
            if mode[0] == "hang":
                await asyncio.Event().wait()
            if mode[0] == "outage":
                raise httpx.ConnectError("synthetic outage text must not echo")
            return reply()
        gateway = OllamaDevelopmentGateway(dict(ENV), transport=httpx.MockTransport(handler))
        original_timeout = asyncio.timeout
        with patch("ml_service.research.ollama_development.asyncio.timeout",
                   side_effect=lambda seconds: original_timeout(0.03)):
            with self.assertRaises(GatewayUnavailable) as error:
                await gateway.smoke(COMMAND)
            self.assertEqual(error.exception.code, "timeout")
        mode[0] = "outage"
        with self.assertRaises(GatewayUnavailable) as error:
            await gateway.smoke(COMMAND)
        self.assertEqual(error.exception.code, "unavailable")
        mode[0] = "recovered"
        self.assertTrue((await gateway.smoke(COMMAND))["matchedExpectedResponse"])

    async def test_concurrency_and_rate_are_bounded(self):
        started, release = asyncio.Event(), asyncio.Event()
        async def handler(request):
            started.set()
            await release.wait()
            return reply()
        gateway = OllamaDevelopmentGateway(dict(ENV), transport=httpx.MockTransport(handler))
        first = asyncio.create_task(gateway.smoke(COMMAND))
        await started.wait()
        with self.assertRaises(GatewayUnavailable) as error:
            await gateway.smoke(COMMAND)
        self.assertEqual(error.exception.code, "busy")
        release.set()
        await first
        for _ in range(9):
            await gateway.smoke(COMMAND)
        with self.assertRaises(GatewayUnavailable) as error:
            await gateway.smoke(COMMAND)
        self.assertEqual(error.exception.code, "rate-limit")

    async def test_disable_or_model_change_during_request_withholds_result(self):
        for changed in ({"BLOOM_DEV_OLLAMA_ENABLED": "false"}, {"BLOOM_DEV_OLLAMA_MODEL": "different:model"}):
            env = dict(ENV)
            def handler(request):
                env.update(changed)
                return reply()
            gateway = OllamaDevelopmentGateway(env, transport=httpx.MockTransport(handler))
            with self.assertRaises(GatewayUnavailable):
                await gateway.smoke(COMMAND)

    async def test_unexpected_model_text_is_not_a_successful_reasoning_claim(self):
        gateway = OllamaDevelopmentGateway(dict(ENV), transport=httpx.MockTransport(
            lambda request: reply({"model": MODEL, "done": True, "response": "untrusted generated text"})))
        result = await gateway.smoke(COMMAND)
        self.assertFalse(result["matchedExpectedResponse"])
        self.assertIsNone(result["outputTokenCount"])
        self.assertNotIn("untrusted", json.dumps(result))


class OllamaApiAdmissionTests(unittest.TestCase):
    def test_existing_dual_auth_and_single_use_challenge_protect_smoke_route(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from ml_service.main import authenticate_service
        from ml_service.research.development_admission import PREFIX
        from ml_service.research.development_routes import install_development_routes
        from tests.test_development_science_api import ENV as API_ENV, HEADERS, ML_TOKEN, FixedJobs
        env = {**API_ENV, **ENV}
        calls = []
        def handler(request):
            calls.append(request)
            return reply()
        gateway = OllamaDevelopmentGateway(env, transport=httpx.MockTransport(handler))
        app = FastAPI()
        app.middleware("http")(authenticate_service)
        install_development_routes(app, env, FixedJobs(), inference_gateway=gateway)
        path = PREFIX + "/inference/smoke"
        body = json.dumps(COMMAND).encode()
        with patch.dict("os.environ", {"ML_SERVICE_TOKEN": ML_TOKEN}), TestClient(app) as client:
            self.assertEqual(client.post(path, content=body).status_code, 401)
            challenge = client.post(PREFIX + "/challenge", headers=HEADERS,
                                    json={"method": "POST", "path": path,
                                          "bodySha256": hashlib.sha256(body).hexdigest()})
            self.assertEqual(challenge.status_code, 200)
            headers = {**HEADERS, "Content-Type": "application/json",
                       "X-Bloom-Science-Nonce": challenge.json()["nonce"]}
            response = client.post(path, content=body, headers=headers)
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json()["matchedExpectedResponse"])
            self.assertEqual(client.post(path, content=body, headers=headers).status_code, 409)
            self.assertEqual(len(calls), 1)
