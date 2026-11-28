"""Development service bearer authentication plus single-use request challenges.

Uses normal bearer authentication over the required private TLS transport, not a
new signature algorithm. A server-issued nonce binds the authenticated identity,
method, exact path and exact body digest. Restart loses all outstanding nonces,
so old requests fail closed rather than becoming replayable after restart.
"""
from collections import deque
import hashlib
import hmac
import re
import secrets
import threading
import time

PREFIX = "/api/ml/research/development/v1"
_JOB = re.compile(re.escape(PREFIX) + r"/jobs/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\Z")


def allowed_operation(method, path):
    return (method == "POST" and path in {PREFIX + "/jobs", PREFIX + "/inference/smoke"}
            or method in {"GET", "DELETE"} and bool(_JOB.fullmatch(path)))


def valid_token(token):
    return (type(token) is str and 32 <= len(token.encode()) <= 512
            and not any(c.isspace() for c in token))


class AdmissionDenied(Exception):
    pass


class DevelopmentAdmission:
    def __init__(self):
        self._lock = threading.Lock()
        self._nonces = {}
        self._requests = deque()

    def authenticate(self, authorization, expected):
        if not valid_token(expected):
            raise AdmissionDenied()
        supplied = authorization[7:] if authorization.startswith("Bearer ") else ""
        if (len(supplied) > 512 or not hmac.compare_digest(
                hashlib.sha256(supplied.encode()).digest(), hashlib.sha256(expected.encode()).digest())):
            raise AdmissionDenied()
        with self._lock:
            now = time.monotonic()
            while self._requests and now - self._requests[0] >= 60:
                self._requests.popleft()
            if len(self._requests) >= 60:
                raise AdmissionDenied()
            self._requests.append(now)
        return hashlib.sha256(expected.encode()).hexdigest()

    def challenge(self, identity, method, path, body_digest):
        if (type(method) is not str or type(path) is not str or not allowed_operation(method, path)
                or type(body_digest) is not str or not re.fullmatch(r"[0-9a-f]{64}", body_digest)):
            raise AdmissionDenied()
        with self._lock:
            now = time.monotonic()
            self._nonces = {key: item for key, item in self._nonces.items() if now - item[0] < 60}
            if len(self._nonces) >= 32:
                raise AdmissionDenied()
            nonce = secrets.token_hex(32)
            self._nonces[nonce] = (now, identity, method, path, body_digest)
            return nonce

    def consume(self, nonce, identity, method, path, body):
        if type(nonce) is not str or not re.fullmatch(r"[0-9a-f]{64}", nonce):
            raise AdmissionDenied()
        with self._lock:
            item = self._nonces.pop(nonce, None)
        if (item is None or time.monotonic() - item[0] >= 60
                or item[1:] != (identity, method, path, hashlib.sha256(body).hexdigest())):
            raise AdmissionDenied()
