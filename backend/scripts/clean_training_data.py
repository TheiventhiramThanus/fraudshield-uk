"""Create a safe, training-ready CSV from an approved candidate export.

This is a local preprocessing step. It removes direct identifiers, normalises
labels, rejects malformed rows, and deduplicates content. It does not infer
ground-truth labels; a human reviewer remains responsible for that decision.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

import pandas as pd


LABEL_MAP = {
    "scam": "potentially_suspicious",
    "fraud": "potentially_suspicious",
    "phishing": "potentially_suspicious",
    "suspicious": "potentially_suspicious",
    "potentially_suspicious": "potentially_suspicious",
    "safe": "lower_risk",
    "legit": "lower_risk",
    "legitimate": "lower_risk",
    "benign": "lower_risk",
    "lower_risk": "lower_risk",
}
VALID_KINDS = {"message", "url"}


def redact_message(value: str) -> str:
    def replace_url(match: re.Match[str]) -> str:
        parsed = urlparse(match.group(0))
        return f"[url:{(parsed.hostname or 'unknown').lower()}]"

    return re.sub(r"\s+", " ", re.sub(
        r"\b\d{8,}\b", "[number]", re.sub(
            r"(?:\+44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}", "[phone]", re.sub(
                r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", "[email]",
                re.sub(r"https?://[^\s]+", replace_url, value, flags=re.IGNORECASE), flags=re.IGNORECASE
            )
        )
    )).strip()


def clean_url(value: str) -> str | None:
    normalised = value.strip()
    if not re.match(r"^https?://", normalised, flags=re.IGNORECASE):
        normalised = f"https://{normalised}"
    parsed = urlparse(normalised)
    if not parsed.hostname or " " in parsed.hostname:
        return None
    return f"{parsed.scheme.lower()}://{parsed.hostname.lower()}"


def clean_dataframe(data: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, int]]:
    required = {"kind", "content", "label", "review_status"}
    missing = required.difference(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")

    result = data.copy().fillna("")
    audit = {"input_rows": len(result), "rejected_kind": 0, "rejected_label": 0, "rejected_content": 0, "duplicates_removed": 0}
    result["kind"] = result["kind"].astype(str).str.strip().str.lower()
    bad_kind = ~result["kind"].isin(VALID_KINDS)
    audit["rejected_kind"] = int(bad_kind.sum())
    result = result[~bad_kind].copy()

    result["label"] = result["label"].astype(str).str.strip().str.lower().map(LABEL_MAP)
    bad_label = result["label"].isna()
    audit["rejected_label"] = int(bad_label.sum())
    result = result[~bad_label].copy()

    result["content"] = result["content"].astype(str)
    messages = result["kind"] == "message"
    result.loc[messages, "content"] = result.loc[messages, "content"].map(redact_message)
    result.loc[~messages, "content"] = result.loc[~messages, "content"].map(clean_url)
    bad_content = result["content"].isna() | (result["content"].str.len() < 8)
    audit["rejected_content"] = int(bad_content.sum())
    result = result[~bad_content].copy()

    result["review_status"] = "approved"
    for optional, default in {"category": "unknown", "source": "cleaned_import"}.items():
        if optional not in result.columns:
            result[optional] = default
        result[optional] = result[optional].astype(str).str.strip().replace("", default)
    before_deduplication = len(result)
    result = result.drop_duplicates(subset=["kind", "content", "label"]).reset_index(drop=True)
    audit["duplicates_removed"] = before_deduplication - len(result)
    audit["output_rows"] = len(result)
    return result[["kind", "content", "label", "category", "source", "review_status"]], audit


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean approved fraud-training samples safely.")
    parser.add_argument("--input", required=True, help="Approved CSV export to clean")
    parser.add_argument("--output", required=True, help="Destination cleaned CSV")
    args = parser.parse_args()
    cleaned, audit = clean_dataframe(pd.read_csv(args.input, dtype=str))
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    cleaned.to_csv(output, index=False)
    print(json.dumps({"output": str(output), "audit": audit}, indent=2))
