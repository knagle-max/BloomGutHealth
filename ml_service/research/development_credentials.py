"""Operator-only expiring credentials in owner-private storage, never Git/logs."""
import hashlib
import json
import os
from pathlib import Path
import secrets
import stat
import time
import uuid

from .development_admission import valid_token
from .json_contract import strict_json


class CredentialsUnavailable(Exception):
    pass


def _path(raw):
    path = Path(raw).expanduser()
    if not path.is_absolute() or ".." in path.parts:
        raise CredentialsUnavailable()
    for parent in (path.parent, *path.parent.parents):
        if parent.is_symlink():
            raise CredentialsUnavailable()
        marker = parent / ".git"
        if (marker.is_symlink() or marker.is_file()
                or any((marker / part).exists() for part in ("HEAD", "objects", "commondir"))
                or ((parent / "HEAD").exists() and (parent / "objects").exists())):
            raise CredentialsUnavailable()
    info = path.parent.stat()
    if info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700:
        raise CredentialsUnavailable()
    return path


def read_credentials(raw, *, now=None, allow_expired=False):
    descriptor = None
    try:
        path = _path(raw)
        descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
        info = os.fstat(descriptor)
        if (not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid()
                or stat.S_IMODE(info.st_mode) != 0o600 or info.st_nlink != 1 or info.st_size > 4096):
            raise CredentialsUnavailable()
        body = os.read(descriptor, 4097)
        if len(body) > 4096:
            raise CredentialsUnavailable()
        data = strict_json(body)
        if (type(data) is not dict or set(data) != {"version", "mlToken", "scienceToken", "expiresAt"}
                or data["version"] != "bloom-development-credentials-v1"
                or not valid_token(data["mlToken"]) or not valid_token(data["scienceToken"])
                or not data["mlToken"].isascii() or not data["scienceToken"].isascii()
                or data["mlToken"] == data["scienceToken"] or type(data["expiresAt"]) is not int):
            raise CredentialsUnavailable()
        current = time.time() if now is None else now
        if not allow_expired and not current < data["expiresAt"] <= current + 7 * 86400:
            raise CredentialsUnavailable()
        return data
    except (OSError, ValueError, TypeError, KeyError, RecursionError):
        raise CredentialsUnavailable() from None
    finally:
        if descriptor is not None:
            os.close(descriptor)


def credential_epoch(data):
    # In-memory binding only: never print/persist credential values or this hash.
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).digest()


def write_credentials(raw, *, rotate=False, revoke=False, hours=24):
    if type(hours) is not int or not 1 <= hours <= 168:
        raise CredentialsUnavailable()
    path = _path(raw)
    old = read_credentials(path, allow_expired=True) if rotate or revoke else None
    payload = ({**old, "expiresAt": 0} if revoke else {
        "version": "bloom-development-credentials-v1", "mlToken": secrets.token_urlsafe(48),
        "scienceToken": secrets.token_urlsafe(48), "expiresAt": int(time.time()) + hours * 3600,
    })
    temporary = path.with_name("." + uuid.uuid4().hex)
    descriptor = None
    try:
        target = temporary if rotate or revoke else path
        descriptor = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(descriptor, "w") as stream:
            descriptor = None
            json.dump(payload, stream)
            stream.flush()
            os.fsync(stream.fileno())
        if rotate or revoke:
            os.replace(temporary, path)
    except OSError:
        raise CredentialsUnavailable() from None
    finally:
        if descriptor is not None:
            os.close(descriptor)
        if temporary.exists():
            temporary.unlink()


def install_credential_guard(app, raw):
    """Rotation/expiry fails closed until an explicit restart with the new pair."""
    from fastapi.responses import JSONResponse
    from .development_admission import PREFIX
    configured = read_credentials(raw)
    if (not secrets.compare_digest(configured["mlToken"], os.environ.get("ML_SERVICE_TOKEN", ""))
            or not secrets.compare_digest(configured["scienceToken"], os.environ.get("BLOOM_DEV_SCIENCE_TOKEN", ""))):
        raise CredentialsUnavailable()
    expected = credential_epoch(configured)
    invalidated = False

    def current():
        nonlocal invalidated
        if invalidated:
            return False
        try:
            invalidated = not secrets.compare_digest(credential_epoch(read_credentials(raw)), expected)
        except CredentialsUnavailable:
            invalidated = True
        return not invalidated

    @app.middleware("http")
    async def guard(request, call_next):
        if not request.url.path.startswith(PREFIX + "/"):
            return JSONResponse(status_code=404, content={"detail": "Development operation unavailable."})
        if not current():
            app.state.development_job_supervisor.close()
            return JSONResponse(status_code=503, content={"detail": "Development credentials unavailable."}, headers={"Cache-Control": "no-store"})
        response = await call_next(request)
        if not current():
            app.state.development_job_supervisor.close()
            return JSONResponse(status_code=503, content={"detail": "Development credentials unavailable."}, headers={"Cache-Control": "no-store"})
        return response
