"""Vercel entrypoint for the on-demand FraudShield FastAPI API.

The production Vercel app serves the React UI and this API from one origin.
Persistent training workers are intentionally disabled here because a Vercel
Function is request-scoped. The full automatic-training service remains
available for Cloud Run deployments.
"""

from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIRECTORY = REPOSITORY_ROOT / "backend"
if str(BACKEND_DIRECTORY) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIRECTORY))

# Vercel Functions have no durable local disk. The analysis audit database is
# therefore request-instance-local; user history continues to live in
# Firestore, and automatic model training is handled by Cloud Run when enabled.
temporary_database = Path(tempfile.gettempdir()) / "fraudshield.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{temporary_database.as_posix()}")
os.environ.setdefault("AUTO_TRAINING_ENABLED", "false")
os.environ.setdefault("FRAUDSHIELD_SERVERLESS", "true")

from app.main import app  # noqa: E402
