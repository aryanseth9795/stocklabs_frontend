"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  PieChart as PieIcon,
  Wallet,
  Lock,
  TrendingDown,
} from "lucide-react";
import { serverApiUrl } from "@/constant/config";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BuySellDialog from "../home/_component/buySellDialog";
import { useAuth } from "@/lib/ContextApi";
import { fmtINR, fmtPct, errorMessage } from "@/lib/format";

// ---------- Types from server ----------
type UserData = {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  name: string;
  email: string;
  balance: number; // ₹ — confirmed against the server's ledger, not "likely"
};

type Position = {
  id: string;
  userId: string;
  stockSymbol: string; // "btcusdt"
  stockName: string; // "btcusdt"
  stockPrice: number;
  stockQuantity: number;
  stockTotal: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Tick = {
  stocksymbol: string; // "ETHUSDT"
  stockName: string; // "ethusdt"
  stockPrice: number; // USD — informational only, never use for money
  stockPriceINR?: number; // ₹ — authoritative
  stockChange?: number; // USD — informational only
  stockChangeINR?: number; // ₹ — authoritative
  stockChangePercentage?: number;
  ts?: string; // "7:07:54 pm"
};

type PortfolioBatch = {
  ts: string; // ISO server time
  ticks: Tick[];
};

// Short position
type ShortPosition = {
  id: string;
  assetType: "crypto" | "commodity";
  stockSymbol: string;
  stockName: string;
  entryPrice: number;
  quantity: number;
  totalValue: number;
  status: "open" | "closed" | "auto_cut";
  createdAt: string;
};

// Dialog Stock type (matches your BuySellDialog props)
type StockForDialog = {
  stockName: string;
  stocksymbol: string;
  stockPrice: number;
  stockPriceINR: number;
  stockChange: number;
  stockChangeINR: number;
  stockChangePercentage: number;
  ts: string;
};

// ---------- View model ----------
/** All money fields are ₹ (review F-01). */
type HoldingView = {
  key: string;
  symbol: string;
  name: string;
  qty: number;
  avgBuy: number;
  invested: number;
  current: number;
  value: number;
  dayPct?: number;
  dayAbs?: number;
  ts?: string;
  pnl: number;
  pnlPct: number;
  allocationPct: number;
};

// ---------- Formatters ----------
// Everything on this page is ₹ (see the fmtINR import above). It previously
// rendered USD prices against an INR cost basis, so `pnl = value − invested`
// subtracted rupees from dollars and every P&L figure was meaningless (F-01).

// ---------- Theme helpers ----------
const gain = "text-emerald-400";
const loss = "text-rose-400";
const muted = "text-zinc-400";
const borderClr = "border-white/10";
const cardBg = "bg-neutral-900/60";
const ringHover = "hover:ring-1 hover:ring-white/10";

function PortfolioPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [lastBatchTs, setLastBatchTs] = useState<string>("");

  // dialog + tabs
  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockForDialog | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"holdings" | "shorts">("holdings");
  const [shortPositions, setShortPositions] = useState<ShortPosition[]>([]);
  const [shortLoading, setShortLoading] = useState(false);
  const [coveringId, setCoveringId] = useState<string | null>(null);

  // auth state
  const { isAuthed } = useAuth();

  // handlers
  const handlePortfolioInfo = useCallback((payload: unknown) => {
    // supports {userdata, positions}
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      const { userdata, positions } = payload as {
        userdata?: UserData;
        positions?: Position[];
      };
      if (Array.isArray(positions)) setPositions(positions);
      if (userdata) setUser(userdata);
      return;
    }
    // legacy array fallback
    if (Array.isArray(payload)) {
      setPositions(payload as Position[]);
      setUser(null);
      return;
    }
    setPositions([]);
    setUser(null);
  }, []);

  const handlePortfolioBatch = useCallback(
    (payload: PortfolioBatch | null | undefined) => {
      if (!payload) {
        setTicks([]);
        setLastBatchTs("");
        return;
      }
      setTicks(Array.isArray(payload.ticks) ? payload.ticks : []);
      setLastBatchTs(payload.ts || "");
    },
    [],
  );

  // socket wiring
  useEffect(() => {
    const socket = getSocket();
    socket.on("portfolio:batch", handlePortfolioBatch);
    socket.on("Portfolio_info", handlePortfolioInfo);
    socket.emit("portfolio");
    return () => {
      socket.off("portfolio:batch", handlePortfolioBatch);
      socket.off("Portfolio_info", handlePortfolioInfo);
      // Stop the server's 2s per-socket poller; the socket outlives this page
      // (review F-09).
      socket.emit("portfolio:stop");
    };
  }, [handlePortfolioBatch, handlePortfolioInfo]);

  // quick map for merging
  const bySymbol = useMemo(() => {
    const m = new Map<string, Tick>();
    for (const t of ticks) {
      const k = (t.stocksymbol || t.stockName || "").toUpperCase();
      if (k) m.set(k, t);
    }
    return m;
  }, [ticks]);

  // The `fx` helper that used to live here reverse-derived an INR/USD rate by
  // taking the median of stockPriceINR/stockPrice across ticks. It existed only
  // to bridge the USD display against the INR ledger; now that the page is INR
  // throughout, there is nothing to convert (review F-01).

  // Wallet balance in ₹, exactly as the server stores it.
  const walletINR = useMemo(() => user?.balance ?? 0, [user]);

  // account refresh for dialog
  const accountfetch = useCallback(() => {
    try {
      getSocket().emit("portfolio");
    } catch {}
  }, []);

  // load open short positions
  const loadShortPositions = useCallback(async () => {
    setShortLoading(true);
    try {
      const res = await axios.get(`${serverApiUrl}/short/positions`, {
        params: { status: "open" },
        withCredentials: true,
      });
      setShortPositions(res.data.positions ?? []);
    } catch {
      setShortPositions([]);
    } finally {
      setShortLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "shorts") loadShortPositions();
  }, [activeTab, loadShortPositions]);

  // cover a short at current market price
  const handleCoverShort = useCallback(
    async (pos: ShortPosition) => {
      setCoveringId(pos.id);
      try {
        // No `rate`: the server sets the exit price from its own live feed. It
        // used to accept a client-supplied one, which directly controlled the
        // realised P&L (review F-06, server S-02).
        const res = await axios.post(
          `${serverApiUrl}/short/cover`,
          { shortPositionId: pos.id },
          { withCredentials: true },
        );
        toast(res.data?.message || "Short position covered successfully.");
        await loadShortPositions();
        accountfetch();
      } catch (err) {
        toast(errorMessage(err, "Failed to cover position."));
      } finally {
        setCoveringId(null);
      }
    },
    [loadShortPositions, accountfetch],
  );
  const buildDialogStock = useCallback(
    (symbolUpper: string): StockForDialog | null => {
      const t = bySymbol.get(symbolUpper);
      const pos = positions.find(
        (p) =>
          (p.stockSymbol || p.stockName || "").toUpperCase() === symbolUpper,
      );
      if (!t && !pos) return null;

      // pos.stockPrice is the stored (INR) buy price, so it is a valid stand-in
      // for stockPriceINR when no live tick has arrived yet.
      const priceINR = t?.stockPriceINR ?? pos?.stockPrice ?? 0;
      const price = t?.stockPrice ?? 0;
      return {
        stockName: (
          t?.stockName ||
          pos?.stockName ||
          symbolUpper
        ).toLowerCase(),
        stocksymbol: (
          t?.stocksymbol ||
          pos?.stockSymbol ||
          symbolUpper
        ).toUpperCase(),
        stockPrice: price,
        stockPriceINR: priceINR || 0,
        stockChange: t?.stockChange ?? 0,
        stockChangeINR: t?.stockChangeINR ?? 0,
        stockChangePercentage: t?.stockChangePercentage ?? 0,
        ts: t?.ts || new Date().toLocaleTimeString(),
      };
    },
    [bySymbol, positions],
  );

  // ---------- Derived UI state ----------
  // All arithmetic below is in ₹. `info.stockTotal` and `info.stockPrice` come
  // from the server's ledger (INR), so the live price must be the INR one —
  // mixing in `tick.stockPrice` (USD) is what made every P&L wrong (F-01).
  const { rows, totals, allocData } = useMemo(() => {
    const upper = (s: string) => (s || "").toUpperCase();
    const out: HoldingView[] = [];
    let investedSum = 0;
    let currentSum = 0;

    for (const info of positions) {
      const symbolU = upper(info.stockSymbol || info.stockName);
      const tick = bySymbol.get(symbolU);

      const avgBuy = info.stockQuantity
        ? info.stockTotal / info.stockQuantity
        : 0;
      // Fall back to the average buy price when no tick has arrived, so an
      // un-ticked holding shows zero P&L rather than a 100% loss.
      const livePriceINR = tick?.stockPriceINR ?? avgBuy;

      const value = livePriceINR * info.stockQuantity;

      investedSum += info.stockTotal;
      currentSum += value;

      out.push({
        key: info.id,
        symbol: symbolU,
        name: symbolU,
        qty: info.stockQuantity,
        avgBuy,
        invested: info.stockTotal,
        current: livePriceINR,
        value,
        dayPct: tick?.stockChangePercentage,
        dayAbs: tick?.stockChangeINR,
        ts: tick?.ts,
        pnl: value - info.stockTotal,
        pnlPct: info.stockTotal
          ? ((value - info.stockTotal) / info.stockTotal) * 100
          : 0,
        allocationPct: 0,
      });
    }

    for (let i = 0; i < out.length; i++) {
      out[i].allocationPct = currentSum ? (out[i].value / currentSum) * 100 : 0;
    }

    const alloc = out.map((r) => ({
      name: r.symbol,
      value: Math.max(r.value, 0),
    }));

    return {
      rows: out,
      totals: {
        invested: investedSum,
        current: currentSum,
        pnl: currentSum - investedSum,
        pnlPct: investedSum
          ? ((currentSum - investedSum) / investedSum) * 100
          : 0,
      },
      allocData: alloc,
    };
  }, [positions, bySymbol]);

  const lastTsLabel = useMemo(() => {
    if (!lastBatchTs) return "";
    try {
      const d = new Date(lastBatchTs);
      return isNaN(d.getTime()) ? lastBatchTs : d.toLocaleTimeString();
    } catch {
      return lastBatchTs;
    }
  }, [lastBatchTs]);

  // row click handler -> open dialog
  const onRowClick = useCallback(
    (symbolUpper: string) => {
      const stock = buildDialogStock(symbolUpper);
      setSelectedStock(stock);
      setTradeOpen(Boolean(stock));
    },
    [buildDialogStock],
  );

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-zinc-100">
      {/* Content with blur when not authenticated */}
      <div
        className={`mx-auto max-w-7xl px-4 pt-6 pb-navbar ${!isAuthed ? "blur-sm pointer-events-none" : ""}`}
      >
        {/* Header + Greeting */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user?.name ? `Hi, ${user.name} — Your Portfolio` : "Portfolio"}
            </h1>
            <p className={`${muted} text-sm`}>
              Live P&amp;L with StockLabs aesthetics
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 border border-white/10 bg-neutral-900/50">
            <Clock className="h-4 w-4" />
            <span className="text-xs">
              {lastTsLabel ? `Last tick: ${lastTsLabel}` : "Waiting for ticks…"}
            </span>
          </div>
        </div>

        {/* Wallet + KPIs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <WalletCard balanceINR={walletINR} />
          <KpiCard
            title="Invested"
            value={totals.invested}
            subtitle="Total principal"
          />
          <KpiCard
            title="Current Value"
            value={totals.current}
            subtitle="Mark-to-market"
          />
          <KpiPnl
            title="Unrealized P&L"
            pnl={totals.pnl}
            pnlPct={totals.pnlPct}
          />
        </div>

        {/* Tab switcher: Holdings | Short Positions */}
        <div className="mt-6 flex gap-2">
          {(["holdings", "shorts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                activeTab === tab
                  ? tab === "holdings"
                    ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                    : "bg-amber-500/20 border-amber-400/40 text-amber-300"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {tab === "holdings"
                ? "Holdings"
                : `Short Positions${shortPositions.length > 0 ? ` (${shortPositions.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Grid: Allocation + Holdings or Short Positions */}
        {activeTab === "holdings" ? (
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AllocationCard data={allocData} className="lg:col-span-1" />
            <HoldingsTable
              rows={rows}
              className="lg:col-span-2"
              onRowClick={onRowClick}
            />
          </div>
        ) : (
          <div className="mt-4">
            <ShortPositionsTable
              positions={shortPositions}
              loading={shortLoading}
              coveringId={coveringId}
              bySymbol={bySymbol}
              onCover={handleCoverShort}
            />
          </div>
        )}

        {/* Live ticker */}
        <LiveTicker ticks={ticks} className="mt-6" />
      </div>

      {/* Buy/Sell Dialog */}
      <BuySellDialog
        open={tradeOpen}
        onOpenChange={setTradeOpen}
        stock={selectedStock}
        walletINR={walletINR}
        userId={user?.id || ""}
        accountfetch={accountfetch}
      />

      {/* Auth dialog */}
      <Dialog open={!isAuthed}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock size={18} /> Login Required
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please login first to access your portfolio and holdings.
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
                className="border-white/20 text-white hover:bg-white/4  bg-black"
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

// ---------- Components ----------

function WalletCard({ balanceINR }: { balanceINR: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardBg} ${ringHover} rounded-2xl border ${borderClr} p-4 shadow-xl backdrop-blur`}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">Wallet Balance</div>
        <Wallet className="h-4 w-4 text-zinc-300" />
      </div>
      <div className="mt-2 text-2xl font-semibold">
        {fmtINR(balanceINR || 0)}
      </div>
      <div className="mt-3 text-xs text-zinc-500">Available funds</div>
    </motion.div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  /** ₹ */
  value: number;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardBg} ${ringHover} rounded-2xl border ${borderClr} p-4 shadow-xl backdrop-blur`}
    >
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{fmtINR(value)}</div>
      {subtitle && <div className="mt-3 text-xs text-zinc-500">{subtitle}</div>}
    </motion.div>
  );
}

function KpiPnl({
  title,
  pnl,
  pnlPct,
}: {
  title: string;
  /** ₹ */
  pnl: number;
  pnlPct: number;
}) {
  const up = pnl >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardBg} ${ringHover} rounded-2xl border ${borderClr} p-4 shadow-xl backdrop-blur`}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">{title}</div>
        {up ? (
          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-rose-400" />
        )}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${up ? gain : loss}`}>
        {fmtINR(pnl)}
      </div>
      <div className={`mt-1 text-xs ${up ? gain : loss}`}>{fmtPct(pnlPct)}</div>
      <div className="mt-3 text-xs text-zinc-500">
        Unrealized since purchase
      </div>
    </motion.div>
  );
}

function AllocationCard({
  data,
  className = "",
}: {
  data: { name: string; value: number }[];
  className?: string;
}) {
  const palette = [
    "#22c55e",
    "#60a5fa",
    "#f97316",
    "#a78bfa",
    "#ef4444",
    "#14b8a6",
    "#eab308",
    "#38bdf8",
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className} ${cardBg} rounded-2xl border ${borderClr} p-4 shadow-xl backdrop-blur`}
    >
      <div className="mb-3 flex items-center gap-2">
        <PieIcon className="h-5 w-5 text-zinc-300" />
        <h3 className="text-sm font-medium text-zinc-300">Allocation</h3>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={1}
            >
              {data.map((d, i) => (
                <Cell
                  key={`slice-${d?.name || "n"}-${i}`}
                  fill={palette[i % palette.length]}
                />
              ))}
            </Pie>
            <ReTooltip
              formatter={(value, name) => {
                if (value === undefined || value === null) return ["-", name];
                const v = Array.isArray(value)
                  ? Number(value[0])
                  : Number(value) || 0;
                const pct = total ? (v / total) * 100 : 0;
                return [`${fmtINR(v)} (${pct.toFixed(1)}%)`, name];
              }}
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {data.map((d, i) => {
          const pct = total ? (d.value / total) * 100 : 0;
          return (
            <div
              key={`allocrow-${d?.name || "n"}-${i}`}
              className="flex items-center justify-between"
            >
              <span className="text-zinc-400">{d.name}</span>
              <span className="text-zinc-200">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function HoldingsTable({
  rows,
  onRowClick,
  className = "",
}: {
  rows: HoldingView[];
  onRowClick?: (symbolUpper: string) => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className} ${cardBg} rounded-2xl border ${borderClr} p-4 shadow-xl backdrop-blur`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Holdings</h3>
      </div>

      {/* `w-full` alone made the wrapper's overflow-x-auto dead weight: the
          table sized itself to the container and squeezed seven columns into a
          phone instead of scrolling. The minimum is what gives it something to
          scroll. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead className="text-xs uppercase text-zinc-400">
            <tr className="border-b border-white/5">
              <th className="py-2 pr-3 text-left">Symbol</th>
              <th className="py-2 px-3 text-right">Qty</th>
              <th className="py-2 px-3 text-right">Avg</th>
              <th className="py-2 px-3 text-right">Price</th>
              <th className="py-2 px-3 text-right">Value</th>
              <th className="py-2 px-3 text-right">Day</th>
              <th className="py-2 pl-3 text-right">P&L</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-zinc-500">
                  Loading portfolio…
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const up = r.pnl >= 0;
                const dayUp = (r.dayPct ?? 0) >= 0;
                return (
                  <tr
                    key={`${r.key || r.symbol}-row-${i}`}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() => onRowClick?.(r.symbol)}
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-white/40" />
                        <div className="font-medium text-zinc-200">
                          {r.symbol}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">{r.name}</div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      {r.qty}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      {fmtINR(r.avgBuy)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <div className="text-zinc-200">{fmtINR(r.current)}</div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <div className="text-zinc-200">{fmtINR(r.value)}</div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span className={`${dayUp ? gain : loss}`}>
                        {fmtPct(r.dayPct ?? 0)}
                      </span>
                      {r.dayAbs !== undefined && (
                        <div className={`text-xs ${dayUp ? gain : loss}`}>
                          {fmtINR(r.dayAbs)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pl-3 text-right tabular-nums">
                      <div className={`${up ? gain : loss}`}>
                        {fmtINR(r.pnl)}
                      </div>
                      <div className={`text-xs ${up ? gain : loss}`}>
                        {fmtPct(r.pnlPct)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Allocation bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div className="flex h-full w-full">
          {rows.map((r, i) => (
            <div
              key={`alloc-${r.key || r.symbol}-${i}`}
              className="h-full"
              style={{
                width: `${Math.max(0, r.allocationPct)}%`,
                background:
                  "linear-gradient(90deg, rgba(34,197,94,0.6), rgba(59,130,246,0.6))",
              }}
              title={`${r.symbol}: ${r.allocationPct.toFixed(1)}%`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function LiveTicker({
  ticks,
  className = "",
}: {
  ticks: Tick[];
  className?: string;
}) {
  const marquee = ticks.length ? [...ticks, ...ticks] : [];
  return (
    <div
      className={`${className} ${cardBg} rounded-2xl border ${borderClr} shadow-xl backdrop-blur`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm font-medium text-zinc-300">Live Ticker</div>
        <div className="text-xs text-zinc-500">streaming</div>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex w-[200%] animate-[ticker_24s_linear_infinite] gap-8 whitespace-nowrap px-4 py-2">
          {marquee.map((t, i) => {
            const up = (t?.stockChangePercentage ?? 0) >= 0;
            const symbol = (t?.stocksymbol || t?.stockName || "").toUpperCase();
            return (
              <div
                key={`tick-${symbol}-${t?.ts || "t"}-${i}`}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-1.5"
              >
                <span className="text-xs text-zinc-400">{symbol}</span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {fmtINR(t?.stockPriceINR ?? 0)}
                </span>
                <span className={`text-xs ${up ? gain : loss}`}>
                  {fmtPct(t?.stockChangePercentage ?? 0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        @keyframes ticker {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Short Positions Table ──────────────────────────────────────────────────
// `ShortPosition` is declared once, near the other server types at the top of
// the file. A second, near-identical declaration lived here and made the whole
// project fail to typecheck (review F-15).

function ShortPositionsTable({
  positions,
  loading,
  coveringId,
  bySymbol,
  onCover,
}: {
  positions: ShortPosition[];
  loading: boolean;
  coveringId: string | null;
  bySymbol: Map<string, Tick>;
  onCover: (pos: ShortPosition) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardBg} rounded-2xl border ${borderClr} p-4 shadow-xl backdrop-blur`}
    >
      <div className="mb-3 flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-amber-400" />
        <h3 className="text-sm font-medium text-zinc-300">
          Open Short Positions
        </h3>
        <span className="text-xs text-zinc-500 ml-auto">
          Auto-cut at midnight IST
        </span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-zinc-500 text-sm">
          Loading short positions…
        </div>
      ) : positions.length === 0 ? (
        <div className="py-10 text-center text-zinc-500 text-sm">
          No open short positions.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead className="text-xs uppercase text-zinc-400">
              <tr className="border-b border-white/5">
                <th className="py-2 pr-3 text-left">Symbol</th>
                <th className="py-2 px-3 text-right">Qty</th>
                <th className="py-2 px-3 text-right">Entry Price</th>
                <th className="py-2 px-3 text-right">Live Price</th>
                <th className="py-2 px-3 text-right">Unr. P&L</th>
                <th className="py-2 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                const sym = pos.stockSymbol.toUpperCase();
                const tick = bySymbol.get(sym);
                // entryPrice is stored in ₹, so the live price must be the INR
                // one — pairing it with the USD tick produced a fake ~85x
                // profit on every open short (review F-01).
                const livePrice = tick?.stockPriceINR ?? pos.entryPrice;
                const pnl = (pos.entryPrice - livePrice) * pos.quantity;
                const up = pnl >= 0;
                const covering = coveringId === pos.id;
                return (
                  <tr key={pos.id} className="border-b border-white/5">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-400/60" />
                        <div>
                          <div className="font-medium text-zinc-200">{sym}</div>
                          <div className="text-[11px] text-zinc-500 capitalize">
                            {pos.assetType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-zinc-200">
                      {pos.quantity.toFixed(4)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-zinc-200">
                      {fmtINR(pos.entryPrice)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-zinc-200">
                      {fmtINR(livePrice)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right tabular-nums ${up ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {fmtINR(pnl)}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        disabled={covering}
                        onClick={() => onCover(pos)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold border transition ${
                          covering
                            ? "opacity-50 cursor-not-allowed border-white/10 text-zinc-400"
                            : "border-amber-400/40 text-amber-300 bg-amber-400/10 hover:bg-amber-400/20"
                        }`}
                      >
                        {covering ? "Covering…" : "Cover"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export default PortfolioPage;
