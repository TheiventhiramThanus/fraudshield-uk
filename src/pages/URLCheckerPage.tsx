import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { analyseURL, type URLAnalysisResult } from "../lib/api";
import { auth, db } from "../lib/firebase";
import { submitTrainingCandidate } from "../lib/training";
import RiskGauge from "../components/RiskGauge";
import RiskBadge from "../components/RiskBadge";
import Skeleton, { SkeletonText } from "../components/Skeleton";

function URLSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Skeleton className="h-5 w-44 mb-5" />
        <div className="grid sm:grid-cols-3 gap-6 items-center">
          <div className="flex justify-center">
            <Skeleton className="w-36 h-36 rounded-full" />
          </div>
          <div className="sm:col-span-2 space-y-3">
            <Skeleton className="h-8 w-40 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-1.5" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <SkeletonText className="flex-1" lines={1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXAMPLES = [
  "https://secure-barclays-verify.co.uk/login",
  "http://amaz0n-uk.phishing-site.net/order/confirm",
  "https://www.google.com",
  "https://hmrc-tax-refund.malicious-link.com/claim",
];

export default function URLCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<URLAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareForTraining, setShareForTraining] = useState(false);

  async function handleCheck() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const analysis = await analyseURL(url.trim());
      setResult(analysis);
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "analyses"), {
          userId: user.uid,
          kind: "url",
          submittedUrl: url.trim(),
          result: analysis,
          createdAt: serverTimestamp(),
        });
        if (shareForTraining) {
          await submitTrainingCandidate({
            userId: user.uid,
            kind: "url",
            value: url.trim(),
            riskScore: analysis.riskScore,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis service is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="bg-[#0d1b3e] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 text-blue-300 text-xs mb-3">
            <span>🔗</span> URL Risk Analyser
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Suspicious URL Checker
          </h1>
          <p className="text-white/60 text-sm max-w-2xl">
            Analyse the structural characteristics of any URL for phishing and fraud indicators. The tool analyses URL structure — it does not visit the destination website.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
          <label htmlFor="url-to-analyse" className="block text-sm font-semibold text-[#0d1b3e] mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            URL to Analyse
          </label>
          <div className="flex gap-3">
            <input
              id="url-to-analyse"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              placeholder="https://example.com/suspicious-link"
              className="flex-1 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleCheck}
              disabled={loading || !url.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              {loading ? "Checking..." : "Check URL"}
            </button>
          </div>

          <div className="mt-3">
            <div className="text-xs text-slate-500 mb-2">Try an example:</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setUrl(ex)}
                  className="text-xs border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 px-2.5 py-1 rounded-full transition-colors font-mono truncate max-w-[240px]"
                >
                  {ex.replace("https://", "").replace("http://", "").slice(0, 35)}...
                </button>
              ))}
            </div>
          </div>
          <label className="mt-4 flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={shareForTraining} onChange={(event) => setShareForTraining(event.target.checked)} className="mt-0.5 rounded" />
            <span>Help improve future detection with a de-identified URL sample, reviewed by an admin before model training.</span>
          </label>
        </div>

        {loading && <URLSkeleton />}

        {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {result && !loading && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-[#0d1b3e] mb-5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                URL Risk Assessment
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center">
                  <RiskGauge score={result.riskScore} />
                </div>
                <div className="sm:col-span-2">
                  <RiskBadge score={result.riskScore} size="lg" />
                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    {Object.entries(result.features).map(([k, v]) => (
                      <div key={k}>
                        <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                        <div className="font-mono font-medium text-[#0d1b3e]">
                          {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-[#0d1b3e] mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Risk Signals Detected
              </h2>
              <div className="space-y-2">
                {result.signals.map((s) => (
                  <div key={s} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs shrink-0">!</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-[#0d1b3e] mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Recommendations
              </h2>
              <ul className="space-y-2">
                {result.recommendations.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-4 border border-slate-200">
              <strong className="text-slate-500">Disclaimer:</strong> {result.disclaimer}
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-[#0d1b3e] mb-3 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
              URL features analysed
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {["HTTPS usage", "URL length", "Subdomain count", "Hyphen patterns", "IP-based URLs", "URL shorteners", "Suspicious keywords in domain", "URL-encoded characters", "Excessive query parameters", "Brand impersonation patterns"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
