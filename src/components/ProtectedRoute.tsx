import { Navigate, useLocation } from "react-router-dom";
import { type AppRole, useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: AppRole[] }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <main className="min-h-screen grid place-items-center bg-slate-50 text-sm text-slate-500">Loading account…</main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && (!role || !roles.includes(role))) {
    return <main className="min-h-screen grid place-items-center bg-slate-50 px-4 text-center"><div><h1 className="text-2xl font-bold text-[#0d1b3e]">Access restricted</h1><p className="mt-2 text-sm text-slate-500">You do not have permission to view this page.</p></div></main>;
  }
  return <>{children}</>;
}
