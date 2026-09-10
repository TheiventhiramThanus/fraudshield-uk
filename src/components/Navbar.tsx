import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navLinks = [
  { label: "Analyse", href: "/analyse" },
  { label: "URL Checker", href: "/url-checker" },
  { label: "Report a Scam", href: "/report" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, role, signOutUser } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1b3e] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4V8C14 11.3 11.3 14.3 8 15C4.7 14.3 2 11.3 2 8V4L8 1Z" fill="white" fillOpacity="0.9"/>
                <path d="M5.5 8L7.5 10L10.5 6.5" stroke="#0d1b3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight" style={{ fontFamily: "DM Sans, sans-serif" }}>
              FraudShield<span className="text-blue-400">UK</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  location.pathname === link.href
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? <><Link to="/history" className="text-white/70 hover:text-white text-sm transition-colors">History</Link>{role === "admin" && <Link to="/admin" className="text-amber-300 hover:text-amber-200 text-sm transition-colors">Admin</Link>}<button onClick={() => signOutUser()} className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded transition-colors">Sign Out</button></> : <><Link to="/login" className="text-white/70 hover:text-white text-sm transition-colors">Sign In</Link><Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded transition-colors">Get Started</Link></>}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white/80 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded text-sm"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 text-white/70 text-sm">Sign In</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="mx-3 text-center bg-blue-600 text-white text-sm py-2 rounded">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
