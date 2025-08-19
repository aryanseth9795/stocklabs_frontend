"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type PerfPoint = { t: string; v: number };

export function PerformanceChart({
  title,
  range,
  onRangeChange,
  series,
}: {
  title: string;
  range: "30D" | "6M" | "1Y";
  onRangeChange: (r: "30D" | "6M" | "1Y") => void;
  series: PerfPoint[];
}) {
  return (
    <Card className="h-full border-neutral-800 bg-neutral-900/80 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,.04)]">
      <CardHeader className="flex items-center justify-between gap-2 pb-2 sm:flex-row">
        <CardTitle className="text-sm text-neutral-400">{title}</CardTitle>
        <Tabs
          value={range}
          onValueChange={(v) => onRangeChange(v as any)}
          className="ml-auto"
        >
          <TabsList className="bg-neutral-800">
            <TabsTrigger value="30D">30D</TabsTrigger>
            <TabsTrigger value="6M">6M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#262626" />
            <XAxis
              dataKey="t"
              stroke="#525252"
              tick={{ fill: "#a3a3a3", fontSize: 12 }}
              hide={false}
            />
            <YAxis
              stroke="#525252"
              tick={{ fill: "#a3a3a3", fontSize: 12 }}
              domain={["auto", "auto"]}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #262626",
                borderRadius: 8,
                color: "#e5e5e5",
              }}
            />
            <Line type="monotone" dataKey="v" dot={false} stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
export default PerformanceChart;