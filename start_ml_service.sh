#!/bin/bash
# Start the Python ML microservice

cd ml_service
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
