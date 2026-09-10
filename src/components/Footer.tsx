import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0d1b3e] text-white/60 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 4V8C14 11.3 11.3 14.3 8 15C4.7 14.3 2 11.3 2 8V4L8 1Z" fill="white" fillOpacity="0.9"/>
                  <path d="M5.5 8L7.5 10L10.5 6.5" stroke="#0d1b3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                FraudShield<span className="text-blue-400">UK</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              AI-powered fraud and scam intelligence designed to help users identify potentially suspicious digital activity. A UK-focused defensive awareness platform.
            </p>
            <p className="text-xs mt-4 text-white/40">
              This platform does not make legal determinations. Results are probabilistic risk assessments only.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>Tools</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["Analyse Message", "/analyse"],
                ["URL Checker", "/url-checker"],
                ["Fraud Dashboard", "/dashboard"],
                ["Report a Scam", "/report"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>Project</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["Model Performance", "/model-performance"],
                ["Sign In", "/login"],
                ["Register", "/register"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p>Fraud Detection &amp; Intelligence Platform</p>
          <p>This platform is for educational and research purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
