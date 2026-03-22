"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type DistributionDatum = {
  label: string;
  value: number;
  tone: "positive" | "warning" | "critical";
};

type DistributionChartProps = {
  data: DistributionDatum[];
};

const COLORS: Record<DistributionDatum["tone"], string> = {
  positive: "#22c55e",
  warning: "#eab308",
  critical: "#ef4444",
};

type TooltipValue = string | number | readonly (string | number)[] | undefined;

export function DistributionChart({ data }: DistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const formatTooltipValue = (value: TooltipValue) => {
    const candidate = Array.isArray(value) ? value[0] : value;
    const numericValue = typeof candidate === "number" ? candidate : Number(candidate ?? 0);
    return `${numericValue}%`;
  };

  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={58}
            outerRadius={96}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={COLORS[entry.tone]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatTooltipValue(value)}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              backgroundColor: "rgba(255,255,255,0.96)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl font-semibold text-slate-950">{total}%</span>
        <span className="mt-1 text-xs font-medium text-slate-500">Scored</span>
      </div>
    </div>
  );
}
