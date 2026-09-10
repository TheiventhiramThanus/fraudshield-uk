import { getRiskLevel, SCAM_CATEGORIES } from "./riskConfig";

const URGENT_PATTERNS = [
  /urgent|immediately|action required|verify now|suspended|expires|deadline/i,
  /limited time|act now|don't delay|must respond|within 24 hours/i,
];
const FINANCIAL_PATTERNS = [
  /bank|account|payment|transfer|funds|money|£|cash|credit card|debit/i,
  /investment|returns|profit|guaranteed|earn|income|opportunity/i,
];
const CREDENTIAL_PATTERNS = [
  /password|pin|verification code|otp|security code|login|sign in/i,
  /confirm your|verify your identity|validate your/i,
];
const LINK_PATTERNS = [/click here|tap here|follow this link|access your|http|www\./i];
const IMPERSONATION_PATTERNS = [
  /hmrc|dvla|nhs|gov\.uk|ofgem|royal mail|parcel|delivery|amazon|paypal|barclays|lloyds|natwest|hsbc/i,
];

export interface AnalysisResult {
  analysisId: string;
  riskScore: number;
  riskLevel: string;
  prediction: string;
  category: string;
  categoryName: string;
  confidence: number;
  signals: string[];
  recommendations: string[];
  disclaimer: string;
}

function detectCategory(text: string): { id: string; name: string } {
  const lower = text.toLowerCase();
  if (/bank|barclays|lloyds|natwest|hsbc|account suspended|card/i.test(lower))
    return { id: "bank_impersonation", name: "Bank Impersonation" };
  if (/delivery|parcel|royal mail|hermes|evri|dpd|package/i.test(lower))
    return { id: "delivery_scam", name: "Delivery Scam" };
  if (/invest|returns|profit|trading|crypto|bitcoin|ethereum/i.test(lower))
    return { id: "investment_scam", name: "Investment / Cryptocurrency Scam" };
  if (/hmrc|tax|gov\.uk|dvla|nhs|government/i.test(lower))
    return { id: "government_impersonation", name: "Government Impersonation" };
  if (/job|employment|work from home|salary|hired|position/i.test(lower))
    return { id: "employment_scam", name: "Employment Scam" };
  if (/click|link|login|verify.*account|password|confirm/i.test(lower))
    return { id: "phishing", name: "Phishing" };
  if (/tech.*support|microsoft|apple|virus|computer|device/i.test(lower))
    return { id: "tech_support", name: "Tech Support Scam" };
  return { id: "unknown", name: "Unknown / Other" };
}

export function analyseMessage(text: string): AnalysisResult {
  const signals: string[] = [];
  let score = 10 + Math.random() * 15;

  URGENT_PATTERNS.forEach((p) => {
    if (p.test(text)) {
      signals.push("Urgent language detected");
      score += 18 + Math.random() * 8;
    }
  });
  FINANCIAL_PATTERNS.forEach((p) => {
    if (p.test(text)) {
      signals.push("Financial terminology detected");
      score += 14 + Math.random() * 8;
    }
  });
  CREDENTIAL_PATTERNS.forEach((p) => {
    if (p.test(text)) {
      signals.push("Credential or authentication request detected");
      score += 20 + Math.random() * 10;
    }
  });
  LINK_PATTERNS.forEach((p) => {
    if (p.test(text)) {
      signals.push("Suspicious link or redirection attempt");
      score += 12 + Math.random() * 6;
    }
  });
  IMPERSONATION_PATTERNS.forEach((p) => {
    if (p.test(text)) {
      signals.push("Possible brand or authority impersonation");
      score += 16 + Math.random() * 8;
    }
  });

  if (text.length < 30) score = Math.max(5, score - 20);

  const finalScore = Math.min(99, Math.max(2, Math.round(score)));
  const uniqueSignals = [...new Set(signals)];
  if (uniqueSignals.length === 0) uniqueSignals.push("No major risk indicators detected");

  const riskLevel = getRiskLevel(finalScore);
  const category = detectCategory(text);
  const confidence = Math.min(0.98, 0.55 + finalScore / 200);

  const recommendations =
    finalScore > 60
      ? [
          "Do not click any links in this message",
          "Contact the claimed organisation directly via their official website",
          "Do not provide passwords, PINs, or verification codes",
          "Report this to Action Fraud UK (actionfraud.police.uk)",
          "If financial details were shared, contact your bank immediately",
        ]
      : finalScore > 30
        ? [
            "Exercise caution before responding or clicking links",
            "Verify the sender through official channels",
            "Do not share personal or financial information",
          ]
        : [
            "Message appears low risk — exercise standard caution",
            "Always verify unexpected requests through official channels",
          ];

  return {
    analysisId: crypto.randomUUID(),
    riskScore: finalScore,
    riskLevel,
    prediction: finalScore > 30 ? "potential_scam" : "likely_legitimate",
    category: category.id,
    categoryName: category.name,
    confidence: parseFloat(confidence.toFixed(2)),
    signals: uniqueSignals,
    recommendations,
    disclaimer:
      "This analysis is informational and should not replace official fraud reporting or professional advice. Results are probabilistic risk assessments, not legal determinations.",
  };
}

export interface URLAnalysisResult {
  riskScore: number;
  riskLevel: string;
  signals: string[];
  features: Record<string, string | number | boolean>;
  recommendations: string[];
  disclaimer: string;
}

export function analyseURL(url: string): URLAnalysisResult {
  const signals: string[] = [];
  let score = 5;

  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const hostname = parsed.hostname;
    const path = parsed.pathname;

    const isHttps = parsed.protocol === "https:";
    if (!isHttps) { signals.push("No HTTPS — connection is not encrypted"); score += 25; }

    const subdomains = hostname.split(".").length - 2;
    if (subdomains > 2) { signals.push("Excessive number of subdomains detected"); score += 15; }

    const hyphens = (hostname.match(/-/g) || []).length;
    if (hyphens > 2) { signals.push("Multiple hyphens in domain — common phishing pattern"); score += 20; }

    if (url.length > 100) { signals.push("Unusually long URL"); score += 10; }

    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(hostname)) {
      signals.push("IP address used instead of domain name");
      score += 30;
    }

    const suspiciousKeywords = /secure|verify|login|signin|account|update|confirm|banking|paypal|amazon|ebay/i;
    if (suspiciousKeywords.test(hostname)) {
      signals.push("Security or brand-related keywords in domain name");
      score += 18;
    }

    if (/%[0-9a-f]{2}/i.test(url)) { signals.push("URL-encoded characters detected"); score += 12; }

    const shorteners = /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|short\.io/i;
    if (shorteners.test(hostname)) { signals.push("URL shortening service detected"); score += 20; }

    const queryParams = parsed.searchParams;
    if ([...queryParams.keys()].length > 5) { signals.push("Excessive query parameters"); score += 8; }

    const dots = (hostname.match(/\./g) || []).length;

    const finalScore = Math.min(97, Math.max(3, Math.round(score + Math.random() * 8)));

    return {
      riskScore: finalScore,
      riskLevel: getRiskLevel(finalScore),
      signals: signals.length > 0 ? signals : ["No major risk indicators detected in URL structure"],
      features: {
        "HTTPS Enabled": isHttps,
        "URL Length": url.length,
        "Subdomain Count": subdomains,
        "Hyphen Count": hyphens,
        "Dot Count": dots,
        "Query Parameters": [...queryParams.keys()].length,
        "IP-Based URL": /\d{1,3}\.\d{1,3}/.test(hostname),
        "URL Shortener": shorteners.test(hostname),
      },
      recommendations:
        finalScore > 60
          ? [
              "Do not visit this URL",
              "Do not enter credentials or personal information",
              "Report to Action Fraud UK if received unsolicited",
              "Check the official website directly by typing it into your browser",
            ]
          : ["Proceed with caution", "Verify the source before entering any personal data"],
      disclaimer:
        "This tool analyses URL characteristics and does not guarantee whether a website is safe. This analysis is informational only.",
    };
  } catch {
    return {
      riskScore: 0,
      riskLevel: "LOW",
      signals: ["Could not parse URL — please enter a valid URL"],
      features: {},
      recommendations: ["Please enter a valid URL including http:// or https://"],
      disclaimer: "URL could not be analysed.",
    };
  }
}
