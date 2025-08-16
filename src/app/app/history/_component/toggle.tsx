
import React from "react";
import { Switch } from "@/components/ui/switch";
import { ChartCandlestick, ReceiptText } from "lucide-react";

type Props = { isTrade: boolean; setIsTrade: React.Dispatch<React.SetStateAction<boolean>> };

const Toggle: React.FC<Props> = ({ isTrade, setIsTrade }) => {
  return (
    <div className="relative mx-auto w-full max-w-xl rounded-2xl border border-white/5 bg-gradient-to-br from-black/90 via-zinc-950/80 to-neutral-900/90 p-4 shadow-[0_12px_35px_-12px_rgba(0,0,0,0.85)] backdrop-blur">
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          className={`flex items-center gap-2 px-2 transition-colors ${isTrade ? "text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.35)]" : "text-zinc-400"}`}
          onClick={() => setIsTrade(true)}
        >
          <ChartCandlestick className="h-5 w-5" />
          <span className="text-lg md:text-2xl font-semibold">Trade</span>
        </button>

        {/* Keep default h/w; scale instead so the thumb translate still works */}
        <Switch
          checked={isTrade}
          onCheckedChange={setIsTrade}
          aria-label="Toggle Trade/Transaction"
          className="origin-center scale-125 rounded-full ring-1 ring-white/10 data-[state=checked]:bg-emerald-500/80 data-[state=unchecked]:bg-zinc-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] transition-all"
        />

        <button
          type="button"
          className={`flex items-center gap-2 px-2 transition-colors ${!isTrade ? "text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]" : "text-zinc-400"}`}
          onClick={() => setIsTrade(false)}
        >
          <ReceiptText className="h-5 w-5" />
          <span className="text-lg md:text-2xl font-semibold">Transaction</span>
        </button>
      </div>
    </div>
  );
};

export default Toggle;
