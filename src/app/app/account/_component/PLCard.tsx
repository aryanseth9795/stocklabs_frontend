"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PLPoint } from "./types";
import { formatINR } from "./utils";

export function PLCard({ data }: { data: PLPoint[] }) {
  const [from, setFrom] = React.useState<string>(
    () => data[0]?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [to, setTo] = React.useState<string>(
    () => data.at(-1)?.date ?? new Date().toISOString().slice(0, 10)
  );

  const filtered = React.useMemo(() => {
    const f = new Date(from);
    const t = new Date(to);
    return data.filter((d) => {
      const x = new Date(d.date);
      return x >= f && x <= t;
    });
  }, [data, from, to]);

  const net = React.useMemo(
    () => filtered.reduce((s, p) => s + p.value, 0),
    [filtered]
  );
  const best = React.useMemo(
    () => (filtered.length ? Math.max(...filtered.map((p) => p.value)) : 0),
    [filtered]
  );
  const worst = React.useMemo(
    () => (filtered.length ? Math.min(...filtered.map((p) => p.value)) : 0),
    [filtered]
  );

  const positive = net >= 0;

  const quick = (days: number | "YTD" | "ALL") => {
    if (days === "ALL") {
      setFrom(data[0]?.date ?? from);
      setTo(data.at(-1)?.date ?? to);
      return;
    }
    if (days === "YTD") {
      const now = new Date();
      const y0 = new Date(now.getFullYear(), 0, 1);
      setFrom(y0.toISOString().slice(0, 10));
      setTo(data.at(-1)?.date ?? now.toISOString().slice(0, 10));
      return;
    }
    const now = new Date();
    const d0 = new Date(now);
    d0.setDate(now.getDate() - (days - 1));
    setFrom(d0.toISOString().slice(0, 10));
    setTo(now.toISOString().slice(0, 10));
  };

  return (
    <Card className="bg-neutral-900/60 backdrop-blur border-white/10">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">P/L Overview</CardTitle>
          <CardDescription className="text-zinc-400">
            Filter by date range to see your performance.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-3 py-2">
            <Calendar className="size-4 text-zinc-600" />
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label htmlFor="from" className="text-xs text-zinc-400">
                  From
                </Label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-9 bg-neutral-900 border-white/10 text-white"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="to" className="text-xs text-white">
                  To
                </Label>
                <Input
                  id="to"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-9 bg-neutral-900 border-white/10 text-white"
                />
              </div>
            </div>
            <Button size="sm" className="ml-2 text-black">
              Apply
            </Button>
          </div>
          <div className="flex gap-1 text-white ">
            <Button variant="ghost" size="sm" onClick={() => quick(7)}>
              7D
            </Button>
            <Button variant="ghost" size="sm" onClick={() => quick(30)}>
              1M
            </Button>
            <Button variant="ghost" size="sm" onClick={() => quick(90)}>
              3M
            </Button>
            <Button variant="ghost" size="sm" onClick={() => quick("YTD")}>
              YTD
            </Button>
            <Button variant="ghost" size="sm" onClick={() => quick("ALL")}>
              ALL
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
            <div className="text-xs text-zinc-400">Net P/L</div>
            <div
              className={`mt-1 flex items-center gap-2 text-xl font-semibold ${
                positive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {positive ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
              <span>{formatINR(net)}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
            <div className="text-xs text-zinc-400">Best Day</div>
            <div className="mt-1 text-xl font-semibold text-emerald-400">
              {formatINR(best)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
            <div className="text-xs text-zinc-400">Worst Day</div>
            <div className="mt-1 text-xl font-semibold text-rose-400">
              {formatINR(worst)}
            </div>
          </div>
        </div>

        <div className="h-56 w-full rounded-2xl border border-white/10 bg-neutral-950 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filtered}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="plFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={net >= 0 ? "#34d399" : "#fb7185"}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={net >= 0 ? "#34d399" : "#fb7185"}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                hide={filtered.length > 40}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(v: unknown) => [formatINR(Number(v)), "Net P/L"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={net >= 0 ? "#34d399" : "#fb7185"}
                strokeWidth={2}
                fill="url(#plFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
