"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TooltipValue = string | number | readonly (string | number)[] | undefined;
type ValueFormat = "number" | "percent" | "score";

type LineTrendChartProps = {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  stroke: string;
  format?: ValueFormat;
};

function formatValue(value: number, format: ValueFormat) {
  switch (format) {
    case "percent":
      return `${(value * 100).toFixed(1)}%`;
    case "score":
      return `${value.toFixed(0)}/100`;
    default:
      return value.toString();
  }
}

export function LineTrendChart({
  data,
  xKey,
  yKey,
  stroke,
  format = "number",
}: LineTrendChartProps) {
  const gradientId = useId().replace(/:/g, "");

  const formatTooltipValue = (value: TooltipValue) => {
    const candidate = Array.isArray(value) ? value[0] : value;
    const numericValue = typeof candidate === "number" ? candidate : Number(candidate ?? 0);
    return formatValue(numericValue, format);
  };

  return (
    <div className="h-72 min-w-0 overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(91,143,152,0.12),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,250,0.92))] px-2 py-4">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
        <AreaChart data={data} margin={{ top: 12, right: 16, left: 6, bottom: 12 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.26} />
              <stop offset="65%" stopColor={stroke} stopOpacity={0.08} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(189,204,214,0.8)" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="#6b7b8c"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={10}
          />
          <YAxis
            width={54}
            stroke="#6b7b8c"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value: number) => formatValue(value, format)}
          />
          <Tooltip
            formatter={(value) => formatTooltipValue(value)}
            contentStyle={{
              borderRadius: 18,
              border: "1px solid rgba(205,219,228,0.88)",
              backgroundColor: "rgba(255,255,255,0.98)",
              boxShadow: "0 24px 48px -32px rgba(35,58,79,0.3)",
            }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="none"
            fill={`url(#${gradientId})`}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={stroke}
            strokeWidth={3.25}
            dot={{ r: 4.5, strokeWidth: 0, fill: stroke }}
            activeDot={{ r: 5.5, fill: stroke }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
