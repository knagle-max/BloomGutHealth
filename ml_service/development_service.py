"""Operator CLI: read-only check by default; no listener without explicit serve."""
import argparse
import importlib.metadata
import os
import sys

from .research.development_policy import require_development_science
from .research.development_credentials import read_credentials, write_credentials, CredentialsUnavailable


def main(arguments=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("check", "init", "rotate", "revoke", "serve"))
    parser.add_argument("--config", required=True)
    parser.add_argument("--approved-local-listener", action="store_true")
    args = parser.parse_args(arguments)
    stage = "development-identity"
    try:
        require_development_science()
        if args.operation == "serve" and not args.approved_local_listener:
            parser.error("serve requires separately approved --approved-local-listener")
        stage = "private-credentials"
        if args.operation in ("init", "rotate", "revoke"):
            write_credentials(args.config, rotate=args.operation == "rotate", revoke=args.operation == "revoke")
            print("Private development credentials updated; no service started; values withheld.")
            return 0
        credentials = read_credentials(args.config)
        stage = "memory-probe"
        from .research.development_jobs import _rss_bytes
        from types import SimpleNamespace
        _rss_bytes(SimpleNamespace(pid=os.getpid(), is_alive=lambda: True))
        stage = "optional-serving-dependency"
        if importlib.metadata.version("uvicorn") != "0.54.0":
            raise CredentialsUnavailable()
        if args.operation == "check":
            print("Local credential, RSS probe and serving-dependency checks passed; no listener started.")
            return 0
        # Dedicated process only. Never change an existing production process's
        # identity or credentials; require_development_science rejects it first.
        os.environ["ML_SERVICE_TOKEN"] = credentials["mlToken"]
        os.environ["BLOOM_DEV_SCIENCE_TOKEN"] = credentials["scienceToken"]
        os.environ["BLOOM_DEV_CREDENTIAL_FILE"] = args.config
        stage = "local-service-startup"
        from .development import create_app
        import uvicorn
        config = uvicorn.Config(create_app(), host="127.0.0.1", port=8765,
                                workers=1, loop="asyncio", http="h11", ws="none",
                                proxy_headers=False, access_log=False, log_config=None,
                                server_header=False, timeout_keep_alive=5,
                                limit_concurrency=8, backlog=8, timeout_graceful_shutdown=5)
        uvicorn.Server(config).run()
        return 0
    except (CredentialsUnavailable, OSError, RuntimeError, ValueError, importlib.metadata.PackageNotFoundError):
        print("Development operation unavailable at " + stage + "; no credential values or private paths released.", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
