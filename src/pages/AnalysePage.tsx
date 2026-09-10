import { useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { analyseMessage, type AnalysisResult } from "../lib/api";
import { auth, db } from "../lib/firebase";
import { submitTrainingCandidate } from "../lib/training";
import RiskGauge from "../components/RiskGauge";
import RiskBadge from "../components/RiskBadge";
import Skeleton, { SkeletonText } from "../components/Skeleton";

function AnalysisSkeleton() {
  return (
    <div className="space-y-5">
      {/* Risk overview skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Skeleton className="h-5 w-36 mb-5" />
        <div className="grid sm:grid-cols-3 gap-6 items-center">
          <div className="flex justify-center">
            <Skeleton className="w-36 h-36 rounded-full" />
          </div>
          <div className="sm:col-span-2 space-y-4">
            <Skeleton className="h-8 w-40 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-1.5" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Signals skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Skeleton className="h-5 w-44 mb-4" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
      {/* Recommendations skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Skeleton className="h-5 w-52 mb-4" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded shrink-0 mt-0.5" />
              <SkeletonText className="flex-1" lines={1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXAMPLE_MESSAGES = [
  "Your account has been suspended. Verify your identity immediately at the link below or your account will be permanently closed.",
  "HMRC: You have a tax refund of £312.50 pending. Confirm your bank details here to receive payment within 24 hours.",
  "Hi, it's Royal Mail. We couldn't deliver your parcel. Pay the £1.99 redelivery fee to rebook.",
  "Investment opportunity: Guaranteed 45% monthly returns. Join 10,000 successful investors. Limited spaces remaining.",
  "Your Netflix subscription has expired. Update your payment method within 24 hours to avoid service interruption.",
];

export default function AnalysePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareForTraining, setShareForTraining] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyse() {
    if (!text.trim() || text.trim().length < 10) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const analysis = await analyseMessage(text);
      setResult(analysis);
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "analyses"), {
          userId: user.uid,
          kind: "message",
          submittedText: text,
          result: analysis,
          createdAt: serverTimestamp(),
        });
        if (shareForTraining) {
          await submitTrainingCandidate({
            userId: user.uid,
            kind: "message",
            value: text,
            riskScore: analysis.riskScore,
            category: analysis.category,
          });
        }
        setSaved(true);
      } else {
        setSaved(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis service is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    const user = auth.currentUser;
    if (!user) {
      setError("Sign in to save this analysis to your history.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await addDoc(collection(db, "analyses"), {
        userId: user.uid,
        kind: "message",
        submittedText: text,
        result,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this analysis.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="bg-[#0d1b3e] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 text-blue-300 text-xs mb-3">
            <span>🛡</span> Scam Message Analyser
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Analyse a Suspicious Message
          </h1>
          <p className="text-white/60 text-sm max-w-2xl">
            Paste any SMS, email, WhatsApp, or social media message you've received. Our AI model will analyse it for scam indicators and provide an explainable risk assessment.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
          <label htmlFor="message-content" className="block text-sm font-semibold text-[#0d1b3e] mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Message Content
          </label>
          <textarea
            id="message-content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the suspicious message here..."
            rows={5}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">{text.length} characters{text.length < 10 && text.length > 0 ? " — minimum 10 characters" : ""}</span>
            <span className="text-xs text-slate-400">Analyses SMS, email, WhatsApp, social media, and more</span>
          </div>
          <label className="mt-4 flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={shareForTraining} onChange={(event) => setShareForTraining(event.target.checked)} className="mt-0.5 rounded" />
            <span>Help improve future detection with a de-identified copy of this message. Your sample is reviewed by an admin before it is used for training.</span>
          </label>

          <div className="mt-3 mb-4">
            <div className="text-xs text-slate-500 mb-2">Try an example:</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_MESSAGES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setText(ex)}
                  className="text-xs border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 px-2.5 py-1 rounded-full transition-colors truncate max-w-[200px]"
                >
                  Example {i + 1}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyse}
            disabled={loading || text.trim().length < 10}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? "Analysing…" : "Analyse Message"}
          </button>
        </div>

        {loading && <AnalysisSkeleton />}

        {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {result && !loading && (
          <div className="space-y-5 animate-fade-in">
            {/* Risk overview */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-[#0d1b3e] mb-5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Analysis Result
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center">
                  <RiskGauge score={result.riskScore} />
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <RiskBadge score={result.riskScore} size="lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Predicted Category</div>
                      <div className="font-medium text-[#0d1b3e]">{result.categoryName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Confidence</div>
                      <div className="font-mono font-semibold text-[#0d1b3e]">{(result.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Prediction</div>
                      <div className="font-medium text-[#0d1b3e] capitalize">{result.prediction.replace(/_/g, " ")}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Analysis ID</div>
                      <div className="font-mono text-xs text-slate-400 truncate">{result.analysisId.slice(0, 16)}...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signals */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-[#0d1b3e] mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Detected Indicators
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

            {/* Recommendations */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-[#0d1b3e] mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Recommended Next Steps
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

            {/* Actions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={saved || saving}
                className="flex-1 border border-blue-300 hover:bg-blue-100 disabled:opacity-60 text-blue-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
              {saved ? "✓ Analysis Saved" : saving ? "Saving..." : "Save Analysis"}
              </button>
              <Link to="/report" className="flex-1 bg-[#0d1b3e] text-white text-sm font-medium py-2.5 rounded-lg transition-colors text-center hover:bg-[#1e3a6e]">
                Report This Scam
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-4 border border-slate-200 leading-relaxed">
              <strong className="text-slate-500">Disclaimer:</strong> {result.disclaimer}
            </div>
          </div>
        )}

        {/* Before analysis tips */}
        {!result && !loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-[#0d1b3e] mb-4 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
              What types of messages can be analysed?
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {["SMS text messages", "Email content", "WhatsApp messages", "Social media messages", "Online marketplace messages", "Investment or banking messages", "Delivery notification texts", "Government or authority messages"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
