// app/(wherever)/_component/TradeCard.tsx
import { BadgeCheck, TrendingUp, TrendingDown, Clock, Hash, Info } from "lucide-react";

type Order = {
  id: string;
  userId: string;
  transactionId: string;
  stockSymbol: string;
  stockName: string;
  stockPrice: number;
  stockQuantity: number;
  stockTotal: number;
  status: "completed" | "pending" | "failed" | string;
  type: "buy" | "sell" | string;
  description?: string | null;
  createdAt: string | Date;
};

export default function TradeCard({ trade }: { trade: Order }) {
  const isBuy = String(trade?.type).toLowerCase() === "buy";

  return (
    <div className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{trade.stockSymbol}</span>
          <span className="text-sm text-muted-foreground truncate max-w-[160px]">
            {trade.stockName}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isBuy
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {trade.type}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {isBuy ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          {String(trade.status).toLowerCase() === "completed" && <BadgeCheck size={18} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoRow label="Price" value={num(trade.stockPrice)} />
        <InfoRow label="Quantity" value={num(trade.stockQuantity)} />
        <InfoRow label="Total" value={num(trade.stockTotal)} />
        <StatusPill status={trade.status} />
      </div>

      {trade?.description ? (
        <div className="mt-3 text-xs text-muted-foreground flex items-start gap-2">
          <Info size={16} />
          <span className="line-clamp-2">{trade.description}</span>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{dateFmt(trade.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Hash size={16} />
          <span className="truncate max-w-[160px]">{trade.transactionId}</span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3 bg-white/60 dark:bg-neutral-900/60">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = String(status).toLowerCase();
  const cls =
    s === "completed"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      : s === "pending"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      : "bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300";
  return (
    <div className="rounded-xl border p-3 bg-white/60 dark:bg-neutral-900/60">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</div>
      <div className={`mt-0.5 text-xs inline-block px-2 py-1 rounded-full ${cls}`}>{status}</div>
    </div>
  );
}

function num(n: number) {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n);
}

function dateFmt(d: string | Date) {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleString();
}

