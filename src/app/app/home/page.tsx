"use client";
import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import UserInfo from "./_component/userInfo";
import StockCard from "./_component/stockCard";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
import { useAuth } from "@/lib/ContextApi";

function Home() {
  interface Stock {
    stockName: string;
    stocksymbol: string;
    stockPrice: number;
    stockPriceINR: number;
    stockChange: number;
    stockChangeINR: number;
    stockChangePercentage: number;
    ts: string;
  }

  const { user, setUser, setIsAuthed, isAuthed } = useAuth();
  const router = useRouter();
  const [data, setData] = React.useState<Stock[]>([]);

  // Handle websocket updates for stock data - runs immediately without auth
  const handleUpdate = useCallback((payload: Stock[]) => {
    setData(payload);
  }, []);

  // Websocket connection - runs in parallel with auth, doesn't wait
  useEffect(() => {
    const socket = getSocket();
    socket.on("landing", handleUpdate);
    socket.emit("landing");
    return () => {
      socket.off("landing", handleUpdate);
    };
  }, [handleUpdate]);

  // Auth check - runs silently in parallel, doesn't block stock data
  const fetchUserDetail = useCallback(async () => {
    try {
      const detail = await axios.get(`${serverApiUrl}/me`, {
        withCredentials: true,
      });
      setUser(detail.data.user);
      setIsAuthed(true);
      return true;
    } catch {
      setIsAuthed(false);
      return false;
    }
  }, [setIsAuthed, setUser]);

  // Auth runs in parallel - no blocking, no loading toast
  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  // Navigate to stock detail page with TradingView chart
  const onCardClick = (s: Stock) => {
    console.log("clicked");
    router.push(`/app/stock/${s.stocksymbol.toUpperCase()}`);
    console.log(s.stocksymbol.toUpperCase());
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-500/40 via-cyan-400/25 to-emerald-400/25" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.10),rgba(0,0,0,0))]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col gap-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-5 flex items-center justify-between">
          <div className="text-sm sm:text-base text-white/80">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs mr-3">
              Dashboard
            </span>
            Learn, Trade, Win – Without the Risk.
          </div>
        </div>

        <UserInfo
          user={{
            name: String(user?.name || "Guest"),
            walletAmount: Number(user?.balance || 0),
            portfolioAmount: Number(user?.totalInvested || 0),
          }}
          Auth={isAuthed}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data?.length > 0
            ? data.map((stock, index) => (
                <StockCard
                  key={index}
                  stock={stock}
                  onClick={() => onCardClick(stock)}
                />
              ))
            : // Shimmer skeleton loading
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="h-4 w-16 rounded bg-white/10" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-5 w-24 rounded bg-white/10" />
                    <div className="h-7 w-32 rounded bg-white/10" />
                    <div className="flex gap-2">
                      <div className="h-4 w-20 rounded bg-white/10" />
                      <div className="h-4 w-12 rounded bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
