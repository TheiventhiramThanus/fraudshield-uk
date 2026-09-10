import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type AppRole = "user" | "admin";

type AuthContextValue = {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    setUser(nextUser);
    if (!nextUser) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getDoc(doc(db, "profiles", nextUser.uid));
      setRole(profile.data()?.role === "admin" ? "admin" : "user");
    } catch {
      // The account can sign in even when its Firestore profile has not yet been created.
      setRole("user");
    } finally {
      setLoading(false);
    }
  }), []);

  const value = useMemo(() => ({
    user,
    role,
    loading,
    signOutUser: () => signOut(auth),
  }), [user, role, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider.");
  return value;
}
