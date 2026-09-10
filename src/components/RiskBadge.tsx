import { getRiskConfig } from "../lib/riskConfig";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function RiskBadge({ score, size = "md" }: Props) {
  const config = getRiskConfig(score);
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-base px-4 py-1.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClass}`}
      style={{ background: config.bg, color: config.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
    </span>
  );
}
