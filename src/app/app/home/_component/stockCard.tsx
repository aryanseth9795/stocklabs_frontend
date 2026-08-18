"use client";
import React from "react";
import { fmtINRPrice } from "@/lib/format";

interface StockCardProps {
  stock: {
    stockName: string;
    stocksymbol: string;
    stockPrice: number;
    stockPriceINR: number;
    stockChange: number;
    stockChangeINR: number;
    stockChangePercentage: number;
    ts: string;
  };
  onClick?: () => void;
}

/**
 * Monospace with tabular figures, for every number on the card.
 *
 * The app's body face is Merriweather, whose proportional old-style figures
 * change width per digit — so on a board that reprices once a second, each tick
 * visibly reflowed the price and nothing lined up between cards. An explicit
 * stack rather than `font-mono`, because globals.css points --font-mono at a
 * --font-geist-mono that is never loaded.
 */
const NUM = "font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] tabular-nums";

const StockCard = ({ stock, onClick }: StockCardProps) => {
  // Direction comes from the percentage alone.
  //
  // It used to come from stockChangeINR while the badge printed the percentage,
  // and the two disagree for sub-rupee assets: SHIB's INR delta rounds to zero,
  // so `>= 0` was true and the card showed a green ▲ next to "-0.223%".
  const pct = stock.stockChangePercentage;
  const isUp = pct >= 0;

  // Flash the card when the price moves — the one piece of motion here, and it
  // encodes something true: this row just repriced. Direction of the flash is
  // the direction of THIS tick, which is not always the direction of the day.
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);
  const prevPrice = React.useRef(stock.stockPriceINR);

  React.useEffect(() => {
    const prev = prevPrice.current;
    if (prev !== stock.stockPriceINR) {
      setFlash(stock.stockPriceINR > prev ? "up" : "down");
      prevPrice.current = stock.stockPriceINR;
      const t = setTimeout(() => setFlash(null), 420);
      return () => clearTimeout(t);
    }
  }, [stock.stockPriceINR]);

  const accent = isUp ? "text-emerald-400" : "text-rose-400";

  return (
    /**
     * Type sizes are container-relative, not fixed.
     *
     * At two columns on a phone this card is ~126px of usable width, and a
     * flat 22px price rendered "₹61,20,400.65" about 45px wider than that —
     * BTC's price ran straight across the gutter and over the card beside it.
     * The monospace stack advances at ~0.6em per glyph, so a 13-glyph rupee
     * figure fits when the size stays under ~12.8% of the container; the clamp
     * is set just inside that, and grows back to the original 22px once the
     * card is wide enough to carry it. `overflow-hidden` is the hard stop, so
     * an unexpectedly long figure clips at this card's own edge instead of
     * being painted over its neighbour.
     */
    <button
      onClick={onClick}
      className={`group @container relative w-full min-w-0 overflow-hidden text-left rounded-xl border bg-white/[0.03] p-3 sm:p-4
        transition-[border-color,background-color,transform] duration-200
        hover:bg-white/[0.06] hover:-translate-y-0.5
        outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60
        motion-reduce:transition-none motion-reduce:hover:translate-y-0
        ${
          flash === "up"
            ? "border-emerald-400/50 bg-emerald-400/[0.07]"
            : flash === "down"
              ? "border-rose-400/50 bg-rose-400/[0.07]"
              : "border-white/10 hover:border-white/20"
        }`}
    >
      {/* Symbol is a label, not a headline — small, tracked, quiet. The
          lowercase duplicate that sat beneath it carried no information: the
          feed sets stockName to the symbol in lower case. */}
      <div className="flex items-baseline justify-between gap-1.5 mb-3">
        {/* Tracking is loosened only once there is room for it. At 0.14em on a
            phone an eight-letter ticker no longer fit beside its percentage,
            which is why the board read "DOGEUS…" and "AVAXUS…". */}
        <span className="truncate text-[clamp(9px,7cqi,11px)] font-semibold uppercase tracking-[0.06em] @[150px]:tracking-[0.14em] text-white/55">
          {stock.stocksymbol}
        </span>
        {/* Percentage appears here and nowhere else. It used to print twice. */}
        <span
          className={`${NUM} shrink-0 text-[clamp(9px,7cqi,11px)] font-medium ${accent}`}
          aria-label={`${isUp ? "up" : "down"} ${Math.abs(pct)} percent`}
        >
          {isUp ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
        </span>
      </div>

      {/* INR, matching the server ledger and the mobile app (review F-01). */}
      <div
        className={`${NUM} text-[clamp(0.875rem,12.5cqi,1.375rem)] font-semibold leading-none text-white`}
      >
        {fmtINRPrice(stock.stockPriceINR)}
      </div>

      <div className={`${NUM} mt-1.5 text-[clamp(10px,7cqi,12px)] ${accent}`}>
        {isUp ? "+" : "−"}
        {fmtINRPrice(Math.abs(stock.stockChangeINR))}
      </div>
    </button>
  );
};

export default StockCard;
