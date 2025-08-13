"use client";
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type User = {
  id: string;
  email: string;
  name: string;
  balance: number;
  totalInvested: number;
};
export type AuthContextType = {
  user: User | null;
  isAuthed: boolean;
  setIsAuthed: (isAuthed: boolean) => void;
  setUser: (u: User | null) => void;
  logout: () => Promise<void> | void;
};

// ✅ export the value
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const logout = async () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthed: !!user, setUser, logout, setIsAuthed: () => {} }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
