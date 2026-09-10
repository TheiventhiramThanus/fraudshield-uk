import { useEffect, useState } from "react";
import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import { db } from "../lib/firebase";

type Candidate = {
  id: string;
  kind: "message" | "url";
  sanitizedInput: string;
  suggestedLabel: string;
  riskScore: number;
  category: string;
  reviewStatus: "pending" | "approved" | "rejected";
  reviewedLabel?: "potentially_suspicious" | "lower_risk";
};

export default function TrainingCandidatesPanel() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState("");

  async function loadCandidates() {
    try {
      const snapshot = await getDocs(query(collection(db, "training_candidates"), orderBy("createdAt", "desc")));
      setCandidates(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Candidate));
    } catch {
      setError("Unable to load training candidates. Publish the latest Firestore rules before using this queue.");
    }
  }

  useEffect(() => { loadCandidates(); }, []);

  async function review(id: string, reviewStatus: "approved" | "rejected", label?: "potentially_suspicious" | "lower_risk") {
    if (!user) return;
    try {
      await updateDoc(doc(db, "training_candidates", id), {
        reviewStatus,
        reviewedLabel: label || null,
        reviewedBy: user.uid,
        reviewedAt: serverTimestamp(),
      });
      await loadCandidates();
    } catch {
      setError("Unable to review this training candidate.");
    }
  }

  const pending = candidates.filter((candidate) => candidate.reviewStatus === "pending");
  const approved = candidates.filter((candidate) => candidate.reviewStatus === "approved" && candidate.reviewedLabel);

  function exportApproved() {
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
    const csv = [
      ["kind", "content", "label", "category", "source", "review_status"],
      ...approved.map((candidate) => [candidate.kind, candidate.sanitizedInput, candidate.reviewedLabel, candidate.category, "admin_reviewed", candidate.reviewStatus]),
    ].map((row) => row.map(quote).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "fraudshield-approved-training-samples.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return <section><div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="font-semibold text-[#0d1b3e]">Training data review</h2><p className="mt-1 text-xs text-slate-500">Only anonymised, user-consented samples appear here. Review before offline model training.</p></div><div className="flex gap-3"><button onClick={exportApproved} disabled={approved.length === 0} className="text-sm text-violet-700 disabled:text-slate-400 hover:underline">Export approved ({approved.length})</button><button onClick={loadCandidates} className="text-sm text-blue-600 hover:underline">Refresh</button></div></div>{error && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{pending.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No training samples awaiting review.</div> : <div className="space-y-3">{pending.map((candidate) => <article key={candidate.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">{candidate.kind} · suggested: {candidate.suggestedLabel} · {candidate.riskScore}/100</p><p className="mt-2 break-words font-mono text-sm text-slate-700">{candidate.sanitizedInput}</p><p className="mt-2 text-xs text-slate-400">Category: {candidate.category}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => review(candidate.id, "approved", "potentially_suspicious")} className="rounded bg-violet-600 px-3 py-2 text-xs font-medium text-white">Approve: suspicious</button><button onClick={() => review(candidate.id, "approved", "lower_risk")} className="rounded border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700">Approve: lower risk</button><button onClick={() => review(candidate.id, "rejected")} className="rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-700">Reject</button></div></article>)}</div>}</section>;
}
