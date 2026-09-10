export const RISK_THRESHOLDS = {
  LOW: { min: 0, max: 30, label: "Low Risk", color: "#10b981", bg: "#dcfce7", text: "#065f46" },
  MEDIUM: { min: 31, max: 60, label: "Medium Risk", color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  HIGH: { min: 61, max: 80, label: "High Risk", color: "#f97316", bg: "#ffedd5", text: "#9a3412" },
  VERY_HIGH: { min: 81, max: 100, label: "Very High Risk", color: "#ef4444", bg: "#fee2e2", text: "#991b1b" },
} as const;

export type RiskLevel = keyof typeof RISK_THRESHOLDS;

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return "LOW";
  if (score <= 60) return "MEDIUM";
  if (score <= 80) return "HIGH";
  return "VERY_HIGH";
}

export function getRiskConfig(score: number) {
  return RISK_THRESHOLDS[getRiskLevel(score)];
}

export const SCAM_CATEGORIES = [
  { id: "phishing", name: "Phishing", slug: "phishing" },
  { id: "bank_impersonation", name: "Bank Impersonation", slug: "bank-impersonation" },
  { id: "delivery_scam", name: "Delivery Scam", slug: "delivery-scam" },
  { id: "investment_scam", name: "Investment Scam", slug: "investment-scam" },
  { id: "online_shopping", name: "Online Shopping Scam", slug: "online-shopping" },
  { id: "employment_scam", name: "Employment Scam", slug: "employment-scam" },
  { id: "government_impersonation", name: "Government Impersonation", slug: "government-impersonation" },
  { id: "tech_support", name: "Tech Support Scam", slug: "tech-support" },
  { id: "account_verification", name: "Account Verification Scam", slug: "account-verification" },
  { id: "romance_scam", name: "Romance Scam", slug: "romance-scam" },
  { id: "advance_fee", name: "Advance Fee Scam", slug: "advance-fee" },
  { id: "cryptocurrency", name: "Cryptocurrency Scam", slug: "cryptocurrency" },
  { id: "unknown", name: "Unknown / Other", slug: "unknown" },
];
