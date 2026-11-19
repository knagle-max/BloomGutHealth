"""Opt-in routes for the existing research app; never mounted by main.py.

Only fixed nonpersonal computations. No health account inputs are supported.
No listener starts here. Private network and memory qualification remain separate.
"""
import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, HTTPException, Request
from .development_admission import AdmissionDenied, DevelopmentAdmission, PREFIX, valid_token
from .development_jobs import DevelopmentJobSupervisor
from .development_policy import DevelopmentScienceUnavailable, require_development_science
from .micom_reference import validate_reference_command
from .json_contract import strict_json as _strict_json
from .ollama_development import GatewayUnavailable, OllamaDevelopmentGateway


def install_development_routes(app, environment=None, supervisor=None, *, inference_gateway=None):
    env = os.environ if environment is None else environment
    require_development_science(env)
    if (not valid_token(env.get("ML_SERVICE_TOKEN"))
            or not valid_token(env.get("BLOOM_DEV_SCIENCE_TOKEN"))
            or env.get("BLOOM_DEV_SCIENCE_TOKEN") == env.get("ML_SERVICE_TOKEN")):
        raise DevelopmentScienceUnavailable("Independent development authentication is required.")
    if getattr(app.state, "development_science_installed", False):
        raise DevelopmentScienceUnavailable("Development science is already installed.")
    jobs = supervisor if supervisor is not None else DevelopmentJobSupervisor()
    admission = DevelopmentAdmission()
    inference = inference_gateway if inference_gateway is not None else OllamaDevelopmentGateway(env)
    router = APIRouter(prefix=PREFIX)

    def authorize(request):
        try:
            require_development_science(env)
        except DevelopmentScienceUnavailable:
            raise HTTPException(503, "Development scientific computation is disabled.") from None
        token = env.get("BLOOM_DEV_SCIENCE_TOKEN", "")
        if not valid_token(token) or token == env.get("ML_SERVICE_TOKEN"):
            raise HTTPException(503, "Development authentication is unavailable.")
        if request.url.query:
            raise HTTPException(400, "Query parameters are not supported.")
        try:
            return admission.authenticate(request.headers.get("x-bloom-science-authorization", ""), token)
        except AdmissionDenied:
            raise HTTPException(401, "Development authorization required or request limit reached.") from None

    async def read_body(request, *, limit=1024, json_required=True):
        if json_required and request.headers.get("content-type", "").split(";")[0].strip() != "application/json":
            raise HTTPException(415, "Use the fixed JSON contract.")
        body = bytearray()
        async for chunk in request.stream():
            if len(body) + len(chunk) > limit:
                raise HTTPException(413, "Development request exceeds its size limit.")
            body.extend(chunk)
        return bytes(body)

    def consume(request, identity, body):
        try:
            admission.consume(request.headers.get("x-bloom-science-nonce", ""), identity,
                              request.method, request.url.path, body)
        except AdmissionDenied:
            raise HTTPException(409, "Fresh request authorization required.") from None

    @router.post("/challenge")
    async def challenge(request: Request):
        identity = authorize(request)
        body = await read_body(request)
        try:
            command = _strict_json(body)
            if type(command) is not dict or set(command) != {"method", "path", "bodySha256"}:
                raise ValueError()
            nonce = admission.challenge(identity, command["method"], command["path"], command["bodySha256"])
        except (ValueError, TypeError, RecursionError, AdmissionDenied):
            raise HTTPException(422, "Unsupported development challenge.") from None
        return {"nonce": nonce, "expiresInSeconds": 60}

    @router.post("/jobs", status_code=202)
    async def submit(request: Request):
        identity = authorize(request)
        body = await read_body(request)
        consume(request, identity, body)
        try:
            command = _strict_json(body)
            validate_reference_command(command)
        except (ValueError, TypeError, RecursionError):
            raise HTTPException(422, "Only fixed nonpersonal reference controls are supported.") from None
        try:
            job_id = jobs.submit(command, env)
        except RuntimeError:
            raise HTTPException(503, "Development calculation unavailable or busy.") from None
        return {"id": job_id, "state": "running"}

    @router.get("/jobs/{job_id}")
    async def status(job_id: str, request: Request):
        identity = authorize(request)
        body = await read_body(request, limit=0, json_required=False)
        consume(request, identity, body)
        try:
            return jobs.status(job_id, env)
        except KeyError:
            raise HTTPException(404, "Development job unavailable.") from None

    @router.post("/inference/smoke")
    async def inference_smoke(request: Request):
        identity = authorize(request)
        body = await read_body(request)
        consume(request, identity, body)
        try:
            command = _strict_json(body)
        except (ValueError, TypeError, RecursionError):
            raise HTTPException(422, "Only the synthetic inference contract is supported.") from None
        try:
            return await inference.smoke(command)
        except GatewayUnavailable as error:
            raise HTTPException(422 if error.code == "unsupported-request" else 503,
                                {"code": error.code, "message": "Development inference unavailable."}) from None

    @router.delete("/jobs/{job_id}", status_code=202)
    async def cancel(job_id: str, request: Request):
        identity = authorize(request)
        body = await read_body(request, limit=0, json_required=False)
        consume(request, identity, body)
        try:
            jobs.cancel(job_id, env)
        except KeyError:
            raise HTTPException(404, "Development job unavailable.") from None
        return {"id": job_id, "cancellationRequested": True}

    previous_lifespan = app.router.lifespan_context

    @asynccontextmanager
    async def development_lifespan(application):
        try:
            async with previous_lifespan(application) as state:
                yield state
        finally:
            jobs.close()

    app.include_router(router)
    app.router.lifespan_context = development_lifespan
    app.state.development_science_installed = True
