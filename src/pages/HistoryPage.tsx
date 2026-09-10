import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import { db } from "../lib/firebase";

type HistoryItem = {
  id: string;
  kind: string;
  submittedText?: string;
  submittedUrl?: string;
  result: { riskScore: number; riskLevel: string; categoryName?: string; signals?: string[] };
  createdAt?: { toDate: () => Date };
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, "analyses"), where("userId", "==", user.uid)),
      (snapshot) => setItems(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as HistoryItem)
        .sort((a, b) => (b.createdAt?.toDate().getTime() || 0) - (a.createdAt?.toDate().getTime() || 0))),
      () => setError("Unable to load your saved analyses. Check that Firestore rules are published."),
    );
  }, [user]);

  async function removeItem(id: string) {
    try {
      await deleteDoc(doc(db, "analyses", id));
    } catch {
      setError("Unable to delete this analysis.");
    }
  }

  return <main className="min-h-screen bg-slate-50 pt-16"><div className="bg-[#0d1b3e] py-12"><div className="max-w-4xl mx-auto px-4"><div className="text-blue-300 text-xs mb-3">🔒 Registered user area</div><h1 className="text-3xl font-bold text-white">Analysis History</h1><p className="mt-2 text-sm text-white/60">Your private saved message and URL risk assessments.</p></div></div><div className="max-w-4xl mx-auto px-4 py-10">{error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{items.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No saved analyses yet. Analyse a message or URL while signed in and it will appear here automatically.</div> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-semibold text-blue-600">{item.kind === "url" ? "URL CHECK" : "MESSAGE"} · {item.result.riskLevel.replace("_", " ")} · {item.result.riskScore}/100</div><p className="mt-2 max-w-2xl break-words text-sm text-slate-700">{item.submittedText || item.submittedUrl}</p><p className="mt-2 text-xs text-slate-400">{item.result.categoryName || (item.kind === "url" ? "URL structure analysis" : "Message analysis")} · {item.createdAt?.toDate().toLocaleString() || "Just now"}</p></div><button onClick={() => removeItem(item.id)} className="text-xs text-red-600 hover:underline">Delete</button></div></article>)}</div>}</div></main>;
}
