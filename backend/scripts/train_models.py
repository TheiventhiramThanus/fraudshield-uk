"""Train FraudShield baseline models from admin-approved, de-identified CSV data.

Usage:
  python scripts/train_models.py --input data/approved_training_samples.csv
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.ml import MODEL_DIRECTORY, url_features


REQUIRED_COLUMNS = {"kind", "content", "label", "review_status"}
VALID_LABELS = {"potentially_suspicious", "lower_risk"}


def metrics(y_true, y_pred) -> dict[str, float]:
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, pos_label="potentially_suspicious", zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, pos_label="potentially_suspicious", zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, pos_label="potentially_suspicious", zero_division=0)), 4),
    }


def train_kind(
    data: pd.DataFrame,
    kind: str,
    output: Path,
    data_version: str,
    activate: bool,
    minimum_f1: float,
) -> dict[str, object]:
    rows = data[data["kind"] == kind].copy()
    if rows["label"].nunique() < 2 or len(rows) < 12:
        raise ValueError(f"{kind} training needs at least 12 approved samples with both labels.")

    train, test = train_test_split(rows, test_size=0.25, random_state=42, stratify=rows["label"])
    if kind == "message":
        model = Pipeline([
            ("tfidf", TfidfVectorizer(lowercase=True, ngram_range=(1, 2), analyzer="char_wb", min_df=1, max_features=20000)),
            ("classifier", LogisticRegression(class_weight="balanced", max_iter=2000, random_state=42)),
        ])
        x_train, x_test = train["content"], test["content"]
    else:
        x_train = pd.DataFrame([url_features(value) for value in train["content"]])
        x_test = pd.DataFrame([url_features(value) for value in test["content"]])
        model = RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=42, min_samples_leaf=2)

    model.fit(x_train, train["label"])
    predicted = model.predict(x_test)
    model_metrics = metrics(test["label"], predicted)
    production_ready = bool(activate and model_metrics["f1"] >= minimum_f1)
    report = {
        "kind": kind,
        "sample_count": int(len(rows)),
        "training_count": int(len(train)),
        "test_count": int(len(test)),
        "metrics": model_metrics,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "data_version": data_version,
        "productionReady": production_ready,
        "activationNote": (
            "Eligible for live scoring after its approved-data evaluation met the threshold."
            if production_ready
            else "Training artifact only; it will not affect live predictions."
        ),
    }
    joblib.dump({"model": model, "metadata": report}, output)
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="CSV export from approved Firebase training candidates")
    parser.add_argument("--data-version", help="Human-readable source/version label for the approved dataset")
    parser.add_argument(
        "--activate",
        action="store_true",
        help="Activate only if the held-out F1 meets the threshold.",
    )
    parser.add_argument("--minimum-f1", type=float, default=0.75, help="Minimum held-out F1 for activation")
    args = parser.parse_args()
    if not 0 <= args.minimum_f1 <= 1:
        raise ValueError("--minimum-f1 must be between 0 and 1.")
    data = pd.read_csv(args.input).fillna("")
    missing = REQUIRED_COLUMNS.difference(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")
    data = data[(data["review_status"] == "approved") & data["label"].isin(VALID_LABELS)].copy()
    MODEL_DIRECTORY.mkdir(parents=True, exist_ok=True)
    reports = []
    if not data[data["kind"] == "message"].empty:
        reports.append(train_kind(
            data, "message", MODEL_DIRECTORY / "message_model.joblib",
            args.data_version or Path(args.input).name, args.activate, args.minimum_f1,
        ))
    if not data[data["kind"] == "url"].empty:
        reports.append(train_kind(
            data, "url", MODEL_DIRECTORY / "url_model.joblib",
            args.data_version or Path(args.input).name, args.activate, args.minimum_f1,
        ))
    print(json.dumps({"models": reports}, indent=2))
