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
type TradeType = "buy" | "sell";
interface TradeRequestBody {
  userId: string;
  stockName: string;
  quantity: number;
  rate: number;
  type: TradeType;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stock: Stock | null;
  walletUSD: number;
  userId: string;
  accountfetch: () => void;
}

function BuySellDialog({
  open,
  onOpenChange,
  stock,
  walletUSD,
  userId,
  accountfetch,
}: Props) {
  const [isBuy, setIsBuy] = React.useState(true);
  const [mode, setMode] = React.useState<"amount" | "quantity">("amount");
  const [amountStr, setAmountStr] = React.useState("");
  const [qtyStr, setQtyStr] = React.useState("");
  const [lockedPrice, setLockedPrice] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const { isAuthed } = useAuth();
  React.useEffect(() => {
    if (!isAuthed) {
      toast.error("Please login to place an order.");
      return;
    }
    if (open && stock) {
      setIsBuy(true);
      setMode("amount");
      setAmountStr("");
      setQtyStr("");
      setLockedPrice(Number(stock.stockPrice));
    }
  }, [open, stock, isAuthed]);

  const price = lockedPrice ?? stock?.stockPrice ?? 0;

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

  const insufficientFunds = isBuy && amount > walletUSD;
  const disableCta =
    !stock ||
    !userId ||
    price <= 0 ||
    amount <= 0 ||
    qty <= 0 ||
    insufficientFunds ||
    submitting;

  const accent = isBuy
    ? "from-emerald-400/30 via-cyan-300/20 to-indigo-400/20"
    : "from-rose-400/30 via-fuchsia-300/20 to-indigo-400/20";
  const pill = isBuy
    ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
    : "text-rose-300 border-rose-400/30 bg-rose-400/10";

  const handleSubmit = async () => {
    if (!userId) toast.error("Please login to place an order.");
    console.log(disableCta);
    if (disableCta || !stock) return;

    const payload: TradeRequestBody = {
      userId,
      // Using the company name; switch to `stock.stocksymbol` if your API expects the ticker
      stockName: stock.stockName,
      quantity: Number(qty.toFixed(6)),
      rate: Number(price.toFixed(4)),
      type: (isBuy ? "buy" : "sell") as TradeType,
    };

    const tid = toast.loading(
      isBuy ? "Placing buy order…" : "Placing sell order…"
    );
    setSubmitting(true);
    try {
      await axios.post(`${serverApiUrl}/execute`, payload, {
        withCredentials: true,
      });
      toast.success("Order placed successfully.", { id: tid });
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        (axios.isAxiosError(err) &&
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : err instanceof Error && err.message) || "Failed to place order.";
      toast.error(msg, { id: tid });
    } finally {
      setSubmitting(false);
      accountfetch();
    }
  };
  console.log(disableCta);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-white/10 backdrop-blur-xl rounded-2xl p-0 text-white max-w-lg shadow-2xl">
        <div
          aria-hidden
          className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${accent} opacity-60`}
        />
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold tracking-tight">
              Place Order
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border ${pill}`}
            >
              {isBuy ? "BUY" : "SELL"}
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
                • Price locked at open:
                <span className="text-white/90 font-medium">
                  ${price.toFixed(2)}
                </span>
              </span>
            )}
            {isBuy && (
              <span className="block mt-1 text-xs text-white/50">
                Wallet: ${walletUSD.toFixed(2)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4 space-y-5">
          {/* Buy/Sell switch */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 p-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isBuy ? "bg-emerald-300" : "bg-rose-300"
                }`}
              />
              <p className="text-sm text-white/85">
                {isBuy ? "Buying" : "Selling"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">Sell</span>
              <Switch checked={isBuy} onCheckedChange={setIsBuy} />
              <span className="text-xs text-white/60">Buy</span>
            </div>
          </div>

          {/* Locked Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-white/85">
              Price (USD)
            </Label>
            <Input
              id="price"
              value={price ? price.toFixed(2) : ""}
              readOnly
              className="bg-white/10 border-white/15 text-white placeholder:text-white/30 cursor-not-allowed opacity-90"
            />
            <p className="text-[11px] text-white/50">
              Captured when you opened the dialog.
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
              Enter Total Amount (USD)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="amount" className="text-white/85">
                  Total Amount (USD)
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
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm text-white/70">
                  Est. Quantity:{" "}
                  <span className="font-medium text-white/90">
                    {qty > 0 ? qty.toFixed(4) : "0.0000"}
                  </span>
                </p>
                <p className="text-xs text-white/50">
                  Computed as amount ÷ price.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
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
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm text-white/70">
                  Est. Total:{" "}
                  <span className="font-medium text-white/90">
                    ${amount > 0 ? amount.toFixed(2) : "0.00"}
                  </span>
                </p>
                <p className="text-xs text-white/50">
                  Computed as quantity × price.
                </p>
              </div>
            </div>
          )}

          {/* Buy wallet check */}
          {isBuy && (
            <div
              className={`rounded-xl border p-3 ${
                insufficientFunds
                  ? "border-rose-400/40 bg-rose-400/10"
                  : "border-white/10 bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Wallet</span>
                <span className="text-white/90">${walletUSD.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-white/70">Order Total</span>
                <span
                  className={`${
                    insufficientFunds ? "text-rose-300" : "text-white/90"
                  }`}
                >
                  ${amount > 0 ? amount.toFixed(2) : "0.00"}
                </span>
              </div>
              {insufficientFunds && (
                <p className="mt-2 text-xs text-rose-200">
                  Insufficient funds. Reduce amount/quantity or add funds.
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
                : "bg-rose-500/90 hover:bg-rose-500"
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitting
              ? "Submitting…"
              : isBuy
              ? "Place Buy Order"
              : "Place Sell Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(BuySellDialog);
