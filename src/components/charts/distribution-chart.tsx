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
  positive: "#2aa889",
  warning: "#d49b35",
  critical: "#d85d68",
};

type TooltipValue = string | number | readonly (string | number)[] | undefined;

export function DistributionChart({ data }: DistributionChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const formatTooltipValue = (value: TooltipValue) => {
    const candidate = Array.isArray(value) ? value[0] : value;
    const numericValue = typeof candidate === "number" ? candidate : Number(candidate ?? 0);
    return `${numericValue}%`;
  };

  return (
    <div className="relative h-72 min-w-0 overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(91,143,152,0.12),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,250,0.92))] p-2">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={64}
            outerRadius={104}
            paddingAngle={4}
            cornerRadius={10}
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={COLORS[entry.tone]} stroke="#ffffff" strokeWidth={4} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatTooltipValue(value)}
            contentStyle={{
              borderRadius: 18,
              border: "1px solid rgba(205,219,228,0.88)",
              backgroundColor: "rgba(255,255,255,0.98)",
              boxShadow: "0 24px 48px -32px rgba(35,58,79,0.3)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Distribucion
        </span>
        <span className="mt-1 font-serif text-4xl font-semibold text-slate-950">
          {total}%
        </span>
      </div>
    </div>
  );
}
