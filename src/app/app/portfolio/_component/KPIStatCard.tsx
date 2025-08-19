"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export type KPI = {
  label: string;
  value: string;
  delta?: { sign: "up" | "down" | "flat"; text: string };
};

function deltaIcon(sign?: "up" | "down" | "flat") {
  if (sign === "up") return <TrendingUp className="h-4 w-4" />;
  if (sign === "down") return <TrendingDown className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
}

export function KPIStatCard({ label, value, delta }: KPI) {
  const deltaColor =
    delta?.sign === "up"
      ? "text-emerald-400"
      : delta?.sign === "down"
      ? "text-rose-400"
      : "text-neutral-400";
  return (
    <Card className="border-neutral-800 bg-neutral-900/80 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,.04)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-neutral-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold">{value}</span>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-sm ${deltaColor}`}
            aria-live="polite"
          >
            {deltaIcon(delta.sign)} {delta.text}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default KPIStatCard;