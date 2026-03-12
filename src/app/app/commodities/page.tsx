"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { TrendingDown, Wifi, WifiOff, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { serverApiUrl, serverUrl } from "@/constant/config";
import { useAuth } from "@/lib/ContextApi";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import {
  Dialog as UIDialog,
  DialogContent as UIDialogContent,
  DialogHeader as UIDialogHeader,
  DialogTitle as UIDialogTitle,
  DialogDescription as UIDialogDescription,
  DialogFooter as UIDialogFooter,
} from "@/components/ui/dialog";

// ─── Types ─────────────────────────────────────────────────────────────────────
type CommodityLive = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  expDate: string;
};

type CommodityHolding = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
};

const COMMODITY_META: Record<
  string,
  { name: string; emoji: string; unit: string }
> = {
  GOLD: { name: "Gold", emoji: "💛", unit: "10g" },
  SILVER: { name: "Silver", emoji: "🩶", unit: "1kg" },
  CRUDEOIL: { name: "Crude Oil", emoji: "🛢️", unit: "bbl" },
  COPPER: { name: "Copper", emoji: "🧱", unit: "1kg" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

// ─── Trade Dialog ──────────────────────────────────────────────────────────────
function CommodityTradeDialog({
  open,
  onOpenChange,
  commodity,
  holding,
  userId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  commodity: CommodityLive | null;
  holding: CommodityHolding | null;
  userId: string;
  onSuccess: () => void;
}) {
  const [action, setAction] = useState<"buy" | "sell" | "short">("buy");
  const [amountStr, setAmountStr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAction("buy");
      setAmountStr("");
    }
  }, [open]);

  if (!commodity) return null;

  const price = commodity.price;
  const qty = parseFloat(amountStr) / price || 0;
  const totalCost = qty * price;

  const handleSubmit = async () => {
    if (!userId || !commodity || submitting) return;
    const tid = toast.loading(
      action === "short"
        ? "Opening short position…"
        : `Placing ${action} order…`,
    );
    setSubmitting(true);
    try {
      if (action === "short") {
        await axios.post(
          `${serverApiUrl}/short/sell`,
          {
            stockName: commodity.name,
            stockSymbol: commodity.symbol,
            quantity: parseFloat(qty.toFixed(6)),
            rate: price,
            assetType: "commodity",
          },
          { withCredentials: true },
        );
        toast.success("Short position opened. Auto-cut at midnight IST.", {
          id: tid,
        });
      } else {
        await axios.post(
          `${serverApiUrl}/commodity/execute`,
          {
            symbol: commodity.symbol,
            quantity: parseFloat(qty.toFixed(6)),
            rate: price,
            type: action,
          },
          { withCredentials: true },
        );
        toast.success(`Commodity ${action} order placed.`, { id: tid });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) &&
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "Order failed.";
      toast.error(msg, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const accentClass =
    action === "buy"
      ? "from-emerald-400/20 to-cyan-400/10"
      : action === "sell"
        ? "from-rose-400/20 to-fuchsia-400/10"
        : "from-amber-400/20 to-orange-400/10";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-neutral-950 text-white max-w-md rounded-2xl overflow-hidden">
        <div
          className={`absolute inset-0 -z-10 bg-gradient-to-br ${accentClass} opacity-50`}
        />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">
              {COMMODITY_META[commodity.symbol]?.emoji ?? "📦"}
            </span>
            {commodity.name} — {commodity.symbol}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Live price:{" "}
            <span className="text-white font-semibold">{fmtINR(price)}</span>
            {action === "short" && (
              <span className="block mt-1 text-amber-400 text-xs">
                ⚠️ Short positions auto-close at midnight IST.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Action tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {(["buy", "sell", "short"] as const).map((act) => {
              const cls =
                act === "buy"
                  ? "bg-emerald-600 text-white"
                  : act === "sell"
                    ? "bg-rose-600 text-white"
                    : "bg-amber-600 text-white";
              return (
                <button
                  key={act}
                  onClick={() => setAction(act)}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition ${
                    action === act ? cls : "text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  {act === "short"
                    ? "Short"
                    : act.charAt(0).toUpperCase() + act.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <Label className="text-zinc-300">Amount (₹)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="bg-white/10 border-white/15 text-white"
            />
            {qty > 0 && (
              <p className="text-sm text-zinc-400">
                ≈ {qty.toFixed(4)} units × {fmtINR(price)} ={" "}
                <span className="text-white">{fmtINR(totalCost)}</span>
              </p>
            )}
          </div>

          {holding && action === "sell" && (
            <p className="text-xs text-zinc-400">
              Your holdings: {holding.quantity.toFixed(4)} units @ avg{" "}
              {fmtINR(holding.price)}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="border border-white/10 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!qty || submitting}
            className={
              action === "buy"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : action === "sell"
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
            }
          >
            {submitting
              ? "Submitting…"
              : action === "buy"
                ? "Buy"
                : action === "sell"
                  ? "Sell"
                  : "Open Short"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CommoditiesPage() {
  const { isAuthed, user } = useAuth() as any;

  const [commodities, setCommodities] = useState<CommodityLive[]>([]);
  const [holdings, setHoldings] = useState<CommodityHolding[]>([]);
  const [connected, setConnected] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedComm, setSelectedComm] = useState<CommodityLive | null>(null);

  const ctrlRef = useRef<AbortController | null>(null);

  // SSE connection
  const connectSSE = useCallback(() => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    let buffer = "";
    fetch(`${serverUrl}/api/v1/commodity/stream`, {
      signal: ctrl.signal,
      headers: { Accept: "text/event-stream" },
    })
      .then((res) => {
        setConnected(true);
        const reader = res.body?.getReader();
        if (!reader) return;
        const dec = new TextDecoder();
        const read = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                setConnected(false);
                return;
              }
              buffer += dec.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              let ev = "",
                data = "";
              for (const line of lines) {
                if (line.startsWith("event:")) ev = line.slice(6).trim();
                else if (line.startsWith("data:")) data += line.slice(5).trim();
                else if (line === "" && data) {
                  if (ev === "prices:update") {
                    try {
                      const parsed = JSON.parse(data);
                      const list = parsed?.live?.list ?? [];
                      setCommodities(
                        list.map((item: any) => ({
                          symbol: item.symbol,
                          name:
                            COMMODITY_META[item.symbol]?.name ?? item.symbol,
                          price: parseFloat(item.lastPrice) || 0,
                          change: parseFloat(item.priceChange) || 0,
                          changePercent:
                            parseFloat(item.priceChangePercentage) || 0,
                          expDate: item.expDate ?? "",
                        })),
                      );
                    } catch {}
                  }
                  ev = "";
                  data = "";
                }
              }
              read();
            })
            .catch(() => setConnected(false));
        };
        read();
      })
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    connectSSE();
    return () => ctrlRef.current?.abort();
  }, [connectSSE]);

  const loadHoldings = useCallback(async () => {
    if (!isAuthed) return;
    try {
      const res = await axios.get(`${serverApiUrl}/commodity/portfolio`, {
        withCredentials: true,
      });
      setHoldings(res.data.holdings ?? []);
    } catch {}
  }, [isAuthed]);

  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  const userId = (user as any)?.id ?? "";

  const selectedHolding = selectedComm
    ? (holdings.find((h) => h.symbol === selectedComm.symbol) ?? null)
    : null;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-zinc-100 pb-20">
      {/* Auth guard blur */}
      <div
        className={`mx-auto max-w-5xl px-4 py-6 ${!isAuthed ? "blur-sm pointer-events-none" : ""}`}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Commodities
            </h1>
            <p className="text-sm text-zinc-400">
              MCX Real-Time • Prices in ₹ INR
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border text-xs ${
              connected
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/5 text-zinc-400"
            }`}
          >
            {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {connected ? "LIVE" : "Connecting…"}
          </div>
        </div>

        {/* Holdings summary */}
        {holdings.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {holdings.map((h) => {
              const live = commodities.find((c) => c.symbol === h.symbol);
              const pnl = live ? (live.price - h.price) * h.quantity : 0;
              const up = pnl >= 0;
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-white/10 bg-neutral-900/60 p-3 backdrop-blur"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{COMMODITY_META[h.symbol]?.emoji}</span>
                    <span className="text-xs text-zinc-400">{h.symbol}</span>
                  </div>
                  <div className="text-sm font-semibold">
                    {h.quantity.toFixed(4)} units
                  </div>
                  <div
                    className={`text-xs mt-1 ${up ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    P&L: {fmtINR(pnl)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Commodity cards */}
        {commodities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <TrendingDown size={40} className="mb-3 opacity-40" />
            <p className="text-sm">Waiting for MCX feed…</p>
            <button
              onClick={connectSSE}
              className="mt-4 text-xs text-indigo-400 hover:underline"
            >
              Reconnect
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {commodities.map((c, i) => {
              const meta = COMMODITY_META[c.symbol];
              const isUp = c.change >= 0;
              const holding = holdings.find((h) => h.symbol === c.symbol);
              const pnl = holding
                ? (c.price - holding.price) * holding.quantity
                : null;

              return (
                <motion.div
                  key={c.symbol}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur cursor-pointer hover:border-white/20 transition"
                  onClick={() => {
                    setSelectedComm(c);
                    setTradeOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{meta?.emoji ?? "📦"}</span>
                      <div>
                        <div className="font-semibold text-zinc-100">
                          {c.symbol}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {meta?.name ?? c.symbol}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Exp: {c.expDate} • {meta?.unit}
                        </div>
                      </div>
                    </div>
                    <ShoppingCart
                      size={16}
                      className="text-zinc-500 group-hover:text-zinc-300 transition mt-1"
                    />
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xl font-bold tabular-nums">
                        {fmtINR(c.price)}
                      </div>
                      <div
                        className={`text-xs mt-1 ${isUp ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {isUp ? "▲" : "▼"} {fmtINR(Math.abs(c.change))} (
                        {Math.abs(c.changePercent).toFixed(2)}%)
                      </div>
                    </div>
                    {pnl !== null && (
                      <div className="text-right">
                        <div className="text-xs text-zinc-400">
                          {holding!.quantity.toFixed(3)} units
                        </div>
                        <div
                          className={`text-sm font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {pnl >= 0 ? "+" : ""}
                          {fmtINR(pnl)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Colour accent bar */}
                  <div
                    className={`mt-3 h-0.5 w-full rounded-full ${
                      isUp ? "bg-emerald-500/40" : "bg-rose-500/40"
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Note */}
        <p className="mt-8 text-center text-xs text-zinc-500">
          All prices are in Indian Rupees (₹) from the MCX exchange. Short
          positions auto-close at midnight IST.
        </p>
      </div>

      {/* Auth guard modal */}
      <UIDialog open={!isAuthed}>
        <UIDialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-md">
          <UIDialogHeader>
            <UIDialogTitle className="flex items-center gap-2">
              <Lock size={18} /> Login Required
            </UIDialogTitle>
            <UIDialogDescription className="text-zinc-400">
              Please login to access commodity trading.
            </UIDialogDescription>
          </UIDialogHeader>
          <UIDialogFooter className="flex gap-2">
            <Link href="/login">
              <UIButton className="bg-indigo-500 hover:bg-indigo-600 text-white">
                Go to Login
              </UIButton>
            </Link>
            <Link href="/app/home">
              <UIButton
                variant="outline"
                className="border-white/20 text-white bg-black"
              >
                Back to Home
              </UIButton>
            </Link>
          </UIDialogFooter>
        </UIDialogContent>
      </UIDialog>

      {/* Trade Dialog */}
      <CommodityTradeDialog
        open={tradeOpen}
        onOpenChange={setTradeOpen}
        commodity={selectedComm}
        holding={selectedHolding}
        userId={userId}
        onSuccess={loadHoldings}
      />
    </div>
  );
}
