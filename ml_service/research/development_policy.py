"""Admission for optional local experiments, never a production dependency.

This gate is not authentication or personal-data consent. Callers must retain
those existing boundaries. No runtime network or dependency imports occur here.
"""
from collections.abc import Mapping
import os


class DevelopmentScienceUnavailable(RuntimeError):
    pass


def require_development_science(environment: Mapping[str, str] | None = None) -> None:
    env = os.environ if environment is None else environment
    # Explicit positive environment identity: absence is not development.
    # Conflicting Node production identity must also fail closed.
    if (env.get("BLOOM_RUNTIME_ENV") != "development"
            or env.get("NODE_ENV") == "production"
            or os.environ.get("NODE_ENV") == "production"
            or os.environ.get("BLOOM_RUNTIME_ENV") == "production"
            or env.get("BLOOM_LOCAL_SCIENCE_ENABLED") != "true"):
        raise DevelopmentScienceUnavailable("Local scientific computation is disabled.")
