"""Defensive, explainable fraud-risk API for FraudShield UK.

This service assesses indicators only. It never labels a person, message, or
website as definitively fraudulent.
"""

from __future__ import annotations

import os
import re
import uuid
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import JSON, Boolean, DateTime, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker
import pandas as pd

from app.auto_training import AutoTrainingService
from app.ml import MESSAGE_MODEL_PATH, URL_MODEL_PATH, load_model, suspicious_probability, url_features
from app.model_store import restore_live_models


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fraudshield.db")
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://127.0.0.1:8443,http://localhost:8443"
).split(",")


class Base(DeclarativeBase):
    pass


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    kind: Mapped[str] = mapped_column(String(20), nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base.metadata.create_all(bind=engine)
try:
    restore_live_models()
except Exception:
    # Rules baseline remains available before the first model promotion or when
    # Cloud Storage is not configured for local development.
    pass
MESSAGE_MODEL = load_model(MESSAGE_MODEL_PATH)
URL_MODEL = load_model(URL_MODEL_PATH)


def reload_live_models() -> None:
    global MESSAGE_MODEL, URL_MODEL
    try:
        restore_live_models()
    except Exception:
        pass
    MESSAGE_MODEL = load_model(MESSAGE_MODEL_PATH)
    URL_MODEL = load_model(URL_MODEL_PATH)


AUTO_TRAINER = AutoTrainingService(reload_live_models)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MessageRequest(BaseModel):
    content: str = Field(min_length=10, max_length=10000)
    save: bool = False


class UrlRequest(BaseModel):
    url: str = Field(min_length=3, max_length=2048)
    save: bool = False


class AnalysisResponse(BaseModel):
    analysisId: str
    riskScore: int
    riskLevel: str
    prediction: str
    category: str
    categoryName: str
    confidence: float
    signals: list[str]
    recommendations: list[str]
    disclaimer: str
    modelSource: str
    modelVersion: str | None = None


class UrlAnalysisResponse(BaseModel):
    analysisId: str
    riskScore: int
    riskLevel: str
    signals: list[str]
    features: dict[str, str | int | bool]
    recommendations: list[str]
    disclaimer: str
    modelSource: str
    modelVersion: str | None = None


DISCLAIMER = (
    "This analysis is informational and should not replace official fraud reporting "
    "or professional advice. Results are probabilistic risk assessments, not legal determinations."
)

CATEGORIES = [
    {"id": "phishing", "name": "Phishing"},
    {"id": "bank_impersonation", "name": "Bank Impersonation"},
    {"id": "delivery_scam", "name": "Delivery Scam"},
    {"id": "investment_scam", "name": "Investment / Cryptocurrency Scam"},
    {"id": "government_impersonation", "name": "Government Impersonation"},
    {"id": "tech_support", "name": "Tech Support Scam"},
    {"id": "unknown", "name": "Unknown / Other"},
]


def risk_level(score: int) -> str:
    if score <= 30:
        return "LOW"
    if score <= 60:
        return "MEDIUM"
    if score <= 80:
        return "HIGH"
    return "VERY_HIGH"


def recommendations(score: int) -> list[str]:
    if score > 60:
        return [
            "Do not click links or open attachments in the message.",
            "Contact the claimed organisation through contact details you find independently.",
            "Do not provide passwords, PINs, or verification codes.",
            "Consider reporting the incident to Action Fraud UK.",
        ]
    if score > 30:
        return [
            "Exercise caution before responding or clicking links.",
            "Verify the sender through an official channel.",
            "Avoid sharing personal or financial information.",
        ]
    return [
        "No major indicators were detected; continue to use normal online safety precautions.",
        "Verify unexpected requests using official contact details.",
    ]


def classify_category(text: str) -> tuple[str, str]:
    rules = [
        (r"bank|barclays|lloyds|natwest|hsbc|account suspended|card", "bank_impersonation", "Bank Impersonation"),
        (r"delivery|parcel|royal mail|hermes|evri|dpd|package", "delivery_scam", "Delivery Scam"),
        (r"invest|returns|profit|trading|crypto|bitcoin|ethereum", "investment_scam", "Investment / Cryptocurrency Scam"),
        (r"hmrc|tax|gov\.uk|dvla|nhs|government", "government_impersonation", "Government Impersonation"),
        (r"tech.*support|microsoft|apple|virus|computer|device", "tech_support", "Tech Support Scam"),
        (r"click|link|login|verify.*account|password|confirm", "phishing", "Phishing"),
    ]
    for pattern, category_id, category_name in rules:
        if re.search(pattern, text, re.IGNORECASE):
            return category_id, category_name
    return "unknown", "Unknown / Other"


def blend_with_model(rule_score: int, bundle: dict[str, Any] | None, values: Any) -> tuple[int, str, str | None]:
    if bundle is None:
        return rule_score, "rules_baseline", None
    probability = suspicious_probability(bundle, values)
    score = round((rule_score * 0.35) + (probability * 100 * 0.65))
    metadata = bundle.get("metadata", {})
    return min(max(score, 1), 99), "rules_plus_ml", str(metadata.get("trained_at"))


def analyse_message(content: str) -> AnalysisResponse:
    checks = [
        (r"urgent|immediately|action required|verify now|suspended|expires|deadline|within 24 hours", 20, "Urgent or pressuring language detected"),
        (r"bank|account|payment|transfer|funds|money|£|credit card|debit", 14, "Financial terminology detected"),
        (r"password|pin|verification code|otp|security code|login|sign in", 22, "Credential or authentication request detected"),
        (r"click here|tap here|follow this link|access your|https?://|www\.", 14, "Link or redirection request detected"),
        (r"hmrc|dvla|nhs|royal mail|amazon|paypal|barclays|lloyds|natwest|hsbc", 16, "Possible brand or authority impersonation detected"),
        (r"guaranteed|risk-free|limited spaces|act now", 12, "Potentially unrealistic promise or pressure tactic detected"),
    ]
    score, signals = 8, []
    for pattern, weight, signal in checks:
        if re.search(pattern, content, re.IGNORECASE):
            score += weight
            signals.append(signal)
    if len(content.strip()) < 30:
        score = max(3, score - 12)
    score = min(score, 99)
    score, model_source, model_version = blend_with_model(score, MESSAGE_MODEL, [content])
    category, category_name = classify_category(content)
    return AnalysisResponse(
        analysisId=str(uuid.uuid4()),
        riskScore=score,
        riskLevel=risk_level(score),
        prediction="potentially_suspicious" if score > 30 else "lower_risk",
        category=category,
        categoryName=category_name,
        confidence=round(min(0.95, 0.52 + score / 200), 2),
        signals=signals or ["No major risk indicators detected"],
        recommendations=recommendations(score),
        disclaimer=DISCLAIMER,
        modelSource=model_source,
        modelVersion=model_version,
    )


def analyse_url(value: str) -> UrlAnalysisResponse:
    normalised = value if re.match(r"^https?://", value, re.IGNORECASE) else f"https://{value}"
    parsed = urlparse(normalised)
    if not parsed.hostname:
        raise HTTPException(status_code=422, detail="Enter a valid URL including a domain name.")

    hostname, signals, score = parsed.hostname.lower(), [], 5
    if parsed.scheme != "https":
        score += 25
        signals.append("No HTTPS encryption detected")
    subdomains = max(0, len(hostname.split(".")) - 2)
    if subdomains > 2:
        score += 15
        signals.append("Excessive number of subdomains detected")
    hyphens = hostname.count("-")
    if hyphens > 2:
        score += 20
        signals.append("Multiple hyphens in the domain name detected")
    is_ip = bool(re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", hostname))
    if is_ip:
        score += 30
        signals.append("IP address used instead of a domain name")
    if re.search(r"secure|verify|login|signin|account|update|confirm|banking|paypal|amazon", hostname):
        score += 18
        signals.append("Security or brand-related keywords found in the domain name")
    is_shortener = bool(re.search(r"(^|\.)(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|short\.io)$", hostname))
    if is_shortener:
        score += 20
        signals.append("URL shortening service detected")
    if len(normalised) > 100:
        score += 10
        signals.append("Unusually long URL detected")
    query_count = len([part for part in parsed.query.split("&") if part])
    if query_count > 5:
        score += 8
        signals.append("Excessive query parameters detected")

    score = min(score, 97)
    score, model_source, model_version = blend_with_model(score, URL_MODEL, pd.DataFrame([url_features(normalised)]))
    return UrlAnalysisResponse(
        analysisId=str(uuid.uuid4()),
        riskScore=score,
        riskLevel=risk_level(score),
        signals=signals or ["No major structural risk indicators detected"],
        features={
            "HTTPS Enabled": parsed.scheme == "https",
            "URL Length": len(normalised),
            "Subdomain Count": subdomains,
            "Hyphen Count": hyphens,
            "Query Parameters": query_count,
            "IP-Based URL": is_ip,
            "URL Shortener": is_shortener,
        },
        recommendations=recommendations(score),
        disclaimer="This tool analyses URL characteristics only and does not visit the destination website. " + DISCLAIMER,
        modelSource=model_source,
        modelVersion=model_version,
    )


def save_result(db: Session, kind: str, result: AnalysisResponse | UrlAnalysisResponse) -> None:
    db.add(AnalysisRecord(
        id=result.analysisId,
        kind=kind,
        risk_score=result.riskScore,
        risk_level=result.riskLevel,
        category=getattr(result, "category", "url_risk"),
        payload=result.model_dump(mode="json"),
        created_at=datetime.now(timezone.utc),
    ))
    db.commit()


app = FastAPI(title="FraudShield UK API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.on_event("startup")
async def start_auto_training() -> None:
    await AUTO_TRAINER.start()


@app.on_event("shutdown")
async def stop_auto_training() -> None:
    await AUTO_TRAINER.stop()


@app.get("/api/v1/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "fraudshield-api"}


@app.get("/api/v1/training/status")
def training_status() -> dict[str, Any]:
    """Read-only status of the automatic, quality-gated training worker."""
    return AUTO_TRAINER.status


@app.get("/api/v1/categories")
def list_categories() -> list[dict[str, str]]:
    return CATEGORIES


@app.post("/api/v1/analyse/message", response_model=AnalysisResponse)
def message_analysis(request: MessageRequest, db: Session = Depends(get_db)) -> AnalysisResponse:
    result = analyse_message(request.content)
    if request.save:
        save_result(db, "message", result)
    return result


@app.post("/api/v1/analyse/url", response_model=UrlAnalysisResponse)
def url_analysis(request: UrlRequest, db: Session = Depends(get_db)) -> UrlAnalysisResponse:
    result = analyse_url(request.url)
    if request.save:
        save_result(db, "url", result)
    return result


@app.get("/api/v1/history")
def recent_history(limit: int = 20, db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    safe_limit = min(max(limit, 1), 100)
    records = db.query(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).limit(safe_limit).all()
    return [record.payload for record in records]
