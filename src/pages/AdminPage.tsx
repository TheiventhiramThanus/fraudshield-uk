import { useEffect, useState } from "react";
import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import { db } from "../lib/firebase";
import TrainingCandidatesPanel from "../components/TrainingCandidatesPanel";

type Report = { id: string; scamType: string; description: string; region?: string; contactMethod?: string; status: "pending" | "approved" | "rejected"; createdAt?: { toDate: () => Date } };
type Profile = { id: string; displayName?: string; email?: string; role: "user" | "admin"; createdAt?: { toDate: () => Date } };

export default function AdminPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    setLoading(true);
    setError("");
    try {
      const [reportSnapshot, profileSnapshot] = await Promise.all([
        getDocs(query(collection(db, "scam_reports"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "profiles"), orderBy("createdAt", "desc"))),
      ]);
      setReports(reportSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Report));
      setProfiles(profileSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Profile));
    } catch {
      setError("Unable to load reports. Confirm the account has an admin profile role and publish the Firestore rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReports(); }, []);

  async function review(reportId: string, status: "approved" | "rejected") {
    if (!user) return;
    try {
      await updateDoc(doc(db, "scam_reports", reportId), { status, reviewedBy: user.uid, reviewedAt: serverTimestamp() });
      await loadReports();
    } catch {
      setError("Unable to update this report.");
    }
  }

  async function updateRole(profileId: string, role: "user" | "admin") {
    if (!user || profileId === user.uid) {
      setError("You cannot change your own administrator role from this dashboard.");
      return;
    }
    try {
      await updateDoc(doc(db, "profiles", profileId), { role, updatedAt: serverTimestamp(), updatedBy: user.uid });
      await loadReports();
    } catch {
      setError("Unable to update this user's role.");
    }
  }

  const pending = reports.filter((report) => report.status === "pending").length;
  const approved = reports.filter((report) => report.status === "approved").length;

  return <main className="min-h-screen bg-slate-50 pt-16"><div className="bg-[#0d1b3e] py-12"><div className="max-w-6xl mx-auto px-4"><div className="text-blue-300 text-xs mb-3">🛡 Admin area</div><h1 className="text-3xl font-bold text-white">Administration dashboard</h1><p className="mt-2 text-sm text-white/60">Manage roles, review reports, and curate opt-in training data.</p></div></div><div className="max-w-6xl mx-auto px-4 py-10">{error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <p className="text-sm text-slate-500">Loading administration data…</p> : <div className="space-y-8"><section className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs text-slate-500">Registered users</p><p className="mt-1 text-3xl font-bold text-[#0d1b3e]">{profiles.length}</p></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs text-amber-700">Pending reports</p><p className="mt-1 text-3xl font-bold text-amber-800">{pending}</p></div><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs text-emerald-700">Approved reports</p><p className="mt-1 text-3xl font-bold text-emerald-800">{approved}</p></div></section><section><div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="font-semibold text-[#0d1b3e]">Report moderation</h2><p className="mt-1 text-xs text-slate-500">Review reports submitted by registered users.</p></div><button onClick={loadReports} className="text-sm text-blue-600 hover:underline">Refresh</button></div>{reports.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No reports submitted yet.</div> : <div className="space-y-3">{reports.map((report) => <article key={report.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="text-xs font-semibold uppercase tracking-wide text-blue-600">{report.scamType} · {report.status}</div><p className="mt-2 max-w-3xl text-sm text-slate-700">{report.description}</p><p className="mt-2 text-xs text-slate-400">{report.region || "Region not supplied"} · {report.contactMethod || "Contact method not supplied"} · {report.createdAt?.toDate().toLocaleString() || "New"}</p></div>{report.status === "pending" && <div className="flex gap-2"><button onClick={() => review(report.id, "approved")} className="rounded bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Approve</button><button onClick={() => review(report.id, "rejected")} className="rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-700">Reject</button></div>}</div></article>)}</div>}</section><TrainingCandidatesPanel /><section><div className="mb-3"><h2 className="font-semibold text-[#0d1b3e]">User roles</h2><p className="mt-1 text-xs text-slate-500">Promote trusted accounts to admin, or return them to standard-user access.</p></div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Action</th></tr></thead><tbody>{profiles.map((profile) => <tr key={profile.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-[#0d1b3e]">{profile.displayName || "Unnamed user"}{profile.id === user?.uid && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}</td><td className="px-4 py-3 text-slate-600">{profile.email || "—"}</td><td className="px-4 py-3"><span className={profile.role === "admin" ? "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800" : "rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"}>{profile.role}</span></td><td className="px-4 py-3">{profile.id === user?.uid ? <span className="text-xs text-slate-400">Protected</span> : profile.role === "admin" ? <button onClick={() => updateRole(profile.id, "user")} className="text-xs text-red-600 hover:underline">Remove admin</button> : <button onClick={() => updateRole(profile.id, "admin")} className="text-xs text-blue-600 hover:underline">Make admin</button>}</td></tr>)}</tbody></table></div></div></section></div>}</div></main>;
}
