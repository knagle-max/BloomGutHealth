"""Test fixture only: synthetic stdio RPC to real ASGI app, never a listener."""
import json
import os
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))


def main():
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from ml_service.main import authenticate_service
    from ml_service.research.development_routes import install_development_routes
    from ml_service.research.development_admission import PREFIX

    env = {"BLOOM_RUNTIME_ENV": "development", "BLOOM_LOCAL_SCIENCE_ENABLED": "true",
           "ML_SERVICE_TOKEN": "synthetic-cross-language-ml-token-1234567890",
           "BLOOM_DEV_SCIENCE_TOKEN": "synthetic-cross-language-science-token-1234567890"}
    os.environ.update(env)
    app = FastAPI()
    app.middleware("http")(authenticate_service)
    install_development_routes(app, env)
    with TestClient(app) as client:
        while line := sys.stdin.buffer.readline(16384):
            request = json.loads(line)
            if (set(request) != {"method", "path", "headers", "body"}
                    or request["method"] not in {"POST", "GET", "DELETE"}
                    or not request["path"].startswith(PREFIX + "/")):
                raise ValueError("Unsupported synthetic test RPC")
            response = client.request(request["method"], request["path"],
                                      headers=request["headers"], content=request["body"])
            print(json.dumps({"status": response.status_code, "body": response.text}), flush=True)


if __name__ == "__main__":
    main()
