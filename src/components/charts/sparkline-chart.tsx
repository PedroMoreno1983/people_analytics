"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

type TooltipValue = string | number | readonly (string | number)[] | undefined;

type SparklineChartProps = {
  data: Array<Record<string, string | number>>;
  yKey: string;
  stroke: string;
  format?: "percentage" | "score" | "raw";
};

export function SparklineChart({
  data,
  yKey,
  stroke,
  format = "raw",
}: SparklineChartProps) {
  const gradientId = `sparkline-gradient-${yKey}`;

  const fmt = (value: number): string => {
    if (format === "percentage") return `${(value * 100).toFixed(1)}%`;
    if (format === "score") return `${value.toFixed(0)}/100`;
    return String(value);
  };

  const formatValue = (value: TooltipValue) => {
    const candidate = Array.isArray(value) ? value[0] : value;
    const numericValue = typeof candidate === "number" ? candidate : Number(candidate ?? 0);
    return fmt(numericValue);
  };

  return (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.18} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            formatter={(value) => formatValue(value)}
            labelStyle={{ display: "none" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              backgroundColor: "rgba(255,255,255,0.96)",
            }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
