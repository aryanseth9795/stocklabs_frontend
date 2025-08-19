"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoldingsRow, type Holding } from "./HoldingsRow";

export function HoldingsTable({
  holdings,
  sortBy,
  sortDir,
  onSortChange,
  onRowBuy,
  onRowSell,
  onRowDetails,
}: {
  holdings: Holding[];
  sortBy: keyof Holding | "weightPct";
  sortDir: "asc" | "desc";
  onSortChange: (col: string) => void;
  onRowBuy: (h: Holding) => void;
  onRowSell: (h: Holding) => void;
  onRowDetails: (h: Holding) => void;
}) {
  const headerCell = (label: string, key: string, alignRight = false) => (
    <TableHead
      role="button"
      onClick={() => onSortChange(key)}
      className={`sticky top-0 z-10 border-b border-neutral-800 bg-neutral-900/80 text-neutral-300 ${
        alignRight ? "text-right" : "text-left"
      }`}
    >
      <span className="select-none">{label}</span>
    </TableHead>
  );

  return (
    <Card className="border-neutral-800 bg-neutral-900/40 shadow-[0_0_0_1px_rgba(255,255,255,.04)]">
      <ScrollArea className="h-[560px] rounded-md">
        <Table className="min-w-[960px] text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {headerCell("Symbol", "symbol")}
              {headerCell("Name", "name")}
              {headerCell("Qty", "qty", true)}
              {headerCell("Avg Cost", "avgCost", true)}
              {headerCell("LTP", "ltp", true)}
              {headerCell("Day Chg", "dayChgPct", true)}
              {headerCell("P&L", "pnlAbs", true)}
              {headerCell("P&L %", "pnlPct", true)}
              {headerCell("Mkt Value", "marketValue", true)}
              {headerCell("Weight", "weightPct", true)}
              {headerCell("Trend", "sparkline")}
              {headerCell("Actions", "actions")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((h) => (
              <HoldingsRow
                key={h.id}
                holding={h}
                onBuy={onRowBuy}
                onSell={onRowSell}
                onDetails={onRowDetails}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
export default HoldingsTable;