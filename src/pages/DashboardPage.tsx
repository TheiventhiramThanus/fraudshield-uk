import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { fraudTrendData, categoryData, regionData, publicStats } from "../lib/mockData";
import Skeleton from "../components/Skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Skeleton className="h-5 w-56 mb-2" />
        <Skeleton className="h-3 w-40 mb-5" />
        <Skeleton className="h-[260px] w-full rounded-lg" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <Skeleton className="h-5 w-44 mb-2" />
            <Skeleton className="h-3 w-36 mb-4" />
            <Skeleton className="h-[240px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, note, accent }: { label: string; value: string; note?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif", color: accent || "#0d1b3e" }}>{value}</div>
      {note && <div className="text-xs text-slate-400 mt-1">{note}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="bg-[#0d1b3e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 text-blue-300 text-xs mb-3">
            <span>📊</span> Intelligence Dashboard
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            UK Fraud Intelligence Dashboard
          </h1>
          <p className="text-white/60 text-sm">
            Aggregated data from public datasets.{" "}
            <a href={publicStats.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
              Source: {publicStats.dataSource}
            </a>{" "}
            · Dataset date: {publicStats.datasetDate} · Last updated: {publicStats.lastUpdated}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!ready ? (
          <DashboardSkeleton />
        ) : (
        <div className="space-y-8 animate-fade-in">
        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Estimated Fraud Incidents" value="4.5M" note="Year ending March 2026" />
          <StatCard label="Fraud Victims" value="3.8M" note="Year ending March 2026" accent="#ef4444" />
          <StatCard label="Bank/Card Account Fraud" value="2.8M" note="Year ending March 2026" />
          <StatCard label="Official Release" value="23 Jul 2026" note="ONS · England and Wales" accent="#1d4ed8" />
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-[#0d1b3e] mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Illustrative Monthly Trend</h2>
          <p className="text-xs text-slate-400 mb-5">Demo visual only — official current data is published as annual estimates.</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={fraudTrendData}>
              <defs>
                <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v) => [(v ?? 0).toLocaleString(), "Reports"]}
              />
              <Area type="monotone" dataKey="reports" stroke="#1d4ed8" fill="url(#areaBlue)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category + Region */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-[#0d1b3e] mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Illustrative Scam Categories</h2>
            <p className="text-xs text-slate-400 mb-4">Platform taxonomy visual, not an official current category breakdown.</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" nameKey="name">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-[#0d1b3e] mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Illustrative Regional View</h2>
            <p className="text-xs text-slate-400 mb-4">Demo visual; not an official current regional dataset.</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={regionData.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <YAxis dataKey="region" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => [(v ?? 0).toLocaleString(), "Reports"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="reports" fill="#1d4ed8" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial losses chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-[#0d1b3e] mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Illustrative Loss Trend (£M)</h2>
          <p className="text-xs text-slate-400 mb-5">Demo visual; current ONS headline data does not provide this monthly series.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fraudTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}M`} />
              <Tooltip formatter={(v) => [`£${v}M`, "Estimated Losses"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="losses" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data source disclosure */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-500">
          <div className="font-semibold text-slate-700 mb-2">Data Source Disclosure</div>
          <p>
            Statistics shown are aggregated from public datasets published by{" "}
            <a href={publicStats.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {publicStats.dataSource}
            </a>. Dataset date: {publicStats.datasetDate}. Last platform update: {publicStats.lastUpdated}.
            The four headline cards use the latest official ONS annual estimate. The charts are illustrative UI data and are clearly labelled so they are not confused with current official statistics.
          </p>
        </div>
        </div>
        )}
      </div>
    </main>
  );
}
