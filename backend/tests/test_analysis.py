"""Automated checks for FraudShield's defensive risk-analysis baseline."""

import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

import joblib


BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.main import analyse_message, analyse_url, risk_level  # noqa: E402
from app.ml import load_model  # noqa: E402


class RiskLevelTests(unittest.TestCase):
    def test_risk_level_boundaries(self):
        self.assertEqual(risk_level(0), "LOW")
        self.assertEqual(risk_level(30), "LOW")
        self.assertEqual(risk_level(31), "MEDIUM")
        self.assertEqual(risk_level(60), "MEDIUM")
        self.assertEqual(risk_level(61), "HIGH")
        self.assertEqual(risk_level(80), "HIGH")
        self.assertEqual(risk_level(81), "VERY_HIGH")


class MessageAnalysisTests(unittest.TestCase):
    def test_suspicious_message_has_explainable_indicators(self):
        result = analyse_message(
            "HMRC: Your tax refund is waiting. Verify your bank details immediately at https://example.test"
        )
        self.assertGreater(result.riskScore, 60)
        self.assertIn(result.riskLevel, {"HIGH", "VERY_HIGH"})
        self.assertTrue(result.signals)
        self.assertEqual(result.category, "bank_impersonation")
        self.assertIn("informational", result.disclaimer.lower())

    def test_benign_message_is_lower_risk(self):
        result = analyse_message("Hi Sam, are we still meeting for coffee tomorrow afternoon?")
        self.assertEqual(result.riskLevel, "LOW")
        self.assertEqual(result.prediction, "lower_risk")


class UrlAnalysisTests(unittest.TestCase):
    def test_http_brand_style_url_is_flagged(self):
        result = analyse_url("http://secure-bank-login.example.com/account/verify")
        self.assertGreater(result.riskScore, 30)
        self.assertFalse(result.features["HTTPS Enabled"])
        self.assertTrue(result.signals)

    def test_normal_https_url_is_lower_risk(self):
        result = analyse_url("https://www.example.org/about")
        self.assertEqual(result.riskLevel, "LOW")
        self.assertTrue(result.features["HTTPS Enabled"])


class ModelSafetyTests(unittest.TestCase):
    def test_inactive_training_bundle_is_not_loaded_for_live_scoring(self):
        with TemporaryDirectory() as directory:
            model_path = Path(directory) / "candidate.joblib"
            joblib.dump({"model": object(), "metadata": {"productionReady": False}}, model_path)
            self.assertIsNone(load_model(model_path))


if __name__ == "__main__":
    unittest.main()
