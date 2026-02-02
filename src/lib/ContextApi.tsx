"use client";
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

const serverApiUrl = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : "http://localhost:3000/api/v1";

export type User = {
  id: string;
  email: string;
  name: string;
  balance: number;
  totalInvested: number;
  createdAt?: string;
};
export type AuthContextType = {
  user: User | null;
  isAuthed: boolean;
  setIsAuthed: (isAuthed: boolean) => void;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
};

// ✅ export the value
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  const logout = async () => {
    try {
      await axios.get(`${serverApiUrl}/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    setIsAuthed(false);
    // Cookie is cleared server-side, no need for localStorage
  };

  const value = useMemo(
    () => ({ user, isAuthed, setUser, logout, setIsAuthed }),
    [user, isAuthed],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
