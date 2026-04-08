import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone: "positive" | "warning" | "critical" | "neutral";
  footer?: string;
};

const config: Record<
  MetricCardProps["tone"],
  {
    bg: string;
    border: string;
    value: string;
    label: string;
    detail: string;
    footer: string;
    dot: string;
    glow: string;
  }
> = {
  positive: {
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    border: "border-emerald-400/20",
    value: "text-white",
    label: "text-emerald-100",
    detail: "text-emerald-200/80",
    footer: "border-white/20 text-emerald-200/70",
    dot: "bg-white/60",
    glow: "shadow-[0_20px_60px_-15px_rgba(16,185,129,0.55)]",
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    border: "border-amber-300/20",
    value: "text-white",
    label: "text-amber-100",
    detail: "text-amber-100/75",
    footer: "border-white/20 text-amber-100/65",
    dot: "bg-white/60",
    glow: "shadow-[0_20px_60px_-15px_rgba(245,158,11,0.55)]",
  },
  critical: {
    bg: "bg-gradient-to-br from-rose-500 to-red-600",
    border: "border-rose-400/20",
    value: "text-white",
    label: "text-rose-100",
    detail: "text-rose-200/80",
    footer: "border-white/20 text-rose-200/70",
    dot: "bg-white/60",
    glow: "shadow-[0_20px_60px_-15px_rgba(244,63,94,0.55)]",
  },
  neutral: {
    bg: "bg-gradient-to-br from-slate-700 to-slate-900",
    border: "border-slate-600/20",
    value: "text-white",
    label: "text-slate-300",
    detail: "text-slate-400",
    footer: "border-white/10 text-slate-500",
    dot: "bg-slate-400",
    glow: "shadow-[0_20px_60px_-15px_rgba(15,23,42,0.45)]",
  },
};

export function MetricCard({ label, value, detail, tone, footer }: MetricCardProps) {
  const c = config[tone];
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-1",
        c.bg,
        c.border,
        c.glow,
      )}
    >
      {/* Decorative circle */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-4 -right-2 h-16 w-16 rounded-full bg-white/5" />

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", c.dot)} />
          <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", c.label)}>
            {label}
          </p>
        </div>
        <p className={cn("mt-3 font-serif text-4xl font-semibold tracking-tight", c.value)}>
          {value}
        </p>
        <p className={cn("mt-2 flex-1 text-xs leading-5", c.detail)}>{detail}</p>
        {footer ? (
          <p className={cn("mt-3 border-t pt-3 text-xs", c.footer)}>{footer}</p>
        ) : null}
      </div>
    </div>
  );
}
