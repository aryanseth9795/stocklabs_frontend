// app/(wherever)/_component/TxCard.tsx
import { ArrowDownCircle, ArrowUpCircle, Clock, Hash } from "lucide-react";

type Transaction = {
  id: string;
  userId: string;
  openingBalance: number;
  closingBalance: number;
  usedBalance: number;
  type: "deposit" | "withdrawal" | string;
  status: "completed" | "pending" | "failed" | string;
  createdAt: string | Date;
  order?: {
    id: string;
    transactionId: string;
    stockSymbol: string;
    stockName: string;
    stockPrice: number;
    stockQuantity: number;
    stockTotal: number;
    status: string;
    type: string;
    createdAt: string | Date;
  } | null;
};

export default function TxCard({ tx }: { tx: Transaction }) {
  const isDeposit = String(tx.type).toLowerCase() === "deposit";

  return (
    <div className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isDeposit ? (
            <ArrowDownCircle className="text-green-600 dark:text-green-400" size={20} />
          ) : (
            <ArrowUpCircle className="text-red-600 dark:text-red-400" size={20} />
          )}
          <span className="text-lg font-semibold capitalize">{tx.type}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusCls(tx.status)}`}>
          {tx.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <InfoRow label="Opening" value={num(tx.openingBalance)} />
        <InfoRow label="Used" value={num(tx.usedBalance)} />
        <InfoRow label="Closing" value={num(tx.closingBalance)} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{dateFmt(tx.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Hash size={16} />
          <span className="truncate max-w-[160px]">{tx.id}</span>
        </div>
      </div>

      {tx.order ? (
        <div className="mt-4 rounded-xl border p-3 bg-white/60 dark:bg-neutral-900/60">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Linked Order
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusCls(tx.order.status)}`}>
              {tx.order.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{tx.order.stockSymbol}</span>
              <span className="text-muted-foreground text-xs truncate max-w-[180px]">
                {tx.order.stockName}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs">
                {tx.order.type.toLowerCase() === "buy" ? "Buy" : "Sell"}
              </div>
              <div className="font-medium">
                {num(tx.order.stockQuantity)} × {num(tx.order.stockPrice)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total: {num(tx.order.stockTotal)}
              </div>
            </div>
          </div>
        </div>
      ) : null}
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

function statusCls(status: string) {
  const s = String(status).toLowerCase();
  if (s === "completed")
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (s === "pending")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300";
}

function num(n: number) {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n);
}

function dateFmt(d: string | Date) {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleString();
}

