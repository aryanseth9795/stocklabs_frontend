"use client";
import React from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { serverApiUrl } from "@/constant/config";
import { useAuth } from "@/lib/ContextApi";
import { fmtINR, errorMessage } from "@/lib/format";

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

type TradeAction = "buy" | "sell" | "short";

// `userId` and `rate` are deliberately absent: the server takes the account from
// the session and fills at its own live price, ignoring both (review F-06,
// server S-02/S-03). Sending them would be inert but misleading.
interface TradeRequestBody {
  stockName: string;
  quantity: number;
  type: "buy" | "sell";
  orderMode?: "delivery" | "intraday" | "short_sell" | "short_cover";
}

interface ShortSellBody {
  stockName: string;
  stockSymbol: string;
  quantity: number;
  assetType: "crypto";
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stock: Stock | null;
  /** Wallet balance in ₹ — the currency of the server's ledger (F-01). */
  walletINR: number;
  userId: string;
  accountfetch: () => void;
}

function BuySellDialog({
  open,
  onOpenChange,
  stock,
  walletINR,
  userId,
  accountfetch,
}: Props) {
  const [action, setAction] = React.useState<TradeAction>("buy");
  const [isIntraday, setIsIntraday] = React.useState(false);
  const [mode, setMode] = React.useState<"amount" | "quantity">("amount");
  const [amountStr, setAmountStr] = React.useState("");
  const [qtyStr, setQtyStr] = React.useState("");
  const [lockedPrice, setLockedPrice] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const { isAuthed } = useAuth();

  // `stock` is a live object off the socket board — a NEW object identity on
  // every tick, about once a second. Depending on it below re-ran this effect
  // on every tick, so the reset wiped whatever the user was typing: the amount
  // and quantity fields emptied themselves mid-keystroke and the order could
  // never be submitted. It also meant `lockedPrice` was re-locked to the latest
  // price every second, which is the opposite of what locking is for.
  //
  // The reset belongs to the dialog OPENING (or being pointed at a different
  // stock), so depend on the symbol — a stable string — not the object.
  const symbol = stock?.stocksymbol ?? null;

  // Read through a ref so the price is captured at open time without making the
  // effect depend on the ticking object.
  const stockRef = React.useRef(stock);
  stockRef.current = stock;

  React.useEffect(() => {
    if (!isAuthed) return;
    if (!open || !symbol) return;
    setAction("buy");
    setIsIntraday(false);
    setMode("amount");
    setAmountStr("");
    setQtyStr("");
    // INR, matching the server's ledger and the mobile app. Reading
    // stockPrice (USD) here is what made the whole page mis-price (F-01).
    setLockedPrice(Number(stockRef.current?.stockPriceINR));
  }, [open, symbol, isAuthed]);

  const price = lockedPrice ?? stock?.stockPriceINR ?? 0;
  const isBuy = action === "buy";
  const isShort = action === "short";

  const amount = React.useMemo(() => {
    const a = parseFloat(amountStr);
    const q = parseFloat(qtyStr);
    if (!price) return 0;
    return mode === "amount"
      ? isFinite(a)
        ? a
        : 0
      : isFinite(q)
        ? q * price
        : 0;
  }, [amountStr, qtyStr, mode, price]);

  const qty = React.useMemo(() => {
    const a = parseFloat(amountStr);
    const q = parseFloat(qtyStr);
    if (!price) return 0;
    return mode === "amount"
      ? (isFinite(a) ? a : 0) / price
      : isFinite(q)
        ? q
        : 0;
  }, [amountStr, qtyStr, mode, price]);

  const insufficientFunds = (isBuy || isShort) && amount > walletINR;
  const disableCta =
    !stock ||
    !userId ||
    price <= 0 ||
    amount <= 0 ||
    qty <= 0 ||
    insufficientFunds ||
    submitting;

  const accentClass = isBuy
    ? "from-emerald-400/30 via-cyan-300/20 to-indigo-400/20"
    : isShort
      ? "from-amber-400/30 via-orange-300/20 to-rose-400/20"
      : "from-rose-400/30 via-fuchsia-300/20 to-indigo-400/20";

  const pillClass = isBuy
    ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
    : isShort
      ? "text-amber-300 border-amber-400/30 bg-amber-400/10"
      : "text-rose-300 border-rose-400/30 bg-rose-400/10";

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Please login to place an order.");
      return;
    }
    if (disableCta || !stock) return;

    const tid = toast.loading(
      isShort
        ? "Opening short position…"
        : isBuy
          ? "Placing buy order…"
          : "Placing sell order…",
    );
    setSubmitting(true);

    try {
      // The server returns the price it actually filled at, which may differ
      // from the indicative price shown here — report the real one (F-06).
      let executedPrice: number | undefined;

      if (isShort) {
        const payload: ShortSellBody = {
          stockName: stock.stockName,
          stockSymbol: stock.stocksymbol,
          quantity: Number(qty.toFixed(6)),
          assetType: "crypto",
        };
        const res = await axios.post(`${serverApiUrl}/short/sell`, payload, {
          withCredentials: true,
        });
        executedPrice = res.data?.executedPrice;
        toast.success(
          executedPrice
            ? `Short opened at ${fmtINR(executedPrice)}. Auto-cut at midnight IST.`
            : "Short position opened successfully. Auto-cut at midnight IST.",
          { id: tid },
        );
      } else {
        const payload: TradeRequestBody = {
          stockName: stock.stockName,
          quantity: Number(qty.toFixed(6)),
          type: action as "buy" | "sell",
          orderMode: isIntraday ? "intraday" : "delivery",
        };
        const res = await axios.post(`${serverApiUrl}/execute`, payload, {
          withCredentials: true,
        });
        executedPrice = res.data?.executedPrice;
        toast.success(
          executedPrice
            ? `${isBuy ? "Bought" : "Sold"} at ${fmtINR(executedPrice)}.`
            : "Order placed successfully.",
          { id: tid },
        );
      }
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to place order."), { id: tid });
    } finally {
      setSubmitting(false);
      accountfetch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-white/10 backdrop-blur-xl rounded-2xl p-0 text-white max-w-lg shadow-2xl">
        <div
          aria-hidden
          className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${accentClass} opacity-60`}
        />
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold tracking-tight">
              Place Order
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border ${pillClass}`}
            >
              {action.toUpperCase()}
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/70 space-x-2">
            <span>
              {stock ? (
                <>
                  {stock.stockName}{" "}
                  <span className="text-white/80">({stock.stocksymbol})</span>
                </>
              ) : (
                <>Select a stock to continue</>
              )}
            </span>
            {stock && (
              <span className="inline-flex items-center gap-2 text-white/60">
                • Indicative price:
                <span className="text-white/90 font-medium">
                  {fmtINR(price)}
                </span>
              </span>
            )}
            {(isBuy || isShort) && (
              <span className="block mt-1 text-xs text-white/50">
                Wallet: {fmtINR(walletINR)}
              </span>
            )}
            {isShort && (
              <span className="block mt-1 text-xs text-amber-300/80">
                ⚠️ Short positions auto-close at midnight IST if not covered.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Action Tab switcher: Buy / Sell / Short */}
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {(["buy", "sell", "short"] as TradeAction[]).map((act) => {
              const col =
                act === "buy"
                  ? "bg-emerald-500/80 text-white"
                  : act === "sell"
                    ? "bg-rose-500/80 text-white"
                    : "bg-amber-500/80 text-white";
              return (
                <button
                  key={act}
                  onClick={() => setAction(act)}
                  className={`py-2 rounded-lg text-sm font-medium transition capitalize ${
                    action === act ? col : "hover:bg-white/10 text-white/60"
                  }`}
                >
                  {act === "short"
                    ? "Short Sell"
                    : act.charAt(0).toUpperCase() + act.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Intraday toggle — only for buy/sell, not short */}
          {!isShort && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 p-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    isIntraday ? "bg-indigo-400" : "bg-emerald-300"
                  }`}
                />
                <p className="text-sm text-white/85">
                  {isIntraday ? "Intraday" : "Delivery"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/60">Delivery</span>
                <Switch checked={isIntraday} onCheckedChange={setIsIntraday} />
                <span className="text-xs text-white/60">Intraday</span>
              </div>
            </div>
          )}

          {/* Indicative price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-white/85">
              Price (₹)
            </Label>
            <Input
              id="price"
              value={price ? price.toFixed(2) : ""}
              readOnly
              className="bg-white/10 border-white/15 text-white placeholder:text-white/30 cursor-not-allowed opacity-90"
            />
            <p className="text-[11px] text-white/50">
              Indicative only — your order fills at the market price when it
              reaches the server.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="rounded-xl border border-white/10 bg-white/10 p-1 flex">
            <button
              onClick={() => {
                setMode("amount");
                setQtyStr("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm transition ${
                mode === "amount" ? "bg-white/15" : "hover:bg-white/5"
              }`}
            >
              Enter Total Amount ($)
            </button>
            <button
              onClick={() => {
                setMode("quantity");
                setAmountStr("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm transition ${
                mode === "quantity" ? "bg-white/15" : "hover:bg-white/5"
              }`}
            >
              Enter Quantity (shares)
            </button>
          </div>

          {/* Inputs */}
          {mode === "amount" ? (
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white/85">
                Total Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
              />
              <p className="text-sm text-white/70">
                Est. Quantity:{" "}
                <span className="font-medium text-white/90">
                  {qty > 0 ? qty.toFixed(4) : "0.0000"}
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="qty" className="text-white/85">
                Quantity (shares)
              </Label>
              <Input
                id="qty"
                type="number"
                min={0}
                step="0.0001"
                placeholder="0.0000"
                value={qtyStr}
                onChange={(e) => setQtyStr(e.target.value)}
                className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
              />
              <p className="text-sm text-white/70">
                Est. Total:{" "}
                <span className="font-medium text-white/90">
                  {fmtINR(amount > 0 ? amount : 0)}
                </span>
              </p>
            </div>
          )}

          {/* Wallet check */}
          {(isBuy || isShort) && (
            <div
              className={`rounded-xl border p-3 ${
                insufficientFunds
                  ? "border-rose-400/40 bg-rose-400/10"
                  : "border-white/10 bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Wallet</span>
                <span className="text-white/90">{fmtINR(walletINR)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-white/70">
                  {isShort ? "Required Margin" : "Order Total"}
                </span>
                <span
                  className={
                    insufficientFunds ? "text-rose-300" : "text-white/90"
                  }
                >
                  {fmtINR(amount > 0 ? amount : 0)}
                </span>
              </div>
              {insufficientFunds && (
                <p className="mt-2 text-xs text-rose-200">
                  Insufficient funds. Reduce amount or add funds.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-5 pb-5 flex gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="border border-white/10 bg-white/10 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={disableCta}
            className={`${
              isBuy
                ? "bg-emerald-500/90 hover:bg-emerald-500"
                : isShort
                  ? "bg-amber-500/90 hover:bg-amber-500"
                  : "bg-rose-500/90 hover:bg-rose-500"
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitting
              ? "Submitting…"
              : isBuy
                ? `Buy${isIntraday ? " (Intraday)" : ""}`
                : isShort
                  ? "Open Short"
                  : `Sell${isIntraday ? " (Intraday)" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(BuySellDialog);
