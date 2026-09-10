"""Persistent model storage for Cloud Run; local development remains file-based."""

from __future__ import annotations

import os
from pathlib import Path

from app.firebase_runtime import firebase_app
from app.ml import MESSAGE_MODEL_PATH, URL_MODEL_PATH


MODEL_BLOB_PREFIX = "fraudshield-models"


def storage_enabled() -> bool:
    return bool(os.getenv("MODEL_STORAGE_BUCKET"))


def _blob_for(path: Path):
    from firebase_admin import storage

    firebase_app()
    return storage.bucket(os.getenv("MODEL_STORAGE_BUCKET")).blob(f"{MODEL_BLOB_PREFIX}/{path.name}")


def restore_live_models() -> list[str]:
    if not storage_enabled():
        return []
    restored = []
    for path in (MESSAGE_MODEL_PATH, URL_MODEL_PATH):
        blob = _blob_for(path)
        if blob.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            blob.download_to_filename(path)
            restored.append(path.name)
    return restored


def persist_live_model(path: Path) -> None:
    if storage_enabled():
        _blob_for(path).upload_from_filename(path, content_type="application/octet-stream")
