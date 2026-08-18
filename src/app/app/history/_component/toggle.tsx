import React from "react";
import { Switch } from "@/components/ui/switch";
import { ChartCandlestick, ReceiptText } from "lucide-react";

type Props = { isTrade: boolean; setIsTrade: React.Dispatch<React.SetStateAction<boolean>> };

/**
 * "Trade" + switch + "Transaction" measured ~339px at the old sizes — wider
 * than the whole control on a 360px phone, so the two labels ran into the
 * switch and out of the panel. Type, gaps and padding all start a step down
 * and return to the original scale from `sm` up.
 */
const Toggle: React.FC<Props> = ({ isTrade, setIsTrade }) => {
  return (
    <div className="relative mx-auto w-full max-w-xl rounded-2xl border border-white/5 bg-gradient-to-br from-black/90 via-zinc-950/80 to-neutral-900/90 p-3 sm:p-4 shadow-[0_12px_35px_-12px_rgba(0,0,0,0.85)] backdrop-blur">
      <div className="flex items-center justify-center gap-3 sm:gap-6">
        <button
          type="button"
          className={`flex min-w-0 items-center gap-1.5 px-0 sm:gap-2 sm:px-2 transition-colors ${isTrade ? "text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.35)]" : "text-zinc-400"}`}
          onClick={() => setIsTrade(true)}
        >
          <ChartCandlestick className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <span className="truncate text-base sm:text-lg md:text-2xl font-semibold">
            Trade
          </span>
        </button>

        {/* Keep default h/w; scale instead so the thumb translate still works */}
        <Switch
          checked={isTrade}
          onCheckedChange={setIsTrade}
          aria-label="Toggle Trade/Transaction"
          className="shrink-0 origin-center scale-110 sm:scale-125 rounded-full ring-1 ring-white/10 data-[state=checked]:bg-emerald-500/80 data-[state=unchecked]:bg-zinc-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] transition-all"
        />

        <button
          type="button"
          className={`flex min-w-0 items-center gap-1.5 px-0 sm:gap-2 sm:px-2 transition-colors ${!isTrade ? "text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]" : "text-zinc-400"}`}
          onClick={() => setIsTrade(false)}
        >
          <ReceiptText className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <span className="truncate text-base sm:text-lg md:text-2xl font-semibold">
            Transaction
          </span>
        </button>
      </div>
    </div>
  );
};

export default Toggle;
