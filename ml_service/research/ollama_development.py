"""Fixed synthetic-only local Ollama smoke gateway. No personal input or tools.

Never imported by production entry points. Request destinations, prompts, model
options and output bounds cannot be selected by a caller or language model.
"""
import asyncio
from collections import deque
import os
import re
import threading
import time

import httpx
from .development_policy import DevelopmentScienceUnavailable, require_development_science
from .json_contract import strict_json

VERSION = "ollama-development-smoke-v1"
URL = "http://127.0.0.1:11434/api/generate"
PROMPT = "Reply with exactly BLOOM_DEV_SMOKE_OK. Do not add any other text."
MAX_RESPONSE_BYTES = 65536


class GatewayUnavailable(Exception):
    def __init__(self, code):
        self.code = code
        super().__init__("Development inference unavailable.")


class OllamaDevelopmentGateway:
    def __init__(self, environment=None, *, transport=None):
        self._env = os.environ if environment is None else environment
        self._transport = transport  # Trusted in-process test transport only.
        self._slot = threading.BoundedSemaphore(1)
        self._lock = threading.Lock()
        self._requests = deque()

    def _model(self):
        try:
            require_development_science(self._env)
        except DevelopmentScienceUnavailable:
            raise GatewayUnavailable("disabled") from None
        model = self._env.get("BLOOM_DEV_OLLAMA_MODEL", "")
        if (self._env.get("BLOOM_DEV_OLLAMA_ENABLED") != "true"
                or self._env.get("OLLAMA_NO_CLOUD") != "1"
                or "cloud" in model.lower()
                or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,95}:[A-Za-z0-9._-]{1,32}", model)):
            raise GatewayUnavailable("disabled")
        return model

    async def smoke(self, command):
        model = self._model()
        if (type(command) is not dict or set(command) != {"version", "model"}
                or command["version"] != VERSION or command["model"] != model):
            raise GatewayUnavailable("unsupported-request")
        if not self._slot.acquire(blocking=False):
            raise GatewayUnavailable("busy")
        try:
            with self._lock:
                now = time.monotonic()
                while self._requests and now - self._requests[0] >= 60:
                    self._requests.popleft()
                if len(self._requests) >= 10:
                    raise GatewayUnavailable("rate-limit")
                self._requests.append(now)
            # No inherited proxies, cookies, auth headers, redirect or public
            # fallback. A missing model is never automatically downloaded.
            async with asyncio.timeout(15):
                async with httpx.AsyncClient(transport=self._transport, trust_env=False,
                                             follow_redirects=False, timeout=10) as client:
                    async with client.stream("POST", URL, headers={"Accept-Encoding": "identity"},
                                             json={"model": model, "prompt": PROMPT, "stream": False, "think": False,
                                                   "keep_alive": 0, "options": {"num_predict": 16,
                                                                              "num_ctx": 1024,
                                                                              "temperature": 0}}) as response:
                        if response.status_code != 200:
                            raise GatewayUnavailable("model-unavailable" if response.status_code == 404 else "unavailable")
                        if (response.headers.get("content-type", "").split(";")[0].strip().lower() != "application/json"
                                or response.headers.get("content-encoding", "identity").lower() != "identity"):
                            raise GatewayUnavailable("invalid-response")
                        raw = bytearray()
                        async for chunk in response.aiter_raw():
                            if len(raw) + len(chunk) > MAX_RESPONSE_BYTES:
                                raise GatewayUnavailable("oversized-response")
                            raw.extend(chunk)
            data = strict_json(bytes(raw))
            if (type(data) is not dict or data.get("done") is not True
                    or data.get("model") != model or type(data.get("response")) is not str
                    or len(data["response"].encode("utf-8")) > 2048):
                raise GatewayUnavailable("invalid-response")
            count = data.get("eval_count")
            if count is not None and (type(count) is not int or not 0 <= count <= 16):
                raise GatewayUnavailable("invalid-response")
            # Recheck disable/model changes during the await before delivery.
            if self._model() != model:
                raise GatewayUnavailable("disabled")
            return {"version": VERSION, "scope": "synthetic-development-smoke", "model": model,
                    "transportStatus": "completed", "matchedExpectedResponse": data["response"].strip() == "BLOOM_DEV_SMOKE_OK",
                    "outputTokenCount": count, "rawModelOutputReleased": False,
                    "observedBiology": False, "scientificallyValidated": False}
        except GatewayUnavailable:
            raise
        except (TimeoutError, httpx.TimeoutException):
            raise GatewayUnavailable("timeout") from None
        except httpx.HTTPError:
            raise GatewayUnavailable("unavailable") from None
        except (ValueError, TypeError, RecursionError):
            raise GatewayUnavailable("invalid-response") from None
        finally:
            self._slot.release()
