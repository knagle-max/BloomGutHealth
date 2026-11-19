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
    return app
