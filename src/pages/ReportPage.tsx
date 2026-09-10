import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import { db } from "../lib/firebase";
import { SCAM_CATEGORIES } from "../lib/riskConfig";

const REGIONS = ["London", "South East", "South West", "East of England", "East Midlands", "West Midlands", "North West", "Yorkshire and the Humber", "North East", "Scotland", "Wales", "Northern Ireland", "Other / Unknown"];
const CONTACT_METHODS = ["SMS", "Email", "WhatsApp", "Phone call", "Social media (Facebook, Instagram, etc.)", "Online marketplace", "Dating app", "Other"];

export default function ReportPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    scamType: "",
    description: "",
    messageText: "",
    suspiciousUrl: "",
    amountLost: "",
    currency: "GBP",
    region: "",
    incidentDate: "",
    contactMethod: "",
    anonymous: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setError("Sign in before submitting a report."); return; }
    setLoading(true);
    setError("");
    try {
      const report = await addDoc(collection(db, "scam_reports"), { ...form, userId: user.uid, status: "pending", createdAt: serverTimestamp() });
      setReference(report.id.slice(0, 12));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit the report.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h2 className="text-2xl font-bold text-[#0d1b3e] mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>Report Submitted</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Your report has been submitted for review. Once approved, it will contribute anonymously to UK fraud intelligence statistics. Reference: <span className="font-mono">{reference}</span>
          </p>
          <p className="text-xs text-slate-400 mb-6">
            If you've been a victim of fraud, report it to Action Fraud UK at{" "}
            <a href="https://www.actionfraud.police.uk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">actionfraud.police.uk</a>{" "}
            or call 0300 123 2040.
          </p>
          <button onClick={() => { setSubmitted(false); setForm({ scamType: "", description: "", messageText: "", suspiciousUrl: "", amountLost: "", currency: "GBP", region: "", incidentDate: "", contactMethod: "", anonymous: false }); }} className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded text-sm hover:border-slate-400 transition-colors">
            Submit Another Report
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="bg-[#0d1b3e] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-blue-300 text-xs mb-3">📝 Report a Scam</div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>Report a Scam</h1>
          <p className="text-white/60 text-sm max-w-xl">
            Help protect others by reporting suspected scams. Reports are reviewed before contributing to anonymised statistics. Never include passwords, PINs, or banking credentials.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-semibold text-[#0d1b3e] mb-1">Scam Type *</label>
            <select name="scamType" value={form.scamType} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select scam type...</option>
              {SCAM_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d1b3e] mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe what happened..." className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d1b3e] mb-1">Message Text (optional)</label>
            <textarea name="messageText" value={form.messageText} onChange={handleChange} rows={3} placeholder="Paste the suspicious message content here..." className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d1b3e] mb-1">Suspicious URL (optional)</label>
            <input type="text" name="suspiciousUrl" value={form.suspiciousUrl} onChange={handleChange} placeholder="https://..." className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0d1b3e] mb-1">Amount Lost (optional)</label>
              <div className="flex gap-2">
                <select name="currency" value={form.currency} onChange={handleChange} className="border border-slate-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>GBP</option><option>EUR</option><option>USD</option>
                </select>
                <input type="number" name="amountLost" value={form.amountLost} onChange={handleChange} placeholder="0.00" className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0d1b3e] mb-1">Incident Date (optional)</label>
              <input type="date" name="incidentDate" value={form.incidentDate} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0d1b3e] mb-1">Region (optional)</label>
              <select name="region" value={form.region} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select region...</option>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0d1b3e] mb-1">Contact Method (optional)</label>
              <select name="contactMethod" value={form.contactMethod} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">How were you contacted?</option>
                {CONTACT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" name="anonymous" checked={form.anonymous} onChange={handleChange} className="rounded" />
            Submit anonymously (no account association)
          </label>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Privacy notice:</strong> Never include passwords, bank PINs, card security codes, or authentication codes in your report. Submitted reports enter a PENDING review status and are not publicly visible until approved by a moderator.
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors">
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>

        <div className="mt-6 bg-[#0d1b3e] rounded-xl p-5 text-white/70 text-sm">
          <div className="text-white font-semibold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>Official Reporting Resources</div>
          <ul className="space-y-2 text-xs">
            <li>• <strong>Action Fraud UK:</strong> actionfraud.police.uk · 0300 123 2040</li>
            <li>• <strong>National Cyber Security Centre:</strong> ncsc.gov.uk/collection/phishing-scams</li>
            <li>• <strong>Citizens Advice Scams:</strong> citizensadvice.org.uk/consumer/scams</li>
            <li>• <strong>FCA ScamSmart:</strong> fca.org.uk/scamsmart (investment scams)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
