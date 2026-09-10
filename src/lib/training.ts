import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type TrainingKind = "message" | "url";

function normaliseLink(value: string) {
  try {
    const parsed = new URL(value);
    return `[url:${parsed.hostname.toLowerCase()}]`;
  } catch {
    return "[url]";
  }
}

export function redactMessageForTraining(value: string) {
  return value
    .replace(/https?:\/\/[^\s]+/gi, normaliseLink)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(?:\+44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}/g, "[phone]")
    .replace(/\b\d{8,}\b/g, "[number]")
    .trim();
}

export function redactUrlForTraining(value: string) {
  try {
    const parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}`;
  } catch {
    return "[invalid-url]";
  }
}

export async function submitTrainingCandidate(input: {
  userId: string;
  kind: TrainingKind;
  value: string;
  riskScore: number;
  category?: string;
}) {
  const sanitizedInput = input.kind === "message"
    ? redactMessageForTraining(input.value)
    : redactUrlForTraining(input.value);

  return addDoc(collection(db, "training_candidates"), {
    userId: input.userId,
    kind: input.kind,
    sanitizedInput,
    suggestedLabel: input.riskScore > 30 ? "potentially_suspicious" : "lower_risk",
    riskScore: input.riskScore,
    category: input.category || "unknown",
    reviewStatus: "pending",
    createdAt: serverTimestamp(),
  });
}
