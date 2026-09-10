"""Automatic, quality-gated model training from Firestore candidates."""

from __future__ import annotations

import asyncio
import hashlib
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

import pandas as pd

from app.firebase_runtime import firebase_app
from app.ml import MESSAGE_MODEL_PATH, MODEL_DIRECTORY, URL_MODEL_PATH
from app.model_store import persist_live_model, storage_enabled
from scripts.train_models import VALID_LABELS, train_kind


BACKEND_ROOT = Path(__file__).resolve().parents[1]
AUTO_DATA_PATH = BACKEND_ROOT / "data" / "auto_approved_training_samples.csv"


def enabled(value: str | None) -> bool:
    return (value or "true").strip().lower() in {"1", "true", "yes", "on"}


def candidates_to_frame(candidates: list[dict[str, Any]]) -> pd.DataFrame:
    rows = []
    for candidate in candidates:
        label = candidate.get("reviewedLabel") or candidate.get("suggestedLabel")
        kind = candidate.get("kind")
        content = candidate.get("sanitizedInput")
        if kind not in {"message", "url"} or label not in VALID_LABELS or not isinstance(content, str) or not content.strip():
            continue
        rows.append({
            "kind": kind,
            "content": content.strip(),
            "label": label,
            "category": candidate.get("category") or "unknown",
            "source": "firestore_auto_approved",
            "review_status": "approved",
        })
    frame = pd.DataFrame(rows, columns=["kind", "content", "label", "category", "source", "review_status"])
    return frame.drop_duplicates(subset=["kind", "content", "label"]).reset_index(drop=True)


class AutoTrainingService:
    def __init__(self, on_models_updated: Callable[[], None]):
        self.on_models_updated = on_models_updated
        self.interval_seconds = max(60, int(os.getenv("AUTO_TRAINING_INTERVAL_SECONDS", "300")))
        self.minimum_samples = max(12, int(os.getenv("AUTO_TRAINING_MIN_SAMPLES_PER_KIND", "100")))
        self.minimum_f1 = float(os.getenv("AUTO_TRAINING_MIN_F1", "0.75"))
        self._last_fingerprint: str | None = None
        self._task: asyncio.Task[None] | None = None
        self.status: dict[str, Any] = {
            "enabled": enabled(os.getenv("AUTO_TRAINING_ENABLED")),
            "state": "waiting",
            "message": "Waiting for approved training data.",
            "lastRunAt": None,
            "reports": [],
        }

    def _firestore_client(self):
        from firebase_admin import firestore

        firebase_app()
        return firestore.client()

    def _fetch_candidates(self) -> list[dict[str, Any]]:
        client = self._firestore_client()
        return [snapshot.to_dict() for snapshot in client.collection("training_candidates").where("reviewStatus", "==", "approved").stream()]

    def run_once(self) -> None:
        self.status["lastRunAt"] = datetime.now(timezone.utc).isoformat()
        if not self.status["enabled"]:
            self.status.update(state="disabled", message="AUTO_TRAINING_ENABLED is false.")
            return
        if os.getenv("K_SERVICE") and not storage_enabled():
            self.status.update(
                state="configuration_required",
                message="MODEL_STORAGE_BUCKET is required for automatic training on Cloud Run.",
            )
            return
        try:
            data = candidates_to_frame(self._fetch_candidates())
        except Exception as exc:
            self.status.update(state="configuration_required", message=str(exc))
            return

        counts = {kind: int((data["kind"] == kind).sum()) for kind in ("message", "url")}
        self.status["sampleCounts"] = counts
        ready_kinds = [
            kind for kind in ("message", "url")
            if counts[kind] >= self.minimum_samples and data[data["kind"] == kind]["label"].nunique() == 2
        ]
        if not ready_kinds:
            self.status.update(
                state="waiting_for_data",
                message=f"Needs at least {self.minimum_samples} de-identified samples and both labels per model type.",
            )
            return

        fingerprint = hashlib.sha256(data.sort_values(["kind", "content", "label"]).to_csv(index=False).encode()).hexdigest()
        if fingerprint == self._last_fingerprint:
            self.status.update(state="up_to_date", message="No approved-data changes since the last training run.")
            return

        AUTO_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        data.to_csv(AUTO_DATA_PATH, index=False)
        candidate_directory = MODEL_DIRECTORY / "candidates"
        candidate_directory.mkdir(parents=True, exist_ok=True)
        reports = []
        updated_live_model = False
        for kind in ready_kinds:
            live_path = MESSAGE_MODEL_PATH if kind == "message" else URL_MODEL_PATH
            candidate_path = candidate_directory / f"{kind}_model.joblib"
            report = train_kind(
                data, kind, candidate_path,
                f"firestore-auto-{datetime.now(timezone.utc).date().isoformat()}", True, self.minimum_f1,
            )
            reports.append(report)
            if report["productionReady"]:
                candidate_path.replace(live_path)
                persist_live_model(live_path)
                updated_live_model = True
            elif candidate_path.exists():
                candidate_path.unlink()

        self._last_fingerprint = fingerprint
        if updated_live_model:
            self.on_models_updated()
        self.status.update(
            state="trained" if updated_live_model else "quality_gate_not_met",
            message="A quality-approved model is live." if updated_live_model else "Training completed, but no candidate met the activation quality threshold.",
            reports=reports,
        )

    async def _loop(self) -> None:
        while True:
            await asyncio.to_thread(self.run_once)
            await asyncio.sleep(self.interval_seconds)

    async def start(self) -> None:
        if not self.status["enabled"]:
            self.status.update(state="disabled", message="Automatic training runs in the scheduled Cloud Run Job.")
            return
        await asyncio.to_thread(self.run_once)
        self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
