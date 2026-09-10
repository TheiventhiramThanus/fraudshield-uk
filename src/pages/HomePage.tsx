import { Link } from "react-router-dom";
import { categoryData, fraudTrendData, publicStats } from "../lib/mockData";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
      <div className="text-2xl font-bold text-white" style={{ fontFamily: "DM Sans, sans-serif" }}>{value}</div>
      <div className="text-sm text-white/60 mt-1">{label}</div>
      {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Paste Your Message or URL",
    desc: "Submit any suspicious SMS, email, WhatsApp message, or URL you've received.",
  },
  {
    step: "02",
    title: "AI Analysis",
    desc: "Our machine learning model analyses linguistic patterns, urgency signals, credential requests, and structural URL features.",
  },
  {
    step: "03",
    title: "Risk Score & Explanation",
    desc: "Receive a risk score, category, detected indicators, and recommended next steps — all explained clearly.",
  },
  {
    step: "04",
    title: "Report & Stay Protected",
    desc: "Save your analysis, report suspected scams, and access official reporting resources.",
  },
];

const SCAM_TYPES = [
  { name: "Phishing", icon: "🎣", desc: "Fraudulent messages designed to steal credentials or personal data" },
  { name: "Bank Impersonation", icon: "🏦", desc: "Scammers posing as your bank or financial institution" },
  { name: "Delivery Scam", icon: "📦", desc: "Fake parcel notifications requesting payment or personal details" },
  { name: "Investment Scam", icon: "📈", desc: "Promises of guaranteed high returns on investments" },
  { name: "Gov. Impersonation", icon: "🏛️", desc: "Fraudsters impersonating HMRC, DVLA, NHS, or other bodies" },
  { name: "Tech Support", icon: "💻", desc: "Fake technical support requesting remote access or payment" },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-[#0d1b3e] min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-violet-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              UK Fraud Intelligence Platform
            </div>
            <h1
              className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Detect.
              <br />
              <span className="text-blue-400">Understand.</span>
              <br />
              Avoid Fraud.
            </h1>
            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
              AI-powered fraud and scam intelligence designed to help you identify potentially suspicious digital activity. Machine learning meets cybersecurity awareness.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/analyse"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded transition-colors"
              >
                Analyse a Suspicious Message
              </Link>
              <Link
                to="/url-checker"
                className="border border-white/20 hover:border-white/40 text-white font-medium px-6 py-3 rounded transition-colors"
              >
                Check a URL
              </Link>
            </div>
            <p className="text-xs text-white/30 mt-4">
              This tool provides risk assessments only. Results are not legal determinations.
            </p>
          </div>

          {/* Hero visual — live stats preview */}
          <div className="hidden lg:block">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-sm">UK Fraud Estimate — YE March 2026</span>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Official release</span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={fraudTrendData}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="reports" stroke="#3b82f6" fill="url(#blueGrad)" strokeWidth={2} dot={false} />
                  <Tooltip
                    contentStyle={{ background: "#1e3a6e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff", fontSize: 12 }}
                    formatter={(v) => [(v ?? 0).toLocaleString(), "Reports"]}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <StatCard label="Estimated fraud incidents" value="4.5M" />
                <StatCard label="Fraud victims" value="3.8M" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0d1b3e] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Estimated fraud incidents", value: "4.5M", note: "YE March 2026 · ONS" },
            { label: "Fraud victims", value: "3.8M", note: "YE March 2026 · ONS" },
            { label: "Bank/card account fraud", value: "2.8M", note: "YE March 2026 · ONS" },
            { label: "Data release", value: "2026", note: "23 July · ONS" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "DM Sans, sans-serif" }}>{s.value}</div>
              <div className="text-sm text-white/60 mt-0.5">{s.label}</div>
              <div className="text-xs text-white/30 mt-0.5">{s.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0d1b3e]" style={{ fontFamily: "DM Sans, sans-serif" }}>
              How It Works
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              A transparent, explainable AI pipeline from submission to risk assessment
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-slate-100 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.step}</div>
                <h3 className="font-semibold text-[#0d1b3e] mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scam Message Detection */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Core Feature</span>
            <h2 className="text-3xl font-bold text-[#0d1b3e] mt-2 mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Scam Message Detection
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Our NLP-powered classifier analyses SMS, emails, WhatsApp messages, and social media content for linguistic patterns associated with fraud. Trained on UK-specific scam data using TF-IDF feature extraction and ensemble machine learning.
            </p>
            <ul className="space-y-2 mb-8">
              {["Urgency and pressure language detection", "Financial terminology analysis", "Credential request identification", "Brand impersonation patterns", "Explainable risk indicators"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/analyse" className="inline-block bg-[#0d1b3e] hover:bg-[#1e3a6e] text-white px-6 py-3 rounded transition-colors font-medium">
              Try the Analyser
            </Link>
          </div>

          {/* Sample result card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="text-xs text-slate-400 mb-3 font-mono">Sample Analysis Result</div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mb-4 italic">
              "Your account has been suspended. Verify your identity immediately using the link below or your account will be permanently closed."
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Risk Score</span>
                  <span className="font-mono font-semibold text-red-600">91/100</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 bg-red-500 rounded-full" style={{ width: "91%" }} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Urgent language detected", "Account verification request", "Suspicious financial wording"].map((s) => (
                <span key={s} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
            <div className="inline-block bg-red-50 text-red-700 text-sm font-semibold px-3 py-1 rounded-full border border-red-200">
              ● Very High Risk — Bank Impersonation
            </div>
          </div>
        </div>
      </section>

      {/* Scam categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0d1b3e]" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Scam Categories Detected
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              The platform identifies 13 types of digital scams prevalent in the UK
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCAM_TYPES.map((t) => (
              <div key={t.name} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
                <div className="text-2xl mb-2">{t.icon}</div>
                <h3 className="font-semibold text-[#0d1b3e] mb-1 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>{t.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UK Fraud Dashboard preview */}
      <section className="py-20 bg-[#0d1b3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Intelligence</span>
              <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                UK Fraud Intelligence Dashboard
              </h2>
              <p className="text-white/50 mt-2 text-sm max-w-lg">
                Latest official annual estimate from the Office for National Statistics. Charts below are illustrative platform views, not live monthly feeds.
              </p>
            </div>
            <Link to="/dashboard" className="shrink-0 border border-white/20 text-white/70 hover:text-white hover:border-white/40 px-5 py-2.5 rounded text-sm transition-colors">
              Open Full Dashboard →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-white/60 text-sm mb-4">Illustrative monthly trend — not an official 2026 series</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={fraudTrendData}>
                  <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="reports" stroke="#3b82f6" fill="url(#g2)" strokeWidth={2} dot={false} />
                  <Tooltip
                    contentStyle={{ background: "#1e3a6e", border: "none", borderRadius: 6, color: "#fff", fontSize: 12 }}
                    formatter={(v) => [(v ?? 0).toLocaleString(), "Reports"]}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {categoryData.slice(0, 4).map((c) => (
                <div key={c.name} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-white/70">{c.name}</span>
                    <span className="text-white font-mono font-semibold">{c.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full">
                    <div className="h-1.5 rounded-full" style={{ width: `${c.value}%`, background: c.fill }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Responsible AI</span>
            <h2 className="text-3xl font-bold text-[#0d1b3e] mt-2 mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Built Responsibly
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              This platform is designed with transparency and ethical AI principles at its core. Predictions are probabilistic risk assessments, never legal determinations.
            </p>
            <div className="space-y-4">
              {[
                ["No accusations", "The system never accuses any person or organisation of criminal activity"],
                ["Explainable results", "Every risk score is accompanied by human-readable indicator explanations"],
                ["Privacy-first", "Submitted text is processed securely and users control their data"],
                ["Bias awareness", "Model limitations, false positives, and false negatives are documented"],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">✓</div>
                  <div>
                    <div className="font-medium text-[#0d1b3e] text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>{title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0d1b3e] rounded-xl p-6 text-white/70 text-sm leading-relaxed space-y-4">
            <div className="text-blue-400 font-semibold text-xs uppercase tracking-wider mb-2">Disclaimer</div>
            <p>
              FraudShieldUK provides probabilistic risk assessments based on machine learning analysis. The platform does not make legal determinations about whether a specific message or website is fraudulent.
            </p>
            <p>
              Results should be used as one input into your decision-making, not as a definitive conclusion. Always exercise independent judgment and consult official resources.
            </p>
            <p>
              If you believe you have been the victim of fraud, report it to{" "}
              <span className="text-blue-300">Action Fraud UK</span> at actionfraud.police.uk or by calling 0300 123 2040.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#0d1b3e] mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Stay One Step Ahead of Fraud
          </h2>
          <p className="text-slate-500 mb-8 text-lg leading-relaxed">
            Use AI-powered analysis, access UK fraud intelligence, and contribute to a safer digital environment.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/analyse" className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3.5 rounded transition-colors">
              Analyse a Message Now
            </Link>
            <Link to="/register" className="border border-slate-300 hover:border-slate-400 text-[#0d1b3e] font-medium px-8 py-3.5 rounded transition-colors">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
