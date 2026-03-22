import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone: "positive" | "warning" | "critical" | "neutral";
  footer?: string;
};

const config: Record<MetricCardProps["tone"], { bg: string; border: string; accent: string; value: string; label: string; dot: string }> = {
  positive: {
    bg: "bg-white",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
    value: "text-emerald-700",
    label: "text-emerald-600",
    dot: "bg-emerald-400",
  },
  warning: {
    bg: "bg-white",
    border: "border-amber-200",
    accent: "bg-amber-400",
    value: "text-amber-700",
    label: "text-amber-600",
    dot: "bg-amber-400",
  },
  critical: {
    bg: "bg-white",
    border: "border-rose-200",
    accent: "bg-rose-500",
    value: "text-rose-700",
    label: "text-rose-600",
    dot: "bg-rose-400",
  },
  neutral: {
    bg: "bg-white",
    border: "border-slate-200",
    accent: "bg-slate-400",
    value: "text-slate-800",
    label: "text-slate-500",
    dot: "bg-slate-400",
  },
};

export function MetricCard({ label, value, detail, tone, footer }: MetricCardProps) {
  const c = config[tone];
  return (
    <div className={cn("relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md", c.bg, c.border)}>
      <div className={cn("h-1 w-full", c.accent)} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", c.dot)} />
          <p className={cn("text-xs font-semibold uppercase tracking-[0.15em]", c.label)}>{label}</p>
        </div>
        <p className={cn("mt-3 font-serif text-4xl font-semibold tracking-tight", c.value)}>
          {value}
        </p>
        <p className="mt-2 flex-1 text-xs leading-5 text-slate-500">{detail}</p>
        {footer ? (
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">{footer}</p>
        ) : null}
      </div>
    </div>
  );
}
