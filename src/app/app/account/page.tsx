// File: src/app/app/account/page.tsx

"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserCard, PLCard, LogoutCard } from "./_component";
import type { User, PLPoint, PLStats } from "./_component/types";
import { serverApiUrl } from "@/constant/config";
import axios from "axios";
import { useAuth } from "@/lib/ContextApi";
import { fmtINR } from "@/lib/format";
import { Wallet, TrendingUp, Lock } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { user: authUser, isAuthed } = useAuth();
  const [userDetail, setUserDetail] = useState<User | null>(null);
  const [plStats, setPlStats] = useState<PLStats | null>(null);
  const [plData, setPlData] = useState<PLPoint[]>([]);

  const fetchUserDetail = useCallback(async () => {
    try {
      const response = await axios.get(`${serverApiUrl}/me`, {
        withCredentials: true,
      });
      if (response.data?.user) {
        setUserDetail({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          balance: response.data.user.balance,
          totalInvested: response.data.user.totalInvested,
          createdAt: response.data.user.createdAt,
          joinedAt: response.data.user.createdAt,
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);

  const fetchPLStats = useCallback(async (days: number = 30) => {
    try {
      const response = await axios.get(`${serverApiUrl}/stats/pl`, {
        params: { days },
        withCredentials: true,
      });
      // The endpoint wraps its payload: { success, data: { realizedPL, ... } }.
      // This used to store the envelope, so realizedPL was undefined (rendered
      // as 0) and the breakdown chart never populated (review F-04).
      const stats = response.data?.data;
      if (stats) {
        setPlStats(stats);
        // The chart is a date axis, and the server now returns a real one:
        // realized P/L per IST day, zero-filled, ending today.
        //
        // This used to build a "timeline" out of symbolBreakdown by walking
        // back one day per array index — so the first symbol was labelled
        // today, the second yesterday, and every date on the chart was
        // invented. Per-symbol totals were never a time series.
        if (Array.isArray(stats.dailyPL)) {
          setPlData(stats.dailyPL);
        }
      }
    } catch (error) {
      console.error("Error fetching P/L stats:", error);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchUserDetail(), fetchPLStats(30)]);
  }, [fetchUserDetail, fetchPLStats]);

  useEffect(() => {
    if (isAuthed) refresh();
  }, [refresh, isAuthed]);

  // Balance and P/L only move when the user trades, and trading happens on
  // other pages — so polling would send identical requests every few seconds
  // for nothing. Refetching when the tab comes back into view covers the case
  // that actually matters: trade elsewhere, return here, see current numbers.
  useEffect(() => {
    if (!isAuthed) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh, isAuthed]);

  const displayUser: User = userDetail || {
    name: authUser?.name || "User",
    email: authUser?.email || "",
    balance: authUser?.balance,
    totalInvested: authUser?.totalInvested,
  };

  // No client-side fallback series any more. The server zero-fills every day in
  // the window, so a user who has never traded gets a real all-zero series
  // rather than 30 fabricated points labelled "demo data" — and an empty array
  // now means the request genuinely failed, which the chart should show as
  // empty rather than disguise as a flat line at zero.
  const displayPL: PLPoint[] = plData;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-zinc-100">
      {/* Content with blur when not authenticated */}
      <div
        className={`mx-auto max-w-7xl px-4 pt-6 pb-navbar ${!isAuthed ? "blur-sm pointer-events-none" : ""}`}
      >
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
            <p className="text-sm text-zinc-400">
              Manage your profile, review P/L, and logout.
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
          {/* ₹, matching the server's ledger (review F-01). */}
          <StatCard
            label="Wallet Balance"
            value={fmtINR(displayUser.balance ?? 0)}
            icon={<Wallet className="h-5 w-5 text-indigo-400" />}
          />
          <StatCard
            label="Total Invested"
            value={fmtINR(displayUser.totalInvested ?? 0)}
            icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          />
          <StatCard
            label="Total Trades"
            value={plStats?.totalTrades?.toString() ?? "0"}
            icon={<span className="text-lg font-bold text-cyan-400">#</span>}
          />
          <StatCard
            label="Realized P/L"
            value={fmtINR(plStats?.realizedPL ?? 0)}
            positive={(plStats?.realizedPL ?? 0) >= 0}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <UserCard defaultUser={displayUser} />
          </div>

          <div className="lg:col-span-2">
            <PLCard data={displayPL} />
          </div>
        </div>

        <div className="mt-10">
          <LogoutCard />
        </div>
      </div>

      {/* Auth dialog */}
      <Dialog open={!isAuthed}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock size={18} /> Login Required
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please login first to access your account details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Link href="/login">
              <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                Go to Login
              </Button>
            </Link>
            <Link href="/app/home">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-black"
              >
                Back to Home
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  positive,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  positive?: boolean;
}) {
  const valueColor =
    positive !== undefined
      ? positive
        ? "text-emerald-400"
        : "text-rose-400"
      : "text-zinc-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur shadow-xl hover:ring-1 hover:ring-white/10 transition"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400">{label}</span>
        {icon}
      </div>
      <div className={`text-xl font-semibold ${valueColor}`}>{value}</div>
    </motion.div>
  );
}
