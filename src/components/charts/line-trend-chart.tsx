"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TooltipValue = string | number | readonly (string | number)[] | undefined;

type LineTrendChartProps = {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  stroke: string;
  formatter?: (value: number) => string;
};

export function LineTrendChart({
  data,
  xKey,
  yKey,
  stroke,
  formatter,
}: LineTrendChartProps) {
  const gradientId = `gradient-${yKey}`;

  const formatValue = (value: TooltipValue) => {
    const candidate = Array.isArray(value) ? value[0] : value;
    const numericValue = typeof candidate === "number" ? candidate : Number(candidate ?? 0);
    return formatter ? formatter(numericValue) : numericValue.toString();
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.15} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey={xKey}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value: number) =>
              formatter ? formatter(value) : String(value)
            }
          />
          <Tooltip
            formatter={(value) => formatValue(value)}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              backgroundColor: "rgba(255,255,255,0.96)",
            }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={stroke}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            dot={{ r: 4, strokeWidth: 0, fill: stroke }}
            activeDot={{ r: 5, fill: stroke }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
