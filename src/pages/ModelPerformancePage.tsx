import { modelMetrics, confusionMatrix } from "../lib/mockData";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const radarData = modelMetrics.map((m) => ({
  model: m.model,
  Precision: Math.round(m.precision * 100),
  Recall: Math.round(m.recall * 100),
  F1: Math.round(m.f1 * 100),
  Accuracy: Math.round(m.accuracy * 100),
}));

const barData = modelMetrics.map((m) => ({
  name: m.model.replace("Multinomial ", "MN "),
  Accuracy: Math.round(m.accuracy * 1000) / 10,
  Precision: Math.round(m.precision * 1000) / 10,
  Recall: Math.round(m.recall * 1000) / 10,
  F1: Math.round(m.f1 * 1000) / 10,
}));

function pct(v: number) {
  return (v * 100).toFixed(1) + "%";
}

export default function ModelPerformancePage() {
  const { truePositive: tp, falsePositive: fp, falseNegative: fn, trueNegative: tn } = confusionMatrix;
  const total = tp + fp + fn + tn;

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="bg-[#0d1b3e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-blue-300 text-xs mb-3">⚗ ML Evaluation</div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Machine Learning Model Performance
          </h1>
          <p className="text-white/60 text-sm max-w-2xl">
            Comparison of three classifiers trained on UK scam message data using TF-IDF features. Metrics from held-out test set.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Active model badge */}
        {modelMetrics.filter((m) => m.active).map((m) => (
          <div key={m.model} className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</div>
            <div>
              <div className="font-semibold text-blue-900 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Active Model: {m.model}
              </div>
              <div className="text-xs text-blue-600 mt-0.5">
                F1: {pct(m.f1)} · Precision: {pct(m.precision)} · Recall: {pct(m.recall)} · ROC-AUC: {pct(m.rocAuc)}
              </div>
            </div>
          </div>
        ))}

        {/* Metrics table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-[#0d1b3e]" style={{ fontFamily: "DM Sans, sans-serif" }}>Model Comparison</h2>
            <p className="text-xs text-slate-400 mt-0.5">Higher is better for all metrics. Selected model indicated with ✓</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Model", "Accuracy", "Precision", "Recall", "F1 Score", "ROC-AUC", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modelMetrics.map((m) => (
                  <tr key={m.model} className={m.active ? "bg-blue-50/50" : ""}>
                    <td className="px-5 py-4 font-medium text-[#0d1b3e]" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      {m.active ? "✓ " : ""}{m.model}
                    </td>
                    {[m.accuracy, m.precision, m.recall, m.f1, m.rocAuc].map((v, i) => (
                      <td key={i} className="px-5 py-4 font-mono text-slate-700">{pct(v)}</td>
                    ))}
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {m.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-[#0d1b3e] mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>Performance Comparison (Bar)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis domain={[75, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Accuracy" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Precision" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Recall" fill="#059669" radius={[3, 3, 0, 0]} />
                <Bar dataKey="F1" fill="#d97706" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Confusion matrix */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-[#0d1b3e] mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Confusion Matrix</h2>
            <p className="text-xs text-slate-400 mb-4">Random Forest · Test set ({total.toLocaleString()} samples)</p>
            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
              {[
                { label: "True Positive", value: tp, desc: "Correctly identified scam", color: "bg-green-50 border-green-200 text-green-800" },
                { label: "False Positive", value: fp, desc: "Legitimate flagged as scam", color: "bg-amber-50 border-amber-200 text-amber-800" },
                { label: "False Negative", value: fn, desc: "Scam missed by model", color: "bg-red-50 border-red-200 text-red-800" },
                { label: "True Negative", value: tn, desc: "Correctly identified legitimate", color: "bg-green-50 border-green-200 text-green-800" },
              ].map((cell) => (
                <div key={cell.label} className={`border rounded-lg p-4 text-center ${cell.color}`}>
                  <div className="text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>{cell.value.toLocaleString()}</div>
                  <div className="text-xs font-semibold mt-1">{cell.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{cell.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dataset info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-[#0d1b3e] mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>Training Dataset Details</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {[
              ["Dataset", "UK Scam Messages Dataset v1.0"],
              ["Training samples", "18,420"],
              ["Test samples", total.toLocaleString()],
              ["Feature method", "TF-IDF (max 10,000 features)"],
              ["Class balance", "Oversampled minority class (SMOTE)"],
              ["Evaluation", "Stratified 5-fold cross-validation"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-slate-400 mb-0.5">{k}</div>
                <div className="font-medium text-slate-700">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          <strong>Note on Model Selection:</strong> The Random Forest classifier was selected as the active model based on F1 score, not accuracy alone. In fraud detection, recall (minimising missed scams) and precision (minimising false alarms) are weighted more heavily than raw accuracy due to class imbalance in real-world data.
        </div>
      </div>
    </main>
  );
}
