"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { ArrowLeft, TrendingUp, TrendingDown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BuySellDialog from "../../home/_component/buySellDialog";
import { useAuth } from "@/lib/ContextApi";
import { fmtINR } from "@/lib/format";

// Types
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

// Map app symbols to TradingView symbols
const getTradingViewSymbol = (symbol: string): string => {
  const symbolUpper = symbol.toUpperCase();

  const symbolMap: Record<string, string> = {
    BTCUSDT: "BINANCE:BTCUSDT",
    ETHUSDT: "BINANCE:ETHUSDT",
    BNBUSDT: "BINANCE:BNBUSDT",
    XRPUSDT: "BINANCE:XRPUSDT",
    SOLUSDT: "BINANCE:SOLUSDT",
    DOGEUSDT: "BINANCE:DOGEUSDT",
    ADAUSDT: "BINANCE:ADAUSDT",
    TRXUSDT: "BINANCE:TRXUSDT",
    AVAXUSDT: "BINANCE:AVAXUSDT",
    LINKUSDT: "BINANCE:LINKUSDT",
    MATICUSDT: "BINANCE:MATICUSDT",
    DOTUSDT: "BINANCE:DOTUSDT",
    LTCUSDT: "BINANCE:LTCUSDT",
    ATOMUSDT: "BINANCE:ATOMUSDT",
    UNIUSDT: "BINANCE:UNIUSDT",
    GOLD: "TVC:GOLD",
    XAUUSD: "OANDA:XAUUSD",
    SILVER: "TVC:SILVER",
    XAGUSD: "OANDA:XAGUSD",
  };

  return symbolMap[symbolUpper] || `BINANCE:${symbolUpper}`;
};

const intervals = [
  { value: "1", label: "1m" },
  { value: "5", label: "5m" },
  { value: "15", label: "15m" },
  { value: "60", label: "1H" },
  { value: "240", label: "4H" },
  { value: "D", label: "1D" },
  { value: "W", label: "1W" },
];

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthed } = useAuth();
  const symbol = (params.symbol as string)?.toUpperCase() || "";

  const [liveStock, setLiveStock] = useState<Stock | null>(null);
  // Named chartInterval, not interval: a state setter called `setInterval`
  // shadows the global setInterval for this whole component (review F-08).
  const [chartInterval, setChartInterval] = useState("15");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [holdingQuantity, setHoldingQuantity] = useState(0);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [chartLoading, setChartLoading] = useState(true);

  const tradingViewSymbol = useMemo(
    () => getTradingViewSymbol(symbol),
    [symbol],
  );

  // Subscribe to live updates
  useEffect(() => {
    const socket = getSocket();

    const handleLandingUpdate = (stocks: Stock[]) => {
      if (!Array.isArray(stocks)) return;
      const updated = stocks.find(
        (s) => s.stocksymbol.toUpperCase() === symbol,
      );
      if (updated) {
        setLiveStock(updated);
      }
    };

    // Handle portfolio info to get holdings
    const handlePortfolioInfo = (payload: {
      positions?: Array<{
        stockSymbol?: string;
        stockName?: string;
        stockQuantity: number;
      }>;
    }) => {
      if (payload?.positions && Array.isArray(payload.positions)) {
        const position = payload.positions.find(
          (p) => (p.stockSymbol || p.stockName || "").toUpperCase() === symbol,
        );
        setHoldingQuantity(position?.stockQuantity || 0);
      }
    };

    socket.on("landing", handleLandingUpdate);
    socket.on("Portfolio_info", handlePortfolioInfo);
    socket.emit("landing");
    // Only ask for portfolio data when signed in. Guests triggered a server
    // "error" event that nothing listened for (review F-13).
    if (isAuthed) socket.emit("portfolio");

    return () => {
      socket.off("landing", handleLandingUpdate);
      socket.off("Portfolio_info", handlePortfolioInfo);
      // Tell the server to stop its per-socket 2s pollers. Without these the
      // pollers run for the life of the connection, long after this page is
      // gone, because the socket is a never-disconnected singleton (F-09).
      socket.emit("landing:stop");
      if (isAuthed) socket.emit("portfolio:stop");
    };
  }, [symbol, isAuthed]);

  const isPositive = (liveStock?.stockChangePercentage ?? 0) >= 0;

  /**
   * TradingView's own embed URL, loaded cross-origin.
   *
   * This used to build the widget inside a `srcDoc` iframe that loaded
   * s3.tradingview.com/tv.js. That had to be sandboxed, because a `srcDoc`
   * frame inherits THIS page's origin — so a third-party script running in it
   * could reach `window.parent` and make authenticated calls with the session
   * cookie (review F-07).
   *
   * The sandbox that fixed F-07 also broke the chart. `sandbox="allow-scripts"`
   * without `allow-same-origin` gives the frame an opaque origin, and tv.js
   * touches localStorage during initialisation — which throws a SecurityError
   * on an opaque origin and kills the widget before it draws anything.
   *
   * Restoring `allow-same-origin` would bring the vulnerability back, so the
   * frame no longer holds our origin at all: it points at tradingview.com and
   * is therefore cross-origin by construction. The browser's same-origin policy
   * does the isolation the sandbox attribute was being asked to fake, and the
   * widget runs on its own origin with its own storage, so it works.
   */
  const chartUrl = useMemo(() => {
    const params = new URLSearchParams({
      symbol: tradingViewSymbol,
      interval: chartInterval,
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbarbg: "050505",
      backgroundColor: "#050505",
      gridColor: "rgba(255, 255, 255, 0.03)",
      hidesidetoolbar: "0",
      hidetoptoolbar: "0",
      withdateranges: "1",
      allow_symbol_change: "0",
      saveimage: "1",
    });
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [tradingViewSymbol, chartInterval]);

  const handleBuy = useCallback(() => {
    if (!isAuthed) {
      setLoginPromptOpen(true);
      return;
    }
    setDialogOpen(true);
  }, [isAuthed]);

  const handleSell = useCallback(() => {
    if (!isAuthed) {
      setLoginPromptOpen(true);
      return;
    }
    if (holdingQuantity <= 0) {
      return;
    }
    setDialogOpen(true);
  }, [isAuthed, holdingQuantity]);

  const accountfetch = useCallback(() => {
    try {
      getSocket().emit("portfolio");
      getSocket().emit("landing");
    } catch {}
  }, []);

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-white/10 bg-neutral-900/60 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/10 hover:bg-white/10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{symbol}</span>
            <span className="text-lg font-semibold tabular-nums">
              {liveStock ? fmtINR(liveStock.stockPriceINR) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              {liveStock?.stockName ?? symbol}
            </span>
            <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
              {isPositive ? "+" : ""}
              {(liveStock?.stockChangePercentage ?? 0).toFixed(2)}%
            </span>
          </div>
        </div>
      </header>

      {/* Interval Selector */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 bg-neutral-900/40">
        {intervals.map((item) => (
          <button
            key={item.value}
            onClick={() => {
              setChartLoading(true);
              setChartInterval(item.value);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              chartInterval === item.value
                ? "bg-indigo-500 text-white"
                : "text-zinc-400 hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* TradingView Chart */}
      <div className="flex-1 relative">
        {/* Shimmer skeleton while chart loads */}
        {chartLoading && (
          <div className="absolute inset-0 bg-neutral-950 z-10 flex flex-col">
            {/* Chart area shimmer */}
            <div className="flex-1 p-4 animate-pulse">
              <div className="h-full w-full relative">
                {/* Fake candlestick bars */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-1 h-3/4 px-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-white/10 rounded-sm"
                      style={{ height: `${30 + Math.random() * 60}%` }}
                    />
                  ))}
                </div>
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-px bg-white/5 w-full" />
                  ))}
                </div>
              </div>
            </div>
            {/* Loading text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-zinc-400 text-sm">Loading chart...</span>
              </div>
            </div>
          </div>
        )}
        {/*
          Cross-origin `src`, not `srcDoc`. `allow-same-origin` is safe here and
          was not safe before: it restores the frame's OWN origin, which is now
          tradingview.com rather than ours. F-07 was specifically a `srcDoc`
          problem — that frame inherited this page's origin, so the pair of
          tokens handed a third-party script access to our cookies.
        */}
        <iframe
          src={chartUrl}
          className="w-full h-full border-0"
          title="TradingView Chart"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="origin"
          onLoad={() => setChartLoading(false)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 p-4 border-t border-white/10 bg-neutral-900/60 backdrop-blur">
        <Button
          className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
          onClick={handleBuy}
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Buy
        </Button>
        <Button
          className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white font-semibold"
          onClick={handleSell}
          disabled={holdingQuantity <= 0}
        >
          <TrendingDown className="h-5 w-5 mr-2" />
          Sell
        </Button>
      </div>

      {/* Buy/Sell Dialog */}
      {dialogOpen && liveStock && (
        <BuySellDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          stock={liveStock}
          walletINR={user?.balance || 0}
          userId={user?.id || ""}
          accountfetch={accountfetch}
        />
      )}

      {/* Login Prompt Dialog */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Login Required
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please login first to buy or sell assets. Create an account to
              start trading!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setLoginPromptOpen(false)}>
              Cancel
            </Button>
            <Link href="/login">
              <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                Go to Login
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
