import { getRiskConfig } from "../lib/riskConfig";

interface Props {
  score: number;
}

export default function RiskGauge({ score }: Props) {
  const config = getRiskConfig(score);
  const circumference = 2 * Math.PI * 54;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ fontFamily: "DM Sans, sans-serif", color: config.color }}>
            {score}
          </span>
          <span className="text-xs text-slate-500 font-medium">/ 100</span>
        </div>
      </div>
      <div
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ background: config.bg, color: config.text }}
      >
        {config.label}
      </div>
    </div>
  );
}
