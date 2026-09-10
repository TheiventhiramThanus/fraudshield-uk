"""Cloud Run Job entry point: execute one automatic, quality-gated training pass."""

from __future__ import annotations

import json

from app.auto_training import AutoTrainingService


if __name__ == "__main__":
    service = AutoTrainingService(lambda: None)
    service.run_once()
    print(json.dumps(service.status, indent=2))
