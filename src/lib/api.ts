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

export interface URLAnalysisResult {
  analysisId: string;
  riskScore: number;
  riskLevel: string;
  signals: string[];
  features: Record<string, string | number | boolean>;
  recommendations: string[];
  disclaimer: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail || "The analysis service could not process this request.");
  }
  return response.json() as Promise<T>;
}

export function analyseMessage(content: string): Promise<AnalysisResult> {
  return request<AnalysisResult>("/analyse/message", { content });
}

export function analyseURL(url: string): Promise<URLAnalysisResult> {
  return request<URLAnalysisResult>("/analyse/url", { url });
}
