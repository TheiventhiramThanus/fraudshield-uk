"""Shared Firebase Admin initialisation for local development and Cloud Run."""

from __future__ import annotations

import os

try:
    import firebase_admin
    from firebase_admin import credentials
except ImportError:
    firebase_admin = None
    credentials = None


def firebase_app():
    if firebase_admin is None:
        raise RuntimeError("firebase-admin is not installed. Install backend requirements first.")
    if firebase_admin._apps:
        return firebase_admin.get_app()

    options = {}
    bucket = os.getenv("MODEL_STORAGE_BUCKET")
    if bucket:
        options["storageBucket"] = bucket
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if service_account_path:
        return firebase_admin.initialize_app(credentials.Certificate(service_account_path), options)
    # Cloud Run uses its attached service account through Application Default Credentials.
    return firebase_admin.initialize_app(options=options)
