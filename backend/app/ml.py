"""Model loading, feature extraction, and safe inference helpers."""

from __future__ import annotations

import math
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

try:
    import joblib
except ImportError:
    joblib = None


MODEL_DIRECTORY = Path(__file__).resolve().parents[1] / "models"
MESSAGE_MODEL_PATH = MODEL_DIRECTORY / "message_model.joblib"
URL_MODEL_PATH = MODEL_DIRECTORY / "url_model.joblib"


def url_features(value: str) -> dict[str, float]:
    normalised = value if re.match(r"^https?://", value, re.IGNORECASE) else f"https://{value}"
    parsed = urlparse(normalised)
    hostname = (parsed.hostname or "").lower()
    query_count = len([part for part in parsed.query.split("&") if part])
    return {
        "https_enabled": float(parsed.scheme == "https"),
        "url_length": float(len(normalised)),
        "hostname_length": float(len(hostname)),
        "subdomain_count": float(max(0, len(hostname.split(".")) - 2)),
        "hyphen_count": float(hostname.count("-")),
        "digit_count": float(sum(character.isdigit() for character in hostname)),
        "query_count": float(query_count),
        "has_ip_address": float(bool(re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", hostname))),
        "has_shortener": float(bool(re.search(r"(^|\.)(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|short\.io)$", hostname))),
        "suspicious_keyword_count": float(len(re.findall(r"secure|verify|login|signin|account|update|confirm|banking|paypal|amazon", hostname))),
        "hostname_entropy": _entropy(hostname),
    }


def _entropy(value: str) -> float:
    if not value:
        return 0.0
    frequencies = {character: value.count(character) / len(value) for character in set(value)}
    return -sum(probability * math.log2(probability) for probability in frequencies.values())


def load_model(path: Path) -> dict[str, Any] | None:
    if joblib is None or not path.exists():
        return None
    bundle = joblib.load(path)
    if not isinstance(bundle, dict) or "model" not in bundle:
        return None
    # Do not let small demo datasets or weak experimental runs alter live results.
    if not bool(bundle.get("metadata", {}).get("productionReady", False)):
        return None
    return bundle


def suspicious_probability(bundle: dict[str, Any], values: Any) -> float:
    model = bundle["model"]
    classes = list(model.classes_)
    probabilities = model.predict_proba(values)[0]
    if "potentially_suspicious" not in classes:
        return 0.0
    return float(probabilities[classes.index("potentially_suspicious")])
