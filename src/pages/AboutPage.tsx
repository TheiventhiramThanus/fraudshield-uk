import { Link } from "react-router-dom";
import BlurImage from "../components/BlurImage";

const TECH_STACK = [
  { category: "Frontend", items: ["React 19", "TypeScript", "Tailwind CSS v4", "Recharts", "React Router"] },
  { category: "Backend (Planned)", items: ["Python 3.11", "FastAPI", "Pydantic", "SQLAlchemy", "Uvicorn"] },
  { category: "Machine Learning", items: ["scikit-learn", "TF-IDF", "Random Forest", "Logistic Regression", "Naive Bayes"] },
  { category: "Database", items: ["PostgreSQL", "Supabase"] },
  { category: "Authentication", items: ["Supabase Auth", "JWT"] },
  { category: "Deployment", items: ["Vercel (Frontend)", "Render (Backend)", "GitHub"] },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="bg-[#0d1b3e] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-blue-300 text-xs mb-3">ℹ About This Project</div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            About FraudShieldUK
          </h1>
          <p className="text-white/60 text-sm">
            A Software Engineering, Data Science, and Artificial Intelligence research project
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <section>
          <h2 className="text-xl font-bold text-[#0d1b3e] mb-4 pb-2 border-b border-slate-200" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Project Overview
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            FraudShieldUK is a full-stack AI-powered platform built to demonstrate advanced software engineering, data science, and machine learning skills in the context of a real-world problem: digital fraud and scam detection in the UK. The platform provides scam message analysis, URL risk assessment, fraud intelligence dashboards, and a research methodology section — all underpinned by a machine learning pipeline using natural language processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#0d1b3e] mb-4 pb-2 border-b border-slate-200" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Architecture
          </h2>
          <BlurImage
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=360&fit=crop&auto=format"
            alt="Server infrastructure representing the platform architecture"
            blurhash="L36xq?of00WB_3WBt7j[00j[?bae"
            width={800}
            height={360}
            className="rounded-xl mb-4 bg-slate-800"
          />
          <div className="bg-[#0d1b3e] rounded-xl p-6 font-mono text-xs text-white/70 leading-relaxed">
            <pre>{`
USER BROWSER
     ↓
REACT FRONTEND (TypeScript + Tailwind CSS)
     ↓
FASTAPI REST API (Python)
     ↓
SERVICE LAYER
   ↙         ↘
ML INFERENCE   POSTGRESQL DATABASE
  ↓               ↓
scikit-learn    Supabase
     ↘         ↙
   ANALYSIS RESPONSE

PUBLIC DATASETS
     ↓
DATA PIPELINE
     ↓
FRAUD STATISTICS
     ↓
ANALYTICS API → DASHBOARD
            `.trim()}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#0d1b3e] mb-4 pb-2 border-b border-slate-200" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Technology Stack
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((t) => (
              <div key={t.category} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="font-semibold text-[#0d1b3e] text-sm mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{t.category}</div>
                <ul className="space-y-1">
                  {t.items.map((item) => (
                    <li key={item} className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-blue-400 rounded-full" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#0d1b3e] mb-4 pb-2 border-b border-slate-200" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Responsible AI Commitment
          </h2>
          <div className="space-y-3">
            {[
              ["Probabilistic Results", "All risk scores are probabilistic assessments. The platform never accuses any person or organisation of criminal activity."],
              ["Explainability", "Every result includes human-readable explanations of the factors that contributed to the risk score."],
              ["Privacy", "Submitted messages are not stored without explicit user consent. Users control their data."],
              ["Transparency", "Model metrics, training data details, and limitations are publicly documented on the Model Performance page."],
              ["No Harm", "The platform will never generate phishing content, provide fraud techniques, or assist in bypassing fraud detection systems."],
            ].map(([title, desc]) => (
              <div key={title as string} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="font-semibold text-[#0d1b3e] text-sm mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{title as string}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc as string}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/model-performance" className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded text-sm font-medium hover:border-slate-400 transition-colors">
            View Model Performance
          </Link>
        </div>
      </div>
    </main>
  );
}
