"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export type AllocationBucket = { label: string; value: number; color?: string };

export function AllocationDonut({
  title,
  data,
}: {
  title: string;
  data: AllocationBucket[];
}) {
  const fallbackColors = [
    "#10b981",
    "#f43f5e",
    "#22d3ee",
    "#f59e0b",
    "#8b5cf6",
    "#14b8a6",
    "#a3e635",
  ];
  return (
    <Card className="h-full border-neutral-800 bg-neutral-900/80 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,.04)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-neutral-400">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={1}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.color ?? fallbackColors[i % fallbackColors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #262626",
                borderRadius: 8,
                color: "#e5e5e5",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-400 md:grid-cols-3">
          {data.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ background: b.color }}
              />
              <span className="truncate">{b.label}</span>
              <span className="ml-auto tabular-nums text-neutral-300">
                {b.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
export default AllocationDonut;