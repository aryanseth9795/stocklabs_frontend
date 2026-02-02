// File: src/app/app/account/page.tsx

"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserCard, PLCard, LogoutCard } from "./_component";
import type { User, PLPoint, PLStats } from "./_component/types";
import { serverApiUrl } from "@/constant/config";
import axios from "axios";
import { useAuth } from "@/lib/ContextApi";
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
      if (response.data) {
        setPlStats(response.data);
        // Convert stats to chart data
        if (response.data.symbolBreakdown) {
          const chartData: PLPoint[] = response.data.symbolBreakdown.map(
            (item: { symbol: string; realizedPL: number }, idx: number) => ({
              date: new Date(Date.now() - idx * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10),
              value: item.realizedPL,
            }),
          );
          setPlData(chartData);
        }
      }
    } catch (error) {
      console.error("Error fetching P/L stats:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) {
      const loadData = async () => {
        await Promise.all([fetchUserDetail(), fetchPLStats(30)]);
      };
      loadData();
    }
  }, [fetchUserDetail, fetchPLStats, isAuthed]);

  const displayUser: User = userDetail || {
    name: authUser?.name || "User",
    email: authUser?.email || "",
    balance: authUser?.balance,
    totalInvested: authUser?.totalInvested,
  };

  // Generate demo data if no real data
  const displayPL: PLPoint[] =
    plData.length > 0
      ? plData
      : Array.from({ length: 30 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return { date: d.toISOString().slice(0, 10), value: 0 };
        });

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-zinc-100 mb-20">
      {/* Content with blur when not authenticated */}
      <div
        className={`mx-auto max-w-7xl px-4 py-6 ${!isAuthed ? "blur-sm pointer-events-none" : ""}`}
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
          <StatCard
            label="Wallet Balance"
            value={`$${(displayUser.balance ?? 0).toFixed(2)}`}
            icon={<Wallet className="h-5 w-5 text-indigo-400" />}
          />
          <StatCard
            label="Total Invested"
            value={`$${(displayUser.totalInvested ?? 0).toFixed(2)}`}
            icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          />
          <StatCard
            label="Total Trades"
            value={plStats?.totalTrades?.toString() ?? "0"}
            icon={<span className="text-lg font-bold text-cyan-400">#</span>}
          />
          <StatCard
            label="Realized P/L"
            value={`$${(plStats?.realizedPL ?? 0).toFixed(2)}`}
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

        <div className="mt-10 mb-20">
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
