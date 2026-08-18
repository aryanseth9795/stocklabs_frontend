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
    /** Epoch ms of the tick — `ts` is a display string and cannot be compared. */
    tsMs: number;
  }

  const { user, setUser, setIsAuthed, isAuthed } = useAuth();
  const router = useRouter();
  const [data, setData] = React.useState<Stock[]>([]);

  /**
   * One freshness line for the whole board, instead of repeating a timestamp on
   * all 50 cards.
   *
   * Deliberately derived from the newest *tick* rather than from when this
   * component last received a payload: the server re-emits the board every 2s
   * whether or not prices moved, so render time would tick along happily while
   * the upstream feed was dead — which is exactly the failure that made a stale
   * board look live in production.
   *
   * Rendered in IST for every viewer, matching the server, so a user abroad does
   * not see a different "last updated" than the market data implies.
   */
  const lastUpdated = React.useMemo(() => {
    if (!data.length) return null;
    const newest = Math.max(...data.map((s) => s.tsMs ?? 0));
    if (!newest) return null;
    return new Date(newest).toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
    });
  }, [data]);

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
      // The server starts a 2s interval per socket for this feed and only stops
      // it on an explicit request; the socket itself is a singleton that
      // outlives the page, so without this it polls forever (review F-09).
      socket.emit("landing:stop");
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-navbar flex flex-col gap-6 sm:gap-8">
        {/* Stacks below the phone breakpoint. Side by side, the nowrap
            timestamp took its width first and left the tagline a ~170px
            column, which broke "Learn, Trade, Win – Without the Risk." across
            three ragged lines beside it. */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="text-sm sm:text-base text-white/80">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs mr-3">
              Dashboard
            </span>
            Learn, Trade, Win – Without the Risk.
          </div>

          {lastUpdated && (
            <div className="shrink-0 text-[11px] sm:text-xs text-white/50 whitespace-nowrap">
              Last updated:{" "}
              <span className="text-white/70 tabular-nums">{lastUpdated}</span>
              <span className="ml-1 text-white/40">IST</span>
            </div>
          )}
        </div>

        <UserInfo
          user={{
            name: String(user?.name || "Guest"),
            walletAmount: Number(user?.balance || 0),
            portfolioAmount: Number(user?.totalInvested || 0),
          }}
          Auth={isAuthed}
        />

        {/* Denser than before: the cards lost the redundant lowercase name and
            the "Price"/"Change" labels, so they are shorter and no longer need
            a quarter of a 1280px viewport each. Two columns on phones, because
            a price and a percentage fit side by side at that size. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {data?.length > 0
            ? data.map((stock, index) => (
                <StockCard
                  key={index}
                  stock={stock}
                  onClick={() => onCardClick(stock)}
                />
              ))
            : // Shimmer skeleton loading — same box, same padding, same three
              // rows as StockCard, so the board does not jump when the first
              // tick lands. The old placeholder had a 40px avatar the card has
              // never drawn and stood more than twice as tall as the real
              // thing, which dropped the page by several hundred pixels the
              // moment data arrived. Widths are fractional for the same
              // reason the card's type is: the column is 126px on a phone.
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4 animate-pulse"
                >
                  <div className="flex items-center justify-between gap-1.5 mb-3">
                    <div className="h-[11px] w-1/2 rounded bg-white/10" />
                    <div className="h-[11px] w-2/5 rounded bg-white/10" />
                  </div>
                  <div className="h-[22px] w-4/5 rounded bg-white/10" />
                  <div className="mt-1.5 h-3 w-3/5 rounded bg-white/10" />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
