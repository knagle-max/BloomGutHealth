"""Explicit development entry point reusing Bloom's existing FastAPI service.

Does not start a listener. Production continues using ml_service.main:app and
does not import this optional entry point or scientific dependencies.
"""
from .research.development_policy import require_development_science


def create_app():
    require_development_science()
    from .main import app
    from .research.development_routes import install_development_routes
    install_development_routes(app)
    import os
    if os.environ.get("BLOOM_DEV_CREDENTIAL_FILE"):
        from .research.development_credentials import install_credential_guard
        install_credential_guard(app, os.environ["BLOOM_DEV_CREDENTIAL_FILE"])
    else:
        from fastapi.responses import JSONResponse
        from .research.development_admission import PREFIX
        @app.middleware("http")
        async def development_paths_only(request, call_next):
            if not request.url.path.startswith(PREFIX + "/"):
                return JSONResponse(status_code=404, content={"detail": "Development operation unavailable."})
            return await call_next(request)
    return app
